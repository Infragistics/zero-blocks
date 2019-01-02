import {
    ChangeDetectorRef, Component, ContentChild,
    ElementRef, forwardRef, Inject, QueryList, OnDestroy, HostListener, AfterViewInit, Input
} from '@angular/core';
import { takeUntil, take } from 'rxjs/operators';
import { IgxForOfDirective } from '../directives/for-of/for_of.directive';
import { CancelableEventArgs } from '../core/utils';
import { IgxComboBase, IGX_COMBO_COMPONENT } from './combo.common';
import { Navigate } from '../drop-down/drop-down.common';
import { IDropDownItem, IDropDownBase, IGX_DROPDOWN_BASE } from '../drop-down/drop-down-utils';
import { IgxDropDownComponent } from '../drop-down/drop-down.component';
import { IgxDropDownSelectionService } from '../drop-down/drop-down.selection';
import { DropDownActionKeys } from '../drop-down/drop-down-navigation.directive';
import { IgxComboAddItemComponent } from './combo-add-item.component';

/** @hidden */
@Component({
    selector: 'igx-combo-drop-down',
    templateUrl: 'combo-dropdown.component.html',
    providers: [{ provide: IGX_DROPDOWN_BASE, useExisting: IgxComboDropDownComponent }]
})
export class IgxComboDropDownComponent extends IgxDropDownComponent implements IDropDownBase, OnDestroy, AfterViewInit {
    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        @Inject(IgxDropDownSelectionService) protected selection: IgxDropDownSelectionService,
        @Inject(IGX_COMBO_COMPONENT) public combo: IgxComboBase) {
        super(elementRef, cdr, selection);
    }

    /**
     * @hidden
     */
    protected get scrollContainer() {
        return this.verticalScrollContainer.dc.location.nativeElement;
    }

    /**
     * @hidden
     */
    protected get isScrolledToLast(): boolean {
        const scrollTop = this.verticalScrollContainer.getVerticalScroll().scrollTop;
        const scrollHeight = this.verticalScrollContainer.getVerticalScroll().scrollHeight;
        return Math.floor(scrollTop + this.verticalScrollContainer.igxForContainerSize) === scrollHeight;
    }

    protected get lastVisibleIndex(): number {
        return this.combo.totalItemCount ?
            Math.floor(this.combo.itemsMaxHeight / this.combo.itemHeight) :
            this.items.length - 1;
    }

    /**
     * @hidden
     */
    protected get children(): QueryList<IDropDownItem> {
        return this.combo.children;
    }

    protected set children(value: QueryList<IDropDownItem>) {
        this._children = value;
    }

    /**
     * @hidden
     */
    public get selectedItem(): any[] {
        const sel = this.selection.get(this.comboID);
        return sel ? Array.from(sel) : [];
    }
    private _children: QueryList<IDropDownItem>;
    private _scrollPosition = 0;

    /**
     * @hidden
     */
    @ContentChild(forwardRef(() => IgxForOfDirective), { read: IgxForOfDirective })
    public verticalScrollContainer: IgxForOfDirective<any>;

    @Input()
    public comboID: string;
    /**
     * @hidden
     */
    @HostListener('focus')
    onFocus() {
        this._focusedItem = this._focusedItem || this.items[0];
        if (this._focusedItem) {
            this._focusedItem.isFocused = true;
        }
    }

    /**
     * @hidden
     */
    onBlur(evt?) {
        if (this._focusedItem) {
            this._focusedItem.isFocused = false;
            this._focusedItem = null;
        }
    }

    onToggleOpened() {
        this.onOpened.emit();
    }
    /**
     * @hidden
     */
    navigatePrev() {
        if (this._focusedItem.index === 0 && this.verticalScrollContainer.state.startIndex === 0) {
            this.combo.focusSearchInput(false);
        } else {
            super.navigatePrev();
        }
    }

    /**
     * @hidden
     */
    navigateFirst() {
        const vContainer = this.verticalScrollContainer;
        if (vContainer.state.startIndex === 0) {
            super.navigateItem(0);
            return;
        }
        vContainer.scrollTo(0);
        this.subscribeNext(vContainer, () => {
            this.combo.triggerCheck();
            super.navigateItem(0);
            this.combo.triggerCheck();
        });
    }

    /**
     * @hidden
     */
    navigateLast() {
        const vContainer = this.verticalScrollContainer;
        const scrollTarget = this.combo.totalItemCount ?
            this.combo.totalItemCount - 1 :
            Math.max(this.combo.data.length - 1, vContainer.igxForOf.length - 1);
        if (vContainer.igxForOf.length <= vContainer.state.startIndex + vContainer.state.chunkSize) {
            super.navigateItem(this.items.length - 1);
            return;
        }
        vContainer.scrollTo(scrollTarget);
        this.subscribeNext(vContainer, () => {
            this.combo.triggerCheck();
            super.navigateItem(this.items.length - 1);
            this.combo.triggerCheck();
        });
    }

    /**
     * @hidden
     */
    private navigateRemoteItem(direction) {
        this.verticalScrollContainer.addScrollTop(direction * this.combo.itemHeight);
        this.subscribeNext(this.verticalScrollContainer, () => {
            if (direction === Navigate.Up) {
                super.navigateItem(0);
            } else {
                super.navigateItem(this.focusedItem.index);
            }
        });
    }

    /**
     * @hidden
     */
    selectItem(item: IDropDownItem) {
        if (item === null || item === undefined) {
            return;
        }
        if (item instanceof IgxComboAddItemComponent) {
            this.combo.addItemToCollection();
        } else {
            this.selection.set_selected_item(this.comboID, item.itemID);
            this._focusedItem = item;
        }
    }

    /**
     * @hidden
     */
    public navigateItem(newIndex: number, direction?: number) {
        const vContainer = this.verticalScrollContainer;
        const notVirtual = vContainer.dc.instance.notVirtual;
        if (notVirtual || !direction) { // If list has no scroll OR no direction is passed
            super.navigateItem(newIndex); // use default scroll
        } else if (vContainer && vContainer.totalItemCount && vContainer.totalItemCount !== 0) {
            this.navigateRemoteItem(direction);
        } else {
            if (direction === Navigate.Up) { // Navigate UP
                this.navigateUp(newIndex);
            } else if (direction === Navigate.Down) { // Navigate DOWN
                this.navigateDown(newIndex);
            }
        }
    }

    private navigateDown(newIndex?: number) {
        const vContainer = this.verticalScrollContainer;
        const allData = vContainer.igxForOf;
        const extraScroll = this.combo.isAddButtonVisible() ? 1 : 0;
        const focusedItem = this.focusedItem;
        const items = this.items;
        const children = this.children.toArray();
        if (focusedItem) {
            if (focusedItem instanceof IgxComboAddItemComponent) { return; }
            if (focusedItem.value === allData[allData.length - 1]) {
                this.focusAddItemButton();
                return;
            }
        }
        let targetDataIndex = newIndex === -1 ? this.itemIndexInData(this.focusedItem.index) + 1 : this.itemIndexInData(newIndex);
        const lastLoadedIndex = vContainer.state.startIndex + vContainer.state.chunkSize - 1; // Last item is not visible, so require scroll
        if (targetDataIndex < lastLoadedIndex) { // If no scroll is required
            if (newIndex !== -1 || newIndex === children.length - 1 - extraScroll) { // Use normal nav for visible items
                super.navigateItem(newIndex);
            }
        } else if (this.isScrolledToLast && targetDataIndex === lastLoadedIndex) { // If already at bottom and target is last item
            super.navigateItem(items.length - 1 - extraScroll); // Focus the last item (excluding Add Button)
        } else { // If scroll is required
            // If item is header, find next non-header index
            const addedIndex = allData[targetDataIndex].isHeader ? this.findNextFocusableItem(targetDataIndex, Navigate.Down, allData) : 0;
            targetDataIndex += addedIndex; // Add steps to the target index
            if (addedIndex === -1) { // If there are no more non-header items & add button is visible
                this.focusAddItemButton();
            } else if (targetDataIndex === allData.length - 1 && !this.isScrolledToLast) {
                // If target is very last loaded item, but scroll is not at the bottom (item is in DOM but not visible)
                vContainer.scrollTo(targetDataIndex); // This will not trigger `onChunkLoad`
                super.navigateItem(items.length - 1 - extraScroll); // Target last item (excluding Add Button)
            } else { // Perform virtual scroll
                this.subscribeNext(vContainer, () => {
                    // children = all items in the DD (including addItemButton)
                    // length - 2 instead of -1, because we do not want to focus the last loaded item (in DOM, but not visible)
                    super.navigateItem(children[children.length - 2 - extraScroll].index); // Focus last item (excluding Add Button)
                });
                vContainer.scrollTo(targetDataIndex); // Perform virtual scroll
            }
        }
    }

    private navigateUp(newIndex?: number) {
        const vContainer = this.verticalScrollContainer;
        const allData = vContainer.igxForOf;
        const focusedItem = this.focusedItem;
        if (focusedItem.value === allData.find(e => !e.isHeader && !e.hidden).value) { // If this is the very first non-header item
            this.focusComboSearch(); // Focus combo search
            return;
        }
        let targetDataIndex = newIndex === -1 ? this.itemIndexInData(focusedItem.index) - 1 : this.itemIndexInData(newIndex);
        if (newIndex !== -1) { // If no scroll is required
            if (this.isScrolledToLast && targetDataIndex === vContainer.state.startIndex) {
                // If virt scrollbar is @ bottom, first item is in DOM but not visible
                vContainer.scrollTo(targetDataIndex); // This will not trigger `onChunkLoad`
                super.navigateItem(0); // Focus first visible item
            } else {
                super.navigateItem(newIndex); // Use normal navigation
            }
        } else { // Perform virtual scroll
            // If item is header, find next non-header index
            const addedIndex = allData[targetDataIndex].isHeader ? this.findNextFocusableItem(targetDataIndex, Navigate.Up, allData) : 0;
            targetDataIndex -= addedIndex; // Add steps to targetDataIndex
            if (addedIndex === -1) { // If there is no non-header
                vContainer.scrollTo(0);
                this.focusComboSearch(); // Focus combo search;
            } else {
                this.subscribeNext(vContainer, () => {
                    super.navigateItem(0); // Focus the first loaded item
                });
                vContainer.scrollTo(targetDataIndex); // Perform virtual scroll
            }
        }
    }

    private itemIndexInData(index: number) {
        return this.children.toArray().findIndex(e => e.index === index) + this.verticalScrollContainer.state.startIndex;
    }

    private findNextFocusableItem(indexInData: number, direction: Navigate, data: any[]): number {
        if (direction === Navigate.Up) {
            return [...data].splice(0, indexInData + 1).reverse().findIndex(e => !e.isHeader);
        }
        return [...data].splice(indexInData, data.length - 1).findIndex(e => !e.isHeader);
    }

    private focusComboSearch() {
        this.combo.focusSearchInput(false);
        if (this.focusedItem) {
            this.focusedItem.isFocused = false;
        }
        this.focusedItem = null;
    }

    private focusAddItemButton() {
        if (this.combo.isAddButtonVisible()) {
            super.navigateItem(this.items.length - 1);
        }
    }

    private subscribeNext(virtualContainer: any, callback: (elem?) => void) {
        virtualContainer.onChunkLoad.pipe(take(1), takeUntil(this.destroy$)).subscribe({
            next: (e: any) => {
                callback(e);
            }
        });
    }

    protected scrollToHiddenItem(newItem: any): void { }
    protected _handleClick(event: any) {
        this.selection.set_selected_item(this.comboID, event.itemID);
    }

    /**
     * @hidden
     */
    protected scrollHandler = () => {
        this.disableTransitions = true;
    }

    /**
     * @hidden
     */
    protected scrollToItem() {
    }
    /**
     * @hidden
     */
    onToggleClosing(e: CancelableEventArgs) {
        super.onToggleClosing(e);
        this._scrollPosition = this.verticalScrollContainer.getVerticalScroll().scrollTop;
    }

    /**
     * @hidden
     */
    updateScrollPosition() {
        this.verticalScrollContainer.getVerticalScroll().scrollTop = this._scrollPosition;
    }

    /**
     * @hidden
     */
    public handleKeyDown(key: DropDownActionKeys) {
        switch (key) {
            case DropDownActionKeys.ENTER:
                this.handleEnter();
                break;
            case DropDownActionKeys.SPACE:
                this.selectItem(this.focusedItem);
                break;
            case DropDownActionKeys.TAB:
            case DropDownActionKeys.ESCAPE:
                this.close();
        }
    }

    private handleEnter() {
        if (this.focusedItem instanceof IgxComboAddItemComponent) {
            this.combo.addItemToCollection();
        } else {
            this.close();
        }
    }

    public ngAfterViewInit() {
        this.verticalScrollContainer.getVerticalScroll().addEventListener('scroll', this.scrollHandler);
    }

    /**
     *@hidden
     */
    public ngOnDestroy(): void {
        this.verticalScrollContainer.getVerticalScroll().removeEventListener('scroll', this.scrollHandler);
        this.destroy$.next(true);
        this.destroy$.complete();
    }
}
