import { Component, TemplateRef, ViewChild, Input, AfterViewInit, ChangeDetectorRef, QueryList, ViewChildren, OnInit } from '@angular/core';
import { IgxGridCellComponent } from '../grids/cell.component';
import { IgxDateSummaryOperand, IgxNumberSummaryOperand, IgxSummaryResult } from '../grids/summaries/grid-summary';
import { IGridCellEventArgs, IGridEditEventArgs } from '../grids/common/events';
import { IgxGridTransaction } from '../grids/grid-base.directive';
import {
    BasicGridComponent, BasicGridSearchComponent, GridAutoGenerateComponent,
    GridNxMComponent, GridWithSizeComponent, PagingComponent
} from './grid-base-components.spec';
import { IGridSelection } from './grid-interfaces.spec';
import { SampleTestData, DataParent } from './sample-test-data.spec';
import { ColumnDefinitions, GridTemplateStrings, EventSubscriptions } from './template-strings.spec';
import { IgxColumnComponent } from '../grids/columns/column.component';
import { IgxTransactionService } from '../services/public_api';
import { IgxFilteringOperand, IgxNumberFilteringOperand } from '../data-operations/filtering-condition';
import { ExpressionUI } from '../grids/filtering/grid-filtering.service';
import { IFilteringExpressionsTree, FilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { FilteringStrategy } from '../data-operations/filtering-strategy';
import { IgxGridComponent } from '../grids/grid/public_api';
import { IgxRowEditTabStopDirective } from '../grids/grid.rowEdit.directive';
import { IgxGridExcelStyleFilteringComponent } from '../grids/filtering/excel-style/grid.excel-style-filtering.component';
import { FilteringLogic } from '../data-operations/filtering-expression.interface';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { ISortingStrategy } from '../data-operations/sorting-strategy';
import { IgxActionStripComponent } from '../action-strip/action-strip.component';

@Component({
    template: `<div style="width: 800px; height: 600px;">
            ${GridTemplateStrings.declareGrid('[autoGenerate]="autoGenerate"', '', ColumnDefinitions.indexAndValue)}</div>`
})
export class GridInDivComponent extends GridAutoGenerateComponent {
    public data = SampleTestData.oneItemNumberData();
    public autoGenerate = false;
}

@Component({
    template: GridTemplateStrings.declareGrid(` width="500px"`, '', ColumnDefinitions.pinnedTwoOfFour)
})
export class PinningAndResizingComponent extends BasicGridComponent {
    public data = SampleTestData.personIDNameRegionData();
}

@Component({
    template: GridTemplateStrings.declareGrid(` width="600px" height="600px" [autoGenerate]="false"`, '',
        ColumnDefinitions.pinnedThreeOfEight)
})
export class LargePinnedColGridComponent extends BasicGridComponent {
    public data = SampleTestData.generateProductData(75);
}

@Component({
    template: GridTemplateStrings.declareGrid('',
        EventSubscriptions.columnResized,
        ColumnDefinitions.gridFeatures)
})
export class SortingAndResizingComponent extends BasicGridComponent {

    public count = 0;
    public column;
    public prevWidth;
    public newWidth;

    public data = SampleTestData.productInfoData();

    public columnResized(event) {
        this.count++;
        this.column = event.column;
        this.prevWidth = event.prevWidth;
        this.newWidth = event.newWidth;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(` [height]="'800px'"`, '',
        ColumnDefinitions.resizableColsComponent)
})
export class ResizableColumnsComponent extends BasicGridComponent {

    public columns = [
        { field: 'ID', resizable: true, maxWidth: 200, minWidth: 70 },
        { field: 'CompanyName', resizable: true },
        { field: 'ContactName', resizable: true },
        { field: 'ContactTitle', resizable: true },
        { field: 'Address', resizable: true },
        { field: 'City', resizable: true },
        { field: 'Region', resizable: true },
        { field: 'PostalCode', resizable: true },
        { field: 'Phone', resizable: true },
        { field: 'Fax', resizable: true }
    ];

    public data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: GridTemplateStrings.declareGrid(` [height]="'800px'"`, '',
        ColumnDefinitions.iterableComponent)
})
export class ColumnsFromIterableComponent extends BasicGridComponent {

    public columns = ['ID', 'Name'];
    public data = SampleTestData.personIDNameData();
}

@Component({
    template: GridTemplateStrings.declareGrid('', '',
        ColumnDefinitions.columnTemplates)
})
export class TemplatedColumnsComponent extends BasicGridComponent {
    @ViewChild('newHeader', { read: TemplateRef, static: true })
    public newHeaderTemplate: TemplateRef<any>;

    @ViewChild('newCell', { read: TemplateRef, static: true })
    public newCellTemplate: TemplateRef<any>;

    public data = SampleTestData.personIDNameData();
}

@Component({
    template: GridTemplateStrings.declareGrid('', '',
        `<igx-column field="ID" [hidden]="true"></igx-column>`)
})
export class ColumnHiddenFromMarkupComponent extends BasicGridComponent {
    public data = SampleTestData.personIDNameData();
}

@Component({
    template: `
        <igx-grid #grid1 [data]="data" [columnPinning]='true' [width]="'900px'" [height]="'600px'">
            <igx-column *ngFor="let c of columns" [field]="c.field"
                [header]="c.field"
                [movable]="c.movable"
                [width]="c.width"
                [editable]="true"
                [pinned]="c.pinned"
                [dataType]="c.type">
            </igx-column>
        </igx-grid>
    `
})
export class GridAddColumnComponent extends BasicGridComponent implements OnInit {
    public columns: Array<any>;
    public data = SampleTestData.contactInfoDataFull();
    public ngOnInit(): void {
        this.columns = [
            { field: 'ID', width: 150, movable: true, type: 'string', pinned: true },
            { field: 'CompanyName', width: 150, movable: true, type: 'string' },
            { field: 'ContactName', width: 150, movable: true, type: 'string' },
            { field: 'ContactTitle', width: 150, movable: true, type: 'string' },
            { field: 'Address', width: 150, movable: true, type: 'string' }];
    }
}

@Component({
    template: GridTemplateStrings.declareGrid('', '',
        ColumnDefinitions.idNameFormatter)
})
export class ColumnCellFormatterComponent extends BasicGridComponent {
    public data = SampleTestData.personIDNameData();

    public multiplier(value: number): string {
        return `${value * value}`;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(` height="500px"`, '',
        ColumnDefinitions.productFilterable)
})
export class FilteringComponent extends BasicGridComponent {
    public data = SampleTestData.productInfoData();
}

@Component({
    template: GridTemplateStrings.declareGrid(
        ` #gridSelection3 [primaryKey]="'ID'" [width]="'800px'" [height]="'600px'" [autoGenerate]="true" [rowSelection]="'multiple'"`,
        '', '')
})
export class SelectionComponent extends BasicGridComponent {
    public data = SampleTestData.generateBigValuesData(20);
}

@Component({
    template: GridTemplateStrings.declareGrid(
        ` [width]="width" [height]="height" [rowSelection]="'multiple'" [primaryKey]="'ProductID'" [selectedRows]="selectedRows"`,
        '', ColumnDefinitions.productBasicNumberID, '', '<igx-paginator *ngIf="paging"></igx-paginator>')
})
export class RowSelectionComponent extends BasicGridComponent {
    public data = SampleTestData.foodProductDataExtended();
    public width = '800px';
    public height = '600px';
    public selectedRows = [];
    public paging = false;
}

@Component({
    template: GridTemplateStrings.declareGrid(
        ` [width]="width" [height]="height" [selectRowOnClick]="false" [rowSelection]="'multiple'"
            [primaryKey]="'ProductID'" [selectedRows]="selectedRows"`,
        '', ColumnDefinitions.productBasicNumberID)
})
export class RowSelectionWithDisabledSelectRowOnClickComponent extends BasicGridComponent {
    public data = SampleTestData.foodProductDataExtended();
    public width = '800px';
    public height = '600px';
    public selectedRows = [];
}

@Component({
    template: GridTemplateStrings.declareGrid(
        ` [width]="width" [height]="height" [rowSelection]="'single'" [primaryKey]="'ProductID'"`,
        '', ColumnDefinitions.productBasicNumberID)
})
export class SingleRowSelectionComponent extends BasicGridComponent {
    public data = SampleTestData.foodProductDataExtended();
    public width = '800px';
    public height = '600px';
}

@Component({
    template: GridTemplateStrings.declareGrid(
        ` [width]="width" [height]="height" [rowSelection]="'multiple'"`,
        '',
        ColumnDefinitions.idFirstLastNameSortable)
})

export class RowSelectionWithoutPrimaryKeyComponent extends BasicGridComponent {
    public data = SampleTestData.personIDNameRegionData();
    public width = '800px';
    public height = '600px';
}
@Component({
    template: GridTemplateStrings.declareGrid(
        ` rowSelection = "multiple"`,
        EventSubscriptions.rowSelected,
        ColumnDefinitions.productBasic)
})
export class SelectionCancellableComponent extends BasicGridComponent {
    public data = SampleTestData.foodProductData();

    public rowSelected(evt) {
        if (evt.added.length > 0 && (evt.added[0].ProductID) % 2 === 0) {
            evt.newSelection = evt.oldSelection || [];
        }
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(
        ` #gridSelection3
            [primaryKey]="'ID'"
            [width]="'800px'"
            [height]="'600px'"
            [autoGenerate]="true"
            rowSelection = "multiple"`,
        '', '')
})
export class ScrollsComponent extends BasicGridComponent {
    public data = SampleTestData.generateBigDataRowsAndCols(16, 16);
}

@Component({
    template: GridTemplateStrings.declareGrid(
        ` [primaryKey]="'ID'"
          [width]="'900px'"
          [height]="'900px'"
          [columnWidth]="'200px'"`,
        '', ColumnDefinitions.idNameJobTitleCompany)
})
export class NoScrollsComponent extends GridWithSizeComponent {
    public data = SampleTestData.personIDNameJobCompany();
}

@Component({
    template: GridTemplateStrings.declareGrid(
        ` rowSelection = "multiple"`,
        '', ColumnDefinitions.productDefaultSummaries)
})
export class SummariesComponent extends BasicGridComponent {
    public data = SampleTestData.foodProductData();
}

class DealsSummaryMinMax extends IgxNumberSummaryOperand {
    constructor() {
        super();
    }

    public operate(summaries?: any[]): IgxSummaryResult[] {
        const result = super.operate(summaries).filter((obj) => {
            if (obj.key === 'min' || obj.key === 'max') {
                const summaryResult = obj.summaryResult;
                // apply formatting to float numbers
                if (Number(summaryResult) === summaryResult) {
                    obj.summaryResult = summaryResult.toLocaleString('en-us', { maximumFractionDigits: 2 });
                }
                return obj;
            }
        });
        return result;
    }
}
@Component({
    template: GridTemplateStrings.declareGrid(
        `  [primaryKey]="'ProductID'" [height]="null" [allowFiltering]="true"`,
        '', ColumnDefinitions.productDefaultSummaries)
})
export class SummaryColumnComponent extends BasicGridComponent {
    public data = SampleTestData.foodProductData();
    public hasSummary = true;

