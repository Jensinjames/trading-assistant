#!/usr/bin/env node

/**
 * Database Migration Script
 * 
 * This script runs Prisma migrations and seeds the database with initial data.
 * 
 * Usage:
 *   node scripts/migrate-db.js
 */

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database migration...');
  
  try {
    // Run Prisma migrations
    console.log('📦 Running Prisma migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations completed successfully');
    
    // Check if we need to seed the database
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('🌱 Seeding database with initial data...');
      
      // Create a default admin user
      const adminPassword = await hash('Admin123!', 12);
      const admin = await prisma.user.create({
        data: {
          email: 'admin@tradingassistant.com',
          name: 'Admin User',
          password: adminPassword,
          role: 'admin',
          settings: {
            create: {
              openaiApiKey: '',
              tradingViewApiKey: '',
              telegramBotToken: '',
            },
          },
        },
      });
      
      console.log(`✅ Created admin user with ID: ${admin.id}`);
      
      // Create a default regular user
      const userPassword = await hash('User123!', 12);
      const user = await prisma.user.create({
        data: {
          email: 'user@tradingassistant.com',
          name: 'Regular User',
          password: userPassword,
          role: 'user',
          settings: {
            create: {
              openaiApiKey: '',
              tradingViewApiKey: '',
              telegramBotToken: '',
            },
          },
        },
      });
      
      console.log(`✅ Created regular user with ID: ${user.id}`);
      
      console.log('✅ Database seeded successfully');
    } else {
      console.log(`✅ Database already has ${userCount} users, skipping seed`);
    }
    
    console.log('✅ Database migration completed successfully');
  } catch (error) {
    console.error('❌ Error during database migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 