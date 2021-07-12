import { IExcelFile } from './excel-interfaces';
import { ExcelStrings } from './excel-strings';
import { WorksheetData } from './worksheet-data';

import * as JSZip from 'jszip';
import { yieldingLoop } from '../../core/utils';
import { HeaderType, ExportRecordType, IExportRecord, IColumnList } from '../exporter-common/base-export-service';

/**
 * @hidden
 */
export class RootRelsFile implements IExcelFile {
    public writeElement(folder: JSZip) {
        folder.file('.rels', ExcelStrings.getRels());
    }
}

/**
 * @hidden
 */
export class AppFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        folder.file('app.xml', ExcelStrings.getApp(worksheetData.options.worksheetName));
    }
}

/**
 * @hidden
 */
export class CoreFile implements IExcelFile {
    public writeElement(folder: JSZip) {
        folder.file('core.xml', ExcelStrings.getCore());
    }
}

/**
 * @hidden
 */
export class WorkbookRelsFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        const hasSharedStrings = worksheetData.isEmpty === false;
        folder.file('workbook.xml.rels', ExcelStrings.getWorkbookRels(hasSharedStrings));
    }
}

/**
 * @hidden
 */
export class ThemeFile implements IExcelFile {
    public writeElement(folder: JSZip) {
        folder.file('theme1.xml', ExcelStrings.getTheme());
    }
}

/**
 * @hidden
 */
export class WorksheetFile implements IExcelFile {
    private static MIN_WIDTH = 8.43;
    private maxOutlineLevel = 0;
    private dimension = '';
    private freezePane = '';
    private rowHeight = '';

    private mergeCellStr = '';
    private mergeCellsCounter = 0;
    private rowIndex = 0;

    public writeElement() {}

    public async writeElementAsync(folder: JSZip, worksheetData: WorksheetData) {
        return new Promise<void>(resolve => {
            this.prepareDataAsync(worksheetData, (cols, rows) => {
                const hasTable = !worksheetData.isEmpty && worksheetData.options.exportAsTable;
                const isHierarchicalGrid = worksheetData.data[0]?.type === ExportRecordType.HierarchicalGridRecord;

                folder.file('sheet1.xml', ExcelStrings.getSheetXML(
                    this.dimension, this.freezePane, cols, rows, hasTable, this.maxOutlineLevel, isHierarchicalGrid));
                resolve();
            });
        });
    }

