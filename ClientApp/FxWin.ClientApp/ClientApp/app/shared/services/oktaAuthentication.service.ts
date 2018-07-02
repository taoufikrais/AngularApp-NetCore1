import { Injectable } from '@angular/core';
//import { Router } from '@angular/router';
import * as OktaAuth from '@okta/okta-auth-js';
import { AppConfiguration } from '../../app.configuration';

//declare let OktaSignIn: any;

@Injectable()
export class OktaAuthService {
    widget;
    currentUser = { name: undefined, email: undefined, token: undefined};

    constructor(private config: AppConfiguration) { //private config: AppConfiguration
        let octaConf = config.getConfig('oktaConfig');
        this.widget = new OktaAuth({
            url: octaConf.url,
            clientId: octaConf.clientId,
            redirectUri: octaConf.redirectUri
        });

        // this.widget = new OktaAuth({
        //     url: "https://dev-556727.oktapreview.com",
        //     clientId: "0oac5um8c1ow4cL0X0h7",
        //     redirectUri: "http://localhost:5000/implicit/callback"
        // });
    }

    // Launches the login without redirect.
    signIn(username, userPassword) {
        this.widget.signIn({ username: username, password: userPassword })
	         .then(function(transaction) {
                if (transaction.status === "SUCCESS") {
                    window.localStorage["auth"] = JSON.stringify({
                     "sessionToken": transaction.sessionToken,
                        "user": transaction.user
                });
                    this.widget.session.setCookieAndRedirect(transaction.sessionToken);
                    window.location.href = '/';
        }
    }, function(error) {
        // Error authenticating
        console.error(error);
    });
    }

    // Launches the login redirect.
    login() {
        //debugger;
        this.widget.token.getWithRedirect({
            responseType: ['id_token', 'token'],
            scopes: ['openid', 'email', 'profile']
        }).success(s=>{
            debugger ;
         
        });
    }

    getWidget()
    {
        return this.widget;
    }

    // Checks if there is a current accessToken in the TokenManger.
    isAuthenticated()
    {
        let token = this.widget.tokenManager.get('accessToken');
        //isnot null and isnot empty 
        return !!token;
    }

    async handleAuthentication()
    {
        var tokens = await this.widget.token.parseFromUrl();
        tokens.forEach(token => {
            if (token.idToken) {
                this.widget.tokenManager.add('idToken', token);
                this.currentUser = this.decodeToken(token.idToken);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }
            if (token.accessToken) {
                this.widget.tokenManager.add('accessToken', token);
                this.currentUser = this.decodeToken(token.accessToken);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }
        });
        return tokens;
    }

    // Return the token from the accessToken object.
    getAccessToken()
    {
        return this.widget.tokenManager.get("accessToken");
    }

    //disconnect User
    async logout()
    {
        this.widget.tokenManager.clear();
        window.localStorage.removeItem("auth");//setItem
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        window.localStorage.clear();
        //this.widget.session.close();
        await this.widget.signOut();
    }

    decodeToken(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        var userData = JSON.parse(window.atob(base64));
        if (userData.name !== undefined && token !== undefined ) {
            this.currentUser.name = userData.name;
            this.currentUser.email = userData.email;
            this.currentUser.token = token;
            //window.localStorage["auth"] = JSON.stringify({
            //    "sessionToken": token,
            //    "user": userData.name
            //});
            window.localStorage["auth"] = JSON.stringify(userData);
            this.widget.session.setCookieAndRedirect(token);
        }

        //window.location.href = '/';
        return userData;
    }

    getTokens = function (auth) {
        var tokenOptions = {
            'sessionToken': auth.sessionToken,
            'responseType': ['id_token', 'token'] // Requires list for multiple inputs
        };
        this.widget.token.getWithoutPrompt(tokenOptions)
            .then(function (success) {
                // Success in order requested
                this.widget.tokenManager.add('idToken', success[0]);
                this.widget.tokenManager.add('accessToken', success[1]);

                // Update scope
                this.$apply(function () {
                    this.idToken = this.widget.tokenManager.get('idToken');
                    this.accessToken = this.widget.tokenManager.get('accessToken');
                });
            }, function (error) {
                console.error(error);
            });
    };
}