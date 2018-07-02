import { NgModule,Component, OnInit,Injectable, AfterContentInit, AfterViewInit, ViewChild, Input, Output, ContentChildren, EventEmitter  } from '@angular/core';
import { ElementRef,Inject } from '@angular/core';
import * as moment from 'moment';
require( "jquery-ui-bundle" );

import { AppConfiguration } from '../../app.configuration';

import { debug } from 'util';
import { TAB_COMPONENTS, CustomTabset  } from '../../shared/directives/Tabs/tabSet.directive';

import { ColumnApi, GridApi, GridOptions } from "ag-grid/main";

import { AuditService } from '../../core/services/audit.service';
import { AuditTrail } from '../../core/models/audit.model';
//import { CustomTab  } from '../../shared/directives/Tabs/tab.directive';
//declare var $:any;

@Component({
    selector: 'SummaryComponent',
    templateUrl: './summary.component.html',
})
export class SummaryComponent implements OnInit {
    @ViewChild("tabs", {read: ElementRef}) tabs: ElementRef;
    @ViewChild("tabset", {read: ElementRef}) tabset: CustomTabset;

    private gridOptions: GridOptions;
    CommogridOptions: GridOptions;
    CargogridOptions: GridOptions;
    undergridOptions: GridOptions;

    
    private gridApi: GridApi;
    private CommogridApi: GridApi;
    private CargogridApi: GridApi;
    private undergridApi: GridApi;
    

    private columnDefs : Array<any>=[];
    private hidedColumn : Array<string>=[];
    subscription: any;
    
    constructor(private service: AuditService,private appConfig: AppConfiguration)
    { 
    }


    ngOnInit() {
        // $("#tabs").click(function(){
        //     alert("tab selected");
        //  });
        // debugger;
        // var tabsElement = $(this.tabs.nativeElement);
        // tabsElement.tabs();
        // var componentParent = this;
        // tabsElement.click(function (event, ui) {
        //     componentParent.tabClick(this);
        //  });
    }

    // tabClick(selectedTab)
    // {
    //      var selectTabelement = jQuery(selectedTab);
    //       let el = $(this.tabs.nativeElement);
    //       $(el).tabs({'active' : 3});
    //     alert("hello")
    // }

    customtabClicked(event)
    {
        this.databindGrid();
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
            context: {
                componentParent: this
            },
            suppressMenu: true,
        };

        this.CommogridOptions= <GridOptions>{
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
            context: {
                componentParent: this
            },
            suppressMenu: true,
        };

        this.CargogridOptions= <GridOptions>{
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
            context: {
                componentParent: this
            },
            suppressMenu: true,
        };
        this.undergridOptions= <GridOptions>{
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
            context: {
                componentParent: this
            },
            suppressMenu: true,
        };
    }
   
    databindGrid() {
        this.service.GetFXHedgeAuditTrail().subscribe((result: AuditTrail[]) => {
                if (result != undefined && result != null){
                    this.gridApi.setColumnDefs(this.autoGenerateColumnDef(this.getColumns(result)))
                    this.gridApi.setRowData(result), err => { console.log(err)};
                }else {
                    var noResult: AuditTrail[];
                    this.gridApi.setRowData(noResult);
                }}
        );
    }

    databindCommoGrid() {
        this.service.GetCommodityHedgeAuditTrail().subscribe((result: AuditTrail[]) => {
                if (result != undefined && result != null){
                    this.CommogridApi.setColumnDefs(this.autoGenerateColumnDef(this.getColumns(result)))
                    this.CommogridApi.setRowData(result), err => { console.log(err)};
                }else {
                    var noResult: AuditTrail[];
                    this.CommogridApi.setRowData(noResult);
                }}
        );
    }

    databindCargoGrid() {
        this.service.GetCargoAuditTrail().subscribe((result: AuditTrail[]) => {
                if (result != undefined && result != null){
                    this.CargogridApi.setColumnDefs(this.autoGenerateColumnDef(this.getColumns(result)))
                    this.CargogridApi.setRowData(result), err => { console.log(err)};
                }else {
                    var noResult: AuditTrail[];
                    this.CargogridApi.setRowData(noResult);
                }}
        );
    }

    databindunderGrid() {
        this.service.GetOtherUnderlyingAuditTrail().subscribe((result: AuditTrail[]) => {
                if (result != undefined && result != null){
                    this.undergridApi.setColumnDefs(this.autoGenerateColumnDef(this.getColumns(result)))
                    this.undergridApi.setRowData(result), err => { console.log(err)};
                }else {
                    var noResult: AuditTrail[];
                    this.undergridApi.setRowData(noResult);
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
        this.gridApi.sizeColumnsToFit();
    }

    onCommoGridReady(params) {
        this.CommogridApi = params.api;
        this.databindCommoGrid();
        this.CommogridApi.sizeColumnsToFit();
    }
    onCargoGridReady(params) {
        this.CargogridApi = params.api;
        this.databindCargoGrid();
        this.CargogridApi.sizeColumnsToFit();
    }

    onUnderGridReady(params) {
        this.undergridApi = params.api;
        this.databindunderGrid();
        this.undergridApi.sizeColumnsToFit();
    }

    

    ngOnDestroy() {
       // this.subscription.unsubscribe();
    }
}