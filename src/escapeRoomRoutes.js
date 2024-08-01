import { createClient } from 'redis';
import { generateSecretKey } from './generateSecretKey.js';

// Singleton Redis client
let redisClient;

async function getRedisClient() {
    if (!redisClient) {
        redisClient = createClient();
        await redisClient.connect();
    }
    return redisClient;
}

function validateAgentName(agentName) {
    const isValid = /^[a-zA-Z0-9 ]{1,20}$/.test(agentName);
    if (!isValid) {
        throw new Error('Invalid agent name.');
    }
}

export async function createOrLoadEscapeRoom(agentName, password) {
    if (!agentName || !password) {
        return { success: false, message: 'Agent name and password are required.' };
    }

    if (!validateAgentName(agentName)) {
        return { success: false, message: "Invalid agent name"}
    }

    const client = await getRedisClient();
    const secretKey = generateSecretKey(password);
    const storedSecretKey = await client.get(`escaperooms/${agentName}/:secretKey`);

    if (!storedSecretKey) {
        // If the agent does not exist, create a new agent and escape room
        await client.set(`escaperooms/${agentName}/:secretKey`, secretKey);
        return { success: true, roomdata: {}, message: 'New agent and escape room created.' };
    } else {
        // If the agent exists, verify the secret key and load the escape room
        if (secretKey === storedSecretKey) {
            const roomData = await client.json.get(`escaperooms/${agentName}/room/`);
            return { success: true, roomData, message: 'Existing escape room loaded.' };
        } else {
            return { success: false, message: 'Secret key does not match.' };
        }
    }
}

export async function saveEscapeRoom(agentName, password, roomData) {
    const client = await getRedisClient();

    const secretKey = generateSecretKey(password);
    const storedSecretKey = await client.get(`escaperooms/${agentName}/:secretKey`);

    if (secretKey === storedSecretKey) {
        await client.json.set(`escaperooms/${agentName}/room/`, '.', roomData);
        return { success: true, message: 'Escape room saved successfully.' };
    } else {
        return { success: false, message: 'Failed to save escape room: Secret key does not match.' };
    }
}

export async function getAgentPuzzle(agentName, puzzleNumber) {
    if (!agentName || puzzleNumber == null || isNaN(Number(puzzleNumber))) { // Ensure puzzleNumber is a number
        return { success: false, message: 'Agent name and puzzle number are required.' };
    }
    console.log(`inside getAgentPuzzle for agent: ${agentName} and puzzle number: ${puzzleNumber}`);
    const client = await getRedisClient();
    try {
        // Fetch a specific puzzle using JSONPath query syntax
        const puzzlePath = `$[${puzzleNumber-1}]`; // Adjusted line
        const puzzle = await client.json.get(`escaperooms/${agentName}/room/`, {
            path: puzzlePath
        });
        if (!puzzle || puzzle.length === 0) {
            return { success: false, message: 'Puzzle does not exist.' };
        }
        return { success: true, puzzle, message: 'Puzzle retrieved successfully.' };
    } catch (error) {
        console.error(`Error retrieving puzzle: ${error.message}`);
        return { success: false, message: `Error retrieving puzzle: ${error.message}` };
    }
}