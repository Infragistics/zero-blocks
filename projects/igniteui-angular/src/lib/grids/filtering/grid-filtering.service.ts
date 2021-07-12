import {
    Injectable,
    OnDestroy,
    NgModuleRef,
    ComponentFactoryResolver,
    ApplicationRef,
    Injector,
    ComponentRef,
    ComponentFactory
} from '@angular/core';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IFilteringExpression, FilteringLogic } from '../../data-operations/filtering-expression.interface';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { IForOfState } from '../../directives/for-of/for_of.directive';
import { IgxColumnComponent } from '../columns/column.component';
import { IFilteringOperation } from '../../data-operations/filtering-condition';
import { IColumnResizeEventArgs, IFilteringEventArgs } from '../common/events';
import { OverlaySettings, PositionSettings, VerticalAlignment } from '../../services/overlay/utilities';
import { IgxOverlayService } from '../../services/overlay/overlay';
import { useAnimation } from '@angular/animations';
import { fadeIn } from '../../animations/main';
import { ExcelStylePositionStrategy } from './excel-style/excel-style-position-strategy';
import { AbsoluteScrollStrategy } from '../../services/overlay/scroll/absolute-scroll-strategy';
import { IgxGridExcelStyleFilteringComponent } from './excel-style/grid.excel-style-filtering.component';
import { IgxIconService } from '../../icon/icon.service';
import { editor, pinLeft, unpinLeft } from '@igniteui/material-icons-extended';

/**
 * @hidden
 */
export class ExpressionUI {
    public expression: IFilteringExpression;
    public beforeOperator: FilteringLogic;
    public afterOperator: FilteringLogic;
    public isSelected = false;
    public isVisible = true;
}

/**
 * @hidden
 */
@Injectable()
export class IgxFilteringService implements OnDestroy {
    public isFilterRowVisible = false;
    public filteredColumn: IgxColumnComponent = null;
    public selectedExpression: IFilteringExpression = null;
    public columnToMoreIconHidden = new Map<string, boolean>();
    public activeFilterCell = 0;
    public grid: IgxGridBaseDirective;

    private columnsWithComplexFilter = new Set<string>();
    private areEventsSubscribed = false;
    private destroy$ = new Subject<boolean>();
    private isFiltering = false;
    private columnToExpressionsMap = new Map<string, ExpressionUI[]>();
    private columnStartIndex = -1;
    private _componentOverlayId: string;
    private _filterMenuPositionSettings: PositionSettings;
    private _filterMenuOverlaySettings: OverlaySettings;
    private componentInstance: IgxGridExcelStyleFilteringComponent;
    private column;
    private lastActiveNode;

    constructor(
        private _moduleRef: NgModuleRef<any>,
        private iconService: IgxIconService,
        private _overlayService: IgxOverlayService,
        private _factoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        private _injector: Injector) {}

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    public toggleFilterDropdown(element: HTMLElement, column: IgxColumnComponent) {
        if (!this._componentOverlayId || (this.column && this.column.field !== column.field)) {
            this.initFilteringSettings();
            this.column = column;
            const filterIcon = this.column.filteringExpressionsTree ? 'igx-excel-filter__icon--filtered' : 'igx-excel-filter__icon';
            const filterIconTarget = element.querySelector(`.${filterIcon}`) as HTMLElement;

            this._filterMenuOverlaySettings.target = filterIconTarget;
            this._filterMenuOverlaySettings.outlet = (this.grid as any).outlet;

            this.componentInstance =
                this.grid.excelStyleFilteringComponent ??
                this.createComponentInstance(IgxGridExcelStyleFilteringComponent);
            this.componentInstance.initialize(this.column, this._overlayService);

            this._componentOverlayId = this._overlayService.attach(this.componentInstance.element, this._filterMenuOverlaySettings);
            this.componentInstance.overlayComponentId = this._componentOverlayId;

            this._overlayService.show(this._componentOverlayId);
        }
    }

