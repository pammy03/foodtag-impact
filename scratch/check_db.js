const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://nexvompdeubppbkvnwor.supabase.co';
const supabaseKey = 'sb_publishable_cMshOGrGdX829-KmtIxOWw_HeC04-aI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('global_settings').select('*').limit(1);
  console.log('global_settings:', { data, error });
}
check();
