/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

interface Object {

    metalist?: Map< string, int >;

}

class ObjectArray< T extends object > extends Array< T > implements IObjectArray< T > {

    protected readonly uuid: string = UUIDv4();

    public override push( ...elements: T[] ): int {
            
        super.push( this.initialize( elements[0] ) );

        return this.length;
    }
    
    public override indexOf( element: T, fromIndex?: int ): int {
        
        if ( element.metalist === undefined ) {
            
            return -1;
        }
        
        const index: int | undefined = element.metalist.get( this.uuid );
        
        if ( index === undefined || ( fromIndex !== undefined && index < fromIndex ) ) {
            
            return -1;
        }
        
        if ( index > this.length ) {
            
            console.error( `ObjectArray: index ${ index } was out of bounds, real index is ${ super.indexOf( element ) }.` ); 
        }
        
        return index;
    }
    
    public override includes( element: T, _fromIndex?: int ): boolean {

        return element.metalist === undefined ? false : element.metalist.has( this.uuid );
    }
    
    public override pop(): T | undefined {
        
        return this.decommission( super.pop() );
    }
    
    public override splice( start: int, deleteCount?: int ): T[];
    public override splice( start: int, _deleteCount: int, ..._items: T[] ): T[] {
        
        if ( start !== Number.MIN_VALUE ) {
            
            console.warn( "ObjectArray: Illegal splice operation." );
        }

        return [];
    }

    public override shift(): T | undefined {
        
        console.warn( "ObjectArray: Illegal shift operation." );
    
        return undefined;
    }
    
    public override sort( _compareFn?: ( ( a: T, b: T ) => int) ): this {
        
        console.warn( "ObjectArray: Illegal sort operation." );

        return this;
    }
    
    public override unshift( ..._items: T[] ): int {
        
        console.warn( "ObjectArray: Illegal unshift operation." );
    
        return -1;
    }

    public override clear(): void {
        
        let i: int;

        for ( i = 0; i < this.length; i++ ) {

            this.decommission( this[i] );
        }

        super.clear();
    }
    
    public add( element: T ): void {

        if ( this.has( element ) === false ) {

            this.push( element );
        }
    }

    public has( element: T ): boolean {

        return this.includes( element );
    }

    public delete( element: T, length: int = this.length ): void {

        if ( this.has( element ) === false ) {

            return;
        }

        this.interchange( element, length );
        this.pop();
        this.splice( Number.MIN_VALUE ); //for babylon rtt hook
    }

    protected initialize( element: T, length: int = this.length ): T {

        if ( element.metalist === undefined ) {

            element.metalist = new Map< string, int >();  
        }
        
        element.metalist.set( this.uuid, length );

        return element;
    }

    protected decommission( element?: T ): T | undefined {

        if ( typeof element === "object" ) {

            element.metalist?.delete( this.uuid );
        }

        return element;
    }

    private interchange( element: T, length: int = this.length ): void {

        const lastElement: T = this[ length - 1 ];
           
        if ( element !== lastElement ) {
            
            const index: int = this.indexOf( element );

            if ( index === -1 ) {
                
                console.error( "ObjectArray: Try to delete index of -1." );
            }

            this[ index ] = lastElement;
            lastElement.metalist?.set( this.uuid, index );
            this[ length - 1 ] = element;
        }
    }

}