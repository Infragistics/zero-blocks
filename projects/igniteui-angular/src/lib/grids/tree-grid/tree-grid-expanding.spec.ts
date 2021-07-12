import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTreeGridModule } from './public_api';
import {
    IgxTreeGridExpandingComponent,
    IgxTreeGridPrimaryForeignKeyComponent,
    IgxTreeGridRowEditingComponent,
    IgxTreeGridLoadOnDemandComponent,
    IgxTreeGridLoadOnDemandHasChildrenComponent,
    IgxTreeGridLoadOnDemandChildDataComponent,
    IgxTreeGridCustomExpandersTemplateComponent
} from '../../test-utils/tree-grid-components.spec';
import { TreeGridFunctions } from '../../test-utils/tree-grid-functions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { first } from 'rxjs/operators';
import { wait } from '../../test-utils/ui-interactions.spec';
import { IgxGridModule } from '../grid/public_api';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { GridSelectionMode } from '../common/enums';
import { IgxTreeGridComponent } from './tree-grid.component';

describe('IgxTreeGrid - Expanding / Collapsing #tGrid', () => {
    configureTestSuite();
    let fix;
    let treeGrid: IgxTreeGridComponent;;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridExpandingComponent,
                IgxTreeGridPrimaryForeignKeyComponent,
                IgxTreeGridLoadOnDemandComponent,
                IgxTreeGridLoadOnDemandHasChildrenComponent,
                IgxTreeGridLoadOnDemandChildDataComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxTreeGridModule]
        })
            .compileComponents();
    }));

    describe('Child Collection', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridExpandingComponent);
            fix.detectChanges();
            tick(16);
            treeGrid = fix.componentInstance.treeGrid;
        }));

        it('check row expanding and collapsing are changing rows count (UI)', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);

            const firstRow = rows[0];
            const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(firstRow);
            indicatorDiv.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(7);

            indicatorDiv.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);
        });

        it('check row expanding and collapsing are changing rows count (API)', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);

            treeGrid.toggleRow(treeGrid.gridAPI.get_row_by_index(0).rowID);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(7);

            treeGrid.toggleRow(treeGrid.gridAPI.get_row_by_index(0).rowID);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);
        });

        it('check expand/collapse indicator changes (UI)', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            rows.forEach(row => {
                TreeGridFunctions.verifyTreeRowHasCollapsedIcon(row);
            });

            for (let rowToToggle = 0; rowToToggle < rows.length; rowToToggle++) {
                const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(rows[rowToToggle]);
                indicatorDiv.triggerEventHandler('click', new Event('click'));
                fix.detectChanges();

                for (let rowToCheck = 0; rowToCheck < rows.length; rowToCheck++) {
                    if (rowToCheck === rowToToggle) {
                        TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[rowToCheck]);
                    } else {
                        TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[rowToCheck]);
                    }
                }

                indicatorDiv.triggerEventHandler('click', new Event('click'));
                fix.detectChanges();
            }

            rows.forEach(row => {
                TreeGridFunctions.verifyTreeRowHasCollapsedIcon(row);
            });
        });

        it('check expand/collapse indicator changes (API)', () => {
            fix.detectChanges();
            const rows = TreeGridFunctions.getAllRows(fix);
            rows.forEach(row => {
                TreeGridFunctions.verifyTreeRowHasCollapsedIcon(row);
            });

            for (let rowToToggle = 0; rowToToggle < rows.length; rowToToggle++) {
                treeGrid.toggleRow(treeGrid.getRowByIndex(rowToToggle).key);
                fix.detectChanges();

                for (let rowToCheck = 0; rowToCheck < rows.length; rowToCheck++) {
                    if (rowToCheck === rowToToggle) {
                        TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[rowToCheck]);
                    } else {
                        TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[rowToCheck]);
                    }
                }
                treeGrid.toggleRow(treeGrid.getRowByIndex(rowToToggle).key);
                fix.detectChanges();
            }

            rows.forEach(row => {
                TreeGridFunctions.verifyTreeRowHasCollapsedIcon(row);
            });
            fix.detectChanges();
        });

        it('check second level records are having the correct indentation (UI)', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(rows[0]);
            indicatorDiv.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 1, 1); // fix, rowIndex, expectedLevel
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 2, 1);
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 3, 1);
        });

        it('check second level records are having the correct indentation (API)', () => {
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();

            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 1, 1); // fix, rowIndex, expectedLevel
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 2, 1);
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 3, 1);
        });

        it('check third level records are having the correct indentation (UI)', () => {
            // expand second level records
            let rows = TreeGridFunctions.getAllRows(fix);
            let indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(rows[0]);
            indicatorDiv.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            // expand third level record
            rows = TreeGridFunctions.getAllRows(fix);
            indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(rows[3]);
            indicatorDiv.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            // check third level records indentation
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 4, 2); // fix, rowIndex, expectedLevel
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 5, 2);
        });

        it('check third level records are having the correct indentation (API)', () => {
            // expand second level records
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();

            // expand third level record
            treeGrid.toggleRow(treeGrid.getRowByIndex(3).key);
            fix.detectChanges();

            // check third level records indentation
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 4, 2); // fix, rowIndex, expectedLevel
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 5, 2);
        });

        it('check grand children are not visible when collapsing their grand parent', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);

            // expand second level records
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();

            // expand third level record
            treeGrid.toggleRow(treeGrid.getRowByIndex(3).key);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(9);

            // collapse first row with all its children and grand children
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);
        });

        it('should expand/collapse rows when changing the \'expanded\' property', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);

            // expand a root level row
            let aRow = treeGrid.gridAPI.get_row_by_index(0);
            expect(aRow.cells.first.value).toBe(147, 'wrong root level row');
            expect(aRow.expanded).toBe(false);
            aRow.expanded = true;
            fix.detectChanges();
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(7, 'root level row expanding problem');

            // expand a second level row
            aRow = treeGrid.gridAPI.get_row_by_index(3);
            expect(aRow.cells.first.value).toBe(317, 'wrong second level row');
            expect(aRow.expanded).toBe(false);
            aRow.expanded = true;
            fix.detectChanges();
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(9, 'second level row expanding problem');

            // check third level rows are having the correct values
            aRow = treeGrid.gridAPI.get_row_by_index(4);
            expect(aRow.cells.first.value).toBe(711, 'wrong third level row');
            aRow = treeGrid.gridAPI.get_row_by_index(5);
            expect(aRow.cells.first.value).toBe(998, 'wrong third level row');

            // collapse a second level row
            aRow = treeGrid.gridAPI.get_row_by_index(3);
            aRow.expanded = false;
            fix.detectChanges();
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(7, 'second level row collapsing problem');

            // collapse a root level row
            aRow = treeGrid.gridAPI.get_row_by_index(0);
            aRow.expanded = false;
            fix.detectChanges();
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4, 'root level row collapsing problem');
        });

        it('should expand/collapse when using \'expandAll\' and \'collapseAll\' methods', async () => {
            treeGrid.perPage = 50;
            await wait();
            fix.detectChanges();

            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);

            treeGrid.expandAll();
            await wait();
            fix.detectChanges();
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBeGreaterThan(10);
            expect(rows.length).toBeLessThan(14);

            treeGrid.collapseAll();
            await wait();
            fix.detectChanges();
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);
        });

        it('should emit an event when expanding rows (API)', (done) => {
            const aRow = treeGrid.gridAPI.get_row_by_index(0);
            treeGrid.rowToggle.pipe(first()).subscribe((args) => {
                expect(args.cancel).toBe(false);
                expect(args.event).toBeUndefined();
                expect(args.expanded).toBe(true);
                expect(args.rowID.ID).toBe(147);
                done();
            });
            aRow.expanded = true;
        });

        it('should emit an event when collapsing rows (API)', (done) => {
            const aRow = treeGrid.gridAPI.get_row_by_index(0);
            aRow.expanded = true;
            fix.detectChanges();
            treeGrid.rowToggle.pipe(first()).subscribe((args) => {
                expect(args.cancel).toBe(false);
                expect(args.event).toBeUndefined();
                expect(args.expanded).toBe(false);
                expect(args.rowID.ID).toBe(147);
                done();
            });
            aRow.expanded = false;
            fix.detectChanges();
        });

        it('should emit an event when expanding rows (UI)', (done) => {
            treeGrid.rowToggle.pipe(first()).subscribe((args) => {
                expect(args.cancel).toBe(false);
                expect(args.event).toBeDefined();
                expect(args.expanded).toBe(true);
                expect(args.rowID.ID).toBe(147);
                done();
            });
            const rowsDOM = TreeGridFunctions.getAllRows(fix);
            const indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[0]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
        });

        it('should emit an event when collapsing rows (UI)', (done) => {
            const rowsDOM = TreeGridFunctions.getAllRows(fix);
            const indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[0]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();
            treeGrid.rowToggle.pipe(first()).subscribe((args) => {
                expect(args.cancel).toBe(false);
                expect(args.event).toBeDefined();
                expect(args.expanded).toBe(false);
                expect(args.rowID.ID).toBe(147);
                done();
            });
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();
        });

        it('should update current page when \'collapseAll\' ', fakeAsync(() => {
            // Test prerequisites
            fix.detectChanges();
            treeGrid.perPage = 4;
            fix.detectChanges();
            tick(16);

            treeGrid.expandAll();
            fix.detectChanges();

            // Verify current page
            verifyGridPager(fix, 4, '147', '1\xA0of\xA05', [true, true, false, false]);
            expect(treeGrid.totalPages).toBe(5);

            // Go to fourth page
            treeGrid.page = 3;
            fix.detectChanges();
            tick(16);

            // Verify current page
            verifyGridPager(fix, 4, '17', '4\xA0of\xA05', [false, false, false, false]);
            expect(treeGrid.totalPages).toBe(5);

            treeGrid.collapseAll();
            fix.detectChanges();

            // Verify current page is the first one and only root rows are visible.
            verifyGridPager(fix, 4, '147', '1\xA0of\xA01', [true, true, true, true]);
            expect(treeGrid.totalPages).toBe(1);
        }));

        it('Should update the paginator when a row of any level is expanded', fakeAsync(() => {
            // Test prerequisites
            treeGrid.paging = true;
            treeGrid.perPage = 5;
            fix.detectChanges();
            tick(16);

            treeGrid.collapseAll();
            fix.detectChanges();
            tick(16);

            // Verify current page
            verifyGridPager(fix, 4, '147', '1\xA0of\xA01', [true, true, true, true]);
            expect(treeGrid.totalPages).toBe(1);

            // Expand a row
            const rowsDOM = TreeGridFunctions.getAllRows(fix);
            let indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[3]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            // Verify current page
            verifyGridPager(fix, 5, '147', '1\xA0of\xA02', [true, true, false, false]);
            expect(treeGrid.totalPages).toBe(2);

            // Expand another row
            indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[1]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            treeGrid.page = 1;
            fix.detectChanges();
            tick(16);

            indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[1]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            // Verify current page
            verifyGridPager(fix, 5, '17', '2\xA0of\xA03', [false, false, false, false]);
            expect(treeGrid.totalPages).toBe(3);
        }));

        it('Should update the paginator when a row of any level is collapsed', fakeAsync(() => {
            // Test prerequisites
            treeGrid.paging = true;
            treeGrid.perPage = 5;
            fix.detectChanges();
            tick(16);

            treeGrid.expandAll();
            fix.detectChanges();
            tick(16);

            // Verify current page
            verifyGridPager(fix, 5, '147', '1\xA0of\xA04', [true, true, false, false]);
            expect(treeGrid.totalPages).toBe(4);

            // Go to third page
            treeGrid.page = 2;
            fix.detectChanges();
            tick(16);
            verifyGridPager(fix, 5, '19', '3\xA0of\xA04', [false, false, false, false]);
            expect(treeGrid.totalPages).toBe(4);

            const rowsDOM = TreeGridFunctions.getAllRows(fix);
            let indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[0]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();
            indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[2]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            // // Verify current page
            verifyGridPager(fix, 4, '19', '3\xA0of\xA03', [false, false, true, true]);
            expect(treeGrid.totalPages).toBe(3);

            treeGrid.page = 0;
            fix.detectChanges();
            tick(16);
            indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[0]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            // // Verify current page
            verifyGridPager(fix, 5, '147', '1\xA0of\xA02', [true, true, false, false]);
            expect(treeGrid.totalPages).toBe(2);
        }));

        it('Should update the paginator when navigating through pages', () => {
            // Test prerequisites
            fix.detectChanges();

            // Verify current page
            verifyGridPager(fix, 4, '147', '1\xA0of\xA01', [true, true, true, true]);
            expect(treeGrid.totalPages).toBe(1);

            // Go to third page
            const rowsDOM = TreeGridFunctions.getAllRows(fix);
            let indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[3]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[1]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[0]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            const tGrid: HTMLElement = treeGrid.nativeElement;
            GridFunctions.navigateToNextPage(tGrid);
            fix.detectChanges();
            // Verify current page
            verifyGridPager(fix, 1, '101', '2\xA0of\xA02', [false, false, true, true]);
            expect(treeGrid.totalPages).toBe(2);

            GridFunctions.navigateToFirstPage(tGrid);
            fix.detectChanges();
            // Verify current page
            verifyGridPager(fix, 10, '147', '1\xA0of\xA02', [true, true, false, false]);
            expect(treeGrid.totalPages).toBe(2);
        });
    });

    describe('Primary/Foreign key', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
            fix.detectChanges();
            tick(16);
            treeGrid = fix.componentInstance.treeGrid;
            treeGrid.expansionDepth = 0;
            fix.detectChanges();
        }));

        it('check row expanding and collapsing are changing rows count (UI)', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3);

            const firstRow = rows[0];
            const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(firstRow);
            indicatorDiv.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(5);
            indicatorDiv.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3);
        });

        it('check row expanding and collapsing are changing rows count (API)', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3);

            treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(5);

            treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3);
        });

        it('check expand/collapse indicator changes (UI)', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            rows.forEach(row => {
                TreeGridFunctions.verifyTreeRowHasCollapsedIcon(row);
            });

            for (let rowToToggle = 0; rowToToggle < rows.length; rowToToggle++) {
                if (rowToToggle === 1) {
                    continue;
                }
                const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(rows[rowToToggle]);
                indicatorDiv.triggerEventHandler('click', new Event('click'));
                fix.detectChanges();

                for (let rowToCheck = 0; rowToCheck < rows.length; rowToCheck++) {
                    if (rowToCheck === rowToToggle) {
                        TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[rowToCheck]);
                    } else {
                        TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[rowToCheck]);
                    }
                }

                indicatorDiv.triggerEventHandler('click', new Event('click'));
                fix.detectChanges();
            }

            rows.forEach(row => {
                TreeGridFunctions.verifyTreeRowHasCollapsedIcon(row);
            });
        });

        it('check expand/collapse indicator changes (API)', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            rows.forEach(row => {
                TreeGridFunctions.verifyTreeRowHasCollapsedIcon(row);
            });

            for (let rowToToggle = 0; rowToToggle < rows.length; rowToToggle++) {
                const ri = treeGrid.getRowByIndex(rowToToggle).key;
                treeGrid.toggleRow(ri);
                fix.detectChanges();
                for (let rowToCheck = 0; rowToCheck < rows.length; rowToCheck++) {
                    if (rowToCheck === rowToToggle && treeGrid.gridAPI.allow_expansion_state_change(ri, false)) {
                        TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[rowToCheck]);
                    } else {
                        TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[rowToCheck]);
                    }
                }
                treeGrid.toggleRow(treeGrid.getRowByIndex(rowToToggle).key);
                fix.detectChanges();
            }

            rows.forEach(row => {
                TreeGridFunctions.verifyTreeRowHasCollapsedIcon(row);
            });
        });

        it('check second level records are having the correct indentation (UI)', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(rows[0]);
            indicatorDiv.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 1, 1); // fix, rowIndex, expectedLevel
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 2, 1);
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 3, 0);
        });

        it('check second level records are having the correct indentation (API)', () => {
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();

            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 1, 1); // fix, rowIndex, expectedLevel
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 2, 1);
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 3, 0);
        });

        it('check third level records are having the correct indentation (UI)', () => {
            // expand second level records
            let rows = TreeGridFunctions.getAllRows(fix);
            let indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(rows[0]);
            indicatorDiv.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            // expand third level record
            rows = TreeGridFunctions.getAllRows(fix);
            indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(rows[1]);
            indicatorDiv.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            // check third level records indentation
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 2, 2); // fix, rowIndex, expectedLevel
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 3, 2);
        });

        it('check third level records are having the correct indentation (API)', () => {
            // expand second level records
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();
            // expand third level record
            treeGrid.toggleRow(treeGrid.getRowByIndex(1).key);
            fix.detectChanges();

            // check third level records indentation
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 2, 2); // fix, rowIndex, expectedLevel
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 3, 2);
        });

        it('check grand children are not visible when collapsing their grand parent', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3);

            // expand second level records
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();

            // expand third level record
            treeGrid.toggleRow(treeGrid.getRowByIndex(1).key);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(7);

            // collapse first row with all its children and grand children
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3);
        });

        it('should expand/collapse rows when changing the \'expanded\' property', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3);

            // expand a root level row
            let aRow = treeGrid.gridAPI.get_row_by_index(0);
            expect(aRow.cells.first.value).toBe(1, 'wrong root level row');
            expect(aRow.expanded).toBe(false);
            aRow.expanded = true;
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(5, 'root level row expanding problem');

            // expand a second level row
            aRow = treeGrid.gridAPI.get_row_by_index(1);
            expect(aRow.cells.first.value).toBe(2, 'wrong second level row');
            expect(aRow.expanded).toBe(false);
            aRow.expanded = true;
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(7, 'second level row expanding problem');

            // check third level rows are having the correct values
            aRow = treeGrid.gridAPI.get_row_by_index(2);
            expect(aRow.cells.first.value).toBe(3, 'wrong third level row');
            aRow = treeGrid.gridAPI.get_row_by_index(3);
            expect(aRow.cells.first.value).toBe(7, 'wrong third level row');

            // collapse a second level row
            aRow = treeGrid.gridAPI.get_row_by_index(1);
            aRow.expanded = false;
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(5, 'second level row collapsing problem');

            // collapse a root level row
            aRow = treeGrid.gridAPI.get_row_by_index(0);
            aRow.expanded = false;
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3, 'root level row collapsing problem');
        });

        it('should expand/collapse when using \'expandAll\' and \'collapseAll\' methods', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3);

            treeGrid.expandAll();
            fix.detectChanges();
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(8);

            treeGrid.collapseAll();
            fix.detectChanges();

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3);
        });

        it('should emit an event when expanding rows (API)', (done) => {
            const aRow = treeGrid.getRowByIndex(0);
            treeGrid.rowToggle.pipe(first()).subscribe((args) => {
                expect(args.cancel).toBe(false);
                expect(args.event).toBeUndefined();
                expect(args.expanded).toBe(true);
                expect(args.rowID).toBe(1);
                done();
            });
            aRow.expanded = true;
        });

        it('should emit an event when collapsing rows (API)', (done) => {
            const aRow = treeGrid.getRowByIndex(0);
            aRow.expanded = true;
            fix.detectChanges();

            treeGrid.rowToggle.pipe(first()).subscribe((args) => {
                expect(args.cancel).toBe(false);
                expect(args.event).toBeUndefined();
                expect(args.expanded).toBe(false);
                expect(args.rowID).toBe(1);
                done();
            });
            aRow.expanded = false;
        });

        it('should emit an event when expanding rows (UI)', (done) => {
            treeGrid.rowToggle.pipe(first()).subscribe((args) => {
                expect(args.cancel).toBe(false);
                expect(args.event).toBeDefined();
                expect(args.expanded).toBe(true);
                expect(args.rowID).toBe(1);
                done();
            });
            const rowsDOM = TreeGridFunctions.getAllRows(fix);
            const indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[0]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
        });

        it('should emit an event when collapsing rows (UI)', (done) => {
            const rowsDOM = TreeGridFunctions.getAllRows(fix);
            const indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[0]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            treeGrid.rowToggle.pipe(first()).subscribe((args) => {
                expect(args.cancel).toBe(false);
                expect(args.event).toBeDefined();
                expect(args.expanded).toBe(false);
                expect(args.rowID).toBe(1);
                done();
            });
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
        });

        it('should update current page when \'collapseAll\' ', fakeAsync(() => {
            // Test prerequisites
            fix.componentInstance.paging = true;
            fix.detectChanges();
            treeGrid.perPage = 2;
            fix.detectChanges();
            tick(16);
            treeGrid.expandAll();

            fix.detectChanges();
            tick(16);
            // Verify current page
            verifyGridPager(fix, 2, '1', '1\xA0of\xA04', [true, true, false, false]);
            expect(treeGrid.totalPages).toBe(4);

            // Go to fourth page
            treeGrid.page = 3;
            fix.detectChanges();
            tick(16);
            // Verify current page
            verifyGridPager(fix, 2, '10', '4\xA0of\xA04', [false, false, true, true]);
            expect(treeGrid.totalPages).toBe(4);

            treeGrid.collapseAll();
            fix.detectChanges();
            tick(16);
            // Verify current page is the last one and only root rows are visible.
            verifyGridPager(fix, 1, '10', '2\xA0of\xA02', [false, false, true, true]);
            expect(treeGrid.totalPages).toBe(2);
            tick(16);
        }));

        it('Should update the paginator when a row of any level is expanded', fakeAsync(() => {
            // Test prerequisites
            fix.componentInstance.paging = true;
            fix.detectChanges();
            treeGrid.perPage = 5;
            fix.detectChanges();
            tick(16);

            treeGrid.collapseAll();
            fix.detectChanges();
            tick(16);

            // Verify current page
            verifyGridPager(fix, 3, '1', '1\xA0of\xA01', [true, true, true, true]);
            expect(treeGrid.totalPages).toBe(1);

            // Expand a row
            const rowsDOM = TreeGridFunctions.getAllRows(fix);
            let indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[0]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            // Verify current page
            verifyGridPager(fix, 5, '1', '1\xA0of\xA01', [true, true, true, true]);
            expect(treeGrid.totalPages).toBe(1);

            // Expand another row
            indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[1]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();
            // Verify current page
            verifyGridPager(fix, 5, '1', '1\xA0of\xA02', [true, true, false, false]);
            expect(treeGrid.totalPages).toBe(2);

            treeGrid.page = 1;
            fix.detectChanges();
            tick(16);
            indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[1]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            // Verify current page
            verifyGridPager(fix, 3, '6', '2\xA0of\xA02', [false, false, true, true]);
            expect(treeGrid.totalPages).toBe(2);
        }));

        it('Should update the paginator when a row of any level is collapsed', fakeAsync(() => {
            // Test prerequisites
            fix.componentInstance.paging = true;
            fix.detectChanges();
            treeGrid.perPage = 5;
            fix.detectChanges();
            tick(16);

            treeGrid.expandAll();
            fix.detectChanges();
            tick(16);

            // Verify current page
            verifyGridPager(fix, 5, '1', '1\xA0of\xA02', [true, true, false, false]);
            expect(treeGrid.totalPages).toBe(2);

            // Go to third page
            fix.detectChanges();
            const rowsDOM = TreeGridFunctions.getAllRows(fix);
            let indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[0]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();
            indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[2]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            // // Verify current page
            verifyGridPager(fix, 3, '1', '1\xA0of\xA01', [true, true, true, true]);
            expect(treeGrid.totalPages).toBe(1);
        }));

        it('Should update the paginator when navigating through pages', fakeAsync(() => {
            // Test prerequisites
            fix.componentInstance.paging = true;
            fix.detectChanges();
            treeGrid.perPage = 5;
            fix.detectChanges();
            tick(16);

            // Verify current page
            verifyGridPager(fix, 3, '1', '1\xA0of\xA01', [true, true, true, true]);
            expect(treeGrid.totalPages).toBe(1);

            // Go to third page
            const rowsDOM = TreeGridFunctions.getAllRows(fix);
            let indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[2]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[0]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            fix.detectChanges();

            // Verify current page
            verifyGridPager(fix, 5, '1', '1\xA0of\xA02', [true, true, false, false]);
            expect(treeGrid.totalPages).toBe(2);

            const tGrid: HTMLElement = treeGrid.nativeElement;
            GridFunctions.navigateToLastPage(tGrid);
            fix.detectChanges();
            tick(16);
            // Verify current page
            verifyGridPager(fix, 1, '9', '2\xA0of\xA02', [false, false, true, true]);
            expect(treeGrid.totalPages).toBe(2);

            GridFunctions.navigateToPrevPage(tGrid);
            fix.detectChanges();
            tick(16);
            // Verify current page
            verifyGridPager(fix, 5, '1', '1\xA0of\xA02', [true, true, false, false]);
            expect(treeGrid.totalPages).toBe(2);
        }));
    });

    describe('Load On Demand', () => {

        describe('Primary/Foreign key', () => {
            beforeEach(fakeAsync(/** height/width setter rAF */() => {
                fix = TestBed.createComponent(IgxTreeGridLoadOnDemandComponent);
                fix.detectChanges();
                tick(16);
                treeGrid = fix.componentInstance.treeGrid;
            }));

            it('check expanding and collapsing a row with children', async () => {
                let rows = TreeGridFunctions.getAllRows(fix);
                const row = rows[0];
                TreeGridFunctions.verifyTreeRowIndicator(row, false);
                expect(rows.length).toBe(3);

                let indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(row);
                indicatorDiv.triggerEventHandler('click', new Event('click'));
                await wait(500);
                fix.detectChanges();

                rows = TreeGridFunctions.getAllRows(fix);
                TreeGridFunctions.verifyTreeRowIndicator(row, true);
                expect(rows.length).toBe(3);
                await wait(550);
                fix.detectChanges();

                rows = TreeGridFunctions.getAllRows(fix);
                TreeGridFunctions.verifyTreeRowIndicator(row, false);
                expect(rows.length).toBe(5);
                indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(row);
                indicatorDiv.triggerEventHandler('click', new Event('click'));
                await wait(16);
                fix.detectChanges();

                rows = TreeGridFunctions.getAllRows(fix);
                TreeGridFunctions.verifyTreeRowIndicator(row, false);
                expect(rows.length).toBe(3);
            });

            it('check expanding and collapsing a row without children', async () => {
                let rows = TreeGridFunctions.getAllRows(fix);
                const row = rows[1];
                const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(row);
                TreeGridFunctions.verifyTreeRowIndicator(row, false);
                expect(rows.length).toBe(3);
                indicatorDiv.triggerEventHandler('click', new Event('click'));
                await wait(500);
                fix.detectChanges();

                rows = TreeGridFunctions.getAllRows(fix);
                TreeGridFunctions.verifyTreeRowIndicator(row, true);
                expect(rows.length).toBe(3);
                await wait(550);
                fix.detectChanges();

                rows = TreeGridFunctions.getAllRows(fix);
                TreeGridFunctions.verifyTreeRowIndicator(row, false, false);
                expect(rows.length).toBe(3);
            });

            it('check row selection when expand a row', async () => {
                treeGrid.rowSelection = GridSelectionMode.multiple;
                fix.detectChanges();

                treeGrid.selectAllRows();
                fix.detectChanges();

                TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);
                expect(treeGrid.selectedRows).toEqual([1, 6, 10]);

                let rows = TreeGridFunctions.getAllRows(fix);
                const row = rows[0];
                expect(rows.length).toBe(3);

                const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(row);
                indicatorDiv.triggerEventHandler('click', new Event('click'));
                await wait(1050);
                fix.detectChanges();
                await wait(50);

                rows = TreeGridFunctions.getAllRows(fix);
                expect(rows.length).toBe(5);
                TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
                TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, true);
                TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, false);
                TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 2, false);
                TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, true);
                TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 4, true);
                expect(treeGrid.selectedRows).toEqual([1, 6, 10]);
            });

            it('check row selection within multipleCascade selection mode when expand a row', fakeAsync(() => {
                treeGrid.rowSelection = GridSelectionMode.multipleCascade;
                fix.detectChanges();

                treeGrid.selectRows([1]);
                fix.detectChanges();

                expect(treeGrid.selectedRows).toEqual([1]);
                TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, true, true);

                treeGrid.expandRow(1);
                fix.detectChanges();
                tick(1000);
                fix.detectChanges();

                expect(treeGrid.rowList.length).toBe(5);
                expect(treeGrid.selectedRows.length).toBe(3);
                TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, true, true);
                TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 1, true, true);
                TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 2, true, true);

                treeGrid.expandRow(2);
                fix.detectChanges();
                tick(1000);
                fix.detectChanges();

                expect(treeGrid.rowList.length).toBe(7);
                expect(treeGrid.selectedRows.length).toBe(5);
                TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, true, true);
                TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 1, true, true);
                TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 2, true, true);
                TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);
                TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 4, true, true);
            }));
        });

        describe('ChildDataKey', () => {
            beforeEach(fakeAsync(/** height/width setter rAF */() => {
                fix = TestBed.createComponent(IgxTreeGridLoadOnDemandChildDataComponent);
                fix.detectChanges();
                tick(16);
                treeGrid = fix.componentInstance.treeGrid;
            }));

            it('check expanding and collapsing a row with children', async () => {
                let rows = TreeGridFunctions.getAllRows(fix);
                const row = rows[0];
                TreeGridFunctions.verifyTreeRowIndicator(row, false);
                expect(rows.length).toBe(3);

                let indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(row);
                indicatorDiv.triggerEventHandler('click', new Event('click'));
                fix.detectChanges();
                await wait(500);
                fix.detectChanges();

                rows = TreeGridFunctions.getAllRows(fix);
                TreeGridFunctions.verifyTreeRowIndicator(row, true);
                expect(rows.length).toBe(3);
                fix.detectChanges();
                await wait(550);
                fix.detectChanges();

                rows = TreeGridFunctions.getAllRows(fix);
                TreeGridFunctions.verifyTreeRowIndicator(row, false);
                expect(rows.length).toBe(5);
                indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(row);
                indicatorDiv.triggerEventHandler('click', new Event('click'));
                fix.detectChanges();
                await wait(16);
                fix.detectChanges();

                rows = TreeGridFunctions.getAllRows(fix);
                TreeGridFunctions.verifyTreeRowIndicator(row, false);
                expect(rows.length).toBe(3);
            });

            it('check expanding and collapsing a row without children', async () => {
                let rows = TreeGridFunctions.getAllRows(fix);
                const row = rows[1];
                const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(row);
                TreeGridFunctions.verifyTreeRowIndicator(row, false);
                expect(rows.length).toBe(3);
                indicatorDiv.triggerEventHandler('click', new Event('click'));
                await wait(500);
                fix.detectChanges();

                rows = TreeGridFunctions.getAllRows(fix);
                TreeGridFunctions.verifyTreeRowIndicator(row, true);
                expect(rows.length).toBe(3);
                await wait(550);
                fix.detectChanges();

                rows = TreeGridFunctions.getAllRows(fix);
                TreeGridFunctions.verifyTreeRowIndicator(row, false, false);
                expect(rows.length).toBe(3);
            });
        });

        describe('HasChildrenKey', () => {
            beforeEach(fakeAsync(/** height/width setter rAF */() => {
                fix = TestBed.createComponent(IgxTreeGridLoadOnDemandHasChildrenComponent);
                fix.detectChanges();
                tick(16);
                treeGrid = fix.componentInstance.treeGrid;
            }));

            it('check expanding and collapsing a row with children', async () => {
                let rows = TreeGridFunctions.getAllRows(fix);
                const firstRow = rows[0];
                const secondRow = rows[1];
                TreeGridFunctions.verifyTreeRowIndicator(firstRow, false);
                TreeGridFunctions.verifyTreeRowIndicator(secondRow, false, false);
                expect(rows.length).toBe(3);

                let indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(firstRow);
                indicatorDiv.triggerEventHandler('click', new Event('click'));
                await wait(500);
                fix.detectChanges();

                rows = TreeGridFunctions.getAllRows(fix);
                TreeGridFunctions.verifyTreeRowIndicator(firstRow, true);
                expect(rows.length).toBe(3);
                await wait(550);
                fix.detectChanges();

                rows = TreeGridFunctions.getAllRows(fix);
                TreeGridFunctions.verifyTreeRowIndicator(firstRow, false);
                expect(rows.length).toBe(5);
                indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(firstRow);
                indicatorDiv.triggerEventHandler('click', new Event('click'));
                await wait(16);
                fix.detectChanges();

                rows = TreeGridFunctions.getAllRows(fix);
                TreeGridFunctions.verifyTreeRowIndicator(firstRow, false);
                expect(rows.length).toBe(3);
            });
        });
    });

});

