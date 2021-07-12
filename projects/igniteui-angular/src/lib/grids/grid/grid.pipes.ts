import { Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { IGroupByResult } from '../../data-operations/grouping-result.interface';
import { IFilteringExpressionsTree, FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { ISortingExpression } from '../../data-operations/sorting-expression.interface';
import { IgxGridAPIService } from './grid-api.service';
import { IgxGridComponent } from './grid.component';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { GridType } from '../common/grid.interface';
import { IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IGridSortingStrategy } from '../../data-operations/sorting-strategy';
import { GridPagingMode } from '../common/enums';

/**
 * @hidden
 */
@Pipe({
    name: 'gridSort',
    pure: true
})
export class IgxGridSortingPipe implements PipeTransform {
    private gridAPI: IgxGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>) {
        this.gridAPI = gridAPI as IgxGridAPIService;
    }

    public transform(collection: any[], expressions: ISortingExpression[], sorting: IGridSortingStrategy,
        id: string, pipeTrigger: number, pinned?): any[] {
        const grid = this.gridAPI.grid;
        let result: any[];

        if (!expressions.length) {
            result = collection;
        } else {
            result = DataUtil.sort(cloneArray(collection), expressions, sorting, grid);
        }
        grid.setFilteredSortedData(result, pinned);

        return result;
    }
}

/**
 * @hidden
 */
@Pipe({
    name: 'gridGroupBy',
    pure: true
})
export class IgxGridGroupingPipe implements PipeTransform {
    private gridAPI: IgxGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>) {
        this.gridAPI = gridAPI as IgxGridAPIService;
    }

    public transform(collection: any[], expression: IGroupingExpression | IGroupingExpression[],
        expansion: IGroupByExpandState | IGroupByExpandState[], defaultExpanded: boolean,
        id: string, groupsRecords: any[], _pipeTrigger: number): IGroupByResult {

        const state = { expressions: [], expansion: [], defaultExpanded };
        const grid: IgxGridComponent = this.gridAPI.grid;
        state.expressions = grid.groupingExpressions;
        let result: IGroupByResult;
        const fullResult: IGroupByResult = { data: [], metadata: [] };

        if (!state.expressions.length) {
            // empty the array without changing reference
            groupsRecords.splice(0, groupsRecords.length);
            result = {
                data: collection,
                metadata: collection
            };
        } else {
            state.expansion = grid.groupingExpansionState;
            state.defaultExpanded = grid.groupsExpanded;
            result = DataUtil.group(cloneArray(collection), state, grid, groupsRecords, fullResult);
        }
        grid.groupingFlatResult = result.data;
        grid.groupingResult = fullResult.data;
        grid.groupingMetadata = fullResult.metadata;
        return result;
    }
}

/**
 * @hidden
 */
@Pipe({
    name: 'gridPaging',
    pure: true
})
export class IgxGridPagingPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>) { }

    public transform(collection: IGroupByResult, page = 0, perPage = 15, id: string, pipeTrigger: number): IGroupByResult {
        if (!this.gridAPI.grid.paginator || this.gridAPI.grid.pagingMode !== GridPagingMode.Local) {
            return collection;
        }
        const state = {
            index: page,
            recordsPerPage: perPage
        };
        const total = this.gridAPI.grid._totalRecords >= 0 ? this.gridAPI.grid._totalRecords : collection.data.length;
        DataUtil.correctPagingState(state, total);

        const result = {
            data: DataUtil.page(cloneArray(collection.data), state, total),
            metadata: DataUtil.page(cloneArray(collection.metadata), state, total)
        };
        if (this.gridAPI.grid.paginator && this.gridAPI.grid.paginator.page !== state.index) {
            this.gridAPI.grid.paginator.page = state.index;
        }
        this.gridAPI.grid.pagingState = state;
        return result;
    }
}

/**
 * @hidden
 */
@Pipe({
    name: 'gridFiltering',
    pure: true
})
export class IgxGridFilteringPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>) { }

    public transform(collection: any[], expressionsTree: IFilteringExpressionsTree,
        filterStrategy: IFilteringStrategy,
        advancedExpressionsTree: IFilteringExpressionsTree, id: string, pipeTrigger: number, filteringPipeTrigger: number, pinned?) {
        const grid = this.gridAPI.grid;
        const state = {
            expressionsTree,
            strategy: filterStrategy,
            advancedExpressionsTree
        };

        if (FilteringExpressionsTree.empty(state.expressionsTree) && FilteringExpressionsTree.empty(state.advancedExpressionsTree)) {
            return collection;
        }

        const result = DataUtil.filter(cloneArray(collection), state, grid);
        grid.setFilteredData(result, pinned);
        return result;
    }
}
