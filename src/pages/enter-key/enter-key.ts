import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { ViewController } from 'ionic-angular';

import { Connection } from '../../providers/connection';

@Component({
  selector: 'page-enter-key',
  templateUrl: 'enter-key.html',
})
export class EnterKeyPage {

  public formattedId: string;

  public readonly sampleId = 'telepathy-name:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private connection: Connection,
  ) {
    this.connection.init(false);
  }

  onId(id: string) {
    this.formattedId = id;
    if (this.formattedId.length == this.sampleId.length) {
      this.connection.connectToInitiator(this.formattedId);
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
