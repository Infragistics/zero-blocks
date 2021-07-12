import { AfterViewInit, ChangeDetectorRef, Component, Injectable, OnInit, ViewChild, OnDestroy, DebugElement } from '@angular/core';
import { TestBed, tick, fakeAsync, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormGroup, FormControl, Validators, FormBuilder, ReactiveFormsModule,
    FormsModule, NgControl, NgModel, NgForm } from '@angular/forms';
import {
    IgxComboComponent,
    IgxComboModule,
    IComboSelectionChangeEventArgs,
    IgxComboState,
    IComboSearchInputEventArgs,
    IComboItemAdditionEvent
} from './combo.component';
import { IgxComboItemComponent } from './combo-item.component';
import { IgxComboDropDownComponent } from './combo-dropdown.component';
import { IgxComboAddItemComponent } from './combo-add-item.component';
import { IgxComboFilteringPipe } from './combo.pipes';
import { IgxInputState } from '../directives/input/input.directive';
import { IForOfState } from '../directives/for-of/for_of.directive';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../test-utils/configure-suite';
import { DisplayDensity } from '../core/density';
import { AbsoluteScrollStrategy, ConnectedPositioningStrategy } from '../services/public_api';
import { IgxSelectionAPIService } from '../core/selection';
import { IgxIconService } from '../icon/public_api';
import { IBaseCancelableBrowserEventArgs } from '../core/utils';

const CSS_CLASS_COMBO = 'igx-combo';
const CSS_CLASS_COMBO_DROPDOWN = 'igx-combo__drop-down';
const CSS_CLASS_DROPDOWN = 'igx-drop-down';
const CSS_CLASS_DROPDOWNLIST = 'igx-drop-down__list';
const CSS_CLASS_DROPDOWNLIST_SCROLL = 'igx-drop-down__list-scroll';
const CSS_CLASS_CONTENT = 'igx-combo__content';
const CSS_CLASS_CONTAINER = 'igx-display-container';
const CSS_CLASS_DROPDOWNLISTITEM = 'igx-drop-down__item';
const CSS_CLASS_TOGGLEBUTTON = 'igx-combo__toggle-button';
const CSS_CLASS_CLEARBUTTON = 'igx-combo__clear-button';
const CSS_CLASS_ADDBUTTON = 'igx-combo__add-item';
const CSS_CLASS_SELECTED = 'igx-drop-down__item--selected';
const CSS_CLASS_FOCUSED = 'igx-drop-down__item--focused';
const CSS_CLASS_HEADERITEM = 'igx-drop-down__header';
const CSS_CLASS_SCROLLBAR_VERTICAL = 'igx-vhelper--vertical';
const CSS_CLASS_INPUTGROUP = 'igx-input-group';
const CSS_CLASS_COMBO_INPUTGROUP = 'igx-input-group__input';
const CSS_CLASS_INPUTGROUP_WRAPPER = 'igx-input-group__wrapper';
const CSS_CLASS_INPUTGROUP_BUNDLE = 'igx-input-group__bundle';
const CSS_CLASS_INPUTGROUP_MAINBUNDLE = 'igx-input-group__bundle-main';
const CSS_CLASS_INPUTGROUP_REQUIRED = 'igx-input-group--required';
const CSS_CLASS_INPUTGROUP_BORDER = 'igx-input-group__border';
const CSS_CLASS_SEARCHINPUT = 'input[name=\'searchInput\']';
const CSS_CLASS_HEADER = 'header-class';
const CSS_CLASS_FOOTER = 'footer-class';
const CSS_CLASS_ITEM = 'igx-drop-down__item';
const CSS_CLASS_ITEM_COSY = 'igx-drop-down__item--cosy';
const CSS_CLASS_ITEM_COMPACT = 'igx-drop-down__item--compact';
const CSS_CLASS_HEADER_ITEM = 'igx-drop-down__header';
const CSS_CLASS_HEADER_COSY = 'igx-drop-down__header--cosy';
const CSS_CLASS_HEADER_COMPACT = 'igx-drop-down__header--compact';
const CSS_CLASS_INPUT_COSY = 'igx-input-group--cosy';
const CSS_CLASS_INPUT_COMPACT = 'igx-input-group--compact';
const CSS_CLASS_INPUT_COMFORTABLE = 'igx-input-group--comfortable';
const CSS_CLASS_EMPTY = 'igx-combo__empty';
const defaultDropdownItemHeight = 40;
const defaultDropdownItemMaxHeight = 400;

