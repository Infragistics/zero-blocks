import { CommonModule, DatePipe } from '@angular/common';
import {
    Component,
    ContentChild,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewContainerRef,
    HostListener,
    ElementRef,
    TemplateRef,
    Directive,
    Inject,
    Pipe,
    PipeTransform
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    IgxCalendarComponent,
    IgxCalendarHeaderTemplateDirective,
    IgxCalendarModule,
    IgxCalendarSubheaderTemplateDirective,
    WEEKDAYS
} from '../calendar/index';
import { IgxIconModule } from '../icon/index';
import { IgxInputGroupModule } from '../input-group/index';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';
import {
    OverlaySettings,
    IgxOverlayService,
    VerticalAlignment,
    HorizontalAlignment,
    PositionSettings,
    ConnectedPositioningStrategy
} from '../services';
import { DeprecateClass } from '../core/deprecateDecorators';
import { DateRangeDescriptor } from '../core/dates/dateRange';
import { EditorProvider } from '../core/edit-provider';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxMaskModule } from '../directives/mask/mask.directive';
import { PREDEFINED_FORMAT_OPTIONS, PREDEFINED_FORMATS, PREDEFINED_MASKS, DateUtil, FORMAT_DESC, DATE_CHARS } from './date-picker.utils';

@Directive({
    selector: '[igxDatePickerTemplate]'
})
export class IgxDatePickerTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}
export interface IFormatViews {
    day?: boolean;
    month?: boolean;
    year?: boolean;
}

export interface IFormatOptions {
    day?: string;
    month?: string;
    weekday?: string;
    year?: string;
}

let NEXT_ID = 0;

export enum DatePickerInteractionMode {
    EDITABLE = 'editable',
    READONLY = 'readonly'
}

/**
 * **Ignite UI for Angular Date Picker** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/date_picker.html)
 *
 * The Ignite UI Date Picker displays a popup calendar that lets users select a single date.
 *
 * Example:
 * ```html
 * <igx-date-picker [(ngModel)]="selectedDate"></igx-date-picker>
 * ```
 */
@Component({
    providers:
        [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxDatePickerComponent, multi: true }],
    // tslint:disable-next-line:component-selector
    selector: 'igx-datePicker, igx-date-picker',
    styles: [':host {display: block;}'],
    templateUrl: 'date-picker.component.html'
})

@DeprecateClass('\'igx-datePicker\' selector is deprecated. Use \'igx-date-picker\' selector instead.')
export class IgxDatePickerComponent implements ControlValueAccessor, EditorProvider, OnInit, OnDestroy {
    /**
     *Returns the format options of the `IgxDatePickerComponent`.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    let formatOptions = this.datePicker.formatOptions;
     *}
     *```
     */
    @Input()
    public get formatOptions(): IFormatOptions {
        return this._formatOptions;
    }

    /**
     *Sets the format options of the `IgxDatePickerComponent`.
     *```typescript
     *public Options;
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    this.Options = {
     *        day: "numeric",
     *        month: "long",
     *        weekday: "long",
     *        year: "numeric"
     *    }
     *this.datePicker.formatOptions = this.Options;
     *}
     *```
     */
    public set formatOptions(formatOptions: IFormatOptions) {
        this._formatOptions = Object.assign(this._formatOptions, formatOptions);
    }

    /**
     *Returns the edit mode date format of the `IgxDatePickerComponent`.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    let format = this.datePicker.format;
     *}
     *```
     */
    @Input()
    public get format(): string {
        return (this._format === undefined) ? this.DEFAULT_DATE_FORMAT : this._format;
    }

    /**
    *Sets the edit mode format of the `IgxDatePickerComponent`.
    *```typescript
    *@ViewChild("MyDatePicker")
    *public datePicker: IgxDatePickerComponent;
    *this.datePicker.format = 'yyyy-M-d';
    *}
    *```
    */
    public set format(format: string) {
        this._format = format;
    }

    /**
     *Returns the format views of the `IgxDatePickerComponent`.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    let formatViews = this.datePicker.formatViews;
     *}
     *```
     */
    @Input()
    public get formatViews(): IFormatViews {
        return this._formatViews;
    }

