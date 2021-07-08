import { Component, ViewChild, OnInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxToggleModule, IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { IgxDropDownItemComponent } from './drop-down-item.component';
import { IgxDropDownComponent, IgxDropDownModule } from './public_api';
import { ISelectionEventArgs } from './drop-down.common';
import { IgxTabsComponent, IgxTabsModule } from '../tabs/tabs/public_api';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { CancelableEventArgs } from '../core/utils';
import { configureTestSuite } from '../test-utils/configure-suite';
import { take } from 'rxjs/operators';
import { IgxDropDownGroupComponent } from './drop-down-group.component';
import { IgxForOfDirective, IgxForOfModule } from '../directives/for-of/for_of.directive';
import { IgxDropDownItemBaseDirective } from './drop-down-item.base';
import { DisplayDensity } from '../core/density';
import { IgxSelectionAPIService } from '../core/selection';

const CSS_CLASS_DROP_DOWN_BASE = 'igx-drop-down';
const CSS_CLASS_LIST = 'igx-drop-down__list';
const CSS_CLASS_SCROLL = 'igx-drop-down__list-scroll';
const CSS_CLASS_ITEM = 'igx-drop-down__item';
const CSS_CLASS_INNER_SPAN = 'igx-drop-down__inner';
const CSS_CLASS_GROUP_ITEM = 'igx-drop-down__group';
const CSS_CLASS_ITEM_COSY = 'igx-drop-down__item--cosy';
const CSS_CLASS_ITEM_COMPACT = 'igx-drop-down__item--compact';
const CSS_CLASS_FOCUSED = 'igx-drop-down__item--focused';
const CSS_CLASS_SELECTED = 'igx-drop-down__item--selected';
const CSS_CLASS_DISABLED = 'igx-drop-down__item--disabled';
const CSS_CLASS_HEADER = 'igx-drop-down__header';
const CSS_CLASS_HEADER_COSY = 'igx-drop-down__header--cosy';
const CSS_CLASS_HEADER_COMPACT = 'igx-drop-down__header--compact';
const CSS_CLASS_TABS = '.igx-tabs__header-item';

describe('IgxDropDown ', () => {
    let fixture;
    let dropdown: IgxDropDownComponent;
    describe('Unit tests', () => {
        const data = [
            { value: 'Item0', index: 0 } as IgxDropDownItemComponent,
            { value: 'Item1', index: 1 } as IgxDropDownItemComponent,
            { value: 'Item2', index: 2 } as IgxDropDownItemComponent,
            { value: 'Item3', index: 3 } as IgxDropDownItemComponent,
            { value: 'Item4', index: 4 } as IgxDropDownItemComponent,
            { value: 'Item5', index: 5 } as IgxDropDownItemComponent];
        const mockSelection: {
            [key: string]: jasmine.Spy;
        } = jasmine.createSpyObj('IgxSelectionAPIService', ['get', 'set', 'add_items', 'select_items']);
        const mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck', 'detectChanges']);
        mockSelection.get.and.returnValue(new Set([]));
        const mockForOf = jasmine.createSpyObj('IgxForOfDirective', ['totalItemCount']);
        it('should notify when selection has changed', () => {
            const selectionService = new IgxSelectionAPIService();
            dropdown = new IgxDropDownComponent({ nativeElement: null }, mockCdr, null, selectionService, null);
            dropdown.ngOnInit();
            (dropdown as any).virtDir = mockForOf;
            spyOnProperty(dropdown, 'items', 'get').and.returnValue(data);
            spyOn(dropdown.selection, 'emit').and.callThrough();

            dropdown.selectItem(data[0]);
            expect(dropdown.selectedItem).toEqual(data[0]);
            expect(dropdown.selection.emit).toHaveBeenCalledTimes(1);

            dropdown.selectItem(data[4]);
            expect(dropdown.selectedItem).toEqual(data[4]);
            expect(dropdown.selection.emit).toHaveBeenCalledTimes(2);
        });
        it('should fire selection with correct args', () => {
            const selectionService = new IgxSelectionAPIService();
            dropdown = new IgxDropDownComponent({ nativeElement: null }, mockCdr, null, selectionService, null);
            dropdown.ngOnInit();
            (dropdown as any).virtDir = mockForOf;
            spyOnProperty(dropdown, 'items', 'get').and.returnValue(data);
            spyOn(dropdown.selection, 'emit').and.callThrough();

            const selectionArgs: ISelectionEventArgs = {
                newSelection: dropdown.items[1],
                oldSelection: null,
                cancel: false
            };
            dropdown.selectItem(data[1]);
            expect(dropdown.selection.emit).toHaveBeenCalledWith(selectionArgs);

            const newSelectionArgs: ISelectionEventArgs = {
                newSelection: dropdown.items[4],
                oldSelection: dropdown.items[1],
                cancel: false
            };
            dropdown.selectItem(data[4]);
            expect(dropdown.selection.emit).toHaveBeenCalledWith(newSelectionArgs);
        });
        it('should notify when selection is cleared', () => {
            const selectionService = new IgxSelectionAPIService();
            dropdown = new IgxDropDownComponent({ nativeElement: null }, mockCdr, null, selectionService, null);
            dropdown.ngOnInit();
            (dropdown as any).virtDir = mockForOf;
            spyOnProperty(dropdown, 'items', 'get').and.returnValue(data);
            spyOn(dropdown.selection, 'emit').and.callThrough();
            spyOn(dropdown.onClosed, 'emit').and.callThrough();

            dropdown.selectItem(data[1]);
            const selected = dropdown.selectedItem;
            expect(dropdown.selectedItem).toEqual(data[1]);
            expect(dropdown.selection.emit).toHaveBeenCalledTimes(1);
            let args: ISelectionEventArgs = {
                oldSelection: null,
                newSelection: data[1],
                cancel: false
            };
            expect(dropdown.selection.emit).toHaveBeenCalledWith(args);

            dropdown.clearSelection();
            expect(dropdown.selectedItem).toBeNull();
            expect(dropdown.selection.emit).toHaveBeenCalledTimes(2);
            args = {
                oldSelection: selected,
                newSelection: null,
                cancel: false
            };
            expect(dropdown.selection.emit).toHaveBeenCalledWith(args);
        });
        it('setSelectedItem should return selected item', () => {
            const selectionService = new IgxSelectionAPIService();
            dropdown = new IgxDropDownComponent({ nativeElement: null }, mockCdr, null, selectionService, null);
            dropdown.ngOnInit();
            (dropdown as any).virtDir = mockForOf;
            (dropdown as any).virtDir.igxForOf = data;
            spyOnProperty(dropdown, 'items', 'get').and.returnValue(data);

            expect(dropdown.selectedItem).toBeNull();

            dropdown.setSelectedItem(3);
            const selectedItem = dropdown.selectedItem;
            expect(selectedItem).toBeTruthy();
            expect(selectedItem.index).toEqual(3);
        });
        it('setSelectedItem should return null when selection is cleared', () => {
            const selectionService = new IgxSelectionAPIService();
            dropdown = new IgxDropDownComponent({ nativeElement: null }, mockCdr, null, selectionService, null);
            dropdown.ngOnInit();
            (dropdown as any).virtDir = mockForOf;
            (dropdown as any).virtDir.igxForOf = data;
            spyOnProperty(dropdown, 'items', 'get').and.returnValue(data);

            dropdown.setSelectedItem(3);
            expect(dropdown.selectedItem).toBeTruthy();
            expect(dropdown.selectedItem.index).toEqual(3);

            dropdown.clearSelection();
            expect(dropdown.selectedItem).toBeNull();
        });
        it('toggle should call open method when dropdown is collapsed', () => {
            const selectionService = new IgxSelectionAPIService();
            dropdown = new IgxDropDownComponent({ nativeElement: null }, mockCdr, null, selectionService, null);
            dropdown.ngOnInit();
            (dropdown as any).virtDir = mockForOf;
            spyOnProperty(dropdown, 'items', 'get').and.returnValue(data);
            spyOnProperty(dropdown, 'collapsed', 'get').and.returnValue(true);
            spyOn(dropdown, 'open');

            dropdown.toggle();
            expect(dropdown.open).toHaveBeenCalledTimes(1);
        });
        it('toggle should call close method when dropdown is opened', () => {
            const selectionService = new IgxSelectionAPIService();
            dropdown = new IgxDropDownComponent({ nativeElement: null }, mockCdr, null, selectionService, null);
            dropdown.ngOnInit();
            (dropdown as any).virtDir = mockForOf;
            const mockToggle = jasmine.createSpyObj('IgxToggleDirective', ['open']);
            mockToggle.isClosing = false;
            (dropdown as any).toggleDirective = mockToggle;
            spyOnProperty(dropdown, 'items', 'get').and.returnValue(data);
            spyOnProperty(dropdown, 'collapsed', 'get').and.returnValue(false);
            spyOn(dropdown, 'close');

            dropdown.toggle();
            expect(dropdown.close).toHaveBeenCalledTimes(1);
        });
    });
    describe('User interaction tests', () => {
        describe('Selection & key navigation', () => {
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxDropDownTestComponent
                    ],
                    imports: [
                        IgxDropDownModule,
                        NoopAnimationsModule,
                        IgxToggleModule,
                        IgxForOfModule
                    ]
                }).compileComponents();
            }));
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxDropDownTestComponent);
                fixture.detectChanges();
                dropdown = fixture.componentInstance.dropdown;
            });
            it('should toggle drop down on open/close methods call', fakeAsync(() => {
                spyOn(dropdown, 'onToggleOpening');
                spyOn(dropdown, 'onToggleOpened');
                spyOn(dropdown, 'onToggleClosing');
                spyOn(dropdown, 'onToggleClosed');

                expect(dropdown.collapsed).toBeTruthy();
                dropdown.open();
                tick();
                fixture.detectChanges();
                expect(dropdown.collapsed).toBeFalsy();
                expect(dropdown.onToggleOpening).toHaveBeenCalledTimes(1);
                expect(dropdown.onToggleOpened).toHaveBeenCalledTimes(1);

                dropdown.close();
                tick();
                fixture.detectChanges();
                expect(dropdown.collapsed).toBeTruthy();
                expect(dropdown.onToggleClosing).toHaveBeenCalledTimes(1);
                expect(dropdown.onToggleClosed).toHaveBeenCalledTimes(1);
            }));
            it('#3810 - should not emit events when calling open on opened dropdown', fakeAsync(() => {
                spyOn(dropdown.onOpening, 'emit').and.callThrough();
                spyOn(dropdown.onOpened, 'emit').and.callThrough();

                dropdown.open();
                tick();
                fixture.detectChanges();

                expect(dropdown.onOpening.emit).toHaveBeenCalledTimes(1);
                expect(dropdown.onOpened.emit).toHaveBeenCalledTimes(1);

                dropdown.open();
                tick();
                fixture.detectChanges();

                expect(dropdown.onOpening.emit).toHaveBeenCalledTimes(1);
                expect(dropdown.onOpened.emit).toHaveBeenCalledTimes(1);
            }));
            it('#2798 - should allow canceling of open/close through onOpening/onClosing events', fakeAsync(() => {
                const toggle: IgxToggleDirective = (dropdown as any).toggleDirective;
                const onOpeningSpy = spyOn(dropdown.onOpening, 'emit').and.callThrough();
                const onOpenedSpy = spyOn(dropdown.onOpened, 'emit').and.callThrough();
                spyOn(dropdown.onClosing, 'emit').and.callThrough();
                spyOn(dropdown.onClosed, 'emit').and.callThrough();

                dropdown.onClosing.pipe(take(1)).subscribe((e: CancelableEventArgs) => e.cancel = true);

                dropdown.toggle();
                tick();
                fixture.detectChanges();

                expect(dropdown.onOpening.emit).toHaveBeenCalledTimes(1);
                expect(dropdown.onOpened.emit).toHaveBeenCalledTimes(1);

                dropdown.toggle();
                tick();
                fixture.detectChanges();

                expect(dropdown.onClosing.emit).toHaveBeenCalledTimes(1);
                expect(dropdown.onClosed.emit).toHaveBeenCalledTimes(0);

                toggle.close();
                fixture.detectChanges();
                onOpeningSpy.calls.reset();
                onOpenedSpy.calls.reset();

                dropdown.onOpening.pipe(take(1)).subscribe((e: CancelableEventArgs) => e.cancel = true);
                dropdown.toggle();
                tick();
                fixture.detectChanges();
                expect(dropdown.onOpening.emit).toHaveBeenCalledTimes(1);
                expect(dropdown.onOpened.emit).toHaveBeenCalledTimes(0);
            }));
            it('should select item by SPACE/ENTER keys', fakeAsync(() => {
                dropdown.toggle();
                tick();
                fixture.detectChanges();
                let focusedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOCUSED}`));
                expect(focusedItem.componentInstance.itemIndex).toEqual(0);
                expect(dropdown.collapsed).toEqual(false);

                let dropdownElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROP_DOWN_BASE}`));
                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', dropdownElement);
                tick();
                fixture.detectChanges();
                focusedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOCUSED}`));
                expect(focusedItem).toBeDefined();
                expect(focusedItem.componentInstance.itemIndex).toEqual(1);
                expect(dropdown.selectedItem).toBeFalsy();

                UIInteractions.triggerEventHandlerKeyDown('Space', dropdownElement);
                tick();
                fixture.detectChanges();
                expect(dropdown.selectedItem).toEqual(dropdown.items[1]);
                expect(dropdown.collapsed).toEqual(true);

                dropdown.toggle();
                tick();
                fixture.detectChanges();
                dropdownElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROP_DOWN_BASE}`));
                focusedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOCUSED}`));
                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', dropdownElement);
                tick();
                fixture.detectChanges();

                UIInteractions.triggerEventHandlerKeyDown('Enter', dropdownElement);
                tick();
                fixture.detectChanges();
                expect(dropdown.collapsed).toEqual(true);
                expect(dropdown.selectedItem).toEqual(dropdown.items[2]);

                dropdown.toggle();
                tick();
                fixture.detectChanges();
                expect(dropdown.collapsed).toEqual(false);
            }));
            it('should close the dropdown and not change selection by pressing ESC key', fakeAsync(() => {
                spyOn(dropdown.selection, 'emit').and.callThrough();
                spyOn(dropdown.onOpening, 'emit').and.callThrough();
                spyOn(dropdown.onOpened, 'emit').and.callThrough();
                spyOn(dropdown.onClosing, 'emit').and.callThrough();
                spyOn(dropdown.onClosed, 'emit').and.callThrough();

                dropdown.toggle();
                tick();
                fixture.detectChanges();
                let focusedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOCUSED}`));
                expect(focusedItem).toBeDefined();

                const dropdownElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROP_DOWN_BASE}`));
                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', dropdownElement);
                fixture.detectChanges();
                focusedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOCUSED}`));
                expect(focusedItem).toBeDefined();
                expect(focusedItem.componentInstance.itemIndex).toEqual(1);

                UIInteractions.triggerEventHandlerKeyDown('Escape', dropdownElement);
                tick();
                fixture.detectChanges();
                expect(dropdown.collapsed).toEqual(true);
                expect(dropdown.onOpening.emit).toHaveBeenCalledTimes(1);
                expect(dropdown.onOpened.emit).toHaveBeenCalledTimes(1);
                expect(dropdown.selection.emit).toHaveBeenCalledTimes(0);
                expect(dropdown.onClosing.emit).toHaveBeenCalledTimes(1);
                expect(dropdown.onClosed.emit).toHaveBeenCalledTimes(1);
            }));
            it('should navigate through items using Up/Down/Home/End keys', fakeAsync(() => {
                dropdown.toggle();
                tick();
                fixture.detectChanges();
                const dropdownElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROP_DOWN_BASE}`));
                dropdownElement.triggerEventHandler('keydown', UIInteractions.getKeyboardEvent('keydown', 'ArrowDown'));
                tick();
                fixture.detectChanges();
                let focusedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOCUSED}`));
                expect(focusedItem.componentInstance.itemIndex).toEqual(1);

                UIInteractions.triggerEventHandlerKeyDown('End', dropdownElement);
                tick();
                fixture.detectChanges();
                focusedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOCUSED}`));
                expect(focusedItem.componentInstance.itemIndex).toEqual(14);

                UIInteractions.triggerEventHandlerKeyDown('ArrowUp', dropdownElement);
                tick();
                fixture.detectChanges();
                focusedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOCUSED}`));
                expect(focusedItem.componentInstance.itemIndex).toEqual(13);

                UIInteractions.triggerEventHandlerKeyDown('Home', dropdownElement);
                tick();
                fixture.detectChanges();
                focusedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOCUSED}`));
                expect(focusedItem.componentInstance.itemIndex).toEqual(0);
            }));
            it('should not change selection when setting it to non-existing item', fakeAsync(() => {
                dropdown.toggle();
                tick();
                fixture.detectChanges();
                dropdown.setSelectedItem(0);
                fixture.detectChanges();
                let selectedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_SELECTED}`));
                expect(selectedItem.componentInstance.itemIndex).toEqual(0);

                dropdown.setSelectedItem(-4);
                fixture.detectChanges();
                expect(dropdown.items[0].selected).toBeTruthy();
                selectedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_SELECTED}`));
                expect(selectedItem.componentInstance.itemIndex).toEqual(0);

                dropdown.setSelectedItem(24);
                fixture.detectChanges();
                expect(dropdown.items[0].selected).toBeTruthy();
                selectedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_SELECTED}`));
                expect(selectedItem.componentInstance.itemIndex).toEqual(0);

                dropdown.setSelectedItem(5);
                fixture.detectChanges();
                expect(dropdown.items[5].selected).toBeTruthy();
                selectedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_SELECTED}`));
                expect(selectedItem.componentInstance.itemIndex).toEqual(5);

                // Verify selecting the already selected element is not affecting selection
                dropdown.setSelectedItem(5);
                fixture.detectChanges();
                expect(dropdown.items[5].selected).toBeTruthy();
                selectedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_SELECTED}`));
                expect(selectedItem.componentInstance.itemIndex).toEqual(5);
            }));
            it('should focus the first enabled item by pressing HOME key', fakeAsync(() => {
                dropdown.items[0].disabled = true;
                dropdown.items[1].isHeader = true;
                dropdown.items[3].disabled = true;
                dropdown.items[4].isHeader = true;
                dropdown.items[7].disabled = true;
                dropdown.items[10].selected = true;
                fixture.detectChanges();
                dropdown.toggle();
                tick();
                fixture.detectChanges();

                const selectedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_SELECTED}`));
                expect(selectedItem.componentInstance.itemIndex).toEqual(10);
                const dropdownElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROP_DOWN_BASE}`));
                UIInteractions.triggerEventHandlerKeyDown('Home', dropdownElement);
                tick();
                fixture.detectChanges();
                expect(dropdown.items[1].focused).toBeTruthy();
                const focusedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOCUSED}`));
                expect(focusedItem.componentInstance.itemIndex).toEqual(1);
            }));
            it('should set isSelected via igxDropDownIteComponent', fakeAsync(() => {
                dropdown.toggle();
                tick();
                fixture.detectChanges();
                expect(dropdown.selectedItem).toBeNull();

                const items = dropdown.items as IgxDropDownItemComponent[];
                items[2].selected = true;
                tick();
                fixture.detectChanges();
                expect(items[2].selected).toBeTruthy();
                expect(dropdown.selectedItem.itemIndex).toEqual(2);

                items[1].selected = true;
                tick();
                fixture.detectChanges();
                expect(items[2].selected).toBeFalsy();
                expect(items[1].selected).toBeTruthy();
                expect(dropdown.selectedItem.itemIndex).toEqual(1);

                dropdown.toggle();
                tick();
                fixture.detectChanges();
                expect(dropdown.selectedItem.itemIndex).toEqual(1);
            }));
            it('should not set isSelected via igxDropDownItemBase on header items', fakeAsync(() => {
                dropdown.items[0].disabled = true;
                dropdown.items[1].isHeader = true;
                dropdown.items[3].disabled = true;
                dropdown.items[4].isHeader = true;
                dropdown.items[7].disabled = true;
                dropdown.items[10].isHeader = true;
                fixture.detectChanges();
                dropdown.toggle();
                tick();
                fixture.detectChanges();

                expect(dropdown.selectedItem).toBeNull();
                const items = dropdown.items as IgxDropDownItemComponent[];
                const headerItems = dropdown.headers as IgxDropDownItemComponent[];

                // Try to select header item
                headerItems[0].selected = true;
                tick();
                fixture.detectChanges();
                expect(headerItems[0].selected).toBeFalsy();
                expect(dropdown.selectedItem).toBeNull();

                // Try to select disabled item
                items[2].selected = true;
                tick();
                fixture.detectChanges();
                expect(items[2].selected).toBeTruthy();
                expect(dropdown.selectedItem.itemIndex).toEqual(2);

                // Try to select header item
                headerItems[1].selected = true;
                expect(headerItems[1].selected).toBeFalsy();
                expect(dropdown.selectedItem.itemIndex).toEqual(2);

                dropdown.toggle();
                tick();
                fixture.detectChanges();
                expect(dropdown.selectedItem.itemIndex).toEqual(2);
            }));
            it('should return the proper eventArgs if selection has been cancelled', fakeAsync(() => {
                spyOn(dropdown.selection, 'emit').and.callThrough();

                dropdown.toggle();
                tick();
                fixture.detectChanges();

                let selectedItem = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_ITEM}`))[3];
                selectedItem.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                const selectionArgs: ISelectionEventArgs = {
                    oldSelection: null,
                    newSelection: dropdown.items[3],
                    cancel: false
                };
                expect(dropdown.selection.emit).toHaveBeenCalledWith(selectionArgs);

                dropdown.selection.pipe(take(1)).subscribe((e: CancelableEventArgs) => e.cancel = true);
                selectedItem = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_ITEM}`))[1];
                selectedItem.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                const canceledSelectionArgs: ISelectionEventArgs = {
                    oldSelection: dropdown.items[3],
                    newSelection: dropdown.items[1],
                    cancel: true
                };
                expect(dropdown.selection.emit).toHaveBeenCalledWith(canceledSelectionArgs);
            }));
            it('should be able to change selection when manipulating ISelectionEventArgs', fakeAsync(() => {
                expect(dropdown.selectedItem).toEqual(null);
                dropdown.toggle();
                tick();
                fixture.detectChanges();

                // Overwrite selection args
                let expectedSelected = dropdown.items[4];
                const calledSelected = dropdown.items[1];
                const subscription = dropdown.selection.subscribe((e: ISelectionEventArgs) => {
                    expect(e.newSelection).toEqual(calledSelected);
                    e.newSelection = expectedSelected;
                });
                dropdown.selectItem(calledSelected);
                tick();
                expect(dropdown.selectedItem).toEqual(expectedSelected);

                // Clear selection
                expectedSelected = null;
                dropdown.selectItem(calledSelected);
                tick();
                expect(dropdown.selectedItem).toEqual(expectedSelected);

                // Set header - error
                dropdown.toggle();
                tick();
                fixture.detectChanges();

                expectedSelected = dropdown.items[4];
                dropdown.items[4].isHeader = true;

                spyOn(dropdown, 'selectItem').and.callThrough();
                expect(() => {
 dropdown.selectItem(calledSelected);
}).toThrow();

                // Set non-IgxDropDownItemBaseDirective
                expectedSelected = 7 as any;
                expect(() => {
 dropdown.selectItem(calledSelected);
}).toThrow();

                subscription.unsubscribe();
            }));
            it('should not take focus when allowItemsFocus is set to false', fakeAsync(() => {
                dropdown.toggle();
                tick();
                fixture.detectChanges();
                const focusedItem = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_ITEM}`))[0].nativeElement;
                expect(document.activeElement).toEqual(focusedItem);

                dropdown.toggle();
                tick();
                fixture.detectChanges();

                dropdown.allowItemsFocus = false;
                tick();
                fixture.detectChanges();

                const button = fixture.debugElement.query(By.css('button')).nativeElement;
                button.focus();
                button.click();
                tick();
                fixture.detectChanges();
                expect(document.activeElement).toEqual(button);
            }));
            it('should not be able to select disabled and header items', fakeAsync(() => {
                dropdown.items[2].isHeader = true;
                dropdown.items[4].disabled = true;
                fixture.detectChanges();

                dropdown.toggle();
                tick();
                fixture.detectChanges();
                const currentItem = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DISABLED}`))[0];
                const headerItem = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_HEADER}`))[0];
                expect(currentItem.componentInstance.itemIndex).toEqual(4);
                expect(headerItem.componentInstance).toEqual(dropdown.headers[0]);

                currentItem.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(dropdown.selectedItem).toBeNull();

                headerItem.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(dropdown.selectedItem).toBeNull();

                // clicking on header item should not close the drop down
                expect(dropdown.collapsed).toEqual(false);
            }));
            it('should be possible to enable/disable items at runtime', fakeAsync(() => {
                dropdown.items[3].disabled = true;
                dropdown.items[7].disabled = true;
                dropdown.items[11].disabled = true;
                fixture.detectChanges();

                dropdown.toggle();
                tick();
                fixture.detectChanges();
                let disabledItems = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DISABLED}`));
                expect(disabledItems.length).toEqual(3);
                expect(dropdown.items[4].disabled).toBeFalsy();

                dropdown.items[4].disabled = true;
                fixture.detectChanges();
                disabledItems = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DISABLED}`));
                expect(disabledItems.length).toEqual(4);
                expect(dropdown.items[4].disabled).toBeTruthy();
            }));
            it('should focus the last enabled item by pressing END key', fakeAsync(() => {
                dropdown.items[0].disabled = true;
                dropdown.items[1].isHeader = true;
                dropdown.items[3].disabled = true;
                dropdown.items[4].isHeader = true;
                dropdown.items[7].disabled = true;
                dropdown.items[10].selected = true;
                dropdown.items[12].disabled = true;
                fixture.detectChanges();
                dropdown.toggle();
                tick();
                fixture.detectChanges();

                const selectedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_SELECTED}`));
                expect(selectedItem.componentInstance.itemIndex).toEqual(10);

                const dropdownElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROP_DOWN_BASE}`));
                UIInteractions.triggerEventHandlerKeyDown('End', dropdownElement);
                tick();
                fixture.detectChanges();
                expect(dropdown.items[11].focused).toBeTruthy();
                let focusedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOCUSED}`));
                expect(focusedItem.componentInstance.itemIndex).toEqual(11);

                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', dropdownElement);
                tick();
                fixture.detectChanges();
                expect(dropdown.items[11].focused).toBeTruthy();
                focusedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOCUSED}`));
                expect(focusedItem.componentInstance.itemIndex).toEqual(11);
            }));
            it('should skip disabled/header items on key navigation', fakeAsync(() => {
                dropdown.items[0].disabled = true;
                dropdown.items[1].isHeader = true;
                dropdown.items[3].disabled = true;
                dropdown.items[8].isHeader = true;
                dropdown.items[9].disabled = true;
                dropdown.items[10].selected = true;
                dropdown.items[12].disabled = true;
                fixture.detectChanges();
                dropdown.toggle();
                tick();
                fixture.detectChanges();

                const dropdownElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROP_DOWN_BASE}`));
                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', dropdownElement);
                tick();
                fixture.detectChanges();
                expect(dropdown.items[11].focused).toBeTruthy();
                let focusedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOCUSED}`));
                expect(focusedItem.componentInstance.itemIndex).toEqual(11);

                UIInteractions.triggerEventHandlerKeyDown('ArrowUp', dropdownElement);
                tick();
                fixture.detectChanges();
                expect(dropdown.items[10].focused).toBeTruthy();
                focusedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOCUSED}`));
                expect(focusedItem.componentInstance.itemIndex).toEqual(10);

                UIInteractions.triggerEventHandlerKeyDown('ArrowUp', dropdownElement);
                tick();
                fixture.detectChanges();
                expect(dropdown.items[8].focused).toBeTruthy();
                focusedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOCUSED}`));
                expect(focusedItem.componentInstance.itemIndex).toEqual(8);

                UIInteractions.triggerEventHandlerKeyDown('ArrowUp', dropdownElement);
                tick();
                fixture.detectChanges();
                expect(dropdown.items[7].focused).toBeTruthy();
                focusedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOCUSED}`));
                expect(focusedItem.componentInstance.itemIndex).toEqual(7);
            }));
            it('should select disabled items via code behind', fakeAsync(() => {
                dropdown.items[0].disabled = true;
                dropdown.items[1].isHeader = true;
                fixture.detectChanges();
                dropdown.setSelectedItem(0);
                fixture.detectChanges();
                dropdown.toggle();
                tick();
                fixture.detectChanges();
                expect(dropdown.items[0].selected).toBeTruthy();
            }));
            it('should not move the focus when clicking a disabled item', fakeAsync(() => {
                dropdown.items[0].disabled = true;
                dropdown.items[1].isHeader = true;
                dropdown.items[3].disabled = true;
                dropdown.items[4].isHeader = true;
                dropdown.items[7].disabled = true;
                dropdown.items[10].selected = true;
                fixture.detectChanges();
                dropdown.toggle();
                tick();
                fixture.detectChanges();
                expect(dropdown.items[10].focused).toEqual(true);

                const dropdownElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROP_DOWN_BASE}`));
                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', dropdownElement);
                fixture.detectChanges();
                expect(dropdown.items[11].focused).toEqual(true);

                const firstItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_ITEM}`));
                firstItem.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(dropdown.items[11].focused).toEqual(true);

                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', dropdownElement);
                fixture.detectChanges();
                expect(dropdown.items[12].focused).toEqual(true);
            }));
        });
        describe('Other', () => {
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        DoubleIgxDropDownComponent,
                        InputWithDropDownDirectiveComponent
                    ],
                    imports: [
                        IgxDropDownModule,
                        NoopAnimationsModule,
                        IgxToggleModule,
                        IgxTabsModule,
                        IgxForOfModule
                    ]
                }).compileComponents();
            }));
            it('should call preventDefault on a mousedown event when allowItemsFocus is disabled', () => {
                fixture = TestBed.createComponent(InputWithDropDownDirectiveComponent);
                fixture.detectChanges();

                dropdown = fixture.componentInstance.dropdown;
                dropdown.allowItemsFocus = false;
                fixture.detectChanges();

                dropdown.open();
                fixture.detectChanges();

                const itemToClick = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_ITEM}`))[0];

                const event = new Event('mousedown', { });
                spyOn(event, 'preventDefault');
                itemToClick.triggerEventHandler('mousedown', event);

                fixture.detectChanges();
                expect(event.preventDefault).toHaveBeenCalled();
            });
            it('should properly handle OnEnterKeyDown when the dropdown is not visible', fakeAsync(() => {
                fixture = TestBed.createComponent(InputWithDropDownDirectiveComponent);
                fixture.detectChanges();
                dropdown = fixture.componentInstance.dropdown;
                const input = fixture.debugElement.query(By.css('input'));
                spyOn(dropdown, 'selectItem').and.callThrough();

                expect(dropdown).toBeDefined();
                expect(dropdown.focusedItem).toEqual(null);
                expect(dropdown.selectedItem).toEqual(null);
                expect(dropdown.selectItem).toHaveBeenCalledTimes(0);
                expect(dropdown.collapsed).toEqual(true);

                input.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(dropdown.collapsed).toEqual(true);
                expect(dropdown.selectItem).toHaveBeenCalledTimes(0);
                expect(dropdown.focusedItem).toEqual(null);

                UIInteractions.triggerEventHandlerKeyDown('Enter', input);
                tick();
                fixture.detectChanges();
                // does not attempt to select item on keydown if DD is closed;
                expect(dropdown.selectItem).toHaveBeenCalledTimes(0);
                expect(dropdown.selectedItem).toEqual(null);
                expect(dropdown.collapsed).toEqual(true);

                dropdown.toggle();
                tick();
                fixture.detectChanges();
                expect(dropdown.collapsed).toEqual(false);
                expect(dropdown.focusedItem).toEqual(dropdown.items[0]);

                const dropdownItem = dropdown.items[0];
                input.triggerEventHandler('keydown', UIInteractions.getKeyboardEvent('keydown', 'Enter'));
                tick();
                fixture.detectChanges();
                expect(dropdown.selectItem).toHaveBeenCalledTimes(1);
                expect(dropdown.selectItem).toHaveBeenCalledWith(dropdownItem, UIInteractions.getKeyboardEvent('keydown', 'Enter'));
                expect(dropdown.selectedItem).toEqual(dropdownItem);
                expect(dropdown.collapsed).toEqual(true);
            }));
            it('should keep selection per instance', () => {
                fixture = TestBed.createComponent(DoubleIgxDropDownComponent);
                fixture.detectChanges();
                const dropdown1 = fixture.componentInstance.dropdown1;
                const dropdown2 = fixture.componentInstance.dropdown2;
                dropdown1.setSelectedItem(1);
                expect(dropdown1.selectedItem).toEqual(dropdown1.items[1]);
                expect(dropdown2.selectedItem).toEqual(null);
                dropdown2.setSelectedItem(3);
                expect(dropdown1.selectedItem).toEqual(dropdown1.items[1]);
                expect(dropdown2.selectedItem).toEqual(dropdown2.items[3]);
                dropdown1.setSelectedItem(5);
                expect(dropdown1.selectedItem).toEqual(dropdown1.items[5]);
                expect(dropdown2.selectedItem).toEqual(dropdown2.items[3]);
            });
        });
    });
    describe('Virtualisation tests', () => {
        let scroll: IgxForOfDirective<any>;
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    VirtualizedDropDownComponent
                ],
                imports: [
                    IgxDropDownModule,
                    NoopAnimationsModule,
                    IgxToggleModule,
                    IgxForOfModule
                ]
            }).compileComponents();
        }));
        beforeEach(() => {
            fixture = TestBed.createComponent(VirtualizedDropDownComponent);
            fixture.detectChanges();
            dropdown = fixture.componentInstance.dropdown;
            scroll = fixture.componentInstance.virtualScroll;
            items = fixture.componentInstance.dropdownItems;
        });
        it('should properly scroll when virtualized', async () => {
            dropdown.toggle();
            fixture.detectChanges();
            await wait(50);
            let firstItemElement = fixture.componentInstance.dropdownItems.first.element.nativeElement;
            let lastItemElement = fixture.componentInstance.dropdownItems.last.element.nativeElement;
            expect(lastItemElement.textContent.trim()).toEqual('Item 11');
            expect(firstItemElement.textContent.trim()).toEqual('Item 1');
            scroll.getScroll().scrollTop = scroll.getScroll().scrollHeight;
            fixture.detectChanges();
            await wait(50);
            firstItemElement = fixture.componentInstance.dropdownItems.first.element.nativeElement;
            lastItemElement = fixture.componentInstance.dropdownItems.last.element.nativeElement;
            expect(firstItemElement.textContent.trim()).toEqual('Item 1990');
            expect(lastItemElement.textContent.trim()).toEqual('Item 2000');
        });
        xit('Should properly handle keyboard navigation when virtualized', async () => {
            pending('does not have time to focus last item on navigateLast()');
            // dropdown.toggle();
            // fixture.detectChanges();
            // dropdown.navigateFirst();
            // expect(scroll.state.startIndex).toEqual(0);
            // expect(items.first.focused).toEqual(true);
            // dropdown.navigateLast();
            // await wait(200);
            // fixture.detectChanges();
            // expect(scroll.state.startIndex).toEqual(2000 - scroll.state.chunkSize);
            // expect(items.last.focused).toEqual(true);
            // const toggleBtn = fixture.debugElement.query(By.css('button'));
            // UIInteractions.triggerEventHandlerKeyDown('ArrowUp', toggleBtn);
            // await wait(30);
            // fixture.detectChanges();
            // expect(scroll.state.startIndex).toEqual(2000 - scroll.state.chunkSize);
            // expect(items.toArray()[items.toArray().length - 2].focused).toEqual(true);
        });
        it('should persist selection on scrolling', async () => {
            dropdown.toggle();
            expect(dropdown.selectedItem).toBe(null);
            dropdown.selectItem(dropdown.items[5]);
            fixture.detectChanges();
            expect(dropdown.selectedItem.value).toEqual({ name: fixture.componentInstance.items[5].name, id: 5 });
            expect(dropdown.items[5].selected).toBeTruthy();
            scroll.scrollTo(412);
            await wait(50);
            fixture.detectChanges();
            expect(items.toArray()[5].selected).toBeFalsy();
            expect(document.getElementsByClassName(CSS_CLASS_SELECTED).length).toEqual(0);
            scroll.scrollTo(0);
            await wait(50);
            fixture.detectChanges();
            expect(items.toArray()[5].selected).toBeTruthy();
            expect(document.getElementsByClassName(CSS_CLASS_SELECTED).length).toEqual(1);
        });
        it('should properly select items both inside and outside of the virtual view', async () => {
            dropdown.toggle();
            expect(dropdown.selectedItem).toBe(null);
            let selectedItem = { value: fixture.componentInstance.items[5], index: 5 } as IgxDropDownItemBaseDirective;
            dropdown.selectItem(selectedItem);
            fixture.detectChanges();
            expect(dropdown.selectedItem as any).toEqual(selectedItem);
            expect(items.toArray()[5].selected).toEqual(true);
            selectedItem = { value: fixture.componentInstance.items[412], index: 412 } as IgxDropDownItemBaseDirective;
            dropdown.selectItem(selectedItem);
            fixture.detectChanges();
            expect(dropdown.selectedItem as any).toEqual(selectedItem);
            expect(items.toArray()[5].selected).toEqual(false);
            scroll.scrollTo(412);
            await wait(50);
            fixture.detectChanges();
            const selectedEntry = items.find(e => e.value === selectedItem.value && e.index === selectedItem.index);
            expect(selectedEntry).toBeTruthy();
            expect(selectedEntry.selected).toBeTruthy();
        });
        it('should scroll selected item into view when virtualized', async () => {
            dropdown.toggle();
            expect(dropdown.selectedItem).toBe(null);
            const virtualScroll = fixture.componentInstance.virtualScroll;
            const selectedItem = { value: fixture.componentInstance.items[1000], index: 1000 } as IgxDropDownItemBaseDirective;
            dropdown.selectItem(selectedItem);
            fixture.detectChanges();
            dropdown.toggle();
            await wait(50);
            dropdown.toggle();
            await wait(50);
            const itemsInView = virtualScroll.igxForContainerSize / virtualScroll.igxForItemSize;
            const expectedScroll = virtualScroll.getScrollForIndex(selectedItem.index)
                - (itemsInView / 2 - 1) * virtualScroll.igxForItemSize;
            const acceptableDelta = virtualScroll.igxForItemSize;
            const scrollTop = virtualScroll.getScroll().scrollTop;
            expect(expectedScroll - acceptableDelta < scrollTop && expectedScroll + acceptableDelta > scrollTop).toBe(true);
        });
    });
    describe('Rendering', () => {
        describe('Grouped items', () => {
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        GroupDropDownComponent
                    ],
                    imports: [
                        IgxDropDownModule,
                        NoopAnimationsModule,
                        IgxToggleModule,
                        IgxTabsModule,
                        IgxForOfModule
                    ]
                }).compileComponents();
            }));
            beforeEach(() => {
                fixture = TestBed.createComponent(GroupDropDownComponent);
                fixture.detectChanges();
                dropdown = fixture.componentInstance.dropDown;
            });
            it('should properly render item groups aria attributes', () => {
                const groups = fixture.componentInstance.groups;
                expect(dropdown.collapsed).toBeTruthy();
                dropdown.toggle();
                fixture.detectChanges();
                const groupItems = document.querySelectorAll(`.${CSS_CLASS_GROUP_ITEM}`);
                for (let i = 0; i < groupItems.length; i++) {
                    const elemAttr = groupItems[i].attributes;
                    expect(elemAttr['aria-disabled'].value).toEqual('false');
                    expect(elemAttr['aria-labelledby'].value).toEqual(`igx-item-group-label-${i}`);
                    expect(elemAttr['role'].value).toEqual(`group`);
                }
                groups.first.disabled = true;
                fixture.detectChanges();
                expect(document.querySelectorAll(`.${CSS_CLASS_GROUP_ITEM}`)[0].attributes['aria-disabled'].value).toEqual('true');
            });
            it('should properly display items within dropdown groups', () => {
                const items = fixture.componentInstance.data;
                dropdown.toggle();
                fixture.detectChanges();
                expect(dropdown.collapsed).toBeFalsy();
                const dropdownItems = document.querySelectorAll(`.${CSS_CLASS_INNER_SPAN}`);
                expect(dropdownItems.length).toEqual(9);
                expect(dropdown.items.length).toEqual(9);
                for (let i = 0; i < dropdownItems.length; i++) {
                    const currentIndex = Math.floor(i / 3);
                    expect(dropdownItems[i].innerHTML.trim()).toEqual(items[currentIndex].children[i % 3].name);
                    expect(dropdown.items[i].value).toEqual(items[currentIndex].children[i % 3].value);
                }
            });
            it('should properly disable all items within a disabled group', () => {
                const groups = fixture.componentInstance.groups;
                const items = fixture.componentInstance.items;
                dropdown.toggle();
                fixture.detectChanges();
                groups.first.disabled = true;
                fixture.detectChanges();
                const dropdownItems = document.querySelectorAll(`.${CSS_CLASS_ITEM}`);
                const disabledItems = document.querySelectorAll(`.${CSS_CLASS_DISABLED}`);
                expect(dropdownItems.length).toEqual(9);
                expect(dropdown.items.length).toEqual(9);
                expect(disabledItems.length).toEqual(3);
                const disabledGroup = [...items.toArray()].splice(0, 3);
                for (const group of disabledGroup) {
                    expect(group.disabled).toEqual(true);
                }
            });
        });
        describe('Style and display density', () => {
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxDropDownTestComponent
                    ],
                    imports: [
                        IgxDropDownModule,
                        NoopAnimationsModule,
                        IgxToggleModule,
                        IgxForOfModule
                    ]
                }).compileComponents();
            }));
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxDropDownTestComponent);
                fixture.detectChanges();
                dropdown = fixture.componentInstance.dropdown;
            });
            it('should be able to set Display Density as input', () => {
                expect(dropdown.displayDensity).toEqual(DisplayDensity.cosy);
                fixture.componentInstance.density = DisplayDensity.compact;
                fixture.detectChanges();
                expect(dropdown.displayDensity).toEqual(DisplayDensity.compact);
                fixture.componentInstance.density = DisplayDensity.comfortable;
                fixture.detectChanges();
                expect(dropdown.displayDensity).toEqual(DisplayDensity.comfortable);
            });
            it('should apply correct styles to items when Display Density is set', () => {
                dropdown.toggle();
                fixture.detectChanges();
                expect(dropdown.items.length).toEqual(document.getElementsByClassName(CSS_CLASS_ITEM_COSY).length);
                expect(dropdown.headers.length).toEqual(document.getElementsByClassName(CSS_CLASS_HEADER_COSY).length);
                fixture.componentInstance.density = DisplayDensity.compact;
                fixture.detectChanges();
                expect(dropdown.items.length).toEqual(document.getElementsByClassName(CSS_CLASS_ITEM_COMPACT).length);
                expect(dropdown.headers.length).toEqual(document.getElementsByClassName(CSS_CLASS_HEADER_COMPACT).length);
                fixture.componentInstance.density = DisplayDensity.comfortable;
                fixture.detectChanges();
                expect(dropdown.items.length).toEqual(document.getElementsByClassName(CSS_CLASS_ITEM).length);
                expect(dropdown.headers.length).toEqual(document.getElementsByClassName(CSS_CLASS_HEADER).length);
                expect(document.getElementsByClassName(CSS_CLASS_ITEM_COMPACT).length).toEqual(0);
                expect(document.getElementsByClassName(CSS_CLASS_ITEM_COSY).length).toEqual(0);
            });
            it('should apply selected item class', fakeAsync(() => {
                dropdown.toggle();
                tick();
                fixture.detectChanges();
                const selectedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_ITEM}`));
                expect(selectedItem.classes[CSS_CLASS_SELECTED]).toBeFalsy();

                dropdown.setSelectedItem(0);
                tick();
                fixture.detectChanges();
                expect(selectedItem.classes[CSS_CLASS_SELECTED]).toBeTruthy();

                dropdown.clearSelection();
                tick();
                fixture.detectChanges();
                expect(selectedItem.classes[CSS_CLASS_SELECTED]).toBeFalsy();
            }));
        });
        describe('Input properties', () => {
            const customDDId = 'test-id-list';
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxDropDownTestComponent
                    ],
                    imports: [
                        IgxDropDownModule,
                        NoopAnimationsModule,
                        IgxToggleModule,
                        IgxForOfModule
                    ]
                }).compileComponents();
            }));
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxDropDownTestComponent);
                fixture.detectChanges();
                dropdown = fixture.componentInstance.dropdown;
            });
            it('should return items/headers property correctly', fakeAsync(() => {
                dropdown.toggle();
                tick();
                fixture.detectChanges();
                expect(dropdown.items.length).toEqual(15);
                expect(dropdown.headers).toEqual([]);

                dropdown.toggle();
                tick();
                fixture.detectChanges();
                dropdown.items[0].disabled = true;
                dropdown.items[1].isHeader = true;
                dropdown.items[3].disabled = true;
                dropdown.items[4].isHeader = true;
                dropdown.items[7].disabled = true;
                dropdown.items[10].isHeader = true;
                fixture.detectChanges();
                dropdown.toggle();
                tick();
                fixture.detectChanges();
                expect(dropdown.items.length).toEqual(12);
                expect(dropdown.headers).toBeTruthy();
                expect(dropdown.headers.length).toEqual(3);
            }));
            it('should properly set maxHeight option', () => {
                fixture.componentInstance.maxHeight = '100px';
                fixture.detectChanges();
                dropdown.toggle();
                fixture.detectChanges();
                const ddList = fixture.debugElement.query(By.css(`.${CSS_CLASS_SCROLL}`)).nativeElement;
                expect(parseInt(ddList.style.maxHeight, 10)).toEqual(ddList.offsetHeight);
                expect(ddList.style.maxHeight).toBe('100px');
            });
            it('should properly set maxHeight option when maxHeight value is larger than needed)', () => {
                fixture.componentInstance.maxHeight = '700px';
                fixture.detectChanges();
                dropdown.toggle();
                fixture.detectChanges();
                const ddList = fixture.debugElement.query(By.css(`.${CSS_CLASS_SCROLL}`)).nativeElement;
                expect(parseInt(ddList.style.maxHeight, 10)).toBeGreaterThan(ddList.offsetHeight);
                expect(ddList.style.maxHeight).toBe('700px');
            });
            it('should set custom id, width/height properties runtime', () => {
                fixture.componentInstance.dropdown.width = '80%';
                fixture.componentInstance.dropdown.height = '400px';

                dropdown.toggle();
                fixture.detectChanges();
                const ddList = fixture.debugElement.query(By.css(`.${CSS_CLASS_LIST}`)).nativeElement;
                const ddListScroll = fixture.debugElement.query(By.css(`.${CSS_CLASS_SCROLL}`)).nativeElement;
                expect(ddListScroll.style.height).toBe('400px');
                expect(ddList.style.width).toBe('80%');
                expect(ddListScroll.id).toEqual(customDDId);
            });
        });
        describe('Anchor element', () => {
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxDropDownAnchorTestComponent
                    ],
                    imports: [
                        IgxDropDownModule,
                        NoopAnimationsModule,
                        IgxToggleModule,
                        IgxTabsModule,
                        IgxForOfModule
                    ]
                }).compileComponents();
            }));
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxDropDownAnchorTestComponent);
                fixture.detectChanges();
                dropdown = fixture.componentInstance.dropdown;
            });
            it('should bind to different anchor elements', fakeAsync(() => {
                const tabs = fixture.debugElement.query(By.css(CSS_CLASS_TABS));
                const input = fixture.debugElement.query(By.css('input'));
                const img = fixture.debugElement.query(By.css('img'));
                spyOn(dropdown.onOpening, 'emit').and.callThrough();
                spyOn(dropdown.onOpened, 'emit').and.callThrough();
                spyOn(dropdown.onClosing, 'emit').and.callThrough();
                spyOn(dropdown.onClosed, 'emit').and.callThrough();
                tabs.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(dropdown.onOpening.emit).toHaveBeenCalledTimes(1);
                expect(dropdown.onOpened.emit).toHaveBeenCalledTimes(1);
                let dropdownItems = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_ITEM}`));
                dropdownItems[2].triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(dropdown.onClosing.emit).toHaveBeenCalledTimes(1);
                expect(dropdown.onClosed.emit).toHaveBeenCalledTimes(1);

                input.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(dropdown.onOpening.emit).toHaveBeenCalledTimes(2);
                expect(dropdown.onOpened.emit).toHaveBeenCalledTimes(2);
                dropdownItems = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_ITEM}`));
                dropdownItems[1].triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(dropdown.onClosing.emit).toHaveBeenCalledTimes(2);
                expect(dropdown.onClosed.emit).toHaveBeenCalledTimes(2);

                img.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(dropdown.onOpening.emit).toHaveBeenCalledTimes(3);
                expect(dropdown.onOpened.emit).toHaveBeenCalledTimes(3);
                dropdownItems = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_ITEM}`));
                dropdownItems[0].triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(dropdown.onClosing.emit).toHaveBeenCalledTimes(3);
                expect(dropdown.onClosed.emit).toHaveBeenCalledTimes(3);
            }));
        });
    });
});

