import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { OktaAuthService } from '../services/oktaAuthentication.service';
import { UserService } from '../../core/services/user.service';
import { Headers, Http, Response } from '@angular/http';

@Injectable()
export class AuthGuard implements CanActivate {
    private oktaSignIn;
    private appconfig:any;
    constructor(private router: Router ,public oktaAuth: OktaAuthService,
         private authenticationService: UserService,private http: Http) {
        this.oktaSignIn = this.oktaAuth.getWidget();
     }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (localStorage.getItem('currentUser')) {
            // logged in so return true
            return true;
        }

        // not logged in so redirect to login page with the return url
           //   this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
        
         //redirect to okta authtification server 
        //   this.oktaSignIn = this.oktaAuth.getWidget();
        //    this.oktaAuth.logout()
        //    if(!this.oktaAuth.isAuthenticated()){
        //       this.oktaAuth.login()
        //    }
        this.http.get('/api/AppConfig', { withCredentials: true })
        .map(res => res.json())
        .subscribe((appconfig) => {
            debugger;
            this.appconfig = appconfig;
        this.http.get('/api/Authentification', { withCredentials: true })
        .map(res => res.json())
        .subscribe((envResponse) => {
            debugger;
            this.authenticationService.login(envResponse,this.appconfig['webApi'].dbWebApiUrl)
            .subscribe(
                data => {
                    localStorage.setItem('currentUser', JSON.stringify(data));
                    this.router.navigate(['home']);
                    return true;
                },
                error => {
                   alert(error);
                });
    
        })
    })

        return false;
    }
}