import * as _ from 'lodash';
import { Injectable } from '@angular/core';

import { Observable } from '../common/observable';

const MAX_PROGRESS = 9;

@Injectable()
export class Status {

  private readonly observable = new Observable();
  private progress: number = 0;

  set(message: string, progress?: boolean) {;
    console.log('STATUS:', message);
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
    // const progressDone = progress * total;
    // const progressTodo = (1 - progress) * total;
    // return [
    //   '[',
    //   new Array(progressDone).join('='),
    //   '>',
    //   new Array(progressTodo).join(' '),
    //   ']',
    // ].join('');
  }
}
