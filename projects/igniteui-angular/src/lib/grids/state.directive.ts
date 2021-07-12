import { Directive, Optional, Input, NgModule, Host, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { ISortingExpression } from '../data-operations/sorting-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { IgxColumnComponent } from './columns/column.component';
import { IGroupingExpression } from '../data-operations/grouping-expression.interface';
import { IPagingState } from '../data-operations/paging-state.interface';
import { GridColumnDataType } from '../data-operations/data-util';
import { IgxBooleanFilteringOperand, IgxNumberFilteringOperand, IgxDateFilteringOperand,
    IgxStringFilteringOperand, IFilteringOperation} from '../data-operations/filtering-condition';
import { GridSelectionRange } from './selection/selection.service';
import { IGroupByExpandState } from '../data-operations/groupby-expand-state.interface';
import { IGroupingState } from '../data-operations/groupby-state.interface';
import { IgxGridBaseDirective } from './grid-base.directive';
import { IgxGridComponent } from './grid/grid.component';
import { IgxHierarchicalGridComponent } from './hierarchical-grid/hierarchical-grid.component';
import { IPinningConfig } from './grid.common';
import { delay, take } from 'rxjs/operators';

export interface IGridState {
    columns?: IColumnState[];
    filtering?: IFilteringExpressionsTree;
    advancedFiltering?: IFilteringExpressionsTree;
    paging?: IPagingState;
    sorting?: ISortingExpression[];
    groupBy?: IGroupingState;
    cellSelection?: GridSelectionRange[];
    rowSelection?: any[];
    columnSelection?: string[];
    rowPinning?: any[];
    pinningConfig?: IPinningConfig;
    expansion?: any[];
    rowIslands?: IGridStateCollection[];
    id?: string;
}

export interface IGridStateCollection {
    id: string;
    parentRowID: any;
    state: IGridState;
}

export interface IGridStateOptions {
    columns?: boolean;
    filtering?: boolean;
    advancedFiltering?: boolean;
    sorting?: boolean;
    groupBy?: boolean;
    paging?: boolean;
    cellSelection?: boolean;
    rowSelection?: boolean;
    columnSelection?: boolean;
    rowPinning?: boolean;
    pinningConfig?: boolean;
    expansion?: boolean;
    rowIslands?: boolean;
}

export interface IColumnState {
    pinned: boolean;
    sortable: boolean;
    filterable: boolean;
    editable: boolean;
    sortingIgnoreCase: boolean;
    filteringIgnoreCase: boolean;
    headerClasses: string;
    headerGroupClasses: string;
    maxWidth: string;
    groupable: boolean;
    movable: boolean;
    hidden: boolean;
    dataType: GridColumnDataType;
    hasSummary: boolean;
    field: string;
    width: any;
    header: string;
    resizable: boolean;
    searchable: boolean;
}

export type GridFeatures = keyof IGridStateOptions;

interface Feature {
    getFeatureState: (context: IgxGridStateDirective) => IGridState;
    restoreFeatureState: (context: IgxGridStateDirective, state: IColumnState[] | IPagingState | ISortingExpression[] |
        IGroupingState | IFilteringExpressionsTree | GridSelectionRange[] | IPinningConfig | any[]) => void;
}

@Directive({
    selector: '[igxGridState]'
})
export class IgxGridStateDirective {
    private static ngAcceptInputType_options: IGridStateOptions | '';

    private featureKeys: GridFeatures[] = [];
    private state: IGridState;
    private currGrid: IgxGridBaseDirective;
    private _options: IGridStateOptions = {
        columns: true,
        filtering: true,
        advancedFiltering: true,
        sorting: true,
        groupBy: true,
        paging: true,
        cellSelection: true,
        rowSelection: true,
        columnSelection: true,
        rowPinning: true,
        expansion: true,
        rowIslands: true
    };
    private FEATURES = {
        sorting:  {
            getFeatureState: (context: IgxGridStateDirective): IGridState => {
                const sortingState = context.currGrid.sortingExpressions;
                sortingState.forEach(s => {
                    delete s.strategy;
                    delete s.owner;
                });
                return { sorting: sortingState };
            },
            restoreFeatureState: (context: IgxGridStateDirective, state: ISortingExpression[]): void => {
                context.currGrid.sortingExpressions = state;
            }
        },
        filtering: {
            getFeatureState: (context: IgxGridStateDirective): IGridState => {
                const filteringState = context.currGrid.filteringExpressionsTree;
                if (filteringState) {
                    delete filteringState.owner;
                    for (const item of filteringState.filteringOperands) {
                        delete (item as IFilteringExpressionsTree).owner;
                    }
                }
                return { filtering: filteringState };
            },
            restoreFeatureState: (context: IgxGridStateDirective, state: FilteringExpressionsTree): void => {
                const filterTree = context.createExpressionsTreeFromObject(state);
                context.currGrid.filteringExpressionsTree = filterTree as FilteringExpressionsTree;
            }
        },
        advancedFiltering: {
            getFeatureState: (context: IgxGridStateDirective): IGridState => {
                const filteringState = context.currGrid.advancedFilteringExpressionsTree;
                let advancedFiltering: any;
                if (filteringState) {
                    delete filteringState.owner;
                    for (const item of filteringState.filteringOperands) {
                        delete (item as IFilteringExpressionsTree).owner;
                    }
                    advancedFiltering = filteringState;
                } else {
                    advancedFiltering = {};
                }
                return { advancedFiltering };
            },
            restoreFeatureState: (context: IgxGridStateDirective, state: FilteringExpressionsTree): void => {
                const filterTree = context.createExpressionsTreeFromObject(state);
                context.currGrid.advancedFilteringExpressionsTree = filterTree as FilteringExpressionsTree;
            }
        },
        columns: {
            getFeatureState: (context: IgxGridStateDirective): IGridState => {
                const gridColumns: IColumnState[] = context.currGrid.columns.map((c) => ({
                        pinned: c.pinned,
                        sortable: c.sortable,
                        filterable: c.filterable,
                        editable: c.editable,
                        sortingIgnoreCase: c.sortingIgnoreCase,
                        filteringIgnoreCase: c.filteringIgnoreCase,
                        headerClasses: c.headerClasses,
                        headerGroupClasses: c.headerGroupClasses,
                        maxWidth: c.maxWidth,
                        groupable: c.groupable,
                        movable: c.movable,
                        hidden: c.hidden,
                        dataType: c.dataType,
                        hasSummary: c.hasSummary,
                        field: c.field,
                        width: c.width,
                        header: c.header,
                        resizable: c.resizable,
                        searchable: c.searchable,
                        selectable: c.selectable
                    }));
                return { columns: gridColumns };
            },
            restoreFeatureState: (context: IgxGridStateDirective, state: IColumnState[]): void => {
                const newColumns = [];
                const factory = context.resolver.resolveComponentFactory(IgxColumnComponent);
                state.forEach((colState) => {
                    const ref = factory.create(context.viewRef.injector);
                    Object.assign(ref.instance, colState);
                    ref.changeDetectorRef.detectChanges();
                    newColumns.push(ref.instance);
                });
                context.currGrid.columnList.reset(newColumns);
                context.currGrid.columnList.notifyOnChanges();
            }
        },
        groupBy: {
            getFeatureState: (context: IgxGridStateDirective): IGridState => {
                const grid = context.currGrid as IgxGridComponent;
                const groupingExpressions = grid.groupingExpressions;
                groupingExpressions.forEach(expr => {
                    delete expr.strategy;
                });
                const expansionState = grid.groupingExpansionState;
                const groupsExpanded = grid.groupsExpanded;

                return { groupBy: { expressions: groupingExpressions, expansion: expansionState, defaultExpanded: groupsExpanded}  };
            },
            restoreFeatureState: (context: IgxGridStateDirective, state: IGroupingState): void => {
                const grid = context.currGrid as IgxGridComponent;
                grid.groupingExpressions = state.expressions as IGroupingExpression[];
                if (grid.groupsExpanded !== state.defaultExpanded) {
                    grid.toggleAllGroupRows();
                } else {
                    grid.groupingExpansionState = state.expansion as IGroupByExpandState[];
                }
            }
        },
        paging: {
            getFeatureState: (context: IgxGridStateDirective): IGridState => {
                const pagingState = context.currGrid.pagingState;
                return { paging: pagingState };
            },
            restoreFeatureState: (context: IgxGridStateDirective, state: IPagingState): void => {
                if (!context.currGrid.paginator) {
                    return;
                }
                if (context.currGrid.paginator.perPage !== state.recordsPerPage) {
                    context.currGrid.paginator.perPage = state.recordsPerPage;
                    context.currGrid.cdr.detectChanges();
                }
                context.currGrid.paginator.page = state.index;
            }
        },
        rowSelection: {
            getFeatureState: (context: IgxGridStateDirective): IGridState => {
                const selection = context.currGrid.selectedRows;
                return { rowSelection: selection };
            },
            restoreFeatureState: (context: IgxGridStateDirective, state: any[]): void => {
                context.currGrid.selectRows(state, true);
            }
        },
        cellSelection: {
            getFeatureState: (context: IgxGridStateDirective): IGridState => {
                const selection = context.currGrid.getSelectedRanges().map(range =>
                    ({ rowStart: range.rowStart, rowEnd: range.rowEnd, columnStart: range.columnStart, columnEnd: range.columnEnd }));
                return { cellSelection: selection };
            },
            restoreFeatureState: (context: IgxGridStateDirective, state: GridSelectionRange[]): void => {
                state.forEach(r => {
                    const range = { rowStart: r.rowStart, rowEnd: r.rowEnd, columnStart: r.columnStart, columnEnd: r.columnEnd};
                    context.currGrid.selectRange(range);
                });
            }
        },
        columnSelection: {
            getFeatureState: (context: IgxGridStateDirective): IGridState => {
                const selection = context.currGrid.selectedColumns().map(c => c.field);
                return { columnSelection: selection };
            },
            restoreFeatureState: (context: IgxGridStateDirective, state: string[]): void => {
                context.currGrid.deselectAllColumns();
                context.currGrid.selectColumns(state);
            }
        },
        rowPinning: {
            getFeatureState: (context: IgxGridStateDirective): IGridState => {
                const pinned = context.currGrid.pinnedRows.map(x => x.rowID);
                return { rowPinning: pinned };
            },
            restoreFeatureState: (context: IgxGridStateDirective, state: any[]): void => {
                // clear current state.
                context.currGrid.pinnedRows.forEach(row => row.unpin());
                state.forEach(rowID => context.currGrid.pinRow(rowID));
            }
        },
        pinningConfig: {
            getFeatureState: (context: IgxGridStateDirective): IGridState => ({ pinningConfig: context.currGrid.pinning }),
            restoreFeatureState: (context: IgxGridStateDirective, state: IPinningConfig): void => {
                context.currGrid.pinning = state;
            }
        },
        expansion: {
            getFeatureState: (context: IgxGridStateDirective): IGridState => {
                const expansionStates = Array.from(context.currGrid.expansionStates);
                return { expansion: expansionStates };
            },
            restoreFeatureState: (context: IgxGridStateDirective, state: any[]): void => {
                const expansionStates = new Map<any, boolean>(state);
                context.currGrid.expansionStates = expansionStates;
            }
        },
        rowIslands: {
            getFeatureState(context: IgxGridStateDirective): IGridState {
                const childGridStates: IGridStateCollection[] = [];
                const rowIslands = (context.currGrid as any).allLayoutList;
                if (rowIslands) {
                    rowIslands.forEach(rowIsland => {
                        const childGrids = rowIsland.rowIslandAPI.getChildGrids();
                        childGrids.forEach(chGrid => {
                            const parentRowID = this.getParentRowID(chGrid);
                            context.currGrid = chGrid;
                            if (context.currGrid) {
                                const childGridState = context.buildState(context.featureKeys) as IGridState;
                                childGridStates.push({ id: `${rowIsland.id}`, parentRowID, state: childGridState });
                            }
                        });
                    });
                }
                context.currGrid = context.grid;
                return { rowIslands: childGridStates };
            },
            restoreFeatureState(context: IgxGridStateDirective, state: any): void {
                const rowIslands = (context.currGrid as any).allLayoutList;
                if (rowIslands) {
                    rowIslands.forEach(rowIsland => {
                        const childGrids = rowIsland.rowIslandAPI.getChildGrids();
                        childGrids.forEach(chGrid => {
                            const parentRowID = this.getParentRowID(chGrid);
                            context.currGrid = chGrid;
                            const childGridState = state.find(st => st.id === rowIsland.id && st.parentRowID === parentRowID);
                            if (childGridState && context.currGrid) {
                                context.restoreGridState(childGridState.state, context.featureKeys);
                            }
                        });
                    });
                }
                context.currGrid = context.grid;
            },
            /**
             * Traverses the hierarchy up to the root grid to return the ID of the expanded row.
             */
            getParentRowID: (grid: IgxHierarchicalGridComponent) => {
                let childGrid;
                while (grid.parent) {
                    childGrid = grid;
                    grid = grid.parent;
                }
                return grid.hgridAPI.getParentRowId(childGrid);
            }
        }
    };

    /**
     *  An object with options determining if a certain feature state should be saved.
     * ```html
     * <igx-grid [igxGridState]="options"></igx-grid>
     * ```
     * ```typescript
     * public options = {selection: false, advancedFiltering: false};
     * ```
     */
    @Input('igxGridState')
    public get options(): IGridStateOptions {
       return this._options;
    }

    public set options(value: IGridStateOptions) {
        Object.assign(this._options, value);
        if (!(this.grid instanceof IgxGridComponent)) {
            delete this._options.groupBy;
        } else {
            delete this._options.rowIslands;
        }
    }

    /**
     * @hidden
     */
    constructor(
        @Host() @Optional() public grid: IgxGridBaseDirective,
        private resolver: ComponentFactoryResolver,
        private viewRef: ViewContainerRef) { }

    /**
     * Gets the state of a feature or states of all grid features, unless a certain feature is disabled through the `options` property.
     *
     * @param `serialize` determines whether the returned object will be serialized to JSON string. Default value is true.
     * @param `feature` string or array of strings determining the features to be added in the state. If skipped, all features are added.
     * @returns Returns the serialized to JSON string IGridState object, or the non-serialized IGridState object.
     * ```html
     * <igx-grid [igxGridState]="options"></igx-grid>
     * ```
     * ```typescript
     * @ViewChild(IgxGridStateDirective, { static: true }) public state;
     * let state = this.state.getState(); // returns string
     * let state = this.state(false) // returns `IGridState` object
     * ```
     */
    public getState(serialize = true, features?: GridFeatures | GridFeatures[]): IGridState | string  {
        let state: IGridState | string;
        this.currGrid = this.grid;
        this.state = state = this.buildState(features) as IGridState;
        if (serialize) {
            state = JSON.stringify(state, this.stringifyCallback) as string;
        }
        return state;
    }

    /**
     * Restores grid features' state based on the IGridState object passed as an argument.
     *
     * @param IGridState object to restore state from.
     * @returns
     * ```html
     * <igx-grid [igxGridState]="options"></igx-grid>
     * ```
     * ```typescript
     * @ViewChild(IgxGridStateDirective, { static: true }) public state;
     * this.state.setState(gridState);
     * ```
     */
    public setState(state: IGridState | string, features?: GridFeatures | GridFeatures[]) {
        if (typeof state === 'string') {
            state = JSON.parse(state) as IGridState;
        }
        this.state = state;
        this.currGrid = this.grid;
        this.restoreGridState(state, features);
        this.grid.cdr.detectChanges(); // TODO
    }

    /**
     * Builds an IGridState object.
     */
    private buildState(keys?: GridFeatures | GridFeatures[]): IGridState {
        this.applyFeatures(keys);
        let gridState = {} as IGridState;
        this.featureKeys.forEach(f => {
            if (this.options[f]) {
                if (!(this.grid instanceof IgxGridComponent) && f === 'groupBy') {
                    return;
                }
                const feature = this.getFeature(f);
                const featureState: IGridState = feature.getFeatureState(this);
                gridState = Object.assign(gridState, featureState);
            }
        });
        return gridState;
    }

    /**
     * The method that calls corresponding methods to restore features from the passed IGridState object.
     */
    private restoreGridState(state: IGridState, features?: GridFeatures | GridFeatures[]) {
        // TODO Notify the grid that columnList.changes is triggered by the state directive
        // instead of piping it like below
        const columns = 'columns';
        this.grid.columnList.changes.pipe(delay(0), take(1)).subscribe(() => {
            this.featureKeys = this.featureKeys.filter(f => f !== columns);
            this.restoreFeatures(state);
        });
        this.applyFeatures(features);
        if (this.featureKeys.includes(columns) && this.options[columns] && state[columns]) {
            this.getFeature(columns).restoreFeatureState(this, state[columns]);
        } else {
            this.restoreFeatures(state);
        }
    }

    private restoreFeatures(state: IGridState) {
        this.featureKeys.forEach(f => {
            if (this.options[f]) {
                const featureState = state[f];
                if (featureState) {
                    const feature = this.getFeature(f);
                    feature.restoreFeatureState(this, featureState);
                }
            }
        });
    }

    /**
     * Returns a collection of all grid features.
     */
    private applyFeatures(keys?: GridFeatures | GridFeatures[]) {
        this.featureKeys = [];
        if (!keys) {
            for (const key of Object.keys(this.options)) {
                this.featureKeys.push(key as GridFeatures);
            }
        } else if (Array.isArray(keys)) {
            this.featureKeys = [...keys as GridFeatures[]];
        } else {
            this.featureKeys.push(keys);
        }
    }

    /**
     * This method builds a FilteringExpressionsTree from a provided object.
     */
    private createExpressionsTreeFromObject(exprTreeObject: FilteringExpressionsTree): FilteringExpressionsTree {
        if (!exprTreeObject || !exprTreeObject.filteringOperands) {
            return null;
        }

        const expressionsTree = new FilteringExpressionsTree(exprTreeObject.operator, exprTreeObject.fieldName);

        for (const item of exprTreeObject.filteringOperands) {
            // Check if item is an expressions tree or a single expression.
            if ((item as FilteringExpressionsTree).filteringOperands) {
                const subTree = this.createExpressionsTreeFromObject((item as FilteringExpressionsTree));
                expressionsTree.filteringOperands.push(subTree);
            } else {
                const expr = item as IFilteringExpression;
                let dataType: string;
                if (this.currGrid.columnList.length > 0) {
                    dataType = this.currGrid.columnList.find(c => c.field === expr.fieldName).dataType;
                } else {
                    dataType = this.state.columns.find(c => c.field === expr.fieldName).dataType;
                }
                // when ESF, values are stored in Set.
                // First those values are converted to an array before returning string in the stringifyCallback
                // now we need to convert those back to Set
                if (Array.isArray(expr.searchVal)) {
                    expr.searchVal = new Set(expr.searchVal);
                } else {
                    expr.searchVal = (dataType === 'date') ? new Date(Date.parse(expr.searchVal)) : expr.searchVal;
                }
                expr.condition = this.generateFilteringCondition(dataType, expr.condition.name);
                expressionsTree.filteringOperands.push(expr);
            }
        }

        return expressionsTree;
    }

    /**
     * Returns the filtering logic function for a given dataType and condition (contains, greaterThan, etc.)
     */
    private generateFilteringCondition(dataType: string, name: string): IFilteringOperation {
        let filters;
        switch (dataType) {
            case GridColumnDataType.Boolean:
                filters = IgxBooleanFilteringOperand.instance();
                break;
            case GridColumnDataType.Number:
                filters = IgxNumberFilteringOperand.instance();
                break;
            case GridColumnDataType.Date:
                filters = IgxDateFilteringOperand.instance();
                break;
            case GridColumnDataType.String:
            default:
                filters = IgxStringFilteringOperand.instance();
                break;
        }
        return filters.condition(name);
    }

    private stringifyCallback(key: string, val: any) {
        if (key === 'searchVal' && val instanceof Set) {
            return Array.from(val);
        }
        return val;
    }

    private getFeature(key: string): Feature {
        const feature: Feature = this.FEATURES[key];
        return feature;
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxGridStateDirective],
    exports: [IgxGridStateDirective]
})
export class IgxGridStateModule { }
