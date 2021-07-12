import { ViewChild, Component, DebugElement, OnInit } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './public_api';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { ColumnPinningPosition, RowPinningPosition } from '../common/enums';
import { IPinningConfig } from '../grid.common';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxGridTransaction } from '../tree-grid/public_api';
import { IgxTransactionService } from '../../services/public_api';
import { GridSummaryFunctions } from '../../test-utils/grid-functions.spec';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { IgxPaginatorComponent } from '../../paginator/paginator.component';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { setupGridScrollDetection } from '../../test-utils/helper-utils.spec';

describe('Row Pinning #grid', () => {
    const FIXED_ROW_CONTAINER = '.igx-grid__tr--pinned ';
    const CELL_CSS_CLASS = '.igx-grid__td';
    const DEBOUNCE_TIME = 60;

    let fix;
    let grid: IgxGridComponent;

    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                GridRowPinningComponent,
                GridRowPinningWithMRLComponent,
                GridRowPinningWithMDVComponent,
                GridRowPinningWithTransactionsComponent,
                GridRowPinningWithInitialPinningComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule
            ]
        });
    }));

    describe('', () => {
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(GridRowPinningComponent);
            fix.detectChanges();
            grid = fix.componentInstance.instance;
            tick();
            fix.detectChanges();
        }));

        it('should pin rows to top.', () => {
            // pin 2nd data row
            grid.pinRow(fix.componentInstance.data[1]);
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(1);
            let pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[0].nativeElement).toBe(grid.gridAPI.get_row_by_index(0).nativeElement);

            expect(grid.gridAPI.get_row_by_index(1).rowID).toBe(fix.componentInstance.data[0]);
            expect(grid.gridAPI.get_row_by_index(3).rowID).toBe(fix.componentInstance.data[2]);

            // pin 3rd data row
            grid.pinRow(fix.componentInstance.data[2]);
            fix.detectChanges();

            pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer[0].children.length).toBe(2);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[1].context.rowID).toBe(fix.componentInstance.data[2]);

            expect(grid.gridAPI.get_row_by_index(2).rowID).toBe(fix.componentInstance.data[0]);
            expect(grid.gridAPI.get_row_by_index(5).rowID).toBe(fix.componentInstance.data[3]);

            fix.detectChanges();
            // 2 records pinned + 2px border
            expect(grid.pinnedRowHeight).toBe(2 * grid.renderedRowHeight + 2);
            const expectedHeight = parseInt(grid.height, 10) - grid.pinnedRowHeight - 18 - grid.theadRow.nativeElement.offsetHeight;
            expect(grid.calcHeight - expectedHeight).toBeLessThanOrEqual(1);
        });

        it('should pin rows to bottom.', () => {
            fix.componentInstance.pinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Bottom };
            fix.detectChanges();

            // pin 2nd
            grid.pinRow(fix.componentInstance.data[1]);
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(1);
            let pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[0].context.index - grid.pinnedRows.length).toBe(fix.componentInstance.data.length - 1);
            expect(pinRowContainer[0].children[0].nativeElement)
                .toBe(grid.gridAPI.get_row_by_index(fix.componentInstance.data.length).nativeElement);

            expect(grid.gridAPI.get_row_by_index(0).rowID).toBe(fix.componentInstance.data[0]);
            expect(grid.gridAPI.get_row_by_index(2).rowID).toBe(fix.componentInstance.data[2]);

            // pin 1st
            grid.pinRow(fix.componentInstance.data[0]);
            fix.detectChanges();

            pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer[0].children.length).toBe(2);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[1].context.rowID).toBe(fix.componentInstance.data[0]);
            fix.detectChanges();
            // check last pinned is fully in view
            const last = pinRowContainer[0].children[1].context.nativeElement;
            expect(last.getBoundingClientRect().bottom - grid.tbody.nativeElement.getBoundingClientRect().bottom).toBe(0);

            // 2 records pinned + 2px border
            expect(grid.pinnedRowHeight).toBe(2 * grid.renderedRowHeight + 2);
            const expectedHeight = parseInt(grid.height, 10) - grid.pinnedRowHeight - 18 - grid.theadRow.nativeElement.offsetHeight;
            expect(grid.calcHeight - expectedHeight).toBeLessThanOrEqual(1);
        });

        it('should allow pinning row at specified index via API.', () => {
            grid.pinRow(fix.componentInstance.data[1]);
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(1);
            expect(grid.pinnedRows[0].rowData).toBe(fix.componentInstance.data[1]);

            // pin at index 0
            grid.pinRow(fix.componentInstance.data[2], 0);
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(2);
            expect(grid.pinnedRows[0].rowData).toBe(fix.componentInstance.data[2]);
            expect(grid.pinnedRows[1].rowData).toBe(fix.componentInstance.data[1]);

            // pin at index 1
            grid.pinRow(fix.componentInstance.data[3], 1);
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(3);
            expect(grid.pinnedRows[0].rowData).toBe(fix.componentInstance.data[2]);
            expect(grid.pinnedRows[1].rowData).toBe(fix.componentInstance.data[3]);
            expect(grid.pinnedRows[2].rowData).toBe(fix.componentInstance.data[1]);
        });

        it('should emit rowPinning on pin/unpin.', () => {
            spyOn(grid.rowPinning, 'emit').and.callThrough();

            let row = grid.getRowByIndex(0);
            const rowID = row.key;
            row.pin();
            fix.detectChanges();

            // Check pinned state with getRowByIndex after pin action
            expect(row.pinned).toBe(true);

            expect(grid.rowPinning.emit).toHaveBeenCalledTimes(1);
            expect(grid.rowPinning.emit).toHaveBeenCalledWith({
                rowID,
                insertAtIndex: undefined,
                isPinned: true,
                row
            });

            row = grid.getRowByIndex(0);
            row.unpin();
            fix.detectChanges();
            // Check pinned state with getRowByIndex after unpin action
            expect(row.pinned).toBe(false);

            expect(grid.rowPinning.emit).toHaveBeenCalledTimes(2);
        });

        it('should pin/unpin via grid API methods.', () => {
            // pin 2nd row
            grid.pinRow(fix.componentInstance.data[1]);
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(1);
            let pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[0].context.index).toBe(0);
            expect(pinRowContainer[0].children[0].nativeElement).toBe(grid.gridAPI.get_row_by_index(0).nativeElement);

            expect(grid.gridAPI.get_row_by_index(0).rowID).toBe(fix.componentInstance.data[1]);
            expect(grid.gridAPI.get_row_by_index(1).rowID).toBe(fix.componentInstance.data[0]);

            // unpin 2nd row
            grid.unpinRow(fix.componentInstance.data[1]);
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(0);
            pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(0);

            expect(grid.gridAPI.get_row_by_index(0).rowID).toBe(fix.componentInstance.data[0]);
            expect(grid.gridAPI.get_row_by_index(1).rowID).toBe(fix.componentInstance.data[1]);
        });

        it('should pin/unpin via row API methods.', () => {
            // pin 2nd row
            let row = grid.gridAPI.get_row_by_index(1);
            row.pin();
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(1);
            let pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);

            expect(grid.gridAPI.get_row_by_index(0).rowID).toBe(fix.componentInstance.data[1]);
            expect(grid.gridAPI.get_row_by_index(1).rowID).toBe(fix.componentInstance.data[0]);

            // unpin
            row = grid.gridAPI.get_row_by_index(0);
            row.unpin();
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(0);
            pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(0);

            expect(grid.gridAPI.get_row_by_index(0).rowID).toBe(fix.componentInstance.data[0]);
            expect(grid.gridAPI.get_row_by_index(1).rowID).toBe(fix.componentInstance.data[1]);
        });

        it('should pin/unpin via row pinned setter.', () => {
            // pin 2nd row
            let row = grid.gridAPI.get_row_by_index(1);
            row.pinned = true;
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(1);
            let pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);

            expect(grid.gridAPI.get_row_by_index(0).rowID).toBe(fix.componentInstance.data[1]);
            expect(grid.gridAPI.get_row_by_index(1).rowID).toBe(fix.componentInstance.data[0]);

            // unpin
            row = grid.gridAPI.get_row_by_index(0);
            row.pinned = false;
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(0);
            pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(0);

            expect(grid.gridAPI.get_row_by_index(0).rowID).toBe(fix.componentInstance.data[0]);
            expect(grid.gridAPI.get_row_by_index(1).rowID).toBe(fix.componentInstance.data[1]);
        });

        it('should search in both pinned and unpinned rows.', () => {
            // pin 1st row
            let row = grid.gridAPI.get_row_by_index(0);
            row.pinned = true;
            fix.detectChanges();
            expect(grid.pinnedRows.length).toBe(1);

            let finds = grid.findNext('mari');
            fix.detectChanges();

            const fixNativeElement = fix.debugElement.nativeElement;
            let spans = fixNativeElement.querySelectorAll('.igx-highlight');
            expect(spans.length).toBe(2);
            expect(finds).toEqual(3);

            finds = grid.findNext('antonio');
            fix.detectChanges();

            spans = fixNativeElement.querySelectorAll('.igx-highlight');
            expect(spans.length).toBe(2);
            expect(finds).toEqual(2);

            // pin 3rd row
            row = grid.gridAPI.get_row_by_index(2);
            row.pinned = true;
            fix.detectChanges();
            expect(grid.pinnedRows.length).toBe(2);

            finds = grid.findNext('antonio');
            fix.detectChanges();

            spans = fixNativeElement.querySelectorAll('.igx-highlight');
            expect(spans.length).toBe(2);
            expect(finds).toEqual(2);
        });

        it('should allow pinning onInit', () => {
            expect(() => {
                fix = TestBed.createComponent(GridRowPinningComponent);
                grid = fix.componentInstance.instance;
                fix.detectChanges();
                grid.pinRow(fix.componentInstance.data[1]);
                fix.detectChanges();
            }).not.toThrow();
            expect(grid.pinnedRows.length).toBe(1);
            expect(grid.gridAPI.get_row_by_index(0).rowID).toBe(fix.componentInstance.data[1]);
        });

        it('should pin rows when columns are grouped.', () => {
            grid.height = '650px';
            fix.detectChanges();
            // pin 1st and 2nd data row
            grid.pinRow(fix.componentInstance.data[0]);
            grid.pinRow(fix.componentInstance.data[1]);
            fix.detectChanges();

            // group by string column
            grid.groupBy({
                fieldName: 'ContactTitle', dir: SortingDirection.Desc, ignoreCase: false
            });
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(2);

            // verify rows
            const groupRows = grid.groupsRowList.toArray();
            const dataRows = grid.dataRowList.toArray();

            expect(groupRows.length).toEqual(2);
            expect(dataRows.length).toEqual(9);
            expect(groupRows[0].groupRow.records[0].ID).toEqual('ALFKI');
            expect(groupRows[0].groupRow.records[1].ID).toEqual('AROUT');

            // pin 4th data row with ID:AROUT
            grid.pinRow(fix.componentInstance.data[3]);
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(3);

            // make sure the pinned rows is in the unpinned area as disabled row
            expect(groupRows[0].groupRow.records[0].ID).toEqual('ALFKI');
            expect(groupRows[0].groupRow.records[1].ID).toEqual('AROUT');
            expect(groupRows[0].groupRow.records[2].ID).toEqual('BLAUS');
        });

        it('should apply filtering to both pinned and unpinned rows.', () => {
            grid.gridAPI.get_row_by_index(1).pin();
            fix.detectChanges();
            grid.gridAPI.get_row_by_index(5).pin();
            fix.detectChanges();

            let pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer[0].children.length).toBe(2);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[1].context.rowID).toBe(fix.componentInstance.data[4]);

            grid.filter('ID', 'B', IgxStringFilteringOperand.instance().condition('contains'), false);
            fix.detectChanges();

            pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[4]);
        });

        it('should calculate global summaries correctly when filtering is applied.', () => {
            grid.getColumnByName('ID').hasSummary = true;
            fix.detectChanges();
            grid.filter('ID', 'BERGS', IgxStringFilteringOperand.instance().condition('contains'), false);
            fix.detectChanges();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, ['Count'], ['1']);

            // pin row
            grid.gridAPI.get_row_by_index(0).pin();
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, ['Count'], ['1']);
        });

        it('should remove pinned container and recalculate sizes when all pinned records are filtered out.', () => {
            grid.gridAPI.get_row_by_index(1).pin();
            fix.detectChanges();
            let pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);

            fix.detectChanges();
            let expectedHeight = parseInt(grid.height, 10) - grid.pinnedRowHeight - 18 - grid.theadRow.nativeElement.offsetHeight;
            expect(grid.calcHeight - expectedHeight).toBeLessThanOrEqual(1);

            grid.filter('ID', 'B', IgxStringFilteringOperand.instance().condition('startsWith'), false);
            fix.detectChanges();

            pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(0);

            fix.detectChanges();
            expect(grid.pinnedRowHeight).toBe(0);
            expectedHeight = parseInt(grid.height, 10) - grid.pinnedRowHeight - 18 - grid.theadRow.nativeElement.offsetHeight;
            expect(grid.calcHeight - expectedHeight).toBeLessThanOrEqual(1);
        });

        it('should return correct filterData collection.', () => {
            grid.gridAPI.get_row_by_index(1).pin();
            fix.detectChanges();
            grid.gridAPI.get_row_by_index(6).pin();
            fix.detectChanges();

            grid.filter('ID', 'B', IgxStringFilteringOperand.instance().condition('contains'), false);
            fix.detectChanges();

            let gridFilterData = grid.filteredData;
            expect(gridFilterData.length).toBe(8);
            expect(gridFilterData[0].ID).toBe('BLAUS');
            expect(gridFilterData[1].ID).toBe('BERGS');

            fix.componentInstance.pinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Bottom };
            fix.detectChanges();

            gridFilterData = grid.filteredData;
            expect(gridFilterData.length).toBe(8);
            expect(gridFilterData[0].ID).toBe('BLAUS');
            expect(gridFilterData[1].ID).toBe('BERGS');
        });

        it('should apply sorting to both pinned and unpinned rows.', () => {
            grid.gridAPI.get_row_by_index(1).pin();
            grid.gridAPI.get_row_by_index(5).pin();
            fix.detectChanges();

            expect(grid.gridAPI.get_row_by_index(0).rowID).toBe(fix.componentInstance.data[1]);
            expect(grid.gridAPI.get_row_by_index(1).rowID).toBe(fix.componentInstance.data[5]);

            grid.sort({ fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false });
            fix.detectChanges();

            // check pinned rows data is sorted
            expect(grid.gridAPI.get_row_by_index(0).rowID).toBe(fix.componentInstance.data[5]);
            expect(grid.gridAPI.get_row_by_index(1).rowID).toBe(fix.componentInstance.data[1]);

            // check unpinned rows data is sorted
            const lastIndex = fix.componentInstance.data.length - 1;
            expect(grid.gridAPI.get_row_by_index(2).rowID).toBe(fix.componentInstance.data[lastIndex]);
        });
    });

    describe('Row pinning with Master Detail View', () => {
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(GridRowPinningWithMDVComponent);
            fix.detectChanges();
            grid = fix.componentInstance.instance;
            tick();
            fix.detectChanges();
        }));

        it('should be in view when expanded and pinning row to bottom of the grid.', async () => {
            fix.componentInstance.pinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Bottom };
            fix.detectChanges();
            // pin 1st row
            const row = grid.gridAPI.get_row_by_index(0);
            row.pinned = true;
            fix.detectChanges();
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            GridFunctions.toggleMasterRow(fix, grid.pinnedRows[0]);
            fix.detectChanges();
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();


            expect(grid.pinnedRows.length).toBe(1);

            const firstRowIconName = GridFunctions.getRowExpandIconName(grid.rowList.toArray()[0]);
            const pinnedRow = grid.pinnedRows[0];
            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.has(pinnedRow.rowID)).toBeTruthy();
            expect(grid.expansionStates.get(pinnedRow.rowID)).toBeTruthy();
            // disabled row should have expand icon
            expect(firstRowIconName).toEqual('expand_more');
            // disabled row should have chip
            const cell = grid.gridAPI.get_row_by_index(0).cells.first;
            expect(cell.nativeElement.getElementsByClassName('igx-grid__td--pinned-chip').length).toBe(1);
            // pinned row shouldn't have expand icon
            const hasIconForPinnedRow = pinnedRow.cells.first.nativeElement.querySelector('igx-icon');
            expect(hasIconForPinnedRow).toBeNull();

            // check last pinned row is fully in view
            expect(pinnedRow.nativeElement.getBoundingClientRect().bottom - grid.tbody.nativeElement.getBoundingClientRect().bottom)
                .toBe(0);
        });

        it('should calculate global summaries with both pinned and unpinned collections', () => {
            // enable summaries for each column
            grid.columns.forEach(c => {
                c.hasSummary = true;
            });
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ContactTitle', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();

            let row = grid.gridAPI.get_row_by_index(1);
            row.pinned = true;
            fix.detectChanges();
            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, ['Count'], ['27']);

            row = grid.pinnedRows[0];
            row.pinned = false;
            fix.detectChanges();
            expect(grid.pinnedRows.length).toBe(0);
            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, ['Count'], ['27']);
        });

        it('should calculate groupby row summaries only within unpinned collection', () => {
            // enable summaries for each column
            grid.columns.forEach(c => {
                c.hasSummary = true;
            });
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ContactTitle', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();

            let row = grid.gridAPI.get_row_by_index(1);
            row.pinned = true;
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(1);

            // get first summary row and make sure that the pinned record is not contained within the calculations
            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 4);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, ['Count'], ['2']);

            // unpin the row and check if the summary is recalculated
            row = grid.pinnedRows[0];
            row.pinned = false;
            fix.detectChanges();
            expect(grid.pinnedRows.length).toBe(0);
            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, ['Count'], ['2']);
        });
    });

    describe('Paging', () => {
        let paginator: IgxPaginatorComponent;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(GridRowPinningComponent);
            fix.componentInstance.createSimpleData(12);
            fix.detectChanges();
            grid = fix.componentInstance.instance;
            fix.componentInstance.paging = true;
            fix.detectChanges();
            grid.perPage = 5;

            fix.detectChanges();
            tick();

            paginator = fix.debugElement.query(By.directive(IgxPaginatorComponent)).componentInstance;
        }));

        it('should correctly apply paging state for grid and paginator when there are pinned rows.', () => {
            // pin the first row
            grid.gridAPI.get_row_by_index(0).pin();
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(6);
            expect(grid.perPage).toEqual(5);
            expect(paginator.perPage).toEqual(5);
            expect(paginator.totalRecords).toEqual(12);
            expect(paginator.totalPages).toEqual(3);

            // pin the second row
            grid.gridAPI.get_row_by_index(2).pin();
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(7);
            expect(grid.perPage).toEqual(5);
            expect(paginator.perPage).toEqual(5);
            expect(paginator.totalRecords).toEqual(12);
            expect(paginator.totalPages).toEqual(3);
        });

        it('should have the correct records shown for pages with pinned rows', () => {
            grid.gridAPI.get_row_by_index(0).pin();
            grid.gridAPI.get_row_by_index(1).pin();
            fix.detectChanges();

            let rows = grid.rowList.toArray();

            [1, 2, 1, 2, 3, 4, 5].forEach((x, index) => expect(rows[index].cells.first.value).toEqual(x));

            grid.paginate(2);
            fix.detectChanges();

            rows = grid.rowList.toArray();

            [1, 2, 11, 12].forEach((x, index) => expect(rows[index].cells.first.value).toEqual(x));
        });
    });

    describe(' Editing ', () => {
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(GridRowPinningWithTransactionsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.instance;
            tick();
            fix.detectChanges();
        }));

        it('should allow pinning edited row.', () => {
            grid.updateCell('New value', 'ANTON', 'CompanyName');
            fix.detectChanges();
            grid.pinRow('ANTON');
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(1);
            const pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe('ANTON');
            expect(pinRowContainer[0].children[0].context.rowData.CompanyName).toBe('New value');
        });

        it('should allow pinning deleted row.', () => {
            grid.deleteRow('ALFKI');
            fix.detectChanges();
            grid.pinRow('ALFKI');
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(1);
            const pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe('ALFKI');
        });

        it('should allow pinning added row.', () => {

            grid.addRow({ ID: 'Test', CompanyName: 'Test' });
            fix.detectChanges();

            grid.pinRow('Test');
            fix.detectChanges();
            expect(grid.pinnedRows.length).toBe(1);
            const pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe('Test');
        });

        it('should stop editing when edited row is pinned/unpinned.', () => {
            grid.getColumnByName('CompanyName').editable = true;
            fix.detectChanges();
            let cell = grid.getCellByColumn(0, 'CompanyName');
            let cellDomNumber = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
            cellDomNumber.triggerEventHandler('dblclick', {});
            fix.detectChanges();

            expect(cell.editMode).toBeTruthy();

            grid.pinRow(cell.row.key);
            fix.detectChanges();

            cell = grid.getCellByColumn(0, 'CompanyName');
            expect(cell.editMode).toBeFalsy();

            cellDomNumber = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
            cellDomNumber.triggerEventHandler('dblclick', {});
            fix.detectChanges();

            expect(cell.editMode).toBeTruthy();
            grid.unpinRow(cell.row.key);
            fix.detectChanges();
            cell = grid.getCellByColumn(0, 'CompanyName');
            expect(cell.editMode).toBeFalsy();
        });

    });

    describe('Row pinning with MRL', () => {
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(GridRowPinningWithMRLComponent);
            fix.detectChanges();
            grid = fix.componentInstance.instance;
            tick();
            fix.detectChanges();
        }));

        it('should pin/unpin correctly to top', () => {
            // pin
            grid.pinRow(fix.componentInstance.data[1]);
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(1);
            const pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[0].nativeElement).toBe(grid.gridAPI.get_row_by_index(0).nativeElement);

            expect(grid.gridAPI.get_row_by_index(0).pinned).toBeTruthy();
            const gridPinnedRow = grid.pinnedRows[0];
            const pinnedRowCells = gridPinnedRow.cells.toArray();
            // const headerCells = grid.headerGroups.first.children.toArray();
            const headerCells = grid.headerGroupsList[0].children.toArray();

            // headers are aligned to cells
            GridFunctions.verifyLayoutHeadersAreAligned(headerCells, pinnedRowCells);
            GridFunctions.verifyDOMMatchesLayoutSettings(gridPinnedRow, fix.componentInstance.colGroups);

            // unpin
            const row = grid.pinnedRows[0];
            row.pinned = false;
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(0);
            expect(row.pinned).toBeFalsy();

            const gridUnpinnedRow = grid.gridAPI.get_row_by_index(1);
            const unpinnedRowCells = gridUnpinnedRow.cells.toArray();

            GridFunctions.verifyLayoutHeadersAreAligned(headerCells, unpinnedRowCells);
            GridFunctions.verifyDOMMatchesLayoutSettings(gridUnpinnedRow, fix.componentInstance.colGroups);
        });

        it('should pin/unpin correctly to bottom', () => {

            fix.componentInstance.pinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Bottom };
            fix.detectChanges();

            // pin
            grid.pinRow(fix.componentInstance.data[1]);
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(1);
            const pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[0].nativeElement)
                .toBe(grid.gridAPI.get_row_by_index(fix.componentInstance.data.length).nativeElement);

            expect(grid.gridAPI.get_row_by_index(fix.componentInstance.data.length).pinned).toBeTruthy();
            const gridPinnedRow = grid.pinnedRows[0];
            const pinnedRowCells = gridPinnedRow.cells.toArray();
            // const headerCells = grid.headerGroups.first.children.toArray();
            const headerCells = grid.headerGroupsList[0].children.toArray();

            // headers are aligned to cells
            GridFunctions.verifyLayoutHeadersAreAligned(headerCells, pinnedRowCells);
            GridFunctions.verifyDOMMatchesLayoutSettings(gridPinnedRow, fix.componentInstance.colGroups);

            // unpin
            const row = grid.pinnedRows[0];
            row.pinned = false;
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(0);
            expect(row.pinned).toBeFalsy();

            const gridUnpinnedRow = grid.gridAPI.get_row_by_index(1);
            const unpinnedRowCells = gridUnpinnedRow.cells.toArray();

            GridFunctions.verifyLayoutHeadersAreAligned(headerCells, unpinnedRowCells);
            GridFunctions.verifyDOMMatchesLayoutSettings(gridUnpinnedRow, fix.componentInstance.colGroups);
        });

        it('should test getRowByIndex API members.', () => {
            fix.componentInstance.pinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Bottom };
            fix.detectChanges();

            // pin 1st
            grid.pinRow(fix.componentInstance.data[0]);
            fix.detectChanges();
            const firstRow = grid.getRowByIndex(0);
            // Check if the row is pinned to the bottom through the Row pinned API
            expect(firstRow.pinned).toBe(true);

            // Toggle pin state with row API
            firstRow.pinned = false;
            expect(firstRow.pinned).toBe(false);
            fix.detectChanges();
            firstRow.pinned = true;
            expect(firstRow.pinned).toBe(true);
            fix.detectChanges();

            // Check dom existence
            expect(grid.pinnedRows.length).toBe(1);
            let pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer[0].children[0].nativeElement)
                .toBe(grid.gridAPI.get_row_by_index(fix.componentInstance.data.length).nativeElement);

            // Pin/Unpin with the methods
            firstRow.unpin();
            expect(firstRow.pinned).toBe(false);
            fix.detectChanges();
            firstRow.pin();
            expect(firstRow.pinned).toBe(true);
            fix.detectChanges();

            // Check again pinned row presence
            pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer[0].children[0].nativeElement)
                .toBe(grid.gridAPI.get_row_by_index(fix.componentInstance.data.length).nativeElement);

            // Check select
            firstRow.selected = true;
            fix.detectChanges();
            expect(firstRow.selected).toBe(true);

            // Check pinned row existence after the selection
            expect(pinRowContainer[0].children[0].nativeElement.offsetParent).toBeDefined();
            expect(pinRowContainer[0].children[0].nativeElement.offsetWidth).toBeGreaterThan(0);

            firstRow.selected = false;
            fix.detectChanges();
            expect(firstRow.selected).toBe(false);

            // Delete row
            firstRow.delete();
            fix.detectChanges();
            expect(grid.gridAPI.get_row_by_index(0).rowData.ID).toEqual('ANATR');
            // TO DO Check pinned row existence after the row deletion
            expect(pinRowContainer[0].children[0].nativeElement.offsetParent).toBeNull();
            expect(pinRowContainer[0].children[0].nativeElement.offsetWidth).toEqual(0);

            // Check API methods
            expect(firstRow.key).toBeTruthy();
            expect(firstRow.data).toBeTruthy();
            expect(firstRow.pinned).toBe(true);
        });
    });

    describe(' Hiding', () => {
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(GridRowPinningComponent);
            fix.detectChanges();
            grid = fix.componentInstance.instance;
            tick();
            fix.detectChanges();
        }));

        it('should hide columns in pinned and unpinned area', () => {
            // pin 2nd data row
            grid.pinRow(fix.componentInstance.data[1]);
            fix.detectChanges();
            const hiddenCol = grid.columns[1];
            hiddenCol.hidden = true;
            fix.detectChanges();

            const pinnedCells = grid.pinnedRows[0].cells;
            expect(pinnedCells.filter(cell => cell.column.field === hiddenCol.field).length).toBe(0);

            const unpinnedCells = grid.rowList.first.cells;
            expect(unpinnedCells.filter(cell => cell.column.field === hiddenCol.field).length).toBe(0);

            expect(pinnedCells.length).toBe(unpinnedCells.length);

            const headerCells = grid.headerCellList;
            expect(headerCells.filter(cell => cell.column.field === hiddenCol.field).length).toBe(0);

            expect(grid.pinnedRows.length).toBe(1);
            const pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[0].nativeElement).toBe(grid.gridAPI.get_row_by_index(0).nativeElement);

            expect(grid.gridAPI.get_row_by_index(0).rowID).toBe(fix.componentInstance.data[1]);
            expect(grid.gridAPI.get_row_by_index(1).rowID).toBe(fix.componentInstance.data[0]);
            expect(grid.gridAPI.get_row_by_index(2).rowID).toBe(fix.componentInstance.data[1]);
            expect(grid.gridAPI.get_row_by_index(3).rowID).toBe(fix.componentInstance.data[2]);

            fix.detectChanges();
            // 1 records pinned + 2px border
            expect(grid.pinnedRowHeight).toBe(grid.renderedRowHeight + 2);
            const expectedHeight = parseInt(grid.height, 10) - grid.pinnedRowHeight - 18 - grid.theadRow.nativeElement.offsetHeight;
            expect(grid.calcHeight - expectedHeight).toBeLessThanOrEqual(1);
        });

        it('should keep the scrollbar sizes correct when partially filtering out pinned records', () => {
            grid.gridAPI.get_row_by_index(1).pin();
            fix.detectChanges();
            grid.gridAPI.get_row_by_index(3).pin();
            fix.detectChanges();
            grid.gridAPI.get_row_by_index(5).pin();
            fix.detectChanges();
            grid.gridAPI.get_row_by_index(7).pin();
            fix.detectChanges();

            fix.detectChanges();
            // 4 records pinned + 2px border
            expect(grid.pinnedRowHeight).toBe(4 * grid.renderedRowHeight + 2);
            let expectedHeight = parseInt(grid.height, 10) - grid.pinnedRowHeight - 18 - grid.theadRow.nativeElement.offsetHeight;
            expect(grid.calcHeight - expectedHeight).toBeLessThanOrEqual(1);

            grid.filter('ContactTitle', 'Owner', IgxStringFilteringOperand.instance().condition('contains'), false);
            fix.detectChanges();

            // 2 records pinned + 2px border
            expect(grid.pinnedRowHeight).toBe(2 * grid.renderedRowHeight + 2);
            expectedHeight = parseInt(grid.height, 10) - grid.pinnedRowHeight - 18 - grid.theadRow.nativeElement.offsetHeight;
            expect(grid.calcHeight - expectedHeight).toBeLessThanOrEqual(1);
        });
    });

    describe(' Cell Editing', () => {

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(GridRowPinningComponent);
            fix.detectChanges();
            // enable cell editing for column
            grid = fix.componentInstance.instance;
            grid.getColumnByName('CompanyName').editable = true;
        }));

        it('should enter edit mode for the next editable cell when tabbing.', () => {
            const  gridContent = GridFunctions.getGridContent(fix);
            grid.gridAPI.get_row_by_index(0).pin();
            fix.detectChanges();
            grid.gridAPI.get_row_by_index(3).pin();
            fix.detectChanges();

            const firstEditable = grid.getCellByColumn(0, 'CompanyName');
            const secondEditable = grid.getCellByColumn(1, 'CompanyName');
            const thirdEditable = grid.getCellByColumn(3, 'CompanyName');
            const fourthEditable = grid.getCellByColumn(5, 'CompanyName');

            // enter edit mode for pinned row
            UIInteractions.simulateDoubleClickAndSelectEvent(firstEditable);
            fix.detectChanges();

            expect(firstEditable.editMode).toBeTruthy();

            // press tab on edited cell
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fix.detectChanges();

            expect(firstEditable.editMode).toBeFalsy();
            expect(secondEditable.editMode).toBeTruthy();

            // press tab on edited cell
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fix.detectChanges();

            expect(secondEditable.editMode).toBeFalsy();
            expect(thirdEditable.editMode).toBeTruthy();

            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fix.detectChanges();

            expect(thirdEditable.editMode).toBeFalsy();
            expect(fourthEditable.editMode).toBeTruthy();
        });
        it('should enter edit mode for the previous editable cell when shift+tabbing.', () => {
            const  gridContent = GridFunctions.getGridContent(fix);
            grid.gridAPI.get_row_by_index(0).pin();
            fix.detectChanges();
            grid.gridAPI.get_row_by_index(3).pin();
            fix.detectChanges();

            const firstEditable = grid.getCellByColumn(0, 'CompanyName');
            const secondEditable = grid.getCellByColumn(1, 'CompanyName');
            const thirdEditable = grid.getCellByColumn(3, 'CompanyName');
            const fourthEditable = grid.getCellByColumn(5, 'CompanyName');

            // enter edit mode for unpinned row
            UIInteractions.simulateDoubleClickAndSelectEvent(fourthEditable);
            fix.detectChanges();

            expect(fourthEditable.editMode).toBeTruthy();
            // press shift+tab on edited cell
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent, false, true);
            fix.detectChanges();

            expect(fourthEditable.editMode).toBeFalsy();
            expect(thirdEditable.editMode).toBeTruthy();

            // press shift+tab on edited cell
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent, false, true);
            fix.detectChanges();

            expect(thirdEditable.editMode).toBeFalsy();
            expect(secondEditable.editMode).toBeTruthy();

            // press shift+tab on edited cell
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent, false, true);
            fix.detectChanges();

            expect(secondEditable.editMode).toBeFalsy();
            expect(firstEditable.editMode).toBeTruthy();
        });
    });

    describe(' Navigation', () => {
        let gridContent: DebugElement;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(GridRowPinningComponent);
            fix.detectChanges();
            grid = fix.componentInstance.instance;
            setupGridScrollDetection(fix, grid);
            gridContent = GridFunctions.getGridContent(fix);
        }));

        it('should navigate to bottom from top pinned row using Ctrl+ArrowDown', async () => {
            grid.gridAPI.get_row_by_index(5).pin();
            fix.detectChanges();

            const firstRowCell = grid.gridAPI.get_row_by_index(0).cells.toArray()[1];
            UIInteractions.simulateClickAndSelectEvent(firstRowCell);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent, false, false, true);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            const lastRowCell =  grid.gridAPI.get_row_by_index(27).cells.toArray()[1];
            const selectedCell = fix.componentInstance.instance.selectedCells[0];
            expect(selectedCell).toBe(lastRowCell);
            expect(selectedCell.rowIndex).toBe(27);
        });

        it('should navigate and scroll to first unpinned row from top pinned row using ArrowDown', async () => {
            grid.gridAPI.get_row_by_index(5).pin();
            fix.detectChanges();

            grid.navigateTo(10);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            const firstRowCell = grid.gridAPI.get_row_by_index(0).cells.toArray()[1];
            UIInteractions.simulateClickAndSelectEvent(firstRowCell);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            const secondRowCell =  grid.gridAPI.get_row_by_index(1).cells.toArray()[1];
            const selectedCell = fix.componentInstance.instance.selectedCells[0];
            expect(selectedCell).toBe(secondRowCell);
            expect(selectedCell.rowIndex).toBe(1);
        });

        it('should navigate to top pinned row from bottom unpinned row without scrolling using Ctrl+ArrowUp', async () => {
            grid.gridAPI.get_row_by_index(5).pin();
            fix.detectChanges();

            grid.navigateTo(27);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            expect(grid.verticalScrollContainer.getScroll().scrollTop).not.toEqual(0);

            const lastRowCell = grid.gridAPI.get_row_by_index(27).cells.toArray()[1];
            UIInteractions.simulateClickAndSelectEvent(lastRowCell);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent, false, false, true);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            const firstRowCell =  grid.gridAPI.get_row_by_index(0).cells.toArray()[1];
            const selectedCell = fix.componentInstance.instance.selectedCells[0];
            expect(selectedCell).toBe(firstRowCell);
            expect(selectedCell.rowIndex).toBe(0);
            expect(grid.verticalScrollContainer.getScroll().scrollTop).not.toEqual(0);
        });

        it('should navigate to top pinned row from first unpinned row using ArrowUp', async () => {
            grid.gridAPI.get_row_by_index(5).pin();
            grid.gridAPI.get_row_by_index(1).pin();
            fix.detectChanges();

            const thirdRowCell = grid.gridAPI.get_row_by_index(2).cells.toArray()[1];
            UIInteractions.simulateClickAndSelectEvent(thirdRowCell);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            expect(grid.navigation.activeNode.row).toBe(2);
            expect(grid.navigation.activeNode.column).toBe(1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            const secondRowCell =  grid.gridAPI.get_row_by_index(1).cells.toArray()[1];
            const selectedCell = fix.componentInstance.instance.selectedCells[0];
            expect(selectedCell).toBe(secondRowCell);
            expect(selectedCell.rowIndex).toBe(1);
        });

        it('should navigate and scroll to top from bottom pinned row using Ctrl+ArrowUp', async () => {
            fix.componentInstance.pinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Bottom };
            grid.gridAPI.get_row_by_index(5).pin();
            fix.detectChanges();

            grid.navigateTo(26);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            const lastRowCell = grid.gridAPI.get_row_by_index(27).cells.toArray()[1];
            UIInteractions.simulateClickAndSelectEvent(lastRowCell);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            expect(grid.navigation.activeNode.row).toBe(27);
            expect(grid.navigation.activeNode.column).toBe(1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent, false, false, true);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            const firstRowCell =  grid.gridAPI.get_row_by_index(0).cells.toArray()[1];
            const selectedCell = fix.componentInstance.instance.selectedCells[0];
            expect(selectedCell).toBe(firstRowCell);
            expect(selectedCell.rowIndex).toBe(0);
        });

        it('should navigate to last unpinned row from bottom pinned row using ArrowUp', async () => {
            fix.componentInstance.pinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Bottom };
            grid.gridAPI.get_row_by_index(5).pin();
            fix.detectChanges();

            const firstRowCell = grid.gridAPI.get_row_by_index(27).cells.toArray()[1];
            UIInteractions.simulateClickAndSelectEvent(firstRowCell);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            const lastUnpinnedRowCell =  grid.gridAPI.get_row_by_index(26).cells.toArray()[1];
            const selectedCell = fix.componentInstance.instance.selectedCells[0];
            expect(selectedCell).toBe(lastUnpinnedRowCell);
            expect(selectedCell.rowIndex).toBe(26);
        });

        it('should navigate to bottom pinned row from top unpinned row without scrolling using Ctrl+ArrowDown', async () => {
            fix.componentInstance.pinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Bottom };
            grid.gridAPI.get_row_by_index(5).pin();
            fix.detectChanges();

            expect(grid.verticalScrollContainer.getScroll().scrollTop).toEqual(0);

            const firstRowCell = grid.gridAPI.get_row_by_index(0).cells.toArray()[1];
            UIInteractions.simulateClickAndSelectEvent(firstRowCell);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent, false, false, true);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            const lastRowCell =  grid.gridAPI.get_row_by_index(27).cells.toArray()[1];
            const selectedCell = fix.componentInstance.instance.selectedCells[0];
            expect(selectedCell).toBe(lastRowCell);
            expect(selectedCell.rowIndex).toBe(27);
            expect(grid.verticalScrollContainer.getScroll().scrollTop).toEqual(0);
        });

        it('should navigate to bottom pinned row from last unpinned row using ArrowDown', async () => {
            fix.componentInstance.pinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Bottom };
            grid.gridAPI.get_row_by_index(5).pin();
            grid.gridAPI.get_row_by_index(1).pin();
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            grid.navigateTo(26);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            const firstRowCell = grid.gridAPI.get_row_by_index(26).cells.toArray()[1];
            UIInteractions.simulateClickAndSelectEvent(firstRowCell);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            expect(grid.navigation.activeNode.row).toBe(26);
            expect(grid.navigation.activeNode.column).toBe(1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            const lastRowCell =  grid.gridAPI.get_row_by_index(27).cells.toArray()[1];
            const selectedCell = fix.componentInstance.instance.selectedCells[0];
            expect(selectedCell).toBe(lastRowCell);
            expect(selectedCell.rowIndex).toBe(27);
        });

        it('should navigate down from pinned to unpinned row when there are filtered out pinned rows', async () => {
            grid.gridAPI.get_row_by_index(5).pin();
            grid.gridAPI.get_row_by_index(1).pin();
            fix.detectChanges();

            grid.filter('ID', 'B', IgxStringFilteringOperand.instance().condition('contains'), false);
            fix.detectChanges();

            const firstRowCell = grid.gridAPI.get_row_by_index(0).cells.toArray()[1];
            UIInteractions.simulateClickAndSelectEvent(firstRowCell);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent);
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            const lastRowCell =  grid.gridAPI.get_row_by_index(1).cells.toArray()[1];
            const selectedCell = fix.componentInstance.instance.selectedCells[0];
            expect(selectedCell).toBe(lastRowCell);
            expect(selectedCell.rowIndex).toBe(1);
        });
    });

    describe(' Initial pinning', () => {
        let gridContent: DebugElement;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(GridRowPinningWithInitialPinningComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid1;
            setupGridScrollDetection(fix, grid);
            gridContent = GridFunctions.getGridContent(fix);
        }));

        it('should pin rows on OnInit.', () => {
            fix.detectChanges();
            expect(grid.hasPinnedRecords).toBeTrue();
        });
    });
});

