export class User {
    Id: number;
    UserGaia: string;
    Name: string;
    Surname: string;
    IsActive:boolean;
    Skin:string;
    FxRoleId: number;
    FxRole :Role;
    Picture:string;
    token:string ;
}


export class Role {
    Id: number;
    Code: string;
    Description: string;
}


