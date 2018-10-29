import { Component, ViewChild, DebugElement } from '@angular/core';
import { async, discardPeriodicTasks, fakeAsync, TestBed, tick, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Calendar } from '../../calendar/calendar';
import { IgxInputDirective } from '../../directives/input/input.directive';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { IgxFilteringOperand, IgxStringFilteringOperand,
     FilteringExpressionsTree, FilteringLogic, IgxChipComponent } from '../../../public_api';
import { IgxButtonDirective } from '../../directives/button/button.directive';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxNumberFilteringOperand, IgxDateFilteringOperand, IgxBooleanFilteringOperand } from '../../data-operations/filtering-condition';
import { IgxDatePickerComponent } from '../../date-picker/date-picker.component';

const FILTER_UI_ROW = 'igx-grid-filtering-row';
const FILTER_UI_CONTAINER = 'igx-grid-filter';

describe('IgxGrid - Filtering actions', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridFilteringComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxGridModule.forRoot()]
        })
            .compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    // UI tests string column, empty input
    it('UI tests on string column', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[1].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();

        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        let input = filterUIRow.query(By.directive(IgxInputDirective));

        const reset = filterUIRow.queryAll(By.css('button'))[0];
        const close = filterUIRow.queryAll(By.css('button'))[1];

        expect(grid.rowList.length).toEqual(8);

        // open dropdown
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        const ddItems = ddList.nativeElement.children;

        // iterate over not unary conditions when input is empty
        // starts with
        verifyFilterUIPosition(filterUIRow, grid);

        ddItems[2].click();
        // select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);
        // ends with
        ddItems[3].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);
        // does not contain
        ddItems[1].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);
        // equals
        ddItems[0].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);
        // does not equal
        ddItems[5].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);
        // empty
        ddItems[6].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(4);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        removeFilterChipByIndex(0, filterUIRow);

        // open dropdown
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);
        // not empty
        ddItems[7].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(4);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        removeFilterChipByIndex(0, filterUIRow);

        // open dropdown
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);
        // iterate over unary conditions
        // null
        ddItems[8].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(3);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        removeFilterChipByIndex(0, filterUIRow);

        // open dropdown
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);
        // not null
        ddItems[9].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(5);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);
        // changing from unary to not unary condition when input is empty - filtering should keep its state
        // contains
        ddItems[0].click();
        fix.detectChanges();
        tick();

        input = filterUIRow.query(By.directive(IgxInputDirective));
        expect(grid.rowList.length).toEqual(5);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        // input is empty but there is filtering applied, so reset button should be active !
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
    }));

    // UI tests string column with value in input
    it('UI tests on string column', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[1].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();

        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const input = filterUIRow.query(By.directive(IgxInputDirective));

        const reset = filterUIRow.queryAll(By.css('button'))[0];
        const close = filterUIRow.queryAll(By.css('button'))[1];

        expect(grid.rowList.length).toEqual(8);

        // open dropdown
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        const ddItems = ddList.nativeElement.children;

        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        // iterate over not unary conditions and fill the input
        // contains
        sendInput(input, 'Ignite', fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(2);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // starts with
        ddItems[2].click();
        fix.detectChanges();
        tick();

        sendInput(input, 'Net', fix);
        fix.detectChanges();
        tick();

        verifyFilterUIPosition(filterUIRow, grid);
        expect(grid.rowList.length).toEqual(1);
        expect(grid.getCellByColumn(0, 'ID').value).toEqual(2);
        expect(grid.getCellByColumn(0, 'ProductName').value).toMatch('NetAdvantage');
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);
        // ends with
        ddItems[3].click();
        fix.detectChanges();
        tick();

        sendInput(input, 'script', fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(2);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);
        // does not contain
        ddItems[1].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(6);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // use reset button
        reset.nativeElement.click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);
        // equals
        ddItems[4].click();
        fix.detectChanges();
        tick();

        sendInput(input, 'NetAdvantage', fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(1);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);
        // equals
        ddItems[4].click();
        fix.detectChanges();
        tick();

        sendInput(input, ' ', fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(0);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
        const emptyTemplate = fix.debugElement.query(By.css('span.igx-grid__tbody-message'));
        expect(emptyTemplate.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);
        // does not equal
        ddItems[5].click();
        fix.detectChanges();
        tick();

        sendInput(input, 'NetAdvantage', fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(7);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
    }));

    // UI tests number column
    it('UI tests on number column', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[2].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();

        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        let input = filterUIRow.query(By.directive(IgxInputDirective));

        const reset = filterUIRow.queryAll(By.css('button'))[0];
        const close = filterUIRow.queryAll(By.css('button'))[1];

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();

        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        const ddItems = ddList.nativeElement.children;

        verifyFilterUIPosition(filterUIRow, grid);

        // iterate over not unary conditions and fill the input
        // equals
        sendInput(input, 0, fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(1);
        expect(grid.getCellByColumn(0, 'Downloads').value).toEqual(0);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        let clear = filterUIRow.query(By.css('igx-suffix'));
        expect(clear.nativeElement.offsetHeight).toBeGreaterThan(0);

        // clear input value
        removeFilterChipByIndex(0, filterUIRow);
        fix.detectChanges();
        tick();

        // iterate over not unary conditions when input is empty
        // does not equal
        ddItems[1].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // greater than
        ddItems[2].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // iterate over unary conditions
        // null
        ddItems[6].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(1);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // not null
        ddItems[7].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(7);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // empty
        ddItems[8].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(1);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // not empty
        ddItems[9].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(7);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // changing from unary to not unary condition when input is empty - filtering should keep its state
        // equals - filter should keep its state and not be reset
        ddItems[0].click();
        fix.detectChanges();
        tick();

        input = filterUIRow.query(By.directive(IgxInputDirective));
        expect(grid.rowList.length).toEqual(7);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        // input is empty but there is filtering applied, so reset button should be active !
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // iterate over not unary conditions and fill the input
        // equals
        sendInput(input, 100, fix);
        fix.detectChanges();
        tick();

        clear = filterUIRow.query(By.css('igx-suffix'));
        expect(grid.rowList.length).toEqual(1);
        expect(grid.getCellByColumn(0, 'Downloads').value).toEqual(100);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(clear.nativeElement.offsetHeight).toBeGreaterThan(0);
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // does not equal
        ddItems[1].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(7);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // greater than
        ddItems[2].click();
        fix.detectChanges();
        tick();

        sendInput(input, 300, fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(2);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // use reset button
        reset.nativeElement.click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
        expect(filterIcon.componentInstance.iconName).toMatch('equals');

        // open dropdown
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);
        // less than
        ddItems[3].click();
        fix.detectChanges();
        tick();

        sendInput(input, 100, fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(3);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
        expect(filterIcon.componentInstance.iconName).toMatch('less_than');

        removeFilterChipByIndex(0, filterUIRow);
        clear.nativeElement.click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
        // revert to the default after
        expect(filterIcon.componentInstance.iconName).toMatch('equals');

        // greater than or equal to
        ddItems[4].click();
        fix.detectChanges();
        tick();

        sendInput(input, 254, fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(3);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // less than or equal to
        ddItems[5].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(6);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
    }));

    // UI tests boolean column
    it('UI tests on boolean column', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[3].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));

        const reset = filterUIRow.queryAll(By.css('button'))[0];
        const close = filterUIRow.queryAll(By.css('button'))[1];

        expect(grid.rowList.length).toEqual(8);

        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        const ddItems = ddList.nativeElement.children;

        verifyFilterUIPosition(filterUIRow, grid);

        // false condition
        ddItems[2].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(2);
        expect(grid.getCellByColumn(0, 'Released').value).toBeFalsy();
        expect(grid.getCellByColumn(1, 'Released').value).toBeFalsy();
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();

        // true condition
        ddItems[1].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(3);
        expect(grid.getCellByColumn(0, 'Released').value).toBe(true);
        expect(grid.getCellByColumn(1, 'Released').value).toBe(true);
        expect(grid.getCellByColumn(2, 'Released').value).toBe(true);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();

        // (all) condition
        ddItems[0].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();

        // empty condition
        ddItems[3].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(3);
        expect(grid.getCellByColumn(0, 'Released').value).toEqual(null);
        expect(grid.getCellByColumn(1, 'Released').value).toEqual(null);
        expect(grid.getCellByColumn(2, 'Released').value).toEqual(undefined);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();

        // not empty condition
        ddItems[4].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(5);
        expect(grid.getCellByColumn(0, 'Released').value).toBe(false);
        expect(grid.getCellByColumn(1, 'Released').value).toBe(true);
        expect(grid.getCellByColumn(2, 'Released').value).toBe(true);
        expect(grid.getCellByColumn(3, 'Released').value).toMatch('');
        expect(grid.getCellByColumn(4, 'Released').value).toBe(true);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();

        // null condition
        ddItems[5].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(2);
        expect(grid.getCellByColumn(0, 'Released').value).toEqual(null);
        expect(grid.getCellByColumn(1, 'Released').value).toEqual(null);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();

        // not null condition
        ddItems[6].click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(6);
        expect(grid.getCellByColumn(0, 'Released').value).toBe(false);
        expect(grid.getCellByColumn(1, 'Released').value).toBe(true);
        expect(grid.getCellByColumn(2, 'Released').value).toBe(true);
        expect(grid.getCellByColumn(3, 'Released').value).toMatch('');
        expect(grid.getCellByColumn(4, 'Released').value).toBe(true);
        expect(grid.getCellByColumn(5, 'Released').value).toBe(undefined);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
    }));

    // UI tests date column
    it('UI - should correctly filter date column by \'today\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        filterIcon.nativeElement.click();
        fix.detectChanges();

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        fix.detectChanges();
        verifyFilterUIPosition(filterUIRow, grid);

        selectFilteringCondition('Today', ddList);
        fix.detectChanges();

        // only one record is populated with 'today' date, this is why rows must be 1
        expect(grid.rowList.length).toEqual(1);
    });

    it('UI - should correctly filter date column by \'yesterday\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        filterIcon.nativeElement.click();
        fix.detectChanges();

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        fix.detectChanges();
        verifyFilterUIPosition(filterUIRow, grid);

        selectFilteringCondition('Yesterday', ddList);
        fix.detectChanges();

        // only one record is populated with (today - 1 day)  date, this is why rows must be 1
        expect(grid.rowList.length).toEqual(1);
    });

    it('UI - should correctly filter date column by \'this month\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        verifyFilterUIPosition(filterIcon, grid);
        selectFilteringCondition('This Month', ddList);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[5]);
    });

    it('UI - should correctly filter date column by \'next month\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        selectFilteringCondition('Next Month', ddList);

        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[1]);
    });

    it('UI - should correctly filter date column by \'last month\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        selectFilteringCondition('Last Month', ddList);

        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[0]);
    });

    it('UI - should correctly filter date column by \'empty\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        selectFilteringCondition('Empty', ddList);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(2);
    });

    it('UI - should correctly filter date column by \'notEmpty\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        selectFilteringCondition('Not Empty', ddList);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(6);
    });

    it('UI - should correctly filter date column by \'null\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        selectFilteringCondition('Null', ddList);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(1);
    });

    it('UI - should correctly filter date column by \'notNull\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        selectFilteringCondition('Not Null', ddList);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(7);
    });

    it('UI - should correctly filter date column by \'thisYear\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        selectFilteringCondition('This Year', ddList);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[2]);
    });

    it('UI - should correctly filter date column by \'lastYear\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        selectFilteringCondition('Last Year', ddList);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[4]);
    });

    it('UI - should correctly filter date column by \'nextYear\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        selectFilteringCondition('Next Year', ddList);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[3]);
    });

    it('UI - should correctly filter date column by \'equals\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const input = filterUIRow.query(By.directive(IgxInputDirective));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        verifyFilterUIPosition(filterIcon, grid);
        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        selectFilteringCondition('Equals', ddList);
        input.nativeElement.click();
        fix.detectChanges();
        tick();

        const calendar = fix.debugElement.query(By.css('igx-calendar'));
        const currentDay = calendar.query(By.css('span.igx-calendar__date--current'));
        currentDay.nativeElement.click();
        fix.detectChanges();
        tick();

        input.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(1);
    }));

    it('UI - should correctly filter date column by \'doesNotEqual\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const input = filterUIRow.query(By.directive(IgxInputDirective));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        tick(100);

        verifyFilterUIPosition(filterIcon, grid);
        fix.detectChanges();
        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        selectFilteringCondition('Does Not Equal', ddList);
        input.nativeElement.click();
        fix.detectChanges();
        tick();

        const calendar = fix.debugElement.query(By.css('igx-calendar'));
        const currentDay = calendar.query(By.css('span.igx-calendar__date--current'));
        currentDay.nativeElement.click();
        fix.detectChanges();
        tick();

        input.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(7);
    }));

    it('UI - should correctly filter date column by \'after\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const input = filterUIRow.query(By.directive(IgxInputDirective));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        verifyFilterUIPosition(filterIcon, grid);
        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        selectFilteringCondition('After', ddList);
        input.nativeElement.click();
        fix.detectChanges();
        tick();

        const calendar = fix.debugElement.query(By.css('igx-calendar'));
        const currentDay = calendar.query(By.css('span.igx-calendar__date--current'));
        currentDay.nativeElement.click();
        fix.detectChanges();
        tick();

        input.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(3);
    }));

    it('UI - should correctly filter date column by \'before\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const input = filterUIRow.query(By.directive(IgxInputDirective));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        verifyFilterUIPosition(filterIcon, grid);
        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        selectFilteringCondition('Before', ddList);
        input.nativeElement.click();
        fix.detectChanges();
        tick();

        const calendar = fix.debugElement.query(By.css('igx-calendar'));
        const currentDay = calendar.query(By.css('span.igx-calendar__date--current'));
        currentDay.nativeElement.click();
        fix.detectChanges();
        tick();

        input.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(2);
    }));

    it('Should correctly select month from month view datepicker/calendar component', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const input = filterUIRow.query(By.directive(IgxInputDirective));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        input.nativeElement.click();
        fix.detectChanges();
        tick();

        let calendar = fix.debugElement.query(By.css('igx-calendar'));
        const monthView = calendar.queryAll(By.css('.date__el'))[0];
        monthView.nativeElement.click();
        fix.detectChanges();
        tick();

        const firstMonth = calendar.queryAll(By.css('.igx-calendar__month'))[0];
        firstMonth.nativeElement.click();
        fix.detectChanges();
        tick();

        calendar = fix.debugElement.query(By.css('igx-calendar'));
        const month = calendar.queryAll(By.css('.date__el'))[0];

        expect(month.nativeElement.textContent.trim()).toEqual('Jan');
    }));

    it('Should correctly select year from year view datepicker/calendar component', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const input = filterUIRow.query(By.directive(IgxInputDirective));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        input.nativeElement.click();
        fix.detectChanges();
        tick();

        let calendar = fix.debugElement.query(By.css('igx-calendar'));
        const monthView = calendar.queryAll(By.css('.date__el'))[1];
        monthView.nativeElement.click();
        fix.detectChanges();
        tick();

        const firstMonth = calendar.queryAll(By.css('.igx-calendar__year'))[0];
        firstMonth.nativeElement.click();
        fix.detectChanges();
        tick();

        calendar = fix.debugElement.query(By.css('igx-calendar'));
        const month = calendar.queryAll(By.css('.date__el'))[1];

        const today = new Date(Date.now());

        const expectedResult = today.getFullYear() - 3;
        expect(month.nativeElement.textContent.trim()).toEqual(expectedResult.toString());
    }));

    // UI tests custom column
    it('UI tests on custom column', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[5].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const input = filterUIRow.query(By.directive(IgxInputDirective));

        const reset = filterUIRow.queryAll(By.css('button'))[0];
        const close = filterUIRow.queryAll(By.css('button'))[1];

        expect(grid.rowList.length).toEqual(8);

        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        sendInput(input, 'a', fix);
        fix.detectChanges();
        tick();

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        // false condition
        selectFilteringCondition('False', ddList);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(1);
        expect(grid.getCellByColumn(0, 'AnotherField').value).toMatch('custom');
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
    }));

    it('Should emit onFilteringDone when we clicked reset', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterVal = 'search';
        const columnName = 'ProductName';

        grid.filter(columnName, filterVal, IgxStringFilteringOperand.instance().condition('contains'));
        fix.detectChanges();

        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        const idCellChips = filteringCells[0].queryAll(By.css('.igx-filtering-chips'));
        expect(idCellChips.length).toBe(1);
        spyOn(grid.onFilteringDone, 'emit');

        idCellChips[0].nativeElement.click();
        fix.detectChanges();
        const filterUiRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const reset = filterUiRow.queryAll(By.css('button'))[0];
        const input = filterUiRow.query(By.directive(IgxInputDirective));
        sendInput(input, filterVal, fix);

        reset.nativeElement.dispatchEvent(new MouseEvent('click'));
        fix.detectChanges();

        expect(grid.onFilteringDone.emit).toHaveBeenCalledWith(null);
    });

    it('Clicking And/Or button shows second select and input for adding second condition', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const filterUIContainer = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[0];
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));
        const andButton = fix.debugElement.queryAll(By.directive(IgxButtonDirective))[0];

        UIInteractions.clickElement(filterIcon);
        tick(50);
        fix.detectChanges();

        UIInteractions.clickElement(andButton);
        tick(50);
        fix.detectChanges();

        const secondExpr = fix.debugElement.queryAll(By.css('igx-grid-filter-expression'))[1];
        expect(secondExpr.attributes['name']).toEqual('secondExpr');

        discardPeriodicTasks();
    }));

    it('Unselecting And/Or hides second condition UI and removes the second filter expression', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[0];
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));
        const andButton = fix.debugElement.queryAll(By.directive(IgxButtonDirective))[0];

        expect(grid.rowList.length).toEqual(8);

        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        verifyFilterUIPosition(filterUIContainer, grid);

        sendInput(input, 'I', fix);
        fix.detectChanges();
        tick();

        andButton.nativeElement.click();
        fix.detectChanges();
        tick();

        const input1 = filterUIContainer.queryAll(By.directive(IgxInputDirective))[1];
        sendInput(input1, 'g', fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(2);

        andButton.nativeElement.click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(3);
    }));

    it('Should emit onFilteringDone when clear the input of filteringUI', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const columnName = 'ProductName';
        const filterValue = 'search';
        grid.filter(columnName, filterValue, IgxStringFilteringOperand.instance().condition('contains'));
        fix.detectChanges();

        const filteringUIContainer = fix.debugElement.query(By.css(FILTER_UI_CONTAINER));
        const input = filteringUIContainer.query(By.directive(IgxInputDirective));
        sendInput(input, filterValue, fix);

        const inputGroup = filteringUIContainer.query(By.css('igx-input-group'));
        const clearSuffix = inputGroup.query(By.css('igx-suffix'));

        spyOn(grid.onFilteringDone, 'emit');

        clearSuffix.nativeElement.dispatchEvent(new MouseEvent('click'));
        fix.detectChanges();

        const columnFilteringExpressionsTree = grid.filteringExpressionsTree.find(columnName);
        expect(grid.onFilteringDone.emit).toHaveBeenCalledWith(columnFilteringExpressionsTree);
    });

    it('When filter column with value 0 and dataType number, filtering icon class indicator should be applied', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const gridheaders = fix.debugElement.queryAll(By.css('igx-grid-header'));
        const headerOfTypeNumber = gridheaders.find(gh => gh.nativeElement.classList.contains('igx-grid__th--number'));
        const filterUiContainer = headerOfTypeNumber.query(By.css(FILTER_UI_CONTAINER));
        const filterIcon = filterUiContainer.query(By.css('igx-icon'));
        const gridFilteringToggle = filterUiContainer.query(By.css('.igx-filtering__toggle'));
        const input = filterUiContainer.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick();
        fix.detectChanges();

        sendInput(input, 0, fix);
        fix.detectChanges();
        tick();
        fix.detectChanges();

        grid.nativeElement.click();
        fix.detectChanges();
        tick();
        fix.detectChanges();

        expect(gridFilteringToggle.nativeElement.classList.contains('igx-filtering__toggle--filtered')).toBeTruthy();
    }));

    it('Choose only second unary condition should filter the grid', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[0];
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));
        const andButton = fix.debugElement.queryAll(By.directive(IgxButtonDirective))[0];

        expect(grid.rowList.length).toEqual(8);

        UIInteractions.clickElement(filterIcon);
        tick(50);
        fix.detectChanges();

        verifyFilterUIPosition(filterUIContainer, grid);

        UIInteractions.clickElement(andButton);
        tick(50);
        fix.detectChanges();

        const input = filterUIContainer.queryAll(By.directive(IgxInputDirective))[1];
        sendInput(input, 'g', fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(3);
        andButton.nativeElement.click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);

        discardPeriodicTasks();
    }));

    it('Should display populated filter dialog without redrawing it', async () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        grid.width = '400px';
        grid.getColumnByName('ID').width = '50px';
        await wait();

        // filter the ProductName by two conditions
        const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
        const expression = {
            fieldName: 'ProductName',
            searchVal: 'Ignite',
            condition: IgxStringFilteringOperand.instance().condition('startsWith')
        };
        const expression1 = {
            fieldName: 'ProductName',
            searchVal: 'Angular',
            condition: IgxStringFilteringOperand.instance().condition('contains')
        };
        filteringExpressionsTree.filteringOperands.push(expression);
        filteringExpressionsTree.filteringOperands.push(expression1);
        grid.filter('ProductName', null, filteringExpressionsTree);

        fix.detectChanges();

        // scroll horizontally to the right, so ProductName column is out of view
        const horScroll = grid.parentVirtDir.getHorizontalScroll();
        horScroll.scrollLeft = 1000;
        await wait(100);
        fix.detectChanges();

        // scroll horizontally to the left, so ProductName is back in view
        horScroll.scrollLeft = 0;
        await wait(100);
        fix.detectChanges();

        // click filter icon
        const filterButton = fix.debugElement.queryAll(By.css('igx-grid-filter'))[0];
        const filterIcon = filterButton.query(By.css('igx-icon'));
        filterIcon.triggerEventHandler('mousedown', null);
        filterIcon.nativeElement.click();
        await wait(100);
        fix.detectChanges();

        // await fix.whenStable();

        const filterUI = fix.debugElement.query(By.css('.igx-filtering__options'));
        // verify 'And' button is selected
        const buttonGroup = filterUI.query(By.css('igx-buttongroup'));
        const buttons = buttonGroup.queryAll(By.css('.igx-button-group__item'));
        const andButton = buttons.filter((btn) => btn.nativeElement.textContent === 'And')[0];
        expect(andButton).not.toBeNull();
        expect(andButton).toBeDefined();
        expect(andButton.nativeElement.classList.contains('igx-button-group__item--selected'))
            .toBeTruthy('AndButton is not selected');

        // verify both filter expression components are present
        const filterExpressions = filterUI.queryAll(By.css('igx-grid-filter-expression'));
        expect(filterExpressions).not.toBeNull();
        expect(filterExpressions).toBeDefined();
        expect(filterExpressions.length).toBe(2, 'not all filter-expression components are visible');
    });

    it('Should correctly create FilteringExpressionsTree and populate filterUI.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
        const expression = {
            fieldName: 'ProductName',
            searchVal: 'Ignite',
            condition: IgxStringFilteringOperand.instance().condition('startsWith')
        };

        filteringExpressionsTree.filteringOperands.push(expression);
        grid.filteringExpressionsTree = filteringExpressionsTree;

        fix.detectChanges();

        expect(grid.rowList.length).toEqual(2);

        const filterUIContainer = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[0];
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));
        const select = filterUIContainer.query(By.css('select'));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        verifyFilterUIPosition(filterUIContainer, grid);

        expect(select.nativeElement.value).toMatch('startsWith');
        expect(input.nativeElement.value).toMatch('Ignite');
    }));
});

