import { Component, ViewChild, OnInit, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { UIInteractions, wait, waitForActiveNodeChange} from '../../test-utils/ui-interactions.spec';
import { IgxGridModule } from './public_api';
import { IgxGridComponent } from './grid.component';
import { IgxGridRowComponent } from './grid-row.component';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { GridFunctions, GridSelectionFunctions } from '../../test-utils/grid-functions.spec';
import { IgxGridExpandableCellComponent } from './expandable-cell.component';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { IgxInputGroupComponent } from '../../input-group/public_api';
import { GridSummaryCalculationMode, GridSummaryPosition, GridSelectionMode } from '../common/enums';
import { IgxCheckboxComponent } from '../../checkbox/checkbox.component';
import { setupGridScrollDetection } from '../../test-utils/helper-utils.spec';

const DEBOUNCETIME = 30;
const ROW_TAG = 'igx-grid-row';
const GROUP_ROW_TAG = 'igx-grid-groupby-row';
const SUMMARY_ROW_TAG = 'igx-grid-summary-row';
const COLLAPSED_ICON_NAME = 'chevron_right';
const EXPANDED_ICON_NAME = 'expand_more';
const HIERARCHICAL_INDENT_CLASS = '.igx-grid__hierarchical-indent';
const SELECTED_ROW_CALSS_NAME = 'igx-grid__tr--selected';

describe('IgxGrid Master Detail #grid', () => {
    let fix: ComponentFixture<any>;
    let grid: IgxGridComponent;

    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultGridMasterDetailComponent,
                AllExpandedGridMasterDetailComponent,
                MRLMasterDetailComponent
            ],
            imports: [IgxGridModule, NoopAnimationsModule]
        });
    }));

    describe('Basic', () => {
        beforeEach( fakeAsync(() => {
            fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            tick(100);
        }));

        it('Should render an expand icon for all rows', () => {
            const expandIcons = grid.rowList.filter((row) => {
                const iconName = GridFunctions.getRowExpandIconName(row);
                return iconName === COLLAPSED_ICON_NAME;
            });
            expect(grid.rowList.length).toEqual(expandIcons.length);
        });

        it('Should correctly expand a basic detail view, update expansionStates and the context provided should be correct', () => {
            GridFunctions.toggleMasterRow(fix, grid.rowList.first);
            fix.detectChanges();

            const firstRowIconName = GridFunctions.getRowExpandIconName(grid.rowList.first);
            const firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);
            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.has(grid.rowList.first.rowID)).toBeTruthy();
            expect(grid.expansionStates.get(grid.rowList.first.rowID)).toBeTruthy();
            expect(firstRowIconName).toEqual(EXPANDED_ICON_NAME);
            expect(getDetailAddressText(firstRowDetail)).toEqual('Obere Str. 57');
        });

        it('Should render a detail view with dynamic elements and they should be clickable/focusable.', () => {
            GridFunctions.toggleMasterRow(fix, grid.rowList.first);
            fix.detectChanges();

            const firstDetail = GridFunctions.getMasterRowDetailDebug(fix, grid.rowList.first);
            const checkboxElem = firstDetail.query(By.directive(IgxCheckboxComponent));
            const checkboxPos = checkboxElem.nativeElement.getBoundingClientRect();
            const inputElem = firstDetail.query(By.directive(IgxInputGroupComponent));
            const inputElemPos = inputElem.nativeElement.getBoundingClientRect();

            const tracedCheckbox: any =
                document.elementFromPoint(checkboxPos.left + checkboxPos.height / 2, checkboxPos.top + checkboxPos.height / 2);
            const tracedInput: any =
                document.elementFromPoint(inputElemPos.left + inputElemPos.height / 2, inputElemPos.top + inputElemPos.height / 2);

            checkboxElem.componentInstance.nativeCheckbox.nativeElement.click();
            fix.detectChanges();

            expect(checkboxElem.nativeElement.contains(tracedCheckbox)).toBeTruthy();
            expect(checkboxElem.componentInstance.checked).toBeTruthy();

            UIInteractions.simulateClickAndSelectEvent(inputElem);
            fix.detectChanges();

            expect(inputElem.nativeElement.contains(tracedInput)).toBeTruthy();
            expect(document.activeElement).toEqual(tracedInput);
        });

        it(`Should persist state of rendered templates, such as expansion state of expansion panel,
            checkbox state, etc. after scrolling them in and out of view.`, (async () => {
            GridFunctions.toggleMasterRow(fix, grid.rowList.first);
            fix.detectChanges();

            let firstDetail = GridFunctions.getMasterRowDetailDebug(fix, grid.rowList.first);
            let checkboxElem = firstDetail.query(By.directive(IgxCheckboxComponent));
            let inputElem = firstDetail.query(By.directive(IgxInputGroupComponent));

            expect(grid.rowList.first.rowID).toEqual('ALFKI');
            expect(checkboxElem.componentInstance.checked).toBeFalsy();
            expect(inputElem.componentInstance.input.value).toEqual('');
            expect(getDetailAddressText(firstDetail.nativeElement)).toEqual('Obere Str. 57');

            inputElem.componentInstance.input.value = 'Test value';
            checkboxElem.componentInstance.checked = !checkboxElem.componentInstance.checked;
            fix.detectChanges();

            grid.navigateTo(20);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const row = grid.gridAPI.get_row_by_index(20);
            expect(GridFunctions.elementInGridView(grid, row.nativeElement)).toBeTruthy();

            grid.navigateTo(0);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            firstDetail = GridFunctions.getMasterRowDetailDebug(fix, grid.rowList.first);
            checkboxElem = firstDetail.query(By.directive(IgxCheckboxComponent));
            inputElem = firstDetail.query(By.directive(IgxInputGroupComponent));

            expect(grid.rowList.first.rowID).toEqual('ALFKI');
            expect(checkboxElem.componentInstance.checked).toBeTruthy();
            expect(inputElem.componentInstance.input.value).toEqual('Test value');
            expect(getDetailAddressText(firstDetail.nativeElement)).toEqual('Obere Str. 57');
        }));

        it(`Should persist state of rendered templates, such as expansion state of expansion panel,
            checkbox state, etc. after scrolling them in and out of view.`, () => {
            GridFunctions.toggleMasterRow(fix, grid.rowList.first);
            fix.detectChanges();

            let firstRowDetail = GridFunctions.getMasterRowDetailDebug(fix, grid.rowList.first);
            let checkboxElem = firstRowDetail.query(By.directive(IgxCheckboxComponent)).componentInstance;
            let inputGroup = firstRowDetail.query(By.directive(IgxInputGroupComponent)).componentInstance;

            expect(grid.rowList.first.rowID).toEqual('ALFKI');
            expect(checkboxElem.checked).toBeFalsy();
            expect(inputGroup.input.value).toEqual('');
            expect(getDetailAddressText(firstRowDetail.nativeElement)).toEqual('Obere Str. 57');

            inputGroup.input.value = 'Test value';
            checkboxElem.checked = !checkboxElem.checked;
            fix.detectChanges();

            GridFunctions.toggleMasterRow(fix, grid.rowList.first);
            fix.detectChanges();

            GridFunctions.toggleMasterRow(fix, grid.rowList.first);
            fix.detectChanges();

            firstRowDetail = GridFunctions.getMasterRowDetailDebug(fix, grid.rowList.first);
            checkboxElem = firstRowDetail.query(By.directive(IgxCheckboxComponent)).componentInstance;
            inputGroup = firstRowDetail.query(By.directive(IgxInputGroupComponent)).componentInstance;

            expect(grid.rowList.first.rowID).toEqual('ALFKI');
            expect(checkboxElem.checked).toBeTruthy();
            expect(inputGroup.input.value).toEqual('Test value');
            expect(getDetailAddressText(firstRowDetail.nativeElement)).toEqual('Obere Str. 57');
        });

        it(`Should persist state of rendered templates, such as expansion state of expansion panel,
            checkbox state, etc. after scrolling them in and out of view.`, (async () => {
            fix.detectChanges();
            await wait(DEBOUNCETIME * 2);

            const verticalScrollbar = grid.verticalScrollContainer.getScroll();
            const verticalSrollHeight = (verticalScrollbar.firstElementChild as HTMLElement).offsetHeight;

            grid.navigateTo(26);
            await wait(DEBOUNCETIME * 2);
            fix.detectChanges();
            await wait(DEBOUNCETIME * 2);
            fix.detectChanges();

            GridFunctions.toggleMasterRow(fix, grid.rowList.last);
            await wait(DEBOUNCETIME * 2);
            fix.detectChanges();

            const lastRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.last);
            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.has(grid.rowList.last.rowID)).toBeTruthy();
            expect(grid.expansionStates.get(grid.rowList.last.rowID)).toBeTruthy();
            expect(getDetailAddressText(lastRowDetail)).toEqual('Via Monte Bianco 34');
            expect(verticalSrollHeight + lastRowDetail.offsetHeight)
                .toEqual((verticalScrollbar.firstElementChild as HTMLElement).offsetHeight);
        }));

        it('Should update view when setting a new expansionState object.', () => {
            const newExpanded = new Map<any, boolean>();
            newExpanded.set('ALFKI', true);
            newExpanded.set('ANTON', true);
            newExpanded.set('AROUT', true);

            expect(grid.tbody.nativeElement.firstElementChild.children.length).toEqual(grid.rowList.length);

            grid.expansionStates = newExpanded;
            fix.detectChanges();

            const gridRows = grid.rowList.toArray();
            const firstDetail = GridFunctions.getMasterRowDetail(gridRows[0]);
            const secondDetail = GridFunctions.getMasterRowDetail(gridRows[2]);
            const thirdDetail = GridFunctions.getMasterRowDetail(gridRows[3]);
            expect(grid.tbody.nativeElement.firstElementChild.children.length).toEqual(grid.rowList.length + 3);
            expect(getDetailAddressText(firstDetail)).toEqual('Obere Str. 57');
            expect(getDetailAddressText(secondDetail)).toEqual('Mataderos 2312');
            expect(getDetailAddressText(thirdDetail)).toEqual('120 Hanover Sq.');
        });

        it('Should update rendered detail templates after grid data is changed.', () => {
            const newExpanded = new Map<any, boolean>();
            newExpanded.set('ALFKI', true);
            newExpanded.set('ANTON', true);
            newExpanded.set('AROUT', true);

            expect(grid.tbody.nativeElement.firstElementChild.children.length).toEqual(grid.rowList.length);

            grid.expansionStates = newExpanded;
            fix.detectChanges();

            const newData = [...grid.data].slice(0, 4);
            newData.splice(1, 1);

            grid.data = newData;
            fix.detectChanges();

            const gridRows = grid.rowList.toArray();
            const firstDetail = GridFunctions.getMasterRowDetail(gridRows[0]);
            const secondDetail = GridFunctions.getMasterRowDetail(gridRows[1]);
            const thirdDetail = GridFunctions.getMasterRowDetail(gridRows[2]);
            expect(grid.tbody.nativeElement.firstElementChild.children.length).toEqual(grid.rowList.length + 3);
            expect(getDetailAddressText(firstDetail)).toEqual('Obere Str. 57');
            expect(getDetailAddressText(secondDetail)).toEqual('Mataderos 2312');
            expect(getDetailAddressText(thirdDetail)).toEqual('120 Hanover Sq.');
        });

        it('Should expand and collapse a row in view by using the expandRow(rowID) and collapseRow(rowID) methods.', async () => {
            grid.expandRow(fix.componentInstance.data[0].ID);
            await wait();
            fix.detectChanges();

            const firstRow = grid.rowList.first;
            let firstRowIconName = GridFunctions.getRowExpandIconName(firstRow);
            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.has(firstRow.rowID)).toBeTruthy();
            expect(firstRow.expanded).toBeTruthy();
            expect(firstRowIconName).toEqual(EXPANDED_ICON_NAME);

            grid.collapseRow(fix.componentInstance.data[0].ID);
            await wait();
            fix.detectChanges();

            firstRowIconName = GridFunctions.getRowExpandIconName(firstRow);
            expect(grid.expansionStates.get(fix.componentInstance.data[0].ID)).toBeFalsy();
            expect(firstRow.expanded).toBeFalsy();
            expect(firstRowIconName).toEqual(COLLAPSED_ICON_NAME);
        });

        it('Should expand a row out of view by using the collapseRow() method and update expansionStates.', async () => {
            const lastIndex = fix.componentInstance.data.length - 1;
            const lastDataRecID = fix.componentInstance.data[lastIndex].ID;

            grid.expandRow(lastDataRecID);
            await wait();
            fix.detectChanges();

            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.get(lastDataRecID)).toBeTruthy();
        });

        it('Should collapse a row out of view by using the collapseRow() method and update expansionStates.', async () => {
            GridFunctions.setAllExpanded(grid, fix.componentInstance.data);
            await wait();
            fix.detectChanges();

            const lastIndex = fix.componentInstance.data.length - 1;
            const lastDataRecID = fix.componentInstance.data[lastIndex].ID;

            grid.collapseRow(lastDataRecID);
            await wait();
            fix.detectChanges();

            expect(grid.expansionStates.size).toEqual(fix.componentInstance.data.length);
            expect(grid.expansionStates.get(lastDataRecID)).toBeFalsy();
        });

        it('Should toggle a row expand state by using the toggleRow(rowID) method.', async () => {
            grid.toggleRow(fix.componentInstance.data[0].ID);
            await wait();
            fix.detectChanges();

            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.has(grid.rowList.first.rowID)).toBeTruthy();
            expect(grid.rowList.toArray()[0].expanded).toBeTruthy();

            grid.toggleRow(fix.componentInstance.data[0].ID);
            await wait();
            fix.detectChanges();

            expect(grid.expansionStates.get(fix.componentInstance.data[0].ID)).toBeFalsy();
            expect(grid.rowList.toArray()[0].expanded).toBeFalsy();
        });

        it('Should expand all rows using the expandAll() method and the expansion state should be updated.', async () => {
            grid.expandAll();
            await wait();
            fix.detectChanges();

            expect(grid.expansionStates.size).toEqual(0);
            grid.rowList.toArray().forEach(row => {
                expect(row.expanded).toBeTruthy();
            });
        });

        it('Should collapse all rows using the collapseAll() method and the expansion state should be updated.', async () => {
            GridFunctions.setAllExpanded(grid, fix.componentInstance.data);
            await wait();
            fix.detectChanges();

            grid.rowList.toArray().forEach(row => {
                expect(row.expanded).toBeTruthy();
            });

            grid.collapseAll();
            await wait();
            fix.detectChanges();

            expect(grid.expansionStates.size).toEqual(0);
            grid.rowList.toArray().forEach(row => {
                expect(row.expanded).toBeFalsy();
            });
        });
    });

    describe('Keyboard Navigation ', () => {
        let gridContent: DebugElement;
        beforeEach(async () => {
            fix = TestBed.createComponent(AllExpandedGridMasterDetailComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fix);
            await wait(DEBOUNCETIME * 4);
            fix.detectChanges();
        });

        it('Should navigate down through a detail view by focusing the whole row and continuing onto the next with arrow down.', () => {
            const targetCellElement = grid.getCellByColumn(0, 'ContactName');
            UIInteractions.simulateClickAndSelectEvent(targetCellElement);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent);
            fix.detectChanges();

            const firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);
            GridFunctions.verifyMasterDetailRowFocused(firstRowDetail);
            expect(targetCellElement.selected).toBeTruthy();

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent);
            fix.detectChanges();

            expect(grid.getCellByColumn(2, 'ContactName').selected).toBeTruthy();
        });

        it('Should navigate down through a detail view partially out of view by scrolling it so it becomes fully visible.', async () => {
            const row = grid.gridAPI.get_row_by_index(4) as IgxGridRowComponent;
            const targetCellElement = grid.getCellByColumn(4, 'ContactName');
            UIInteractions.simulateClickAndSelectEvent(targetCellElement);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const detailRow = GridFunctions.getMasterRowDetail(row);
            GridFunctions.verifyMasterDetailRowFocused(detailRow);
            expect(GridFunctions.elementInGridView(grid, detailRow)).toBeTruthy();
        });

        it('Should navigate down through a detail view completely out of view by scrolling to it.', async () => {
            grid.navigateTo(6, 0);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const row = grid.gridAPI.get_row_by_index(6) as IgxGridRowComponent;
            const targetCellElement = grid.getCellByColumn(6, 'ContactName');
            UIInteractions.simulateClickAndSelectEvent(targetCellElement);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const detailRow = GridFunctions.getMasterRowDetail(row);
            GridFunctions.verifyMasterDetailRowFocused(detailRow);
            expect(GridFunctions.elementInGridView(grid, detailRow)).toBeTruthy();
        });

        it('Should navigate up through a detail view by focusing the whole row and continuing onto the next with arrow up.', () => {
            const prevRow = grid.gridAPI.get_row_by_index(0) as IgxGridRowComponent;
            const targetCellElement = grid.getCellByColumn(2, 'ContactName');
            UIInteractions.simulateClickAndSelectEvent(targetCellElement);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent);
            fix.detectChanges();

            const detailRow = GridFunctions.getMasterRowDetail(prevRow);
            GridFunctions.verifyMasterDetailRowFocused(detailRow);
            expect(targetCellElement.selected).toBeTruthy();

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent);
            fix.detectChanges();

            expect(prevRow.cells.toArray()[0].selected).toBeTruthy();
        });

        it('Should navigate up through a detail view partially out of view by scrolling it so it becomes fully visible.', async () => {
            grid.verticalScrollContainer.addScrollTop(90);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const row = grid.gridAPI.get_row_by_index(2);
            const targetCellElement = grid.getCellByColumn(2, 'ContactName');
            UIInteractions.simulateClickAndSelectEvent(targetCellElement);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const detailRow = row.element.nativeElement.previousElementSibling as HTMLElement;
            GridFunctions.verifyMasterDetailRowFocused(detailRow);
            expect(GridFunctions.elementInGridView(grid, detailRow)).toBeTruthy();
        });

        it('Should navigate up through a detail view completely out of view by scrolling to it.', async () => {
            grid.verticalScrollContainer.addScrollTop(170);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            let row = grid.gridAPI.get_row_by_index(2);
            const targetCellElement = grid.getCellByColumn(2, 'ContactName');
            UIInteractions.simulateClickAndSelectEvent(targetCellElement);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            row = grid.gridAPI.get_row_by_index(2);
            const detailRow = row.element.nativeElement.previousElementSibling as HTMLElement;
            GridFunctions.verifyMasterDetailRowFocused(detailRow);
            expect(GridFunctions.elementInGridView(grid, detailRow)).toBeTruthy();
        });

        it('Should expand and collapse using Alt + Right/Down and Alt + Left/Up without losing focus on current row.', async () => {
            const row = grid.gridAPI.get_row_by_index(0) as IgxGridRowComponent;
            const targetCellElement = grid.getCellByColumn(0, 'ContactName');
            UIInteractions.simulateClickAndSelectEvent(targetCellElement);
            fix.detectChanges();
            expect(targetCellElement.active).toBeTruthy();

            // collapse with alt + arrowup
            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            expect(row.expanded).toBeFalsy();
            expect(targetCellElement.active).toBeTruthy();

            // expand with alt + ArrowDown
            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            expect(row.expanded).toBeTruthy();
            expect(targetCellElement.active).toBeTruthy();

            // collapse with alt + arrowleft
            UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', gridContent, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            expect(row.expanded).toBeFalsy();
            expect(targetCellElement.active).toBeTruthy();

            // expand with alt + arrowright
            UIInteractions.triggerEventHandlerKeyDown('ArrowRight', gridContent, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            expect(row.expanded).toBeTruthy();
            expect(targetCellElement.active).toBeTruthy();
        });

        it(`Should expand and collapse using Alt + Right/Down and Alt + Left/Up
            at the bottom of the grid without losing focus.`, async () => {
            // navigate to last
            grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1);
            await wait(100);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const row = grid.gridAPI.get_row_by_index(52) as IgxGridRowComponent;
            let targetCellElement = grid.getCellByColumn(52, 'ContactName');

            UIInteractions.simulateClickAndSelectEvent(targetCellElement);
            fix.detectChanges();
            expect(targetCellElement.active).toBeTruthy();

            // collapse with alt + arrowup
            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(row.expanded).toBeFalsy();
            targetCellElement = grid.getCellByColumn(52, 'ContactName');
            expect(targetCellElement.active).toBeTruthy();

            // expand with alt + ArrowDown
            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(row.expanded).toBeTruthy();
            targetCellElement = grid.getCellByColumn(52, 'ContactName');
            expect(targetCellElement.active).toBeTruthy();
        });

        it('Should navigate to the correct row/cell when using the navigateTo method in a grid with expanded detail views.', async () => {
            pending('This test should pass when the issue #7300 is fixed.');
            grid.navigateTo(20, 0);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            let row = grid.gridAPI.get_row_by_index(20) as IgxGridRowComponent;
            expect(row).not.toBeNull();
            expect(GridFunctions.elementInGridView(grid, row.nativeElement)).toBeTruthy();

            grid.navigateTo(21, 0);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            row = grid.gridAPI.get_row_by_index(20) as IgxGridRowComponent;
            const detailRow = GridFunctions.getMasterRowDetail(row);
            expect(GridFunctions.elementInGridView(grid, detailRow)).toBeTruthy();

        });

        it('Should navigate to the last data cell in the grid using Ctrl + End.', async () => {
            setupGridScrollDetection(fix, grid);
            const targetCellElement = grid.getCellByColumn(0, 'ContactName');
            UIInteractions.simulateClickAndSelectEvent(targetCellElement);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('End', gridContent, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const lastRow = grid.gridAPI.get_row_by_index(52);
            expect(lastRow).not.toBeUndefined();
            expect(GridFunctions.elementInGridView(grid, lastRow.nativeElement)).toBeTruthy();
            expect(lastRow.cells.last.active).toBeTruthy();
        });

        it('Should navigate to the first data cell in the grid using Ctrl + Home.', async () => {
            setupGridScrollDetection(fix, grid);
            grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const targetCellElement = grid.getCellByColumn(52, 'ContactName');
            UIInteractions.simulateClickAndSelectEvent(targetCellElement);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('Home', gridContent, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const fRow = grid.gridAPI.get_row_by_index(0);
            expect(fRow).not.toBeUndefined();
            expect(GridFunctions.elementInGridView(grid, fRow.nativeElement)).toBeTruthy();
            expect(fRow.cells.first.active).toBeTruthy();
        });

        it('Should navigate to the last data row using Ctrl + ArrowDown when all rows are expanded.', async () => {
            setupGridScrollDetection(fix, grid);
            const targetCellElement = grid.getCellByColumn(0, 'ContactName');
            UIInteractions.simulateClickAndSelectEvent(targetCellElement);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const lastRow = grid.gridAPI.get_row_by_index(52);
            expect(lastRow).not.toBeUndefined();
            expect(GridFunctions.elementInGridView(grid, lastRow.nativeElement)).toBeTruthy();
            expect(lastRow.cells.first.active).toBeTruthy();
        });

        it('Should navigate to the first data row using Ctrl + ArrowUp when all rows are expanded.', async () => {
            setupGridScrollDetection(fix, grid);
            grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const targetCellElement = grid.getCellByColumn(52, 'CompanyName');
            UIInteractions.simulateClickAndSelectEvent(targetCellElement);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent, false, false, true);
            await waitForActiveNodeChange(grid);
            fix.detectChanges();

            const fRow = grid.gridAPI.get_row_by_index(0);
            expect(fRow).not.toBeUndefined();
            expect(GridFunctions.elementInGridView(grid, fRow.nativeElement)).toBeTruthy();
            expect(fRow.cells.last.active).toBeTruthy();
        });

        it(`Should navigate to the first/last row when using Ctrl+ArrowUp/ArrowDown
                and focus is on the detail row container.`, async () => {
            // Focus first cell
            let row = grid.gridAPI.get_row_by_index(0);
            let detailRow = GridFunctions.getMasterRowDetail(row);
            UIInteractions.simulateClickAndSelectEvent(detailRow);
            fix.detectChanges();

            GridFunctions.verifyMasterDetailRowFocused(detailRow);

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            row = grid.gridAPI.get_row_by_index(0);
            detailRow = GridFunctions.getMasterRowDetail(row);
            GridFunctions.verifyMasterDetailRowFocused(detailRow);

            // Got to details row
            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            row = grid.gridAPI.get_row_by_index(0);
            detailRow = GridFunctions.getMasterRowDetail(row);
            GridFunctions.verifyMasterDetailRowFocused(detailRow);
        });

        it('Should not navigate if keydown is done on an element inside the details template.', () => {
            const detailRow = GridFunctions.getMasterRowDetailDebug(fix, grid.rowList.first);
            const input = detailRow.query(By.css('input[name="Comment"]'));
            input.nativeElement.focus();
            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', input);

            fix.detectChanges();
            expect(document.activeElement).toBe(input.nativeElement);
        });
    });

    describe('Integration', () => {
        describe('Paging', () => {
             it('Should not take into account expanded detail views as additional records.', fakeAsync(() => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                grid = fix.componentInstance.grid;
                fix.detectChanges();

                fix.componentInstance.paging = true;
                fix.detectChanges();

                grid.expandRow(fix.componentInstance.data[0].ID);
                fix.detectChanges();

                const initialTotalRecords = grid.pagingState.metadata.countRecords;
                expect(grid.pagingState.metadata.countRecords).toEqual(initialTotalRecords);
            }));

            it('Should persist template state after paging to a page with fewer records and paging back.', fakeAsync(() => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                fix.componentInstance.perPage = 5;
                grid = fix.componentInstance.grid;
                fix.detectChanges();

                fix.componentInstance.paging = true;
                fix.detectChanges();

                grid.expandRow(fix.componentInstance.data[4].ID);
                fix.detectChanges();

                // click the template checkbox
                let checkbox = fix.debugElement.query(By.directive(IgxCheckboxComponent));
                checkbox.componentInstance.checked = !checkbox.componentInstance.checked;
                fix.detectChanges();

                // go to last page that doesn't contain this view
                grid.page = grid.pagingState.metadata.countPages - 1;
                fix.detectChanges();

                // go back to first page
                grid.page = 0;
                fix.detectChanges();

                // check checkbox state
                checkbox = fix.debugElement.query(By.directive(IgxCheckboxComponent));
                expect(checkbox.componentInstance.checked).toBeTruthy();
            }));
        });

        describe('Hiding', () => {
            it('Should set the expand/collapse icon to the new first visible column when hiding the first column.', fakeAsync(() => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                grid = fix.componentInstance.grid;
                fix.detectChanges();

                grid.columnList.first.hidden = true;
                fix.detectChanges();

                expect(grid.rowList.first.cells.first instanceof IgxGridExpandableCellComponent).toBeTruthy();
            }));
        });

        describe('Pinning', () => {
            beforeEach(fakeAsync(() => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                grid = fix.componentInstance.grid;
                fix.detectChanges();
            }));

            it('Should keep/move the expand/collapse icon to the correct column when pinning the first column or another one.', () => {
                grid.columnList.last.pin();
                fix.detectChanges();

                expect(grid.rowList.first.cells.first instanceof IgxGridExpandableCellComponent).toBeTruthy();

                grid.pinnedColumns[0].unpin();
                fix.detectChanges();

                expect(grid.rowList.first.cells.first instanceof IgxGridExpandableCellComponent).toBeTruthy();
            });

            it('Should render detail view correctly when expanding a master row and there are pinned columns.', () => {
                grid.columnList.last.pin();
                grid.expandRow(fix.componentInstance.data[0].ID);
                fix.detectChanges();

                const firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);
                expect(getDetailAddressText(firstRowDetail)).toEqual('Obere Str. 57');
                expect(firstRowDetail.querySelector(HIERARCHICAL_INDENT_CLASS)).toBeDefined();
            });
        });

        describe('Column Moving', () => {
            beforeEach(fakeAsync(() => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                grid = fix.componentInstance.grid;
                fix.detectChanges();
            }));

            it('Should keep the expand/collapse icon in the first column, even when moving a column in first place.', () => {
                grid.moveColumn(grid.columnList.last, grid.columnList.first);
                fix.detectChanges();

                expect(grid.rowList.first.cells.first instanceof IgxGridExpandableCellComponent).toBeTruthy();
            });

            it('Should keep the expand/collapse icon in the first column, even when moving a column out of first place.', () => {
                grid.moveColumn(grid.columnList.first, grid.columnList.last);
                fix.detectChanges();

                expect(grid.rowList.first.cells.first instanceof IgxGridExpandableCellComponent).toBeTruthy();
            });
        });

        describe('Cell Selection', () => {
            beforeEach(fakeAsync(() => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                grid = fix.componentInstance.grid;
                fix.detectChanges();
            }));

            it('Should exclude expanded detail views when doing range cell selection', fakeAsync(() => {
                grid.expandRow(fix.componentInstance.data[2].ID);
                const selectionChangeSpy = spyOn<any>(grid.rangeSelected, 'emit').and.callThrough();
                const startCell = grid.getCellByColumn(1, 'ContactName');
                const endCell = grid.getCellByColumn(6, 'CompanyName');
                const range = { rowStart: 1, rowEnd: 6, columnStart: 0, columnEnd: 1 };

                UIInteractions.simulatePointerOverElementEvent('pointerdown', startCell.nativeElement);
                startCell.nativeElement.dispatchEvent(new Event('click'));
                grid.cdr.detectChanges();

                expect(startCell.active).toBe(true);

                for (let i = 2; i < 6; i++) {
                    const cell = grid.getCellByColumn(i, 'ContactName');
                    if (!cell) {
                        UIInteractions.simulatePointerOverElementEvent('pointerenter',
                            fix.debugElement.query(By.css('.addressArea')).nativeElement);
                        continue;
                    }
                    UIInteractions.simulatePointerOverElementEvent('pointerenter', cell.nativeElement);
                    grid.cdr.detectChanges();
                }
                UIInteractions.simulatePointerOverElementEvent('pointerenter', endCell.nativeElement);
                UIInteractions.simulatePointerOverElementEvent('pointerup', endCell.nativeElement);
                GridSelectionFunctions.verifyCellsRegionSelected(grid, 1, 2, 0, 1, true);
                GridSelectionFunctions.verifyCellsRegionSelected(grid, 4, 5, 0, 1, true);
                grid.cdr.detectChanges();

                expect(startCell.active).toBe(true);

                const rowDetail = GridFunctions.getMasterRowDetail(grid.rowList.toArray()[2]);
                expect(selectionChangeSpy).toHaveBeenCalledTimes(1);
                expect(selectionChangeSpy).toHaveBeenCalledWith(range);
                expect(rowDetail.querySelector('[class*="selected"]')).toBeNull();
            }));

            it('getSelectedData should return correct values when there are master details', fakeAsync(() => {
                const range = { rowStart: 0, rowEnd: 5, columnStart: 'ContactName', columnEnd: 'ContactName' };
                const expectedData = [
                    { ContactName: 'Maria Anders' },
                    { ContactName: 'Ana Trujillo' },
                    { ContactName: 'Antonio Moreno' }
                ];
                grid.expandAll();
                tick(100);
                fix.detectChanges();

                grid.selectRange(range);
                fix.detectChanges();
                expect(grid.getSelectedData()).toEqual(expectedData);
            }));
        });

        describe('Row Selection', () => {
            beforeEach(fakeAsync(() => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                grid = fix.componentInstance.grid;
                fix.componentInstance.rowSelectable = true;
                fix.detectChanges();
            }));

            it('Should not render row selection checkbox for detail views.', () => {
                grid.expandRow(fix.componentInstance.data[2].ID);
                fix.detectChanges();
                const rowDetail = GridFunctions.getMasterRowDetail(grid.rowList.toArray()[2]);
                expect(GridSelectionFunctions.getRowCheckboxDiv(rowDetail)).toBeNull();
            });

            it('Should highlight only the master row when selecting it and not the detail row.', () => {
                grid.expandRow(fix.componentInstance.data[2].ID);
                fix.detectChanges();

                const row = grid.rowList.toArray()[2];
                GridSelectionFunctions.rowCheckboxClick(row);
                fix.detectChanges();

                const rowDetail = GridFunctions.getMasterRowDetail(row);
                expect(row.nativeElement.classList).toContain(SELECTED_ROW_CALSS_NAME);
                expect(rowDetail.querySelector('[class*="selected"]')).toBeNull();
            });
        });

        describe('Search', () => {
            it('Should scroll to the correct parent rows when searching in a grid with expanded detail views.', async () => {
                fix = TestBed.createComponent(AllExpandedGridMasterDetailComponent);
                fix.detectChanges();
                await wait();
                fix.detectChanges();
                grid = fix.componentInstance.grid;

                grid.findNext('Paolo');
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                let row = grid.gridAPI.get_row_by_index(52);
                expect(row).not.toBeNull();
                GridFunctions.elementInGridView(grid, row.nativeElement);
                grid.findPrev('Maria');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                row = grid.gridAPI.get_row_by_index(0);
                expect(row).not.toBeNull();
                GridFunctions.elementInGridView(grid, row.nativeElement);
            });
        });

        describe('Updating', () => {
            beforeEach(async () => {
                fix = TestBed.createComponent(AllExpandedGridMasterDetailComponent);
                fix.detectChanges();
                await wait();
                fix.detectChanges();

                grid = fix.componentInstance.grid;
            });

            it('Should remove expanded detail view after deleting its parent row.', () => {
                let detailViews = GridFunctions.getAllMasterRowDetailDebug(fix);
                expect(detailViews[0].context.index).toBe(1);
                grid.deleteRow('ALFKI');
                fix.detectChanges();
                const row = grid.getRowByKey('ALFKI');
                expect(row).toBeUndefined();
                detailViews = GridFunctions.getAllMasterRowDetailDebug(fix);
                expect(detailViews[0].context.index).toBe(1);
                expect(detailViews[0].context.templateID).toBe('detailRow-ANATR');
            });

            it('Should be able to expand detail view of newly added row.', async () => {
                grid.addRow({ ID: '123', CompanyName: 'Test', ContactName: 'Test', Address: 'Test Address' });
                fix.detectChanges();
                // scroll to bottom
                grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                // check row can be expanded
                const lastRow = grid.rowList.last;
                GridFunctions.toggleMasterRow(fix, lastRow);
                await wait();
                fix.detectChanges();
                expect(lastRow.expanded).toBeTruthy();
                const lastRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.last);
                expect(getDetailAddressText(lastRowDetail)).toEqual('Test Address');
            });

        });

        describe('Sorting', () => {
            it('Should rearrange detail views to their correct parents after sorting.', async () => {
                fix = TestBed.createComponent(AllExpandedGridMasterDetailComponent);
                fix.detectChanges();
                await wait();
                fix.detectChanges();
                grid = fix.componentInstance.grid;

                grid.sort({ fieldName: 'ContactName', dir: SortingDirection.Desc, ignoreCase: true });
                fix.detectChanges();

                let row = grid.rowList.first;
                let detailRow = GridFunctions.getMasterRowDetail(row);

                expect(row.rowData['ContactName']).toBe('Yang Wang');
                expect(getDetailAddressText(detailRow)).toEqual(row.rowData['Address']);

                row = grid.rowList.toArray()[1];
                detailRow = GridFunctions.getMasterRowDetail(row);
                expect(row.rowData['ContactName']).toBe('Victoria Ashworth');
                expect(getDetailAddressText(detailRow)).toEqual(row.rowData['Address']);
            });
        });

        describe('Filtering', () => {
            it('Should persist template state after filtering out the whole data and removing the filter.', fakeAsync(() => {
                fix = TestBed.createComponent(AllExpandedGridMasterDetailComponent);
                fix.detectChanges();
                tick(100);
                fix.detectChanges();
                grid = fix.componentInstance.grid;

                let checkbox = fix.debugElement.query(By.directive(IgxCheckboxComponent));
                checkbox.componentInstance.checked = !checkbox.componentInstance.checked;
                fix.detectChanges();

                // check checkbox state
                checkbox = fix.debugElement.query(By.directive(IgxCheckboxComponent));
                expect(checkbox.componentInstance.checked).toBeTruthy();

                grid.filter('ContactName', 'NonExistingName', IgxStringFilteringOperand.instance().condition('equals'), true);
                fix.detectChanges();
                tick(100);
                expect(grid.rowList.length).toBe(0);

                grid.clearFilter();
                fix.detectChanges();
                tick(100);

                // check checkbox state is persisted.
                checkbox = fix.debugElement.query(By.directive(IgxCheckboxComponent));
                expect(checkbox.componentInstance.checked).toBeTruthy();
            }));
        });

        describe('Multi-row layout', () => {
            beforeEach(fakeAsync(() => {
                fix = TestBed.createComponent(MRLMasterDetailComponent);
                fix.detectChanges();
                grid = fix.componentInstance.grid;

                GridFunctions.toggleMasterRow(fix, grid.rowList.first);
                fix.detectChanges();
            }));

            it('Should render expand/collapse icon in the column with visible index 0.', () => {
                const cell = grid.getCellByKey('ALFKI', 'CompanyName');
                expect(cell instanceof IgxGridExpandableCellComponent).toBeTruthy();
                const iconName = cell.nativeElement.querySelector('igx-icon').textContent;
                expect(iconName).toEqual(EXPANDED_ICON_NAME);
                const firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);
                expect(getDetailAddressText(firstRowDetail)).toEqual('Obere Str. 57');
            });

            it('Should expand detail view without breaking multi-row layout.', () => {
                // check row order
                const rows = fix.debugElement.queryAll(By.css(ROW_TAG));
                const detailViews = GridFunctions.getAllMasterRowDetailDebug(fix);
                expect(detailViews.length).toBe(1);

                expect(rows[0].context.index).toBe(0);
                expect(detailViews[0].context.index).toBe(1);
                expect(rows[1].context.index).toBe(2);
            });

            it(`Should navigate down through a detail view by focusing the whole row and continuing
            onto the next with arrow down in multi-row layout grid.`, async () => {
                const gridContent = GridFunctions.getGridContent(fix);
                let targetCellElement = grid.getCellByColumn(0, 'ContactName');
                UIInteractions.simulateClickAndSelectEvent(targetCellElement);
                fix.detectChanges();

                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent);
                fix.detectChanges();

                targetCellElement = grid.getCellByColumn(0, 'Address');
                expect(targetCellElement.active).toBeTruthy();

                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent);
                fix.detectChanges();

                const firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);
                GridFunctions.verifyMasterDetailRowFocused(firstRowDetail);

                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent);
                await wait();
                fix.detectChanges();

                targetCellElement = grid.getCellByColumn(2, 'CompanyName');
                expect(targetCellElement.active).toBeTruthy();
            });

            it(`Should navigate up through a detail view by
            focusing the whole row and continuing onto the next with arrow up in multi-row layout grid.`, async () => {
                const gridContent = GridFunctions.getGridContent(fix);
                let targetCellElement = grid.getCellByColumn(2, 'ContactName');
                UIInteractions.simulateClickAndSelectEvent(targetCellElement);
                fix.detectChanges();

                UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent);
                await wait();
                fix.detectChanges();

                targetCellElement = grid.getCellByColumn(2, 'CompanyName');
                expect(targetCellElement.active).toBeTruthy();

                UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent);
                fix.detectChanges();

                const firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);
                GridFunctions.verifyMasterDetailRowFocused(firstRowDetail);

                UIInteractions.triggerEventHandlerKeyDown('ArrowUp', gridContent);
                fix.detectChanges();

                targetCellElement = grid.getCellByColumn(0, 'Address');
                expect(targetCellElement.active).toBeTruthy();
            });
        });

        describe('GroupBy', () => {
            beforeEach(fakeAsync(() => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                fix.detectChanges();

                grid = fix.componentInstance.grid;
                grid.getColumnByName('ContactName').hasSummary = true;
                fix.detectChanges();

                grid.summaryCalculationMode = GridSummaryCalculationMode.childLevelsOnly;
                grid.groupingExpressions =
                    [{ fieldName: 'CompanyName', dir: SortingDirection.Asc, ignoreCase: false }];
                fix.detectChanges();
            }));

            it(`Should correctly position summary rows when summary row position is bottom
            after grouping by and detail views for the group rows are expanded.`, async () => {
                grid.expandAll();
                await wait();
                fix.detectChanges();

                const allRows = grid.tbody.nativeElement.firstElementChild.children;
                expect(allRows.length).toBe(8);
                expect(allRows[0].tagName.toLowerCase()).toBe(GROUP_ROW_TAG);
                expect(allRows[1].tagName.toLowerCase()).toBe(ROW_TAG);
                expect(allRows[2].tagName.toLowerCase()).toBe('div');
                expect(allRows[2].getAttribute('detail')).toBe('true');
                expect(allRows[3].tagName.toLowerCase()).toBe(SUMMARY_ROW_TAG);
                expect(allRows[4].tagName.toLowerCase()).toBe(GROUP_ROW_TAG);
                expect(allRows[5].tagName.toLowerCase()).toBe(ROW_TAG);
                expect(allRows[6].tagName.toLowerCase()).toBe('div');
                expect(allRows[6].getAttribute('detail')).toBe('true');
                expect(allRows[7].tagName.toLowerCase()).toBe(SUMMARY_ROW_TAG);
            });

            it(`Should correctly position summary rows when summary row position is top
            after grouping by and detail views for the group rows are expanded.`, async () => {
                grid.expandAll();
                await wait();
                fix.detectChanges();

                grid.summaryPosition = GridSummaryPosition.top;
                fix.detectChanges();

                const allRows = grid.tbody.nativeElement.firstElementChild.children;
                expect(allRows.length).toBe(8);
                expect(allRows[0].tagName.toLowerCase()).toBe(GROUP_ROW_TAG);
                expect(allRows[1].tagName.toLowerCase()).toBe(SUMMARY_ROW_TAG);
                expect(allRows[2].tagName.toLowerCase()).toBe(ROW_TAG);
                expect(allRows[3].tagName.toLowerCase()).toBe('div');
                expect(allRows[3].getAttribute('detail')).toBe('true');
                expect(allRows[4].tagName.toLowerCase()).toBe(GROUP_ROW_TAG);
                expect(allRows[5].tagName.toLowerCase()).toBe(SUMMARY_ROW_TAG);
                expect(allRows[6].tagName.toLowerCase()).toBe(ROW_TAG);
                expect(allRows[7].tagName.toLowerCase()).toBe('div');
                expect(allRows[7].getAttribute('detail')).toBe('true');
            });

            it(`Should correctly position summary rows when summary row position is top
            after grouping by and detail views for the group rows are collapsed.`, () => {
                grid.summaryPosition = GridSummaryPosition.top;
                fix.detectChanges();
                const allRows = grid.tbody.nativeElement.firstElementChild.children;
                expect(allRows.length).toBe(9);
                expect(allRows[0].tagName.toLowerCase()).toBe(GROUP_ROW_TAG);
                expect(allRows[1].tagName.toLowerCase()).toBe(SUMMARY_ROW_TAG);
                expect(allRows[2].tagName.toLowerCase()).toBe(ROW_TAG);
                expect(allRows[3].tagName.toLowerCase()).toBe(GROUP_ROW_TAG);
                expect(allRows[4].tagName.toLowerCase()).toBe(SUMMARY_ROW_TAG);
                expect(allRows[5].tagName.toLowerCase()).toBe(ROW_TAG);
                expect(allRows[6].tagName.toLowerCase()).toBe(GROUP_ROW_TAG);
                expect(allRows[7].tagName.toLowerCase()).toBe(SUMMARY_ROW_TAG);
                expect(allRows[8].tagName.toLowerCase()).toBe(ROW_TAG);
            });

            it(`Should correctly position summary rows when summary
            row position is bottom after grouping by and detail views for the group rows are collapsed.`, () => {
                const allRows = grid.tbody.nativeElement.firstElementChild.children;
                expect(allRows.length).toBe(9);
                expect(allRows[0].tagName.toLowerCase()).toBe(GROUP_ROW_TAG);
                expect(allRows[1].tagName.toLowerCase()).toBe(ROW_TAG);
                expect(allRows[2].tagName.toLowerCase()).toBe(SUMMARY_ROW_TAG);
                expect(allRows[3].tagName.toLowerCase()).toBe(GROUP_ROW_TAG);
                expect(allRows[4].tagName.toLowerCase()).toBe(ROW_TAG);
                expect(allRows[5].tagName.toLowerCase()).toBe(SUMMARY_ROW_TAG);
                expect(allRows[6].tagName.toLowerCase()).toBe(GROUP_ROW_TAG);
                expect(allRows[7].tagName.toLowerCase()).toBe(ROW_TAG);
                expect(allRows[8].tagName.toLowerCase()).toBe(SUMMARY_ROW_TAG);
            });
        });
    });
});

