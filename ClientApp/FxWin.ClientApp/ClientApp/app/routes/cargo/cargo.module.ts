import { NgModule } from '@angular/core';
import { HttpModule, JsonpModule, Http } from '@angular/http';

import { AgGridModule } from 'ag-grid-angular/main';
import Sharedmodule = require("../../shared/shared.module");

import { CargolistComponent, CargoActionRendererComponent } from './cargo-list.component';
import { CargoDetailComponent, BoValidationRenderer, MoodEditor, CurrencySelectEditorComponent, InternalStateSelectEditorComponent, DateEditorComponent, NumericEditorComponent } from './cargo-detail.component';
import { CargoService } from '../../core/services/cargo.service';

import { Routes, RouterModule } from '@angular/router';
import { CargoRouting, CanActivateConfigLoadedGuard } from "./cargo.routing";

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ODataConfigurationFactory } from "../../shared/ODataConfigurationFactory";
import { ODataConfiguration, ODataServiceFactory, ODataService, ODataQuery, ODataPagedResult } from "angular-odata-es5";

import { Logger } from '../../core/services/logger.service';
import { AppConfiguration } from '../../app.configuration';

import { MomentModule } from 'angular2-moment';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CustomDateDirective,MonthDateDirective } from '../../shared/directives/date/date.directive';
import { HedgeService } from '../../core/services/hedge.service';

//export function createODataConfigurationFactory(appConfig: AppConfiguration) {
//    debugger;
//    var config = new ODataConfiguration();
//    config.baseUrl = appConfig.host;//myGlobals.baseAdresse;
//    return config;
//}

@NgModule({
    imports: [
        Sharedmodule.SharedModule,
        CargoRouting,
        AgGridModule.withComponents(
            [
                CargolistComponent,
                CargoActionRendererComponent,
                BoValidationRenderer,
                CurrencySelectEditorComponent,
                MoodEditor,
                InternalStateSelectEditorComponent,
                DateEditorComponent,
                NumericEditorComponent
            ]
        ),
        HttpModule,
        JsonpModule,
        BsDatepickerModule.forRoot(),
        MomentModule
    ],
    declarations: [
        CargolistComponent,
        CargoDetailComponent,
        CargoActionRendererComponent,
        BoValidationRenderer, CurrencySelectEditorComponent,
        MoodEditor,
        InternalStateSelectEditorComponent,
        DateEditorComponent,
        NumericEditorComponent
    ],
    providers: [
        CargoService,
        HedgeService,
        {
            provide: ODataConfiguration,
            useFactory: ODataConfigurationFactory,
            //useFactory: (createODataConfigurationFactory),
            deps: [AppConfiguration],
            //multi: true
        },
        ODataServiceFactory,
        Logger,
        CanActivateConfigLoadedGuard,
        AppConfiguration,
        BsModalRef
    ],

    exports: [
        RouterModule
    ]
})
export class CargoModule { }
