import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { NgZone } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { Connection } from '../../providers/connection';
import { Link } from '../../providers/link';

@Component({
  selector: 'page-show-key',
  templateUrl: 'show-key.html',
})
export class ShowKeyPage {

  public pass: string;
  public linkId: string;
  public connId: string;

  constructor(
    private link: Link,
    private navCtrl: NavController,
    private navParams: NavParams,
    private zone: NgZone,
    private viewCtrl: ViewController,
  ) {
    this.link.on('linkId', (linkId) => {
      console.log(linkId); this.linkId = linkId}, true);
    this.link.on('connId', (connId) => {
      console.log(connId); this.connId = connId}, true);
    this.link.on('linked', () => this.dismiss());
    this.link.on('pass', (pass) => {
      this.zone.run(() => {
        console.log(pass);
        this.pass = pass;
      });
    });
    this.link.registerAsInitiator();
  }

  onPassInput(pass) {
    if (pass === this.pass) {
      this.link.confirmPass();
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