    public numberSummary = new IgxNumberSummaryOperand();
    public dateSummary = new IgxDateSummaryOperand();
    public dealsSummaryMinMax = DealsSummaryMinMax;
}

@Component({
    template: GridTemplateStrings.declareGrid(
        ` [width]="width" [height]="height"`,
        '', ColumnDefinitions.productDefaultSummaries)
})
export class VirtualSummaryColumnComponent extends BasicGridComponent {
    public data = SampleTestData.foodProductDataExtended();

    public width = '800px';
    public height = '600px';

    public numberSummary = new IgxNumberSummaryOperand();
    public dateSummary = new IgxDateSummaryOperand();

    public scrollTop(newTop: number) {
        const vScrollbar = this.grid.verticalScrollContainer.getScroll();
        vScrollbar.scrollTop = newTop;
    }

    public scrollLeft(newLeft: number) {
        const hScrollbar = this.grid.headerContainer.getScroll();
        hScrollbar.scrollLeft = newLeft;
    }
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.productBasic)
})
export class ProductsComponent extends BasicGridComponent {
    public data = SampleTestData.foodProductData();
}

@Component({
    template: GridTemplateStrings.declareGrid(` style="margin-bottom: 20px;"`,
        EventSubscriptions.columnInit,
        ColumnDefinitions.generatedWithSummaries)
})
export class DefaultSizeAndSummaryComponent extends BasicGridComponent {
    public columns = [];

    public columnInit(column) {
        switch (this.grid.columnList.length) {
            case 5:
                if (column.index === 0 || column.index === 4) {
                    column.width = '200px';
                }
                break;
            case 30:
                if (column.index === 0 || column.index === 5 || column.index === 3 || column.index === 10 || column.index === 25) {
                    column.width = '200px';
                }
                break;
            case 150:
                if (column.index === 0 || column.index === 5 || column.index === 3 || column.index === 10 || column.index === 50) {
                    column.width = '500px';
                }
                break;
        }
    }

    public isHorizonatScrollbarVisible() {
        const scrollbar = this.grid.headerContainer.getScroll();
        return scrollbar.offsetWidth < (scrollbar.children[0] as HTMLElement).offsetWidth;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(` [autoGenerate]="autoGenerate"`,
        EventSubscriptions.columnInit, ColumnDefinitions.generatedWithDataType)
})
export class NxMWithSummaryComponent extends GridNxMComponent {
    public columnsType = 'number';
    public columnInit(column) {
        column.hasSummary = true;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(` [autoGenerate]="autoGenerate"`,
        EventSubscriptions.columnInit, ColumnDefinitions.generatedEditable)
})
export class NxMWithSummaryEditableComponent extends NxMWithSummaryComponent {
    public hasEditableColumns = true;
    public startFromOne = true;
}

@Component({
    template: GridTemplateStrings.declareGrid(` [autoGenerate]="autoGenerate"`,
        EventSubscriptions.columnInit, '')
})
export class NxMColumnWidthAndSummaryComponent extends NxMWithSummaryComponent {
    public columnInit(column) {
        switch (this.grid.columnList.length) {
            case 5:
                if (column.index === 0 || column.index === 4) {
                    column.width = '200px';
                }
                break;
            case 30:
                if (column.index === 0 || column.index === 5 || column.index === 3 || column.index === 10 || column.index === 25) {
                    column.width = '200px';
                }
                break;
            case 150:
                if (column.index === 0 || column.index === 5 || column.index === 3 || column.index === 10 || column.index === 50) {
                    column.width = '500px';
                }
                break;
        }
    }
}

@Component({
    template: GridTemplateStrings.declareGrid('',
        EventSubscriptions.columnInit,
        ColumnDefinitions.generatedEditable)
})
export class Grid5x5WithSummariesComponent extends NxMWithSummaryEditableComponent {
    public colsCount = 5;
    public rowsCount = 5;
}
// export class Summaries5x5Component extends BasicGridComponent {
//     public columns = [];

//     constructor() {
//         super();
//         this.columns = SampleTestData.generateEditableColumns(5, 'number');
//         this.data = SampleTestData.generateDataForColumns(this.columns, 5, true);
//     }

//     init(column) {
//         column.hasSummary = true;
//     }
// }

@Component({
    template: GridTemplateStrings.declareGrid('',
        EventSubscriptions.columnInit,
        ColumnDefinitions.generatedWithDataType)
})
export class Grid10x30WithSummariesComponent extends NxMWithSummaryComponent {
    public colsCount = 10;
    public rowsCount = 30;
}
// export class Summaries10x30Component extends SummariesNxMComponent {
//     constructor() {
//         super(30, 10, 'number');
//     }
// }

@Component({
    template: GridTemplateStrings.declareGrid(` [width]="'1500px'"`,
        EventSubscriptions.columnInit,
        ColumnDefinitions.generatedWithDataType)
})
export class Grid30x1000WithSummariesComponent extends NxMWithSummaryComponent {
    public colsCount = 30;
    public rowsCount = 1000;
}
// export class Summaries30x1000Component extends SummariesNxMComponent {
//     constructor() {
//         super(1000, 30, 'number');
//     }
// }

@Component({
    template: GridTemplateStrings.declareGrid(` [width]="'1500px'"`,
        EventSubscriptions.columnInit,
        ColumnDefinitions.generatedWithDataType)
})
export class Grid150x200WithSummariesComponent extends NxMWithSummaryComponent {
    public colsCount = 150;
    public rowsCount = 200;
}
// export class Summaries150x200Component extends SummariesNxMComponent {
//     constructor() {
//         super(200, 150, 'number');
//     }
// }

@Component({
    template: `
    <div style="width: 800px; height: 600px;">
        <igx-grid #grid [data]="data" [autoGenerate]="true" [height]="width" [width]="height">
        </igx-grid>
    </div>`
})
export class WidthAndHeightComponent extends BasicGridComponent {
    public width: string;
    public height: string;

    public data = SampleTestData.generateData(30, 3);
}

@Component({
    template: `
    <div style="height: 200px; overflow: auto;">
        <igx-grid #grid [data]="data" [autoGenerate]="true" [height]="null">
        </igx-grid>
    </div>`
})
export class NullHeightComponent extends BasicGridComponent {
    public data = SampleTestData.generateData(20, 5);
}

@Component({
    template: `
        <igx-grid
            [data]="data"
            ${EventSubscriptions.rowAdded}
            ${EventSubscriptions.rowDeleted}
            ${EventSubscriptions.onEditDone}
            [autoGenerate]="true">
        </igx-grid>
    `
})
export class DefaultCRUDGridComponent extends BasicGridComponent {
    public rowsAdded = 0;
    public rowsDeleted = 0;

    public rowAdded() {
        this.rowsAdded++;
    }

    public rowDeleted() {
        this.rowsDeleted++;
    }

    public editDone(event: IGridEditEventArgs) {
        if (event.newValue === 'change') {
            event.newValue = event.cellID ? 200 : { index: 200, value: 200 };
        }
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(` [paging]="paging" [perPage]="perPage"`,
        '', ColumnDefinitions.idNameJobTitleEditable) + `
        <button id="prevPageBtn" igxButton (click)="GoToPage(-2)">Prev page</button>
        <button id="nextPageBtn" igxButton (click)="GoToPage(-1)">Next page</button>
        <button id="idxPageBtn" igxButton (click)="GoToPage(2)">Go to 3rd page</button>
        `
})
export class PagingAndEditingComponent extends PagingComponent {
    public perPage = 4;

    public GoToPage(val) {
        switch (val) {
            case -2:
                this.grid.previousPage();
                break;
            case -1:
                this.grid.nextPage();
                break;
            default:
                this.grid.paginate(val);
                break;
        }
    }
}

@Component({
    template: GridTemplateStrings.declareGrid('', '',
        ColumnDefinitions.idNameHiddenJobHirePinned)
})
export class GridSearchHiddenColumnsComponent extends BasicGridSearchComponent {
    public data = SampleTestData.personJobData();
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.idFirstLastNameSortable)
})
export class GridDeclaredColumnsComponent extends BasicGridComponent {
    @ViewChild('nameColumn', { static: true }) public nameColumn;

    public data = SampleTestData.personIDNameRegionData();
}

@Component({
    template: GridTemplateStrings.declareGrid(` [autoGenerate]="autoGenerate" [height]="height" [width]="width"`,
        `${EventSubscriptions.columnInit}${EventSubscriptions.selected}`, '')
})
export class PinOnInitAndSelectionComponent extends GridWithSizeComponent {
    public data = SampleTestData.contactInfoDataFull();
    public width = '800px';
    public height = '300px';

    public selectedCell;
    public columnInit(column) {
        if (column.field === 'CompanyName' || column.field === 'ContactName') {
            column.pinned = true;
        }
        column.width = '200px';
    }

    public cellSelected(event) {
        this.selectedCell = event.cell;
    }
}

@Component({
    template: `
        <igx-grid
            [width]='"800px"'
            [height]='"500px"'
            [data]="data"
            [autoGenerate]="false">
            <igx-column-layout *ngFor='let group of colGroups' [pinned]='group.pinned'>
                <igx-column *ngFor='let col of group.columns'
                [rowStart]="col.rowStart" [colStart]="col.colStart" [width]='col.width'
                [colEnd]="col.colEnd" [rowEnd]="col.rowEnd" [field]='col.field'></igx-column>
            </igx-column-layout>
        </igx-grid>
    `
})
export class GridPinningMRLComponent extends PinOnInitAndSelectionComponent {
    public colGroups = [
        {
            field: 'group1',
            group: 'group1',
            pinned: true,
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1 },
                { field: 'CompanyName', rowStart: 1, colStart: 2 },
                { field: 'ContactName', rowStart: 1, colStart: 3 },
                { field: 'ContactTitle', rowStart: 2, colStart: 1, rowEnd: 4, colEnd: 4 },
            ]
        },
        {
            field: 'group2',
            group: 'group2',
            columns: [
                { field: 'Country', rowStart: 1, colStart: 1, colEnd: 4, rowEnd: 3 },
                { field: 'Region', rowStart: 3, colStart: 1 },
                { field: 'PostalCode', rowStart: 3, colStart: 2 },
                { field: 'Fax', rowStart: 3, colStart: 3 }
            ]
        }
    ];
}

@Component({
    template: GridTemplateStrings.declareGrid(` [height]="height" [width]="width"`,
        `${EventSubscriptions.selected}${EventSubscriptions.columnPin}`,
        ColumnDefinitions.generatedWithWidth)
})
export class PinningComponent extends GridWithSizeComponent
    implements IGridSelection {

    public column: IgxColumnComponent;
    public columns = [
        { field: 'ID', width: 100 },
        { field: 'CompanyName', width: 300 },
        { field: 'ContactName', width: 200 },
        { field: 'ContactTitle', width: 200 },
        { field: 'Address', width: 300 },
        { field: 'City', width: 100 },
        { field: 'Region', width: 100 },
        { field: 'PostalCode', width: 100 },
        { field: 'Phone', width: 150 },
        { field: 'Fax', width: 150 }
    ];

    public data = SampleTestData.contactMariaAndersData();
    public width = '800px';
    public height = '300px';

    public selectedCell: IgxGridCellComponent;
    public cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }

    public columnPinning($event) {
        $event.insertAtIndex = 0;
    }
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.productFilterSortPin)
})
export class GridFeaturesComponent extends BasicGridComponent {
    public data = SampleTestData.productInfoData();

}

