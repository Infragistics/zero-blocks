import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxTreeGridModule } from './public_api';
import { TreeGridFunctions, CELL_VALUE_DIV_CSS_CLASS } from '../../test-utils/tree-grid-functions.spec';
import {
    IgxTreeGridSearchComponent,
    IgxTreeGridPrimaryForeignKeyComponent,
    IgxTreeGridSummariesScrollingComponent } from '../../test-utils/tree-grid-components.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { wait } from '../../test-utils/ui-interactions.spec';

const HIGHLIGHT_CLASS = 'igx-highlight';
const ACTIVE_CLASS = 'igx-highlight__active';

describe('IgxTreeGrid - search API #tGrid', () => {
    configureTestSuite();
    let fix;
    let fixNativeElement;
    let treeGrid: IgxTreeGridComponent;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridSearchComponent,
                IgxTreeGridPrimaryForeignKeyComponent,
                IgxTreeGridSummariesScrollingComponent
            ],
            imports: [IgxTreeGridModule, NoopAnimationsModule]
        }).compileComponents();
    }));

    describe('Child Collection', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridSearchComponent);
            fix.detectChanges();
            tick(16);
            fixNativeElement = fix.debugElement.nativeElement;
            treeGrid = fix.componentInstance.treeGrid;

            treeGrid.getColumnByName('JobTitle').autosize();
            fix.detectChanges();
            tick(16);
        }));

        it('Search highlights should work within tree cell', () => {
            let actualCount = treeGrid.findNext('ev');

            // Verify total number of occurrences in treeGrid.
            verifySearchResult(fixNativeElement, 10, 0, actualCount);

            // Verify occurrences within a tree cell
            const treeCell = TreeGridFunctions.getTreeCell(TreeGridFunctions.getAllRows(fix)[1]);
            expect(getHighlightedCellValue(treeCell.nativeElement)).toBe('Software Developer Evangelist');

            // Active highlight is in second tree cell.
            let spans = getHighlightSpans(treeCell.nativeElement);
            let activeSpan = getActiveSpan(treeCell.nativeElement);
            expect(spans.length).toBe(2);
            expect(activeSpan).toBe(spans[0]);

            // Find next
            actualCount = treeGrid.findNext('ev');

            // Active highlight is still in second tree cell.
            spans = getHighlightSpans(treeCell.nativeElement);
            activeSpan = getActiveSpan(treeCell.nativeElement);
            expect(spans.length).toBe(2);
            expect(activeSpan).toBe(spans[1]);

            // Find next
            actualCount = treeGrid.findNext('ev');

            // Active highlight is no longer in the second tree cell.
            spans = getHighlightSpans(treeCell.nativeElement);
            activeSpan = getActiveSpan(treeCell.nativeElement);
            expect(spans.length).toBe(2);
            expect(activeSpan).not.toBe(spans[0]);
            expect(activeSpan).not.toBe(spans[1]);

            const othertreeCell = TreeGridFunctions.getTreeCell(TreeGridFunctions.getAllRows(fix)[2]);
            expect(getHighlightedCellValue(othertreeCell.nativeElement)).toBe('Junior Software Developer');

            // Active highlight is now in the third tree cell.
            spans = getHighlightSpans(othertreeCell.nativeElement);
            activeSpan = getActiveSpan(othertreeCell.nativeElement);
            expect(spans.length).toBe(1);
            expect(activeSpan).toBe(spans[0]);
        });

        it('Search highlights should work for root and child rows', () => {
            let actualCount = treeGrid.findNext('Software Developer');
            verifySearchResult(fixNativeElement, 6, 0, actualCount);

            actualCount = treeGrid.findNext('Software Developer');
            verifySearchResult(fixNativeElement, 6, 1, actualCount);

            actualCount = treeGrid.findPrev('Software Developer');
            verifySearchResult(fixNativeElement, 6, 0, actualCount);

            actualCount = treeGrid.findNext('Software Developer');
            verifySearchResult(fixNativeElement, 6, 1, actualCount);

            actualCount = treeGrid.findNext('Software Developer');
            verifySearchResult(fixNativeElement, 6, 2, actualCount);

            actualCount = treeGrid.findPrev('Software Developer');
            verifySearchResult(fixNativeElement, 6, 1, actualCount);
        });
    });

    describe('Primary/Foreign key', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
            fix.detectChanges();
            tick(16);
            fixNativeElement = fix.debugElement.nativeElement;
            treeGrid = fix.componentInstance.treeGrid;
        }));

        it('Search highlights should work for tree cells', () => {
            treeGrid.findNext('1');
            fix.detectChanges();

            const cell = TreeGridFunctions.getCell(fix, 0, 'ID').nativeElement;
            const highlights = getHighlightSpans(cell);
            const activeHighlight = getActiveSpan(cell);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).not.toBeNull();
            expect(getHighlightedCellValue(cell)).toBe('1');
        });

        it('Search highlights should work for root and child rows', () => {
            let actualCount = treeGrid.findNext('re');
            verifySearchResult(fixNativeElement, 7, 0, actualCount);

            actualCount = treeGrid.findNext('re');
            verifySearchResult(fixNativeElement, 7, 1, actualCount);

            actualCount = treeGrid.findPrev('re');
            verifySearchResult(fixNativeElement, 7, 0, actualCount);

            actualCount = treeGrid.findNext('re');
            verifySearchResult(fixNativeElement, 7, 1, actualCount);

            actualCount = treeGrid.findNext('re');
            verifySearchResult(fixNativeElement, 7, 2, actualCount);

            actualCount = treeGrid.findPrev('re');
            verifySearchResult(fixNativeElement, 7, 1, actualCount);
        });

        it('Should update search highlights when filtering', fakeAsync(() => {
            treeGrid.findNext('Software Developer');

            verifySearchResult(fixNativeElement, 3, 0);

            // Apply filter
            treeGrid.filter('JobTitle', 'Associate', IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();

            verifySearchResult(fixNativeElement, 2, 0);
        }));

        it('Should update search highlights when clearing filter', fakeAsync(() => {
            // Apply filter
            treeGrid.filter('JobTitle', 'Associate', IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();

            treeGrid.findNext('Software Developer');

            verifySearchResult(fixNativeElement, 2, 0);

            // Clear filter
            treeGrid.clearFilter();
            fix.detectChanges();

            verifySearchResult(fixNativeElement, 3, 0);
        }));

        it('Should update search highlights when sorting', () => {
            treeGrid.findNext('er');

            verifySearchResult(fixNativeElement, 6, 0);

            // Apply asc sorting
            treeGrid.columns.filter(c => c.field === 'JobTitle')[0].sortable = true;
            fix.detectChanges();
            treeGrid.sort({fieldName: 'JobTitle', dir: SortingDirection.Asc, ignoreCase: true });
            fix.detectChanges();

            verifySearchResult(fixNativeElement, 6, 3);

            // Apply desc sorting
            treeGrid.sort({fieldName: 'JobTitle', dir: SortingDirection.Desc, ignoreCase: true });
            fix.detectChanges();

            verifySearchResult(fixNativeElement, 6, 1);
        });

        it('Should update search highlights when clearing sorting', () => {
            // Apply asc sorting
            treeGrid.columns.filter(c => c.field === 'JobTitle')[0].sortable = true;
            fix.detectChanges();
            treeGrid.sort({fieldName: 'JobTitle', dir: SortingDirection.Asc, ignoreCase: true });
            fix.detectChanges();

            treeGrid.findNext('er');

            verifySearchResult(fixNativeElement, 6, 0);

            // Clear sorting
            treeGrid.clearSort();
            fix.detectChanges();

            verifySearchResult(fixNativeElement, 6, 3);
        });

        it('Should update search highlights when a column is pinned/unpinned', () => {
            treeGrid.findNext('casey');
            fix.detectChanges();

            // Verify a 'Name' cell is unpinned and has active search result in it.
            let treeCell = TreeGridFunctions.getTreeCell(TreeGridFunctions.getAllRows(fix)[0]);
            let cell = TreeGridFunctions.getCell(fix, 0, 'Name');
            expect(cell).not.toBe(treeCell);
            verifySearchResult(cell.nativeElement, 1, 0);

            // Pin column
            const column = treeGrid.columns.filter(c => c.field === 'Name')[0];
            column.pinned = true;
            fix.detectChanges();

            // Verify a 'Name' cell is pinned tree cell and has active search result in it.
            treeCell = TreeGridFunctions.getTreeCell(TreeGridFunctions.getAllRows(fix)[0]);
            cell = TreeGridFunctions.getCell(fix, 0, 'Name');
            expect(cell).toBe(treeCell);
            verifySearchResult(cell.nativeElement, 1, 0);

            // Unpin column
            column.pinned = false;
            fix.detectChanges();

            // Verify a 'Name' cell is unpinned and has active search result in it.
            treeCell = TreeGridFunctions.getTreeCell(TreeGridFunctions.getAllRows(fix)[0]);
            cell = TreeGridFunctions.getCell(fix, 0, 'Name');
            expect(cell).not.toBe(treeCell);
            verifySearchResult(cell.nativeElement, 1, 0);
        });

        it('Should update search highlights when a column that doesnt contain search results is hidden/shown', () => {
            treeGrid.findNext('casey');

            let cell = TreeGridFunctions.getCell(fix, 0, 'Name');
            verifySearchResult(cell.nativeElement, 1, 0);

            // Hide 'Age' column
            const column = treeGrid.columns.filter(c => c.field === 'Age')[0];
            column.hidden = true;
            fix.detectChanges();

            cell = TreeGridFunctions.getCell(fix, 0, 'Name');
            verifySearchResult(cell.nativeElement, 1, 0);

            // Show 'Age' column
            column.hidden = false;
            fix.detectChanges();

            cell = TreeGridFunctions.getCell(fix, 0, 'Name');
            verifySearchResult(cell.nativeElement, 1, 0);
        });

        it('Should update search highlights when a column that contains search results is hidden/shown', () => {
            treeGrid.findNext('casey');

            let cell = TreeGridFunctions.getCell(fix, 0, 'Name');
            verifySearchResult(cell.nativeElement, 1, 0);

            // Hide 'Name' column
            const column = treeGrid.columns.filter(c => c.field === 'Name')[0];
            column.hidden = true;
            fix.detectChanges();

            verifySearchResult(fixNativeElement, 0, -1);

            // Show 'Name' column
            column.hidden = false;
            fix.detectChanges();

            cell = TreeGridFunctions.getCell(fix, 0, 'Name');
            verifySearchResult(cell.nativeElement, 1, 0);

            verifyVisibleCellValueDivsCount(fix);
        });

        it('Search highlights should work for case sensitive and exact match searches', () => {
            let actualCount = treeGrid.findNext('er');
            fix.detectChanges();
            verifySearchResult(fixNativeElement, 6, 0, actualCount);

            actualCount = treeGrid.findNext('er', true, false);
            fix.detectChanges();
            verifySearchResult(fixNativeElement, 5, 0, actualCount);

            actualCount = treeGrid.findNext('Software Developer');
            fix.detectChanges();
            verifySearchResult(fixNativeElement, 3, 0, actualCount);

            actualCount = treeGrid.findNext('Software Developer', false, true);
            fix.detectChanges();
            verifySearchResult(fixNativeElement, 1, 0, actualCount);
        });
    });

    describe('Scrollable TreeGrid', () => {
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxTreeGridSummariesScrollingComponent);
            fix.detectChanges();
            fixNativeElement = fix.debugElement.nativeElement;
            treeGrid = fix.componentInstance.treeGrid;
            treeGrid.expansionDepth = 0;
            treeGrid.height = '400px';
            treeGrid.columns[3].hasSummary = false;
            fix.detectChanges();
        });

        const expectedValues = ['Andrew', 'Janet', 'Anne', 'Danielle', 'Callahan', 'Jonathan',
            'Nancy', 'Wang', 'Buchanan', 'Buchanan', 'Armand', 'Dane', 'Declan'];

        it('findNext should navigate search highlights with collapsed rows', async () => {
            for (let i = 0; i < 14; i++) {
                const expectedValue = expectedValues[i % expectedValues.length];
                const actualCount = treeGrid.findNext('an');
                await wait(50);
                fix.detectChanges();
                expect(actualCount).toBe(expectedValues.length);
                verifyActiveCellValue(fixNativeElement, expectedValue);
            }
        });

        it('findPrev should navigate search highlights with collapsed rows', async () => {
            for (let i = 13; i >= 0; i--) {
                const expectedValue = expectedValues[i % expectedValues.length];
                const actualCount = treeGrid.findPrev('an');
                await wait(50);
                fix.detectChanges();
                expect(actualCount).toBe(expectedValues.length);
                verifyActiveCellValue(fixNativeElement, expectedValue);
            }
        });

        it('findNext should navigate search highlights with paging', async () => {
            fix.componentInstance.paging = true;
            fix.detectChanges();
            treeGrid.expansionDepth = Infinity;
            treeGrid.perPage = 5;
            await wait(50);
            fix.detectChanges();

            const expectedPages = [0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3];

            for (let i = 0; i < 14; i++) {
                const index = i % expectedValues.length;
                const expectedValue = expectedValues[index];
                const actualCount = treeGrid.findNext('an');
                await wait(50);
                fix.detectChanges();

                expect(treeGrid.page).toBe(expectedPages[index]);
                expect(actualCount).toBe(expectedValues.length);
                verifyActiveCellValue(fixNativeElement, expectedValue);
            }
        });

        it('findNext should navigate search highlights with paging and collapsed rows', async () => {
            fix.componentInstance.paging = true;
            fix.detectChanges();
            treeGrid.perPage = 5;
            await wait(50);
            fix.detectChanges();

            const expectedPages = [0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3];
            const expectedPageCounts = [1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 5];

            for (let i = 0; i < 13; i++) {
                const index = i % expectedValues.length;
                const expectedValue = expectedValues[index];
                const actualCount = treeGrid.findNext('an');
                await wait(50);
                fix.detectChanges();

                expect(treeGrid.page).toBe(expectedPages[index]);
                expect(treeGrid.totalPages).toBe(expectedPageCounts[index]);
                expect(actualCount).toBe(expectedValues.length);
                verifyActiveCellValue(fixNativeElement, expectedValue);
            }
        });
    });
});

