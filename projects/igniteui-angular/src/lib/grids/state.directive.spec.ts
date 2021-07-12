import { TestBed, waitForAsync } from '@angular/core/testing';
import { IgxGridModule, IgxGridComponent } from './grid/public_api';
import { Component, ViewChild } from '@angular/core';
import { SampleTestData } from '../test-utils/sample-test-data.spec';
import { IgxGridStateDirective, IGridState, IColumnState } from './state.directive';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ISortingExpression, SortingDirection } from '../data-operations/sorting-expression.interface';
import { IGroupingExpression } from '../data-operations/grouping-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IPagingState } from '../data-operations/paging-state.interface';
import { GridSelectionRange } from './selection/selection.service';
import { IgxBooleanFilteringOperand } from '../data-operations/filtering-condition';
import { IGroupingState } from '../data-operations/groupby-state.interface';
import { IGroupByExpandState } from '../data-operations/groupby-expand-state.interface';
import { GridSelectionMode } from './common/enums';
import { configureTestSuite } from '../test-utils/configure-suite';
import { FilteringLogic } from '../data-operations/filtering-expression.interface';
import { DefaultSortingStrategy } from '../data-operations/sorting-strategy';

/* eslint-disable max-len */
describe('IgxGridState - input properties #grid', () => {
    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridStateComponent,
                IgxGridStateWithOptionsComponent,
                IgxGridStateWithDetailsComponent
            ],
            imports: [ NoopAnimationsModule, IgxGridModule ]
        });
    }));

    it('should initialize an IgxGridState with default options object', () => {
        const defaultOptions = {
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
            expansion: true
        };

        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();

        const state = fix.componentInstance.state;

        expect(state).toBeDefined('IgxGridState directive is initialized');
        expect(state.options).toEqual(jasmine.objectContaining(defaultOptions));
    });

    it('should initialize an IgxGridState with correct options input', () => {
        const optionsInput = {
            columns: true,
            filtering: false,
            advancedFiltering: true,
            sorting: false,
            paging: true,
            cellSelection: true,
            rowSelection: true,
            columnSelection: true,
            rowPinning: true,
            expansion: true,
            groupBy: false,
        };

        const fix = TestBed.createComponent(IgxGridStateWithOptionsComponent);
        fix.detectChanges();

        const state = fix.componentInstance.state;
        expect(state.options).toEqual(jasmine.objectContaining(optionsInput));
    });

    it('getState should return corect JSON string', () => {
        const initialGridState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Prodyct Name","resizable":true,"searchable":true,"selectable":false},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true}],"filtering":{"filteringOperands":[],"operator":0},"advancedFiltering":{},"sorting":[],"groupBy":{"expressions":[],"expansion":[],"defaultExpanded":true},"paging":{"index":0,"recordsPerPage":15,"metadata":{"countPages":1,"countRecords":10,"error":0}},"cellSelection":[],"rowSelection":[],"columnSelection":[],"rowPinning":[],"expansion":[]}';
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();

        const state = fix.componentInstance.state;

        const gridState = state.getState();
        expect(gridState).toBe(initialGridState, 'JSON string representation of the initial grid state is not correct');
    });

    it('getState should return corect IGridState object when using default options', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;

        const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
        const productFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
        const productExpression = {
            condition: IgxBooleanFilteringOperand.instance().condition('true'),
            fieldName: 'InStock',
            ignoreCase: true
        };
        productFilteringExpressionsTree.filteringOperands.push(productExpression);
        gridFilteringExpressionsTree.filteringOperands.push(productFilteringExpressionsTree);

        const groupingExpressions = [
            { dir: SortingDirection.Asc, fieldName: 'ProductID', ignoreCase: false,
              strategy: DefaultSortingStrategy.instance() },
            { dir: SortingDirection.Asc, fieldName: 'OrderDate', ignoreCase: false,
              strategy: DefaultSortingStrategy.instance() }
        ];

        grid.filteringExpressionsTree = gridFilteringExpressionsTree;
        grid.groupingExpressions = groupingExpressions;
        fix.detectChanges();

        const columns = fix.componentInstance.columns;
        const paging = grid.pagingState;
        const sorting = grid.sortingExpressions;
        const groupBy = grid.groupingExpressions;
        const groupByExpansion = grid.groupingExpansionState;
        const filtering = grid.filteringExpressionsTree;
        const advancedFiltering = grid.advancedFilteringExpressionsTree;

        const gridState = state.getState(false) as IGridState;
        HelperFunctions.verifyColumns(columns, gridState);
        HelperFunctions.verifyPaging(paging, gridState);
        HelperFunctions.verifySortingExpressions(sorting, gridState);
        HelperFunctions.verifyGroupingExpressions(groupBy, gridState);
        HelperFunctions.verifyGroupingExpansion(groupByExpansion, gridState.groupBy);
        HelperFunctions.verifyFilteringExpressions(filtering, gridState);
    });

    it('getState should return corect IGridState object when options are not default', () => {
        const fix = TestBed.createComponent(IgxGridStateWithOptionsComponent);
        fix.detectChanges();
        const state = fix.componentInstance.state;

        let gridState = state.getState(false) as IGridState;
        expect(gridState['sorting']).toBeFalsy();
        expect(gridState['groupBy']).toBeFalsy();

        gridState = state.getState(false, ['filtering', 'sorting', 'groupBy']) as IGridState;
        expect(gridState['sorting']).toBeFalsy();
        expect(gridState['groupBy']).toBeFalsy();
    });

    it('getState should return corect filtering state', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();

        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        const filtering = grid.filteringExpressionsTree;

        let gridState = state.getState(true, 'filtering');
        expect(gridState).toBe('{"filtering":{"filteringOperands":[],"operator":0}}', 'JSON string');

        gridState = state.getState(false, ['filtering']) as IGridState;
        HelperFunctions.verifyFilteringExpressions(filtering, gridState);
    });

    it('setState should correctly restore grid filtering state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        const filteringState = '{"filtering":{"filteringOperands":[{"filteringOperands":[{"condition":{"name":"true","isUnary":true,"iconName":"is-true"},"fieldName":"InStock","ignoreCase":true}],"operator":0,"fieldName":"InStock"}],"operator":0,"type":0}}';
        const initialState = '{"filtering":{"filteringOperands":[],"operator":0}}';

        let gridState = state.getState(true, 'filtering');
        expect(gridState).toBe(initialState);

        state.setState(filteringState);
        gridState = state.getState(false, 'filtering') as IGridState;
        HelperFunctions.verifyFilteringExpressions(grid.filteringExpressionsTree, gridState);
        gridState = state.getState(true, 'filtering');
        expect(gridState).toBe(filteringState);
    });

    it('setState should correctly restore grid filtering state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        const filteringState = '{"filtering":{"filteringOperands":[{"filteringOperands":[{"condition":{"name":"true","isUnary":true,"iconName":"is-true"},"fieldName":"InStock","ignoreCase":true}],"operator":0,"fieldName":"InStock"}],"operator":0,"type":0}}';
        const filteringStateObject = JSON.parse(filteringState) as IGridState;
        const initialState = '{"filtering":{"filteringOperands":[],"operator":0}}';

        let gridState = state.getState(true, 'filtering');
        expect(gridState).toBe(initialState);

        state.setState(filteringStateObject);
        gridState = state.getState(false, 'filtering');
        HelperFunctions.verifyFilteringExpressions(grid.filteringExpressionsTree, gridState as IGridState);
        gridState = state.getState(true, 'filtering');
        expect(gridState).toBe(filteringState);
    });

    it('setState should correctly restore grid sorting state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        const sortingState = '{"sorting":[{"fieldName":"OrderDate","dir":1,"ignoreCase":true}]}';
        const initialState = '{"sorting":[]}';

        let gridState = state.getState(true, 'sorting');
        expect(gridState).toBe(initialState);

        state.setState(sortingState);
        gridState = state.getState(false, 'sorting') as IGridState;
        HelperFunctions.verifySortingExpressions(grid.sortingExpressions, gridState);
        gridState = state.getState(true, 'sorting');
        expect(gridState).toBe(sortingState);
    });

    it('setState should correctly restore grid sorting state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        const sortingState = '{"sorting":[{"fieldName":"OrderDate","dir":1,"ignoreCase":true}]}';
        const sortingStateObject = JSON.parse(sortingState) as IGridState;
        const initialState = '{"sorting":[]}';

        let gridState = state.getState(true, 'sorting');
        expect(gridState).toBe(initialState);

        state.setState(sortingStateObject);
        gridState = state.getState(false, 'sorting');
        HelperFunctions.verifySortingExpressions(grid.sortingExpressions, gridState as IGridState);
        gridState = state.getState(true, 'sorting');
        expect(gridState).toBe(sortingState);
    });

    it('setState should correctly restore grid groupBy state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        const groupingState = '{"groupBy":{"expressions":[{"dir":1,"fieldName":"ProductID","ignoreCase":false},{"dir":1,"fieldName":"OrderDate","ignoreCase":false}],"expansion":[],"defaultExpanded":true}}';
        const initialState = '{"groupBy":{"expressions":[],"expansion":[],"defaultExpanded":true}}';

        let gridState = state.getState(true, 'groupBy');
        expect(gridState).toBe(initialState);

        state.setState(groupingState);
        gridState = state.getState(false, 'groupBy') as IGridState;
        HelperFunctions.verifyGroupingExpressions(grid.groupingExpressions, gridState);
        gridState = state.getState(true, 'groupBy');
        expect(gridState).toBe(groupingState);
    });

    it('setState should correctly restore grid groupBy state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        const groupingState = '{"groupBy":{"expressions":[{"dir":1,"fieldName":"ProductID","ignoreCase":false},{"dir":1,"fieldName":"OrderDate","ignoreCase":false}],"expansion":[],"defaultExpanded":true}}';
        const initialState = '{"groupBy":{"expressions":[],"expansion":[],"defaultExpanded":true}}';
        const groupingStateObject = JSON.parse(groupingState) as IGridState;

        let gridState = state.getState(true, 'groupBy');
        expect(gridState).toBe(initialState);

        state.setState(groupingStateObject);
        gridState = state.getState(false, 'groupBy');
        HelperFunctions.verifyGroupingExpressions(grid.groupingExpressions, gridState as IGridState);
        gridState = state.getState(true, 'groupBy');
        expect(gridState).toBe(groupingState);
    });

    it('setState should correctly restore grid columns state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const state = fix.componentInstance.state;
        /* eslint-disable max-len */
        const columnsState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false,"selectable":false},{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"200px","header":"Prodyct Name","resizable":true,"searchable":true,"selectable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true,"selectable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true,"selectable":true}]}';
        const initialState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Prodyct Name","resizable":true,"searchable":true,"selectable":false},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true}]}';
        /* eslint-enable max-len */
        const columns = JSON.parse(columnsState).columns;

        let gridState = state.getState(true, 'columns');
        expect(gridState).toBe(initialState);

        state.setState(columnsState);
        gridState = state.getState(false, 'columns') as IGridState;
        HelperFunctions.verifyColumns(columns, gridState);
        gridState = state.getState(true, 'columns');
        expect(gridState).toBe(columnsState);
    });

    it('setState should correctly restore grid columns state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const state = fix.componentInstance.state;
        /* eslint-disable max-len */
        const columnsState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false,"selectable":false},{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"200px","header":"Prodyct Name","resizable":true,"searchable":true,"selectable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true,"selectable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true,"selectable":true}]}';
        const initialState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Prodyct Name","resizable":true,"searchable":true,"selectable":false},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true}]}';
        /* eslint-enable max-len */
        const columnsStateObject = JSON.parse(columnsState);

        let gridState = state.getState(true, 'columns');
        expect(gridState).toBe(initialState);

        state.setState(columnsStateObject);
        gridState = state.getState(false, 'columns') as IGridState;
        HelperFunctions.verifyColumns(columnsStateObject.columns, gridState);
        gridState = state.getState(true, 'columns');
        expect(gridState).toBe(columnsState);
    });

    it('setState should correctly restore grid paging state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        const pagingState = '{"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":2,"countRecords":10,"error":0}}}';
        const initialState = '{"paging":{"index":0,"recordsPerPage":15,"metadata":{"countPages":1,"countRecords":10,"error":0}}}';

        let gridState = state.getState(true, 'paging');
        expect(gridState).toBe(initialState);

        state.setState(pagingState);
        gridState = state.getState(false, 'paging');
        HelperFunctions.verifyPaging(grid.pagingState, gridState as IGridState);
        gridState = state.getState(true, 'paging');
        expect(gridState).toBe(pagingState);
    });

    it('setState should correctly restore grid paging state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        const pagingState = '{"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":2,"countRecords":10,"error":0}}}';
        const pagingStateObject = JSON.parse(pagingState) as IGridState;
        const initialState = '{"paging":{"index":0,"recordsPerPage":15,"metadata":{"countPages":1,"countRecords":10,"error":0}}}';

        let gridState = state.getState(true, 'paging');
        expect(gridState).toBe(initialState);

        state.setState(pagingStateObject);
        gridState = state.getState(false, 'paging');
        HelperFunctions.verifyPaging(grid.pagingState, gridState as IGridState);
        gridState = state.getState(true, 'paging');
        expect(gridState).toBe(pagingState);
    });

    it('setState should correctly restore grid row selection state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        const rowSelectionState = '{"rowSelection":[1,3,5,6]}';
        const initialState = '{"rowSelection":[]}';

        let gridState = state.getState(true, 'rowSelection');
        expect(gridState).toBe(initialState);
        state.setState('{"rowSelection":[2]}');
        state.setState(rowSelectionState);
        gridState = state.getState(false, 'rowSelection');
        HelperFunctions.verifyRowSelection(grid.selectedRows, gridState as IGridState);
        gridState = state.getState(true, 'rowSelection');
        expect(gridState).toBe(rowSelectionState);
    });

    it('setState should correctly restore grid row selection state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        const rowSelectionState = '{"rowSelection":[1,3,5,6]}';
        const initialState = '{"rowSelection":[]}';
        const rowSelectionStateObject = JSON.parse(rowSelectionState);

        let gridState = state.getState(true, 'rowSelection');
        expect(gridState).toBe(initialState);

        state.setState(rowSelectionStateObject);
        gridState = state.getState(false, 'rowSelection');
        HelperFunctions.verifyRowSelection(grid.selectedRows, gridState as IGridState);
        gridState = state.getState(true, 'rowSelection');
        expect(gridState).toBe(rowSelectionState);
    });

    it('setState should correctly restore grid row pinning state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        grid.primaryKey = 'ProductID';
        fix.detectChanges();
        const state = fix.componentInstance.state;
        const rowPinState = '{"rowPinning":[1,3]}';
        const initialState = '{"rowPinning":[]}';
        const rowPinStateObject = JSON.parse(rowPinState);

        let gridState = state.getState(true, 'rowPinning');
        expect(gridState).toBe(initialState);

        state.setState(rowPinStateObject);
        fix.detectChanges();

        expect(grid.pinnedRows.length).toBe(2);
        expect(grid.pinnedRows[0].rowID).toBe(1);
        expect(grid.pinnedRows[1].rowID).toBe(3);
        gridState = state.getState(true, 'rowPinning');
        expect(gridState).toBe(rowPinState);

        grid.getRowByIndex(3).pin();
        fix.detectChanges();

        state.setState(rowPinStateObject);
        fix.detectChanges();

        expect(grid.pinnedRows.length).toBe(2);
        expect(grid.pinnedRows[0].rowID).toBe(1);
        expect(grid.pinnedRows[1].rowID).toBe(3);
    });

    it('setState should correctly restore grid cell selection state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        grid.rowSelection = GridSelectionMode.none;
        const state = fix.componentInstance.state;
        const cellSelectionState = '{"cellSelection":[{"rowStart":0,"rowEnd":2,"columnStart":1,"columnEnd":3}]}';
        const initialState = '{"cellSelection":[]}';

        let gridState = state.getState(true, 'cellSelection');
        expect(gridState).toBe(initialState);

        state.setState(cellSelectionState);
        gridState = state.getState(false, 'cellSelection');
        HelperFunctions.verifyCellSelection(grid.getSelectedRanges(), gridState as IGridState);
        gridState = state.getState(true, 'cellSelection');
        expect(gridState).toBe(cellSelectionState);
    });

    it('setState should correctly restore grid cell selection state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        grid.rowSelection = GridSelectionMode.none;
        const state = fix.componentInstance.state;
        const cellSelectionState = '{"cellSelection":[{"rowStart":0,"rowEnd":2,"columnStart":1,"columnEnd":3}]}';
        const initialState = '{"cellSelection":[]}';
        const cellSelectionStateObject = JSON.parse(cellSelectionState);

        let gridState = state.getState(true, 'cellSelection');
        expect(gridState).toBe(initialState);

        state.setState(cellSelectionStateObject);
        gridState = state.getState(false, 'cellSelection');
        HelperFunctions.verifyCellSelection(grid.getSelectedRanges(), gridState as IGridState);
        gridState = state.getState(true, 'cellSelection');
        expect(gridState).toBe(cellSelectionState);
    });

    it('setState should correctly restore grid advanced filtering state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        // eslint-disable-next-line max-len
        const advFilteringState = '{"advancedFiltering":{"filteringOperands":[{"fieldName":"InStock","condition":{"name":"true","isUnary":true,"iconName":"is-true"},"searchVal":null,"ignoreCase":true},{"fieldName":"ProductID","condition":{"name":"greaterThan","isUnary":false,"iconName":"greater-than"},"searchVal":"3","ignoreCase":true}],"operator":0,"type":1}}';
        const initialState = '{"advancedFiltering":{}}';

        let gridState = state.getState(true, 'advancedFiltering');
        expect(gridState).toBe(initialState);

        state.setState(advFilteringState);
        gridState = state.getState(false, 'advancedFiltering') as IGridState;
        HelperFunctions.verifyAdvancedFilteringExpressions(grid.advancedFilteringExpressionsTree, gridState);
        gridState = state.getState(true, 'advancedFiltering');
        expect(gridState).toBe(advFilteringState);
    });

    it('setState should correctly restore grid advanced filtering state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        // eslint-disable-next-line max-len
        const advFilteringState = '{"advancedFiltering":{"filteringOperands":[{"fieldName":"InStock","condition":{"name":"true","isUnary":true,"iconName":"is-true"},"searchVal":null,"ignoreCase":true},{"fieldName":"ProductID","condition":{"name":"greaterThan","isUnary":false,"iconName":"greater-than"},"searchVal":"3","ignoreCase":true}],"operator":0,"type":1}}';
        const initialState = '{"advancedFiltering":{}}';
        const advFilteringStateObject = JSON.parse(advFilteringState);

        let gridState = state.getState(true, 'advancedFiltering');
        expect(gridState).toBe(initialState);

        state.setState(advFilteringStateObject);
        gridState = state.getState(false, 'advancedFiltering') as IGridState;
        HelperFunctions.verifyAdvancedFilteringExpressions(grid.advancedFilteringExpressionsTree, gridState);
        gridState = state.getState(true, 'advancedFiltering');
        expect(gridState).toBe(advFilteringState);
    });

    it('should correctly restore expansion state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateWithDetailsComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;

        const expansionState = '{"expansion":[[1,true],[2,true],[3,true]]}';
        const initialState = '{"expansion":[]}';

        let gridState = state.getState(true, 'expansion');
        expect(gridState).toBe(initialState);

        state.setState(expansionState);
        fix.detectChanges();
        gridState = state.getState(false, 'expansion');
        HelperFunctions.verifyExpansionStates(grid.expansionStates, gridState as IGridState);
        gridState = state.getState(true, 'expansion');
        expect(gridState).toBe(expansionState);
    });
});

