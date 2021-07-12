import { Directive, TemplateRef } from '@angular/core';
import { CancelableEventArgs, IBaseEventArgs } from '../core/utils';

export interface IPageEventArgs extends IBaseEventArgs {
    previous: number;
    current: number;
}

export interface IPageCancellableEventArgs extends CancelableEventArgs {
    current: number;
    next: number;
}

@Directive({
    selector: '[igxPaginator]'
})
export class IgxPaginatorDirective {

    constructor(public template: TemplateRef<any>) { }
}