    /**
     *Sets the format views of the `IgxDatePickerComponent`.
     *```typescript
     *public Views;
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    this.Views = {day:false, month: false, year:false};
     *    this.datePicker.formatViews = this.Views;
     *}
     *```
     */
    public set formatViews(formatViews: IFormatViews) {
        this._formatViews = Object.assign(this._formatViews, formatViews);
    }

    /**
     * Gets the disabled dates descriptors.
     * ```typescript
     * let disabledDates = this.datepicker.disabledDates;
     * ```
     */
    public get disabledDates(): DateRangeDescriptor[] {
        return this._disabledDates;
    }

    /**
     * Sets the disabled dates' descriptors.
     * ```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    this.datePicker.disabledDates = [
     *      new DateRangeDescriptor(DateRangeType.Between, [new Date("2020-1-1"), new Date("2020-1-15")]),
     *      new DateRangeDescriptor(DateRangeType.Weekends)];
     *}
     *```
     */
    public set disabledDates(value: DateRangeDescriptor[]) {
        this._disabledDates = value;
    }

    /**
     * Gets the special dates descriptors.
     * ```typescript
     * let specialDates = this.datepicker.specialDates;
     * ```
     */
    public get specialDates(): DateRangeDescriptor[] {
        return this._specialDates;
    }

    /**
     * Sets the special dates' descriptors.
     * ```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    this.datePicker.specialDates = [
     *      new DateRangeDescriptor(DateRangeType.Between, [new Date("2020-1-1"), new Date("2020-1-15")]),
     *      new DateRangeDescriptor(DateRangeType.Weekends)];
     *}
     *```
     */
    public set specialDates(value: DateRangeDescriptor[]) {
        this._specialDates = value;
    }

    /**
     *Returns the formatted date.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *public selection(event){
     *    let selectedDate = this.datePicker.displayData;
     *    alert(selectedDate);
     *}
     *```
     *```html
     *<igx-date-picker #MyDatePicker (onSelection)="selection()" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    public get displayData() {
        if (this.value) {
            return this._customFormatChecker(this.formatter, this.value);
        }

        return '';
    }

    /**
     *Returns the transformed date.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *public selection(event){
     *    let transformedDate = this.datePicker.transformedDate;
     *    alert(transformedDate);
     *}
     *```
     *```html
     *<igx-date-picker #MyDatePicker (onSelection)="selection()" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    public get transformedDate() {
        if (this._value) {
            return this.transformDate(this._value);
        }
        return '';
    }

    public set transformedDate(value: string) {
        this._transformedDate = value;
    }

    constructor(@Inject(IgxOverlayService) private overlayService: IgxOverlayService) { }

    /**
     * Gets the input group template.
     * ```typescript
     * let template = this.template();
     * ```
     * @memberof IgxTimePickerComponent
     */
    get template(): TemplateRef<any> {
        if (this.datePickerTemplateDirective) {
            return this.datePickerTemplateDirective.template;
        }
        return (this.mode === DatePickerInteractionMode.READONLY) ? this.readOnlyDatePickerTemplate : this.editableDatePickerTemplate;
    }

    /**
     * Gets the context passed to the input group template.
     * @memberof IgxTimePickerComponent
     */
    get context() {
        return {
            value: this.value,
            displayData: this.displayData,
            openCalendar: (eventArgs) => { this.openCalendar(eventArgs); }
        };
    }
    /**
     *An @Input property that sets the value of `id` attribute. If not provided it will be automatically generated.
     *```html
     *<igx-date-picker [id]="'igx-date-picker-3'" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-date-picker-${NEXT_ID++}`;

    /**
     *An @Input property that applies custom formatter on the selected or passed date.
     *```typescript
     *public date: Date = new Date();
     *private dayFormatter = new Intl.DateTimeFormat("en", { weekday: "long" });
     *private monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });
     *public formatter = (date: Date) => { return `You selected
     *                     ${this.dayFormatter.format(date)},
     *                     ${date.getDate()} ${this.monthFormatter.format(date)},
     *                     ${date.getFullYear()}`;
     *}
     *```
     *```html
     *<igx-date-picker [value]="date" [formatter]="formatter"></igx-date-picker>
     *```
     */
    @Input()
    public formatter: (val: Date) => string;

