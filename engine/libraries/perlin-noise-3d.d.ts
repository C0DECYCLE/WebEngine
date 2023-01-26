declare class perlinNoise3d {
    constructor();
    noiseSeed( seed: any ): void;
    get( x: number, y: number, z: number ): number;
}