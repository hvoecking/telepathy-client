import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Headers } from '@angular/http';
import { RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import * as assert from 'assert';
import * as uuid from 'uuid';
import * as SimplePeer from 'simple-peer';
import * as _ from 'lodash';

import { Link } from './link';

declare var openpgp: any;

const CONNECTION = 'http://localhost:3000/connection/';

const headers = new Headers({
  'Content-Type': 'application/json',
});
const requestOptions = new RequestOptions({
  headers: headers,
});

type Observer = (msg?: any) => void;

class Observable {
    observers: { [type: string]: Observer[] };

    constructor() {
        this.observers = {};
    } // constructor

    /**
     * Add an observer to a type of message
     *
     * @param   {string}   type       Type of messages the observer subscribes to
     * @param   {Observer} observer   Observer
     * @returns {Observer}            Observer
     */
    addObserver(type: string, observer: Observer): Observer {
        if (!(type in this.observers)) {
            this.observers[type] = [];
        }
        this.observers[type].push(observer);
        return observer;
    } // addObserver

    /**
     * Remove an observer from a type of message
     *
     * @param   {string}   type       Type of messages the observer subscribes to
     * @param   {Observer} observer   Observer
     * @returns {void}
     */
    removeObserver(type: string, observer: Observer): void {
        if (this.observers[type]) {
            for (let i = 0; i < this.observers[type].length; i++) {
                if (observer === this.observers[type][i]) {
                    this.observers[type].splice(i, 1);
                    return;
                }
            } // for i
        }
    } // removeObserver

    /**
     * Remove all observers from a type of message
     *
     * @param   {string}   type       Type of messages the observers subscribe to
     * @returns {void}
     */
    removeObserversType(type: string): void {
        delete this.observers[type];
    } // removeObserversType

    /**
     * Send a message to observers
     *
     * @param   {string} type    Type of message to be sent to observers
     * @param   {*}      [msg]   Content of the message
     * @returns {void}
     */
    notifyObservers(type: string, msg?: any): void {
        if (type in this.observers) {
            for (let obs of this.observers[type]) {
                obs(msg);
            } // for obs
        }
    } // notifyObservers
} // Observable


class Peer {

  public readonly privKey: Promise<string>;
  public readonly privKeyObj: Promise<any>;
  public readonly pubKey: Promise<string>;

  constructor(
    public readonly isInitiator: boolean,
    pubKey?: string,
  ) {
    if (pubKey) {
      this.pubKey = Promise.resolve(pubKey);
    } else {
      var openpgpOptions = {
        userIds: [{name: 'name'}],
        numBits: 2048,
        passphrase: 'passphrase',
      };

      const key = openpgp.generateKey(openpgpOptions);
      this.pubKey = key.then(k => k.publicKeyArmored);
      this.privKey = key.then(k => k.privateKeyArmored);
      this.privKeyObj = this.privKey.then(k => {
        const kObj = openpgp.key.readArmored(k).keys[0];
        kObj.decrypt(openpgpOptions.passphrase);
        return kObj;
      });
    }
  }

}

@Injectable()
export class Connection {

  private local: Peer;
  private remote: Peer;
  private connection: any;
  private observable: any;
  public status: string;
  private connId: string;

  constructor(
    private http: Http,
    private link: Link,
  ) {
    this.observable = new Observable();
    this.link.on('connId', (connId) => this.connId = connId);
  }

  setStatus(message: string) {
    this.status = message;
    console.log('STATUS:', message)
    this.observable.notifyObservers('status', message);
  }

  on(subject: string, fn) {
    this.observable.addObserver(subject, fn);
  }

  connect() {
    console.log('local.isInitiator:', this.local.isInitiator)
    this.connection = new SimplePeer({
      initiator: this.local.isInitiator,
      trickle: false,
    });

    this.connection.on('error', (err) => {
      console.log('error', err);
    });

    this.connection.on('signal', (data) => {
      console.log('SIGNAL', data);

      this.setStatus('Signal sent -> waiting for reply...');
      this.reportProgress();
      this.http.post(CONNECTION + this.connId, {data}, requestOptions)
        .toPromise()
        .then(() => {
          this.setStatus('Reply received -> waiting for connect...');
          this.reportProgress();
          this.observable.notifyObservers('put');
        });
    });

    this.connection.on('connect', () => {
      console.log('CONNECT');
      this.setStatus('Telepathic link established -> exchanging keys...');
      this.reportProgress();
      this.local.pubKey.then(pubKey => {
        const data = JSON.stringify({
          pubKey: pubKey,
        });
        this.connection.send(data);
      });
    });

    this.connection.on('data', (data) => {
      const obj = JSON.parse(data);
      if (!this.remote) {
        assert(obj.pubKey, 'Missing pubKey in ' + data);
        this.setStatus('Key received -> starting ping...');
        this.reportProgress();
        if (this.local.isInitiator) {
          this.remote = new Peer(
            false,
            obj.pubKey,
          );
        } else {
          this.remote = new Peer(
            false,
            obj.pubKey,
          );
        }
        this.observable.notifyObservers('connect');
        this.sendPing();
        return;
      }
      if (obj.ping) {
        this.connection.send(JSON.stringify({
          pong: obj.ping,
        }));
        return;
      }
      if (obj.pong) {
        this.observable.notifyObservers('ping', Date.now() - obj.pong);
        this.sendPing();
        return;
      }
      if (obj.message) {
        this.readEncryptedMessage(obj.message);
      }
      console.log('data: ' + data);
    });
    this.connection.on('close', () => {
      this.setStatus('Connection closed');
      this.connection = undefined;
      this.observable.notifyObservers('close');
    });
  }

  async readEncryptedMessage(message) {
    const openpgpOptions = {
      message: openpgp.message.readArmored(message),
      publicKeys: openpgp.key.readArmored(await this.remote.pubKey).keys,
      privateKey: await this.local.privKeyObj,
    };

    openpgp.decrypt(openpgpOptions)
      .then((plaintext) => {
        const obj = JSON.parse(plaintext.data);
        Object.keys(obj).forEach((key) =>
          this.observable.notifyObservers(key, obj[key])
        );
      });
  }

  sendPing() {
    setTimeout(() => {
      this.connection.send(JSON.stringify({
        ping: Date.now(),
      }));
    }, 1000);
  }

  doConnect() {
    assert(!_.isUndefined(this.link.isInitiator));
    this.local = new Peer(this.link.isInitiator);
    if (this.local.isInitiator) {
      this.connectToReceiver();
    } else {
      this.connectToInitiator();
    }
  }

  async connectToInitiator() {
    this.setStatus('Initialized -> searching for initator...');
    this.reportProgress();
    const peerData = await this.http.get(CONNECTION + this.connId + '/initiator')
      .map(res => res.json().data)
      .toPromise();
    this.setStatus('Initiator found -> initiating connection...');
    this.reportProgress();
    await this.connect();
    this.setStatus('Connecting initiated -> waiting for connect...');
    this.reportProgress();
    this.setStatus('Connected -> sending signal...');
    this.reportProgress();
    console.log('peerData:', peerData);
    this.connection.signal(peerData);
    this.setStatus('Signal sent...');
    this.reportProgress();
  }

  private progress: number = 0;
  private reportProgress() {
    const TOTAL_PROGRESS = 9;
    this.observable.notifyObservers('progress', this.progress / TOTAL_PROGRESS);
  }
  async connectToReceiver() {
    this.setStatus('Initialized -> initiating connection...');
    this.reportProgress();
    await this.connect();
    this.setStatus('Connecting initiated -> searching for receiver...');
    this.reportProgress();
    const peerData = await this.http.get(CONNECTION + this.connId + '/receiver')
      .map(res => res.json().data)
      .toPromise();
    this.setStatus('Receiver found -> connecting...');
    this.reportProgress();
    this.setStatus('Connected -> sending signal...');
    this.reportProgress();
    console.log('peerData:', peerData);
    this.connection.signal(peerData);
    this.setStatus('Signal sent...');
    this.reportProgress();
  }

  async sendMessage(message) {
    assert(this.remote, 'Connection not yet initialized');

    const openpgpOptions = {
      data: JSON.stringify(message),
      publicKeys: openpgp.key.readArmored(await this.remote.pubKey).keys,
      privateKeys: await this.local.privKeyObj,
    };

    openpgp.encrypt(openpgpOptions).then((ciphertext) => {
      this.connection.send(JSON.stringify({
        message: ciphertext.data,
      }));
    });

  }

}