    public initFilteringSettings() {
        this._filterMenuPositionSettings = {
            verticalStartPoint: VerticalAlignment.Bottom,
            openAnimation: useAnimation(fadeIn, { params: { duration: '250ms' }}),
            closeAnimation: null
        };
        this._filterMenuOverlaySettings = {
            closeOnOutsideClick: true,
            modal: false,
            positionStrategy: new ExcelStylePositionStrategy(this._filterMenuPositionSettings),
            scrollStrategy: new AbsoluteScrollStrategy()
        };

        this._overlayService.opening.pipe(
            first((overlay) => overlay.id === this._componentOverlayId),
            takeUntil(this.destroy$)).subscribe(() => {
                this.lastActiveNode = this.grid.navigation.activeNode;
            });

        this._overlayService.closed.pipe(
            first((overlay) => overlay.id === this._componentOverlayId),
            takeUntil(this.destroy$)).subscribe((   ) => {
                if (this.componentInstance) {
                    this.componentInstance.column = null;
                }
                this._overlayService.detach(this._componentOverlayId);
                this._componentOverlayId = null;
                this.grid.navigation.activeNode = this.lastActiveNode;
                this.grid.theadRow.nativeElement.focus();
            });
    }

    public hideExcelFiltering() {
        if (this._componentOverlayId) {
            this._overlayService.hide(this._componentOverlayId);
        }
    }

