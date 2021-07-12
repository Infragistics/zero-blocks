import { DeprecateProperty } from '../core/deprecateDecorators';
import { IGroupByRecord } from '../data-operations/groupby-record.interface';
import { IgxRow } from './common/crud.service';
import { GridSummaryCalculationMode, GridSummaryPosition } from './common/enums';
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
     * Returns the view index calculated per the grid page.
     */
    public get viewIndex(): number {
        return this.index + ((this.grid.paginator?.page || 0) * (this.grid.paginator?.perPage || 0));
    }

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
        if (this.grid.paginator) {
                const precedingDetailRows = [];
                const precedingGroupRows = [];
                const firstRow = this.grid.dataView[0];
                const hasDetailRows = this.grid.expansionStates.size;
                const hasGroupedRows = this.grid.groupingExpressions.length;
                let precedingSummaryRows = 0;
                const firstRowInd = this.grid.groupingFlatResult.indexOf(firstRow);

                // from groupingFlatResult, resolve two other collections:
                // precedingGroupedRows -> use it to resolve summaryRow for each group in previous pages
                // precedingDetailRows -> ise it to resolve the detail row for each expanded grid row in previous pages
                if (hasDetailRows || hasGroupedRows) {
                        this.grid.groupingFlatResult.forEach((r, ind) => {
                                const rowID = this.grid.primaryKey ? r[this.grid.primaryKey] : r;
                                if (hasGroupedRows && ind < firstRowInd && this.grid.isGroupByRecord(r)) {
                                        precedingGroupRows.push(r);
                                }
                                if (this.grid.expansionStates.get(rowID) && ind < firstRowInd && !this.grid.isGroupByRecord(r)) {
                                        precedingDetailRows.push(r);
                                }
                        });
                }

                if (this.grid.summaryCalculationMode !== GridSummaryCalculationMode.rootLevelOnly) {
                    // if firstRow is a child of the last item in precedingGroupRows,
                    // then summaryRow for this given groupedRecord is rendered after firstRow,
                    // i.e. need to decrease firstRowInd to account for the above.
                    precedingSummaryRows = precedingGroupRows.filter(gr => this.grid.isExpandedGroup(gr)).length;
                    if (this.grid.summaryPosition === GridSummaryPosition.bottom && precedingGroupRows.length &&
                        precedingGroupRows[precedingGroupRows.length - 1].records.indexOf(firstRow) > -1) {
                            precedingSummaryRows += -1;
                    }
                }

                return precedingDetailRows.length + precedingSummaryRows + firstRowInd + this.index;
        } else {
                return this.index;
        }
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
     * Returns the view index calculated per the grid page.
     */
    public get viewIndex(): number {
        if (this.grid.hasSummarizedColumns && ((this.grid.paginator?.page || 0) > 0)) {
            if (this.grid.summaryCalculationMode !== GridSummaryCalculationMode.rootLevelOnly) {
                const firstRowIndex = this.grid.processedExpandedFlatData.indexOf(this.grid.dataView[0].data);
                // firstRowIndex is based on data result after all pipes triggered, excluding summary pipe
                const precedingSummaryRows = this.grid.summaryPosition === GridSummaryPosition.bottom ?
                    this.grid.rootRecords.indexOf(this.getRootParent(this.grid.dataView[0])) :
                    this.grid.rootRecords.indexOf(this.getRootParent(this.grid.dataView[0])) + 1;
                // there is a summary row for each root record, so we calculate how many root records are rendered before the current row
                return firstRowIndex + precedingSummaryRows + this.index;
            }
        }
        return this.index + ((this.grid.paginator?.page || 0)  * (this.grid.paginator?.perPage || 0));
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
        const row = this.grid.getRowByKey(this.treeRow.parent?.rowID);
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

    private getRootParent(row: ITreeGridRecord): ITreeGridRecord {
        while (row.parent) {
            row = row.parent;
        }
        return row;
    }
}