@Component({
    template: GridTemplateStrings.declareGrid(
        ` columnWidth="200" `,
        '', ColumnDefinitions.idNameJobHireDate, '', '<igx-paginator *ngIf="paging"></igx-paginator>')
})
export class ScrollableGridSearchComponent extends BasicGridSearchComponent {
    public data = SampleTestData.generateFromData(SampleTestData.personJobDataFull(), 30);
    public paging = false;
}

@Component({
    template: GridTemplateStrings.declareGrid(
        ` columnWidth="200" [height]="null" `,
        '', ColumnDefinitions.idNameJobTitleCompany, '', '<igx-paginator *ngIf="paging"></igx-paginator>')
})
export class GroupableGridSearchComponent extends ScrollableGridSearchComponent {
    public data = SampleTestData.personIDNameJobCompany();
    public paging = false;
}

@Component({
    template: GridTemplateStrings.declareGrid(
        ` [height]="height" [width]="width" [columnWidth]="columnWidth" `,
        '', ColumnDefinitions.productAllColumnFeatures)
})
export class GridAllFeaturesComponent extends GridWithSizeComponent {
    @Input()
    public columnWidth = 200;

}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.nameJobTitleId)
})
export class ReorderedColumnsComponent extends BasicGridComponent {
    public data = SampleTestData.personJobData();
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.idNameJobTitleEditable)
})
export class GridIDNameJobTitleComponent extends PagingComponent {
    public data = SampleTestData.personJobDataFull();
    public width = '100%';
    public height = '100%';
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.idNameJobHoursHireDatePerformance)
})
export class GridIDNameJobTitleHireDataPerformanceComponent extends BasicGridComponent {
    public data = SampleTestData.personJobHoursDataPerformance();
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.hireDate)
})
export class GridHireDateComponent extends BasicGridComponent {
    public data = SampleTestData.hireDate();
}

@Component({
    template: `<div style="margin: 50px;">
            ${GridTemplateStrings.declareGrid(
        `[height]="height" [width]="width" [rowSelection]="rowSelection" [autoGenerate]="autoGenerate"`,
        EventSubscriptions.columnMovingStart + EventSubscriptions.columnMoving + EventSubscriptions.columnMovingEnd,
        ColumnDefinitions.movableColumns)}</div>`
})
export class MovableColumnsComponent extends BasicGridComponent {
    public data = SampleTestData.personIDNameRegionData();
    public autoGenerate = false;
    public rowSelection = 'none';
    public isFilterable = false;
    public isSortable = false;
    public isResizable = false;
    public isEditable = false;
    public isHidden = false;
    public isGroupable = false;
    public width = '500px';
    public height = '300px';
    public count = 0;
    public countStart = 0;
    public countEnd = 0;
    public cancel = false;
    public source: IgxColumnComponent;
    public target: IgxColumnComponent;

    public columnMovingStarted(event) {
        this.countStart++;
        this.source = event.source;
    }

    public columnMoving(event) {
        this.count++;
        this.source = event.source;

        if (this.cancel) {
            event.cancel = true;
        }
    }

    public columnMovingEnded(event) {
        this.countEnd++;
        this.source = event.source;
        this.target = event.target;

        if (event.target.field === 'Region') {
            event.cancel = true;
        }
    }
}

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="300px" width="500px"`, '', ColumnDefinitions.movableColumns)}`
})
export class MovableTemplatedColumnsComponent extends BasicGridComponent {
    public data = SampleTestData.personIDNameRegionData();
    public isFilterable = false;
    public isSortable = false;
    public isResizable = false;
}

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="300px" width="500px" [autoGenerate]="autoGenerate" [paging]="paging"`,
        EventSubscriptions.columnInit, '')}`
})
export class MovableColumnsLargeComponent extends GridAutoGenerateComponent {

    public data = SampleTestData.contactInfoDataFull();

    public width = '500px';
    public height = '400px';
    public paging = false;

    public columnInit(column: IgxColumnComponent) {
        column.movable = true;
        column.sortable = true;
        column.width = '100px';
    }

    public pinColumn(name: string) {
        const col = this.grid.getColumnByName(name);
        col.pinned = !col.pinned;
    }
}

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="800px"`, '', ColumnDefinitions.multiColHeadersColumns)}`
})
export class MultiColumnHeadersComponent extends BasicGridComponent {
    public data = SampleTestData.contactInfoDataFull();
    public isPinned = false;
}

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="800px"  width="500px"`, '',
        ColumnDefinitions.multiColHeadersWithGroupingColumns)}`
})
export class MultiColumnHeadersWithGroupingComponent extends BasicGridComponent {
    public data = SampleTestData.contactInfoDataFull();
    public isPinned = false;
}


@Component({
    template: `${GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.nameAvatar)}`
})
export class GridWithAvatarComponent extends GridWithSizeComponent {
    public data = SampleTestData.personAvatarData();
    public height = '500px';
}


@Component({
    template: `${GridTemplateStrings.declareGrid(`height="1000px"  width="900px" [primaryKey]="'ID'"`, '',
        ColumnDefinitions.summariesGroupByColumns, '', '<igx-paginator *ngIf="paging"></igx-paginator>')}`
})
export class SummariesGroupByComponent extends BasicGridComponent {
    public data = SampleTestData.employeeGroupByData();
    public calculationMode = 'rootAndChildLevels';
    public ageSummary = AgeSummary;
    public ageSummaryTest = AgeSummaryTest;
    public paging = false;
}

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="600px"  width="900px" [primaryKey]="'ID'"`, '',
        ColumnDefinitions.summariesGroupByTansColumns)}`,
    providers: [{ provide: IgxGridTransaction, useClass: IgxTransactionService }]
})
export class SummariesGroupByTransactionsComponent extends BasicGridComponent {
    public data = SampleTestData.employeeGroupByData();
    public calculationMode = 'rootAndChildLevels';
    public ageSummary = AgeSummary;
    public ageSummaryMinMax = DealsSummaryMinMax;
}

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="800px"  width="400px" [primaryKey]="'ID'"`, '',
        ColumnDefinitions.summariesGroupByColumns)}`
})
export class SummariesGroupByWithScrollsComponent extends BasicGridComponent {
    public data = SampleTestData.employeeGroupByData();
    public calculationMode = 'rootAndChildLevels';
    public ageSummary = AgeSummary;
    public ageSummaryTest = AgeSummaryTest;
}

class AgeSummary extends IgxNumberSummaryOperand {
    constructor() {
        super();
    }

    public operate(summaries?: any[]): IgxSummaryResult[] {
        const result = super.operate(summaries).filter((obj) => {
            if (obj.key === 'average' || obj.key === 'sum' || obj.key === 'count') {
                const summaryResult = obj.summaryResult;
                // apply formatting to float numbers
                if (Number(summaryResult) === summaryResult) {
                    obj.summaryResult = summaryResult.toLocaleString('en-us', { maximumFractionDigits: 2 });
                }
                return obj;
            }
        });
        return result;
    }
}

class AgeSummaryTest extends IgxNumberSummaryOperand {
    constructor() {
        super();
    }

    public operate(summaries?: any[]): IgxSummaryResult[] {
        const result = super.operate(summaries);
        result.push({
            key: 'test',
            label: 'Test',
            summaryResult: summaries.filter(rec => rec > 10 && rec < 40).length
        });

        return result;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(`[height]="gridHeight" [columnWidth]="defaultWidth" [width]="gridWidth"`,
        `${EventSubscriptions.selected}`, ColumnDefinitions.generatedWithWidth)
})
export class VirtualGridComponent extends BasicGridComponent {
    public gridWidth = '800px';
    public gridHeight = '300px';
    public defaultWidth = '200px';
    public columns = [
        { field: 'index' },
        { field: 'value' },
        { field: 'other' },
        { field: 'another' }
    ];
    public selectedCell: IgxGridCellComponent;
    constructor() {
        super();
        this.data = this.generateData(1000);
    }
    public generateCols(numCols: number, defaultColWidth = null) {
        const cols = [];
        for (let j = 0; j < numCols; j++) {
            cols.push({
                field: j.toString(),
                width: defaultColWidth || (j % 8 < 2 ? 100 : (j % 6) * 125)
            });
        }
        return cols;
    }
    public generateData(numRows: number) {
        const data = [];
        for (let i = 0; i < numRows; i++) {
            const obj = {};
            for (let j = 0; j < this.columns.length; j++) {
                const col = this.columns[j].field;
                obj[col] = 10 * i * j;
            }
            data.push(obj);
        }
        return data;
    }
    public cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }
    public scrollTop(newTop: number) {
        this.grid.verticalScrollContainer.getScroll().scrollTop = newTop;
    }
    public scrollLeft(newLeft: number) {
        this.grid.headerContainer.getScroll().scrollLeft = newLeft;
    }
}
@Component({
    template: GridTemplateStrings.declareGrid(
        ` [primaryKey]="'ID'"`,
        '', ColumnDefinitions.idNameJobHireWithTypes)
})
export class GridWithPrimaryKeyComponent extends BasicGridSearchComponent {
    public data = SampleTestData.personJobDataFull();
}

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="300px"  width="600px" [primaryKey]="'ID'"`, '',
        ColumnDefinitions.selectionWithScrollsColumns, '', '<igx-paginator *ngIf="paging"></igx-paginator>')}`,
})
export class SelectionWithScrollsComponent extends BasicGridComponent {
    public data = SampleTestData.employeeGroupByData();
    public paging = false;
}

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="300px"  width="600px" [primaryKey]="'ID'" cellSelection="none"`, '',
        ColumnDefinitions.selectionWithScrollsColumns)}`,
})
export class CellSelectionNoneComponent extends BasicGridComponent {
    public data = SampleTestData.employeeGroupByData();
}

@Component({
    template: `${GridTemplateStrings.declareGrid(`height="300px"  width="600px" [primaryKey]="'ID'" cellSelection="single"`, '',
        ColumnDefinitions.selectionWithScrollsColumns)}`,
})
export class CellSelectionSingleComponent extends BasicGridComponent {
    public data = SampleTestData.employeeGroupByData();
}
@Component({
    template: `${GridTemplateStrings.declareGrid(`height="300px"  width="600px" [primaryKey]="'ID'"`, '',
        ColumnDefinitions.selectionWithScrollsColumns)}`,
    providers: [{ provide: IgxGridTransaction, useClass: IgxTransactionService }]
})
export class SelectionWithTransactionsComponent extends BasicGridComponent {
    public data = SampleTestData.employeeGroupByData();
}

