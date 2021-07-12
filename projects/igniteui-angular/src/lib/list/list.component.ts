import { CommonModule } from '@angular/common';
import {
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding,
    Input,
    NgModule,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    Optional,
    Inject, Directive
} from '@angular/core';

import { IgxRippleModule } from '../directives/ripple/ripple.directive';

import { IgxListItemComponent } from './list-item.component';
import {
    IgxListBaseDirective,
    IgxDataLoadingTemplateDirective,
    IgxEmptyListTemplateDirective,
    IgxListPanState,
    IgxListItemLeftPanningTemplateDirective,
    IgxListItemRightPanningTemplateDirective
} from './list.common';
import { IDisplayDensityOptions, DisplayDensityToken, DisplayDensity } from '../core/density';
import { IBaseEventArgs } from '../core/utils';
import { IListResourceStrings } from '../core/i18n/list-resources';
import { CurrentResourceStrings } from '../core/i18n/resources';

let NEXT_ID = 0;

/**
 * Interface for the panStateChange igxList event arguments
 */
export interface IPanStateChangeEventArgs extends IBaseEventArgs {
    oldState: IgxListPanState;
    newState: IgxListPanState;
    item: IgxListItemComponent;
}

/**
 * Interface for the listItemClick igxList event arguments
 */
export interface IListItemClickEventArgs extends IBaseEventArgs {
    item: IgxListItemComponent;
    event: Event;
    direction: IgxListPanState;
}

/**
 * Interface for the listItemPanning igxList event arguments
 */
export interface IListItemPanningEventArgs extends IBaseEventArgs {
    item: IgxListItemComponent;
    direction: IgxListPanState;
    keepItem: boolean;
}

/**
 * igxListThumbnail is container for the List media
 * Use it to wrap anything you want to be used as a thumbnail.
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[igxListThumbnail]'
})
export class IgxListThumbnailDirective {}

/**
 * igxListAction is container for the List action
 * Use it to wrap anything you want to be used as a list action: icon, checkbox...
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[igxListAction]'
})
export class IgxListActionDirective {}

/**
 * igxListLine is container for the List text content
 * Use it to wrap anything you want to be used as a plane text.
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[igxListLine]'
})
export class IgxListLineDirective {}

/**
 * igxListLineTitle is a directive that add class to the target element
 * Use it to make anything to look like list Title.
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[igxListLineTitle]'
})
export class IgxListLineTitleDirective {
    @HostBinding('class.igx-list__item-line-title')
    public cssClass = 'igx-list__item-line-title';
}

/**
 * igxListLineSubTitle is a directive that add class to the target element
 * Use it to make anything to look like list Subtitle.
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[igxListLineSubTitle]'
})
export class IgxListLineSubTitleDirective {
    @HostBinding('class.igx-list__item-line-subtitle')
    public cssClass = 'igx-list__item-line-subtitle';
}

/**
 * Displays a collection of data items in a templatable list format
 *
 * @igxModule IgxListModule
 *
 * @igxTheme igx-list-theme
 *
 * @igxKeywords list, data
 *
 * @igxGroup Grids & Lists
 *
 * @remarks
 * The Ignite UI List displays rows of items and supports one or more header items as well as search and filtering
 * of list items. Each list item is completely templatable and will support any valid HTML or Angular component.
 *
 * @example
 * ```html
 * <igx-list>
 *   <igx-list-item isHeader="true">Contacts</igx-list-item>
 *   <igx-list-item *ngFor="let contact of contacts">
 *     <span class="name">{{ contact.name }}</span>
 *     <span class="phone">{{ contact.phone }}</span>
 *   </igx-list-item>
 * </igx-list>
 * ```
 */
@Component({
    selector: 'igx-list',
    templateUrl: 'list.component.html',
    providers: [{ provide: IgxListBaseDirective, useExisting: IgxListComponent }]
})
export class IgxListComponent extends IgxListBaseDirective {
    /**
     * Returns a collection of all items and headers in the list.
     *
     * @example
     * ```typescript
     * let listChildren: QueryList = this.list.children;
     * ```
     */
    @ContentChildren(forwardRef(() => IgxListItemComponent), { descendants: true })
    public children: QueryList<IgxListItemComponent>;