    /**
     *An @Input property that disables the `IgxDatePickerComponent`.
     *```html
     *<igx-date-picker [disabled]="'true'" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     * ```
     */
    @Input()
    public disabled: boolean;

    /**
     *An @Input property that sets the selected date.
     *```typescript
     *public date: Date = new Date();
     *```
     *```html
     *<igx-date-picker [value]="date"></igx-date-picker>
     *```
     */
    @Input()
    public get value(): Date {
        console.log('get value ' + this._value);
        return this._value;
    }

    public set value(date: Date) {
        switch (this.mode) {
            case DatePickerInteractionMode.EDITABLE: {
                if (date !== null) {
                    this._value = date;
                    console.log('set value ' + this._value);
                    this._transformedDate = this.transformDate(date);
                    console.log('set _transformedDate ' + this.transformDate(date));
                } else {
                    this._value = null;
                    this._transformedDate = '';
                }
                break;
            }
            case DatePickerInteractionMode.READONLY: {
                this._value = date;
                break;
            }
        }
    }

    /**
     * An @Input property that sets the `IgxDatePickerComponent` label.
     * The default label is 'Date'.
     * ```html
     * <igx-date-picker [label]="Calendar"></igx-date-picker>
     * ```
     */
    @Input()
    public label = 'Date';

    /**
     * An @Input property that sets the `IgxDatePickerComponent` label visibility.
     * By default the visibility is set to true.
     * <igx-date-picker [labelVisibility]="false"></igx-date-picker>
     */
    @Input()
    public labelVisibility = true;

    /**
     *An @Input property that sets locales. Default locale is en.
     *```html
     *<igx-date-picker locale="ja-JP" [value]="date"></igx-date-picker>
     *```
     */
    @Input() public locale: string = Constants.DEFAULT_LOCALE_DATE;

    /**
     *An @Input property that sets on which day the week starts.
     *```html
     *<igx-date-picker [weekStart]="WEEKDAYS.FRIDAY" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    @Input() public weekStart: WEEKDAYS | number = WEEKDAYS.SUNDAY;

    /**
     *An @Input proeprty that sets the orientation of the `IgxDatePickerComponent` header.
     *```html
     *<igx-date-picker [vertical]="'true'" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    @Input()
    public vertical = false;

    /**
     *An @Input property that renders today button with custom label.
     *```html
     *<igx-date-picker cancelButtonLabel="cancel" todayButtonLabel="Tomorrow"></igx-date-picker>
     *```
     */
    @Input()
    public todayButtonLabel: string;

    /**
     *An @Input property that renders cancel button with custom label.
     *```html
     *<igx-date-picker cancelButtonLabel="Close" todayButtonLabel="Today"></igx-date-picker>
     *```
     */
    @Input()
    public cancelButtonLabel: string;

    @Input()
    public mode = DatePickerInteractionMode.READONLY;

    /**
    *@hidden
    */
    @Input()
    public outlet: IgxOverlayOutletDirective | ElementRef;

    /**
     *An event that is emitted when the `IgxDatePickerComponent` calendar is opened.
     *```typescript
     *public open(event){
     *    alert("The date-picker calendar has been opened!");
     *}
     *```
     *```html
     *<igx-date-picker (onOpen)="open($event)" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    @Output()
    public onOpen = new EventEmitter<IgxDatePickerComponent>();

    /**
     *"An event that is emitted when the `IgxDatePickerComponent` is closed.
     *```typescript
     *public close(event){
     *    alert("The date-picker has been closed!");
     *}
     *```
     *```html
     *<igx-date-picker (onClose)="close($event)" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    @Output()
    public onClose = new EventEmitter<IgxDatePickerComponent>();
    /**
     *An @Output property that is fired when selection is made in the calendar.
     *```typescript
     *public selection(event){
     *    alert("A date has been selected!");
     *}
     *```
     *```html
     *<igx-date-picker (onSelection)="selection($event)" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    @Output()
    public onSelection = new EventEmitter<Date>();

    /*
     * @hidden
     */
    @ViewChild('readOnlyDatePickerTemplate', { read: TemplateRef })
    protected readOnlyDatePickerTemplate: TemplateRef<any>;

    /*
     * @hidden
     */
    @ViewChild('editableDatePickerTemplate', { read: TemplateRef })
    protected editableDatePickerTemplate: TemplateRef<any>;

