import { HierarchicalTransaction, HierarchicalState, TransactionType } from './transaction';
import { Injectable } from '@angular/core';
import { IgxTransactionService } from '..';

@Injectable()
export class IgxHierarchicalTransactionService<T extends HierarchicalTransaction, S extends HierarchicalState>
    extends IgxTransactionService<T, S> {
    public aggregatedState(mergeChanges: boolean): T[] {
        const result: T[] = [];
        this._states.forEach((state: S, key: any) => {
            const value = mergeChanges ? this.mergeValues(state.recordRef, state.value) : state.value;
            this.clearArraysFromObject(value);
            result.push({ id: key, parentId: state.parentId, newValue: value, type: state.type } as T);
        });
        return result;
    }

    protected updateState(states: Map<any, S>, transaction: T, recordRef?: any): void {
        super.updateState(states, transaction, recordRef);
        const currentState =  states.get(transaction.id);
        if (currentState && transaction.type === TransactionType.ADD) {
            currentState.parentId = transaction.parentId;
        }
    }

    private clearArraysFromObject(obj: {}) {
        for (const prop of Object.keys(obj)) {
            if (Array.isArray(obj[prop])) {
                delete obj[prop];
            }
        }
    }
}
