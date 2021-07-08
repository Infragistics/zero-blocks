import { useAnimation } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    ViewChild,
    AfterContentInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IgxNavigationService, IToggleView } from '../core/navigation';
import { IgxButtonModule, IgxButtonType } from '../directives/button/button.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxDialogActionsDirective, IgxDialogTitleDirective } from './dialog.directives';
import { IgxToggleModule, IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { OverlaySettings, GlobalPositionStrategy, NoOpScrollStrategy, PositionSettings } from '../services/public_api';
import { slideInBottom, slideOutTop } from '../animations/slide/index';
import { IgxFocusModule } from '../directives/focus/focus.directive';
import { CancelableEventArgs, IBaseEventArgs } from '../core/utils';

let DIALOG_ID = 0;
/**
 * **Ignite UI for Angular Dialog Window** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/dialog.html)
 *
 * The Ignite UI Dialog Window presents a dialog window to the user which can simply display messages or display
 * more complicated visuals such as a user sign-in form.  It also provides a right and left button
 * which can be used for custom actions.
 *
 * Example:
 * ```html
 * <button (click)="form.open()">Show Dialog</button>
 * <igx-dialog #form title="Sign In" rightButtonLabel="OK">
 *   <div>
 *     <igx-input-group>
 *       <input type="text" igxInput/>
 *       <label igxLabel>Username</label>
 *     </igx-input-group>
 *   </div>
 *   <div>
 *     <igx-input-group>
 *       <input type="password" igxInput/>
 *       <label igxLabel>Password</label>
 *     </igx-input-group>
 *   </div>
 * </igx-dialog>
 * ```
 */
@Component({
    selector: 'igx-dialog',
    templateUrl: 'dialog-content.component.html'
})
export class IgxDialogComponent implements IToggleView, OnInit, OnDestroy, AfterContentInit {
    private static NEXT_ID = 1;
    private static readonly DIALOG_CLASS = 'igx-dialog';



    @ViewChild(IgxToggleDirective, { static: true })
    public toggleRef: IgxToggleDirective;

    /**
     * An @Input property that sets the value of the `id` attribute. If not provided it will be automatically generated.
     * ```html
     * <igx-dialog [id]="'igx-dialog-56'" #alert title="Notification"
     *  leftButtonLabel="OK" (leftButtonSelect)="alert.close()">
     * </igx-dialog>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-dialog-${DIALOG_ID++}`;

    /**
     * Controls whether the dialog should be shown as modal. Defaults to `true`
     * ```html
     * <igx-dialog [isModal]="false" ></igx-dialog>
     * ```
     */
    @Input()
    public get isModal() {
        return this._isModal;
    }

    public set isModal(val: boolean) {
        this._overlayDefaultSettings.modal = val;
        this._isModal = val;
    }

    /**
     * Controls whether the dialog should close when `Esc` key is pressed. Defaults to `true`
     * ```html
     * <igx-dialog [closeOnEscape]="false" ></igx-dialog>
     * ```
     */
    @Input()
    public get closeOnEscape() {
        return this._closeOnEscape;
    }

    public set closeOnEscape(val: boolean) {
        this._overlayDefaultSettings.closeOnEscape = val;
        this._closeOnEscape = val;
    }

    /**
     * An @Input property controlling the `title` of the dialog.
     * ```html
     * <igx-dialog title="Notification" #alert leftButtonLabel="OK" (leftButtonSelect)="alert.close()"></igx-dialog>
     * ```
     */
    @Input()
    public title = '';

    /**
     *  An @Input property controlling the `message` of the dialog.
     * ```html
     * <igx-dialog message="Your email was sent!" #alert leftButtonLabel="OK" (leftButtonSelect)="alert.close()"></igx-dialog>
     * ```
     */
    @Input()
    public message = '';

    /**
     * An @Input property to set the `label` of the left button of the dialog.
     * ```html
     * <igx-dialog leftButtonLabel="OKAY" #alert title="Notification"  (leftButtonSelect)="alert.close()"></igx-dialog>
     * ```
     */
    @Input()
    public leftButtonLabel = '';

    /**
     * An @Input property to set the left button `type`. The types are `flat`, `raised` and `fab`.
     * The `flat` type button is a rectangle and doesn't have a shadow. <br>
     * The `raised` type button is also a rectangle but has a shadow. <br>
     * The `fab` type button is a circle with a shadow. <br>
     * The default value is `flat`.
     * ```html
     * <igx-dialog leftButtonType="raised" leftButtonLabel="OKAY" #alert (leftButtonSelect)="alert.close()"></igx-dialog>
     * ```
     */
    @Input()
    public leftButtonType: IgxButtonType = 'flat';
    /**
     * An @Input property to set the left button color. The property accepts all valid CSS color property values.
     * ```html
     * <igx-dialog leftButtonColor="yellow" leftButtonLabel="OKAY" #alert (leftButtonSelect)="alert.close()"></igx-dialog>
     * ```
     */
    @Input()
    public leftButtonColor = '';

    /**
     * An @Input property to set the left button `background-color`. The property accepts all valid CSS color property values.
     * ```html
     * <igx-dialog leftButtonBackgroundColor="black" leftButtonLabel="OKAY" #alert (leftButtonSelect)="alert.close()"></igx-dialog>
     * ```
     */
    @Input()
    public leftButtonBackgroundColor = '';

    /**
     * An @Input property to set the left button `ripple`. The `ripple` animates a click/tap to a component as a series of fading waves.
     * The property accepts all valid CSS color property values.
     * ```html
     * <igx-dialog leftButtonRipple="green" leftButtonLabel="OKAY" #alert (leftButtonSelect)="alert.close()"></igx-dialog>
     * ```
     */
    @Input()
    public leftButtonRipple = '';

    /**
     * An @Input property to set the `label` of the right button of the dialog.
     * ```html
     * <igx-dialog rightButtonLabel="OKAY" #alert title="Notification"  (leftButtonSelect)="alert.close()"></igx-dialog>
     * ```
     */
    @Input()
    public rightButtonLabel = '';

    /**
     * An @Input property to set the right button `type`. The types are `flat`, `raised` and `fab`.
     * The `flat` type button is a rectangle and doesn't have a shadow. <br>
     * The `raised` type button is also a rectangle but has a shadow. <br>
     * The `fab` type button is a circle with a shadow. <br>
     * The default value is `flat`.
     * ```html
     * <igx-dialog rightButtonType="fab" rightButtonLabel="OKAY" #alert (leftButtonSelect)="alert.close()"></igx-dialog>
     * ```
     */
    @Input()
    public rightButtonType: IgxButtonType = 'flat';

    /**
     * An @Input property to set the right button `color`. The property accepts all valid CSS color property values.
     * ```html
     * <igx-dialog rightButtonColor="yellow" rightButtonLabel="OKAY" #alert (leftButtonSelect)="alert.close()"></igx-dialog>
     * ```
     */
    @Input()
    public rightButtonColor = '';

    /**
     * An @Input property to set the right button `background-color`. The property accepts all valid CSS color property values.
     * ```html
     * <igx-dialog rightButtonBackgroundColor="black" rightButtonLabel="OKAY" #alert (leftButtonSelect)="alert.close()"></igx-dialog>
     * ```
     */
    @Input()
    public rightButtonBackgroundColor = '';

    /**
     * An @Input property to set the right button `ripple`.
     * ```html
     * <igx-dialog rightButtonRipple="green" rightButtonLabel="OKAY" #alert (leftButtonSelect)="alert.close()"></igx-dialog>
     * ```
     */
    @Input()
    public rightButtonRipple = '';

    /**
     * An @Input property that allows you to enable the "close on click outside the dialog". By default it's disabled.
     * ```html
     * <igx-dialog closeOnOutsideSelect="true" leftButtonLabel="Cancel" (leftButtonSelect)="dialog.close()"
     * rightButtonLabel="OK" rightButtonRipple="#4CAF50" (rightButtonSelect)="onDialogOKSelected($event)">
     * </igx-dialog>
     * ```
     */
    @Input()
    public get closeOnOutsideSelect() {
        return this._closeOnOutsideSelect;
    }

    public set closeOnOutsideSelect(val: boolean) {
        this._overlayDefaultSettings.closeOnOutsideClick = val;
        this._closeOnOutsideSelect = val;
    }

    /**
     * Get the position and animation settings used by the dialog.
     * ```typescript
     * @ViewChild('alert', { static: true }) public alert: IgxDialogComponent;
     * let currentPosition: PositionSettings = this.alert.positionSettings
     * ```
     */
    @Input()
    public get positionSettings(): PositionSettings {
        return this._positionSettings;
    }

    /**
     * Set the position and animation settings used by the dialog.
     * ```typescript
     * import { slideInLeft, slideOutRight } from 'igniteui-angular';
     * ...
     * @ViewChild('alert', { static: true }) public alert: IgxDialogComponent;
     *  public newPositionSettings: PositionSettings = {
     *      openAnimation: useAnimation(slideInTop, { params: { duration: '2000ms' } }),
     *      closeAnimation: useAnimation(slideOutBottom, { params: { duration: '2000ms'} }),
     *      horizontalDirection: HorizontalAlignment.Left,
     *      verticalDirection: VerticalAlignment.Middle,
     *      horizontalStartPoint: HorizontalAlignment.Left,
     *      verticalStartPoint: VerticalAlignment.Middle,
     *      minSize: { height: 100, width: 100 }
     *  };
     * this.alert.positionSettings = this.newPositionSettings;
     * ```
     */
    public set positionSettings(settings: PositionSettings) {
        this._positionSettings = settings;
        this._overlayDefaultSettings.positionStrategy = new GlobalPositionStrategy(this._positionSettings);
    }

    /**
     * The default `tabindex` attribute for the component
     *
     * @hidden
     */
    @HostBinding('attr.tabindex')
    public tabindex = -1;

    /**
     * An event that is emitted before the dialog is opened.
     * ```html
     * <igx-dialog (opening)="onDialogOpenHandler($event)" (leftButtonSelect)="dialog.close()" rightButtonLabel="OK">
     * </igx-dialog>
     * ```
     */
    @Output()
    public opening = new EventEmitter<IDialogCancellableEventArgs>();

    /**
     * An event that is emitted after the dialog is opened.
     * ```html
     * <igx-dialog (opened)="onDialogOpenedHandler($event)" (leftButtonSelect)="dialog.close()" rightButtonLabel="OK">
     * </igx-dialog>
     * ```
     */
    @Output()
    public opened = new EventEmitter<IDialogEventArgs>();

    /**
     * An event that is emitted before the dialog is closed.
     * ```html
     * <igx-dialog (closing)="onDialogCloseHandler($event)" title="Confirmation" leftButtonLabel="Cancel" rightButtonLabel="OK">
     * </igx-dialog>
     * ```
     */
    @Output()
    public closing = new EventEmitter<IDialogCancellableEventArgs>();

    /**
     * An event that is emitted after the dialog is closed.
     * ```html
     * <igx-dialog (closed)="onDialogClosedHandler($event)" title="Confirmation" leftButtonLabel="Cancel" rightButtonLabel="OK">
     * </igx-dialog>
     * ```
     */
    @Output()
    public closed = new EventEmitter<IDialogEventArgs>();

    /**
     * An event that is emitted when the left button is clicked.
     * ```html
     * <igx-dialog (leftButtonSelect)="onDialogOKSelected($event)" #dialog leftButtonLabel="OK" rightButtonLabel="Cancel">
     * </igx-dialog>
     * ```
     */
    @Output()
    public leftButtonSelect = new EventEmitter<IDialogEventArgs>();

    /**
     * An event that is emitted when the right button is clicked.
     * ```html
     * <igx-dialog (rightButtonSelect)="onDialogOKSelected($event)"
     * #dialog title="Confirmation" (leftButtonSelect)="dialog.close()" rightButtonLabel="OK"
     * rightButtonRipple="#4CAF50" closeOnOutsideSelect="true">
     * </igx-dialog>
     * ```
     */
    @Output()
    public rightButtonSelect = new EventEmitter<IDialogEventArgs>();

    /**
     * @hidden
     */
    @Output() public isOpenChange = new EventEmitter<boolean>();

    /**
     * @hidden
     */
    public get element() {
        return this.elementRef.nativeElement;
    }

    /**
     * Returns the value of state. Possible state values are "open" or "close".
     * ```typescript
     * @ViewChild("MyDialog")
     * public dialog: IgxDialogComponent;
     * ngAfterViewInit() {
     *     let dialogState = this.dialog.state;
     * }
     * ```
     */
    public get state(): string {
        return this.isOpen ? 'open' : 'close';
    }

    /**
     * State of the dialog.
     *
     * ```typescript
     * // get
     * let dialogIsOpen = this.dialog.isOpen;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-dialog [isOpen]='false'></igx-dialog>
     * ```
     *
     * Two-way data binding.
     * ```html
     * <!--set-->
     * <igx-dialog [(isOpen)]='model.isOpen'></igx-dialog>
     * ```
     */
    @Input()
    public get isOpen() {
        return !this.toggleRef.collapsed;
    }
    public set isOpen(value: boolean) {
        if (value !== this.isOpen) {
            this.isOpenChange.emit(value);
            if (value) {
                requestAnimationFrame(() => {
                    this.open();
                });
            } else {
                this.close();
            }
        }
    }

    @HostBinding('class.igx-dialog--hidden')
    public get isCollapsed() {
        return this.toggleRef.collapsed;
    }

    /**
     * Returns the value of the role of the dialog. The valid values are `dialog`, `alertdialog`, `alert`.
     * ```typescript
     * @ViewChild("MyDialog")
     * public dialog: IgxDialogComponent;
     * ngAfterViewInit() {
     *     let dialogRole = this.dialog.role;
     * }
     *  ```
     */
    @Input()
    public get role() {
        if (this.leftButtonLabel !== '' && this.rightButtonLabel !== '') {
            return 'dialog';
        } else if (
            this.leftButtonLabel !== '' ||
            this.rightButtonLabel !== ''
        ) {
            return 'alertdialog';
        } else {
            return 'alert';
        }
    }

    /**
     * Returns the value of the title id.
     * ```typescript
     *  @ViewChild("MyDialog")
     * public dialog: IgxDialogComponent;
     * ngAfterViewInit() {
     *     let dialogTitle = this.dialog.titleId;
     * }
     * ```
     */
    @Input()
    public get titleId() {
        return this._titleId;
    }

    protected destroy$ = new Subject<boolean>();

    private _positionSettings: PositionSettings = {
        openAnimation: useAnimation(slideInBottom, { params: { fromPosition: 'translateY(100%)' } }),
        closeAnimation: useAnimation(slideOutTop, { params: { toPosition: 'translateY(-100%)' } })
    };

    private _overlayDefaultSettings: OverlaySettings;
    private _closeOnOutsideSelect = false;
    private _closeOnEscape = true;
    private _isModal = true;
    private _titleId: string;

    constructor(
        private elementRef: ElementRef,
        @Optional() private navService: IgxNavigationService
    ) {
        this._titleId = IgxDialogComponent.NEXT_ID++ + '_title';

        this._overlayDefaultSettings = {
            positionStrategy: new GlobalPositionStrategy(this._positionSettings),
            scrollStrategy: new NoOpScrollStrategy(),
            modal: this.isModal,
            closeOnEscape: this._closeOnEscape,
            closeOnOutsideClick: this.closeOnOutsideSelect
        };
    }

    public ngAfterContentInit() {
        this.toggleRef.closing.pipe(takeUntil(this.destroy$)).subscribe((eventArgs) => this.emitCloseFromDialog(eventArgs));
        this.toggleRef.closed.pipe(takeUntil(this.destroy$)).subscribe((eventArgs) => this.emitClosedFromDialog(eventArgs));
        this.toggleRef.opened.pipe(takeUntil(this.destroy$)).subscribe((eventArgs) => this.emitOpenedFromDialog(eventArgs));
    }

    /**
     * A method that opens the dialog.
     *
     * @memberOf {@link IgxDialogComponent}
     * ```html
     * <button (click)="dialog.open() igxButton="raised" igxButtonColor="white" igxRipple="white">Trigger Dialog</button>
     * <igx-dialog #dialog></igx-dialog>
     * ```
     */
    public open(overlaySettings: OverlaySettings = this._overlayDefaultSettings) {
        const eventArgs: IDialogCancellableEventArgs = { dialog: this, event: null, cancel: false };
        this.opening.emit(eventArgs);
        if (!eventArgs.cancel) {
            this.toggleRef.open(overlaySettings);
            this.isOpenChange.emit(true);
            if (!this.leftButtonLabel && !this.rightButtonLabel) {
                this.toggleRef.element.focus();
            }
        }

    }

    /**
     * A method that that closes the dialog.
     *
     *  @memberOf {@link IgxDialogComponent}
     * ```html
     * <button (click)="dialog.close() igxButton="raised" igxButtonColor="white" igxRipple="white">Trigger Dialog</button>
     * <igx-dialog #dialog></igx-dialog>
     * ```
     */
    public close() {
        // `closing` will emit from `toggleRef.onClosing` subscription
        this.toggleRef.close();
    }


    /**
     * A method that opens/closes the dialog.
     *
     * @memberOf {@link IgxDialogComponent}
     * ```html
     * <button (click)="dialog.toggle() igxButton="raised" igxButtonColor="white" igxRipple="white">Trigger Dialog</button>
     * <igx-dialog #dialog></igx-dialog>
     * ```
     */
    public toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * @hidden
     */
    public onDialogSelected(event) {
        event.stopPropagation();
        if (
            this.isOpen &&
            this.closeOnOutsideSelect &&
            event.target.classList.contains(IgxDialogComponent.DIALOG_CLASS)
        ) {
            this.close();
        }
    }

    /**
     * @hidden
     */
    public onInternalLeftButtonSelect(event) {
        this.leftButtonSelect.emit({ dialog: this, event });
    }

    /**
     * @hidden
     */
    public onInternalRightButtonSelect(event) {
        this.rightButtonSelect.emit({ dialog: this, event });
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        if (this.navService && this.id) {
            this.navService.add(this.id, this);
        }
    }
    /**
     * @hidden
     */
    public ngOnDestroy() {
        if (this.navService && this.id) {
            this.navService.remove(this.id);
        }
    }

    private emitCloseFromDialog(eventArgs) {
        const dialogEventsArgs = { dialog: this, event: eventArgs.event, cancel: eventArgs.cancel };
        this.closing.emit(dialogEventsArgs);
        eventArgs.cancel = dialogEventsArgs.cancel;
        if (!eventArgs.cancel) {
            this.isOpenChange.emit(false);
        }
    }

    private emitClosedFromDialog(eventArgs) {
        this.closed.emit({ dialog: this, event: eventArgs.event });
    }

    private emitOpenedFromDialog(eventArgs) {
        this.opened.emit({ dialog: this, event: eventArgs.event });
    }
}

export interface IDialogEventArgs extends IBaseEventArgs {
    dialog: IgxDialogComponent;
    event: Event;
}

export interface IDialogCancellableEventArgs extends IDialogEventArgs, CancelableEventArgs { }

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxDialogComponent, IgxDialogTitleDirective, IgxDialogActionsDirective],
    exports: [IgxDialogComponent, IgxDialogTitleDirective, IgxDialogActionsDirective],
    imports: [CommonModule, IgxToggleModule, IgxButtonModule, IgxRippleModule, IgxFocusModule]
})
export class IgxDialogModule { }
