import { CargoState,Currency,HedgeType,ManagementIntent,InternalState,
    Qualification,WorkflowState,PurchaseSale,ContractType, Incoterm,Book,Unit,SubjacentType,PortType,LinkType
} from './typeCode.model';
import { HedgeLeg } from './hedge.model';
import { Contract } from './contract.model';
import { Operation } from './operation.model';
import { TimeSerie } from './timeserie.model';
import { UnderlyingTerm } from './underlying.model';


export class CommodityHedge {
    Id: number;
    Code: string;
    InternalStateId: number;
    ExecutionDate: Date;
    TimeSerieId: number;
    PurchaseSaleId: number;
    Strike: number;
    FxContractId: number;
    OperationId: number;
    Maturity: string;
    IsContractUnderlying: boolean;
    IsContractAndOperationUnderlying: boolean;
    IsOtherUnderlying: boolean;
    FxContractId2: number;
    UnderlyingTermId: number;
    CreationUser: string;
    CreationDate: Date;
    ModificationUser: string;
    ModificationDate: Date;
    FxContract: Contract;
    InternalState: InternalState;
    Operation: Operation;
    PurchaseSale: PurchaseSale;
    TimeSerie: TimeSerie;
    UnderlyingTerm: UnderlyingTerm;
    FxContract1: Contract;
    HedgeCommoMaturities: HedgeCommoMaturity[];
    LinkLegHedgeCommoHedges: LinkLegHedgeCommoHedge[];
    TotalVolume: number;
}

export class LinkLegHedgeCommoHedge {
    Id: number;
    HedgeLegId: number;
    CommoHedgeId: number;
    MaturityId: number;
    LinkTypeId: number;
    PurchaseSaleId: number;
    MaturityDate: Date;
    CreationUser: string;
    ModificationUser: string;
    CreationDate: Date;
    ModificationDate: Date;
    CommodityHedge: CommodityHedge;
    HedgeCommoMaturity: HedgeCommoMaturity;
    HedgeLeg: HedgeLeg;
    LinkType: LinkType;
    PurchaseSale: PurchaseSale;
}

export class HedgeCommoMaturity {
    Id: number;
    Maturity: Date;
    Volume: number;
    PaymentDate: Date;
    FXInitialExpo: number;
    FXFinalExpo: number;
    HedgeCommoId: number;
    MOValidated: boolean;
    MtM: number;
    CreationUser: string;
    CreationDate: Date;
    ModificationUser: string;
    ModificationDate: Date;
    CommodityHedge: CommodityHedge;
    LinkLegHedgeCommoHedges: LinkLegHedgeCommoHedge[];
}