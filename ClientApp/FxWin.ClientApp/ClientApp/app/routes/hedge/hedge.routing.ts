import { Injectable } from '@angular/core';
import { Routes, RouterModule, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { HedgelistComponent } from './hedge-list.component';
import { HedgeDetailComponent } from './hedge-detail.component';
import { AppConfiguration } from '../../app.configuration';


@Injectable()

export class CanActivateConfigLoadedGuard implements CanActivate {
    constructor(private appConfig: AppConfiguration) {
    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.appConfig.init();
    }
}

const hedgeRoutes: Routes = [
    { path: '', component: HedgelistComponent, canActivate: [CanActivateConfigLoadedGuard] },
    { path: ':id', component: HedgeDetailComponent, canActivate: [CanActivateConfigLoadedGuard] },
    //{ path: 'hedgeList', component: HedgelistComponent, canActivate: [CanActivateConfigLoadedGuard] },
    //{ path: 'hedgeDetail/:id', component: HedgeDetailComponent }

    //{ path: '/:detailId/:hedge', component: HedgeDetailComponent, canActivate: [CanActivateConfigLoadedGuard] }
];

export const HedgeRouting = RouterModule.forChild(hedgeRoutes);