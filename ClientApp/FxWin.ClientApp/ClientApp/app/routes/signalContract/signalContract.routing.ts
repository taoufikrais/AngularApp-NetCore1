import { Injectable } from '@angular/core';
import { Routes, RouterModule, RouterStateSnapshot, ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { SignalContractlistComponent } from './signalContract-list.component';
import { AppConfiguration } from '../../app.configuration';

@Injectable()

export class CanActivateConfigLoadedGuard implements CanActivate {
    constructor(private appConfig: AppConfiguration) {
    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.appConfig.init();
    }
}

const signalContractRoutes: Routes = [
    { path: '', component: SignalContractlistComponent,canActivate: [CanActivateConfigLoadedGuard]}
];

export const SignalContractRouting = RouterModule.forChild(signalContractRoutes);