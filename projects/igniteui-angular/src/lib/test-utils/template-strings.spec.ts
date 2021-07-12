export class GridTemplateStrings {

    public static basicGrid = `
    <igx-grid
        [data]="data">
    </igx-grid>`;

    public static gridAutoGenerate = `
    <igx-grid
        [data]="data"
        [autoGenerate]="autoGenerate">
    </igx-grid>`;

    public static gridWithSize = `
    <igx-grid
        [data]="data"
        [autoGenerate]="autoGenerate"
        [height]="height" [width]="width">
    </igx-grid>`;

    public static declareGrid(attributes = ``, events = ``, columnDefinitions: ColumnDefinitions = ``,
            toolbarDefinition = '', paginatorDefinition = '') {
        return `<igx-grid [data]="data"
        ${ attributes}
        ${ events}
        >
        ${ toolbarDefinition }
        ${ columnDefinitions}
        ${ paginatorDefinition }
    </igx-grid>`;
    }

    public static declareBasicGridWithColumns(columnDefinitions: ColumnDefinitions) {
        return GridTemplateStrings.declareGrid(``, ``, columnDefinitions);
    }

}

export class ColumnDefinitions {

    public static idNameJobTitle = `
        <igx-column field="ID"></igx-column>
        <igx-column field="Name"></igx-column>
        <igx-column field="JobTitle"></igx-column>
    `;

    public static idNameJobTitleEditable = `
        <igx-column field="ID"></igx-column>
        <igx-column field="Name" [editable]="true"></igx-column>
        <igx-column field="JobTitle" [editable]="true"></igx-column>
    `;

    public static idNameJobTitleCompany = `
        <igx-column field="ID"></igx-column>
        <igx-column field="Name"></igx-column>
        <igx-column field="JobTitle"></igx-column>
        <igx-column field="Company"></igx-column>
    `;

    public static idNameJobHireDate = `
        <igx-column field="ID"></igx-column>
        <igx-column field="Name"></igx-column>
        <igx-column field="JobTitle"></igx-column>
        <igx-column field="HireDate"></igx-column>
    `;

    public static idNameJobHireWithTypes = `
        <igx-column field="ID" dataType="number"></igx-column>
        <igx-column field="Name" dataType="string"></igx-column>
        <igx-column field="JobTitle" dataType="string"></igx-column>
        <igx-column field="HireDate" dataType="date"></igx-column>
    `;

    public static idNameJobHireSortable = `
        <igx-column field="ID" [sortable]="true"></igx-column>
        <igx-column field="Name" [sortable]="true"></igx-column>
        <igx-column field="JobTitle" [sortable]="true"></igx-column>
        <igx-column field="HireDate" [sortable]="true"></igx-column>
    `;

    public static idNameHiddenJobHirePinned = `
        <igx-column field="ID"></igx-column>
        <igx-column field="Name" hidden="true"></igx-column>
        <igx-column field="JobTitle"></igx-column>
        <igx-column field="HireDate" [pinned]="true"></igx-column>
    `;

    public static idNameJobHoursHireDatePerformance = `
        <igx-column field="ID"></igx-column>
        <igx-column field="Name"></igx-column>
        <igx-column field="JobTitle"></igx-column>
        <igx-column field="WorkingHours"></igx-column>
        <igx-column field="HireDate"></igx-column>
        <igx-column field="Performance"></igx-column>
    `;

    public static hireDate = `
        <igx-column field="HireDate" [dataType]="'date'"></igx-column>
    `;

    public static nameJobTitleId = `
        <igx-column field="Name"></igx-column>
        <igx-column field="JobTitle"></igx-column>
        <igx-column field="ID"></igx-column>
    `;

    public static nameAgeEditable = `
        <igx-column field="FirstName" [editable]="true"></igx-column>
        <igx-column field="LastName"></igx-column>
        <igx-column field="age"></igx-column>
    `;

    public static nameAvatar = `
    <igx-column [field]="'Name'" dataType="string"></igx-column>
    <igx-column [field]="'Avatar'" header="Photo" [searchable]="false">
        <ng-template igxCell let-cell="cell">
            <div class="cell__inner avatar-cell">
                <img [src]="cell.row.data.Avatar" width="30px" height="30px"/>
            </div>
        </ng-template>
    </igx-column>
    `;

    public static idFirstLastNameSortable = `
        <igx-column headerClasses="header-id" [sortable]="true" field="ID"></igx-column>
        <igx-column [sortable]="true" field="Name"></igx-column>
        <igx-column [sortable]="true" field="LastName"></igx-column>
    `;

