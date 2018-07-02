import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild, ViewContainerRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, ParamMap, NavigationExtras } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { ColumnApi, GridApi, GridOptions } from "ag-grid/main";
import { Http } from '@angular/http';
import * as _ from 'lodash';
import { CargoService } from '../../core/services/cargo.service';
import { Cargo, VW_CargoView } from '../../core/models/cargo.model';
import { Hedge, HedgeLeg } from '../../core/models/hedge.model';
import { Contract } from '../../core/models/contract.model';
import { FormatHelper } from '../../shared/helpers/formatHelper';
import { CargoState, Currency, InternalState } from '../../core/models/typeCode.model';
import { Operation } from '../../core/models/operation.model';
import { CommodityHedge } from '../../core/models/CommodityHedge.model';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import * as moment from 'moment';

import { ICellEditorAngularComp, ICellRendererAngularComp } from "ag-grid-angular";
import { HedgeService } from '../../core/services/hedge.service';
import { debug } from 'util';
import { enumUserRole } from '../../core/models/enums';
import { User } from '../../core/models/user.model';

@Component({
    selector: 'cargo-detail',
    templateUrl: './cargo-detail.component.html',
    styleUrls: ['./cargo.component.scss']
})
export class CargoDetailComponent implements OnInit {
    enumUserRole: typeof enumUserRole = enumUserRole;
    private currentUser: User;
    defaultCargoIsChanged: boolean = false;
    cargoDetail$: Observable<Cargo>;
    cargosStates$: CargoState[];
    errorMessage: string;
    itemIdToUpdate = null;
    private columnDefsOperation;
    private columnDefsHedgeLegs;
    private columnDefsCoomoHedges;
    private GridOptionsOperations: GridOptions;
    private GridOptionsHedgeLegs: GridOptions;
    private GridOptionsCommoHedges: GridOptions;
    private gridApiOperation: GridApi;
    private gridApiHedgeLegs: GridApi;
    private gridApiCommoHedges: GridApi;
    private gridColumnApi: ColumnApi;
    private sub: any;
    private _detailId: number = 0;

    @Input('detailId')
    set detailId(value: number) {
        this._detailId = value;
        this.databindDetail();
    }
    get detailId(): number {
        return this._detailId;
    }

    private rowSelection;
    currentEditRow: any;
    selectedOperation: Operation;
    cannotDeleteMessage;
    refreshAfterDelete = true;
    private binded = false;
    private anyErrors: boolean;
    private finished: boolean;

    currencyOperation;

    CargoFxHedgeRatio;
    CargoResultingFxExposure;
    CargoPhysicalFxExposure;
    CargoFxHedgeExposure;
    CargoFxHedgeMaturity;
    CargoCommodityHedgeExposure;

    fxContractCode;
    OperationDate;

    ContractResultingFxExposure;
    ContractPhysicalExposure
    ContractFxExposure;
    ContractAvailableFxHedge;
    ContractValidatedMaturity;
    ContractCommodityHedgeExposure;

