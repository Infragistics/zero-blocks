# igxAutocomplete

The `igxAutocomplete` directive provides a way to enhance a text input by showing a panel of suggested options provided by the developer.

# Usage

The simplest use-case for an end-user should be attaching the directive to an input element and providing to a template for the drop down.
```html
<input igxInput type="text" [igxAutocomplete]="townsPanel" />
<igx-drop-down #townsPanel>
    <igx-drop-down-item *ngFor="let town of towns" [value]="town">
        {{town}}
    </igx-drop-down-item>
</igx-drop-down>
```

# Features

## Keyboard navigation

The following keyboards can be used when navigating through the drop down items:

 - `Arrow Down`, `Arrow Up`, `Alt` + `Arrow Down`, `Alt` + `Arrow Up` will open drop down, if closed.
 - Typing in the input will open drop down, if closed.
 - `Arrow Down` - will move to next drop down item, if drop down opened.
 - `Arrow Up` - will move to previous drop down item, if drop down opened.
 - `Enter` will confirm the already selected item and will close the drop down.
 - `Esc` will close the drop down.

> Note: When autocomplete is opened an then the first item in the list is automatically selected. The same is valid when list is filtered.

## Selection and model binding

When value is selected in the drop down, then input element value is automatically updated.
In order to achieve that define the value property of the drop down item and bind it. Then on selection, the autocomplete will update the bound input value:

```html
<igx-input-group class="group">
    <input igxInput name="towns" type="text" [(ngModel)]="townSelected" required
        [igxAutocomplete]='townsPanel'/>
    <label igxLabel for="towns">Towns</label>
</igx-input-group>
<igx-drop-down #townsPanel>
    <igx-drop-down-item *ngFor="let town of towns" [value]="town">
        {{town}}
    </igx-drop-down-item>
</igx-drop-down>
```

```typescript
@Component({
    selector: 'app-autocomplete-sample',
    styleUrls: ['autocomplete.sample.css'],
    templateUrl: `autocomplete.sample.html`
})
export class AutocompleteSampleComponent {
    townSelected;
    constructor() {
        this.towns = [ 'Sofia', 'Plovdiv', 'Varna', 'Burgas'];
    }
}
```

## Enable/Disable autocomplete drop down

The following sample defines `igxAutocompleteDisabled`, which allows to dynamically enable and disable the autocomplete drop down:

```html
<igx-input-group class="group">
    <input igxInput name="towns" type="text"
        [igxAutocomplete]='townsPanel'
        [igxAutocompleteDisabled]="disabled"/>
    <label igxLabel for="towns">Towns</label>
</igx-input-group>
<igx-drop-down #townsPanel>
    <igx-drop-down-item *ngFor="let town of towns">
        {{town}}
    </igx-drop-down-item>
</igx-drop-down>
<igx-switch name="toggle" [(ngModel)]="!disabled"></igx-switch>
```

```typescript
@Component({
    selector: 'app-autocomplete-sample',
    styleUrls: ['autocomplete.sample.css'],
    templateUrl: `autocomplete.sample.html`
})
export class AutocompleteSampleComponent {
    disabled;
    constructor() {
        this.towns = [ 'Sofia', 'Plovdiv', 'Varna', 'Burgas'];
    }
}
```

> Note: When autocomplete is dynamically disabled, then it will be automatically closed.

### Drop Down settings
The igx-autocomplete drop down positioning, scrolling strategy and outlet can be configured using, the `igxAutocompleteSettings` option. It allows values from type `AutocompleteOverlaySettings`.

The following example displays that the positioning of the drop down can be set to be always above the input, where the directive is applied. It also disables opening and closing animations. For that purpose the `ConnectedPositioningStrategy` is used:

```html
<igx-input-group #inputGroup>
    <input igxInput name="towns" type="text"
        [igxAutocomplete]='townsPanel'
        [igxAutocompleteSettings]='settings'/>
    <label igxLabel for="towns">Towns</label>
</igx-input-group>
<igx-drop-down #townsPanel>
    <igx-drop-down-item *ngFor="let town of towns">
        {{town}}
    </igx-drop-down-item>
</igx-drop-down>
```