export class CustomFilter extends IgxFilteringOperand {
    private constructor() {
        super();
        this.operations = [{
            name: 'custom',
            isUnary: false,
            logic: (target: string): boolean => target === 'custom',
            iconName: 'custom'
        }];
    }
}
@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]="true">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true"
            [filterable]="false" [resizable]="resizable"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [filterable]="filterable" [resizable]="resizable" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable" [resizable]="resizable" dataType="boolean"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            [filterable]="filterable" [resizable]="resizable" dataType="date">
        </igx-column>
        <igx-column width="100px" [field]="'ReleaseDateTime'" [header]="'ReleaseDateTime'" headerClasses="header-release-date-time"
            [filterable]="filterable" [resizable]="resizable" dataType="dateTime">
        </igx-column>
        <igx-column width="100px" [field]="'ReleaseTime'" [header]="'ReleaseTime'" headerClasses="header-release-time"
            [filterable]="filterable" [resizable]="resizable" dataType="time">
        </igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" [filterable]="filterable"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`
})
export class IgxGridFilteringComponent extends BasicGridComponent {
    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;

    public data = SampleTestData.excelFilteringData();
    public activateFiltering(activate: boolean) {
        this.grid.allowFiltering = activate;
        this.grid.cdr.markForCheck();
    }
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]="true">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true"
            [filterable]="false" [resizable]="resizable"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [filterable]="filterable" [resizable]="resizable" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable" [resizable]="resizable" dataType="boolean"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            [filterable]="filterable" [resizable]="resizable" dataType="date">
        </igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" [filterable]="filterable"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`
})
export class IgxGridDatesFilteringComponent extends BasicGridComponent {
    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;

    public data = SampleTestData.excelFilteringData().map(rec => {
        const newRec = Object.assign({}, rec) as any;
        newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.toISOString() : null;
        return newRec;
    });
    public activateFiltering(activate: boolean) {
        this.grid.allowFiltering = activate;
        this.grid.cdr.markForCheck();
    }
}

@Component({
    template: `
    <igx-grid-excel-style-filtering #esf style="height: 700px; width: 350px">
    </igx-grid-excel-style-filtering>
    <igx-grid #grid1 [data]="data" height="500px">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true"
            [filterable]="false" [resizable]="resizable"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [sortable]="true"
            [filterable]="filterable" [resizable]="resizable" dataType="string" [selectable]="false"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable"
            [selectable]="false" [resizable]="resizable" dataType="boolean"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            [filterable]="filterable" [resizable]="resizable" dataType="date">
        </igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" [filterable]="filterable"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`
})
export class IgxGridExternalESFComponent extends BasicGridComponent implements AfterViewInit {
    @ViewChild('esf', { read: IgxGridExcelStyleFilteringComponent, static: true })
    public esf: IgxGridExcelStyleFilteringComponent;

    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;

    public data = SampleTestData.excelFilteringData();

    constructor() {
        super();
    }

    public ngAfterViewInit(): void {
        this.esf.column = this.grid.getColumnByName('ProductName');
    }
}

export class CustomFilterStrategy extends FilteringStrategy {
    constructor() {
        super();
    }

    public findMatchByExpression(rec, expr): boolean {
        const cond = expr.condition;
        const val = this.getFieldValue(rec, expr.fieldName);
        const ignoreCase = expr.fieldName === 'JobTitle' ? false : true;
        return cond.logic(val, expr.searchVal, ignoreCase);
    }

    public filter<T>(data: T[], expressionsTree: IFilteringExpressionsTree): T[] {
        return super.filter(data, expressionsTree, null, null);
    }

    public getFieldValue(rec, fieldName: string): any {
        return fieldName === 'Name' ? rec[fieldName]['FirstName'] : rec[fieldName];
    }
}

@Component({
    template: `<igx-grid [data]="data" height="500px" width="600px" [allowFiltering]="true">
        <igx-column [field]="'ID'" [header]="'ID'" [filterable]="false"></igx-column>
        <igx-column width="100px" [field]="'Name'" [filterable]="filterable">
            <ng-template igxCell let-val>
                <span>{{val.FirstName}}</span>
            </ng-template>
        </igx-column>
        <igx-column [field]="'JobTitle'" [filterable]="filterable" ></igx-column>
        <igx-column [field]="'Company'" [filterable]="filterable" ></igx-column>
    </igx-grid>`
})
export class CustomFilteringStrategyComponent extends BasicGridComponent {
    public strategy = new CustomFilterStrategy();
    public filterable = true;

    public data = SampleTestData.personNameObjectJobCompany();
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]="true"
                         [filterMode]="'excelStyleFilter'" [uniqueColumnValuesStrategy]="columnValuesStrategy">
        <igx-column width="100px" [field]="'ID'"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" dataType="date">
        </igx-column>
    </igx-grid>`
})
export class IgxGridFilteringESFLoadOnDemandComponent extends BasicGridComponent {
    public data = SampleTestData.excelFilteringData();
    public doneCallbackCounter = 0;

    private _filteringStrategy = new FilteringStrategy();

    public columnValuesStrategy = (column: IgxColumnComponent,
        columnExprTree: IFilteringExpressionsTree,
        done: (uniqueValues: any[]) => void) => {
        setTimeout(() => {
            const filteredData = this._filteringStrategy.filter(this.data, columnExprTree, null, null);
            const columnValues = filteredData.map(record => record[column.field]);
            done(columnValues);
            this.doneCallbackCounter++;
        }, 1000);
    };
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]="true" [filterMode]="'excelStyleFilter'">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true"
            [filterable]="false" [resizable]="resizable" [sortable]="'true'" [movable]="'true'"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [filterable]="filterable" [resizable]="resizable" dataType="string"
            [sortable]="'true'" [movable]="'true'"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"
            [sortable]="'true'" [movable]="'true'"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable" [resizable]="resizable" dataType="boolean"
            [sortable]="'true'" [movable]="'true'"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            [filterable]="filterable" [resizable]="resizable" dataType="date" [sortable]="'true'" [movable]="'true'">
        </igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" [filterable]="filterable"
            dataType="string" [filters]="customFilter" [sortable]="'true'" [movable]="'true'">
        </igx-column>

        <igx-grid-excel-style-filtering [minHeight]="'0px'" [maxHeight]="'500px'">
            <igx-excel-style-column-operations>Column Operations Template</igx-excel-style-column-operations>
            <igx-excel-style-filter-operations>Filter Operations Template</igx-excel-style-filter-operations>
        </igx-grid-excel-style-filtering>
    </igx-grid>`
})
export class IgxGridFilteringESFEmptyTemplatesComponent extends BasicGridComponent {
    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;
    public data = SampleTestData.excelFilteringData();
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]="true" [filterMode]="'excelStyleFilter'">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true"
            [filterable]="false" [resizable]="resizable" [sortable]="'true'" [movable]="'true'"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [filterable]="filterable" [resizable]="resizable" dataType="string"
            [sortable]="'true'" [movable]="'true'"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"
            [sortable]="'true'" [movable]="'true'"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable" [resizable]="resizable" dataType="boolean"
            [sortable]="'true'" [movable]="'true'"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            [filterable]="filterable" [resizable]="resizable" dataType="date" [sortable]="'true'" [movable]="'true'">
        </igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" [filterable]="filterable"
            dataType="string" [filters]="customFilter" [sortable]="'true'" [movable]="'true'">
        </igx-column>

        <ng-template igxExcelStyleHeaderIcon>
            <igx-icon>filter_alt</igx-icon>
        </ng-template>

        <igx-grid-excel-style-filtering [minHeight]="'0px'" [maxHeight]="'500px'">
            <igx-excel-style-column-operations>
                <igx-excel-style-moving></igx-excel-style-moving>
                <igx-excel-style-pinning></igx-excel-style-pinning>
            </igx-excel-style-column-operations>
            <igx-excel-style-filter-operations>
                <igx-excel-style-search></igx-excel-style-search>
            </igx-excel-style-filter-operations>
        </igx-grid-excel-style-filtering>
    </igx-grid>`
})
export class IgxGridFilteringESFTemplatesComponent extends BasicGridComponent {
    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;
    public data = SampleTestData.excelFilteringData();
}

@Component({
    template: `
    <igx-grid-excel-style-filtering #esf style="height: 700px; width: 350px">
        <igx-excel-style-column-operations>
            <igx-excel-style-selecting></igx-excel-style-selecting>
        </igx-excel-style-column-operations>
        <igx-excel-style-filter-operations>Filter Operations Template</igx-excel-style-filter-operations>
    </igx-grid-excel-style-filtering>
    <igx-grid #grid1 [data]="data" height="500px">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true"
            [filterable]="false" [resizable]="resizable"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [sortable]="true"
            [filterable]="filterable" [resizable]="resizable" dataType="string" [selectable]="false"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable"
            [selectable]="false" [resizable]="resizable" dataType="boolean"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            [filterable]="filterable" [resizable]="resizable" dataType="date">
        </igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" [filterable]="filterable"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`
})
export class IgxGridExternalESFTemplateComponent extends BasicGridComponent implements OnInit {
    @ViewChild('esf', { read: IgxGridExcelStyleFilteringComponent, static: true })
    public esf: IgxGridExcelStyleFilteringComponent;

    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;

    public data = SampleTestData.excelFilteringData();

    constructor() {
        super();
    }

    public ngOnInit(): void {
        this.esf.column = this.grid.getColumnByName('Downloads');
    }
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]="true">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true"
            [filterable]="false" [resizable]="resizable"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [filterable]="filterable" [resizable]="resizable" dataType="string"
                    [filterCellTemplate]="filterTemplate"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"
                    [filterCellTemplate]="filterTemplate"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable" [resizable]="resizable" dataType="boolean"
                    [filterCellTemplate]="filterTemplate"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
                    [filterable]="filterable" [resizable]="resizable" dataType="date" [filterCellTemplate]="filterTemplate">
        </igx-column>
        <igx-column width="100px" field="Licensed" [filterable]="filterable"
                    [resizable]="resizable" dataType="boolean">
        </igx-column>
    </igx-grid>
    <ng-template #filterTemplate igxFilterCellTemplate let-column="column">
        <div class="custom-filter" style="flex-grow: 1;">
            <igx-input-group class="filter-input" type="box">
                <igx-prefix>
                    <igx-icon>search</igx-icon>
                </igx-prefix>
                <input #input igxInput tabindex="0" placeholder="Filter..." />
                <igx-suffix tabindex="0">
                    <igx-icon>clear</igx-icon>
                </igx-suffix>
            </igx-input-group>
        </div>
    </ng-template>
    `
})
export class IgxGridFilteringTemplateComponent extends BasicGridComponent {
    public resizable = false;
    public filterable = true;

    public data = SampleTestData.excelFilteringData();
}

@Component({
    template: `<igx-grid [data]="data" height="500px" width="500px" [allowFiltering]="true">
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" dataType="number" [filterable]="false"></igx-column>
        <igx-column [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            dataType="date">
        </igx-column>
        <igx-column [field]="'AnotherField'" [header]="'Another Field'"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`
})
export class IgxGridFilteringScrollComponent extends IgxGridFilteringComponent { }

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]="true">
    <igx-column-group header="General Information" field='General'>
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column-group header="Details" field='Details'>
            <igx-column [field]="'Downloads'" dataType="number" [filterable]="false"></igx-column>
            <igx-column [field]="'Released'" dataType="boolean"></igx-column>
            <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
                dataType="date">
            </igx-column>
        </igx-column-group>
    </igx-column-group>
        <igx-column [field]="'AnotherField'" [header]="'Another Field'"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`
})
export class IgxGridFilteringMCHComponent extends IgxGridFilteringComponent { }

