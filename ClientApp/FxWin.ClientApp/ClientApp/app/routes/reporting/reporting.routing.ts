import { Injectable } from '@angular/core';
import { Routes, RouterModule, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { CubeViewComponent } from './cubeview.component';
import { CubeHedgeComponent } from './cubehedge.component';
import { AppConfiguration } from '../../app.configuration';

/* Use this routes definition in case you want to make them lazy-loaded */
@Injectable()

export class CanActivateConfigLoadedGuard implements CanActivate {
    //router: Router
    constructor(private appConfig: AppConfiguration) {
    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.appConfig.init();
    }
}

const reportingRoutes: Routes = [
    { path: '', component: CubeViewComponent },
    { path: 'cubehedge', component: CubeHedgeComponent }, 
];
export const ReportingRouting = RouterModule.forChild(reportingRoutes);