import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { NgZone } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { ActivePage } from '../active/active';
import { Connection } from '../../providers/connection';

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
  ) {
    this.progress = this.makeProgressString(0);
    this.connection.on('progress', (progress) => this.zone.run(() => {
      this.progress = this.makeProgressString(progress);
      console.log('Progress:', this.progress)
    }));
    this.connection.on('connect', () => this.navCtrl.push(ActivePage));
    this.connection.doConnect();
  }

  private makeProgressString(progress) {
    const progressDone = progress * TOTAL;
    const progressTodo = (1 - progress) * TOTAL;
    return [
      '[',
      new Array(progressDone).join('='),
      '>',
      new Array(progressTodo).join(' '),
      ']',
    ].join('');
  }
}
