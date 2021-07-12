import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { SampleTestData } from './sample-test-data.spec';
import { ColumnDefinitions, GridTemplateStrings } from './template-strings.spec';
import { IgxGridComponent } from '../grids/grid/grid.component';
import { IgxColumnActionsComponent } from '../grids/column-actions/column-actions.component';

@Component({
    template: `
        <igx-grid
            [data]="data"
            [autoGenerate]="true">
        </igx-grid>
    `
})
export class BasicGridComponent {
    @ViewChild(IgxGridComponent, { static: true })
    public grid: IgxGridComponent;

    public data = [];
}

@Component({
    template: `
        <igx-grid
            [data]="data"
            [autoGenerate]="autoGenerate">
        </igx-grid>
    `
})
export class GridAutoGenerateComponent extends BasicGridComponent {
    public autoGenerate = true;
}

@Component({
    template: `
        <igx-grid
            [data]="data"
            [autoGenerate]="autoGenerate"
            [height]="height" [width]="width">
        </igx-grid>
    `
})
export class GridWithSizeComponent extends GridAutoGenerateComponent {
    public width = '100%';
    public height = '100%';

    public scrollTop(newTop: number) {
        this.grid.verticalScrollContainer.getScroll().scrollTop = newTop;
    }
}

@Component({
    template: GridTemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.generatedEditable)
})
export class GridNxMComponent extends GridWithSizeComponent implements OnInit {
    public colsCount: number;
    public rowsCount: number;
    public columnsType = 'string';
    public hasEditableColumns = true;
    public startFromOne = false;
    public columnNamePrefix = 'col';
    public columns = [];
    public autoGenerate = false;

    public ngOnInit() {
        this.columns = (this.hasEditableColumns) ?
                                SampleTestData.generateEditableColumns(this.colsCount, this.columnsType, this.columnNamePrefix)
                                : SampleTestData.generateColumnsByType(this.colsCount, this.columnsType, this.columnNamePrefix);
        this.data = SampleTestData.generateDataForColumns(this.columns, this.rowsCount, this.startFromOne);
    }

    public isHorizonatScrollbarVisible() {
        const scrollbar = this.grid.headerContainer.getScroll();
        return scrollbar.offsetWidth < (scrollbar.children[0] as HTMLElement).offsetWidth;
    }
}

@Component({
    template: GridTemplateStrings.declareGrid('', '', ColumnDefinitions.idNameJobHireDate, '',
            '<igx-paginator *ngIf="paging"></igx-paginator>')
})
export class BasicGridSearchComponent extends GridWithSizeComponent {
    public highlightClass = 'igx-highlight';
    public activeClass = 'igx-highlight__active';
    public paging = false;
}

@Component({
    template: GridTemplateStrings.declareGrid(``,
        '', ColumnDefinitions.idNameJobTitle, '', '<igx-paginator *ngIf="paging" [perPage]="perPage"></igx-paginator>')
})
export class PagingComponent extends GridWithSizeComponent {
    public paging = true;
    public perPage = 3;
    public data = SampleTestData.personJobDataFull();
}

@Component({
    template: GridTemplateStrings.declareGrid(` rowSelection = "multiple"`,
        '', ColumnDefinitions.productBasicNumberID)
})
export class SelectionComponent extends BasicGridComponent {
    public data = SampleTestData.generateBigValuesData(100);
}

@Component({
    template: GridTemplateStrings.declareGrid(` [autoGenerate]="true" [showToolbar]="showToolbar" [columnHiding]="columnHiding"
    [columnPinning]="columnPinning" [exportExcel]="exportExcel" [exportCsv]="exportCsv"`,
        '', '')
})
export class GridWithToolbarComponent extends GridWithSizeComponent {
    public showToolbar = true;
    public columnHiding = true;
    public columnPinning = true;
    public exportExcel = true;
    public exportCsv = true;

    public data = SampleTestData.contactInfoData();
}

