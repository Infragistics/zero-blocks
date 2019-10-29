import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    Input,
    forwardRef,
    TemplateRef,
    ViewChild,
    ViewChildren,
    QueryList,
    ContentChildren,
    ElementRef,
    NgZone,
    ChangeDetectorRef,
    IterableDiffers,
    ViewContainerRef,
    Inject,
    ComponentFactoryResolver,
    AfterViewInit,
    AfterContentInit,
    Optional,
    OnInit,
    OnDestroy,
    DoCheck,
    EventEmitter,
    Output,
    ContentChild
} from '@angular/core';
import { IgxGridBaseDirective, IgxGridTransaction } from '../grid-base.directive';
import { GridBaseAPIService } from '../api.service';
import { IgxHierarchicalGridAPIService } from './hierarchical-grid-api.service';
import { IgxRowIslandComponent } from './row-island.component';
import { IgxChildGridRowComponent } from './child-grid-row.component';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IDisplayDensityOptions, DisplayDensityToken, DisplayDensity } from '../../core/displayDensity';
import { IgxColumnComponent, IgxChildDetailsDirective, } from '../grid/index';
import { DOCUMENT } from '@angular/common';
import { IgxHierarchicalGridNavigationService } from './hierarchical-grid-navigation.service';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';
import { IgxHierarchicalGridBaseDirective } from './hierarchical-grid-base.directive';
import { takeUntil } from 'rxjs/operators';
import { IgxTemplateOutletDirective } from '../../directives/template-outlet/template_outlet.directive';
import { IgxGridSelectionService, IgxGridCRUDService } from '../selection/selection.service';
import { IgxOverlayService } from '../../services/index';
import { IgxColumnResizingService } from '../resizing/resizing.service';
import { IgxForOfSyncService, IgxForOfScrollSyncService } from '../../directives/for-of/for_of.sync.service';
import { GridType } from '../common/grid.interface';
import { IgxHierarchicalGridMasterDetailNavigationService } from './hierarchical-grid-master-detail-navigation.service';


let NEXT_ID = 0;

