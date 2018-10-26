import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Input,
    TemplateRef,
    ViewChild,
    OnDestroy,
    ViewChildren,
    QueryList,
    ElementRef,
    HostBinding,
    HostListener
} from '@angular/core';
import { Subject } from 'rxjs';
import { DataType } from '../../data-operations/data-util';
import { IgxColumnComponent } from '../column.component';
import { IgxDropDownComponent, ISelectionEventArgs } from '../../drop-down/drop-down.component';
import { IFilteringOperation } from '../../data-operations/filtering-condition';
import { FilteringLogic, IFilteringExpression } from '../../data-operations/filtering-expression.interface';
import { HorizontalAlignment, VerticalAlignment } from '../../services/overlay/utilities';
import { ConnectedPositioningStrategy } from '../../services/overlay/position/connected-positioning-strategy';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IChipSelectEventArgs, IBaseChipEventArgs, IgxChipsAreaComponent, IgxChipComponent } from '../../chips';
import { ExpressionUI } from './grid-filtering.service';
import { IgxDropDownItemComponent } from '../../drop-down/drop-down-item.component';
import { IgxGridFilterConditionPipe } from '../grid.pipes';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { IgxFilteringService } from './grid-filtering.service';
import { KEYCODES } from '../../core/utils';

/**
 * @hidden
 */
@Component({
    preserveWhitespaces: false,
    selector: 'igx-grid-filtering-row',
    templateUrl: './grid-filtering-row.component.html'
})
export class IgxGridFilteringRowComponent implements AfterViewInit, OnDestroy {

    @Input()
    get column(): IgxColumnComponent {
        return this._column;
    }

    set column(val) {
        if (val) {
            this._column = val;

            this.expressionsList = this.filteringService.getExpressions(this._column.field);

            if (this.column.dataType === DataType.Boolean) {
                this.expression = {
                    fieldName: this.column.field,
                    condition: null,
                    searchVal: null,
                    ignoreCase: this.column.filteringIgnoreCase
                };
            } else {
                this.resetExpression();
            }

            this.showHideArrowButtons();

            this.offset = 0;
            this.transform(this.offset);
        }
    }

    @Input()
    get value(): any {
        return this.expression ? this.expression.searchVal : null;
    }

    set value(val) {
        if (!val && val !== 0) {
            this.expression.searchVal = null;
        } else {
            this.expression.searchVal = this.transformValue(val);
            if (this.expressionsList.find(item => item.expression === this.expression) === undefined) {
                this.addExpression(true);
            }
        }

        this.filter();
    }

    get locale() {
        return window.navigator.language;
    }

    @ViewChild('defaultFilterUI', { read: TemplateRef })
    protected defaultFilterUI: TemplateRef<any>;

    @ViewChild('defaultDateUI', { read: TemplateRef })
    protected defaultDateUI: TemplateRef<any>;

    @ViewChild('input', { read: ElementRef })
    protected input: ElementRef;

