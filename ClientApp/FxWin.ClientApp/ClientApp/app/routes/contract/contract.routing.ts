import { Injectable } from '@angular/core';
import { Routes, RouterModule, RouterStateSnapshot, ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { ContractlistComponent } from './contract-list.component';
import { AppConfiguration } from '../../app.configuration';

@Injectable()

export class CanActivateConfigLoadedGuard implements CanActivate {
    constructor(private appConfig: AppConfiguration) {
    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.appConfig.init();
    }
}

const contractRoutes: Routes = [
    { path: '', component: ContractlistComponent,canActivate: [CanActivateConfigLoadedGuard]}
];

export const ContractRouting = RouterModule.forChild(contractRoutes);