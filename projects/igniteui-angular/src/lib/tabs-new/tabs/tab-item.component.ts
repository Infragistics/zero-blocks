import { Component } from '@angular/core';
import { IgxTabItemDirective } from '../tab-item.directive';

@Component({
    selector: 'igx-tab-item-new',
    templateUrl: 'tab-item.component.html',
    providers: [{ provide: IgxTabItemDirective, useExisting: IgxTabItemNewComponent }]
})
export class IgxTabItemNewComponent extends IgxTabItemDirective {

}
