import { Component, ViewChild, TemplateRef } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { ISortingExpression, SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxColumnComponent } from '../columns/column.component';
import { IgxGridComponent } from './grid.component';
import { IgxGroupAreaDropDirective } from './grid.directives';
import { IgxColumnMovingDragDirective } from '../moving/moving.drag.directive';
import { IgxGridModule } from './public_api';
import { IgxGridRowComponent } from './grid-row.component';
import { IgxChipComponent, IChipClickEventArgs } from '../../chips/chip.component';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { DataParent } from '../../test-utils/sample-test-data.spec';
import { MultiColumnHeadersWithGroupingComponent } from '../../test-utils/grid-samples.spec';
import { GridSelectionFunctions, GridFunctions } from '../../test-utils/grid-functions.spec';
import { GridSelectionMode } from '../common/enums';
import { ControlsFunction } from '../../test-utils/controls-functions.spec';
import { RowType } from '../common/row.interface';

describe('IgxGrid - GroupBy #grid', () => {

    const COLUMN_HEADER_CLASS = '.igx-grid__th';
    const COLUMN_HEADER_GROUP_CLASS = '.igx-grid__thead-item';
    const SORTING_ICON_ASC_CONTENT = 'arrow_upward';
    const SORTING_ICON_DESC_CONTENT = 'arrow_downward';
    const DISABLED_CHIP = 'igx-chip--disabled';
    const CHIP = 'igx-chip';

    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultGridComponent,
                GroupableGridComponent,
                CustomTemplateGridComponent,
                GroupByDataMoreColumnsComponent,
                GroupByEmptyColumnFieldComponent,
                MultiColumnHeadersWithGroupingComponent,
                GridGroupByRowCustomSelectorsComponent
            ],
            imports: [NoopAnimationsModule, IgxGridModule]
        });
    }));

    const checkGroups = (groupRows, expectedGroupOrder, grExpr?) => {
        // verify group rows are sorted correctly, their indexes in the grid are correct and their group records match the group value.
        let count = 0;
        const maxLevel = grExpr ? grExpr.length - 1 : 0;
        for (const groupRow of groupRows) {
            const recs = groupRow.groupRow.records;
            const val = groupRow.groupRow.value;
            const index = groupRow.index;
            const field = groupRow.groupRow.expression.fieldName;
            const level = groupRow.groupRow.level;
            expect(level).toEqual(grExpr ? grExpr.indexOf(groupRow.groupRow.expression) : 0);
            expect(index).toEqual(count);
            count++;
            expect(val).toEqual(expectedGroupOrder[groupRows.indexOf(groupRow)]);
            for (const rec of recs) {
                if (level === maxLevel) {
                    count++;
                }
                expect(rec[field]).toEqual(val);
            }
        }
    };

    const checkChips = (chips, grExpr, sortExpr) => {
        for (let i = 0; i < chips.length; i++) {
            const chip = chips[i].querySelector('div.igx-chip__content').innerText;
            const chipDirection = chips[i].querySelector('[igxsuffix]').innerText;
            const grp = grExpr[i];
            const s = sortExpr[i];
            expect(chip).toBe(grp.fieldName);
            expect(chip).toBe(s.fieldName);
            if (chipDirection === SORTING_ICON_ASC_CONTENT) {
                expect(grp.dir).toBe(SortingDirection.Asc);
                expect(s.dir).toBe(SortingDirection.Asc);
            } else {
                expect(grp.dir).toBe(SortingDirection.Desc);
                expect(s.dir).toBe(SortingDirection.Desc);
            }
        }
    };

    it('should allow grouping by different data types.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        // group by string column
        const grid = fix.componentInstance.instance;
        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();

        // verify grouping expressions
        const grExprs = grid.groupingExpressions;
        expect(grExprs.length).toEqual(1);
        expect(grExprs[0].fieldName).toEqual('ProductName');

        // verify rows
        let groupRows = grid.groupsRowList.toArray();
        let dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(5);
        expect(dataRows.length).toEqual(8);

        checkGroups(groupRows, ['NetAdvantage', 'Ignite UI for JavaScript', 'Ignite UI for Angular', '', null]);
        // ungroup
        grid.clearGrouping('ProductName');
        tick();

        fix.detectChanges();

        // verify no groups are present
        expect(grid.groupsRowList.toArray().length).toEqual(0);

        // group by number
        grid.groupBy({
            fieldName: 'Downloads', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();

        groupRows = grid.groupsRowList.toArray();
        dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(6);
        expect(dataRows.length).toEqual(8);

        checkGroups(groupRows, [1000, 254, 100, 20, 0, null]);

        // ungroup and group by boolean column
        grid.clearGrouping('Downloads');
        tick();
        fix.detectChanges();
        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();

        groupRows = grid.groupsRowList.toArray();
        dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(3);
        expect(dataRows.length).toEqual(8);

        checkGroups(groupRows, [true, false, null]);

        // ungroup and group by date column
        grid.clearGrouping('Released');
        tick();
        fix.detectChanges();
        grid.groupBy({
            fieldName: 'ReleaseDate', dir: SortingDirection.Asc, ignoreCase: false
        });
        fix.detectChanges();

        groupRows = grid.groupsRowList.toArray();
        dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(4);
        expect(dataRows.length).toEqual(8);

        const expectedValue1 = groupRows[1].nativeElement.nextElementSibling.querySelectorAll('igx-grid-cell')[3].textContent;
        const actualValue1 = groupRows[1].element.nativeElement.querySelector('.igx-group-label__text').textContent;
        const expectedValue2 = groupRows[2].nativeElement.nextElementSibling.querySelectorAll('igx-grid-cell')[3].textContent;
        const actualValue2 = groupRows[2].element.nativeElement.querySelector('.igx-group-label__text').textContent;
        const expectedValue3 = groupRows[3].nativeElement.nextElementSibling.querySelectorAll('igx-grid-cell')[3].textContent;
        const actualValue3 = groupRows[3].element.nativeElement.querySelector('.igx-group-label__text').textContent;

        expect(actualValue1).toEqual(expectedValue1);
        expect(actualValue2).toEqual(expectedValue2);
        expect(actualValue3).toEqual(expectedValue3);

        checkGroups(
            groupRows,
            [null, fix.componentInstance.prevDay, fix.componentInstance.today, fix.componentInstance.nextDay]);
    }));

    it('should allow grouping by multiple columns.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();
        fix.componentInstance.height = null;
        tick();
        fix.detectChanges();

        // group by 2 columns
        const grid = fix.componentInstance.instance;
        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();

        let groupRows = grid.groupsRowList.toArray();
        let dataRows = grid.dataRowList.toArray();

        // verify groups and data rows count
        expect(groupRows.length).toEqual(13);
        expect(dataRows.length).toEqual(8);
        // verify groups
        checkGroups(groupRows,
            ['NetAdvantage', true, false, 'Ignite UI for JavaScript', true,
                false, 'Ignite UI for Angular', false, null, '', true, null, true],
            grid.groupingExpressions);

        // group by 3rd column

        grid.groupBy({
            fieldName: 'Downloads', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();

        groupRows = grid.groupsRowList.toArray();
        dataRows = grid.dataRowList.toArray();

        // verify groups and data rows count
        expect(groupRows.length).toEqual(21);
        expect(dataRows.length).toEqual(8);
        // verify groups
        checkGroups(groupRows,
            ['NetAdvantage', true, 1000, false, 1000, 'Ignite UI for JavaScript', true, null, false, 254, 'Ignite UI for Angular',
                false, 20, null, 1000, '', true, 100, null, true, 0],
            grid.groupingExpressions);
    }));

    it('should allow grouping with a custom comparer', fakeAsync(/** height/width setter rAF */() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();
        fix.componentInstance.data[0].ReleaseDate = new Date(2017, 1, 1, 15, 30, 0, 0);
        fix.componentInstance.data[1].ReleaseDate = new Date(2017, 1, 1, 20, 30, 0, 0);
        fix.componentInstance.height = null;
        const grid = fix.componentInstance.instance;
        fix.detectChanges();
        grid.groupBy({
            fieldName: 'ReleaseDate',
            dir: SortingDirection.Desc,
            groupingComparer: (a: Date, b: Date) => {
                if (a instanceof Date && b instanceof Date &&
                    a.getFullYear() === b.getFullYear() &&
                    a.getMonth() === b.getMonth() &&
                    a.getDate() === b.getDate()) {
                    return 0;
                }
                return DefaultSortingStrategy.instance().compareValues(a, b);
            }
        });
        fix.detectChanges();
        let groupRows = grid.groupsRowList.toArray();
        // verify groups count
        expect(groupRows.length).toEqual(5);
        // now click the chip to change sorting, the grouping expression should hold
        // the comparer and reapply the same grouping again
        let chips = fix.nativeElement.querySelectorAll('igx-chip');
        // click grouping direction arrow
        const event: IChipClickEventArgs = { owner: chips[0], cancel: false, originalEvent: null };
        grid.onChipClicked(event);
        fix.detectChanges();
        chips = fix.nativeElement.querySelectorAll('igx-chip');
        expect(chips.length).toBe(1);
        checkChips(chips, grid.groupingExpressions, grid.sortingExpressions);
        expect(chips[0].querySelectorAll('igx-icon')[1].innerText.trim()).toBe('arrow_upward');
        groupRows = grid.groupsRowList.toArray();
        expect(groupRows.length).toEqual(5);
    }));

    it('should allows expanding/collapsing groups.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        grid.primaryKey = 'ID';
        fix.detectChanges();
        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();

        let groupRows = grid.groupsRowList.toArray();
        let dataRows = grid.dataRowList.toArray();
        // verify groups and data rows count
        expect(groupRows.length).toEqual(3);
        expect(dataRows.length).toEqual(8);

        // toggle grouprow - collapse
        expect(groupRows[0].expanded).toEqual(true);
        grid.toggleGroup(groupRows[0].groupRow);
        tick();
        fix.detectChanges();
        expect(groupRows[0].expanded).toEqual(false);
        groupRows = grid.groupsRowList.toArray();
        dataRows = grid.dataRowList.toArray();
        expect(groupRows.length).toEqual(3);
        expect(dataRows.length).toEqual(4);
        // verify collapsed group sub records are not rendered

        //  behavioral change! row should not be returned, as its parent is collapsed
        for (const rec of groupRows[0].groupRow.records) {
            expect(grid.getRowByKey(rec.ID)).toBeUndefined();
        }

        // toggle grouprow - expand
        grid.toggleGroup(groupRows[0].groupRow);
        tick();
        fix.detectChanges();
        expect(groupRows[0].expanded).toEqual(true);

        for (const rec of groupRows[0].groupRow.records) {
            expect(grid.getRowByKey(rec.ID)).not.toBeUndefined();
        }

        groupRows = grid.groupsRowList.toArray();
        dataRows = grid.dataRowList.toArray();
        expect(groupRows.length).toEqual(3);
        expect(dataRows.length).toEqual(8);

        // verify expanded group sub records are rendered
        for (const rec of groupRows[0].groupRow.records) {
            expect(grid.getRowByKey(rec.ID)).not.toBeUndefined();
        }

        const groupRow = grid.getRowByIndex(0);
        expect(groupRow.isGroupByRow).toBe(true);
        expect(groupRow.expanded).toBe(true);
        groupRow.expanded = false;
        tick();
        fix.detectChanges();
        expect(groupRow.expanded).toBe(false);
    }));

    it('should allow changing the order of the groupBy columns.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        // set groupingExpressions
        const grid = fix.componentInstance.instance;
        const exprs: ISortingExpression[] = [
            { fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: true },
            { fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: true }
        ];
        grid.groupingExpressions = exprs;
        tick();
        fix.detectChanges();

        let groupRows = grid.groupsRowList.toArray();
        let dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(13);
        expect(dataRows.length).toEqual(8);
        // verify groups
        checkGroups(groupRows,
            ['NetAdvantage', true, false, 'Ignite UI for JavaScript', true,
                false, 'Ignite UI for Angular', false, null, '', true, null, true],
            grid.groupingExpressions);

        // change order
        grid.groupingExpressions = [
            { fieldName: 'Released', dir: SortingDirection.Asc, ignoreCase: true },
            { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: true }
        ];
        tick();
        grid.sortingExpressions = [
            { fieldName: 'Released', dir: SortingDirection.Asc, ignoreCase: true },
            { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: true }
        ];
        tick();
        fix.detectChanges();

        groupRows = grid.groupsRowList.toArray();
        dataRows = grid.dataRowList.toArray();
        expect(groupRows.length).toEqual(11);
        expect(dataRows.length).toEqual(8);
        // verify groups
        checkGroups(groupRows,
            [null, 'Ignite UI for Angular', false, 'Ignite UI for Angular', 'Ignite UI for JavaScript',
                'NetAdvantage', true, null, '', 'Ignite UI for JavaScript', 'NetAdvantage'],
            grid.groupingExpressions);
    }));

    it('should allow setting expand/collapse state', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        grid.primaryKey = 'ID';
        fix.detectChanges();

        grid.groupsExpanded = false;
        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();

        let groupRows = grid.groupsRowList.toArray();
        let dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(3);
        expect(dataRows.length).toEqual(0);

        for (const grRow of groupRows) {
            expect(grRow.expanded).toBe(false);
        }

        grid.groupsExpanded = true;
        tick();
        grid.cdr.detectChanges();

        groupRows = grid.groupsRowList.toArray();
        dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(3);
        expect(dataRows.length).toEqual(8);

        for (const grRow of groupRows) {
            expect(grRow.expanded).toBe(true);
        }
    }));

    it('should trigger an onGroupingDone event when a column is grouped with the correct params.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        grid.primaryKey = 'ID';
        fix.detectChanges();

        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();

        const currExpr = fix.componentInstance.currentSortExpressions;
        expect(currExpr.expressions.length).toEqual(1);
        expect(currExpr.expressions[0].fieldName).toEqual('Released');
        expect(currExpr.groupedColumns.length).toEqual(1);
        expect(currExpr.groupedColumns[0].field).toEqual('Released');
        expect(currExpr.ungroupedColumns.length).toEqual(0);
    }));

    it('should trigger an onGroupingDone event when a column is ungrouped with the correct params.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        grid.primaryKey = 'ID';
        fix.detectChanges();

        grid.groupBy([
            { fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false },
            { fieldName: 'ReleaseDate', dir: SortingDirection.Desc, ignoreCase: false }
        ]);
        tick();
        fix.detectChanges();
        grid.clearGrouping('Released');
        tick();
        fix.detectChanges();
        const currExpr = fix.componentInstance.currentSortExpressions;
        expect(currExpr.expressions.length).toEqual(1);
        expect(currExpr.expressions[0].fieldName).toEqual('ReleaseDate');
        expect(currExpr.groupedColumns.length).toEqual(0);
        expect(currExpr.ungroupedColumns.length).toEqual(1);
        expect(currExpr.ungroupedColumns[0].field).toEqual('Released');
    }));

    it('should trigger an onGroupingDone event when multiple columns are grouped with the correct params.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        grid.primaryKey = 'ID';
        fix.detectChanges();
        grid.groupBy([
            { fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false },
            { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false },
            { fieldName: 'ReleaseDate', dir: SortingDirection.Desc, ignoreCase: false }
        ]);
        tick();
        fix.detectChanges();
        const currExpr = fix.componentInstance.currentSortExpressions;
        expect(currExpr.expressions.length).toEqual(3);
        expect(currExpr.expressions[0].fieldName).toEqual('Released');
        expect(currExpr.expressions[1].fieldName).toEqual('ProductName');
        expect(currExpr.expressions[2].fieldName).toEqual('ReleaseDate');
        expect(currExpr.groupedColumns.length).toEqual(3);
        expect(currExpr.groupedColumns[0].field).toEqual('Released');
        expect(currExpr.groupedColumns[1].field).toEqual('ProductName');
        expect(currExpr.groupedColumns[2].field).toEqual('ReleaseDate');
        expect(currExpr.ungroupedColumns.length).toEqual(0);
    }));

    it('should trigger an onGroupingDone event when multiple columns are ungrouped with the correct params.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        grid.primaryKey = 'ID';
        fix.detectChanges();
        grid.groupBy([
            { fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false },
            { fieldName: 'ReleaseDate', dir: SortingDirection.Desc, ignoreCase: false },
            { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false },
            { fieldName: 'Downloads', dir: SortingDirection.Asc, ignoreCase: false }
        ]);
        tick();
        fix.detectChanges();
        grid.clearGrouping(['Released', 'ProductName', 'Downloads']);
        tick();
        fix.detectChanges();
        const currExpr = fix.componentInstance.currentSortExpressions;
        expect(currExpr.expressions.length).toEqual(1);
        expect(currExpr.expressions[0].fieldName).toEqual('ReleaseDate');
        expect(currExpr.groupedColumns.length).toEqual(0);
        expect(currExpr.ungroupedColumns.length).toEqual(3);
        expect(currExpr.ungroupedColumns[0].field).toEqual('Released');
        expect(currExpr.ungroupedColumns[1].field).toEqual('ProductName');
        expect(currExpr.ungroupedColumns[2].field).toEqual('Downloads');
    }));

    it(`should trigger an onGroupingDone event when the user pushes a new array of grouping expressions, which results in
    both grouping and ungrouping at the same time.`, fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        grid.primaryKey = 'ID';
        fix.detectChanges();
        grid.groupBy([
            { fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false },
            { fieldName: 'ReleaseDate', dir: SortingDirection.Desc, ignoreCase: false },
            { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false }
        ]);
        tick();
        fix.detectChanges();
        const newExpressions = [
            { fieldName: 'ReleaseDate', dir: SortingDirection.Desc, ignoreCase: false },
            { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false },
            { fieldName: 'Downloads', dir: SortingDirection.Asc, ignoreCase: false }
        ];
        grid.groupingExpressions = newExpressions;
        tick();
        fix.detectChanges();
        const currExpr = fix.componentInstance.currentSortExpressions;
        expect(currExpr.expressions.length).toEqual(3);
        expect(currExpr.expressions[0].fieldName).toEqual('ReleaseDate');
        expect(currExpr.expressions[1].fieldName).toEqual('ProductName');
        expect(currExpr.expressions[2].fieldName).toEqual('Downloads');
        expect(currExpr.ungroupedColumns.length).toEqual(1);
        expect(currExpr.ungroupedColumns[0].field).toEqual('Released');
        expect(currExpr.groupedColumns.length).toEqual(1);
        expect(currExpr.groupedColumns[0].field).toEqual('Downloads');
    }));

    it('should allow setting custom template for group row content and expand/collapse icons.', fakeAsync(() => {
        const fix = TestBed.createComponent(CustomTemplateGridComponent);
        const grid = fix.componentInstance.instance;
        fix.detectChanges();

        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();

        const groupRows = grid.groupsRowList.toArray();

        for (const grRow of groupRows) {
            const elem = grRow.groupContent.nativeElement;
            const grVal = grRow.groupRow.value === null ? '' : grRow.groupRow.value.toString();
            const expectedText = 'Grouping by "Is it Released". ' +
                'Total items with value:' + grVal +
                ' are ' + grRow.groupRow.records.length;
            expect(elem.innerText.trim(['\n', '\r', ' '])).toEqual(expectedText);
            const expander = grRow.nativeElement.querySelector('.igx-grid__grouping-indicator');
            expect(expander.innerText).toBe('EXPANDED');
        }

        groupRows[0].toggle();
        const expndr = groupRows[0].nativeElement.querySelector('.igx-grid__grouping-indicator');
        expect(expndr.innerText).toBe('COLLAPSED');

        expect(grid.headerGroupContainer.nativeElement.innerText).toBe('EXPANDED');
        grid.toggleAllGroupRows();
        fix.detectChanges();
        expect(grid.headerGroupContainer.nativeElement.innerText).toBe('COLLAPSED');

    }));

    it('should have the correct ARIA attributes on the group rows.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        grid.primaryKey = 'ID';
        fix.detectChanges();

        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();

        const groupRows = grid.groupsRowList.toArray();
        for (const grRow of groupRows) {
            const elem = grRow.element.nativeElement;
            expect(elem.attributes['aria-describedby'].value).toEqual(grid.id + '_Released');
            expect(elem.attributes['aria-expanded'].value).toEqual('true');
        }
    }));

    it('should not apply grouping if the grouping expressions value is the same reference', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        // group by string column
        const grid = fix.componentInstance.instance;
        fix.detectChanges();
        grid.groupBy({
            fieldName: 'ReleaseDate', dir: SortingDirection.Asc, ignoreCase: false
        });
        fix.detectChanges();
        spyOn(grid.groupingExpressionsChange, 'emit');
        fix.detectChanges();
        const firstCell = grid.getCellByColumn(2, 'Downloads');
        UIInteractions.simulateClickAndSelectEvent(firstCell);
        fix.detectChanges();
        expect(grid.groupingExpressionsChange.emit).toHaveBeenCalledTimes(0);
    }));

    // GroupBy + Sorting integration
    it('should apply sorting on each group\'s records when non-grouped column is sorted.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.enableSorting = true;
        tick();
        fix.detectChanges();
        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();
        const groupRows = grid.groupsRowList.toArray();
        const dataRows = grid.dataRowList.toArray();
        // verify groups and data rows count
        expect(groupRows.length).toEqual(5);
        expect(dataRows.length).toEqual(8);

        grid.sort({ fieldName: 'Released', dir: SortingDirection.Asc, ignoreCase: false });
        fix.detectChanges();

        // verify groups
        checkGroups(groupRows, ['NetAdvantage', 'Ignite UI for JavaScript', 'Ignite UI for Angular', '', null]);

        // verify data records order
        const expectedDataRecsOrder = [false, true, false, true, null, false, true, true];
        dataRows.forEach((row, index) => {
            expect(row.rowData.Released).toEqual(expectedDataRecsOrder[index]);
        });

    }));

    it('should apply the specified sort order on the group rows when already grouped columnn is sorted in asc/desc order.',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.enableSorting = true;
            fix.detectChanges();
            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            fix.detectChanges();

            let groupRows = grid.groupsRowList.toArray();
            let dataRows = grid.dataRowList.toArray();

            // verify groups and data rows count
            expect(groupRows.length).toEqual(5);
            expect(dataRows.length).toEqual(8);

            // verify group order
            checkGroups(groupRows, ['NetAdvantage', 'Ignite UI for JavaScript', 'Ignite UI for Angular', '', null]);
            grid.sort({
                fieldName: 'ProductName',
                dir: SortingDirection.Asc,
                ignoreCase: false
            });
            fix.detectChanges();

            groupRows = grid.groupsRowList.toArray();
            dataRows = grid.dataRowList.toArray();

            // verify group order
            checkGroups(groupRows, [null, '', 'Ignite UI for Angular', 'Ignite UI for JavaScript', 'NetAdvantage']);

        }));

    it('should remove grouping when already grouped columnn is sorted with order "None" via the API.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.enableSorting = true;
        fix.detectChanges();
        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();

        let groupRows = grid.groupsRowList.toArray();
        let dataRows = grid.dataRowList.toArray();

        // verify groups and data rows count
        expect(groupRows.length).toEqual(5);
        expect(dataRows.length).toEqual(8);

        // verify group order
        checkGroups(groupRows, ['NetAdvantage', 'Ignite UI for JavaScript', 'Ignite UI for Angular', '', null]);
        grid.sort({ fieldName: 'ProductName', dir: SortingDirection.None, ignoreCase: false });
        fix.detectChanges();
        groupRows = grid.groupsRowList.toArray();
        dataRows = grid.dataRowList.toArray();

        // verify groups and data rows count
        expect(groupRows.length).toEqual(0);
        expect(dataRows.length).toEqual(8);

    }));

    it('should disallow setting sorting state None to grouped column when sorting via the UI.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.enableSorting = true;
        fix.detectChanges();
        grid.groupBy({
            fieldName: 'Downloads', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();

        const headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
        // click header sort icon
        GridFunctions.clickHeaderSortIcon(headers[0]);
        tick();
        fix.detectChanges();

        const sortingIcon = fix.debugElement.query(By.css('.sort-icon'));
        expect(sortingIcon.nativeElement.textContent.trim()).toEqual(SORTING_ICON_ASC_CONTENT);

        // click header sort icon again
        GridFunctions.clickHeaderSortIcon(headers[0]);
        tick();
        fix.detectChanges();

        expect(sortingIcon.nativeElement.textContent.trim()).toEqual(SORTING_ICON_DESC_CONTENT);

        // click header sort icon again
        GridFunctions.clickHeaderSortIcon(headers[0]);
        tick();
        fix.detectChanges();
        expect(sortingIcon.nativeElement.textContent.trim()).toEqual(SORTING_ICON_ASC_CONTENT);

    }));

    it('should group by the specified field when grouping by an already sorted field.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.enableSorting = true;
        fix.detectChanges();
        grid.sort({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();

        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false
        });
        fix.detectChanges();
        const groupRows = grid.groupsRowList.toArray();
        // verify group order
        checkGroups(groupRows, [null, '', 'Ignite UI for Angular', 'Ignite UI for JavaScript', 'NetAdvantage']);
    }));

    it('should allow grouping of already sorted column', waitForAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.enableSorting = true;
        fix.detectChanges();
        grid.sort({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();
        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();
        const groupRows = grid.groupsRowList.toArray();
        const dataRows = grid.dataRowList.toArray();
        // verify groups and data rows count
        expect(groupRows.length).toEqual(5);
        expect(dataRows.length).toEqual(8);
        expect(grid.groupingExpressions.length).toEqual(1);
    }));

    // GroupBy + Virtualization integration
    it('should virtualize data and group records.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '600px';
        fix.componentInstance.height = '300px';
        grid.columnWidth = '200px';
        fix.detectChanges();

        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();

        expect(grid.groupsRowList.toArray().length).toEqual(3);
        expect(grid.dataRowList.toArray().length).toEqual(2);
        expect(grid.rowList.toArray().length).toEqual(5);
    }));

    it('should recalculate visible chunk data and scrollbar size when expanding/collapsing group rows.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '600px';
        tick();
        fix.componentInstance.height = '300px';
        tick();
        grid.columnWidth = '200px';
        tick();
        fix.detectChanges();

        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();

        const origScrollHeight = parseInt((grid.verticalScrollContainer.getScroll().children[0] as HTMLElement).style.height, 10);

        // collapse all group rows currently in the view
        const grRows = grid.groupsRowList.toArray();
        grRows[0].toggle();
        tick();
        fix.detectChanges();

        // verify rows are updated
        expect(grid.groupsRowList.toArray().length).toEqual(4);
        expect(grid.dataRowList.toArray().length).toEqual(1);
        expect(grid.rowList.toArray().length).toEqual(5);

        // verify scrollbar is updated - 4 rows x 51px are hidden.
        expect(parseInt((grid.verticalScrollContainer.getScroll().children[0] as HTMLElement).style.height, 10))
            .toEqual(origScrollHeight - 204);

        grRows[0].toggle();
        tick();
        fix.detectChanges();

        expect(grid.groupsRowList.toArray().length).toEqual(3);
        expect(grid.dataRowList.toArray().length).toEqual(2);
        expect(grid.rowList.toArray().length).toEqual(5);

        expect(parseInt((grid.verticalScrollContainer.getScroll().children[0] as HTMLElement).style.height, 10))
            .toEqual(origScrollHeight);
    }));

    it('should persist group row expand/collapse state when scrolling.', async () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '500px';
        fix.componentInstance.height = '300px';
        grid.columnWidth = '200px';
        await wait();
        fix.detectChanges();

        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();

        let groupRow = grid.groupsRowList.toArray()[0];
        groupRow.toggle();
        await wait();

        expect(groupRow.expanded).toBe(false);
        fix.detectChanges();

        // scroll to bottom
        grid.verticalScrollContainer.getScroll().scrollTop = 10000;
        await wait(100);
        fix.detectChanges();

        // scroll back to the top
        grid.verticalScrollContainer.getScroll().scrollTop = 0;
        await wait(100);
        fix.detectChanges();

        groupRow = grid.groupsRowList.toArray()[0];

        expect(groupRow.expanded).toBe(false);
    });

    it('should retain focused group after expanding/collapsing row via KB - Alt + ArrowUp/ArrowDown', async () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '500px';
        fix.componentInstance.height = '300px';
        grid.columnWidth = '200px';
        await wait();
        fix.detectChanges();

        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();

        // scroll to bottom
        grid.verticalScrollContainer.getScroll().scrollTop = 10000;
        await wait(100);
        fix.detectChanges();

        // collapse last group row
        let groupRow = grid.gridAPI.get_row_by_index(11);
        UIInteractions.simulateClickAndSelectEvent(groupRow);
        fix.detectChanges();
        GridFunctions.verifyGroupRowIsFocused(groupRow);
        GridFunctions.simulateGridContentKeydown(fix, 'ArrowUp', true);
        fix.detectChanges();
        groupRow = grid.gridAPI.get_row_by_index(11);
        GridFunctions.verifyGroupRowIsFocused(groupRow);
        // expand last group row
        GridFunctions.simulateGridContentKeydown(fix, 'ArrowDown', true);
        fix.detectChanges();
        groupRow = grid.gridAPI.get_row_by_index(11);
        GridFunctions.verifyGroupRowIsFocused(groupRow);
    });

    it('should allow scrolling to bottom after collapsing a few groups.', async () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '500px';
        fix.componentInstance.height = '300px';
        grid.columnWidth = '200px';
        await wait();
        fix.detectChanges();

        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();

        // expand 2 group rows

        const groupRows = grid.groupsRowList.toArray();
        groupRows[0].toggle();
        groupRows[1].toggle();
        fix.detectChanges();

        // scroll to bottom
        grid.verticalScrollContainer.getScroll().scrollTop = 10000;
        await wait(100);
        fix.detectChanges();

        // verify virtualization states - should be in last chunk
        const virtState = grid.verticalScrollContainer.state;
        expect(virtState.startIndex).toBe(grid.dataView.length - virtState.chunkSize);

        // verify last row is visible at bottom
        const lastRow = grid.gridAPI.get_row_by_index(grid.dataView.length - 1);
        expect(lastRow.nativeElement.getBoundingClientRect().bottom).toBe(grid.tbody.nativeElement.getBoundingClientRect().bottom);

    });

    it('should leave group rows static when scrolling horizontally.', async () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;

        fix.componentInstance.width = '400px';
        fix.componentInstance.height = '300px';
        grid.columnWidth = '200px';
        await wait();
        fix.detectChanges();

        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();
        const groupRow = grid.groupsRowList.toArray()[0];
        const origRect = groupRow.element.nativeElement.getBoundingClientRect();
        grid.headerContainer.getScroll().scrollLeft = 1000;
        await wait(100);
        fix.detectChanges();

        const rect = groupRow.element.nativeElement.getBoundingClientRect();

        // verify row location is the same
        expect(rect.left).toEqual(origRect.left);
        expect(rect.top).toEqual(origRect.top);
    });

    it('should obtain correct virtualization state after all groups are collapsed and column is resized.', () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        grid.groupsExpanded = false;
        grid.columnWidth = '200px';
        fix.detectChanges();

        let fDataRow = grid.dataRowList.toArray()[0];
        expect(fDataRow.virtDirRow.sizesCache[1]).toBe(200);

        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();

        grid.columns[0].width = '500px';
        fix.detectChanges();
        const groupRows = grid.groupsRowList.toArray();
        groupRows[0].toggle();
        fix.detectChanges();

        fDataRow = grid.dataRowList.toArray()[0];
        expect(fDataRow.virtDirRow.sizesCache[1]).toBe(500);
    });

    // GroupBy + Filtering
    it('should filters by the data records and renders their related groups.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.instance;
        fix.componentInstance.width = '1200px';
        tick();
        fix.detectChanges();
        grid.columnWidth = '200px';
        tick();
        fix.detectChanges();

        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();
        let groupRows = grid.groupsRowList.toArray();
        let dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(5);
        expect(dataRows.length).toEqual(8);
        expect(grid.rowList.toArray().length).toEqual(13);

        grid.filter('ProductName', 'Ignite', IgxStringFilteringOperand.instance().condition('contains'), true);
        tick();
        fix.detectChanges();

        groupRows = grid.groupsRowList.toArray();
        dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(2);
        expect(dataRows.length).toEqual(4);
        expect(grid.rowList.toArray().length).toEqual(6);
    }));

    // GroupBy + RowSelectors
    it('should render row selectors in group row and remove them when the selection mode is set to none.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.width = '1200px';
        tick();
        grid.columnWidth = '200px';
        tick();
        grid.rowSelection = GridSelectionMode.multiple;
        tick();
        fix.detectChanges();

        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });

        fix.detectChanges();

        const grRows = grid.groupsRowList.toArray();
        const dataRows = grid.dataRowList.toArray();
        for (const grRow of grRows) {
            expect(GridSelectionFunctions.getRowCheckboxDiv(grRow.element.nativeElement)).toBeDefined();
        }
        for (const dRow of dataRows) {
            expect(GridSelectionFunctions.getRowCheckboxDiv(dRow.element.nativeElement)).toBeDefined();
        }
        GridSelectionFunctions.verifySelectionCheckBoxesAlignment(grid);

        grid.rowSelection = GridSelectionMode.none;
        fix.detectChanges();
        for (const grRow of grRows) {
            expect(GridSelectionFunctions.getRowCheckboxDiv(grRow.element.nativeElement)).toBeNull();
        }
        for (const dRow of dataRows) {
            expect(GridSelectionFunctions.getRowCheckboxDiv(dRow.element.nativeElement)).toBeNull();
        }

        grid.rowSelection = GridSelectionMode.single;
        fix.detectChanges();
        for (const grRow of grRows) {
            expect(GridSelectionFunctions.getRowCheckboxDiv(grRow.element.nativeElement)).toBeDefined();
        }
        for (const dRow of dataRows) {
            expect(GridSelectionFunctions.getRowCheckboxDiv(dRow.element.nativeElement)).toBeDefined();
        }
    }));

    it('group row checkboxes should be checked when selectAll API is called or when header checkbox is clicked.',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.width = '1200px';
            tick();
            grid.columnWidth = '200px';
            tick();
            grid.rowSelection = GridSelectionMode.multiple;
            tick();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            tick();
            fix.detectChanges();

            grid.selectAllRows();
            fix.detectChanges();

            expect(grid.selectedRows.length).toEqual(8);
            const grRows = grid.groupsRowList.toArray();
            for (const grRow of grRows) {
                expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, true, false));
            }
            let rows = fix.debugElement.queryAll(By.css('.igx-grid__tr--selected'));
            for (const r of rows) {
                expect(r.componentInstance instanceof IgxGridRowComponent).toBe(true);
            }

            grid.deselectAllRows();
            fix.detectChanges();
            expect(grid.selectedRows.length).toEqual(0);
            for (const grRow of grRows) {
                expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, false, false));
            }

            GridSelectionFunctions.clickHeaderRowCheckbox(fix);
            fix.detectChanges();

            expect(grid.selectedRows.length).toEqual(8);

            rows = fix.debugElement.queryAll(By.css('.igx-grid__tr--selected'));
            for (const grRow of grRows) {
                expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, true, false));
            }
            for (const r of rows) {
                expect(r.componentInstance instanceof IgxGridRowComponent).toBe(true);
            }
        }));

    it(`should select all records for group by pressing space when selectionMode is multiple
        and not all records within a group are selected and the groupRow is focused`,
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.width = '1200px';
            tick();
            grid.columnWidth = '200px';
            tick();
            grid.rowSelection = GridSelectionMode.multiple;
            tick();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            tick();
            fix.detectChanges();

            const grRow = grid.groupsRowList.toArray()[0];

            grRow.activate();
            tick();
            fix.detectChanges();

            GridFunctions.simulateGridContentKeydown(fix, 'Space');
            fix.detectChanges();

            for (const key of grRow.groupRow.records) {
                expect(GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_key(key)));
            }

            grid.deselectAllRows();
            fix.detectChanges();

            grid.selectRows([grRow.groupRow.records[0]]);
            fix.detectChanges();

            GridFunctions.simulateGridContentKeydown(fix, 'Space');
            fix.detectChanges();

            for (const key of grRow.groupRow.records) {
                expect(GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_key(key)));
            }
        }));

    it('should not affect current row selection by pressing space when selectionMode is single and the groupRow is focused',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.width = '1200px';
            tick();
            grid.columnWidth = '200px';
            tick();
            grid.rowSelection = GridSelectionMode.single;
            tick();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            tick();
            fix.detectChanges();

            const selectionCount = grid.selectedRows.length;

            const grRow = grid.groupsRowList.toArray()[0];

            grRow.activate();
            tick();
            fix.detectChanges();

            GridFunctions.simulateGridContentKeydown(fix, 'Space');
            fix.detectChanges();

            const newSelectioncount = grid.selectedRows.length;

            expect(selectionCount).toEqual(newSelectioncount);

        }));

    it(`should deselect all records for group by pressing space when selectionMode is multiple
        and all records within a group are selected and the groupRow is focused`,
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.width = '1200px';
            tick();
            grid.columnWidth = '200px';
            tick();
            grid.rowSelection = GridSelectionMode.multiple;
            tick();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            tick();
            fix.detectChanges();

            const grRow = grid.groupsRowList.toArray()[0];
            grid.selectRows(grRow.groupRow.records);
            tick();
            fix.detectChanges();

            grRow.activate();
            tick();
            fix.detectChanges();

            GridFunctions.simulateGridContentKeydown(fix, 'Space');
            fix.detectChanges();

            for (const key of grRow.groupRow.records) {
                expect(GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_key(key), false));
            }
        }));

    it('row selectors for all rows in certain group should be checked/unchecked if the checkbox for this group row is checked/unchecked',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.width = '1200px';
            tick();
            grid.columnWidth = '200px';
            tick();
            grid.rowSelection = GridSelectionMode.multiple;
            tick();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            tick();
            fix.detectChanges();

            const grRow = grid.groupsRowList.toArray()[0];

            for (const key of grRow.groupRow.records) {
                expect(GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_key(key), false, false));
            }

            GridSelectionFunctions.clickRowCheckbox(grRow);
            fix.detectChanges();

            for (const key of grRow.groupRow.records) {
                expect(GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_key(key), true, true));
            }
        }));

    it('the group row selector state should be checked if all records in the group are selected',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.width = '1200px';
            tick();
            grid.columnWidth = '200px';
            tick();
            grid.rowSelection = GridSelectionMode.multiple;
            tick();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            tick();
            fix.detectChanges();

            const grRow = grid.groupsRowList.toArray()[0];

            grid.selectRows(grRow.groupRow.records);
            fix.detectChanges();

            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, true, false));
        }));

    it('the group row selector state should be indeterminated if some of the records in the group but not all are selected',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.width = '1200px';
            tick();
            grid.columnWidth = '200px';
            tick();
            grid.rowSelection = GridSelectionMode.multiple;
            tick();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            tick();
            fix.detectChanges();

            const grRow = grid.groupsRowList.toArray()[0];

            grid.selectRows([grRow.groupRow.records[0]]);
            fix.detectChanges();

            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, false, true));
        }));

    it('the group row selectors should be disabled if the grid selection mode is single',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.width = '1200px';
            tick();
            grid.columnWidth = '200px';
            tick();
            grid.rowSelection = GridSelectionMode.single;
            tick();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            tick();
            fix.detectChanges();

            const grRow = grid.groupsRowList.toArray()[0];

            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, false, false, true));
        }));

    it('group row checkbox should remain the right state after filter is applied, all rows are selected and filter is removed',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.width = '1200px';
            tick();
            grid.columnWidth = '200px';
            tick();
            grid.rowSelection = GridSelectionMode.multiple;
            tick();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            tick();
            fix.detectChanges();

            grid.filter('ID', '2', IgxStringFilteringOperand.instance().condition('doesNotEqual'), true);
            tick();
            fix.detectChanges();

            const grRow = grid.groupsRowList.toArray()[0];

            GridSelectionFunctions.clickRowCheckbox(grRow);
            fix.detectChanges();

            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, true, false));

            grid.clearFilter();
            tick();
            fix.detectChanges();

            expect(GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_key(grRow.groupRow.records[0]), false));
            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, false, true));
        }));

    it('group row checkbox should remain the right state after selecting all rows in group and adding a new row to that group',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.width = '1200px';
            tick();
            grid.columnWidth = '200px';
            tick();
            grid.rowSelection = GridSelectionMode.multiple;
            tick();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            tick();
            fix.detectChanges();

            const grRow = grid.groupsRowList.toArray()[0];

            GridSelectionFunctions.clickRowCheckbox(grRow);
            fix.detectChanges();

            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, true, false));

            const newRow = { ID: '9', ProductName: 'NetAdvantage', Downloads: '350' };
            grid.addRow(newRow);
            fix.detectChanges();

            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, false, true));
        }));

    it('should select/deselect all rows in group from API',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.width = '1200px';
            tick();
            grid.columnWidth = '200px';
            tick();
            grid.rowSelection = GridSelectionMode.multiple;
            tick();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            tick();
            fix.detectChanges();

            const grRow = grid.groupsRowList.toArray()[0];
            const grRecord = grid.groupsRecords[0];

            grid.selectRowsInGroup(grRecord);
            tick();
            fix.detectChanges();

            for (const key of grRow.groupRow.records) {
                expect(GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_key(key)));
            }

            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, true, false));

            grid.deselectRowsInGroup(grRecord);
            tick();
            fix.detectChanges();

            for (const key of grRow.groupRow.records) {
                expect(GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_key(key), false));
            }

            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, false, false));
        }));

    it('should select/deselect all rows in group from API with PrimaryKey',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            grid.primaryKey = 'ID';
            fix.detectChanges();
            fix.componentInstance.width = '1200px';
            tick();
            grid.columnWidth = '200px';
            tick();
            grid.rowSelection = GridSelectionMode.multiple;
            tick();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            tick();
            fix.detectChanges();

            const grRow = grid.groupsRowList.toArray()[0];
            const grRecord = grid.groupsRecords[0];

            grid.selectRowsInGroup(grRecord);
            tick();
            fix.detectChanges();

            for (const key of grRow.groupRow.records) {
                expect(GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_key(key.ID)));
            }

            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, true, false));

            grid.deselectRowsInGroup(grRecord);
            tick();
            fix.detectChanges();

            for (const key of grRow.groupRow.records) {
                expect(GridSelectionFunctions.verifyRowSelected(grid.gridAPI.get_row_by_key(key.ID), false));
            }

            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, false, false));
        }));

    it('ARIA support for groupby row selectors',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.width = '1200px';
            tick();
            grid.columnWidth = '200px';
            tick();
            grid.rowSelection = GridSelectionMode.multiple;
            tick();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            tick();
            fix.detectChanges();

            const grRow = grid.groupsRowList.toArray()[0];
            const groupByRowCheckboxElement = GridSelectionFunctions.getRowCheckboxInput(grRow.element.nativeElement);

            expect(groupByRowCheckboxElement.getAttribute('aria-checked')).toMatch('false');
            expect(groupByRowCheckboxElement.getAttribute('aria-label'))
                .toMatch('Select all rows in the group with field name ProductName and value NetAdvantage');

            grid.selectRows([grRow.groupRow.records[0]]);
            fix.detectChanges();

            expect(groupByRowCheckboxElement.getAttribute('aria-checked')).toMatch('mixed');
            expect(groupByRowCheckboxElement.getAttribute('aria-label'))
                .toMatch('Select all rows in the group with field name ProductName and value NetAdvantage');

            grid.selectRows([grRow.groupRow.records[1]]);
            fix.detectChanges();

            expect(groupByRowCheckboxElement.getAttribute('aria-checked')).toMatch('true');
            expect(groupByRowCheckboxElement.getAttribute('aria-label'))
                .toMatch('Deselect all rows in the group with field name ProductName and value NetAdvantage');

        }));

    it(`edit selected row so it goes to another group where all rows are selected as well.
        The group row checkbox of the new group that the record becomes part of should be checked.`,
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.enableEditing = true;
            fix.componentInstance.width = '1200px';
            grid.primaryKey = 'ID';
            grid.columnWidth = '200px';
            grid.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            fix.detectChanges();

            const grRow = grid.groupsRowList.toArray()[0];

            grid.selectRowsInGroup(grRow.groupRow);
            grid.selectRows([5]);
            fix.detectChanges();

            const cell = grid.getCellByKey(5, 'ProductName');
            cell.column.editable = true;
            fix.detectChanges();

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fix.detectChanges();

            expect(cell.editMode).toBe(true);
            expect(grid.selectedRows.length).toEqual(3);

            const editCellDom = fix.debugElement.query(By.css('.igx-grid__td--editing'));
            const input = editCellDom.query(By.css('input'));

            clickAndSendInputElementValue(input, 'NetAdvantage', fix);
            GridFunctions.simulateGridContentKeydown(fix, 'Enter');
            fix.detectChanges();

            expect(grRow.groupRow.records.length).toEqual(3);
            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, true, false));
        }));

    it(`edit selected row so it goes to another group where all rows are not selected.
        The group row checkbox of the new group that the record becomes part of should be in indeterminate state.`,
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.enableEditing = true;
            fix.componentInstance.width = '1200px';
            grid.primaryKey = 'ID';
            grid.columnWidth = '200px';
            grid.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            fix.detectChanges();

            const grRow = grid.groupsRowList.toArray()[0];

            grid.selectRows([5]);
            fix.detectChanges();

            const cell = grid.getCellByKey(5, 'ProductName');
            cell.column.editable = true;
            fix.detectChanges();

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fix.detectChanges();

            expect(cell.editMode).toBe(true);
            expect(grid.selectedRows.length).toEqual(1);

            const editCellDom = fix.debugElement.query(By.css('.igx-grid__td--editing'));
            const input = editCellDom.query(By.css('input'));

            clickAndSendInputElementValue(input, 'NetAdvantage', fix);
            GridFunctions.simulateGridContentKeydown(fix, 'Enter');
            fix.detectChanges();

            expect(grRow.groupRow.records.length).toEqual(3);
            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, false, true));
        }));

    it(`edit non-selected row so it goes to another group where all rows are selected.
        The group row checkbox of the new group that the record becomes part of should become in indeterminate state.`,
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.enableEditing = true;
            fix.componentInstance.width = '1200px';
            grid.primaryKey = 'ID';
            grid.columnWidth = '200px';
            grid.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            fix.detectChanges();

            const grRow = grid.groupsRowList.toArray()[0];

            grid.selectRowsInGroup(grRow.groupRow);
            fix.detectChanges();

            const cell = grid.getCellByKey(5, 'ProductName');
            cell.column.editable = true;
            fix.detectChanges();

            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, true, false));

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fix.detectChanges();

            expect(cell.editMode).toBe(true);

            const editCellDom = fix.debugElement.query(By.css('.igx-grid__td--editing'));
            const input = editCellDom.query(By.css('input'));

            clickAndSendInputElementValue(input, 'NetAdvantage', fix);
            GridFunctions.simulateGridContentKeydown(fix, 'Enter');
            fix.detectChanges();

            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, false, true));
        }));

    it(`edit the only non-selected row in a group so that it moves to another group
        and check whether the current group row checkbox becomes checked.`,
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.enableEditing = true;
            fix.componentInstance.width = '1200px';
            grid.primaryKey = 'ID';
            grid.columnWidth = '200px';
            grid.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            fix.detectChanges();

            const grRow = grid.groupsRowList.toArray()[0];

            grid.selectRows([2]);
            fix.detectChanges();

            const cell = grid.getCellByKey(8, 'ProductName');
            cell.column.editable = true;
            fix.detectChanges();

            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, false, true));

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fix.detectChanges();

            expect(cell.editMode).toBe(true);

            const editCellDom = fix.debugElement.query(By.css('.igx-grid__td--editing'));
            const input = editCellDom.query(By.css('input'));

            clickAndSendInputElementValue(input, 'Ignite UI for Angular', fix);
            GridFunctions.simulateGridContentKeydown(fix, 'Enter');
            fix.detectChanges();

            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, true, false));
        }));

    it(`edit the only selected row in a group so that it moves to another group
        and check whether the current group row checkbox becomes unchecked.`,
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.enableEditing = true;
            fix.componentInstance.width = '1200px';
            grid.primaryKey = 'ID';
            grid.columnWidth = '200px';
            grid.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            fix.detectChanges();

            const grRow = grid.groupsRowList.toArray()[0];

            grid.selectRows([2]);
            fix.detectChanges();

            const cell = grid.getCellByKey(2, 'ProductName');
            cell.column.editable = true;
            fix.detectChanges();

            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, false, true));

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fix.detectChanges();

            expect(cell.editMode).toBe(true);

            const editCellDom = fix.debugElement.query(By.css('.igx-grid__td--editing'));
            const input = editCellDom.query(By.css('input'));

            clickAndSendInputElementValue(input, 'Ignite UI for Angular', fix);
            GridFunctions.simulateGridContentKeydown(fix, 'Enter');
            fix.detectChanges();

            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow, false, false));
        }));

    it('groupRowCheckbox should be in the right state by deleting rows from that group',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.width = '1200px';
            tick();
            grid.columnWidth = '200px';
            tick();
            grid.rowSelection = GridSelectionMode.multiple;
            tick();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            tick();
            fix.detectChanges();

            const grRow1 = grid.groupsRowList.toArray()[0];

            grid.selectRows([grRow1.groupRow.records[0]]);
            fix.detectChanges();
            grid.deleteRowById(grRow1.groupRow.records[0]);
            fix.detectChanges();
            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow1, false, false));

            const grRow2 = grid.groupsRowList.toArray()[1];

            grid.selectRows(grRow2.groupRow.records);
            fix.detectChanges();
            grid.deleteRowById(grRow2.groupRow.records[0]);
            fix.detectChanges();
            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow2, true, false));

            const grRow3 = grid.groupsRowList.toArray()[2];

            grid.selectRows([grRow3.groupRow.records[1]]);
            fix.detectChanges();
            grid.deleteRowById(grRow3.groupRow.records[0]);
            fix.detectChanges();
            expect(GridSelectionFunctions.verifyGroupByRowCheckboxState(grRow3, true, false));
        }));

    it('should hide/show checkboxes when change hideRowSelectors',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.width = '1200px';
            tick();
            grid.columnWidth = '200px';
            tick();
            grid.rowSelection = GridSelectionMode.multiple;
            tick();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            tick();
            fix.detectChanges();

            grid.hideRowSelectors = true;
            fix.detectChanges();

            const grRows = grid.groupsRowList.toArray();

            for (const grRow of grRows) {
                expect(GridSelectionFunctions.verifyRowHasCheckbox(grRow.element.nativeElement, false, false));
            }

            grid.hideRowSelectors = false;
            fix.detectChanges();

            for (const grRow of grRows) {
                expect(GridSelectionFunctions.verifyRowHasCheckbox(grRow.element.nativeElement));
            }

        }));

    it('Should have the correct properties in the custom row selector template', fakeAsync(() => {
            const fix = TestBed.createComponent(GridGroupByRowCustomSelectorsComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.width = '1200px';
            tick();
            grid.columnWidth = '200px';
            tick();
            grid.rowSelection = GridSelectionMode.multiple;
            tick();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
            });
            tick();
            fix.detectChanges();

            const grRow = grid.groupsRowList.toArray()[0];
            const contextSelect = { selectedCount: 0, totalCount: 2, groupRow: grid.groupsRowList.toArray()[0].groupRow };
            const contextUnselect = { selectedCount: 2, totalCount: 2, groupRow: grid.groupsRowList.toArray()[0].groupRow };

            spyOn(fix.componentInstance, 'onGroupByRowClick').and.callThrough();

            grRow.nativeElement.querySelector('.igx-checkbox__composite').click();
            fix.detectChanges();
            expect(fix.componentInstance.onGroupByRowClick).toHaveBeenCalledWith(new MouseEvent('click'), contextSelect);

            grRow.nativeElement.querySelector('.igx-checkbox__composite').click();
            fix.detectChanges();
            expect(fix.componentInstance.onGroupByRowClick).toHaveBeenCalledWith(new MouseEvent('click'), contextUnselect);
        }));

    // GroupBy + Resizing
    it('should retain same size for group row after a column is resized.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.width = '1200px';
        fix.componentInstance.enableResizing = true;
        grid.columnWidth = '200px';
        fix.detectChanges();
        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();

        let grRows = grid.groupsRowList.toArray();
        for (const grRow of grRows) {
            expect(grRow.element.nativeElement.clientWidth).toEqual(1200);
        }

        const headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));
        const headerResArea = headers[0].children[1].nativeElement;
        UIInteractions.simulateMouseEvent('mouseover', headerResArea, 200, 5);
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 200, 5);
        tick(200);
        UIInteractions.simulateMouseEvent('mouseup', headerResArea, 200, 5);
        fix.detectChanges();

        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 200, 5);
        tick(200);
        const resizer = fix.debugElement.queryAll(By.css('.igx-grid__th-resize-line'))[0].nativeElement;
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 550, 5);
        UIInteractions.simulateMouseEvent('mouseup', resizer, 550, 5);
        fix.detectChanges();

        expect(grid.columns[0].width).toEqual('550px');

        grRows = grid.groupsRowList.toArray();
        for (const grRow of grRows) {
            expect(grRow.element.nativeElement.clientWidth).toEqual(1200);
        }
    }));

    // GroupBy + Hiding
    it('should retain same size for group row after a column is hidden.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.width = '1200px';
        tick();
        grid.columnWidth = '200px';
        tick();
        fix.detectChanges();
        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();

        grid.getColumnByName('ProductName').hidden = true;
        tick();
        grid.getColumnByName('Released').hidden = true;
        tick();

        fix.detectChanges();

        const grRows = grid.groupsRowList.toArray();
        for (const grRow of grRows) {
            expect(grRow.element.nativeElement.clientWidth).toEqual(1200);
        }
    }));

    // GroupBy + Pinning
    it('should retain same size for group row after a column is pinned.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.width = '500px';
        tick();
        grid.columnWidth = '200px';
        tick();
        fix.detectChanges();
        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();

        grid.pinColumn('ProductName');
        tick();

        fix.detectChanges();
        const grRows = grid.groupsRowList.toArray();
        for (const grRow of grRows) {
            expect(grRow.element.nativeElement.clientWidth).toEqual(500);
        }
    }));

    // GroupBy + Updating
    it('should update the UI when adding/deleting/updating records via the API so that they more to the correct group.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.width = '500px';
        grid.columnWidth = '200px';
        grid.primaryKey = 'ID';
        fix.detectChanges();
        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();

        // verify rows
        let groupRows = grid.groupsRowList.toArray();
        let dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(5);
        expect(dataRows.length).toEqual(8);

        // add records
        grid.addRow({
            Downloads: 0,
            ID: 1010,
            ProductName: 'Ignite UI for Everyone',
            ReleaseDate: new Date(),
            Released: false
        });
        tick();
        fix.detectChanges();
        groupRows = grid.groupsRowList.toArray();
        dataRows = grid.dataRowList.toArray();
        expect(groupRows.length).toEqual(6);
        expect(dataRows.length).toEqual(9);

        // update records
        grid.updateRow({ ID: 1010, ProductName: 'Ignite UI for Angular' }, 1010);
        tick();
        fix.detectChanges();

        groupRows = grid.groupsRowList.toArray();
        dataRows = grid.dataRowList.toArray();
        expect(groupRows.length).toEqual(5);
        expect(dataRows.length).toEqual(9);

        grid.deleteRow(1010);
        tick();
        fix.detectChanges();
        grid.deleteRow(3);
        tick();
        fix.detectChanges();
        grid.deleteRow(6);
        tick();
        fix.detectChanges();
        groupRows = grid.groupsRowList.toArray();
        dataRows = grid.dataRowList.toArray();
        expect(groupRows.length).toEqual(4);
        expect(dataRows.length).toEqual(6);
    }));

    // eslint-disable-next-line max-len
    it('should update the UI when updating records via the UI after grouping is re-applied so that they more to the correct group', async () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.enableEditing = true;
        fix.componentInstance.width = '800px';
        grid.columnWidth = '200px';
        grid.primaryKey = 'ID';
        fix.detectChanges();

        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();

        const cell = grid.getCellByKey(5, 'ProductName');
        cell.column.editable = true;
        fix.detectChanges();

        UIInteractions.simulateDoubleClickAndSelectEvent(cell);
        await wait();
        fix.detectChanges();

        expect(cell.editMode).toBe(true);

        const editCellDom = fix.debugElement.query(By.css('.igx-grid__td--editing'));
        const input = editCellDom.query(By.css('input'));

        clickAndSendInputElementValue(input, 'NetAdvantage', fix);
        await wait();
        GridFunctions.simulateGridContentKeydown(fix, 'Enter');
        await wait(30);
        fix.detectChanges();

        const groupRows = grid.groupsRowList.toArray();
        const dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(4);
        expect(dataRows.length).toEqual(8);
    });

    // GroupBy + Paging integration
    it('should apply paging on both data records and group records.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.instance;
        fix.componentInstance.instance.paging = true;
        tick();
        fix.detectChanges();
        fix.componentInstance.instance.perPage = 4;
        tick();
        fix.detectChanges();
        fix.componentInstance.instance.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();
        const groupRows = grid.groupsRowList.toArray();
        const dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(2);
        expect(dataRows.length).toEqual(2);

        expect(groupRows[0].groupRow.value).toEqual('NetAdvantage');
        expect(groupRows[1].groupRow.value).toEqual('Ignite UI for JavaScript');
    }));

    it('should have groups with correct summaries with paging.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.instance;
        fix.componentInstance.instance.paging = true;
        tick();
        fix.detectChanges();
        fix.componentInstance.instance.perPage = 4;
        tick();
        fix.detectChanges();
        fix.componentInstance.instance.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();
        let groupRows = grid.groupsRowList.toArray();
        let dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(2);
        expect(dataRows.length).toEqual(2);
        expect(groupRows[0].groupRow.records.length).toEqual(2);
        expect(groupRows[1].groupRow.records.length).toEqual(2);
        expect(groupRows[0].groupRow.value).toEqual('NetAdvantage');
        expect(groupRows[1].groupRow.value).toEqual('Ignite UI for JavaScript');

        fix.componentInstance.instance.paginate(1);
        tick();
        fix.detectChanges();

        groupRows = grid.groupsRowList.toArray();
        dataRows = grid.dataRowList.toArray();
        expect(groupRows.length).toEqual(1);
        expect(dataRows.length).toEqual(3);
        expect(groupRows[0].groupRow.records.length).toEqual(2);
        expect(groupRows[0].groupRow.value).toEqual('Ignite UI for Angular');
    }));

    it('should persist groupby state between pages.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.instance;
        fix.componentInstance.instance.paging = true;
        fix.componentInstance.instance.perPage = 4;
        tick();
        fix.detectChanges();
        fix.componentInstance.instance.groupingExpansionState.push({
            expanded: false,
            hierarchy: [{ fieldName: 'ProductName', value: 'Ignite UI for JavaScript' }]
        });
        tick();
        fix.detectChanges();
        fix.componentInstance.instance.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();
        let groupRows = grid.groupsRowList.toArray();
        let dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(2);
        expect(dataRows.length).toEqual(2);
        expect(groupRows[0].groupRow.records.length).toEqual(2);
        expect(groupRows[1].groupRow.records.length).toEqual(2);
        expect(dataRows[1].rowData.ProductName).toEqual('NetAdvantage');

        fix.componentInstance.instance.paginate(1);
        tick();
        fix.detectChanges();

        groupRows = grid.groupsRowList.toArray();
        dataRows = grid.dataRowList.toArray();
        expect(groupRows.length).toEqual(2);
        expect(dataRows.length).toEqual(2);
        expect(groupRows[0].groupRow.records.length).toEqual(2);
        expect(groupRows[1].groupRow.records.length).toEqual(1);
        expect(dataRows[0].rowData.ProductName).toEqual('Ignite UI for Angular');

        fix.componentInstance.instance.paginate(0);
        tick();
        fix.detectChanges();

        groupRows = grid.groupsRowList.toArray();
        dataRows = grid.dataRowList.toArray();
        expect(groupRows.length).toEqual(2);
        expect(dataRows.length).toEqual(2);
        expect(groupRows[0].groupRow.records.length).toEqual(2);
        expect(groupRows[1].groupRow.records.length).toEqual(2);
        expect(dataRows[1].rowData.ProductName).toEqual('NetAdvantage');
    }));

    // GroupBy Area
    it('should apply group area if a column is grouped.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.enableSorting = true;
        tick();
        fix.detectChanges();
        const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');

        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false
        });
        fix.detectChanges();
        // verify group area is rendered
        expect(gridElement.querySelectorAll('.igx-grid__grouparea').length).toEqual(1);
    }));

    it('should apply group area if a column is groupable.', fakeAsync(() => {
        const fix = TestBed.createComponent(GroupableGridComponent);
        tick();
        fix.detectChanges();
        const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');
        // verify group area is rendered
        expect(gridElement.querySelectorAll('.igx-grid__grouparea').length).toEqual(1);
        expect(gridElement.clientHeight).toEqual(700);
    }));

    it('should allow collapsing and expanding all group rows', fakeAsync(() => {
        const fix = TestBed.createComponent(GroupableGridComponent);
        const grid = fix.componentInstance.instance;
        fix.detectChanges();

        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false
        });
        grid.toggleAllGroupRows();
        tick();
        fix.detectChanges();
        const groupRows = grid.groupsRowList.toArray();
        expect(groupRows[0].expanded).not.toBe(true);
        expect(groupRows[groupRows.length - 1].expanded).not.toBe(true);

        grid.toggleAllGroupRows();
        tick();
        fix.detectChanges();
        expect(groupRows[0].expanded).toBe(true);
        expect(groupRows[groupRows.length - 1].expanded).toBe(true);
    }));

    it('should update horizontal virtualization state correcly when data row views are re-used from cache.', async () => {
        const fix = TestBed.createComponent(GroupableGridComponent);
        const grid = fix.componentInstance.instance;
        fix.detectChanges();
        // group and collapse all groups
        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false
        });
        fix.detectChanges();
        grid.toggleAllGroupRows();
        await wait(100);
        fix.detectChanges();

        // scroll left
        grid.headerContainer.getScroll().scrollLeft = 1000;
        fix.detectChanges();

        const gridScrLeft = grid.headerContainer.getScroll().scrollLeft;
        await wait(100);
        fix.detectChanges();

        grid.toggleAllGroupRows();
        fix.detectChanges();
        await wait();
        // verify rows are scrolled to the right
        let dataRows = grid.dataRowList.toArray();
        dataRows.forEach(dr => {
            const virtualization = dr.virtDirRow;
            // should be at last chunk
            const expectedStartIndex = virtualization.igxForOf.length - virtualization.state.chunkSize;
            expect(virtualization.state.startIndex).toBe(expectedStartIndex);
            // should have correct left offset
            const left = parseInt(virtualization.dc.instance._viewContainer.element.nativeElement.style.left, 10);
            expect(-left).toBe(gridScrLeft - virtualization.getColumnScrollLeft(expectedStartIndex));
        });

        // scroll down
        grid.verticalScrollContainer.getScroll().scrollTop = 10000;
        await wait(100);
        fix.detectChanges();

        // verify rows are scrolled to the right
        dataRows = grid.dataRowList.toArray();
        dataRows.forEach(dr => {
            const virtualization = dr.virtDirRow;
            // should be at last chunk
            const expectedStartIndex = virtualization.igxForOf.length - virtualization.state.chunkSize;
            expect(virtualization.state.startIndex).toBe(expectedStartIndex);
            // should have correct left offset
            const left = parseInt(virtualization.dc.instance._viewContainer.element.nativeElement.style.left, 10);
            expect(-left).toBe(gridScrLeft - virtualization.getColumnScrollLeft(expectedStartIndex));
        });
    });

    // GroupBy chip
    it('should apply the chip correctly when there are grouping expressions applied and reordered', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        // set groupingExpressions
        const grid = fix.componentInstance.instance;
        const exprs: ISortingExpression[] = [
            { fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: true },
            { fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: true }
        ];
        grid.groupingExpressions = exprs;
        tick();
        fix.detectChanges();
        let groupRows = grid.groupsRowList.toArray();
        checkGroups(groupRows,
            ['NetAdvantage', true, false, 'Ignite UI for JavaScript', true,
                false, 'Ignite UI for Angular', false, null, '', true, null, true],
            grid.groupingExpressions);
        let chips = fix.nativeElement.querySelectorAll('igx-chip');
        checkChips(chips, grid.groupingExpressions, grid.sortingExpressions);

        // change order
        grid.groupingExpressions = [
            { fieldName: 'Released', dir: SortingDirection.Asc, ignoreCase: true },
            { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: true }
        ];
        tick();
        grid.sortingExpressions = [
            { fieldName: 'Released', dir: SortingDirection.Asc, ignoreCase: true },
            { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: true }
        ];
        tick();
        fix.detectChanges();

        groupRows = grid.groupsRowList.toArray();
        // verify groups
        checkGroups(groupRows,
            [null, 'Ignite UI for Angular', false, 'Ignite UI for Angular', 'Ignite UI for JavaScript',
                'NetAdvantage', true, null, '', 'Ignite UI for JavaScript', 'NetAdvantage'],
            grid.groupingExpressions);
        chips = fix.nativeElement.querySelectorAll('igx-chip');
        checkChips(chips, grid.groupingExpressions, grid.sortingExpressions);
    }));

    it('should apply the chip correctly when there is grouping at runtime', fakeAsync(() => {
        const fix = TestBed.createComponent(GroupableGridComponent);
        const grid = fix.componentInstance.instance;
        fix.detectChanges();

        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        const groupRows = grid.groupsRowList.toArray();
        const chips = fix.nativeElement.querySelectorAll('igx-chip');
        checkChips(chips, grid.groupingExpressions, grid.sortingExpressions);
        checkGroups(groupRows, ['NetAdvantage', 'Ignite UI for JavaScript', 'Ignite UI for Angular', '', null]);
    }));

    it('should remove sorting when grouping is removed', fakeAsync(() => {
        const fix = TestBed.createComponent(GroupableGridComponent);
        const grid = fix.componentInstance.instance;
        fix.detectChanges();

        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();
        let chips = fix.nativeElement.querySelectorAll('igx-chip');
        // click close button
        UIInteractions.simulateMouseEvent('click', ControlsFunction.getChipRemoveButton(chips[0]), 0, 0);
        tick();
        fix.detectChanges();
        chips = fix.nativeElement.querySelectorAll('igx-chip');
        expect(chips.length).toBe(0);
        expect(grid.groupingExpressions.length).toBe(0);
        expect(grid.sortingExpressions.length).toBe(0);
    }));

    it('should change sorting direction when grouping changes direction', fakeAsync(() => {
        const fix = TestBed.createComponent(GroupableGridComponent);
        const grid = fix.componentInstance.instance;
        fix.detectChanges();

        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();
        let chips = fix.nativeElement.querySelectorAll('igx-chip');
        // click grouping direction arrow
        const event: IChipClickEventArgs = { owner: chips[0], originalEvent: null, cancel: false };
        grid.onChipClicked(event);
        tick();
        fix.detectChanges();
        chips = fix.nativeElement.querySelectorAll('igx-chip');
        tick();
        expect(chips.length).toBe(1);
        checkChips(chips, grid.groupingExpressions, grid.sortingExpressions);
        expect(chips[0].querySelectorAll('igx-icon')[1].innerText.trim()).toBe('arrow_upward');
    }));

    it('should change grouping direction when sorting changes direction', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.enableSorting = true;
        tick();
        fix.detectChanges();

        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false
        });
        fix.detectChanges();
        const productNameCol = fix.nativeElement.querySelector('igx-grid-header-group[id$="_-1_0_2"]');
        UIInteractions.simulateMouseEvent('click', productNameCol,0, 0);
        tick();
        fix.detectChanges();
        const chips = fix.nativeElement.querySelectorAll('igx-chip');
        tick();
        checkChips(chips, grid.groupingExpressions, grid.sortingExpressions);
    }));

    it('should allow row selection after grouping, scrolling down to a new virtual frame and attempting to select a row.', async () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        grid.rowSelection = GridSelectionMode.multiple;
        fix.componentInstance.height = '200px';
        fix.detectChanges();

        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        grid.groupBy({
            fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false
        });

        fix.detectChanges();

        // scroll to bottom
        grid.verticalScrollContainer.getScroll().scrollTop = 10000;
        fix.detectChanges();
        await wait(100);
        const rows = grid.dataRowList.toArray();
        expect(rows.length).toEqual(1);
        GridSelectionFunctions.clickRowCheckbox(rows[0].element);
        await wait(100);
        grid.cdr.detectChanges();
        expect(grid.selectedRows.length).toEqual(1);
        GridSelectionFunctions.verifyRowSelected(rows[0]);

    });

    it('should persist state for the correct group record when there are group records with the same fieldName and value.',
        fakeAsync(() => {
            const fix = TestBed.createComponent(GroupableGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.data = [
                {
                    Downloads: 0,
                    ID: 1,
                    ProductName: 'JavaScript',
                    ReleaseDate: new Date(),
                    Released: false
                },
                {
                    Downloads: 0,
                    ID: 2,
                    ProductName: 'JavaScript',
                    ReleaseDate: new Date(),
                    Released: true
                }
            ];
            tick();
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'Released',
                dir: SortingDirection.Asc,
            });
            grid.groupBy({
                fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false
            });

            fix.detectChanges();

            const groupRows = grid.groupsRowList.toArray();

            // group rows that have the same fieldName and value but belong to different parent groups
            const similarGroupRows = groupRows.filter((gRows) =>
                gRows.groupRow.value === 'JavaScript' && gRows.groupRow.expression.fieldName);
            expect(similarGroupRows.length).toEqual(2);

            // verify that if one is collapse the other remains expanded
            similarGroupRows[0].toggle();
            tick();

            expect(similarGroupRows[0].expanded).toEqual(false);
            expect(similarGroupRows[1].expanded).toEqual(true);
        }));

    it('should render disabled non-interactable chip for column that does not allow grouping.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.detectChanges();
        grid.getColumnByName('ProductName').groupable = false;
        tick();
        grid.getColumnByName('Released').groupable = true;
        tick();
        fix.detectChanges();
        grid.groupBy([
            { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: true },
            { fieldName: 'Released', dir: SortingDirection.Asc, ignoreCase: true }
        ]);
        fix.detectChanges();

        const chips = fix.nativeElement.querySelectorAll(CHIP);
        tick();
        expect(chips.length).toBe(2);

        // check correct chip is disabled
        expect(chips[0].className).toContain(DISABLED_CHIP);
        expect(chips[1].className).not.toContain(DISABLED_CHIP);

        // check no remove button on disabled chip
        expect(ControlsFunction.getChipRemoveButton(chips[0])).toBeNull();
        expect(ControlsFunction.getChipRemoveButton(chips[1])).toBeDefined();

        // check click does not allow changing sort dir
        chips[0].children[0].dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1 }));
        tick();
        chips[0].children[0].dispatchEvent(new PointerEvent('pointerup'));
        tick();
        fix.detectChanges();

        chips[1].children[0].dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1 }));
        tick();
        chips[1].children[0].dispatchEvent(new PointerEvent('pointerup'));
        tick();

        fix.detectChanges();
        grid.cdr.detectChanges();

        const fChipDirection = chips[0].querySelector('[igxsuffix]').innerText;
        const sChipDirection = chips[1].querySelector('[igxsuffix]').innerText;

        expect(fChipDirection).toEqual('arrow_upward');
        expect(sChipDirection).toEqual('arrow_downward');
    }));

    it('should remove expansion state when removing groups', fakeAsync(() => {
        const fix = TestBed.createComponent(GroupableGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.data = [
            {
                Downloads: 0,
                ID: 1,
                ProductName: 'JavaScript',
                ReleaseDate: new Date(),
                Released: false
            },
            {
                Downloads: 0,
                ID: 2,
                ProductName: 'JavaScript',
                ReleaseDate: new Date(),
                Released: true
            }
        ];
        tick();
        fix.detectChanges();

        grid.groupBy([
            { fieldName: 'Released', dir: SortingDirection.Asc, ignoreCase: false },
            { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false }
        ]);
        fix.detectChanges();

        const groupRows = grid.groupsRowList.toArray();
        groupRows[1].toggle();
        tick();
        fix.detectChanges();
        expect(groupRows[0].expanded).toEqual(true);
        expect(groupRows[1].expanded).toEqual(false);

        grid.clearGrouping('ProductName');
        tick();
        fix.detectChanges();

        grid.groupBy([{
            fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false
        }]);
        fix.detectChanges();

        expect(groupRows[0].expanded).toEqual(true);
        expect(groupRows[1].expanded).toEqual(true);
        expect(groupRows[2].expanded).toEqual(true);
        expect(groupRows[3].expanded).toEqual(true);

        groupRows[1].toggle();
        tick();
        fix.detectChanges();

        grid.clearGrouping();
        tick();
        fix.detectChanges();

        grid.groupBy([
            { fieldName: 'Released', dir: SortingDirection.Asc, ignoreCase: false },
            { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false }
        ]);
        fix.detectChanges();

        expect(groupRows[0].expanded).toEqual(true);
        expect(groupRows[1].expanded).toEqual(true);
        expect(groupRows[2].expanded).toEqual(true);
        expect(groupRows[3].expanded).toEqual(true);
    }));

    it('should remove expansion state of groups with higher group hierarchy', fakeAsync(() => {
        const fix = TestBed.createComponent(GroupableGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.data = [
            {
                Downloads: 0,
                ID: 1,
                ProductName: 'JavaScript',
                ReleaseDate: new Date(),
                Released: false
            },
            {
                Downloads: 0,
                ID: 2,
                ProductName: 'JavaScript',
                ReleaseDate: new Date(),
                Released: true
            }
        ];
        tick();
        fix.detectChanges();

        grid.groupBy([
            { fieldName: 'Released', dir: SortingDirection.Asc, ignoreCase: false },
            { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false }
        ]);
        fix.detectChanges();

        let groupRows = grid.groupsRowList.toArray();
        groupRows[1].toggle();
        tick();
        fix.detectChanges();
        expect(groupRows[0].expanded).toEqual(true);
        expect(groupRows[1].expanded).toEqual(false);

        grid.clearGrouping('Released');
        tick();
        fix.detectChanges();

        grid.groupBy([
            { fieldName: 'Released', dir: SortingDirection.Asc, ignoreCase: false }
        ]);
        fix.detectChanges();

        // reorder chips by simulating events
        const chips = fix.nativeElement.querySelectorAll('igx-chip');
        UIInteractions.simulatePointerEvent('pointerdown', chips[0], 0, 0);
        tick();
        UIInteractions.simulatePointerEvent('pointermove', chips[0], 200, 0);
        tick();
        UIInteractions.simulatePointerEvent('pointerup', chips[0], 0, 0);
        tick();
        fix.detectChanges();

        groupRows = grid.groupsRowList.toArray();
        expect(groupRows[0].expanded).toEqual(true);
        expect(groupRows[1].expanded).toEqual(true);
    }));

    it('should reorder groups when reordering chip', async () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.detectChanges();
        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();

        const chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        // Disable chip animations
        chipComponents.forEach((chip) => {
            chip.componentInstance.animateOnRelease = false;
        });

        // Trigger initial pointer events on the element with igxDrag. When the drag begins the ghostElement should receive events.
        UIInteractions.simulatePointerEvent('pointerdown', chipComponents[0].componentInstance.dragDirective.element.nativeElement, 75, 30);
        await wait();
        UIInteractions.simulatePointerEvent('pointermove',
            chipComponents[0].componentInstance.dragDirective.element.nativeElement, 110, 30);
        await wait();
        fix.detectChanges();

        UIInteractions.simulatePointerEvent('pointermove', chipComponents[0].componentInstance.dragDirective.ghostElement, 250, 30);
        await wait();
        fix.detectChanges();

        UIInteractions.simulatePointerEvent('pointerup', chipComponents[0].componentInstance.dragDirective.ghostElement, 250, 30);
        await wait();
        fix.detectChanges();
        const chipsElems = fix.nativeElement.querySelectorAll('igx-chip');
        checkChips(chipsElems, grid.groupingExpressions, grid.sortingExpressions);

        // verify groups
        const groupRows = grid.groupsRowList.toArray();
        checkGroups(groupRows,
            ['NetAdvantage', true, false, 'Ignite UI for JavaScript', true,
                false, 'Ignite UI for Angular', false, null, '', true, null, true],
            grid.groupingExpressions);

    });

    it('should remove expansion state when reordering chips', async () => {
        const fix = TestBed.createComponent(GroupableGridComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.data = [
            {
                Downloads: 0,
                ID: 1,
                ProductName: 'JavaScript',
                ReleaseDate: new Date(),
                Released: false
            },
            {
                Downloads: 0,
                ID: 2,
                ProductName: 'JavaScript',
                ReleaseDate: new Date(),
                Released: true
            }
        ];
        fix.detectChanges();

        grid.groupBy([
            { fieldName: 'Released', dir: SortingDirection.Asc, ignoreCase: false },
            { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false }
        ]);
        fix.detectChanges();

        let groupRows = grid.groupsRowList.toArray();
        groupRows[1].toggle();
        fix.detectChanges();
        expect(groupRows[0].expanded).toEqual(true);
        expect(groupRows[1].expanded).toEqual(false);

        groupRows = grid.groupsRowList.toArray();
        // reorder chips by simulating events
        let chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        // Disable chip animations
        chipComponents.forEach((chip) => {
            chip.componentInstance.animateOnRelease = false;
        });
        fix.detectChanges();

        // Trigger initial pointer events on the element with igxDrag. When the drag begins the ghostElement should receive events.
        UIInteractions.simulatePointerEvent('pointerdown',
            chipComponents[0].componentInstance.dragDirective.element.nativeElement, 100, 30);
        await wait();
        UIInteractions.simulatePointerEvent('pointermove',
            chipComponents[0].componentInstance.dragDirective.element.nativeElement, 110, 30);
        await wait();
        fix.detectChanges();

        UIInteractions.simulatePointerEvent('pointermove', chipComponents[0].componentInstance.dragDirective.ghostElement, 250, 30);
        await wait();
        fix.detectChanges();

        UIInteractions.simulatePointerEvent('pointerup', chipComponents[0].componentInstance.dragDirective.ghostElement, 250, 30);
        await wait();
        fix.detectChanges();

        expect(groupRows[0].expanded).toEqual(true);
        expect(groupRows[1].expanded).toEqual(true);

        let chipsElems = fix.nativeElement.querySelectorAll('igx-chip');
        expect(chipsElems[0].querySelector('div.igx-chip__content').textContent.trim()).toEqual('ProductName');
        expect(chipsElems[1].querySelector('div.igx-chip__content').textContent.trim()).toEqual('Released');

        // reorder chips again to revert them in original state
        chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));

        // Trigger initial pointer events on the element with igxDrag. When the drag begins the ghostElement should receive events.
        UIInteractions.simulatePointerEvent('pointerdown',
            chipComponents[0].componentInstance.dragDirective.element.nativeElement, 100, 30);
        await wait();
        UIInteractions.simulatePointerEvent('pointermove',
            chipComponents[0].componentInstance.dragDirective.element.nativeElement, 110, 30);
        await wait();
        fix.detectChanges();

        UIInteractions.simulatePointerEvent('pointermove', chipComponents[0].componentInstance.dragDirective.ghostElement, 250, 30);
        await wait();
        fix.detectChanges();

        UIInteractions.simulatePointerEvent('pointerup', chipComponents[0].componentInstance.dragDirective.ghostElement, 250, 30);
        await wait();
        fix.detectChanges();

        chipsElems = fix.nativeElement.querySelectorAll('igx-chip');
        expect(chipsElems[0].querySelector('div.igx-chip__content').textContent.trim()).toEqual('Released');
        expect(chipsElems[1].querySelector('div.igx-chip__content').textContent.trim()).toEqual('ProductName');

        groupRows = grid.groupsRowList.toArray();
        expect(groupRows[0].expanded).toEqual(true);
        expect(groupRows[1].expanded).toEqual(true);
    });

    it('should not throw an error when moving a column over a chip when there is grouped columns', async () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.detectChanges();

        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false
        });
        fix.detectChanges();

        const firstColumn = fix.debugElement.query(By.directive(IgxColumnMovingDragDirective));
        const directiveInstance = firstColumn.injector.get(IgxColumnMovingDragDirective);

        // Trigger initial pointer events on the element with igxDrag. When the drag begins the ghostElement should receive events.
        UIInteractions.simulatePointerEvent('pointerdown', firstColumn.nativeElement, 75, 30);
        await wait();
        UIInteractions.simulatePointerEvent('pointermove', firstColumn.nativeElement, 110, 30);
        await wait();

        expect(async () => {
            fix.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', directiveInstance.ghostElement, 250, 30);
            await wait();
        }).not.toThrow();

        fix.detectChanges();
        UIInteractions.simulatePointerEvent('pointerup', directiveInstance.ghostElement, 250, 30);
        await wait();
    });

    it('should throw an error when grouping more than 10 colunms', fakeAsync(() => {
        const fix = TestBed.createComponent(GroupByDataMoreColumnsComponent);
        const grid = fix.componentInstance.instance;
        fix.componentInstance.testData = [
            { A: '1', B: 'ALFKI', C: '2', D: '3', E: '4', F: '5', H: '6', G: '7', K: '8', L: '9', M: '10', N: '1' }
        ];
        tick();
        fix.detectChanges();
        let m = '';
        const expr = fix.componentInstance.columns.map(val => ({ fieldName: val.field, dir: SortingDirection.Asc, ignoreCase: true }));
        // not allowed to group by more than 10 columns
        try {
            grid.groupBy(expr);
            tick();
        } catch (e) {
            m = e.message;
        }
        tick();
        expect(m).toBe('Maximum amount of grouped columns is 10.');
    }));

    it('should not allow grouping by column with no name', fakeAsync(() => {
        const fix = TestBed.createComponent(GroupByEmptyColumnFieldComponent);
        const grid = fix.componentInstance.instance;
        fix.detectChanges();
        tick();
        const expr = grid.columns.map(val => ({ fieldName: val.field, dir: SortingDirection.Asc, ignoreCase: true }));
        grid.groupBy(expr);
        tick();
        expect(grid.groupsRowList.toArray().length).toBe(0);
    }));

    it('should display column header text in the grouping chip.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.detectChanges();
        grid.columnList.toArray()[0].header = 'Custom Header Text';
        tick();
        fix.detectChanges();

        grid.groupBy({ fieldName: 'Downloads', dir: SortingDirection.Asc, ignoreCase: false });
        fix.detectChanges();

        const chips = fix.nativeElement.querySelectorAll(CHIP);
        expect(chips.length).toBe(1);
        const chipText = chips[0].querySelector('div.igx-chip__content').innerText;
        expect(chipText).toEqual('Custom Header Text');
        expect(chips[0].getAttribute('title')).toEqual('Custom Header Text');
    }));

    it('should update grid sizes when columns are grouped/ungrouped.', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.componentInstance.width = '400px';
        tick();
        fix.componentInstance.height = '500px';
        tick();
        const grid = fix.componentInstance.instance;
        fix.detectChanges();
        const groupArea = fix.debugElement.query(By.css('.igx-grid__grouparea'));
        const gridHeader = fix.debugElement.query(By.css('.igx-grid__thead'));
        const gridFooter = fix.debugElement.query(By.css('.igx-grid__tfoot'));
        const gridScroll = fix.debugElement.query(By.css('.igx-grid__scroll'));

        let expectedHeight = parseInt(window.getComputedStyle(grid.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(groupArea.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridHeader.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridFooter.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridScroll.nativeElement).height, 10);

        expect(grid.calcHeight).toEqual(expectedHeight);

        // verify height is recalculated.
        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Asc, ignoreCase: false });
        grid.groupBy({ fieldName: 'Downloads', dir: SortingDirection.Asc, ignoreCase: false });
        grid.groupBy({
            fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false
        });
        grid.groupBy({
            fieldName: 'ReleaseDate', dir: SortingDirection.Asc, ignoreCase: false
        });
        fix.detectChanges();

        expectedHeight = parseInt(window.getComputedStyle(grid.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(groupArea.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridHeader.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridFooter.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridScroll.nativeElement).height, 10);

        expect(grid.calcHeight).toEqual(expectedHeight);
        // veirify width is recalculated
        const indentation = fix.debugElement.query(By.css('.igx-grid__header-indentation'));

        expect(grid.pinnedWidth).toEqual(parseInt(window.getComputedStyle(indentation.nativeElement).width, 10));
        expect(grid.unpinnedWidth).toEqual(400 - parseInt(window.getComputedStyle(indentation.nativeElement).width, 10) - grid.scrollSize);

        grid.clearGrouping();
        tick();
        fix.detectChanges();

        expectedHeight = parseInt(window.getComputedStyle(grid.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(groupArea.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridHeader.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridFooter.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridScroll.nativeElement).height, 10);

        expect(grid.calcHeight).toEqual(expectedHeight);
        expect(grid.pinnedWidth).toEqual(0);
        const expectedWidth = parseInt(grid.width, 10) - grid.scrollSize;
        expect(grid.unpinnedWidth).toEqual(expectedWidth);
    }));

    it('should expose tree structure to access groups', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        fix.detectChanges();
        grid.groupBy([
            { fieldName: 'Released', dir: SortingDirection.Asc, ignoreCase: false },
            { fieldName: 'Downloads', dir: SortingDirection.Asc, ignoreCase: false },
            { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false }
        ]);
        fix.detectChanges();

        // there should be 3 groups at top level
        const groupsRecords = grid.groupsRecords;
        expect(groupsRecords.length).toBe(3);
        expect(groupsRecords[0].value).toBeNull();
        expect(groupsRecords[0].expression.fieldName).toBe('Released');
        // the first group should have 1 sub group which has 1 subgroup too
        const fsubGroups = groupsRecords[0].groups;
        expect(fsubGroups.length).toBe(1);
        expect(fsubGroups[0].value).toBe(1000);
        expect(fsubGroups[0].expression.fieldName).toBe('Downloads');
        const fsubsubGroups = groupsRecords[0].groups[0].groups;
        expect(fsubsubGroups.length).toBe(1);
        expect(fsubsubGroups[0].value).toBe('Ignite UI for Angular');
        expect(fsubsubGroups[0].expression.fieldName).toBe('ProductName');

        expect(groupsRecords[2].value).toBe(true);
        expect(groupsRecords[2].expression.fieldName).toBe('Released');
        // the last group should have 4 sub group which has 1 subgroup
        const lsubGroups = groupsRecords[2].groups;
        expect(lsubGroups.length).toBe(4);
        expect(lsubGroups[0].value).toBeNull();
        expect(lsubGroups[0].expression.fieldName).toBe('Downloads');
        const lsubsubGroups = groupsRecords[2].groups[0].groups;
        expect(lsubsubGroups.length).toBe(1);
        expect(lsubsubGroups[0].value).toBe('Ignite UI for JavaScript');
        expect(lsubsubGroups[0].expression.fieldName).toBe('ProductName');
    }));

    it('should allows expanding/collapsing groups extracted from the groupRows tree', fakeAsync(() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        const grid = fix.componentInstance.instance;
        grid.primaryKey = 'ID';
        fix.detectChanges();
        grid.groupBy({ fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false });
        fix.detectChanges();

        let groupRows = grid.groupsRowList.toArray();
        let dataRows = grid.dataRowList.toArray();
        // verify groups and data rows count
        expect(groupRows.length).toEqual(3);
        expect(dataRows.length).toEqual(8);

        // toggle grouprow - collapse
        expect(groupRows[0].expanded).toEqual(true);
        grid.toggleGroup(grid.groupsRecords[0]);
        fix.detectChanges();
        expect(groupRows[0].expanded).toEqual(false);
        groupRows = grid.groupsRowList.toArray();
        dataRows = grid.dataRowList.toArray();
        expect(groupRows.length).toEqual(3);
        expect(dataRows.length).toEqual(4);
        // verify collapsed group sub records are not rendered

        for (const rec of groupRows[0].groupRow.records) {
            expect(grid.gridAPI.get_row_by_key(rec.ID)).toBeUndefined();
        }

        // toggle grouprow - expand
        grid.toggleGroup(grid.groupsRecords[0]);
        fix.detectChanges();
        expect(groupRows[0].expanded).toEqual(true);
        groupRows = grid.groupsRowList.toArray();
        dataRows = grid.dataRowList.toArray();
        expect(groupRows.length).toEqual(3);
        expect(dataRows.length).toEqual(8);

        // verify expanded group sub records are rendered
        for (const rec of groupRows[0].groupRow.records) {
            expect(grid.getRowByKey(rec.ID)).not.toBeUndefined();
        }
    }));

    it('should allow setting groupingExpressions and sortingExpressions initially.',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            fix.componentInstance.enableSorting = true;
            const grid = fix.componentInstance.instance;
            grid.sortingExpressions =
                [{ fieldName: 'Downloads', dir: SortingDirection.Asc, ignoreCase: false }];
            grid.groupingExpressions =
                [{ fieldName: 'Released', dir: SortingDirection.Asc, ignoreCase: false }];
            fix.detectChanges();

            expect(grid.sortingExpressions.length).toEqual(2);
            expect(grid.groupingExpressions.length).toEqual(1);

            const groupRows = grid.groupsRowList.toArray();

            expect(groupRows.length).toEqual(3);

            const chips = fix.nativeElement.querySelectorAll('igx-chip');
            checkChips(chips, grid.groupingExpressions, grid.sortingExpressions);

            const sortingIcon = fix.debugElement.query(By.css('.sort-icon'));
            expect(sortingIcon.nativeElement.textContent.trim()).toEqual(SORTING_ICON_ASC_CONTENT);
        }));

    it('should show horizontal scrollbar if column widths are equal to the grid width and a column is grouped.',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);

            const grid = fix.componentInstance.instance;

            grid.columnWidth = '200px';
            tick();
            fix.componentInstance.width = '1000px';
            tick();

            fix.detectChanges();

            const hScrBar = grid.scr.nativeElement;
            expect(hScrBar.hidden).toBe(true);

            grid.groupBy({
                fieldName: 'Downloads',
                dir: SortingDirection.Asc,
                ignoreCase: false
            });
            fix.detectChanges();
            expect(hScrBar.hidden).toBe(false);
        }));

    it('should allow changing the text of the drop area', async () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        fix.componentInstance.instance.dropAreaMessage = 'Drop area here!';
        await wait();
        fix.detectChanges();

        const groupDropArea = fix.debugElement.query(By.directive(IgxGroupAreaDropDirective));
        expect(groupDropArea.nativeElement.children[1].textContent).toEqual('Drop area here!');
    });

    it('should allow templating the drop area by passing template reference', async () => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        fix.componentInstance.currentDropArea = fix.componentInstance.dropAreaTemplate;
        await wait();
        fix.detectChanges();

        const groupDropArea = fix.debugElement.query(By.directive(IgxGroupAreaDropDirective));
        expect(groupDropArea.nativeElement.textContent.trim()).toEqual('Custom template');
    });

    it('should hide all the grouped columns when hideGroupedColumns option is initially set to "true"',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            grid.hideGroupedColumns = true;
            tick();
            fix.detectChanges();
            grid.groupBy([
                { fieldName: 'Downloads', dir: SortingDirection.Asc, ignoreCase: false },
                { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false }
            ]);
            tick();
            fix.detectChanges();
            // the two grouped columns should be hidden
            expect(grid.getColumnByName('Downloads').hidden).toBe(true);
            expect(grid.getColumnByName('ProductName').hidden).toBe(true);
            // these should be visible
            expect(grid.getColumnByName('ID').hidden).toBe(false);
            expect(grid.getColumnByName('ReleaseDate').hidden).toBe(false);
            expect(grid.getColumnByName('Released').hidden).toBe(false);
        }));

    it('should show all the grid columns when hideGroupedColumns option is set to "false" at runtime, after being "true" initially',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            grid.hideGroupedColumns = true;
            fix.detectChanges();
            grid.groupBy([
                { fieldName: 'Downloads', dir: SortingDirection.Asc, ignoreCase: false },
                { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false }
            ]);
            tick();
            fix.detectChanges();
            // the two grouped columns should be hidden initially
            expect(grid.getColumnByName('Downloads').hidden).toBe(true);
            expect(grid.getColumnByName('ProductName').hidden).toBe(true);
            grid.hideGroupedColumns = false;
            tick();
            fix.detectChanges();
            // all columns, whether grouped or ungrouped, should be visible
            expect(grid.getColumnByName('Downloads').hidden).toBe(false);
            expect(grid.getColumnByName('ProductName').hidden).toBe(false);
            expect(grid.getColumnByName('ID').hidden).toBe(false);
            expect(grid.getColumnByName('ReleaseDate').hidden).toBe(false);
            expect(grid.getColumnByName('Released').hidden).toBe(false);
        }));

    it('should hide the grouped columns when hideGroupedColumns option is set to "true" at runtime, after being "false" initially',
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.detectChanges();
            grid.groupBy([
                { fieldName: 'Downloads', dir: SortingDirection.Asc, ignoreCase: false },
                { fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: false }
            ]);
            tick();
            fix.detectChanges();
            // all columns, whether grouped or ungrouped, should be visible
            expect(grid.getColumnByName('Downloads').hidden).toBe(false);
            expect(grid.getColumnByName('ProductName').hidden).toBe(false);
            expect(grid.getColumnByName('ID').hidden).toBe(false);
            expect(grid.getColumnByName('ReleaseDate').hidden).toBe(false);
            expect(grid.getColumnByName('Released').hidden).toBe(false);
            grid.hideGroupedColumns = true;
            tick();
            fix.detectChanges();
            // the two grouped columns should now be hidden
            expect(grid.getColumnByName('Downloads').hidden).toBe(true);
            expect(grid.getColumnByName('ProductName').hidden).toBe(true);
        }));

    it(`should hide the grouped columns when hideGroupedColumns option is enabled,
    there are initially set groupingExpressions and columns are autogenareted`,
        fakeAsync(() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            fix.detectChanges();
            const grid = fix.componentInstance.instance;
            grid.hideGroupedColumns = true;
            grid.groupingExpressions = [
                { fieldName: 'Released', dir: SortingDirection.Asc }
            ];
            fix.detectChanges();
            expect(grid.getColumnByName('Released').hidden).toBe(true);
            const groupRows = grid.groupsRowList.toArray();

            expect(groupRows.length).toEqual(3);
        }));

    it('should update grouping expression when sorting a column first then grouping by it and changing sorting for it again',
        fakeAsync(/** height/width setter rAF */() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            const strategy = CustomSortingStrategy.instance();
            fix.componentInstance.enableSorting = true;
            fix.detectChanges();

            grid.sort({ fieldName: 'ID', dir: SortingDirection.Asc, ignoreCase: false, strategy });

            expect(grid.sortingExpressions)
                .toEqual([{ fieldName: 'ID', dir: SortingDirection.Asc, ignoreCase: false, strategy }]);
            expect(grid.groupingExpressions).toEqual([]);

            grid.groupBy({ fieldName: 'ID', dir: SortingDirection.Asc, ignoreCase: false, strategy });
            grid.sort({ fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false, strategy });

            expect(grid.sortingExpressions)
                .toEqual([{ fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false, strategy }]);
            expect(grid.groupingExpressions)
                .toEqual([{ fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false, strategy }]);
        }));

    it('should update grouping expression when sorting a column first then grouping by another and changing sorting for it',
        fakeAsync(/** height/width setter rAF */() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            const grid = fix.componentInstance.instance;
            fix.componentInstance.enableSorting = true;
            fix.detectChanges();

            grid.sort({ fieldName: 'Downloads', dir: SortingDirection.Asc, ignoreCase: false });
            grid.sort({ fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false });
            fix.detectChanges();
            expect(grid.sortingExpressions).toEqual([
                { fieldName: 'Downloads', dir: SortingDirection.Asc, ignoreCase: false, strategy: DefaultSortingStrategy.instance() },
                { fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false, strategy: DefaultSortingStrategy.instance() }
            ]);
            expect(grid.groupingExpressions).toEqual([]);

            grid.groupBy({
                fieldName: 'Released', dir: SortingDirection.Asc, ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            grid.sort({
                fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();
            expect(grid.sortingExpressions).toEqual([
                { fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false, strategy: DefaultSortingStrategy.instance() },
                { fieldName: 'Downloads', dir: SortingDirection.Asc, ignoreCase: false, strategy: DefaultSortingStrategy.instance() },
                { fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false, strategy: DefaultSortingStrategy.instance() }
            ]);
            expect(grid.groupingExpressions).toEqual([{
                fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            }]);
        }));

    it('should not be able to group by ColumnGroup', (async () => {
        const fix = TestBed.createComponent(MultiColumnHeadersWithGroupingComponent);
        const grid = fix.componentInstance.grid;
        fix.detectChanges();

        // Try to group by a column group
        const header = fix.debugElement.queryAll(By.css('.igx-grid__thead-title'))[0].nativeElement;
        UIInteractions.simulatePointerEvent('pointerdown', header, 10, 10);
        await wait();
        UIInteractions.simulatePointerEvent('pointermove', header, 150, 22);
        await wait(50);
        UIInteractions.simulatePointerEvent('pointermove', header, 100, 30);
        await wait(50);
        UIInteractions.simulatePointerEvent('pointerup', header, 100, 30);
        await wait(50);
        fix.detectChanges();

        // verify there is no grouping
        const groupRows = grid.groupsRowList.toArray();
        expect(groupRows.length).toBe(0);
        expect(grid.groupingExpressions).toEqual([]);
    }));

    it('should not show the group area if only columnGroups has property groupable set to true', (async () => {
        const fix = TestBed.createComponent(MultiColumnHeadersWithGroupingComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        grid.getColumnByName('ID').groupable = false;
        await wait(30);
        fix.detectChanges();

        const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');
        // verify group area is not rendered
        expect(gridElement.querySelectorAll('.igx-grid__grouparea').length).toEqual(0);
    }));

    it('should add title attribute to chips when column is grouped', fakeAsync(/** height/width setter rAF */() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();
        const exprs: ISortingExpression[] = [
            { fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: true },
            { fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: true }
        ];
        const grid = fix.componentInstance.instance;
        grid.groupBy(exprs);
        fix.detectChanges();
        const chips = fix.nativeElement.querySelectorAll('igx-chip');
        expect(chips[0].getAttribute('title')).toEqual('ProductName');
        expect(chips[1].getAttribute('title')).toEqual('Released');
    }));

    it('should not be able to group by ColumnGroup', (async () => {
        const fix = TestBed.createComponent(MultiColumnHeadersWithGroupingComponent);
        const grid = fix.componentInstance.grid;
        fix.detectChanges();

        // Try to group by a column group
        const header = fix.debugElement.queryAll(By.css('.igx-grid__thead-title'))[0].nativeElement;
        UIInteractions.simulatePointerEvent('pointerdown', header, 10, 10);
        await wait();
        UIInteractions.simulatePointerEvent('pointermove', header, 150, 22);
        await wait(50);
        UIInteractions.simulatePointerEvent('pointermove', header, 100, 30);
        await wait(50);
        UIInteractions.simulatePointerEvent('pointerup', header, 100, 30);
        await wait(50);
        fix.detectChanges();

        // verify there is no grouping
        const groupRows = grid.groupsRowList.toArray();
        expect(groupRows.length).toBe(0);
        expect(grid.groupingExpressions).toEqual([]);
    }));

    it('should not show the group area if only columnGroups has property groupable set to true', (async () => {
        const fix = TestBed.createComponent(MultiColumnHeadersWithGroupingComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        grid.getColumnByName('ID').groupable = false;
        await wait(30);
        fix.detectChanges();

        const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');
        // verify group area is not rendered
        expect(gridElement.querySelectorAll('.igx-grid__grouparea').length).toEqual(0);
    }));

    it('should add title attribute to chips when column is grouped', fakeAsync(/** height/width setter rAF */() => {
        const fix = TestBed.createComponent(DefaultGridComponent);
        fix.detectChanges();

        const exprs: ISortingExpression[] = [
            { fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: true },
            { fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: true }
        ];
        const grid = fix.componentInstance.instance;
        grid.groupBy(exprs);
        fix.detectChanges();

        const chips = fix.nativeElement.querySelectorAll('igx-chip');
        expect(chips[0].getAttribute('title')).toEqual('ProductName');
        expect(chips[1].getAttribute('title')).toEqual('Released');
    }));

    it('should order sorting expressions correctly when setting groupingExpressions runtime.',
        fakeAsync(/** height/width setter rAF */() => {
            const fix = TestBed.createComponent(DefaultGridComponent);
            fix.detectChanges();

            const sExprs: ISortingExpression[] = [
                { fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: true }
            ];
            const grid = fix.componentInstance.instance;
            grid.sortingExpressions = sExprs;

            fix.detectChanges();
            let dataRows = grid.dataRowList.toArray();
            expect(dataRows.length).toEqual(8);
            // verify data records order
            const expectedDataRecsOrder = [true, true, true, true, false, false, false, null];
            dataRows.forEach((row, index) => {
                expect(row.rowData.Released).toEqual(expectedDataRecsOrder[index]);
            });

            const grExprs: ISortingExpression[] = [
                { fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: true }
            ];
            grid.groupingExpressions = grExprs;
            fix.detectChanges();

            // check sorting expressions order - grouping should be applied first
            expect(grid.sortingExpressions.length).toBe(2);
            expect(grid.sortingExpressions[0]).toBe(grExprs[0]);
            expect(grid.sortingExpressions[1]).toBe(sExprs[0]);

            dataRows = grid.dataRowList.toArray();
            const expectedReleaseRecsOrder = [true, false, true, false, false, null, true, true];
            const expectedProductNameOrder = ['NetAdvantage', 'NetAdvantage', 'Ignite UI for JavaScript', 'Ignite UI for JavaScript',
                'Ignite UI for Angular', 'Ignite UI for Angular', '', null];
            dataRows.forEach((row, index) => {
                expect(row.rowData.Released).toEqual(expectedReleaseRecsOrder[index]);
                expect(row.rowData.ProductName).toEqual(expectedProductNameOrder[index]);
            });
        }));

    it('should apply custom comparer function when grouping by dragging a column into the group area', async () => {
        const fix = TestBed.createComponent(GroupableGridComponent);
        const grid = fix.componentInstance.instance;
        const year = new Date().getFullYear().toString();
        fix.detectChanges();
        await wait();

        grid.paging = false;
        grid.columns[1].groupingComparer = (a, b) => {
            if (a instanceof Date && b instanceof Date &&
                a.getFullYear() === b.getFullYear()) {
                return 0;
            }
            return DefaultSortingStrategy.instance().compareValues(a, b);
        };
        fix.detectChanges();

        const firstColumn = fix.debugElement.queryAll(By.directive(IgxColumnMovingDragDirective))[1];
        const directiveInstance = firstColumn.injector.get(IgxColumnMovingDragDirective);

        // Trigger initial pointer events on the element with igxDrag. When the drag begins the ghostElement should receive events.
        UIInteractions.simulatePointerEvent('pointerdown', firstColumn.nativeElement, 75, 30);
        await wait();
        UIInteractions.simulatePointerEvent('pointermove', firstColumn.nativeElement, 110, 30);
        await wait();

        expect(async () => {
            fix.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', directiveInstance.ghostElement, 250, 30);
            await wait();
        }).not.toThrow();

        fix.detectChanges();
        UIInteractions.simulatePointerEvent('pointerup', directiveInstance.ghostElement, 250, 30);
        await wait();

        const groupRows = fix.debugElement.queryAll(By.css('igx-grid-groupby-row'));

        expect(groupRows.length).toEqual(2);
        expect(grid.groupsRecords.length).toEqual(2);
        expect(grid.groupsRecords[1].records.length).toEqual(6);
        for (const record of grid.groupsRecords[1].records) {
            expect(record.ReleaseDate.getFullYear().toString()).toEqual(year);
        }
    });

    const clickAndSendInputElementValue = (element, text, fix) => {
        element.nativeElement.value = text;
        element.nativeElement.dispatchEvent(new Event('input'));
        fix.detectChanges();
        return fix.whenStable();
    };
});
@Component({
    template: `
        <igx-grid
            [(groupingExpressions)]='currentGroupingExpressions'
            [width]='width'
            [height]='height'
            [dropAreaTemplate]='currentDropArea'
            [data]="data"
            [autoGenerate]="true" (columnInit)="columnsCreated($event)" (onGroupingDone)="onGroupingDoneHandler($event)">
        </igx-grid>
        <ng-template #dropArea>
            <span> Custom template </span>
        </ng-template>
    `
})
export class DefaultGridComponent extends DataParent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;

    @ViewChild('dropArea', { read: TemplateRef, static: true })
    public dropAreaTemplate: TemplateRef<any>;

    public width = '800px';
    public height = null;
    public currentDropArea;

    public enableSorting = false;
    public enableFiltering = false;
    public enableResizing = false;
    public enableEditing = false;
    public enableGrouping = true;
    public currentSortExpressions;
    public currentGroupingExpressions = [];

    public columnsCreated(column: IgxColumnComponent) {
        column.sortable = this.enableSorting;
        column.filterable = this.enableFiltering;
        column.resizable = this.enableResizing;
        column.editable = this.enableEditing;
        column.groupable = this.enableGrouping;
    }
    public onGroupingDoneHandler(sortExpr) {
        this.currentSortExpressions = sortExpr;
    }
}

@Component({
    template: `
        <igx-grid
            [width]='width'
            [height]='height'
            [data]="data"
            [paging]="true">
            <igx-column [field]="'ID'" [header]="'ID'" [width]="200" [groupable]="true" [hasSummary]="false"></igx-column>
            <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" [width]="200" [groupable]="true" [hasSummary]="false"
                dataType="date"></igx-column>
            <igx-column [field]="'Downloads'" [header]="'Downloads'" [width]="200" [groupable]="true" [hasSummary]="false"
                dataType="number"></igx-column>
            <igx-column [field]="'ProductName'" [header]="'ProductName'" [width]="200" [groupable]="true" [hasSummary]="false"></igx-column>
            <igx-column [field]="'Released'" [header]="'Released'" [width]="200" [groupable]="true" [hasSummary]="false"></igx-column>
        </igx-grid>
    `
})
export class GroupableGridComponent extends DataParent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;

    public width = '800px';
    public height = '700px';
}

