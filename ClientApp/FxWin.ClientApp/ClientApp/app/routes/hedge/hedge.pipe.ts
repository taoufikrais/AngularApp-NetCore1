import { Component, NgModule, Pipe, PipeTransform } from '@angular/core'
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser'
import { DatePipe , CurrencyPipe, DecimalPipe} from "@angular/common";
import * as moment from 'moment';
//import {CurrencyPipe} from 'pipe'

@Pipe({ name: 'myDateTimePipe' })
export class MyDateTimePipe implements PipeTransform {
    constructor(private datePipe: DatePipe) {

    }
    transform(value: any): string {
        let format = "yyyy-MM-dd";
        return this.datePipe.transform(moment(value), format);
    }
}

@Pipe({
    name: 'numberfr'
  })
  export class FrenchDecimalPipe  implements PipeTransform {
  
  constructor(private decimalPipe: DecimalPipe) {
 
  }

    transform(value: number,degits:string): string {
      // Format the output to display any way you want here.
      //tu peut ultiluser le pipe par defaut  number:'3.2-2'
      // For instance:
      if (value !== undefined && value !== null) {
         //return this.currencyPipe
        let val =  this.decimalPipe.transform(value,degits);
        let re = /\,/gi;
        return val.replace(re," ");
      } else {
        return '';
      }
    }
  }


@Pipe({name: 'toDate'})
export class StringToDate implements PipeTransform {
  transform(value, [exponent]) : Date {
    if(value) {
      return moment(value).toDate();
    }
  }
}