    private prepareDataAsync(worksheetData: WorksheetData, done: (cols: string, sheetData: string) => void) {
        let sheetData = '';
        let cols = '';
        const dictionary = worksheetData.dataDictionary;
        this.rowIndex = 0;

        if (worksheetData.isEmpty) {
            sheetData += '<sheetData/>';
            this.dimension = 'A1';
            done('', sheetData);
        } else {
            const owner = worksheetData.owner;
            const isHierarchicalGrid = worksheetData.data[0].type === ExportRecordType.HierarchicalGridRecord;
            const hasMultiColumnHeader = owner.columns.some(col => !col.skip && col.headerType === HeaderType.MultiColumnHeader);
            const hasUserSetIndex = owner.columns.some(col => col.exportIndex !== undefined);

            const height =  worksheetData.options.rowHeight;
            const rowStyle = isHierarchicalGrid ? ' s="3"' : '';
            this.rowHeight = height ? ` ht="${height}" customHeight="1"` : '';

            sheetData += `<sheetData>`;

            for (let i = 0; i <= owner.maxLevel; i++) {
                this.rowIndex++;
                sheetData += `<row r="${this.rowIndex}"${this.rowHeight}>`;

                const headersForLevel = hasMultiColumnHeader ?
                    owner.columns
                        .filter(c => (c.level < i &&
                            c.headerType !== HeaderType.MultiColumnHeader || c.level === i) && c.columnSpan > 0 && !c.skip)
                        .sort((a, b) => a.startIndex - b.startIndex)
                        .sort((a, b) => a.pinnedIndex - b.pinnedIndex) :
                    hasUserSetIndex ?
                        owner.columns.filter(c => !c.skip) :
                        owner.columns.filter(c => !c.skip)
                            .sort((a, b) => a.startIndex - b.startIndex)
                            .sort((a, b) => a.pinnedIndex - b.pinnedIndex);

                let startValue = 0;

                for (const currentCol of headersForLevel) {
                    if (currentCol.level === i) {
                        let columnCoordinate;
                        columnCoordinate = ExcelStrings.getExcelColumn(startValue) + this.rowIndex;
                        const columnValue = dictionary.saveValue(currentCol.header, true);
                        sheetData += `<c r="${columnCoordinate}"${rowStyle} t="s"><v>${columnValue}</v></c>`;

                        if (i !== owner.maxLevel) {
                            this.mergeCellsCounter++;
                            this.mergeCellStr += ` <mergeCell ref="${columnCoordinate}:`;

                            if (currentCol.headerType === HeaderType.ColumnHeader) {
                                columnCoordinate = ExcelStrings.getExcelColumn(startValue) + (owner.maxLevel + 1);
                            } else {
                                for (let k = 1; k < currentCol.columnSpan; k++) {
                                    columnCoordinate = ExcelStrings.getExcelColumn(startValue + k) + this.rowIndex;
                                    sheetData += `<c r="${columnCoordinate}"${rowStyle} />`;
                                }
                            }

                            this.mergeCellStr += `${columnCoordinate}" />`;
                        }
                    }

                    startValue += currentCol.columnSpan;
                }

                sheetData += `</row>`;
            }

            if (!isHierarchicalGrid) {
                this.dimension =
                    'A1:' + ExcelStrings.getExcelColumn(worksheetData.columnCount - 1) + (worksheetData.rowCount + owner.maxLevel);

                cols += '<cols>';

                if (!hasMultiColumnHeader) {
                    for (let j = 0; j < worksheetData.columnCount; j++) {
                        const width = dictionary.columnWidths[j];
                        // Use the width provided in the options if it exists
                        let widthInTwips = worksheetData.options.columnWidth !== undefined ?
                                                worksheetData.options.columnWidth :
                                                Math.max(((width / 96) * 14.4), WorksheetFile.MIN_WIDTH);
                        if (!(widthInTwips > 0)) {
                            widthInTwips = WorksheetFile.MIN_WIDTH;
                        }

                        cols += `<col min="${(j + 1)}" max="${(j + 1)}" width="${widthInTwips}" customWidth="1"/>`;
                    }
                } else {
                    cols += `<col min="1" max="${worksheetData.columnCount}" width="15" customWidth="1"/>`;
                }

                cols += '</cols>';

                const indexOfLastPinnedColumn = worksheetData.indexOfLastPinnedColumn;

                if (indexOfLastPinnedColumn !== -1 &&
                    !worksheetData.options.ignorePinning &&
                    !worksheetData.options.ignoreColumnsOrder) {
                    const frozenColumnCount = indexOfLastPinnedColumn + 1;
                    const firstCell = ExcelStrings.getExcelColumn(frozenColumnCount) + '1';
                    this.freezePane =
                        `<pane xSplit="${frozenColumnCount}" topLeftCell="${firstCell}" activePane="topRight" state="frozen"/>`;
                }
            } else {
                const columnWidth = worksheetData.options.columnWidth ? worksheetData.options.columnWidth : 20;
                cols += `<cols><col min="1" max="${worksheetData.columnCount}" width="${columnWidth}" customWidth="1"/></cols>`;
            }

            this.processDataRecordsAsync(worksheetData, (rows) => {
                sheetData += rows;
                sheetData += '</sheetData>';

                if (hasMultiColumnHeader) {
                    sheetData += `<mergeCells count="${this.mergeCellsCounter}">${this.mergeCellStr}</mergeCells>`;
                }

                done(cols, sheetData);
            });
        }
    }

    private processDataRecordsAsync(worksheetData: WorksheetData, done: (rows: string) => void) {
        const rowDataArr = [];
        const height =  worksheetData.options.rowHeight;
        this.rowHeight = height ? ' ht="' + height + '" customHeight="1"' : '';

        const isHierarchicalGrid =
            worksheetData.data.some(r => r.type === ExportRecordType.HeaderRecord || r.type === ExportRecordType.HierarchicalGridRecord);
        const hasUserSetIndex = worksheetData.owner.columns.some(c => c.exportIndex !== undefined);

        let recordHeaders = [];

        yieldingLoop(worksheetData.rowCount - 1, 1000,
            (i) => {
                if (!isHierarchicalGrid) {
                    if (hasUserSetIndex) {
                        recordHeaders = worksheetData.rootKeys;
                    } else {
                        recordHeaders = worksheetData.owner.columns
                            .filter(c => c.headerType !== HeaderType.MultiColumnHeader && !c.skip)
                            .sort((a, b) => a.startIndex-b.startIndex)
                            .sort((a, b) => a.pinnedIndex-b.pinnedIndex)
                            .map(c => c.field);
                    }
                } else {
                    const record = worksheetData.data[i];

                    if (record.type === ExportRecordType.HeaderRecord) {
                        const recordOwner = worksheetData.owners.get(record.owner);
                        const hasMultiColumnHeaders = recordOwner.columns.some(c => c.headerType === HeaderType.MultiColumnHeader);

                        if (hasMultiColumnHeaders) {
                            this.hGridPrintMultiColHeaders(worksheetData, rowDataArr, record, recordOwner);
                        }
                    }

                    recordHeaders = Object.keys(worksheetData.data[i].data);
                }

                rowDataArr.push(this.processRow(worksheetData, i, recordHeaders, isHierarchicalGrid));
            },
            () => {
                done(rowDataArr.join(''));
        });
    }

