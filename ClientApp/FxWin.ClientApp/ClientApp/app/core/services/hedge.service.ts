import { Injectable } from '@angular/core';
import { AppConfiguration } from '../../app.configuration';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ODataService, ODataServiceFactory } from "angular-odata-es5";
import {
    HedgeView
    , Hedge
    , HedgeLeg
    , ExecutionFX
    , OperationSynthesis
    , SubjacentSynthesis
    
} from '../models/hedge.model';
import { Operation} from '../models/operation.model';
import { StaticData,Currency, InternalState, WorkflowState, Qualification, PurchaseSale,HedgeType,ManagementIntent, Book} from '../models/typeCode.model';
import { Contract } from '../models/contract.model';
import { forEach } from '@angular/router/src/utils/collection';
import * as moment from 'moment';
import { FormatHelper } from '../../shared/helpers/formatHelper';

@Injectable()

export class HedgeService {
    private purchaseSalesUrl;
    private hedgeUrl;
    private underlyingTermUrl;
    private hedgeLegUrl;
    private operationUrl;
    private headers;
    private odataHedgeView: ODataService<HedgeView>;
    private odataCurrency: ODataService<Currency>;
    private odataInternalState: ODataService<InternalState>;
    private odataWorkflowState: ODataService<WorkflowState>;
    private odataQualification: ODataService<Qualification>;
    private odataContract: ODataService<Contract>;
    private odataOperation: ODataService<Contract>;
    private odataHedgeTypes: ODataService<HedgeType>;
    private odataManagementIntents: ODataService<ManagementIntent>;
    private odataBooks : ODataService<Book>;

    static alphabeticalSort() {
        return (a: StaticData, b: StaticData) => 
            a.Code.localeCompare(b.Code);
        
    }

    constructor(private http: Http, private odataFactory: ODataServiceFactory, private appConfig: AppConfiguration) {
        //this.setToJsonConfig();
        //debugger;
        this.headers = new Headers({ 'Content-Type': 'application/json' });
        this.purchaseSalesUrl = appConfig.host + 'PurchaseSales';
        this.hedgeUrl = appConfig.host + 'Hedges';
        this.hedgeLegUrl = appConfig.host + 'HedgeLegs';
        this.operationUrl = appConfig.host+ 'Operations';
        this.underlyingTermUrl= appConfig.host+ 'UnderlyingTerms';
        this.odataHedgeView = this.odataFactory.CreateService<HedgeView>('Hedges/Default.GetHedgeViews');
        this.odataCurrency = this.odataFactory.CreateService<Currency>('Currencies');
        this.odataInternalState = this.odataFactory.CreateService<InternalState>('InternalStates');
        this.odataWorkflowState = this.odataFactory.CreateService<WorkflowState>('WorkflowStates');
        this.odataQualification = this.odataFactory.CreateService<Qualification>('Qualifications');
        this.odataContract = this.odataFactory.CreateService<Contract>('Contracts');
        this.odataHedgeTypes = this.odataFactory.CreateService<HedgeType>('HedgeTypes');
        this.odataManagementIntents=  this.odataFactory.CreateService<ManagementIntent>('ManagementIntents');
        this.odataBooks =  this.odataFactory.CreateService<Book>('Books');
    }
    

    setToJsonConfig() {
        Date.prototype.toJSON = function () {
             return moment(this).format('DD/MM/YYYY');
        }
    }
    
    getHedge(id: number): Observable<Hedge> {
        var url = this.hedgeUrl + '(' + id + ')';
        url += "?";
        url += "$expand=Currency,HedgeType,InternalState,Qualification,WorkflowState";
        url += ",ManagementIntent($expand=Qualification)";
        url += ",ExecutionFXes($expand=PurchaseSale,Currency,Currency1)";
        url += ",HedgeLegs($expand=FxContract($expand=Book),Operation($expand=Cargo($expand=CargoState)),LinkLegHedgeCommoHedges($expand=CommodityHedge,HedgeCommoMaturity,LinkType,PurchaseSale))";
        var res = this.http.get(url)
           .map(res => <Hedge>res.json());
           //.map(this.extractHedge);//si on converte le datetime string de l'objet json en a un objet dateTime javacript sa cree un problem sur le post 
        return res;
    }
 
    extractHedge(res: Response) {
        debugger;
        var data = res.json();
        FormatHelper.fnConverDate(data);
        //FormatHelper.Deserialize(data);

        //data.forEach((d) => {
        //    debugger;
        //    console.log(d.Maturity);
        //});
             //debugger;
             //console.log(data.Maturity);
             //console.log(data.UnderlyingMonth);
  
        return <Hedge>data;
    }
   
