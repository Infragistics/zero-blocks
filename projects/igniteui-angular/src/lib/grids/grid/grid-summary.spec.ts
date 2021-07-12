import { Component, DebugElement, ViewChild } from '@angular/core';
import { fakeAsync, TestBed, tick, ComponentFixture, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    IgxDateSummaryOperand,
    IgxGridModule,
    IgxNumberSummaryOperand,
    IgxSummaryOperand,
    IgxSummaryResult,
    IgxGroupByRow,
    IgxSummaryRow,
    IgxGridRow
} from './public_api';
import { IgxGridComponent } from './grid.component';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { GridFunctions, GridSummaryFunctions } from '../../test-utils/grid-functions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import {
    ProductsComponent,
    SummaryColumnComponent,
    FilteringComponent,
    SummariesGroupByComponent,
    SummariesGroupByTransactionsComponent
} from '../../test-utils/grid-samples.spec';
import { setupGridScrollDetection } from '../../test-utils/helper-utils.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { GridSummaryCalculationMode } from '../common/enums';
import { IgxNumberFilteringOperand, IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { DropPosition } from '../moving/moving.service';
import { DatePipe } from '@angular/common';
import { IgxGridGroupByRowComponent } from './groupby-row.component';

describe('IgxGrid - Summaries #grid', () => {

    const SUMMARY_CLASS = '.igx-grid-summary';
    const ITEM_CLASS = 'igx-grid-summary__item';
    const SUMMARY_ROW = 'igx-grid-summary-row';
    const SUMMARY_CELL = 'igx-grid-summary-cell';
    const EMPTY_SUMMARY_CLASS = 'igx-grid-summary--empty';
    const DEBOUNCETIME = 30;

    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                ProductsComponent,
                SummaryColumnComponent,
                CustomSummariesComponent,
                FilteringComponent,
                SummariesGroupByComponent,
                SummariesGroupByTransactionsComponent
            ],
            imports: [IgxGridModule, NoopAnimationsModule]
        });
    }));

    describe('Base tests: ', () => {
        describe('in grid with no summaries defined: ', () => {
            let fixture: ComponentFixture<ProductsComponent>;
            let grid: IgxGridComponent;
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(ProductsComponent);
                fixture.detectChanges();
                grid = fixture.componentInstance.grid;
            }));

            it('should not have summary if no summary is active ', () => {
                expect(fixture.debugElement.query(By.css(SUMMARY_CLASS))).toBeNull();
            });

            it('should enableSummaries through grid API ', () => {
                expect(grid.hasSummarizedColumns).toBe(false);
                let tFoot = GridFunctions.getGridFooterWrapper(fixture).nativeElement.getBoundingClientRect().height;
                expect(tFoot < grid.defaultSummaryHeight).toBe(true);

                grid.enableSummaries([{ fieldName: 'ProductName' }, { fieldName: 'ProductID' }]);
                fixture.detectChanges();

                const summaryRow = GridSummaryFunctions.getRootSummaryRow(fixture);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, ['Count'], ['10']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['10']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, [], []);

                expect(grid.getColumnByName('ProductID').hasSummary).toBe(true);
                expect(grid.getColumnByName('ProductName').hasSummary).toBe(true);
                expect(grid.getColumnByName('OrderDate').hasSummary).toBe(false);

                tFoot = GridFunctions.getGridFooterWrapper(fixture).nativeElement.getBoundingClientRect().height;
                expect(tFoot).toEqual(grid.defaultSummaryHeight);
            });

            it(`should recalculate grid sizes correctly when the column is outside of the viewport`, () => {
                grid.width = '300px';
                fixture.detectChanges();

                grid.getColumnByName('UnitsInStock').hasSummary = true;
                fixture.detectChanges();

                const tFoot = GridFunctions.getGridFooterWrapper(fixture).nativeElement.getBoundingClientRect().height;
                expect(tFoot).toEqual(5 * grid.defaultSummaryHeight);
                expect(GridSummaryFunctions.getRootSummaryRow(fixture)).toBeDefined();
            });


            it(`Should update summary section when the column is outside of the
        viewport and have identical width with others`, (async () => {
                grid.getColumnByName('UnitsInStock').hasSummary = true;
                grid.width = '300px';
                await wait(100);
                fixture.detectChanges();

                grid.addRow({
                    ProductID: 11, ProductName: 'Belgian Chocolate', InStock: true, UnitsInStock: 99000, OrderDate: new Date('2018-03-01')
                });
                await wait(30);
                fixture.detectChanges();
                grid.dataRowList.first.virtDirRow.scrollTo(3);
                await wait(30);
                fixture.detectChanges();

                const summaryRow = GridSummaryFunctions.getRootSummaryRow(fixture);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'],
                    ['11', '0', '99,000', '138,004', '12,545.818']);
            }));

            it('When we have data which is undefined and enable summary per defined column, error should not be thrown', () => {
                const idColumn = grid.getColumnByName('ProductID');
                expect(grid.data.length > 0).toEqual(true);

                fixture.componentInstance.data = undefined;
                fixture.detectChanges();

                expect(grid.data).toEqual([]);
                expect(() => {
                    grid.enableSummaries(idColumn.field);
                    fixture.detectChanges();
                }).not.toThrow();
            });
        });

        describe('custom summaries: ', () => {
            let fixture: ComponentFixture<CustomSummariesComponent>;
            let grid: IgxGridComponent;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(CustomSummariesComponent);
                fixture.detectChanges();
                grid = fixture.componentInstance.grid1;
            }));

            it('should properly render custom summaries', () => {
                const summaryRow = GridSummaryFunctions.getRootSummaryRow(fixture);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['10', '39,004', '3,900.4']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Earliest'], ['5/17/1990']);

                grid.filter('UnitsInStock', '0', IgxNumberFilteringOperand.instance().condition('lessThan'), true);
                fixture.detectChanges();

                const filterResult = grid.rowList.length;
                expect(filterResult).toEqual(0);

                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['0', '0', '0']);
            });

            it('should properly calculate all data custom summaries height', () => {
                grid.getColumnByName('UnitsInStock').summaries = fixture.componentInstance.allDataAvgSummary;
                grid.getColumnByName('OrderDate').summaries = fixture.componentInstance.allDataAvgSummary;
                fixture.detectChanges();

                const summaryRow = GridSummaryFunctions.getRootSummaryRow(fixture);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Test 1', 'Test 2'], ['10', '50', '150']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count', 'Test 3'], ['10', '850']);

                const tFootHeight = GridFunctions.getGridFooterWrapper(fixture).nativeElement.getBoundingClientRect().height;
                expect(tFootHeight).toBeGreaterThanOrEqual(3 * grid.defaultSummaryHeight);
            });

            it('should change custom summaries at runtime', () => {
                const summaryRow = GridSummaryFunctions.getRootSummaryRow(fixture);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['10', '39,004', '3,900.4']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Earliest'], ['5/17/1990']);
                GridSummaryFunctions.verifyVisibleSummariesHeight(fixture, 3, grid.defaultSummaryHeight);
                grid.getColumnByName('UnitsInStock').summaries = fixture.componentInstance.dealsSummaryMinMax;
                fixture.detectChanges();
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['0', '20,000']);
                GridSummaryFunctions.verifyVisibleSummariesHeight(fixture, 2, grid.defaultSummaryHeight);
            });

            it('should be able to access alldata from each summary', () => {
                const summaryRow = GridSummaryFunctions.getRootSummaryRow(fixture);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['10', '39,004', '3,900.4']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Earliest'], ['5/17/1990']);
                GridSummaryFunctions.verifyVisibleSummariesHeight(fixture, 3, grid.defaultSummaryHeight);
                grid.getColumnByName('UnitsInStock').summaries = fixture.componentInstance.inStockSummary;
                fixture.detectChanges();

                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg', 'Items InStock'],
                    ['10', '0', '20000', '39004', '3900.4', '6']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Earliest'], ['5/17/1990']);

                grid.getCellByColumn(4, 'InStock').update(true);
                fixture.detectChanges();

                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg', 'Items InStock'],
                    ['10', '0', '20000', '39004', '3900.4', '7']);

                grid.filter('UnitsInStock', 0, IgxNumberFilteringOperand.instance().condition('equals'));
                fixture.detectChanges();

                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg', 'Items InStock'],
                    ['3', '0', '0', '0', '0', '1']);
            });

            it('Last column summary cell should be aligned according to its data cells', fakeAsync(/** height/width setter rAF */() => {
                grid.columns.forEach(c => {
                    c.width = '150px';
                });
                grid.getColumnByName('UnitsInStock').hasSummary = true;
                grid.width = '900px';
                grid.height = '500px';
                fixture.detectChanges();
                tick(DEBOUNCETIME);

                // Get last cell of first data row
                const lastColumnNormalCell =  GridFunctions.getRowCells(fixture, 0)[4];
                const lastColumnNormalCellRect = lastColumnNormalCell.nativeElement.getBoundingClientRect();

                // Get last summary cell of the summary row
                const summaryRow = GridSummaryFunctions.getRootSummaryRow(fixture);
                const lastColumnSummaryCell = GridSummaryFunctions.getSummaryCellByVisibleIndex(summaryRow, 4);
                const lastColumnSummaryCellRect = lastColumnSummaryCell.nativeElement.getBoundingClientRect();

                expect(lastColumnSummaryCellRect.left).toBe(lastColumnNormalCellRect.left,
                    'summary cell and data cell are not left aligned');
                expect(lastColumnSummaryCellRect.right).toBe(lastColumnNormalCellRect.right,
                    'summary cell and data cell are not right aligned');
            }));
        });

        describe('specific data: ', () => {
            let fixture: ComponentFixture<FilteringComponent>;
            let grid: IgxGridComponent;
            beforeEach(fakeAsync(/** height/width setter rAF */() => {
                fixture = TestBed.createComponent(FilteringComponent);
                fixture.detectChanges();
                grid = fixture.componentInstance.grid;
            }));

            it('should have correct summaries when there are null and undefined values', () => {
                grid.getColumnByName('ProductName').hasSummary = true;
                grid.getColumnByName('Downloads').hasSummary = true;
                grid.getColumnByName('Released').hasSummary = true;
                grid.getColumnByName('ReleaseDate').hasSummary = true;
                fixture.detectChanges();

                const summaryRow = fixture.debugElement.query(By.css(SUMMARY_ROW));
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['8']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['8', '1', '1,000', '2,204', '275.5']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count'], ['8']);
                const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
                const earliest = SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', -1).toLocaleString('us', options);
                const latest = SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', 1).toLocaleString('us', options);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count', 'Earliest', 'Latest'], ['8', earliest, latest]);
            });
        });

        describe('', () => {
            let fix;
            let grid: IgxGridComponent;
            beforeEach(fakeAsync(/** height/width setter rAF */() => {
                fix = TestBed.createComponent(SummaryColumnComponent);
                fix.detectChanges();
                grid = fix.componentInstance.grid;
            }));

            it('should disableSummaries through grid API ', () => {
                const summariedColumns = [];
                grid.columnList.forEach((col) => {
                    if (col.hasSummary) {
                        summariedColumns.push(col.field);
                    }
                });
                grid.disableSummaries(summariedColumns);
                fix.detectChanges();

                expect(GridSummaryFunctions.getRootSummaryRow(fix)).toBeNull();
                expect(grid.hasSummarizedColumns).toBe(false);
            });

            it('should change summary operand through grid API ', () => {
                grid.enableSummaries([{ fieldName: 'UnitsInStock', customSummary: fix.componentInstance.dealsSummaryMinMax }]);
                fix.detectChanges();

                const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['0', '20,000']);
                GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 3, grid.defaultSummaryHeight);
            });

            it('should have summary per each column that \'hasSummary\'= true', () => {
                const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count', 'Earliest', 'Latest'], []);
            });

            it('should have count summary for string and boolean data types', () => {
                const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
                grid.columnList.forEach((col) => {
                    if (col.hasSummary && (col.dataType === 'string' || col.dataType === 'boolean')) {
                        GridSummaryFunctions.verifyColumnSummaries(summaryRow, col.visibleIndex, ['Count'], []);
                    }
                });
            });

            it('should have count, min, max, avg and sum summary for numeric data types', () => {
                const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
                grid.columnList.forEach((col) => {
                    if (col.hasSummary && (col.dataType === 'number')) {
                        GridSummaryFunctions.verifyColumnSummaries(summaryRow, col.visibleIndex, ['Count', 'Min', 'Max', 'Sum', 'Avg'], []);
                    }
                });
            });

            it('should have count, earliest and latest summary for \'date\' data types', () => {
                const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
                grid.columnList.forEach((col) => {
                    if (col.hasSummary && (col.dataType === 'date')) {
                        GridSummaryFunctions.verifyColumnSummaries(summaryRow, col.visibleIndex, ['Count', 'Earliest', 'Latest'], []);
                    }
                });
            });

            it('should summary function stay active when is clicked on it\'s label', () => {
                const summary = fix.debugElement.queryAll(By.css(SUMMARY_CELL))[3];
                const min: DebugElement = summary.query(By.css('[title=\'Min\']'));

                expect(min.parent.nativeElement.classList.contains(ITEM_CLASS)).toBeTruthy();
                min.triggerEventHandler('click', null);
                fix.detectChanges();

                expect(min.parent.nativeElement.classList.contains(ITEM_CLASS)).toBeTruthy();
                expect(summary.query(By.css('[title=\'Count\']')).parent.nativeElement.classList.contains(ITEM_CLASS)).toBeTruthy();
                expect(summary.query(By.css('[title=\'Max\']')).parent.nativeElement.classList.contains(ITEM_CLASS)).toBeTruthy();
                expect(summary.query(By.css('[title=\'Sum\']')).parent.nativeElement.classList.contains(ITEM_CLASS)).toBeTruthy();
                expect(summary.query(By.css('[title=\'Avg\']')).parent.nativeElement.classList.contains(ITEM_CLASS)).toBeTruthy();
            });

            it('should calculate summaries for \'number\' dataType or return if no data is provided', () => {
                const summaryClass = fix.componentInstance.numberSummary;

                const summaries = summaryClass.operate(fix.componentInstance.data.map((x) => x['UnitsInStock']));
                expect(summaries[0].summaryResult).toBe(10);
                expect(summaries[1].summaryResult).toBe(0);
                expect(summaries[2].summaryResult).toBe(20000);
                expect(summaries[3].summaryResult).toBe(39004);
                expect(summaries[4].summaryResult).toBe(3900.4);

                const emptySummaries = summaryClass.operate();
                expect(emptySummaries[0].summaryResult).toBe(0);
                expect(typeof emptySummaries[1].summaryResult).not.toEqual(undefined);
                expect(typeof emptySummaries[2].summaryResult).not.toEqual(undefined);
                expect(typeof emptySummaries[3].summaryResult).not.toEqual(undefined);
                expect(typeof emptySummaries[4].summaryResult).not.toEqual(undefined);

                expect(typeof emptySummaries[1].summaryResult).not.toEqual(null);
                expect(typeof emptySummaries[2].summaryResult).not.toEqual(null);
                expect(typeof emptySummaries[3].summaryResult).not.toEqual(null);
                expect(typeof emptySummaries[4].summaryResult).not.toEqual(null);

                expect(emptySummaries[1].summaryResult === 0).toBeTruthy();
                expect(emptySummaries[2].summaryResult === 0).toBeTruthy();
                expect(emptySummaries[3].summaryResult === 0).toBeTruthy();
                expect(emptySummaries[4].summaryResult === 0).toBeTruthy();
            });


            it('should calculate summaries for \'date\' dataType or return if no data is provided', () => {
                const summaryClass = fix.componentInstance.dateSummary;
                const pipe = new DatePipe('en-US');

                const summaries = summaryClass.operate(fix.componentInstance.data.map((x) => x['OrderDate']));
                expect(summaries[0].summaryResult).toBe(10);
                expect(pipe.transform(summaries[1].summaryResult, 'mediumDate')).toBe('May 17, 1990');
                expect(pipe.transform(summaries[2].summaryResult, 'mediumDate')).toBe('Dec 25, 2025');

                const emptySummaries = summaryClass.operate([]);
                expect(emptySummaries[0].summaryResult).toBe(0);
                expect(emptySummaries[1].summaryResult).toBe(undefined);
                expect(emptySummaries[2].summaryResult).toBe(undefined);
            });

            it('should display summaries for \'date\' dataType based on column formatter', () => {
                const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
                const pipe = new DatePipe('fr-FR');

                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                    ['Count', 'Earliest', 'Latest'], ['10', 'May 17, 1990', 'Dec 25, 2025']);

                grid.getColumnByName('OrderDate').summaryFormatter
                    = ((summaryResult: IgxSummaryResult, summaryOperand: IgxSummaryOperand) => {
                    const result = summaryResult.summaryResult;
                    if(summaryOperand instanceof IgxDateSummaryOperand
                        && summaryResult.key !== 'count' && result !== null && result !== undefined) {
                        return pipe.transform(result,'mediumDate');
                    }
                    return result;
                });
                fix.detectChanges();

                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                    ['Count', 'Earliest', 'Latest'], ['10', '17 mai 1990', '25 déc. 2025']);
            });

            it('should calc tfoot height according number of summary functions', () => {
                const summaries = fix.debugElement.queryAll(By.css(SUMMARY_CELL));
                const footerRow = GridSummaryFunctions.getRootSummaryRow(fix).nativeElement.getBoundingClientRect().height;
                const tfootSize = +footerRow;

                const expectedHeight = GridSummaryFunctions.calcMaxSummaryHeight(grid.columnList, summaries, grid.defaultSummaryHeight);

                expect(tfootSize).toBe(expectedHeight);
            });

            it('should be able to change \'hasSummary\' property runtime and to recalculate grid sizes correctly', fakeAsync(() => {
                grid.columnList.forEach((col) => {
                    if (col.field !== 'ProductID') {
                        expect(grid.getColumnByName(col.field).hasSummary).toBe(true);
                    }
                });
                grid.getColumnByName('UnitsInStock').hasSummary = false;
                tick(100);
                fix.detectChanges();

                expect(grid.getColumnByName('UnitsInStock').hasSummary).toBe(false);

                const summaries = fix.debugElement.queryAll(By.css(SUMMARY_CELL)).filter((el) =>
                    el.nativeElement.classList.contains(EMPTY_SUMMARY_CLASS) === false);
                const tfootSize = GridSummaryFunctions.getRootSummaryRow(fix).nativeElement.getBoundingClientRect().height;
                const expectedHeight = GridSummaryFunctions.calcMaxSummaryHeight(grid.columnList, summaries, grid.defaultSummaryHeight);
                expect(tfootSize).toBe(expectedHeight);

                grid.getColumnByName('ProductName').hasSummary = false;
                grid.getColumnByName('InStock').hasSummary = false;
                grid.getColumnByName('OrderDate').hasSummary = false;
                fix.detectChanges();
                tick(100);
                expect(GridSummaryFunctions.getRootSummaryRow(fix)).toBeNull();
                expect(grid.hasSummarizedColumns).toBe(false);
            }));

            it('should render correct data after hiding one bigger and then one smaller summary when scrolled to the bottom', (async () => {
                grid.data = SampleTestData.foodProductData();
                grid.width = '800px';
                grid.height = '600px';
                grid.allowFiltering = false;
                fix.detectChanges();
                await wait(100);

                let rowsRendered;
                let tbody;
                let expectedRowLenght;
                let firstCellsText;

                GridFunctions.scrollTop(grid, 10000);
                fix.detectChanges();
                await wait(100);
                fix.detectChanges();

                rowsRendered = GridFunctions.getRows(fix);
                tbody = GridFunctions.getGridDisplayContainer(fix).nativeElement.getBoundingClientRect().height;
                expectedRowLenght = Math.round(parseFloat(tbody) / grid.defaultRowHeight);
                expect(rowsRendered.length).toEqual(expectedRowLenght);

                grid.disableSummaries(['ProductName', 'InStock', 'UnitsInStock']);
                fix.detectChanges();
                await wait(100);
                fix.detectChanges();

                rowsRendered = GridFunctions.getRows(fix);
                tbody = GridFunctions.getGridDisplayContainer(fix).nativeElement.getBoundingClientRect().height;
                expectedRowLenght = Math.ceil(parseFloat(tbody) / grid.defaultRowHeight) - 1;

                firstCellsText = rowsRendered.map((item) => {
                    const cell = GridFunctions.getRowCells(fix, 0, item)[0];
                    if (cell) {
                        return GridFunctions.getValueFromCellElement(cell);
                    }
                });
                expect(rowsRendered.length).toEqual(expectedRowLenght);
                let expectedFirstCellNum = grid.data.length - expectedRowLenght + 1;

                for (let i = 0; i < rowsRendered.length - 1; i++) {
                    expect(firstCellsText[i]).toEqual((expectedFirstCellNum + i).toString());
                }

                grid.disableSummaries(['OrderDate']);
                fix.detectChanges();
                await wait(100);
                fix.detectChanges();

                rowsRendered = GridFunctions.getRows(fix);
                tbody = GridFunctions.getGridDisplayContainer(fix).nativeElement.getBoundingClientRect().height;
                expectedRowLenght = Math.ceil(parseFloat(tbody) / grid.defaultRowHeight) - 1;

                firstCellsText = rowsRendered.map((item) => {
                    const cell = GridFunctions.getRowCells(fix, 0, item)[0];
                    if (cell) {
                        return GridFunctions.getValueFromCellElement(cell);
                    }
                });
                expect(rowsRendered.length).toEqual(expectedRowLenght);
                expectedFirstCellNum = grid.data.length - expectedRowLenght + 1;
                for (let i = 0; i < rowsRendered.length - 1; i++) {
                    expect(firstCellsText[i]).toEqual((expectedFirstCellNum + i).toString());
                }
            }));
        });
    });

    describe('Integration Scenarios: ', () => {
        describe('', () => {
            let fix;
            let grid: IgxGridComponent;
            beforeEach(fakeAsync(() => {
                fix = TestBed.createComponent(SummaryColumnComponent);
                fix.detectChanges();
                grid = fix.componentInstance.grid;
            }));

            it('Filtering: should calculate summaries only over filteredData', fakeAsync(() => {
                grid.filter('UnitsInStock', 0, IgxNumberFilteringOperand.instance().condition('equals'), true);
                fix.detectChanges();

                let filterResult = grid.rowList.length;
                expect(filterResult).toEqual(3);

                let summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['3']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['3', '0', '0', '0', '0']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                    ['Count', 'Earliest', 'Latest'], ['3', 'Jul 27, 2001', 'Oct 11, 2007']);

                grid.filter('ProductID', 0, IgxNumberFilteringOperand.instance().condition('equals'), true);
                fix.detectChanges();

                filterResult = grid.rowList.length;
                expect(filterResult).toEqual(0);

                summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['0']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['0']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['0', '0', '0', '0', '0']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count', 'Earliest', 'Latest'], ['0', '', '']);

                grid.clearFilter();
                fix.detectChanges();

                filterResult = grid.rowList.length;
                expect(filterResult).toEqual(10);

                summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['10']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['10']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '0', '20,000', '39,004', '3,900.4']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                    ['Count', 'Earliest', 'Latest'], ['10', 'May 17, 1990', 'Dec 25, 2025']);
            }));

            it('Moving: should move summaries when move column', () => {
                const colUnitsInStock = grid.getColumnByName('UnitsInStock');
                const colProductID = grid.getColumnByName('ProductID');
                colUnitsInStock.movable = true;
                fix.detectChanges();

                grid.moveColumn(colUnitsInStock, colProductID, DropPosition.BeforeDropTarget);
                fix.detectChanges();

                const summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '0', '20,000', '39,004', '3,900.4']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['10']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count'], ['10']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                    ['Count', 'Earliest', 'Latest'], ['10', 'May 17, 1990', 'Dec 25, 2025']);
            });

            it('Hiding: should hide summary row when a column which has summary is hidded', fakeAsync(() => {
                grid.getColumnByName('ProductName').hasSummary = false;
                grid.getColumnByName('InStock').hasSummary = false;
                grid.getColumnByName('OrderDate').hasSummary = false;
                // grid.recalculateSummaries();
                fix.detectChanges();
                tick(100);

                let summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '0', '20,000', '39,004', '3,900.4']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, [], []);

                grid.getColumnByName('UnitsInStock').hidden = true;
                tick();
                fix.detectChanges();


                summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                expect(summaryRow).toBeNull();
                expect(grid.hasSummarizedColumns).toBe(false);

                grid.getColumnByName('UnitsInStock').hidden = false;
                tick();
                fix.detectChanges();
                summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                expect(summaryRow).toBeDefined();
                expect(grid.hasSummarizedColumns).toBe(true);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '0', '20,000', '39,004', '3,900.4']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, [], []);
            }));

            it('Hiding: should recalculate summary area after column with enabled summary is hidden', fakeAsync(() => {
                let tFoot = GridFunctions.getGridFooterWrapper(fix).nativeElement.getBoundingClientRect().height;
                expect(tFoot).toEqual(5 * grid.defaultSummaryHeight);

                grid.getColumnByName('UnitsInStock').hidden = true;
                tick();
                fix.detectChanges();

                tFoot = GridFunctions.getGridFooterWrapper(fix).nativeElement.getBoundingClientRect().height;
                expect(tFoot).toEqual(3 * grid.defaultSummaryHeight);
                expect(grid.hasSummarizedColumns).toBe(true);

                let summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['10']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['10']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Earliest', 'Latest'], ['10', 'May 17, 1990', 'Dec 25, 2025']);

                grid.getColumnByName('UnitsInStock').hidden = false;
                tick();
                fix.detectChanges();

                expect(grid.hasSummarizedColumns).toBe(true);
                tFoot = GridFunctions.getGridFooterWrapper(fix).nativeElement.getBoundingClientRect().height;
                expect(tFoot).toEqual(5 * grid.defaultSummaryHeight);
                summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['10']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['10']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '0', '20,000', '39,004', '3,900.4']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                    ['Count', 'Earliest', 'Latest'], ['10', 'May 17, 1990', 'Dec 25, 2025']);
            }));

            it('CRUD: should recalculate summary functions rowAdded', () => {
                grid.addRow({
                    ProductID: 11, ProductName: 'Belgian Chocolate', InStock: true, UnitsInStock: 99000, OrderDate: new Date('2018-03-01')
                });
                fix.detectChanges();

                const summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['11']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['11']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['11', '0', '99,000', '138,004', '12,545.818']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                    ['Count', 'Earliest', 'Latest'], ['11', 'May 17, 1990', 'Dec 25, 2025']);
            });

            it('CRUD: should recalculate summary functions rowDeleted', () => {
                grid.deleteRow(9);
                fix.detectChanges();

                const summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['9']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['9']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['9', '0', '20,000', '32,006', '3,556.222']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                    ['Count', 'Earliest', 'Latest'], ['9', 'May 17, 1990', 'Mar 1, 2018']);
            });

            it('CRUD: should recalculate summary functions on updateRow', () => {
                const productNameCell = grid.getCellByColumn(0, 'ProductName');
                const unitsInStockCell = grid.getCellByColumn(0, 'UnitsInStock');

                expect(productNameCell.value).toBe('Chai');
                expect(unitsInStockCell.value).toBe(2760);

                grid.updateRow({
                    ProductID: 1, ProductName: 'Spearmint', InStock: true, UnitsInStock: 510000, OrderDate: new Date('1984-03-21')
                }, 1);
                fix.detectChanges();

                expect(productNameCell.value).toBe('Spearmint');
                expect(unitsInStockCell.value).toBe(510000);

                const summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['10']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['10']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '0', '510,000', '546,244', '54,624.4']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                    ['Count', 'Earliest', 'Latest'], ['10', 'Mar 21, 1984', 'Dec 25, 2025']);
            });

            it('CRUD: should recalculate summary functions on cell update', () => {
                const unitsInStockCell = grid.getCellByColumn(0, 'UnitsInStock');
                unitsInStockCell.update(99000);
                fix.detectChanges();

                let summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '0', '99,000', '135,244', '13,524.4']);

                unitsInStockCell.update(-12);
                fix.detectChanges();
                summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '-12', '20,000', '36,232', '3,623.2']);
            });

            it('Pinning: should display all active summaries after column pinning', () => {
                grid.pinColumn('UnitsInStock');
                grid.pinColumn('ProductID');
                fix.detectChanges();

                const summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '0', '20,000', '39,004', '3,900.4']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['10']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count'], ['10']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                    ['Count', 'Earliest', 'Latest'], ['10', 'May 17, 1990', 'Dec 25, 2025']);
            });

            it('CRUD: Apply filter and update cell', () => {
                grid.filter('ProductName', 'ch', IgxStringFilteringOperand.instance().condition('contains'));
                fix.detectChanges();

                let summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['4', '52', '20,000', '29,810', '7,452.5']);

                const cell = grid.getCellByColumn(2, 'ProductName');
                cell.update('Teatime Cocoa Biscuits');
                fix.detectChanges();

                summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
                GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['3', '52', '20,000', '22,812', '7,604']);
            });
        });
    });

    describe('Keyboard Navigation', () => {
        let fix;
        let grid: IgxGridComponent;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(SummariesGroupByComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            setupGridScrollDetection(fix, grid);
            grid.width = '800px';
            grid.height = '800px';
            fix.detectChanges();
            tick(100);
        }));

        it('should be able to select summaries with arrow keys', async () => {
            const gridFooter = GridFunctions.getGridFooter(fix);
            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.focusSummaryCell(fix, summaryRow, 0);

            for (let i = 0; i < 5; i++) {
                GridSummaryFunctions.verifySummaryCellActive(fix, summaryRow, i);
                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridFooter);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['8', '25', '50', '293', '36.625']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['8']);

            for (let i = 5; i > 0; i--) {
                GridSummaryFunctions.verifySummaryCellActive(fix, summaryRow, i);
                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridFooter);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['8', '17', '847', '2,188', '273.5']);
        });

        it('should be able to navigate with Arrow keys and Ctrl', async () => {
            const gridFooter = GridFunctions.getGridFooter(fix);
            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.focusSummaryCell(fix, summaryRow, 1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridFooter, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            GridSummaryFunctions.verifySummaryCellActive(fix, summaryRow, 5);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['8', '25', '50', '293', '36.625']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['8']);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridFooter, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            GridSummaryFunctions.verifySummaryCellActive(fix, summaryRow, 0);
            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['8', '17', '847', '2,188', '273.5']);
        });

        it('should not change active summary cell when press Arrow Down and Up', () => {
            const gridFooter = GridFunctions.getGridFooter(fix);
            const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.focusSummaryCell(fix, summaryRow, 1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridFooter);
            fix.detectChanges();
            GridSummaryFunctions.verifySummaryCellActive(fix, summaryRow, 1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridFooter);
            fix.detectChanges();
            GridSummaryFunctions.verifySummaryCellActive(fix, summaryRow, 1);
        });

        it('Grouping: should be able to select summaries with arrow keys', async () => {
            const gridContent = GridFunctions.getGridContent(fix);
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();

            GridSummaryFunctions.focusSummaryCell(fix, 3, 0);
            for (let i = 0; i < 5; i++) {
                GridSummaryFunctions.verifySummaryCellActive(fix, 3, i);
                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '27', '50', '77', '38.5']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['2']);

            for (let i = 5; i > 0; i--) {
                GridSummaryFunctions.verifySummaryCellActive(fix, 3, i);
                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '17', '17', '34', '17']);
        });

        it('Grouping: should not change active summary cell when press Ctrl+ArrowUp/Down', () => {
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();

            GridSummaryFunctions.focusSummaryCell(fix, 3, 1);
            GridSummaryFunctions.verifySummaryCellActive(fix, 3, 1);

            const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            const summaryCell = GridSummaryFunctions.getSummaryCellByVisibleIndex(summaryRow, 1);
            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', summaryCell, false, false, true);
            fix.detectChanges();
            GridSummaryFunctions.verifySummaryCellActive(fix, 3, 1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', summaryCell, false, false, true);
            fix.detectChanges();
            GridSummaryFunctions.verifySummaryCellActive(fix, 3, 1);
        });

        it('Grouping: should be able to navigate with Arrow keys Right/Left and Ctrl', async () => {
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();
            const gridContent = GridFunctions.getGridContent(fix);
            GridSummaryFunctions.focusSummaryCell(fix, 3, 1);
            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            GridSummaryFunctions.verifySummaryCellActive(fix, 3, 5);
            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '27', '50', '77', '38.5']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['2']);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            GridSummaryFunctions.verifySummaryCellActive(fix, 3, 0);
            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '17', '17', '34', '17']);
        });

        it('Grouping: should not change active summary cell when press CTRL+Home/End ', () => {
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();

            GridSummaryFunctions.focusSummaryCell(fix, 3, 1);
            GridSummaryFunctions.verifySummaryCellActive(fix, 3, 1);

            const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            const summaryCell = GridSummaryFunctions.getSummaryCellByVisibleIndex(summaryRow, 1);
            UIInteractions.triggerEventHandlerKeyDown('End', summaryCell, false, false, true);
            fix.detectChanges();
            GridSummaryFunctions.verifySummaryCellActive(fix, 3, 1);

            UIInteractions.triggerEventHandlerKeyDown('Home', summaryCell, false, false, true);
            fix.detectChanges();
            GridSummaryFunctions.verifySummaryCellActive(fix, 3, 1);
        });

        it('Grouping: should navigate with arrow keys from cell to summary row ', () => {
            grid.tbody.nativeElement.focus();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();

            let cell = grid.getCellByColumn(2, 'ID');
            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            cell = grid.getCellByColumn(2, 'ID');
            expect(cell.selected).toBe(true);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', grid.tbody.nativeElement, true);
            fix.detectChanges();

            cell = grid.getCellByColumn(2, 'ID');
            expect(cell.selected).toBe(true);
            GridSummaryFunctions.verifySummaryCellActive(fix, 3, 0);

            const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            const summaryCell = GridSummaryFunctions.getSummaryCellByVisibleIndex(summaryRow, 0);
            GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown');
            fix.detectChanges();

            GridSummaryFunctions.verifySummaryCellActive(fix, 3, 0, false);

            cell = grid.getCellByColumn(2, 'ID');
            expect(cell.selected).toBe(true);

            const row = grid.gridAPI.get_row_by_index(4);
            expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
            expect(row.focused).toBe(true);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', grid.tbody.nativeElement, true);
            fix.detectChanges();

            GridSummaryFunctions.verifySummaryCellActive(fix, 3, 0);

            cell = grid.getCellByColumn(2, 'ID');
            expect(cell.selected).toBe(true);
            GridFunctions.simulateGridContentKeydown(fix, 'ArrowRight');
            fix.detectChanges();

            GridSummaryFunctions.verifySummaryCellActive(fix, 3, 1);

            // summaryCell = GridSummaryFunctions.getSummaryCellByVisibleIndex(summaryRow, 1);
            GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp');
            fix.detectChanges();
            cell = grid.getCellByColumn(2, 'ParentID');
            expect(cell.selected).toBe(true);
            cell = grid.getCellByColumn(2, 'ID');
            expect(cell.selected).toBe(false);
        });

        it('should navigate with tab to filter row if the grid is empty', () => {
            pending('this test need to be written again when the header are ready');
            grid.allowFiltering = true;
            grid.filter('ID', 0, IgxNumberFilteringOperand.instance().condition('lessThanOrEqualTo'));
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'ParentID');
            const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);

            GridSummaryFunctions.focusSummaryCell(fix, summaryRow, 0);
            const summaryCell = GridSummaryFunctions.getSummaryCellByVisibleIndex(summaryRow, 0);
            UIInteractions.triggerEventHandlerKeyDown('Tab', summaryCell, false, true);

            fix.detectChanges();
            const closeButton = GridFunctions.getFilterRowCloseButton(fix);
            expect(document.activeElement).toEqual(closeButton.nativeElement);

            // TO DO update with correct method
            // grid.filteringRow.onTabKeydown(UIInteractions.getKeyboardEvent('keydown', 'tab'));
            fix.detectChanges();

            GridSummaryFunctions.verifySummaryCellActive(fix, 0, 0);
        });
    });

    describe('CRUD with transactions: ', () => {
        let fix;
        let grid;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(SummariesGroupByTransactionsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Add row', () => {
            let newRow = {
                ID: 777,
                ParentID: 17,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19,
                OnPTO: true
            };
            grid.addRow(newRow);
            fix.detectChanges();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['19', '50']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['9']);

            // Undo transactions
            grid.transactions.undo();
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['25', '50']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['8']);

            // redo transactions
            grid.transactions.redo();
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['19', '50']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['9']);

            // Commit
            grid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['19', '50']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['9']);

            newRow = {
                ID: 999,
                ParentID: 17,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19,
                OnPTO: true
            };
            grid.addRow(newRow);
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['10']);

            // Discard
            grid.transactions.clear();
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['19', '50']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['9']);
        });

        it('Delete row', () => {
            grid.deleteRow(475);
            fix.detectChanges();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['7']);

            // Undo transactions
            grid.transactions.undo();
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['8']);

            // redo transactions
            grid.transactions.redo();
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['7']);

            // Commit
            grid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['7']);

            grid.deleteRow(317);
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['6']);

            // Discard
            grid.transactions.clear();
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['7']);
        });

        it('Update row', () => {
            let newRow = {
                ID: 12,
                ParentID: 17,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19
            };
            grid.updateRow(newRow, 12);
            fix.detectChanges();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['8', 'Jul 19, 2009', 'Apr 3, 2019']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['19', '44']);

            // Undo transactions
            grid.transactions.undo();
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['8', 'Dec 18, 2007', 'Dec 9, 2017']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['25', '50']);

            // redo transactions
            grid.transactions.redo();
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['8', 'Jul 19, 2009', 'Apr 3, 2019']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['19', '44']);

            // Commit
            grid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['8', 'Jul 19, 2009', 'Apr 3, 2019']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['19', '44']);

            newRow = {
                ID: 957,
                ParentID: 17,
                Name: 'New Employee',
                HireDate: new Date(2000, 4, 4),
                Age: 65
            };
            grid.updateRow(newRow, 957);
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Earliest', 'Latest'], ['8', 'May 4, 2000', 'Apr 3, 2019']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['19', '65']);

            // Discard
            grid.transactions.clear();
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['8', 'Jul 19, 2009', 'Apr 3, 2019']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['19', '44']);
        });

        it('Update cell', () => {
            grid.updateCell(19, grid.getRowByKey(12).key, 'Age');
            fix.detectChanges();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['19', '44']);

            // Undo transactions
            grid.transactions.undo();
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['25', '50']);

            // redo transactions
            grid.transactions.redo();
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['19', '44']);

            // Commit
            grid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['19', '44']);

            grid.updateCell(65, grid.getRowByKey(957).key, 'Age');
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['19', '65']);

            // Discard
            grid.transactions.clear();
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['19', '44']);
        });

        it('Grouping: Add grouped row', (async () => {
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();

            grid.verticalScrollContainer.scrollTo(grid.dataView.length - 1);
            await wait(100);
            fix.detectChanges();

            const newRow = {
                ID: 777,
                ParentID: 17,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19,
                OnPTO: true
            };
            grid.addRow(newRow);
            fix.detectChanges();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['19', '50']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['9']);

            grid.verticalScrollContainer.scrollTo(0);
            await wait(100);
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 4);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['19', '50']);

            // Undo transactions
            grid.transactions.undo();
            fix.detectChanges();

            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 2, ['Count'], ['8']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 3, 5, ['Count'], ['2']);

            // redo transactions
            grid.transactions.redo();
            fix.detectChanges();
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 4, ['Min', 'Max'], ['19', '50']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 5, ['Count'], ['9']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 4, 4, ['Min', 'Max'], ['19', '50']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 4, 5, ['Count'], ['3']);

            fix.detectChanges();
            // Get row by index and check it's type
            GridSummaryFunctions.verifyRowWithIndexIsOfType(grid, 0, IgxGroupByRow);
            GridSummaryFunctions.verifyRowWithIndexIsOfType(grid, 1, IgxGridRow);
            GridSummaryFunctions.verifyRowWithIndexIsOfType(grid, 4, IgxSummaryRow);

            // Check the API members - isSummaryRow
            const summaryRow4 = grid.getRowByIndex(4);
            expect(summaryRow4.isSummaryRow).toBe(true);
            // Check rowID, rowData, data, disabled
            expect(summaryRow4.key).toBeUndefined();
            expect(summaryRow4.rowData).toBeUndefined();
            expect(summaryRow4.data).toBeUndefined();
            expect(summaryRow4.pinned).toBeUndefined();
            expect(summaryRow4.selected).toBeUndefined();

            // Get row by index and check summaries member
            expect(summaryRow4 instanceof IgxSummaryRow).toBe(true);
            expect(summaryRow4.summaries instanceof Map).toBe(true);
        }));

        it('Grouping: Add not grouped row', (async () => {
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();

            const newRow = {
                ID: 777,
                ParentID: 999,
                Name: 'New Employee',
                HireDate: null,
                Age: 19,
                OnPTO: true
            };
            grid.addRow(newRow);
            fix.detectChanges();

            const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['9']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['9', 'Dec 18, 2007', 'Dec 9, 2017']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['19', '50']);

            grid.verticalScrollContainer.scrollTo(grid.dataView.length - 1);
            await wait(50);
            fix.detectChanges();

            let row = grid.gridAPI.get_row_by_index(16);
            expect(row instanceof IgxGridGroupByRowComponent).toBe(true);

            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 18, 4, ['Min', 'Max'], ['19', '19']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 18, 5, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 18, 3, ['Count', 'Earliest', 'Latest'], ['1', '', '']);

            // Undo transactions
            grid.transactions.undo();
            await wait(50);
            fix.detectChanges();
            row = grid.gridAPI.get_row_by_index(16);
            expect(row).toBeUndefined();

            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 2, ['Count'], ['8']);

            // redo transactions
            grid.transactions.redo();
            await wait(50);
            fix.detectChanges();

            row = grid.gridAPI.get_row_by_index(16);
            expect(row instanceof IgxGridGroupByRowComponent).toBe(true);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 4, ['Min', 'Max'], ['19', '50']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 5, ['Count'], ['9']);

            grid.verticalScrollContainer.scrollTo(grid.dataView.length - 1);
            await wait(50);
            fix.detectChanges();
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 18, 5, ['Count'], ['1']);

            // Discard
            grid.transactions.clear();
            await wait(50);
            fix.detectChanges();

            row = grid.gridAPI.get_row_by_index(16);
            expect(row).toBeUndefined();
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 2, ['Count'], ['8']);
        }));

        it('Grouping: delete row', () => {
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();

            grid.deleteRow(grid.getRowByIndex(1).key);
            fix.detectChanges();

            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 2, ['Count'], ['7']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 3, 2, ['Count'], ['1']);

            grid.deleteRow(grid.getRowByIndex(2).key);
            fix.detectChanges();

            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 2, ['Count'], ['6']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 3, 2, ['Count'], ['0']);

            const row = grid.gridAPI.get_row_by_index(0);
            expect(row instanceof IgxGridGroupByRowComponent).toBe(true);

            // Commit transactions
            grid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();

            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 2, ['Count'], ['6']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 2, 2, ['Count'], ['1']);
        });

        it('Grouping: Update row and keep grouping', () => {
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();

            const newRow = {
                ID: 101,
                ParentID: 17,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19
            };
            grid.updateRow(newRow, 101);
            fix.detectChanges();

            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 2, ['Count'], ['8']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 4, ['Min', 'Max'], ['19', '50']);

            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 3, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 3, 4, ['Min', 'Max'], ['19', '50']);
        });

        it('CRUD: summaries should be updated when row is submitted when rowEditable=true', fakeAsync(() => {
            grid.getColumnByName('Age').editable = true;
            grid.getColumnByName('HireDate').editable = true;
            fix.detectChanges();
            grid.rowEditable = true;
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();
            const cell = grid.getCellByColumn(1, 'Age');

            let summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['27', '50']);

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            flush();
            fix.detectChanges();

            const editTemplate = fix.debugElement.query(By.css('input[type=\'number\']'));
            UIInteractions.clickAndSendInputElementValue(editTemplate, 87);
            flush();
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('tab', cell.nativeElement, true, false, true);
            flush();
            fix.detectChanges();

            summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['27', '50']);

            const hireDateCell = grid.getCellByColumn(1, 'HireDate');
            UIInteractions.triggerKeyDownEvtUponElem('enter', hireDateCell.nativeElement, true);
            flush();
            fix.detectChanges();

            summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Min', 'Max'], ['27', '87']);
        }));

        it('Grouping: Update row and change grouping', (async () => {
            grid.getColumnByName('HireDate').hasSummary = false;
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();

            const newRow = {
                ID: 101,
                ParentID: 19,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19
            };
            grid.updateRow(newRow, 101);
            fix.detectChanges();

            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 2, ['Count'], ['8']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 4, ['Min', 'Max'], ['19', '50']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 6, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 6, 4, ['Min', 'Max'], ['19', '44']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 2, 2, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 2, 4, ['Min', 'Max'], ['50', '50']);

            // Undo transactions
            grid.transactions.undo();
            fix.detectChanges();
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 6, 2, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 6, 4, ['Min', 'Max'], ['44', '44']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 3, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 3, 4, ['Min', 'Max'], ['27', '50']);

            // Redo transactions
            grid.transactions.redo();
            fix.detectChanges();
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 6, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 6, 4, ['Min', 'Max'], ['19', '44']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 2, 2, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 2, 4, ['Min', 'Max'], ['50', '50']);

        }));

        it('Grouping: Update row and add new group', () => {
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();

            const newRow = {
                ID: 12,
                ParentID: -2,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19
            };
            grid.updateRow(newRow, 12);
            fix.detectChanges();

            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 2, ['Count'], ['8']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 4, ['Min', 'Max'], ['19', '44']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 2, 2, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 2, 4, ['Min', 'Max'], ['19', '19']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 5, 2, ['Count'], ['1']);

            // Undo transactions
            grid.transactions.undo();
            fix.detectChanges();
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 4, ['Min', 'Max'], ['25', '50']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 3, 2, ['Count'], ['2']);

            // Redo transactions
            grid.transactions.redo();
            fix.detectChanges();
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 2, ['Count'], ['8']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 4, ['Min', 'Max'], ['19', '44']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 2, 2, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 2, 4, ['Min', 'Max'], ['19', '19']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 5, 2, ['Count'], ['1']);
        });

        it('Grouping: Update row and change group name', () => {
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();

            const newRow1 = {
                ID: 12,
                ParentID: -2,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19
            };
            grid.updateRow(newRow1, 12);

            const newRow2 = {
                ID: 101,
                ParentID: -2,
                Name: 'New Employee2',
                HireDate: new Date(2015, 5, 5),
                Age: 60
            };
            grid.updateRow(newRow2, 101);
            fix.detectChanges();


            let groupRows = grid.groupsRowList.toArray();
            expect(groupRows[0].groupRow.value).toEqual(-2);
            expect(groupRows[1].groupRow.value).toEqual(19);

            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 2, ['Count'], ['8']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 4, ['Min', 'Max'], ['19', '60']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 3, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 3, 4, ['Min', 'Max'], ['19', '60']);

            // Undo transactions
            grid.transactions.undo();
            grid.transactions.undo();
            fix.detectChanges();
            groupRows = grid.groupsRowList.toArray();
            expect(groupRows[0].groupRow.value).toEqual(17);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 4, ['Min', 'Max'], ['25', '50']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 3, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 3, 4, ['Min', 'Max'], ['27', '50']);

            // Redo transactions
            grid.transactions.redo();
            grid.transactions.redo();
            fix.detectChanges();
            groupRows = grid.groupsRowList.toArray();
            expect(groupRows[0].groupRow.value).toEqual(-2);
            expect(groupRows[1].groupRow.value).toEqual(19);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 2, ['Count'], ['8']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 4, ['Min', 'Max'], ['19', '60']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 3, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 3, 4, ['Min', 'Max'], ['19', '60']);
        });

        it('Grouping: Update cell and change grouping', () => {
            grid.getColumnByName('HireDate').hasSummary = false;
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();

            grid.updateCell(-1, grid.getRowByKey(101).key, 'ParentID');
            fix.detectChanges();

            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 0, 2, ['Count'], ['8']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 2, 2, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 2, 4, ['Min', 'Max'], ['27', '27']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 5, 2, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 5, 4, ['Min', 'Max'], ['50', '50']);
            let groupRows = grid.groupsRowList.toArray();
            expect(groupRows[0].groupRow.value).toEqual(-1);
            expect(groupRows[1].groupRow.value).toEqual(17);

            grid.updateCell(19, grid.getRowByKey(12).key, 'ParentID');
            fix.detectChanges();
            groupRows = grid.groupsRowList.toArray();
            expect(groupRows[0].groupRow.value).toEqual(-1);
            expect(groupRows[1].groupRow.value).toEqual(19);

            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 6, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 6, 4, ['Min', 'Max'], ['44', '50']);

            // Clear transactions
            grid.transactions.clear();
            fix.detectChanges();

            expect(groupRows[0].groupRow.value).toEqual(17);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 6, 2, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 3, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummariesBySummaryRowIndex(fix, 3, 4, ['Min', 'Max'], ['27', '50']);
        });
    });

    describe('Grouping tests: ', () => {
        let fix;
        let grid;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(SummariesGroupByComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();
        }));

        it('should render correct summaries when there is grouped column', () => {
            verifyBaseSummaries(fix);
            verifySummariesForParentID17(fix, 3);
            const groupRows = grid.groupsRowList.toArray();
            groupRows[0].toggle();
            fix.detectChanges();
            verifyBaseSummaries(fix);
            verifySummariesForParentID19(fix, 3);
            verifySummaryRowIndentationByDataRowIndex(fix, 0);
            verifySummaryRowIndentationByDataRowIndex(fix, 3);
        });

        it('should render correct summaries when change grouping', () => {
            // Group by another column
            grid.groupBy({
                fieldName: 'OnPTO', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();

            verifyBaseSummaries(fix);
            verifySummariesForParentID17(fix, 4);
            verifySummariesForParentID17(fix, 5);
            verifySummaryRowIndentationByDataRowIndex(fix, 0);
            verifySummaryRowIndentationByDataRowIndex(fix, 4);
            verifySummaryRowIndentationByDataRowIndex(fix, 5);

            // change order
            grid.groupingExpressions = [
                { fieldName: 'OnPTO', dir: SortingDirection.Asc, ignoreCase: true },
                { fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: true }
            ];
            fix.detectChanges();

            verifyBaseSummaries(fix);
            verifySummariesForParentID17(fix, 4);
            verifySummaryRowIndentationByDataRowIndex(fix, 0);
            verifySummaryRowIndentationByDataRowIndex(fix, 4);

            const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 8);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['2', 'Jul 3, 2011', 'Sep 18, 2014']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '31', '43', '74', '37']);

            grid.clearGrouping('OnPTO');
            fix.detectChanges();
            verifyBaseSummaries(fix);
            verifySummariesForParentID17(fix, 3);
            verifySummariesForParentID19(fix, 6);
            verifySummaryRowIndentationByDataRowIndex(fix, 0);
            verifySummaryRowIndentationByDataRowIndex(fix, 3);
            verifySummaryRowIndentationByDataRowIndex(fix, 6);
        });

        it('should be able to enable/disable summaries at runtime', () => {
            grid.getColumnByName('Age').hasSummary = false;
            grid.getColumnByName('ParentID').hasSummary = false;
            fix.detectChanges();

            GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 3, grid.defaultSummaryHeight);

            let summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            summaries.forEach(summary => {
                GridSummaryFunctions.verifyColumnSummaries(summary, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 1, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 2, ['Count'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 3, ['Count', 'Earliest', 'Latest'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 4, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 5, ['Count'], []);
            });

            // Disable all summaries
            grid.getColumnByName('Name').hasSummary = false;
            grid.getColumnByName('HireDate').hasSummary = false;
            grid.getColumnByName('OnPTO').hasSummary = false;
            fix.detectChanges();
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(0);

            grid.getColumnByName('Name').hasSummary = true;
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(5);
            GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 1, grid.defaultSummaryHeight);
            summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            summaries.forEach(summary => {
                GridSummaryFunctions.verifyColumnSummaries(summary, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 1, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 2, ['Count'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 3, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 4, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 5, [], []);
            });
        });

        it('should show/hide summaries when expand/collapse group row', () => {
            grid.disableSummaries([{ fieldName: 'Age' }, { fieldName: 'ParentID' }, { fieldName: 'HireDate' }]);
            fix.detectChanges();
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(5);

            const groupRows = grid.groupsRowList.toArray();
            groupRows[0].toggle();
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(4);

            grid.toggleAllGroupRows();
            fix.detectChanges();
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);

            groupRows[0].toggle();
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(2);

            grid.toggleAllGroupRows();
            fix.detectChanges();
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(5);
        });

        it('should show summaries when group row is collapsed', () => {
            expect(grid.showSummaryOnCollapse).toBe(false);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);
            const groupRows = grid.groupsRowList.toArray();
            grid.showSummaryOnCollapse = true;
            fix.detectChanges();

            groupRows[0].toggle();
            fix.detectChanges();

            expect(groupRows[0].expanded).toBe(false);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(4);
            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 1);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '17', '17', '34', '17']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['2', 'Dec 18, 2007', 'Mar 19, 2016']);

            groupRows[0].toggle();
            fix.detectChanges();

            expect(groupRows[0].expanded).toBe(true);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);
            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '17', '17', '34', '17']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['2', 'Dec 18, 2007', 'Mar 19, 2016']);
        });

        it('should be able to change showSummaryOnCollapse run time', () => {
            expect(grid.showSummaryOnCollapse).toBe(false);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);
            const groupRows = grid.groupsRowList.toArray();
            fix.detectChanges();

            groupRows[0].toggle();
            fix.detectChanges();

            expect(groupRows[0].expanded).toBe(false);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);

            grid.showSummaryOnCollapse = true;
            fix.detectChanges();

            expect(grid.showSummaryOnCollapse).toBe(true);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(4);
            const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 1);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '17', '17', '34', '17']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['2', 'Dec 18, 2007', 'Mar 19, 2016']);
        });


        it('should correctly position summary row when group row is collapsed', () => {
            grid.showSummaryOnCollapse = true;
            fix.detectChanges();
            grid.groupBy({ fieldName: 'OnPTO', dir: SortingDirection.Asc, ignoreCase: false });
            fix.detectChanges();

            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 4);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '17', '17', '34', '17']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['2', 'Dec 18, 2007', 'Mar 19, 2016']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 5);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '17', '17', '34', '17']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['2', 'Dec 18, 2007', 'Mar 19, 2016']);

            const groupRows = grid.groupsRowList.toArray();
            groupRows[1].toggle();
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 2);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '17', '17', '34', '17']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['2', 'Dec 18, 2007', 'Mar 19, 2016']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '17', '17', '34', '17']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['2', 'Dec 18, 2007', 'Mar 19, 2016']);

            grid.summaryPosition = 'top';
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 1);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '17', '17', '34', '17']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['2', 'Dec 18, 2007', 'Mar 19, 2016']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '17', '17', '34', '17']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['2', 'Dec 18, 2007', 'Mar 19, 2016']);

        });

        it('should navigate correctly with Ctrl + ArrowUp/Home when summary position is top', () => {
            grid.showSummaryOnCollapse = true;
            fix.detectChanges();

            grid.summaryPosition = 'top';
            fix.detectChanges();

            fix.detectChanges();
            let cell = grid.getCellByColumn(6, 'Age');
            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            expect(cell.selected).toBe(true);
            UIInteractions.triggerKeyDownEvtUponElem('Home', cell.nativeElement, true, false, false, true);
            fix.detectChanges();

            cell = grid.getCellByColumn(2, 'ID');
            expect(cell.selected).toBe(true);
            expect(cell.active).toBe(true);

            cell = grid.getCellByColumn(6, 'Name');
            UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', cell.nativeElement, true, false, false, true);
            fix.detectChanges();

            cell = grid.getCellByColumn(2, 'Name');
            expect(cell.selected).toBe(true);
            expect(cell.active).toBe(true);
        });

        it('should be able to enable/disable summaries at runtime', () => {
            grid.getColumnByName('Age').hasSummary = false;
            grid.getColumnByName('ParentID').hasSummary = false;
            fix.detectChanges();

            GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 3, grid.defaultSummaryHeight);

            let summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            summaries.forEach(summary => {
                GridSummaryFunctions.verifyColumnSummaries(summary, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 1, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 2, ['Count'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 3, ['Count', 'Earliest', 'Latest'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 4, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 5, ['Count'], []);
            });

            // Disable all summaries
            grid.getColumnByName('Name').hasSummary = false;
            grid.getColumnByName('HireDate').hasSummary = false;
            grid.getColumnByName('OnPTO').hasSummary = false;
            fix.detectChanges();
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(0);

            grid.getColumnByName('Name').hasSummary = true;
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(5);
            GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 1, grid.defaultSummaryHeight);
            summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            summaries.forEach(summary => {
                GridSummaryFunctions.verifyColumnSummaries(summary, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 1, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 2, ['Count'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 3, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 4, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 5, [], []);
            });
        });

        it('should be able to change summaryCalculationMode at runtime', () => {
            grid.getColumnByName('Age').hasSummary = false;
            grid.getColumnByName('ParentID').hasSummary = false;
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesRowIndexes(fix)).toEqual([3, 6, 11, grid.dataView.length]);

            grid.summaryCalculationMode = 'rootLevelOnly';
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);
            expect(GridSummaryFunctions.getAllVisibleSummariesRowIndexes(fix)).toEqual([grid.dataView.length]);

            grid.summaryCalculationMode = 'childLevelsOnly';
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);
            expect(GridSummaryFunctions.getAllVisibleSummariesRowIndexes(fix)).toEqual([3, 6, 11]);
            const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            expect(summaryRow).toBeNull();

            grid.summaryCalculationMode = 'rootAndChildLevels';
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(4);
            expect(GridSummaryFunctions.getAllVisibleSummariesRowIndexes(fix)).toEqual([3, 6, 11, grid.dataView.length]);
        });

        it('should remove child summaries when remove grouped column', () => {
            grid.clearGrouping('ParentID');
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);
            expect(GridSummaryFunctions.getAllVisibleSummariesRowIndexes(fix)).toEqual([grid.dataView.length]);
            verifyBaseSummaries(fix);
        });

        it('Hiding: should render correct summaries when show/hide a column', () => {
            grid.getColumnByName('Age').hidden = true;
            grid.getColumnByName('ParentID').hidden = true;
            fix.detectChanges();

            let summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            summaries.forEach(summary => {
                GridSummaryFunctions.verifyColumnSummaries(summary, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 1, ['Count'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 2, ['Count', 'Earliest', 'Latest'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 3, ['Count'], []);
            });

            GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 3);

            grid.getColumnByName('Name').hidden = true;
            grid.getColumnByName('HireDate').hidden = true;
            grid.getColumnByName('OnPTO').hidden = true;
            fix.detectChanges();
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(0);

            grid.getColumnByName('HireDate').hidden = false;
            grid.getColumnByName('OnPTO').hidden = false;
            fix.detectChanges();

            summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            summaries.forEach(summary => {
                GridSummaryFunctions.verifyColumnSummaries(summary, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 1, ['Count', 'Earliest', 'Latest'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 2, ['Count'], []);
            });

            GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 3);

            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['2']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['1']);

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['8']);
        });

        it('Filtering: should render correct summaries when filter', () => {
            grid.filter('ID', 12, IgxNumberFilteringOperand.instance().condition('lessThanOrEqualTo'));
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(2);
            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 2);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['1', 'Dec 18, 2007', 'Dec 18, 2007']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '50', '50', '50', '50']);

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['1', 'Dec 18, 2007', 'Dec 18, 2007']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '50', '50', '50', '50']);

            grid.clearFilter();
            fix.detectChanges();

            verifyBaseSummaries(fix);
            verifySummariesForParentID17(fix, 3);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);
        });

        it('Filtering: should render correct summaries when filter with no results found', () => {
            grid.filter('ID', 1, IgxNumberFilteringOperand.instance().condition('lessThanOrEqualTo'));
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);
            const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['0']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Earliest', 'Latest'], ['0', '', '']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['0', '0', '0', '0', '0']);

            grid.clearFilter();
            fix.detectChanges();

            verifyBaseSummaries(fix);
            verifySummariesForParentID17(fix, 3);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);
        });

        it('Paging: should render correct summaries when paging is enable and position is buttom', fakeAsync(() => {
            fix.componentInstance.paging = true;
            fix.detectChanges();
            grid.perPage = 3;
            fix.detectChanges();
            tick(16);

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(2);
            verifyBaseSummaries(fix);
            verifySummariesForParentID17(fix, 3);

            grid.page = 1;
            fix.detectChanges();
            tick(16);

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(2);
            verifyBaseSummaries(fix);
            verifySummariesForParentID19(fix, 2);

            grid.page = 2;
            fix.detectChanges();
            tick(16);
            verifySummariesForParentID147(fix, 3);
            verifyBaseSummaries(fix);

            grid.page = 0;
            fix.detectChanges();
            tick(16);

            const groupRows = grid.groupsRowList.toArray();
            groupRows[0].toggle();
            fix.detectChanges();
            tick(16);

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(2);
            verifyBaseSummaries(fix);
        }));

        it('Paging: should render correct summaries when paging is enable and position is top', fakeAsync(() => {
            fix.componentInstance.paging = true;
            fix.detectChanges();
            grid.perPage = 3;
            grid.summaryPosition = 'top';
            fix.detectChanges();
            tick(16);

            grid.page = 1;
            fix.detectChanges();
            tick(16);

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);
            verifyBaseSummaries(fix);
            verifySummariesForParentID19(fix, 1);
            verifySummariesForParentID147(fix, 4);

            grid.page = 2;
            fix.detectChanges();
            tick(16);

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);
            verifyBaseSummaries(fix);
        }));

        it('CRUD: Add grouped item', () => {
            const newRow = {
                ID: 777,
                ParentID: 17,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19,
                OnPTO: true
            };
            grid.addRow(newRow);
            fix.detectChanges();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['9', '17', '847', '2,205', '245']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['9']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['9', 'Dec 18, 2007', 'Apr 3, 2019']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['9', '19', '50', '312', '34.667']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['9']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 4);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['3', '17', '17', '51', '17']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['3', 'Dec 18, 2007', 'Apr 3, 2019']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['3']);
        });

        it('CRUD: Add not grouped item', () => {
            const newRow = {
                ID: 777,
                ParentID: 1,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19,
                OnPTO: true
            };
            grid.addRow(newRow);
            fix.detectChanges();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['9', '1', '847', '2,189', '243.222']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['9']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['9', 'Dec 18, 2007', 'Apr 3, 2019']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['9', '19', '50', '312', '34.667']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['9']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 2);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '1', '1', '1', '1']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['1']);

            verifySummariesForParentID17(fix, 6);
        });

        it('CRUD: delete node', () => {
            grid.getColumnByName('Age').hasSummary = false;
            grid.getColumnByName('ParentID').hasSummary = false;
            grid.getColumnByName('HireDate').hasSummary = false;
            fix.detectChanges();

            grid.deleteRow(grid.getRowByIndex(1).key);
            fix.detectChanges();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['7']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 2);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['1']);

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(5);

            grid.deleteRow(grid.getRowByIndex(1).key);
            fix.detectChanges();
            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['6']);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(4);
        });

        it('CRUD: delete all nodes', () => {
            grid.deleteRow(grid.getRowByIndex(1).key);
            grid.deleteRow(grid.getRowByIndex(2).key);
            grid.deleteRow(grid.getRowByIndex(5).key);
            grid.deleteRow(grid.getRowByIndex(8).key);
            fix.detectChanges();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['4']);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);

            grid.deleteRow(grid.getRowByIndex(1).key);
            grid.deleteRow(grid.getRowByIndex(2).key);
            grid.deleteRow(grid.getRowByIndex(5).key);
            grid.deleteRow(grid.getRowByIndex(6).key);
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['0']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Earliest', 'Latest'], ['0', '', '']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['0', '0', '0', '0', '0']);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);
        });

        it('CRUD: Update node and keep grouping', () => {
            const newRow = {
                ID: 12,
                ParentID: 17,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19
            };
            grid.getRowByKey(12).update(newRow);
            fix.detectChanges();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['8']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['8', 'Jul 19, 2009', 'Apr 3, 2019']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['8', '19', '44', '262', '32.75']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['8']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['2', 'Mar 19, 2016', 'Apr 3, 2019']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '19', '27', '46', '23']);
        });

        it('CRUD: Update node and change grouping', () => {
            grid.getColumnByName('Age').hasSummary = false;
            grid.getColumnByName('ParentID').hasSummary = false;

            const newRow = {
                ID: 12,
                ParentID: 19,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19
            };
            grid.getRowByKey(12).update(newRow);
            fix.detectChanges();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['8']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['8', 'Jul 19, 2009', 'Apr 3, 2019']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['8']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 2);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Earliest', 'Latest'], ['1', 'Mar 19, 2016', 'Mar 19, 2016']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Earliest', 'Latest'], ['2', 'May 4, 2014', 'Apr 3, 2019']);
        });

        it('CRUD and GroupBy: recalculate summaries when update cell which is grouped', fakeAsync(/** height/width setter rAF */() => {
            grid.width = '400px';
            grid.height = '800px';
            fix.detectChanges();
            tick(100);

            grid.summaryCalculationMode = GridSummaryCalculationMode.childLevelsOnly;
            fix.detectChanges();

            grid.getColumnByName('ID').hasSummary = true;
            fix.detectChanges();

            let summaryRow = GridSummaryFunctions.getAllVisibleSummariesSorted(fix)[0];
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '12', '101', '113', '56.5']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '17', '17', '34', '17']);

            grid.updateCell(19, 101, 'ParentID');
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getAllVisibleSummariesSorted(fix)[0];
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '12', '12', '12', '12']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '17', '17', '17', '17']);

            const secondSummaryRow = GridSummaryFunctions.getAllVisibleSummariesSorted(fix)[1];
            GridSummaryFunctions.verifyColumnSummaries(secondSummaryRow, 0,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '15', '101', '116', '58']);
            GridSummaryFunctions.verifyColumnSummaries(secondSummaryRow, 1,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '19', '19', '38', '19']);
        }));
    });

    const verifySummaryRowIndentationByDataRowIndex = (fixture, visibleIndex) => {
        const grid = fixture.componentInstance.grid;
        const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fixture, visibleIndex ? visibleIndex : grid.dataView.length);
        const summaryRowIndentation = summaryRow.query(By.css('.igx-grid__summaries-patch'));
        expect(summaryRowIndentation.nativeElement.offsetWidth).toEqual(grid.featureColumnsWidth());
    };

    const verifyBaseSummaries = (fixture) => {
        const summaryRow = GridSummaryFunctions.getRootSummaryRow(fixture);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1,
            ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['8', '17', '847', '2,188', '273.5']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['8']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Earliest', 'Latest'], ['8', 'Dec 18, 2007', 'Dec 9, 2017']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
            ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['8', '25', '50', '293', '36.625']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['8']);
    };

    const verifySummariesForParentID19 = (fixture, vissibleIndex) => {
        const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fixture, vissibleIndex);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '19', '19', '19', '19']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['1']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Earliest', 'Latest'], ['1', 'May 4, 2014', 'May 4, 2014']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '44', '44', '44', '44']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['1']);
    };

    const verifySummariesForParentID147 = (fixture, vissibleIndex) => {
        const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fixture, vissibleIndex);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['3', '147', '147', '441', '147']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['3']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Earliest', 'Latest'], ['3', 'Jul 19, 2009', 'Sep 18, 2014']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
            ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['3', '29', '43', '103', '34.333']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['3']);
    };

    const verifySummariesForParentID17 = (fixture, vissibleIndex) => {
        const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fixture, vissibleIndex);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '17', '17', '34', '17']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['2']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Earliest', 'Latest'], ['2', 'Dec 18, 2007', 'Mar 19, 2016']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '27', '50', '77', '38.5']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['2']);
    };
});

