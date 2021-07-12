import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IgxSelectModule } from '../select/public_api';
import { IgxIconModule } from '../icon/public_api';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxInputGroupModule } from '../input-group/public_api';

import { IgxPageSizeSelectorComponent } from './page-size-selector.component';
import { IgxPageNavigationComponent } from './pager.component';
import { IgxPaginatorComponent, IgxPaginatorTemplateDirective } from './paginator.component';
import { IgxPaginatorDirective } from './paginator-interfaces';

export * from './page-size-selector.component';
export * from './pager.component';
export * from './paginator.component';

@NgModule({
    declarations: [
        IgxPaginatorComponent,
        IgxPageNavigationComponent,
        IgxPageSizeSelectorComponent,
        IgxPaginatorTemplateDirective,
        IgxPaginatorDirective
    ],
    exports: [
        IgxPaginatorComponent,
        IgxPageNavigationComponent,
        IgxPageSizeSelectorComponent,
        IgxPaginatorTemplateDirective,
        IgxPaginatorDirective
    ],
    imports: [
        CommonModule,
        FormsModule,
        IgxButtonModule,
        IgxIconModule,
        IgxInputGroupModule,
        IgxRippleModule,
        IgxSelectModule
    ]
})
export class IgxPaginatorModule { }
