import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { ViewController } from 'ionic-angular';

import { Link } from '../../providers/link';

import * as uuid from 'uuid';

@Component({
  selector: 'page-enter-key',
  templateUrl: 'enter-key.html',
})
export class EnterKeyPage {

  public readonly sampleId = 'xxxxxx';
  private pass: string;

  constructor(
    private link: Link,
    private navCtrl: NavController,
    private navParams: NavParams,
    private viewCtrl: ViewController,
  ) {
    this.link.on('linked', () => {
      this.dismiss();
    });
  }

  onId(shortId: string) {
    if (shortId.length === this.sampleId.length) {
      this.pass = uuid.v4().substr(0, 4);
      this.link.registerAsReceiver(shortId, this.pass);
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