    constructor(private route: ActivatedRoute, private router: Router,
        private service: CargoService, private hedgeService: HedgeService, private location: Location,
        private bsModalRef: BsModalRef = null, private modalService: BsModalService) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.defineGridOptions();
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this._detailId = +params['id'];
        });

        this.service.getCargosStates()
            .subscribe(oDataPageResult => {
                this.cargosStates$ = oDataPageResult.data;
            });

        //bind cargo detail when use angular-odata-es5 module
        // this.cargoDetail$ = this.route.paramMap
        //     .switchMap((params: ParamMap) => {
        //         this.itemIdToUpdate = +params.get('id');
        //         if (!isNaN(this.itemIdToUpdate)) {
        //             return this.service.getCargo(this.itemIdToUpdate);
        //         } else {
        //             return Observable.of(this.intiCargo());
        //         }
        //     });

        //bind cargo detail when use calssic http access 
        //var id = this.route.snapshot.paramMap.get('id');
        //this.service.getCargo(id)
        //            .subscribe(pagedResult => {
        //                this.cargoDetail$= pagedResult, err => { console.log(err) };
        //});

        //this.cargoDetail$.subscribe(values => {
        //    this.selectedCargostate = values.CargoState;
        //    console.log(this.selectedCargostate);
        //});
    }

    defineGridOptions() {
        this.GridOptionsOperations = <GridOptions>{
            columnDefs: this.setColumnDefsOperation(),
            enableSorting: true,
            enableRowSelection: true,
            noUnselect: true,
            enableColResize: true,
        };
        this.GridOptionsHedgeLegs = <GridOptions>{
            columnDefs: this.setColumnDefsHedgeLegs(),
            enableSorting: true,
            enableRowSelection: true,
            noUnselect: true,
            enableColResize: true,
            onRowDoubleClicked: this.doubleClickHedgeLeg,
            context: {
                componentParent: this
            }
        };
        this.GridOptionsCommoHedges = <GridOptions>{
            columnDefs: this.setColumnDefsCommoHedges(),
            enableSorting: true,
            enableRowSelection: true,
            noUnselect: true,
            enableColResize: true,
        };
        this.rowSelection = "single";
    }

    doubleClickHedgeLeg(row) {
        //row.context.componentParent.openModal(null, row.data.Id);
      
        debugger;
        let navigationExtras: NavigationExtras = {
            queryParams: {
                "detailId" : row.data.FXHedgeId
            }
        };
        //row.context.componentParent.exit();
        row.context.componentParent.router.navigate(["/hedge"], navigationExtras);
        //row.context.componentParent.router.navigate(["/hedge/", { detailId: row.data.FXHedgeId , hedge: null }]);
    }

    setColumnDefsOperation() {
        this.columnDefsOperation = [
            {
                field: 'OperationDate',
                headerName: 'Operation Date',

                filter: 'date',
                cellRenderer: function (params) {
                    return FormatHelper.toShortDateFormat(params.value);
                }
            },
            {
                field: 'EnergyTW0',
                headerName: 'Volume',

                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(convertTwhToMmBtu(params.value));
                }
            },
            {
                field: 'UnitCode',
                headerName: 'Unit',

                type: 'date',
                filter: 'date',
                columnGroupShow: 'open',
                cellRenderer: function () {
                    return "MMBtu";
                }
            },
            {
                field: 'OperationType.Name', headerName: 'Operation Type'
            },
            {
                field: 'Port.Code', headerName: 'Port'
            },
            {
                field: 'PurchaseSale.Code', headerName: 'Element type'
            },

            {
                headerName: 'Contract',

                cellRenderer(rowData) {
                    return getContractCode(rowData);
                }
            },
            {
                field: 'PayementDate2', headerName: 'PayementDate (*)',

                editable: true,
                cellEditorFramework: DateEditorComponent,
                type: 'date',
                cellRenderer(params) {
                    return FormatHelper.toShortDateFormat(params.value);
                }
                , required: true
            },
            {
                field: 'Amount2', headerName: 'Amount (*)',

                cellRenderer(params) {
                    return FormatHelper.currencyFormatter(params.value);
                }
                , cellStyle: { 'text-align': 'right' }
                , cellClass: 'number-cell'
                , editable: true
                , required: true
                , type: 'numericColumn'
                , cellEditorFramework: NumericEditorComponent
            },
            {
                field: 'Currency', headerName: 'Currency (*)'
                , editable: true
                , required: true

                , cellRenderer: function (params) {
                    let codeValue = params.value != null ? params.value.Code : "";
                    return codeValue;
                }
                , cellEditorFramework: CurrencySelectEditorComponent
            },
            {
                field: 'InternalState', headerName: 'Status (*)'
                , editable: true
                , required: true

                , cellRenderer: function (params) {
                    let nameValue = params.value != null ? params.value.Name : "";
                    return nameValue;
                }
                , cellEditorFramework: InternalStateSelectEditorComponent
            },
            {
                field: 'IsBOValidated', headerName: 'Is BO Validated (*)'

                , editable: true
                , required: true

                , cellRendererFramework: BoValidationRenderer
                , cellEditorFramework: MoodEditor
                , cellStyle: { 'text-align': 'center' }
            },
            {
                headerName: "Action",
                suppressMenu: true,
                suppressSorting: true,
                template: '<button type="button" action-type="delete" class="btn center-block" style="background-color:transparent; background-image:url(\'assets\\\\img\\\\icon\\\\suppr3.png\'); background-size:32px, 16px, cover"></button>'
                , pinned: 'right'
            }
        ];
        return this.columnDefsOperation;
    }

    setColumnDefsHedgeLegs() {
        this.columnDefsHedgeLegs = [
            {
                field: 'FXHedge.Code', headerName: 'FxHedge'
            },
            {
                field: 'FXHedge.ExecutionDate', headerName: 'ExecutionDate'
                , filter: 'date'
                , cellRenderer: function (params) {
                    return FormatHelper.toShortDateFormat(params.value);
                }
            },
            {
                field: 'PurchaseSale.Code', headerName: 'Type'
            },
            {
                field: 'Maturity', headerName: 'Maturity'
                , filter: 'date'
                , cellRenderer: function (params) {
                    return FormatHelper.toShortDateFormat(params.value);
                }
            },
            {
                field: 'Amount', headerName: 'Amount'
                , cellRenderer(params) {
                    return FormatHelper.currencyFormatter(params.value);
                }
                , cellStyle: { 'text-align': 'right' }
                , cellClass: 'number-cell'
            },
            {
                field: 'FXHedge.InternalState.Name', headerName: 'Status'
                , cellStyle: { 'text-align': 'center' }
            }
        ];
        return this.columnDefsHedgeLegs;
    }

    setColumnDefsCommoHedges() {
        this.columnDefsCoomoHedges = [
            {
                field: 'Code', headerName: 'Associated Commodity FxHedge'
            },
            {
                field: 'ExecutionDate', headerName: 'ExecutionDate'
                , filter: 'date'
                , cellRenderer: function (params) {
                    return FormatHelper.toShortDateFormat(params.value);
                }
            },
            {
                field: 'PurchaseSale.Code', headerName: 'Type'
            },
            {
                field: 'Maturity', headerName: 'Maturity'
                , filter: 'date'
                , cellRenderer: function (params) {
                    return FormatHelper.toShortDateFormat(params.value);
                }
            },
            {
                field: 'TotalVolume', headerName: 'Volume'
            },
        ];
        return this.columnDefsCoomoHedges;
    }

    databindDetail() {
        if (!isNaN(this._detailId) && this._detailId) {
            this.cargoDetail$ = this.service.getCargo(this._detailId);
            this.cargoDetail$.subscribe(c => {
                if (c.Operations.length > 0) {
                    this.databindHedgeLegs(c.Operations[0].Id);
                    this.databindCommoHedges(c.Operations[0].Id);
                    this.selectedOperation = c.Operations[0];
                    this.formatExposure();
                }
            });
        }
        else {
            this.cargoDetail$ = Observable.of(this.intiCargo());
        }
    }

    save(cargo: Cargo) {
        this.service.save(cargo).then(() => this.close(true));
    }

    close(forceRedresh: boolean = false): void {
        if (this.bsModalRef.content !== undefined) {
            this.bsModalRef.hide();
            if (forceRedresh) {
                this.bsModalRef.content.router.navigated = false;
                this.bsModalRef.content.router.navigate(['/cargo']);
            }
        }
        else {
            this.router.navigate(['/cargo']);// un 2eme parameter est possible { id: params } ou  { relativeTo: this.route }
        }
    }

    onGridReadyOperations(params) {
        this.gridApiOperation = params.api;
        params.api.sizeColumnsToFit();
        this.gridApiOperation.getRowNode('0').setSelected(true);
    }
    onGridReadyHedgeLegs(params) {
        this.gridApiHedgeLegs = params.api;
        params.api.sizeColumnsToFit();
    }
    onGridReadyCommoHedges(params) {
        this.gridApiCommoHedges = params.api;
        params.api.sizeColumnsToFit();
    }

    cargosStateChange(cargo) {
        cargo.CargoStateId = cargo.CargoState.Id;
    }

    cargoStateComparator(object1, object2) {
        if (object2 != null) {
            var res = object1.Id === object2.Id;
            return res;
        } else {
            return true;
        }
    }

    intiCargo() {
        var operations = this.initOperations();
        var newCargo = new Cargo('', this.currentUser.UserGaia, operations);
        return newCargo;
    }

    initOperations(): Operation[] {
        var ope = this.createNewRowData();
        var opes = [];
        opes.push(ope);
        return opes;
    }

    addItemsAtIndex() {
        var ope = this.createNewRowData();
        var newItems = [ope];
        var res = this.gridApiOperation.updateRowData({
            add: newItems,
            addIndex: 0
        });

        this.defaultCargoIsChanged = true;
    }

    createNewRowData(): Operation {
        var ope = new Operation();
        ope.CreationUser = this.currentUser.UserGaia;
        ope.OperationSignal = "REFERENCE";
        ope.OperationDate = moment().toDate();
        ope.EnergyTW0 = 178965;

        ope.OperationTypeId = 1;
        ope.PortId = 6;
        ope.PurchaseSaleId = 1;
        ope.CargoId = 10;
        ope.VesselId = 3;
        ope.LoadingPortId = 6;
        ope.CurrencyId = 2;

        ope.PayementDate2 = moment().toDate();
        ope.CreationDate = moment().toDate();
        ope.PayementDate = moment().toDate();

        return ope;
    }

    InitiateHedgeCA(cargo: Cargo) {

        this.service.save(cargo);

        this.hedgeService
            .getInitialFxHedgeCA(this.selectedOperation.Id)
            .catch(e => {
                alert(e._body);
            })
            .then(h => {
                if (h != undefined) {
                    let hedge = h as Hedge;
                    console.log(hedge);
                    if (hedge.HedgeLegs != undefined) {
                        this.exit();
                        hedge.HedgeLegs.forEach(hl => { console.log(hl) });
                        let h = JSON.stringify(hedge);
                        let navigationExtras: NavigationExtras = {
                            queryParams: {
                                h
                            }
                        };
                        this.router.navigate(["/hedge"], navigationExtras);
                    }
                }
            });
    }

    InitiateHedgeRB(cargo: Cargo) {

        this.service.save(cargo);

        this.hedgeService
            .getInitialFxHedgeRB(this.selectedOperation.Id)
            .catch(e => {
                alert(e._body);
            })
            .then(h => {
                if (h != undefined) {
                    let hedge = h as Hedge;
                    console.log(hedge);
                    if (hedge.HedgeLegs != undefined) {
                        this.exit();
                        hedge.HedgeLegs.forEach(hl => { console.log(hl) });
                        let h = JSON.stringify(hedge);
                        let navigationExtras: NavigationExtras = {
                            queryParams: {
                                h
                            }
                        };
                        this.router.navigate(["/hedge"], navigationExtras);
                        //this.router.navigate(['/hedge', { detailId: 0, hedge: h }]);
                    }
                }
            });
    }

    exit() {
        if (!this.defaultCargoIsChanged)
            this.close(false);
        else
            this.openPopUp(this.alertQuitWithoutSaving);
    }

    openPopUp(template: TemplateRef<any>) {
        this.bsModalRefAlert = this.modalService.show(
            template,
            Object.assign({}, this.config, { class: 'gray modal-md' })
        );
    }

    quitWithoutSaving(response: boolean) {
        if (this.bsModalRefAlert.content !== undefined) {
            this.bsModalRefAlert.hide();
        }
        if (response)
            this.close(false);
    }

    @ViewChild("alertQuitWithoutSaving") alertQuitWithoutSaving;
    @ViewChild("alertConfirmationDelete") alertConfirmationDelete;
    @ViewChild("alertCannotDelete") alertCannotDelete;
    bsModalRefAlert: BsModalRef;
    config = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: true
    };

    onRowClicked(e: any) {
        this.selectedOperation = e.data;
        this.databindHedgeLegs(this.selectedOperation.Id);
        this.databindCommoHedges(this.selectedOperation.Id);

        this.formatExposure();

        if (e.event.target !== undefined) {
            let actionType = e.event.target.getAttribute("action-type");
            switch (actionType) {
                case "delete":
                    this.openPopUp(this.alertConfirmationDelete);
            }
        }
    }

    formatExposure() {
        if (this.selectedOperation != undefined && this.selectedOperation != null) {

            if (this.selectedOperation.Currency != null)
                this.currencyOperation = this.selectedOperation.Currency.Code;

            this.CargoFxHedgeRatio = FormatHelper.formatNumber(this.selectedOperation.CargoFxHedgeRatio * 100);
            this.CargoResultingFxExposure = FormatHelper.formatNumber(this.selectedOperation.CargoResultingFxExposure);
            this.CargoPhysicalFxExposure = FormatHelper.formatNumber(this.selectedOperation.CargoPhysicalFxExposure);
            this.CargoFxHedgeExposure = FormatHelper.formatNumber(this.selectedOperation.CargoFxHedgeExposure);
            if (this.selectedOperation.CargoFxHedgeMaturity != null)
                this.CargoFxHedgeMaturity = FormatHelper.toShortDateFormat(this.selectedOperation.CargoFxHedgeMaturity);
            else
                this.CargoFxHedgeMaturity = "null";
            this.CargoCommodityHedgeExposure = FormatHelper.formatNumber(this.selectedOperation.CargoCommodityHedgeExposure);

            this.getFxCOntractCode(this.selectedOperation.Id);
            if (this.selectedOperation.OperationDate != null)
                this.OperationDate = FormatHelper.toShortDateFormat(this.selectedOperation.OperationDate);
            else
                this.OperationDate = "";

            this.ContractResultingFxExposure = FormatHelper.formatNumber(this.selectedOperation.ContractResultingFxExposure);
            this.ContractPhysicalExposure = FormatHelper.formatNumber(this.selectedOperation.ContractPhysicalExposure);
            this.ContractFxExposure = FormatHelper.formatNumber(this.selectedOperation.ContractFxExposure);
            this.ContractAvailableFxHedge = FormatHelper.formatNumber(this.selectedOperation.ContractAvailableFxHedge);
            if (this.selectedOperation.ContractValidatedMaturity != null)
                this.ContractValidatedMaturity = FormatHelper.toShortDateFormat(this.selectedOperation.ContractValidatedMaturity);
            else
                this.ContractValidatedMaturity = "null";
            this.ContractCommodityHedgeExposure = FormatHelper.formatNumber(this.selectedOperation.ContractCommodityHedgeExposure);
        }
    }

    getFxCOntractCode(operationId: number) {
        this.service
            .getAssociatedFxContractByOperationId(operationId)
            .catch()
            .then(c => {
                if (c != undefined)
                    this.fxContractCode = c.Code;
            });
    }

    databindHedgeLegs(operationId) {
        this.service.getHedgeLegs(operationId)
            .subscribe(
            (pagedResult: HedgeLeg[]) => {
                if (pagedResult != undefined && pagedResult != null)
                    this.gridApiHedgeLegs.setRowData(pagedResult);
                else {
                    var noResult: HedgeLeg[];
                    this.gridApiHedgeLegs.setRowData(noResult);
                }
            });
    }

    databindCommoHedges(operationId) {
        this.service.getCommoHedges(operationId)
            .subscribe(
            (pagedResult: CommodityHedge[]) => {
                if (pagedResult != undefined && pagedResult != null)
                    this.gridApiCommoHedges.setRowData(pagedResult);
                else {
                    var noResult: CommodityHedge[];
                    this.gridApiCommoHedges.setRowData(noResult);
                }
            });
    }

    confirmation(yesNo: boolean) {
        if (this.bsModalRefAlert.content !== undefined) {
            this.bsModalRefAlert.hide();
        }
        if (yesNo) {
            this.service.deleteOperation(this.selectedOperation)
                .catch(e => {
                    this.refreshAfterDelete = false;
                    this.cannotDeleteMessage = e._body;
                    this.openPopUp(this.alertCannotDelete);
                }).then(() => {

                    if (this.refreshAfterDelete) {
                        this.cargoDetail$.subscribe(c => {
                            this.cargoDetail$ = Observable.of(c);
                            this.gridApiOperation.setRowData(c.Operations);
                        });
                    }
                });
            this.refreshAfterDelete = true;
        }
    }

    closeAlertCannotDelete() {
        if (this.bsModalRefAlert.content !== undefined) {
            this.bsModalRefAlert.hide();
        }
    }

    documentClick(event) {
        let eventfromAgGrid = $(event.target).closest('.ag-blue');//.attr('id');
        if (eventfromAgGrid === undefined)
            this.stopEditingRow(event);
    }

    onCellValueChanged(e: any) {
        this.currentEditRow = e.node;
    }

    stopEditingRow(event) {
        let t = event.target || event.srcElement || event.currentTarget;
        if (this.currentEditRow)
            if (this.validateRow(this.currentEditRow.data))
                this.gridApiOperation.stopEditing();
    }

    validateRow(data: Operation): boolean {
        if (!data)
            return true;
        if (data.Amount2 === undefined || !data.Amount2)
            return false
        if (data.CurrencyId === undefined || !data.CurrencyId)
            return false
        if (data.Cargo.CargoStateId === undefined || !data.Cargo.CargoStateId)
            return false
        if (data.IsBOValidated === undefined || !data.IsBOValidated)
            return false
        return true;
    }
}

