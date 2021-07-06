import { DeprecateProperty } from '../core/deprecateDecorators';
import { IGroupByRecord } from '../data-operations/groupby-record.interface';
import { IgxRow } from './common/crud.service';
import { RowType } from './common/row.interface';
import { IgxGridAPIService } from './grid/grid-api.service';
import { IgxGridComponent } from './grid/grid.component';
import { IgxHierarchicalGridComponent } from './hierarchical-grid/hierarchical-grid.component';
import { IgxSummaryResult } from './summaries/grid-summary';
import { IgxTreeGridComponent } from './tree-grid/tree-grid.component';
import { ITreeGridRecord } from './tree-grid/tree-grid.interfaces';

abstract class BaseRow implements RowType {
    public index: number;
    /**
     * The grid that contains the row.
     */
    public grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent;
    protected _data?: any;

    /**
     * Gets the row key.
     * A row in the grid is identified either by:
     * - primaryKey data value,
     * - the whole rowData, if the primaryKey is omitted.
     *
     * ```typescript
     * let rowKey = row.key;
     * ```
     */
    public get key(): any {
        const data = this.data;
        const primaryKey = this.grid.primaryKey;
        return primaryKey ? data[primaryKey] : data;
    }

    /**
     * The data record that populates the row.
     *
     * ```typescript
     * let rowData = row.data;
     * ```
     */
    public get data(): any {
        return this._data ?? this.grid.dataView[this.index];
    }

    /**
     * @deprecated Use 'data' instead.
     *
     * The data record that populates the row
     */
    @DeprecateProperty(`'rowData' property is deprecated. Use 'data' instead.`)
    public get rowData(): any {
        return this.data;
    }

    /**
     * @deprecated Use 'key' instead.
     *
     */
    @DeprecateProperty(`'rowID' property is deprecated. Use 'key' instead.`)
    public get rowID(): any {
        return this.key;
    }

    /**
     * Returns the view index calculated per the grid page.
     */
    public get viewIndex(): number {
        return this.index + this.grid.page * this.grid.perPage;
    }

    /**
     * Returns if the row is currently in edit mode.
     */
    public get inEditMode(): boolean {
        if (this.grid.rowEditable) {
            const editRowState = this.grid.crudService.row;
            return (editRowState && editRowState.id === this.key) || false;
        } else {
            return false;
        }
    }

    /**
     * Gets whether the row is pinned.
     * Default value is `false`.
     * ```typescript
     * const isPinned = row.pinned;
     * ```
     */
    public get pinned(): boolean {
        return this.grid.isRecordPinned(this.data);
    }

    /**
     * Sets whether the row is pinned.
     * Default value is `false`.
     * ```typescript
     * row.pinned = !row.pinned;
     * ```
     */
    public set pinned(val: boolean) {
        if (val) {
            this.pin();
        } else {
            this.unpin();
        }
    }

    /**
     * Gets the row expanded/collapsed state.
     *
     * ```typescript
     * const isExpanded = row.expanded;
     * ```
     */
    public get expanded(): boolean {
        return this.grid.gridAPI.get_row_expansion_state(this.data);
    }

    /**
     * Expands/collapses the row.
     *
     * ```typescript
     * row.expanded = true;
     * ```
     */
    public set expanded(val: boolean) {
        this.grid.gridAPI.set_row_expansion_state(this.key, val);
    }

    /**
     * Gets whether the row is selected.
     * Default value is `false`.
     * ```typescript
     * row.selected = true;
     * ```
     */
    public get selected(): boolean {
        return this.grid.selectionService.isRowSelected(this.key);
    }

    /**
     * Sets whether the row is selected.
     * Default value is `false`.
     * ```typescript
     * row.selected = !row.selected;
     * ```
     */
    public set selected(val: boolean) {
        if (val) {
            this.grid.selectionService.selectRowsWithNoEvent([this.key]);
        } else {
            this.grid.selectionService.deselectRowsWithNoEvent([this.key]);
        }
        this.grid.cdr.markForCheck();
    }

    /**
     * Returns if the row is in delete state.
     */
    public get deleted(): boolean {
        return this.grid.gridAPI.row_deleted_transaction(this.key);
    }

    /**
     * Returns if the row has child rows. Always return false for IgxGridRow.
     */
    public get hasChildren(): boolean {
        return false;
    }

    /**
     * TODO after cell facade class is implemented
     * Gets the rendered cells in the row component.
     * public get cells()
     */

