import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { NavController } from 'ionic-angular';
import { Platform } from 'ionic-angular';

import { Connection } from '../../providers/connection';
import { EnterKeyPage } from '../enter-key/enter-key';
import { ShowKeyPage } from '../show-key/show-key';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  constructor(
    private navCtrl: NavController,
    private platform: Platform,
    private modalCtrl: ModalController,
    private connection: Connection,
  ) {
    //
  }

  showKey() {
    let modal = this.modalCtrl.create(ShowKeyPage);
    modal.present();
  }

  enterKey() {
    let modal = this.modalCtrl.create(EnterKeyPage);
    modal.present();
  }
}
