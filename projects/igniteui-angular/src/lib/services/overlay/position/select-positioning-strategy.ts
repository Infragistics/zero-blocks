// tslint:disable:max-line-length
import { VerticalAlignment, HorizontalAlignment, PositionSettings, Size, getPointFromPositionsSettings } from './../utilities';
import { ConnectedPositioningStrategy } from './connected-positioning-strategy';
import { IPositionStrategy } from '.';
import { scaleInVerTop, scaleOutVerTop } from '../../../animations/main';
import { IgxSelectComponent } from '../../../select/select.component';
import { ISelectComponent } from '../../../select/ISelectComponent';

enum ENUM_DIRECTION {
    TOP = -1,
    BOTTOM = 1,
    NONE = 0
}
export class SelectPositioningStrategy extends ConnectedPositioningStrategy implements IPositionStrategy {

    private _selectDefaultSettings = {
        target: null,
        topOffset: 0,
        horizontalDirection: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Bottom,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Top,
        openAnimation: scaleInVerTop,
        closeAnimation: scaleOutVerTop,
        minSize: { width: 0, height: 0 }
    };
    public settings: PositionSettings;

    constructor(public select: IgxSelectComponent, settings?: PositionSettings) {
        super();
        this.settings = Object.assign({}, this._selectDefaultSettings, settings);

    }

    private defaultWindowToListOffset = 5; // Seems should be in settings
    private viewPort = this.getViewPort(document);

    private doBottomMagic67(start, ) {

    }

    private GET_ITEMS_OUT_OF_VIEW(contentElement: HTMLElement, itemHeight: number): {
        '-1': number,
        '1': number
    } {
        if (contentElement.firstElementChild.scrollHeight <= contentElement.firstElementChild.clientHeight) {
            return {
                '-1': 0,
                '1': 0
            };
        }
        const currentScroll = contentElement.firstElementChild.scrollTop;
        const remainingScroll = this.select.items.length * itemHeight
            - currentScroll - contentElement.getBoundingClientRect().height;
        return {
            '-1': currentScroll,
            '1': remainingScroll
        };
    }
    private getViewPort(document) { // Material Design implementation
        const clientRect = document.documentElement.getBoundingClientRect();
        const scrollPosition = {
            top: -clientRect.top,
            left: -clientRect.left
        };
        const width = window.innerWidth;
        const height = window.innerHeight;

        return {
            top: scrollPosition.top,
            left: scrollPosition.left,
            bottom: scrollPosition.top + height,
            right: scrollPosition.left + width,
            height,
            width
        };

    }

    private LIST_OUT_OF_BOUNDS(elementContainer: { top: number, bottom: number }, document: Document): {
        DIRECTION: ENUM_DIRECTION,
        AMOUNT: number
    } {
        const container = {
            TOP: elementContainer.top,
            BOTTOM: elementContainer.bottom,
        };
        const viewPort = this.getViewPort(document);
        const documentElement = {
            TOP: viewPort.top,
            BOTTOM: viewPort.bottom
        };
        const returnVals = {
            DIRECTION: ENUM_DIRECTION.NONE,
            AMOUNT: 0
        };
        if (documentElement.TOP > container.TOP) {
            returnVals.DIRECTION = ENUM_DIRECTION.TOP;
            returnVals.AMOUNT = documentElement.TOP - container.TOP - this.defaultWindowToListOffset;
        } else if (documentElement.BOTTOM < container.BOTTOM) {
            returnVals.DIRECTION = ENUM_DIRECTION.BOTTOM;
            returnVals.AMOUNT = container.BOTTOM - documentElement.BOTTOM;
        } else {
            // there is enough space to fit the drop-down container on the window
            return null;
        }
        return returnVals;
    }

    private adjustItemTextPadding(): number {
        return 8; // current styling item text padding
    }

