import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    'https://etdcqxdjmdyexbvgjaza.supabase.co',
    'sb_publishable_69qNJfkxRc2lPnSUMYXCeQ_lsypv2Ba',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Safe to ignore on server components
          }
        },
      },
    }
  )
}