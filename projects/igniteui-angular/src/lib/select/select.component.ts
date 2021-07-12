import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding,
    Inject,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DisplayDensityToken, IDisplayDensityOptions } from '../core/density';
import { EditorProvider } from '../core/edit-provider';
import { IgxSelectionAPIService } from '../core/selection';
import { CancelableEventArgs, IBaseCancelableBrowserEventArgs, IBaseCancelableEventArgs, PlatformUtil } from '../core/utils';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { IgxDropDownItemBaseDirective } from '../drop-down/drop-down-item.base';
import { IGX_DROPDOWN_BASE, ISelectionEventArgs, Navigate } from '../drop-down/drop-down.common';
import { IgxInputGroupComponent } from '../input-group/input-group.component';
import { AbsoluteScrollStrategy } from '../services/overlay/scroll/absolute-scroll-strategy';
import { OverlaySettings } from '../services/overlay/utilities';
import { IgxOverlayService } from '../services/public_api';
import { IgxInputDirective, IgxInputState } from './../directives/input/input.directive';
import { IgxDropDownComponent } from './../drop-down/drop-down.component';
import { IgxSelectItemComponent } from './select-item.component';
import { SelectPositioningStrategy } from './select-positioning-strategy';
import { IgxSelectBase } from './select.common';
import { IgxHintDirective, IgxInputGroupType, IGX_INPUT_GROUP_TYPE } from '../input-group/public_api';
import { ToggleViewEventArgs } from '../directives/toggle/toggle.directive';

/** @hidden @internal */
@Directive({
    selector: '[igxSelectToggleIcon]'
})
export class IgxSelectToggleIconDirective {
}

/** @hidden @internal */
@Directive({
    selector: '[igxSelectHeader]'
})
export class IgxSelectHeaderDirective {
}

/** @hidden @internal */
@Directive({
    selector: '[igxSelectFooter]'
})
export class IgxSelectFooterDirective {
}

/**
 * **Ignite UI for Angular Select** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/select)
 *
 * The `igxSelect` provides an input with dropdown list allowing selection of a single item.
 *
 * Example:
 * ```html
 * <igx-select #select1 [placeholder]="'Pick One'">
 *   <label igxLabel>Select Label</label>
 *   <igx-select-item *ngFor="let item of items" [value]="item.field">
 *     {{ item.field }}
 *   </igx-select-item>
 * </igx-select>
 * ```
 */
