import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router, ParamMap, NavigationEnd } from '@angular/router';

import { ColumnApi, GridApi, GridOptions } from "ag-grid/main";

import { ContractService } from '../../core/services/contract.service';

import { ODataPagedResult } from "angular-odata-es5";

import { FormatHelper } from '../../shared/helpers/formatHelper';

import { Contract } from '../../core/models/contract.model';
import { VW_LinkFxContractSignalContract } from '../../core/models/contract.model';
import { ContractType, Currency, Book, Incoterm } from '../../core/models/typeCode.model';
import { } from '../../core/models/hedge.model';

import { Observable } from 'rxjs/Observable';

import { NgForm } from '@angular/forms';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { ISubscription } from "rxjs/Subscription";

@Component({
    templateUrl: './contract-list.component.html',
    styleUrls: ['/contract.component.scss']
})

export class ContractlistComponent implements OnInit, AfterViewInit {

    private gridContracts: GridOptions;
    currentRouter;
    private rowSelection;
    private gridApi;
    columnDefsContracts = [
        {
            headerName: 'Code',
            field: 'Code'
            , sort: 'asc'
        },
        {
            headerName: 'Type',
            field: 'ContractType.Code'
        },
        {
            headerName: 'Nature',
            field: 'Incoterm.Code'
        },
        {
            headerName: 'Currency',
            field: 'Currency.Code'
        },
        {
            headerName: 'Book',
            field: 'Book.Code'
        },
        {
            headerName: "Action",
            suppressMenu: true,
            suppressSorting: true,
            template: '<button type="button" action-type="delete" class="btn center-block" style="background-color:transparent; background-image:url(\'assets\\\\img\\\\icon\\\\suppr3.png\'); background-size:32px, 16px, cover"></button>'
        }
    ];

    public showSignalGrid = false;
    private gridAssociatedSignalContracts: GridOptions;
    columnDefsSignalContracts = [
        {
            headerName: 'Associated Signal Contracts',
            field: 'Code'
        }
    ];

    subscription: ISubscription;
    listContracts: Contract[];
    contract$: Observable<Contract>;
    selectedContract$: Observable<Contract>;

    contractTypes$: ContractType[];
    incoterms$: Incoterm[];
    currencies$: Currency[];
    books$: Book[];

    public isNew = false;

    associatedSignalContracts$: Observable<VW_LinkFxContractSignalContract[]>;

