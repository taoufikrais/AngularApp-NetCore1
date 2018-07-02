import { Component, OnInit, OnDestroy, AfterViewInit, ViewContainerRef, ViewChild, TemplateRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, NgForm } from '@angular/forms';
//Import the Router, ActivatedRoute, and ParamMap tokens from the router package.
import { RouterModule, Router, ActivatedRoute, ParamMap, NavigationEnd } from '@angular/router';
//Import the switchMap operator because you need it later to process the Observable route parameters.
import 'rxjs/add/operator/switchMap';

import { Observable } from 'rxjs/Observable';
// ag-grid
import { ColumnApi, GridApi, GridOptions } from "ag-grid/main";

import { Http } from '@angular/http';
import * as _ from 'lodash';

import { CargoService } from '../../core/services/cargo.service';
import { Cargo, VW_CargoView } from '../../core/models/cargo.model';

import { FormatHelper } from '../../shared/helpers/formatHelper';


import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { CargoDetailComponent, BoValidationRenderer } from './cargo-detail.component';

import { ICellEditorAngularComp, ICellRendererAngularComp } from "ag-grid-angular";
import * as moment from 'moment';
import { AppConfiguration } from '../../app.configuration';

import { SignalRService } from '../../core/services/signalR.service';
import * as $ from "jquery";
import 'ms-signalr-client';

import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { defineLocale } from 'ngx-bootstrap/bs-moment';
import { fr, enGb, ar, de } from 'ngx-bootstrap/locale';
import { User } from '../../core/models/user.model';
import { enumUserRole } from '../../core/models/enums';

