'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ShoppingItem } from '@/types'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function toggleShoppingItem(listId: string, items: ShoppingItem[]) {
  const supabase = await createClient()
  await supabase.from('shopping_lists').update({ items }).eq('id', listId)
}