describe('igxCombo', () => {
    let fixture: ComponentFixture<any>;
    let combo: IgxComboComponent;
    let input: DebugElement;

    describe('Unit tests: ', () => {
        const data = ['Item1', 'Item2', 'Item3', 'Item4', 'Item5', 'Item6', 'Item7'];
        const complexData = [
            { country: 'UK', city: 'London' },
            { country: 'France', city: 'Paris' },
            { country: 'Germany', city: 'Berlin' },
            { country: 'Bulgaria', city: 'Sofia' },
            { country: 'Austria', city: 'Vienna' },
            { country: 'Spain', city: 'Madrid' },
            { country: 'Italy', city: 'Rome' }
        ];
        const elementRef = { nativeElement: null };
        const mockSelection: {
            [key: string]: jasmine.Spy;
        } = jasmine.createSpyObj('IgxSelectionAPIService', ['get', 'set', 'add_items', 'select_items']);
        const mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck', 'detectChanges']);
        const mockComboService = jasmine.createSpyObj('IgxComboAPIService', ['register']);
        const mockNgControl = jasmine.createSpyObj('NgControl', ['registerOnChangeCb', 'registerOnTouchedCb']);
        const mockInjector = jasmine.createSpyObj('Injector', {
            get: mockNgControl
        });
        mockSelection.get.and.returnValue(new Set([]));
        const mockIconService = new IgxIconService(null, null, null);
        it('should correctly implement interface methods - ControlValueAccessor ', () => {
            combo = new IgxComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, null, null, mockInjector);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            expect(mockInjector.get).toHaveBeenCalledWith(NgControl, null);
            combo.registerOnChange(mockNgControl.registerOnChangeCb);
            combo.registerOnTouched(mockNgControl.registerOnTouchedCb);

            // writeValue
            expect(combo.value).toBe('');
            mockSelection.get.and.returnValue(new Set(['test']));
            spyOnProperty(combo, 'isRemote').and.returnValue(false);
            combo.writeValue(['test']);
            expect(mockNgControl.registerOnChangeCb).not.toHaveBeenCalled();
            expect(mockSelection.select_items).toHaveBeenCalledWith(combo.id, ['test'], true);
            expect(combo.value).toBe('test');

            // setDisabledState
            combo.setDisabledState(true);
            expect(combo.disabled).toBe(true);
            combo.setDisabledState(false);
            expect(combo.disabled).toBe(false);

            // OnChange callback
            mockSelection.add_items.and.returnValue(new Set(['simpleValue']));
            combo.selectItems(['simpleValue']);
            expect(mockSelection.add_items).toHaveBeenCalledWith(combo.id, ['simpleValue'], undefined);
            expect(mockSelection.select_items).toHaveBeenCalledWith(combo.id, ['simpleValue'], true);
            expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledWith(['simpleValue']);

            // OnTouched callback
            spyOnProperty(combo, 'collapsed').and.returnValue(true);
            spyOnProperty(combo, 'valid', 'set');

            combo.onBlur();
            expect(mockNgControl.registerOnTouchedCb).toHaveBeenCalledTimes(1);
        });
        it('should correctly handle ngControl validity', () => {
            pending('Convert existing form test here');
        });
        it('should properly call dropdown methods on toggle', () => {
            combo = new IgxComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['open', 'close', 'toggle']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.dropdown = dropdown;
            dropdown.collapsed = true;

            combo.open();
            dropdown.collapsed = false;
            expect(combo.dropdown.open).toHaveBeenCalledTimes(1);
            expect(combo.collapsed).toBe(false);

            combo.close();
            dropdown.collapsed = true;
            expect(combo.dropdown.close).toHaveBeenCalledTimes(1);
            expect(combo.collapsed).toBe(true);

            combo.toggle();
            dropdown.collapsed = false;
            expect(combo.dropdown.toggle).toHaveBeenCalledTimes(1);
            expect(combo.collapsed).toBe(false);
        });
        it(`should not focus search input when property autoFocusSearch=false`, () => {
            combo = new IgxComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, null, null, mockInjector);
            const dropdownContainer = { nativeElement: { focus: () => { } } };
            combo['dropdownContainer'] = dropdownContainer;
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            spyOn(combo, 'focusSearchInput');

            combo.autoFocusSearch = false;
            combo.handleOpened();
            expect(combo.focusSearchInput).toHaveBeenCalledTimes(0);

            combo.autoFocusSearch = true;
            combo.handleOpened();
            expect(combo.focusSearchInput).toHaveBeenCalledTimes(1);

            combo.autoFocusSearch = false;
            combo.handleOpened();
            expect(combo.focusSearchInput).toHaveBeenCalledTimes(1);
        });
        it('should call dropdown toggle with correct overlaySettings', () => {
            combo = new IgxComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['toggle']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.dropdown = dropdown;
            const defaultSettings = (combo as any)._overlaySettings;
            combo.toggle();
            expect(combo.dropdown.toggle).toHaveBeenCalledWith(defaultSettings);
            const newSettings = {
                positionStrategy: new ConnectedPositioningStrategy(),
                scrollStrategy: new AbsoluteScrollStrategy()
            };
            combo.overlaySettings = newSettings;
            const expectedSettings = Object.assign({}, defaultSettings, newSettings);
            combo.toggle();
            expect(combo.dropdown.toggle).toHaveBeenCalledWith(expectedSettings);
        });
        it('should properly get/set displayKey', () => {
            combo = new IgxComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, null, null, mockInjector);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.valueKey = 'field';
            expect(combo.displayKey).toEqual(combo.valueKey);
            combo.displayKey = 'region';
            expect(combo.displayKey).toEqual('region');
            expect(combo.displayKey === combo.valueKey).toBeFalsy();
        });
        it('should properly call "writeValue" method', () => {
            combo = new IgxComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, null, null, mockInjector);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.data = data;
            mockSelection.select_items.calls.reset();
            spyOnProperty(combo, 'isRemote').and.returnValue(false);
            combo.writeValue(['EXAMPLE']);
            expect(mockSelection.select_items).toHaveBeenCalledTimes(1);

            // Calling "select_items" through the writeValue accessor should clear the previous values;
            // Select items is called with the invalid value and it is written in selection, though no item is selected
            // Controlling the selection is up to the user
            expect(mockSelection.select_items).toHaveBeenCalledWith(combo.id, ['EXAMPLE'], true);
            combo.writeValue(combo.data[0]);
            // When value key is specified, the item's value key is stored in the selection
            expect(mockSelection.select_items).toHaveBeenCalledWith(combo.id, [], true);
        });
        it('should select items through setSelctedItem method', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxComboComponent(elementRef, mockCdr, selectionService, mockComboService,
                mockIconService, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.data = complexData;
            combo.valueKey = 'country';
            combo.dropdown = dropdown;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);

            const selectedItems = [combo.data[0].country];
            combo.setSelectedItem('UK', true);
            expect(combo.selectedItems()).toEqual(selectedItems);
            combo.setSelectedItem('Germany', true);
            selectedItems.push(combo.data[2].country);
            expect(combo.selectedItems()).toEqual(selectedItems);
            selectedItems.pop();
            combo.setSelectedItem('Germany', false);
            expect(combo.selectedItems()).toEqual(selectedItems);
            selectedItems.pop();
            combo.setSelectedItem('UK', false);
            expect(combo.selectedItems()).toEqual(selectedItems);

            combo.valueKey = null;
            selectedItems.push(combo.data[5]);
            combo.setSelectedItem(combo.data[5], true);
            expect(combo.selectedItems()).toEqual(selectedItems);
            selectedItems.push(combo.data[1]);
            combo.setSelectedItem(combo.data[1], true);
            expect(combo.selectedItems()).toEqual(selectedItems);
            selectedItems.pop();
            combo.setSelectedItem(combo.data[1], false);
            expect(combo.selectedItems()).toEqual(selectedItems);
        });
        it('should set selectedItems correctly on selectItems method call', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxComboComponent(elementRef, mockCdr, selectionService, mockComboService,
                mockIconService, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.data = data;
            combo.dropdown = dropdown;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);

            combo.selectItems([], false);
            expect(combo.selectedItems()).toEqual([]);
            combo.selectItems([], true);
            expect(combo.selectedItems()).toEqual([]);
            const selectedItems = combo.data.slice(0, 3);
            combo.selectItems(combo.data.slice(0, 3), true);
            expect(combo.selectedItems()).toEqual(selectedItems);
            combo.selectItems([], false);
            expect(combo.selectedItems()).toEqual(selectedItems);
            selectedItems.push(combo.data[3]);
            combo.selectItems([combo.data[3]], false);
            expect(combo.selectedItems()).toEqual(combo.data.slice(0, 4));
            combo.selectItems([], true);
            expect(combo.selectedItems()).toEqual([]);
        });
        it('should emit owner on `opening` and `closing`', () => {
            combo = new IgxComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, null, null, mockInjector);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            spyOn(combo.opening, 'emit').and.callThrough();
            spyOn(combo.closing, 'emit').and.callThrough();
            const mockObj = {};
            const inputEvent: IBaseCancelableBrowserEventArgs = {
                cancel: false,
                owner: mockObj,
            };
            combo.comboInput = {
                nativeElement: {
                    focus: () => {}
                }
            } as any;
            combo.handleOpening(inputEvent);
            const expectedCall: IBaseCancelableBrowserEventArgs = Object.assign({}, inputEvent, { owner: combo });
            expect(combo.opening.emit).toHaveBeenCalledWith(expectedCall);
            expect(inputEvent.owner).toEqual(mockObj);
            combo.handleClosing(inputEvent);
            expect(combo.closing.emit).toHaveBeenCalledWith(expectedCall);
            expect(inputEvent.owner).toEqual(mockObj);
            let sub = combo.opening.subscribe((e: IBaseCancelableBrowserEventArgs) => {
                e.cancel = true;
            });
            combo.handleOpening(inputEvent);
            expect(inputEvent.cancel).toEqual(true);
            sub.unsubscribe();
            inputEvent.cancel = false;

            sub = combo.closing.subscribe((e: IBaseCancelableBrowserEventArgs) => {
                e.cancel = true;
            });
            combo.handleClosing(inputEvent);
            expect(inputEvent.cancel).toEqual(true);
            sub.unsubscribe();
        });
        it('should fire selectionChange event on item selection', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxComboComponent(elementRef, mockCdr, selectionService, mockComboService,
                mockIconService, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.data = data;
            combo.dropdown = dropdown;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
            spyOn(combo.selectionChange, 'emit');

            let oldSelection = [];
            let newSelection = [combo.data[1], combo.data[5], combo.data[6]];

            combo.selectItems(newSelection);
            expect(combo.selectionChange.emit).toHaveBeenCalledTimes(1);
            expect(combo.selectionChange.emit).toHaveBeenCalledWith({
                oldSelection,
                newSelection,
                added: newSelection,
                removed: [],
                event: undefined,
                owner: combo,
                displayText: `${newSelection.join(', ')}`,
                cancel: false
            });

            let newItem = combo.data[3];
            combo.selectItems([newItem]);
            oldSelection = [...newSelection];
            newSelection.push(newItem);
            expect(combo.selectionChange.emit).toHaveBeenCalledTimes(2);
            expect(combo.selectionChange.emit).toHaveBeenCalledWith({
                oldSelection,
                newSelection,
                removed: [],
                added: [combo.data[3]],
                event: undefined,
                owner: combo,
                displayText: `${newSelection.join(', ')}`,
                cancel: false
            });

            oldSelection = [...newSelection];
            newSelection = [combo.data[0]];
            combo.selectItems(newSelection, true);
            expect(combo.selectionChange.emit).toHaveBeenCalledTimes(3);
            expect(combo.selectionChange.emit).toHaveBeenCalledWith({
                oldSelection,
                newSelection,
                removed: oldSelection,
                added: newSelection,
                event: undefined,
                owner: combo,
                displayText: `${newSelection.join(', ')}`,
                cancel: false
            });

            oldSelection = [...newSelection];
            newSelection = [];
            newItem = combo.data[0];
            combo.deselectItems([newItem]);
            expect(combo.selectedItems().length).toEqual(0);
            expect(combo.selectionChange.emit).toHaveBeenCalledTimes(4);
            expect(combo.selectionChange.emit).toHaveBeenCalledWith({
                oldSelection,
                newSelection,
                removed: [combo.data[0]],
                added: [],
                event: undefined,
                owner: combo,
                displayText: `${newSelection.join(', ')}`,
                cancel: false
            });
        });
        it('should properly emit added and removed values in change event on single value selection', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxComboComponent(elementRef, mockCdr, selectionService, mockComboService,
                mockIconService, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.data = complexData;
            combo.valueKey = 'country';
            combo.dropdown = dropdown;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
            const selectionSpy = spyOn(combo.selectionChange, 'emit');
            const expectedResults: IComboSelectionChangeEventArgs = {
                newSelection: [combo.data[0][combo.valueKey]],
                oldSelection: [],
                added: [combo.data[0][combo.valueKey]],
                removed: [],
                event: undefined,
                owner: combo,
                displayText: `${combo.data[0][combo.displayKey]}`,
                cancel: false
            };
            combo.selectItems([combo.data[0][combo.valueKey]]);
            expect(selectionSpy).toHaveBeenCalledWith(expectedResults);
            Object.assign(expectedResults, {
                newSelection: [],
                oldSelection: [combo.data[0][combo.valueKey]],
                added: [],
                displayText: '',
                removed: [combo.data[0][combo.valueKey]]
            });
            combo.deselectItems([combo.data[0][combo.valueKey]]);
            expect(selectionSpy).toHaveBeenCalledWith(expectedResults);
        });
        it('should properly emit added and removed values in change event on multiple values selection', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxComboComponent(elementRef, mockCdr, selectionService, mockComboService,
                mockIconService, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.data = complexData;
            combo.valueKey = 'country';
            combo.displayKey = 'city';
            combo.dropdown = dropdown;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
            let oldSelection = [];
            let newSelection = [combo.data[0], combo.data[1], combo.data[2]];
            const selectionSpy = spyOn(combo.selectionChange, 'emit');
            const expectedResults: IComboSelectionChangeEventArgs = {
                newSelection: newSelection.map(e => e[combo.valueKey]),
                oldSelection,
                added: newSelection.map(e => e[combo.valueKey]),
                removed: [],
                event: undefined,
                owner: combo,
                displayText: `${newSelection.map(entry => entry[combo.displayKey]).join(', ')}`,
                cancel: false
            };
            combo.selectItems(newSelection.map(e => e[combo.valueKey]));
            expect(selectionSpy).toHaveBeenCalledWith(expectedResults);
            oldSelection = [...newSelection].map(e => e[combo.valueKey]);
            newSelection = [combo.data[1], combo.data[2]];
            combo.deselectItems([combo.data[0][combo.valueKey]]);
            Object.assign(expectedResults, {
                newSelection: newSelection.map(e => e[combo.valueKey]),
                oldSelection,
                added: [],
                displayText: newSelection.map(e => e[combo.displayKey]).join(', '),
                removed: [combo.data[0][combo.valueKey]]
            });
            oldSelection = [...newSelection].map(e => e[combo.valueKey]);
            newSelection = [combo.data[4], combo.data[5], combo.data[6]];
            expect(selectionSpy).toHaveBeenCalledWith(expectedResults);
            Object.assign(expectedResults, {
                newSelection: newSelection.map(e => e[combo.valueKey]),
                oldSelection,
                added: newSelection.map(e => e[combo.valueKey]),
                displayText: newSelection.map(e => e[combo.displayKey]).join(', '),
                removed: oldSelection
            });
            combo.selectItems(newSelection.map(e => e[combo.valueKey]), true);
            expect(selectionSpy).toHaveBeenCalledWith(expectedResults);
        });
        it('should handle select/deselect ALL items', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxComboComponent(elementRef, mockCdr, selectionService, mockComboService,
                mockIconService, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.data = data;
            combo.dropdown = dropdown;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
            spyOn(combo, 'selectAllItems');
            spyOn(combo, 'deselectAllItems');

            combo.handleSelectAll({ checked: true });
            expect(combo.selectAllItems).toHaveBeenCalledTimes(1);
            expect(combo.deselectAllItems).toHaveBeenCalledTimes(0);

            combo.handleSelectAll({ checked: false });
            expect(combo.selectAllItems).toHaveBeenCalledTimes(1);
            expect(combo.deselectAllItems).toHaveBeenCalledTimes(1);
        });
        it('should emit onSelectonChange event on select/deselect ALL items method call', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxComboComponent(elementRef, mockCdr, selectionService, mockComboService,
                mockIconService, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.data = data;
            combo.dropdown = dropdown;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
            spyOn(combo.selectionChange, 'emit');

            combo.selectAllItems(true);
            expect(combo.selectedItems()).toEqual(data);
            expect(combo.selectionChange.emit).toHaveBeenCalledTimes(1);
            expect(combo.selectionChange.emit).toHaveBeenCalledWith({
                oldSelection: [],
                newSelection: data,
                added: data,
                removed: [],
                owner: combo,
                event: undefined,
                displayText: `${combo.data.join(', ')}`,
                cancel: false
            });

            combo.deselectAllItems(true);
            expect(combo.selectedItems()).toEqual([]);
            expect(combo.selectionChange.emit).toHaveBeenCalledTimes(2);
            expect(combo.selectionChange.emit).toHaveBeenCalledWith({
                oldSelection: data,
                newSelection: [],
                added: [],
                removed: data,
                owner: combo,
                event: undefined,
                displayText: '',
                cancel: false
            });
        });
        it('should properly handle selection manipulation through selectionChange emit', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxComboComponent(elementRef, mockCdr, selectionService, mockComboService,
                mockIconService, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.data = data;
            combo.dropdown = dropdown;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
            spyOn(combo.selectionChange, 'emit').and.callFake((event: IComboSelectionChangeEventArgs) => event.newSelection = []);
            // No items are initially selected
            expect(combo.selectedItems()).toEqual([]);
            // Select the first 5 items
            combo.selectItems(combo.data.splice(0, 5));
            // selectionChange fires and overrides the selection to be [];
            expect(combo.selectedItems()).toEqual([]);
        });
        it('should not throw error when setting data to null', () => {
            combo = new IgxComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, null, null, mockInjector);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            let errorMessage = '';
            try {
                combo.data = null;
            } catch (ex) {
                errorMessage = ex.message;
            }
            expect(errorMessage).toBe('');
            expect(combo.data).not.toBeUndefined();
            expect(combo.data).not.toBeNull();
            expect(combo.data.length).toBe(0);
        });
        it('should not throw error when setting data to undefined', () => {
            combo = new IgxComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, null, null, mockInjector);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            let errorMessage = '';
            try {
                combo.data = undefined;
            } catch (ex) {
                errorMessage = ex.message;
            }
            expect(errorMessage).toBe('');
            expect(combo.data).not.toBeUndefined();
            expect(combo.data).not.toBeNull();
            expect(combo.data.length).toBe(0);
        });
        it('should properly handleInputChange', () => {
            combo = new IgxComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.data = data;
            combo.dropdown = dropdown;
            combo.filterable = true;
            const matchSpy = spyOn<any>(combo, 'checkMatch').and.callThrough();
            spyOn(combo.searchInput, 'emit');

            combo.handleInputChange();
            expect(matchSpy).toHaveBeenCalledTimes(1);
            expect(combo.searchInput.emit).toHaveBeenCalledTimes(0);

            const args = {
                searchText: 'Fake',
                owner: combo,
                cancel: false
            };
            combo.handleInputChange('Fake');
            expect(matchSpy).toHaveBeenCalledTimes(2);
            expect(combo.searchInput.emit).toHaveBeenCalledTimes(1);
            expect(combo.searchInput.emit).toHaveBeenCalledWith(args);

            args.searchText = '';
            combo.handleInputChange('');
            expect(matchSpy).toHaveBeenCalledTimes(3);
            expect(combo.searchInput.emit).toHaveBeenCalledTimes(2);
            expect(combo.searchInput.emit).toHaveBeenCalledWith(args);

            combo.filterable = false;
            combo.handleInputChange();
            expect(matchSpy).toHaveBeenCalledTimes(4);
            expect(combo.searchInput.emit).toHaveBeenCalledTimes(2);
        });
        it('should be able to cancel searchInput', () => {
            combo = new IgxComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, null, null, mockInjector);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.data = data;
            combo.filterable = true;
            combo.searchInput.subscribe((e) => {
                e.cancel = true;
            });
            const matchSpy = spyOn<any>(combo, 'checkMatch').and.callThrough();
            spyOn(combo.searchInput, 'emit').and.callThrough();

            combo.handleInputChange('Item1');
            expect(combo.searchInput.emit).toHaveBeenCalledTimes(1);
            expect(matchSpy).toHaveBeenCalledTimes(1);
        });
        it('should not open on click if combo is disabled', () => {
            combo = new IgxComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['open', 'close', 'toggle']);
            const spyObj = jasmine.createSpyObj('event', ['stopPropagation', 'preventDefault']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.dropdown = dropdown;
            dropdown.collapsed = true;

            combo.disabled = true;
            combo.onInputClick(spyObj);
            expect(combo.dropdown.collapsed).toBeTruthy();
        });
        it('should not clear value when combo is disabled', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxComboComponent(elementRef, mockCdr, selectionService, mockComboService,
                mockIconService, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            const spyObj = jasmine.createSpyObj('event', ['stopPropagation']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.data = data;
            combo.dropdown = dropdown;
            combo.disabled = true;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);

            const item = combo.data.slice(0, 1);
            combo.selectItems(item, true);
            combo.handleClearItems(spyObj);
            expect(combo.value).toEqual(item[0]);
        });

        it('should allow canceling and overwriting of item addition', fakeAsync(() => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxComboComponent(elementRef, mockCdr, selectionService, mockComboService,
                mockIconService, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            const mockVirtDir = jasmine.createSpyObj('virtDir', ['scrollTo']);
            const mockInput = jasmine.createSpyObj('mockInput', [], {
                nativeElement: jasmine.createSpyObj('mockElement', ['focus'])
            });
            spyOn(combo.addition, 'emit').and.callThrough();
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            const subParams: { cancel: boolean; newValue: string; modify: boolean } = {
                cancel: false,
                modify: false,
                newValue: 'mockValue'
            };
            const sub = combo.addition.subscribe((e) => {
                if (subParams.cancel) {
                    e.cancel = true;
                }
                if (subParams.modify) {
                    e.addedItem = subParams.newValue;
                }
            });

            combo.ngOnInit();
            combo.data = ['Item 1', 'Item 2', 'Item 3'];
            combo.dropdown = dropdown;
            combo.searchInput = mockInput;
            (combo as any).virtDir = mockVirtDir;
            let mockAddParams: IComboItemAdditionEvent = {
                cancel: false,
                owner: combo,
                addedItem: 'Item 99',
                newCollection: ['Item 1', 'Item 2', 'Item 3', 'Item 99'],
                oldCollection: ['Item 1', 'Item 2', 'Item 3']
            };


            // handle addition

            combo.searchValue = 'Item 99';
            combo.addItemToCollection();
            tick();
            expect(combo.data.length).toEqual(4);
            expect(combo.addition.emit).toHaveBeenCalledWith(mockAddParams);
            expect(combo.addition.emit).toHaveBeenCalledTimes(1);
            expect(mockVirtDir.scrollTo).toHaveBeenCalledTimes(1);
            expect(combo.searchInputElement.nativeElement.focus).toHaveBeenCalledTimes(1);
            expect(combo.data[combo.data.length - 1]).toBe('Item 99');
            expect(selectionService.get(combo.id).size).toBe(1);
            expect([...selectionService.get(combo.id)][0]).toBe('Item 99');

            // cancel
            subParams.cancel = true;
            mockAddParams = {
                cancel: true,
                owner: combo,
                addedItem: 'Item 99',
                newCollection: ['Item 1', 'Item 2', 'Item 3', 'Item 99', 'Item 99'],
                oldCollection: ['Item 1', 'Item 2', 'Item 3', 'Item 99']
            };

            combo.searchValue = 'Item 99';
            combo.addItemToCollection();
            tick();
            expect(combo.addition.emit).toHaveBeenCalledWith(mockAddParams);
            expect(combo.addition.emit).toHaveBeenCalledTimes(2);
            expect(mockVirtDir.scrollTo).toHaveBeenCalledTimes(1);
            expect(combo.searchInputElement.nativeElement.focus).toHaveBeenCalledTimes(1);
            expect(combo.data.length).toEqual(4);
            expect(combo.data[combo.data.length - 1]).toBe('Item 99');
            expect(selectionService.get(combo.id).size).toBe(1);
            expect([...selectionService.get(combo.id)][0]).toBe('Item 99');

            // overwrite
            subParams.modify = true;
            subParams.cancel = false;
            mockAddParams = {
                cancel: false,
                owner: combo,
                addedItem: 'mockValue',
                newCollection: ['Item 1', 'Item 2', 'Item 3', 'Item 99', 'Item 99'],
                oldCollection: ['Item 1', 'Item 2', 'Item 3', 'Item 99']
            };

            combo.searchValue = 'Item 99';
            combo.addItemToCollection();
            tick();
            expect(combo.addition.emit).toHaveBeenCalledWith(mockAddParams);
            expect(combo.addition.emit).toHaveBeenCalledTimes(3);
            expect(mockVirtDir.scrollTo).toHaveBeenCalledTimes(2);
            expect(combo.searchInputElement.nativeElement.focus).toHaveBeenCalledTimes(2);
            expect(combo.data.length).toEqual(5);
            expect(combo.data[combo.data.length - 1]).toBe(subParams.newValue);
            expect(selectionService.get(combo.id).size).toBe(2);
            expect([...selectionService.get(combo.id)][1]).toBe(subParams.newValue);
            sub.unsubscribe();
        }));
    });
    describe('Initialization and rendering tests: ', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxComboSampleComponent
                ],
                imports: [
                    IgxComboModule,
                    NoopAnimationsModule,
                    IgxToggleModule,
                    ReactiveFormsModule,
                    FormsModule
                ]
            }).compileComponents();
        }));
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
            input = fixture.debugElement.query(By.css(`.${CSS_CLASS_COMBO_INPUTGROUP}`));
            tick();
            fixture.detectChanges();
        }));
        it('should initialize the combo component properly', () => {
            const toggleButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_TOGGLEBUTTON));
            expect(fixture.componentInstance).toBeDefined();
            expect(combo).toBeDefined();
            expect(combo.collapsed).toBeDefined();
            expect(combo.collapsed).toBeTruthy();
            expect(input).toBeDefined();
            expect(toggleButton).toBeDefined();
            expect(combo.searchInput).toBeDefined();
            expect(combo.placeholder).toBeDefined();
        });
        it('should initialize input properties properly', () => {
            expect(combo.data).toBeDefined();
            expect(combo.valueKey).toEqual('field');
            expect(combo.displayKey).toEqual('field');
            expect(combo.groupKey).toEqual('region');
            expect(combo.width).toEqual('400px');
            expect(combo.itemsMaxHeight).toEqual(320);
            expect(combo.itemHeight).toEqual(32);
            expect(combo.placeholder).toEqual('Location');
            expect(combo.searchPlaceholder).toEqual('Enter a Search Term');
            expect(combo.filterable).toEqual(true);
            expect(combo.allowCustomValues).toEqual(false);
            expect(combo.cssClass).toEqual(CSS_CLASS_COMBO);
            expect(combo.type).toEqual('box');
            expect(combo.role).toEqual('combobox');
        });
        it('should apply all appropriate classes on combo initialization', () => {
            const comboWrapper = fixture.nativeElement.querySelector(CSS_CLASS_COMBO);
            expect(comboWrapper).not.toBeNull();
            expect(comboWrapper.attributes.getNamedItem('ng-reflect-placeholder').nodeValue).toEqual('Location');
            expect(comboWrapper.attributes.getNamedItem('ng-reflect-value-key').nodeValue).toEqual('field');
            expect(comboWrapper.attributes.getNamedItem('ng-reflect-group-key').nodeValue).toEqual('region');
            expect(comboWrapper.attributes.getNamedItem('ng-reflect-filterable')).toBeTruthy();
            expect(comboWrapper.childElementCount).toEqual(2); // Input Group + Dropdown
            expect(comboWrapper.attributes.getNamedItem('class').nodeValue).toEqual(CSS_CLASS_COMBO);
            expect(comboWrapper.attributes.getNamedItem('role').nodeValue).toEqual('combobox');
            expect(comboWrapper.attributes.getNamedItem('aria-haspopup').nodeValue).toEqual('listbox');
            expect(comboWrapper.attributes.getNamedItem('aria-expanded').nodeValue).toEqual('false');
            expect(comboWrapper.attributes.getNamedItem('aria-owns').nodeValue).toEqual(fixture.componentInstance.combo.dropdown.id);
            expect(comboWrapper.childElementCount).toEqual(2);

            const inputGroupElement = comboWrapper.children[0];
            expect(inputGroupElement.attributes.getNamedItem('ng-reflect-type').nodeValue).toEqual('box');
            expect(inputGroupElement.classList.contains(CSS_CLASS_INPUTGROUP)).toBeTruthy();
            expect(inputGroupElement.classList.contains('igx-input-group--box')).toBeTruthy();
            expect(inputGroupElement.classList.contains('igx-input-group--placeholder')).toBeTruthy();
            expect(inputGroupElement.childElementCount).toEqual(3);

            const inputGroupWrapper = inputGroupElement.children[0];
            expect(inputGroupWrapper.classList.contains(CSS_CLASS_INPUTGROUP_WRAPPER)).toBeTruthy();
            expect(inputGroupWrapper.childElementCount).toEqual(1);

            const inputGroupBundle = inputGroupWrapper.children[0];
            expect(inputGroupBundle.classList.contains(CSS_CLASS_INPUTGROUP_BUNDLE)).toBeTruthy();
            expect(inputGroupBundle.childElementCount).toEqual(2);

            const mainInputGroupBundle = inputGroupBundle.children[0];
            expect(mainInputGroupBundle.classList.contains(CSS_CLASS_INPUTGROUP_MAINBUNDLE)).toBeTruthy();
            expect(mainInputGroupBundle.childElementCount).toEqual(1);

            const inputElement = mainInputGroupBundle.children[0];
            expect(inputElement.classList.contains('igx-input-group__input')).toBeTruthy();
            expect(inputElement.attributes.getNamedItem('type').nodeValue).toEqual('text');
            expect(inputElement.attributes['readonly']).toBeDefined();

            const dropDownButton = inputGroupBundle.children[1];
            expect(dropDownButton.classList.contains(CSS_CLASS_TOGGLEBUTTON)).toBeTruthy();
            expect(dropDownButton.childElementCount).toEqual(1);

            const inputGroupBorder = inputGroupElement.children[1];
            expect(inputGroupBorder.classList.contains(CSS_CLASS_INPUTGROUP_BORDER)).toBeTruthy();
            expect(inputGroupBorder.childElementCount).toEqual(0);

            const dropDownElement = comboWrapper.children[1];
            expect(dropDownElement.classList.contains(CSS_CLASS_COMBO_DROPDOWN)).toBeTruthy();
            expect(dropDownElement.classList.contains(CSS_CLASS_DROPDOWN)).toBeTruthy();
            expect(dropDownElement.childElementCount).toEqual(1);

            const dropDownList = dropDownElement.children[0];
            const dropDownScrollList = dropDownElement.children[0].children[0];
            expect(dropDownList.classList.contains(CSS_CLASS_DROPDOWNLIST)).toBeTruthy();
            expect(dropDownList.classList.contains('igx-toggle--hidden')).toBeTruthy();
            expect(dropDownScrollList.childElementCount).toEqual(0);
        });
        it('should render aria-expanded attribute properly', fakeAsync(() => {
            const comboContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_COMBO);
            expect(comboContainer.getAttribute('aria-expanded')).toMatch('false');
            combo.open();
            tick();
            fixture.detectChanges();
            expect(comboContainer.getAttribute('aria-expanded')).toMatch('true');
            combo.close();
            tick();
            fixture.detectChanges();
            expect(comboContainer.getAttribute('aria-expanded')).toMatch('false');
        }));
        it('should render placeholder values for inputs properly', () => {
            combo.toggle();
            fixture.detectChanges();
            expect(combo.collapsed).toBeFalsy();
            expect(combo.placeholder).toEqual('Location');
            expect(combo.comboInput.nativeElement.placeholder).toEqual('Location');

            expect(combo.searchPlaceholder).toEqual('Enter a Search Term');
            expect(combo.searchInputElement.nativeElement.placeholder).toEqual('Enter a Search Term');

            combo.searchPlaceholder = 'Filter';
            fixture.detectChanges();
            expect(combo.searchPlaceholder).toEqual('Filter');
            expect(combo.searchInputElement.nativeElement.placeholder).toEqual('Filter');

            combo.placeholder = 'States';
            fixture.detectChanges();
            expect(combo.placeholder).toEqual('States');
            expect(combo.comboInput.nativeElement.placeholder).toEqual('States');
        });
        it('should render dropdown list and item height properly', fakeAsync(() => {
            // NOTE: Minimum itemHeight is 2 rem, per Material Design Guidelines (for mobile only)
            let itemHeight = defaultDropdownItemHeight;
            let itemMaxHeight = defaultDropdownItemMaxHeight;
            combo.displayDensity = DisplayDensity.comfortable;
            fixture.detectChanges();
            combo.toggle();
            tick();
            fixture.detectChanges();
            const dropdownItems = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`));
            const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));

            const verifyDropdownItemHeight = () => {
                expect(combo.itemHeight).toEqual(itemHeight);
                expect(dropdownItems[0].nativeElement.clientHeight).toEqual(itemHeight);
                expect(combo.itemsMaxHeight).toEqual(itemMaxHeight);
                expect(dropdownList.nativeElement.clientHeight).toEqual(itemMaxHeight);
            };
            verifyDropdownItemHeight();

            itemHeight = 48;
            itemMaxHeight = 480;
            combo.itemHeight = itemHeight;
            tick();
            fixture.detectChanges();
            verifyDropdownItemHeight();

            itemMaxHeight = 438;
            combo.itemsMaxHeight = 438;
            tick();
            fixture.detectChanges();
            verifyDropdownItemHeight();

            itemMaxHeight = 1171;
            combo.itemsMaxHeight = 1171;
            tick();
            fixture.detectChanges();
            verifyDropdownItemHeight();

            itemHeight = 83;
            combo.itemHeight = 83;
            tick();
            fixture.detectChanges();
            verifyDropdownItemHeight();
        }));
        it('should render grouped items properly', (done) => {
            let dropdownContainer;
            let dropdownItems;
            let scrollIndex = 0;
            const headers: Array<string> = Array.from(new Set(combo.data.map(item => item.region)));
            combo.toggle();
            fixture.detectChanges();
            const checkGroupedItemsClass = () => {
                fixture.detectChanges();
                dropdownContainer = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
                dropdownItems = dropdownContainer.children;
                Array.from(dropdownItems).forEach((item) => {
                    const itemElement = item as HTMLElement;
                    const itemText = itemElement.innerText.toString();
                    const expectedClass: string = headers.includes(itemText) ? CSS_CLASS_HEADERITEM : CSS_CLASS_DROPDOWNLISTITEM;
                    expect(itemElement.classList.contains(expectedClass)).toBeTruthy();
                });
                scrollIndex += 10;
                if (scrollIndex < combo.data.length) {
                    combo.virtualScrollContainer.scrollTo(scrollIndex);
                    combo.virtualScrollContainer.chunkLoad.pipe(take(1)).subscribe(async () => {
                        await wait(30);
                        checkGroupedItemsClass();
                    });
                } else {
                    done();
                }
            };
            checkGroupedItemsClass();
        });
        it('should render selected items properly', () => {
            combo.toggle();
            fixture.detectChanges();
            const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
            const dropdownItems = dropdownList.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
            expect(dropdownItems[1].classList.contains(CSS_CLASS_SELECTED)).toBeFalsy();
            expect(dropdownItems[3].classList.contains(CSS_CLASS_SELECTED)).toBeFalsy();
            expect(dropdownItems[7].classList.contains(CSS_CLASS_SELECTED)).toBeFalsy();

            combo.selectItems(['Illinois', 'Mississippi', 'Ohio']);
            fixture.detectChanges();
            expect(dropdownItems[1].classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
            expect(dropdownItems[3].classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
            expect(dropdownItems[7].classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();

            combo.deselectItems(['Ohio']);
            fixture.detectChanges();
            expect(dropdownItems[1].classList.contains(CSS_CLASS_SELECTED)).toBeFalsy();
        });
        it('should render focused items properly', () => {
            const dropdown = combo.dropdown;
            combo.toggle();
            fixture.detectChanges();

            dropdown.navigateItem(2); // Componenent is virtualized, so this will focus the ACTUAL 3rd item
            fixture.detectChanges();

            const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
            const dropdownItems = dropdownList.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
            const focusedItem_1 = dropdownItems[1];
            expect(focusedItem_1.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();

            // Change focus
            dropdown.navigateItem(6);
            fixture.detectChanges();
            const focusedItem_2 = dropdownItems[5];
            expect(focusedItem_2.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
            expect(focusedItem_1.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
        });
        it(`should not render search input if both 'allowCustomValues' and 'filterable' are false`, () => {
            combo.allowCustomValues = false;
            combo.filterable = false;
            expect(combo.displaySearchInput).toBeFalsy();
            combo.toggle();
            fixture.detectChanges();
            expect(combo.searchInput).toBeFalsy();
        });
        it('should focus search input', fakeAsync(() => {
            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(document.activeElement).toEqual(combo.searchInputElement.nativeElement);
        }));
        it('should not focus search input, when autoFocusSearch=false', fakeAsync(() => {
            combo.autoFocusSearch = false;
            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(document.activeElement).not.toEqual(combo.searchInputElement.nativeElement);
        }));
        it('should properly initialize templates', () => {
            expect(combo).toBeDefined();
            expect(combo.footerTemplate).toBeDefined();
            expect(combo.headerTemplate).toBeDefined();
            expect(combo.itemTemplate).toBeDefined();
            expect(combo.addItemTemplate).toBeUndefined();
            expect(combo.headerItemTemplate).toBeUndefined();
        });
        it('should properly render header and footer templates', () => {
            let headerElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_HEADER}`));
            let footerElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOOTER}`));
            expect(headerElement).toBeNull();
            expect(footerElement).toBeNull();
            combo.toggle();
            fixture.detectChanges();
            expect(combo.headerTemplate).toBeDefined();
            expect(combo.footerTemplate).toBeDefined();
            const dropdownList: HTMLElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
            headerElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_HEADER}`));
            footerElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOOTER}`));
            expect(headerElement).not.toBeNull();
            const headerHTMLElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_HEADER}`)).nativeElement;
            expect(headerHTMLElement.parentNode).toEqual(dropdownList);
            expect(headerHTMLElement.textContent).toEqual('This is a header');
            expect(footerElement).not.toBeNull();
            const footerHTMLElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOOTER}`)).nativeElement;
            expect(footerHTMLElement.parentNode).toEqual(dropdownList);
            expect(footerHTMLElement.textContent).toEqual('This is a footer');
        });
        it('should render case-sensitive icon properly', () => {
            combo.showSearchCaseIcon = true;
            fixture.detectChanges();
            combo.toggle();
            fixture.detectChanges();

            let caseSensitiveIcon = fixture.debugElement.query(By.css('igx-icon[name=\'case-sensitive\']'));
            expect(caseSensitiveIcon).toBeDefined();

            combo.toggle();
            fixture.detectChanges();
            combo.showSearchCaseIcon = false;
            fixture.detectChanges();
            combo.toggle();
            fixture.detectChanges();

            caseSensitiveIcon = fixture.debugElement.query(By.css('igx-icon[name=\'case-sensitive\']'));
            expect(caseSensitiveIcon).toBeNull();
        });
    });
    describe('Positioning tests: ', () => {
        let containerElement: any;
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxComboInContainerTestComponent
                ],
                imports: [
                    IgxComboModule,
                    NoopAnimationsModule,
                    IgxToggleModule,
                    ReactiveFormsModule,
                    FormsModule
                ]
            }).compileComponents();
        }));
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxComboInContainerTestComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
            containerElement = fixture.debugElement.query(By.css('.comboContainer')).nativeElement;
            tick();
            fixture.detectChanges();
        }));
        it('should adjust combo width to the container element width when set to 100%', () => {
            const containerWidth = 500;
            const comboWrapper = fixture.debugElement.query(By.css(CSS_CLASS_COMBO)).nativeElement;
            let containerElementWidth = containerElement.getBoundingClientRect().width;
            let wrapperWidth = comboWrapper.getBoundingClientRect().width;
            expect(containerElementWidth).toEqual(containerWidth);
            expect(containerElementWidth).toEqual(wrapperWidth);

            combo.toggle();
            fixture.detectChanges();
            const inputElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP_WRAPPER}`)).nativeElement;
            const dropDownElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
            containerElementWidth = containerElement.getBoundingClientRect().width;
            wrapperWidth = comboWrapper.getBoundingClientRect().width;
            const inputWidth = inputElement.getBoundingClientRect().width;
            const dropDownWidth = dropDownElement.getBoundingClientRect().width;
            expect(containerElementWidth).toEqual(wrapperWidth);
            expect(dropDownWidth).toEqual(containerElementWidth);
            expect(inputWidth).toEqual(containerElementWidth);
        });
        it('should render combo width properly when placed in container', fakeAsync(() => {
            let comboWidth = '300px';
            const containerWidth = '500px';
            combo.width = comboWidth;
            fixture.detectChanges();

            let comboWrapper = fixture.debugElement.query(By.css(CSS_CLASS_COMBO)).nativeElement;
            let containerElementWidth = containerElement.style.width;
            let wrapperWidth = comboWrapper.style.width;
            expect(containerElementWidth).toEqual(containerWidth);
            expect(wrapperWidth).toEqual(comboWidth);

            combo.toggle();
            tick();
            fixture.detectChanges();

            let inputElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP_WRAPPER}`)).nativeElement;
            let dropDownElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
            containerElementWidth = containerElement.style.width;
            wrapperWidth = comboWrapper.style.width;
            let inputWidth = inputElement.getBoundingClientRect().width + 'px';
            let dropDownWidth = dropDownElement.getBoundingClientRect().width + 'px';
            expect(containerElementWidth).toEqual(containerWidth);
            expect(wrapperWidth).toEqual(comboWidth);
            expect(dropDownWidth).toEqual(comboWidth);
            expect(inputWidth).toEqual(comboWidth);

            combo.toggle();
            tick();
            fixture.detectChanges();

            comboWidth = '700px';
            combo.width = comboWidth;
            fixture.detectChanges();

            combo.toggle();
            tick();
            fixture.detectChanges();

            comboWrapper = fixture.debugElement.query(By.css(CSS_CLASS_COMBO)).nativeElement;
            inputElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP_WRAPPER}`)).nativeElement;
            dropDownElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
            containerElementWidth = containerElement.style.width;
            wrapperWidth = comboWrapper.style.width;
            inputWidth = inputElement.getBoundingClientRect().width + 'px';
            dropDownWidth = dropDownElement.getBoundingClientRect().width + 'px';
            expect(containerElementWidth).toEqual(containerWidth);
            expect(wrapperWidth).toEqual(comboWidth);
            expect(dropDownWidth).toEqual(comboWidth);
            expect(inputWidth).toEqual(comboWidth);
        }));
    });
    describe('Binding tests: ', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxComboSampleComponent,
                    IgxComboInContainerTestComponent,
                    IgxComboRemoteDataComponent,
                    ComboModelBindingComponent
                ],
                imports: [
                    IgxComboModule,
                    NoopAnimationsModule,
                    IgxToggleModule,
                    ReactiveFormsModule,
                    FormsModule
                ]
            }).compileComponents();
        }));
        it('should bind combo data to array of primitive data', () => {
            fixture = TestBed.createComponent(IgxComboInContainerTestComponent);
            fixture.detectChanges();
            const data = [...fixture.componentInstance.citiesData];
            combo = fixture.componentInstance.combo;
            const comboData = combo.data;
            expect(comboData).toEqual(data);
        });
        it('should bind combo data to array of objects', () => {
            fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            const data = [...fixture.componentInstance.items];
            combo = fixture.componentInstance.combo;
            const comboData = combo.data;
            expect(comboData).toEqual(data);
        });
        it('should bind combo data to remote service data', (async () => {
            let productIndex = 0;
            fixture = TestBed.createComponent(IgxComboRemoteDataComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.instance;

            const verifyComboData = () => {
                fixture.detectChanges();
                let ind = combo.virtualScrollContainer.state.startIndex;
                for (let itemIndex = 0; itemIndex < 10; itemIndex++) {
                    expect(combo.data[itemIndex].id).toEqual(ind);
                    expect(combo.data[itemIndex].product).toEqual('Product ' + ind);
                    const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
                    const dropdownItems = dropdownList.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
                    expect(dropdownItems[itemIndex].innerText.trim()).toEqual('Product ' + ind);
                    ind++;
                }
            };

            combo.toggle();
            fixture.detectChanges();
            verifyComboData();
            expect(combo.virtualizationState.startIndex).toEqual(productIndex);

            productIndex = 42;
            combo.virtualScrollContainer.scrollTo(productIndex);
            await wait();
            fixture.detectChanges();
            verifyComboData();
            // index is at bottom
            expect(combo.virtualizationState.startIndex + combo.virtualizationState.chunkSize - 1)
                .toEqual(productIndex);

            productIndex = 485;
            combo.virtualScrollContainer.scrollTo(productIndex);
            await wait(30);
            fixture.detectChanges();
            verifyComboData();
            expect(combo.virtualizationState.startIndex + combo.virtualizationState.chunkSize - 1)
                .toEqual(productIndex);

            productIndex = 873;
            combo.virtualScrollContainer.scrollTo(productIndex);
            await wait();
            fixture.detectChanges();
            verifyComboData();

            productIndex = 649;
            combo.virtualScrollContainer.scrollTo(productIndex);
            await wait();
            fixture.detectChanges();
            verifyComboData();
        }));
        it('should bind combo data to remote data and clear selection properly', (async () => {
            fixture = TestBed.createComponent(IgxComboRemoteDataComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.instance;
            let selectedItems = [combo.data[0], combo.data[1]];
            const spyObj = jasmine.createSpyObj('event', ['stopPropagation']);
            combo.toggle();
            combo.selectItems([selectedItems[0][combo.valueKey], selectedItems[1][combo.valueKey]]);
            expect(combo.value).toEqual(`${selectedItems[0][combo.displayKey]}, ${selectedItems[1][combo.displayKey]}`);
            expect(combo.selectedItems()).toEqual([selectedItems[0][combo.valueKey], selectedItems[1][combo.valueKey]]);
            // Clear items while they are in view
            combo.handleClearItems(spyObj);
            expect(combo.selectedItems()).toEqual([]);
            expect(combo.value).toBe('');
            selectedItems = [combo.data[2], combo.data[3]];
            combo.selectItems([selectedItems[0][combo.valueKey], selectedItems[1][combo.valueKey]]);
            expect(combo.value).toEqual(`${selectedItems[0][combo.displayKey]}, ${selectedItems[1][combo.displayKey]}`);

            // Scroll selected items out of view
            combo.virtualScrollContainer.scrollTo(40);
            await wait();
            fixture.detectChanges();
            combo.handleClearItems(spyObj);
            expect(combo.selectedItems()).toEqual([]);
            expect(combo.value).toBe('');
            combo.selectItems([combo.data[7][combo.valueKey]]);
            expect(combo.value).toBe(combo.data[7][combo.displayKey]);
        }));
        it('should render empty template when combo data source is not set', () => {
            fixture = TestBed.createComponent(IgxComboInContainerTestComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
            combo.data = [];
            fixture.detectChanges();
            combo.toggle();
            fixture.detectChanges();
            const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
            const dropdownItemsContainer = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`)).nativeElement;
            const dropDownContainer = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
            const listItems = dropDownContainer.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
            expect(listItems.length).toEqual(0);
            expect(dropdownList.childElementCount).toEqual(3);
            // Expect no items to be rendered in the virtual container
            expect(dropdownItemsContainer.children[0].childElementCount).toEqual(0);
            // Expect the list child (NOT COMBO ITEM) to be a container with "The list is empty";
            const dropdownItem = dropdownList.lastElementChild as HTMLElement;
            expect(dropdownItem.firstElementChild.textContent).toEqual('The list is empty');
        });
        it('should bind combo data properly when changing data source runtime', () => {
            const newData = ['Item 1', 'Item 2'];
            fixture = TestBed.createComponent(IgxComboInContainerTestComponent);
            fixture.detectChanges();
            const data = [...fixture.componentInstance.citiesData];
            combo = fixture.componentInstance.combo;
            expect(combo.data).toEqual(data);
            combo.data = newData;
            fixture.detectChanges();
            expect(combo.data).toEqual(newData);
        });
        it('should properly bind to object value w/ valueKey', fakeAsync(() => {
            fixture = TestBed.createComponent(ComboModelBindingComponent);
            fixture.detectChanges();
            tick();
            const component = fixture.componentInstance;
            combo = fixture.componentInstance.combo;
            combo.valueKey = 'id';
            component.selectedItems = [0, 2];
            fixture.detectChanges();
            tick();
            expect(combo.selectedItems()).toEqual([combo.data[0][combo.valueKey], combo.data[2][combo.valueKey]]);
            combo.selectItems([combo.data[4][combo.valueKey]]);
            fixture.detectChanges();
            expect(component.selectedItems).toEqual([0, 2, 4]);
        }));
        it('should properly bind to object value w/o valueKey', fakeAsync(() => {
            fixture = TestBed.createComponent(ComboModelBindingComponent);
            fixture.detectChanges();
            tick();
            const component = fixture.componentInstance;
            combo = fixture.componentInstance.combo;
            component.selectedItems = [component.items[0], component.items[2]];
            fixture.detectChanges();
            tick();
            expect(combo.selectedItems()).toEqual([combo.data[0], combo.data[2]]);
            combo.selectItems([combo.data[4]]);
            fixture.detectChanges();
            expect(component.selectedItems).toEqual([combo.data[0], combo.data[2], combo.data[4]]);
        }));
        it('should properly bind to values w/o valueKey', fakeAsync(() => {
            fixture = TestBed.createComponent(ComboModelBindingComponent);
            fixture.detectChanges();
            const component = fixture.componentInstance;
            combo = fixture.componentInstance.combo;
            component.items = ['One', 'Two', 'Three', 'Four', 'Five'];
            component.selectedItems = ['One', 'Two'];
            fixture.detectChanges();
            tick();
            const data = fixture.componentInstance.items;
            expect(combo.selectedItems()).toEqual(component.selectedItems);
            combo.selectItems([...data].splice(1, 3), true);
            fixture.detectChanges();
            expect(fixture.componentInstance.selectedItems).toEqual([...data].splice(1, 3));
        }));
    });
    describe('Dropdown tests: ', () => {
        describe('complex data dropdown: ', () => {
            let dropdown: IgxComboDropDownComponent;
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxComboSampleComponent
                    ],
                    imports: [
                        IgxComboModule,
                        NoopAnimationsModule,
                        IgxToggleModule,
                        ReactiveFormsModule,
                        FormsModule
                    ]
                }).compileComponents();
            }));
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxComboSampleComponent);
                fixture.detectChanges();
                combo = fixture.componentInstance.combo;
                dropdown = combo.dropdown;
                input = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP}`));
            }));
            it('should properly call dropdown navigatePrev method', fakeAsync(() => {
                expect(dropdown.focusedItem).toBeFalsy();
                expect(dropdown.focusedItem).toEqual(null);
                expect(combo.collapsed).toBeTruthy();
                combo.toggle();
                tick();
                fixture.detectChanges();
                expect(document.activeElement).toEqual(combo.searchInputElement.nativeElement);
                expect(combo.collapsed).toBeFalsy();
                combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'ArrowDown'));
                fixture.detectChanges();
                expect(dropdown.focusedItem).toBeTruthy();
                expect(dropdown.focusedItem.itemIndex).toEqual(0);
                expect(combo.virtualizationState.startIndex).toEqual(0);
                dropdown.navigatePrev();
                tick();
                fixture.detectChanges();
                expect(document.activeElement).toEqual(combo.searchInputElement.nativeElement);
                combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'ArrowDown'));
                fixture.detectChanges();
                expect(dropdown.focusedItem).toBeTruthy();
                expect(dropdown.focusedItem.itemIndex).toEqual(0);
                dropdown.navigateNext();
                tick();
                fixture.detectChanges();
                expect(dropdown.focusedItem).toBeTruthy();
                expect(dropdown.focusedItem.itemIndex).toEqual(1);
                expect(combo.virtualizationState.startIndex).toEqual(0);
                spyOn(dropdown, 'navigatePrev').and.callThrough();
                dropdown.navigatePrev();
                tick();
                expect(dropdown.focusedItem).toBeTruthy();
                expect(dropdown.focusedItem.itemIndex).toEqual(0);
                expect(combo.virtualizationState.startIndex).toEqual(0);
                expect(dropdown.navigatePrev).toHaveBeenCalledTimes(1);
            }));
            it('should properly call dropdown navigateNext with virtual items', (async () => {
                expect(combo).toBeDefined();
                expect(dropdown).toBeDefined();
                expect(dropdown.focusedItem).toBeFalsy();
                expect(combo.virtualScrollContainer).toBeDefined();
                const mockClick = jasmine.createSpyObj('event', ['preventDefault', 'stopPropagation']);
                const virtualMockUP = spyOn<any>(dropdown, 'navigatePrev').and.callThrough();
                const virtualMockDOWN = spyOn<any>(dropdown, 'navigateNext').and.callThrough();
                expect(dropdown.focusedItem).toEqual(null);
                expect(combo.collapsed).toBeTruthy();
                combo.toggle();
                await wait(30);
                fixture.detectChanges();
                expect(combo.collapsed).toBeFalsy();
                combo.virtualScrollContainer.scrollTo(51);
                await wait(30);
                fixture.detectChanges();
                let items = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`));
                let lastItem = items[items.length - 1].componentInstance;
                expect(lastItem).toBeDefined();
                lastItem.clicked(mockClick);
                await wait(30);
                fixture.detectChanges();
                expect(dropdown.focusedItem).toEqual(lastItem);
                dropdown.navigateItem(-1);
                await wait(30);
                fixture.detectChanges();
                expect(virtualMockDOWN).toHaveBeenCalledTimes(0);
                lastItem.clicked(mockClick);
                await wait(30);
                fixture.detectChanges();
                expect(dropdown.focusedItem).toEqual(lastItem);
                dropdown.navigateNext();
                await wait(30);
                fixture.detectChanges();
                expect(virtualMockDOWN).toHaveBeenCalledTimes(1);
                combo.searchValue = 'New';
                combo.handleInputChange();
                fixture.detectChanges();
                await wait(30);
                items = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`));
                lastItem = items[items.length - 1].componentInstance;
                (lastItem as IgxComboAddItemComponent).clicked(mockClick);
                await wait(30);
                fixture.detectChanges();
                // After `Add Item` is clicked, the input is focused and the item is added to the list
                // expect(dropdown.focusedItem).toEqual(null);
                expect(document.activeElement).toEqual(combo.searchInputElement.nativeElement);
                expect(combo.customValueFlag).toBeFalsy();
                expect(combo.searchInputElement.nativeElement.value).toBeTruthy();

                // TEST move from first item
                combo.virtualScrollContainer.scrollTo(0);
                await wait();
                fixture.detectChanges();
                const firstItem = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`))[0].componentInstance;
                firstItem.clicked(mockClick);
                await wait(30);
                fixture.detectChanges();
                expect(dropdown.focusedItem).toEqual(firstItem);
                expect(dropdown.focusedItem.itemIndex).toEqual(0);
                // spyOnProperty(dropdown, 'focusedItem', 'get').and.returnValue(firstItem);
                dropdown.navigateFirst();
                await wait(30);
                fixture.detectChanges();
                dropdown.navigatePrev();
                await wait(30);
                fixture.detectChanges();
                // Called once before the `await` and called once more, because item @ index 0 is a header
                expect(virtualMockUP).toHaveBeenCalledTimes(2);
            }));
            it('should properly get the first focusable item when focusing the component list', () => {
                const expectedItemText = 'State: MichiganRegion: East North Central';
                combo.toggle();
                fixture.detectChanges();
                combo.dropdown.onFocus();
                fixture.detectChanges();
                (document.getElementsByClassName(CSS_CLASS_CONTENT)[0] as HTMLElement).focus();
                expect(combo.dropdown.focusedItem.element.nativeElement.textContent.trim()).toEqual(expectedItemText);
            });
            it('should focus item when onFocus and onBlur are called', () => {
                expect(dropdown.focusedItem).toEqual(null);
                expect(dropdown.items.length).toEqual(9);
                dropdown.toggle();
                fixture.detectChanges();
                expect(dropdown.items).toBeDefined();
                expect(dropdown.items.length).toBeTruthy();
                dropdown.onFocus();
                expect(dropdown.focusedItem).toEqual(dropdown.items[0]);
                expect(dropdown.focusedItem.focused).toEqual(true);
                dropdown.onFocus();
                dropdown.onBlur();
                expect(dropdown.focusedItem).toEqual(null);
                dropdown.onBlur();
            });
            it('should properly handle dropdown.focusItem', fakeAsync(() => {
                combo.toggle();
                tick();
                fixture.detectChanges();
                const virtualSpyUP = spyOn(dropdown, 'navigatePrev');
                const virtualSpyDOWN = spyOn(dropdown, 'navigateNext');
                spyOn(IgxComboDropDownComponent.prototype, 'navigateItem').and.callThrough();
                dropdown.navigateItem(0);
                fixture.detectChanges();
                expect(IgxComboDropDownComponent.prototype.navigateItem).toHaveBeenCalledTimes(1);
                dropdown.navigatePrev();
                expect(IgxComboDropDownComponent.prototype.navigateItem).toHaveBeenCalledTimes(1);
                dropdown.navigateItem(dropdown.items.length - 1);
                dropdown.navigateNext();
                expect(IgxComboDropDownComponent.prototype.navigateItem).toHaveBeenCalledTimes(2);
                expect(virtualSpyDOWN).toHaveBeenCalled();
                expect(virtualSpyUP).toHaveBeenCalled();
            }));
            it('should handle keyboard events', fakeAsync(() => {
                combo.toggle();
                tick();
                fixture.detectChanges();
                spyOn(combo, 'selectAllItems');
                spyOn(combo, 'toggle');
                spyOn(combo.dropdown, 'onFocus').and.callThrough();
                combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'A'));
                combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', null));
                expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
                expect(combo.dropdown.onFocus).toHaveBeenCalledTimes(0);
                combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'Enter'));
                expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
                spyOnProperty(combo, 'filteredData', 'get').and.returnValue([1]);
                combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'Enter'));
                expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
                combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'ArrowDown'));
                expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
                // expect(combo.dropdown.onFocus).toHaveBeenCalledTimes(1);
                combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'Escape'));
                expect(combo.toggle).toHaveBeenCalledTimes(1);
            }));
            it('should toggle combo dropdown on toggle button click', fakeAsync(() => {
                spyOn(combo, 'toggle').and.callThrough();
                input.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(combo.collapsed).toEqual(false);
                expect(combo.toggle).toHaveBeenCalledTimes(1);
                expect(document.activeElement).toEqual(combo.searchInput.nativeElement);

                input.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(combo.collapsed).toEqual(true);
                expect(combo.toggle).toHaveBeenCalledTimes(2);
            }));
            it('should toggle dropdown list with arrow down/up keys', fakeAsync(() => {
                spyOn(combo, 'open').and.callThrough();
                spyOn(combo, 'close').and.callThrough();

                combo.onArrowDown(UIInteractions.getKeyboardEvent('keydown', 'ArrowDown'));
                tick();
                fixture.detectChanges();
                expect(combo.open).toHaveBeenCalledTimes(1);

                combo.onArrowDown(UIInteractions.getKeyboardEvent('keydown', 'ArrowDown', true));
                tick();
                fixture.detectChanges();
                expect(combo.collapsed).toEqual(false);
                expect(combo.open).toHaveBeenCalledTimes(2);

                combo.handleKeyDown(UIInteractions.getKeyboardEvent('keydown', 'ArrowUp'));
                tick();
                fixture.detectChanges();
                expect(combo.close).toHaveBeenCalledTimes(1);

                combo.handleKeyDown(UIInteractions.getKeyboardEvent('keydown', 'ArrowUp', true));
                fixture.detectChanges();
                tick();
                expect(combo.close).toHaveBeenCalledTimes(2);
            }));
            it('should select/focus dropdown list items with space/up and down arrow keys', () => {
                let selectedItemsCount = 0;
                combo.toggle();
                fixture.detectChanges();

                const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
                const dropdownItems = dropdownList.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
                const dropdownContent = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));
                let focusedItems = dropdownList.querySelectorAll(`.${CSS_CLASS_FOCUSED}`);
                let selectedItems = dropdownList.querySelectorAll(`.${CSS_CLASS_SELECTED}`);
                expect(focusedItems.length).toEqual(0);
                expect(selectedItems.length).toEqual(0);

                const focusAndVerifyItem = (itemIndex: number, key: string) => {
                    UIInteractions.triggerEventHandlerKeyDown(key, dropdownContent);
                    fixture.detectChanges();
                    focusedItems = dropdownList.querySelectorAll(`.${CSS_CLASS_FOCUSED}`);
                    expect(focusedItems.length).toEqual(1);
                    expect(focusedItems[0]).toEqual(dropdownItems[itemIndex]);
                };

                const selectAndVerifyItem = (itemIndex: number) => {
                    UIInteractions.triggerEventHandlerKeyDown('Space', dropdownContent);
                    fixture.detectChanges();
                    selectedItems = dropdownList.querySelectorAll(`.${CSS_CLASS_SELECTED}`);
                    expect(selectedItems.length).toEqual(selectedItemsCount);
                    expect(selectedItems).toContain(dropdownItems[itemIndex]);
                };

                focusAndVerifyItem(0, 'ArrowDown');
                selectedItemsCount++;
                selectAndVerifyItem(0);

                for (let index = 1; index < 7; index++) {
                    focusAndVerifyItem(index, 'ArrowDown');
                }
                selectedItemsCount++;
                selectAndVerifyItem(6);

                for (let index = 5; index > 3; index--) {
                    focusAndVerifyItem(index, 'ArrowUp');
                }
                selectedItemsCount++;
                selectAndVerifyItem(4);
            });
            it('should properly navigate using HOME/END key', (async () => {
                let firstVisibleItem: Element;
                combo.toggle();
                fixture.detectChanges();
                const dropdownContent = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));
                const scrollbar = fixture.debugElement.query(By.css(`.${CSS_CLASS_SCROLLBAR_VERTICAL}`)).nativeElement as HTMLElement;
                expect(scrollbar.scrollTop).toEqual(0);
                // Scroll to bottom;
                UIInteractions.triggerEventHandlerKeyDown('End', dropdownContent);
                await wait(30);
                fixture.detectChanges();
                // Content was scrolled to bottom
                expect(scrollbar.scrollHeight - scrollbar.scrollTop).toEqual(scrollbar.clientHeight);

                // Scroll to top
                UIInteractions.triggerEventHandlerKeyDown('Home', dropdownContent);
                await wait(30);
                fixture.detectChanges();
                const dropdownContainer: HTMLElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
                firstVisibleItem = dropdownContainer.querySelector(`.${CSS_CLASS_DROPDOWNLISTITEM}` + ':first-child');
                // Container is scrolled to top
                expect(scrollbar.scrollTop).toEqual(32);

                // First item is focused
                expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', dropdownContent);
                fixture.detectChanges();
                firstVisibleItem = dropdownContainer.querySelector(`.${CSS_CLASS_DROPDOWNLISTITEM}` + ':first-child');

                // Scroll has not change
                expect(scrollbar.scrollTop).toEqual(32);
                // First item is no longer focused
                expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
                UIInteractions.triggerEventHandlerKeyDown('Home', dropdownContent);
                fixture.detectChanges();
                expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
            }));
        });
        describe('primitive data dropdown: ', () => {
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxComboInContainerTestComponent
                    ],
                    imports: [
                        IgxComboModule,
                        NoopAnimationsModule,
                        IgxToggleModule,
                        ReactiveFormsModule,
                        FormsModule
                    ]
                }).compileComponents();
            }));
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxComboInContainerTestComponent);
                fixture.detectChanges();
                combo = fixture.componentInstance.combo;
                input = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP}`));
            }));
            it('should properly navigate with HOME/END keys when no virtScroll is necessary', (async () => {
                let firstVisibleItem: Element;
                combo.toggle();
                fixture.detectChanges();
                const dropdownContent = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));
                const scrollbar = fixture.debugElement.query(By.css(`.${CSS_CLASS_SCROLLBAR_VERTICAL}`))
                    .nativeElement as HTMLElement;
                expect(scrollbar.scrollTop).toEqual(0);
                // Scroll to bottom;
                UIInteractions.triggerEventHandlerKeyDown('End', dropdownContent);
                await wait();
                fixture.detectChanges();
                // Content was scrolled to bottom
                expect(scrollbar.scrollHeight - scrollbar.scrollTop).toEqual(scrollbar.clientHeight);

                // Scroll to top
                UIInteractions.triggerEventHandlerKeyDown('Home', dropdownContent);
                await wait(30);
                fixture.detectChanges();
                const dropdownContainer: HTMLElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
                firstVisibleItem = dropdownContainer.querySelector(`.${CSS_CLASS_DROPDOWNLISTITEM}` + ':first-child');
                // Container is scrolled to top
                expect(scrollbar.scrollTop).toEqual(0);

                // First item is focused
                expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', dropdownContent);
                fixture.detectChanges();
                firstVisibleItem = dropdownContainer.querySelector(`.${CSS_CLASS_DROPDOWNLISTITEM}` + ':first-child');

                // Scroll has not change
                expect(scrollbar.scrollTop).toEqual(0);
                // First item is no longer focused
                expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
                UIInteractions.triggerEventHandlerKeyDown('Home', dropdownContent);
                fixture.detectChanges();
                expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
            }));
        });
    });
    describe('Virtualization tests: ', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxComboSampleComponent
                ],
                imports: [
                    IgxComboModule,
                    NoopAnimationsModule,
                    IgxToggleModule,
                    ReactiveFormsModule,
                    FormsModule
                ]
            }).compileComponents();
        }));
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
        }));
        it('should properly return a reference to the VirtScrollContainer', () => {
            expect(combo.dropdown.element).toBeDefined();
            const mockScroll = spyOnProperty<any>(combo.dropdown, 'scrollContainer', 'get').and.callThrough();
            const mockFunc = () => mockScroll();
            expect(mockFunc).toThrow();
            combo.toggle();
            fixture.detectChanges();
            expect(combo.dropdown.element).toBeDefined();
            expect(mockFunc).toBeDefined();
        });
        it('should restore position of dropdown scroll after opening', (async () => {
            const virtDir = combo.virtualScrollContainer;
            spyOn(combo.dropdown, 'onToggleOpening').and.callThrough();
            spyOn(combo.dropdown, 'onToggleOpened').and.callThrough();
            spyOn(combo.dropdown, 'onToggleClosing').and.callThrough();
            spyOn(combo.dropdown, 'onToggleClosed').and.callThrough();
            combo.toggle();
            await wait(30);
            fixture.detectChanges();
            expect(combo.collapsed).toEqual(false);
            expect(combo.dropdown.onToggleOpening).toHaveBeenCalledTimes(1);
            expect(combo.dropdown.onToggleOpened).toHaveBeenCalledTimes(1);
            let vContainerScrollHeight = virtDir.getScroll().scrollHeight;
            expect(virtDir.getScroll().scrollTop).toEqual(0);
            expect(vContainerScrollHeight).toBeGreaterThan(combo.itemHeight);
            virtDir.getScroll().scrollTop = Math.floor(vContainerScrollHeight / 2);
            await wait(30);
            fixture.detectChanges();
            expect(virtDir.getScroll().scrollTop).toBeGreaterThan(0);
            UIInteractions.simulateClickEvent(document.documentElement);
            await wait(10);
            fixture.detectChanges();
            expect(combo.collapsed).toEqual(true);
            expect(combo.dropdown.onToggleClosing).toHaveBeenCalledTimes(1);
            expect(combo.dropdown.onToggleClosed).toHaveBeenCalledTimes(1);
            combo.toggle();
            await wait(30);
            fixture.detectChanges();
            expect(combo.collapsed).toEqual(false);
            expect(combo.dropdown.onToggleOpening).toHaveBeenCalledTimes(2);
            expect(combo.dropdown.onToggleOpened).toHaveBeenCalledTimes(2);
            vContainerScrollHeight = virtDir.getScroll().scrollHeight;
            expect(virtDir.getScroll().scrollTop).toEqual(vContainerScrollHeight / 2);
        }));
        it('should display vertical scrollbar properly', () => {
            combo.toggle();
            fixture.detectChanges();
            const scrollbarContainer = fixture.debugElement
                .query(By.css(`.${CSS_CLASS_SCROLLBAR_VERTICAL}`))
                .nativeElement as HTMLElement;
            let hasScrollbar = scrollbarContainer.scrollHeight > scrollbarContainer.clientHeight;
            expect(hasScrollbar).toBeTruthy();

            combo.data = [{ field: 'Mid-Atlantic', region: 'New Jersey' }, { field: 'Mid-Atlantic', region: 'New York' }];
            fixture.detectChanges();
            combo.toggle();
            fixture.detectChanges();
            hasScrollbar = scrollbarContainer.scrollHeight > scrollbarContainer.clientHeight;
            expect(hasScrollbar).toBeFalsy();
        });
        it('should preserve selection on scrolling', (async () => {
            combo.toggle();
            fixture.detectChanges();
            const scrollbar = fixture.debugElement.query(By.css(`.${CSS_CLASS_SCROLLBAR_VERTICAL}`)).nativeElement as HTMLElement;
            expect(scrollbar.scrollTop).toEqual(0);

            combo.virtualScrollContainer.scrollTo(16);
            await wait(30);
            fixture.detectChanges();
            let selectedItem = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`))[1];
            selectedItem.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();
            expect(selectedItem.classes[CSS_CLASS_SELECTED]).toEqual(true);
            const selectedItemText = selectedItem.nativeElement.textContent;

            const dropdownContent = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));
            UIInteractions.triggerEventHandlerKeyDown('End', dropdownContent);
            await wait(30);
            fixture.detectChanges();
            // Content was scrolled to bottom
            expect(scrollbar.scrollHeight - scrollbar.scrollTop).toEqual(scrollbar.clientHeight);

            combo.virtualScrollContainer.scrollTo(5);
            await wait(30);
            fixture.detectChanges();
            selectedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_SELECTED}`));
            expect(selectedItem.nativeElement.textContent).toEqual(selectedItemText);

            combo.toggle();
            await wait(10);
            fixture.detectChanges();
            expect(combo.collapsed).toBeTruthy();
            combo.toggle();
            await wait(10);
            fixture.detectChanges();
            expect(combo.collapsed).toBeFalsy();
            selectedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_SELECTED}`));
            expect(selectedItem.nativeElement.textContent).toEqual(selectedItemText);
        }));
    });
    describe('Selection tests: ', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxComboSampleComponent
                ],
                imports: [
                    IgxComboModule,
                    NoopAnimationsModule,
                    IgxToggleModule,
                    ReactiveFormsModule,
                    FormsModule
                ]
            }).compileComponents();
        }));
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
            input = fixture.debugElement.query(By.css(`.${CSS_CLASS_COMBO_INPUTGROUP}`));
        });
        const simulateComboItemCheckboxClick = (itemIndex: number, isHeader = false) => {
            const itemClass = isHeader ? CSS_CLASS_HEADERITEM : CSS_CLASS_DROPDOWNLISTITEM;
            const dropdownItem = fixture.debugElement.queryAll(By.css('.' + itemClass))[itemIndex];
            dropdownItem.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();
        };
        it('should append/remove selected items to the input in their selection order', () => {
            let expectedOutput = 'Illinois';
            combo.selectItems(['Illinois']);
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual(expectedOutput);

            expectedOutput += ', Mississippi';
            combo.selectItems(['Mississippi']);
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual(expectedOutput);

            expectedOutput += ', Ohio';
            combo.selectItems(['Ohio']);
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual(expectedOutput);

            expectedOutput += ', Arkansas';
            combo.selectItems(['Arkansas']);
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual(expectedOutput);

            expectedOutput = 'Illinois, Mississippi, Arkansas';
            combo.deselectItems(['Ohio']);
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual(expectedOutput);

            expectedOutput += ', Florida';
            combo.selectItems(['Florida'], false);
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual(expectedOutput);

            expectedOutput = 'Mississippi, Arkansas, Florida';
            combo.deselectItems(['Illinois']);
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual(expectedOutput);
        });
        it('should dismiss all selected items by pressing clear button', () => {
            const expectedOutput = 'Kentucky, Ohio, Indiana';
            combo.selectItems(['Kentucky', 'Ohio', 'Indiana']);
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual(expectedOutput);
            combo.toggle();
            fixture.detectChanges();
            expect(combo.dropdown.items[1].selected).toBeTruthy();
            expect(combo.dropdown.items[4].selected).toBeTruthy();
            expect(combo.dropdown.items[6].selected).toBeTruthy();

            const clearBtn = fixture.debugElement.query(By.css(`.${CSS_CLASS_CLEARBUTTON}`));
            clearBtn.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();

            expect(input.nativeElement.value).toEqual('');
            expect(combo.selectedItems().length).toEqual(0);
            combo.toggle();
            fixture.detectChanges();
            expect(combo.dropdown.items[1].selected).toBeFalsy();
            expect(combo.dropdown.items[4].selected).toBeFalsy();
            expect(combo.dropdown.items[6].selected).toBeFalsy();
        });
        it('should show/hide clear button after selecting/deselecting items', () => {
            // This is a workaround for issue github.com/angular/angular/issues/14235
            // Expecting existing DebugElement toBeFalsy creates circular reference in Jasmine
            expect(fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_CLEARBUTTON}`)).length).toBeFalsy();

            // Open dropdown and select an item
            combo.selectItems(['Maryland']);
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_CLEARBUTTON}`)).length).toEqual(1);

            combo.deselectItems(['Maryland']);
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_CLEARBUTTON}`)).length).toEqual(0);

            combo.selectItems(['Oklahome']);
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_CLEARBUTTON}`)).length).toEqual(1);

            combo.selectItems(['Wisconsin']);
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_CLEARBUTTON}`)).length).toEqual(1);

            // Clear selected items
            const clearButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_CLEARBUTTON}`));
            clearButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_CLEARBUTTON}`)).length).toBeFalsy();
        });
        it('should select/deselect item on check/uncheck', () => {
            const dropdown = combo.dropdown;
            spyOn(combo.selectionChange, 'emit').and.callThrough();
            combo.toggle();
            fixture.detectChanges();

            const selectedItem_1 = dropdown.items[1];
            simulateComboItemCheckboxClick(1);
            expect(combo.selectedItems()[0]).toEqual(selectedItem_1.value.field);
            expect(selectedItem_1.selected).toBeTruthy();
            expect(selectedItem_1.element.nativeElement.classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
            expect(combo.selectionChange.emit).toHaveBeenCalledTimes(1);
            expect(combo.selectionChange.emit).toHaveBeenCalledWith(
                {
                    newSelection: [selectedItem_1.value[combo.valueKey]],
                    oldSelection: [],
                    added: [selectedItem_1.value[combo.valueKey]],
                    removed: [],
                    event: UIInteractions.getMouseEvent('click'),
                    owner: combo,
                    displayText: selectedItem_1.value[combo.valueKey],
                    cancel: false
                });

            const selectedItem_2 = dropdown.items[5];
            simulateComboItemCheckboxClick(5);
            expect(combo.selectedItems()[1]).toEqual(selectedItem_2.value.field);
            expect(selectedItem_2.selected).toBeTruthy();
            expect(selectedItem_2.element.nativeElement.classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
            expect(combo.selectionChange.emit).toHaveBeenCalledTimes(2);
            expect(combo.selectionChange.emit).toHaveBeenCalledWith(
                {
                    newSelection: [selectedItem_1.value[combo.valueKey], selectedItem_2.value[combo.valueKey]],
                    oldSelection: [selectedItem_1.value[combo.valueKey]],
                    added: [selectedItem_2.value[combo.valueKey]],
                    removed: [],
                    event: UIInteractions.getMouseEvent('click'),
                    owner: combo,
                    displayText: selectedItem_1.value[combo.valueKey] + ', ' + selectedItem_2.value[combo.valueKey],
                    cancel: false
                });

            // Unselecting an item
            const unselectedItem = dropdown.items[1];
            simulateComboItemCheckboxClick(1);
            expect(combo.selectedItems().length).toEqual(1);
            expect(unselectedItem.selected).toBeFalsy();
            expect(unselectedItem.element.nativeElement.classList.contains(CSS_CLASS_SELECTED)).toBeFalsy();
            expect(combo.selectionChange.emit).toHaveBeenCalledTimes(3);
            expect(combo.selectionChange.emit).toHaveBeenCalledWith(
                {
                    newSelection: [selectedItem_2.value[combo.valueKey]],
                    oldSelection: [selectedItem_1.value[combo.valueKey], selectedItem_2.value[combo.valueKey]],
                    added: [],
                    removed: [unselectedItem.value[combo.valueKey]],
                    event: UIInteractions.getMouseEvent('click'),
                    owner: combo,
                    displayText: selectedItem_2.value[combo.valueKey],
                    cancel: false
                });
        });
        it('should not be able to select group header', () => {
            spyOn(combo.selectionChange, 'emit').and.callThrough();
            combo.toggle();
            fixture.detectChanges();

            simulateComboItemCheckboxClick(0, true);
            expect(combo.selectedItems().length).toEqual(0);
            expect(combo.selectionChange.emit).toHaveBeenCalledTimes(0);
        });
    });
    describe('Grouping tests: ', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxComboSampleComponent
                ],
                imports: [
                    IgxComboModule,
                    NoopAnimationsModule,
                    IgxToggleModule,
                    ReactiveFormsModule,
                    FormsModule
                ]
            }).compileComponents();
        }));
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
            input = fixture.debugElement.query(By.css(`.${CSS_CLASS_COMBO_INPUTGROUP}`));
        });
        it('should group items correctly', fakeAsync(() => {
            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(combo.groupKey).toEqual('region');
            expect(combo.dropdown.items[0].value.field === combo.data[0].field).toBeFalsy();
            const listItems = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`));
            const listHeaders = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_HEADERITEM}`));
            expect(listItems.length).toBeGreaterThan(0);
            expect(listHeaders.length).toBeGreaterThan(0);
            expect(listHeaders[0].nativeElement.innerHTML).toContain('East North Central');

            combo.groupKey = '';
            fixture.detectChanges();
            // First item is regular item
            expect(combo.dropdown.items[0].value).toEqual(combo.data[0]);
        }));
        it('should properly handle click events on disabled/header items', fakeAsync(() => {
            spyOn(combo.dropdown, 'selectItem').and.callThrough();
            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(combo.collapsed).toBeFalsy();
            expect(combo.dropdown.headers).toBeDefined();
            expect(combo.dropdown.headers.length).toEqual(2);
            (combo.dropdown.headers[0] as IgxComboItemComponent).clicked(null);
            fixture.detectChanges();

            const mockObj = jasmine.createSpyObj('nativeElement', ['focus']);
            spyOnProperty(combo.dropdown, 'focusedItem', 'get').and.returnValue({ element: { nativeElement: mockObj } });
            (combo.dropdown.headers[0] as IgxComboItemComponent).clicked(null);
            fixture.detectChanges();
            expect(mockObj.focus).not.toHaveBeenCalled(); // Focus only if `allowItemFocus === true`

            combo.dropdown.items[0].clicked(null);
            fixture.detectChanges();
            expect(document.activeElement).toEqual(combo.searchInputElement.nativeElement);
        }));
        it('should properly add items to the defaultFallbackGroup', () => {
            combo.allowCustomValues = true;
            combo.toggle();
            fixture.detectChanges();
            const fallBackGroup = combo.defaultFallbackGroup;
            const initialDataLength = combo.data.length + 0;
            expect(combo.filteredData.filter((e) => e[combo.groupKey] === undefined)).toEqual([]);
            combo.searchValue = 'My Custom Item 1';
            combo.addItemToCollection();
            combo.searchValue = 'My Custom Item 2';
            combo.addItemToCollection();
            combo.searchValue = 'My Custom Item 3';
            combo.addItemToCollection();
            const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));
            UIInteractions.triggerInputEvent(searchInput, 'My Custom Item');
            fixture.detectChanges();
            expect(combo.data.length).toEqual(initialDataLength + 3);
            expect(combo.dropdown.items.length).toEqual(4); // Add Item button is included
            expect(combo.dropdown.headers.length).toEqual(1);
            expect(combo.dropdown.headers[0].element.nativeElement.innerText).toEqual(fallBackGroup);
        });
    });
    describe('Filtering tests: ', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxComboSampleComponent
                ],
                imports: [
                    IgxComboModule,
                    NoopAnimationsModule,
                    IgxToggleModule,
                    ReactiveFormsModule,
                    FormsModule
                ]
            }).compileComponents();
        }));
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
            input = fixture.debugElement.query(By.css(`.${CSS_CLASS_COMBO_INPUTGROUP}`));
        });
        it('should properly get/set filteredData', () => {
            combo.toggle();
            fixture.detectChanges();
            const initialData = [...combo.filteredData];
            expect(combo.searchValue).toEqual('');

            const filterSpy = spyOn(IgxComboFilteringPipe.prototype, 'transform').and.callThrough();
            combo.searchValue = 'New ';
            combo.handleInputChange();
            fixture.detectChanges();
            expect(filterSpy).toHaveBeenCalledTimes(1);
            expect(combo.filteredData.length).toBeLessThan(initialData.length);

            const firstFilter = [...combo.filteredData];
            combo.searchValue += '  ';
            combo.handleInputChange();
            fixture.detectChanges();
            expect(combo.filteredData.length).toBeLessThan(initialData.length);
            expect(filterSpy).toHaveBeenCalledTimes(2);

            combo.searchValue = '';
            combo.handleInputChange();
            fixture.detectChanges();
            expect(combo.filteredData.length).toEqual(initialData.length);
            expect(combo.filteredData.length).toBeGreaterThan(firstFilter.length);
            expect(filterSpy).toHaveBeenCalledTimes(3);
            expect(combo.filteredData.length).toEqual(initialData.length);
        });
        it('should properly select/deselect filteredData', () => {
            combo.toggle();
            fixture.detectChanges();
            const initialData = [...combo.filteredData];
            expect(combo.searchValue).toEqual('');

            const filterSpy = spyOn(IgxComboFilteringPipe.prototype, 'transform').and.callThrough();
            combo.searchValue = 'New ';
            combo.handleInputChange();
            fixture.detectChanges();
            expect(filterSpy).toHaveBeenCalledTimes(1);
            expect(combo.filteredData.length).toBeLessThan(initialData.length);
            expect(combo.filteredData.length).toEqual(4);

            combo.selectAllItems();
            fixture.detectChanges();
            expect(combo.selectedItems().length).toEqual(4);

            combo.selectAllItems(true);
            fixture.detectChanges();
            expect(combo.selectedItems().length).toEqual(51);

            combo.deselectAllItems();
            fixture.detectChanges();
            expect(combo.selectedItems().length).toEqual(47);

            combo.deselectAllItems(true);
            fixture.detectChanges();
            expect(combo.selectedItems().length).toEqual(0);
        });
        it('should properly handle addItemToCollection calls (Complex data)', () => {
            const initialData = [...combo.data];
            expect(combo.searchValue).toEqual('');
            combo.addItemToCollection();
            fixture.detectChanges();
            expect(initialData).toEqual(combo.data);
            expect(combo.data.length).toEqual(initialData.length);
            combo.searchValue = 'myItem';
            fixture.detectChanges();
            spyOn(combo.addition, 'emit').and.callThrough();
            combo.addItemToCollection();
            fixture.detectChanges();
            expect(initialData.length).toBeLessThan(combo.data.length);
            expect(combo.data.length).toEqual(initialData.length + 1);
            expect(combo.addition.emit).toHaveBeenCalledTimes(1);
            expect(combo.data[combo.data.length - 1]).toEqual({
                field: 'myItem',
                region: 'Other'
            });
            combo.addition.subscribe((e) => {
                e.addedItem.region = 'exampleRegion';
            });
            combo.searchValue = 'myItem2';
            fixture.detectChanges();
            combo.addItemToCollection();
            fixture.detectChanges();
            expect(initialData.length).toBeLessThan(combo.data.length);
            expect(combo.data.length).toEqual(initialData.length + 2);
            expect(combo.addition.emit).toHaveBeenCalledTimes(2);
            expect(combo.data[combo.data.length - 1]).toEqual({
                field: 'myItem2',
                region: 'exampleRegion'
            });
            combo.toggle();
            fixture.detectChanges();
            expect(combo.collapsed).toEqual(false);
            expect(combo.searchInput).toBeDefined();
            combo.searchValue = 'myItem3';
            combo.addItemToCollection();
            fixture.detectChanges();
            expect(initialData.length).toBeLessThan(combo.data.length);
            expect(combo.data.length).toEqual(initialData.length + 3);
            expect(combo.addition.emit).toHaveBeenCalledTimes(3);
            expect(combo.data[combo.data.length - 1]).toEqual({
                field: 'myItem3',
                region: 'exampleRegion'
            });
        });
        it('should properly handle addItemToCollection calls (Primitive data)', () => {
            combo.data = ['Item1', 'Item2', 'Item3'];
            combo.groupKey = null;
            combo.valueKey = null;
            fixture.detectChanges();
            const initialData = [...combo.data];
            expect(combo.searchValue).toEqual('');
            combo.addItemToCollection();
            fixture.detectChanges();
            expect(initialData).toEqual(combo.data);
            expect(combo.data.length).toEqual(initialData.length);
            combo.searchValue = 'myItem';
            fixture.detectChanges();
            spyOn(combo.addition, 'emit').and.callThrough();
            combo.addItemToCollection();
            fixture.detectChanges();
            expect(initialData.length).toBeLessThan(combo.data.length);
            expect(combo.data.length).toEqual(initialData.length + 1);
            expect(combo.addition.emit).toHaveBeenCalledTimes(1);
            expect(combo.data[combo.data.length - 1]).toEqual('myItem');
        });
        it('should filter the dropdown items when typing in the search input', fakeAsync(() => {
            let dropdownList;
            let dropdownItems;
            let expectedValues = combo.data.filter(data => data.field.toLowerCase().includes('m'));

            const checkFilteredItems = (listItems: HTMLElement[]) => {
                listItems.forEach((el) => {
                    const itemText: string = el.textContent.trim();
                    expect(expectedValues.find(item => 'State: ' + item.field + 'Region: ' + item.region === itemText)).toBeDefined();
                });
            };

            combo.toggle();
            fixture.detectChanges();
            const searchInput = fixture.debugElement.query(By.css('input[name=\'searchInput\']'));
            const verifyFilteredItems = (inputValue: string, expectedItemsNumber) => {
                UIInteractions.triggerInputEvent(searchInput, inputValue);
                fixture.detectChanges();
                dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
                dropdownItems = dropdownList.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
                expect(dropdownItems.length).toEqual(expectedItemsNumber);
            };
            verifyFilteredItems('M', 7);

            verifyFilteredItems('Mi', 5);
            expectedValues = expectedValues.filter(data => data.field.toLowerCase().includes('mi'));
            checkFilteredItems(dropdownItems);

            verifyFilteredItems('Mis', 2);
            expectedValues = expectedValues.filter(data => data.field.toLowerCase().includes('mis'));
            checkFilteredItems(dropdownItems);

            verifyFilteredItems('Mist', 0);
        }));
        it('should display empty list when the search query does not match any item', () => {
            let dropDownContainer: HTMLElement;
            let listItems;
            combo.toggle();
            fixture.detectChanges();

            const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));
            UIInteractions.triggerInputEvent(searchInput, 'P');
            fixture.detectChanges();
            dropDownContainer = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
            listItems = dropDownContainer.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
            expect(listItems.length).toEqual(3);
            let emptyTemplate = fixture.debugElement.query(By.css('.' + CSS_CLASS_EMPTY));
            expect(emptyTemplate).toBeNull();

            UIInteractions.triggerInputEvent(searchInput, 'Pat');
            fixture.detectChanges();
            dropDownContainer = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
            listItems = dropDownContainer.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
            expect(listItems.length).toEqual(0);
            emptyTemplate = fixture.debugElement.query(By.css('.' + CSS_CLASS_EMPTY));
            expect(emptyTemplate).not.toBeNull();
        });
        it('should fire searchInput event when typing in the search box ', () => {
            let timesFired = 0;
            spyOn(combo.searchInput, 'emit').and.callThrough();
            combo.toggle();
            fixture.detectChanges();
            const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));

            const verifyOnSearchInputEventIsFired = (inputValue: string) => {
                UIInteractions.triggerInputEvent(searchInput, inputValue);
                fixture.detectChanges();
                timesFired++;
                expect(combo.searchInput.emit).toHaveBeenCalledTimes(timesFired);
            };

            verifyOnSearchInputEventIsFired('M');
            verifyOnSearchInputEventIsFired('Mi');
            verifyOnSearchInputEventIsFired('Miss');
            verifyOnSearchInputEventIsFired('Misso');
        });
        it('should restore the initial combo dropdown list after clearing the search input', () => {
            let dropdownList;
            let dropdownItems;
            combo.toggle();
            fixture.detectChanges();
            const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));

            const verifyFilteredItems = (inputValue: string,
                                        expectedDropdownItemsNumber: number,
                                        expectedFilteredItemsNumber: number) => {
                UIInteractions.triggerInputEvent(searchInput, inputValue);
                fixture.detectChanges();
                dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
                dropdownItems = dropdownList.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
                expect(dropdownItems.length).toEqual(expectedDropdownItemsNumber);
                expect(combo.filteredData.length).toEqual(expectedFilteredItemsNumber);
            };

            verifyFilteredItems('M', 7, 15);
            verifyFilteredItems('Mi', 5, 5);
            verifyFilteredItems('M', 7, 15);
            combo.filteredData.forEach((item) => expect(combo.data).toContain(item));
        });
        it('should clear the search input and close the dropdown list on pressing ESC key', fakeAsync(() => {
            combo.toggle();
            fixture.detectChanges();

            const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));
            UIInteractions.triggerInputEvent(searchInput, 'P');
            fixture.detectChanges();
            const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
            const dropdownItems = dropdownList.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
            expect(dropdownItems.length).toEqual(3);

            UIInteractions.triggerEventHandlerKeyUp('Escape', searchInput);
            tick();
            fixture.detectChanges();
            expect(combo.collapsed).toBeTruthy();
            expect(searchInput.nativeElement.textContent).toEqual('');
        }));
        it('should not display group headers when no results are filtered for a group', () => {
            const filteredItems: { [index: string]: any } = combo.data.reduce((filteredArray, item) => {
                if (item.field.toLowerCase().trim().includes('mi')) {
                    (filteredArray[item['region']] = filteredArray[item['region']] || []).push(item);
                }
                return filteredArray;
            }, {});
            combo.toggle();
            fixture.detectChanges();
            const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));
            UIInteractions.triggerInputEvent(searchInput, 'Mi');
            fixture.detectChanges();
            const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
            const listHeaders: NodeListOf<HTMLElement> = dropdownList.querySelectorAll(`.${CSS_CLASS_HEADERITEM}`);
            expect(listHeaders.length).toEqual(Object.keys(filteredItems).length);
            const headers = Array.prototype.map.call(listHeaders, (item) => item.textContent.trim());
            Object.keys(filteredItems).forEach(key => expect(headers).toContain(key));
        });
        it('should dismiss the input text when clear button is being pressed and custom values are enabled', () => {
            combo.allowCustomValues = true;
            fixture.detectChanges();
            combo.toggle();
            fixture.detectChanges();
            expect(combo.selectedItems()).toEqual([]);
            expect(combo.value).toEqual('');
            expect(combo.comboInput.nativeElement.value).toEqual('');

            combo.searchValue = 'New ';
            fixture.detectChanges();
            expect(combo.isAddButtonVisible()).toEqual(true);
            const addItemButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_ADDBUTTON}`));
            expect(addItemButton.nativeElement).toBeDefined();

            addItemButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();
            expect(combo.selectedItems()).toEqual(['New']);
            expect(combo.comboInput.nativeElement.value).toEqual('New');

            const clearButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_CLEARBUTTON}`));
            clearButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();
            expect(combo.selectedItems()).toEqual([]);
            expect(combo.comboInput.nativeElement.value).toEqual('');
        });
        it('should remove ADD button when search value matches an already selected item and custom values are enabled ', () => {
            combo.allowCustomValues = true;
            fixture.detectChanges();
            combo.toggle();
            fixture.detectChanges();

            let addItemButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_ADDBUTTON}`));
            expect(addItemButton).toEqual(null);
            const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));
            UIInteractions.triggerInputEvent(searchInput, 'New');
            fixture.detectChanges();
            expect(combo.searchValue).toEqual('New');
            addItemButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_ADDBUTTON}`));
            expect(addItemButton === null).toBeFalsy();

            UIInteractions.triggerInputEvent(searchInput, 'New York');
            fixture.detectChanges();
            expect(combo.searchValue).toEqual('New York');
            addItemButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_ADDBUTTON}`));
            expect(addItemButton).toEqual(null);
        });
        it(`should handle enter keydown on "Add Item" properly`, () => {
            combo.allowCustomValues = true;
            fixture.detectChanges();
            combo.toggle();
            fixture.detectChanges();

            combo.searchValue = 'My New Custom Item';
            combo.handleInputChange();
            fixture.detectChanges();
            expect(combo.collapsed).toBeFalsy();
            expect(combo.value).toEqual('');
            expect(combo.isAddButtonVisible()).toBeTruthy();

            combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'ArrowDown'));
            fixture.detectChanges();
            const dropdownContent = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));
            UIInteractions.triggerEventHandlerKeyDown('Space', dropdownContent);
            fixture.detectChanges();
            expect(combo.collapsed).toBeFalsy();
            expect(combo.value).toEqual('');
            expect(combo.isAddButtonVisible()).toBeTruthy();

            UIInteractions.triggerEventHandlerKeyDown('Enter', dropdownContent);
            fixture.detectChanges();
            expect(combo.collapsed).toBeFalsy();
            expect(combo.value).toEqual('My New Custom Item');
        });
        it(`should handle click on "Add Item" properly`, () => {
            combo.allowCustomValues = true;
            fixture.detectChanges();
            combo.toggle();
            fixture.detectChanges();
            combo.searchValue = 'My New Custom Item';
            combo.handleInputChange();
            fixture.detectChanges();
            expect(combo.collapsed).toBeFalsy();
            expect(combo.value).toEqual('');
            expect(combo.isAddButtonVisible()).toBeTruthy();

            combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'ArrowDown'));
            fixture.detectChanges();
            const dropdownContent = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));
            UIInteractions.triggerEventHandlerKeyDown('Space', dropdownContent);
            fixture.detectChanges();
            // SPACE does not add item to collection
            expect(combo.collapsed).toBeFalsy();
            expect(combo.value).toEqual('');

            const focusedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOCUSED}`));
            focusedItem.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();
            expect(combo.collapsed).toBeFalsy();
            expect(combo.value).toEqual('My New Custom Item');
        });
        it('should enable/disable filtering at runtime', fakeAsync(() => {
            combo.open(); // Open combo - all data items are in filteredData
            tick();
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toBeGreaterThan(0);

            const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));
            searchInput.nativeElement.value = 'Not-available item';
            searchInput.triggerEventHandler('input', { target: searchInput.nativeElement });
            tick();
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toEqual(0); // No items are available because of filtering

            combo.close(); // Filter is cleared on close
            tick();
            fixture.detectChanges();
            combo.filterable = false; // Filtering is disabled
            fixture.detectChanges();
            combo.open(); // All items are visible since filtering is disabled
            tick();
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toBeGreaterThan(0); // All items are visible since filtering is disabled

            combo.searchValue = 'Not-available item';
            combo.handleInputChange();
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toBeGreaterThan(0); // All items are visible since filtering is disabled

            combo.close(); // Filter is cleared on close
            tick();
            fixture.detectChanges();
            combo.filterable = true; // Filtering is re-enabled
            fixture.detectChanges();
            combo.open(); // Filter is cleared on open
            tick();
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toBeGreaterThan(0);
        }));
        it(`should properly display "Add Item" button when filtering is off`, () => {
            combo.allowCustomValues = true;
            combo.filterable = false;
            fixture.detectChanges();
            expect(combo.isAddButtonVisible()).toEqual(false);

            combo.toggle();
            fixture.detectChanges();
            expect(combo.collapsed).toEqual(false);
            const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));
            UIInteractions.triggerInputEvent(searchInput, combo.data[2].field);
            fixture.detectChanges();
            expect(combo.isAddButtonVisible()).toEqual(false);

            UIInteractions.triggerInputEvent(searchInput, combo.searchValue.substring(0, 2));
            fixture.detectChanges();
            expect(combo.isAddButtonVisible()).toEqual(true);
        });
        it('should be able to toggle search case sensitivity', () => {
            combo.showSearchCaseIcon = true;
            fixture.detectChanges();
            combo.toggle();
            fixture.detectChanges();

            const caseSensitiveIcon = fixture.debugElement.query(By.css('igx-icon[name=\'case-sensitive\']'));
            const searchInput = fixture.debugElement.query(By.css('input[name=\'searchInput\']'));
            UIInteractions.triggerInputEvent(searchInput, 'M');
            fixture.detectChanges();
            expect([...combo.filteredData]).toEqual(combo.data.filter(e => e['field'].toLowerCase().includes('m')));

            caseSensitiveIcon.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();
            expect([...combo.filteredData]).toEqual(combo.data.filter(e => e['field'].includes('M')));
        });
        it('Should NOT filter the data when searchInput is canceled', () => {
            const cancelSub = combo.searchInput.subscribe((event: IComboSearchInputEventArgs) => event.cancel = true);
            combo.toggle();
            fixture.detectChanges();
            const searchInput = fixture.debugElement.query(By.css('input[name=\'searchInput\']'));
            UIInteractions.triggerInputEvent(searchInput, 'Test');
            fixture.detectChanges();
            expect(combo.filteredData.length).toEqual(combo.data.length);
            expect(combo.searchValue).toEqual('Test');
            cancelSub.unsubscribe();
        });
    });
    describe('Form control tests: ', () => {
        describe('Reactive form tests: ', () => {
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxComboFormComponent
                    ],
                    imports: [
                        IgxComboModule,
                        NoopAnimationsModule,
                        IgxToggleModule,
                        ReactiveFormsModule,
                        FormsModule
                    ]
                }).compileComponents();
            }));
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxComboFormComponent);
                fixture.detectChanges();
                combo = fixture.componentInstance.combo;
                input = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP}`));
            });
            it('should properly initialize when used as a form control', () => {
                expect(combo).toBeDefined();
                const comboFormReference = fixture.componentInstance.reactiveForm.controls.townCombo;
                expect(comboFormReference).toBeDefined();
                expect(combo.selectedItems()).toEqual(comboFormReference.value);
                expect(combo.selectedItems().length).toEqual(1);
                expect(combo.selectedItems()[0].field).toEqual('Connecticut');
                expect(combo.valid).toEqual(IgxComboState.INITIAL);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                const clearButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_CLEARBUTTON}`));
                clearButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(combo.valid).toEqual(IgxComboState.INVALID);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);

                combo.onBlur();
                fixture.detectChanges();
                expect(combo.valid).toEqual(IgxComboState.INVALID);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);

                combo.selectItems([combo.dropdown.items[0], combo.dropdown.items[1]]);
                expect(combo.valid).toEqual(IgxComboState.VALID);
                expect(combo.comboInput.valid).toEqual(IgxInputState.VALID);

                combo.onBlur();
                fixture.detectChanges();
                expect(combo.valid).toEqual(IgxComboState.INITIAL);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
            });
            it('should properly initialize when used as a form control - without validators', () => {
                const form: FormGroup = fixture.componentInstance.reactiveForm;
                form.controls.townCombo.validator = null;
                expect(combo).toBeDefined();
                const comboFormReference = fixture.componentInstance.reactiveForm.controls.townCombo;
                expect(comboFormReference).toBeDefined();
                expect(combo.selectedItems()).toEqual(comboFormReference.value);
                expect(combo.selectedItems().length).toEqual(1);
                expect(combo.selectedItems()[0].field).toEqual('Connecticut');
                expect(combo.valid).toEqual(IgxComboState.INITIAL);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                const clearButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_CLEARBUTTON}`));
                clearButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(combo.valid).toEqual(IgxComboState.INITIAL);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);

                combo.onBlur();
                fixture.detectChanges();
                expect(combo.valid).toEqual(IgxComboState.INITIAL);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);

                combo.selectItems([combo.dropdown.items[0], combo.dropdown.items[1]]);
                expect(combo.valid).toEqual(IgxComboState.INITIAL);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);

                combo.onBlur();
                fixture.detectChanges();
                expect(combo.valid).toEqual(IgxComboState.INITIAL);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
            });
            it('should be possible to be enabled/disabled when used as a form control', () => {
                const form = fixture.componentInstance.reactiveForm;
                const comboFormReference = form.controls.townCombo;
                expect(comboFormReference).toBeDefined();
                expect(combo.disabled).toBeFalsy();
                expect(comboFormReference.disabled).toBeFalsy();
                spyOn(combo, 'onInputClick');
                spyOn(combo, 'setDisabledState').and.callThrough();
                combo.comboInput.nativeElement.click();
                fixture.detectChanges();
                expect(combo.onInputClick).toHaveBeenCalledTimes(1);
                combo.comboInput.nativeElement.blur();

                // Disabling the form disables all of the controls in it
                form.disable();
                fixture.detectChanges();
                expect(comboFormReference.disabled).toBeTruthy();
                expect(combo.disabled).toBeTruthy();
                expect(combo.setDisabledState).toHaveBeenCalledTimes(1);

                // Disabled form controls don't handle click events
                combo.comboInput.nativeElement.click();
                fixture.detectChanges();
                expect(combo.onInputClick).toHaveBeenCalledTimes(1);
                combo.comboInput.nativeElement.blur();

                // Can enabling the form re-enables all of the controls in it
                form.enable();
                fixture.detectChanges();
                expect(comboFormReference.disabled).toBeFalsy();
                expect(combo.disabled).toBeFalsy();
            });
            it('should change value when addressed as a form control', () => {
                expect(combo).toBeDefined();
                const form = fixture.componentInstance.reactiveForm;
                const comboFormReference = form.controls.townCombo;
                expect(comboFormReference).toBeDefined();
                expect(combo.selectedItems()).toEqual(comboFormReference.value);

                // Form -> Combo
                comboFormReference.setValue([{ field: 'Missouri', region: 'West North Central' }]);
                fixture.detectChanges();
                expect(combo.selectedItems()).toEqual([{ field: 'Missouri', region: 'West North Central' }]);

                // Combo -> Form
                combo.selectItems([{ field: 'South Carolina', region: 'South Atlantic' }], true);
                fixture.detectChanges();
                expect(comboFormReference.value).toEqual([{ field: 'South Carolina', region: 'South Atlantic' }]);
            });
            it('should properly submit values when used as a form control', () => {
                expect(combo).toBeDefined();
                const form = fixture.componentInstance.reactiveForm;
                const comboFormReference = form.controls.townCombo;
                expect(comboFormReference).toBeDefined();
                expect(combo.selectedItems()).toEqual(comboFormReference.value);
                expect(form.status).toEqual('INVALID');
                form.controls.password.setValue('TEST');
                form.controls.firstName.setValue('TEST');

                spyOn(console, 'log');
                fixture.detectChanges();
                expect(form.status).toEqual('VALID');
                fixture.debugElement.query(By.css('button')).triggerEventHandler('click', UIInteractions.simulateClickAndSelectEvent);
            });
        });
        describe('Template form tests: ', () => {
            let inputGroupRequired: DebugElement;
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxComboInTemplatedFormComponent
                    ],
                    imports: [
                        IgxComboModule,
                        NoopAnimationsModule,
                        IgxToggleModule,
                        ReactiveFormsModule,
                        FormsModule
                    ]
                }).compileComponents();
            }));
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxComboInTemplatedFormComponent);
                fixture.detectChanges();
                combo = fixture.componentInstance.testCombo;
                input = fixture.debugElement.query(By.css(`${CSS_CLASS_INPUTGROUP} input`));
                inputGroupRequired = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP_REQUIRED}`));
            }));
            it('should properly initialize when used in a template form control', () => {
                expect(combo.valid).toEqual(IgxComboState.INITIAL);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                expect(inputGroupRequired).toBeDefined();
                combo.onBlur();
                fixture.detectChanges();
                expect(combo.valid).toEqual(IgxComboState.INVALID);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);

                input.triggerEventHandler('focus', {});
                combo.selectAllItems();
                fixture.detectChanges();
                expect(combo.valid).toEqual(IgxComboState.VALID);
                expect(combo.comboInput.valid).toEqual(IgxInputState.VALID);

                const clearButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_CLEARBUTTON}`));
                clearButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(combo.valid).toEqual(IgxComboState.INVALID);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);
            });
            it('should properly init with empty array and handle consecutive model changes', fakeAsync(() => {
                const model = fixture.debugElement.query(By.directive(NgModel)).injector.get(NgModel);
                fixture.componentInstance.values = [];
                fixture.detectChanges();
                tick();
                expect(combo.valid).toEqual(IgxComboState.INITIAL);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                expect(model.valid).toBeFalse();
                expect(model.dirty).toBeFalse();
                expect(model.touched).toBeFalse();

                fixture.componentInstance.values = ['Missouri'];
                fixture.detectChanges();
                tick();
                expect(combo.valid).toEqual(IgxComboState.INITIAL);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                expect(combo.selectedItems()).toEqual(['Missouri']);
                expect(combo.value).toEqual('Missouri');
                expect(model.valid).toBeTrue();
                expect(model.touched).toBeFalse();

                fixture.componentInstance.values = ['Missouri', 'Missouri'];
                fixture.detectChanges();
                expect(combo.valid).toEqual(IgxComboState.INITIAL);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                expect(combo.selectedItems()).toEqual(['Missouri']);
                expect(combo.value).toEqual('Missouri');
                expect(model.valid).toBeTrue();
                expect(model.touched).toBeFalse();

                fixture.componentInstance.values = null;
                fixture.detectChanges();
                tick();
                expect(combo.valid).toEqual(IgxComboState.INITIAL);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                expect(combo.selectedItems()).toEqual([]);
                expect(combo.value).toEqual('');
                expect(model.valid).toBeFalse();
                expect(model.touched).toBeFalse();
                expect(model.dirty).toBeFalse();

                combo.onBlur();
                fixture.detectChanges();
                expect(combo.valid).toEqual(IgxComboState.INVALID);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);
                expect(model.valid).toBeFalse();
                expect(model.touched).toBeTrue();
                expect(model.dirty).toBeFalse();

                fixture.componentInstance.values = ['New Jersey'];
                fixture.detectChanges();
                tick();
                expect(combo.valid).toEqual(IgxComboState.INITIAL);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                expect(combo.selectedItems()).toEqual(['New Jersey']);
                expect(combo.value).toEqual('New Jersey');
                expect(model.valid).toBeTrue();
                expect(model.touched).toBeTrue();
                expect(model.dirty).toBeFalse();
            }));
            it('should have correctly bound blur handler', () => {
                spyOn(combo, 'onBlur');

                input.triggerEventHandler('blur', {});
                expect(combo.onBlur).toHaveBeenCalled();
                expect(combo.onBlur).toHaveBeenCalledWith();
            });
            it('should set validity to initial when the form is reset', fakeAsync(() => {
                combo.onBlur();
                fixture.detectChanges();
                expect(combo.valid).toEqual(IgxComboState.INVALID);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);

                fixture.componentInstance.form.resetForm();
                tick();
                expect(combo.valid).toEqual(IgxComboState.INITIAL);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
            }));
        });
    });
    describe('Display density', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxComboSampleComponent
                ],
                imports: [
                    IgxComboModule,
                    NoopAnimationsModule,
                    IgxToggleModule,
                    ReactiveFormsModule,
                    FormsModule
                ]
            }).compileComponents();
        }));
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
        });
        it('Should be able to set Display Density as input', () => {
            expect(combo.displayDensity).toEqual(DisplayDensity.cosy);
            fixture.componentInstance.density = DisplayDensity.compact;
            fixture.detectChanges();
            expect(combo.displayDensity).toEqual(DisplayDensity.compact);
            fixture.componentInstance.density = DisplayDensity.comfortable;
            fixture.detectChanges();
            expect(combo.displayDensity).toEqual(DisplayDensity.comfortable);
        });
        it('should apply correct styles to items and input when Display Density is set', () => {
            combo.toggle();
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toEqual(document.getElementsByClassName(CSS_CLASS_ITEM_COSY).length);
            expect(combo.dropdown.headers.length).toEqual(document.getElementsByClassName(CSS_CLASS_HEADER_COSY).length);
            expect(document.getElementsByClassName(CSS_CLASS_INPUT_COSY).length).toBe(2);
            fixture.componentInstance.density = DisplayDensity.compact;
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toEqual(document.getElementsByClassName(CSS_CLASS_ITEM_COMPACT).length);
            expect(combo.dropdown.headers.length).toEqual(document.getElementsByClassName(CSS_CLASS_HEADER_COMPACT).length);
            expect(document.getElementsByClassName(CSS_CLASS_INPUT_COMPACT).length).toBe(2);
            fixture.componentInstance.density = DisplayDensity.comfortable;
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toEqual(document.getElementsByClassName(CSS_CLASS_ITEM).length);
            expect(combo.dropdown.headers.length).toEqual(document.getElementsByClassName(CSS_CLASS_HEADER_ITEM).length);
            expect(document.getElementsByClassName(CSS_CLASS_INPUT_COMFORTABLE).length).toBe(2);
            expect(document.getElementsByClassName(CSS_CLASS_ITEM_COMPACT).length).toEqual(0);
            expect(document.getElementsByClassName(CSS_CLASS_ITEM_COSY).length).toEqual(0);
        });
        it('should scale items container depending on displayDensity (itemHeight * 10)', () => {
            combo.toggle();
            fixture.detectChanges();
            expect(combo.itemsMaxHeight).toEqual(320);
            fixture.componentInstance.density = DisplayDensity.compact;
            fixture.detectChanges();
            expect(combo.itemsMaxHeight).toEqual(280);
            fixture.componentInstance.density = DisplayDensity.comfortable;
            fixture.detectChanges();
            expect(combo.itemsMaxHeight).toEqual(400);
        });
    });
});

@Component({
    template: `
