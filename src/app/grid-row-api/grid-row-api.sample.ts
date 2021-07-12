import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import {
    IgxGridComponent,
    IgxTransactionService,
    IgxGridTransaction,
    RowType,
    IgxTreeGridComponent,
    IgxHierarchicalGridComponent,
    IPinningConfig,
    RowPinningPosition,
    IRowDragStartEventArgs,
		GridSummaryCalculationMode,
		GridSummaryPosition
} from 'igniteui-angular';
import { HIERARCHICAL_SAMPLE_DATA } from '../shared/sample-data';

@Component({
    selector: 'app-grid-row-api-sample',
    styleUrls: ['grid-row-api.sample.css'],
    templateUrl: 'grid-row-api.sample.html'
})

export class GridRowAPISampleComponent implements OnInit {
    @ViewChild('grid', { static: true })
    private grid: IgxGridComponent;

    @ViewChild('targetGrid', { static: true })
    private targetGrid: IgxGridComponent;

    @ViewChild('treeGridHier', { static: true })
    private treeGridHier: IgxTreeGridComponent;

    @ViewChild('hGrid', { static: true })
    private hGrid: IgxTreeGridComponent;
    public countIcon = 'drag_indicator';
    public dragIcon = 'arrow_right_alt';
    public data2: any;
    public data: any[];
    public treeGridHierData: any[];
    public hierarchicalData: any[];
    public columns: any[];
    public hColumns: any[];
    public treeGridHierColumns: any[];
    public treeColumns: any[];
    public treeData: any[];

    public index = 0;
    public tIndex = 0;
    public tHIndex = 0;
    public hIndex = 0;

    public key = '';
    public tKey = '';
    public tHKey = '';
    public hKey = '';

    public pinningConfig: IPinningConfig = { rows: RowPinningPosition.Top };

    constructor(private renderer: Renderer2) { }

