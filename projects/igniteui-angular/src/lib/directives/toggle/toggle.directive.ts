import {
    ChangeDetectorRef,
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    Inject
} from '@angular/core';
import { IgxNavigationService, IToggleView } from '../../core/navigation';
import { IgxOverlayService } from '../../services/overlay/overlay';
import {
    AbsoluteScrollStrategy,
    ConnectedPositioningStrategy,
    IPositionStrategy,
    OverlayEventArgs,
    OverlaySettings
} from '../../services/public_api';
import { filter, first, takeUntil } from 'rxjs/operators';
import { Subscription, Subject, MonoTypeOperatorFunction } from 'rxjs';
import { OverlayClosingEventArgs } from '../../services/overlay/utilities';
import { CancelableBrowserEventArgs, IBaseEventArgs } from '../../core/utils';

export interface ToggleViewEventArgs extends IBaseEventArgs {
    /** Id of the toggle view */
    id: string;
    event?: Event;
}

export interface ToggleViewCancelableEventArgs extends ToggleViewEventArgs, CancelableBrowserEventArgs { }

@Directive({
    exportAs: 'toggle',
    selector: '[igxToggle]'
})
export class IgxToggleDirective implements IToggleView, OnInit, OnDestroy {
    /**
     * Emits an event after the toggle container is opened.
     *
     * ```typescript
     * onToggleOpened(event) {
     *    alert("Toggle opened!");
     * }
     * ```
     *
     * ```html
     * <div
     *   igxToggle
     *   (onOpened)='onToggleOpened($event)'>
     * </div>
     * ```
     */
    @Output()
    public opened = new EventEmitter<ToggleViewEventArgs>();

    /**
     * Emits an event before the toggle container is opened.
     *
     * ```typescript
     * onToggleOpening(event) {
     *  alert("Toggle opening!");
     * }
     * ```
     *
     * ```html
     * <div
     *   igxToggle
     *   (onOpening)='onToggleOpening($event)'>
     * </div>
     * ```
     */
    @Output()
    public opening = new EventEmitter<ToggleViewCancelableEventArgs>();

    /**
     * Emits an event after the toggle container is closed.
     *
     * ```typescript
     * onToggleClosed(event) {
     *  alert("Toggle closed!");
     * }
     * ```
     *
     * ```html
     * <div
     *   igxToggle
     *   (onClosed)='onToggleClosed($event)'>
     * </div>
     * ```
     */
    @Output()
    public closed = new EventEmitter<ToggleViewEventArgs>();

    /**
     * Emits an event before the toggle container is closed.
     *
     * ```typescript
     * onToggleClosing(event) {
     *  alert("Toggle closing!");
     * }
     * ```
     *
     * ```html
     * <div
     *  igxToggle
     *  (onClosing)='onToggleClosing($event)'>
     * </div>
     * ```
     */
    @Output()
    public closing = new EventEmitter<ToggleViewCancelableEventArgs>();

    /**
     * Emits an event after the toggle element is appended to the overlay container.
     *
     * ```typescript
     * onAppended() {
     *  alert("Content appended!");
     * }
     * ```
     *
     * ```html
     * <div
     *   igxToggle
     *   (onAppended)='onToggleAppended()'>
     * </div>
     * ```
     */
    @Output()
    public appended = new EventEmitter<ToggleViewEventArgs>();

    /**
     * @hidden
     */
    public get collapsed(): boolean {
        return this._collapsed;
    }

    /**
     * Identifier which is registered into `IgxNavigationService`
     *
     * ```typescript
     * let myToggleId = this.toggle.id;
     * ```
     */
    @Input()
    public id: string;

