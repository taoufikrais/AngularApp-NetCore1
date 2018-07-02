import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild, ViewContainerRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { ColumnApi, GridApi, GridOptions } from "ag-grid/main";

import { PriceService } from '../../core/services/price.service';
import { TimeSerie, TimeSerieValue } from '../../core/models/timeserie.model';

import { ODataPagedResult } from "angular-odata-es5";

import { FormatHelper } from '../../shared/helpers/formatHelper';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { PriceDetailComponent } from './price-detail.component';

import { Observable } from 'rxjs/Observable';

import { Currency, Unit } from '../../core/models/typeCode.model';

import { ICellEditorAngularComp, ICellRendererAngularComp } from "ag-grid-angular";

import { NgForm } from '@angular/forms';
import * as moment from 'moment';
@Component({
    selector: 'price-list',
    templateUrl: './price-list.component.html',
    styleUrls: ['/price.component.scss']
})

export class PricelistComponent implements OnInit, AfterViewInit {
    private gridOptionsTS: GridOptions;
    private gridOptionsTSV: GridOptions;
    private gridApiTS;
    private gridApiTSV;
    private columnDefsTS;
    private columnDefsTSV;
    bsModalRef: BsModalRef;
    timeSeries$: Observable<TimeSerie[]>;
    private rowSelection;
    timeSerieValues$: Observable<TimeSerieValue[]>
    private BreakException = {};
    rowIdTS = 0;
    init: boolean = true;
    currentEditRow: any;

