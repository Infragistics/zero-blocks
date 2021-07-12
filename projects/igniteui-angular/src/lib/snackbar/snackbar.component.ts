import { useAnimation } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    OnInit,
    Output
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { slideInBottom, slideOutBottom } from '../animations/main';
import { ContainerPositionStrategy, GlobalPositionStrategy, HorizontalAlignment,
    OverlaySettings, PositionSettings, VerticalAlignment } from '../services/public_api';
import { IgxNotificationsDirective } from '../directives/notification/notifications.directive';
import { ToggleViewEventArgs } from '../directives/toggle/toggle.directive';

let NEXT_ID = 0;
/**
 * **Ignite UI for Angular Snackbar** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/snackbar.html)
 *
 * The Ignite UI Snack Bar provides feedback about an operation with a single-line message, which can
 * include a link to an action such as Undo.
 *
 * Example:
 * ```html
 * <button (click)="snackbar.show()">Send message</button>
 * <div>
 *   <igx-snackbar #snackbar>
 *      Message sent
 *   </igx-snackbar>
 * </div>
 * ```
 */
@Component({
    selector: 'igx-snackbar',
    templateUrl: 'snackbar.component.html'
})
export class IgxSnackbarComponent extends IgxNotificationsDirective
    implements OnInit {
    /**
     * Sets/gets the `id` of the snackbar.
     * If not set, the `id` of the first snackbar component  will be `"igx-snackbar-0"`;
     * ```html
     * <igx-snackbar id = "Snackbar1"></igx-snackbar>
     * ```
     * ```typescript
     * let snackbarId = this.snackbar.id;
     * ```
     *
     * @memberof IgxSnackbarComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-snackbar-${NEXT_ID++}`;

    /**
     * The default css class applied to the component.
     *
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-snackbar')
    public cssClass = 'igx-snackbar';

    /**
     * Sets/gets the `actionText` attribute.
     * ```html
     * <igx-snackbar [actionText] = "'Action Text'"></igx-snackbar>
     * ```
     */
    @Input() public actionText?: string;

    /**
     * An event that will be emitted when the action button is clicked.
     * Provides reference to the `IgxSnackbarComponent` as an argument.
     * ```html
     * <igx-snackbar (clicked)="clickedHandler($event)"></igx-snackbar>
     * ```
     */
    @Output()
    public clicked = new EventEmitter<IgxSnackbarComponent>();

    /**
     * An event that will be emitted when the snackbar animation starts.
     * Provides reference to the `ToggleViewEventArgs` interface as an argument.
     * ```html
     * <igx-snackbar (animationStarted) = "animationStarted($event)"></igx-snackbar>
     * ```
     */
    @Output() public animationStarted = new EventEmitter<ToggleViewEventArgs>();

    /**
     * An event that will be emitted when the snackbar animation ends.
     * Provides reference to the `ToggleViewEventArgs` interface as an argument.
     * ```html
     * <igx-snackbar (animationDone) = "animationDone($event)"></igx-snackbar>
     * ```
     */
    @Output() public animationDone = new EventEmitter<ToggleViewEventArgs>();

    /**
     * Shows the snackbar and hides it after the `displayTime` is over if `autoHide` is set to `true`.
     * ```typescript
     * this.snackbar.open();
     * ```
     */
    public open(message?: string | OverlaySettings) {
        if (message !== undefined) {
            this.textMessage = message;
        }

        const snackbarSettings: PositionSettings = {
            horizontalDirection: HorizontalAlignment.Center,
            verticalDirection: VerticalAlignment.Bottom,
            openAnimation: useAnimation(slideInBottom, {
                params: {
                    duration: '.35s',
                    easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
                    fromPosition: 'translateY(100%)',
                    toPosition: 'translateY(0)'
                }
            }),
            closeAnimation: useAnimation(slideOutBottom, {
                params: {
                    duration: '.2s',
                    easing: 'cubic-bezier(0.4, 0.0, 1, 1)',
                    fromPosition: 'translateY(0)',
                    toOpacity: 1,
                    toPosition: 'translateY(100%)'
                }
            })
        };

        this.strategy = this.outlet ? new ContainerPositionStrategy(snackbarSettings)
            : new GlobalPositionStrategy(snackbarSettings);
        super.open();
    }

    /**
     * @hidden
     */
    public triggerAction(): void {
        this.clicked.emit(this);
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        this.opened.pipe(takeUntil(this.d$)).subscribe(() => {
            const openedEventArgs: ToggleViewEventArgs = { owner: this, id: this._overlayId };
            this.animationStarted.emit(openedEventArgs);
        });

        this.closed.pipe(takeUntil(this.d$)).subscribe(() => {
            const closedEventArgs: ToggleViewEventArgs = { owner: this, id: this._overlayId };
            this.animationDone.emit(closedEventArgs);
        });
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxSnackbarComponent],
    exports: [IgxSnackbarComponent],
    imports: [CommonModule]
})
export class IgxSnackbarModule { }
