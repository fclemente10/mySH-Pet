import { HttpClient } from '@angular/common/http';
import {AfterViewInit, ElementRef, Injectable, OnInit, ViewChild} from '@angular/core';
import {WebSocketSubject} from "rxjs/observable/dom/WebSocketSubject";
import {ip} from "../api/api";

/* export class Message {
  constructor(
    public sender: string,
    public content: string,
      public serial: string,
    public isBroadcast = false,
  ) { }
}

*/

@Injectable()
export class WebsocketProvider implements OnInit, AfterViewInit{

  @ViewChild('viewer') private viewer: ElementRef;

  public serverMessages: string;  //= new Array<Message>();

  public clientMessage = '';
  public isBroadcast = false;
  public sender = '';

  public socket$: WebSocketSubject<any>;


  constructor(public http: HttpClient) {
    console.log('Hello WebsocketProvider Provider');
    this.socket$ = new WebSocketSubject('ws://'+ ip +':3300');

    this.socket$
      .subscribe(
        (message) => {
          this.serverMessages = JSON.stringify(message);
          console.log(this.serverMessages);
          console.log('arriba');
        }
        ,
        (err) => console.error(err),
        () => console.warn('Completed!')
      );

  }
  ngOnInit() {
  }

  ngAfterViewInit(): void {

  }
  public toggleIsBroadcast(): void {
    this.isBroadcast = !this.isBroadcast;
  }
/*
  public send(): void {
    const message = new Message(this.clientMessage);

    this.socket$.next(message);
    this.clientMessage = '';

  }
  */
    public send(message: string) {
//      const message = new Message(this.clientMessage);

      this.socket$.next(message);
      this.clientMessage = '';
     }


  public isMine(message: any): boolean {
    return false;// message && message.sender === this.sender;
  }

}
