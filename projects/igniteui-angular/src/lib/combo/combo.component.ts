import { CommonModule } from '@angular/common';
import {
    AfterViewInit, ChangeDetectorRef, Component, ContentChild, ElementRef, EventEmitter, HostBinding, HostListener,
    Input, NgModule, OnInit, OnDestroy, Output, TemplateRef, ViewChild, Optional, Inject, Injector
} from '@angular/core';
import {
    IgxComboItemDirective,
    IgxComboEmptyDirective,
    IgxComboHeaderItemDirective,
    IgxComboHeaderDirective,
    IgxComboFooterDirective,
    IgxComboAddItemDirective,
    IgxComboToggleIconDirective,
    IgxComboClearIconDirective
} from './combo.directives';
import { FormsModule, ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, AbstractControl } from '@angular/forms';
import { IgxCheckboxModule } from '../checkbox/checkbox.component';
import { IgxSelectionAPIService } from '../core/selection';
import { cloneArray, IBaseEventArgs, IBaseCancelableBrowserEventArgs, IBaseCancelableEventArgs, CancelableEventArgs } from '../core/utils';
import { IgxStringFilteringOperand, IgxBooleanFilteringOperand } from '../data-operations/filtering-condition';
import { FilteringLogic } from '../data-operations/filtering-expression.interface';
import { IgxForOfModule, IForOfState, IgxForOfDirective } from '../directives/for-of/for_of.directive';
import { IgxIconModule, IgxIconService } from '../icon/public_api';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxDropDownModule } from '../drop-down/public_api';
import { IgxInputGroupModule, IgxInputGroupComponent } from '../input-group/input-group.component';
import { IgxComboItemComponent } from './combo-item.component';
import { IgxComboDropDownComponent } from './combo-dropdown.component';
import { IgxComboFilteringPipe, IgxComboGroupingPipe } from './combo.pipes';
import { OverlaySettings, AbsoluteScrollStrategy, AutoPositionStrategy } from '../services/public_api';
import { noop, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DisplayDensityBase, DisplayDensityToken, IDisplayDensityOptions } from '../core/density';
import { IGX_COMBO_COMPONENT, IgxComboBase } from './combo.common';
import { IgxComboAddItemComponent } from './combo-add-item.component';
import { IgxComboAPIService } from './combo.api';
import { EditorProvider } from '../core/edit-provider';
import { IgxInputState, IgxInputDirective } from '../directives/input/input.directive';
import { IgxInputGroupType, IGX_INPUT_GROUP_TYPE } from '../input-group/public_api';
import { caseSensitive } from '@igniteui/material-icons-extended';

/**
 * @hidden
 */
enum DataTypes {
    EMPTY = 'empty',
    PRIMITIVE = 'primitive',
    COMPLEX = 'complex',
    PRIMARYKEY = 'valueKey'
}

/**
 * @hidden
 */
const ItemHeights = {
    comfortable: 40,
    cosy: 32,
    compact: 28,
};

/**
 * @hidden
 * The default number of items that should be in the combo's
 * drop-down list if no `[itemsMaxHeight]` is specified
 */
const itemsInContainer = 10;

export enum IgxComboState {
    /**
     * Combo with initial state.
     */
    INITIAL = IgxInputState.INITIAL,
    /**
     * Combo with valid state.
     */
    VALID = IgxInputState.VALID,
    /**
     * Combo with invalid state.
     */
    INVALID = IgxInputState.INVALID
}

/** The filtering criteria to be applied on data search */
export interface IComboFilteringOptions {
    /** Defines filtering case-sensitivity */
    caseSensitive: boolean;
}

/** Event emitted when an igx-combo's selection is changing */
export interface IComboSelectionChangeEventArgs extends IBaseCancelableEventArgs {
    /** An array containing the values that are currently selected */
    oldSelection: any[];
    /** An array containing the values that will be selected after this event */
    newSelection: any[];
    /** An array containing the values that will be added to the selection (if any) */
    added: any[];
    /** An array containing the values that will be removed from the selection (if any) */
    removed: any[];
    /** The text that will be displayed in the combo text box */
    displayText: string;
    /** The user interaction that triggered the selection change */
    event?: Event;
}

/** Event emitted when the igx-combo's search input changes */
export interface IComboSearchInputEventArgs extends IBaseCancelableEventArgs {
    /** The text that has been typed into the search input */
    searchText: string;
}

export interface IComboItemAdditionEvent extends IBaseEventArgs, CancelableEventArgs {
    oldCollection: any[];
    addedItem: any;
    newCollection: any[];
}

/**
 * When called with sets A & B, returns A - B (as array);
 *
 * @hidden
 */
const diffInSets = (set1: Set<any>, set2: Set<any>): any[] => {
    const results = [];
    set1.forEach(entry => {
        if (!set2.has(entry)) {
            results.push(entry);
        }
    });
    return results;
};

let NEXT_ID = 0;

