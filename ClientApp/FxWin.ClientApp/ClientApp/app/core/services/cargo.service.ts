import { Component, OnInit, OnDestroy, Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Headers, Http, Response, RequestOptions } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

import { Observable } from 'rxjs/Rx';

import { Cargo, VW_CargoView } from '../models/cargo.model';
import { Contract } from '../models/contract.model';
import { CargoState, Currency, InternalState } from '../models/typeCode.model';
import { Operation } from '../models/operation.model';
import { HedgeLeg } from '../models/hedge.model';
import { CommodityHedge } from '../models/commodityHedge.model';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ODataConfiguration, ODataServiceFactory, ODataService, ODataQuery, ODataPagedResult } from "angular-odata-es5";

import { Logger } from './logger.service';
import { AppConfiguration } from '../../app.configuration';

import * as moment from 'moment';
import { User } from '../models/user.model';

@Injectable()

export class CargoService {
    private headers = new Headers({ 'Content-Type': 'application/json' });
    private cargoUrl;//= myGlobals.baseAdresse + 'Cargos';
    public odataCargo: ODataService<CargoState>;
    public odataCargoState: ODataService<CargoState>;
    public odataInternalState: ODataService<InternalState>;
    private odataCurrency: ODataService<Currency>;
    private operationsUrl;
    private hedgeLegsUrl;
    private commodityHedgesUrl;

    // Resolve HTTP using the constructor
    constructor(private http: Http,
        private logger: Logger,
        private odataFactory: ODataServiceFactory,
        private appConfig: AppConfiguration
    ) {
        this.hedgeLegsUrl = appConfig.host + 'HedgeLegs';
        this.commodityHedgesUrl = appConfig.host + 'CommodityHedges';
        this.cargoUrl = appConfig.host + 'Cargos';
        this.odataCargo = this.odataFactory.CreateService<Cargo>('Cargos');
        this.odataCargoState = this.odataFactory.CreateService<CargoState>('CargoStates');
        this.odataInternalState = this.odataFactory.CreateService<InternalState>('InternalStates');
        this.odataCurrency = this.odataFactory.CreateService<Currency>('Currencies');
        this.operationsUrl = appConfig.host + 'Operations';
    }

    getObservableCargos(): Observable<Cargo[]> {
        var res = this.http.get(this.cargoUrl)
            .map((res: Response) => res.json().value);//classic web api remove .value (# different from odata web api)
        return res;
    }

    getCargosOdataApi() {
        return this.odataCargo
            .Query()
            //.Top(25)
            //.Filter("startswith(Code,'C.14')")
            .Expand('CargoState')
            .OrderBy("CreationDate desc")
            .ExecWithCount(); // retrun un objet  ODataPagedResult<Cargo> [data , count item], //si EnableQuery(PageSize = 20 , tu peux pas appler la methode ExecWithCount,car tu pagine le resultat du odata webapi tu aura une errur 400 (Bad Request)
    }

    getCargos(): Observable<VW_CargoView[]> {
        var urlString = this.cargoUrl + "/Default.GetListVW_CargoView()";
        var res = this.http.get(urlString)
            //.map(res => <VW_CargoView[]>res.json().value);
            .map(this.extractData);
        return res;
    }

    extractData(res: Response) {
        var data = res.json().value || [];
        //var data = JSON.parse(res.json());
        //data.forEach((d) => {
        //    d.PurchaseOperationDate = moment(d.PurchaseOperationDate).todate().toLocaleDateString('fr-FR');
        //});
        return <VW_CargoView[]>data;
    }

    getCargo(id): Observable<Cargo> {
        //le module angular-odata-es5 est limité il permet pas de requetté les sous entité 
        //return this.odataCargo.Get(id)
        //    .Select("*")
        //    .Expand("CargoState,Operations")
        //    .Exec();

        var urlString = this.cargoUrl + "(" + id + ")";
        urlString += "?";
        urlString += "$expand=CargoState";
        urlString += ",Operations($expand=InternalState,Currency,Cargo($expand=CargoState),Port,PurchaseContract,PurchaseSale,SupplyContract,OperationType($orderby=Id asc);$orderby=OperationDate asc;$filter=Cargo ne null)";
        var res = this.http.get(urlString)
            .map(res => <Cargo>res.json());
        return res;
    }

