/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

window.addEventListener("compile", (_event: Event): void => {
    const n: int = 100_000;

    const camPos: Float64Array = new Float64Array(3);
    camPos[0] = 1_000_000;
    camPos[1] = 10;
    camPos[2] = 100_000;

    //log(n, camPos);

    const positions: Float64Array = new Float64Array(3 * n);
    const matricies: Float32Array = new Float32Array(16 * n);

    for (let i: int = 0; i < n; i++) {
        positions[i * 3 + 0] = camPos[0] + (Math.random() * 2 - 1) * 100_000;
        positions[i * 3 + 2] = camPos[2] + (Math.random() * 2 - 1) * 100_000;
        positions[i * 3 + 1] = camPos[1] + (Math.random() * 2 - 1) * 100_000;
    }

    for (let j: int = 0; j < n; j++) {
        matricies[j * 16 + 0] = 1;
        matricies[j * 16 + 1] = 0;
        matricies[j * 16 + 2] = 0;
        matricies[j * 16 + 3] = 0;

        matricies[j * 16 + 4] = 0;
        matricies[j * 16 + 5] = 1;
        matricies[j * 16 + 6] = 0;
        matricies[j * 16 + 7] = 0;

        matricies[j * 16 + 8] = 0;
        matricies[j * 16 + 9] = 0;
        matricies[j * 16 + 10] = 1;
        matricies[j * 16 + 11] = 0;

        matricies[j * 16 + 12] = 0;
        matricies[j * 16 + 13] = 0;
        matricies[j * 16 + 14] = 0;
        matricies[j * 16 + 15] = 1;
    }

    //log(positions, matricies);

    let s: int = 1_000;
    let mss: float = 0;

    for (let t: int = 0; t < s; t++) {
        let ms: float = performance.now();

        floatingOrigin(n, positions, camPos, matricies); //0.3 ms

        mss += performance.now() - ms;
    }

    log(mss / s);

    //log(positions, matricies);
});

function floatingOrigin(
    n: int,
    positions: Float64Array,
    cameraPosition: Float64Array,
    matricies: Float32Array
): void {
    for (let i: int = 0; i < n; i++) {
        matricies[i * 16 + 12] = positions[i * 3 + 0] - cameraPosition[0];
        matricies[i * 16 + 13] = positions[i * 3 + 1] - cameraPosition[1];
        matricies[i * 16 + 14] = positions[i * 3 + 2] - cameraPosition[2];
    }
}
