import { EventEmitter, Injectable, Output } from '@angular/core';
import { IgxBaseExporter } from '../exporter-common/base-export-service';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { CharSeparatedValueData } from './char-separated-value-data';
import { CsvFileTypes, IgxCsvExporterOptions } from './csv-exporter-options';
import { IBaseEventArgs } from '../../core/utils';

export interface ICsvExportEndedEventArgs extends IBaseEventArgs {
    csvData: string;
}

/**
 * **Ignite UI for Angular CSV Exporter Service** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/exporter_csv.html)
 *
 * The Ignite UI for Angular CSV Exporter service can export data in a Character Separated Values format from
 * both raw data (array) or from an `IgxGrid`.
 *
 * Example:
 * ```typescript
 * public localData = [
 *   { Name: "Eric Ridley", Age: "26" },
 *   { Name: "Alanis Brook", Age: "22" },
 *   { Name: "Jonathan Morris", Age: "23" }
 * ];
 *
 * constructor(private csvExportService: IgxCsvExporterService) {
 * }
 *
 * const opt: IgxCsvExporterOptions = new IgxCsvExporterOptions("FileName", CsvFileTypes.CSV);
 * this.csvExportService.exportData(this.localData, opt);
 * ```
 */
@Injectable()
export class IgxCsvExporterService extends IgxBaseExporter {
    private _stringData: string;

    /**
     * This event is emitted when the export process finishes.
     * ```typescript
     * this.exporterService.onExportEnded.subscribe((args: ICsvExportEndedEventArgs) => {
     * // put event handler code here
     * });
     * ```
     * @memberof IgxCsvExporterService
     */
    @Output()
    public onExportEnded = new EventEmitter<ICsvExportEndedEventArgs>();

    protected exportDataImplementation(data: any[], options: IgxCsvExporterOptions) {
        data = data.map((item) => item.rowData);
        const csvData = new CharSeparatedValueData(data, options.valueDelimiter);
        csvData.prepareDataAsync((r) => {
            this._stringData = r;
            this.saveFile(options);
            this.onExportEnded.emit({ csvData: this._stringData });
        });
    }

    private saveFile(options: IgxCsvExporterOptions) {
        this.exportFile(this._stringData, options.fileName, options.fileTypeWithEncoding);
    }

    private exportFile(data: string, fileName: string, fileType: string): void {
        const blob = new Blob(['\ufeff', data], { type: fileType });
        ExportUtilities.saveBlobToFile(blob, fileName);
    }
}
