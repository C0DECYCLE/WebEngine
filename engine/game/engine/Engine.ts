/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

class Engine implements IEngine {

    /* Singleton */ 
        private static instance: IEngine; 
        public static instantiate(): void { if ( this.instance === undefined ) this.instance = new Engine(); } 
        public static getInstance(): IEngine { return this.instance; }

        
    public canvas: HTMLCanvasElement;
    public babylon: BABYLON.Engine;
    public screenSize: BABYLON.Vector2;
    public readonly stats: Stats[] = [];

    public get deltaCorrection(): float {

        return this.deltaCorrectionValue;
    }

    private readonly fpsTarget: int = 60;
    private deltaCorrectionValue: float = 1.0;
    private update: TEmptyCallback;
    private renderScene: BABYLON.Scene;

    public constructor() {
    
        this.createCanvas();
        this.browserSupport( (): void => {

            this.createBabylon();
            this.createStats();

            this.babylon.runRenderLoop( (): void => this.renderLoop() );
            window.addEventListener( "resize", (): void => this.babylon.resize() );
        } );
    }

    public set( update: TEmptyCallback, renderScene: BABYLON.Scene ): void {

        this.update = update;
        this.renderScene = renderScene;
    }
    
    private createCanvas(): void {

        this.canvas = document.createElement( "canvas" );        
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";

        document.body.appendChild( this.canvas );
    }

    private browserSupport( callback: TEmptyCallback ): void {
        
        const context: Nullable< WebGL2RenderingContext > = this.canvas.getContext( "webgl2" );
        
        if ( context !== null && context instanceof WebGL2RenderingContext ) {

            callback();
            return;
        }
            
        console.error( "No WebGL2 support!" );
    }

    private createBabylon(): void {

        this.babylon = new BABYLON.Engine( this.canvas );
        this.screenSize = new BABYLON.Vector2( this.babylon.getRenderWidth(), this.babylon.getRenderHeight() );
    }

    private createStats(): void {

        this.stats.push( this.createStat( 0, 0, 0 ) ); // fps all
        this.stats.push( this.createStat( 1, 1, 0 ) ); // ms all
        this.stats.push( this.createStat( 2, 2, 0 ) ); // mb all

        this.stats.push( this.createStat( 1, 1, 1 ) ); // ms update
        this.stats.push( this.createStat( 1, 1, 2 ) ); // ms render

        //this.stats.push( this.createStat( 3, 3, 0 ) ); // calls draw
    }

    private createStat( i: int, x: int, y: int ): Stats { // 0: fps, 1: ms, 2: mb, 3+: custom -> 3: calls

        const stat: Stats = new Stats();
        stat.showPanel( i );
        stat.dom.style.cssText = `position:absolute;top:${ y * 48 }px;left:${ x * 80 }px;`;
        document.body.appendChild( stat.dom );

        if ( i == 3 ) {

            //stat.calls = stat.addPanel( new Stats.Panel( "calls", "#ffc233", "#4d3808" ) );
        }

        return stat;
    }

    private renderLoop(): void {

        for ( let i: int = 0; i < 3; i++ ) {

            this.stats[i].begin();
        }
        
        const deltaTime: float = this.babylon.getDeltaTime();
        this.deltaCorrectionValue = EngineUtils.getDeltaCorrection( deltaTime, this.fpsTarget );
        
        //this.stats[5].begin();

        this.stats[3].begin();
        this.update?.();
        this.stats[3].end();

        this.stats[4].begin();
        this.renderScene?.render();
        this.stats[4].end();

        //this.stats[5].calls.update( this.babylon._drawCalls.current, this.babylon._drawCalls.max );
        //this.stats[5].end();
        
        for ( let i: int = 0; i < 3; i++ ) {

            this.stats[i].end();
        }
    }
    
}