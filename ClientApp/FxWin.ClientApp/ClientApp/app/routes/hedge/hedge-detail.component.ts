import {
    Directive, Component, OnInit, AfterViewInit, AfterContentInit, ViewChild, TemplateRef, ViewContainerRef,
    Input, OnChanges, SimpleChanges
} from '@angular/core';
import { FormsModule, Validators, FormControl, NgForm } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute, ParamMap } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

import { GridOptions } from "ag-grid/main";
import { ICellEditorAngularComp } from "ag-grid-angular";

import { HedgeService } from '../../core/services/hedge.service';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';

import * as moment from 'moment';
import { FormatHelper } from '../../shared/helpers/formatHelper';

import {
    HedgeView
    , Hedge
    , HedgeLeg
    , ExecutionFX
    , OperationSynthesis
    , SubjacentSynthesis
} from '../../core/models/hedge.model';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { ISubscription } from "rxjs/Subscription";


import { ODataPagedResult } from "angular-odata-es5";
import { Currency, PurchaseSale, InternalState, WorkflowState, Qualification, HedgeType, ManagementIntent, Book } from '../../core/models/typeCode.model';
import { Contract } from '../../core/models/contract.model';
import { enumHedgeType, ViewOpenMode, enumPurchaseType, enumWorkFlowStatus, enumUserRole } from '../../core/models/enums';
import { forEach } from '@angular/router/src/utils/collection';
import { User } from '../../core/models/user.model';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/bs-moment';
import { fr, enGb, ar, de } from 'ngx-bootstrap/locale';
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import { debug } from 'util';
declare var $: any;

@Component({
    selector: 'hedge-detail',
    templateUrl: './hedge-detail.component.html',
    styleUrls: ['./hedge.component.scss'],
    inputs: ['detailId', 'hedge'],
    //providers:[NgbDatepickerConfig],
})
export class HedgeDetailComponent implements OnInit, AfterViewInit, AfterContentInit {
    //ref enum in html template
    enumWorkFlowStatus: typeof enumWorkFlowStatus = enumWorkFlowStatus;
    ViewOpenMode: typeof ViewOpenMode = ViewOpenMode;
    enumUserRole: typeof enumUserRole = enumUserRole;
    //declaration de variables
    private viewOpenMode: ViewOpenMode = ViewOpenMode.EditionMode;

    // grid operations-cargo
    private agOperationsApi;
    private agOperationsColumnApi;
    private agOperations: GridOptions;
    //grid ExecutionFX
    private agExecutionApi;
    private agExeColumnApi;
    private agExecutionFXes: GridOptions;
    private agExeColumnDefs;

    //grid LegHedgeCommo
    private agSubjacentListApi;
    private agSubjacentListColumnApi;
    private agSubjacentList: GridOptions;
    private agSubjacentListColumnDefs;

    private hedge$: Observable<Hedge>;
    private subject: Subject<Hedge> = new Subject<Hedge>();
    private operation$: Observable<OperationSynthesis[]>;
    private hedgeLegBuy$: Observable<HedgeLeg>;
    private hedgeLegSale$: Observable<HedgeLeg>;
    private currencies$: Currency[];
    private purchaseSale$: PurchaseSale[];
    private internalStates$: InternalState[];
    private workflowStates$: WorkflowState[];
    private qualifications$: Qualification[];
    private contracts$: Contract[];
    private buyOperationSynthesises$: OperationSynthesis[];
    private saleOperationSynthesises$: OperationSynthesis[];
    private hedgeTypes$: HedgeType[];
    private nextWorkFlowStatus: WorkflowState;
    private ManagementIntents$: ManagementIntent[]
    private Books$: Book[]

    private contractId: number;
    private ContractTypeId: number;
    private monthUnderlyingMonth: string;
    private yearUnderlyingMonth: number;

