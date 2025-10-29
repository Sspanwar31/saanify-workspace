#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const tar = require('tar');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const { execSync } = require('child_process');

const EncryptionManager = require('../utils/encryption');

class RestoreSystem {
  constructor() {
    this.configPath = path.join(__dirname, '../config/backup-config.json');
    this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    this.encryption = new EncryptionManager();
    this.backupDir = path.join(process.cwd(), this.config.storage.local.path);
    this.tempDir = path.join(__dirname, '../temp');
  }

  async restoreFromBackup(backupId) {
    const spinner = ora('Starting restore process...').start();
    
    try {
      // Find backup
      const backupPath = await this.findBackup(backupId);
      if (!backupPath) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      spinner.text = 'Extracting backup...';
      const extractedPath = await this.extractBackup(backupPath);
      
      spinner.text = 'Reading backup metadata...';
      const metadata = this.readMetadata(extractedPath);
      
      spinner.text = 'Validating backup...';
      await this.validateBackup(metadata);
      
      spinner.text = 'Restoring project files...';
      await this.restoreFiles(extractedPath);
      
      spinner.text = 'Decrypting sensitive files...';
      await this.decryptFiles(extractedPath);
      
      spinner.text = 'Installing dependencies...';
      await this.installDependencies();
      
      spinner.text = 'Setting up database...';
      await this.setupDatabase();
      
      // Get GitHub token from user
      const githubToken = await this.getGitHubToken();
      if (githubToken) {
        spinner.text = 'Configuring GitHub integration...';
        await this.configureGitHub(githubToken);
      }
      
      spinner.text = 'Cleaning up...';
      fs.rmSync(extractedPath, { recursive: true, force: true });
      
      spinner.succeed('Restore completed successfully!');
      
      if (this.config.restore.autoStart) {
        console.log(chalk.blue('Starting project...'));
        this.startProject();
      }
      
    } catch (error) {
      spinner.fail(`Restore failed: ${error.message}`);
      throw error;
    }
  }

  async findBackup(backupId) {
    // Try as archive first
    const archivePath = path.join(this.backupDir, `${backupId}.tar.gz`);
    if (fs.existsSync(archivePath)) {
      return archivePath;
    }

    // Try as directory
    const dirPath = path.join(this.backupDir, backupId);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      return dirPath;
    }

