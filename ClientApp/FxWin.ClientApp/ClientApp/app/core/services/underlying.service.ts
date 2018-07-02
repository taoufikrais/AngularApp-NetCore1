import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { Observable } from 'rxjs/Rx';

import { SubjacentView, Subjacent, UnderlyingTerm } from '../models/underlying.model';
import { HedgeLeg } from '../models/hedge.model';

import { ODataService, ODataServiceFactory } from "angular-odata-es5";
import { AppConfiguration } from '../../app.configuration';
import { ContractType, SubjacentType, Book } from '../models/typeCode.model';

import * as moment from 'moment';

import { Currency } from '../models/typeCode.model';

@Injectable()

export class UnderlyingService {
    private headers = new Headers({ 'Content-Type': 'application/json' });
    private subjacentUrl;
    private hedgeLegsUrl;
    private UnderlyingTermsUrl;
    private odataSubjacentType: ODataService<SubjacentType>;
    private odataContractType: ODataService<ContractType>;
    private odataBook: ODataService<Book>;
    private odataCurrency: ODataService<Currency>;

    constructor(private http: Http, private odataFactory: ODataServiceFactory, private appConfig: AppConfiguration) {
        this.hedgeLegsUrl = appConfig.host + 'HedgeLegs';
        this.subjacentUrl = appConfig.host + 'Subjacents';
        this.UnderlyingTermsUrl = appConfig.host + 'UnderlyingTerms';

        this.odataSubjacentType = this.odataFactory.CreateService<SubjacentType>('SubjacentTypes');
        this.odataContractType = this.odataFactory.CreateService<ContractType>('ContractTypes');
        this.odataBook = this.odataFactory.CreateService<Book>('Books');
        this.odataCurrency = this.odataFactory.CreateService<Currency>('Currencies');
    }

    // getSubjacentViews() {
    //     return this.odataUnderlyingView
    //         .Query()
    //         .ExecWithCount();
    // }

    getSubjacentViews(): Observable<SubjacentView[]> {
        var url = this.subjacentUrl + "/Default.GetSubjacentViews";
        var res = this.http.get(url)
            .map(res => res.json().value);
        return res;
    }

    getSubjacent(id: number): Observable<Subjacent> {
        var url = this.subjacentUrl + '(' + id + ')';
        url += "?";
        url += "$expand=SubjacentType, ContractType, Book, UnderlyingTerms($expand=Currency,HedgeLegs,CommodityHedges)";
        var res = this.http.get(url)
            .map(res => <Subjacent>res.json());
        return res;
    }

    getSubjacentTypes() {
        return this.odataSubjacentType
            .Query()
            .ExecWithCount();
    }

    getContractTypes() {
        return this.odataContractType
            .Query()
            .ExecWithCount();
    }

    getBooks() {
        return this.odataBook
            .Query()
            .ExecWithCount();
    }

    getHedgeLegs(underlyingTermId: number): Observable<HedgeLeg[]> {
        var url = this.hedgeLegsUrl;
        url += "?";
        url += "$filter=UnderlyingTermId eq " + underlyingTermId;
        url += "&";
        url += "$expand=FxContract,FXHedge($expand=WorkflowState),PurchaseSale";

        var res = this.http.get(url)
            .map(res => <HedgeLeg[]>res.json().value);
        return res;
    }

    save(subjacent: Subjacent): Promise<Subjacent> {

        var jsonobject = JSON.stringify(subjacent);
        var urlString = this.subjacentUrl + "(" + subjacent.Id + ")";
        var options = { headers: this.headers };

        return this.http
            .put(urlString, jsonobject, options)
            .toPromise()
            .then(() => subjacent)
            .catch(this.handleError);
    }

    handleError(error: any): Promise<any> {
        //console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

    setToJsonConfig() {
        Date.prototype.toJSON = function () {
            return moment(this).format('YYYY-MM-DD');
        }
    }

    getCurrencies() {
        return this.odataCurrency
            .Query()
            .ExecWithCount();
    }

    deleteUnderlyingTerm(underlyingTerm: UnderlyingTerm) {
        var urlString = this.UnderlyingTermsUrl + "(" + underlyingTerm.Id + ")";
        var options = { headers: this.headers };

        return this.http
            .delete(urlString
            , options)
            .toPromise();
    }

    deleteSubjacent(subjacentView: SubjacentView) {
        var urlString = this.subjacentUrl + "(" + subjacentView.Id + ")";
        var options = { headers: this.headers };

        return this.http
            .delete(urlString
            , options)
            .toPromise();
    }
}