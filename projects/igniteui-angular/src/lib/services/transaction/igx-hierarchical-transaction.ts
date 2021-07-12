import { HierarchicalTransaction, HierarchicalState, TransactionType } from './transaction';
import { IgxTransactionService } from './igx-transaction';
import { DataUtil } from '../../data-operations/data-util';
import { cloneValue } from '../../core/utils';
import { HierarchicalTransactionService } from './hierarchical-transaction';

/** @experimental @hidden */
export class IgxHierarchicalTransactionService<T extends HierarchicalTransaction, S extends HierarchicalState>
    extends IgxTransactionService<T, S> implements HierarchicalTransactionService<T, S> {

    public getAggregatedChanges(mergeChanges: boolean): T[] {
        const result: T[] = [];
        this._states.forEach((state: S, key: any) => {
            const value = mergeChanges ? this.mergeValues(state.recordRef, state.value) : cloneValue(state.value);
            this.clearArraysFromObject(value);
            result.push({ id: key, path: state.path, newValue: value, type: state.type } as T);
        });
        return result;
    }

    public commit(data: any[], primaryKeyOrId?: any, childDataKey?: any, id?: any): void {
        if (childDataKey !== undefined) {
            let transactions = this.getAggregatedChanges(true);
            if (id !== undefined) {
                transactions = transactions.filter(t => t.id === id);
            }
            DataUtil.mergeHierarchicalTransactions(data, transactions, childDataKey, primaryKeyOrId, true);
            this.clear(id);
        } else {
            super.commit(data, primaryKeyOrId);
        }
    }

    protected updateState(states: Map<any, S>, transaction: T, recordRef?: any): void {
        super.updateState(states, transaction, recordRef);

        //  if transaction has no path, e.g. flat data source, get out
        if (!transaction.path) {
            return;
        }

        const currentState = states.get(transaction.id);
        if (currentState) {
            currentState.path = transaction.path;
        }

        //  if transaction has path, Hierarchical data source, and it is DELETE
        //  type transaction for all child rows remove ADD states and update
        //  transaction type and value of UPDATE states
        if (transaction.type === TransactionType.DELETE) {
            states.forEach((v: S, k: any) => {
                if (v.path && v.path.indexOf(transaction.id) !== -1) {
                    switch (v.type) {
                        case TransactionType.ADD:
                            states.delete(k);
                            break;
                        case TransactionType.UPDATE:
                            states.get(k).type = TransactionType.DELETE;
                            states.get(k).value = null;
                    }
                }
            });
        }
    }

    //  TODO: remove this method. Force cloning to strip child arrays when needed instead
    private clearArraysFromObject(obj: any) {
        if (obj) {
            for (const prop of Object.keys(obj)) {
                if (Array.isArray(obj[prop])) {
                    delete obj[prop];
                }
            }
        }
    }
}

