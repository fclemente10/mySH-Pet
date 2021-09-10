import 'rxjs/add/operator/toPromise';
import { Injectable } from '@angular/core';
import { Api } from '../api/api';
import {Observable} from "rxjs";

export interface Alarm {
  id: number;
  serialNumber: string ;
  dataTime: string;
  emailCliente: string;
}

export interface Equipo {
  serialNumber: string;
  dataTime: string;
  emailCliente: string;
  descripcion: string;
}



@Injectable()
export class User {
  _user: any;
  private token: string;

  constructor(public api: Api) { }

  /* #######################  METODODS EQUIPOS ######################## */

  /************************Buscar equipos de un usuario************************/
  public getEquiposUsuario(emailCliente: string){
    return this.api.get('infoequipos/'+emailCliente).share();
  }
  /************************Buscar equipos de un usuario************************/
  public getEquipo(serial: string){
    return this.api.get('equipo/'+serial).share();
  }

  /* #######################  METODODS ARDUINO ######################## */
  public getEquipos(): Observable<any> {
    return this.api.get(`equipo/`).share();
  }
  public postEquipo(equipo: Equipo): Observable<any> {
    return this.api.post(`equipo/`, equipo).share();
  }

  /************************Actualizar Alarmas************************/
  public postAlarm(alarm: Alarm) {
    return this.api.post(`alarm`, alarm);
  }
  public delAlarm(serial: string): Observable<any> {
    return this.api.delete(`alarm/`+ serial).share();
  }

  /* #######################  METODODS Matematicos ######################## */
  public getMedias(math: Math){
     const result = this.api.post(`math`, math).share()
    return (result as any);
  }
  public getDatos(serialNumber: string){
    console.log('Busca datos con serial ='+serialNumber);
    return this.api.get('datos/'+serialNumber).share();
  }




}
