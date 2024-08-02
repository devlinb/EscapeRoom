import { createClient } from 'redis';
import { generateSecretKey } from './generateSecretKey.js';
import { wordsToNumbers } from 'words-to-numbers';


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
    return isValid;
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
        const puzzle = (await client.json.get(`escaperooms/${agentName}/room/`, {
            path: puzzlePath
        }))[0];
        if (!puzzle || puzzle.length === 0) {
            return { success: false, message: 'Puzzle does not exist.' };
        }
        delete puzzle?.solution;
        return { success: true, puzzle, message: 'Puzzle retrieved successfully.' };
    } catch (error) {
        console.error(`Error retrieving puzzle: ${error.message}`);
        return { success: false, message: `Error retrieving puzzle: ${error.message}` };
    }
}

export async function checkSolutionForPuzzle(agentName, puzzleNumber, guess) {
    if (!agentName || puzzleNumber == null || isNaN(Number(puzzleNumber)) || !guess) { // Ensure puzzleNumber is a number and guess is not empty
        return { success: false, message: 'Agent name, puzzle number, and guess are required.' };
    }
    console.log(`inside checkSolutionForPuzzle for agent: ${agentName}, puzzle number: ${puzzleNumber}, and guess: ${guess}`);
    const client = await getRedisClient();
    try {
        // Fetch a specific puzzle using JSONPath query syntax
        const puzzlePath = `$[${puzzleNumber-1}]`; // Adjusted line
        const puzzle = (await client.json.get(`escaperooms/${agentName}/room/`, {
            path: puzzlePath
        }))[0];
        if (!puzzle || puzzle.length === 0) {
            return { success: false, message: 'Puzzle does not exist.' };
        }
        let solution = puzzle.solution;
        // Check if solution is an integer
        if (typeof solution === 'number') {
            let guessStripped = guess.replace(/[^\w\s]|_$/g, ''); // Strip punctuation from the end
            let guessNumber = parseInt(guessStripped);
            if (isNaN(guessNumber)) {
                guessNumber = wordsToNumbers(guessStripped);
            }
            if (guessNumber === solution) {
                return { success: true, message: 'Correct solution.' };
            }
        } else {
            // First check for identical matches including spaces and case sensitivity
            if (guess === solution) {
                return { success: true, message: 'Correct solution.' };
            }
            // Then remove all spaces, convert everything to lowercase, then do a string compare
            else if (guess.replace(/\s+/g, '').toLowerCase() === solution.replace(/\s+/g, '').toLowerCase()) {
                return { success: true, message: 'Correct solution.' };
            }
            // Finally, consider a guess correct if it matches the solution with punctuation stripped off the end
            else if (guess.replace(/[^\w\s]|_$/g, '').toLowerCase() === solution.replace(/[^\w\s]|_$/g, '').toLowerCase()) {
                return { success: true, message: 'Correct solution.' };
            }
        }
        return { success: false, message: 'Incorrect solution.' };
    } catch (error) {
        console.error(`Error checking solution: ${error.message}`);
        return { success: false, message: `Error checking solution: ${error.message}` };
    }
}