import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs';
import {
    IgxColumnComponent,
    IgxGridComponent,
    IgxSnackbarComponent,
    IgxToastComponent,
    SortingDirection,
    CsvFileTypes,
    IgxBaseExporter,
    IgxCsvExporterOptions,
    IgxCsvExporterService,
    IgxExcelExporterOptions,
    IgxExporterOptionsBase,
    IgxExcelExporterService,
    IgxStringFilteringOperand,
    DefaultSortingStrategy,
    GridSelectionMode
} from 'igniteui-angular';
import { RemoteService } from '../shared/remote.service';
import { LocalService } from '../shared/local.service';


@Component({
    selector: 'app-grid-sample',
    styleUrls: [ 'grid.sample.css'],
    templateUrl: 'grid.sample.html'
})
export class GridSampleComponent implements OnInit, AfterViewInit {
    @ViewChild('grid1', { static: true })
    private grid1: IgxGridComponent;

    @ViewChild('grid2', { static: true })
    private grid2: IgxGridComponent;

    @ViewChild('grid3', { static: true })
    private grid3: IgxGridComponent;

    @ViewChild('toast', { static: true })
    private toast: IgxToastComponent;

    @ViewChild('snax', { static: true })
    private snax: IgxSnackbarComponent;

    public data: Observable<any[]>;
    public remote: Observable<any[]>;
    public localData: any[];
    public selectedCell;
    public selectedRow;
    public newRecord = '';
    public editCell;
    public exportFormat = 'XLSX';
    public customFilter = CustomStringFilter.instance();
    public selectionMode;

    constructor(private localService: LocalService,
                private remoteService: RemoteService,
                private excelExporterService: IgxExcelExporterService,
                private csvExporterService: IgxCsvExporterService) {

        this.localService.url = this.remoteService.url;

        this.remoteService.urlBuilder = (dataState) => {
            let qS = '';
            if (dataState && dataState.paging) {
                const skip = dataState.paging.index * dataState.paging.recordsPerPage;
                const top = dataState.paging.recordsPerPage;
                qS += `$skip=${skip}&$top=${top}&$count=true`;
            }
            if (dataState && dataState.sorting) {
                const s = dataState.sorting;
                if (s && s.expressions && s.expressions.length) {
                    qS += (qS ? '&' : '') + '$orderby=';
                    s.expressions.forEach((e, ind) => {
                        qS += ind ? ',' : '';
                        qS += `${e.fieldName} ${e.dir === SortingDirection.Asc ? 'asc' : 'desc'}`;
                    });
                }
            }
            qS = qS ? `?${qS}` : '';
            return `${this.remoteService.url}${qS}`;
        };
    }

    public ngOnInit(): void {
        this.data = this.localService.records;
        this.remote = this.remoteService.remoteData;

        this.localService.getData();

        this.localData = [
            { ID: 1, Name: 'A' },
            { ID: 2, Name: 'B' },
            { ID: 3, Name: 'C' },
            { ID: 4, Name: 'D' },
            { ID: 5, Name: 'E' }
        ];

        this.grid2.sortingExpressions = [];
        this.grid3.sortingExpressions = [{ fieldName: 'ProductID', dir: SortingDirection.Desc, ignoreCase: true,
            strategy: DefaultSortingStrategy.instance() }];

        this.selectionMode = GridSelectionMode.multiple;
    }

    public ngAfterViewInit() {
        this.grid1.cdr.detectChanges();
        // this.remoteService.getData(this.grid3.data);
    }


    public onInlineEdit(event) {
        this.editCell = event.cell;
    }

    public showInput(index, field) {
        return this.editCell && this.editCell.columnField === field && this.editCell.rowIndex === index;
    }

    public process() {
        this.toast.position = 'bottom';
        this.toast.open('Loading remote data');
        this.remoteService.getData(this.grid3.data, () => {
            this.toast.close();
        });
    }

    public initColumns(event: IgxColumnComponent) {
        const column: IgxColumnComponent = event;
        if (column.field === 'Name') {
            column.filterable = true;
            column.sortable = true;
            column.editable = true;
        }
    }

    public onPagination(event) {
        const total = this.grid2.data.length;
        const state = this.grid2.pagingState;
        if ((state.recordsPerPage * event) >= total) {
            return;
        }
        this.grid2.paginator.paginate(event);
    }

