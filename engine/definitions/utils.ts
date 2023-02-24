/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

type int = number & { __type?: "int" };

type float = number & { __type?: "float" };

type Nullable<T> = T | null;

type EmptyCallback = () => void;
