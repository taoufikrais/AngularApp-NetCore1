    export class  VW_Reporting 
    {
    rowId: number;
    id: number;
    code: string;
    internalStateId: number;
    internalStateCode: string;
    actarus: string;
    notice: string;
    managementIntentId: number;
    managementIntentCode: string;
    comment: string;
    qualificationId: number;
    qualificationCode: string;
    currencyId: number;
    currencyCode: string;
    hedgeTypeId: number;
    hedgeTypeCode: string;
    workflowStateId: number;
    workflowStateCode: string;
    creationDate: Date;
    creationUser: string;
    modificationDate: Date;
    modificationUser: string;
    executionDate: Date;
    buyLegMaturity: Date;
    buyLegAmount: number;
    buyLegContract: string;
    buyLegMonth: Date;
    buyLegCargo: string;
    buyLegOperationDate: Date;
    buyLegMultipleCargoes: number;
    buyLegInitialeCommoHedge: string;
    buyLegFinaleCommoHedge: string;
    buyLegOtherUnderlying: string;
    buyLegUnderlyingAmount: number;
    saleLegMaturity: Date;
    saleLegAmount: number;
    saleLegContract: string;
    saleLegMonth: Date;
    saleLegCargo: string;
    saleLegOperationDate: Date;
    saleLegMultipleCargoes: number;
    saleLegInitialeCommoHedge: string;
    saleLegFinaleCommoHedge: string;
    saleLegOtherUnderlying: string;
    saleLegUnderlyingAmount: number;
    executionId: number;
    executionCode: string;
    confirmationNumber: number;
    purchaseSale: string;
    nature: string;
    amount: number;
    amountCurrency: string;
    maturity: Date;
    spotRate: number;
    fwdPoint: number;
    allIn: number;
    exchValue: number;
    exchCurrency: string;
}

export class  VW_Cube {
    id: number;
    fxContractCode: string;
    contractFxHedgeRatio: number;
    contractResultingFxExposure:number;
    contractPhysicalExposure:number;
    contractFxExposure:number;
    contractAvailableFxHedge:number;
    contractCommodityHedgeExposure:number;
    operationDateMonth:number;
    operationDateYear: string;
}


export class VW_CubeFXHedge {
    id: number;
    years: number;
    mois: number;
    orderNumber: string;
    hedgeLegId: number;
    fxContractId: number;
    operationId: number;
    maturityDay: number;
    maturityMonth: number;
    maturityYear: number;
    underlyingMonth: number;
    underlyingYear: number;
    fxContractCode: string;
    amount: number;
    availableFxHedge: number;
    cargoCode: string;
    physicalExposure: number;
}


export class VW_CubeCommodity {
    id: number;
    operationId: number;
    cargoCode: string;
    operationDate: Date;
    fxContractCode: string;
    fxContractId: number;
    commodityHedgeId: number;
    code: string;
    hedgeCommoMaturityId: number;
    hedgeCommoMaturityMonth: number;
    hedgeCommoMaturityYear: number;
    commodityHedgeFxContractId: number;
    commodityHedgeOperationId: number;
    mtM: number;
}