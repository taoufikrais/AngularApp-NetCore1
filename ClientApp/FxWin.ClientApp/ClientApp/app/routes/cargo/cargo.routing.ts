import { Injectable } from '@angular/core';
import { Routes, RouterModule, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { CargolistComponent } from './cargo-list.component';
import { CargoDetailComponent } from './cargo-detail.component';
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

const cargoRoutes: Routes = [
    { path: '', component: CargolistComponent, canActivate: [CanActivateConfigLoadedGuard] },
    { path: ':id', component: CargoDetailComponent, canActivate: [CanActivateConfigLoadedGuard]  },
];
export const CargoRouting = RouterModule.forChild(cargoRoutes);