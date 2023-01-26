/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

interface IAbstractEntitySpawnerPlanet extends IConfigurable {

    readonly planet: IPlanet;

    readonly list: ISpawnable[];
}