describe('IgxGrid - Filtering Row UI actions', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridFilteringComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxGridModule.forRoot()]
        })
            .compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    // TODO - add new tests based on the test plan in the spec.

    it('should render Filter chip for filterable columns and render empty cell for a column when filterable is set to false',
    fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();
        tick(100);
        const grid = fix.componentInstance.grid;
        grid.width = '1500px';
        fix.detectChanges();
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        const filteringChips = fix.debugElement.queryAll(By.css('.igx-filtering-chips'));
        expect(filteringCells.length).toBe(6);
        expect(filteringChips.length).toBe(5);

        let idCellChips = filteringCells[0].queryAll(By.css('.igx-filtering-chips'));
        expect(idCellChips.length).toBe(0);

        grid.getColumnByName('ID').filterable = true;
        fix.detectChanges();
        tick(100);

        idCellChips = filteringCells[0].queryAll(By.css('.igx-filtering-chips'));
        expect(idCellChips.length).toBe(1);
    }));

    it('should render correct input and dropdown in filter row for different column types', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        const stringCellChip = filteringCells[1].query(By.css('igx-chip'));
        const numberCellChip = filteringCells[2].query(By.css('igx-chip'));
        const boolCellChip = filteringCells[3].query(By.css('igx-chip'));
        const dateCellChip = filteringCells[4].query(By.css('igx-chip'));
        // open for string
        stringCellChip.nativeElement.click();
        fix.detectChanges();
        tick(200);

        checkUIForType('string', fix.debugElement);

        // close
        let filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        let close = filterUIRow.queryAll(By.css('button'))[1];
        close.nativeElement.click();
        fix.detectChanges();
        tick(200);

        // open for number
        numberCellChip.nativeElement.click();
        fix.detectChanges();
        tick(200);
        checkUIForType('number', fix.debugElement);

        // close
        filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        close = filterUIRow.queryAll(By.css('button'))[1];
        close.nativeElement.click();
        fix.detectChanges();
        tick(200);

        // open for date
        dateCellChip.nativeElement.click();
        fix.detectChanges();
        tick(200);
        checkUIForType('date', fix.debugElement);

        // close
        filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        close = filterUIRow.queryAll(By.css('button'))[1];
        close.nativeElement.click();
        fix.detectChanges();
        tick(200);

        // open for bool
        boolCellChip.nativeElement.click();
        fix.detectChanges();
        tick(200);
        checkUIForType('bool', fix.debugElement);
    }));

    it('should apply  multiple conditions to grid immediately while the filter row is still open',  () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        const stringCellChip = filteringCells[1].query(By.css('igx-chip'));
        const numberCellChip = filteringCells[2].query(By.css('igx-chip'));
        const boolCellChip = filteringCells[3].query(By.css('igx-chip'));
        const dateCellChip = filteringCells[4].query(By.css('igx-chip'));
        const grid = fix.componentInstance.grid;
        // open for string
        stringCellChip.nativeElement.click();
        fix.detectChanges();

        filterBy('Starts With', 'I', fix);
        expect(grid.rowList.length).toEqual(2);
        filterBy('Ends With', 'r', fix);
        expect(grid.rowList.length).toEqual(1);

        // Reset and Close
        resetFilterRow(fix);
        closeFilterRow(fix);

        // open for number
        numberCellChip.nativeElement.click();
        fix.detectChanges();

        filterBy('Less Than', '100', fix);
        expect(grid.rowList.length).toEqual(3);
        filterBy('Greater Than', '10', fix);
        expect(grid.rowList.length).toEqual(1);

        // Reset and Close
        resetFilterRow(fix);
        closeFilterRow(fix);
        // open for bool
        boolCellChip.nativeElement.click();
        fix.detectChanges();

        filterBy('False', '', fix);
        expect(grid.rowList.length).toEqual(2);
        filterBy('Empty', '', fix);
        expect(grid.rowList.length).toEqual(0);

        // Reset and Close
        resetFilterRow(fix);
        closeFilterRow(fix);

        // open for date
        dateCellChip.nativeElement.click();
        fix.detectChanges();
        filterBy('Today', '', fix);
        expect(grid.rowList.length).toEqual(1);
        filterBy('Null', '', fix);
        expect(grid.rowList.length).toEqual(0);
    });

    it('should render navigation arrows in the filtering row when chips don\'t fit.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        const stringCellChip = filteringCells[1].query(By.css('igx-chip'));

        // open for string
        stringCellChip.nativeElement.click();
        fix.detectChanges();

        for (let i = 0; i < 10; i++) {
            filterBy('Starts With', 'I', fix);
            tick(200);
        }
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const startArrow = filterUIRow.query(By.css('.igx-grid__filtering-row-scroll-start'));
        const endArrow = filterUIRow.query(By.css('.igx-grid__filtering-row-scroll-end'));

        expect(startArrow).not.toBe(null);
        expect(endArrow).not.toBe(null);
    }));

    it('should update UI when chip is removed from header cell.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();
        let filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        let stringCellChip = filteringCells[1].query(By.css('igx-chip'));
        const grid = fix.componentInstance.grid;
        // filter string col
        stringCellChip.nativeElement.click();
        fix.detectChanges();
        filterBy('Starts With', 'I', fix);
        expect(grid.rowList.length).toEqual(2);

        closeFilterRow(fix);

        filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        stringCellChip = filteringCells[1].query(By.css('igx-chip'));

        // remove chip
        const removeButton = stringCellChip.query(By.css('div.igx-chip__remove'));
        removeButton.nativeElement.click();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(8);

    }));
    it('should update UI when chip is removed from filter row.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        const stringCellChip = filteringCells[1].query(By.css('igx-chip'));
        const grid = fix.componentInstance.grid;
        // filter string col
        stringCellChip.nativeElement.click();
        fix.detectChanges();
        filterBy('Starts With', 'I', fix);
        expect(grid.rowList.length).toEqual(2);

        // remove from row
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        removeFilterChipByIndex(0, filterUIRow);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(8);
    }));

    it('should not render chip in header if condition that requires value is applied and then value is cleared in filter row.',
    fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();
        let filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        const stringCellChip = filteringCells[1].query(By.css('igx-chip'));
        const grid = fix.componentInstance.grid;
        // filter string col
        stringCellChip.nativeElement.click();
        fix.detectChanges();
        filterBy('Starts With', 'I', fix);
        // remote text from input
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const input = filterUIRow.query(By.directive(IgxInputDirective));
        input.nativeElement.value = null;
        const exprList = filterUIRow.componentInstance.expressionsList;
        exprList[0].expression.searchVal = null;
        fix.detectChanges();
        closeFilterRow(fix);

        // check no condition is applied
        expect(grid.rowList.length).toEqual(8);

        filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        const stringCellText = filteringCells[1].query(By.css('igx-chip')).query(By.css('.igx-chip__content'));
        expect(stringCellText.nativeElement.textContent).toBe('Filter');

    }));

});