<igx-combo #combo [placeholder]="'Location'" [data]='items' [displayDensity]="density"
[filterable]='true' [valueKey]="'field'" [groupKey]="'region'" [width]="'400px'"
(selectionChange)="onSelectionChange($event)">
<ng-template igxComboItem let-display let-key="valueKey">
<div class="state-card--simple">
<span class="small-red-circle"></span>
<div class="display-value--main">State: {{display[key]}}</div>
<div class="display-value--sub">Region: {{display.region}}</div>
</div>
</ng-template>
<ng-template igxComboHeader>
<div class="header-class">This is a header</div>
</ng-template>
<ng-template igxComboFooter>
<div class="footer-class">This is a footer</div>
</ng-template>
</igx-combo>
`
})
class IgxComboSampleComponent {
    /**
     * TODO
     * Test that use this component should properly call `selectItems` method
     * IF a `valueKey` is defined, calls should be w/ the items' valueKey property value
     * IF no `valueKey` is defined, calls should be w/ object references to the items
     */
    @ViewChild('combo', { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;
    public density: DisplayDensity = DisplayDensity.cosy;

    public items = [];
    public initData = [];

    constructor() {

        const division = {
            'New England 01': ['Connecticut', 'Maine', 'Massachusetts'],
            'New England 02': ['New Hampshire', 'Rhode Island', 'Vermont'],
            'Mid-Atlantic': ['New Jersey', 'New York', 'Pennsylvania'],
            'East North Central 02': ['Michigan', 'Ohio', 'Wisconsin'],
            'East North Central 01': ['Illinois', 'Indiana'],
            'West North Central 01': ['Missouri', 'Nebraska', 'North Dakota', 'South Dakota'],
            'West North Central 02': ['Iowa', 'Kansas', 'Minnesota'],
            'South Atlantic 01': ['Delaware', 'Florida', 'Georgia', 'Maryland'],
            'South Atlantic 02': ['North Carolina', 'South Carolina', 'Virginia'],
            'South Atlantic 03': ['District of Columbia', 'West Virginia'],
            'East South Central 01': ['Alabama', 'Kentucky'],
            'East South Central 02': ['Mississippi', 'Tennessee'],
            'West South Central': ['Arkansas', 'Louisiana', 'Oklahome', 'Texas'],
            Mountain: ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming'],
            'Pacific 01': ['Alaska', 'California'],
            'Pacific 02': ['Hawaii', 'Oregon', 'Washington']
        };
        const keys = Object.keys(division);
        for (const key of keys) {
            division[key].map((e) => {
                this.items.push({
                    field: e,
                    region: key.substring(0, key.length - 3)
                });
            });
        }

        this.initData = this.items;
    }

    public onSelectionChange() {
    }
}

@Component({
    template: `