class HelperFunctions {
    public static verifyColumns(columns: IColumnState[], gridState: IGridState) {
        columns.forEach((c, index) => {
            expect(gridState.columns[index]).toEqual(jasmine.objectContaining(c));
        });
    }

    public static verifySortingExpressions(sortingExpressions: ISortingExpression[], gridState: IGridState) {
        sortingExpressions.forEach((expr, i) => {
            expect(expr).toEqual(jasmine.objectContaining(gridState.sorting[i]));
        });
    }

    public static verifyGroupingExpressions(groupingExpressions: IGroupingExpression[], gridState: IGridState) {
        groupingExpressions.forEach((expr, i) => {
            expect(expr).toEqual(jasmine.objectContaining(gridState.groupBy.expressions[i]));
        });
    }

    public static verifyGroupingExpansion(groupingExpansion: IGroupByExpandState[], groupBy: IGroupingState) {
        groupingExpansion.forEach((exp, i) => {
            expect(exp).toEqual(jasmine.objectContaining(groupBy.expansion[i]));
        });
    }

    public static verifyFilteringExpressions(expressions: IFilteringExpressionsTree, gridState: IGridState) {
        expect(expressions.fieldName).toBe(gridState.filtering.fieldName, 'Filtering expression field name is not correct');
        expect(expressions.operator).toBe(gridState.filtering.operator, 'Filtering expression operator value is not correct');
        expressions.filteringOperands.forEach((expr, i) => {
            expect(expr).toEqual(jasmine.objectContaining(gridState.filtering.filteringOperands[i]));
        });
    }