function convertTwhToMmBtu(value) {
    // ReSharper disable once UnusedLocals
    var txConverisonTwhToMmBtu = 3412141.28585179;
    return value * txConverisonTwhToMmBtu;
}

function boValidateStatusCellRenderer(params) {
    var flag;
    if (params.value === 'Ok') {
        flag = "<img border='0' width='20' height='15' style='display: block; margin-left: auto; margin-right: auto' src='assets/img/icon/OK.png'>";
    } else {
        flag = "<img border='0' width='20' height='15' style='display: block; margin-left: auto; margin-right: auto' src='assets/img/icon/error.png'>";
    }
    return flag;
}

function getContractCode(rowData) {

    if (rowData.data.PurchaseSaleId == 1) {
        if (rowData.data.PurchaseContract !== null)
            return rowData.data.PurchaseContract.Code
    }

    if (rowData.data.PurchaseSaleId == 2) {
        if (rowData.data.SupplyContract !== null)
            return rowData.data.SupplyContract.Code
    }

    return "";
}

@Component({
    selector: 'mood-cell',
    template: `<span [class]="classe" style="font-size:15px" [style.color]="color"></span>`
})
export class BoValidationRenderer implements ICellRendererAngularComp {
    private params: any;
    public color: string;
    public classe: string;
    public tooltip: string;

