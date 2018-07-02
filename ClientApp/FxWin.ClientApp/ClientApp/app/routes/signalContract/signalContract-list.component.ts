import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router, ParamMap, NavigationEnd } from '@angular/router';

import { GridOptions } from "ag-grid/main";
import { ICellEditorAngularComp } from "ag-grid-angular";

import { SignalContractService } from '../../core/services/signalContract.service';

import { ODataPagedResult } from "angular-odata-es5";

import { FormatHelper } from '../../shared/helpers/formatHelper';

import { Observable } from 'rxjs/Observable';

import { NgForm } from '@angular/forms';

import { LinkFxContractSignalContract, PurchaseContract, SignalContractExclusion } from '../../core/models/signalContract.model';
import { SupplyContract } from '../../core/models/SupplyContract.model';
import { Contract } from '../../core/models/contract.model';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
    templateUrl: './signalContract-list.component.html',
    styleUrls: ['signalContract-list.component.scss']
})

export class SignalContractlistComponent implements OnInit {

    private gridPurchase: GridOptions;
    columnDefsPurchase = [
        {
            headerName: 'Include',
            field: 'Include',

            cellRenderer: (params: { value: boolean }) => params.value ? '<center><input type="checkbox" id="Include" [(ngModel)]="value" checked></center>'
                : '<center><input type="checkbox" id="Include" [(ngModel)]="value" unchecked></center>'
        },
        {
            headerName: 'Signal Contract',
            field: 'PurchaseContract',

            editable: true,

            cellRenderer: function (params) {
                return params.value.Code;
            },

            cellEditorFramework: SelectEditorPurchaseContractComponent

            , sort: "asc"
        },
        {
            headerName: 'FxWin Contract',
            field: 'FxContract',

            editable: true,

            cellRenderer(rowData) {
                return getFxContractCode(rowData);
            },

            cellEditorFramework: SelectEditorFxContractComponent

            , sort: "asc"
        },
        {
            headerName: 'Import STORM',
            field: 'IsToBeStormImported',
            hide : true,
            cellRenderer: (params: { value: boolean }) => params.value ? '<center><input type="checkbox" id="IsToBeStormImported" [(ngModel)]="value" checked></center>'
                : '<center><input type="checkbox" id="IsToBeStormImported"d [(ngModel)]="value" unchecked></center>'
        },
        {
            headerName: "Action",
            suppressMenu: true,
            suppressSorting: true,
            hide : true,
            template: '<button type="button" action-type="delete" class="btn center-block" style="background-color:transparent; background-image:url(\'assets\\\\img\\\\icon\\\\suppr3.png\'); background-size:32px, 16px, cover"></button>'
        }
    ];

    private gridSupply: GridOptions;
    columnDefsSupply = [
        {
            headerName: 'Include',
            field: 'Include',

            cellRenderer: (params: { value: boolean }) => params.value ? '<center><input type="checkbox" id="Include" [(ngModel)]="value" checked></center>'
                : '<center><input type="checkbox" id="Include" [(ngModel)]="value" unchecked></center>'
        },
        {
            headerName: 'Signal Contract',
            field: 'SupplyContract',

            editable: true,

            cellRenderer: function (params) {
                return params.value.Code;
            },

            cellEditorFramework: SelectEditorSupplyContractComponent

            , sort: "asc"
        },
        {
            headerName: 'FxWin Contract',
            field: 'FxContract',

            editable: true,

            cellRenderer(rowData) {
                return getFxContractCode(rowData);
            },

            cellEditorFramework: SelectEditorFxContractComponent

            , sort: "asc"
        },
        {
            headerName: 'Import STORM',
            field: 'IsToBeStormImported',
            hide : true,
            cellRenderer: (params: { value: boolean }) => params.value ? '<center><input type="checkbox" id="IsToBeStormImported" [(ngModel)]="value" checked></center>'
                : '<center><input type="checkbox" id="IsToBeStormImported" [(ngModel)]="value" unchecked></center>'
        },
        {
            headerName: "Action",
            suppressMenu: true,
            suppressSorting: true,
            hide : true,
            template: '<button type="button" action-type="delete" class="btn center-block" style="background-color:transparent; background-image:url(\'assets\\\\img\\\\icon\\\\suppr3.png\'); background-size:32px, 16px, cover"></button>'
        }
    ];

