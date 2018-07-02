//import { FactoryProvider } from '@angular/core';
import { Injectable } from '@angular/core';
import { ODataConfiguration } from "angular-odata-es5";
import * as myGlobals from '../shared/helpers/globals';
import { AppConfiguration } from '../app.configuration';
/* Use this routes definition in case you want to make them lazy-loaded */
@Injectable()

export class ODataConfigurationFactory {

    constructor(appConfig: AppConfiguration) {
        const config = new ODataConfiguration();
        config.baseUrl = appConfig.host;//myGlobals.baseAdresse;
        return config;
    }
}