```typescript
@Component({
    selector: 'app-autocomplete-sample',
    styleUrls: ['autocomplete.sample.css'],
    templateUrl: `autocomplete.sample.html`
})
export class AutocompleteSampleComponent {
    constructor() {
        this.towns = [ 'Sofia', 'Plovdiv', 'Varna', 'Burgas'];
    }
    @ViewChild('inputGroup', { read: IgxInputGroupComponent }) inputGroup: IgxInputGroupComponent;

    this.settings = {
        positionStrategy: new ConnectedPositioningStrategy({
            closeAnimation: null,
            openAnimation: null,
            verticalDirection: VerticalAlignment.Top
        })
    };
}
```

> Note: The default positioning strategy is `AutoPositionStrategy` and drop down is opened according to the available space.

## Compatibility support

Applying the `igxAutocomplete` directive will decorate the element with the following aria attributes:
 - role="combobox" - role of the element, where the directive is applied.
 - aria-haspopup="listbox" attribute to indicate that igxAutocomplete can popup a container to suggest values.
 - aria-owns="dropDownID" - id of the drop down used for displaying suggestions.
 - aria-expanded="true"/"false" - value depending on the collapsed state of the drop down.

The drop-down component, used as provider for suggestions, will expose the following aria attributes:
 - role="listbox" - applied on the `igx-drop-down` component container
 - role="group" - applied on the `igx-drop-down-item-group` component container
 - role="option" - applied on the `igx-drop-down-item` component container
 - aria-disabled="true"/"false" applied on `igx-drop-down-item`, `igx-drop-down-item-group` component containers when they are disabled.

# API Summary

Properties

| Name   | Type | Description |
|:----------|:------|:------|
| `igxAutocomplete` | `IgxDropDownComponent` | reference to the template providing a markup for the drop down |
| `igxAutocompleteDisabled` | `boolean` | enables/disables the directive. Does not affect the host |
| `igxAutocompleteSettings` | `AutocompleteOverlaySettings` | Settings to configure drop down overlay |

Methods

| Name   |  Description |
|:----------|:------|
| `open` | list of options to choose from |
| `close` |  list of options to choose from |

Events

| Name   |  Description | Cancelable |
|:----------|:------|:------|
| `itemSelected` | list of options to choose from | true


# Examples

## Defining autocomplete with filtering
Using the `igxDropDown` as `igxAutocomplete` options provider allows the developer to define a custom options panel. Drop down features like grouping, custom templating and using all drop down options allows modifications on the drop down applied as autocomplete provider. The following sample demonstrates custom filtering applied to the drop down items:

```html
<igx-input-group class="group">
    <igx-prefix igxRipple><igx-icon>place</igx-icon> </igx-prefix>
    <input igxInput name="towns" type="text" [(ngModel)]="townSelected" required
        [igxAutocomplete]='townsPanel'/>
    <label igxLabel for="towns">Towns</label>
</igx-input-group>
<igx-drop-down #townsPanel maxHeight="400px">
    <igx-drop-down-item *ngFor="let town of towns | startsWith:townSelected" [value]="town">
        {{town}}
    </igx-drop-down-item>
</igx-drop-down>
```

```typescript
@Component({
    selector: 'app-autocomplete-sample',
    styleUrls: ['autocomplete.sample.css'],
    templateUrl: `autocomplete.sample.html`
})
export class AutocompleteSampleComponent {
    constructor() {
        this.towns = [ 'Sofia', 'Plovdiv', 'Varna', 'Burgas'];
    }
}

@Pipe({ name: 'startsWith' })
export class IgxAutocompletePipeStartsWith implements PipeTransform {
    public transform(collection: any[], term = '') {
        return collection.filter(item => item.toString().toLowerCase().startsWith(term.toString().toLowerCase());
    }
}
```