    private gridExclusion: GridOptions;
    columnDefsExclusion = [
        {
            headerName: 'Purchase Contract',
            field: 'PurchaseContract',

            editable: true

            , cellRenderer: function (params) {
                return params.value.Code;
            }

            , cellEditorFramework: SelectEditorPurchaseContractExclusionComponent

            , sort: "asc"
        },
        {
            headerName: 'Sale Contract',
            field: 'SupplyContract',

            editable: true

            , cellRenderer: function (params) {
                return params.value.Code;
            }

            , cellEditorFramework: SelectEditorSupplyContractExclusionComponent

            , sort: "asc"
        },
        {
            headerName: "Action",
            suppressMenu: true,
            suppressSorting: true,
            template: '<button type="button" action-type="delete" class="btn center-block" style="background-color:transparent; background-image:url(\'assets\\\\img\\\\icon\\\\suppr3.png\'); background-size:32px, 16px, cover"></button>'
        }
    ];

    purchaseContract$: PurchaseContract[];
    supplyContract$: SupplyContract[];
    fxContract$: Contract[];

    private editType;

    private rowSelectionPurchase;
    private rowSelectionSupply;
    private rowSelectionExclusion;

    newSignalContractExclusion$: Observable<SignalContractExclusion>;
    listPurchaseContracts$: PurchaseContract[];
    listSupplyContracts$: SupplyContract[];
    listFxWinContracts$: Contract[];
    newSignalContractPurchase$: Observable<LinkFxContractSignalContract>;
    newSignalContractSupply$: Observable<LinkFxContractSignalContract>;

    fxsignalContractPurchase: LinkFxContractSignalContract[];
    fxsignalContractSupply: LinkFxContractSignalContract[];
    fxsignalContractExclusion: SignalContractExclusion[];

