import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { GridOptions } from "ag-grid/main";

import { UnderlyingService } from '../../core/services/underlying.service';

import { ODataPagedResult } from "angular-odata-es5";
import { SubjacentView, Subjacent } from '../../core/models/underlying.model';

import { FormatHelper } from '../../shared/helpers/formatHelper';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { UnderlyingDetailComponent } from './underlying-detail.component';

import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'underlying-list',
    templateUrl: './underlying-list.component.html',
    styleUrls: ['./underlying.component.scss']
})

export class UnderlyinglistComponent implements OnInit {

    private gridUnderlyingView: GridOptions;
    currentRouter;
    private rowSelection;
    private columnDefs;
    bsModalRef: BsModalRef;
    config = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: true
    };
    private listSubjacentView$: Observable<SubjacentView[]>;

    private BreakException = {};

    constructor(private route: ActivatedRoute, private router: Router,
        private underlyingService: UnderlyingService, private modalService: BsModalService
    ) {

        this.currentRouter = this.router;
        this.defineGridOption();
        this.forceRefreshSameRoute();
    }

    ngOnInit() {
        this.bindListSubjacentView();
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

    openModal(id: number) {
        this.bsModalRef = this.modalService.show(UnderlyingDetailComponent,
            Object.assign({}, this.config, { class: 'gray modal-lg' })
        );
        this.bsModalRef.content.title = "Underlying Detail";
        this.bsModalRef.content.detailId = id;
    }

    defineGridOption() {
        this.gridUnderlyingView = <GridOptions>{

            columnDefs: this.setColumnDef(),

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
            enableFilter: true,

            //onRowDoubleClicked: function (row) {
            //    row.context.componentParent.openModal(+row.data.Id);
            //},
            onRowDoubleClicked: this.doubleClick,
            context: {
                componentParent: this
            }
        };
        this.rowSelection = "single";
    }

    setColumnDef() {

        this.columnDefs = [
            {
                headerName: 'Code',
                field: 'Code'
            },
            {
                headerName: 'Type',
                field: 'Type'
            },
            {
                headerName: 'Number Of Maturities',
                field: 'NumberOfMaturities',

                filter: 'number',
                cellRenderer: function (params) {
                    return FormatHelper.formatNumber(params.value);
                }
            },
            {
                headerName: 'Operation Type',
                field: 'OperationType'
            },
            {
                headerName: 'Book',
                field: 'BookCode'
            },
            {
                headerName: "Action",
                suppressMenu: true,
                suppressSorting: true,
                template: '<button type="button" action-type="delete" class="btn center-block" style="background-color:transparent; background-image:url(\'assets\\\\img\\\\icon\\\\suppr3.png\'); background-size:32px, 16px, cover"></button>'
            }
        ];
        return this.columnDefs;
    }

    public doubleClick(row) {
        //row.context.componentParent.router.navigate(['/underlying/' + row.data.Id]);
        row.context.componentParent.openModal(row.data.Id);//this.modalTemplate,
    }

    async bindListSubjacentView() {
        this.listSubjacentView$ = this.underlyingService.getSubjacentViews();
    }

    autoSizeGridColumns() {
        var allColumnIds = [];
        this.columnDefs.forEach(function (columnDef) {
            allColumnIds.push(columnDef.field);
        });
        this.gridUnderlyingView.columnApi.autoSizeColumns(allColumnIds);
    }

    onFilterChanged(event) {
        var values = (<HTMLInputElement>event.target).value;
        this.gridUnderlyingView.api.setQuickFilter(values);
    }

    private onReadyGridUnderlyingView(params) {
        params.api.sizeColumnsToFit();
    }

    selectedSubjacentView: SubjacentView;
    @ViewChild("alertConfirmationDelete") alertConfirmationDelete;
    bsModalRefAlert: BsModalRef;
    cannotDeleteMessage;
    @ViewChild("alertCannotDelete") alertCannotDelete;
    link = false;

    onRowClicked(e: any) {

        this.selectedSubjacentView = e.data;

        if (e.event.target !== undefined) {
            let actionType = e.event.target.getAttribute("action-type");
            switch (actionType) {
                case "delete":
                    this.checkAssociatedMaturities();
            }
        }
    }

    checkAssociatedMaturities() {
        this.underlyingService.getSubjacent(this.selectedSubjacentView.Id).subscribe(s => {
            s.UnderlyingTerms.forEach(u => {
                if (u.HedgeLegs.length > 0 || u.CommodityHedges.length > 0) {
                    try {
                        this.link = true;
                        throw this.BreakException;
                    } catch (e) {
                        if (e !== this.BreakException) throw e;
                    }
                }
            });
            this.openPopUp(this.alertConfirmationDelete);
        });
    }

    //openAlertConfirmationDelete(template: TemplateRef<any>) {
    //    this.bsModalRefAlert = this.modalService.show(
    //        this.alertConfirmationDelete,
    //        Object.assign({}, this.config, { class: 'gray modal-md' })
    //    );
    //}

    confirmation(yesNo: boolean) {
        if (this.bsModalRefAlert.content !== undefined) {
            this.bsModalRefAlert.hide();
        }
        if (yesNo) {

            this.underlyingService.deleteSubjacent(this.selectedSubjacentView);

            this.listSubjacentView$.subscribe(l => {
                l.splice(l.findIndex(s => s.Id == this.selectedSubjacentView.Id), 1);
                this.listSubjacentView$ = Observable.of(l);
            });
        }
    }

    openPopUp(template: TemplateRef<any>) {
        this.bsModalRefAlert = this.modalService.show(
            template,
            Object.assign({}, this.config, { class: 'gray modal-md' })
        );
    }

    closeAlertCannotDelete() {
        if (this.bsModalRefAlert.content !== undefined) {
            this.bsModalRefAlert.hide();
        }
    }

    AddNewSubjacent()
    {
        this.openModal(0);
    }
}




