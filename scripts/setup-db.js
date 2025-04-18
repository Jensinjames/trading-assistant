#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script sets up the database schema and creates the necessary tables
 * for user authentication and application functionality.
 * 
 * Usage:
 *   node scripts/setup-db.js
 */

const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

async function main() {
  console.log('🚀 Starting database setup...');
  
  try {
    // Check if database is accessible
    await prisma.$connect();
    console.log('✅ Connected to database successfully');
    
    // Check if we need to create a superuser
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('⚠️ No users found in the database. Let\'s create a superuser.');
      
      const email = await prompt('Enter superuser email: ');
      const name = await prompt('Enter superuser name: ');
      const password = await prompt('Enter superuser password: ');
      
      // Hash the password
      const hashedPassword = await hash(password, 12);
      
      // Create the superuser
      const superuser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'admin',
        },
      });
      
      console.log(`✅ Superuser created successfully with ID: ${superuser.id}`);
    } else {
      console.log(`✅ Database already has ${userCount} users`);
    }
    
    // Create default settings for existing users without settings
    const usersWithoutSettings = await prisma.user.findMany({
      where: {
        settings: null,
      },
    });
    
    if (usersWithoutSettings.length > 0) {
      console.log(`⚠️ Found ${usersWithoutSettings.length} users without settings. Creating default settings...`);
      
      for (const user of usersWithoutSettings) {
        await prisma.userSettings.create({
          data: {
            userId: user.id,
          },
        });
      }
      
      console.log('✅ Default settings created for all users');
    }
    
    console.log('✅ Database setup completed successfully');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main(); 