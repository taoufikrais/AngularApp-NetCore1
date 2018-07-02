import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild, ViewContainerRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';

import { UnderlyingService } from '../../core/services/underlying.service';

import { Subjacent, UnderlyingTerm } from '../../core/models/underlying.model';
import { HedgeLeg, Hedge } from '../../core/models/hedge.model';

import { Observable } from 'rxjs/Observable';

import { ColumnApi, GridApi, GridOptions } from "ag-grid/main";

import { ODataPagedResult } from "angular-odata-es5";
import { SubjacentType, ContractType, Currency, Book } from '../../core/models/typeCode.model';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { FormatHelper } from '../../shared/helpers/formatHelper';

import { ICellEditorAngularComp, ICellRendererAngularComp } from "ag-grid-angular";

import { BsModalService } from 'ngx-bootstrap/modal';

import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import { NgForm } from '@angular/forms';
import * as moment from 'moment';

@Component({
    selector: 'underlying-detail',
    templateUrl: './underlying-detail.component.html',
    styleUrls: ['./underlying.component.scss'],
    inputs: ['detailId'],
})

export class UnderlyingDetailComponent implements OnInit, AfterViewInit {
    private title: string;
    private subjacent$: Observable<Subjacent>;
    private subjacentId: number = 0;
    private subjacentTypes$: SubjacentType[];
    private contractTypes$: ContractType[];
    private books$: Book[];
    private gridUnderlyingTerms: GridOptions;
    private gridHedgeLegs: GridOptions;
    private gridApi: GridApi;
    private rowSelection;
    private sub: any;
    private binded = false;
    private showDialog = false;
    private underlyingTerm$: any;
    defaultHedgeIsChanged: boolean = false;
    currentEditRow: any;

    private _detailId: number = 0;
    @Input('detailId')
    set detailId(value: number) {
        this._detailId = value;
        this.databindDetail(this._detailId);
    }
    get detailId(): number {
        return this._detailId;
    }

    private columnDefsUnderlyingTerms = [
        {
            headerName: 'Name',
            field: 'Label',
            editable: true
            , required: true
        },
        {
            headerName: 'Maturity',
            field: 'Maturity',
            editable: true,
            cellEditorFramework: DateEditorComponent,
            type: 'date',
            cellRenderer(params) {
                return FormatHelper.toShortDateFormat(params.value);
            }
            , required: true
        },
        {
            headerName: 'Payment Date',
            field: 'PaymentDate',
            editable: true,
            cellEditorFramework: DateEditorComponent,
            type: 'date',
            cellRenderer(params) {
                return FormatHelper.toShortDateFormat(params.value);
            }
            , required: true
        },
        {
            headerName: 'Currency (*)',
            field: 'Currency',
            editable: true,
            cellRenderer: function (params) {
                let codeValue = params.value != null ? params.value.Code : "";
                return codeValue;
            },
            cellEditorFramework: CurrencySelectEditorComponent
            , required: true
        },
        {
            headerName: 'Amount',
            field: 'Amount',
            editable: true,
            type: 'numericColumn',
            cellEditorFramework: NumericEditorComponent,
            cellRenderer: function (params) {
                return FormatHelper.formatNumber(params.value);
            }
            , required: true
        },
        {
            headerName: 'Is BO Validated',
            field: 'IsBOValidated',
            editable: true,
            cellStyle: { 'text-align': 'center' },
            cellRendererFramework: BoValidationRenderer,
            cellEditorFramework: MoodEditor
            , required: true
        },
        {
            headerName: "Action",
            suppressMenu: true,
            suppressSorting: true,
            template: '<button type="button" action-type="delete" class="btn center-block" style="background-color:transparent; background-image:url(\'assets\\\\img\\\\icon\\\\suppr3.png\'); background-size:32px, 16px, cover"></button>'
        }
    ];

    private columnDefsHedgeLegs = [
        {
            headerName: 'Order Number',
            field: 'FXHedge.Code'
        },
        {
            headername: 'Execution Date',
            field: 'FXHedge.ExecutionDate',
            type: 'date',
            cellRenderer(params) {
                return FormatHelper.toShortDateFormat(params.value);
            }
        },
        {
            headername: 'Type',
            field: 'PurchaseSale.Code'
        },
        {
            headername: 'Maturity',
            field: 'Maturity',
            type: 'date',
            cellRenderer(params) {
                return FormatHelper.toShortDateFormat(params.value);
            }
        },
        {
            headername: 'Amount',
            field: 'Amount',
            cellRenderer: function (params) {
                return FormatHelper.formatNumber(params.value);
            }
        },
        {
            headername: 'Status',
            field: 'FXHedge.WorkflowState.Code'
        }
    ];

