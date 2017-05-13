import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import * as assert from 'assert';
import { Headers } from '@angular/http';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { RequestOptions } from '@angular/http';

import { Observable } from '../common/observable';
import { Status } from './status';

const URL = 'https://telepathy.hvo.io/link/';

const requestOptions = new RequestOptions({
  headers: new Headers({
    'Content-Type': 'application/json',
  }),
});

@Injectable()
export class Link {
  static mkLinkId(connId) {
    return connId.substr(0, 6).replace(/[a-f]/g, (m) =>
      m.charCodeAt(0) - 'a'.charCodeAt(0)
    );
  }

  private readonly observable = new Observable();
  public isInitiator: boolean = null;
  private connId: Promise<string>;
  private linkId: Promise<string>;
  private pass: Promise<string>;

  constructor(
    private readonly http: Http,
    private readonly status: Status,
  ) {
    this.status.set('Not connected');
    this.connId = this.http.post(URL, null)
      .map(res => res.json().connId)
      .toPromise();
    this.linkId = this.connId.then(connId => Link.mkLinkId(connId));
    this.connId.then((connId) => this.observable.notify('connId', connId));
    this.linkId.then((linkId) => this.observable.notify('linkId', linkId));
  }

  on(subject: string, fn, getLastMessage: boolean = false) {
    this.observable.add(subject, fn, getLastMessage);
  }

  async registerAsReceiver(linkId, pass) {
    this.isInitiator = false;
    this.linkId = this.linkId.then(() => linkId);
    this.observable.notify('linkId', await this.linkId);
    this.status.set('Connecting to initiator ' + linkId + '...');
    const link = this.http.post(URL + linkId + '?pass=' + pass, null)
      .toPromise();
    assert((await link).status === 200);
    this.connId = link.then((res) => res.json().connId);
    this.observable.notify('connId', await this.connId);
    this.observable.notify('linked');
  }

  async registerAsInitiator() {
    this.isInitiator = true;
    this.status.set('Register as initiator...');
    const linkId = await this.linkId;
    const link = this.http.post(URL + linkId, null).toPromise();
    assert((await link).status === 201);
    const pass = (await link).json().pass;
    if (pass === await this.connId) {
      this.confirmPass();
    } else {
      this.observable.notify('pass', pass);
    }
  }

  public async confirmPass() {
    await this.http.delete(URL + (await this.linkId)).toPromise();
    this.observable.notify('linked');
  }
}
