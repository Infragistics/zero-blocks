import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync, flush } from '@angular/core/testing';
import { Component, OnInit, ViewChild, DebugElement, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { IgxInputGroupModule } from '../input-group/public_api';
import { PickerInteractionMode } from '../date-common/types';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, FormControl } from '@angular/forms';
import { IgxDateRangePickerModule } from './date-range-picker.module';
import { By } from '@angular/platform-browser';
import { ControlsFunction } from '../test-utils/controls-functions.spec';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../test-utils/configure-suite';
import { HelperTestFunctions } from '../calendar/calendar-helper-utils';
import { CancelableEventArgs } from '../core/utils';
import { DateRange } from './date-range-picker-inputs.common';
import { IgxDateTimeEditorModule, IgxDateTimeEditorDirective } from '../directives/date-time-editor/public_api';
import { DateRangeType } from '../core/dates';
import { IgxDateRangePickerComponent, IgxDateRangeEndComponent } from './public_api';
import { IgxIconModule } from '../icon/public_api';
import { AutoPositionStrategy, IgxOverlayService } from '../services/public_api';
import { AnimationMetadata, AnimationOptions } from '@angular/animations';
import { IgxPickersCommonModule } from '../date-common/public_api';
import { IgxCalendarContainerComponent, IgxCalendarContainerModule } from '../date-common/calendar-container/calendar-container.component';
import { IgxCalendarComponent } from '../calendar/public_api';
import { interval, Observable, Subject } from 'rxjs';
import { scan, startWith, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

// The number of milliseconds in one day
const ONE_DAY = 1000 * 60 * 60 * 24;
const DEBOUNCE_TIME = 16;
const DEFAULT_ICON_TEXT = 'date_range';
const DEFAULT_FORMAT_OPTIONS = { day: '2-digit', month: '2-digit', year: 'numeric' };
const CSS_CLASS_INPUT_GROUP = '.igx-input-group__bundle';
const CSS_CLASS_INPUT = '.igx-input-group__input';
const CSS_CLASS_CALENDAR = 'igx-calendar';
const CSS_CLASS_ICON = 'igx-icon';
const CSS_CLASS_DONE_BUTTON = 'igx-button--flat';
const CSS_CLASS_LABEL = 'igx-input-group__label';
const CSS_CLASS_OVERLAY_CONTENT = 'igx-overlay__content';
const CSS_CLASS_DATE_RANGE = 'igx-date-range-picker';
const CSS_CLASS_CALENDAR_DATE = 'igx-calendar__date';
const CSS_CLASS_INACTIVE_DATE = 'igx-calendar__date--inactive';

describe('IgxDateRangePicker', () => {
    describe('Unit tests: ', () => {
        let mockElement: any;
        let mockElementRef: any;
        let mockFactoryResolver: any;
        let mockApplicationRef: any;
        let mockAnimationBuilder: any;
        let mockDocument: any;
        let mockNgZone: any;
        let mockPlatformUtil: any;
        let overlay: IgxOverlayService;
        let mockInjector;
        let ngModuleRef: any;
        let mockCalendar: IgxCalendarComponent;
        let mockDaysView: any;
        const elementRef = { nativeElement: null };
        const platform = {} as any;
        const mockNgControl = jasmine.createSpyObj('NgControl',
            ['registerOnChangeCb',
                'registerOnTouchedCb',
                'registerOnValidatorChangeCb']);
        /* eslint-disable @typescript-eslint/no-unused-vars */
        beforeEach(() => {
            mockFactoryResolver = {
                resolveComponentFactory: (c: any) => ({
                    create: (i: any) => ({
                        hostView: '',
                        location: mockElementRef,
                        changeDetectorRef: { detectChanges: () => { } },
                        destroy: () => { },
                        instance: new IgxCalendarContainerComponent()
                    })
                })
            };
            ngModuleRef = ({
                injector: (...args: any[]) => { },
                componentFactoryResolver: mockFactoryResolver,
                instance: () => { },
                destroy: () => { },
                onDestroy: (fn: any) => { }
            });
            mockElement = {
                style: { visibility: '', cursor: '', transitionDuration: '' },
                classList: { add: () => { }, remove: () => { } },
                appendChild: () => { },
                removeChild: () => { },
                addEventListener: (type: string, listener: (this: HTMLElement, ev: MouseEvent) => any) => { },
                removeEventListener: (type: string, listener: (this: HTMLElement, ev: MouseEvent) => any) => { },
                getBoundingClientRect: () => ({ width: 10, height: 10 }),
                insertBefore: (newChild: HTMLDivElement, refChild: Node) => { },
                contains: () => { }
            };
            mockElement.parent = mockElement;
            mockElement.parentElement = mockElement;
            mockElementRef = { nativeElement: mockElement };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            mockApplicationRef = { attachView: (h: any) => { }, detachView: (h: any) => { } };
            mockInjector = jasmine.createSpyObj('Injector', {
                get: mockNgControl
            });
            mockAnimationBuilder = {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                build: (a: AnimationMetadata | AnimationMetadata[]) => ({
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    create: (e: any, opt?: AnimationOptions) => ({
                        onDone: (fn: any) => { },
                        onStart: (fn: any) => { },
                        onDestroy: (fn: any) => { },
                        init: () => { },
                        hasStarted: () => true,
                        play: () => { },
                        pause: () => { },
                        restart: () => { },
                        finish: () => { },
                        destroy: () => { },
                        rest: () => { },
                        setPosition: (p: any) => { },
                        getPosition: () => 0,
                        parentPlayer: {},
                        totalTime: 0,
                        beforeDestroy: () => { }
                    })
                })
            };
            mockDocument = {
                body: mockElement,
                defaultView: mockElement,
                createElement: () => mockElement,
                appendChild: () => { },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                addEventListener: (type: string, listener: (this: HTMLElement, ev: MouseEvent) => any) => { },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                removeEventListener: (type: string, listener: (this: HTMLElement, ev: MouseEvent) => any) => { }
            };
            mockNgZone = {};
            mockPlatformUtil = { isIOS: false };

            overlay = new IgxOverlayService(
                mockFactoryResolver, mockApplicationRef, mockInjector, mockAnimationBuilder, mockDocument, mockNgZone, mockPlatformUtil);
            mockCalendar = new IgxCalendarComponent(platform);
            mockDaysView = {
                focusActiveDate: jasmine.createSpy()
            } as any;
            mockCalendar.daysView = mockDaysView;
        });
        /* eslint-enable @typescript-eslint/no-unused-vars */
        it('should set range dates correctly through selectRange method', () => {
            const dateRange = new IgxDateRangePickerComponent(elementRef, null, platform, null, null, null, null);
            // dateRange.calendar = calendar;
            let startDate = new Date(2020, 3, 7);
            const endDate = new Date(2020, 6, 27);

            // select range
            dateRange.select(startDate, endDate);
            expect(dateRange.value.start).toEqual(startDate);
            expect(dateRange.value.end).toEqual(endDate);

            // select startDate only
            startDate = new Date(2023, 2, 11);
            dateRange.select(startDate);
            expect(dateRange.value.start).toEqual(startDate);
            expect(dateRange.value.end).toEqual(startDate);
        });

        it('should emit valueChange on selection', () => {
            const dateRange = new IgxDateRangePickerComponent(elementRef, null, platform, null, null, null, null);
            // dateRange.calendar = calendar;
            spyOn(dateRange.valueChange, 'emit');
            let startDate = new Date(2017, 4, 5);
            const endDate = new Date(2017, 11, 22);

            // select range
            dateRange.select(startDate, endDate);
            expect(dateRange.value.start).toEqual(startDate);
            expect(dateRange.value.end).toEqual(endDate);
            expect(dateRange.valueChange.emit).toHaveBeenCalledTimes(1);
            expect(dateRange.valueChange.emit).toHaveBeenCalledWith({ start: startDate, end: endDate });

            // select startDate only
            startDate = new Date(2024, 12, 15);
            dateRange.select(startDate);
            expect(dateRange.value.start).toEqual(startDate);
            expect(dateRange.value.end).toEqual(startDate);
            expect(dateRange.valueChange.emit).toHaveBeenCalledTimes(2);
            expect(dateRange.valueChange.emit).toHaveBeenCalledWith({ start: startDate, end: startDate });
        });

        it('should correctly implement interface methods - ControlValueAccessor', () => {
            const range = { start: new Date(2020, 1, 18), end: new Date(2020, 1, 28) };
            const rangeUpdate = { start: new Date(2020, 2, 22), end: new Date(2020, 2, 25) };

            // init
            const dateRangePicker = new IgxDateRangePickerComponent(null, 'en', platform, null, null, null, null);
            dateRangePicker.registerOnChange(mockNgControl.registerOnChangeCb);
            dateRangePicker.registerOnTouched(mockNgControl.registerOnTouchedCb);
            spyOn(dateRangePicker as any, 'handleSelection').and.callThrough();

            // writeValue
            expect(dateRangePicker.value).toBeUndefined();
            expect(mockNgControl.registerOnChangeCb).not.toHaveBeenCalled();
            dateRangePicker.writeValue(range);
            expect(dateRangePicker.value).toBe(range);

            // set value & handleSelection call _onChangeCallback
            dateRangePicker.value = rangeUpdate;
            expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledWith(rangeUpdate);

            (dateRangePicker as any).handleSelection([range.start]);
            expect((dateRangePicker as any).handleSelection).toHaveBeenCalledWith([range.start]);
            expect((dateRangePicker as any).handleSelection).toHaveBeenCalledTimes(1);
            expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledWith({ start: range.start, end: range.start });

            // awaiting implementation - OnTouched callback
            // Docs: changes the value, turning the control dirty; or blurs the form control element, setting the control to touched.
            // when handleSelection fires should be touched&dirty // when input is blurred(two inputs), should be touched.
            (dateRangePicker as any).handleSelection([range.start]);
            (dateRangePicker as any).updateValidityOnBlur();
            expect(mockNgControl.registerOnTouchedCb).toHaveBeenCalledTimes(1);

            dateRangePicker.setDisabledState(true);
            expect(dateRangePicker.disabled).toBe(true);
            dateRangePicker.setDisabledState(false);
            expect(dateRangePicker.disabled).toBe(false);
        });

        it('should validate correctly minValue and maxValue', () => {
            const dateRange = new IgxDateRangePickerComponent(elementRef, null, platform, mockInjector, null, null, null);
            dateRange.ngOnInit();

            // dateRange.calendar = calendar;
            dateRange.registerOnChange(mockNgControl.registerOnChangeCb);
            dateRange.registerOnValidatorChange(mockNgControl.registerOnValidatorChangeCb);

            dateRange.minValue = new Date(2020, 4, 7);
            expect(mockNgControl.registerOnValidatorChangeCb).toHaveBeenCalledTimes(1);
            dateRange.maxValue = new Date(2020, 8, 7);
            expect(mockNgControl.registerOnValidatorChangeCb).toHaveBeenCalledTimes(2);

            const range = { start: new Date(2020, 4, 18), end: new Date(2020, 6, 28) };
            dateRange.writeValue(range);
            const mockFormControl = new FormControl(dateRange.value);
            expect(dateRange.validate(mockFormControl)).toBeNull();

            range.start.setMonth(2);
            expect(dateRange.validate(mockFormControl)).toEqual({ minValue: true });

            range.end.setMonth(10);
            expect(dateRange.validate(mockFormControl)).toEqual({ minValue: true, maxValue: true });
        });

        it('should disable calendar dates when min and/or max values as dates are provided', () => {
            const dateRange = new IgxDateRangePickerComponent(elementRef, 'en-US', platform, mockInjector, ngModuleRef, null, overlay);
            dateRange.ngOnInit();

            spyOnProperty((dateRange as any), 'calendar').and.returnValue(mockCalendar);
            dateRange.minValue = new Date(2000, 10, 1);
            dateRange.maxValue = new Date(2000, 10, 20);

            dateRange.open({
                closeOnOutsideClick: true,
                modal: false,
                target: dateRange.element.nativeElement,
                positionStrategy: new AutoPositionStrategy({
                    openAnimation: null,
                    closeAnimation: null
                })
            });
            (dateRange as any).updateCalendar();
            expect(mockCalendar.disabledDates.length).toEqual(2);
            expect(mockCalendar.disabledDates[0].type).toEqual(DateRangeType.Before);
            expect(mockCalendar.disabledDates[0].dateRange[0]).toEqual(dateRange.minValue);
            expect(mockCalendar.disabledDates[1].type).toEqual(DateRangeType.After);
            expect(mockCalendar.disabledDates[1].dateRange[0]).toEqual(dateRange.maxValue);
            expect(mockCalendar.daysView.focusActiveDate).toHaveBeenCalledTimes(1);
        });

        it('should disable calendar dates when min and/or max values as strings are provided', fakeAsync(() => {
            const dateRange = new IgxDateRangePickerComponent(elementRef, null, platform, mockInjector, null, null, null);
            dateRange.ngOnInit();

            spyOnProperty((dateRange as any), 'calendar').and.returnValue(mockCalendar);
            dateRange.minValue = '2000/10/1';
            dateRange.maxValue = '2000/10/30';

            spyOn((dateRange as any).calendar, 'deselectDate').and.returnValue(null);
            (dateRange as any).updateCalendar();
            expect((dateRange as any).calendar.disabledDates.length).toEqual(2);
            expect((dateRange as any).calendar.disabledDates[0].type).toEqual(DateRangeType.Before);
            expect((dateRange as any).calendar.disabledDates[0].dateRange[0]).toEqual(new Date(dateRange.minValue));
            expect((dateRange as any).calendar.disabledDates[1].type).toEqual(DateRangeType.After);
            expect((dateRange as any).calendar.disabledDates[1].dateRange[0]).toEqual(new Date(dateRange.maxValue));
        }));
    });

    describe('Integration tests', () => {
        let fixture: ComponentFixture<DateRangeTestComponent>;
        let dateRange: IgxDateRangePickerComponent;
        let startDate: Date;
        let endDate: Date;
        let calendar: DebugElement | Element;
        let calendarDays: DebugElement[] | HTMLCollectionOf<Element>;

        const selectDateRangeFromCalendar = (sDate: Date, eDate: Date) => {
            dateRange.open();
            fixture.detectChanges();
            calendarDays = document.getElementsByClassName(CSS_CLASS_CALENDAR_DATE);
            const nodesArray = Array.from(calendarDays);
            const findNodeIndex: (d: Date) => number =
                (d: Date) => nodesArray
                    .findIndex(
                        n => n.attributes['aria-label'].value === d.toDateString()
                            && !n.classList.contains(CSS_CLASS_INACTIVE_DATE)
                    );
            const startIndex = findNodeIndex(sDate);
            const endIndex = findNodeIndex(eDate);
            if (startIndex === -1) {
                throw new Error('Start date not found in calendar. Aborting.');
            }
            UIInteractions.simulateClickAndSelectEvent(calendarDays[startIndex]);
            if (endIndex !== -1 && endIndex !== startIndex) { // do not click same date twice
                UIInteractions.simulateClickAndSelectEvent(calendarDays[endIndex]);
            }
            fixture.detectChanges();
            dateRange.close();
            fixture.detectChanges();
        };

        describe('Single Input', () => {
            let singleInputElement: DebugElement;
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        DateRangeTestComponent,
                        DateRangeDefaultComponent,
                        DateRangeDisabledComponent
                    ],
                    imports: [
                        CommonModule,
                        IgxDateRangePickerModule,
                        IgxDateTimeEditorModule,
                        IgxInputGroupModule,
                        IgxIconModule,
                        FormsModule,
                        NoopAnimationsModule,
                        IgxPickersCommonModule,
                        IgxCalendarContainerModule
                    ]
                })
                    .compileComponents();
            }));
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.detectChanges();
                dateRange = fixture.componentInstance.dateRange;
                singleInputElement = fixture.debugElement.query(By.css(CSS_CLASS_INPUT));
            }));

            const verifyDateRangeInSingleInput = () => {
                expect(dateRange.value.start).toEqual(startDate);
                expect(dateRange.value.end).toEqual(endDate);
                const inputStartDate = [startDate.getMonth() + 1, startDate.getDate(), startDate.getFullYear()].join('/');
                const inputEndDate = endDate ? [endDate.getMonth() + 1, endDate.getDate(), endDate.getFullYear()].join('/') : '';
                expect(singleInputElement.nativeElement.value).toEqual(`${inputStartDate} - ${inputEndDate}`);
            };

            describe('Selection tests', () => {
                it('should assign range dates to the input when selecting a range from the calendar', () => {
                    fixture.componentInstance.mode = PickerInteractionMode.DropDown;
                    fixture.componentInstance.dateRange.displayFormat = 'M/d/yyyy';
                    fixture.detectChanges();

                    const dayRange = 15;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + dayRange);
                    selectDateRangeFromCalendar(startDate, endDate);
                    verifyDateRangeInSingleInput();
                });

                it('should assign range values correctly when selecting dates in reversed order', () => {
                    fixture.componentInstance.mode = PickerInteractionMode.DropDown;
                    fixture.componentInstance.dateRange.displayFormat = 'M/d/yyyy';
                    fixture.detectChanges();

                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 5, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    selectDateRangeFromCalendar(endDate, startDate);
                    verifyDateRangeInSingleInput();
                });

                it('should set start and end dates on single date selection', () => {
                    fixture.componentInstance.mode = PickerInteractionMode.DropDown;
                    fixture.componentInstance.dateRange.displayFormat = 'M/d/yyyy';
                    fixture.detectChanges();

                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    endDate = startDate;
                    selectDateRangeFromCalendar(startDate, endDate);
                    verifyDateRangeInSingleInput();
                });

                it('should update input correctly on first and last date selection', () => {
                    fixture.componentInstance.dateRange.displayFormat = 'M/d/yyyy';
                    fixture.detectChanges();
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0, 0, 0, 0);
                    selectDateRangeFromCalendar(startDate, endDate);
                    verifyDateRangeInSingleInput();
                });

                it('should assign range values correctly when selecting through API', () => {
                    fixture.componentInstance.dateRange.displayFormat = 'M/d/yyyy';
                    fixture.detectChanges();
                    startDate = new Date(2020, 10, 8, 0, 0, 0);
                    endDate = new Date(2020, 11, 8, 0, 0, 0);
                    dateRange.select(startDate, endDate);
                    fixture.detectChanges();
                    verifyDateRangeInSingleInput();

                    startDate = new Date(2006, 5, 18, 0, 0, 0);
                    endDate = new Date(2006, 8, 18, 0, 0, 0);
                    dateRange.select(startDate, endDate);
                    fixture.detectChanges();
                    verifyDateRangeInSingleInput();
                });
            });

            describe('Properties & events tests', () => {
                it('should display placeholder', () => {
                    fixture.detectChanges();
                    expect(singleInputElement.nativeElement.placeholder).toEqual('MM/dd/yyyy - MM/dd/yyyy');

                    const placeholder = 'Some placeholder';
                    fixture.componentInstance.dateRange.placeholder = placeholder;
                    fixture.detectChanges();
                    expect(singleInputElement.nativeElement.placeholder).toEqual(placeholder);
                });

                it('should support different display and input formats', () => {
                    dateRange.inputFormat = 'dd/MM/yy'; // should not be registered
                    dateRange.displayFormat = 'longDate';
                    fixture.detectChanges();
                    expect(dateRange.inputDirective.placeholder).toEqual(`MMMM d, y - MMMM d, y`);
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth(), 5, 0, 0, 0);
                    dateRange.select(startDate, endDate);
                    fixture.detectChanges();
                    const longDateOptions = { month: 'long', day: 'numeric' };
                    let inputStartDate = `${ControlsFunction.formatDate(startDate, longDateOptions)}, ${startDate.getFullYear()}`;
                    let inputEndDate = `${ControlsFunction.formatDate(endDate, longDateOptions)}, ${endDate.getFullYear()}`;
                    expect(singleInputElement.nativeElement.value).toEqual(`${inputStartDate} - ${inputEndDate}`);

                    dateRange.value = null;
                    dateRange.displayFormat = 'shortDate';
                    fixture.detectChanges();

                    expect(dateRange.inputDirective.placeholder).toEqual(`M/d/yy - M/d/yy`);
                    startDate.setDate(2);
                    endDate.setDate(19);
                    dateRange.select(startDate, endDate);
                    fixture.detectChanges();

                    const shortDateOptions = { day: 'numeric', month: 'numeric', year: '2-digit' };
                    inputStartDate = ControlsFunction.formatDate(startDate, shortDateOptions);
                    inputEndDate = ControlsFunction.formatDate(endDate, shortDateOptions);
                    expect(singleInputElement.nativeElement.value).toEqual(`${inputStartDate} - ${inputEndDate}`);

                    dateRange.value = null;
                    dateRange.displayFormat = 'fullDate';
                    fixture.detectChanges();

                    expect(dateRange.inputDirective.placeholder).toEqual(`EEEE, MMMM d, y - EEEE, MMMM d, y`);
                    startDate.setDate(12);
                    endDate.setDate(23);
                    dateRange.select(startDate, endDate);
                    fixture.detectChanges();

                    const fullDateOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
                    inputStartDate = ControlsFunction.formatDate(startDate, fullDateOptions);
                    inputEndDate = ControlsFunction.formatDate(endDate, fullDateOptions);
                    expect(singleInputElement.nativeElement.value).toEqual(`${inputStartDate} - ${inputEndDate}`);

                    dateRange.value = null;
                    dateRange.displayFormat = 'dd-MM-yy';
                    fixture.detectChanges();

                    startDate.setDate(9);
                    endDate.setDate(13);
                    dateRange.select(startDate, endDate);
                    fixture.detectChanges();

                    const customFormatOptions = { day: 'numeric', month: 'numeric', year: '2-digit' };
                    inputStartDate = ControlsFunction.formatDate(startDate, customFormatOptions, 'en-GB').
                        replace(/\//g, '-');
                    inputEndDate = ControlsFunction.formatDate(endDate, customFormatOptions, 'en-GB').
                        replace(/\//g, '-');
                    expect(singleInputElement.nativeElement.value).toEqual(`${inputStartDate} - ${inputEndDate}`);
                });

                it('should close the calendar with the "Done" button', fakeAsync(() => {
                    fixture.componentInstance.mode = PickerInteractionMode.Dialog;
                    fixture.componentInstance.dateRange.displayFormat = 'M/d/yyyy';
                    fixture.detectChanges();
                    spyOn(dateRange.closing, 'emit').and.callThrough();
                    spyOn(dateRange.closed, 'emit').and.callThrough();

                    dateRange.open();
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();

                    const doneBtn = document.getElementsByClassName(CSS_CLASS_DONE_BUTTON)[0];
                    UIInteractions.simulateClickAndSelectEvent(doneBtn);
                    tick();
                    fixture.detectChanges();

                    expect(dateRange.collapsed).toBeTrue();
                    expect(dateRange.closing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closing.emit).toHaveBeenCalledWith({ owner: dateRange, cancel: false, event: undefined });
                    expect(dateRange.closed.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closed.emit).toHaveBeenCalledWith({ owner: dateRange });
                }));

                it('should show the "Done" button only in dialog mode', fakeAsync(() => {
                    fixture.componentInstance.mode = PickerInteractionMode.Dialog;
                    fixture.detectChanges();

                    dateRange.open();
                    fixture.detectChanges();
                    let doneBtn = document.getElementsByClassName(CSS_CLASS_DONE_BUTTON)[0];
                    expect(doneBtn).not.toBe(null);
                    dateRange.close();
                    tick();
                    fixture.detectChanges();

                    fixture.componentInstance.mode = PickerInteractionMode.DropDown;
                    fixture.detectChanges();

                    dateRange.open();
                    tick();
                    fixture.detectChanges();
                    doneBtn = document.getElementsByClassName(CSS_CLASS_DONE_BUTTON)[0];
                    expect(doneBtn).not.toBeDefined();
                }));

                it('should be able to change the "Done" button text', fakeAsync(() => {
                    fixture.componentInstance.mode = PickerInteractionMode.Dialog;
                    fixture.detectChanges();

                    dateRange.toggle();
                    fixture.detectChanges();
                    let doneBtn = document.getElementsByClassName(CSS_CLASS_DONE_BUTTON)[0];
                    expect(doneBtn.textContent.trim()).toEqual('Done');
                    dateRange.toggle();
                    tick();
                    fixture.detectChanges();

                    dateRange.doneButtonText = 'Close';
                    fixture.detectChanges();
                    dateRange.toggle();
                    tick();
                    fixture.detectChanges();
                    doneBtn = document.getElementsByClassName(CSS_CLASS_DONE_BUTTON)[0];
                    expect(doneBtn.textContent.trim()).toEqual('Close');
                }));

                it('should emit open/close events - open/close methods', fakeAsync(() => {
                    fixture.componentInstance.dateRange.displayFormat = 'M/d/yyyy';
                    fixture.detectChanges();
                    spyOn(dateRange.opening, 'emit').and.callThrough();
                    spyOn(dateRange.opened, 'emit').and.callThrough();
                    spyOn(dateRange.closing, 'emit').and.callThrough();
                    spyOn(dateRange.closed, 'emit').and.callThrough();

                    dateRange.open();
                    tick(DEBOUNCE_TIME);
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();
                    expect(dateRange.opening.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.opening.emit).toHaveBeenCalledWith({ owner: dateRange, cancel: false, event: undefined });
                    expect(dateRange.opened.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.opened.emit).toHaveBeenCalledWith({ owner: dateRange });

                    dateRange.close();
                    tick();
                    fixture.detectChanges();

                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.closing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closing.emit).toHaveBeenCalledWith({ owner: dateRange, cancel: false, event: undefined });
                    expect(dateRange.closed.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closed.emit).toHaveBeenCalledWith({ owner: dateRange });
                }));

                it('should emit open/close events - toggle method', fakeAsync(() => {
                    spyOn(dateRange.opening, 'emit').and.callThrough();
                    spyOn(dateRange.opened, 'emit').and.callThrough();
                    spyOn(dateRange.closing, 'emit').and.callThrough();
                    spyOn(dateRange.closed, 'emit').and.callThrough();

                    dateRange.toggle();
                    tick(DEBOUNCE_TIME);
                    fixture.detectChanges();

                    expect(dateRange.collapsed).toBeFalsy();
                    expect(dateRange.opening.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.opening.emit).toHaveBeenCalledWith({ owner: dateRange, cancel: false, event: undefined });
                    expect(dateRange.opened.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.opened.emit).toHaveBeenCalledWith({ owner: dateRange });

                    dateRange.toggle();
                    tick();
                    fixture.detectChanges();

                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.closing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closing.emit).toHaveBeenCalledWith({ owner: dateRange, cancel: false, event: undefined });
                    expect(dateRange.closed.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closed.emit).toHaveBeenCalledWith({ owner: dateRange });
                }));

                it('should not close calendar if closing event is canceled', fakeAsync(() => {
                    spyOn(dateRange.closing, 'emit').and.callThrough();
                    spyOn(dateRange.closed, 'emit').and.callThrough();
                    dateRange.closing.subscribe((e: CancelableEventArgs) => e.cancel = true);

                    dateRange.toggle();
                    tick(DEBOUNCE_TIME);
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();

                    const dayRange = 6;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 14, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + dayRange);
                    dateRange.select(startDate, endDate);

                    dateRange.close();
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();
                    expect(dateRange.closing.emit).toHaveBeenCalled();
                    expect(dateRange.closed.emit).not.toHaveBeenCalled();
                }));
            });

            describe('Keyboard navigation', () => {
                it('should toggle the calendar with ALT + DOWN/UP ARROW key', fakeAsync(() => {
                    spyOn(dateRange.opening, 'emit').and.callThrough();
                    spyOn(dateRange.opened, 'emit').and.callThrough();
                    spyOn(dateRange.closing, 'emit').and.callThrough();
                    spyOn(dateRange.closed, 'emit').and.callThrough();
                    expect(dateRange.collapsed).toBeTruthy();

                    const range = fixture.debugElement.query(By.css(CSS_CLASS_DATE_RANGE));
                    UIInteractions.triggerEventHandlerKeyDown('ArrowDown', range, true);

                    tick(DEBOUNCE_TIME * 2);
                    fixture.detectChanges();

                    expect(dateRange.collapsed).toBeFalsy();
                    expect(dateRange.opening.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.opened.emit).toHaveBeenCalledTimes(1);

                    calendar = document.getElementsByClassName(CSS_CLASS_CALENDAR)[0];
                    UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', calendar, true, true);
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.closing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closed.emit).toHaveBeenCalledTimes(1);
                }));

                it('should close the calendar with ESC', fakeAsync(() => {
                    spyOn(dateRange.closing, 'emit').and.callThrough();
                    spyOn(dateRange.closed, 'emit').and.callThrough();

                    expect(dateRange.collapsed).toBeTruthy();
                    dateRange.open();
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();

                    calendar = document.getElementsByClassName(CSS_CLASS_CALENDAR)[0];
                    UIInteractions.triggerKeyDownEvtUponElem('Escape', calendar, true);
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.closing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closed.emit).toHaveBeenCalledTimes(1);
                }));

                it('should not open calendar with ALT + DOWN ARROW key if disabled is set to true', fakeAsync(() => {
                    fixture.componentInstance.mode = PickerInteractionMode.DropDown;
                    fixture.componentInstance.disabled = true;
                    fixture.detectChanges();

                    spyOn(dateRange.opening, 'emit').and.callThrough();
                    spyOn(dateRange.opened, 'emit').and.callThrough();

                    const input = document.getElementsByClassName('igx-input-group__input')[0];
                    UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input, true, true);
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.opening.emit).toHaveBeenCalledTimes(0);
                    expect(dateRange.opened.emit).toHaveBeenCalledTimes(0);
                }));
            });

            it('should expand the calendar if the default icon is clicked', fakeAsync(() => {
                const input = fixture.debugElement.query(By.css('igx-input-group'));
                input.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(fixture.componentInstance.dateRange.collapsed).toBeFalsy();
            }));

            it('should not expand the calendar if the default icon is clicked when disabled is set to true', fakeAsync(() => {
                fixture.componentInstance.disabled = true;
                fixture.detectChanges();
                const input = fixture.debugElement.query(By.css('igx-input-group'));
                input.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(fixture.componentInstance.dateRange.collapsed).toBeTruthy();
            }));

            it('should properly set/update disabled when ChangeDetectionStrategy.OnPush is used', fakeAsync(() => {
                fixture = TestBed.createComponent(DateRangeDisabledComponent);
                fixture.detectChanges();

                dateRange = fixture.componentInstance.dateRange;
                expect(dateRange.inputDirective.disabled).toBeTrue();

                tick(1000);
                fixture.detectChanges();
                expect(dateRange.inputDirective.disabled).toBeFalse();

                tick(1000);
                fixture.detectChanges();
                expect(dateRange.inputDirective.disabled).toBeTrue();

                fixture.destroy();
            }));
        });

        describe('Two Inputs', () => {
            let startInput: DebugElement;
            let endInput: DebugElement;
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        DateRangeTestComponent,
                        DateRangeTwoInputsTestComponent,
                        DateRangeTwoInputsNgModelTestComponent,
                        DateRangeDisabledComponent,
                        DateRangeTwoInputsDisabledComponent
                    ],
                    imports: [
                        CommonModule,
                        IgxDateRangePickerModule,
                        IgxDateTimeEditorModule,
                        IgxPickersCommonModule,
                        IgxCalendarContainerModule,
                        IgxInputGroupModule,
                        FormsModule,
                        NoopAnimationsModule,
                        IgxIconModule
                    ]
                })
                    .compileComponents();
            }));
            beforeEach(async () => {
                fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                fixture.detectChanges();
                dateRange = fixture.componentInstance.dateRange;
                dateRange.value = { start: new Date('2/2/2020'), end: new Date('3/3/2020') };
                startInput = fixture.debugElement.query(By.css('input'));
                endInput = fixture.debugElement.queryAll(By.css('input'))[1];
                calendar = fixture.debugElement.query(By.css(CSS_CLASS_CALENDAR));
                calendarDays = fixture.debugElement.queryAll(By.css(HelperTestFunctions.CURRENT_MONTH_DATES));
            });

            const verifyDateRange = () => {
                expect(dateRange.value.start).toEqual(startDate);
                expect(dateRange.value.end).toEqual(endDate);
                expect(startInput.nativeElement.value).toEqual(ControlsFunction.formatDate(startDate, DEFAULT_FORMAT_OPTIONS));
                const expectedEndDate = endDate ? ControlsFunction.formatDate(endDate, DEFAULT_FORMAT_OPTIONS) : '';
                expect(endInput.nativeElement.value).toEqual(expectedEndDate);
            };

            describe('Selection tests', () => {
                it('should assign range values correctly when selecting dates from the calendar', () => {
                    fixture.componentInstance.mode = PickerInteractionMode.DropDown;
                    fixture.detectChanges();

                    let dayRange = 15;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + dayRange);
                    selectDateRangeFromCalendar(startDate, endDate);
                    verifyDateRange();

                    dayRange = 13;
                    startDate = new Date(today.getFullYear(), today.getMonth(), 6, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + dayRange);
                    selectDateRangeFromCalendar(startDate, endDate);
                    verifyDateRange();
                });

                it('should assign range values correctly when selecting dates in reversed order', () => {
                    fixture.componentInstance.mode = PickerInteractionMode.DropDown;
                    fixture.detectChanges();

                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth(), 20, 0, 0, 0);
                    selectDateRangeFromCalendar(endDate, startDate);
                    verifyDateRange();
                });

                it('should apply selection to start and end dates when single date is selected', () => {
                    fixture.componentInstance.mode = PickerInteractionMode.DropDown;
                    fixture.detectChanges();

                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0); // startDate;

                    selectDateRangeFromCalendar(startDate, endDate);
                    verifyDateRange();
                });

                it('should update inputs correctly on first and last date selection', () => {
                    dateRange.hideOutsideDays = true;
                    fixture.detectChanges();
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0, 0, 0, 0);
                    selectDateRangeFromCalendar(startDate, endDate);
                    verifyDateRange();
                });

                it('should assign range values correctly when selecting through API', () => {
                    startDate = new Date(2020, 10, 8, 0, 0, 0);
                    endDate = new Date(2020, 11, 8, 0, 0, 0);
                    dateRange.select(startDate, endDate);
                    fixture.detectChanges();
                    verifyDateRange();

                    startDate = new Date(2003, 5, 18, 0, 0, 0);
                    endDate = new Date(2003, 8, 18, 0, 0, 0);
                    dateRange.select(startDate, endDate);
                    fixture.detectChanges();
                    verifyDateRange();
                });
                it('should support different input and display formats', () => {
                    let inputFormat = 'dd/MM/yy';
                    let displayFormat = 'longDate';
                    fixture.componentInstance.inputFormat = inputFormat;
                    fixture.componentInstance.displayFormat = displayFormat;
                    fixture.detectChanges();

                    const startInputEditor = startInput.injector.get(IgxDateTimeEditorDirective);
                    const endInputEditor = endInput.injector.get(IgxDateTimeEditorDirective);
                    expect(startInputEditor.inputFormat).toEqual(inputFormat);
                    expect(startInputEditor.displayFormat).toEqual(displayFormat);
                    expect(endInputEditor.inputFormat).toEqual(inputFormat);
                    expect(endInputEditor.displayFormat).toEqual(displayFormat);

                    inputFormat = 'yy-MM-dd';
                    displayFormat = 'shortDate';
                    fixture.componentInstance.inputFormat = inputFormat;
                    fixture.componentInstance.displayFormat = displayFormat;
                    fixture.detectChanges();

                    expect(startInputEditor.inputFormat).toEqual(inputFormat);
                    expect(startInputEditor.displayFormat).toEqual(displayFormat);
                    expect(endInputEditor.inputFormat).toEqual(inputFormat);
                    expect(endInputEditor.displayFormat).toEqual(displayFormat);

                    inputFormat = 'EE/MM/yy';
                    displayFormat = 'fullDate';
                    fixture.componentInstance.inputFormat = inputFormat;
                    fixture.componentInstance.displayFormat = displayFormat;
                    fixture.detectChanges();

                    expect(startInputEditor.inputFormat).toEqual(inputFormat);
                    expect(startInputEditor.displayFormat).toEqual(displayFormat);
                    expect(endInputEditor.inputFormat).toEqual(inputFormat);
                    expect(endInputEditor.displayFormat).toEqual(displayFormat);

                    inputFormat = 'MMM, yy';
                    displayFormat = 'MMMM, yyyy';
                    fixture.componentInstance.inputFormat = inputFormat;
                    fixture.componentInstance.displayFormat = displayFormat;
                    fixture.detectChanges();

                    expect(startInputEditor.inputFormat).toEqual(inputFormat);
                    expect(startInputEditor.displayFormat).toEqual(displayFormat);
                    expect(endInputEditor.inputFormat).toEqual(inputFormat);
                    expect(endInputEditor.displayFormat).toEqual(displayFormat);
                });

                it('should display dates according to the applied display format', () => {
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth(), 5, 0, 0, 0);
                    dateRange.select(startDate, endDate);
                    fixture.detectChanges();
                    expect(startInput.nativeElement.value).toEqual(ControlsFunction.formatDate(startDate, DEFAULT_FORMAT_OPTIONS));
                    expect(endInput.nativeElement.value).toEqual(ControlsFunction.formatDate(endDate, DEFAULT_FORMAT_OPTIONS));

                    fixture.componentInstance.displayFormat = 'shortDate';
                    fixture.detectChanges();

                    startDate.setDate(2);
                    endDate.setDate(19);
                    dateRange.select(startDate, endDate);
                    fixture.detectChanges();

                    const shortDateFormatOptions = { day: 'numeric', month: 'numeric', year: '2-digit' };
                    expect(startInput.nativeElement.value).toEqual(ControlsFunction.formatDate(startDate, shortDateFormatOptions));
                    expect(endInput.nativeElement.value).toEqual(ControlsFunction.formatDate(endDate, shortDateFormatOptions));

                    fixture.componentInstance.displayFormat = 'fullDate';
                    fixture.detectChanges();

                    startDate.setDate(12);
                    endDate.setDate(23);
                    dateRange.select(startDate, endDate);
                    fixture.detectChanges();

                    const fullDateFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
                    expect(startInput.nativeElement.value).toEqual(ControlsFunction.formatDate(startDate, fullDateFormatOptions));
                    expect(endInput.nativeElement.value).toEqual(ControlsFunction.formatDate(endDate, fullDateFormatOptions));

                    fixture.componentInstance.displayFormat = 'dd-MM-yy';
                    fixture.detectChanges();

                    startDate.setDate(9);
                    endDate.setDate(13);
                    dateRange.select(startDate, endDate);
                    fixture.detectChanges();

                    const customFormatOptions = { day: 'numeric', month: 'numeric', year: '2-digit' };
                    const inputStartDate = ControlsFunction.formatDate(startDate, customFormatOptions, 'en-GB').
                        replace(/\//g, '-');
                    const inputEndDate = ControlsFunction.formatDate(endDate, customFormatOptions, 'en-GB').
                        replace(/\//g, '-');
                    expect(startInput.nativeElement.value).toEqual(inputStartDate);
                    expect(endInput.nativeElement.value).toEqual(inputEndDate);
                });

                it('should select a range from the calendar only when the two inputs are filled in', fakeAsync(() => {
                    startInput.triggerEventHandler('focus', {});
                    fixture.detectChanges();
                    UIInteractions.simulateTyping('11/10/2015', startInput);

                    fixture.componentInstance.dateRange.open();
                    tick(DEBOUNCE_TIME);
                    fixture.detectChanges();
                    const rangePicker = fixture.componentInstance.dateRange;
                    expect((rangePicker as any).calendar.selectedDates.length).toBe(0);

                    calendar = document.getElementsByClassName(CSS_CLASS_CALENDAR)[0];
                    UIInteractions.triggerKeyDownEvtUponElem('Escape', calendar);
                    tick(DEBOUNCE_TIME);
                    fixture.detectChanges();

                    endInput.triggerEventHandler('focus', {});
                    fixture.detectChanges();
                    UIInteractions.simulateTyping('11/16/2015', endInput);

                    fixture.componentInstance.dateRange.open();
                    tick(DEBOUNCE_TIME);
                    fixture.detectChanges();
                    expect((rangePicker as any).calendar.selectedDates.length).toBe(7);
                    flush();
                }));
            });

            describe('Keyboard navigation', () => {
                it('should toggle the calendar with ALT + DOWN/UP ARROW key - dropdown mode', fakeAsync(() => {
                    expect(dateRange.collapsed).toBeTruthy();

                    spyOn(dateRange.opening, 'emit').and.callThrough();
                    spyOn(dateRange.opened, 'emit').and.callThrough();
                    spyOn(dateRange.closing, 'emit').and.callThrough();
                    spyOn(dateRange.closed, 'emit').and.callThrough();

                    expect(dateRange.collapsed).toBeTruthy();
                    const range = fixture.debugElement.query(By.css(CSS_CLASS_DATE_RANGE));
                    UIInteractions.triggerEventHandlerKeyDown('ArrowDown', range, true);
                    tick(DEBOUNCE_TIME * 2);
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();
                    expect(dateRange.opening.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.opened.emit).toHaveBeenCalledTimes(1);

                    calendar = document.getElementsByClassName(CSS_CLASS_CALENDAR)[0];
                    UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', calendar, true, true);
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.closing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closed.emit).toHaveBeenCalledTimes(1);
                }));

                it('should toggle the calendar with ALT + DOWN/UP ARROW key - dialog mode', fakeAsync(() => {
                    fixture.componentInstance.mode = PickerInteractionMode.Dialog;
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeTruthy();

                    spyOn(dateRange.opening, 'emit').and.callThrough();
                    spyOn(dateRange.opened, 'emit').and.callThrough();
                    spyOn(dateRange.closing, 'emit').and.callThrough();
                    spyOn(dateRange.closed, 'emit').and.callThrough();

                    expect(dateRange.collapsed).toBeTruthy();
                    const range = fixture.debugElement.query(By.css(CSS_CLASS_DATE_RANGE));
                    UIInteractions.triggerEventHandlerKeyDown('ArrowDown', range, true);
                    tick(DEBOUNCE_TIME * 2);
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();
                    expect(dateRange.opening.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.opened.emit).toHaveBeenCalledTimes(1);

                    calendar = document.getElementsByClassName(CSS_CLASS_CALENDAR)[0];
                    UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', calendar, true, true);
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.closing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closed.emit).toHaveBeenCalledTimes(1);
                }));

                it('should close the calendar with ESC', fakeAsync(() => {
                    spyOn(dateRange.closing, 'emit').and.callThrough();
                    spyOn(dateRange.closed, 'emit').and.callThrough();

                    expect(dateRange.collapsed).toBeTruthy();
                    dateRange.open();
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();

                    calendar = document.getElementsByClassName(CSS_CLASS_CALENDAR)[0];
                    UIInteractions.triggerKeyDownEvtUponElem('Escape', calendar, true);
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.closing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closed.emit).toHaveBeenCalledTimes(1);
                }));

                it('should not open calendar with ALT + DOWN ARROW key if disabled is set to true', fakeAsync(() => {
                    fixture.componentInstance.disabled = true;
                    fixture.detectChanges();

                    spyOn(dateRange.opening, 'emit').and.callThrough();
                    spyOn(dateRange.opened, 'emit').and.callThrough();

                    // UIInteractions.triggerEventHandlerKeyDown('ArrowDown', calendar, true);
                    tick(DEBOUNCE_TIME * 2);
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.opening.emit).toHaveBeenCalledTimes(0);
                    expect(dateRange.opened.emit).toHaveBeenCalledTimes(0);
                }));
            });

            it('should focus the last focused input after the calendar closes - dropdown', fakeAsync(() => {
                endInput = fixture.debugElement.queryAll(By.css('.igx-input-group'))[1];
                endInput.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();

                dateRange.open();
                tick();
                fixture.detectChanges();

                dateRange.close();
                tick();
                fixture.detectChanges();

                expect(fixture.componentInstance.dateRange.projectedInputs
                    .find(i => i instanceof IgxDateRangeEndComponent).isFocused)
                    .toBeTruthy();
            }));

            it('should focus the last focused input after the calendar closes - dialog', fakeAsync(() => {
                fixture.componentInstance.mode = PickerInteractionMode.Dialog;
                fixture.detectChanges();
                endInput = fixture.debugElement.queryAll(By.css('.igx-input-group'))[1];
                UIInteractions.simulateClickAndSelectEvent(endInput.nativeElement);
                fixture.detectChanges();

                dateRange.open();
                tick();
                fixture.detectChanges();

                dateRange.close();
                tick();
                fixture.detectChanges();

                expect(fixture.componentInstance.dateRange.projectedInputs
                    .find(i => i instanceof IgxDateRangeEndComponent).isFocused)
                    .toBeTruthy();
            }));

            it('should expand the calendar if the default icon is clicked', fakeAsync(() => {
                const icon = fixture.debugElement.query(By.css('igx-picker-toggle'));
                icon.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(fixture.componentInstance.dateRange.collapsed).toBeFalsy();
            }));

            it('should not expand the calendar if the default icon is clicked when disabled is set to true', fakeAsync(() => {
                fixture.componentInstance.disabled = true;
                fixture.detectChanges();
                const icon = fixture.debugElement.query(By.css('igx-picker-toggle'));
                icon.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(fixture.componentInstance.dateRange.collapsed).toBeTruthy();
            }));

            it('should properly set/update disabled when ChangeDetectionStrategy.OnPush is used', fakeAsync(() => {
                fixture = TestBed.createComponent(DateRangeTwoInputsDisabledComponent);
                fixture.detectChanges();
                tick(1000);

                dateRange = fixture.componentInstance.dateRange;
                expect(dateRange.projectedInputs.first.inputDirective.disabled).toBeTrue();
                expect(dateRange.projectedInputs.last.inputDirective.disabled).toBeTrue();

                fixture.detectChanges();
                tick(1000);
                expect(dateRange.projectedInputs.first.inputDirective.disabled).toBeFalse();
                expect(dateRange.projectedInputs.last.disabled).toBeFalse();

                fixture.detectChanges();
                tick(1000);
                expect(dateRange.projectedInputs.first.inputDirective.disabled).toBeTrue();
                expect(dateRange.projectedInputs.last.inputDirective.disabled).toBeTrue();

                fixture.destroy();
            }));

            describe('Data binding', () => {
                it('should properly update component value with ngModel bound to projected inputs - #7353', fakeAsync(() => {
                    fixture = TestBed.createComponent(DateRangeTwoInputsNgModelTestComponent);
                    fixture.detectChanges();
                    const range = (fixture.componentInstance as DateRangeTwoInputsNgModelTestComponent).range;
                    fixture.componentInstance.dateRange.open();
                    fixture.detectChanges();
                    tick();
                    expect((fixture.componentInstance.dateRange.value.start as Date).getTime()).toEqual(range.start.getTime());
                    expect((fixture.componentInstance.dateRange.value.end as Date).getTime()).toEqual(range.end.getTime());
                }));
            });
        });

        describe('Rendering', () => {
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        DateRangeTestComponent,
                        DateRangeDefaultComponent,
                        DateRangeCustomComponent,
                        DateRangeTemplatesComponent,
                        DateRangeTwoInputsTestComponent
                    ],
                    imports: [
                        IgxDateRangePickerModule,
                        IgxDateTimeEditorModule,
                        IgxInputGroupModule,
                        IgxIconModule,
                        FormsModule,
                        NoopAnimationsModule,
                        IgxCalendarContainerModule,
                        IgxPickersCommonModule
                    ]
                })
                    .compileComponents();
            }));

            it('should render range separator', () => {
                fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                fixture.detectChanges();

                const range = fixture.debugElement.query(By.css(CSS_CLASS_DATE_RANGE));
                expect(range.children[1].nativeElement.innerText).toBe('-');
            });

            it('should render default toggle icon', () => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.detectChanges();

                const inputGroup = fixture.debugElement.query(By.css(CSS_CLASS_INPUT_GROUP));
                expect(inputGroup.children[0].nativeElement.innerText).toBe(DEFAULT_ICON_TEXT);
                expect(inputGroup.children[0].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();
            });

            it('should be able to set toggle icon', () => {
                const prefixIconText = 'flight_takeoff';
                const suffixIconText = 'flight_land';
                const additionalIconText = 'calendar_view_day';
                fixture = TestBed.createComponent(DateRangeTemplatesComponent);
                fixture.detectChanges();

                const inputGroups = fixture.debugElement.queryAll(By.css(CSS_CLASS_INPUT_GROUP));
                const prefixSingleRangeInput = inputGroups[0];
                expect(prefixSingleRangeInput.children[0].nativeElement.innerText).toBe(prefixIconText);
                expect(prefixSingleRangeInput.children[0].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();

                const suffixSingleRangeInput = inputGroups[1];
                expect(suffixSingleRangeInput.children[1].nativeElement.innerText).toBe(suffixIconText);
                expect(suffixSingleRangeInput.children[1].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();

                const addPrefixSingleRangeInput = inputGroups[2];
                expect(addPrefixSingleRangeInput.children[0].nativeElement.innerText).toBe(DEFAULT_ICON_TEXT);
                expect(addPrefixSingleRangeInput.children[0].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();
                expect(addPrefixSingleRangeInput.children[1].nativeElement.innerText).toBe(additionalIconText);
                expect(addPrefixSingleRangeInput.children[1].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();

                const prefixRangeInput = inputGroups[3];
                expect(prefixRangeInput.children[0].nativeElement.innerText).toBe(prefixIconText);
                expect(prefixRangeInput.children[0].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();

                const suffixRangeInput = inputGroups[4];
                expect(suffixRangeInput.children[1].nativeElement.innerText).toBe(suffixIconText);
                expect(suffixRangeInput.children[1].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();
                expect(suffixRangeInput.children[2].nativeElement.innerText).toBe(additionalIconText);
                expect(suffixRangeInput.children[2].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();
            });

            it('should render aria attributes properly', fakeAsync(() => {
                fixture = TestBed.createComponent(DateRangeCustomComponent);
                fixture.detectChanges();
                dateRange = fixture.componentInstance.dateRange;
                const toggleBtn = fixture.debugElement.query(By.css(`.${CSS_CLASS_ICON}`));
                const singleInputElement = fixture.debugElement.query(By.css(CSS_CLASS_INPUT));
                startDate = new Date(2020, 1, 1);
                endDate = new Date(2020, 1, 4);
                const expectedLabelID = dateRange.label.id;
                const expectedPlaceholder = 'MM/dd/yyyy - MM/dd/yyyy';

                expect(singleInputElement.nativeElement.getAttribute('role')).toEqual('combobox');
                expect(singleInputElement.nativeElement.getAttribute('placeholder').trim()).toEqual(expectedPlaceholder);
                expect(singleInputElement.nativeElement.getAttribute('aria-haspopup')).toEqual('grid');
                expect(singleInputElement.nativeElement.getAttribute('aria-expanded')).toEqual('false');
                expect(toggleBtn.nativeElement.getAttribute('aria-hidden')).toEqual('true');
                expect(singleInputElement.nativeElement.getAttribute('aria-labelledby')).toEqual(expectedLabelID);

                dateRange.toggle();
                tick();
                fixture.detectChanges();

                expect(singleInputElement.nativeElement.getAttribute('aria-expanded')).toEqual('true');
                expect(toggleBtn.nativeElement.getAttribute('aria-hidden')).toEqual('true');

                dateRange.select(startDate, endDate);
                fixture.detectChanges();
                expect(singleInputElement.nativeElement.getAttribute('placeholder')).toEqual('');
            }));

            it('should render custom label', () => {
                fixture = TestBed.createComponent(DateRangeCustomComponent);
                fixture.detectChanges();

                const inputGroup = fixture.debugElement.query(By.css(CSS_CLASS_INPUT_GROUP));
                expect(inputGroup.children[1].children[0].classes[CSS_CLASS_LABEL]).toBeTruthy();
                expect(inputGroup.children[1].children[0].nativeElement.textContent).toEqual('Select Date');
            });

            it('should be able to apply custom format', () => {
                fixture = TestBed.createComponent(DateRangeCustomComponent);
                fixture.detectChanges();
                dateRange = fixture.componentInstance.dateRange;
                const singleInputElement = fixture.debugElement.query(By.css(CSS_CLASS_INPUT));

                startDate = new Date(2020, 10, 8, 0, 0, 0);
                endDate = new Date(2020, 11, 8, 0, 0, 0);
                dateRange.select(startDate, endDate);
                fixture.detectChanges();

                const result = fixture.componentInstance.formatter({ start: startDate, end: endDate });
                expect(singleInputElement.nativeElement.value).toEqual(result);
            });

            it('should invoke AutoPositionStrategy by default with proper arguments', fakeAsync(() => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.detectChanges();
                spyOn<any>(AutoPositionStrategy.prototype, 'position');

                dateRange = fixture.componentInstance.dateRange;
                dateRange.open();
                tick();
                fixture.detectChanges();

                const overlayContent = document.getElementsByClassName(CSS_CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
                expect(AutoPositionStrategy.prototype.position).toHaveBeenCalledTimes(1);
                expect(AutoPositionStrategy.prototype.position)
                    .toHaveBeenCalledWith(overlayContent, jasmine.anything(), document,
                        jasmine.anything(), dateRange.element.nativeElement);
            }));
        });
    });
});

@Component({
    selector: 'igx-date-range-test',
    template: ''
})
export class DateRangeTestComponent implements OnInit {
    [x: string]: any;
    @ViewChild(IgxDateRangePickerComponent, { static: true })
    public dateRange: IgxDateRangePickerComponent;

    public doneButtonText: string;
    public mode = PickerInteractionMode.DropDown;
    public disabled = false;
    public minValue: Date | string;
    public maxValue: Date | string;

    public ngOnInit(): void {
        this.doneButtonText = 'Done';
    }
}
@Component({
    selector: 'igx-date-range-single-input-test',
    template: `
    <igx-date-range-picker [mode]="mode" [disabled]="disabled" [minValue]="minValue" [maxValue]="maxValue">
    </igx-date-range-picker>
    `
})
export class DateRangeDefaultComponent extends DateRangeTestComponent {
    public disabled = false;
}

@Component({
    selector: 'igx-date-range-two-inputs-test',
    template: `
    <igx-date-range-picker [mode]="mode"
                           [disabled]="disabled"
                           [(ngModel)]="range"
                           [inputFormat]="inputFormat"
                           [displayFormat]="displayFormat" required>
        <igx-date-range-start>
            <igx-picker-toggle igxPrefix>
                <igx-icon>calendar_view_day</igx-icon>
            </igx-picker-toggle>
            <input igxInput igxDateTimeEditor type="text">
        </igx-date-range-start>
        <ng-template igxDateRangeSeparator>-</ng-template>
        <igx-date-range-end>
            <input igxInput igxDateTimeEditor type="text">
        </igx-date-range-end>
    </igx-date-range-picker>
`
})
export class DateRangeTwoInputsTestComponent extends DateRangeTestComponent {
    public range;
    public inputFormat: string;
    public displayFormat: string;
    public disabled = false;
}
@Component({
    selector: 'igx-date-range-two-inputs-ng-model',
    template: `
    <igx-date-range-picker [mode]="'dropdown'">
        <igx-date-range-start>
            <input igxInput [(ngModel)]="range.start" igxDateTimeEditor>
        </igx-date-range-start>
        <igx-date-range-end>
            <input igxInput [(ngModel)]="range.end" igxDateTimeEditor>
        </igx-date-range-end>
    </igx-date-range-picker>`
})
export class DateRangeTwoInputsNgModelTestComponent extends DateRangeTestComponent {
    public range = { start: new Date(2020, 1, 1), end: new Date(2020, 1, 4) };
}

@Component({
    selector: 'igx-date-range-single-input-label-test',
    template: `
<igx-date-range-picker [value]="date" [mode]="'dropdown'" [formatter]="formatter">
<label igxLabel>Select Date</label>
</igx-date-range-picker>
`
})
export class DateRangeCustomComponent extends DateRangeTestComponent {
    public date: DateRange;
    private monthFormatter = new Intl.DateTimeFormat('en', { month: 'long' });

    public formatter = (date: DateRange) => {
        const startDate = `${this.monthFormatter
            .format(date.start as Date)} ${(date.start as Date).getDate()}, ${(date.start as Date).getFullYear()}`;
        const endDate = `${this.monthFormatter
            .format(date.end as Date)} ${(date
                .end as Date).getDate()}, ${(date.end as Date).getFullYear()}`;
        return `You selected ${startDate}-${endDate}`;
    };
}
@Component({
    selector: 'igx-date-range-templates-test',
    template: `
    <igx-date-range-picker #prefixSingleRange>
        <igx-picker-toggle igxPrefix>
            <igx-icon>flight_takeoff</igx-icon>
        </igx-picker-toggle>
    </igx-date-range-picker>
    <igx-date-range-picker #suffixSingleRange>
        <igx-picker-toggle igxSuffix>
            <igx-icon>flight_land</igx-icon>
        </igx-picker-toggle>
    </igx-date-range-picker>
    <igx-date-range-picker>
        <igx-prefix>
            <igx-icon>
                calendar_view_day
            </igx-icon>
        </igx-prefix>
    </igx-date-range-picker>
    <igx-date-range-picker [(ngModel)]="range" required>
        <igx-date-range-start>
            <igx-picker-toggle igxPrefix>
                <igx-icon>flight_takeoff</igx-icon>
            </igx-picker-toggle>
            <input igxInput igxDateTimeEditor type="text">
        </igx-date-range-start>
        <igx-date-range-end>
            <input igxInput igxDateTimeEditor type="text">
            <igx-picker-toggle igxSuffix>
                <igx-icon>flight_land</igx-icon>
            </igx-picker-toggle>
            <igx-suffix>
            <igx-icon>
                calendar_view_day
            </igx-icon>
        </igx-suffix>
        </igx-date-range-end>
    </igx-date-range-picker>
    `
})
export class DateRangeTemplatesComponent extends DateRangeTestComponent {
    public range;
}

@Component({
    template: `<igx-date-range-picker [disabled]="(disabled$ | async) === true"></igx-date-range-picker>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateRangeDisabledComponent extends DateRangeTestComponent implements OnDestroy {
    public disabled$: Observable<boolean>;
    public destroy$ = new Subject();

    constructor() {
        super();
        this.disabled$ = this.setupDisabled();
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public setupDisabled(): Observable<boolean> {
        return interval(1000).pipe(
            takeUntil(this.destroy$),
            scan((disabled) => !disabled, true),
            startWith(true)
        );
    }
}

@Component({
    template: `
    <igx-date-range-picker [disabled]="(disabled$ | async) === true">
        <igx-date-range-start>
            <input igxInput igxDateTimeEditor>
        </igx-date-range-start>
        <igx-date-range-end>
            <input igxInput igxDateTimeEditor>
        </igx-date-range-end>
    </igx-date-range-picker>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateRangeTwoInputsDisabledComponent extends DateRangeDisabledComponent { }
