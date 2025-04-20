import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/server/db';

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id }
    });

    return NextResponse.json(userSettings || {
      openaiApiKey: '',
      tradingViewApiKey: '',
      telegramBotToken: '',
    });
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Update settings using Prisma upsert
    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: updatedSettings,
      create: {
        ...updatedSettings,
        userId: session.user.id
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in POST settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
} 