@Component({
    template: `
        <igx-grid [data]="data" [width]="width" [height]="height" [primaryKey]="'ID'" [allowFiltering]="true"
         [perPage]="perPage" [rowSelection]="rowSelectable">
            <igx-column *ngFor="let c of columns" [field]="c.field" [width]="c.width" [dataType]='c.dataType'>
            </igx-column>
            <igx-paginator *ngIf="paging"></igx-paginator>

            <ng-template igxGridDetail let-dataItem>
                <div>
                    <div class="checkboxArea">
                    <igx-checkbox [disableRipple]="true"></igx-checkbox>
                        <span style="font-weight: 600">Available</span>
                    </div>
                    <div class="addressArea">{{dataItem.Address}}</div>
                    <igx-input-group class="igxInputGroup">
                        <input igxInput />
                    </igx-input-group>
                </div>
            </ng-template>
        </igx-grid>
    `
})
export class DefaultGridMasterDetailComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    public width = '800px';
    public height = '500px';
    public data = SampleTestData.contactInfoDataFull();
    public columns = [
        { field: 'ContactName', width: 400, dataType: 'string' },
        { field: 'CompanyName', width: 400, dataType: 'string' }
    ];
    public paging = false;
    public perPage = 15;
    public rowSelectable = GridSelectionMode.none;
}

