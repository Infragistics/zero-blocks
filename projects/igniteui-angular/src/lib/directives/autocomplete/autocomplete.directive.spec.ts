import { Component, ViewChild, Pipe, PipeTransform, ElementRef } from '@angular/core';
import { TestBed, tick, fakeAsync, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxAutocompleteModule, IgxAutocompleteDirective, AutocompleteOverlaySettings } from './autocomplete.directive';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxInputDirective } from '../input/input.directive';
import { IgxInputGroupModule, IgxInputGroupComponent } from '../../input-group/public_api';
import { IgxDropDownModule, IgxDropDownComponent, IgxDropDownItemNavigationDirective } from '../../drop-down/public_api';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IgxIconModule } from '../../icon/public_api';
import { ConnectedPositioningStrategy, VerticalAlignment, HorizontalAlignment } from '../../services/public_api';

const CSS_CLASS_DROPDOWNLIST = 'igx-drop-down__list';
const CSS_CLASS_DROPDOWNLIST_SCROLL = 'igx-drop-down__list-scroll';
const CSS_CLASS_DROP_DOWN_ITEM = 'igx-drop-down__item';
const CSS_CLASS_DROP_DOWN_ITEM_FOCUSED = 'igx-drop-down__item--focused';
const INPUT_CSS_CLASS = 'igx-input-group__input';

