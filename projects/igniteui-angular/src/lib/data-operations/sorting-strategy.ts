import { cloneArray, resolveNestedPath, parseDate } from '../core/utils';
import { IGroupByRecord } from './groupby-record.interface';
import { ISortingExpression, SortingDirection } from './sorting-expression.interface';
import { IGroupingExpression } from './grouping-expression.interface';
import { IGroupingState } from './groupby-state.interface';
import { IGroupByExpandState } from './groupby-expand-state.interface';
import { IGroupByResult } from './grouping-result.interface';
import { getHierarchy, isHierarchyMatch } from './operations';
import { GridType } from '../grids/common/grid.interface';

const DATE_TYPE = 'date';
const TIME_TYPE = 'time';
const DATE_TIME_TYPE = 'dateTime';
export interface ISortingStrategy {
    sort: (data: any[],
        fieldName: string,
        dir: SortingDirection,
        ignoreCase: boolean,
        valueResolver: (obj: any, key: string, isDate?: boolean) => any,
        isDate?: boolean,
        isTime?: boolean) => any[];
}

export class DefaultSortingStrategy implements ISortingStrategy {
    private static _instance: DefaultSortingStrategy = null;

    protected constructor() { }

    public static instance(): DefaultSortingStrategy {
        return this._instance || (this._instance = new this());
    }

    public sort(data: any[],
        fieldName: string,
        dir: SortingDirection,
        ignoreCase: boolean,
        valueResolver: (obj: any, key: string, isDate?: boolean) => any,
        isDate?: boolean,
        isTime?: boolean) {
        const key = fieldName;
        const reverse = (dir === SortingDirection.Desc ? -1 : 1);
        const cmpFunc = (obj1, obj2) => this.compareObjects(obj1, obj2, key, reverse, ignoreCase, valueResolver, isDate, isTime);
        return this.arraySort(data, cmpFunc);
    }

    public compareValues(a: any, b: any) {
        const an = (a === null || a === undefined);
        const bn = (b === null || b === undefined);
        if (an) {
            if (bn) {
                return 0;
            }
            return -1;
        } else if (bn) {
            return 1;
        }
        return a > b ? 1 : a < b ? -1 : 0;
    }

    protected compareObjects(obj1: any,
        obj2: any,
        key: string,
        reverse: number,
        ignoreCase: boolean,
        valueResolver: (obj: any, key: string, isDate?: boolean, isTime?: boolean) => any,
        isDate: boolean,
        isTime: boolean) {
        let a = valueResolver(obj1, key, isDate, isTime);
        let b = valueResolver(obj2, key, isDate, isTime);
        if (ignoreCase) {
            a = a && a.toLowerCase ? a.toLowerCase() : a;
            b = b && b.toLowerCase ? b.toLowerCase() : b;
        }
        return reverse * this.compareValues(a, b);
    }

    protected arraySort(data: any[], compareFn?): any[] {
        return data.sort(compareFn);
    }
}

export interface IGridSortingStrategy {
    sort(data: any[], expressions: ISortingExpression[], grid?: GridType): any[];
}

export class NoopSortingStrategy implements IGridSortingStrategy {
    private static _instance: NoopSortingStrategy = null;

    private constructor() { }

    public static instance() {
        return this._instance || (this._instance = new NoopSortingStrategy());
    }

    public sort(data: any[]): any[] {
        return data;
    }
}

export class IgxSorting implements IGridSortingStrategy {
    public sort(data: any[], expressions: ISortingExpression[], grid?: GridType): any[] {
        return this.sortDataRecursive(data, expressions, 0, grid);
    }

