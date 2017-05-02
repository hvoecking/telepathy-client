import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { NgZone } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { Connection } from '../../providers/connection';

@Component({
  selector: 'page-status',
  templateUrl: 'status.html',
})
export class StatusPage {

  public ping: number;

  constructor(
    private connection: Connection,
    private navCtrl: NavController,
    private navParams: NavParams,
    private zone: NgZone,
    private viewCtrl: ViewController,
  ) {
    this.connection.on('ping', (ping) => {
      this.zone.run(() => {
        this.ping = ping;
      });
    });
  }

}