describe('IgxAutocomplete', () => {
    let fixture;
    let autocomplete: IgxAutocompleteDirective;
    let group: IgxInputGroupComponent;
    let input: IgxInputDirective;
    let dropDown: IgxDropDownComponent;
    configureTestSuite();

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                AutocompleteComponent,
                AutocompleteInputComponent,
                AutocompleteFormComponent,
                IgxAutocompletePipeStartsWith
            ],
            imports: [
                IgxInputGroupModule,
                IgxDropDownModule,
                IgxAutocompleteModule,
                FormsModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
                IgxIconModule
            ]
        })
            .compileComponents();
    }));
    describe('General tests: ', () => {
        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(AutocompleteComponent);
            fixture.detectChanges();
            autocomplete = fixture.componentInstance.autocomplete;
            group = fixture.componentInstance.group;
            input = fixture.componentInstance.input;
            dropDown = fixture.componentInstance.dropDown;
        }));
        it('Should open/close dropdown properly', fakeAsync(() => {
            UIInteractions.setInputElementValue(input, 's', fixture);
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeFalsy();

            UIInteractions.triggerKeyDownEvtUponElem('escape', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();

            input.nativeElement.click();
            UIInteractions.setInputElementValue(input, 'a', fixture);
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeFalsy();

            autocomplete.onTab();
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();

            autocomplete.open();
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeFalsy();

            autocomplete.close();
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
        }));
        it('Should open drop down on (Alt+)ArrowUp/ArrowDown', fakeAsync(() => {
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeFalsy();
            expect(dropDown.items[0].focused).toBeTruthy();

            UIInteractions.triggerKeyDownEvtUponElem('escape', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeFalsy();
            expect(dropDown.items[0].focused).toBeTruthy();

            UIInteractions.triggerKeyDownEvtUponElem('escape', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();

            const altKey = true;
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true, altKey);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeFalsy();
            expect(dropDown.items[0].focused).toBeTruthy();

            UIInteractions.triggerKeyDownEvtUponElem('escape', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true, altKey);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeFalsy();
            expect(dropDown.items[0].focused).toBeTruthy();

            UIInteractions.triggerKeyDownEvtUponElem('escape', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
        }));
        it('Should close the dropdown when no items match the filter', fakeAsync(() => {
            expect((autocomplete as any).collapsed).toEqual(true);
            spyOn(autocomplete.target, 'close').and.callThrough();
            spyOn(autocomplete, 'open').and.callThrough();
            spyOn(autocomplete.target, 'open').and.callThrough();
            expect(autocomplete.target.close).not.toHaveBeenCalled();
            UIInteractions.setInputElementValue(input, 'a', fixture);
            tick();
            expect(autocomplete.open).toHaveBeenCalledTimes(1);
            expect(autocomplete.target.open).toHaveBeenCalledTimes(1);
            expect(autocomplete.target.collapsed).toEqual(false);

            UIInteractions.setInputElementValue(input, 'ax', fixture);
            tick();
            expect(autocomplete.target.close).toHaveBeenCalledTimes(1);
            expect(autocomplete.open).toHaveBeenCalledTimes(2);
            expect(autocomplete.target.open).toHaveBeenCalledTimes(1);
            expect(autocomplete.target.collapsed).toEqual(true);


            // Should not try to reopen if no items
            UIInteractions.setInputElementValue(input, 'axx', fixture);
            tick();
            expect(autocomplete.target.close).toHaveBeenCalledTimes(1);
            expect(autocomplete.open).toHaveBeenCalledTimes(3);
            expect(autocomplete.target.open).toHaveBeenCalledTimes(1);
            expect(autocomplete.target.collapsed).toEqual(true);


        }));
        it('Should close the dropdown when disabled dynamically', fakeAsync(() => {
            spyOn(autocomplete.target, 'open').and.callThrough();
            spyOn(autocomplete.target, 'close').and.callThrough();

            UIInteractions.setInputElementValue(input, 's', fixture);
            tick();
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeFalsy();
            expect(autocomplete.target.open).toHaveBeenCalledTimes(1);

            autocomplete.disabled = true;
            autocomplete.close();
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
            expect(autocomplete.target.close).toHaveBeenCalledTimes(1);
            UIInteractions.setInputElementValue(input, 's', fixture);
            tick();
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
            expect(autocomplete.target.open).toHaveBeenCalledTimes(1);
        }));
        it('Should not close the dropdown when clicked on a input or the group', fakeAsync(() => {
            UIInteractions.setInputElementValue(input, 's', fixture);
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeFalsy();

            input.nativeElement.click();
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeFalsy();

            group.element.nativeElement.click();
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeFalsy();

            // Click in center of the body.
            const bodyRect = document.body.getBoundingClientRect();
            UIInteractions.simulateMouseEvent('click', document.body,
                                    bodyRect.left + bodyRect.width / 2,
                                    bodyRect.top + bodyRect.height / 2);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
        }));
        it('Should select item and close dropdown with ENTER and do not close it with SPACE key', fakeAsync(() => {
            let startsWith = 's';
            let filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeFalsy();

            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
            expect(fixture.componentInstance.townSelected).toBe(filteredTowns[0]);
            expect(input.value).toBe(filteredTowns[0]);

            startsWith = 'bu';
            filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeFalsy();

            UIInteractions.triggerKeyDownEvtUponElem('space', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeFalsy();
            expect(fixture.componentInstance.townSelected).toBe('bu');
            expect(input.value).toBe('bu');
        }));
        it('Should not open dropdown with ENTER key', fakeAsync(() => {
            let startsWith = 's';
            const filteredTowns = fixture.componentInstance.filterTowns(startsWith);

            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
            expect(input.value).toBe('');

            UIInteractions.setInputElementValue(input, startsWith, fixture);
            tick();
            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
            expect(input.value).toBe(filteredTowns[0]);

            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
            expect(input.value).toBe(filteredTowns[0]);

            startsWith = '';
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            tick();
            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
            expect(input.value).toBe(fixture.componentInstance.towns[0]);
        }));
        it('Should not open dropdown and select items with SPACE key', fakeAsync(() => {
            let startsWith = 'd';
            const filteredTowns = fixture.componentInstance.filterTowns(startsWith);

            UIInteractions.triggerKeyDownEvtUponElem('space', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
            expect(input.value).toBe('');

            UIInteractions.setInputElementValue(input, startsWith, fixture);
            tick();
            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
            expect(input.value).toBe(filteredTowns[0]);

            UIInteractions.triggerKeyDownEvtUponElem('space', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
            expect(input.value).toBe(filteredTowns[0]);

            startsWith = '';
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            tick();
            UIInteractions.triggerKeyDownEvtUponElem('space', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeFalsy();
            expect(input.value).toBe(startsWith);
        }));
        it('Should not open dropdown on input focusing', () => {
            input.nativeElement.focus();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST));
            const dropdownListScrollElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL));
            expect(dropdownList.nativeElement.attributes['aria-hidden'].value).toEqual('true');
            expect(dropdownListScrollElement.children.length).toEqual(0);
        });
        it('Should not open dropdown on input clicking', () => {
            input.nativeElement.click();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST));
            const dropdownListScrollElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL));
            expect(dropdownList.nativeElement.attributes['aria-hidden'].value).toEqual('true');
            expect(dropdownListScrollElement.children.length).toEqual(0);
        });
        it('Should not open dropdown when disabled', fakeAsync(() => {
            fixture.detectChanges();
            spyOn(autocomplete.target, 'open').and.callThrough();
            const dropdownListScrollElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL));

            autocomplete.disabled = true;
            fixture.detectChanges();

            UIInteractions.setInputElementValue(input, 's', fixture);
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
            expect(dropdownListScrollElement.children.length).toEqual(0);
            expect(autocomplete.target.open).toHaveBeenCalledTimes(0);

            autocomplete.open();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
            expect(dropdownListScrollElement.children.length).toEqual(0);
            expect(autocomplete.target.open).toHaveBeenCalledTimes(0);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
            expect(dropdownListScrollElement.children.length).toEqual(0);
            expect(autocomplete.target.open).toHaveBeenCalledTimes(0);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
            expect(dropdownListScrollElement.children.length).toEqual(0);
            expect(autocomplete.target.open).toHaveBeenCalledTimes(0);

            const altKey = true;
            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true, altKey);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
            expect(dropdownListScrollElement.children.length).toEqual(0);
            expect(autocomplete.target.open).toHaveBeenCalledTimes(0);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true, altKey);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
            expect(dropdownListScrollElement.children.length).toEqual(0);
            expect(autocomplete.target.open).toHaveBeenCalledTimes(0);
        }));
        it('Should select item when drop down item is clicked', fakeAsync(() => {
            input.nativeElement.focus();
            expect(input.nativeElement as Element).toBe(document.activeElement);
            const startsWith = 's';
            const filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            tick();
            expect(dropDown.collapsed).toBeFalsy();
            const targetElement = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DROP_DOWN_ITEM))[0];
            targetElement.nativeElement.click();
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
            expect(fixture.componentInstance.townSelected).toBe(filteredTowns[0]);
            expect(input.value).toBe(filteredTowns[0]);
            expect(input.nativeElement as Element).toBe(document.activeElement);
        }));
        it('Should filter and select duplicated items properly', fakeAsync(() => {
            fixture.componentInstance.towns.push('Sofia', 'Sofia');
            fixture.detectChanges();
            const dropdownListScrollElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL));
            let startsWith = 'so';
            let filteredTowns = fixture.componentInstance.filterTowns(startsWith);

            const verifyDropdownItems = () => {
                expect(dropdownListScrollElement.children.length).toEqual(filteredTowns.length);
                for (let itemIndex = 0; itemIndex < filteredTowns.length; itemIndex++) {
                    const itemElement = dropdownListScrollElement.children[itemIndex].nativeElement;
                    expect(itemElement.textContent.trim()).
                    toEqual(filteredTowns[itemIndex]);
                    const isFocused = itemIndex === 0 ? true : false;
                    const hasFocusedClass =
                    itemElement.classList.contains(CSS_CLASS_DROP_DOWN_ITEM_FOCUSED);
                    if (isFocused) {
                        expect(hasFocusedClass).toBeTruthy();
                    } else {
                        expect(hasFocusedClass).toBeFalsy();
                    }
                    expect(dropDown.items[itemIndex].focused).toEqual(isFocused);
                }
            };

            UIInteractions.setInputElementValue(input, startsWith, fixture);
            fixture.detectChanges();
            tick();
            verifyDropdownItems();

            startsWith = 'sof';
            filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            fixture.detectChanges();
            tick();
            verifyDropdownItems();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            fixture.detectChanges();
            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
            expect(input.value).toEqual(filteredTowns[1]);
            expect(fixture.componentInstance.townSelected).toEqual(filteredTowns[1]);

            startsWith = 'sof';
            filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            fixture.detectChanges();
            tick();
            verifyDropdownItems();

            startsWith = 'so';
            filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            fixture.detectChanges();
            tick();
            verifyDropdownItems();

        }));
        it('Should filter and populate dropdown list with matching values on every key stroke', () => {
            const dropdownListScrollElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL));
            const verifyDropdownItems = () => {
                const filteredTowns = fixture.componentInstance.filterTowns(startsWith);
                UIInteractions.setInputElementValue(input, startsWith, fixture);
                fixture.detectChanges();
                expect(dropdownListScrollElement.children.length).toEqual(filteredTowns.length);
                for (let itemIndex = 0; itemIndex < filteredTowns.length; itemIndex++) {
                    expect(dropdownListScrollElement.children[itemIndex].nativeElement.textContent.trim()).toBe(filteredTowns[itemIndex]);
                }
            };

            let startsWith = 's';
            verifyDropdownItems();

            startsWith = 'st';
            verifyDropdownItems();

            startsWith = 'sta';
            verifyDropdownItems();

            startsWith = 'star';
            verifyDropdownItems();

            startsWith = 'sta';
            verifyDropdownItems();

            startsWith = 'st';
            verifyDropdownItems();

            startsWith = 'str';
            verifyDropdownItems();

            startsWith = 'st';
            verifyDropdownItems();

            startsWith = 's';
            verifyDropdownItems();

            startsWith = 'w';
            verifyDropdownItems();

            startsWith = 't';
            verifyDropdownItems();
        });
        it('Should not populate dropdown list on non-matching values typing', () => {
            let startsWith = ' ';
            const dropdownListScrollElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL));
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            fixture.detectChanges();
            expect(dropdownListScrollElement.children.length).toEqual(0);

            startsWith = '  ';
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            fixture.detectChanges();
            expect(dropdownListScrollElement.children.length).toEqual(0);

            startsWith = 'w';
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            fixture.detectChanges();
            expect(dropdownListScrollElement.children.length).toEqual(0);

            startsWith = 't';
            const filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            fixture.detectChanges();
            expect(dropdownListScrollElement.children.length).toEqual(filteredTowns.length);

            startsWith = 'tp';
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            fixture.detectChanges();
            expect(dropdownListScrollElement.children.length).toEqual(0);
        });
        it('Should not preserve selected value', fakeAsync(() => {
            let startsWith = 'q';
            const dropdownListScrollElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL));

            UIInteractions.setInputElementValue(input, startsWith, fixture);
            tick();
            expect(dropdownListScrollElement.children.length).toEqual(0);
            expect(input.nativeElement.value).toEqual(startsWith);

            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(input.nativeElement.value).toEqual(startsWith);

            startsWith = 'd';
            const filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            tick();
            expect(dropdownListScrollElement.children.length).toEqual(filteredTowns.length);
            expect(input.nativeElement.value).toEqual(startsWith);

            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
            expect(fixture.componentInstance.townSelected).toBe(filteredTowns[0]);
            expect(input.value).toBe(filteredTowns[0]);

            startsWith = 'q';
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            tick();
            expect(dropdownListScrollElement.children.length).toEqual(0);
            expect(input.nativeElement.value).toEqual(startsWith);

            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual(startsWith);
            expect(fixture.componentInstance.townSelected).toBe(startsWith);
        }));
        it('Should auto-highlight first suggestion', fakeAsync(() => {
            let startsWith = 's';
            let filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            tick();
            expect(dropDown.children.first.focused).toBeTruthy();
            expect(dropDown.items[0].focused).toBeTruthy();
            expect(dropDown.items[0].value).toBe(filteredTowns[0]);

            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(fixture.componentInstance.townSelected).toBe(filteredTowns[0]);

            startsWith = 'st';
            filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            tick();
            expect(dropDown.children.first.focused).toBeTruthy();
            expect(dropDown.items[0].focused).toBeTruthy();
            expect(dropDown.items[0].value).toBe(filteredTowns[0]);

            startsWith = 's';
            filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            tick();
            expect(dropDown.children.first.focused).toBeTruthy();
            expect(dropDown.items[0].focused).toBeTruthy();
            expect(dropDown.items[0].value).toBe(filteredTowns[0]);
            expect(dropDown.items[1].focused).toBeFalsy();
            expect(dropDown.items[1].value).toBe(filteredTowns[1]);
        }));
        it('Should trigger itemSelected event on item selection', fakeAsync(() => {
            let startsWith = 'st';
            let filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            spyOn(autocomplete.itemSelected, 'emit').and.callThrough();
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            tick();

            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(fixture.componentInstance.townSelected).toBe(filteredTowns[0]);
            expect(autocomplete.itemSelected.emit).toHaveBeenCalledTimes(1);

            startsWith = 't';
            filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            tick();

            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(fixture.componentInstance.townSelected).toBe(filteredTowns[0]);
            expect(autocomplete.itemSelected.emit).toHaveBeenCalledTimes(2);
            expect(autocomplete.itemSelected.emit).toHaveBeenCalledWith({ value: 'Stara Zagora', cancel: false });

            fixture.componentInstance.itemSelected = (args) => {
                args.cancel = true;
            };
            UIInteractions.setInputElementValue(input, 's', fixture);
            tick();
            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            expect(fixture.componentInstance.townSelected).toBe('s');
        }));
        it('Should trigger itemSelected only once when the event is cancelled (issue #7483)', fakeAsync(() => {
            spyOn(autocomplete.itemSelected, 'emit').and.callThrough();

            fixture.componentInstance.itemSelected = (args) => {
 args.cancel = true;
};
            UIInteractions.setInputElementValue(input, 's', fixture);
            fixture.detectChanges();
            tick();
            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            expect(fixture.componentInstance.townSelected).toBe('s');
            tick();
            fixture.detectChanges();
            expect(autocomplete.itemSelected.emit).toHaveBeenCalledTimes(1);
            expect(autocomplete.itemSelected.emit).toHaveBeenCalledWith({ value: 'Sofia', cancel: true });

            fixture.componentInstance.itemSelected = (args) => {
 args.cancel = true;
};
            UIInteractions.setInputElementValue(input, 's', fixture);
            fixture.detectChanges();
            tick();
            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            expect(fixture.componentInstance.townSelected).toBe('s');
            tick();
            fixture.detectChanges();
            expect(autocomplete.itemSelected.emit).toHaveBeenCalledTimes(2);
            expect(autocomplete.itemSelected.emit).toHaveBeenCalledWith({ value: 'Sofia', cancel: true });
        }));
        it('Should call onInput/open/close methods properly', fakeAsync(() => {
            let startsWith = 'g';
            spyOn(autocomplete, 'onInput').and.callThrough();
            spyOn(autocomplete, 'handleKeyDown').and.callThrough();
            spyOn(autocomplete, 'close').and.callThrough();
            spyOn(autocomplete.target, 'close').and.callThrough();
            spyOn(autocomplete.target, 'open').and.callThrough();
            spyOn(autocomplete.target.onOpening, 'emit').and.callThrough();

            UIInteractions.setInputElementValue(input, startsWith, fixture);
            tick();
            fixture.detectChanges();
            tick();
            expect(autocomplete.onInput).toHaveBeenCalledTimes(1);

            startsWith = 'ga';
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            tick();
            fixture.detectChanges();
            tick();
            expect(autocomplete.onInput).toHaveBeenCalledTimes(2);
            expect(autocomplete.target.open).toHaveBeenCalledTimes(1);
            // onOpening is emitted once, so no impact on UX
            expect(autocomplete.target.onOpening.emit).toHaveBeenCalledTimes(1);
            // keeps dropdown opened
            expect(autocomplete.close).toHaveBeenCalledTimes(0);
            expect(autocomplete.target.close).toHaveBeenCalledTimes(0);

            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(autocomplete.handleKeyDown).toHaveBeenCalledTimes(1);
            expect(autocomplete.onInput).toHaveBeenCalledTimes(2);
            expect(autocomplete.close).toHaveBeenCalledTimes(1);
            expect(autocomplete.target.close).toHaveBeenCalledTimes(2);

            // IgxDropDownItemNavigationDirective handleKeyDown is not called when dropdown is closed
            spyOn(IgxDropDownItemNavigationDirective.prototype, 'handleKeyDown').and.callThrough();
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(autocomplete.handleKeyDown).toHaveBeenCalledTimes(2);
            expect(IgxDropDownItemNavigationDirective.prototype.handleKeyDown).toHaveBeenCalledTimes(0);

            startsWith = 'w';
            UIInteractions.setInputElementValue(input, startsWith, fixture);
            tick();
            fixture.detectChanges();
            tick();
            expect(autocomplete.onInput).toHaveBeenCalledTimes(3);
            // initially calls open 2 times. This has no effect on UX, as dropdown.onOpening is not emitted
            expect(autocomplete.target.onOpening.emit).toHaveBeenCalledTimes(2);
            expect(autocomplete.target.open).toHaveBeenCalledTimes(2);
        }));
        it('Should navigate through dropdown items with arrow up/down keys', fakeAsync(() => {
            UIInteractions.setInputElementValue(input, 'a', fixture);
            tick();
            expect(dropDown.items[0].focused).toBeTruthy();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            fixture.detectChanges();
            expect(dropDown.items[1].focused).toBeTruthy();
            expect(dropDown.items[0].focused).toBeFalsy();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            fixture.detectChanges();
            expect(dropDown.items[0].focused).toBeTruthy();
            expect(dropDown.items[1].focused).toBeFalsy();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            fixture.detectChanges();
            expect(dropDown.items[0].focused).toBeTruthy();
            expect(dropDown.items[dropDown.items.length - 1].focused).toBeFalsy();
        }));
        it('Should not overwrite browser functionality for Home/End keys', () => {
            UIInteractions.setInputElementValue(input, 'r', fixture);
            fixture.detectChanges();
            expect(input.nativeElement.selectionEnd).toBe(1);

            const mockObj = {
                key: 'Home',
                code: 'Home',
                preventDefault: () => {}
            };
            spyOn(mockObj, 'preventDefault');
            const inputDebug = fixture.debugElement.queryAll(By.css('.' + INPUT_CSS_CLASS))[0];
            inputDebug.triggerEventHandler('keydown', mockObj);
            expect(mockObj.preventDefault).not.toHaveBeenCalled();

            mockObj.key = 'End';
            mockObj.code = 'End';
            inputDebug.triggerEventHandler('keydown', mockObj);
            expect(mockObj.preventDefault).not.toHaveBeenCalled();
        });
        it('Should apply default width to both input and dropdown list elements', () => {
            UIInteractions.setInputElementValue(input, 's', fixture);
            fixture.detectChanges();
            const dropDownAny = dropDown as any;
            expect(dropDownAny.scrollContainer.getBoundingClientRect().width)
                .toEqual(group.element.nativeElement.getBoundingClientRect().width);
        });
        it('Should apply width to dropdown list if set', () => {
            UIInteractions.setInputElementValue(input, 's', fixture);
            fixture.componentInstance.ddWidth = '600px';
            fixture.detectChanges();
            const dropDownAny = dropDown as any;
            expect(dropDownAny.scrollContainer.getBoundingClientRect().width).toEqual(600);
        });
        it('Should render aria attributes properly', fakeAsync(() => {
            expect(input.nativeElement.attributes['autocomplete'].value).toEqual('off');
            expect(input.nativeElement.attributes['role'].value).toEqual('combobox');
            expect(input.nativeElement.attributes['aria-autocomplete'].value).toEqual('list');
            expect(input.nativeElement.attributes['aria-haspopup'].value).toEqual('listbox');
            expect(input.nativeElement.attributes['aria-owns'].value).toEqual(dropDown.listId);
            expect(input.nativeElement.attributes['aria-expanded'].value).toEqual('false');
            expect(input.nativeElement.attributes['aria-activedescendant']).toBeUndefined();
            UIInteractions.setInputElementValue(input, 's', fixture);
            tick();
            expect(input.nativeElement.attributes['aria-expanded'].value).toEqual('true');
            expect(input.nativeElement.attributes['aria-activedescendant'].value).toEqual(dropDown.focusedItem.id);
            autocomplete.close();
            tick();
            fixture.detectChanges();
            expect(input.nativeElement.attributes['aria-expanded'].value).toEqual('false');
        }));
    });
    describe('Positioning settings tests', () => {
        it('Panel settings - direction and startPoint: top', fakeAsync(() => {
            fixture = TestBed.createComponent(AutocompleteComponent);
            fixture.componentInstance.settings = {
                positionStrategy: new ConnectedPositioningStrategy({
                    closeAnimation: null,
                    openAnimation: null,
                    verticalDirection: VerticalAlignment.Top,
                    verticalStartPoint: VerticalAlignment.Top
                })
            };
            fixture.detectChanges();
            autocomplete = fixture.componentInstance.autocomplete;
            group = fixture.componentInstance.group;
            input = fixture.componentInstance.input;
            dropDown = fixture.componentInstance.dropDown;
            input.nativeElement.click();

            UIInteractions.setInputElementValue(input, 's', fixture);
            fixture.detectChanges();
            tick();
            const dropdownListElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST));
            const ddRect = dropdownListElement.nativeElement.getBoundingClientRect();
            const gRect = group.element.nativeElement.getBoundingClientRect();
            expect(ddRect.bottom).toEqual(gRect.top);
            expect(ddRect.left).toEqual(gRect.left);
        }));

        it('Panel settings - direction: left; StartPoint: right', fakeAsync(() => {
            fixture = TestBed.createComponent(AutocompleteComponent);
            fixture.componentInstance.settings = {
                positionStrategy: new ConnectedPositioningStrategy({
                    closeAnimation: null,
                    openAnimation: null,
                    horizontalDirection: HorizontalAlignment.Left,
                    horizontalStartPoint: HorizontalAlignment.Right
                })
            };
            fixture.detectChanges();
            autocomplete = fixture.componentInstance.autocomplete;
            group = fixture.componentInstance.group;
            input = fixture.componentInstance.input;
            dropDown = fixture.componentInstance.dropDown;
            input.nativeElement.click();

            UIInteractions.setInputElementValue(input, 's', fixture);
            fixture.detectChanges();
            tick();
            const dropdownListElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST));
            const ddRect = dropdownListElement.nativeElement.getBoundingClientRect();
            const gRect = group.element.nativeElement.getBoundingClientRect();
            expect(ddRect.left).toEqual(gRect.left);
            expect(ddRect.right).toEqual(gRect.right);
            expect(ddRect.width).toEqual(gRect.width);
        }));
    });
    describe('Other elements integration tests', () => {
        it('Should be instantiated properly on HTML input', fakeAsync(() => {
            fixture = TestBed.createComponent(AutocompleteInputComponent);
            fixture.detectChanges();
            autocomplete = fixture.componentInstance.autocomplete;
            const plainInput = fixture.componentInstance.plainInput;
            dropDown = fixture.componentInstance.dropDown;
            expect(autocomplete).toBeDefined();
            expect(dropDown).toBeDefined();

            const startsWith = 's';
            const filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            const dropdownListScrollElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL));
            UIInteractions.setInputElementValue(plainInput, startsWith, fixture);
            tick();
            expect(dropDown.collapsed).toBeFalsy();
            expect(dropdownListScrollElement.children.length).toEqual(filteredTowns.length);
            expect(dropDown.children.first.focused).toBeTruthy();
            expect(dropDown.items[0].focused).toBeTruthy();
            expect(dropDown.items[0].value).toBe(filteredTowns[0]);

            UIInteractions.triggerKeyDownEvtUponElem('enter', plainInput.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
            expect(dropdownListScrollElement.children.length).toEqual(0);
            expect(plainInput.nativeElement.value).toBe(filteredTowns[0]);
        }));
        it('Should be instantiated properly on HTML textarea', fakeAsync(() => {
            fixture = TestBed.createComponent(AutocompleteInputComponent);
            fixture.detectChanges();
            autocomplete = fixture.componentInstance.autocomplete;
            const textarea = fixture.componentInstance.textarea;
            dropDown = fixture.componentInstance.dropDown;
            expect(autocomplete).toBeDefined();
            expect(dropDown).toBeDefined();

            const startsWith = 't';
            const filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            const dropdownListScrollElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL));
            UIInteractions.setInputElementValue(textarea, startsWith, fixture);
            tick();
            expect(dropDown.collapsed).toBeFalsy();
            expect(dropdownListScrollElement.children.length).toEqual(filteredTowns.length);
            expect(dropDown.children.first.focused).toBeTruthy();
            expect(dropDown.items[0].focused).toBeTruthy();
            expect(dropDown.items[0].value).toBe(filteredTowns[0]);

            UIInteractions.triggerKeyDownEvtUponElem('enter', textarea.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
            expect(dropdownListScrollElement.children.length).toEqual(0);
            expect(textarea.nativeElement.value).toBe(filteredTowns[0]);
        }));
        it('Should be instantiated properly on ReactiveForm', fakeAsync(() => {
            fixture = TestBed.createComponent(AutocompleteFormComponent);
            fixture.detectChanges();
            tick();
            autocomplete = fixture.componentInstance.autocomplete;
            input = fixture.componentInstance.input;
            group = fixture.componentInstance.group;
            dropDown = fixture.componentInstance.dropDown;
            input.nativeElement.click();
            input.nativeElement.focus();
            UIInteractions.clickAndSendInputElementValue(input, 's', fixture);
            tick();
            expect(dropDown.collapsed).toBeFalsy();
            expect(dropDown.children.first.focused).toBeTruthy();
            expect(dropDown.items[0].focused).toBeTruthy();
            expect(dropDown.items[0].value).toBe('Sofia');

            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
            expect(input.nativeElement.value).toBe('Sofia');
            expect(group.element.nativeElement.classList.contains('igx-input-group--valid')).toBeTruthy();

            fixture.componentInstance.plainInput.nativeElement.focus();
            fixture.detectChanges();
            tick();
            expect(group.element.nativeElement.classList.contains('igx-input-group--valid')).toBeFalsy();
        }));
    });
});