    public static verifyAdvancedFilteringExpressions(expressions: IFilteringExpressionsTree, gridState: IGridState) {
        if (gridState.advancedFiltering) {
            expect(expressions.fieldName).toBe(gridState.advancedFiltering.fieldName, 'Filtering expression field name is not correct');
            expect(expressions.operator).toBe(gridState.advancedFiltering.operator, 'Filtering expression operator value is not correct');
            expressions.filteringOperands.forEach((expr, i) => {
                expect(expr).toEqual(jasmine.objectContaining(gridState.advancedFiltering.filteringOperands[i]));
            });
        } else {
            expect(expressions).toBeFalsy();
        }
    }

    public static verifyPaging(paging: IPagingState, gridState: IGridState) {
        expect(paging).toEqual(jasmine.objectContaining(gridState.paging));
    }

    public static verifyRowSelection(selectedRows: any[], gridState: IGridState) {
        gridState.rowSelection.forEach((s, index) => {
            expect(s).toBe(selectedRows[index]);
        });
    }

    public static verifyCellSelection(selectedCells: GridSelectionRange[], gridState: IGridState) {
        selectedCells.forEach((expr, i) => {
            expect(expr).toEqual(jasmine.objectContaining(gridState.cellSelection[i]));
        });
    }

    public static verifyExpansionStates(expansion: Map<any, boolean>, gridState: IGridState) {
        const gridExpansion = new Map<any, boolean>(gridState.expansion);
        expansion.forEach((value, key, map) => {
            expect(value).toBe(gridExpansion.get(key));
        });
    }
}

