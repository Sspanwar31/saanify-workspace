import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/db'

export interface SupabaseConfig {
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
  SUPABASE_ANON_KEY: string
  SUPABASE_DB_URL?: string
}

export class SupabaseService {
  private static instance: SupabaseService
  private supabase: ReturnType<typeof createClient> | null = null
  private config: SupabaseConfig | null = null
  private lastConfigFetch: number = 0
  private readonly CONFIG_CACHE_TTL = 60000 // 1 minute

  private constructor() {}

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService()
    }
    return SupabaseService.instance
  }

  private async fetchConfigFromDatabase(): Promise<SupabaseConfig | null> {
    try {
      const now = Date.now()
      
      // Return cached config if still valid
      if (this.config && (now - this.lastConfigFetch) < this.CONFIG_CACHE_TTL) {
        return this.config
      }

      // Fetch required secrets from database
      const secrets = await db.secret.findMany({
        where: {
          key: {
            in: ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'SUPABASE_ANON_KEY', 'SUPABASE_DB_URL']
          }
        }
      })

      const config: Partial<SupabaseConfig> = {}
      
      secrets.forEach(secret => {
        switch (secret.key) {
          case 'SUPABASE_URL':
            config.SUPABASE_URL = secret.value
            break
          case 'SUPABASE_SERVICE_KEY':
            config.SUPABASE_SERVICE_KEY = secret.value
            break
          case 'SUPABASE_ANON_KEY':
            config.SUPABASE_ANON_KEY = secret.value
            break
          case 'SUPABASE_DB_URL':
            config.SUPABASE_DB_URL = secret.value
            break
        }
      })

      // Validate required fields
      if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_KEY) {
        console.warn('Missing required Supabase configuration in database')
        return null
      }

      this.config = config as SupabaseConfig
      this.lastConfigFetch = now
      
      return this.config
    } catch (error) {
      console.error('Failed to fetch Supabase config from database:', error)
      return null
    }
  }

  async getClient(): Promise<ReturnType<typeof createClient> | null> {
    try {
      const config = await this.fetchConfigFromDatabase()
      
      if (!config) {
        throw new Error('Supabase configuration not found in database secrets')
      }

      // Create new client if config changed or client doesn't exist
      if (!this.supabase) {
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })
      }

      return this.supabase
    } catch (error) {
      console.error('Failed to create Supabase client:', error)
      return null
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient()
      if (!client) {
        return { success: false, error: 'Failed to create Supabase client' }
      }

      // Test connection with a simple query
      const { error } = await client.from('_temp_connection_test').select('*').limit(1)
      
      // We expect an error for non-existent table, but connection should work
      if (error && !error.message.includes('does not exist')) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown connection error' 
      }
    }
  }

  async getAnonClient(): Promise<ReturnType<typeof createClient> | null> {
    try {
      const config = await this.fetchConfigFromDatabase()
      
      if (!config || !config.SUPABASE_ANON_KEY) {
        throw new Error('Supabase anon key not found in database secrets')
      }

      return createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    } catch (error) {
      console.error('Failed to create Supabase anon client:', error)
      return null
    }
  }

  clearCache(): void {
    this.config = null
    this.lastConfigFetch = 0
    this.supabase = null
  }

  async getConfig(): Promise<SupabaseConfig | null> {
    return this.fetchConfigFromDatabase()
  }
}

export default SupabaseService