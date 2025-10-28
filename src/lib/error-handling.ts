// Retry configuration and utilities
export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
  retryableErrors: string[]
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: string
  attempts: number
  totalDelay: number
}

export class RetryHandler {
  private static readonly DEFAULT_CONFIG: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryableErrors: [
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'NETWORK_ERROR',
      'RATE_LIMIT_EXCEEDED',
      'INTERNAL_SERVER_ERROR'
    ]
  }

  /**
   * Execute a function with retry logic
   */
  static async executeWithRetry<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<RetryResult<T>> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config }
    let lastError: Error | null = null
    let totalDelay = 0

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        const data = await fn()
        return {
          success: true,
          data,
          attempts: attempt,
          totalDelay
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        // Check if error is retryable
        if (!this.isRetryableError(lastError, finalConfig)) {
          break
        }

        // Don't wait after the last attempt
        if (attempt < finalConfig.maxAttempts) {
          const delay = this.calculateDelay(attempt, finalConfig)
          totalDelay += delay
          await this.sleep(delay)
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      attempts: finalConfig.maxAttempts,
      totalDelay
    }
  }

  /**
   * Check if an error is retryable
   */
  private static isRetryableError(error: Error, config: RetryConfig): boolean {
    const errorMessage = error.message.toUpperCase()
    
    // Check for specific retryable error messages
    for (const retryableError of config.retryableErrors) {
      if (errorMessage.includes(retryableError)) {
        return true
      }
    }

    // Check for HTTP status codes that should be retried
    const httpStatusMatch = errorMessage.match(/HTTP (\d{3})/)
    if (httpStatusMatch) {
      const statusCode = parseInt(httpStatusMatch[1])
      return this.isRetryableHttpStatus(statusCode)
    }

    // Check for GitHub API specific errors
    if (errorMessage.includes('RATE_LIMIT') || errorMessage.includes('SECONDARY_RATE_LIMIT')) {
      return true
    }

    return false
  }

  /**
   * Check if HTTP status code is retryable
   */
  private static isRetryableHttpStatus(statusCode: number): boolean {
    // Retry on server errors and some client errors
    return (
      statusCode === 429 || // Too Many Requests (Rate Limit)
      statusCode === 500 || // Internal Server Error
      statusCode === 502 || // Bad Gateway
      statusCode === 503 || // Service Unavailable
      statusCode === 504    // Gateway Timeout
    )
  }

  /**
   * Calculate delay with exponential backoff
   */
  private static calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffFactor, attempt - 1)
    return Math.min(delay, config.maxDelay)
  }

  /**
   * Sleep for specified milliseconds
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Error types and classes
export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any,
    public isRetryable: boolean = false
  ) {
    super(message)
    this.name = 'GitHubAPIError'
  }
}

export class NetworkError extends Error {
  constructor(message: string, public isRetryable: boolean = true) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Error handling utilities
export class ErrorHandler {
  /**
   * Handle fetch errors and convert to appropriate error types
   */
  static handleFetchError(error: any, response?: Response): GitHubAPIError {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new GitHubAPIError(
        'Network connection failed',
        0,
        null,
        true
      )
    }

    if (error.name === 'AbortError') {
      return new GitHubAPIError(
        'Request was aborted or timed out',
        0,
        null,
        true
      )
    }

    return new GitHubAPIError(
      error.message || 'Unknown fetch error',
      response?.status,
      response,
      true
    )
  }

  /**
   * Handle GitHub API response errors
   */
  static handleGitHubError(response: Response, data?: any): GitHubAPIError {
    const statusCode = response.status
    const message = data?.message || response.statusText || 'Unknown GitHub API error'

    // Determine if error is retryable based on status code
    const isRetryable = RetryHandler['isRetryableHttpStatus'](statusCode)

    return new GitHubAPIError(message, statusCode, data, isRetryable)
  }

  /**
   * Validate required parameters
   */
  static validateRequired(params: Record<string, any>, required: string[]): void {
    const missing = required.filter(key => !params[key])
    if (missing.length > 0) {
      throw new ValidationError(`Missing required parameters: ${missing.join(', ')}`)
    }
  }

  /**
   * Validate GitHub token format
   */
  static validateGitHubToken(token: string): void {
    if (!token || typeof token !== 'string') {
      throw new ValidationError('GitHub token is required and must be a string')
    }

    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
      throw new ValidationError('Invalid GitHub token format')
    }

    if (token.length < 20) {
      throw new ValidationError('GitHub token is too short')
    }
  }

  /**
   * Validate repository name
   */
  static validateRepository(owner: string, repo: string): void {
    if (!owner || !repo) {
      throw new ValidationError('Repository owner and name are required')
    }

    // GitHub repository name rules
    const repoRegex = /^[a-zA-Z0-9._-]+$/
    if (!repoRegex.test(repo)) {
      throw new ValidationError('Invalid repository name format')
    }

    if (repo.length > 100) {
      throw new ValidationError('Repository name is too long (max 100 characters)')
    }
  }

  /**
   * Create a safe error response for API endpoints
   */
  static createErrorResponse(error: any, context: string = 'Operation'): {
    success: false
    error: string
    context: string
    retryable: boolean
    details?: any
  } {
    if (error instanceof GitHubAPIError) {
      return {
        success: false,
        error: error.message,
        context,
        retryable: error.isRetryable,
        details: error.response ? {
          statusCode: error.statusCode,
          message: error.response.message
        } : undefined
      }
    }

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
        context,
        retryable: false
      }
    }

    if (error instanceof NetworkError) {
      return {
        success: false,
        error: error.message,
        context,
        retryable: error.isRetryable
      }
    }

    return {
      success: false,
      error: error?.message || 'Unknown error occurred',
      context,
      retryable: false
    }
  }

  /**
   * Log error with context
   */
  static logError(error: any, context: string, additionalInfo?: any): void {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context,
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      retryable: error?.isRetryable || false,
      additionalInfo
    }

    console.error('Error Details:', JSON.stringify(errorInfo, null, 2))
  }
}

// Circuit breaker pattern for handling repeated failures
export class CircuitBreaker {
  private failureCount = 0
  private lastFailureTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failureCount = 0
    this.state = 'CLOSED'
  }

  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN'
    }
  }

  getState(): string {
    return this.state
  }

  reset(): void {
    this.failureCount = 0
    this.state = 'CLOSED'
  }
}

// Rate limiting handler
export class RateLimiter {
  private requests: number[] = []

  constructor(private readonly maxRequests: number, private readonly windowMs: number) {}

  async checkLimit(): Promise<void> {
    const now = Date.now()
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs)

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests)
      const waitTime = this.windowMs - (now - oldestRequest)
      
      throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)} seconds`)
    }

    this.requests.push(now)
  }

  getRemainingRequests(): number {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.windowMs)
    return Math.max(0, this.maxRequests - this.requests.length)
  }
}

// Export default configurations
export const DEFAULT_RETRY_CONFIG: Partial<RetryConfig> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2
}

export const GITHUB_RETRY_CONFIG: Partial<RetryConfig> = {
  maxAttempts: 5,
  baseDelay: 2000,
  maxDelay: 30000,
  backoffFactor: 2,
  retryableErrors: [
    'RATE_LIMIT_EXCEEDED',
    'SECONDARY_RATE_LIMIT',
    'NETWORK_ERROR',
    'ECONNRESET',
    'ENOTFOUND',
    'ECONNREFUSED',
    'ETIMEDOUT'
  ]
}