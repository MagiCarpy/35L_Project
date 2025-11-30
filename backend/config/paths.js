import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT_PATH = path.resolve(__dirname, "..", "..");
export const PUBLIC_PATH = path.resolve(ROOT_PATH, "frontend", "public");
export const ROOT_ENV_PATH = path.resolve(ROOT_PATH, ".env");
