import { NgModule } from '@angular/core';

import Sharedmodule = require("../../shared/shared.module");
import { HttpModule, JsonpModule } from '@angular/http';
import { SignalContractRouting, CanActivateConfigLoadedGuard } from "./signalContract.routing";
import { AgGridModule } from 'ag-grid-angular/main';

import { SignalContractlistComponent,SelectEditorPurchaseContractComponent,SelectEditorSupplyContractComponent
    ,SelectEditorFxContractComponent,SelectEditorPurchaseContractExclusionComponent,
    SelectEditorSupplyContractExclusionComponent } from './signalContract-list.component';

import { SignalContractService } from '../../core/services/signalContract.service';
import { ODataConfiguration, ODataServiceFactory } from "angular-odata-es5";
import { ODataConfigurationFactory } from "../../shared/ODataConfigurationFactory";

import { RouterModule } from '@angular/router';
import { AppConfiguration } from '../../app.configuration';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@NgModule({
    imports: [
        Sharedmodule.SharedModule,
        HttpModule,
        SignalContractRouting,
        AgGridModule.withComponents([
            SignalContractlistComponent,

            SelectEditorPurchaseContractComponent,
            SelectEditorSupplyContractComponent,
            SelectEditorFxContractComponent,
            SelectEditorPurchaseContractExclusionComponent,
            SelectEditorSupplyContractExclusionComponent
        ])
    ],
    declarations: [
        SignalContractlistComponent,

        SelectEditorPurchaseContractComponent,
        SelectEditorSupplyContractComponent,
        SelectEditorFxContractComponent,
        SelectEditorPurchaseContractExclusionComponent,
        SelectEditorSupplyContractExclusionComponent
    ],
    providers: [
        SignalContractService,
        {
            provide: ODataConfiguration,
            useFactory: ODataConfigurationFactory,
            deps: [AppConfiguration]
        },
        ODataServiceFactory,
        AppConfiguration,
        CanActivateConfigLoadedGuard,
        AppConfiguration,
        BsModalRef

    ],
    exports: [
        RouterModule
    ]
})

export class SignalContractModule { }
