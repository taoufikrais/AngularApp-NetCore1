import { Component, OnInit } from '@angular/core';
import { UserblockService } from './userblock.service';
import { User,Role } from '../../../core/models/user.model';

@Component({
    selector: 'app-userblock',
    templateUrl: './userblock.component.html',
    styleUrls: ['./userblock.component.scss']
})
export class UserblockComponent implements OnInit {
    user: User;
    constructor(public userblockService: UserblockService) {

        this.user = userblockService.currentUser;
    }

    ngOnInit() {
    }

    userBlockIsVisible() {
        return this.userblockService.getVisibility();
    }
    
    // isAuthenticated() {
    //     return this.userblockService.isAuthenticated();
    // }

    // login()
    // {
    //     return this.userblockService.login();
    // }

    logout()
    {
        return this.userblockService.logout();
    }
}
