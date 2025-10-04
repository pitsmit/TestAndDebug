// routes/anekdots.js
import {ShowLentaCommand} from "@UICommands/LentaCommands";
import {Facade} from "../Facade/Facade";

app.get('/api/anekdots', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        let facade = new Facade()

        let command = new ShowLentaCommand(page, limit);
        await facade.execute(command);

        res.json({
            anekdots: command._anekdots, // ваши анекдоты из бизнес-логики
            total: command._totalCount, // общее количество
            page: page,
            totalPages: Math.ceil(command._totalCount / limit)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});