    agInit(params: any): void {
        this.params = params;
        this.setMood(params);
    }

    refresh(params: any): boolean {
        this.params = params;
        this.setMood(params);
        return true;
    }

    private setMood(params) {
        if (params.value != null) {
            this.color = this.listBoValidations[params.value].color;
            this.classe = this.listBoValidations[params.value].classe;
            this.tooltip = this.listBoValidations[params.value].tooltip;
        }
    };

    listBoValidations = [
        { id: 0, classe: 'fa fa-times-circle', color: 'red', tooltip: 'Not validated !' }, // Not validated, Amount and date computed by FX-Win
        { id: 1, classe: 'fa fa-check', color: 'orange', tooltip: 'Estimated by BO' },
        { id: 2, classe: 'fa fa-check', color: 'green', tooltip: 'Validated by BO' }
    ];
}

@Component({
    selector: 'editor-cell',
    template: `
        <div #container class="mood">
            <span class="fa fa-times-circle" style="font-size:15px; color:red" (click)="onClick(0)" tooltip="Not validated, Amount and date computed by FX-Win" data-placement="bottom"></span>
            <span class="fa fa-check" style="font-size:15px; color:orange" (click)="onClick(1)" tooltip="Estimated by BO" data-placement="bottom"></span>
            <span class="fa fa-check" style="font-size:15px; color:green" (click)="onClick(2)" tooltip="Validated by BO" data-placement="bottom"></span>
        </div>
    `,
    styles: [`
        .mood {
            border-radius: 15px;
            border: 1px solid grey;
            background: #e6e6e6;
            padding: 15px;
            text-align: center;
            display: inline-block;
            outline: none
        }

        .default {
            padding-left: 10px;
            padding-right: 10px;
            border: 1px solid transparent;
            padding: 4px;
        }

        .selected {
            padding-left: 10px;
            padding-right: 10px;
            border: 1px solid lightgreen;
            padding: 4px;
        }
    `]
})
export class MoodEditor implements ICellEditorAngularComp, AfterViewInit {
    private params: any;

