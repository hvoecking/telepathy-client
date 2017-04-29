import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Headers } from '@angular/http';
import { RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import * as assert from 'assert';
import * as uuid from 'uuid';
import * as SimplePeer from 'simple-peer';

const CONNECTION_RESOURCE = 'http://localhost:3000/connection/';

const TPYE_PREFIX = 'telepathy'
const TYPE_DELIMITER = '-';
const NAME_TYPE = [TPYE_PREFIX, 'name'].join(TYPE_DELIMITER);
const PASS_TYPE = [TPYE_PREFIX, 'pass'].join(TYPE_DELIMITER);
const ID_DELIMITER = ':';

const headers = new Headers({
  'Content-Type': 'application/json',
});
const options = new RequestOptions({
  headers: headers,
});

class Peer {

  private readonly privKey: string;
  private readonly pass: string;

  constructor(
    public readonly isInitiator: boolean,
    public readonly name?: string,
    public readonly pubKey?: string,
  ) {
    if (!this.name && !this.pubKey) {
      this.pubKey = 'pubKey';
      this.privKey = 'privKey';
      this.name = [NAME_TYPE, uuid.v4()].join(ID_DELIMITER);
      this.pass = [PASS_TYPE, uuid.v4()].join(ID_DELIMITER);
    } else {
      assert(this.name, 'Missing name');
      assert(this.pubKey, 'Missing pubKey');
    }
  }

}

@Injectable()
export class Connection {

  private local: Peer;
  private remote: Peer;
  private initiatorName: string;
  private receiverName: string;
  private connection: any;

  constructor(
    private http: Http,
  ) {
    //
  }

  getLocalName(): string {
    if (!this.local) {
      return null;
    }
    return this.local.name;
  }

  setStatus(message: string) {
    console.log('STATUS:', message);
  }

  init(isInitiator: boolean) {
    this.local = new Peer(isInitiator);

    this.connection = new SimplePeer({
      initiator: this.local.isInitiator,
      trickle: false,
    });

    this.connection.on('error', (err) => {
      console.log('error', err);
    });

    if (this.local.isInitiator) {
      this.initiatorName = this.local.name;
      this.connection.on('signal', (data) => {
        console.log('SIGNAL', this.local.name, data);

        this.setStatus('Waiting for receiver...');
        this.http.put(CONNECTION_RESOURCE + this.local.name, data, options)
          .map(res => res.text())
          .toPromise()
          .then((name) => this.connectToReceiver(name));
      });
    } else {
      this.receiverName = this.local.name;
      this.connection.on('signal', (data) => {
        console.log('SIGNAL', this.local.name, data);

        this.setStatus('Waiting for initiator...')
        this.http.patch(CONNECTION_RESOURCE + this.initiatorName + '/receiver/' + this.receiverName, data, options)
          .toPromise()
          .then(() => {
            this.setStatus('Initiator found')
          });
      });
    }

    this.connection.on('connect', () => {
      console.log('CONNECT');
      this.setStatus('Telepathic link established!');
      this.connection.send(JSON.stringify({
        pubKey: this.local.pubKey,
      }));
    });

    this.connection.on('data', (data) => {
      const obj = JSON.parse(data);
      if (!this.remote) {
        assert(obj.pubKey, 'Missing pubKey in ' + data);
        if (this.local.isInitiator) {
          this.remote = new Peer(
            false,
            this.receiverName,
            obj.pubKey,
          );
        } else {
          this.remote = new Peer(
            false,
            this.initiatorName,
            obj.pubKey,
          );
        }
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
        this.setStatus('Ping returned with latency of ' + (Date.now() - obj.pong) + ' ms');
        this.sendPing();
        return;
      }
      console.log('data: ' + data);
    });
  }

  sendPing() {
    setTimeout(() => {
      this.connection.send(JSON.stringify({
        ping: Date.now(),
      }));
    }, 1000);
  }

  connectToInitiator(name) {
    this.initiatorName = name;
    const [type, id] = this.initiatorName.split(':');
    if (type != NAME_TYPE) {
      console.error('Invalid type: ' + type);
      return;
    }
    this.setStatus('Connecting to initiator ' + id + '...');
    this.http.get(CONNECTION_RESOURCE + this.initiatorName)
      .map(res => res.json())
      .toPromise()
      .then((peerData) => {
        this.setStatus('Initiator found');
        this.connection.signal(peerData);
      });
  }

  connectToReceiver(name) {
    this.receiverName = name;
    const [type, id] = this.receiverName.split(':');
    if (type != NAME_TYPE) {
      console.error('Invalid type: ' + type);
      return;
    }
    this.setStatus('Connecting to receiver ' + id + '...');
    this.http.delete(CONNECTION_RESOURCE + this.initiatorName)
      .map(res => res.json())
      .toPromise()
      .then((peerData) => {
        this.setStatus('Receiver found');
        this.connection.signal(peerData);
      });
  }

}
