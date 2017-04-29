import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { HomePage } from '../pages/home/home';

@Component({
  templateUrl: 'app.html',
})
export class MyApp {
  rootPage: any = HomePage;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
  ) {
    platform.ready()
      .then(() => {
        if (!platform.is('core')) {
          statusBar.styleDefault();
          splashScreen.hide();
        }
      });
  }
}
