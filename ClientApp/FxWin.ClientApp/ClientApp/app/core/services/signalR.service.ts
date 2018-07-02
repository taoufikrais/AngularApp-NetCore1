// import the packages  
import { Injectable, EventEmitter } from '@angular/core';
import * as $ from "jquery";
import 'ms-signalr-client';
//import { HubConnection } from '@aspnet/signalr-client' ;

// declare the global variables  
@Injectable()
export class SignalRService {
    // Declare the variables  
    private proxy: any;
    private proxyName: string = 'progressHub';
    private connection: any;
    // create the Event Emitter  
    public messageReceived: EventEmitter<any>;
    public connectionEstablished: EventEmitter<Boolean>;
    public connectionExists: Boolean;
    constructor() {
        //this.initConnexion();
        //this.initConctionwhithJquery();
    }

    initConnexion() {
        var connection = $.hubConnection('http://localhost:60257');
        var proxy = connection.createHubProxy('progressHub');
        // receives broadcast messages from a hub function, called "broadcastMessage"
        proxy.on('AddProgress', function (message) {
            console.log(message);
        });

        // atempt connection, and handle errors
        connection.start({ jsonp: true })
            .done(function () { console.log('Now connected, connection ID=' + connection.id); })
            .fail(function () { console.log('Could not connect'); });
    }

    initConctionwhithJquery() {

        // create hub connection  
        this.connection = $.connection("http://localhost:60257/");
        // Constructor initialization  
        this.connectionEstablished = new EventEmitter<Boolean>();
        this.messageReceived = new EventEmitter<any>();
        this.connectionExists = false;
        // create new proxy as name already given in top  
        this.proxy = this.connection.createHubProxy(this.proxyName);
        // register on server events  
        this.registerOnServerEvents();
        // call the connecion start method to start the connection to send and receive events.  
        this.startConnection();
    }

    // method to hit from client  
    public sendTime() {
        // server side hub method using proxy.invoke with method name pass as param  
        this.proxy.invoke('GetRealTime');
    }
    // check in the browser console for either signalr connected or not  
  
    private startConnection(): void {
        this.connection.start().done((data: any) => {
            console.log('Now connected ' + data.transport.name + ', connection ID= ' + data.id);
            this.connectionEstablished.emit(true);
            this.connectionExists = true;
        }).fail((error: any) => {
            console.log('Could not connect ' + error);
            this.connectionEstablished.emit(false);
        });
    }

    private registerOnServerEvents(): void {
        debugger;
        this.proxy.on('AddProgress', (data:any) => {
            console.log('received in SignalRService: ' + JSON.stringify(data));
            this.messageReceived.emit(data);
        });
    }
}
