import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatorService } from './core/translator/translator.service';
import { MenuService } from './core/menu/menu.service';
import { SharedModule } from './shared/shared.module';
import { PagesModule } from './routes/pages/pages.module';
import { SelectivePreloadingStrategy } from './shared/selective-preloading-strategy';
//
import { CallbackComponent } from './shared/component/callback.component';
import { AuthGuard } from './shared/guards/index';

//component pages
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './routes/pages/login/login.component';
import { RegisterComponent } from './routes/pages/register/register.component';
import { RecoverComponent } from './routes/pages/recover/recover.component';
import { LockComponent } from './routes/pages/lock/lock.component';
import { MaintenanceComponent } from './routes/pages/maintenance/maintenance.component';
import { Error404Component } from './routes/pages/error404/error404.component';
import { Error500Component } from './routes/pages/error500/error500.component';

import { ReportingModule } from './routes/reporting/reporting.module';
import { CubeViewComponent } from './routes/reporting/cubeview.component';
import { CubeHedgeComponent } from './routes/reporting/cubehedge.component';
import { SummaryComponent } from './routes/reporting/summary.component';

//Menu
import { menu } from './menu';
import { CubecommoditiesComponent } from './routes/reporting/cubecommodities.component';
import { HedgeReportComponent } from './routes/reporting/hedgereport.component';

const routes = [
    {
        path: '',
        component: LayoutComponent,
        canActivate: [AuthGuard] ,//tu doit etre authentifié pour acceder a l'application verification du login
        children: [
            { path: '', loadChildren: './routes/home/home.module#HomeModule'},
            { path: 'home', loadChildren: './routes/home/home.module#HomeModule' },
            { path: 'dashboard', loadChildren: './routes/dashboard/dashboard.module#DashboardModule' },
            { path: 'cargo', loadChildren: './routes/cargo/cargo.module#CargoModule' },
            { path: 'price', loadChildren: './routes/price/price.module#PriceModule' },
            { path: 'hedge', loadChildren: './routes/hedge/hedge.module#HedgeModule' },
            { path: 'underlying', loadChildren: './routes/underlying/underlying.module#UnderlyingModule' },
            { path: 'FxWinContract', loadChildren: './routes/contract/contract.module#ContractModule' },
            { path: 'signalContract', loadChildren: './routes/signalContract/signalContract.module#SignalContractModule' },
            { path: 'cubeview', component: CubeViewComponent },
            { path: 'cubehedge', component: CubeHedgeComponent },
            { path: 'summary', component: SummaryComponent },
            { path: 'CubeCommodities', component: CubecommoditiesComponent },
            { path: 'HedgeReport', component: HedgeReportComponent },
            //{ path: 'implicit/callback', component: CallbackComponent },
        ]
    },
    { path: 'implicit/callback', component: CallbackComponent },
    // Not lazy-loaded routes
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'recover', component: RecoverComponent },
    { path: 'lock', component: LockComponent },
    { path: 'maintenance', component: MaintenanceComponent },
    { path: '404', component: Error404Component },
    { path: '500', component: Error500Component },
    //otherwise redirect to home Not found
    { path: '**', redirectTo: '' }

];

@NgModule({
    imports: [
        SharedModule,
        ReportingModule,
        RouterModule.forRoot(routes,
         {
           enableTracing: true,
           preloadingStrategy: SelectivePreloadingStrategy
         }
        ),
    PagesModule
],
    declarations: [

    ],
exports: [
    RouterModule
],
 providers: [
    SelectivePreloadingStrategy
]
})

export class RoutesModule {
    constructor(public menuService: MenuService, tr: TranslatorService) {
        menuService.addMenu(menu);
    }
}