@Component({
    template: `<igx-input-group style="width: 300px;">
        <igx-prefix igxRipple><igx-icon>home</igx-icon> </igx-prefix>
        <input igxInput name="towns" type="text" [(ngModel)]="townSelected" required
            [igxAutocomplete]='townsPanel'
            [igxAutocompleteSettings]='settings' (itemSelected)="itemSelected($event)"/>
        <label igxLabel for="towns">Towns</label>
        <igx-suffix igxRipple><igx-icon>clear</igx-icon> </igx-suffix>
    </igx-input-group>
    <igx-drop-down #townsPanel [width]="ddWidth">
        <igx-drop-down-item *ngFor="let town of towns | startsWith:townSelected" [value]="town">
            {{town}}
        </igx-drop-down-item>
    </igx-drop-down>`
})
class AutocompleteComponent {
    @ViewChild(IgxAutocompleteDirective, { static: true }) public autocomplete: IgxAutocompleteDirective;
    @ViewChild(IgxInputGroupComponent, { static: true }) public group: IgxInputGroupComponent;
    @ViewChild(IgxInputDirective, { static: true }) public input: IgxInputDirective;
    @ViewChild(IgxDropDownComponent, { static: true }) public dropDown: IgxDropDownComponent;
    public townSelected;
    public towns;
    public ddWidth = null;
    public settings: AutocompleteOverlaySettings = null;

