import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { NavController } from 'ionic-angular';
import { Platform } from 'ionic-angular';

import { ConnectPage } from '../connect/connect';
import { Connection } from '../../providers/connection';
import { EnterKeyPage } from '../enter-key/enter-key';
import { Link } from '../../providers/link';
import { ShowKeyPage } from '../show-key/show-key';

import * as _ from 'lodash';

declare const cordova: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  public status: string;
  public linked: boolean = false;

  constructor(
    private connection: Connection,
    private link: Link,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private platform: Platform,
  ) {
    this.link.on('linked', () => {
      this.linked = true;
      this.navCtrl.push(ConnectPage);
    });
  }

  ionViewDidEnter() {
    console.log('ionViewDidEntered')
    if (location.hash && location.hash.match(/#[0-9a-f-]{36}/)) {
      console.log('location.hash:', location.hash);
      const id = _.last(location.hash.split('#'));
      this.link.registerAsReceiver(Link.mkLinkId(id), id);
    }
  }

  showKey() {
    let modal = this.modalCtrl.create(ShowKeyPage);
    modal.present();
  }

  scanKey() {
    this.platform.ready()
      .then(() => {
        cordova.plugins.barcodeScanner.scan((result) => {
          const id = _.last(result.text.split('#'));
          console.log('id:', id)
          this.link.registerAsReceiver(Link.mkLinkId(id), id);
        }, (error) => {
          console.error(error);
        });
      });
  }

  enterKey() {
    let modal = this.modalCtrl.create(EnterKeyPage);
    modal.present();
  }
}
