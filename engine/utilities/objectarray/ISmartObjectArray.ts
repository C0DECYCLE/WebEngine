/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

interface ISmartObjectArray< T extends object > extends IObjectArray< T > {

    get size(): int;

    push( ...elements: T[] ): int;

    pop(): T | undefined;

    clear(): void;

    delete( element: T ): void;

}