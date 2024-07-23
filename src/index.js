import * as dotenv from 'dotenv';
import express from 'express';
import { createOrLoadEscapeRoom, saveEscapeRoom } from './escapeRoomRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/createOrLoadEscapeRoom', async (req, res) => {
    try {
        const { agentName, password } = req.body;
        const result = await createOrLoadEscapeRoom(agentName, password);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/saveEscapeRoom', async (req, res) => {
    try {
        const { agentName, password, roomData } = req.body;
        const result = await saveEscapeRoom(agentName, password, roomData);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