@Component({
    selector: 'igx-combo',
    templateUrl: 'combo.component.html',
    providers: [
        IgxComboAPIService,
        { provide: IGX_COMBO_COMPONENT, useExisting: IgxComboComponent },
        { provide: NG_VALUE_ACCESSOR, useExisting: IgxComboComponent, multi: true }
    ]
})
export class IgxComboComponent extends DisplayDensityBase implements IgxComboBase, AfterViewInit, ControlValueAccessor, OnInit,
    OnDestroy, EditorProvider {
    /**
     * Set custom overlay settings that control how the combo's list of items is displayed.
     * Set:
     * ```html
     * <igx-combo [overlaySettings] = "customOverlaySettings"></igx-combo>
     * ```
     *
     * ```typescript
     *  const customSettings = { positionStrategy: { settings: { target: myTarget } } };
     *  combo.overlaySettings = customSettings;
     * ```
     * Get any custom overlay settings used by the combo:
     * ```typescript
     *  const comboOverlaySettings: OverlaySettings = myCombo.overlaySettings;
     * ```
     */

    @Input()
    public overlaySettings: OverlaySettings = null;

    /** @hidden @internal */
    @ViewChild('inputGroup', { read: IgxInputGroupComponent, static: true }) public inputGroup: IgxInputGroupComponent;

    /** @hidden @internal */
    @ViewChild('comboInput', { read: IgxInputDirective, static: true }) public comboInput: IgxInputDirective;

    /**
     * @hidden @internal
     */
    @ViewChild(IgxComboDropDownComponent, { read: IgxComboDropDownComponent, static: true })
    public dropdown: IgxComboDropDownComponent;

    /**
     * @hidden @internal
     */
    @ViewChild('searchInput')
    public searchInputElement: ElementRef<HTMLInputElement> = null;

    /**
     * @hidden @internal
     */
    public get displaySearchInput(): boolean {
        return this.filterable || this.allowCustomValues;
    }

    /**
     * The custom template, if any, that should be used when rendering ITEMS in the combo list
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.combo.itemTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-combo #combo>
     *      ...
     *      <ng-template igxComboItem>
     *          <div class="custom-item" let-item let-key="valueKey">
     *              <div class="custom-item__name">{{ item[key] }}</div>
     *              <div class="custom-item__cost">{{ item.cost }}</div>
     *          </div>
     *      </ng-template>
     *  </igx-combo>
     * ```
     */
    @ContentChild(IgxComboItemDirective, { read: TemplateRef })
    public itemTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering the HEADER for the combo items list
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.combo.headerTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-combo #combo>
     *      ...
     *      <ng-template igxComboHeader>
     *          <div class="combo__header">
     *              This is a custom header
     *          </div>
     *      </ng-template>
     *  </igx-combo>
     * ```
     */
    @ContentChild(IgxComboHeaderDirective, { read: TemplateRef })
    public headerTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering the FOOTER for the combo items list
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.combo.footerTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-combo #combo>
     *      ...
     *      <ng-template igxComboFooter>
     *          <div class="combo__footer">
     *              This is a custom footer
     *          </div>
     *      </ng-template>
     *  </igx-combo>
     * ```
     */
    @ContentChild(IgxComboFooterDirective, { read: TemplateRef })
    public footerTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering HEADER ITEMS for groups in the combo list
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.combo.headerItemTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-combo #combo>
     *      ...
     *      <ng-template igxComboHeaderItem let-item let-key="groupKey">
     *          <div class="custom-item--group">Group header for {{ item[key] }}</div>
     *      </ng-template>
     *  </igx-combo>
     * ```
     */
    @ContentChild(IgxComboHeaderItemDirective, { read: TemplateRef })
    public headerItemTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering the ADD BUTTON in the combo drop down
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.combo.addItemTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-combo #combo>
     *      ...
     *      <ng-template igxComboAddItem>
     *          <button class="combo__add-button">
     *              Click to add item
     *          </button>
     *      </ng-template>
     *  </igx-combo>
     * ```
     */
    @ContentChild(IgxComboAddItemDirective, { read: TemplateRef })
    public addItemTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering the ADD BUTTON in the combo drop down
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.combo.emptyTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-combo #combo>
     *      ...
     *      <ng-template igxComboEmpty>
     *          <div class="combo--empty">
     *              There are no items to display
     *          </div>
     *      </ng-template>
     *  </igx-combo>
     * ```
     */
    @ContentChild(IgxComboEmptyDirective, { read: TemplateRef })
    public emptyTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering the combo TOGGLE(open/close) button
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.combo.toggleIconTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-combo #combo>
     *      ...
     *      <ng-template igxComboToggleIcon let-collapsed>
     *          <igx-icon>{{ collapsed ? 'remove_circle' : 'remove_circle_outline'}}</igx-icon>
     *      </ng-template>
     *  </igx-combo>
     * ```
     */
    @ContentChild(IgxComboToggleIconDirective, { read: TemplateRef })
    public toggleIconTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering the combo CLEAR button
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.combo.clearIconTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-combo #combo>
     *      ...
     *      <ng-template igxComboClearIcon>
     *          <igx-icon>clear</igx-icon>
     *      </ng-template>
     *  </igx-combo>
     * ```
     */
    @ContentChild(IgxComboClearIconDirective, { read: TemplateRef })
    public clearIconTemplate: TemplateRef<any> = null;

    /**
     * @hidden @internal
     */
    @ViewChild(IgxForOfDirective, { static: true })
    public virtualScrollContainer: IgxForOfDirective<any>;

    /**
     * Emitted when item selection is changing, before the selection completes
     *
     * ```html
     * <igx-combo (selectionChange)='handleSelection()'></igx-combo>
     * ```
     */
    @Output()
    public selectionChange = new EventEmitter<IComboSelectionChangeEventArgs>();

    /**
     * Emitted before the dropdown is opened
     *
     * ```html
     * <igx-combo opening='handleOpening($event)'></igx-combo>
     * ```
     */
    @Output()
    public opening = new EventEmitter<IBaseCancelableBrowserEventArgs>();

    /**
     * Emitted after the dropdown is opened
     *
     * ```html
     * <igx-combo (opened)='handleOpened()'></igx-combo>
     * ```
     */
    @Output()
    public opened = new EventEmitter<void>();

    /**
     * Emitted before the dropdown is closed
     *
     * ```html
     * <igx-combo (closing)='handleClosing($event)'></igx-combo>
     * ```
     */
    @Output()
    public closing = new EventEmitter<IBaseCancelableBrowserEventArgs>();

    /**
     * Emitted after the dropdown is closed
     *
     * ```html
     * <igx-combo (closed)='handleClosed()'></igx-combo>
     * ```
     */
    @Output()
    public closed = new EventEmitter<void>();

    /**
     * Emitted when an item is being added to the data collection
     *
     * ```html
     * <igx-combo (addition)='handleAdditionEvent()'></igx-combo>
     * ```
     */
    @Output()
    public addition = new EventEmitter<IComboItemAdditionEvent>();

    /**
     * Emitted when the value of the search input changes (e.g. typing, pasting, clear, etc.)
     *
     * ```html
     * <igx-combo (searchInput)='handleSearchInputEvent()'></igx-combo>
     * ```
     */
    @Output()
    public searchInput = new EventEmitter<IComboSearchInputEventArgs>();

    /**
     * Emitted when new chunk of data is loaded from the virtualization
     *
     * ```html
     * <igx-combo (dataPreLoad)='handleDataPreloadEvent()'></igx-combo>
     * ```
     */
    @Output()
    public dataPreLoad = new EventEmitter<IForOfState>();

    /**
     * Gets/gets combo id.
     *
     * ```typescript
     * // get
     * let id = this.combo.id;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [id]='combo1'></igx-combo>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-combo-${NEXT_ID++}`;

    /**
     * Sets the style width of the element
     *
     * ```typescript
     * // get
     * let myComboWidth = this.combo.width;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [width]='250px'></igx-combo>
     * ```
     */
    @HostBinding('style.width')
    @Input()
    public width: string;

    /**
     * @hidden @internal
     */
    @HostBinding('class.igx-combo')
    public cssClass = 'igx-combo'; // Independent of display density, at the time being

    /**
     * @hidden @internal
     */
    @HostBinding(`attr.role`)
    public role = 'combobox';

    /**
     * @hidden @internal
     */
    @HostBinding('attr.aria-expanded')
    public get ariaExpanded(): boolean {
        return !this.dropdown.collapsed;
    }

    /**
     * @hidden @internal
     */
    @HostBinding('attr.aria-haspopup')
    public get hasPopUp() {
        return 'listbox';
    }

    /**
     * @hidden @internal
     */
    @HostBinding('attr.aria-owns')
    public get ariaOwns() {
        return this.dropdown.id;
    }

    /**
     * Controls whether custom values can be added to the collection
     *
     * ```typescript
     * // get
     * let comboAllowsCustomValues = this.combo.allowCustomValues;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [allowCustomValues]='true'></igx-combo>
     * ```
     */
    @Input()
    public allowCustomValues = false;

    /**
     * Configures the drop down list height
     *
     * ```typescript
     * // get
     * let myComboItemsMaxHeight = this.combo.itemsMaxHeight;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [itemsMaxHeight]='320'></igx-combo>
     * ```
     */
    @Input()
    public get itemsMaxHeight(): number {
        if (this._itemsMaxHeight === null || this._itemsMaxHeight === undefined) {
            return this.itemHeight * itemsInContainer;
        }
        return this._itemsMaxHeight;
    }

    public set itemsMaxHeight(val: number) {
        this._itemsMaxHeight = val;
    }

    /**
     * Configures the drop down list width
     *
     * ```typescript
     * // get
     * let myComboItemsWidth = this.combo.itemsWidth;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [itemsWidth] = '"180px"'></igx-combo>
     * ```
     */
    @Input()
    public itemsWidth: string;

    /**
     * Configures the drop down list item height
     *
     * ```typescript
     * // get
     * let myComboItemHeight = this.combo.itemHeight;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [itemHeight]='32'></igx-combo>
     * ```
     */
    @Input()
    public get itemHeight(): number {
        if (this._itemHeight === null || this._itemHeight === undefined) {
            return ItemHeights[this.displayDensity];
        }
        return this._itemHeight;
    }

    public set itemHeight(val: number) {
        this._itemHeight = val;
    }

    /**
     * Defines the placeholder value for the combo value field
     *
     * ```typescript
     * // get
     * let myComboPlaceholder = this.combo.placeholder;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [placeholder]='newPlaceHolder'></igx-combo>
     * ```
     */
    @Input()
    public placeholder;

    /**
     * @hidden @internal
     */
    public get inputEmpty(): boolean {
        return !this.value && !this.placeholder;
    }

    /**
     * Defines the placeholder value for the combo dropdown search field
     *
     * ```typescript
     * // get
     * let myComboSearchPlaceholder = this.combo.searchPlaceholder;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [searchPlaceholder]='newPlaceHolder'></igx-combo>
     * ```
     */
    @Input()
    public searchPlaceholder = 'Enter a Search Term';

    /**
     * Defines whether the caseSensitive icon should be shown in the search input
     *
     * ```typescript
     * // get
     * let myComboShowSearchCaseIcon = this.combo.showSearchCaseIcon;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [showSearchCaseIcon]='true'></igx-combo>
     * ```
     */

    @Input()
    public showSearchCaseIcon = false;


    /**
     * Combo data source.
     *
     * ```html
     * <!--set-->
     * <igx-combo [data]='items'></igx-combo>
     * ```
     */
    @Input()
    public get data(): any[] | null {
        return this._data;
    }
    public set data(val: any[] | null) {
        this._data = (val) ? val : [];
    }

    /**
     * Combo value data source property.
     *
     * ```typescript
     * // get
     * let myComboValueKey = this.combo.valueKey;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [valueKey]='myKey'></igx-combo>
     * ```
     */
    @Input()
    public valueKey: string = null;

    @Input()
    public set displayKey(val: string) {
        this._displayKey = val;
    }

    /**
     * Combo text data source property.
     *
     * ```typescript
     * // get
     * let myComboDisplayKey = this.combo.displayKey;
     *
     * // set
     * this.combo.displayKey = 'val';
     *
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [displayKey]='myDisplayKey'></igx-combo>
     * ```
     */
    public get displayKey() {
        return this._displayKey ? this._displayKey : this.valueKey;
    }

    /**
     * The item property by which items should be grouped inside the items list. Not usable if data is not of type Object[].
     *
     * ```html
     * <!--set-->
     * <igx-combo [groupKey]='newGroupKey'></igx-combo>
     * ```
     */
    @Input()
    public set groupKey(val: string) {
        this._groupKey = val;
    }

    /**
     * The item property by which items should be grouped inside the items list. Not usable if data is not of type Object[].
     *
     * ```typescript
     * // get
     * let currentGroupKey = this.combo.groupKey;
     * ```
     */
    public get groupKey(): string {
        return this._groupKey;
    }

    /**
     * An @Input property that enabled/disables filtering in the list. The default is `true`.
     * ```html
     * <igx-combo [filterable]="false">
     * ```
     */
    @Input()
    public filterable = true;

    /**
     * An @Input property that set aria-labelledby attribute
     * ```html
     * <igx-combo [ariaLabelledBy]="'label1'">
     * ```
     */
    @Input()
    @HostBinding('attr.aria-labelledby')
    public ariaLabelledBy: string;

    /**
     * An @Input property that enabled/disables combo. The default is `false`.
     * ```html
     * <igx-combo [disabled]="'true'">
     * ```
     */
    @Input()
    public disabled = false;

    /**
     * An @Input property that sets how the combo will be styled.
     * The allowed values are `line`, `box`, `border` and `search`. The default is `box`.
     * ```html
     * <igx-combo [type]="'line'">
     * ```
     */
    @Input()
    public get type(): IgxInputGroupType {
        return this._type || this._inputGroupType || 'box';
    }

    public set type(val: IgxInputGroupType) {
        this._type = val;
    }
    /**
     * An @Input property that controls whether the combo's search box
     * should be focused after the `opened` event is called
     * When `false`, the combo's list item container will be focused instead
     */
    @Input()
    public autoFocusSearch = true;

    @ViewChild('dropdownItemContainer', { static: true })
    protected dropdownContainer: ElementRef = null;

    @ViewChild('primitive', { read: TemplateRef, static: true })
    protected primitiveTemplate: TemplateRef<any>;

    @ViewChild('complex', { read: TemplateRef, static: true })
    protected complexTemplate: TemplateRef<any>;

    @ViewChild(IgxForOfDirective, { read: IgxForOfDirective, static: true })
    protected virtDir: IgxForOfDirective<any>;

    /**
     * Gets if control is valid, when used in a form
     *
     * ```typescript
     * // get
     * let valid = this.combo.valid;
     * ```
     */
    public get valid(): IgxComboState {
        return this._valid;
    }

    /**
     * Sets if control is valid, when used in a form
     *
     * ```typescript
     * // set
     * this.combo.valid = IgxComboState.INVALID;
     * ```
     */
    public set valid(valid: IgxComboState) {
        this._valid = valid;
        this.comboInput.valid = IgxInputState[IgxComboState[valid]];
    }

    /**
     * @hidden @internal
     */
    public get searchValue(): string {
        return this._searchValue;
    }

    public set searchValue(val: string) {
        this.filterValue = val;
        this._searchValue = val;
    }
    /**
     * @hidden @internal
     */
    public customValueFlag = true;
    /**
     * @hidden @internal
     */
    public defaultFallbackGroup = 'Other';
    /**
     * @hidden @internal
     */
    public filteringOptions: IComboFilteringOptions = {
        caseSensitive: false
    };
    /**
     * @hidden @internal
     */
    public filteringLogic = FilteringLogic.Or;
    /** @hidden @internal */
    public filterValue = '';

    protected stringFilters = IgxStringFilteringOperand;
    protected booleanFilters = IgxBooleanFilteringOperand;
    protected _groupKey = '';
    protected _displayKey: string;
    protected _prevInputValue = '';

    private _dataType = '';
    private _searchValue = '';
    private _type = null;
    private ngControl: NgControl = null;
    private destroy$ = new Subject<any>();
    private _data = [];
    private _filteredData = [];
    private _itemHeight = null;
    private _itemsMaxHeight = null;
    private _remoteSelection = {};
    private _onChangeCallback: (_: any) => void = noop;
    private _onTouchedCallback: () => void = noop;
    private _overlaySettings: OverlaySettings;
    private _value = '';
    private _valid = IgxComboState.INITIAL;

    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected selection: IgxSelectionAPIService,
        protected comboAPI: IgxComboAPIService,
        private _iconService: IgxIconService,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions,
        @Optional() @Inject(IGX_INPUT_GROUP_TYPE) private _inputGroupType: IgxInputGroupType,
        @Optional() private _injector: Injector) {
        super(_displayDensityOptions);
        this.comboAPI.register(this);
    }

    /**
     * @hidden @internal
     */
    @HostListener('keydown.ArrowDown', ['$event'])
    @HostListener('keydown.Alt.ArrowDown', ['$event'])
    public onArrowDown(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.open();
    }

    /**
     * @hidden @internal
     */
    public onInputClick(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        if (!this.disabled) {
            this.toggle();
        }
    }

    /**
     * Defines the current state of the virtualized data. It contains `startIndex` and `chunkSize`
     *
     * ```typescript
     * // get
     * let state = this.combo.virtualizationState;
     * ```
     */
    public get virtualizationState(): IForOfState {
        return this.virtDir.state;
    }
    /**
     * Sets the current state of the virtualized data.
     *
     * ```typescript
     * // set
     * this.combo.virtualizationState(state);
     * ```
     */
    public set virtualizationState(state: IForOfState) {
        this.virtDir.state = state;
    }

    /**
     * Gets total count of the virtual data items, when using remote service.
     *
     * ```typescript
     * // get
     * let count = this.combo.totalItemCount;
     * ```
     */
    public get totalItemCount(): number {
        return this.virtDir.totalItemCount;
    }
    /**
     * Sets total count of the virtual data items, when using remote service.
     *
     * ```typescript
     * // set
     * this.combo.totalItemCount(remoteService.count);
     * ```
     */
    public set totalItemCount(count: number) {
        this.virtDir.totalItemCount = count;
    }

    /**
     * The text displayed in the combo input
     *
     * ```typescript
     * // get
     * let comboValue = this.combo.value;
     * ```
     */
    public get value(): string {
        return this._value;
    }

    /**
     * @hidden @internal
     */
    public get filteredData(): any[] | null {
        return this.filterable ? this._filteredData : this.data;
    }

    /**
     * @hidden @internal
     */
    public set filteredData(val: any[] | null) {
        this._filteredData = this.groupKey ? (val || []).filter((e) => e.isHeader !== true) : val;
        this.checkMatch();
    }

    /**
     * @hidden @internal
     */
    public handleKeyUp(event: KeyboardEvent): void {
        if (event.key === 'ArrowDown' || event.key === 'Down') {
            this.dropdown.focusedItem = this.dropdown.items[0];
            this.dropdownContainer.nativeElement.focus();
        } else if (event.key === 'Escape' || event.key === 'Esc') {
            this.toggle();
        }
    }

    /**
     * @hidden @internal
     */
    public handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'ArrowUp' || event.key === 'Up') {
            event.preventDefault();
            event.stopPropagation();
            this.close();
        }
    }

    /**
     * @hidden @internal
     */
    public handleInputChange(event?: string) {
        if (event !== undefined) {
            const args: IComboSearchInputEventArgs = {
                searchText: event,
                owner: this,
                cancel: false
            };
            this.searchInput.emit(args);
            if (args.cancel) {
                this.filterValue = null;
            }
        }
        this.checkMatch();
    }

    /**
     * @hidden @internal
     */
    public get dataType(): string {
        if (this.displayKey) {
            return DataTypes.COMPLEX;
        }
        return DataTypes.PRIMITIVE;
    }

    /**
     * @hidden @internal
     */
    public get isRemote() {
        return this.totalItemCount > 0 &&
            this.valueKey &&
            this.dataType === DataTypes.COMPLEX;
    }

    /**
     * Returns if the specified itemID is selected
     *
     * @hidden
     * @internal
     */
    public isItemSelected(item: any): boolean {
        return this.selection.is_item_selected(this.id, item);
    }

    /**
     * Triggers change detection on the combo view
     */
    public triggerCheck() {
        this.cdr.detectChanges();
    }

    /**
     * @hidden @internal
     */
    public isAddButtonVisible(): boolean {
        // This should always return a boolean value. If this.searchValue was '', it returns '' instead of false;
        return this.searchValue !== '' && this.customValueFlag;
    }

    /**
     * @hidden @internal
     */
    public handleSelectAll(evt) {
        if (evt.checked) {
            this.selectAllItems();
        } else {
            this.deselectAllItems();
        }
    }

    /**
     * @hidden @internal
     */
    public addItemToCollection() {
        if (!this.searchValue) {
            return;
        }
        const newValue = this.searchValue.trim();
        const addedItem = this.displayKey ? {
            [this.valueKey]: newValue,
            [this.displayKey]: newValue
        } : newValue;
        if (this.groupKey) {
            Object.assign(addedItem, { [this.groupKey]: this.defaultFallbackGroup });
        }
        // expose shallow copy instead of this.data in event args so this.data can't be mutated
        const oldCollection = [...this.data];
        const newCollection = [...this.data, addedItem];
        const args: IComboItemAdditionEvent = {
            oldCollection, addedItem, newCollection, owner: this, cancel: false
        };
        this.addition.emit(args);
        if (args.cancel) {
            return;
        }
        this.data.push(args.addedItem);
        // trigger re-render
        this.data = cloneArray(this.data);
        this.selectItems(this.valueKey !== null && this.valueKey !== undefined ?
            [args.addedItem[this.valueKey]] : [args.addedItem], false);
        this.customValueFlag = false;
        this.searchInputElement.nativeElement.focus();
        this.dropdown.focusedItem = null;
        this.virtDir.scrollTo(0);
    }

    /**
     * @hidden @internal
     */
    public focusSearchInput(opening?: boolean): void {
        if (this.displaySearchInput && this.searchInputElement) {
            this.searchInputElement.nativeElement.focus();
        } else {
            if (opening) {
                this.dropdownContainer.nativeElement.focus();
            } else {
                this.comboInput.nativeElement.focus();
                this.toggle();
            }
        }
    }

    /**
     * @hidden @internal
     */
    public onBlur() {
        if (this.collapsed) {
            this._onTouchedCallback();
            if (this.ngControl && this.ngControl.invalid) {
                this.valid = IgxComboState.INVALID;
            } else {
                this.valid = IgxComboState.INITIAL;
            }
        }
    }

    /**
     * @hidden @internal
     */
    public ngOnInit() {
        this.ngControl = this._injector.get<NgControl>(NgControl, null);
        const targetElement = this.elementRef.nativeElement;
        this._overlaySettings = {
            target: targetElement,
            scrollStrategy: new AbsoluteScrollStrategy(),
            positionStrategy: new AutoPositionStrategy(),
            modal: false,
            closeOnOutsideClick: true,
            excludeFromOutsideClick: [targetElement as HTMLElement]
        };
        this.selection.set(this.id, new Set());
        this._iconService.addSvgIconFromText(caseSensitive.name, caseSensitive.value, 'imx-icons');
    }

    /**
     * @hidden @internal
     */
    public ngAfterViewInit() {
        this.filteredData = [...this.data];

        if (this.ngControl) {
            this.ngControl.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(this.onStatusChanged);
            this.manageRequiredAsterisk();
            this.cdr.detectChanges();
        }
        this.virtDir.chunkPreload.pipe(takeUntil(this.destroy$)).subscribe((e: IForOfState) => {
            const eventArgs: IForOfState = Object.assign({}, e, { owner: this });
            this.dataPreLoad.emit(eventArgs);
        });
    }

    /**
     * @hidden @internal
     */
    public ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.comboAPI.clear();
        this.selection.clear(this.id);
    }

    /**
     * @hidden @internal
     */
    public writeValue(value: any[]): void {
        const selection = Array.isArray(value) ? value : [];
        const oldSelection = this.selectedItems();
        this.selection.select_items(this.id, selection, true);
        this.cdr.markForCheck();
        this._value = this.createDisplayText(this.selectedItems(), oldSelection);
    }

    /**
     * @hidden @internal
     */
    public registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    /**
     * @hidden @internal
     */
    public registerOnTouched(fn: any): void {
        this._onTouchedCallback = fn;
    }

    /**
     * @hidden @internal
     */
    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /**
     * @hidden
     */
    public getEditElement(): HTMLElement {
        return this.comboInput.nativeElement;
    }

    /**
     * @hidden @internal
     */
    public get template(): TemplateRef<any> {
        this._dataType = this.dataType;
        if (this.itemTemplate) {
            return this.itemTemplate;
        }
        if (this._dataType === DataTypes.COMPLEX) {
            return this.complexTemplate;
        }
        return this.primitiveTemplate;
    }

    /**
     * @hidden @internal
     */
    public get context(): any {
        return {
            $implicit: this
        };
    }

    /**
     * @hidden @internal
     */
    public handleClearItems(event: Event): void {
        if (this.disabled) {
            return;
        }
        this.deselectAllItems(true, event);
        if (this.collapsed) {
            this.getEditElement().focus();
        } else {
            this.focusSearchInput(true);
        }
        event.stopPropagation();
    }

    /**
     * A method that opens/closes the combo.
     *
     * ```html
     * <button (click)="combo.toggle()">Toggle Combo</button>
     * <igx-combo #combo></igx-combo>
     * ```
     */
    public toggle(): void {
        const overlaySettings = Object.assign({}, this._overlaySettings, this.overlaySettings);
        this.dropdown.toggle(overlaySettings);
    }

    /**
     * A method that opens the combo.
     *
     * ```html
     * <button (click)="combo.open()">Open Combo</button>
     * <igx-combo #combo></igx-combo>
     * ```
     */
    public open(): void {
        const overlaySettings = Object.assign({}, this._overlaySettings, this.overlaySettings);
        this.dropdown.open(overlaySettings);
    }

    /**
     * A method that closes the combo.
     *
     * ```html
     * <button (click)="combo.close()">Close Combo</button>
     * <igx-combo #combo></igx-combo>
     * ```
     */
    public close(): void {
        this.dropdown.close();
    }

    /**
     * Gets drop down state.
     *
     * ```typescript
     * let state = this.combo.collapsed;
     * ```
     */
    public get collapsed(): boolean {
        return this.dropdown.collapsed;
    }

    /**
     * Get current selection state
     *
     * @returns Array of selected items
     * ```typescript
     * let selectedItems = this.combo.selectedItems();
     * ```
     */
    public selectedItems() {
        const items = Array.from(this.selection.get(this.id));
        return items;
    }

    /**
     * Select defined items
     *
     * @param newItems new items to be selected
     * @param clearCurrentSelection if true clear previous selected items
     * ```typescript
     * this.combo.selectItems(["New York", "New Jersey"]);
     * ```
     */
    public selectItems(newItems: Array<any>, clearCurrentSelection?: boolean, event?: Event) {
        if (newItems) {
            const newSelection = this.selection.add_items(this.id, newItems, clearCurrentSelection);
            this.setSelection(newSelection, event);
        }
    }

    /**
     * Deselect defined items
     *
     * @param items items to deselected
     * ```typescript
     * this.combo.deselectItems(["New York", "New Jersey"]);
     * ```
     */
    public deselectItems(items: Array<any>, event?: Event) {
        if (items) {
            const newSelection = this.selection.delete_items(this.id, items);
            this.setSelection(newSelection, event);
        }
    }

    /**
     * Select all (filtered) items
     *
     * @param ignoreFilter if set to true, selects all items, otherwise selects only the filtered ones.
     * ```typescript
     * this.combo.selectAllItems();
     * ```
     */
    public selectAllItems(ignoreFilter?: boolean, event?: Event) {
        const allVisible = this.selection.get_all_ids(ignoreFilter ? this.data : this.filteredData, this.valueKey);
        const newSelection = this.selection.add_items(this.id, allVisible);
        this.setSelection(newSelection, event);
    }

    /**
     * Deselect all (filtered) items
     *
     * @param ignoreFilter if set to true, deselects all items, otherwise deselects only the filtered ones.
     * ```typescript
     * this.combo.deselectAllItems();
     * ```
     */
    public deselectAllItems(ignoreFilter?: boolean, event?: Event): void {
        let newSelection = this.selection.get_empty();
        if (this.filteredData.length !== this.data.length && !ignoreFilter) {
            newSelection = this.selection.delete_items(this.id, this.selection.get_all_ids(this.filteredData, this.valueKey));
        }
        this.setSelection(newSelection, event);
    }

    /**
     * Selects/Deselects a single item
     *
     * @param itemID the itemID of the specific item
     * @param select If the item should be selected (true) or deselected (false)
     *
     * Without specified valueKey;
     * ```typescript
     * this.combo.valueKey = null;
     * const items: { field: string, region: string}[] = data;
     * this.combo.setSelectedItem(items[0], true);
     * ```
     * With specified valueKey;
     * ```typescript
     * this.combo.valueKey = 'field';
     * const items: { field: string, region: string}[] = data;
     * this.combo.setSelectedItem('Connecticut', true);
     * ```
     */
    public setSelectedItem(itemID: any, select = true, event?: Event): void {
        if (itemID === null || itemID === undefined) {
            return;
        }
        if (select) {
            this.selectItems([itemID], false, event);
        } else {
            this.deselectItems([itemID], event);
        }
    }
    /**
     * Event handlers
     *
     * @hidden
     * @internal
     */
    public handleOpening(event: IBaseCancelableBrowserEventArgs) {
        const eventArgs: IBaseCancelableBrowserEventArgs = Object.assign({}, event, { owner: this });
        this.opening.emit(eventArgs);
        event.cancel = eventArgs.cancel;
    }

    /**
     * @hidden @internal
     */
    public handleOpened() {
        this.triggerCheck();

        // Disabling focus of the search input should happen only when drop down opens.
        // During keyboard navigation input should receive focus, even the autoFocusSearch is disabled.
        // That is why in such cases focusing of the dropdownContainer happens outside focusSearchInput method.
        if (this.autoFocusSearch) {
            this.focusSearchInput(true);
        } else {
            this.dropdownContainer.nativeElement.focus();
        }
        this.opened.emit();
    }

    /**
     * @hidden @internal
     */
    public handleClosing(event: IBaseCancelableBrowserEventArgs) {
        const eventArgs: IBaseCancelableBrowserEventArgs = Object.assign({}, event, { owner: this });
        this.closing.emit(eventArgs);
        event.cancel = eventArgs.cancel;
        if (event.cancel) {
            return;
        }
        this.searchValue = '';
        this.comboInput.nativeElement.focus();
    }

    /**
     * @hidden @internal
     */
    public handleClosed() {
        this.closed.emit();
    }

    /**
     * @hidden @internal
     */
    public toggleCaseSensitive() {
        this.filteringOptions = { caseSensitive: !this.filteringOptions.caseSensitive };
    }

    protected setSelection(newSelection: Set<any>, event?: Event): void {
        const removed = diffInSets(this.selection.get(this.id), newSelection);
        const added = diffInSets(newSelection, this.selection.get(this.id));
        const newSelectionAsArray = Array.from(newSelection);
        const oldSelectionAsArray = Array.from(this.selection.get(this.id) || []);
        const displayText = this.createDisplayText(newSelectionAsArray, oldSelectionAsArray);
        const args: IComboSelectionChangeEventArgs = {
            newSelection: newSelectionAsArray,
            oldSelection: oldSelectionAsArray,
            added,
            removed,
            event,
            owner: this,
            displayText,
            cancel: false
        };
        this.selectionChange.emit(args);
        if (!args.cancel) {
            this.selection.select_items(this.id, args.newSelection, true);
            if (displayText !== args.displayText) {
                this._value = args.displayText;
            } else {
                this._value = this.createDisplayText(args.newSelection, args.oldSelection);
            }
            this._onChangeCallback(args.newSelection);
        }
    }

    protected onStatusChanged = () => {
        if ((this.ngControl.control.touched || this.ngControl.control.dirty) &&
            (this.ngControl.control.validator || this.ngControl.control.asyncValidator)) {
            if (!this.collapsed || this.inputGroup.isFocused) {
                this.valid = this.ngControl.invalid ? IgxComboState.INVALID : IgxComboState.VALID;
            } else {
                this.valid = this.ngControl.invalid ? IgxComboState.INVALID : IgxComboState.INITIAL;
            }
        } else {
            // B.P. 18 May 2021: IgxDatePicker does not reset its state upon resetForm #9526
            this.valid = IgxComboState.INITIAL;
        }
        this.manageRequiredAsterisk();
    };

    protected manageRequiredAsterisk(): void {
        if (this.ngControl && this.ngControl.control.validator) {
            // Run the validation with empty object to check if required is enabled.
            const error = this.ngControl.control.validator({} as AbstractControl);
            this.inputGroup.isRequired = error && error.required;
        }
    }

    /** Contains key-value pairs of the selected valueKeys and their resp. displayKeys */
    private registerRemoteEntries(ids: any[], add = true) {
        if (add) {
            const selection = this.getValueDisplayPairs(ids);
            for (const entry of selection) {
                this._remoteSelection[entry[this.valueKey]] = entry[this.displayKey];
            }
        } else {
            for (const entry of ids) {
                delete this._remoteSelection[entry];
            }
        }
    }

    /**
     * For `id: any[]` returns a mapped `{ [combo.valueKey]: any, [combo.displayKey]: any }[]`
     */
    private getValueDisplayPairs(ids: any[]) {
        return this.data.filter(entry => ids.indexOf(entry[this.valueKey]) > -1).map(e => ({
            [this.valueKey]: e[this.valueKey],
            [this.displayKey]: e[this.displayKey]
        }));
    }

    private checkMatch(): void {
        const displayKey = this.displayKey;
        const matchFn = (e) => {
            const value = displayKey ? e[displayKey] : e;
            return value.toString().toLowerCase() === this.searchValue.trim().toLowerCase();
        };
        const itemMatch = this.filteredData.some(matchFn);
        this.customValueFlag = this.allowCustomValues && !itemMatch;
    }

    /** Returns a string that should be populated in the combo's text box */
    private concatDisplayText(selection: any[]): string {
        const value = this.displayKey !== null && this.displayKey !== undefined ?
            this.convertKeysToItems(selection).map(entry => entry[this.displayKey]).join(', ') :
            selection.join(', ');
        return value;
    }

    /**
     * Constructs the combo display value
     * If remote, caches the key displayText
     * If not, just combine the object.displayKeys
     */
    private createDisplayText(newSelection: any[], oldSelection: any[]) {
        let value = '';
        if (this.isRemote) {
            if (newSelection.length) {
                const removedItems = oldSelection.filter(e => newSelection.indexOf(e) < 0);
                const addedItems = newSelection.filter(e => oldSelection.indexOf(e) < 0);
                this.registerRemoteEntries(addedItems);
                this.registerRemoteEntries(removedItems, false);
                value = Object.keys(this._remoteSelection).map(e => this._remoteSelection[e]).join(', ');
            } else {
                // If new selection is empty, clear all items
                this.registerRemoteEntries(oldSelection, false);
            }
        } else {
            value = this.concatDisplayText(newSelection);
        }
        return value;
    }

    /** if there is a valueKey - map the keys to data items, else - just return the keys */
    private convertKeysToItems(keys: any[]) {
        if (this.comboAPI.valueKey === null) {
            return keys;
        }
        // map keys vs. filter data to retain the order of the selected items
        return keys.map(key => this.data.find(entry => entry[this.valueKey] === key)).filter(e => e !== undefined);
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxComboComponent, IgxComboItemComponent, IgxComboGroupingPipe,
        IgxComboFilteringPipe, IgxComboDropDownComponent, IgxComboAddItemComponent,
        IgxComboItemDirective,
        IgxComboEmptyDirective,
        IgxComboHeaderItemDirective,
        IgxComboHeaderDirective,
        IgxComboFooterDirective,
        IgxComboAddItemDirective,
        IgxComboToggleIconDirective,
        IgxComboClearIconDirective],
    exports: [IgxComboComponent, IgxComboItemComponent, IgxComboDropDownComponent, IgxComboAddItemComponent,
        IgxComboItemDirective,
        IgxComboEmptyDirective,
        IgxComboHeaderItemDirective,
        IgxComboHeaderDirective,
        IgxComboFooterDirective,
        IgxComboAddItemDirective,
        IgxComboToggleIconDirective,
        IgxComboClearIconDirective,
        IgxInputGroupModule],
    imports: [IgxRippleModule, CommonModule, IgxInputGroupModule, FormsModule, ReactiveFormsModule,
        IgxForOfModule, IgxToggleModule, IgxCheckboxModule, IgxDropDownModule, IgxButtonModule, IgxIconModule]
})
export class IgxComboModule { }
