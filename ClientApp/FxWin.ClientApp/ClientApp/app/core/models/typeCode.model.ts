import { TimeSerie, Formula } from './timeserie.model';

export class StaticData {
    Code: string;
}

export class Currency {
    Id: number;
    Code: string;
    Symbol: string;
    public constructor()
    {
        this.Id=1 ;
        this.Code="USD";
    }
}

export class HedgeType {
    Id: number;
    Code: string;
}

export class InternalState {
    Id: number;
    Name: string;
}

export class ManagementIntent {
    Id: number;
    Code: string;
    Qualification :Qualification; 
}

export class Qualification {
    Id: number;
    Code: string;
}

export class WorkflowState {
    Id: number;
    Code: string;
}

export class Book {
    Id: number;
    Code: string;
}

export class ContractType {
    Id: number;
    Code: string;
}

export class OperationType {
    Id: number;
    Name: string;
}

export class CargoState {
    Id: number;
    Code: string;
}

export class CargoType {
    Id: number;
    Name: string;
}


export class Incoterm {
    Id: number;
    Code: string;
}

export class PortType {
    Id: number;
    Code: string;
}

export class PurchaseSale {
    Id: number;
    Code: string;
    //CommodityHedges: Observable<CommodityHedge>;
    //ExecutionFXes: Observable<ExecutionFX>;
    //HedgeLegs: Observable<HedgeLeg>;
    //LinkLegHedgeCommoHedges: Observable<LinkLegHedgeCommoHedge>;
    //Operations: Observable<Operation>;
    public constructor()
    {
      this.Id = 1;
      this.Code="Vente";
    }
}

export class Unit {
    Id: number;

    SignalCode: string;
    PomaxCode: string;
    Code: string;
    FxWinFlag: boolean;
    FxWinFormulaFlag: boolean;

    Formulae: Formula[];
    TimeSeries: TimeSerie[];
}

export class LinkType {
    Id: number;
    Code: string;
    //LinkLegHedgeCommoHedges: LinkLegHedgeCommoHedge[];
}

export class SubjacentType {
    Id: number;
    Code: string;
}

