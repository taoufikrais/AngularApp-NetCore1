import { NgModule,Component, OnInit,Injectable, AfterContentInit, AfterViewInit, ViewChild  } from '@angular/core';
import { ElementRef,Inject } from '@angular/core';
import * as moment from 'moment';
require( "jquery-ui-bundle" );
import { ReportingService } from '../../core/services/reporting.service';
import { AppConfiguration } from '../../app.configuration';
import { VW_CubeCommodity } from '../../core/models/reporting.model';
declare var $:any;


@Component({
    selector: 'cubecommodities',
    templateUrl: './cubecommodities.component.html',
    styleUrls: ['./reporting.component.scss']
})
export class CubecommoditiesComponent implements OnInit {
    @ViewChild("pivottable", {read: ElementRef}) pivottable: ElementRef;
    loading: boolean = false;

    constructor(private reportingService: ReportingService,private appConfig: AppConfiguration) { }

    ngOnInit() {
        this.buildPivot();
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

        var derivers = $.pivotUtilities.derivers;
        var dateFormat =$.pivotUtilities.derivers.dateFormat;
        var tpl = $.pivotUtilities.aggregatorTemplates;
        var fmt = $.pivotUtilities.numberFormat();
        var sortAs =           $.pivotUtilities.sortAs;

        //$.getJSON("http://localhost/FxWin.WebApp/api/Reporting/GetCubeData", function(mps) {
        this.reportingService.GetCubeCommodityAsync().then((mps: VW_CubeCommodity[]) => {
            targetElement.pivotUI(mps, 
            {
                hiddenAttributes: ["Id",
                "OperationId",
                "OperationDate",
                "FxContractId",
                "CommodityHedgeId",
                "Code",
                "HedgeCommoMaturityId",
                "CommodityHedgeFxContractId",
                "CommodityHedgeOperationId",
                "MtM"
                ],
                // derivedAttributes: {
                //                     "Month name": dateFormat("Mois", "%n", true),
                //                    },
                rows: ["HedgeCommoMaturityYear"],
                cols: ["HedgeCommoMaturityMonth"],
                sorters: {
                        "HedgeCommoMaturityMonth": sortAs(["January","February","March","April", "May",
                                "June","July","August","September","October","November","December"]),
                },
                aggregators: {
                    "Commodity hedge Exposure (USD)":
                    function() {  return tpl.sum(fmt)( ["MtM"]) }
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
    }

}