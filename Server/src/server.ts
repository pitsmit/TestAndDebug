import express from 'express';
import cors from 'cors';
import { Facade } from "@Facade/Facade";
import { ShowLentaCommand } from "@UICommands/LentaCommands";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Создаем фасад (как в вашем основном файле)
const facade = new Facade();

// API endpoint для анекдотов
app.get('/api/anekdots', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        console.log(page);

        const command = new ShowLentaCommand(page, limit);
        await facade.execute(command);

        console.log((command as any)._anekdots)

        res.json({
            anekdots: (command as any)._anekdots, // адаптируйте под вашу структуру
            total: (command as any)._totalCount,
            page: page,
            totalPages: Math.ceil((command as any)._totalCount / limit)
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});