@Component({
    template: `
        <igx-grid
            [allowFiltering]="true"
            [pinning]='pinningConfig'
            [width]='"800px"'
            [height]='"500px"'
            [data]="data"
            [autoGenerate]="true">
            <igx-paginator *ngIf="paging"></igx-paginator>
        </igx-grid>
    `
})
export class GridRowPinningComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;
    public paging = false;

    public data: any[] = SampleTestData.contactInfoDataFull();
    public pinningConfig: IPinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Top };

    public createSimpleData(count: number) {
        this.data = Array(count).fill({}).map((x, idx) => x = { idx: idx + 1 });
    }
}

@Component({
    template: `
    <igx-grid [data]="data" height="500px" [pinning]='pinningConfig' [rowSelection]="'single'"
        [rowEditable]="true">
        <igx-column-layout *ngFor='let group of colGroups'>
            <igx-column *ngFor='let col of group.columns'
            [rowStart]="col.rowStart" [colStart]="col.colStart" [width]='col.width'
            [colEnd]="col.colEnd" [rowEnd]="col.rowEnd" [field]='col.field'></igx-column>
        </igx-column-layout>
    </igx-grid>
    `
})
export class GridRowPinningWithMRLComponent extends GridRowPinningComponent {
    public cols: Array<any> = [
        { field: 'ID', rowStart: 1, colStart: 1 },
        { field: 'CompanyName', rowStart: 1, colStart: 2 },
        { field: 'ContactName', rowStart: 1, colStart: 3 },
        { field: 'ContactTitle', rowStart: 2, colStart: 1, rowEnd: 4, colEnd: 4 },
    ];
    public colGroups = [
        {
            group: 'group1',
            columns: this.cols
        }
    ];
}

