/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

class StateMachine implements IStateMachine {

    public get current(): string {

        return this.currentKey;
    }
    
    private currentKey: string = "";
    private readonly list: Map< string, IState > = new Map< string, IState >();

    public add( key: string, onEnter: IState[ "onEnter" ], onLeave: IState[ "onLeave" ] ): void {

        if ( key === "" ) {
            
            console.error( `StateMachine: Key "${ key }" isn't allowed.` );
            return;
        }
        
        this.list.set( key, new State( onEnter, onLeave ) );
    }

    public set( key: string, params?: any ): void {

        if ( this.list.has( key ) === false ) {
            
            console.error( `StateMachine: Key "${ key }" doesn't exist.` );
            return;
        }

        const oldKey: string = this.currentKey;
        this.currentKey = key;

        this.list.get( oldKey )?.onLeave( this.currentKey, params );
        this.list.get( this.currentKey )?.onEnter( oldKey, params );
    }

    public is( key: string ): boolean {

        return this.currentKey === key;
    }
    
}