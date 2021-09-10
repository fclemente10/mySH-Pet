import {Component, OnDestroy, OnInit} from '@angular/core';
import {IonicPage, NavController, NavParams, ToastController} from 'ionic-angular';
import { Serial } from '@ionic-native/serial/ngx';
import {Subscription} from "rxjs";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit, OnDestroy  {

  subscription: Subscription;
  enchufado: boolean;
  moved: boolean;
  myDate: string;
  dateArray= [];
  correoElectronico: string

  constructor(public navCtrl: NavController,
              private serial: Serial,
              public toastCtrl: ToastController) {

  }
  ngOnInit(): void {
    this.serial.requestPermission({vid: '1d50', pid: '607d', driver: '0'}).then(() => {
      this.serial.open({
        baudRate: 9800,
        dataBits: 4,
        stopBits: 1,
        parity: 0,
        dtr: true,
        rts: true,
        sleepOnPause: false
      }).then(() => {
        console.log('Serial connection opened');
        let toast = this.toastCtrl.create({
          message: 'Serial connection opened ',
          duration: 4000,
          position: 'top'
        });
        toast.present();

      });
    }).catch((error: any) => console.log(error)
    );
  }

  btnOn(){
    this.serial.write('1');
    this.enchufado = true;
  }
  btnOff(){
    this.serial.write('0');
    this.enchufado = false;
  }

  ngOnDestroy() {
  }
}
