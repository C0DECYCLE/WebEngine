"use strict";

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

const load = sourceUrl => {

    const xhr = XMLHttpRequest ? new XMLHttpRequest() : ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : null;

    if (!xhr) return "";

    xhr.open("GET", sourceUrl, false);
    xhr.overrideMimeType && xhr.overrideMimeType("text/plain");
    xhr.send(null);

    return xhr.status == 200 ? xhr.responseText : "";
};

onmessage = ({ data: [sourceUrl, sourceCode, tsconfig, tspath] }) => {

    importScripts(tspath);

    const raw = sourceCode ? sourceCode : load(sourceUrl);

    postMessage([ts.transpile(raw, tsconfig.compilerOptions), raw.split("\n").length]);
};