import {
    ChangeDetectorRef,
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Inject,
    Input,
    NgModule,
    OnDestroy,
    Optional,
    Output,
    Self,
    AfterViewInit,
    OnInit
} from '@angular/core';
import { NgModel, FormControlName } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CancelableEventArgs, IBaseEventArgs } from '../../core/utils';
import {
    AbsoluteScrollStrategy,
    AutoPositionStrategy,
    IPositionStrategy,
    IScrollStrategy,
    OverlaySettings
} from '../../services/public_api';
import {
    IgxDropDownComponent,
    IgxDropDownItemNavigationDirective,
    IgxDropDownModule,
    ISelectionEventArgs
} from '../../drop-down/public_api';
import { IgxInputGroupComponent } from '../../input-group/public_api';
import { IgxOverlayOutletDirective } from '../toggle/toggle.directive';

/**
 * Interface that encapsulates onItemSelection event arguments - new value and cancel selection.
 *
 * @export
 */
export interface AutocompleteItemSelectionEventArgs extends CancelableEventArgs, IBaseEventArgs {
    /**
     * New value selected from the drop down
     */
    value: string;
}

export interface AutocompleteOverlaySettings {
    /** Position strategy to use with this settings */
    positionStrategy?: IPositionStrategy;
    /** Scroll strategy to use with this settings */
    scrollStrategy?: IScrollStrategy;
    /** Set the outlet container to attach the overlay to */
    outlet?: IgxOverlayOutletDirective | ElementRef;
}

/**
 * **Ignite UI for Angular Autocomplete** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/autocomplete.html)
 *
 * The igxAutocomplete directive provides a way to enhance a text input
 * by showing a drop down of suggested options, provided by the developer.
 *
 * Example:
 * ```html
 * <input type="text" [igxAutocomplete]="townsPanel" #autocompleteRef="igxAutocomplete"/>
 * <igx-drop-down #townsPanel>
 *     <igx-drop-down-item *ngFor="let town of towns | startsWith:townSelected" [value]="town">
 *         {{town}}
 *     </igx-drop-down-item>
 * </igx-drop-down>
 * ```
 */
@Directive({
    selector: '[igxAutocomplete]',
    exportAs: 'igxAutocomplete'
})
export class IgxAutocompleteDirective extends IgxDropDownItemNavigationDirective implements OnDestroy, AfterViewInit, OnInit {
    /**
     * Sets the target of the autocomplete directive
     *
     * ```html
     * <!-- Set -->
     * <input [igxAutocomplete]="dropdown" />
     * ...
     * <igx-drop-down #dropdown>
     * ...
     * </igx-drop-down>
     * ```
     */
    @Input('igxAutocomplete')
    public get target(): IgxDropDownComponent {
        return this._target as IgxDropDownComponent;
    }
    public set target(v: IgxDropDownComponent) {
        this._target = v;
    }

    /**
     * Provide overlay settings for the autocomplete drop down
     *
     * ```typescript
     * // get
     * let settings = this.autocomplete.autocompleteSettings;
     * ```
     * ```html
     * <!--set-->
     * <input type="text" [igxAutocomplete]="townsPanel" [igxAutocompleteSettings]="settings"/>
     * ```
     * ```typescript
     * // set
     * this.settings = {
     *  positionStrategy: new ConnectedPositioningStrategy({
     *      closeAnimation: null,
     *      openAnimation: null
     *  })
     * };
     * ```
     */
    @Input('igxAutocompleteSettings')
    public autocompleteSettings: AutocompleteOverlaySettings;

    /** @hidden @internal */
    @HostBinding('attr.autocomplete')
    public autofill = 'off';

    /** @hidden  @internal */
    @HostBinding('attr.role')
    public role = 'combobox';

    /**
     * Enables/disables autocomplete component
     *
     * ```typescript
     * // get
     * let disabled = this.autocomplete.disabled;
     * ```
     * ```html
     * <!--set-->
     * <input type="text" [igxAutocomplete]="townsPanel" [igxAutocompleteDisabled]="disabled"/>
     * ```
     * ```typescript
     * // set
     * public disabled = true;
     * ```
     */
    @Input('igxAutocompleteDisabled')
    public disabled = false;

    /**
     * Emitted after item from the drop down is selected
     *
     * ```html
     * <input igxInput [igxAutocomplete]="townsPanel" (itemSelected)='itemSelected($event)' />
     * ```
     */
    @Output()
    public itemSelected = new EventEmitter<AutocompleteItemSelectionEventArgs>();

    /** @hidden @internal */
    public get nativeElement(): HTMLInputElement {
        return this.elementRef.nativeElement;
    }

    /** @hidden @internal */
    public get parentElement(): HTMLElement {
        return this.group ? this.group.element.nativeElement : this.nativeElement;
    }

    private get settings(): OverlaySettings {
        const settings = Object.assign({}, this.defaultSettings, this.autocompleteSettings);
        const target = settings.target || settings.positionStrategy.settings.target;
        if (!target) {
            const positionStrategyClone: IPositionStrategy = settings.positionStrategy.clone();
            settings.target = this.parentElement;
            settings.positionStrategy = positionStrategyClone;
        }
        return settings;
    }

    /** @hidden  @internal */
    @HostBinding('attr.aria-expanded')
    public get ariaExpanded() {
        return !this.collapsed;
    }

