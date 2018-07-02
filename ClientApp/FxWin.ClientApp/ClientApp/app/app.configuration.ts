import { Component, OnInit, OnDestroy, Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class AppConfiguration {
    
    private env: Object = null;
    public getEnv(key: any) {
        return this.env[key];
    }

    private config: Object = null;
    public getConfig(key: any) {
        return this.config[key];
    }

    private _host: string
    public get host(): string {
        return this._host;
    }

    constructor(private http: Http) {
    }

    public init(): Promise<boolean> {
        const this_ = this;
        if (this._host) {
            return Promise.resolve(true);
        }
        else {
            return this.http.get('/api/AppConfig', { withCredentials: true })
                .toPromise()
                .then(envResponse => {
                    this.config =  JSON.parse(envResponse["_body"]);//stringify
                    debugger;
                    this._host= this.getConfig('webApi').dbWebApiUrl;
                    console.log(this_._host);
                    return this_._host;
                })
                .then(host => {
                    //this_._http
                    //    .get(`${host}api/jobs/env`, { withCredentials: true })
                    //    .toPromise()
                    //    .then(r2 => {
                    //        this_._env = <string>r2.json();
                    //        //this_._msgSvc.notify({ type: 'INFO', action: 'ENV', payload: this._env });

                    //        console.log(this_._env);
                    //    });
                    // if (localStorage.getItem('currentUser')) {
                    //     return true;
                    // }else{
                    //     return false;
                    // }
                    
                    return true;
                })

                .catch(err => {
                    console.log(err);
                    return false;
                });
        }
    }

     /**
     *  le fichier de Configuration est côte site asp.net core MVC  on utiluse un controller web api pour recuperer le fichier de config 
     * This method:loadConfigFromController chargement de la config  à partir controller server c# 
     *   0) il faut ajouter 3 fichiers sous le dossier wwwroot env.json,config.Development.json et config.Production.json
     *   a) Loads "env.json" to get the current working environment (e.g.: 'production', 'development')
     *   b) Loads "config.[env].json" to get all env's variables (e.g.: 'config.development.json')
     */
    public loadConfigFromController(): Promise<any> {
        const this_ = this;
        if (this.config) {
            return Promise.resolve(true);
        }
        else {
            return new Promise((resolve, reject) => {
                this.http.get('/api/AppConfig', { withCredentials: true })
                    .map(res => res.json())
                    .subscribe((envResponse) => {
                        //debugger;
                        this.config = envResponse;
                        //le retour il faut appler resolve(true) pas de return dans new Promise
                        resolve(true);
                    })
            })
        }
    }
     /**
     * le fichier de configuration json est directement dans le site angular 
     *  This method:loadConfigFromJsonFile chargement de config à partir de fichiers json directement sans le controller server c#
     *   0) il faut ajouter 3 fichiers sous le dossier wwwroot env.json,config.Development.json et config.Production.json
     *   a) Loads "env.json" to get the current working environment (e.g.: 'production', 'development')
     *   b) Loads "config.[env].json" to get all env's variables (e.g.: 'config.development.json')
     */
    public loadConfigFromJsonFile(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.get('env.json')
                .map( res => res.json() )
                .catch((error: any):any => {
                        console.log('Configuration file "appsettings.json" could not be read');
                        resolve(true);
                             return Observable.throw(error.json().error || 'Server error');  })
                .subscribe( (envResponse) => {
                this.env = envResponse;
                let request:any = null;

                switch (envResponse.Env) {
                    case 'Production': {
                        request = this.http.get('config.' + envResponse.Env + '.json');
                    } break;

                    case 'Development': {
                        request = this.http.get('config.' + envResponse.Env + '.json');
                    } break;

                    case 'default': {
                        console.error('Environment file is not set or invalid');
                        resolve(true);
                    } break;
                }

                if (request) {
                    request
                        .map( res => res.json() )
                        .catch((error: any) => {
                            console.error('Error reading ' + envResponse.Env + ' configuration file');
                            resolve(error);
                            return Observable.throw(error.json().error || 'Server error');
                        })
                        .subscribe((responseData) => {
                            debugger;
                            this.config = responseData.AppConfig;
                            resolve(true);
                        });
                } else {
                    console.error('Env config file "env.json" is not valid');
                    resolve(true);
                }
            });

        });
}

}



