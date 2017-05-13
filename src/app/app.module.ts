import { BrowserModule } from '@angular/platform-browser';
import { CloudModule } from '@ionic/cloud-angular';
import { CloudSettings } from '@ionic/cloud-angular';
import { ErrorHandler } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { IonicApp } from 'ionic-angular';
import { IonicErrorHandler } from 'ionic-angular';
import { IonicModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { QRCodeModule } from 'angular2-qrcode';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpModule } from '@angular/http';

import { ActivePage } from '../pages/active/active';
import { Connection } from '../providers/connection';
import { ConnectPage } from '../pages/connect/connect';
import { EnterKeyPage } from '../pages/enter-key/enter-key';
import { HomePage } from '../pages/home/home';
import { Link } from '../providers/link';
import { ShowKeyPage } from '../pages/show-key/show-key';
import { Status } from '../providers/status';
import { StatusPage } from '../pages/status/status';
import { MyApp } from './app.component';


const cloudSettings: CloudSettings = {
  core: {
    app_id: 'e6caaaa2',
  },
};

@NgModule({
  declarations: [
    ActivePage,
    ConnectPage,
    EnterKeyPage,
    HomePage,
    MyApp,
    ShowKeyPage,
    StatusPage,
  ],
  imports: [
    BrowserModule,
    CloudModule.forRoot(cloudSettings),
    HttpModule,
    IonicModule.forRoot(MyApp),
    QRCodeModule,
  ],
  bootstrap: [
    IonicApp,
  ],
  entryComponents: [
    ActivePage,
    ConnectPage,
    EnterKeyPage,
    HomePage,
    MyApp,
    ShowKeyPage,
    StatusPage,
  ],
  providers: [
    Connection,
    GoogleAnalytics,
    Link,
    Status,
    StatusBar,
    SplashScreen,
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler,
    },
  ],
})
export class AppModule {}
