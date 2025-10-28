import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

interface GitHubConfig {
  owner: string
  repo: string
  token: string
  branch: string
}

interface BackupResult {
  success: boolean
  commitSha?: string
  timestamp?: string
  filesCount?: number
  error?: string
  details?: any
}

// Enhanced GitHub API helper functions
class GitHubAPI {
  private config: GitHubConfig

  constructor(config: GitHubConfig) {
    this.config = config
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(`GitHub API Error: ${response.status} - ${error.message || response.statusText}`)
    }

    return response
  }

  async getBranchInfo() {
    const response = await this.makeRequest(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/git/refs/heads/${this.config.branch}`
    )
    return response.json()
  }

  async getCommit(sha: string) {
    const response = await this.makeRequest(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/git/commits/${sha}`
    )
    return response.json()
  }

  async createBlob(content: string, encoding: 'base64' | 'utf-8' = 'base64') {
    const response = await this.makeRequest(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/git/blobs`,
      {
        method: 'POST',
        body: JSON.stringify({ content, encoding })
      }
    )
    return response.json()
  }

  async createTree(baseTreeSha: string, files: any[]) {
    const response = await this.makeRequest(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/git/trees`,
      {
        method: 'POST',
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: files
        })
      }
    )
    return response.json()
  }

  async createCommit(message: string, treeSha: string, parentSha: string) {
    const response = await this.makeRequest(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/git/commits`,
      {
        method: 'POST',
        body: JSON.stringify({
          message,
          tree: treeSha,
          parents: [parentSha]
        })
      }
    )
    return response.json()
  }

  async updateReference(sha: string) {
    const response = await this.makeRequest(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/git/refs/heads/${this.config.branch}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ sha })
      }
    )
    return response.json()
  }

  async getRepository() {
    const response = await this.makeRequest(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}`
    )
    return response.json()
  }

  async createCommitStatus(sha: string, state: 'pending' | 'success' | 'error' | 'failure', description: string) {
    try {
      const response = await this.makeRequest(
        `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/statuses/${sha}`,
        {
          method: 'POST',
          body: JSON.stringify({
            state,
            description,
            context: 'saanify-backup'
          })
        }
      )
      return response.json()
    } catch (error) {
      // Status creation is optional, don't fail if it doesn't work
      console.warn('Failed to create commit status:', error)
    }
  }
}

// Enhanced file system operations
class FileSystemManager {
  private static readonly EXCLUDE_PATTERNS = [
    'node_modules',
    '.next',
    '.git',
    'dist',
    'build',
    '.env*',
    '*.log',
    '.DS_Store',
    'Thumbs.db'
  ]