    public static resizableThreeOfFour = `
        <igx-column [resizable]="true" field="ID" width="100px"></igx-column>
        <igx-column [resizable]="true" [minWidth]="'70px'" [maxWidth]="'250px'" field="Name" width="100px"></igx-column>
        <igx-column [resizable]="false" [sortable]="true" field="LastName" width="100px"></igx-column>
        <igx-column [resizable]="true" field="Region" width="100px"></igx-column>
    `;

    public static pinnedTwoOfFour = `
        <igx-column [pinned]="true" [resizable]="true" field="ID" width="100px"></igx-column>
        <igx-column [pinned]="true" [resizable]="true" field="Name" width="100px" [maxWidth]="'150px'"></igx-column>
        <igx-column [resizable]="true" field="LastName" width="100px"></igx-column>
        <igx-column [resizable]="true" field="Region" width="100px"></igx-column>
    `;

    public static pinnedThreeOfEight = `
        <igx-column [field]="'Released'" [pinned]="true" width="100px" dataType="boolean" [resizable]="true"></igx-column>
        <igx-column [field]="'ReleaseDate'" [pinned]="true" width="100px" dataType="date" [resizable]="true"></igx-column>
        <igx-column [field]="'Items'" [pinned]="true" width="100px" dataType="string" [resizable]="true"></igx-column>
        <igx-column [field]="'ID'" [width]="'100px'" [header]="'ID'" [resizable]="true"></igx-column>
        <igx-column [field]="'ProductName'" width="25px" [maxWidth]="'100px'" dataType="string" [resizable]="true"></igx-column>
        <igx-column [field]="'Test'" width="100px" dataType="string" [resizable]="true">
            <ng-template igxCell>
                <div></div>
            </ng-template>
        </igx-column>
        <igx-column [field]="'Downloads'" width="100px" dataType="number" [resizable]="true"></igx-column>
        <igx-column [field]="'Category'" width="100px" dataType="string" [resizable]="true"></igx-column>
    `;

    public static gridFeatures = `
        <igx-column [field]="'ID'" [width]="'150px'" [sortable]="true" [resizable]="true"></igx-column>
        <igx-column [field]="'ProductName'" [width]="'150px'" [resizable]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [sortable]="true" [header]="'D'" [width]="'150px'" [resizable]="true" dataType="number">
        </igx-column>
        <igx-column [field]="'Released'" [header]="'Re'" [resizable]="true" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [resizable]="true" dataType="date"></igx-column>
        <igx-column [field]="'Category'" [width]="'150px'" [resizable]="true" dataType="string">
            <ng-template igxCell igxHeader>
                <igx-avatar initials="JS"></igx-avatar>
            </ng-template>
        </igx-column>
        <igx-column [field]="'Items'" [width]="'60px'" [hasSummary]="true" [resizable]="true" dataType="string"></igx-column>
        <igx-column [field]="'Test'" [resizable]="true" dataType="string"></igx-column>
    `;

    public static resizableColsComponent = `
        <igx-column *ngFor="let c of columns" [field]="c.field"
                                              [header]="c.field"
                                              [resizable]="c.resizable"
                                              [width]="c.width"
                                              [minWidth]="c.minWidth"
                                              [maxWidth]="c.maxWidth">
        </igx-column>
    `;

    public static iterableComponent = `
        <igx-column *ngFor="let each of columns" [field]="each"></igx-column>
    `;

    public static columnTemplates = `
    <igx-column field="ID">
        <ng-template igxHeader>
            <span class="header">Header text</span>
        </ng-template>

        <ng-template igxCell>
            <span class="cell">Cell text</span>
        </ng-template>

        <ng-template igxFooter>
            <span class="footer">Footer text</span>
        </ng-template>
    </igx-column>
    <igx-column field="Name">
        <ng-template igxHeader>
            <span class="header">Header text</span>
        </ng-template>

        <ng-template igxCell>
            <span class="cell">Cell text</span>
        </ng-template>

        <ng-template igxFooter>
            <span class="footer">Footer text</span>
        </ng-template>
    </igx-column>
    `;

    public static idNameFormatter = `
        <igx-column field="ID" [formatter]="multiplier"></igx-column>
        <igx-column field="Name"></igx-column>
    `;

    public static productHidable = `
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" [disableHiding]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [hidden]="true" dataType="number"></igx-column>
        <igx-column [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" dataType="date"></igx-column>
    `;

    public static productFilterable = `
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" [filterable]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [filterable]="true" dataType="number"></igx-column>
        <igx-column [field]="'Released'" [filterable]="true" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'"
            [filterable]="true" dataType="date">
        </igx-column>
    `;

