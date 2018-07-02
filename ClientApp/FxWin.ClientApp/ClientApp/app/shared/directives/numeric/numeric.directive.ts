import {Directive, ElementRef, OnInit, HostListener, Output, Renderer,EventEmitter} from '@angular/core';
import {NgControl} from '@angular/forms';
 

@Directive({
  selector: '[numeric]'
})

export class NumericDirective implements OnInit {
 
  @Output() ngModelChange: EventEmitter<any> = new EventEmitter();
  currentKeyPress:any;
  
  constructor(
    private el: ElementRef,
    private model: NgControl,
    private render: Renderer
  ) {

   }

   ngOnInit(): void {
  }

  @HostListener('input') inputChange() {
    let pos = this.el.nativeElement.selectionStart;
    let val = this.el.nativeElement.value;
    if (this.currentKeyPress === '.' || this.currentKeyPress === ',') {
    } else {
      var floatval = null;
      if (val.trim() != "") {
        val = this.unmask(val);
        floatval = parseFloat(val);
      }
      this.render.setElementProperty(this.el.nativeElement, 'value', floatval);
      this.ngModelChange.emit(floatval);
    }
    setTimeout(() => {
      this.el.nativeElement.selectionStart = pos;
      this.el.nativeElement.selectionEnd = pos;
    });
  }

  
  @HostListener('keypress', ['$event']) onInputChange(event) {
    // get position
    let pos = this.el.nativeElement.selectionStart;
    let val = this.el.nativeElement.value;
    // if key is '.' and next character is '.', skip position
    if (event.key === ',' || event.key == '.') {
      //ignore
    }
    this.currentKeyPress=event.key;
  }


  unmask(val) {
    var re = / /gi;// /,/gi;
    let unmaskedval = val.replace(re, '');
    return unmaskedval;
    //return unmaskedval.replace(/,/gi, '.');//replace , by .
  } 

}