@Component({
    template:
        `
    <igx-grid #grid1 [data]="data" height="500px" width="500px" [allowFiltering]="true">
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" dataType="number" [filterable]="false"></igx-column>
        <igx-column [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            dataType="date">
        </igx-column>
        <igx-column [field]="'AnotherField'" [header]="'Another Field'"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>
    <igx-excel-style-date-expression *ngIf="grid1.columns.length > 0"
                                     [column]="grid1.columns[4]"
                                     [grid]="grid1"
                                     [expressionUI]="exprUI"
                                     [expressionsList]="exprList">
    </igx-excel-style-date-expression>`
})
export class IgxTestExcelFilteringDatePickerComponent extends IgxGridFilteringComponent implements AfterViewInit {
    public exprUI: ExpressionUI;
    public exprList: Array<ExpressionUI>;

    constructor(private cd: ChangeDetectorRef) {
        super();

        this.exprUI = new ExpressionUI();
        this.exprUI.expression = {
            fieldName: 'ReleaseDate',
            condition: {
                name: 'equals',
                isUnary: false,
                iconName: 'equals',
                logic: () => true
            },
        };

        this.exprList = [this.exprUI];
    }

    public ngAfterViewInit() {
        this.cd.detectChanges();
    }
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowAdvancedFiltering]="true">
        <igx-grid-toolbar></igx-grid-toolbar>
        <igx-column width="100px" [field]="'ID'" [header]="'HeaderID'" [hasSummary]="true"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" dataType="number" [hasSummary]="true"></igx-column>
        <igx-column width="100px" [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" dataType="date" headerClasses="header-release-date"></igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`
})
export class IgxGridAdvancedFilteringComponent extends BasicGridComponent {
    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;

    public data = SampleTestData.excelFilteringData();
    public activateFiltering(activate: boolean) {
        this.grid.allowFiltering = activate;
        this.grid.cdr.markForCheck();
    }
}

@Component({
    template: `
    <igx-grid #grid1 [data]="data" height="400px">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" dataType="date" headerClasses="header-release-date"></igx-column>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>
    <igx-advanced-filtering-dialog [grid]="grid1">
    </igx-advanced-filtering-dialog>`
})
export class IgxGridExternalAdvancedFilteringComponent extends BasicGridComponent {
    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;

    public data = SampleTestData.excelFilteringData();
}

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowAdvancedFiltering]="true" [showToolbar]="true">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" dataType="number" [hasSummary]="true"></igx-column>
        <igx-column-group header="Released Group">
            <igx-column width="100px" [field]="'Released'" dataType="boolean"></igx-column>
            <igx-column width="100px" [field]="'ReleaseDate'" dataType="date" headerClasses="header-release-date"></igx-column>
        </igx-column-group>
        <igx-column width="100px" [field]="'AnotherField'" [header]="'Another Field'" dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`
})
export class IgxGridAdvancedFilteringColumnGroupComponent extends BasicGridComponent {
    public customFilter = CustomFilter.instance();
    public resizable = false;
    public filterable = true;

    public data = SampleTestData.excelFilteringData();
    public activateFiltering(activate: boolean) {
        this.grid.allowFiltering = activate;
        this.grid.cdr.markForCheck();
    }
}

@Component({
    template: `
    <igx-grid [data]="data" height="500px" width="500px">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column width="100px" [field]="'ProductName'" [editable]="true" [header]="'ProductNameHeader'"
            [formatter]="formatter"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [editable]="true" dataType="number" [header]="'Downloads'"></igx-column>
        <igx-column width="100px" [field]="'Released'" [editable]="true" dataType="boolean" [header]="'Released'"></igx-column>
        <igx-column width="100px" [field]="'ReleaseDate'" [header]="'ReleaseDate'" dataType="date"></igx-column>
        <igx-paginator *ngIf='grid.paging'></igx-paginator>
    </igx-grid>`
})
export class IgxGridClipboardComponent extends BasicGridComponent {
    public data = SampleTestData.excelFilteringData();
    public formatter = (value: any) => `** ${value} **`;
}

@Component({
    template: GridTemplateStrings.declareGrid(`id="testGridSum" [height]="height" [width]="width"`, ``,
        ColumnDefinitions.generatedWithDataType)
})
export class DynamicColumnsComponent extends GridWithSizeComponent {
    public columns = [
        { field: 'ID', width: 100, dataType: 'string' },
        { field: 'CompanyName', width: 300, dataType: 'string' },
        { field: 'ContactName', width: 200, dataType: 'string' },
        { field: 'ContactTitle', width: 200, dataType: 'string' },
        { field: 'Address', width: 300, dataType: 'string' },
        { field: 'City', width: 100, dataType: 'string' },
        { field: 'Region', width: 100, dataType: 'string' }
    ];

    public data = SampleTestData.contactInfoDataFull();
    public width = '800px';
    public height = '800px';
}

@Component({
    template: `
    <igx-grid #gridCustomSelectors [primaryKey]="'ID'" [data]="data" [rowSelection]="'multiple'" [autoGenerate]="false">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column width="100px" [field]="'CompanyName'"></igx-column>
        <igx-column width="100px" [field]="'ContactName'" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'ContactTitle'" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Address'" dataType="string"></igx-column>
        <igx-paginator></igx-paginator>
        <ng-template igxRowSelector let-rowContext>
            <span class="rowNumber">{{ rowContext.index }}</span>
            <igx-checkbox [checked]="rowContext.selected" (click)="onRowCheckboxClick($event, rowContext)"></igx-checkbox>
        </ng-template>
        <ng-template igxHeadSelector let-headContext>
            <igx-checkbox [checked]="headContext.totalCount === headContext.selectedCount"
                (click)="onHeaderCheckboxClick($event, headContext)"></igx-checkbox>
        </ng-template>
    </igx-grid>`
})
export class GridCustomSelectorsComponent extends BasicGridComponent implements OnInit {
    @ViewChild('gridCustomSelectors', { static: true })
    public grid: IgxGridComponent;
    public ngOnInit(): void {
        this.data = SampleTestData.contactInfoDataFull();
    }

    public onRowCheckboxClick(event, rowContext) {
        event.stopPropagation();
        event.preventDefault();
        if (rowContext.selected) {
            this.grid.deselectRows([rowContext.rowID]);
        } else {
            this.grid.selectRows([rowContext.rowID]);
        }
    }

    public onHeaderCheckboxClick(event, headContext) {
        event.stopPropagation();
        event.preventDefault();
        if (headContext.selected) {
            this.grid.deselectAllRows();
        } else {
            this.grid.selectAllRows();
        }
    }
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" width="900px" height="600px" [rowEditable]="true">
        <igx-grid-toolbar *ngIf="showToolbar"></igx-grid-toolbar>
        <igx-column field="ProductID" header="Product ID" [editable]="false" width="200px"></igx-column>
        <igx-column field="ReorderLevel" header="Reorder Lever" [dataType]="'number'" [editable]="true" width="100px">
        </igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" [editable]="true" [sortable]="true" width="200px">
        </igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'date'" [editable]="true" width="200px"></igx-column>
        <igx-paginator *ngIf="paging"></igx-paginator>
    </igx-grid>`
})
export class IgxGridRowEditingComponent extends BasicGridComponent {
    public showToolbar = false;
    public paging = false;
    public data = SampleTestData.foodProductData();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" width="700px" height="400px" [rowEditable]="true">
        <igx-column>
            <ng-template igxCell let-cell="cell" let-val>
                <button>Delete</button>
            </ng-template>
        </igx-column>
        <igx-column field="ProductID" header="Product ID"></igx-column>
        <igx-column field="ReorderLevel" header="Reorder Lever" [dataType]="'number'" [editable]="true" width="100px"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" width="150px"></igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'date'" width="150px" [editable]="false"></igx-column>
    </igx-grid>`
})
export class IgxGridRowEditingWithoutEditableColumnsComponent extends BasicGridComponent {
    public data = SampleTestData.foodProductData();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ID'" width="700px" height="400px" [rowEditable]="true">
        <igx-column
        field="Downloads" header="Downloads" [dataType]="'number'" [pinned]="pinnedFlag" [editable]="true">
        </igx-column>
        <igx-column field="ID" header="ID" [dataType]="'number'"
        [editable]="false" [pinned]="pinnedFlag" [hidden]="hiddenFlag" width="60px">
        </igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" [editable]="false" [hidden]="hiddenFlag" width="150px">
        </igx-column>
        <igx-column field="ReleaseDate" header="Release Date" [dataType]="'date'" [editable]="true" [hidden]="hiddenFlag" width="150px">
        </igx-column>
        <igx-column-group [movable]="true" header="Column Group 1" *ngIf="columnGroupingFlag">
            <igx-column field="Released" header="Released" [dataType]="'boolean'" [pinned]="pinnedFlag" [editable]="true" width="100px">
            </igx-column>
            <igx-column field="Category" header="Category" [dataType]="'string'" [editable]="false" [hidden]="hiddenFlag" width="150px">
            </igx-column>
        </igx-column-group>
        <ng-container *ngIf="!columnGroupingFlag">
            <igx-column field="Released" header="Released" [dataType]="'boolean'" [pinned]="pinnedFlag" [editable]="true" width="100px">
            </igx-column>
            <igx-column field="Category" header="Category" [dataType]="'string'" [editable]="true" [hidden]="hiddenFlag" width="150px">
            </igx-column>
        </ng-container>
        <igx-column field="Items" header="Items" [dataType]="'string'" [editable]="true" width="150px">
        </igx-column>
        <igx-column field="Test" header="Test" [dataType]="'string'" [editable]="true" [hidden]="hiddenFlag" width="150px">
        </igx-column>
    </igx-grid>`
})
export class IgxGridWithEditingAndFeaturesComponent extends BasicGridComponent {
    /* Data fields: Downloads:number, ID: number, ProductName: string, ReleaseDate: Date,
                Released: boolean, Category: string, Items: string, Test: string. */
    public pinnedFlag = false;
    public hiddenFlag = false;
    public columnGroupingFlag = false;
    public data = SampleTestData.generateProductData(11);
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" width="700px" height="400px" [rowEditable]="true">
        <igx-column field="ProductID" header="Product ID"></igx-column>
        <igx-column field="ReorderLevel" header="Reorder Lever" [dataType]="'number'" [editable]="true" width="100px"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" width="150px"></igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'date'" width="150px" [editable]="false"></igx-column>
        <ng-template igxRowEdit let-rowChangesCount="rowChangesCount" let-endEdit="endEdit">
            <div class="igx-banner__message">
                <span class="igx-banner__text">{{ rowChangesCount }} </span>
            </div>
            <div class="igx-banner__actions">
                <div class="igx-banner__row">
                    <button igxButton igxRowEditTabStop (click)="endEdit(false)">Cancel</button>
                    <button igxButton igxRowEditTabStop (click)="endEdit(true)">Done</button>
                </div>
            </div>
        </ng-template>
    </igx-grid>
    `
})
export class IgxGridCustomOverlayComponent extends BasicGridComponent {
    @ViewChildren(IgxRowEditTabStopDirective) public buttons: QueryList<IgxRowEditTabStopDirective>;
    public data = SampleTestData.foodProductData();

    public get gridAPI() {
        return this.grid.gridAPI;
    }

    public get cellInEditMode() {
        return this.grid.gridAPI.crudService.cell;
    }

    public getCurrentEditCell(): IgxGridCellComponent {
        const grid = this.grid as any;
        const currentCell = grid.gridAPI.crudService.cell;
        return this.grid.getCellByColumn(currentCell.id.rowIndex, currentCell.column.field);
    }

    public moveNext(shiftKey: boolean): void {
        this.grid.navigation.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'tab',
            code: 'tab',
            shiftKey
        }));
    }
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" width="700px" height="400px" [rowEditable]="true">
        <igx-column field="ProductID" header="Product ID"></igx-column>
        <igx-column field="ReorderLevel" header="Reorder Lever" [dataType]="'number'" [editable]="true" width="100px"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" width="150px"></igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'date'" width="150px" [editable]="false"></igx-column>
        <ng-template igxRowEdit >
        </ng-template>
    </igx-grid>
    `
})
export class IgxGridEmptyRowEditTemplateComponent extends BasicGridComponent {
    public data = SampleTestData.foodProductData();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" width="900px" height="900px" [rowEditable]="true" >
        <igx-column field="ProductID" header="Product ID" width="150px"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" width="200px"></igx-column>
        <igx-column field="InStock" header="In Stock" [dataType]="'boolean'" width="100px"></igx-column>
        <igx-column field="UnitsInStock" header="Units in Stock" [dataType]="'number'" width="150px"></igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'date'" width="200px"></igx-column>
        <igx-paginator *ngIf='paging' [perPage]="7"></igx-paginator>
    </igx-grid>`,
    providers: [{ provide: IgxGridTransaction, useClass: IgxTransactionService }],
})
export class IgxGridRowEditingTransactionComponent extends BasicGridComponent {
    public data = SampleTestData.foodProductData();
    public paging = false;
}


@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" width="900px" height="900px" [paging]="paging" [perPage]="7">
        <igx-column field="ProductID" header="Product ID" width="150px"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" width="200px"></igx-column>
        <igx-column field="InStock" header="In Stock" [dataType]="'boolean'" width="100px"></igx-column>
        <igx-column field="UnitsInStock" header="Units in Stock" [dataType]="'currency'" width="150px"></igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'date'" width="200px"></igx-column>
    </igx-grid>`,
    providers: [{ provide: IgxGridTransaction, useClass: IgxTransactionService }],
})
export class IgxGridCurrencyColumnComponent extends BasicGridComponent {
    public data = SampleTestData.foodProductData();
    public paging = false;
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" width="900px" height="900px">
        <igx-column field="ProductID" header="Product ID" width="150px"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" width="200px"></igx-column>
        <igx-column field="InStock" header="In Stock" [dataType]="'boolean'" width="100px"></igx-column>
        <igx-column field="UnitsInStock" header="Units in Stock" [dataType]="'currency'" width="150px"></igx-column>
        <igx-column field="Discount" header="Order Date" [dataType]="'percent'" width="200px"></igx-column>
    </igx-grid>`,
    providers: [{ provide: IgxGridTransaction, useClass: IgxTransactionService }],
})
export class IgxGridPercentColumnComponent extends BasicGridComponent {
    public data = SampleTestData.foodPercentProductData();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [primaryKey]="'ProductID'" width="900px" height="900px" [paging]="paging" [perPage]="7">
        <igx-column field="ProductID" header="Product ID" width="150px"></igx-column>
        <igx-column field="ProductName" header="Product Name" [dataType]="'string'" width="200px"></igx-column>
        <igx-column field="OrderDate" header="Order Date" [dataType]="'dateTime'" width="250px"></igx-column>
        <igx-column field="ReceiveTime" header="Receive Time" [dataType]="'time'" width="200px"></igx-column>
        <igx-column field="InStock" header="In Stock" [dataType]="'boolean'" width="100px"></igx-column>
        <igx-column field="UnitsInStock" header="Units in Stock" [dataType]="'currency'" width="150px"></igx-column>
    </igx-grid>`,
    providers: [{ provide: IgxGridTransaction, useClass: IgxTransactionService }],
})
export class IgxGridDateTimeColumnComponent extends BasicGridComponent {
    public data = SampleTestData.foodProductDateTimeData();
    public paging = false;
}

