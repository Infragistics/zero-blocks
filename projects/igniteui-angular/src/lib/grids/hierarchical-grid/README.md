# igx-hierarchical-grid

The **igx-hierarchical-grid** component provides the ability to represent and manipulate hierarchical data in which each level has a different schema. Each level is represented by a component derived from **igx-grid** and supports most of its functionality.
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/hierarchicalgrid.html).

## Usage

```html
<igx-hierarchical-grid #grid1 [data]="localData" [autoGenerate]="true">
    <igx-row-island [key]="'childData'" [autoGenerate]="true">
    </igx-row-island>
</igx-hierarchical-grid>
```

## Getting Started

### Dependencies
The hierarchical grid is exported as an `NgModule`, thus all you need to do in your application is to import the _IgxHierarchicalGridModule_ inside your `AppModule`.

```typescript
// app.module.ts

import { IgxHierarchicalGridModule } from 'igniteui-angular';

@NgModule({
    imports: [
        ...
        IgxHierarchicalGridModule,
        ...
    ]
})
export class AppModule {}
```

We can obtain a reference to the tree grid in typescript as follows:

```typescript
@ViewChild('hgrid1', { read: IgxHierarchicalGridComponent })
public hgrid1: IgxHierarchicalGridComponent;
```

### Basic configuration

**igx-hierarchical-grid** derives from **igx-grid** and shares most of its functionality. The main difference is that it allows for defining multiple levels of hierarchy that that is configured through a separate tag within the definition of **igx-hierarchical-grid** called **igx-row-island**. The latter component defines the configuration for each child grid for the particular level. Multiple islands per level is also supported.

Two ways of binding a hierarchical grid are supported

#### Using hierarchical data

If the application is designed to loads the whole data for the hierarchical grid in the form of array of objects referencing children arrays of objects, then the hierarchical grid can be configured to read it and bind to it automatically. Each **igx-row-island** should specify the key of the property that holds the children data.

```html
<igx-hierarchical-grid #grid1 [data]="companies" [autoGenerate]="true">
    <igx-row-island [key]="'employees'" [autoGenerate]="true">
    </igx-row-island>
    <igx-row-island [key]="'products'" [autoGenerate]="true">
        <igx-row-island [key]="'shipments'" [autoGenerate]="true">
        </igx-row-island>
    </igx-row-island>
</igx-hierarchical-grid>
```

Notice that instead of `data` the user configures only the `key` that the **igx-hierarchical-grid** needs to read to set the data automatically.

#### Using load-on-demand

Most applications are designed to load as little data as possible initially for faster load times. In such cases **igx-hierarchical-grid** may be configured to allow user-created services to feed it with data on demand. The following configuration uses a special `@Output` and a newly introduced loading-in-progress template to provide a fully-featured load-on-demand.

```html
<igx-hierarchical-grid #grid1 [isLoading]="true" [data]="remoteData" [autoGenerate]="true">
    <igx-row-island #rowIsland1 [key]="'Orders'" [isLoading]="true" [autoGenerate]="true"
    (gridCreated)="gridCreated($event, rowIsland1)">
        <igx-row-island #rowIsland2 [key]="'Order_Details'" [autoGenerate]="true"
        (gridCreated)="gridCreated($event, rowIsland2)">
        </igx-row-island>
    </igx-row-island>
</igx-hierarchical-grid>
```

```typescript
    gridCreated(event: IGridCreatedEventArgs, rowIsland: IgxRowIslandComponent) {
        this.remoteService.getData(
            {
                parentID: event.parendID,
                level: rowIsland.level,
                key: rowIsland.key
            }, (data) => {
                event.grid.data = data['value'];
                event.grid.isLoading = false;
                event.grid.cdr.detectChanges();
            }
        );
    }
```

### Features

The following grid features work on a per grid level, which means that each grid instance manages these features independently from the rest of the grids.

- Sorting
- Filtering
- Paging
- Multi-column headers
- Hiding
- Pinning
- Moving
- Summaries

