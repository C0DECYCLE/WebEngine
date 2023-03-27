/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class StatsOverlay {
    private readonly div: HTMLDivElement;
    private readonly p: HTMLParagraphElement;

    public constructor() {
        this.div = this.createDiv();
        this.p = this.createP(this.div);
    }

    public eUpdate(text: string): void {
        this.p.innerHTML = text;
    }

    private createDiv(): HTMLDivElement {
        const div: HTMLDivElement = document.createElement("div");
        div.style.position = "absolute";
        div.style.top = "0px";
        div.style.right = "0px";
        div.style.zIndex = "1";
        div.style.minWidth = "40vh";
        div.style.backgroundColor = "#000000";
        div.style.opacity = "0.75";

        document.body.append(div);
        return div;
    }

    private createP(div: HTMLDivElement): HTMLParagraphElement {
        const p: HTMLDivElement = document.createElement("p");
        p.style.margin = "2vh";
        p.style.color = "#FFFFFF";
        p.style.fontFamily = "system-ui";
        p.style.fontSize = "1.8vh";

        div.append(p);
        return p;
    }
}
