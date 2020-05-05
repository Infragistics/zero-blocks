import * as JSZip from 'jszip';

import { EventEmitter, Injectable, Output, OnInit, OnDestroy } from '@angular/core';
import { ExcelElementsFactory } from './excel-elements-factory';
import { ExcelFolderTypes } from './excel-enums';
import { IgxExcelExporterOptions } from './excel-exporter-options';
import { IExcelFolder } from './excel-interfaces';
import { IgxBaseExporter } from '../exporter-common/base-export-service';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { WorksheetData } from './worksheet-data';
import { IBaseEventArgs } from '../../core/utils';
import { SaveUtilities } from '../exporter-common/save-utilities';

export interface IExcelExportEndedEventArgs extends IBaseEventArgs {
    xlsx: JSZip;
}

/**
 * **Ignite UI for Angular Excel Exporter Service** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/exporter_excel.html)
 *
 * The Ignite UI for Angular Excel Exporter service can export data in Microsoft® Excel® format from both raw data
 * (array) or from an `IgxGrid`.
 *
 * Example:
 * ```typescript
 * public localData = [
 *   { Name: "Eric Ridley", Age: "26" },
 *   { Name: "Alanis Brook", Age: "22" },
 *   { Name: "Jonathan Morris", Age: "23" }
 * ];
 *
 * constructor(private excelExportService: IgxExcelExporterService) {
 * }
 *
 * this.excelExportService.exportData(this.localData, new IgxExcelExporterOptions("FileName"));
 * ```
 */
@Injectable()
export class IgxExcelExporterService extends IgxBaseExporter {

    private static ZIP_OPTIONS = { compression: 'DEFLATE', type: 'base64' } as JSZip.JSZipGeneratorOptions<'base64'>;
    private _xlsx: JSZip;
    private exporterWorker: Worker;

    /**
     * This event is emitted when the export process finishes.
     * ```typescript
     * this.exporterService.onExportEnded.subscribe((args: IExcelExportEndedEventArgs) => {
     * // put event handler code here
     * });
     * ```
     * @memberof IgxExcelExporterService
     */
    @Output()
    public onExportEnded = new EventEmitter<IExcelExportEndedEventArgs>();

    private static populateFolder(folder: IExcelFolder, zip: JSZip, worksheetData: WorksheetData): any {
        for (const childFolder of folder.childFolders(worksheetData)) {
            const folderInstance = ExcelElementsFactory.getExcelFolder(childFolder);
            const zipFolder = zip.folder(folderInstance.folderName);
            IgxExcelExporterService.populateFolder(folderInstance, zipFolder, worksheetData);
        }

        for (const childFile of folder.childFiles(worksheetData)) {
            const fileInstance = ExcelElementsFactory.getExcelFile(childFile);
            fileInstance.writeElement(zip, worksheetData);
        }
    }

    protected exportDataImplementation(data: any[], options: IgxExcelExporterOptions): void {
        if (this._isTreeGrid) {
            let maxLevel = 0;
            data.forEach((r) => {
                maxLevel = Math.max(maxLevel, r.originalRowData.level);
            });
            if (maxLevel > 7) {
                throw Error('Can create an outline of up to eight levels!');
            }
        }

        const worksheetData = new WorksheetData(data, options, this._indexOfLastPinnedColumn, this._sort, this._isTreeGrid);
        this._xlsx = new JSZip();

        const rootFolder = ExcelElementsFactory.getExcelFolder(ExcelFolderTypes.RootExcelFolder);
        IgxExcelExporterService.populateFolder(rootFolder, this._xlsx, worksheetData);

        // if (this.exporterWorker) {
        //     this.exporterWorker.postMessage({ folder: rootFolder, zip: this._xlsx, worksheetData: worksheetData });
        //     this.exporterWorker.onmessage = ({ data }) => {
        //         console.log('generating async');
        //         this._xlsx.generateAsync(IgxExcelExporterService.ZIP_OPTIONS).then((result) => {
        //             this.saveFile(result, options.fileName);
        //             this.onExportEnded.emit({ xlsx: this._xlsx });
        //         });
        //     };
        // } else {
        //     // Web workers are not supported in this environment. Add a fallback
        // }

        this._xlsx.generateAsync(IgxExcelExporterService.ZIP_OPTIONS).then((result) => {
            this.saveFile(result, options.fileName);

            this.onExportEnded.emit({ xlsx: this._xlsx });
        });
    }

    private saveFile(data: string, fileName: string): void {
        const blob = new Blob([ExportUtilities.stringToArrayBuffer(atob(data))], {
            type: ''
        });

        SaveUtilities.saveBlobToFile(blob, fileName);
    }

    // ngOnInit() {
    //     if (typeof Worker !== 'undefined') {
    //         this.exporterWorker = new Worker('./excel-exporter.worker', { type: 'module' });
    //         console.log('worker created');
    //     }
    // }

    // ngOnDestroy() {
    //     if (this.exporterWorker) {
    //         this.exporterWorker.terminate();
    //         console.log('worker destroyed');
    //     }
    // }
}