<form [formGroup]="reactiveForm" (ngSubmit)="onSubmitReactive()">
<p>
<label>First Name:</label>
<input type="text" formControlName="firstName">
</p>
<p>
<label>Password:</label>
<input type="password" formControlName="password">
</p>
<p>
<igx-combo #comboReactive formControlName="townCombo"
class="input-container" [filterable]="true" placeholder="Location(s)"
[data]="items" [displayKey]="'field'" [groupKey]="'region'"></igx-combo>
</p>
<p>
<button type="submit" [disabled]="!reactiveForm.valid">Submit</button>
</p>
</form>
`
})

class IgxComboFormComponent {
    @ViewChild('comboReactive', { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;
    public items = [];

    public get valuesTemplate() {
        return this.combo.selectedItems();
    }
    public set valuesTemplate(values: any[]) {
        this.combo.selectItems(values);
    }

    public reactiveForm: FormGroup;

    constructor(fb: FormBuilder) {

        const division = {
            'New England 01': ['Connecticut', 'Maine', 'Massachusetts'],
            'New England 02': ['New Hampshire', 'Rhode Island', 'Vermont'],
            'Mid-Atlantic': ['New Jersey', 'New York', 'Pennsylvania'],
            'East North Central 02': ['Michigan', 'Ohio', 'Wisconsin'],
            'East North Central 01': ['Illinois', 'Indiana'],
            'West North Central 01': ['Missouri', 'Nebraska', 'North Dakota', 'South Dakota'],
            'West North Central 02': ['Iowa', 'Kansas', 'Minnesota'],
            'South Atlantic 01': ['Delaware', 'Florida', 'Georgia', 'Maryland'],
            'South Atlantic 02': ['North Carolina', 'South Carolina', 'Virginia', 'District of Columbia', 'West Virginia'],
            'South Atlantic 03': ['District of Columbia', 'West Virginia'],
            'East South Central 01': ['Alabama', 'Kentucky'],
            'East South Central 02': ['Mississippi', 'Tennessee'],
            'West South Central': ['Arkansas', 'Louisiana', 'Oklahome', 'Texas'],
            Mountain: ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming'],
            'Pacific 01': ['Alaska', 'California'],
            'Pacific 02': ['Hawaii', 'Oregon', 'Washington']
        };
        const keys = Object.keys(division);
        for (const key of keys) {
            division[key].map((e) => {
                this.items.push({
                    field: e,
                    region: key.substring(0, key.length - 3)
                });
            });
        }

        this.reactiveForm = fb.group({
            firstName: new FormControl('', Validators.required),
            password: ['', Validators.required],
            townCombo: [[this.items[0]], Validators.required]
        });

    }
    public onSubmitReactive() { }

    public onSubmitTemplateBased() { }
}

@Component({
    template: `
    <form #form="ngForm">
        <igx-combo #testCombo class="input-container" [placeholder]="'Locations'"
            name="anyName" required [(ngModel)]="values"
            [data]="items" [filterable]="filterableFlag"
            [displayKey]="'field'" [valueKey]="'field'"
            [groupKey]="'field' ? 'region' : ''" [width]="'100%'">
            <label igxLabel>Combo Label</label>
        </igx-combo>