    private editType;
    private hedgeId: number;
    private sub: any;
    public activePopover: any = null;
    private currentlegId: any = null;
    private InsertNewExecutionFx: boolean = false;
    private BreakException = {};
    private defaultHedgeIsChanged: boolean = false;
    private Form: NgForm;
    @ViewChild("alertConfirmSave") alertConfirmSave;
    @ViewChild("alertQuitWithoutSaving") alertQuitWithoutSaving;
    private bsModalRefAlert: BsModalRef;
    private config = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: true
    };
    private currentEditRow: any;
    private activateOrderNumberGen: boolean = false;
    private currentUser: User;
    private bsConfig: Partial<BsDatepickerConfig>;
    private numberMask: any;
    private currentLegIndex: number = -1;
    private underlyngMonth: any;
    private AllowEditAll: boolean = false;
    private AllowEditSiam: boolean = false;

    constructor(private route: ActivatedRoute, private router: Router,
        private service: HedgeService, private bsModalRef: BsModalRef = null,
        private modalService: BsModalService,
        private _bsDatepickerConfig: BsDatepickerConfig) {//private datePipe: DatePipe
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.numberMask = createNumberMask({
            prefix: '',
            allowDecimal: true,
            modelClean: true,
            thousandsSeparatorSymbol: ' ',
            decimalSymbol: '.',
            allowNegative: true,
            //decimalLimit : 2 ,
            requireDecimal: false,
            //suffix: ' $',
        })
        moment.locale('en');
        //defineLocale('fr', fr);
        //defineLocale(ar.abbr, ar);
        defineLocale(enGb.abbr, enGb);
        this._bsDatepickerConfig.locale = enGb.abbr;
        this._bsDatepickerConfig.containerClass = 'theme-blue';
        this._bsDatepickerConfig.showWeekNumbers = false;
        //this._bsDatepickerConfig.dateInputFormat = 'MM/DD/YYYY';//format only in view not sended to post webapi 
        this.bsConfig = this._bsDatepickerConfig;

        this.defineGridOptions();
        // service.getPurchaseSale().subscribe(
        //     purchaseSales => {
        //         this.purchaseSale$ = purchaseSales.sort(HedgeService.alphabeticalSort());
        //         this.agExeColumnDefs = this.createColumnDefs(this.purchaseSale$);
        //         this.defineGridOptions();
        //     },
        //     error => console.log(error)
        // );

    }

    trackByIndex(index: number, obj: any): any {
        return index;
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.hedgeId = +params['id']; // (+) converts string 'id' to a number

            //this.detailId = +params['detailId']; // (+) converts string 'id' to a number
            //this.hedge = params['hedge']; // (+) converts string 'id' to a number
            //console.log("detailId :  " + this.detailId);
            //console.log("hedge :  " + this.hedge);
            this.dataBindComboBox();
            // this.databindDetail();
        });

        // this.hedge$ = this.route.paramMap
        //     .switchMap((params: ParamMap) => {
        //         return this.service.getHedge(+params.get('id'));
        //     });
        //this.hedgeLegSale$ = this.route.paramMap.switchMap(
        //    (params: ParamMap) => {
        //        //var url = this.service.composeUrl(+params.get('id'), 2);
        //        var url = 'assets/mock/mockHedgeLeg.json';
        //        return this.service.getHedgeLeg(url);
        //    });
        //this.hedgeLegSale$
        //    .subscribe(hlg => {
        //        this.contractId = hlg.FxContractId;
        //        this.ContractTypeId = hlg.FxContract.ContractTypeId;
        //        this.monthUnderlyingMonth = hlg.UnderlyingMonth.toString().substring(5, 7);
        //        this.yearUnderlyingMonth = moment(hlg.UnderlyingMonth).todate().getFullYear();

        //        this.service
        //            .getOperationSynthesises(this.contractId, this.ContractTypeId, this.monthUnderlyingMonth, this.yearUnderlyingMonth)
        //            .subscribe(oDataPageResult => {
        //                this.saleOperationSynthesises$ = oDataPageResult;
        //            });
        //    });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            //this.input.element.nativeElement.focus();
            this.databindDetail();
        });
    }

    ngAfterContentInit() {
    }

    private _detailId: number = 0;
    @Input('detailId')
    set detailId(value: number) {
        this._detailId = value;
    }
    get detailId(): number {
        return this._detailId;
    }

    private _hedge: Hedge;
    @Input('hedge')
    set hedge(value: Hedge) {
        this._hedge = value;
    }
    get hedge(): Hedge {
        return this._hedge;
    }



    createAgExeColumnDefs(purchaseSales: PurchaseSale[]) {
        this.agExeColumnDefs = [
            {
                headerName: 'SIAM #(*)',
                field: 'ExecutionCode',
                width: 100,
                editable: (this.currentUser.FxRoleId == enumUserRole.ADMIN),
                required: true,
            },
            {
                headerName: 'Confirm. N°',
                field: 'ConfirmationNumber',
                width: 100,
                editable: true,
                cellEditorFramework: NumericEditorComponent,
                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(params.value);
                },
                type: "numericColumn"
            },
            {
                headerName: 'Type (*)',
                field: 'PurchaseSale',
                width: 120,
                required: true,
                cellRenderer: function (params) {
                    let codeValue = params.value != null ? params.value.Code : "";
                    return codeValue;
                },

                cellEditorFramework: PurchaseSaleSelectEditorComponent,
                editable: (this.currentUser.FxRoleId == enumUserRole.ADMIN),
                // cellEditor: 'select',
                // cellEditorParams: {
                //     values: purchaseSales,
                //     // cellRenderer: (params) => params.value.Code
                //     cellRenderer: function (params) {
                //         console.error(params);
                //         let codeValue = params.value != null ? params.value.Code : "";
                //         return codeValue;
                //     },
                // },
            },
            {
                headerName: 'Nature',
                field: 'Nature',
                width: 100,
                editable: (this.currentUser.FxRoleId == enumUserRole.ADMIN || this.currentUser.FxRoleId == enumUserRole.BO)
            },
            {
                headerName: 'Amount (*)',
                field: 'Amount',
                width: 100,
                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(params.value);
                },
                type: "numericColumn",
                required: true,
                editable: (this.currentUser.FxRoleId == enumUserRole.ADMIN || this.currentUser.FxRoleId == enumUserRole.BO),
                cellEditorFramework: NumericEditorComponent,
            },
            {
                headerName: 'Currency (*)',
                field: 'Currency',
                width: 120,
                editable: (this.currentUser.FxRoleId == enumUserRole.ADMIN || this.currentUser.FxRoleId == enumUserRole.BO),
                cellRenderer: function (params) {
                    let codeValue = params.value != null ? params.value.Code : "";
                    return codeValue;
                },
                cellStyle: function (params) {
                    if (params.value == "") {
                        return { border: '1px solid red !important' };
                    } else {
                        return null;
                    }
                },
                cellEditorFramework: CurrencySelectEditorComponent,
            },
            {
                headerName: 'Maturity (*)',
                field: 'Maturity',
                width: 120,
                editable: (this.currentUser.FxRoleId == enumUserRole.ADMIN || this.currentUser.FxRoleId == enumUserRole.BO),
                required: true,
                type: "date",
                cellFormatter: function (params) {
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
                cellEditorFramework: DateEditorComponent,
            },
            {
                headerName: 'Spot Rate (*)',
                field: 'SpotRate',
                width: 100,
                editable: (this.currentUser.FxRoleId == enumUserRole.ADMIN || this.currentUser.FxRoleId == enumUserRole.BO),
                required: true,
                cellEditorFramework: NumericEditorComponent,
                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(params.value);
                },
                type: "numericColumn"
            },
            {
                headerName: 'Fwd. Point',
                field: 'FwdPoint',
                width: 100,
                editable: (this.currentUser.FxRoleId == enumUserRole.ADMIN || this.currentUser.FxRoleId == enumUserRole.BO),
                cellEditorFramework: NumericEditorComponent,
                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(params.value);
                },
                type: "numericColumn"
            },
            {
                headerName: 'All In',
                field: 'AllIn',
                width: 100,
                editable: (this.currentUser.FxRoleId == enumUserRole.ADMIN || this.currentUser.FxRoleId == enumUserRole.BO),
                cellEditorFramework: NumericEditorComponent,
                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(params.value);
                },
                type: "numericColumn"
            },
            {
                headerName: 'Exch Value',
                field: 'ExchValue',
                width: 100,
                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(params.value);
                },
                type: "numericColumn",
                editable: (this.currentUser.FxRoleId == enumUserRole.ADMIN || this.currentUser.FxRoleId == enumUserRole.BO),
                cellEditorFramework: NumericEditorComponent,
            },
            {
                headerName: 'Exch Currency',
                field: 'Currency1',
                width: 120,
                editable: (this.currentUser.FxRoleId == enumUserRole.ADMIN || this.currentUser.FxRoleId == enumUserRole.BO),
                cellRenderer: function (params) {
                    let codeValue = params.value != null ? params.value.Code : "";
                    return codeValue;
                },
                cellEditorFramework: Currency1SelectEditorComponent,
            }
        ];
        return this.agExeColumnDefs;
    }

    setCargoColumnDefs() {
        return [
            {
                headerName: 'Cargo',
                field: 'CargoCode',
            },
            {
                headerName: 'Operation date',
                field: 'Operationdate',
            },
            {
                headerName: 'Signal contract',
                field: 'SignalContract',
            },
            {
                headerName: 'Operation type',
                field: 'OperationType',
                editable: true
            },
            {
                headerName: 'Volume',
                field: 'EnergyMMBtu',
                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(params.value);
                },
                type: "numericColumn"
            },
            {
                headerName: 'Status',
                field: 'CargoState',
            },
            {
                headerName: 'BO Status',
                field: 'BOValidationStatus',
                cellStyle: { 'text-align': 'center' },
                cellRenderer(params) {
                    return BoStatusCellRenderer(params.value);
                }
            },

        ];
    }

    setagSubjacentListColumnDefs() {
        return [
            {
                headerName: 'Underlying Code',
                field: 'Code',
            },
            {
                headerName: 'Echeance',
                field: 'LabelEcheance',
            },
            {
                headerName: 'Payment Date',
                field: 'PaymentDate',
            },
            {
                headerName: 'Book',
                field: 'Book',
            },
            {
                headerName: 'BO Status',
                field: 'IsBoValidated',
                cellStyle: { 'text-align': 'center' },
                cellRenderer(params) {
                    return BoStatusCellRenderer(params.value);
                }
            },
        ];
    }


    defineGridOptions() {
        this.agSubjacentList = <GridOptions>{
            columnDefs: this.setagSubjacentListColumnDefs(),
            enableColResize: true,
            context: {
                componentParent: this,
                hedgeService: this.service,
            },
            onRowClicked: this.selectLegHedgeCommo,
            onGridReady: this.agSubjacentListOnGridReady,
        };

        this.agExecutionFXes = <GridOptions>{
            columnDefs: this.createAgExeColumnDefs(null), //this.agExeColumnDefs,
            enableColResize: true,
            //previousCellDef: this.setColumnDefs(purchaseSales),
            //nextCellDef: this.setColumnDefs(purchaseSales),
            context: {
                componentParent: this,
                hedgeService: this.service,
            },
            onCellFocused(e) {
                if (e.column) {
                    this.api.forEachNode(node => {
                        if (node.id == e.rowIndex)
                            node.setSelected(true, true);
                    })
                }
            },
        };

        this.agOperations = <GridOptions>{
            columnDefs: this.setCargoColumnDefs(),
            //onRowDoubleClicked: this.doubleClick,
            onRowClicked: this.selectCargo,
            suppressHorizontalScroll: true,
            context: {
                componentParent: this,
            },
        };
    }

    databindDetail() {
        if (!isNaN(this._detailId) && this._detailId) {
            this.hedge$ = this.service.getHedge(this._detailId);
            this.databindRelatedControl();
        } else {
            //this.agExeColumnDefs = this.createAgExeColumnDefs(null);
            this.viewOpenMode = ViewOpenMode.CreationMode;
            this.hedge$ = Observable.of(this._hedge);
            this.InitFormWithWorkflow();
        }
        this.getActivateOrderNumberGen();
        this.applyRuleOfRoleAndWorkflowStatus();
    }

    databindRelatedControl() {
        this.hedge$.subscribe(h => {
            h.HedgeLegs.forEach(currentleg => {
                //let currentleg = <HedgeLeg> HedgeLeg;
                if (currentleg.OperationId != null && currentleg.FxContractId > 0 && currentleg.FxContract != null) {
                    this.service.getOperationSynthesisesByOperation(currentleg.FxContractId, currentleg.FxContract.ContractTypeId, currentleg.OperationId)
                        .subscribe(ope => {
                            if (Object.keys(ope).length) {
                                currentleg.SignalContract = ope[0].SignalContract;
                            }
                        });
                }

                if (currentleg.UnderlyingTermId != null) {
                    this.service.getUnderlyingSynthesisByMaturity(currentleg.Maturity)
                        .subscribe(result => {
                            if (Object.keys(result).length) {
                                currentleg.Subjacent = result[0];
                            }
                        });
                }
                this.setUnderlyingMaturity(currentleg);
                this.computeExposure(currentleg);
            });
            this.hedge$ = Observable.of(h);
        })
    }

    selectCargo(row) {
        // let subject = new BehaviorSubject(row.context.componentParent.hedge$.Code);
        row.context.componentParent.hedge$.subscribe((h: Hedge) => {
            let index = row.context.componentParent.currentLegIndex;
            if (index != -1) {
                row.context.componentParent.service
                    .getOperation(row.data.OperationId)
                    .subscribe(data => {
                        h.HedgeLegs[index].OperationId = data.Id;
                        h.HedgeLegs[index].Operation = data;
                        h.HedgeLegs[index].SignalContract = row.data.SignalContract;
                        row.context.componentParent.hedge$ = Observable.of(h);
                    });
            }
        });
    }

    selectLegHedgeCommo(row) {
        row.context.componentParent.hedge$.subscribe((h: Hedge) => {
            let index = row.context.componentParent.currentLegIndex;
            if (index != -1 && h.HedgeLegs[index].FxContractId == undefined) {
                h.HedgeLegs[index].UnderlyingTermId = row.data.Id;
                h.HedgeLegs[index].Subjacent = row.data;
                h.HedgeLegs[index].UnderlyingMaturity = moment(row.data.PaymentDate).format("MM/DD/YYYY");
                row.context.componentParent.hedge$ = Observable.of(h);
            }
        });
    }

    addItemsAtIndex() {
        //event.preventDefault();
        var exe = this.createNewRowData();
        this.InsertNewExecutionFx = true;
        this.hedge$.subscribe((h: Hedge) => {
            exe.FXHedgeId = h.Id;
            //h.ExecutionFXes.push(exe);
            h.ExecutionFXes.unshift(exe);
            this.hedge$ = Observable.of(h);
            this.currentEditRow = exe;
            this.agExecutionApi.setRowData(h.ExecutionFXes), err => { console.log(err) };
        }, (err) => {
            alert('err');
        }, () => {
            this.startEditingRow(0);
        }
        );

        // var subscription = this.hedge$.subscribe(
        //     x => console.log('onNext: %s', x),
        //     e => console.log('onError: %s', e),
        //     () =>{ 
        //         // this.agExecutionApi.setRowData( h.ExecutionFXes), err => { console.log(err) };
        //         // this.agExecutionApi.updateRowData({ add: exe, addIndex: 0});
        //         // this.agExecutionApi.refreshCells({ force: true });
        //     }
        //     );
    }

    createNewRowData(): ExecutionFX {
        var exec = new ExecutionFX();
        exec.Amount = 2365;
        return exec;
    }

    stopEditingRow(event) {
        let t = event.target || event.srcElement || event.currentTarget;
        // if (t.id !== "addExecutionFx" ) {
        //     this.agExecutionApi.stopEditing();
        // }
        //var selectedRows = this.agExecutionApi.getSelectedRows();
        if (this.currentEditRow) {
            if (this.validateRow(this.currentEditRow.data)) {
                this.agExecutionApi.stopEditing();
            }
        }
    }

    startEditingRow(rowindex) {
        let filedName = this.agExeColumnDefs[0].field;
        this.agExecutionApi.setFocusedCell(rowindex, filedName);
        this.agExecutionApi.startEditingCell({
            rowIndex: rowindex,
            colKey: filedName,
        });

    }

    startEditingCell(key, filedName) {
        this.agExecutionApi.setFocusedCell(0, filedName);
        this.agExecutionApi.startEditingCell({
            rowIndex: 0,
            colKey: filedName,
        });
    }


    validateRow(data: ExecutionFX): boolean {
        if (!data)
            return true;

        if (data.PurchaseSaleId === undefined || !data.PurchaseSaleId) return false
        if (data.ExecutionCode === undefined || !data.ExecutionCode) return false
        if (data.Amount === undefined || !data.Amount) return false
        if (data.SpotRate === undefined || !data.SpotRate || data.SpotRate == 0) return false
        if (data.AmountCurrencyId === undefined || !data.AmountCurrencyId) return false
        return true;
    }

    documentClick(event) {
        //let src = event.target.getAttributeNode("role");
        let eventfromAgGrid = $(event.target).closest('.ag-blue').attr('id');
        if (eventfromAgGrid === undefined) {
            this.stopEditingRow(event);
        }
        // event.stopPropagation()
    }

    rowDoubleClicked(e) {
        if (!this.AllowEditSiam) { //&& !e.columnDef.editable
            this.agExecutionApi.stopEditing();
        }

    }

    generateOrderNumber() {
        if (this.activateOrderNumberGen != undefined && this.activateOrderNumberGen) {

            this.hedge$.subscribe((h: Hedge) => {
                var index = 0;
                if (h.HedgeTypeId == enumHedgeType.Buy || h.HedgeTypeId == enumHedgeType.Swap) {
                    index = h.HedgeLegs.findIndex(y => y.PurchaseSaleId == enumPurchaseType.Achat);
                } else {
                    index = h.HedgeLegs.findIndex(y => y.PurchaseSaleId == enumPurchaseType.Vente);
                }
                if (index != -1) {
                    let orderNumber = h.HedgeLegs[index].FxContract.OrderNumberPrefix + "-" + moment(h.HedgeLegs[index].UnderlyingMonth).format("YYMM")
                        + "-" + h.ManagementIntent.Code.substr(0, 2) + "-" + moment().format('YYMMDD'); moment.localeData.toString();

                    this.service.getHedgeCodeOccurence(orderNumber, 17).subscribe(result => {
                        h.Code = orderNumber + "-" + (result + 1);
                        this.hedge$ = Observable.of(h);
                    })
                }
            })

        }
    }

    getActivateOrderNumberGen() {
        this.hedge$.subscribe((h: Hedge) => {
            var index = 0;

            if (h.HedgeTypeId == enumHedgeType.Buy || h.HedgeTypeId == enumHedgeType.Swap) {
                index = h.HedgeLegs.findIndex(y => y.PurchaseSaleId == enumPurchaseType.Achat);
            } else {
                index = h.HedgeLegs.findIndex(y => y.PurchaseSaleId == enumPurchaseType.Vente);
            }
            if (index != -1) {
                if ((h.HedgeLegs[index].FxContractId != undefined && h.HedgeLegs[index].FxContract.Code != "")
                    && (h.HedgeLegs[index].UnderlyingMonth != undefined)
                    && (h.ManagementIntentId != undefined && h.ManagementIntent.Code != "")
                ) {
                    this.activateOrderNumberGen = true;
                    //regnerate oroder number 
                    if (this.viewOpenMode == ViewOpenMode.CreationMode) {
                        //regnerate oroder number
                        this.generateOrderNumber();
                    }
                } else {
                    this.activateOrderNumberGen = false;
                    //clean order Number code 
                    if (this.viewOpenMode == ViewOpenMode.CreationMode) {
                        h.Code = null;
                        //regnerate oroder number 
                    }
                }
            }
        });
    }

    onRowValueChangedAgExecution(e: any) {
        this.InsertNewExecutionFx = false;
        this.currentEditRow = e.node;
        //this.forceValidateForm();
        if (!this.validateRow(e.node.data)) {
            // this.columnDefs.forEach(function (columnDef) {
            //     allColumnIds.push(columnDef.field);
            // });
            this.startEditingRow(e.rowIndex)
        }
    }

    onCellValueChanged(e: any) {
        this.currentEditRow = e.node;
        if (!this.validateRow(e.node.data)) {
            this.startEditingCell(e.rowIndex, e.column.colId)
        }

    }
    //*** How to programmatically display HTML5 client-side form validation error bubbles***/
    forceValidateForm() {
        //methode 1
        var hedgeform = (<HTMLInputElement>document.getElementById('hedgeForm'));
        let valid = hedgeform.checkValidity();
        if (!valid) {
            $('#hedgeForm').submit();
        }
        //methode 2 
        var button = $('#fakeButton');
        if (button === null)
            return;
        button.click();
    }

    getPlacement(leg) {
        //    if(leg.PurchaseSaleId == 1 )
        return "bottom";
        //  else
        //  return "left" ;
    }

    onDeleteKeyPress(event) {
        if (event.keyCode == 46 || event.keyCode == 8) {
            alert('Delete key released');
        } else {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    onDeleteOperationkeyUp(event, legId) {
        if (event.keyCode == 46 || event.keyCode == 8) {
            this.cleanOperation(event, legId);
        }
    }

    onDeleteSubjacentkeyUp(event, legId) {
        if (event.keyCode == 46 || event.keyCode == 8) {
            this.cleanSubjacentCommo(event, legId);
        }
    }

    cleanOperation(event: any, legId) {
        this.hedge$.subscribe(h => {
            h.HedgeLegs.forEach(HedgeLeg => {
                if (HedgeLeg.Id === legId) {
                    HedgeLeg.Operation = null;
                    HedgeLeg.SignalContract = null;
                }
            })
            this.hedge$ = Observable.of(h);
        });
    }

    cleanSubjacentCommo(event: any, legId) {
        this.hedge$.subscribe(h => {
            h.HedgeLegs.forEach(HedgeLeg => {
                if (HedgeLeg.Id === legId) {
                    HedgeLeg.UnderlyingTermId = null;
                    HedgeLeg.Subjacent = null;
                }
            })
            this.hedge$ = Observable.of(h);
        });
    }

    dataBindOpeartionGrid(currentLegIndex, contractid: number, maturity: Date) {
        // moment.month() is zero based, so it will return 0-11 when doing a get and it expects 
        //a value of 0-11 when setting passing a value in.
        let monthUnderlyingMonth = moment(maturity).month() + 1;
        let yearUnderlyingMonth = moment(maturity).year();
        this.service.getContract(contractid).subscribe(contract => {
            this.service.getOperationSynthesises(contract.Id, contract.ContractTypeId, yearUnderlyingMonth, monthUnderlyingMonth)
                .subscribe((result: OperationSynthesis[]) => {
                    if (!!result) {
                        this.agOperationsApi.setRowData(result), err => { console.log(err) };
                        //this.agOperationsApi.getRowNode('0').setSelected(true);
                        this.hedge$.subscribe(h => {
                            // h.HedgeLegs.forEach(HedgeLeg => {
                            //     if (HedgeLeg.Id === this.currentlegId) {
                            this.agOperationsApi.forEachNode(function (node) {
                                if (h.HedgeLegs[currentLegIndex].Operation != null && h.HedgeLegs[currentLegIndex].Operation.Cargo != null
                                    && node.data.CargoCode === h.HedgeLegs[currentLegIndex].Operation.Cargo.Code)
                                    node.setSelected(true);
                            });
                            //     }
                            // })
                        });
                    } else {
                        console.log('empty');
                    }
                });
        });

    }

    dataBindLegHedgeCommoGrid(maturity: Date) {
        // this.service.getContract(contractid).subscribe(contract => {
        this.service.getUnderlyingSynthesisByMaturity(maturity)
            .subscribe((result: SubjacentSynthesis[]) => {
                if (!!result) {
                    this.agSubjacentListApi.setRowData(result), err => { console.log(err) };
                    this.hedge$.subscribe(h => {
                        h.HedgeLegs.forEach(HedgeLeg => {
                            if (HedgeLeg.Id === this.currentlegId) {
                                this.agSubjacentListApi.forEachNode(function (node) {
                                    if (HedgeLeg.Subjacent != null && HedgeLeg.UnderlyingTermId != null && node.data.Code === HedgeLeg.Subjacent.Code)
                                        node.setSelected(true);
                                });
                            }
                        })
                    });
                } else {
                    console.log('empty');
                }
            });
        //    });
    }

    OperationPopoverClick(event: any, legId, contractid, underlyingMonth, target, index) {
        this.currentlegId = legId;
        this.currentLegIndex = index;
        this.underlyngMonth = underlyingMonth;
        this.showpopupover(event, target);
    }

    SubjacentListPopoverClick(event: any, legId, underlyingMonth, target, index) {
        this.currentlegId = legId;
        this.currentLegIndex = index;
        this.underlyngMonth = underlyingMonth;
        this.showpopupover(event, target);
    }

    showpopupover(event: any, target) {
        this.activePopover = target; // || event.srcElement || event.currentTarget;
        if (this.activePopover === target) {
            //target.click();
            event.stopPropagation();
            //    this.activePopover = null;
        } else if (this.activePopover !== target) {
            this.activePopover = target;
            //target.click();
            // target.addEventListener('click', function(e){
            //     //e.stopPropagation();
            // });
            //event.preventDefault()
        }
    }

    agOperationOnGridReady(params) {
        this.agOperationsApi = params.api;
        this.agOperationsColumnApi = params.columnApi;
        this.agOperationsApi.sizeColumnsToFit();
        if (this.hedge$ != undefined) {
            this.hedge$.subscribe(h => {
                this.dataBindOpeartionGrid(this.currentLegIndex, h.HedgeLegs[this.currentLegIndex].FxContractId,
                    h.HedgeLegs[this.currentLegIndex].Maturity);
            });
        }
        //this.autoSizeGridColumns();
    }

    agSubjacentListOnGridReady(params) {
        this.agSubjacentListApi = params.api;
        this.agSubjacentListColumnApi = params.columnApi;
        this.agSubjacentListApi.sizeColumnsToFit();
        if (this.hedge$ != undefined) {
            this.hedge$.subscribe(h => {
                this.dataBindLegHedgeCommoGrid(this.underlyngMonth);
            });
        }
        //this.autoSizeGridColumns();
    }

    agExecutiononGridReady(params) {
        this.agExecutionApi = params.api;
        this.agExeColumnApi = params.columnApi;
        this.agExecutionApi.sizeColumnsToFit();
        // params.api.sizeColumnsToFit();
        //this.autoSizeGridColumns();
    }

    dataBindComboBox() {

        this.service.getCurrencies()
            .subscribe(oDataPageResult => {
                this.currencies$ = oDataPageResult.data;
            });

        this.service.getInternalStates()
            .subscribe(oDataPageResult => {
                this.internalStates$ = oDataPageResult.data;
                if (ViewOpenMode.CreationMode && this.hedge$ != undefined) {
                    this.hedge$.subscribe(h => {
                        let okStateIndex = oDataPageResult.data.findIndex(y => y.Id == 1)
                        h.InternalStateId = oDataPageResult.data[okStateIndex].Id;
                        h.InternalState = oDataPageResult.data[okStateIndex];
                    });
                }
            });

        this.service.getWorkflowStates()
            .subscribe(oDataPageResult => {
                this.workflowStates$ = oDataPageResult.data;
                this.InitFormWithWorkflow();
                if (ViewOpenMode.CreationMode && this.hedge$ != undefined) {
                    this.hedge$.subscribe(h => {
                        let okStateIndex = oDataPageResult.data.findIndex(y => y.Id == 1)
                        h.WorkflowStateId = oDataPageResult.data[okStateIndex].Id;
                        h.WorkflowState = oDataPageResult.data[okStateIndex];
                    });
                }
            });

        this.service.getQualifications()
            .subscribe(oDataPageResult => {
                this.qualifications$ = oDataPageResult.data;
            });

        this.service.getContracts()
            .subscribe(oDataPageResult => {
                this.contracts$ = oDataPageResult.data;
            });

        this.service.getHedgeTypes()
            .subscribe(oDataPageResult => {
                this.hedgeTypes$ = oDataPageResult.data;
            });

        this.service.getManagementIntents()
            .subscribe(oDataPageResult => {
                this.ManagementIntents$ = oDataPageResult;
            });

        this.service.getBooks()
            .subscribe(oDataPageResult => {
                this.Books$ = oDataPageResult.data;
            });

    }

    HedgeTypeChange(hedge) {
        hedge.HedgeTypeId = hedge.HedgeType.Id;
        this.refreshHedgelegPanel(hedge.HedgeType);
    }

    currencyChange(hedge) {
        hedge.CurrencyId = hedge.Currency.Id;
    }

    internalStateChange(hedge) {
        hedge.InternalStateId = hedge.InternalState.Id;
    }

    workflowStateChange(hedge) {
        hedge.WorkflowStateId = hedge.WorkflowState.Id;
    }

    qualificationChange(hedge) {
        hedge.QualificationId = hedge.Qualification.Id;
    }

    contractChange(hedgeLeg, index) {
        hedgeLeg.FxContractId = hedgeLeg.FxContract.Id;
        this.hedge$.subscribe(h => {
            //let index = h.HedgeLegs.findIndex(y => y.Id == hedgeLeg.Id);
            if (index !== -1) {
                if (hedgeLeg.FxContract.Id != undefined) {
                    this.service.getContract(hedgeLeg.FxContractId).subscribe(ctr => {
                        //init Book
                        if (h.HedgeLegs[index].FxContract != undefined && h.HedgeLegs[index].FxContract != null
                            && h.HedgeLegs[index].FxContract.Book != undefined && h.HedgeLegs[index].FxContract.Book != null) {
                            h.HedgeLegs[index].FxContract.Book = ctr.Book;
                        }
                    });

                } else {
                    //clean fxContract
                    h.HedgeLegs[index].FxContract = null;
                    h.HedgeLegs[index].FxContractId = null;
                }
                //init cargo operation
                if (h.HedgeLegs[index].Operation != undefined && h.HedgeLegs[index].Operation != null
                    && h.HedgeLegs[index].Operation.Cargo != undefined && h.HedgeLegs[index].Operation.Cargo != null) {
                    h.HedgeLegs[index].Operation = null;
                }
                //init signal contract 
                h.HedgeLegs[index].SignalContract = null;
                //clean Other underlying 
                h.HedgeLegs[index].Subjacent = null;
                h.HedgeLegs[index].UnderlyingTermId = null;
                //set underlying maturity 
                this.setUnderlyingMaturity(h.HedgeLegs[index]);

                this.hedge$ = Observable.of(h);

            }
        });

        //ordrernumber css class 
        this.getActivateOrderNumberGen();
    }

    ManagementIntentChange(hedge: Hedge) {
        hedge.ManagementIntentId = hedge.ManagementIntent.Id;
        hedge.Qualification = hedge.ManagementIntent.Qualification;
        hedge.QualificationId = hedge.ManagementIntent.Qualification.Id;
        this.getActivateOrderNumberGen();
    }

    // dateChange(leg$,$event) //:Date
    // {
    //     if($event!=null)
    //     {
    //         let y = $event.getUTCFullYear();
    //         let m = $event.getUTCMonth();
    //         let d = $event.getUTCDate() + 1;
    //         leg$.Maturity = new Date(y, m, d);
    //     }
    //     // let val = new Date(y, m, d);
    //     // return val;
    // }

    tofirstDayInMonth(leg$, date) {
        let y = date.getFullYear();
        let m = date.getMonth();
        var firstDay = new Date(y, m, 1);
        //var lastDay = new Date(y, m + 1, 0);
        //leg$.UnderlyingMonth =  moment(firstDay).format('MMM YYYY') ;
        leg$.UnderlyingMonth = firstDay;
    }

    CompareMaturityMonth(leg$: HedgeLeg): boolean {
        if (leg$.Subjacent != undefined && leg$.Subjacent != null && leg$.Subjacent.Code != null) {
            if (moment(leg$.Maturity).toDate().getFullYear() == moment(leg$.UnderlyingMaturity).toDate().getFullYear()) {
                let m1 = Number(moment(leg$.Maturity).format("MM"));
                let m2 = Number(moment(leg$.UnderlyingMaturity).format("MM"));
                return m1 == m2
            }
        } else {
            if (moment(leg$.Maturity).toDate().getFullYear() == moment(leg$.UnderlyingMonth).toDate().getFullYear()) {
                let m1 = Number(moment(leg$.Maturity).format("MM"));
                let m2 = Number(moment(leg$.UnderlyingMonth).format("MM"));
                return m1 == m2
            }
        }
        return false;
    }


    setUnderlyingMaturity(leg$: HedgeLeg) {
        if (leg$.Subjacent != undefined && leg$.Subjacent != null && leg$.Subjacent.Code != null) {
            leg$.UnderlyingMaturity = moment(leg$.Subjacent.PaymentDate).format("MM/DD/YYYY");
        } else //if(leg$.FxContract !=undefined && leg$.FxContract !=null)
        {
            leg$.UnderlyingMaturity = moment(leg$.Maturity).format("MM/DD/YYYY");
        }
    }

    computeExposure(leg$: HedgeLeg) {
        leg$.UnderlyingAmount = FormatHelper.formatNumber(leg$.Amount);
    }

    applyRuleOfRoleAndWorkflowStatus() {
        if (this.hedge$ != undefined) {
            this.hedge$.subscribe(h => {
                switch (this.currentUser.FxRoleId) {
                    case enumUserRole.ADMIN:
                        //if (h.WorkflowStateId != enumWorkFlowStatus.VALIDE) {
                        this.AllowEditAll = true;
                        this.AllowEditSiam = true;
                        //}
                        break;
                    case enumUserRole.FO:
                        if (h.WorkflowStateId != enumWorkFlowStatus.VALIDE && h.WorkflowStateId != enumWorkFlowStatus.EN_COURS) {
                            this.AllowEditAll = true;
                        }
                        break;
                    case enumUserRole.BO:
                        if (h.WorkflowStateId == enumWorkFlowStatus.EN_COURS) {
                            this.AllowEditAll = true;
                            this.AllowEditSiam = true;
                        }
                        break;
                }
            });
        }
    }

    comparator(object1, object2) {
        if (object2 != null) {
            var res = object1.Id === object2.Id;
            return res;
        } else {
            return true;
        }
    }

    autoSizeGridColumns() {
        var allColumnIds = [];
        this.agExeColumnDefs.forEach(function (columnDef) {
            allColumnIds.push(columnDef.field);
        });
        this.agExecutionFXes.columnApi.autoSizeColumns(allColumnIds);
    }

    gotoListView(): void {
        this.router.navigate(['/hedge']);
    }

    readgridExecutionFXes() {
        this.agExecutionApi.forEachNode((node) => {
            const { data } = node;
            this.hedge$.subscribe(h => {
                h.ExecutionFXes.push(<ExecutionFX>{
                    Id: data.Id,
                    Amount: data.Amount,
                    ExecutionCode: data.ExecutionCode,
                    Maturity: data.Maturity,
                    SpotRate: data.SpotRate,
                    FwdPoint: data.FwdPoint,
                    AllIn: data.AllIn,
                    ExchValue: data.ExchValue,
                    Nature: data.Nature,
                    CreationUser: data.CreationUser,
                    CreationDate: data.CreationDate,
                    ModificationUser: data.ModificationUser,
                    ModificationDate: data.ModificationDate,
                    ConfirmationNumber: data.ConfirmationNumber,

                    FXHedgeId: data.FXHedgeId,
                    PurchaseSaleId: data.PurchaseSaleId,
                    AmountCurrencyId: data.AmountCurrencyId,
                    ExchCurrencyId: data.ExchCurrencyId,
                });
            });
        });
    }

    refreshHedgelegPanel(hedgeType: HedgeType) {
        switch (hedgeType.Code) {
            case enumHedgeType[enumHedgeType.Buy]:
                this.hedge$.subscribe(h => {
                    let index = h.HedgeLegs.findIndex(y => y.PurchaseSaleId == enumPurchaseType.Vente);
                    if (index !== -1) {
                        h.HedgeLegs.splice(index, 1);
                    }
                    if (h.HedgeLegs.filter(hle => hle.PurchaseSaleId == enumPurchaseType.Achat).length < 1) {
                        h.HedgeLegs.push(new HedgeLeg(enumPurchaseType.Achat));
                    }
                    this.hedge$ = Observable.of(h);
                });
                break;
            case enumHedgeType[enumHedgeType.Sale]:
                this.hedge$.subscribe(h => {
                    let index = h.HedgeLegs.findIndex(y => y.PurchaseSaleId == enumPurchaseType.Achat);
                    if (index !== -1) {
                        h.HedgeLegs.splice(index, 1);
                    }
                    if (h.HedgeLegs.filter(hle => hle.PurchaseSaleId == enumPurchaseType.Vente).length < 1) {
                        h.HedgeLegs.push(new HedgeLeg(enumPurchaseType.Vente));
                    }
                    this.hedge$ = Observable.of(h);
                });
                break;
            case enumHedgeType[enumHedgeType.Swap]:
                this.hedge$.subscribe(h => {
                    if (h.HedgeLegs.length < 2) {
                        if (h.HedgeLegs.filter(hle => hle.PurchaseSaleId == enumPurchaseType.Achat).length < 1) {
                            h.HedgeLegs.unshift(new HedgeLeg(enumPurchaseType.Achat));// insert element at beginning
                        }

                        if (h.HedgeLegs.filter(hle => hle.PurchaseSaleId == enumPurchaseType.Vente).length < 1) {
                            h.HedgeLegs.push(new HedgeLeg(enumPurchaseType.Vente));
                        }
                    }
                    this.hedge$ = Observable.of(h);
                });
                break;

            default:
            //alert("!!!!!Wrong HedgeType.........");

        }
    }

    async onSubmit(hedge: Hedge, form: NgForm) {
        if (this.viewOpenMode == ViewOpenMode.CreationMode) {
            await this.checkUniqueOrdreNumber(hedge, form);
        }
        let check = this.checkAmount(hedge, form);
        if (check == true) {
            if (form.valid) {
                console.log(form.value);
                this.save(hedge);
            }
        }

    }

    @ViewChild('Code') codeInput;  // the fullscreen button
    async checkUniqueOrdreNumber(hedge: Hedge, form: NgForm) {
        let isUniqueCode = await this.service.isUniqueOrderNumber(hedge.Code);
        if (isUniqueCode) {
            return true;
        }
        else {
            alert("Hedge Code be unique !!!");
            form.controls['Code'].setErrors({ "Hedge Code be unique !!!": true });
            return false;
        }

        // this.service.getHedgeCodeOccurence(hedge.Code, 0)
        //     .subscribe(occCode => {
        //         if (occCode > 0) {
        //             alert("Hedge Code be unique !!!");
        //             form.controls['Code'].setErrors({ "Hedge Code be unique !!!": true });
        //             var code_input = $("#Code");
        //             let code_input = $(this.codeInput);
        //             code_input.setCustomValidity("Wrong. It's 'Ivy'.");
        //             return false;
        //         } else {
        //             return true;
        //         }
        //     })
    }

    checkAmount(hedge: Hedge, form: NgForm): boolean {
        var i = 0;
        var result: boolean = true;
        let errorMessages: string[] = [];
        if (hedge.WorkflowStateId == 2) { //en cours d’exécution
            hedge.HedgeLegs.forEach(HedgeLeg => {
                if (HedgeLeg.Amount == undefined || HedgeLeg.Amount == null) {
                    let message = "Amount is required in !!!" + enumPurchaseType[HedgeLeg.PurchaseSaleId].toString();
                    errorMessages.push(message);
                    //alert(message);
                    let idinput = "#Amount-" + i;
                    var code_input = $(idinput);
                    //pour pouvoir acceder à linput depuis from : il faut supprimer [ngModelOptions]="{standalone: true}" de l'input 
                    // et affecter une valeur à l'attribut "name" non dynamique  avec une affectation dynamique ca ne passe pas [attr.name] 
                    // form.controls['LegAmount'].setErrors({ "Hedge Code be unique !!!": true });
                    //code_input.setErrors({ message : true });
                    //code_input.css({ "Amount is required !!!": true });
                    result = false;
                }
            });
            if (errorMessages.length > 0)
                alert(errorMessages.join('\n'));
        }
        return result;
    }

    save(hedge: Hedge) {
        // let id = hedge ? hedge.Id : null;
        this.service.save(hedge).then(() =>
            //this.openAlertConfirmSave(this.alertConfirmSave)
            this.close(true)
        );
    }

    validate(hedge: Hedge): boolean {
        return true;
    }


    openPopUp(template: TemplateRef<any>) {
        this.bsModalRefAlert = this.modalService.show(
            template,
            Object.assign({}, this.config, { class: 'gray modal-md' })
        );
    }

    closeConfirmSave() {
        if (this.bsModalRefAlert.content !== undefined) {
            this.bsModalRefAlert.hide();
            this.close(true);
        }
    }

    close(forceRedresh: boolean = false): void {
        if (this.bsModalRef.content !== undefined) {
            this.bsModalRef.hide();
            if (forceRedresh) {
                this.bsModalRef.content.router.navigated = false;
                this.bsModalRef.content.router.navigate(['/hedge']);
            }
        } else {
            this.router.navigate(['/hedge']);
        }
    }

    exit(e) {
        e.preventDefault();
        if (!this.defaultHedgeIsChanged) {
            this.close(false);
        } else {
            this.openPopUp(this.alertQuitWithoutSaving);
        }
    }

    quitWithoutSaving(response: boolean) {
        if (this.bsModalRefAlert.content !== undefined) {
            this.bsModalRefAlert.hide();
        }
        if (response)
            this.close(false);
    }

    InitFormWithWorkflow() {
        if (this.hedge$ != undefined) {
            this.hedge$.subscribe(h => {
                switch (h.WorkflowState.Id) {
                    case enumWorkFlowStatus.BROUILLON:
                        if (this.workflowStates$) {
                            this.workflowStates$ = this.workflowStates$
                                .filter(ws =>
                                    ws.Id == enumWorkFlowStatus.ANNULE
                                    || ws.Id == enumWorkFlowStatus.EN_COURS
                                    || ws.Id == enumWorkFlowStatus.BROUILLON
                                )//where
                                .sort(ws => ws.Id);//orderbyorderby
                        }
                        // this.FOBOOrderNumberCurrencyTypeEnabled = this.GetAccessFOBO(this.currentUser);
                        // this.ManagementIntentActarusEnabled = this.GetAccessFOBO(this.currentUser);
                        // this.CommentEnabled = this.GetAccessFOBO(this.currentUser);
                        // this.NoticeEnabled = this.GetAccessFOBO(this.currentUser);
                        // this.QualificationEnabled = false;
                        // this.StatusEnabled = this.GetAccessFO(this.currentUser);
                        // this.NextWfStatusEnabled = this.GetAccessFO(this.currentUser);
                        // this.UnderlyingAssetEnabled = this.GetAccessFOBO(this.currentUser);
                        // this.ExecutionsEnabled = false;
                        break;

                    case enumWorkFlowStatus.ANNULE:
                        this.workflowStates$ = null;
                        break;

                    case enumWorkFlowStatus.EN_COURS:
                        if (this.workflowStates$) {
                            this.workflowStates$ = this.workflowStates$
                                .filter(ws =>
                                    ws.Id == enumWorkFlowStatus.BROUILLON
                                    || ws.Id == enumWorkFlowStatus.ANNULE
                                    || ws.Id == enumWorkFlowStatus.EN_COURS
                                )//where
                                .sort(ws => ws.Id);//orderby
                        }
                        break;

                    case enumWorkFlowStatus.VALIDE:
                        if (this.workflowStates$) {
                            this.workflowStates$ = this.workflowStates$
                                .filter(ws =>
                                    ws.Id == enumWorkFlowStatus.EN_COURS
                                    || ws.Id == enumWorkFlowStatus.VALIDE
                                )//where
                                .sort(ws => ws.Id);//orderby
                        }
                        break;

                }
            });
        }
    }

    // onChangeDate(hedge :any, e)
    // {
    //    hedge.ExecutionDate =  this.datePipe.transform(e, 'yyyy-MM-dd');
    // }

}

@Component({
    selector: 'select-cell',
    template: `<select class="form-control" [(ngModel)] = "value"
    required #Currency="ngModel" name="Currency"
    [compareWith] = "comparator"
    [ngModelOptions] = "{standalone: true}"
    (ngModelChange) ="oNChange(value)" >
    <option value="">-- select --</option>
    <option *ngFor="let item of listValue$" [ngValue] = "item"  required >
        {{item.Code }}
    </option>
    < /select>`
})
export class CurrencySelectEditorComponent implements ICellEditorAngularComp, AfterViewInit {
    @ViewChild('container') container: ViewContainerRef;
    private params: any;
    public value: any;
    listValue$: Currency[];

    constructor(private service: HedgeService) {
        //TODO : generique service
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
        if (this.value == "") {
            //this.params.$event.stopPropagation()
        } else {
            this.value = value;
        }

    }

    ngAfterViewInit() {
    }

    oNChange(value) {
        this.setValue(value);
        this.params.node.data.AmountCurrencyId = value.Id;
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
    [compareWith] = "comparator"
    [ngModelOptions] = "{standalone: true}"
    (ngModelChange) ="oNChange(value)" >
    <option *ngFor="let item of listValue$" [ngValue] = "item"  required >
        {{item.Code }}
    </option>
    < /select>`
})
export class Currency1SelectEditorComponent implements ICellEditorAngularComp, AfterViewInit {
    @ViewChild('container') container: ViewContainerRef;
    private params: any;
    public value: any;
    listValue$: Currency[];

    constructor(private service: HedgeService) {
        //TODO : generique service
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
        this.value = value;
    }

    ngAfterViewInit() {
    }

    oNChange(value) {
        this.setValue(value);
        this.params.node.data.ExchCurrencyId = value.Id;
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
    template: `
    <select class="form-control " id="currencyInput" required #Currency="ngModel" name="Currency"
      placeholder="Currency" [(ngModel)]="value"
      [compareWith]="comparator" [ngModelOptions]="{standalone: true}" (ngModelChange)="oNChange(value);">
      <option value="">-- select --</option>
      <option *ngFor="let purchaseSaleItem of purchaseSale$" [ngValue] = "purchaseSaleItem">
        {{purchaseSaleItem.Code }}
      </option>
    </select>
`
})
export class PurchaseSaleSelectEditorComponent implements ICellEditorAngularComp, AfterViewInit {
    @ViewChild('container') container: ViewContainerRef;
    private params: any;
    public value: any; //PurchaseSale;
    purchaseSale$: PurchaseSale[];

    constructor(private service: HedgeService) {

    }

    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
        //this.purchaseSale$ = this.params.context.componentParent.purchaseSale$;

        this.service.getPurchaseSale().subscribe(
            purchaseSales => {
                this.purchaseSale$ = purchaseSales.sort(HedgeService.alphabeticalSort());
            },
            error => console.log(error)
        );
        // only start edit if key pressed is a number, not a letter
        //this.cancelBeforeStart = params.charPress && ('1234567890'.indexOf(params.charPress) < 0);
    }

    getValue(): any {
        return this.value;
    }

    setValue(value) {
        this.value = value;
    }

    ngAfterViewInit() {
        // setTimeout(() => {
        //     // this.container.element.nativeElement.focus();
        // });
    }

    oNChange(value) {
        this.setValue(value);
        var selectrowData = <ExecutionFX>this.params.node.data;
        selectrowData.PurchaseSaleId = value.Id;
        //var selectedRows = this.params.context.componentParent.gridApi.getSelectedRows();
        //selectrowData.PurchaseSale.Id = purchaseSale.Id;
        //selectrowData.PurchaseSale.Code = purchaseSale.Code;
        //console.log(selectrowData);
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

const numericInputTemplate = `<input #input 
                  class="form-control currency"
                  (keydown)="onKeyDown($event)" 
                  [(ngModel)]="value"
                  [textMask]="{mask: numberMask}"
                  numeric
                  style="width: 100%;height:100%;text-align: right">`;
@Component({
    selector: 'numeric-cell',
    template: numericInputTemplate
})
export class NumericEditorComponent implements ICellEditorAngularComp, AfterViewInit {
    numberMask: any;
    @ViewChild('input') input: ViewContainerRef;
    private params: any;
    public value: number;
    private cancelBeforeStart: boolean = false;

    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
        this.numberMask = createNumberMask({
            prefix: '',
            allowDecimal: true,
            modelClean: true,
            thousandsSeparatorSymbol: ' ',
            decimalSymbol: '.',
            allowNegative: true,
            //decimalLimit : 2 ,
            requireDecimal: false,
            //suffix: ' $',
        })
        // only start edit if key pressed is a number, not a letter
        //this.cancelBeforeStart = params.charPress && ('1234567890'.indexOf(params.charPress) < 0);
    }

    getValue(): any {
        this.value = Number(this.value);
        return this.value;
    }

    isCancelBeforeStart(): boolean {
        return this.cancelBeforeStart;
    }

    // will reject the number if it greater than 1,000,000
    // not very practical, but demonstrates the method.
    isCancelAfterEnd(): boolean {
        return this.value > 1000000000000;
    }


    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        setTimeout(() => {
            //this.input.element.nativeElement.focus();
        });
    }


    onKeyDown(event): void {
        //if (!this.isKeyPressedNumeric(event)) {
        //    if (event.preventDefault) event.preventDefault();
        //}
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

// const dateInputTemplate = ` 
// <input class="form-control" 
// placeholder="MM/dd/yyyy" 
// name="inputdate"
// bsDatepicker #dp="bsDatepicker" 
// [bsConfig]="{ dateInputFormat: 'MM/DD/YYYY' }"
// type="text" [ngModelOptions]="{standalone: true}" 
// [(ngModel)]="value"
// customDate required />`;

const dateInputTemplate = `<input type="date" 
    [ngModel]="value | date:'yyyy-MM-dd'" 
    (ngModelChange)="value = $event" [value]="datee | date:'yyyy-MM-dd'" style="width: 100%;height:100%"
    customDate
    />`;
@Component({
    selector: 'date-cell',
    template: dateInputTemplate
})
export class DateEditorComponent implements ICellEditorAngularComp {
    @ViewChild('input') input: ViewContainerRef;
    private params: any;
    public value: Date;
    private cancelBeforeStart: boolean = false;

    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
        // only start edit if key pressed is a number, not a letter
        //this.cancelBeforeStart = params.charPress && ('1234567890'.indexOf(params.charPress) < 0);
    }

    getValue(): any {
        this.value = this.value;
        return this.value;
    }
}

//function extractValues(mappings) {
//    return Object.keys(mappings);
//}
//function lookupValue(mappings, key) {
//    return mappings[key];
//}
//function lookupKey(mappings, name) {
//    for (var key in mappings) {
//        if (mappings.hasOwnProperty(key)) {
//            if (name === mappings[key]) {
//                return key;
//            }
//        }
//    }
//}

function BoStatusCellRenderer(value) {
    if (value) {
        if (value === 2) {
            return "<span class='fa fa-check'  style='color:green;'></span>";
        } else {
            return "<span class='fa fa-times-circle' style='color:red;' ></span>";
        }
    } else {
        return value;
    }
}

// // we capture the click instead the submit
// $("#hedgeForm").on("click",function(){
//     var $elem = $("#Code");
//     var code = $elem.val();
//     debugger;
//     //the ajax call returns true if the email exists
//     $.get( "ajax/checkUniqueEmail", function(data) {
//         if(data === "true"){
//             //$elem.setCustomValidity("This email already exists.");
//         }else{
//             //$elem.setCustomValidity("")
//         }
//         //then we submit the hedgeForm
//         $("#hedgeForm").submit();
//     });
// });

