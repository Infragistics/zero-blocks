import { isDevMode } from '@angular/core';

/**
 * @hidden
 */
export const DeprecateClass = (message: string) => {
    let isMessageShown = false;

    return <T extends new(...args: any[]) => any>(originalClass: T) => class extends originalClass {
        constructor(...args) {
            const target: any = originalClass;
            const targetName = typeof target === 'function' ? target.name : target.constructor.name;
            isMessageShown = showMessage(`${targetName}: ${message}`, isMessageShown);

            super(...args);
        }
    };
};

/**
 * @hidden
 */
export function DeprecateMethod(message: string): MethodDecorator {
    let isMessageShown = false;

    return function(target: any, key: string, descriptor: PropertyDescriptor) {
        if (descriptor && descriptor.value) {
            const originalMethod = descriptor.value;

            descriptor.value = function() {
                const targetName = typeof target === 'function' ? target.name : target.constructor.name;
                isMessageShown = showMessage(`${targetName}.${key}: ${message}`, isMessageShown);
                const args = [];
                for (const x of arguments) {
                    args.push(x);
                }
                return originalMethod.call(this, ...args);
            };

            return descriptor;
        }
    };
}

/**
 * @hidden
 */
export function DeprecateProperty(message: string): PropertyDecorator {
    return function(target: any, key: string) {
        let isMessageShown = false;
        const messageToDisplay = `${target.constructor.name}.${key}: ${message}`;

        // if the target already has the property defined
        const originalDescriptor = Object.getOwnPropertyDescriptor(target, key);
        if (originalDescriptor) {
            const getter = originalDescriptor.get;
            const setter = originalDescriptor.set;

            if (getter) {
                originalDescriptor.get = function() {
                    isMessageShown = showMessage(messageToDisplay, isMessageShown);
                    return getter.call(this);
                };
            }

            if (setter) {
                originalDescriptor.set = function(value) {
                    isMessageShown = showMessage(messageToDisplay, isMessageShown);
                    setter.call(this, value);
                };
            }

            return originalDescriptor;
        }

        // the target doesn't contain a descriptor for that property, so create one
        // use backing field to set/get the value of the property to ensure there won't be infinite recursive calls
        const newKey = generateUniqueKey(target, key);
        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: true,
            set(value) {
                isMessageShown = showMessage(messageToDisplay, isMessageShown);
                this[newKey] = value;
            },
            get() {
                isMessageShown = showMessage(messageToDisplay, isMessageShown);
                return this[newKey];
            }
        });
    };
}

/**
 * @hidden
 */
const generateUniqueKey = (target: any, key: string): string => {
    let newKey = '_' + key;
    while (target.hasOwnProperty(newKey)) {
        newKey = '_' + newKey;
    }

    return newKey;
};

/**
 * @hidden
 */
export const showMessage = (message: string, isMessageShown: boolean): boolean => {
    if (!isMessageShown && isDevMode()) {
        console.warn(message);
    }

    return true;
};
