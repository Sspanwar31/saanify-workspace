import { NextRequest, NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public details?: any) {
    super(message, 400, 'VALIDATION_ERROR')
    this.details = details
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
  }
}

export function handleApiError(error: any): NextResponse {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    const response = NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error.details && { details: error.details })
      },
      { status: error.statusCode }
    )
    
    return response
  }

  // Handle Prisma errors
  if (error.code === 'P2002') {
    return NextResponse.json(
      { 
        error: 'Resource already exists',
        code: 'DUPLICATE_ERROR'
      },
      { status: 409 }
    )
  }

  if (error.code === 'P2025') {
    return NextResponse.json(
      { 
        error: 'Resource not found',
        code: 'NOT_FOUND_ERROR'
      },
      { status: 404 }
    )
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return NextResponse.json(
      { 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      },
      { status: 401 }
    )
  }

  if (error.name === 'TokenExpiredError') {
    return NextResponse.json(
      { 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      },
      { status: 401 }
    )
  }

  // Generic error
  return NextResponse.json(
    { 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    },
    { status: 500 }
  )
}

export function asyncHandler<T extends any[]>(
  fn: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await fn(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}