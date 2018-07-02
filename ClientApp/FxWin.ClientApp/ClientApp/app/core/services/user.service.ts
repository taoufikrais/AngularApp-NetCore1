import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Headers, Http, Response} from '@angular/http';
import { User } from '../models/user.model';
import { AppConfiguration } from '../../app.configuration';
import { de } from 'ngx-bootstrap/locale';

@Injectable()
export class UserService {
    private userUrl:string ;
    constructor(private http: Http,private appConfig: AppConfiguration ) {
        //this.userUrl = appConfig.host + 'Users';
    }

    login(gaia :string,url:string): Observable<User>
    { 
        let userurl= url+ 'Users'+ '/login?' +'gaia=' + gaia ;
        var res = this.http.get(userurl)
        .map(res => <User>res.json());
        return res;
    }

    // getAll() {
    //     return this.http.get<User[]>('/api/users');
    // }

    getById(id: number) {
        return this.http.get('/api/users/' + id);
    }

    create(user: User) {
        return this.http.post('/api/users', user);
    }

    update(user: User) {
        return this.http.put('/api/users/' + user.Id, user);
    }

    delete(id: number) {
        return this.http.delete('/api/users/' + id);
    }

    GetAccessFOBO(user:User):boolean
    {
        if (user != null)
            return (user.FxRoleId == 1 || user.FxRoleId == 2 || user.FxRoleId == 4);
        else
            return false;
    }

    GetAccessFOMO(user:User):boolean
    {
        if (user != null)
            return (user.FxRoleId == 1 || user.FxRoleId == 2 || user.FxRoleId == 4);
        else
            return false;
    }

    GetAccessFO(user:User):boolean
    {
        if (user != null)
            return (user.FxRoleId == 1 || user.FxRoleId == 4);
        else
            return false;
    }

    GetAccessBO(user:User):boolean
    {
        if (user != null)
            return (user.FxRoleId == 2 || user.FxRoleId == 4);
        else
            return false;
    }

    GetAccessMO(user:User):boolean
    {
        if (user != null)
            return (user.FxRoleId == 2 || user.FxRoleId == 4);
        else
            return false;
    }

    GetAccessFullADMIN(user:User):boolean
    {
        if (user != null)
            return (user.FxRoleId == 4);
        else
            return false;
    }

}