    bsModalRef: BsModalRef;
    config = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: true
    };

    //Imporatnt : modal template not used actually : je laise le code pour de besoins futures
    @ViewChild("modalContractExclusion") modalContractExclusion;
    @ViewChild("modalContractPurchase") modalContractPurchase;
    @ViewChild("modalContractSupply") modalContractSupply;

    constructor(private route: ActivatedRoute, private router: Router, private signalContractService: SignalContractService,
        private modalService: BsModalService, private vcRef: ViewContainerRef) {

        this.gridPurchase = <GridOptions>{

            columnDefs: this.columnDefsPurchase,

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

            , context: {
                componentParent: this,
                signalContractService: this.signalContractService,

                myPurchaseContract: this.purchaseContract$,
                myFxContract: this.fxContract$
            }
            , getRowStyle: function (params) {
                if (params.data['IsNew'] === true)
                    return { 'background-color': '#ff9b9b' }
                return { 'background-color': '#ECF3F9' };
            }
        };
        this.gridSupply = <GridOptions>{

            columnDefs: this.columnDefsSupply,

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

            , context: {
                componentParent: this,
                signalContractService: this.signalContractService,

                mySupplyContract: this.supplyContract$,
                myFxContract: this.fxContract$
            }
            , getRowStyle: function (params) {
                if (params.data['IsNew'] === true)
                    return { 'background-color': '#ff9b9b' }
                return { 'background-color': '#ECF3F9' };
            }
        };
        this.gridExclusion = <GridOptions>{

            columnDefs: this.columnDefsExclusion,

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

            , context: {
                componentParent: this,
                signalContractService: this.signalContractService,

                myPurchaseContract: this.purchaseContract$,
                mySupplyContract: this.supplyContract$
            }
            , getRowStyle: function (params) {
                return { 'background-color': '#ECF3F9' };
            }
        };

        this.editType = "fullRow";

        this.rowSelectionPurchase = "single";
        this.rowSelectionSupply = "single";
        this.rowSelectionExclusion = "single";
        this.forceRefreshSameRoute();
    }

    private onReadyGridPurchase(params) {
        this.bindGridPurchase();
        params.api.sizeColumnsToFit();
    }
    private onReadyGridSupply(params) {
        this.bindGridSupply();
        params.api.sizeColumnsToFit();
    }
    private onReadyGridExclusion(params) {
        this.bindGridExclusion();
        params.api.sizeColumnsToFit();
    }

    ngOnInit() {

        this.loadListPurchaseContracts();
        this.loadListSupplyContracts();
        this.loadListFxWinContracts();

        this.initNewSignalContractPurchase();
        this.initNewSignalContractSupply();
        this.initNewSignalContractExclusion();
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

    // Imporatnt : vcRef utilusé uniquement pour le modal popup avec template je laise le code pour de besoins futures
    openPopUp(template: TemplateRef<any>) {
        this.bsModalRef = this.modalService.show(
            template,
            Object.assign({}, this.config, { class: 'gray modal-md' })
        );
        //this.bsModalRef.content.title = "modalContractExclusion"; // appel asynchrone bsModal est encore undefined pour lui attribuer le titre
        //this.bsModalRef.content.detailId = id;
    }

    close(refresh: boolean = false, page): void {
        if (this.bsModalRef.content !== undefined) {
            this.bsModalRef.hide();
            if (refresh) {
                this.router.navigated = false;
                this.router.navigate([page]);
            }
        }
    }

    bindGridPurchase() {
        this.signalContractService.getSignalContractsPurchase().subscribe(list => { this.fxsignalContractPurchase = list });
    }
    bindGridSupply() {
        this.signalContractService.getSignalContractsSupply().subscribe(list => { this.fxsignalContractSupply = list });
    }
    bindGridExclusion() {
        this.signalContractService.getSignalContractExclusions().subscribe(list => { this.fxsignalContractExclusion = list });
    }

    loadListPurchaseContracts() {

        this.signalContractService.getPurchaseContracts()
            .subscribe(result => {
                this.listPurchaseContracts$ = result;
            });
    }
    loadListSupplyContracts() {

        this.signalContractService.getSupplyContracts()
            .subscribe(result => {
                this.listSupplyContracts$ = result;
            });
    }
    loadListFxWinContracts() {

        this.signalContractService.getFxContracts()
            .subscribe(result => {
                this.listFxWinContracts$ = result;
            });
    }

    initNewSignalContractPurchase() {
        this.newSignalContractPurchase$ = Observable.of(new LinkFxContractSignalContract());
    }
    initNewSignalContractSupply() {
        this.newSignalContractSupply$ = Observable.of(new LinkFxContractSignalContract());
    }
    initNewSignalContractExclusion() {
        this.newSignalContractExclusion$ = Observable.of(new SignalContractExclusion());
    }

    comparator(object1, object2) {
        if (object2 != null) {
            var res = object1.Id === object2.Id;
            return res;
        } else {
            return true;
        }
    }

    signalContractPurchaseChange(signalContract: LinkFxContractSignalContract) {
        signalContract.PurchaseContractId = signalContract.PurchaseContract.Id;
    }
    signalContractSupplyChange(signalContract: LinkFxContractSignalContract) {
        signalContract.SupplyContractId = signalContract.SupplyContract.Id;
    }
    signalContractFxWinChange(signalContract: LinkFxContractSignalContract) {
        signalContract.FxContractId = signalContract.FxContract.Id;
    }
    exclusionPurchaseContractChange(signalContractExclusion: SignalContractExclusion) {
        signalContractExclusion.PurchaseContractId = signalContractExclusion.PurchaseContract.Id;
    }
    exclusionSupplyContractChange(signalContractExclusion: SignalContractExclusion) {
        signalContractExclusion.SupplyContractId = signalContractExclusion.SupplyContract.Id;
    }

    addExclusion() {
        this.openPopUp(this.modalContractExclusion);
    }
    addPurchase() {
        this.openPopUp(this.modalContractPurchase);
    }
    addSupply() {
        this.openPopUp(this.modalContractSupply);
    }

    addNewSignalContract(signalContract: LinkFxContractSignalContract, PurchaseOrSupply: number) {
        if (PurchaseOrSupply == 1)
            this.signalContractService.saveSignalContract(signalContract)
                .then(() => {
                    this.bindGridPurchase();
                    this.initNewSignalContractPurchase();
                }).then(() => {
                    this.close(true, '/signalContract')
                });
        else if (PurchaseOrSupply == 2)
            this.signalContractService.saveSignalContract(signalContract)
                .then(() => {
                    this.bindGridSupply();
                    this.initNewSignalContractSupply();
                }).then(() => {
                    this.close(true, '/signalContract')
                });
    }
    addNewExclusion(signalContractExclusion: SignalContractExclusion) {
        this.signalContractService.saveExclusion(signalContractExclusion)
            .then(() => {
                this.bindGridExclusion();
                this.initNewSignalContractExclusion();
            }).then(() => {
                this.close(true, '/signalContract')
            });
    }

    saveGridPurchase() {
        let i = 0;
        this.fxsignalContractPurchase.forEach(x => {
            this.signalContractService.saveSignalContract(x)
                .then(() => {
                    i++;
                    if (i == this.fxsignalContractPurchase.length)
                        this.bindGridPurchase();
                });
        });
    }
    saveGridSupply() {
        let i = 0;
        this.fxsignalContractSupply.forEach(x => {
            this.signalContractService.saveSignalContract(x)
                .then(() => {
                    i++;
                    if (i == this.fxsignalContractSupply.length)
                        this.bindGridSupply();
                });
        });
    }
    saveGridExclusion() {
        let i = 0;
        this.fxsignalContractExclusion.forEach(x => {
            this.signalContractService.saveExclusion(x)
                .then(() => {
                    i++;
                    if (i == this.fxsignalContractExclusion.length)
                        this.bindGridExclusion();
                });
        });
    }

    onRowClickedPurchase(e: any) {
        if (e.event.target !== undefined) {
            switch (e.event.target.getAttribute("action-type")) {
                case "delete":
                    this.signalContractService.deleteFxContractSignalContract(e.data).then(() => { this.bindGridPurchase() });
            }

            if (e.event.target.type == 'checkbox') {
                if (e.event.target.id == 'Include')
                    e.node.data.Include = e.event.target.checked;
                else if (e.event.target.id == 'IsToBeStormImported')
                    e.node.data.IsToBeStormImported = e.event.target.checked;
            }
        }
    }
    onRowClickedSupply(e: any) {
        if (e.event.target !== undefined) {
            switch (e.event.target.getAttribute("action-type")) {
                case "delete":
                    this.signalContractService.deleteFxContractSignalContract(e.data).then(() => { this.bindGridSupply() });
            }

            if (e.event.target.type == 'checkbox') {
                if (e.event.target.id == 'Include')
                    e.node.data.Include = e.event.target.checked;
                else if (e.event.target.id == 'IsToBeStormImported')
                    e.node.data.IsToBeStormImported = e.event.target.checked;
            }
        }
    }
    onRowClickedExclusion(e: any) {
        if (e.event.target !== undefined) {
            switch (e.event.target.getAttribute("action-type")) {
                case "delete":
                    this.signalContractService.deleteSignalContractExclusion(e.data).then(() => { this.bindGridExclusion() });
            }
        }
    }
}

