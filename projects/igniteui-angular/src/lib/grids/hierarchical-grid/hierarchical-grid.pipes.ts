import { Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../../core/utils';
import { GridBaseAPIService } from '../api.service';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { DataUtil } from '../../data-operations/data-util';
import { GridPagingMode } from '../common/enums';

/**
 * @hidden
 */
@Pipe({
    name: 'gridHierarchical',
    pure: true
})
export class IgxGridHierarchicalPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxHierarchicalGridComponent>) { }

    public transform(
        collection: any,
        state = new Map<any, boolean>(),
        id: string,
        primaryKey: any,
        childKeys: string[],
        _pipeTrigger: number
        ): any[] {
        if (childKeys.length === 0) {
            return collection;
        }
        const grid: IgxHierarchicalGridComponent = this.gridAPI.grid;
        if (grid.verticalScrollContainer.isRemote) {
            return collection;
        }
        const result = this.addHierarchy(grid, cloneArray(collection), state, primaryKey, childKeys);

        return result;
    }

    public addHierarchy<T>(grid, data: T[], state, primaryKey, childKeys: string[]): T[] {
        const result = [];

        data.forEach((v) => {
            result.push(v);
            const childGridsData = {};
            childKeys.forEach((childKey) => {
                const childData = v[childKey] ? v[childKey] : null;
                childGridsData[childKey] = childData;
            });
            if (grid.gridAPI.get_row_expansion_state(v)) {
                result.push({ rowID: primaryKey ? v[primaryKey] : v, childGridsData});
            }
        });
        return result;
    }
}

/**
 * @hidden
 */
@Pipe({
    name: 'gridHierarchicalPaging',
    pure: true
})
export class IgxGridHierarchicalPagingPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxHierarchicalGridComponent>) { }

    public transform(collection: any[], page = 0, perPage = 15, _id: string, _pipeTrigger: number): any[] {
        const paginator = this.gridAPI.grid.paginator;
        if (!paginator || this.gridAPI.grid.pagingMode !== GridPagingMode.Local) {
            return collection;
        }

        const state = {
            index: page,
            recordsPerPage: perPage
        };

        const total = this.gridAPI.grid._totalRecords >= 0 ? this.gridAPI.grid._totalRecords : collection.length;
        const result: any[] = DataUtil.page(cloneArray(collection), state, total);
        this.gridAPI.grid.pagingState = state;
        return result;

    }
}
