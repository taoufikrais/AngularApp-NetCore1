import { PricelistComponent } from './price-list.component';
import { PriceDetailComponent } from './price-detail.component';
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

const priceRoutes: Routes = [
    { path: '', component: PricelistComponent, canActivate: [CanActivateConfigLoadedGuard] },
    { path: ':id', component: PriceDetailComponent, canActivate: [CanActivateConfigLoadedGuard] }
];

export const PriceRouting = RouterModule.forChild(priceRoutes);