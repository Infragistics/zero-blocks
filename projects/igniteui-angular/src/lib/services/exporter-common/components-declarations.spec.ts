import { Component, ViewChild } from '@angular/core';
import { IgxGridComponent } from '../../grids/grid/grid.component';
import { ExportTestDataService } from '../excel/test-data.service.spec';

@Component({
    template: `
    <igx-grid #grid1 [data]="data">
        <igx-column field="ID"></igx-column>
        <igx-column field="Name" [editable]="true"></igx-column>
        <igx-column field="JobTitle" [editable]="true"></igx-column>
    </igx-grid>
    `
})
export class GridDeclarationComponent {
    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    public grid1: IgxGridComponent;

    public data = new ExportTestDataService().simpleGridData;
}

@Component({
    template: `
        <igx-grid #grid1 [data]="data">
            <igx-column field="ID"></igx-column>
            <igx-column field="Name"></igx-column>
            <igx-column field="JobTitle"></igx-column>
            <igx-paginator [perPage]="5"></igx-paginator>
        </igx-grid>
    `
})
export class GridMarkupPagingDeclarationComponent {
    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    public grid1: IgxGridComponent;

    public data = new ExportTestDataService().simpleGridData;
}

@Component({
    template: `
    <igx-grid #grid1 [data]="data">
        <igx-column field="Name"></igx-column>
        <igx-column field="JobTitle"></igx-column>
        <igx-column field="ID"></igx-column>
    </igx-grid>
    `
})
export class GridReorderedColumnsComponent {
    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    public grid1: IgxGridComponent;

    public data = new ExportTestDataService().simpleGridData;
}