class DealsSummary extends IgxNumberSummaryOperand {
    constructor() {
        super();
    }

    public operate(summaries?: any[]): IgxSummaryResult[] {
        const result = super.operate(summaries).filter((obj) => {
            if (obj.key === 'average' || obj.key === 'sum' || obj.key === 'count') {
                const summaryResult = obj.summaryResult;
                // apply formatting to float numbers
                if (Number(summaryResult) === summaryResult) {
                    obj.summaryResult = summaryResult.toLocaleString('en-us', { maximumFractionDigits: 2 });
                }
                return obj;
            }
        });
        return result;
    }
}

class DealsSummaryMinMax extends IgxNumberSummaryOperand {
    constructor() {
        super();
    }

    public operate(summaries?: any[]): IgxSummaryResult[] {
        const result = super.operate(summaries).filter((obj) => {
            if (obj.key === 'min' || obj.key === 'max') {
                const summaryResult = obj.summaryResult;
                // apply formatting to float numbers
                if (Number(summaryResult) === summaryResult) {
                    obj.summaryResult = summaryResult.toLocaleString('en-us', { maximumFractionDigits: 2 });
                }
                return obj;
            }
        });
        return result;
    }
}

class EarliestSummary extends IgxDateSummaryOperand {
    constructor() {
        super();
    }

