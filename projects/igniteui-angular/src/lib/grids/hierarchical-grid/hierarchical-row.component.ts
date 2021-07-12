import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    forwardRef,
    ElementRef,
    ViewChildren,
    QueryList,
    ViewChild,
    TemplateRef
} from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowDirective } from '../row.directive';
import { IgxHierarchicalGridCellComponent } from './hierarchical-cell.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-hierarchical-grid-row',
    templateUrl: './hierarchical-row.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxHierarchicalRowComponent) }]
})
export class IgxHierarchicalRowComponent extends IgxRowDirective<IgxHierarchicalGridComponent> {
    @ViewChild('expander', { read: ElementRef })
    public expander: ElementRef<HTMLElement>;

    @ViewChildren(forwardRef(() => IgxHierarchicalGridCellComponent), { read: IgxHierarchicalGridCellComponent })
    protected _cells: QueryList<IgxHierarchicalGridCellComponent>;

    /**
     * @hidden
     */
    @ViewChild('defaultExpandedTemplate', { read: TemplateRef, static: true })
    protected defaultExpandedTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ViewChild('defaultEmptyTemplate', { read: TemplateRef, static: true })
    protected defaultEmptyTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ViewChild('defaultCollapsedTemplate', { read: TemplateRef, static: true })
    protected defaultCollapsedTemplate: TemplateRef<any>;

    protected expanderClass = 'igx-grid__hierarchical-expander';
    protected rolActionClass = 'igx-grid__tr-action';

    /**
     * @hidden
     */
    public get expanderClassResolved() {
        return {
            [`${this.expanderClass} ${this.rolActionClass}`]: !this.pinned || this.disabled,
            [`${this.expanderClass}--empty`]: this.pinned && !this.disabled
        };
    }

    public get viewIndex(): number {
        return this.index + (this.grid.paginator?.page || 0 ) * (this.grid.paginator?.perPage || 0);
    }

    /**
     * Returns whether the row is expanded.
     * ```typescript
     * const RowExpanded = this.grid1.rowList.first.expanded;
     * ```
     */
    public get expanded() {
        return this.gridAPI.get_row_expansion_state(this.rowData);
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-grid__tr--expanded')
    public get expandedClass() {
        return this.expanded && !this.pinned;
    }

    public get hasChildren() {
        return  !!this.grid.childLayoutKeys.length;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-grid__tr--highlighted')
    public get highlighted() {
        return this.grid && this.grid.highlightedRowID === this.rowID;
    }

   /**
    * @hidden
    */
   public expanderClick(event) {
        event.stopPropagation();
        this.toggle();
    }

    /**
     * Toggles the hierarchical row.
     * ```typescript
     * this.grid1.rowList.first.toggle()
     * ```
     */
    public toggle() {
        if (this.added) {
            return;
        }
        const grid = this.gridAPI.grid;
        this.endEdit(grid.rootGrid);
        this.gridAPI.set_row_expansion_state(this.rowID, !this.expanded);
        grid.cdr.detectChanges();
    }

    /**
     * @hidden
     * @internal
     */
    public select = () => {
        this.grid.selectRows([this.rowID]);
    };

    /**
     * @hidden
     * @internal
     */
    public deselect = () => {
        this.grid.deselectRows([this.rowID]);
    };

    /**
     * @hidden
     */
    public get iconTemplate() {
        let expandable = true;
        if (this.grid.hasChildrenKey) {
            expandable = this.rowData[this.grid.hasChildrenKey];
        }
        if (!expandable || (this.pinned && !this.disabled)) {
            return this.defaultEmptyTemplate;
        }
        if (this.expanded) {
            return this.grid.rowExpandedIndicatorTemplate || this.defaultExpandedTemplate;
        } else {
            return this.grid.rowCollapsedIndicatorTemplate || this.defaultCollapsedTemplate;
        }
    }

    // TODO: consider moving into CRUD
    protected endEdit(grid: IgxHierarchicalGridComponent) {
        if (grid.gridAPI.crudService.cellInEditMode) {
            grid.gridAPI.crudService.endEdit();
        }
        grid.hgridAPI.getChildGrids(true).forEach(g => {
            if (g.gridAPI.crudService.cellInEditMode) {
            g.gridAPI.crudService.endEdit();
        }
});
    }
}