    /**
     * Sets/gets the empty list template.
     *
     * @remarks
     * This template is used by IgxList in case there are no list items
     * defined and `isLoading` is set to `false`.
     *
     * @example
     * ```html
     * <igx-list>
     *   <ng-template igxEmptyList>
     *     <p class="empty">No contacts! :(</p>
     *   </ng-template>
     * </igx-list>
     * ```
     * ```typescript
     * let emptyTemplate = this.list.emptyListTemplate;
     * ```
     */
    @ContentChild(IgxEmptyListTemplateDirective, { read: IgxEmptyListTemplateDirective })
    public emptyListTemplate: IgxEmptyListTemplateDirective;

    /**
     * Sets/gets the list loading template.
     *
     * @remarks
     * This template is used by IgxList in case there are no list items defined and `isLoading` is set to `true`.
     *
     * @example
     * ```html
     * <igx-list>
     *   <ng-template igxDataLoading>
     *     <p>Patience, we are currently loading your data...</p>
     *   </ng-template>
     * </igx-list>
     * ```
     * ```typescript
     * let loadingTemplate = this.list.dataLoadingTemplate;
     * ```
     */
    @ContentChild(IgxDataLoadingTemplateDirective, { read: IgxDataLoadingTemplateDirective })
    public dataLoadingTemplate: IgxDataLoadingTemplateDirective;

    /**
     * Sets/gets the template for left panning a list item.
     *
     * @remarks
     * Default value is `null`.
     *
     * @example
     * ```html
     * <igx-list [allowLeftPanning]="true">
     *   <ng-template igxListItemLeftPanning>
     *     <igx-icon>delete</igx-icon>Delete
     *   </ng-template>
     * </igx-list>
     * ```
     * ```typescript
     * let itemLeftPanTmpl = this.list.listItemLeftPanningTemplate;
     * ```
     */
    @ContentChild(IgxListItemLeftPanningTemplateDirective, { read: IgxListItemLeftPanningTemplateDirective })
    public listItemLeftPanningTemplate: IgxListItemLeftPanningTemplateDirective;

    /**
     * Sets/gets the template for right panning a list item.
     *
     * @remarks
     * Default value is `null`.
     *
     * @example
     * ```html
     * <igx-list [allowRightPanning] = "true">
     *   <ng-template igxListItemRightPanning>
     *     <igx-icon>call</igx-icon>Dial
     *   </ng-template>
     * </igx-list>
     * ```
     * ```typescript
     * let itemRightPanTmpl = this.list.listItemRightPanningTemplate;
     * ```
     */
    @ContentChild(IgxListItemRightPanningTemplateDirective, { read: IgxListItemRightPanningTemplateDirective })
    public listItemRightPanningTemplate: IgxListItemRightPanningTemplateDirective;

    /**
     * Provides a threshold after which the item's panning will be completed automatically.
     *
     * @remarks
     * By default this property is set to 0.5 which is 50% of the list item's width.
     *
     * @example
     * ```html
     * <igx-list [panEndTriggeringThreshold]="0.8"></igx-list>
     * ```
     */
    @Input()
    public panEndTriggeringThreshold = 0.5;

    /**
     * Sets/gets the `id` of the list.
     *
     * @remarks
     * If not set, the `id` of the first list component will be `"igx-list-0"`.
     *
     * @example
     * ```html
     * <igx-list id="my-first-list"></igx-list>
     * ```
     * ```typescript
     * let listId = this.list.id;
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-list-${NEXT_ID++}`;

    /**
     * Sets/gets whether the left panning of an item is allowed.
     *
     * @remarks
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-list [allowLeftPanning]="true"></igx-list>
     * ```
     * ```typescript
     * let isLeftPanningAllowed = this.list.allowLeftPanning;
     * ```
     */
    @Input()
    public allowLeftPanning = false;