@Component({
    template: `
        <igx-grid
            [width]='width'
            [height]='height'
            [data]="data">
            <igx-column [field]="'ID'" [header]="'ID'" [width]="200" [groupable]="true" [hasSummary]="false"></igx-column>
            <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" [width]="200" [groupable]="true" [hasSummary]="false"></igx-column>
            <igx-column [field]="'Downloads'" [header]="'Downloads'" [width]="200" [groupable]="true" [hasSummary]="false"></igx-column>
            <igx-column [field]="'ProductName'" [header]="'ProductName'" [width]="200" [groupable]="true" [hasSummary]="false"></igx-column>
            <igx-column [field]="'Released'" [header]="'Is it Released'" [width]="200" [groupable]="true" [hasSummary]="false"></igx-column>
            <ng-template igxGroupByRow let-groupRow>
                <span>
                    Grouping by "{{groupRow.column.header}}".
                    Total items with value:{{ groupRow.value }} are {{ groupRow.records.length }}
                </span>
            </ng-template>
            <ng-template igxRowExpandedIndicator let-groupRow>
                <span>EXPANDED</span>
            </ng-template>
            <ng-template igxRowCollapsedIndicator let-groupRow>
                <span>COLLAPSED</span>
            </ng-template>

            <ng-template igxHeaderExpandedIndicator>
                <span>EXPANDED</span>
            </ng-template>
            <ng-template igxHeaderCollapsedIndicator>
                <span>COLLAPSED</span>
            </ng-template>
        </igx-grid>
    `
})
export class CustomTemplateGridComponent extends DataParent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;

    public width = '800px';
    public height = null;
}

