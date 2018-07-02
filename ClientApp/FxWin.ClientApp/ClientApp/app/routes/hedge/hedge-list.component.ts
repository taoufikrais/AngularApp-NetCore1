import { Component,Directive, OnInit, AfterViewInit, ViewEncapsulation,TemplateRef,ViewChild,NgZone,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd, ParamMap } from '@angular/router';

import { GridOptions,GridApi,ColumnApi } from "ag-grid/main";

import { HedgeService } from '../../core/services/hedge.service';
//import { HedgeViewActionRendererComponent } from "./hedgeViewActionRenderer.component";

import { ODataPagedResult } from "angular-odata-es5";

import { FormatHelper } from '../../shared/helpers/formatHelper';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { HedgeDetailComponent } from './hedge-detail.component';

import * as moment from 'moment';
import * as $ from "jquery";
import 'ms-signalr-client';

import { SignalRService } from '../../core/services/signalR.service';
import { FileUploader, FileItem,FileLikeObject } from 'ng2-file-upload';
import { AppConfiguration } from '../../app.configuration';

import {
    HedgeView
    , Hedge
    , HedgeLeg
    , ExecutionFX
    , OperationSynthesis
    , SubjacentSynthesis
} from '../../core/models/hedge.model';
import { enumHedgeType, ViewOpenMode, enumPurchaseType, enumWorkFlowStatus, enumUserRole } from '../../core/models/enums';
import { Currency, PurchaseSale, InternalState, WorkflowState, Qualification, HedgeType, ManagementIntent, Book } from '../../core/models/typeCode.model';
import { User } from '../../core/models/user.model';