@Component({
    template: `<div>
    <igx-column-actions igxColumnHiding [columns]="grid.columns" *ngIf="showInline" [hideFilter]="hideFilter"></igx-column-actions>
    ${ GridTemplateStrings.declareGrid('#grid [height]="height" [width]="width"', '', ColumnDefinitions.productHidable,
        '<igx-grid-toolbar></igx-grid-toolbar>', '<igx-paginator *ngIf="paging"></igx-paginator>') }
    </div>`
})
export class ColumnHidingTestComponent extends GridWithSizeComponent implements OnInit, AfterViewInit {
    @ViewChild(IgxColumnActionsComponent)
    public chooser: IgxColumnActionsComponent;
    public width = '500px';
    public height = '500px';
    public showInline = true;
    public hideFilter = false;
    public paging = false;

    constructor(private cdr: ChangeDetectorRef) {
        super();
    }

    public get hiddenColumnsCount(): number {
        return this.chooser.columnItems.filter(c => c.checked).length;
    }

    public ngOnInit() {
        this.data = SampleTestData.productInfoData();
    }

    public ngAfterViewInit() {
        this.cdr.detectChanges();
    }
}

@Component({
    template: `<div>
    <igx-column-actions igxColumnHiding [grid]="grid" *ngIf="showInline"></igx-column-actions>
    ${ GridTemplateStrings.declareGrid(' #grid [height]="height" [width]="width"', '', ColumnDefinitions.contactInfoGroupableColumns) }
    </div>`
})
export class ColumnGroupsHidingTestComponent extends ColumnHidingTestComponent {
    @ViewChild(IgxGridComponent, { static: true }) public grid: IgxGridComponent;

    public hasGroupColumns = false;
    public data = SampleTestData.contactInfoDataFull();
    constructor(cdr: ChangeDetectorRef) {
        super(cdr);
    }
}

@Component({
    template: `<div>
        <igx-column-actions igxColumnPinning [columns]="grid.columns" *ngIf="showInline" [hideFilter]="hideFilter"></igx-column-actions>
        ${GridTemplateStrings.declareGrid('#grid [height]="height" [width]="width"', '', ColumnDefinitions.productFilterable,
            '<igx-grid-toolbar>' +
            '<igx-grid-toolbar-actions><igx-grid-toolbar-pinning></igx-grid-toolbar-pinning></igx-grid-toolbar-actions>' +
            '</igx-grid-toolbar>')}
    </div>`
})
export class ColumnPinningTestComponent extends GridWithSizeComponent implements AfterViewInit, OnInit {
    @ViewChild(IgxColumnActionsComponent) public chooser: IgxColumnActionsComponent;

    public height = '500px';
    public width = '500px';
    public showInline = true;
    public hideFilter = false;

    constructor(private cdr: ChangeDetectorRef) {
        super();
    }

    public ngOnInit() {
        this.data = SampleTestData.productInfoData();
    }

    public ngAfterViewInit() {
        this.cdr.detectChanges();
    }
}
@Component({
    template: `
    <igx-grid #grid [height]="height" [width]="width" [autoGenerate]="false" [data]='data'>
    <igx-column field="ID" header="ID">
    </igx-column>
    <igx-column field="ReleaseDate" header="ReleaseDate">
    </igx-column>
    <igx-column field="Downloads" header="Downloads">
    </igx-column>
    <igx-column field="ProductName" [pinned]='true'>
        <ng-template igxCell let-cell="cell" let-val let-row >
            <div style="height:100px;">
                {{val}}
            </div>
        </ng-template>
    </igx-column>
    </igx-grid>
    `
})
export class ColumnPinningWithTemplateTestComponent extends ColumnPinningTestComponent {
}

@Component({
    template: `<div>
    <igx-column-actions igxColumnPinning [columns]="grid.columns" *ngIf="showInline"></igx-column-actions>
    ${ GridTemplateStrings.declareGrid(' #grid [height]="height" ', '', ColumnDefinitions.contactInfoGroupableColumns,
        '<igx-grid-toolbar></igx-grid-toolbar>')}
    </div>`
})
export class ColumnGroupsPinningTestComponent extends ColumnPinningTestComponent {
    public data = SampleTestData.contactInfoDataFull();

    constructor(cdr: ChangeDetectorRef) {
        super(cdr);
    }
}