@Component({
    selector: 'select-cell',
    template: `<select class="form-control" [(ngModel)] = "value"
    [compareWith] = "comparator"
    [ngModelOptions] = "{standalone: true}"
        (ngModelChange) ="supplyContractChange(value)" >
    <option *ngFor="let supplyContractItem of supplyContract$" [ngValue] = "supplyContractItem"  required>
        {{ supplyContractItem.Code }}
    </option>
    < /select>`
})
export class SelectEditorSupplyContractExclusionComponent implements ICellEditorAngularComp {
    @ViewChild('container') container: ViewContainerRef;
    private params: any;
    public value: any;
    supplyContract$: SupplyContract[];

    constructor(private signalContractService: SignalContractService) {

        this.signalContractService.getSupplyContracts().subscribe(res => {
            this.supplyContract$ = <SupplyContract[]>res;
        });
    }

    agInit(params: any): void {
        this.params = params;
        this.supplyContract$ = this.params.context.mySupplyContract;
        this.value = this.params.value;
    }

    getValue(): any {
        return this.value;
    }

    setValue(supplyContract) {
        this.value = <SupplyContract>supplyContract;
    }

    supplyContractChange(supplyContract) {
        this.setValue(supplyContract);
        var selectrowData = <SignalContractExclusion>this.params.node.data;
        selectrowData.SupplyContractId = supplyContract.Id;
        this.params.api.stopEditing();
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
        (ngModelChange) ="supplyContractChange(value)" >
    <option *ngFor="let supplyContractItem of supplyContract$" [ngValue] = "supplyContractItem"  required>
        {{ supplyContractItem.Code }}
    </option>
    < /select>`
})
export class SelectEditorSupplyContractComponent implements ICellEditorAngularComp {
    @ViewChild('container') container: ViewContainerRef;
    private params: any;
    public value: any;
    supplyContract$: SupplyContract[];

    constructor(private signalContractService: SignalContractService) {

        this.signalContractService.getSupplyContracts().subscribe(res => {
            this.supplyContract$ = <SupplyContract[]>res;
        });
    }

    agInit(params: any): void {
        this.params = params;
        this.supplyContract$ = this.params.context.mySupplyContract;
        this.value = this.params.value;
    }

    getValue(): any {
        return this.value;
    }

    setValue(supplyContract) {
        this.value = <SupplyContract>supplyContract;
    }

    supplyContractChange(supplyContract) {
        this.setValue(supplyContract);
        var selectrowData = <LinkFxContractSignalContract>this.params.node.data;
        selectrowData.SupplyContractId = supplyContract.Id;
        this.params.api.stopEditing();
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
        (ngModelChange) ="purchaseContractChange(value)" >
    <option *ngFor="let purchaseContractItem of purchaseContract$" [ngValue] = "purchaseContractItem"  required>
        {{ purchaseContractItem.Code }}
    </option>
    < /select>`
})
export class SelectEditorPurchaseContractExclusionComponent implements ICellEditorAngularComp {
    @ViewChild('container') container: ViewContainerRef;
    private params: any;
    public value: any;
    purchaseContract$: PurchaseContract[];

