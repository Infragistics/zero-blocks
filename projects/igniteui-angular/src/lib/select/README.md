# igx-select
The `IgxSelectComponent` allows you to select a single item from a drop-down list, by using the mouse or the keyboard to quickly navigate through the items. Using the `igxSelect` you can also iterate selection through all items based on the input of a specific character or multiple characters.

A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/select.html)

# Usage
Basic use of `igx-select` setting the items declaratively:

```html
    <igx-select>
        <igx-select-item [value]="1">Sofia</igx-select-item>
        <igx-select-item [value]="2">London</igx-select-item>
        <igx-select-item [value]="3">Paris</igx-select-item>
        <igx-select-item [value]="4">New York</igx-select-item>
    </igx-select>
```

`igx-select` can also be put inside of a `form` element and in order to do that, you first have to create the template for your control and add the items that it will display:

```html
    <igx-select [(ngModel)]="fruit">
        <igx-select-item value="Orange">Orange</igx-select-item>
        <igx-select-item value="Apple">Apple</igx-select-item>
        <igx-select-item value="Banana">Banana</igx-select-item>
    </igx-select>   
```

Another way to do it would be to simply pass in an array of the items that we want to display to the [*ngForOf*](https://angular.io/api/common/NgForOf) directive:
```html
<igx-select [(ngModel)]="fruit">
    <igx-select-item *ngFor="let fruit of fruits" [value]="fruit">
        {{fruit}}
    </igx-select-item>
</igx-select>
```

Since we are using two-way binding, your class should look something like this:
```ts
export class MyClass {
  public fruit: string = "Apple";
}
```

`igx-select` supports prefixes, suffixes, label, hint and placeholder. You can read more about them [*here*](https://www.infragistics.com/products/ignite-ui-angular/angular/components/input-group) AND [*here*](https://www.infragistics.com/products/ignite-ui-angular/angular/components/label-input).
- The items' list default exapansion panel arrow uses `IgxSuffix` and it can be changed by the user.
- If more than one `IgxSuffix` is used, the expansion arrow will be displayed always last.


## Features

### Value
Sets/Gets the IgxSelect value.
```html
<igx-select [value]="fruit">
    <igx-select-item *ngFor="let fruit of fruits" [value]="fruit">
        {{fruit}}
    </igx-select-item>
</igx-select>
```
<div class="divider--half"></div>

### ngModel
Use the component inside form using ngModel.
```html
    <igx-select [(ngModel)]="fruit">
        <igx-select-item value="Orange">Orange</igx-select-item>
        <igx-select-item value="Apple">Apple</igx-select-item>
        <igx-select-item value="Banana">Banana</igx-select-item>
    </igx-select>
```
<div class="divider--half"></div>

### Disabled
You can disable select using the following code:

```html
<igx-select [disabled]="true"></igx-select>
```
<div class="divider--half"></div>


### OverlaySettings
It is possible to pass custom overlay setting to override the default select overlay settings.
With `igx-select` you are not bound to use any of the [*OverlaySettings*](https://www.infragistics.com/products/ignite-ui-angular/docs/typescript/interfaces/overlaysettings.html) that we provide, instead you may create settings of your own and pass them to it.

To do this you first define your template like so:
```html
<igx-select [overlaySettings]="customOverlaySettings">
    <igx-select-item *ngFor="let item of items">
        {{item}}
    </igx-select-item>
</igx-select>
```
Where the `overlaySettings` propety is bound to your custom settings.
Inside of your class you would have something along the lines of:
```ts
export class MyClass implements OnInit {
    @ViewChild(IgxSelectComponent)
    public igxSelect: IgxSelectComponent;
    public items: string[] = ["Orange", "Apple", "Banana", "Mango", "Tomato"];
    public customOverlaySettings: OverlaySettings;
    public ngOnInit(): void {
        const positionSettings: PositionSettings = {
            closeAnimation: slideOutRight,
            horizontalDirection: HorizontalAlignment.Right,
            horizontalStartPoint: HorizontalAlignment.Left,
            openAnimation: slideInLeft,
            target: this.igxSelect.inputGroup.element.nativeElement,
            verticalDirection: VerticalAlignment.Bottom,
            verticalStartPoint: VerticalAlignment.Bottom
        };
        this.customOverlaySettings = {
            closeOnOutsideClick: false,
            modal: true,
            positionStrategy: new ConnectedPositioningStrategy(
                positionSettings
            ),
            scrollStrategy: new AbsoluteScrollStrategy()
        };
    }
}
```

### Type
Sets Input Group style type. Choose from `line`, `box` or `border`.

```html
    <igx-select [(ngModel)]="fruit" [type]="'border'">
        <igx-select-item value="Orange">Orange</igx-select-item>
        <igx-select-item value="Apple">Apple</igx-select-item>
        <igx-select-item value="Banana">Banana</igx-select-item>
    </igx-select>
```

### DisplayDensity
**igx-select** supports setting of different display densities.
Display density is received through Angular's DI engine or can be set through the `[displayDensity]` input. The possilbe display densities are `compact`, `cosy` and `comfortable` (default).
Setting `[displayDensity]` affects the control's items' and inputs' css properties, most notably heights, padding, font-size.

```html
    <igx-select [(ngModel)]="fruit" [displayDensity]="'comfortable'">
        <igx-select-item value="Orange">Orange</igx-select-item>
        <igx-select-item value="Apple">Apple</igx-select-item>
        <igx-select-item value="Banana">Banana</igx-select-item>
    </igx-select>
```

### Placeholder
Sets the select placeholder, to be displayed if no selection/value is set. 
```html
    <igx-select #select [placeholder]="'Pick One'">
        <igx-select-item value="Orange">Orange</igx-select-item>
        <igx-select-item value="Apple">Apple</igx-select-item>
        <igx-select-item value="Banana">Banana</igx-select-item>
    </igx-select>
```

### Templates
Templates for different parts of the control can be defined, including header and footer, toggle icon, etc.

#### Defining header template:

```html
 <igx-select>
    <ng-template igxSelectHeader>
        <div class="custom-header-class">Custom Header</div>
    </ng-template>
 </igx-select>
```

#### Defining footer template:

```html
 <igx-select>
    <ng-template igxSelectFooter>
        <div class="custom-footer-class">Custom Footer</div>
    </ng-template>
 </igx-select>
```

#### Defining toggle icon template:
```ts
const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
myComponent.select.toggleIconTemplate = myCustomTemplate;
```

```html
<!-- Set in markup -->
 <igx-select #select>
     ...
     <ng-template igxSelectToggleIcon let-collapsed>
         <igx-icon>{{ collapsed ? 'remove_circle' : 'remove_circle_outline'}}</igx-icon>
     </ng-template>
 </igx-select>
```
<div class="divider--half"></div>

## Keyboard Navigation

* Dropdown list gets displayed when:
    * input field is clicked
    * dropdown button is clicked
    * up/down arrow + ALT keys are pressed
    * ENTER key is pressed when select is active
    * SPACE key is pressed when select is active
    * using API open()/toggle() methods

* When opened the dropdown list can be closed by:
    * click on an item of the dropdown list
    * pressing up/down arrow + ALT keys
    * pressing ENTER key 
    * pressing SPACE key 
    * pressing ESC key 
    * clicking outside the dropdown list
    * dropdown button is clicked again
    * using API close()/toggle() methods

* When no select-items are declared, there is no items container displayed.
![](https://i.ibb.co/nm8PVHN/no-items.png)
 
* Opening/closing events are emitted on input click.
* Closing events are emitted on item click.
* Opening/closing events are emitted on toggle button click.
* Opening/closing events are triggered on key interaction.
* Closing events are emitted on clicking outside the component(input blur).
* When dropdown list is opened, items are navigable with Home, End and arrow keys.
* When dropdown list is opened, items are navigable with Up/Down arrow keys until there are list items and selection is not wrapped. 
* When dropdown list is opened, navigation with Up/Down arrow starts from the selected item if any or first list item otherwise.
* When dropdown list is opened, navigation with Up/Down arrow keys skips disabled items.
* When Dropdown list is opened, pressing character key/s iteratively navigates through all item values that start with the corresponding character
* Character key navigation when dropdown is opened is case insensitive
* Character key navigation when dropdown is opened wraps selection
* When Dropdown list is opened, pressing foreign character key/s iteratively navigates through all item values that start with the corresponding character
* Character key navigation when dropdown is opened does not change focus on pressing non-matching characters
* When Dropdown list is closed, interaction with Up/Down arrow keys navigates through items selecting the current one until there are list items and selection is not wrapped. 
* When dropdown list is closed, navigation with Up/Down arrow starts from the selected item if any or first list item otherwise.
* When dropdown list is closed, navigation with Up/Down arrow keys skips and does not select disabled items.
* In case there are is an item with no value set, it will be possible to navigate with Up/Down arrow keys trough it when the select is in collapsed state(clearing input value). 
* When Dropdown list is closed, pressing character key/s iteratively selects through all item values that start with the corresponding character
* Character key navigation when dropdown is closed is case insensitive
* Character key navigation when dropdown is closed wraps selection
* When Dropdown list is closed, pressing foreign character key/s iteratively selects through all item values that start with the corresponding character
* Character key navigation when dropdown is closed does not change selection on pressing non-matching characters

* An item from the dropdown list can be selected by:
    * mouse click
    * ENTER key when item is focused
    * SPACE key when item is focused
    * setting the value property in code
    * setting item's selected property
    * using the API selectItem() method
* The igxSelect allows single-selection only
* First item in the dropdown list is focused if there is not a selected item.
* The input box is populated with the selected item value
* The input box text is updated when the selected option text is changed
* The input box is not populated with the text of an item that is focused but not selected
* No text is appended to the input box when no item is selected and value is not set or does not match any item
* Selection is unchanged when setting the value property to non-existing item value
* Disabled items are not selectable
* Selection is removed if selected option has been deleted
* When value is set to the value of duplicated items, the first one gets selected
* onSelection event is emitted on item selection by mouse click
* onSelection event is emitted on item selection by ENTER/SPACE key
* onSelection event is emitted on setting the value property
* onSelection event is emitted on item selection using the API selectItem() method
* onSelection event is emitted on setting item's selected property
* The component renders all aria attributes properly
* All aria attributes of the dropdown items are set properly
* Selected item is displayed over the input when there is enough space above and below the input. 
* The component scrolls to the selected item and displays it over the input when there is enough space above and below the input.
* When there is some space above the input for one/several items to be displayed and first item is selected, the list displays starting from the input top left point so that the selected item is over the input.  
* When there is some space above the input for one/several items to be displayed and the selected item is in the middle of the list, the list displays above as many items as possible so that the selected item is over the input. 
* When there is some space above the input for the dropdown list to be displayed and one of the last items is selected, the dropdown is displayed over the input so that it starts from its top left point and the selected item is visible. 
* When there is some space below the input for one/several items to be displayed and last item is selected, the list displays starting from the input bottom left point so that the selected item is over the input.  
* When there is some space below the input for one/several items to be displayed and the selected item is in the middle of the list, the list displays above and below as many items as possible so that the selected item is over the input. 
* When there is some space below the input for the dropdown list to be displayed and first item in list is selected, the dropdown is displayed over the input so that it starts from its bottom left point and the selected item is visible.
* The items list default expansion arrow uses IgxSuffix and can be changed by the user.
* If more then one IgxSuffix is used, the expansion arrow will be displayed always as last.


## API
### Properties

 `IgxSelectComponent`

   | Name            | Description                                       | Type                                |
   |-----------------|---------------------------------------------------|-------------------------------------|
   | value           | Sets/Gets the IgxSelect value.                    | any                                 |
   | collapsed       | Gets if the IgxSelect is collapsed.               | boolean                             | 
   | overlaySettings | Sets optional overlay settings.                   | overlaySettings                     | 
   | disabled        | Sets/Gets if the IgxSelect is disabled.           | boolean                             |
   | type            | Sets Input Group style type.                      | string / `line`, `box` or `border`  |
   | displayDensity  | Sets Input Group displayDensity.            | string / `compact`, `cosy` or `comfortable`|
   | placeholder     | Sets the Select placeholder.                      | string                              |


   `IgxSelectItemComponent`

   | Name            | Description                                                         | Type           |
   |-----------------|---------------------------------------------------------------------|----------------|
   | value           | The item value.                                                     | any            |
   | selected        | Sets/Gets if the item is the currently selected one in the dropdown | boolean        |
   | disabled        | Sets/Gets if the given item is disabled                             | boolean        |

### Methods
`IgxSelectComponent`

   | Name            | Description                | Parameters              |
   |-----------------|----------------------------|-------------------------|
   | toggle          | Toggles the IgxSelect.     | overlaySettings?        |
   | open            | Opens the IgxSelect.       | overlaySettings?        |
   | close           | Closes the IgxSelect.      | none                    |
 
### Events
`IgxSelectComponent`

   | Name        | Description                                                             | Cancelable | Parameters |
   |-------------|-------------------------------------------------------------------------|------------|------------|
   | selection | Emitted when item selection is changing, before the selection completes | true       |{ISelectionEventArgs}|
   | opening   | Emitted before the IgxSelect is opened.                                 | true       |            |
   | opened    | Emitted after the IgxSelect is opened.                                  | false      |            |
   | closing   | Emitted before the IgxSelect is closed.                                 | true       |            |
   | closed    | Emitted after the IgxSelect is closed.                                  | false      |            |