    /**
     * Pins the specified row.
     * This method emits `onRowPinning` event.
     *
     * ```typescript
     * // pin the selected row from the grid
     * this.grid.selectedRows[0].pin();
     * ```
     */
    public pin(): boolean {
        return this.grid.pinRow(this.key);
    }

    /**
     * Unpins the specified row.
     * This method emits `onRowPinning` event.
     *
     * ```typescript
     * // unpin the selected row from the grid
     * this.grid.selectedRows[0].unpin();
     * ```
     */
    public unpin(): boolean {
        return this.grid.unpinRow(this.key);
    }

    /**
     * Updates the specified row object and the data source record with the passed value.
     *
     * ```typescript
     * // update the second selected row's value
     * let newValue = "Apple";
     * this.grid.selectedRows[1].update(newValue);
     * ```
     */
    public update(value: any): void {
        const crudService = this.grid.crudService;
        if (crudService.cellInEditMode && crudService.cell.id.rowID === this.key) {
            this.grid.transactions.endPending(false);
        }
        const row = new IgxRow(this.key, this.index, this.data, this.grid);
        this.grid.gridAPI.update_row(row, value);
        this.grid.notifyChanges();
    }

    /**
     * Removes the specified row from the grid's data source.
     * This method emits `onRowDeleted` event.
     *
     * ```typescript
     * // delete the third selected row from the grid
     * this.grid.selectedRows[2].delete();
     * ```
     */
    public delete(): void {
        this.grid.deleteRowById(this.key);
    }
}

export class IgxGridRow extends BaseRow implements RowType {
    /**
     * @hidden
     */
    constructor(public grid: IgxGridComponent,
        public index: number, protected _data?: any) {
        super();
    }

    /**
     * Returns the view index calculated per the grid page.
     */
    public get viewIndex(): number {
        if (this.grid.groupingExpressions.length) {
            return this.grid.filteredSortedData.indexOf(this.data);
        }
        return this.index + this.grid.page * this.grid.perPage;
    }

    /**
     * Returns the parent row, if grid is grouped.
     */
    public get parent(): RowType {
        let parent: IgxGroupByRow;
        if (!this.grid.groupingExpressions.length) {
            return undefined;
        }

        let i = this.index - 1;
        while (i >= 0 && !parent) {
            const rec = this.grid.dataView[i];
            if (this.grid.isGroupByRecord(rec)) {
                parent = new IgxGroupByRow(this.grid, i, rec);
            }
            i--;
        }
        return parent;
    }
}

export class IgxTreeGridRow extends BaseRow implements RowType {
    /**
     * @hidden
     */
    constructor(public grid: IgxTreeGridComponent,
        public index: number, protected _data?: any, private _treeRow?: ITreeGridRecord) {
        super();
    }

    /**
     *  The data passed to the row component.
     *
     * ```typescript
     * let selectedRowData = this.grid.selectedRows[0].rowData;
     * ```
     */
    public get data(): any {
        if (this._data) {
            return this._data;
        } else {
            const rec = this.grid.dataView[this.index];
            return this.grid.isTreeRow(rec) ? rec.data : rec;
        }
    }

    /**
     * Returns the child rows.
     */
    public get children(): RowType[] {
        const children: IgxTreeGridRow[] = [];
        if (this.treeRow.expanded) {
            this.treeRow.children.forEach((rec, i) => {
                const row = new IgxTreeGridRow(this.grid, this.index + 1 + i, rec.data);
                children.push(row);
            });
        }
        return children;
    }

    /**
     * Returns the parent row.
     */
    public get parent(): RowType {
        const row = this.grid.getRowByKey(this.treeRow.parent.rowID);
        return row;
    }

    /**
     * Returns true if child rows exist. Always return false for IgxGridRow.
     */
    public get hasChildren(): boolean {
        if (this.treeRow.children) {
            return this.treeRow.children.length > 0;
        } else {
            return false;
        }
    }

    /**
     * The `ITreeGridRecord` with metadata about the row in the context of the tree grid.
     *
     * ```typescript
     * const rowParent = this.treeGrid.getRowByKey(1).treeRow.parent;
     * ```
     */
    public get treeRow(): ITreeGridRecord {
        return this._treeRow ?? this.grid.records.get(this.key);
    }

    /**
     * Gets whether the row is pinned.
     *
     * ```typescript
     * let isPinned = row.pinned;
     * ```
     */
    public get pinned(): boolean {
        return this.grid.isRecordPinned(this);
    }

    /**
     * Sets whether the row is pinned.
     * Default value is `false`.
     * ```typescript
     * row.pinned = !row.pinned;
     * ```
     */
    public set pinned(val: boolean) {
        if (val) {
            this.pin();
        } else {
            this.unpin();
        }
    }

