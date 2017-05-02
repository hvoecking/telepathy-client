import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { NgZone } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { ActivePage } from '../active/active';
import { Connection } from '../../providers/connection';
import { Status } from '../../providers/status';

const TOTAL = 10;

@Component({
  selector: 'page-connect',
  templateUrl: 'connect.html',
})
export class ConnectPage {

  public progress: string;

  constructor(
    private connection: Connection,
    private navCtrl: NavController,
    private zone: NgZone,
    private status: Status,
  ) {
    this.progress = Status.makeProgressString(0, TOTAL);
    this.status.onProgress(progress => {
      this.zone.run(() => {
        this.progress = Status.makeProgressString(progress, TOTAL);
        console.log('Progress:', this.progress)
      });
    });
    this.connection.on('connect', () => this.navCtrl.push(ActivePage));
    this.connection.doConnect();
  }
}