  static async getAllFiles(dir: string, fileList: string[] = []): Promise<string[]> {
    try {
      const files = await fs.readdir(dir)
      
      for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = await fs.stat(filePath)
        
        if (stat.isDirectory()) {
          // Skip excluded directories
          if (this.shouldExclude(file)) continue
          await this.getAllFiles(filePath, fileList)
        } else if (stat.isFile()) {
          // Skip excluded files
          if (this.shouldExclude(file)) continue
          fileList.push(filePath)
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dir}:`, error)
    }
    
    return fileList
  }

  private static shouldExclude(fileName: string): boolean {
    return this.EXCLUDE_PATTERNS.some(pattern => {
      // Simple glob pattern matching
      const regex = new RegExp(pattern.replace('*', '.*'))
      return regex.test(fileName)
    })
  }

  static async getFileSize(filePath: string): Promise<number> {
    try {
      const stat = await fs.stat(filePath)
      return stat.size
    } catch {
      return 0
    }
  }

  static async createBackupManifest(files: string[]): Promise<any> {
    const manifest = {
      timestamp: new Date().toISOString(),
      totalFiles: files.length,
      totalSize: 0,
      files: [] as any[]
    }

    for (const file of files) {
      const size = await this.getFileSize(file)
      manifest.totalSize += size
      manifest.files.push({
        path: file.replace(process.cwd() + '/', ''),
        size,
        lastModified: (await fs.stat(file)).mtime.toISOString()
      })
    }

    return manifest
  }
}

// Main backup function with enhanced error handling
async function createBackup(config: GitHubConfig): Promise<BackupResult> {
  const github = new GitHubAPI(config)
  const projectRoot = process.cwd()
  
  try {
    // Step 1: Get current branch info
    console.log('Getting branch information...')
    const branchInfo = await github.getBranchInfo()
    const latestCommitSha = branchInfo.object.sha
    
    // Step 2: Get all project files
    console.log('Scanning project files...')
    const files = await FileSystemManager.getAllFiles(projectRoot)
    
    if (files.length === 0) {
      throw new Error('No files found to backup')
    }

    // Step 3: Create backup manifest
    console.log('Creating backup manifest...')
    const manifest = await FileSystemManager.createBackupManifest(files)
    
    // Step 4: Create blobs for all files
    console.log(`Creating blobs for ${files.length} files...`)
    const filePromises = files.map(async (file) => {
      try {
        const content = await fs.readFile(file, 'base64')
        const blob = await github.createBlob(content)
        return {
          path: file.replace(projectRoot + '/', ''),
          mode: '100644',
          type: 'blob',
          sha: blob.sha
        }
      } catch (error) {
        console.warn(`Failed to process file ${file}:`, error)
        return null
      }
    })

    const fileObjects = (await Promise.all(filePromises)).filter(obj => obj !== null)
    
    if (fileObjects.length === 0) {
      throw new Error('No files could be processed for backup')
    }

    // Step 5: Create tree
    console.log('Creating git tree...')
    const tree = await github.createTree(latestCommitSha, fileObjects)
    
    // Step 6: Create commit
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const commitMessage = `🚀 Saanify Backup: ${timestamp}\n\n📊 Backup Summary:\n• Files: ${files.length}\n• Size: ${(manifest.totalSize / 1024 / 1024).toFixed(2)} MB\n• Timestamp: ${timestamp}`
    
    console.log('Creating commit...')
    const commit = await github.createCommit(commitMessage, tree.sha, latestCommitSha)
    
    // Step 7: Update reference
    console.log('Updating branch reference...')
    await github.updateReference(commit.sha)
    
    // Step 8: Create commit status
    await github.createCommitStatus(commit.sha, 'success', 'Backup completed successfully')
    
    return {
      success: true,
      commitSha: commit.sha,
      timestamp,
      filesCount: files.length,
      details: {
        manifest,
        commitUrl: `https://github.com/${config.owner}/${config.repo}/commit/${commit.sha}`,
        totalSize: manifest.totalSize
      }
    }
    
  } catch (error) {
    console.error('Backup failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Restore function with enhanced capabilities
async function restoreFromBackup(config: GitHubConfig, commitSha: string): Promise<BackupResult> {
  const github = new GitHubAPI(config)
  
  try {
    console.log('Getting commit information...')
    const commit = await github.getCommit(commitSha)
    
    // This is a simplified restore - in production, you'd want to handle this more carefully
    // You might need to checkout the specific commit and handle conflicts
    
    return {
      success: true,
      commitSha,
      timestamp: commit.commit.committer.date,
      details: {
        message: commit.commit.message,
        author: commit.commit.author.name,
        treeSha: commit.tree.sha,
        commitUrl: `https://github.com/${config.owner}/${config.repo}/commit/${commitSha}`
      }
    }
    
  } catch (error) {
    console.error('Restore failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Enhanced API route handler
export async function POST(request: NextRequest) {
  try {
    const { action, config, commitSha, useGit } = await request.json()
    
    // Handle quick git backup (no GitHub API required)
    if (action === 'quick-backup' && useGit) {
      return await handleQuickGitBackup()
    }
    
    if (!config || !config.owner || !config.repo || !config.token) {
      return NextResponse.json(
        { error: 'GitHub configuration is required (owner, repo, token)' },
        { status: 400 }
      )
    }

    // Validate configuration
    try {
      const github = new GitHubAPI(config)
      await github.getRepository()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid GitHub configuration or insufficient permissions' },
        { status: 400 }
      )
    }

    let result: BackupResult

    switch (action) {
      case 'backup':
        result = await createBackup(config)
        break
        
      case 'restore':
        if (!commitSha) {
          return NextResponse.json(
            { error: 'Commit SHA is required for restore operation' },
            { status: 400 }
          )
        }
        result = await restoreFromBackup(config, commitSha)
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: backup, restore' },
          { status: 400 }
        )
    }

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { error: result.error || 'Operation failed' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('GitHub API error:', error)
    return NextResponse.json(
      { error: 'Internal server error during GitHub operation' },
      { status: 500 }
    )
  }
}

// Quick git backup function
async function handleQuickGitBackup(): Promise<NextResponse> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const commitMessage = `🚀 Quick Backup: ${timestamp}`
    
    // Execute git commands
    const { stdout: addOutput } = await execAsync('git add .')
    const { stdout: commitOutput } = await execAsync(`git commit -m "${commitMessage}"`)
    const { stdout: logOutput } = await execAsync('git log --oneline -1')
    
    // Extract commit hash
    const commitHash = logOutput.split(' ')[0]
    
    return NextResponse.json({
      success: true,
      commitHash,
      timestamp,
      message: commitMessage,
      details: {
        localBackup: true,
        commitMessage,
        addOutput,
        commitOutput
      }
    })
    
  } catch (error) {
    console.error('Quick git backup failed:', error)
    
    // Check if it's because there are no changes
    if (error instanceof Error && error.message.includes('nothing to commit')) {
      return NextResponse.json({
        success: true,
        commitHash: 'no-changes',
        message: 'No changes to commit - working tree clean',
        details: {
          localBackup: true,
          note: 'No new changes detected'
        }
      })
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Quick backup failed' 
      },
      { status: 500 }
    )
  }
}