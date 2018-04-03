import * as JSZip from "jszip/dist/jszip";

import { CommonModule } from "@angular/common";
import { Directive, EventEmitter, Injectable, NgModule, Output } from "@angular/core";

import { ExcelElementsFactory } from "./excel-elements-factory";
import { ExcelFolderTypes } from "./excel-enums";
import { IgxExcelExporterOptions } from "./excel-exporter-options";

import {
    IExcelFile,
    IExcelFolder
} from "./excel-interfaces";

import { IgxGridComponent } from "../../grid/grid.component";
import { IgxGridModule } from "../../grid/index";

import {
    ColumnExportingEventArgs,
    ExcelExportEndedEventArgs,
    RowExportingEventArgs
} from "../exporter-common/event-args";

import { inherits } from "util";
import { IgxBaseExporter } from "../exporter-common/base-export-service";
import { ExportUtilities } from "../exporter-common/export-utilities";
import { WorksheetData } from "./worksheet-data";

@Injectable()
export class IgxExcelExporterService extends IgxBaseExporter {

    private static ZIP_OPTIONS = { compression: "DEFLATE", type: "base64" };
    private static DATA_URL_PREFIX = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,";

    private _xlsx: JSZip;

    @Output()
    public onExportEnded = new EventEmitter<ExcelExportEndedEventArgs>();

    private static populateFolder(folder: IExcelFolder, zip: JSZip, worksheetData: WorksheetData): any {
        for (const childFolder of folder.childFolders(worksheetData)) {
            const folderIntance = ExcelElementsFactory.getExcelFolder(childFolder);
            const zipFolder = zip.folder(folderIntance.folderName);
            IgxExcelExporterService.populateFolder(folderIntance, zipFolder, worksheetData);
        }

        for (const childFile of folder.childFiles(worksheetData)) {
            const fileInstance = ExcelElementsFactory.getExcelFile(childFile);
            fileInstance.writeElement(zip, worksheetData);
        }
    }

    protected exportDataImplementation(data: any[], options: IgxExcelExporterOptions): void {
        const worksheetData = new WorksheetData(data, options, this._indexOfLastPinnedColumn);
        this._xlsx = new JSZip();

        const rootFolder = ExcelElementsFactory.getExcelFolder(ExcelFolderTypes.RootExcelFolder);
        IgxExcelExporterService.populateFolder(rootFolder, this._xlsx, worksheetData);

        this._xlsx.generateAsync(IgxExcelExporterService.ZIP_OPTIONS).then((result) => {
            this.saveFile(result, options.fileName);

            this.onExportEnded.emit(new ExcelExportEndedEventArgs(this._xlsx));
        });
    }

    private saveFile(data: string, fileName: string): void {
        const blob = new Blob([ExportUtilities.stringToArrayBuffer(atob(data))], {
            type: ""
        });

        ExportUtilities.saveBlobToFile(blob, fileName);
    }
}