    public ngOnInit(): void {
			this.grid.summaryCalculationMode = GridSummaryCalculationMode.childLevelsOnly;
			this.grid.summaryPosition = GridSummaryPosition.bottom;

			this.treeGridHier.summaryCalculationMode = GridSummaryCalculationMode.childLevelsOnly;
        this.columns = [
            { field: 'ID', width: '200px', hidden: true },
            { field: 'CompanyName', width: '200px', groupable: true },
            { field: 'ContactName', width: '200px', pinned: false, groupable: true },
            { field: 'ContactTitle', width: '300px', pinned: false, groupable: true },
            { field: 'Address', width: '250px' },
            { field: 'City', width: '200px' },
            { field: 'Region', width: '300px' },
            { field: 'PostalCode', width: '150px' },
            { field: 'Phone', width: '200px' },
            { field: 'Fax', width: '200px' }
        ];

        this.hColumns = [
            { field: 'ID', width: '200px' },
            { field: 'ChildLevels', width: '200px' },
            { field: 'ProductName', width: '200px' },
            { field: 'Col1', width: '200px' },
            { field: 'Col2', width: '200px' },
            { field: 'Col3', width: '200px' },
            { field: 'childData', width: '200px' },
            { field: 'childData2', width: '200px' },
            { field: 'hasChild', width: '200px' }
        ];

        this.treeGridHierColumns = [
            { field: 'ID', width: 200, resizable: true, movable: true, pinned: true },
            { field: 'CompanyName', width: 150, resizable: true, movable: true },
            { field: 'ContactName', width: 150, resizable: true, movable: true },
            { field: 'ContactTitle', width: 150, resizable: true, movable: true },
            { field: 'Address', width: 150, resizable: true, movable: true },
            { field: 'City', width: 150, resizable: true, movable: true, summary: true },
            { field: 'Region', width: 150, resizable: true, movable: true },
            { field: 'PostalCode', width: 150, resizable: true, movable: true },
            { field: 'Phone', width: 150, resizable: true, movable: true },
            { field: 'Fax', width: 150, resizable: true, movable: true }
        ];
        this.treeGridHierData = HIERARCHICAL_SAMPLE_DATA.slice(0);

        this.data = [
            /* eslint-disable max-len */
            { ID: 'ALFKI', CompanyName: 'Alfreds Futterkiste', ContactName: 'Maria Anders', ContactTitle: 'Sales Representative', Address: 'Obere Str. 57', City: 'Berlin', Region: null, PostalCode: '12209', Country: 'Germany', Phone: '030-0074321', Fax: '030-0076545' },
            { ID: 'ANATR', CompanyName: 'Ana Trujillo Emparedados y helados', ContactName: 'Ana Trujillo', ContactTitle: 'Owner', Address: 'Avda. de la Constitución 2222', City: 'México D.F.', Region: null, PostalCode: '05021', Country: 'Mexico', Phone: '(5) 555-4729', Fax: '(5) 555-3745' },
            { ID: 'ANTON', CompanyName: 'Antonio Moreno Taquería', ContactName: 'Antonio Moreno', ContactTitle: 'Owner', Address: 'Mataderos 2312', City: 'México D.F.', Region: null, PostalCode: '05023', Country: 'Mexico', Phone: '(5) 555-3932', Fax: null },
            { ID: 'AROUT', CompanyName: 'Around the Horn', ContactName: 'Thomas Hardy', ContactTitle: 'Sales Representative', Address: '120 Hanover Sq.', City: 'London', Region: null, PostalCode: 'WA1 1DP', Country: 'UK', Phone: '(171) 555-7788', Fax: '(171) 555-6750' },
            { ID: 'BERGS', CompanyName: 'Berglunds snabbköp', ContactName: 'Christina Berglund', ContactTitle: 'Order Administrator', Address: 'Berguvsvägen 8', City: 'Luleå', Region: null, PostalCode: 'S-958 22', Country: 'Sweden', Phone: '0921-12 34 65', Fax: '0921-12 34 67' },
            { ID: 'BLAUS', CompanyName: 'Blauer See Delikatessen', ContactName: 'Hanna Moos', ContactTitle: 'Sales Representative', Address: 'Forsterstr. 57', City: 'Mannheim', Region: null, PostalCode: '68306', Country: 'Germany', Phone: '0621-08460', Fax: '0621-08924' },
            { ID: 'BLONP', CompanyName: 'Blondesddsl père et fils', ContactName: 'Frédérique Citeaux', ContactTitle: 'Marketing Manager', Address: '24, place Kléber', City: 'Strasbourg', Region: null, PostalCode: '67000', Country: 'France', Phone: '88.60.15.31', Fax: '88.60.15.32' },
            { ID: 'BOLID', CompanyName: 'Bólido Comidas preparadas', ContactName: 'Martín Sommer', ContactTitle: 'Owner', Address: 'C/ Araquil, 67', City: 'Madrid', Region: null, PostalCode: '28023', Country: 'Spain', Phone: '(91) 555 22 82', Fax: '(91) 555 91 99' },
            { ID: 'BONAP', CompanyName: 'Bon app\'', ContactName: 'Laurence Lebihan', ContactTitle: 'Owner', Address: '12, rue des Bouchers', City: 'Marseille', Region: null, PostalCode: '13008', Country: 'France', Phone: '91.24.45.40', Fax: '91.24.45.41' },
            { ID: 'BOTTM', CompanyName: 'Bottom-Dollar Markets', ContactName: 'Elizabeth Lincoln', ContactTitle: 'Accounting Manager', Address: '23 Tsawassen Blvd.', City: 'Tsawassen', Region: 'BC', PostalCode: 'T2F 8M4', Country: 'Canada', Phone: '(604) 555-4729', Fax: '(604) 555-3745' },
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
        this.hierarchicalData = this.generateDataUneven(100, 3);

        // treegrid cols and data
        this.treeColumns = [
            { field: 'employeeID', label: 'ID', width: 200, resizable: true, movable: true, dataType: 'number', hasSummary: false },
            { field: 'Salary', label: 'Salary', width: 200, resizable: true, movable: true, dataType: 'number', hasSummary: true },
            { field: 'firstName', label: 'First Name', width: 300, resizable: true, movable: true, dataType: 'string', hasSummary: false },
            { field: 'lastName', label: 'Last Name', width: 150, resizable: true, movable: true, dataType: 'string', hasSummary: false },
            { field: 'Title', label: 'Title', width: 200, resizable: true, movable: true, dataType: 'string', hasSummary: true }
        ];
        this.treeData = [
            { Salary: 2500, employeeID: 0, PID: -1, firstName: 'Andrew', lastName: 'Fuller', Title: 'Vice President, Sales' },
            { Salary: 3500, employeeID: 1, PID: -1, firstName: 'Jonathan', lastName: 'Smith', Title: 'Human resources' },
            { Salary: 1500, employeeID: 2, PID: -1, firstName: 'Nancy', lastName: 'Davolio', Title: 'CFO' },
            { Salary: 2500, employeeID: 3, PID: -1, firstName: 'Steven', lastName: 'Buchanan', Title: 'CTO' },
            // sub of ID 0
            { Salary: 2500, employeeID: 4, PID: 0, firstName: 'Janet', lastName: 'Leverling', Title: 'Sales Manager' },
            { Salary: 3500, employeeID: 5, PID: 0, firstName: 'Laura', lastName: 'Callahan', Title: 'Inside Sales Coordinator' },
            { Salary: 1500, employeeID: 6, PID: 0, firstName: 'Margaret', lastName: 'Peacock', Title: 'Sales Representative' },
            { Salary: 2500, employeeID: 7, PID: 0, firstName: 'Michael', lastName: 'Suyama', Title: 'Sales Representative' },
            // sub of ID 4
            { Salary: 2500, employeeID: 8, PID: 4, firstName: 'Anne', lastName: 'Dodsworth', Title: 'Sales Representative' },
            { Salary: 3500, employeeID: 9, PID: 4, firstName: 'Danielle', lastName: 'Davis', Title: 'Sales Representative' },
            { Salary: 1500, employeeID: 10, PID: 4, firstName: 'Robert', lastName: 'King', Title: 'Sales Representative' },
            // sub of ID 2
            { Salary: 2500, employeeID: 11, PID: 2, firstName: 'Peter', lastName: 'Lewis', Title: 'Chief Accountant' },
            { Salary: 3500, employeeID: 12, PID: 2, firstName: 'Ryder', lastName: 'Zenaida', Title: 'Accountant' },
            { Salary: 1500, employeeID: 13, PID: 2, firstName: 'Wang', lastName: 'Mercedes', Title: 'Accountant' },
            // sub of ID 3
            { Salary: 1500, employeeID: 14, PID: 3, firstName: 'Theodore', lastName: 'Zia', Title: 'Software Architect' },
            { Salary: 4500, employeeID: 15, PID: 3, firstName: 'Lacota', lastName: 'Mufutau', Title: 'Product Manager' },
            // sub of ID 16
            { Salary: 2500, employeeID: 16, PID: 15, firstName: 'Jin', lastName: 'Elliott', Title: 'Product Owner' },
            { Salary: 3500, employeeID: 17, PID: 15, firstName: 'Armand', lastName: 'Ross', Title: 'Product Owner' },
            { Salary: 1500, employeeID: 18, PID: 15, firstName: 'Dane', lastName: 'Rodriquez', Title: 'Team Leader' },
            // sub of ID 19
            { Salary: 2500, employeeID: 19, PID: 18, firstName: 'Declan', lastName: 'Lester', Title: 'Senior Software Developer' },
            { Salary: 3500, employeeID: 20, PID: 18, firstName: 'Bernard', lastName: 'Jarvis', Title: 'Senior Software Developer' },
            { Salary: 1500, employeeID: 21, PID: 18, firstName: 'Jason', lastName: 'Clark', Title: 'QA' },
            { Salary: 1500, employeeID: 22, PID: 18, firstName: 'Mark', lastName: 'Young', Title: 'QA' },
            // sub of ID 20
            { Salary: 1500, employeeID: 23, PID: 20, firstName: 'Jeremy', lastName: 'Donaldson', Title: 'Software Developer' }
        ];
        /* eslint-enable max-len */
    }

    public togglePinning(grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent,
        byIndex: boolean, index: number, key: any) {
        const row: RowType = byIndex ? grid.getRowByIndex(index) : grid.getRowByKey(key);
        if (row.pinned) {
            row.unpin();
        } else {
            row.pin();
        }
    }


    public deleteRow(grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent, index: number) {
        const row = grid.getRowByIndex(index);
        row.delete();
    }

    public toggle(grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent, index: number) {
        const row = grid.getRowByIndex(index);
        row.expanded = !row.expanded;
    }

    public select(grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent, index: number) {
        const row = grid.getRowByIndex(index);
        row.selected = !row.selected;
    }

    public selectChildren(grid: IgxGridComponent | IgxTreeGridComponent, index: number) {
        const row = grid.getRowByIndex(index);
        const children = row.children;
        children.forEach(ch => {
            ch.selected = !ch.selected;
        });
    }

    public selectParent(grid: IgxGridComponent | IgxTreeGridComponent, index: number) {
        const row = grid.getRowByIndex(index);
        const parent = row.parent;
        parent.selected = !parent.selected;
    }

    public generateDataUneven(count: number, level: number, parendID: string = null) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
            const rowID = parendID ? parendID + i : i.toString();
            if (level > 0) {
                // Have child grids for row with even id less rows by not multiplying by 2
                children = this.generateDataUneven(((i % 2) + 1) * Math.round(count / 3), currLevel - 1, rowID);
            }
            prods.push({
                ID: rowID,
                ChildLevels: currLevel,
                ProductName: 'Product: A' + i,
                Col1: i,
                Col2: i,
                Col3: i,
                childData: children,
                childData2: children,
                hasChild: true
            });
        }
        return prods;
    }

    public clearLog(logger: HTMLElement) {
        const elements = logger.querySelectorAll('p');

        elements.forEach(element => {
            this.renderer.removeChild(logger, element);
        });
    }

    public logState(grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent, index: number, logger: HTMLElement) {
        this.clearLog(logger);
        const row = grid.getRowByIndex(index);
        const state = `
            index: ${row.index},
            viewIndex: ${row.viewIndex},
            -----------------------------,
            isSummaryRow: ${row.isSummaryRow},
            summaries: ${row.summaries},
            -----------------------------,
            isGroupByRow: ${row.isGroupByRow},
            groupByRow: ${row.groupRow?.value},
            -----------------------------,
            parent: ${row.parent},
            expanded: ${row.expanded},
            key: ${row.key},
            pinned: ${row.pinned},
            deleted: ${row.deleted},
            inEditMode: ${row.inEditMode},
            selected: ${row.selected},
            hasChildren: ${row.hasChildren},
            disabled: ${row.disabled}`;
        const states = state.split(',');
        const createElem = this.renderer.createElement('p');

        states.forEach(st => {
            const text = this.renderer.createText(st);
            this.renderer.appendChild(createElem, text);
            this.renderer.appendChild(createElem, this.renderer.createElement('br'));
        });

        this.renderer.insertBefore(logger, createElem, logger.children[0]);
    }

    public onRowDragEnd(args) {
        args.animation = true;
    }

    public onDropAllowed(args) {
        let selected = false;
        const ids = this.grid.selectedRows;
        const selectedRowData = this.grid.data.filter((record) => ids.includes(record.ID));
        selectedRowData.forEach((rowData) => {
            selected = true;
            this.targetGrid.addRow(rowData);
            this.grid.deleteRow(rowData.ID);
        });
        if (selected === false) {
            this.targetGrid.addRow(args.dragData.rowData);
            // this.grid.deleteRow(args.dragData.rowID);
        }
    }

    public onEnter(args) {
        this.dragIcon = 'add';
    }
    public onRowDragStart(args: IRowDragStartEventArgs) {
        const row = args.dragData;
        const count = this.grid.selectedRows.length || 1;
        this.countIcon = `filter_${count > 9 ? '9_plus' : `${count}`}`;
    }
    public onLeave(args) {
        this.onRowDragStart(args);
        this.dragIcon = 'arrow_right_alt';
    }
}
