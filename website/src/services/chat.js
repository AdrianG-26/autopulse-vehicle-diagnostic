import { supabase, isSupabaseConfigured } from './supabase';

export async function ensureConfigured() {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
}

export async function sendMessage({ sender, recipient, content }) {
  await ensureConfigured();
  const { error } = await supabase.from('messages').insert({ sender, recipient, content });
  if (error) throw new Error(error.message || 'Failed to send message');
}

export async function loadConversation({ user, other, limit = 100 }) {
  await ensureConfigured();
  const { data, error } = await supabase
    .from('messages')
    .select('id,sender,recipient,content,created_at')
    .or(`and(sender.eq.${user},recipient.eq.${other}),and(sender.eq.${other},recipient.eq.${user}))`)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message || 'Failed to load messages');
  return data || [];
}

export function subscribeConversation({ user, other, onMessage }) {
  if (!isSupabaseConfigured()) return () => {};
  const channel = supabase.channel('messages-conv')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      const row = payload?.new;
      if (!row) return;
      const isInThread = (row.sender === user && row.recipient === other) || (row.sender === other && row.recipient === user);
      if (isInThread) onMessage(row);
    })
    .subscribe();
  return () => {
    try { supabase.removeChannel(channel); } catch {}
  };
}



