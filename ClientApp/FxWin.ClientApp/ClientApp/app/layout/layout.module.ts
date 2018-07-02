import { NgModule,APP_INITIALIZER } from '@angular/core';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { NavsearchComponent } from './header/navsearch/navsearch.component';
import { OffsidebarComponent } from './offsidebar/offsidebar.component';
import { UserblockComponent } from './sidebar/userblock/userblock.component';
import { UserblockService } from './sidebar/userblock/userblock.service';
import { FooterComponent } from './footer/footer.component';
import { SharedModule } from '../shared/shared.module';
import { Http } from '@angular/http';
import { AppConfiguration } from '../app.configuration';

@NgModule({
    imports: [
        SharedModule
    ],
    providers: [
        UserblockService,
        AppConfiguration,
        {
         provide: APP_INITIALIZER,
         useFactory: (config: AppConfiguration) => () => config.loadConfigFromController(),
         deps: [AppConfiguration], multi: true 
        }
    ],
    declarations: [
        LayoutComponent,
        SidebarComponent,
        UserblockComponent,
        HeaderComponent,
        NavsearchComponent,
        OffsidebarComponent,
        FooterComponent
    ],
    exports: [
        LayoutComponent,
        SidebarComponent,
        UserblockComponent,
        HeaderComponent,
        NavsearchComponent,
        OffsidebarComponent,
        FooterComponent
    ]
})
export class LayoutModule { }
