/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

const logger_maximum: int = 1_000;

let logger_count: int = 0;

function log(...data: any[]): void {
    return logger("log", ...data);
}

function warn(...data: any[]): void {
    return logger("warn", ...data);
}

function logger(type: "log" | "warn", ...data: any[]): void {
    logger_count++;
    if (logger_count === logger_maximum) {
        return console.warn("Logger: Maximum count exeeded.");
    } else if (logger_count < logger_maximum) {
        return console[type](...data);
    }
}