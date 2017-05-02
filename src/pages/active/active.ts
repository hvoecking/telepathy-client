//import { Clipboard } from '@ionic-native/clipboard';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { NgZone } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { Connection } from '../../providers/connection';

@Component({
  selector: 'page-active',
  templateUrl: 'active.html',
})
export class ActivePage {

  public paste: string;
  public text: string;

  constructor(
//    private clipboard: Clipboard,
    private connection: Connection,
    // private navCtrl: NavController,
    // private navParams: NavParams,
    private zone: NgZone,
    // private viewCtrl: ViewController,
  ) {
    // this.clipboard.paste()
    //   .then((resolve: string) => {
    //     console.log('clipboard:', resolve);
    //   }, (reject: string) => {
    //     console.error('Error: ' + reject);
    //   });
    this.connection.on('paste', (message) => {
      this.paste = message;
    });
    this.connection.on('text', (message) => {
      console.log('text:', message)
      this.zone.run(() => {
        this.text = message;
      });
    });
    this.connection.on('file', (message) => {
      console.log('file:', message);
    });
  }

  get textInput () {
    return this.text;
  }

  set textInput (text) {
    this.connection.sendMessage({
      text: text,
    });
  }

}
