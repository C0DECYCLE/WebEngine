/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

abstract class AbstractLOD implements IAbstractLOD {

    public static readonly minimum: float = 0.01;

    public static getMinimum( nameOrMin: string | float ): float {

        const min: float = ( typeof nameOrMin === "string" ) ? Number( nameOrMin.split( "_" )[2] ) : nameOrMin;

        return min.clamp( AbstractLOD.minimum, Infinity );
    }

    public readonly levels: [ any, float ][] = [];

    public get isEnabled(): boolean {

        return this.enabled;
    }

    public get isVisible(): boolean {
    
        return this.currentLevel !== undefined;
    }

    protected enabled: boolean = true;

    protected coverage: float;
    protected currentLevel?: int;
    protected lastValidLevel: int = 0;

    protected constructor() {

    }

    public add( level: any, min: float ): void {

        this.levels.push( [ level, min ] );
    }

    public setEnabled( value: boolean ): void {

        if ( value === this.isEnabled ) {

            return;
        }

        this.set( value === true ? this.lastValidLevel : -1 );
    }

    public set( level: int ): void {

        this.setLevel( level );
        this.enabled = this.isVisible;
    }

    protected disposeCurrent( _currentLevel: int ): void {

        this.currentLevel = undefined;
    }

    protected makeCurrent( level: int ): void {

        this.currentLevel = level;
        this.lastValidLevel = this.currentLevel;
    }

    protected setLevel( level: int | false ): void {

        if ( level !== this.currentLevel ) {

            if ( typeof this.currentLevel === "number" ) {
                
                this.disposeCurrent( this.currentLevel );
            }

            if ( level !== false ) {

                this.makeCurrent( level );
            }
        }
    }

    protected getLevelFromCoverage( coverage: float ): int | false {

        for ( let i: int = 0; i < this.levels.length; i++ ) {

            if ( ( i - 1 < 0 ? coverage <= Infinity : coverage < this.levels[ i - 1 ][1] ) && coverage >= this.levels[i][1] ) {

                return i;
            }
        }

        return false;
    }

}