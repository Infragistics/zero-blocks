import { ChangeDetectionStrategy, Component, DebugElement, ViewChild, ElementRef, OnInit } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxToggleActionDirective, IgxToggleDirective, IgxToggleModule, IgxOverlayOutletDirective } from './toggle.directive';
import {
    IgxOverlayService, OverlaySettings, ConnectedPositioningStrategy,
    AbsoluteScrollStrategy, AutoPositionStrategy, HorizontalAlignment
} from '../../services/public_api';
import { CancelableEventArgs, } from '../../core/utils';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { first } from 'rxjs/operators';

describe('IgxToggle', () => {
    configureTestSuite();
    const HIDDEN_TOGGLER_CLASS = 'igx-toggle--hidden';
    const TOGGLER_CLASS = 'igx-toggle';
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxToggleActionTestComponent,
                IgxToggleOutletComponent,
                IgxToggleServiceInjectComponent,
                IgxOverlayServiceComponent,
                IgxToggleTestComponent,
                TestWithOnPushComponent,
                TestWithThreeToggleActionsComponent
            ],
            imports: [NoopAnimationsModule, IgxToggleModule]
        })
            .compileComponents();
    }));

    it('IgxToggleDirective is defined', () => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.directive(IgxToggleDirective))).toBeDefined();
        expect(fixture.debugElement.query(By.css('ul'))).toBeDefined();
        expect(fixture.debugElement.queryAll(By.css('li')).length).toBe(4);
    });

    it('verify that initially toggled content is hidden', () => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();
        const divEl = fixture.debugElement.query(By.directive(IgxToggleDirective)).nativeElement;
        expect(fixture.componentInstance.toggle.collapsed).toBe(true);
        expect(divEl.classList.contains(HIDDEN_TOGGLER_CLASS)).toBe(true);
    });

    it('should show and hide content according \'collapsed\' attribute', () => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        const divEl = fixture.debugElement.query(By.directive(IgxToggleDirective)).nativeElement;
        expect(fixture.componentInstance.toggle.collapsed).toBe(true);
        expect(divEl.classList.contains(HIDDEN_TOGGLER_CLASS)).toBe(true);
        fixture.componentInstance.toggle.open();
        fixture.detectChanges();

        expect(fixture.componentInstance.toggle.collapsed).toBe(false);
        expect(divEl.classList.contains(TOGGLER_CLASS)).toBeTruthy();
    });

    it('should emit \'opening\' and \'opened\' events', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        const toggle = fixture.componentInstance.toggle;
        spyOn(toggle.opening, 'emit');
        spyOn(toggle.opened, 'emit');
        toggle.open();
        tick();
        fixture.detectChanges();

        expect(toggle.opening.emit).toHaveBeenCalled();
        expect(toggle.opened.emit).toHaveBeenCalled();
    }));

    it('should emit \'appended\' event', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        const toggle = fixture.componentInstance.toggle;
        spyOn(toggle.appended, 'emit');
        toggle.open();
        tick();
        fixture.detectChanges();

        expect(toggle.appended.emit).toHaveBeenCalledTimes(1);

        toggle.close();
        tick();
        fixture.detectChanges();
        toggle.open();
        tick();
        fixture.detectChanges();

        expect(toggle.appended.emit).toHaveBeenCalledTimes(2);
    }));

    it('should emit \'closing\' and \'closed\' events', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        const toggle = fixture.componentInstance.toggle;
        fixture.componentInstance.toggle.open();
        tick();
        fixture.detectChanges();

        spyOn(toggle.closing, 'emit');
        spyOn(toggle.closed, 'emit');
        toggle.close();
        tick();
        fixture.detectChanges();

        expect(toggle.closing.emit).toHaveBeenCalledTimes(1);
        expect(toggle.closed.emit).toHaveBeenCalledTimes(1);
    }));

    it('should propagate IgxOverlay opened/closed events', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxOverlayServiceComponent);
        fixture.detectChanges();

        const toggle = fixture.componentInstance.toggle;
        const overlay = fixture.componentInstance.overlay;
        spyOn(toggle.opened, 'emit');
        spyOn(toggle.closed, 'emit');

        toggle.open();
        tick();
        expect(toggle.opened.emit).toHaveBeenCalledTimes(1);
        expect(toggle.collapsed).toBe(false);
        toggle.close();
        tick();
        expect(toggle.closed.emit).toHaveBeenCalledTimes(1);
        expect(toggle.collapsed).toBe(true);

        toggle.open();
        tick();
        expect(toggle.opened.emit).toHaveBeenCalledTimes(2);
        const otherId = overlay.attach(fixture.componentInstance.other);
        overlay.show(otherId);
        overlay.hide(otherId);
        tick();
        expect(toggle.closed.emit).toHaveBeenCalledTimes(1);
        expect(toggle.collapsed).toBe(false);
        overlay.hideAll(); // as if outside click
        tick();
        expect(toggle.closed.emit).toHaveBeenCalledTimes(2);
        expect(toggle.collapsed).toBe(true);
    }));

    it('should open toggle when IgxToggleActionDirective is clicked and toggle is closed', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
        fixture.detectChanges();

        const button: DebugElement = fixture.debugElement.query(By.directive(IgxToggleActionDirective));
        const divEl: DebugElement = fixture.debugElement.query(By.directive(IgxToggleDirective));
        expect(fixture.componentInstance.toggle.collapsed).toBe(true);
        expect(divEl.classes[HIDDEN_TOGGLER_CLASS]).toBe(true);
        button.triggerEventHandler('click', null);
        tick();
        fixture.detectChanges();

        expect(fixture.componentInstance.toggle.collapsed).toBe(false);
        expect(divEl.classes[TOGGLER_CLASS]).toBe(true);
    }));

    it('should close toggle when IgxToggleActionDirective is clicked and toggle is opened', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
        fixture.detectChanges();
        fixture.componentInstance.toggle.open();
        tick();

        const divEl = fixture.debugElement.query(By.directive(IgxToggleDirective)).nativeElement;
        const button: DebugElement = fixture.debugElement.query(By.directive(IgxToggleActionDirective));

        expect(divEl.classList.contains(TOGGLER_CLASS)).toBe(true);

        button.triggerEventHandler('click', null);

        tick();
        fixture.detectChanges();
        expect(divEl.classList.contains(HIDDEN_TOGGLER_CLASS)).toBeTruthy();
    }));

    it('should hide content and emit \'closed\' event when you click outside the toggle\'s content', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
        fixture.detectChanges();

        const divEl = fixture.debugElement.query(By.directive(IgxToggleDirective)).nativeElement;
        const toggle = fixture.componentInstance.toggle;
        const p = fixture.debugElement.query(By.css('p'));
        spyOn(toggle.opening, 'emit');
        spyOn(toggle.opened, 'emit');

        fixture.componentInstance.toggleAction.onClick();
        tick();
        expect(toggle.opening.emit).toHaveBeenCalled();
        expect(toggle.opened.emit).toHaveBeenCalled();

        expect(fixture.componentInstance.toggle.collapsed).toBe(false);
        expect(divEl.classList.contains(TOGGLER_CLASS)).toBe(true);
        spyOn(toggle.closing, 'emit');
        spyOn(toggle.closed, 'emit');

        p.nativeElement.click();
        tick();
        fixture.detectChanges();

        expect(toggle.closing.emit).toHaveBeenCalled();
        expect(toggle.closed.emit).toHaveBeenCalled();
    }));

    it('Toggle should be registered into navigationService if it is passed through identifier', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleServiceInjectComponent);
        fixture.detectChanges();

        const toggleFromComponent = fixture.componentInstance.toggle;
        const toggleFromService = fixture.componentInstance.toggleAction.target as IgxToggleDirective;

        expect(toggleFromService instanceof IgxToggleDirective).toBe(true);
        expect(toggleFromService.id).toEqual(toggleFromComponent.id);
    }));

    it('Toggle should working with parent component and OnPush strategy applied.', fakeAsync(() => {
        const fix = TestBed.createComponent(TestWithOnPushComponent);
        fix.detectChanges();

        const toggle = fix.componentInstance.toggle;
        const toggleElm = fix.debugElement.query(By.directive(IgxToggleDirective)).nativeElement;
        const button: DebugElement = fix.debugElement.query(By.css('button'));

        spyOn(toggle.opened, 'emit');
        spyOn(toggle.closed, 'emit');
        button.triggerEventHandler('click', null);

        tick();
        fix.detectChanges();

        expect(toggle.opened.emit).toHaveBeenCalled();
        expect(toggleElm.classList.contains(TOGGLER_CLASS)).toBe(true);
        button.triggerEventHandler('click', null);

        tick();
        fix.detectChanges();

        expect(toggle.closed.emit).toHaveBeenCalled();
        expect(toggleElm.classList.contains(HIDDEN_TOGGLER_CLASS)).toBe(true);
    }));

    it('fix for #2798 - Allow canceling of open and close of IgxDropDown through opening and closing events', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        const toggle = fixture.componentInstance.toggle;

        spyOn(toggle.opening, 'emit').and.callThrough();
        spyOn(toggle.opened, 'emit').and.callThrough();
        spyOn(toggle.closing, 'emit').and.callThrough();
        spyOn(toggle.closed, 'emit').and.callThrough();

        toggle.closing.pipe(first()).subscribe((e: CancelableEventArgs) => e.cancel = true);

        toggle.open();
        fixture.detectChanges();
        tick();

        expect(toggle.opening.emit).toHaveBeenCalledTimes(1);
        expect(toggle.opened.emit).toHaveBeenCalledTimes(1);

        toggle.close();
        fixture.detectChanges();
        tick();

        expect(toggle.closing.emit).toHaveBeenCalledTimes(1);
        expect(toggle.closed.emit).toHaveBeenCalledTimes(0);

        toggle.close();
        fixture.detectChanges();
        tick();

        toggle.opening.subscribe((e: CancelableEventArgs) => e.cancel = true);
        toggle.open();
        fixture.detectChanges();
        tick();

        expect(toggle.opening.emit).toHaveBeenCalledTimes(2);
        expect(toggle.opened.emit).toHaveBeenCalledTimes(1);
    }));

    it('fix for #3636 - ToggleAction should provide its element as target', fakeAsync(() => {
        const fixture = TestBed.createComponent(TestWithThreeToggleActionsComponent);
        fixture.detectChanges();
        fixture.debugElement.componentInstance.overlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Right;

        let button = fixture.componentInstance.button1.nativeElement;
        button.click();
        tick();
        fixture.detectChanges();

        let toggle = fixture.debugElement.query(By.css('#toggle1'));
        let toggleRect = toggle.nativeElement.getBoundingClientRect();
        let buttonRect = button.getBoundingClientRect();
        expect(Math.round(toggleRect.left)).toBe(Math.round(buttonRect.right));
        expect(Math.round(toggleRect.top)).toBe(Math.round(buttonRect.bottom));

        button = fixture.componentInstance.button2.nativeElement;
        button.click();
        fixture.detectChanges();

        toggle = fixture.debugElement.query(By.css('#toggle2'));
        toggleRect = toggle.nativeElement.getBoundingClientRect();
        buttonRect = button.getBoundingClientRect();
        expect(Math.round(toggleRect.left)).toBe(Math.round(buttonRect.right));
        expect(Math.round(toggleRect.top)).toBe(Math.round(buttonRect.bottom));

        button = fixture.componentInstance.button3.nativeElement;
        button.click();
        tick();
        fixture.detectChanges();

        toggle = fixture.debugElement.query(By.css('#toggle3'));
        toggleRect = toggle.nativeElement.getBoundingClientRect();
        buttonRect = button.getBoundingClientRect();
        expect(Math.round(toggleRect.left)).toBe(Math.round(buttonRect.right));
        expect(Math.round(toggleRect.top)).toBe(Math.round(buttonRect.bottom));
    }));

    it('fix for #3636 - All toggles should scroll correctly', fakeAsync(() => {
        const fixture = TestBed.createComponent(TestWithThreeToggleActionsComponent);
        fixture.detectChanges();
        fixture.debugElement.componentInstance.overlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Right;

        let button = fixture.componentInstance.button1.nativeElement;
        button.click();
        button = fixture.componentInstance.button2.nativeElement;
        button.click();
        button = fixture.componentInstance.button3.nativeElement;
        button.click();
        fixture.detectChanges();
        tick();

        let toggle = fixture.debugElement.query(By.css('#toggle1'));
        let toggleRect = toggle.nativeElement.getBoundingClientRect();
        button = fixture.componentInstance.button1.nativeElement;
        let buttonRect = button.getBoundingClientRect();
        expect(Math.round(toggleRect.left)).toBe(Math.round(buttonRect.right));
        expect(Math.round(toggleRect.top)).toBe(Math.round(buttonRect.bottom));

        toggle = fixture.debugElement.query(By.css('#toggle2'));
        toggleRect = toggle.nativeElement.getBoundingClientRect();
        button = fixture.componentInstance.button2.nativeElement;
        buttonRect = button.getBoundingClientRect();
        expect(Math.round(toggleRect.left)).toBe(Math.round(buttonRect.right));
        expect(Math.round(toggleRect.top)).toBe(Math.round(buttonRect.bottom));

        toggle = fixture.debugElement.query(By.css('#toggle3'));
        toggleRect = toggle.nativeElement.getBoundingClientRect();
        button = fixture.componentInstance.button3.nativeElement;
        buttonRect = button.getBoundingClientRect();
        expect(Math.round(toggleRect.left)).toBe(Math.round(buttonRect.right));
        expect(Math.round(toggleRect.top)).toBe(Math.round(buttonRect.bottom));

        document.documentElement.scrollTop += 100;
        document.dispatchEvent(new Event('scroll'));
        tick();

        toggle = fixture.debugElement.query(By.css('#toggle1'));
        toggleRect = toggle.nativeElement.getBoundingClientRect();
        button = fixture.componentInstance.button1.nativeElement;
        buttonRect = button.getBoundingClientRect();
        expect(Math.round(toggleRect.left)).toBe(Math.round(buttonRect.right));
        expect(Math.round(toggleRect.top)).toBe(Math.round(buttonRect.bottom));

        toggle = fixture.debugElement.query(By.css('#toggle2'));
        toggleRect = toggle.nativeElement.getBoundingClientRect();
        button = fixture.componentInstance.button2.nativeElement;
        buttonRect = button.getBoundingClientRect();
        expect(Math.round(toggleRect.left)).toBe(Math.round(buttonRect.right));
        expect(Math.round(toggleRect.top)).toBe(Math.round(buttonRect.bottom));

        toggle = fixture.debugElement.query(By.css('#toggle3'));
        toggleRect = toggle.nativeElement.getBoundingClientRect();
        button = fixture.componentInstance.button3.nativeElement;
        buttonRect = button.getBoundingClientRect();
        expect(Math.round(toggleRect.left)).toBe(Math.round(buttonRect.right));
        expect(Math.round(toggleRect.top)).toBe(Math.round(buttonRect.bottom));
    }));

    it('fix for #3810 - Should not open toggle when already opened', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        const toggle = fixture.componentInstance.toggle;
        spyOn(toggle.opening, 'emit');
        spyOn(toggle.opened, 'emit');
        toggle.open();
        tick();
        fixture.detectChanges();

        expect(toggle.opening.emit).toHaveBeenCalledTimes(1);
        expect(toggle.opened.emit).toHaveBeenCalledTimes(1);

        toggle.open();
        tick();
        fixture.detectChanges();

        expect(toggle.opening.emit).toHaveBeenCalledTimes(1);
        expect(toggle.opened.emit).toHaveBeenCalledTimes(1);
    }));

    it('fix for #3810 - Should not close toggle when not open', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        const toggle = fixture.componentInstance.toggle;
        spyOn(toggle.opening, 'emit');
        spyOn(toggle.opened, 'emit');
        toggle.open();
        tick();
        fixture.detectChanges();

        expect(toggle.opening.emit).toHaveBeenCalledTimes(1);
        expect(toggle.opened.emit).toHaveBeenCalledTimes(1);

        spyOn(toggle.closing, 'emit');
        spyOn(toggle.closed, 'emit');
        toggle.close();
        tick();
        fixture.detectChanges();

        expect(toggle.closing.emit).toHaveBeenCalledTimes(1);
        expect(toggle.closed.emit).toHaveBeenCalledTimes(1);

        toggle.close();
        tick();
        fixture.detectChanges();

        expect(toggle.closing.emit).toHaveBeenCalledTimes(1);
        expect(toggle.closed.emit).toHaveBeenCalledTimes(1);
    }));

    it('fix for #4222 - Should emit closed when closed second time', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        const toggle = fixture.componentInstance.toggle;
        toggle.closed.subscribe(() => {
            toggle.open();
        });

        spyOn(toggle.opening, 'emit');
        spyOn(toggle.closed, 'emit').and.callThrough();

        toggle.open();
        tick();
        fixture.detectChanges();
        expect(toggle.opening.emit).toHaveBeenCalledTimes(1);

        toggle.close();
        tick();
        fixture.detectChanges();
        expect(toggle.closed.emit).toHaveBeenCalledTimes(1);
        expect(toggle.opening.emit).toHaveBeenCalledTimes(2);

        toggle.close();
        tick();
        fixture.detectChanges();
        expect(toggle.closed.emit).toHaveBeenCalledTimes(2);
        expect(toggle.opening.emit).toHaveBeenCalledTimes(3);
    }));

    describe('overlay settings', () => {
        // configureTestSuite();
        it('should pass correct defaults from IgxToggleActionDirective and respect outsideClickClose', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
            fixture.detectChanges();
            spyOn(IgxToggleDirective.prototype, 'toggle');
            const button = fixture.debugElement.query(By.directive(IgxToggleActionDirective)).nativeElement as HTMLElement;

            const defaults: OverlaySettings = {
                target: button,
                positionStrategy: jasmine.any(ConnectedPositioningStrategy) as any,
                closeOnOutsideClick: true,
                modal: false,
                scrollStrategy: jasmine.any(AbsoluteScrollStrategy) as any,
                excludeFromOutsideClick: [button]
            };

            fixture.componentInstance.toggleAction.onClick();
            expect(IgxToggleDirective.prototype.toggle).toHaveBeenCalledWith(defaults);

            fixture.componentInstance.settings.closeOnOutsideClick = false;
            fixture.detectChanges();
            fixture.componentInstance.toggleAction.onClick();
            defaults.closeOnOutsideClick = false;
            expect(IgxToggleDirective.prototype.toggle).toHaveBeenCalledWith(defaults);
        }));

        it('should pass overlaySettings input from IgxToggleActionDirective and respect outsideClickClose', () => {
            const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
            fixture.detectChanges();
            spyOn(IgxToggleDirective.prototype, 'toggle');
            const button = fixture.debugElement.query(By.directive(IgxToggleActionDirective)).nativeElement;

            const settings: OverlaySettings = {
                target: button,
                positionStrategy: jasmine.any(ConnectedPositioningStrategy) as any,
                closeOnOutsideClick: true,
                modal: false,
                scrollStrategy: jasmine.any(AbsoluteScrollStrategy) as any,
                excludeFromOutsideClick: [button]
            };

            // defaults
            fixture.componentInstance.toggleAction.onClick();
            expect(IgxToggleDirective.prototype.toggle).toHaveBeenCalledWith(settings);

            // override modal and strategy
            fixture.componentInstance.settings.modal = true;
            fixture.componentInstance.settings.positionStrategy = new AutoPositionStrategy();
            settings.modal = true;
            settings.positionStrategy = jasmine.any(AutoPositionStrategy) as any;
            fixture.detectChanges();
            fixture.componentInstance.toggleAction.onClick();
            expect(IgxToggleDirective.prototype.toggle).toHaveBeenCalledWith(settings);

            // override close on click
            fixture.componentInstance.settings.closeOnOutsideClick = false;
            settings.closeOnOutsideClick = false;
            fixture.detectChanges();
            fixture.componentInstance.toggleAction.onClick();
            expect(IgxToggleDirective.prototype.toggle).toHaveBeenCalledWith(settings);
        });

        it('should pass input overlaySettings from igxToggleAction and set position target if not provided', () => {
            const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
            fixture.detectChanges();
            const toggleSpy = spyOn(IgxToggleDirective.prototype, 'toggle');
            const button = fixture.debugElement.query(By.directive(IgxToggleActionDirective)).nativeElement;

            const settings: OverlaySettings = {
                positionStrategy: jasmine.any(ConnectedPositioningStrategy) as any,
                closeOnOutsideClick: true,
                modal: false,
                scrollStrategy: jasmine.any(AbsoluteScrollStrategy) as any,
                excludeFromOutsideClick: [button]
            };
            fixture.componentInstance.settings.positionStrategy = new ConnectedPositioningStrategy();
            fixture.detectChanges();

            fixture.componentInstance.toggleAction.onClick();
            settings.target = button;
            expect(toggleSpy).toHaveBeenCalledWith(settings);
        });

        it('Should fire toggle "closing" event when closing through closeOnOutsideClick', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
            fixture.detectChanges();

            const toggle = fixture.componentInstance.toggle;

            spyOn(toggle, 'toggle').and.callThrough();
            spyOn(toggle.closed, 'emit').and.callThrough();
            spyOn(toggle.closing, 'emit').and.callThrough();
            spyOn(toggle.opening, 'emit').and.callThrough();
            spyOn(toggle.opened, 'emit').and.callThrough();

            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            button.click();
            tick();
            fixture.detectChanges();

            expect(toggle.opening.emit).toHaveBeenCalledTimes(1);
            expect(toggle.opened.emit).toHaveBeenCalledTimes(1);

            document.documentElement.dispatchEvent(new Event('click'));
            tick();
            fixture.detectChanges();

            expect(toggle.closing.emit).toHaveBeenCalledTimes(1);
            expect(toggle.closing.emit).toHaveBeenCalledWith({ id: '0', owner: toggle, cancel: false, event: new Event('click') });
            expect(toggle.closed.emit).toHaveBeenCalledTimes(1);
        }));

        it('should pass IgxOverlayOutletDirective input from IgxToggleActionDirective', () => {
            const fixture = TestBed.createComponent(IgxToggleOutletComponent);
            const outlet = fixture.debugElement.query(By.css('.outlet-container')).nativeElement;
            const toggleSpy = spyOn(IgxToggleDirective.prototype, 'toggle');
            const button = fixture.debugElement.query(By.directive(IgxToggleActionDirective)).nativeElement;
            fixture.detectChanges();

            const settings: OverlaySettings = {
                target: button,
                positionStrategy: jasmine.any(ConnectedPositioningStrategy) as any,
                closeOnOutsideClick: true,
                modal: false,
                scrollStrategy: jasmine.any(AbsoluteScrollStrategy) as any,
                outlet: jasmine.any(IgxOverlayOutletDirective) as any,
                excludeFromOutsideClick: [button]
            };

            fixture.componentInstance.toggleAction.onClick();
            expect(IgxToggleDirective.prototype.toggle).toHaveBeenCalledWith(settings);
            const directive = toggleSpy.calls.mostRecent().args[0].outlet as IgxOverlayOutletDirective;
            expect(directive.nativeElement).toBe(outlet);
        });
    });
});