@Component({
    template: `
        <igx-grid [data]="data" [expansionStates]='expStates'
         [width]="width" [height]="height" [primaryKey]="'ID'" [paging]="paging" [rowSelection]="rowSelectable">
            <igx-column *ngFor="let c of columns" [field]="c.field" [header]="c.field" [width]="c.width" [dataType]='c.dataType'>
            </igx-column>

            <ng-template igxGridDetail let-dataItem>
                <div>
                    <div class="checkboxArea">
                        <igx-checkbox [disableRipple]="true"></igx-checkbox>
                        <span style="font-weight: 600">Available</span>
                    </div>
                    <div class="addressArea">{{dataItem.Address}}</div>
                    <div class="inputArea"><input type="text" name="Comment"></div>
                </div>
            </ng-template>
        </igx-grid>
    `
})
export class AllExpandedGridMasterDetailComponent extends DefaultGridMasterDetailComponent implements OnInit {
    public expStates = new Map<any, boolean>();
    public ngOnInit(): void {
        const allExpanded = new Map<any, boolean>();
        this.data.forEach(item => {
            allExpanded.set(item['ID'], true);
        });
        this.expStates = allExpanded;
    }
}

@Component({
    template: `
        <igx-grid [data]="data"
         [width]="width" [height]="height" [primaryKey]="'ID'" [paging]="paging" [rowSelection]="rowSelectable">
        <igx-column-layout field='group2'>
            <igx-column [rowStart]="1" [colStart]="1" [colEnd]="3" field="CompanyName" [width]="'300px'"></igx-column>
            <igx-column [rowStart]="2" [colStart]="1" field="ContactName" [width]="'100px'"></igx-column>
            <igx-column [rowStart]="2" [colStart]="2" field="ContactTitle" [width]="'200px'"></igx-column>
            <igx-column [rowStart]="3" [colStart]="1" [colEnd]="3" field="Address" [width]="'300px'"></igx-column>
        </igx-column-layout>
        <igx-column-layout>
            <igx-column [rowStart]="1" [colStart]="1" [colEnd]="3" [rowEnd]="3" field="City" [width]="'300px'"></igx-column>
            <igx-column [rowStart]="3" [colStart]="1"  [colEnd]="3" field="Region" [width]='"300px"'></igx-column>
        </igx-column-layout>
        <igx-column-layout field='group1'>
            <igx-column  [rowStart]="1" [colStart]="1" [rowEnd]="4" field="ID"></igx-column>
        </igx-column-layout>
            <ng-template igxGridDetail let-dataItem>
                <div>
                    <div class="checkboxArea">
                        <igx-checkbox [disableRipple]="true"></igx-checkbox>
                        <span style="font-weight: 600">Available</span>
                    </div>
                    <div class="addressArea">{{dataItem.Address}}</div>
                    <div class="inputArea"><input type="text" name="Comment"></div>
                </div>
            </ng-template>
        </igx-grid>
    `
})
export class MRLMasterDetailComponent extends DefaultGridMasterDetailComponent { }

const getDetailAddressText = (detailElem) => detailElem.querySelector('.addressArea').innerText;
