# Ignite UI for Angular Change Log

All notable changes for each version of this project will be documented in this file.

## 12.1.0

### New Features
- Added `IgxAccordion` component
    - A collection of vertically collapsible igx-expansion-panels that provide users with data and the ability to navigate through it in a compact manner. The control is **not** data bound and takes a declarative approach, giving users more control over what is being rendered.
    - Exposed API to control the expansion state, easy-to-use keyboard navigation, option for nested accordions.
    - Code example below:

    ```html
    <igx-accordion>
        <igx-expansion-panel *ngFor="let panel of panels">
           ...
        </igx-expansion-panel>
    </igx-accordion>
    ```

    - For more information, check out the [README](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/accordion/README.md), [specification](https://github.com/IgniteUI/igniteui-angular/wiki/Accordion-Specification) and [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/accordion)

- `igxGrid`
    - New `additionalTemplateContext` column input:

    ```html
    <igx-column [additionalTemplateContext]="contextObject">
      <ng-template igxCell let-cell="cell" let-props="additionalTemplateContext">
         {{ props }}
      </ng-template>
    </igx-column>
    ```
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - Added `batchEditing` `Input` for controlling whether the grid should have transactions or not.
    - **Breaking Change** - Providing a transaction service for the grid via `providers: [IgxTransactionService]` is no longer valid
    Instead, use the new `batchEditing` property to control the grid's Transactions

- `Transactions`
    
- `Toolbar Actions`
    - Exposed a new input property `overlaySettings` for all column actions (`hiding` | `pinning` | `advanced filtering` | `exporter`). Example below:

    ```html
    <igx-grid-toolbar-actions>
        <igx-grid-toolbar-pinning [overlaySettings]="overlaySettingsGlobal"></igx-grid-toolbar-pinning>
        <igx-grid-toolbar-hiding [overlaySettings]="overlaySettingsAuto"></igx-grid-toolbar-hiding>
    </igx-grid-toolbar-actions>
    ```
- `IgxPaginatorComponent`
    - Added `paging` and `pagingDone` events; `paging` event is cancellable and is emitted before pagination is performed, `pagingDone` event gives you information about the previous and the current page number and is not cancellable; Also `IgxPageSizeSelectorComponent` and `IgxPageNavigationComponent` are introduced and now the paginator components allows you to define a custom content, as it is shown in the example below:
    ```html
    <igx-paginator #paginator>
        <igx-paginator-content>
            <igx-page-size></igx-page-size>
            <button [disabled]="paginator.isFirstPage" (click)="paginator.previousPage()">PREV</button>
            <span>Page {{paginator.page}} of {{paginator.totalPages}}</span>
            <button [disabled]="paginator.isLastPage" (click)="paginator.nextPage()">NEXT</button>
        </igx-paginator-content>
    </igx-paginator>
    ```
- `Exporters`'s `columnExporting` event now supports changing the index of the column in the exported file.
    ```typescript
        this.excelExporterService.columnExporting.subscribe((col) => {
            if (col.field === 'Index') {
                col.columnIndex = 0;
            }
        });
    ```
- `IgxExcelExporterService`
    - Added support for exporting the grids' multi-column headers to **Excel**. By default, the multi-column headers would be exported but this behavior can be controlled by the `ignoreMultiColumnHeaders` option off the IgxExcelExporterOptions object.
    

- `IgxDateTimeEditor`, `IgxMask`, `IgxDatePicker`, `IgxTimePicker`, `IgxDateRangePicker`
    - Added IME input support. When typing in an Asian language input, the control will display input method compositions and candidate lists directly in the control’s editing area, and immediately re-flow surrounding text as the composition ends.

### General
- `IgxPaginatorComponent`
    - Deprecated properties `selectLabel` and `prepositionPage` are now removed;
    -  **Breaking Change** - the following properties are removed
        - `pagerEnabled`
        - `pagerHidden `
        - `dropdownEnabled`
        - `dropdownHidden`
- `IgxSnackbarComponent`
    - Deprecated property `message` is now removed;
    - **Breaking Change** - the `snackbarAnimationStarted` and `snackbarAnimationDone` methods are now removed. The `animationStarted` and `animationDone` events now provide reference to the `ToggleViewEventArgs` interface as an argument and are emitted by the `onOpened` and `onClosed` events of the `IgxToggleDirective`. 
- `IgxToastComponent`
    - Deprecated property `message` is now removed;
    - **Breaking Change** - The `isVisibleChange` event now provides reference to the `ToggleViewEventArgs` interface as an argument.

- **Breaking Change** - `IgxOverlayService` events are renamed as follows:
    - `onOpening` -> `opening`
    - `onOpened` -> `opened`
    - `onClosing` -> `closing`
    - `onClosed` -> `closed`
    - `onAppended` -> `contentAppended`
    - `onAnimation` -> `animationStarting`

- **Breaking Change** - `IgxBannerComponent` events are renamed as follows:
    - `onOpening` -> `opening`
    - `onOpened` -> `opened`
    - `onClosing` -> `closing`
    - `onClosed` -> `closed`

- `IgxExpansionPanelComponent`
    - **Breaking Change** - `IgxExpansionPanelComponent` events are renamed as follows:
        - `onCollapsed` -> `contentCollapsed`
        - `onExpanded` -> `contentExpanded`

    - **Breaking Change** - `IgxExpansionPanelHeaderComponent` events are renamed as follows:
        - `onInteraction` -> `interaction`

    - **Behavioral Change** - Settings `disabled` property of `IgxExpansionPanelHeaderComponent` now makes the underlying header element not accessible via `Tab` navigation (via `tabindex="-1"`)

    - **Feature** - Added `contentExpanding` and `contentCollapsing` events, fired when the panel's content starts expanding or collapsing, resp.
    Both events can be canceled, preventing the toggle animation from firing and the `collapsed` property from changing:
    ```html
        <igx-expansion-panel (contentExpanding)="handleExpandStart($event)" (contentCollapsing)="handleCollapseStart($event)">
            ...
        </igx-expansion-panel>
    ```

-   `IgxDropDown`
    - **Breaking Change** - The dropdown items no longer takes focus unless `allowItemsFocus` is set to `true`.

### Themes
- **Breaking Change**  - The `$color` property of the `igx-action-strip-theme` has been renamed as follows:
    - `$color` -> `$icon-color`

## 12.0.3

### General
- `IgxExpansionPanelHeaderComponent`
    - **Behavioral Change** - Settings `disabled` property of `IgxExpansionPanelHeaderComponent` now makes the underlying header element not accessible via `Tab` navigation (via `tabindex="-1"`)

## 12.0.0

### General
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - **Breaking Change** - The `locale` and `pipeArgs` parameters are removed from the `operate` method exposed by the `IgxNumberSummaryOperand`, `IgxDateSummaryOperand`, `IgxCurrencySummaryOperand` and `IgxPercentSummaryOperand`. They are now set in the `igx-grid-summary-cell` template. To change the locale and format setting of the `igx-grid-summary-cell` the user can use the new `summaryFormatter` property of the `IgxColumnComponent`.
    - **Breaking Change** - `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid` events are renamed as follows:
        - `onCellClick` -> `cellClick`
        - `onScroll` -> `gridScroll`
        - `onSelection` -> `selected`
        - `onRowSelectionChange` -> `rowSelected`
        - `onColumnSelectionChange` -> `columnSelected`
        - `onColumnPinning` -> `columnPin`
        - `onColumnInit` -> `columnInit`
        - `onSortingDone` -> `sortingDone`
        - `onFilteringDone` -> `filteringDone`
        - `onPagingDone` -> `pagingDone`
        - `onRowAdded` -> `rowAdded`
        - `onRowDeleted` -> `rowDeleted`
        - `onColumnResized` -> `columnResized`
        - `onContextMenu` -> `contextMenu`
        - `onDoubleClick` -> `doubleClick`
        - `onColumnVisibilityChanged` -> `columnVisibilityChanged`
        - `onColumnMovingStart` -> `columnMovingStart`
        - `onColumnMoving` -> `columnMoving`
        - `onColumnMovingEnd` -> `columnMovingEnd`
        - `onGridKeydown` -> `gridKeydown`
        - `onRowDragStart` -> `rowDragStart`
        - `onRowDragEnd` -> `rowDragEnd`
        - `onGridCopy` -> `gridCopy`
        - `onRowToggle` -> `rowToggle`
        - `onRowPinning` -> `rowPinning`
        - `onToolbarExporting` -> `toolbarExporting`
        - `onRangeSelection` -> `rangeSelected`
    - `IgxGridRowComponent`, `IgxGridGroupByRowComponent`, `IgxTreeGridRowComponent`, `IgxHierarchicalRowComponent` are no longer exposed in the public API. Automatic migration will change these imports with `RowType`.
    - The IgxColumn data type `DataType` is renamed to `GridColumnDataType`.
    - **Behavioral changes**
    - `getRowByIndex`, `getRowByKey`, `cell.row` now return an object implemening the `RowType` interface.
    - `dragData` emitted with `IRowDragEndEventArgs`, `IRowDragStartEventArgs` is now `RowType`
    - `IRowDragEndEventArgs`, `IRowDragStartEventArgs` now emit `dragElement`, which holds the dragged row html element.
    - `row` in `IPinRowEventArgs` is now `RowType`
- `IgxTabs`, `IgxBottomNav`
    - **Breaking Change** - `IgxTabs` and `IgxBottomNav` components were completely refactored in order to provide more flexible and descriptive way to define tab headers and contents. Please make sure to update via `ng update` in order to migrate the existing `igx-tabs` and `igx-bottom-nav` definitions to the new ones.
- `IgxForOfDirective`
    - **Breaking Change** - `IgxForOfDirective` events are renamed as follows:
        - `onChunkLoad` -> `chunkLoad`
        - `onScrollbarVisibilityChanged` -> `scrollbarVisibilityChanged`
        - `onContentSizeChange` -> `contentSizeChange`
        - `onDataChanged` -> `dataChanged`
        - `onBeforeViewDestroyed` -> `beforeViewDestroyed`
        - `onChunkPreload` -> `chunkPreload`
        - `onDataChanging` -> `dataChanging`
- `IgxColumnComponent`
    - **Breaking Change** - The `onColumnChange` output is renamed to `columnChange`.
- **Breaking Change** - `IgxHierarchicalGrid` and `igxRowIsland` events are renamed as follows:
    - `onGridCreated` -> `gridCreated`
    - `onGridInitialized` -> `gridInitialized`
    - `onDataPreLoad` -> `dataPreLoad`
- `IgxInputGroupComponent`
    - **Breaking Change** - `disabled` property removed. Use the underlying `IgxInputDirective.disabled` to control the disabled state of the input group. Please make sure to update via `ng update` to migrate an usage of `disabled` in your template files. Please make sure to check out the [update guide](https://www.infragistics.com/products/ignite-ui-angular/angular/components/general/update-guide#from-111x-to-120x).
- `IgxDateTimeEditor`
    - **Breaking Change** - `onValueChange` event is renamed to `valueChange`.
    - **Breaking Change** - `isSpinLoop` property is renamed to `spinLoop`.
- `IgxDatePicker`
    - **Breaking Change** - `onSelection` event is renamed to `valueChange`.
    - **Breaking Change** - new way to define custom elements in the `igx-date-picker` while the following properties are deleted or deprecated: `context`, `labelInternal`, `template`.
        ```html
            <igx-date-picker #datePicker [(value)]="date" [displayFormat]="'longDate'" [inputFormat]="'dd/MM/yyyy'">
                <label igxLabel>Date: </label>
                <igx-picker-toggle igxPrefix>
                    calendar_view_day
                </igx-picker-toggle>
                <igx-picker-clear igxSuffix>
                    delete
                </igx-picker-clear>
            </igx-date-picker>
        ```
    - **Breaking Change** - `mask` and `format` are replaced by `inputFormat`.
    - **Breaking Change** - `placeholder` defaults to the `inputFormat`
    - **Breaking Change** - `editorTabIndex` is renamed to `tabIndex`.
    - **Breaking Change** - `monthsViewNumber` is renamed to `displayMonthsCount`.
    - **Breaking Change** - `vertical` is renamed to `headerOrientation`.
    - **Breaking Change** - `displayData` is renamed to `displayFormat`.
    - **Breaking Change** - `dropDownOverlaySettings` and `modalOverlaySettings` are replaced by `overlaySettings`.
    - **Breaking Change** - `onValidationFailed` event is renamed to `validationFailed`.
    - **Breaking Change** - `onDisabledDate` event is removed.
    - **Breaking Change** - `onOpening`, `onOpened`, `onClosing` and `onClosed` events are renamed respectively to `opening`, `opened`, `closing` and `closed`.
    - **Breaking Change** - `igxDatePickerActions` is renamed to `igxPickerActions`
    - **Behavioral Change** - Upon opening, the focused date will always be the selected/bound date. If there is no selected/bound date, the date picker will focus today's date. If `minValue` and/or `maxValue` are applied and today's date (or the bound date) is outside of the specified range, the focused date will be respectively `minValue` or `maxValue`.
- `IgxTimePicker`
    - **Breaking Change** - `value` type could be `Date` or `string`.
    - **Breaking Change** - `onValueChanged` event is renamed to `valueChange`.
    - **Breaking Change** - new way to define custom elements in the `igx-time-picker` while the following properties are deleted or deprecated: `context`, `promptChar`, `displayTime`, `template`.
        ```html
            <igx-time-picker #timePicker [(value)]="time" [displayFormat]="'mediumTime'" [inputFormat]="hh:mm:ss">
                <label igxLabel>Time: </label>
                <igx-picker-toggle igxPrefix>
                    alarm
                </igx-picker-toggle>
                <igx-picker-clear igxSuffix>
                    delete
                </igx-picker-clear>
            </igx-time-picker>
        ```
    - **Breaking Change** - `format` is replaced by `inputFormat`.
    - **Breaking Change** - `placeholder` defaults to the `inputFormat`
    - **Breaking Change** - `isSpinLoop` property is renamed to `spinLoop`.
    - **Breaking Change** - `vertical` is renamed to `headerOrientation`.
    - **Breaking Change** - `onOpening`, `onOpened`, `onClosing` and `onClosed` events are renamed respectively to `opening`, `opened`, `closing` and `closed`.
    - **Breaking Change** - `onValidationFailed` event is renamed to `validationFailed`.
    - **Behavioral Change** - The dropdown/dialog displays time portions within `minValue` and `maxValue` range if set or time between 00:00 and 24:00 in the provided `inputFormat`. The displayed values for each time portion are calculated based on the items delta always starting from zero. If the `minValue` or `maxValue` does not match the items delta, the displayed values will start/end from the next/last possible value that matches the delta. Upon opening, the selected time will be the bound value. In cases when there is not a bound value, it is outside the min/max range or does not match the items delta, the selected time will be the closest possible time that matches the items delta.
- `IgxDateRangePicker`
    - **Breaking Change** - `rangeSelected` event is renamed to `valueChange`.
    - **Breaking Change** - `onOpening`, `onOpened`, `onClosing` and `onClosed` events are renamed respectively to `opening`, `opened`, `closing` and `closed`.
    - **Breaking Change** - `monthsViewNumber` is renamed to `displayMonthsCount`.
- `IgxSliderComponent`
    - **Breaking Change** - The following outputs are renamed:
        - `onValueChange` to `valueChange`
        - `onValueChanged` to `dragFinished`
- `IgxCircularProgressBarComponent`
    - **Breaking Change** - The following outputs are renamed:
        - `onProgressChanged` to `progressChanged`
- `IgxLinearProgressBarComponent`
    - **Breaking Change** - The following outputs are renamed:
        - `onProgressChanged` to `progressChanged`
- `IgxToast`
    - **Breaking Change** - The following deprecated methods and outputs have been removed
        - Outputs `showing`, `shown`, `hiding`, `hidden`. Use `onOpening`, `onOpened`, `onClosing`, `onClosed` instead.
        - Methods `show`, `hide`. Use `open`, `close` instead.
- `IgxSnackbar`
    - **Breaking Change** - The following deprecated methods have been removed
        - `show`, `hide`. Use `open`, `close` instead.


### New Features
- Added `IgxTree` component
    - Allows users to render hierarchical data in an easy-to-navigate way. The control is **not** data bound and takes a declarative approach, giving users more control over what is being rendered.
    - Features API for handling selection (bi-state and cascading), node activation, node expansion state.
    - Features extensive and easy-to-use keyboard navigation, fully compliant with W3 standards.
    - Code example for a tree contructured from a hierarchical data set:
    ```html
        <igx-tree>
            <igx-tree-node *ngFor="let node of data" [data]="node" [expanded]="isNodeExpanded(node)" [selected]="isNodeSelected(node)">
                {{ node.text }}
                <img [src]="node.image" alt="node.imageAlt" />
                <igx-tree-node *ngFor="let child of node.children" [data]="child" [expanded]="isNodeExpanded(child)" [selected]="isNodeSelected(child)">
                    {{ child.text }}
                    <igx-tree-node *ngFor="let leafChild of child.children" [data]="leafChild" [expanded]="isNodeExpanded(leafChild)" [selected]="isNodeSelected(leafChild)">
                        <a igxTreeNodeLink href="{{leafChild.location}}" target="_blank">{{ leafChild.text }}</a>
                    </igx-tree-node>
                </igx-tree-node>
            </igx-tree-node>
        </igx-tree>
    ```
    - For more information, check out the [README](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/tree/README.md), [specification](https://github.com/IgniteUI/igniteui-angular/wiki/Tree-Specification) and [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tree)

- `IgxHierarchicalGrid`
    - Added support for exporting hierarchical data.
- `IgxForOf`, `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - **Behavioral Change** - Virtual containers now scroll smoothly when using the mouse wheel(s) to scroll them horizontally or vertically. This behavior more closely resembles the scrolling behavior of non-virtualized containers in most modern browsers.
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    -  The `IgxRowAddTextDirective` allows to customize the text of the row adding overlay.
        ```html
             <igx-grid [rowEditable]="true">
                <ng-template igxRowAddText>
                    Adding Row
                </ng-template>
            </igx-grid>
        ```
    -   A new `summaryFormatter` input property is exposed by the `IgxColumnComponent`, which is used to format the displayed summary values for the columns.
        ```typescript
            public dateSummaryFormat(summary: IgxSummaryResult, summaryOperand: IgxSummaryOperand): string {
                const result = summary.summaryResult;
                if(summaryOperand instanceof IgxDateSummaryOperand && summary.key !== 'count'
                    && result !== null && result !== undefined) {
                    const pipe = new DatePipe('en-US');
                    return pipe.transform(result,'MMM YYYY');
                }
                return result;
            }
        ```
        ```html
            <igx-column field="OrderDate" header="Order Date" [sortable]="true" [disableHiding]="true" [dataType]="'date'" [hasSummary]="true"
                [summaryFormatter]="dateSummaryFormat">
            </igx-column>
        ```
    - Two new column types are introduced `dateTime` and `time`. In order to operate with them is necessary to set the column property dataType to `'dateTime'` or `'time'`.

        ```html
        <igx-column field="OrderDate" header="Order Date"  [dataType]="'dateTime'" >
        </igx-column>
        <igx-column field="ClosingTime" header="Closing time"  [dataType]="'time'" >
        </igx-column>
        ```
    - **Behavioral Change** - `Column Autosize` feature now does not handle templated headers where the first level children are sized based on parent like default `div` and etc. Autosizing for such headers will not result in change.
    - **Behavioral Change** - Calling `autosize` through the `IgxColumnComponent` API now takes into consideration the `minWidth` and `maxWidth` of the column.
    - A new `IgxColumnComponent` input property is exposed called `autosizeHeader`, which if false, allows the autosizing to ignore the header cell and autosize only based on content cells.
- `IgxTabs`
    - The `tabAlignment` property of the `IgxTabs` component replaces the `type` property and enables you to set the tab alignment to `start`, `center`, `end` and `justify`.
    - The `igx-tab-header` supports `igx-prefix` and `igx-suffix` directives in its `ng-content`.
- `IgxBottomNav`
    - The `IgxBottomNav` component exposes `disableAnimations` property which determines whether the contents should animate when switching the selected item. The property is set to `true` by default which means that the animations are disabled.
- `IgxOverlayService`
    - `detach` and `detachAll` methods are added to `IgxOverlayService`. Calling `detach` will remove all the elements generated for the related overlay, as well as clean up all related resources. Calling `detachAll` will remove all elements generated by any call to `IgxOverlay` `attach`, and will clean up all related resources. _Note: calling `hide` or `hideAll` will not clean generated by the service elements and will not clean up related resources._
- `IgxCombo`
    - Any changes to `IComboItemAdditionEvent.addedItem` will be reflected in the item added to the data.
    - `IgxComboComponent.onAddition` is now cancelable. You can prevent the item from being added by setting the event args `cancel` property to `true`.
    ```typescript
    public handleComboItemAddition(event: IComboItemAdditionEvent): void {
        if (event.addedItem[this.combo.valueKey] === 'ForbiddenValue') {
            event.cancel = true;
        } else if (event.addedItem[this.combo.valueKey] === 'Change Me') {
            const index = this.iter++;
            event.addedItem = {
                [this.combo.valueKey]: `customId${index}`,
                [this.combo.displayKey]: `New item ${index}`;
            }
        }
    }
    ```
- `IgxDateTimeEditor`
    - `value` accepts ISO 8601 string format.
    - `spinDelta` input property which allows a user to provide different delta values that will be used for spinning. All parts default to `1`.
    - `increment` and `decrement` methods now accept an optional `delta` parameter which targets the currently spun date portion. It takes precedence over the values set in `spinDelta`.
- `IgxDatePicker`
    - `value` accepts ISO 8601 string format.
    - The actions template now exposes the Calendar component as implicit context:
      ```html
      <igx-date-picker>
        <ng-template igxPickerActions let-calendar>
            <button igxButton="flat" (click)="calendar.viewDate = today">Today</button>
        </ng-template>
      </igx-date-picker>
      ```
- `IgxTimePicker`
    - `value` accepts ISO 8601 string format.
    - The `igxPickerActions` directive can now be used to provide custom buttons to the picker's pop-up:
      ```html
      <igx-time-picker #timePicker>
        <ng-template igxPickerActions>
            <button igxButton="flat" (click)="timePicker.close()">Close</button>
        </ng-template>
      </igx-time-picker>
      ```
- `IgxDateRangePicker`
    - `value` start and end accept ISO 8601 string format.
    - The `igxPickerActions` directive can now be used to template the pickers `Done` button:
      ```html
      <igx-date-range-picker #rangePicker>
        <ng-template igxPickerActions>
            <button igxButton="flat" (click)="rangePicker.close()">Close</button>
        </ng-template>
      </igx-date-range-picker>
      ```

### Themes:
- Breaking Changes:
    - `IgxButton` theme has been simplified. The number of theme params (`igx-button-theme`) has been reduced significantly and no longer includes prefixed parameters (`flat-*`, `raised-*`, etc.). See the migration guide to update existing button themes. Updates performed with `ng update` will migrate existing button themes but some additional tweaking may be required to account for the abscense of prefixed params.
    - The `igx-typography` mixin is no longer implicitly included with `igx-core`. To use our typography styles users have to include the mixin explicitly:

    ```html
    @include igx-core();
    /// Example with Indigo Design theme:
    @include igx-typography($font-family: $indigo-typeface, $type-scale: $indigo-type-scale);
    ```

## 11.1.13

### General
- `IgxExpansionPanelHeaderComponent`
    - **Behavioral Change** - Settings `disabled` property of `IgxExpansionPanelHeaderComponent` now makes the underlying header element not accessible via `Tab` navigation (via `tabindex="-1"`)

## 11.1.1

### New Features
- `IgxAutocomplete`
    - Exported the component instance in the template with the name `igxAutocomplete`.

    ```html
    <input type="text" [igxAutocomplete]="townsPanel" #autocompleteRef="igxAutocomplete"/>
    ```
## 11.1.0

### New Features
- `IgxDropDown`
    - The `igx-drop-down-item` now allows for `igxPrefix`, `igxSuffix` and `igx-divider` directives to be passed as `ng-content` and they will be renderer accordingly in the item's content.
- `IgxGrid`
    - Added support for exporting grouped data.
- `IgxTreeGrid`
    - Added `multipleCascade` row selection mode. In this mode, selecting a record results in the selection of all its children recursively. When only some children are selected, their parent's checkbox is in an indeterminate state.


        ```html
        <igx-tree-grid [rowSelection]="'multipleCascade'">
        </igx-tree-grid>
        ```
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - Support for `currency` type columns is added in the grid.
    - Support for `percent` type columns is added in the grid.
    - Added support for filtering based on the formatted cell values using the `FormattedValuesFilteringStrategy` for `IgxGrid`/`IgxHierarchicalGrid` and `TreeGridFormattedValuesFilteringStrategy` for `IgxTreeGrid`.
    - The following new events are introduced: `sorting`, `filtering`, `columnPinned`, `columnVisibilityChanging`.
    - **Behavioral Change** -
    - `onColumnPinning` to emit `IPinColumnCancellableEventArgs` instead of `IPinColumnEventArgs`.
    - `Column pinning`, `Column moving`, `paging` interactions now discard the editing value, instead of committing it.
    - `Column Resizing` now does not exit edit mode.
- `IgxInput` now supports `type="file"` and its styling upon all themes.
   _Note: validation of file type input is not yet supported._
- `igxSplitter` now has the following additional outputs:
    - `resizeStart` - Emits when pane resizing starts.
    - `resizing`- Emits while panes are being resized.
    - `resizeEnd` - Emits when pane resizing ends.

    All emit with the two panes affected by the resize operation as arguments.

### General
- **Breaking Change** - Many outputs are renamed with the introduction of new rules in Ignite UI for Angular's naming convention. Please, ensure that when you update to 11.1 you do so through
    ```
    ng update igniteui-angular
    ```
    or execute the update migrations manually afterwards
    ```
    ng update igniteui-angular --migrate-only
    ```
    This will ensure your application is updated to use the new output names.
- `IgxCheckbox, IgxRadio, IgxSwitch` now follow the Google Material spec for focus behavior. See [checkbox](https://material.io/components/checkboxes), [radio](https://material.io/components/radio-buttons), and [switch](https://material.io/components/switches).
- `IgxDialog`
    - The dialog content has been moved inside the dialog window container in the template. This means that if you have added something in-between the opening and closing tags of the dialog, you may have to adjust its styling a bit since that content is now rendered inside a container that has padding on it.
- `IgxCalendar`
    - **Breaking Change**
    - A new string enumeration `IgxCalendarView` is exported. Either the new one or the current `CalendarView` can be used. `CalendarView` will be deprecated in a future release.
    - `onSelection` is now `selected`
    - `onViewChanging` is now `viewChanging`
    - `onDateSelection` is now `dateSelection`
    - `onYearSelection` is now `yearSelection`
    - `onMonthSelection` is now `monthSelection`
- `IgxYearsViewComponent`
    - **Breaking Change**
    - `onSelection` is now `selected`
    - `onYearSelection` is now `yearSelection`
- `IgxDaysViewComponent`
    - **Breaking Change**
    - `onDateSelection` is now `dateSelection`
    - `onViewChanging` is now `viewChanging`
- `IgxMonthsViewComponent`
    - **Breaking Change**
    - `onSelection` is now `selected`
    - `onMonthSelection` is now `monthSelection`
- `IgxMonthPickerComponent`
    - **Breaking Change**
    - `onSelection` is now `selected`
- `IgxRadioGroup`
    - Added new property `alignment` that determines the radio group alignment. Available options are `horizontal` (default) and `vertical`.
- `IgxDialog`
    - Added new `onOpened` and `onClosed` events.
- `IgxIcon`
    - **Deprecated** - The `color` input property has been deprecated.
    - **Renamed inputs**
        `isActive` to `active`
        `fontSet` to `family`
- `IgxToast`
    - **Breaking Change** -
    `show` and `hide` methods have been deprecated. `open` and `close` should be used instead.
    `onShowing`,`onShown`,`onHiding` and `onHiden` events have been deprecated. `onOpening`, `onOpened`, `onClosing` and `onClosed`should be used instead.
- `IgxInputGroup`
    - Added new property `theme` that allows you to set the theme explicitly and at runtime.
- `IgxSnackbar`
    - `show` and `hide` methods have been deprecated. `open` and `close` should be used instead.
- `IgxSplitter`
    - **Breaking Change** - the `onToggle` output is deprecated. A new output is introduced to replace it - `collapsedChange`. This allows for the `collapsed` state to be two-way bindable using the syntax ```[(collapsed)]="paneCollapse"```
- `IgxChip`
    - **Breaking Change** - The following outputs are renamed:
        - `onMoveStart` to `moveStart`
        - `onMoveEnd` to `moveEnd`
        - `onRemove` to `remove`
        - `onClick` to `chipClick`
        - `onSelection` to `selectedChanging`
        - `onSelectionDone` to `selectedChanged`
        - `onKeyDown` to `keyDown`
        - `onDragEnter` to `dragEnter`
- `IgxChipArea`
    - **Breaking Change** - The following outputs are renamed:
        - `onReorder` to `reorder`
        - `onSelection` to `selectionChange`
        - `onMoveStart` to `moveStart`
        - `onMoveEnd` to `moveEnd`
- `IgxGrid`, `IgxHierarchicalGrid`, `IgxTreeGrid`
    - Added new property `selectRowOnClick` that determines whether clicking over a row will change its selection state or not. Set to `true` by default.
    - `GridPagingMode` enum members rename - `local` to `Local` and `remote` to `Remote`. Example:  `GridPagingMode.Local`.
- IgxButton
    - IgxIcon(s) placed in a button now include margin if there are one or more sibling elements to give them some breathing room. The amount of margin applied depends on the display density of the button.
- `IgxListComponent`
    - **Breaking Change** - The following outputs are renamed:
        - `onLeftPan` to `leftPan`
        - `onRightPan` to `rightPan`
        - `onPanStateChange` to `panStateChange`
        - `onItemClicked` to `itemClicked`
- `IgxNavbarComponent`
    - **Breaking Change** - The `onAction` output is renamed to `action`.
- `IgxTabsComponent`
    - **Breaking Change** - The following outputs are renamed:
        - `onTabItemSelected` to `tabItemSelected`
        - `onTabItemDeselected` to `tabItemDeselected`
- `IgxTooltipTargetDirective`
    - **Breaking Change** - The following outputs are renamed:
        - `onTooltipShow` to `tooltipShow`
        - `onTooltipHide` to `tooltipHide`
- `IgxBaseExporter`, `IgxExcelExporterService`, `IgxCsvExporterService`
    - **Breaking Change** - The following outputs are renamed:
        - `onColumnExport` to `columnExporting`
        - `onRowExport` to `rowExporting`
        - `onExportEnded` to `exportEnded`

## 11.0.15

### New Features
- `IgxAutocomplete`
    - Exported the component instance in the template with the name `igxAutocomplete`.

    ```html
    <input type="text" [igxAutocomplete]="townsPanel" #autocompleteRef="igxAutocomplete"/>
    ```

## 11.0.4

### General
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - a new property `event` has been introduced to `IGridEditEventArgs` and `IGridEditDoneEventArgs`; the property represents the original DOM event that triggers any of Grid editing events like `rowEditEnter`, `cellEditEnter`, `cellEdit`, `cellEditDone`, `cellEditExit`, `rowEdit`, `rowEditDone`, `rowEditExit`
    - **Behavioral Change** -
    When there isn't a previous active node and the user enters the grid using tab or shift + tab key:
    the first fully visible element is activated: /no scroll bar positioning is reset/changed;
    If there is a previous active node in the grid - the previously active node is reactivated without resetting the scroll positions;
    If we follow the default tab navigation and we are currently on a data cell with / rowIndex: -1, columnIndex: 6/ for example
    when we tab down to the root summaries the summary cell with visible column index 6 should be activated and scroll into the view;
    The same applies if you shift+tab to the headers header cell with visible index 6 is activated and scrolled into the view;
    If you have an active node and go to another tab and then return back the active node and the current scroll position should not be changed;

## 11.0.0

### General
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - Added a new directive for re-templating the Excel style filtering header icon - `IgxExcelStyleHeaderIconDirective`.
    - **Breaking Change**

        Changed the how the grid toolbar is instantiated in the grids. The
        toolbar is now templated rather than being activated through a property on the parent grid. The toolbar features are also exposed as templatable
        components and the old properties are deprecated.

        Refer to the official documentation for more information.
- `FilteringStrategy`
    - **Breaking Change** - `filter` method exposed by the `FilteringStrategy` class now requires 3rd `advancedExpressionsTree` and 4th `grid` parameters. If not needed, just pass `null`.

### New Features
- `IgxCalendar`
    - Is now fully accessible to screen readers.

### Improvements
- `IgxOverlay`
    - New functionality to automatically determine the correct animation that is needed when showing an overlay content. This is used with Auto Position strategy, where the `IgxOverlay` content is flipped, depending on the available space.

## 10.2.25
- `IgxExpansionPanelHeaderComponent`
    - **Behavioral Change** - Settings `disabled` property of `IgxExpansionPanelHeaderComponent` now makes the underlying header element not accessible via `Tab` navigation (via `tabindex="-1"`)

## 10.2.15

### New Features
- `IgxAutocomplete`
    - Exported the component instance in the template with the name `igxAutocomplete`.

    ```html
    <input type="text" [igxAutocomplete]="townsPanel" #autocompleteRef="igxAutocomplete"/>
    ```

## 10.2.0

### General
- `IgxGridActions`
    - Added `asMenuItems` Input for grid actions - `igx-grid-editing-actions`, `igx-grid-pinning-actions`. When set to true will render the related action buttons as separate menu items with button and label.
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - **Behavioral Change** - The Excel Style Filtering has been reworked to provide filtering experience such as in Excel. This includes the following changes:
        - You can close the Excel Style Filtering menu by pressing `Ctrl + Shift + L`.
        - You can apply the filter by pressing `Enter`.
        - When searching items in the Excel Style Filtering menu, only the rows that match your search term will be filtered in.
        - By checking the `Add current selection to filter` option, the new search results will be added to the previously filtered items.
- `IgxInputGroup`
    - **Breaking Change** - Removed `fluent`, `fluent_search`, `bootstrap`, and `indigo` as possible values for the `type` input property.
    - **Behavioral Change** - The styling of the input group is now dictated by the theme being used. The remaining `types` - `line`, `border`, and `box` will only have effect on the styling when used with the `material` theme. The `search` type will affect styling when used with all themes. Changing the theme at runtime will not change the styling of the input group, a page refresh is required.
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - **Rename outputs**
        `onRowEditEnter` to `rowEditEnter`
        `onCellEditEnter` to `cellEditEnter`
        `onCellEdit` to `cellEdit`
        `onRowEdit` to `rowEdit`
    - **Breaking Change** - The `onCellEditCancel` event is replaced by the new `cellEditExit` event that emits every time the editable cell exits edit mode.
    - **Breaking Change** - The `onRowEditCancel` event is replaced by the new `rowEditExit` event that emits every time the editable row exits edit mode.
- `IgxOverlay`
    - **Breaking Change** - `target` property in `PositionSettings` has been deprecated. You can set the attaching target for the component to show in `OverlaySettings` instead.
- `IgxToggleDirective`
    - `onAppended`, `onOpened` and `onClosed` events are emitting now arguments of `ToggleViewEventArgs` type.
    - `onOpening` and `onClosing` events are emitting now arguments of `ToggleViewCancelableEventArgs` type.
- `IgxSelect`
    - Added `aria-labelledby` property for the items list container(marked as `role="listbox"`). This will ensure the users of assistive technologies will also know what the list items container is used for, upon opening.
- `IgxDatePicker`
    - **Breaking Change** - Deprecated the `label` property.
    - Added `aria-labelledby` property for the input field. This will ensure the users of assistive technologies will also know what component is used for, upon input focus.
- `igxNavigationDrawer`
    - Added `disableAnimation` property which enables/disables the animation, when toggling the drawer. Set to `false` by default.
- `igxTabs`
    - Added `disableAnimation` property which enables/disables the transition animation of the tabs' content. Set to `false` by default.
- `IgxExpansionPanel`
    - `IExpansionPanelEventArgs.panel` - Deprecated. Usе `owner` property to get a reference to the panel.
- `IgxCalendarComponent`, `IgxMonthsViewComponent` and `IgxYearsViewComponent`
    - `tabIndex` property was removed  in order to improve on page navigation and to be compliant with W3 accessability recommendations; Also the date grid in the calendar is now only one tab stop, the same approach is applied and in the `IgxMonthsViewComponent` and `IgxYearsViewComponent`;

### New Features
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - When triggering an export of the grid via the toolbar and the export takes more than 500 milliseconds, the export button becomes disabled and an indeterminate progress bar is shown at the bottom of the toolbar until the export is finished.
    - `cellEditExit` is a new event that fires when cell exits edit mode
    - `rowEditExit` is a new event that fires when row exits edit mode
    - Added *getRowData(rowSelector)* method that returns an object that represents the data that is contained in the specified row component.
    - Added ability to spawn row adding UI through exposed methods. Note that rowEditing should be enabled.
        - `beginAddRow` method which starts the adding row UI.
        - `beginAddChild` method which starts the adding child UI.
        ```typescript
        this.grid.beginAddRow(rowID);
        ```
        - Added an input properties to `IgxGridEditingActions` component to show/hide add row and add child buttons which trigger the UI based on context expression.
        ```html
        <igx-tree-grid [rowEditing]="true">
            <igx-action-strip #actionStrip>
                <igx-grid-editing-actions [addRow]="true" [addChild]="actionStrip.context.level < 3">
                </igx-grid-editing-actions>
            </igx-action-strip>
        </igx-tree-grid>
        ```
    - A new `locale` and `pipeArgs` parameters are introduced in the `operate` method exposed by the `IgxNumberSummaryOperand` and `IgxDateSummaryOperand`, which exposes the grid locale. Use the `locale` parameter to get localized summary data (as per the grid locale. If not passed, `locale` defaults to `'en-US'`). Use the `pipeArgs` parameter only if you want to customize the format of the date and numeric values that will be returned.
    ```typescript
    class MySummary extends IgxDateSummaryOperand {
        operate(columnData: any[], allData = [], fieldName, locale: string, pipeArgs: IColumnPipeArgs): IgxSummaryResult[] {
            const pipeArgs: IColumnPipeArgs = {
                format: 'longDate',
                timezone: 'UTC',
                digitsInfo: '1.1-2'
            }
            const result = super.operate(columnData, allData, fieldName, locale, pipeArgs);
            return result;
        }
    }
    ```
    - A new `pipeArgs` input property is exposed by the `IgxColumnComponent`, which is used to pass arguments to the Angular `DatePipe` and `DecimalPipe`, to format the display for date and numeric columns.
    ```typescript
- ` IGX_INPUT_GROUP_TYPE` injection token
    - Allows for setting an input group `type` on a global level, so all input-group instances, including components using such an instance as a template will have their input group type set to the one specified by the token. It can be overridden on a component level by explicitly setting a `type`.
- ` IgxExcelExporterService`
    - Added `worksheetName` property to the `IgxExcelExporterOptions`, that allows setting the name of the worksheet.
- `IgxDatePicker`
    - The the `label` property have been deprecated and a custom label can also be set by nesting a <label igxLabel></label> inside the <igx-date-picker><igx-date-picker> tags.
- `IgxTimePicker`
    - Added a custom label functionality.
- `IgxCalendar` and `IgxDatePicker` - new `showWeekNumbers` input, that allows showing of the week number at left side of content area.
- `IgxOverlay`
    - The `PositionSettings` `target` property has been deprecated and moved to `OverlaySettings`.
    - An optional Point/HTML Element parameter `target` has been added to the `position()` method
    - Added `createAbsoluteOverlaySettings` and `createRelativeOverlaySettings` methods which create non-modal `OverlaySettings` based on predefined `PositionSettings`. The methods are exposed off the `IgxOverlayService`.
        - `createAbsoluteOverlaySettings` creates non-modal `OverlaySettings` with `GlobalPositionStrategy` or `ContainerPositionStrategy` if an outlet is provided. Accepts `AbsolutePosition` enumeration, which could be `Center`, `Top` and `Bottom`. Default is `Center`.
        ```typescript
            const globalOverlaySettings = IgxOverlayService.createAbsoluteOverlaySettings(AbsolutePosition.Top);
        ```
        - `createRelativeOverlaySettings` creates `OverlaySettings` with `AutoPositionStrategy`, `ConnectedPositioningStrategy` or `ElasticPositionStrategy`. Accepts target, strategy and position. The `target` is the attaching point or element for the component to show. The position strategy is a `RelativePositionStrategy` enumeration, which defaults to `Auto`. The position is a `RelativePosition` enumeration. Possible values are `Above`, `Below`, `Before`, `After` and `Default`. The default option is `Default`, which positions the element below the target, left aligned.
        ```typescript
            const targetElement = this.button.nativeElement;
            const connectedOverlaySettings = IgxOverlayService.createRelativeOverlaySettings(
                    targetElement,
                    RelativePositionStrategy.Connected,
                    RelativePosition.Above);
        ```
- `IgxToast`
    - The component now utilizes the `IgxOverlayService` to position itself in the DOM.
    - An additional input property `outlet` has been added to allow users to specify custom Overlay Outlets using the `IgxOverlayOutletDirective`;
    - The `position` property now accepts values of type `IgxToastPosition` that work with strict templates.
- `IgxExpansionPanelHeader`
    - `onInteraction` is now cancelable
    - Added `iconRef` property. This can be used to get a reference to the displayed expand/collapsed indicator. Returns `null` if `iconPosition` is set to `NONE`.

## 10.1.0

### General
- `igxCombo`
    - **Behavioral Change** - Change default positioning strategy from `ConnectedPositioningStrategy` to `AutoPositionStrategy`. The [`Auto`](https://www.infragistics.com/products/ignite-ui-angular/angular/components/overlay-position#auto) strategy will initially try to show the element like the Connected strategy does. If the element goes out of the viewport Auto will flip the starting point and the direction, i.e. if the direction is 'bottom', it will switch it to 'top' and so on. If after flipping direction the content goes out of the view, auto strategy will revert to initial start point and direction and will push the content into the view. Note after pushing the content it may hide the combo's input.
    - Make `onSearchInput` event cancellable. The event args type has been changed to `IComboSearchInputEventArgs`, which have the following properties: `searchText` - holds the text typed into the search input, `owner` - holds a reference to the combo component and `cancel` - indicates whether the event should be canceled.
- `IgxOverlay`
    - Added new property `closeOnEscape` in `OverlaySettings` that controls whether the overlay should close on escape keypress. By default `closeOnEsc` is set to `false`.
    - **Behavioral Change** - `modal` overlays shown directly through the Overlay Service no longer close on Escape by default. That behavior can now be specified using the `closeOnEscape` property.
- `igxDialog`
    - Added `closeOnEscape` - with it, the dialog can be allowed or prevented from closing when `Esc` is pressed.
- `IgxNavbar`:
    - **Breaking Changes** - The `igx-action-icon` has been renamed to `igx-navbar-action`. It should get renamed in your components via `ng update`;
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - **Breaking Change** - The `selectedRows` method is now an `@Input` property. Setting it to an array of Row IDs will update the grid's selection state, any previous selection will be cleared. Setting it to an empty array will clear the selection entirely.
    - **Breaking Change** - Removed `IgxExcelStyleSortingTemplateDirective`, `IgxExcelStyleHidingTemplateDirective`, `IgxExcelStyleMovingTemplateDirective`, `IgxExcelStylePinningTemplateDirective` and `IgxExcelStyleSelectingTemplateDirective` directives for re-templating the Excel style filter menu. Added two new directives for re-templating the column operations and filter operations areas - `IgxExcelStyleColumnOperationsTemplateDirective` and `IgxExcelStyleFilterOperationsTemplateDirective`. Exposed all internal components of the Excel style filter menu in order to be used inside the templates.
    - **Breaking Change** - `IgxColumnHiding` and `IgxColumnPinning` components have been deprecated in favor of a component combining the their functionality - `IgxColumnActions` which is used with either of the new `IgxColumnPinning` and `IgxColumnHiding` directives that specify the action to be triggered through the UI.
    - Added `move` method which allows to move a column to a specified visible index. The method is exposed off the `IgxColumnComponent`.
- `igxGrid`
    - **Behavioral Change** - For numeric columns, the onCellEdit arguments' newValue will now contain the numeric value that will be committed instead of the string input.
    - Added `onScroll` event, which is emitted when the grid is scrolled vertically or horizontally.
    - Each grid now expose a default handling for boolean column types. The column will display `check` or `close` icon, instead of true/false by default.
- `igxTreeGrid`
    - Removed `onDataPreLoad` event as it is specific for remote virtualization implementation, which is not supported for the `igxTreeGrid`. A more generic `onScroll` event is exposed and can be used instead.
- `IgxTimePicker`
    - Added a disabled style for time parts outside of the minimum and maximum range.
- `igxDatePicker`
    -  Added new property - `editorTabIndex`, that allows setting tabindex for the default editor.

### New Theme
Ignite UI for Angular now has a new theme based on our own design system.
You can use one of the following mixins to include a dark or light indigo theme:
`igx-indigo-light-theme` and `igx-indigo-dark-theme`

We also added two new palettes that go with the new theme, `$light-indigo-palette` and `$dark-indigo-palette`.

The following example shows how you can use the Indigo theme:

```scss
// Light version
.indigo-theme {
    @include igx-indigo-light-theme($light-indigo-palette);
}

// Dark version
.indigo-dark-theme {
    @include igx-indigo-dark-theme($dark-indigo-palette);
}
```


### New Features
- `igxButton` directive
    - Added styles to support extended fab buttons.
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - Exposed new `cellEditDone` and `rowEditDone` non cancelable events. The arguments contain `rowData` that is the committed `newValue`.
        - `cellEditDone` - Emitted after a cell has been edited and editing has been committed.
        - `rowEditDone` - Emitted after exiting edit mode for a row and editing has been committed.
    - Introduced `showSummaryOnCollapse` grid property which allows you to control whether the summary row stays visible when the groupBy / parent row is collapsed.
    - Added support for tooltips on data cells default template and summary cells.
    - Added support for binding columns to properties in nested data objects.
    Data operations (filtering/sorting/updating/etc) are supported for the nested properties.
    ```html
        <igx-column field="foo.bar.baz"></igx-column>
    ```
- `IgxGridState` directive
    - Added support for expansion states, column selection and row pinning.
    - Added support for `IgxTreeGrid` and `IgxHierarchicalGrid` (including child grids)
- `IgxColumn`
    - Added `byHeader` parameter to the `autosize` method which specifies if the autosizing should be based only on the header content width.
- `IgxToast`
    - `message` property has been deprecated. You can place the *message text* in the toast content or pass it as parameter to `show` method instead.
    - An optional string parameter `message` has been added to `show()` method.
- `IgxSnackbar`
    - `message` property has been deprecated. You can place the *message text* in the snackbar content or pass it as parameter to `show` method instead.
    - An optional string parameter `message` has been added to `show()` method.
- `IgxNavbar`
    - Added new `igx-navbar-title, igxNavbarTitle` directive that can be used to provide custom content for navbar title. It would override the value of `title` input property.
- `IgxCalendar` and `IgxMonthPicker`
    - `viewDateChanged` emitted after the month/year presented in the view is changed after user interaction.
    - `activeViewChanged` event emitted after the active view (DEFAULT, YEAR, DECADE) is changed after user interaction.
    - `viewDate` day value is always 1.
    - `activeView` setter is now available as an input property.
- `IgxCombo`
    - Added `showSearchCaseIcon` to display a case sensitive search icon in the search input. Icon click allows the user to easily toggle the search case sensitivity.

## 10.0.0

### General
- `igxGrid`
    - **Behavioral Change** - Group rows now display the group column's header name instead of field when one is available.
- `igx-select`, `igx-combo`, `igx-drop-down`
    - **Behavioral Change** - The select, combo, and dropdown items now have display block and text-overflow ellipsis enabled by default. This requires styling to be handled on the application-level if there is something more than a simple text in the item.
- `IgxTransaction` - The `onStateUpdate` now emits with information of its origin. The emitted value is of type `StateUpdateEvent`, which has two properties:
    - `origin` - it can vary within the values of the `TransactionEventOrigin` interface;
    - `actions` - contains information about the transactions, that caused the emission of the event.
- `IgxPaginator` - The input `overlaySettings` was introduced, which allows applying custom overlay settings for the component.

### New Features
- `IgxGrid`
    - `showGroupArea` input is added, which can be used to enable/disable the group area row.
    - The event arguments of `onCellEdit`, `onCellEditEnter` and `onCellEditCancel` events will contain a reference to the row data, as well as a reference to the column.
    - The event arguments of `onRowEdit`, `onRowEditEnter` and `onRowEditCancel` events will contain a reference to the row data.

- `IgxSelect` support for `igxHint` directive added.
    - Allows the user to add `igxHint` to be displayed bellow the input element.

## 9.1.9

### New Features
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - Expose a setter for grid's `outlet` property, which can be used to set the outlet used to attach the grid's overlays to.

## 9.1.4

### New Features
- `IgxList`
    - Added localization support.

## 9.1.1

### General
- `IgxHierarchicalGrid`
    - `onGridInitialized` - New output has been exposed. Emitted after a grid is being initialized for the corresponding row island.
-  **Behavioral Change** - When moving a column `DropPosition.None` is now acting like `DropPosition.AfterDropTarget`.

## 9.1.0

### General
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - **Behavioral Change** - When a column is sortable sort indicator is always visible. The column is sorted when click on it.
- `igx-paginator` -  The following inputs have been deprecated for the `paginator` component and will be removed in future versions
    - `selectLabel` and `prepositionPage` Use 'resourceStrings' to set/get values.

- `IgxInputGroup`
  - **Renamed** `supressInputAutofocus` input to `suppressInputAutofocus`
  - Clicking on prefix, suffix or label elements in the Input Group will no longer blur and re-focus the input.

### Themes
- **Breaking Change**  Change the default `$legacy-support` value to false in the `igx-theme` function.

### New Features

- `IgxDateTimeEditor` directive added.
    - Allows the user to set and edit `date` and `time` in a chosen input element.
    - Can edit `date` or `time` portion, using an editable masked input.
    - Additionally, can specify a desired `display` and `input` `format`, as well as `min` and `max` values.

    - A basic configuration scenario setting a Date object as a `value`:
    ```html
    <igx-input-group>
        <input type="text" igxInput igxDateTimeEditor [value]="date"/>
    </igx-input-group>
    ```
    - Two-way data-binding via an ngModel:
    ```html
    <igx-input-group>
        <input type="text" igxInput igxDateTimeEditor [(ngModel)]="date"/>
    </igx-input-group>
    ```
- `IgxDateRangePicker` component added.
    - Allows the selection of a range of dates from a calendar UI or input fields. Supports `dialog` and `dropdown` modes.
    - Added `IgxDateRangeStartComponent` and `IgxDateRangeEndComponent`.
    - The default template consists of a single *readonly* field:
    ```html
    <igx-date-range-picker [(ngModel)]="range"></igx-date-range-picker>
    ```
    - Projection of input fields using `igxDateTimeEditor`
        ```html
        <igx-date-range-picker>
            <igx-date-range-start>
                <input igxInput igxDateTimeEditor [(ngModel)]="range.start">
            </igx-date-range-start>
            <igx-date-range-end>
                <input igxInput igxDateTimeEditor [(ngModel)]="range.end">
            </igx-date-range-end>
        </igx-date-range-picker>
        ```
    - Added `IgxPickerToggleComponent` which allows templating of the default icon in the input through `igxPrefix` and `igxSuffix`.
        - default template:
        ```html
        <igx-date-range-picker>
            <igx-picker-toggle igxSuffix>
                <igx-icon>calendar_view_day</igx-icon>
            </igx-picker-toggle>
        </igx-date-range-picker>
        ```
        - with projections:
        ```html
        <igx-date-range-picker>
            <igx-date-range-start>
                ...
                <igx-picker-toggle igxPrefix>
                    <igx-icon>calendar_view_day</igx-icon>
                </igx-picker-toggle>
                ...
            </igx-date-range-start>
            <igx-date-range-end>
                ...
            </igx-date-range-end>
        </igx-date-range-picker>
        ```

- `IgxActionStrip` component added.
    - Provides a template area for one or more actions. In its simplest form the Action Strip
        is an overlay of any container and shows additional content over that container.

    ```html
    <igx-action-strip #actionstrip>
        <igx-icon (click)="doSomeAction()"></igx-icon>
    </igx-action-strip>
    ```

- `igxSplitter` component added.
    - Allows rendering a vertical or horizontal splitter with multiple splitter panes with templatable content.
        Panes can be resized or collapsed/expanded via the UI. Splitter orientation is defined via the `type` input.

     ```html
   <igx-splitter [type]="type">
        <igx-splitter-pane>
			...
        </igx-splitter-pane>
        <igx-splitter-pane>
			...
        </igx-splitter-pane>
    </igx-splitter>
    ```

- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - Added ability to pin rows to top or bottom depending on the new `pinning` input.
    And new API methods `pinRow` and `unpinRow`.
    ```html
    <igx-grid [data]="data" [pinning]="pinningConfiguration"></igx-grid>
    ```
    ```typescript
    public pinningConfiguration: IPinningConfig = { rows: RowPinningPosition.Bottom };
    ```
    ```typescript
    this.grid.pinRow(rowID);
    ```
    - Added support for pinning columns on the right. Change the position of pinning using the new `pinning` input.
    ```html
    <igx-grid [data]="data" [pinning]="pinningConfiguration"></igx-grid>
    ```
    ```typescript
    public pinningConfiguration: IPinningConfig = { columns: ColumnPinningPosition.End };
    ```
  - Added new properties for paging:
    - `totalRecords` set to alter the pages count based on total remote records. Keep in mind that If you are using paging and all the data is passed to the grid, the value of totalRecords property will be set by default to the length of the provided data source. If totalRecords is set, it will take precedent over the default length based on the data source.
    - `pagingMode` - accepts `GridPagingMode` enumeration. If the paging mode is set to remote the grid will not paginate the passed data source, if the paging mode is set to local (which is the default value) the grid will paginate the data source based on the page, perPage and totalRecords values.
    - Added functionality for column selection.
    - `columnSelection` property has been added. It accepts GridSelection mode enumeration. Grid selection mode could be none, single or multiple.
    - `selected` property has been added to the IgxColumnComponent; Allows you to set whether the column is selected.
    - `selectable` property has been added to the IgxColumnComponent; Allows you to set whether the column is selectable.
    - `onColumnSelectionChange` event is added for the `IgxGrid`. It is emitted when the column selection is changed.
    - `excelStyleSelectingTemplate` property is introduced to IgxGrid, which allows you to set a custom template for the selecting a column in the Excel Style Filter.
    - `selectedColumns` API method is added for the `IgxGrid`. It allows to get all selected columns.
    - `selectColumns` API method is added for the `IgxGrid`. It allows to select columns by passing array of IgxColumnComponent or column fields.
    - `deselectColumns` API method is added for the `IgxGrid`. It allows to deselect columns by passing array of IgxColumnComponent or column fields.
    - `deselectAllColumns` API method is added for the `IgxGrid`. It allows to deselect all columns.
    - `getSelectedColumnsData` API method is added for the `IgxGrid`. It allows to get the selected columns data.
    Added keyBoard navigation support in the IgxGrid headers. Now is possible to navigate with the arrows keys through grid headers. Also we provide a number of key combinations that trigger a different column functionality like filtering, sorting, grouping and etc. You can read more information in the [Grid Specification](https://github.com/IgniteUI/igniteui-angular/wiki/igxGrid-Specification#kb-navigation).
    - **Behavioral Change**
        - *you can not use* `tab` key to navigate between the cell in the Igx Grid. The navigation is performed only with arrow keys.
        - when you are in edit mode with `tab` key you can navigate to the next editable cell.
        - `page up` and `page down` keys will perform action only if the focused element is the tbody of the grid.
        - The grid introduces the following basic `tab stops`:
            - Toolbar / Group by Area if existing;
            - The first cell in the header row;
            - The first cell in the first body row;
            - The first cell in column summary if exists;
            - Pager UI;

- `IgxCombo`:
    - Added `autoFocusSearch` input that allows to manipulate the combo's opening behavior. When the property is `true` (by default), the combo's search input is focused on open. When set to `false`, the focus goes to the combo items container, which can be used to prevent the software keyboard from activating on mobile devices when opening the combo.

- `IgxToast`:
    - Added functionality for displaying various content into the toast component. It also allows users to access toast styles through its host element.

- `IgxDrag`
    - Added `igxDragIgnore` directive that allows children of the `igxDrag` element to be interactable and receive mouse events. Dragging cannot be performed from those elements that are ignored.
    - Added `dragDirection` input that can specify only one direction of dragging or both.

- `IgxChip`
    - Added support for tabIndex attribute applied to the main chip element.
    - Added `tabIndex` input so it can support change detection as well.

- `IgxHighlightDirective`
    - New `metadata` property was introduced, which allows adding additional, custom logic to the activation condition of a highlighted element.

### RTL Support
- `igxSlider` have full right-to-left (RTL) support.

## 9.0.1
- **Breaking Changes**
    - Remove `$base-color` from igx-typography. The igx-typography class now inherits the parent color.

## 9.0.0

### General
- Added support for the Ivy renderer.
- **Breaking Changes** The following classes and enumerators have been renamed. Using `ng update` will apply automatically migrate your project to use the new names.
    - `IgxDropDownBase` -> `IgxDropDownBaseDirective`
    - `IgxDropDownItemBase` -> `IgxDropDownItemBaseDirective`
    - `IgxGridBaseComponent` -> `IgxGridBaseDirective`
    - `IgxRowComponent` -> `IgxRowDirective`
    - `IgxHierarchicalGridBaseComponent` -> `IgxHierarchicalGridBaseDirective`
    - `IgxMonthPickerBase` -> `IgxMonthPickerBaseDirective`
    - `AvatarType` -> `IgxAvatarType`
    - `Size` -> `IgxAvatarSize`
    - `Type` -> `IgxBadgeType`
    - `SliderType` -> `IgxSliderType`
    - `TabsType` -> `IgxTabsType`

- **Breaking Changes** Due to a breaking change in Angular 9 with Ivy, Hammer providers are no longer included by default. You can find more information at: https://github.com/angular/angular/blob/master/CHANGELOG.md#breaking-changes-9 . Because of this change the following components require `HammerModule` to be imported in the root module of the application in order for user interactions to work as expected:
    - `IgxSlider`

    The following components require `HammerModule` to be imported in the root module of the application so that their **touch** interactions work as expected:
    - `igxGrid`
    - `igxHierarchicalGrid`
    - `igxTreeGrid`
    - `igxList`
    - `igxNavigationDrawer`
    - `igxTimePicker`
    - `igxMonthPicker`
    - `igxSlider`
    - `igxCalendar`
    - `igxDatePicker`
    - `igxCarousel`

- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - **Breaking Change** - Hierarchical grid children no longer use the same `IgxTransactionService` instance and transaction handling should be modified to address each grid's transactions separately.
    - **Behavioral Change** - Pinning columns is no longer automatically prevented when the pinning area would exceed the size of the grid.
    - **Breaking Change** - The following input and output have been deprecated for the `igxHierarchicalGrid` and will be removed in future versions:
        - `hierarchicalState` -> `expansionStates` should be used instead.
        - `hierarchicalStateChange` -> `expansionStatesChange` should be used instead.

    - `igxGridState` directive added to make it easy for developers to save and restore the grid state. The directive exposes the `getState` and `setState` methods to save/restore the state and an `options` input property to exclude features.
- `IgxCarousel`:
    - **Breaking Changes** -The carousel slides are no longer array, they are changed to QueryList.
    - **Behavioral change** - When slides are more than 5, a label is shown instead of the indicators. The count limit of visible indicators can be changed with the input `maximumIndicatorsCount`
- `IgxAvatar`:
    - **Breaking Changes** - renamed the `default` enumeration member to `custom` in `IgxAvatarType`;
- `IgxBadge`:
    - **Breaking Changes** - renamed the `default` enumeration member to `primary` in `IgxBadgeType`;
- `IgxCard`:
    - **Breaking Changes** - renamed the `default` enumeration member to `elevated` in `IgxCardType`;
    - **Breaking Changes** - renamed the `default` enumeration member to `start` in `IgxCardActionsLayout`;
- `IgxDivider`:
    - **Breaking Changes** - renamed the `default` enumeration member to `solid` in `IgxDividerType`;
    - **Breaking Changes** - renamed the `isDefault` getter to `isSolid`;
- `IgxProgress`:
    - **Breaking Changes** - renamed the `danger` enumeration member to `error` in `IgxProgressType`;
    - **Breaking Changes** - renamed the `danger` getter to `error`;
- `IgxTabs`:
    - **Breaking Changes** - The `tabsType` input property has been renamed to `type`. It should get renamed in your components via `ng update`;
- `igxOverlay`:
    - **Behavioral Change** - `igxOverlay` - no longer persists element scrolling `out of the box`. In order to persist an element scroll position after attaching the element to an overlay, handle the exposed `onAppended` overlay event and manage/restore the scroll position.

### New Features
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`:
    - Master-Detail visualization added for `igxGrid`. Users may now define templates that show additional context for rows when expanded. For more information, please take a look at the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/master-detail).
    - `sortStrategy` input is added, which can be used to set a global sorting strategy for the entire grid.
        (**NOTE**: The grid's `sortStrategy` is of different type compared to the column's `sortStrategy`.)
    - `NoopSortingStrategy` is added, which can be used to disable the default sorting of the grid by assigning its instance to the grid's `sortStrategy` input. (Useful for remote sorting.)
    - `NoopFilteringStrategy` is added, which can be used to disable the default filtering of the grid by assigning its instance to the grid's `filterStrategy` input. (Useful for remote filtering.)
    - `sortingExpressionsChange` event emitter is added, which is fired whenever a change to the sorting expressions has occurred (prior to performing the actual sorting).
    - `filteringExpressionsTreeChange` event emitter is added, which is fired whenever a change to the filtering expressions has occurred (prior to performing the actual filtering).
    - `advancedFilteringExpressionsTreeChange` event emitter is added, which is fired whenever a change to the advanced filtering expressions has occurred (prior to performing the actual filtering).
    - `collapsible` and `expanded` properties are added to the IgxColumnGroupComponent; `collapsible` property identifies that certain column group is collapsible; `expanded` identifies whether the group is expanded or collapsed initially;
    - `collapsibleChange` and `expandedChange` events are added to the IgxColumnGroupComponent which are emitted whenever `collapsible` and `expanded` properties are changed accordingly;
    - `visibleWhenCollapsed` property has been added to the IgxColumnComponent; Allows you to set whether the column stay visible when its parent is collapsed.
    - `visibleWhenCollapsedChange` events is added to the IgxColumnComponent which are emitted whenever `visibleWhenCollapsed`  property is changed;
    - `collapsibleIndicatorTemplate` property is introduced to IgxColumnGroupComponent, which allows you to set a custom template for the expand collapse indicator;
    - `igxCollapsibleIndicator` directive has been introduced, which allows you to set a custom template for the expand collapse indicator;
    - `IgxGridExcelStyleFilteringComponent` and `IgxAdvancedFilteringDialogComponent` can now be hosted outside of the grid in order to provide the same experience as the built-in filtering UI.
    - `expandRow(rowID)`/`collapseRow(rowID)`/`toggleRow(rowID)` API methods are added for the `igxHierarchicalGrid`. They allow expanding/collapsing a row by its id.
    - `onRowToggle` event is added for the `igxHierarchicalGrid`. It is emitted when the expanded state of a row is changed.
    - `IgxRowDragGhost` directive is added. It allows providing a custom template for the drag ghost when dragging a row.
    ```html
    <igx-grid #grid1 [data]="remote | async" primaryKey="ProductID"
        [rowDraggable]="true">
        <igx-column field="ProductName"></igx-column>
        <igx-column field="ProductID"></igx-column>
        <igx-column field="UnitsInStock"></igx-column>
        <ng-template let-data igxRowDragGhost>
            <div>
                Moving {{data.ProductName}}!
            </div>
        </ng-template>
    </igx-grid>
    ```
- `IgxSlider`:
    - **Breaking Change** - `isContinuous` - input has been deleted. The option is not supported anymore.
    - `primaryTicks` input was added. Which sets the number of primary ticks
    - `secondaryTicks` input was added. Which sets the number of secondary ticks.
    - `showTicks` input was added. Which show/hide all slider ticks and tick labels.
    - `primaryTickLabels` input was added. Which shows/hides all primary tick labels.
    - `secondaryTickLabels` input was added. Shows/hides all secondary tick labels.
    - `ticksOrientation` input was added. Allows to change ticks orientation to top|bottom|mirror.
    - `tickLabelsOrientation` input was added. Allows you to change the rotation of all tick labels from horizontal to vertical(toptobottom, bottomtotop).
    - `igxSliderTickLabel` directive has been introduced. Allows you to set a custom template for all tick labels.
    - `onValueChanged` - new output has been exposed. This event is emitted at the end of every slide interaction.

- `IgxCarousel`:
    - `keyboardSupport` input is added, which can be used to enable and disable keyboard navigation
    - `gesturesSupport` input is added, which can be used to enable and disable gestures
    - `maximumIndicatorsCount` input is added, which can be used to set the number of visible indicators
    - `indicatorsOrientation` input is added, which can be used to set the position of indicators it can be top or bottom
    - `animationType` input is added, which can be used to set animation when changing slides
    - `indicatorTemplate` directive is added, which can be used to provide a custom indicator for carousel. If this property is not provided, a default indicator template will be used instead.
    - `nextButtonTemplate` directive is added, which is used to provide a custom next button template. If not provided, a default next button is used.
    - `prevButtonTemplate` directive is added, which is used to provide a custom previous button template. If not provided, a default previous button is used.

- `IgxSelect`:
    - adding `IgxSelectHeaderDirective` and `IgxSelectFooterDirective`. These can be used to provide a custom header, respectively footer templates for the `igxSelect` drop-down list. If there are no templates marked with these directives - no default templates will be used so the drop-down list will not have header nor footer.

- `IgxCombo`:
    - Added `displayText` property to the combo's `onSelectionChange` event args. The property contains the text that will be populated in the combo's text box **after** selection completes. This text can be overwritten in order to display a custom message, e.g. "3 items selected":
    ```html
    <igx-combo [data]="people" valueKey="id" displayKey="name" placeholder="Invite friends..." (onSelectionChange)="handleSelection($event)">
    ```
    ```typescript
    export class MyInvitationComponent {
        public people: { name: string; id: string }[] = [...];
        ...
        handleSelection(event: IComboSelectionChangeEventArgs) {
            const count = event.newSelection.length;
            event.displayText = count > 0 ? `${count} friend(s) invited!` : `No friends invited :(`;
        }
        ...
    }
    ```

- `IgxDropDown`:
    - `clearSelection` method is added, which can be used to deselect the selected dropdown item

- `IgxToggleDirective`:
    - `setOffset` method added. It offsets the content along the corresponding axis by the provided amount.

- `IgxOverlayService`:
    - `setOffset` method added. It offsets the content along the corresponding axis by the provided amount.

- `IgxCircularProgressBar`:
    - added `IgxProgressBarGradientDirective` to allow providing custom circular progress SVG gradients. Providing a custom gradient via a template is as easy as writing:
    ```html
    <igx-circular-bar [value]="77">
        <ng-template igxProgressBarGradient let-id>
            <svg:linearGradient [id]="id" gradientTransform="rotate(90)">
                <stop offset="0%"   stop-color="#05a"/>
                <stop offset="100%" stop-color="#0a5"/>
            </svg:linearGradient>
        </ng-template>
    </igx-circular-bar>
    ```
    - changed the `igx-progress-circular-theme` to accept a list of 2 colors for the `$progress-circle-color` argument, making it easier to modify the default gradient:
    ```scss
    $theme: igx-progress-circular-theme(
        $progress-circle-color: red blue
    );

    @include igx-progress-circular($theme);
    ```
    - RTL support

- `IgxForOf`
    - `IgxForTotalItemCount` input is added for the cases when the data is from remote services. This will allow setting the count of the items through the template. And gives the opportunity for the developers to use AsyncPipe for this option:
    ```html
    <ng-template igxFor let-item [igxForOf]="data | async" [igxForTotalItemCount]="count | async"
        [igxForContainerSize]="'500px'" [igxForItemSize]="'50px'"></ng-template>
    ```

## 8.2.6

### New Features
- `IgxSelectItem`
    - `text` input is added. By default, the Select component will display the selected item's element inner text. In cases with a more complex item template, where more than just text interpolation is used, set the text property to specify what to display in the select field when the item is selected.


## 8.2.4
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - The header text of the columns and the column groups now has the `title` attribute set to it in order to expose a native browser tooltip.

### RTL Support
Most of the components in the framework now have full right-to-left (RTL) support via the newly included RTL themes.

For CSS-based projects add `node_modules/igniteui-angular/styles/igniteui-angular-rtl.css` to your angular.json styles collection.

For Sass-based projects pass `$direction` to the `igx-core` mixin in your root stylesheet.

Example:
```scss
// $direction defaults to ltr if it's omitted.
@include igx-core($direction: rtl);
```
Currently the following components have only partial RTL support:
 - Grid (igx-grid)
 - Slider (igx-slider)
 - Tabs (igx-tabs)
 - Circular Progress Indicator (igx-circular-bar)

 We plan on adding support for the aforementioned components in the upcoming releases.

### New Features

- Columns now expose the `cellStyles` property which allows conditional styling of the column cells. Similar to `cellClasses` it accepts an object literal where the keys are style properties and the values are expressions for evaluation.
```typescript
styles = {
    color: '#123456',
    'font-family': 'monospace'
    'font-weight': (_, __, value) => value.startsWith('!') : 'red' : 'inherit'
};
```
The callback signature for both `cellStyles` and `cellClasses` is now changed to

```typescript
(rowData: any, columnKey: string, cellValue: any, rowIndex: number) => boolean
```

## 8.2.3
- `IgxTextHighlightDirective` - The default highlight directive styles have been moved to a Sass theme - `igx-highlight-theme`; You can modify the resting and active background and text color styles of the directive by passing the respective properties to the Sass theme. You can still pass your own CSS classes to the highlight directive via the cssClass and activeCssClass inputs.

- `IgxChip`
    - **Breaking Change** The `originalEvent` property for the events `onMoveStart`, `onMoveEnd`, `onClick` and `onSelection` now provides the events, passed from the `igxDrag` directive. The passed original events are in other words the previous events that triggered the `igxChip` ones. They also have original events until a browser event is reached.
- `IgxGrid` - Now you can access all grid data inside the custom column summary. Two additional optional parameters are introduced in the IgxSummaryOperand `operate` method.

```typescript
class MySummary extends IgxNumberSummaryOperand {
    constructor() {
        super();
    }
    operate(columnData: any[], allGridData = [], fieldName?): IgxSummaryResult[] {
        const result = super.operate(allData.map(r => r[fieldName]));
        result.push({ key: 'test', label: 'Total Discounted', summaryResult: allData.filter((rec) => rec.Discontinued).length });
        return result;
    }
}
```

## 8.2.0
### New theme
Ignite UI for angular now have a new theme that mimics Microsoft "Fluent" design system.
Depending on your use case you can use one of the following mixins:
`igx-fluent-theme` and `igx-fluent-dark-theme`

We also added two new palettes that go with the new theme, `$fluent-word-palette` and `$fluent-excel-palette`.

Next example shows how you can use the Fluent theme.

```scss
// Light version
.fluent-word-theme {
    @include igx-fluent-theme($fluent-word-palette);
}

// Dark version
.fluent-excel-dark-theme {
    @include igx-fluent-dark-theme($fluent-excel-palette);
}
```

### Theme Changes
`igx-badge-theme` - Removed the `$disable-shadow` property to mitigate confusion when specifying `$shadow` explicitly.

For more information about the theming please read our [documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes/index.html)

### New Features
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - Advanced Filtering functionality is added. In the advanced filtering dialog, you could create groups of conditions across all grid columns. The advanced filtering button is shown in the grid's toolbar when `allowAdvancedFiltering` and `showToolbar` properties are set to `true`. You could also open/close the advanced filtering dialog using the `openAdvancedFilteringDialog` and `closeAdvancedFilteringDialog` methods.
    - `uniqueColumnValuesStrategy` input is added. This property provides a callback for loading unique column values on demand. If this property is provided, the unique values it generates will be used by the Excel Style Filtering (instead of using the unique values from the data that is bound to the grid).
    - `[filterStrategy] - input that allows you to override the default filtering strategy`
    - `igxExcelStyleLoading` directive is added, which can be used to provide a custom loading template for the Excel Style Filtering. If this property is not provided, a default loading template will be used instead.
    - introduced new properties `cellSelection` and `rowSelection` which accept GridSelection mode enumeration. Grid selection mode could be none, single or multiple. Also `hideRowSelectors` property is added, which allows you to show and hide row selectors when row selection is enabled.
    - introduced functionality for templating row and header selectors - [spec](https://github.com/IgniteUI/igniteui-angular/wiki/Row-Selection-Templating-(Grid-feature))
    ```html
    <igx-grid [data]="data", [rowSelection]="'multiple'" primaryKey="ID">
        <igx-column field="Name"></igx-column>
        <igx-column field="Age"></igx-column>

        <ng-template igxHeadSelector let-headSelector>
            <igx-icon>done_all</igx-icon>
        </ng-template>
        <ng-template igxRowSelector let-rowContext>
            <igx-switch [checked]="rowContext.selected"></igx-switch>
        </ng-template>
    </igx-grid>
    ```
- `IgxHierarchicalGrid`
    - Row Islands now emit child grid events with an additional argument - `owner`, which holds reference to the related child grid component instance.
- `IgxDrag`
    - Dragging without ghost. Now it is possible to drag the base element `igxDrag` is instanced on by setting the new input `ghost` to false.
    - Ghost template. A custom ghost template reference can be provided on the new `ghostTemplate` input.
    - Dragging using a single or multiple handles. New `igxDragHandle` directive is exposed to specify a handle by which an element can be interacted with instead of the whole element `igxDrag` is instanced on.
    - Linking of drag and drop elements. This can be achieved by using the new provided `dragChannel` input, specifying each element to which channel it corresponds.
    - Drag animation improvements. Three new methods have been exposed in place of the old `animateToOrigin` input in order to provide more flexibility when wanting to have transition animation to specific position when dropping. `setLocation`, `transitionToOrigin` and `transitionTo` are all methods that provide a various way to animate a transition to a specific location for the dragged element.
    - New getters - `location` and `originLocation` to aid in applying transition animations.
    - New outputs - `dragMove`, `ghostCreate` and `ghostDestroy`
- `IgxDrop`
    - Linking of drag and drop elements. This can be achieved by using the new provided `dropChannel` input, specifying each drop area to which channel it corresponds.
    - Drop strategies. Three new drop strategies have been provided - Append, Prepend and Insert.  Also an input `dropStrategy` to the `igxDrop` which specify which strategy should be used when dropping an element inside the drop area. Custom one can be specified as well.
- `IgxCheckbox`
    - introduced a new `readonly` property that doesn't allow user interaction to change the state, but keeps the default active style. Intended for integration in complex controls that handle the interaction and control the checkbox instead through binding.
- `IgxOverlay`
    - introduced a new `ContainerPositionStrategy`. The new strategy positions the element inside the containing outlet based on the directions passed in trough PositionSettings.
- `IgxChip`
    - add `onSelectionDone` event that is triggered after all animations and transitions related to selection have ended.

### General
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - `isCellSelected` method has been deprecated. Now you can use `selected` property.
    - `rowSelectable` property has been deprecated. Now you can use `rowSelection` property to enable row selection and also you can show and hide the row selectors by setting `hideRowSelectors` property to true or false (which is the default value).
    - Removed deprecated event `OnFocusChange`
    - `IgxGridBaseComponent` exposes a new property, `dataView` that returns the currently transformed paged/filtered/sorted/grouped data, displayed in the grid
    - **Breaking Change** `igxExcelStyleSortingTemplate` directive is renamed to `igxExcelStyleSorting`.
    - **Breaking Change** `igxExcelStyleMovingTemplate` directive is renamed to `igxExcelStyleMoving`.
    - **Breaking Change** `igxExcelStyleHidingTemplate` directive is renamed to `igxExcelStyleHiding`.
    - **Breaking Change** `onRowSelectionChange` event arguments are changed. The `row` property has been removed and the properties `added`, `removed` and `cancel` are newly added.
    - **Breaking Change** `igxExcelStylePinningTemplate` directive is renamed to `igxExcelStylePinning`.
    - **Breaking Change** `onRowDragEnd` and `onRowDragStart` event arguments are changed - `owner` now holds reference to the grid component instance, while `dragDirective` hold reference to the drag directive.
    - **Behavioral Change** The behavior of the `isLoading` input no longer depends on the state of the data the grid binds to. Setting it to `true` now shows a loading indicator until it is disabled by the user.
- `IgxCombo`
    - Combo selection is now consistent when `valueKey` is defined. When `valueKey` is specified, selection is based on the value keys of the items. For example:
    ```html
    <igx-combo [data]="myCustomData" valueKey="id" displayKey="text"></igx-combo>
    ```
    ```typescript
    export class MyCombo {
        ...
        public combo: IgxComboComponent;
        public myCustomData: { id: number, text: string } = [{ id: 0, name: "One" }, ...];
        ...
        ngOnInit() {
            // Selection is done only by valueKey property value
            this.combo.selectItems([0, 1]);
        }
    }
    ```
   - **Breaking Change** When using `[valueKey]`, combo methods, events and outputs **cannot** be handled with *data item references*.
   - For more information, visit the component's [readme](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/combo/README.md)
- `IgxDrag`
    - Deprecated inputs - `hideBaseOnDrag`, `animateOnRelease`, `visible`.
    - Deprecated methods - `dropFinished`.
    - **Breaking Change** `ghostImageClass` input is renamed to `ghostClass`.
    - **Breaking Change** `dragGhostHost` input is renamed to `ghostHost`.
    - **Breaking Change** `returnMoveEnd` input is renamed to `transitioned`.
    - **Breaking Change** `onDragStart` output is renamed to `dragStart`.
    - **Breaking Change** `onDragEnd` output is renamed to `dragEnd`.

- `IgxDrop`
    - **Breaking Change** Default drop strategy is now changed to not perform any actions.
    - **Breaking Change** `onEnter` output is renamed to `enter`.
    - **Breaking Change** `onOver` output is renamed to `over`.
    - **Breaking Change** `onLeave` output is renamed to `leave`.
    - **Breaking Change** `onDrop` output is renamed to `dropped`.
    - **Breaking Change** Interfaces `IgxDropEnterEventArgs`, `IgxDropLeaveEventArgs` are both now called `IDropBaseEventArgs`.
    - **Breaking Change** Interfaces `IgxDropEventArgs` is renamed to `IDropDroppedEventArgs`.
    - **Breaking Change** Outputs `enter`, `over`, `leave`(former `onEnter`, `onOver`, `onLeave`) now have arguments of type `IDropBaseEventArgs`
    - **Breaking Change** Output `dropped` (former `onDrop`) now have arguments of type `IDropDroppedEventArgs`

## 8.1.4
- `IgxDialog` new @Input `positionSettings` is now available. It provides the ability to get/set both position and animation settings of the Dialog component.

## 8.1.3
- `IgxCombo`
    - Combo `onSelectionChange` events now emits the item(s) that were added to or removed from the collection:
    ```html
    <igx-combo (onSelectionChange)="handleChange($event)">
    ```
    ```typescript
        export class Example {
            ...
            handleChange(event: IComboSelectionChangeEventArgs) {
            console.log("Items added: ", [...event.added]); // the items added to the selection in this change
            console.log("Items removed: ", [...event.removed]); // the items removed from the selection in this change
            }
        }
    ```

## 8.1.2

### New Features
- `IgxDatePicker`
    - `valueChange` event is added.

## 8.1.0

### New Features
- `IgxBottomNav` now supports an `igx-tab` declaration mode. When in this mode, panels declarations are not accepted and tab items' content is not rendered.
    - You can use this mode to apply directives on the tab items - for example to achieve routing navigation.
    - You are allowed to customize tab items with labels, icons and even templates.
- `IgxTabs` now supports an `igx-tab-item` declaration mode. When in this mode, groups declarations are not accepted and tab items' content is not rendered.
    - You can use this mode to apply directives on the tab items - for example to achieve routing navigation.
    - You are allowed to customize tab items with labels, icons and even templates.
- `IgxGrid`
    - **Behavioral Change** - paging now includes the group rows in the page size. You may find more information about the change in the [GroupBy Specification](https://github.com/IgniteUI/igniteui-angular/wiki/Group-By-Specification)
    - `IgxColumnGroup`
        - Re-templating the column group header is now possible using the `headerTemplate` input property or the `igxHeader` directive.
    - `igx-grid-footer`
        - You can use this to insert a custom footer in the grids.
         ```html
        <igx-grid>
            <igx-grid-footer>
                Custom content
            </igx-grid-footer>
        </igx-grid>
        ```
- `igx-paginator`
    - Replaces the current paginator in all grids. Can be used as a standalone component.
      <br/>Have in mind that if you have set the `paginationTemplate`, you may have to modify your css to display the pagination correctly. The style should be something similar to:
      ```
      .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
       }
       ```
- `IgxCombo`
    - Input `[overlaySettings]` - allows an object of type `OverlaySettings` to be passed. These custom overlay settings control how the drop-down list displays.
- `IgxForOf` now offers usage of local variables `even`, `odd`, `first` and `last` to help with the distinction of the currently iterated element.


## 8.0.2
- `igx-list-theme` now have some new parameters for styling.
    - $item-background-hover - Change The list item hover background
    - $item-text-color-hover - Change The list item hover text color.

    - $item-subtitle-color - Change The list item subtitle color.
    - $item-subtitle-color-hover - Change The list item hover subtitle color.
    - $item-subtitle-color-active - Change The active list item subtitle color.

    - $item-action-color - Change The list item actions color.
    - $item-action-color-hover - Change The list item hover actions color.
    - $item-action-color-active - Change The active list item actions color.

    - $item-thumbnail-color - Change The list item thumbnail color.
    - $item-thumbnail-color-hover - Change The list item hover thumbnail color.
    - $item-thumbnail-color-active - Change The active list item thumbnail color.

- **Behavioral Change** default min column width is changed according the grid display density property:
    - for `DisplayDensity.comfortable` defaultMinWidth is `80px`;
    - for `DisplayDensity.cosy` defaultMinWidth is `64px`;
    - for `DisplayDensity.compact` defaultMinWidth is `56px`;
Now you can set `minWindth` for a column to a value smaller than `defaultMinWidth` value.

## 8.0.1

- **General**
    - Importing ES7 polyfill for Object (`'core-js/es7/object'`) for IE is no longer required.

### New Features
- `IgxDropDown` now supports `DisplayDensity`.
    - `[displayDensity]` - `@Input()` added to the `igx-drop-down`. Takes prevelance over any other `DisplayDensity` provider (e.g. parent component or `DisplayDensityToken` provided in module)
    - The component can also get it's display density from Angular's DI engine (if the `DisplayDensityToken` is provided on a lower level)
    - Setting `[displayDensity]` affects the control's items' and inputs' css properties, most notably heights, padding, font-size
    - Available display densities are `compact`, `cosy` and `comfortable` (default)
    - **Behavioral Change** - default `igx-drop-down-item` height is now `40px` (down from `48px`)
- `IgxCombo` - Setting `[displayDensity]` now also affects the combo's items
    - **Behavioral Changes**
    - `[itemHeight]` defaults to `40` (`[displayDensity]` default is `comfortable`)
    - `[itemsMaxHeight]` defaults to `10 * itemHeight`.
    - Changing `[displayDensity]` or `[itemHeight]` affect the drop-down container height if `[itemsMaxHeight]` is not provided
    - Setting `[itemHeight]` overrides the height provided by the `[displayDensity]` input
- `IgxSelect`- Setting `[displayDensity]` now also affects the select's items
    - **Behavioral Change** - default `igx-select-item` height is now `40px` (down from `48px`)
- `IgxChip`
    - `hideBaseOnDrag` input is added that allow the chip base that stays at place to be visible while dragging it.
    - `animateOnRelease` input is added that allows to disable the animation that returns the chip when the chip is released somewhere.
- `IgxTransaction` - `getState` accepts one optional parameter `pending` of `boolean` type. When `true` is provided `getState` will return `state` from pending states. By default `getState` is set to `false`.

## 8.0.0
- `Theming`: Add component schemas for completely round and completely square variations. Can be mixed with the existing light and dark component schemas. For instance:
    ```scss
        $light-round-input: extend($_light-input-group, $_round-shape-input-group);
    ```
There are also prebuilt schema presets for all components (light-round/dark-round and light-square/dark-square), namely `$light-round-schema, $light-dark-schema, $light-square-schema, $dark-square-schema`;
- `IgxCombo`: Removed the following deprecated (since 6.2.0) template selectors:
    - `#emptyTemplate`
    - `#headerTemplate`
    - `#footerTemplate`
    - `#itemTemplate`
    - `#addItemTemplate`
    - `#headerItemTemplate`
- `igxTimePicker` and `igxDatePicker`
    - `openDialog()` now has an optional `[target: HTMLElement]` parameter. It's used in `mode="dropdown"` and the drop down container is positioned according to the provided target.
    - The custom drop down template target is no longer marked with `#dropDownTarget`, instead it's provided as an `HTMLElement` to the `openDialog()` method.
    - By default, the `igxDatePicker` drop down target is changed from the `igxInput` element to the `igxInputGroup` element.
    - `onClosing` event is added.
    - **Breaking Change** `onOpen` event is renamed to `onOpened`.
    - **Breaking Change** `onClose` event is renamed to `onClosed`.
    - **Behavioral Change** - action buttons are now available in the dropdown mode.
    - **Feature** `igxDatePicker` and `igxTimePicker` now provide the ability for adding custom action buttons. Read up more information in [igxDatePicker ReadMe](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/date-picker/README.md) or [igxTimePicker ReadMe](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/time-picker/README.md)
- `IgxToggleAction` / `IgxTooltip`: Removed the deprecated `closeOnOutsideClick` Input that has been superseded by `overlaySettings` in 6.2.0.

- `IgxList` - The list component has been refactored. It now includes several new supporting directives:
    - `igxListThumbnail` - Use it to mark the target as list thumbnail which will be automatically positioned as a first item in the list item;
    - `igxListAction` - Use it to mark the target as list action which will be automatically positioned as a last item in the list item;
    - `igxListLine` - Use it to mark the target as list content which will be automatically positioned between the thumbnail and action;
    - `igxListLineTitle` - Use it to mark the target as list title which will be automatically formatted as a list-item title;
    - `igxListLineSubTitle` - Use it to mark the target as list subtitle which will be automatically formatted as a list-item subtitle;

    ```html
        <igx-list>
            <igx-list-item [isHeader]="true">List items</igx-list-item>
            <igx-list-item>
              <igx-avatar igxListThumbnail></igx-avatar>
              <h1 igxListLineTitle>List item title</h1>
              <h3 igxListLineSubTitle>List item subtitle</h3>
              <igx-icon igxListAction>info</igx-icon>
            </igx-list-item>
        </igx-list>

        <igx-list>
          <igx-list-item [isHeader]="true">List items</igx-list-item>
          <igx-list-item>
            <igx-avatar igxListThumbnail></igx-avatar>
            <span igxListLine>Some content</span>
            <igx-icon igxListAction>info</igx-icon>
          </igx-list-item>
        </igx-list>
    ```
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - **Breaking Change** The **condition** parameter of the `filterGlobal` method is no longer optional. When the filterGlobal method is called with an invalid condition, it will not clear the existing filters for all columns.


## 7.3.4
- `IgxGrid` - summaries
    - `clearSummaryCache()` and `recalculateSummaries()` methods are now removed from the IgxGrid API, beacause they are no longer needed; summaries are updated when some change is perform and the summary cache is cleared automatically when needed;
- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - **Breaking Change** The **condition** parameter of the `filterGlobal` method is no longer optional. When the filterGlobal method is called with an invalid condition, it will not clear the existing filters for all columns.

### New feature
- `igxSlider` - exposing new `labels` property accepting a collection of literal values that become equally spread over the slider, by placing each element as a thumb label.
- `igxSlider` - deprecate **isContiunous** property.
- `IgxChip`
    - `hideBaseOnDrag` input is added that allow the chip base that stays at place to be visible while dragging it.
    - `animateOnRelease` input is added that allows to disable the animation that returns the chip when the chip is released somewhere.

- `igxTimePicker` changes
    - `onClosing` event is added.
    - **Breaking Change** `onOpen` event is renamed to `onOpened`.
    - **Breaking Change** `onClose` event is renamed to `onClosed`.
    - **Behavioral Change** - action buttons are now available in the dropdown mode.
    - **Feature** `IgxTimePickerComponent` now provides the ability for adding custom action buttons. Read up more information in the [ReadMe](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/time-picker/README.md)

- `igxDatePicker` changes
    - `onClosing` event is added.
    - **Breaking Change** `onOpen` event is renamed to `onOpened`.
    - **Breaking Change** `onClose` event is renamed to `onClosed`.
    - **Behavioral Change** - action buttons are now available in the dropdown mode.
    - **Feature** `IgxDatePickerComponent` now provides the ability for adding custom action buttons. Read up more information in the [ReadMe](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/date-picker/README.md)

- Excel-Style Filtering and Quick Filtering user interfaces now display the date picker's calendar in a dropdown.
- `IgxCard` - The card component has been refactored. It now includes several new supporting components/directives:
    - `igxCardHeaderTitle` - tag your headings placed in the `igx-card-header` container to be displayed as a card title;
    - `igxCardHeaderSubtitle` - tag your headings placed in the `igx-card-header` container to be displayed as a card subtitle;
    - `igxCardThumbnail` - tag anything placed in the `igx-card-header` as a thumb to be placed to the left of your titles;
    - `igx-card-header` - the card header can now detect and automatically position `igx-avatar`s placed in it;
    - `igx-card-media` - wrap images or videos that will be automatically sized for you;
    - `igx-card-actions` - the card actions can now detect and automatically position all `igxButton`s placed in it;
    - The card has a new `type` property. It can be set to `outlined` to get the new outlined card look;
    - The card has a new `horizontal` property. When set to true, the layout will become horizontally aligned;
- New Directive `igx-divider` - The igx-divider is a thin, configurable line that groups content in lists and layouts.
- `IgxDropDown` now supports `DisplayDensity`.
    - `[displayDensity]` - `@Input()` added to the `igx-drop-down`. Takes prevalance over any other `DisplayDensity` provider (e.g. parent component or `DisplayDensityToken` provided in module)
    - The component can also get it's display density from Angular's DI engine (if the `DisplayDensityToken` is provided on a lower level)
    - Setting `[displayDensity]` affects the control's items' and inputs' css properties, most notably heights, padding, font-size
    - Available display densities are `compact`, `cosy` and `comfortable` (default)
    - **Behavioral Change** - default item `igx-drop-down-item` height is now `40px` (down from `48px`)
- `IgxCombo` - Setting `[displayDensity]` now also affects the combo's items
    - Setting `[itemHeight]` overrides the height provided by the `[displayDensity]` input
- `IgxSelect`- Setting `[displayDensity]` now also affects the select's items

### Bug Fixing
- igx-input: Top of Japanese characters get cut off in Density Compact mode #4752
- When no condition is provided, filter() method of grid throws undescriptive error #4897
- [IE11][igx-grid][MRL] header cell is not row-spanned. #4825
- Select's label is positioned incorrectly #4236
- [igx-grid] Filtering row's chips area is not resized when resizing window. #4906
- `hideGroupedColumns` hides the whole MRL group #4714
- An error is returned when changing rowEditable input and a cell is opened in edit mode #4950
- Row editing border style is not applied correctly for the first record when there is grouping #4968
- Cell navigation does not work along with Multi Row Layout group #4708
- When no condition is provided, filter() method of grid throws undescriptive error #4897
- In slider with type Range when change the lower value to be equal or greater than the upper the range is not correct #4562
- When change the slider type at run time the slider is not updated correctly #4559
- Range Slider Thumps collapsing #2622
- Angular httpinterceptor(jwt token header) not working after importing IgxTreeGridModule in lazy loaded module #4285
- [igx-grid] "quick clicking twice resizer " can sometimes lead to unable to sort. #4858
- TimePicker "hour mode" #4679

## 7.3.3

- `igx-core()` now includes some styles for printing layout.
In order to turn them off, you need to pass an argument and set it to `false`
    ```
        @include igx-core($print-layout: false);
    ```

- `Pager`
    - **Behavioral Change** - The pager is now hidden when there are no records in the grid.

### Bug fixes
- Row editing styles are not applied correctly within multi row layout grid #4859
- Provide a way to animate row drag, when it is released #4775
- There is lag on checking/unchecking an item in an Excel Style Filter with a lot of items #4862
- Make dragIndicatorIconTemplate @ContentChild in the igxHierarchicalGrid #4769
- Add PostDeploy.ps1 script into the repo #4887
- Provide a way to animate row drag, when it is released #4775
- Feature-request: IgxGrid improve Printing Experience #1995
- When column is scrolled and open excel filter, its position is not correct #4898
- IgxCombo is not properly clearing subscription #4928
- "(Blanks)" appears unchecked on reopening the ESF UI if the underlying value is an empty string. #4875
- [igx-tree-grid] loading indicator not shown in IE11 #4754
- Filtering conditions drop down does not behave consistently when the button that opens it is clicked multiple times #4470

## 7.3.2

### Bug Fixes
- Time picker component fails on dropdown mode in combination with igxTimePickerTemplate modifications #4656
- In IE11 when chips length is bigger then filter row scrolls position is not correct #4699
- Not able to change filter option in excel style filter. #4347
- [igx-grid] rendering performance becomes extremely poor when binding data after initialization. #4839
- Group comparer is not taken into consideration when column is dragged to grouped area #4663

## 7.3.1
`igx-core()` now includes some styles for printing layout. In order to turn them off, you need to pass an argument and set it to `false`

```
@include igx-core($print-layout: false);
```
- `IgxGrid` Custom keyboard navigation
    - `onFocusChange` event is deprecated.
    - `onGridKeydown` event is exposed which is emitted when `keydown` is triggered over element inside grid's body
    - `navigateTo` method allows you to navigate to a position in the grid based on provided `rowindex` and `visibleColumnIndex`, also to execute a custom logic over the target element through a callback function that accepts `{ targetType: GridKeydownTargetType, target: Object }`
    - `getNextCell` returns `ICellPosition` which defines the next cell, according to the current position, that match specific criteria. You can pass callback function as a third parameter of `getPreviousCell` method
    - `getPreviousCell` returns `ICellPosition` which defines the previous cell, according to the current position, that match specific criteria. You can pass callback function as a third parameter of `getPreviousCell` method.
    - `IgxTransactionService` now can `commit` and `clear` transaction(s) by record id with an optional parameter. The `commit` method will apply to the data all transactions for the provided `id`. The `clear` method will remove all transactions for the `id` from the transactions log. Additionally both will remove all actions from the undo stack matching the provided `id`.

### Bug fixes
- The ESF animations for opening and closing do not work #4834
- IgxButtonGroup does not respect compact styles #4840
- Not able to change filter option in excel style filter. #4347
- Broken links enhancements #4830
- rowDraggable is applied to grids from all hierarchical levels in hierarchical grid #4789
- [igx-grid][IE11] filtering problems with IME mode. #4636
- Filtering operation crashes when applying filter on a column with many unique values. #4723
- Emit onColumnVisibilityChanged when hiding a column through ESF UI. #4765 #4792
- onColumnVisibilityChanged event is not fired when hiding a column through ESF. #4765
- "Select All" should not be treated as a match when searching. #4020
- Opening the ESF dialog throws an error #4737
- Recalculate igxfor sizes for excel style search list on after view init #4804
- igx-grid: Incorrect height calculation when setting height in percent and binding empty data. #3950
- When grid width is less than 400px and open filter row the arrows for chips are previewed #4700
- Canceling onRowDragStart leaves the drag ghost in the DOM #4802

## 7.3.0

### Features
- `igxGrid`
    - **Feature** `igxGridComponent` now supports [Multi Row Layouts](https://github.com/IgniteUI/igniteui-angular/wiki/Grid---Multi-Row-Layout). It is configured with the newly added `IgxColumnLayoutComponent` and the columns in it. `IgxColumnComponent` now expose four new fields to determine the size and the location of the field into the layout:
        - [`colStart`](https://www.infragistics.com/products/ignite-ui-angular/docs/typescript/latest/classes/igxcolumncomponent#colstart) - column index from which the field is starting. This property is **mandatory**.
         - [`rowStart`](https://www.infragistics.com/products/ignite-ui-angular/docs/typescript/latest/classes/igxcolumncomponent.html#rowstart) - row index from which the field is starting. This property is **mandatory**.
         - [`colEnd`](https://www.infragistics.com/products/ignite-ui-angular/docs/typescript/latest/classes/igxcolumncomponent.html#colend) - column index where the current field should end. The amount of columns between colStart and colEnd will determine the amount of spanning columns to that field. This property is **optional**. If not set defaults to `colStart + 1`.
         - [`rowEnd`](https://www.infragistics.com/products/ignite-ui-angular/docs/typescript/latest/classes/igxcolumncomponent.html#rowend) - row index where the current field should end. The amount of rows between rowStart and rowEnd will determine the amount of spanning rows to that field. This property is **optional**. If not set defaults to `rowStart + 1`.
         ```html
        <igx-column-layout>
             <igx-column [rowStart]="1" [colStart]="1" field="Country"></igx-column>
             <igx-column [rowStart]="1" [colStart]="2" field="City"></igx-column>
             <igx-column [rowStart]="2" [colStart]="1" [colEnd]="3" field="Address"></igx-column>
        </igx-column-layout>
        ```
- `igxGrid`, `igxTreeGrid`, `igxHierarchicalGrid`
    - **Feature** Grid components now supports [Grid Row Dragging ](https://github.com/IgniteUI/igniteui-angular/wiki/Row-Dragging). It lets users pass the data of a grid record on to another surface, which has been configured to process/render this data. It can be enabled by using the `rowDraggable` input of the grid.

    - **Feature** The Excel Style Filter dialog and its sub-dialogs now have a display density based on the `displayDensity` input of their respective grid.
- `igxTreeGrid`
    - **Feature** The `IgxTreeGridComponent` now supports loading child rows on demand using the newly added `loadChildrenOnDemand` and `hasChildrenKey` input properties.
- `IgxListComponent`
    - **Feature** The `IgxListComponent` now provides the ability to choose a display density from a predefined set of options: **compact**, **cosy** and **comfortable** (default one). It can be set by using the `displayDensity` input of the list.
- `igxButton`
    - **Feature** The `igxButton` now provides the ability to choose a display density from a predefined set of options: **compact**, **cosy** and **comfortable** (default one). It can be set by using the `displayDensity` input of the button directive.
- `igxButtonGroup`
    - **Feature** The `igxButtonGroup` now provides the ability to choose a display density from a predefined set of options: **compact**, **cosy** and **comfortable** (default one). It can be set by using the `displayDensity` input of the button group. The buttons within the group will have the same density as the button group. If a button has the `displayDensity` set in the template, it is not changed by the density of the group where the button is placed.
- `igxGrid`, `igxTreeGrid`, `igxHierarchicalGrid`
    - **Feature** The Excel Style Filter dialog and its sub-dialogs now have a display density based on the `displayDensity` input of their respective grid.
- `IgxDropDown`
    - now supports virtualized items. Use in conjunction with `IgxForOf` directive, with the following syntax, to display very large list of data:
    ```html
    <igx-drop-down>
        <div class="wrapping-div">
            <igx-drop-down *igxFor="let item of localItems; index as index; scrollOrientation: 'vertical'; containerSize: itemsMaxHeight; itemSize: itemHeight;"
            [value]="item" [index]="index">
                {{ item.data }}
            </igx-drop-down>
        </div>
    </igx-drop-down>
    ```

### Bug Fixes
- Grid remains in pending state after commiting row edit w/o changes #4680
- Filter condition dropdown is not closed on tab navigation #4612
- When filter row is opened navigating with shift and tab on first cell does not selects the cancel button #4537
- Focus is not moved from the filter row to the summary row when the grid has no records #4613
- igx-carousel problem with lost focus #4292
- List items are shifted down on search if the list was scrolled down beforehand. #4645
- [igx-grid] some cells are not rendered when resizing window. #4568
- [igx-grid] after being grouped then resized, horizontal scrolling causes column header misalignment with data cell #4648
- Cells content is misaligned when group by a column and scroll horizontal #4720
- When hide/show columns the grid has empty space #4505

## 7.2.12

- `IgxGrid`, `IgxTreeGrid`, `IgxHierarchicalGrid`
    - **Breaking Change** The **condition** parameter of the `filterGlobal` method is no longer optional. When the filterGlobal method is called with an invalid condition, it will not clear the existing filters for all columns.

- `IgxGrid` - summaries
    - `clearSummaryCache()` and `recalculateSummaries()` methods are now removed from the IgxGrid API, beacause they are no longer needed; summaries are updated when some change is perform and the summary cache is cleared automatically when needed;

### New features
- **igxSlider** - exposing new `labels` property accepting a collection of literal values that become equally spread over the slider, by placing each element as a thumb label.
- **igxSlider** - deprecate **isContiunous** property.
- `IgxDropDown` now supports `DisplayDensity`.
    - `[displayDensity]` - `@Input()` added to the `igx-drop-down`. Takes prevelance over any other `DisplayDensity` provider (e.g. parent component or `DisplayDensityToken` provided in module)
    - The component can also get it's display density from Angular's DI engine (if the `DisplayDensityToken` is provided on a lower level)
    - Setting `[displayDensity]` affects the control's items' and inputs' css properties, most notably heights, padding, font-size
    - Available display densities are `compact`, `cosy` and `comfortable` (default)
    - **Behavioral Change** - default item `igx-drop-down-item` height is now `40px` (down from `48px`)
- `IgxCombo` - Setting `[displayDensity]` now also affects the combo's items
    - Setting `[itemHeight]` overrides the height provided by the `[displayDensity]` input
- `IgxSelect`- Setting `[displayDensity]` now also affects the select's items

### Bug Fixes
- In slider with type Range when change the lower value to be equal or greater than the upper the range is not correct #4562
- When change the slider type at run time the slider is not updated correctly #4559
- Range Slider Thumps collapsing #2622
- When no condition is provided, filter() method of grid throws undescriptive error #4897
- [igx-grid] Filtering row's chips area is not resized when resizing window. #4906
- Add PostDeploy.ps1 script into the repo #4887
- An error is returned when a row is opened in edit mode and click to search the next item #4902
- [igx-grid] "quick clicking twice resizer " can sometimes lead to unable to sort. #4858
- Child summaries disappears when edit a cell and press tab on click on cell in same row when rowEditable is true #4949
- When no condition is provided, filter() method of grid throws undescriptive error #4897

## 7.2.11

### Bug fixes
- When column is scrolled and open excel filter, its position is not correct #4898
- "(Blanks)" appears unchecked on reopening the ESF UI if the underlying value is an empty string. #4875
- There is lag on checking/unchecking an item in an Excel Style Filter with a lot of items #4862
- Group comparer is not taken into consideration when column is dragged to grouped area #4663
- Filtering conditions drop down does not behave consistently when the button that opens it is clicked multiple times #4470

## 7.2.10

### Features
- Condense grid summaries #4694

### Bug Fixes
- When grid width is less than 400px and open filter row the arrows for chips are previewed #4700
- Time picker component fails on dropdown mode in combination with igxTimePickerTemplate modifications #4656
- In IE11 when chips length is bigger then filter row scrolls position is not correct #4699
- The ESF animations for opening and closing do not work #4834
- Not able to change filter option in excel style filter. #4347
- [igx-grid] rendering performance becomes extremely poor when binding data after initialization. #4839

## 7.2.9
`igx-core()` now includes some styles for printing layout.
In order to turn them off, you need to pass an argument and set it to `false`

```
 @include igx-core($print-layout: false);
```

- `Pager`
    - **Behavioral Change** - The pager is now hidden when there are no records in the grid.

### Bug fixes
- ElasticPositionStrategy should resize shown element with Center/Middle directions #4564
- onColumnVisibilityChanged event is not fired when hiding a column through ESF. #4765
- Filtering operation crashes when applying filter on a column with many unique values. #4723
- "Select All" should not be treated as a match when searching. #4020
- igx-grid: Incorrect height calculation when setting height in percent and binding empty data. #3950
- Error is thrown when press escape in the filter row #4712
- Opening the ESF dialog throws an error #4737
- [igx-grid][IE11] "Error: ViewDestroyedError: Attempt to use a destroyed view: detectChanges" is thrown when closing filtering row. #4764
- [igx-grid] some cells don't go into edit state or selected state when resizing window. #4746
- igx-tree-grid when no data in grid pagination shows wrong #4666
- ElasticPositionStrategy should resize shown element with Center/Middle directions #4564
- ESF custom dialog new filter not fully visible #4639
- igx-grid: row virtualization doesn't work when setting height in percent if you fetch and bind data after initial rendering. #3949
- Grid height is calculated wrongly as grid width narrows #4745
- [igx-grid][IE11] filtering problems with IME mode. #4636

## 7.2.8
- `IgxGrid` Custom keyboard navigation
    - `onFocusChange` event is deprecated.
    - `onGridKeydown` is exposed. The event will emit
    `IGridKeydownEventArgs { targetType: GridKeydownTargetType; target: Object; event: Event; cancel: boolean; }`
    - `navigateTo(rowIndex: number, visibleColumnIndex: number, callback({targetType, target: Object }))` - this method allows you to navigate to a position in the grid based on provided `rowindex` and `visibleColumnIndex`;
    - `getNextCell(currentRowIndex, currentvisibleColumnIndex, callback(IgxColumnComponent))` - returns `{ rowIndex, visibleColumnIndex }` which defines the next cell, that match specific criteria according to the current position
    - `getPreviousCell(currentRowIndex, currentvisibleColumnIndex, callback(IgxColumnComponent))` - returns `{ rowIndex, visibleColumnIndex }` which defines the previous cell, that match specific criteria according to the current position

### Bug Fixes
- Grid remains in pending state after commiting row edit w/o changes #4680
- Filter condition dropdown is not closed on tab navigation #4612
- When filter row is opened navigating with shift and tab on first cell does not selects the cancel button #4537
- Focus is not moved from the filter row to the summary row when the grid has no records #4613
- igx-carousel problem with lost focus #4292
- List items are shifted down on search if the list was scrolled down beforehand. #4645
- [igx-grid] some cells are not rendered when resizing window. #4568
- [igx-grid] after being grouped then resized, horizontal scrolling causes column header misalignment with data cell #4648
- Cells content is misaligned when group by a column and scroll horizontal #4720
- When hide/show columns the grid has empty space #4505

## 7.2.7

### Bug fixes
- Custom filter dialog Excel-Style Filtering does not save the selected operand #4548
- Wrong endEdit call on data operation pipes subscribe #4313
- TreeGrid does not have default loading template #4624
- [igx-grid] Question about resizing behavioral change after v7.2.1. #4610
- [igx-grid] onSelection event comes to emit after ending edit mode. #4625
- Error is thrown when trying to open datepicker with Space key in IE #4495
- DatePicker dropdown overlaps the input when it appears top #4526
- Custom filter dialog of the Excel-style Filtering does not display the selected condition in the correct format #4525
- [igx-grid] group row is duplicated when collapsing all and then expanding a group row. #4650
- Fix scroll wheel tests due to creating wheel event with deltaY sets also wheelDeltaY (PR #4659)
- Update Canonical and HrefLang links for EN and JP environments #4674
- In the Drag and Drop dev sample the background color is not changed in IE and Edge #4597

## 7.2.6
- `igxGrid`
    - **Feature** The `groupsRecords` property now returns the full grouping tree as in 7.1 and also includes the grouping information for all pages.

### Bug Fixes
- Unreadable icon color when icon is used as a tooltip target with dark-theme #4477
- [igx-tabs] Selection indicator is not resized correctly #4420
- Faulty urls in Typescript #4546
- igx-list theme docs #4390
- Filtering conditions drop down does not behave consistently when the button that opens it is clicked multiple times #4470
- Message 'No records found.' is still previewed when reset filter #4484
- The text in the filter column textbox truncates in the igx-grid component #4496
- Excel style filter does not apply the filter when the value is 0 #4483
- When hold arrow up or down key on a month the focus changes to the year #4585
- Putting two circular progress bars results in duplicate IDs #4410
- igxGrid does not clear groupsRecords when all columns get ungrouped #4515

## 7.2.5
- `igxDrop`
    - `onEnter`, `onLeave` and `onDrop` events now have new arguments for `originalEvent`, `offsetX` and `offsetY` relative to the container the igxDrop is instanced.
- `IgxList`
    - **Feature** the `index` property is now an `@Input` and can be assigned by structural directives such as `*igxFor`.
    ```html
        <igx-list>
            <div [style.height]="'480px'" [style.overflow]="'hidden'" [style.position]="'relative'">
                <igx-list-item [index]="i" *igxFor="let item of data; index as i; scrollOrientation: 'vertical'; containerSize: '480px'; itemSize: '48px'">
                    <div>{{ item.key }}</div>
                    <div class="contact__info">
                        <span class="name">{{item.name}}</span>
                    </div>
                </igx-list-item>
            </div>
        </igx-list>
    ```
    - The `items` property now returns the collection of child items sorted by their index if one is assigned. This is useful when the `children` order cannot be guaranteed.
- Excel-Style Filtering and Quick Filtering user interfaces now display the date picker's calendar in a dropdown.
- `IgxCard` - The card component has been refactored. It now includes several new supporting components/directives:
    - `igxCardHeaderTitle` - tag your headings placed in the `igx-card-header` container to be displayed as a card title;
    - `igxCardHeaderSubtitle` - tag your headings placed in the `igx-card-header` container to be displayed as a card subtitle;
    - `igxCardThumbnail` - tag anything placed in the `igx-card-header` as a thumb to be placed to the left of your titles;
    - `igx-card-header` - the card header can now detect and automatically position `igx-avatar`s placed in it;
    - `igx-card-media` - wrap images or videos that will be automatically sized for you;
    - `igx-card-actions` - the card actions can now detect and automatically position all `igxButton`s placed in it;
    - The card has a new `type` property. It can be set to `outlined` to get the new outlined card look;
    - The card has a new `horizontal` property. When set to true, the layout will become horizontally aligned;
- New Directive `igx-divider` - The igx-divider is a thin, configurable line that groups content in lists and layouts.

### Bug Fixes
- Row editing overlay is not visible when grid has either 1 or 2 rows and height is not set. #4240
- Ctrl + Right Arrow is not working in an expanded child grid in 7.2.x #4414
- In EI11 and error is returned when filter by date #4434
- Calendar should be closed when scrolling is initiated #4099
- The sync service for the horizontal virtualization returns invalid cache values in certain scenarios #4460
- Unreadable icon color when icon is used as a tooltip target with dark-theme #4477
- When first tree grid column is with type date the calendar mode is not correct #4457
- When grid is grouped the search does not scroll to the find result #4327
- Calendar should be closed when scrolling is initiated #4099
- [igx-list] IgxListItem.index returns wrong index when igx-list is virtualized by igxForOf #4465
- [igx-grid] groupsRepcords is not updated correctly when grouping/ungrouping. #4479
- Exceptions are thrown by igxHGrid when columns don't have initial width, or it has been set as a percentage #4491
- Change date pickers' mode to 'dropdown' in all filtering UIs. #4493
- The radio-group display cannot be overridden #4402
- Filtered column header goes over the RowSelectors and groups when scroll horizontal #4366
- [igx-grid] description about onColumnMovingEnd is not correct. #4452
- IgxTabs removes custom added class #4508

## 7.2.4
### New feature
- [Multi-cell selection](https://github.com/IgniteUI/igniteui-angular/wiki/Grid-Multi-cell-selection-Specification) - Enables range selection of cells in the grid.

### Grids Performance improvements
- Grid rendering speed
- Grid grouping rendering speed
- Grid vertical scrolling using the scroll arrows
- Grid horizontal scrolling using the scroll arrows
- Grid cell focusing time
- Typing a character in an inline editor

### Bug fixes
- IgxForOf - Virtual item index with remote data #4455
- If grid has height in %(or no height) and filtering is enabled, then height is not calculated correctly. #4458
- 3rd level child does not scroll with keyboard nav #4447
- When in column group a column is hidden in the excel style filter LEFT and RIGHT buttons are enabled #4412
- Column Moving keydown.escape HostListener needs refactoring #4296
- Hierarchical Grid: scrolled child views remain after the root grid has been destroyed #4440
- When child grids have width in % (or no width) and there is horizontal scrollbar the vertical scrollbar is not visible. #4449
- Opening the Filtering dropdown twice in an igxHierarchicalGrid results in warning messages in the browser console #4436
- for-of init optimizations for grids #4374
- Changing columns dynamically in the Hierarchical Grid resets root column list to contain child columns. #4337
- Cell is not selected on click [IE] #1780
- igx-grid: Uncommitted IME text gets lost when Enter key is pressed in an edit cell template. #4314

## 7.2.3
### Improvements
- `IPinColumnEventArgs` new property - added a new property `isPinned` to the `IPinColumnEventArgs` interface. Now the `onColumnPinning` event emits information whether the column is pinned or unpinned.
- `igxGrid`
    - `igxFilterCellTemplate` directive added that allows retemplating of the filter cell.
    - `IgxColumnComponent` now has `filterCellTemplate` property that can be used to retemplate the filter cell.

### Bug fixes
- Fix auto-generate columns for TreeGrid #4399
- Emiting event when unpinning column #3833
- In Firefox when collapse all groups grid becomes empty #4304
- When transactions are enabled and update a filtered cell there is an error in console #4214
- In IE11 datePicker delete button is not in correct position when open a cell in edit mode #4116
- Refactoring filter cell navigation so that it is handled in the navigation service. Handling special scenarios for hierarchical grid in the hierarchical navigation service. #4267
- Grid: fix sorting in chrome #4397
- An error is returned when add a child for not committed row and summaries are enabled #4317
- Update child summaries correctly when CRUD operations are performed #4408
- Add igxQuickFilterTemplate directive #4377
- Resizing: move resize handle logic in a directive #4378
- No event emitted when column is unpinned #3799
- When update a cell in the grouped column the child summaries are not updated #4324
- Column Group border is misaligned with its children's in some cases #4387
- Expanding last row of HierarchicalGrid via keyboard(Alt + downArrow) leads to cell losing its focus. #4080
- fix(HierarchicalGrid): Moving onGridCreated to be emitted onInit #4370
- Virtualization of grid not working in tab #4329
- When you pin child column the whole group is not pinned #4278

## 7.2.2
### Features
- **Components' Display Type** - All components now have their CSS display property explicitly set on the host element to ensure width, padding, and margins are applied when set directly on the host selectors.
- **Themes**
    - Add support for gradients and images as values for component themes via the component theme functions.
    - `Palettes` - added surface color to the palette. The surface color is used by cards, pickers, dialog windows, etc. as the default background.

### Bug fixes
- fix(tabs): Fix for applying styles to tabs group #4371
- igxInput - add ability to toggle required dynamically #4361
- Select sort button only if default template is used #4372
- Public enumerations should not be constants #4364
- fix(hierarchicalGrid): Fix scrollbar not updated when data for children is loaded after initial load. #4334
- fix(date-picker): Fix for re-templating dropdown date-picker #4325
- Remove ngModel from datepicker #4333
- Scrollbar is not updated when load remote data #4209
- IgxGrid cell edit does not update values (onCellEdit) #4055
- Initial GroupBy performance is poor with many columns grouped #4309
- Components' display type #4316
- Including summary row cells in tab sequence for HierarchicalGrid navigation. #4293
- Surface color #4109
- `headerGroupClasses` is marked as hidden #4276
- Update AutoScrollStrategy to reposition elements outside NgZone #4250
- Optimizing post group pipe for 4309 - 7.2.x #4310
- IgxSelect does not close on Shift+Tab #4164
- clone method should have inheritdoc in all position strategies #4265
- Dialog does not emits close event the second time that is opened and closed #4222
- IgxLabelComponent is hidden #4237
- refactor(button-group): Fix the double borders between the buttons #4092
- Allow gradient/image values as backgrounds in component themes #4218
- Time Picker enhancements #4348

## 7.2.1
- `igxGrid`
    - **Breaking Change** The `groupsRecords` property now only returns the visible tree and does not include groups that are children of collapsed parents.
    - **Feature** Column Hiding and Column Pinning components now expose a `disableFilter` property which allows hiding the filter columns input from the UI.

### Improvements
- igxSelect - select-positioning-strategy code cleanup #4019

### Bug fixes
- Tooltip remains opened after clicking its target #4127
- Can not move a column to left if the previous column is column group #4114
- TextHighlight Directive makes the matching spans bold #4129
- IgxDropDownItem still uses deprecated accessors #4167
- Double click in editMode reverts the cell's value #3985
- Navigation with Ctrl+arrow keys does not work in child grids #4120
- In IE11 and Edge when scroll page the excel filter dialog is not moved #4112
- IgxCalendar overlay, rendered from cell in edit mode, goes outside the grid when scrolling #4205
- When using keyboard navigation the child grid does not scroll to next row when next child is empty. #4153
- selectedIndex doesn't switch tab. #4245
- When the last column is hidden button RIGHT for the last visible column should be disabled #4230
- When excel-style-filtering is enabled and press Shift+tab on first cell the scroll should not be moved #4219
- Can not navigate with tab in filtering row if grid has no horizontal scroll #4111
- ExcelFilterStyle , what is the name of the onClick methods for the apply and cancel button ? onFilteringDone doesnt work here #4248
- When you focus an element from the Excel-Style Filtering List in Chrome a blue boarder appears #4269
- Need ability to remove a column filter that was previously set in the grid #4305
- Keyboard navigation inside summaries for hierarchical grid is not working with Ctrl + arrow keys #4176
- ReadMe links are broken on 7.2.0. release note #4251
- Error when scrolling grid with mouse wheel after closing a dialog window in the page #4232
- Circular progress bar throws error on IE11 #3787
- Issue with export excel/csv from grid #3763
- Setting grid data property manually after initial rendering without binding it to the input is not detected. #4242
- When child grids does not have set height and expand a row in child grid scrollbars are not updated and there is empty space on the grid #4239
- [ng add]: Enabling polyfills step doesn't update properly polyfill.ts generated by Angular CLI v7.3.x. #3967
- When change sorting from the excel filter it is not applied for the grouped column #4119
- When grid is filtered and update a cell summaries are not updated #4211
- [igx-date-picker] igxCalendarHeader and igxCalendarSubheader don't work #4223
- [igx-date-picker] unnecessary suffix "日" to the date part of the calendar. #4224
- igxMonthPicker - arrowdown and arrow up not working correctly inside months view #4190
- In Edge resizing indicators are offset incorrectly #3908
- igx-column-group does not fire onColumnVisibilityChanged #4194

## 7.2.0
- `igxCalendar`
    - `igxCalendar` has been refactored to provide the ability to instantiate each view as a separate component.
    - **Feature** advanced keyboard navigation support has been added. Read up more information in the [ReadMe](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/calendar/README.md)

- **New component** `IgxMonthPicker`:
    - Provides the ability to pick a specific month. Read up more information in the [ReadMe](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/calendar/month-picker/README.md)

- **New component** `IgxHierarchicalGrid`:
    - Provides the ability to represent and manipulate hierarchical data in which each level has a different schema. Each level is represented by a component derived from **igx-grid** and supports most of its functionality. Read up more information about the IgxHierarchicalGrid in the official [documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/hierarchicalgrid.html) or the [ReadMe](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/grids/hierarchical-grid/README.md)

- **New component** The `igxSelect` provides an input with dropdown list allowing selection of a single item.
    ```html
    <igx-select #select1 [placeholder]="'Pick One'">
        <label igxLabel>Sample Label</label>
        <igx-select-item *ngFor="let item of items" [value]="item.field">
            {{ item.field }}
        </igx-select-item>
    </igx-select>
    ```

[documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/select) or the [ReadMe](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/select/README.md)

- **New directive** `igxAutocomplete` - new directive that provides a way to enhance a text input by showing a panel of suggested options, provided by the developer. More information about the IgxAutocomplete is available in the official [documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/autocomplete) or the [ReadMe](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/directives/autocomplete/README.md).

    ```html
    <input igxInput type="text" [igxAutocomplete]="townsPanel" />
    <igx-drop-down #townsPanel>
        <igx-drop-down-item *ngFor="let town of towns" [value]="town">
            {{town}}
        </igx-drop-down-item>
    </igx-drop-down>
    ```

- `igxGrid` now has `isLoading` input property. When enabled will show loading indicator, until the data is available. It can be best utilized for remote scenarios. Another input property `loadingGridTemplate` allows customizing the loading indicator.

    ```html
    <!-- Example -->
    <igx-grid [isLoading]="true" ...>
    </igx-grid>
    ```

    - `Group By`
        - The collapse/expand icons have new orientantion to display the action that will be performed when clicked. When an icon points up clicking on it would result in collapsing the related group row and when it points down clicking on it would expand the group row.
        - The collapse/expand all icons have also been updated to reflect the new group row icons better.
        - Group rows now can be expanded/collapsed using Alt + Arrow Up/Down to reflect the new icons.
    - `filterMode` input added, which determines the filtering ui of the grid. The default value is `quickFilter`. Other possible value is `excelStyle`, which mimics the filtering in Excel with added functionality for column moving, sorting, hiding and pinning.
    - `IgxColumnComponent` now has `disablePinning` property, which determines wether the column can be pinned from
    the toolbar and whether the column pin will be available in the excel style filter menu. The `disableHiding` input will be used to show/hide the column hiding functionality in the menu.
- `igxTreeGrid`
    - The collapse/expand icons have new orientantion to display the action that will be performed when clicked. When an icon points up clicking on it would result in collapsing the related tree grid level and when it points down clicking on it would expand the tree grid level.
    - Expanding/collapsing tree levels can now be performed also by using Alt + Arrow Up/Down to reflect the new icons.
- `IgxColumnComponent`
    - **Breaking Change** the `gridID` property is now **deprecated**. Please, use `column.grid.id` instead.
- `igxCombo`
    - **Breaking Change** `combo.value` is now only a getter.
    - **Feature** added support for templating the default input group of the component. The `igx-combo` now allows for `igx-prefix`, `igx-suffix`,`igx-hint` and `[igxLabel]` components to be passed as `ng-content` and they will be renderer accordingly on the combo's input. Example:
    ```html
        <!-- customize combo input --->
        <igx-combo #myCombo [data]="myGenres">
            ...
            <label igxLabel>Genres</label>
            <igx-prefix><igx-icon>music_note</igx-icon></igx-prefix>
        </igx-combo>
     ```
    - **Feature** the default combo 'clear' and 'toggle' icons can now be templated. Two new directives are added (with selector `[igxComboClearIcon]` and `[igxComboToggleIcon]`). Passing an `ng-template` with one of the directives will overwrite the default conent of the respective icon. Functionality will remain unaffected. Expample:
    ```html
        <!-- customize combo input --->
        <igx-combo #myCombo [data]="myGenres">
            ...
            <ng-template igxComboToggleIcon let-collapsed>
                <igx-icon>{{ collapsed ? 'remove_circle' : 'remove_circle_outline'}}</igx-icon>
            </ng-template>
        </igx-combo>
    ```
- `igxDropDown`
    - `IgxDropDownItemBase` and it's descendants (of which `IgxDropDownItem`) have had their `isSelected` and `isFocused` properties **deprecated**. Instead, use `selected` and `focused` properties.
    - Added an `@Input` for the `index` property (such as the one coming from ngFor) of the `IgxDropDownItem` component. This **deprecates** the automatic index calculation.
    ```html
        <igx-drop-down>
            <igx-drop-down-item *ngFor="let item of items; let i = index" [index]="i">
                {{ item.field }}
            </igx-drop-down-item>
        </igx-drop-down>
    ```
    - **Feature** `IgxDropDownGroupComponent` has been added. It allows for easier grouping of multi-level data, without the need of flattening it. The `igx-drop-down-item-group` tag accepts `igx-drop-down-item`s and displays them in the appropriate grouped fashion.
        ```html
            <igx-drop-down>
                <igx-drop-down-item-group *ngFor="let country of contries" [label]="country.name">
                    <igx-drop-down-item *ngFor="let city of country.cities" [value]='city.refNo'>
                        {{ city.name }}
                    </igx-drop-down-item>
                </igx-drop-down-item-group>
            </igx-drop-down>
        ```
- `Theme Elevations & Shadows` - Components with shadows, set by an elevation level or otherwise, are now fully configurable by the user via schema and/or theme properties. User can also provide a custom elevations set to component themes that support them.
    - **Breaking Change** - The `$search-shadow-color` and `$search-disabled-shadow-color` properties on the `igx-input-group-theme` have been replaced with `$search-resting-shadow` and `$search-disabled-shadow` respectively. Use `ng update` to migrate automatically.
- `IgxTreeGridComponent`
    - We can now search in the treegrid's data by using the `findNext` and the `findPrev` methods and we can clear the search results with the `clearSearch` method.
- `IgxTextHighlightDirective`
    - `IgxTextHighlightDirective.page` input property is **deprecated**. `rowIndex`, `columnIndex` and `page` properties of the `IActiveHighlightInfo` interface are also **deprecated**. Instead, `row` and `column` optional properties are added.
- `igxDragDrop`
    - `dragGhostHost` input property added. Sets the element to which the dragged element will be appended. If not provided, the dragged element is appended to the body.
- `Column Hiding UI`
    - **Behavioral Change** - The UI now hides the columns whose `disableHiding` property is set to true instead of simply disabling them.
- `igxButton` - **New Button Style** - Include [outlined](https://material.io/design/components/buttons.html#outlined-button) button style to support the latest material spec.
- `igxOverlay`:
    - `igxOverlay.attach()` method added. Use this method to obtain an unique Id of the created overlay where the provided component will be shown. Then call `igxOverlay.show(id, settings?)` method to show the component in overlay. The new `attach` method has two overloads:
      - `attach(element: ElementRef, settings?: OverlaySettings): string` - This overload will create overlay where provided `element` will be shown.
      - `attach(component: Type<any>, settings?: OverlaySettings, moduleRef?: NgModuleRef<any>): string` - Creates a `ComponentRef` from the provided `component` class to show in an overlay. If `moduleRef` is provided the service will use the module's `ComponentFactoryResolver` and `Injector` when creating the `ComponentRef` instead of the root ones.
    - `igxOverlay.show(component, settings)` is **deprecated**. Use `igxOverlay.attach()` method to obtain an Id, and then call `igxOverlay.show(id, settings)` method to show a component in the overlay.
    - `IPositionStrategy` exposes new method `clone` that clones the strategy instance with its settings.

- `igx-date-picker`
    - **Feature** Added `dropdown` `mode` to enable the input field value editing and spinning of the date parts as well as displaying a drop down calendar to select a date. Example:
    ```html
      <igx-date-picker #editableDatePicker1 mode="dropdown" [value]="date" format="dd.MM.y" mask="M/d/y">
      </igx-date-picker>
     ```
 **Components roundness**
- Ignite UI for Angular now allows you to change the shape of components by changing their border-radius.

- Here is the list of all components that have roundness functionality:
* _igx-badge_
* _igx-buttongroup_
* _igx-calendar_
* _igx-card_
* _igx-carousel_
* _igx-chip_
* _igx-dialog_
* _igx-drop-down_
* _igx-expansion-panel_
* _igx-input-group_
* _igx-list_
  * _igx-list-item_
* *igx-navdrawe*r
* _igx-snackbar_
* _igx-toast_
* _igxTooltip_

- **Breaking Change**
- The `$button-roundness` property on the `igx-button-theme` have been replaced for each button type with: `$flat-border-radius`,`$raised-border-radius`,`$outline-border-radius`,`$fab-border-radius`, `$icon-border-radius`.
- The`$roundness` property on the `igx-chip-theme` have been replaced with `$border-radius`.
- The`$roundness` property on the `iigx-tooltip-theme` have been replaced with `$border-radius`.

### Bug Fixes
- All initially pinned columns get unpinned if the grid's width is set as a percentage of its parent #3774
- Expanding a group row while at the bottom of the grid throws error #4179
- Grouping expand/collapse all button is not aligned with the row selector checkbox. #4178
- IgxToggleAction logs deprecated message in the console #4126
- IgxCombo - Calling selectItems([]) incorrectly clears the combo selection #4106
- IgxCombo - Clearing item filter sometimes empties drop down list #4000
- IgxCombo - Keyboard navigation ArrowDown stutters on chunk load #3999
- Row editing overlay banner not shown when enter row editing #4117
- IgxToggle open method always tries to get id even when it has one #3971
- Last (right-aligned) column is cut off when no widths are set for the columns #3396
- The selection in the last grid column does not span in the whole cell. #1115
- Last column header is a bit wider than the cells #1230

## 7.1.11
### Improvements
- Row and Cell editing Docs improvements #4055

## 7.1.10
### Features
- Column Hiding and Column Pinning components now expose a `disableFilter` property which allows hiding the filter columns input from the UI.

### Bug Fixes
- Tooltip remains opened after clicking its target #4127
- TextHighlight Directive makes the matching spans bold #4129
- igx-grid: `pinned` property doesn't work when `width` property is set together. #4125
- Double click in editMode reverts the cell's value #3985
- Issue with export excel/csv from grid #3763
- Error when scrolling grid with mouse wheel after closing a dialog window in the page #4232
- Circular progress bar throws error on IE11 #3787
- Setting grid data property manually after initial rendering without binding it to the input is not detected. #4242
- `headerGroupClasses` is marked as hidden #4276
- When you pin child column the whole group is not pinned #4278
- igx-column-group does not fire onColumnVisibilityChanged #4194
- When grid is filtered and update a cell summaries are not updated #4211

## 7.1.9
### Bug Fixes
- igx-grid: Incorrect height calculation when setting height in percent and binding empty data. #3950
- Grid doesn't reflect the applied formatter immediately #3819
- Cannot set chip as selected through API if selectable is false #2383
- IgxCombo - Keyboard navigation in combo with remote data is incorrect #4049
- Setting groupingExpressions run-time has different result than using the UI/methods #3952
- Error on app-shell build in the icon module #4065
- Grid/TreeGrid toolbar dropdowns reopen when trying to close it every other time #4045
- When grid and columns have width in IE the columns are visible outside the grid #3716
- IgxGridToolbarComponent is hidden from the API docs #3974
- igx-grid: row virtualization doesn't work when setting height in percent if you fetch and bind data after initial rendering. #3949
- IgxToggleAction logs deprecated message in the console #4126

## 7.1.8
### Bug Fixes
- Required date picker bound to displayData is shown invalid initially. #3641
- If the columns don't fit the treeGrid viewport, horizontal scrollbar in TreeGrid is gone/disappears #3808
- igxGrid setting autogenerate and groupingExpressions inputs results in errors #3951

## 7.1.7
### Bug fixes
- refactor(card): apply the content color to any text element #3878
- style(linear-bar): Fix text alignment #3862

## 7.1.6
### Bug Fixes
- Calling open() on an already opened IgxDropDown replays the opening animation #3810

## 7.1.5
### Features
- `igxGrid`
    - `Group By`
        - The collapse/expand icons have new orientantion to display the action that will be performed when clicked. When an icon points up clicking on it would result in collapsing the related group row and when it points down clicking on it would expand the group row.
        - The collapse/expand all icons have also been updated to reflect the new group row icons better.
        - Group rows now can be expanded/collapsed using Alt + Arrow Up/Down to reflect the new icons.
- `igxTreeGrid`
    - The collapse/expand icons have new orientantion to display the action that will be performed when clicked. When an icon points up clicking on it would result in collapsing the related tree grid level and when it points down clicking on it would expand the tree grid level.
    - Expanding/collapsing tree levels can now be performed also by using Alt + Arrow Up/Down to reflect the new icons.
- `Remove CSS Normalization` - Some users were complaining we reset too many browser styles - lists and heading styles in particular. We no longer do CSS normalization on an application level. Users who depended on our CSS browser normalization will have to handle that on their own going forward.
- `igxOverlayService` - the height of the shown element/component is not cached anymore. The height will be calculated each time position method of position strategy is called.

- `igxOverlayService`
    - `onClosing` event arguments are of type `OverlayClosingEventArgs` that adds an optional `event` property with the original DOM event. The browser event is available when closing of the overlay is caused by an outside click. This also affects all components and directives that use `igxOverlay` service - `igxToggle`, `igxDropDown`, `igxCombo`, `igxSelect` and `igxAutocomplete`. When they emit their respective `onClosing` event, the arguments are of type `CancelableBrowserEventArgs`, including the optional browser event.

## 7.1.4
### Features
- `Column Hiding UI`
    - **Behavioral Change** - The UI now hides the columns whose `disableHiding` property is set to true instead of simply disabling them.

## 7.1.3
### Bug Fixes
- When search and hide and then show a column the cell values are not correct ([3631](https://github.com/IgniteUI/igniteui-angular/issues/3631))
- When press Ctrl+Arrow down key on a summary cell it should stay active ([3651](https://github.com/IgniteUI/igniteui-angular/issues/3651))
- When summary row is not fully visible and press Tab the last summary cell is not activated ([3652](https://github.com/IgniteUI/igniteui-angular/issues/3652))
- Choosing from a drop down inside a form in a drop down closes the outer drop down ([3673](https://github.com/IgniteUI/igniteui-angular/issues/3673))
- Banner - Calling close method on collapsed panel throws error ([3669](https://github.com/IgniteUI/igniteui-angular/issues/3669))
- Typedoc API task generates non-public exports ([2858](https://github.com/IgniteUI/igniteui-angular/issues/2858))
- column.pin and column.unpin API descriptions need improvement ([3660](https://github.com/IgniteUI/igniteui-angular/issues/3660))
- disabledDates for the calendar and date picker should be an @Input() ([3625](https://github.com/IgniteUI/igniteui-angular/issues/3625))
- There is no way to determinate if a list item was panned in the click event ([3629](https://github.com/IgniteUI/igniteui-angular/issues/3629))
- When search and hide and then show a column the cell values are not correct ([3631](https://github.com/IgniteUI/igniteui-angular/issues/3631))

## 7.1.2
### Features
- `igx-circular-bar` and `igx-linear-bar` now feature an indeterminate input property. When this property is set to true the indicator will be continually growing and shrinking along the track.
- `IgxTimePickerComponent`: in addition to the current dialog interaction mode, now the user can select or edit a time value, using an editable masked input with a dropdown.
- `IgxColumnComponent` now accepts its templates as input properties through the markup. This can reduce the amount of code one needs to write when applying a single template to multiple columns declaratively. The new exposed inputs are:
    + `cellTemplate` - the template for the column cells
    + `headerTemplate` - the template for the column header
    + `cellEditorTemplate` - the template for the column cells when a cell is in edit mode
      ```html
        <!-- Example -->

        <igx-grid ...>
            <igx-column *ngFor="let each of defs" [cellTemplate]="newTemplate" ...></igx-column>
        </igx-grid>

        <ng-template #newTemplate let-value>
            {{ value }}
        </ng-template>
        ```

### Bug Fixes

- When transactions are enabled and delete a row page is changed to first page ([3425](https://github.com/IgniteUI/igniteui-angular/issues/3425))
- Row selectors header is not updated when commit transactions ([3424](https://github.com/IgniteUI/igniteui-angular/issues/3424))
- When a column is sorted and change value in a cell after commit and press enter on selected cell the focus is not in the input ([2801](https://github.com/IgniteUI/igniteui-angular/issues/2801))
- Closing the filter UI cuts the grid on the left ([3451](https://github.com/IgniteUI/igniteui-angular/issues/3451))
- GroupedRecords class should be hidden for doc generation. ([3483](https://github.com/IgniteUI/igniteui-angular/issues/3483))
- Badly formatted table in the JP documentation ([3484](https://github.com/IgniteUI/igniteui-angular/issues/3484))
- Not setting width in percentage on one or more columns results in columns going out of view ([1245](https://github.com/IgniteUI/igniteui-angular/issues/1245))
- Feature Request : locale property on a grid level ([3455](https://github.com/IgniteUI/igniteui-angular/issues/3455))
- Excel cannot open the exported data ([3332](https://github.com/IgniteUI/igniteui-angular/issues/3332))
- API DOC header links on header nav in JP leads to EN product page ([3516](https://github.com/IgniteUI/igniteui-angular/issues/3516))
- IgxGridHeaderGroupComponent should have preset min width ([3071](https://github.com/IgniteUI/igniteui-angular/issues/3071))
- Adding a custom svg to snackbar ([3328](https://github.com/IgniteUI/igniteui-angular/issues/3328))
- Feature request: Using text field input for date and time picker ([2337](https://github.com/IgniteUI/igniteui-angular/issues/2337))
- Summaries Keyboard navigation issues ([3407](https://github.com/IgniteUI/igniteui-angular/issues/3407))
- IgxRipple - animate() function not supported in Safari ([3506](https://github.com/IgniteUI/igniteui-angular/issues/3506))
- Faulty link in Typedoc ([3531](https://github.com/IgniteUI/igniteui-angular/issues/3531))
- [IE11] igx-grid - Filtering is cleared when clicking filtering chip if resourceString.igx_grid_filter_row_placeholder is set to Japanese character. ([3504](https://github.com/IgniteUI/igniteui-angular/issues/3504))
- Setting required IgxInput's value not via typing does not clear the invalid style. ([3550](https://github.com/IgniteUI/igniteui-angular/issues/3550))
- Add bodyTemplate as @Input() for igx-column ([3562](https://github.com/IgniteUI/igniteui-angular/issues/3562))
- Horizontal scrollbar is not shown when column's width is set to a percentage value. ([3513](https://github.com/IgniteUI/igniteui-angular/issues/3513))
- When select a date filter the date is not previewed in the input ([3362](https://github.com/IgniteUI/igniteui-angular/issues/3362))
- Missing locale errors on a browser with non-en language ([3569](https://github.com/IgniteUI/igniteui-angular/issues/3569))
- igx-action-icon is not vertically aligned in IgxNavbar ([3584](https://github.com/IgniteUI/igniteui-angular/issues/3584))
- [IE11] igx-grid filtering condition is reverted when typing Japanese character in the filtering textbox. ([3577](https://github.com/IgniteUI/igniteui-angular/issues/3577))
- TreeGrid has empty space when Summaries are enabled and expand/collapse ([3409](https://github.com/IgniteUI/igniteui-angular/issues/3409))
- Filtering row: no chip is created while typing Japanese characters on Edge ([3599](https://github.com/IgniteUI/igniteui-angular/issues/3599))
- PowerShell script should be added in order to apply some rules for deployment of the API DOCS (sassdoc, typedoc) ([3618](https://github.com/IgniteUI/igniteui-angular/issues/3618))
- igx-grid isn't displayed properly in IE11 when it is inside an igx-tabs-group. ([3047](https://github.com/IgniteUI/igniteui-angular/issues/3047))
- Cells' content is shown twice when entering edit mode after searching. ([3637](https://github.com/IgniteUI/igniteui-angular/issues/3637))
- ng add improvements ([3528](https://github.com/IgniteUI/igniteui-angular/issues/3528))

## 7.1.1
### Bug Fixes
* onSortingDone is not fired when sorting indicator of a header in the group by area is clicked ([#3257](https://github.com/IgniteUI/igniteui-angular/issues/3257))
* igx-grid isn't displayed properly in IE11 when it is inside an igx-tabs-group ([#3047](https://github.com/IgniteUI/igniteui-angular/issues/3047))
* Preventing wrap-around for scrollNext and scrollPrev([#3365](https://github.com/IgniteUI/igniteui-angular/issues/3365))
* IgxTreeGrid does not respect its parent container height ([#3467](https://github.com/IgniteUI/igniteui-angular/issues/3467))
* Include grid's unpinnedWidth and totalWidth in cell width calculation ([#3465](https://github.com/IgniteUI/igniteui-angular/issues/3465))

### Other
* update typedoc-plugin-localization version to 1.4.1 ([#3440](https://github.com/IgniteUI/igniteui-angular/issues/3440))

## 7.1.0
### Features
- **New component** `IgxBannerComponent`:
    - Allows the developer to easily display a highly templateable message that requires minimal user interaction (1-2 actions) to be dismissed. Read up more information about the IgxBannerComponent in the official [documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/banner) or the [ReadMe](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/banner/README.md)
- `igxGrid`
    - Added a new `igxToolbarCustomContent` directive which can be used to mark an `ng-template` which provides a custom content for the IgxGrid's toolbar ([#2983](https://github.com/IgniteUI/igniteui-angular/issues/2983))
    - Summary results are now calculated and displayed by default for each row group when 'Group By' feature is enabled.
    - `clearSummaryCache()` and `recalculateSummaries()` methods are deprecated. The grid will clear the cache and recalculate the summaries automatically when needed.
	- `locale` property added. Default value is `en`. All child components will use it as locale.
    - **Breaking change** `IgxSummaryOperand.operate()` method is called with empty data in order to calculate the necessary height for the summary row. For custom summary operands, the method should always return an array of `IgxSummaryResult` with proper length.
- `IgxIconModule`:
    - **Breaking change** `igxIconService` is now provided in root (providedIn: 'root') and `IgxIconModule.forRoot()` method is deprecated.
    - **Breaking change** `glyphName` property of the `igxIconComponent` is deprecated.
- `IgxColumnComponent`:
    - **Breaking change** the `filters` input now expects `IgxFilteringOperand` instance, instead of class ref. This way custom `IgxFilteringOperands` no longer need to be singleton, with defined `instance` method.
- `IgxMask`:
    - `placeholder` input property is added to allow developers to specify the placeholder attribute of the host input element that the `igxMask` is applied on;
    - `displayValuePipe` input property is provided that allows developers to additionally transform the value on blur;
    - `focusedValuePipe` input property is provided that allows developers to additionally transform the value on focus;
- `IgxTreeGrid`:
    - Batch editing - an injectable transaction provider accumulates pending changes, which are not directly applied to the grid's data source. Those can later be inspected, manipulated and submitted at once. Changes are collected for individual cells or rows, depending on editing mode, and accumulated per data row/record.
    - You can now export the tree grid both to CSV and Excel.
    - The hierarchy and the records' expanded states would be reflected in the exported Excel worksheet.
    - Summaries feature is now supported in the tree grid. Summary results are calculated and displayed for the root level and each child level by default.
- `IgxOverlayService`:
    - `ElasticPositioningStrategy` added. This strategy positions the element as in **Connected** positioning strategy and resize the element to fit in the view port in case the element is partially getting out of view.


## 7.0.5
### Bug Fixes

* igx-grid isn't displayed properly in IE11 when it is inside an igx-tabs-group. ([#3047](https://github.com/IgniteUI/igniteui-angular/issues/3047))
* igx-slider max-value defaults to min-value ([#3418](https://github.com/IgniteUI/igniteui-angular/issues/3418))
* Inconsistency in scrollNext and scrollPrev ([#3365](https://github.com/IgniteUI/igniteui-angular/issues/3365))
* The header link in the api docs page should be to the product page ([#3423](https://github.com/IgniteUI/igniteui-angular/issues/3423))
* Error thrown when edit primaryKey cell in Tree Grid ([#3329](https://github.com/IgniteUI/igniteui-angular/issues/3329))
* IgxGridHeaderGroupComponent should have preset min width ([#3071](https://github.com/IgniteUI/igniteui-angular/issues/3071))
* Pressing ESC on a cell in an editable column throws an error ([#3429](https://github.com/IgniteUI/igniteui-angular/issues/3429))
* Cell foreground is white on hover with the default theme ([#3384](https://github.com/IgniteUI/igniteui-angular/issues/3384))
* [IE] Grid toolbar's buttons and title are misaligned ([#3371](https://github.com/IgniteUI/igniteui-angular/issues/3371))
* Dialog window does not hold the focus when opened ([#3199](https://github.com/IgniteUI/igniteui-angular/issues/3199))
* refactor(themes): don't include contrast colors in the palettes ([#3166](https://github.com/IgniteUI/igniteui-angular/issues/3166))

### Other
* update typedoc-plugin-localization version to 1.4.1 ([#3440](https://github.com/IgniteUI/igniteui-angular/issues/3440))
* Move all keyboard navigation tests in a separate file ([#2975](https://github.com/IgniteUI/igniteui-angular/issues/2975))


## 7.0.4
### Bug fixes
- Fix(igx-grid): revert row editing styles ([#2672](https://github.com/IgniteUI/igniteui-angular/issues/2672))
- Revert "fix(grid): set min width to header groups programmatically"  status: verified version: 7.0.x
([#3357](https://github.com/IgniteUI/igniteui-angular/issues/3357))


## 7.0.3
### Bug fixes
- ng add igniteui-angular adds igniteui-cli package to both dependencies and devDependencies ([#3254](https://github.com/IgniteUI/igniteui-angular/issues/3254))
- Group column header is not styled correctly when moving that column ([#3072](https://github.com/IgniteUI/igniteui-angular/issues/3072))
- igx-grid: Filter row remains after disabling filtering feature ([#3255](https://github.com/IgniteUI/igniteui-angular/issues/3255))
- [igxGrid] Keyboard navigation between cells and filtering row with MCH ([#3179](https://github.com/IgniteUI/igniteui-angular/issues/3179))
- Argument $color of red($color) must be a color ([#3190](https://github.com/IgniteUI/igniteui-angular/issues/3190))
- Shell strings localization ([#3237](https://github.com/IgniteUI/igniteui-angular/issues/3237))
- Tabbing out of the combo search input not possible ([#3200](https://github.com/IgniteUI/igniteui-angular/issues/3200))
- Localization (i18n) not available for inputs/buttons on the grid filtering dialog ([#2517](https://github.com/IgniteUI/igniteui-angular/issues/2517))
- When in the tree grid are pinned columns and scroll horizontal the cells text is over the pinned text #3163
- Request for update of shell strings in Japanese ([#3163](https://github.com/IgniteUI/igniteui-angular/issues/3163))
- Refactor(themes): remove get-function calls ([#3327](https://github.com/IgniteUI/igniteui-angular/issues/3327))
- Fix(grid): recalculate grid body size when changing allowFiltering dynamically ([#3321](https://github.com/IgniteUI/igniteui-angular/issues/3321))
- Fix - Combo - Hide Search input when !filterable && !allowCustomValues - 7.0.x ([#3314](https://github.com/IgniteUI/igniteui-angular/issues/3314))
- Fixing column chooser column updating - 7.0.x ([#3235](https://github.com/IgniteUI/igniteui-angular/issues/3235))
- Disable combo checkbox animations on scroll ([#3303](https://github.com/IgniteUI/igniteui-angular/issues/3303))
- Added validation if last column collides with grid's scroll. ([#3028](https://github.com/IgniteUI/igniteui-angular/issues/3028)) ([#3100](https://github.com/IgniteUI/igniteui-angular/issues/3100))
- Use value instead of ngModel to update editValue for checkbox and calendar in igxCell ([#3225](https://github.com/IgniteUI/igniteui-angular/issues/3225))
- Add @inheritdoc, create ScrollStrategy abstract class and fix method signatures 7.0.x ([#3222](https://github.com/IgniteUI/igniteui-angular/issues/3222))
- When scroll with the mouse wheel the value in datePicker editor for edited cell is empty ([#2958](https://github.com/IgniteUI/igniteui-angular/issues/2958))
- igxToolbar should have the option to add custom template ([#2983](https://github.com/IgniteUI/igniteui-angular/issues/2983))
- fix(grid): mark grid for check inside NgZone when resizing ([#2792](https://github.com/IgniteUI/igniteui-angular/issues/2792)) ([#3277](https://github.com/IgniteUI/igniteui-angular/issues/3277))
- IgxGridHeaderGroupComponent should have preset min width ([#3071](https://github.com/IgniteUI/igniteui-angular/issues/3071))
- Tree grid selection ([#3334](https://github.com/IgniteUI/igniteui-angular/issues/3334))

## 7.0.2
### Features
- `ng add igniteui-angular` support :tada:
    - You can now add Ignite UI for Angular to existing Angular CLI projects - simply run `ng add igniteui-angular` in your project.
    This will install the package and all needed dependencies, add Ignite UI CLI so you can even quickly add components.
- **New component** `IgxBannerComponent`:
    - Allows the developer to easily display a highly templateable message that requires minimal user interaction (1-2 actions) to be dismissed. Read up more information about the IgxBannerComponent in the official [documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/banner) or the [ReadMe](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/banner/README.md)
- `igxNavbar`:
    - Added a new `igx-action-icon` directive that can be used to provide a custom template to be used instead of the default action icon on the left-most part of the navbar.
    (If `igx-action-icon` is provided, the default action icon will not be used.)

### Bug fixes

- `igxGrid`
    - Filter row does not close when click button cancel, if the entered text is deleted ([#3198](https://github.com/IgniteUI/igniteui-angular/issues/3198))
    - Prevent a potential memory leak ([#3033](https://github.com/IgniteUI/igniteui-angular/issues/3033))
    - Filtering: Open dropdown on Alt+down, fixes input being populated on keyboard action ([#3202](https://github.com/IgniteUI/igniteui-angular/issues/3202))
    - Row Selection: selected checkboxes are flickering on vertical scrolling ([#2523](https://github.com/IgniteUI/igniteui-angular/issues/2523))
    - Row editing overlay animation should be bottom - top, when overlay is placed over the row ([#3184](https://github.com/IgniteUI/igniteui-angular/issues/3184))


## 7.0.1
### Bug fixes
- Removed the `GridHammerConfig` provider which broke touch events for other components. (Fixed #3185, Reopens #2538)


## 7.0.0
- Updated package dependencies to Angular 7 ([#3000](https://github.com/IgniteUI/igniteui-angular/pull/3000))
- Themes: Add dark schemas and mixins (PR [#3025](https://github.com/IgniteUI/igniteui-angular/pull/3025))

## 6.2.12
### Bug fixes
- igx-grid: `pinned` property doesn't work when `width` property is set together. #4125
- When you pin child column the whole group is not pinned #4278

## 6.2.11
### Bug Fixes
- igx-grid: Incorrect height calculation when setting height in percent and binding empty data. #3950
- Cannot set chip as selected through API if selectable is false #2383
- Setting groupingExpressions run-time has different result than using the UI/methods #3952
- igx-grid: row virtualization doesn't work when setting height in percent if you fetch and bind data after initial rendering. #3949

## 6.2.10
### Bug Fixes
- Cells position is changed when scroll vertical #3094
- igxGrid setting autogenerate and groupingExpressions inputs results in errors #3951

## 6.2.9
### Features
- `igxGrid`
    - `Group By`
        - The collapse/expand icons have new orientantion to display the action that will be performed when clicked. When an icon points up clicking on it would result in collapsing the related group row and when it points down clicking on it would expand the group row.
        - The collapse/expand all icons have also been updated to reflect the new group row icons better.
        - Group rows now can be expanded/collapsed using Alt + Arrow Up/Down to reflect the new icons.
- `igxTreeGrid`
    - The collapse/expand icons have new orientantion to display the action that will be performed when clicked. When an icon points up clicking on it would result in collapsing the related tree grid level and when it points down clicking on it would expand the tree grid level.
    - Expanding/collapsing tree levels can now be performed also by using Alt + Arrow Up/Down to reflect the new icons.

### Bug Fixes
- Add additional ways of expanding/collapsing in Tree Grid/Group By to reflect new icons #3841

## 6.2.8
### Bug Fixes
- Tree Grid collapse icon is updated to material standards #3780
- Change collapse/expand all icon on GroupBy #3298

## 6.2.7
### Bug Fixes
- igx-grid editing: Japanese inputs are not committed on enter or press key in edit mode #2525

## 6.2.6
### Bug Fixes/Other
- Add GA to API docs ([3596](https://github.com/IgniteUI/igniteui-angular/issues/3596))
- Modify gulp api docs tasks in order to follow the build steps ([3681](https://github.com/IgniteUI/igniteui-angular/issues/3681))

## 6.2.5
### Bug Fixes
- Setting required IgxInput's value not via typing does not clear the invalid style ([3550](https://github.com/IgniteUI/igniteui-angular/issues/3550))
- igx-grid isn't displayed properly in IE11 when it is inside an igx-tabs-group ([3047](https://github.com/IgniteUI/igniteui-angular/issues/3047))
- igxGrid minimal body height when no total height is set or inferred ([1693](https://github.com/IgniteUI/igniteui-angular/issues/1693))
- Horizontal scrollbar is not shown when column's width is set to a percentage value ([3513](https://github.com/IgniteUI/igniteui-angular/issues/3513))
- Visible @hidden tag due to comment structure ([3523](https://github.com/IgniteUI/igniteui-angular/issues/3523))
- Faulty link in Typedoc ([3531](https://github.com/IgniteUI/igniteui-angular/issues/3531))
- Several warnings on app launch 6.2.0 RC1 and now 7.0.2 ([2915](https://github.com/IgniteUI/igniteui-angular/issues/2915))
- For_of directive doesn't scroll to next elements in some cases ([3482](https://github.com/IgniteUI/igniteui-angular/issues/3482))
- Not setting width in percentage on one or more columns results in columns going out of view ([1245](https://github.com/IgniteUI/igniteui-angular/issues/1245))
- Calendar test is failing because of wrong selector ([3508](https://github.com/IgniteUI/igniteui-angular/issues/3508))
- When transactions are enabled and delete a row page is changed to first page ([3425](https://github.com/IgniteUI/igniteui-angular/issues/3425))
- When a column is sorted and change value in a cell after commit and press enter on selected cell the focus is not in the input ([2801](https://github.com/IgniteUI/igniteui-angular/issues/2801))
- igxFor with scrollOrientation: horizontal - Almost all the items are not rendered when they don't have width property ([3087](https://github.com/IgniteUI/igniteui-angular/issues/3087))
- Pressing ESC on a cell in an editable column throws an error ([3429](https://github.com/IgniteUI/igniteui-angular/issues/3429))

## 6.2.4
### Bug Fixes
* onSortingDone is not fired when sorting indicator of a header in the group by area is clicked ([#3257](https://github.com/IgniteUI/igniteui-angular/issues/3257))
* igx-grid isn't displayed properly in IE11 when it is inside an igx-tabs-group ([#3047](https://github.com/IgniteUI/igniteui-angular/issues/3047))
* Preventing wrap-around for scrollNext and scrollPrev([#3365](https://github.com/IgniteUI/igniteui-angular/issues/3365))
* IgxTreeGrid does not respect its parent container height ([#3467](https://github.com/IgniteUI/igniteui-angular/issues/3467))
* The header link in the api docs page should be to the product page ([#3423](https://github.com/IgniteUI/igniteui-angular/issues/3423))
* fix(dialog): dialog gets focus when is opened ([#3276](https://github.com/IgniteUI/igniteui-angular/issues/3276))
* IgxTreeGrid - Add row editing + transactions to tree grid ([#2908](https://github.com/IgniteUI/igniteui-angular/issues/2908))
* Regular highlight makes the highlighted text unreadable when the row is selected. ([#1852](https://github.com/IgniteUI/igniteui-angular/issues/1852))
* Use value instead of ngModel to update editValue for checkbox and calendar in igxCell ([#3224](https://github.com/IgniteUI/igniteui-angular/issues/3224))
* Disable combo checkbox animations on scroll ([#3300](https://github.com/IgniteUI/igniteui-angular/issues/3300))
* "Select/Unselect All" checkbox is checked after deleting all rows ([#3068](https://github.com/IgniteUI/igniteui-angular/issues/3068))
* Fixing column chooser column updating ([#3234](https://github.com/IgniteUI/igniteui-angular/issues/3234))
* Fix - Combo - Hide Search input when !filterable && !allowCustomValues ([#3315](https://github.com/IgniteUI/igniteui-angular/issues/3315))
* Add @inheritdoc ([#2943](https://github.com/IgniteUI/igniteui-angular/issues/2943))
* refactor(displayDensity): Code cleanup in display density base class #3280
* Calculating updated grid height when rebinding columns ([#3285](https://github.com/IgniteUI/igniteui-angular/issues/3285))
* Fix - Combo, Drop Down - Fix TAB key navigation ([#3206](https://github.com/IgniteUI/igniteui-angular/issues/3206))
* Added validation if last column collides with grid's scroll ([#3142](https://github.com/IgniteUI/igniteui-angular/issues/3142))
* When in the tree grid are pinned columns and scroll horizontal the cells text is over the pinned text ([#3163](https://github.com/IgniteUI/igniteui-angular/issues/3163))
* refactor(themes): don't include contrast colors in the palettes ([#3166](https://github.com/IgniteUI/igniteui-angular/issues/3166))

### Code enhancements
* Fix the logic calculating test results ([#3461](https://github.com/IgniteUI/igniteui-angular/issues/3461))
* Update typedoc version and localize some shell strings ([#3237](https://github.com/IgniteUI/igniteui-angular/issues/3237))
* fix(toolbar): including custom content in the show toolbar check ([#2983](https://github.com/IgniteUI/igniteui-angular/issues/2983))
* docs(toolbar): adding more API docs ([#2983](https://github.com/IgniteUI/igniteui-angular/issues/2983))

### Other
* update typedoc-plugin-localization version to 1.4.1 ([#3440](https://github.com/IgniteUI/igniteui-angular/issues/3440))
* Update contributing document with localization ([#3313](https://github.com/IgniteUI/igniteui-angular/issues/3313))
* docs(*): add 6.2.3 missing changes and bug fixes to changelog ([#3251](https://github.com/IgniteUI/igniteui-angular/issues/3251))
* Docs - Expansion Panel - Add comments and README([#3245](https://github.com/IgniteUI/igniteui-angular/issues/3245))
* Move all keyboard navigation tests in a separate file ([#2975](https://github.com/IgniteUI/igniteui-angular/issues/2975))


## 6.2.3
- `igxGrid`
    - `resourceStrings` property added, which allows changing/localizing strings for component. If a new instance is set,
    the changes will be applied to the particular instance of the component:
    ```typescript
        this.grid.resourceStrings = {
            igx_grid_filter: 'My filter',
            igx_grid_filter_row_close: 'My close'
        };
    ```
    If only a value is updated, all component instances will be updated:
    ```typescript
        this.grid.resourceStrings.igx_grid_filter = 'My filter';
    ```
- `igxTimePicker`:
    - `resourceStrings` property added, which allows changing/localizing strings for component.
- Localization
    - Added an util function `changei18n` that takes `IResourceStrings` object as parameter. Its values will be used as resource strings for all components
    in the application.
    - Added an util function `getCurrentResourceStrings` that returns current resource strings for all components.
- `ISortingEpression`:
    - The `ignoreCase` and `strategy` properties are moved back to optional, and the `DefaultSortingStrategy` is now injected by the `IgxSorting`, instead of being mandatory to pass to expressions.

### Bug fixes

- `igxGrid`
    - Filter row does not close when click button cancel, if the entered text is deleted ([#3198](https://github.com/IgniteUI/igniteui-angular/issues/3198))
    - Prevent a potential memory leak ([#3033](https://github.com/IgniteUI/igniteui-angular/issues/3033))
    - Filtering: Open dropdown on Alt+down, fixes input being populated on keyboard action ([#3202](https://github.com/IgniteUI/igniteui-angular/issues/3202))
    - Row Selection: selected checkboxes are flickering on vertical scrolling ([#2523](https://github.com/IgniteUI/igniteui-angular/issues/2523))
    - Row editing overlay animation should be bottom - top, when overlay is placed over the row ([#3184](https://github.com/IgniteUI/igniteui-angular/issues/3184))


## 6.2.2
- `igx-checkbox`:
    - Added a new input property - `disableTransitions`. It allows disabling all CSS transitions on the `igx-checkbox` component for performance optimization.
### Bug fixes
- Removed the `GridHammerConfig` provider which broke touch events for other components. (Fixed #3185, Reopens #2538)

## 6.2.1
### Features
- `igxGrid`, `igxChip`: Add display density DI token to igxGrid and igxChip ([#2804](https://github.com/IgniteUI/igniteui-angular/issues/2804))
- `igxGrid`
    - Quick filter auto close ([#2979](https://github.com/IgniteUI/igniteui-angular/issues/2979))
    - Group By: Added title to chip in Group By area ([#3035](https://github.com/IgniteUI/igniteui-angular/issues/3035))
    - Improve UX for boolean and date columns, ([#3092](https://github.com/IgniteUI/igniteui-angular/issues/3092))
- `igxCombo`:
    - Added a new input property - `displayDensity`. It allows configuring the `displayDensity` of the combo's `value` and `search` inputs. (PR [#3007](https://github.com/IgniteUI/igniteui-angular/pull/3007))
- `igxDropDown`
    - Added a new property `maxHeight`, defining the max height of the drop down. ([#3001](https://github.com/IgniteUI/igniteui-angular/issues/3001))
- Added migrations for Sass theme properties changes in 6.2.0 ([#2994](https://github.com/IgniteUI/igniteui-angular/issues/2994))
- Themes
    - Introducing schemas for easier bootstrapping of component themes.
    - **Breaking change** removed $variant from `igx-checkbox-theme`, `igx-ripple-theme`, `igx-switch-theme`, `igx-input-group-theme`, `igx-slider-theme`, and `igx-tooltip-theme`. Use the `$schema` prop, now available on all component themes to change the look for a specific theme. See the [Theming](https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes/schemas.html) documentation to learn more.


### Bug fixes

- `igxGrid`
    - Filtering condition icon is not updated for boolean columns ([#2936](https://github.com/IgniteUI/igniteui-angular/issues/2936))
    - Batch editing: Updating a cell with a value that evaluates to false does not mark it as dirty ([#2940](https://github.com/IgniteUI/igniteui-angular/issues/2940))
    - Filtering input accepts value from calendar for unary conditions ([#2937](https://github.com/IgniteUI/igniteui-angular/issues/2937))
    - When a number filter's value is deleted the grid is not refreshed ([#2945](https://github.com/IgniteUI/igniteui-angular/issues/2945))
    - Improve keyboard navigation in filtering ([#2951](https://github.com/IgniteUI/igniteui-angular/issues/2951), [#2941](https://github.com/IgniteUI/igniteui-angular/issues/2941))
    - Group By: Alt+ Arrow left/Right keys should not toggle the group row ([#2950](https://github.com/IgniteUI/igniteui-angular/issues/2950))
    - Multi Column Header can be grouped ([#2944](https://github.com/IgniteUI/igniteui-angular/issues/2944))
    - Group By: groupsRecords is not updated yet at the time of onGroupingDone event. ([#2967](https://github.com/IgniteUI/igniteui-angular/issues/2967))
    - Paging: Blank space in rows area after vertical scrolling and navigating to next page ([#2957](https://github.com/IgniteUI/igniteui-angular/issues/2957))
    - When date or boolean cell is in edit mode and press arrowUp or arrowDown key the page is scrolled ([#2507](https://github.com/IgniteUI/igniteui-angular/issues/2507))
    - When deleting a row the Row Editing dialog should be closed ([#2977](https://github.com/IgniteUI/igniteui-angular/issues/2977))
    - Group header with columns which width is defined as number throws an exception ([#3020](https://github.com/IgniteUI/igniteui-angular/issues/3020))
    - Refactor header and filter cell components, Closes [#2972](https://github.com/IgniteUI/igniteui-angular/issues/2972), [#2926](https://github.com/IgniteUI/igniteui-angular/issues/2926), [#2923](https://github.com/IgniteUI/igniteui-angular/issues/2923), [#2917](https://github.com/IgniteUI/igniteui-angular/issues/2917), [#2783](https://github.com/IgniteUI/igniteui-angular/issues/2783), [#3027](https://github.com/IgniteUI/igniteui-angular/issues/3027), [#2938](https://github.com/IgniteUI/igniteui-angular/issues/2938)
    - Filter's UI dropdown is hidden under the bottom level of the grid ([#2928](https://github.com/IgniteUI/igniteui-angular/issues/2928))
    - Cell is not editable on iOS ([#2538](https://github.com/IgniteUI/igniteui-angular/issues/2538))
- `IgxTreeGrid`
    - Cell selection wrong behavior when collapsing rows ([#2935](https://github.com/IgniteUI/igniteui-angular/issues/2935))
- `igxCombo`
    - Keyboard doesn't scroll virtualized items ([#2999](https://github.com/IgniteUI/igniteui-angular/issues/2999))
- `igxDatePicker`
    - Error emitting when  value property is initialized with empty string. ([#3021](https://github.com/IgniteUI/igniteui-angular/issues/3021))
- `igxOverlay`
    - Drop-down flickers in IE and EDGE ([#2867](https://github.com/IgniteUI/igniteui-angular/issues/2867))
- `igxTabs`
    - Tabs don't not handle width change ([#3030](https://github.com/IgniteUI/igniteui-angular/issues/3030))
- `igxCalendar`
    - make all css class names unique ([#2287](https://github.com/IgniteUI/igniteui-angular/issues/2287))
- Fixed runtime errors when using the package in applications targeting es2015(es6) and newer ([#3011](https://github.com/IgniteUI/igniteui-angular/pull/3011))

## 6.2.0
- Updated typography following the Material guidelines. Type system is now also optional and can be applied via class to the desired containers. [#2112](https://github.com/IgniteUI/igniteui-angular/pull/2112)
  - **Breaking change:** Applications using Ignite UI for Angular now require the `igx-typography` class to be applied on wrapping element, like the body element for instance.

- Display density can be specified by using the injection token `DisplayDensityToken` and providing a value (comfortable, cosy or compact) on an application or a component level.

    Setting display density on a component level:
    ```typescript
    @Component({
    ...
    providers: [{ provide: DisplayDensityToken, useValue: { displayDensity: DisplayDensity.compact} }]
    })
    ```
- `igx-input-group`
    - The `igx-input-group` control's display density can be explicitly set by using the `displayDensity` input.
    ```html
    <igx-input-group [displayDensity]="'cosy'"> ... </igx-input-group>
    ```
- `igx-drop-down`:
    - Added a new boolean argument `cancel` to the `onSelection` `ISelectionEventArgs`. Its default value is false, in case it is set to true, the drop down selection is invalidated.
- `igxIcon`:
    - **Breaking change** `glyphName` property is removed from `IgxIconComponent`. For `Material` icons the icon name should be explicitly defined between the opening and closing tags. `Font Awesome` icons should use the `name` property now.
    - Added support for custom SVG icons. Register the SVG icons with the `IgxIconService` and use `IgxIconComponent`'s `name` and `fontSet` properties to visualize the icon.
- Transaction Provider - `TransactionService` is an injectable middleware that a component can use to accumulate changes without affecting the underlying data. The provider exposes API to access, manipulate changes (undo and redo) and discard or commit all to the data.
For more detailed information, see the [README](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/services/transaction/README.md).
- `igxTreeGrid`:
    - New `IgxTreeGridComponent` added.
    - The `igxTreeGrid` is used to display and manipulate hierarchical data with consistent schema, formatted as a table and provides a line of advanced features such as sorting, filtering, editing, column pinning, column moving, column hiding, paging and others.
    - The `igxTreeGrid` provides two ways of defining the relations among our data objects - by using a **child collection** for every data object or by using **primary and foreign keys** for every data object.
    - For more details on using the `igxTreeGrid`, take a look at the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/treegrid).
- `igxGrid`:
    - **Breaking change** `onGroupingDone` - The array of `ISortingExpression` can now be accessed through the `expressions` event property. Two new properties have been added to the event arguments - `groupedColumns` and `ungroupedColumns`. They provide references to arrays of `IgxColumnComponent` that hold the columns which have changed their state because of the **last** grouping/ungrouping operation.

    - **Breaking change** `onEditDone` event is renamed to `onCellEdit` and new cell editing events are introduced: `onCellEditEnter` and `onCellEditCancel`. When row editing is enabled, the corresponding events are emitted by the grid - `onRowEditEnter`, `onRowEdit`, `onRowEditCancel`. All these events have arguments that are using the `IGridEditEventArgs` interface.

    - Row editing - allows modification of several cells in the row, before submitting, at once, all those changes to the grid's data source. Leverages the pending changes functionality of the new transaction provider.

        ```html
        <igx-grid [data]="data" [rowEditable]="true">
            <igx-column field="ProductName"></igx-column>
            <igx-column field="ReleaseDate"></igx-column>
        </igx-grid>
        ```

    - Batch editing - an injectable transaction provider accumulates pending changes, which are not directly applied to the grid's data source. Those can later be inspected, manipulated and submitted at once. Changes are collected for individual cells or rows, depending on editing mode, and accumulated per data row/record.

        ```typescript
        @Component({
            providers: [{ provide: IgxGridTransaction, useClass: IgxTransactionService }],
            selector: "app-grid-with-transactions",
            template: "<ng-content></ng-content>"
        })
        export class GridWithTransactionsComponent { }
        ```
    - A new boolean `hideGroupedColumns` input controls whether the grouped columns should be hidden as well (defaults to false).
    - **Breaking change** `cellClasses` input on `IgxColumnComponent` now accepts an object literal to allow conditional cell styling.
    - Exposing a mechanism for cells to grow according to their content.
    - `sortStrategy` input exposed to provide custom sort strategy for the `IgxColumnComponent`. The custom strategy should implement the `ISortingStrategy` interface, or can extend the base `SortingStrategy` class and override all or some of its public/protected members.
    - New quick filtering functionality is implemented. Filtering icon is removed from column header and a filtering row is introduced in the grid's header.
- `igxFor`
    - Added support for variable heights.
- `igx-datePicker` selector is deprecated. Use `igx-date-picker` selector instead.
- `igxOverlay`:
    - `OverlaySettings` now also accepts an optional `outlet` to specify the container where the overlay should be attached.
    - when `show` and `hide` methods are called `onAnimation` event fires. In the arguments of this event there is a reference to the `animationPlayer`, `animationType` (either `open` or `close`) and to the overlay id.
    - if you call `show`/`hide` methods of overlay, while opening/closing animation is still ongoing, the animation will stop and respective open/close animation will start.
- `igxToggleAction` new `outlet` input controls the target overlay element should be attached. Provides a shortcut for `overlaySettings.outlet`.
- `IgxOverlayOutlet` directive introduced to mark an element as an `igxOverlay` outlet container. [ReadMe](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/directives/toggle/README.md)
- `igxButtonGroup`
    - Added the ability to define buttons directly in the template
- `igx-time-picker`:
    - `igxTimePickerTemplate` - new directive which should be applied on the child `<ng-template>` element when `IgxTimePickerComponent`'s input group is retemplated.
- `igx-datePicker`:
    - `igxDatePickerTemplate` - new directive which should be applied on the child `<ng-template>` element when `IgxDatePickerComponent`'s input group is retemplated.
    - Introduced `disabledDates`. This property is exposed from the `igx-calendar` component.
    - Introduced `specialDates`. This property is exposed from the `igx-calendar` component.
    - Introduced `deselectDate` method added that deselects the calendar date.
- `IgxTextHighlightDirective`: The `highlight` method now has a new optional parameter called `exactMatch` (defaults to false).
    - If its value is false, all occurrences of the search text will be highlighted in the group's value.
    - If its value is true, the entire group's value should equals the search text in order to be highlighted (caseSensitive argument is respected as well).
- `IgxGrid`: The `findNext` and `findPrev` methods now have a new optional parameter called `exactMatch` (defaults to false).
    - If its value is false, all occurrences of the search text will be highlighted in the grid's cells.
    - If its value is true, the entire value of each cell should equals the search text in order to be highlighted (caseSensitive argument is respected as well).
- `IgxChip`
    - Introduced event argument types to all `EventEmitter` `@Output`s.
    - **Breaking change** `onSelection`'s EventEmitter interface property `nextStatus` is renamed to `selected`.
    - **Breaking change** Move the location of where the chip `suffix` is positioned. Now it is between the content and the `remove button` making the button last element if visible by default.
    - **Breaking change** Remove the chip `connector` rendered when using the `igxConnector` directive that is also removed.
    - **Breaking change** The chip theme has been rewritten. Most theme input properties have been renamed for consistency
    and better legibility. New properties have been added. Please, refer to the updated igx-chip-theme documentation to see all updates.
    - Exposed original event that is responsible for triggering any of the events. If triggered by the API it is by default `null`.
    - Added `data` input for storing any data related to the chip itself.
    - Added `select icon` with show/hide animation to indicate when a chip is being selected with ability to customize it while retaining the chip Material Design styling.
    - Added `selectIcon` input to set custom template for the `select icon`.
    - Update chip styling to match Material Design guidelines.
    - Rework of the chip content styling so now by default text inside is styled to match the chip Material Design styling.
    - Rework of the `remove button` rendered and now has the ability to customize its icon while retaining the chip Material Design.
    - Added `removeIcon` input so a custom template cane be set for the remove button icon.
- `IgxChipArea`
    - Introduced event argument types to all `EventEmitter` `@Output`s.
    - Exposed original event that is responsible for triggering any of the events. If triggered by the API it is by default `null`.
- `IgxCombo`
    - Added the following directives for `TemplateRef` assignment for combo templates (item, footer, etc.):
        - Added `IgxComboItemDirective`. Use `[igxComboItem]` in markup to assing a TemplateRef to `combo.itemTemplate`.
        - Added `IgxComboHeaderDirective`. Use `[igxComboHeader]` in markup to assing a TemplateRef to `combo.headerTemplate`.
        - Added `IgxComboFooterDirective`. Use `[igxComboFooter]` in markup to assing a TemplateRef to `combo.footerTemplate`.
        - Added `IgxComboEmptyDirective`. Use `[igxComboEmpty]` in markup to assing a TemplateRef to `combo.emptyTemplate`.
        - Added `IgxComboAddItemirective`. Use `[igxComboAddItem]` in markup to assing a TemplateRef to `combo.addItemTemplate`.
        - Added `IgxComboHeaderItemDirective`. Use `[igxComboHeaderItem]` in markup to assing a TemplateRef to `combo.headerItemTemplate`.
    - **Breaking change** Assigning templates with the following template ref variables is now deprecated in favor of the new directives:
            `#itemTemplate`, `#headerTemplate`, `#footerTemplate`, `#emptyTemplate`, `#addItemTemplate`, `#headerItemTemplate`.
    - **Breaking change** `height` property is removed. In the future `IgxInputGroup` will expose an option that allows custom sizing and then `IgxCombo` will use the same functionality for proper styling and better consistency.

- `IgxDropDown`
    - **Breaking change** `allowItemsFocus` default value is changed to `false`.
    - Added `value` input to `IgxDropDownItemComponent` definition. The property allows data to be bound to a drop-down item so it can more easily be retrieved (e.g. on selection)
- `igx-calendar`:
    - Introduced `disabledDates` property which allows a user to disable dates based on various rules: before or after a date, weekends, workdays, specific dates and ranges. The disabled dates cannot be selected and have a distinguishable style.
    - Introduced `specialDates` property which allows a user to mark dates as special. They can be set by using various rules. Their style is distinguishable.
    - Introduced `deselectDate` method added that deselects date(s) (based on the selection type)
- `igxExpansionPanel`:
    - component added. `igxExpansionPanel` provides a way to display more information after expanding an item, respectively show less after collapsing it. For more detailed information see the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/expansion-panel).
- `IgxList`:
    - the control now supports **ng-templates** which are shown "under" a list item when it is left or right panned. The templates are distinguished using the `igxListItemLeftPanning` and `igxListItemRightPanning` directives set on the templates.
    - the IgxList's `onLeftPan` and `onRightPan` events now have an argument of type `IListItemPanningEventArgs` (instead of `IgxListItemComponent`). The event argument has the following fields:
        - **item** of type `IgxListItemComponent`
        - **direction** of type `IgxListPanState`
        - **keepItem** of type `boolean`
- `igxTooltip` and `igxTooltipTarget` directives:
    - Added `IgxTooltipDirective`.
        - An element that uses the `igxTooltip` directive is used as a tooltip for a specific target (anchor).
        - Extends `IgxToggleDirective`.
        - Exported with the name **tooltip**.
    - Added `IgxTooltipTargetDirective`.
        - An element that uses the `igxTooltipTarget` directive is used as a target (anchor) for a specific tooltip.
        - Extends `IgxToggleActionDirective`.
        - Exported with the name **tooltipTarget**.
    - Both new directives are used in combination to set a tooltip to an element. For more detailed information, see the [README](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/directives/tooltip/README.md).
- `igxToggle`:
    - Introduced reposition method which allows a user to force toggle to reposition according its position strategy.
- `IgxDrag` and `IgxDrop` directives available.
    - `IgxDrag` allows any kind of element to be moved/dragged around the page without changing its position in the DOM. Supports Desktop/Mixed/Touch environments.
    - `IgxDrop` allows any element to act as a drop area where any `igxDrag` element can be dragged into and dropped. Includes default logic that moves the dropped element from its original position to a child of the `igxDrop` element.
    - Combined they provide a way to move elements around the page by dragging them. For more detail see the [README](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/directives/dragdrop/README.md).
- `IgxGrid` keyboard navigation
When you focus a specific cell and press one of the following key combinations, the described behaviour is now performed:
    - `Ctrl + Arrow Key Up` - navigates to the first cell in the current column;
    - `Ctrl + Arrow Down` - navigates to the last cell in the current column;
    - `Home` - provide the same behavior as Ctrl + Arrow Left - navigates to the first cell from the current row;
    - `End` - provide the same behavior as Ctrl + Arrow Right - navigates to the last cell from the current row;
    - `Ctrl + Home` - navigates to the first cell in the grid;
    - `Ctrl + End` - navigates to the last cell in the grid;
    - `Tab` - sequentially move the focus over the next cell on the row and if the last cell is reached move to next row. If next row is group row the whole row is focused, if it is data row, move focus over the first cell;
    - `Shift + Tab` - sequentially move focus to the previous cell on the row, if the first cell is reached move the focus to the previous row. If previous row is group row focus the whole row or if it is data row, focus the last cell of the row;
    - `Space` over Cell - if the row is selectable, on keydown space triggers row selection
    - `Arrow Left` over GroupRow - collapse the group row content if the row is not already collapsed;
    - `Arrow Right` over GroupRow - expand the group row content if the row is not already expanded;
    - on mouse `wheel` the focused element is blurred;
    - **Breaking change**  `space` handler for the group row has been removed; so `Space` does not toggle the group row;
    - **Breaking change** cell selection is preserved when the focus is moved to group row.
    - Introduced `onFocusChange` event. The event is cancelable and output argument from type `IFocusChangeEventArgs`;
    - For more detailed information see the [official keyboard navigation specification](https://github.com/IgniteUI/igniteui-angular/wiki/igxGrid-Specification#kb-navigation).

## 6.1.9

### General

- `sortStrategy` input exposed to provide custom sort strategy for the `IgxColumnComponent`. The custom strategy should implement the `ISortingStrategy` interface, or can extend the base `DefaultSortingStrategy` class and override all or some of its public/protected members.
- The previously optional `ignoreCase` and `strategy` of the `ISortingExpression` interface are no longer optional. In order to use our default sorting strategy in expressions built programmatically, you need to pass `DefaultSortingStrategy.instance()` or any implementation of the `ISortingStrategy` interface.
- `groupingComparer` input exposed to provide custom grouping compare function for the `IgxColumnComponent`. The function receives two values and should return `0` if they are to considered members of the same group.

## 6.1.8

### Bug fixes

- Fix sorting and groupby expression not syncing when there are already sorted columns. #2786
- GroupBy Chip sorting direction indicator is not changed if sorting direction is changed #2765
- Failing tests caused by inconsistent behavior when sorting a column with equal values #2767
- IgxGridComponent.groupingExpressions is of type any #2758

## 6.1.7

### Bug Fixes
- IgxSelectionAPIService allows to add items with id which is undefined #2581
- FilteredSortedData collection holds the original data after first filtering operation is done #2611
- Calendar improvement of "selected" getter #2687
- Improve igxCalendar performance #2675
- Add Azure Pipelines CI and PR builds #2605
- The igxDatePicker changes the time portion of a provided date #2561
- IgxChip remove icon has wrong color #2573
- Chip has intrinsic margin #2662
- IgxChip remove icon has wrong color #2573
- ChipsArea's OnSelection output is not emitted on initialization #2640

## 6.1.6

### Bug Fixes
- IgxChip raises onSelection before onRemove #2612
- Summaries are shown on horizontal scrolling when Row Selectors are enabled #2522
- Bug - IgxCombo - Combo does not bind properly with [(ngModel)] and simple data (e.g. string[]) #2620
- Missing backtick in comment #2537
- IgxSelectionAPIService allows to add items with id which is undefined #2581
- Circular bar text is clipped #2370
- Update all angular async Calendar tests to await async #2582
- InvalidPipeArgument: 'inable to convert "" into a date for pipe 'DatePipe' #2520
- All cells in the row enter in edit mode if igx-columns are recreated. #2516

## 6.1.5
- **General**
    - `IgxChip`
        - Introduced event argument types to all `EventEmitter` `@Output`s.
        - A chip can now be selected with the API with the new `selected` input. The `selected` input overrides the `selectable` input value.
        - **Breaking change** `onSelection`'s EventEmitter interface property `nextStatus` is renamed to `selected`.
    - `IgxChipArea`
        - Introduced event argument types to all `EventEmitter` `@Output`s.
    - `igxFor`
        - Adding inertia scrolling for touch devices. This also affects the following components that virtualize their content via the igxFor - `igxGrid`, `igxCombo`.
    - `igxGrid`
        - Adding inertia scrolling for touch devices.
    - `igxCombo`
        - Adding inertia scrolling for touch devices.
    - `IgxCalendar` - `deselectDate` method added that deselects date(s) (based on the selection type)
    - `IgxDatePicker` - `deselectDate` method added that deselects the calendar date.

### Bug Fixes
- igx-tabs : When you move the tab key, the contents of other tabs are displayed. #2550
- Prevent default scroll behavior when using keyboard navigation. #2496
- Error is thrown on ng serve --prod #2540
- onSelection event is not fired when a cell in last visible row is row is selected and press arrow Down #2509
- Add deselect method to igxCalendar #2424
- Time starts from 03 minutes instead of 00 #2541
- Replace EventEmitter<any> with the respective interface for the event #2481
- Cannot scroll last item in view #2504
- Japanese character is redundantly inserted into textbox on filter dialog on Safari #2316
- Improve row selection performance #1258
- igxRipple - Mousedown event doesn't bubble up when igxRipple is attached to elements. #2473
- Add default formatting for numbers in igx-grid #1197
- An error is returned when update a filtered cell #2465
- Grid Keyboard navigation performance issue #1923
- Vertical scrolling performance is slower when grouping is applied. #2421

## 6.1.4

### Bug Fixes

- Bottom of letters fall of in the label of igx-tabs-group #1978
- The search highlight and info are not updated correctly after editing a cell value of the grid #2388
- Cannot set chip as selected through API if selectable is false #2383
- Pressing 'Home/End' keys is not moving the focus to the first/last item #2332
- Cannot set igxChip as selected #2378
- Scrolling using touch is not working on Edge and Internet Explorer 11 #1639
- IgxCombo - Selection - Cannot override combo selection through the onSelectionChange event #2440
- igx-grid - `updateCell` method doesn't update cells that are not rendered. #2350

## 6.1.3
- **General**
    - Added ES7 polyfill for Object for IE. This should be added to the polyfills in order for the igxGrid to render under IE.
        ```
        import 'core-js/es7/object';
        ```

- `igxTabs`
    - `selectedIndex` property has an `@Input` setter and can be set both in markup and in code behind.
- `igxDropDownItem`
    - `isSelected` has a public setter and is now an `@Input` property that can be used for template binding.
- `igxGrid`
    - **Breaking change** `applyNumberCSSClass` and `columnType` getters are removed.
    - `isUnary` property added to IFilteringOperation
    - `igxColumn`
        - The footerTemplate property is removed.
    - `igxColumnGroup`
        - The footerTemplate property is removed.
    - exposed `autosize()` method on `IgxColumnComponent`. It allows the user to programatically change the size of a column according to it's largest visible cell.
    - Initializing an `igxGrid` component without setting height, inside a container without height defined, now causes the grid to render 10 records from the data view or all of the records if there are fewer than 10 available.
- `igxCombo`
    - **Breaking change** igxCombo default `width` is set to 100%
    - **Breaking change** `itemsMaxWidth` is renamed to `itemsWidth`
- `igxLinearBar` and `igxCircularBar`
    - exposed `step` input which determines the update step of the progress indicator. By default it is one percent of the maximum value.
    - `IgxCircularBar` `text` input property exposed to set the text to be displayed inside the circular bar.

### Bug fixes

- igx-grid - cannot auto-size columns by double-clicking in IE11 #2025
- Animation for removing item from list is very quick, must be more smoothly. #2306
- circular and linear bars - prevent progress exceeding, smooth update when operate with big nums, allow floating point nums, expose step input #2163
- Blank space on the right of igxGrid when there is a hidden column and grid width is 100% #2249
- Igx Combo throws errors when data is set to null or undefined #2300
- Top cell is not positioned aligned to the header, after keyboard navigation #1185
- In carousel when call method remove for selected slide it is still previewed #2182
- In grid paging paginate and page should check if the page is greater than the totalPages #2288
- Typos and inaccuracies in IgxSnackbar's readme. #2250
- The grid enables all the columns to be declared as pinned in the template #1612
- Combo - Keyboard Navigation - Add Item button fires on Keydown.Space #2266
- Reduce the use of MutationObservers in the IgxTextHighlightDirective #2251
- Improve row selection performance #1258
- Filter UI dialog redraws #2038
- Can't navigate from first row cell to selection checkbox with key combination #1937
- Incorrect position pinning of Navigation Drawer #2013
- Keyboard navigation not working correctly whith column moving and cell selection #2086
- Grid Layout is broken when you hide column #2121
- IgxDateFilteringOperand's operation "doesNotEqual" doesn't work if the "equals" operation is localized(modified). #2202
- aside in igx-nav-drawer surpasses height of igx-nav-drawer #1981
- The button for collapse/expand all in groupby is not working correctly #2200
- IgxDropDown Item cannot be set as selected. #2061
- IgxBooleanFilteringOperand doesn't work if the operation 'all' is localized(modified). #2067
- columnMove doesn't work if no data is loaded. #2158
- Combo's clear button should be just an icon #2099
- Default combo width should be 100% #2097
- The combo list disappears after disabling Filtering at runtime #2108
- igx-slider - slider comes to not work well after changing maxValue. #920
- Search match highlight not always scrolled into view #1886
- When groupby row is focused and spacebar is pressed the browser scrolls down, everywhere except Chrome, although it should only collapse the group #1947
- Grid data bind fails initially until window resize #1614
- Localization (i18n) for grid grouping area string #2046
- When delete all records in the last page pager should be changed #2014
- Filter icon in the header changes its position #2036

## 6.1.2
- `igxCombo` improvements
    - Remote Data Binding fixes - selection preserving and keyboard navigation.

    For more detailed information see the [official igxCombo documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/combo).

**General**
- Added `jsZip` as a Dependency.

### Bug Fixes

- Grid Layout is broken when you change displayDensity runtime #2005
- Add empty grid template #2035
- Page Up/Page Down buttons don't scroll the grid #606
- Icon component is not properly exported #2072
- Adding density to chip doesn't make the density style to apply when it is dragged #1846
- Update jszip as dependency #2043
- No message is displayed when there is empty grid data without filtering enabled. #2001
- The only possible range of setting minValue to igxSlider is between [0..99] #2033
- Bootstrap & IgniteUI issues #1548
- Remove tabs from collection -> TabCollectionChange Output #1972
- 6.1.1 error on npm install #2023
- Remote binding combo doesn't store the selected fields when scrolled or collapsed #1944
- Exception is thrown when hovering a chip with a column header #1813
- IgxCombo - Remote Virtualization Keyboard Navigation #1987

## 6.1.1
- `igxTimePicker` changes
    - `onClose` event added.

### Bug Fixes

- Exit edit mode when move column through grid API #1932
- IgxListItemComponent and the two template directives are missing from public_api.ts. #1939
- Add Item button disappears after adding same item twice successively. #1938
- onTabItemDeselected is called for every not selected tab item #1952
- Exit edit mode when pin/unpin column through grid API #1933
- Selected combo item doesn't have the proper focused styles #1948
- Time-picker does not open on button-press. #1949
- Custom cell not rendering with grid searching functionality #1931
- Regular highlight makes the highlighted text unreadable when the row is selected. #1852
- DatePicker focus is wrong on select date value #1965
- add sass docs, grid document updates and input-group theme-related fixes #1993
- DatePicker focus handler and AoT build #1994
- Change displayDensity runtime #1974
- Change IgxGrid display density runtime #1998
- Error is thrown when using igx-grid theme without $content-background #1996
- Update npm deploy token #2002

## 6.1.0
- `igxOverlay` service added. **igxOverlayService** allows you to show any component above all elements in page. For more detailed information see the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/overlay-main)
- Added **igxRadioGroup** directive. It allows better control over its child `igxRadio` components and support template-driven and reactive forms.
- Added `column moving` feature to `igxGrid`, enabled on a per-column level. **Column moving** allows you to reorder the `igxGrid` columns via standard drag/drop mouse or touch gestures.
    For more detailed information see the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/column-moving).
- `igx-tab-bar` selector removed from `IgxBottomNavComponent`.
- `igxGrid` filtering operands
- `igxGrid`
    - **Breaking change** `filter_multiple` method is removed. `filter` method and `filteringExpressionsTree` property could be used instead.
    - **Breaking change** `filter` method has new signature. It now accepts the following parameters:
        - `name` - the name of the column to be filtered.
        - `value` - the value to be used for filtering.
        - `conditionOrExpressionTree` - (optional) this parameter accepts object of type `IFilteringOperation` or `IFilteringExpressionsTree`. If only a simple filtering is required a filtering operation could be passes (see bellow for more info). In case of advanced filtering an expressions tree containing complex filtering logic could be passed.
        - `ignoreCase` - (optional) - whether the filtering would be case sensitive or not.
    - **Breaking change** `onFilteringDone` event now have only one parameter - `IFilteringExpressionsTree` which contains the filtering state of the filtered column.
    - `filter_global` method clears all existing filters and applies the new filtering condition to all grid's columns.
    - filtering operands:
        - **Breaking change** `IFilteringExpression` condition property is no longer a direct reference to a filtering condition method, instead it's a reference to an `IFilteringOperation`
        - 5 filtering operand classes are now exposed
            - `IgxFilteringOperand` is a base filtering operand, which can be inherited when defining custom filtering conditions
            - `IgxBooleanFilteringOperand` defines all default filtering conditions for `boolean` types
            - `IgxNumberFilteringOperand` defines all default filtering conditions for `numeric` types
            - `IgxStringFilteringOperand` defines all default filtering conditions for `string` types
            - `IgxDateFilteringOperand` defines all default filtering conditions for `Date` types
        - `IgxColumnComponent` now exposes a `filters` property, which takes an `IgxFilteringOperand` class reference
            - Custom filters can now be provided to grid columns by populating the `operations` property of the `IgxFilteringOperand` with operations of `IFilteringOperation` type
```
export class IgxCustomFilteringOperand extends IgxFilteringOperand {
    // Making the implementation singleton
    private static _instance: IgxCustomFilteringOperand = null;

    protected constructor() {
        super();
        this.operations = [{
            name: 'custom',
            logic: (target: string) => {
                return target === 'My custom filter';
            }
        }].concat(this.operations); // Keep the empty and notEmpty conditions from base
    }

    // singleton
    // Must implement this method, because the IgxColumnComponent expects it
    public static instance(): IgxCustomFilteringOperand {
        return this._instance || (this._instance = new this());
    }
}
```

- `igxGrid` now supports grouping of columns enabling users to create criteria for organizing data records. To explore the functionality start off by setting some columns as `groupable`:
    ```html
    <igx-grid [data]="data">
        <igx-column [field]="'ProductName'"></igx-column>
        <igx-column [field]="'ReleaseDate'" [groupable]="true"></igx-column>
    </igx-grid>
    ```
   For more information, please head over to `igxGrid`'s [ReadMe](https://github.com/IgniteUI/igniteui-angular/blob/master/src/grid/README.md) or the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/groupby).

- `igxGrid` now supports multi-column headers allowing you to have multiple levels of columns in the header area of the grid.
    For more information, head over to [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/multi-column-headers)
- `igxGrid` theme now has support for alternating grid row background and text colors.
- `igxGrid` now has a toolbar (shown using the `showToolbar` property) which contains the following features:
  - title (specified using the `toolbarTitle` property)
  - column hiding feature (enabled using the `columnHiding` property)
  - column pinning feature (enabled using the `columnPinning` property)
  - export to excel (enabled using the `exportExcel` property)
  - export to CSV (enabled using the `exportCsv` property)
- `igxColumn` changes:
    - **Breaking change** filteringExpressions property is removed.
- `igxGrid` API is updated
    - **Breaking change** deleteRow(rowSelector: any) method will delete the specified row only if the primary key is defined. The method accept rowSelector as a parameter,  which is the rowID.
    - **Breaking change** updateRow(value: any, rowSelector: any) method will update the specified row only if the primary key is defined. The method accept value and rowSelector as a parameter, which is the rowID.
    - **Breaking change** updateCell(value: any, rowSelector: any, column: string) method will update the specified cell only if the primary key is defined. The method accept  value, rowSelector,which is the rowID and column name.
    - getCellByKey(rowSelector: any, columnField: string) method is added to grid's API. This method retuns a cell or undefined only if primary key is defined and search for the specified cell by the rowID and column name.
    - getCellByColumn(rowIndex: number, columnField: string) method is updated. This method returns a cell or undefined by using rowIndex and column name.
- `IgxGridRow` API is updated:
    - update(value: any) method is added. The method takes as a parameter the new value, which is to be set to the specidied row.
    - delete() method is added. The method removes the specified row from the grid's data source.

- `igxCell` default editing template is changed according column data type. For more information you can read the [specification](https://github.com/IgniteUI/igniteui-angular/wiki/Cell-Editing) or the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/editing)
- `igxCombo` component added

    ```html
    <igx-combo #combo [data]="towns" [displayKey]="'townName'" [valueKey]="'postCode'" [groupKey]="'province'"
        [allowCustomValues]="true" placeholder="Town(s)" searchPlaceholder="Search town..."></igx-combo>
    ```

    igxCombo features:

        - Data Binding
        - Value Binding
        - Virtualized list
        - Multiple Selection
        - Filtering
        - Grouping
        - Custom values
        - Templates
        - Integration with Template Driven and Reactive Forms
        - Keyboard Navigation
        - Accessibility compliance

    For more detailed information see the [official igxCombo documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/combo).
- `igxDropdown` component added

    ```html
    <igx-drop-down (onSelection)="onSelection($event)" (onOpening)="onOpening($event)">
        <igx-drop-down-item *ngFor="let item of items" disabled={{item.disabled}} isHeader={{item.header}}>
                {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>
    ```

    **igxDropDown** displays a scrollable list of items which may be visually grouped and supports selection of a single item. Clicking or tapping an item selects it and closes the Drop Down.

    A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/drop-down)

    igxDropdown features:

        - Single Selection
        - Grouping
        - Keyboard Navigation
        - Accessibility compliance

- `igxChip` and `igxChipsArea` components added

    ```html
    <igx-chips-area>
        <igx-chip *ngFor="let chip of chipList" [id]="chip.id">
            <label igxLabel>{{chip.text}}</label>
        </igx-chip>
    </igx-chips-area>
    ```

    For more detailed information see the [official igxChip documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/chip).

- `igxToggle` changes
    - `onOpening` event added.
    - `onClosing` event added.
- `igxToggleAction` new `overlaySettings` input controls how applicable targets display content. Provides defaults with positioning based on the host element. The `closeOnOutsideClick` input is deprecated in favor of the new settings and will be removed in the future.

- `igxList` now supports a 'loading' template which is shown when the list is empty and its new `isLoading` property is set to `true`. You can redefine the default loading template by adding an `ng-template` with the `igxDataLoading` directive:

    ```html
    <igx-list [isLoading]="true">
        <ng-template igxDataLoading>
            <p>Please wait, data is loading...</p>
        </ng-template>
    </igx-list>
    ```

- **Breaking changes**:
    - Removed submodule imports. All imports are now resolved from the top level `igniteui-angular` package.
    - `igxGrid` changes:
        - sort API now accepts params of type `ISortingExpression` or `Array<ISortingExpression>`.
    - `igxToggle` changes
        - `collapsed` now read-only, markup input is removed.
        - `onOpen` event renamed to `onOpened`.
        - `onClose` event renamed to `onClosed`.
        - `open` method does not accept fireEvents optional boolean parameter. Now it accepts only overlaySettings optional parameter of type `OverlaySettings`.
        - `close` method does not accept fireEvents optional boolean parameter.
        - `toggle` method does not accept fireEvents optional boolean parameter. Now it accepts only overlaySettings optional parameter of type `OverlaySettings`.
    - `igxDialog` changes
        - `open` method does not accept fireEvents boolean parameter. Now it accepts only overlaySettings optional parameter of type `OverlaySettings`.
- **Breaking change** All properties that were named `isDisabled` have been renamed to `disabled` in order to acheive consistency across our component suite. This affects: date-picker, input directive, input-group, dropdown-item, tabbar and time-picker.
- The **deprecated** `igxForRemote` input for the `igxFor` directive is now removed. Setting the required `totalItemCount` property after receiving the first data chunk is enough to trigger the required functionality.

## 6.0.4
- **igxRadioGroup** directive introduced. It allows better control over its child `igxRadio` components and support template-driven and reactive forms.
- Fixed ReactiveForms validations support for IgxInputGroup. Related [issue](https://github.com/IgniteUI/igniteui-angular/issues/1144).

## 6.0.3
- **igxGrid** exposing the `filteredSortedData` method publicly - returns the grid data with current filtering and sorting applied.

## 6.0.2
- **igxGrid** Improve scrolling on mac [#1563](https://github.com/IgniteUI/igniteui-angular/pull/1563)
- The `ng update igniteui-angular` migration schematics now also update the theme import path in SASS files. [#1582](https://github.com/IgniteUI/igniteui-angular/issues/1582)

## 6.0.1
- Introduced migration schematics to integrate with the Angular CLI update command. You can now run

  `ng update igniteui-angular`

  in existing projects to both update the package and apply any migrations needed to your project. Make sure to commit project state before proceeding.
  Currently these cover converting submodule imports as well as the deprecation of `igxForRemote` and rename of `igx-tab-bar` to `igx-bottom-nav` from 6.0.0.
- **Breaking changes**:
    - Removed submodule imports. All imports are now resolved from the top level `igniteui-angular` package. You can use `ng update igniteui-angular` when updating to automatically convert existing submodule imports in the project.
    - Summary functions for each IgxSummaryOperand class has been made `static`. So now you can use them in the following way:
    ```typescript
    import { IgxNumberSummaryOperand, IgxSummaryOperand } from "igniteui-angular";
    class CustomSummary extends IgxSummaryOperand {
    constructor() {
      super();
    }
    public operate(data?: any[]) {
      const result = super.operate(data);
      result.push({
        key: "Min",
        label: "Min",
        summaryResult: IgxNumberSummaryOperand.min(data)
      });
      return result;
    }
  }
    ```


## 6.0.0
- Theming - You can now use css variables to style the component instances you include in your project.
- Added `onDoubleClick` output to `igxGrid` to emit the double clicked cell.
- Added `findNext`, `findPrev` and `clearSearch` methods to the IgxGridComponent which allow easy search of the grid data, even when the grid is virtualized.
- Added `IgxTextHighlightDirective` which highlights parts of a DOM element and keeps and updates "active" highlight.
- Added `All` option to the filter UI select for boolean columns
- Update to Angular 6

## 5.3.1
- igx-dialog changes
    - Dialog title as well as dialog actions (buttons) can be customized. For more information navigate to the [ReadMe](https://github.com/IgniteUI/igniteui-angular/blob/master/src/dialog/README.md).
- Filtering a boolean column by `false` condition will return only the real `false` values, excluding `null` and `undefined`. Filtering by `Null` will return the `null` values and filtering by `Empty` will return the `undefined`.
- The `Filter` button in the filtering UI is replaced with a `Close` button that is always active and closes the UI.
- Filtering UI input displays a `X` icon that clears the input.

## 5.3.0
- Added `rowSelectable` property to `igxGrid`
    - Setting `rowSelectable` to `true` enables multiple row selection for the `igx-grid` component. Adds a checkbox column that allows (de)selection of one, multiple or all (via header checkbox) rows.
    - For more information about the `rowSelectable` property and working with grid row, please read the `igxGrid`'s [ReadMe](https://github.com/IgniteUI/igniteui-angular/blob/master/src/grid/README.md) about selection or see the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/selection)
- Added `onContextMenu` output to `igxGrid` to emit the clicked cell.
- `igx-datePicker`: Added `onClose` event.
- `igxTextSelection` directive added
    - `igxTextSelection` directive allows you to select the whole text range for every element with text content it is applied.
- `igxFocus` directive added
    - `igxFocus` directive allows you to force focus for every element it is applied.
- `igx-time-picker` component added
    - `igx-time-picker` allows user to select time, from a dialog with spinners, which is presented into input field.
    - For more information navigate to the [ReadMe](https://github.com/IgniteUI/igniteui-angular/blob/master/src/time-piker/README.md).
- `igx-tab-bar` changes
    - **Breaking changes**: `IgxTabBarComponent` is renamed to `IgxBottomNavComponent` and `IgxTabBarModule` is renamed to `IgxBottomNavModule`.
    - `igx-tab-bar` selector is deprecated. Use `igx-bottom-nav` selector instead.
- `igx-tabs` component added
    - `igx-tabs` allows users to switch between different views. The `igx-tabs` component places the tabs headers at the top and allows scrolling when there are multiple tab items outside the visible area. Tabs are ordered in a single row above their associated content.
    - For more information navigate to [ReadMe](https://github.com/IgniteUI/igniteui-angular/blob/master/src/tabs/README.md).
- Added column pinning in the list of features available for `igxGrid`. Pinning is available though the API. Try the following:
   ```typescript
   const column = this.grid.getColumnByName(name);
   column.pin();
   ```
   For more information, please head over to `igxGrid`'s [ReadMe](https://github.com/IgniteUI/igniteui-angular/blob/master/src/grid/README.md) or the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/column-pinning).
- Added `summaries` feature to `igxGrid`, enabled on a per-column level. **Grid summaries** gives you a predefined set of default summaries, depending on the type of data in the column.
    For more detailed information read `igxGrid`'s [ReadMe](https://github.com/IgniteUI/igniteui-angular/blob/master/src/grid/README.md) or see the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/summaries).
- Added `columnWidth` option to `igxGrid`. The option sets the default width that will be applied to columns that have no explicit width set. For more detailed information read `igxGrid`'s [ReadMe](https://github.com/IgniteUI/igniteui-angular/blob/master/src/grid/README.md)
- Added API to `igxGrid` that allows for vertical remote virtualization. For guidance on how to implement such in your application, please refer to the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/virtualization)
- Added smooth scrolling for the `igxForOf` directive making the scrolling experience both vertically and horizontally much more natural and similar to a native scroll.
- Added `onCellClick` event.
- `igxForOf` now requires that its parent container's `overflow` is set to `hidden` and `position` to `relative`. It is recommended that its height is set as well so that the display container of the virtualized content can be positioned with an offset inside without visually affecting other elements on the page.
    ```html
    <div style='position: relative; height: 500px; overflow: hidden'>
        <ng-template igxFor let-item [igxForOf]="data" #virtDirVertical
                [igxForScrollOrientation]="'vertical'"
                [igxForContainerSize]='"500px"'
                [igxForItemSize]='"50px"'
                let-rowIndex="index">
                <div style='height: 50px;'>{{rowIndex}} : {{item.text}}</div>
        </ng-template>
    </div>
    ```
- Removed the `dirty` local template variable previously exposed by the `igxFor` directive.
- The `igxForRemote` input for the `igxFor` directive is now **deprecated**. Setting the required `totalItemCount` property after receiving the first data chunk is enough to trigger the required functionality.
- the `igx-icon` component can now work with both glyph and ligature-based icon font sets. We've also included a brand new Icon Service, which helps you create aliases for the icon fonts you've included in your project. The service also allows you to define the default icon set used throughout your app.
- Added the option to conditionally disable the `igx-ripple` directive through the `igxRippleDisabled` property.
- Updated styling and interaction animations of the `igx-checkbox`, `igx-switch`, and `igx-radio` components.
- Added `indeterminate` property and styling to the `igx-checkbox` component.
- Added `required` property to the `igx-checkbox`, `igx-radio`, and `igx-switch` components.
- Added `igx-ripple` effect to the `igx-checkbox`, `igx-switch`, and `igx-radio` components. The effect can be disabled through the `disableRipple` property.
- Added the ability to specify the label location in the `igx-checkbox`, `igx-switch`, and `igx-radio` components through the `labelPosition` property. It can either be `before` or `after`.
- You can now use any element as label on the `igx-checkbox`, `igx-switch`, and `igx-radio` components via the aria-labelledby property.
- You can now have invisible label on the `igx-checkbox`, `igx-switch`, and `igx-radio` components via the aria-label property.
- Added the ability to toggle the `igx-checkbox` and `igx-switch` checked state programmatically via `toggle` method on the component instance.
- Added the ability to select an `igx-radio` programmatically via `select` method on the component instance.
- Fixed a bug on the `igx-checkbox` and `igx-radio` components where the click event was being triggered twice on click.
- Fixed a bug where the `igx-checkbox`, `igx-switch`, and `igx-radio` change event was not being triggered on label click.
- `igxМask` directive added
    - `igxМask` provide means for controlling user input and formatting the visible value based on a configurable mask rules. For more detailed information see [`igxMask README file`](https://github.com/IgniteUI/igniteui-angular/blob/master/src/directives/mask/README.md)
- `igxInputGroup` component added - used as a container for the `igxLabel`, `igxInput`, `igxPrefix`, `igxSuffix` and `igxHint` directives.
- `igxPrefix` directive added - used for input prefixes.
- `igxSuffix` directive added - used for input suffixes.
- `igxHint` directive added - used for input hints.
- `igxInput` directive breaking changes:
    - the directive should be wrapped by `igxInputGroup` component
    - `IgxInputGroupModule` should be imported instead of `IgxInputModule`
- `igxExcelExportService` and `igxCSVExportService` added. They add export capabilities to the `igxGrid`. For more information, please visit the [igxExcelExportService specification](https://github.com/IgniteUI/igniteui-angular/wiki/IgxExcelExporterService-Specification) and the [igxCSVExportService specification](https://github.com/IgniteUI/igniteui-angular/wiki/CSV-Exporter-Service-Specification).
- **General**
    - Added event argument types to all `EventEmitter` `@Output`s. #798 #740
    - Reviewed and added missing argument types to the following `EventEmitter`s
        - The `igxGrid` `onEditDone` now exposes arguments of type `IGridEditEventArgs`. The arguments expose `row` and `cell` objects where if the editing is performed on a cell, the edited `cell` and the `row` the cell belongs to are exposed. If row editing is performed, the `cell` object is null. In addition the `currentValue` and `newValue` arguments are exposed. If you assign a value to the `newValue` in your handler, then the editing will conclude with the value you've supplied.
        - The `igxGrid` `onSelection` now correctly propagates the original `event` in the `IGridCellEventArgs`.
    - Added `jsZip` as a Peer Dependency.
- `primaryKey` attribute added to `igxGrid`
    - `primaryKey` allows for a property name from the data source to be specified. If specified, `primaryKey` can be used instead of `index` to indentify grid rows from the `igxGrid.rowList`. As such, `primaryKey` can be used for selecting rows for the following `igxGrid` methods - `deleteRow`, `updateRow`, `updateCell`, `getCellByColumn`, `getRowByKey`
    - `primaryKey` requires all of the data for the specified property name to have unique values in order to function as expected.
    - as it provides a unique identifier for each data member (and therefore row), `primaryKey` is best suited for addressing grid row entries. If DOM virtualization is in place for the grid data, the row `index` property can be reused (for instance, when filtering/sorting the data), whereas `primaryKey` remains unique. Ideally, when a persistent reference to a row has to be established, `primaryKey` should be used.
- **Theming**
    - Added a `utilities` module to the theming engine to allow for easier import of theming functions and mixins, such as igx-color, igx-palette, igx-elevation, etc. To import the utilities do ```@import '~igniteui-angular/core/styles/themes/utilities';```

## 5.2.1
- `hammerjs` and `@types/hammerjs` are removed from `peerDependencies` and were added as `dependencies`. So if you are using Igniteui-Angular version 5.2.1 or above it is enough to run `npm install igniteui-angular` in your project for getting started. For more detailed information see [`Ignite UI for Angular Getting Started`](https://www.infragistics.com/products/ignite-ui-angular/getting-started)
- `web-animations-js` is added as Peer Dependency.
- `Theming` bug fixes and improvements.
- Use the following command to generate `Ignite UI for Angular Themes` documentation - `npm run build:docs`. Navigate to `dist/docs/sass` and open `index.html` file.

## 5.2.0
- `igxForOf` directive added
    - `igxForOf` is now available as an alternative to `ngForOf` for templating large amounts of data. The `igxForOf` uses virtualization technology behind the scenes to optimize DOM rendering and memory consumption. Virtualization technology works similar to Paging by slicing the data into smaller chucks which are swapped from a container viewport while the user scrolls the data horizontally/vertically. The difference with the Paging is that virtualization mimics the natural behavior of the scrollbar.
- `igxToggle` and `igxToggleAction` directives added
    - `igxToggle` allows users to implement toggleable components/views (eg. dropdowns), while `igxToggleAction` can control the
      `igxToggle` directive. Refer to the official documentation for more information.
    - `igxToggle` requires `BrowserAnimationsModule` to be imported in your application.
- [`Ignite UI for Angular Theming`](https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes) - comprehensive set of **Sass** functions and mixins will give the ability to easily style your entire application or only certain parts of it.
    - Previously bundled fonts, are now listed as external dependencies. You should supply both the [Material Icons](http://google.github.io/material-design-icons/) and [Titillium Web](https://fonts.google.com/selection?selection.family=Titillium+Web:300,400,600,700) fonts yourself by either hosting or using CDN.
- `igx-grid` changes
    - The component now uses the new `igxForOf` directive to virtualize its content both vertically and horizontally dramatically improving performance for applications displaying large amounts of data.
    - Data-bound Input property `filtering` changed to `filterable`:

    ```html
    <igx-grid [data]="data">
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'"
            [filterable]="true" dataType="date">
        </igx-column>
    </igx-grid>
    ```

    - @HostBinding `min-width` added to `IgxGridCellComponent` and `IgxGridHeaderCell`
    - The IgxGridCellComponent no longer has a value setter, but instead has an `update` modifier.

    ```html
    <ng-template igxCell let-cell="cell">
        {{ cell.update("newValue") }}
    </ng-template>
    ```
    - Class `IgxGridFiltering` renamed to `IgxGridFilteringComponent `
    - The grid filtering UI dropdowns are now controlled by the `igxToggle` directive.
      - Make sure to import `BrowserAnimationsModule` inside your application module as `igxToggle` uses animations for state transition.
    - `state` input
        - filtering expressions and sorting expressions provided
    - Removed `onCellSelection` and `onRowSelection` event emitters, `onSelection` added instead.
    - Removed `onBeforeProcess` event emitter.
    - Removed `onMovingDone` event emitter.
    - Removed methods `focusCell` and `focusRow`.
    - Renamed method `filterData` to `filter`.
    - New methods `filterGlobal` and `clearFilter`.
    - New method `clearSort`.
    - Renamed method `sortColumn` to `sort`.
    - New Input `sortingIgnoreCase` - Ignore capitalization of words.
- `igx-navigation-drawer` changes
    - `NavigationDrawer` renamed to `IgxNavigationDrawerComponent`
    - `NavigationDrawerModule` renamed to `IgxNavigationDrawerModule`
    - `IgxNavigationDirectives` renamed to `IgxNavigationModule`
    - `NavigationService` renamed to `IgxNavigationService`
    - `NavigationToggle` renamed to `IgxNavigationToggleDirective`
    - `NavigationClose` renamed to `IgxNavigationCloseDirective`
    - Content selector `ig-drawer-content` replaced with `<ng-template igxDrawer>`
    - Content selector `ig-drawer-mini-content` replaced with `<ng-template igxDrawerMini>`
    - CSS class `ig-nav-drawer-overlay` renamed to `igx-nav-drawer__overlay`
    - CSS class `ig-nav-drawer` renamed to `igx-nav-drawer`
- `igxInput` changes
    - CSS class `ig-form-group` to `igx-form-group`
- `igxBadge` changes
    - From now on, the Badge position is set by css class, which specifies an absolute position as well as top/bottom/left/right properties. The Badge position input should not be used.
- `igx-avatar` changes
    - [Initials type avatar is using SVG element from now on](https://github.com/IgniteUI/igniteui-angular/issues/136)
- `igx-calendar` changes
    - `formatViews` - Controls whether the date parts in the different calendar views should be formatted according to the provided `locale` and `formatOptions`.
    - `templating` - The **igxCalendar** supports now templating of its header and subheader parts.
    - `vertical` input - Controls the layout of the calendar component. When vertical is set to `true` the calendar header will be rendered to the side of the calendar body.

- `igx-nav-bar` changes
    -   Currently `isActionButtonVisible` resolves to `false` if actionButtonIcon is not defined.
- `igx-tab-bar` changes
    - custom content can be added for tabs

    ```html
    <igx-bottom-nav>
        <igx-tab-panel>
            <ng-template igxTab>
                <igx-avatar initials="T1">
                </igx-avatar>
            </ng-template>
            <h1>Tab 1 Content</h1>
        </igx-tab-panel>
    </igx-bottom-nav>
    ```

- `igx-scroll` component deleted
    - `igx-scroll` component is not available anymore due newly implemented `igxForOf` directive.

- [`igx-list` changes](https://github.com/IgniteUI/igniteui-angular/issues/528)
    - `igxEmptyList` directive added
        The list no longer has `emptyListImage`, `emptyListMessage`, `emptyListButtonText`, `emptyListButtonClick` and `hasNoItemsTemplate` members.
        Instead of them, the `igxEmptyListTemplateDirective` can be used for templating the list when it is empty (or use the default empty template).
        ```html
        <igx-list>
            <ng-template igxEmptyList>
                <p>My custom empty list template</p>
            </ng-template>
        </igx-list>
        ```
    - `onItemClicked` event emitter added
        ```html
        <igx-list (onItemClicked)="itemClicked()">
            <igx-list-item>Item 1</igx-list-item>
            <igx-list-item>Item 2</igx-list-item>
            <igx-list-item>Item 3</igx-list-item>
        </igx-list>
        ```
    - Removed `emptyListImage` property from `IgxListComponent`.
    - Removed `emptyListMessage` property from `IgxListComponent`.
    - Removed `emptyListButtonText` property from `IgxListComponent`.
    - Removed `emptyListButtonClick` event emitter from `IgxListComponent`.
    - Removed `hasNoItemsTemplate` property from `IgxListComponent`.
    - Removed `options` property from `IgxListItemComponent`.
    - Removed `left` property from `IgxListItemComponent`.
    - Removed `href` property from `IgxListItemComponent`.
    - New `emptyListTemplate` input for `IgxListComponent`.
    - New `onItemClicked` event emitter for `IgxListComponent`.
    - New `role` property for `IgxListComponent`.
    - New `innerStyle` property for `IgxListComponent`.
    - New `role` property for `IgxListItemComponent`.
    - New `element` property for `IgxListItemComponent`.
    - New `list` property for `IgxListItemComponent`.
    - New `headerStyle` property for `IgxListItemComponent`.
    - New `innerStyle` property for `IgxListItemComponent`.

- [Renaming and restructuring directives and components](https://github.com/IgniteUI/igniteui-angular/issues/536) based on the [General Angular Naming Guidelines](https://angular.io/guide/styleguide#naming):
    - `IgxAvatar` renamed to `IgxAvatarComponent`
    - `IgxBadge` renamed to `IgxBadgeComponent`
    - `IgxButton` renamed to `IgxButtonDirective`
    - `IgxButtonGroup` renamed to `IgxButtonGroupComponent`
    - `IgxCardHeader` renamed to `IgxCardHeaderDirective`
    - `IgxCardContent` renamed to `IgxCardContentDirective`
    - `IgxCardActions` renamed to `IgxCardActionsDirective`
    - `IgxCardFooter` renamed to `IgxCardFooterDirective`
    - `IgxCarousel` renamed to `IgxCarouselComponent`
    - `IgxInput` renamed to `IgxInputModule`
    - `IgxInputClass` renamed to `IgxInputDirective`
    - `IgxCheckbox` renamed to `IgxCheckboxComponent`
    - `IgxLabel` renamed to `IgxLabelDirective`
    - `IgxIcon` renamed to `IgxIconComponent`
    - `IgxList` renamed to `IgxListComponent`
    - `IgxListItem` renamed to `IgxListItemComponent`
    - `IgxSlide` renamed to `IgxSlideComponent`
    - `IgxDialog` renamed to `IgxDialogComponent`
    - `IgxLayout` renamed to `IgxLayoutModule`
    - `IgxNavbar` renamed to `IgxNavbarComponent`
    - `IgxCircularProgressBar` renamed to `IgxCircularProgressBarComponent`
    - `IgxLinearProgressBar ` renamed to `IgxLinearProgressBarComponent`
    - `IgxRadio` renamed to `IgxRadioComponent`
    - `IgxSlider` renamed to `IgxSliderComponent`
    - `IgxSnackbar` renamed to `IgxSnackbarComponent`
    - `IgxSwitch ` renamed to `IgxSwitchComponent`
    - `IgxTabBar` renamed to `IgxBottomNavComponent`
    - `IgxTabPanel` renamed to `IgxTabPanelComponent`
    - `IgxTab` renamed to `IgxTabComponent`
    - `IgxToast` renamed to `IgxToastComponent`
    - `IgxLabelDirective` moved inside `../directives/label/` folder
    - `IgxInputDirective` moved inside `../directives/input/` folder
    - `IgxButtonDirective` moved inside `../directives/button/` folder
    - `IgxLayoutDirective` moved inside `../directives/layout/` folder
    - `IgxFilterDirective` moved inside `../directives/filter/` folder
    - `IgxDraggableDirective` moved inside `../directives/dragdrop/` folder
    - `IgxRippleDirective` moved inside `../directives/ripple/` folder
    - Folder `"./navigation/nav-service"` renamed to `"./navigation/nav.service"`
