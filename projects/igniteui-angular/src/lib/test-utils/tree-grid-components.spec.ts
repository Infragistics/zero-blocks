import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxTreeGridComponent } from '../grids/tree-grid/tree-grid.component';
import { SampleTestData } from './sample-test-data.spec';
import { IgxSummaryOperand, IgxNumberSummaryOperand, IgxSummaryResult } from '../grids/public_api';
import { IgxGridTransaction } from '../grids/grid-base.directive';
import { IgxTransactionService } from '../services/transaction/igx-transaction';
import { DisplayDensity } from '../core/displayDensity';
import { IgxActionStripComponent } from '../action-strip/action-strip.component';
import { DefaultSortingStrategy } from 'igniteui-angular';
import { IGroupingExpression } from '../data-operations/grouping-expression.interface';
import { IgxTreeGridGroupByAreaComponent } from '../grids/grouping/tree-grid-group-by-area.component';

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" width="900px" height="600px">
        <igx-column [field]="'ID'" dataType="number" [sortable]="true"></igx-column>
        <igx-column [field]="'Name'" dataType="string" [sortable]="true"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date" [sortable]="true"></igx-column>
        <igx-column [field]="'Age'" dataType="number" [sortable]="true"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridSortingComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeSmallTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" expansionDepth="2" width="900px" height="800px">
        <igx-column [field]="'ID'" dataType="number" [filterable]="true"></igx-column>
        <igx-column [field]="'Name'" dataType="string" [filterable]="true"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date" [filterable]="true"></igx-column>
        <igx-column [field]="'Age'" dataType="number" [filterable]="true"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridFilteringComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" primaryKey="ID" [selectedRows]="selectedRows"
     width="900px" height="600px">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridSimpleComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeSmallTreeData();
    public selectedRows = [];
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees"
        primaryKey="ID" width="318px" height="400px" columnWidth="100px">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
        <igx-column [field]="'OnPTO'" dataType="boolean"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridWithScrollsComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeAllTypesTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" primaryKey="ID" width="600px" height="600px" columnWidth="100px">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
        <igx-column [field]="'OnPTO'" dataType="boolean"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridWithNoScrollsComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeAllTypesTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" primaryKey="ID" foreignKey="ParentID" width="900px" height="600px">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'ParentID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'JobTitle'" dataType="string"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridPrimaryForeignKeyComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeePrimaryForeignKeyTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" expansionDepth="0" width="900px" height="600px"
        [paging]="true" [perPage]="10">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridExpandingComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" primaryKey="ID" childDataKey="Employees" expansionDepth="2" width="900px" height="500px"
        [paging]="true" [perPage]="10">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridCellSelectionComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeData();
}

// Test Component with 'string' dataType tree-column
@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" width="900px" height="600px">
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridStringTreeColumnComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeSmallTreeData();
}

// Test Component with 'date' dataType tree-column
@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" width="900px" height="600px">
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridDateTreeColumnComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeSmallTreeData();
}

// Test Component with 'boolean' dataType tree-column
@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" width="900px" height="600px">
        <igx-column [field]="'OnPTO'" dataType="boolean"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridBooleanTreeColumnComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeAllTypesTreeData();
}

// Test Component for CRUD tests
@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" primaryKey="ID" childDataKey="Employees" expansionDepth="2" width="900px" height="600px">
        <igx-column [field]="'ID'" dataType="number" [editable]="true"></igx-column>
        <igx-column [field]="'Name'" dataType="string" [editable]="true"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date" [editable]="true"></igx-column>
        <igx-column [field]="'Age'" dataType="number" [editable]="true"></igx-column>
        <igx-column [field]="'OnPTO'" dataType="boolean" [editable]="true"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridCrudComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeData();
}

// Test Component for tree-grid row editing
@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" primaryKey="ID" [rowEditable]='true' childDataKey="Employees" width="900px" height="600px">
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridRowEditingComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeSmallTreeData();
}

