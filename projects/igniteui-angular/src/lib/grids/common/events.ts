import { IBaseEventArgs, CancelableEventArgs } from '../../core/utils';
import { IgxBaseExporter, IgxExporterOptionsBase } from '../../services';
import { GridKeydownTargetType } from './enums';
import { IgxDragDirective } from '../../directives/drag-drop/drag-drop.directive';
import { IGridDataBindable, GridType } from './grid.interface';
import { IgxGridCellComponent } from '../cell.component';
import { IgxColumnComponent } from '../columns/column.component';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IgxRowDirective } from '../row.directive';
import { ColumnType } from './column.interface';
import { IgxCell } from '../selection/selection.service';
export { GridSelectionRange } from '../selection/selection.service';

export interface IGridClipboardEvent {
    data: any[];
    cancel: boolean;
}

export interface IGridCellEventArgs extends IBaseEventArgs {
    cell: IgxGridCellComponent;
    event: Event;
}

export interface IGridEditEventArgs extends CancelableEventArgs, IBaseEventArgs {
    rowID: any;
    cellID?: {
        rowID: any,
        columnID: any,
        rowIndex: number
    };
    oldValue: any;
    newValue?: any;
    event?: Event;
    cell?: IgxCell;
    column?: ColumnType;
}

export interface IPinColumnEventArgs extends IBaseEventArgs {
    column: IgxColumnComponent;
    insertAtIndex: number;
    isPinned: boolean;
}

export interface IPageEventArgs extends IBaseEventArgs {
    previous: number;
    current: number;
}

export interface IRowDataEventArgs extends IBaseEventArgs {
    data: any;
}

export interface IColumnResizeEventArgs extends IBaseEventArgs {
    column: IgxColumnComponent;
    prevWidth: string;
    newWidth: string;
}

export interface IRowSelectionEventArgs extends CancelableEventArgs, IBaseEventArgs {
    oldSelection: any[];
    newSelection: any[];
    added: any[];
    removed: any[];
    event?: Event;
}

export interface IColumnSelectionEventArgs extends CancelableEventArgs, IBaseEventArgs {
    oldSelection: string[];
    newSelection: string[];
    added: string[];
    removed: string[];
    event?: Event;
}

export interface ISearchInfo {
    searchText: string;
    caseSensitive: boolean;
    exactMatch: boolean;
    activeMatchIndex: number;
    matchInfoCache: any[];
}

export interface IGridToolbarExportEventArgs extends IBaseEventArgs {
    grid: IgxGridBaseDirective;
    exporter: IgxBaseExporter;
    options: IgxExporterOptionsBase;
    cancel: boolean;
}

export interface IColumnMovingStartEventArgs extends IBaseEventArgs {
    source: IgxColumnComponent;
}

export interface IColumnMovingEventArgs extends IBaseEventArgs {
    source: IgxColumnComponent;
    cancel: boolean;
}

export interface IColumnMovingEndEventArgs extends IBaseEventArgs {
    source: IgxColumnComponent;
    target: IgxColumnComponent;
}

export interface IGridKeydownEventArgs extends IBaseEventArgs {
    targetType: GridKeydownTargetType;
    target: Object;
    event: Event;
    cancel: boolean;
}

export interface ICellPosition {
    rowIndex: number;
    visibleColumnIndex: number;
}

export interface IRowDragEndEventArgs extends IBaseEventArgs {
    dragDirective: IgxDragDirective;
    dragData: IgxRowDirective<IgxGridBaseDirective & IGridDataBindable>;
    animation: boolean;
}

export interface IRowDragStartEventArgs extends CancelableEventArgs, IBaseEventArgs {
    dragDirective: IgxDragDirective;
    dragData: IgxRowDirective<IgxGridBaseDirective & IGridDataBindable>;
}

export interface IRowToggleEventArgs extends IBaseEventArgs {
    rowID: any;
    expanded: boolean;
    event?: Event;
    cancel: boolean;
}

/**
 * Event emitted when a row's pin state changes.
 */
export interface IPinRowEventArgs extends IBaseEventArgs {
    /**
     * The row component instance, that was pinned/unpinned.
     * May be undefined if row does not exist in the current visible data.
     */
    readonly row?: IgxRowDirective<IgxGridBaseDirective & GridType>;
    /**
     * The ID of the row, that was pinned/unpinned.
     *   ID is either the primaryKey value or the data record instance.
     */
    readonly rowID: any;
    /** The index at which to pin the row in the pinned rows collection. */
    insertAtIndex?: number;
    /** Whether or noy the row is pinned or unpinned. */
    readonly isPinned: boolean;
}
