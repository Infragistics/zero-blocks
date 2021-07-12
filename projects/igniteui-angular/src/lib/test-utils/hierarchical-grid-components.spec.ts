import { Component, ViewChild, OnInit } from '@angular/core';
import { SampleTestData } from './sample-test-data.spec';
import { IgxColumnComponent } from '../grids/public_api';
import { IgxHierarchicalTransactionServiceFactory } from '../grids/hierarchical-grid/hierarchical-grid-base.directive';
import { IgxHierarchicalGridComponent } from '../grids/hierarchical-grid/hierarchical-grid.component';
import { IgxRowIslandComponent } from '../grids/hierarchical-grid/row-island.component';
import { IPinningConfig } from '../grids/grid.common';
import { ColumnPinningPosition, RowPinningPosition } from '../grids/common/enums';
import { IgxActionStripComponent } from '../action-strip/public_api';
import { HIERARCHICAL_SAMPLE_DATA } from 'src/app/shared/sample-data';


@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [allowFiltering]="true" [rowEditable]="true" [pinning]='pinningConfig'
     [height]="'600px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'">
        <igx-column field="ID" [groupable]="true" [movable]='true'></igx-column>
        <igx-column-group header="Information">
                <igx-column field="ChildLevels" [groupable]="true" [sortable]="true" [editable]="true" [movable]='true'></igx-column>
                <igx-column field="ProductName" [groupable]="true" [hasSummary]='true' [movable]='true'></igx-column>
        </igx-column-group>
        <igx-paginator *ngIf="paging"></igx-paginator>
        <igx-row-island [key]="'childData'" #rowIsland [allowFiltering]="true" [rowEditable]="true" [primaryKey]="'ID'">
            <igx-grid-toolbar [grid]="grid" *igxGridToolbar="let grid"></igx-grid-toolbar>
            <igx-column field="ID" [groupable]="true" [hasSummary]='true' [movable]='true'>
                <ng-template igxHeader let-columnRef="column">
                    <div>
                        <span>ID</span>
                        <igx-icon (click)="pinColumn(columnRef)">lock</igx-icon>
                    </div>
                </ng-template>
            </igx-column>
            <igx-column-group header="Information">
                    <igx-column field="ChildLevels" [groupable]="true" [sortable]="true" [editable]="true"></igx-column>
                    <igx-column field="ProductName" [groupable]="true"></igx-column>
            </igx-column-group>
            <igx-row-island [key]="'childData'" #rowIsland2 >
                <igx-column field="ID" [groupable]="true" ></igx-column>
                <igx-column-group header="Information">
                        <igx-column field="ChildLevels" [groupable]="true" [sortable]="true" [editable]="true"></igx-column>
                        <igx-column field="ProductName" [groupable]="true" [hasSummary]='true'></igx-column>
                </igx-column-group>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    providers: [IgxHierarchicalTransactionServiceFactory]
})
export class IgxHierarchicalGridTestBaseComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true })
    public hgrid: IgxHierarchicalGridComponent;

    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true })
    public rowIsland: IgxRowIslandComponent;

    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true })
    public rowIsland2: IgxRowIslandComponent;

    public data;
    public pinningConfig: IPinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Top };
    public paging = false;

    constructor() {
        // 3 level hierarchy
        this.data = SampleTestData.generateHGridData(40, 3);
    }

    public pinColumn(column: IgxColumnComponent) {
        if (column.pinned) {
            column.unpin();
        } else {
            column.pin();
        }
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'"
        [rowSelection]="'multiple'" [selectedRows]="selectedRows">
        <igx-column field="ID" ></igx-column>
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" #rowIsland [primaryKey]="'ID'" [rowSelection]="'single'">
            <igx-column field="ID"> </igx-column>
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-row-island [key]="'childData'" #rowIsland2 [primaryKey]="'ID'" [rowSelection]="'none'">
                <igx-column field="ID"></igx-column>
                <igx-column field="ChildLevels"></igx-column>
                <igx-column field="ProductName"></igx-column>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    providers: [IgxHierarchicalTransactionServiceFactory]
})
export class IgxHierarchicalGridRowSelectionComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;
    public data;
    public selectedRows = [];

    constructor() {
        // 3 level hierarchy
        this.data = SampleTestData.generateHGridData(5, 3);
    }
}
@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'"
        [rowSelection]="'multiple'" [selectedRows]="selectedRows" [selectRowOnClick]="false">
        <igx-column field="ID" ></igx-column>
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" #rowIsland [primaryKey]="'ID'" [rowSelection]="'single'">
            <igx-column field="ID"> </igx-column>
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-row-island [key]="'childData'" #rowIsland2 [primaryKey]="'ID'" [rowSelection]="'none'">
                <igx-column field="ID"></igx-column>
                <igx-column field="ChildLevels"></igx-column>
                <igx-column field="ProductName"></igx-column>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    providers: [IgxHierarchicalTransactionServiceFactory]
})
export class IgxHierarchicalGridRowSelectionTestSelectRowOnClickComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;
    public data;
    public selectedRows = [];

    constructor() {
        // 3 level hierarchy
        this.data = SampleTestData.generateHGridData(5, 3);
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'"
        [rowSelection]="'multiple'">
        <igx-column field="ID" ></igx-column>
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" #rowIsland [primaryKey]="'ID'" [rowSelection]="'multiple'">
            <igx-column field="ID"> </igx-column>
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-row-island [key]="'childData'" #rowIsland2 [primaryKey]="'ID'" [rowSelection]="'multiple'">
                <igx-column field="ID"></igx-column>
                <igx-column field="ChildLevels"></igx-column>
                <igx-column field="ProductName"></igx-column>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
})
export class IgxHierarchicalGridRowSelectionNoTransactionsComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;
    public data;

    constructor() {
        // 3 level hierarchy
        this.data = SampleTestData.generateHGridData(5, 3);
    }
}

