/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

interface IObjectArray< T extends object > {

    push( ...elements: T[] ): int;

    indexOf( element: T, fromIndex?: int ): int;

    includes( element: T, _fromIndex?: int ): boolean;

    pop(): T | undefined;

    splice( start: int, deleteCount?: int ): T[];

    splice( start: int, _deleteCount: int, ..._items: T[] ): T[];

    shift(): T | undefined;

    sort( _compareFn?: ( ( a: T, b: T ) => int) ): this;

    unshift( ..._items: T[] ): int;

    clear(): void;
    
    add( element: T ): void;

    has( element: T ): boolean;

    delete( element: T, length: int ): void;

}