    /**
     *@hidden
     */
    @ContentChild(IgxDatePickerTemplateDirective, { read: IgxDatePickerTemplateDirective })
    protected datePickerTemplateDirective: IgxDatePickerTemplateDirective;

    @ViewChild('editableInputGroup', { read: ElementRef })
    protected editableInputGroup: ElementRef;

    @ViewChild('editableInput', { read: ElementRef })
    protected editableInput: ElementRef;

    @ViewChild('readonlyInput', { read: ElementRef })
    protected readonlyInput: ElementRef;

    @ViewChild('calendar')
    public calendar: IgxCalendarComponent;

    /**
     *@hidden
     */
    @ContentChild(IgxCalendarHeaderTemplateDirective, { read: IgxCalendarHeaderTemplateDirective })

    public headerTemplate: IgxCalendarHeaderTemplateDirective;
    /**
     *@hidden
     */
    @ContentChild(IgxCalendarSubheaderTemplateDirective, { read: IgxCalendarSubheaderTemplateDirective })
    public subheaderTemplate: IgxCalendarSubheaderTemplateDirective;

    /**
     *@hidden
     */
    @ViewChild('container', { read: ViewContainerRef })
    public container: ViewContainerRef;

    /**
     *@hidden
     */
    @ViewChild('calendarContainer')
    public calendarContainer: ElementRef;

    public hasHeader = true;
    public collapsed = true;
    public mask;
    public displayValue = new DisplayValuePipe(this);
    public inputValue = new InputValuePipe(this);
    public dateStruct = [];

    private _destroy$ = new Subject<boolean>();
    private _componentID;

    private _formatOptions = {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
        year: 'numeric'
    };

    private _formatViews = {
        day: false,
        month: true,
        year: false
    };

    private _disabledDates: DateRangeDescriptor[] = null;
    private _specialDates: DateRangeDescriptor[] = null;

    private _positionSettings: PositionSettings;
    private _dropDownOverlaySettings: OverlaySettings;
    private _modalOverlaySettings: OverlaySettings;

    private _format;
    private _value;
    private _transformedDate;
    private DEFAULT_DATE_FORMAT = PREDEFINED_FORMAT_OPTIONS.SHORT_DATE;

    /**
     *Method that sets the selected date.
     *```typescript
     *public date = new Date();
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    this.datePicker.writeValue(this.date);
     *}
     *```
     *@param value The date you want to select.
     *@memberOf {@link IgxDatePickerComponent}
     */
    public writeValue(value: Date) {
        this.value = value;
    }

    /**
     *@hidden
     */
    public registerOnChange(fn: (_: Date) => void) { this._onChangeCallback = fn; }