const getHighlightSpans = (nativeParent: HTMLElement) => nativeParent.querySelectorAll('.' + HIGHLIGHT_CLASS);

const getActiveSpan = (nativeParent: HTMLElement) => nativeParent.querySelector('.' + ACTIVE_CLASS);

/**
 * Verifies the results from a search execution by providing the expected highlighted elements count
 * and the expected active span index.
 * expectedActiveSpanIndex should be passed as -1 if there should be no active span element.
 * (Optionally the result from findNext/findPrev methods - the actualAPISearchCount, can also be checked.)
 */
const verifySearchResult = (nativeParent, expectedHighlightSpansCount, expectedActiveSpanIndex, actualAPISearchCount?) => {
    const spans = getHighlightSpans(nativeParent);
    const activeSpan = getActiveSpan(nativeParent);

    if (actualAPISearchCount) {
        expect(actualAPISearchCount).toBe(expectedHighlightSpansCount, 'incorrect highlight elements count returned from api');
    }

    expect(spans.length).toBe(expectedHighlightSpansCount, 'incorrect highlight elements count');

    if (expectedActiveSpanIndex !== -1) {
        // If active element should exist.
        expect(activeSpan).toBe(spans[expectedActiveSpanIndex], 'incorrect active element');
    } else {
        // If active element should not exist. (used when spans.length is expected to be 0 as well)
        expect(activeSpan).toBeNull('active element was found');
    }
};

const getHighlightedCellValue = (cell: HTMLElement) => {
    const valueDivs: HTMLElement[] = Array.from(cell.querySelectorAll(CELL_VALUE_DIV_CSS_CLASS));
    return valueDivs.filter(v => !v.hidden).map(v => v.innerText.trim()).join('');
};

/**
 * Verifies that every single cell contains only one visible div with the cell value in it.
 */
const verifyVisibleCellValueDivsCount = (fix) => {
    // Verify that there is NO cell with a duplicated value.
    const allCells = TreeGridFunctions.getAllCells(fix);
    allCells.forEach(cell => {
        const valueDivs: HTMLElement[] = Array.from(cell.nativeElement.querySelectorAll(CELL_VALUE_DIV_CSS_CLASS));
        // only one visible 'value div' should be present
        expect(valueDivs.filter(div => !div.hidden).length).toBe(1, 'incorrect visible value divs count');
    });
};

const verifyActiveCellValue = (nativeParent: HTMLElement, expectedValue: string) => {
    const activeSpan = getActiveSpan(nativeParent);
    const cell = activeSpan.parentElement.parentElement;
    const cellValue = getHighlightedCellValue(cell);
    expect(cellValue).toBe(expectedValue);
};
