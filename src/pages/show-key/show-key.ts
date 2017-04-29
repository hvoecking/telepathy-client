import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { ViewController } from 'ionic-angular';

import { Connection } from '../../providers/connection';

@Component({
  selector: 'page-show-key',
  templateUrl: 'show-key.html',
})
export class ShowKeyPage {

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private connection: Connection,
  ) {
    this.connection.init(true);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
