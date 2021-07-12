import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-pagination',
    styleUrls: ['./pagination.styles.scss'],
    templateUrl: './pagination.template.html'
})
export class PaginationSampleComponent implements OnInit {

    public totalPages: number;
    public totalRecords: number;

    public ngOnInit() {
        this.totalPages = 21;
        this.totalRecords = this.totalPages * 15;
    }

}
