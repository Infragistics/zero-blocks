import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxTreeGridModule } from './public_api';
import { IgxTreeGridSimpleComponent, IgxTreeGridPrimaryForeignKeyComponent } from '../../test-utils/tree-grid-components.spec';
import { IgxNumberFilteringOperand } from '../../data-operations/filtering-condition';
import { TreeGridFunctions, NUMBER_CELL_CSS_CLASS } from '../../test-utils/tree-grid-functions.spec';
import { By } from '@angular/platform-browser';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { DropPosition } from '../moving/moving.service';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const GRID_RESIZE_CLASS = '.igx-grid-th__resize-handle';

describe('IgxTreeGrid - Indentation #tGrid', () => {
    configureTestSuite();
    let fix;
    let treeGrid: IgxTreeGridComponent;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridSimpleComponent,
                IgxTreeGridPrimaryForeignKeyComponent
            ],
            imports: [IgxTreeGridModule, NoopAnimationsModule]
        })
            .compileComponents();
    }));

    describe('Child Collection', () => {
        // configureTestSuite();
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridSimpleComponent);
            fix.detectChanges();
            tick(16);
            treeGrid = fix.componentInstance.treeGrid;
        }));

        it('should have the tree-cell as a first cell on every row', () => {
            // Verify all rows are present
            const rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);

            // Verify the tree cell is the first cell for every row
            TreeGridFunctions.verifyCellsPosition(rows, 4);
        });

        it('should have correct indentation for every record of each level', () => {
            const rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(3), rows[3], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(4), rows[4], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(5), rows[5], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(6), rows[6], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(7), rows[7], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(8), rows[8], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(9), rows[9], 1);
        });

        it('should persist the indentation after sorting', () => {
            treeGrid.sort({ fieldName: 'Age', dir: SortingDirection.Asc, ignoreCase: false });
            fix.detectChanges();

            const rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(3), rows[3], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(4), rows[4], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(5), rows[5], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(6), rows[6], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(7), rows[7], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(8), rows[8], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(9), rows[9], 0);
        });

        it('should persist the indentation after filtering', fakeAsync(() => {
            treeGrid.filter('Age', 40, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            fix.detectChanges();

            const rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);

            // This row does not satisfy the filtering, but is present in the DOM with lowered opacity
            // in order to indicate that it is a parent of another record that satisfies the filtering.
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);

            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(3), rows[3], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(4), rows[4], 0);
        }));

        it('should persist the indentation on all pages when using paging',  fakeAsync(() => {
            fix.componentInstance.paging = true;
            fix.detectChanges();

            treeGrid.paginator.perPage = 4;
            fix.detectChanges();
            tick(16);

            // Verify page 1
            let rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            expect(rows.length).toBe(4, 'Incorrect number of rows on page 1.');
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(3), rows[3], 1);

            treeGrid.page = 1;
            fix.detectChanges();
            tick(16);

            // Verify page 2
            rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            expect(rows.length).toBe(4, 'Incorrect number of rows on page 2.');
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(3), rows[3], 0);

            treeGrid.page = 2;
            fix.detectChanges();
            tick(16);

            // Verify page 3
            rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            expect(rows.length).toBe(2, 'Incorrect number of rows on page 3.');
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
        }));

        it('should persist the indentation after resizing the tree-column', fakeAsync(() => {
            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];
            column.resizable = true;
            fix.detectChanges();
            treeGrid.cdr.detectChanges();

            const header = TreeGridFunctions.getHeaderCell(fix, 'ID');
            const resizer = header.parent.query(By.css(GRID_RESIZE_CLASS)).nativeElement;

            // Verify before resizing width
            expect(header.nativeElement.getBoundingClientRect().width).toBe(225);

            // Resize the tree column
            UIInteractions.simulateMouseEvent('mousedown', resizer, 225, 5);
            tick(200);
            fix.detectChanges();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 370, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 370, 5);
            tick(200);
            fix.detectChanges();

            // Verify after resizing width and row indentation
            expect(header.nativeElement.getBoundingClientRect().width).toBe(370);
            const rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(3), rows[3], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(4), rows[4], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(5), rows[5], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(6), rows[6], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(7), rows[7], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(8), rows[8], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(9), rows[9], 1);
        }));

        it('should change cell content alignment of tree-column with number dataType when it is no longer tree-column', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);
            verifyCellsContentAlignment(fix, 'ID', true); // Verify cells of 'ID' are left-aligned.

            // Moving 'ID' column
            const sourceColumn = treeGrid.columns.filter(c => c.field === 'ID')[0];
            let targetColumn = treeGrid.columns.filter(c => c.field === 'Age')[0];
            treeGrid.moveColumn(sourceColumn, targetColumn, DropPosition.BeforeDropTarget);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'Name', 4);
            verifyCellsContentAlignment(fix, 'ID', false); // Verify cells of 'ID' are right-aligned.

            // Moving 'ID' column
            targetColumn = treeGrid.columns.filter(c => c.field === 'Name')[0];
            treeGrid.moveColumn(sourceColumn, targetColumn, DropPosition.BeforeDropTarget);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);
            verifyCellsContentAlignment(fix, 'ID', true); // Verify cells of 'ID' are left-aligned.
        });
    });

    describe('Primary/Foreign key', () => {
        // configureTestSuite();
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
            fix.detectChanges();
            tick(16);
            treeGrid = fix.componentInstance.treeGrid;
        }));

        it('should have the tree-cell as a first cell on every row', () => {
            // Verify all rows are present
            const rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(8);

            // Verify the tree cell is the first cell for every row
            TreeGridFunctions.verifyCellsPosition(rows, 5);
        });

        it('should have correct indentation for every record of each level', () => {
            const rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(3), rows[3], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(4), rows[4], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(5), rows[5], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(6), rows[6], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(7), rows[7], 1);
        });

        it('should persist the indentation after sorting', () => {
            treeGrid.sort({ fieldName: 'Age', dir: SortingDirection.Asc, ignoreCase: false });
            fix.detectChanges();

            const rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(3), rows[3], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(4), rows[4], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(5), rows[5], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(6), rows[6], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(7), rows[7], 1);
        });

        it('should persist the indentation after filtering', fakeAsync(() => {

            treeGrid.filter('Age', 35, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            fix.detectChanges();

            const rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));

            // This row does not satisfy the filtering, but is present in the DOM with lowered opacity
            // in order to indicate that it is a parent of another record that satisfies the filtering.
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);

            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(3), rows[3], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(4), rows[4], 1);
        }));

        it('should persist the indentation on all pages when using paging', fakeAsync(() => {
            fix.componentInstance.paging = true;
            fix.detectChanges();

            treeGrid.perPage = 3;
            fix.detectChanges();
            tick(16);

            // Verify page 1
            let rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            expect(rows.length).toBe(3, 'Incorrect number of rows on page 1.');
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 2);

            treeGrid.page = 1;
            fix.detectChanges();
            tick(16);

            // Verify page 2
            rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            expect(rows.length).toBe(3, 'Incorrect number of rows on page 2.');
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 0);

            treeGrid.page = 2;
            fix.detectChanges();
            tick(16);

            // Verify page 3
            rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            expect(rows.length).toBe(2, 'Incorrect number of rows on page 3.');
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
        }));

        it('should persist the indentation after resizing the tree-column', fakeAsync(() => {
            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];
            column.resizable = true;
            fix.detectChanges();
            treeGrid.cdr.detectChanges();
            tick(16);

            const header = TreeGridFunctions.getHeaderCell(fix, 'ID');
            const resizer = header.parent.query(By.css(GRID_RESIZE_CLASS)).nativeElement;

            // Verify before resizing width
            expect(header.nativeElement.getBoundingClientRect().width).toBe(180);

            // Resize the tree column
            UIInteractions.simulateMouseEvent('mousedown', resizer, 180, 5);
            tick(200);
            fix.detectChanges();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 370, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 370, 5);
            tick(200);
            fix.detectChanges();

            // Verify after resizing width and row indentation
            expect(header.nativeElement.getBoundingClientRect().width).toBe(370);
            const rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(3), rows[3], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(4), rows[4], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(5), rows[5], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(6), rows[6], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(7), rows[7], 1);
        }));

        it('should change cell content alignment of tree-column with number dataType when it is no longer tree-column', fakeAsync(() => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 5);
            verifyCellsContentAlignment(fix, 'ID', true); // Verify cells of 'ID' are left-aligned.

            // Moving 'ID' column
            const sourceColumn = treeGrid.columns.filter(c => c.field === 'ID')[0];
            let targetColumn = treeGrid.columns.filter(c => c.field === 'Age')[0];
            treeGrid.moveColumn(sourceColumn, targetColumn, DropPosition.BeforeDropTarget);
            fix.detectChanges();
            tick(16);
            TreeGridFunctions.verifyTreeColumn(fix, 'ParentID', 5);
            verifyCellsContentAlignment(fix, 'ID', false); // Verify cells of 'ID' are right-aligned.

            // Moving 'ID' column
            targetColumn = treeGrid.columns.filter(c => c.field === 'ParentID')[0];
            treeGrid.moveColumn(sourceColumn, targetColumn, DropPosition.BeforeDropTarget);
            fix.detectChanges();
            tick(16);
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 5);
            verifyCellsContentAlignment(fix, 'ID', true); // Verify cells of 'ID' are left-aligned.
        }));
    });
});

const verifyCellsContentAlignment = (fix, columnKey, shouldBeLeftAligned: boolean) => {
    const cells = TreeGridFunctions.getColumnCells(fix, columnKey);
    if (shouldBeLeftAligned) {
        cells.forEach((cell) => {
            expect(cell.nativeElement.classList.contains(NUMBER_CELL_CSS_CLASS))
                .toBe(false, 'cell has number css class');

            // TreeCells have either 2 or 3 div children (2 for root rows and 3 for child rows).
            const cellDivChildren = cell.queryAll(By.css('div'));
            expect((cellDivChildren.length === 2) || (cellDivChildren.length === 3)).toBe(true);
        });
    } else { // Should be right-aligned
        cells.forEach((cell) => {
            expect(cell.nativeElement.classList.contains(NUMBER_CELL_CSS_CLASS))
                .toBe(true, 'cell does not have number css class');

            // NormalCells have 1 div child (no div for indentation and no div for expander).
            const cellDivChildren = cell.queryAll(By.css('div'));
            expect(cellDivChildren.length === 1).toBe(true);
        });
    }
};