    /**
     * Subscribe to grid's events.
     */
    public subscribeToEvents() {
        if (!this.areEventsSubscribed) {
            this.areEventsSubscribed = true;

            this.grid.columnResized.pipe(takeUntil(this.destroy$)).subscribe((eventArgs: IColumnResizeEventArgs) => {
                this.updateFilteringCell(eventArgs.column);
            });

            this.grid.parentVirtDir.chunkLoad.pipe(takeUntil(this.destroy$)).subscribe((eventArgs: IForOfState) => {
                if (eventArgs.startIndex !== this.columnStartIndex) {
                    this.columnStartIndex = eventArgs.startIndex;
                    this.grid.filterCellList.forEach((filterCell) => {
                        filterCell.updateFilterCellArea();
                    });
                }
            });

            this.grid.columnMovingEnd.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.grid.filterCellList.forEach((filterCell) => {
                    filterCell.updateFilterCellArea();
                });
            });
        }
    }

    /**
     * Close filtering row if a column is hidden.
     */
    public hideFilteringRowOnColumnVisibilityChange(col: IgxColumnComponent) {
        const filteringRow = this.grid.filteringRow;

        if (filteringRow && filteringRow.column && filteringRow.column === col) {
            filteringRow.close();
        }
    }

    /**
     * Internal method to create expressionsTree and filter grid used in both filter modes.
     */
    public filterInternal(field: string, expressions: FilteringExpressionsTree | Array<ExpressionUI> = null): void {
        this.isFiltering = true;

        let expressionsTree;
        if (expressions instanceof FilteringExpressionsTree) {
            expressionsTree = expressions;
        } else {
            expressionsTree = this.createSimpleFilteringTree(field, expressions);
        }

        if (expressionsTree.filteringOperands.length === 0) {
            this.clearFilter(field);
        } else {
            this.filter(field, null, expressionsTree);
        }

        this.isFiltering = false;
    }

    /**
     * Execute filtering on the grid.
     */
    public filter(field: string, value: any, conditionOrExpressionTree?: IFilteringOperation | IFilteringExpressionsTree,
        ignoreCase?: boolean) {

        const grid = this.grid;

        const col = grid.getColumnByName(field);
        const filteringIgnoreCase = ignoreCase || (col ? col.filteringIgnoreCase : false);

        const filteringTree = grid.filteringExpressionsTree;
        const columnFilteringExpressionsTree = grid.filteringExpressionsTree.find(field) as IFilteringExpressionsTree;
        conditionOrExpressionTree = conditionOrExpressionTree ?? columnFilteringExpressionsTree;
        const fieldFilterIndex = filteringTree.findIndex(field);
        if (fieldFilterIndex > -1) {
            filteringTree.filteringOperands.splice(fieldFilterIndex, 1);
        }
        const newFilteringTree: FilteringExpressionsTree =
            this.prepare_filtering_expression(filteringTree, field, value, conditionOrExpressionTree,
            filteringIgnoreCase, fieldFilterIndex, true);

        const eventArgs: IFilteringEventArgs = { owner: grid,
            filteringExpressions: newFilteringTree.find(field) as FilteringExpressionsTree, cancel: false };
        this.grid.filtering.emit(eventArgs);

        if (eventArgs.cancel) {
            return;
        }

        if (conditionOrExpressionTree) {
            this.filter_internal(field, value, conditionOrExpressionTree, filteringIgnoreCase);
        } else {
            const expressionsTreeForColumn = this.grid.filteringExpressionsTree.find(field);
            if (!expressionsTreeForColumn) {
                throw new Error('Invalid condition or Expression Tree!');
            } else if (expressionsTreeForColumn instanceof FilteringExpressionsTree) {
                this.filter_internal(field, value, expressionsTreeForColumn, filteringIgnoreCase );
            } else {
                const expressionForColumn = expressionsTreeForColumn as IFilteringExpression;
                this.filter_internal(field, value, expressionForColumn.condition, filteringIgnoreCase );
            }
        }
        const doneEventArgs = this.grid.filteringExpressionsTree.find(field) as FilteringExpressionsTree;
        // Wait for the change detection to update filtered data through the pipes and then emit the event.
        requestAnimationFrame(() => this.grid.filteringDone.emit(doneEventArgs));
    }

    public filter_global(term, condition, ignoreCase) {
        if (!condition) {
            return;
        }

        const grid = this.grid;
        const filteringTree = grid.filteringExpressionsTree;
        grid.crudService.endEdit(false);
        if (grid.paginator) {
            grid.paginator.page = 0;
        }

        filteringTree.filteringOperands = [];
        for (const column of grid.columns) {
            this.prepare_filtering_expression(filteringTree, column.field, term,
                condition, ignoreCase || column.filteringIgnoreCase);
        }

        grid.filteringExpressionsTree = filteringTree;
    }

    /**
     * Clears the filter of a given column if name is provided. Otherwise clears the filters of all columns.
     */
    public clearFilter(field: string): void {
        if (field) {
            const column = this.grid.getColumnByName(field);
            if (!column) {
                return;
            }
        }

        const onFilteringEventArgs: IFilteringEventArgs = {
            owner: this.grid,
            filteringExpressions: null,
            cancel: false };

        this.grid.filtering.emit(onFilteringEventArgs);

        if (onFilteringEventArgs.cancel) {
            return;
        }

        this.isFiltering = true;
        this.clear_filter(field);

        // Wait for the change detection to update filtered data through the pipes and then emit the event.
        requestAnimationFrame(() => this.grid.filteringDone.emit(null));

        if (field) {
            const expressions = this.getExpressions(field);
            expressions.length = 0;
        } else {
            this.grid.columns.forEach(c => {
                const expressions = this.getExpressions(c.field);
                expressions.length = 0;
            });
        }

        this.isFiltering = false;
    }

    public clear_filter(fieldName: string) {
        const grid = this.grid;
        grid.crudService.endEdit(false);
        const filteringState = grid.filteringExpressionsTree;
        const index = filteringState.findIndex(fieldName);

        if (index > -1) {
            filteringState.filteringOperands.splice(index, 1);
        } else if (!fieldName) {
            filteringState.filteringOperands = [];
        }

        grid.filteringExpressionsTree = filteringState;
    }

    /**
     * Filters all the `IgxColumnComponent` in the `IgxGridComponent` with the same condition.
     */
    public filterGlobal(value: any, condition, ignoreCase?) {
        if (!condition) {
            return;
        }

        const grid = this.grid;
        const filteringTree = grid.filteringExpressionsTree;
        const newFilteringTree = new FilteringExpressionsTree(filteringTree.operator, filteringTree.fieldName);

        for (const column of grid.columns) {
            this.prepare_filtering_expression(newFilteringTree, column.field, value, condition,
                ignoreCase || column.filteringIgnoreCase);
        }

        const eventArgs: IFilteringEventArgs = { owner: grid, filteringExpressions: newFilteringTree, cancel: false };
        grid.filtering.emit(eventArgs);
        if (eventArgs.cancel) {
            return;
        }

        this.grid.crudService.endEdit(false);
        if (grid.paginator) {
            grid.paginator.page = 0;
        }
        grid.filteringExpressionsTree = newFilteringTree;

        // Wait for the change detection to update filtered data through the pipes and then emit the event.
        requestAnimationFrame(() => this.grid.filteringDone.emit(this.grid.filteringExpressionsTree));
    }

    /**
     * Register filtering SVG icons in the icon service.
     */
    public registerSVGIcons(): void {
        const editorIcons = editor as any[];
        editorIcons.forEach(icon => this.iconService.addSvgIconFromText(icon.name, icon.value, 'imx-icons'));
        this.iconService.addSvgIconFromText(pinLeft.name, pinLeft.value, 'imx-icons');
        this.iconService.addSvgIconFromText(unpinLeft.name, unpinLeft.value, 'imx-icons');
    }

    /**
     * Returns the ExpressionUI array for a given column.
     */
    public getExpressions(columnId: string): ExpressionUI[] {
        if (!this.columnToExpressionsMap.has(columnId)) {
            const column = this.grid.columns.find((col) => col.field === columnId);
            const expressionUIs = new Array<ExpressionUI>();
            if (column) {
                this.generateExpressionsList(column.filteringExpressionsTree, this.grid.filteringExpressionsTree.operator, expressionUIs);
                this.columnToExpressionsMap.set(columnId, expressionUIs);
            }
            return expressionUIs;
        }

        return this.columnToExpressionsMap.get(columnId);
    }

    /**
     * Recreates all ExpressionUIs for all columns. Executed after filtering to refresh the cache.
     */
    public refreshExpressions() {
        if (!this.isFiltering) {
            this.columnsWithComplexFilter.clear();

            this.columnToExpressionsMap.forEach((value: ExpressionUI[], key: string) => {
                const column = this.grid.columns.find((col) => col.field === key);
                if (column) {
                    value.length = 0;

                    this.generateExpressionsList(column.filteringExpressionsTree, this.grid.filteringExpressionsTree.operator, value);

                    const isComplex = this.isFilteringTreeComplex(column.filteringExpressionsTree);
                    if (isComplex) {
                        this.columnsWithComplexFilter.add(key);
                    }

                    this.updateFilteringCell(column);
                } else {
                    this.columnToExpressionsMap.delete(key);
                }
            });
        }
    }

    /**
     * Remove an ExpressionUI for a given column.
     */
    public removeExpression(columnId: string, indexToRemove: number) {
        const expressionsList = this.getExpressions(columnId);

        if (indexToRemove === 0 && expressionsList.length > 1) {
            expressionsList[1].beforeOperator = null;
        } else if (indexToRemove === expressionsList.length - 1) {
            expressionsList[indexToRemove - 1].afterOperator = null;
        } else {
            expressionsList[indexToRemove - 1].afterOperator = expressionsList[indexToRemove + 1].beforeOperator;
            expressionsList[0].beforeOperator = null;
            expressionsList[expressionsList.length - 1].afterOperator = null;
        }

        expressionsList.splice(indexToRemove, 1);
    }

    /**
     * Generate filtering tree for a given column from existing ExpressionUIs.
     */
    public createSimpleFilteringTree(columnId: string, expressionUIList = null): FilteringExpressionsTree {
        const expressionsList = expressionUIList ? expressionUIList : this.getExpressions(columnId);
        const expressionsTree = new FilteringExpressionsTree(FilteringLogic.Or, columnId);
        let currAndBranch: FilteringExpressionsTree;

        for (const currExpressionUI of expressionsList) {
            if (!currExpressionUI.expression.condition.isUnary && currExpressionUI.expression.searchVal === null) {
                if (currExpressionUI.afterOperator === FilteringLogic.And && !currAndBranch) {
                    currAndBranch = new FilteringExpressionsTree(FilteringLogic.And, columnId);
                    expressionsTree.filteringOperands.push(currAndBranch);
                }
                continue;
            }

            if ((currExpressionUI.beforeOperator === undefined || currExpressionUI.beforeOperator === null ||
                currExpressionUI.beforeOperator === FilteringLogic.Or) &&
                currExpressionUI.afterOperator === FilteringLogic.And) {

                currAndBranch = new FilteringExpressionsTree(FilteringLogic.And, columnId);
                expressionsTree.filteringOperands.push(currAndBranch);
                currAndBranch.filteringOperands.push(currExpressionUI.expression);

            } else if (currExpressionUI.beforeOperator === FilteringLogic.And) {
                currAndBranch.filteringOperands.push(currExpressionUI.expression);
            } else {
                expressionsTree.filteringOperands.push(currExpressionUI.expression);
                currAndBranch = null;
            }
        }

        return expressionsTree;
    }

    /**
     * Returns whether a complex filter is applied to a given column.
     */
    public isFilterComplex(columnId: string) {
        if (this.columnsWithComplexFilter.has(columnId)) {
            return true;
        }

        const column = this.grid.columns.find((col) => col.field === columnId);
        const isComplex = column && this.isFilteringTreeComplex(column.filteringExpressionsTree);
        if (isComplex) {
            this.columnsWithComplexFilter.add(columnId);
        }

        return isComplex;
    }

    /**
     * Returns the string representation of the FilteringLogic operator.
     */
    public getOperatorAsString(operator: FilteringLogic): any {
        if (operator === 0) {
            return this.grid.resourceStrings.igx_grid_filter_operator_and;
        } else {
            return this.grid.resourceStrings.igx_grid_filter_operator_or;
        }
    }

    /**
     * Generate the label of a chip from a given filtering expression.
     */
    public getChipLabel(expression: IFilteringExpression): any {
        if (expression.condition.isUnary) {
            return this.grid.resourceStrings[`igx_grid_filter_${expression.condition.name}`] || expression.condition.name;
        } else if (expression.searchVal instanceof Date) {
            const column = this.grid.getColumnByName(expression.fieldName);
            const formatter = column.formatter;
            if (formatter) {
                return formatter(expression.searchVal);
            }
            const pipeArgs = column.pipeArgs;
            return this.grid.datePipe.transform(expression.searchVal, pipeArgs.format, undefined, this.grid.locale);
        } else {
            return expression.searchVal;
        }
    }

    /**
     * Updates the content of a filterCell.
     */
    public updateFilteringCell(column: IgxColumnComponent) {
        const filterCell = column.filterCell;
        if (filterCell) {
            filterCell.updateFilterCellArea();
        }
    }

    public get filteredData() {
        return this.grid.filteredData;
    }

    public generateExpressionsList(expressions: IFilteringExpressionsTree | IFilteringExpression,
        operator: FilteringLogic,
        expressionsUIs: ExpressionUI[]): void {
        this.generateExpressionsListRecursive(expressions, operator, expressionsUIs);

        // The beforeOperator of the first expression and the afterOperator of the last expression should be null
        if (expressionsUIs.length) {
            expressionsUIs[expressionsUIs.length - 1].afterOperator = null;
        }
    }

    public isFilteringExpressionsTreeEmpty(expressionTree: IFilteringExpressionsTree): boolean {
        if (FilteringExpressionsTree.empty(expressionTree)) {
            return true;
        }

        for (const expr of expressionTree.filteringOperands) {
            if ((expr instanceof FilteringExpressionsTree)) {
                const exprTree = expr as FilteringExpressionsTree;
                if (exprTree.filteringOperands && exprTree.filteringOperands.length) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    }

    private filter_internal(fieldName: string, term, conditionOrExpressionsTree: IFilteringOperation | IFilteringExpressionsTree,
        ignoreCase: boolean) {
        const grid = this.grid;
        const filteringTree = grid.filteringExpressionsTree;
        this.grid.crudService.endEdit(false);

        if (grid.paginator) {
            grid.paginator.page = 0;
        }

        const fieldFilterIndex = filteringTree.findIndex(fieldName);
        if (fieldFilterIndex > -1) {
            filteringTree.filteringOperands.splice(fieldFilterIndex, 1);
        }

        this.prepare_filtering_expression(filteringTree, fieldName, term, conditionOrExpressionsTree, ignoreCase, fieldFilterIndex);
        grid.filteringExpressionsTree = filteringTree;
    }

    /** Modifies the filteringState object to contain the newly added fitering conditions/expressions.
     * If createNewTree is true, filteringState will not be modified (because it directly affects the grid.filteringExpressionsTree),
     * but a new object is created and returned.
     */
    private prepare_filtering_expression(
        filteringState: IFilteringExpressionsTree,
        fieldName: string,
        searchVal,
        conditionOrExpressionsTree: IFilteringOperation | IFilteringExpressionsTree,
        ignoreCase: boolean,
        insertAtIndex = -1,
        createNewTree = false): FilteringExpressionsTree {

        const oldExpressionsTreeIndex = filteringState.findIndex(fieldName);
        const expressionsTree = conditionOrExpressionsTree instanceof FilteringExpressionsTree ?
            conditionOrExpressionsTree as IFilteringExpressionsTree : null;
        const condition = conditionOrExpressionsTree instanceof FilteringExpressionsTree ?
            null : conditionOrExpressionsTree as IFilteringOperation;
        const newExpression: IFilteringExpression = { fieldName, searchVal, condition, ignoreCase };

        const newExpressionsTree: FilteringExpressionsTree = createNewTree ?
            new FilteringExpressionsTree(filteringState.operator, filteringState.fieldName) : filteringState as FilteringExpressionsTree;

        if (oldExpressionsTreeIndex === -1) {
            // no expressions tree found for this field
            if (expressionsTree) {
                if (insertAtIndex > -1) {
                    newExpressionsTree.filteringOperands.splice(insertAtIndex, 0, expressionsTree);
                } else {
                    newExpressionsTree.filteringOperands.push(expressionsTree);
                }
            } else if (condition) {
                // create expressions tree for this field and add the new expression to it
                const newExprTree: FilteringExpressionsTree = new FilteringExpressionsTree(filteringState.operator, fieldName);
                newExprTree.filteringOperands.push(newExpression);
                newExpressionsTree.filteringOperands.push(newExprTree);
            }
        }

        return newExpressionsTree;
    }


    private isFilteringTreeComplex(expressions: IFilteringExpressionsTree | IFilteringExpression): boolean {
        if (!expressions) {
            return false;
        }

        if (expressions instanceof FilteringExpressionsTree) {
            const expressionsTree = expressions as FilteringExpressionsTree;
            if (expressionsTree.operator === FilteringLogic.Or) {
                const andOperatorsCount = this.getChildAndOperatorsCount(expressionsTree);

                // having more that 'And' and operator in the sub-tree means that the filter could not be represented without parentheses.
                return andOperatorsCount > 1;
            }

            let isComplex = false;
            for (const operand of expressionsTree.filteringOperands) {
                isComplex = isComplex || this.isFilteringTreeComplex(operand);
            }

            return isComplex;
        }

        return false;
    }

    private getChildAndOperatorsCount(expressions: IFilteringExpressionsTree): number {
        let count = 0;
        let operand;
        for (let i = 0; i < expressions.filteringOperands.length; i++) {
            operand = expressions[i];
            if (operand instanceof FilteringExpressionsTree) {
                if (operand.operator === FilteringLogic.And) {
                    count++;
                }

                count = count + this.getChildAndOperatorsCount(operand);
            }
        }

        return count;
    }

    private generateExpressionsListRecursive(expressions: IFilteringExpressionsTree | IFilteringExpression,
        operator: FilteringLogic,
        expressionsUIs: ExpressionUI[]): void {
        if (!expressions) {
            return;
        }

        if (expressions instanceof FilteringExpressionsTree) {
            const expressionsTree = expressions as FilteringExpressionsTree;
            for (const operand of expressionsTree.filteringOperands) {
                this.generateExpressionsListRecursive(operand, expressionsTree.operator, expressionsUIs);
            }
            if (expressionsUIs.length) {
                expressionsUIs[expressionsUIs.length - 1].afterOperator = operator;
            }
        } else {
            const exprUI = new ExpressionUI();
            exprUI.expression = expressions as IFilteringExpression;
            exprUI.afterOperator = operator;

            const prevExprUI = expressionsUIs[expressionsUIs.length - 1];
            if (prevExprUI) {
                exprUI.beforeOperator = prevExprUI.afterOperator;
            }

            expressionsUIs.push(exprUI);
        }
    }

    private createComponentInstance(component: any) {
        let dynamicFactory: ComponentFactory<any>;
        const factoryResolver = this._moduleRef
            ? this._moduleRef.componentFactoryResolver
            : this._factoryResolver;
        try {
            dynamicFactory = factoryResolver.resolveComponentFactory(component);
        } catch (error) {
            console.error(error);
            return null;
        }

        const injector = this._moduleRef
            ? this._moduleRef.injector
            : this._injector;
        const dynamicComponent: ComponentRef<any> = dynamicFactory.create(
            injector
        );
        this._appRef.attachView(dynamicComponent.hostView);

        return dynamicComponent.instance;
    }
}
