import { UnderlyinglistComponent } from './underlying-list.component';
import { UnderlyingDetailComponent } from './underlying-detail.component';
import { Routes, RouterModule, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
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

const underlyingRoutes: Routes = [
    { path: '', component: UnderlyinglistComponent, canActivate: [CanActivateConfigLoadedGuard]},
    { path: ':id', component: UnderlyingDetailComponent, canActivate: [CanActivateConfigLoadedGuard]}
];

export const UnderlyingRouting = RouterModule.forChild(underlyingRoutes);