@Component({
    template: `
    <igx-hierarchical-grid [data]="data" [cellSelection]="false" [height]="'600px'"
        [width]="'700px'" #hGridCustomSelectors [primaryKey]="'ID'"
        [rowSelection]="'multiple'">
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-paginator></igx-paginator>
        <igx-row-island [key]="'childData'" #rowIsland1 [primaryKey]="'ID'" [rowSelection]="'single'">
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-paginator *igxPaginator></igx-paginator>
            <ng-template igxHeadSelector let-headContext>
                <igx-checkbox [readonly]="true" (click)="handleHeadSelectorClick(headContext)"
                    [checked]="headContext.selectedCount === headContext.totalCount"
                    [indeterminate]="headContext.selectedCount !== headContext.totalCount && headContext.selectedCount !== 0">
                </igx-checkbox>
            </ng-template>
            <ng-template igxRowSelector let-rowContext>
                <span class="rowNumberChild">{{ rowContext.index }}</span>
                <igx-checkbox (click)="handleRowSelectorClick(rowContext)" [checked]="rowContext.selected">
                </igx-checkbox>
            </ng-template>
        </igx-row-island>
        <ng-template igxHeadSelector let-headContext>
            <igx-checkbox [readonly]="true" (click)="handleHeadSelectorClick(headContext)"
                [checked]="headContext.selectedCount === headContext.totalCount"
                [indeterminate]="headContext.selectedCount !== headContext.totalCount && headContext.selectedCount !== 0">
            </igx-checkbox>
        </ng-template>
        <ng-template igxRowSelector let-rowContext>
            <span class="rowNumber">{{ rowContext.index }}</span>
            <igx-checkbox [readonly]="true" (click)="handleRowSelectorClick(rowContext)" [checked]="rowContext.selected">
            </igx-checkbox>
        </ng-template>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridCustomSelectorsComponent implements OnInit {
    @ViewChild('hGridCustomSelectors', { read: IgxHierarchicalGridComponent, static: true })
    public hGrid: IgxHierarchicalGridComponent;

    @ViewChild('rowIsland1', { read: IgxRowIslandComponent, static: true })
    public firstLevelChild: IgxRowIslandComponent;

    public data = [];

    public ngOnInit(): void {
        // 2 level hierarchy
        this.data = SampleTestData.generateHGridData(40, 2);
    }

    public handleHeadSelectorClick(headContext) {
        if (headContext.totalCount !== headContext.selectedCount) {
            headContext.selectAll();
        } else {
            headContext.deselectAll();
        }
    }

    public handleRowSelectorClick(rowContext) {
        if (rowContext.selected) {
            rowContext.deselect();
        } else {
            rowContext.select();
        }
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid
        [primaryKey]="'ID'" [showToolbar]="true" [autoGenerate]="true">
        <igx-grid-toolbar>
            <button igxButton="raised">Parent Button</button>
        </igx-grid-toolbar>
        <igx-row-island [key]="'childData1'" #rowIsland1 [primaryKey]="'ID'" [showToolbar]="true" [autoGenerate]="true">
            <igx-grid-toolbar *igxGridToolbar="let grid" [grid]="grid">
                <button igxButton="raised">Child 1 Button</button>
            </igx-grid-toolbar>
        </igx-row-island>
        <igx-row-island [key]="'childData2'" #rowIsland2 [primaryKey]="'ID'" [showToolbar]="true" [autoGenerate]="true">
        <igx-grid-toolbar *igxGridToolbar="let grid" [grid]="grid">
                <button igxButton="raised">Child2 Button</button>
            </igx-grid-toolbar>
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridTestCustomToolbarComponent extends IgxHierarchicalGridTestBaseComponent { }

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid
        [primaryKey]="'ID'" [showToolbar]="true" [autoGenerate]="true" [rowEditable]='true'>
        <igx-action-strip #actionStrip1>
            <igx-grid-pinning-actions></igx-grid-pinning-actions>
            <igx-grid-editing-actions></igx-grid-editing-actions>
        </igx-action-strip>
        <igx-row-island [key]="'childData1'" #rowIsland1 [primaryKey]="'ID'" [showToolbar]="true" [autoGenerate]="true">
        </igx-row-island>
        <igx-row-island [key]="'childData2'" #rowIsland2 [primaryKey]="'ID'" [showToolbar]="true" [autoGenerate]="true">
            <igx-action-strip #actionStrip2>
                <igx-grid-pinning-actions></igx-grid-pinning-actions>
                <igx-grid-editing-actions [asMenuItems]='true'></igx-grid-editing-actions>
            </igx-action-strip>
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridActionStripComponent extends IgxHierarchicalGridTestBaseComponent {
    @ViewChild('actionStrip1', { read: IgxActionStripComponent, static: true })
    public actionStripRoot: IgxActionStripComponent;

    @ViewChild('actionStrip2', { read: IgxActionStripComponent, static: true })
    public actionStripChild: IgxActionStripComponent;
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'300px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'">
        <igx-column field="ID" ></igx-column>
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" #rowIsland [primaryKey]="'ID'" [rowSelection]="'single'">
            <igx-column field="ID"> </igx-column>
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-row-island [key]="'childData'" #rowIsland2 [primaryKey]="'ID'" [rowSelection]="'none'">
                <igx-column field="ID"></igx-column>
                <igx-column field="ChildLevels"></igx-column>
                <igx-column field="ProductName"></igx-column>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>
    <igx-advanced-filtering-dialog [grid]="grid1">
    </igx-advanced-filtering-dialog>`
})
export class IgxHierGridExternalAdvancedFilteringComponent extends IgxHierarchicalGridTestBaseComponent {
    // @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true })
    // public hgrid: IgxHierarchicalGridComponent;