    private hGridPrintMultiColHeaders(worksheetData: WorksheetData, rowDataArr: any[], record: IExportRecord,
        owner: IColumnList) {
        for (let j = 0; j < owner.maxLevel; j++) {
            const recordLevel = record.level;
            const outlineLevel = recordLevel > 0 ? ` outlineLevel="${recordLevel}"` : '';
            this.maxOutlineLevel = this.maxOutlineLevel < recordLevel ? recordLevel : this.maxOutlineLevel;
            const sHidden = record.hidden ? ` hidden="1"` : '';

            this.rowIndex++;
            let row = `<row r="${this.rowIndex}"${this.rowHeight}${outlineLevel}${sHidden}>`;

            const headersForLevel = owner.columns
                .filter(c => (c.level < j &&
                    c.headerType !== HeaderType.MultiColumnHeader || c.level === j) && c.columnSpan > 0 && !c.skip)
                .sort((a, b) => a.startIndex - b.startIndex)
                .sort((a, b) => a.pinnedIndex - b.pinnedIndex);

            let startValue = 0 + record.level;

            for (const currentCol of headersForLevel) {
                if (currentCol.level === j) {
                    let columnCoordinate;
                    columnCoordinate =
                        ExcelStrings.getExcelColumn(startValue) + this.rowIndex;

                    const columnValue = worksheetData.dataDictionary.saveValue(currentCol.header, true);
                    row += `<c r="${columnCoordinate}" s="3" t="s"><v>${columnValue}</v></c>`;

                    if (j !== owner.maxLevel) {
                        this.mergeCellsCounter++;
                        this.mergeCellStr += ` <mergeCell ref="${columnCoordinate}:`;

                        if (currentCol.headerType === HeaderType.ColumnHeader) {
                            columnCoordinate = ExcelStrings.getExcelColumn(startValue) + (this.rowIndex + owner.maxLevel - currentCol.level);
                        } else {
                            for (let k = 1; k < currentCol.columnSpan; k++) {
                                columnCoordinate = ExcelStrings.getExcelColumn(startValue + k) + this.rowIndex;
                                row += `<c r="${columnCoordinate}" s="3" />`;
                            }
                        }

                        this.mergeCellStr += `${columnCoordinate}" />`;
                    }
                }

                startValue += currentCol.columnSpan;
            }
            row += `</row>`;
            rowDataArr.push(row);
        }
    }

    private processRow(worksheetData: WorksheetData, i: number, headersForLevel: any[], isHierarchicalGrid: boolean) {
        const record = worksheetData.data[i];

        const rowData = new Array(worksheetData.columnCount + 2);

        const rowLevel = record.level;
        const outlineLevel = rowLevel > 0 ? ` outlineLevel="${rowLevel}"` : '';
        this.maxOutlineLevel = this.maxOutlineLevel < rowLevel ? rowLevel : this.maxOutlineLevel;

        const sHidden = record.hidden ? ` hidden="1"` : '';

        this.rowIndex++;
        rowData[0] =
            `<row r="${this.rowIndex}"${this.rowHeight}${outlineLevel}${sHidden}>`;

        const keys = worksheetData.isSpecialData ? [record.data] : headersForLevel;

        for (let j = 0; j < keys.length; j++) {
            const col = j + (isHierarchicalGrid ? rowLevel : 0);

            const cellData = this.getCellData(worksheetData, i, col, keys[j]);

            rowData[j + 1] = cellData;
        }

        rowData[keys.length + 1] = '</row>';

        return rowData.join('');
    }

