import {
    Component,
    Input,
    Output,
    ContentChildren,
    HostListener,
    EventEmitter
  } from '@angular/core';
  
  import { CustomTab } from './tab.directive';
  
  @Component({
    selector: 'customtabset',
    template: `
      <section class="tab-set">
        <ul
          class="nav"
          [class.nav-pills]="vertical"
          [class.nav-tabs]="!vertical">
          <li
            *ngFor="let tab of tabs"
            [class.active]="tab.active">
            <a
              (click)="tabClicked(tab)"
              class="btn"
              [class.disabled]="tab.disabled">
              <span>{{tab.title}}</span>
            </a>
          </li>
        </ul>
        <div class="tab-content">
          <ng-content></ng-content>
        </div>
      </section>
    `
  })
  export class CustomTabset {
    @Input() vertical;
    @Output() onSelect = new EventEmitter();
    @ContentChildren(CustomTab) tabs;
  
    ngAfterContentInit() {
      const tabs = this.tabs.toArray();
      const actives = this.tabs.filter(t => { return t.active });
  
      if(actives.length > 1) {
        console.error(`Multiple active tabs set 'active'`);
      } else if(!actives.length && tabs.length) {
        tabs[0].active = true;
      }
    }
  
    tabClicked(tab) {
      const tabs = this.tabs.toArray();
      tabs.forEach(tab => tab.active = false);
      tab.active = true;
      this.onSelect.emit(tab);
    }

    getSelectTabEmitter() {
      return this.onSelect;
    }
  
  }
  
  export const TAB_COMPONENTS = [
    CustomTabset,
    CustomTab
  ];