import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxTreeGridModule, IgxGridCellComponent } from './public_api';
import { IgxTreeGridCellComponent } from './tree-cell.component';
import {
    IgxTreeGridSimpleComponent,
    IgxTreeGridCellSelectionComponent,
    IgxTreeGridSelectionRowEditingComponent,
    IgxTreeGridSelectionWithTransactionComponent,
    IgxTreeGridRowEditingTransactionComponent,
    IgxTreeGridCustomRowSelectorsComponent,
    IgxTreeGridCascadingSelectionComponent,
    IgxTreeGridCascadingSelectionTransactionComponent
} from '../../test-utils/tree-grid-components.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    TreeGridFunctions,
    TREE_ROW_SELECTION_CSS_CLASS,
    ROW_EDITING_BANNER_OVERLAY_CLASS,
    TREE_ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS
} from '../../test-utils/tree-grid-functions.spec';
import { IgxStringFilteringOperand, IgxNumberFilteringOperand } from '../../data-operations/filtering-condition';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxGridSelectionModule } from '../selection/selection.module';
import { IgxActionStripModule, IgxActionStripComponent } from '../../action-strip/public_api';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { GridSelectionMode } from '../common/enums';
import { By } from '@angular/platform-browser';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { FilteringLogic } from '../../data-operations/filtering-expression.interface';
import { IRowSelectionEventArgs } from '../common/events';

