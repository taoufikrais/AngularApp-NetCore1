import { HedgeLeg } from './hedge.model';
import { SubjacentType, ContractType, Currency, Book } from './typeCode.model';
import { CommodityHedge } from './commodityHedge.model';
import * as moment from 'moment';

export interface SubjacentView {
    Id: number;
    Code: string;
    Type: string;
    NumberOfMaturities: number;
    OperationType: string;
}

export class Subjacent {
    Id: number;
    Code: string;
    IsBEEMarginSharing: boolean;
    CreationDate: Date;
    CreationUser: string;
    ModificationDate: Date;
    ModificationUser: string;

    SubjacentTypeId: number;
    SubjacentType: SubjacentType;

    PurchaseSaleId: number;
    ContractType: ContractType;

    BookId: number;
    Book: Book;

    UnderlyingTerms: UnderlyingTerm[];

    public constructor() {

        this.Id = 0;

        this.SubjacentTypeId = null;
        this.PurchaseSaleId = null;
        this.BookId = null;

        this.IsBEEMarginSharing = false;

        this.CreationDate = moment().toDate();
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.CreationUser = currentUser.UserGaia;
        this.ModificationDate = null;
        this.ModificationUser = null;

        this.UnderlyingTerms = [];
    }
}


export class UnderlyingTerm {
    
        //Id: number;
        //CreationDate: Date;
        //CreationUser: string;
        //ModificationDate: Date;
        //ModificationUser: string;
        //Label: string;
        //PaymentDate: Date;
        //Amount: number;
        //Maturity: Date;
        //IsBOValidated: number;
        Id: number;
        Label: string;
        PaymentDate: Date;
        Amount: number;
        Maturity: Date;
        IsBOValidated: number;
        CreationDate: Date;
        CreationUser: string;
        ModificationDate: Date;
        ModificationUser: string;
        
        UnderlyingId: number;
        Subjacent: Subjacent;
    
        CurrencyId: number;
        Currency: Currency;
    
        HedgeLegs: HedgeLeg[];
    
        CommodityHedges: CommodityHedge[];

        public constructor() {

            this.Id = 0;

            this.Amount = 0;
            this.IsBOValidated = 0;

            this.CreationDate =  moment().toDate();
            this.CreationUser = '';
            this.ModificationDate = null;
            this.ModificationUser = null;
            
            this.HedgeLegs = [];

            this.CommodityHedges = [];
        }
    }