import { Component } from '@angular/core';

@Component({
    selector: 'my-app',
    template: `<my-ng2-template></my-ng2-template>`
})
export class AppComponent {
    public prop;
    constructor() {
        this.prop = 'This property!';
    }
}
