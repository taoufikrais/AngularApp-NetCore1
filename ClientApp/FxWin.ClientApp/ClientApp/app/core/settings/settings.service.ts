import { Injectable } from '@angular/core';
import Themesservice = require("../themes/themes.service");
import * as moment from 'moment';
declare var $: any;

@Injectable()
export class SettingsService {

    public user: any;
    public app: any;
    public layout: any;

    constructor() {

        // User Settings
        // -----------------------------------
        this.user = {
            name: 'Taoufik',
            job: 'ng-developer',
            picture: 'assets/img/user/02.jpg'
        };

        // App Settings
        // -----------------------------------
        this.app = {
            name: 'FXWIN',
            description: 'gestion couverture de change pour l\'activite GNL',
            year: ((moment().toDate()).getFullYear())
        };

        // Layout Settings
        // -----------------------------------
        this.layout = {
            isFixed: true,
            isCollapsed: false,
            isBoxed: false,
            isRTL: false,
            horizontal: false,
            isFloat: false,
            asideHover: false,
            theme:'/app/shared/styles/themes/theme-e.css',
            asideScrollbar: false,
            isCollapsedText: false,
            useFullLayout: false,
            hiddenFooter: false,
            offsidebarOpen: false,
            asideToggled: false,
            viewAnimation: 'ng-fadeInUp'
        };

    }

    getAppSetting(name) {
        return name ? this.app[name] : this.app;
    }
    getUserSetting(name) {
        return name ? this.user[name] : this.user;
    }
    getLayoutSetting(name) {
        return name ? this.layout[name] : this.layout;
    }

    setAppSetting(name, value) {
        if (typeof this.app[name] !== 'undefined') {
            this.app[name] = value;
        }
    }
    setUserSetting(name, value) {
        if (typeof this.user[name] !== 'undefined') {
            this.user[name] = value;
        }
    }
    setLayoutSetting(name, value) {
        if (typeof this.layout[name] !== 'undefined') {
            return this.layout[name] = value;
        }
    }

    toggleLayoutSetting(name) {
        return this.setLayoutSetting(name, !this.getLayoutSetting(name));
    }

}
