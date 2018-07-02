import { Incoterm, Currency, Book, ContractType, Unit } from "./typeCode.model";
import { CommodityHedge } from "./commodityHedge.model";
import { HedgeLeg } from "./hedge.model";
import { LinkFxContractSignalContract } from "./signalContract.model";
import { TimeSerie } from "./timeserie.model";

export class Contract {
        Id: number;
        Code: string;
        PaymentOffset: number;
        MarginSharingBEE: boolean;
        IsFiftyFifty: boolean;
        IsSpotContract: boolean;
        IsMTContract: boolean;
        OrderNumberPrefix: string;
    
        ContractTypeId: number;
        ContractType: ContractType;
    
        IncotermId: number;
        Incoterm: Incoterm;
    
        CurrencyId: number;
        Currency: Currency;
    
        BookId: number;
        Book: Book;
    
        CommodityHedges: CommodityHedge[];
        CommodityHedges1: CommodityHedge[];
        LinkFxContractFormulas: LinkFxContractFormula[];
        LinkFxContractSignalContracts: LinkFxContractSignalContract[];
        HedgeLegs: HedgeLeg[];
    
        public constructor() {
    
            this.Id = 0;
    
            this.ContractTypeId = null;
            this.IncotermId = null;
            this.CurrencyId = null;
            this.BookId = null;
        }
    }
export interface VW_LinkFxContractSignalContract {
    Id: number;
    Code: string;
    FxContractId: number;
}
export interface LinkFxContractFormula {
    Id: number;
    FxContractId: number;
    FormulaId: number;
    StartDate: Date;
    EndDate: Date;
    Formula: Formula;
    FxContract: Contract;
}
export interface Formula {
    Id: number;
    Code: string;
    Gradient: number;
    TimeSerieId: number;
    ResultantUnitId: number;
    Constant: number;
    Comments: string;
    LinkFxContractFormulas: LinkFxContractFormula[];
    TimeSerie: TimeSerie;
    Unit: Unit;
}