@Component({
    template: `
        <igx-grid
            [width]='width'
            [height]='height'
            [data]="data"
            [autoGenerate]="true" (columnInit)="columnsCreated($event)" (onGroupingDone)="onGroupingDoneHandler($event)"
            [rowEditable]="enableRowEditing">
        </igx-grid>
        <ng-template #dropArea>
            <span> Custom template </span>
        </ng-template>
    `
})
export class IgxGridRowEditingWithFeaturesComponent extends DataParent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild('dropArea', { read: TemplateRef, static: true })
    public dropAreaTemplate: TemplateRef<any>;

    public width = '800px';
    public height = null;

    public enableSorting = false;
    public enableFiltering = false;
    public enableResizing = false;
    public enableEditing = true;
    public enableGrouping = true;
    public enableRowEditing = true;
    public currentSortExpressions;

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
            [columnWidth] = "'100px'"
            [autoGenerate]="true" (columnInit)="columnsCreated($event)" (onGroupingDone)="onGroupingDoneHandler($event)"
            [rowEditable]="enableRowEditing">
        </igx-grid>
        <ng-template #dropArea>
            <span> Custom template </span>
        </ng-template>
    `
})
export class IgxGridGroupByComponent extends DataParent implements OnInit {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild('dropArea', { read: TemplateRef, static: true })
    public dropAreaTemplate: TemplateRef<any>;

    public width = '600px';
    public height = '600px';

    public enableSorting = false;
    public enableFiltering = false;
    public enableResizing = false;
    public enableEditing = true;
    public enableGrouping = true;
    public enableRowEditing = false;
    public currentSortExpressions;

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

    public ngOnInit() {
        this.grid.groupingExpressions = [
            { fieldName: 'ProductName', dir: SortingDirection.Desc }
        ];
    }
}

@Component({
    template: `
        <igx-grid [data]="data">
            <igx-column [editable]="true" field="fullName"></igx-column>
            <igx-column field="age" [editable]="true" [dataType]="'number'"></igx-column>
            <igx-column field="isActive" [editable]="true" [dataType]="'boolean'"></igx-column>
            <igx-column field="birthday" [editable]="true" [dataType]="'date'"></igx-column>
            <igx-column [editable]="true" field="personNumber" [dataType]="'number'"></igx-column>
        </igx-grid>
    `
})
export class CellEditingTestComponent extends BasicGridComponent {
    public data = [
        { personNumber: 0, fullName: 'John Brown', age: 20, isActive: true, birthday: new Date('08/08/2001') },
        { personNumber: 1, fullName: 'Ben Affleck', age: 30, isActive: false, birthday: new Date('08/08/1991') },
        { personNumber: 2, fullName: 'Tom Riddle', age: 50, isActive: true, birthday: new Date('08/08/1961') }
    ];
}

@Component({
    template: `
        <igx-grid [data]="data" width="300px" height="250px">
            <igx-column [editable]="true" field="firstName"></igx-column>
            <igx-column [editable]="true" field="lastName"></igx-column>
            <igx-column field="age" [editable]="true" [dataType]="'number'"></igx-column>
            <igx-column field="isActive" [editable]="true" [dataType]="'boolean'"></igx-column>
            <igx-column field="birthday" [editable]="true" [dataType]="'date'"></igx-column>
            <igx-column field="fullName" [editable]="true"></igx-column>
        </igx-grid>
        <button class="btnTest">Test</button>
    `
})
export class CellEditingScrollTestComponent extends BasicGridComponent {
    public data = [
        { firstName: 'John', lastName: 'Brown', age: 20, isActive: true, birthday: new Date('08/08/2001'), fullName: 'John Brown' },
        { firstName: 'Ben', lastName: 'Hudson', age: 30, isActive: false, birthday: new Date('08/08/1991'), fullName: 'Ben Hudson' },
        { firstName: 'Tom', lastName: 'Riddle', age: 50, isActive: true, birthday: new Date('08/08/1967'), fullName: 'Tom Riddle' },
        { firstName: 'John', lastName: 'David', age: 27, isActive: true, birthday: new Date('08/08/1990'), fullName: 'John David' },
        { firstName: 'David', lastName: 'Affleck', age: 36, isActive: false, birthday: new Date('08/08/1982'), fullName: 'David Affleck' },
        { firstName: 'Jimmy', lastName: 'Johnson', age: 57, isActive: true, birthday: new Date('08/08/1961'), fullName: 'Jimmy Johnson' },
        { firstName: 'Martin', lastName: 'Brown', age: 31, isActive: true, birthday: new Date('08/08/1987'), fullName: 'Martin Brown' },
        { firstName: 'Tomas', lastName: 'Smith', age: 81, isActive: false, birthday: new Date('08/08/1931'), fullName: 'Tomas Smith' },
        { firstName: 'Michael', lastName: 'Parker', age: 48, isActive: true, birthday: new Date('08/08/1970'), fullName: 'Michael Parker' }
    ];
}

@Component({
    template: GridTemplateStrings.declareGrid(
        ` [width]="width" [height]="height" [paging]="'true'" [perPage]="perPage" [primaryKey]="'ProductID'"`,
        '', ColumnDefinitions.productBasic, '', '<igx-paginator></igx-paginator>' )
})
export class GridWithUndefinedDataComponent implements OnInit {
    @ViewChild(IgxGridComponent, { static: true })
    public grid: IgxGridComponent;
    public data;
    public perPage = 5;
    public width = '800px';
    public height = '600px';

    public ngOnInit(): void {
        setTimeout(() => {
            this.data = SampleTestData.foodProductDataExtended();
        }, 300);
    }
}

@Component({
    template: `
    <igx-grid #grid [data]="data" height="500px" width="1300px" columnWidth="100px">
        <igx-column field="ID"></igx-column>
        <igx-column-group header="General Information" [collapsible]="generalInfCollapsible" [expanded]="generalInfExpanded">
            <igx-column  field="CompanyName" [visibleWhenCollapsed]="companyNameVisibleWhenCollapse"></igx-column>
            <igx-column-group header="Person Details"
                [collapsible]="personDetailsCollapsible"
                [expanded]="personDetailsExpanded" [visibleWhenCollapsed]="personDetailsVisibleWhenCollapse">
                <igx-column  field="ContactName"></igx-column>
                <igx-column  field="ContactTitle"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column-group header="Address Information" [collapsible]="true">
            <igx-column-group header="Country Information" [visibleWhenCollapsed]="true" [collapsible]="true">
                <igx-column  field="Country" [visibleWhenCollapsed]="true"></igx-column>
                <igx-column  field="Empty"></igx-column>
                <igx-column-group header="Region Information" [visibleWhenCollapsed]="true" [collapsible]="true">
                    <igx-column field="Region" [visibleWhenCollapsed]="true"></igx-column>
                    <igx-column field="PostalCode" [visibleWhenCollapsed]="true"></igx-column>
                </igx-column-group>
                <igx-column-group header="City Information" [visibleWhenCollapsed]="true" [collapsible]="true">
                    <igx-column field="City"></igx-column>
                    <igx-column field="Address"></igx-column>
                </igx-column-group>
            </igx-column-group>
            <igx-column-group header="Contact Information" [visibleWhenCollapsed]="false"
                    [collapsible]="true" [hidden]="hideContactInformation">
                <igx-column field="Phone" [visibleWhenCollapsed]="false"></igx-column>
                <igx-column field="Fax" [visibleWhenCollapsed]="false"></igx-column>
            </igx-column-group>
        </igx-column-group>
    </igx-grid>
    `
})
export class CollapsibleColumnGroupTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;
    public generalInfCollapsible;
    public generalInfExpanded;
    public personDetailsCollapsible;
    public personDetailsExpanded;
    public personDetailsVisibleWhenCollapse;
    public companyNameVisibleWhenCollapse;
    public hideContactInformation = true;
    public data = SampleTestData.contactInfoDataFull();
}


@Component({
    template: `
    <igx-grid #grid [data]="data" height="500px" width="1000px" columnWidth="100px" [columnHiding]="true" [columnSelection]="'multiple'">
        <igx-column-group header="General Information" >
            <igx-column  field="CompanyName" ></igx-column>
            <igx-column-group header="Person Details">
                <igx-column  field="ContactName"></igx-column>
                <igx-column  field="ContactTitle"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column field="ID"></igx-column>
        <igx-column-group header="Country Information">

            <igx-column-group header="Region Information">
                <igx-column  field="Country" [selectable]="false"></igx-column>
                <igx-column field="Region" ></igx-column>
                <igx-column field="PostalCode" ></igx-column>
            </igx-column-group>
            <igx-column-group header="City Information" >
                <igx-column field="City" [selectable]="false" ></igx-column>
                <igx-column field="Address" [selectable]="false"></igx-column>
            </igx-column-group>
        </igx-column-group>
    </igx-grid>
    `
})
export class ColumnSelectionGroupTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;
    public data = SampleTestData.contactInfoDataFull();
}
@Component({
    template: `
    <ng-template #indicatorTemplate let-column="column">
        <igx-icon [attr.draggable]="false">{{column.expanded ? 'lock' : 'lock_open'}} </igx-icon>
    </ng-template>

    <igx-grid #grid [data]="data" height="500px" width="1300px" columnWidth="100px">
        <igx-column field="ID"></igx-column>
        <igx-column-group header="General Information" [collapsible]="true" >
            <igx-column  field="CompanyName" [visibleWhenCollapsed]="true"></igx-column>
            <igx-column-group header="Person Details" [visibleWhenCollapsed]="false">
                <igx-column  field="ContactName"></igx-column>
                <igx-column  field="ContactTitle"></igx-column>
            </igx-column-group>
            <ng-template igxCollapsibleIndicator let-column="column">
                <igx-icon [attr.draggable]="false">{{column.expanded ? 'remove' : 'add'}} </igx-icon>
            </ng-template>
        </igx-column-group>
        <igx-column-group header="Address Information" [collapsible]="true">
                <igx-column  field="Country" [visibleWhenCollapsed]="true"></igx-column>
                <igx-column-group header="Region Information" [visibleWhenCollapsed]="true">
                    <igx-column field="Region" ></igx-column>
                    <igx-column field="PostalCode"></igx-column>
                </igx-column-group>
                <igx-column-group header="City Information" [visibleWhenCollapsed]="false">
                    <igx-column field="City"></igx-column>
                    <igx-column field="Address"></igx-column>
                </igx-column-group>
        </igx-column-group>
    </igx-grid>
    `
})
export class CollapsibleGroupsTemplatesTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild('indicatorTemplate', { read: TemplateRef, static: false })
    public indicatorTemplate;

    public data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
        <igx-grid [data]="data" height="500px" width="800px" columnWidth="100px">
            <igx-column-group *ngFor="let colGroup of columnGroups" [header]="colGroup.columnHeader" [collapsible]="colGroup.collapsible">
                <igx-column *ngFor="let column of colGroup.columns" [field]="column.field" [dataType]="column.type"
                    [visibleWhenCollapsed]="column.visibleWhenCollapsed"></igx-column>
            </igx-column-group>
        </igx-grid>
    `
})

