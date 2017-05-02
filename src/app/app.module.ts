import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler } from '@angular/core';
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
import { StatusPage } from '../pages/status/status';
import { MyApp } from './app.component';

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
    Link,
    StatusBar,
    SplashScreen,
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler,
    },
  ],
})
export class AppModule {}