describe('Row editing expanding/collapsing #tGrid', () => {
    configureTestSuite();
    let fix;
    let treeGrid;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridRowEditingComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxTreeGridModule]
        })
            .compileComponents();
    }));

    beforeEach(fakeAsync(/** height/width setter rAF */() => {
        fix = TestBed.createComponent(IgxTreeGridRowEditingComponent);
        fix.detectChanges();
        tick(16);
        treeGrid = fix.componentInstance.treeGrid;
    }));

    it('Hide banner with collapsing a node, using UI', fakeAsync(() => {
        const rows = TreeGridFunctions.getAllRows(fix);

        const cell = treeGrid.getCellByColumn(1, 'Name');
        cell.setEditMode(true);
        tick(16);
        fix.detectChanges();
        expect(treeGrid.rowEditingOverlay.collapsed).toBeFalsy('Edit overlay should be visible');

        const firstRow = rows[0];
        const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(firstRow);
        indicatorDiv.triggerEventHandler('click', new Event('click'));
        fix.detectChanges();
        tick(16);
        expect(treeGrid.rowEditingOverlay.collapsed).toBeTruthy('Edit overlay should hide');

        indicatorDiv.triggerEventHandler('click', new Event('click'));
        fix.detectChanges();
        tick(16);
        expect(treeGrid.rowEditingOverlay.collapsed).toBeTruthy('Edit overlay should not show again');
    }));

    it('Hide banner with collapsing a node, using API', fakeAsync(() => {
        const cell = treeGrid.getCellByColumn(1, 'Name');
        cell.setEditMode(true);
        tick(16);
        fix.detectChanges();
        expect(treeGrid.rowEditingOverlay.collapsed).toBeFalsy('Edit overlay should be visible');

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
        tick(16);
        fix.detectChanges();
        expect(treeGrid.rowEditingOverlay.collapsed).toBeTruthy('Edit overlay should hide');

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
        tick(16);
        fix.detectChanges();
        expect(treeGrid.rowEditingOverlay.collapsed).toBeTruthy('Edit overlay should not show again');
    }));

    // The following tests were written,
    // when collapsing/expanding was not causing cell/row to exit edit mode.
    // They were checking if row edit was hidden/shown.
    // Later any collapse/expand of the tree grid was exiting edit mode.
    // Please delete those test if you don't think this functionality will be reverted
    // and cell will stay in edit mode even row is collapsed/expanded.

    /*it('Hide banner with collapsing a parent node, using UI', fakeAsync(() => {
        // Test summary: Edit first child of the first row, then collapse parent row and see that row overlay is hidden.
        // Then expand again parent row and see that overlay is visible. All this clicking row indicator.
        const rows = TreeGridFunctions.getAllRows(fix);

        const cell = treeGrid.getCellByColumn(1, 'Name');
        cell.setEditMode(true);
        tick(16);
        fix.detectChanges();
        const overlayContent = treeGrid.rowEditingOverlay.element.parentElement;

        const firstRow = rows[0];
        const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(firstRow);
        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick(16);
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('none');

        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick(16);
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');
    }));

    it('Hide banner with collapsing a parent node, using API', fakeAsync(() => {
        // Test summary: Edit first child of the first row, then collapse parent row and see that row overlay is hidden.
        // Then expand again parent row and see that overlay is visible. All this using API.
        const rows = TreeGridFunctions.getAllRows(fix);

        const cell = treeGrid.getCellByColumn(1, 'Name');
        cell.setEditMode(true);
        tick(16);
        fix.detectChanges();
        const overlayContent = treeGrid.rowEditingOverlay.element.parentElement;

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
        tick(16);
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('none');

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
        tick(16);
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');
    }));

    it('Do not hide parent banner while collapsing the parent node, using UI', fakeAsync(() => {
        // Test summary: Edit parent row, then collapse parent row and see that row overlay is still visible.
        // Then expand again parent row and see that again it is visible. All this clicking row indicator.
        const rows = TreeGridFunctions.getAllRows(fix);

        const cell = treeGrid.getCellByColumn(0, 'Name');
        cell.setEditMode(true);
        tick(16);
        fix.detectChanges();
        const overlayContent = treeGrid.rowEditingOverlay.element.parentElement;

        const firstRow = rows[0];
        const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(firstRow);
        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick(16);
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');

        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick(16);
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');
    }));

    it('Do not hide parent banner while collapsing the parent node, using API', fakeAsync(() => {
        // Test summary: Edit parent row, then collapse parent row and see that row overlay is still visible.
        // Then expand again parent row and see that again it is visible. All this using API.
        const rows = TreeGridFunctions.getAllRows(fix);

        const cell = treeGrid.getCellByColumn(1, 'Name');
        cell.setEditMode(true);
        tick(16);
        fix.detectChanges();
        const overlayContent = treeGrid.rowEditingOverlay.element.parentElement;

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
        tick(16);
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
        tick(16);
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');
    }));

    it('Do not hide banner while collapsing node that is NOT a parent one, using UI', fakeAsync(() => {
        // Test summary: Edit a row, then collapse row that is not parent of the edit row - then row overlay should be visible.
        // Then expand again parent row and see that again it is visible. All this clicking row indicator.
        const rows = TreeGridFunctions.getAllRows(fix);

        const cell = treeGrid.getCellByColumn(9, 'Name');
        cell.setEditMode(true);
        tick(16);
        fix.detectChanges();
        const overlayContent = treeGrid.rowEditingOverlay.element.parentElement;

        const firstRow = rows[0];
        const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(firstRow);
        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick(16);
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');

        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick(16);
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');
    }));

    it('Do not hide banner while collapsing node that is NOT a parent one, using API', fakeAsync(() => {
        // Test summary: Edit a row, then collapse row that is not parent of the edit row - then row overlay should be visible.
        // Then expand again parent row and see that again it is visible. All this using API.
        const rows = TreeGridFunctions.getAllRows(fix);

        const cell = treeGrid.getCellByColumn(9, 'Name');
        cell.setEditMode(true);
        tick(16);
        fix.detectChanges();
        const editRow = cell.row.nativeElement;
        const banner = document.getElementsByClassName('igx-overlay__content')[0] as HTMLElement;
        const overlayContent = treeGrid.rowEditingOverlay.element.parentElement;

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
        tick(16);
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).key);
        tick(16);
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');
    }));

    it('Hide banner while collapsing node that is NOT a parent one, but goes outside visible area, using UI', fakeAsync(() => {
        // Test summary: First make grid 300px.
        // Edit a row, then expand row that is not parent of the edit row, but the expanded row has so many records
        // that they push the edit row outside the visible area - then row overlay should be hidden.
        // Then collapse again previously expanded row and see that again it is visible. All this clicking row indicator.

        treeGrid.height = '300px'; // THIS IS NOT WORKING - the grid height is changed, but not the grid body height.
        tick(16);
        fix.detectChanges();

        const rows = TreeGridFunctions.getAllRows(fix);
        const firstRow = rows[0];
        const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(firstRow);
        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick(16);
        fix.detectChanges();

        const cell = treeGrid.getCellByColumn(3, 'Name');
        cell.setEditMode(true);
        tick(16);
        fix.detectChanges();
        const overlayContent = treeGrid.rowEditingOverlay.element.parentElement;

        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick(16);
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('none');

        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick(16);
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');
    }));*/
});