@Component({
    template: `
    <button (click)="toggleDropDown()">Toggle</button>
    <igx-drop-down id="test-id" igxDropDownItemNavigation [maxHeight]="maxHeight"
    [displayDensity]="density" [allowItemsFocus]="true">
        <igx-drop-down-item *ngFor="let item of items"
        [disabled]="item.disabled" [isHeader]="item.header" [selected]="item.selected">
            {{item.field}}
        </igx-drop-down-item>
    </igx-drop-down>`
})
class IgxDropDownTestComponent {

    @ViewChild(IgxDropDownComponent, { read: IgxDropDownComponent, static: true })
    public dropdown: IgxDropDownComponent;
    public maxHeight: string;
    public density: DisplayDensity = DisplayDensity.cosy;

    public items: any[] = [
        { field: 'Item 1' },
        { field: 'Item 2' },
        { field: 'Item 3' },
        { field: 'Item 4' },
        { field: 'Item 5' },
        { field: 'Item 6' },
        { field: 'Item 7' },
        { field: 'Item 8' },
        { field: 'Item 9' },
        { field: 'Item 10' },
        { field: 'Item 11' },
        { field: 'Item 12' },
        { field: 'Item 13' },
        { field: 'Item 14' },
        { field: 'Item 15' }
    ];

