import { configureTestSuite } from '../../test-utils/configure-suite';
import { TestBed, tick, fakeAsync, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxHierarchicalGridModule } from './public_api';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { IgxColumnMovingDragDirective } from '../moving/moving.drag.directive';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { IgxChildGridRowComponent } from './child-grid-row.component';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { take } from 'rxjs/operators';
import { IgxIconModule } from '../../icon/public_api';
import {
    IgxHierarchicalGridTestBaseComponent,
    IgxHierarchicalGridTestCustomToolbarComponent
} from '../../test-utils/hierarchical-grid-components.spec';
import { GridFunctions, GridSelectionFunctions } from '../../test-utils/grid-functions.spec';
import { HierarchicalGridFunctions } from '../../test-utils/hierarchical-grid-functions.spec';
import { GridSelectionMode, ColumnPinningPosition, RowPinningPosition } from '../common/enums';
import { IgxPaginatorComponent } from '../../paginator/paginator.component';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';

describe('IgxHierarchicalGrid Integration #hGrid', () => {
    let fixture: ComponentFixture<IgxHierarchicalGridTestBaseComponent>;
    let hierarchicalGrid: IgxHierarchicalGridComponent;

    const DEBOUNCE_TIME = 30;

    const FILTERING_ROW_CLASS = 'igx-grid-filtering-row';
    const FILTERING_CELL_CLASS = 'igx-grid-filtering-cell';

    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxHierarchicalGridTestBaseComponent,
                IgxHierarchicalGridTestCustomToolbarComponent
            ],
            imports: [
                NoopAnimationsModule, IgxHierarchicalGridModule, IgxIconModule]
        });
    }));

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
        tick();
        fixture.detectChanges();
        hierarchicalGrid = fixture.componentInstance.hgrid;
    }));

    describe('MCH', () => {
        it('should allow declaring column groups.', fakeAsync(() => {
            const expectedColumnGroups = 1;
            const expectedLevel = 1;

            expect(hierarchicalGrid.columnList.filter(col => col.columnGroup).length).toEqual(expectedColumnGroups);
            expect(hierarchicalGrid.getColumnByName('ProductName').level).toEqual(expectedLevel);

            expect(GridFunctions.getColumnHeaders(fixture).length).toEqual(3);

            const firstRow = hierarchicalGrid.dataRowList.first;
            // the first row's cell should contain an expand indicator
            expect(HierarchicalGridFunctions.hasExpander(firstRow)).toBeTruthy();
            hierarchicalGrid.expandRow(firstRow.rowID);
            tick(DEBOUNCE_TIME);
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];

            expect(childGrid.columnList.filter(col => col.columnGroup).length).toEqual(expectedColumnGroups);
            expect(childGrid.getColumnByName('ProductName').level).toEqual(expectedLevel);

            expect(GridFunctions.getColumnHeaders(fixture).length).toEqual(6);
        }));

        it('should apply height correctly with and without filtering', fakeAsync(() => {
            let filteringCells = fixture.debugElement.queryAll(By.css(FILTERING_CELL_CLASS));
            expect(hierarchicalGrid.nativeElement.offsetHeight).toBe(600);

            hierarchicalGrid.height = '800px';
            tick();
            fixture.detectChanges();
            expect(hierarchicalGrid.nativeElement.offsetHeight).toBe(800);
            expect(filteringCells.length).toBe(3);

            hierarchicalGrid.allowFiltering = false;
            fixture.detectChanges();
            expect(hierarchicalGrid.nativeElement.offsetHeight).toBe(800);
            filteringCells = fixture.debugElement.queryAll(By.css(FILTERING_CELL_CLASS));
            expect(filteringCells.length).toBe(0);

        }));
    });

    describe('Selection', () => {
        it('should allow only one cell to be selected in the whole hierarchical grid.', (async () => {
            let firstRow = hierarchicalGrid.dataRowList.first as IgxHierarchicalRowComponent;
            hierarchicalGrid.expandRow(firstRow.rowID);
            expect(firstRow.expanded).toBeTruthy();

            let fCell = firstRow.cells.toArray()[0];

            // select parent cell
            GridFunctions.focusCell(fixture, fCell);
            await wait(100);
            fixture.detectChanges();

            expect(fCell.selected).toBeTruthy();
            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const fChildCell = childGrid.dataRowList.first.cells.first;

            // select child cell
            GridFunctions.focusCell(fixture, fChildCell);
            await wait(100);
            fixture.detectChanges();

            expect(fChildCell.selected).toBeTruthy();
            expect(fCell.selected).toBeFalsy();

            // select parent cell
            firstRow = hierarchicalGrid.dataRowList.toArray()[0] as IgxHierarchicalRowComponent;
            fCell = firstRow.cells.toArray()[0];
            GridFunctions.focusCell(fixture, fCell);
            await wait(100);
            fixture.detectChanges();
            expect(fChildCell.selected).toBeFalsy();
            expect(fCell.selected).toBeTruthy();
        }));
    });

    describe('Updating', () => {
        it(`should have separate instances of updating service for
        parent and children and the same for children of the same island`, fakeAsync(() => {
            const firstLayoutInstances: IgxHierarchicalGridComponent[] = [];
            hierarchicalGrid.childLayoutList.first.gridCreated.pipe(take(2)).subscribe((args) => {
                firstLayoutInstances.push(args.grid);
            });
            const dataRows = hierarchicalGrid.dataRowList.toArray();
            // expand 1st row
            hierarchicalGrid.expandRow(dataRows[0].rowID);
            tick(DEBOUNCE_TIME);
            fixture.detectChanges();
            // expand 2nd row
            hierarchicalGrid.expandRow(dataRows[1].rowID);
            tick(DEBOUNCE_TIME);
            fixture.detectChanges();
            // test instances
            expect(firstLayoutInstances.length).toEqual(2);
            expect(hierarchicalGrid.transactions).not.toBe(firstLayoutInstances[0].transactions);
            expect(firstLayoutInstances[0].transactions).not.toBe(firstLayoutInstances[1].transactions);
        }));

        it('should contain all transactions for a row island', fakeAsync(() => {
            const firstLayoutInstances: IgxHierarchicalGridComponent[] = [];
            hierarchicalGrid.childLayoutList.first.gridCreated.pipe(take(2)).subscribe((args) => {
                firstLayoutInstances.push(args.grid);
            });
            hierarchicalGrid.batchEditing = true;
            tick();
            fixture.detectChanges();
            const dataRows = hierarchicalGrid.dataRowList.toArray();
            // expand 1st row
            hierarchicalGrid.expandRow(dataRows[0].rowID);
            tick();
            fixture.detectChanges();
            // expand 2nd row
            hierarchicalGrid.expandRow(dataRows[1].rowID);
            tick();
            fixture.detectChanges();

            firstLayoutInstances[0].updateRow({ ProductName: 'Changed' }, '00');
            firstLayoutInstances[1].updateRow({ ProductName: 'Changed' }, '10');
            expect(hierarchicalGrid.transactions.getTransactionLog().length).toEqual(0);
            expect(firstLayoutInstances[0].transactions.getTransactionLog().length).toEqual(1);
            expect(fixture.componentInstance.rowIsland.transactions.getTransactionLog().length).toEqual(0);
        }));

        it('should remove expand indicator for uncommitted added rows', fakeAsync(() => {
            hierarchicalGrid.batchEditing = true;
            fixture.detectChanges();
            hierarchicalGrid.data = hierarchicalGrid.data.slice(0, 3);
            fixture.detectChanges();
            hierarchicalGrid.addRow({ ID: -1, ProductName: 'Name1' });
            fixture.detectChanges();
            const rows = HierarchicalGridFunctions.getHierarchicalRows(fixture);
            const lastRow = rows[rows.length - 1];
            expect(lastRow.query(By.css('igx-icon')).nativeElement).toHaveClass('igx-icon--inactive');
            hierarchicalGrid.transactions.commit(hierarchicalGrid.data);
            fixture.detectChanges();
            expect(lastRow.query(By.css('igx-icon')).nativeElement).not.toHaveClass('igx-icon--inactive');
        }));

        it('should now allow expanding uncommitted added rows', fakeAsync(() => {
            /* using the API here assumes keyboard interactions to expand/collapse would also be blocked */
            hierarchicalGrid.batchEditing = true;
            fixture.detectChanges();
            hierarchicalGrid.data = hierarchicalGrid.data.slice(0, 3);
            fixture.detectChanges();
            hierarchicalGrid.addRow({ ID: -1, ProductName: 'Name1' });
            fixture.detectChanges();

            const dataRows = hierarchicalGrid.dataRowList;
            hierarchicalGrid.expandRow(dataRows.last.rowID);
            let childRows = fixture.debugElement.queryAll(By.directive(IgxChildGridRowComponent));
            expect(childRows.length).toEqual(0);

            hierarchicalGrid.transactions.commit(hierarchicalGrid.data);
            fixture.detectChanges();

            hierarchicalGrid.expandRow(dataRows.last.rowID);
            tick(DEBOUNCE_TIME);
            fixture.detectChanges();
            childRows = fixture.debugElement.queryAll(By.directive(IgxChildGridRowComponent));
            expect(childRows.length).toEqual(1);
        }));

        it('should revert changes when transactions are cleared for child grids', fakeAsync(() => {
            hierarchicalGrid.batchEditing = true;
            fixture.detectChanges();
            let childGrid;
            hierarchicalGrid.childLayoutList.first.gridCreated.pipe(take(1)).subscribe((args) => {
                childGrid = args.grid;
            });
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            childGrid.updateRow({ ProductName: 'Changed' }, '00');
            fixture.detectChanges();
            expect(childGrid.getCellByColumn(0, 'ProductName').nativeElement.innerText).toEqual('Changed');
            childGrid.transactions.clear();
            fixture.detectChanges();
            expect(childGrid.getCellByColumn(0, 'ProductName').nativeElement.innerText).toEqual('Product: A0');
        }));

        it('should return correctly the rowData', () => {
            hierarchicalGrid.primaryKey = 'ID';
            fixture.detectChanges();

            const rowData = hierarchicalGrid.getRowByKey('2').data;
            expect(hierarchicalGrid.getRowData('2')).toEqual(rowData);

            hierarchicalGrid.sort({ fieldName: 'ChildLevels', dir: SortingDirection.Desc, ignoreCase: true });
            fixture.detectChanges();

            expect(hierarchicalGrid.getRowData('2')).toEqual(rowData);
            expect(hierarchicalGrid.getRowData('101')).toEqual({});

            hierarchicalGrid.filter('ID', '1', IgxStringFilteringOperand.instance().condition('startsWith'));
            fixture.detectChanges();

            expect(hierarchicalGrid.getRowData('2')).toEqual(rowData);
            expect(hierarchicalGrid.getRowData('101')).toEqual({});
        });
    });

    describe('Sorting', () => {
        it('should display correct child data for expanded row after sorting.', fakeAsync(() => {
            /* this test doesn't need scrolling as it only cares about the child grid getting assigned to the correct parent */
            hierarchicalGrid.data = hierarchicalGrid.data.slice(0, 3);
            fixture.detectChanges();
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            hierarchicalGrid.sort({
                fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fixture.detectChanges();
            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const firstChildCell = childGrid.dataRowList.first.cells.first;
            expect(hierarchicalGrid.hgridAPI.get_row_by_index(3) instanceof IgxChildGridRowComponent).toBeTruthy();
            expect(childGrid.data).toBe(fixture.componentInstance.data[0]['childData']);
            expect(firstChildCell.value).toBe('00');
        }));

        it('should allow sorting via headers in child grids', fakeAsync(() => {
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            // enable sorting
            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            childGrid.columnList.first.sortable = true;
            fixture.detectChanges();

            const childHeader = GridFunctions.getColumnHeader('ID', fixture, childGrid);
            GridFunctions.clickHeaderSortIcon(childHeader);
            fixture.detectChanges();
            GridFunctions.clickHeaderSortIcon(childHeader);
            fixture.detectChanges();

            expect(childGrid.dataRowList.first.cells.first.value).toBe('09');
            const icon = GridFunctions.getHeaderSortIcon(childHeader);
            expect(icon).not.toBeNull();
            expect(icon.nativeElement.textContent.toLowerCase().trim()).toBe('arrow_downward');
        }));
    });

    describe('Filtering', () => {

        it('should enable filter-row for root and child grids', fakeAsync(() => {
            let filteringCells = fixture.debugElement.queryAll(By.css(FILTERING_CELL_CLASS));
            expect(filteringCells.length).toEqual(3);

            GridFunctions.clickFilterCellChipUI(fixture, 'ID');
            expect(document.querySelectorAll(FILTERING_ROW_CLASS).length).toEqual(1);

            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);

            filteringCells = fixture.debugElement.queryAll(By.css(FILTERING_CELL_CLASS));
            expect(filteringCells.length).toEqual(6);

            GridFunctions.clickFilterCellChipUI(fixture, 'ProductName', hierarchicalGrid.hgridAPI.getChildGrids(false)[0]);
            expect(document.querySelectorAll(FILTERING_ROW_CLASS).length).toEqual(2);
        }));

        it('should not lose child grid states after filtering in parent grid.', fakeAsync(() => {
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            tick(DEBOUNCE_TIME);
            fixture.detectChanges();
            let childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            let firstChildCell = childGrid.dataRowList.first.cells.first;
            UIInteractions.simulateClickAndSelectEvent(firstChildCell);
            tick(DEBOUNCE_TIME);
            fixture.detectChanges();
            expect(firstChildCell.selected).toBe(true);

            // apply some filter
            hierarchicalGrid.filter('ID', '0', IgxStringFilteringOperand.instance().condition('contains'), true);

            expect(hierarchicalGrid.getRowByIndex(0).expanded).toBe(true);
            expect(hierarchicalGrid.hgridAPI.get_row_by_index(1) instanceof IgxChildGridRowComponent).toBeTruthy();

            childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            firstChildCell = childGrid.dataRowList.first.cells.first;
            expect(firstChildCell.selected).toBe(true);
        }));

        it('should show empty filter message when there are no records matching the filter', fakeAsync(() => {
            fixture.componentInstance.data = [];
            fixture.detectChanges();

            const gridBody = fixture.debugElement.query(By.css('.igx-grid__tbody-content'));
            expect(gridBody.nativeElement.innerText).toMatch(hierarchicalGrid.emptyGridMessage);

            fixture.componentInstance.data = SampleTestData.generateHGridData(40, 3);
            fixture.detectChanges();

            hierarchicalGrid.filter('ID', '123450', IgxStringFilteringOperand.instance().condition('contains'), true);
            fixture.detectChanges();
            expect(gridBody.nativeElement.innerText).toMatch(hierarchicalGrid.emptyFilteredGridMessage);
        }));

        it('should apply classes to the header when filter row is visible', fakeAsync(() => {
            hierarchicalGrid.rowSelection = GridSelectionMode.multiple;
            fixture.detectChanges();
            const headerExpander: HTMLElement = HierarchicalGridFunctions.getExpander(fixture);
            const headerCheckbox: HTMLElement = GridSelectionFunctions.getRowCheckboxDiv(fixture.nativeElement);

            expect(HierarchicalGridFunctions.isExpander(headerExpander, '--push')).toBeFalsy();
            expect(GridSelectionFunctions.isCheckbox(headerCheckbox, '--push')).toBeFalsy();

            // open filter row
            GridFunctions.clickFilterCellChipUI(fixture, 'ID');

            expect(HierarchicalGridFunctions.isExpander(headerExpander, '--push')).toBeTruthy();
            expect(GridSelectionFunctions.isCheckbox(headerCheckbox, '--push')).toBeTruthy();
        }));
    });

    describe('Summaries', () => {
        const SUMMARIES_MARGIN_CLASS = '.igx-grid__summaries-patch';
        it('should allow defining summaries for child grid and child should be sized correctly.', fakeAsync(() => {
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            // summaries seem to require this additional change detection call with Ivy disabled to display for the child grid
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const expander = childGrid.dataRowList.first.expander;

            // Expect expansion cell to be rendered and sized the same as the expansion cell inside the grid
            const summaryRow = childGrid.summariesRowList.first.nativeElement;
            const summaryRowIndentation = summaryRow.querySelector(SUMMARIES_MARGIN_CLASS);
            expect(summaryRow.children.length).toEqual(2);
            expect(summaryRowIndentation.offsetWidth).toEqual(expander.nativeElement.offsetWidth);

            const gridHeight = childGrid.nativeElement.offsetHeight;
            const childElements: HTMLElement[] = Array.from(childGrid.nativeElement.children);
            const elementsHeight = childElements.map(elem => elem.offsetHeight).reduce((total, height) => total + height, 0);

            // Expect the combined height of all elements (header, body, footer etc) to equal the calculated height of the grid.
            expect(elementsHeight).toEqual(gridHeight);

            // expand first row of child
            childGrid.expandRow(childGrid.dataRowList.first.rowID);

            const grandChild = childGrid.hgridAPI.getChildGrids(false)[0];
            const grandChildSummaryRow = grandChild.summariesRowList.first.nativeElement;
            const childSummaryRowIndentation = grandChildSummaryRow.querySelector(SUMMARIES_MARGIN_CLASS);

            expect(grandChildSummaryRow.children.length).toEqual(1);
            expect(childSummaryRowIndentation).toBeNull();
        }));

        it('should size summaries with row selectors for parent and child grids correctly.', fakeAsync(() => {
            hierarchicalGrid.rowSelection = GridSelectionMode.multiple;
            fixture.detectChanges();
            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            // summaries seem to require this additional change detection call with Ivy disabled to display for the child grid
            fixture.detectChanges();

            const rootExpander = (hierarchicalGrid.dataRowList.first as IgxHierarchicalRowComponent).expander;
            const rootCheckbox = hierarchicalGrid.headerSelectorContainer;
            const rootSummaryRow = hierarchicalGrid.summariesRowList.first.nativeElement;
            const rootSummaryIndentation = rootSummaryRow.querySelector(SUMMARIES_MARGIN_CLASS);

            expect(rootSummaryRow.children.length).toEqual(2);
            expect(rootSummaryIndentation.offsetWidth)
                .toEqual(rootExpander.nativeElement.offsetWidth + rootCheckbox.nativeElement.offsetWidth);

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const expander = childGrid.dataRowList.first.expander;

            // Expect expansion cell to be rendered and sized the same as the expansion cell inside the grid
            const summaryRow = childGrid.summariesRowList.first.nativeElement;
            const childSummaryIndentation = summaryRow.querySelector(SUMMARIES_MARGIN_CLASS);

            expect(summaryRow.children.length).toEqual(2);
            expect(childSummaryIndentation.offsetWidth).toEqual(expander.nativeElement.offsetWidth);
        }));

        it('should render summaries for column inside a column group.', fakeAsync(() => {
            fixture.componentInstance.rowIsland.childColumns.first.hasSummary = false;
            fixture.componentInstance.rowIsland.childColumns.last.hasSummary = true;
            fixture.detectChanges();

            // expand first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            // summaries seem to require this additional change detection call with Ivy disabled to display for the child grid
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];

            const summaryRow = childGrid.summariesRowList.first;
            expect(summaryRow.nativeElement.children.length).toEqual(2);
            expect(summaryRow.summaryCells.length).toEqual(3);
        }));
    });

    describe('Paging', () => {
        it('should work on data records only when paging is enabled and should not be affected by child grid rows.', fakeAsync(() => {
            hierarchicalGrid.paging = true;
            fixture.detectChanges();

            expect(hierarchicalGrid.dataView.length).toEqual(15);

            const dataRows = hierarchicalGrid.dataRowList.toArray();

            // expand 1st row
            hierarchicalGrid.expandRow(dataRows[0].rowID);
            tick(DEBOUNCE_TIME);
            fixture.detectChanges();
            expect(hierarchicalGrid.dataView.length).toEqual(16);

            // expand 2nd row
            hierarchicalGrid.expandRow(dataRows[1].rowID);
            tick(DEBOUNCE_TIME);
            fixture.detectChanges();

            expect(hierarchicalGrid.dataView.length).toEqual(17);
            expect(hierarchicalGrid.dataView.pop().ID).toEqual('14');
        }));

        it('should preserve expansion states after changing pages.', fakeAsync(() => {
            hierarchicalGrid.paging = true;
            fixture.detectChanges();

            let dataRows = hierarchicalGrid.dataRowList.toArray() as IgxHierarchicalRowComponent[];
            // expand 1st row
            hierarchicalGrid.expandRow(dataRows[0].rowID);
            // expand 2nd row
            hierarchicalGrid.expandRow(dataRows[1].rowID);

            expect(dataRows[0].expanded).toBeTruthy();
            expect(dataRows[1].expanded).toBeTruthy();
            expect(hierarchicalGrid.dataView.length).toEqual(17);

            let childGrids = hierarchicalGrid.hgridAPI.getChildGrids(false);
            expect(childGrids.length).toEqual(2);
            expect(childGrids[0].dataRowList.first.cells.first.value).toEqual('00');

            // Go to next page
            GridFunctions.navigateToNextPage(hierarchicalGrid.nativeElement);
            fixture.detectChanges();

            dataRows = hierarchicalGrid.dataRowList.toArray() as IgxHierarchicalRowComponent[];
            expect(dataRows[0].cells.first.value).toEqual('15');
            expect(dataRows[0].expanded).toBeFalsy();
            expect(dataRows[1].expanded).toBeFalsy();
            expect(hierarchicalGrid.dataView.length).toEqual(15);

            childGrids = hierarchicalGrid.hgridAPI.getChildGrids(false);

            // Return to previous page
            GridFunctions.navigateToPrevPage(hierarchicalGrid.nativeElement);
            fixture.detectChanges();

            dataRows = hierarchicalGrid.dataRowList.toArray() as IgxHierarchicalRowComponent[];
            expect(dataRows[0].cells.first.value).toEqual('0');
            expect(dataRows[0].expanded).toBeTruthy();
            expect(dataRows[1].expanded).toBeTruthy();
            expect(hierarchicalGrid.dataView.length).toEqual(17);

            childGrids = hierarchicalGrid.hgridAPI.getChildGrids(false);
            expect(childGrids[0].dataRowList.first.cells.first.value).toEqual('00');
        }));

        it('should allow scrolling to the last row after page size has been changed and rows are expanded.', fakeAsync(() => {
            /* it's better to avoid scrolling and only check for scrollbar availability */
            /* scrollbar doesn't update its visibility in fakeAsync tests */
            hierarchicalGrid.perPage = 20;
            hierarchicalGrid.paging = true;
            hierarchicalGrid.height = '800px';
            fixture.componentInstance.rowIsland.height = '200px';
            tick();
            fixture.detectChanges();
            expect(hierarchicalGrid.hasVerticalScroll()).toBeTruthy();

            hierarchicalGrid.perPage = 5;
            tick(DEBOUNCE_TIME);
            fixture.detectChanges();
            expect(hierarchicalGrid.hasVerticalScroll()).toBeFalsy();

            const dataRows = hierarchicalGrid.dataRowList.toArray() as IgxHierarchicalRowComponent[];

            // expand 1st row
            hierarchicalGrid.expandRow(dataRows[0].rowID);
            tick(DEBOUNCE_TIME);
            fixture.detectChanges();

            expect(hierarchicalGrid.hasVerticalScroll()).toBeFalsy();
            expect(hierarchicalGrid.hgridAPI.get_row_by_index(1) instanceof IgxChildGridRowComponent).toBeTruthy();

            // expand 3rd row
            hierarchicalGrid.expandRow(dataRows[3].rowID);
            tick(DEBOUNCE_TIME);
            fixture.detectChanges();
            expect(hierarchicalGrid.hgridAPI.get_row_by_index(4) instanceof IgxChildGridRowComponent).toBeTruthy();
        }));

        it('should correctly hide/show vertical scrollbar after page is changed.', (async () => {
            /* scrollbar doesn't update its visibility in fakeAsync tests */
            hierarchicalGrid.paging = true;
            hierarchicalGrid.perPage = 5;
            fixture.detectChanges();

            expect(hierarchicalGrid.hasVerticalScroll()).toBeFalsy();

            // expand 1st row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            await wait(DEBOUNCE_TIME);

            expect(hierarchicalGrid.hasVerticalScroll()).toBeTruthy();

            // change page
            hierarchicalGrid.page = 1;
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            expect(hierarchicalGrid.hasVerticalScroll()).toBeFalsy();

            // change page
            hierarchicalGrid.page = 0;
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            expect(hierarchicalGrid.hasVerticalScroll()).toBeTruthy();
        }));
    });

    describe('Hiding', () => {
        it('should leave no feature UI elements when all columns are hidden', fakeAsync(() => {
            hierarchicalGrid.rowSelection = GridSelectionMode.multiple;
            hierarchicalGrid.rowDraggable = true;
            hierarchicalGrid.paging = true;
            tick(DEBOUNCE_TIME);
            fixture.detectChanges();

            let headers = GridFunctions.getColumnHeaders(fixture);
            let gridRows = HierarchicalGridFunctions.getHierarchicalRows(fixture);
            let paging = GridFunctions.getGridPaginator(fixture);
            let rowSelectors = GridSelectionFunctions.getCheckboxes(fixture);
            let dragIndicators = GridFunctions.getDragIndicators(fixture);
            let expander = HierarchicalGridFunctions.getExpander(fixture, '[hidden]');

            expect(headers.length).toBeGreaterThan(0);
            expect(gridRows.length).toBeGreaterThan(0);
            expect(paging).not.toBeNull();
            expect(rowSelectors.length).toBeGreaterThan(0);
            expect(dragIndicators.length).toBeGreaterThan(0);
            // this check executes correctly on Ivy only
            // expect(Object.keys(expanders[0].attributes)).not.toContain('hidden');
            expect(expander).toBeNull();
            expect(hierarchicalGrid.hasVerticalScroll()).toBeTruthy();

            hierarchicalGrid.columnList.forEach((col) => col.hidden = true);
            tick(DEBOUNCE_TIME);
            fixture.detectChanges();

            headers = GridFunctions.getColumnHeaders(fixture);
            gridRows = HierarchicalGridFunctions.getHierarchicalRows(fixture);
            paging = GridFunctions.getGridPaginator(fixture);
            rowSelectors = GridSelectionFunctions.getCheckboxes(fixture);
            dragIndicators = GridFunctions.getDragIndicators(fixture);
            expander = HierarchicalGridFunctions.getExpander(fixture, '[hidden]');

            expect(headers.length).toBe(0);
            expect(gridRows.length).toBe(0);
            expect(paging).toBeNull();
            expect(rowSelectors.length).toBe(0);
            expect(dragIndicators.length).toBe(0);
            // this check executes correctly on Ivy only
            // expect(Object.keys(expanders[0].attributes)).toContain('hidden');
            expect(expander).not.toBeNull();
            expect(hierarchicalGrid.hasVerticalScroll()).toBeFalsy();
        }));
    });

    describe('Toolbar', () => {
        it('should be displayed correctly for child layout and hiding should apply to the correct child.', fakeAsync(() => {
            pending('Change test for new scrollbar structure');
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            tick();
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const toolbar = childGrid.nativeElement.querySelector('igx-grid-toolbar');
            const hidingUI = toolbar.querySelector('igx-grid-toolbar-hiding');

            // Check if visible columns and headers are rendered correctly
            expect(childGrid.visibleColumns.length).toEqual(4);

            // Check if hiding button & dropdown are init
            expect(toolbar).toBeDefined();
            expect(hidingUI).toBeDefined();

            hidingUI.click();
            tick();
            fixture.detectChanges();

            // // Check if the child grid columns are the one used by the hiding UI
            // childGrid.visibleColumns.forEach((column, index) => expect(toolbar.columnHidingUI.columns[index]).toEqual(column));

            // // Instead of clicking we can just toggle the checkbox
            // toolbar.columnHidingUI.columnItems.toArray()[2].toggle();
            // fixture.detectChanges();

            // And it should hide the column of the child grid
            // expect(childGrid.visibleColumns.length).toEqual(3);
        }));

        it('should be displayed correctly for child layout and pinning should apply to the correct child.', fakeAsync(() => {
            pending('Change test for new scrollbar structure');
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const toolbar = childGrid.nativeElement.querySelector('igx-grid-toolbar');

            // Check if visible columns and headers are rendered correctly
            expect(childGrid.visibleColumns.length).toEqual(4);

            // Check if pinning button & dropdown are init
            expect(toolbar).toBeDefined();
            expect(toolbar.querySelector('igx-grid-toolbar-pinning')).toBeDefined();

            // Check if the child grid columns are the one used by the pinning UI
            childGrid.visibleColumns.forEach((column, index) => expect(toolbar.columnPinningUI.columns[index]).toEqual(column));

              // Instead of clicking we can just toggle the checkbox
            toolbar.columnPinningUI.columnItems.toArray()[1].toggle();
            fixture.detectChanges();

            // Check pinned state
            expect(childGrid.getColumnByName('ChildLevels').pinned).toBeTruthy();
            expect(childGrid.getColumnByName('ProductName').pinned).toBeTruthy();
            expect(childGrid.getColumnByName('ID').pinned).toBeFalsy();
        }));

        it('should read from custom templates per level', fakeAsync(() => {
            pending('Change test for new scrollbar structure');
            fixture = TestBed.createComponent(IgxHierarchicalGridTestCustomToolbarComponent);
            tick();
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            tick(DEBOUNCE_TIME);
            fixture.detectChanges();

            const toolbars = fixture.debugElement.queryAll(By.css('igx-grid-toolbar'));
            expect(toolbars.length).toEqual(3);
            expect(toolbars[0].query(By.css('button')).nativeElement.innerText.trim()).toEqual('Parent Button');
            expect(toolbars[1].query(By.css('button')).nativeElement.innerText.trim()).toEqual('Child 1 Button');
            expect(toolbars[2].query(By.css('button')).nativeElement.innerText.trim()).toEqual('Child 2 Button');
        }));

        it('should have same width as the grid whole width', fakeAsync(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridTestCustomToolbarComponent);
            tick();
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;

            const toolbar = fixture.debugElement.query(By.css('igx-grid-toolbar'));
            expect(toolbar.nativeElement.offsetWidth).toEqual(hierarchicalGrid.nativeElement.offsetWidth);
        }));
    });

    describe('Moving', () => {

        // TODO: Revise this test! That DOM digging is sloppy
        xit('should not be possible to drag move a column from another grid.', (async () => {
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);

            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childHeader = childGrids[0].queryAll(By.css('igx-grid-header'))[0].nativeElement;
            const mainHeaders = hierarchicalGrid.nativeElement
                .querySelectorAll('igx-grid-header[ng-reflect-grid-i-d="' + hierarchicalGrid.id + '"]');

            const childHeaderX = childHeader.getBoundingClientRect().x + childHeader.getBoundingClientRect().width / 2;
            const childHeaderY = childHeader.getBoundingClientRect().y + childHeader.getBoundingClientRect().height / 2;
            const mainHeaderX = mainHeaders[0].getBoundingClientRect().x + mainHeaders[0].getBoundingClientRect().width / 2;
            const mainHeaderY = mainHeaders[0].getBoundingClientRect().y + mainHeaders[0].getBoundingClientRect().height / 2;

            UIInteractions.simulatePointerEvent('pointerdown', childHeader, childHeaderX, childHeaderY);
            await wait();
            fixture.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', childHeader, childHeaderX, childHeaderY - 10);
            await wait(100);
            fixture.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', childHeader, mainHeaderX + 50, mainHeaderY);
            await wait(100);
            fixture.detectChanges();

            // The moving indicator shouldn't show that a column can be moved.
            const childGroupHeader = childGrids[0].query(By.css('igx-grid-header')).injector.get(IgxColumnMovingDragDirective);
            const dragElem = childGroupHeader.ghostElement;
            const dragIcon = dragElem.querySelector('i');
            expect(dragElem).toBeDefined();
            expect(dragIcon.innerText.trim()).toEqual('block');

            UIInteractions.simulatePointerEvent('pointerup', childHeader, mainHeaderX + 50, mainHeaderY);
            await wait();
            fixture.detectChanges();

            expect(hierarchicalGrid.columnList.length).toEqual(4);
            // expect(mainHeaders.length).toEqual(3);
            // expect(mainHeaders[0].children[0].innerText.trim()).toEqual('ID');
            // expect(mainHeaders[1].children[0].innerText.trim()).toEqual('ChildLevels');
            // expect(mainHeaders[2].children[0].innerText.trim()).toEqual('ProductName');
        }));
    });

    describe('Pinning', () => {
        it('should be possible by templating the header and getting column reference for child grid', fakeAsync(() => {
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            let childHeader = GridFunctions.getColumnHeaders(fixture)[3];
            const firstHeaderIcon = childHeader.query(By.css('.igx-icon'));

            expect(GridFunctions.isHeaderPinned(childHeader.parent)).toBeFalsy();
            expect(childGrid.columnList.first.pinned).toBeFalsy();
            expect(firstHeaderIcon).toBeDefined();

            UIInteractions.simulateClickAndSelectEvent(firstHeaderIcon);
            fixture.detectChanges();
            tick();

            childHeader = GridFunctions.getColumnHeaders(fixture)[3];
            expect(childGrid.columnList.first.pinned).toBeTruthy();
            expect(GridFunctions.isHeaderPinned(childHeader.parent)).toBeTruthy();
        }));

        it('should be applied correctly for child grid with multi-column header.', fakeAsync(() => {
            fixture.componentInstance.rowIsland.columnList.find(x => x.header === 'Information').pinned = true;
            tick(DEBOUNCE_TIME);
            fixture.detectChanges();

            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            tick(DEBOUNCE_TIME);
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            // check unpinned/pinned columns
            expect(childGrid.pinnedColumns.length).toBe(3);
            expect(childGrid.unpinnedColumns.length).toBe(1);
            // check cells
            expect(childGrid.gridAPI.get_row_by_index(0).cells.length).toBe(3);
            let cell = childGrid.getCellByColumn(0, 'ChildLevels');
            expect(cell.visibleColumnIndex).toEqual(0);
            expect(GridFunctions.isCellPinned(cell)).toBeTruthy();
            cell = childGrid.getCellByColumn(0, 'ProductName');
            expect(cell.visibleColumnIndex).toEqual(1);
            expect(GridFunctions.isCellPinned(cell)).toBeTruthy();
            cell = childGrid.getCellByColumn(0, 'ID');
            expect(cell.visibleColumnIndex).toEqual(2);
            expect(GridFunctions.isCellPinned(cell)).toBeFalsy();
        }));

        it('should be applied correctly even on the right side', fakeAsync(() => {
            hierarchicalGrid = fixture.componentInstance.hgrid;
            hierarchicalGrid.columnList.find(x => x.field === 'ID').pinned = true;
            hierarchicalGrid.pinning.columns = 1;
            hierarchicalGrid.cdr.detectChanges();
            tick();
            fixture.detectChanges();
            const rightMostGridPart = hierarchicalGrid.nativeElement.getBoundingClientRect().right;
            const leftMostGridPart = hierarchicalGrid.nativeElement.getBoundingClientRect().left;
            const leftMostRightPinnedCellsPart = hierarchicalGrid.getCellByColumn(0, 'ID').nativeElement.getBoundingClientRect().left;
            const pinnedCellWidth = hierarchicalGrid.getCellByColumn(0, 'ID').width;
            // Expects that right pinning has been in action
            expect(leftMostGridPart).not.toEqual(leftMostRightPinnedCellsPart);
            // Expects that pinned column is in the visible grid's area
            expect(leftMostRightPinnedCellsPart).toBeLessThan(rightMostGridPart);
            // Expects that the whole pinned column is visible
            expect(leftMostRightPinnedCellsPart + Number.parseInt(pinnedCellWidth, 10)).toBeLessThan(rightMostGridPart);
        }));
    });

    describe('Row Pinning', () => {
        const FIXED_ROW_CONTAINER = '.igx-grid__tr--pinned';
        const FIXED_ROW_CONTAINER_TOP = 'igx-grid__tr--pinned-top';
        const FIXED_ROW_CONTAINER_BOTTOM = 'igx-grid__tr--pinned-bottom';
        beforeEach(() => {
            hierarchicalGrid.width = '800px';
            hierarchicalGrid.height = '500px';
            fixture.detectChanges();
        });

        it('should pin rows to top ', (() => {
            hierarchicalGrid.pinRow('0');
            fixture.detectChanges();

            expect(hierarchicalGrid.pinnedRows.length).toBe(1);
            let pinRowContainer = fixture.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].nativeElement.classList.contains(FIXED_ROW_CONTAINER_TOP)).toBeTruthy();
            expect(pinRowContainer[0].nativeElement.classList.contains(FIXED_ROW_CONTAINER_BOTTOM)).toBeFalsy();

            expect(pinRowContainer[0].children[0].context.rowID).toBe('0');
            expect(hierarchicalGrid.getRowByIndex(1).key).toBe('0');
            expect(hierarchicalGrid.getRowByIndex(2).key).toBe('1');
            expect(hierarchicalGrid.getRowByIndex(3).key).toBe('2');

            hierarchicalGrid.pinRow('2');
            fixture.detectChanges();

            pinRowContainer = fixture.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer[0].children.length).toBe(2);

            expect(pinRowContainer[0].children[0].context.rowID).toBe('0');
            expect(pinRowContainer[0].children[1].context.rowID).toBe('2');
            expect(hierarchicalGrid.getRowByIndex(2).key).toBe('0');
            expect(hierarchicalGrid.getRowByIndex(3).key).toBe('1');
            expect(hierarchicalGrid.getRowByIndex(4).key).toBe('2');

            fixture.detectChanges();
            expect(hierarchicalGrid.pinnedRowHeight).toBe(2 * hierarchicalGrid.renderedRowHeight + 2);
            const expectedHeight = parseInt(hierarchicalGrid.height, 10) -
                hierarchicalGrid.pinnedRowHeight - 18 - hierarchicalGrid.theadRow.nativeElement.offsetHeight;
            expect(hierarchicalGrid.calcHeight - expectedHeight).toBeLessThanOrEqual(1);
        }));

        it('should pin rows to bottom', (() => {
            fixture.componentInstance.pinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Bottom };
            fixture.detectChanges();

            // Pin 2nd row
            hierarchicalGrid.pinRow('1');
            fixture.detectChanges();

            expect(hierarchicalGrid.pinnedRows.length).toBe(1);
            let pinRowContainer = fixture.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].nativeElement.classList.contains(FIXED_ROW_CONTAINER_TOP)).toBeFalsy();
            expect(pinRowContainer[0].nativeElement.classList.contains(FIXED_ROW_CONTAINER_BOTTOM)).toBeTruthy();

            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe('1');
            expect(pinRowContainer[0].children[0].context.index).toBe(fixture.componentInstance.data.length);
            expect(pinRowContainer[0].children[0].nativeElement)
                .toBe(hierarchicalGrid.gridAPI.get_row_by_index(fixture.componentInstance.data.length).nativeElement);

            expect(hierarchicalGrid.getRowByIndex(0).key).toBe('0');
            expect(hierarchicalGrid.getRowByIndex(1).key).toBe('1');
            expect(hierarchicalGrid.getRowByIndex(2).key).toBe('2');

            // Pin 1st row
            hierarchicalGrid.pinRow('0');
            fixture.detectChanges();

            pinRowContainer = fixture.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer[0].children.length).toBe(2);
            expect(pinRowContainer[0].children[0].context.rowID).toBe('1');
            expect(pinRowContainer[0].children[1].context.rowID).toBe('0');
            expect(hierarchicalGrid.getRowByIndex(0).key).toBe('0');
            expect(hierarchicalGrid.getRowByIndex(1).key).toBe('1');
            expect(hierarchicalGrid.getRowByIndex(2).key).toBe('2');

            fixture.detectChanges();
            // Check last pinned is fully in view
            const last = pinRowContainer[0].children[1].context.nativeElement;
            expect(last.getBoundingClientRect().bottom - hierarchicalGrid.tbody.nativeElement.getBoundingClientRect().bottom).toBe(0);

            // 2 records pinned + 2px border
            expect(hierarchicalGrid.pinnedRowHeight).toBe(2 * hierarchicalGrid.renderedRowHeight + 2);
            const expectedHeight = parseInt(hierarchicalGrid.height, 10) -
                hierarchicalGrid.pinnedRowHeight - 18 - hierarchicalGrid.theadRow.nativeElement.offsetHeight;
            expect(hierarchicalGrid.calcHeight - expectedHeight).toBeLessThanOrEqual(1);
        }));

        it('should search in both pinned and unpinned rows.', () => {
            let findCount = hierarchicalGrid.findNext('Product: A0');
            fixture.detectChanges();

            let spans = fixture.debugElement.queryAll(By.css('.igx-highlight'));
            expect(spans.length).toBe(1);
            expect(findCount).toEqual(1);

            // Pin 1st row
            hierarchicalGrid.pinRow('0');
            fixture.detectChanges();
            expect(hierarchicalGrid.pinnedRows.find(r => r.rowID === '0')).toBeDefined();

            findCount = hierarchicalGrid.findNext('Product: A0');
            fixture.detectChanges();

            spans = fixture.debugElement.queryAll(By.css('.igx-highlight'));
            expect(spans.length).toBe(2);
            expect(findCount).toEqual(2);
        });

        it('should apply filtering to both pinned and unpinned rows.', () => {
            hierarchicalGrid.pinRow('1');
            fixture.detectChanges();
            hierarchicalGrid.pinRow('5');
            fixture.detectChanges();

            let pinRowContainer = fixture.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer[0].children.length).toBe(2);
            expect(pinRowContainer[0].children[0].context.rowID).toBe('1');
            expect(pinRowContainer[0].children[1].context.rowID).toBe('5');

            hierarchicalGrid.filter('ID', '5', IgxStringFilteringOperand.instance().condition('contains'), false);
            fixture.detectChanges();

            const allRows = HierarchicalGridFunctions.getHierarchicalRows(fixture);
            pinRowContainer = fixture.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe('5');
            expect(allRows[1].componentInstance.rowID).toEqual('5');
        });

        it('should render paging with correct data and rows be correctly paged.', () => {
            hierarchicalGrid.paging = true;
            hierarchicalGrid.perPage = 5;
            hierarchicalGrid.height = '700px';
            fixture.detectChanges();

            let rows = HierarchicalGridFunctions.getHierarchicalRows(fixture);
            const paginator = fixture.debugElement.query(By.directive(IgxPaginatorComponent));
            expect(rows.length).toEqual(5);
            expect(paginator.componentInstance.perPage).toEqual(5);
            expect(paginator.componentInstance.totalPages).toEqual(8);

            hierarchicalGrid.pinRow('1');
            fixture.detectChanges();

            rows = HierarchicalGridFunctions.getHierarchicalRows(fixture);
            expect(rows.length).toEqual(6);
            expect(paginator.componentInstance.perPage).toEqual(5);
            expect(paginator.componentInstance.totalPages).toEqual(8);

            hierarchicalGrid.pinRow('3');
            fixture.detectChanges();

            rows = HierarchicalGridFunctions.getHierarchicalRows(fixture);
            expect(rows.length).toEqual(7);
            expect(paginator.componentInstance.perPage).toEqual(5);
            expect(paginator.componentInstance.totalPages).toEqual(8);
        });

        it('should apply sorting to both pinned and unpinned rows.', () => {
            hierarchicalGrid.pinRow('1');
            hierarchicalGrid.pinRow('3');
            fixture.detectChanges();

            expect(hierarchicalGrid.getRowByIndex(0).key).toBe('1');
            expect(hierarchicalGrid.getRowByIndex(1).key).toBe('3');

            hierarchicalGrid.sort({ fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false });
            fixture.detectChanges();

            // check pinned rows data is sorted
            expect(hierarchicalGrid.getRowByIndex(0).key).toBe('3');
            expect(hierarchicalGrid.getRowByIndex(1).key).toBe('1');

            // check unpinned rows data is sorted
            // Expect 9 since it is a string.
            expect(hierarchicalGrid.getRowByIndex(2).key).toBe('9');
        });

        it('should return pinned rows as well on multiple cell selection in both pinned and unpinned areas', async () => {
            hierarchicalGrid.pinRow('1');
            fixture.detectChanges();

            let range = { rowStart: 0, rowEnd: 2, columnStart: 'ID', columnEnd: 'ChildLevels' };
            hierarchicalGrid.selectRange(range);
            fixture.detectChanges();

            let selectedData = hierarchicalGrid.getSelectedData();
            expect(selectedData).toEqual([{ID: '1', ChildLevels: 3}, {ID: '0', ChildLevels: 3}, {ID: '1', ChildLevels: 3}]);

            fixture.componentInstance.pinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Bottom };
            fixture.detectChanges();

            hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop = 5000;
            await wait();

            range = { rowStart: 38, rowEnd: 40, columnStart: 'ID', columnEnd: 'ChildLevels' };
            hierarchicalGrid.clearCellSelection();
            hierarchicalGrid.selectRange(range);
            fixture.detectChanges();

            selectedData = hierarchicalGrid.getSelectedData();
            expect(selectedData).toEqual([{ID: '38', ChildLevels: 3}, {ID: '39', ChildLevels: 3}, {ID: '1', ChildLevels: 3}]);
        });

        it('should return correct filterData collection after filtering.', () => {
            hierarchicalGrid.pinRow('1');
            hierarchicalGrid.pinRow('11');
            fixture.detectChanges();

            hierarchicalGrid.filter('ID', '1', IgxStringFilteringOperand.instance().condition('contains'), false);
            fixture.detectChanges();

            let gridFilterData = hierarchicalGrid.filteredData;
            expect(gridFilterData.length).toBe(15);
            expect(gridFilterData[0].ID).toBe('1');
            expect(gridFilterData[1].ID).toBe('11');
            expect(gridFilterData[2].ID).toBe('1');

            fixture.componentInstance.pinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Bottom };
            fixture.detectChanges();

            gridFilterData = hierarchicalGrid.filteredData;
            expect(gridFilterData.length).toBe(15);
            expect(gridFilterData[0].ID).toBe('1');
            expect(gridFilterData[1].ID).toBe('11');
            expect(gridFilterData[2].ID).toBe('1');
        });

        it('should correctly apply paging state for grid and paginator when there are pinned rows.', fakeAsync(() => {
            hierarchicalGrid.paging = true;
            hierarchicalGrid.perPage = 5;
            hierarchicalGrid.height = '700px';
            fixture.detectChanges();
            const paginator = fixture.debugElement.query(By.directive(IgxPaginatorComponent)).componentInstance;
            // pin the first row
            hierarchicalGrid.getRowByIndex(0).pin();
            fixture.detectChanges();

            expect(hierarchicalGrid.rowList.length).toEqual(6);
            expect(hierarchicalGrid.perPage).toEqual(5);
            expect(paginator.perPage).toEqual(5);
            expect(paginator.totalRecords).toEqual(40);
            expect(paginator.totalPages).toEqual(8);

            // pin the second row
            hierarchicalGrid.getRowByIndex(2).pin();
            fixture.detectChanges();

            expect(hierarchicalGrid.rowList.length).toEqual(7);
            expect(hierarchicalGrid.perPage).toEqual(5);
            expect(paginator.perPage).toEqual(5);
            expect(paginator.totalRecords).toEqual(40);
            expect(paginator.totalPages).toEqual(8);

            // expand the first row
            hierarchicalGrid.expandRow(hierarchicalGrid.dataRowList.first.rowID);
            fixture.detectChanges();
            tick(50);
            fixture.detectChanges();

            expect(hierarchicalGrid.rowList.length).toEqual(8);
            expect(hierarchicalGrid.perPage).toEqual(5);
            expect(paginator.perPage).toEqual(5);
            expect(paginator.totalRecords).toEqual(40);
            expect(paginator.totalPages).toEqual(8);

            expect(hierarchicalGrid.rowList.toArray()[1] instanceof IgxChildGridRowComponent).toBeFalsy();
            expect(hierarchicalGrid.rowList.toArray()[3] instanceof IgxChildGridRowComponent).toBeTruthy();
        }));

        it('should have the correct records shown for pages with pinned rows', () => {
            hierarchicalGrid.paging = true;
            hierarchicalGrid.perPage = 6;
            hierarchicalGrid.height = '700px';
            fixture.detectChanges();
            hierarchicalGrid.getRowByIndex(0).pin();
            hierarchicalGrid.getRowByIndex(1).pin();
            fixture.detectChanges();

            let rows = hierarchicalGrid.rowList.toArray();

            [0, 1, 0, 1, 2, 3, 4].forEach((x, index) => expect(parseInt(rows[index].cells.first.value, 10)).toEqual(x));

            hierarchicalGrid.paginate(6);
            fixture.detectChanges();

            rows = hierarchicalGrid.rowList.toArray();

            [0, 1, 36, 37, 38, 39].forEach((x, index) => expect(parseInt(rows[index].cells.first.value, 10)).toEqual(x));
        });
    });
});
