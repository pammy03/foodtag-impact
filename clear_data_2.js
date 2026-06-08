const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://nexvompdeubppbkvnwor.supabase.co";
const supabaseKey = "sb_publishable_cMshOGrGdX829-KmtIxOWw_HeC04-aI";
const dbClient = createClient(supabaseUrl, supabaseKey);

async function clearData() {
  const { data: d2, error: e2 } = await dbClient.from('analytics_daily_summary').delete().neq('summary_date', '1970-01-01');
  if (e2) console.error("Error clearing analytics_daily_summary:", e2.message);
  else console.log("Cleared analytics_daily_summary");
}

clearData();