    /**
     *@hidden
     */
    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }

    /** @hidden */
    getEditElement() {
        return ((this.mode === DatePickerInteractionMode.READONLY) ? this.readonlyInput : this.editableInput).nativeElement;
    }

    /**
     *@hidden
     */
    public ngOnInit(): void {
        this._positionSettings = {
            horizontalDirection: HorizontalAlignment.Right,
            verticalDirection: VerticalAlignment.Bottom,
        };

        this._dropDownOverlaySettings = {
            closeOnOutsideClick: true,
            modal: false,
            positionStrategy: new ConnectedPositioningStrategy(this._positionSettings),
            outlet: this.outlet
        };

        this._modalOverlaySettings = {
            closeOnOutsideClick: true,
            modal: true,
            outlet: this.outlet
        };

        this.overlayService.onOpened.pipe(
            filter(overlay => overlay.id === this._componentID),
            takeUntil(this._destroy$)).subscribe(() => {
                this.onOpened();
            });

        this.overlayService.onClosed.pipe(
            filter(overlay => overlay.id === this._componentID),
            takeUntil(this._destroy$)).subscribe(() => {
                this.onClosed();
            });

        if (this.calendarContainer) {
            this.calendarContainer.nativeElement.style.display = 'none';
        }

        if (this.mode === DatePickerInteractionMode.EDITABLE) {
            this.getFormatOptions(this.format);
            this.dateStruct = DateUtil.parseDateFormat(this.format);
        }
    }

    /**
     *@hidden
     */
    public ngOnDestroy(): void {
        this.overlayService.hideAll();
        this._destroy$.next(true);
        this._destroy$.complete();
    }

    /**
     *Selects today's date from calendar and change the input field value, @calendar.viewDate and @calendar.value.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *this.datePicker.triggerTodaySelection();
     *}
     *```
     *@memberOf {@link IgxDatePickerComponent}
     */
    public triggerTodaySelection() {
        const today = new Date(Date.now());
        this.handleSelection(today);
    }

    /**
     * Change the calendar selection and calling this method will emit the @calendar.onSelection event,
     * which will fire @handleSelection method.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *this.datePicker.selectDate(this.date);
     *}
     * ```
     * @param date passed date that has to be set to the calendar.
     * @memberOf {@link IgxDatePickerComponent}
     */
    public selectDate(date: Date) {
        this.value = date;
        this.onSelection.emit(date);
        this._onChangeCallback(date);
    }

    /**
     * Deselects the calendar date.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *this.datePicker.deselectDate();
     *}
     * ```
     * @memberOf {@link IgxDatePickerComponent}
     */
    public deselectDate() {
        this.value = null;
        this.calendar.deselectDate();
        this._onChangeCallback(null);
    }

    /**
     * Open the dialog and update the calendar.
     *
     * @hidden
     */
    public openCalendar(eventArgs): void {
        eventArgs.stopPropagation();
        switch (this.mode) {
            case DatePickerInteractionMode.READONLY: {
                this.hasHeader = true;
                this._componentID = this.overlayService.show(this.calendarContainer, this._modalOverlaySettings);
                break;
            }
            case DatePickerInteractionMode.EDITABLE: {
                if (this.collapsed) {
                    this._dropDownOverlaySettings.positionStrategy.settings.target = this.editableInputGroup.nativeElement;
                    this.hasHeader = false;
                    this._componentID = this.overlayService.show(this.calendarContainer, this._dropDownOverlaySettings);
                }
                break;
            }
        }
    }

    public closeCalendar() {
        this.overlayService.hide(this._componentID);
    }

    public clear() {
        this.deselectDate();
    }

    public calculateDate(data: string) {
        // Remove underscore mask prompt char
        const trimmedData = data.replace(/_/g, '');
        // let day, month;
        // let dayPart;
        // let dayFormat;
        // let monthPart;
        // let dayPartPosition;
        // let monthFormat;
        // let monthPartPosition;

        // dayPart = this.dateStruct.filter(part => part.type === DATE_PARTS.DAY);
        // dayFormat = dayPart[0].formatType;
        // dayPartPosition = dayPart[0].position;

        // monthPart = this.dateStruct.filter(part => part.type === DATE_PARTS.MONTH);
        // monthFormat = monthPart[0].formatType;
        // monthPartPosition = monthPart[0].position;

        // if (dayFormat === FORMAT_DESC.NUMERIC) {
        //     day = this.trimUnderlines(data.substring(dayPartPosition[0], dayPartPosition[1] + 1));
        // }

        // if (monthFormat === FORMAT_DESC.NUMERIC) {
        //     month = this.trimUnderlines(data.substring(monthPartPosition[0], monthPartPosition[1] + 1));
        // }

        // const dateData = new Date(trimmedData);
        // const year = dateData.getFullYear();
        // const modifiedDate = new Date();

        // modifiedDate.setDate(day);
        // modifiedDate.setMonth(month - 1);
        // modifiedDate.setFullYear(year);

        this.value = new Date(trimmedData);
    }

    private trimUnderlines(value: string) {
        return value.replace(/_/g, '');
    }

    public isDateValid(data) {
        return new Date(data.replace(/_/g, '')).toString() !== 'Invalid Date';
    }

    /**
     * Evaluates when @calendar.onSelection event was fired
     * and update the input value.
     *
     * @param event selected value from calendar.
     *
     * @hidden
     */
    public handleSelection(date: Date) {
        if (this.value) {
            date.setHours(this.value.getHours());
            date.setMinutes(this.value.getMinutes());
            date.setSeconds(this.value.getSeconds());
            date.setMilliseconds(this.value.getMilliseconds());
        }

        this.value = date;
        this.calendar.viewDate = date;

        this._onChangeCallback(date);

        this.closeCalendar();

        this.onSelection.emit(date);
    }

    public onBlur(eventArgs) {
        this.calculateDate(eventArgs.target.value);
    }

    public isOneDigit(char, index) {
        const temp = (this.format.match(new RegExp(char, 'g')).length === 1 && index < 10);
        return temp;
    }

    @HostListener('keydown.alt.arrowdown', ['$event'])
    public onAltArrowDownKeydown(event: KeyboardEvent) {
        this.calculateDate(this.editableInput.nativeElement.value);
        this.openCalendar(event);
    }

    // @HostListener('keydown.esc', ['$event'])
    // public onEscKeydown(event) {
    //     this.closeCalendar();
    //     event.preventDefault();
    //     event.stopPropagation();
    // }

    // @HostListener('keydown.spacebar', ['$event'])
    // @HostListener('keydown.space', ['$event'])
    // public onSpaceClick(event) {
    //     this.openCalendar();
    //     event.preventDefault();
    // }

    @HostListener('keydown.arrowdown', ['$event'])
    public onArrowDownKeydown(event) {
        event.preventDefault();
        const cursor = this._getCursorPosition();
    }

    @HostListener('keydown.arrowup', ['$event'])
    public onArrowUpKeydown(event) {
        event.preventDefault();
        const cursor = this._getCursorPosition();
    }

    private onOpened() {
        this.collapsed = false;
        this.calendarContainer.nativeElement.style.display = 'block';

        if (this.value) {
            this.calendar.value = this.value;
            this.calendar.viewDate = this.value;
        }

        this._onTouchedCallback();
        this.onOpen.emit(this);

        if (this.calendar && this.value) {
            this._focusCalendarDate();
        }
    }

    private onClosed() {
        this.collapsed = true;
        this.calendarContainer.nativeElement.style.display = 'none';
        this.onClose.emit(this);

        if (this.editableInput) {
            this.editableInput.nativeElement.focus();
        }
    }

    // Focus a date, after the calendar appearence into DOM.
    private _focusCalendarDate() {
        requestAnimationFrame(() => {
            this.calendar.focusActiveDate();
        });
    }

    private _setLocaleToDate(value: Date, locale: string = Constants.DEFAULT_LOCALE_DATE): string {
        return value.toLocaleDateString(locale);
    }

    private _getCursorPosition(): number {
        return this.editableInput.nativeElement.selectionStart;
    }

    private getFormatOptions(format) {
        switch (format) {
            case PREDEFINED_FORMAT_OPTIONS.SHORT_DATE: {
                this.mask = PREDEFINED_MASKS.SHORT_DATE_MASK;
                this.format = PREDEFINED_FORMATS.SHORT_DATE_FORMAT;
                break;
            }
            case PREDEFINED_FORMAT_OPTIONS.MEDIUM_DATE: {
                this.mask = PREDEFINED_MASKS.MEDIUM_DATE_MASK;
                this.format = PREDEFINED_FORMATS.MEDIUM_DATE_FORMAT;
                break;
            }
            case PREDEFINED_FORMAT_OPTIONS.LONG_DATE: {
                this.mask = PREDEFINED_MASKS.LONG_DATE_MASK;
                this.format = PREDEFINED_FORMATS.LONG_DATE_FORMAT;
                break;
            }
            case PREDEFINED_FORMAT_OPTIONS.FULL_DATE: {
                this.mask = PREDEFINED_MASKS.FULL_DATE_MASK;
                this.format = PREDEFINED_FORMATS.FULL_DATE_FORMAT;
                break;
            }
            default: {
                this.mask = DateUtil.getFormatMask(format);
                this.format = format;
                break;
            }
        }
    }

    /**
     * Apply custom user formatter upon date.
     * @param formatter custom formatter function.
     * @param date passed date
     */
    private _customFormatChecker(formatter: (_: Date) => string, date: Date) {
        return this.formatter ? this.formatter(date) : this._setLocaleToDate(date, this.locale);
    }

    private _onTouchedCallback: () => void = () => { };

    private _onChangeCallback: (_: Date) => void = () => { };

    public transformDate(date: Date) {
        const formattedDate = new DateFormatPipe(Constants.DEFAULT_LOCALE_DATE).transform(date, this.format);
        console.log('formattedDate ' + formattedDate);
        return formattedDate;
    }
}

