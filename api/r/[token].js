import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // service role key
);

export default async function handler(req, res) {
  const { token } = req.query;
  if (!token) {
    res.status(400).send('Ongeldige link');
    return;
  }

  const { data, error } = await supabase
    .from('review_links')
    .select('review_url, click_count')
    .eq('id', token)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    res.status(404).send('Link niet gevonden');
    return;
  }

  // Log de klik
  await supabase
    .from('review_links')
    .update({
      clicked_at: new Date().toISOString(),
      click_count: (data.click_count || 0) + 1
    })
    .eq('id', token);

  // Redirect naar de echte reviewpagina
  res.writeHead(302, { Location: data.review_url });
  res.end();
}
