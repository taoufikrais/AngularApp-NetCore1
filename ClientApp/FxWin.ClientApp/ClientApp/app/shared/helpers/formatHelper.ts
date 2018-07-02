import { Injectable } from '@angular/core';
import * as moment from 'moment';
@Injectable()
export class FormatHelper {
    //Utility function used to pad the date formatting.
    static pad(num, totalStringSize) {
        let asString = num + "";
        while (asString.length < totalStringSize) asString = "0" + asString;
        return asString;
    }

    static toShortDateFormat(datetime): string {
        //return moment(datetime).format('DD/MM/YYYY')
        if (datetime) {
            var res = moment(datetime).toDate().toLocaleDateString('en-GB');
            return res;
        } else
            return datetime;


        //return this.pad(date.getDate(), 2) + '/' +
        //    this.pad(date.getMonth() + 1, 2) + '/' +
        //    date.getFullYear();
    }

    static currencyFormatter(value): string {
        //return '£' + formatNumber(value);
        return this.formatNumber(value);
    }

    static formatNumber(number): string {
        // this puts commas into the number eg 1000 goes to 1,000,
        // i pulled this from stack overflow, i have no idea how it works
        //var res = Math.round(number).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 ");
        if(number !=null)
        {
            if(number % 1 != 0){
                let nbtab= number.toString().split('.');
                let res = nbtab[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ") + "." + nbtab[1] ;
                return res;
            }else{
                let res = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                return res;
            }
        }
        return null;
    }

    static formatNumberValueTimeSerieValue(number): string {
        return number.toFixed(5);
    }

    static compareDate(filterLocalDateAtMidnight, cellValue): number {
        var dateAsString = cellValue;
        if (!this.validateDateFormat(cellValue)) {
            dateAsString = moment(cellValue).toDate().toLocaleDateString('fr-FR');
        }
        var dateParts = dateAsString.split("/");
        var cellDate = moment((Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]))).toDate();
         //console.log(cellDate);
         //console.log(filterLocalDateAtMidnight);
        if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
            return 0
        }

        if (cellDate < filterLocalDateAtMidnight) {
            return -1;
        }

        if (cellDate > filterLocalDateAtMidnight) {
            return 1;
        }
    }

    static compareAmount(filterValue, cellValue) {
        if (filterValue == cellValue) {
            return 0
        }

        if (cellValue < filterValue) {
            return -1;
        }

        if (cellValue > filterValue) {
            return 1;
        }
    }

    static validateDateFormat(testdate) {
        var date_regex = /^\d{2}\/\d{2}\/\d{4}$/;
        return date_regex.test(testdate);
    }

    static dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
    static reviver(key, value) {
        if (typeof value === "string" && this.dateFormat.test(value)) {
            return moment(value).toDate();
        }
        return value;
    }

    static iso8601RegEx = /(19|20|21)\d\d([-/.])(0[1-9]|1[012])\2(0[1-9]|[12][0-9]|3[01])T(\d\d)([:/.])(\d\d)([:/.])(\d\d)/;

    static fnConverDate(input) {
        if (typeof input !== "object") return input;

        for (var key in input) {
            if (!input.hasOwnProperty(key)) continue;

            var value = input[key];
            var type = typeof value;
            var match;
            if (type == 'string' && (match = value.match(this.iso8601RegEx))) {
                input[key] = moment(value).toDate()
            }
            else if (type === "object") {
                this.fnConverDate(value);
            }
        }
    }

    public static Deserialize(data: string): any
    {
        return JSON.parse(data, this.ReviveDateTime);
    }

    private static ReviveDateTime(key: any, value: any): any 
    {
        debugger;
        if (typeof value === 'string')
        {
            let a = /\/Date\((\d*)\)\//.exec(value);
            if (a)
            {
                return moment(+a[1]).toDate();
            }
        }

        return value;
    }
}

////@Injectable()
//export class FormatHelper {

//}