    public static productDefaultSummaries = `
        <igx-column field="ProductID" width="150px" header="Product ID">
        </igx-column>
        <igx-column field="ProductName" width="150px" [hasSummary]="true">
        </igx-column>
        <igx-column field="InStock" width="150px" [dataType]="'boolean'" [hasSummary]="true">
        </igx-column>
        <igx-column field="UnitsInStock" width="150px" [dataType]="'number'" [hasSummary]="true">
        </igx-column>
        <igx-column field="OrderDate" width="200px" [dataType]="'date'" [sortable]="true" [hasSummary]="true">
        </igx-column>
    `;

    public static productBasic = `
        <igx-column field="ProductID" header="Product ID">
        </igx-column>
        <igx-column field="ProductName">
        </igx-column>
        <igx-column field="InStock" [dataType]="'boolean'">
        </igx-column>
        <igx-column field="UnitsInStock" [dataType]="'number'">
        </igx-column>
        <igx-column field="OrderDate" width="200px" [dataType]="'date'">
        </igx-column>
    `;

    public static productBasicNumberID = `
        <igx-column field="ProductID" header="Product ID" [dataType]="'number'">
        </igx-column>
        <igx-column field="ProductName">
        </igx-column>
        <igx-column field="InStock" [dataType]="'boolean'">
        </igx-column>
        <igx-column field="UnitsInStock" [dataType]="'number'">
        </igx-column>
        <igx-column field="OrderDate" width="200px" [dataType]="'date'">
        </igx-column>
    `;

    public static productSummariesAndFilter = `
        <igx-column field="ProductID" header="Product ID">
        </igx-column>
        <igx-column field="ProductName" [hasSummary]="true">
        </igx-column>
        <igx-column field="InStock" [dataType]="'boolean'" [hasSummary]="true">
        </igx-column>
        <igx-column field="UnitsInStock" [dataType]="'number'" [hasSummary]="true" [filterable]="true">
        </igx-column>
        <igx-column field="OrderDate" width="200px" [dataType]="'date'" [sortable]="true" [hasSummary]="true">
        </igx-column>
    `;

    public static indexAndValue = `
        <igx-column field="index" header="index" dataType="number"></igx-column>
        <igx-column field="value" header="value" dataType="number"></igx-column>
    `;

    public static generatedWithSummaries = `
        <igx-column *ngFor="let c of columns" [field]="c.field" [header]="c.header" [hasSummary]="true">
        </igx-column>
    `;

    public static generatedWithDataType = `
        <igx-column *ngFor="let c of columns" [field]="c.field" [header]="c.field" [dataType]="c.dataType">
        </igx-column>
    `;

    public static generatedEditable = `
    <igx-column *ngFor="let col of columns"
            [field]="col.key"
            [header]="col.key"
            [dataType]="col.dataType"
            [editable]="col.editable"></igx-column>
    `;

    public static generatedWithWidth = `
        <igx-column  *ngFor="let c of columns" [field]="c.field" [header]="c.field" [width]="c.width">
        </igx-column>
    `;

    public static productFilterSortPin = `
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" [filterable]="true" [sortable]="true" [pinned]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [filterable]="true" dataType="number"></igx-column>
        <igx-column [field]="'Released'" [filterable]="true" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'"
            [filterable]="true" dataType="date">
        </igx-column>
    `;

    public static productAllColumnFeatures = `
        <igx-column [field]="'ID'" [header]="'ID'" [pinned]="true" [resizable]="false"
                    [disableHiding]="true"></igx-column>
        <igx-column [field]="'ProductName'" dataType="string" [filterable]="true" [sortable]="true"
                    [resizable]="true" [hasSummary]="true" [editable]="true"></igx-column>
        <igx-column [field]="'Downloads'" dataType="number" [filterable]="true" [sortable]="true"
                    [resizable]="true" [moveable]="true"></igx-column>
        <igx-column [field]="'Released'" dataType="boolean" [filterable]="true" [resizable]="true"
                    [moveable]="true" [editable]="true"></igx-column>
        <igx-column [field]="'ReleaseDate'" dataType="date" [header]="'ReleaseDate'" [filterable]="true"
                    [sortable]="true" [resizable]="true" [editable]="true">
        </igx-column>
    `;

