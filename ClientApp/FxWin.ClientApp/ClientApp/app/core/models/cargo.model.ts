import { Operation } from './operation.model';
import { CargoState } from './typeCode.model';
import * as moment from 'moment';

export class Cargo {
    Id: number;
    Code: string;
    CargoStateId: number;
    InternalStateId: number;
    LoadingDate: Date;
    CreationUser: string;
    ModificationUser: string;
    CreationDate: Date;
    ModificationDate: Date;
    CargoState: CargoState;
    Operations: Operation[];

    public constructor(code: string, creationUser: string, operations? : Operation[] ) {
       this.Id = 0;
       this.Code = code;
       this.CreationUser = creationUser; 
       this.CreationDate = moment().toDate();
       this.CargoStateId = 0;
       this.LoadingDate = moment().toDate();
       this.Operations = operations;
    } 
  
}

export class VW_CargoView {
    /*[Key]*/
    CargoId: number;
    Code: string;
    CargoState: string;
    CargoLoadingDate:Date;
    PurchaseContract: string;
    PurchaseAmount: number;
    PurchaseAmount2: number;
    PurchaseCargoType: string;
    PurchaseCodeAbattement: number;
    PurchaseCommoExposition: number;
    PurchaseUnitCode: string;
    PurchaseConstantFxExposition: number;
    PurchaseCurrency: string;
    PurchaseEnergyTW0: number;
    PurchaseOperationInternalState: string;
    PurchaseLoadingPort: string;
    PurchaseLostAtSeaM3: number;
    PurchaseLostAtSeaTW0: number;
    PurchaseOperationDate:Date;
    PurchaseOperationSignal: string;
    PurchaseOperationType: string;
    PurchaseOperationVolumeM3: number;
    PurchasePayementDate:Date;
    PurchasePayementDate2:Date;
    PurchaseMiddleOfficeCode: string;
    PurchaseVesselCode: string;
    PurchaseEnergyMMBtu: number;
    PurchaseBOValidated: number;
    PurchaseCargoFxHedgeRatio: number;
    PurchaseCargoResultingFxExposure: number;
    PurchaseCargoPhysicalFxExposure: number;
    PurchaseCargoFxHedgeExposure: number;
    PurchaseCargoFxHedgeMaturity:Date;
    PurchaseCargoCommodityHedgeExposure: number;
    SaleContract: string;
    SaleAmount: number;
    SaleAmount2: number;
    SaleCargoType: string;
    SaleCodeAbattement: number;
    SaleCommoExposition: number;
    SaleUnitCode: string;
    SaleConstantFxExposition: number;
    SaleCurrency: string;
    SaleEnergyTW0: number;
    SaleOperationInternalState: string;
    SaleLoadingPort: string;
    SaleLostAtSeaM3: number;
    SaleLostAtSeaTW0: number;
    SaleOperationDate:Date;
    SaleOperationSignal: string;
    SaleOperationType: string;
    SaleOperationVolumeM3: number;
    SalePayementDate:Date;
    SalePayementDate2:Date;
    SaleMiddleOfficeCode: string;
    SaleVesselCode: string;
    SaleEnergyMMBtu: number;
    SaleBOValidated: number;
    SaleCargoFxHedgeRatio: number;
    SaleCargoResultingFxExposure: number;
    SaleCargoPhysicalFxExposure: number;
    SaleCargoFxHedgeExposure: number;
    SaleCargoFxHedgeMaturity:Date;
    SaleCargoCommodityHedgeExposure: number;
}