    // TODO: refactor duplicated code + set translateX when exiting the method.
    position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean, minSize?: Size): void {
        // avoid flickering when scrolling
        if (!initialCall) {
            return;
        }

        const inputRect = this.select.input.nativeElement.getBoundingClientRect();
        const inputGroupRect = this.select.inputGroup.element.nativeElement.getBoundingClientRect();
        const START = {
            X: inputGroupRect.x,
            Y: inputRect.y
        };

        const LIST_HEIGHT = contentElement.getBoundingClientRect().height;
        const inputBoundRect = this.select.input.nativeElement.getBoundingClientRect();
        const listBoundRect = contentElement.getBoundingClientRect() as DOMRect;
        const selectedItemBoundRect = this.select.selectedItem.element.nativeElement.getBoundingClientRect();
        // assume selected item is always visible
        const selectedItemTopListOffset = selectedItemBoundRect.y - listBoundRect.y;
        const selectedItemBottomListOffset = selectedItemBoundRect.y - listBoundRect.y + selectedItemBoundRect.height;


        const ITEM_HEIGHT = this.select.selectedItem.element.nativeElement.getBoundingClientRect().height;
        const INPUT_HEIGHT = this.select.input.nativeElement.getBoundingClientRect().height;

        let CURRENT_POSITION_Y = START.Y - selectedItemTopListOffset;
        const CURRENT_BOTTOM_Y = CURRENT_POSITION_Y + contentElement.getBoundingClientRect().height;

        const OUT_OF_BOUNDS: {
            DIRECTION: ENUM_DIRECTION,
            AMOUNT: number
        } = this.LIST_OUT_OF_BOUNDS({ top: CURRENT_POSITION_Y, bottom: CURRENT_BOTTOM_Y }, document);
        if (OUT_OF_BOUNDS) {
            console.log('OUT_OF_BOUNDS');
            if (OUT_OF_BOUNDS.DIRECTION === ENUM_DIRECTION.TOP) {
                CURRENT_POSITION_Y = START.Y;


            } else {
                /* if OUT_OF_BOUNDS on BOTTOM, move the container DOWN by one item height minus half the input and
                item height difference (48px-32px)/2, thus position the container down so the last item LBP match input LBP.
                --> <mat-select> like */
                CURRENT_POSITION_Y = -1 * (LIST_HEIGHT - (ITEM_HEIGHT - (ITEM_HEIGHT - INPUT_HEIGHT) / 2));
                CURRENT_POSITION_Y += START.Y;
            }
        }
        let transformString = '';
        transformString += `translateX(${START.X + this.settings.horizontalDirection * size.width}px)`;

        // Handle scenarios where there the list container has no scroll &&
        // when there is scroll and the list container is always in the visible port.
        if (this.GET_ITEMS_OUT_OF_VIEW(contentElement, ITEM_HEIGHT)[1] === 0 &&
            this.GET_ITEMS_OUT_OF_VIEW(contentElement, ITEM_HEIGHT)[-1] === 0) {
            transformString += `translateY(${CURRENT_POSITION_Y + this.settings.verticalDirection * size.height -
                this.adjustItemTextPadding()}px)`;
            contentElement.style.transform = transformString.trim();
        }

        // Handle scenarios where there the list container has scroll
        if (this.GET_ITEMS_OUT_OF_VIEW(contentElement, ITEM_HEIGHT)[1] !== 0 ||
            this.GET_ITEMS_OUT_OF_VIEW(contentElement, ITEM_HEIGHT)[-1] !== 0) {
            console.log('container has scroll');
            // If the first couple of items are selected and there is space, do not scroll
            if (this.GET_ITEMS_OUT_OF_VIEW(contentElement, ITEM_HEIGHT)[1] !== 0 && !OUT_OF_BOUNDS) {
                transformString += `translateY(${CURRENT_POSITION_Y + this.settings.verticalDirection * size.height -
                    this.adjustItemTextPadding()}px)`;
                contentElement.style.transform = transformString.trim();
            }
            // If Out of boundaries and there is available scrolling down -  do scroll
            if (this.GET_ITEMS_OUT_OF_VIEW(contentElement, ITEM_HEIGHT)[1] !== 0 && OUT_OF_BOUNDS) {
                // the following works if there is enough scrolling available
                // handle options opt2, opt3, opt4, opt5
                if (this.GET_ITEMS_OUT_OF_VIEW(contentElement, ITEM_HEIGHT)[1] > ITEM_HEIGHT) {
                    if (OUT_OF_BOUNDS.DIRECTION === -1) {
                        transformString += `translateY(${START.Y - ITEM_HEIGHT + this.settings.verticalDirection * size.height -
                            this.adjustItemTextPadding()}px)`;
                        contentElement.style.transform = transformString.trim();
                        contentElement.firstElementChild.scrollTop += selectedItemBoundRect.y - ITEM_HEIGHT;
                        console.log('handle options opt2, opt3, opt4, opt5........OUT_OF_BOUNDS.DIRECTION === -1');
                        return;
                    }
                    if (OUT_OF_BOUNDS.DIRECTION === 1) {
                        // it is one of the edge items so there is no more scrolling in that same direction
                        if (contentElement.firstElementChild.scrollTop === 0) {
                            transformString += `translateY(${START.Y + INPUT_HEIGHT - listBoundRect.height +
                                this.settings.verticalDirection * size.height}px)`;
                            contentElement.style.transform = transformString.trim();
                        } else {
                            transformString += `translateY(${this.viewPort.bottom - listBoundRect.height - this.defaultWindowToListOffset}px)`;
                            contentElement.style.transform = transformString.trim();
                            contentElement.firstElementChild.scrollTop -= OUT_OF_BOUNDS.AMOUNT - (this.adjustItemTextPadding() - this.defaultWindowToListOffset);
                            // TODO Refactor code reuse --> this.doBottomMagic67(START.X,...  );
                            console.log('handle options opt2, opt3, opt4, opt5........OUT_OF_BOUNDS.DIRECTION === 1');
                        }
                    }
                }
                // If one of the last items is selected and there is no more scroll remaining to scroll the selected item
                // handle options  opt6
                // TODO consider scrolling the remaining scroll to the end if we want to deviate from mat-select.
                if (this.GET_ITEMS_OUT_OF_VIEW(contentElement, ITEM_HEIGHT)[1] < ITEM_HEIGHT) {
                    console.log('handle option opt6');
                    if (OUT_OF_BOUNDS.DIRECTION === -1) {
                        transformString += `translateY(${START.Y + this.settings.verticalDirection * size.height - this.adjustItemTextPadding()}px)`;
                        contentElement.style.transform = transformString.trim();
                    }
                    if (OUT_OF_BOUNDS.DIRECTION === 1) {
                        // handle lst options opt6
                        // position the container with default window offset
                        transformString += `translateY(${this.viewPort.bottom - listBoundRect.height - this.defaultWindowToListOffset}px)`;
                        contentElement.style.transform = transformString.trim();
                        contentElement.firstElementChild.scrollTop -= OUT_OF_BOUNDS.AMOUNT - (this.adjustItemTextPadding() - this.defaultWindowToListOffset);
                        // TODO Refactor code reuse --> this.doBottomMagic67(START.X,...  );
                    }
                }
            }
            if (this.GET_ITEMS_OUT_OF_VIEW(contentElement, ITEM_HEIGHT)[1] === 0 &&
                this.GET_ITEMS_OUT_OF_VIEW(contentElement, ITEM_HEIGHT)[-1] !== 0
            ) {
                // handle lst options opt7, opt8, opt9
                console.log('handle options  opt7, opt8, opt9');
                // tslint:disable-next-line:max-line-length
                if (OUT_OF_BOUNDS) {
                    if (OUT_OF_BOUNDS.DIRECTION === -1) {
                        transformString += `translateY(${START.Y + this.settings.verticalDirection * size.height - this.adjustItemTextPadding()}px)`;
                        contentElement.style.transform = transformString.trim();
                        console.log('OUT_OF_BOUNDS.DIRECTION === -1');
                    }
                    if (OUT_OF_BOUNDS.DIRECTION === 1) {
                        // handle lst options opt7
                        // position the container with default window offset
                        transformString += `translateY(${this.viewPort.bottom - listBoundRect.height - this.defaultWindowToListOffset}px)`;
                        contentElement.style.transform = transformString.trim();
                        contentElement.firstElementChild.scrollTop -= OUT_OF_BOUNDS.AMOUNT - (this.adjustItemTextPadding() - this.defaultWindowToListOffset);
                        // TODO Refactor code reuse --> this.doBottomMagic67(START.X,...  );
                        console.log('OUT_OF_BOUNDS.DIRECTION === 1');
                    }
                }
                // handle lst options opt8, opt9 --> these are OK.
                if (!OUT_OF_BOUNDS) {
                    transformString += `translateY(${CURRENT_POSITION_Y + this.settings.verticalDirection * size.height -
                        this.adjustItemTextPadding()}px)`;
                    contentElement.style.transform = transformString.trim();
                    console.log('!OUT_OF_BOUNDS');
                }
            }
        }
    }
}
