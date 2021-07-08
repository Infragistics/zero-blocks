import {
    AfterViewInit, ChangeDetectorRef, Component, ContentChild, ContentChildren, ElementRef,
    EventEmitter, HostBinding, HostListener, Inject, Injector, Input, LOCALE_ID,
    NgModuleRef,
    OnChanges, OnDestroy, OnInit, Optional, Output, QueryList,
    SimpleChanges, TemplateRef, ViewChild
} from '@angular/core';
import {
    AbstractControl, ControlValueAccessor, NgControl,
    NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator
} from '@angular/forms';
import { fromEvent, merge, MonoTypeOperatorFunction, noop, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { fadeIn, fadeOut } from '../animations/fade';
import { CalendarSelection, IgxCalendarComponent, WEEKDAYS } from '../calendar/public_api';
import { DateRangeType } from '../core/dates';
import { DisplayDensityToken, IDisplayDensityOptions } from '../core/density';
import { CurrentResourceStrings } from '../core/i18n/resources';
import { IDateRangePickerResourceStrings } from '../core/i18n/date-range-picker-resources';
import { DateTimeUtil } from '../date-common/util/date-time.util';
import { IBaseCancelableBrowserEventArgs, isDate, parseDate, PlatformUtil } from '../core/utils';
import { IgxCalendarContainerComponent } from '../date-common/calendar-container/calendar-container.component';
import { IgxPickerActionsDirective } from '../date-common/picker-icons.common';
import { PickerBaseDirective } from '../date-common/picker-base.directive';
import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';
import {
    IgxInputDirective, IgxInputGroupComponent, IgxInputGroupType, IgxInputState,
    IgxLabelDirective, IGX_INPUT_GROUP_TYPE
} from '../input-group/public_api';
import {
    AutoPositionStrategy, IgxOverlayService, OverlayCancelableEventArgs, OverlayEventArgs,
    OverlaySettings, PositionSettings
} from '../services/public_api';
import {
    DateRange, IgxDateRangeEndComponent, IgxDateRangeInputsBaseComponent,
    IgxDateRangeSeparatorDirective, IgxDateRangeStartComponent
} from './date-range-picker-inputs.common';

const SingleInputDatesConcatenationString = ' - ';

/**
 * Provides the ability to select a range of dates from a calendar UI or editable inputs.
 *
 * @igxModule IgxDateRangeModule
 *
 * @igxTheme igx-input-group-theme, igx-calendar-theme, igx-date-range-picker-theme
 *
 * @igxKeywords date, range, date range, date picker
 *
 * @igxGroup scheduling
 *
 * @remarks
 * It displays the range selection in a single or two input fields.
 * The default template displays a single *readonly* input field
 * while projecting `igx-date-range-start` and `igx-date-range-end`
 * displays two *editable* input fields.
 *
 * @example
 * ```html
 * <igx-date-range-picker mode="dropdown"></igx-date-range-picker>
 * ```
 */
@Component({
    selector: 'igx-date-range-picker',
    templateUrl: './date-range-picker.component.html',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: IgxDateRangePickerComponent, multi: true },
        { provide: NG_VALIDATORS, useExisting: IgxDateRangePickerComponent, multi: true }
    ]
})
export class IgxDateRangePickerComponent extends PickerBaseDirective
    implements OnChanges, OnInit, AfterViewInit, OnDestroy, ControlValueAccessor, Validator {
    /**
     * The number of displayed month views.
     *
     * @remarks
     * Default is `2`.
     *
     * @example
     * ```html
     * <igx-date-range-picker [displayMonthsCount]="3"></igx-date-range-picker>
     * ```
     */
    @Input()
    public displayMonthsCount = 2;

    /**
     * Gets/Sets whether dates that are not part of the current month will be displayed.
     *
     * @remarks
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-date-range-picker [hideOutsideDays]="true"></igx-date-range-picker>
     * ```
     */
    @Input()
    public hideOutsideDays: boolean;

    /**
     * The start day of the week.
     *
     * @remarks
     * Can be assigned to a numeric value or to `WEEKDAYS` enum value.
     *
     * @example
     * ```html
     * <igx-date-range-picker [weekStart]="1"></igx-date-range-picker>
     * ```
     */
    @Input()
    public weekStart = WEEKDAYS.SUNDAY;

    /**
     * Locale settings used for value formatting and calendar.
     *
     * @remarks
     * Uses Angular's `LOCALE_ID` by default. Affects both input mask and display format if those are not set.
     * If a `locale` is set, it must be registered via `registerLocaleData`.
     * Please refer to https://angular.io/guide/i18n#i18n-pipes.
     * If it is not registered, `Intl` will be used for formatting.
     *
     * @example
     * ```html
     * <igx-date-range-picker locale="jp"></igx-date-range-picker>
     * ```
     */
    @Input()
    public locale: string;

    /**
     * A custom formatter function, applied on the selected or passed in date.
     *
     * @example
     * ```typescript
     * private dayFormatter = new Intl.DateTimeFormat("en", { weekday: "long" });
     * private monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });
     *
     * public formatter(date: Date): string {
     *  return `${this.dayFormatter.format(date)} - ${this.monthFormatter.format(date)} - ${date.getFullYear()}`;
     * }
     * ```
     * ```html
     * <igx-date-range-picker [formatter]="formatter"></igx-date-range-picker>
     * ```
     */
    @Input()
    public formatter: (val: DateRange) => string;

    /**
     * The default text of the calendar dialog `done` button.
     *
     * @remarks
     * Default value is `Done`.
     * An @Input property that renders Done button with custom text. By default `doneButtonText` is set to Done.
     * The button will only show up in `dialog` mode.
     *
     * @example
     * ```html
     * <igx-date-range-picker doneButtonText="完了"></igx-date-range-picker>
     * ```
     */
    @Input()
    public set doneButtonText(value: string) {
        this._doneButtonText = value;
    }

    public get doneButtonText(): string {
        if (this._doneButtonText === null) {
            return this.resourceStrings.igx_date_range_picker_done_button;
        }
        return this._doneButtonText;
    }
    /**
     * Custom overlay settings that should be used to display the calendar.
     *
     * @example
     * ```html
     * <igx-date-range-picker [overlaySettings]="customOverlaySettings"></igx-date-range-picker>
     * ```
     */
    @Input()
    public overlaySettings: OverlaySettings;

    /**
     * The format used when editable inputs are not focused.
     *
     * @remarks
     * Uses Angular's DatePipe.
     *
     * @example
     * ```html
     * <igx-date-range-picker displayFormat="EE/M/yy"></igx-date-range-picker>
     * ```
     *
     */
    @Input()
    public displayFormat: string;

    /**
     * The expected user input format and placeholder.
     *
     * @remarks
     * Default is `"'MM/dd/yyyy'"`
     *
     * @example
     * ```html
     * <igx-date-range-picker inputFormat="dd/MM/yy"></igx-date-range-picker>
     * ```
     */
    @Input()
    public inputFormat: string;

    /**
     * The minimum value in a valid range.
     *
     * @example
     * <igx-date-range-picker [minValue]="minDate"></igx-date-range-picker>
     */
    @Input()
    public set minValue(value: Date | string) {
        this._minValue = value;
        this.onValidatorChange();
    }

    public get minValue(): Date | string {
        return this._minValue;
    }

    /**
     * The maximum value in a valid range.
     *
     * @example
     * <igx-date-range-picker [maxValue]="maxDate"></igx-date-range-picker>
     */
    @Input()
    public set maxValue(value: Date | string) {
        this._maxValue = value;
        this.onValidatorChange();
    }

    public get maxValue(): Date | string {
        return this._maxValue;
    }

    /**
     * An accessor that sets the resource strings.
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: IDateRangePickerResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    /**
     * An accessor that returns the resource strings.
     */
    public get resourceStrings(): IDateRangePickerResourceStrings {
        return this._resourceStrings;
    }

    /**
     * Sets the `placeholder` for single-input `IgxDateRangePickerComponent`.
     *
     *   @example
     * ```html
     * <igx-date-range-picker [placeholder]="'Choose your dates'"></igx-date-range-picker>
     * ```
     */
    @Input()
    public placeholder = '';

    /**
     * Gets/Sets the container used for the popup element.
     *
     * @remarks
     *  `outlet` is an instance of `IgxOverlayOutletDirective` or an `ElementRef`.
     * @example
     * ```html
     * <div igxOverlayOutlet #outlet="overlay-outlet"></div>
     * //..
     * <igx-date-range-picker [outlet]="outlet"></igx-date-range-picker>
     * //..
     * ```
     */
    @Input()
    public outlet: IgxOverlayOutletDirective | ElementRef<any>;

    /**
     * Emitted when the picker's value changes. Used for two-way binding.
     *
     * @example
     * ```html
     * <igx-date-range-picker [(value)]="date"></igx-date-range-picker>
     * ```
     */
    @Output()
    public valueChange = new EventEmitter<DateRange>();

    /** @hidden @internal */
    @HostBinding('class.igx-date-range-picker')
    public cssClass = 'igx-date-range-picker';

    /** @hidden @internal */
    @ViewChild(IgxInputGroupComponent)
    public inputGroup: IgxInputGroupComponent;

    /** @hidden @internal */
    @ViewChild(IgxInputDirective)
    public inputDirective: IgxInputDirective;

    /** @hidden @internal */
    @ContentChildren(IgxDateRangeInputsBaseComponent)
    public projectedInputs: QueryList<IgxDateRangeInputsBaseComponent>;

    @ContentChild(IgxLabelDirective)
    public label: IgxLabelDirective;

    @ContentChild(IgxPickerActionsDirective)
    public pickerActions: IgxPickerActionsDirective;

    /** @hidden @internal */
    @ContentChild(IgxDateRangeSeparatorDirective, { read: TemplateRef })
    public dateSeparatorTemplate: TemplateRef<any>;

    /** @hidden @internal */
    public get dateSeparator(): string {
        if (this._dateSeparator === null) {
            return this.resourceStrings.igx_date_range_picker_date_separator;
        }
        return this._dateSeparator;
    }

    /** @hidden @internal */
    public get appliedFormat(): string {
        return DateTimeUtil.getLocaleDateFormat(this.locale, this.displayFormat)
            || DateTimeUtil.DEFAULT_INPUT_FORMAT;
    }

    /** @hidden @internal */
    public get singleInputFormat(): string {
        if (this.placeholder !== '') {
            return this.placeholder;
        }

        const format = this.appliedFormat;
        return `${format}${SingleInputDatesConcatenationString}${format}`;
    }

    /**
     * Gets calendar state.
     *
     * ```typescript
     * let state = this.dateRange.collapsed;
     * ```
     */
    public get collapsed(): boolean {
        return this._collapsed;
    }

    /**
     * The currently selected value / range from the calendar
     *
     * @remarks
     * The current value is of type `DateRange`
     *
     * @example
     * ```typescript
     * const newValue: DateRange = { start: new Date("2/2/2012"), end: new Date("3/3/2013")};
     * this.dateRangePicker.value = newValue;
     * ```
     */
    public get value(): DateRange | null {
        return this._value;
    }

    @Input()
    public set value(value: DateRange | null) {
        this.updateValue(value);
        this.onChangeCallback(value);
        this.valueChange.emit(value);
    }

    /** @hidden @internal */
    public get hasProjectedInputs(): boolean {
        return this.projectedInputs?.length > 0;
    }

    /** @hidden @internal */
    public get separatorClass(): string {
        return this.getComponentDensityClass('igx-date-range-picker__label');
    }

    private get calendar(): IgxCalendarComponent {
        return this._calendar;
    }

    private get dropdownOverlaySettings(): OverlaySettings {
        return Object.assign({}, this._dropDownOverlaySettings, this.overlaySettings);
    }

    private get dialogOverlaySettings(): OverlaySettings {
        return Object.assign({}, this._dialogOverlaySettings, this.overlaySettings);
    }

    private get required(): boolean {
        if (this._ngControl && this._ngControl.control && this._ngControl.control.validator) {
            const error = this._ngControl.control.validator({} as AbstractControl);
            return (error && error.required) ? true : false;
        }

        return false;
    }

    private _resourceStrings = CurrentResourceStrings.DateRangePickerResStrings;
    private _doneButtonText = null;
    private _dateSeparator = null;
    private _value: DateRange | null;
    private _overlayId: string;
    private _ngControl: NgControl;
    private _statusChanges$: Subscription;
    private _calendar: IgxCalendarComponent;
    private _positionSettings: PositionSettings;
    private _focusedInput: IgxDateRangeInputsBaseComponent;
    private _overlaySubFilter:
        [MonoTypeOperatorFunction<OverlayEventArgs>, MonoTypeOperatorFunction<OverlayEventArgs | OverlayCancelableEventArgs>] = [
            filter(x => x.id === this._overlayId),
            takeUntil(merge(this._destroy$, this.closed))
        ];
    private _dialogOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: true,
        closeOnEscape: true
    };
    private _dropDownOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        closeOnEscape: true
    };
    private onChangeCallback: (dateRange: DateRange) => void = noop;
    private onTouchCallback: () => void = noop;
    private onValidatorChange: () => void = noop;

    constructor(public element: ElementRef,
        @Inject(LOCALE_ID) protected _localeId: any,
        protected platform: PlatformUtil,
        private _injector: Injector,
        private _moduleRef: NgModuleRef<any>,
        private _cdr: ChangeDetectorRef,
        @Inject(IgxOverlayService) private _overlayService: IgxOverlayService,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions?: IDisplayDensityOptions,
        @Optional() @Inject(IGX_INPUT_GROUP_TYPE) protected _inputGroupType?: IgxInputGroupType) {
        super(element, _localeId, _displayDensityOptions, _inputGroupType);
    }

    /** @hidden @internal */
    @HostListener('keydown', ['$event'])
    /** @hidden @internal */
    public onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case this.platform.KEYMAP.ARROW_UP:
                if (event.altKey) {
                    this.close();
                }
                break;
            case this.platform.KEYMAP.ARROW_DOWN:
                if (event.altKey) {
                    this.open();
                }
                break;
        }
    }

    /**
     * Opens the date range picker's dropdown or dialog.
     *
     * @example
     * ```html
     * <igx-date-range-picker #dateRange></igx-date-range-picker>
     *
     * <button (click)="dateRange.open()">Open Dialog</button
     * ```
     */
    public open(overlaySettings?: OverlaySettings): void {
        if (!this.collapsed || this.disabled) {
            return;
        }

        const settings = Object.assign({}, this.isDropdown
            ? this.dropdownOverlaySettings
            : this.dialogOverlaySettings
            , overlaySettings);

        this._overlayId = this._overlayService
            .attach(IgxCalendarContainerComponent, settings, this._moduleRef);
        this.subscribeToOverlayEvents();
        this._overlayService.show(this._overlayId);
    }

    /**
     * Closes the date range picker's dropdown or dialog.
     *
     * @example
     * ```html
     * <igx-date-range-picker #dateRange></igx-date-range-picker>
     *
     * <button (click)="dateRange.close()">Close Dialog</button>
     * ```
     */
    public close(): void {
        if (!this.collapsed) {
            this._overlayService.hide(this._overlayId);
        }
    }

    /**
     * Toggles the date range picker's dropdown or dialog
     *
     * @example
     * ```html
     * <igx-date-range-picker #dateRange></igx-date-range-picker>
     *
     * <button (click)="dateRange.toggle()">Toggle Dialog</button>
     * ```
     */
    public toggle(overlaySettings?: OverlaySettings): void {
        if (!this.collapsed) {
            this.close();
        } else {
            this.open(overlaySettings);
        }
    }

    /**
     * Selects a range of dates. If no `endDate` is passed, range is 1 day (only `startDate`)
     *
     * @example
     * ```typescript
     * public selectFiveDayRange() {
     *  const today = new Date();
     *  const inFiveDays = new Date(new Date().setDate(today.getDate() + 5));
     *  this.dateRange.select(today, inFiveDays);
     * }
     * ```
     */
    public select(startDate: Date, endDate?: Date): void {
        endDate = endDate ?? startDate;
        const dateRange = [startDate, endDate];
        this.handleSelection(dateRange);
    }

    /** @hidden @internal */
    public writeValue(value: DateRange): void {
        this.updateValue(value);
    }

    /** @hidden @internal */
    public registerOnChange(fn: any): void {
        this.onChangeCallback = fn;
    }

    /** @hidden @internal */
    public registerOnTouched(fn: any): void {
        this.onTouchCallback = fn;
    }

    /** @hidden @internal */
    public validate(control: AbstractControl): ValidationErrors | null {
        const value: DateRange = control.value;
        const errors = {};
        if (value) {
            if (this.hasProjectedInputs) {
                const startInput = this.projectedInputs.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
                const endInput = this.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
                if (!startInput.dateTimeEditor.value) {
                    Object.assign(errors, { startValue: true });
                }
                if (!endInput.dateTimeEditor.value) {
                    Object.assign(errors, { endValue: true });
                }
            }

            const min = parseDate(this.minValue);
            const max = parseDate(this.maxValue);
            const start = parseDate(value.start);
            const end = parseDate(value.end);
            if ((min && start && DateTimeUtil.lessThanMinValue(start, min, false))
                || (min && end && DateTimeUtil.lessThanMinValue(end, min, false))) {
                Object.assign(errors, { minValue: true });
            }
            if ((max && start && DateTimeUtil.greaterThanMaxValue(start, max, false))
                || (max && end && DateTimeUtil.greaterThanMaxValue(end, max, false))) {
                Object.assign(errors, { maxValue: true });
            }
        }

        return Object.keys(errors).length > 0 ? errors : null;
    }

    /** @hidden @internal */
    public registerOnValidatorChange?(fn: any): void {
        this.onValidatorChange = fn;
    }

    /** @hidden @internal */
    public setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /** @hidden */
    public ngOnInit(): void {
        this._ngControl = this._injector.get<NgControl>(NgControl, null);
    }

    /** @hidden */
    public ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.subscribeToDateEditorEvents();
        this.configPositionStrategy();
        this.configOverlaySettings();
        this.cacheFocusedInput();
        this.attachOnTouched();

        this.setRequiredToInputs();

        if (this._ngControl) {
            this._statusChanges$ = this._ngControl.statusChanges.subscribe(this.onStatusChanged.bind(this));
        }

        // delay invocations until the current change detection cycle has completed
        Promise.resolve().then(() => {
            this.updateDisabledState();
            this.initialSetValue();
            this.updateInputs();
            // B.P. 07 July 2021 - IgxDateRangePicker not showing initial disabled state with ChangeDetectionStrategy.OnPush #9776
            /**
             * if disabled is placed on the range picker element and there are projected inputs
             * run change detection since igxInput will initially set the projected inputs' disabled to false
             */
            if (this.hasProjectedInputs && this.disabled) {
                this._cdr.markForCheck();
            }
        });
        this.updateDisplayFormat();
        this.updateInputFormat();
    }

    /** @hidden @internal */
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['displayFormat'] && this.hasProjectedInputs) {
            this.updateDisplayFormat();
        }
        if (changes['inputFormat'] && this.hasProjectedInputs) {
            this.updateInputFormat();
        }
        if (changes['disabled']) {
            this.updateDisabledState();
        }
    }

    /** @hidden @internal */
    public ngOnDestroy(): void {
        super.ngOnDestroy();
        if (this._statusChanges$) {
            this._statusChanges$.unsubscribe();
        }
        if (this._overlayId) {
            this._overlayService.detach(this._overlayId);
        }
    }

    /** @hidden @internal */
    public getEditElement() {
        return this.inputDirective.nativeElement;
    }

    protected onStatusChanged = () => {
        if (this.inputGroup) {
            this.inputDirective.valid = this.isTouchedOrDirty
                ? this.getInputState(this.inputGroup.isFocused)
                : IgxInputState.INITIAL;
        } else if (this.hasProjectedInputs) {
            this.projectedInputs
                .forEach(i => {
                    i.inputDirective.valid = this.isTouchedOrDirty
                        ? this.getInputState(i.isFocused)
                        : IgxInputState.INITIAL;;
                });
        }
        this.setRequiredToInputs();
    };

    private get isTouchedOrDirty(): boolean {
        return (this._ngControl.control.touched || this._ngControl.control.dirty)
            && (!!this._ngControl.control.validator || !!this._ngControl.control.asyncValidator);
    }

    private handleSelection(selectionData: Date[]): void {
        let newValue = this.extractRange(selectionData);
        if (!newValue.start && !newValue.end) {
            newValue = null;
        }
        this.value = newValue;
        if (this.isDropdown && selectionData?.length > 1) {
            this.close();
        }
    }

    private handleClosing(event: IBaseCancelableBrowserEventArgs): void {
        const args = { owner: this, cancel: event.cancel, event: event.event };
        this.closing.emit(args);
        event.cancel = args.cancel;
        if (args.cancel) {
            return;
        }

        if (this.isDropdown && event.event && !this.element.nativeElement.contains(event.event.target)) {
            // outside click
            this.updateValidityOnBlur();
        } else {
            this.onTouchCallback();
            // input click
            if (this.hasProjectedInputs && this._focusedInput) {
                this._focusedInput.setFocus();
                this._focusedInput = null;
            }
            if (this.inputDirective) {
                this.inputDirective.focus();
            }
        }
    }

    private subscribeToOverlayEvents() {
        this._overlayService.onOpening.pipe(...this._overlaySubFilter).subscribe((eventArgs) => {
            const args = { owner: this, cancel: false, event: eventArgs.event };
            const overlayEvent = eventArgs as OverlayCancelableEventArgs;
            this.opening.emit(args);
            if (args.cancel) {
                this._overlayService.detach(this._overlayId);
                overlayEvent.cancel = true;
                return;
            }

            this._initializeCalendarContainer(eventArgs.componentRef.instance);
            this._collapsed = false;
            this.updateCalendar();
        });

        this._overlayService.onOpened.pipe(...this._overlaySubFilter).subscribe(() => {
            this.calendar?.daysView?.focusActiveDate();
            this.opened.emit({ owner: this });
        });

        this._overlayService.onClosing.pipe(...this._overlaySubFilter).subscribe((eventArgs) => {
            this.handleClosing(eventArgs as OverlayCancelableEventArgs);
        });

        this._overlayService.onClosed.pipe(...this._overlaySubFilter).subscribe(() => {
            this._overlayService.detach(this._overlayId);
            this._collapsed = true;
            this._overlayId = null;
            this.closed.emit({ owner: this });
        });
    }

    private updateValue(value: DateRange) {
        this._value = value ? value : null;
        this.updateInputs();
    }

    private updateValidityOnBlur() {
        this.onTouchCallback();
        if (this._ngControl) {
            if (this.hasProjectedInputs) {
                this.projectedInputs.forEach(i => {
                    if (!this._ngControl.valid) {
                        i.updateInputValidity(IgxInputState.INVALID);
                    } else {
                        i.updateInputValidity(IgxInputState.INITIAL);
                    }
                });
            }

            if (this.inputDirective) {
                if (!this._ngControl.valid) {
                    this.inputDirective.valid = IgxInputState.INVALID;
                } else {
                    this.inputDirective.valid = IgxInputState.INITIAL;
                }
            }
        }
    }

    private updateDisabledState() {
        if (this.hasProjectedInputs) {
            const start = this.projectedInputs.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
            const end = this.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
            start.inputDirective.disabled = this.disabled;
            end.inputDirective.disabled = this.disabled;
            return;
        }
    }

    private getInputState(focused: boolean): IgxInputState {
        if (focused) {
            return this._ngControl.valid ? IgxInputState.VALID : IgxInputState.INVALID;
        } else {
            return this._ngControl.valid ? IgxInputState.INITIAL : IgxInputState.INVALID;
        }
    }

    private setRequiredToInputs(): void {
        // workaround for igxInput setting required
        Promise.resolve().then(() => {
            const isRequired = this.required;
            if (this.inputGroup && this.inputGroup.isRequired !== isRequired) {
                this.inputGroup.isRequired = isRequired;
            } else if (this.hasProjectedInputs && this._ngControl) {
                this.projectedInputs.forEach(i => i.isRequired = isRequired);
            }
        });
    }

    private parseMinValue(value: string | Date): Date | null {
        let minValue: Date = parseDate(value);
        if (!minValue && this.hasProjectedInputs) {
            const start = this.projectedInputs.filter(i => i instanceof IgxDateRangeStartComponent)[0];
            if (start) {
                minValue = parseDate(start.dateTimeEditor.minValue);
            }
        }

        return minValue;
    }

    private parseMaxValue(value: string | Date): Date | null {
        let maxValue: Date = parseDate(value);
        if (!maxValue && this.projectedInputs) {
            const end = this.projectedInputs.filter(i => i instanceof IgxDateRangeEndComponent)[0];
            if (end) {
                maxValue = parseDate(end.dateTimeEditor.maxValue);
            }
        }

        return maxValue;
    }

    private updateCalendar(): void {
        this.calendar.disabledDates = [];
        const minValue = this.parseMinValue(this.minValue);
        if (minValue) {
            this.calendar.disabledDates.push({ type: DateRangeType.Before, dateRange: [minValue] });
        }
        const maxValue = this.parseMaxValue(this.maxValue);
        if (maxValue) {
            this.calendar.disabledDates.push({ type: DateRangeType.After, dateRange: [maxValue] });
        }

        const range: Date[] = [];
        if (this.value?.start && this.value?.end) {
            const _value = this.toRangeOfDates(this.value);
            if (DateTimeUtil.greaterThanMaxValue(_value.start, _value.end)) {
                this.swapEditorDates();
            }
            if (this.valueInRange(this.value, minValue, maxValue)) {
                range.push(_value.start, _value.end);
            }
        }

        if (range.length > 0) {
            this.calendar.selectDate(range);
        } else if (range.length === 0 && this.calendar.monthViews) {
            this.calendar.deselectDate();
        }
        this.calendar.viewDate = range[0] || new Date();
    }

    private swapEditorDates(): void {
        if (this.hasProjectedInputs) {
            const start = this.projectedInputs.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
            const end = this.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
            [start.dateTimeEditor.value, end.dateTimeEditor.value] = [end.dateTimeEditor.value, start.dateTimeEditor.value];
            [this.value.start, this.value.end] = [this.value.end, this.value.start];
        }
    }

    private valueInRange(value: DateRange, minValue?: Date, maxValue?: Date): boolean {
        const _value = this.toRangeOfDates(value);
        if (minValue && DateTimeUtil.lessThanMinValue(_value.start, minValue, false)) {
            return false;
        }
        if (maxValue && DateTimeUtil.greaterThanMaxValue(_value.end, maxValue, false)) {
            return false;
        }

        return true;
    }

    private extractRange(selection: Date[]): DateRange {
        return {
            start: selection[0] || null,
            end: selection.length > 0 ? selection[selection.length - 1] : null
        };
    }

    private toRangeOfDates(range: DateRange): { start: Date; end: Date } {
        let start;
        let end;
        if (!isDate(range.start)) {
            start = DateTimeUtil.parseIsoDate(range.start);
        }
        if (!isDate(range.end)) {
            end = DateTimeUtil.parseIsoDate(range.end);
        }

        if (start || end) {
            return { start, end };
        }

        return { start: range.start as Date, end: range.end as Date };
    }

    private subscribeToDateEditorEvents(): void {
        if (this.hasProjectedInputs) {
            const start = this.projectedInputs.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
            const end = this.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
            if (start && end) {
                start.dateTimeEditor.valueChange
                    .pipe(takeUntil(this._destroy$))
                    .subscribe(value => {
                        if (this.value) {
                            this.value = { start: value, end: this.value.end };
                        } else {
                            this.value = { start: value, end: null };
                        }
                    });
                end.dateTimeEditor.valueChange
                    .pipe(takeUntil(this._destroy$))
                    .subscribe(value => {
                        if (this.value) {
                            this.value = { start: this.value.start, end: value as Date };
                        } else {
                            this.value = { start: null, end: value as Date };
                        }
                    });
            }
        }
    }

    private attachOnTouched(): void {
        if (this.hasProjectedInputs) {
            this.projectedInputs.forEach(i => {
                fromEvent(i.dateTimeEditor.nativeElement, 'blur')
                    .pipe(takeUntil(this._destroy$))
                    .subscribe(() => {
                        if (this.collapsed) {
                            this.updateValidityOnBlur();
                        }
                    });
            });
        } else {
            fromEvent(this.inputDirective.nativeElement, 'blur')
                .pipe(takeUntil(this._destroy$))
                .subscribe(() => {
                    if (this.collapsed) {
                        this.updateValidityOnBlur();
                    }
                });
        }
    }

    private cacheFocusedInput(): void {
        if (this.hasProjectedInputs) {
            this.projectedInputs.forEach(i => {
                fromEvent(i.dateTimeEditor.nativeElement, 'focus')
                    .pipe(takeUntil(this._destroy$))
                    .subscribe(() => this._focusedInput = i);
            });
        }
    }

    private configPositionStrategy(): void {
        this._positionSettings = {
            openAnimation: fadeIn,
            closeAnimation: fadeOut
        };
        this._dropDownOverlaySettings.positionStrategy = new AutoPositionStrategy(this._positionSettings);
        this._dropDownOverlaySettings.target = this.element.nativeElement;
    }

    private configOverlaySettings(): void {
        if (this.overlaySettings !== null) {
            this._dropDownOverlaySettings = Object.assign({}, this._dropDownOverlaySettings, this.overlaySettings);
            this._dialogOverlaySettings = Object.assign({}, this._dialogOverlaySettings, this.overlaySettings);
        }
    }

    private initialSetValue() {
        // if there is no value and no ngControl on the picker but we have inputs we may have value set through
        // their ngModels - we should generate our initial control value
        if ((!this.value || (!this.value.start && !this.value.end)) && this.hasProjectedInputs && !this._ngControl) {
            const start = this.projectedInputs.find(i => i instanceof IgxDateRangeStartComponent);
            const end = this.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent);
            this._value = {
                start: start.dateTimeEditor.value as Date,
                end: end.dateTimeEditor.value as Date
            };
        }
    }

    private updateInputs(): void {
        const start = this.projectedInputs?.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
        const end = this.projectedInputs?.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
        if (start && end) {
            const _value = this.value ? this.toRangeOfDates(this.value) : null;
            start.updateInputValue(_value?.start || null);
            end.updateInputValue(_value?.end || null);
        }
    }

    private updateDisplayFormat(): void {
        this.projectedInputs.forEach(i => {
            const input = i as IgxDateRangeInputsBaseComponent;
            input.dateTimeEditor.displayFormat = this.displayFormat;
        });
    }

    private updateInputFormat(): void {
        this.projectedInputs.forEach(i => {
            const input = i as IgxDateRangeInputsBaseComponent;
            if (input.dateTimeEditor.inputFormat !== this.inputFormat) {
                input.dateTimeEditor.inputFormat = this.inputFormat;
            }
        });
    }

    private _initializeCalendarContainer(componentInstance: IgxCalendarContainerComponent) {
        this._calendar = componentInstance.calendar;
        this.calendar.hasHeader = false;
        this.calendar.locale = this.locale;
        this.calendar.selection = CalendarSelection.RANGE;
        this.calendar.weekStart = this.weekStart;
        this.calendar.hideOutsideDays = this.hideOutsideDays;
        this.calendar.monthsViewNumber = this.displayMonthsCount;
        this.calendar.selected.pipe(takeUntil(this._destroy$)).subscribe((ev: Date[]) => this.handleSelection(ev));

        componentInstance.mode = this.mode;
        componentInstance.closeButtonLabel = !this.isDropdown ? this.doneButtonText : null;
        componentInstance.pickerActions = this.pickerActions;
        componentInstance.calendarClose.pipe(takeUntil(this._destroy$)).subscribe(() => this.close());
    }
}
