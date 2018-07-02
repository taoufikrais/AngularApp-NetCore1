import {Directive, ElementRef, OnInit, HostListener, Output, Renderer,EventEmitter} from '@angular/core';
import {NgControl} from '@angular/forms';
import {FormatHelper} from '../../helpers/formatHelper';
import * as moment from 'moment';

@Directive({
  selector: '[customDate]'
})

export class CustomDateDirective implements OnInit {
 
  @Output() ngModelChange: EventEmitter<any> = new EventEmitter();
  
  constructor(
    private el: ElementRef,
    private model: NgControl,
    private render: Renderer
  ) {

   }

   ngOnInit(): void {
  }

  @HostListener('input') inputChange() {
    debugger;
    let pos = this.el.nativeElement.selectionStart;
    let val = this.el.nativeElement.value;
    debugger;
    if(FormatHelper.validateDateFormat(val))
    {
      var dateParts = val.split("/");
      //format YY/MM/YYYY
      // var Dateobject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
      // this.render.setElementProperty(this.el.nativeElement, 'value', moment(Dateobject).format('DD/MM/YYYY'));
      //format MM/DD/YYYY
      var Dateobject = new Date(dateParts[2], dateParts[0]-1,dateParts[1]);
      this.render.setElementProperty(this.el.nativeElement, 'value', moment(Dateobject).format('MM/DD/YYYY'));
      this.ngModelChange.emit(Dateobject);
    }
    setTimeout(() => {
      this.el.nativeElement.selectionStart = pos;
      this.el.nativeElement.selectionEnd = pos;
    });

    // const newValue = parseFloat(this.el.nativeElement.value.replace(/\D/g, ''));
    // this.model.control.setValue(newValue, {
    //   emitEvent: false,
    //   emitModelToViewChange: false,
    //   emitViewToModelChange: false
    // });
  }

  @HostListener('keyup', ['$event']) onInputChange(event) {
    // get position
    debugger;
    let pos = this.el.nativeElement.selectionStart;
    let val = this.el.nativeElement.value;

    // if key is '.' and next character is '.', skip position
    if (event.key === '.' &&
      val.charAt(pos) === '.') {

      // remove duplicate periods
      //val = val.replace(duplicatePeriods, '.');

      this.render.setElementProperty(this.el.nativeElement, 'value', val);
      this.ngModelChange.emit(val);
      this.el.nativeElement.selectionStart = pos;
      this.el.nativeElement.selectionEnd = pos;

    }
  }

}



@Directive({
  selector: '[monthDate]'
})

export class MonthDateDirective implements OnInit {
 
  @Output() ngModelChange: EventEmitter<any> = new EventEmitter();
  
  constructor(
    private el: ElementRef,
    private model: NgControl,
    private render: Renderer
  ) {

   }

   ngOnInit(): void {
  }

  @HostListener('input') inputChange() {
    debugger;
    let pos = this.el.nativeElement.selectionStart;
    let val = this.el.nativeElement.value;
    debugger;
    if(FormatHelper.validateDateFormat(val))
    {
      var dateParts = val.split("/");
      //format YY/MM/YYYY
      //var Dateobject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
      //format MM/DD/YYYY
      var Dateobject = new Date(dateParts[2], dateParts[0]-1,dateParts[1]);
      debugger;
      this.render.setElementProperty(this.el.nativeElement, 'value', moment(Dateobject).format('MMM YYYY'));
      this.ngModelChange.emit(Dateobject);
    }
    setTimeout(() => {
      this.el.nativeElement.selectionStart = pos;
      this.el.nativeElement.selectionEnd = pos;
    });

    // const newValue = parseFloat(this.el.nativeElement.value.replace(/\D/g, ''));
    // this.model.control.setValue(newValue, {
    //   emitEvent: false,
    //   emitModelToViewChange: false,
    //   emitViewToModelChange: false
    // });
  }

  @HostListener('keyup', ['$event']) onInputChange(event) {
    // get position
    debugger;
    let pos = this.el.nativeElement.selectionStart;
    let val = this.el.nativeElement.value;

    // if key is '.' and next character is '.', skip position
    if (event.key === '.' &&
      val.charAt(pos) === '.') {

      // remove duplicate periods
      //val = val.replace(duplicatePeriods, '.');

      this.render.setElementProperty(this.el.nativeElement, 'value', val);
      this.ngModelChange.emit(val);
      this.el.nativeElement.selectionStart = pos;
      this.el.nativeElement.selectionEnd = pos;

    }
  }

}