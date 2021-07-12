import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTreeGridModule } from './public_api';
import {
    IgxTreeGridSummariesComponent,
    IgxTreeGridSummariesKeyComponent,
    IgxTreeGridCustomSummariesComponent,
    IgxTreeGridSummariesTransactionsComponent,
    IgxTreeGridSummariesScrollingComponent,
    IgxTreeGridSummariesKeyScroliingComponent
} from '../../test-utils/tree-grid-components.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { setupGridScrollDetection } from '../../test-utils/helper-utils.spec';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxTreeGridRowComponent } from './tree-grid-row.component';
import { GridSummaryFunctions, GridFunctions } from '../../test-utils/grid-functions.spec';
import { IgxNumberFilteringOperand } from '../../data-operations/filtering-condition';
import { DebugElement } from '@angular/core';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxSummaryRow, IgxTreeGridRow } from '../grid-public-row';

describe('IgxTreeGrid - Summaries #tGrid', () => {
    configureTestSuite();
    const DEBOUNCETIME = 30;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridSummariesComponent,
                IgxTreeGridSummariesKeyComponent,
                IgxTreeGridCustomSummariesComponent,
                IgxTreeGridSummariesTransactionsComponent,
                IgxTreeGridSummariesScrollingComponent,
                IgxTreeGridSummariesKeyScroliingComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxTreeGridModule]
        }).compileComponents();
    }));

    describe('', () => {
        let fix;
        let treeGrid: IgxTreeGridComponent;
        beforeEach(waitForAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridSummariesKeyComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            setupGridScrollDetection(fix, treeGrid);
        }));

        it('should render summaries for all the rows when have parentKey', () => {
            verifyTreeBaseSummaries(fix);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);
            // Expand second row and verify summaries
            treeGrid.toggleRow(treeGrid.getRowByIndex(1).key);
            fix.detectChanges();

            const secondRow = treeGrid.getRowByIndex(1);
            const thirdRow = treeGrid.getRowByIndex(2);
            const summaryRow = treeGrid.getRowByIndex(4);

            // First row is IgxTreeRow 4thRow is IgxSummaryRow
            expect(secondRow instanceof IgxTreeGridRow).toBe(true);
            expect(thirdRow instanceof IgxTreeGridRow).toBe(true);
            expect(secondRow.index).toBe(1);
            expect(secondRow.viewIndex).toBe(1);
            expect(thirdRow.index).toBe(2);
            expect(thirdRow.viewIndex).toBe(2);

            expect(thirdRow.parent.data).toBe(secondRow.data);
            expect(secondRow.children[0].data).toBe(thirdRow.data);

            expect(summaryRow instanceof IgxSummaryRow).toBe(true);

            verifyTreeBaseSummaries(fix);
            verifySummaryForRow847(fix, 4);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(2);

            // Expand child row and verify summaries
            treeGrid.toggleRow(treeGrid.getRowByIndex(3).key);
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);

            verifyTreeBaseSummaries(fix);
            verifySummaryForRow663(fix, 5);
            verifySummaryForRow847(fix, 6);
        });

        it('should render summaries on top when position is top ', () => {
            treeGrid.summaryPosition = 'top';
            fix.detectChanges();

            verifyTreeBaseSummaries(fix);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);
            // Expand first row and verify summaries
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();

            verifyTreeBaseSummaries(fix);
            verifySummaryForRow147(fix, 1);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(2);

            const firstRow = treeGrid.getRowByIndex(0);
            const summaryRow = treeGrid.getRowByIndex(1);

            // First row is IgxTreeRow 4thRow is IgxSummaryRow
            expect(firstRow instanceof IgxTreeGridRow).toBe(true);
            expect(firstRow.index).toBe(0);
            expect(firstRow.viewIndex).toBe(0);

            expect(summaryRow instanceof IgxSummaryRow).toBe(true);

            // Expand second row and verify summaries
            treeGrid.toggleRow(treeGrid.getRowByIndex(5).key);
            fix.detectChanges();

            verifyTreeBaseSummaries(fix);
            verifySummaryForRow847(fix, 6);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);

            // Expand first row child and verify summaries
            treeGrid.toggleRow(treeGrid.getRowByIndex(4).key);
            fix.detectChanges();

            verifySummaryForRow317(fix, 5);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(4);
        });

        it('should be able to change summaryPosition at runtime', () => {
            treeGrid.expandAll();
            fix.detectChanges();

            verifyTreeBaseSummaries(fix);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);
            let rootSummaryIndex = treeGrid.dataView.length;
            expect(GridSummaryFunctions.getAllVisibleSummariesRowIndexes(fix)).toEqual([6, 7, rootSummaryIndex]);

            treeGrid.summaryPosition = 'top';
            fix.detectChanges();

            verifyTreeBaseSummaries(fix);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(4);

            rootSummaryIndex = treeGrid.dataView.length;
            expect(GridSummaryFunctions.getAllVisibleSummariesRowIndexes(fix)).toEqual([1, 5, 9, rootSummaryIndex]);

            treeGrid.summaryPosition = 'bottom';
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);

            rootSummaryIndex = treeGrid.dataView.length;
            expect(GridSummaryFunctions.getAllVisibleSummariesRowIndexes(fix)).toEqual([6, 7, rootSummaryIndex]);
        });

        it('should be able to change summaryCalculationMode at runtime', async () => {
            treeGrid.expandAll();
            fix.detectChanges();

            verifyTreeBaseSummaries(fix);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);

            let rootSummaryIndex = treeGrid.dataView.length;
            expect(GridSummaryFunctions.getAllVisibleSummariesRowIndexes(fix)).toEqual([6, 7, rootSummaryIndex]);

            treeGrid.summaryCalculationMode = 'rootLevelOnly';
            fix.detectChanges();
            await wait(50);

            verifyTreeBaseSummaries(fix);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);

            treeGrid.summaryCalculationMode = 'childLevelsOnly';
            fix.detectChanges();
            await wait(50);

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(4);
            expect(GridSummaryFunctions.getAllVisibleSummariesRowIndexes(fix)).toEqual([6, 7, 12, 13]);
            const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            expect(summaryRow).toBeNull();

            treeGrid.summaryCalculationMode = 'rootAndChildLevels';
            fix.detectChanges();
            await wait(50);

            verifyTreeBaseSummaries(fix);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);
            rootSummaryIndex = treeGrid.dataView.length;
            expect(GridSummaryFunctions.getAllVisibleSummariesRowIndexes(fix)).toEqual([6, 7, rootSummaryIndex]);
        });

        it('should be able to show/hide summaries for collapsed parent rows runtime', () => {
            treeGrid.summaryCalculationMode = 'childLevelsOnly';
            fix.detectChanges();

            let summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            expect(summaries.length).toBe(0);

            treeGrid.showSummaryOnCollapse = true;
            fix.detectChanges();

            let secondRow = treeGrid.getRowByIndex(1);
            expect(secondRow.index).toEqual(1);
            expect(secondRow.viewIndex).toEqual(1);
            expect(secondRow instanceof IgxSummaryRow).toBe(true);

            summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            expect(summaries.length).toBe(4);

            treeGrid.showSummaryOnCollapse = false;
            fix.detectChanges();

            secondRow = treeGrid.getRowByIndex(1);
            expect(secondRow.index).toEqual(1);
            expect(secondRow.viewIndex).toEqual(1);
            expect(secondRow instanceof IgxSummaryRow).toBe(false);

            summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            expect(summaries.length).toBe(0);
        });

        it('should position correctly summary row for collapsed rows -- bottom position', async () => {
            treeGrid.expandAll();
            fix.detectChanges();

            treeGrid.summaryCalculationMode = 'childLevelsOnly';
            fix.detectChanges();
            await wait(30);

            let summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            expect(summaries.length).toBe(4);

            treeGrid.showSummaryOnCollapse = true;
            fix.detectChanges();
            await wait(30);

            treeGrid.toggleRow(treeGrid.getRowByIndex(3).key);
            fix.detectChanges();

						const gridSummaryRow = treeGrid.getRowByIndex(4);
						expect(gridSummaryRow.index).toEqual(4);
						expect(gridSummaryRow.viewIndex).toEqual(4);
						expect(gridSummaryRow instanceof IgxSummaryRow).toBe(true);

            summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            expect(summaries.length).toBe(4);

            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 4);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2,
                ['Count', 'Earliest', 'Latest'], ['2', 'Nov 11, 2009', 'Oct 17, 2015']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 5);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2,
                ['Count', 'Earliest', 'Latest'], ['3', 'Jul 19, 2009', 'Sep 18, 2014']);

            treeGrid.summaryPosition = 'top';
            fix.detectChanges();

            summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            expect(summaries.length).toBe(4);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 1);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2,
                ['Count', 'Earliest', 'Latest'], ['3', 'Jul 19, 2009', 'Sep 18, 2014']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 5);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2,
                ['Count', 'Earliest', 'Latest'], ['2', 'Nov 11, 2009', 'Oct 17, 2015']);
        });

        it('should position correctly summary row for collapsed rows -- top position', async () => {
            treeGrid.expandAll();
            fix.detectChanges();

            treeGrid.summaryCalculationMode = 'childLevelsOnly';
            fix.detectChanges();
            await wait(30);

            treeGrid.showSummaryOnCollapse = true;
            fix.detectChanges();
            await wait(30);

            let summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            expect(summaries.length).toBe(4);

            treeGrid.toggleRow(treeGrid.getRowByIndex(3).key);
            fix.detectChanges();

            treeGrid.summaryPosition = 'top';
            fix.detectChanges();

            summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            expect(summaries.length).toBe(4);

            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 1);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2,
                ['Count', 'Earliest', 'Latest'], ['3', 'Jul 19, 2009', 'Sep 18, 2014']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 5);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2,
                ['Count', 'Earliest', 'Latest'], ['2', 'Nov 11, 2009', 'Oct 17, 2015']);
        });

        it('should be able to enable/disable summaries at runtime', () => {
            treeGrid.expandAll();
            fix.detectChanges();

            treeGrid.getColumnByName('Age').hasSummary = false;
            fix.detectChanges();

            GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 3);

            let summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            summaries.forEach(summary => {
                GridSummaryFunctions.verifyColumnSummaries(summary, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 1, ['Count'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 2, ['Count', 'Earliest', 'Latest'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 3, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 4, ['Count'], []);
            });

            // Disable all summaries
            treeGrid.getColumnByName('Name').hasSummary = false;
            treeGrid.getColumnByName('HireDate').hasSummary = false;
            treeGrid.getColumnByName('OnPTO').hasSummary = false;
            fix.detectChanges();
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(0);

            treeGrid.collapseAll();
            fix.detectChanges();

            treeGrid.getColumnByName('Name').hasSummary = true;
            fix.detectChanges();

            treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(2);
            summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            summaries.forEach(summary => {
                GridSummaryFunctions.verifyColumnSummaries(summary, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 1, ['Count'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 2, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 3, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 4, [], []);
            });
            GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 1);
        });

        it('should be able to enable/disable summaries with API', () => {
            treeGrid.disableSummaries([{ fieldName: 'Age' }, { fieldName: 'HireDate' }]);
            fix.detectChanges();

            GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 1);

            treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();

            let summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            summaries.forEach(summary => {
                GridSummaryFunctions.verifyColumnSummaries(summary, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 1, ['Count'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 2, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 3, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 4, ['Count'], []);
            });

            GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 1);

            treeGrid.disableSummaries('Name');
            treeGrid.disableSummaries('OnPTO');
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(0);

            treeGrid.enableSummaries('HireDate');
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(2);

            GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 3);

            summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            summaries.forEach(summary => {
                GridSummaryFunctions.verifyColumnSummaries(summary, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 1, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 2, ['Count', 'Earliest', 'Latest'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 3, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 4, [], []);
            });

            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 4);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2,
                ['Count', 'Earliest', 'Latest'], ['3', 'Jul 19, 2009', 'Sep 18, 2014']);

            treeGrid.enableSummaries([{ fieldName: 'Age' }, { fieldName: 'ID' }]);
            fix.detectChanges();

            GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 5);

            summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            summaries.forEach(summary => {
                GridSummaryFunctions.verifyColumnSummaries(summary, 0, ['Count', 'Min', 'Max', 'Sum', 'Avg'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 1, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 2, ['Count', 'Earliest', 'Latest'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 4, [], []);
            });

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 4);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['3', '29', '43', '103', '34.333']);

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['4', '42', '61', '207', '51.75']);
        });

        it('should be able to change summary operant at runtime', () => {
            treeGrid.expandAll();
            fix.detectChanges();

            GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 5);

            treeGrid.getColumnByName('Age').summaries = fix.componentInstance.ageSummaryTest;
            fix.detectChanges();

            GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 6);

            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Min', 'Max', 'Sum', 'Avg', 'Test'], ['3', '29', '43', '103', '34.333333333333336', '2']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Min', 'Max', 'Sum', 'Avg', 'Test'], ['2', '35', '44', '79', '39.5', '1']);

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Min', 'Max', 'Sum', 'Avg', 'Test'], ['4', '42', '61', '207', '51.75', '0']);
        });

        it('should be able to change summary operant with API', () => {
            treeGrid.expandAll();
            fix.detectChanges();

            GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 5);

            treeGrid.enableSummaries([{ fieldName: 'Age', customSummary: fix.componentInstance.ageSummary }]);
            fix.detectChanges();

            GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 3);

            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['3', '103', '34.33']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['2', '79', '39.5']);

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['4', '207', '51.75']);
        });

        it('Hiding: should render correct summaries when show/hide a column', () => {
            treeGrid.expandAll();
            fix.detectChanges();

            treeGrid.getColumnByName('Age').hidden = true;
            fix.detectChanges();

            let summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            summaries.forEach(summary => {
                GridSummaryFunctions.verifyColumnSummaries(summary, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 1, ['Count'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 2, ['Count', 'Earliest', 'Latest'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 3, ['Count'], []);
            });

            GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 3);

            treeGrid.getColumnByName('Name').hidden = true;
            treeGrid.getColumnByName('HireDate').hidden = true;
            treeGrid.getColumnByName('OnPTO').hidden = true;
            fix.detectChanges();
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(0);

            treeGrid.getColumnByName('HireDate').hidden = false;
            treeGrid.getColumnByName('OnPTO').hidden = false;
            fix.detectChanges();

            summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
            summaries.forEach(summary => {
                GridSummaryFunctions.verifyColumnSummaries(summary, 0, [], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 1, ['Count', 'Earliest', 'Latest'], []);
                GridSummaryFunctions.verifyColumnSummaries(summary, 2, ['Count'], []);
            });

            GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 3);

            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['3']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['2']);

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count'], ['4']);
        });

        it('Filtering: should render correct summaries when filter and found only children', fakeAsync(() => {
            treeGrid.filter('ID', 12, IgxNumberFilteringOperand.instance().condition('lessThanOrEqualTo'));
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(2);
            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 2);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2,
                ['Count', 'Earliest', 'Latest'], ['1', 'Dec 18, 2007', 'Dec 18, 2007']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '50', '50', '50', '50']);

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            verifySummaryIsEmpty(summaryRow);
        }));

        it('Filtering: should render correct summaries when filter and no results are found', fakeAsync(() => {
            treeGrid.filter('ID', 0, IgxNumberFilteringOperand.instance().condition('lessThanOrEqualTo'));
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);
            const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            verifySummaryIsEmpty(summaryRow);
        }));

        it('Filtering: should render correct summaries when filter', fakeAsync(() => {
            treeGrid.filter('ID', 17, IgxNumberFilteringOperand.instance().condition('lessThanOrEqualTo'));
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);

            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 5);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2,
                ['Count', 'Earliest', 'Latest'], ['1', 'Dec 18, 2007', 'Dec 18, 2007']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '50', '50', '50', '50']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 2);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['1', 'May 4, 2014', 'May 4, 2014']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '44', '44', '44', '44']);

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '61', '61', '61', '61']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['1', 'Feb 1, 2010', 'Feb 1, 2010']);
        }));

        it('Paging: should render correct summaries when paging is enable and position is bottom', fakeAsync(() => {
            fix.componentInstance.paging = true;
            fix.detectChanges();
            treeGrid.perPage = 4;
            fix.detectChanges();
            tick(16);

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);
            verifyTreeBaseSummaries(fix);

            treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();
            tick(16);

            let summaryRow = treeGrid.getRowByIndex(4);
            expect(summaryRow.index).toEqual(4);
            expect(summaryRow.viewIndex).toEqual(4);
            expect(summaryRow instanceof IgxSummaryRow).toBe(true);

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(2);
            verifyTreeBaseSummaries(fix);
            verifySummaryForRow147(fix, 4);

            treeGrid.toggleRow(treeGrid.getRowByIndex(3).key);
            fix.detectChanges();
            tick(16);

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);

            treeGrid.page = 1;
            fix.detectChanges();
            tick(16);

            // TODO FIX
            const firstRow = treeGrid.getRowByIndex(0);
            summaryRow = treeGrid.getRowByIndex(2);
            expect(firstRow.index).toEqual(0);
            expect(firstRow.viewIndex).toEqual(4);
            expect(summaryRow.index).toEqual(2);
            expect(summaryRow.viewIndex).toEqual(6);
            expect(summaryRow instanceof IgxSummaryRow).toBe(true);

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);
            verifyTreeBaseSummaries(fix);
            verifySummaryForRow147(fix, 3);
            verifySummaryForRow317(fix, 2);
        }));

        it('Paging: should render correct summaries when paging is enable and position is top', fakeAsync(() => {
            fix.componentInstance.paging = true;
            fix.detectChanges();
            treeGrid.perPage = 4;
            treeGrid.summaryPosition = 'top';
            fix.detectChanges();
            tick(16);

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);
            verifyTreeBaseSummaries(fix);

            treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(2);
            verifyTreeBaseSummaries(fix);
            verifySummaryForRow147(fix, 1);

            treeGrid.toggleRow(treeGrid.getRowByIndex(4).key);
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);
            verifySummaryForRow317(fix, 5);
            verifySummaryForRow147(fix, 1);

            treeGrid.page = 1;
            fix.detectChanges();
            tick(16);

            const firstRow = treeGrid.getRowByIndex(0);
            expect(firstRow.index).toEqual(0);
            expect(firstRow.viewIndex).toEqual(5);

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);
            verifyTreeBaseSummaries(fix);

            treeGrid.toggleRow(treeGrid.getRowByIndex(2).key);
            fix.detectChanges();

            const summaryRow = treeGrid.getRowByIndex(3);
            expect(summaryRow.index).toEqual(3);
            expect(summaryRow.viewIndex).toEqual(8);
            expect(summaryRow instanceof IgxSummaryRow).toBe(true);

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(2);
            verifySummaryForRow847(fix, 3);
        }));

        it('CRUD: Add root node', () => {
            treeGrid.expandAll();
            fix.detectChanges();

            const newRow = {
                ID: 777,
                ParentID: -1,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19
            };
            treeGrid.addRow(newRow);
            fix.detectChanges();

            const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['5']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2,
                ['Count', 'Earliest', 'Latest'], ['5', 'Apr 20, 2008', 'Apr 3, 2019']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['5', '19', '61', '226', '45.2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['5']);

            verifySummaryForRow147(fix, 7);
        });

        it('CRUD: Add child node', () => {
            treeGrid.expandAll();
            fix.detectChanges();

            const newRow = {
                ID: 777,
                ParentID: 147,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19
            };
            treeGrid.addRow(newRow);
            fix.detectChanges();

            const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 8);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2,
                ['Count', 'Earliest', 'Latest'], ['4', 'Jul 19, 2009', 'Apr 3, 2019']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['4']);

            verifyTreeBaseSummaries(fix);
        });

        it('CRUD: add child row whick contains null or undefined values', () => {
            treeGrid.expandAll();
            fix.detectChanges();

            const newRow = {
                ID: 777,
                ParentID: 475,
                Name: 'New Employee',
                HireDate: undefined,
                Age: null
            };
            expect(() => {
                treeGrid.addRow(newRow);
                fix.detectChanges();
            }).not.toThrow();

            const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['1', '', '']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '0', '0', '0', '0']);

            verifyTreeBaseSummaries(fix);
        });

        it('CRUD: delete root node', () => {
            treeGrid.expandAll();
            fix.detectChanges();

            treeGrid.deleteRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();

            const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2,
                ['Count', 'Earliest', 'Latest'], ['3', 'Feb 1, 2010', 'Feb 22, 2014']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['3', '42', '61', '152', '50.667']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['3']);

            verifySummaryForRow847(fix, 5);
        });

        it('CRUD: delete all root nodes', () => {
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();

            treeGrid.toggleRow(treeGrid.getRowByIndex(5).key);
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);

            treeGrid.deleteRow(treeGrid.getRowByIndex(5).key);
            fix.detectChanges();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(2);

            treeGrid.deleteRow(treeGrid.getRowByIndex(5).key);
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);

            treeGrid.deleteRow(treeGrid.getRowByIndex(5).key);
            fix.detectChanges();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['1']);

            treeGrid.deleteRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);
            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            verifySummaryIsEmpty(summaryRow);
        });

        it('CRUD: delete child node', () => {
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();

            treeGrid.toggleRow(treeGrid.getRowByIndex(3).key);
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);

            treeGrid.deleteRow(treeGrid.getRowByIndex(3).key);
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(2);
            verifyTreeBaseSummaries(fix);

            const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2,
                ['Count', 'Earliest', 'Latest'], ['2', 'Jul 19, 2009', 'Jul 3, 2011']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '29', '43', '72', '36']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['2']);

            treeGrid.deleteRow(treeGrid.getRowByIndex(2).key);
            fix.detectChanges();

            treeGrid.deleteRow(treeGrid.getRowByIndex(1).key);
            fix.detectChanges();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);
            verifyTreeBaseSummaries(fix);
        });

        it('CRUD: Update root node', () => {
            const newRow = {
                ID: 147,
                ParentID: -1,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19
            };
            treeGrid.getRowByKey(147).update(newRow);
            fix.detectChanges();

            const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['4', 'Feb 1, 2010', 'Apr 3, 2019']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['4', '19', '61', '171', '42.75']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['4']);
        });

        it('CRUD: Update child node', () => {
            treeGrid.toggleRow(treeGrid.getRowByIndex(1).key);
            fix.detectChanges();

            treeGrid.toggleRow(treeGrid.getRowByIndex(3).key);
            fix.detectChanges();

            const newRow = {
                ID: 663,
                ParentID: 847,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19
            };
            treeGrid.getRowByKey(663).update(newRow);
            fix.detectChanges();

            verifyTreeBaseSummaries(fix);

            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['2', 'May 4, 2014', 'Apr 3, 2019']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '19', '44', '63', '31.5']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['2']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 5);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['1']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2,
                ['Count', 'Earliest', 'Latest'], ['1', 'Apr 22, 2010', 'Apr 22, 2010']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '39', '39', '39', '39']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['1']);
        });
    });

    describe('CRUD with transactions', () => {
        let fix;
        let treeGrid;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridSummariesTransactionsComponent);
            fix.detectChanges();
            tick(16);
            treeGrid = fix.componentInstance.treeGrid;
            setupGridScrollDetection(fix, treeGrid);
            tick(16);
        }));

        it('Delete root node', fakeAsync(() => {
            treeGrid.toggleRow(847);
            fix.detectChanges();

            treeGrid.deleteRow(847);
            fix.detectChanges();
            tick();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['49', '61']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['3']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 4);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['0']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['0', '0']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['0']);

            // Undo transactions
            treeGrid.transactions.undo();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['42', '61']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['4']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 4);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['25', '44']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['2']);

            // Redo transactions
            treeGrid.transactions.redo();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['49', '61']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['3']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 4);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['0']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['0', '0']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['0']);

            // Commit transactions
            treeGrid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();
            tick();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);
            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
        }));

        it('Delete a root node with cascadeOnDelete set to false', fakeAsync(() => {
            treeGrid.cascadeOnDelete = false;
            treeGrid.expandAll();
            fix.detectChanges();

            treeGrid.deleteRow(147);
            fix.detectChanges();
            tick();

            // Verify summary is updated
            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);

            // Commit transactions
            treeGrid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['6']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 5);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
        }));

        it('Delete child node', fakeAsync(() => {
            treeGrid.deleteRow(317);
            fix.detectChanges();
            tick();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);

            treeGrid.expandAll();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['0']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['0', '0']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['0']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);

            // Undo transactions
            treeGrid.transactions.undo();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);
            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);

            // Redo transactions
            treeGrid.transactions.redo();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['0']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['0', '0']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['0']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);

            // Clear transactions
            treeGrid.transactions.clear();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
        }));

        it('Delete child node cascadeOnDelete set to false', fakeAsync(() => {
            treeGrid.cascadeOnDelete = false;
            treeGrid.expandAll();
            fix.detectChanges();

            treeGrid.deleteRow(317);
            fix.detectChanges();
            tick();

            // Verify summaries are not changed
            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);

            // Commit
            treeGrid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['6']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
        }));

        it('Add root node', fakeAsync(() => {
            const newRow = {
                ID: 11,
                ParentID: -1,
                Name: 'New Employee',
                HireDate: new Date(1984, 3, 3),
                Age: 70
            };
            treeGrid.addRow(newRow);
            fix.detectChanges();
            tick();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['5']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['42', '70']);

            // Undo transactions
            treeGrid.transactions.undo();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['42', '61']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['4']);

            // Redo transactions
            treeGrid.transactions.redo();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['5']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['42', '70']);

            // Commit transactions
            treeGrid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();
            tick();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);
            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['5']);
        }));

        it('Add child node', fakeAsync(() => {
            const newRow = {
                ID: 11,
                ParentID: 317,
                Name: 'New Employee',
                HireDate: new Date(1984, 3, 3),
                Age: 70
            };
            treeGrid.addRow(newRow);
            fix.detectChanges();
            tick();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);

            treeGrid.expandAll();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['35', '70']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 8);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);

            // Undo transactions
            treeGrid.transactions.undo();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['35', '44']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);

            // Redo transactions
            treeGrid.transactions.redo();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['35', '70']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 8);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
        }));

        it('Update root node', fakeAsync(() => {
            const newRow = {
                ID: 847,
                ParentID: -1,
                Name: 'New Employee',
                HireDate: new Date(1984, 3, 3),
                Age: 13
            };
            treeGrid.updateRow(newRow, 847);
            fix.detectChanges();
            tick();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['13', '61']);

            // Undo transactions
            treeGrid.transactions.undo();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['42', '61']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['4']);

            // Redo transactions
            treeGrid.transactions.redo();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['13', '61']);

            // Commit transactions
            treeGrid.transactions.commit(fix.componentInstance.data);
            fix.detectChanges();
            tick();

            expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);
            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);
        }));

        it('Update child node', fakeAsync(() => {
            const newRow = {
                ID: 317,
                ParentID: 147,
                Name: 'New Employee',
                HireDate: new Date(1984, 3, 3),
                Age: 13
            };
            treeGrid.updateRow(newRow, 317);
            fix.detectChanges();
            tick();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['42', '61']);

            treeGrid.expandAll();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['35', '44']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['13', '43']);

            // Undo transactions
            treeGrid.transactions.undo();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['35', '44']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['29', '43']);

            // Redo transactions
            treeGrid.transactions.redo();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['35', '44']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['13', '43']);
        }));

        it('Update child node and change tree structure', fakeAsync(() => {
            treeGrid.expandAll();
            fix.detectChanges();

            const newRow = {
                ID: 317,
                ParentID: -1,
                Name: 'New Employee',
                HireDate: new Date(1984, 3, 3),
                Age: 13
            };
            treeGrid.getRowByKey(317).update(newRow);
            fix.detectChanges();
            tick();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['5']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['13', '61']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['29', '43']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['35', '44']);

            // Undo transactions
            treeGrid.transactions.undo();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['35', '44']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['29', '43']);

            // Redo transactions
            treeGrid.transactions.redo();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['5']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['13', '61']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['29', '43']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['35', '44']);

            // Clear transactions
            treeGrid.transactions.clear();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['35', '44']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['29', '43']);
        }));

        it('Update cell', fakeAsync(() => {
            treeGrid.summaryPosition = 'top';
            treeGrid.expandAll();
            fix.detectChanges();
            tick();

            treeGrid.updateCell(-1, 147, 'Age');
            const cell = treeGrid.getCellByColumn(4, 'Age');
            cell.update(100);
            fix.detectChanges();
            tick();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['-1', '61']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 1);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['29', '100']);

            // Clear transactions
            treeGrid.transactions.clear();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['42', '61']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 1);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['29', '43']);
        }));

        it('Update cell and change tree grid structure', fakeAsync(() => {
            treeGrid.summaryPosition = 'top';
            treeGrid.expandAll();
            fix.detectChanges();
            tick();

            treeGrid.updateCell(317, 17, 'ParentID');
            fix.detectChanges();
            tick();

            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['42', '55']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 1);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 5);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['35', '61']);

            // Undo transactions
            treeGrid.transactions.undo();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 5);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['35', '44']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 1);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['29', '43']);

            // Redo transactions
            treeGrid.transactions.redo();
            fix.detectChanges();
            tick();

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['42', '55']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 1);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 5);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['35', '61']);
        }));
    });

    describe('Keyboard Navigation', () => {
        let fix;
        let treeGrid;
        let gridContent: DebugElement;
        let gridFooter: DebugElement;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridSummariesKeyScroliingComponent);
            fix.detectChanges();
            tick(16);
            treeGrid = fix.componentInstance.treeGrid;
            gridContent = GridFunctions.getGridContent(fix);
            gridFooter = GridFunctions.getGridFooter(fix);
            setupGridScrollDetection(fix, treeGrid);
            tick(16);
        }));

        it('should be able to select root summaries with arrow keys', async () => {
            let summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            const summaryCell = GridSummaryFunctions.getSummaryCellByVisibleIndex(summaryRow, 0);
            UIInteractions.simulateClickAndSelectEvent(summaryCell);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            for (let i = 0; i < 5; i++) {
                GridSummaryFunctions.verifySummaryCellActive(fix, summaryRow, i);
                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridFooter);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridFooter);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            GridSummaryFunctions.verifySummaryCellActive(fix, summaryRow, 5);

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['4', '42', '61', '207', '51.75']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['4']);

            for (let i = 5; i > 0; i--) {
                GridSummaryFunctions.verifySummaryCellActive(fix, summaryRow, i);
                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridFooter);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridFooter);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            GridSummaryFunctions.verifySummaryCellActive(fix, summaryRow, 0);

            summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['4', '-1', '-1', '-4', '-1']);
        });

        it('Verify first summary cell is activated when focus footer', () => {
            gridFooter.triggerEventHandler('focus', {});
            fix.detectChanges();

            const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            GridSummaryFunctions.verifySummaryCellActive(fix, summaryRow, 0);
        });

        it('should be able to navigate with Arrow keys and Ctrl', async () => {
            const summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
            const summaryCell = GridSummaryFunctions.getSummaryCellByVisibleIndex(summaryRow, 0);
            UIInteractions.simulateClickAndSelectEvent(summaryCell);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridFooter, false, false, true);
            await wait(100);
            fix.detectChanges();

            GridSummaryFunctions.verifySummaryCellActive(fix, summaryRow, 5);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['4', '42', '61', '207', '51.75']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['4']);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridFooter, false, false, true);
            await wait(100);
            fix.detectChanges();
            GridSummaryFunctions.verifySummaryCellActive(fix, summaryRow, 0);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['4', '-1', '-1', '-4', '-1']);
        });

        it('Should be able to select child summaries with arrow keys', async () => {
            treeGrid.expandAll();
            treeGrid.summaryPosition = 'top';
            fix.detectChanges();

            const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 1);
            const summaryCell = GridSummaryFunctions.getSummaryCellByVisibleIndex(summaryRow, 0);
            UIInteractions.simulateClickAndSelectEvent(summaryCell);
            fix.detectChanges();

            for (let i = 0; i < 5; i++) {
                GridSummaryFunctions.verifySummaryCellActive(fix, 1, i);
                UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['3', '29', '43', '103', '34.333']);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['3']);

            for (let i = 5; i > 0; i--) {
                GridSummaryFunctions.verifySummaryCellActive(fix, 1, i);
                UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            }

            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['3', '147', '147', '441', '147']);
        });

        it('Should not change active summary cell when press Ctrl+ArrowUp/Down', async () => {
            treeGrid.expandAll();
            fix.detectChanges();

            const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            const summaryCell = GridSummaryFunctions.getSummaryCellByVisibleIndex(summaryRow, 1);
            UIInteractions.simulateClickAndSelectEvent(summaryCell);
            fix.detectChanges();

            GridSummaryFunctions.verifySummaryCellActive(fix, 6, 1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            GridSummaryFunctions.verifySummaryCellActive(fix, 6, 1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            GridSummaryFunctions.verifySummaryCellActive(fix, 6, 1);
        });

        it('Should not change active summary cell when press Arrow Down and it is last summary row', async () => {
            treeGrid.expandAll();
            fix.detectChanges();

            treeGrid.verticalScrollContainer.scrollTo(treeGrid.dataView.length - 1);
            await wait(100);
            fix.detectChanges();

            GridSummaryFunctions.focusSummaryCell(fix, 24, 1);
            GridSummaryFunctions.verifySummaryCellActive(fix, 24, 1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            GridSummaryFunctions.verifySummaryCellActive(fix, 24, 1);
        });

        it('Should be able to navigate with Arrow keys Left/Right and Ctrl on a child summary', async () => {
            treeGrid.expandAll();
            fix.detectChanges();

            GridSummaryFunctions.focusSummaryCell(fix, 6, 1);
            await wait(DEBOUNCETIME);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent, false, false, true);
            await wait(100);
            fix.detectChanges();

            GridSummaryFunctions.verifySummaryCellActive(fix, 6, 5);
            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 5, ['Count'], ['2']);

            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent, false, false, true);
            await wait(100);
            fix.detectChanges();
            GridSummaryFunctions.verifySummaryCellActive(fix, 6, 0);

            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1,
                ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '317', '317', '634', '317']);
        });

        it('Should navigate with arrow keys from treeGrid cell to summary row ', () => {
            treeGrid.expandAll();
            treeGrid.summaryPosition = 'top';
            fix.detectChanges();

            let cell = treeGrid.getCellByColumn(0, 'ID');
           UIInteractions.simulateClickAndSelectEvent(cell);
            fix.detectChanges();

            expect(cell.selected).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(0, 'ID');
            expect(cell.selected).toBe(true);
            GridSummaryFunctions.verifySummaryCellActive(fix, 1, 0);

            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(0, 'ID');
            expect(cell.selected).toBe(true);
            GridSummaryFunctions.verifySummaryCellActive(fix, 1, 1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(2, 'ParentID');
            expect(cell.selected).toBe(true);
            GridSummaryFunctions.verifySummaryCellActive(fix, 1, 1, false);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(2, 'ParentID');
            expect(cell.selected).toBe(true);
            GridSummaryFunctions.verifySummaryCellActive(fix, 1, 1);

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent);
            fix.detectChanges();

            cell = treeGrid.getCellByColumn(2, 'ParentID');
            expect(cell.selected).toBe(false);
            cell = treeGrid.getCellByColumn(0, 'ParentID');
            expect(cell.selected).toBe(true);
            GridSummaryFunctions.verifySummaryCellActive(fix, 1, 1, false);
        });
    });

    it('should render correct custom summaries', fakeAsync(/** height/width setter rAF */() => {
        const fix = TestBed.createComponent(IgxTreeGridCustomSummariesComponent);
        fix.detectChanges();
        const treeGrid = fix.componentInstance.treeGrid;
        treeGrid.expandAll();
        fix.detectChanges();

        GridSummaryFunctions.verifyVisibleSummariesHeight(fix, 3);

        let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['3', '103', '34.33']);

        summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['2', '79', '39.5']);

        summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['4', '207', '51.75']);
    }));

    it('should render summaries for all the rows', fakeAsync(/** height/width setter rAF */() => {
        const fix = TestBed.createComponent(IgxTreeGridSummariesComponent);
        fix.detectChanges();
        const treeGrid = fix.componentInstance.treeGrid;

        verifyTreeBaseSummaries(fix);
        expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(1);

        treeGrid.toggleRow(treeGrid.getRowByIndex(1).key);
        fix.detectChanges();

        verifyTreeBaseSummaries(fix);
        verifySummaryForRow847(fix, 4);
        expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(2);

        treeGrid.toggleRow(treeGrid.getRowByIndex(3).key);
        fix.detectChanges();

        expect(GridSummaryFunctions.getAllVisibleSummariesLength(fix)).toEqual(3);

        verifyTreeBaseSummaries(fix);
        verifySummaryForRow663(fix, 5);
        verifySummaryForRow847(fix, 6);
    }));

    it('should be able to access alldata from each summary', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxTreeGridCustomSummariesComponent);
        fix.detectChanges();
        const treeGrid = fix.componentInstance.treeGrid;

        treeGrid.expandAll();
        fix.detectChanges();

        let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
        summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
        summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);

        treeGrid.getColumnByName('Name').summaries = fix.componentInstance.ptoSummary;
        tick();
        fix.detectChanges();

        summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'People on PTO'], ['2', '1']);
        summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'People on PTO'], ['3', '1']);
        summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'People on PTO'], ['4', '0']);

        treeGrid.getCellByColumn(5, 'OnPTO').update(true);
        tick();
        fix.detectChanges();

        summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 6);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'People on PTO'], ['2', '2']);
        summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 7);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'People on PTO'], ['3', '1']);
        summaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count', 'People on PTO'], ['4', '0']);
    }));

    it('should render rows correctly after collapse and expand', async () => {
        const fix = TestBed.createComponent(IgxTreeGridSummariesScrollingComponent);
        const treeGrid = fix.componentInstance.treeGrid;
        setupGridScrollDetection(fix, treeGrid);
        fix.detectChanges();
        await wait(16);

        (treeGrid as any).scrollTo(23, 0, 0);
        fix.detectChanges();
        await wait(16);
        fix.detectChanges();

        let row = treeGrid.getRowByKey(15);
        (row as IgxTreeGridRowComponent).expanded = false;
        fix.detectChanges();
        await wait(16);
        fix.detectChanges();

        row = treeGrid.getRowByKey(15);
        (row as IgxTreeGridRowComponent).expanded = true;
        fix.detectChanges();
        await wait(16);
        fix.detectChanges();

        expect(treeGrid.dataRowList.length).toEqual(10);
    });

    const verifySummaryForRow147 = (fixture, visibleIndex) => {
        const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fixture, visibleIndex);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['3', 'Jul 19, 2009', 'Sep 18, 2014']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3,
            ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['3', '29', '43', '103', '34.333']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['3']);
    };

    const verifySummaryForRow317 = (fixture, visibleIndex) => {
        const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fixture, visibleIndex);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['2', 'Nov 11, 2009', 'Oct 17, 2015']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '35', '44', '79', '39.5']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['2']);
    };

    const verifySummaryForRow847 = (fixture, visibleIndex) => {
        const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fixture, visibleIndex);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['2', 'May 4, 2014', 'Dec 9, 2017']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '25', '44', '69', '34.5']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['2']);
    };

    const verifySummaryForRow663 = (fixture, visibleIndex) => {
        const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fixture, visibleIndex);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['1']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['1', 'Apr 22, 2010', 'Apr 22, 2010']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '39', '39', '39', '39']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['1']);
    };

    const verifySummaryIsEmpty = (summaryRow) => {
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['0']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['0', '', '']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['0', '0', '0', '0', '0']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['0']);
    };

    const verifyTreeBaseSummaries = (fixture) => {
        const summaryRow = GridSummaryFunctions.getRootSummaryRow(fixture);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, [], []);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['4', 'Apr 20, 2008', 'Feb 22, 2014']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['4', '42', '61', '207', '51.75']);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, 4, ['Count'], ['4']);
    };
});