@Component({
    template: `
    <div igxToggle #toggleRef="toggle" (onOpen)="open()" (onClose)="close()">
      <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
        <li>4</li>
      </ul>
    </div>
    `
})
export class IgxToggleTestComponent {
    @ViewChild(IgxToggleDirective, { static: true }) public toggle: IgxToggleDirective;
    public open() { }
    public close() { }
}
@Component({
    template: `
    <p>Test</p>
    <button [igxToggleAction]="toggleRef" [overlaySettings]="settings">Open/Close Toggle</button>
    <div igxToggle #toggleRef="toggle">
      <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
        <li>4</li>
      </ul>
    </div>
    `
})
export class IgxToggleActionTestComponent {
    @ViewChild(IgxToggleDirective, { static: true }) public toggle: IgxToggleDirective;
    @ViewChild(IgxToggleActionDirective, { static: true }) public toggleAction: IgxToggleActionDirective;
    public settings: OverlaySettings = {};
    constructor() {
        this.settings.closeOnOutsideClick = true;
    }
}

@Component({
    template: `
    <button [igxToggleAction]="toggleRef" [overlaySettings]="{}" [igxToggleOutlet]="outlet"></button>
    <div igxToggle #toggleRef="toggle"></div>
    <div igxOverlayOutlet #outlet="overlay-outlet" class="outlet-container"></div>
    `
})
export class IgxToggleOutletComponent extends IgxToggleActionTestComponent { }

