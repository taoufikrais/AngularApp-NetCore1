import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import { Observable } from 'rxjs/Rx';

import { ODataService, ODataServiceFactory } from "angular-odata-es5";

import { VW_LinkFxContractSignalContract, Contract } from '../models/contract.model';
import { AppConfiguration } from '../../app.configuration';
import { ContractType, Incoterm, Currency, Book } from '../models/typeCode.model';

@Injectable()

export class ContractService {

    private headers = new Headers({ 'Content-Type': 'application/json' });
    private odataContract: ODataService<Contract>;
    private odataContractType: ODataService<ContractType>;
    private odataIncoterm: ODataService<Incoterm>;
    private signalContractUrl;
    private contractUrl;
    private odataCurrency: ODataService<Currency>;
    private odataBook: ODataService<Book>;

    constructor(private http: Http, private odataFactory: ODataServiceFactory, private appConfig: AppConfiguration) {
        this.contractUrl = appConfig.host + 'Contracts';
        this.signalContractUrl = this.contractUrl + '/Default.GetAssociatedSignalContracts';
        this.odataContract = this.odataFactory.CreateService<Contract>('Contracts');
        this.odataContractType = this.odataFactory.CreateService<ContractType>('ContractTypes');
        this.odataIncoterm = this.odataFactory.CreateService<Incoterm>('Incoterms');
        this.odataCurrency = this.odataFactory.CreateService<Currency>('Currencies');
        this.odataBook = this.odataFactory.CreateService<Book>('Books');
    }

    getContracts(): Observable<Contract[]> {
        var url = this.contractUrl;
        url += "?";
        url += "$expand=*";
        var res = this.http.get(url)
            .map(res => <Contract[]>res.json().value);
        return res;
    }

    getAssociatedSignalContracts(fxContractId: number): Observable<VW_LinkFxContractSignalContract[]> {
        var url = this.signalContractUrl;
        url += "?";
        url += "id=" + fxContractId;
        var res = this.http.get(url)
            .map(res => <VW_LinkFxContractSignalContract[]>res.json().value);
        return res;
    }

    getContract(id: number): Observable<Contract> {
        var url = this.contractUrl + '(' + id + ')';
        url += "?";
        url += "$expand=*";
        var res = this.http.get(url)
            .map(res => <Contract>res.json());
        return res;
    }

    getContractTypes() {
        return this.odataContractType
            .Query()
            .ExecWithCount();
    }

    getIncoterms() {
        return this.odataIncoterm
            .Query()
            .ExecWithCount();
    }

    getCurrencies() {
        return this.odataCurrency
            .Query()
            .ExecWithCount();
    }

    getBooks() {
        return this.odataBook
            .Query()
            .ExecWithCount();
    }

    save(contract: Contract): Promise<Contract> {

        var jsonobject = JSON.stringify(contract);
        var urlString = this.contractUrl + "(" + contract.Id + ")";
        var options = { headers: this.headers };

        return this.http
            .put(urlString, jsonobject, options)
            .toPromise()
            .then(() => contract)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        //console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

    delete(contract: Contract): Promise<Contract> {

        var urlString: string = "";

        urlString = this.contractUrl + "(" + contract.Id + ")";

        var options = { headers: this.headers };

        return this.http
            .delete(urlString
            , options)
            .toPromise()
            .then(() => contract)
            .catch(this.handleError);
    }
}