    getHedgeCodeOccurence(code: string,maxlength:number): Observable<number> {
        //var url = this.hedgeUrl + "/Default.GetHedgeCodeOccurence" + "(" + "code ='" + code + "'" + ",maxlength=" + maxlength + ")";
        var url = this.hedgeUrl + "/Default.GetHedgeCodeOccurence?" +"code=" + code + "&maxlength=" + maxlength;
        var res = this.http.get(url)
            .map(res => parseInt(res.json().value));
        return res;
    }

    async isUniqueOrderNumber(code: string): Promise<boolean> {
        try {
            //var url = this.hedgeUrl + "/Default.GetHedgeCodeOccurence" + "(" + "code ='" + code + "'" + ",maxlength=" + 0 + ")";
            var url = this.hedgeUrl + "/Default.GetHedgeCodeOccurence?" + "code=" + code;
            let res = await this.http.get(url).toPromise();
            return parseInt(res.json().value) == 0 ;
        } catch (error) {
            await this.handleError(error);
        }
    }

 

    getHedgeViews() {
        return this.odataHedgeView
            .Query()
            .ExecWithCount();
    }

    getCurrencies() {
        return this.odataCurrency
            .Query()
            .ExecWithCount();
    }

    getInternalStates() {
        return this.odataInternalState
            .Query()
            .ExecWithCount();
    }

    getWorkflowStates() {
        return this.odataWorkflowState
            .Query()
            .ExecWithCount();
    }

    getQualifications() {
        return this.odataQualification
            .Query()
            .ExecWithCount();
    }

    getContracts() {
        return this.odataContract
            .Query()
            .Expand("Book")
            .ExecWithCount();
    }

    getHedgeTypes() {
        return this.odataHedgeTypes
            .Query()
            .ExecWithCount();
    }

    getManagementIntents() {
        return this.odataManagementIntents
            .Query()
            .Expand("Qualification")
            .Exec();
    }

    
    getBooks() {
        return this.odataBooks
            .Query()
            .ExecWithCount();
    }

    
    getContract(id: number): Observable<Contract> {
       return this.odataContract
                  .Get(id)
                  .Expand("ContractType")
                  .Expand("Book")
                  .Exec()
    }

    getPurchaseSale(): Observable<PurchaseSale[]> { //Promise
        var res = this.http.get(this.purchaseSalesUrl)
            .map((res: Response) => <PurchaseSale[]>res.json())
            .catch(this.handleError);
        return res;
        //return this.http.get(this.purchaseSalesUrl)
        //    .toPromise()
        //    .then(response => <PurchaseSale[]>response.json().data);
    }

    getHedgeLeg(url:string): Observable<HedgeLeg> {
        var res = this.http.get(url)
            //.map(res => <HedgeLeg>res.json().value[0]);//JSON.parse
            //.map(res => <HedgeLeg>FormatHelper.fnConverDate(res.json().value[0]))
             .map(this.extractData)
            ;  
           
        return res;
    }

    extractData(res: Response) {
        var data = res.json().value[0];
        //FormatHelper.fnConverDate(data);
        //data.forEach((d) => {
        //    debugger;
        //    console.log(d.Maturity);
        //});
             //debugger;
             //console.log(data.Maturity);
             //console.log(data.UnderlyingMonth);
             
        return <HedgeLeg>data;
    }

    composeUrl(hedgeId: number, purchaseSaleId: number) {
        var url = this.hedgeLegUrl;
        url += "?";
        url += "$filter=FXHedge / Id eq " + hedgeId;
        url += " and ";
        url += "PurchaseSaleId eq " + purchaseSaleId;
        url += "&";
        url += "$expand=FxContract";
        return url;
    }
   
    getOperationSynthesises(contractId: number, contractTypeId: number, yearUnderlyingMonth: number, monthUnderlyingMonth?: number):Observable<OperationSynthesis[]> {
        var url = this.operationUrl + "/Default.GetOperationSynthesises?";
        url += "contractId=" + contractId;
        url += "&contractTypeId=" + contractTypeId;
        var filter$ = "&$filter=year(Operationdate) eq "+ yearUnderlyingMonth;
        if(monthUnderlyingMonth)
         filter$ += " and month(Operationdate) eq " + monthUnderlyingMonth ;
        let orderby$="&$orderby=Operationdate"
        url += filter$ + orderby$;
        var res = this.http.get(url)
            .map(res => <OperationSynthesis[]>res.json().value);

        return res;
    }

