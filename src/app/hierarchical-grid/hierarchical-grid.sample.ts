import { Component, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import {
    IgxRowIslandComponent,
    IgxHierarchicalGridComponent,
    IGridCellEventArgs,
    GridSelectionMode,
    DisplayDensity,
    RowType
} from 'igniteui-angular';

@Component({
    selector: 'app-hierarchical-grid-sample',
    styleUrls: ['hierarchical-grid.sample.css'],
    templateUrl: 'hierarchical-grid.sample.html'
})
export class HierarchicalGridSampleComponent implements AfterViewInit {
    @ViewChild('layout1', { static: true })
    private layout1: IgxRowIslandComponent;

    @ViewChild('hGrid2', { static: true })
    private hGrid2: IgxHierarchicalGridComponent;

    public localData = [];
    public localData1 = [];
    public data1 = [];
    public data2 = [];
    public selectionMode;
    public firstLevelExpanded = false;
    public rootExpanded = false;
    public density: DisplayDensity = 'comfortable';
    public displayDensities;
    public riToggle = true;
    public hgridState = [];
    public columns;
    public childColumns;

    constructor(private cdr: ChangeDetectorRef) {
        this.displayDensities = [
            { label: 'compact', selected: this.density === 'compact', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true }
        ];
        this.localData = this.generateDataUneven(10, 3);
        this.data1 = this.localData.slice(0, 10);
        this.data2 = this.localData.slice(10, 20);
        this.localData1 = this.data1;
        this.localData[0].hasChild = false;
        this.localData[1].hasChild = false;
        this.localData[2].childData[0].hasChild = false;
        this.localData[2].childData[1].hasChild = false;
        this.selectionMode = GridSelectionMode.none;
    }

    public enableSummary() {
        const childGrid = this.hGrid2.hgridAPI.getChildGrids(false)[0];
        this.hGrid2.getColumnByName('ID').hasSummary = true;
        if (childGrid) {
            childGrid.getColumnByName('ID').hasSummary = true;
        }
    }

    public ngAfterViewInit() {
        this.cdr.detectChanges();
    }


    public log() {
        console.log((this.layout1.gridAPI as any).childGrids);
        //this.layout1.pipeTrigger++;
        console.log(this.hGrid2.allLayoutList);
    }
    public generateData(count: number, level: number) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
            if (level > 0) {
                children = this.generateData(count / 2, currLevel - 1);
            }
            prods.push({
                ID: i,
                ChildLevels: currLevel,
                ProductName: 'Product: A' + i,
                Col1: i,
                Col2: i,
                Col3: i,
                childData: children,
                childData2: children
            });
        }
        return prods;
    }

    public getState() {
        console.log(this.hgridState);
    }

    public changeHeaderRI(ri, index) {
        ri.childColumns.toArray()[index].header = 'New';
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
                childData2: i % 2 ? [] : children,
                hasChild: true
            });
        }
        return prods;
    }

    public setterChange() {
        this.layout1.rowSelection = this.layout1.rowSelection === GridSelectionMode.multiple
         ? GridSelectionMode.none : GridSelectionMode.multiple;
    }

    public setterBindingChange() {
        this.selectionMode = this.selectionMode === GridSelectionMode.none ? GridSelectionMode.multiple : GridSelectionMode.none;
    }

    public toggleRootLevel() {
        this.rootExpanded = !this.rootExpanded;
    }

    public toggleFirstIsland() {
        this.firstLevelExpanded = !this.firstLevelExpanded;
    }

    public testApis() {}

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }

    public cellClick($evt: IGridCellEventArgs) {
        console.log('Cell Click', $evt);
    }

    public LoadMoreColumns() {
        this.columns = ['Col1', 'Col2', 'Col3'];
        this.childColumns = ['ChildCol1', 'ChildCol2'];
    }

    public changeData() {
        if (this.localData1 === this.data1) {
            this.localData1 = this.data2;
        } else {
            this.localData1 = this.data1;
        }
    }

    public togglePining(row: RowType, event) {
        event.preventDefault();
        if (row.pinned) {
            row.unpin();
        } else {
            row.pin();
        }
    }
}