@Component({
    template: `
        <igx-grid
            [width]='width'
            [height]='height'
            [data]="testData">
                <igx-column *ngFor="let c of columns" [field]="c.field" [header]="c.field" [width]="c.width">
                </igx-column>
        </igx-grid>
    `
})
export class GroupByDataMoreColumnsComponent extends DataParent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;

    public width = '800px';
    public height = null;
    public testData = [];

    public columns = [
        { field: 'A', width: 100 },
        { field: 'B', width: 100 },
        { field: 'C', width: 100 },
        { field: 'D', width: 100 },
        { field: 'E', width: 100 },
        { field: 'F', width: 100 },
        { field: 'H', width: 100 },
        { field: 'G', width: 100 },
        { field: 'K', width: 100 },
        { field: 'L', width: 100 },
        { field: 'M', width: 100 },
        { field: 'N', width: 100 }
    ];
}

@Component({
    template: `
        <igx-grid
            [width]='width'
            [autoGenerate]='false'
            [data]='data'>
            <igx-column [width]='width' [groupable]="true">
                <ng-template igxCell>
                    <button>Dummy button</button>
                </ng-template>
            </igx-column>
        </igx-grid>
    `
})
export class GroupByEmptyColumnFieldComponent extends DataParent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;
    public width = '200px';
}

