"use strict";

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

(function () {

    const initTimestamp = performance.now();
    const compileEvent = new Event("compile");

    function fetchConfig() {

        fetch("/tsconfig.json").then(response => response.json()).then(onConfigLoaded).catch(onConfigFailed);
    }

    function onConfigFailed(error) {

        console.log(`[Typescript]: Config: Failed`);
    }

    async function onConfigLoaded(tsconfig) {

        console.log(`[Typescript]: Config: Successful`);

        const scripts = document.getElementsByTagName("script");
        const pending = [];
        const transpilations = [];

        let j = 0;
        let linesSum = 0;

        for (let i = 0; i < scripts.length; i++) {

            if (scripts[i].type === "text/typescript") {

                const { src } = scripts[i];
                const innerHTML = src ? null : scripts[i].innerHTML;
                const index = j++;

                pending.push(new Promise(resolve => {

                    const w = new Worker(`${document.location.origin}/libraries/typescript/typescript-worker.js`);

                    w.postMessage([src, innerHTML, tsconfig, `${document.location.origin}/libraries/typescript/typescript.4.8.4.js`]);
                    w.onmessage = ({ data: [transpiled, linesCount] }) => {

                        transpilations[index] = [transpiled, scripts[i], linesCount];
                        linesSum += linesCount;

                        w.terminate();
                        resolve();
                    };
                }));
            }
        }

        await Promise.all(pending);

        let t = 0;
        let e = 0;

        function onTranspileError(error) {

            error.preventDefault();

            console.error(`[Typescript]: ${error.message}\n    (at ${transpilations[t][1].src})`);
            e++;
        }

        window.addEventListener("error", onTranspileError);

        for (let i = 0; i < transpilations.length; i++) {

            const newScript = document.createElement("script");
            newScript.id = `${transpilations[i][1].src}`.replace(`${document.location.origin}/`, "");
            newScript.innerHTML = transpilations[i][0];

            transpilations[i][1].replaceWith(newScript);
            t++;
        }

        window.removeEventListener("error", onTranspileError);

        const time = performance.now() - initTimestamp;

        console.log(`[Typescript]: Files: ${transpilations.length}, Lines: ${linesSum} (${Math.round(linesSum / transpilations.length)}/file), Time: ${Math.round(time / 1000 * 100) / 100}s (${Math.round(time / transpilations.length)}ms/file), Errors: ${e} (${Math.round(e / transpilations.length)}/file)`);
        window.dispatchEvent(compileEvent);
    }

    window.addEventListener("DOMContentLoaded", fetchConfig);

})();