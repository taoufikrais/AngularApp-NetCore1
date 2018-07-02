import { NgModule } from '@angular/core';

import Sharedmodule = require("../../shared/shared.module");
import { HttpModule, JsonpModule } from '@angular/http';
import { PriceRouting, CanActivateConfigLoadedGuard } from "./price.routing";
import { AgGridModule } from 'ag-grid-angular/main';

import { PricelistComponent, PriceActionRendererComponent, CurrencySelectEditorComponent, UnitSelectEditorComponent, NumericEditorComponent, DateEditorComponent } from './price-list.component';
import { PriceDetailComponent } from './price-detail.component';

import { PriceService } from '../../core/services/price.service';

import { ODataConfiguration, ODataServiceFactory } from "angular-odata-es5";
import { ODataConfigurationFactory } from "../../shared/ODataConfigurationFactory";

import { RouterModule } from '@angular/router';
import { AppConfiguration } from '../../app.configuration';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@NgModule({
    imports: [
        Sharedmodule.SharedModule,
        HttpModule,
        PriceRouting,
        AgGridModule.withComponents([
            PricelistComponent,
            PriceActionRendererComponent,
            CurrencySelectEditorComponent,
            UnitSelectEditorComponent,
            NumericEditorComponent,
            DateEditorComponent
        ])
    ],
    declarations: [
        PricelistComponent,
        PriceDetailComponent,
        PriceActionRendererComponent,
        CurrencySelectEditorComponent,
        UnitSelectEditorComponent,
        NumericEditorComponent,
        DateEditorComponent
    ],
    providers: [
        PriceService,
        AppConfiguration,
        {
            provide: ODataConfiguration,
            useFactory: ODataConfigurationFactory,
            deps: [AppConfiguration]
        },
        ODataServiceFactory,
        CanActivateConfigLoadedGuard,
        BsModalRef
    ],
    entryComponents: [
    ],
    exports: [
        RouterModule
    ]
})

export class PriceModule { }
