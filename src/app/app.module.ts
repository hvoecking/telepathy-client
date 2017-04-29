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

import { Connection } from '../providers/connection';
import { HomePage } from '../pages/home/home';
import { ShowKeyPage } from '../pages/show-key/show-key';
import { MyApp } from './app.component';

@NgModule({
  declarations: [
    HomePage,
    MyApp,
    ShowKeyPage,
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
    HomePage,
    MyApp,
    ShowKeyPage,
  ],
  providers: [
    Connection,
    StatusBar,
    SplashScreen,
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler,
    },
  ],
})
export class AppModule {}
