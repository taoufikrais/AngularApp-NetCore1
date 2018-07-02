import { NgModule,Component, OnInit  } from '@angular/core';
// ag-grid
import { ColumnApi, GridApi, GridOptions } from "ag-grid/main";

import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { AppConfiguration } from '../../app.configuration';
import * as moment from 'moment';
import { FormatHelper } from '../../shared/helpers/formatHelper';

import { ReportingService } from '../../core/services/reporting.service';
import { VW_Reporting } from '../../core/models/reporting.model';
import { debug } from 'util';
import { ISubscription } from 'rxjs/Subscription';

@Component({
    selector: 'hedgereport',
    templateUrl: './hedgereport.component.html',
    styleUrls: ['./reporting.component.scss']
})
export class HedgeReportComponent implements OnInit {

    private currentUser: any;
    private gridOptions: GridOptions;
    private columnDefs : Array<any>=[];
    private gridApi: GridApi;
    private hidedColumn : Array<string>=["RowId","Id"];
    private rowData: Array<any>; //VW_Reporting[] ;
    subscription: ISubscription;

    constructor(private route: ActivatedRoute, private router: Router,
        private reportingService: ReportingService,private appConfig: AppConfiguration
        ) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        moment.locale('en');
        this.defineGridOption();
        this.rowData = null;
    }

    ngOnInit() {
    }

    defineGridOption() {
        this.gridOptions = <GridOptions>{
            //columnDefs: this.setColumnDef(),
            rowData: null,
            virtualizationThreshold: 25,
            enableSorting: true,
            enableRowSelection: true,
            enableSelectAll: false,
            enableRowHeaderSelection: false,
            noUnselect: true,
            enableGridMenu: true,
            multiSelect: false,
            enableColResize: true,
            enableFilter: true,
            onRowDoubleClicked: this.doubleClick,
            context: {
                componentParent: this
            },
            suppressMenu: true,
        };
    }

    databindGrid() {
        // this.reportingService.gethedgeReportAsync().then((result: VW_Reporting[]) => {
        //     if (result != undefined && result != null){
        //         debugger;
        //         this.gridApi.setRowData(result), err => { console.log(err)};
        //     }else {
        //         debugger;
        //         var noResult: VW_Reporting[];
        //         this.gridApi.setRowData(noResult);
        //     }
        // });

        // this.reportingService.gethedgeReport().then((result: VW_Reporting[]) => {
        //         if (result != undefined && result != null){
        //             debugger;
        //             this.gridApi.setRowData(result), err => { console.log(err)};
        //         }else {
        //             debugger;
        //             var noResult: VW_Reporting[];
        //             this.gridApi.setRowData(noResult);
        //         }
        // });

        this.reportingService.gethedgeReport1().subscribe((result: VW_Reporting[]) => {
                if (result != undefined && result != null){
                    this.gridApi.setColumnDefs(this.autoGenerateColumnDef(this.getColumns(result)))
                    this.gridApi.setRowData(result), err => { console.log(err)};
                }else {
                    debugger;
                    var noResult: VW_Reporting[];
                    this.gridApi.setRowData(noResult);
                }}
        );
    }
    
    getColumns(jsonData)
    {
        let cols : Array<string>=[];
        var val = jsonData[0];
        for(var j in val){
            var sub_key = j;
            var sub_val = val[j];
            cols.push(sub_key.trim())
        }
        return cols;
    }

    gridOptionsAutoSizeAll() {
            var allColumnIds = [];
            this.columnDefs.forEach(function (columnDef) {
                allColumnIds.push(columnDef.field);
            });
            this.gridOptions.columnApi.autoSizeColumns(allColumnIds);
    }

    autoGenerateColumnDef(cols) {
        cols.forEach(element => {
            this.columnDefs.push(
                {
                    field: element,
                    displayName: element,
                    hide : this.hidedColumn.findIndex(y => y == element) < 0 ? false:true ,
                }
            );
         });   
         return this.columnDefs;
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.databindGrid();
        params.api.sizeColumnsToFit();
    }

    exportgridData() {
        var params = {
            suppressQuotes: true,
            fileName: "HedgeReportList",
            columnSeparator: ";"
        };
        this.gridApi.exportDataAsCsv(params);
    }

    doubleClick(row) {
        let detailId = row.data.Id  ;
        let navigationExtras: NavigationExtras = {
            queryParams: {
                detailId
            }
        };
        row.context.componentParent.router.navigate(["/hedge"], navigationExtras);
    }

}