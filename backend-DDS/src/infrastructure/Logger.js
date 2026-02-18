import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const accessLogPath = path.join(logDir, 'access.log');
const errorLogPath = path.join(logDir, 'error.log');

export function logAccess(message) {
    const logLine = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFile(accessLogPath, logLine, (err) => {
        if (err) console.error('Failed to write access log:', err);
    });
}

export function logError(message) {
    const logLine = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFile(errorLogPath, logLine, (err) => {
        if (err) console.error('Failed to write error log:', err);
    });
}