    @ViewChild('container', { read: ViewContainerRef }) public container;
    public id: number;

    ngAfterViewInit() {
        setTimeout(() => {
            this.container.element.nativeElement.focus();
        })
    }

    agInit(params: any): void {
        this.params = params;
        this.setId(params.value);
    }

    getValue(): any {
        return this.id;
    }

    isPopup(): boolean {
        return true;
    }

    setId(id: number): void {
        this.id = id;
    }

    toggleMood(): void {
        this.setId(this.id);
    }

    onClick(id: number) {
        this.setId(id);
        this.params.api.stopEditing();
    }
}

@Component({
    selector: 'select-cell',
    template: `<select class="form-control" [(ngModel)] = "value"
    required #Currency="ngModel"
    [compareWith] = "comparator"
    [ngModelOptions] = "{standalone: true}"
    (ngModelChange) ="onChange(value)" >
    <option value="">-- select --</option>
    <option *ngFor="let item of listValue$" [ngValue] = "item" >
        {{item.Code }}
    </option>
    < /select>`
})
export class CurrencySelectEditorComponent implements ICellEditorAngularComp {
    @ViewChild('container') container: ViewContainerRef;
    private params: any;
    public value: any;
    listValue$: Currency[];

    constructor(private service: CargoService) {
        this.service.getCurrencies()
            .subscribe(oDataPageResult => {
                this.listValue$ = oDataPageResult.data;
            });
    }

    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
    }

    getValue(): any {
        return this.value;
    }

    setValue(value) {
        if (this.value != "")
            this.value = value;
    }

    onChange(value) {
        this.setValue(value);
        this.params.node.data.CurrencyId = value.Id;
    }

    comparator(object1, object2) {
        if (object2 != null) {
            var res = object1.Id === object2.Id;
            return res;
        } else {
            return true;
        }
    }
}