    constructor(private signalContractService: SignalContractService) {

        this.signalContractService.getPurchaseContracts().subscribe(res => {
            this.purchaseContract$ = <PurchaseContract[]>res;
        });
    }

    agInit(params: any): void {
        this.params = params;
        this.purchaseContract$ = this.params.context.myPurchaseContract;
        this.value = this.params.value;
    }

    getValue(): any {
        return this.value;
    }

    setValue(purchaseContract) {
        this.value = <PurchaseContract>purchaseContract;
    }

    purchaseContractChange(purchaseContract) {
        this.setValue(purchaseContract);
        var selectrowData = <SignalContractExclusion>this.params.node.data;
        selectrowData.PurchaseContractId = purchaseContract.Id;
        this.params.api.stopEditing();
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
        (ngModelChange) ="fxContractChange(value)" >
    <option *ngFor="let fxContractItem of fxContract$" [ngValue] = "fxContractItem"  required>
        {{ fxContractItem.Code }}
    </option>
    < /select>`
})
export class SelectEditorFxContractComponent implements ICellEditorAngularComp {
    @ViewChild('container') container: ViewContainerRef;
    private params: any;
    public value: any;
    fxContract$: Contract[];

    constructor(private signalContractService: SignalContractService) {

        this.signalContractService.getFxContracts().subscribe(res => {
            this.fxContract$ = <Contract[]>res;
        });
    }

    agInit(params: any): void {
        this.params = params;
        this.fxContract$ = this.params.context.myFxContract;
        this.value = this.params.value;
    }

    getValue(): any {
        return this.value;
    }

    setValue(fxContract) {
        this.value = <Contract>fxContract;
    }

    fxContractChange(fxContract) {
        this.setValue(fxContract);
        var selectrowData = <LinkFxContractSignalContract>this.params.node.data;
        selectrowData.FxContractId = fxContract.Id;
        this.params.api.stopEditing();
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
        (ngModelChange) ="purchaseContractChange(value)" >
    <option *ngFor="let purchaseContractItem of purchaseContract$" [ngValue] = "purchaseContractItem"  required>
        {{ purchaseContractItem.Code }}
    </option>
    < /select>`
})
export class SelectEditorPurchaseContractComponent implements ICellEditorAngularComp {
    @ViewChild('container') container: ViewContainerRef;
    private params: any;
    public value: any;
    purchaseContract$: PurchaseContract[];

    constructor(private signalContractService: SignalContractService) {

        this.signalContractService.getPurchaseContracts().subscribe(res => {
            this.purchaseContract$ = <PurchaseContract[]>res;
        });
    }

    agInit(params: any): void {
        this.params = params;
        this.purchaseContract$ = this.params.context.myPurchaseContract;
        this.value = this.params.value;
    }

    getValue(): any {
        return this.value;
    }

    setValue(purchaseContract) {
        this.value = <PurchaseContract>purchaseContract;
    }

    purchaseContractChange(purchaseContract) {
        this.setValue(purchaseContract);
        var selectrowData = <LinkFxContractSignalContract>this.params.node.data;
        selectrowData.PurchaseContractId = purchaseContract.Id;
        this.params.api.stopEditing();
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

function getFxContractCode(rowData) {
    if (rowData.data.FxContract !== null)
        return rowData.data.FxContract.Code;
    else
        return null;
}




