import { IgxComboItemComponent } from './combo-item.component';
import { Component } from '@angular/core';

/**
 * @hidden
 */
@Component({
    selector: 'igx-combo-add-item',
    template: '<ng-content></ng-content>',
    providers: [{ provide: IgxComboItemComponent, useExisting: IgxComboAddItemComponent}]
})
export class IgxComboAddItemComponent extends IgxComboItemComponent {
    public get selected(): boolean {
        return false;
    }
    public set selected(value: boolean) {
    }

    /**
     * @inheritdoc
     */
    public clicked() {
        this.comboAPI.disableTransitions = false;
        this.comboAPI.add_custom_item();
    }
}
