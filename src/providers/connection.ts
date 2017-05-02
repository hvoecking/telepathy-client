import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import * as SimplePeer from 'simple-peer';
import * as _ from 'lodash';
import * as assert from 'assert';
import { Headers } from '@angular/http';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { RequestOptions } from '@angular/http';

import { Link } from './link';
import { Observable } from '../common/observable';
import { Status } from './status';

declare var openpgp: any;

const URL = 'http://localhost:3000/connection/';

const requestOptions = new RequestOptions({
  headers: new Headers({
    'Content-Type': 'application/json',
  }),
});

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

  private readonly observable = new Observable();
  private connection: any;
  private connId: string;
  private local: Peer;
  private remote: Peer;

  constructor(
    private readonly http: Http,
    private readonly link: Link,
    private readonly status: Status,
  ) {
    this.link.on('connId', (connId) => this.connId = connId);
  }

  on(subject: string, fn) {
    this.observable.add(subject, fn);
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
      this.status.set('Signal sent -> waiting for reply...', true);
      this.http.post(URL + this.connId, {data}, requestOptions)
        .toPromise()
        .then(() => {
          this.status.set('Reply received -> waiting for connect...', true);
        });
    });

    this.connection.on('connect', () => {
      this.status.set('Telepathic link established -> exchanging keys...', true);
      this.local.pubKey.then(pubKey => {
        const data = JSON.stringify({
          pubKey: pubKey,
        });
        this.connection.send(data);
      });
    });

    this.connection.on('data', (data) => {
      const obj = JSON.parse(data);
      if (obj.ping) {
        this.connection.send(JSON.stringify({
          pong: obj.ping,
        }));
        return;
      }
      if (obj.pong) {
        this.observable.notify('ping', Date.now() - obj.pong);
        this.sendPing();
        return;
      }
      if (!this.remote) {
        assert(obj.pubKey, 'Missing pubKey in ' + data);
        this.status.set('Key received -> starting ping...', true);
        this.remote = new Peer(
          !this.local.isInitiator,
          obj.pubKey,
        );
        this.observable.notify('connect');
        this.sendPing();
        return;
      }
      if (obj.message) {
        this.readEncryptedMessage(obj.message);
        return;
      }
    });
    this.connection.on('close', () => {
      this.status.set('Connection closed', false);
      this.connection = undefined;
      this.observable.notify('close');
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
          this.observable.notify(key, obj[key])
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
    this.status.set('Initialized -> searching for initator...', true);
    const peerData = await this.http.get(URL + this.connId + '/initiator')
      .map(res => res.json().data)
      .toPromise();
    this.status.set('Initiator found -> waiting for connect...', true);
    await this.connect();
    this.status.set('Connected -> sending signal...', true);
    this.connection.signal(peerData);
    this.status.set('Signal sent...', true);
  }

  async connectToReceiver() {
    this.status.set('Initialized -> initiating connection...', true);
    await this.connect();
    this.status.set('Connecting initiated -> searching for receiver...', true);
    const peerData = await this.http.get(URL + this.connId + '/receiver')
      .map(res => res.json().data)
      .toPromise();
    this.status.set('Connected -> sending signal...', true);
    this.connection.signal(peerData);
    this.status.set('Signal sent...', true);
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