    constructor() {
        this.towns = [
            // eslint-disable-next-line max-len
            'Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven', 'Dobrich', 'Sliven', 'Shumen', 'Pernik', 'Haskovo', 'Yambol', 'Pazardzhik', 'Blagoevgrad', 'Veliko Tarnovo', 'Vratsa', 'Gabrovo', 'Asenovgrad', 'Vidin', 'Kazanlak', 'Kyustendil', 'Kardzhali', 'Montana', 'Dimitrovgrad', 'Targovishte', 'Lovech', 'Silistra', 'Dupnitsa', 'Svishtov', 'Razgrad', 'Gorna Oryahovitsa', 'Smolyan', 'Petrich', 'Sandanski', 'Samokov', 'Sevlievo', 'Lom', 'Karlovo', 'Velingrad', 'Nova Zagora', 'Troyan', 'Aytos', 'Botevgrad', 'Gotse Delchev', 'Peshtera', 'Harmanli', 'Karnobat', 'Svilengrad', 'Panagyurishte', 'Chirpan', 'Popovo', 'Rakovski', 'Radomir', 'Novi Iskar', 'Kozloduy', 'Parvomay', 'Berkovitsa', 'Cherven Bryag', 'Pomorie', 'Ihtiman', 'Radnevo', 'Provadiya', 'Novi Pazar', 'Razlog', 'Byala Slatina', 'Nesebar', 'Balchik', 'Kostinbrod', 'Stamboliyski', 'Kavarna', 'Knezha', 'Pavlikeni', 'Mezdra', 'Etropole', 'Levski', 'Teteven', 'Elhovo', 'Bankya', 'Tryavna', 'Lukovit', 'Tutrakan', 'Sredets', 'Sopot', 'Byala', 'Veliki Preslav', 'Isperih', 'Belene', 'Omurtag', 'Bansko', 'Krichim', 'Galabovo', 'Devnya', 'Septemvri', 'Rakitovo', 'Lyaskovets', 'Svoge', 'Aksakovo', 'Kubrat', 'Dryanovo', 'Beloslav', 'Pirdop', 'Lyubimets', 'Momchilgrad', 'Slivnitsa', 'Hisarya', 'Zlatograd', 'Kostenets', 'Devin', 'General Toshevo', 'Simeonovgrad', 'Simitli', 'Elin Pelin', 'Dolni Chiflik', 'Tervel', 'Dulovo', 'Varshets', 'Kotel', 'Madan', 'Straldzha', 'Saedinenie', 'Bobov Dol', 'Tsarevo', 'Kuklen', 'Tvarditsa', 'Yakoruda', 'Elena', 'Topolovgrad', 'Bozhurishte', 'Chepelare', 'Oryahovo', 'Sozopol', 'Belogradchik', 'Perushtitsa', 'Zlatitsa', 'Strazhitsa', 'Krumovgrad', 'Kameno', 'Dalgopol', 'Vetovo', 'Suvorovo', 'Dolni Dabnik', 'Dolna Banya', 'Pravets', 'Nedelino', 'Polski Trambesh', 'Trastenik', 'Bratsigovo', 'Koynare', 'Godech', 'Slavyanovo', 'Dve Mogili', 'Kostandovo', 'Debelets', 'Strelcha', 'Sapareva Banya', 'Ignatievo', 'Smyadovo', 'Breznik', 'Sveti Vlas', 'Nikopol', 'Shivachevo', 'Belovo', 'Tsar Kaloyan', 'Ivaylovgrad', 'Valchedram', 'Marten', 'Glodzhevo', 'Sarnitsa', 'Letnitsa', 'Varbitsa', 'Iskar', 'Ardino', 'Shabla', 'Rudozem', 'Vetren', 'Kresna', 'Banya', 'Batak', 'Maglizh', 'Valchi Dol', 'Gulyantsi', 'Dragoman', 'Zavet', 'Kran', 'Miziya', 'Primorsko', 'Sungurlare', 'Dolna Mitropoliya', 'Krivodol', 'Kula', 'Kalofer', 'Slivo Pole', 'Kaspichan', 'Apriltsi', 'Belitsa', 'Roman', 'Dzhebel', 'Dolna Oryahovitsa', 'Buhovo', 'Gurkovo', 'Pavel Banya', 'Nikolaevo', 'Yablanitsa', 'Kableshkovo', 'Opaka', 'Rila', 'Ugarchin', 'Dunavtsi', 'Dobrinishte', 'Hadzhidimovo', 'Bregovo', 'Byala Cherkva', 'Zlataritsa', 'Kocherinovo', 'Dospat', 'Tran', 'Sadovo', 'Laki', 'Koprivshtitsa', 'Malko Tarnovo', 'Loznitsa', 'Obzor', 'Kilifarevo', 'Borovo', 'Batanovtsi', 'Chernomorets', 'Aheloy', 'Byala', 'Pordim', 'Suhindol', 'Merichleri', 'Glavinitsa', 'Chiprovtsi', 'Kermen', 'Brezovo', 'Plachkovtsi', 'Zemen', 'Balgarovo', 'Alfatar', 'Boychinovtsi', 'Gramada', 'Senovo', 'Momin Prohod', 'Kaolinovo', 'Shipka', 'Antonovo', 'Ahtopol', 'Boboshevo', 'Bolyarovo', 'Brusartsi', 'Klisura', 'Dimovo', 'Kiten', 'Pliska', 'Madzharovo', 'Melnik'
        ];
    }
    public itemSelected() { }

