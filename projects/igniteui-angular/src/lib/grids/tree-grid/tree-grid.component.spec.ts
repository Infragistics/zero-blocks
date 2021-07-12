import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTreeGridModule } from './public_api';
import { IgxTreeGridComponent } from './tree-grid.component';
import { DisplayDensity } from '../../core/displayDensity';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { By } from '@angular/platform-browser';
import {
    IgxTreeGridWrappedInContComponent,
    IgxTreeGridAutoGenerateComponent,
    IgxTreeGridDefaultLoadingComponent,
    IgxTreeGridCellSelectionComponent,
    IgxTreeGridSummariesTransactionsComponent
} from '../../test-utils/tree-grid-components.spec';
import { wait } from '../../test-utils/ui-interactions.spec';
import { GridSelectionMode } from '../common/enums';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';

describe('IgxTreeGrid Component Tests #tGrid', () => {
    configureTestSuite();
    const TBODY_CLASS = '.igx-grid__tbody-content';
    let fix;
    let grid: IgxTreeGridComponent;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridWrappedInContComponent,
                IgxTreeGridAutoGenerateComponent,
                IgxTreeGridDefaultLoadingComponent,
                IgxTreeGridCellSelectionComponent,
                IgxTreeGridSummariesTransactionsComponent
            ],
            imports: [
                NoopAnimationsModule, IgxTreeGridModule]
        }).compileComponents();
    }));

    describe('IgxTreeGrid - default rendering for rows and columns', () => {

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridWrappedInContComponent);
            fix.detectChanges();
            tick(16);
            grid = fix.componentInstance.treeGrid;
        }));

        it('should render 10 records if height is unset and parent container\'s height is unset', () => {
            fix.detectChanges();
            const defaultHeight = fix.debugElement.query(By.css(TBODY_CLASS)).styles.height;
            expect(defaultHeight).not.toBeNull();
            expect(parseInt(defaultHeight, 10)).toBeGreaterThan(400);
            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeTruthy();
            expect(grid.rowList.length).toBeGreaterThanOrEqual(10);
        });

        it('should match width and height of parent container when width/height are set in %', fakeAsync(() => {
            fix.componentInstance.outerWidth = 800;
            fix.componentInstance.outerHeight = 600;
            grid.width = '50%';
            grid.height = '50%';
            fix.detectChanges();
            tick(16);

            expect(window.getComputedStyle(grid.nativeElement).height).toMatch('300px');
            expect(window.getComputedStyle(grid.nativeElement).width).toMatch('400px');
            expect(grid.rowList.length).toBeGreaterThan(0);
        }));

        it('should render 10 records if height is 100% and parent container\'s height is unset', fakeAsync(() => {
            grid.height = '600px';
            tick(16);
            fix.detectChanges();
            const defaultHeight = fix.debugElement.query(By.css(TBODY_CLASS)).styles.height;
            expect(defaultHeight).not.toBeNull();
            expect(parseInt(defaultHeight, 10)).toBeGreaterThan(400);
            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeTruthy();
            expect(grid.rowList.length).toBeGreaterThanOrEqual(10);
        }));

        it(`should render all records exactly if height is 100% and parent container\'s height is unset and
            there are fewer than 10 records in the data view`, (async () => {
                grid.height = '100%';
                fix.componentInstance.data = fix.componentInstance.data.slice(0, 1);
                fix.detectChanges();
                await wait(100);
                fix.detectChanges();
                const defaultHeight = fix.debugElement.query(By.css(TBODY_CLASS)).styles.height;
                expect(defaultHeight).toBeFalsy();
                expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeFalsy();
                expect(grid.rowList.length).toEqual(6);
        }));

        /**
         * reenable after resolving the auto-sizing issues for #4809
         */
        xit(`should render 11 records if height is 100% and parent container\'s height is unset and
            display density is changed`, fakeAsync(() => {
                grid.height = '100%';
                fix.componentInstance.density = DisplayDensity.compact;
                tick(16);
                fix.detectChanges();
                const defaultHeight = fix.debugElement.query(By.css(TBODY_CLASS)).styles.height;
                const defaultHeightNum = parseInt(defaultHeight, 10);
                expect(defaultHeight).not.toBeFalsy();
                expect(defaultHeightNum).toBeGreaterThan(300);
                expect(defaultHeightNum).toBeLessThanOrEqual(330);
                expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeTruthy();
                expect(grid.rowList.length).toEqual(11);
        }));

        it('should display horizontal scroll bar when column width is set in %', () => {
            fix.detectChanges();

            grid.columns[0].width = '50%';
            fix.detectChanges();

            const horizontalScroll = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');
            expect(horizontalScroll.offsetWidth).toBeGreaterThanOrEqual(783);
            expect(horizontalScroll.offsetWidth).toBeLessThanOrEqual(786);
            expect(horizontalScroll.children[0].offsetWidth).toBeGreaterThanOrEqual(799);
            expect(horizontalScroll.children[0].offsetWidth).toBeLessThanOrEqual(801);
        });
    });

    describe('Auto-generated columns', () => {
        beforeEach(waitForAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridAutoGenerateComponent);
            grid = fix.componentInstance.treeGrid;
        }));

        it('should auto-generate columns', fakeAsync(/** height/width setter rAF */() => {
            fix.detectChanges();
            const expectedColumns = ['ID', 'ParentID', 'Name', 'JobTitle', 'Age'];

            expect(grid.columns.map(c => c.field)).toEqual(expectedColumns);
        }));
    });

    describe('Loading Template', () => {
        beforeEach(waitForAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridDefaultLoadingComponent);
            grid = fix.componentInstance.treeGrid;
        }));

        it('should auto-generate columns', async () => {
            fix.detectChanges();
            const gridElement = fix.debugElement.query(By.css('.igx-grid'));
            let loadingIndicator = gridElement.query(By.css('.igx-grid__loading'));
            expect(loadingIndicator).not.toBeNull();
            expect(grid.dataRowList.length).toBe(0);

            await wait(1000);
            fix.detectChanges();
            loadingIndicator = gridElement.query(By.css('.igx-grid__loading'));
            expect(loadingIndicator).toBeNull();
            expect(grid.dataRowList.length).toBeGreaterThan(0);
        });
    });

    it ('checks if attributes are correctly assigned when grid has or does not have data', fakeAsync( () => {
        const fixture = TestBed.createComponent(IgxTreeGridAutoGenerateComponent);
        grid = fixture.componentInstance.treeGrid;

        fixture.detectChanges();
        tick(100);
        // Checks if igx-grid__tbody-content attribute is null when there is data in the grid
        const container = fixture.nativeElement.querySelectorAll('.igx-grid__tbody-content')[0];
        expect(container.getAttribute('role')).toBe(null);

        //Filter grid so no results are available and grid is empty
        grid.filter('index','111',IgxStringFilteringOperand.instance().condition('contains'),true);
        grid.markForCheck();
        fixture.detectChanges();
        expect(container.getAttribute('role')).toMatch('row');

        // clear grid data and check if attribute is now 'row'
        grid.clearFilter();
        fixture.componentInstance.clearData();
        fixture.detectChanges();
        tick(100);

        expect(container.getAttribute('role')).toMatch('row');

    }));

    describe('Hide All', () => {
        beforeEach(waitForAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridCellSelectionComponent);
            grid = fix.componentInstance.treeGrid;
            fix.detectChanges();
        }));

        it('should not render rows, paging and headers group when all cols are hidden', fakeAsync(() => {
            grid.rowSelection = GridSelectionMode.multiple;
            grid.rowDraggable = true;
            grid.showToolbar =  true;
            tick(30);
            fix.detectChanges();

            let fixEl = fix.nativeElement; let gridEl = grid.nativeElement;
            let tHeadItems = fixEl.querySelector('igx-grid-header-group');
            let gridRows = fixEl.querySelector('igx-tree-grid-row');
            let paging = fixEl.querySelector('.igx-paginator');
            let rowSelectors = gridEl.querySelector('.igx-checkbox');
            let dragIndicators = gridEl.querySelector('.igx-grid__drag-indicator');
            let verticalScrollBar = gridEl.querySelector('.igx-grid__tbody-scrollbar[hidden]');

            expect(tHeadItems).not.toBeNull();
            expect(gridRows).not.toBeNull();
            expect(paging).not.toBeNull();
            expect(rowSelectors).not.toBeNull();
            expect(dragIndicators).not.toBeNull();
            expect(verticalScrollBar).toBeNull();

            grid.columnList.forEach((col) => col.hidden = true);
            tick(30);
            fix.detectChanges();
            fixEl = fix.nativeElement;
            gridEl = grid.nativeElement;

            tHeadItems = fixEl.querySelector('igx-grid-header-group');
            gridRows = fixEl.querySelector('igx-tree-grid-row');
            paging = fixEl.querySelector('.igx-paginator');
            rowSelectors = gridEl.querySelector('.igx-checkbox');
            dragIndicators = gridEl.querySelector('.igx-grid__drag-indicator');
            verticalScrollBar = gridEl.querySelector('.igx-grid__tbody-scrollbar[hidden]');

            expect(tHeadItems).toBeNull();
            expect(gridRows).toBeNull();
            expect(paging).toBeNull();
            expect(rowSelectors).toBeNull();
            expect(dragIndicators).toBeNull();
            expect(verticalScrollBar).not.toBeNull();
        }));

    });

    describe('Setting null data', () => {
        it('should not throw error when data is null', () => {
            let errorMessage = '';
            fix = TestBed.createComponent(IgxTreeGridCellSelectionComponent);
            fix.componentInstance.data = null;
            try {
                fix.detectChanges();
            } catch (ex) {
                errorMessage = ex.message;
            }
            expect(errorMessage).toBe('');
        });

        it('should not throw error when data is null and transactions are enabled', () => {
            let errorMessage = '';
            fix = TestBed.createComponent(IgxTreeGridSummariesTransactionsComponent);
            fix.componentInstance.data = null;
            try {
                fix.detectChanges();
            } catch (ex) {
                errorMessage = ex.message;
            }
            expect(errorMessage).toBe('');
        });
    });

});
