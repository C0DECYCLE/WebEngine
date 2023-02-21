"use strict";

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

(function () {
    const initTimestamp = performance.now();
    const compileEvent = new Event("compile");
    const workerURL = `${document.location.origin}/libraries/typescript/typescript-worker.js`;
    const compilerURL = `${document.location.origin}/libraries/typescript/typescript.4.8.4.js`;

    function fetchConfig() {
        fetch("/tsconfig.json")
            .then((response) => response.json())
            .then(onConfigLoaded)
            .catch(onConfigFailed);
    }

    function onConfigFailed(error) {
        console.log(`[Typescript]: Config: Failed`);
        console.warn(error);
    }

    function initWorkers(n, tsconfig) {
        const workers = { requests: [], free: [] /*, working: []*/ };

        for (let i = 0; i < n; i++) {
            const worker = new Worker(workerURL);
            /*worker.index = i;*/
            worker.postMessage({
                key: "init",
                tsconfig: tsconfig,
                compilerURL: compilerURL,
            });
            worker.onmessage = ({ data }) => {
                workers.free.push(worker);
                workers.processRequestQueue();
            };
            /*workers.working[i] = undefined;*/
        }

        workers.request = (instructions, callback) => {
            if (workers.free.length > 0) {
                workers.processRequest(instructions, callback);
            } else {
                workers.requests.push({
                    instructions: instructions,
                    callback: callback,
                });
            }
        };

        workers.processRequestQueue = () => {
            if (workers.requests.length > 0 && workers.free.length > 0) {
                const request = workers.requests.pop();
                workers.processRequest(request.instructions, request.callback);
            }
        };

        workers.processRequest = (instructions, callback) => {
            if (workers.free.length > 0) {
                const worker = workers.free.pop();
                /*workers.working[worker.index] = worker;*/

                worker.postMessage(instructions);
                worker.onmessage = ({ data }) => {
                    /*workers.working[worker.index] = undefined;*/
                    workers.free.push(worker);
                    callback(data.transpiled, data.linesCount);
                    workers.processRequestQueue();
                };
            }
        };

        return workers;
    }

    function compilePromise(workers, src, innerHTML, callback) {
        const instructions = { key: "compile", src: src, innerHTML: innerHTML };
        return new Promise((resolve) => {
            workers.request(instructions, (transpiled, linesCount) =>
                callback(resolve, transpiled, linesCount)
            );
        });
    }

    async function onConfigLoaded(tsconfig) {
        console.log(`[Typescript]: Config: Successful`);

        window.tsconfig = tsconfig;
        const workers = initWorkers(4, tsconfig);
        window.typescriptCompileService = workers.request;

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
                const callback = (resolve, transpiled, linesCount) => {
                    transpilations[index] = [
                        transpiled,
                        scripts[i],
                        linesCount,
                    ];
                    linesSum += linesCount;
                    resolve();
                };
                pending.push(compilePromise(workers, src, innerHTML, callback));
            }
        }

        await Promise.all(pending);

        let t = 0;
        let e = 0;

        function onTranspileError(error) {
            error.preventDefault();

            console.error(
                `[Typescript]: ${error.message}\n    (at ${transpilations[t][1].src})`
            );
            e++;
        }

        window.addEventListener("error", onTranspileError);

        for (let i = 0; i < transpilations.length; i++) {
            const newScript = document.createElement("script");
            newScript.id = `${transpilations[i][1].src}`.replace(
                `${document.location.origin}/`,
                ""
            );
            newScript.innerHTML = transpilations[i][0];

            transpilations[i][1].replaceWith(newScript);
            t++;
        }

        window.removeEventListener("error", onTranspileError);

        const time = performance.now() - initTimestamp;

        console.log(
            `[Typescript]: Files: ${
                transpilations.length
            }, Lines: ${linesSum} (${Math.round(
                linesSum / transpilations.length
            )}/file), Time: ${
                Math.round((time / 1000) * 100) / 100
            }s (${Math.round(
                time / transpilations.length
            )}ms/file), Errors: ${e} (${Math.round(
                e / transpilations.length
            )}/file)`
        );
        window.dispatchEvent(compileEvent);
    }

    window.addEventListener("DOMContentLoaded", fetchConfig);
})();