@Component({
    template: `
        <button igxToggleAction="toggleID">Open/Close Toggle</button>
        <div igxToggle id="toggleID">
            <span>Some content</span>
        </div>
    `
})
export class IgxToggleServiceInjectComponent {
    @ViewChild(IgxToggleDirective, { static: true }) public toggle: IgxToggleDirective;
    @ViewChild(IgxToggleActionDirective, { static: true }) public toggleAction: IgxToggleActionDirective;
}

@Component({
    template: `
        <div igxToggle id="toggleID">
            <span>Some content</span>
        </div>
        <div #other>
            <span>Some more content</span>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IgxOverlayServiceComponent {
    @ViewChild(IgxToggleDirective, { static: true }) public toggle: IgxToggleDirective;
    @ViewChild(`other`, { static: true }) public other: ElementRef;
    /**
     *
     */
    constructor(public overlay: IgxOverlayService) { }
}

@Component({
    template: `
        <button igxToggleAction="toggleID">Open/Close Toggle</button>
        <div igxToggle id="toggleID">
            <span>Some content</span>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestWithOnPushComponent {
    @ViewChild(IgxToggleDirective, { static: true }) public toggle: IgxToggleDirective;
}

@Component({
    template: `
        <button #button1 igxToggleAction="toggle1" [overlaySettings]="overlaySettings" style="position:absolute; left: 100px; top: 10%">
            BUTTON 1
        </button>
        <div id="toggle1" igxToggle style="width: 100px; height: 100px;">
            <span>Toggle 1</span>
        </div>

        <button #button2 igxToggleAction="toggle2" [overlaySettings]="overlaySettings" style="position:absolute; left: 300px; top: 50%">
            BUTTON 2
        </button>
        <div id="toggle2" igxToggle style="width: 100px; height: 100px;">
            <span>Toggle 2</span>
        </div>

        <button #button3 igxToggleAction="toggle3" [overlaySettings]="overlaySettings" style="position:absolute; left: 500px; top: 110%">
            BUTTON 3
        </button>
        <div id="toggle3" igxToggle style="width: 100px; height: 100px;">
            <span>Toggle 3</span>
        </div>
    `
})
export class TestWithThreeToggleActionsComponent implements OnInit {
    @ViewChild('button1', { static: true }) public button1: ElementRef;
    @ViewChild('button2', { static: true }) public button2: ElementRef;
    @ViewChild('button3', { static: true }) public button3: ElementRef;

    public overlaySettings: OverlaySettings = {};

    public ngOnInit(): void {
        this.overlaySettings.positionStrategy = new ConnectedPositioningStrategy({
            horizontalDirection: HorizontalAlignment.Left,
            horizontalStartPoint: HorizontalAlignment.Right
        });
        this.overlaySettings.closeOnOutsideClick = false;
    }
}
