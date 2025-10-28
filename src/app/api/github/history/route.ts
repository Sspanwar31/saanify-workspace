import { NextRequest, NextResponse } from 'next/server'

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
    committer: {
      name: string
      date: string
    }
  }
  html_url: string
}

export async function POST(request: NextRequest) {
  try {
    const { owner, repo, token, branch = 'main' } = await request.json()
    
    if (!owner || !repo || !token) {
      return NextResponse.json(
        { error: 'Owner, repo, and token are required' },
        { status: 400 }
      )
    }
    
    // Get commit history
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&per_page=50`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    )
    
    if (!commitsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch commit history' },
        { status: 400 }
      )
    }
    
    const commits: GitHubCommit[] = await commitsResponse.json()
    
    // Filter backup commits (those with "Backup:" prefix)
    const backupCommits = commits
      .filter(commit => commit.commit.message.includes('Backup:'))
      .map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url,
        timestamp: commit.commit.message.replace('Backup: ', '')
      }))
    
    return NextResponse.json({
      success: true,
      commits: backupCommits,
      total: backupCommits.length
    })
    
  } catch (error) {
    console.error('GitHub history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commit history' },
      { status: 500 }
    )
  }
}