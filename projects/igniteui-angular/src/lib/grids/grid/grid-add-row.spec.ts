import { IgxGridModule, IgxGridComponent } from './public_api';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { DebugElement } from '@angular/core';
import { GridFunctions, GridSummaryFunctions } from '../../test-utils/grid-functions.spec';
import {
    IgxAddRowComponent, IgxGridRowEditingTransactionComponent
} from '../../test-utils/grid-samples.spec';

import { By } from '@angular/platform-browser';
import { IgxActionStripComponent } from '../../action-strip/action-strip.component';
import { IgxActionStripModule } from '../../action-strip/action-strip.module';
import { DefaultGridMasterDetailComponent } from './grid.master-detail.spec';
import { ColumnLayoutTestComponent } from './grid.multi-row-layout.spec';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { TransactionType } from '../../services/public_api';
import { IgxGridRowComponent } from './grid-row.component';
import { takeUntil, first } from 'rxjs/operators';
import { Subject } from 'rxjs';

describe('IgxGrid - Row Adding #grid', () => {
        const GRID_ROW = 'igx-grid-row';
        const DISPLAY_CONTAINER = 'igx-display-container';
        const SUMMARY_ROW = 'igx-grid-summary-row';
        const GRID_THEAD_ITEM = '.igx-grid-thead__item';

        let fixture;
        let grid: IgxGridComponent;
        let gridContent: DebugElement;
        let actionStrip: IgxActionStripComponent;
    const endTransition = () => {
          // transition end needs to be simulated
          const animationElem = fixture.nativeElement.querySelector('.igx-grid__tr--inner');
          const endEvent = new AnimationEvent('animationend');
          animationElem.dispatchEvent(endEvent);
    };
    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxAddRowComponent,
                ColumnLayoutTestComponent,
                DefaultGridMasterDetailComponent,
                IgxGridRowEditingTransactionComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxActionStripModule,
                IgxGridModule]
        });
    }));

    describe('General tests', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxAddRowComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
            actionStrip = fixture.componentInstance.actionStrip;
        }));

        it('Should be able to enter add row mode on action strip click', () => {
            const row = grid.rowList.first;
            actionStrip.show(row);
            fixture.detectChanges();
            const addRowIcon = fixture.debugElement.queryAll(By.css(`igx-grid-editing-actions igx-icon`))[1];
            addRowIcon.parent.triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();
            const addRow = grid.gridAPI.get_row_by_index(1);
            expect(addRow.addRow).toBeTrue();
        });

        it('Should be able to enter add row mode through the exposed API method.', () => {
            const rows = grid.rowList.toArray();
            rows[0].beginAddRow();
            fixture.detectChanges();

            endTransition();

            let addRow = grid.gridAPI.get_row_by_index(1);
            expect(addRow.addRow).toBeTrue();

            UIInteractions.triggerEventHandlerKeyDown('escape', gridContent);
            fixture.detectChanges();
            addRow = grid.gridAPI.get_row_by_index(1);
            expect(addRow.addRow).toBeFalse();

            rows[1].beginAddRow();
            fixture.detectChanges();
            addRow = grid.gridAPI.get_row_by_index(2);
            expect(addRow.addRow).toBeTrue();
        });

        xit('Should display the banner above the row if there is no room underneath it', () => {
            fixture.componentInstance.paging = true;
            fixture.detectChanges();
            grid.notifyChanges(true);
            fixture.detectChanges();

            grid.paginator.perPage = 7;
            fixture.detectChanges();

            const lastRow = grid.rowList.last;
            const lastRowIndex = lastRow.index;
            actionStrip.show(lastRow);
            fixture.detectChanges();

            const addRowIcon = fixture.debugElement.queryAll(By.css(`igx-grid-editing-actions igx-icon`))[1];
            addRowIcon.parent.triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();

            endTransition();

            const addRow = grid.gridAPI.get_row_by_index(lastRowIndex + 1);
           // expect(addRow.addRow).toBeTrue();

            const banner = GridFunctions.getRowEditingOverlay(fixture);
            fixture.detectChanges();
            const bannerBottom = banner.getBoundingClientRect().bottom;
            const addRowTop = addRow.nativeElement.getBoundingClientRect().top;

            // The banner appears above the row
            expect(bannerBottom).toBeLessThanOrEqual(addRowTop);

            // No much space between the row and the banner
            expect(addRowTop - bannerBottom).toBeLessThan(2);
        });

        it('Should be able to enter add row mode on Alt + plus key.', () => {
            GridFunctions.focusFirstCell(fixture, grid);
            fixture.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('+', gridContent, true, false, false);
            fixture.detectChanges();

            const addRow = grid.gridAPI.get_row_by_index(1);
            expect(addRow.addRow).toBeTrue();

        });

        it('Should not be able to enter add row mode on Alt + Shift + plus key.', () => {
            GridFunctions.focusFirstCell(fixture, grid);
            fixture.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('+', gridContent, true, true, false);
            fixture.detectChanges();

            const banner = GridFunctions.getRowEditingOverlay(fixture);
            expect(banner).toBeNull();
            expect(grid.gridAPI.get_row_by_index(1).addRow).toBeFalse();
        });

        it('Should not be able to enter add row mode when rowEditing is disabled', () => {
            grid.rowEditable = false;
            fixture.detectChanges();

            grid.rowList.first.beginAddRow();
            fixture.detectChanges();

            const banner = GridFunctions.getRowEditingOverlay(fixture);
            expect(banner).toBeNull();
            expect(grid.gridAPI.get_row_by_index(1).addRow).toBeFalse();
        });

        it('Should allow adding row from pinned row.', () => {
            let row = grid.gridAPI.get_row_by_index(0);
            row.pin();
            fixture.detectChanges();
            expect(grid.pinnedRecords.length).toBe(1);

            row = grid.gridAPI.get_row_by_index(0);
            row.beginAddRow();
            fixture.detectChanges();

            endTransition();

            // add row should be pinned
            const addRow = grid.gridAPI.get_row_by_index(1) as IgxGridRowComponent;
            expect(addRow.addRow).toBe(true);
            expect(grid.pinnedRows[1]).toBe(addRow);

            grid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();

            // added record should be pinned.
            expect(grid.pinnedRecords.length).toBe(2);
            expect(grid.pinnedRecords[1]).toBe(grid.data[grid.data.length - 1]);

        });
        it('Should allow adding row from ghost row.', () => {
            const row = grid.getRowByIndex(0);
            row.pin();
            fixture.detectChanges();
            expect(grid.pinnedRecords.length).toBe(1);

            const ghostRow = grid.gridAPI.get_row_by_index(1);
            ghostRow.beginAddRow();
            fixture.detectChanges();

            endTransition();

            // add row should be unpinned
            const addRow = grid.gridAPI.get_row_by_index(2);
            expect(addRow.addRow).toBe(true);
            expect(grid.pinnedRows.length).toBe(1);

            grid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();

            // added record should be unpinned.
            expect(grid.pinnedRecords.length).toBe(1);
            expect(grid.unpinnedRecords[grid.unpinnedRecords.length - 1]).toBe(grid.data[grid.data.length - 1]);
        });
        it('should navigate to added row on snackbar button click.', async () => {
            const rows = grid.rowList.toArray();
            const dataCount = grid.data.length;
            rows[0].beginAddRow();
            fixture.detectChanges();
            endTransition();

            grid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();

            // check row is in data
            expect(grid.data.length).toBe(dataCount + 1);

            const addedRec = grid.data[grid.data.length - 1];

            grid.addRowSnackbar.triggerAction();
            fixture.detectChanges();

            await wait(100);
            fixture.detectChanges();

            // check added row is rendered and is in view
            const row = grid.gridAPI.get_row_by_key(addedRec[grid.primaryKey]);
            expect(row).not.toBeNull();
            const gridOffsets = grid.tbody.nativeElement.getBoundingClientRect();
            const rowOffsets = row.nativeElement.getBoundingClientRect();
            expect(rowOffsets.top >= gridOffsets.top && rowOffsets.bottom <= gridOffsets.bottom).toBeTruthy();
        });

        it('should navigate to added row on snackbar button click when row is not in current view.', async () => {
            fixture.componentInstance.paging = true;
            fixture.detectChanges();

            grid.paginator.perPage = 5;
            grid.markForCheck();
            fixture.detectChanges();

            const rows = grid.rowList.toArray();
            const dataCount = grid.data.length;

            rows[0].beginAddRow();
            fixture.detectChanges();

            endTransition();

            grid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();

            // check row is in data
            expect(grid.data.length).toBe(dataCount + 1);

            const addedRec = grid.data[grid.data.length - 1];

            grid.addRowSnackbar.triggerAction();
            fixture.detectChanges();

            await wait(100);
            fixture.detectChanges();

            // check page is correct
            expect(grid.paginator.page).toBe(5);

             // check added row is rendered and is in view
             const row = grid.gridAPI.get_row_by_key(addedRec[grid.primaryKey]);
             expect(row).not.toBeNull();
             const gridOffsets = grid.tbody.nativeElement.getBoundingClientRect();
             const rowOffsets = row.nativeElement.getBoundingClientRect();
             expect(rowOffsets.top >= gridOffsets.top && rowOffsets.bottom <= gridOffsets.bottom).toBeTruthy();
        });

        it('Should generate correct row ID based on the primary column type', () => {
            const column = grid.columns.find(col => col.field === grid.primaryKey);
            const type = column.dataType;

            const row = grid.gridAPI.get_row_by_index(0);
            row.beginAddRow();
            fixture.detectChanges();

            const newRow = grid.gridAPI.get_row_by_index(1);
            expect(newRow.addRow).toBeTrue();
            const cell = newRow.cells.find(c => c.column === column);
            expect(typeof(cell.value)).toBe(type);
        });

        it('should allow setting a different display time for snackbar', async () => {
            grid.snackbarDisplayTime = 50;
            fixture.detectChanges();

            const row = grid.gridAPI.get_row_by_index(0);
            row.beginAddRow();
            fixture.detectChanges();

            endTransition();

            grid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();

            expect(grid.addRowSnackbar.isVisible).toBe(true);
            // should hide after 50ms
            await wait(51);
            fixture.detectChanges();

            expect(grid.addRowSnackbar.isVisible).toBe(false);
        });

        it('Should set templated banner text when adding row', () => {
            const rows = grid.rowList.toArray();
            rows[0].beginAddRow();
            fixture.detectChanges();

            endTransition();

            const addRow = grid.gridAPI.get_row_by_index(1);
            expect(addRow.addRow).toBeTrue();

            expect(GridFunctions.getRowEditingBannerText(fixture)).toEqual('Adding Row');
        });
    });

    describe('Add row events tests:', () => {
        const $destroyer = new Subject<boolean>();

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxAddRowComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        }));

        afterEach(fakeAsync(() => {
            $destroyer.next(true);
        }));

        it('Should emit all events in the correct order', () => {
            spyOn(grid.rowEditEnter, 'emit').and.callThrough();
            spyOn(grid.cellEditEnter, 'emit').and.callThrough();
            spyOn(grid.cellEdit, 'emit').and.callThrough();
            spyOn(grid.cellEditDone, 'emit').and.callThrough();
            spyOn(grid.cellEditExit, 'emit').and.callThrough();
            spyOn(grid.rowEdit, 'emit').and.callThrough();
            spyOn(grid.rowEditDone, 'emit').and.callThrough();
            spyOn(grid.rowEditExit, 'emit').and.callThrough();

            grid.rowEditEnter.pipe(takeUntil($destroyer)).subscribe(() => {
                expect(grid.rowEditEnter.emit).toHaveBeenCalledTimes(1);
                expect(grid.cellEditEnter.emit).not.toHaveBeenCalled();
            });

            grid.cellEditEnter.pipe(takeUntil($destroyer)).subscribe(() => {
                expect(grid.rowEditEnter.emit).toHaveBeenCalledTimes(1);
                expect(grid.cellEditEnter.emit).toHaveBeenCalledTimes(1);
                expect(grid.cellEdit.emit).not.toHaveBeenCalled();
            });

            grid.cellEdit.pipe(takeUntil($destroyer)).subscribe(() => {
                expect(grid.cellEditEnter.emit).toHaveBeenCalledTimes(1);
                expect(grid.cellEdit.emit).toHaveBeenCalledTimes(1);
                expect(grid.cellEditDone.emit).not.toHaveBeenCalled();
            });

            grid.cellEditDone.pipe(takeUntil($destroyer)).subscribe(() => {
                expect(grid.cellEdit.emit).toHaveBeenCalledTimes(1);
                expect(grid.cellEditDone.emit).toHaveBeenCalledTimes(1);
                expect(grid.cellEditExit.emit).not.toHaveBeenCalled();
            });

            grid.cellEditExit.pipe(takeUntil($destroyer)).subscribe(() => {
                expect(grid.cellEditDone.emit).toHaveBeenCalledTimes(1);
                expect(grid.cellEditExit.emit).toHaveBeenCalledTimes(1);
                expect(grid.rowEdit.emit).not.toHaveBeenCalled();
            });

            grid.rowEdit.pipe(takeUntil($destroyer)).subscribe(() => {
                expect(grid.cellEditExit.emit).toHaveBeenCalledTimes(1);
                expect(grid.rowEdit.emit).toHaveBeenCalledTimes(1);
                expect(grid.rowEditDone.emit).not.toHaveBeenCalled();
            });

            grid.rowEditDone.pipe(takeUntil($destroyer)).subscribe(() => {
                expect(grid.rowEdit.emit).toHaveBeenCalledTimes(1);
                expect(grid.rowEditDone.emit).toHaveBeenCalledTimes(1);
                expect(grid.rowEditExit.emit).not.toHaveBeenCalled();
            });

            grid.rowEditExit.pipe(takeUntil($destroyer)).subscribe(() => {
                expect(grid.rowEditDone.emit).toHaveBeenCalledTimes(1);
                expect(grid.rowEditExit.emit).toHaveBeenCalledTimes(1);
            });

            grid.rowList.first.beginAddRow();
            fixture.detectChanges();

            endTransition();

            const cell =  grid.getCellByColumn(1, 'CompanyName');
            const cellInput = cell.nativeElement.querySelector('[igxinput]');
            UIInteractions.setInputElementValue(cellInput, 'aaa');
            fixture.detectChanges();
            grid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();
        });

        it('Should emit all grid editing events as per row editing specification', () => {
            spyOn(grid.cellEditEnter, 'emit').and.callThrough();
            spyOn(grid.cellEditDone, 'emit').and.callThrough();
            spyOn(grid.rowEditEnter, 'emit').and.callThrough();
            spyOn(grid.rowEditDone, 'emit').and.callThrough();

            const row = grid.gridAPI.get_row_by_index(0);
            row.beginAddRow();
            fixture.detectChanges();

            endTransition();

            const newRow = grid.gridAPI.get_row_by_index(1);
            expect(newRow.addRow).toBeTrue();
            expect(grid.cellEditEnter.emit).toHaveBeenCalled();
            expect(grid.rowEditEnter.emit).toHaveBeenCalled();

            const cell =  grid.getCellByColumn(1, 'CompanyName');
            const cellInput = cell.nativeElement.querySelector('[igxinput]');
            UIInteractions.setInputElementValue(cellInput, 'aaa');
            fixture.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fixture.detectChanges();

            expect(grid.cellEditDone.emit).toHaveBeenCalled();

            expect(grid.rowEditDone.emit).toHaveBeenCalled();
        });

        it('Should not enter add mode when rowEditEnter is canceled', () => {
            grid.rowEditEnter.pipe(takeUntil($destroyer)).subscribe((evt) => {
                evt.cancel = true;
            });

            grid.rowList.first.beginAddRow();
            fixture.detectChanges();
            endTransition();

            expect(grid.gridAPI.get_row_by_index(1).addRow).toBeFalse();
        });

        it('Should enter add mode but close it when cellEditEnter is canceled', () => {
            let canceled = true;
            grid.cellEditEnter.pipe(first()).subscribe((evt) => {
                evt.cancel = canceled;
            });

            grid.rowList.first.beginAddRow();
            fixture.detectChanges();

            expect(grid.gridAPI.get_row_by_index(1).addRow).toBeTrue();
            expect(grid.crudService.cellInEditMode).toEqual(false);

            grid.gridAPI.crudService.endEdit(false);
            fixture.detectChanges();

            canceled = false;
            grid.rowList.first.beginAddRow();
            fixture.detectChanges();

            expect(grid.gridAPI.get_row_by_index(1).addRow).toBeTrue();
        });
    });

    describe('Exit add row mode tests', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxAddRowComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
            actionStrip = fixture.componentInstance.actionStrip;
        }));

        it('Should exit add row mode and commit on clicking DONE button in the overlay', () => {
            const dataLength = grid.data.length;
            const row = grid.rowList.first;
            row.beginAddRow();
            fixture.detectChanges();

            endTransition();

            let newRow = grid.gridAPI.get_row_by_index(1);
            expect(newRow.addRow).toBeTrue();

            const doneButtonElement = GridFunctions.getRowEditingDoneButton(fixture);
            doneButtonElement.click();
            fixture.detectChanges();

            newRow = grid.gridAPI.get_row_by_index(1);
            expect(newRow.addRow).toBeFalse();
            expect(grid.data.length).toBe(dataLength + 1);
        });

        it('Should exit add row mode and discard on clicking CANCEL button in the overlay', async () => {
            const dataLength = grid.data.length;
            const row = grid.rowList.first;
            row.beginAddRow();
            fixture.detectChanges();

            endTransition();

            let newRow = grid.gridAPI.get_row_by_index(1);
            expect(newRow.addRow).toBeTrue();

            const cancelButtonElement = GridFunctions.getRowEditingCancelButton(fixture);
            cancelButtonElement.click();
            fixture.detectChanges();
            await wait(100);
            fixture.detectChanges();

            newRow = grid.gridAPI.get_row_by_index(1);
            expect(newRow.addRow).toBeFalse();
            expect(grid.data.length).toBe(dataLength);
        });

        it('Should exit add row mode and discard on ESC KEYDOWN', () => {
            const dataLength = grid.data.length;
            const row = grid.rowList.first;
            row.beginAddRow();
            fixture.detectChanges();

            endTransition();

            let newRow = grid.gridAPI.get_row_by_index(1);
            expect(newRow.addRow).toBeTrue();

            UIInteractions.triggerEventHandlerKeyDown('escape', gridContent);
            fixture.detectChanges();

            newRow = grid.gridAPI.get_row_by_index(1);
            expect(newRow.addRow).toBeFalse();
            expect(grid.data.length).toBe(dataLength);
        });

        it('Should exit add row mode and commit on ENTER KEYDOWN.', () => {
            const dataLength = grid.data.length;
            const row = grid.rowList.first;
            row.beginAddRow();
            fixture.detectChanges();

            endTransition();

            let newRow = grid.gridAPI.get_row_by_index(1);
            expect(newRow.addRow).toBeTrue();

            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fixture.detectChanges();

            newRow = grid.gridAPI.get_row_by_index(1);
            expect(newRow.addRow).toBeFalse();
            expect(grid.data.length).toBe(dataLength + 1);
        });

        it('Should correctly scroll all rows after closing the add row', async () => {
            grid.width = '400px';
            fixture.detectChanges();

            const dataLength = grid.data.length;
            const row = grid.rowList.first;
            row.beginAddRow();
            fixture.detectChanges();

            endTransition();

            let newRow = grid.gridAPI.get_row_by_index(1);
            expect(newRow.addRow).toBeTrue();

            const cancelButtonElement = GridFunctions.getRowEditingCancelButton(fixture);
            cancelButtonElement.click();
            fixture.detectChanges();
            await wait(100);
            fixture.detectChanges();

            newRow = grid.gridAPI.get_row_by_index(1);
            expect(newRow.addRow).toBeFalse();
            expect(grid.data.length).toBe(dataLength);

            (grid as any).scrollTo(0, grid.columnList.length - 1);
            await wait(100);
            fixture.detectChanges();

            // All rows should be scrolled, from their forOf directive. If not then the `_horizontalForOfs` in the grid is outdated.
            const gridRows = fixture.debugElement.queryAll(By.css(GRID_ROW));
            gridRows.forEach(item => {
                const displayContainer = item.query(By.css(DISPLAY_CONTAINER));
                expect(displayContainer.nativeElement.style.left).not.toBe('0px');
            });
        });
    });

    describe('Row Adding - Paging tests', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxAddRowComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        }));

       it('Should preserve the changes after page navigation', () => {
            const dataLength = grid.data.length;
            fixture.componentInstance.paging = true;
            fixture.detectChanges();
            grid.perPage = 5;
            fixture.detectChanges();

            const row = grid.rowList.first;
            row.beginAddRow();
            fixture.detectChanges();
            endTransition();

            GridFunctions.navigateToLastPage(grid.nativeElement);
            fixture.detectChanges();
            expect(grid.data.length).toBe(dataLength);
        });

        it('Should save changes when changing page count', () => {
            const dataLength = grid.data.length;
            fixture.componentInstance.paging = true;
            fixture.detectChanges();
            grid.perPage = 5;
            fixture.detectChanges();

            const row = grid.rowList.first;
            row.beginAddRow();
            fixture.detectChanges();

            endTransition();

            const select = GridFunctions.getGridPageSelectElement(fixture);
            select.click();
            fixture.detectChanges();
            const selectList = fixture.debugElement.query(By.css('.igx-drop-down__list-scroll'));
            selectList.children[2].nativeElement.click();
            fixture.detectChanges();
            expect(grid.data.length).toBe(dataLength);
        });
    });

    describe('Row Adding - Filtering tests', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxAddRowComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
            actionStrip = fixture.componentInstance.actionStrip;
        }));

        it('Should exit add row mode on filter applied and discard', () => {
            spyOn(grid.gridAPI.crudService, 'endEdit').and.callThrough();

            const dataLength = grid.data.length;
            const row = grid.rowList.first;
            row.beginAddRow();
            fixture.detectChanges();

            endTransition();

            grid.filter('CompanyName', 'al', IgxStringFilteringOperand.instance().condition('contains'), true);
            fixture.detectChanges();

            expect(grid.gridAPI.crudService.endEdit).toHaveBeenCalled();
            expect(grid.data.length).toBe(dataLength);
        });

        it('Filtering should consider newly added rows', () => {
            grid.filter('CompanyName', 'al', IgxStringFilteringOperand.instance().condition('contains'), true);
            fixture.detectChanges();
            expect(grid.dataView.length).toBe(4);

            const row = grid.gridAPI.get_row_by_index(0);
            row.beginAddRow();
            fixture.detectChanges();

            endTransition();

            const newRow = grid.gridAPI.get_row_by_index(1);
            expect(newRow.addRow).toBeTrue();

            const cell =  grid.getCellByColumn(1, 'CompanyName');
            const cellInput = cell.nativeElement.querySelector('[igxinput]');
            UIInteractions.setInputElementValue(cellInput, 'Alan');
            grid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();

            expect(grid.dataView.length).toBe(5);
        });

        it('Should not show the action strip "Show" button if added row is filtered out', () => {
            grid.filter('CompanyName', 'al', IgxStringFilteringOperand.instance().condition('contains'), true);
            fixture.detectChanges();

            const row = grid.gridAPI.get_row_by_index(0);
            row.beginAddRow();
            fixture.detectChanges();

            endTransition();
            const newRow = grid.gridAPI.get_row_by_index(1);
            expect(newRow.addRow).toBeTrue();

            const cell =  grid.getCellByColumn(1, 'CompanyName');
            const cellInput = cell.nativeElement.querySelector('[igxinput]');
            UIInteractions.setInputElementValue(cellInput, 'Xuary');
            grid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();

            expect(grid.dataView.length).toBe(4);
            expect(grid.addRowSnackbar.actionText).toBe('');
        });
    });

    describe('Row Adding - Sorting tests', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxAddRowComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
            actionStrip = fixture.componentInstance.actionStrip;
        }));

        it('Should exit add row mode and discard on sorting', () => {
            spyOn(grid.gridAPI.crudService, 'endEdit').and.callThrough();

            const dataLength = grid.data.length;
            const row = grid.rowList.first;
            row.beginAddRow();
            fixture.detectChanges();

            grid.sort({
                fieldName: 'CompanyName', dir: SortingDirection.Asc, ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            fixture.detectChanges();

            expect(grid.data.length).toBe(dataLength);
            expect(grid.gridAPI.crudService.endEdit).toHaveBeenCalled();
        });

        it('Sorting should consider newly added rows', () => {
            grid.sort({
                fieldName: 'CompanyName', dir: SortingDirection.Asc, ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            fixture.detectChanges();

            const row = grid.gridAPI.get_row_by_index(0);
            row.beginAddRow();
            fixture.detectChanges();

            endTransition();

            const newRow = grid.gridAPI.get_row_by_index(1);
            expect(newRow.addRow).toBeTrue();

            const cell =  grid.getCellByColumn(1, 'CompanyName');
            const cellInput = cell.nativeElement.querySelector('[igxinput]');
            UIInteractions.setInputElementValue(cellInput, 'Azua');
            grid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();

            expect(grid.getCellByColumn(4, 'CompanyName').value).toBe('Azua');
        });
    });

    describe('Row Adding - Master detail view', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(DefaultGridMasterDetailComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        }));

       it('Should collapse expanded detail view before spawning add row UI', () => {
            grid.rowEditable = true;
            fixture.detectChanges();
            const row = grid.rowList.first;
            grid.expandRow(row.rowID);
            fixture.detectChanges();
            expect(row.expanded).toBeTrue();

            row.beginAddRow();
            fixture.detectChanges();
            expect(row.expanded).toBeFalse();
            expect(grid.gridAPI.get_row_by_index(1).addRow).toBeTrue();
        });
    });

    describe('Row Adding - MRL tests', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(ColumnLayoutTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        }));

        it('Should render adding row with correct multi row layout', () => {
            grid.rowEditable = true;
            fixture.detectChanges();
            const gridFirstRow = grid.rowList.first;
            const firstRowCells = gridFirstRow.cells.toArray();
            // const headerCells = grid.headerGroups.first.children.toArray();
            const headerCells = grid.headerGroupsList[0].children.toArray();
            // headers are aligned to cells
            GridFunctions.verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

            gridFirstRow.beginAddRow();
            fixture.detectChanges();
            const newRow = grid.gridAPI.get_row_by_index(1);
            expect(newRow.addRow).toBeTrue();
            const newRowCells = newRow.cells.toArray();
            GridFunctions.verifyLayoutHeadersAreAligned(headerCells, newRowCells);
        });
    });

    describe('Row Adding - Group by', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxAddRowComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        }));

        it(`Should show the action strip "Show" button if added row is in collapsed group
            4and on click should expand the group and scroll to the correct added row`, () => {
            grid.groupBy({
                fieldName: 'CompanyName', dir: SortingDirection.Asc, ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            fixture.detectChanges();

            const groupRows = grid.groupsRowList.toArray();
            grid.toggleGroup(groupRows[2].groupRow);
            fixture.detectChanges();
            expect(groupRows[2].expanded).toBeFalse();

            const row = grid.gridAPI.get_row_by_index(1);
            row.beginAddRow();
            fixture.detectChanges();
            endTransition();

            const cell =  grid.getCellByColumn(2, 'CompanyName');
            const cellInput = cell.nativeElement.querySelector('[igxinput]');
            UIInteractions.setInputElementValue(cellInput, 'Antonio Moreno Taquería');
            grid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();
            const addedRec = grid.data[grid.data.length - 1];

            expect(grid.addRowSnackbar.actionText).toBe('SHOW');
            grid.addRowSnackbar.triggerAction();
            fixture.detectChanges();
            const row2 = grid.getRowByKey(addedRec[grid.primaryKey]);

            expect(row2).not.toBeNull();
            expect(groupRows[2].expanded).toBeTrue();
            expect(groupRows[2].groupRow.records.length).toEqual(2);
            expect(groupRows[2].groupRow.records[1]).toBe(row2.data);
        });
    });

    describe('Row Adding - Summaries', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxAddRowComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        }));

        it('Should update summaries after adding new row', () => {
            grid.getColumnByName('ID').hasSummary = true;
            fixture.detectChanges();
            let summaryRow = fixture.debugElement.query(By.css(SUMMARY_ROW));
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, ['Count'], ['27']);

            grid.rowList.first.beginAddRow();
            fixture.detectChanges();

            endTransition();

            grid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();

            summaryRow = fixture.debugElement.query(By.css(SUMMARY_ROW));
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, ['Count'], ['28']);
        });
    });

    describe('Row Adding - Column manipulations', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxAddRowComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        }));

        it('Should exit add row mode when moving a column', () => {
            spyOn(grid.gridAPI.crudService, 'endEdit').and.callThrough();
            const dataLength = grid.data.length;
            const row = grid.rowList.first;
            row.beginAddRow();
            fixture.detectChanges();

            endTransition();

            expect(grid.gridAPI.get_row_by_index(1).addRow).toBeTrue();
            expect(grid.rowEditingOverlay.collapsed).toEqual(false);

            grid.moveColumn(grid.columns[1], grid.columns[2]);
            fixture.detectChanges();

            expect(grid.gridAPI.crudService.endEdit).toHaveBeenCalled();
            expect(grid.data.length).toBe(dataLength);
            expect(grid.rowEditingOverlay.collapsed).toEqual(true);
        });

        it('Should exit add row mode when pinning/unpinning a column', () => {
            spyOn(grid.gridAPI.crudService, 'endEdit').and.callThrough();
            const dataLength = grid.data.length;
            const row = grid.rowList.first;
            row.beginAddRow();
            fixture.detectChanges();
            endTransition();

            expect(grid.gridAPI.get_row_by_index(1).addRow).toBeTrue();
            expect(grid.rowEditingOverlay.collapsed).toEqual(false);

            grid.pinColumn('CompanyName');
            fixture.detectChanges();

            expect(grid.gridAPI.crudService.endEdit).toHaveBeenCalled();
            expect(grid.data.length).toBe(dataLength);
            expect(grid.rowEditingOverlay.collapsed).toEqual(true);

            row.beginAddRow();
            fixture.detectChanges();
            endTransition();
            grid.unpinColumn('CompanyName');
            fixture.detectChanges();

            expect(grid.gridAPI.crudService.endEdit).toHaveBeenCalled();
            expect(grid.data.length).toBe(dataLength);
            expect(grid.rowEditingOverlay.collapsed).toEqual(true);
        });

        it('Should exit add row mode when resizing a column', async () => {
            spyOn(grid.gridAPI.crudService, 'endEdit').and.callThrough();

            fixture.detectChanges();

            const dataLength = grid.data.length;
            const row = grid.rowList.first;
            row.beginAddRow();
            fixture.detectChanges();

            endTransition();

            expect(grid.gridAPI.get_row_by_index(1).addRow).toBeTrue();
            expect(grid.rowEditingOverlay.collapsed).toEqual(false);

            const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(GRID_THEAD_ITEM));
            const headerResArea = headers[2].children[3].nativeElement;
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 400, 0);
            await wait(200);
            fixture.detectChanges();
            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 450, 0);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 450, 0);
            fixture.detectChanges();

            expect(grid.gridAPI.crudService.endEdit).toHaveBeenCalled();
            expect(grid.data.length).toBe(dataLength);
            expect(grid.rowEditingOverlay.collapsed).toEqual(false);
        });

        it('Should exit add row mode when hiding a column', () => {
            spyOn(grid.gridAPI.crudService, 'endEdit').and.callThrough();
            const dataLength = grid.data.length;
            const row = grid.rowList.first;
            row.beginAddRow();
            fixture.detectChanges();

            endTransition();

            expect(grid.gridAPI.get_row_by_index(1).addRow).toBeTrue();
            expect(grid.rowEditingOverlay.collapsed).toEqual(false);

            const column = grid.columnList.filter(c => c.field === 'ContactName')[0];
            column.hidden = true;
            fixture.detectChanges();

            expect(grid.gridAPI.crudService.endEdit).toHaveBeenCalled();
            expect(grid.data.length).toBe(dataLength);
            expect(grid.rowEditingOverlay.collapsed).toEqual(true);
        });
    });

    describe('Row Adding - Transactions', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxGridRowEditingTransactionComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        }));

        it('Should create ADD transaction when adding a new row', () => {
            const row = grid.rowList.first;
            row.beginAddRow();
            fixture.detectChanges();
            endTransition();

            grid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();
            const states = grid.transactions.getAggregatedChanges(true);

            expect(states.length).toEqual(1);
            expect(states[0].type).toEqual(TransactionType.ADD);
        });

        it('All updates on uncommitted add row should be merged into one ADD transaction', () => {
            const row = grid.rowList.first;
            row.beginAddRow();
            fixture.detectChanges();

            endTransition();

            grid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();
            let states = grid.transactions.getAggregatedChanges(true);
            expect(states.length).toEqual(1);
            expect(states[0].type).toEqual(TransactionType.ADD);

            const cell =  grid.getCellByColumn(grid.dataView.length - 1, 'ProductName');
            cell.update('aaa');
            fixture.detectChanges();
            states = grid.transactions.getAggregatedChanges(true);
            expect(states.length).toEqual(1);
            expect(states[0].type).toEqual(TransactionType.ADD);
            expect(states[0].newValue['ProductName']).toEqual('aaa');
        });
    });
});