    private getCellData(worksheetData: WorksheetData, row: number, column: number, key: string): string {
        const dictionary = worksheetData.dataDictionary;
        const columnName = ExcelStrings.getExcelColumn(column) + (this.rowIndex);
        const fullRow = worksheetData.data[row];
        const isHeaderRecord = fullRow.type === ExportRecordType.HeaderRecord;

        const cellValue = worksheetData.isSpecialData ?
            fullRow.data :
            fullRow.data[key];

        if (cellValue === undefined || cellValue === null) {
            return `<c r="${columnName}" s="1"/>`;
        } else {
            const savedValue = dictionary.saveValue(cellValue, isHeaderRecord);
            const isSavedAsString = savedValue !== -1;

            const isSavedAsDate = !isSavedAsString && cellValue instanceof Date;

            let value = isSavedAsString ? savedValue : cellValue;

            if (isSavedAsDate) {
                const timeZoneOffset = value.getTimezoneOffset() * 60000;
                const isoString = (new Date(value - timeZoneOffset)).toISOString();
                value = isoString.substring(0, isoString.indexOf('.'));
            }

            const type = isSavedAsString ? ` t="s"` : isSavedAsDate ? ` t="d"` : '';

            const format = isHeaderRecord ? ` s="3"` : isSavedAsString ? '' : isSavedAsDate ? ` s="2"` : ` s="1"`;

            return `<c r="${columnName}"${type}${format}><v>${value}</v></c>`;
        }
    }
}

/**
 * @hidden
 */
export class StyleFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        const hasNumberValues = worksheetData.dataDictionary && worksheetData.dataDictionary.hasNumberValues;
        const hasDateValues = worksheetData.dataDictionary && worksheetData.dataDictionary.hasDateValues;
        const isHierarchicalGrid = worksheetData.data[0]?.type === ExportRecordType.HierarchicalGridRecord;

        folder.file('styles.xml', ExcelStrings.getStyles(hasNumberValues, hasDateValues, isHierarchicalGrid));
    }
}

/**
 * @hidden
 */
export class WorkbookFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        folder.file('workbook.xml', ExcelStrings.getWorkbook(worksheetData.options.worksheetName));
    }
}

/**
 * @hidden
 */
export class ContentTypesFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        folder.file('[Content_Types].xml', ExcelStrings.getContentTypesXML(!worksheetData.isEmpty, worksheetData.options.exportAsTable));
    }
}

/**
 * @hidden
 */
export class SharedStringsFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        const dict = worksheetData.dataDictionary;
        const sortedValues = dict.getKeys();
        const sharedStrings = new Array<string>(sortedValues.length);

        for (const value of sortedValues) {
            sharedStrings[dict.getSanitizedValue(value)] = '<si><t>' + value + '</t></si>';
        }

        folder.file('sharedStrings.xml', ExcelStrings.getSharedStringXML(
                        dict.stringsCount,
                        sortedValues.length,
                        sharedStrings.join(''))
                    );
    }
}

/**
 * @hidden
 */
export class TablesFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        const columnCount = worksheetData.columnCount;
        const lastColumn = ExcelStrings.getExcelColumn(columnCount - 1) + worksheetData.rowCount;
        const dimension = 'A1:' + lastColumn;
        const hasUserSetIndex = worksheetData.owner.columns.some(c => c.exportIndex !== undefined);
        const values = hasUserSetIndex
            ? worksheetData.rootKeys
            : worksheetData.owner.columns
                .filter(c => !c.skip)
                .sort((a, b) => a.startIndex - b.startIndex)
                .sort((a, b) => a.pinnedIndex - b.pinnedIndex)
                .map(c => c.header);

        let sortString = '';

        let tableColumns = '<tableColumns count="' + columnCount + '">';
        for (let i = 0; i < columnCount; i++) {
            const value =  values[i];
            tableColumns += '<tableColumn id="' + (i + 1) + '" name="' + value + '"/>';
        }

        tableColumns += '</tableColumns>';

        if (worksheetData.sort) {
            const sortingExpression = worksheetData.sort;
            const sc = ExcelStrings.getExcelColumn(values.indexOf(sortingExpression.fieldName));
            const dir = sortingExpression.dir - 1;
            sortString = `<sortState ref="A2:${lastColumn}"><sortCondition descending="${dir}" ref="${sc}1:${sc}15"/></sortState>`;
        }

        folder.file('table1.xml', ExcelStrings.getTablesXML(dimension, tableColumns, sortString));
    }
}

/**
 * @hidden
 */
export class WorksheetRelsFile implements IExcelFile {
    public writeElement(folder: JSZip) {
        folder.file('sheet1.xml.rels', ExcelStrings.getWorksheetRels());
    }
}