    public filterTowns(startsWith: string) {
        return this.towns.filter(city => city.toString().toLowerCase().startsWith(startsWith.toLowerCase()));
    }
}

@Component({
    template: `
    <input name="towns" type="text" [(ngModel)]="townSelected" required
        [igxAutocomplete]='townsPanel' #plainInput/>
    <textarea [(ngModel)]="townSelected" required
        [igxAutocomplete]='townsPanel' #textarea></textarea>
    <label igxLabel for="towns">Towns</label>
    <igx-drop-down #townsPanel>
        <igx-drop-down-item *ngFor="let town of towns | startsWith:townSelected" [value]="town">
            {{town}}
        </igx-drop-down-item>
    </igx-drop-down>`
})
class AutocompleteInputComponent extends AutocompleteComponent {
    @ViewChild('plainInput', { static: true }) public plainInput: ElementRef<HTMLInputElement>;
    @ViewChild('textarea', { static: true }) public textarea: ElementRef<HTMLTextAreaElement>;
}

@Component({
    template: `
<form [formGroup]="reactiveForm" (ngSubmit)="onSubmitReactive()">
<igx-input-group>
        <igx-prefix igxRipple><igx-icon>home</igx-icon> </igx-prefix>
        <input igxInput name="towns" formControlName="towns" type="text" required
            [igxAutocomplete]='townsPanel'
            [igxAutocompleteSettings]='settings' />
        <label igxLabel for="towns">Towns</label>
        <igx-suffix igxRipple><igx-icon>clear</igx-icon> </igx-suffix>
    </igx-input-group>
    <igx-drop-down #townsPanel>
        <igx-drop-down-item *ngFor="let town of towns | startsWith:townSelected" [value]="town">
            {{town}}
        </igx-drop-down-item>
    </igx-drop-down>
    <input #plainInput/>
    <button type="submit" [disabled]="!reactiveForm.valid">Submit</button>
</form>
`
})

