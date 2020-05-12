import { Component, ViewChild, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { IgxDateRangePickerComponent, DateRange } from 'igniteui-angular';

@Component({
    selector: 'app-date-range',
    templateUrl: './date-range.sample.html',
    styleUrls: ['./date-range.sample.scss']
})
export class DateRangeSampleComponent {
    public range1: DateRange = { start: new Date(), end: new Date(new Date().setDate(new Date().getDate() + 5)) };
    public range2: DateRange;
    public range3: DateRange = { start: new Date(), end: new Date(new Date().setDate(new Date().getDate() + 5)) };
    public range4: DateRange;
    public range5: DateRange = { start: new Date(), end: new Date(new Date().setDate(new Date().getDate() + 5)) };
    public range6Start;
    public range6End;
    public range6: DateRange = { start: this.range6Start, end: this.range6End };
    public minDate: Date = new Date();
    public maxDate: Date = new Date(new Date().setDate(new Date().getDate() + 25));

    public reactiveForm: FormGroup;

    constructor(fb: FormBuilder) {
        const today = new Date();
        const in5days = new Date();
        in5days.setDate(today.getDate() + 5);
        const r1: DateRange = { start: new Date(today.getTime()), end: new Date(in5days.getTime()) };
        const r2: DateRange = { start: new Date(today.getTime()), end: new Date(in5days.getTime()) };
        this.reactiveForm = fb.group({
            dp1: [r1, { validators: Validators.required, updateOn: 'blur' }],
            dp2: ['', { validators: Validators.required, updateOn: 'blur' }],
            dp3: [r2, { validators:  [Validators.required, minDateValidator(this.minDate)] }],
            dp4: ['', { validators: Validators.required, updateOn: 'blur' }],
        });
    }
}
function minDateValidator(minValue: Date): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (control.value && (control.value as DateRange).start.getTime() < minValue.getTime()) {
            return { minValue: true };
        }

        return null;
    };
}