describe('IgxTreeGrid - Selection #tGrid', () => {
    configureTestSuite();
    let fix;
    let treeGrid: IgxTreeGridComponent;
    let actionStrip: IgxActionStripComponent;
    const endTransition = () => {
        // transition end needs to be simulated
        const animationElem = fix.nativeElement.querySelector('.igx-grid__tr--inner');
        const endEvent = new AnimationEvent('animationend');
        animationElem.dispatchEvent(endEvent);
    };
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridSimpleComponent,
                IgxTreeGridCellSelectionComponent,
                IgxTreeGridSelectionRowEditingComponent,
                IgxTreeGridSelectionWithTransactionComponent,
                IgxTreeGridRowEditingTransactionComponent,
                IgxTreeGridCustomRowSelectorsComponent,
                IgxTreeGridCascadingSelectionComponent,
                IgxTreeGridCascadingSelectionTransactionComponent
            ],
            imports: [IgxTreeGridModule, NoopAnimationsModule, IgxGridSelectionModule, IgxActionStripModule]
        })
            .compileComponents();
    }));

    describe('API Row Selection', () => {
        // configureTestSuite();
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxTreeGridSimpleComponent);
            fix.detectChanges();

            treeGrid = fix.componentInstance.treeGrid;
            treeGrid.rowSelection = GridSelectionMode.multiple;
            await wait();
            fix.detectChanges();
        });

        it('should have checkbox on each row if rowSelection is not none', () => {
            const rows = TreeGridFunctions.getAllRows(fix);

            expect(rows.length).toBe(10);
            rows.forEach((row) => {
                const checkBoxElement = row.nativeElement.querySelector(TREE_ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS);
                expect(checkBoxElement).not.toBeNull();
            });

            treeGrid.rowSelection = GridSelectionMode.none;
            fix.detectChanges();

            expect(rows.length).toBe(10);
            rows.forEach((row) => {
                const checkBoxElement = row.nativeElement.querySelector(TREE_ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS);
                expect(checkBoxElement).toBeNull();
            });
        });

        it('should be able to select/deselect all rows', () => {
            treeGrid.selectAllRows();
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], true);
            expect(treeGrid.selectedRows.length).toEqual(10);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);

            treeGrid.deselectAllRows();
            fix.detectChanges();

            expect(treeGrid.selectedRows).toEqual([]);
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
        });

        it('when all items are selected and then some of the selected rows are deleted, still all the items should be selected', () => {
            treeGrid.selectAllRows();
            fix.detectChanges();
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);

            treeGrid.deleteRowById(treeGrid.selectedRows[0]);
            fix.detectChanges();
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);

            treeGrid.deleteRowById(treeGrid.selectedRows[0]);
            fix.detectChanges();
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);

            treeGrid.deleteRowById(treeGrid.selectedRows[0]);
            fix.detectChanges();
            // When deleting the last selected row, header checkbox will be unchecked.
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
        });

        it('should be able to select row of any level', () => {
            treeGrid.selectRows([treeGrid.gridAPI.get_row_by_index(0).rowID], true);
            fix.detectChanges();

            // Verify selection.
            TreeGridFunctions.verifyDataRowsSelection(fix, [0], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.selectRows([treeGrid.gridAPI.get_row_by_index(2).rowID], false);
            fix.detectChanges();

            // Verify new selection by keeping the old one.
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 2], true);

            treeGrid.selectRows([treeGrid.gridAPI.get_row_by_index(1).rowID, treeGrid.gridAPI.get_row_by_index(3).rowID,
            treeGrid.gridAPI.get_row_by_index(6).rowID, treeGrid.gridAPI.get_row_by_index(8).rowID], true);
            fix.detectChanges();

            // Verify new selection by NOT keeping the old one.
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 2], false);
            TreeGridFunctions.verifyDataRowsSelection(fix, [1, 3, 6, 8], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('should be able to deselect row of any level', () => {
            treeGrid.selectRows([treeGrid.gridAPI.get_row_by_index(1).rowID, treeGrid.gridAPI.get_row_by_index(3).rowID,
            treeGrid.gridAPI.get_row_by_index(6).rowID, treeGrid.gridAPI.get_row_by_index(8).rowID,
            treeGrid.gridAPI.get_row_by_index(9).rowID], true);
            fix.detectChanges();

            treeGrid.deselectRows([treeGrid.gridAPI.get_row_by_index(1).rowID, treeGrid.gridAPI.get_row_by_index(3).rowID]);
            fix.detectChanges();

            // Verify modified selection
            TreeGridFunctions.verifyDataRowsSelection(fix, [1, 3], false);
            TreeGridFunctions.verifyDataRowsSelection(fix, [6, 8, 9], true);
        });

        it('should persist the selection after sorting', () => {
            treeGrid.selectRows([treeGrid.gridAPI.get_row_by_index(0).rowID, treeGrid.gridAPI.get_row_by_index(4).rowID], true);
            fix.detectChanges();

            treeGrid.sort({ fieldName: 'Age', dir: SortingDirection.Asc, ignoreCase: false });
            fix.detectChanges();

            // Verification indices are different since the sorting changes rows' positions.
            TreeGridFunctions.verifyDataRowsSelection(fix, [2, 7], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.clearSort();
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 4], true);
        });

        it('should persist the selection after filtering', fakeAsync(() => {
            treeGrid.selectRows([treeGrid.gridAPI.get_row_by_index(0).rowID, treeGrid.gridAPI.get_row_by_index(5).rowID,
            treeGrid.gridAPI.get_row_by_index(8).rowID], true);
            fix.detectChanges();

            treeGrid.filter('Age', 40, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            fix.detectChanges();
            tick();

            // Verification indices are different since the sorting changes rows' positions.
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 2, 4], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.clearFilter();
            fix.detectChanges();
            tick();

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 5, 8], true);
        }));

        it('should be able to select and select only filtered data', () => {
            treeGrid.selectRows([299, 147]);
            fix.detectChanges();

            treeGrid.filter('Age', 40, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            fix.detectChanges();

            expect(treeGrid.selectedRows).toEqual([299, 147]);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.selectAllRows(true);
            fix.detectChanges();

            expect(treeGrid.selectedRows).toEqual([299, 147, 317, 998, 19, 847]);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);

            treeGrid.deselectAllRows(true);
            fix.detectChanges();

            expect(treeGrid.selectedRows).toEqual([299]);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);

            treeGrid.clearFilter();
            fix.detectChanges();

            expect(treeGrid.selectedRows).toEqual([299]);
            TreeGridFunctions.verifyDataRowsSelection(fix, [6], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('should persist the selection after expand/collapse', () => {
            treeGrid.selectRows([treeGrid.gridAPI.get_row_by_index(0).rowID, treeGrid.gridAPI.get_row_by_index(3).rowID,
            treeGrid.gridAPI.get_row_by_index(5).rowID], true);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(3);

            // Collapse row and verify visible selected rows
            treeGrid.toggleRow(treeGrid.gridAPI.get_row_by_index(0).rowID);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(1);

            // Expand same row and verify visible selected rows
            treeGrid.toggleRow(treeGrid.gridAPI.get_row_by_index(0).rowID);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(3);

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 3, 5], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('should persist selection after paging', fakeAsync(() => {
            treeGrid.selectRows([treeGrid.gridAPI.get_row_by_index(0).rowID, treeGrid.gridAPI.get_row_by_index(3).rowID,
            treeGrid.gridAPI.get_row_by_index(5).rowID], true);
            fix.detectChanges();
            tick(16);

            fix.componentInstance.paging = true;
            fix.detectChanges();
            treeGrid.perPage = 4;
            fix.detectChanges();
            tick(16);

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, true);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 2, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, true);

            treeGrid.page = 1;
            fix.detectChanges();
            tick(16);

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, true);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 2, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, false);

            treeGrid.page = 2;
            fix.detectChanges();
            tick(16);

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, false);
        }));

        it('Should bind selectedRows properly', () => {
            fix.componentInstance.selectedRows = [147, 19, 957];
            fix.detectChanges();

            expect(treeGrid.gridAPI.get_row_by_index(0).selected).toBeTrue();
            expect(treeGrid.gridAPI.get_row_by_index(7).selected).toBeTrue();
            expect(treeGrid.gridAPI.get_row_by_index(4).selected).toBeFalse();

            fix.componentInstance.selectedRows = [847, 711];
            fix.detectChanges();

            expect(treeGrid.gridAPI.get_row_by_index(0).selected).toBeFalse();
            expect(treeGrid.gridAPI.get_row_by_index(4).selected).toBeTrue();
            expect(treeGrid.gridAPI.get_row_by_index(8).selected).toBeTrue();
        });
    });

    describe('UI Row Selection', () => {
        // configureTestSuite();
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxTreeGridSimpleComponent);
            fix.detectChanges();

            treeGrid = fix.componentInstance.treeGrid;
            treeGrid.rowSelection = GridSelectionMode.multiple;
            await wait();
            fix.detectChanges();
        });

        it('should be able to select/deselect all rows', () => {
            TreeGridFunctions.clickHeaderRowSelectionCheckbox(fix);
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);

            TreeGridFunctions.clickHeaderRowSelectionCheckbox(fix);
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [], true);
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
        });

        it('Header checkbox should NOT select/deselect all rows when selectionMode is single', () => {
            spyOn(treeGrid.rowSelected, 'emit').and.callThrough();
            treeGrid.rowSelection = GridSelectionMode.single;
            fix.detectChanges();

            TreeGridFunctions.clickHeaderRowSelectionCheckbox(fix);
            fix.detectChanges();

            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
            TreeGridFunctions.verifyDataRowsSelection(fix, [], false);
            expect(treeGrid.selectedRows).toEqual([]);
            expect(treeGrid.rowSelected.emit).toHaveBeenCalledTimes(0);

            TreeGridFunctions.clickHeaderRowSelectionCheckbox(fix);
            fix.detectChanges();

            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
            TreeGridFunctions.verifyDataRowsSelection(fix, [], false);
            expect(treeGrid.selectedRows).toEqual([]);
            expect(treeGrid.rowSelected.emit).toHaveBeenCalledTimes(0);
        });

        it('should be able to select row of any level', () => {
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            fix.detectChanges();
            TreeGridFunctions.verifyDataRowsSelection(fix, [0], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            TreeGridFunctions.clickRowSelectionCheckbox(fix, 2);
            fix.detectChanges();
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 2], true);

            // Deselect rows
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 2);
            fix.detectChanges();

            // Select new rows
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 1);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 3);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 6);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 8);
            fix.detectChanges();

            // Verify new selection
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 2], false);
            TreeGridFunctions.verifyDataRowsSelection(fix, [1, 3, 6, 8], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('should be able to deselect row of any level', () => {
            // Select rows
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 1);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 3);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 6);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 8);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 9);
            fix.detectChanges();

            // Deselect rows
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 1);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 3);
            fix.detectChanges();

            // Verify modified selection
            TreeGridFunctions.verifyDataRowsSelection(fix, [1, 3], false);
            TreeGridFunctions.verifyDataRowsSelection(fix, [6, 8, 9], true);
        });
        it('Rows would be selected only from checkboxes if selectRowOnClick is disabled', () => {
            expect(treeGrid.selectRowOnClick).toBe(true);
            const firstRow = treeGrid.gridAPI.get_row_by_index(1);
            const secondRow = treeGrid.gridAPI.get_row_by_index(4);
            expect(treeGrid.selectedRows).toEqual([]);

            // selectRowOnClick = true;
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();
            UIInteractions.simulateClickEvent(secondRow.nativeElement, false, true);
            fix.detectChanges();
            TreeGridFunctions.verifyDataRowsSelection(fix, [1, 4], true);

            TreeGridFunctions.clickRowSelectionCheckbox(fix, 1);
            fix.detectChanges();
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 4);
            fix.detectChanges();
            expect(treeGrid.selectedRows).toEqual([]);

            // selectRowOnClick = false
            treeGrid.selectRowOnClick = false;
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();
            TreeGridFunctions.verifyDataRowsSelection(fix, [1], false);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 1);
            fix.detectChanges();
            TreeGridFunctions.verifyDataRowsSelection(fix, [1], true);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 4);
            fix.detectChanges();
            TreeGridFunctions.verifyDataRowsSelection(fix, [1, 4], true);
        });

        it('should persist the selection after sorting', () => {
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 4);

            treeGrid.columnList.filter(c => c.field === 'Age')[0].sortable = true;
            fix.detectChanges();
            treeGrid.sort({ fieldName: 'Age', dir: SortingDirection.Asc, ignoreCase: false });
            fix.detectChanges();

            // Verification indices are different since the sorting changes rows' positions.
            TreeGridFunctions.verifyDataRowsSelection(fix, [2, 7], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.clearSort();
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 4], true);
        });

        it('should persist the selection after filtering', fakeAsync(() => {
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 5);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 8);

            treeGrid.filter('Age', 40, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            fix.detectChanges();
            tick(100);

            // Verification indices are different since the sorting changes rows' positions.
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 2, 4], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.clearFilter();
            fix.detectChanges();
            tick(100);

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 5, 8], true);
        }));

        it('should update header checkbox when reselecting all filtered-in rows', fakeAsync(() => {
            treeGrid.filter('Age', 30, IgxNumberFilteringOperand.instance().condition('lessThan'));
            tick(100);

            TreeGridFunctions.clickHeaderRowSelectionCheckbox(fix);
            fix.detectChanges();

            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true); // Verify header checkbox is selected
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0); // Unselect row
            fix.detectChanges();
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null); // Verify header checkbox is indeterminate
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0); // Reselect same row
            fix.detectChanges();
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true); // Verify header checkbox is selected
        }));

        it('should persist the selection after expand/collapse', () => {
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 3);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 5);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(3);

            // Collapse row and verify visible selected rows
            TreeGridFunctions.clickRowIndicator(fix, 0);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(1);

            // Expand same row and verify visible selected rows
            TreeGridFunctions.clickRowIndicator(fix, 0);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(3);

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 3, 5], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('should persist selection after paging', fakeAsync(() => {
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 3);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 5);
            fix.detectChanges();

            fix.componentInstance.paging = true;
            fix.detectChanges();
            treeGrid.perPage = 4;
            fix.detectChanges();
            tick(16);

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, true);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 2, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, true);

            treeGrid.page = 1;
            fix.detectChanges();
            tick(16);

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, true);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 2, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, false);

            treeGrid.page = 2;
            fix.detectChanges();
            tick(16);

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, false);
        }));

        it('Should update selectedRows when selecting rows from UI', fakeAsync(() => {
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 3);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 5);
            fix.detectChanges();

            expect(treeGrid.selectedRows.length).toBe(3);
        }));
    });

    describe('Row Selection with transactions - Hierarchical DS', () => {
        // configureTestSuite();
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridSelectionWithTransactionComponent);
            fix.detectChanges();

            treeGrid = fix.componentInstance.treeGrid;
            treeGrid.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();
        }));

        it('should deselect row when delete its parent', () => {
            treeGrid.selectRows([treeGrid.gridAPI.get_row_by_index(3).rowID, treeGrid.gridAPI.get_row_by_index(5).rowID], true);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, true);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 5, true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
            treeGrid.deleteRow(147);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 5, false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
            expect(treeGrid.selectedRows).toEqual([]);

            // try to select deleted row
            UIInteractions.simulateClickEvent(treeGrid.gridAPI.get_row_by_index(0).nativeElement);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 3);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 5);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 5, false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
            expect(treeGrid.selectedRows).toEqual([]);

            // undo transaction
            treeGrid.transactions.undo();
            fix.detectChanges();

            // select rows
            UIInteractions.simulateClickEvent(treeGrid.gridAPI.get_row_by_index(0).nativeElement);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 3);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 5);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, true);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, true);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 5, true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
            expect(treeGrid.selectedRows).toEqual([147, 317, 998]);

            // redo transaction
            treeGrid.transactions.redo();
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 5, false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
            expect(treeGrid.selectedRows).toEqual([]);
        });

        it('should have correct header checkbox when delete a row', () => {
            treeGrid.selectAllRows();
            fix.detectChanges();

            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);

            treeGrid.deleteRow(317);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);
            expect(treeGrid.selectedRows.includes(317)).toEqual(false);
            expect(treeGrid.selectedRows.includes(711)).toEqual(false);
            expect(treeGrid.selectedRows.includes(998)).toEqual(false);

            // undo transaction
            treeGrid.transactions.undo();
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 4, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 5, false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            // redo transaction
            treeGrid.transactions.redo();
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 4, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 5, false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);
        });

        it('should have correct header checkbox when add a row', () => {
            treeGrid.selectAllRows();
            fix.detectChanges();

            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);

            treeGrid.addRow({ ID: 13, Name: 'Michael Cooper', Age: 33, OnPTO: false }, 317);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 6, false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
            expect(treeGrid.selectedRows.includes(13)).toEqual(false);

            // undo transaction
            treeGrid.transactions.undo();
            fix.detectChanges();

            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);
        });

        it('should have correct header checkbox when add a row and then selectAll rows', () => {
            treeGrid.addRow({ ID: 13, Name: 'Michael Cooper', Age: 33, OnPTO: false }, 317);
            fix.detectChanges();

            TreeGridFunctions.clickHeaderRowSelectionCheckbox(fix);
            fix.detectChanges();

            expect(treeGrid.selectedRows.length).toBeGreaterThan(treeGrid.flatData.length);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);
        });

        it('should have correct header checkbox when add a row and undo transaction', fakeAsync(() => {
            treeGrid.addRow({ ID: 13, Name: 'Michael Cooper', Age: 33, OnPTO: false }, 317);
            tick();
            fix.detectChanges();

            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 6);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 6, true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            // undo transaction
            treeGrid.transactions.undo();
            tick();
            fix.detectChanges();

            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
            expect(treeGrid.selectedRows.includes(13)).toEqual(false);
        }));

        it('Should be able to select deleted rows through API - Hierarchical DS', () => {
            treeGrid.deleteRowById(663);
            fix.detectChanges();
            expect(treeGrid.selectedRows).toEqual([]);
            treeGrid.selectRows([663]);
            fix.detectChanges();
            expect(treeGrid.selectedRows).toEqual([663]);
            /** Select row with deleted parent */
            treeGrid.deleteRowById(147);
            fix.detectChanges();
            // 147 -> 475
            treeGrid.selectRows([475]);
            fix.detectChanges();
            expect(treeGrid.selectedRows).toEqual([663, 475]);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
        });

        it('Should not be able to select deleted rows through API with selectAllRows - Hierarchical DS', () => {
            treeGrid.deleteRowById(663);
            treeGrid.deleteRowById(147);
            fix.detectChanges();
            expect(treeGrid.selectedRows).toEqual([]);

            treeGrid.selectAllRows();
            fix.detectChanges();

            expect(treeGrid.selectedRows.includes(663)).toBe(false);
            expect(treeGrid.selectedRows.includes(147)).toBe(false);
            expect(treeGrid.selectedRows.includes(475)).toBe(false);
            expect(treeGrid.selectedRows.includes(19)).toBe(true);
            expect(treeGrid.selectedRows.includes(847)).toBe(true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);
        });
    });

    describe('Row Selection with transactions - flat DS', () => {
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridRowEditingTransactionComponent);
            fix.detectChanges();

            treeGrid = fix.componentInstance.treeGrid;
            treeGrid.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();
        }));

        it('Should select deleted rows through API', () => {
            treeGrid.deleteRowById(6);
            fix.detectChanges();
            expect(treeGrid.selectedRows).toEqual([]);
            treeGrid.selectRows([6]);
            fix.detectChanges();
            expect(treeGrid.selectedRows).toEqual([6]);
            /** Select row with deleted parent */
            treeGrid.deleteRowById(10);
            fix.detectChanges();
            // 10 -> 9
            treeGrid.selectRows([9]);
            fix.detectChanges();
            expect(treeGrid.selectedRows).toEqual([6, 9]);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
        });

        it('Should not be able to select deleted rows through API with selectAllRows', () => {
            treeGrid.deleteRowById(6);
            treeGrid.deleteRowById(10);
            fix.detectChanges();
            expect(treeGrid.selectedRows).toEqual([]);

            treeGrid.selectAllRows();
            fix.detectChanges();

            expect(treeGrid.selectedRows.includes(6)).toBe(false);
            expect(treeGrid.selectedRows.includes(10)).toBe(false);
            expect(treeGrid.selectedRows.includes(9)).toBe(false);
            expect(treeGrid.selectedRows.includes(1)).toBe(true);
            expect(treeGrid.selectedRows.includes(2)).toBe(true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);
        });
    });

    describe('Cell Selection', () => {
        // configureTestSuite();
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridCellSelectionComponent);
            fix.detectChanges();
            tick(16);
            treeGrid = fix.componentInstance.treeGrid;
        }));

        it('should return the correct type of cell when clicking on a cells', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            const normalCells = TreeGridFunctions.getNormalCells(rows[0]);
            UIInteractions.simulateClickAndSelectEvent(normalCells[0]);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxGridCellComponent).toBe(true);

            let treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            UIInteractions.simulateClickAndSelectEvent(treeGridCell);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);

            // perform 2 clicks and check selection again
            treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            UIInteractions.simulateClickAndSelectEvent(treeGridCell);
            treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            UIInteractions.simulateClickAndSelectEvent(treeGridCell);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
        });

        it('should return the correct type of cell when clicking on child cells', () => {
            const rows = TreeGridFunctions.getAllRows(fix);

            // level 1
            let treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            UIInteractions.simulateClickAndSelectEvent(treeGridCell);
            fix.detectChanges();
            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxGridCellComponent).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(147);

            // level 2
            treeGridCell = TreeGridFunctions.getTreeCell(rows[1]);
            UIInteractions.simulateClickAndSelectEvent(treeGridCell);
            fix.detectChanges();
            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxGridCellComponent).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(475);

            // level 3
            treeGridCell = TreeGridFunctions.getTreeCell(rows[2]);
            UIInteractions.simulateClickAndSelectEvent(treeGridCell);
            fix.detectChanges();
            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxGridCellComponent).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(957);
        });

        it('should not persist selection after paging', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            let treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            UIInteractions.simulateClickAndSelectEvent(treeGridCell);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(TreeGridFunctions.verifyGridCellHasSelectedClass(treeGridCell)).toBe(true);

            // Clicking on the pager buttons triggers a blur event.

            GridFunctions.navigateToNextPage(treeGrid.nativeElement);
            treeGridCell.nativeElement.dispatchEvent(new Event('blur'));
            fix.detectChanges();
            GridFunctions.navigateToFirstPage(treeGrid.nativeElement);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(0);

            rows = TreeGridFunctions.getAllRows(fix);
            treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            UIInteractions.simulateClickAndSelectEvent(treeGridCell);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(TreeGridFunctions.verifyGridCellHasSelectedClass(treeGridCell)).toBe(true);

            GridFunctions.navigateToLastPage(treeGrid.nativeElement);
            treeGridCell.nativeElement.dispatchEvent(new Event('blur'));
            fix.detectChanges();
            GridFunctions.navigateToFirstPage(treeGrid.nativeElement);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(0);
        });

        it('should persist selection after filtering', fakeAsync(() => {
            const rows = TreeGridFunctions.getAllRows(fix);
            const treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            UIInteractions.simulateClickAndSelectEvent(treeGridCell);
            fix.detectChanges();

            treeGrid.filter('ID', '14', IgxStringFilteringOperand.instance().condition('startsWith'), true);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(TreeGridFunctions.verifyGridCellHasSelectedClass(treeGridCell)).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(147);

            // set new filtering
            treeGrid.clearFilter('ProductName');
            treeGrid.filter('ID', '8', IgxStringFilteringOperand.instance().condition('startsWith'), true);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(TreeGridFunctions.verifyGridCellHasSelectedClass(treeGridCell)).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(847);
        }));

        it('should persist selection after scrolling', async () => {
            treeGrid.paging = false;
            fix.detectChanges();

            const rows = TreeGridFunctions.getAllRows(fix);
            const treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            UIInteractions.simulateClickAndSelectEvent(treeGridCell);
            fix.detectChanges();

            // scroll down 150 pixels
            treeGrid.verticalScrollContainer.getScroll().scrollTop = 150;
            treeGrid.headerContainer.getScroll().dispatchEvent(new Event('scroll'));
            await wait(100);
            fix.detectChanges();

            // then scroll back to top
            treeGrid.verticalScrollContainer.getScroll().scrollTop = 0;
            treeGrid.headerContainer.getScroll().dispatchEvent(new Event('scroll'));
            await wait(100);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(147);
        });

        it('should persist selection after sorting', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            const treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            UIInteractions.simulateClickAndSelectEvent(treeGridCell);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(147);

            treeGrid.sort({ fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false });
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(847);
        });

        it('should persist selection after row delete', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            const treeGridCell = TreeGridFunctions.getTreeCell(rows[0]);
            UIInteractions.simulateClickAndSelectEvent(treeGridCell);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(147);

            treeGrid.deleteRow(847);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(147);

            treeGrid.deleteRow(147);
            fix.detectChanges();

            expect(treeGrid.selectedCells.length).toBe(1);
            expect(treeGrid.selectedCells[0] instanceof IgxTreeGridCellComponent).toBe(true);
            expect(treeGrid.selectedCells[0].value).toBe(19);
        });
    });

    describe('Cell/Row Selection With Row Editing', () => {
        // configureTestSuite();
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxTreeGridSelectionRowEditingComponent);
            fix.detectChanges();

            treeGrid = fix.componentInstance.treeGrid;
            await wait();
            fix.detectChanges();
        });

        it('should display the banner correctly on row selection', fakeAsync(() => {
            const targetCell = treeGrid.getCellByColumn(1, 'Name');
            treeGrid.rowSelection = GridSelectionMode.multiple;
            treeGrid.rowEditable = true;

            // select the second row
            treeGrid.selectRows([targetCell.cellID.rowID], true);
            tick(16);
            fix.detectChanges();

            // check if any rows were selected
            expect(treeGrid.selectedRows.length).toBeGreaterThan(0);

            // enter edit mode
            targetCell.setEditMode(true);
            tick(16);
            fix.detectChanges();

            // the banner should appear
            const banner = document.getElementsByClassName(ROW_EDITING_BANNER_OVERLAY_CLASS);
            expect(banner).toBeTruthy();
            expect(banner[0]).toBeTruthy();
        }));

        it('should display the banner correctly on cell selection', fakeAsync(() => {
            treeGrid.rowEditable = true;

            const allRows = TreeGridFunctions.getAllRows(fix);
            const treeGridCells = TreeGridFunctions.getNormalCells(allRows[0]);

            // select a cell
            const targetCell = treeGridCells[0];
            UIInteractions.simulateClickAndSelectEvent(targetCell);
            fix.detectChanges();

            // there should be at least one selected cell
            expect(treeGrid.selectedCells.length).toBeGreaterThan(0);

            // enter edit mode
            targetCell.triggerEventHandler('dblclick', new Event('dblclick'));
            tick(16);
            fix.detectChanges();

            // the banner should appear
            const banner = document.getElementsByClassName(ROW_EDITING_BANNER_OVERLAY_CLASS);
            expect(banner).toBeTruthy();
            expect(banner[0]).toBeTruthy();
        }));
    });

    describe('Cascading Row Selection', () => {
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridCascadingSelectionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            actionStrip = fix.componentInstance.actionStrip;
        }));

        it('Should select/deselect all leaf nodes and set the correct state to their checkboxes on parent rows checkbox click', () => {
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(7);
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            // Deselect rows
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(0);
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6], false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
        });

        it('Should select/deselect parent row by selecting/deselecting all its children', () => {
            treeGrid.selectRows([475, 957, 711, 998, 299], true);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(7);
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            // Deselect rows
            treeGrid.deselectRows([475, 957, 711, 998, 299]);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(0);
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6], false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
        });

        it('Should select/deselect parent row by selecting/deselecting the last deselected/selected child', () => {
            treeGrid.selectRows([475, 957, 711, 998], true);
            fix.detectChanges();

            TreeGridFunctions.clickRowSelectionCheckbox(fix, 6);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(7);
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            // Deselect rows
            treeGrid.deselectRows([475, 957, 711, 998]);
            fix.detectChanges();

            TreeGridFunctions.clickRowSelectionCheckbox(fix, 6);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(0);
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6], false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
        });

        it(`Should set parent row checkbox to indeterminate by selecting/deselecting
            a child row when all child rows are deselected/selected`, () => {
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 6);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(1);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            // Deselect one row
            treeGrid.selectRows([475, 957, 711, 998, 299], true);
            fix.detectChanges();

            TreeGridFunctions.clickRowSelectionCheckbox(fix, 6);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(4);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('Should select all children of record on Shift + click even if they are not in the selected range. ', () => {
            const firstRow = treeGrid.gridAPI.get_row_by_index(1);
            const secondRow = treeGrid.gridAPI.get_row_by_index(4);
            const mockEvent = new MouseEvent('click', { shiftKey: true });

            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toEqual(1);
            TreeGridFunctions.verifyDataRowsSelection(fix, [1], true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            // Click on other row holding Shift key
            secondRow.nativeElement.dispatchEvent(mockEvent);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(7);
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('Should select only the newly clicked parent row and its children and deselect the previous selection.', () => {
            treeGrid.selectRows([19, 847], true);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(3);

            const firstRow = treeGrid.gridAPI.get_row_by_index(0);
            UIInteractions.simulateClickEvent(firstRow.nativeElement);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(7);
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('Should add a row and its children to the selected rows collection using Ctrl + click.', () => {
            treeGrid.selectRows([847], true);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(2);

            // select a child of the first parent and all of its children
            const firstRow = treeGrid.gridAPI.get_row_by_index(3);
            UIInteractions.simulateClickEvent(firstRow.nativeElement, false, true);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(6);
            TreeGridFunctions.verifyDataRowsSelection(fix, [3, 4, 5, 6, 8, 9], true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            // select the first parent and all of its children
            const secondRow = treeGrid.gridAPI.get_row_by_index(0);
            UIInteractions.simulateClickEvent(secondRow.nativeElement, false, true);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(9);
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6, 8, 9], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('After adding a new child row to a selected parent its checkbox state SHOULD be indeterminate.', async () => {
            treeGrid.selectRows([847], true);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(2);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 8, true, true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            const row = treeGrid.gridAPI.get_row_by_index(8);
            actionStrip.show(row);
            fix.detectChanges();

            // add new child through the UI
            const editActions = fix.debugElement.queryAll(By.css(`igx-grid-action-button`));
            const addChildBtn = editActions[2].componentInstance;
            addChildBtn.actionClick.emit();
            fix.detectChanges();
            endTransition();

            const addRow = treeGrid.gridAPI.get_row_by_index(9);
            expect(addRow.addRow).toBeTrue();

            treeGrid.gridAPI.crudService.endEdit(true);
            await wait(100);
            fix.detectChanges();
            const addedRow = treeGrid.gridAPI.get_row_by_index(10);
            expect(addedRow.rowData.Name).toBe(undefined);

            TreeGridFunctions.verifyDataRowsSelection(fix, [9], true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 8, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('After adding child to a selected parent with no children, parent checkbox state SHOULD NOT be selected.', async () => {
            treeGrid.selectRows([957], true);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(1);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.addRow({
                ID: -1,
                Name: undefined,
                HireDate: undefined,
                Age: undefined
            }, 957);
            fix.detectChanges();
            await wait(100);
            fix.detectChanges();
            const addedRow = treeGrid.gridAPI.get_row_by_index(3);
            expect(addedRow.rowData.Name).toBe(undefined);

            expect(getVisibleSelectedRows(fix).length).toBe(0);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 2, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
        });

        it('If parent and its children are selected and we delete a child, parent SHOULD be still selected.', async () => {
            treeGrid.selectRows([147], true);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(7);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, true, true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            expect(treeGrid.dataRowList.length).toBe(10);

            const childRow = treeGrid.gridAPI.get_row_by_index(5);
            actionStrip.show(childRow);
            fix.detectChanges();

            // delete the child through the UI
            const editActions = fix.debugElement.queryAll(By.css(`igx-grid-action-button`));
            const deleteBtn = editActions[2].componentInstance;
            deleteBtn.actionClick.emit();
            fix.detectChanges();

            await wait(100);
            fix.detectChanges();

            expect(treeGrid.dataRowList.length).toBe(9);
            expect(getVisibleSelectedRows(fix).length).toBe(6);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, true, true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('If parent has one non-selected child and we delete it, the parent checkbox state SHOULD be selected.', async () => {
            treeGrid.selectRows([711, 299], true);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(2);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            expect(treeGrid.dataRowList.length).toBe(10);

            const childRow = treeGrid.gridAPI.get_row_by_index(5);
            actionStrip.show(childRow);
            fix.detectChanges();

            // delete the child through the UI
            const editActions = fix.debugElement.queryAll(By.css(`igx-grid-action-button`));
            const deleteBtn = editActions[2].componentInstance;
            deleteBtn.actionClick.emit();
            fix.detectChanges();

            await wait(100);
            fix.detectChanges();

            expect(treeGrid.dataRowList.length).toBe(9);
            expect(getVisibleSelectedRows(fix).length).toBe(3);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('If we delete the only selected child of a parent row, the parent checkbox state SHOULD be deselected', async () => {
            treeGrid.selectRows([711], true);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(1);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            expect(treeGrid.dataRowList.length).toBe(10);

            // delete the child through the API
            const childRow = treeGrid.gridAPI.get_row_by_index(4);
            childRow.delete();
            fix.detectChanges();

            await wait(100);
            fix.detectChanges();

            expect(treeGrid.dataRowList.length).toBe(9);
            expect(getVisibleSelectedRows(fix).length).toBe(0);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
        });

        it(`If there is only one selected leaf row for a particular parent and we filter it out parent's checkbox state -> non-selected.
        All non-direct parents’ checkbox states should be set correctly as well`, async () => {
            treeGrid.selectRows([711], true);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(1);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, null);

            treeGrid.filter('ID', 711, IgxNumberFilteringOperand.instance().condition('doesNotEqual'));
            fix.detectChanges();

            await wait(100);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(0);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, false);
        });

        it(`If there is only one non-selected row for a particular parent and we filter it out parent's checkbox state -> selected.
        All non-direct parents’ checkbox states should be set correctly as well`, async () => {
            treeGrid.selectRows([711, 998], true);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(2);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 4, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 5, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 6, false, false);

            treeGrid.filter('ID', 299, IgxNumberFilteringOperand.instance().condition('doesNotEqual'));
            fix.detectChanges();

            await wait(100);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(3);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 4, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 5, true, true);
        });

        it(`No rows are selected. Filter out all children for certain parent. Select this parent. It should be the only one within
        the selectedRows collection. Remove filtering. The selectedRows collection should be empty.
        All non-direct parents’ checkbox states should be set correctly as well`, async () => {

            const expressionTree = new FilteringExpressionsTree(FilteringLogic.And, 'ID');
            expressionTree.filteringOperands = [
                {
                    condition: IgxNumberFilteringOperand.instance().condition('doesNotEqual'),
                    fieldName: 'ID',
                    searchVal: 711
                },
                {
                    condition: IgxNumberFilteringOperand.instance().condition('doesNotEqual'),
                    fieldName: 'ID',
                    searchVal: 998
                },
                {
                    condition: IgxNumberFilteringOperand.instance().condition('doesNotEqual'),
                    fieldName: 'ID',
                    searchVal: 299
                }
            ];
            treeGrid.filter('ID', null, expressionTree);

            await wait(100);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(0);

            treeGrid.selectRows([317], true);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(1);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);

            treeGrid.clearFilter();

            await wait(100);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(0);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, false);
        });

        it(`Filter out all selected children for a certain parent and explicitly deselect it.
        Remove filtering. Parent row should be selected again. All non-direct parents’
        checkbox states should be set correctly as well`, async () => {

            treeGrid.selectRows([317], true);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(4);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);

            const expressionTree = new FilteringExpressionsTree(FilteringLogic.And, 'ID');
            expressionTree.filteringOperands = [
                {
                    condition: IgxNumberFilteringOperand.instance().condition('doesNotEqual'),
                    fieldName: 'ID',
                    searchVal: 711
                },
                {
                    condition: IgxNumberFilteringOperand.instance().condition('doesNotEqual'),
                    fieldName: 'ID',
                    searchVal: 998
                },
                {
                    condition: IgxNumberFilteringOperand.instance().condition('doesNotEqual'),
                    fieldName: 'ID',
                    searchVal: 299
                }
            ];
            treeGrid.filter('ID', null, expressionTree);

            await wait(100);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(1);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);

            treeGrid.deselectRows([317]);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(0);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, false);

            treeGrid.clearFilter();

            await wait(100);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(4);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);
        });

        it(`Parent in indeterminate state. Filter out its children -> parent not selected. Select parent and add new child.
        Parent -> not selected. Revert filtering so that previous records are back in the view and parent should become in
        indeterminate state because one of it children is selected`, fakeAsync(() => {

            treeGrid.selectRows([998], true);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(1);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, null);

            const expressionTree = new FilteringExpressionsTree(FilteringLogic.And, 'ID');
            expressionTree.filteringOperands = [
                {
                    condition: IgxNumberFilteringOperand.instance().condition('doesNotEqual'),
                    fieldName: 'ID',
                    searchVal: 711
                },
                {
                    condition: IgxNumberFilteringOperand.instance().condition('doesNotEqual'),
                    fieldName: 'ID',
                    searchVal: 998
                },
                {
                    condition: IgxNumberFilteringOperand.instance().condition('doesNotEqual'),
                    fieldName: 'ID',
                    searchVal: 299
                }
            ];
            treeGrid.filter('ID', null, expressionTree);
            fix.detectChanges();

            tick(100);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(0);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, false);

            treeGrid.selectRows([317]);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(1);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);

            treeGrid.addRow({
                ID: -1,
                Name: undefined,
                HireDate: undefined,
                Age: undefined
            }, 317);
            fix.detectChanges();

            tick(100);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(0);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, false);

            treeGrid.clearFilter();
            fix.detectChanges();

            tick(100);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(1);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, null);
        }));

        it(`Selected parent. Filter out some of the children and delete otheres.
        Parent should be not selected`, fakeAsync(() => {

            treeGrid.selectRows([317], true);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(4);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);

            const expressionTree = new FilteringExpressionsTree(FilteringLogic.And, 'ID');
            expressionTree.filteringOperands = [
                {
                    condition: IgxNumberFilteringOperand.instance().condition('doesNotEqual'),
                    fieldName: 'ID',
                    searchVal: 711
                },
                {
                    condition: IgxNumberFilteringOperand.instance().condition('doesNotEqual'),
                    fieldName: 'ID',
                    searchVal: 998
                }
            ];
            treeGrid.filter('ID', null, expressionTree);
            fix.detectChanges();

            tick(100);
            fix.detectChanges();

            treeGrid.deleteRow(299);
            fix.detectChanges();

            tick(100);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(0);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, false);
        }));

        it(`Set nested child row, that has its own children, as initially selected and verify
        that both direct and indirect parent's checkboxes are set in the correct state.`, fakeAsync(() => {

            treeGrid.selectedRows = [317];
            fix.detectChanges();
            tick(100);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(4);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 4, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 5, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 6, true, true);
        }));

        it(`Setting true to the cancel property of the rowSelected event should not modify the selected rows collection`, () => {

            treeGrid.rowSelected.subscribe((e: IRowSelectionEventArgs) => {
                e.cancel = true;
            });

            spyOn(treeGrid.rowSelected, 'emit').and.callThrough();

            treeGrid.selectionService.selectRowsWithNoEvent([317]);
            fix.detectChanges();

            treeGrid.selectionService.deselectRow(299);
            fix.detectChanges();

            const args: IRowSelectionEventArgs = {
                oldSelection: [317, 711, 998, 299],
                newSelection: [711, 998],
                added: [],
                removed: [317, 299],
                event: undefined,
                cancel: true
            };

            expect(treeGrid.rowSelected.emit).toHaveBeenCalledWith(args);

            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(4);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 4, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 5, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 6, true, true);
        });

        it(`selectionService clearRowSelection method should work correctly`, () => {
            treeGrid.selectionService.selectRowsWithNoEvent([711]);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(1);
            expect(treeGrid.selectionService.indeterminateRows.size).toBe(2);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 1, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 2, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 4, true, true);

            treeGrid.selectionService.clearRowSelection();
            treeGrid.cdr.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(0);
            expect(treeGrid.selectionService.indeterminateRows.size).toBe(0);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 1, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 2, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 4, false, false);
        });

        it(`selectionService selectAllRows method should work correctly`, () => {
            treeGrid.selectionService.selectRowsWithNoEvent([711]);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(1);
            expect(treeGrid.selectionService.indeterminateRows.size).toBe(2);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 1, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 2, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 4, true, true);

            treeGrid.selectionService.selectAllRows();
            treeGrid.cdr.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(10);
            expect(treeGrid.selectionService.indeterminateRows.size).toBe(0);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 1, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 2, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 4, true, true);
        });

        it('selectRowById event SHOULD be emitted correctly with valid arguments.', () => {
            spyOn(treeGrid.rowSelected, 'emit').and.callThrough();
            treeGrid.selectionService.selectRowsWithNoEvent([317]);
            fix.detectChanges();

            expect(treeGrid.rowSelected.emit).toHaveBeenCalledTimes(0);
            expect(getVisibleSelectedRows(fix).length).toBe(4);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 4, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 5, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 6, true, true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.selectionService.selectRowById(847, true);

            const args: IRowSelectionEventArgs = {
                oldSelection: [317, 711, 998, 299],
                newSelection: [847, 663],
                added: [847, 663],
                removed: [317, 711, 998, 299],
                event: undefined,
                cancel: false
            };

            expect(treeGrid.rowSelected.emit).toHaveBeenCalledWith(args);

            treeGrid.cdr.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(2);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 4, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 5, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 6, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 8, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 9, true, true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('After changing the newSelection arguments of onSelectedRowChange, the arguments SHOULD be correct.', () => {
            treeGrid.rowSelected.subscribe((e: IRowSelectionEventArgs) => {
                e.newSelection = [847, 663];
            });
            spyOn(treeGrid.rowSelected, 'emit').and.callThrough();

            treeGrid.selectionService.selectRowsWithNoEvent([317], true);
            fix.detectChanges();

            treeGrid.selectionService.selectRowById(19, true);

            const selectionArgs: IRowSelectionEventArgs = {
                oldSelection: [317, 711, 998, 299],
                newSelection: [847, 663],
                added: [19],
                removed: [317, 711, 998, 299],
                event: undefined,
                cancel: false
            };

            expect(treeGrid.rowSelected.emit).toHaveBeenCalledWith(selectionArgs);

            treeGrid.cdr.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(2);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 8, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 9, true, true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });
    });

    describe('Cascading Row Selection with Transaction', () => {
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridCascadingSelectionTransactionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            actionStrip = fix.componentInstance.actionStrip;
        }));

        it('Add a new leaf row to a selected parent and revert the transaction. The parent SHOULD be selected.', async () => {
            const trans = treeGrid.transactions;

            treeGrid.selectRows([317], true);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(4);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.addRow({
                ID: -1,
                Name: undefined,
                HireDate: undefined,
                Age: undefined
            }, 317);

            fix.detectChanges();
            await wait(100);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(3);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            trans.undo();
            fix.detectChanges();
            await wait(100);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(4);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });
        it('Add a new row to a selected parent and commit the transaction.The parent checkbox state SHOULD be indeterminate', async () => {
            const trans = treeGrid.transactions;

            treeGrid.selectRows([317], true);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(4);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.addRow({
                ID: -1,
                Name: undefined,
                HireDate: undefined,
                Age: undefined
            }, 317);

            fix.detectChanges();
            await wait(100);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(3);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            trans.commit(treeGrid.data);
            fix.detectChanges();
            await wait(100);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(3);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });
        it('Delete one of the children of selected parent. Parent checkbox state SHOULD be selected.', async () => {
            const trans = treeGrid.transactions;
            treeGrid.selectRows([317], true);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(4);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            const childRow = treeGrid.gridAPI.get_row_by_index(4);
            childRow.delete();
            fix.detectChanges();

            await wait(100);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(3);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            trans.undo();
            fix.detectChanges();
            await wait(100);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(2);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            trans.redo();
            fix.detectChanges();
            await wait(100);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(3);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });
        it('After delete the only non-selected child, the parent checkbox state SHOULD be selected.', async () => {
            treeGrid.selectRows([711, 299], true);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(2);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            const childRow = treeGrid.gridAPI.get_row_by_index(5);
            actionStrip.show(childRow);
            fix.detectChanges();

            // delete the child through the UI
            const editActions = fix.debugElement.queryAll(By.css(`igx-grid-action-button`));
            const deleteBtn = editActions[2].componentInstance;
            deleteBtn.actionClick.emit();
            fix.detectChanges();

            await wait(100);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(3);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, true, true);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });
        it('Delete the only selected child of a parent row. Parent checkbox state SHOULD NOT be selected.', async () => {
            treeGrid.selectRows([998], true);
            fix.detectChanges();
            expect(getVisibleSelectedRows(fix).length).toBe(1);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, null);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, null);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            const row = treeGrid.gridAPI.get_row_by_index(5);
            row.delete();
            fix.detectChanges();
            await wait(100);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(0);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 3, false, false);
            TreeGridFunctions.verifyRowByIndexSelectionAndCheckboxState(fix, 0, false, false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
        });

    });

    describe('Custom row selectors', () => {
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridCustomRowSelectorsComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        }));

        it('Should have the correct properties in the custom row selector template', () => {
            const firstRow = treeGrid.gridAPI.get_row_by_index(0);
            const firstCheckbox = firstRow.nativeElement.querySelector('.igx-checkbox__composite');
            const context = { index: 0, rowID: 1, selected: false };
            const contextUnselect = { index: 0, rowID: 1, selected: true };
            spyOn(fix.componentInstance, 'onRowCheckboxClick').and.callThrough();
            (firstCheckbox as HTMLElement).click();
            fix.detectChanges();

            expect(fix.componentInstance.onRowCheckboxClick).toHaveBeenCalledTimes(1);
            expect(fix.componentInstance.onRowCheckboxClick).toHaveBeenCalledWith(new MouseEvent('click'), context);

            // Verify correct properties when unselecting a row
            (firstCheckbox as HTMLElement).click();
            fix.detectChanges();

            expect(fix.componentInstance.onRowCheckboxClick).toHaveBeenCalledTimes(2);
            expect(fix.componentInstance.onRowCheckboxClick).toHaveBeenCalledWith(new MouseEvent('click'), contextUnselect);
        });

        it('Should have the correct properties in the custom row selector header template', () => {
            const context = { selectedCount: 0, totalCount: 8 };
            const contextUnselect = { selectedCount: 8, totalCount: 8 };
            const headerCheckbox = treeGrid.theadRow.nativeElement.querySelector('.igx-checkbox__composite') as HTMLElement;
            spyOn(fix.componentInstance, 'onHeaderCheckboxClick').and.callThrough();
            headerCheckbox.click();
            fix.detectChanges();

            expect(fix.componentInstance.onHeaderCheckboxClick).toHaveBeenCalledTimes(1);
            expect(fix.componentInstance.onHeaderCheckboxClick).toHaveBeenCalledWith(new MouseEvent('click'), context);

            headerCheckbox.click();
            fix.detectChanges();

            expect(fix.componentInstance.onHeaderCheckboxClick).toHaveBeenCalledTimes(2);
            expect(fix.componentInstance.onHeaderCheckboxClick).toHaveBeenCalledWith(new MouseEvent('click'), contextUnselect);
        });

        it('Should have correct indices on all pages', () => {
            treeGrid.nextPage();
            fix.detectChanges();

            const firstRootRow = treeGrid.gridAPI.get_row_by_index(0);
            expect(firstRootRow.nativeElement.querySelector('.rowNumber').textContent).toEqual('5');
        });
    });
});


const getVisibleSelectedRows = (fix) => TreeGridFunctions.getAllRows(fix).filter(
    (row) => row.nativeElement.classList.contains(TREE_ROW_SELECTION_CSS_CLASS));