    getUnderlyingSynthesisByMaturity(date: Date):Observable<SubjacentSynthesis[]> {
        var url = this.underlyingTermUrl + "/Default.GetUnderlyingSynthesisByMaturity?";
        url += "date=" + moment(date).toISOString();
        var res = this.http.get(url)
            .map(res => <SubjacentSynthesis[]>res.json().value);

        return res;
    }

    getOperationSynthesisesByOperation(contractId: number, contractTypeId: number ,operationId: number): Observable<OperationSynthesis> {
        var url = this.operationUrl + "/Default.GetOperationSynthesises?";
        url += "contractId=" + contractId;
        url += "&contractTypeId=" + contractTypeId;
        var filter$ = "&$filter=OperationId eq "+ operationId;
        url += filter$;
        var res = this.http.get(url)
            .map(res => <OperationSynthesis>res.json().value);

        return res;
    }

    getOperation(id: number): Observable<Operation> {
        var url = this.operationUrl + '(' + id + ')?';
        let expand$= "$expand=Cargo($expand=CargoState)";
        let format$="&$format=application/json;odata.metadata=none"
        url += expand$ + format$;
        var res = this.http.get(url)
            .map(res => <Operation>res.json());
        return res;
    }

    //Update with Put   http://localhost:60257/api/Cargos/1 web api classic
    //Update with odata protocol PUT http://localhost:60257/api/Cargos(1)
    //Update with post http://localhost:60257/api/Cargos
    save(hedge: Hedge): Promise<Hedge> {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        hedge.HedgeLegs.forEach(currentleg => {
            if(currentleg.Id > 0 )
            {
                currentleg.ModificationUser = currentUser.UserGaia;
                currentleg.ModificationDate = moment().toDate();
            }else{
                currentleg.CreationUser = currentUser.UserGaia;
                currentleg.CreationDate = moment().toDate();
            }
            //delete view property
            delete currentleg.SignalContract ;
            delete currentleg.Subjacent;
            delete currentleg.UnderlyingMaturity;
            delete currentleg.UnderlyingAmount;
        });
        var urlString: string = "";
        if(hedge.Id > 0 )
        {
            hedge.ModificationUser = currentUser.UserGaia;
            hedge.ModificationDate = moment().toDate();
        }else{
            hedge.CreationUser = currentUser.UserGaia;
            hedge.CreationDate = moment().toDate();
        }
        //const urlString = this.cargoUrl + "/"+ cargo.Id;
        urlString = this.hedgeUrl + "(" + hedge.Id + ")";
        //put(url , body , Options)==>return observable<response>
        //dans body on envoie l'objet parametre cargo a sauvgarder
        var options = { headers: this.headers };
        return this.http
            .put(urlString,JSON.stringify(hedge),options)
            .toPromise()
            .then(() => hedge)
            .catch(this.handleError);
    }


    importKtpFile(formData:any)
    {
        let headers = new Headers()  
        let options = new RequestOptions({ headers: headers });  
        let apiUrl1 = this.hedgeUrl + '/Default.ImportKtp()';
        return this.http.post(apiUrl1, formData, options)  
        .map(res => res.json())  
        .catch(error => Observable.throw(error))  
    }

    
    getInitialFxHedgeCA(operationId: number): Promise<Hedge> {
        var urlString = this.hedgeUrl;
        urlString += "/Default.GetInitialFxHedgeCA"
        urlString += "(operationId=" + operationId + ")";
        urlString += "?$expand=HedgeLegs($expand=FxContract),WorkflowState,ManagementIntent($expand=Qualification),HedgeType,Currency,InternalState,ExecutionFXes";

        var options = { headers: this.headers };

        return this.http
            .get(urlString, options)
            .toPromise()
            .then(response => response.json() as Hedge)
            .catch(this.handleError);
    }

    getInitialFxHedgeRB(operationId: number): Promise<Hedge> {
        var urlString = this.hedgeUrl;
        urlString += "/Default.GetInitialFxHedgeRB"
        urlString += "(operationId=" + operationId + ")";
        urlString += "?$expand=HedgeLegs($expand=FxContract),WorkflowState,ManagementIntent($expand=Qualification),HedgeType,Currency,InternalState,ExecutionFXes";

        var options = { headers: this.headers };

        return this.http
            .get(urlString, options)
            .toPromise()
            .then(response => response.json() as Hedge)
            .catch(this.handleError);
    } 

    handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}