</form>
`
})
class IgxComboInTemplatedFormComponent {
    @ViewChild('testCombo', { read: IgxComboComponent, static: true })
    public testCombo: IgxComboComponent;
    @ViewChild('form')
    public form: NgForm;
    public items: any[] = [];
    public values: Array<any>;

    constructor() {
        const division = {
            'New England 01': ['Connecticut', 'Maine', 'Massachusetts'],
            'New England 02': ['New Hampshire', 'Rhode Island', 'Vermont'],
            'Mid-Atlantic': ['New Jersey', 'New York', 'Pennsylvania'],
            'East North Central 02': ['Michigan', 'Ohio', 'Wisconsin'],
            'East North Central 01': ['Illinois', 'Indiana'],
            'West North Central 01': ['Missouri', 'Nebraska', 'North Dakota', 'South Dakota'],
            'West North Central 02': ['Iowa', 'Kansas', 'Minnesota'],
            'South Atlantic 01': ['Delaware', 'Florida', 'Georgia', 'Maryland'],
            'South Atlantic 02': ['North Carolina', 'South Carolina', 'Virginia'],
            'South Atlantic 03': ['District of Columbia', 'West Virginia'],
            'East South Central 01': ['Alabama', 'Kentucky'],
            'East South Central 02': ['Mississippi', 'Tennessee'],
            'West South Central': ['Arkansas', 'Louisiana', 'Oklahome', 'Texas'],
            Mountain: ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming'],
            'Pacific 01': ['Alaska', 'California'],
            'Pacific 02': ['Hawaii', 'Oregon', 'Washington']
        };
        const keys = Object.keys(division);
        for (const key of keys) {
            division[key].map((e) => {
                this.items.push({
                    field: e,
                    region: key.substring(0, key.length - 3)
                });
            });
        }
    }
}
@Injectable()
export class LocalService {
    public getData() {
        const fakeData = new Observable(obs => {
            setTimeout(() => {
                obs.next(this.generateData());
                obs.complete();
            }, 3000);
        });
        return fakeData;
    }

    private generateData() {
        const dummyData = [];
        for (let i = 1; i <= 20; i++) {
            dummyData.push({ id: i, product: 'Product ' + i });
        }
        return dummyData;
    }
}
@Component({
    template: `