export interface HierarchicalStateRecord {
    rowID: any;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-hierarchical-grid',
    templateUrl: 'hierarchical-grid.component.html',
    providers: [
        IgxGridSelectionService,
        IgxGridCRUDService,
        { provide: GridBaseAPIService, useClass: IgxHierarchicalGridAPIService },
        { provide: IgxGridBaseDirective, useExisting: forwardRef(() => IgxHierarchicalGridComponent) },
        IgxGridSummaryService,
        IgxFilteringService,
        IgxHierarchicalGridNavigationService,
        IgxForOfSyncService,
        IgxForOfScrollSyncService
    ]
})
export class IgxHierarchicalGridComponent extends IgxHierarchicalGridBaseDirective
    implements GridType, AfterViewInit, AfterContentInit, OnInit, OnDestroy, DoCheck {

    /**
     * Sets the value of the `id` attribute. If not provided it will be automatically generated.
     * ```html
     * <igx-hierarchical-grid [id]="'igx-hgrid-1'" [data]="Data" [autoGenerate]="true"></igx-hierarchical-grid>
     * ```
     * @memberof IgxHierarchicalGridComponent
     */
    @HostBinding('attr.id')
    @Input()
    public get id(): string {
        return this.h_id;
    }

    /**
     * An @Input property that lets you fill the `IgxHierarchicalGridComponent` with an array of data.
     * ```html
     * <igx-hierarchical-grid [data]="Data" [autoGenerate]="true"></igx-hierarchical-grid>
     * ```
     * @memberof IgxHierarchicalGridComponent
     */
    @Input()
    public set data(value: any[]) {
        this._data = value || [];
        this.summaryService.clearSummaryCache();
        if (this.shouldGenerate) {
            this.setupColumns();
            this.reflow();
        }
        this.cdr.markForCheck();
        if (this.parent && (this.height === null || this.height.indexOf('%') !== -1)) {
            // If the height will change based on how much data there is, recalculate sizes in igxForOf.
            this.notifyChanges(true);
        }
    }

    /**
     * Returns an array of data set to the `IgxHierarchicalGridComponent`.
     * ```typescript
     * let filteredData = this.grid.filteredData;
     * ```
     * @memberof IgxHierarchicalGridComponent
     */
    public get data(): any[] {
        return this._data;
    }

    /**
    * Sets the state of the `IgxHierarchicalGridComponent` containing which rows are expanded.
    * ```typescript
    * this.gridState = [{ rowID: 1 }, { rowID: 4}];
    * ```
    * ```html
    * <igx-hierarchical-grid [primaryKey]="'ID'" [data]="Data" [autoGenerate]="false" [hierarchicalState]="hgridState">
    *      <igx-column field="ID"  [dataType]='number'></igx-column>
    *      <igx-column field="Product"  [dataType]='string'></igx-column>
    *      <igx-column field="Description"  [dataType]='string'></igx-column>
    * </igx-hierarchical-grid>
    * ```
    *
    * Two-way data binding.
    * ```html
    * <igx-hierarchical-grid [primaryKey]="'ID'" [data]="Data" [autoGenerate]="false" [(hierarchicalState)]="hgridState">
    *      <igx-column field="ID"  [dataType]='number'></igx-column>
    *      <igx-column field="Product"  [dataType]='string'></igx-column>
    *      <igx-column field="Description"  [dataType]='string'></igx-column>
    * </igx-hierarchical-grid>
    * ```
    * @memberof IgxHierarchicalGridComponent
    */
    @Input()
    public get hierarchicalState() {
        return this._hierarchicalState;
    }
    public set hierarchicalState(val) {
        if (this._hierarchicalState !== val) {
            this.hierarchicalStateChange.emit(val);
        }
        if (this.hasChildrenKey) {
            val = val.filter(item => {
                const rec = this.primaryKey ? this.data.find(x => x[this.primaryKey] === item.rowID) : item.rowID;
                return rec[this.hasChildrenKey];
            });
        }
        this._hierarchicalState = val;
        if (this.parent) {
            this.notifyChanges(true);
        }
    }

    /**
     *@hidden
     */
    @Output()
    public hierarchicalStateChange = new EventEmitter<any>();

    /**
     * Sets an array of objects containing the filtered data in the `IgxHierarchicalGridComponent`.
     * ```typescript
     * this.grid.filteredData = [{
     *       ID: 1,
     *       Name: "A"
     * }];
     * ```
     * @memberof IgxHierarchicalGridComponent
     */
    public set filteredData(value) {
        this._filteredData = value;


    }

    /**
     * Returns an array of objects containing the filtered data in the `IgxHierarchicalGridComponent`.
     * ```typescript
     * let filteredData = this.grid.filteredData;
     * ```
     * @memberof IgxHierarchicalGridComponent
     */
    public get filteredData() {
        return this._filteredData;
    }

    /**
     * Sets if all immediate children of the `IgxHierarchicalGridComponent` should be expanded/collapsed.
     * Defult value is false.
     * ```html
     * <igx-hierarchical-grid [id]="'igx-grid-1'" [data]="Data" [autoGenerate]="true" [expandChildren]="true"></igx-hierarchical-grid>
     * ```
     * @memberof IgxHierarchicalGridComponent
     */
    @Input()
    set expandChildren(value: boolean) {
        this._expandChildren = value;
        if (value && this.data) {
            this.hierarchicalState = this.data.map((rec) => {
                return { rowID: this.primaryKey ? rec[this.primaryKey] : rec };
            });
        } else if (this.data) {
            this.hierarchicalState = [];
        }
    }

    /**
     * Gets if all immediate children of the `IgxHierarchicalGridComponent` previously have been set to be expanded/collapsed.
     * If previously set and some rows have been manually expanded/collapsed it will still return the last set value.
     * ```typescript
     * const expanded = this.grid.expandChildren;
     * ```
     * @memberof IgxHierarchicalGridComponent
     */
    get expandChildren(): boolean {
        return this._expandChildren;
    }

    /**
     * Gets the unique identifier of the parent row. It may be a `string` or `number` if `primaryKey` of the
     * parent grid is set or an object reference of the parent record otherwise.
     * ```typescript
     * const foreignKey = this.grid.foreignKey;
     * ```
     * @memberof IgxHierarchicalGridComponent
     */
    public get foreignKey() {
        if (!this.parent) {
            return null;
        }
        return this.parent.hgridAPI.getParentRowId(this);
    }

    /**
     * @hidden
     */
    @ContentChildren(IgxRowIslandComponent, { read: IgxRowIslandComponent, descendants: false })
    public childLayoutList: QueryList<IgxRowIslandComponent>;

    /**
     * @hidden
     */
    @ContentChildren(IgxRowIslandComponent, { read: IgxRowIslandComponent, descendants: true })
    public allLayoutList: QueryList<IgxRowIslandComponent>;

    @ViewChild('hierarchical_record_template', { read: TemplateRef, static: true })
    protected hierarchicalRecordTemplate: TemplateRef<any>;

    @ViewChild('child_record_template', { read: TemplateRef, static: true })
    protected childTemplate: TemplateRef<any>;

    @ViewChild('headerHierarchyExpander', { read: ElementRef, static: true })
    protected headerHierarchyExpander: ElementRef;

    @ViewChild('child_detail_template', { read: TemplateRef, static: true })
    protected childDetailsContainerTemplate: TemplateRef<any>;

    /**
    * The custom template, if any, that should be used when rendering a a custom row details in the child container.
    */
   @ContentChild(IgxChildDetailsDirective, { read: TemplateRef, static: false })
   public childDetailsTemplate: TemplateRef<any> = null;

    /**
     * @hidden
     */
    @ViewChildren(IgxTemplateOutletDirective, { read: IgxTemplateOutletDirective })
    public templateOutlets: QueryList<any>;

    /**
     * @hidden
     */
    @ViewChildren(IgxChildGridRowComponent, { read: IgxChildGridRowComponent })
    public hierarchicalRows: QueryList<IgxChildGridRowComponent>;

    /**
     * @hidden
     */
    get hasExpandableChildren() {
        return !!this.childLayoutKeys.length || this.hasChildDetails;
    }

    /**
     * @hidden
     */
    public childLayoutKeys = [];

    /**
     * @hidden
     */
    public highlightedRowID = null;

    /**
     * @hidden
     */
    public updateOnRender = false;

    /**
     * @hidden
     */
    public parent = null;

    private _hierarchicalState = [];
    private _data;
    private _filteredData = null;
    private h_id = `igx-hierarchical-grid-${NEXT_ID++}`;
    private childGridTemplates: Map<any, any> = new Map();
    private scrollTop = 0;
    private scrollLeft = 0;

    protected _transactions: any;

    constructor(
        public selectionService: IgxGridSelectionService,
        crudService: IgxGridCRUDService,
        public colResizingService: IgxColumnResizingService,
        gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>,
        @Inject(IgxGridTransaction) protected transactionFactory: any,
        elementRef: ElementRef,
        zone: NgZone,
        @Inject(DOCUMENT) public document,
        cdr: ChangeDetectorRef,
        resolver: ComponentFactoryResolver,
        differs: IterableDiffers,
        viewRef: ViewContainerRef,
        navigation: IgxHierarchicalGridNavigationService,
        filteringService: IgxFilteringService,
        @Inject(IgxOverlayService) protected overlayService: IgxOverlayService,
        public summaryService: IgxGridSummaryService,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
        super(
            selectionService,
            crudService,
            colResizingService,
            gridAPI,
            typeof transactionFactory === 'function' ? transactionFactory() : transactionFactory,
            elementRef,
            zone,
            document,
            cdr,
            resolver,
            differs,
            viewRef,
            navigation,
            filteringService,
            overlayService,
            summaryService,
            _displayDensityOptions);
        this.hgridAPI = <IgxHierarchicalGridAPIService>gridAPI;
    }


    /**
     * @hidden
     */
    ngOnInit() {
        this._transactions = this.parentIsland ? this.parentIsland.transactions : this._transactions;
        super.ngOnInit();
    }

    public ngDoCheck() {
        if (this._cdrRequestRepaint && !this._init) {
            this.updateSizes();
        }
        super.ngDoCheck();
    }

    /**
     * @hidden
     */
    ngAfterViewInit() {
        super.ngAfterViewInit();
        this.verticalScrollContainer.getScroll().addEventListener('scroll', this.hg_verticalScrollHandler.bind(this));
        this.headerContainer.getScroll().addEventListener('scroll', this.hg_horizontalScrollHandler.bind(this));

        if (this.expandChildren && this.data && this.hierarchicalState.length !== this.data.length) {
            this.hierarchicalState = this.data.map((rec) => {
                return { rowID: this.primaryKey ? rec[this.primaryKey] : rec };
            });
            this.cdr.detectChanges();
        }

        this.verticalScrollContainer.onBeforeViewDestroyed.pipe(takeUntil(this.destroy$)).subscribe((view) => {
            const rowData = view.context.$implicit;
            if (this.isChildGridRecord(rowData)) {
                const cachedData = this.childGridTemplates.get(rowData.rowID);
                if (cachedData) {
                    const tmlpOutlet = cachedData.owner;
                    tmlpOutlet._viewContainerRef.detach(0);
                }
            }
        });

        if (this.parent) {
            this._displayDensity = this.rootGrid._displayDensity;
            this.rootGrid.onDensityChanged.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this._displayDensity = this.rootGrid._displayDensity;
                this.notifyChanges(true);
                this.cdr.markForCheck();
            });
            this.childLayoutKeys = this.parentIsland.children.map((item) => item.key);
        }

        this.toolbarCustomContentTemplates = this.parentIsland ?
            this.parentIsland.toolbarCustomContentTemplates :
            this.toolbarCustomContentTemplates;

        this.headSelectorsTemplates = this.parentIsland ?
            this.parentIsland.headSelectorsTemplates :
            this.headSelectorsTemplates;

        this.rowSelectorsTemplates = this.parentIsland ?
            this.parentIsland.rowSelectorsTemplates :
            this.rowSelectorsTemplates;
        this.rowExpandedIndicatorTemplate  = this.rootGrid.rowExpandedIndicatorTemplate;
        this.rowCollapsedIndicatorTemplate   = this.rootGrid.rowCollapsedIndicatorTemplate;
        this.headerCollapseIndicatorTemplate = this.rootGrid.headerCollapseIndicatorTemplate;
        this.headerExpandIndicatorTemplate = this.rootGrid.headerExpandIndicatorTemplate;
        this.hasChildrenKey = this.parentIsland ?
         this.parentIsland.hasChildrenKey || this.rootGrid.hasChildrenKey :
         this.rootGrid.hasChildrenKey;
         this.showExpandAll = this.parentIsland ?
         this.parentIsland.showExpandAll : this.rootGrid.showExpandAll;
    }

    private updateSizes() {
        if (document.body.contains(this.nativeElement) && this.isPercentWidth) {
            this.reflow();

            this.hgridAPI.getChildGrids(false).forEach((grid) => {
                grid.updateSizes();
            });
        }
    }

    protected _shouldAutoSize(renderedHeight) {
        if (this.isPercentHeight && this.parent) {
            return true;
        }
        return super._shouldAutoSize(renderedHeight);
    }

    public get outletDirective() {
        return this.rootGrid._outletDirective;
    }

    /**
     * @hidden
     */
    public get parentRowOutletDirective() {
        return this === this.rootGrid ? null : this.rootGrid.rowEditingOutletDirective;
    }

    /**
     * @hidden
     */
    ngAfterContentInit() {
        this.updateColumnList(false);
        this.childLayoutKeys = this.parent ?
        this.parentIsland.children.map((item) => item.key) :
        this.childLayoutKeys = this.childLayoutList.map((item) => item.key);
        this.childLayoutList.notifyOnChanges();
        this.childLayoutList.changes.pipe(takeUntil(this.destroy$))
        .subscribe(() => this.onRowIslandChange());
        this._setupNavigationService();
        super.ngAfterContentInit();
    }

    /**
    * @hidden
    */
    public onRowIslandChange() {
        if (this.parent) {
            this.childLayoutKeys = this.parentIsland.children.filter(item => !(item as any)._destroyed).map((item) => item.key);
        } else {
            this.childLayoutKeys = this.childLayoutList.filter(item => !(item as any)._destroyed).map((item) => item.key);
        }
        if (!(this.cdr as any).destroyed) {
            this.cdr.detectChanges();
        }
    }

    protected onColumnsChanged(change: QueryList<IgxColumnComponent>) {
        this.updateColumnList();
        const cols = change.filter(c => c.gridAPI.grid === this);
        if (cols.length > 0) {
            this.columnList.reset(cols);
            super.onColumnsChanged(this.columnList);
        }
    }

    private updateColumnList(recalcColSizes = true) {
        const childLayouts = this.parent ? this.childLayoutList : this.allLayoutList;
        const nestedColumns = childLayouts.map((layout) => {
            return layout.columnList.toArray();
        });
        const colsArray = [].concat.apply([], nestedColumns);
        const colLength = this.columnList.length;
        if (colsArray.length > 0) {
            const topCols = this.columnList.filter((item) => {
                return colsArray.indexOf(item) === -1;
            });
            this.columnList.reset(topCols);
            if (recalcColSizes && this.columnList.length !== colLength) {
                this.calculateGridSizes();
            }
        }
    }

    ngOnDestroy() {
        if (!this.parent) {
            this.hgridAPI.getChildGrids(true).forEach((grid) => {
                if (!grid.childRow.cdr.destroyed) {
                    grid.childRow.cdr.destroy();
                }
            });
        }
        if (this.parent && this.selectionService.activeElement) {
            // in case selection is in destroyed child grid, selection should be cleared.
            this._clearSeletionHighlights();
        }
        super.ngOnDestroy();
    }

    private _clearSeletionHighlights() {
        [this.rootGrid, ...this.rootGrid.getChildGrids(true)].forEach(grid => {
            grid.selectionService.clear();
            grid.selectionService.activeElement = null;
            grid.nativeElement.classList.remove('igx-grid__tr--highlighted');
            grid.highlightedRowID = null;
            grid.cdr.markForCheck();
        });
    }

    /**
    * @hidden
    */
    public get template(): TemplateRef<any> {
        if (this.filteredData && this.filteredData.length === 0) {
            return this.emptyGridTemplate ? this.emptyGridTemplate : this.emptyFilteredGridTemplate;
        }

        if (this.isLoading && (!this.data || this.dataLength === 0)) {
            return this.loadingGridTemplate ? this.loadingGridTemplate : this.loadingGridDefaultTemplate;
        }

        if (this.dataLength === 0) {
            return this.emptyGridTemplate ? this.emptyGridTemplate : this.emptyGridDefaultTemplate;
        }
    }

    /**
     * @hidden
     * Gets the combined width of the columns that are specific to the enabled grid features. They are fixed.
     * TODO: Remove for Angular 8. Calling parent class getter using super is not supported for now.
     */
    public getFeatureColumnsWidth() {
        let width = super.getFeatureColumnsWidth();

        if (this.hasExpandableChildren) {
            width += this.headerHierarchyExpander.nativeElement.offsetWidth || this.getDefaultExpanderWidth();
        }

        return width;
    }

     private getDefaultExpanderWidth(): number {
        switch (this.displayDensity) {
            case DisplayDensity.cosy:
                return 57;
            case DisplayDensity.compact:
                return 49;
            default:
                return 72;
        }
    }

    /**
     * @hidden
     */
    public isRowHighlighted(rowData) {
        return this.highlightedRowID === rowData.rowID;
    }

    /**
     * @hidden
     */
    public isHierarchicalRecord(record: any): boolean {
        return this.childLayoutList.length !== 0 && record[this.childLayoutList.first.key];
    }

    /**
     * @hidden
     */
    public isChildGridRecord(record: any): boolean {
        // Can be null when there is defined layout but no child data was found
        return record.childGridsData !== undefined || record.details;
    }

    /**
     * @hidden
     */
    public trackChanges(index, rec) {
        if (rec.childGridsData !== undefined) {
            // if is child rec
            return rec.rowID;
        }
        return rec;
    }

    /**
     * @hidden
     */
    public getContext(rowData): any {
        if (this.isChildGridRecord(rowData)) {
            const cachedData = this.childGridTemplates.get(rowData.rowID);
            if (cachedData) {
                const view = cachedData.view;
                const tmlpOutlet = cachedData.owner;
                return {
                    $implicit: rowData,
                    moveView: view,
                    owner: tmlpOutlet,
                    index: this.dataView.indexOf(rowData)
                };
            } else {
                const rowID = this.primaryKey ? rowData.rowID : this.data.indexOf(rowData.rowID);
                // child rows contain unique grids, hence should have unique templates
                return {
                    $implicit: rowData,
                    templateID: 'childRow-' + rowID,
                    index: this.dataView.indexOf(rowData)
                };
            }
        } else {
            return {
                $implicit: rowData,
                templateID: 'dataRow',
                index: this.dataView.indexOf(rowData)
            };
        }
    }

    /**
     * @hidden
    */
    public get rootGrid() {
        let currGrid = this;
        while (currGrid.parent) {
            currGrid = currGrid.parent;
        }
        return currGrid;
    }

    /**
     * @hidden
    */
    public get iconTemplate() {
        const expanded = this.hierarchicalState.length > 0 && this.hasExpandableChildren;
        if (!expanded && this.showExpandAll) {
            return this.headerCollapseIndicatorTemplate || this.defaultCollapsedTemplate;
        } else {
            return this.headerExpandIndicatorTemplate || this.defaultExpandedTemplate;
        }
    }

    public detailsKeyboardHandler(event, rowIndex, container) {
        const colIndex = this.selectionService.activeElement ? this.selectionService.activeElement.column : 0;
        const shift = event.shiftKey;
        const key = event.key.toLowerCase();
        const target = event.target;
        if (key === 'tab') {
            event.stopPropagation();
            if (shift && target === container) {
                // shift + tab from details to data row
                event.preventDefault();
                const lastColIndex = this.unpinnedColumns[this.unpinnedColumns.length - 1].visibleIndex;
                this.navigateTo(rowIndex - 1, lastColIndex,
                    (args) => args.target.nativeElement.focus());
            }
        } else if (key === 'arrowup') {
            this.navigateTo(rowIndex - 1, colIndex,
                (args) => args.target.nativeElement.focus());
        } else if (key === 'arrowdown') {
            this.navigateTo(rowIndex + 1, colIndex,
                (args) => args.target.nativeElement.focus());
        }
    }

    /**
     * @hidden
    */
   public getRowTemplate(rowData) {
    const isChild = this.isChildGridRecord(rowData) && this.isExpanded(rowData);
    const isChildDetail = isChild && this.hasChildDetails;
    const isChildRI = isChild && !this.hasChildDetails;
    if (this.isHierarchicalRecord(rowData)) {
        return this.hierarchicalRecordTemplate;
    }  else if (isChildRI) {
        return this.childTemplate;
    } else if (isChildDetail) {
            return this.childDetailsContainerTemplate;
    } else {
        return this.hierarchicalRecordTemplate;
    }
}

    public get hasChildDetails() {
        return !!this.childDetailsTemplate && this.childLayoutList.length === 0;
    }

    public getDetailsContext(rowData, index) {
        return {
            $implicit: rowData.data,
            index: index
        };
    }

    private _setupNavigationService() {
        if (this.hasChildDetails) {
            this.navigation = new IgxHierarchicalGridMasterDetailNavigationService();
            this.navigation.grid = this;
        }
    }

    /**
     * @hidden
    */
    protected initColumns(collection: QueryList<IgxColumnComponent>, cb: Function = null) {
        if (this.hasColumnLayouts) {
            // invalid configuration - hierarchical grid should not allow column layouts
            // remove column layouts
            const nonColumnLayoutColumns = this.columnList.filter((col) => !col.columnLayout && !col.columnLayoutChild);
            this.columnList.reset(nonColumnLayoutColumns);
        }
        super.initColumns(collection, cb);
    }

    /**
     * @hidden
     * Gets the visible content height that includes header + tbody + footer.
     * For hierarchical child grid it may be scrolled and not fully visible.
     */
    public getVisibleContentHeight() {
        let height = super.getVisibleContentHeight();
        if (this.parent) {
            const rootHeight = this.rootGrid.getVisibleContentHeight();
            const topDiff = this.nativeElement.getBoundingClientRect().top - this.rootGrid.nativeElement.getBoundingClientRect().top;
            height = rootHeight - topDiff > height ? height : rootHeight - topDiff;
        }
        return height;
    }

    /**
     * @hidden
    */
   toggleAll() {
    const expanded = this.hierarchicalState.length > 0 && this.hasExpandableChildren;
    if (!expanded && this.showExpandAll) {
        this.expandAll();
    } else {
        this.collapseAll();
    }
   }

    /**
     * Collapses all rows of the current hierarchical grid.
     * ```typescript
     * this.grid.collapseAll();
     * ```
	 * @memberof IgxHierarchicalGridComponent
     */
    public collapseAll() {
        this.hierarchicalState = [];
    }

    /**
     * Expands all rows of the current hierarchical grid.
     * ```typescript
     * this.grid.expandAll();
     * ```
	 * @memberof IgxHierarchicalGridComponent
     */
    public expandAll() {
        if (this.data) {
            this.hierarchicalState = this.data.map((rec) => {
                return { rowID: this.primaryKey ? rec[this.primaryKey] : rec };
            });
        }
    }

    /**
     * @hidden
     */
    public isExpanded(record: any): boolean {
        let inState;
        if (record.childGridsData !== undefined || record.details) {
            inState = !!this.hierarchicalState.find(v => v.rowID === record.rowID);
        } else {
            inState = !!this.hierarchicalState.find(v => {
                return this.primaryKey ? v.rowID === record[this.primaryKey] : v.rowID === record;
            });
        }
        return inState && (this.childLayoutList.length !== 0 || this.hasChildDetails);
    }

    /**
     * @hidden
     */
    public viewCreatedHandler(args) {
        if (this.isChildGridRecord(args.context.$implicit)) {
            const key = args.context.$implicit.rowID;
            this.childGridTemplates.set(key, args);
        }
    }

    /**
     * @hidden
     */
    public viewMovedHandler(args) {
        if (this.isChildGridRecord(args.context.$implicit)) {
            // view was moved, update owner in cache
            const key = args.context.$implicit.rowID;
            const cachedData = this.childGridTemplates.get(key);
            cachedData.owner = args.owner;

            this.childLayoutList.forEach((layout) => {
                const relatedGrid = this.hgridAPI.getChildGridByID(layout.key, args.context.$implicit.rowID);
                if (relatedGrid && relatedGrid.updateOnRender) {
                    // Detect changes if `expandChildren` has changed when the grid wasn't visible. This is for performance reasons.
                    relatedGrid.notifyChanges(true);
                    relatedGrid.updateOnRender = false;
                }
            });

            const childGrids = this.getChildGrids(true);
            childGrids.forEach((grid) => {
                if (grid.isPercentWidth) {
                    grid.notifyChanges(true);
                }
                grid.updateScrollPosition();
            });
        }
    }

    /**
     * @hidden
     */
    public updateScrollPosition() {
        const vScr = this.verticalScrollContainer.getScroll();
        const hScr = this.headerContainer.getScroll();
        if (vScr) {
            vScr.scrollTop = this.scrollTop;
        }
        if (hScr) {
            hScr.scrollLeft = this.scrollLeft;
        }
    }

    protected getChildGrids(inDeph?: boolean) {
        return this.hgridAPI.getChildGrids(inDeph);
    }

    protected generateDataFields(data: any[]): string[] {
        return super.generateDataFields(data).filter((field) => {
            const layoutsList = this.parentIsland ? this.parentIsland.children : this.childLayoutList;
            const keys = layoutsList.map((item) => item.key);
            return keys.indexOf(field) === -1;
        });
    }


    private hg_verticalScrollHandler(event) {
        this.scrollTop = event.target.scrollTop;
    }

    public onContainerScroll() {
        this.hideOverlays();
    }

    private hg_horizontalScrollHandler(event) {
        this.scrollLeft = event.target.scrollLeft;
    }
}