@Component({
    template: `
        <igx-grid #grid [data]="data" [autoGenerate]="false" igxGridState rowSelection="multiple"
            cellSelection="multiple" primaryKey="ProductID">
            <igx-column *ngFor="let c of columns"
                [width]="c.width"
                [sortable]="c.sortable"
                [movable]="c.movable"
                [editable]="c.editable"
                [sortingIgnoreCase]="c.sortingIgnoreCase"
                [filteringIgnoreCase]="c.sortingIgnoreCase"
                [maxWidth]="c.maxWidth"
                [hasSummary]="c.hasSummary"
                [filterable]="c.filterable"
                [searchable]="c.searchable"
                [selectable]="c.selectable"
                [resizable]="c.resizable"
                [headerClasses]="c.headerClasses"
                [headerGroupClasses]="c.headerGroupClasses"
                [groupable]="c.groupable"
                [field]="c.field"
                [header]="c.header"
                [dataType]="c.dataType"
                [pinned]="c.pinned"
                [hidden]="c.hidden">
            </igx-column>
            <igx-paginator></igx-paginator>
        </igx-grid>
    `
})
export class IgxGridStateComponent {
    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild(IgxGridStateDirective, { static: true })
    public state: IgxGridStateDirective;

    public data = SampleTestData.foodProductData();

