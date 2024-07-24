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

export async function createOrLoadEscapeRoom(agentName, password) {
    if (!agentName || !password) {
        return { success: false, message: 'Agent name and password are required.' };
    }

    const client = await getRedisClient();
    const secretKey = generateSecretKey(password);
    const agentExists = await client.exists(`escaperooms/${agentName}/`);

    if (!agentExists) {
        // If the agent does not exist, create a new agent and escape room
        await client.set(`escaperooms/${agentName}/:secretKey`, secretKey);
        return { success: true, roomdata: {}, message: 'New agent and escape room created.' };
    } else {
        // If the agent exists, verify the secret key and load the escape room
        const storedSecretKey = await client.get(`escaperooms/${agentName}/:secretKey`);
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
