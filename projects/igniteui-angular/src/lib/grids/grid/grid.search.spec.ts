import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxGridModule, IgxGridComponent } from './public_api';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { BasicGridSearchComponent } from '../../test-utils/grid-base-components.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { GridWithAvatarComponent, GroupableGridSearchComponent, ScrollableGridSearchComponent } from '../../test-utils/grid-samples.spec';
import { IForOfState } from '../../directives/for-of/for_of.directive';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GridColumnDataType } from '../../data-operations/data-util';
import { setupGridScrollDetection } from '../../test-utils/helper-utils.spec';
import { IgxTextHighlightDirective } from '../../directives/text-highlight/text-highlight.directive';
import { GridFunctions } from '../../test-utils/grid-functions.spec';

describe('IgxGrid - search API #grid - ', () => {
    const CELL_CSS_CLASS = '.igx-grid__td';
    const HIGHLIGHT_CSS_CLASS = '.igx-highlight';
    const HIGHLIGHT_ACTIVE_CSS_CLASS = '.igx-highlight__active';
    let fix; let component; let grid: IgxGridComponent; let fixNativeElement;

    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                BasicGridSearchComponent,
                GridWithAvatarComponent,
                GroupableGridSearchComponent,
                ScrollableGridSearchComponent
            ],
            imports: [IgxGridModule, NoopAnimationsModule]
        });
    }));

    describe('BasicGrid - ', () => {
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(BasicGridSearchComponent);
            fix.componentInstance.data = SampleTestData.personJobDataFull();
            fix.detectChanges();
            component = fix.componentInstance;
            grid = component.grid;
            fixNativeElement = fix.debugElement.nativeElement;
        }));

        it('Should clear all highlights', () => {
            const count = grid.findNext('software');
            let spans = getSpans();
            expect(spans.length).toBe(5);
            expect(count).toBe(5);

            grid.clearSearch();
            fix.detectChanges();
            spans = getSpans();
            expect(spans.length).toBe(0);
        });

        it('findNext highlights the correct cells', () => {
            let count = grid.findNext('developer');
            fix.detectChanges();
            const spans = getSpans();
            expect(spans.length).toBe(4);
            expect(count).toBe(4);
            verifyActiveSpan(0);

            count = grid.findNext('developer');
            fix.detectChanges();
            verifyActiveSpan(1);

            count = grid.findNext('developer');
            fix.detectChanges();
            verifyActiveSpan(2);

            count = grid.findNext('developer');
            fix.detectChanges();
            verifyActiveSpan(3);

            count = grid.findNext('developer');
            fix.detectChanges();
            verifyActiveSpan(0);
        });

        it('findPrev highlights the correct cells', () => {
            let count = grid.findNext('developer');
            const spans = getSpans();
            expect(spans.length).toBe(4);
            expect(count).toBe(4);
            verifyActiveSpan(0);

            count = grid.findPrev('developer');
            verifyActiveSpan(3);

            count = grid.findPrev('developer');
            verifyActiveSpan(2);

            count = grid.findPrev('developer');
            verifyActiveSpan(1);

            count = grid.findPrev('developer');
            verifyActiveSpan(0);
        });

        it('findPrev and findNext work properly for case sensitive searches', () => {
            grid.getCellByColumn(4, 'JobTitle').update('Senior Software DEVELOPER');
            fix.detectChanges();

            let count = grid.findNext('Developer', true);
            fix.detectChanges();
            let spans = getSpans();
            expect(spans.length).toBe(3);
            expect(count).toBe(3);
            verifyActiveSpan(0);

            count = grid.findPrev('Developer', true);
            fix.detectChanges();
            verifyActiveSpan(2);

            count = grid.findNext('Developer', true);
            fix.detectChanges();
            verifyActiveSpan(0);

            count = grid.findNext('Developer', true);
            fix.detectChanges();
            verifyActiveSpan(1);

            count = grid.findPrev('developer', true);
            fix.detectChanges();
            spans = getSpans();
            const activeSpan = getActiveSpan();
            expect(activeSpan).toBe(null);
            expect(count).toBe(0);
            expect(spans.length).toBe(0);
        });

        it('findNext and findPrev highlight nothing when there is no exact match, regardless of case sensitivity.', () => {
            let count = grid.findNext('Developer', false, true);
            let spans = getSpans();
            expect(spans.length).toBe(0);
            expect(count).toBe(0);

            count = grid.findNext('Developer', true, true);
            spans = getSpans();
            expect(spans.length).toBe(0);
            expect(count).toBe(0);

            count = grid.findPrev('Developer', false, true);
            fix.detectChanges();
            spans = getSpans();
            expect(spans.length).toBe(0);
            expect(count).toBe(0);

            count = grid.findPrev('Developer', true, true);
            fix.detectChanges();
            spans = getSpans();
            expect(spans.length).toBe(0);
            expect(count).toBe(0);
        });

        it('findNext and findPrev highlight only exact matches when searching by exact match', () => {
            let count = grid.findNext('Software Developer', false, false);
            fix.detectChanges();
            let spans = getSpans();
            expect(spans.length).toBe(4);
            expect(count).toBe(4);

            count = grid.findNext('Software Developer', false, true);
            fix.detectChanges();
            verifyActiveSpan(0);
            spans = getSpans();
            expect(spans.length).toBe(1);
            expect(count).toBe(1);

            count = grid.findPrev('Software Developer', false, false);
            fix.detectChanges();
            spans = getSpans();
            expect(spans.length).toBe(4);
            expect(count).toBe(4);

            count = grid.findPrev('Software Developer', false, true);
            fix.detectChanges();
            verifyActiveSpan(0);
            spans = getSpans();
            expect(spans.length).toBe(1);
            expect(count).toBe(1);
        });

        it('findNext and findPrev highlight only exact matches by respecting case sensitivity', () => {
            grid.getCellByColumn(5, 'JobTitle').update('director of Dev operations');
            fix.detectChanges();

            // Case INsensitive and exact match
            let count = grid.findNext('director', false, true);
            fix.detectChanges();
            let spans = getSpans();
            verifyActiveSpan(0);
            expect(spans.length).toBe(2);
            expect(count).toBe(2);

            count = grid.findPrev('director', false, true);
            verifyActiveSpan(1);
            expect(spans.length).toBe(2);
            expect(count).toBe(2);

            // Case sensitive and exact match
            count = grid.findNext('director', true, true);
            fix.detectChanges();
            spans = getSpans();
            expect(spans.length).toBe(0);
            expect(count).toBe(0);

            count = grid.findPrev('director', true, true);
            fix.detectChanges();
            spans = getSpans();
            expect(spans.length).toBe(0);
            expect(count).toBe(0);
        });

        it('Should update exact match highlights when filtering.', () => {
            grid.findNext('Software Developer', false, true);
            let activeHighlight = getActiveHighlight();
            let highlights = getHighlights();
            expect(highlights.length).toBe(1);
            verifyActiveHighlight(0);

            grid.filter('JobTitle', 'Associate', IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();
            activeHighlight = getActiveHighlight();
            highlights = getHighlights();
            expect(highlights.length).toBe(0);
            expect(activeHighlight).toBeNull();

            grid.clearFilter('JobTitle');
            fix.detectChanges();
        });

        it('Should update exact match highlights when clearing filter.', fakeAsync(() => {
            grid.filter('JobTitle', 'Associate', IgxStringFilteringOperand.instance().condition('contains'));
            tick(16);
            fix.detectChanges();

            grid.findNext('Software Developer', false, true);
            let activeHighlight = getActiveHighlight();
            let highlights = getHighlights();
            expect(highlights.length).toBe(0);
            expect(activeHighlight).toBeNull();

            grid.clearFilter('JobTitle');
            tick(16);
            fix.detectChanges();
            activeHighlight = getActiveHighlight();
            highlights = getHighlights();
            expect(highlights.length).toBe(1);
            verifyActiveHighlight(0);
        }));

        it('Should update the active highlight when sorting', () => {
            const allCells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
            const rv = allCells[6].nativeElement;
            const cell = grid.getCellByColumn(0, 'JobTitle');
            const searchString = 'assoc';
            let activeHighlight = rv.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            expect(activeHighlight !== null).toBeFalsy();

            cell.column.sortable = true;
            grid.findNext(searchString);
            grid.findNext(searchString);

            grid.sort({ fieldName: 'JobTitle', dir: SortingDirection.Asc, ignoreCase: true });
            fix.detectChanges();
            activeHighlight = rv.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            let highlights = rv.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.sort({ fieldName: 'JobTitle', dir: SortingDirection.Desc, ignoreCase: true });
            fix.detectChanges();
            const scrolledCell = grid.getCellByColumn(grid.data.length - 1, 'JobTitle').nativeElement;
            activeHighlight = scrolledCell.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            highlights = scrolledCell.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });

        xit('Should scroll properly when using paging', fakeAsync(() => {
            fix.componentInstance.paging = true;
            fix.detectChanges();
            grid.height = '240px';
            fix.detectChanges();
            grid.perPage = 7;
            tick(100);
            fix.detectChanges();

            const searchString = 'assoc';
            grid.findNext(searchString);
            fix.detectChanges();
            tick(100);
            fix.detectChanges();

            expect(grid.page).toBe(0);
            let activeHighlight = getActiveHighlight();
            let highlights = getHighlights();
            expect(activeHighlight).not.toBeNull();
            expect(highlights.length).toBe(1);

            grid.findNext(searchString);
            fix.detectChanges();
            expect(grid.page).toBe(1);
            activeHighlight = getActiveHighlight();
            highlights = getHighlights();
            expect(activeHighlight).not.toBeNull();
            expect(highlights.length).toBe(1);

            grid.findPrev(searchString);
            fix.detectChanges();
            expect(grid.page).toBe(0);
            activeHighlight = getActiveHighlight();
            highlights = getHighlights();
            expect(activeHighlight).not.toBeNull();
            expect(highlights.length).toBe(1);
        }));

        it('Hidden columns shouldn\'t be part of the search', () => {
            grid.columns[1].hidden = true;
            fix.detectChanges();

            grid.findNext('casey');
            const activeHighlight = getActiveHighlight();
            const highlights = getHighlights();
            expect(highlights.length).toBe(0);
            expect(activeHighlight).toBe(null);
        });

        it('Search should honor the visible columns order', () => {
            grid.columns[3].pinned = true;
            const cell = grid.getCellByColumn(0, 'HireDate').nativeElement;

            grid.findNext('1');
            const activeHighlight = cell.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            const highlights = cell.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(5);
            verifyActiveHighlight(0);
        });

        it('Active highlight should be updated when a column is pinned/unpinned', () => {
            let cellName = grid.getCellByColumn(0, 'Name').nativeElement;
            let activeHighlight: any;
            let highlights: NodeListOf<Element>;

            grid.findNext('casey');
            cellName = grid.getCellByColumn(0, 'Name').nativeElement;
            activeHighlight = cellName.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            highlights = cellName.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            verifyActiveHighlight(0);

            grid.columns[1].pinned = true;
            fix.detectChanges();
            cellName = grid.getCellByColumn(0, 'Name').nativeElement;
            activeHighlight = cellName.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            highlights = cellName.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            verifyActiveHighlight(0);

            grid.columns[1].pinned = false;
            fix.detectChanges();
            cellName = grid.getCellByColumn(0, 'Name').nativeElement;
            activeHighlight = cellName.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            highlights = cellName.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            verifyActiveHighlight(0);
        });

        it('Active highlight should be updated when a column is hidden/shown', () => {
            let cellName = grid.getCellByColumn(0, 'Name').nativeElement;
            let activeHighlight: any;
            let highlights: NodeListOf<Element>;

            grid.findNext('casey');
            activeHighlight = cellName.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            highlights = cellName.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            verifyActiveHighlight(0);

            grid.columns[0].hidden = true;
            fix.detectChanges();
            cellName = grid.getCellByColumn(0, 'Name').nativeElement;
            activeHighlight = cellName.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            highlights = cellName.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            verifyActiveHighlight(0);

            grid.columns[0].hidden = false;
            fix.detectChanges();
            cellName = grid.getCellByColumn(0, 'Name').nativeElement;
            activeHighlight = cellName.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            highlights = cellName.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            verifyActiveHighlight(0);
        });

        it('Highlights should be updated after a column is hidden and another column is already hidden', () => {
            grid.columns[0].hidden = true;
            fix.detectChanges();

            grid.findNext('an');
            fix.detectChanges();
            let activeHighlight = getActiveHighlight();
            let highlights = getHighlights();
            expect(highlights.length).toBe(3);
            verifyActiveHighlight(0);
            expect(grid.lastSearchInfo.matchInfoCache.length).toBe(3);
            expect(grid.lastSearchInfo.activeMatchIndex).toBe(0);

            grid.columns[1].hidden = true;
            fix.detectChanges();
            activeHighlight = getActiveHighlight();
            highlights = getHighlights();
            expect(highlights.length).toBe(1);
            verifyActiveHighlight(0);
            expect(grid.lastSearchInfo.matchInfoCache.length).toBe(1);
            expect(grid.lastSearchInfo.activeMatchIndex).toBe(0);
        });

        it('Highlight should be updated when a column is hidden/shown and columns have different data types', () => {
            grid.columns[0].dataType = GridColumnDataType.Number;
            fix.detectChanges();

            let cell = grid.getCellByColumn(0, 'ID').nativeElement;
            grid.findNext('1');
            let highlights = cell.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            verifyActiveHighlight(0);

            grid.columns[0].hidden = true;
            fix.detectChanges();

            grid.columns[0].hidden = false;
            fix.detectChanges();
            cell = grid.getCellByColumn(0, 'ID').nativeElement;
            highlights = cell.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            expect(cell.innerText).toBe('1');
        });

        it('Highlight should be updated when a column is hidden and there are other hidden columns', () => {
            grid.columns[1].hidden = true;
            fix.detectChanges();

            let finds = grid.findNext('Director');
            expect(finds).toEqual(2);

            grid.columns[2].hidden = true;
            fix.detectChanges();

            finds = grid.findNext('Director');
            expect(finds).toEqual(0);
        });

        it('Clear filter properly updates the highlights', () => {
            let gilbertoDirectorCell = grid.getCellByColumn(1, 'JobTitle').nativeElement;
            let tanyaDirectorCell = grid.getCellByColumn(2, 'JobTitle').nativeElement;

            grid.findNext('director');
            fix.detectChanges();
            gilbertoDirectorCell = grid.getCellByColumn(1, 'JobTitle').nativeElement;
            let activeHighlight = gilbertoDirectorCell.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            let highlights = gilbertoDirectorCell.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            verifyActiveHighlight(0);

            grid.filter('Name', 'Tanya', IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();
            tanyaDirectorCell = grid.getCellByColumn(0, 'JobTitle').nativeElement;
            activeHighlight = tanyaDirectorCell.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            highlights = tanyaDirectorCell.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.clearFilter();
            fix.detectChanges();
            tanyaDirectorCell = grid.getCellByColumn(2, 'JobTitle').nativeElement;
            activeHighlight = tanyaDirectorCell.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            highlights = tanyaDirectorCell.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.findNext('Director');
            fix.detectChanges();
            gilbertoDirectorCell = grid.getCellByColumn(1, 'JobTitle').nativeElement;
            activeHighlight = gilbertoDirectorCell.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            highlights = gilbertoDirectorCell.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });

        it('Unsearchable column should not interfere with active highlight for other columns on its right', () => {
            grid.columns[1].searchable = false;
            grid.columns[3].searchable = false;
            fix.detectChanges();

            const count = grid.findNext('Software');
            const spans = getSpans();
            expect(spans.length).toBe(5);
            expect(count).toBe(5);
            verifyActiveSpan(0);

            grid.findNext('Software');
            verifyActiveSpan(1);
        });

        it('Highlights should be properly updated when a row is deleted', () => {
            // Specify primaryKey so record deletion is allowed.
            grid.primaryKey = 'ID';
            let jackSoftwareCell = grid.getCellByColumn(3, 'JobTitle').nativeElement;
            let celiaSoftwareCell = grid.getCellByColumn(4, 'JobTitle').nativeElement;
            let leslieSoftwareCell = grid.getCellByColumn(8, 'JobTitle').nativeElement;

            grid.findNext('software');
            jackSoftwareCell = grid.getCellByColumn(3, 'JobTitle').nativeElement;
            let activeHighlight = jackSoftwareCell.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            let highlights = jackSoftwareCell.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.deleteRow(4);
            fix.detectChanges();
            celiaSoftwareCell = grid.getCellByColumn(3, 'JobTitle').nativeElement;
            activeHighlight = celiaSoftwareCell.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            highlights = celiaSoftwareCell.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.findPrev('software');
            leslieSoftwareCell = grid.getCellByColumn(7, 'JobTitle').nativeElement;
            activeHighlight = leslieSoftwareCell.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            highlights = leslieSoftwareCell.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });

        it('Highlights should be properly updated when a row is added', () => {
            const tanyaDirectorCell = grid.getCellByColumn(2, 'JobTitle').nativeElement;

            grid.findNext('director');
            grid.findNext('director');
            let activeHighlight = tanyaDirectorCell.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            let highlights = tanyaDirectorCell.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.addRow({
                ID: 11,
                Name: 'John Doe',
                JobTitle: 'Director',
                HireDate: new Date()
            });
            fix.detectChanges();
            activeHighlight = tanyaDirectorCell.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            highlights = tanyaDirectorCell.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.findNext('director');
            const johnDirectorCell = grid.getCellByColumn(grid.rowList.length - 1, 'JobTitle').nativeElement;
            activeHighlight = johnDirectorCell.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            highlights = johnDirectorCell.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });

        it('Active highlight should be updated when filtering is applied', () => {
            grid.findNext('developer');

            grid.filter('JobTitle', 'Associate', IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();
            const highlights = getHighlights();
            expect(highlights.length).toBe(2);
            verifyActiveHighlight(0);
        });

        it('Active highlight should be preserved when all rows are filtered out', fakeAsync(() => {
            grid.height = '500px';
            fix.detectChanges();

            grid.findNext('casey');
            let highlights = getHighlights();
            expect(highlights.length).toBe(1);

            grid.filter('Name', 'zxxz', IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();
            let activeHighlight = getActiveHighlight();
            highlights = getHighlights();
            expect(highlights.length).toBe(0);
            expect(activeHighlight).toBeNull();

            grid.clearFilter('Name');
            fix.detectChanges();
            activeHighlight = getActiveHighlight();
            highlights = getHighlights();
            expect(highlights.length).toBe(1);
            verifyActiveHighlight(0);
        }));

        it('Active highlight should be preserved when a column is moved', () => {
            grid.findNext('casey');

            const columns = grid.columnList.toArray();
            grid.moveColumn(columns[0], columns[1]);

            const highlights = getHighlights();
            expect(highlights.length).toBe(1);
            verifyActiveHighlight(0);
        });

        it('Should exit edit mode and search a cell', () => {
            const cell = grid.getCellByColumn(0, 'Name');
            cell.column.editable = true;
            fix.detectChanges();
            cell.setEditMode(true);
            fix.detectChanges();
            expect(cell.editMode).toBeTruthy();

            grid.findNext('casey');
            cell.cdr.detectChanges();
            grid.cdr.detectChanges();
            const highlights = cell.nativeElement.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(cell.editMode).toBeFalsy();
            expect(highlights.length).toBe(1);
            verifyActiveHighlight(0);

            const nextCell = grid.getCellByColumn(0, 'JobTitle').nativeElement;
            nextCell.dispatchEvent(new Event('click'));
            fix.detectChanges();
            expect(cell.nativeElement.innerText.trim()).toBe('Casey Houston');
        });

        it('Search should not change the cell\'s value', () => {
            grid.findNext('12');
            const rowIndexes = [1, 3, 4, 5];

            rowIndexes.forEach((ind) => {
                const cell = grid.getCellByColumn(ind, 'HireDate');
                const highlights = cell.nativeElement.querySelectorAll(HIGHLIGHT_CSS_CLASS);
                const activeHighlight = cell.nativeElement.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
                const cellChildren = cell.nativeElement.children as HTMLCollection;

                // Check whether search does not change the cell's value
                expect(cellChildren.length).toBe(2);
                expect(cell.nativeElement.innerText.trim()).toBe(cell.value);
                expect((cellChildren[0] as HTMLElement).hidden).toBeTruthy();
                expect((cellChildren[1] as HTMLElement).hidden).toBeFalsy();

                expect(highlights.length).toBe(1);
                if (ind === 1) {
                    verifyActiveHighlight(0);
                } else {
                    expect(activeHighlight).toBeNull();
                }
                expect((highlights[0] as HTMLElement).innerText).toEqual('12');
            });
        });

        it('Search should close row edit mode', () => {
            grid.primaryKey = 'ID';
            grid.rowEditable = true;
            grid.getColumnByName('Name').editable = true;
            grid.cdr.detectChanges();
            fix.detectChanges();
            const row = grid.getRowByIndex(0);
            const cell = grid.getCellByColumn(0, 'Name');

            grid.findNext('Casey');
            grid.cdr.detectChanges();
            fix.detectChanges();
            let highlights = cell.nativeElement.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            expect(row.inEditMode).toBe(false);
            cell.nativeElement.dispatchEvent(new Event('dblclick'));
            fix.detectChanges();
            expect(row.inEditMode).toBe(true);

            let cellInput = null;
            cellInput = cell.nativeElement.querySelector('[igxinput]');
            cellInput.value = 'newCellValue';
            cellInput.dispatchEvent(new Event('input'));
            fix.detectChanges();

            grid.findNext('Casey');
            grid.cdr.detectChanges();
            fix.detectChanges();
            highlights = cell.nativeElement.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            expect(row.inEditMode).toBe(false);
        });

        it('Should keep edit mode when tabbing, after search is applied', () => {
            grid.primaryKey = 'ID';
            grid.getColumnByName('Name').editable = true;
            grid.getColumnByName('JobTitle').editable = true;
            fix.detectChanges();
            const cell = grid.getCellByColumn(1, 'Name');
            const caseyCell = grid.getCellByColumn(0, 'Name');
            const newVal = 'newCellValue';

            grid.findNext('Casey');
            fix.detectChanges();
            let highlights = caseyCell.nativeElement.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);

            UIInteractions.simulateDoubleClickAndSelectEvent(cell.nativeElement);
            fix.detectChanges();

            expect(cell.editMode).toBeTruthy();
            highlights = caseyCell.nativeElement.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);

            let cellInput = null;
            cellInput = cell.nativeElement.querySelector('[igxinput]');
            UIInteractions.setInputElementValue(cellInput, newVal);

            // press tab on edited cell
            GridFunctions.simulateGridContentKeydown(fix, 'tab');
            fix.detectChanges();

            expect(cell.value).toBe(newVal);
            expect(cell.editMode).toBeFalsy();
            highlights = caseyCell.nativeElement.querySelectorAll(HIGHLIGHT_CSS_CLASS);

            const nextCell = grid.getCellByColumn(1, 'JobTitle');
            expect(nextCell.editMode).toBeTruthy();
            expect(highlights.length).toBe(1);
        });
    });

    describe('ScrollableGrid - ', () => {
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(ScrollableGridSearchComponent);
            component = fix.componentInstance;
            grid = component.grid;
            setupGridScrollDetection(fix, grid);
            fix.detectChanges();

            grid.data[29].HireDate = '1887-11-28T11:23:17.714Z';
            grid.width = '500px';
            grid.height = '600px';
            fixNativeElement = fix.debugElement.nativeElement;
            fix.detectChanges();
        }));

        it('findNext scrolls to cells out of view', async () => {
            grid.findNext('30');
            await wait(100);
            fix.detectChanges();
            expect(isInView(29, grid.virtualizationState)).toBeTruthy();

            grid.findNext('1887');
            await wait(100);
            fix.detectChanges();
            expect(isInView(3, grid.rowList.first.virtDirRow.state)).toBeTruthy();
        });

        it('findPrev scrolls to cells out of view', async () => {
            grid.findPrev('30');
            await wait(100);
            fix.detectChanges();
            expect(isInView(29, grid.virtualizationState)).toBeTruthy();

            grid.findPrev('1887');
            await wait(100);
            fix.detectChanges();
            expect(isInView(3, grid.rowList.first.virtDirRow.state)).toBeTruthy();
        });

        it('should keep the active highlight when active cell enters and exits edit mode', () => {
            const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS)).nativeElement;
            const cell = grid.getCellByColumn(0, 'ID');
            const initialValue = rv.textContent;
            let activeHighlight = rv.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            expect(activeHighlight).toBeNull();

            cell.column.editable = true;
            grid.findNext('1');
            fix.detectChanges();
            activeHighlight = rv.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            expect(activeHighlight).not.toBeNull();

            cell.setEditMode(true);
            fix.detectChanges();
            expect(cell.editMode).toBe(true);
            activeHighlight = rv.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            expect(activeHighlight).toBeNull();

            cell.setEditMode(false);
            fix.detectChanges();
            expect(rv.innerText).toBe(initialValue);
            expect(rv.querySelectorAll(HIGHLIGHT_CSS_CLASS).length).toBe(1);
            activeHighlight = rv.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            expect(activeHighlight).not.toBeNull();
        });

        it('should update highlights when a new value is entered', () => {
            const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS));
            const cell = grid.getCellByColumn(0, 'ID');
            cell.column.editable = true;
            fix.detectChanges();
            let activeHighlight = rv.nativeElement.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            expect(activeHighlight).toBeNull();

            grid.findNext('1');
            fix.detectChanges();
            activeHighlight = rv.nativeElement.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            expect(activeHighlight).not.toBeNull();

            cell.setEditMode(true);
            fix.detectChanges();
            expect(cell.editMode).toBe(true);

            const inputElem: HTMLInputElement = rv.nativeElement.querySelector('input') as HTMLInputElement;
            inputElem.value = '11';
            fix.detectChanges();
            cell.update(inputElem.value);
            fix.detectChanges();
            expect(rv.nativeElement.innerText).toBe('11');
            activeHighlight = rv.nativeElement.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            const highlights = rv.nativeElement.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(2);
            verifyActiveHighlight(0);
        });

        it('should update highlights when the cell value is cleared', () => {
            const rv = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1].nativeElement;
            const rv2 = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[2].nativeElement;
            const cell = grid.getCellByColumn(0, 'Name');
            let activeHighlight = rv.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            expect(activeHighlight).toBeNull();

            cell.column.editable = true;
            grid.findNext('c');
            fix.detectChanges();
            activeHighlight = rv.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            expect(activeHighlight).not.toBeNull();

            cell.setEditMode(true);
            fix.detectChanges();
            expect(cell.editMode).toBe(true);

            const inputElem: HTMLInputElement = rv.querySelector('input') as HTMLInputElement;
            inputElem.value = '';
            cell.update(inputElem.value);
            fix.detectChanges();
            activeHighlight = rv.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            let highlights = rv.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(0);
            expect(activeHighlight).toBeNull();

            activeHighlight = rv2.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            highlights = rv2.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });

        it('Should update highlight when setting perPage option', () => {
            fix.componentInstance.paging = true;
            fix.detectChanges();

            const searchString = 'casey';
            grid.findNext(searchString);
            grid.findNext(searchString);
            fix.detectChanges();
            let activeHighlight = getActiveHighlight();
            expect(activeHighlight).not.toBeNull();
            expect(grid.page).toBe(0);

            grid.perPage = 9;
            fix.detectChanges();
            activeHighlight = getActiveHighlight();
            expect(activeHighlight).toBeNull();
            expect(grid.page).toBe(0);

            grid.page = 1;
            fix.detectChanges();
            activeHighlight = getActiveHighlight();
            expect(activeHighlight).not.toBeNull();
        });
    });

    describe('GroupableGrid - ', () => {
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(GroupableGridSearchComponent);
            fix.detectChanges();

            component = fix.componentInstance;
            grid = component.grid;
            fixNativeElement = fix.debugElement.nativeElement;
        }));

        it('Should be able to navigate through highlights with grouping enabled', () => {
            grid.groupBy({
                fieldName: 'JobTitle',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();
            grid.findNext('Software');
            fix.detectChanges();
            let spans = getSpans();
            expect(spans.length).toBe(5);
            verifyActiveHighlight(0);

            grid.findNext('Software');
            grid.findNext('Software');
            fix.detectChanges();
            spans = getSpans();
            expect(spans.length).toBe(5);
            verifyActiveHighlight(2);

            grid.findPrev('Software');
            fix.detectChanges();
            spans = getSpans();
            expect(spans.length).toBe(5);
            verifyActiveHighlight(1);

            grid.findPrev('Software');
            grid.findPrev('Software');
            fix.detectChanges();
            spans = getSpans();
            expect(spans.length).toBe(5);
            verifyActiveHighlight(4);
        });

        it('Should be able to react to changes in grouping', () => {
            grid.groupBy({
                fieldName: 'JobTitle',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();

            let cell = grid.getCellByColumn(1, 'JobTitle');
            grid.findNext('software');
            fix.detectChanges();
            let highlight = cell.nativeElement.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            expect(highlight !== null).toBeTruthy();

            grid.clearGrouping();
            fix.detectChanges();
            cell = grid.getCellByColumn(6, 'JobTitle');
            highlight = cell.nativeElement.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            expect(highlight !== null).toBeTruthy();

            grid.groupBy([{
                fieldName: 'JobTitle',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            }, {
                fieldName: 'Company',
                dir: SortingDirection.Desc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            }]);
            fix.detectChanges();
            cell = grid.getCellByColumn(4, 'JobTitle');
            highlight = cell.nativeElement.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            expect(highlight !== null).toBeTruthy();

            grid.groupBy({
                fieldName: 'JobTitle',
                dir: SortingDirection.Desc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();
            grid.findNext('software');
            fix.detectChanges();
            cell = grid.getCellByColumn(5, 'JobTitle');
            highlight = cell.nativeElement.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            expect(highlight !== null).toBeTruthy();
        });

        it('Should be able to navigate through highlights with grouping and paging enabled', () => {
            grid.groupBy({
                fieldName: 'JobTitle',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            fix.componentInstance.paging = true;
            fix.detectChanges();
            grid.perPage = 6;
            fix.detectChanges();

            grid.findNext('Software');
            fix.detectChanges();
            let spans = getSpans();
            expect(spans.length).toBe(2);
            verifyActiveSpan(0);
            expect(grid.page).toBe(0);

            grid.findPrev('Software');
            fix.detectChanges();
            spans = getSpans();
            verifyActiveSpan(1);
            expect(spans.length).toBe(2);
            expect(grid.page).toBe(2);

            grid.findPrev('Software');
            grid.findPrev('Software');
            fix.detectChanges();
            spans = getSpans();
            expect(spans.length).toBe(1);
            verifyActiveSpan(0);
            expect(grid.page).toBe(1);
        });

        it('Should be able to properly handle perPage changes with grouping and paging', () => {
            fix.componentInstance.paging = true;
            fix.detectChanges();
            grid.groupBy({
                fieldName: 'JobTitle',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            grid.perPage = 16;
            grid.cdr.detectChanges();
            fix.detectChanges();

            grid.findNext('Software');
            grid.findNext('Software');
            grid.findNext('Software');
            fix.detectChanges();
            let spans = getSpans();
            verifyActiveSpan(2);
            expect(spans.length).toBe(5);
            expect(grid.page).toBe(0);

            grid.perPage = 8;
            fix.detectChanges();
            spans = getSpans();
            const activeSpan = getActiveSpan();
            expect(spans.length).toBe(2);
            expect(activeSpan).toBeNull();
            expect(grid.page).toBe(0);

            grid.page = 1;
            fix.detectChanges();
            spans = getSpans();
            verifyActiveSpan(0);
            expect(spans.length).toBe(3);
            expect(grid.page).toBe(1);
        });

        it('Should be able to properly handle navigating through collapsed rows', () => {
            grid.groupBy({
                fieldName: 'JobTitle',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();

            grid.findNext('software');
            grid.findNext('software');
            grid.findNext('software');
            fix.detectChanges();

            grid.toggleGroup(grid.groupsRecords[0]);
            fix.detectChanges();
            let spans = getSpans();
            expect(spans.length).toBe(3);
            verifyActiveSpan(0);

            grid.findNext('software');
            grid.findNext('software');
            grid.findNext('software');
            fix.detectChanges();
            spans = getSpans();
            expect(spans.length).toBe(5);
            verifyActiveSpan(0);
            expect(grid.isExpandedGroup(grid.groupsRecords[0])).toBeTruthy();
        });

        it('Should be able to navigate through highlights when scrolling with grouping enabled', async () => {
            grid.height = '500px';
            await wait();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'JobTitle',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();
            grid.findNext('a');
            await wait();
            fix.detectChanges();

            (grid as any).scrollTo(9, 0);
            await wait(16);
            fix.detectChanges();
            const row = grid.gridAPI.get_row_by_index(9);
            const spans = row.nativeElement.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(spans.length).toBe(5);
        });

        it('Should be able to search when grouping is enabled', async () => {
            grid.height = '400px';
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'JobTitle',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();
            grid.findNext('Casey');
            await wait(30);
            fix.detectChanges();
            let row = grid.gridAPI.get_row_by_index(17);
            let spans = row.nativeElement.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(spans.length).toBe(1);

            grid.toggleAllGroupRows();
            fix.detectChanges();
            (grid as any).scrollTo(0, 0);
            await wait();
            fix.detectChanges();
            grid.toggleGroup(grid.groupsRecords[0]);
            fix.detectChanges();
            grid.toggleGroup(grid.groupsRecords[1]);
            fix.detectChanges();

            grid.findNext('Casey');
            await wait();
            fix.detectChanges();
            row = grid.gridAPI.get_row_by_index(11);
            spans = row.nativeElement.querySelectorAll(HIGHLIGHT_CSS_CLASS);
            expect(spans.length).toBe(1);
        });

        it('Should be able to properly handle navigating through collapsed rows with paging', () => {
            grid.groupBy({
                fieldName: 'JobTitle',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            fix.componentInstance.paging = true;
            fix.detectChanges();
            grid.perPage = 8;
            fix.detectChanges();
            grid.findNext('software');
            grid.findNext('software');
            fix.detectChanges();
            grid.toggleGroup(grid.groupsRecords[0]);
            grid.findNext('software');
            fix.detectChanges();
            let spans = getSpans();
            expect(spans.length).toBe(3);
            verifyActiveSpan(0);
            expect(grid.page).toBe(1);

            grid.findNext('software');
            grid.findNext('software');
            grid.findNext('software');
            fix.detectChanges();
            spans = getSpans();
            expect(spans.length).toBe(2);
            verifyActiveSpan(0);
            expect(grid.isExpandedGroup(grid.groupsRecords[0])).toBeTruthy();
            expect(grid.page).toBe(0);
        });

        it('Should highlight search results in pinned and unpinned row areas separately', () => {
            grid.getRowByIndex(2).pin();
            fix.detectChanges();

            grid.findNext('Tanya Bennett');
            fix.detectChanges();

            const spans = getSpans();
            expect(spans.length).toBe(2);
            verifyActiveSpan(0);

            grid.findNext('Tanya Bennett');
            fix.detectChanges();
            verifyActiveSpan(1);
        });

        it('Should differentiate IgxHighlightDirective\'s metadata of pinned and unpinned rows', () => {
            grid.getRowByIndex(2).pin();
            fix.detectChanges();

            grid.findNext('Tanya Bennett');
            fix.detectChanges();

            const highlightDirectives = fix.debugElement.queryAll(By.css('div[ng-reflect-value="Tanya Bennett"]'));
            const firstHighlight = highlightDirectives[0].injector.get(IgxTextHighlightDirective);
            const secondHighlight = highlightDirectives[1].injector.get(IgxTextHighlightDirective);

            expect(firstHighlight.metadata.get('pinned')).toBe(true);
            expect(secondHighlight.metadata.get('pinned')).toBe(false);
        });
    });

    describe('Grid with Avatar - ', () => {
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(GridWithAvatarComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();
        }));

        it('Cells with no text should be excluded from the search', () => {
            const matches = grid.findNext('https');
            expect(matches).toBe(0);
        });

        it('Cells with custom template should be excluded from search when pin/unpin', () => {
            grid.columns[1].pinned = true;
            fix.detectChanges();
            const matches = grid.findNext('https');
            expect(matches).toBe(0);
            let cell = grid.getCellByColumn(0, 'Avatar').nativeElement;
            expect(cell.children.length).toBe(1);
            let image = cell.querySelector('.cell__inner, .avatar-cell') as HTMLElement;
            expect(image.hidden).toBeFalsy();

            grid.columns[1].pinned = false;
            fix.detectChanges();
            cell = grid.getCellByColumn(0, 'Avatar').nativeElement;
            expect(cell.children.length).toBe(1);
            image = cell.querySelector('.cell__inner, .avatar-cell');
            expect(image.hidden).toBeFalsy();
        });
    });

    const isInView = (index, state: IForOfState): boolean => index > state.startIndex && index <= state.startIndex + state.chunkSize;

    const getSpans = () => fixNativeElement.querySelectorAll(HIGHLIGHT_CSS_CLASS);

    const getActiveSpan = () => fixNativeElement.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);

    const verifyActiveSpan = (expectedActiveSpanIndex: number) => {
        const spans = getSpans();
        const activeSpan = getActiveSpan();
        expect(activeSpan).toBe(spans[expectedActiveSpanIndex]);
    };

    const getActiveHighlight = () => grid.nativeElement.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);

    const getHighlights = () => grid.nativeElement.querySelectorAll(HIGHLIGHT_CSS_CLASS);

    const verifyActiveHighlight = (expectedActiveHighlightIndex: number) => {
        const highlights = getHighlights();
        const activeHighlight = getActiveHighlight();
        expect(activeHighlight).toBe(highlights[expectedActiveHighlightIndex]);
    };
});
