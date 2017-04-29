import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler } from '@angular/core';
import { IonicApp } from 'ionic-angular';
import { IonicErrorHandler } from 'ionic-angular';
import { IonicModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpModule } from '@angular/http';

import { Connection } from '../providers/connection';
import { HomePage } from '../pages/home/home';
import { MyApp } from './app.component';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [
    IonicApp,
  ],
  entryComponents: [
    MyApp,
    HomePage,
    KeyPage,
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
