import { NgModule } from '@angular/core';

import Sharedmodule = require("../../shared/shared.module");
import { HttpModule, JsonpModule } from '@angular/http';
import { ContractRouting, CanActivateConfigLoadedGuard} from "./contract.routing";
import { AgGridModule } from 'ag-grid-angular/main';

import { ContractlistComponent } from './contract-list.component';

import { ContractService } from '../../core/services/contract.service';
import { ODataConfiguration, ODataServiceFactory } from "angular-odata-es5";
import { ODataConfigurationFactory } from "../../shared/ODataConfigurationFactory";

import { RouterModule } from '@angular/router';
import { AppConfiguration } from '../../app.configuration';


@NgModule({
    imports: [
        Sharedmodule.SharedModule,
        HttpModule,
        ContractRouting,
        AgGridModule.withComponents([ContractlistComponent])
    ],
    declarations: [
        ContractlistComponent
    ],
    providers: [
        ContractService,
        {
            provide: ODataConfiguration,
            useFactory: ODataConfigurationFactory,
            deps: [AppConfiguration]
        },
        ODataServiceFactory,
        AppConfiguration,
        CanActivateConfigLoadedGuard,
        AppConfiguration

    ],
    exports: [
        RouterModule
    ]
})

export class ContractModule { }
