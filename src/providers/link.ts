import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Headers } from '@angular/http';
import { RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import * as assert from 'assert';
import * as uuid from 'uuid';
import * as SimplePeer from 'simple-peer';

declare var openpgp: any;

const URL = 'http://localhost:3000/link/';

const headers = new Headers({
  'Content-Type': 'application/json',
});
const requestOptions = new RequestOptions({
  headers: headers,
});

type Observer = (msg?: any) => void;

class Observable {
    observers: { [type: string]: Observer[] } = {};
    lastMessages: { [type: string]: string } = {};

    constructor() {
    } // constructor

    /**
     * Add an observer to a type of message
     *
     * @param   {string}   type       Type of messages the observer subscribes to
     * @param   {Observer} observer   Observer
     * @returns {Observer}            Observer
     */
    addObserver(type: string, observer: Observer, getLastMessage: boolean = false): Observer {
        if (!(type in this.observers)) {
            this.observers[type] = [];
        }
        this.observers[type].push(observer);
        if (getLastMessage) {
          observer(this.lastMessages[type]);
        }
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
        this.lastMessages[type] = msg;
        if (type in this.observers) {
            for (let obs of this.observers[type]) {
                obs(msg);
            } // for obs
        }
    } // notifyObservers
} // Observable


@Injectable()
export class Link {
  static mkLinkId(connId) {
    return connId.substr(0, 6).replace(/[a-f]/g, (m) =>
      m.charCodeAt(0) - 'a'.charCodeAt(0)
    );
  }

  public readonly observable: Observable;
  public isInitiator: boolean = null;
  private linkId: Promise<string>;
  private connId: Promise<string>;
  private pass: Promise<string>;

  constructor(
    private http: Http,
  ) {
    this.observable = new Observable();
    this.setStatus('Not connected');
    this.connId = this.http.post(URL, null)
      .map(res => res.json().connId)
      .toPromise();
    this.linkId = this.connId.then(connId => Link.mkLinkId(connId));
    this.connId.then((connId) => this.observable.notifyObservers('connId', connId));
    this.linkId.then((linkId) => this.observable.notifyObservers('linkId', linkId));
//    this.linkId.then(linkId => this.publicLinkId = linkId)
//      .then((linkId) => console.log(linkId) || linkId);
  }

  setStatus(message: string) {
//    this.status = message;
    this.observable.notifyObservers('status', message);
  }

  on(subject: string, fn, getLastMessage: boolean = false) {
    this.observable.addObserver(subject, fn, getLastMessage);
  }

  async registerAsReceiver(linkId, pass) {
    this.isInitiator = false;
    this.linkId = this.linkId.then(() => linkId);
    this.observable.notifyObservers('linkId', await this.linkId);
    this.setStatus('Connecting to initiator ' + linkId + '...');
    const link = this.http.post(URL + linkId + '?pass=' + pass, null)
      .toPromise();
    console.log('"(await link).status"', (await link).status)
    assert((await link).status === 200);
    this.connId = link.then((res) => res.json().connId);
    this.observable.notifyObservers('connId', await this.connId);
    this.observable.notifyObservers('linked');
  }

  async registerAsInitiator() {
    this.isInitiator = true;
    this.setStatus('Register as initiator...');
    const linkId = await this.linkId;
    const link = this.http.post(URL + linkId, null).toPromise();
    assert((await link).status === 201);
    const pass = (await link).json().pass;
    console.log(pass, '===', this.connId, pass === this.connId)
    if (pass === await this.connId) {
      this.confirmPass();
    } else {
      this.observable.notifyObservers('pass', pass);
    }
  }

  public async confirmPass() {
    await this.http.delete(URL + (await this.linkId)).toPromise();
    this.observable.notifyObservers('linked');
  }
}
