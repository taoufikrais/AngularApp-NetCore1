
import { Operation } from './operation.model';
import { Contract } from './contract.model';
import { SupplyContract } from './SupplyContract.model';

export class LinkFxContractSignalContract {
    Id: number;
    Include: boolean;
    IsNew: boolean;
    IsToBeStormImported: boolean;

    FxContractId: number;
    FxContract: Contract;

    PurchaseContractId: number;
    PurchaseContract: PurchaseContract;

    SupplyContractId: number;
    SupplyContract: SupplyContract;

    public constructor() {

        this.Id = 0;

        this.FxContractId = null;
        this.PurchaseContractId = null;
        this.SupplyContractId = null;
    }
}

export interface PurchaseContract {
    Id: number;
    Code: string;
    IsNew: boolean;
    InventId: number;

    LinkFxContractSignalContracts: LinkFxContractSignalContract[];

    Operations: Operation[];

    SignalContractExclusions: SignalContractExclusion[];
}


export class SignalContractExclusion {

    Id: number;

    PurchaseContractId: number;
    PurchaseContract: PurchaseContract;

    SupplyContractId: number;
    SupplyContract: SupplyContract;

    public constructor() {

        this.Id = 0;

        this.PurchaseContractId = null;
        this.SupplyContractId = null;
    }
}