    public columns: any[] = [
        /* eslint-disable max-len */
        { field: 'ProductID', header: 'Product ID', width: '150px', dataType: 'number', pinned: true, movable: true, sortable: true, filterable: true, groupable: false, hasSummary: false, hidden: false, maxWidth: '300px', searchable: false, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: false, headerClasses: 'testCss', headerGroupClasses: '', resizable: true },
        { field: 'ProductName', header: 'Prodyct Name', width: '150px', dataType: 'string', pinned: false, selectable: false, movable: true, sortable: true, filterable: true, groupable: true, hasSummary: false, hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: false, headerClasses: '', headerGroupClasses: '', resizable: true },
        { field: 'InStock', header: 'In Stock', width: '140px', dataType: 'boolean', pinned: false, movable: false, sortable: false, filterable: true, groupable: false, hasSummary: true, hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: true, headerClasses: '', headerGroupClasses: '', resizable: true },
        { field: 'OrderDate', header: 'Date ordered', width: '110px', dataType: 'date', pinned: false, movable: false, sortable: true, filterable: false, groupable: true, hasSummary: false, hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: true, headerClasses: '', headerGroupClasses: '', resizable: false },
        /* eslint-enable max-len */
      ];
}

@Component({
    template: `
        <igx-grid #grid [data]="data" [autoGenerate]="true" [igxGridState]="options">
            <igx-paginator></igx-paginator>
        </igx-grid>
    `
})
export class IgxGridStateWithOptionsComponent {
    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild(IgxGridStateDirective, { static: true })
    public state: IgxGridStateDirective;

    public data = SampleTestData.foodProductData();
    public options = {
        filtering: false,
        advancedFiltering: true,
        sorting: false,
        groupBy: false
    };
}

@Component({
    template: `
        <igx-grid #grid [data]="data" [autoGenerate]="true" igxGridState primaryKey="ProductID">
            <!-- Grid Detail View Template -->
            <ng-template igxGridDetail let-dataItem>
                <span>Detail view</span>
            </ng-template>
            <igx-paginator></igx-paginator>
        </igx-grid>
    `
})
export class IgxGridStateWithDetailsComponent {
    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild(IgxGridStateDirective, { static: true })
    public state: IgxGridStateDirective;

    public data = SampleTestData.foodProductData();
}
/* eslint-enable max-len */

