import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    Input,
    forwardRef,
    OnInit,
    TemplateRef,
    QueryList,
    ContentChild,
    AfterContentInit,
    ViewChild,
    DoCheck,
    AfterViewInit
} from '@angular/core';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { GridBaseAPIService } from '../api.service';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IRowDataEventArgs, IRowToggleEventArgs } from '../common/events';
import {
    HierarchicalTransaction,
    HierarchicalState,
    TransactionType,
    TransactionEventOrigin,
    StateUpdateEvent
} from '../../services/transaction/transaction';
import { HierarchicalTransactionService } from '../../services/public_api';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';
import { IgxGridSelectionService } from '../selection/selection.service';
import { mergeObjects } from '../../core/utils';
import { first, takeUntil } from 'rxjs/operators';
import { IgxRowLoadingIndicatorTemplateDirective } from './tree-grid.directives';
import { IgxForOfSyncService, IgxForOfScrollSyncService } from '../../directives/for-of/for_of.sync.service';
import { IgxGridNavigationService } from '../grid-navigation.service';
import { GridType } from '../common/grid.interface';
import { IgxColumnComponent } from '../columns/column.component';
import { IgxTreeGridSelectionService } from './tree-grid-selection.service';
import { GridSelectionMode } from '../common/enums';
import { IgxSummaryRow, IgxTreeGridRow } from '../grid-public-row';
import { RowType } from '../common/row.interface';
import { IgxGridCRUDService } from '../common/crud.service';
import { IgxTreeGridGroupByAreaComponent } from '../grouping/tree-grid-group-by-area.component';

let NEXT_ID = 0;