    protected groupDataRecursive<T>(data: T[], state: IGroupingState, level: number,
        parent: IGroupByRecord, metadata: IGroupByRecord[], grid: GridType = null,
        groupsRecords: any[] = [], fullResult: IGroupByResult = { data: [], metadata: [] }): T[] {
        const expressions = state.expressions;
        const expansion = state.expansion;
        let i = 0;
        let result = [];
        while (i < data.length) {
            const column = grid ? grid.getColumnByName(expressions[level].fieldName) : null;
            const isDate = column?.dataType === DATE_TYPE || column?.dataType === DATE_TIME_TYPE;
            const isTime = column?.dataType === TIME_TYPE;
            const groupRow: IGroupByRecord | any = {};
            const group = this.groupedRecordsByExpression(data, i, expressions[level], isDate, grid, groupRow);
            Object.assign(groupRow, {
                expression: expressions[level],
                level,
                records: cloneArray(group),
                value: this.getFieldValue(group[0], expressions[level].fieldName, isDate, isTime),
                groupParent: parent,
                groups: [],
                height: grid ? grid.renderedRowHeight : null,
                column
            });
            if (parent) {
                parent.groups.push(groupRow);
            } else {
                groupsRecords.push(groupRow);
            }
            const hierarchy = getHierarchy(groupRow);
            const expandState: IGroupByExpandState = expansion.find((s) =>
                isHierarchyMatch(s.hierarchy || [{ fieldName: groupRow.expression.fieldName, value: groupRow.value }], hierarchy));
            const expanded = expandState ? expandState.expanded : state.defaultExpanded;
            let recursiveResult;
            result.push(groupRow);
            metadata.push(null);
            fullResult.data.push(groupRow);
            fullResult.metadata.push(null);
            if (level < expressions.length - 1) {
                recursiveResult = this.groupDataRecursive(group, state, level + 1, groupRow,
                    expanded ? metadata : [], grid, groupsRecords, fullResult);
                if (expanded) {
                    result = result.concat(recursiveResult);
                }
            } else {
                for (const groupItem of group) {
                    fullResult.metadata.push(groupRow);
                    fullResult.data.push(groupItem);
                }
                if (expanded) {
                    metadata.push(...fullResult.metadata.slice(fullResult.metadata.length - group.length));
                    result.push(...fullResult.data.slice(fullResult.data.length - group.length));
                }
            }
            i += group.length;
        }
        return result;
    }

    protected getFieldValue(obj: any, key: string, isDate: boolean = false, isTime: boolean = false): any {
        let resolvedValue = resolveNestedPath(obj, key);
        if (isDate || isTime) {
            const date = parseDate(resolvedValue);
            resolvedValue = isTime && date ?
                new Date().setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()) : date;

        }
        return resolvedValue;
    }

    private groupedRecordsByExpression(data: any[],
        index: number,
        expression: IGroupingExpression,
        isDate: boolean = false,
        grid?: GridType,
        groupRow?: IGroupByRecord): any[] {
        const res = [];
        const key = expression.fieldName;
        const len = data.length;
        const groupval = this.getFieldValue(data[index], key, isDate);
        res.push(data[index]);
        if (grid && groupRow) {
            grid.selectionService.rowsDirectParents.set(grid.selectionService.getRowID(data[index]), groupRow);
        }
        index++;
        const comparer = expression.groupingComparer || DefaultSortingStrategy.instance().compareValues;
        for (let i = index; i < len; i++) {
            if (comparer(this.getFieldValue(data[i], key, isDate), groupval) === 0) {
                if (grid && groupRow) {
                    grid.selectionService.rowsDirectParents.set(grid.selectionService.getRowID(data[i]), groupRow);
                }
                res.push(data[i]);
            } else {
                break;
            }
        }
        return res;
    }

    private sortDataRecursive<T>(data: T[],
        expressions: ISortingExpression[],
        expressionIndex: number = 0,
        grid: GridType): T[] {
        let i;
        let j;
        let gbData;
        let gbDataLen;
        const exprsLen = expressions.length;
        const dataLen = data.length;
        expressionIndex = expressionIndex || 0;
        if (expressionIndex >= exprsLen || dataLen <= 1) {
            return data;
        }
        const expr: ISortingExpression = expressions[expressionIndex];
        if (!expr.strategy) {
            expr.strategy = DefaultSortingStrategy.instance();
        }
        const column = grid?.getColumnByName(expr.fieldName);
        const isDate = column?.dataType === DATE_TYPE || column?.dataType === DATE_TIME_TYPE;
        const isTime = column?.dataType === TIME_TYPE;
        data = expr.strategy.sort(data, expr.fieldName, expr.dir, expr.ignoreCase, this.getFieldValue, isDate, isTime);
        if (expressionIndex === exprsLen - 1) {
            return data;
        }
        // in case of multiple sorting
        for (i = 0; i < dataLen; i++) {
            gbData = this.groupedRecordsByExpression(data, i, expr, isDate, grid);
            gbDataLen = gbData.length;
            if (gbDataLen > 1) {
                gbData = this.sortDataRecursive(gbData, expressions, expressionIndex + 1, grid);
            }
            for (j = 0; j < gbDataLen; j++) {
                data[i + j] = gbData[j];
            }
            i += gbDataLen - 1;
        }
        return data;
    }
}

export class IgxDataRecordSorting extends IgxSorting {

    protected getFieldValue(obj: any, key: string, isDate: boolean = false, isTime: boolean = false): any {
        return super.getFieldValue(obj.data, key, isDate, isTime);
    }
}