    /**
     * Sets/gets whether the right panning of an item is allowed.
     *
     * @remarks
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-list [allowRightPanning]="true"></igx-list>
     * ```
     * ```typescript
     * let isRightPanningAllowed = this.list.allowRightPanning;
     * ```
     */
    @Input()
    public allowRightPanning = false;

    /**
     * Sets/gets whether the list is currently loading data.
     *
     * @remarks
     * Set it to display the dataLoadingTemplate while data is being retrieved.
     * Default value is `false`.
     *
     * @example
     * ```html
     *  <igx-list [isLoading]="true"></igx-list>
     * ```
     * ```typescript
     * let isLoading = this.list.isLoading;
     * ```
     */
    @Input()
    public isLoading = false;

    /**
     * Event emitted when a left pan gesture is executed on a list item.
     *
     * @remarks
     * Provides a reference to an object of type `IListItemPanningEventArgs` as an event argument.
     *
     * @example
     * ```html
     * <igx-list [allowLeftPanning]="true" (leftPan)="leftPan($event)"></igx-list>
     * ```
     */
    @Output()
    public leftPan = new EventEmitter<IListItemPanningEventArgs>();

    /**
     * Event emitted when a right pan gesture is executed on a list item.
     *
     * @remarks
     * Provides a reference to an object of type `IListItemPanningEventArgs` as an event argument.
     *
     * @example
     * ```html
     * <igx-list [allowRightPanning]="true" (rightPan)="rightPan($event)"></igx-list>
     * ```
     */
    @Output()
    public rightPan = new EventEmitter<IListItemPanningEventArgs>();


    /**
     * Event emitted when a pan gesture is started.
     *
     * @remarks
     * Provides a reference to an object of type `IListItemPanningEventArgs` as an event argument.
     *
     * @example
     * ```html
     * <igx-list (panningStart)="panningStart($event)"></igx-list>
     * ```
     */
    @Output()
    public panningStart = new EventEmitter<IListItemPanningEventArgs>();


    /**
     * Event emitted when a pan gesture is completed or canceled.
     *
     * @remarks
     * Provides a reference to an object of type `IListItemPanningEventArgs` as an event argument.
     *
     * @example
     * ```html
     * <igx-list (panningEnd)="panningEnd($event)"></igx-list>
     * ```
     */
    @Output()
    public panningEnd = new EventEmitter<IListItemPanningEventArgs>();

    /**
     *
     * Event emitted when a pan gesture is executed on a list item.
     *
     * @remarks
     * Provides references to the `IgxListItemComponent` and `IgxListPanState` as event arguments.
     *
     * @example
     * ```html
     * <igx-list (panStateChange)="panStateChange($event)"></igx-list>
     * ```
     */
    @Output()
    public panStateChange = new EventEmitter<IPanStateChangeEventArgs>();

    /**
     * Event emitted when a list item is clicked.
     *
     * @remarks
     * Provides references to the `IgxListItemComponent` and `Event` as event arguments.
     *
     * @example
     * ```html
     * <igx-list (itemClicked)="onItemClicked($event)"></igx-list>
     * ```
     */
    @Output()
    public itemClicked = new EventEmitter<IListItemClickEventArgs>();

    /**
     * @hidden
     * @internal
     */
    @ViewChild('defaultEmptyList', { read: TemplateRef, static: true })
    protected defaultEmptyListTemplate: TemplateRef<any>;

    /**
     * @hidden
     * @internal
     */
    @ViewChild('defaultDataLoading', { read: TemplateRef, static: true })
    protected defaultDataLoadingTemplate: TemplateRef<any>;

    private _resourceStrings = CurrentResourceStrings.ListResStrings;

    /**
     * Sets the resource strings.
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: IListResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    /**
     * Returns the resource strings.
     */
    public get resourceStrings(): IListResourceStrings {
        return this._resourceStrings;
    }

    constructor(public element: ElementRef,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
        super(_displayDensityOptions);
    }

