import { Component, OnInit, OnDestroy, Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Headers, Http, Response, RequestOptions } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

import { Observable } from 'rxjs/Rx';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ODataConfiguration, ODataServiceFactory, ODataService, ODataQuery, ODataPagedResult } from "angular-odata-es5";

import { Logger } from './logger.service';
import { AppConfiguration } from '../../app.configuration';

import * as moment from 'moment';
import { User } from '../models/user.model';

import { AuditTrail } from '../models/audit.model';


@Injectable()

export class AuditService {
    private headers = new Headers({ 'Content-Type': 'application/json' });
    private serviceurl;//= myGlobals.baseAdresse + 'Cargos';
    // Resolve HTTP using the constructor
    constructor(private http: Http,
        private logger: Logger,
        private appConfig: AppConfiguration
    ) {
        let conf= appConfig.getConfig('webApi');
        this.serviceurl = conf.dbWebApiUrl + 'Audit';
    }

    GetCommodityHedgeAuditTrail(): Observable<AuditTrail[]> {
        var url= this.serviceurl + "/GetCommodityHedgeAuditTrail";
        var res = this.http.get(url)
            .map(res => <AuditTrail[]>res.json());
        return res;
    }
    
    GetFXHedgeAuditTrail(): Observable<AuditTrail[]> {
        try {
            var url = this.serviceurl + "/GetFXHedgeAuditTrail";
            var res = this.http.get(url)
            .map(res => <AuditTrail[]>res.json());
             return res;
        } catch (error) {
             this.handleError(error);
        }
    }

     GetOtherUnderlyingAuditTrail(): Observable<AuditTrail[]> {
        try {
            var url = this.serviceurl + "/GetOtherUnderlyingAuditTrail";
            var res = this.http.get(url)
            .map(res => <AuditTrail[]>res.json());
            return res;
        } catch (error) {
             this.handleError(error);
        }
    }

    GetCargoAuditTrail(): Observable<AuditTrail[]> {
        try {
            var url = this.serviceurl + "/GetCargoAuditTrail";
            var res = this.http.get(url)
            .map(res => <AuditTrail[]>res.json());
             return res;
        } catch (error) {
             this.handleError(error);
        }
    }
   
    handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }


}