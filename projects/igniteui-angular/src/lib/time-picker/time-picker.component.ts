import {
    CommonModule
} from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ContentChild,
    Inject,
    Injectable,
    AfterViewInit,
    Injector,
    PipeTransform,
    LOCALE_ID, Optional, ContentChildren, QueryList, HostListener
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    NgControl,
    AbstractControl,
    ValidationErrors,
    Validator,
    NG_VALIDATORS
} from '@angular/forms';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { IgxIconModule } from '../icon/public_api';
import { IgxInputGroupModule, IgxInputGroupComponent } from '../input-group/input-group.component';
import { IgxInputDirective, IgxInputState } from '../directives/input/input.directive';
import { IgxInputGroupType, IGX_INPUT_GROUP_TYPE } from '../input-group/public_api';
import { DisplayDensityToken, IDisplayDensityOptions } from '../core/density';
import {
    IgxItemListDirective,
    IgxTimeItemDirective,
    IgxTimePickerTemplateDirective,
    IgxTimePickerActionsDirective
} from './time-picker.directives';
import { Subscription, noop, fromEvent } from 'rxjs';
import { IgxTimePickerBase, IGX_TIME_PICKER_COMPONENT } from './time-picker.common';
import { AbsoluteScrollStrategy } from '../services/overlay/scroll';
import { AutoPositionStrategy } from '../services/overlay/position';
import { OverlaySettings } from '../services/overlay/utilities';
import { takeUntil } from 'rxjs/operators';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxMaskModule } from '../directives/mask/mask.directive';
import { IgxDateTimeEditorModule, IgxDateTimeEditorDirective } from '../directives/date-time-editor/date-time-editor.directive';
import { IgxToggleModule, IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { ITimePickerResourceStrings } from '../core/i18n/time-picker-resources';
import { CurrentResourceStrings } from '../core/i18n/resources';
import { IBaseEventArgs, isEqual, isDate, PlatformUtil } from '../core/utils';
import { PickerInteractionMode } from '../date-common/types';
import { IgxTextSelectionModule } from '../directives/text-selection/text-selection.directive';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { PickerBaseDirective } from '../date-common/picker-base.directive';
import { DateTimeUtil } from '../date-common/util/date-time.util';
import { DatePart, DatePartDeltas } from '../directives/date-time-editor/public_api';
import { PickerHeaderOrientation } from '../date-common/types';
import { IgxPickerClearComponent, IgxPickersCommonModule } from '../date-common/picker-icons.common';
import { TimeFormatPipe, TimeItemPipe } from './time-picker.pipes';

let NEXT_ID = 0;
const ITEMS_COUNT = 7;

@Injectable()
export class TimePickerHammerConfig extends HammerGestureConfig {
    public overrides = {
        pan: { direction: Hammer.DIRECTION_VERTICAL, threshold: 1 }
    };
}

export interface IgxTimePickerValidationFailedEventArgs extends IBaseEventArgs {
    previousValue: Date | string;
    currentValue: Date | string;
}

@Component({
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxTimePickerComponent,
            multi: true
        },
        {
            provide: HAMMER_GESTURE_CONFIG,
            useClass: TimePickerHammerConfig
        },
        {
            provide: IGX_TIME_PICKER_COMPONENT,
            useExisting: IgxTimePickerComponent
        },
        {
            provide: NG_VALIDATORS,
            useExisting: IgxTimePickerComponent,
            multi: true
        }
    ],
    selector: 'igx-time-picker',
    templateUrl: 'time-picker.component.html',
    styles: [
        `:host {
            display: block;
        }`
    ]
})
export class IgxTimePickerComponent extends PickerBaseDirective
    implements
    IgxTimePickerBase,
    ControlValueAccessor,
    OnInit,
    OnDestroy,
    AfterViewInit,
    Validator {
    /**
     * An @Input property that sets the value of the `id` attribute.
     * ```html
     * <igx-time-picker [id]="'igx-time-picker-5'" [displayFormat]="h:mm tt" ></igx-time-picker>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-time-picker-${NEXT_ID++}`;

    /**
     * The format used when editable input is not focused. Defaults to the `inputFormat` if not set.
     *
     * @remarks
     * Uses Angular's `DatePipe`.
     *
     * @example
     * ```html
     * <igx-time-picker displayFormat="mm:ss"></igx-time-picker>
     * ```
     *
     */
    @Input()
    public displayFormat: string;

    /**
     * The expected user input format and placeholder.
     *
     * @remarks
     * Default is `hh:mm tt`
     *
     * @example
     * ```html
     * <igx-time-picker inputFormat="HH:mm"></igx-time-picker>
     * ```
     */
    @Input()
    public inputFormat: string = DateTimeUtil.DEFAULT_TIME_INPUT_FORMAT;

    /**
     * Gets/Sets the interaction mode - dialog or drop down.
     *
     * @example
     * ```html
     * <igx-time-picker mode="dialog"></igx-time-picker>
     * ```
     */
    @Input()
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;

    /**
     * The minimum value the picker will accept.
     *
     * @remarks
     * If a `string` value is passed in, it must be in ISO format.
     *
     * @example
     * ```html
     * <igx-time-picker [minValue]="18:00:00"></igx-time-picker>
     * ```
     */
    @Input()
    public set minValue(value: Date | string) {
        this._minValue = value;
        const date = this.parseToDate(value);
        if (date) {
            this._dateMinValue = new Date();
            this._dateMinValue.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
            this.minDropdownValue = this.setMinMaxDropdownValue('min', this._dateMinValue);
        }
        this.setSelectedValue(this._selectedDate);
        this._onValidatorChange();
    }

    public get minValue(): Date | string {
        return this._minValue;
    }

    /**
     * Gets if the dropdown/dialog is collapsed
     *
     * ```typescript
     * let isCollapsed = this.timePicker.collapsed;
     * ```
     */
    public get collapsed(): boolean {
        return this.toggleRef?.collapsed;
    }

    /**
     * The maximum value the picker will accept.
     *
     * @remarks
     * If a `string` value is passed in, it must be in ISO format.
     *
     * @example
     * ```html
     * <igx-time-picker [maxValue]="20:30:00"></igx-time-picker>
     * ```
     */
    @Input()
    public set maxValue(value: Date | string) {
        this._maxValue = value;
        const date = this.parseToDate(value);
        if (date) {
            this._dateMaxValue = new Date();
            this._dateMaxValue.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
            this.maxDropdownValue = this.setMinMaxDropdownValue('max', this._dateMaxValue);
        }
        this.setSelectedValue(this._selectedDate);
        this._onValidatorChange();
    }

    public get maxValue(): Date | string {
        return this._maxValue;
    }

    /**
     * An @Input property that determines the spin behavior. By default `spinLoop` is set to true.
     * The seconds, minutes and hour spinning will wrap around by default.
     * ```html
     * <igx-time-picker [spinLoop]="false"></igx-time-picker>
     * ```
     */
    @Input()
    public spinLoop = true;

    /**
     * Gets/Sets a custom formatter function on the selected or passed date.
     *
     * @example
     * ```html
     * <igx-time-picker [value]="date" [formatter]="formatter"></igx-time-picker>
     * ```
     */
    @Input()
    public formatter: (val: Date) => string;

    /**
     * Sets the orientation of the picker's header.
     *
     * @remarks
     * Available in dialog mode only. Default value is `horizontal`.
     *
     * ```html
     * <igx-time-picker [headerOrientation]="'vertical'"></igx-time-picker>
     * ```
     */
    @Input()
    public headerOrientation: PickerHeaderOrientation = PickerHeaderOrientation.Horizontal;

    /** @hidden @internal */
    @Input()
    public readOnly = false;

    /**
     * Emitted after a selection has been done.
     *
     * @example
     * ```html
     * <igx-time-picker (selected)="onSelection($event)"></igx-time-picker>
     * ```
     */
    @Output()
    public selected = new EventEmitter<Date>();

    /**
     * Emitted when the picker's value changes.
     *
     * @remarks
     * Used for `two-way` bindings.
     *
     * @example
     * ```html
     * <igx-time-picker [(value)]="date"></igx-time-picker>
     * ```
     */
    @Output()
    public valueChange = new EventEmitter<Date | string>();

    /**
     * Emitted when the user types/spins invalid time in the time-picker editor.
     *
     *  @example
     * ```html
     * <igx-time-picker (validationFailed)="onValidationFailed($event)"></igx-time-picker>
     * ```
     */
    @Output()
    public validationFailed = new EventEmitter<IgxTimePickerValidationFailedEventArgs>();

    /** @hidden */
    @ViewChild('hourList')
    public hourList: ElementRef;

    /** @hidden */
    @ViewChild('minuteList')
    public minuteList: ElementRef;

    /** @hidden */
    @ViewChild('secondsList')
    public secondsList: ElementRef;

    /** @hidden */
    @ViewChild('ampmList')
    public ampmList: ElementRef;

    /** @hidden @internal */
    @ContentChildren(IgxPickerClearComponent)
    public clearComponents: QueryList<IgxPickerClearComponent>;

    /** @hidden @internal */
    @ContentChild(IgxLabelDirective)
    public label: IgxLabelDirective;

    /** @hidden @internal */
    @ContentChild(IgxTimePickerActionsDirective)
    public timePickerActionsDirective: IgxTimePickerActionsDirective;

    @ViewChild(IgxInputDirective, { read: IgxInputDirective })
    private inputDirective: IgxInputDirective;

    @ViewChild(IgxInputGroupComponent)
    private _inputGroup: IgxInputGroupComponent;

    @ViewChild(IgxDateTimeEditorDirective, { static: true })
    private dateTimeEditor: IgxDateTimeEditorDirective;

    @ViewChild(IgxToggleDirective)
    private toggleRef: IgxToggleDirective;

    /** @hidden */
    public cleared = false;

    /** @hidden */
    public isNotEmpty = false;

    /** @hidden */
    public currentHour: number;

    /** @hidden */
    public currentMinutes: number;

    /** @hidden */
    public get showClearButton(): boolean {
        if (this.clearComponents.length) {
            return false;
        }
        if (DateTimeUtil.isValidDate(this.value)) {
            // TODO: Update w/ clear behavior
            return this.value.getHours() !== 0 || this.value.getMinutes() !== 0 || this.value.getSeconds() !== 0;
        }
        return !!this.dateTimeEditor.value;
    }

    /** @hidden */
    public get showHoursList(): boolean {
        return this.inputFormat.indexOf('h') !== - 1 || this.inputFormat.indexOf('H') !== - 1;
    }

    /** @hidden */
    public get showMinutesList(): boolean {
        return this.inputFormat.indexOf('m') !== - 1;
    }

    /** @hidden */
    public get showSecondsList(): boolean {
        return this.inputFormat.indexOf('s') !== - 1;
    }

    /** @hidden */
    public get showAmPmList(): boolean {
        return this.inputFormat.indexOf('t') !== - 1 || this.inputFormat.indexOf('a') !== - 1;
    }

    /** @hidden */
    public get isTwelveHourFormat(): boolean {
        return this.inputFormat.indexOf('h') !== - 1;
    }

    /** @hidden @internal */
    public get isDropdown(): boolean {
        return this.mode === PickerInteractionMode.DropDown;
    }

    /** @hidden @internal */
    public get isVertical(): boolean {
        return this.headerOrientation === PickerHeaderOrientation.Vertical;
    }

    /** @hidden @internal */
    public get selectedDate(): Date {
        return this._selectedDate;
    }

    /** @hidden @internal */
    public get minDateValue(): Date {
        if (!this._dateMinValue) {
            const minDate = new Date();
            minDate.setHours(0, 0, 0, 0);
            return minDate;
        }

        return this._dateMinValue;
    }

    /** @hidden @internal */
    public get maxDateValue(): Date {
        if (!this._dateMaxValue) {
            const maxDate = new Date();
            maxDate.setHours(23, 59, 59, 999);
            return maxDate;
        }

        return this._dateMaxValue;
    }

    private get required(): boolean {
        if (this._ngControl && this._ngControl.control && this._ngControl.control.validator) {
            // Run the validation with empty object to check if required is enabled.
            const error = this._ngControl.control.validator({} as AbstractControl);
            return !!(error && error.required);
        }

        return false;
    }

    private get dialogOverlaySettings(): OverlaySettings {
        return Object.assign({}, this._defaultDialogOverlaySettings, this.overlaySettings);
    }

    private get dropDownOverlaySettings(): OverlaySettings {
        return Object.assign({}, this._defaultDropDownOverlaySettings, this.overlaySettings);
    }

    /** @hidden @internal */
    public displayValue: PipeTransform = { transform: (date: Date) => this.formatter(date) };
    /** @hidden @internal */
    public minDropdownValue: Date;
    /** @hidden @internal */
    public maxDropdownValue: Date;
    /** @hidden @internal */
    public hourItems = [];
    /** @hidden @internal */
    public minuteItems = [];
    /** @hidden @internal */
    public secondsItems = [];
    /** @hidden @internal */
    public ampmItems = [];

    private _value: Date | string;
    private _dateValue: Date;
    private _dateMinValue: Date;
    private _dateMaxValue: Date;
    private _selectedDate: Date;
    private _resourceStrings = CurrentResourceStrings.TimePickerResStrings;
    private _okButtonLabel = null;
    private _cancelButtonLabel = null;
    private _itemsDelta: Pick<DatePartDeltas, 'hours' | 'minutes' | 'seconds'> = { hours: 1, minutes: 1, seconds: 1 };

    private _statusChanges$: Subscription;
    private _ngControl: NgControl = null;
    private _onChangeCallback: (_: Date | string) => void = noop;
    private _onTouchedCallback: () => void = noop;
    private _onValidatorChange: () => void = noop;

    private _defaultDialogOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: true,
        closeOnEscape: true,
        outlet: this.outlet
    };
    private _defaultDropDownOverlaySettings: OverlaySettings = {
        target: this.element.nativeElement,
        modal: false,
        closeOnOutsideClick: true,
        scrollStrategy: new AbsoluteScrollStrategy(),
        positionStrategy: new AutoPositionStrategy(),
        outlet: this.outlet
    };


    /**
     * The currently selected value / time from the drop-down/dialog
     *
     * @remarks
     * The current value is of type `Date`
     *
     * @example
     * ```typescript
     * const newValue: Date = new Date(2000, 2, 2, 10, 15, 15);
     * this.timePicker.value = newValue;
     * ```
     */
    public get value(): Date | string {
        return this._value;
    }

    /**
     * An accessor that allows you to set a time using the `value` input.
     * ```html
     * public date: Date = new Date(Date.now());
     *  //...
     * <igx-time-picker [value]="date" format="h:mm tt"></igx-time-picker>
     * ```
     */
    @Input()
    public set value(value: Date | string) {
        const oldValue = this._value;
        this._value = value;
        const date = this.parseToDate(value);
        if (date) {
            this._dateValue = new Date();
            this._dateValue.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
            this.setSelectedValue(this._dateValue);
        } else {
            this._dateValue = null;
            this.setSelectedValue(null);
        }
        if (this.dateTimeEditor) {
            this.dateTimeEditor.value = date;
        }
        this.emitValueChange(oldValue, this._value);
        this._onChangeCallback(this._value);
    }

    /**
     * An accessor that sets the resource strings.
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: ITimePickerResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    /**
     * An accessor that returns the resource strings.
     */
    public get resourceStrings(): ITimePickerResourceStrings {
        return this._resourceStrings;
    }

    /**
     * An @Input property that renders OK button with custom text. By default `okButtonLabel` is set to OK.
     * ```html
     * <igx-time-picker okButtonLabel='SET' [value]="date" format="h:mm tt"></igx-time-picker>
     * ```
     */
    @Input()
    public set okButtonLabel(value: string) {
        this._okButtonLabel = value;
    }

    /**
     * An accessor that returns the label of ok button.
     */
    public get okButtonLabel(): string {
        if (this._okButtonLabel === null) {
            return this.resourceStrings.igx_time_picker_ok;
        }
        return this._okButtonLabel;
    }

    /**
     * An @Input property that renders cancel button with custom text.
     * By default `cancelButtonLabel` is set to Cancel.
     * ```html
     * <igx-time-picker cancelButtonLabel='Exit' [value]="date" format="h:mm tt"></igx-time-picker>
     * ```
     */
    @Input()
    public set cancelButtonLabel(value: string) {
        this._cancelButtonLabel = value;
    }

    /**
     * An accessor that returns the label of cancel button.
     */
    public get cancelButtonLabel(): string {
        if (this._cancelButtonLabel === null) {
            return this.resourceStrings.igx_time_picker_cancel;
        }
        return this._cancelButtonLabel;
    }

    /**
     * Delta values used to increment or decrement each editor date part on spin actions and
     * to display time portions in the dropdown/dialog.
     * By default `itemsDelta` is set to `{hour: 1, minute: 1, second: 1}`
     * ```html
     * <igx-time-picker [itemsDelta]="{hour:3, minute:5, second:10}" id="time-picker"></igx-time-picker>
     * ```
     */
    @Input()
    public set itemsDelta(value: Pick<DatePartDeltas, 'hours' | 'minutes' | 'seconds'>) {
        Object.assign(this._itemsDelta, value);
    }

    public get itemsDelta(): Pick<DatePartDeltas, 'hours' | 'minutes' | 'seconds'> {
        return this._itemsDelta;
    }

    constructor(
        public element: ElementRef,
        @Inject(LOCALE_ID) protected _localeId: string,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions,
        @Optional() @Inject(IGX_INPUT_GROUP_TYPE) protected _inputGroupType: IgxInputGroupType,
        private _injector: Injector,
        private platform: PlatformUtil) {
        super(element, _localeId, _displayDensityOptions, _inputGroupType);
    }

    /** @hidden @internal */
    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case this.platform.KEYMAP.ARROW_UP:
                if (event.altKey && this.isDropdown) {
                    this.close();
                }
                break;
            case this.platform.KEYMAP.ARROW_DOWN:
                if (event.altKey && this.isDropdown) {
                    this.open();
                }
                break;
            case this.platform.KEYMAP.ESCAPE:
                this.cancelButtonClick();
                break;
            case this.platform.KEYMAP.SPACE:
                this.open();
                event.preventDefault();
                break;
        }
    }

    /** @hidden @internal */
    public getPartValue(value: Date, type: string): string {
        const inputDateParts = DateTimeUtil.parseDateTimeFormat(this.inputFormat);
        const part = inputDateParts.find(element => element.type === type);
        return DateTimeUtil.getPartValue(value, part, part.format.length);
    }

    /** @hidden @internal */
    public toISOString(value: Date): string {
        return value.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    }

    // #region ControlValueAccessor

    /** @hidden @internal */
    public writeValue(value: Date | string) {
        this._value = value;
        const date = this.parseToDate(value);
        if (date) {
            this._dateValue = new Date();
            this._dateValue.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
            this.setSelectedValue(this._dateValue);
        } else {
            this.setSelectedValue(null);
        }
        if (this.dateTimeEditor) {
            this.dateTimeEditor.value = date;
        }
    }

    /** @hidden @internal */
    public registerOnChange(fn: (_: Date | string) => void) {
        this._onChangeCallback = fn;
    }

    /** @hidden @internal */
    public registerOnTouched(fn: () => void) {
        this._onTouchedCallback = fn;
    }

    /** @hidden @internal */
    public registerOnValidatorChange(fn: any) {
        this._onValidatorChange = fn;
    }

    /** @hidden @internal */
    public validate(control: AbstractControl): ValidationErrors | null {
        if (!control.value) {
            return null;
        }
        // InvalidDate handling
        if (isDate(control.value) && !DateTimeUtil.isValidDate(control.value)) {
            return { value: true };
        }

        const errors = {};
        const value = DateTimeUtil.isValidDate(control.value) ? control.value : DateTimeUtil.parseIsoDate(control.value);
        Object.assign(errors, DateTimeUtil.validateMinMax(value, this.minValue, this.maxValue, true, false));
        return Object.keys(errors).length > 0 ? errors : null;
    }

    /** @hidden @internal */
    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
    //#endregion

    /** @hidden */
    public ngOnInit(): void {
        this._ngControl = this._injector.get<NgControl>(NgControl, null);
        this.minDropdownValue = this.setMinMaxDropdownValue('min', this.minDateValue);
        this.maxDropdownValue = this.setMinMaxDropdownValue('max', this.maxDateValue);
        this.setSelectedValue(this._dateValue);
    }

    /** @hidden */
    public ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.subscribeToDateEditorEvents();
        this.subscribeToToggleDirectiveEvents();

        this._defaultDropDownOverlaySettings.excludeFromOutsideClick = [this._inputGroup.element.nativeElement];

        fromEvent(this.inputDirective.nativeElement, 'blur')
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => {
                if (this.collapsed) {
                    this.updateValidityOnBlur();
                }
            });

        this.subToIconsClicked(this.clearComponents, () => this.clear());
        this.clearComponents.changes.pipe(takeUntil(this._destroy$))
            .subscribe(() => this.subToIconsClicked(this.clearComponents, () => this.clear()));

        if (this._ngControl) {
            this._statusChanges$ = this._ngControl.statusChanges.subscribe(this.onStatusChanged.bind(this));
        }
    }

    /** @hidden */
    public ngOnDestroy(): void {
        super.ngOnDestroy();
        if (this._statusChanges$) {
            this._statusChanges$.unsubscribe();
        }
    }

    /** @hidden */
    public getEditElement(): HTMLInputElement {
        return this.dateTimeEditor.nativeElement;
    }

    /**
     * Opens the picker's dialog UI.
     *
     * @param settings OverlaySettings - the overlay settings to use for positioning the drop down or dialog container according to
     * ```html
     * <igx-time-picker #picker [value]="date"></igx-time-picker>
     * <button (click)="picker.open()">Open Dialog</button>
     * ```
     */
    public open(settings?: OverlaySettings): void {
        if (this.disabled || !this.toggleRef.collapsed) {
            return;
        }

        this.setSelectedValue(this._dateValue);
        const overlaySettings = Object.assign({}, this.isDropdown
            ? this.dropDownOverlaySettings
            : this.dialogOverlaySettings
            , settings);

        this.toggleRef.open(overlaySettings);
    }

    /**
     * Closes the dropdown/dialog.
     * ```html
     * <igx-time-picker #timePicker></igx-time-picker>
     * ```
     * ```typescript
     * @ViewChild('timePicker', { read: IgxTimePickerComponent }) picker: IgxTimePickerComponent;
     * picker.close();
     * ```
     */
    public close(): void {
        this.toggleRef.close();
    }

    public toggle(settings?: OverlaySettings): void {
        if (this.toggleRef.collapsed) {
            this.open(settings);
        } else {
            this.close();
        }
    }

    /**
     * Clears the time picker value if it is a `string` or resets the time to `00:00:00` if the value is a Date object.
     *
     * @example
     * ```typescript
     * this.timePicker.clear();
     * ```
     */
    public clear(): void {
        if (this.disabled) {
            return;
        }

        if (!this.toggleRef.collapsed) {
            this.close();
        }

        if (DateTimeUtil.isValidDate(this.value)) {
            const oldValue = new Date(this.value);
            this.value.setHours(0, 0, 0);
            if (this.value.getTime() !== oldValue.getTime()) {
                this.emitValueChange(oldValue, this.value);
                this._dateValue.setHours(0, 0, 0);
                this.dateTimeEditor.value = new Date(this.value);
                this.setSelectedValue(this._dateValue);
            }
        } else {
            this.value = null;
        }
    }

    /**
     * Selects time from the igxTimePicker.
     *
     * @example
     * ```typescript
     * this.timePicker.select(date);
     *
     * @param date Date object containing the time to be selected.
     */
    public select(date: Date | string): void {
        this.value = date;
    }

    /**
     * Increment a specified `DatePart`.
     *
     * @param datePart The optional DatePart to increment. Defaults to Hour.
     * @param delta The optional delta to increment by. Overrides `itemsDelta`.
     * @example
     * ```typescript
     * this.timePicker.increment(DatePart.Hours);
     * ```
     */
    public increment(datePart?: DatePart, delta?: number): void {
        this.dateTimeEditor.increment(datePart, delta);
    }

    /**
     * Decrement a specified `DatePart`
     *
     * @param datePart The optional DatePart to decrement. Defaults to Hour.
     * @param delta The optional delta to decrement by. Overrides `itemsDelta`.
     * @example
     * ```typescript
     * this.timePicker.decrement(DatePart.Seconds);
     * ```
     */
    public decrement(datePart?: DatePart, delta?: number): void {
        this.dateTimeEditor.decrement(datePart, delta);
    }

    /** @hidden @internal */
    public cancelButtonClick(): void {
        this.setSelectedValue(this._dateValue);
        this.dateTimeEditor.value = this.parseToDate(this.value);
        this.close();
    }

    /** @hidden @internal */
    public okButtonClick(): void {
        this.updateValue(this._selectedDate);
        this.close();
    }

    /** @hidden @internal */
    public onItemClick(item: string, dateType: string): void {
        let date = new Date(this._selectedDate);
        switch (dateType) {
            case 'hourList':
                let ampm: string;
                const selectedHour = parseInt(item, 10);
                let hours = selectedHour;

                if (this.showAmPmList) {
                    ampm = this.getPartValue(date, 'ampm');
                    hours = this.toTwentyFourHourFormat(hours, ampm);
                    const minHours = this.minDropdownValue?.getHours() || 0;
                    const maxHours = this.maxDropdownValue?.getHours() || 24;
                    if (hours < minHours || hours > maxHours) {
                        hours = hours < 12 ? hours + 12 : hours - 12;
                    }
                }

                date.setHours(hours);
                date = this.validateDropdownValue(date);

                if (this.valueInRange(date, this.minDropdownValue, this.maxDropdownValue)) {
                    this.setSelectedValue(date);
                }
                break;
            case 'minuteList': {
                const minutes = parseInt(item, 10);
                date.setMinutes(minutes);
                date = this.validateDropdownValue(date);
                this.setSelectedValue(date);
                break;
            }
            case 'secondsList': {
                const seconds = parseInt(item, 10);
                date.setSeconds(seconds);
                if (this.valueInRange(date, this.minDropdownValue, this.maxDropdownValue)) {
                    this.setSelectedValue(date);
                }
                break;
            }
            case 'ampmList': {
                let hour = this._selectedDate.getHours();
                hour = item === 'AM' ? hour - 12 : hour + 12;
                date.setHours(hour);
                date = this.validateDropdownValue(date, true);
                this.setSelectedValue(date);
                break;
            }
        }
        this.updateEditorValue();
    }

    /** @hidden @internal */
    public nextHour(delta: number) {
        delta = delta > 0 ? 1 : -1;
        const previousDate = new Date(this._selectedDate);
        const minHours = this.minDropdownValue?.getHours();
        const maxHours = this.maxDropdownValue?.getHours();
        const previousHours = previousDate.getHours();
        let hours = previousHours + delta * this.itemsDelta.hours;
        if ((previousHours === maxHours && delta > 0) || (previousHours === minHours && delta < 0)) {
            hours = !this.spinLoop ? previousHours : delta > 0 ? minHours : maxHours;
        }

        this._selectedDate.setHours(hours);
        this._selectedDate = this.validateDropdownValue(this._selectedDate);
        this._selectedDate = new Date(this._selectedDate);
        this.updateEditorValue();
    }

    /** @hidden @internal */
    public nextMinute(delta: number) {
        delta = delta > 0 ? 1 : -1;
        const minHours = this.minDropdownValue.getHours();
        const maxHours = this.maxDropdownValue.getHours();
        const hours = this._selectedDate.getHours();
        let minutes = this._selectedDate.getMinutes();
        const minMinutes = hours === minHours ? this.minDropdownValue.getMinutes() : 0;
        const maxMinutes = hours === maxHours ? this.maxDropdownValue.getMinutes() :
            60 % this.itemsDelta.minutes > 0 ? 60 - (60 % this.itemsDelta.minutes) :
                60 - this.itemsDelta.minutes;

        if ((delta < 0 && minutes === minMinutes) || (delta > 0 && minutes === maxMinutes)) {
            minutes = this.spinLoop && minutes === minMinutes ? maxMinutes : this.spinLoop && minutes === maxMinutes ? minMinutes : minutes;
        } else {
            minutes = minutes + delta * this.itemsDelta.minutes;
        }

        this._selectedDate.setMinutes(minutes);
        this._selectedDate = this.validateDropdownValue(this._selectedDate);
        this._selectedDate = new Date(this._selectedDate);
        this.updateEditorValue();
    }

    /** @hidden @internal */
    public nextSeconds(delta: number) {
        delta = delta > 0 ? 1 : -1;
        const minHours = this.minDropdownValue.getHours();
        const maxHours = this.maxDropdownValue.getHours();
        const hours = this._selectedDate.getHours();
        const minutes = this._selectedDate.getMinutes();
        const minMinutes = this.minDropdownValue.getMinutes();
        const maxMinutes = this.maxDropdownValue.getMinutes();
        let seconds = this._selectedDate.getSeconds();
        const minSeconds = (hours === minHours && minutes === minMinutes) ? this.minDropdownValue.getSeconds() : 0;
        const maxSeconds = (hours === maxHours && minutes === maxMinutes) ? this.maxDropdownValue.getSeconds() :
            60 % this.itemsDelta.seconds > 0 ? 60 - (60 % this.itemsDelta.seconds) :
                60 - this.itemsDelta.seconds;

        if ((delta < 0 && seconds === minSeconds) || (delta > 0 && seconds === maxSeconds)) {
            seconds = this.spinLoop && seconds === minSeconds ? maxSeconds : this.spinLoop && seconds === maxSeconds ? minSeconds : seconds;
        } else {
            seconds = seconds + delta * this.itemsDelta.seconds;
        }

        this._selectedDate.setSeconds(seconds);
        this._selectedDate = this.validateDropdownValue(this._selectedDate);
        this._selectedDate = new Date(this._selectedDate);
        this.updateEditorValue();
    }

    /** @hidden @internal */
    public nextAmPm(delta?: number) {
        const ampm = this.getPartValue(this._selectedDate, 'ampm');
        if (!delta || (ampm === 'AM' && delta > 0) || (ampm === 'PM' && delta < 0)) {
            let hours = this._selectedDate.getHours();
            const sign = hours < 12 ? 1 : -1;
            hours = hours + sign * 12;
            this._selectedDate.setHours(hours);
            this._selectedDate = this.validateDropdownValue(this._selectedDate, true);
            this._selectedDate = new Date(this._selectedDate);
            this.updateEditorValue();
        }
    }

    /** @hidden @internal */
    public setSelectedValue(value: Date) {
        this._selectedDate = value ? new Date(value) : null;
        if (!DateTimeUtil.isValidDate(this._selectedDate)) {
            this._selectedDate = new Date(this.minDropdownValue);
            return;
        }
        if (this.minValue && DateTimeUtil.lessThanMinValue(this._selectedDate, this.minDropdownValue, true, false)) {
            this._selectedDate = new Date(this.minDropdownValue);
            return;
        }
        if (this.maxValue && DateTimeUtil.greaterThanMaxValue(this._selectedDate, this.maxDropdownValue, true, false)) {
            this._selectedDate = new Date(this.maxDropdownValue);
            return;
        }

        if (this._selectedDate.getHours() % this.itemsDelta.hours > 0) {
            this._selectedDate.setHours(
                this._selectedDate.getHours() + this.itemsDelta.hours - this._selectedDate.getHours() % this.itemsDelta.hours,
                0,
                0
            );
        }

        if (this._selectedDate.getMinutes() % this.itemsDelta.minutes > 0) {
            this._selectedDate.setHours(
                this._selectedDate.getHours(),
                this._selectedDate.getMinutes() + this.itemsDelta.minutes - this._selectedDate.getMinutes() % this.itemsDelta.minutes,
                0
            );
        }

        if (this._selectedDate.getSeconds() % this.itemsDelta.seconds > 0) {
            this._selectedDate.setSeconds(
                this._selectedDate.getSeconds() + this.itemsDelta.seconds - this._selectedDate.getSeconds() % this.itemsDelta.seconds
            );
        }
    }

    protected onStatusChanged() {
        if ((this._ngControl.control.touched || this._ngControl.control.dirty) &&
            (this._ngControl.control.validator || this._ngControl.control.asyncValidator)) {
            if (this._inputGroup.isFocused) {
                this.inputDirective.valid = this._ngControl.valid ? IgxInputState.VALID : IgxInputState.INVALID;
            } else {
                this.inputDirective.valid = this._ngControl.valid ? IgxInputState.INITIAL : IgxInputState.INVALID;
            }
        } else {
            // B.P. 18 May 2021: IgxDatePicker does not reset its state upon resetForm #9526
            this.inputDirective.valid = IgxInputState.INITIAL;
        }

        if (this._inputGroup && this._inputGroup.isRequired !== this.required) {
            this._inputGroup.isRequired = this.required;
        }
    }

    private setMinMaxDropdownValue(type: string, time: Date): Date {
        let delta: number;

        const sign = type === 'min' ? 1 : -1;

        const hours = time.getHours();
        let minutes = time.getMinutes();
        let seconds = time.getSeconds();

        if (this.showHoursList && hours % this.itemsDelta.hours > 0) {
            delta = type === 'min' ? this.itemsDelta.hours - hours % this.itemsDelta.hours
                : hours % this.itemsDelta.hours;
            minutes = type === 'min' ? 0
                : 60 % this.itemsDelta.minutes > 0 ? 60 - 60 % this.itemsDelta.minutes
                    : 60 - this.itemsDelta.minutes;
            seconds = type === 'min' ? 0
                : 60 % this.itemsDelta.seconds > 0 ? 60 - 60 % this.itemsDelta.seconds
                    : 60 - this.itemsDelta.seconds;
            time.setHours(hours + sign * delta, minutes, seconds);
        } else if (this.showMinutesList && minutes % this.itemsDelta.minutes > 0) {
            delta = type === 'min' ? this.itemsDelta.minutes - minutes % this.itemsDelta.minutes
                : minutes % this.itemsDelta.minutes;
            seconds = type === 'min' ? 0
                : 60 % this.itemsDelta.seconds > 0 ? 60 - 60 % this.itemsDelta.seconds
                    : 60 - this.itemsDelta.seconds;
            time.setHours(hours, minutes + sign * delta, seconds);
        } else if (this.showSecondsList && seconds % this.itemsDelta.seconds > 0) {
            delta = type === 'min' ? this.itemsDelta.seconds - seconds % this.itemsDelta.seconds
                : seconds % this.itemsDelta.seconds;
            time.setHours(hours, minutes, seconds + sign * delta);
        }

        return time;
    }

    private initializeContainer() {
        requestAnimationFrame(() => {
            if (this.hourList) {
                this.hourList.nativeElement.focus();
            } else if (this.minuteList) {
                this.minuteList.nativeElement.focus();
            } else if (this.secondsList) {
                this.secondsList.nativeElement.focus();
            }
        });
    }

    private validateDropdownValue(date: Date, isAmPm = false): Date {
        if (date > this.maxDropdownValue) {
            if (isAmPm && date.getHours() !== this.maxDropdownValue.getHours()) {
                date.setHours(12);
            } else {
                date = new Date(this.maxDropdownValue);
            }
        }

        if (date < this.minDropdownValue) {
            date = new Date(this.minDropdownValue);
        }

        return date;
    }

    private emitValueChange(oldValue: Date | string, newValue: Date | string) {
        if (!isEqual(oldValue, newValue)) {
            this.valueChange.emit(newValue);
        }
    }

    private emitValidationFailedEvent(previousValue: Date | string) {
        const args: IgxTimePickerValidationFailedEventArgs = {
            owner: this,
            previousValue,
            currentValue: this.value
        };
        this.validationFailed.emit(args);
    }

    private updateValidityOnBlur() {
        this._onTouchedCallback();
        if (this._ngControl) {
            if (!this._ngControl.valid) {
                this.inputDirective.valid = IgxInputState.INVALID;
            } else {
                this.inputDirective.valid = IgxInputState.INITIAL;
            }
        }
    }

    private valueInRange(value: Date, minValue: Date, maxValue: Date): boolean {
        if (minValue && DateTimeUtil.lessThanMinValue(value, minValue, true, false)) {
            return false;
        }
        if (maxValue && DateTimeUtil.greaterThanMaxValue(value, maxValue, true, false)) {
            return false;
        }

        return true;
    }

    private parseToDate(value: Date | string): Date | null {
        return DateTimeUtil.isValidDate(value) ? value : DateTimeUtil.parseIsoDate(value);
    }

    private toTwentyFourHourFormat(hour: number, ampm: string): number {
        if (ampm === 'PM' && hour < 12) {
            hour += 12;
        } else if (ampm === 'AM' && hour === 12) {
            hour = 0;
        }

        return hour;
    }

    private updateValue(newValue: Date | null): void {
        if (!this.value) {
            this.value = newValue ? new Date(newValue) : newValue;
        } else if (isDate(this.value)) {
            const date = new Date(this.value);
            date.setHours(newValue?.getHours() || 0, newValue?.getMinutes() || 0, newValue?.getSeconds() || 0);
            this.value = date;
        } else {
            this.value = newValue ? this.toISOString(newValue) : newValue;
        }
    }

    private updateEditorValue(): void {
        const date = this.dateTimeEditor.value ? new Date(this.dateTimeEditor.value) : new Date();
        date.setHours(this._selectedDate.getHours(), this._selectedDate.getMinutes(), this._selectedDate.getSeconds());
        this.dateTimeEditor.value = date;
    }

    private subscribeToDateEditorEvents(): void {
        this.dateTimeEditor.valueChange.pipe(
            // internal date editor directive is only used w/ Date object values:
            takeUntil(this._destroy$)).subscribe((date: Date | null) => {
                this.updateValue(date);
            });

        this.dateTimeEditor.validationFailed.pipe(
            takeUntil(this._destroy$)).subscribe((event) => {
                this.emitValidationFailedEvent(event.oldValue);
            });
    }

    private subscribeToToggleDirectiveEvents(): void {
        if (this.toggleRef) {
            if (this._inputGroup) {
                this.toggleRef.element.style.width = this._inputGroup.element.nativeElement.getBoundingClientRect().width + 'px';
            }

            const args: IBaseEventArgs = {
                owner: this
            };

            this.toggleRef.opening.pipe(takeUntil(this._destroy$)).subscribe((event) => {
                this.opening.emit(event);
                if (event.cancel) {
                    return;
                }
                this.initializeContainer();
            });

            this.toggleRef.opened.pipe(takeUntil(this._destroy$)).subscribe(() => {
                this.opened.emit(args);
            });

            this.toggleRef.closed.pipe(takeUntil(this._destroy$)).subscribe(() => {
                this.closed.emit(args);
            });

            this.toggleRef.closing.pipe(takeUntil(this._destroy$)).subscribe((event) => {
                this.closing.emit(event);
                if (event.cancel) {
                    return;
                }
                const value = this.parseToDate(this.value);
                if ((this.dateTimeEditor.value as Date)?.getTime() !== value?.getTime()) {
                    this.updateValue(this._selectedDate);
                }
                // Do not focus the input if clicking outside in dropdown mode
                const input = this.getEditElement();
                if (input && !(event.event && this.isDropdown)) {
                    input.focus();
                } else {
                    this.updateValidityOnBlur();
                }
            });
        }
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxTimePickerComponent,
        IgxItemListDirective,
        IgxTimeItemDirective,
        IgxTimePickerTemplateDirective,
        IgxTimePickerActionsDirective,
        TimeFormatPipe,
        TimeItemPipe
    ],
    exports: [
        IgxTimePickerComponent,
        IgxTimePickerTemplateDirective,
        IgxTimePickerActionsDirective,
        IgxPickersCommonModule,
        IgxInputGroupModule
    ],
    imports: [
        CommonModule,
        IgxDateTimeEditorModule,
        IgxInputGroupModule,
        IgxIconModule,
        IgxButtonModule,
        IgxMaskModule,
        IgxToggleModule,
        IgxTextSelectionModule
    ],
    providers: []
})
export class IgxTimePickerModule { }