    /** @hidden  @internal */
    @HostBinding('attr.aria-haspopup')
    public get hasPopUp() {
        return 'listbox';
    }

    /** @hidden  @internal */
    @HostBinding('attr.aria-owns')
    public get ariaOwns() {
        return this.target.listId;
    }

    /** @hidden  @internal */
    @HostBinding('attr.aria-activedescendant')
    public get ariaActiveDescendant() {
        return !this.target.collapsed && this.target.focusedItem ? this.target.focusedItem.id : null;
    }

    /** @hidden  @internal */
    @HostBinding('attr.aria-autocomplete')
    public get ariaAutocomplete() {
        return 'list';
    }

    protected id: string;
    protected get model() {
        return this.ngModel || this.formControl;
    }

    private _shouldBeOpen = false;
    private destroy$ = new Subject();
    private defaultSettings: OverlaySettings;

    constructor(@Self() @Optional() @Inject(NgModel) protected ngModel: NgModel,
        @Self() @Optional() @Inject(FormControlName) protected formControl: FormControlName,
        @Optional() protected group: IgxInputGroupComponent,
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef) {
        super(null);
    }

    /** @hidden  @internal */
    @HostListener('input')
    public onInput() {
        this.open();
    }

    /** @hidden  @internal */
    @HostListener('keydown.ArrowDown', ['$event'])
    @HostListener('keydown.Alt.ArrowDown', ['$event'])
    @HostListener('keydown.ArrowUp', ['$event'])
    @HostListener('keydown.Alt.ArrowUp', ['$event'])
    public onArrowDown(event: Event) {
        event.preventDefault();
        this.open();
    }

    /** @hidden  @internal */
    @HostListener('keydown.Tab')
    @HostListener('keydown.Shift.Tab')
    public onTab() {
        this.close();
    }

    /** @hidden  @internal */
    public handleKeyDown(event) {
        if (!this.collapsed) {
            switch (event.key.toLowerCase()) {
                case 'space':
                case 'spacebar':
                case ' ':
                case 'home':
                case 'end':
                    return;
                default:
                    super.handleKeyDown(event);
            }
        }
    }

    /** @hidden  @internal */
    public onArrowDownKeyDown() {
        super.onArrowDownKeyDown();
    }

    /** @hidden  @internal */
    public onArrowUpKeyDown() {
        super.onArrowUpKeyDown();
    }

    /** @hidden  @internal */
    public onEndKeyDown() {
        super.onEndKeyDown();
    }

    /** @hidden  @internal */
    public onHomeKeyDown() {
        super.onHomeKeyDown();
    }

    /**
     * Closes autocomplete drop down
     */
    public close() {
        this._shouldBeOpen = false;
        if (this.collapsed) {
            return;
        }
        this.target.close();
    }

    /**
     * Opens autocomplete drop down
     */
    public open() {
        this._shouldBeOpen = true;
        if (this.disabled || !this.collapsed || this.target.children.length === 0) {
            return;
        }
        // if no drop-down width is set, the drop-down will be as wide as the autocomplete input;
        this.target.width = this.target.width || (this.parentElement.clientWidth + 'px');
        this.target.open(this.settings);
        this.highlightFirstItem();
    }

    /** @hidden @internal */
    public ngOnInit() {
        const targetElement = this.parentElement;
        this.defaultSettings = {
            target: targetElement,
            modal: false,
            scrollStrategy: new AbsoluteScrollStrategy(),
            positionStrategy: new AutoPositionStrategy(),
            excludeFromOutsideClick: [targetElement]
        };
    }

    /** @hidden */
    public ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public ngAfterViewInit() {
        this.target.children.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (this.target.children.length) {
                if (!this.collapsed) {
                    this.highlightFirstItem();
                } else if (this._shouldBeOpen) {
                    this.open();
                }
            } else {
                // _shouldBeOpen flag should remain unchanged since this state change doesn't come from outside of the component
                // (like in the case of public API or user interaction).
                this.target.close();
            }
        });
        this.target.selection.pipe(takeUntil(this.destroy$)).subscribe(this.select.bind(this));
    }

    private get collapsed(): boolean {
        return this.target ? this.target.collapsed : true;
    }

    private select(value: ISelectionEventArgs) {
        if (!value.newSelection) {
            return;
        }
        value.cancel = true; // Disable selection in the drop down, because in autocomplete we do not save selection.
        const newValue = value.newSelection.value;
        const args: AutocompleteItemSelectionEventArgs = { value: newValue, cancel: false };
        this.itemSelected.emit(args);
        if (args.cancel) {
            return;
        }
        this.close();

        // Update model after the input is re-focused, in order to have proper valid styling.
        // Otherwise when item is selected using mouse (and input is blurred), then valid style will be removed.
        if (this.model) {
            this.model.control.setValue(newValue);
        } else {
            this.nativeElement.value = newValue;
        }
    };

    private highlightFirstItem() {
        if (this.target.focusedItem) {
            this.target.focusedItem.focused = false;
            this.target.focusedItem = null;
        }
        this.target.navigateFirst();
        this.cdr.detectChanges();
    };
}

/** @hidden */
@NgModule({
    imports: [IgxDropDownModule, CommonModule],
    declarations: [IgxAutocompleteDirective],
    exports: [IgxAutocompleteDirective]
})
export class IgxAutocompleteModule { }
