import { NgModule } from '@angular/core';
import { IgxGridCellComponent } from './cell.component';
import { IgxGridFooterComponent } from './grid-footer/grid-footer.component';
import {
    IgxGridBodyDirective
} from './grid.common';
import { IgxGridTransaction } from './grid-base.directive';
import { IgxBaseTransactionService } from '../services/transaction/base-transaction';
import {
    IgxRowAddTextDirective,
    IgxRowEditTemplateDirective,
    IgxRowEditActionsDirective,
    IgxRowEditTextDirective,
    IgxRowEditTabStopDirective
} from './grid.rowEdit.directive';
import { IgxPaginatorModule } from '../paginator/public_api';
import { IgxGridPipesModule } from './common/grid-pipes.module';
import { IgxGridExcelStyleFilteringModule } from './filtering/excel-style/grid.excel-style-filtering.module';
import { IgxRowDragModule } from './row-drag.directive';
import { IgxAdvancedFilteringDialogComponent } from './filtering/advanced-filtering/advanced-filtering-dialog.component';
import { IgxGridSelectionModule } from './selection/selection.module';
import { IgxGridResizingModule } from './resizing/resize.module';
import { IgxColumnMovingModule } from './moving/moving.module';
import { IgxGridSharedModules } from './common/shared.module';
import { IgxGridSummaryModule } from './summaries/summary.module';
import { IgxGridToolbarModule } from './toolbar/toolbar.module';
import { IgxColumnActionsModule } from './column-actions/column-actions.module';
import { IgxGridColumnModule } from './columns/column.module';
import { IgxGridHeadersModule } from './headers/headers.module';
import { IgxGridFilteringModule } from './filtering/base/filtering.module';
import { IgxRowDirective } from './row.directive';
import {
    IgxExcelStyleHeaderIconDirective,
    IgxGroupAreaDropDirective,
    IgxHeaderCollapseIndicatorDirective,
    IgxHeaderExpandIndicatorDirective,
    IgxRowCollapsedIndicatorDirective,
    IgxRowExpandedIndicatorDirective
} from './grid/grid.directives';
import { IgxChipsModule } from '../chips/chips.module';
import { IgxGroupByMetaPipe } from './grouping/group-by-area.directive';
import { IgxFlatTransactionFactory } from '../services/transaction/transaction-factory.service';
/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxRowDirective,
        IgxGridCellComponent,
        IgxRowAddTextDirective,
        IgxRowEditTemplateDirective,
        IgxRowEditActionsDirective,
        IgxRowEditTextDirective,
        IgxRowEditTabStopDirective,
        IgxGridBodyDirective,
        IgxGridFooterComponent,
        IgxAdvancedFilteringDialogComponent,
        IgxRowExpandedIndicatorDirective,
        IgxRowCollapsedIndicatorDirective,
        IgxHeaderExpandIndicatorDirective,
        IgxHeaderCollapseIndicatorDirective,
        IgxExcelStyleHeaderIconDirective,
        IgxGroupAreaDropDirective,
        IgxGroupByMetaPipe
    ],
    entryComponents: [
        IgxAdvancedFilteringDialogComponent
    ],
    exports: [
        IgxGridCellComponent,
        IgxRowAddTextDirective,
        IgxRowEditTemplateDirective,
        IgxRowEditActionsDirective,
        IgxRowEditTextDirective,
        IgxRowEditTabStopDirective,
        IgxGridBodyDirective,
        IgxColumnActionsModule,
        IgxGridColumnModule,
        IgxGridHeadersModule,
        IgxGridPipesModule,
        IgxGridFilteringModule,
        IgxGridExcelStyleFilteringModule,
        IgxRowDragModule,
        IgxPaginatorModule,
        IgxGridFooterComponent,
        IgxGridResizingModule,
        IgxColumnMovingModule,
        IgxGridSelectionModule,
        IgxGridSummaryModule,
        IgxGridToolbarModule,
        IgxAdvancedFilteringDialogComponent,
        IgxGridSharedModules,
        IgxRowExpandedIndicatorDirective,
        IgxRowCollapsedIndicatorDirective,
        IgxHeaderExpandIndicatorDirective,
        IgxHeaderCollapseIndicatorDirective,
        IgxExcelStyleHeaderIconDirective,
        IgxGroupAreaDropDirective,
        IgxGroupByMetaPipe
    ],
    imports: [
        IgxGridColumnModule,
        IgxGridHeadersModule,
        IgxColumnMovingModule,
        IgxGridResizingModule,
        IgxGridSelectionModule,
        IgxGridSummaryModule,
        IgxGridToolbarModule,
        IgxColumnActionsModule,
        IgxGridPipesModule,
        IgxGridFilteringModule,
        IgxGridExcelStyleFilteringModule,
        IgxRowDragModule,
        IgxPaginatorModule,
        IgxGridSharedModules,
        IgxChipsModule
    ]
})
export class IgxGridCommonModule { }