    getCargosStates() {
        return this.odataCargoState
            .Query()
            .ExecWithCount();
    }

    getInternalStates() {
        return this.odataInternalState
            .Query()
            .ExecWithCount();
    }

    post(cargo) {
        return this.http.post(this.cargoUrl, cargo)
            .map((res: Response) => res.json());
    }

    delete(id) {
        return this.http.get(this.cargoUrl)
            .map((res: Response) => res.json());
    }

    //Update with Put   http://localhost:60257/api/Cargos/1 web api classic
    //Update with odata protocol PUT http://localhost:60257/api/Cargos(1)
    //Update with post http://localhost:60257/api/Cargos
    save(cargo: Cargo): Promise<Cargo> {
        var urlString: string = "";
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        //Date.prototype.toJSON = function () { return moment(this).format('YYYY-MM-DD'); }
        this.setToJsonConfig();
        if(cargo.Id > 0 )
        {
           cargo.ModificationUser = currentUser.UserGaia;
           cargo.ModificationDate = moment().toDate();
        }else{
            cargo.CreationUser = currentUser.UserGaia;
            cargo.CreationDate = moment().toDate();
        }

        var jsonobject = JSON.stringify(cargo);
        urlString = this.cargoUrl + "(" + cargo.Id + ")";
        
        currentUser.token = currentUser.UserGaia;
        this.headers.delete('Authorization');
        this.headers.append('Authorization', atob(currentUser.token) )// atob serialize base-64
        let options = new RequestOptions({headers: this.headers});
        //let options = { headers: this.headers };
        return this.http
            .put(urlString, jsonobject, options)
            .toPromise()
            .then(() => cargo)
            .catch(this.handleError);
    }

    
    importSignal(signalRequest:any) : Promise<boolean> 
    {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.headers.delete('Authorization');
        this.headers.append('Authorization', currentUser.Name + " " + currentUser.Surname)// atob serialize base-64
        let options = new RequestOptions({headers: this.headers});

        if (signalRequest.operationsInternes == undefined || signalRequest.operationsInternes == "") {
            signalRequest.operationsInternes = "NON";
        }
        var url = this.cargoUrl + "/Default.ImportSignal" 
          + "?" 
          +    "programCode=" + signalRequest.programCode
          +    "&startDate=" + moment(signalRequest.startDate).toISOString()
          +    "&endDate=" + moment(signalRequest.endDate).toISOString()
          +    "&operationsInternes=" + signalRequest.operationsInternes
        return this.http.post(url, options)
        .toPromise()
        .then(() => true)
        //.catch(error => Observable.throw(error))  

    }

    handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
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

    deleteOperation(operation: Operation) {
        var urlString = this.operationsUrl + "(" + operation.Id + ")";
        var options = { headers: this.headers };

        return this.http
            .delete(urlString
            , options)
            .toPromise();
    }

    getHedgeLegs(operationId: number): Observable<HedgeLeg[]> {
        var url = this.hedgeLegsUrl;
        url += "?";
        url += "$filter=OperationId eq " + operationId;
        url += "&";
        url += "$expand=FXHedge($expand=InternalState),PurchaseSale";

        var res = this.http.get(url)
            .map(res => <HedgeLeg[]>res.json().value);

        return res;
    }

    getCommoHedges(operationId: number): Observable<CommodityHedge[]> {
        var url = this.commodityHedgesUrl;
        url += "?";
        url += "$filter=OperationId eq " + operationId;
        url += "&";
        url += "$expand=InternalState,PurchaseSale";

        var res = this.http.get(url)
            .map(res => <CommodityHedge[]>res.json().value);

        return res;
    }

    getAssociatedFxContractByOperationId(id: number): Promise<Contract> {
        var urlString = this.cargoUrl;
        urlString += "/Default.GetAssociatedFxContractByOperationId"
        urlString += "(id = " + id + ")";

        var options = { headers: this.headers };

        return this.http
            .get(urlString, options)
            .toPromise()
            .then(response => response.json() as Contract)
            .catch(this.handleError);
    }
} 