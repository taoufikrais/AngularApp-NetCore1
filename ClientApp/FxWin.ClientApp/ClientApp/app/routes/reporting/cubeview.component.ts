import { NgModule,Component, OnInit,Injectable, AfterContentInit, AfterViewInit, ViewChild  } from '@angular/core';
import { ElementRef,Inject } from '@angular/core';
import * as moment from 'moment';
require( "jquery-ui-bundle" );
import { PapaParseModule, PapaParseService } from 'ngx-papaparse';
import { ReportingService } from '../../core/services/reporting.service';
import { AppConfiguration } from '../../app.configuration';
import { VW_Cube } from '../../core/models/reporting.model';
declare var $:any;
//using webpack so import the js/css dependencies
//for you this might be a <script/style tag


@Injectable()  

@Component({
    selector: 'cubeview',
    templateUrl: './cubeview.component.html',
    styleUrls: ['./reporting.component.scss']
})
export class CubeViewComponent implements AfterViewInit  {
    @ViewChild("pivottable", {read: ElementRef}) pivottable: ElementRef;
    @ViewChild("sortable", {read: ElementRef}) sortable: ElementRef;
    loading: boolean = false;

    ngAfterViewInit(): void {
        console.log(this.pivottable.nativeElement.textContent);
    }
  
    constructor(private papa: PapaParseService,
        private reportingService: ReportingService,private appConfig: AppConfiguration) {
    }
    
    ngOnInit() {
       //this.buildSortableItem();
       this.buildPivot();
    }

    private buildSortableItem(){
        var container = this.sortable.nativeElement;
        var targetElement = jQuery(container);
        targetElement.animate({left: '100px'}, "slow");
        targetElement.animate({fontSize: '5em'}, "slow");
        targetElement.sortable();
    }