    /**
     * @hidden
     * @internal
     */
    protected get sortedChildren(): IgxListItemComponent[] {
        if (this.children !== undefined) {
            return this.children.toArray()
                .sort((a: IgxListItemComponent, b: IgxListItemComponent) => a.index - b.index);
        }
        return null;
    }

    /**
     * Gets the `role` attribute value.
     *
     * @example
     * ```typescript
     * let listRole =  this.list.role;
     * ```
     */
    @HostBinding('attr.role')
    public get role() {
        return 'list';
    }

    /**
     * Gets a boolean indicating if the list is empty.
     *
     * @example
     * ```typescript
     * let isEmpty =  this.list.isListEmpty;
     * ```
     */
    @HostBinding('class.igx-list--empty')
    public get isListEmpty(): boolean {
        return !this.children || this.children.length === 0;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-list')
    public get cssClass(): boolean {
        return !this.isListEmpty && this.displayDensity === DisplayDensity.comfortable;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-list--compact')
    public get cssClassCompact(): boolean {
        return !this.isListEmpty && this.displayDensity === DisplayDensity.compact;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-list--cosy')
    public get cssClassCosy(): boolean {
        return !this.isListEmpty && this.displayDensity === DisplayDensity.cosy;
    }

    /**
     * Gets the list `items` excluding the header ones.
     *
     * @example
     * ```typescript
     * let listItems: IgxListItemComponent[] = this.list.items;
     * ```
     */
    public get items(): IgxListItemComponent[] {
        const items: IgxListItemComponent[] = [];
        if (this.children !== undefined) {
            for (const child of this.sortedChildren) {
                if (!child.isHeader) {
                    items.push(child);
                }
            }
        }
        return items;
    }

    /**
     * Gets the header list `items`.
     *
     * @example
     * ```typescript
     * let listHeaders: IgxListItemComponent[] =  this.list.headers;
     * ```
     */
    public get headers(): IgxListItemComponent[] {
        const headers: IgxListItemComponent[] = [];
        if (this.children !== undefined) {
            for (const child of this.children.toArray()) {
                if (child.isHeader) {
                    headers.push(child);
                }
            }
        }
        return headers;
    }

    /**
     * Gets the `context` object of the template binding.
     *
     * @remark
     * Gets the `context` object which represents the `template context` binding into the `list container`
     * by providing the `$implicit` declaration which is the `IgxListComponent` itself.
     *
     * @example
     * ```typescript
     * let listComponent =  this.list.context;
     * ```
     */
    public get context(): any {
        return {
            $implicit: this
        };
    }

    /**
     * Gets a `TemplateRef` to the currently used template.
     *
     * @example
     * ```typescript
     * let listTemplate = this.list.template;
     * ```
     */
    public get template(): TemplateRef<any> {
        if (this.isLoading) {
            return this.dataLoadingTemplate ? this.dataLoadingTemplate.template : this.defaultDataLoadingTemplate;
        } else {
            return this.emptyListTemplate ? this.emptyListTemplate.template : this.defaultEmptyListTemplate;
        }
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxListBaseDirective,
        IgxListComponent,
        IgxListItemComponent,
        IgxListThumbnailDirective,
        IgxListActionDirective,
        IgxListLineDirective,
        IgxListLineTitleDirective,
        IgxListLineSubTitleDirective,
        IgxDataLoadingTemplateDirective,
        IgxEmptyListTemplateDirective,
        IgxListItemLeftPanningTemplateDirective,
        IgxListItemRightPanningTemplateDirective
    ],
    exports: [
        IgxListComponent,
        IgxListItemComponent,
        IgxListThumbnailDirective,
        IgxListActionDirective,
        IgxListLineDirective,
        IgxListLineTitleDirective,
        IgxListLineSubTitleDirective,
        IgxDataLoadingTemplateDirective,
        IgxEmptyListTemplateDirective,
        IgxListItemLeftPanningTemplateDirective,
        IgxListItemRightPanningTemplateDirective
    ],
    imports: [
        CommonModule,
        IgxRippleModule
    ]
})
export class IgxListModule {
}
