import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (email !== superAdminEmail) {
    return res.status(403).json({ error: 'Unauthorized admin email' });
  }

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !superAdminEmail) {
    return res.status(500).json({ error: 'Supabase admin configuration missing' });
  }

  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const serviceClient = createClient(supabaseUrl, serviceRoleKey);

  const { data, error: signInError } = await anonClient.auth.signInWithPassword({ email, password });
  if (signInError || !data?.user) {
    return res.status(401).json({ error: signInError?.message || 'Invalid credentials' });
  }

  const userId = data.user.id;
  const upsertPayload = {
    id: userId,
    email,
    role: 'SUPER_ADMIN',
    is_premium: true,
  };

  const { error: upsertError } = await serviceClient.from('profiles').upsert(upsertPayload, { onConflict: 'id' });
  if (upsertError) {
    return res.status(500).json({ error: 'Failed to upsert super admin profile' });
  }

  res.setHeader('Set-Cookie', 'is_super_admin=true; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax');
  return res.status(200).json({ message: 'Super admin verified', user: data.user });
}
