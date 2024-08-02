import * as dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { createOrLoadEscapeRoom, saveEscapeRoom, getAgentPuzzle, checkSolutionForPuzzle } from './escapeRoomRoutes.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Calculate __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const basePath = process.env.BASE_PATH || ''
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

const escapeRoomRouter = express.Router();

escapeRoomRouter.post('/createOrLoadEscapeRoom', async (req, res) => {
    try {
        const { agentName, password } = req.body;
        const result = await createOrLoadEscapeRoom(agentName, password);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

escapeRoomRouter.post('/saveEscapeRoom', async (req, res) => {
    try {
        const { agentName, password, roomData } = req.body;
        const result = await saveEscapeRoom(agentName, password, roomData);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Dynamic GET endpoint for agent puzzles
escapeRoomRouter.get('/:agentName/:puzzleId', async (req, res) => {
    try {
        const { agentName, puzzleId } = req.params;
        const result = await getAgentPuzzle(agentName, puzzleId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

escapeRoomRouter.post('/checkSolution', async (req, res) => {
    try {
        const { agentName, puzzleId, guess } = req.body;
        const result = await checkSolutionForPuzzle(agentName, puzzleId, guess);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


app.use(basePath, escapeRoomRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
