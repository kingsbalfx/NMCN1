import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, school_name, year_of_study, is_premium, role')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Could not fetch student profiles' });
    }
    return res.status(200).json({ students: data });
  }

  if (req.method === 'POST') {
    const { profile_id, activate } = req.body;
    if (!profile_id || typeof activate !== 'boolean') {
      return res.status(400).json({ error: 'profile_id and activate boolean are required' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ is_premium: activate })
      .eq('id', profile_id)
      .select('id, full_name, email, school_name, year_of_study, is_premium, role')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Could not update profile status' });
    }
    return res.status(200).json({ student: data });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