    return null;
  }

  async extractBackup(backupPath) {
    const extractId = `restore-${Date.now()}`;
    const extractPath = path.join(this.tempDir, extractId);
    
    if (fs.existsSync(extractPath)) {
      fs.rmSync(extractPath, { recursive: true, force: true });
    }
    
    if (backupPath.endsWith('.tar.gz')) {
      await tar.extract({
        file: backupPath,
        cwd: this.tempDir,
        strip: 0
      });
    } else {
      // Copy directory
      this.copyDirectory(backupPath, extractPath);
    }
    
    // Find the extracted directory
    const extractedDirs = fs.readdirSync(this.tempDir).filter(name => name.includes('saanify-workspace'));
    if (extractedDirs.length === 0) {
      throw new Error('Backup extraction failed - no directory found');
    }
    
    return path.join(this.tempDir, extractedDirs[0]);
  }

  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  readMetadata(extractedPath) {
    const metadataPath = path.join(extractedPath, 'backup-metadata.json');
    if (!fs.existsSync(metadataPath)) {
      throw new Error('Invalid backup: metadata not found');
    }
    
    return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  }

  async validateBackup(metadata) {
    if (metadata.projectName !== this.config.projectName) {
      throw new Error(`Backup project mismatch: expected ${this.config.projectName}, got ${metadata.projectName}`);
    }
    
    console.log(chalk.blue(`Restoring backup from: ${new Date(metadata.timestamp).toLocaleString()}`));
    console.log(chalk.blue(`Backup version: ${metadata.version}`));
    console.log(chalk.blue(`Files: ${metadata.stats.regular} regular, ${metadata.stats.encrypted} encrypted`));
  }

  async restoreFiles(extractedPath) {
    const files = fs.readdirSync(extractedPath, { withFileTypes: true });
    
    for (const file of files) {
      if (file.name === 'backup-metadata.json' || file.name === 'backup-system') {
        continue; // Skip backup system files
      }
      
      const srcPath = path.join(extractedPath, file.name);
      const destPath = path.join(process.cwd(), file.name);
      
      if (file.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else if (!file.name.endsWith('.encrypted')) {
        // Copy regular file
        this.ensureDirectoryExists(path.dirname(destPath));
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  async decryptFiles(extractedPath) {
    const files = this.findEncryptedFiles(extractedPath);
    
    for (const encryptedFile of files) {
      try {
        const relativePath = path.relative(extractedPath, encryptedFile);
        const originalPath = path.join(process.cwd(), relativePath.replace('.encrypted', ''));
        
        // Ensure directory exists
        this.ensureDirectoryExists(path.dirname(originalPath));
        
        // Decrypt and save
        const encryptedData = JSON.parse(fs.readFileSync(encryptedFile, 'utf8'));
        const decrypted = this.encryption.decrypt(encryptedData);
        fs.writeFileSync(originalPath, decrypted);
        
      } catch (error) {
        console.warn(`Warning: Could not decrypt ${encryptedFile}: ${error.message}`);
      }
    }
  }

  findEncryptedFiles(dir) {
    const encrypted = [];
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        encrypted.push(...this.findEncryptedFiles(filePath));
      } else if (file.name.endsWith('.encrypted')) {
        encrypted.push(filePath);
      }
    }
    
    return encrypted;
  }

  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async installDependencies() {
    if (this.config.restore.autoInstall && fs.existsSync('package.json')) {
      try {
        execSync('npm install', { stdio: 'inherit' });
        console.log(chalk.green('Dependencies installed successfully'));
      } catch (error) {
        console.warn(chalk.yellow('Warning: Could not install dependencies automatically'));
      }
    }
  }

  async setupDatabase() {
    if (this.config.restore.autoMigrate && fs.existsSync('prisma')) {
      try {
        execSync('npx prisma generate', { stdio: 'inherit' });
        execSync('npm run db:push', { stdio: 'inherit' });
        console.log(chalk.green('Database setup completed'));
      } catch (error) {
        console.warn(chalk.yellow('Warning: Could not setup database automatically'));
      }
    }
  }

  async getGitHubToken() {
    if (!this.config.restore.requireUserInput.includes('GITHUB_TOKEN')) {
      return null;
    }

    const answers = await inquirer.prompt([
      {
        type: 'password',
        name: 'githubToken',
        message: 'Enter your GitHub token:',
        validate: (input) => {
          if (!input) {
            return 'GitHub token is required';
          }
          if (input.length < 10) {
            return 'Invalid GitHub token format';
          }
          return true;
        }
      }
    ]);

    return answers.githubToken;
  }

  async configureGitHub(token) {
    try {
      // Update .env file with GitHub token
      let envContent = '';
      if (fs.existsSync('.env')) {
        envContent = fs.readFileSync('.env', 'utf8');
      }

      // Update or add GITHUB_TOKEN
      const tokenLine = `GITHUB_TOKEN=${token}`;
      const tokenRegex = /^GITHUB_TOKEN=.*$/m;
      
      if (tokenRegex.test(envContent)) {
        envContent = envContent.replace(tokenRegex, tokenLine);
      } else {
        envContent += `\n${tokenLine}`;
      }

      fs.writeFileSync('.env', envContent);
      console.log(chalk.green('GitHub integration configured'));
      
    } catch (error) {
      console.warn(chalk.yellow('Warning: Could not configure GitHub automatically'));
    }
  }

  startProject() {
    try {
      console.log(chalk.blue('Starting Saanify project...'));
      execSync('npm run dev', { stdio: 'inherit', detached: true });
    } catch (error) {
      console.warn(chalk.yellow('Warning: Could not start project automatically'));
      console.log(chalk.blue('Run "npm run dev" manually to start the project'));
    }
  }

  async listBackups() {
    if (!fs.existsSync(this.backupDir)) {
      return [];
    }

    const files = fs.readdirSync(this.backupDir);
    const backups = [];

    for (const file of files) {
      const filePath = path.join(this.backupDir, file);
      const stats = fs.statSync(filePath);
      
      if (file.endsWith('.tar.gz') || fs.statSync(filePath).isDirectory()) {
        backups.push({
          id: file.replace(/\.(tar\.gz)$/, ''),
          filename: file,
          size: stats.size,
          created: stats.birthtime.toISOString(),
          type: file.endsWith('.tar.gz') ? 'archive' : 'directory'
        });
      }
    }

    return backups.sort((a, b) => new Date(b.created) - new Date(a.created));
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const restoreSystem = new RestoreSystem();

  try {
    switch (command) {
      case 'restore':
        if (!args[1]) {
          // List available backups
          const backups = await restoreSystem.listBackups();
          if (backups.length === 0) {
            console.log(chalk.yellow('No backups found.'));
            process.exit(1);
          }

          const answers = await inquirer.prompt([
            {
              type: 'list',
              name: 'backupId',
              message: 'Select a backup to restore:',
              choices: backups.map(backup => ({
                name: `${backup.id} - ${new Date(backup.created).toLocaleString()}`,
                value: backup.id
              }))
            }
          ]);

          await restoreSystem.restoreFromBackup(answers.backupId);
        } else {
          await restoreSystem.restoreFromBackup(args[1]);
        }
        break;

      case 'list':
        const backups = await restoreSystem.listBackups();
        if (backups.length === 0) {
          console.log(chalk.yellow('No backups found.'));
        } else {
          console.log(chalk.blue('Available backups:'));
          backups.forEach(backup => {
            console.log(`  ${chalk.green(backup.id)} - ${new Date(backup.created).toLocaleString()} (${backup.type})`);
          });
        }
        break;

      default:
        console.log(chalk.red('Usage: node restore.js [restore|list] [backup-id]'));
        process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = RestoreSystem;