    public toggleDropDown() {
        this.dropdown.toggle();
    }
}
@Component({
    template: `
    <button (click)="selectItem5()">Select 5</button>
    <igx-drop-down #dropdown1>
        <igx-drop-down-item *ngFor="let item of items">
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>
    <igx-drop-down #dropdown2>
        <igx-drop-down-item *ngFor="let item of items">
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>
    `
})
class DoubleIgxDropDownComponent implements OnInit {

    @ViewChild('dropdown1', { read: IgxDropDownComponent, static: true })
    public dropdown1: IgxDropDownComponent;

    @ViewChild('dropdown2', { read: IgxDropDownComponent, static: true })
    public dropdown2: IgxDropDownComponent;

    public items: any[] = [];

    public ngOnInit() {
        for (let index = 1; index < 100; index++) {
            this.items.push({ field: 'Item ' + index });
        }
    }
}

@Component({
    template: `
    <input (click)="toggleDropDown()">
    <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" (click)="toggleDropDown()">
    <igx-tabs (selectedItemChange)="toggleDropDown()" [tabAlignment]="justify">
        <igx-tab-item>
            <igx-tab-header>
                Tab111111111111111111111111
            </igx-tab-header>
            <igx-tab-content>
                <h1>Tab 1 Content</h1>
            </igx-tab-content>
        </igx-tab-item>
        <igx-tab-item [selected]="true">
            <igx-tab-header>
                Tab 2
            </igx-tab-header>
            <igx-tab-content>
                <h1>Tab 2 Content</h1>
            </igx-tab-content>
        </igx-tab-item>
        <igx-tab-item>
            <igx-tab-header>
                Tab 3
            </igx-tab-header>
            <igx-tab-content>
                <h1>Tab 3 Content</h1>
            </igx-tab-content>
        </igx-tab-item>
    </igx-tabs>
    <igx-drop-down igxDropDownItemNavigation (onSelection)="selection($event)"
    (onOpening)="onToggleOpening()" (onOpened)="onToggleOpened()"
    (onClosing)="onToggleClosing()" (onClosed)="onToggleClosed()" [width]="'400px'" [height]="'400px'">
        <igx-drop-down-item *ngFor="let item of items">
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>`
})
class IgxDropDownAnchorTestComponent {
    @ViewChild(IgxTabsComponent, { static: true })
    public tabs: IgxTabsComponent;
    @ViewChild(IgxDropDownComponent, { read: IgxDropDownComponent, static: true })
    public dropdown: IgxDropDownComponent;

