import { Injectable } from '@angular/core';
import { IgxBaseTransactionService } from './base-transaction';
import { HierarchicalTransactionService } from './hierarchical-transaction';
import { IgxHierarchicalTransactionService } from './igx-hierarchical-transaction';
import { IgxTransactionService } from './igx-transaction';
import { HierarchicalState, HierarchicalTransaction, State, Transaction, TransactionService } from './transaction';

export const enum TRANSACTION_TYPE {
    'None' = 'None',
    'Base' = 'Base'
}

@Injectable({
    providedIn: 'root'
})
export class IgxFlatTransactionFactory {

    public create(type: TRANSACTION_TYPE): TransactionService<Transaction, State> {
        switch (type) {
            case (TRANSACTION_TYPE.Base):
                return new IgxTransactionService();;
            default:
                return new IgxBaseTransactionService();
        }
    }
}

@Injectable({
    providedIn: 'root'
})
export class IgxHierarchicalTransactionFactory extends IgxFlatTransactionFactory {

    public create(type: TRANSACTION_TYPE): HierarchicalTransactionService<HierarchicalTransaction, HierarchicalState> {
        switch (type) {
            case (TRANSACTION_TYPE.Base):
                return new IgxHierarchicalTransactionService();;
            default:
                return new IgxBaseTransactionService();
        }
    }
}