- Selection 
    Selection works globally for the whole **igx-hierarchical-grid** and does not allow selected cells to be present for two different child grids at once.

- Navigation
    When navigating up/down if next/prev element is child grid navigation will continue in the related child grid, marking the related cell as selected and focused. If the child cell is outside the current visible view port it is scrolled into view so that selected cell is always visible.

The following features are no supported and not exposed in the API of the Hierarchical Grid.

- Group By

Enabling and configuring features is done through the **igx-row-island** markup and is applied for every grid that is created for it. Changing options on runtime through the row instance changes them for each of the grids it spawned. 

```html
<igx-hierarchical-grid [data]="localData" [displayDensity]="density" [autoGenerate]="false"
    [allowFiltering]="true" [height]="'600px'" [width]="'800px'" #hGrid>
    <igx-column field="ID" [pinned]="true" [filterable]='true'></igx-column>
    <igx-column-group header="Information">
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName" hasSummary='true'></igx-column>
    </igx-column-group>
    <igx-row-island [key]="'childData'" [autoGenerate]="false" rowSelection="multiple" #layout1>
        <igx-column field="ID" [hasSummary]='true' [dataType]="'number'"></igx-column>
        <igx-column-group header="Information2">
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
        </igx-column-group>
        <igx-paginator *igxPaginator></igx-paginator>
    </igx-row-island>
    <igx-paginator></igx-paginator>
</igx-hierarchical-grid>
```

### CRUD operations

An important difference from the flat grid is that each instance for a given row island has the same transaction service instance and accumulates the same transaction log. In order to enable the CRUD functionality users should inject the `IgxHierarchicalTransactionServiceFactory`.

Calling CRUD API methods should still be done through each separate grid instance.

## API

### Inputs

Below is the list of all inputs that the developers may set to configure the grid look/behavior:


- `IgxHierarchicalGridBaseDirective`

    | Name | Description | Type | Default value | Valid values |
    | ---- | ----------- | ---- | ------------- | ------------ |
    | expansionStates | Returns a list of key-value pairs [row ID, expansion state]. Includes only states that differ from the default one.                 | `Map<any, boolean>` | `new Map<any,boolean>()` | |

- `IgxHierarchicalGrid` extends `IgxHierarchicalGridBaseDirective`

    | Name | Description | Type | Default value | Valid values |
    | ---- | ----------- | ---- | ------------- | ------------ |
    | data | The hierarchical grid data source | `Array<any>` | null |  |

- `IgxRowIslandComponent` extends `IgxHierarchicalGridBaseDirective`

    | Name | Description | Type | Default value | Valid values |
    | ---- | ----------- | ---- | ------------- | ------------ |
    | key  | Unique identifier for the row island and the property to read for the array to bind to from a parent record | string | null |  |
    | expandChildren    | Should child island be expanded. Setting it during runtime will expand or collapse all records | `boolean`    | `false` | `true`|`false` |


### Outputs

- A list of the events emitted by the **igx-row-island**:

    |Name|Description|
    |--- |--- |
    |_Event emitters_|_Notify for a change_|
    | gridCreated | Emitted when a grid is being created for this row island | false | parentRecord: `any`, owner: `IgxRowIslandComponent`, grid: `IgxHierarchicalGridComponent` |
    | gridInitialized | Emitted after a grid is being initialized for this row island. The emitting is done in `ngAfterViewInit` | false | parentRecord: `any`, owner: `IgxRowIslandComponent`, grid: `IgxHierarchicalGridComponent` |


### Properties

- `IgxHierarchicalGrid`
    |Name|Type|Getter|Setter|Description|
    |--- |--- |--- |--- |--- |
    | foreignKey | `any` | true | false | The unique identifier of the parent row |


Defining handlers for this event emitter is done using declarative event binding:

```html
<igx-row-island #rowIsland2 [key]="'Order_Details'" [autoGenerate]="true"
    (gridCreated)="gridCreated($event, rowIsland2)">
</igx-row-island>
```

### Methods
