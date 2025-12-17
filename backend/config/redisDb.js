import { createClient } from "redis";

// Create a Redis client instance
const client = createClient();

// Handle connection errors
client.on("error", (err) => console.error("Redis Client Error", err));

// Connect to the Redis server
export async function connectRedis() {
  try {
    await client.connect();
    console.log("Redis Connection Successful.");
  } catch (err) {
    console.error("Failed to connect to Redis", err);
  }
}

export default client;
