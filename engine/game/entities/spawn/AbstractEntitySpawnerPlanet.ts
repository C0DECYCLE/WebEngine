/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

abstract class AbstractEntitySpawnerPlanet implements IAbstractEntitySpawnerPlanet {

    public config: IConfig = {

        seed: undefined,
    
        density: 0.0015
    };

    public readonly planet: IPlanet;

    public readonly list: ISpawnable[] = [];

    private perlin: perlinNoise3d;

    private preFilters: TFilter[] = [];
    private postFilters: TFilter[] = [];

    protected constructor( planet: IPlanet, config?: IConfig ) {
        
        this.planet = planet;

        EngineUtils.configure( this, config );

        this.setupPerlin();
    }

    protected addPreFilter( prefilter: TFilter ): void {

        this.preFilters.push( prefilter );
    }

    protected addPostFilter( filter: TFilter ): void {

        this.postFilters.push( filter );
    }

    protected spawn(): void {

        const planetSurfaceArea: float = 4 * Math.PI * (this.planet.config.radius ** 2);
        const n: int = Math.floor( planetSurfaceArea * 0.01 * this.config.density );
        
        for ( let i: int = 0; i < n; i++ ) {

            this.evaluate( this.getPosition( i, n ), n );
        }
    }

    protected abstract create( _position: BABYLON.Vector3, _n: int, _varyings: IVaryings ): [ ISpawnable, IVaryings ];

    protected noise( input: float | BABYLON.Vector3 ): float {

        if ( input instanceof BABYLON.Vector3 ) {

            return this.perlin.get( input.x, input.y, input.z );
        }

        return this.perlin.get( input, input, input );
    }

    private setupPerlin(): void {

        this.config.seed = this.config.seed || this.planet.config.seed.y;

        this.perlin = new perlinNoise3d();
        this.perlin.noiseSeed( this.config.seed );
    }
    
    protected getPosition( i: int, n: int ): BABYLON.Vector3 {

        const theta: float = 2 * Math.PI * i / PHI;
        const phi: float = Math.acos( 1 - 2 * ( i + 0.5 ) / n );

        return new BABYLON.Vector3( Math.cos( theta ) * Math.sin( phi ), Math.sin( theta ) * Math.sin( phi ), Math.cos( phi ) ); 
    }

    private evaluate( position: BABYLON.Vector3, n: int ): void {

        const pretest: false | IVaryings = this.test( this.preFilters, [ position ] );

        if ( pretest !== false ) {
            
            const creation: [ ISpawnable, IVaryings ] = this.create( position, n, pretest );

            if ( this.test( this.postFilters, creation ) !== false ) {
            
                this.list.push( creation[0] );
            }
        }
    }

    private test( filter: TFilter[], args: any[] ): false | IVaryings {

        const varyings: IVaryings = {};

        for ( let i: int = 0; i < filter.length; i++ ) {

            const result: false | IVaryings = filter[i]( ...args );

            if ( result === false ) {

                return false;
            }

            Object.assign( varyings, result );
        }

        return varyings;
    }

}