import * as _ from 'lodash';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Observable } from '../common/observable';

const MAX_PROGRESS = 9;

@Injectable()
export class Status {

  private readonly observable = new Observable();
  private progress: number = 0;
  private readonly history: string[] = [];
  private readonly analytics: Promise<any>;


  constructor(
    private readonly ga: GoogleAnalytics,
    private readonly platform: Platform,
  ) {
  this.analytics = this.platform.ready()
    .then(() => this.ga.startTrackerWithId('UA-98921925-1'))
    .then(() => {
      console.log('Google analytics is ready now');
      return this.ga;
    })
    .catch(e => console.log('Error starting GoogleAnalytics', e));
  }

  set(
    message: string,
    progress?: boolean,
    isInitiator?: boolean,
    linkId?: string,
  ) {
    console.log('STATUS:', message);
    this.analytics.then((analytics) => {
      let label: string;
      if (!_.isUndefined(isInitiator)) {
        label = isInitiator ? 'initiator' : 'receiver';
      }
      let value: number;
      if (!_.isUndefined(linkId)) {
        value = parseInt(linkId);
      }
      analytics.trackView('send', 'event', 'status', message, label, value);
    });
    this.history.push(message);
    this.observable.notify('status', message);
    if (_.isUndefined(progress)) {
      return;
    }
    if (!progress) {
      this.progress = 0;
    } else {
      this.progress += 1;
    }
    this.observable.notify('progress', this.progress / MAX_PROGRESS);
  }

  on(fn, getLastMessage: boolean = false) {
    this.observable.add('status', fn, getLastMessage);
  }

  onProgress(fn, getLastMessage: boolean = false) {
    this.observable.add('progress', fn, getLastMessage);
  }

  static makeProgressString(progress, total) {
    return (progress * 100).toFixed(2) + "%";
  }
}