@Component({
    selector: 'select-cell',
    template: `<select class="form-control" [(ngModel)] = "value"
    required #InternalState="ngModel"
    [compareWith] = "comparator"
    [ngModelOptions] = "{standalone: true}"
    (ngModelChange) ="onChange(value)" >
    <option value="">-- select --</option>
    <option *ngFor="let item of listValue$" [ngValue] = "item" >
        {{item.Name }}
    </option>
    < /select>`
})
export class InternalStateSelectEditorComponent implements ICellEditorAngularComp {
    @ViewChild('container') container: ViewContainerRef;
    private params: any;
    public value: any;
    listValue$: InternalState[];

    constructor(private service: CargoService) {
        this.service.getInternalStates()
            .subscribe(oDataPageResult => {
                this.listValue$ = oDataPageResult.data;
            });
    }

    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
    }

    getValue(): any {
        return this.value;
    }

    setValue(value) {
        if (this.value != "")
            this.value = value;
    }

    onChange(value) {
        this.setValue(value);
        this.params.node.data.InternalStateId = value.Id;
    }

    comparator(object1, object2) {
        if (object2 != null) {
            var res = object1.Id === object2.Id;
            return res;
        } else {
            return true;
        }
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
        if (this.value != null && this.value != undefined) {
            if (this.value.toString() != 'Invalid Date') {
                return this.value;
            }
            else
                return null;
        }
        else
            return null;
    }
}

