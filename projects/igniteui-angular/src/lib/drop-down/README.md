# igxDropDown


**igxDropDown** displays a scrollable list of items which may be visually grouped and supports selection of a single item. Clicking or tapping an item selects it and closes the Drop Down.

A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/drop-down)

# Usage
## Drop downs are done by adding **igxDropDownListItems** to **igxDropDown** component

```html
<igx-drop-down>
    <igx-drop-down-item *ngFor="let item of items">
        {{ item.field }}
    </igx-drop-down-item>
</igx-drop-down>
```

To provide more useful visual information, use `isHeader` to group items semantically, or `disabled` to display an item as non-interactive.

```html
<igx-drop-down>
    <igx-drop-down-item *ngFor="let item of items" disabled={{item.disabled}} isHeader={{item.header}}>
        {{ item.field }}
    </igx-drop-down-item>
</igx-drop-down>
```

## Grouping items
The ***igx-drop-down-item-group*** component can be used inside of the ***igx-drop-down*** to group ***igx-drop-down-items***. The example below illustrates how to display hierarchical data in drop down groups:
```typescript
    // in example.component.ts
    export class MyExampleComponent {
        ...
        foods: any[] =  [{
            name: 'Vegetables',
            entries: [{
                    name: 'Cucumber',
                    refNo: `00000` 
                }, {
                    name: 'Lettuce',
                    refNo: `00001`
                },
                ...
            ]   
        }, {
            name: 'Fruits',
            entries: [{
                    name: 'Banana',
                    refNo: `10000` 
                }, {
                    name: 'Tomato',
                    refNo: `10001`
                },
                ...
            ]   
        }];
    }
```
```html
    <!-- in example.component.html -->
    <igx-drop-down>
        <igx-drop-down-item-group *ngFor="let foodGroup of foods" [label]="foodGroup.name">
            <igx-drop-down-item *ngFor="let food of foodGroup.entries" [value]='food.refNo'>
                {{ food.name }}
            </igx-drop-down-item>
        </igx-drop-down-item-group>
    </igx-drop-down>
```

***NOTE:*** The ***igx-drop-down-item-group*** tag can be used for grouping of ***igx-drop-down-item*** only an will forfeit any other content passed to it. 

## Virtualized item list
The `igx-drop-down` supports the use of `IgxForOf` directive for displaying very large lists of data. To use a virtualized list of items in the drop-down, follow the steps below:

### Import IgxForOfModule
```typescript
    import { ..., IgxForOfModule } from 'igniteui-angular';
    ...
    @NgModule({
        imports: [..., IgxForOfModule]
    })
```

### Properly configure the template
Configure the drop-down to use `*igxFor` instead of `ngFor`. Some additional configuration must be passed:
 - scrollOrientation - should be `'vertical'`
 - containerSize - should be set to the height that the items container will have, as `number`. E.g. `public itemsMaxHeight = 480;`
 - itemSize - should be set to the height of the **smallest** item that the list will have, as `number`. E.g. `public itemHeight = 32;`
```html
    <igx-drop-down>
        <div class="wrapping-div">
            <igx-drop-down-item *igxFor="let item of localItems; index as index; scrollOrientation: 'vertical'; containerSize: itemsMaxHeight; itemSize: itemHeight;"
            [value]="item" [index]="index"
            >
                {{ item.data }}
            </igx-drop-down-item>
        </div>
    </igx-drop-down>
```
Furthermore, when using `*igxFor` in the drop-down template, items must have `value` and `index` bound. The `value` property should be unique for each item.

### Styling the container
In order for the drop-down list to properly display, the drop-down items must be wrapped in a container element (e.g. `<div>`).
The container element must have the following styles:
 - `overflow: hidden;`
 - `height` property set to the same as `itemsMaxHeight` in the template, in `px`. E.g. `height: 480px`

## Display Density
**igx-drop-down** supports setting of different display densities.
Display density is received through Angular's DI engine or can be set through the `[displayDensity]` input. The possilbe display densities are `compact`, `cosy` and `comfortable` (default).
Setting `[displayDensity]` affects the control's items' css properties, most notably heights, padding, font-size.

# API Summary
The following table summarizes some of the useful **igx-drop-down** component inputs, outputs and methods.

## Inputs
The following inputs are available in the **igx-drop-down** component:

| Name | Type | Description |
| :--- | :--- | :--- |
| `width` | string | Sets the tab width of the control. |
| `height` | string | Sets the tab height of the control. |
| `maxHeight` | string | defines drop down maximum height |
| `allowItemsFocus` | boolean | Allows items to take focus. |
| `id` | string | Sets the drop down's id. |

<div class="divider--half"></div>

## Outputs
The following outputs are available in the **igx-drop-down** component:

| Name | Cancelable | Description | Parameters
| :--- | :--- | :--- | :--- |
| `selection` | false | Emitted when item selection is changing, before the selection completes. | `{ISelectionEventArgs}` |
| `opening` | true | Emitted before the dropdown is opened. | `IBaseCancelableBrowserEventArgs` |
| `opened` | false | Emitted when a dropdown is being opened. |
| `closing` | true | Emitted before the dropdown is closed. | `IBaseCancelableBrowserEventArgs` |
| `closed` | false | Emitted when a dropdown is being closed. |

***NOTE:*** The using `*igxFor` to virtualize `igx-drop-down-item`s, `onSelection` will emit `newSeleciton` and `oldSelection` as type `{ value: any, index: number }`. 

## Methods
The following methods are available in the **igx-drop-down** component:

| Signature | Description |
| :--- | :--- | :--- |
| `toggle()` | Toggles the drop down opened/closed. |
| `setSelectedItem(index: number)` | Selects dropdown item by index. |
| `open()` | Opens the dropdown. |
| `close()` | Closes the dropdown. |
| `clearSelection()` | Deselects the selected dropdown item. |

## Getters
The following getters are available on the **igx-drop-down** component:

| Name | Type | Description |
| :--- | :--- | :--- |
| `selectedItem` | `any` | Gets the selected item. |
| `collapsed` | `boolean` | Gets if the drop down is collapsed. |
| `items` | `IgxDropDownItemComponent[]` | Gets all of the items but headers. |
| `headers` | `IgxDropDownItemComponent[]` | Gets header items. |
| `element`| `ElementRef` | Get dropdown html element. |
| `scrollContainer`| `ElementRef` | Get drop down's html element of its scroll container. |

***NOTE:*** The using `*igxFor` to virtualize `igx-drop-down-item`s, `selectedItem` will return type `{ value: any, index: number }`, where `value` is the item's bound `value` property and `index` is the item's index property in the data set. 

The following table summarizes some of the useful **igx-drop-down-item** component inputs, outputs and methods.

## Inputs
The following inputs are available in the **igx-drop-down-item** component:

| Name | Type | Description |
| :--- | :--- | :--- |
| `selected` | boolean| Defines if the item is the selected item. Only one item can be selected at time. |
| `isHeader` | boolean| Defines if the item is a group header. |
| `disabled` | boolean| Disables the given item. |
| `index` | number | The data index of the drop down item. |
| `focused` | boolean| Defines if the given item is focused. |
| `value` | any | The value of the drop-down item. |

## Getters
The following getters are available on the **igx-drop-down-item** component:

| Name | Type | Description |
| :--- | :--- | :--- |
| `elementHeight` | `number` | Gets item element height. |
| `element`| `ElementRef` | Get item's html element. |
