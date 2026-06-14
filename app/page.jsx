import { createClient } from '@/lib/supabase/server';
import LandingPage from '@/components/LandingPage';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createClient();

  const [{ data: programs }, { data: { user } }] = await Promise.all([
    supabase
      .from('programs')
      .select('id, slug, title, description, kind, is_free, program_prices(id, name, amount_clp, is_active, valid_until)')
      .eq('published', true)
      .order('created_at'),
    supabase.auth.getUser(),
  ]);

  return <LandingPage programs={programs || []} user={user} />;
}