    constructor(private modalService: BsModalService, private route: ActivatedRoute, private router: Router,
        private service: UnderlyingService, private bsModalRef: BsModalRef = null) {
        this.title = "Underlying detail";
        this.defineGridsOptions();
    }

    databindDetail(subjacentId) {
        if (subjacentId == 0)
            this.subjacent$ = Observable.of(new Subjacent());
        else {
            this.subjacent$ = this.service.getSubjacent(subjacentId);
            this.subjacent$.subscribe(r => {
                this.databindhedgeLeg(r.UnderlyingTerms[0].Id);
            });
        }
    }

    databindhedgeLeg(hedgelegId) {
        this.service.getHedgeLegs(hedgelegId)
            .subscribe(
            (pagedResult: HedgeLeg[]) => {
                this.gridHedgeLegs.api.setRowData(pagedResult);
            });

        //this.binded = true;
    }

    defineGridsOptions() {
        this.gridUnderlyingTerms = <GridOptions>{

            columnDefs: this.columnDefsUnderlyingTerms,

            context: {
                componentParent: this,
                hedgeService: this.service
            },

            onCellFocused(e) {
                if (e.column) {
                    this.api.forEachNode(node => {
                        if (node.id == e.rowIndex)
                            node.setSelected(true, true);
                    })
                }
            },
            previousCellDef: this.columnDefsUnderlyingTerms,
            nextCellDef: this.columnDefsUnderlyingTerms,

            rowHeight: 22,
            virtualizationThreshold: 20,
            enableSorting: true,
            enablePagination: true,
            enablePaginationControls: true,
            enableRowSelection: true,
            enableSelectAll: false,
            enableRowHeaderSelection: false,
            noUnselect: true,
            enableGridMenu: true,
            multiSelect: false,
            enableColResize: true,
            suppressResize: true,
            enableCellChangeFlash: true,
            suppressFocusAfterRefresh: true,
            groupRemoveSingleChildren: true,
            enableFilter: true
        };

        this.gridHedgeLegs = <GridOptions>{

            columnDefs: this.columnDefsHedgeLegs,

            onCellFocused(e) {
                if (e.column) {
                    this.api.forEachNode(node => {
                        if (node.id == e.rowIndex)
                            node.setSelected(true, true);
                    })
                }
            },
            previousCellDef: this.columnDefsHedgeLegs,
            nextCellDef: this.columnDefsHedgeLegs,

            rowHeight: 22,
            virtualizationThreshold: 20,
            enableSorting: true,
            enablePagination: true,
            enablePaginationControls: true,
            enableRowSelection: true,
            enableSelectAll: false,
            enableRowHeaderSelection: false,
            noUnselect: true,
            enableGridMenu: true,
            multiSelect: false,
            enableColResize: true,
            suppressResize: true,
            rowStyle: { 'font-size': '10px', 'padding-bottom': '5px' },
            enableCellChangeFlash: true,
            suppressFocusAfterRefresh: true,
            groupRemoveSingleChildren: true,
            enableFilter: true


        };
        this.rowSelection = "single";
    }

    ngOnInit() {
        this.getIdfromRouterUrl();
    }

    getIdfromRouterUrl() {
        this.sub = this.route.params.subscribe(params => {
            this._detailId = +params['id'];
        });
    }

    ngAfterViewInit() {

        this.service.getSubjacentTypes()
            .subscribe(oDataPageResult => {
                this.subjacentTypes$ = oDataPageResult.data;
            });

        this.service.getContractTypes()
            .subscribe(oDataPageResult => {
                this.contractTypes$ = oDataPageResult.data;
            });

        this.service.getBooks()
            .subscribe(oDataPageResult => {
                this.books$ = oDataPageResult.data;
            });
    }

    subjacentTypeChange(subjacent) {
        subjacent.SubjacentTypeId = subjacent.SubjacentType.Id;
    }

    contractTypeChange(subjacent) {
        subjacent.PurchaseSaleId = subjacent.ContractType.Id;
    }