    public operate(summaries?: any[]): IgxSummaryResult[] {
        const result = super.operate(summaries).filter((obj) => {
            if (obj.key === 'earliest') {
                const date = obj.summaryResult ? new Date(obj.summaryResult) : undefined;
                obj.summaryResult = date ? new Intl.DateTimeFormat('en-US').format(date) : undefined;
                return obj;
            }
        });
        return result;
    }
}

class InStockSummary extends IgxNumberSummaryOperand {
    constructor() {
        super();
    }

    public operate(summaries: any[], allData = [], field?): IgxSummaryResult[] {
        const result = super.operate(summaries);
        if (field && field === 'UnitsInStock') {
            result.push({
                key: 'test',
                label: 'Items InStock',
                summaryResult: allData.filter((rec) => rec.InStock).length
            });
        }
        return result;
    }
}

class AllDataAvgSummary extends IgxSummaryOperand {
    constructor() {
        super();
    }

    public operate(data: any[], allData = [], fieldName = ''): IgxSummaryResult[] {
        const result = super.operate(data);
        if (fieldName === 'UnitsInStock') {
            result.push({
                key: 'long',
                label: 'Test 1',
                summaryResult: 50
            });
            result.push({
                key: 'long',
                label: 'Test 2',
                summaryResult: 150
            });
        }
        if (fieldName === 'OrderDate') {
            result.push({
                key: 'long',
                label: 'Test 3',
                summaryResult: 850
            });
        }
        return result;
    }
}

@Component({
    template: `
        <igx-grid #grid1 [data]="data" [primaryKey]="'ProductID'" [allowFiltering]="true">
            <igx-column field="ProductID" header="Product ID">
            </igx-column>
            <igx-column field="ProductName" [hasSummary]="true">
            </igx-column>
            <igx-column field="InStock" [dataType]="'boolean'" [hasSummary]="true">
            </igx-column>
            <igx-column field="UnitsInStock" [dataType]="'number'" [hasSummary]="true"  [summaries]="dealsSummary">
            </igx-column>
            <igx-column field="OrderDate" width="200px" [dataType]="'date'" [sortable]="true" [hasSummary]="true"
            [summaries]="earliest">
        </igx-column>
        </igx-grid>
    `
})

export class CustomSummariesComponent {
    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    public grid1: IgxGridComponent;
    public data = SampleTestData.foodProductData();
    public dealsSummary = DealsSummary;
    public dealsSummaryMinMax = DealsSummaryMinMax;
    public earliest = EarliestSummary;
    public inStockSummary = InStockSummary;
    public allDataAvgSummary = AllDataAvgSummary;
}

