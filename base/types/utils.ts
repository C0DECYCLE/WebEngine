/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

type int = number & { __type?: "int" };

type float = number & { __type?: "float" };

type uuid = string & { __type?: "uuid" };

type Nullable<T> = T | null;

type Undefinable<T> = T | undefined;

type EmptyCallback = () => void;

class MapS<T> extends Map<string, T> {}

interface Number {
    between(a: int | float, b: int | float): boolean;
    dotit(): string;
    clamp(min: int | float, max: int | float): float;
}

interface String {
    firstLetterUppercase(): string;
    replaceAt(index: int, replacement: string): string;
}

interface Array<T> {
    clear(): void;
}