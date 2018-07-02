import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToasterModule } from 'angular2-toaster/angular2-toaster';

import { AccordionModule } from 'ngx-bootstrap/accordion';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { RatingModule } from 'ngx-bootstrap/rating';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';

import { ColorsService } from './colors/colors.service';

import { CheckallDirective } from './directives/checkall/checkall.directive';
import { FlotDirective } from './directives/flot/flot.directive';
import { NowDirective } from './directives/now/now.directive';
import { ScrollableDirective } from './directives/scrollable/scrollable.directive';

import { OktaAuthService } from './services/oktaAuthentication.service';
import { CallbackComponent } from './component/callback.component';

import { NumericDirective } from './directives/numeric/numeric.directive';
import { CustomDateDirective,MonthDateDirective } from './directives/date/date.directive';
import { TAB_COMPONENTS }  from './directives/tabs/tabSet.directive';

// https://angular.io/styleguide#!#04-10
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        AccordionModule.forRoot(),
        AlertModule.forRoot(),
        ButtonsModule.forRoot(),
        CarouselModule.forRoot(),
        CollapseModule.forRoot(),
        DatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        ModalModule.forRoot(),
        PaginationModule.forRoot(),
        ProgressbarModule.forRoot(),
        RatingModule.forRoot(),
        TabsModule.forRoot(),
        TimepickerModule.forRoot(),
        TooltipModule.forRoot(),
        TypeaheadModule.forRoot(),
        ToasterModule
    ],
    providers: [
        ColorsService,
        OktaAuthService
    ],
    declarations: [
        FlotDirective,
        CheckallDirective,
        NowDirective,
        ScrollableDirective,
        CallbackComponent,
        CustomDateDirective,MonthDateDirective,
        NumericDirective,
        TAB_COMPONENTS
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        RouterModule,
        AccordionModule,
        AlertModule,
        ButtonsModule,
        CarouselModule,
        CollapseModule,
        DatepickerModule,
        BsDropdownModule,
        ModalModule,
        PaginationModule,
        ProgressbarModule,
        RatingModule,
        TabsModule,
        TimepickerModule,
        TooltipModule,
        TypeaheadModule,
        ToasterModule,
        FlotDirective,
        CheckallDirective,
        NowDirective,
        ScrollableDirective,
        CustomDateDirective,MonthDateDirective,
        NumericDirective,
        TAB_COMPONENTS
    ]
})

// https://github.com/ocombe/ng2-translate/issues/209
export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule
        };
    }
}
