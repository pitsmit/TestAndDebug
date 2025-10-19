import Table from "cli-table3";

export class ShowTable {
    static show<T extends Record<string, any>>(
        data: T[],
        headers: string[],
        fields: (keyof T)[],
        widths: number[]
    ): void {
        const table = new Table({
            head: headers,
            colWidths: widths,
        });

        data.forEach(item => {
            const row = fields.map(field => {
                const value: any = item[field];

                if (value instanceof Date) {
                    return value.toLocaleString();
                }

                return value !== undefined && value !== null ? value.toString() : '';
            });

            table.push(row);
        });

        console.log(table.toString());
    }
}