    @ViewChild('inputGroupConditions', { read: IgxDropDownComponent })
    protected dropDownConditions: IgxDropDownComponent;

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent })
    public chipsArea: IgxChipsAreaComponent;

    @ViewChildren('operators', { read: IgxDropDownComponent })
    protected dropDownOperators: QueryList<IgxDropDownComponent>;

    @ViewChild('inputGroupPrefix', { read: ElementRef })
    protected inputGroupPrefix: ElementRef;

    @ViewChild('container')
    protected container: ElementRef;

    @ViewChild('operand')
    protected operand: ElementRef;

    private _positionSettings = {
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Bottom
    };

    private _conditionsOverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        positionStrategy: new ConnectedPositioningStrategy(this._positionSettings)
    };

    private _operatorsOverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        positionStrategy: new ConnectedPositioningStrategy(this._positionSettings)
    };

    private rootExpressionsTree: FilteringExpressionsTree;
    private filterPipe = new IgxGridFilterConditionPipe();
    private titlecasePipe = new TitleCasePipe();
    private datePipe = new DatePipe(this.locale);
    private chipSelTogglesDropdown = false;
    private chipsAreaWidth: number;
    private offset: number = 0;
    private conditionChanged = new Subject();
    private unaryConditionChanged = new Subject();
    private _column = null;
    private conditionsDropDownClosed = new Subject();

    public showArrows: boolean;
    public expression: IFilteringExpression;
    public expressionsList: Array<ExpressionUI>;

    @HostBinding('class.igx-grid__filtering-row')
    public cssClass = 'igx-grid__filtering-row';

    constructor(private filteringService: IgxFilteringService, public element: ElementRef, public cdr: ChangeDetectorRef) {
        this.unaryConditionChanged.subscribe(() => this.unaryConditionChangedCallback());
        this.conditionChanged.subscribe(() => this.conditionChangedCallback());
    }

    ngAfterViewInit() {
        if (this.column.dataType === DataType.Date) {
            this.cdr.detectChanges();
        }

        this.conditionsDropDownClosed = this.dropDownConditions.onClosed.subscribe(() => {
            if (this.chipSelTogglesDropdown) {
                requestAnimationFrame(() => {
                    this.toggleConditionsDropDown();
                });

                this.chipSelTogglesDropdown = false;
            }
        });

        if (this.inputGroupPrefix) {
            this._conditionsOverlaySettings.positionStrategy.settings.target = this.inputGroupPrefix.nativeElement;
            requestAnimationFrame(() => {
                this.toggleConditionsDropDown();
            });
        }
    }

    ngOnDestroy() {
        this.conditionChanged.unsubscribe();
        this.unaryConditionChanged.unsubscribe();
        this.conditionsDropDownClosed.unsubscribe();
    }

    get disabled(): boolean {
        return !(this.column.filteringExpressionsTree && this.column.filteringExpressionsTree.filteringOperands.length > 0);
    }

    get template(): TemplateRef<any> {
        switch (this.column.dataType) {
            case DataType.String:
            case DataType.Number:
            case DataType.Boolean:
                return this.defaultFilterUI;
            case DataType.Date:
                return this.defaultDateUI;
        }
    }

    get type() {
        switch (this.column.dataType) {
            case DataType.String:
            case DataType.Boolean:
                return 'text';
            case DataType.Number:
                return 'number';
        }
    }

    get conditions(): any {
        return this.column.filters.instance().conditionList();
    }

    get isUnaryCondition(): boolean {
        if (this.expression.condition) {
            return this.expression.condition.isUnary;
        } else {
            return false;
        }
    }

    get placeholder(): string {
        if (this.expression.condition && this.expression.condition.isUnary) {
            return this.titlecasePipe.transform(this.filterPipe.transform(this.expression.condition.name));
        } else {
            return 'Add filter value';
        }
    }

    public onPrefixKeyDown(event: KeyboardEvent) {
        if ((event.keyCode === KEYCODES.ENTER || event.keyCode === KEYCODES.SPACE) &&
            this.dropDownConditions.collapsed) {
            this.toggleConditionsDropDown();
            event.stopImmediatePropagation();
        }
    }

    public onInputKeyDown(event: KeyboardEvent) {
        if (event.keyCode === KEYCODES.ENTER) {
            this.chipsArea.chipsList.filter(chip => chip.selected = false);

            let indexToDeselect = -1;
            for (let index = 0; index < this.expressionsList.length; index++) {
                const expression = this.expressionsList[index].expression;
                if (expression.searchVal === null && !expression.condition.isUnary) {
                    indexToDeselect = index;
                }
            }

            if (indexToDeselect !== -1) {
                this.removeExpression(indexToDeselect, this.expression);
            }

            this.resetExpression();
            this.toggleConditionsDropDown();
        }
    }

    /**
     * @hidden
     */
    public datePickerClose() {
        this.input.nativeElement.focus();
    }

    /**
     * @hidden
     */
    @HostListener('keydown', ['$event'])
    public onKeydown(event) {
        if (event.keyCode === KEYCODES.TAB) {
            event.stopPropagation();
        }
    }

    private showHideArrowButtons() {
        requestAnimationFrame(() => {
            const containerWidth = this.container.nativeElement.getBoundingClientRect().width;
            this.chipsAreaWidth = parseInt(this.chipsArea.element.nativeElement.getBoundingClientRect().width, 10);

            this.showArrows = this.chipsAreaWidth >= containerWidth;
            this.cdr.detectChanges();

            this.chipsAreaWidth = parseInt(this.chipsArea.element.nativeElement.getBoundingClientRect().width, 10);
            if (this.chipsAreaWidth <= containerWidth) {
                this.offset = 0;
                this.transform(this.offset);
            }
        });
    }

    private transformValue(value): any {
        if (this.column.dataType === DataType.Number) {
            value = parseFloat(value);
        } else if (this.column.dataType === DataType.Boolean) {
            value = Boolean(value);
        }

        return value;
    }

    private addExpression(isSelected: boolean): void {
        const exprUI = new ExpressionUI();
        exprUI.expression = this.expression;
        exprUI.beforeOperator = this.expressionsList.length > 0 ? FilteringLogic.And : null;
        exprUI.isSelected = isSelected;

        this.expressionsList.push(exprUI);

        const length = this.expressionsList.length;
        if (this.expressionsList[length - 2]) {
            this.expressionsList[length - 2].afterOperator = this.expressionsList[length - 1].beforeOperator;
        }

        this.showHideArrowButtons();
    }

    private removeExpression(indexToRemove: number, expression: IFilteringExpression) {
        if (indexToRemove === 0 && this.expressionsList.length === 1) {
            this.clearFiltering();
            return;
        }

        this.filteringService.removeExpression(this.column.field, indexToRemove);

        this.filter();

        if (this.expression === expression) {
            this.resetExpression();
        }

        this.showHideArrowButtons();
    }

    private resetExpression(): void {
        this.expression = {
            fieldName: this.column.field,
            condition: null,
            searchVal: null,
            ignoreCase: this.column.filteringIgnoreCase
        };

        if (this.column.dataType !== DataType.Boolean) {
            this.expression.condition = this.getCondition(this.conditions[0]);
        }

        if (this.column.dataType === DataType.Date && this.input) {
            this.input.nativeElement.value = null;
        }

        this.showHideArrowButtons();
    }

    public conditionChangedCallback(): void {
        if (!!this.expression.searchVal || this.expression.searchVal === 0) {
            this.filter();
        } else if (this.value) {
            this.value = null;
        }
    }

    public unaryConditionChangedCallback(): void {
        if (this.value) {
            this.value = null;
        }
        if (this.expressionsList.find(item => item.expression === this.expression) === undefined) {
            this.addExpression(true);
        }
        this.filter();
    }

    public getCondition(value: string): IFilteringOperation {
        return this.column.filters.instance().condition(value);
    }

    public isConditionSelected(conditionName: string): boolean {
        if (this.expression.condition) {
            return this.expression.condition.name === conditionName;
        } else {
            return false;
        }
    }

    public getOperator(operator: FilteringLogic): string {
        return FilteringLogic[operator];
    }

    public getChipLabel(expression: IFilteringExpression): any {
        if (expression.condition.isUnary) {
            return this.titlecasePipe.transform(this.filterPipe.transform(expression.condition.name));
        } else if (expression.searchVal instanceof Date) {
            return this.datePipe.transform(expression.searchVal);
        } else {
            return expression.searchVal;
        }
    }

    public clearFiltering(): void {
        this.filteringService.clearFilter(this.column.field);
        this.resetExpression();
        this.cdr.detectChanges();

        this.offset = 0;
        this.transform(this.offset);
    }

    public clearInput(): void {
        this.value = null;
    }

    public onClearKeyDown(eventArgs: KeyboardEvent) {
        if (eventArgs.keyCode === KEYCODES.ENTER) {
            eventArgs.preventDefault();
            this.clearInput();
        }
    }

    public close(): void {
        this.filteringService.isFilterRowVisible = false;
        this.filteringService.filteredColumn = null;
        this.filteringService.selectedExpression = null;
        this.cdr.detectChanges();

        this.offset = 0;
        this.transform(this.offset);
    }

    public toggleConditionsDropDown(): void {
        this.inputGroupPrefix.nativeElement.focus();
        this.dropDownConditions.toggle(this._conditionsOverlaySettings);
    }

    public toggleOperatorsDropDown(eventArgs, index): void {
        this._operatorsOverlaySettings.positionStrategy.settings.target = eventArgs.target;
        this.dropDownOperators.toArray()[index].toggle(this._operatorsOverlaySettings);
    }

    public filter(): void {
        this.rootExpressionsTree = this.filteringService.createSimpleFilteringTree(this.column.field);

        this.filteringService.filter(this.column.field, this.rootExpressionsTree);
    }

    public onConditionsChanged(eventArgs): void {
        const value = (eventArgs.newSelection as IgxDropDownItemComponent).value;
        this.expression.condition = this.getCondition(value);
        if (this.expression.condition.isUnary) {
            this.unaryConditionChanged.next(value);
        } else {
            this.conditionChanged.next(value);
        }

        if (this.input) {
            this.input.nativeElement.focus();
        }
    }

    public onChipSelected(eventArgs: IChipSelectEventArgs, expression: IFilteringExpression): void {
        if (eventArgs.selected) {
            if (this.chipsArea.chipsList) {
                this.chipsArea.chipsList.forEach((chip) => {
                    if(chip !== eventArgs.owner) {
                        chip.selected = false;
                    }
                });
            }
            this.expression = expression;
            if (eventArgs.originalEvent) {
                if (this.dropDownConditions.collapsed) {
                    requestAnimationFrame(() => {
                        this.toggleConditionsDropDown();
                    });
                } else {
                    this.chipSelTogglesDropdown = true;
                }
            }
        } else if (this.expression === expression) {
            this.resetExpression();
        }
    }

    public onChipKeyDown(eventArgs: KeyboardEvent, chip: IgxChipComponent) {
        if (eventArgs.keyCode === KEYCODES.ENTER) {
            eventArgs.preventDefault();
            chip.selected = !chip.selected;
            if (chip.selected) {
                this.toggleConditionsDropDown();
            }
        }
    }

    public onChipRemoved(eventArgs: IBaseChipEventArgs, item: ExpressionUI): void {
        const indexToRemove = this.expressionsList.indexOf(item);
        this.removeExpression(indexToRemove, item.expression);

        this.scrollChipsOnRemove();
    }

    public onLogicOperatorChanged(eventArgs: ISelectionEventArgs, expression: ExpressionUI): void {
        expression.afterOperator = (eventArgs.newSelection as IgxDropDownItemComponent).value;
        this.expressionsList[this.expressionsList.indexOf(expression) + 1].beforeOperator = expression.afterOperator;
        this.filter();
    }

    public scrollChips(event) {
        let lastVisibleElement, lastVisibleElementRect, elementsFromPoint;

        const containerRect = this.container.nativeElement.getBoundingClientRect();
        const chipsAreaRect = this.chipsArea.element.nativeElement.getBoundingClientRect();

        if (event === 'right') {
            elementsFromPoint = this.getElementsAtPoint(containerRect.right - 1, containerRect.top + containerRect.height / 2);
            for (let i = 0; i < elementsFromPoint.length; i++) {
                if (elementsFromPoint[i].id === 'chip' || elementsFromPoint[i].id === 'operand') {
                    lastVisibleElement = elementsFromPoint[i];
                    lastVisibleElementRect = lastVisibleElement.getBoundingClientRect();
                    break;
                }
            }

            if (lastVisibleElement) {
                this.offset += -(lastVisibleElementRect.width - (containerRect.right - lastVisibleElementRect.left) + 5);
            } else if (chipsAreaRect.right > containerRect.right){
                elementsFromPoint = this.getElementsAtPoint(containerRect.right - 5, containerRect.top + containerRect.height / 2);
                for (let i = 0; i < elementsFromPoint.length; i++) {
                    if (elementsFromPoint[i].id === 'chip' || elementsFromPoint[i].id === 'operand') {
                        const childen = this.chipsArea.element.nativeElement.children;
                        for (let index = 0; index < childen.length; index++) {
                            if (childen[index].isSameNode(elementsFromPoint[i]) && index !== childen.length - 1) {
                                lastVisibleElement = childen[index + 1];
                                lastVisibleElementRect = lastVisibleElement.getBoundingClientRect();
                                break;
                            }
                        }
                        break;
                    }
                }
                this.offset += -(lastVisibleElementRect.width + 5);
            }
        }

        if (event === 'left') {
            elementsFromPoint = this.getElementsAtPoint(containerRect.left + 1, containerRect.top + containerRect.height / 2);
            for (let i = 0; i < elementsFromPoint.length; i++) {
                if (elementsFromPoint[i].id === 'chip' || elementsFromPoint[i].id === 'operand') {
                    lastVisibleElement = elementsFromPoint[i];
                    lastVisibleElementRect = lastVisibleElement.getBoundingClientRect();
                    break;
                }
            }

            if (lastVisibleElement) {
                this.offset += containerRect.left - lastVisibleElementRect.left + 5;
            } else if (chipsAreaRect.left < containerRect.left) {
                elementsFromPoint = this.getElementsAtPoint(containerRect.left + 5, containerRect.top + containerRect.height / 2);
                for (let i = 0; i < elementsFromPoint.length; i++) {
                    if (elementsFromPoint[i].id === 'chip' || elementsFromPoint[i].id === 'operand') {
                        const childen = this.chipsArea.element.nativeElement.children;
                        for (let index = 0; index < childen.length; index++) {
                            if (childen[index].isSameNode(elementsFromPoint[i]) && index !== 0) {
                                lastVisibleElement = childen[index - 1];
                                lastVisibleElementRect = lastVisibleElement.getBoundingClientRect();
                                break;
                            }
                        }
                        break;
                    }
                }
                this.offset += lastVisibleElementRect.width + 5;
            }
        }

        this.transform(this.offset);
    }

    private transform(offset: number) {
        requestAnimationFrame(() => {
            this.chipsArea.element.nativeElement.style.transform = `translate(${offset}px)`;
        });
    }

    private scrollChipsOnRemove() {
        const containerRect = this.container.nativeElement.getBoundingClientRect();

        let lastVisibleElement, lastVisibleElementRect, elementsFromPoint;
        elementsFromPoint = this.getElementsAtPoint(containerRect.left + 1, containerRect.top + containerRect.height / 2);
        for (let i = 0; i < elementsFromPoint.length; i++) {
            if (elementsFromPoint[i].id === 'chip') {
                lastVisibleElement = elementsFromPoint[i];
                lastVisibleElementRect = lastVisibleElement.getBoundingClientRect();
                break;
            }

            if (elementsFromPoint[i].id === 'operand') {
                const childen = this.chipsArea.element.nativeElement.children;
                for (let index = 0; index < childen.length; index++) {
                    if (childen[index].isSameNode(elementsFromPoint[i]) && index !== 0) {
                        lastVisibleElement = childen[index - 1];
                        lastVisibleElementRect = lastVisibleElement.getBoundingClientRect();
                        break;
                    }
                }
                break;
            }
        }

        if (!lastVisibleElement) {
            elementsFromPoint = this.getElementsAtPoint(containerRect.left + 5, containerRect.top + containerRect.height / 2);
            for (let i = 0; i < elementsFromPoint.length; i++) {
                if (elementsFromPoint[i].id === 'operand' || elementsFromPoint[i].id === 'chip') {
                    const childen = this.chipsArea.element.nativeElement.children;
                    for (let index = 0; index < childen.length; index++) {
                        if (childen[index].isSameNode(elementsFromPoint[i]) && index !== 0) {
                            lastVisibleElement = childen[index - 1];
                            lastVisibleElementRect = lastVisibleElement.getBoundingClientRect();
                            break;
                        }
                    }
                    break;
                }
            }
        }

        this.offset += containerRect.left - lastVisibleElementRect.left + 5;
        this.transform(this.offset);
    }

    private getElementsAtPoint(pageX: number, pageY: number) {
        const viewPortX = pageX - window.pageXOffset;
        const viewPortY = pageY - window.pageYOffset;
        if (document['msElementsFromPoint']) {
            return document['msElementsFromPoint'](viewPortX, viewPortY); // Edge and IE
        } else {
            return document.elementsFromPoint(viewPortX, viewPortY);
        }
    }
}