class Constants {
    public static readonly DEFAULT_LOCALE_DATE = 'en';
}

@Pipe({
    name: 'format'
})

export class DateFormatPipe extends DatePipe implements PipeTransform {
    transform(value: any, args?: any): any {
        return super.transform(value, args);
    }
}

@Pipe({
    name: 'displayValue'
})
export class DisplayValuePipe implements PipeTransform {
    constructor(public datePicker: IgxDatePickerComponent) { }
    // on blur
    transform(value: any, args?: any): any {
        if (value !== '') {
            if (value === this.trimMask(this.datePicker.mask)) {
                return '';
            }

            return value.replace(/_/g, '');
        }

        return '';
    }

    trimMask(mask) {
        return mask.replace(/0|L/g, '_');
    }
}

@Pipe({
    name: 'inputValue'
})
export class InputValuePipe implements PipeTransform {
    constructor(public datePicker: IgxDatePickerComponent) { }
    // on focus
    transform(value: any, args?: any): any {
        if (this.datePicker.value !== null && this.datePicker.value !== undefined) {
            let result;
            let offset = 0;
            const dateArray = Array.from(value);
            const monthName = this.datePicker.value.toLocaleString('en', {
                month: 'long'
            });
            const dayName = this.datePicker.value.toLocaleString('en', {
                weekday: 'long'
            });

            const dateStruct = this.datePicker.dateStruct;

            for (let i = 0; i < dateStruct.length; i++) {
                if (dateStruct[i].type === 'weekday') {
                    if (dateStruct[i].formatType === FORMAT_DESC.LONG) {
                        offset += DateUtil.MAX_WEEKDAY_SYMBOLS - 4;
                        for (let j = dayName.length; j < DateUtil.MAX_WEEKDAY_SYMBOLS; j++) {
                            dateArray.splice(j, 0, '_');
                        }
                        dateArray.join('');
                    }
                }

                if (dateStruct[i].type === 'month') {
                    if (dateStruct[i].formatType === FORMAT_DESC.LONG) {
                        const startPos = offset + dateStruct[i].initialPosition + monthName.length;
                        const endPos = startPos + DateUtil.MAX_MONTH_SYMBOLS - monthName.length;
                        offset += DateUtil.MAX_MONTH_SYMBOLS - 4;
                        for (let j = startPos; j < endPos; j++) {
                            dateArray.splice(j, 0, '_');
                        }
                        dateArray.join('');
                    }
                    if (dateStruct[i].formatType === FORMAT_DESC.NUMERIC
                        || dateStruct[i].formatType === FORMAT_DESC.TWO_DIGITS) {
                        const isOneDigit = this.datePicker.isOneDigit(DATE_CHARS.MONTH_CHAR, this.datePicker.value.getMonth() + 1);
                        if (isOneDigit) {
                            const startPos = offset + dateStruct[i].initialPosition;
                            dateArray.splice(startPos, 0, '_');
                        }
                        offset += 1;
                        dateArray.join('');
                    }
                }

                if (dateStruct[i].type === 'day') {
                    if (dateStruct[i].formatType === FORMAT_DESC.NUMERIC
                        || dateStruct[i].formatType === FORMAT_DESC.TWO_DIGITS) {
                        const isOneDigit = this.datePicker.isOneDigit(DATE_CHARS.DAY_CHAR, this.datePicker.value.getDate());
                        if (isOneDigit) {
                            const startPos = offset + dateStruct[i].initialPosition;
                            dateArray.splice(startPos, 0, '_');
                        }
                        offset += 1;
                        dateArray.join('');
                    }
                }
            }

            result = dateArray.join('');

            return result;
        }

        return this.trimMask(this.datePicker.mask);
    }

    trimMask(mask) {
        return mask.replace(/0|L/g, '_');
    }
}

/**
 * The IgxDatePickerModule provides the {@link IgxDatePickerComponent} inside your application.
 */
@NgModule({
    declarations: [IgxDatePickerComponent, IgxDatePickerTemplateDirective],
    exports: [IgxDatePickerComponent, IgxDatePickerTemplateDirective],
    imports: [CommonModule, IgxIconModule, IgxInputGroupModule, IgxCalendarModule, IgxButtonModule, IgxRippleModule, IgxMaskModule]
})
export class IgxDatePickerModule { }