/**
 * **Ignite UI for Angular Tree Grid** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/grid)
 *
 * The Ignite UI Tree Grid displays and manipulates hierarchical data with consistent schema formatted as a table and
 * provides features such as sorting, filtering, editing, column pinning, paging, column moving and hiding.
 *
 * Example:
 * ```html
 * <igx-tree-grid [data]="employeeData" primaryKey="employeeID" foreignKey="PID" [autoGenerate]="false">
 *   <igx-column field="first" header="First Name"></igx-column>
 *   <igx-column field="last" header="Last Name"></igx-column>
 *   <igx-column field="role" header="Role"></igx-column>
 * </igx-tree-grid>
 * ```
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-tree-grid',
    templateUrl: 'tree-grid.component.html',
    providers: [
        IgxGridCRUDService,
        IgxGridSummaryService,
        IgxGridNavigationService,
        { provide: IgxGridSelectionService, useClass: IgxTreeGridSelectionService },
        { provide: GridBaseAPIService, useClass: IgxTreeGridAPIService },
        { provide: IgxGridBaseDirective, useExisting: forwardRef(() => IgxTreeGridComponent) },
        IgxFilteringService,
        IgxForOfSyncService,
        IgxForOfScrollSyncService
    ]
})
export class IgxTreeGridComponent extends IgxGridBaseDirective implements GridType, OnInit, AfterViewInit, DoCheck, AfterContentInit {
    /**
     * An @Input property that sets the child data key of the `IgxTreeGridComponent`.
     * ```html
     * <igx-tree-grid #grid [data]="employeeData" [childDataKey]="'employees'" [autoGenerate]="true"></igx-tree-grid>
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    @Input()
    public childDataKey;

    /**
     * An @Input property that sets the foreign key of the `IgxTreeGridComponent`.
     * ```html
     * <igx-tree-grid #grid [data]="employeeData" [primaryKey]="'employeeID'" [foreignKey]="'parentID'" [autoGenerate]="true">
     * </igx-tree-grid>
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    @Input()
    public foreignKey;

    /**
     * An @Input property that sets the key indicating whether a row has children.
     * This property is only used for load on demand scenarios.
     * ```html
     * <igx-tree-grid #grid [data]="employeeData" [primaryKey]="'employeeID'" [foreignKey]="'parentID'"
     *                [loadChildrenOnDemand]="loadChildren"
     *                [hasChildrenKey]="'hasEmployees'">
     * </igx-tree-grid>
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    @Input()
    public hasChildrenKey;

    /**
     * An @Input property indicating whether child records should be deleted when their parent gets deleted.
     * By default it is set to true and deletes all children along with the parent.
     * ```html
     * <igx-tree-grid [data]="employeeData" [primaryKey]="'employeeID'" [foreignKey]="'parentID'" cascadeOnDelete="false">
     * </igx-tree-grid>
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    @Input()
    public cascadeOnDelete = true;

    /**
     * An @Input property that provides a callback for loading child rows on demand.
     * ```html
     * <igx-tree-grid [data]="employeeData" [primaryKey]="'employeeID'" [foreignKey]="'parentID'" [loadChildrenOnDemand]="loadChildren">
     * </igx-tree-grid>
     * ```
     * ```typescript
     * public loadChildren = (parentID: any, done: (children: any[]) => void) => {
     *     this.dataService.getData(parentID, children => done(children));
     * }
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    @Input()
    public loadChildrenOnDemand: (parentID: any, done: (children: any[]) => void) => void;

    /**
     * @hidden @internal
     */
    @HostBinding('attr.role')
    public role = 'treegrid';

    /**
     * An @Input property that sets the value of the `id` attribute. If not provided it will be automatically generated.
     * ```html
     * <igx-tree-grid [id]="'igx-tree-grid-1'"></igx-tree-grid>
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-tree-grid-${NEXT_ID++}`;

    /**
     * @hidden
     * @internal
     */
    @ContentChild(IgxTreeGridGroupByAreaComponent, { read: IgxTreeGridGroupByAreaComponent })
    public groupArea;

    /**
     * @hidden
     * @internal
     */
    @ViewChild('dragIndicatorIconBase', { read: TemplateRef, static: true })
    public dragIndicatorIconBase: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('record_template', { read: TemplateRef, static: true })
    protected recordTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('summary_template', { read: TemplateRef, static: true })
    protected summaryTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ContentChild(IgxRowLoadingIndicatorTemplateDirective, { read: IgxRowLoadingIndicatorTemplateDirective })
    protected rowLoadingTemplate: IgxRowLoadingIndicatorTemplateDirective;

    /**
     * @hidden
     */
    public flatData: any[] | null;

    /**
     * @hidden
     */
    public processedExpandedFlatData: any[] | null;

    /**
     * Returns an array of the root level `ITreeGridRecord`s.
     * ```typescript
     * // gets the root record with index=2
     * const states = this.grid.rootRecords[2];
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    public rootRecords: ITreeGridRecord[];

    /**
     * Returns a map of all `ITreeGridRecord`s.
     * ```typescript
     * // gets the record with primaryKey=2
     * const states = this.grid.records.get(2);
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    public records: Map<any, ITreeGridRecord> = new Map<any, ITreeGridRecord>();

    /**
     * Returns an array of processed (filtered and sorted) root `ITreeGridRecord`s.
     * ```typescript
     * // gets the processed root record with index=2
     * const states = this.grid.processedRootRecords[2];
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    public processedRootRecords: ITreeGridRecord[];

    /**
     * Returns a map of all processed (filtered and sorted) `ITreeGridRecord`s.
     * ```typescript
     * // gets the processed record with primaryKey=2
     * const states = this.grid.processedRecords.get(2);
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    public processedRecords: Map<any, ITreeGridRecord> = new Map<any, ITreeGridRecord>();

    /**
     * @hidden
     */
    public loadingRows = new Set<any>();

    protected _transactions: HierarchicalTransactionService<HierarchicalTransaction, HierarchicalState>;
    private _data;
    private _rowLoadingIndicatorTemplate: TemplateRef<any>;
    private _expansionDepth = Infinity;
    private _filteredData = null;

    /**
     * An @Input property that lets you fill the `IgxTreeGridComponent` with an array of data.
     * ```html
     * <igx-tree-grid [data]="Data" [autoGenerate]="true"></igx-tree-grid>
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    @Input()
    public get data(): any[] | null {
        return this._data;
    }

    public set data(value: any[] | null) {
        this._data = value || [];
        this.summaryService.clearSummaryCache();
        if (this.shouldGenerate) {
            this.setupColumns();
        }
        this.cdr.markForCheck();
    }

    /**
     * Returns an array of objects containing the filtered data in the `IgxGridComponent`.
     * ```typescript
     * let filteredData = this.grid.filteredData;
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    public get filteredData() {
        return this._filteredData;
    }

    /**
     * Sets an array of objects containing the filtered data in the `IgxGridComponent`.
     * ```typescript
     * this.grid.filteredData = [{
     *       ID: 1,
     *       Name: "A"
     * }];
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    public set filteredData(value) {
        this._filteredData = value;
    }

    /**
     * Get transactions service for the grid.
     *
     * @experimental @hidden
     */
    public get transactions() {
        return this._transactions;
    }

    /**
     * An @Input property that sets the count of levels to be expanded in the `IgxTreeGridComponent`. By default it is
     * set to `Infinity` which means all levels would be expanded.
     * ```html
     * <igx-tree-grid #grid [data]="employeeData" [childDataKey]="'employees'" expansionDepth="1" [autoGenerate]="true"></igx-tree-grid>
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    @Input()
    public get expansionDepth(): number {
        return this._expansionDepth;
    }

    public set expansionDepth(value: number) {
        this._expansionDepth = value;
        this.notifyChanges();
    }

    /**
     * An @Input property that provides a template for the row loading indicator when load on demand is enabled.
     * ```html
     * <ng-template #rowLoadingTemplate>
     *     <igx-icon>loop</igx-icon>
     * </ng-template>
     *
     * <igx-tree-grid #grid [data]="employeeData" [primaryKey]="'ID'" [foreignKey]="'parentID'"
     *                [loadChildrenOnDemand]="loadChildren"
     *                [rowLoadingIndicatorTemplate]="rowLoadingTemplate">
     * </igx-tree-grid>
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    @Input()
    public get rowLoadingIndicatorTemplate(): TemplateRef<any> {
        return this._rowLoadingIndicatorTemplate;
    }

    public set rowLoadingIndicatorTemplate(value: TemplateRef<any>) {
        this._rowLoadingIndicatorTemplate = value;
        this.notifyChanges();
    }

    // Kind of stupid
    private get _gridAPI(): IgxTreeGridAPIService {
        return this.gridAPI as IgxTreeGridAPIService;
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        super.ngOnInit();

        this.rowToggle.pipe(takeUntil(this.destroy$)).subscribe((args) => {
            this.loadChildrenOnRowExpansion(args);
        });

        this.rowAddedNotifier.pipe(takeUntil(this.destroy$)).subscribe(args => {
            if (this.rowSelection === GridSelectionMode.multipleCascade) {
                let rec = this._gridAPI.get_rec_by_id(this.primaryKey ? args.data[this.primaryKey] : args.data);
                if (rec && rec.parent) {
                    this.gridAPI.grid.selectionService.updateCascadeSelectionOnFilterAndCRUD(
                        new Set([rec.parent]), rec.parent.rowID);
                } else {
                    // The record is still not available
                    // Wait for the change detection to update records through pipes
                    requestAnimationFrame(() => {
                        rec = this._gridAPI.get_rec_by_id(this.primaryKey ?
                            args.data[this.primaryKey] : args.data);
                        if (rec && rec.parent) {
                            this.gridAPI.grid.selectionService.updateCascadeSelectionOnFilterAndCRUD(
                                new Set([rec.parent]), rec.parent.rowID);
                        }
                        this.notifyChanges();
                    });
                }
            }
        });

        this.rowDeletedNotifier.pipe(takeUntil(this.destroy$)).subscribe(args => {
            if (this.rowSelection === GridSelectionMode.multipleCascade) {
                if (args.data) {
                    const rec = this._gridAPI.get_rec_by_id(
                        this.primaryKey ? args.data[this.primaryKey] : args.data);
                    this.handleCascadeSelection(args, rec);
                } else {
                    // if a row has been added and before commiting the transaction deleted
                    const leafRowsDirectParents = new Set<any>();
                    this.records.forEach(record => {
                        if (record && !record.children && record.parent) {
                            leafRowsDirectParents.add(record.parent);
                        }
                    });
                    // Wait for the change detection to update records through pipes
                    requestAnimationFrame(() => {
                        this.gridAPI.grid.selectionService.updateCascadeSelectionOnFilterAndCRUD(leafRowsDirectParents);
                        this.notifyChanges();
                    });
                }
            }
        });

        this.filteringDone.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (this.rowSelection === GridSelectionMode.multipleCascade) {
                const leafRowsDirectParents = new Set<any>();
                this.records.forEach(record => {
                    if (record && !record.children && record.parent) {
                        leafRowsDirectParents.add(record.parent);
                    }
                });
                this.gridAPI.grid.selectionService.updateCascadeSelectionOnFilterAndCRUD(leafRowsDirectParents);
                this.notifyChanges();
            }
        });

        this.transactions.onStateUpdate.pipe(takeUntil<any>(this.destroy$)).subscribe((event: StateUpdateEvent) => {
            let actions = [];
            if (event.origin === TransactionEventOrigin.REDO) {
                actions = event.actions ? event.actions.filter(x => x.transaction.type === TransactionType.DELETE) : [];
                if (this.rowSelection === GridSelectionMode.multipleCascade) {
                    this.handleCascadeSelection(event);
                }
            } else if (event.origin === TransactionEventOrigin.UNDO) {
                actions = event.actions ? event.actions.filter(x => x.transaction.type === TransactionType.ADD) : [];
                if (this.rowSelection === GridSelectionMode.multipleCascade) {
                    if (event.actions[0].transaction.type === 'add') {
                        const rec = this._gridAPI.get_rec_by_id(event.actions[0].transaction.id);
                        this.handleCascadeSelection(event, rec);
                    } else {
                        this.handleCascadeSelection(event);
                    }
                }
            }
            if (actions.length) {
                for (const action of actions) {
                    this.deselectChildren(action.transaction.id);
                }
            }
        });
    }

    public ngDoCheck() {
        super.ngDoCheck();
    }

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        super.ngAfterViewInit();
        // TODO: pipesExectured event
        // run after change detection in super triggers pipes for records structure
        if (this.rowSelection === GridSelectionMode.multipleCascade && this.selectedRows.length) {
            const selRows = this.selectedRows;
            this.selectionService.clearRowSelection();
            this.selectRows(selRows, true);
            this.cdr.detectChanges();
        }
    }

    /**
     * @hidden
     */
    public ngAfterContentInit() {
        if (this.rowLoadingTemplate) {
            this._rowLoadingIndicatorTemplate = this.rowLoadingTemplate.template;
        }
        super.ngAfterContentInit();
    }

    public getDefaultExpandState(record: ITreeGridRecord) {
        return record.children && record.children.length && record.level < this.expansionDepth;
    }

    /**
     * Expands all rows.
     * ```typescript
     * this.grid.expandAll();
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    public expandAll() {
        this._expansionDepth = Infinity;
        this.expansionStates = new Map<any, boolean>();
    }

    /**
     * Collapses all rows.
     *
     * ```typescript
     * this.grid.collapseAll();
     *  ```
     *
     * @memberof IgxTreeGridComponent
     */
    public collapseAll() {
        this._expansionDepth = 0;
        this.expansionStates = new Map<any, boolean>();
    }

    /**
     * @hidden
     */
    public refreshGridState(args?: IRowDataEventArgs) {
        super.refreshGridState();
        if (this.primaryKey && this.foreignKey && args) {
            const rowID = args.data[this.foreignKey];
            this.summaryService.clearSummaryCache({ rowID });
            this.pipeTrigger++;
            this.cdr.detectChanges();
        }
    }


    /**
     * Creates a new `IgxTreeGridRowComponent` with the given data. If a parentRowID is not specified, the newly created
     * row would be added at the root level. Otherwise, it would be added as a child of the row whose primaryKey matches
     * the specified parentRowID. If the parentRowID does not exist, an error would be thrown.
     * ```typescript
     * const record = {
     *     ID: this.grid.data[this.grid1.data.length - 1].ID + 1,
     *     Name: this.newRecord
     * };
     * this.grid.addRow(record, 1); // Adds a new child row to the row with ID=1.
     * ```
     *
     * @param data
     * @param parentRowID
     * @memberof IgxTreeGridComponent
     */
    // TODO: remove evt emission
    public addRow(data: any, parentRowID?: any) {
        this.crudService.endEdit(true);
        this.gridAPI.addRowToData(data, parentRowID);

        this.rowAddedNotifier.next({ data });
        this.pipeTrigger++;
        this.notifyChanges();
    }

    /**
     * @hidden
     */
    public getContext(rowData: any, rowIndex: number, pinned?: boolean): any {
        return {
            $implicit: this.isGhostRecord(rowData) || this.isAddRowRecord(rowData) ? rowData.recordRef : rowData,
            index: this.getDataViewIndex(rowIndex, pinned),
            templateID: this.isSummaryRow(rowData) ? 'summaryRow' : 'dataRow',
            disabled: this.isGhostRecord(rowData) ? rowData.recordRef.isFilteredOutParent === undefined : false,
            addRow: this.isAddRowRecord(rowData) ? rowData.addRow : false
        };
    }

    /**
     * @hidden
     * @internal
     */
    public getInitialPinnedIndex(rec) {
        const id = this.gridAPI.get_row_id(rec);
        return this._pinnedRecordIDs.indexOf(id);
    }

    /**
     * @hidden
     * @internal
     */
    public isRecordPinned(rec) {
        return this.getInitialPinnedIndex(rec.data) !== -1;
    }

    /**
     * @inheritdoc
     */
    public getSelectedData(formatters = false, headers = false): any[] {
        let source = [];

        const process = (record) => {
            if (record.summaries) {
                source.push(null);
                return;
            }
            source.push(record.data);
        };

        this.unpinnedDataView.forEach(process);
        source = this.isRowPinningToTop ? [...this.pinnedDataView, ...source] : [...source, ...this.pinnedDataView];
        return this.extractDataFromSelection(source, formatters, headers);
    }

    public getEmptyRecordObjectFor(rec) {
        const row = { ...rec };
        const data = rec || {};
        row.data = { ...data };
        Object.keys(row.data).forEach(key => {
            // persist foreign key if one is set.
            if (this.foreignKey && key === this.foreignKey) {
                row.data[key] = rec.data[key];
            } else {
                row.data[key] = undefined;
            }
        });
        let id = this.generateRowID();
        const rootRecPK = this.foreignKey && this.rootRecords && this.rootRecords.length > 0 ?
            this.rootRecords[0].data[this.foreignKey] : null;
        if (id === rootRecPK) {
            // safeguard in case generated id matches the root foreign key.
            id = this.generateRowID();
        }
        row.rowID = id;
        row.data[this.primaryKey] = id;
        return row;
    }

    /** @hidden */
    public deleteRowById(rowId: any): any {
        //  if this is flat self-referencing data, and CascadeOnDelete is set to true
        //  and if we have transactions we should start pending transaction. This allows
        //  us in case of delete action to delete all child rows as single undo action
        return this._gridAPI.deleteRowById(rowId);

    }

    /**
     * Returns the `IgxTreeGridRow` by index.
     *
     * @example
     * ```typescript
     * const myRow = treeGrid.getRowByIndex(1);
     * ```
     * @param index
     */
    public getRowByIndex(index: number): RowType {
        if (index < 0 || index >= this.dataView.length) {
            return undefined;
        }
        return this.createRow(index);
    }

    /**
     * Returns the `RowType` object by the specified primary key.
     *
     * @example
     * ```typescript
     * const myRow = this.treeGrid.getRowByIndex(1);
     * ```
     * @param index
     */
    public getRowByKey(key: any): RowType {
        const rec = this.filteredSortedData ? this.primaryKey ? this.filteredSortedData.find(r => r[this.primaryKey] === key) :
            this.filteredSortedData.find(r => r === key) : undefined;
        const index = this.dataView.findIndex(r => r.data && r.data === rec);
        if (index < 0 || index >= this.filteredSortedData.length) {
            return undefined;
        }
        return new IgxTreeGridRow(this, index, rec);
    }

    public pinRow(rowID: any, index?: number): boolean {
        const row = this.getRowByKey(rowID);
        return super.pinRow(rowID, index, row);
    }

    public unpinRow(rowID: any): boolean {
        const row = this.getRowByKey(rowID);
        return super.unpinRow(rowID, row);
    }

    /** @hidden */
    public generateRowPath(rowId: any): any[] {
        const path: any[] = [];
        let record = this.records.get(rowId);

        while (record.parent) {
            path.push(record.parent.rowID);
            record = record.parent;
        }

        return path.reverse();
    }

    /** @hidden */
    public isTreeRow(record: any): boolean {
        return record.rowID !== undefined && record.data;
    }

    /**
     * Returns if the `IgxTreeGridComponent` has groupable columns.
     *
     * @example
     * ```typescript
     * const groupableGrid = this.grid.hasGroupableColumns;
     * ```
     */
    public get hasGroupableColumns(): boolean {
        return this.columnList.some((col) => col.groupable && !col.columnGroup);
    }

    protected findRecordIndexInView(rec) {
        return this.dataView.findIndex(x => x.data[this.primaryKey] === rec[this.primaryKey]);
    }

    protected getUnpinnedIndexById(id) {
        return this.unpinnedRecords.findIndex(x => x.data[this.primaryKey] === id);
    }

    /**
     * @hidden @internal
     */
    protected getDataBasedBodyHeight(): number {
        return !this.flatData || (this.flatData.length < this._defaultTargetRecordNumber) ?
            0 : this.defaultTargetBodyHeight;
    }

    /**
     * @hidden
     */
    protected scrollTo(row: any | number, column: any | number): void {
        let delayScrolling = false;
        let record: ITreeGridRecord;

        if (typeof (row) !== 'number') {
            const rowData = row;
            const rowID = this._gridAPI.get_row_id(rowData);
            record = this.processedRecords.get(rowID);
            this._gridAPI.expand_path_to_record(record);

            if (this.paginator) {
                const rowIndex = this.processedExpandedFlatData.indexOf(rowData);
                const page = Math.floor(rowIndex / this.paginator.perPage);

                if (this.paginator.page !== page) {
                    delayScrolling = true;
                    this.paginator.page = page;
                }
            }
        }

        if (delayScrolling) {
            this.verticalScrollContainer.dataChanged.pipe(first()).subscribe(() => {
                this.scrollDirective(this.verticalScrollContainer,
                    typeof (row) === 'number' ? row : this.unpinnedDataView.indexOf(record));
            });
        } else {
            this.scrollDirective(this.verticalScrollContainer,
                typeof (row) === 'number' ? row : this.unpinnedDataView.indexOf(record));
        }

        this.scrollToHorizontally(column);
    }

    protected writeToData(rowIndex: number, value: any) {
        mergeObjects(this.flatData[rowIndex], value);
    }

    /**
     * @hidden
     */
    protected initColumns(collection: QueryList<IgxColumnComponent>, cb: (args: any) => void = null) {
        if (this.hasColumnLayouts) {
            // invalid configuration - tree grid should not allow column layouts
            // remove column layouts
            const nonColumnLayoutColumns = this.columnList.filter((col) => !col.columnLayout && !col.columnLayoutChild);
            this.columnList.reset(nonColumnLayoutColumns);
        }
        super.initColumns(collection, cb);
    }

    /**
     * @hidden
     */
    protected createRow(index: number): RowType {
        let row: RowType;
        const rec: any = this.dataView[index];

        if (this.isSummaryRecord(rec)) {
            row = new IgxSummaryRow(this, index, rec.summaries);
        }

        if (!row && rec) {
            const isTreeRow = this.isTreeRow(rec);
            const data = isTreeRow ? rec.data : rec;
            const treeRow = isTreeRow ? rec : undefined;
            row = new IgxTreeGridRow(this, index, data, treeRow);
        }

        return row;
    }

    /**
     * @hidden @internal
     */
    protected getGroupAreaHeight(): number {
        return this.groupArea ? this.getComputedHeight(this.groupArea.nativeElement) : 0;
    }

    /**
     * @description A recursive way to deselect all selected children of a given record
     * @param recordID ID of the record whose children to deselect
     * @hidden
     * @internal
     */
    private deselectChildren(recordID): void {
        const selectedChildren = [];
        // G.E. Apr 28, 2021 #9465 Records which are not in view can also be selected so we need to
        // deselect them as well, hence using 'records' map instead of getRowByKey() method which will
        // return only row components (i.e. records in view).
        const rowToDeselect = this.records.get(recordID);
        this.selectionService.deselectRow(recordID);
        this._gridAPI.get_selected_children(rowToDeselect, selectedChildren);
        if (selectedChildren.length > 0) {
            selectedChildren.forEach(x => this.deselectChildren(x));
        }
    }

    private addChildRows(children: any[], parentID: any) {
        if (this.primaryKey && this.foreignKey) {
            for (const child of children) {
                child[this.foreignKey] = parentID;
            }
            this.data.push(...children);
        } else if (this.childDataKey) {
            let parent = this.records.get(parentID);
            let parentData = parent.data;

            if (this.transactions.enabled && this.transactions.getAggregatedChanges(true).length) {
                const path = [];
                while (parent) {
                    path.push(parent.rowID);
                    parent = parent.parent;
                }

                let collection = this.data;
                let record: any;
                for (let i = path.length - 1; i >= 0; i--) {
                    const pid = path[i];
                    record = collection.find(r => r[this.primaryKey] === pid);

                    if (!record) {
                        break;
                    }
                    collection = record[this.childDataKey];
                }
                if (record) {
                    parentData = record;
                }
            }

            parentData[this.childDataKey] = children;
        }
        this.selectionService.clearHeaderCBState();
        this.pipeTrigger++;
        if (this.rowSelection === GridSelectionMode.multipleCascade) {
            // Force pipe triggering for building the data structure
            this.cdr.detectChanges();
            if (this.selectionService.isRowSelected(parentID)) {
                this.selectionService.rowSelection.delete(parentID);
                this.selectionService.selectRowsWithNoEvent([parentID]);
            }
        }
    }

    private loadChildrenOnRowExpansion(args: IRowToggleEventArgs) {
        if (this.loadChildrenOnDemand) {
            const parentID = args.rowID;

            if (args.expanded && !this._expansionStates.has(parentID)) {
                this.loadingRows.add(parentID);

                this.loadChildrenOnDemand(parentID, children => {
                    this.loadingRows.delete(parentID);
                    this.addChildRows(children, parentID);
                    this.notifyChanges();
                });
            }
        }
    }

    private handleCascadeSelection(event: IRowDataEventArgs | StateUpdateEvent, rec: ITreeGridRecord = null) {
        // Wait for the change detection to update records through the pipes
        requestAnimationFrame(() => {
            if (rec === null) {
                rec = this._gridAPI.get_rec_by_id((event as StateUpdateEvent).actions[0].transaction.id);
            }
            if (rec && rec.parent) {
                this.gridAPI.grid.selectionService.updateCascadeSelectionOnFilterAndCRUD(
                    new Set([rec.parent]), rec.parent.rowID
                );
                this.notifyChanges();
            }
        });
    }
 }
