import { TransactionService, Transaction, State, StateUpdateEvent } from './transaction';
import { EventEmitter } from '@angular/core';
import { isObject, mergeObjects, cloneValue } from '../../core/utils';

export class IgxBaseTransactionService<T extends Transaction, S extends State> implements TransactionService<T, S> {
    /**
     * @inheritdoc
     */
    public get canRedo(): boolean {
        return false;
    }

    /**
     * @inheritdoc
     */
    public get canUndo(): boolean {
        return false;
    }

    /**
     * @inheritdoc
     */
    public get enabled(): boolean {
        return this._isPending;
    }

    /**
     * @inheritdoc
     */
    public onStateUpdate = new EventEmitter<StateUpdateEvent>();

    protected _isPending = false;
    protected _pendingTransactions: T[] = [];
    protected _pendingStates: Map<any, S> = new Map();

    /**
     * @inheritdoc
     */
    public add(transaction: T, recordRef?: any): void {
        if (this._isPending) {
            this.updateState(this._pendingStates, transaction, recordRef);
            this._pendingTransactions.push(transaction);
        }
    }

    /**
     * @inheritdoc
     */
    public getTransactionLog(_id?: any): T[] {
        return [];
    }

    /**
     * @inheritdoc
     */
    public undo(): void { }

    /**
     * @inheritdoc
     */
    public redo(): void { }

    /**
     * @inheritdoc
     */
    public getAggregatedChanges(mergeChanges: boolean): T[] {
        const result: T[] = [];
        this._pendingStates.forEach((state: S, key: any) => {
            const value = mergeChanges ? this.getAggregatedValue(key, mergeChanges) : state.value;
            result.push({ id: key, newValue: value, type: state.type } as T);
        });
        return result;
    }

    /**
     * @inheritdoc
     */
    public getState(id: any): S {
        return this._pendingStates.get(id);
    }

    /**
     * @inheritdoc
     */
    public getAggregatedValue(id: any, mergeChanges: boolean): any {
        const state = this._pendingStates.get(id);
        if (!state) {
            return null;
        }
        if (mergeChanges) {
            return this.updateValue(state);
        }
        return state.value;
    }

    /**
     * @inheritdoc
     */
    public commit(_data: any[], _id?: any): void { }

    /**
     * @inheritdoc
     */
    public clear(_id?: any): void {
        this._pendingStates.clear();
        this._pendingTransactions = [];
    }

    /**
     * @inheritdoc
     */
    public startPending(): void {
        this._isPending = true;
    }

    /**
     * @inheritdoc
     */
    public endPending(_commit: boolean): void {
        this._isPending = false;
        this._pendingStates.clear();
        this._pendingTransactions = [];
    }


    /**
     * Updates the provided states collection according to passed transaction and recordRef
     *
     * @param states States collection to apply the update to
     * @param transaction Transaction to apply to the current state
     * @param recordRef Reference to the value of the record in data source, if any, where transaction should be applied
     */
    protected updateState(states: Map<any, S>, transaction: T, recordRef?: any): void {
        let state = states.get(transaction.id);
        if (state) {
            if (isObject(state.value)) {
                mergeObjects(state.value, transaction.newValue);
            } else {
                state.value = transaction.newValue;
            }
        } else {
            state = { value: cloneValue(transaction.newValue), recordRef, type: transaction.type } as S;
            states.set(transaction.id, state);
        }
    }

    /**
     * Updates the recordRef of the provided state with all the changes in the state. Accepts primitive and object value types
     *
     * @param state State to update value for
     * @returns updated value including all the changes in provided state
     */
    protected updateValue(state: S) {
        return this.mergeValues(state.recordRef, state.value);
    }

    /**
     * Merges second values in first value and the result in empty object. If values are primitive type
     * returns second value if exists, or first value.
     *
     * @param first Value to merge into
     * @param second Value to merge
     */
    protected mergeValues<U>(first: U, second: U): U {
        if (isObject(first) || isObject(second)) {
            return mergeObjects(cloneValue(first), second);
        } else {
            return second ? second : first;
        }
    }
}