export class CollapsibleGroupsDynamicColComponent {
    @ViewChild(IgxGridComponent, { static: true })
    public grid: IgxGridComponent;

    public columnGroups: Array<any>;
    public data = SampleTestData.contactInfoDataFull();

    constructor() {
        this.columnGroups = [
            {
                columnHeader: 'First', collapsible: true, columns: [
                    { field: 'ID', type: 'string', visibleWhenCollapsed: true },
                    { field: 'CompanyName', type: 'string', visibleWhenCollapsed: true },
                    { field: 'ContactName', type: 'string', visibleWhenCollapsed: true },
                ]
            },
            {
                columnHeader: 'Second', collapsible: true, columns: [
                    { field: 'ContactTitle', type: 'string', visibleWhenCollapsed: true },
                    { field: 'Address', type: 'string', visibleWhenCollapsed: true },
                    { field: 'PostlCode', type: 'string', visibleWhenCollapsed: false },
                    { field: 'Contry', type: 'string', visibleWhenCollapsed: false }
                ]
            }
        ];
    }

    public removeColumnFromGroup(groupIndex = 0) {
        this.columnGroups[groupIndex].columns.pop();
    }

    public addColumnToGroup(groupIndex = 0, visibleWhenCollapsed = false) {
        this.columnGroups[groupIndex].columns.push({ field: 'Missing', type: 'string', visibleWhenCollapsed });
    }
}

