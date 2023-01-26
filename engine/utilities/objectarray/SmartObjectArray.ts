/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

class SmartObjectArray< T extends object > extends ObjectArray< T > implements ISmartObjectArray< T > {

    private static readonly default: any = null;

    public get size(): int {

        return this.capacity;
    }
    
    private capacity: int = 0;

    public constructor( capacity: int ) {
    
        super( capacity );
        this.flood();
    }

    public override push( ...elements: T[] ): int {
            
        this[ this.capacity ] = this.initialize( elements[0], this.capacity++ );

        if ( this.capacity === this.length ) {

            this.length *= 2;
            this.flood( this.capacity );
        }

        return this.capacity;
    }

    public override pop(): T | undefined {
        
        if ( this.capacity > 0 ) {

            const object: T = this[ --this.capacity ];
            this.decommission( object );
            this.clean( this.capacity );

            return object;
        }

        return undefined;
    }

    public override clear(): void {
        
        let i: int;

        for ( i = 0; i < this.capacity; i++ ) {

            this.decommission( this[i] );
            this.clean( i );
        }

        this.capacity = 0;
    }

    public override delete( element: T ): void {
        
        super.delete( element, this.capacity );
    }

    private flood( start: int = 0, end: int = this.length ): void {

        let i: int;

        for ( i = start; i < end; i++ ) {

            this.clean(i);
        }
    }

    private clean( index: int ): void {

        this[ index ] = SmartObjectArray.default;
    }

}