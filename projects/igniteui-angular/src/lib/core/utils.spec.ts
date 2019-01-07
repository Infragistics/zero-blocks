import { cloneValue, mergeObjects, isObject, isDate } from './utils';
import { SampleTestData } from '../test-utils/sample-test-data.spec';

describe('Utils', () => {
    const complexObject = {
        Number: 0,
        String: 'Some string',
        Boolean: true,
        Date: new Date(0),
        Object10: {
            Number: 10,
            String: 'Some second level string 10',
            Boolean: false,
            Date: new Date(10 * 1000 * 60 * 60 * 24),
            Object100: {
                Number: 100,
                String: 'Some third level string 100',
                Boolean: false,
                Date: new Date(100 * 1000 * 60 * 60 * 24),
            },
            Object101: {
                Number: 101,
                String: 'Some third level string 101',
                Boolean: false,
                Date: new Date(101 * 1000 * 60 * 60 * 24),
            }
        },
        Object11: {
            Number: 11,
            String: 'Some second level string 11',
            Boolean: false,
            Date: new Date(11 * 1000 * 60 * 60 * 24),
            Object110: {
                Number: 110,
                String: 'Some third level string 110',
                Boolean: false,
                Date: new Date(110 * 1000 * 60 * 60 * 24),
            },
            Object111: {
                Number: 111,
                String: 'Some third level string 111',
                Boolean: false,
                Date: new Date(111 * 1000 * 60 * 60 * 24),
            }
        }
    };

    describe('Utils - cloneValue() unit tests', () => {
        it('Should return primitive values', () => {
            let input: any = 10;
            let expected: any = 10;
            expect(cloneValue(input)).toBe(expected);

            input = 0;
            expected = 0;
            expect(cloneValue(input)).toBe(expected);

            input = Infinity;
            expected = Infinity;
            expect(cloneValue(input)).toBe(expected);

            input = '';
            expected = '';
            expect(cloneValue(input)).toBe(expected);

            input = true;
            expected = true;
            expect(cloneValue(input)).toBe(expected);

            input = false;
            expected = false;
            expect(cloneValue(input)).toBe(expected);

            input = null;
            expected = null;
            expect(cloneValue(input)).toBe(expected);

            input = undefined;
            expected = undefined;
            expect(cloneValue(input)).toBe(expected);
        });

        it('Should not clone Map or Set', () => {
            const mapInput: Map<string, number> = new Map();
            mapInput.set('a', 0);
            mapInput.set('b', 1);
            mapInput.set('c', 2);
            const mapClone = cloneValue(mapInput);
            expect(mapInput).toBe(mapClone);

            const setInput: Set<Number> = new Set();
            setInput.add(0);
            setInput.add(1);
            setInput.add(2);
            const setClone = cloneValue(setInput);
            expect(setInput).toBe(setClone);
        });

        it('Should clone correctly dates', () => {
            const input: Date = new Date(0);
            const clone: Date = cloneValue(input);
            expect(clone).not.toBe(input);
            expect(clone.getTime()).toBe(input.getTime());

            //  change of the input should not change the clone
            input.setDate(10);
            expect(clone.getTime()).not.toBe(input.getTime());
        });

        it('Should create shallow copy of array', () => {
            const input: { Number: any, String: any, Boolean: any, Date: any }[] = SampleTestData.differentTypesData();
            const clone: { Number: any, String: any, Boolean: any, Date: any }[] = cloneValue(input);
            expect(clone).not.toBe(input);
            expect(clone.length).toBe(input.length);
            expect(clone).toEqual(input);

            input[0].String = input[0].String + ' some additional value';
            input[0].Boolean = !input[0].Boolean;
            input[0].Number *= 1000;
            expect(clone).toEqual(input);
        });

        it('Should correctly deep clone objects', () => {
            const input = complexObject;
            const clone = cloneValue(input);
            expect(input).toEqual(clone);
            expect(input.Object10).toEqual(clone.Object10);
            expect(input.Object11).toEqual(clone.Object11);

            expect(input.Date).toEqual(clone.Date);
            expect(input.Date).not.toBe(clone.Date);
            expect(input.Date.getTime()).toBe(clone.Date.getTime());

            expect(input.Object10.Date).toEqual(clone.Object10.Date);
            expect(input.Object10.Date).not.toBe(clone.Object10.Date);
            expect(input.Object10.Date.getTime()).toBe(clone.Object10.Date.getTime());

            expect(input.Object11.Object111.Date).toEqual(clone.Object11.Object111.Date);
            expect(input.Object11.Object111.Date).not.toBe(clone.Object11.Object111.Date);
            expect(input.Object11.Object111.Date.getTime()).toBe(clone.Object11.Object111.Date.getTime());

            expect(input.Number).toBe(clone.Number);
            expect(input.Object10.Number).toBe(clone.Object10.Number);
            expect(input.Object11.Object111.Number).toBe(clone.Object11.Object111.Number);

            expect(input.String).toBe(clone.String);
            expect(input.Object10.String).toBe(clone.Object10.String);
            expect(input.Object11.Object111.String).toBe(clone.Object11.Object111.String);

            expect(input.Boolean).toBe(clone.Boolean);
            expect(input.Object10.Boolean).toBe(clone.Object10.Boolean);
            expect(input.Object11.Object111.Boolean).toBe(clone.Object11.Object111.Boolean);
        });

        it('Should correctly deep clone object with special values', () => {
            const objectWithSpecialValues = {};
            objectWithSpecialValues['Null'] = null;
            objectWithSpecialValues['Undefined'] = undefined;
            const clone = cloneValue(objectWithSpecialValues);

            expect(clone.Null).toBeNull();
            expect(clone.undefined).toBeUndefined();
        });

        it('Should correctly handle null and undefined values', () => {
            const nullClone = cloneValue(null);
            expect(nullClone).toBeNull();

            const undefinedClone = cloneValue(undefined);
            expect(undefinedClone).toBeUndefined();
        });
    });

    describe('Utils - mergeObjects() unit tests', () => {
        it('Should correctly merge objects', () => {
            const obj1 = {
                Numeric: 1,
                String: 'Some test string',
                Boolean: true,
                Date: new Date(0),
                Object: {
                    Numeric: 10,
                    String: 'Some inner test string',
                    Boolean: false,
                    Date: new Date(1000 * 60 * 60 * 24 * 10),
                }
            };

            const obj2 = {
                Numeric: 100,
                String: 'Some changed test string',
                Boolean: false,
                Date: new Date(1000 * 60 * 60 * 24 * 100),
                Object: {
                    Numeric: Infinity,
                }
            };

            const result = mergeObjects(obj1, obj2);
            expect(result.Numeric).toBe(obj2.Numeric);
            expect(result.String).toBe(obj2.String);
            expect(result.Boolean).toBe(obj2.Boolean);
            expect(result.Date).toEqual(obj2.Date);
            expect(result.Date).not.toBe(obj2.Date);
            expect(result.Date.getTime()).toBe(obj2.Date.getTime());

            expect(result.Object).toEqual(obj2.Object);
            expect(result.Object).not.toBe(obj2.Object);
            expect(result.Object.Numeric).toEqual(obj2.Object.Numeric);
        });

        it('Should correctly merge into empty object', () => {
            const obj1 = {};
            const obj2 = {
                Test: 'Test',
                Date: new Date(0)
            };

            const result = mergeObjects(obj1, obj2);
            expect(result).toEqual(obj2);
            expect(result).not.toBe(obj2);
        });

        it('Should correctly merge from empty object', () => {
            const obj1 = {
                Test: 'Test',
                Date: new Date(0)
            };
            const obj2 = {};

            const result = mergeObjects(obj1, obj2);
            expect(result).toEqual(obj1);
            expect(result).toBe(obj1);
        });

        it('Should throw when try to merge into null object', () => {
            const obj1 = null;
            const obj2 = {
                Test: 'Test',
                Date: new Date(0)
            };

            const errorFunction = function () { mergeObjects(obj1, obj2); };
            expect(errorFunction).toThrowError(`Cannot merge into ${obj1}. First param must be an object.`);
        });

        it('Should correctly merge from null object', () => {
            const obj1 = {
                Test: 'Test',
                Date: new Date(0)
            };
            const obj2 = null;

            const result = mergeObjects(obj1, obj2);
            expect(result).toEqual(obj1);
            expect(result).toBe(obj1);
        });

        it('Should throw when try to merge into undefined object', () => {
            const obj1 = undefined;
            const obj2 = {
                Test: 'Test',
                Date: new Date(0)
            };

            const errorFunction = function () { mergeObjects(obj1, obj2); };
            expect(errorFunction).toThrowError(`Cannot merge into ${obj1}. First param must be an object.`);
        });

        it('Should correctly merge from undefined object', () => {
            const obj1 = {
                Test: 'Test',
                Date: new Date(0)
            };
            const obj2 = undefined;

            const result = mergeObjects(obj1, obj2);
            expect(result).toEqual(obj1);
            expect(result).toBe(obj1);
        });

        it('Should throw error when try to merge into non object type', () => {
            let obj1: any = 'Some string';
            const obj2 = {};
            const errorFunction = function () { mergeObjects(obj1, obj2); };
            expect(errorFunction).toThrowError(`Cannot merge into ${obj1}. First param must be an object.`);

            obj1 = 100;
            expect(errorFunction).toThrowError(`Cannot merge into ${obj1}. First param must be an object.`);

            obj1 = true;
            expect(errorFunction).toThrowError(`Cannot merge into ${obj1}. First param must be an object.`);

            obj1 = new Date(0);
            expect(errorFunction).toThrowError(`Cannot merge into ${obj1}. First param must be an object.`);
        });

        it('Should return first object when try to merge from non object type', () => {
            const obj1 = {};
            let obj2: any = 'Some string';
            expect(mergeObjects(obj1, obj2)).toBe(obj1);

            obj2 = 100;
            expect(mergeObjects(obj1, obj2)).toBe(obj1);

            obj2 = true;
            expect(mergeObjects(obj1, obj2)).toBe(obj1);

            obj2 = new Date(0);
            expect(mergeObjects(obj1, obj2)).toBe(obj1);
        });
    });

    describe('Utils - isObject() unit tests', () => {
        it('Should correctly determine if variable is Object', () => {
            let variable: any = {};
            expect(isObject(variable)).toBeTruthy();

            variable = 10;
            expect(isObject(variable)).toBeFalsy();

            variable = 'Some string';
            expect(isObject(variable)).toBeFalsy();

            variable = '';
            expect(isObject(variable)).toBeFalsy();

            variable = true;
            expect(isObject(variable)).toBeFalsy();

            variable = false;
            expect(isObject(variable)).toBeFalsy();

            variable = new Date(0);
            expect(isObject(variable)).toBeFalsy();

            variable = null;
            expect(isObject(variable)).toBeFalsy();

            variable = undefined;
            expect(isObject(variable)).toBeFalsy();

            variable = [];
            expect(isObject(variable)).toBeFalsy();

            variable = new Map();
            expect(isObject(variable)).toBeFalsy();

            variable = new Set();
            expect(isObject(variable)).toBeFalsy();
        });
    });

    describe('Utils - isDate() unit tests', () => {
        it('Should correctly determine if variable is Date', () => {
            let variable: any = new Date(0);
            expect(isDate(variable)).toBeTruthy();

            variable = new Date('wrong date parameter');
            expect(isDate(variable)).toBeTruthy();

            variable = 10;
            expect(isDate(variable)).toBeFalsy();

            variable = 'Some string';
            expect(isDate(variable)).toBeFalsy();

            variable = '';
            expect(isDate(variable)).toBeFalsy();

            variable = true;
            expect(isDate(variable)).toBeFalsy();

            variable = false;
            expect(isDate(variable)).toBeFalsy();

            variable = {};
            expect(isDate(variable)).toBeFalsy();

            variable = null;
            expect(isDate(variable)).toBeFalsy();

            variable = undefined;
            expect(isDate(variable)).toBeFalsy();

            variable = [];
            expect(isDate(variable)).toBeFalsy();

            variable = new Map();
            expect(isDate(variable)).toBeFalsy();

            variable = new Set();
            expect(isDate(variable)).toBeFalsy();
        });
    });
});
