import { Operation } from './operation.model';
import { LinkFxContractSignalContract } from './signalContract.model';
import { SignalContractExclusion}  from './signalContract.model' ;

export class SupplyContract {
    Id: number;
    Code: string;
    IsNew: boolean;
    InventId: number;
    LinkFxContractSignalContracts: LinkFxContractSignalContract[];
    Operations: Operation[];
    SignalContractExclusions: SignalContractExclusion[];
}