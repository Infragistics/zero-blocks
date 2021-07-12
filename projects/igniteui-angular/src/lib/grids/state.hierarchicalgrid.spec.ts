import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { IgxGridStateDirective, IGridState, IColumnState } from './state.directive';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ISortingExpression, SortingDirection } from '../data-operations/sorting-expression.interface';
import { IGroupingExpression } from '../data-operations/grouping-expression.interface';
import { IFilteringExpressionsTree, FilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IPagingState } from '../data-operations/paging-state.interface';
import { GridSelectionRange } from './selection/selection.service';
import { configureTestSuite } from '../test-utils/configure-suite';
import { IgxHierarchicalGridComponent } from './hierarchical-grid/hierarchical-grid.component';
import { IgxRowIslandComponent } from './hierarchical-grid/row-island.component';
import { IgxHierarchicalGridModule } from './hierarchical-grid/public_api';
import { FilteringLogic } from '../data-operations/filtering-expression.interface';
import { IgxStringFilteringOperand } from '../data-operations/filtering-condition';
import { GridSelectionMode } from './common/enums';
import { wait } from '../test-utils/ui-interactions.spec';

/* eslint-disable max-len */
describe('IgxHierarchicalGridState - input properties #hGrid', () => {
    let fix;
    let grid;
    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxHierarchicalGridTestExpandedBaseComponent
            ],
            imports: [ NoopAnimationsModule, IgxHierarchicalGridModule ]
        });
    }));

    beforeEach(waitForAsync(() => {
        fix = TestBed.createComponent(IgxHierarchicalGridTestExpandedBaseComponent);
        fix.detectChanges();
        grid = fix.componentInstance.hgrid;
    }));

    it('should initialize an igxGridState with default options object', () => {
        fix.componentInstance.data = [
            {ID: 0, ProductName: 'Product: A0'},
            {ID: 1, ProductName: 'Product: A1', childData: generateDataUneven(1, 1)},
            {ID: 2, ProductName: 'Product: A2', childData: generateDataUneven(1, 1)}
        ];
        fix.detectChanges();

        const defaultOptions = {
            columns: true,
            filtering: true,
            advancedFiltering: true,
            sorting: true,
            cellSelection: true,
            rowSelection: true,
            columnSelection: true,
            expansion: true,
            rowIslands: true
        };

        const state = fix.componentInstance.state;
        expect(state).toBeDefined('IgxGridState directive is initialized');
        expect(state.options).toEqual(jasmine.objectContaining(defaultOptions));
    });

    it('should initialize an igxGridState with correct options input', () => {
        fix.componentInstance.data = [
            {ID: 0, ProductName: 'Product: A0'},
            {ID: 1, ProductName: 'Product: A1', childData: generateDataUneven(1, 1)},
            {ID: 2, ProductName: 'Product: A2', childData: generateDataUneven(1, 1)}
        ];

        fix.detectChanges();

        const optionsInput = {
            columns: true,
            filtering: false,
            advancedFiltering: true,
            sorting: false,
            paging: true,
            cellSelection: true,
            rowSelection: true,
            columnSelection: true,
            expansion: true,
            rowIslands: false
        };

        const state = fix.componentInstance.state;
        state.options = optionsInput;
        expect(state.options).toEqual(jasmine.objectContaining(optionsInput));
    });

    it('getState should return corect JSON string', () => {
        pending();
        const initialGridState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ID","width":"150px","header":"ID","resizable":true,"searchable":false,"selectable":true},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Product Name","resizable":true,"searchable":true,"selectable":true}],"filtering":{"filteringOperands":[],"operator":0},"advancedFiltering":{},"sorting":[],"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":4,"countRecords":20,"error":0}},"cellSelection":[],"rowSelection":[],"columnSelection":[],"rowPinning":[],"expansion":[],"rowIslands":[{"id":"igx-row-island-childData","parentRowID":"0","state":{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ID","width":"150px","header":"Product ID","resizable":true,"searchable":false,"selectable":true},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Product Name","resizable":true,"searchable":true,"selectable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"Col1","width":"140px","header":"Col 1","resizable":true,"searchable":true,"selectable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"Col2","width":"110px","header":"Col 2","resizable":false,"searchable":true,"selectable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"Col3","width":"110px","header":"Col 3","resizable":false,"searchable":true,"selectable":true}],"filtering":{"filteringOperands":[],"operator":0},"advancedFiltering":{},"sorting":[],"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":2,"countRecords":7,"error":0}},"cellSelection":[],"rowSelection":[],"columnSelection":[],"rowPinning":[],"expansion":[],"rowIslands":[]}},{"id":"igx-row-island-childData","parentRowID":"1","state":{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ID","width":"150px","header":"Product ID","resizable":true,"searchable":false,"selectable":true},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Product Name","resizable":true,"searchable":true,"selectable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"Col1","width":"140px","header":"Col 1","resizable":true,"searchable":true,"selectable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"Col2","width":"110px","header":"Col 2","resizable":false,"searchable":true,"selectable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"Col3","width":"110px","header":"Col 3","resizable":false,"searchable":true,"selectable":true}],"filtering":{"filteringOperands":[],"operator":0},"advancedFiltering":{},"sorting":[],"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":3,"countRecords":14,"error":0}},"cellSelection":[],"rowSelection":[],"columnSelection":[],"rowPinning":[],"expansion":[],"rowIslands":[]}},{"id":"igx-row-island-childData","parentRowID":"2","state":{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ID","width":"150px","header":"Product ID","resizable":true,"searchable":false,"selectable":true},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Product Name","resizable":true,"searchable":true,"selectable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"Col1","width":"140px","header":"Col 1","resizable":true,"searchable":true,"selectable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"Col2","width":"110px","header":"Col 2","resizable":false,"searchable":true,"selectable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"Col3","width":"110px","header":"Col 3","resizable":false,"searchable":true,"selectable":true}],"filtering":{"filteringOperands":[],"operator":0},"advancedFiltering":{},"sorting":[],"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":2,"countRecords":7,"error":0}},"cellSelection":[],"rowSelection":[],"columnSelection":[],"rowPinning":[],"expansion":[],"rowIslands":[]}},{"id":"igx-row-island-childData","parentRowID":"3","state":{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ID","width":"150px","header":"Product ID","resizable":true,"searchable":false,"selectable":true},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Product Name","resizable":true,"searchable":true,"selectable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"Col1","width":"140px","header":"Col 1","resizable":true,"searchable":true,"selectable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"Col2","width":"110px","header":"Col 2","resizable":false,"searchable":true,"selectable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"Col3","width":"110px","header":"Col 3","resizable":false,"searchable":true,"selectable":true}],"filtering":{"filteringOperands":[],"operator":0},"advancedFiltering":{},"sorting":[],"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":3,"countRecords":14,"error":0}},"cellSelection":[],"rowSelection":[],"columnSelection":[],"rowPinning":[],"expansion":[],"rowIslands":[]}},{"id":"igx-row-island-childData","parentRowID":"4","state":{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ID","width":"150px","header":"Product ID","resizable":true,"searchable":false,"selectable":true},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Product Name","resizable":true,"searchable":true,"selectable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"Col1","width":"140px","header":"Col 1","resizable":true,"searchable":true,"selectable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"Col2","width":"110px","header":"Col 2","resizable":false,"searchable":true,"selectable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"Col3","width":"110px","header":"Col 3","resizable":false,"searchable":true,"selectable":true}],"filtering":{"filteringOperands":[],"operator":0},"advancedFiltering":{},"sorting":[],"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":2,"countRecords":7,"error":0}},"cellSelection":[],"rowSelection":[],"columnSelection":[],"rowPinning":[],"expansion":[],"rowIslands":[]}}]}';
        fix.detectChanges();

        const state = fix.componentInstance.state;
        const gridState = state.getState();
        expect(gridState).toBe(initialGridState, 'JSON string representation of the initial grid state is not correct');
    });

    it('getState should return corect IGridState object when using default options', () => {
        fix.detectChanges();
        grid  = fix.componentInstance.hgrid;
        const state = fix.componentInstance.state;

        const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
        const productFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
        const productExpression = {
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            fieldName: 'ProductName',
            ignoreCase: true,
            searchVal: 'A0'
        };
        productFilteringExpressionsTree.filteringOperands.push(productExpression);
        gridFilteringExpressionsTree.filteringOperands.push(productFilteringExpressionsTree);

        grid.filteringExpressionsTree = gridFilteringExpressionsTree;
        fix.detectChanges();

        const columns = fix.componentInstance.columns;
        const sorting = grid.sortingExpressions;
        const filtering = grid.filteringExpressionsTree;
        const advancedFiltering = grid.advancedFilteringExpressionsTree;

        const gridState = state.getState(false) as IGridState;
        HelperFunctions.verifyColumns(columns, gridState);
        HelperFunctions.verifySortingExpressions(sorting, gridState);
        HelperFunctions.verifyFilteringExpressions(filtering, gridState);
    });

    it('getState should return corect IGridState object when options are not default', () => {
        fix.detectChanges();
        const state = fix.componentInstance.state;
        grid = fix.componentInstance.hgrid;

        const optionsInput = {
            paging: false,
            sorting: false
        };

        state.options = optionsInput;

        let gridState = state.getState(false) as IGridState;
        expect(gridState['sorting']).toBeFalsy();
        expect(gridState['paging']).toBeFalsy();

        const gridsCollection = HelperFunctions.getChildGridsCollection(grid, gridState);
        gridsCollection.forEach(childGrid => {
            expect(childGrid.state['sorting']).toBeFalsy();
            expect(childGrid.state['paging']).toBeFalsy();
        });

        gridState = state.getState(false, ['filtering', 'sorting', 'paging', 'rowIslands']) as IGridState;
        expect(gridState['sorting']).toBeFalsy();
        expect(gridState['paging']).toBeFalsy();
    });

    it('getState should return correct filtering state', () => {
        const state = fix.componentInstance.state;
        const filtering = grid.filteringExpressionsTree;

        const emptyFiltering = '{"filteringOperands":[],"operator":0}';
        const initialState = HelperFunctions.buildStateString(grid, 'filtering', emptyFiltering, emptyFiltering);

        let gridState = state.getState(true, ['filtering', 'rowIslands']);
        expect(gridState).toBe(initialState);

        gridState = state.getState(false, ['filtering', 'rowIslands']) as IGridState;
        HelperFunctions.verifyFilteringExpressions(filtering, gridState);
    });

    it('setState should correctly restore grid filtering state from string', fakeAsync(() => {
        const state = fix.componentInstance.state;

        const emptyFiltering = '{"filteringOperands":[],"operator":0}';
        const initialState = HelperFunctions.buildStateString(grid, 'filtering', emptyFiltering, emptyFiltering);

        const filtering = '{"filteringOperands":[{"filteringOperands":[{"condition":{"name":"contains","isUnary":false,"iconName":"contains"},"fieldName":"ProductName","ignoreCase":true,"searchVal":"A0"}],"operator":0,"fieldName":"ProductName"}],"operator":0,"type":0}';
        const filteringState = HelperFunctions.buildStateString(grid, 'filtering', filtering, filtering);

        const filteringStateObject = JSON.parse(filteringState) as IGridState;
        filteringStateObject.columns = fix.componentInstance.childColumns;

        let gridState = state.getState(true, ['filtering', 'rowIslands']);
        expect(gridState).toBe(initialState);

        state.setState(JSON.stringify(filteringStateObject));
        tick();
        fix.detectChanges();
        gridState = state.getState(false, ['filtering', 'rowIslands']) as IGridState;
        HelperFunctions.verifyFilteringExpressions(grid.filteringExpressionsTree, gridState);
        const gridsCollection = HelperFunctions.getChildGridsCollection(grid, gridState);
        gridsCollection.forEach(childGrid => {
            HelperFunctions.verifyFilteringExpressions(childGrid.grid.filteringExpressionsTree, childGrid.state);
        });
        gridState = state.getState(true, ['filtering', 'rowIslands']);
        expect(gridState).toBe(filteringState);
    }));

    it('setState should correctly restore grid filtering state from object', fakeAsync(() => {
        const state = fix.componentInstance.state;

        const emptyFiltering = '{"filteringOperands":[],"operator":0}';
        const initialState = HelperFunctions.buildStateString(grid, 'filtering', emptyFiltering, emptyFiltering);

        const filtering = '{"filteringOperands":[{"filteringOperands":[{"condition":{"name":"contains","isUnary":false,"iconName":"contains"},"fieldName":"ProductName","ignoreCase":true,"searchVal":"A0"}],"operator":0,"fieldName":"ProductName"}],"operator":0,"type":0}';
        const filteringState = HelperFunctions.buildStateString(grid, 'filtering', filtering, filtering);

        const filteringStateObject = JSON.parse(filteringState) as IGridState;
        filteringStateObject.columns = fix.componentInstance.childColumns;

        let gridState = state.getState(true, ['filtering', 'rowIslands']);
        expect(gridState).toBe(initialState);

        state.setState(filteringStateObject);
        tick();
        fix.detectChanges();
        gridState = state.getState(false, ['filtering', 'rowIslands']) as IGridState;
        HelperFunctions.verifyFilteringExpressions(grid.filteringExpressionsTree, gridState);
        const gridsCollection = HelperFunctions.getChildGridsCollection(grid, gridState);
        gridsCollection.forEach(childGrid => {
            HelperFunctions.verifyFilteringExpressions(childGrid.grid.filteringExpressionsTree, childGrid.state);
        });
        gridState = state.getState(true, ['filtering', 'rowIslands']);
        expect(gridState).toBe(filteringState);
    }));

    it('setState should correctly restore grid sorting state from string', () => {
        const state = fix.componentInstance.state;

        let sorting = grid.sortingExpressions;
        const emptySorting = '[]';
        let initialState = HelperFunctions.buildStateString(grid, 'sorting', emptySorting, emptySorting);

        let gridState = state.getState(true, ['sorting', 'rowIslands']);
        expect(gridState).toBe(initialState);

        grid.sortingExpressions = [
            { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: true }
        ];
        fix.detectChanges();

        sorting = '[{"fieldName":"ProductName","dir":1,"ignoreCase":true}]';
        initialState = HelperFunctions.buildStateString(grid, 'sorting', sorting, emptySorting, emptySorting);
        const sortingState = HelperFunctions.buildStateString(grid, 'sorting', sorting, sorting);

        gridState = state.getState(true, ['sorting', 'rowIslands']);
        expect(gridState).toBe(initialState);

        state.setState(sortingState);
        gridState = state.getState(false, ['sorting', 'rowIslands']) as IGridState;
        HelperFunctions.verifySortingExpressions(grid.sortingExpressions, gridState);
        const gridsCollection = HelperFunctions.getChildGridsCollection(grid, gridState);
        gridsCollection.forEach(childGrid => {
            HelperFunctions.verifySortingExpressions(childGrid.grid.sortingExpressions, childGrid.state);
        });
        gridState = state.getState(true, ['sorting', 'rowIslands']);
        expect(gridState).toBe(sortingState);
    });

    it('setState should correctly restore grid sorting state from object', () => {
        const state = fix.componentInstance.state;
        grid.sortingExpressions = [
            { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: true }
        ];
        fix.detectChanges();

        const emptySorting = '[]';
        const sorting = '[{"fieldName":"ProductName","dir":1,"ignoreCase":true}]';
        const initialState = HelperFunctions.buildStateString(grid, 'sorting', sorting, emptySorting, emptySorting);
        const sortingState = HelperFunctions.buildStateString(grid, 'sorting', sorting, sorting);
        const sortingStateObject = JSON.parse(sortingState) as IGridState;

        let gridState = state.getState(true, ['sorting', 'rowIslands']);
        expect(gridState).toBe(initialState);

        state.setState(sortingStateObject);
        gridState = state.getState(false, ['sorting', 'rowIslands']);
        HelperFunctions.verifySortingExpressions(grid.sortingExpressions, gridState as IGridState);
        const gridsCollection = HelperFunctions.getChildGridsCollection(grid, gridState);
        gridsCollection.forEach(childGrid => {
            HelperFunctions.verifySortingExpressions(childGrid.grid.sortingExpressions, childGrid.state);
        });
        gridState = state.getState(true, ['sorting', 'rowIslands']);
        expect(gridState).toBe(sortingState);
    });

    it('setState should correctly restore grid paging state from string', () => {
        pending();
        const state = fix.componentInstance.state;

        const initialState = '{"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":4,"countRecords":20,"error":0}},"rowIslands":[{"id":"igx-row-island-childData","parentRowID":"0","state":{"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":2,"countRecords":7,"error":0}},"rowIslands":[]}},{"id":"igx-row-island-childData","parentRowID":"1","state":{"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":3,"countRecords":14,"error":0}},"rowIslands":[]}},{"id":"igx-row-island-childData","parentRowID":"2","state":{"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":2,"countRecords":7,"error":0}},"rowIslands":[]}},{"id":"igx-row-island-childData","parentRowID":"3","state":{"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":3,"countRecords":14,"error":0}},"rowIslands":[]}},{"id":"igx-row-island-childData","parentRowID":"4","state":{"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":2,"countRecords":7,"error":0}},"rowIslands":[]}}]}';
        const pagingState = '{"paging":{"index":0,"recordsPerPage":20,"metadata":{"countPages":1,"countRecords":20,"error":0}},"rowIslands":[{"id":"igx-row-island-childData","parentRowID":"0","state":{"paging":{"index":0,"recordsPerPage":20,"metadata":{"countPages":1,"countRecords":7,"error":0}},"rowIslands":[]}},{"id":"igx-row-island-childData","parentRowID":"1","state":{"paging":{"index":0,"recordsPerPage":20,"metadata":{"countPages":1,"countRecords":14,"error":0}},"rowIslands":[]}},{"id":"igx-row-island-childData","parentRowID":"2","state":{"paging":{"index":0,"recordsPerPage":20,"metadata":{"countPages":1,"countRecords":7,"error":0}},"rowIslands":[]}},{"id":"igx-row-island-childData","parentRowID":"3","state":{"paging":{"index":0,"recordsPerPage":20,"metadata":{"countPages":1,"countRecords":14,"error":0}},"rowIslands":[]}},{"id":"igx-row-island-childData","parentRowID":"4","state":{"paging":{"index":0,"recordsPerPage":20,"metadata":{"countPages":1,"countRecords":7,"error":0}},"rowIslands":[]}},{"id":"igx-row-island-childData","parentRowID":"5","state":{"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":3,"countRecords":14,"error":0}},"rowIslands":[]}},{"id":"igx-row-island-childData","parentRowID":"6","state":{"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":2,"countRecords":7,"error":0}},"rowIslands":[]}}]}';

        let gridState = state.getState(true, ['paging', 'rowIslands']);
        expect(gridState).toBe(initialState);

        state.setState(pagingState);
        gridState = state.getState(false, ['paging', 'rowIslands']);
        HelperFunctions.verifyPaging(grid.pagingState, gridState as IGridState);
        const gridsCollection = HelperFunctions.getChildGridsCollection(grid, gridState);
        gridsCollection.forEach(childGrid => {
            HelperFunctions.verifyPaging(childGrid.grid.pagingState, childGrid.state);
        });
        gridState = state.getState(true, ['paging', 'rowIslands']);
        expect(gridState).toBe(pagingState);
    });

    it('setState should correctly restore grid advanced filtering state from string', () => {
        const state = fix.componentInstance.state;

        const emptyFiltering = '{}';
        const initialState = HelperFunctions.buildStateString(grid, 'advancedFiltering', emptyFiltering, emptyFiltering);
        const filtering = '{"filteringOperands":[{"fieldName":"ProductName","condition":{"name":"contains","isUnary":false,"iconName":"contains"},"searchVal":"A0","ignoreCase":true},{"fieldName":"ID","condition":{"name":"lessThan","isUnary":false,"iconName":"less-than"},"searchVal":3,"ignoreCase":true}],"operator":0,"type":1}';
        const filteringState = HelperFunctions.buildStateString(grid, 'advancedFiltering', filtering, filtering);

        let gridState = state.getState(true, ['advancedFiltering', 'rowIslands']);
        expect(gridState).toBe(initialState);

        state.setState(filteringState);
        gridState = state.getState(false, ['advancedFiltering', 'rowIslands']) as IGridState;
        HelperFunctions.verifyAdvancedFilteringExpressions(grid.advancedFilteringExpressionsTree, gridState);
        const gridsCollection = HelperFunctions.getChildGridsCollection(grid, gridState);
        gridsCollection.forEach(childGrid => {
            HelperFunctions.verifyAdvancedFilteringExpressions(childGrid.grid.advancedFilteringExpressionsTree, childGrid.state);
        });

        gridState = state.getState(true, ['advancedFiltering', 'rowIslands']);
        expect(gridState).toBe(filteringState);
    });

    it('setState should correctly restore grid advanced filtering state from object', () => {
        const state = fix.componentInstance.state;

        const emptyFiltering = '{}';
        const initialState = HelperFunctions.buildStateString(grid, 'advancedFiltering', emptyFiltering, emptyFiltering);
        const filtering = '{"filteringOperands":[{"fieldName":"ProductName","condition":{"name":"contains","isUnary":false,"iconName":"contains"},"searchVal":"A0","ignoreCase":true},{"fieldName":"ID","condition":{"name":"lessThan","isUnary":false,"iconName":"less-than"},"searchVal":3,"ignoreCase":true}],"operator":0,"type":1}';
        const filteringState = HelperFunctions.buildStateString(grid, 'advancedFiltering', filtering, filtering);
        const filteringStateObject = JSON.parse(filteringState) as IGridState;

        let gridState = state.getState(true, ['advancedFiltering', 'rowIslands']);
        expect(gridState).toBe(initialState);

        state.setState(filteringStateObject);
        gridState = state.getState(false, ['advancedFiltering', 'rowIslands']) as IGridState;
        HelperFunctions.verifyAdvancedFilteringExpressions(grid.advancedFilteringExpressionsTree, gridState);
        const gridsCollection = HelperFunctions.getChildGridsCollection(grid, gridState);
        gridsCollection.forEach(childGrid => {
            HelperFunctions.verifyAdvancedFilteringExpressions(childGrid.grid.advancedFilteringExpressionsTree, childGrid.state);
        });
        gridState = state.getState(true, ['advancedFiltering', 'rowIslands']);
        expect(gridState).toBe(filteringState);
    });

    it('setState should correctly restore grid cell selection state from string', () => {
        grid.rowSelection = GridSelectionMode.none;
        const state = fix.componentInstance.state;

        const emptyCellSelection = '[]';
        const initialState = HelperFunctions.buildStateString(grid, 'cellSelection', emptyCellSelection, emptyCellSelection);
        const cellSelection = '[{"rowStart":0,"rowEnd":2,"columnStart":1,"columnEnd":3}]';
        const cellSelectionState = HelperFunctions.buildStateString(grid, 'cellSelection', cellSelection, cellSelection);

        let gridState = state.getState(true, ['cellSelection', 'rowIslands']);
        expect(gridState).toBe(initialState);

        state.setState(cellSelectionState);
        gridState = state.getState(false, ['cellSelection', 'rowIslands']);
        HelperFunctions.verifyCellSelection(grid.getSelectedRanges(), gridState as IGridState);
        const gridsCollection = HelperFunctions.getChildGridsCollection(grid, gridState);
        gridsCollection.forEach(childGrid => {
            HelperFunctions.verifyCellSelection(childGrid.grid.getSelectedRanges(), childGrid.state);
        });
        gridState = state.getState(true, ['cellSelection', 'rowIslands']);
        expect(gridState).toBe(cellSelectionState);
    });

    it('setState should correctly restore grid row selection state from string', () => {
        const state = fix.componentInstance.state;

        const emptyRowSelection = '[]';
        const initialState = HelperFunctions.buildStateString(grid, 'rowSelection', emptyRowSelection, emptyRowSelection);
        const rowSelection = '["0","1"]';
        const childRowSelection = '["00","01"]';
        const rowSelectionState = HelperFunctions.buildStateString(grid, 'rowSelection', rowSelection, childRowSelection);

        let gridState = state.getState(true, ['rowSelection', 'rowIslands']);
        expect(gridState).toBe(initialState);

        state.setState(rowSelectionState);
        gridState = state.getState(false, ['rowSelection', 'rowIslands']);
        HelperFunctions.verifyRowSelection(grid.selectedRows, gridState as IGridState);
        const gridsCollection = HelperFunctions.getChildGridsCollection(grid, gridState);
        gridsCollection.forEach(childGrid => {
            HelperFunctions.verifyRowSelection(childGrid.grid.selectedRows, childGrid.state);
        });
        gridState = state.getState(true, ['rowSelection', 'rowIslands']);
        expect(gridState).toBe(rowSelectionState);
    });

    it('setState should correctly restore expansion state from string', () => {
        grid.expandChildren = false;
        fix.detectChanges();

        const state = fix.componentInstance.state;

        const emptyExpansionState = '[]';
        const initialState = HelperFunctions.buildStateString(grid, 'expansion', emptyExpansionState, emptyExpansionState);
        const expansion = '[["0",true]]';
        const childExpansion = '[["00",true]]';
        let expansionState = HelperFunctions.buildStateString(grid, 'expansion', expansion, childExpansion, emptyExpansionState);

        let gridState = state.getState(true, ['expansion', 'rowIslands']);
        expect(gridState).toBe(initialState);

        state.setState(expansionState);
        expansionState = HelperFunctions.buildStateString(grid, 'expansion', expansion, childExpansion, emptyExpansionState);
        gridState = state.getState(false, ['expansion', 'rowIslands']);
        HelperFunctions.verifyExpansionStates(grid.expansionStates, gridState as IGridState);
        const gridsCollection = HelperFunctions.getChildGridsCollection(grid, gridState);
        gridsCollection.forEach(childGrid => {
            HelperFunctions.verifyExpansionStates(childGrid.grid.expansionStates, childGrid.state);
        });
        gridState = state.getState(true, ['expansion', 'rowIslands']);
        expect(gridState).toBe(expansionState);
    });

    it('setState should correctly restore grid columns state from string', async () => {
        fix.detectChanges();
        const state = fix.componentInstance.state;

        const rootGridColumns = '[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ID","width":"150px","header":"ID","resizable":true,"searchable":false,"selectable":true},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Product Name","resizable":true,"searchable":true,"selectable":true}]';
        const childGridColumns = '[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ID","width":"150px","header":"Product ID","resizable":true,"searchable":false,"selectable":true},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Product Name","resizable":true,"searchable":true,"selectable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"Col1","width":"140px","header":"Col 1","resizable":true,"searchable":true,"selectable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"Col2","width":"110px","header":"Col 2","resizable":false,"searchable":true,"selectable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"Col3","width":"110px","header":"Col 3","resizable":false,"searchable":true,"selectable":true}]';
        const initialState = HelperFunctions.buildStateString(grid, 'columns', rootGridColumns, childGridColumns);
        const newColumns = '[{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"movable":false,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"363px","header":"Product Name","resizable":false,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"movable":false,"hidden":false,"dataType":"number","hasSummary":false,"field":"ID","width":"363px","header":"ID","resizable":false,"searchable":true}]';
        const newColumnsState = HelperFunctions.buildStateString(grid, 'columns', newColumns, newColumns);

        let gridState = state.getState(true, ['columns', 'rowIslands']);
        expect(gridState).toBe(initialState);

        state.setState(newColumnsState);
        await wait();
        fix.detectChanges();

        gridState = state.getState(false, ['columns', 'rowIslands']) as IGridState;
        HelperFunctions.verifyColumns(JSON.parse(newColumnsState).columns, gridState);
        // const gridsCollection = HelperFunctions.getChildGridsCollection(grid, gridState);
        // gridsCollection.forEach(childGrid => {
        //     HelperFunctions.verifyColumns(childGrid.grid.columns, childGrid.state);
        // });
        // gridState = state.getState(true, ['columns', 'rowIslands']);
        // expect(gridState).toBe(newColumnsState);
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

    public static verifyExpansionStates(expansion: Map<any, boolean>, gridState: IGridState) {
        const gridExpansion = new Map<any, boolean>(gridState.expansion);
        expansion.forEach((value, key, map) => {
            expect(value).toBe(gridExpansion.get(key));
        });
    }

    public static getChildGridsCollection(grid, state) {
        const gridStatesCollection = [];
        const rowIslands = (grid as any).allLayoutList;
        if (rowIslands) {
            rowIslands.forEach(rowIslandComponent => {
                const childGrids = rowIslandComponent.rowIslandAPI.getChildGrids();

                childGrids.forEach(chGrid => {
                    const parentRowId = this.getParentRowID(chGrid);
                    const rowIslandState = state.rowIslands.find(st => st.id === rowIslandComponent.id && st.parentRowID === parentRowId);
                    if (rowIslandState) {
                        const childGridState = { grid: chGrid, state: rowIslandState.state };
                        gridStatesCollection.push(childGridState);
                    }
                });
            });
        }
        return gridStatesCollection;
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


    public static buildStateString(grid: IgxHierarchicalGridComponent, feature: string, level0State: string, level1State: string, level2State?: string): string {
        const level0featureState = this.buildFeatureString(feature, level0State);
        const level1featureState = this.buildFeatureString(feature, level1State);
        const level2featureState = level2State ? this.buildFeatureString(feature, level2State) : this.buildFeatureString(feature, level1State);
        const rowIslandsString = this.buildRowIslandsString(grid.allLayoutList, level1featureState, level2featureState);
        const state = `{${level0featureState},${rowIslandsString}`;
        return state;
    }

    public static buildFeatureString(feature: string, stateString: string): string {
        const state = `"${feature}":${stateString}`;
        return state;
    }

    public static buildRowIslandsString(rowIslands, level1State: string, level2State: string): string {
        const rowIslandsStates = [];
        rowIslands.forEach(rowIsland => {
            const featureState = rowIsland.level === 1 ? level1State : level2State;
            const childGrids = rowIsland.rowIslandAPI.getChildGrids();
            childGrids.forEach(chGrid => {
                const parentRowId = this.getParentRowID(chGrid);
                rowIslandsStates.push(this.buildRowIslandStateString(rowIsland.id, parentRowId, featureState));
            });
        });
        const rowIslandsState = rowIslandsStates.join(',');
        const state = `"rowIslands":[${rowIslandsState}]}`;
        return state;
    }

    public static buildRowIslandStateString(rowIslandId: string, parentRowId: string, featureState): string {
        const state = `{"id":"${rowIslandId}","parentRowID":"${parentRowId}","state":{${featureState},"rowIslands":[]}}`;
        return state;
    }

    private static getParentRowID(grid: IgxHierarchicalGridComponent) {
        let childGrid; let childRow;
        while (grid.parent) {
            childRow = grid.childRow;
            childGrid = grid;
            grid = grid.parent;
        }
        return grid.hgridAPI.getParentRowId(childGrid);
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #hGrid [data]="data" igxGridState [expandChildren]="true" primaryKey="ID"
     [autoGenerate]="false" [height]="'800px'" [width]="'800px'" rowSelection="multiple" cellSelection="multiple">
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
        <igx-paginator [perPage]="5"></igx-paginator>
        <igx-row-island [key]="'childData'" [autoGenerate]="false" #rowIsland primaryKey="ID">
            <igx-column *ngFor="let c of childColumns"
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
            <igx-paginator *igxPaginator [perPage]="5"></igx-paginator>
            <igx-row-island [key]="'childData'" [autoGenerate]="true" #rowIsland2>
                <igx-paginator *igxPaginator [perPage]="5"></igx-paginator>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridTestExpandedBaseComponent {
    @ViewChild('hGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;
    @ViewChild(IgxGridStateDirective, { static: true }) public state: IgxGridStateDirective;

    public data;
    public options = {
        filtering: false,
        advancedFiltering: true,
        sorting: false,
        groupBy: true
    };

    public columns: any[] = [
        /* eslint-disable max-len */
        { field: 'ID', header: 'ID', width: '150px', dataType: 'number', pinned: true, movable: true, sortable: true, filterable: true, groupable: false, hasSummary: false, hidden: false, maxWidth: '300px', searchable: false, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: false, headerClasses: 'testCss', headerGroupClasses: '', resizable: true },
        { field: 'ProductName', header: 'Product Name', width: '150px', dataType: 'string', pinned: false, movable: true, sortable: true, filterable: true, groupable: true, hasSummary: false, hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: false, headerClasses: '', headerGroupClasses: '', resizable: true }
    ];

    public childColumns: any[] = [
        { field: 'ID', header: 'Product ID', width: '150px', dataType: 'number', pinned: true, movable: true, sortable: true, filterable: true, groupable: false, hasSummary: false, hidden: false, maxWidth: '300px', searchable: false, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: false, headerClasses: 'testCss', headerGroupClasses: '', resizable: true },
        { field: 'ProductName', header: 'Product Name', width: '150px', dataType: 'string', pinned: false, movable: true, sortable: true, filterable: true, groupable: true, hasSummary: false, hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: false, headerClasses: '', headerGroupClasses: '', resizable: true },
        { field: 'Col1', header: 'Col 1', width: '140px', dataType: 'boolean', pinned: false, movable: false, sortable: false, filterable: true, groupable: false, hasSummary: true, hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: true, headerClasses: '', headerGroupClasses: '', resizable: true },
        { field: 'Col2', header: 'Col 2', width: '110px', dataType: 'date', pinned: false, movable: false, sortable: true, filterable: false, groupable: true, hasSummary: false, hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: true, headerClasses: '', headerGroupClasses: '', resizable: false },
        { field: 'Col3', header: 'Col 3', width: '110px', dataType: 'date', pinned: false, movable: false, sortable: true, filterable: false, groupable: true, hasSummary: false, hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: true, headerClasses: '', headerGroupClasses: '', resizable: false },
        /* eslint-enable max-len */
    ];

    constructor() {
        // 3 level hierarchy
        this.data = generateDataUneven(20, 3);
    }
}

export const generateDataUneven = (count: number, level: number, parentID: string = null) => {
    const prods = [];
    const currLevel = level;
    let children;
    for (let i = 0; i < count; i++) {
        const rowID = parentID ? parentID + i : i.toString();
        if (level > 0 ) {
           // Have child grids for row with even id less rows by not multiplying by 2
           children = generateDataUneven((i % 2 + 1) * Math.round(count / 3) , currLevel - 1, rowID);
        }
        prods.push({
            ID: rowID, ChildLevels: currLevel,  ProductName: 'Product: A' + i, Col1: i,
            Col2: i, Col3: i, childData: children, childData2: children });
    }
    return prods;
};
/* eslint-enable max-len */
