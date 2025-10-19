import readline from "node:readline";

export async function input(prompt: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        return await new Promise(resolve => {
            rl.question(prompt, (answer: string) => {
                resolve(answer);
            });
        });
    } finally {
        rl.close();
    }
}