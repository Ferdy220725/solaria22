import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://etdcqxdjmdyexbvgjaza.supabase.co',
    'sb_publishable_69qNJfkxRc2lPnSUMYXCeQ_lsypv2Ba'
  )
}