/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

const renderer: Renderer = new Renderer();

window.addEventListener("compile", (_event: Event): void => {

    renderer.initialize();
});