    bookChange(subjacent) {
        subjacent.BookId = subjacent.Book.Id;
    }

    private onReadyGridUnderlyingTerms(params) {
        this.gridApi = params.api;
        if (this.detailId != 0)
            this.gridApi.getRowNode('0').setSelected(true);

        //this.gridApi.selectNode(this.gridApi.getRowNode(0));
        //this.gridApi.forEachNode(function (node) {
        //    if (node.data.Id === r.UnderlyingTerms[0].Id) {
        //        debugger;
        //        node.setSelected(true);
        //    }
        //});

        //this.agridcolumnApi = params.columnApi;

        params.api.sizeColumnsToFit();
    }

    private onReadyGridHedgeLegs(params) {
        params.api.sizeColumnsToFit();
    }

    comparator(object1, object2) {
        if (object2 != null) {
            var res = object1.Id === object2.Id;
            return res;
        } else {
            return true;
        }
    }

    close(forceRedresh): void {
        if (this.bsModalRef.content !== undefined) {
            this.bsModalRef.hide();
            if (forceRedresh) {
                this.bsModalRef.content.router.navigated = false;
                this.bsModalRef.content.router.navigate(['/underlying']);
            }

        } else {
            this.router.navigate(['/underlying']);
        }
    }

    exit(e) {
        if (!this.defaultHedgeIsChanged)
            this.close(false);
        else if (this.refreshAfterDelete)
            this.close(true);
        else {
            e.preventDefault();
            this.openAlertQuitWithoutSaving(this.alertQuitWithoutSaving);
        }
    }