@Component({
    selector: 'numeric-cell',
    template: `<input #input type="number" (keydown)="onKeyDown($event)" [(ngModel)]="value" style="width: 100%;height:100%">`
})
export class NumericEditorComponent implements ICellEditorAngularComp, AfterViewInit {
    @ViewChild('input') input: ViewContainerRef;
    private params: any;
    public value: number;
    private cancelBeforeStart: boolean = false;

    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
    }

    getValue(): any {
        this.value = Number(this.value);
        return this.value;
    }

    isCancelBeforeStart(): boolean {
        return this.cancelBeforeStart;
    }

    isCancelAfterEnd(): boolean {
        return this.value > 1000000000000;
    }
    ngAfterViewInit() {
        setTimeout(() => {
        });
    }

    onKeyDown(event): void {
    }

    private getCharCodeFromEvent(event): any {
        event = event || window.event;
        return (typeof event.which == "undefined") ? event.keyCode : event.which;
    }

    private isCharNumeric(charStr): boolean {
        return !!/\d/.test(charStr);
    }

    private isKeyPressedNumeric(event): boolean {
        var charCode = this.getCharCodeFromEvent(event);
        var charStr = event.key ? event.key : String.fromCharCode(charCode);
        return this.isCharNumeric(charStr);
    }
}