<label id="mockID">Combo Label</label>
<igx-combo #combo [placeholder]="'Products'" [data]='items' [itemsMaxHeight]='400'
[itemHeight]='40' [valueKey]="'id'" [displayKey]="'product'" [width]="'400px'"
[ariaLabelledBy]="'mockID'">
</igx-combo>
`,
    providers: [LocalService]
})
export class IgxComboBindingTestComponent {

    @ViewChild('combo', { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;

    public items = [];
    constructor(private localService: LocalService) {
        this.localService.getData().subscribe(
            (data: any[]) => {
                this.items = data;
            }
        );
    }
}
@Component({
    template: `
<div class="comboContainer" [style.width]="'500px'">
<igx-combo #combo placeholder="Location(s)"
[data]="citiesData"
[allowCustomValues]="true"
[filterable]="true">
>
</igx-combo>
</div>
`
})
class IgxComboInContainerTestComponent {
    @ViewChild('combo', { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;

    public citiesData: string[] = [
        'New York',
        'Sofia',
        'Istanbul',
        'Paris',
        'Hamburg',
        'Berlin',
        'London',
        'Oslo',
        'Los Angeles',
        'Rome',
        'Madrid',
        'Ottawa',
        'Prague',
        'Padua',
        'Palermo',
        'Palma de Mallorca'];

}
@Injectable()
export class RemoteDataService {
    public records: Observable<any[]>;
    private _records: BehaviorSubject<any[]>;
    private dataStore: any[];
    private initialData: any[];

    constructor() {
        this.dataStore = [];
        this._records = new BehaviorSubject([]);
        this.records = this._records.asObservable();
        this.initialData = this.generateInitialData(0, 1000);
    }

    public getData(data?: IForOfState, cb?: (any) => void): any {
        const size = data.chunkSize === 0 ? 10 : data.chunkSize;
        this.dataStore = this.generateData(data.startIndex, data.startIndex + size);
        this._records.next(this.dataStore);
        const count = 1000;
        if (cb) {
            cb(count);
        }
    }

    public generateData(start, end) {
        return this.initialData.slice(start, end);
    }

    public generateInitialData(start, end) {
        const data = [];
        for (let i = start; i < end; i++) {
            data.push({ id: i, product: 'Product ' + i });
        }
        return data;
    }
}
@Component({
    providers: [RemoteDataService],
    template: `
    <label id="mockID">Combo Label</label>
    <igx-combo #combo [placeholder]="'Products'" [data]="data | async" (onDataPreLoad)="dataLoading($event)" [itemsMaxHeight]='400'
    [itemHeight]='40' [valueKey]="'id'" [displayKey]="'product'" [width]="'400px'"
    [ariaLabelledBy]="'mockID'">
    </igx-combo>
    `
})
export class IgxComboRemoteDataComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('combo', { read: IgxComboComponent, static: true })
    public instance: IgxComboComponent;
    public data;
    constructor(private remoteDataService: RemoteDataService, public cdr: ChangeDetectorRef) { }
    public ngOnInit(): void {
        this.data = this.remoteDataService.records;
    }

    public ngAfterViewInit() {
        this.remoteDataService.getData(this.instance.virtualizationState, (count) => {
            this.instance.totalItemCount = count;
            this.cdr.detectChanges();
        });
    }

    public dataLoading(evt) {
        this.remoteDataService.getData(evt, () => {
            this.cdr.detectChanges();
        });
    }

    public ngOnDestroy() {
        this.cdr.detach();
    }
}
@Component({
    template: `<igx-combo [(ngModel)]="selectedItems" [data]="items"></igx-combo>`
})
export class ComboModelBindingComponent implements OnInit {
    @ViewChild(IgxComboComponent, { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;
    public items: any[];
    public selectedItems: any[];

    public ngOnInit() {
        this.items = [{ text: 'One', id: 0 }, { text: 'Two', id: 1 }, { text: 'Three', id: 2 },
        { text: 'Four', id: 3 }, { text: 'Five', id: 4 }];
    }
}
