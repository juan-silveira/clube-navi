/**
 * Database Manager Utility
 * Handles physical database creation and migrations for multi-tenant clubs
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

class DatabaseManager {
  /**
   * Create a new PostgreSQL database for a club
   * @param {string} databaseName - The name of the database to create
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async createDatabase(databaseName) {
    try {
      console.log(`📦 [DatabaseManager] Creating database: ${databaseName}`);

      // Create database using PostgreSQL
      const createDbCommand = `sudo -u postgres psql -c "CREATE DATABASE ${databaseName} OWNER clube_digital_user;"`;

      const { stdout, stderr } = await execPromise(createDbCommand);

      if (stderr && !stderr.includes('already exists')) {
        console.error('❌ [DatabaseManager] Error creating database:', stderr);
        throw new Error(`Failed to create database: ${stderr}`);
      }

      console.log(`✅ [DatabaseManager] Database created: ${databaseName}`);

      return {
        success: true,
        message: `Database ${databaseName} created successfully`
      };

    } catch (error) {
      // Check if database already exists
      if (error.message.includes('already exists')) {
        console.log(`⚠️  [DatabaseManager] Database ${databaseName} already exists, skipping creation`);
        return {
          success: true,
          message: `Database ${databaseName} already exists`
        };
      }

      console.error('❌ [DatabaseManager] Error:', error);
      throw error;
    }
  }

  /**
   * Run Prisma migrations on a tenant database
   * @param {string} databaseName - The name of the database
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async runMigrations(databaseName) {
    try {
      console.log(`🔄 [DatabaseManager] Running migrations on: ${databaseName}`);

      // Construct the tenant database URL
      const tenantDatabaseUrl = `postgresql://clube_digital_user:clube_digital_password@localhost:5432/${databaseName}?schema=public`;

      // Run Prisma migrations using db push (for development)
      const migrationCommand = `TENANT_DATABASE_URL="${tenantDatabaseUrl}" npx prisma db push --schema=./prisma/tenant/schema.prisma --accept-data-loss`;

      const { stdout, stderr } = await execPromise(migrationCommand, {
        cwd: process.cwd(),
        env: {
          ...process.env,
          TENANT_DATABASE_URL: tenantDatabaseUrl
        }
      });

      console.log(`✅ [DatabaseManager] Migrations completed for: ${databaseName}`);

      if (stdout) {
        console.log('Migration output:', stdout);
      }

      return {
        success: true,
        message: `Migrations completed successfully for ${databaseName}`
      };

    } catch (error) {
      console.error('❌ [DatabaseManager] Migration error:', error);
      throw error;
    }
  }

  /**
   * Create database and run migrations in one step
   * @param {string} databaseName - The name of the database
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async setupTenantDatabase(databaseName) {
    try {
      console.log(`🚀 [DatabaseManager] Setting up tenant database: ${databaseName}`);

      // Step 1: Create database
      await this.createDatabase(databaseName);

      // Step 2: Run migrations
      await this.runMigrations(databaseName);

      console.log(`✅ [DatabaseManager] Tenant database setup complete: ${databaseName}`);

      return {
        success: true,
        message: `Tenant database ${databaseName} created and migrated successfully`
      };

    } catch (error) {
      console.error('❌ [DatabaseManager] Setup error:', error);
      throw error;
    }
  }

  /**
   * Drop a database (use with caution!)
   * @param {string} databaseName - The name of the database to drop
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async dropDatabase(databaseName) {
    try {
      console.log(`🗑️  [DatabaseManager] Dropping database: ${databaseName}`);

      // Safety check: don't drop master database
      if (databaseName.includes('master')) {
        throw new Error('Cannot drop master database!');
      }

      const dropDbCommand = `sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${databaseName};"`;

      await execPromise(dropDbCommand);

      console.log(`✅ [DatabaseManager] Database dropped: ${databaseName}`);

      return {
        success: true,
        message: `Database ${databaseName} dropped successfully`
      };

    } catch (error) {
      console.error('❌ [DatabaseManager] Drop error:', error);
      throw error;
    }
  }

  /**
   * Check if database exists
   * @param {string} databaseName - The name of the database
   * @returns {Promise<boolean>}
   */
  async databaseExists(databaseName) {
    try {
      const checkCommand = `sudo -u postgres psql -lqt | cut -d \\| -f 1 | grep -qw ${databaseName}`;

      await execPromise(checkCommand);

      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new DatabaseManager();
