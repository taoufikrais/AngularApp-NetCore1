import { Injectable } from '@angular/core';
//import { OktaAuthService } from './oktaAuthentication.service';
import { Router } from '@angular/router';
import { User,Role } from '../../../core/models/user.model'

@Injectable()
export class UserblockService {
    public userBlockVisible: boolean;
    public currentUser: User;
    private oktaSignIn;

    constructor(private router: Router)//public oktaAuth: OktaAuthService,
    {
        // initially visible
        this.userBlockVisible = true;
        this.currentUser = this.getCurrentUser();
        //this.oktaSignIn = this.oktaAuth.getWidget();
    }

    getVisibility() {
        return this.userBlockVisible;
    }

    setVisibility(stat = true) {
        this.userBlockVisible = stat;
    }

    toggleVisibility() {
        this.userBlockVisible = !this.userBlockVisible;
    }

    getCurrentUser() {
        if (localStorage["currentUser"] != undefined) {
            let user =<User>JSON.parse(localStorage["currentUser"]);
            user.Picture = 'assets/img/user/01.jpg';
           // user.Job = user.FxRole.Code;
            return user;
        } 
    }

    // isAuthenticated() {
    //     //return this.oktaAuth.signIn("benrjeb.imen@gmail.com","T@oufik82");
    //     return this.oktaAuth.isAuthenticated();
    // }
    //  login() {
    //     return this.oktaAuth.login();
    //  }
 
     logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.router.navigateByUrl('/');//force roload home 
        //this.router.navigate(['home']);
        //this.oktaAuth.logout();
     }

}