export class CustomSortingStrategy extends DefaultSortingStrategy {
}

@Component({
    template: `
        <igx-grid #gridGroupByRowCustomSelectors
            [width]='width'
            [height]='height'
            [data]="data">
            <igx-column [field]="'ID'" [header]="'ID'" [width]="200" [groupable]="true" [hasSummary]="false"></igx-column>
            <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" [width]="200" [groupable]="true" [hasSummary]="false"
                dataType="date"></igx-column>
            <igx-column [field]="'Downloads'" [header]="'Downloads'" [width]="200" [groupable]="true" [hasSummary]="false"
                dataType="number"></igx-column>
            <igx-column [field]="'ProductName'" [header]="'ProductName'" [width]="200" [groupable]="true" [hasSummary]="false"></igx-column>
            <igx-column [field]="'Released'" [header]="'Released'" [width]="200" [groupable]="true" [hasSummary]="false"></igx-column>
            <ng-template igxGroupByRowSelector let-context>
                <igx-checkbox (click)="onGroupByRowClick($event, context)" hidden='true'></igx-checkbox>
                <p>Selected rows in the group: {{context.selectedCount}};<p>
                <p>Total rows in the group: {{context.totalCount}};<p>
                <p>Group Row instance: {{context.groupRow}};<p>
            </ng-template>
        </igx-grid>
    `
})
export class GridGroupByRowCustomSelectorsComponent extends DataParent {
    @ViewChild('gridGroupByRowCustomSelectors', { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;

    public width = '800px';
    public height = '700px';
    public onGroupByRowClick(_event, _context) {}
}
