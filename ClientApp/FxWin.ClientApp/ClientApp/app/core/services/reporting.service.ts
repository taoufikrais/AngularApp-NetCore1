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

import { VW_Reporting,VW_Cube, VW_CubeFXHedge, VW_CubeCommodity } from '../models/reporting.model';


@Injectable()

export class ReportingService {
    private headers = new Headers({ 'Content-Type': 'application/json' });
    private reportingUrl;//= myGlobals.baseAdresse + 'Cargos';
    // Resolve HTTP using the constructor
    constructor(private http: Http,
        private logger: Logger,
        private appConfig: AppConfiguration
    ) {
        let conf= appConfig.getConfig('webApi');
        this.reportingUrl = conf.dbWebApiUrl + 'Reporting';
    }


 
    async gethedgeReportAsync(): Promise<VW_Reporting[]> {
        try {
            var url = this.reportingUrl + "/GetListReporting";
            let res = await this.http.get(url).toPromise();
            return <VW_Reporting[]>res.json() ;
        } catch (error) {
            await this.handleError(error);
        }
    }

    gethedgeReport(): Promise<VW_Reporting[]> {
        var url = this.reportingUrl + "/GetListReporting";
        return this.http.get(url)
          .toPromise()  
          .then(result => {
            return <VW_Reporting[]>result.json();
           });
    }

    gethedgeReport1(): Observable<VW_Reporting[]> {
        var url= this.reportingUrl + "/GetListReporting";
        var res = this.http.get(url)
            .map(res => <VW_Reporting[]>res.json());
        return res;
    }

    async getCubeDataAsync(): Promise<VW_Cube[]> {
        try {
            var url = this.reportingUrl + "/GetCubeData";
            let res = await this.http.get(url).toPromise();
            return   this.extractData(res.json()) ;
        } catch (error) {
            await this.handleError(error);
        }
    }

    async getHedgeCubeAsync(): Promise<VW_CubeFXHedge[]> {
        try {
            var url = this.reportingUrl + "/GetCubeFXHedgeData";
            let res = await this.http.get(url).toPromise();
            return   this.formatData(res.json()) ;
        } catch (error) {
            await this.handleError(error);
        }
    }

    async GetCubeCommodityAsync(): Promise<VW_CubeCommodity[]> {
        try {
            var url = this.reportingUrl + "/GetCubeCommodityData";
            let res = await this.http.get(url).toPromise();
            return   this.formatCubeCommodity(res.json()) ;
        } catch (error) {
            await this.handleError(error);
        }
    }


    extractData(data) {
        data.forEach((d) => {
            d.OperationDateMonth = moment(d.OperationDateMonth,'MM').format('MMMM');
        });
        return <VW_Cube[]>data;
    }

    formatData(data) {
        data.forEach((d) => {
            d.Mois = moment(d.Mois,'MM').format('MMMM');
        });
        return <VW_CubeFXHedge[]>data;
    }

    formatCubeCommodity(data) {
        data.forEach((d) => {
            d.HedgeCommoMaturityMonth = moment(d.HedgeCommoMaturityMonth,'MM').format('MMMM');
        });
        return <VW_CubeCommodity[]>data;
    }


    handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }


}