    public static movableColumns = `
        <igx-column [movable]="true" field="ID" width="150px"
                    [resizable]="isResizable"
                    [editable]="isEditable"
                    [sortable]="isSortable"
                    [hidden]="isHidden"
                    [groupable]="isGroupable"
                    [filterable]="isFilterable">
        </igx-column>
        <igx-column [movable]="true" field="Name" width="150px"
                    [resizable]="isResizable"
                    [editable]="isEditable"
                    [sortable]="isSortable"
                    [filterable]="isFilterable">
        </igx-column>
        <igx-column [movable]="false" field="LastName" width="150px"
                    [resizable]="isResizable"
                    [editable]="isEditable"
                    [sortable]="isSortable"
                    [filterable]="isFilterable">
        </igx-column>
        <igx-column [movable]="true" field="Region" width="150px"
                    [resizable]="isResizable"
                    [editable]="isEditable"
                    [sortable]="isSortable"
                    [filterable]="isFilterable">
        </igx-column>
    `;

    public static multiColHeadersColumns = `
        <igx-column [width]="'100px'" [movable]="true" [resizable]="true" [pinned]="isPinned"
                    [sortable]="true" [filterable]="true" field="Missing"></igx-column>
        <igx-column-group [movable]="true" header="General Information">
            <igx-column [movable]="true" [width]="'130px'" [filterable]="true" [sortable]="true" field="CompanyName"></igx-column>
            <igx-column-group [movable]="true" header="Person Details">
                <igx-column [movable]="true" [width]="'100px'" field="ContactName"></igx-column>
                <igx-column [movable]="true" [filterable]="true" [sortable]="true" field="ContactTitle"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column [movable]="true" [resizable]="true" field="ID"></igx-column>
        <igx-column-group [movable]="true" header="Address Information">
            <igx-column field="Country" [width]="'90px'">
                <ng-template igxHeader let-column>
                    {{ column.field }}
                </ng-template>
                <ng-template igxCell let-cell="cell" let-val let-row>
                    {{val}}
                </ng-template>
            </igx-column>
            <igx-column [movable]="true" [width]="'150px'" field="Region"></igx-column>
            <igx-column [movable]="true" field="City"></igx-column>
            <igx-column [movable]="true" field="Address"></igx-column>
        </igx-column-group>
  `;

    public static multiColHeadersWithGroupingColumns = `
  <igx-column [width]="'100px'" [movable]="true" [resizable]="true" [pinned]="false"
              [sortable]="true" [filterable]="true" field="Missing"></igx-column>
  <igx-column-group [movable]="true" header="General Information" [groupable]="true"  [pinned]="isPinned">
      <igx-column [movable]="true" [width]="'130px'" [filterable]="true" [sortable]="true" field="CompanyName"></igx-column>
      <igx-column-group [movable]="true" header="Person Details">
          <igx-column [movable]="true" [width]="'100px'" field="ContactName"></igx-column>
          <igx-column [movable]="true" [width]="'100px'"[filterable]="true" [sortable]="true" field="ContactTitle"></igx-column>
      </igx-column-group>
  </igx-column-group>
  <igx-column [movable]="true" [resizable]="true" field="ID" [width]="'100px'" [groupable]="true"></igx-column>
`;

    public static contactInfoGroupableColumns = `
    <igx-column [movable]="true" [hasSummary]="true" [resizable]="true"
                [pinned]="true" field="Missing"></igx-column>
    <igx-column-group [movable]="true" [pinned]="false" header="General Information">
        <igx-column [movable]="true" [filterable]="true" [sortable]="true"
                [resizable]="true" field="CompanyName"></igx-column>
        <igx-column-group [movable]="true" header="Person Details">
            <igx-column [movable]="true" [pinned]="false" [filterable]="true"
                [sortable]="true" [resizable]="true" field="ContactName"></igx-column>
            <igx-column [movable]="true" [hasSummary]="true" [filterable]="true"
                [sortable]="true" [resizable]="true" field="ContactTitle"></igx-column>
        </igx-column-group>
    </igx-column-group>
    <igx-column field="ID" [movable]="true" [hasSummary]="true" [resizable]="true"
                [editable]="true"></igx-column>
    `;

    public static summariesGroupByColumns = `
    <igx-column [field]="'ID'" dataType="number" width="150px" [hasSummary]="false" [groupable]="true"></igx-column>
    <igx-column [field]="'ParentID'" width="150px" dataType="number" [hasSummary]="true" [groupable]="true"></igx-column>
    <igx-column [field]="'Name'" width="150px" dataType="string" [hasSummary]="true" [groupable]="true"></igx-column>
    <igx-column [field]="'HireDate'" width="150px" dataType="date" [hasSummary]="true" [groupable]="true"></igx-column>
    <igx-column [field]="'Age'" width="150px" dataType="number" [hasSummary]="true" [groupable]="true"></igx-column>
    <igx-column [field]="'OnPTO'" width="150px" dataType="boolean" [hasSummary]="true" [groupable]="true"></igx-column>
    `;