    public data = SampleTestData.generateHGridData(5, 3);
}

@Component({
    template: `
    <igx-hierarchical-grid [data]="data" [height]="'1200px'" [width]="'700px'"
        [allowFiltering]="true" [filterMode]="'excelStyleFilter'" #hierarchicalGrid>
        <igx-column field="Artist" [filterable]="true" [sortable]="true"></igx-column>
        <igx-column field="Debut" [sortable]="true" dataType="number"></igx-column>
        <igx-column field="GrammyNominations" header="Grammy Nominations" [sortable]="true"></igx-column>
        <igx-column field="GrammyAwards" header="Grammy Awards" [sortable]="true"></igx-column>

        <igx-row-island [key]="'Albums'" [allowFiltering]='true' [filterMode]="'excelStyleFilter'" [autoGenerate]="false">
            <igx-column field="Album"></igx-column>
            <igx-column field="LaunchDate" header="Launch Date" [dataType]="'date'"></igx-column>
            <igx-column field="BillboardReview" header="Billboard Review"></igx-column>
            <igx-column field="USBillboard200" header="US Billboard 200"></igx-column>
        <igx-row-island [key]="'Songs'" [allowFiltering]='true' [filterMode]="'excelStyleFilter'" [autoGenerate]="false">
                <igx-column field="Number" header="No."></igx-column>
                <igx-column field="Title"></igx-column>
                <igx-column field="Released" dataType="date"></igx-column>
                <igx-column field="Genre"></igx-column>
        </igx-row-island>
        </igx-row-island>

        <igx-row-island [key]="'Tours'" [autoGenerate]="false">
            <igx-column field="Tour"></igx-column>
            <igx-column field="StartedOn" header="Started on"></igx-column>
            <igx-column field="Location"></igx-column>
            <igx-column field="Headliner"></igx-column>
        <igx-row-island [key]="'TourData'" [autoGenerate]="false">
                <igx-column field="Country"></igx-column>
                <igx-column field="TicketsSold" header="Tickets Sold"></igx-column>
                <igx-column field="Attendants"></igx-column>
        </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>
    `
})
export class IgxHierarchicalGridExportComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hGrid: IgxHierarchicalGridComponent;
    public data = SampleTestData.hierarchicalGridExportData();
}