@Component({
    selector: 'cargo-list',
    templateUrl: './cargo-list.component.html',
    styleUrls: ['./cargo.component.scss']
})
export class CargolistComponent implements OnInit, OnDestroy, AfterViewInit {
    enumUserRole: typeof enumUserRole = enumUserRole;
    private currentUser: User;
    private resizeEvent = 'resize.ag-grid';
    private $win = $(window);
    private gridOptions: GridOptions;
    private columnDefs;
    private gridApi: GridApi;
    private currentCargo: Cargo;
    private bsModalRef: BsModalRef;
    private config = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: true
    };
    @ViewChild("modalImportSignal") modalImportSignal;
    private signalRequest = {
        programCode: 'REFERENCE',
        startDate: moment().toDate(),
        endDate: moment().toDate(),
        operationsInternes: ""
    };
    bsConfig: Partial<BsDatepickerConfig>;
    private loading: boolean = false;

    constructor(private route: ActivatedRoute, private router: Router,
        private cargoService: CargoService, private modalService: BsModalService,
        private _ngZone: NgZone, private changeDetector: ChangeDetectorRef,
        private appConfig: AppConfiguration, private _bsDatepickerConfig: BsDatepickerConfig) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        moment.locale('en');
        //defineLocale('fr', fr);
        //defineLocale(ar.abbr, ar);
        defineLocale(enGb.abbr, enGb);
        this._bsDatepickerConfig.locale = enGb.abbr;
        this._bsDatepickerConfig.containerClass = 'theme-blue';
        this._bsDatepickerConfig.showWeekNumbers = false;
        this._bsDatepickerConfig.dateInputFormat = 'MM/DD/YYYY';//format only in view not sended to post webapi 
        this.bsConfig = this._bsDatepickerConfig;

        this.forceRefreshSameRoute();
        this.defineGridOption();
    }

    messages: string[] = [];
    private connection: any;
    private proxy: any;

    openModalsignalImport() {
        this.messages = [];
        this.openPopUp(this.modalImportSignal);
    }

    closeModalImportSignal() {
        this.closeModaltemplate(this.modalImportSignal);
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

    onSubmit(signalRequest: any, form: NgForm) {
        //debugger;
        if (form.valid) {
            console.log(form.value);
            this.callimportSignal(signalRequest);
        }
    }

    callimportSignal(request: any) {
        this.loading = true;
        this.cargoService.importSignal(request)
            .then(() =>
                this.loading = false
            );
    }

    initHubConnexion() {
        let host = this.appConfig.host.replace("api/", "");
        this.connection = $.hubConnection(host);
        var proxy = this.connection.createHubProxy('progressHub');
        // receives broadcast messages from a hub function, called "broadcastMessage"
        proxy.on('SendMessage', (data: any) => {
            const received = `${data}`;
            this.messages.unshift(received);
        });
        proxy.on('SendRefreshData', (data: any) => {
            let receivedData = `${data}`;
            this.databindCargos();
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
            .fail(function () {
                console.log('Could not connect');
            }
            );
        var tryingToReconnect = false;
        //    this.connection.hub.disconnected(function () {
        //        //TODO: write the logic to reconnect to server.
        //         if(!this.tryingToReconnect) {
        //             // notifyclient about disconnection
        //             setTimeout(function() {
        //                 debugger;
        //                 $.connection.hub.start();
        //             }, 5000); // Restart connection after 5 seconds.
        //         }
        //     });
        //    $.connection.hub.reconnecting(function() {
        //         debugger;
        //         this.tryingToReconnect = true;
        //         console.log("reconnecting...");
        //     });
        //     $.connection.hub.reconnected(function() {
        //         debugger;
        //         this.tryingToReconnect = false;
        //         console.log("Reconnected");
        //     });
    }

    openModal(id) {
        this.bsModalRef = this.modalService.show(CargoDetailComponent,
            Object.assign({}, this.config, { class: 'gray modal-lg ' })
        );
        this.bsModalRef.content.title = "Cargo Detail";
        this.bsModalRef.content.detailId = id;
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

    onReady(params) {
        this.gridApi = params.api;
        this.databindCargos()
    }

    ngOnInit() {
        this.initHubConnexion();
        this.databindCargos();
        //debugger;
        this.signalRequest.startDate = moment(new Date("01/01/" + (new Date()).getFullYear()).valueOf()).toDate(),
            this.signalRequest.endDate = moment(this.signalRequest.startDate).add(2, 'year').toDate();
    }

    exportgridData() {
        var params = {
            suppressQuotes: true,
            fileName: "CargoList",
            columnSeparator: ";"
        };
        this.gridApi.exportDataAsCsv(params);
    }

    refresh() {
        this.router.navigated = false;
        this.router.navigate(['/cargo']);
    }


    defineGridOption() {
        this.gridOptions = <GridOptions>{
            columnDefs: this.setColumnDef(),
            rowData: null,
            //showToolPanel: true,
            //rowGroupPanelShow: 'always',
            //rowHeight: 34,
            //showColumnFooter: true,
            //showGridFooter: true,
            virtualizationThreshold: 25,

            //pagination: true,
            //paginationPageSizes: [25, 50,100],
            //paginationPageSize: 25,

            enableSorting: true,
            //enablePagination: true,
            //enablePaginationControls: true,
            enableRowSelection: true,
            enableSelectAll: false,
            enableRowHeaderSelection: false,
            noUnselect: true,
            enableGridMenu: true,
            multiSelect: false,
            enableColResize: true,

            enableFilter: true,
            //floatingFilter: true,
            onRowDoubleClicked: this.doubleClick,
            context: {
                componentParent: this
            },
            suppressMenu: true,

            onCellFocused(e) {
                if (e.column) {
                    this.api.forEachNode(node => {
                        if (node.id == e.rowIndex)
                            node.setSelected(true, true);
                    })
                }
            },
            previousCellDef: this.setColumnDef(),
            nextCellDef: this.setColumnDef()

            , getRowStyle: function (params) {
                if (params.data['CargoState'].indexOf('On error') >= 0)
                    return { 'background-color': '#ffd09b' }
                else if (params.data['CargoState'].indexOf('Curtailed') >= 0)
                    return { 'background-color': '#ff9b9b' }
            }
        };
    }

    setColumnDef() {
        this.columnDefs = [
            {
                field: 'Code',
                displayName: 'Cargo ID',
                pinned: true,
                sort: "asc"
            },
            {
                //field: 'CargoState.Code',
                field: 'CargoState',
                displayName: 'Status',
                pinned: true
                //rowGroup: true,
                //cellStyle: { color: 'red', 'text-align': 'center' },
                //cellRenderer(params) {
                //    return CargoStatusCellRenderer(params);
                //},
            },
            {
                field: 'PurchaseContract', displayName: 'Purchase Contract'
            },
            {
                field: 'PurchaseAmount2', displayName: 'Purchase Amount',
                type: 'numericColumn'
                //filter: 'number',
                //filterParams: {
                //    comparator: function(filtervalue, cellValue) {
                //        return FormatHelper.compareAmount(filtervalue, cellValue);
                //    }
                //},
                //cellRenderer(params) {
                //    return FormatHelper.currencyFormatter(params.value);
                //}
            },
            {
                field: 'PurchaseCurrency', displayName: 'Purchase Currency'
            },
            {
                field: 'PurchaseLoadingPort', displayName: 'Purchase Loading Port'
            },
            {
                field: 'PurchaseOperationInternalState', displayName: 'Purchase Operation Status'
            },
            {
                field: 'PurchaseOperationDate', displayName: 'Purchase Operation Date',
                type: 'Date',
                filter: 'date',
                filterParams: {
                    comparator: function (filtervalue, cellValue) {
                        return FormatHelper.compareDate(filtervalue, cellValue);
                    }
                },
                cellRenderer: function (params) {
                    return FormatHelper.toShortDateFormat(params.value);
                }
                , sort: "asc"
                //, pinned: true
                , cellEditorFramework: DateEditorComponent
            },
            {
                field: 'PurchaseOperationType', displayName: 'Purchase Operation Type'
            },
            {
                field: 'PurchasePayementDate2', displayName: 'Purchase Payement Date',
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
                field: 'PurchaseEnergyMMBtu', displayName: 'Purchase Volume MMBtu', filter: 'number',
                cellRenderer(params) {
                    return FormatHelper.formatNumber(params.value);
                }
            },
            {
                field: 'PurchaseCargoFxHedgeRatio', displayName: 'Purchase FX Hedge Ratio', filter: 'number',
                cellRenderer(params) {
                    return FormatHelper.formatNumber(params.value);
                }
            },
            {
                field: 'PurchaseCargoResultingFxExposure', displayName: 'Purchase Resulting Fx Hedge Exposure', filter: 'number',
                cellRenderer(params) {
                    return FormatHelper.formatNumber(params.value);
                }
            },
            {
                field: 'PurchaseCargoPhysicalFxExposure', displayName: 'Purchase Resulting Physical Fx Hedge Exposure', filter: 'number',
                cellRenderer(params) {
                    return FormatHelper.formatNumber(params.value);
                }
            },
            {
                field: 'PurchaseCargoFxHedgeExposure', displayName: 'Purchase Fx Hedge Exposure', filter: 'number',
                cellRenderer(params) {
                    return FormatHelper.formatNumber(params.value);
                }
            },
            {
                field: 'PurchaseCargoFxHedgeMaturity', displayName: 'Purchase Fx Hedge Maturity', filter: 'date',
                cellRenderer: function (params) {
                    return FormatHelper.toShortDateFormat(params.value);
                }
            },
            {
                field: 'PurchaseCargoCommodityHedgeExposure', displayName: 'Purchase Commodity Hedge Exposure', filter: 'number',
                cellRenderer(params) {
                    return FormatHelper.formatNumber(params.value);
                }
            },
            {
                field: 'PurchaseBOValidated', displayName: 'Purchase BO Validation',
                cellStyle: { 'text-align': 'center' },
                cellRendererFramework: BoValidationRenderer
            },
            {
                field: 'SaleContract', displayName: 'Sale Contract'
            },
            {
                field: 'SaleAmount2', displayName: 'Sale Amount', filter: 'number',
                cellRenderer(params) {
                    return FormatHelper.currencyFormatter(params.value);
                }
            },
            {
                field: 'SaleCurrency', displayName: 'Sale Currency'
            },
            {
                field: 'SaleLoadingPort', displayName: 'Sale Unloading Port'
            },
            {
                field: 'SaleOperationInternalState', displayName: 'Sale Operation Status'
            },
            {
                field: 'SaleOperationDate', displayName: 'Sale Operation Date',
                type: 'Date',
                filter: 'date',
                filterParams: {
                    comparator: function (filtervalue, cellValue) {
                        return FormatHelper.compareDate(filtervalue, cellValue);
                    }
                },
                cellRenderer: function (params) {
                    return FormatHelper.toShortDateFormat(params.value);
                }
                , sort: "asc"
                //, pinned: true
                , cellEditorFramework: DateEditorComponent
            },
            {
                field: 'SaleOperationType', displayName: 'Sale Operation Type'
            },
            {
                field: 'SalePayementDate2', displayName: 'Sale Payement Date ', filter: 'date',
                cellRenderer: function (params) {
                    return FormatHelper.toShortDateFormat(params.value);
                }
            },
            {
                field: 'SaleEnergyMMBtu', displayName: 'Sale Volume MMBtu', filter: 'number',
                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(params.value);
                }
            },
            {
                field: 'SaleCargoFxHedgeRatio', displayName: 'Sale Fx Hedge Ratio', filter: 'number',
                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(params.value);
                }
            },
            {
                field: 'SaleCargoResultingFxExposure', displayName: 'Sale Resulting Fx Hedge Exposure', filter: 'number',
                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(params.value);
                }
            },
            {
                field: 'SaleCargoPhysicalFxExposure', displayName: 'Sale Physical Fx Hedge Exposure', filter: 'number',
                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(params.value);
                }
            },
            {
                field: 'SaleCargoFxHedgeExposure', displayName: 'Sale Fx Hedge Exposure', filter: 'number',
                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(params.value);
                }
            },
            {
                field: 'SaleCargoFxHedgeMaturity', displayName: 'Sale Fx Hedge Maturity', filter: 'date',
                cellRenderer: function (params) {
                    return FormatHelper.toShortDateFormat(params.value);
                }
            },
            {
                field: 'SaleCargoCommodityHedgeExposure', displayName: 'Sale Commodity Hedge Exposure', filter: 'number',
                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(params.value);
                }
            },
            {
                field: 'SaleBOValidated', displayName: 'Sale BO Validation',
                cellStyle: { 'text-align': 'center' },
                cellRendererFramework: BoValidationRenderer
            }
        ];
        return this.columnDefs;
    }

    databindCargos() {
        this.cargoService.getCargos()
            .subscribe((result: VW_CargoView[]) => {
                this.gridOptions.api.setRowData(result), err => { console.log(err) };
                //this.gridOptions.api.sizeColumnsToFit();
                this.gridOptionsAutoSizeAll();
                //this.sortByUnderlyingTermMonth('PurchaseOperationDate');
                //this.sortByUnderlyingTermMonth('SaleOperationDate');
            });

        //this.cargoService.getCargosOdataApi()
        //    .subscribe((pagedResult: ODataPagedResult<Cargo>) => {
        //        this.gridOptions.api.setRowData(pagedResult.data), err => { console.log(err) };
        //        var rowCount = pagedResult.count;
        //        //this.gridOptions.api.sizeColumnsToFit();
        //        this.gridOptionsAutoSizeAll();
        //    });

        //Get all cargo , with standard api
        //this.cargoService.getObservableCargos()
        //    .subscribe(
        //    data => {
        //        this.gridOptions.api.setRowData(data), err => { console.log(err) };
        //        this.gridOptions.api.sizeColumnsToFit();
        //    }
        //    );


        // this.cargos$ = this.route.paramMap
        //    .switchMap((params: ParamMap) => {
        //        this.selectedId = +params.get('id');
        //        return this.cargoService.getCargos();
        //    });


    }

    sortByUnderlyingTermMonth(fieldName: string) {
        this.gridApi.getFilterInstance(fieldName).setModel({
            type: "greaterThan",
            dateFrom: "01-06-2017",
            dateTo: null
        });
        this.gridApi.onFilterChanged();
    }

    gridOptionsAutoSizeAll() {
        var allColumnIds = [];
        this.columnDefs.forEach(function (columnDef) {
            allColumnIds.push(columnDef.field);
        });
        this.gridOptions.columnApi.autoSizeColumns(allColumnIds);
    }

    ngAfterViewInit() {
        // viewChild is set after the view has been initialized

    }

    //gridReady(params) {
    //}

    ngOnDestroy() {
        this.$win.off(this.resizeEvent);
    }

    setPurchaseLoadingPortFilter() {
        var countryFilterComponent = this.gridOptions.api.getFilterInstance('PurchaseLoadingPort');
        var model = countryFilterComponent.getModel();
        //var model = ['SK'];
        countryFilterComponent.setModel(model);
        this.gridOptions.api.onFilterChanged();
    }
    onQuickFilterChanged($event) {
        this.gridOptions.api.setQuickFilter($event.target.value);
    }

    onFilterChanged(event) {
        //if (this.gridOptions.api.isAnyFilterPresent()) {
        //    this.gridOptions.api.setRowData(this.gridOptions.rowData);
        //    this.gridOptions.api.refreshView();
        //}

        var values = (<HTMLInputElement>event.target).value;
        this.gridOptions.api.setQuickFilter(values);
        console.log("filter changed ...");
    }

    onPrintQuickFilterTexts(value) {
        this.gridOptions.api.forEachNode(node =>
            console.log('Row ' + node + ' quick filter text is ' + node.quickFilterAggregateText));
    }

    addCargo() {
        //this.router.navigate([ '/cargo/cargoDetail/' + null]);
        this.openModal(null);//this.modalTemplate,
    }

    doubleClick(row) {
        //row.context.componentParent.router.navigate(['/cargo/' + row.data.CargoI]);// un 2eme parameter est possible { relativeTo: row.context.componentParent.route }
        row.context.componentParent.openModal(row.data.Id);//this.modalTemplate,
    }

}


