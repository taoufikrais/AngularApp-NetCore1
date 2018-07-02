import { NgModule } from '@angular/core';
import Sharedmodule = require("../../shared/shared.module");
import { HttpModule, JsonpModule } from '@angular/http';

import { AgGridModule } from 'ag-grid-angular/main';

import { Routes, RouterModule } from '@angular/router';
import { HedgeRouting, CanActivateConfigLoadedGuard } from "./hedge.routing";

import { HedgelistComponent ,HedgeViewActionRendererComponent } from './hedge-list.component';
import { HedgeDetailComponent,NumericEditorComponent,DateEditorComponent,PurchaseSaleSelectEditorComponent,CurrencySelectEditorComponent,Currency1SelectEditorComponent } from './hedge-detail.component';
import { HedgeService } from '../../core/services/hedge.service';
import { SignalRService } from '../../core/services/signalR.service';

import { ODataConfiguration, ODataServiceFactory } from "angular-odata-es5";
import { ODataConfigurationFactory } from "../../shared/ODataConfigurationFactory";
import { AppConfiguration } from '../../app.configuration';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { FrenchDecimalPipe,MyDateTimePipe,StringToDate } from './hedge.pipe'
import { DatePipe , CurrencyPipe, DecimalPipe} from "@angular/common";
import { FileUploadModule } from 'ng2-file-upload';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TextMaskModule } from 'angular2-text-mask';

@NgModule({
    declarations: [
        NumericEditorComponent,
        DateEditorComponent,
        PurchaseSaleSelectEditorComponent,
        CurrencySelectEditorComponent,
        Currency1SelectEditorComponent,
        HedgeViewActionRendererComponent,
        HedgelistComponent,
        HedgeDetailComponent,
        FrenchDecimalPipe,
        MyDateTimePipe,
        StringToDate
    ],
    imports: [
        Sharedmodule.SharedModule,
        HttpModule,
        HedgeRouting,
        FileUploadModule,
        PopoverModule.forRoot(),
        BsDatepickerModule.forRoot(),
        TextMaskModule,
        AgGridModule.withComponents(
            [
                NumericEditorComponent,
                FrenchDecimalPipe,
                PurchaseSaleSelectEditorComponent,
                CurrencySelectEditorComponent,
                Currency1SelectEditorComponent,
                HedgeViewActionRendererComponent,
                DateEditorComponent,
                HedgelistComponent,
            ]
        )
    ],
    providers: [
        HedgeService,
        {
            provide: ODataConfiguration,
            useFactory: ODataConfigurationFactory,
            deps: [AppConfiguration]
        },
        ODataServiceFactory,
        AppConfiguration,
        CanActivateConfigLoadedGuard,
        BsModalRef,
        DecimalPipe,
        SignalRService ,
        DatePipe 
    ],
    exports: [
        RouterModule,
    ]
})

export class HedgeModule { }