@Component({
    template: `
    <igx-grid #grid [data]="data" height="500px" width="1300px" columnWidth="100px">

        <igx-column-group header="General Information">
            <igx-column  field="CompanyName" ></igx-column>
            <igx-column-group header="Person Details">
                <igx-column  field="ContactName"></igx-column>
                <igx-column  field="ContactTitle"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column field="ID"></igx-column>
        <igx-column-group header="Address Information" >
            <igx-column field="Region"></igx-column>
            <igx-column-group header="Country Information">
                <igx-column  field="Country"></igx-column>
                <igx-column-group header="City Information">
                    <igx-column field="City"></igx-column>
                    <igx-column field="Address"></igx-column>
                </igx-column-group>
            </igx-column-group>
        </igx-column-group>
    </igx-grid>
    `
})
export class ColumnGroupsNavigationTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;
    public data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
    <igx-grid [data]="data" height="500px" [allowFiltering]="true" [(filteringExpressionsTree)]="filterTree">
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true" [filterable]="false" [resizable]="resizable">
        </igx-column>
        <igx-column width="100px" [field]="'ProductName'" [filterable]="filterable" [resizable]="resizable" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable" [resizable]="resizable" dataType="boolean"></igx-column>
    </igx-grid>`
})
export class IgxGridFilteringBindingComponent extends BasicGridComponent implements OnInit {
    public resizable = false;
    public filterable = true;
    public filterTree: FilteringExpressionsTree;

    public data = SampleTestData.excelFilteringData();

    public ngOnInit(): void {
        this.filterTree = new FilteringExpressionsTree(FilteringLogic.And);
        this.filterTree.filteringOperands = [
            {
                condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                fieldName: 'Downloads',
                searchVal: 200
            }
        ];
    }
}

@Component({
    template: `
    <igx-grid [data]="data" height="500px" [allowAdvancedFiltering]="true" [showToolbar]="true"
        [(advancedFilteringExpressionsTree)]="filterTree" >
        <igx-column width="100px" [field]="'ID'" [header]="'ID'" [hasSummary]="true" [filterable]="false" [resizable]="resizable">
        </igx-column>
        <igx-column width="100px" [field]="'ProductName'" [filterable]="filterable" [resizable]="resizable" dataType="string"></igx-column>
        <igx-column width="100px" [field]="'Downloads'" [filterable]="filterable" [resizable]="resizable" dataType="number"></igx-column>
        <igx-column width="100px" [field]="'Released'" [filterable]="filterable" [resizable]="resizable" dataType="boolean"></igx-column>
    </igx-grid>`
})
export class IgxGridAdvancedFilteringBindingComponent extends BasicGridComponent implements OnInit {
    public resizable = false;
    public filterable = true;
    public filterTree: FilteringExpressionsTree;

    public data = SampleTestData.excelFilteringData();

    public ngOnInit(): void {
        this.filterTree = new FilteringExpressionsTree(FilteringLogic.And);
        this.filterTree.filteringOperands = [
            {
                condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                fieldName: 'Downloads',
                searchVal: 200
            }
        ];
    }
}

@Component({
    template: `
        <igx-grid [data]="data" width="300px" height="250px">
            <igx-column field="firstName"></igx-column>
            <igx-column field="lastName"></igx-column>
            <igx-column field="age" [editable]="true" [dataType]="'number'"></igx-column>
            <igx-column field="isActive" [editable]="true" [dataType]="'boolean'"></igx-column>
            <igx-column field="birthday" [editable]="false" [dataType]="'date'"></igx-column>
            <igx-column field="fullName" [editable]="false"></igx-column>
        </igx-grid>
        <button class="btnTest">Test</button>
    `
})
export class ColumnEditablePropertyTestComponent extends BasicGridComponent {
    public data = [
        { personNumber: 0, fullName: 'John Brown', age: 20, isActive: true, birthday: new Date('08/08/2001') },
        { personNumber: 1, fullName: 'Ben Affleck', age: 30, isActive: false, birthday: new Date('08/08/1991') },
        { personNumber: 2, fullName: 'Tom Riddle', age: 50, isActive: true, birthday: new Date('08/08/1961') }
    ];
}

@Component({
    template: `
        <igx-grid [height]="'300px'" [width]="'800px'" [data]="data" [autoGenerate]="true"></igx-grid>
    `
})
export class NoColumnWidthGridComponent extends BasicGridComponent {
    public data = SampleTestData.generateNumberData(1000);
}

@Component({
    template: GridTemplateStrings.declareGrid(
        '',
        '',
        ColumnDefinitions.idFirstLastNameSortable)
})
export class SortByParityComponent extends GridDeclaredColumnsComponent implements ISortingStrategy {
    public sort(data: any[], fieldName: string, dir: SortingDirection) {
        const key = fieldName;
        const reverse = (dir === SortingDirection.Desc ? -1 : 1);
        const cmpFunc = (obj1, obj2) => this.compareObjects(obj1, obj2, key, reverse);
        return data.sort(cmpFunc);
    }
    protected sortByParity(a: any, b: any) {
        return a % 2 === 0 ? -1 : b % 2 === 0 ? 1 : 0;
    }
    protected compareObjects(obj1, obj2, key: string, reverse: number) {
        const a = obj1[key];
        const b = obj2[key];
        return reverse * this.sortByParity(a, b);
    }
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [height]="'500px'" [width]="'500px'">
        <igx-column-layout *ngFor='let group of colGroups' [hidden]='group.hidden' [pinned]='group.pinned' [field]='group.group'>
            <igx-column *ngFor='let col of group.columns'
            [rowStart]="col.rowStart" [colStart]="col.colStart" [width]='col.width'
            [colEnd]="col.colEnd" [rowEnd]="col.rowEnd" [field]='col.field' [editable]='col.editable'></igx-column>
        </igx-column-layout>
    </igx-grid>
    `
})
export class MRLTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;
    public colGroups: Array<any> = [
        {
            group: 'group1',
            columns: [
                { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, editable: true },
                { field: 'ContactName', rowStart: 2, colStart: 1, editable: false, width: '100px' },
                { field: 'ContactTitle', rowStart: 2, colStart: 2, editable: true, width: '100px' },
                { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3, editable: true, width: '100px' }
            ]
        },
        {
            group: 'group2',
            columns: [
                { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px', editable: true },
                { field: 'Region', rowStart: 3, colStart: 1, editable: true },
                { field: 'PostalCode', rowStart: 3, colStart: 2, editable: true }
            ]
        },
        {
            group: 'group3',
            columns: [
                { field: 'Country', rowStart: 1, colStart: 1 },
                { field: 'Phone', rowStart: 1, colStart: 2 },
                { field: 'Fax', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
            ]
        }
    ];
    public data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
<igx-grid #grid [data]="data" [width]="'800px'" [height]="'500px'"
    [rowEditable]="true" [primaryKey]="'ID'" [allowFiltering]="true">
    <igx-column *ngFor="let c of columns" [sortable]="true" [field]="c.field" [header]="c.field"
        [width]="c.width" [movable]='true' [resizable]='true'>
    </igx-column>
    <igx-paginator *ngIf="paging"></igx-paginator>

    <igx-action-strip #actionStrip>
        <igx-grid-editing-actions [addRow]='true'></igx-grid-editing-actions>
    </igx-action-strip>
    <ng-template igxRowAddText>
            Adding Row
    </ng-template>
</igx-grid>
`
})
export class IgxAddRowComponent implements OnInit {
    @ViewChild('actionStrip', { read: IgxActionStripComponent, static: true })
    public actionStrip: IgxActionStripComponent;

    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    public data: any[];
    public columns: any[];
    public paging = false;

    public ngOnInit() {

        this.columns = [
            { field: 'ID', width: '200px', hidden: false },
            { field: 'CompanyName', width: '200px' },
            { field: 'ContactName', width: '200px', pinned: false },
            { field: 'ContactTitle', width: '300px', pinned: false },
        ];

        this.data = [
            /* eslint-disable max-len */
            { ID: 'ALFKI', CompanyName: 'Alfreds Futterkiste', ContactName: 'Maria Anders', ContactTitle: 'Sales Representative' },
            { ID: 'ANATR', CompanyName: 'Ana Trujillo Emparedados y helados', ContactName: 'Ana Trujillo', ContactTitle: 'Owner' },
            { ID: 'ANTON', CompanyName: 'Antonio Moreno Taquería', ContactName: 'Antonio Moreno', ContactTitle: 'Owner' },
            { ID: 'AROUT', CompanyName: 'Around the Horn', ContactName: 'Thomas Hardy', ContactTitle: 'Sales Representative' },
            { ID: 'BERGS', CompanyName: 'Berglunds snabbköp', ContactName: 'Christina Berglund', ContactTitle: 'Order Administrator' },
            { ID: 'BLAUS', CompanyName: 'Blauer See Delikatessen', ContactName: 'Hanna Moos', ContactTitle: 'Sales Representative' },
            { ID: 'BLONP', CompanyName: 'Blondesddsl père et fils', ContactName: 'Frédérique Citeaux', ContactTitle: 'Marketing Manager' },
            { ID: 'BOLID', CompanyName: 'Bólido Comidas preparadas', ContactName: 'Martín Sommer', ContactTitle: 'Owner' },
            { ID: 'BONAP', CompanyName: 'Bon app\'', ContactName: 'Laurence Lebihan', ContactTitle: 'Owner' },
            { ID: 'BOTTM', CompanyName: 'Bottom-Dollar Markets', ContactName: 'Elizabeth Lincoln', ContactTitle: 'Accounting Manager' },
            { ID: 'BSBEV', CompanyName: 'B\'s Beverages', ContactName: 'Victoria Ashworth', ContactTitle: 'Sales Representative', Address: 'Fauntleroy Circus', City: 'London', Region: null, PostalCode: 'EC2 5NT', Country: 'UK', Phone: '(171) 555-1212', Fax: null },
            { ID: 'CACTU', CompanyName: 'Cactus Comidas para llevar', ContactName: 'Patricio Simpson', ContactTitle: 'Sales Agent', Address: 'Cerrito 333', City: 'Buenos Aires', Region: null, PostalCode: '1010', Country: 'Argentina', Phone: '(1) 135-5555', Fax: '(1) 135-4892' },
            { ID: 'CENTC', CompanyName: 'Centro comercial Moctezuma', ContactName: 'Francisco Chang', ContactTitle: 'Marketing Manager', Address: 'Sierras de Granada 9993', City: 'México D.F.', Region: null, PostalCode: '05022', Country: 'Mexico', Phone: '(5) 555-3392', Fax: '(5) 555-7293' },
            { ID: 'CHOPS', CompanyName: 'Chop-suey Chinese', ContactName: 'Yang Wang', ContactTitle: 'Owner', Address: 'Hauptstr. 29', City: 'Bern', Region: null, PostalCode: '3012', Country: 'Switzerland', Phone: '0452-076545', Fax: null },
            { ID: 'COMMI', CompanyName: 'Comércio Mineiro', ContactName: 'Pedro Afonso', ContactTitle: 'Sales Associate', Address: 'Av. dos Lusíadas, 23', City: 'Sao Paulo', Region: 'SP', PostalCode: '05432-043', Country: 'Brazil', Phone: '(11) 555-7647', Fax: null },
            { ID: 'CONSH', CompanyName: 'Consolidated Holdings', ContactName: 'Elizabeth Brown', ContactTitle: 'Sales Representative', Address: 'Berkeley Gardens 12 Brewery', City: 'London', Region: null, PostalCode: 'WX1 6LT', Country: 'UK', Phone: '(171) 555-2282', Fax: '(171) 555-9199' },
            { ID: 'DRACD', CompanyName: 'Drachenblut Delikatessen', ContactName: 'Sven Ottlieb', ContactTitle: 'Order Administrator', Address: 'Walserweg 21', City: 'Aachen', Region: null, PostalCode: '52066', Country: 'Germany', Phone: '0241-039123', Fax: '0241-059428' },
            { ID: 'DUMON', CompanyName: 'Du monde entier', ContactName: 'Janine Labrune', ContactTitle: 'Owner', Address: '67, rue des Cinquante Otages', City: 'Nantes', Region: null, PostalCode: '44000', Country: 'France', Phone: '40.67.88.88', Fax: '40.67.89.89' },
            { ID: 'EASTC', CompanyName: 'Eastern Connection', ContactName: 'Ann Devon', ContactTitle: 'Sales Agent', Address: '35 King George', City: 'London', Region: null, PostalCode: 'WX3 6FW', Country: 'UK', Phone: '(171) 555-0297', Fax: '(171) 555-3373' },
            { ID: 'ERNSH', CompanyName: 'Ernst Handel', ContactName: 'Roland Mendel', ContactTitle: 'Sales Manager', Address: 'Kirchgasse 6', City: 'Graz', Region: null, PostalCode: '8010', Country: 'Austria', Phone: '7675-3425', Fax: '7675-3426' },
            { ID: 'FAMIA', CompanyName: 'Familia Arquibaldo', ContactName: 'Aria Cruz', ContactTitle: 'Marketing Assistant', Address: 'Rua Orós, 92', City: 'Sao Paulo', Region: 'SP', PostalCode: '05442-030', Country: 'Brazil', Phone: '(11) 555-9857', Fax: null },
            { ID: 'FISSA', CompanyName: 'FISSA Fabrica Inter. Salchichas S.A.', ContactName: 'Diego Roel', ContactTitle: 'Accounting Manager', Address: 'C/ Moralzarzal, 86', City: 'Madrid', Region: null, PostalCode: '28034', Country: 'Spain', Phone: '(91) 555 94 44', Fax: '(91) 555 55 93' },
            { ID: 'FOLIG', CompanyName: 'Folies gourmandes', ContactName: 'Martine Rancé', ContactTitle: 'Assistant Sales Agent', Address: '184, chaussée de Tournai', City: 'Lille', Region: null, PostalCode: '59000', Country: 'France', Phone: '20.16.10.16', Fax: '20.16.10.17' },
            { ID: 'FOLKO', CompanyName: 'Folk och fä HB', ContactName: 'Maria Larsson', ContactTitle: 'Owner', Address: 'Åkergatan 24', City: 'Bräcke', Region: null, PostalCode: 'S-844 67', Country: 'Sweden', Phone: '0695-34 67 21', Fax: null },
            { ID: 'FRANK', CompanyName: 'Frankenversand', ContactName: 'Peter Franken', ContactTitle: 'Marketing Manager', Address: 'Berliner Platz 43', City: 'München', Region: null, PostalCode: '80805', Country: 'Germany', Phone: '089-0877310', Fax: '089-0877451' },
            { ID: 'FRANR', CompanyName: 'France restauration', ContactName: 'Carine Schmitt', ContactTitle: 'Marketing Manager', Address: '54, rue Royale', City: 'Nantes', Region: null, PostalCode: '44000', Country: 'France', Phone: '40.32.21.21', Fax: '40.32.21.20' },
            { ID: 'FRANS', CompanyName: 'Franchi S.p.A.', ContactName: 'Paolo Accorti', ContactTitle: 'Sales Representative', Address: 'Via Monte Bianco 34', City: 'Torino', Region: null, PostalCode: '10100', Country: 'Italy', Phone: '011-4988260', Fax: '011-4988261' }
        ];
        /* eslint-enable max-len */
    }
}

@Component({
    template: GridTemplateStrings.declareGrid(` [hideGroupedColumns]="true"`, '', ColumnDefinitions.exportGroupedDataColumns)
})
export class GridExportGroupedDataComponent extends BasicGridComponent {
    public data = SampleTestData.exportGroupedDataColumns();
}

@Component({
    template: GridTemplateStrings.declareGrid(` height="1000px"`, '', ColumnDefinitions.multiColHeadersExportColumns)
})
export class MultiColumnHeadersExportComponent extends BasicGridComponent {
    public data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
    <igx-grid #grid1 [data]="data">
        <igx-column>
            <ng-template igxCell>
                <button>SimpleBtn</button>
            </ng-template>
        </igx-column>
        <igx-column header="" field="ID"></igx-column>
        <igx-column header="  " field=""></igx-column>
        <igx-column header="Name" field="Name"></igx-column>
        <igx-column header="JobTitle" field="JobTitle"></igx-column>
    </igx-grid>`
})

export class GridWithEmptyColumnsComponent {
    @ViewChild('grid1', { static: true }) public grid: IgxGridComponent;

    public data = SampleTestData.personJobDataFull();
}
