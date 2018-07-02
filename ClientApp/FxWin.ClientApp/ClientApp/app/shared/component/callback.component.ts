import { NgModule,Component, Injectable } from '@angular/core';
import { OktaAuthService } from '../services/oktaAuthentication.service';
import { Router, ActivatedRoute } from '@angular/router';

@Injectable()  

@Component({ template: '' })
export class CallbackComponent {
    returnUrl: string;
    loading = false;
    constructor(private route: ActivatedRoute, private router: Router,private oktaAuth: OktaAuthService) {
        // Handles the response from Okta and parses tokens
        oktaAuth.handleAuthentication();
    }

    ngOnInit() {
        if (localStorage.getItem('currentUser')) {
            // logged in so return true
            this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            this.router.navigate(['home']);
        }else{
            this.oktaAuth.logout();
        }
        // reset login status
        //this.authenticationService.logout();
    }
}