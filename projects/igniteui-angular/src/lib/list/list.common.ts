import { Directive, TemplateRef, EventEmitter, QueryList, Optional, Inject } from '@angular/core';
import { DisplayDensityBase, IDisplayDensityOptions, DisplayDensityToken } from '../core/density';

export interface IListChild {
    index: number;
}

/** @hidden */
@Directive({
    selector: '[igxListBase]'
})
export class IgxListBaseDirective extends DisplayDensityBase {
    public itemClicked: EventEmitter<any>;
    public allowLeftPanning: boolean;
    public allowRightPanning: boolean;
    public panEndTriggeringThreshold: number;
    public leftPan: EventEmitter<any>;
    public rightPan: EventEmitter<any>;
    public panningStart: EventEmitter<any>;
    public panningEnd: EventEmitter<any>;
    public panStateChange: EventEmitter<any>;
    public children: QueryList<any>;
    public listItemLeftPanningTemplate: IgxListItemLeftPanningTemplateDirective;
    public listItemRightPanningTemplate: IgxListItemRightPanningTemplateDirective;

    constructor(@Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
        super(_displayDensityOptions);
    }
}

export enum IgxListPanState { NONE, LEFT, RIGHT }

@Directive({
    selector: '[igxEmptyList]'
})
export class IgxEmptyListTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxDataLoading]'
})
export class IgxDataLoadingTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxListItemLeftPanning]'
})
export class IgxListItemLeftPanningTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxListItemRightPanning]'
})
export class IgxListItemRightPanningTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}