export class CustomFilter extends IgxFilteringOperand {
    private static _instance: CustomFilter;

    private constructor () {
        super();
        this.operations = [{
            name: 'custom',
            isUnary: false,
            logic: (target: string): boolean => {
                return target === 'custom';
            },
            iconName: 'custom'
        }];
    }

    public static instance(): CustomFilter {
        return this._instance || (this._instance = new this());
    }
}


@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]="true">
        <igx-column [field]="'ID'" [header]="'ID'" [filterable]="false"></igx-column>
        <igx-column [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" dataType="number"></igx-column>
        <igx-column [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            dataType="date">
        </igx-column>
        <igx-column [field]="'AnotherField'" [header]="'Anogther Field'"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`
})
export class IgxGridFilteringComponent {

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
    public customFilter = CustomFilter;

    public data = [
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'day', 15),
            Released: false,
            AnotherField: 'a'
        },
        {
            Downloads: 127,
            ID: 2,
            ProductName: 'NetAdvantage',
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'month', -1),
            Released: true,
            AnotherField: 'a'
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: null,
            AnotherField: 'a'
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: null,
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'day', -1),
            Released: true,
            AnotherField: 'a'
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: '',
            ReleaseDate: undefined,
            Released: false,
            AnotherField: 'a'
        },
        {
            Downloads: 702,
            ID: 6,
            ProductName: 'Some other item with Script',
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'day', 1),
            Released: null,
            AnotherField: 'a'
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'month', 1),
            Released: true,
            AnotherField: 'a'
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: null,
            ReleaseDate: this.today,
            Released: undefined,
            AnotherField: 'custom'
        }
    ];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
}

const expectedResults = [];

function sendInput(element, text, fix) {
    element.nativeElement.value = text;
    element.nativeElement.dispatchEvent(new Event('input'));
    fix.detectChanges();
}

function verifyFilterUIPosition(filterUIContainer, grid) {
    const filterUiRightBorder = filterUIContainer.nativeElement.offsetParent.offsetLeft +
        filterUIContainer.nativeElement.offsetLeft + filterUIContainer.nativeElement.offsetWidth;
    expect(filterUiRightBorder).toBeLessThanOrEqual(grid.nativeElement.offsetWidth);
}

// Fill expected results for 'date' filtering conditions based on the current date
function fillExpectedResults(grid: IgxGridComponent, calendar: Calendar, today) {
    // day + 15
    const dateItem0 = generateICalendarDate(grid.data[0].ReleaseDate,
        today.getFullYear(), today.getMonth());
    // month - 1
    const dateItem1 = generateICalendarDate(grid.data[1].ReleaseDate,
        today.getFullYear(), today.getMonth());
    // day - 1
    const dateItem3 = generateICalendarDate(grid.data[3].ReleaseDate,
        today.getFullYear(), today.getMonth());
    // day + 1
    const dateItem5 = generateICalendarDate(grid.data[5].ReleaseDate,
        today.getFullYear(), today.getMonth());
    // month + 1
    const dateItem6 = generateICalendarDate(grid.data[6].ReleaseDate,
        today.getFullYear(), today.getMonth());

    let thisMonthCountItems = 1;
    let nextMonthCountItems = 1;
    let lastMonthCountItems = 1;
    let thisYearCountItems = 6;
    let nextYearCountItems = 0;
    let lastYearCountItems = 0;

    // LastMonth filter
    if (dateItem3.isPrevMonth) {
        lastMonthCountItems++;
    }
    expectedResults[0] = lastMonthCountItems;

    // thisMonth filter
    if (dateItem0.isCurrentMonth) {
        thisMonthCountItems++;
    }

    if (dateItem3.isCurrentMonth) {
        thisMonthCountItems++;
    }

    if (dateItem5.isCurrentMonth) {
        thisMonthCountItems++;
    }

    // NextMonth filter
    if (dateItem0.isNextMonth) {
        nextMonthCountItems++;
    }

    if (dateItem5.isNextMonth) {
        nextMonthCountItems++;
    }
    expectedResults[1] = nextMonthCountItems;

    // ThisYear, NextYear, PreviousYear filter

    // day + 15
    if (!dateItem0.isThisYear) {
        thisYearCountItems--;
    } else if (dateItem0.isNextYear) {
        nextYearCountItems++;
    }

    // month - 1
    if (!dateItem1.isThisYear) {
        thisYearCountItems--;
    }

    if (dateItem1.isLastYear) {
        lastYearCountItems++;
    }

    // day - 1
    if (!dateItem3.isThisYear) {
        thisYearCountItems--;
    }

    if (dateItem3.isLastYear) {
        lastYearCountItems++;
    }

    // day + 1
    if (!dateItem5.isThisYear) {
        thisYearCountItems--;
    }

    if (dateItem5.isNextYear) {
        nextYearCountItems++;
    }

    // month + 1
    if (!dateItem6.isThisYear) {
        thisYearCountItems--;
    }

    if (dateItem6.isNextYear) {
        nextYearCountItems++;
    }

    // ThisYear filter result
    expectedResults[2] = thisYearCountItems;

    // NextYear filter result
    expectedResults[3] = nextYearCountItems;

    // PreviousYear filter result
    expectedResults[4] = lastYearCountItems;

    // ThisMonth filter result
    expectedResults[5] = thisMonthCountItems;
}

function generateICalendarDate(date: Date, year: number, month: number) {
    return {
        date,
        isCurrentMonth: date.getFullYear() === year && date.getMonth() === month,
        isLastYear: isLastYear(date, year),
        isNextMonth: isNextMonth(date, year, month),
        isNextYear: isNextYear(date, year),
        isPrevMonth: isPreviousMonth(date, year, month),
        isThisYear: isThisYear(date, year)
    };
}

function isPreviousMonth(date: Date, year: number, month: number): boolean {
    if (date.getFullYear() === year) {
        return date.getMonth() < month;
    }
    return date.getFullYear() < year;
}

function isNextMonth(date: Date, year: number, month: number): boolean {
    if (date.getFullYear() === year) {
        return date.getMonth() > month;
    }
    return date.getFullYear() > year;
}

function isThisYear(date: Date, year: number): boolean {
    return date.getFullYear() === year;
}

function isLastYear(date: Date, year: number): boolean {
    return date.getFullYear() < year;
}

function isNextYear(date: Date, year: number): boolean {
    return date.getFullYear() > year;
}

function removeFilterChipByIndex(index: number, filterUIRow) {
    const filterChip = filterUIRow.queryAll(By.css('igx-chip'))[index];
    const removeButton = filterChip.query(By.css('div.igx-chip__remove'));
    removeButton.nativeElement.click();
}

function selectFilteringCondition(cond: string, ddList) {
    const ddItems = ddList.nativeElement.children;
    let i;
    for ( i = 0; i < ddItems.length; i++) {
        if (ddItems[i].textContent === cond) {
            ddItems[i].click();
            return;
        }
    }
}

function checkUIForType(type: string, elem: DebugElement) {
    let expectedConditions;
    let expectedInputType;
    const isReadOnly = type === 'bool' ?  true : false;
    switch (type) {
        case 'string':
            expectedConditions = IgxStringFilteringOperand.instance().operations;
            expectedInputType = 'text';
            break;
        case 'number':
            expectedConditions = IgxNumberFilteringOperand.instance().operations;
            expectedInputType = 'number';
            break;
        case 'date':
            expectedConditions = IgxDateFilteringOperand.instance().operations;
            expectedInputType = 'datePicker';
            break;
        case 'bool':
            expectedConditions = IgxBooleanFilteringOperand.instance().operations;
            expectedInputType = 'text';
        break;
    }
    openFilterDD(elem);
    const ddList = elem.query(By.css('div.igx-drop-down__list.igx-toggle'));
    const ddItems = ddList.nativeElement.children;
    // check drop-down conditions
    for (let i = 0; i < expectedConditions.length; i++) {
        const txt = expectedConditions[i].name.split(/(?=[A-Z])/).join(' ').toLowerCase();
        expect(txt).toEqual(ddItems[i].textContent.toLowerCase());
    }
    // check input is correct type
    const filterUIRow = elem.query(By.css(FILTER_UI_ROW));
    if (expectedInputType !== 'datePicker') {
        const input = filterUIRow.query(By.css('.igx-input-group__input'));
        expect(input.nativeElement.type).toBe(expectedInputType);
        expect(input.nativeElement.attributes.hasOwnProperty('readonly')).toBe(isReadOnly);
    } else {
        const datePicker = filterUIRow.query(By.directive(IgxDatePickerComponent));
        expect(datePicker).not.toBe(null);
    }
}

function filterBy(condition: string, value: string, fix: ComponentFixture<any>) {
    const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
    // open dropdown
    openFilterDD(fix.debugElement);

    const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
    selectFilteringCondition(condition, ddList);
    const input = filterUIRow.query(By.directive(IgxInputDirective));
    sendInput(input, value, fix);
    // Enter key to submit
    const kbEvt = document.createEvent('Event');
    kbEvt['keyCode'] = 13;
    kbEvt.initEvent('keydown', false, true);
    input.nativeElement.dispatchEvent(kbEvt);
}

function resetFilterRow(fix: ComponentFixture<any> ) {
    const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
    const editingBtns = filterUIRow.query(By.css('.igx-grid__filtering-row-editing-buttons'));
    const reset = editingBtns.queryAll(By.css('button'))[0];
    reset.nativeElement.click();
    fix.detectChanges();
}

function closeFilterRow(fix: ComponentFixture<any>) {
    const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
    const editingBtns = filterUIRow.query(By.css('.igx-grid__filtering-row-editing-buttons'));
    const close = editingBtns.queryAll(By.css('button'))[1];
    close.nativeElement.click();
    fix.detectChanges();
}

function openFilterDD(elem: DebugElement) {
    const filterUIRow = elem.query(By.css(FILTER_UI_ROW));
    const filterIcon = filterUIRow.query(By.css('igx-icon'));
    filterIcon.nativeElement.click();
}
