import { Component, Input } from "@angular/core";

@Component({
  selector: 'customtab',
  template: `
    <ng-content *ngIf="active"></ng-content>
  `
})
export class CustomTab {

  @Input() title = '';
  @Input() active = false;
  @Input() disabled = false;

}