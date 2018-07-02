import { NgModule } from '@angular/core';
import { CubeViewComponent } from './cubeview.component';
import { CubeHedgeComponent } from  './cubehedge.component';
import { SummaryComponent } from  './summary.component';
import { CubecommoditiesComponent } from  './cubecommodities.component';

import { Routes, RouterModule, ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
//import { ReportingRouting, CanActivateConfigLoadedGuard } from "./reporting.routing";
import { AgGridModule } from 'ag-grid-angular/main';
import { HedgeReportComponent } from './hedgereport.component';
import { ReportingRouting } from './reporting.routing';

import Sharedmodule = require("../../shared/shared.module");
import { ReportingService } from '../../core/services/reporting.service';
import { AuditService } from '../../core/services/audit.service';

import { ODataConfiguration } from 'angular-odata-es5';
import { ODataConfigurationFactory } from '../../shared/ODataConfigurationFactory';
import { AppConfiguration } from '../../app.configuration';
import { Logger } from '../../core/services/logger.service';
import { PapaParseModule } from 'ngx-papaparse';


export class CanActivateConfigLoadedGuard implements CanActivate {
    //router: Router
    constructor(private appConfig: AppConfiguration) {
    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.appConfig.init();
    }
}

@NgModule({
    imports: [
        //ReportingRouting,
        //RouterModule.forChild(reportingRoutes),
        Sharedmodule.SharedModule,
        PapaParseModule,
        AgGridModule.withComponents(
            [
                CubeViewComponent,
                CubeHedgeComponent,
                SummaryComponent,
                CubecommoditiesComponent,
                HedgeReportComponent,
            ]
        ),
    ],
    declarations: [
        CubeViewComponent,
        CubeHedgeComponent,
        SummaryComponent,
        CubecommoditiesComponent,
        HedgeReportComponent,
    ],
    providers: [
        ReportingService,
        AuditService,
        Logger,
        //CanActivateConfigLoadedGuard,
        AppConfiguration,
    ],
    exports: [
    ]
})
export class ReportingModule { }
