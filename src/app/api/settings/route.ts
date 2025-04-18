import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define settings file path - stored in a local JSON file
const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize settings file if it doesn't exist
if (!fs.existsSync(SETTINGS_FILE)) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify({}), 'utf8');
}

// Helper to read settings
function readSettings() {
  try {
    const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading settings file:', error);
    return {};
  }
}

// Helper to write settings
function writeSettings(data: Record<string, any>) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing settings file:', error);
    return false;
  }
}

// GET handler for retrieving settings
export async function GET() {
  try {
    // Use a default user ID for now
    const userId = 'default-user';
    const allSettings = readSettings();
    const userSettings = allSettings[userId] || {
      openaiApiKey: '',
      tradingViewApiKey: '',
      telegramBotToken: '',
    };

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error('Error in GET settings:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve settings' },
      { status: 500 }
    );
  }
}

// POST handler for updating settings
export async function POST(request: Request) {
  try {
    // Use a default user ID for now
    const userId = 'default-user';
    const updatedSettings = await request.json();
    
    // Validate input
    const validKeys = ['openaiApiKey', 'tradingViewApiKey', 'telegramBotToken', 'openaiModel', 'openaiOrganization', 'openaiProjectId'];
    for (const key of Object.keys(updatedSettings)) {
      if (!validKeys.includes(key)) {
        return NextResponse.json(
          { error: `Invalid setting: ${key}` },
          { status: 400 }
        );
      }
    }

    // Update settings
    const allSettings = readSettings();
    allSettings[userId] = {
      ...allSettings[userId],
      ...updatedSettings,
    };

    const success = writeSettings(allSettings);
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save settings' },
        { status: 500 }
      );
    }

    return NextResponse.json(allSettings[userId]);
  } catch (error) {
    console.error('Error in POST settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
} 