describe('Custom expand/collapse template #tGrid', () => {
    configureTestSuite();
    let fix;
    let treeGrid;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridCustomExpandersTemplateComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule,
                IgxTreeGridModule]
        })
            .compileComponents();
    }));

    beforeEach(fakeAsync(/** height/width setter rAF */() => {
        fix = TestBed.createComponent(IgxTreeGridCustomExpandersTemplateComponent);
        fix.detectChanges();
        tick(16);
        treeGrid = fix.componentInstance.treeGrid;
    }));

    it('should allow setting custom template for  expand/collapse icons', async () => {
        const row = treeGrid.dataRowList.toArray()[0];
        let expander =  row.nativeElement.querySelector('.igx-grid__tree-grouping-indicator');
        expect(expander.innerText).toBe('EXPANDED');

        row.expanded = false;
        await wait();
        fix.detectChanges();
        expander =  row.nativeElement.querySelector('.igx-grid__tree-grouping-indicator');
        expect(expander.innerText).toBe('COLLAPSED');
    });
});

const verifyGridPager = (fix, rowsCount, firstCellValue, pagerText, buttonsVisibility) => {
    const disabled = 'igx-button--disabled';
    const grid = fix.componentInstance.treeGrid;
    const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');

    expect(grid.getCellByColumn(0, 'ID').value).toMatch(firstCellValue);
    expect(grid.rowList.length).toEqual(rowsCount, 'Invalid number of rows initialized');

    if (pagerText != null) {
        expect(gridElement.querySelector('igx-page-nav')).toBeDefined();
        expect(gridElement.querySelectorAll('igx-select').length).toEqual(1);
        expect(gridElement.querySelector('.igx-page-nav__text').textContent).toMatch(pagerText);
    }
    if (buttonsVisibility != null && buttonsVisibility.length === 4) {
        const pagingButtons = GridFunctions.getPagingButtons(gridElement);
        expect(pagingButtons.length).toEqual(4);
        expect(pagingButtons[0].className.includes(disabled)).toBe(buttonsVisibility[0]);
        expect(pagingButtons[1].className.includes(disabled)).toBe(buttonsVisibility[1]);
        expect(pagingButtons[2].className.includes(disabled)).toBe(buttonsVisibility[2]);
        expect(pagingButtons[3].className.includes(disabled)).toBe(buttonsVisibility[3]);
    }
};