@Component({
    template: `
    <igx-grid
        [pinning]='pinningConfig'
        [width]='"800px"'
        [height]='"500px"'
        [data]="data"
        [autoGenerate]="true">
        <ng-template igxGridDetail let-dataItem>
            <div>
                <div><span class='categoryStyle'>Country:</span> {{dataItem.Country}}</div>
                <div><span class='categoryStyle'>City:</span> {{dataItem.City}}</div>
                <div><span class='categoryStyle'>Address:</span> {{dataItem.Address}}</div>
            </div>
        </ng-template>
</igx-grid>`
})
export class GridRowPinningWithMDVComponent extends GridRowPinningComponent { }


@Component({
    template: `
        <igx-grid
            [pinning]='pinningConfig'
            primaryKey='ID'
            [width]='"800px"'
            [height]='"500px"'
            [data]="data"
            [autoGenerate]="true">
        </igx-grid>
    `,
    providers: [{ provide: IgxGridTransaction, useClass: IgxTransactionService }]
})
export class GridRowPinningWithTransactionsComponent extends GridRowPinningComponent { }

@Component({
    template: `
        <igx-grid
            #grid1
            [allowFiltering]="true"
            [pinning]='pinningConfig'
            [width]='"800px"'
            [height]='"500px"'
            [data]="data"
            [autoGenerate]="true">
        </igx-grid>
    `
})
export class GridRowPinningWithInitialPinningComponent implements OnInit {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid1: IgxGridComponent;

    public data: any[] = SampleTestData.contactInfoDataFull();
    public pinningConfig: IPinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Top };
    public ngOnInit(): void {
        this.grid1.pinRow(this.data[0].ID);
    }
}
