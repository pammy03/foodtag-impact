const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://nexvompdeubppbkvnwor.supabase.co";
const supabaseKey = "sb_publishable_cMshOGrGdX829-KmtIxOWw_HeC04-aI";
const dbClient = createClient(supabaseUrl, supabaseKey);

async function clearData() {
  console.log("Starting data clear...");

  // Delete from activity_logs
  const { data: d1, error: e1 } = await dbClient.from('activity_logs').delete().neq('id', 0);
  if (e1) console.error("Error clearing activity_logs:", e1.message);
  else console.log("Cleared activity_logs");

  // Delete from analytics_daily_summary
  const { data: d2, error: e2 } = await dbClient.from('analytics_daily_summary').delete().neq('id', 0);
  if (e2) console.error("Error clearing analytics_daily_summary:", e2.message);
  else console.log("Cleared analytics_daily_summary");

  // Delete from saved_tags
  const { data: d3, error: e3 } = await dbClient.from('saved_tags').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e3) console.error("Error clearing saved_tags:", e3.message);
  else console.log("Cleared saved_tags");

  console.log("Done");
}

clearData();