class AutocompleteFormComponent {
    @ViewChild(IgxAutocompleteDirective, { static: true }) public autocomplete: IgxAutocompleteDirective;
    @ViewChild(IgxInputGroupComponent, { static: true }) public group: IgxInputGroupComponent;
    @ViewChild(IgxInputDirective, { static: true }) public input: IgxInputDirective;
    @ViewChild(IgxDropDownComponent, { static: true }) public dropDown: IgxDropDownComponent;
    @ViewChild('plainInput', { static: true }) public plainInput: ElementRef<HTMLInputElement>;
    public towns;

    public reactiveForm: FormGroup;

    constructor(fb: FormBuilder) {

        this.towns = [
            // eslint-disable-next-line max-len
            'Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven', 'Dobrich', 'Sliven', 'Shumen', 'Pernik', 'Haskovo', 'Yambol', 'Pazardzhik', 'Blagoevgrad', 'Veliko Tarnovo', 'Vratsa', 'Gabrovo', 'Asenovgrad', 'Vidin', 'Kazanlak', 'Kyustendil', 'Kardzhali', 'Montana', 'Dimitrovgrad', 'Targovishte', 'Lovech', 'Silistra', 'Dupnitsa', 'Svishtov', 'Razgrad', 'Gorna Oryahovitsa', 'Smolyan', 'Petrich', 'Sandanski', 'Samokov', 'Sevlievo', 'Lom', 'Karlovo', 'Velingrad', 'Nova Zagora', 'Troyan', 'Aytos', 'Botevgrad', 'Gotse Delchev', 'Peshtera', 'Harmanli', 'Karnobat', 'Svilengrad', 'Panagyurishte', 'Chirpan', 'Popovo', 'Rakovski', 'Radomir', 'Novi Iskar', 'Kozloduy', 'Parvomay', 'Berkovitsa', 'Cherven Bryag', 'Pomorie', 'Ihtiman', 'Radnevo', 'Provadiya', 'Novi Pazar', 'Razlog', 'Byala Slatina', 'Nesebar', 'Balchik', 'Kostinbrod', 'Stamboliyski', 'Kavarna', 'Knezha', 'Pavlikeni', 'Mezdra', 'Etropole', 'Levski', 'Teteven', 'Elhovo', 'Bankya', 'Tryavna', 'Lukovit', 'Tutrakan', 'Sredets', 'Sopot', 'Byala', 'Veliki Preslav', 'Isperih', 'Belene', 'Omurtag', 'Bansko', 'Krichim', 'Galabovo', 'Devnya', 'Septemvri', 'Rakitovo', 'Lyaskovets', 'Svoge', 'Aksakovo', 'Kubrat', 'Dryanovo', 'Beloslav', 'Pirdop', 'Lyubimets', 'Momchilgrad', 'Slivnitsa', 'Hisarya', 'Zlatograd', 'Kostenets', 'Devin', 'General Toshevo', 'Simeonovgrad', 'Simitli', 'Elin Pelin', 'Dolni Chiflik', 'Tervel', 'Dulovo', 'Varshets', 'Kotel', 'Madan', 'Straldzha', 'Saedinenie', 'Bobov Dol', 'Tsarevo', 'Kuklen', 'Tvarditsa', 'Yakoruda', 'Elena', 'Topolovgrad', 'Bozhurishte', 'Chepelare', 'Oryahovo', 'Sozopol', 'Belogradchik', 'Perushtitsa', 'Zlatitsa', 'Strazhitsa', 'Krumovgrad', 'Kameno', 'Dalgopol', 'Vetovo', 'Suvorovo', 'Dolni Dabnik', 'Dolna Banya', 'Pravets', 'Nedelino', 'Polski Trambesh', 'Trastenik', 'Bratsigovo', 'Koynare', 'Godech', 'Slavyanovo', 'Dve Mogili', 'Kostandovo', 'Debelets', 'Strelcha', 'Sapareva Banya', 'Ignatievo', 'Smyadovo', 'Breznik', 'Sveti Vlas', 'Nikopol', 'Shivachevo', 'Belovo', 'Tsar Kaloyan', 'Ivaylovgrad', 'Valchedram', 'Marten', 'Glodzhevo', 'Sarnitsa', 'Letnitsa', 'Varbitsa', 'Iskar', 'Ardino', 'Shabla', 'Rudozem', 'Vetren', 'Kresna', 'Banya', 'Batak', 'Maglizh', 'Valchi Dol', 'Gulyantsi', 'Dragoman', 'Zavet', 'Kran', 'Miziya', 'Primorsko', 'Sungurlare', 'Dolna Mitropoliya', 'Krivodol', 'Kula', 'Kalofer', 'Slivo Pole', 'Kaspichan', 'Apriltsi', 'Belitsa', 'Roman', 'Dzhebel', 'Dolna Oryahovitsa', 'Buhovo', 'Gurkovo', 'Pavel Banya', 'Nikolaevo', 'Yablanitsa', 'Kableshkovo', 'Opaka', 'Rila', 'Ugarchin', 'Dunavtsi', 'Dobrinishte', 'Hadzhidimovo', 'Bregovo', 'Byala Cherkva', 'Zlataritsa', 'Kocherinovo', 'Dospat', 'Tran', 'Sadovo', 'Laki', 'Koprivshtitsa', 'Malko Tarnovo', 'Loznitsa', 'Obzor', 'Kilifarevo', 'Borovo', 'Batanovtsi', 'Chernomorets', 'Aheloy', 'Byala', 'Pordim', 'Suhindol', 'Merichleri', 'Glavinitsa', 'Chiprovtsi', 'Kermen', 'Brezovo', 'Plachkovtsi', 'Zemen', 'Balgarovo', 'Alfatar', 'Boychinovtsi', 'Gramada', 'Senovo', 'Momin Prohod', 'Kaolinovo', 'Shipka', 'Antonovo', 'Ahtopol', 'Boboshevo', 'Bolyarovo', 'Brusartsi', 'Klisura', 'Dimovo', 'Kiten', 'Pliska', 'Madzharovo', 'Melnik'
        ];
        this.reactiveForm = fb.group({
            towns: ['', Validators.required]
        });

    }
    public onSubmitReactive() { }
}

@Pipe({ name: 'startsWith' })
export class IgxAutocompletePipeStartsWith implements PipeTransform {
    public transform(collection: any[], term = '', key?: string) {
        return collection.filter(item => {
            const currItem = key ? item[key] : item;
            return currItem.toString().toLowerCase().startsWith(term.toString().toLowerCase());
        });
    }
}