    /**
     * Gets whether the row is expanded.
     *
     * ```typescript
     * let esExpanded = row.expanded;
     * ```
     */
    public get expanded(): boolean {
        return this.grid.gridAPI.get_row_expansion_state(this.treeRow);
    }

    /**
     * Expands/collapses the row.
     *
     * ```typescript
     * row.expanded = true;
     * ```
     */
    public set expanded(val: boolean) {
        this.grid.gridAPI.set_row_expansion_state(this.key, val);
    }
}

export class IgxHierarchicalGridRow extends BaseRow implements RowType {
    /**
     * Returns the view index calculated per the grid page.
     */
    public get viewIndex(): number {
        return this.index + this.grid.page * this.grid.perPage;
    }

    /**
     * @hidden
     */
    constructor(public grid: IgxHierarchicalGridComponent,
        public index: number, protected _data?: any) {
        super();
    }

    /**
     * Returns true if row islands exist.
     */
    public get hasChildren(): boolean {
        return !!this.grid.childLayoutKeys.length;
    }
}

export class IgxGroupByRow implements RowType {
    /**
     * Returns the row index.
     */
    public index: number;

    /**
     * The grid that contains the row.
     */
    public grid: IgxGridComponent;

    /**
     * Returns always true, because this is in instance of an IgxGroupByRow.
     */
    public isGroupByRow: boolean;

    /**
     * The IGroupByRecord object, representing the group record, if the row is a GroupByRow.
     */
    public get groupRow(): IGroupByRecord {
        return this._groupRow ? this._groupRow : this.grid.dataView[this.index];
    }

    /**
     * Returns the child rows.
     */
    public get children(): RowType[] {
        const children: IgxGridRow[] = [];
        this.groupRow.records.forEach((rec, i) => {
            const row = new IgxGridRow(this.grid, this.index + 1 + i, rec);
            children.push(row);
        });
        return children;
    }

    /**
     * @hidden
     */
    constructor(grid: IgxGridComponent, index: number, private _groupRow?: IGroupByRecord) {
        this.grid = grid;
        this.index = index;
        this.isGroupByRow = true;
    }

    /**
     * Gets whether the row is selected.
     * Default value is `false`.
     * ```typescript
     * row.selected = true;
     * ```
     */
    public get selected(): boolean {
        return this.children.every(row => row.selected);
    }

    /**
     * Sets whether the row is selected.
     * Default value is `false`.
     * ```typescript
     * row.selected = !row.selected;
     * ```
     */
    public set selected(val: boolean) {
        if (val) {
            this.children.forEach(row => {
                this.grid.selectionService.selectRowsWithNoEvent([row.key]);
            });
        } else {
            this.children.forEach(row => {
                this.grid.selectionService.deselectRowsWithNoEvent([row.key]);
            });
        }
        this.grid.cdr.markForCheck();
    }

    /**
     * Gets/sets whether the group row is expanded.
     * ```typescript
     * const groupRowExpanded = groupRow.expanded;
     * ```
     */
    public get expanded(): boolean {
        return this.grid.isExpandedGroup(this.groupRow);
    }

    public set expanded(value: boolean) {
        this.gridAPI.set_grouprow_expansion_state(this.groupRow, value);
    }

    public isActive(): boolean {
        return this.grid.navigation.activeNode ? this.grid.navigation.activeNode.row === this.index : false;
    }

    /**
     * Toggles the group row expanded/collapsed state.
     * ```typescript
     * groupRow.toggle()
     * ```
     */
    public toggle(): void {
        this.grid.toggleGroup(this.groupRow);
    }

    private get gridAPI(): IgxGridAPIService {
        return this.grid.gridAPI as IgxGridAPIService;
    }
}

export class IgxSummaryRow implements RowType {
    /**
     * Returns the row index.
     */
    public index: number;

    /**
     * The grid that contains the row.
     */
    public grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent;

    /**
     * Returns always true, because this is in instance of an IgxGroupByRow.
     */
    public isSummaryRow: boolean;

    /**
     * The IGroupByRecord object, representing the group record, if the row is a GroupByRow.
     */
    public get summaries(): Map<string, IgxSummaryResult[]> {
        return this._summaries ? this._summaries : this.grid.dataView[this.index].summaries;
    }

    /**
     * @hidden
     */
    constructor(grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent,
        index: number, private _summaries?: Map<string, IgxSummaryResult[]>) {
        this.grid = grid;
        this.index = index;
        this.isSummaryRow = true;
    }
}
