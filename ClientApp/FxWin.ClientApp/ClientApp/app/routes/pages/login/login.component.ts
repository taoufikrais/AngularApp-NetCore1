import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../core/settings/settings.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Router, ActivatedRoute,NavigationStart } from '@angular/router';
//import { AlertService, AuthenticationService } from '../_services/index';

import { OktaAuthService } from '../../../shared/services/oktaAuthentication.service';
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    valForm: FormGroup;
    returnUrl: string;
    loading = false;
    signIn;
    private widget;

    // ******* with okta login use this constructor  and ngOninit
    constructor(router: Router,private route: ActivatedRoute,public oktaAuth: OktaAuthService) {
        this.widget  = this.oktaAuth.getWidget();
        this.signIn = oktaAuth;
        // Show the widget when prompted, otherwise remove it from the DOM.
        router.events.forEach(event => {
          if (event instanceof NavigationStart) {
            switch(event.url) {
              case '/login':
                break;
               case '/home':
                  break;
              default:
               this.widget.remove();
                break;
            }
          }
        });
    }

    ngOnInit() {
        this.oktaAuth.logout()
        if(!this.oktaAuth.isAuthenticated()){
              this.oktaAuth.login()
        }
        // this.widget.renderEl(
        //   { el: '#okta-signin-container'}, res => {
        //     if (res.status === 'SUCCESS') {
        //       this.signIn.loginRedirect({ sessionToken: res.session.token });
        //       // Hide the widget
        //       this.widget.hide();
        //     }
        //   }
        // );
    }


     /*** with classic loging page  */
    // constructor(public settings: SettingsService, fb: FormBuilder,
    //     private route: ActivatedRoute,
    //     private router: Router
    //     //,private authenticationService: AuthenticationService,
    //     //private alertService: AlertService
    //    ) 
    //     {

    //     this.valForm = fb.group({
    //         'email': [null, Validators.compose([Validators.required, CustomValidators.email])],
    //         'password': [null, Validators.required]
    //     });

    // }
    // ngOnInit() {
    //     // reset login status
    //     //this.authenticationService.logout();
    //     // get return url from route parameters or default to '/'
    //     this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    // }

    login() {
        this.loading = true;
        // this.authenticationService.login(this.model.username, this.model.password)
        //     .subscribe(
        //         data => {
        //             this.router.navigate([this.returnUrl]);
        //         },
        //         error => {
        //             this.alertService.error(error);
        //             this.loading = false;
        //         });
    }

    
    submitForm($ev, value: any) {
        $ev.preventDefault();
        for (let c in this.valForm.controls) {
            this.valForm.controls[c].markAsTouched();
            this.login();
        }
        if (this.valForm.valid) {
            console.log('Valid!');
            console.log(value);
        }
    }
}