    openAlertQuitWithoutSaving(template: TemplateRef<any>) {
        this.bsModalRefAlert = this.modalService.show(
            this.alertQuitWithoutSaving,
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

    closePopUp() {
        if (this.bsModalRefAlert.content !== undefined) {
            this.bsModalRefAlert.hide();
        }
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    bsModalRefAlert: BsModalRef;
    @ViewChild("alertConfirmationDelete") alertConfirmationDelete;
    @ViewChild("alertCannotDelete") alertCannotDelete;
    @ViewChild("alertCannotSaveSubjacent") alertCannotSaveSubjacent;
    @ViewChild("alertQuitWithoutSaving") alertQuitWithoutSaving;
    config = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: true
    };
    selectedUnderlying: UnderlyingTerm;
    cannotDeleteMessage;
    refreshAfterDelete: boolean = true;
    MessageCannotSaveSubjacent = '';

    onRowClicked(e: any) {

        this.selectedUnderlying = e.data;

        this.databindhedgeLeg(this.selectedUnderlying.Id);

        if (e.event.target !== undefined) {
            let actionType = e.event.target.getAttribute("action-type");
            switch (actionType) {
                case "delete":
                    if (this.selectedUnderlying.Id != 0) {
                        this.openPopUp(this.alertConfirmationDelete);
                    }
            }
        }
    }

    openPopUp(template: TemplateRef<any>) {
        this.bsModalRefAlert = this.modalService.show(
            template,
            Object.assign({}, this.config, { class: 'gray modal-md' })
        );
    }

    //openAlertCannotDelete(template: TemplateRef<any>) {
    //    this.bsModalRefAlert = this.modalService.show(
    //        this.alertCannotDelete,
    //        Object.assign({}, this.config, { class: 'gray modal-md' })
    //    );
    //}

    //openAlertCannotSaveNewSubjacent(template: TemplateRef<any>) {
    //    this.bsModalRefAlert = this.modalService.show(
    //        this.alertCannotSaveNewSubjacent,
    //        Object.assign({}, this.config, { class: 'gray modal-md' })
    //    );
    //}

    confirmation(yesNo: boolean) {
        if (this.bsModalRefAlert.content !== undefined) {
            this.bsModalRefAlert.hide();
        }
        if (yesNo) {
            this.service.deleteUnderlyingTerm(this.selectedUnderlying)
                .catch(e => {
                    this.refreshAfterDelete = false;
                    this.cannotDeleteMessage = e._body;
                    this.openPopUp(this.alertCannotDelete);
                }).then(() => {
                    if (this.refreshAfterDelete) {
                        this.subjacent$.subscribe(s => {
                            s.UnderlyingTerms.splice(0, s.UnderlyingTerms.findIndex(u => u.Id == this.selectedUnderlying.Id));
                            this.gridApi.setRowData(s.UnderlyingTerms);
                            this.gridApi.redrawRows();
                            this.subjacent$ = Observable.of(s);
                        });
                        //this.binded = false;
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

    newUnderlyingTerm(e) {
        e.preventDefault();
        var newUnderlyingTerm = new UnderlyingTerm();
        this.subjacent$.subscribe(s => {
            newUnderlyingTerm.UnderlyingId = s.Id;
            s.UnderlyingTerms.unshift(newUnderlyingTerm);
            this.subjacent$ = Observable.of(s);
            this.gridApi.setRowData(s.UnderlyingTerms);
        }, (err) => {
            alert('err');
        }, () => {
            this.startEditingRow(0, "Label");
        }
        );
    }

    save(subjacent: Subjacent) {
        if (subjacent.Code == null || subjacent.Code == '' || subjacent.SubjacentType == null || subjacent.ContractType == null || subjacent.Book == null) {
            this.MessageCannotSaveSubjacent = 'Invalid Subjacent data !';
            this.openPopUp(this.alertCannotSaveSubjacent);
        }
        else if (subjacent.UnderlyingTerms.length <= 0) {

            this.MessageCannotSaveSubjacent = 'The maturities must have one or several terms !';
            this.openPopUp(this.alertCannotSaveSubjacent);
        }
        else {
            let UniqueMaturity = true;
            subjacent.UnderlyingTerms.forEach(u => {
                if (subjacent.UnderlyingTerms.filter(v => v.Maturity.toString().substring(5, 7) == u.Maturity.toString().substring(5, 7)
                    && v.Maturity.toString().substring(0, 4) == u.Maturity.toString().substring(0, 4)).length != 1) {
                    UniqueMaturity = false;
                }
            });

            if (!UniqueMaturity) {
                this.MessageCannotSaveSubjacent = 'The maturiry must be unique !';
                this.openPopUp(this.alertCannotSaveSubjacent);
            }
            else {

                let checkData: boolean = true;

                subjacent.UnderlyingTerms.forEach(u => {
                    if (u.Label == null || u.Label == '' || u.Maturity == null || u.PaymentDate == null || Currency == null || u.IsBOValidated == null) {
                        checkData = false;
                    }
                });

                if (!checkData) {
                    this.MessageCannotSaveSubjacent = 'Invalid data in the grid of maturities !';
                    this.openPopUp(this.alertCannotSaveSubjacent);
                }
                else
                    this.service.save(subjacent).then(() => this.close(true));
            }
        }
    }

    startEditingRow(key, filedName) {
        //this.gridApi.setFocusedCell(key, filedName);
        this.gridApi.startEditingCell({
            rowIndex: key,
            colKey: filedName,
        });
    }

    stopEditingRow(event) {
        let t = event.target || event.srcElement || event.currentTarget;
        if (this.currentEditRow)
            if (this.validateRow(this.currentEditRow.data))
                this.gridApi.stopEditing();
    }

    onSubmit(subjacent: Subjacent, form: NgForm) {
        if (form.valid)
            this.save(subjacent);
    }

    validateRow(data: UnderlyingTerm): boolean {
        if (!data)
            return true;
        if (data.Label === undefined || !data.Label)
            return false
        if (data.CurrencyId === undefined || !data.CurrencyId)
            return false
        if (data.Amount === undefined || !data.Amount)
            return false
        return true;
    }

    documentClick(event) {
        let eventfromAgGrid = $(event.target).closest('.ag-blue');//.attr('id');
        if (eventfromAgGrid === undefined)
            this.stopEditingRow(event);
    }

    onCellValueChanged(e: any) {
        this.currentEditRow = e.node;
        //if (!this.validateRow(e.node.data))
        //    this.startEditingRow(e.rowIndex, e.column.colId)
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

                //if (this.params.column.colDef.field == 'Maturity') {

                //    let date = moment(this.value).toDate();
                //    let month = date.getMonth() + 1;
                //    let year = date.getFullYear();

                //    this.value = moment(month + '/01/' + year).toDate();
                //    return this.value;
                //}
                //else
                //return moment(this.value).toDate();
                return this.value;
            }
            else
                return null;
        }
        else
            return null;
        //this.value = this.value;
        //return this.value;
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

    constructor(private service: UnderlyingService) {
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
        return this.value > 1000000;
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


