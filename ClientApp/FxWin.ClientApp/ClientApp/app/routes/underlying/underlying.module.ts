import { NgModule } from '@angular/core';

import Sharedmodule = require("../../shared/shared.module");
import { HttpModule, JsonpModule } from '@angular/http';
import { UnderlyingRouting, CanActivateConfigLoadedGuard } from "./underlying.routing";
import { AgGridModule } from 'ag-grid-angular/main';

import { UnderlyinglistComponent } from './underlying-list.component';
import { UnderlyingDetailComponent, DateEditorComponent, CurrencySelectEditorComponent, BoValidationRenderer, MoodEditor, NumericEditorComponent } from './underlying-detail.component';

import { UnderlyingService } from '../../core/services/underlying.service';
import { ODataConfiguration, ODataServiceFactory } from "angular-odata-es5";
import { ODataConfigurationFactory } from "../../shared/ODataConfigurationFactory";

import { RouterModule } from '@angular/router';

import { BasicModalComponent } from '../../shared/component/basicmodal.component';

import { AppConfiguration } from '../../app.configuration';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@NgModule({
    imports: [
        Sharedmodule.SharedModule,
        HttpModule,
        UnderlyingRouting,
        AgGridModule.withComponents(
            [
                UnderlyinglistComponent,
                UnderlyingDetailComponent,
                DateEditorComponent,
                CurrencySelectEditorComponent,
                BoValidationRenderer,
                MoodEditor,
                NumericEditorComponent
            ]
        )
    ],
    declarations: [
        UnderlyinglistComponent,
        UnderlyingDetailComponent,
        BasicModalComponent,
        DateEditorComponent,
        CurrencySelectEditorComponent,
        BoValidationRenderer,
        MoodEditor,
        NumericEditorComponent
    ],
    providers: [
        UnderlyingService,
        {
            provide: ODataConfiguration,
            useFactory: ODataConfigurationFactory,
            deps: [AppConfiguration]
        },
        ODataServiceFactory,
        CanActivateConfigLoadedGuard,
        AppConfiguration,
        BsModalRef
    ],
    entryComponents: [
    ],
    bootstrap: [
    ],
    exports: [
        RouterModule
    ]
})

export class UnderlyingModule { }