@Component({
    template: `
    <igx-hierarchical-grid [data]="data" [height]="'1200px'" [width]="'700px'" #hierarchicalGrid>
        <igx-column field="CustomerID" [movable]="true" [sortable]="true" [resizable]="true"></igx-column>
        <igx-column-group [movable]="true" [pinned]="false" header="General Information">
            <igx-column field="CompanyName" [movable]="true" [sortable]="true" [resizable]="true"></igx-column>
            <igx-column-group [movable]="true" header="Personal Details">
                <igx-column field="ContactName" [movable]="true" [sortable]="true" [resizable]="true"></igx-column>
                <igx-column field="ContactTitle" [movable]="true" [sortable]="true" [resizable]="true"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column-group header="Address Information">
            <igx-column-group header="Location">
                <igx-column field="Address" [movable]="true" [sortable]="true" [resizable]="true"></igx-column>
                <igx-column field="City" [movable]="true" [sortable]="true" [resizable]="true"></igx-column>
                <igx-column field="PostalCode" [movable]="true" [sortable]="true" [resizable]="true"></igx-column>
                <igx-column field="Country" [movable]="true" [sortable]="true" [resizable]="true"></igx-column>
            </igx-column-group>
            <igx-column-group header="Contact Information">
                <igx-column field="Phone" [sortable]="true" [resizable]="true"></igx-column>
                <igx-column field="Fax" [sortable]="true" [resizable]="true"></igx-column>
            </igx-column-group>
        </igx-column-group>

        <igx-row-island [key]="'ChildCompanies'" [autoGenerate]="false">
            <!-- <igx-column-group [movable]="true" [pinned]="false" header="General Information"> -->
                <igx-column field="CompanyName" [movable]="true" [sortable]="true" [resizable]="true"></igx-column>
                <igx-column-group [movable]="true" header="Personal Details">
                    <igx-column field="ContactName" [movable]="true" [sortable]="true" [resizable]="true"></igx-column>
                    <igx-column field="ContactTitle" [movable]="true" [sortable]="true" [resizable]="true"></igx-column>
                </igx-column-group>
            <!-- </igx-column-group> -->
            <!-- <igx-column-group header="Address Information"> -->
                <igx-column-group header="Location">
                    <igx-column field="Address" [movable]="true" [sortable]="true" [resizable]="true"></igx-column>
                    <igx-column field="City" [movable]="true" [sortable]="true" [resizable]="true"></igx-column>
                    <igx-column field="PostalCode" [movable]="true" [sortable]="true" [resizable]="true"></igx-column>
                    <igx-column field="Country" [movable]="true" [sortable]="true" [resizable]="true"></igx-column>
                </igx-column-group>
                <igx-column-group header="Contact Information">
                    <igx-column field="Phone" [sortable]="true" [resizable]="true"></igx-column>
                    <igx-column field="Fax" [sortable]="true" [resizable]="true"></igx-column>
                </igx-column-group>
            <!-- </igx-column-group> -->
        </igx-row-island>
    </igx-hierarchical-grid>
    `
})
export class IgxHierarchicalGridMultiColumnHeadersExportComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hGrid: IgxHierarchicalGridComponent;
    public data = HIERARCHICAL_SAMPLE_DATA;
}