// Test Component for tree-grid filtering and row editing
@Component({
    template: `
        <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" [rowEditable]="true" width="900px" height="600px">
            <igx-column [field]="'HireDate'" dataType="date" [sortable]="true" [filterable]="true"></igx-column>
            <igx-column [field]="'Name'" dataType="string" [sortable]="true" [filterable]="true"></igx-column>
            <igx-column [field]="'ID'" dataType="number" [sortable]="true" [filterable]="true"></igx-column>
            <igx-column [field]="'Age'" dataType="number" [sortable]="true" [filterable]="true"></igx-column>
        </igx-tree-grid>
    `
})
export class IgxTreeGridFilteringRowEditingComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" primaryKey="ID" width="900px" height="600px">
        <igx-column [editable]="true" [field]="'ID'" dataTtype="number"></igx-column>
        <igx-column [editable]="true" [field]="'Name'" dataType="string"></igx-column>
        <igx-column [editable]="true" [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [editable]="true" [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridSelectionRowEditingComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" primaryKey="ID" width="900px" height="600px">
        <igx-column-group header="General Information" >
            <igx-column [field]="'ID'" dataType="number"></igx-column>
            <igx-column [field]="'Name'" dataType="string"></igx-column>
        </igx-column-group>
        <igx-column-group header="Additional Information">
            <igx-column [field]="'HireDate'" dataType="date"></igx-column>
            <igx-column [field]="'Age'" dataType="number"></igx-column>
        </igx-column-group>
    </igx-tree-grid>
    `
})
export class IgxTreeGridMultiColHeadersComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeSmallTreeData();
}


@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" expansionDepth="0" width="900px" height="1000px">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string" [hasSummary]="true"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date" [hasSummary]="true"></igx-column>
        <igx-column [field]="'Age'" dataType="number" [hasSummary]="true"></igx-column>
        <igx-column [field]="'OnPTO'" dataType="boolean" [hasSummary]="true"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridSummariesComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeData();
    public ageSummary = AgeSummary;
    public ageSummaryTest = AgeSummaryTest;
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" primaryKey="ID" foreignKey="ParentID" expansionDepth="0"
        width="400px" height="800px">
        <igx-column [field]="'ID'" width="150px" dataType="number"></igx-column>
        <igx-column [field]="'ParentID'" width="150px" dataType="number" [hasSummary]="true"></igx-column>
        <igx-column [field]="'Name'" width="150px" dataType="string" [hasSummary]="true"></igx-column>
        <igx-column [field]="'HireDate'" width="150px" dataType="date" [hasSummary]="true"></igx-column>
        <igx-column [field]="'Age'" width="150px" dataType="number" [hasSummary]="true"></igx-column>
        <igx-column [field]="'OnPTO'" width="150px" dataType="boolean" [hasSummary]="true"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridSummariesKeyScroliingComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeDataPrimaryForeignKey();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" primaryKey="ID" foreignKey="ParentID" expansionDepth="0"
        width="900px" height="1000px" [summaryCalculationMode]="calculationMode">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string" [hasSummary]="true"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date" [hasSummary]="true"></igx-column>
        <igx-column [field]="'Age'" dataType="number" [hasSummary]="true"></igx-column>
        <igx-column [field]="'OnPTO'" dataType="boolean" [hasSummary]="true"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridSummariesKeyComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeDataPrimaryForeignKey();
    public calculationMode = 'rootAndChildLevels';
    public ageSummary = AgeSummary;
    public ageSummaryTest = AgeSummaryTest;
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [batchEditing]="true" [data]="data" primaryKey="ID" foreignKey="ParentID" expansionDepth="0"
        width="800px" height="800px" [summaryCalculationMode]="calculationMode">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string" [hasSummary]="true"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date" [hasSummary]="false"></igx-column>
        <igx-column [field]="'Age'" dataType="number" [hasSummary]="true" [summaries]="ageSummary"></igx-column>
        <igx-column [field]="'OnPTO'" dataType="boolean" [hasSummary]="true"></igx-column>
        <igx-column [field]="'ParentID'" dataType="number" [hasSummary]="false"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridSummariesTransactionsComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeDataPrimaryForeignKey();
    public calculationMode = 'rootAndChildLevels';
    public ageSummary = AgeSummaryMinMax;
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
                if (!Number.isInteger(parseFloat(summaryResult))) {
                    obj.summaryResult = parseFloat(summaryResult).toLocaleString('en-us', { maximumFractionDigits: 2 });
                }
                return obj;
            }
        });
        return result;
    }
}

class AgeSummaryMinMax extends IgxNumberSummaryOperand {
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

class PTOSummary extends IgxSummaryOperand {
    constructor() {
        super();
    }

    public operate(summaries?: any[], allData = [], field?): IgxSummaryResult[] {
        const result = super.operate(summaries);
        if (field && field === 'Name') {
            result.push({
                key: 'test',
                label: 'People on PTO',
                summaryResult: allData.filter((rec) => rec.OnPTO).length
            });
        }
        return result;
    }
}

@Component({
    template: `
    <igx-tree-grid #treeGrid  [batchEditing]="true" [data]="data"
        primaryKey="ID" foreignKey="ParentID" [rowEditable]="true" width="900px" height="600px">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'ParentID'" dataType="number"></igx-column>
        <igx-column [editable]="true" [field]="'Name'" dataType="string"></igx-column>
        <igx-column [editable]="true" [field]="'JobTitle'" dataType="string"></igx-column>
        <igx-column [editable]="true" [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>`
})
export class IgxTreeGridRowEditingTransactionComponent {
    @ViewChild('treeGrid', { read: IgxTreeGridComponent, static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeePrimaryForeignKeyTreeData();
    public paging = false;
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" expansionDepth="0" width="900px" height="1000px">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string" [hasSummary]="true"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date" [hasSummary]="false"></igx-column>
        <igx-column [field]="'Age'" dataType="number" [hasSummary]="true" [summaries]="ageSummary"></igx-column>
        <igx-column [field]="'OnPTO'" dataType="boolean" [hasSummary]="true"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridCustomSummariesComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeData();
    public ageSummary = AgeSummary;
    public ageSummaryTest = AgeSummaryTest;
    public ptoSummary = PTOSummary;
}

@Component({
    template: `<igx-tree-grid #treeGrid [batchEditing]="true" [data]="data" primaryKey="ID" childDataKey="Employees"
    [rowEditable]="true" width="900px" height="600px">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [editable]="true" [field]="'Name'" dataType="string"></igx-column>
        <igx-column [editable]="true" [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [editable]="true" [field]="'Age'" dataType="number"></igx-column>
        <igx-column [editable]="true" [field]="'OnPTO'" dataType="boolean"></igx-column>
    </igx-tree-grid>`
})
export class IgxTreeGridRowEditingHierarchicalDSTransactionComponent {
    @ViewChild('treeGrid', { read: IgxTreeGridComponent, static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeAllTypesTreeData();
    public paging = false;
}

@Component({
    template: `<igx-tree-grid #treeGrid [data]="data" primaryKey="ID" childDataKey="Employees"
    [rowEditable]="true" width="900px" height="600px">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
        <igx-column [field]="'OnPTO'" dataType="boolean"></igx-column>
    </igx-tree-grid>`
})
export class IgxTreeGridRowPinningComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeAllTypesTreeData();
}

@Component({
    template:
        `<div [style.width.px]="outerWidth" [style.height.px]="outerHeight">
            <igx-tree-grid #treeGrid [data]="data" [displayDensity]="density"
                childDataKey="Employees" primaryKey="ID">
                <igx-column [field]="'ID'" dataType="number"></igx-column>
                <igx-column [field]="'Name'" dataType="string"></igx-column>
                <igx-column [field]="'HireDate'" dataType="date"></igx-column>
                <igx-column [field]="'Age'" dataType="number"></igx-column>
        </igx-tree-grid>
        </div>`
})

export class IgxTreeGridWrappedInContComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeData();

    public height = null;
    public paging = false;
    public pageSize = 5;
    public density: DisplayDensity = DisplayDensity.comfortable;
    public outerWidth = 800;
    public outerHeight: number;

    public isHorizontalScrollbarVisible() {
        const scrollbar = this.treeGrid.headerContainer.getScroll();
        if (scrollbar) {
            return scrollbar.offsetWidth < (scrollbar.children[0] as HTMLElement).offsetWidth;
        }

        return false;
    }

    public getVerticalScrollHeight() {
        const scrollbar = this.treeGrid.verticalScrollContainer.getScroll();
        if (scrollbar) {
            return parseInt(scrollbar.style.height, 10);
        }

        return 0;
    }

    public isVerticalScrollbarVisible() {
        const scrollbar = this.treeGrid.verticalScrollContainer.getScroll();
        if (scrollbar && scrollbar.offsetHeight > 0) {
            return scrollbar.offsetHeight < (scrollbar.children[0] as HTMLElement).offsetHeight;
        }
        return false;
    }

}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" primaryKey="employeeID" foreignKey="PID" width="900px" height="800px">
        <igx-column [field]="'employeeID'" dataType="number"></igx-column>
        <igx-column [field]="'firstName'"></igx-column>
        <igx-column [field]="'lastName'"></igx-column>
        <igx-column [field]="'Salary'" dataType="number" [hasSummary]="true" ></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridSummariesScrollingComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeScrollingData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" width="900px" height="600px">
        <igx-column [field]="'JobTitle'" dataType="string"></igx-column>
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridSearchComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeSearchTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" primaryKey="ID" foreignKey="ParentID"
                   [loadChildrenOnDemand]="loadChildren"
                   width="900px" height="600px">
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'ParentID'" dataType="number"></igx-column>
        <igx-column [field]="'JobTitle'" dataType="string"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridLoadOnDemandComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public allData = SampleTestData.employeePrimaryForeignKeyTreeData();
    public data = [];

    constructor() {
        this.data = this.allData.filter(r => r.ParentID === -1);
    }

    public loadChildren = (parentID: any, done: (children: any[]) => void) => {
        setTimeout(() => {
            done(this.allData.filter(r => r.ParentID === parentID));
        }, 1000);
    };
}
@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" primaryKey="ID" foreignKey="ParentID" width="500px" height="600px"columnWidth="150px" >
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
        <igx-column [field]="'OnPTO'" dataType="boolean"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridSelectionKeyComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeDataPrimaryForeignKey();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" primaryKey="ID" childDataKey="Employees"
                   [loadChildrenOnDemand]="loadChildren"
                   width="900px" height="600px">
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'ParentID'" dataType="number"></igx-column>
        <igx-column [field]="'JobTitle'" dataType="string"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridLoadOnDemandChildDataComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public allData = SampleTestData.employeePrimaryForeignKeyTreeData();
    public data = [];

    constructor() {
        this.data = this.allData.filter(r => r.ParentID === -1);
    }

    public loadChildren = (parentID: any, done: (children: any[]) => void) => {
        setTimeout(() => {
            done(this.allData.filter(r => r.ParentID === parentID));
        }, 1000);
    };
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" width="500px" height="600px"columnWidth="150px">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
        <igx-column [field]="'OnPTO'" dataType="boolean"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridSelectionComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" primaryKey="ID" foreignKey="ParentID"
                   [loadChildrenOnDemand]="loadChildren" hasChildrenKey="hasEmployees"
                   width="900px" height="600px">
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'ParentID'" dataType="number"></igx-column>
        <igx-column [field]="'JobTitle'" dataType="string"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridLoadOnDemandHasChildrenComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public allData = SampleTestData.employeePrimaryForeignKeyTreeData();
    public data = [];

    constructor() {
        this.data = this.getChildren(-1);
    }

    public loadChildren = (parentID: any, done: (children: any[]) => void) => {
        setTimeout(() => {
            const children = this.getChildren(parentID);
            done(children);
        }, 1000);
    };

    private getChildren(parentID) {
        const children = this.allData.filter(r => r.ParentID === parentID);

        for (const child of children) {
            child['hasEmployees'] = this.allData.some(r => r.ParentID === child.ID);
        }
        return children;
    }
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [batchEditing]="true"
        [data]="data" childDataKey="Employees" width="800px" height="600px" columnWidth="150px" primaryKey="ID">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
        <igx-column [field]="'OnPTO'" dataType="boolean"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridSelectionWithTransactionComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [batchEditing]="true"
    [data]="data" primaryKey="ID" foreignKey="ParentID" width="500px" height="600px"columnWidth="150px" >
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
        <igx-column [field]="'OnPTO'" dataType="boolean"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridFKeySelectionWithTransactionComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeDataPrimaryForeignKey();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" [autoGenerate]="true" primaryKey="ID" foreignKey="ParentID" width="900px" height="600px">
    </igx-tree-grid>
    `
})
export class IgxTreeGridAutoGenerateComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeePrimaryForeignKeyTreeData();

    public clearData(){
        this.data = [];
    }
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" primaryKey="ID" foreignKey="ParentID" width="900px" height="600px">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
        <igx-column [field]="'OnPTO'" dataType="boolean"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridDefaultLoadingComponent implements OnInit {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = [];

    public ngOnInit(): void {
        this.treeGrid.isLoading = true;
        setTimeout(() => {
            this.data = SampleTestData.employeePrimaryForeignKeyTreeData();
            this.treeGrid.isLoading = false;
        }, 1000);
    }
}

@Component({
    template: `
    <igx-tree-grid #treeGridCustomSelectors
        [data]="data" primaryKey="ID" foreignKey="ParentID"
        [paging]="true" [perPage]="5" [rowSelection]="'multiple'" width="900px" height="600px">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
        <igx-column [field]="'OnPTO'" dataType="boolean"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <ng-template igxRowSelector let-rowContext>
        <span class="rowNumber">{{ rowContext.index }}</span>
            <igx-checkbox [checked]="rowContext.selected" (click)="onRowCheckboxClick($event, rowContext)"></igx-checkbox>
        </ng-template>
        <ng-template igxHeadSelector let-headContext>
            <igx-checkbox
                [checked]="headContext.totalCount === headContext.selectedCount"
                [indeterminate]="headContext.totalCount !== headContext.selectedCount && headContext.selectedCount !== 0"
                (click)="onHeaderCheckboxClick($event, headContext)">
            </igx-checkbox>
        </ng-template>
    </igx-tree-grid>`
})
export class IgxTreeGridCustomRowSelectorsComponent implements OnInit {
    @ViewChild(IgxTreeGridComponent, { static: true })
    public treeGrid: IgxTreeGridComponent;
    public data = [];

    public ngOnInit(): void {
        this.data = SampleTestData.employeePrimaryForeignKeyTreeData();
    }

    public onRowCheckboxClick(event, rowContext) {
        event.stopPropagation();
        event.preventDefault();
        if (rowContext.selected) {
            this.treeGrid.deselectRows([rowContext.rowID]);
        } else {
            this.treeGrid.selectRows([rowContext.rowID]);
        }
    }

    public onHeaderCheckboxClick(event, headContext) {
        event.stopPropagation();
        event.preventDefault();
        if (headContext.selected) {
            this.treeGrid.deselectAllRows();
        } else {
            this.treeGrid.selectAllRows();
        }
    }
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" width="900px" height="600px">
        <igx-column [field]="'ID'" dataType="number" [sortable]="true"></igx-column>
        <igx-column [field]="'Name'" dataType="string" [sortable]="true"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date" [sortable]="true"></igx-column>
        <igx-column [field]="'Age'" dataType="number" [sortable]="true"></igx-column>
        <ng-template igxRowExpandedIndicator>
        <span>EXPANDED</span>
        </ng-template>
        <ng-template igxRowCollapsedIndicator>
            <span>COLLAPSED</span>
        </ng-template>
    </igx-tree-grid>
    `
})
export class IgxTreeGridCustomExpandersTemplateComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" primaryKey="ID" foreignKey="ParentID" width="900px" height="600px" [rowEditable]="true">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'ParentID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'JobTitle'" dataType="string"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
        <igx-action-strip #actionStrip>
        <igx-grid-editing-actions [addRow]="true" [addChild]='true'></igx-grid-editing-actions>
    </igx-action-strip>
    </igx-tree-grid>
    `
})
export class IgxTreeGridEditActionsComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    @ViewChild('actionStrip', { read: IgxActionStripComponent, static: true })
    public actionStrip: IgxActionStripComponent;
    public data = SampleTestData.employeePrimaryForeignKeyTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" primaryKey="ID" [rowSelection]="'multipleCascade'"
     width="900px" height="600px" [rowEditable]="true">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
        <igx-action-strip #actionStrip>
        <igx-grid-editing-actions [addRow]="true" [addChild]='true'></igx-grid-editing-actions>
    </igx-action-strip>
    </igx-tree-grid>
    `
})
export class IgxTreeGridCascadingSelectionComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    @ViewChild('actionStrip', { read: IgxActionStripComponent, static: true })
    public actionStrip: IgxActionStripComponent;
    public data = SampleTestData.employeeSmallTreeData();
}
@Component({
    template: `
    <igx-tree-grid #treeGrid [batchEditing]="true"
    [data]="data" childDataKey="Employees" [rowSelection]="'multipleCascade'"
    width="800px" height="600px" columnWidth="150px" primaryKey="ID">
    <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
        <igx-action-strip #actionStrip>
        <igx-grid-editing-actions [addRow]="true" [addChild]='true'></igx-grid-editing-actions>
    </igx-action-strip>
    </igx-tree-grid>
    `
})
export class IgxTreeGridCascadingSelectionTransactionComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    @ViewChild('actionStrip', { read: IgxActionStripComponent, static: true })
    public actionStrip: IgxActionStripComponent;
    public data = SampleTestData.employeeSmallTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data | treeGridGrouping:groupingExpressions:groupKey:childDataKey:treeGrid:aggregations"
            [childDataKey]="childDataKey" expansionDepth="0" width="900px" height="1000px">
        <igx-tree-grid-group-by-area
            [grid]="treeGrid"
            [(expressions)]='groupingExpressions'
            [hideGroupedColumns]="false">
        </igx-tree-grid-group-by-area>
        <igx-column [field]='groupKey' [resizable]='true' [width]="'250px'" [hidden]="groupingExpressions.length === 0"></igx-column>
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'JobTitle'" dataType="string"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
        <igx-column [field]="'OnPTO'" dataType="boolean"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridGroupingComponent {
    @ViewChild(IgxTreeGridGroupByAreaComponent, { static: true }) public groupByArea: IgxTreeGridGroupByAreaComponent;
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeDataPrimaryForeignKeyExt();
    public groupKey = 'GK_Employees';
    public groupedInitially = true;
    public childDataKey='Employees';
    public groupingExpressions: IGroupingExpression[] =
        [
            { fieldName: 'OnPTO', dir: 1, ignoreCase: true, strategy: DefaultSortingStrategy.instance() },
            { fieldName: 'HireDate', dir: 2, ignoreCase: true, strategy: DefaultSortingStrategy.instance() }
        ];
    public aggregations = [];
}

@Component({
    template: `
    <div>
        <igx-tree-grid-group-by-area #groupArea [grid]="treeGrid">
        </igx-tree-grid-group-by-area>
        <igx-tree-grid #treeGrid>
        </igx-tree-grid>
    </div>
    `
})
export class IgxTreeGridGroupByAreaTestComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    @ViewChild(IgxTreeGridGroupByAreaComponent, { static: true }) public groupByArea: IgxTreeGridGroupByAreaComponent;
}