    public items: any[] = [
        { field: 'Nav1' },
        { field: 'Nav2' },
        { field: 'Nav3' },
        { field: 'Nav4' }
    ];

    public toggleDropDown() {
        this.dropdown.toggle();
    }

    public onSelection() { }

    public onToggleOpening() { }

    public onToggleOpened() { }

    public onToggleClosing() { }

    public onToggleClosed() { }
}
@Component({
    template: ` <input #inputElement [igxDropDownItemNavigation]="dropdownElement" class='test-input' type='text' value='Focus Me!'/>
    <igx-drop-down #dropdownElement [width]="'400px'" [height]="'400px'" [allowItemsFocus]="true">
        <igx-drop-down-item *ngFor="let item of items">
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>`
})
class InputWithDropDownDirectiveComponent {
    @ViewChild(IgxDropDownComponent, { read: IgxDropDownComponent, static: true })
    public dropdown: IgxDropDownComponent;

    @ViewChild(`inputElement`, { static: true })
    public inputElement: ElementRef;

    public items: any[] = [
        { field: 'Nav1' },
        { field: 'Nav2' },
        { field: 'Nav3' },
        { field: 'Nav4' }
    ];
}
@Component({
    template: `
    <igx-drop-down>
        <igx-drop-down-item-group *ngFor="let parent of data" [label]="parent.name">
            <igx-drop-down-item *ngFor="let child of parent.children" [value]="child.value">
                {{ child.name }}
            </igx-drop-down-item>
        </igx-drop-down-item-group>
    </igx-drop-down>`
})
class GroupDropDownComponent {
    @ViewChild(IgxDropDownComponent, { read: IgxDropDownComponent, static: true })
    public dropDown: IgxDropDownComponent;
    @ViewChildren(IgxDropDownGroupComponent, { read: IgxDropDownGroupComponent })
    public groups: QueryList<IgxDropDownGroupComponent>;
    @ViewChildren(IgxDropDownItemComponent, { read: IgxDropDownItemComponent })
    public items: QueryList<IgxDropDownItemComponent>;
    public data = [];
    constructor() {
        for (let i = 0; i < 3; i++) {
            this.data.push({
                name: `Parent ${i + 1}`,
                children: []
            });
            for (let j = 0; j < 3; j++) {
                this.data[i].children.push({
                    name: `Child ${j + 1} of Parent ${i + 1}`,
                    value: `custom-${i + '_' + j}`
                });
            }
        }
    }
}
@Component({
    template: `
        <button igxButton #toggleButton [igxToggleAction]="dropdown" [igxDropDownItemNavigation]="dropdown">Toggle Virtual</button>
        <igx-drop-down #dropdown [allowItemsFocus]="true">
            <div class="wrapping-div">
                <igx-drop-down-item
                *igxFor="let item of items; index as index;
                scrollOrientation: 'vertical'; containerSize: itemsMaxHeight; itemSize: itemHeight;"
                [value]="item" role="option"
                [disabled]="index > 53 && index < 57"
                [index]="index">
                    {{ item.name }}
                </igx-drop-down-item>
            </div>
        </igx-drop-down>
    `,
    styles: [`
    .wrapping-div {
        overflow: hidden;
        height: 400px;
    }
    `]
})
class VirtualizedDropDownComponent {
    @ViewChild('toggleButton', { read: ElementRef, static: true })
    public toggleButton: ElementRef;
    @ViewChild(IgxDropDownComponent, { static: true })
    public dropdown: IgxDropDownComponent;
    @ViewChild(IgxForOfDirective, { read: IgxForOfDirective, static: true })
    public virtualScroll: IgxForOfDirective<any>;
    @ViewChildren(IgxDropDownItemComponent)
    public dropdownItems: QueryList<IgxDropDownItemComponent>;
    public items = [];
    public itemsMaxHeight = 400;
    public itemHeight = 40;
    constructor() {
        this.items = Array.apply(null, { length: 2000 }).map((e, i) => ({
            name: `Item ${i + 1}`,
            id: i
        }));
    }
}