    /**
     * @hidden
     */
    public get element(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-toggle--hidden')
    @HostBinding('attr.aria-hidden')
    public get hiddenClass() {
        return this.collapsed;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-toggle')
    public get defaultClass() {
        return !this.collapsed;
    }

    protected _overlayId: string;

    private _collapsed = true;
    private destroy$ = new Subject<boolean>();
    private _overlaySubFilter: [MonoTypeOperatorFunction<OverlayEventArgs>, MonoTypeOperatorFunction<OverlayEventArgs>] = [
        filter(x => x.id === this._overlayId),
        takeUntil(this.destroy$)
    ];
    private _overlayOpenedSub: Subscription;
    private _overlayClosingSub: Subscription;
    private _overlayClosedSub: Subscription;
    private _overlayContentAppendedSub: Subscription;

    /**
     * @hidden
     */
    constructor(
        private elementRef: ElementRef,
        private cdr: ChangeDetectorRef,
        @Inject(IgxOverlayService) protected overlayService: IgxOverlayService,
        @Optional() private navigationService: IgxNavigationService) {
    }

    /**
     * Opens the toggle.
     *
     * ```typescript
     * this.myToggle.open();
     * ```
     */
    public open(overlaySettings?: OverlaySettings) {
        //  if there is open animation do nothing
        //  if toggle is not collapsed and there is no close animation do nothing
        const info = this.overlayService.getOverlayById(this._overlayId);
        const openAnimationStarted = info?.openAnimationPlayer?.hasStarted() ?? false;
        const closeAnimationStarted = info?.closeAnimationPlayer?.hasStarted() ?? false;
        if (openAnimationStarted || !(this._collapsed || closeAnimationStarted)) {
            return;
        }

        this._collapsed = false;
        this.cdr.detectChanges();

        if (!info) {
            this.unsubscribe();
            this.subscribe();
            this._overlayId = this.overlayService.attach(this.elementRef, overlaySettings);
        }

        const openEventArgs: ToggleViewCancelableEventArgs = { cancel: false, owner: this, id: this._overlayId };
        this.opening.emit(openEventArgs);
        if (openEventArgs.cancel) {
            this.unsubscribe();
            this.overlayService.detach(this._overlayId);
            this._collapsed = true;
            this.cdr.detectChanges();
            return;
        }
        this.overlayService.show(this._overlayId, overlaySettings);
    }

    /**
     * Closes the toggle.
     *
     * ```typescript
     * this.myToggle.close();
     * ```
     */
    public close() {
        //  if toggle is collapsed do nothing
        //  if there is close animation do nothing, toggle will close anyway
        const info = this.overlayService.getOverlayById(this._overlayId);
        const closeAnimationStarted = info?.closeAnimationPlayer?.hasStarted() || false;
        if (this._collapsed || closeAnimationStarted) {
            return;
        }

        this.overlayService.hide(this._overlayId);
    }

    /**
     * Opens or closes the toggle, depending on its current state.
     *
     * ```typescript
     * this.myToggle.toggle();
     * ```
     */
    public toggle(overlaySettings?: OverlaySettings) {
        //  if toggle is collapsed call open
        //  if there is running close animation call open
        if (this.collapsed || this.isClosing) {
            this.open(overlaySettings);
        } else {
            this.close();
        }
    }

    /** @hidden @internal */
    public get isClosing() {
        const info = this.overlayService.getOverlayById(this._overlayId);
        return info ? info.closeAnimationPlayer?.hasStarted() : false;
    }

    /**
     * Returns the id of the overlay the content is rendered in.
     * ```typescript
     * this.myToggle.overlayId;
     * ```
     */
    public get overlayId() {
        return this._overlayId;
    }

    /**
     * Repositions the toggle.
     * ```typescript
     * this.myToggle.reposition();
     * ```
     */
    public reposition() {
        this.overlayService.reposition(this._overlayId);
    }

    /**
     * Offsets the content along the corresponding axis by the provided amount
     */
    public setOffset(deltaX: number, deltaY: number) {
        this.overlayService.setOffset(this._overlayId, deltaX, deltaY);
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        if (this.navigationService && this.id) {
            this.navigationService.add(this.id, this);
        }
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        if (this.navigationService && this.id) {
            this.navigationService.remove(this.id);
        }
        if (!this.collapsed && this._overlayId) {
            this.overlayService.detach(this._overlayId);
        }
        this.unsubscribe();
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    private overlayClosed = (ev) => {
        this._collapsed = true;
        this.cdr.detectChanges();
        this.unsubscribe();
        this.overlayService.detach(this.overlayId);
        const closedEventArgs: ToggleViewEventArgs = { owner: this, id: this._overlayId, event: ev.event };
        delete this._overlayId;
        this.closed.emit(closedEventArgs);
        this.cdr.markForCheck();
    };

    private subscribe() {
        this._overlayContentAppendedSub = this.overlayService
            .contentAppended
            .pipe(first(), takeUntil(this.destroy$))
            .subscribe(() => {
                const appendedEventArgs: ToggleViewEventArgs = { owner: this, id: this._overlayId };
                this.appended.emit(appendedEventArgs);
            });

        this._overlayOpenedSub = this.overlayService
            .opened
            .pipe(...this._overlaySubFilter)
            .subscribe(() => {
                const openedEventArgs: ToggleViewEventArgs = { owner: this, id: this._overlayId };
                this.opened.emit(openedEventArgs);
            });

        this._overlayClosingSub = this.overlayService
            .closing
            .pipe(...this._overlaySubFilter)
            .subscribe((e: OverlayClosingEventArgs) => {
                const eventArgs: ToggleViewCancelableEventArgs = { cancel: false, event: e.event, owner: this, id: this._overlayId };
                this.closing.emit(eventArgs);
                e.cancel = eventArgs.cancel;

                //  in case event is not canceled this will close the toggle and we need to unsubscribe.
                //  Otherwise if for some reason, e.g. close on outside click, close() gets called before
                //  onClosed was fired we will end with calling onClosing more than once
                if (!e.cancel) {
                    this.clearSubscription(this._overlayClosingSub);
                }
            });

        this._overlayClosedSub = this.overlayService
            .closed
            .pipe(...this._overlaySubFilter)
            .subscribe(this.overlayClosed);
    }

    private unsubscribe() {
        this.clearSubscription(this._overlayOpenedSub);
        this.clearSubscription(this._overlayClosingSub);
        this.clearSubscription(this._overlayClosedSub);
        this.clearSubscription(this._overlayContentAppendedSub);
    }

    private clearSubscription(subscription: Subscription) {
        if (subscription && !subscription.closed) {
            subscription.unsubscribe();
        }
    }
}

@Directive({
    exportAs: 'toggle-action',
    selector: '[igxToggleAction]'
})
export class IgxToggleActionDirective implements OnInit {
    /**
     * Provide settings that control the toggle overlay positioning, interaction and scroll behavior.
     * ```typescript
     * const settings: OverlaySettings = {
     *      closeOnOutsideClick: false,
     *      modal: false
     *  }
     * ```
     * ---
     * ```html
     * <!--set-->
     * <div igxToggleAction [overlaySettings]="settings"></div>
     * ```
     */
    @Input()
    public overlaySettings: OverlaySettings;

    /**
     * Determines where the toggle element overlay should be attached.
     *
     * ```html
     * <!--set-->
     * <div igxToggleAction [igxToggleOutlet]="outlet"></div>
     * ```
     * Where `outlet` in an instance of `IgxOverlayOutletDirective` or an `ElementRef`
     */
    @Input('igxToggleOutlet')
    public outlet: IgxOverlayOutletDirective | ElementRef;

    /**
     * @hidden
     */
    @Input('igxToggleAction')
    public set target(target: any) {
        if (target !== null && target !== '') {
            this._target = target;
        }
    }

    /**
     * @hidden
     */
    public get target(): any {
        if (typeof this._target === 'string') {
            return this.navigationService.get(this._target);
        }
        return this._target;
    }

    protected _overlayDefaults: OverlaySettings;
    protected _target: IToggleView | string;

    constructor(private element: ElementRef, @Optional() private navigationService: IgxNavigationService) { }

    /**
     * @hidden
     */
    @HostListener('click')
    public onClick() {
        if (this.outlet) {
            this._overlayDefaults.outlet = this.outlet;
        }

        const clonedSettings = Object.assign({}, this._overlayDefaults, this.overlaySettings);
        this.updateOverlaySettings(clonedSettings);
        this.target.toggle(clonedSettings);
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        const targetElement = this.element.nativeElement;
        this._overlayDefaults = {
            target: targetElement,
            positionStrategy: new ConnectedPositioningStrategy(),
            scrollStrategy: new AbsoluteScrollStrategy(),
            closeOnOutsideClick: true,
            modal: false,
            excludeFromOutsideClick: [targetElement as HTMLElement]
        };
    }

    /**
     * Updates provided overlay settings
     *
     * @param settings settings to update
     * @returns returns updated copy of provided overlay settings
     */
    protected updateOverlaySettings(settings: OverlaySettings): OverlaySettings {
        if (settings && settings.positionStrategy) {
            const positionStrategyClone: IPositionStrategy = settings.positionStrategy.clone();
            settings.target = this.element.nativeElement;
            settings.positionStrategy = positionStrategyClone;
        }

        return settings;
    }
}

/**
 * Mark an element as an igxOverlay outlet container.
 * Directive instance is exported as `overlay-outlet` to be assigned to templates variables:
 * ```html
 * <div igxOverlayOutlet #outlet="overlay-outlet"></div>
 * ```
 */
@Directive({
    exportAs: 'overlay-outlet',
    selector: '[igxOverlayOutlet]'
})
export class IgxOverlayOutletDirective {
    constructor(public element: ElementRef<HTMLElement>) { }

    /** @hidden */
    public get nativeElement() {
        return this.element.nativeElement;
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxToggleDirective, IgxToggleActionDirective, IgxOverlayOutletDirective],
    exports: [IgxToggleDirective, IgxToggleActionDirective, IgxOverlayOutletDirective],
    providers: [IgxNavigationService]
})
export class IgxToggleModule { }
