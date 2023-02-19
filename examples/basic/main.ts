/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

window.addEventListener("compile", (_event: Event): void => {

    const renderer: Renderer = new Renderer();

    renderer.initialize();

});

//https://austin-eng.com/webgpu-samples/samples/rotatingCube
//https://carmencincotti.com/2022-04-18/drawing-a-webgpu-triangle/