export class IgxHierarchicalGridRow extends BaseRow implements RowType {
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
        return  !!this.grid.childLayoutKeys.length;
    }

		public get viewIndex() {
			const firstRowInd = this.grid.filteredSortedData.indexOf(this.grid.dataView[0]);
			const expandedRows = this.grid.filteredSortedData.filter((rec, ind) => {
				const rowID = this.grid.primaryKey ? rec[this.grid.primaryKey] : rec;
				return this.grid.expansionStates.get(rowID) && ind < firstRowInd;
			});
			return firstRowInd + expandedRows.length + this.index;
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
     * Returns the view index calculated per the grid page.
     */
    public get viewIndex(): number {
			if (this.grid.page) {
				const precedingDetailRows = [];
				const precedingGroupRows = [];
				const firstRow = this.grid.dataView[0];
				const hasDetailRows = this.grid.expansionStates.size;
				const hasGroupedRows = this.grid.groupingExpressions.length;
				let precedingSummaryRows = 0;
				const firstRowInd = this.grid.groupingFlatResult.indexOf(firstRow);

				// from groupingFlatResult, resolve two other collections:
				// precedingGroupedRows -> use it to resolve summaryRow for each group in previous pages
				// precedingDetailRows -> ise it to resolve the detail row for each expanded grid row in previous pages
				if (hasDetailRows || hasGroupedRows) {
						this.grid.groupingFlatResult.forEach((r, ind) => {
								const rowID = this.grid.primaryKey ? r[this.grid.primaryKey] : r;
								if (hasGroupedRows && ind < firstRowInd && this.grid.isGroupByRecord(r)) {
										precedingGroupRows.push(r);
								}
								if (this.grid.expansionStates.get(rowID) && ind < firstRowInd && !this.grid.isGroupByRecord(r)) {
										precedingDetailRows.push(r);
								}
						});
				}

				if (this.grid.summaryCalculationMode !== GridSummaryCalculationMode.rootLevelOnly) {
					// if firstRow is a child of the last item in precedingGroupRows,
					// then summaryRow for this given groupedRecord is rendered after firstRow,
					// i.e. need to decrease firstRowInd to account for the above.
					precedingSummaryRows = precedingGroupRows.filter(gr => this.grid.isExpandedGroup(gr)).length;
					if (this.grid.summaryPosition === GridSummaryPosition.bottom && precedingGroupRows.length &&
						precedingGroupRows[precedingGroupRows.length - 1].records.indexOf(firstRow) > -1) {
							precedingSummaryRows += -1;
					}
				}

				return precedingDetailRows.length + precedingSummaryRows + firstRowInd + this.index;
		} else {
				return this.index;
		}
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
     * Returns the view index calculated per the grid page.
     */
     public get viewIndex(): number {
        if (this.grid.hasSummarizedColumns && this.grid.page > 0) {
            if (this.grid instanceof IgxGridComponent) {
                const grid = this.grid as IgxGridComponent;
								if (grid.page) {
									const precedingDetailRows = [];
									const precedingGroupRows = [];
									const firstRow = this.grid.dataView[0];
									const hasDetailRows = this.grid.expansionStates.size;
									const hasGroupedRows = this.grid.groupingExpressions.length;
									let precedingSummaryRows = 0;
									const firstRowInd = this.grid.groupingFlatResult.indexOf(firstRow);

									// from groupingFlatResult, resolve two other collections:
									// precedingGroupedRows -> use it to resolve summaryRow for each group in previous pages
									// precedingDetailRows -> ise it to resolve the detail row for each expanded grid row in previous pages
									if (hasDetailRows || hasGroupedRows) {
											this.grid.groupingFlatResult.forEach((r, ind) => {
													const rowID = this.grid.primaryKey ? r[this.grid.primaryKey] : r;
													if (hasGroupedRows && ind < firstRowInd && this.grid.isGroupByRecord(r)) {
															precedingGroupRows.push(r);
													}
													if (this.grid.expansionStates.get(rowID) && ind < firstRowInd &&
														!this.grid.isGroupByRecord(r)) {
															precedingDetailRows.push(r);
													}
											});
									}

									if (this.grid.summaryCalculationMode !== GridSummaryCalculationMode.rootLevelOnly) {
										// if firstRow is a child of the last item in precedingGroupRows,
										// then summaryRow for this given groupedRecord is rendered after firstRow,
										// i.e. need to decrease firstRowInd to account for the above.
										precedingSummaryRows = precedingGroupRows.filter(gr => this.grid.isExpandedGroup(gr)).length;
										if (this.grid.summaryPosition === GridSummaryPosition.bottom && precedingGroupRows.length &&
											precedingGroupRows[precedingGroupRows.length - 1].records.indexOf(firstRow) > -1) {
												precedingSummaryRows += -1;
										}
									}

									return precedingDetailRows.length + precedingSummaryRows + firstRowInd + this.index;
							} else {
									return this.index;
							}
            } else if (this.grid instanceof IgxTreeGridComponent) {
                const grid = this.grid as IgxTreeGridComponent;
                if (grid.summaryCalculationMode !== GridSummaryCalculationMode.rootLevelOnly) {
                    const firstRowIndex = grid.processedExpandedFlatData.indexOf(grid.dataView[0].data);
                    const precedingSummaryRows = this.grid.summaryPosition === GridSummaryPosition.bottom ?
                        this.grid.rootRecords.indexOf(this.getRootParent(grid.dataView[0])) :
                        this.grid.rootRecords.indexOf(this.getRootParent(grid.dataView[0])) + 1;
                    return firstRowIndex + precedingSummaryRows + this.index;
                }
            }
        }

        return this.index + ((this.grid.paginator?.page || 0) * (this.grid.paginator?.perPage || 0));
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

    private getRootParent(row: ITreeGridRecord): ITreeGridRecord {
        while (row.parent) {
            row = row.parent;
        }
        return row;
    }
}