    @ViewChild("deleteYesNo") deleteYesNo;
    bsModalRef: BsModalRef;
    config = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: true
    };

    dataToDelete: any;

    private BreakException = {};
    rowId = 0;
    init: boolean = true;

    ready: boolean = true;

    cannotDeleteMessage;
    @ViewChild("alertCannotDelete") alertCannotDelete;

    constructor(private modalService: BsModalService, private route: ActivatedRoute, private router: Router, private contractService: ContractService) {

        this.gridContracts = <GridOptions>{

            columnDefs: this.columnDefsContracts,

            onCellFocused(e) {
                if (e.column) {
                    this.api.forEachNode(node => {
                        if (node.id == e.rowIndex)
                            node.setSelected(true, true);
                    })
                }
            },
            previousCellDef: this.columnDefsContracts,
            nextCellDef: this.columnDefsContracts,

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

        this.currentRouter = this.router;

        this.gridAssociatedSignalContracts = <GridOptions>{

            columnDefs: this.columnDefsSignalContracts,

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
        this.loadComboSelect();
    }

    ngAfterViewInit() {
        this.initFirstContract();
    }

    bindContracts() {
        this.subscription = this.contractService.getContracts().subscribe(l => { this.listContracts = l });
    }

    ContractautoSizeGridColumns() {
        var allColumnIds = [];
        this.columnDefsContracts.forEach(function (columnDef) {
            allColumnIds.push(columnDef);
        });
        this.gridContracts.columnApi.autoSizeColumns(allColumnIds);
    }

    initFirstContract() {

        this.isNew = false;

        this.contractService.getContracts().subscribe(l => {

            for (let i = 0; i < l.length - 1; i++)
                for (let j = 1; j < l.length; j++)
                    if (l[i].Code > l[j].Code) {
                        let tmp = l[i];
                        l[i] = l[j];
                        l[j] = tmp;
                    }

            this.contract$ = Observable.of(l[0]);
            this.associatedSignalContracts$ = this.contractService.getAssociatedSignalContracts(l[0].Id);
        });

        this.contractService.getContracts().subscribe(l => {

            for (let i = 0; i < l.length - 1; i++)
                for (let j = 1; j < l.length; j++)
                    if (l[i].Code > l[j].Code) {
                        let tmp = l[i];
                        l[i] = l[j];
                        l[j] = tmp;
                    }

            this.selectedContract$ = Observable.of(l[0]);
        });

        this.loadComboSelect();

        this.showSignalGrid = true;
    }

    confirmation(response: boolean) {
        if (this.bsModalRef.content !== undefined) {
            this.bsModalRef.hide();
        }
        if (response)
            this.deleteContract();
    }

    deleteContract() {
        this.contractService.delete(this.dataToDelete)
            .catch(e => {
                this.cannotDeleteMessage = e._body;
                this.openPopUp(this.alertCannotDelete);
            }).then(e => {
                if (e != undefined) {
                    this.bindContracts();
                    this.gridContracts.api.redrawRows();
                    this.reloadFirstContract();
                    this.selectFirstRow();
                }
            });
    }

    closeAlertCannotDelete() {
        if (this.bsModalRef.content !== undefined) {
            this.bsModalRef.hide();
        }
    }

    onRowClicked(e: any) {

        this.isNew = false;
        let id = e.data['Id'];

        this.contract$ = this.contractService.getContract(id);
        this.selectedContract$ = this.contractService.getContract(id);
        this.associatedSignalContracts$ = this.contractService.getAssociatedSignalContracts(id);

        this.loadComboSelect();
        this.showSignalGrid = true;

        if (e.event.target !== undefined) {
            let actionType = e.event.target.getAttribute("action-type");
            switch (actionType) {
                case "delete":
                    this.dataToDelete = e.data;
                    this.openPopUp(this.deleteYesNo);
            }
        }
    }

    openPopUp(template: TemplateRef<any>) {
        this.bsModalRef = this.modalService.show(
            template,
            Object.assign({}, this.config, { class: 'gray modal-md' })
        );
    }

    onCellFocused(params) {

        if (params.rowIndex != null) {

            let id = this.gridApi.getRowNode(params.rowIndex).data.Id;

            this.contract$ = this.contractService.getContract(id);
            this.selectedContract$ = this.contractService.getContract(id);
            this.associatedSignalContracts$ = this.contractService.getAssociatedSignalContracts(id);

            this.loadComboSelect();
            this.showSignalGrid = true;
        }
    }

    loadComboSelect() {
        this.contractService.getContractTypes()
            .subscribe(oDataPageResult => {
                this.contractTypes$ = oDataPageResult.data;
            });

        this.contractService.getIncoterms()
            .subscribe(oDataPageResult => {
                this.incoterms$ = oDataPageResult.data;
            });

        this.contractService.getCurrencies()
            .subscribe(oDataPageResult => {
                this.currencies$ = oDataPageResult.data;
            });

        this.contractService.getBooks()
            .subscribe(oDataPageResult => {
                this.books$ = oDataPageResult.data;
            });
    }

    comparator(object1, object2) {
        if (object2 != null) {
            var res = object1.Id === object2.Id;
            return res;
        } else {
            return true;
        }
    }

    contractTypeChange(contract) {
        contract.ContractTypeId = contract.ContractType.Id;
    }

    incotermChange(contract) {
        contract.IncotermId = contract.Incoterm.Id;
    }

    currencyChange(contract) {
        contract.CurrencyId = contract.Currency.Id;
    }

    bookChange(contract) {
        contract.BookId = contract.Book.Id;
    }

    save(contract: Contract) {

        this.init = false;

        this.gridApi.forEachNode(n => {
            if (n.selected == true)
                try {
                    this.rowId = n.id;
                    throw this.BreakException;
                } catch (e) {
                    if (e !== this.BreakException) throw e;
                }
        });

        this.contractService.save(contract)
            .then(() => this.bindContracts())
            .then(() => this.reloadFirstContract())
            .then(() => this.selectFirstRow());

        //if (this.isNew)
        //    this.initNewContract();
    }

    initNewContract() {
        this.showSignalGrid = false;
        this.isNew = true;
        this.contract$ = Observable.of(new Contract());
    }

    reset() {
        if (this.isNew)
            this.contract$ = Observable.of(new Contract());
        else
            this.selectedContract$.subscribe(p => {
                this.contract$ = Observable.of(p);
            });
    }

    private onReadyGridContracts(params) {
        if (this.ready) {
            this.bindContracts();
            this.ready = false;
        }

        this.gridApi = params.api;
        params.api.sizeColumnsToFit();

        this.selectFirstRow();
    }

    selectFirstRow() {
        if (this.gridApi != undefined) {
            this.gridApi.forEachNode(n => {
                if (n.rowIndex == 0)
                    try {
                        this.gridApi.getRowNode(n.id).setSelected(true);
                        throw this.BreakException;
                    } catch (e) {
                        if (e !== this.BreakException) throw e;
                    }
            });
        }
    }

    private onReadyGridSignalContracts(params) {
        params.api.sizeColumnsToFit();
    }

    modelUpdated() {
        if (this.init)
            this.selectFirstRow();
        else if (!this.init) {
            if (this.gridApi.getRowNode(this.rowId) != undefined) {
                this.gridApi.getRowNode(this.rowId).setSelected(true);
            }
        }
    }

    onSubmit(contract: Contract, form: NgForm) {
        if (form.valid)
            this.save(contract);
    }

    reloadFirstContract() {
        this.initFirstContract();
        this.selectFirstRow();
    }
}