@Component({
    selector: 'ActionRenderer',
    template: '<a routerLink="//cargo/cargoDetail/{{params.data.Id}}"><span class="badge"> {{params.data.Id}}</span>{{params.data.Code }}</a>'
})
export class CargoActionRendererComponent {
    private params: any;
    private value: any;
    private rowData: any;
    private styles: any;
    // called on init
    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
        this.rowData = this.params.data;

        //this.styles = {
        //    width: this.value + "%",
        //    backgroundColor: '#00A000'
        //};

        //if (this.value < 20) {
        //    this.styles.backgroundColor = 'red';
        //} else if (this.params.value < 60) {
        //    this.styles.backgroundColor = '#ff9900';
        //}
    }
}

function CargoStatusCellRenderer(params) {
    var flag;
    if (params.value === 'Ok') {
        flag = "<img border='0' width='20' height='15' style='margin-bottom: 0px' src='assets/img/icon/OK.png'>";
    } else {
        flag = "<img border='0' width='20' height='15' style='margin-bottom: 0px' src='assets/img/icon/error.png'>";
    }
    return flag;
}

function BoStatusCellRenderer(value) {
    if (value) {
        if (value === 2) {
            return "<img border='0' width='20' height='15' style='display: block; margin-left: auto; margin-right: auto' src='assets/img/icon/OK.png'>";
        } else {
            return "<img border='0' width='20' height='15'  style='display: block; margin-left: auto; margin-right: auto' src='assets/img/icon/error.png'>";
        }
    } else {
        return value;
    }
}

@Component({
    selector: 'date-cell',
    template: `<input #input type="date" [ngModel]="value | date:'yyyy-MM-dd'" (ngModelChange)="value = $event" [value]="datee | date:'yyyy-MM-dd'" style="width: 100%;height:100%">`
})
export class DateEditorComponent implements ICellEditorAngularComp {
    @ViewChild('input') input: ViewContainerRef;
    private params: any;
    public value: Date;

    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
    }

    getValue(): any {
        this.value = moment(this.value).toDate();
        return this.value;
    }
}