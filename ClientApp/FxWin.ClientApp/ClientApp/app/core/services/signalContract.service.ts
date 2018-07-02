import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import { Observable } from 'rxjs/Rx';

import { ODataService, ODataServiceFactory } from "angular-odata-es5";

import { AppConfiguration } from '../../app.configuration';

import { LinkFxContractSignalContract, PurchaseContract,SignalContractExclusion } from '../models/signalContract.model';
import { Contract } from '../models/contract.model';
import { SupplyContract } from '../models/SupplyContract.model';

@Injectable()

export class SignalContractService {

    private headers = new Headers({ 'Content-Type': 'application/json' });

    private signalContractPurchaseUrl;
    private signalContractSupplyUrl;

    private purchaseContractUrl;
    private supplyContractUrl;
    private fxContractUrl;
    private signalContractExclusionUrl;

    private fxContractSignalContractUrl;

    constructor(private http: Http, private odataFactory: ODataServiceFactory,private appConfig : AppConfiguration) {

        this.signalContractPurchaseUrl = appConfig.host + 'GetLinkFxContractSignalContractPurchase';
        this.signalContractSupplyUrl = appConfig.host + 'GetLinkFxContractSignalContractSale';

        this.purchaseContractUrl = appConfig.host + 'PurchaseContracts';
        this.supplyContractUrl = appConfig.host + 'SupplyContracts';
        this.fxContractUrl = appConfig.host + 'Contracts';
        this.signalContractExclusionUrl = appConfig.host + 'SignalContractExclusions';

        this.fxContractSignalContractUrl = appConfig.host + 'LinkFxContractSignalContracts';
    }

    getSignalContractsPurchase(): Observable<LinkFxContractSignalContract[]> {
        var url = this.signalContractPurchaseUrl;
        url += "?";
        url += "$expand=*";
        var res = this.http.get(url)
            .map(res => <LinkFxContractSignalContract[]>res.json().value);
        return res;
    }

    getSignalContractsSupply(): Observable<LinkFxContractSignalContract[]> {
        var url = this.signalContractSupplyUrl;
        url += "?";
        url += "$expand=*";
        var res = this.http.get(url)
            .map(res => <LinkFxContractSignalContract[]>res.json().value);
        return res;
    }

    getPurchaseContracts(): Observable<PurchaseContract[]> {
        var res = this.http.get(this.purchaseContractUrl)
            .map(res => <PurchaseContract[]>res.json().value);
        return res;
    }

    getSupplyContracts(): Observable<SupplyContract[]> {
        var res = this.http.get(this.supplyContractUrl)
            .map(res => <SupplyContract[]>res.json().value);
        return res;
    }

    getFxContracts(): Observable<Contract[]> {
        var res = this.http.get(this.fxContractUrl)
            .map(res => <Contract[]>res.json().value);
        return res;
    }

    getSignalContractExclusions(): Observable<SignalContractExclusion[]> {
        var url = this.signalContractExclusionUrl;
        url += "?";
        url += "$expand=*";
        var res = this.http.get(url)
            .map(res => <SignalContractExclusion[]>res.json().value);
        return res;
    }

    deleteFxContractSignalContract(fxContractSignalContract: LinkFxContractSignalContract): Promise<LinkFxContractSignalContract> {

        var urlString: string = "";

        urlString = this.fxContractSignalContractUrl + "(" + fxContractSignalContract.Id + ")";

        var options = { headers: this.headers };

        return this.http
            .delete(urlString
            , options)
            .toPromise()
            .then(() => fxContractSignalContract)
            .catch(this.handleError);
    }

    deleteSignalContractExclusion(signalContractExclusion: SignalContractExclusion): Promise<SignalContractExclusion> {

        var urlString: string = "";

        urlString = this.signalContractExclusionUrl + "(" + signalContractExclusion.Id + ")";

        var options = { headers: this.headers };

        return this.http
            .delete(urlString
            , options)
            .toPromise()
            .then(() => signalContractExclusion)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

    saveExclusion(signalContractExclusion: SignalContractExclusion): Promise<SignalContractExclusion> {

        var jsonobject = JSON.stringify(signalContractExclusion);
        var urlString = this.signalContractExclusionUrl + "(" + signalContractExclusion.Id + ")";
        var options = { headers: this.headers };

        return this.http
            .put(urlString, jsonobject, options)
            .toPromise()
            .then(() => signalContractExclusion)
            .catch(this.handleError);
    }

    saveSignalContract(signalContract: LinkFxContractSignalContract): Promise<LinkFxContractSignalContract> {
        var jsonobject = JSON.stringify(signalContract);
        var urlString = this.fxContractSignalContractUrl + "(" + signalContract.Id + ")";
        var options = { headers: this.headers };

        return this.http
            .put(urlString, jsonobject, options)
            .toPromise()
            .then(() => signalContract)
            .catch(this.handleError);
    }
}