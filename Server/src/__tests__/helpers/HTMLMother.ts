import * as fs from 'fs';
import * as path from 'path';

export class HTMLMother {
    private readonly pathtohtml: string = path.join(__dirname, "..", "html");

    load(filename: string): string {
        const Path: string = path.join(this.pathtohtml, filename);
        return fs.readFileSync(Path, 'utf-8');
    }

    buildAnekdotRuHtml(): string {
        return this.load('anekdot-ru.html');
    }

    buildAnekdotovStreetHtml(): string {
        return this.load('anekdotov-street.html');
    }

    buildInvalidStructureHtml(): string {
        return this.load('invalid-structure.html');
    }
}