    public onPerPage(event) {
        const total = this.grid2.data.length;
        const state = this.grid2.pagingState;
        if ((state.index * event) >= total) {
            return;
        }
        this.grid2.perPage = event;
        state.paging.recordsPerPage = event;
    }

    public selectCell(event) {
        this.selectedCell = event;
    }

    public addRow() {
        if (!this.newRecord.trim()) {
            this.newRecord = '';
            return;
        }
        const record = { ID: this.grid1.data[this.grid1.data.length - 1].ID + 1, Name: this.newRecord };
        this.grid1.addRow(record);
        this.newRecord = '';
    }

    public updateRecord(event) {
        this.grid1.updateCell(this.selectedCell.rowIndex, this.selectedCell.columnField, event);
    }

    public deleteRow() {
        this.selectedRow = Object.assign({}, this.selectedCell.Row);
        this.grid1.deleteRow(this.selectedCell.rowIndex);
        this.selectedCell = {};
        this.snax.open(`Row with ID ${this.selectedRow.record.ID} was deleted`);
    }

    public restore() {
        this.grid1.addRow(this.selectedRow.record);
        this.snax.close();
    }

    public updateRow11() {
        this.grid3.updateRow({
            __metadata: {
                uri: 'http://services.odata.org/Northwind/Northwind.svc/Products(20)',
                type: 'NorthwindModel.Product'
            },
            ProductName: 'Example Change',
            ProductID: 12,
            SupplierID: 8,
            CategoryID: 3,
            QuantityPerUnit: undefined,
            UnitsInStock: -99,
            UnitsOnOrder: 0,
            ReorderLevel: -12,
            Discontinued: false,
            OrderDate: new Date('1905-03-17'),
            Category: {
                __deferred: {
                    uri: 'http://services.odata.org/Northwind/Northwind.svc/Products(20)/Category'
                }
            },
            Order_Details: {
                __deferred: {
                    uri: 'http://services.odata.org/Northwind/Northwind.svc/Products(20)/Order_Details'
                }
            },
            Supplier: {
                __deferred: {
                    uri: 'http://services.odata.org/Northwind/Northwind.svc/Products(20)/Supplier'
                }
            }
        }, 11);
    }
    public exportRaw() {
        this.getExporterService().export(this.grid3, this.getOptions('Report'));
    }

    public export() {
        this.grid3.clearFilter();

        const options = this.getOptions('Report');
        options.ignoreColumnsVisibility = false;

        this.getExporterService().export(this.grid3, options);
    }

    public exportFilteredGrid() {
        this.grid3.filter('ProductName', 'Queso', IgxStringFilteringOperand.instance().condition('contains'), true);
        this.grid3.cdr.detectChanges();

        const options = this.getOptions('Queso Report');
        options.ignoreFiltering = false;
        options.ignoreColumnsVisibility = false;

        this.getExporterService().export(this.grid3, options);
    }
    public exportData() {
        this.getExporterService().exportData(this.grid3.data, this.getOptions('Data'));
    }

    public onSearchChange(text: string) {
        this.grid3.findNext(text);
    }

    public onSearch(ev) {
        if (ev.key === 'Enter' || ev.key === 'ArrowDown'  || ev.key === 'ArrowRight') {
            this.grid3.findNext(ev.target.value);
        } else if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') {
            this.grid3.findPrev(ev.target.value);
        }
    }

    public columnInit(column: IgxColumnComponent) {
        column.editable = true;
    }

    private getExporterService(): IgxBaseExporter {
        return this.exportFormat === 'XLSX' ? this.excelExporterService : this.csvExporterService;
    }

    private getOptions(fileName: string): IgxExporterOptionsBase {
        switch (this.exportFormat) {
            case 'XLSX':
                return new IgxExcelExporterOptions(fileName);
            case 'CSV':
                return new IgxCsvExporterOptions(fileName, CsvFileTypes.CSV);
            case 'TSV':
                return new IgxCsvExporterOptions(fileName, CsvFileTypes.TSV);
            case 'TAB':
                return new IgxCsvExporterOptions(fileName, CsvFileTypes.TAB);
        }
    }
}

export class CustomStringFilter extends IgxStringFilteringOperand {

    private constructor() {
        super();
        this.append({
            name: 'Custom',
            logic: (value: any, searchVal: any) => value === searchVal,
            isUnary: false,
            iconName: 'starts_with'
        });
    }
}
