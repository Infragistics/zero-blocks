import { Directive, Optional, Self, Input, HostListener, Inject } from '@angular/core';
import { IGX_DROPDOWN_BASE } from './drop-down.common';
import { IDropDownNavigationDirective } from './drop-down.common';
import { IgxDropDownBaseDirective } from './drop-down.base';
import { DropDownActionKey } from './drop-down.common';

/**
 * Navigation Directive that handles keyboard events on its host and controls a targeted IgxDropDownBaseDirective component
 */
@Directive({
    selector: '[igxDropDownItemNavigation]'
})
export class IgxDropDownItemNavigationDirective implements IDropDownNavigationDirective {

    protected _target: IgxDropDownBaseDirective = null;

    constructor(@Self() @Optional() @Inject(IGX_DROPDOWN_BASE) public dropdown: IgxDropDownBaseDirective) { }

    /**
     * Gets the target of the navigation directive;
     *
     * ```typescript
     * // Get
     * export class MyComponent {
     *  ...
     *  @ContentChild(IgxDropDownNavigationDirective)
     *  navDirective: IgxDropDownNavigationDirective = null
     *  ...
     *  const navTarget: IgxDropDownBaseDirective = navDirective.navTarget
     * }
     * ```
     */
    public get target(): IgxDropDownBaseDirective {
        return this._target;
    }

    /**
     * Sets the target of the navigation directive;
     * If no valid target is passed, it falls back to the drop down context
     *
     * ```html
     * <!-- Set -->
     * <input [igxDropDownItemNavigation]="dropdown" />
     * ...
     * <igx-drop-down #dropdown>
     * ...
     * </igx-drop-down>
     * ```
     */
    @Input('igxDropDownItemNavigation')
    public set target(target: IgxDropDownBaseDirective) {
        this._target = target ? target : this.dropdown;
    }

    /**
     * Captures keydown events and calls the appropriate handlers on the target component
     */
    @HostListener('keydown', ['$event'])
    public handleKeyDown(event: KeyboardEvent) {
        if (event) {
            const key = event.key.toLowerCase();
            if (!this.target.collapsed) { // If dropdown is opened
                const navKeys = ['esc', 'escape', 'enter', 'space', 'spacebar', ' ',
            'arrowup', 'up', 'arrowdown', 'down', 'home', 'end'];
                if (navKeys.indexOf(key) === -1) { // If key has appropriate function in DD
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
            } else { // If dropdown is closed, do nothing
                return;
            }
            switch (key) {
                case 'esc':
                case 'escape':
                    this.target.onItemActionKey(DropDownActionKey.ESCAPE, event);
                    break;
                case 'enter':
                    this.target.onItemActionKey(DropDownActionKey.ENTER, event);
                    break;
                case 'space':
                case 'spacebar':
                case ' ':
                    this.target.onItemActionKey(DropDownActionKey.SPACE, event);
                    break;
                case 'arrowup':
                case 'up':
                    this.onArrowUpKeyDown();
                    break;
                case 'arrowdown':
                case 'down':
                    this.onArrowDownKeyDown();
                    break;
                case 'home':
                    this.onHomeKeyDown();
                    break;
                case 'end':
                    this.onEndKeyDown();
                    break;
                default:
                    return;
            }
        }
    }

    /**
     * Navigates to previous item
     */
    public onArrowDownKeyDown() {
        this.target.navigateNext();
    }

    /**
     * Navigates to previous item
     */
    public onArrowUpKeyDown() {
        this.target.navigatePrev();
    }

    /**
     * Navigates to target's last item
     */
    public onEndKeyDown() {
        this.target.navigateLast();
    }

    /**
     * Navigates to target's first item
     */
    public onHomeKeyDown() {
        this.target.navigateFirst();
    }
}