    public static summariesGroupByTansColumns = `
    <igx-column [field]="'ID'" dataType="number" width="150px" [hasSummary]="false" [groupable]="true"></igx-column>
    <igx-column [field]="'ParentID'" width="150px" dataType="number" [hasSummary]="false" [groupable]="true"></igx-column>
    <igx-column [field]="'Name'" width="150px" dataType="string" [hasSummary]="true" [groupable]="true"></igx-column>
    <igx-column [field]="'HireDate'" width="150px" dataType="date" [hasSummary]="true" [groupable]="true"></igx-column>
    <igx-column [field]="'Age'" width="150px" dataType="number" [hasSummary]="true"
        [groupable]="true" [summaries]="ageSummaryMinMax"></igx-column>
    <igx-column [field]="'OnPTO'" width="150px" dataType="boolean" [hasSummary]="true" [groupable]="true"></igx-column>
    `;

    public static selectionWithScrollsColumns = `
    <igx-column [field]="'ID'" dataType="number" width="150px" ></igx-column>
    <igx-column [field]="'ParentID'" width="150px" dataType="number" ></igx-column>
    <igx-column [field]="'Name'" width="150px" dataType="string"></igx-column>
    <igx-column [field]="'HireDate'" width="150px" dataType="date"></igx-column>
    <igx-column [field]="'Age'" width="150px" dataType="number"></igx-column>
    <igx-column [field]="'OnPTO'" width="150px" dataType="boolean"></igx-column>
    `;

    public static exportGroupedDataColumns = `
    <igx-column [field]="'Price'" dataType="number" [groupable]="true"></igx-column>
    <igx-column [field]="'Brand'" dataType="string" [groupable]="true"></igx-column>
    <igx-column [field]="'Model'" dataType="string" [groupable]="true"></igx-column>
    <igx-column [field]="'Edition'" dataType="string" [groupable]="true"></igx-column>
    `;

    public static multiColHeadersExportColumns = `
        <igx-column [movable]="true" [resizable]="true" field="ID" [filterable]="false"></igx-column>
        <igx-column-group [movable]="true" header="General Information" [collapsible]="true" [expanded]="true">
            <igx-column [movable]="true" field="CompanyName" [visibleWhenCollapsed]="true"></igx-column>
            <igx-column-group [movable]="true" header="Personal Details" [collapsible]="true" [expanded]="false"
                [visibleWhenCollapsed]="false">
                <igx-column [movable]="true" field="ContactName"></igx-column>
                <igx-column [movable]="true" field="ContactTitle"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column-group header="Address Information">
            <igx-column-group header="Location" [collapsible]="true" [expanded]="false" [visibleWhenCollapsed]="true">
                <igx-column field="Country" [visibleWhenCollapsed]="true" [hidden]="true"></igx-column>
                <igx-column field="Region" [visibleWhenCollapsed]="false" [hidden]="true"></igx-column>
                <igx-column field="City" [visibleWhenCollapsed]="false" [hidden]="true"></igx-column>
                <igx-column field="Address" [visibleWhenCollapsed]="false" [hidden]="true"></igx-column>
            </igx-column-group>
            <igx-column-group header="Contact Information">
                <igx-column field="Phone"></igx-column>
                <igx-column field="Fax"></igx-column>
                <igx-column field="PostalCode"></igx-column>
            </igx-column-group>
        </igx-column-group>
    `;
}

export class EventSubscriptions {

    public static columnInit = ` (columnInit)="columnInit($event)"`;

    public static selected = ` (selected)="cellSelected($event)"`;

    public static onCellClick = ` (onCellClick)="cellClick($event)"`;

    public static doubleClick = ` (doubleClick)="doubleClick($event)"`;

    public static contextMenu = ` (contextMenu)="cellRightClick($event)"`;

    public static columnPin = ` (columnPin)="columnPinning($event)"`;

    public static rowAdded = ` (rowAdded)="rowAdded($event)"`;

    public static rowDeleted = ` (rowDeleted)="rowDeleted($event)"`;

    public static onEditDone = ` (cellEdit)="editDone($event)"`;

    public static rowSelected = ` (rowSelected)="rowSelected($event)"`;

    public static columnResized = ` (columnResized)="columnResized($event)"`;

    public static columnMovingStart = ` (columnMovingStart)="columnMovingStarted($event)"`;

    public static columnMoving = ` (columnMoving)="columnMoving($event)"`;

    public static columnMovingEnd = ` (columnMovingEnd)="columnMovingEnded($event)"`;
}
