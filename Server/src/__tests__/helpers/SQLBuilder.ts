import {QueryResult} from "pg";

export class SQLBuilder {
    private readonly oid: number = 0;
    private readonly fields: any = [];
    private _type: string = 'SELECT';
    private _row_count: number = 1;
    private _rows: any[] = [];

    withRowCount(rowCount: number): this {
        this._row_count = rowCount;
        return this;
    }

    withType(type: string): this {
        this._type = type;
        return this;
    }

    withRows(data: any[]): this {
        this._rows = data;
        return this;
    }

    create(): QueryResult {
        return {
            rowCount: this._row_count,
            rows: this._rows,
            command: this._type,
            oid: this.oid,
            fields: this.fields,
        };
    }
}