@Component({
    selector: 'hedge-list',
    templateUrl: './hedge-list.component.html',
    styleUrls: ['./hedge.component.scss'],

})
export class HedgelistComponent implements OnInit,AfterViewInit {
    enumUserRole: typeof enumUserRole = enumUserRole;
    private currentUser: User;
    private gridOptions: GridOptions;
    private gridApi: GridApi;
    private columnDefs;
    currentRouter;
    bsModalRef: BsModalRef;
    config = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: true
    };
    subscriptions: Subscription[] = [];
    maxFileSize = 10 * 1024 * 1024;
    allowedMimeType= ['text/plain', 'text/csv'];
    errorMessage:string ="";
    private isUploadBtn: boolean = true;  
    @ViewChild("modalImportKtp") modalImportKtp;
    private connection: any;
    private proxy:any;

    //private _hubConnection: HubConnection;
    public async: any;
    message = '';
    messages: string[] = [];
    public uploader: FileUploader= new FileUploader({
        isHTML5: true,
        method: "POST",
        itemAlias: "uploadedfile",
        removeAfterUpload:true,
        allowedMimeType: this.allowedMimeType ,// CSV File limitation
        headers: [{name:'Accept', value:'application/json'}],
        maxFileSize: this.maxFileSize,
    });
    public currentMessage: any;
    public allMessages: any;
    public canSendMessage: Boolean;
    private loading:boolean = false ;

    // constructor of the class to inject the service in the constuctor and call events.  
    constructor(private route: ActivatedRoute, private router: Router,
                private hedgeService: HedgeService, private modalService: BsModalService,
                private _ngZone: NgZone,private changeDetector: ChangeDetectorRef ,
                private appConfig: AppConfiguration
            )
    {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.currentRouter = this.router;
        this.forceRefreshSameRoute();
        this.defineGridOption();
    }


    initHubConnexion() {
        let host= this.appConfig.host.replace("api/","");
        this.connection = $.hubConnection(host);
        var proxy = this.connection.createHubProxy('progressHub');
        // receives broadcast messages from a hub function, called "broadcastMessage"
        proxy.on('SendMessage', (data: any) => {
            const received = `${data}`;
            this.messages.unshift(received);
        });
        proxy.on('SendRefreshData', (data: any) => {
            let receivedData = `${data}`;
            this.dataBindHedgeView();
        });
        proxy.on('WaitProcess', (data: any) => {
            const received = `${data}`;
            this.loading = true;
        });

        proxy.on('EndProcess', (data: any) => {
            const received = `${data}`;
            this.loading = false;
        });
        // atempt connection, and handle errors
        this.connection.start({ jsonp: true })
            .done(function () {
                 console.log('Now connected, connection ID=');
            } 
            )
            .fail( function () { 
                    console.log('Could not connect'); 
                    }
                );
    }
    private sub: any;
    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            let hedgeObject = params["h"];
            let hedgeId = +params['detailId']; 
            if (hedgeObject != null  ){
                let h = JSON.parse(hedgeObject);
                this.openModal(h,h.Id);
            }
            if (!isNaN(hedgeId) && hedgeId != null) {
                this.openModal(null, hedgeId);
            }
        });

        this.initHubConnexion();
        this.dataBindHedgeView();
    }


    ngAfterViewInit() {
        this.uploader.options.url = this.appConfig.host + "/Hedges/Default.ImportKtp";
        
        this.uploader.onAfterAddingFile = (fileitem => {
           fileitem.withCredentials = false;
           if(this.uploader.queue.length > 1 ){
                this.uploader.queue[0].remove();
            } 
        });
       
        this.uploader.onCompleteItem = (item:FileItem, response:any, status:any, headers:any) => {
            item.progress = 100;
            console.log(item._file.size);
            console.log("item uploaded" + response);
        };
        
        this.uploader.onProgressItem = (fileItem: FileItem, progress: any) => {
            this.changeDetector.detectChanges();
            console.log(fileItem);
            console.log(progress);
          };

        this.uploader.onWhenAddingFileFailed = (item, filter, options) => this.onWhenAddingFileFailed(item, filter, options);
     }
     
     onWhenAddingFileFailed(item: FileLikeObject, filter: any, options: any) {
        switch (filter.name) {
            case 'fileSize':
                this.errorMessage = `Maximum upload size exceeded (${item.size} of ${this.maxFileSize} allowed)`;
                break;
            case 'mimeType':
                const allowedTypes = this.allowedMimeType.join();
                this.errorMessage = `Type "${item.type} is not allowed. Allowed types: "${allowedTypes}"`;
                break;
            default:
                this.errorMessage = `Unknown error (filter is ${filter.name})`;
        }
    }
     
     selectedFileOnChanged(event:any) {
        let value = event.target.value;
            // if(this.uploader.queue.length > 1 ){
            //     this.uploader.queue[0].remove();
            // }
    }

    trackByFn(index, item) {
        return index;
    }

    upload(fileitem : FileItem)
    {
        this.messages=[];
        fileitem.upload();
    }

    public sendMessage(): void {
        const message  = `Sent: ${this.message}`;
        this.connection.server.SendToAll({ UserName: 'Taoufik : ', Message: message}).done(function () {
        console.log ('Invocation of NewContosoChatMessage succeeded');
        this.messages.push(message);
    }).fail(function (error) {
        console.log('Invocation of NewContosoChatMessage failed. Error: ' + error);
    });
        
    }

    doubleClick(row) {
        //row.context.componentParent.router.navigate(['/hedge/' + row.data.Id]);
        row.context.componentParent.openModal(null,row.data.Id);//this.modalTemplate,
    }


    onReady(params) {
        this.gridApi = params.api;
    }

    forceRefreshSameRoute() {
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        }
        this.router.events.subscribe((evt) => {
            if (evt instanceof NavigationEnd) {
                // trick the Router into believing it's last link wasn't previously loaded
                this.router.navigated = false;
                // if you need to scroll back to top, here is the right place
                window.scrollTo(0, 0);
            }
        });
    }

    refreshRow(rowNode, api) {
        var rowNodes = [rowNode];
        var params = {
            force: true,
            rowNodes: rowNodes
        };
    }

    refresh()
    {
        this.router.navigated = false;
        this.router.navigate(['/hedge']);
    }

    openModal(hedge:any, id) {
        //debugger;
        this.bsModalRef = this.modalService.show(HedgeDetailComponent,
            Object.assign({}, this.config, { class: 'gray modal-lg ' })
        );
        if(id > 0 ) 
        this.bsModalRef.content.title = "Edit Hedge Detail";
        else
        this.bsModalRef.content.title = "New Hedge Detail";

        this.bsModalRef.content.detailId = id;
        this.bsModalRef.content.hedge = hedge;
        const _combine = Observable.combineLatest(
            this.modalService.onShow,
            this.modalService.onShown,
            this.modalService.onHide,
            this.modalService.onHidden
          ).subscribe(() => this.changeDetector.markForCheck());

        this.subscriptions.push(
            this.modalService.onShown.subscribe((reason: string) => {
              console.log('onShown event has been fired poup charged');
            })
          );
    }

    defineGridOption() {
        this.gridOptions = <GridOptions>{

            columnDefs: this.setColumnDef(),
            //rowHeight: 34,
            virtualizationThreshold: 25,

            //pagination: true,
            //paginationPageSizes: [25, 50,100],
            //paginationPageSize: 25,
            //enablePagination: true,
            //enablePaginationControls: true,
            //suppressPaginationPanel:false,

            enableSorting: true,

            enableRowSelection: true,
            enableSelectAll: false,
            enableRowHeaderSelection: false,
            noUnselect: true,
            enableGridMenu: true,
            multiSelect: false,
            enableColResize: true,

            enableFilter: true,
            floatingFilter: true,

            rowStyle: { 'padding-top': '4px', 'padding-bottom': '4px' },

            onRowDoubleClicked: this.doubleClick,
            context: {
                componentParent: this
            },

            onCellFocused(e) {
                if (e.column) {
                    this.api.forEachNode(node => {
                        if (node.id == e.rowIndex)
                            node.setSelected(true, true);
                    })
                }
            },
            previousCellDef: this.setColumnDef(),
            nextCellDef: this.setColumnDef(),
        };
    }

    setColumnDef() {
        this.columnDefs = [
            {
                headerName: 'Hedge ID',
                field: 'Id',
                hide: true,
                cellRendererFramework: HedgeViewActionRendererComponent
            },
            {
                headerName: 'Code',
                field: 'Code'
            },
            {
                headerName: 'Execution Date',
                field: 'ExecutionDate',
                cellFormatter: function(params) {
                    return moment(params.value).format('DD/MM/YYYY');
                },
                //valueFormatter: FormatHelper.toShortDateFormat,
                //valueFormatter: moment().format('DD/MM/YYYY'),
                // cellRendererFramework: {
                //     template: '{{params.value | date:yyyy-MM-dd}}',
                //     moduleImports: [CommonModule]
                // },
                // cellRenderer(params) {
                //     return FormatHelper.toShortDateFormat(params.value);
                //     return moment(params.value).format('DD/MM/YYYY');
                // },
                filter: 'date',
                filterParams: {
                    comparator: function (filterLocalDateAtMidnight, cellValue) {
                        return FormatHelper.compareDate(filterLocalDateAtMidnight, cellValue);
                    }
                }
            },
            {
                headerName: 'Creation Date',
                field: 'CreationDate',

                cellRenderer(params) {
                    return FormatHelper.toShortDateFormat(params.value);
                },
                filter: 'date',
                filterParams: {
                    comparator: function (filterLocalDateAtMidnight, cellValue) {
                        return FormatHelper.compareDate(filterLocalDateAtMidnight, cellValue);
                    }
                }
            },
            {
                headerName: 'Creation User',
                field: 'CreationUser'
            },
            {
                headerName: 'Modification Date',
                field: 'ModificationDate',

                cellRenderer(params) {
                    return FormatHelper.toShortDateFormat(params.value);
                },
                filter: 'date',
                filterParams: {
                    comparator: function (filterLocalDateAtMidnight, cellValue) {
                        return FormatHelper.compareDate(filterLocalDateAtMidnight, cellValue);
                    }
                }
            },
            {
                headerName: 'Modification User',
                field: 'ModificationUser'
            },
            {
                headerName: 'Comment',
                field: 'Comment'
            },
            {
                headerName: 'Actarus',
                field: 'Actarus'
            },
            {
                headerName: 'Notice',
                field: 'Notice'
            },
            {
                headerName: 'Mosar Ref',
                field: 'MosarRef'
            },
            {
                headerName: 'Mosar 3rd Party',
                field: 'Mosar3rdParty',
            },
            {
                headerName: 'Currency',
                field: 'CurrencyCode',
            },
            {
                headerName: 'Hedge Type',
                field: 'HedgeTypeCode',
            },
            {
                headerName: 'Internal State',
                field: 'InternalStateCode',
            },
            {
                headerName: 'Management Intent',
                field: 'ManagementIntentCode',
            },
            {
                headerName: 'Qualification',
                field: 'QualificationCode',
            },
            {
                headerName: 'Workflow State',
                field: 'WorkflowStateCode'
            },
            {
                headerName: 'Call Expiration Date',
                field: 'CallExpirationDate',

                cellRenderer(params) {
                    return FormatHelper.toShortDateFormat(params.value);
                },
                filter: 'date',
                filterParams: {
                    comparator: function (filterLocalDateAtMidnight, cellValue) {
                        return FormatHelper.compareDate(filterLocalDateAtMidnight, cellValue);
                    }
                }
            },
            {
                headerName: 'Put Expiration Date',
                field: 'PutExpirationDate',

                cellRenderer(params) {
                    return FormatHelper.toShortDateFormat(params.value);
                },
                filter: 'date',
                filterParams: {
                    comparator: function (filterLocalDateAtMidnight, cellValue) {
                        return FormatHelper.compareDate(filterLocalDateAtMidnight, cellValue);
                    }
                }
            },
            {
                headerName: 'Call Amount',
                field: 'CallAmount',

                filter: 'number',
                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(params.value);
                }
            },
            {
                headerName: 'Put Amount',
                field: 'PutAmount',

                filter: 'number',
                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(params.value);
                }
            },
            {
                headerName: 'Call Underlying Code',
                field: 'CallUnderlyingCode',
            },
            {
                headerName: 'Put Underlying Code',
                field: 'PutUnderlyingCode',
            },
            {
                headerName: 'Buy Leg Contract',
                field: 'BuyLegContract',
            },
            {
                headerName: 'Sale Leg Contract',
                field: 'SaleLegContract',
            },
            {
                headerName: 'Buy Leg Underlying Month',
                field: 'BuyLegUnderlyingMonth',

                cellRenderer(params) {
                    return FormatHelper.toShortDateFormat(params.value);
                },
                filter: 'date',
                filterParams: {
                    comparator: function (filterLocalDateAtMidnight, cellValue) {
                        return FormatHelper.compareDate(filterLocalDateAtMidnight, cellValue);
                    }
                }
            },
            {
                headerName: 'Sale Leg Underlying Month',
                field: 'SaleLegUnderlyingMonth',

                cellRenderer(params) {
                    return FormatHelper.toShortDateFormat(params.value);
                },
                filter: 'date',
                filterParams: {
                    comparator: function (filterLocalDateAtMidnight, cellValue) {
                        return FormatHelper.compareDate(filterLocalDateAtMidnight, cellValue);
                    }
                }
            },
            {
                headerName: 'Buy Leg Multiple Cargoes',
                field: 'BuyLegMultipleCargoes',

                filter: 'number',
                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(params.value);
                }
            },
            {
                headerName: 'Sale Leg Multiple Cargoes',
                field: 'SaleLegMultipleCargoes',

                filter: 'number',
                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(params.value);
                }
            },
            {
                headerName: 'Buy Leg Cargo Code',
                field: 'BuyLegCargoCode',
            },
            {
                headerName: 'Sale Leg Cargo Code',
                field: 'SaleLegCargoCode',
            },
            {
                headerName: 'Buy Leg Initiale Commo Hedge',
                field: 'BuyLegInitialeCommoHedge',
            },
            {
                headerName: 'Sale Leg Initiale Commo Hedge',
                field: 'SaleLegInitialeCommoHedge',
            },
            {
                headerName: 'Buy Leg Finale Commo Hedge',
                field: 'BuyLegFinaleCommoHedge',
            },
            {
                headerName: 'Sale Leg Finale Commo Hedge',
                field: 'SaleLegFinaleCommoHedge',
            }
        ];
        return this.columnDefs;
    }

    exportgridData() {
        var params = {
            suppressQuotes: true,
            fileName: "HedgeList",
            columnSeparator:";"
          };
        this.gridApi.exportDataAsCsv(params);
    }

    async dataBindHedgeView() {
        this.hedgeService.getHedgeViews()
            .subscribe((pagedResult: ODataPagedResult<HedgeView>) => {
                this.gridOptions.api.setRowData(pagedResult.data);
                this.autoSizeGridColumns();
            });
    }

    autoSizeGridColumns() {
        var allColumnIds = [];
        this.columnDefs.forEach(function (columnDef) {
            allColumnIds.push(columnDef.field);
        });
        this.gridOptions.columnApi.autoSizeColumns(allColumnIds);
    }

    onFilterChanged(event) {
        var values = (<HTMLInputElement>event.target).value;
        this.gridOptions.api.setQuickFilter(values);
    }
   
    openPopUp(template: TemplateRef<any>) {
        this.bsModalRef = this.modalService.show(
            template,
            Object.assign({}, this.config, { class: 'gray modal-md' })
        );
    }

    closeModaltemplate(template: TemplateRef<any>) {
        if (this.bsModalRef.content !== undefined) {
            this.bsModalRef.hide();
        }
    }

    openModalImportKtp(){
        this.uploader.clearQueue();
        this.messages=[];
        this.openPopUp(this.modalImportKtp);
    }

    closeModalImportKtp(){
        this.closeModaltemplate(this.modalImportKtp);
    }

    addHedge() {
        //this.router.navigate([ '/cargo/cargoDetail/' + null]);
        let hedge$ = this.initHedge();
        this.openModal(hedge$,0);//this.modalTemplate,
    }

    
    initHedge() : Hedge{
  
        let hedge=  new Hedge();

        hedge.Id = 0;
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        hedge.CreationUser = currentUser.UserGaia;
        hedge.CreationDate = moment().toDate();
      

        let exe=  new ExecutionFX();
        hedge.ExecutionFXes=[];

        hedge.WorkflowState= new WorkflowState();
        hedge.WorkflowState.Code = enumWorkFlowStatus[enumWorkFlowStatus.BROUILLON];
        hedge.WorkflowState.Id = enumWorkFlowStatus.BROUILLON;

        hedge.HedgeType = new HedgeType();
        hedge.HedgeTypeId = enumHedgeType.Swap;
        hedge.HedgeType.Id = enumHedgeType.Swap;
        hedge.HedgeType.Code = enumHedgeType[enumHedgeType.Swap];
        hedge.HedgeLegs = []  =[new HedgeLeg(enumPurchaseType.Achat),new HedgeLeg(enumPurchaseType.Vente)];;
        //this.agExecutionApi.setRowData(hedge.HedgeLegs ), err => { console.log(err) };

        return hedge;
    }

    // fileChange(event) {
    //     let fileList: FileList = event.target.files;  
    //     if (fileList.length > 0)
    //     {  
    //        let file: File = fileList[0];  
    //        let formData: FormData = new FormData();  
    //        formData.append('uploadFile', file, file.name);
    //        this.hedgeService.importKtpFile(formData)
    //         .subscribe(data => {
    //                    window.location.reload(); 
    //                    console.log('success');  
    //                   error => console.log(error)  
    //             } 
    //          );
    //     } 
    // }


}

@Component({
    template: '<a routerLink="/hedge/{{params.value}}">{{params.data.Id }}</a>'
})
export class HedgeViewActionRendererComponent {

    private params: any;

    agInit(params: any): void {
        this.params = params;
    }
}




