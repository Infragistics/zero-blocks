import { DOCUMENT, DatePipe, DecimalPipe, getLocaleNumberFormat, NumberFormatStyle, CurrencyPipe, PercentPipe } from '@angular/common';
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectorRef,
    ComponentFactoryResolver,
    ContentChildren,
    ContentChild,
    ElementRef,
    EventEmitter,
    HostBinding,
    Inject,
    Input,
    IterableChangeRecord,
    IterableDiffers,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef,
    InjectionToken,
    Optional,
    DoCheck,
    Directive,
    LOCALE_ID,
    HostListener
} from '@angular/core';
import { getResizeObserver } from '../core/utils';
import 'igniteui-trial-watermark';
import { Subject, pipe, fromEvent, noop } from 'rxjs';
import { takeUntil, first, filter, throttleTime, map, shareReplay } from 'rxjs/operators';
import { cloneArray, mergeObjects, compareMaps, resolveNestedPath, isObject, PlatformUtil } from '../core/utils';
import { GridColumnDataType } from '../data-operations/data-util';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { IGroupByRecord } from '../data-operations/groupby-record.interface';
import { ISortingExpression, SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxGridForOfDirective } from '../directives/for-of/for_of.directive';
import { IgxTextHighlightDirective } from '../directives/text-highlight/text-highlight.directive';
import {
    AbsoluteScrollStrategy,
    HorizontalAlignment,
    VerticalAlignment,
    IgxOverlayService,
    OverlaySettings,
    PositionSettings,
    ConnectedPositioningStrategy,
    ContainerPositionStrategy,
    StateUpdateEvent,
    TransactionEventOrigin
} from '../services/public_api';
import { GridBaseAPIService } from './api.service';
import { IgxGridCellComponent } from './cell.component';
import { ISummaryExpression } from './summaries/grid-summary';
import { RowEditPositionStrategy, IPinningConfig } from './grid.common';
import { IgxGridToolbarComponent } from './toolbar/grid-toolbar.component';
import { IgxRowDirective } from './row.directive';
import { IgxOverlayOutletDirective, IgxToggleDirective } from '../directives/toggle/toggle.directive';
import {
    FilteringExpressionsTree, IFilteringExpressionsTree, FilteringExpressionsTreeType
} from '../data-operations/filtering-expressions-tree';
import { IFilteringOperation } from '../data-operations/filtering-condition';
import { Transaction, TransactionType, TransactionService, State } from '../services/public_api';
import {
    IgxRowAddTextDirective,
    IgxRowEditTemplateDirective,
    IgxRowEditTabStopDirective,
    IgxRowEditTextDirective,
    IgxRowEditActionsDirective
} from './grid.rowEdit.directive';
import { IgxGridNavigationService, IActiveNode } from './grid-navigation.service';
import { IDisplayDensityOptions, DisplayDensityToken, DisplayDensityBase, DisplayDensity } from '../core/displayDensity';
import { IgxFilteringService } from './filtering/grid-filtering.service';
import { IgxGridFilteringCellComponent } from './filtering/base/grid-filtering-cell.component';
import { WatchChanges } from './watch-changes';
import { IgxGridHeaderGroupComponent } from './headers/grid-header-group.component';
import { IGridResourceStrings } from '../core/i18n/grid-resources';
import { CurrentResourceStrings } from '../core/i18n/resources';
import { IgxGridSummaryService } from './summaries/grid-summary.service';
import { IgxSummaryRowComponent } from './summaries/summary-row.component';
import {
    IgxGridSelectionService,
    GridSelectionRange
} from './selection/selection.service';
import { IgxRow, IgxCell } from './common/crud.service';
import { ICachedViewLoadedEventArgs, IgxTemplateOutletDirective } from '../directives/template-outlet/template_outlet.directive';
import { IgxExcelStyleLoadingValuesTemplateDirective } from './filtering/excel-style/excel-style-search.component';
import { IgxGridColumnResizerComponent } from './resizing/resizer.component';
import { CharSeparatedValueData } from '../services/csv/char-separated-value-data';
import { IgxColumnResizingService } from './resizing/resizing.service';
import { IFilteringStrategy } from '../data-operations/filtering-strategy';
import {
    IgxRowExpandedIndicatorDirective, IgxRowCollapsedIndicatorDirective,
    IgxHeaderExpandIndicatorDirective, IgxHeaderCollapseIndicatorDirective, IgxExcelStyleHeaderIconDirective
} from './grid/grid.directives';
import {
    GridKeydownTargetType,
    GridSelectionMode,
    GridSummaryPosition,
    GridSummaryCalculationMode,
    FilterMode,
    ColumnPinningPosition,
    RowPinningPosition,
    GridPagingMode
} from './common/enums';
import {
    IGridCellEventArgs,
    IRowSelectionEventArgs,
    IPinColumnEventArgs,
    IGridEditEventArgs,
    IRowDataEventArgs,
    IColumnResizeEventArgs,
    IColumnMovingStartEventArgs,
    IColumnMovingEventArgs,
    IColumnMovingEndEventArgs,
    IGridKeydownEventArgs,
    IRowDragStartEventArgs,
    IRowDragEndEventArgs,
    IGridClipboardEvent,
    IGridToolbarExportEventArgs,
    ISearchInfo,
    ICellPosition,
    IRowToggleEventArgs,
    IColumnSelectionEventArgs,
    IPinRowEventArgs,
    IGridScrollEventArgs,
    IGridEditDoneEventArgs,
    IActiveNodeChangeEventArgs,
    ISortingEventArgs,
    IFilteringEventArgs,
    IColumnVisibilityChangedEventArgs,
    IColumnVisibilityChangingEventArgs,
    IPinColumnCancellableEventArgs
} from './common/events';
import { IgxAdvancedFilteringDialogComponent } from './filtering/advanced-filtering/advanced-filtering-dialog.component';
import { GridType } from './common/grid.interface';
import { DropPosition } from './moving/moving.service';
import { IgxHeadSelectorDirective, IgxRowSelectorDirective } from './selection/row-selectors';
import { IgxColumnComponent } from './columns/column.component';
import { IgxColumnGroupComponent } from './columns/column-group.component';
import { IGridSortingStrategy } from '../data-operations/sorting-strategy';
import { IgxRowDragGhostDirective, IgxDragIndicatorIconDirective } from './row-drag.directive';
import { IgxGridExcelStyleFilteringComponent } from './filtering/excel-style/grid.excel-style-filtering.component';
import { IgxSnackbarComponent } from '../snackbar/snackbar.component';
import { v4 as uuidv4 } from 'uuid';
import { IgxActionStripComponent } from '../action-strip/action-strip.component';
import { DeprecateProperty } from '../core/deprecateDecorators';
import { IgxGridHeaderRowComponent } from './headers/grid-header-row.component';
import { RowType } from './common/row.interface';
import { IgxGridRowComponent } from './grid/grid-row.component';
import { IPageEventArgs } from '../paginator/paginator_interfaces';
import { IgxGridGroupByAreaComponent } from './grouping/grid-group-by-area.component';

let FAKE_ROW_ID = -1;

const MINIMUM_COLUMN_WIDTH = 136;
const FILTER_ROW_HEIGHT = 50;
// By default row editing overlay outlet is inside grid body so that overlay is hidden below grid header when scrolling.
// In cases when grid has 1-2 rows there isn't enough space in grid body and row editing overlay should be shown above header.
// Default row editing overlay height is higher then row height that is why the case is valid also for row with 2 rows.
// More accurate calculation is not possible, cause row editing overlay is still not shown and we don't know its height,
// but in the same time we need to set row editing overlay outlet before opening the overlay itself.
const MIN_ROW_EDITING_COUNT_THRESHOLD = 2;

export const IgxGridTransaction = new InjectionToken<string>('IgxGridTransaction');

