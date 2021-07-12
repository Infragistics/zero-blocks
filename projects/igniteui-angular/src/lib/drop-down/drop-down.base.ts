import {
    Input, HostBinding, ElementRef, QueryList, Output, EventEmitter, ChangeDetectorRef, Optional, Inject, Directive
} from '@angular/core';

import { Navigate, ISelectionEventArgs } from './drop-down.common';
import { IDropDownList } from './drop-down.common';
import { DropDownActionKey } from './drop-down.common';
import { IgxDropDownItemBaseDirective } from './drop-down-item.base';
import { DisplayDensityBase, DisplayDensityToken, IDisplayDensityOptions } from '../core/density';
import { PlatformUtil } from '../core/utils';

let NEXT_ID = 0;

/**
 * An abstract class, defining a drop-down component, with:
 * Properties for display styles and classes
 * A collection items of type `IgxDropDownItemBaseDirective`
 * Properties and methods for navigating (highlighting/focusing) items from the collection
 * Properties and methods for selecting items from the collection
 */
@Directive()
export abstract class IgxDropDownBaseDirective extends DisplayDensityBase implements IDropDownList {
    /**
     * Emitted when item selection is changing, before the selection completes
     *
     * ```html
     * <igx-drop-down (selection)='handleSelection()'></igx-drop-down>
     * ```
     */
    @Output()
    public selection = new EventEmitter<ISelectionEventArgs>();

    /**
     *  Gets/Sets the width of the drop down
     *
     * ```typescript
     * // get
     * let myDropDownCurrentWidth = this.dropdown.width;
     * ```
     * ```html
     * <!--set-->
     * <igx-drop-down [width]='160px'></igx-drop-down>
     * ```
     */
    @Input()
    public width: string;

    /**
     * Gets/Sets the height of the drop down
     *
     * ```typescript
     * // get
     * let myDropDownCurrentHeight = this.dropdown.height;
     * ```
     * ```html
     * <!--set-->
     * <igx-drop-down [height]='400px'></igx-drop-down>
     * ```
     */
    @Input()
    public height: string;

    /**
     * Gets/Sets the drop down's id
     *
     * ```typescript
     * // get
     * let myDropDownCurrentId = this.dropdown.id;
     * ```
     * ```html
     * <!--set-->
     * <igx-drop-down [id]='newDropDownId'></igx-drop-down>
     * ```
     */
    @Input()
    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        this._id = value;
    }

    /**
     * Gets/Sets the drop down's container max height.
     *
     * ```typescript
     * // get
     * let maxHeight = this.dropdown.maxHeight;
     * ```
     * ```html
     * <!--set-->
     * <igx-drop-down [maxHeight]='200px'></igx-drop-down>
     * ```
     */
    @Input()
    @HostBinding('style.maxHeight')
    public maxHeight = null;

    /**
     * @hidden @internal
     */
    @HostBinding('class.igx-drop-down')
    public cssClass = true;

    /**
     * Get all non-header items
     *
     * ```typescript
     * let myDropDownItems = this.dropdown.items;
     * ```
     */
    public get items(): IgxDropDownItemBaseDirective[] {
        const items: IgxDropDownItemBaseDirective[] = [];
        if (this.children !== undefined) {
            for (const child of this.children.toArray()) {
                if (!child.isHeader) {
                    items.push(child);
                }
            }
        }

        return items;
    }

    /**
     * Get all header items
     *
     * ```typescript
     * let myDropDownHeaderItems = this.dropdown.headers;
     * ```
     */
    public get headers(): IgxDropDownItemBaseDirective[] {
        const headers: IgxDropDownItemBaseDirective[] = [];
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
     * Get dropdown html element
     *
     * ```typescript
     * let myDropDownElement = this.dropdown.element;
     * ```
     */
    public get element() {
        return this.elementRef.nativeElement;
    }
    /**
     * @hidden @internal
     * Get dropdown's html element of its scroll container
     */
    public get scrollContainer(): HTMLElement {
        return this.element;
    }

    /**
     * @hidden
     * @internal
     */
    public children: QueryList<IgxDropDownItemBaseDirective>;

    protected _width;
    protected _height;
    protected _focusedItem: any = null;
    protected _id = `igx-drop-down-${NEXT_ID++}`;

    /**
     * Gets if the dropdown is collapsed
     */
    public abstract readonly collapsed: boolean;

    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected platform: PlatformUtil,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
            super(_displayDensityOptions);
        }

    /** Keydown Handler */
    public onItemActionKey(key: DropDownActionKey, event?: Event) {
        switch (key) {
            case DropDownActionKey.ENTER:
            case DropDownActionKey.SPACE:
                this.selectItem(this.focusedItem, event);
                break;
            case DropDownActionKey.ESCAPE:
        }
    }

    /**
     * Emits selection with the target item & event
     *
     * @hidden @internal
     * @param newSelection the item selected
     * @param event the event that triggered the call
     */
    public selectItem(newSelection?: IgxDropDownItemBaseDirective) {
        this.selection.emit({
            newSelection,
            oldSelection: null,
            cancel: false
        });
    }

    /**
     * @hidden @internal
     */
    public get focusedItem(): IgxDropDownItemBaseDirective {
        return this._focusedItem;
    }

    /**
     * @hidden @internal
     */
    public set focusedItem(item: IgxDropDownItemBaseDirective) {
        this._focusedItem = item;
    }

    /**
     * Navigates to the item on the specified index
     *
     * @param newIndex number - the index of the item in the `items` collection
     */
    public navigateItem(newIndex: number) {
        if (newIndex !== -1) {
            const oldItem = this._focusedItem;
            const newItem = this.items[newIndex];
            if (oldItem) {
                oldItem.focused = false;
            }
            this.focusedItem = newItem;
            this.scrollToHiddenItem(newItem);
            this.focusedItem.focused = true;
        }
    }

    /**
     * @hidden @internal
     */
    public navigateFirst() {
        this.navigate(Navigate.Down, -1);
    }

    /**
     * @hidden @internal
     */
    public navigateLast() {
        this.navigate(Navigate.Up, this.items.length);
    }

    /**
     * @hidden @internal
     */
    public navigateNext() {
        this.navigate(Navigate.Down);
    }

    /**
     * @hidden @internal
     */
    public navigatePrev() {
        this.navigate(Navigate.Up);
    }

    protected scrollToHiddenItem(newItem: IgxDropDownItemBaseDirective) {
        const elementRect = newItem.element.nativeElement.getBoundingClientRect();
        const parentRect = this.scrollContainer.getBoundingClientRect();
        if (parentRect.top > elementRect.top) {
            this.scrollContainer.scrollTop -= (parentRect.top - elementRect.top);
        }

        if (parentRect.bottom < elementRect.bottom) {
            this.scrollContainer.scrollTop += (elementRect.bottom - parentRect.bottom);
        }
    }

    protected navigate(direction: Navigate, currentIndex?: number) {
        let index = -1;
        if (this._focusedItem) {
            index = currentIndex ? currentIndex : this.focusedItem.itemIndex;
        }
        const newIndex = this.getNearestSiblingFocusableItemIndex(index, direction);
        this.navigateItem(newIndex);
    }

    protected getNearestSiblingFocusableItemIndex(startIndex: number, direction: Navigate): number {
        let index = startIndex;
        const items = this.items;
        while (items[index + direction] && items[index + direction].disabled) {
            index += direction;
        }

        index += direction;
        if (index >= 0 && index < items.length) {
            return index;
        } else {
            return -1;
        }
    }
}
