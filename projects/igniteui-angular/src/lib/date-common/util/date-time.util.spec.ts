import { DateTimeUtil } from './date-time.util';
import { DatePart, DatePartInfo } from '../../directives/date-time-editor/date-time-editor.common';

const reduceToDictionary = (parts: DatePartInfo[]) => parts.reduce((obj, x) => {
    obj[x.type] = x;
    return obj;
}, {});

describe(`DateTimeUtil Unit tests`, () => {
    describe('Date Time Parsing', () => {
        it('should correctly parse all date time parts (base)', () => {
            const result = DateTimeUtil.parseDateTimeFormat('dd/MM/yyyy HH:mm:ss tt');
            const expected = [
                { start: 0, end: 2, type: DatePart.Date, format: 'dd' },
                { start: 2, end: 3, type: DatePart.Literal, format: '/' },
                { start: 3, end: 5, type: DatePart.Month, format: 'MM' },
                { start: 5, end: 6, type: DatePart.Literal, format: '/' },
                { start: 6, end: 10, type: DatePart.Year, format: 'yyyy' },
                { start: 10, end: 11, type: DatePart.Literal, format: ' ' },
                { start: 11, end: 13, type: DatePart.Hours, format: 'HH' },
                { start: 13, end: 14, type: DatePart.Literal, format: ':' },
                { start: 14, end: 16, type: DatePart.Minutes, format: 'mm' },
                { start: 16, end: 17, type: DatePart.Literal, format: ':' },
                { start: 17, end: 19, type: DatePart.Seconds, format: 'ss' },
                { start: 19, end: 20, type: DatePart.Literal, format: ' ' },
                { start: 20, end: 22, type: DatePart.AmPm, format: 'tt' }
            ];
            expect(JSON.stringify(result)).toEqual(JSON.stringify(expected));
        });

        it('should correctly parse date parts of with short formats', () => {
            let result = DateTimeUtil.parseDateTimeFormat('MM/dd/yyyy');
            let resDict = reduceToDictionary(result);
            expect(result.length).toEqual(5);
            expect(resDict[DatePart.Month]).toEqual(jasmine.objectContaining({ start: 0, end: 2 }));
            expect(resDict[DatePart.Date]).toEqual(jasmine.objectContaining({ start: 3, end: 5 }));
            expect(resDict[DatePart.Year]).toEqual(jasmine.objectContaining({ start: 6, end: 10 }));

            result = DateTimeUtil.parseDateTimeFormat('M/d/yy');
            resDict = reduceToDictionary(result);
            expect(result.length).toEqual(5);
            expect(resDict[DatePart.Month]).toEqual(jasmine.objectContaining({ start: 0, end: 2 }));
            expect(resDict[DatePart.Date]).toEqual(jasmine.objectContaining({ start: 3, end: 5 }));
            expect(resDict[DatePart.Year]).toEqual(jasmine.objectContaining({ start: 6, end: 8 }));

            result = DateTimeUtil.parseDateTimeFormat('dd.MM.yyyy г.');
            resDict = reduceToDictionary(result);
            expect(result.length).toEqual(6);
            expect(resDict[DatePart.Date]).toEqual(jasmine.objectContaining({ start: 0, end: 2 }));
            expect(resDict[DatePart.Month]).toEqual(jasmine.objectContaining({ start: 3, end: 5 }));
            expect(resDict[DatePart.Year]).toEqual(jasmine.objectContaining({ start: 6, end: 10 }));

            // TODO
            return;
            result = DateTimeUtil.parseDateTimeFormat('dd.MM.yyyyг');
            resDict = reduceToDictionary(result);
            expect(result.length).toEqual(6);
            expect(resDict[DatePart.Date]).toEqual(jasmine.objectContaining({ start: 0, end: 2 }));
            expect(resDict[DatePart.Month]).toEqual(jasmine.objectContaining({ start: 3, end: 5 }));
            expect(resDict[DatePart.Year]).toEqual(jasmine.objectContaining({ start: 6, end: 10 }));
            expect(result[5]?.format).toEqual('г');

            result = DateTimeUtil.parseDateTimeFormat('yyyy/MM/d');
            resDict = reduceToDictionary(result);
            expect(result.length).toEqual(5);
            expect(resDict[DatePart.Year]).toEqual(jasmine.objectContaining({ start: 0, end: 4 }));
            expect(resDict[DatePart.Month]).toEqual(jasmine.objectContaining({ start: 5, end: 7 }));
            expect(resDict[DatePart.Date]).toEqual(jasmine.objectContaining({ start: 8, end: 10 }));
        });

        it('should correctly parse boundary dates', () => {
            const parts = DateTimeUtil.parseDateTimeFormat('MM/dd/yyyy');
            let result = DateTimeUtil.parseValueFromMask('08/31/2020', parts);
            expect(result).toEqual(new Date(2020, 7, 31));
            result = DateTimeUtil.parseValueFromMask('09/30/2020', parts);
            expect(result).toEqual(new Date(2020, 8, 30));
            result = DateTimeUtil.parseValueFromMask('10/31/2020', parts);
            expect(result).toEqual(new Date(2020, 9, 31));
        });
    });

    it('should correctly parse a date value from input', () => {
        let input = '12/04/2012';
        let dateParts = [
            { start: 0, end: 2, type: DatePart.Date, format: 'dd' },
            { start: 2, end: 3, type: DatePart.Literal, format: '/' },
            { start: 3, end: 5, type: DatePart.Month, format: 'MM' },
            { start: 5, end: 6, type: DatePart.Literal, format: '/' },
            { start: 6, end: 10, type: DatePart.Year, format: 'yyyy' },
            { start: 10, end: 11, type: DatePart.Literal, format: ' ' }
        ];

        let expected = new Date(2012, 3, 12);
        let result = DateTimeUtil.parseValueFromMask(input, dateParts);
        expect(result.getTime()).toEqual(expected.getTime());

        input = '04:12:23 PM';
        dateParts = [
            { start: 0, end: 2, type: DatePart.Hours, format: 'HH' },
            { start: 2, end: 3, type: DatePart.Literal, format: ':' },
            { start: 3, end: 5, type: DatePart.Minutes, format: 'mm' },
            { start: 5, end: 6, type: DatePart.Literal, format: ':' },
            { start: 6, end: 8, type: DatePart.Seconds, format: 'ss' },
            { start: 8, end: 9, type: DatePart.Literal, format: ' ' },
            { start: 9, end: 11, type: DatePart.AmPm, format: 'tt' }
        ];

        result = DateTimeUtil.parseValueFromMask(input, dateParts);
        expect(result.getHours()).toEqual(4);
        expect(result.getMinutes()).toEqual(12);
        expect(result.getSeconds()).toEqual(23);

        input = '12/10/2012 14:06:03';
        dateParts = [
            { start: 0, end: 2, type: DatePart.Date, format: 'dd' },
            { start: 2, end: 3, type: DatePart.Literal, format: '/' },
            { start: 3, end: 5, type: DatePart.Month, format: 'MM' },
            { start: 5, end: 6, type: DatePart.Literal, format: '/' },
            { start: 6, end: 10, type: DatePart.Year, format: 'yyyy' },
            { start: 10, end: 11, type: DatePart.Literal, format: ' ' },
            { start: 11, end: 13, type: DatePart.Hours, format: 'HH' },
            { start: 13, end: 14, type: DatePart.Literal, format: ':' },
            { start: 14, end: 16, type: DatePart.Minutes, format: 'mm' },
            { start: 16, end: 17, type: DatePart.Literal, format: ':' },
            { start: 17, end: 19, type: DatePart.Seconds, format: 'ss' }
        ];

        expected = new Date(2012, 9, 12, 14, 6, 3);
        result = DateTimeUtil.parseValueFromMask(input, dateParts);

        expect(result.getDate()).toEqual(12);
        expect(result.getMonth()).toEqual(9);
        expect(result.getFullYear()).toEqual(2012);
        expect(result.getHours()).toEqual(14);
        expect(result.getMinutes()).toEqual(6);
        expect(result.getSeconds()).toEqual(3);
    });

    it('should properly build input formats based on locale', () => {
        spyOn(DateTimeUtil, 'getDefaultInputFormat').and.callThrough();
        let result = DateTimeUtil.getDefaultInputFormat('en-US');
        expect(result).toEqual('MM/dd/yyyy');

        result = DateTimeUtil.getDefaultInputFormat('bg-BG');
        expect(result).toEqual('dd.MM.yyyy г.');

        expect(() => {
            result = DateTimeUtil.getDefaultInputFormat(null);
        }).not.toThrow();
        expect(result).toEqual('MM/dd/yyyy');

        expect(() => {
            result = DateTimeUtil.getDefaultInputFormat('');
        }).not.toThrow();
        expect(result).toEqual('MM/dd/yyyy');

        expect(() => {
            result = DateTimeUtil.getDefaultInputFormat(undefined);
        }).not.toThrow();
        expect(result).toEqual('MM/dd/yyyy');
    });

    it('should correctly distinguish date from time characters', () => {
        expect(DateTimeUtil.isDateOrTimeChar('d')).toBeTrue();
        expect(DateTimeUtil.isDateOrTimeChar('M')).toBeTrue();
        expect(DateTimeUtil.isDateOrTimeChar('y')).toBeTrue();
        expect(DateTimeUtil.isDateOrTimeChar('H')).toBeTrue();
        expect(DateTimeUtil.isDateOrTimeChar('h')).toBeTrue();
        expect(DateTimeUtil.isDateOrTimeChar('m')).toBeTrue();
        expect(DateTimeUtil.isDateOrTimeChar('s')).toBeTrue();
        expect(DateTimeUtil.isDateOrTimeChar(':')).toBeFalse();
        expect(DateTimeUtil.isDateOrTimeChar('/')).toBeFalse();
        expect(DateTimeUtil.isDateOrTimeChar('.')).toBeFalse();
    });

    it('should spin date portions correctly', () => {
        // base
        let date = new Date(2015, 4, 20);
        DateTimeUtil.spinDate(1, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 21).getTime());
        DateTimeUtil.spinDate(-1, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20).getTime());

        // delta !== 1
        DateTimeUtil.spinDate(5, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 25).getTime());
        DateTimeUtil.spinDate(-6, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 19).getTime());

        // without looping over
        date = new Date(2015, 4, 31);
        DateTimeUtil.spinDate(1, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 31).getTime());
        DateTimeUtil.spinDate(-50, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 1).getTime());

        // with looping over
        DateTimeUtil.spinDate(31, date, true);
        expect(date.getTime()).toEqual(new Date(2015, 4, 1).getTime());
        DateTimeUtil.spinDate(-5, date, true);
        expect(date.getTime()).toEqual(new Date(2015, 4, 27).getTime());
    });

    it('should spin month portions correctly', () => {
        // base
        let date = new Date(2015, 4, 20);
        DateTimeUtil.spinMonth(1, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 5, 20).getTime());
        DateTimeUtil.spinMonth(-1, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20).getTime());

        // delta !== 1
        DateTimeUtil.spinMonth(5, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 9, 20).getTime());
        DateTimeUtil.spinMonth(-6, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 3, 20).getTime());

        // without looping over
        date = new Date(2015, 11, 31);
        DateTimeUtil.spinMonth(1, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 11, 31).getTime());
        DateTimeUtil.spinMonth(-50, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 0, 31).getTime());

        // with looping over
        date = new Date(2015, 11, 1);
        DateTimeUtil.spinMonth(2, date, true);
        expect(date.getTime()).toEqual(new Date(2015, 1, 1).getTime());
        date = new Date(2015, 0, 1);
        DateTimeUtil.spinMonth(-1, date, true);
        expect(date.getTime()).toEqual(new Date(2015, 11, 1).getTime());

        // coerces date portion to be no greater than max date of current month
        date = new Date(2020, 2, 31);
        DateTimeUtil.spinMonth(-1, date, false);
        expect(date.getTime()).toEqual(new Date(2020, 1, 29).getTime());
        DateTimeUtil.spinMonth(1, date, false);
        expect(date.getTime()).toEqual(new Date(2020, 2, 29).getTime());
        date = new Date(2020, 4, 31);
        DateTimeUtil.spinMonth(1, date, false);
        expect(date.getTime()).toEqual(new Date(2020, 5, 30).getTime());
    });

    it('should spin year portions correctly', () => {
        // base
        let date = new Date(2015, 4, 20);
        DateTimeUtil.spinYear(1, date);
        expect(date.getTime()).toEqual(new Date(2016, 4, 20).getTime());
        DateTimeUtil.spinYear(-1, date);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20).getTime());

        // delta !== 1
        DateTimeUtil.spinYear(5, date);
        expect(date.getTime()).toEqual(new Date(2020, 4, 20).getTime());
        DateTimeUtil.spinYear(-6, date);
        expect(date.getTime()).toEqual(new Date(2014, 4, 20).getTime());

        // coerces February to be 29 days on a leap year and 28 on a non leap year
        date = new Date(2020, 1, 29);
        DateTimeUtil.spinYear(1, date);
        expect(date.getTime()).toEqual(new Date(2021, 1, 28).getTime());
        DateTimeUtil.spinYear(-1, date);
        expect(date.getTime()).toEqual(new Date(2020, 1, 28).getTime());
    });

    it('should spin hours portion correctly', () => {
        // base
        let date = new Date(2015, 4, 20, 6);
        DateTimeUtil.spinHours(1, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 7).getTime());
        DateTimeUtil.spinHours(-1, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 6).getTime());

        // delta !== 1
        DateTimeUtil.spinHours(5, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 11).getTime());
        DateTimeUtil.spinHours(-6, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 5).getTime());

        // without looping over
        date = new Date(2015, 4, 20, 23);
        DateTimeUtil.spinHours(1, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 23).getTime());
        DateTimeUtil.spinHours(-30, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 0).getTime());

        // with looping over (date is not affected)
        DateTimeUtil.spinHours(25, date, true);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 1).getTime());
        DateTimeUtil.spinHours(-2, date, true);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 23).getTime());
    });

    it('should spin minutes portion correctly', () => {
        // base
        let date = new Date(2015, 4, 20, 6, 10);
        DateTimeUtil.spinMinutes(1, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 6, 11).getTime());
        DateTimeUtil.spinMinutes(-1, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 6, 10).getTime());

        // delta !== 1
        DateTimeUtil.spinMinutes(5, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 6, 15).getTime());
        DateTimeUtil.spinMinutes(-6, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 6, 9).getTime());

        // without looping over
        date = new Date(2015, 4, 20, 12, 59);
        DateTimeUtil.spinMinutes(1, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 12, 59).getTime());
        DateTimeUtil.spinMinutes(-70, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 12, 0).getTime());

        // with looping over (hours are not affected)
        DateTimeUtil.spinMinutes(61, date, true);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 12, 1).getTime());
        DateTimeUtil.spinMinutes(-5, date, true);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 12, 56).getTime());
    });

    it('should spin seconds portion correctly', () => {
        // base
        let date = new Date(2015, 4, 20, 6, 10, 5);
        DateTimeUtil.spinSeconds(1, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 6, 10, 6).getTime());
        DateTimeUtil.spinSeconds(-1, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 6, 10, 5).getTime());

        // delta !== 1
        DateTimeUtil.spinSeconds(5, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 6, 10, 10).getTime());
        DateTimeUtil.spinSeconds(-6, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 6, 10, 4).getTime());

        // without looping over
        date = new Date(2015, 4, 20, 12, 59, 59);
        DateTimeUtil.spinSeconds(1, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 12, 59, 59).getTime());
        DateTimeUtil.spinSeconds(-70, date, false);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 12, 59, 0).getTime());

        // with looping over (minutes are not affected)
        DateTimeUtil.spinSeconds(62, date, true);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 12, 59, 2).getTime());
        DateTimeUtil.spinSeconds(-5, date, true);
        expect(date.getTime()).toEqual(new Date(2015, 4, 20, 12, 59, 57).getTime());
    });

    it('should spin AM/PM portion correctly', () => {
        const currentDate = new Date(2015, 4, 31, 4, 59, 59);
        const newDate = new Date(2015, 4, 31, 4, 59, 59);
        // spin from AM to PM
        DateTimeUtil.spinAmPm(currentDate, newDate, 'PM');
        expect(currentDate.getHours()).toEqual(16);

        // spin from PM to AM
        DateTimeUtil.spinAmPm(currentDate, newDate, 'AM');
        expect(currentDate.getHours()).toEqual(4);
    });

    it('should compare dates correctly', () => {
        // base
        let minValue = new Date(2010, 3, 2);
        let maxValue = new Date(2010, 3, 7);
        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 3, 2), minValue)).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 3, 3), minValue)).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 3, 1), minValue)).toBeTrue();

        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 3, 7), maxValue)).toBeFalse();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 3, 6), maxValue)).toBeFalse();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 3, 8), maxValue)).toBeTrue();

        // time variations
        minValue = new Date(2010, 3, 2, 11, 10, 10);
        maxValue = new Date(2010, 3, 2, 15, 15, 15);
        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 3, 2, 11, 10, 11), minValue)).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 3, 2, 11, 10, 10), minValue)).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 3, 2, 11, 10, 9), minValue)).toBeTrue();

        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 3, 2, 11, 11, 10), minValue)).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 3, 2, 11, 10, 10), minValue)).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 3, 2, 11, 9, 10), minValue)).toBeTrue();

        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 3, 2, 12, 10, 10), minValue)).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 3, 2, 11, 10, 10), minValue)).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 3, 2, 10, 10, 10), minValue)).toBeTrue();

        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 3, 3, 11, 10, 10), minValue)).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 3, 2, 11, 10, 10), minValue)).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 3, 1, 11, 10, 10), minValue)).toBeTrue();

        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 4, 2, 11, 10, 10), minValue)).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 3, 2, 11, 10, 10), minValue)).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 2, 2, 11, 10, 10), minValue)).toBeTrue();

        expect(DateTimeUtil.lessThanMinValue(new Date(2011, 3, 2, 11, 10, 10), minValue)).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(new Date(2010, 3, 2, 11, 10, 10), minValue)).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(new Date(2009, 3, 2, 11, 10, 10), minValue)).toBeTrue();

        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 3, 2, 15, 15, 16), maxValue)).toBeTrue();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 3, 2, 15, 15, 15), maxValue)).toBeFalse();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 3, 2, 15, 15, 14), maxValue)).toBeFalse();

        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 3, 2, 15, 16, 15), maxValue)).toBeTrue();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 3, 2, 15, 15, 15), maxValue)).toBeFalse();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 3, 2, 15, 14, 15), maxValue)).toBeFalse();

        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 3, 2, 16, 15, 15), maxValue)).toBeTrue();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 3, 2, 15, 15, 15), maxValue)).toBeFalse();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 3, 2, 14, 15, 15), maxValue)).toBeFalse();

        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 3, 3, 15, 15, 15), maxValue)).toBeTrue();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 3, 2, 15, 15, 15), maxValue)).toBeFalse();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 3, 1, 15, 15, 15), maxValue)).toBeFalse();

        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 4, 2, 15, 15, 15), maxValue)).toBeTrue();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 3, 2, 15, 15, 15), maxValue)).toBeFalse();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 2, 2, 15, 15, 15), maxValue)).toBeFalse();

        expect(DateTimeUtil.greaterThanMaxValue(new Date(2011, 3, 2, 15, 15, 15), maxValue)).toBeTrue();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(2010, 3, 2, 15, 15, 15), maxValue)).toBeFalse();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(2009, 3, 2, 15, 15, 15), maxValue)).toBeFalse();


        // date excluded
        expect(DateTimeUtil.lessThanMinValue(new Date(2030, 3, 2, 11, 10, 9), minValue, true, false)).toBeTrue();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(2000, 3, 2, 15, 15, 16), minValue, true, false)).toBeTrue();

        // time excluded
        expect(DateTimeUtil.lessThanMinValue(new Date(2009, 3, 2, 11, 10, 10), minValue, false, true)).toBeTrue();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(2011, 3, 2, 15, 15, 15), minValue, true, false)).toBeTrue();

        // falsy values
        expect(DateTimeUtil.lessThanMinValue(new Date(NaN), new Date(NaN))).toBeFalse();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(NaN), new Date(NaN))).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(new Date(NaN), null)).toBeFalse();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(NaN), null)).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(null, new Date(NaN))).toBeFalse();
        expect(DateTimeUtil.greaterThanMaxValue(null, new Date(NaN))).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(new Date(NaN), undefined)).toBeFalse();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(NaN), undefined)).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(undefined, new Date(NaN))).toBeFalse();
        expect(DateTimeUtil.greaterThanMaxValue(undefined, new Date(NaN))).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(new Date(NaN), new Date())).toBeFalse();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(NaN), new Date())).toBeFalse();
        expect(DateTimeUtil.lessThanMinValue(new Date(), new Date(NaN))).toBeFalse();
        expect(DateTimeUtil.greaterThanMaxValue(new Date(), new Date(NaN))).toBeFalse();
    });

    it('should return ValidationErrors for minValue and maxValue', () => {
        let minValue = new Date(2010, 3, 2);
        let maxValue = new Date(2010, 3, 7);

        expect(DateTimeUtil.validateMinMax(new Date(2010, 3, 4), minValue, maxValue)).toEqual({});
        expect(DateTimeUtil.validateMinMax(new Date(2010, 2, 7), minValue, maxValue)).toEqual({ minValue: true });
        expect(DateTimeUtil.validateMinMax(new Date(2010, 4, 2), minValue, maxValue)).toEqual({ maxValue: true });

        minValue = new Date(2010, 3, 2, 10, 10, 10);
        maxValue = new Date(2010, 3, 2, 15, 15, 15);

        // TODO: test with time portions as well
        return;
        expect(DateTimeUtil.validateMinMax(new Date(2010, 3, 2, 11, 11, 11), minValue, maxValue)).toEqual({});
        expect(DateTimeUtil.validateMinMax(new Date(2010, 3, 2, 9, 11, 11), minValue, maxValue)).toEqual({ minValue: true });
        expect(DateTimeUtil.validateMinMax(new Date(2010, 3, 2, 16, 11, 11), minValue, maxValue)).toEqual({ maxValue: true });
    });

    it('should parse dates correctly with parseDate', () => {
        pending('TODO: ISO implementation');
        // // ISO strings and numbers
        // expect(DateTimeUtil.parseDate('2012-12-12T12:12:12').getTime()).toEqual(new Date(2012, 11, 12, 12, 12, 12).getTime());
        // expect(DateTimeUtil.parseDate(new Date()).getTime()).toEqual(new Date().getTime());
        // expect(DateTimeUtil.parseDate(new Date().getTime()).getTime()).toEqual(new Date().getTime());

        // // non ISO strings with mask and no dateTimeParts
        // let mask = 'dd/MM/yyyy HH:mm:ss';
        // expect(DateTimeUtil.parseDate('12/12/2012 12:12:12', null, mask)
        //     .getTime()).toEqual(new Date(2012, 11, 12, 12, 12, 12).getTime());
        // mask = 'MM-dd-yyyy mm:ss';
        // expect(DateTimeUtil.parseDate('06/04/2012 44:12', null, mask).getTime()).toEqual(new Date(2012, 5, 4, 0, 44, 12).getTime());
        // mask = 'yy-dd-MM ss:HHmm';
        // expect(DateTimeUtil.parseDate('12/12/12 12:12:12', null, mask).getTime()).toEqual(new Date(2012, 11, 12, 12, 12, 12).getTime());
        // mask = 'dd///()#yy123/\\\/MM  ___   ss(|::HH123456::123123    mm';
        // expect(DateTimeUtil.parseDate('12/12/12 12:12:12', null, mask).getTime()).toEqual(new Date(2012, 11, 12, 12, 12, 12).getTime());

        // // non ISO strings with dateTimeParts and no mask
        // const dateTimeParts = DateTimeUtil.parseDateTimeFormat(mask);
        // expect(DateTimeUtil.parseDate('12/12/12 12:12:12', dateTimeParts).getTime())
        //     .toEqual(new Date(2012, 11, 12, 12, 12, 12).getTime());

        // // invalid values
        // expect(DateTimeUtil.parseDate(undefined)).toEqual(null);
        // expect(DateTimeUtil.parseDate(NaN)).toEqual(null);
        // expect(DateTimeUtil.parseDate([])).toEqual(null);
        // expect(DateTimeUtil.parseDate({})).toEqual(null);
        // expect(DateTimeUtil.parseDate('')).toEqual(null);
        // expect(DateTimeUtil.parseDate(new Date(NaN))).toEqual(null);
        // expect(DateTimeUtil.parseDate(null)).toBeInstanceOf(Date);
        // expect(DateTimeUtil.parseDate(true)).toBeInstanceOf(Date);
        // expect(DateTimeUtil.parseDate(false)).toBeInstanceOf(Date);
    });

    it('isValidDate should properly determine if a date is valid or not', () => {
        expect(DateTimeUtil.isValidDate(new Date())).toBeTrue();
        expect(DateTimeUtil.isValidDate(new Date(NaN))).toBeFalse();
        expect(DateTimeUtil.isValidDate(new Date().getTime())).toBeFalse();
        expect(DateTimeUtil.isValidDate('')).toBeFalse();
        expect(DateTimeUtil.isValidDate({})).toBeFalse();
        expect(DateTimeUtil.isValidDate([])).toBeFalse();
        expect(DateTimeUtil.isValidDate(null)).toBeFalse();
        expect(DateTimeUtil.isValidDate(undefined)).toBeFalse();
        expect(DateTimeUtil.isValidDate(false)).toBeFalse();
        expect(DateTimeUtil.isValidDate(true)).toBeFalse();
    });
});