    constructor(private route: ActivatedRoute, private router: Router,
        private priceService: PriceService, private modalService: BsModalService) {
        this.columnDefsTS = this.setColumnDefTS();
        this.columnDefsTSV = this.setColumnDefTSV();
        this.forceRefreshSameRoute();
        this.defineGridOption();
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

    defineGridOption() {
        this.gridOptionsTS = <GridOptions>{
            columnDefs: this.columnDefsTS,

            context: {
                componentParent: this,
                priceService: this.priceService
            },

            onCellFocused(e) {
                if (e.column) {
                    this.api.forEachNode(node => {
                        if (node.id == e.rowIndex)
                            node.setSelected(true, true);
                    })
                }
            },
            previousCellDef: this.columnDefsTS,
            nextCellDef: this.columnDefsTS,

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
        this.gridOptionsTSV = <GridOptions>{
            columnDefs: this.columnDefsTSV,

            context: {
                componentParent: this,
                priceService: this.priceService
            },

            onCellFocused(e) {
                if (e.column) {
                    this.api.forEachNode(node => {
                        if (node.id == e.rowIndex)
                            node.setSelected(true, true);
                    })
                }
            },
            previousCellDef: this.columnDefsTSV,
            nextCellDef: this.columnDefsTSV,

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
        this.rowSelection = "single";
    }

    setColumnDefTS() {
        var columnsDefs = [
            {
                headerName: 'Price Curve (*)',
                field: 'Code',
                sort: "asc",
                editable: true
                , required: true
            },
            {
                headerName: 'Comments',
                field: 'Comment'
                , sort: "asc",
                editable: true
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
                headerName: 'Unit (*)',
                field: 'Unit',
                editable: true,
                cellRenderer: function (params) {
                    let codeValue = params.value != null ? params.value.Code : "";
                    return codeValue;
                },
                cellEditorFramework: UnitSelectEditorComponent
                , required: true
            },
            {
                headerName: 'Import STORM',
                field: 'IsToBeImported',
                //cellRenderer: (params: { value: boolean }) => params.value ? '<center><input type="checkbox" [(ngModel)]="value" checked id="IsToBeImported"></center>'
                //    : '<center><input type="checkbox" [(ngModel)]="value" unchecked id="IsToBeImported"></center>'
                cellRenderer: (params) => {
                    if (params.data.Currency.Code == 'USD') {
                        if (params.value) {
                            return '<center><input type="checkbox" [(ngModel)]="value" checked id="IsToBeImported"></center>'
                        }
                        else {
                            return '<center><input type="checkbox" [(ngModel)]="value" unchecked id="IsToBeImported"></center>'
                        }
                    }
                    else {
                        if (params.value) {
                            return '<center><input type="checkbox" [(ngModel)]="value" checked id="IsToBeImported" disabled></center>'
                        }
                        else {
                            return '<center><input type="checkbox" [(ngModel)]="value" unchecked id="IsToBeImported" disabled></center>'
                        }
                    }
                }
            },
            {
                headerName: "Action",
                suppressMenu: true,
                suppressSorting: true,
                template: '<button type="button" action-type="delete" class="btn center-block" style="background-color:transparent; background-image:url(\'assets\\\\img\\\\icon\\\\suppr3.png\'); background-size:32px, 16px, cover"></button>'
            }];
        return columnsDefs;
    }

    setColumnDefTSV() {
        var columnsDefs = [
            {
                headerName: 'Month (*)',
                field: 'Date',
                sort: "asc",
                editable: true,
                cellEditorFramework: DateEditorComponent,
                type: 'date',
                cellRenderer(params) {
                    return FormatHelper.toShortDateFormat(params.value);
                }
                , required: true
            },
            {
                headerName: 'Value (*)',
                field: 'Value'
                , sort: "asc",
                editable: true,
                type: 'numericColumn',
                cellEditorFramework: NumericEditorComponent,
                cellRenderer: function (params) {
                    return FormatHelper.formatNumberValueTimeSerieValue(params.value);
                }
                , required: true
            },
            {
                headerName: "Action",
                suppressMenu: true,
                suppressSorting: true,
                template: '<button type="button" action-type="delete" class="btn center-block" style="background-color:transparent; background-image:url(\'assets\\\\img\\\\icon\\\\suppr3.png\'); background-size:32px, 16px, cover"></button>'
            }];
        return columnsDefs;
    }

    ngOnInit() {
        this.bindTimeSeries();
    }

    ngAfterViewInit() {
        this.loadFirstTimeSerieValues();
    }

    loadFirstTimeSerieValues() {
        this.priceService.getTimeSeries().subscribe(l => {

            for (let i = 0; i < l.length - 1; i++)
                for (let j = 1; j < l.length; j++)
                    if (l[i].Code > l[j].Code) {
                        let tmp = l[i];
                        l[i] = l[j];
                        l[j] = tmp;
                    }
                    else if (l[i].Comment > l[j].Comment) {
                        let tmp = l[i];
                        l[i] = l[j];
                        l[j] = tmp;
                    }

            this.selectedTimeSerie = l[0];
            this.bindTimeSerieValues();
        });
    }

    bindTimeSeries() {
        this.timeSeries$ = this.priceService.getTimeSeries();
    }

    bindTimeSerieValues() {
        this.timeSerieValues$ = Observable.of(this.selectedTimeSerie.TimeSerieValues);
    }

    onGridReadyTS(params) {
        this.gridApiTS = params.api;
        params.api.sizeColumnsToFit();

        if (!this.init)
            this.gridApiTS.getRowNode(this.rowIdTS).setSelected(true);
        else {
            this.gridApiTS.forEachNode(n => {
                if (n.rowIndex == 0) {
                    try {
                        this.gridApiTS.getRowNode(n.id).setSelected(true);
                        throw this.BreakException;
                    } catch (e) {
                        if (e !== this.BreakException) throw e;
                    }
                }
            });
        }
    }

    onGridReadyTSV(params) {
        this.gridApiTSV = params.api;
        params.api.sizeColumnsToFit();
    }

    openModal(id) {
        this.bsModalRef = this.modalService.show(PriceDetailComponent);
        this.bsModalRef.content.title = true;
        this.bsModalRef.content.detailId = id;
    }

    comparator(object1, object2) {
        if (object2 != null) {
            var res = object1.Id === object2.Id;
            return res;
        } else {
            return true;
        }
    }

    onRowClickedTS(e: any) {

        this.selectedTimeSerie = e.data;

        this.bindTimeSerieValues();

        if (e.event.target !== undefined) {
            let actionType = e.event.target.getAttribute("action-type");
            switch (actionType) {
                case "delete":
                    this.checkAssociatedFormulaCommoHedges();
            }

            if (e.event.target.type == 'checkbox') {
                e.node.data.IsToBeImported = e.event.target.checked;
            }
        }
    }

    onRowClickedTSV(e: any) {

        this.selectedTimeSerieValue = e.data;

        if (e.event.target !== undefined) {
            let actionType = e.event.target.getAttribute("action-type");
            switch (actionType) {
                case "delete":
                    this.confirmationType = "TimeSerieValue";
                    this.openPopUp(this.alertConfirmationDelete);
            }
        }
    }

    selectedTimeSerieValue: TimeSerieValue;
    selectedTimeSerie: TimeSerie;
    @ViewChild("alertCannotDelete") alertCannotDelete;
    bsModalRefAlert: BsModalRef;
    config = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: true
    };
    cannotDeleteMessage;
    @ViewChild("alertConfirmationDelete") alertConfirmationDelete;
    confirmationType;
    withoutSaveChanges;
    MessageCannotSave = '';
    @ViewChild("alertCannotSave") alertCannotSave;

    checkAssociatedFormulaCommoHedges() {
        if (this.selectedTimeSerie.Formulae.length > 0) {
            this.cannotDeleteMessage = "Formula";
            this.openPopUp(this.alertCannotDelete);
        }
        else if (this.selectedTimeSerie.CommodityHedges.length > 0) {
            this.cannotDeleteMessage = "Commodity Hedges";
            this.openPopUp(this.alertCannotDelete);
        }
        else {
            this.confirmationType = "TimeSerie";
            this.openPopUp(this.alertConfirmationDelete);
        }
    }

    closeAlertCannotDelete() {
        if (this.bsModalRefAlert.content !== undefined) {
            this.bsModalRefAlert.hide();
        }
    }

    openPopUp(template: TemplateRef<any>) {
        this.bsModalRefAlert = this.modalService.show(
            template,
            Object.assign({}, this.config, { class: 'gray modal-md' })
        );
    }

    confirmation(yesNo: boolean) {
        if (this.bsModalRefAlert.content !== undefined) {
            this.bsModalRefAlert.hide();
        }
        if (yesNo) {

            if (this.confirmationType == "TimeSerie") {
                this.priceService.deleteTimeSerie(this.selectedTimeSerie).then(() => {
                    this.bindTimeSeries();
                }).then(() => {
                    this.loadFirstTimeSerieValues();
                });
            }
            else if (this.confirmationType == "TimeSerieValue") {
                this.priceService.deleteTimeSerieValue(this.selectedTimeSerieValue).then(() => {
                    this.timeSeries$.subscribe(listTS => {
                        listTS.forEach(ts => {
                            if (ts.Id == this.selectedTimeSerie.Id) {
                                ts.TimeSerieValues.splice(ts.TimeSerieValues.findIndex(tsv => tsv.Id == this.selectedTimeSerieValue.Id), 1);
                                this.selectedTimeSerie.TimeSerieValues.splice(this.selectedTimeSerie.TimeSerieValues.findIndex(tsv => tsv.Id == this.selectedTimeSerieValue.Id), 1);
                                this.timeSerieValues$ = Observable.of(ts.TimeSerieValues);
                            }
                        });
                    });
                });

            }
        }
    }

    //openAlertCannotDelete(template: TemplateRef<any>) {
    //    this.bsModalRefAlert = this.modalService.show(
    //        this.alertCannotDelete,
    //        Object.assign({}, this.config, { class: 'gray modal-md' })
    //    );
    //}

    save(timeSeries: TimeSerie[]) {

        let InvalidDataTSV: boolean = false;
        let InvalidDataTS: boolean = false;

        timeSeries.forEach(ts => {
            if (ts.Code == null || ts.Code == '' || ts.Currency == null || ts.Unit == null)
                try {
                    InvalidDataTS = true;
                    throw this.BreakException;
                } catch (e) {
                    if (e !== this.BreakException) throw e;
                }
            else {
                ts.TimeSerieValues.forEach(tsv => {
                    if (tsv.Date != null && tsv.Date != undefined) {
                        if (tsv.Date.toString() == 'Invalid Date')
                            try {
                                InvalidDataTSV = true;
                                throw this.BreakException;
                            } catch (e) {
                                if (e !== this.BreakException) throw e;
                            }
                    }
                    else {
                        try {
                            InvalidDataTSV = true;
                            throw this.BreakException;
                        } catch (e) {
                            if (e !== this.BreakException) throw e;
                        }
                    }
                });
            }
        });

        if (InvalidDataTS) {
            this.MessageCannotSave = 'Invalid Price curve data !';
            this.openPopUp(this.alertCannotSave);
        }
        else if (InvalidDataTSV) {
            this.MessageCannotSave = 'Invalid Date in Price value grid !';
            this.openPopUp(this.alertCannotSave);
        }
        else {

            this.init = false;

            this.gridApiTS.forEachNode(n => {
                if (n.selected == true)
                    try {
                        this.rowIdTS = n.id;
                        throw this.BreakException;
                    } catch (e) {
                        if (e !== this.BreakException) throw e;
                    }
            });

            let i = 0;

            timeSeries.forEach(x => {
                this.priceService.save(x)
                    .then(() => {
                        i++;
                        if (i == timeSeries.length) {
                            this.bindTimeSeries();
                            this.bindTimeSerieValues();
                            this.withoutSaveChanges = '';
                        }
                    })
            });
        }
    }

    closePopUp() {
        if (this.bsModalRefAlert.content !== undefined) {
            this.bsModalRefAlert.hide();
        }
    }

    cellValueChangedTS(e) {
        this.withoutSaveChanges = "without saving changes";

        this.currentEditRow = e.node;
        //if (!this.validateRowTS(e.node.data))
        //    this.startEditingRow('TS', e.rowIndex, e.column.colId)

        if (e.column.colId == 'Currency') {
            var nodesArray = [].slice.call(document.querySelectorAll("[id='IsToBeImported']"));
            if (e.node.data.Currency.Code == 'USD') {
                nodesArray[e.rowIndex].disabled = false;
            } else {
                nodesArray[e.rowIndex].disabled = true;
            }
        }
    }

    cellValueChangedTSV(e) {
        this.withoutSaveChanges = "without saving changes";

        this.currentEditRow = e.node;
        //if (!this.validateRowTSV(e.node.data))
        //    this.startEditingRow('TSV', e.rowIndex, e.column.colId)
    }

    newTimeSerieValue() {
        var newTimeSerieValue = new TimeSerieValue();
        newTimeSerieValue.TimeSerieId = this.selectedTimeSerie.Id;
        this.selectedTimeSerie.TimeSerieValues.unshift(newTimeSerieValue);
        this.gridApiTSV.setRowData(this.selectedTimeSerie.TimeSerieValues);
        this.startEditingRow('TSV', 0, "Date");
    }

    newTimeSerie() {
        this.timeSeries$.subscribe(listTS => {
            listTS.unshift(new TimeSerie());
            this.timeSeries$ = Observable.of(listTS);
            this.gridApiTS.setRowData(listTS);
        }, () => {
            this.startEditingRow('TS', 0, "Code");
        });
    }

    stopEditingRow(event) {
        let t = event.target || event.srcElement || event.currentTarget;

        if (this.currentEditRow) {
            if (t.id != "newTimeSerieValue") {
                if (this.validateRowTSV(this.currentEditRow.data)) {
                    if (this.gridApiTSV != null)
                        this.gridApiTSV.stopEditing();
                }
            }
            else if (t.id != "newTimeSerie") {
                if (this.validateRowTS(this.currentEditRow.data)) {
                    if (this.gridApiTS != null)
                        this.gridApiTS.stopEditing();
                }
            }
        }
    }

    validateRowTSV(data: TimeSerieValue): boolean {
        if (!data)
            return true;
        if (data.Date === undefined || !data.Date)
            return false
        if (data.Value === undefined || !data.Value)
            return false
        return true;
    }

    validateRowTS(data: TimeSerie): boolean {
        if (!data)
            return true;
        if (data.Code === undefined || !data.Code)
            return false
        if (data.Comment === undefined || !data.Comment)
            return false
        if (data.CurrencyId === undefined || !data.CurrencyId)
            return false
        if (data.UnitId === undefined || !data.UnitId)
            return false
        return true;
    }

    startEditingRow(gridName, key, filedName) {
        if (gridName == 'TSV') {
            //this.gridApiTSV.setFocusedCell(0, filedName);
            this.gridApiTSV.startEditingCell({
                rowIndex: key,
                colKey: filedName,
            });
        }
        else if (gridName == 'TS') {
            //this.gridApiTS.setFocusedCell(0, filedName);
            this.gridApiTS.startEditingCell({
                rowIndex: key,
                colKey: filedName,
            });
        }
    }

    documentClick(event) {
        let eventfromAgGrid = $(event.target).closest('.ag-blue');//.attr('id');
        if (eventfromAgGrid === undefined)
            this.stopEditingRow(event);
    }

    reset() {
        this.bindTimeSeries();
        this.loadFirstTimeSerieValues();
    }

    onSubmit(timeSeries: TimeSerie[], form: NgForm) {
        if (form.valid && timeSeries != undefined)
            this.save(timeSeries);
    }
}

@Component({
    selector: 'codeactionrender',
    template: '<a routerLink="/price/{{params.value}}"><span class="badge"> {{params.data.Id}}</span>{{params.data.Code }}</a>'
})
export class PriceActionRendererComponent {
    private params: any;
    agInit(params: any): void {
        this.params = params;
    }
}

@Component({
    selector: 'select-cell',
    template: `<select class="form-control" [(ngModel)] = "value"
    [compareWith] = "comparator"
    [ngModelOptions] = "{standalone: true}"
    required #Currency="ngModel"
    (ngModelChange) ="onChange(value)" >
    <option value="">-- select --</option>
    <option *ngFor="let item of listValue$" [ngValue] = "item"  required >
        {{item.Code }}
    </option>
    < /select>`
})
export class CurrencySelectEditorComponent implements ICellEditorAngularComp {
    @ViewChild('container') container: ViewContainerRef;
    private params: any;
    public value: any;
    listValue$: Currency[];

    constructor(private service: PriceService) {
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
    [compareWith] = "comparator"
    [ngModelOptions] = "{standalone: true}"
    required #Unit="ngModel"
    (ngModelChange) ="onChange(value)" >
    <option value="">-- select --</option>
    <option *ngFor="let item of listValue$" [ngValue] = "item"  required >
        {{item.Code }}
    </option>
    < /select>`
})
export class UnitSelectEditorComponent implements ICellEditorAngularComp {
    @ViewChild('container') container: ViewContainerRef;
    private params: any;
    public value: any;
    listValue$: Unit[];

    constructor(private service: PriceService) {
        this.service.getUnits()
            .subscribe(oDataPageResult => {
                this.listValue$ = oDataPageResult.data.filter(d => d.Code != '');
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
        this.params.node.data.UnitId = value.Id;
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

                let date = moment(this.value).toDate();
                let month = date.getMonth() + 1;
                let year = date.getFullYear();

                this.value = moment(month + '/01/' + year).toDate();
                return this.value;
            }
            else
                return null;
        }
        else
            return null;
    }
}