    private buildPivot(){
        if (!this.pivottable ||
            !this.pivottable.nativeElement ||
            !this.pivottable.nativeElement.children){
                console.log('cant build without element');
                return;
        }
        this.loading = true;
        var container = this.pivottable.nativeElement;
        var targetElement = jQuery(container);
        //here is the magic
        // targetElement.pivot([
        //     { 'Province': 'Quebec', 'Party': 'NDP', 'Age': 22, 'Name': 'Liu, Laurin', 'Gender': 'Female' },
        //     { 'Province': 'Quebec', 'Party': 'Bloc Quebecois', 'Age': 43, 'Name': 'Mourani, Maria', 'Gender': 'Female' },
        //     { 'Province': 'Quebec', 'Party': 'NDP', 'Age': '', 'Name': 'Sellah, Djaouida', 'Gender': 'Female' },
        //     { 'Province': 'Quebec', 'Party': 'NDP', 'Age': 72, 'Name': 'St-Denis, Lise', 'Gender': 'Female' },
        //     { 'Province': 'British Columbia', 'Party': 'Liberal', 'Age': 71, 'Name': 'Fry, Hedy', 'Gender': 'Female' }],
        //     {
        //         cols: ['Party'], rows: ['Province'],
        //         rendererName: 'Horizontal Stacked Bar Chart',
        //         rowOrder: 'value_z_to_a', colOrder: 'value_z_to_a',
        //         rendererOptions: {
        //             c3: {
        //                 data: {
        //                     colors: {
        //                         Liberal: '#dc3912', Conservative: '#3366cc', NDP: '#ff9900',
        //                         Green: '#109618', 'Bloc Quebecois': '#990099'
        //                     }
        //                 }
        //             }
        //         }
        //     });


        // targetElement.pivot([
        //     { color: "blue", shape: "circle" },
        //     { color: "red", shape: "triangle" }],
        //     {
        //         rows: ["color"],
        //         cols: ["shape"]
        //     });

        

        // targetElement.pivotUI(
        //     [
        //         {color: "blue", shape: "circle"},
        //         {color: "blue", shape: "carree"},
        //         {color: "red", shape: "triangle"},
        //         {color: "green", shape: "triangle"}
        //     ],
        //     {
        //         rows: ["color"],
        //         cols: ["shape"]
        //     }
        // );

        var derivers = $.pivotUtilities.derivers;
        var dateFormat =$.pivotUtilities.derivers.dateFormat;
        var tpl = $.pivotUtilities.aggregatorTemplates;
        var fmt = $.pivotUtilities.numberFormat();
        var sortAs = $.pivotUtilities.sortAs;

        //$.getJSON("http://localhost/FxWin.WebApp/api/Reporting/GetCubeData", function(mps) {
        this.reportingService.getCubeDataAsync().then((mps: VW_Cube[]) => {
            targetElement.pivotUI(mps, 
            {
                hiddenAttributes: ["Id",
                "ContractFxHedgeRatio",
                "ContractResultingFxExposure",
                "ContractPhysicalExposure",
                "ContractFxExposure",
                "ContractAvailableFxHedge",
                "ContractCommodityHedgeExposure",
                ],
                // derivedAttributes: {
                //                     "Month name": dateFormat("OperationDateMonth", "%n", true),
                //                    },
                rows: ["OperationDateYear" ],
                cols: ["OperationDateMonth"],
                sorters: {
                        "OperationDateMonth": sortAs(["January","February","March","April", "May",
                                "June","July","August","September","October","November","December"]),
                },
                aggregators: {
                    "FX Hedge Ratio (%)":
                    function() {  return tpl.sum(fmt)( ["ContractFxHedgeRatio"]) },
                    "Resulting FX Exposure (USD)":
                        function() {  return tpl.sum(fmt)( ["ContractResultingFxExposure"])},
                    "Physical FX Exposure (USD)":
                        function() {  return tpl.sum(fmt)( ["ContractPhysicalExposure"]) },
                    "Fx Hedge Exposure (USD)":
                        function() {  return tpl.sum(fmt)( ["ContractFxExposure"]) },
                    "Available Fx Hedges (USD)":
                        function() {  return tpl.sum(fmt)( ["ContractAvailableFxHedge"])},
                    "Commodity Hedge Exposure (USD)":
                        function() {  return tpl.sum(fmt)( ["ContractCommodityHedgeExposure"]) },
                },
                renderers: $.extend(
                    $.pivotUtilities.renderers,
                    $.pivotUtilities.c3_renderers,
                    $.pivotUtilities.export_renderers
                    ),

                rendererName: "Table Barchart",
            });
            this.loading = false;
        });

        // $.getJSON("https://pivottable.js.org/examples/mps.json", function(mps) {
        //     targetElement.pivotUI(mps, {
        //         derivedAttributes: {
        //             "Age Bin": derivers.bin("Age", 10),
        //             "Gender Imbalance": function(mp) {
        //                 return mp["Gender"] == "Male" ? 1 : -1;
        //             }
        //         }
        //     });
        // });



        // var dateFormat =       $.pivotUtilities.derivers.dateFormat;
        // var sortAs =           $.pivotUtilities.sortAs;
        // var tpl =              $.pivotUtilities.aggregatorTemplates;
        // var fmt =              $.pivotUtilities.numberFormat({suffix: " °C"});
        // this.papa.parse("https://pivottable.js.org/examples/montreal_2014.csv", {
        //     download: true,
        //     skipEmptyLines: true,
        //     complete: function(parsed){
        //         targetElement.pivotUI(parsed.data, {
        //             hiddenAttributes: ["Date","Max Temp (C)","Mean Temp (C)",
        //                 "Min Temp (C)" ,"Total Rain (mm)","Total Snow (cm)"],
  
        //             derivedAttributes: {
        //                 "month name": dateFormat("Date", "%n", true),
        //                 "day name":   dateFormat("Date", "%w", true)
        //             },
  
        //             rows: ["day name"],
        //             cols: ["month name"],
  
        //             sorters: {
        //                 "month name": sortAs(["Jan","Feb","Mar","Apr", "May",
        //                         "Jun","Jul","Aug","Sep","Oct","Nov","Dec"]),
        //                 "day name": sortAs(["Mon","Tue","Wed", "Thu","Fri",
        //                         "Sat","Sun"])
        //             },
  
        //             aggregators: {
        //                 "Mean Temperature":
        //                     function() { return tpl.average(fmt)(["Mean Temp (C)"])},
        //                 "Max Temperature":
        //                     function() { return tpl.max(fmt)(["Max Temp (C)"]) },
        //                 "Min Temperature":
        //                     function() { return tpl.min(fmt)(["Min Temp (C)"]) }
        //             },
  
        //             renderers: $.extend(
        //                 $.pivotUtilities.renderers,
        //                 $.pivotUtilities.c3_renderers,
        //                 $.pivotUtilities.export_renderers
        //                 ),
  
        //             rendererName: "Heatmap",
  
        //             // rendererOptions: {
        //             //     heatmap: {
        //             //         colorScaleGenerator: function(values) {
        //             //             return this.d3.scale.linear()
        //             //                 .domain([-35, 0, 35])
        //             //                 .range(["#77F", "#FFF", "#F77"])
        //             //         }
        //             //     }
        //             // }
        //         });
        //     }
        // });

      }
    }





