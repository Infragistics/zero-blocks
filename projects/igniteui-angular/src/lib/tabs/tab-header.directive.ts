
import { Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { KEYS } from '../core/utils';
import { IgxTabItemDirective } from './tab-item.directive';
import { IgxTabHeaderBase, IgxTabsBase } from './tabs.base';

@Directive()
export abstract class IgxTabHeaderDirective implements IgxTabHeaderBase {

    /** @hidden */
    @HostBinding('attr.role')
    public role = 'tab';

    /** @hidden */
    constructor(protected tabs: IgxTabsBase, public tab: IgxTabItemDirective, private elementRef: ElementRef) {
    }

    /** @hidden */
    @HostListener('click')
    public onClick() {
        this.tabs.selectTab(this.tab, true);
    }

    /** @hidden */
    @HostBinding('attr.tabindex')
    public get tabIndex() {
        return this.tab.selected ? 0 : -1;
    }

    /** @hidden */
    @HostBinding('attr.aria-selected')
    public get ariaSelected() {
        return this.tab.selected ? 'true' : 'false';
    }

     /** @hidden */
    @HostListener('keydown', ['$event'])
    public keyDown(event: KeyboardEvent) {
        let unsupportedKey = false;
        const itemsArray = this.tabs.items.toArray();
        const previousIndex = itemsArray.indexOf(this.tab);
        let newIndex = previousIndex;
        const hasDisabledItems = itemsArray.some((item) => item.disabled);
        switch (event.key) {
            case KEYS.RIGHT_ARROW:
            case KEYS.RIGHT_ARROW_IE:
            newIndex = newIndex === itemsArray.length - 1 ? 0 : newIndex + 1;
                while (hasDisabledItems && itemsArray[newIndex].disabled && newIndex < itemsArray.length) {
                    newIndex = newIndex === itemsArray.length - 1 ? 0 : newIndex + 1;
                }
                break;
            case KEYS.LEFT_ARROW:
            case KEYS.LEFT_ARROW_IE:
                newIndex = newIndex === 0 ? itemsArray.length - 1 : newIndex - 1;
                while (hasDisabledItems && itemsArray[newIndex].disabled && newIndex >= 0) {
                    newIndex = newIndex === 0 ? itemsArray.length - 1 : newIndex - 1;
                }
                break;
            case KEYS.HOME:
                event.preventDefault();
                newIndex = 0;
                while (itemsArray[newIndex].disabled && newIndex < itemsArray.length) {
                    newIndex = newIndex === itemsArray.length - 1 ? 0 : newIndex + 1;
                }
                break;
            case KEYS.END:
                event.preventDefault();
                newIndex = itemsArray.length - 1;
                while (hasDisabledItems && itemsArray[newIndex].disabled && newIndex > 0) {
                    newIndex = newIndex === 0 ? itemsArray.length - 1 : newIndex - 1;
                }
                break;
            case KEYS.TAB:
                break;
            case KEYS.ENTER:
            case KEYS.SPACE:
            case KEYS.SPACE_IE:
                event.preventDefault();
                this.nativeElement.click();
                unsupportedKey = true;
                break;
            default:
                event.preventDefault();
                unsupportedKey = true;
                break;
        }

        if (!unsupportedKey) {
            (itemsArray[newIndex] as IgxTabItemDirective).headerComponent.nativeElement.focus();
            if (this.tab.panelComponent) {
                this.tabs.selectedIndex = newIndex;
            }
        }
    }

    /** @hidden */
    public get nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    };
}
