#igx-dialog

**igx-dialog** supports dialog component that opens centered on top of the app content.

With the igx-dialog you can create **alerts**, **dialogs** and **custom dialogs**.
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/dialog.html)

# Usage

## Alerts are done by adding title, message and button label.

```html
<igx-dialog #alert
    title="Alert"
    message="Your email has been sent successfully!"
    leftButtonLabel="OK" (onLeftButtonSelect)="alert.close()">
</igx-dialog>
```
You can set title to the alert `title="TitleofTheAlert"`

You can be more descriptive and set message `message="Your email has been sent successfully!"`

You can attach to the left button select event `(onLeftButtonSelect)="alert.close()"`


##Dialogs are done by adding another button.

```html
<igx-dialog #dialog
    title="Confirmation"
    message="Are you sure you want to delete the Microsoft_Annual_Report_2015.pdf and Microsoft_Annual_Report_2015.pdf files?"
    leftButtonLabel="Cancel"
    (leftButtonSelect)="dialog.close()"
    rightButtonLabel="OK"
    (rightButtonSelect)="onDialogOKSelected($event)">
</igx-dialog>
```

You can access all properties of the button component with the following attributes:

`leftButtonLabel`

`leftButtonType`

`leftButtonColor`

`leftButtonBackgroundColor`

`leftButtonRipple`


##Custom Dialogs are done by adding any mark up in the igx-dialog tag.
When you are using Custom Dialogs you don't have a message property set.

```HTML
<igx-dialog #form
    title="Sign In"
    leftButtonLabel="Cancel"
    (onLeftButtonSelect)="form.close()"
    rightButtonLabel="Sign In"
    rightButtonBackgroundColor="green"
    rightButtonColor="white"
    closeOnOutsideSelect="true">
    <div class="igx-form-group">
        <input type="text" igInput />
        <label igLabel>Username</label>
    </div>
    <div class="igx-form-group">
        <input type="password" igInput />
        <label igLabel>Password</label>
    </div>
</igx-dialog>
```

You can make the dialog dismissible `closeOnOutsideSelect="true"``

##Dialog Title area and dialog actions area are customizable throught igxDialogTitle and igxDialogActions directives.
Both directives can contain html elements, strings, icons or even other components.
```HTML
    <igx-dialog>
        <igx-dialog-title>
            <div>TITLE</div>
        </igx-dialog-title>
        <igx-dialog-actions>
            <div>BUTTONS</div>
        </igx-dialog-actions>
    </igx-dialog>
```
or
```HTML
    <igx-dialog>
        <div igxDialogTitle>TITLE</div>
        <div igxDialogActions>BUTTONS</div>
    </igx-dialog>
```

You can now set set the position and animation settings used by the dialog by using `positionSettings` @Input

```typescript
import { slideInLeft, slideOutRight } from 'igniteui-angular';
...
@ViewChild('alert', { static: true }) public alert: IgxDialogComponent;
 public newPositionSettings: PositionSettings = {
     openAnimation: useAnimation(slideInTop, { params: { duration: '2000ms' } }),
     closeAnimation: useAnimation(slideOutBottom, { params: { duration: '2000ms'} }),
     horizontalDirection: HorizontalAlignment.Left,
     verticalDirection: VerticalAlignment.Middle,
     horizontalStartPoint: HorizontalAlignment.Left,
     verticalStartPoint: VerticalAlignment.Middle,
     minSize: { height: 100, width: 100 }
 };

this.alert.positionSettings = this.newPositionSettings;
```

