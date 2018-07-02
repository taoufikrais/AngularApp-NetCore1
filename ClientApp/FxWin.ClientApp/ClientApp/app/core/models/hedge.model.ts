import { LinkFxContractSignalContract } from './signalContract.model';
import { Operation } from './operation.model';
import { CargoState,Currency,HedgeType,ManagementIntent,InternalState,
    Qualification,WorkflowState,PurchaseSale,ContractType, Incoterm,Book,Unit,SubjacentType,PortType,LinkType
} from './typeCode.model';
import { Contract } from './contract.model';
import { UnderlyingTerm } from './underlying.model';
import { enumHedgeType,enumPurchaseType } from './enums'
import * as moment from 'moment';
import { LinkLegHedgeCommoHedge } from './commodityHedge.model';

export interface HedgeView {
    Id: number;
    Code: string;
    InternalStateId: number;
    InternalStateCode: string;
    Actarus: string;
    Notice: string;
    ManagementIntentId: number;
    ManagementIntentCode: string;
    Comment: string;
    QualificationId: number;
    QualificationCode: string;
    CurrencyId: number;
    CurrencyCode: string;
    HedgeTypeId: number;
    HedgeTypeCode: string;
    WorkflowStateId: number;
    WorkflowStateCode: string;
    CreationDate: Date;
    CreationUser: string;
    ModificationDate: Date;
    ModificationUser: string;
    ExecutionDate: Date;
    CallExpirationDate: Date;
    PutExpirationDate: Date;
    CallAmount: number;
    PutAmount: number;
    CallUnderlyingTermId: number;
    PutUnderlyingTermId: number;
    CallUnderlyingCode: string;
    PutUnderlyingCode: string;
    BuyLegContract: string;
    SaleLegContract: string;
    BuyLegUnderlyingMonth: Date;
    SaleLegUnderlyingMonth: Date;
    BuyLegMultipleCargoes: number;
    SaleLegMultipleCargoes: number;
    BuyLegCargoCode: string;
    SaleLegCargoCode: string;
    BuyLegInitialeCommoHedge: string;
    BuyLegFinaleCommoHedge: string;
    SaleLegInitialeCommoHedge: string;
    SaleLegFinaleCommoHedge: string;
    MosarRef: string;
    Mosar3rdParty: string;
}

export class Hedge {

    Id: number;
    Code: string;
    ExecutionDate: Date;
    CreationDate: Date;
    CreationUser: string;
    ModificationDate: Date;
    ModificationUser: string;

    Comment: string;
    Actarus: string;
    Notice: string;
    MosarRef: string;
    Mosar3rdParty: string;

    CurrencyId: number;
    Currency: Currency;

    HedgeTypeId: number;
    HedgeType: HedgeType;

    ManagementIntentId: number;
    ManagementIntent: ManagementIntent;

    InternalStateId: number;
    InternalState: InternalState;

    QualificationId: number;
    Qualification: Qualification;

    WorkflowStateId: number;
    WorkflowState: WorkflowState;

    HedgeLegs: HedgeLeg[];
    ExecutionFXes: ExecutionFX[];
}

export class HedgeLeg {

    Id: number;
    CreationDate: Date;
    CreationUser: string;
    ModificationDate: Date;
    ModificationUser: string;
    Amount: number;
    Maturity: Date;
    UnderlyingMonth: Date;
    MultipleCargoes: boolean;
    
    FXHedgeId: number;
    FXHedge: Hedge;

    FxContractId: number;
    FxContract: Contract;

    PurchaseSaleId: number;
    PurchaseSale: PurchaseSale;



    OperationId: number;
    Operation: Operation;

    SignalContract : string ;

    UnderlyingTermId: number;
    Subjacent: SubjacentSynthesis;
    UnderlyingMaturity:string;
    UnderlyingAmount:string;
    
    public constructor(purchaseType : enumPurchaseType ) {
        this.Id = 0;
        this.PurchaseSaleId = purchaseType;
        this.CreationDate = moment().toDate();
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.CreationUser = currentUser.UserGaia;
    }  
}

export interface Subjacent {

    Id: number;
    Code: string;
    CreationDate: Date;
    CreationUser: string;
    ModificationDate: Date;
    ModificationUser: string;
    IsBEEMarginSharing: boolean;

    PurchaseSaleId: number;
    ContractType: ContractType;

    SubjacentTypeId: number;
    SubjacentType: SubjacentType;
}

export interface Port {
    Id: number;
    Code: string;
    Name: string;
    CountryId: number;
    DeviseId: number;
    Cost: number;
    InventId: number;
    IsInventSelected: boolean;

    TypePortId: number;
    PortType: PortType;
}
export interface PurchaseContract {
    Id: number;
    Code: string;
    IsNew: boolean;
    InventId: number;
}
export interface Vessel {
    Id: number;
    Code: string;
    Name: string;
    GrossCapacity: number;
    Uilage: number;
    VolUponArrival: number;
    Laden: number;
    Ballast: number;
    IdleLaden: number;
    IdleBallast: number;
    GaranteeSpeed: number;
    ConsoGaranteeSpeedLaden: number;
    ConsoGaranteeSpeedBallast: number;
    ConsoMaxSpeed: number;
    ConsoIdle: number;
    EcoSpeedBallast: number;
    EcoSpeedLaden: number;
    MaxSpeed: number;
    CharterHireCapex: number;
    CharterHireOpex: number;
    SuezLaden: number;
    SuezBallast: number;
    MagellanLaden: number;
    MagellanBallast: number;
    BunkerFuelTypeId: number;
    ConsoBunkerFuelLoadingDay: number;
    ConsoBunkerFuelUnloadingDay: number;
    PilotLaden: number;
    PilotBallast: number;
    InventId: number;
    IsInventSelected: boolean;
}

export class ExecutionFX {

    Id: number;
    ExecutionCode: string;
    Amount: number;
    Maturity: Date;
    SpotRate: number;
    FwdPoint: number;
    AllIn: number;
    ExchValue: number;
    Nature: string;
    CreationUser: string;
    CreationDate: Date;
    ModificationUser: string;
    ModificationDate: Date;
    ConfirmationNumber: number;

    FXHedgeId: number;
    FXHedge: Hedge;

    PurchaseSaleId: number;
    PurchaseSale: PurchaseSale;

    AmountCurrencyId: number;
    Currency: Currency;

    ExchCurrencyId: number;
    Currency1: Currency;

    public constructor() {
        this.Id = 0;
        this.CreationDate = moment().toDate();
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.CreationUser = currentUser.UserGaia;
    }  
}

export interface OperationSynthesis {
    OperationId: number;
    CargoCode: string;
    Volume: number;
    Operationdate: Date;
    BOValidationStatus: number;
    FXContract: string;
    PurchaseSaleId: number;
    OperationType: string;
    FXContractId: number;
    SignalContract: string;
    InternalState: InternalState;
    CargoState: string;
    EnergyMMBtu: number;
    TxConverisonTwhToMMBtu:number;
    //legId : number ;
}

export interface SubjacentSynthesis {
    Id: number;//UnderlyingTermId
    Code: string;
    MaturityDate: Date;
    LabelEcheance: string;
    PaymentDate: Date;
    DisplayName: string;
    IsBEEMarginSharing: boolean;
    SubjacentId: number;
    PurchaseSale: number;
    IsBoValidated: number;
}










