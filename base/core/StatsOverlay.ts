/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

namespace WebEngine {
    export class StatsOverlay {
        private readonly div: HTMLDivElement;
        private readonly p: HTMLParagraphElement;

        public constructor() {
            this.div = this.createDiv();
            this.p = this.createP(this.div);
        }

        /** @internal */
        public show(): void {
            document.body.appendChild(this.div);
        }

        /** @internal */
        public hide(): void {
            document.body.removeChild(this.div);
        }

        /** @internal */
        public update(text: string): void {
            this.p.innerHTML = text;
        }

        private createDiv(): HTMLDivElement {
            const div: HTMLDivElement = document.createElement("div");
            div.style.position = "absolute";
            div.style.top = "0px";
            div.style.right = "0px";
            div.style.minWidth = "30vh";
            div.style.backgroundColor = "#000000";
            div.style.opacity = "0.75";
            return div;
        }

        private createP(div: HTMLDivElement): HTMLParagraphElement {
            const p: HTMLDivElement = document.createElement("p");
            p.style.margin = "2vh";
            p.style.color = "#FFFFFF";
            p.style.fontFamily = "system-ui";
            p.style.fontSize = "1.2vh";
            div.append(p);
            return p;
        }
    }
}
