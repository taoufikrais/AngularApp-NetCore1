import { Currency, Unit } from './typeCode.model';
import { LinkFxContractFormula } from './contract.model';
import { CommodityHedge } from './commodityHedge.model';

export class TimeSerie {
    Id: number;

    Code: string;
    Comment: string;
    IsToBeImported: boolean;

    CurrencyId: number;
    Currency: Currency;
    //Currency1: Currency;

    UnitId: number;
    Unit: Unit;

    CommodityHedges: CommodityHedge[];
    Formulae: Formula[];
    TimeSerieValues: TimeSerieValue[]

    public constructor() {
        this.Id = 0;
        
        this.Comment = '';
        this.IsToBeImported = false;

        this.CommodityHedges = [];
        this.Formulae = [];
        this.TimeSerieValues = [];
    }
}

export interface Formula {
    Id: number;

    Code: string;
    Gradient: number;
    Constant: number;
    Comments: string;

    TimeSerieId: number;
    TimeSerie: TimeSerie;

    ResultantUnitId: number;
    Unit: Unit;

    LinkFxContractFormulas: LinkFxContractFormula[]
}

export class TimeSerieValue {
    Id: number;

    Date: Date;
    Value: number;

    TimeSerieId: number;
    TimeSerie: TimeSerie;

    public constructor() {
        this.Id = 0;
        this.Value = 0;
    }
}