@Component({
    selector: 'igx-select',
    templateUrl: './select.component.html',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: IgxSelectComponent, multi: true },
        { provide: IGX_DROPDOWN_BASE, useExisting: IgxSelectComponent }],
    styles: [`
        :host {
            display: block;
        }
    `]
})
export class IgxSelectComponent extends IgxDropDownComponent implements IgxSelectBase, ControlValueAccessor,
    AfterContentInit, OnInit, AfterViewInit, OnDestroy, EditorProvider {

    /** @hidden @internal */
    @ViewChild('inputGroup', { read: IgxInputGroupComponent, static: true }) public inputGroup: IgxInputGroupComponent;

    /** @hidden @internal */
    @ViewChild('input', { read: IgxInputDirective, static: true }) public input: IgxInputDirective;

    /** @hidden @internal */
    @ContentChildren(forwardRef(() => IgxSelectItemComponent), { descendants: true })
    public children: QueryList<IgxSelectItemComponent>;

    /** @hidden @internal */
    @ContentChild(forwardRef(() => IgxLabelDirective), { static: true }) public label: IgxLabelDirective;

    /**
     * An @Input property that sets input placeholder.
     *
     */
    @Input() public placeholder;


    /**
     * An @Input property that disables the `IgxSelectComponent`.
     * ```html
     * <igx-select [disabled]="'true'"></igx-select>
     * ```
     */
    @Input() public disabled = false;

    /**
     * An @Input property that sets custom OverlaySettings `IgxSelectComponent`.
     * ```html
     * <igx-select [overlaySettings] = "customOverlaySettings"></igx-select>
     * ```
     */
    @Input()
    public overlaySettings: OverlaySettings;

    /** @hidden @internal */
    @HostBinding('style.maxHeight')
    public maxHeight = '256px';

    /**
     * Emitted before the dropdown is opened
     *
     * ```html
     * <igx-select opening='handleOpening($event)'></igx-select>
     * ```
     */
    @Output()
    public opening = new EventEmitter<IBaseCancelableEventArgs>();

    /**
     * Emitted after the dropdown is opened
     *
     * ```html
     * <igx-select (opened)='handleOpened()'></igx-select>
     * ```
     */
    @Output()
    public opened = new EventEmitter<void>();

    /**
     * Emitted before the dropdown is closed
     *
     * ```html
     * <igx-select (closing)='handleClosing($event)'></igx-select>
     * ```
     */
    @Output()
    public closing = new EventEmitter<IBaseCancelableBrowserEventArgs>();

    /**
     * Emitted after the dropdown is closed
     *
     * ```html
     * <igx-select (closed)='handleClosed()'></igx-select>
     * ```
     */
    @Output()
    public closed = new EventEmitter<void>();

    /**
     * The custom template, if any, that should be used when rendering the select TOGGLE(open/close) button
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.select.toggleIconTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-select #select>
     *      ...
     *      <ng-template igxSelectToggleIcon let-collapsed>
     *          <igx-icon>{{ collapsed ? 'remove_circle' : 'remove_circle_outline'}}</igx-icon>
     *      </ng-template>
     *  </igx-select>
     * ```
     */
    @ContentChild(IgxSelectToggleIconDirective, { read: TemplateRef })
    public toggleIconTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering the HEADER for the select items list
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.select.headerTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-select #select>
     *      ...
     *      <ng-template igxSelectHeader>
     *          <div class="select__header">
     *              This is a custom header
     *          </div>
     *      </ng-template>
     *  </igx-select>
     * ```
     */
    @ContentChild(IgxSelectHeaderDirective, { read: TemplateRef, static: false })
    public headerTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering the FOOTER for the select items list
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.select.footerTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-select #select>
     *      ...
     *      <ng-template igxSelectFooter>
     *          <div class="select__footer">
     *              This is a custom footer
     *          </div>
     *      </ng-template>
     *  </igx-select>
     * ```
     */
    @ContentChild(IgxSelectFooterDirective, { read: TemplateRef, static: false })
    public footerTemplate: TemplateRef<any> = null;

    @ContentChild(IgxHintDirective, { read: ElementRef }) private hintElement: ElementRef;

    /** @hidden @internal */
    public width: string;

    /** @hidden @internal do not use the drop-down container class */
    public cssClass = false;

    /** @hidden @internal */
    public allowItemsFocus = false;

    /** @hidden @internal */
    public height: string;

    protected destroy$ = new Subject<boolean>();

    private ngControl: NgControl = null;
    private _overlayDefaults: OverlaySettings;
    private _value: any;
    private _type = null;

    /**
     * An @Input property that gets/sets the component value.
     *
     * ```typescript
     * // get
     * let selectValue = this.select.value;
     * ```
     *
     * ```typescript
     * // set
     * this.select.value = 'London';
     * ```
     * ```html
     * <igx-select [value]="value"></igx-select>
     * ```
     */
    @Input()
    public get value(): any {
        return this._value;
    }
    public set value(v: any) {
        if (this._value === v) {
            return;
        }
        this._value = v;
        this.setSelection(this.items.find(x => x.value === this.value));
    }

    /**
     * An @Input property that sets how the select will be styled.
     * The allowed values are `line`, `box` and `border`. The input-group default is `line`.
     * ```html
     * <igx-select [type]="'box'"></igx-select>
     * ```
     */
    @Input()
    public get type(): IgxInputGroupType {
            return this._type || this._inputGroupType || 'line';
        }

    public set type(val: IgxInputGroupType) {
        this._type = val;
    }

    /** @hidden @internal */
    public get selectionValue() {
        const selectedItem = this.selectedItem;
        return selectedItem ? selectedItem.itemText : '';
    }

    /** @hidden @internal */
    public get selectedItem(): IgxSelectItemComponent {
        return this.selectionService.first_item(this.id);
    }

    private _onChangeCallback: (_: any) => void = noop;
    private _onTouchedCallback: () => void = noop;

    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected platform: PlatformUtil,
        protected selectionService: IgxSelectionAPIService,
        @Inject(IgxOverlayService) protected overlayService: IgxOverlayService,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions,
        @Optional() @Inject(IGX_INPUT_GROUP_TYPE) private _inputGroupType: IgxInputGroupType,
        private _injector: Injector) {
        super(elementRef, cdr, platform, selectionService, _displayDensityOptions);
    }

    //#region ControlValueAccessor

    /** @hidden @internal */
    public writeValue = (value: any) => {
        this.value = value;
    };

    /** @hidden @internal */
    public registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    /** @hidden @internal */
    public registerOnTouched(fn: any): void {
        this._onTouchedCallback = fn;
    }

    /** @hidden @internal */
    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
    //#endregion

    /** @hidden @internal */
    public getEditElement(): HTMLInputElement {
        return this.input.nativeElement;
    }

    /** @hidden @internal */
    public selectItem(newSelection: IgxDropDownItemBaseDirective, event?) {
        const oldSelection = this.selectedItem;

        if (newSelection === null || newSelection.disabled || newSelection.isHeader) {
            return;
        }

        if (newSelection === oldSelection) {
            this.toggleDirective.close();
            return;
        }

        const args: ISelectionEventArgs = { oldSelection, newSelection, cancel: false };
        this.selection.emit(args);

        if (args.cancel) {
            return;
        }

        this.setSelection(newSelection);
        this._value = newSelection.value;

        if (event) {
            this.toggleDirective.close();
        }

        this.cdr.detectChanges();
        this._onChangeCallback(this.value);
    }

    /** @hidden @internal */
    public getFirstItemElement(): HTMLElement {
        return this.children.first.element.nativeElement;
    }

    /**
     * Opens the select
     *
     * ```typescript
     * this.select.open();
     * ```
     */
    public open(overlaySettings?: OverlaySettings) {
        if (this.disabled || this.items.length === 0) {
            return;
        }
        if (!this.selectedItem) {
            this.navigateFirst();
        }

        super.open(Object.assign({}, this._overlayDefaults, this.overlaySettings, overlaySettings));
    }

    public inputGroupClick(event: MouseEvent, overlaySettings?: OverlaySettings) {
        const targetElement = event.target as HTMLElement;

        if (this.hintElement && targetElement.contains(this.hintElement.nativeElement)) {
            return;
        }
        this.toggle(Object.assign({}, this._overlayDefaults, this.overlaySettings, overlaySettings));
}

    /** @hidden @internal */
   public ngAfterContentInit() {
        this._overlayDefaults = {
            target: this.getEditElement(),
            modal: false,
            positionStrategy: new SelectPositioningStrategy(this),
            scrollStrategy: new AbsoluteScrollStrategy(),
            excludeFromOutsideClick: [this.inputGroup.element.nativeElement as HTMLElement]
        };
        const changes$ = this.children.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.setSelection(this.items.find(x => x.value === this.value));
            this.cdr.detectChanges();
        });
        Promise.resolve().then(() => {
            if (!changes$.closed) {
                this.children.notifyOnChanges();
            }
        });
    }

    /**
     * Event handlers
     *
     * @hidden @internal
     */
    public handleOpening(event: CancelableEventArgs) {
        const args: CancelableEventArgs = { cancel: event.cancel };
        this.opening.emit(args);

        event.cancel = args.cancel;
        if (args.cancel) {
            return;
        }
    }

    /** @hidden @internal */
    public onToggleContentAppended(event: ToggleViewEventArgs) {
        const info = this.overlayService.getOverlayById(event.id);
        if (info?.settings?.positionStrategy instanceof SelectPositioningStrategy) {
            return;
        }
        super.onToggleContentAppended(event);
    }

    /** @hidden @internal */
    public handleOpened() {
        this.updateItemFocus();
        this.opened.emit();
    }

    /** @hidden @internal */
    public handleClosing(event) {
        const args: CancelableEventArgs = { cancel: event.cancel };
        this.closing.emit(args);
        event.cancel = args.cancel;
    }

    /** @hidden @internal */
    public handleClosed() {
        this.focusItem(false);
        this.closed.emit();
    }

    /** @hidden @internal */
    public onBlur(): void {
        this._onTouchedCallback();
        if (this.ngControl && this.ngControl.invalid) {
            this.input.valid = IgxInputState.INVALID;
        } else {
            this.input.valid = IgxInputState.INITIAL;
        }
    }

    /** @hidden @internal */
    public onFocus(): void {
        this._onTouchedCallback();
    }

    /**
     * @hidden @internal
     */
    public ngOnInit() {
        this.ngControl = this._injector.get<NgControl>(NgControl, null);
    }

    /**
     * @hidden @internal
     */
    public ngAfterViewInit() {
        if (this.ngControl) {
            this.ngControl.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(this.onStatusChanged.bind(this));
            this.manageRequiredAsterisk();
        }
        this.cdr.detectChanges();
    }

    /**
     * @hidden @internal
     */
    public ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
        this.selectionService.clear(this.id);
    }

    /**
     * @hidden @internal
     * Prevent input blur - closing the items container on Header/Footer Template click.
     */
    public mousedownHandler(event) {
        event.preventDefault();
    }

    protected onStatusChanged() {
        if ((this.ngControl.control.touched || this.ngControl.control.dirty) &&
            (this.ngControl.control.validator || this.ngControl.control.asyncValidator)) {
            if (this.inputGroup.isFocused) {
                this.input.valid = this.ngControl.invalid ? IgxInputState.INVALID : IgxInputState.VALID;
            } else {
                this.input.valid = this.ngControl.invalid ? IgxInputState.INVALID : IgxInputState.INITIAL;
            }
        } else {
            // B.P. 18 May 2021: IgxDatePicker does not reset its state upon resetForm #9526
            this.input.valid = IgxInputState.INITIAL;
        }
        this.manageRequiredAsterisk();
    }


    protected navigate(direction: Navigate, currentIndex?: number) {
        if (this.collapsed && this.selectedItem) {
            this.navigateItem(this.selectedItem.itemIndex);
        }
        super.navigate(direction, currentIndex);
    }

    protected manageRequiredAsterisk(): void {
        const hasRequiredHTMLAttribute = this.elementRef.nativeElement.hasAttribute('required');
        if (this.ngControl && this.ngControl.control.validator) {
            // Run the validation with empty object to check if required is enabled.
            const error = this.ngControl.control.validator({} as AbstractControl);
            this.inputGroup.isRequired = error && error.required;
            this.cdr.markForCheck();

        // If validator is dynamically cleared and no required HTML attribute is set,
        // reset label's required class(asterisk) and IgxInputState #6896
        } else if (this.inputGroup.isRequired && this.ngControl && !this.ngControl.control.validator && !hasRequiredHTMLAttribute) {
            this.input.valid = IgxInputState.INITIAL;
            this.inputGroup.isRequired = false;
            this.cdr.markForCheck();
        }
    }

    private setSelection(item: IgxDropDownItemBaseDirective) {
        if (item && item.value !== undefined && item.value !== null) {
            this.selectionService.set(this.id, new Set([item]));
        } else {
            this.selectionService.clear(this.id);
        }
    }
}

