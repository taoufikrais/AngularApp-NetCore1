import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

import { Observable } from 'rxjs/Rx';

import { TimeSerie, TimeSerieValue } from '../models/timeserie.model';

import { ODataService, ODataServiceFactory } from "angular-odata-es5";

import { AppConfiguration } from '../../app.configuration';

import { Currency, Unit } from '../models/typeCode.model';
@Injectable()

export class PriceService {
    private headers = new Headers({ 'Content-Type': 'application/json' });
    private timeSerieUrl;
    private timeSerieValueUrl;
    private GetTimeSerieValuesByTsIdUrl;
    private odataCurrency: ODataService<Currency>;
    private odataUnit: ODataService<Unit>;

    constructor(private http: Http, private odataFactory: ODataServiceFactory, private appConfig: AppConfiguration) {
        this.timeSerieUrl = appConfig.host + 'TimeSeries';
        this.timeSerieValueUrl = appConfig.host + 'TimeSerieValues';
        this.GetTimeSerieValuesByTsIdUrl = appConfig.host + 'GetTimeSerieValuesByTsId';
        this.odataCurrency = this.odataFactory.CreateService<Currency>('Currencies');
        this.odataUnit = this.odataFactory.CreateService<Unit>('Units');
    }

    getTimeSeries() {
        var url = this.timeSerieUrl;
        url += "?";
        url += "$expand=*";
        var res = this.http.get(url)
            .map(res => <TimeSerie[]>res.json().value);
        return res;
    }

    getTimeSerieValues(id:number) {
        var url = this.GetTimeSerieValuesByTsIdUrl;
        url += "(";
        url += "timeSerieId = " + id;
        url += ")";
        var res = this.http.get(url)
            .map(res => <TimeSerieValue[]>res.json().value);

        return res;
    }

    getTimeSerie(id: number): Observable<TimeSerie> {
        var url = this.timeSerieUrl + '(' + id + ')';
        url += '?';
        url += '$expand=Currency, Unit';
        var res = this.http.get(url)
            .map(res => <TimeSerie>res.json());
        return res;
    }

    save(timeSerie: TimeSerie): Promise<TimeSerie> {
        var jsonobject = JSON.stringify(timeSerie);
        var urlString = this.timeSerieUrl + "(" + timeSerie.Id + ")";
        var options = { headers: this.headers };

        return this.http
            .put(urlString, jsonobject, options)
            .toPromise()
            .then(() => timeSerie)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

    getCurrencies() {
        return this.odataCurrency
            .Query()
            .ExecWithCount();
    }

    getUnits() {
        return this.odataUnit
            .Query()
            .ExecWithCount();
    }

    deleteTimeSerie(timeSerie: TimeSerie): Promise<TimeSerie> {
        var urlString: string = "";
        urlString = this.timeSerieUrl + "(" + timeSerie.Id + ")";
        var options = { headers: this.headers };

        return this.http
            .delete(urlString
            , options)
            .toPromise()
            .then(() => timeSerie)
            .catch(this.handleError);
    }

    deleteTimeSerieValue(timeSerieValue: TimeSerieValue): Promise<TimeSerieValue> {
        var urlString: string = "";
        urlString = this.timeSerieValueUrl + "(" + timeSerieValue.Id + ")";
        var options = { headers: this.headers };

        return this.http
            .delete(urlString
            , options)
            .toPromise()
            .then(() => timeSerieValue)
            .catch(this.handleError);
    }
}