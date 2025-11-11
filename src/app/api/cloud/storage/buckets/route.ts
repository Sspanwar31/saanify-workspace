import { NextRequest, NextResponse } from 'next/server'

interface Bucket {
  id: string
  name: string
  public: boolean
  createdAt: string
  size: number
  fileCount: number
}

interface StorageFile {
  id: string
  name: string
  type: string
  size: number
  url?: string
  bucket: string
  createdAt: string
  metadata?: any
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bucketId = searchParams.get('bucket')

    if (bucketId) {
      // Return files for specific bucket
      const files: StorageFile[] = [
        {
          id: '1',
          name: 'society-logo.png',
          type: 'image/png',
          size: 245760,
          url: '/avatars/admin.jpg',
          bucket: bucketId,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'annual-report-2024.pdf',
          type: 'application/pdf',
          size: 2048576,
          bucket: bucketId,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'maintenance-records.xlsx',
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: 524288,
          bucket: bucketId,
          createdAt: new Date().toISOString()
        }
      ]

      return NextResponse.json({
        success: true,
        files
      })
    } else {
      // Return all buckets
      const buckets: Bucket[] = [
        {
          id: 'public',
          name: 'public',
          public: true,
          createdAt: new Date().toISOString(),
          size: 45.2 * 1024 * 1024 * 1024, // 45.2 GB
          fileCount: 1247
        },
        {
          id: 'private',
          name: 'private',
          public: false,
          createdAt: new Date().toISOString(),
          size: 12.8 * 1024 * 1024 * 1024, // 12.8 GB
          fileCount: 523
        }
      ]

      return NextResponse.json({
        success: true,
        buckets
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch storage data'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, public: isPublic } = body

    // Create new bucket
    const newBucket: Bucket = {
      id: `bucket_${Date.now()}`,
      name,
      public: isPublic,
      createdAt: new Date().toISOString(),
      size: 0,
      fileCount: 0
    }

    return NextResponse.json({
      success: true,
      bucket: newBucket,
      message: `Bucket "${name}" created successfully`
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create bucket'
    }, { status: 500 })
  }
}