@Directive()
export abstract class IgxGridBaseDirective extends DisplayDensityBase implements GridType,
    OnInit, DoCheck, OnDestroy, AfterContentInit, AfterViewInit {
    /**
     * Gets/Sets the display time for the row adding snackbar notification.
     *
     * @remarks
     * By default it is 6000ms.
     */
    @Input()
    public snackbarDisplayTime = 6000;

    /**
     * Gets/Sets whether to autogenerate the columns.
     *
     * @remarks
     * The default value is false. When set to true, it will override all columns declared through code or in markup.
     * @example
     * ```html
     * <igx-grid [data]="Data" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public autoGenerate = false;

    /**
     * Gets/Sets a custom template when empty.
     *
     * @example
     * ```html
     * <igx-grid [id]="'igx-grid-1'" [data]="Data" [emptyGridTemplate]="myTemplate" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public emptyGridTemplate: TemplateRef<any>;

    /**
     * Gets/Sets a custom template for adding row UI when grid is empty.
     *
     * @example
     * ```html
     * <igx-grid [id]="'igx-grid-1'" [data]="Data" [addRowEmptyTemplate]="myTemplate" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public addRowEmptyTemplate: TemplateRef<any>;

    /**
     * Gets/Sets a custom template when loading.
     *
     * @example
     * ```html
     * <igx-grid [id]="'igx-grid-1'" [data]="Data" [loadingGridTemplate]="myTemplate" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public loadingGridTemplate: TemplateRef<any>;

    /**
     * Controls the copy behavior of the grid.
     */
    @Input()
    public clipboardOptions = {
        /**
         * Enables/disables the copy behavior
         */
        enabled: true,
        /**
         * Include the columns headers in the clipboard output.
         */
        copyHeaders: true,
        /**
         * Apply the columns formatters (if any) on the data in the clipboard output.
         */
        copyFormatters: true,
        /**
         * The separator used for formatting the copy output. Defaults to `\t`.
         */
        separator: '\t'
    };

    /**
     * Emitted after filtering is performed.
     *
     * @remarks
     * Returns the filtering expressions tree of the column for which filtering was performed.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [height]="'305px'" [autoGenerate]="true"
     *              (filteringExpressionsTreeChange)="filteringExprTreeChange($event)"></igx-grid>
     * ```
     */
    @Output()
    public filteringExpressionsTreeChange = new EventEmitter<IFilteringExpressionsTree>();

    /**
     * Emitted after advanced filtering is performed.
     *
     * @remarks
     * Returns the advanced filtering expressions tree.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [height]="'305px'" [autoGenerate]="true"
     *           (advancedFilteringExpressionsTreeChange)="advancedFilteringExprTreeChange($event)"></igx-grid>
     * ```
     */
    @Output()
    public advancedFilteringExpressionsTreeChange = new EventEmitter<IFilteringExpressionsTree>();

    /**
     * Emitted when grid is scrolled horizontally/vertically.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [height]="'305px'" [autoGenerate]="true"
     *              (gridScroll)="onScroll($event)"></igx-grid>
     * ```
     */
    @Output()
    public gridScroll = new EventEmitter<IGridScrollEventArgs>();

    /**
     * Emitted after the current page is changed.
     *
     * @example
     * ```html
     * <igx-grid (pageChange)="onPageChange($event)"></igx-grid>
     * ```
     * ```typescript
     * public onPageChange(page: number) {
     *   this.currentPage = page;
     * }
     * ```
     */
    @Output()
    public pageChange = new EventEmitter<number>();

    /**
     * Emitted when `perPage` property value of the grid is changed.
     *
     * @example
     * ```html
     * <igx-grid #grid (perPageChange)="onPerPageChange($event)" [autoGenerate]="true"></igx-grid>
     * ```
     * ```typescript
     * public onPerPageChange(perPage: number) {
     *   this.perPage = perPage;
     * }
     * ```
     */
    @Output()
    public perPageChange = new EventEmitter<number>();

    /**
     * Gets/Sets a custom `ng-template` for the pagination UI of the grid.
     *
     * @example
     * ```html
     * <igx-grid #grid [paging]="true" [myTemplate]="myTemplate" [height]="'305px'"></igx-grid>
     * ```
     */
    @Input()
    public paginationTemplate: TemplateRef<any>;

    /**
     * @hidden
     * @internal
     */
    @Input()
    public class = '';

    /**
     * Gets/Sets the styling classes applied to all even `IgxGridRowComponent`s in the grid.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [evenRowCSS]="'igx-grid--my-even-class'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public evenRowCSS = 'igx-grid__tr--even';

    /**
     * Gets/Sets the styling classes applied to all odd `IgxGridRowComponent`s in the grid.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [evenRowCSS]="'igx-grid--my-odd-class'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public oddRowCSS = 'igx-grid__tr--odd';

    /**
     * Gets/Sets the primary key.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [showToolbar]="true" [primaryKey]="'ProductID'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @WatchChanges()
    @Input()
    public primaryKey;

    /**
     * Gets/Sets a unique values strategy used by the Excel Style Filtering
     *
     * @remarks
     * Provides a callback for loading unique column values on demand.
     * If this property is provided, the unique values it generates will be used by the Excel Style Filtering.
     * @example
     * ```html
     * <igx-grid [data]="localData" [filterMode]="'excelStyleFilter'" [uniqueColumnValuesStrategy]="columnValuesStrategy"></igx-grid>
     * ```
     */
    @Input()
    public uniqueColumnValuesStrategy: (column: IgxColumnComponent,
        filteringExpressionsTree: IFilteringExpressionsTree,
        done: (values: any[]) => void) => void;

    /**
     * @hidden @internal
     */
    @ContentChildren(IgxGridExcelStyleFilteringComponent, { read: IgxGridExcelStyleFilteringComponent, descendants: false })
    public excelStyleFilteringComponents: QueryList<IgxGridExcelStyleFilteringComponent>;

    public get headerGroups() {
        return this.theadRow.groups;
    }

    /**
     * Emitted when `IgxGridCellComponent` is clicked.
     *
     * @remarks
     * Returns the `IgxGridCellComponent`.
     * @example
     * ```html
     * <igx-grid #grid (cellClick)="cellClick($event)" [data]="localData" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public cellClick = new EventEmitter<IGridCellEventArgs>();

    /**
     * Emitted when `IgxGridCellComponent` is selected.
     *
     * @remarks
     *  Returns the `IgxGridCellComponent`.
     * @example
     * ```html
     * <igx-grid #grid (selected)="onCellSelect($event)" [data]="localData" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public selected = new EventEmitter<IGridCellEventArgs>();

    /**
     *  Emitted when `IgxGridRowComponent` is selected.
     *
     * @example
     * ```html
     * <igx-grid #grid (rowSelected)="onCellClickChange($event)" [data]="localData" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public rowSelected = new EventEmitter<IRowSelectionEventArgs>();

    /**
     *  Emitted when `IgxColumnComponent` is selected.
     *
     * @example
     * ```html
     * <igx-grid #grid (columnSelected)="columnSelected($event)" [data]="localData" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public columnSelected = new EventEmitter<IColumnSelectionEventArgs>();

    /**
     * Emitted before `IgxColumnComponent` is pinned.
     *
     * @remarks
     * The index at which to insert the column may be changed through the `insertAtIndex` property.
     * @example
     * ```typescript
     * public columnPinning(event) {
     *     if (event.column.field === "Name") {
     *       event.insertAtIndex = 0;
     *     }
     * }
     * ```
     */
    @Output()
    public columnPin = new EventEmitter<IPinColumnCancellableEventArgs>();

    /**
     * Emitted after `IgxColumnComponent` is pinned.
     *
     * @remarks
     * The index that the column is inserted at may be changed through the `insertAtIndex` property.
     * @example
     * ```typescript
     * public columnPinning(event) {
     *     if (event.column.field === "Name") {
     *       event.insertAtIndex = 0;
     *     }
     * }
     * ```
     */
    @Output()
    public columnPinned = new EventEmitter<IPinColumnEventArgs>();

    /**
     * Emitted when cell enters edit mode.
     *
     * @remarks
     * This event is cancelable.
     * @example
     * ```html
     * <igx-grid #grid3 (cellEditEnter)="editStart($event)" [data]="data" [primaryKey]="'ProductID'">
     * </igx-grid>
     * ```
     */
    @Output()
    public cellEditEnter = new EventEmitter<IGridEditEventArgs>();

    /**
     * Emitted when cell exits edit mode.
     *
     * @example
     * ```html
     * <igx-grid #grid3 (cellEditExit)="editExit($event)" [data]="data" [primaryKey]="'ProductID'">
     * </igx-grid>
     * ```
     */
    @Output()
    public cellEditExit = new EventEmitter<IGridEditDoneEventArgs>();

    /**
     * Emitted when cell has been edited.
     *
     * @remarks
     * Event is fired after editing is completed, when the cell is exiting edit mode.
     * This event is cancelable.
     * @example
     * ```html
     * <igx-grid #grid3 (cellEdit)="editDone($event)" [data]="data" [primaryKey]="'ProductID'">
     * </igx-grid>
     * ```
     */
    @Output()
    public cellEdit = new EventEmitter<IGridEditEventArgs>();

    /**
     * Emitted after cell has been edited and editing has been committed.
     *
     * @example
     * ```html
     * <igx-grid #grid3 (cellEditDone)="editDone($event)" [data]="data" [primaryKey]="'ProductID'">
     * </igx-grid>
     * ```
     */
    @Output()
    public cellEditDone = new EventEmitter<IGridEditDoneEventArgs>();

    /**
     * Emitted when a row enters edit mode.
     *
     * @remarks
     * Emitted when [rowEditable]="true".
     * This event is cancelable.
     * @example
     * ```html
     * <igx-grid #grid3 (rowEditEnter)="editStart($event)" [primaryKey]="'ProductID'" [rowEditable]="true">
     * </igx-grid>
     * ```
     */
    @Output()
    public rowEditEnter = new EventEmitter<IGridEditEventArgs>();

    /**
     * Emitted when exiting edit mode for a row.
     *
     * @remarks
     * Emitted when [rowEditable]="true" & `endEdit(true)` is called.
     * Emitted when changing rows during edit mode, selecting an un-editable cell in the edited row,
     * performing paging operation, column resizing, pinning, moving or hitting `Done`
     * button inside of the rowEditingOverlay, or hitting the `Enter` key while editing a cell.
     * This event is cancelable.
     * @example
     * ```html
     * <igx-grid #grid3 (rowEdit)="editDone($event)" [data]="data" [primaryKey]="'ProductID'" [rowEditable]="true">
     * </igx-grid>
     * ```
     */
    @Output()
    public rowEdit = new EventEmitter<IGridEditEventArgs>();

    /**
     * Emitted after exiting edit mode for a row and editing has been committed.
     *
     * @remarks
     * Emitted when [rowEditable]="true" & `endEdit(true)` is called.
     * Emitted when changing rows during edit mode, selecting an un-editable cell in the edited row,
     * performing paging operation, column resizing, pinning, moving or hitting `Done`
     * button inside of the rowEditingOverlay, or hitting the `Enter` key while editing a cell.
     * @example
     * ```html
     * <igx-grid #grid3 (rowEditDone)="editDone($event)" [data]="data" [primaryKey]="'ProductID'" [rowEditable]="true">
     * </igx-grid>
     * ```
     */
    @Output()
    public rowEditDone = new EventEmitter<IGridEditDoneEventArgs>();

    /**
     * Emitted when row editing is canceled.
     *
     * @remarks
     * Emits when [rowEditable]="true" & `endEdit(false)` is called.
     * Emitted when changing hitting `Esc` key during cell editing and when click on the `Cancel` button
     * in the row editing overlay.
     * @example
     * ```html
     * <igx-grid #grid3 (rowEditExit)="editExit($event)" [data]="data" [primaryKey]="'ProductID'" [rowEditable]="true">
     * </igx-grid>
     * ```
     */
    @Output()
    public rowEditExit = new EventEmitter<IGridEditDoneEventArgs>();

    /**
     * Emitted when a column is initialized.
     *
     * @remarks
     * Returns the column object.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" (columnInit)="initColumns($event)" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public columnInit = new EventEmitter<IgxColumnComponent>();

    /**
     * Emitted before sorting expressions are applied.
     *
     * @remarks
     * Returns an `ISortingEventArgs` object. `sortingExpressions` key holds the sorting expressions.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [autoGenerate]="true" (sorting)="sorting($event)"></igx-grid>
     * ```
     */
    @Output()
    public sorting = new EventEmitter<ISortingEventArgs>();

    /**
     * Emitted after sorting is completed.
     *
     * @remarks
     * Returns the sorting expression.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [autoGenerate]="true" (sortingDone)="sortingDone($event)"></igx-grid>
     * ```
     */
    @Output()
    public sortingDone = new EventEmitter<ISortingExpression | Array<ISortingExpression>>();

    /**
     * Emitted before filtering expressions are applied.
     *
     * @remarks
     * Returns an `IFilteringEventArgs` object. `filteringExpressions` key holds the filtering expressions for the column.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [height]="'305px'" [autoGenerate]="true" (filtering)="filtering($event)"></igx-grid>
     * ```
     */
    @Output()
    public filtering = new EventEmitter<IFilteringEventArgs>();

    /**
     * Emitted after filtering is performed through the UI.
     *
     * @remarks
     * Returns the filtering expressions tree of the column for which filtering was performed.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [height]="'305px'" [autoGenerate]="true" (filteringDone)="filteringDone($event)"></igx-grid>
     * ```
     */
    @Output()
    public filteringDone = new EventEmitter<IFilteringExpressionsTree>();

    /**
     * Emitted after paging is performed.
     *
     * @remarks
     * Returns an object consisting of the previous and next pages.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [height]="'305px'" [autoGenerate]="true" (pagingDone)="pagingDone($event)"></igx-grid>
     * ```
     */
    @Output()
    public pagingDone = new EventEmitter<IPageEventArgs>();

    /**
     * Emitted when a row is added.
     *
     * @remarks
     * Returns the data for the new `IgxGridRowComponent` object.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" (rowAdded)="rowAdded($event)" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public rowAdded = new EventEmitter<IRowDataEventArgs>();

    /**
     * Emitted when a row is deleted.
     *
     * @remarks
     * Returns an `IRowDataEventArgs` object.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" (rowDeleted)="rowDeleted($event)" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public rowDeleted = new EventEmitter<IRowDataEventArgs>();

    /**
     * Emitted after column is resized.
     *
     * @remarks
     * Returns the `IgxColumnComponent` object's old and new width.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" (columnResized)="resizing($event)" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public columnResized = new EventEmitter<IColumnResizeEventArgs>();

    /**
     * Emitted when a cell is right clicked.
     *
     * @remarks
     * Returns the `IgxGridCellComponent` object.
     * ```html
     * <igx-grid #grid [data]="localData" (contextMenu)="contextMenu($event)" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public contextMenu = new EventEmitter<IGridCellEventArgs>();

    /**
     * Emitted when a cell is double clicked.
     *
     * @remarks
     * Returns the `IgxGridCellComponent` object.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" (doubleClick)="dblClick($event)" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public doubleClick = new EventEmitter<IGridCellEventArgs>();

    /**
     * Emitted before column visibility is changed.
     *
     * @remarks
     * Args: { column: any, newValue: boolean }
     * @example
     * ```html
     * <igx-grid [columnHiding]="true" [showToolbar]="true" (columnVisibilityChanging)="visibilityChanging($event)"></igx-grid>
     * ```
     */
    @Output()
    public columnVisibilityChanging = new EventEmitter<IColumnVisibilityChangingEventArgs>();

    /**
     * Emitted after column visibility is changed.
     *
     * @remarks
     * Args: { column: IgxColumnComponent, newValue: boolean }
     * @example
     * ```html
     * <igx-grid [columnHiding]="true" [showToolbar]="true" (columnVisibilityChanged)="visibilityChanged($event)"></igx-grid>
     * ```
     */
    @Output()
    public columnVisibilityChanged = new EventEmitter<IColumnVisibilityChangedEventArgs>();

    /**
     * Emitted when column moving starts.
     *
     * @remarks
     * Returns the moved `IgxColumnComponent` object.
     * @example
     * ```html
     * <igx-grid [columnHiding]="true" [showToolbar]="true" (columnMovingStart)="movingStart($event)"></igx-grid>
     * ```
     */
    @Output()
    public columnMovingStart = new EventEmitter<IColumnMovingStartEventArgs>();

    /**
     * Emitted during the column moving operation.
     *
     * @remarks
     * Returns the source and target `IgxColumnComponent` objects. This event is cancelable.
     * @example
     * ```html
     * <igx-grid [columnHiding]="true" [showToolbar]="true" (columnMoving)="moving($event)"></igx-grid>
     * ```
     */
    @Output()
    public columnMoving = new EventEmitter<IColumnMovingEventArgs>();

    /**
     * Emitted when column moving ends.
     *
     * @remarks
     * Returns the source and target `IgxColumnComponent` objects.
     * @example
     * ```html
     * <igx-grid [columnHiding]="true" [showToolbar]="true" (columnMovingEnd)="movingEnds($event)"></igx-grid>
     * ```
     */
    @Output()
    public columnMovingEnd = new EventEmitter<IColumnMovingEndEventArgs>();

    /**
     * Emitted when keydown is triggered over element inside grid's body.
     *
     * @remarks
     * This event is fired only if the key combination is supported in the grid.
     * Return the target type, target object and the original event. This event is cancelable.
     * @example
     * ```html
     *  <igx-grid (gridKeydown)="customKeydown($event)"></igx-grid>
     * ```
     */
    @Output()
    public gridKeydown = new EventEmitter<IGridKeydownEventArgs>();

    /**
     * Emitted when start dragging a row.
     *
     * @remarks
     * Return the dragged row.
     */
    @Output()
    public rowDragStart = new EventEmitter<IRowDragStartEventArgs>();

    /**
     * Emitted when dropping a row.
     *
     * @remarks
     * Return the dropped row.
     */
    @Output()
    public rowDragEnd = new EventEmitter<IRowDragEndEventArgs>();

    /**
     * Emitted when a copy operation is executed.
     *
     * @remarks
     * Fired only if copy behavior is enabled through the [`clipboardOptions`]{@link IgxGridBaseDirective#clipboardOptions}.
     */
    @Output()
    public gridCopy = new EventEmitter<IGridClipboardEvent>();

    /**
     * @hidden @internal
     */
    @Output()
    public expansionStatesChange = new EventEmitter<Map<any, boolean>>();

    /**
     * Emitted when the expanded state of a row gets changed.
     *
     * @example
     * ```html
     * <igx-grid [data]="employeeData" (rowToggle)="rowToggle($event)" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public rowToggle = new EventEmitter<IRowToggleEventArgs>();

    /**
     * Emitted when the pinned state of a row is changed.
     *
     * @example
     * ```html
     * <igx-grid [data]="employeeData" (rowPinning)="rowPin($event)" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public rowPinning = new EventEmitter<IPinRowEventArgs>();

    /**
     * Emmited when the active node is changed.
     *
     * @example
     * ```
     * <igx-grid [data]="data" [autoGenerate]="true" (activeNodeChange)="activeNodeChange($event)"></igx-grid>
     * ```
     */
    @Output()
    public activeNodeChange = new EventEmitter<IActiveNodeChangeEventArgs>();

    /**
     * Emitted before sorting is performed.
     *
     * @remarks
     * Returns the sorting expressions.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [autoGenerate]="true" (sortingExpressionsChange)="sortingExprChange($event)"></igx-grid>
     * ```
     */
    @Output()
    public sortingExpressionsChange = new EventEmitter<ISortingExpression[]>();


    /**
     * Emitted when an export process is initiated by the user.
     *
     * @example
     * ```typescript
     * toolbarExporting(event: IGridToolbarExportEventArgs){
     *     const toolbarExporting = event;
     * }
     * ```
     */
    @Output()
    public toolbarExporting = new EventEmitter<IGridToolbarExportEventArgs>();

    /* End of toolbar related definitions */

    /**
     * Emitted when making a range selection.
     *
     * @remarks
     * Range selection can be made either through drag selection or through keyboard selection.
     */
    @Output()
    public rangeSelected = new EventEmitter<GridSelectionRange>();

    /** Emitted after the ngAfterViewInit hook. At this point the grid exists in the DOM */
    @Output()
    public rendered = new EventEmitter<boolean>();

    /**
     * @hidden @internal
     */
    @Output()
    public localeChange = new EventEmitter<boolean>();

    /**
     * @hidden @internal
     */
    @ViewChild(IgxSnackbarComponent)
    public addRowSnackbar: IgxSnackbarComponent;

    /**
     * @hidden @internal
     */
    @ViewChild(IgxGridColumnResizerComponent)
    public resizeLine: IgxGridColumnResizerComponent;

    /**
     * @hidden @internal
     */
    @ViewChild('loadingOverlay', { read: IgxToggleDirective, static: true })
    public loadingOverlay: IgxToggleDirective;

    /**
     * @hidden @internal
     */
    @ViewChild('igxLoadingOverlayOutlet', { read: IgxOverlayOutletDirective, static: true })
    public loadingOutlet: IgxOverlayOutletDirective;

    /**
     * @hidden @internal
     */
    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent, descendants: true })
    public columnList: QueryList<IgxColumnComponent> = new QueryList<IgxColumnComponent>();

    @ContentChild(IgxActionStripComponent)
    public actionStrip: IgxActionStripComponent;

    /**
     * @hidden @internal
     */
    @ContentChild(IgxExcelStyleLoadingValuesTemplateDirective, { read: IgxExcelStyleLoadingValuesTemplateDirective, static: true })
    public excelStyleLoadingValuesTemplateDirective: IgxExcelStyleLoadingValuesTemplateDirective;

    /**
     * A template reference for the template when the filtered grid is empty.
     *
     * @example
     * ```
     * const emptyTempalte = this.grid.emptyGridTemplate;
     * ```
     */
    @ViewChild('emptyFilteredGrid', { read: TemplateRef, static: true })
    public emptyFilteredGridTemplate: TemplateRef<any>;

    /**
     * A template reference for the template when the grid is empty.
     *
     * @example
     * ```
     * const emptyTempalte = this.grid.emptyGridTemplate;
     * ```
     */
    @ViewChild('defaultEmptyGrid', { read: TemplateRef, static: true })
    public emptyGridDefaultTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('defaultLoadingGrid', { read: TemplateRef, static: true })
    public loadingGridDefaultTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('scrollContainer', { read: IgxGridForOfDirective, static: true })
    public parentVirtDir: IgxGridForOfDirective<any>;

    /**
     * @hidden
     * @internal
     */
    @ContentChildren(IgxHeadSelectorDirective, { read: IgxHeadSelectorDirective, descendants: false })
    public headSelectorsTemplates: QueryList<IgxHeadSelectorDirective>;

    /**
     * @hidden
     * @internal
     */
    @ContentChildren(IgxRowSelectorDirective, { read: IgxRowSelectorDirective, descendants: false })
    public rowSelectorsTemplates: QueryList<IgxRowSelectorDirective>;

    /**
     * @hidden
     * @internal
     */
    @ContentChildren(IgxRowDragGhostDirective, { read: TemplateRef, descendants: false })
    public dragGhostCustomTemplates: QueryList<TemplateRef<any>>;

    /**
     * @hidden @internal
     */
    @ViewChild('verticalScrollContainer', { read: IgxGridForOfDirective, static: true })
    public verticalScrollContainer: IgxGridForOfDirective<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('verticalScrollHolder', { read: IgxGridForOfDirective, static: true })
    public verticalScroll: IgxGridForOfDirective<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('scr', { read: ElementRef, static: true })
    public scr: ElementRef;

    /** @hidden @internal */
    @ViewChild('headSelectorBaseTemplate', { read: TemplateRef, static: true })
    public headerSelectorBaseTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('footer', { read: ElementRef })
    public footer: ElementRef;

    public get headerContainer() {
        return this.theadRow.headerContainer;
    }

    public get headerSelectorContainer() {
        return this.theadRow.headerSelectorContainer;
    }

    public get headerDragContainer() {
        return this.theadRow.headerDragContainer;
    }

    public get headerGroupContainer() {
        return this.theadRow.headerGroupContainer;
    }

    public get filteringRow() {
        return this.theadRow.filterRow;
    }

    /** @hidden @internal */
    @ViewChild(IgxGridHeaderRowComponent, { static: true })
    public theadRow: IgxGridHeaderRowComponent;

    /** @hidden @internal */
    @ViewChild(IgxGridGroupByAreaComponent)
    public groupByArea: IgxGridGroupByAreaComponent;

    /**
     * @hidden @internal
     */
    @ViewChild('tbody', { static: true })
    public tbody: ElementRef;

    /**
     * @hidden @internal
     */
    @ViewChild('pinContainer', { read: ElementRef })
    public pinContainer: ElementRef;

    /**
     * @hidden @internal
     */
    @ViewChild('tfoot', { static: true })
    public tfoot: ElementRef;

    /**
     * @hidden @internal
     */
    @ViewChild('igxRowEditingOverlayOutlet', { read: IgxOverlayOutletDirective, static: true })
    public rowEditingOutletDirective: IgxOverlayOutletDirective;

    /**
     * @hidden @internal
     */
    @ViewChildren(IgxTemplateOutletDirective, { read: IgxTemplateOutletDirective })
    public tmpOutlets: QueryList<any> = new QueryList<any>();

    /**
     * @hidden
     * @internal
     */
    @ViewChild('dragIndicatorIconBase', { read: TemplateRef, static: true })
    public dragIndicatorIconBase: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ContentChild(IgxRowEditTemplateDirective, { read: TemplateRef })
    public rowEditCustom: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ContentChild(IgxRowEditTextDirective, { read: TemplateRef })
    public rowEditText: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ContentChild(IgxRowAddTextDirective, { read: TemplateRef })
    public rowAddText: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ContentChild(IgxRowEditActionsDirective, { read: TemplateRef })
    public rowEditActions: TemplateRef<any>;


    /**
     * The custom template, if any, that should be used when rendering a row expand indicator.
     */
    @ContentChild(IgxRowExpandedIndicatorDirective, { read: TemplateRef })
    public rowExpandedIndicatorTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering a row collapse indicator.
     */
    @ContentChild(IgxRowCollapsedIndicatorDirective, { read: TemplateRef })
    public rowCollapsedIndicatorTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering a header expand indicator.
     */
    @ContentChild(IgxHeaderExpandIndicatorDirective, { read: TemplateRef })
    public headerExpandIndicatorTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering a header collapse indicator.
     */
    @ContentChild(IgxHeaderCollapseIndicatorDirective, { read: TemplateRef })
    public headerCollapseIndicatorTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering a row expand indicator.
     */
    @ContentChild(IgxExcelStyleHeaderIconDirective, { read: TemplateRef })
    public excelStyleHeaderIconTemplate: TemplateRef<any> = null;

    /**
     * @hidden
     * @internal
     */
    @ContentChildren(IgxDragIndicatorIconDirective, { read: TemplateRef, descendants: false })
    public dragIndicatorIconTemplates: QueryList<TemplateRef<any>>;

    /**
     * @hidden @internal
     */
    @ViewChildren(IgxRowEditTabStopDirective)
    public rowEditTabsDEFAULT: QueryList<IgxRowEditTabStopDirective>;

    /**
     * @hidden @internal
     */
    @ContentChildren(IgxRowEditTabStopDirective, { descendants: true })
    public rowEditTabsCUSTOM: QueryList<IgxRowEditTabStopDirective>;

    /**
     * @hidden @internal
     */
    @ViewChild('rowEditingOverlay', { read: IgxToggleDirective })
    public rowEditingOverlay: IgxToggleDirective;

    /**
     * @hidden @internal
     */
    @HostBinding('attr.tabindex')
    public tabindex = 0;

    /**
     * @hidden @internal
     */
    @HostBinding('attr.role')
    public hostRole = 'grid';

    /** @hidden @internal */
    @ContentChildren(IgxGridToolbarComponent)
    public toolbar: QueryList<IgxGridToolbarComponent>;

    /**
     * @hidden @internal
     */
    @ViewChild('igxFilteringOverlayOutlet', { read: IgxOverlayOutletDirective, static: true })
    protected _outletDirective: IgxOverlayOutletDirective;

    /**
     * @hidden @internal
     */
    @ViewChild('defaultExpandedTemplate', { read: TemplateRef, static: true })
    protected defaultExpandedTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('defaultCollapsedTemplate', { read: TemplateRef, static: true })
    protected defaultCollapsedTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('defaultESFHeaderIcon', { read: TemplateRef, static: true })
    protected defaultESFHeaderIconTemplate: TemplateRef<any>;

    @ViewChildren('summaryRow', { read: IgxSummaryRowComponent })
    protected _summaryRowList: QueryList<IgxSummaryRowComponent>;

    @ViewChildren('row')
    private _rowList: QueryList<IgxGridRowComponent>;

    @ViewChildren('pinnedRow')
    private _pinnedRowList: QueryList<IgxGridRowComponent>;

    /**
     * @hidden @internal
     */
    @ViewChild('defaultRowEditTemplate', { read: TemplateRef, static: true })
    private defaultRowEditTemplate: TemplateRef<any>;

    @ViewChildren(IgxRowDirective, { read: IgxRowDirective })
    private _dataRowList: QueryList<IgxRowDirective<IgxGridBaseDirective>>;

    /**
     * Gets/Sets the resource strings.
     *
     * @remarks
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: IGridResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    public get resourceStrings(): IGridResourceStrings {
        if (!this._resourceStrings) {
            this._resourceStrings = CurrentResourceStrings.GridResStrings;
        }
        return this._resourceStrings;
    }

    /**
     * Gets/Sets the filtering logic of the `IgxGridComponent`.
     *
     * @remarks
     * The default is AND.
     * @example
     * ```html
     * <igx-grid [data]="Data" [autoGenerate]="true" [filteringLogic]="filtering"></igx-grid>
     * ```
     */
    @WatchChanges()
    @Input()
    public get filteringLogic() {
        return this._filteringExpressionsTree.operator;
    }

    public set filteringLogic(value: FilteringLogic) {
        this._filteringExpressionsTree.operator = value;
    }

    /**
     * Gets/Sets the filtering state.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [autoGenerate]="true" [(filteringExpressionsTree)]="model.filteringExpressions"></igx-grid>
     * ```
     * @remarks
     * Supports two-way binding.
     */
    @WatchChanges()
    @Input()
    public get filteringExpressionsTree() {
        return this._filteringExpressionsTree;
    }

    public set filteringExpressionsTree(value) {
        if (value && value instanceof FilteringExpressionsTree) {
            const val = (value as FilteringExpressionsTree);
            for (let index = 0; index < val.filteringOperands.length; index++) {
                if (!(val.filteringOperands[index] instanceof FilteringExpressionsTree)) {
                    const newExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, val.filteringOperands[index].fieldName);
                    newExpressionsTree.filteringOperands.push(val.filteringOperands[index] as IFilteringExpression);
                    val.filteringOperands[index] = newExpressionsTree;
                }
            }

            value.type = FilteringExpressionsTreeType.Regular;
            this._filteringExpressionsTree = value;
            this.filteringPipeTrigger++;
            this.filteringExpressionsTreeChange.emit(this._filteringExpressionsTree);

            if (this.filteringService.isFilteringExpressionsTreeEmpty(this._filteringExpressionsTree) &&
                !this.advancedFilteringExpressionsTree) {
                this.filteredData = null;
            }

            this.filteringService.refreshExpressions();
            this.selectionService.clearHeaderCBState();
            this.summaryService.clearSummaryCache();
            this.notifyChanges();
        }
    }

    /**
     * Gets/Sets the advanced filtering state.
     *
     * @example
     * ```typescript
     * let advancedFilteringExpressionsTree = this.grid.advancedFilteringExpressionsTree;
     * this.grid.advancedFilteringExpressionsTree = logic;
     * ```
     */
    @WatchChanges()
    @Input()
    public get advancedFilteringExpressionsTree() {
        return this._advancedFilteringExpressionsTree;
    }

    public set advancedFilteringExpressionsTree(value) {
        if (value && value instanceof FilteringExpressionsTree) {
            value.type = FilteringExpressionsTreeType.Advanced;
            this._advancedFilteringExpressionsTree = value;
            this.filteringPipeTrigger++;
        } else {
            this._advancedFilteringExpressionsTree = null;
        }
        this.advancedFilteringExpressionsTreeChange.emit(this._advancedFilteringExpressionsTree);

        if (this.filteringService.isFilteringExpressionsTreeEmpty(this._advancedFilteringExpressionsTree) &&
            !this.advancedFilteringExpressionsTree) {
            this.filteredData = null;
        }

        this.selectionService.clearHeaderCBState();
        this.summaryService.clearSummaryCache();
        this.notifyChanges();

        // Wait for the change detection to update filtered data through the pipes and then emit the event.
        requestAnimationFrame(() => this.filteringDone.emit(this._advancedFilteringExpressionsTree));
    }

    /**
     * Gets/Sets the locale.
     *
     * @remarks
     * If not set, returns browser's language.
     */
    @Input()
    public get locale(): string {
        return this._locale;
    }

    public set locale(value: string) {
        if (value !== this._locale) {
            this._locale = value;
            this._currencyPositionLeft = undefined;
            this.summaryService.clearSummaryCache();
            this.pipeTrigger++;
            this.notifyChanges();
            this.localeChange.next();
        }
    }

    @Input()
    public get pagingMode() {
        return this._pagingMode;
    }

    public set pagingMode(val: GridPagingMode) {
        this._pagingMode = val;
        this.pipeTrigger++;
        this.notifyChanges(true);
    }

    /**
     * Gets/Sets whether the paging feature is enabled.
     *
     * @remarks
     * The default state is disabled (false).
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [autoGenerate]="true" [paging]="true"></igx-grid>
     * ```
     */
    @Input()
    public get paging(): boolean {
        return this._paging;
    }

    public set paging(value: boolean) {
        this._paging = value;
        this.pipeTrigger++;
    }

    /**
     * Gets/Sets the current page index.
     *
     * @example
     * ```html
     *  <igx-grid #grid [data]="Data" [paging]="true" [(page)]="model.page" [autoGenerate]="true"></igx-grid>
     * ```
     * @remarks
     * Supports two-way binding.
     */
    @Input()
    public get page(): number {
        return this._page;
    }

    public set page(val: number) {
        if (val === this._page || val < 0 || val > this.totalPages - 1) {
            return;
        }
        this.selectionService.clear(true);
        this.pagingDone.emit({ previous: this._page, current: val });
        this._page = val;
        this.pageChange.emit(this._page);
        this.navigateTo(0);
        this.notifyChanges();
    }

    /**
     * Gets/Sets the number of visible items per page.
     *
     * @remarks
     * The default is 15.
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [paging]="true" [(perPage)]="model.perPage" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public get perPage(): number {
        return this._perPage;
    }

    public set perPage(val: number) {
        if (val < 0) {
            return;
        }
        this.selectionService.clear(true);
        this._perPage = val;
        this.perPageChange.emit(this._perPage);
        this.page = 0;
        this.crudService.endEdit(false);
        this.notifyChanges();
    }

    /**
     * Gets/Sets whether the column hiding UI is enabled.
     *
     * @deprecated
     *
     * @remarks
     * By default it is disabled (false). In order for the UI to work, you need to enable the toolbar as shown in the example below.
     * @example
     * ```html
     * <igx-grid [data]="Data" [autoGenerate]="true" [showToolbar]="true" [columnHiding]="true"></igx-grid>
     * ```
     */
    @DeprecateProperty('`columnHiding` is deprecated.')
    @Input()
    public get columnHiding() {
        return this._columnHiding;
    }

    public set columnHiding(value) {
        this._columnHiding = value;
        this.notifyChanges();
    }

    /**
     * Gets/Sets if the row selectors are hidden.
     *
     * @remarks
     *  By default row selectors are shown
     */
    @WatchChanges()
    @Input()
    public get hideRowSelectors() {
        return this._hideRowSelectors;
    }

    public set hideRowSelectors(value: boolean) {
        this._hideRowSelectors = value;
        this.notifyChanges(true);
    }

    /**
     * Gets/Sets whether rows can be moved.
     *
     * @example
     * ```html
     * <igx-grid #grid [rowDraggable]="true"></igx-grid>
     * ```
     */
    @Input()
    public get rowDraggable(): boolean {
        return this._rowDrag && this.hasVisibleColumns;
    }


    public set rowDraggable(val: boolean) {
        this._rowDrag = val;
        this.notifyChanges(true);
    }

    /**
     * @hidden
     * @internal
     */
    public rowDragging = false;

    /**
     * Gets the row ID that is being dragged.
     *
     * @remarks
     * The row ID is either the primaryKey value or the data record instance.
     */
    public dragRowID = null;

    /**
     * Gets/Sets whether the rows are editable.
     *
     * @remarks
     * By default it is set to false.
     * @example
     * ```html
     * <igx-grid #grid [showToolbar]="true" [rowEditable]="true" [primaryKey]="'ProductID'" [columnHiding]="true"></igx-grid>
     * ```
     */
    @WatchChanges()
    @Input()
    public get rowEditable(): boolean {
        return this._rowEditable;
    }

    public set rowEditable(val: boolean) {
        if (!this._init) {
            this.refreshGridState();
        }
        this._rowEditable = val;
        this.notifyChanges();
    }

    /**
     * Gets/Sets the height.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @WatchChanges()
    @HostBinding('style.height')
    @Input()
    public get height() {
        return this._height;
    }

    public set height(value: string) {
        if (this._height !== value) {
            this._height = value;
            this.nativeElement.style.height = value;
            this.notifyChanges(true);
        }
    }

    /**
     * @hidden @internal
     */
    @HostBinding('style.width')
    public get hostWidth() {
        return this._width || this._hostWidth;
    }

    /**
     * Gets/Sets the width of the grid.
     *
     * @example
     * ```typescript
     * let gridWidth = this.grid.width;
     * ```
     */
    @WatchChanges()
    @Input()
    public get width() {
        return this._width;
    }

    public set width(value) {
        if (this._width !== value) {
            this._width = value;
            this.nativeElement.style.width = value;
            this.notifyChanges(true);
        }
    }

    /**
     * Gets the width of the header.
     *
     * @example
     * ```html
     * let gridHeaderWidth = this.grid.headerWidth;
     * ```
     */
    public get headerWidth() {
        return parseInt(this.width, 10) - 17;
    }

    /**
     * Gets/Sets the row height.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [showToolbar]="true" [rowHeight]="100" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @WatchChanges()
    @Input()
    public get rowHeight() {
        return this._rowHeight ? this._rowHeight : this.defaultRowHeight;
    }

    public set rowHeight(value) {
        this._rowHeight = parseInt(value, 10);
    }

    /**
     * Gets/Sets the default width of the columns.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [showToolbar]="true" [columnWidth]="100" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @WatchChanges()
    @Input()
    public get columnWidth(): string {
        return this._columnWidth;
    }
    public set columnWidth(value: string) {
        this._columnWidth = value;
        this.columnWidthSetByUser = true;
        this.notifyChanges(true);
    }

    /**
     * Get/Sets the message displayed when there are no records.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [emptyGridMessage]="'The grid is empty'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public set emptyGridMessage(value: string) {
        this._emptyGridMessage = value;
    }
    public get emptyGridMessage(): string {
        return this._emptyGridMessage || this.resourceStrings.igx_grid_emptyGrid_message;
    }

    /**
     * Gets/Sets whether the grid is going to show a loading indicator.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [isLoading]="true" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @WatchChanges()
    @Input()
    public set isLoading(value: boolean) {
        if (this._isLoading !== value) {
            this._isLoading = value;
            if (!!this.data) {
                this.evaluateLoadingState();
            }
        }
        Promise.resolve().then(() => {
            // wait for the current detection cycle to end before triggering a new one.
            this.notifyChanges();
        });
    }

    public get isLoading(): boolean {
        return this._isLoading;
    }

    /**
     * Gets/Sets whether the columns should be auto-generated once again after the initialization of the grid
     *
     * @remarks
     * This will allow to bind the grid to remote data and having auto-generated columns at the same time.
     * Note that after generating the columns, this property would be disabled to avoid re-creating
     * columns each time a new data is assigned.
     * @example
     * ```typescript
     *  this.grid.shouldGenerate = true;
     * ```
     */
    public shouldGenerate: boolean;

    /**
     * Gets/Sets the message displayed when there are no records and the grid is filtered.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [emptyGridMessage]="'The grid is empty'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public set emptyFilteredGridMessage(value: string) {
        this._emptyFilteredGridMessage = value;
    }

    public get emptyFilteredGridMessage(): string {
        return this._emptyFilteredGridMessage || this.resourceStrings.igx_grid_emptyFilteredGrid_message;
    }

    /**
     * Gets/Sets the title to be displayed in the built-in column hiding UI.
     *
     * @deprecated
     *
     * @example
     * ```html
     * <igx-grid [showToolbar]="true" [columnHiding]="true" columnHidingTitle="Column Hiding"></igx-grid>
     * ```
     */
    @DeprecateProperty('`columnHidingTitle` is deprecated')
    @Input()
    public get columnHidingTitle(): string {
        return this._columnHidingTitle;
    }
    public set columnHidingTitle(v: string) {
        this._columnHidingTitle = v;
    }

    /** @hidden @internal */
    public get columnHidingTitleInternal(): string {
        return this._columnHidingTitle;
    }

    /**
     * Gets/Sets the initial pinning configuration.
     *
     * @remarks
     * Allows to apply pinning the columns to the start or the end.
     * Note that pinning to both sides at a time is not allowed.
     * @example
     * ```html
     * <igx-grid [pinning]="pinningConfig"></igx-grid>
     * ```
     */
    @Input()
    public get pinning() {
        return this._pinning;
    }
    public set pinning(value) {
        if (value !== this._pinning) {
            this.resetCaches();
        }
        this._pinning = value;
    }


    /**
     * Gets/Sets if the built-in column pinning UI should be shown in the toolbar.
     *
     * @deprecated
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [columnPinning]="'true" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @DeprecateProperty('`columnPinning` is deprecated')
    @Input()
    public get columnPinning() {
        return this._columnPinning;
    }
    public set columnPinning(value) {
        this._columnPinning = value;
        this.notifyChanges();
    }

    /**
     * Gets/Sets the title to be displayed in the UI of the column pinning.
     *
     * @deprecated
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [columnPinning]="'true" [columnPinningTitle]="'Column Hiding'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @DeprecateProperty('`columnPinningTitle` is deprecated')
    @Input()
    public get columnPinningTitle(): string {
        return this._columnPinningTitle;
    }
    public set columnPinningTitle(v: string) {
        this._columnPinningTitle = v;
    }

    /** @hidden @internal */
    public get columnPinningTitleInternal(): string {
        return this._columnPinningTitle;
    }

    /**
     * Gets/Sets if the filtering is enabled.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [allowFiltering]="true" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public get allowFiltering() {
        return this._allowFiltering;
    }

    public set allowFiltering(value) {
        if (this._allowFiltering !== value) {
            this._allowFiltering = value;
            this.filteringService.registerSVGIcons();

            if (!this._init) {
                this.calcGridHeadRow();
            }

            this.filteringService.isFilterRowVisible = false;
            this.filteringService.filteredColumn = null;

            this.notifyChanges(true);
        }
    }

    /**
     * Gets/Sets a value indicating whether the advanced filtering is enabled.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [allowAdvancedFiltering]="true" [showToolbar]="true" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public get allowAdvancedFiltering() {
        return this._allowAdvancedFiltering;
    }

    public set allowAdvancedFiltering(value) {
        if (this._allowAdvancedFiltering !== value) {
            this._allowAdvancedFiltering = value;
            this.filteringService.registerSVGIcons();

            if (!this._init) {
                this.notifyChanges(true);
            }
        }
    }

    /**
     * Gets/Sets the filter mode.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [filterMode]="'quickFilter'" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     * @remarks
     * By default it's set to FilterMode.quickFilter.
     */
    @Input()
    public get filterMode() {
        return this._filterMode;
    }

    public set filterMode(value: FilterMode) {
        this._filterMode = value;

        if (this.filteringService.isFilterRowVisible) {
            this.filteringRow.close();
        }
        this.notifyChanges(true);
    }

    /**
     * Gets/Sets the summary position.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" summaryPosition="top" [autoGenerate]="true"></igx-grid>
     * ```
     * @remarks
     * By default it is bottom.
     */
    @Input()
    public get summaryPosition() {
        return this._summaryPosition;
    }

    public set summaryPosition(value: GridSummaryPosition) {
        this._summaryPosition = value;
        this.notifyChanges();
    }

    /**
     * Gets/Sets the summary calculation mode.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" summaryCalculationMode="rootLevelOnly" [autoGenerate]="true"></igx-grid>
     * ```
     * @remarks
     * By default it is rootAndChildLevels which means the summaries are calculated for the root level and each child level.
     */
    @Input()
    public get summaryCalculationMode() {
        return this._summaryCalculationMode;
    }

    public set summaryCalculationMode(value: GridSummaryCalculationMode) {
        this._summaryCalculationMode = value;
        if (!this._init) {
            this.crudService.endEdit(false);
            this.summaryService.resetSummaryHeight();
            this.notifyChanges(true);
        }
    }

    /**
     * Controls whether the summary row is visible when groupBy/parent row is collapsed.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [showSummaryOnCollapse]="true" [autoGenerate]="true"></igx-grid>
     * ```
     * @remarks
     * By default showSummaryOnCollapse is set to 'false' which means that the summary row is not visible
     * when the groupBy/parent row is collapsed.
     */
    @Input()
    public get showSummaryOnCollapse() {
        return this._showSummaryOnCollapse;
    }

    public set showSummaryOnCollapse(value: boolean) {
        this._showSummaryOnCollapse = value;
        this.notifyChanges();
    }

    /**
     * Gets/Sets the filtering strategy of the grid.
     *
     * @example
     * ```html
     *  <igx-grid #grid [data]="localData" [filterStrategy]="filterStrategy"></igx-grid>
     * ```
     */
    @Input()
    public get filterStrategy(): IFilteringStrategy {
        return this._filteringStrategy;
    }

    public set filterStrategy(classRef: IFilteringStrategy) {
        this._filteringStrategy = classRef;
    }

    /**
     * Gets/Sets the sorting strategy of the grid.
     *
     * @example
     * ```html
     *  <igx-grid #grid [data]="localData" [sortStrategy]="sortStrategy"></igx-grid>
     * ```
     */
    @Input()
    public get sortStrategy(): IGridSortingStrategy {
        return this._sortingStrategy;
    }

    public set sortStrategy(value: IGridSortingStrategy) {
        this._sortingStrategy = value;
    }

    /**
     * Gets/Sets the current selection state.
     *
     * @remarks
     * Represents the selected rows' IDs (primary key or rowData)
     * @example
     * ```html
     * <igx-grid [data]="localData" primaryKey="ID" rowSelection="multiple" [selectedRows]="[0, 1, 2]"><igx-grid>
     * ```
     */
    @Input()
    public set selectedRows(rowIDs: any[]) {
        this.selectRows(rowIDs || [], true);
    }

    public get selectedRows(): any[] {
        return this.selectionService.getSelectedRows();
    }

    /**
     * @hidden @internal
     */
    public get excelStyleFilteringComponent() {
        return this.excelStyleFilteringComponents.first;
    }

    /**
     * A list of all `IgxGridHeaderGroupComponent`.
     *
     * @example
     * ```typescript
     * const headerGroupsList = this.grid.headerGroupsList;
     * ```
     */
    public get headerGroupsList(): IgxGridHeaderGroupComponent[] {
        return this.theadRow.groups;
    }

    /**
     * A list of all `IgxGridHeaderComponent`.
     *
     * @example
     * ```typescript
     * const headers = this.grid.headerCellList;
     * ```
     */
    public get headerCellList() {
        return this.headerGroupsList.map(headerGroup => headerGroup.header).filter(header => header);
    }

    /**
     * A list of all `IgxGridFilteringCellComponent`.
     *
     * @example
     * ```typescript
     * const filterCells = this.grid.filterCellList;
     * ```
     */
    public get filterCellList(): IgxGridFilteringCellComponent[] {
        return this.headerGroupsList.map(group => group.filter).filter(cell => cell);
    }

    /**
     * @hidden @internal
     */
    public get summariesRowList() {
        const res = new QueryList<any>();
        if (!this._summaryRowList) {
            return res;
        }
        const sumList = this._summaryRowList.filter((item) => item.element.nativeElement.parentElement !== null);
        res.reset(sumList);
        return res;
    }

    /**
     * A list of `IgxGridRowComponent`.
     *
     * @example
     * ```typescript
     * const rowList = this.grid.rowList;
     * ```
     */
    public get rowList() {
        const res = new QueryList<any>();
        if (!this._rowList) {
            return res;
        }
        const rList = this._rowList
            .filter((item) => item.element.nativeElement.parentElement !== null)
            .sort((a, b) => a.index - b.index);
        res.reset(rList);
        return res;
    }

    /**
     * A list of currently rendered `IgxGridRowComponent`'s.
     *
     * @example
     * ```typescript
     * const dataList = this.grid.dataRowList;
     * ```
     */
    public get dataRowList(): QueryList<IgxRowDirective<IgxGridBaseDirective>> {
        const res = new QueryList<IgxRowDirective<IgxGridBaseDirective>>();
        if (!this._dataRowList) {
            return res;
        }
        const rList = this._dataRowList.filter(item => item.element.nativeElement.parentElement !== null).sort((a, b) => a.index - b.index);
        res.reset(rList);
        return res;
    }

    /**
     * @hidden
     * @internal
     */
    public get headSelectorTemplate(): TemplateRef<IgxHeadSelectorDirective> {
        if (this.headSelectorsTemplates && this.headSelectorsTemplates.first) {
            return this.headSelectorsTemplates.first.templateRef;
        }

        return null;
    }

    /**
     * @hidden
     * @internal
     */
    public get isPinningToStart() {
        return this.pinning.columns !== ColumnPinningPosition.End;
    }

    /**
     * @hidden
     * @internal
     */
    public get isRowPinningToTop() {
        return this.pinning.rows !== RowPinningPosition.Bottom;
    }

    /**
     * @hidden
     * @internal
     */
    public get rowSelectorTemplate(): TemplateRef<IgxRowSelectorDirective> {
        if (this.rowSelectorsTemplates && this.rowSelectorsTemplates.first) {
            return this.rowSelectorsTemplates.first.templateRef;
        }

        return null;
    }


    /**
     * @hidden @internal
     */
    public get rowOutletDirective() {
        return this.rowEditingOutletDirective;
    }

    /**
     * @hidden @internal
     */
    public get parentRowOutletDirective() {
        return this.outlet;
    }

    /**
     * @hidden @internal
     */
    public get rowEditContainer(): TemplateRef<any> {
        return this.rowEditCustom ? this.rowEditCustom : this.defaultRowEditTemplate;
    }

    /**
     * The custom template, if any, that should be used when rendering the row drag indicator icon
     */
    public get dragIndicatorIconTemplate(): TemplateRef<any> {
        return this._customDragIndicatorIconTemplate || this.dragIndicatorIconTemplates.first;
    }

    public set dragIndicatorIconTemplate(val: TemplateRef<any>) {
        this._customDragIndicatorIconTemplate = val;
    }

    /**
     * @hidden @internal
     */
    public get firstEditableColumnIndex(): number {
        const index = this.visibleColumns.filter(col => col.editable)
            .map(c => c.visibleIndex).sort((a, b) => a - b);
        return index.length ? index[0] : null;
    }

    /**
     * @hidden @internal
     */
    public get lastEditableColumnIndex(): number {
        const index = this.visibleColumns.filter(col => col.editable)
            .map(c => c.visibleIndex).sort((a, b) => a > b ? -1 : 1);
        return index.length ? index[0] : null;
    }

    /**
     * @hidden @internal
     * TODO: Nav service logic doesn't handle 0 results from this querylist
     */
    public get rowEditTabs(): QueryList<IgxRowEditTabStopDirective> {
        return this.rowEditTabsCUSTOM.length ? this.rowEditTabsCUSTOM : this.rowEditTabsDEFAULT;
    }

    public get activeDescendant() {
        const activeElem = this.navigation.activeNode;

        if (!activeElem || !Object.keys(activeElem).length) {
            return this.id;
        }

        return activeElem.row < 0 ?
            `${this.id}_${activeElem.row}_${activeElem.mchCache.level}_${activeElem.column}` :
            `${this.id}_${activeElem.row}_${activeElem.column}`;
    }

    /**
     * @hidden @internal
     */
    @HostBinding('attr.class')
    public get hostClass(): string {
        const classes = [this.getComponentDensityClass('igx-grid')];
        // The custom classes should be at the end.
        classes.push(this.class);
        return classes.join(' ');
    }

    public get bannerClass(): string {
        const position = this.rowEditPositioningStrategy.isTop ? 'igx-banner__border-top' : 'igx-banner__border-bottom';
        return `${this.getComponentDensityClass('igx-banner')} ${position}`;
    }

    /**
     * Gets/Sets the sorting state.
     *
     * @remarks
     * Supports two-way data binding.
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [autoGenerate]="true" [(sortingExpressions)]="model.sortingExpressions"></igx-grid>
     * ```
     */
    @WatchChanges()
    @Input()
    public get sortingExpressions(): ISortingExpression[] {
        return this._sortingExpressions;
    }

    public set sortingExpressions(value: ISortingExpression[]) {
        this._sortingExpressions = cloneArray(value);
        this.sortingExpressionsChange.emit(this._sortingExpressions);
        this.notifyChanges();
    }

    /**
     * @hidden @internal
     */
    public get maxLevelHeaderDepth() {
        if (this._maxLevelHeaderDepth === null) {
            this._maxLevelHeaderDepth = this.hasColumnLayouts ?
                this.columnList.reduce((acc, col) => Math.max(acc, col.rowStart), 0) :
                this.columnList.reduce((acc, col) => Math.max(acc, col.level), 0);
        }
        return this._maxLevelHeaderDepth;
    }

    /**
     * Gets the number of hidden columns.
     *
     * @example
     * ```typescript
     * const hiddenCol = this.grid.hiddenColumnsCount;
     * ``
     */
    public get hiddenColumnsCount() {
        return this.columnList.filter((col) => col.columnGroup === false && col.hidden === true).length;
    }

    /**
     * Gets the number of pinned columns.
     */
    public get pinnedColumnsCount() {
        return this.pinnedColumns.filter(col => !col.columnLayout).length;
    }

    /**
     * Gets/Sets the text to be displayed inside the toggle button.
     *
     * @deprecated
     *
     * @remarks
     * Used for the built-in column hiding UI of the`IgxColumnComponent`.
     * @example
     * ```html
     * <igx-grid [columnHiding]="true" [showToolbar]="true" [hiddenColumnsText]="'Hidden Columns'"></igx-grid>
     * ```
     */
    // @DeprecateProperty('`hiddenColumnsText` is deprecated')
    @Input()
    public get hiddenColumnsText() {
        return this._hiddenColumnsText;
    }

    public set hiddenColumnsText(value) {
        this._hiddenColumnsText = value;
        this.notifyChanges();

    }

    /**
     * Gets/Sets the text to be displayed inside the toggle button.
     *
     * @deprecated
     *
     * @remarks
     * Used for the built-in column pinning UI of the`IgxColumnComponent`.
     * @example
     * ```html
     * <igx-grid [pinnedColumnsText]="'PinnedCols Text" [data]="data" [width]="'100%'" [height]="'500px'"></igx-grid>
     * ```
     */
    @DeprecateProperty('`pinnedColumnsText` is deprecated')
    @Input()
    public get pinnedColumnsText() {
        return this._pinnedColumnsText;
    }
    public set pinnedColumnsText(value) {
        this._pinnedColumnsText = value;
        this.notifyChanges();
    }

    /** @hidden @internal */
    public get pinnedColumnsTextInternal() {
        return this._pinnedColumnsText;
    }

    /**
     * Get transactions service for the grid.
     */
    public get transactions(): TransactionService<Transaction, State> {
        return this._transactions;
    }

    /**
     * @hidden @internal
     */
    public get currentRowState(): any {
        return this._currentRowState;
    }

    /**
     * @hidden @internal
     */
    public get currencyPositionLeft(): boolean {
        if (this._currencyPositionLeft !== undefined) {
            return this._currencyPositionLeft;
        }
        const format = getLocaleNumberFormat(this.locale, NumberFormatStyle.Currency);
        const formatParts = format.split(',');
        const i = formatParts.indexOf(formatParts.find(c => c.includes('¤')));
        return this._currencyPositionLeft = i < 1;
    }


    /**
     * Gets/Sets whether the toolbar is shown.
     *
     * @deprecated
     *
     * @example
     * ```html
     * <igx-grid [data]="localData" [showToolbar]="true" [autoGenerate]="true" ></igx-grid>
     * ```
     */
    @DeprecateProperty('`showToolbar` is deprecated')
    @Input()
    public get showToolbar(): boolean {
        return this._showToolbar;
    }
    public set showToolbar(newValue: boolean) {
        this._showToolbar = newValue;
    }

    /**
     * Gets/Sets the toolbar's title.
     *
     * @deprecated
     *
     * @example
     * ```html
     * <igx-grid [data]="localData" [showToolbar]="true" [autoGenerate]="true" [toolbarTitle]="'My Grid'"></igx-grid>
     * ```
     */
    @DeprecateProperty('`toolbarTitle` is deprecated')
    @Input()
    public get toolbarTitle(): string {
        return this._toolbarTitle;
    }

    public set toolbarTitle(newValue: string) {
        this._toolbarTitle = newValue;
        this.notifyChanges();
    }

    /**
     * Gets/Sets whether exporting to MS Excel is enabled or disabled.
     *
     * @deprecated
     *
     * @example
     * ```html
     * <igx-grid [data]="localData" [showToolbar]="true" [autoGenerate]="true" [exportExcel]="true"></igx-grid>
     * ```
     */
    @DeprecateProperty('`exportExcel` is deprecated')
    @Input()
    public get exportExcel(): boolean {
        return this.getExportExcel();
    }

    public set exportExcel(newValue: boolean) {
        this._exportExcel = newValue;
        this.notifyChanges();
    }

    /**
     * Gets/Sets whether the option for exporting to CSV is enabled or disabled.
     *
     * @deprecated
     *
     * ```html
     * <igx-grid [data]="localData" [showToolbar]="true" [autoGenerate]="true" [exportCsv]="true"></igx-grid>
     * ```
     */
    @DeprecateProperty('`exportCsv` is deprecated')
    @Input()
    public get exportCsv(): boolean {
        return this.getExportCsv();
    }
    public set exportCsv(newValue: boolean) {
        this._exportCsv = newValue;
        this.notifyChanges();
    }

    /**
     * Gets/Sets the textual content for the main export button.
     *
     * @deprecated
     *
     * @example
     * ```html
     * <igx-grid [data]="localData" [showToolbar]="true" [exportText]="'My Exporter'" [exportCsv]="true"></igx-grid>
     * ```
     */
    @DeprecateProperty('`exportText` is deprecated')
    @Input()
    public get exportText(): string {
        return this._exportText;
    }

    public set exportText(newValue: string) {
        this._exportText = newValue;
        this.notifyChanges();
    }

    /**
     * Gets/Sets the textual content for the MS Excel export button.
     *
     * @deprecated
     *
     * ```html
     * <igx-grid [exportExcelText]="'My Excel Exporter" [showToolbar]="true" [exportText]="'My Exporter'" [exportCsv]="true"></igx-grid>
     * ```
     */
    @DeprecateProperty('`exportExcelText` is deprecated')
    @Input()
    public get exportExcelText(): string {
        return this._exportExcelText;
    }
    public set exportExcelText(newValue: string) {
        this._exportExcelText = newValue;
        this.notifyChanges();
    }

    /**
     * Gets/Sets the textual content for the CSV export button.
     *
     * @deprecated
     *
     * @example
     * ```html
     * <igx-grid [exportCsvText]="'My Csv Exporter" [showToolbar]="true" [exportText]="'My Exporter'" [exportExcel]="true"></igx-grid>
     * ```
     */
    @DeprecateProperty('`exportCsvText` is deprecated')
    @Input()
    public get exportCsvText(): string {
        return this._exportCsvText;
    }
    public set exportCsvText(newValue: string) {
        this._exportCsvText = newValue;
        this.notifyChanges();
    }

    /**
     * Gets/Sets cell selection mode.
     *
     * @remarks
     * By default the cell selection mode is multiple
     * @param selectionMode: GridSelectionMode
     */
    @WatchChanges()
    @Input()
    public get cellSelection() {
        return this._cellSelectionMode;
    }

    public set cellSelection(selectionMode: GridSelectionMode) {
        this._cellSelectionMode = selectionMode;
        if (this.gridAPI.grid) {
            this.selectionService.clear(true);
            this.notifyChanges();
        }
    }

    /**
     * Gets/Sets row selection mode
     *
     * @remarks
     * By default the row selection mode is 'none'
     * Note that in IgxGrid and IgxHierarchicalGrid 'multipleCascade' behaves like 'multiple'
     */
    @WatchChanges()
    @Input()
    public get rowSelection() {
        return this._rowSelectionMode;
    }

    public set rowSelection(selectionMode: GridSelectionMode) {
        this._rowSelectionMode = selectionMode;
        if (!this._init) {
            this.selectionService.clearAllSelectedRows();
            this.notifyChanges(true);
        }
    }

    /**
     * Gets/Sets column selection mode
     *
     * @remarks
     * By default the row selection mode is none
     * @param selectionMode: GridSelectionMode
     */
    @WatchChanges()
    @Input()
    public get columnSelection() {
        return this._columnSelectionMode;
    }

    public set columnSelection(selectionMode: GridSelectionMode) {
        this._columnSelectionMode = selectionMode;
        if (this.gridAPI.grid) {
            this.selectionService.clearAllSelectedColumns();
            this.notifyChanges(true);
        }
    }

    /**
     * @hidden @internal
     */
    public rowEditMessage;

    /**
     * @hidden @internal
     */
    public snackbarActionText = this.resourceStrings.igx_grid_snackbar_addrow_actiontext;

    /**
     * @hidden @internal
     */
    public snackbarLabel = this.resourceStrings.igx_grid_snackbar_addrow_label;

    /**
     * @hidden @internal
     */
    public pagingState;
    /**
     * @hidden @internal
     */
    public calcWidth: number;
    /**
     * @hidden @internal
     */
    public calcHeight = 0;
    /**
     * @hidden @internal
     */
    public tfootHeight: number;
    /**
     * @hidden @internal
     */
    public summariesHeight: number;

    /**
     * @hidden @internal
     */
    public disableTransitions = false;

    /**
     * @hidden @internal
     */
    public lastSearchInfo: ISearchInfo = {
        searchText: '',
        caseSensitive: false,
        exactMatch: false,
        activeMatchIndex: 0,
        matchInfoCache: []
    };

    /**
     * @hidden @internal
     */
    public columnWidthSetByUser = false;

    /**
     * @hidden @internal
     */
    public pinnedRecords: any[];

    /**
     * @hidden @internal
     */
    public unpinnedRecords: any[];

    public rendered$ = this.rendered.asObservable().pipe(shareReplay(1));

    /** @hidden @internal */
    public resizeNotify = new Subject();

    /** @hidden @internal */
    public rowAddedNotifier = new Subject<IRowDataEventArgs>();

    /** @hidden @internal */
    public rowDeletedNotifier = new Subject<IRowDataEventArgs>();

    /** @hidden @internal */
    public pipeTriggerNotifier = new Subject();

    /**
     * @hidden @internal
     */
    public paginatorSettings: OverlaySettings = null;

    /**
     * @hidden
     */
    public _filteredUnpinnedData;
    public _destroyed = false;

    /**
     * @hidden @internal
     */
    public decimalPipe: DecimalPipe;
    /**
     * @hidden @internal
     */
    public datePipe: DatePipe;
    /**
     * @hidden @internal
     */
    public currencyPipe: CurrencyPipe;
    /**
     * @hidden @internal
     */
    public percentPipe: PercentPipe;
    /**
     * @hidden @internal
     */
    public _totalRecords = -1;
    /**
     * @hidden @internal
     */
    public columnsWithNoSetWidths = null;
    /**
     * @hidden @internal
     */
    public pipeTrigger = 0;
    /**
     * @hidden @internal
     */
    public filteringPipeTrigger = 0;
    /**
     * @hidden @internal
     */
    public summaryPipeTrigger = 0;

    public EMPTY_DATA = [];
    /**
     * @hidden
     */
    protected _perPage = 15;
    /**
     * @hidden
     */
    protected _page = 0;
    /**
     * @hidden
     */
    protected _paging = false;
    /**
     * @hidden
     */
    protected _pagingMode = GridPagingMode.Local;
    /**
     * @hidden
     */
    protected _hideRowSelectors = false;
    /**
     * @hidden
     */
    protected _rowDrag = false;
    /**
     * @hidden
     */
    protected _columns: IgxColumnComponent[] = [];
    /**
     * @hidden
     */
    protected _pinnedColumns: IgxColumnComponent[] = [];
    /**
     * @hidden
     */
    protected _unpinnedColumns: IgxColumnComponent[] = [];
    /**
     * @hidden
     */
    protected _filteringExpressionsTree: IFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
    /**
     * @hidden
     */
    protected _advancedFilteringExpressionsTree: IFilteringExpressionsTree;
    /**
     * @hidden
     */
    protected _sortingExpressions: Array<ISortingExpression> = [];
    /**
     * @hidden
     */
    protected _maxLevelHeaderDepth = null;
    /**
     * @hidden
     */
    protected _columnHiding = false;
    /**
     * @hidden
     */
    protected _columnPinning = false;

    protected _pinnedRecordIDs = [];

    /**
     * @hidden
     */
    protected destroy$ = new Subject<any>();

    protected _filteredSortedPinnedData: any[];
    protected _filteredSortedUnpinnedData: any[];
    protected _filteredPinnedData: any[];

    /**
     * @hidden
     */
    protected _hasVisibleColumns;
    protected _allowFiltering = false;
    protected _allowAdvancedFiltering = false;
    protected _filterMode: FilterMode = FilterMode.quickFilter;

    protected observer: ResizeObserver = new (getResizeObserver())(noop);

    protected _defaultTargetRecordNumber = 10;
    protected _expansionStates: Map<any, boolean> = new Map<any, boolean>();
    protected _defaultExpandState = false;
    protected _baseFontSize: number;
    protected _headerFeaturesWidth = NaN;
    protected _init = true;
    protected _cdrRequestRepaint = false;
    protected _userOutletDirective: IgxOverlayOutletDirective;

    /**
     * @hidden @internal
     */
    public get scrollSize() {
        return this.verticalScrollContainer.getScrollNativeSize();
    }

    private _columnPinningTitle: string;
    private _columnHidingTitle: string;

    /* Toolbar related definitions */
    private _showToolbar = false;
    private _exportExcel = false;
    private _exportCsv = false;
    private _toolbarTitle: string = null;
    private _exportText: string;
    private _exportExcelText: string;
    private _exportCsvText: string;
    private _rowEditable = false;
    private _currentRowState: any;
    private _filteredSortedData = null;

    private _customDragIndicatorIconTemplate: TemplateRef<any>;
    private _cdrRequests = false;
    private _resourceStrings;
    private _emptyGridMessage = null;
    private _emptyFilteredGridMessage = null;
    private _isLoading = false;
    private _locale: string;
    private overlayIDs = [];
    private _filteringStrategy: IFilteringStrategy;
    private _sortingStrategy: IGridSortingStrategy;
    private _pinning: IPinningConfig = { columns: ColumnPinningPosition.Start };

    private _hostWidth;
    private _advancedFilteringOverlayId: string;
    private _advancedFilteringPositionSettings: PositionSettings = {
        verticalDirection: VerticalAlignment.Middle,
        horizontalDirection: HorizontalAlignment.Center,
        horizontalStartPoint: HorizontalAlignment.Center,
        verticalStartPoint: VerticalAlignment.Middle
    };

    private _advancedFilteringOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: false,
        modal: false,
        positionStrategy: new ConnectedPositioningStrategy(this._advancedFilteringPositionSettings),
    };

    private columnListDiffer;
    private rowListDiffer;
    private _hiddenColumnsText = '';
    private _pinnedColumnsText = '';
    private _height = '100%';
    private _width = '100%';
    private _rowHeight;
    private _horizontalForOfs: Array<IgxGridForOfDirective<any>> = [];
    private _multiRowLayoutRowSize = 1;
    // Caches
    private _totalWidth = NaN;
    private _pinnedVisible = [];
    private _unpinnedVisible = [];
    private _pinnedWidth = NaN;
    private _unpinnedWidth = NaN;
    private _visibleColumns = [];
    private _columnGroups = false;
    private _autoGeneratedCols = [];

    private _columnWidth: string;

    private _summaryPosition: GridSummaryPosition = GridSummaryPosition.bottom;
    private _summaryCalculationMode: GridSummaryCalculationMode = GridSummaryCalculationMode.rootAndChildLevels;
    private _showSummaryOnCollapse = false;
    private _cellSelectionMode: GridSelectionMode = GridSelectionMode.multiple;
    private _rowSelectionMode: GridSelectionMode = GridSelectionMode.none;
    private _selectRowOnClick = true;
    private _columnSelectionMode: GridSelectionMode = GridSelectionMode.none;

    private lastAddedRowIndex;
    private _currencyPositionLeft: boolean;

    private rowEditPositioningStrategy = new RowEditPositionStrategy({
        horizontalDirection: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Bottom,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Bottom,
        closeAnimation: null
    });

    private rowEditSettings: OverlaySettings = {
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: false,
        outlet: this.rowOutletDirective,
        positionStrategy: this.rowEditPositioningStrategy
    };

    private readonly DRAG_SCROLL_DELTA = 10;

    /**
     * @hidden @internal
     */
    public abstract id: string;
    abstract data: any[] | null;
    abstract filteredData: any[];
    /**
     * Returns an array containing the filtered sorted data.
     *
     * @example
     * ```typescript
     * const filteredSortedData = this.grid1.filteredSortedData;
     * ```
     */
    public get filteredSortedData(): any[] {
        return this._filteredSortedData;
    }

    /**
     * @hidden @internal
     */
    public get rowChangesCount() {
        if (!this.crudService.row) {
            return 0;
        }
        const f = (obj: any) => {
            let changes = 0;
            Object.keys(obj).forEach(key => isObject(obj[key]) ? changes += f(obj[key]) : changes++);
            return changes;
        };
        const rowChanges = this.transactions.getAggregatedValue(this.crudService.row.id, false);
        return rowChanges ? f(rowChanges) : 0;
    }

    /**
     * @hidden @internal
     */
    public get dataWithAddedInTransactionRows() {
        const result = cloneArray(this.gridAPI.get_all_data());
        if (this.transactions.enabled) {
            result.push(...this.transactions.getAggregatedChanges(true)
                .filter(t => t.type === TransactionType.ADD)
                .map(t => t.newValue));
        }

        return result;
    }

    /**
     * @hidden @internal
     */
    public get dataLength() {
        return this.transactions.enabled ? this.dataWithAddedInTransactionRows.length : this.gridAPI.get_all_data().length;
    }

    /**
     * @hidden @internal
     */
    public get template(): TemplateRef<any> {
        if (this.isLoading && (this.hasZeroResultFilter || this.hasNoData)) {
            return this.loadingGridTemplate ? this.loadingGridTemplate : this.loadingGridDefaultTemplate;
        }

        if (this.hasZeroResultFilter) {
            return this.emptyGridTemplate ? this.emptyGridTemplate : this.emptyFilteredGridTemplate;
        }

        if (this.hasNoData) {
            return this.emptyGridTemplate ? this.emptyGridTemplate : this.emptyGridDefaultTemplate;
        }
    }

    /**
     * @hidden @internal
     */
    private get hasZeroResultFilter(): boolean {
        return this.filteredData && this.filteredData.length === 0;
    }

    /**
     * @hidden @internal
     */
    private get hasNoData(): boolean {
        return !this.data || this.dataLength === 0;
    }

    /**
     * @hidden @internal
     */
    public get shouldOverlayLoading(): boolean {
        return this.isLoading && !this.hasNoData && !this.hasZeroResultFilter;
    }

    /**
     * @hidden @internal
     */
    public get isMultiRowSelectionEnabled(): boolean {
        return this.rowSelection === GridSelectionMode.multiple
            || this.rowSelection === GridSelectionMode.multipleCascade;
    }

    /**
     * @hidden @internal
     */
    public get isRowSelectable(): boolean {
        return this.rowSelection !== GridSelectionMode.none;
    }

    /**
     * @hidden @internal
     */
    public get isCellSelectable() {
        return this.cellSelection !== GridSelectionMode.none;
    }

    /**
     * @hidden @internal
     */
    public get columnInDrag() {
        return this.gridAPI.cms.column;
    }

    constructor(
        public selectionService: IgxGridSelectionService,
        public colResizingService: IgxColumnResizingService,
        public gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>,
        @Inject(IgxGridTransaction) protected _transactions: TransactionService<Transaction, State>,
        private elementRef: ElementRef<HTMLElement>,
        private zone: NgZone,
        @Inject(DOCUMENT) public document: any,
        public cdr: ChangeDetectorRef,
        protected resolver: ComponentFactoryResolver,
        protected differs: IterableDiffers,
        protected viewRef: ViewContainerRef,
        public navigation: IgxGridNavigationService,
        public filteringService: IgxFilteringService,
        @Inject(IgxOverlayService) protected overlayService: IgxOverlayService,
        public summaryService: IgxGridSummaryService,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions,
        @Inject(LOCALE_ID) private localeId: string,
        protected platform: PlatformUtil) {
        super(_displayDensityOptions);
        this.locale = this.locale || this.localeId;
        this.datePipe = new DatePipe(this.locale);
        this.decimalPipe = new DecimalPipe(this.locale);
        this.currencyPipe = new CurrencyPipe(this.locale);
        this.percentPipe = new PercentPipe(this.locale);
        this.cdr.detach();
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('mouseleave')
    public hideActionStrip() {
        this.actionStrip?.hide();
    }

    /**
     * @hidden
     * @internal
     */
    public get headerFeaturesWidth() {
        return this._headerFeaturesWidth;
    }

    /**
     * @hidden
     * @internal
     */
    public isDetailRecord(_rec) {
        return false;
    }

    /**
     * @hidden
     * @internal
     */
    public isGroupByRecord(_rec) {
        return false;
    }

    /**
     * @hidden @internal
     */
    public isGhostRecord(record: any): boolean {
        return record.ghostRecord !== undefined;
    }
    /**
     * @hidden @internal
     */
    public isAddRowRecord(record: any): boolean {
        return record.addRow !== undefined;
    }

    /**
     * @hidden
     * Returns the row index of a row that takes into account the full view data like pinning.
     */
    public getDataViewIndex(rowIndex, pinned) {
        if (pinned && !this.isRowPinningToTop) {
            rowIndex = rowIndex + this.unpinnedDataView.length;
        } else if (!pinned && this.isRowPinningToTop) {
            rowIndex = rowIndex + this.pinnedDataView.length;
        }
        return rowIndex;
    }

    /**
     * @hidden
     * @internal
     */
    public get hasDetails() {
        return false;
    }

    /**
     * Returns the state of the grid virtualization.
     *
     * @remarks
     * Includes the start index and how many records are rendered.
     * @example
     * ```typescript
     * const gridVirtState = this.grid1.virtualizationState;
     * ```
     */
    public get virtualizationState() {
        return this.verticalScrollContainer.state;
    }

    /**
     * @hidden
     */
    public set virtualizationState(state) {
        this.verticalScrollContainer.state = state;
    }

    /**
     * @hidden
     * @internal
     */
    public hideOverlays() {
        this.overlayIDs.forEach(overlayID => {
            const overlay = this.overlayService.getOverlayById(overlayID);

            if (overlay?.visible && !overlay.closeAnimationPlayer?.hasStarted()) {
                this.overlayService.hide(overlayID);

                this.nativeElement.focus();
            }
        });
    }

    /**
     * Returns whether the record is pinned or not.
     *
     * @param rowIndex Index of the record in the `dataView` collection.
     *
     * @hidden
     * @internal
     */
    public isRecordPinnedByViewIndex(rowIndex: number) {
        return this.hasPinnedRecords && (this.isRowPinningToTop && rowIndex < this.pinnedDataView.length) ||
            (!this.isRowPinningToTop && rowIndex >= this.unpinnedDataView.length);
    }

    /**
     * Returns whether the record is pinned or not.
     *
     * @param rowIndex Index of the record in the `filteredSortedData` collection.
     */
    public isRecordPinnedByIndex(rowIndex: number) {
        return this.hasPinnedRecords && (this.isRowPinningToTop && rowIndex < this._filteredSortedPinnedData.length) ||
            (!this.isRowPinningToTop && rowIndex >= this._filteredSortedUnpinnedData.length);
    }

    /**
     * @hidden
     * @internal
     */
    public isRecordPinned(rec) {
        return this.getInitialPinnedIndex(rec) !== -1;
    }

    /**
     * @hidden
     * @internal
     * Returns the record index in order of pinning by the user. Does not consider sorting/filtering.
     */
    public getInitialPinnedIndex(rec) {
        const id = this.gridAPI.get_row_id(rec);
        return this._pinnedRecordIDs.indexOf(id);
    }

    /**
     * @hidden @internal
     */
    public isSummaryRecord(record: any): boolean {
        return record.summaries && record.summaries.size;
    }

    /**
     * @hidden
     * @internal
     */
    public get hasPinnedRecords() {
        return this._pinnedRecordIDs.length > 0;
    }

    /**
     * @hidden
     * @internal
     */
    public get pinnedRecordsCount() {
        return this._pinnedRecordIDs.length;
    }

    /**
     * @hidden
     * @internal
     */
    public get crudService() {
        return this.gridAPI.crudService;
    }

    public _setupServices() {
        this.gridAPI.grid = this;
        this.crudService.grid = this;
        this.selectionService.grid = this;
        this.navigation.grid = this;
        this.filteringService.grid = this;
        this.summaryService.grid = this;
    }

    public _setupListeners() {
        const destructor = takeUntil<any>(this.destroy$);
        fromEvent(this.nativeElement, 'focusout').pipe(filter(() => !!this.navigation.activeNode), destructor).subscribe((event) => {
            if (this.selectionService.dragMode && this.platform.isIE) {
                return;
            }
            if (!this.crudService.cell &&
                !!this.navigation.activeNode &&
                ((event.target === this.tbody.nativeElement && this.navigation.activeNode.row >= 0 &&
                    this.navigation.activeNode.row < this.dataView.length)
                    || (event.target === this.theadRow.nativeElement && this.navigation.activeNode.row === -1)
                    || (event.target === this.tfoot.nativeElement && this.navigation.activeNode.row === this.dataView.length)) &&
                !(this.rowEditable && this.crudService.rowEditingBlocked && this.crudService.rowInEditMode)) {
                this.navigation.lastActiveNode = this.navigation.activeNode;
                this.navigation.activeNode = {} as IActiveNode;
                this.notifyChanges();
            }
        });
        this.rowAddedNotifier.pipe(destructor).subscribe(args => this.refreshGridState(args));
        this.rowDeletedNotifier.pipe(destructor).subscribe(args => {
            this.summaryService.deleteOperation = true;
            this.summaryService.clearSummaryCache(args);
        });

        this.transactions.onStateUpdate.pipe(destructor).subscribe((event: StateUpdateEvent) => {
            let actions = [];
            if (event.origin === TransactionEventOrigin.REDO) {
                actions = event.actions ? event.actions.filter(x => x.transaction.type === TransactionType.DELETE) : [];
            } else if (event.origin === TransactionEventOrigin.UNDO) {
                actions = event.actions ? event.actions.filter(x => x.transaction.type === TransactionType.ADD) : [];
            }
            if (actions.length > 0) {
                for (const action of actions) {
                    if (this.selectionService.isRowSelected(action.transaction.id)) {
                        this.selectionService.deselectRow(action.transaction.id);
                    }
                }
            }
            this.selectionService.clearHeaderCBState();
            this.summaryService.clearSummaryCache();
            this.pipeTrigger++;
            this.notifyChanges();
        });

        this.resizeNotify.pipe(destructor, filter(() => !this._init), throttleTime(100, undefined, { leading: true, trailing: true }))
            .subscribe(() => {
                this.zone.run(() => {
                    this.notifyChanges(true);
                });
            });

        this.pipeTriggerNotifier.pipe(takeUntil(this.destroy$)).subscribe(() => this.pipeTrigger++);

        this.pagingDone.pipe(destructor).subscribe(() => {
            this.crudService.endEdit(false);
            this.selectionService.clear(true);
        });

        this.columnMovingEnd.pipe(destructor).subscribe(() => this.crudService.endEdit(false));

        this.overlayService.opening.pipe(destructor).subscribe((event) => {
            if (this._advancedFilteringOverlayId === event.id) {
                const instance = event.componentRef.instance as IgxAdvancedFilteringDialogComponent;
                if (instance) {
                    instance.initialize(this, this.overlayService, event.id);
                }
            }
        });

        this.overlayService.opened.pipe(destructor).subscribe((event) => {
            const overlaySettings = this.overlayService.getOverlayById(event.id)?.settings;

            // do not hide the advanced filtering overlay on scroll
            if (this._advancedFilteringOverlayId === event.id) {
                const instance = event.componentRef.instance as IgxAdvancedFilteringDialogComponent;
                if (instance) {
                    instance.lastActiveNode = this.navigation.activeNode;
                    instance.setAddButtonFocus();
                }
                return;
            }

            // do not hide the overlay if it's attached to a row
            if (this.rowEditingOverlay?.overlayId === event.id) {
                return;
            }

            if (overlaySettings?.outlet === this.outlet && this.overlayIDs.indexOf(event.id) === -1) {
                this.overlayIDs.push(event.id);
            }
        });

        this.overlayService.closed.pipe(destructor, filter(() => !this._init)).subscribe((event) => {
            if (this._advancedFilteringOverlayId === event.id) {
                this.overlayService.detach(this._advancedFilteringOverlayId);
                this._advancedFilteringOverlayId = null;
                return;
            }

            const ind = this.overlayIDs.indexOf(event.id);
            if (ind !== -1) {
                this.overlayIDs.splice(ind, 1);
            }
        });

        this.verticalScrollContainer.dataChanging.pipe(destructor, filter(() => !this._init)).subscribe(($event) => {
            const shouldRecalcSize = this.isPercentHeight &&
                (!this.calcHeight || this.calcHeight === this.getDataBasedBodyHeight() ||
                    this.calcHeight === this.renderedRowHeight * this._defaultTargetRecordNumber);
            if (shouldRecalcSize) {
                this.calculateGridHeight();
                $event.containerSize = this.calcHeight;
            }
            this.evaluateLoadingState();
        });

        this.verticalScrollContainer.scrollbarVisibilityChanged.pipe(destructor, filter(() => !this._init)).subscribe(() => {
            // called to recalc all widths that may have changes as a result of
            // the vert. scrollbar showing/hiding
            this.notifyChanges(true);
        });

        this.verticalScrollContainer.contentSizeChange.pipe(destructor, filter(() => !this._init)).subscribe(() => {
            this.calculateGridSizes(false);
        });

        this.onDensityChanged.pipe(destructor).subscribe(() => {
            this.crudService.endEdit(false);
            this.summaryService.summaryHeight = 0;
            this.notifyChanges(true);
        });
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        super.ngOnInit();
        this._setupServices();
        this._setupListeners();
        this.rowListDiffer = this.differs.find([]).create(null);
        this.columnListDiffer = this.differs.find([]).create(null);
        this.calcWidth = this.width && this.width.indexOf('%') === -1 ? parseInt(this.width, 10) : 0;
        this.shouldGenerate = this.autoGenerate;
    }

    /**
     * @hidden
     * @internal
     */
    public resetColumnsCaches() {
        this.columnList.forEach(column => column.resetCaches());
    }

    /**
     * @hidden @internal
     */
    public generateRowID(): string | number {
        const primaryColumn = this.columnList.find(col => col.field === this.primaryKey);
        const idType = this.data.length ?
            this.resolveDataTypes(this.data[0][this.primaryKey]) : primaryColumn ? primaryColumn.dataType : 'string';
        return idType === 'string' ? uuidv4() : FAKE_ROW_ID--;
    }

    /**
     * @hidden
     * @internal
     */
    public resetForOfCache() {
        const firstVirtRow = this.dataRowList.first;
        if (firstVirtRow) {
            if (this._cdrRequests) {
                firstVirtRow.virtDirRow.cdr.detectChanges();
            }
            firstVirtRow.virtDirRow.assumeMaster();
        }
    }

    /**
     * @hidden
     * @internal
     */
    public setFilteredData(data, pinned: boolean) {
        if (this.hasPinnedRecords && pinned) {
            this._filteredPinnedData = data || [];
            const filteredUnpinned = this._filteredUnpinnedData || [];
            const filteredData = [... this._filteredPinnedData, ...filteredUnpinned];
            this.filteredData = filteredData.length > 0 ? filteredData : this._filteredUnpinnedData;
        } else if (this.hasPinnedRecords && !pinned) {
            this._filteredUnpinnedData = data;
        } else {
            this.filteredData = data;
        }
    }

    /**
     * @hidden
     * @internal
     */
    public resetColumnCollections() {
        this._visibleColumns.length = 0;
        this._pinnedVisible.length = 0;
        this._unpinnedVisible.length = 0;
    }

    /**
     * @hidden
     * @internal
     */
    public resetCachedWidths() {
        this._unpinnedWidth = NaN;
        this._pinnedWidth = NaN;
        this._totalWidth = NaN;
    }

    /**
     * @hidden
     * @internal
     */
    public resetCaches(recalcFeatureWidth = true) {
        if (recalcFeatureWidth) {
            this._headerFeaturesWidth = NaN;
        }
        this.resetForOfCache();
        this.resetColumnsCaches();
        this.resetColumnCollections();
        this.resetCachedWidths();
        this.hasVisibleColumns = undefined;
        this._columnGroups = this.columnList.some(col => col.columnGroup);
    }

    /**
     * @hidden
     */
    public ngAfterContentInit() {
        this.setupColumns();
        this.toolbar.changes.pipe(takeUntil(this.destroy$), filter(() => !this._init)).subscribe(() => this.notifyChanges(true));
        if (this.actionStrip) {
            this.actionStrip.menuOverlaySettings.outlet = this.outlet;
        }
    }

    /**
     * @hidden
     * @internal
     */
    public setFilteredSortedData(data, pinned: boolean) {
        data = data || [];
        if (this.pinnedRecordsCount > 0 && pinned) {
            this._filteredSortedPinnedData = data;
            this.pinnedRecords = data;
            this._filteredSortedData = this.isRowPinningToTop ? [... this._filteredSortedPinnedData, ... this._filteredSortedUnpinnedData] :
                [... this._filteredSortedUnpinnedData, ... this._filteredSortedPinnedData];
            this.refreshSearch(true, false);
        } else if (this.pinnedRecordsCount > 0 && !pinned) {
            this._filteredSortedUnpinnedData = data;
        } else {
            this._filteredSortedData = data;
            this.refreshSearch(true, false);
        }
    }

    /**
     * @hidden @internal
     */
    public resetHorizontalForOfs() {
        const elementFilter = (item: IgxRowDirective<any> | IgxSummaryRowComponent) => this.isDefined(item.nativeElement.parentElement);
        this._horizontalForOfs = [
            ...this._dataRowList.filter(elementFilter).map(item => item.virtDirRow),
            ...this._summaryRowList.filter(elementFilter).map(item => item.virtDirRow)
        ];
    }

    /**
     * @hidden @internal
     */
    public _setupRowObservers() {
        const elementFilter = (item: IgxRowDirective<any> | IgxSummaryRowComponent) => this.isDefined(item.nativeElement.parentElement);
        const extractForOfs = pipe(map((collection: any[]) => collection.filter(elementFilter).map(item => item.virtDirRow)));
        const rowListObserver = extractForOfs(this._dataRowList.changes);
        const summaryRowObserver = extractForOfs(this._summaryRowList.changes);
        rowListObserver.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.resetHorizontalForOfs();
        });
        summaryRowObserver.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.resetHorizontalForOfs();
        });
        this.resetHorizontalForOfs();
    }

    /**
     * @hidden @internal
     */
    public _zoneBegoneListeners() {
        this.zone.runOutsideAngular(() => {
            this.verticalScrollContainer.getScroll().addEventListener('scroll', this.verticalScrollHandler.bind(this));
            this.headerContainer.getScroll().addEventListener('scroll', this.horizontalScrollHandler.bind(this));
            this.observer = new (getResizeObserver())(() => this.resizeNotify.next());
            this.observer.observe(this.nativeElement);
        });
    }

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        this.initPinning();
        this.calculateGridSizes();
        this._init = false;
        this.cdr.reattach();
        this._setupRowObservers();
        this._zoneBegoneListeners();

        this.paginatorSettings = { outlet: this.outlet };

        const vertScrDC = this.verticalScrollContainer.displayContainer;
        vertScrDC.addEventListener('scroll', this.preventContainerScroll.bind(this));

        this._pinnedRowList.changes
            .pipe(takeUntil(this.destroy$))
            .subscribe((change: QueryList<IgxGridRowComponent>) => {
                this.onPinnedRowsChanged(change);
            });

        this.addRowSnackbar?.clicked.subscribe(() => {
            const rec = this.filteredSortedData[this.lastAddedRowIndex];
            this.scrollTo(rec, 0);
            this.addRowSnackbar.close();
        });

        // Keep the stream open for future subscribers
        this.rendered$.pipe(takeUntil(this.destroy$)).subscribe(noop);
        Promise.resolve().then(() => this.rendered.next(true));
    }

    /**
     * @hidden @internal
     */
    public notifyChanges(repaint = false) {
        this._cdrRequests = true;
        this._cdrRequestRepaint = repaint;
        this.cdr.markForCheck();
    }

    /**
     * @hidden @internal
     */
    public ngDoCheck() {
        super.ngDoCheck();
        if (this._init) {
            return;
        }

        if (this._cdrRequestRepaint) {
            this.resetNotifyChanges();
            this.calculateGridSizes();
            this.refreshSearch(true);
            return;
        }

        if (this._cdrRequests) {
            this.resetNotifyChanges();
            this.cdr.detectChanges();
        }
    }

    /**
     * @hidden
     * @internal
     */
    public getDragGhostCustomTemplate() {
        if (this.dragGhostCustomTemplates && this.dragGhostCustomTemplates.first) {
            return this.dragGhostCustomTemplates.first;
        }

        return null;
    }

    /**
     * @hidden @internal
     */
    public ngOnDestroy() {
        this.tmpOutlets.forEach((tmplOutlet) => {
            tmplOutlet.cleanCache();
        });

        this.destroy$.next(true);
        this.destroy$.complete();
        this._destroyed = true;

        if (this._advancedFilteringOverlayId) {
            this.overlayService.detach(this._advancedFilteringOverlayId);
        }

        this.overlayIDs.forEach(overlayID => {
            const overlay = this.overlayService.getOverlayById(overlayID);

            if (overlay && !overlay.detached) {
                this.overlayService.detach(overlayID);
            }
        });

        this.zone.runOutsideAngular(() => {
            this.observer.disconnect();
            this.verticalScrollContainer?.getScroll()?.removeEventListener('scroll', this.verticalScrollHandler);
            this.headerContainer?.getScroll()?.removeEventListener('scroll', this.horizontalScrollHandler);
            const vertScrDC = this.verticalScrollContainer?.displayContainer;
            vertScrDC?.removeEventListener('scroll', this.preventContainerScroll);
        });
    }

    /**
     * Toggles the specified column's visibility.
     *
     * @example
     * ```typescript
     * this.grid1.toggleColumnVisibility({
     *       column: this.grid1.columns[0],
     *       newValue: true
     * });
     * ```
     */
    public toggleColumnVisibility(args: IColumnVisibilityChangedEventArgs) {
        const col = args.column ? this.columnList.find((c) => c === args.column) : undefined;

        if (!col) {
            return;
        }
        col.toggleVisibility(args.newValue);
    }

    /**
     * Gets/Sets a list of key-value pairs [row ID, expansion state].
     *
     * @remarks
     * Includes only states that differ from the default one.
     * Supports two-way binding.
     * @example
     * ```html
     * <igx-grid #grid [data]="data" [(expansionStates)]="model.expansionStates">
     * </igx-grid>
     * ```
     */
    @Input()
    public get expansionStates() {
        return this._expansionStates;
    }

    public set expansionStates(value) {
        this._expansionStates = new Map<any, boolean>(value);
        this.expansionStatesChange.emit(this._expansionStates);
        this.notifyChanges(true);
        if (this.gridAPI.grid) {
            this.cdr.detectChanges();
        }
    }

    /**
     * Expands all rows.
     *
     * @example
     * ```typescript
     * this.grid.expandAll();
     * ```
     */
    public expandAll() {
        this._defaultExpandState = true;
        this.expansionStates = new Map<any, boolean>();
    }

    /**
     * Collapses all rows.
     *
     * @example
     * ```typescript
     * this.grid.collapseAll();
     * ```
     */
    public collapseAll() {
        this._defaultExpandState = false;
        this.expansionStates = new Map<any, boolean>();
    }

    /**
     * Expands the row by its id.
     *
     * @remarks
     * ID is either the primaryKey value or the data record instance.
     * @example
     * ```typescript
     * this.grid.expandRow(rowID);
     * ```
     * @param rowID The row id - primaryKey value or the data record instance.
     */
    public expandRow(rowID: any) {
        this.gridAPI.set_row_expansion_state(rowID, true);
    }

    /**
     * Collapses the row by its id.
     *
     * @remarks
     * ID is either the primaryKey value or the data record instance.
     * @example
     * ```typescript
     * this.grid.collapseRow(rowID);
     * ```
     * @param rowID The row id - primaryKey value or the data record instance.
     */
    public collapseRow(rowID: any) {
        this.gridAPI.set_row_expansion_state(rowID, false);
    }


    /**
     * Toggles the row by its id.
     *
     * @remarks
     * ID is either the primaryKey value or the data record instance.
     * @example
     * ```typescript
     * this.grid.toggleRow(rowID);
     * ```
     * @param rowID The row id - primaryKey value or the data record instance.
     */
    public toggleRow(rowID: any) {
        const rec = this.gridAPI.get_rec_by_id(rowID);
        const state = this.gridAPI.get_row_expansion_state(rec);
        this.gridAPI.set_row_expansion_state(rowID, !state);
    }

    /**
     * @hidden
     * @internal
     */
    public getDefaultExpandState(_rec: any) {
        return this._defaultExpandState;
    }

    /**
     * Gets the native element.
     *
     * @example
     * ```typescript
     * const nativeEl = this.grid.nativeElement.
     * ```
     */
    public get nativeElement() {
        return this.elementRef.nativeElement;
    }

    /**
     * Gets/Sets the outlet used to attach the grid's overlays to.
     *
     * @remark
     * If set, returns the outlet defined outside the grid. Otherwise returns the grid's internal outlet directive.
     */
    @Input()
    public get outlet() {
        return this.resolveOutlet();
    }

    public set outlet(val: IgxOverlayOutletDirective) {
        this._userOutletDirective = val;
    }


    /**
     * Gets the default row height.
     *
     * @example
     * ```typescript
     * const rowHeigh = this.grid.defaultRowHeight;
     * ```
     */
    public get defaultRowHeight(): number {
        switch (this.displayDensity) {
            case DisplayDensity.cosy:
                return 40;
            case DisplayDensity.compact:
                return 32;
            default:
                return 50;
        }
    }

    /**
     * @hidden @internal
     */
    public get defaultSummaryHeight(): number {
        switch (this.displayDensity) {
            case DisplayDensity.cosy:
                return 30;
            case DisplayDensity.compact:
                return 24;
            default:
                return 36;
        }
    }

    /**
     * Returns the `IgxGridHeaderGroupComponent`'s minimum allowed width.
     *
     * @remarks
     * Used internally for restricting header group component width.
     * The values below depend on the header cell default right/left padding values.
     */
    public get defaultHeaderGroupMinWidth(): number {
        switch (this.displayDensity) {
            case DisplayDensity.cosy:
                return 32;
            case DisplayDensity.compact:
                return 24;
            default:
                return 48;
        }
    }

    /**
     * @hidden @internal
     */
    public paginatorClassName(): string {
        switch (this.displayDensity) {
            case DisplayDensity.cosy:
                return 'igx-paginator--cosy';
            case DisplayDensity.compact:
                return 'igx-paginator--compact';
            default:
                return 'igx-paginator';
        }
    }

    /**
     * Gets the current width of the container for the pinned `IgxColumnComponent`s.
     *
     * @example
     * ```typescript
     * const pinnedWidth = this.grid.getPinnedWidth;
     * ```
     */
    public get pinnedWidth() {
        if (!isNaN(this._pinnedWidth)) {
            return this._pinnedWidth;
        }
        this._pinnedWidth = this.getPinnedWidth();
        return this._pinnedWidth;
    }

    /**
     * Gets the current width of the container for the unpinned `IgxColumnComponent`s.
     *
     * @example
     * ```typescript
     * const unpinnedWidth = this.grid.getUnpinnedWidth;
     * ```
     */
    public get unpinnedWidth() {
        if (!isNaN(this._unpinnedWidth)) {
            return this._unpinnedWidth;
        }
        this._unpinnedWidth = this.getUnpinnedWidth();
        return this._unpinnedWidth;
    }

    /**
     * @hidden @internal
     */
    public get isHorizontalScrollHidden() {
        const diff = this.unpinnedWidth - this.totalWidth;
        return this.width === null || diff >= 0;
    }

    /**
     * @hidden @internal
     * Gets the combined width of the columns that are specific to the enabled grid features. They are fixed.
     */
    public featureColumnsWidth(expander?: ElementRef) {
        if (Number.isNaN(this._headerFeaturesWidth)) {
            // TODO: platformUtil.isBrowser check
            const rowSelectArea = this.headerSelectorContainer?.nativeElement?.getBoundingClientRect ?
                this.headerSelectorContainer.nativeElement.getBoundingClientRect().width : 0;
            const rowDragArea = this.rowDraggable && this.headerDragContainer?.nativeElement?.getBoundingClientRect ?
                this.headerDragContainer.nativeElement.getBoundingClientRect().width : 0;
            const groupableArea = this.headerGroupContainer?.nativeElement?.getBoundingClientRect ?
                this.headerGroupContainer.nativeElement.getBoundingClientRect().width : 0;
            const expanderWidth = expander?.nativeElement?.getBoundingClientRect ? expander.nativeElement.getBoundingClientRect().width : 0;
            this._headerFeaturesWidth = rowSelectArea + rowDragArea + groupableArea + expanderWidth;
        }
        return this._headerFeaturesWidth;
    }

    /**
     * @hidden @internal
     */
    public get summariesMargin() {
        return this.featureColumnsWidth();
    }

    /**
     * Gets an array of `IgxColumnComponent`s.
     *
     * @example
     * ```typescript
     * const colums = this.grid.columns.
     * ```
     */
    public get columns(): IgxColumnComponent[] {
        return this._columns;
    }

    /**
     * Gets an array of the pinned `IgxColumnComponent`s.
     *
     * @example
     * ```typescript
     * const pinnedColumns = this.grid.pinnedColumns.
     * ```
     */
    public get pinnedColumns(): IgxColumnComponent[] {
        if (this._pinnedVisible.length) {
            return this._pinnedVisible;
        }
        this._pinnedVisible = this._pinnedColumns.filter(col => !col.hidden);
        return this._pinnedVisible;
    }

    /**
     * Gets an array of the pinned `IgxRowComponent`s.
     *
     * @example
     * ```typescript
     * const pinnedRow = this.grid.pinnedRows;
     * ```
     */
    public get pinnedRows(): IgxGridRowComponent[] {
        return this._pinnedRowList.toArray().sort((a, b) => a.index - b.index);
    }

    /**
     * Gets an array of unpinned `IgxColumnComponent`s.
     *
     * @example
     * ```typescript
     * const unpinnedColumns = this.grid.unpinnedColumns.
     * ```
     */
    public get unpinnedColumns(): IgxColumnComponent[] {
        if (this._unpinnedVisible.length) {
            return this._unpinnedVisible;
        }
        this._unpinnedVisible = this._unpinnedColumns.filter((col) => !col.hidden);
        return this._unpinnedVisible;
    }

    /**
     * Gets the `width` to be set on `IgxGridHeaderGroupComponent`.
     */
    public getHeaderGroupWidth(column: IgxColumnComponent): string {
        if (this.hasColumnLayouts) {
            return '';
        }
        const colWidth = parseFloat(column.calcWidth);
        const minWidth = this.defaultHeaderGroupMinWidth;

        if (colWidth < minWidth) {
            return minWidth + 'px';
        }
        return colWidth + 'px';
    }

    /**
     * Returns the `IgxColumnComponent` by field name.
     *
     * @example
     * ```typescript
     * const myCol = this.grid1.getColumnByName("ID");
     * ```
     * @param name
     */
    public getColumnByName(name: string): IgxColumnComponent {
        return this.columnList.find((col) => col.field === name);
    }

    public getColumnByVisibleIndex(index: number): IgxColumnComponent {
        return this.visibleColumns.find((col) =>
            !col.columnGroup && !col.columnLayout &&
            col.visibleIndex === index
        );
    }

    /**
     * Returns an array of visible `IgxColumnComponent`s.
     *
     * @example
     * ```typescript
     * const visibleColumns = this.grid.visibleColumns.
     * ```
     */
    public get visibleColumns(): IgxColumnComponent[] {
        if (this._visibleColumns.length) {
            return this._visibleColumns;
        }
        this._visibleColumns = this.columnList.filter(c => !c.hidden);
        return this._visibleColumns;
    }

    /**
     * Returns the `IgxGridCellComponent` that matches the conditions.
     *
     * @example
     * ```typescript
     * const myCell = this.grid1.getCellByColumn(2,"UnitPrice");
     * ```
     * @param rowIndex
     * @param columnField
     */
    public getCellByColumn(rowIndex: number, columnField: string): IgxGridCellComponent {
        const columnId = this.columnList.map((column) => column.field).indexOf(columnField);
        if (columnId !== -1) {
            return this.gridAPI.get_cell_by_index(rowIndex, columnId);
        }
    }

    public getCellByColumnVisibleIndex(rowIndex: number, index: number): IgxGridCellComponent {
        return this.gridAPI.get_cell_by_visible_index(rowIndex, index);

    }

    /**
     * Returns an `IgxGridCellComponent` object by the specified primary key and column field.
     *
     * @remarks
     * Requires that the primaryKey property is set.
     * @example
     * ```typescript
     * grid.getCellByKey(1, 'index');
     * ```
     * @param rowSelector match any rowID
     * @param columnField
     */
    public getCellByKey(rowSelector: any, columnField: string): IgxGridCellComponent {
        return this.gridAPI.get_cell_by_key(rowSelector, columnField);
    }

    /**
     * Gets the total number of pages.
     *
     * @example
     * ```typescript
     * const totalPages = this.grid.totalPages;
     * ```
     */
    public get totalPages(): number {
        if (this.pagingState) {
            return this.pagingState.metadata.countPages;
        }
        return this._totalRecords >= 0 ? Math.ceil(this._totalRecords / this.perPage) : -1;
    }

    /**
     * Gets if the current page is the first page.
     *
     * @example
     * ```typescript
     * const firstPage = this.grid.isFirstPage;
     * ```
     */
    public get isFirstPage(): boolean {
        return this.page === 0;
    }

    /**
     * Goes to the next page, if the grid is not already at the last page.
     *
     * @example
     * ```typescript
     * this.grid1.nextPage();
     * ```
     */
    public nextPage(): void {
        if (!this.isLastPage) {
            this.page += 1;
        }
    }

    /**
     * Goes to the previous page, if the grid is not already at the first page.
     *
     * @example
     * ```typescript
     * this.grid1.previousPage();
     * ```
     */
    public previousPage(): void {
        if (!this.isFirstPage) {
            this.page -= 1;
        }
    }

    /**
     * Returns the total number of records.
     *
     * @remarks
     * Only functions when paging is enabled.
     * @example
     * ```typescript
     * const totalRecords = this.grid.totalRecords;
     * ```
     */
    @Input()
    public get totalRecords(): number {
        return this._totalRecords >= 0 ? this._totalRecords : this.pagingState?.metadata.countRecords;
    }

    public set totalRecords(total: number) {
        if (total >= 0) {
            this._totalRecords = total;
            this.pipeTrigger++;
            this.notifyChanges();
        }
    }

    /**
     * Returns if the current page is the last page.
     *
     * @example
     * ```typescript
     * const lastPage = this.grid.isLastPage;
     * ```
     */
    public get isLastPage(): boolean {
        return this.page + 1 >= this.totalPages;
    }

    /**
     * Returns the total width of the `IgxGridComponent`.
     *
     * @example
     * ```typescript
     * const gridWidth = this.grid.totalWidth;
     * ```
     */
    public get totalWidth(): number {
        if (!isNaN(this._totalWidth)) {
            return this._totalWidth;
        }
        // Take only top level columns
        const cols = this.visibleColumns.filter(col => col.level === 0 && !col.pinned);
        let totalWidth = 0;
        let i = 0;
        for (i; i < cols.length; i++) {
            totalWidth += parseInt(cols[i].calcWidth, 10) || 0;
        }
        this._totalWidth = totalWidth;
        return totalWidth;
    }

    /**
     * @hidden
     * @internal
     */
    public get showRowSelectors(): boolean {
        return this.isRowSelectable && this.hasVisibleColumns && !this.hideRowSelectors;
    }

    /**
     * @hidden
     * @internal
     */
    public get showAddButton() {
        return this.rowEditable && this.dataView.length === 0 && this.columns.length > 0;
    }

    /**
     * @hidden
     * @internal
     */
    public get showDragIcons(): boolean {
        return this.rowDraggable && this.columns.length > this.hiddenColumnsCount;
    }

    /**
     * Places a column before or after the specified target column.
     *
     * @example
     * ```typescript
     * grid.moveColumn(column, target);
     * ```
     */
    public moveColumn(column: IgxColumnComponent, target: IgxColumnComponent, pos: DropPosition = DropPosition.AfterDropTarget) {

        if (column === target || (column.level !== target.level) ||
            (column.topLevelParent !== target.topLevelParent)) {
            return;
        }

        if (column.level) {
            this._moveChildColumns(column.parent, column, target, pos);
        }

        let columnPinStateChanged;
        // pinning and unpinning will work correctly even without passing index
        // but is easier to calclulate the index here, and later use it in the pinning event args
        if (target.pinned && !column.pinned) {
            const pinnedIndex = this._pinnedColumns.indexOf(target);
            const index = pos === DropPosition.AfterDropTarget ? pinnedIndex + 1 : pinnedIndex;
            columnPinStateChanged = column.pin(index);
        }

        if (!target.pinned && column.pinned) {
            const unpinnedIndex = this._unpinnedColumns.indexOf(target);
            const index = pos === DropPosition.AfterDropTarget ? unpinnedIndex + 1 : unpinnedIndex;
            columnPinStateChanged = column.unpin(index);
        }

        if (target.pinned && column.pinned && !columnPinStateChanged) {
            this._reorderColumns(column, target, pos, this._pinnedColumns);
        }

        if (!target.pinned && !column.pinned && !columnPinStateChanged) {
            this._reorderColumns(column, target, pos, this._unpinnedColumns);
        }

        this._moveColumns(column, target, pos);
        this._columnsReordered(column);

        this.columnMovingEnd.emit({ source: column, target });
    }

    /**
     * Goes to the desired page index.
     *
     * @example
     * ```typescript
     * this.grid1.paginate(1);
     * ```
     * @param val
     */
    public paginate(val: number): void {
        if (val < 0 || val > this.totalPages - 1) {
            return;
        }

        this.page = val;
    }

    /**
     * Triggers change detection for the `IgxGridComponent`.
     * Calling markForCheck also triggers the grid pipes explicitly, resulting in all updates being processed.
     * May degrade performance if used when not needed, or if misused:
     * ```typescript
     * // DON'Ts:
     * // don't call markForCheck from inside a loop
     * // don't call markForCheck when a primitive has changed
     * grid.data.forEach(rec => {
     *  rec = newValue;
     *  grid.markForCheck();
     * });
     *
     * // DOs
     * // call markForCheck after updating a nested property
     * grid.data.forEach(rec => {
     *  rec.nestedProp1.nestedProp2 = newValue;
     * });
     * grid.markForCheck();
     * ```
     *
     * @example
     * ```typescript
     * grid.markForCheck();
     * ```
     */
    public markForCheck() {
        this.pipeTrigger++;
        this.cdr.detectChanges();
    }

    /**
     * @hidden @internal
     * TODO: eventually move to CRUD
     */
    public beginAddRowByIndex(rowID: any, index: number, asChild?: boolean, event?: Event) {
        if (!this.rowEditable) {
            console.warn('The grid must use row edit mode to perform row adding! Please set rowEditable to true.');
            return;
        }
        this.crudService.endEdit(true, event);
        this.crudService.cancelAddMode = false;
        const isInPinnedArea = this.isRecordPinnedByViewIndex(index);
        const pinIndex = this.pinnedRecords.findIndex(x => x[this.primaryKey] === rowID);
        const unpinIndex = this.getUnpinnedIndexById(rowID);

        if (this.expansionStates.get(rowID)) {
            this.collapseRow(rowID);
        }

        this.crudService.addRowParent = {
            rowID,
            index: isInPinnedArea ? pinIndex : unpinIndex,
            asChild,
            isPinned: isInPinnedArea
        };
        this.pipeTrigger++;
        this.cdr.detectChanges();
        if (isInPinnedArea) {
            this.calculateGridHeight();
        }
        const newRowIndex = this.crudService.addRowParent.index + 1;
        // ensure adding row is in view.
        const shouldScroll = this.navigation.shouldPerformVerticalScroll(newRowIndex, -1);
        if (shouldScroll) {
            this.navigateTo(newRowIndex, -1);
        }
        const row = this.gridAPI.get_row_by_index(index + 1);
        row.animateAdd = true;
        row.onAnimationEnd.pipe(first()).subscribe(() => {
            row.animateAdd = false;
            const cell = row.cells.find(c => c.editable);
            if (cell) {
                this.gridAPI.update_cell(this.crudService.cell);
                this.crudService.enterEditMode(cell, event);
                cell.activate();
            }
        });
    }

    /**
     * Creates a new `IgxGridRowComponent` and adds the data record to the end of the data source.
     *
     * @example
     * ```typescript
     * this.grid1.addRow(record);
     * ```
     * @param data
     */
    public addRow(data: any): void {
        // commit pending states prior to adding a row
        this.crudService.endEdit(true);
        this.gridAPI.addRowToData(data);

        this.rowAddedNotifier.next({ data });
        this.pipeTrigger++;
        this.notifyChanges();
    }

    /**
     * Removes the `IgxGridRowComponent` and the corresponding data record by primary key.
     *
     * @remarks
     * Requires that the `primaryKey` property is set.
     * The method accept rowSelector as a parameter, which is the rowID.
     * @example
     * ```typescript
     * this.grid1.deleteRow(0);
     * ```
     * @param rowSelector
     */
    public deleteRow(rowSelector: any): any {
        if (this.primaryKey !== undefined && this.primaryKey !== null) {
            return this.deleteRowById(rowSelector);
        }
    }

    /** @hidden */
    public deleteRowById(rowId: any): any {
        return this.gridAPI.deleteRowById(rowId);
    }

    /**
     * Updates the `IgxGridRowComponent` and the corresponding data record by primary key.
     *
     * @remarks
     * Requires that the `primaryKey` property is set.
     * @example
     * ```typescript
     * this.gridWithPK.updateCell('Updated', 1, 'ProductName');
     * ```
     * @param value the new value which is to be set.
     * @param rowSelector corresponds to rowID.
     * @param column corresponds to column field.
     */
    public updateCell(value: any, rowSelector: any, column: string): void {
        if (this.isDefined(this.primaryKey)) {
            const col = this.columnList.toArray().find(c => c.field === column);
            if (col) {
                // Simplify
                const rowData = this.gridAPI.getRowData(rowSelector);
                const index = this.gridAPI.get_row_index_in_data(rowSelector);
                // If row passed is invalid
                if (index < 0) {
                    return;
                }

                const id = {
                    rowID: rowSelector,
                    columnID: col.index,
                    rowIndex: index
                };

                const cell = new IgxCell(id, index, col, rowData[col.field], value, rowData, this);
                this.gridAPI.update_cell(cell);
                this.cdr.detectChanges();
            }
        }
    }

    /**
     * Updates the `IgxGridRowComponent`
     *
     * @remarks
     * The row is specified by
     * rowSelector parameter and the data source record with the passed value.
     * This method will apply requested update only if primary key is specified in the grid.
     * @example
     * ```typescript
     * grid.updateRow({
     *       ProductID: 1, ProductName: 'Spearmint', InStock: true, UnitsInStock: 1, OrderDate: new Date('2005-03-21')
     *   }, 1);
     * ```
     * @param value–
     * @param rowSelector correspond to rowID
     */
    // TODO: prevent event invocation
    public updateRow(value: any, rowSelector: any): void {
        if (this.isDefined(this.primaryKey)) {
            const editableCell = this.crudService.cell;
            if (editableCell && editableCell.id.rowID === rowSelector) {
                this.crudService.endCellEdit();
            }
            const row = new IgxRow(rowSelector, -1, this.gridAPI.getRowData(rowSelector), this);
            this.gridAPI.update_row(row, value);

            // TODO: fix for #5934 and probably break for #5763
            // consider adding of third optional boolean parameter in updateRow.
            // If developer set this parameter to true we should call notifyChanges(true), and
            // vise-versa if developer set it to false we should call notifyChanges(false).
            // The parameter should default to false
            this.notifyChanges();
        }
    }

    /**
     * Returns the data that is contained in the row component.
     *
     * @remarks
     * If the primary key is not specified the row selector match the row data.
     * @example
     * ```typescript
     * const data = grid.getRowData(94741);
     * ```
     * @param rowSelector correspond to rowID
     */
    public getRowData(rowSelector: any) {
        if (!this.primaryKey) {
            return rowSelector;
        }
        const data = this.gridAPI.get_all_data(this.transactions.enabled);
        const index = this.gridAPI.get_row_index_in_data(rowSelector);
        return index < 0 ? {} : data[index];
    }

    /**
     * Sort a single `IgxColumnComponent`.
     *
     * @remarks
     * Sort the `IgxGridComponent`'s `IgxColumnComponent` based on the provided array of sorting expressions.
     * @example
     * ```typescript
     * this.grid.sort({ fieldName: name, dir: SortingDirection.Asc, ignoreCase: false });
     * ```
     */
    public sort(expression: ISortingExpression | Array<ISortingExpression>): void {
        const sortingState = cloneArray(this.sortingExpressions);

        if (expression instanceof Array) {
            for (const each of expression) {
                if (each.dir === SortingDirection.None) {
                    this.gridAPI.remove_grouping_expression(each.fieldName);
                }
                this.gridAPI.prepare_sorting_expression([sortingState], each);
            }
        } else {
            if (expression.dir === SortingDirection.None) {
                this.gridAPI.remove_grouping_expression(expression.fieldName);
            }
            this.gridAPI.prepare_sorting_expression([sortingState], expression);
        }

        const eventArgs: ISortingEventArgs = { owner: this, sortingExpressions: sortingState, cancel: false };
        this.sorting.emit(eventArgs);

        if (eventArgs.cancel) {
            return;
        }

        this.crudService.endEdit(false);
        if (expression instanceof Array) {
            this.gridAPI.sort_multiple(expression);
        } else {
            this.gridAPI.sort(expression);
        }
        requestAnimationFrame(() => this.sortingDone.emit(expression));
    }

    /**
     * Filters a single `IgxColumnComponent`.
     *
     * @example
     * ```typescript
     * public filter(term) {
     *      this.grid.filter("ProductName", term, IgxStringFilteringOperand.instance().condition("contains"));
     * }
     * ```
     * @param name
     * @param value
     * @param conditionOrExpressionTree
     * @param ignoreCase
     */
    public filter(name: string, value: any, conditionOrExpressionTree?: IFilteringOperation | IFilteringExpressionsTree,
        ignoreCase?: boolean) {
        this.filteringService.filter(name, value, conditionOrExpressionTree, ignoreCase);
    }

    /**
     * Filters all the `IgxColumnComponent` in the `IgxGridComponent` with the same condition.
     *
     * @example
     * ```typescript
     * grid.filterGlobal('some', IgxStringFilteringOperand.instance().condition('contains'));
     * ```
     * @param value
     * @param condition
     * @param ignoreCase
     */
    public filterGlobal(value: any, condition, ignoreCase?) {
        this.filteringService.filterGlobal(value, condition, ignoreCase);
    }

    /**
     * Enables summaries for the specified column and applies your customSummary.
     *
     * @remarks
     * If you do not provide the customSummary, then the default summary for the column data type will be applied.
     * @example
     * ```typescript
     * grid.enableSummaries([{ fieldName: 'ProductName' }, { fieldName: 'ID' }]);
     * ```
     * Enable summaries for the listed columns.
     * @example
     * ```typescript
     * grid.enableSummaries('ProductName');
     * ```
     * @param rest
     */
    public enableSummaries(...rest) {
        if (rest.length === 1 && Array.isArray(rest[0])) {
            this._multipleSummaries(rest[0], true);
        } else {
            this._summaries(rest[0], true, rest[1]);
        }
    }

    /**
     * Disable summaries for the specified column.
     *
     * @example
     * ```typescript
     * grid.disableSummaries('ProductName');
     * ```
     * @remarks
     * Disable summaries for the listed columns.
     * @example
     * ```typescript
     * grid.disableSummaries([{ fieldName: 'ProductName' }]);
     * ```
     */
    public disableSummaries(...rest) {
        if (rest.length === 1 && Array.isArray(rest[0])) {
            this._disableMultipleSummaries(rest[0]);
        } else {
            this._summaries(rest[0], false);
        }
    }

    /**
     * If name is provided, clears the filtering state of the corresponding `IgxColumnComponent`.
     *
     * @remarks
     * Otherwise clears the filtering state of all `IgxColumnComponent`s.
     * @example
     * ```typescript
     * this.grid.clearFilter();
     * ```
     * @param name
     */
    public clearFilter(name?: string) {
        this.filteringService.clearFilter(name);
    }

    /**
     * If name is provided, clears the sorting state of the corresponding `IgxColumnComponent`.
     *
     * @remarks
     * otherwise clears the sorting state of all `IgxColumnComponent`.
     * @example
     * ```typescript
     * this.grid.clearSort();
     * ```
     * @param name
     */
    public clearSort(name?: string) {
        if (!name) {
            this.sortingExpressions = [];
            return;
        }
        if (!this.gridAPI.get_column_by_name(name)) {
            return;
        }
        this.gridAPI.clear_sort(name);
    }

    /**
     * @hidden @internal
     */
    public refreshGridState(_args?) {
        this.crudService.endEdit(true);
        this.selectionService.clearHeaderCBState();
        this.summaryService.clearSummaryCache();
        this.cdr.detectChanges();
    }

    // TODO: We have return values here. Move them to event args ??

    /**
     * Pins a column by field name.
     *
     * @remarks
     * Returns whether the operation is successful.
     * @example
     * ```typescript
     * this.grid.pinColumn("ID");
     * ```
     * @param columnName
     * @param index
     */
    public pinColumn(columnName: string | IgxColumnComponent, index?): boolean {
        const col = columnName instanceof IgxColumnComponent ? columnName : this.getColumnByName(columnName);
        return col.pin(index);
    }

    /**
     * Unpins a column by field name. Returns whether the operation is successful.
     *
     * @example
     * ```typescript
     * this.grid.pinColumn("ID");
     * ```
     * @param columnName
     * @param index
     */
    public unpinColumn(columnName: string | IgxColumnComponent, index?): boolean {
        const col = columnName instanceof IgxColumnComponent ? columnName : this.getColumnByName(columnName);
        return col.unpin(index);
    }

    /**
     * Pin the row by its id.
     *
     * @remarks
     * ID is either the primaryKey value or the data record instance.
     * @example
     * ```typescript
     * this.grid.pinRow(rowID);
     * ```
     * @param rowID The row id - primaryKey value or the data record instance.
     * @param index The index at which to insert the row in the pinned collection.
     */
    public pinRow(rowID: any, index?: number, row?: RowType): boolean {
        if (this._pinnedRecordIDs.indexOf(rowID) !== -1) {
            return false;
        }
        const eventArgs: IPinRowEventArgs = {
            insertAtIndex: index,
            isPinned: true,
            rowID,
            row
        };
        this.rowPinning.emit(eventArgs);

        this.crudService.endEdit(false);

        const insertIndex = typeof eventArgs.insertAtIndex === 'number' ? eventArgs.insertAtIndex : this._pinnedRecordIDs.length;
        this._pinnedRecordIDs.splice(insertIndex, 0, rowID);
        this.pipeTrigger++;
        if (this.gridAPI.grid) {
            this.notifyChanges();
        }
        return true;
    }

    /**
     * Unpin the row by its id.
     *
     * @remarks
     * ID is either the primaryKey value or the data record instance.
     * @example
     * ```typescript
     * this.grid.unpinRow(rowID);
     * ```
     * @param rowID The row id - primaryKey value or the data record instance.
     */
    public unpinRow(rowID: any, row?: RowType): boolean {
        const index = this._pinnedRecordIDs.indexOf(rowID);
        if (index === -1) {
            return false;
        }
        const eventArgs: IPinRowEventArgs = {
            isPinned: false,
            rowID,
            row
        };
        this.rowPinning.emit(eventArgs);
        this.crudService.endEdit(false);
        this._pinnedRecordIDs.splice(index, 1);
        this.pipeTrigger++;
        if (this.gridAPI.grid) {
            this.cdr.detectChanges();
        }
        return true;
    }

    public get pinnedRowHeight() {
        const containerHeight = this.pinContainer ? this.pinContainer.nativeElement.offsetHeight : 0;
        return this.hasPinnedRecords ? containerHeight : 0;
    }

    public get totalHeight() {
        return this.calcHeight ? this.calcHeight + this.pinnedRowHeight : this.calcHeight;
    }

    /**
     * Recalculates grid width/height dimensions.
     *
     * @remarks
     * Should be run when changing DOM elements dimentions manually that affect the grid's size.
     * @example
     * ```typescript
     * this.grid.reflow();
     * ```
     */
    public reflow() {
        this.calculateGridSizes();
    }

    /**
     * Finds the next occurrence of a given string in the grid and scrolls to the cell if it isn't visible.
     *
     * @remarks
     * Returns how many times the grid contains the string.
     * @example
     * ```typescript
     * this.grid.findNext("financial");
     * ```
     * @param text the string to search.
     * @param caseSensitive optionally, if the search should be case sensitive (defaults to false).
     * @param exactMatch optionally, if the text should match the entire value  (defaults to false).
     */
    public findNext(text: string, caseSensitive?: boolean, exactMatch?: boolean): number {
        return this.find(text, 1, caseSensitive, exactMatch);
    }

    /**
     * Finds the previous occurrence of a given string in the grid and scrolls to the cell if it isn't visible.
     *
     * @remarks
     * Returns how many times the grid contains the string.
     * @example
     * ```typescript
     * this.grid.findPrev("financial");
     * ```
     * @param text the string to search.
     * @param caseSensitive optionally, if the search should be case sensitive (defaults to false).
     * @param exactMatch optionally, if the text should match the entire value (defaults to false).
     */
    public findPrev(text: string, caseSensitive?: boolean, exactMatch?: boolean): number {
        return this.find(text, -1, caseSensitive, exactMatch);
    }

    /**
     * Reapplies the existing search.
     *
     * @remarks
     * Returns how many times the grid contains the last search.
     * @example
     * ```typescript
     * this.grid.refreshSearch();
     * ```
     * @param updateActiveInfo
     */
    public refreshSearch(updateActiveInfo?: boolean, endEdit = true): number {
        if (this.lastSearchInfo.searchText) {
            this.rebuildMatchCache();

            if (updateActiveInfo) {
                const activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(this.id);
                this.lastSearchInfo.matchInfoCache.forEach((match, i) => {
                    if (match.column === activeInfo.column &&
                        match.row === activeInfo.row &&
                        match.index === activeInfo.index &&
                        compareMaps(match.metadata, activeInfo.metadata)) {
                        this.lastSearchInfo.activeMatchIndex = i;
                    }
                });
            }

            return this.find(this.lastSearchInfo.searchText,
                0,
                this.lastSearchInfo.caseSensitive,
                this.lastSearchInfo.exactMatch,
                false,
                endEdit);
        } else {
            return 0;
        }
    }

    /**
     * Removes all the highlights in the cell.
     *
     * @example
     * ```typescript
     * this.grid.clearSearch();
     * ```
     */
    public clearSearch() {
        this.lastSearchInfo = {
            searchText: '',
            caseSensitive: false,
            exactMatch: false,
            activeMatchIndex: 0,
            matchInfoCache: []
        };

        this.rowList.forEach((row) => {
            if (row.cells) {
                row.cells.forEach((c) => {
                    c.clearHighlight();
                });
            }
        });
    }

    /**
     * Returns if the `IgxGridComponent` has sortable columns.
     *
     * @example
     * ```typescript
     * const sortableGrid = this.grid.hasSortableColumns;
     * ```
     */
    public get hasSortableColumns(): boolean {
        return this.columnList.some((col) => col.sortable);
    }

    /**
     * Returns if the `IgxGridComponent` has editable columns.
     *
     * @example
     * ```typescript
     * const editableGrid = this.grid.hasEditableColumns;
     * ```
     */
    public get hasEditableColumns(): boolean {
        return this.columnList.some((col) => col.editable);
    }

    /**
     * Returns if the `IgxGridComponent` has filterable columns.
     *
     * @example
     * ```typescript
     * const filterableGrid = this.grid.hasFilterableColumns;
     * ```
     */
    public get hasFilterableColumns(): boolean {
        return this.columnList.some((col) => col.filterable);
    }

    /**
     * Returns if the `IgxGridComponent` has summarized columns.
     *
     * @example
     * ```typescript
     * const summarizedGrid = this.grid.hasSummarizedColumns;
     * ```
     */
    public get hasSummarizedColumns(): boolean {
        return this.summaryService.hasSummarizedColumns;
    }

    /**
     * @hidden @internal
     */
    public get rootSummariesEnabled(): boolean {
        return this.summaryCalculationMode !== GridSummaryCalculationMode.childLevelsOnly;
    }

    /**
     * @hidden @internal
     */
    public get hasVisibleColumns(): boolean {
        if (this._hasVisibleColumns === undefined) {
            return this.columnList ? this.columnList.some(c => !c.hidden) : false;
        }
        return this._hasVisibleColumns;
    }

    public set hasVisibleColumns(value) {
        this._hasVisibleColumns = value;
    }
    /**
     * Returns if the `IgxGridComponent` has moveable columns.
     *
     * @example
     * ```typescript
     * const movableGrid = this.grid.hasMovableColumns;
     * ```
     */
    public get hasMovableColumns(): boolean {
        return this.columnList && this.columnList.some((col) => col.movable);
    }

    /**
     * Returns if the `IgxGridComponent` has column groups.
     *
     * @example
     * ```typescript
     * const groupGrid = this.grid.hasColumnGroups;
     * ```
     */
    public get hasColumnGroups(): boolean {
        return this._columnGroups;
    }
    /**
     * Returns if the `IgxGridComponent` has column layouts for multi-row layout definition.
     *
     * @example
     * ```typescript
     * const layoutGrid = this.grid.hasColumnLayouts;
     * ```
     */
    public get hasColumnLayouts() {
        return !!this.columnList.some(col => col.columnLayout);
    }

    /**
     * Returns an array of the selected `IgxGridCellComponent`s.
     *
     * @example
     * ```typescript
     * const selectedCells = this.grid.selectedCells;
     * ```
     */
    public get selectedCells(): IgxGridCellComponent[] | any[] {
        if (this.dataRowList) {
            return this.dataRowList.map((row) => row.cells.filter((cell) => cell.selected))
                .reduce((a, b) => a.concat(b), []);
        }
        return [];
    }

    /**
     * @hidden @internal
     */
    public get multiRowLayoutRowSize() {
        return this._multiRowLayoutRowSize;
    }

    /**
     * @hidden
     */
    protected get rowBasedHeight() {
        return this.dataLength * this.rowHeight;
    }

    /**
     * @hidden
     */
    protected get isPercentWidth() {
        return this.width && this.width.indexOf('%') !== -1;
    }

    /**
     * @hidden @internal
     */
    public get isPercentHeight() {
        return this._height && this._height.indexOf('%') !== -1;
    }

    /**
     * @hidden
     */
    protected get defaultTargetBodyHeight(): number {
        const allItems = this.dataLength;
        return this.renderedRowHeight * Math.min(this._defaultTargetRecordNumber,
            this.paging ? Math.min(allItems, this.perPage) : allItems);
    }

    /**
     * @hidden @internal
     * The rowHeight input is bound to min-height css prop of rows that adds a 1px border in all cases
     */
    public get renderedRowHeight(): number {
        return this.rowHeight + 1;
    }

    /**
     * @hidden @internal
     */
    public get outerWidth() {
        return this.hasVerticalScroll() ? this.calcWidth + this.scrollSize : this.calcWidth;
    }

    /**
     * @hidden @internal
     * Gets the visible content height that includes header + tbody + footer.
     */
    public getVisibleContentHeight() {
        let height = this.theadRow.nativeElement.clientHeight + this.tbody.nativeElement.clientHeight;
        if (this.hasSummarizedColumns) {
            height += this.tfoot.nativeElement.clientHeight;
        }
        return height;
    }

    /**
     * @hidden @internal
     */
    public getPossibleColumnWidth(baseWidth: number = null) {
        let computedWidth;
        if (baseWidth !== null) {
            computedWidth = baseWidth;
        } else {
            computedWidth = this.calcWidth ||
                parseInt(this.document.defaultView.getComputedStyle(this.nativeElement).getPropertyValue('width'), 10);
        }

        computedWidth -= this.featureColumnsWidth();

        const visibleChildColumns = this.visibleColumns.filter(c => !c.columnGroup);


        // Column layouts related
        let visibleCols = [];
        const columnBlocks = this.visibleColumns.filter(c => c.columnGroup);
        const colsPerBlock = columnBlocks.map(block => block.getInitialChildColumnSizes(block.children));
        const combinedBlocksSize = colsPerBlock.reduce((acc, item) => acc + item.length, 0);
        colsPerBlock.forEach(blockCols => visibleCols = visibleCols.concat(blockCols));
        //

        const columnsWithSetWidths = this.hasColumnLayouts ?
            visibleCols.filter(c => c.widthSetByUser) :
            visibleChildColumns.filter(c => c.widthSetByUser);

        const columnsToSize = this.hasColumnLayouts ?
            combinedBlocksSize - columnsWithSetWidths.length :
            visibleChildColumns.length - columnsWithSetWidths.length;
        const sumExistingWidths = columnsWithSetWidths
            .reduce((prev, curr) => {
                const colWidth = curr.width;
                const widthValue = parseInt(colWidth, 10);
                const currWidth = colWidth && typeof colWidth === 'string' && colWidth.indexOf('%') !== -1 ?
                    widthValue / 100 * computedWidth :
                    widthValue;
                return prev + currWidth;
            }, 0);

        // When all columns are hidden, return 0px width
        if (!sumExistingWidths && !columnsToSize) {
            return '0px';
        }

        const columnWidth = Math.floor(!Number.isFinite(sumExistingWidths) ?
            Math.max(computedWidth / columnsToSize, MINIMUM_COLUMN_WIDTH) :
            Math.max((computedWidth - sumExistingWidths) / columnsToSize, MINIMUM_COLUMN_WIDTH));

        return columnWidth + 'px';
    }

    /**
     * @hidden @internal
     */
    public hasVerticalScroll() {
        if (this._init) {
            return false;
        }
        const isScrollable = this.verticalScrollContainer ? this.verticalScrollContainer.isScrollable() : false;
        return !!(this.calcWidth && this.dataView && this.dataView.length > 0 && isScrollable);
    }

    /**
     * Gets calculated width of the pinned area.
     *
     * @example
     * ```typescript
     * const pinnedWidth = this.grid.getPinnedWidth();
     * ```
     * @param takeHidden If we should take into account the hidden columns in the pinned area.
     */
    public getPinnedWidth(takeHidden = false) {
        const fc = takeHidden ? this._pinnedColumns : this.pinnedColumns;
        let sum = 0;
        for (const col of fc) {
            if (col.level === 0) {
                sum += parseInt(col.calcWidth, 10);
            }
        }
        if (this.isPinningToStart) {
            sum += this.featureColumnsWidth();
        }

        return sum;
    }

    /**
     * @hidden @internal
     */
    public isColumnGrouped(_fieldName: string): boolean {
        return false;
    }

    /**
     * @hidden @internal
     * TODO: REMOVE
     */
    public onHeaderSelectorClick(event) {
        if (!this.isMultiRowSelectionEnabled) {
            return;
        }
        if (this.selectionService.areAllRowSelected()) {
            this.selectionService.clearRowSelection(event);
        } else {
            this.selectionService.selectAllRows(event);
        }
    }

    /**
     * @hidden @internal
     */
    public get headSelectorBaseAriaLabel() {
        if (this._filteringExpressionsTree.filteringOperands.length > 0) {
            return this.selectionService.areAllRowSelected() ? 'Deselect all filtered' : 'Select all filtered';
        }

        return this.selectionService.areAllRowSelected() ? 'Deselect all' : 'Select all';
    }

    /**
     * @hidden
     * @internal
     */
    public get totalRowsCountAfterFilter() {
        if (this.data) {
            return this.selectionService.allData.length;
        }

        return 0;
    }

    /**
     * Returns the currently transformed paged/filtered/sorted/grouped pinned row data, displayed in the grid.
     *
     * @example
     * ```typescript
     *      const pinnedDataView = this.grid.pinnedDataView;
     * ```
     */
    public get pinnedDataView(): any[] {
        return this.pinnedRecords ? this.pinnedRecords : [];
    }

    /**
     * Returns currently transformed paged/filtered/sorted/grouped unpinned row data, displayed in the grid.
     *
     * @example
     * ```typescript
     *      const pinnedDataView = this.grid.pinnedDataView;
     * ```
     */
    public get unpinnedDataView(): any[] {
        return this.unpinnedRecords ? this.unpinnedRecords : this.verticalScrollContainer.igxForOf || [];
    }

    /**
     * Returns the currently transformed paged/filtered/sorted/grouped/pinned/unpinned row data, displayed in the grid.
     *
     * @example
     * ```typescript
     *      const dataView = this.grid.dataView;
     * ```
     */
    public get dataView(): any[] {
        return this.isRowPinningToTop ?
            [...this.pinnedDataView, ...this.unpinnedDataView] :
            [...this.unpinnedDataView, ...this.pinnedDataView];
    }

    /**
     * Gets/Sets whether clicking over a row should select/deselect it
     *
     * @remarks
     * By default it is set to true
     * @param enabled: boolean
     */
    @WatchChanges()
    @Input()
    public get selectRowOnClick() {
        return this._selectRowOnClick;
    }

    public set selectRowOnClick(enabled: boolean) {
        this._selectRowOnClick = enabled;
    }

    /**
     * Select specified rows by ID.
     *
     * @example
     * ```typescript
     * this.grid.selectRows([1,2,5], true);
     * ```
     * @param rowIDs
     * @param clearCurrentSelection if true clears the current selection
     */
    public selectRows(rowIDs: any[], clearCurrentSelection?: boolean) {
        this.selectionService.selectRowsWithNoEvent(rowIDs, clearCurrentSelection);
        this.notifyChanges();
    }

    /**
     * Deselect specified rows by ID.
     *
     * @example
     * ```typescript
     * this.grid.deselectRows([1,2,5]);
     * ```
     * @param rowIDs
     */
    public deselectRows(rowIDs: any[]) {
        this.selectionService.deselectRowsWithNoEvent(rowIDs);
        this.notifyChanges();
    }

    /**
     * Selects all rows
     *
     * @remarks
     * By default if filtering is in place, selectAllRows() and deselectAllRows() select/deselect all filtered rows.
     * If you set the parameter onlyFilterData to false that will select all rows in the grid exept deleted rows.
     * @example
     * ```typescript
     * this.grid.selectAllRows();
     * this.grid.selectAllRows(false);
     * ```
     * @param onlyFilterData
     */
    public selectAllRows(onlyFilterData = true) {
        const data = onlyFilterData && this.filteredData ? this.filteredData : this.gridAPI.get_all_data(true);
        const rowIDs = this.selectionService.getRowIDs(data).filter(rID => !this.gridAPI.row_deleted_transaction(rID));
        this.selectRows(rowIDs);
    }

    /**
     * Deselects all rows
     *
     * @remarks
     * By default if filtering is in place, selectAllRows() and deselectAllRows() select/deselect all filtered rows.
     * If you set the parameter onlyFilterData to false that will deselect all rows in the grid exept deleted rows.
     * @example
     * ```typescript
     * this.grid.deselectAllRows();
     * ```
     * @param onlyFilterData
     */
    public deselectAllRows(onlyFilterData = true) {
        if (onlyFilterData && this.filteredData && this.filteredData.length > 0) {
            this.deselectRows(this.selectionService.getRowIDs(this.filteredData));
        } else {
            this.selectionService.clearAllSelectedRows();
            this.notifyChanges();
        }
    }

    /**
     * @hidden @internal
     */
    public clearCellSelection(): void {
        this.selectionService.clear(true);
        this.notifyChanges();
    }

    /**
     * @hidden @internal
     */
    public dragScroll(delta: { left: number; top: number }): void {
        const horizontal = this.headerContainer.getScroll();
        const vertical = this.verticalScrollContainer.getScroll();
        const { left, top } = delta;

        horizontal.scrollLeft += left * this.DRAG_SCROLL_DELTA;
        vertical.scrollTop += top * this.DRAG_SCROLL_DELTA;
    }

    /**
     * @hidden @internal
     */
    public isDefined(arg: any): boolean {
        return arg !== undefined && arg !== null;
    }

    /**
     * @hidden @internal
     */
    public selectRange(arg: GridSelectionRange | GridSelectionRange[] | null | undefined): void {
        if (!this.isDefined(arg)) {
            this.clearCellSelection();
            return;
        }
        if (arg instanceof Array) {
            arg.forEach(range => this.setSelection(range));
        } else {
            this.setSelection(arg);
        }
        this.notifyChanges();
    }

    /**
     * @hidden @internal
     */
    public columnToVisibleIndex(field: string | number): number {
        const visibleColumns = this.visibleColumns;
        if (typeof field === 'number') {
            return field;
        }
        return visibleColumns.find(column => column.field === field).visibleIndex;
    }

    /**
     * @hidden @internal
     */
    public setSelection(range: GridSelectionRange): void {
        const startNode = { row: range.rowStart, column: this.columnToVisibleIndex(range.columnStart) };
        const endNode = { row: range.rowEnd, column: this.columnToVisibleIndex(range.columnEnd) };

        this.selectionService.pointerState.node = startNode;
        this.selectionService.selectRange(endNode, this.selectionService.pointerState);
        this.selectionService.addRangeMeta(endNode, this.selectionService.pointerState);
        this.selectionService.initPointerState();
    }

    /**
     * @hidden @internal
     */
    public getSelectedRanges(): GridSelectionRange[] {
        return this.selectionService.ranges;
    }

    /**
     *
     * Returns an array of the current cell selection in the form of `[{ column.field: cell.value }, ...]`.
     *
     * @remarks
     * If `formatters` is enabled, the cell value will be formatted by its respective column formatter (if any).
     * If `headers` is enabled, it will use the column header (if any) instead of the column field.
     */
    public getSelectedData(formatters = false, headers = false) {
        const source = this.filteredSortedData;
        return this.extractDataFromSelection(source, formatters, headers);
    }

    /**
     * Get current selected columns.
     *
     * @example
     * Returns an array with selected columns
     * ```typescript
     * const selectedColumns = this.grid.selectedColumns();
     * ```
     */
    public selectedColumns(): IgxColumnComponent[] {
        const fields = this.selectionService.getSelectedColumns();
        return fields.map(field => this.getColumnByName(field)).filter(field => field);
    }

    /**
     * Select specified columns.
     *
     * @example
     * ```typescript
     * this.grid.selectColumns(['ID','Name'], true);
     * ```
     * @param columns
     * @param clearCurrentSelection if true clears the current selection
     */
    public selectColumns(columns: string[] | IgxColumnComponent[], clearCurrentSelection?: boolean) {
        let fieldToSelect: string[] = [];
        if (columns.length === 0 || typeof columns[0] === 'string') {
            fieldToSelect = columns as string[];
        } else {
            (columns as IgxColumnComponent[]).forEach(col => {
                if (col.columnGroup) {
                    const children = col.allChildren.filter(c => !c.columnGroup).map(c => c.field);
                    fieldToSelect = [...fieldToSelect, ...children];
                } else {
                    fieldToSelect.push(col.field);
                }
            });
        }

        this.selectionService.selectColumnsWithNoEvent(fieldToSelect, clearCurrentSelection);
        this.notifyChanges();
    }

    /**
     * Deselect specified columns by filed.
     *
     * @example
     * ```typescript
     * this.grid.deselectColumns(['ID','Name']);
     * ```
     * @param columns
     */
    public deselectColumns(columns: string[] | IgxColumnComponent[]) {
        let fieldToDeselect: string[] = [];
        if (columns.length === 0 || typeof columns[0] === 'string') {
            fieldToDeselect = columns as string[];
        } else {
            (columns as IgxColumnComponent[]).forEach(col => {
                if (col.columnGroup) {
                    const children = col.allChildren.filter(c => !c.columnGroup).map(c => c.field);
                    fieldToDeselect = [...fieldToDeselect, ...children];
                } else {
                    fieldToDeselect.push(col.field);
                }
            });
        }
        this.selectionService.deselectColumnsWithNoEvent(fieldToDeselect);
        this.notifyChanges();
    }

    /**
     * Deselects all columns
     *
     * @example
     * ```typescript
     * this.grid.deselectAllColumns();
     * ```
     */
    public deselectAllColumns() {
        this.selectionService.clearAllSelectedColumns();
        this.notifyChanges();
    }

    /**
     * Selects all columns
     *
     * @example
     * ```typescript
     * this.grid.deselectAllColumns();
     * ```
     */
    public selectAllColumns() {
        this.selectColumns(this.columnList.filter(c => !c.columnGroup));
    }

    /**
     *
     * Returns an array of the current columns selection in the form of `[{ column.field: cell.value }, ...]`.
     *
     * @remarks
     * If `formatters` is enabled, the cell value will be formatted by its respective column formatter (if any).
     * If `headers` is enabled, it will use the column header (if any) instead of the column field.
     */
    public getSelectedColumnsData(formatters = false, headers = false) {
        const source = this.filteredSortedData ? this.filteredSortedData : this.data;
        return this.extractDataFromColumnsSelection(source, formatters, headers);
    }


    public combineSelectedCellAndColumnData(columnData: any[], formatters = false, headers = false) {
        const source = this.filteredSortedData;
        return this.extractDataFromSelection(source, formatters, headers, columnData);
    }

    /**
     * @hidden @internal
     */
    public preventContainerScroll = (evt) => {
        if (evt.target.scrollTop !== 0) {
            this.verticalScrollContainer.addScrollTop(evt.target.scrollTop);
            evt.target.scrollTop = 0;
        }
        if (evt.target.scrollLeft !== 0) {
            this.headerContainer.scrollPosition += evt.target.scrollLeft;
            evt.target.scrollLeft = 0;
        }
    };

    /**
     * @hidden
     * @internal
     */
    public copyHandler(event) {
        const selectedColumns = this.gridAPI.grid.selectedColumns();
        const columnData = this.getSelectedColumnsData(this.clipboardOptions.copyFormatters, this.clipboardOptions.copyHeaders);
        const selectedData = this.getSelectedData(this.clipboardOptions.copyFormatters, this.clipboardOptions.copyHeaders);

        let data = [];
        let result;

        if (event.code === 'KeyC' && (event.ctrlKey || event.metaKey) && event.currentTarget.className === 'igx-grid-thead__wrapper') {
            if (selectedData.length) {
                if (columnData.length === 0) {
                    result = this.prepareCopyData(event, selectedData);
                } else {
                    data = this.combineSelectedCellAndColumnData(columnData, this.clipboardOptions.copyFormatters,
                        this.clipboardOptions.copyHeaders);
                    result = this.prepareCopyData(event, data[0], data[1]);
                }
            } else {
                data = columnData;
                result = this.prepareCopyData(event, data);
            }

            if (this.platform.isIE) {
                (window as any).clipboardData.setData('Text', result);
                return;
            }
            navigator.clipboard.writeText(result).then().catch(e => console.error(e));
        } else if (!this.clipboardOptions.enabled || this.crudService.cellInEditMode || (!this.platform.isIE && event.type === 'keydown')) {
            return;
        } else {
            if (selectedColumns.length) {
                data = this.combineSelectedCellAndColumnData(columnData, this.clipboardOptions.copyFormatters,
                    this.clipboardOptions.copyHeaders);
                result = this.prepareCopyData(event, data[0], data[1]);
            } else {
                data = selectedData;
                result = this.prepareCopyData(event, data);
            }

            if (this.platform.isIE) {
                (window as any).clipboardData.setData('Text', result);
                return;
            }
            event.clipboardData.setData('text/plain', result);
        }
    }

    /**
     * @hidden @internal
     */
    public prepareCopyData(event, data, keys?) {
        const ev = { data, cancel: false } as IGridClipboardEvent;
        this.gridCopy.emit(ev);

        if (ev.cancel) {
            return;
        }

        const transformer = new CharSeparatedValueData(ev.data, this.clipboardOptions.separator);
        let result = keys ? transformer.prepareData(keys) : transformer.prepareData();

        if (!this.clipboardOptions.copyHeaders) {
            result = result.substring(result.indexOf('\n') + 1);
        }

        event.preventDefault();

        /* Necessary for the hiearachical case but will probably have to
           change how getSelectedData is propagated in the hiearachical grid
        */
        event.stopPropagation();

        return result;
    }

    /**
     * @hidden @internal
     */
    public showSnackbarFor(index: number) {
        this.addRowSnackbar.actionText = index === -1 ? '' : this.snackbarActionText;
        this.lastAddedRowIndex = index;
        this.addRowSnackbar.open();
    }

    /**
     * Navigates to a position in the grid based on provided `rowindex` and `visibleColumnIndex`.
     *
     * @remarks
     * Also can execute a custom logic over the target element,
     * through a callback function that accepts { targetType: GridKeydownTargetType, target: Object }
     * @example
     * ```typescript
     *  this.grid.navigateTo(10, 3, (args) => { args.target.nativeElement.focus(); });
     * ```
     */
    public navigateTo(rowIndex: number, visibleColIndex = -1, cb: (args: any) => void = null) {
        const totalItems = (this as any).totalItemCount ?? this.dataView.length - 1;
        if (rowIndex < 0 || rowIndex > totalItems || (visibleColIndex !== -1
            && this.columnList.map(col => col.visibleIndex).indexOf(visibleColIndex) === -1)) {
            return;
        }
        if (this.dataView.slice(rowIndex, rowIndex + 1).find(rec => rec.expression || rec.childGridsData)) {
            visibleColIndex = -1;
        }
        // If the target row is pinned no need to scroll as well.
        const shouldScrollVertically = this.navigation.shouldPerformVerticalScroll(rowIndex, visibleColIndex);
        const shouldScrollHorizontally = this.navigation.shouldPerformHorizontalScroll(visibleColIndex, rowIndex);
        if (shouldScrollVertically) {
            this.navigation.performVerticalScrollToCell(rowIndex, visibleColIndex, () => {
                if (shouldScrollHorizontally) {
                    this.navigation.performHorizontalScrollToCell(visibleColIndex, () =>
                        this.executeCallback(rowIndex, visibleColIndex, cb));
                } else {
                    this.executeCallback(rowIndex, visibleColIndex, cb);
                }
            });
        } else if (shouldScrollHorizontally) {
            this.navigation.performHorizontalScrollToCell(visibleColIndex, () => {
                if (shouldScrollVertically) {
                    this.navigation.performVerticalScrollToCell(rowIndex, visibleColIndex, () =>
                        this.executeCallback(rowIndex, visibleColIndex, cb));
                } else {
                    this.executeCallback(rowIndex, visibleColIndex, cb);
                }
            });
        } else {
            this.executeCallback(rowIndex, visibleColIndex, cb);
        }
    }

    /**
     * Returns `ICellPosition` which defines the next cell,
     * according to the current position, that match specific criteria.
     *
     * @remarks
     * You can pass callback function as a third parameter of `getPreviousCell` method.
     * The callback function accepts IgxColumnComponent as a param
     * @example
     * ```typescript
     *  const nextEditableCellPosition = this.grid.getNextCell(0, 3, (column) => column.editable);
     * ```
     */
    public getNextCell(currRowIndex: number, curVisibleColIndex: number,
        callback: (IgxColumnComponent) => boolean = null): ICellPosition {
        const columns = this.columnList.filter(col => !col.columnGroup && col.visibleIndex >= 0);

        if (!this.isValidPosition(currRowIndex, curVisibleColIndex)) {
            return { rowIndex: currRowIndex, visibleColumnIndex: curVisibleColIndex };
        }
        const colIndexes = callback ? columns.filter((col) => callback(col)).map(editCol => editCol.visibleIndex).sort((a, b) => a - b) :
            columns.map(editCol => editCol.visibleIndex).sort((a, b) => a - b);
        const nextCellIndex = colIndexes.find(index => index > curVisibleColIndex);
        if (this.dataView.slice(currRowIndex, currRowIndex + 1)
            .find(rec => !rec.expression && !rec.summaries && !rec.childGridsData && !rec.detailsData) && nextCellIndex !== undefined) {
            return { rowIndex: currRowIndex, visibleColumnIndex: nextCellIndex };
        } else {
            if (colIndexes.length === 0 || this.getNextDataRowIndex(currRowIndex) === currRowIndex) {
                return { rowIndex: currRowIndex, visibleColumnIndex: curVisibleColIndex };
            } else {
                return { rowIndex: this.getNextDataRowIndex(currRowIndex), visibleColumnIndex: colIndexes[0] };
            }
        }
    }

    /**
     * Returns `ICellPosition` which defines the previous cell,
     * according to the current position, that match specific criteria.
     *
     * @remarks
     * You can pass callback function as a third parameter of `getPreviousCell` method.
     * The callback function accepts IgxColumnComponent as a param
     * @example
     * ```typescript
     *  const previousEditableCellPosition = this.grid.getPreviousCell(0, 3, (column) => column.editable);
     * ```
     */
    public getPreviousCell(currRowIndex: number, curVisibleColIndex: number,
        callback: (IgxColumnComponent) => boolean = null): ICellPosition {
        const columns = this.columnList.filter(col => !col.columnGroup && col.visibleIndex >= 0);

        if (!this.isValidPosition(currRowIndex, curVisibleColIndex)) {
            return { rowIndex: currRowIndex, visibleColumnIndex: curVisibleColIndex };
        }
        const colIndexes = callback ? columns.filter((col) => callback(col)).map(editCol => editCol.visibleIndex).sort((a, b) => b - a) :
            columns.map(editCol => editCol.visibleIndex).sort((a, b) => b - a);
        const prevCellIndex = colIndexes.find(index => index < curVisibleColIndex);
        if (this.dataView.slice(currRowIndex, currRowIndex + 1)
            .find(rec => !rec.expression && !rec.summaries && !rec.childGridsData && !rec.detailsData) && prevCellIndex !== undefined) {
            return { rowIndex: currRowIndex, visibleColumnIndex: prevCellIndex };
        } else {
            if (colIndexes.length === 0 || this.getNextDataRowIndex(currRowIndex, true) === currRowIndex) {
                return { rowIndex: currRowIndex, visibleColumnIndex: curVisibleColIndex };
            } else {
                return { rowIndex: this.getNextDataRowIndex(currRowIndex, true), visibleColumnIndex: colIndexes[0] };
            }
        }
    }

    /**
     * @hidden
     * @internal
     */
    public endRowEditTabStop(commit = true, event?: Event) {
        const canceled = this.crudService.endEdit(commit, event);

        if (canceled) {
            return true;
        }

        const activeCell = this.gridAPI.grid.navigation.activeNode;
        if (activeCell && activeCell.row !== -1) {
            this.tbody.nativeElement.focus();
        }
    }

    /**
     * @hidden @internal
     */
    public trackColumnChanges(index, col) {
        return col.field + col._calcWidth;
    }

    /**
     * @hidden
     */
    public isExpandedGroup(_group: IGroupByRecord): boolean {
        return undefined;
    }

    /**
     * @hidden @internal
     * TODO: MOVE to CRUD
     */
    public openRowOverlay(id) {
        this.configureRowEditingOverlay(id, this.rowList.length <= MIN_ROW_EDITING_COUNT_THRESHOLD);

        this.rowEditingOverlay.open(this.rowEditSettings);
        this.rowEditingOverlay.element.addEventListener('wheel', this.rowEditingWheelHandler.bind(this));
    }

    /**
     * @hidden @internal
     */
        public closeRowEditingOverlay() {
        this.rowEditingOverlay.element.removeEventListener('wheel', this.rowEditingWheelHandler);
        this.rowEditPositioningStrategy.isTopInitialPosition = null;
        this.rowEditingOverlay.close();
        this.rowEditingOverlay.element.parentElement.style.display = '';
    }

    /**
     * @hidden @internal
     */
    public toggleRowEditingOverlay(show) {
        const rowStyle = this.rowEditingOverlay.element.style;
        if (show) {
            rowStyle.display = 'block';
        } else {
            rowStyle.display = 'none';
        }
    }

    /**
     * @hidden @internal
     */
    public repositionRowEditingOverlay(row: IgxRowDirective<IgxGridBaseDirective & GridType>) {
        if (row && !this.rowEditingOverlay.collapsed) {
            const rowStyle = this.rowEditingOverlay.element.parentElement.style;
            if (row) {
                rowStyle.display = '';
                this.configureRowEditingOverlay(row.rowID);
                this.rowEditingOverlay.reposition();
            } else {
                rowStyle.display = 'none';
            }
        }
    }

    /**
     * @hidden @internal
     */
    public cachedViewLoaded(args: ICachedViewLoadedEventArgs) {
        if (this.hasHorizontalScroll()) {
            const tmplId = args.context.templateID;
            const index = args.context.index;
            args.view.detectChanges();
            this.zone.onStable.pipe(first()).subscribe(() => {
                const row = tmplId === 'dataRow' ? this.gridAPI.get_row_by_index(index) : null;
                const summaryRow = tmplId === 'summaryRow' ? this.summariesRowList.find((sr) => sr.dataRowIndex === index) : null;
                if (row && row instanceof IgxRowDirective) {
                    this._restoreVirtState(row);
                } else if (summaryRow) {
                    this._restoreVirtState(summaryRow);
                }
            });
        }
    }

    /**
     * Opens the advanced filtering dialog.
     */
    public openAdvancedFilteringDialog(overlaySettings?: OverlaySettings) {
        const settings = overlaySettings ? overlaySettings : this._advancedFilteringOverlaySettings;
        if (!this._advancedFilteringOverlayId) {
            this._advancedFilteringOverlaySettings.target =
                (this as any).rootGrid ? (this as any).rootGrid.nativeElement : this.nativeElement;
            this._advancedFilteringOverlaySettings.outlet = this.outlet;

            this._advancedFilteringOverlayId = this.overlayService.attach(
                IgxAdvancedFilteringDialogComponent,
                settings,
                {
                    injector: this.viewRef.injector,
                    componentFactoryResolver: this.resolver
                });
            this.overlayService.show(this._advancedFilteringOverlayId);
        }
    }

    /**
     * Closes the advanced filtering dialog.
     *
     * @param applyChanges indicates whether the changes should be applied
     */
    public closeAdvancedFilteringDialog(applyChanges: boolean) {
        if (this._advancedFilteringOverlayId) {
            const advancedFilteringOverlay = this.overlayService.getOverlayById(this._advancedFilteringOverlayId);
            const advancedFilteringDialog = advancedFilteringOverlay.componentRef.instance as IgxAdvancedFilteringDialogComponent;

            if (applyChanges) {
                advancedFilteringDialog.applyChanges();
            }
            advancedFilteringDialog.closeDialog();
        }
    }

    public getEmptyRecordObjectFor(rec) {
        const row = { ...rec };
        Object.keys(row).forEach(key => row[key] = undefined);
        row[this.primaryKey] = this.generateRowID();
        return row;
    }

    /**
     * @hidden @internal
     */
    public hasHorizontalScroll() {
        return this.totalWidth - this.unpinnedWidth > 0;
    }

    /**
     * @hidden @internal
     */
    public isSummaryRow(rowData): boolean {
        return rowData.summaries && (rowData.summaries instanceof Map);
    }

    /**
     * @hidden @internal
     */
    public triggerPipes() {
        this.pipeTrigger++;
        this.cdr.detectChanges();
    }

    /**
     * @hidden
     */
     public rowEditingWheelHandler(event: WheelEvent) {
        if (event.deltaY > 0) {
            this.verticalScrollContainer.scrollNext();
        } else {
            this.verticalScrollContainer.scrollPrev();
        }
    }

    /**
     * Finishes the row transactions on the current row.
     *
     * @remarks
     * If `commit === true`, passes them from the pending state to the data (or transaction service)
     * @example
     * ```html
     * <button igxButton (click)="grid.endEdit(true)">Commit Row</button>
     * ```
     * @param commit
     */
    // TODO: Facade for crud service refactoring. To be removed
    // TODO: do not remove this, as it is used in rowEditTemplate, but mark is as internal and hidden
    public endEdit(commit = true, event?: Event) {
        this.crudService.endEdit(commit, event);
    }

    protected writeToData(rowIndex: number, value: any) {
        mergeObjects(this.gridAPI.get_all_data()[rowIndex], value);
    }

    protected getUnpinnedIndexById(id) {
        return this.unpinnedRecords.findIndex(x => x[this.primaryKey] === id);
    }

    protected _restoreVirtState(row) {
        // check virtualization state of data record added from cache
        // in case state is no longer valid - update it.
        const rowForOf = row.virtDirRow;
        const gridScrLeft = rowForOf.getScroll().scrollLeft;
        const left = -parseInt(rowForOf.dc.instance._viewContainer.element.nativeElement.style.left, 10);
        const actualScrollLeft = left + rowForOf.getColumnScrollLeft(rowForOf.state.startIndex);
        if (gridScrLeft !== actualScrollLeft) {
            rowForOf.onHScroll(gridScrLeft);
            rowForOf.cdr.detectChanges();
        }
    }

    /**
     * @hidden
     */
    protected getExportExcel(): boolean {
        return this._exportExcel;
    }

    /**
     * @hidden
     */
    protected getExportCsv(): boolean {
        return this._exportCsv;
    }

    protected changeRowEditingOverlayStateOnScroll(row: IgxRowDirective<IgxGridBaseDirective & GridType>) {
        if (!this.rowEditable || !this.rowEditingOverlay || this.rowEditingOverlay.collapsed) {
            return;
        }
        if (!row) {
            this.toggleRowEditingOverlay(false);
        } else {
            this.repositionRowEditingOverlay(row);
        }
    }

    /**
     * Should be called when data and/or isLoading input changes so that the overlay can be
     * hidden/shown based on the current value of shouldOverlayLoading
     */
    protected evaluateLoadingState() {
        if (this.shouldOverlayLoading) {
            // a new overlay should be shown
            const overlaySettings: OverlaySettings = {
                outlet: this.loadingOutlet,
                closeOnOutsideClick: false,
                positionStrategy: new ContainerPositionStrategy()
            };
            this.loadingOverlay.open(overlaySettings);
        } else {
            this.loadingOverlay.close();
        }
    }

    /**
     * @hidden
     * Sets grid width i.e. this.calcWidth
     */
    protected calculateGridWidth() {
        let width;

        if (this.isPercentWidth) {
            /* width in %*/
            const computed = this.document.defaultView.getComputedStyle(this.nativeElement).getPropertyValue('width');
            width = computed.indexOf('%') === -1 ? parseInt(computed, 10) : null;
        } else {
            width = parseInt(this.width, 10);
        }

        if (!width && this.nativeElement) {
            width = this.nativeElement.offsetWidth;
        }


        if (this.width === null || !width) {
            width = this.getColumnWidthSum();
        }

        if (this.hasVerticalScroll() && this.width !== null) {
            width -= this.scrollSize;
        }
        if ((Number.isFinite(width) || width === null) && width !== this.calcWidth) {
            this.calcWidth = width;
        }
        this._derivePossibleWidth();
    }

    /**
     * @hidden
     * Sets columns defaultWidth property
     */
    protected _derivePossibleWidth() {
        if (!this.columnWidthSetByUser) {
            this._columnWidth = this.width !== null ? this.getPossibleColumnWidth() : MINIMUM_COLUMN_WIDTH + 'px';
        }
        this.columnList.forEach((column: IgxColumnComponent) => {
            if (this.hasColumnLayouts && parseInt(this._columnWidth, 10)) {
                const columnWidthCombined = parseInt(this._columnWidth, 10) * (column.colEnd ? column.colEnd - column.colStart : 1);
                column.defaultWidth = columnWidthCombined + 'px';
            } else {
                // D.K. March 29th, 2021 #9145 Consider min/max width when setting defaultWidth property
                column.defaultWidth = this.getExtremumBasedColWidth(column);
                column.resetCaches();
            }
        });
        this.resetCachedWidths();
    }

    /**
     * @hidden
     * @internal
     */
    protected getExtremumBasedColWidth(column: IgxColumnComponent): string {
        let width = this._columnWidth;
        if (width && typeof width !== 'string') {
            width = String(width);
        }
        const minWidth = width.indexOf('%') === -1 ? column.minWidthPx : column.minWidthPercent;
        const maxWidth = width.indexOf('%') === -1 ? column.maxWidthPx : column.maxWidthPercent;
        if (column.hidden) {
            return width;
        }

        if (minWidth > parseFloat(width)) {
            width = String(column.minWidth);
        } else if (maxWidth < parseFloat(width)) {
            width = String(column.maxWidth);
        }

        // if no px or % are defined in maxWidth/minWidth consider it px
        if (width.indexOf('%') === -1 && width.indexOf('px') === -1) {
            width += 'px';
        }
        return width;
    }

    protected resetNotifyChanges() {
        this._cdrRequestRepaint = false;
        this._cdrRequests = false;
    }

    protected resolveOutlet() {
        return this._userOutletDirective ? this._userOutletDirective : this._outletDirective;
    }

    /**
     * Reorder columns in the main columnList and _columns collections.
     *
     * @hidden
     */
    protected _moveColumns(from: IgxColumnComponent, to: IgxColumnComponent, pos: DropPosition) {
        const list = this.columnList.toArray();
        this._reorderColumns(from, to, pos, list);
        const newList = this._resetColumnList(list);
        this.columnList.reset(newList);
        this.columnList.notifyOnChanges();
        this._columns = this.columnList.toArray();
    }

    /**
     * @hidden
     */
    protected _resetColumnList(list?) {
        if (!list) {
            list = this.columnList.toArray();
        }
        let newList = [];
        list.filter(c => c.level === 0).forEach(p => {
            newList.push(p);
            if (p.columnGroup) {
                newList = newList.concat(p.allChildren);
            }
        });
        return newList;
    }

    /**
     * Reorders columns inside the passed column collection.
     * When reordering column group collection, the collection is not flattened.
     * In all other cases, the columns collection is flattened, this is why adittional calculations on the dropIndex are done.
     *
     * @hidden
     */
    protected _reorderColumns(from: IgxColumnComponent, to: IgxColumnComponent, position: DropPosition, columnCollection: any[],
        inGroup = false) {
        const fromIndex = columnCollection.indexOf(from);
        const childColumnsCount = inGroup ? 1 : from.allChildren.length + 1;
        columnCollection.splice(fromIndex, childColumnsCount);
        let dropIndex = columnCollection.indexOf(to);
        if (position === DropPosition.AfterDropTarget) {
            dropIndex++;
            if (!inGroup && to.columnGroup) {
                dropIndex += to.allChildren.length;
            }
        }
        columnCollection.splice(dropIndex, 0, from);
    }

    /**
     * Reorder column group collection.
     *
     * @hidden
     */
    protected _moveChildColumns(parent: IgxColumnComponent, from: IgxColumnComponent, to: IgxColumnComponent, pos: DropPosition) {
        const buffer = parent.children.toArray();
        this._reorderColumns(from, to, pos, buffer, true);
        parent.children.reset(buffer);
    }

    protected setupColumns() {
        if (this.autoGenerate) {
            this.autogenerateColumns();
        }

        this.initColumns(this.columnList, (col: IgxColumnComponent) => this.columnInit.emit(col));
        this.columnListDiffer.diff(this.columnList);

        this.columnList.changes
            .pipe(takeUntil(this.destroy$))
            .subscribe((change: QueryList<IgxColumnComponent>) => {
                this.onColumnsChanged(change);
            });
    }

    /**
     * @hidden
     */
    protected deleteRowFromData(rowID: any, index: number) {
        //  if there is a row (index !== 0) delete it
        //  if there is a row in ADD or UPDATE state change it's state to DELETE
        if (index !== -1) {
            if (this.transactions.enabled) {
                const transaction: Transaction = { id: rowID, type: TransactionType.DELETE, newValue: null };
                this.transactions.add(transaction, this.data[index]);
            } else {
                this.data.splice(index, 1);
            }
        } else {
            const state: State = this.transactions.getState(rowID);
            this.transactions.add({ id: rowID, type: TransactionType.DELETE, newValue: null }, state && state.recordRef);
        }
    }


    /**
     * @hidden @internal
     */
    protected getDataBasedBodyHeight(): number {
        return !this.data || (this.data.length < this._defaultTargetRecordNumber) ?
            0 : this.defaultTargetBodyHeight;
    }

    /**
     * @hidden @internal
     */
    protected onPinnedRowsChanged(change: QueryList<IgxGridRowComponent>) {
        const diff = this.rowListDiffer.diff(change);
        if (diff) {
            this.notifyChanges(true);
        }
    }

    /**
     * @hidden
     */
    protected onColumnsChanged(change: QueryList<IgxColumnComponent>) {
        const diff = this.columnListDiffer.diff(change);

        if (this.autoGenerate && this.columnList.length === 0 && this._autoGeneratedCols.length > 0) {
            // In Ivy if there are nested conditional templates the content children are re-evaluated
            // hence autogenerated columns are cleared and need to be reset.
            this.columnList.reset(this._autoGeneratedCols);
            return;
        }
        if (diff) {
            let added = false;
            let removed = false;
            diff.forEachAddedItem((record: IterableChangeRecord<IgxColumnComponent>) => {
                this.columnInit.emit(record.item);
                added = true;
                if (record.item.pinned) {
                    this._pinnedColumns.push(record.item);
                } else {
                    this._unpinnedColumns.push(record.item);
                }
            });

            this.initColumns(this.columnList);

            diff.forEachRemovedItem((record: IterableChangeRecord<IgxColumnComponent | IgxColumnGroupComponent>) => {
                const isColumnGroup = record.item instanceof IgxColumnGroupComponent;
                if (!isColumnGroup) {
                    // Clear Grouping
                    this.gridAPI.clear_groupby(record.item.field);

                    // Clear Filtering
                    this.filteringService.clear_filter(record.item.field);

                    // Close filter row
                    if (this.filteringService.isFilterRowVisible
                        && this.filteringService.filteredColumn
                        && this.filteringService.filteredColumn.field === record.item.field) {
                        this.filteringRow.close();
                    }

                    // Clear Sorting
                    this.gridAPI.clear_sort(record.item.field);

                    // Remove column selection
                    this.selectionService.deselectColumnsWithNoEvent([record.item.field]);
                }
                removed = true;
            });

            this.resetCaches();

            if (added || removed) {
                this.summaryService.clearSummaryCache();
                Promise.resolve().then(() => {
                    // `onColumnsChanged` can be executed midway a current detectChange cycle and markForCheck will be ignored then.
                    // This ensures that we will wait for the current cycle to end so we can trigger a new one and ngDoCheck to fire.
                    this.notifyChanges(true);
                });
            }
        }
    }

    /**
     * @hidden
     */
    protected calculateGridSizes(recalcFeatureWidth = true) {
        /*
            TODO: (R.K.) This layered lasagne should be refactored
            ASAP. The reason I have to reset the caches so many times is because
            after teach `detectChanges` call they are filled with invalid
            state. Of course all of this happens midway through the grid
            sizing process which of course, uses values from the caches, thus resulting
            in a broken layout.
        */
        this.resetCaches(recalcFeatureWidth);
        this.cdr.detectChanges();
        const hasScroll = this.hasVerticalScroll();
        this.calculateGridWidth();
        this.resetCaches(recalcFeatureWidth);
        this.cdr.detectChanges();
        this.calculateGridHeight();

        if (this.rowEditable) {
            this.repositionRowEditingOverlay(this.crudService.rowInEditMode);
        }

        if (this.filteringService.isFilterRowVisible) {
            this.filteringRow.resetChipsArea();
        }

        this.cdr.detectChanges();
        // in case scrollbar has appeared recalc to size correctly.
        if (hasScroll !== this.hasVerticalScroll()) {
            this.calculateGridWidth();
            this.cdr.detectChanges();
        }
        if (this.zone.isStable) {
            this.zone.run(() => {
                this._applyWidthHostBinding();
                this.cdr.detectChanges();
            });
        } else {
            this.zone.onStable.pipe(first()).subscribe(() => {
                this.zone.run(() => {
                    this._applyWidthHostBinding();
                });
            });
        }
        this.resetCaches(recalcFeatureWidth);
    }

    /**
     * @hidden
     * @internal
     */
    protected calcGridHeadRow() {
        if (this.maxLevelHeaderDepth) {
            this._baseFontSize = parseFloat(getComputedStyle(this.document.documentElement).getPropertyValue('font-size'));
            let minSize = (this.maxLevelHeaderDepth + 1) * this.defaultRowHeight / this._baseFontSize;
            if (this._allowFiltering && this._filterMode === FilterMode.quickFilter) {
                minSize += (FILTER_ROW_HEIGHT + 1) / this._baseFontSize;
            }
            this.theadRow.nativeElement.style.minHeight = `${minSize}rem`;
        }
    }

    /**
     * @hidden
     * Sets TBODY height i.e. this.calcHeight
     */
    protected calculateGridHeight() {
        this.calcGridHeadRow();
        this.summariesHeight = 0;
        if (this.hasSummarizedColumns && this.rootSummariesEnabled) {
            this.summariesHeight = this.summaryService.calcMaxSummaryHeight();
        }

        this.calcHeight = this._calculateGridBodyHeight();
        if (this.pinnedRowHeight && this.calcHeight) {
            this.calcHeight -= this.pinnedRowHeight;
        }
    }

    /**
     * @hidden
     */
    protected getGroupAreaHeight(): number {
        return 0;
    }

    /**
     * @hidden
     */
    protected getComputedHeight(elem) {
        return elem.offsetHeight ? parseFloat(this.document.defaultView.getComputedStyle(elem).getPropertyValue('height')) : 0;
    }
    /**
     * @hidden
     */
    protected getFooterHeight(): number {
        return this.summariesHeight || this.getComputedHeight(this.tfoot.nativeElement);
    }
    /**
     * @hidden
     */
    protected getTheadRowHeight(): number {
        const height = this.getComputedHeight(this.theadRow.nativeElement);
        return (!this.allowFiltering || (this.allowFiltering && this.filterMode !== FilterMode.quickFilter)) ?
            height - this.getFilterCellHeight() :
            height;
    }

    /**
     * @hidden
     */
    protected getToolbarHeight(): number {
        let toolbarHeight = 0;
        if (this.toolbar.first) {
            toolbarHeight = this.getComputedHeight(this.toolbar.first.nativeElement);
        }
        return toolbarHeight;
    }

    /**
     * @hidden
     */
    protected getPagingFooterHeight(): number {
        let pagingHeight = 0;
        if (this.footer) {
            const height = this.getComputedHeight(this.footer.nativeElement);
            pagingHeight = this.footer.nativeElement.firstElementChild ?
                height : 0;
        }
        return pagingHeight;
    }

    /**
     * @hidden
     */
    protected getFilterCellHeight(): number {
        const headerGroupNativeEl = (this.headerGroupsList.length !== 0) ?
            this.headerGroupsList[0].nativeElement : null;
        const filterCellNativeEl = (headerGroupNativeEl) ?
            headerGroupNativeEl.querySelector('igx-grid-filtering-cell') as HTMLElement : null;
        return (filterCellNativeEl) ? filterCellNativeEl.offsetHeight : 0;
    }

    /**
     * @hidden
     */
    protected _calculateGridBodyHeight(): number {
        if (!this._height) {
            return null;
        }
        const actualTheadRow = this.getTheadRowHeight();
        const footerHeight = this.getFooterHeight();
        const toolbarHeight = this.getToolbarHeight();
        const pagingHeight = this.getPagingFooterHeight();
        const groupAreaHeight = this.getGroupAreaHeight();
        const scrHeight = this.getComputedHeight(this.scr.nativeElement);
        const renderedHeight = toolbarHeight + actualTheadRow +
            footerHeight + pagingHeight + groupAreaHeight +
            scrHeight;

        let gridHeight = 0;

        if (this.isPercentHeight) {
            const computed = this.document.defaultView.getComputedStyle(this.nativeElement).getPropertyValue('height');
            const autoSize = this._shouldAutoSize(renderedHeight);
            if (autoSize || computed.indexOf('%') !== -1) {
                const bodyHeight = this.getDataBasedBodyHeight();
                return bodyHeight > 0 ? bodyHeight : null;
            }
            gridHeight = parseFloat(computed);
        } else {
            gridHeight = parseInt(this._height, 10);
        }
        const height = Math.abs(gridHeight - renderedHeight);

        if (Math.round(height) === 0 || isNaN(gridHeight)) {
            const bodyHeight = this.defaultTargetBodyHeight;
            return bodyHeight > 0 ? bodyHeight : null;
        }
        return height;
    }

    protected checkContainerSizeChange() {
        const origHeight = this.nativeElement.parentElement.offsetHeight;
        this.nativeElement.style.display = 'none';
        const height = this.nativeElement.parentElement.offsetHeight;
        this.nativeElement.style.display = '';
        return origHeight !== height;
    }

    protected _shouldAutoSize(renderedHeight) {
        this.tbody.nativeElement.style.display = 'none';
        let res = !this.nativeElement.parentElement ||
            this.nativeElement.parentElement.clientHeight === 0 ||
            this.nativeElement.parentElement.clientHeight === renderedHeight;
        if (!this.platform.isChromium && !this.platform.isFirefox) {
            // If grid causes the parent container to extend (for example when container is flex)
            // we should always auto-size since the actual size of the container will continuously change as the grid renders elements.
            res = this.checkContainerSizeChange();
        }
        this.tbody.nativeElement.style.display = '';
        return res;
    }

    /**
     * @hidden
     * Gets calculated width of the unpinned area
     * @param takeHidden If we should take into account the hidden columns in the pinned area.
     */
    protected getUnpinnedWidth(takeHidden = false) {
        let width = this.isPercentWidth ?
            this.calcWidth :
            parseInt(this.width, 10) || parseInt(this.hostWidth, 10) || this.calcWidth;
        if (this.hasVerticalScroll() && !this.isPercentWidth) {
            width -= this.scrollSize;
        }
        if (!this.isPinningToStart) {
            width -= this.featureColumnsWidth();
        }

        return width - this.getPinnedWidth(takeHidden);
    }

    /**
     * @hidden
     */
    protected _summaries(fieldName: string, hasSummary: boolean, summaryOperand?: any) {
        const column = this.gridAPI.get_column_by_name(fieldName);
        if (column) {
            column.hasSummary = hasSummary;
            if (summaryOperand) {
                if (this.rootSummariesEnabled) {
                    this.summaryService.retriggerRootPipe++;
                }
                column.summaries = summaryOperand;
            }
        }
    }

    /**
     * @hidden
     */
    protected _multipleSummaries(expressions: ISummaryExpression[], hasSummary: boolean) {
        expressions.forEach((element) => {
            this._summaries(element.fieldName, hasSummary, element.customSummary);
        });
    }
    /**
     * @hidden
     */
    protected _disableMultipleSummaries(expressions) {
        expressions.forEach((column) => {
            const columnName = column && column.fieldName ? column.fieldName : column;
            this._summaries(columnName, false);
        });
    }

    /**
     * @hidden
     */
    protected resolveDataTypes(rec) {
        if (typeof rec === 'number') {
            return GridColumnDataType.Number;
        } else if (typeof rec === 'boolean') {
            return GridColumnDataType.Boolean;
        } else if (typeof rec === 'object' && rec instanceof Date) {
            return GridColumnDataType.Date;
        }
        return GridColumnDataType.String;
    }

    /**
     * @hidden
     */
    protected autogenerateColumns() {
        const data = this.gridAPI.get_data();
        const factory = this.resolver.resolveComponentFactory(IgxColumnComponent);
        const fields = this.generateDataFields(data);
        const columns = [];

        fields.forEach((field) => {
            const ref = factory.create(this.viewRef.injector);
            ref.instance.field = field;
            ref.instance.dataType = this.resolveDataTypes(data[0][field]);
            ref.changeDetectorRef.detectChanges();
            columns.push(ref.instance);
        });
        this._autoGeneratedCols = columns;

        this.columnList.reset(columns);
        if (data && data.length > 0) {
            this.shouldGenerate = false;
        }
    }

    protected generateDataFields(data: any[]): string[] {
        return Object.keys(data && data.length !== 0 ? data[0] : []);
    }

    /**
     * @hidden
     */
    protected initColumns(collection: QueryList<IgxColumnComponent>, cb: (args: any) => void = null) {
        this._columnGroups = this.columnList.some(col => col.columnGroup);
        if (this.hasColumnLayouts) {
            // Set overall row layout size
            this.columnList.forEach((col) => {
                if (col.columnLayout) {
                    const layoutSize = col.children ?
                        col.children.reduce((acc, val) => Math.max(val.rowStart + val.gridRowSpan - 1, acc), 1) :
                        1;
                    this._multiRowLayoutRowSize = Math.max(layoutSize, this._multiRowLayoutRowSize);
                }
            });
        }
        if (this.hasColumnLayouts && this.hasColumnGroups) {
            // invalid configuration - multi-row and column groups
            // remove column groups
            const columnLayoutColumns = this.columnList.filter((col) => col.columnLayout || col.columnLayoutChild);
            this.columnList.reset(columnLayoutColumns);
        }
        this._maxLevelHeaderDepth = null;
        this._columns.length = 0;
        this._columns.push(...this.columnList.toArray());

        collection.forEach((column: IgxColumnComponent) => {
            column.defaultWidth = this.columnWidthSetByUser ? this._columnWidth : column.defaultWidth ? column.defaultWidth : '';

            if (cb) {
                cb(column);
            }
        });

        this.reinitPinStates();

        if (this.hasColumnLayouts) {
            collection.forEach((column: IgxColumnComponent) => {
                column.populateVisibleIndexes();
            });
        }
    }

    /**
     * @hidden
     */
    protected reinitPinStates() {
        this._pinnedColumns = this.columnList
            .filter((c) => c.pinned).sort((a, b) => this._pinnedColumns.indexOf(a) - this._pinnedColumns.indexOf(b));
        this._unpinnedColumns = this.hasColumnGroups ? this.columnList.filter((c) => !c.pinned) :
            this.columnList.filter((c) => !c.pinned)
                .sort((a, b) => a.index - b.index);
    }

    protected extractDataFromSelection(source: any[], formatters = false, headers = false, columnData?: any[]): any[] {
        let columnsArray: IgxColumnComponent[];
        let record = {};
        let selectedData = [];
        let keys = [];
        const keysAndData = [];
        const activeEl = this.selectionService.activeElement;
        const totalItems = (this as any).totalItemCount ?? 0;
        const isRemote = totalItems && totalItems > this.dataView.length;
        const selectionMap = isRemote ? Array.from(this.selectionService.selection) :
            Array.from(this.selectionService.selection).filter((tuple) => tuple[0] < source.length);

        if (this.cellSelection === GridSelectionMode.single && activeEl) {
            selectionMap.push([activeEl.row, new Set<number>().add(activeEl.column)]);
        }

        if (this.cellSelection === GridSelectionMode.none && activeEl) {
            selectionMap.push([activeEl.row, new Set<number>().add(activeEl.column)]);
        }

        if (columnData) {
            selectedData = columnData;
        }

        // eslint-disable-next-line prefer-const
        for (let [row, set] of selectionMap) {
            row = this.paging ? row + (this.perPage * this.page) : row;
            row = isRemote ? row - this.virtualizationState.startIndex : row;
            if (!source[row] || source[row].detailsData !== undefined) {
                continue;
            }
            const temp = Array.from(set);
            for (const each of temp) {
                columnsArray = this.getSelectableColumnsAt(each);
                columnsArray.forEach((col) => {
                    if (col) {
                        const key = headers ? col.header || col.field : col.field;
                        const value = source[row].ghostRecord ?
                            resolveNestedPath(source[row].recordRef, col.field) : resolveNestedPath(source[row], col.field);
                        record[key] = formatters && col.formatter ? col.formatter(value) : value;
                        if (columnData) {
                            if (!record[key]) {
                                record[key] = '';
                            }
                            record[key] = record[key].toString().concat('recordRow-' + row);
                        }
                    }
                });
            }
            if (Object.keys(record).length) {
                if (columnData) {
                    if (!keys.length) {
                        keys = Object.keys(columnData[0]);
                    }
                    for (const [key, value] of Object.entries(record)) {
                        if (!keys.includes(key)) {
                            keys.push(key);
                        }
                        let c: any = value;
                        const rowNumber = +c.split('recordRow-')[1];
                        c = c.split('recordRow-')[0];
                        record[key] = c;
                        const mergedObj = Object.assign(selectedData[rowNumber], record);
                        selectedData[rowNumber] = mergedObj;
                    }
                } else {
                    selectedData.push(record);
                }
            }
            record = {};
        }

        if (keys.length) {
            keysAndData.push(selectedData);
            keysAndData.push(keys);
            return keysAndData;
        } else {
            return selectedData;
        }
    }

    protected getSelectableColumnsAt(index) {
        if (this.hasColumnLayouts) {
            const visibleLayoutColumns = this.visibleColumns
                .filter(col => col.columnLayout)
                .sort((a, b) => a.visibleIndex - b.visibleIndex);
            const colLayout = visibleLayoutColumns[index];
            return colLayout ? colLayout.children.toArray() : [];
        } else {
            const visibleColumns = this.visibleColumns
                .filter(col => !col.columnGroup)
                .sort((a, b) => a.visibleIndex - b.visibleIndex);
            return [visibleColumns[index]];
        }
    }

    protected extractDataFromColumnsSelection(source: any[], formatters = false, headers = false): any[] {
        let record = {};
        const selectedData = [];
        const selectedColumns = this.selectedColumns();
        if (selectedColumns.length === 0) {
            return [];
        }

        for (const data of source) {
            selectedColumns.forEach((col) => {
                const key = headers ? col.header || col.field : col.field;
                record[key] = formatters && col.formatter ? col.formatter(data[col.field])
                    : data[col.field];
            });

            if (Object.keys(record).length) {
                selectedData.push(record);
            }
            record = {};
        }
        return selectedData;
    }

    /**
     * @hidden
     */
    protected initPinning() {
        const pinnedColumns = [];
        const unpinnedColumns = [];

        this.calculateGridWidth();
        this.resetCaches();
        // When a column is a group or is inside a group, pin all related.
        this._pinnedColumns.forEach(col => {
            if (col.parent) {
                col.parent.pinned = true;
            }
            if (col.columnGroup) {
                col.children.forEach(child => child.pinned = true);
            }
        });

        // Make sure we don't exceed unpinned area min width and get pinned and unpinned col collections.
        // We take into account top level columns (top level groups and non groups).
        // If top level is unpinned the pinning handles all children to be unpinned as well.
        for (const column of this._columns) {
            if (column.pinned && !column.parent) {
                pinnedColumns.push(column);
            } else if (column.pinned && column.parent) {
                if (column.topLevelParent.pinned) {
                    pinnedColumns.push(column);
                } else {
                    column.pinned = false;
                    unpinnedColumns.push(column);
                }
            } else {
                unpinnedColumns.push(column);
            }
        }

        // Assign the applicable collections.
        this._pinnedColumns = pinnedColumns;
        this._unpinnedColumns = unpinnedColumns;
        this.notifyChanges();
    }

    /**
     * @hidden
     */
    protected scrollTo(row: any | number, column: any | number, inCollection = this._filteredSortedUnpinnedData): void {
        let delayScrolling = false;

        if (this.paging && typeof (row) !== 'number') {
            const rowIndex = inCollection.indexOf(row);
            const page = Math.floor(rowIndex / this.perPage);

            if (this.page !== page) {
                delayScrolling = true;
                this.page = page;
            }
        }

        if (delayScrolling) {
            this.verticalScrollContainer.dataChanged.pipe(first()).subscribe(() => {
                this.scrollDirective(this.verticalScrollContainer,
                    typeof (row) === 'number' ? row : this.unpinnedDataView.indexOf(row));
            });
        } else {
            this.scrollDirective(this.verticalScrollContainer,
                typeof (row) === 'number' ? row : this.unpinnedDataView.indexOf(row));
        }

        this.scrollToHorizontally(column);
    }

    /**
     * @hidden
     */
    protected scrollToHorizontally(column: any | number) {
        let columnIndex = typeof column === 'number' ? column : this.getColumnByName(column).visibleIndex;
        const scrollRow = this.rowList.find(r => r.virtDirRow);
        const virtDir = scrollRow ? scrollRow.virtDirRow : null;
        if (this.isPinningToStart && this.pinnedColumns.length) {
            if (columnIndex >= this.pinnedColumns.length) {
                columnIndex -= this.pinnedColumns.length;
                this.scrollDirective(virtDir, columnIndex);
            }
        } else {
            this.scrollDirective(virtDir, columnIndex);
        }
    }

    /**
     * @hidden
     */
    protected scrollDirective(directive: IgxGridForOfDirective<any>, goal: number): void {
        if (!directive) {
            return;
        }
        directive.scrollTo(goal);
    }

    private getColumnWidthSum(): number {
        let colSum = 0;
        const cols = this.hasColumnLayouts ?
            this.visibleColumns.filter(x => x.columnLayout) : this.visibleColumns.filter(x => !x.columnGroup);
        cols.forEach((item) => {
            colSum += parseInt((item.calcWidth || item.defaultWidth), 10) || MINIMUM_COLUMN_WIDTH;
        });
        if (!colSum) {
            return null;
        }
        this.cdr.detectChanges();
        colSum += this.featureColumnsWidth();
        return colSum;
    }

    /**
     * Notify changes, reset cache and populateVisibleIndexes.
     *
     * @hidden
     */
    private _columnsReordered(column: IgxColumnComponent) {
        this.notifyChanges();
        if (this.hasColumnLayouts) {
            this.columns.filter(x => x.columnLayout).forEach(x => x.populateVisibleIndexes());
        }
        // after reordering is done reset cached column collections.
        this.resetColumnCollections();
        column.resetCaches();
    }

    private _applyWidthHostBinding() {
        let width = this._width;
        if (width === null) {
            let currentWidth = this.calcWidth;
            if (this.hasVerticalScroll()) {
                currentWidth += this.scrollSize;
            }
            width = currentWidth + 'px';
            this.resetCaches();
        }
        this._hostWidth = width;
        this.cdr.markForCheck();
    }

    private verticalScrollHandler(event) {
        this.verticalScrollContainer.onScroll(event);
        this.disableTransitions = true;

        this.zone.run(() => {
            this.zone.onStable.pipe(first()).subscribe(() => {
                this.verticalScrollContainer.chunkLoad.emit(this.verticalScrollContainer.state);
                if (this.rowEditable) {
                    this.changeRowEditingOverlayStateOnScroll(this.crudService.rowInEditMode);
                }
            });
        });
        this.disableTransitions = false;

        this.hideOverlays();
        this.actionStrip?.hide();
        const args: IGridScrollEventArgs = {
            direction: 'vertical',
            event,
            scrollPosition: this.verticalScrollContainer.scrollPosition
        };
        this.gridScroll.emit(args);
    }

    private horizontalScrollHandler(event) {
        const scrollLeft = event.target.scrollLeft;
        this.headerContainer.onHScroll(scrollLeft);
        this._horizontalForOfs.forEach(vfor => vfor.onHScroll(scrollLeft));
        this.cdr.markForCheck();

        this.zone.run(() => {
            this.zone.onStable.pipe(first()).subscribe(() => {
                this.parentVirtDir.chunkLoad.emit(this.headerContainer.state);
            });
        });

        this.hideOverlays();
        const args: IGridScrollEventArgs = { direction: 'horizontal', event, scrollPosition: this.headerContainer.scrollPosition };
        this.gridScroll.emit(args);
    }

    private executeCallback(rowIndex, visibleColIndex = -1, cb: (args: any) => void = null) {
        if (!cb) {
            return;
        }
        let row = this.summariesRowList.filter(s => s.index !== 0).concat(this.rowList.toArray()).find(r => r.index === rowIndex);
        if (!row) {
            if ((this as any).totalItemCount) {
                this.verticalScrollContainer.dataChanged.pipe(first()).subscribe(() => {
                    this.cdr.detectChanges();
                    row = this.summariesRowList.filter(s => s.index !== 0).concat(this.rowList.toArray()).find(r => r.index === rowIndex);
                    const cbArgs = this.getNavigationArguments(row, visibleColIndex);
                    cb(cbArgs);
                });
            }

            if (this.dataView[rowIndex].detailsData) {
                this.navigation.setActiveNode({ row: rowIndex });
                this.cdr.detectChanges();
            }

            return;
        }
        const args = this.getNavigationArguments(row, visibleColIndex);
        cb(args);
    }

    private getNavigationArguments(row, visibleColIndex) {
        let targetType: GridKeydownTargetType; let target;
        switch (row.nativeElement.tagName.toLowerCase()) {
            case 'igx-grid-groupby-row':
                targetType = 'groupRow';
                target = row;
                break;
            case 'igx-grid-summary-row':
                targetType = 'summaryCell';
                target = visibleColIndex !== -1 ?
                    row.summaryCells.find(c => c.visibleColumnIndex === visibleColIndex) : row.summaryCells.first;
                break;
            case 'igx-child-grid-row':
                targetType = 'hierarchicalRow';
                target = row;
                break;
            default:
                targetType = 'dataCell';
                target = visibleColIndex !== -1 ? row.cells.find(c => c.visibleColumnIndex === visibleColIndex) : row.cells.first;
                break;
        }
        return { targetType, target };
    }

    private getNextDataRowIndex(currentRowIndex, previous = false): number {
        if (currentRowIndex < 0 || (currentRowIndex === 0 && previous) || (currentRowIndex >= this.dataView.length - 1 && !previous)) {
            return currentRowIndex;
        }
        // find next/prev record that is editable.
        const nextRowIndex = previous ? this.findPrevEditableDataRowIndex(currentRowIndex) :
            this.dataView.findIndex((rec, index) =>
                index > currentRowIndex && this.isEditableDataRecordAtIndex(index));
        return nextRowIndex !== -1 ? nextRowIndex : currentRowIndex;
    }

    /**
     * Returns the previous editable row index or -1 if no such row is found.
     *
     * @param currentIndex The index of the current editable record.
     */
    private findPrevEditableDataRowIndex(currentIndex): number {
        let i = this.dataView.length;
        while (i--) {
            if (i < currentIndex && this.isEditableDataRecordAtIndex(i)) {
                return i;
            }
        }
        return -1;
    }


    /**
     * Returns if the record at the specified data view index is a an editable data record.
     * If record is group rec, summary rec, child rec, ghost rec. etc. it is not editable.
     *
     * @param dataViewIndex The index of that record in the data view.
     *
     */
    // TODO: Consider moving it into CRUD
    private isEditableDataRecordAtIndex(dataViewIndex) {
        const rec = this.dataView[dataViewIndex];
        return !rec.expression && !rec.summaries && !rec.childGridsData && !rec.detailsData &&
            !this.isGhostRecordAtIndex(dataViewIndex);
    }

    /**
     * Returns if the record at the specified data view index is a ghost.
     * If record is pinned but is not in pinned area then it is a ghost record.
     *
     * @param dataViewIndex The index of that record in the data view.
     */
    private isGhostRecordAtIndex(dataViewIndex) {
        const isPinned = this.isRecordPinned(this.dataView[dataViewIndex]);
        const isInPinnedArea = this.isRecordPinnedByViewIndex(dataViewIndex);
        return isPinned && !isInPinnedArea;
    }

    private isValidPosition(rowIndex, colIndex): boolean {
        const rows = this.summariesRowList.filter(s => s.index !== 0).concat(this.rowList.toArray()).length;
        const cols = this.columnList.filter(col => !col.columnGroup && col.visibleIndex >= 0 && !col.hidden).length;
        if (rows < 1 || cols < 1) {
            return false;
        }
        if (rowIndex > -1 && rowIndex < this.dataView.length &&
            colIndex > - 1 && colIndex <= Math.max(...this.visibleColumns.map(c => c.visibleIndex))) {
            return true;
        }
        return false;
    }

    private find(text: string, increment: number, caseSensitive?: boolean, exactMatch?: boolean, scroll?: boolean, endEdit = true) {
        if (!this.rowList) {
            return 0;
        }

        if (endEdit) {
            this.crudService.endEdit(false);
        }

        if (!text) {
            this.clearSearch();
            return 0;
        }

        const caseSensitiveResolved = caseSensitive ? true : false;
        const exactMatchResolved = exactMatch ? true : false;
        let rebuildCache = false;

        if (this.lastSearchInfo.searchText !== text ||
            this.lastSearchInfo.caseSensitive !== caseSensitiveResolved ||
            this.lastSearchInfo.exactMatch !== exactMatchResolved) {
            this.lastSearchInfo = {
                searchText: text,
                activeMatchIndex: 0,
                caseSensitive: caseSensitiveResolved,
                exactMatch: exactMatchResolved,
                matchInfoCache: []
            };

            rebuildCache = true;
        } else {
            this.lastSearchInfo.activeMatchIndex += increment;
        }

        if (rebuildCache) {
            this.rowList.forEach((row) => {
                if (row.cells) {
                    row.cells.forEach((c) => {
                        c.highlightText(text, caseSensitiveResolved, exactMatchResolved);
                    });
                }
            });

            this.rebuildMatchCache();
        }

        if (this.lastSearchInfo.activeMatchIndex >= this.lastSearchInfo.matchInfoCache.length) {
            this.lastSearchInfo.activeMatchIndex = 0;
        } else if (this.lastSearchInfo.activeMatchIndex < 0) {
            this.lastSearchInfo.activeMatchIndex = this.lastSearchInfo.matchInfoCache.length - 1;
        }

        if (this.lastSearchInfo.matchInfoCache.length) {
            const matchInfo = this.lastSearchInfo.matchInfoCache[this.lastSearchInfo.activeMatchIndex];
            this.lastSearchInfo = { ...this.lastSearchInfo };

            if (scroll !== false) {
                this.scrollTo(matchInfo.row, matchInfo.column);
            }

            IgxTextHighlightDirective.setActiveHighlight(this.id, {
                column: matchInfo.column,
                row: matchInfo.row,
                index: matchInfo.index,
                metadata: matchInfo.metadata,
            });

        } else {
            IgxTextHighlightDirective.clearActiveHighlight(this.id);
        }

        return this.lastSearchInfo.matchInfoCache.length;
    }

    private rebuildMatchCache() {
        this.lastSearchInfo.matchInfoCache = [];

        const caseSensitive = this.lastSearchInfo.caseSensitive;
        const exactMatch = this.lastSearchInfo.exactMatch;
        const searchText = caseSensitive ? this.lastSearchInfo.searchText : this.lastSearchInfo.searchText.toLowerCase();
        const data = this.filteredSortedData;
        const columnItems = this.visibleColumns.filter((c) => !c.columnGroup).sort((c1, c2) => c1.visibleIndex - c2.visibleIndex);
        data.forEach((dataRow, rowIndex) => {
            columnItems.forEach((c) => {
                const pipeArgs = this.getColumnByName(c.field).pipeArgs;
                const value = c.formatter ? c.formatter(resolveNestedPath(dataRow, c.field)) :
                    c.dataType === 'number' ? this.decimalPipe.transform(resolveNestedPath(dataRow, c.field),
                        pipeArgs.digitsInfo, this.locale) :
                        c.dataType === 'date' ? this.datePipe.transform(resolveNestedPath(dataRow, c.field),
                            pipeArgs.format, pipeArgs.timezone, this.locale)
                            : resolveNestedPath(dataRow, c.field);
                if (value !== undefined && value !== null && c.searchable) {
                    let searchValue = caseSensitive ? String(value) : String(value).toLowerCase();

                    if (exactMatch) {
                        if (searchValue === searchText) {
                            const metadata = new Map<string, any>();
                            metadata.set('pinned', this.isRecordPinnedByIndex(rowIndex));
                            this.lastSearchInfo.matchInfoCache.push({
                                row: dataRow,
                                column: c.field,
                                index: 0,
                                metadata,
                            });
                        }
                    } else {
                        let occurenceIndex = 0;
                        let searchIndex = searchValue.indexOf(searchText);

                        while (searchIndex !== -1) {
                            const metadata = new Map<string, any>();
                            metadata.set('pinned', this.isRecordPinnedByIndex(rowIndex));
                            this.lastSearchInfo.matchInfoCache.push({
                                row: dataRow,
                                column: c.field,
                                index: occurenceIndex++,
                                metadata,
                            });

                            searchValue = searchValue.substring(searchIndex + searchText.length);
                            searchIndex = searchValue.indexOf(searchText);
                        }
                    }
                }
            });
        });
    }

    // TODO: About to Move to CRUD
    private configureRowEditingOverlay(rowID: any, useOuter = false) {
        let settings = this.rowEditSettings;
        const overlay = this.overlayService.getOverlayById(this.rowEditingOverlay.overlayId);
        if (overlay) {
            settings = overlay.settings;
        }
        settings.outlet = useOuter ? this.parentRowOutletDirective : this.rowOutletDirective;
        this.rowEditPositioningStrategy.settings.container = this.tbody.nativeElement;
        const pinned = this._pinnedRecordIDs.indexOf(rowID) !== -1;
        const targetRow = !pinned ? this.gridAPI.get_row_by_key(rowID) : this.pinnedRows.find(x => x.rowID === rowID);
        if (!targetRow) {
            return;
        }
        settings.target = targetRow.element.nativeElement;
        this.toggleRowEditingOverlay(true);
    }
}
