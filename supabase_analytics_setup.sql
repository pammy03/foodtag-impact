-- =================================================================================
-- IMPACT Food Tag - Analytics Data Aggregation Setup
-- ให้ Copy โค้ดทั้งหมดนี้ไปรันใน Supabase Dashboard -> SQL Editor แล้วกด Run
-- =================================================================================

-- 1. เปิดการใช้งาน pg_cron (ถ้ายังไม่ได้เปิด)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. สร้างตารางสำหรับเก็บข้อมูลสรุปรายวัน (Daily Summary)
CREATE TABLE IF NOT EXISTS analytics_daily_summary (
  summary_date DATE PRIMARY KEY,
  total_actions INT DEFAULT 0,
  action_counts JSONB DEFAULT '{}'::jsonb,
  paper_sizes JSONB DEFAULT '{}'::jsonb,
  top_users JSONB DEFAULT '[]'::jsonb,
  menu_print_ranking JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- เพิ่ม Policy ให้สามารถอ่านได้ (ถ้ามี RLS เปิดอยู่)
ALTER TABLE analytics_daily_summary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON analytics_daily_summary;
CREATE POLICY "Allow read access to authenticated users" ON analytics_daily_summary FOR SELECT USING (true);


-- 3. สร้าง Function สำหรับรวมยอดและประมวลผลข้อมูล
CREATE OR REPLACE FUNCTION generate_daily_analytics_summary(target_date DATE DEFAULT (CURRENT_DATE AT TIME ZONE 'Asia/Bangkok' - INTERVAL '1 day')::DATE)
RETURNS void AS $$
DECLARE
  v_total_actions INT;
  v_action_counts JSONB;
  v_paper_sizes JSONB;
  v_top_users JSONB;
  v_menu_print_ranking JSONB;
BEGIN
  -- หาจำนวน Action ทั้งหมดในวันนั้น
  SELECT COUNT(*) INTO v_total_actions
  FROM activity_logs
  WHERE DATE(created_at AT TIME ZONE 'Asia/Bangkok') = target_date
    AND action NOT IN ('EDIT', 'DELETE');

  -- สรุปยอดแยกตามประเภท Action (CREATE, PRINT, อื่นๆ ที่ไม่ใช่ EDIT, DELETE)
  SELECT jsonb_object_agg(action, count) INTO v_action_counts
  FROM (
    SELECT action, COUNT(*) as count
    FROM activity_logs
    WHERE DATE(created_at AT TIME ZONE 'Asia/Bangkok') = target_date
      AND action NOT IN ('EDIT', 'DELETE')
    GROUP BY action
  ) t;
  IF v_action_counts IS NULL THEN v_action_counts := '{}'::jsonb; END IF;

  -- สรุปยอดกระดาษ (A3, A4, Other)
  SELECT jsonb_object_agg(paper_size, count) INTO v_paper_sizes
  FROM (
    SELECT 
      CASE 
        WHEN details ILIKE '%(Size: A3)%' OR details ILIKE '%ขนาด A3%' THEN 'A3'
        WHEN details ILIKE '%(Size: A4)%' OR details ILIKE '%ขนาด A4%' THEN 'A4'
        ELSE 'Other'
      END as paper_size,
      COUNT(*) as count
    FROM activity_logs
    WHERE DATE(created_at AT TIME ZONE 'Asia/Bangkok') = target_date
      AND action IN ('PRINT', 'CREATE')
    GROUP BY 1
  ) t;
  IF v_paper_sizes IS NULL THEN v_paper_sizes := '{}'::jsonb; END IF;

  -- จัดอันดับพนักงานที่แอคทีฟ (จำกัด 50 อันดับแรก)
  SELECT jsonb_agg(jsonb_build_object('name', user_name, 'count', count)) INTO v_top_users
  FROM (
    SELECT COALESCE(user_name, 'Anonymous') as user_name, COUNT(*) as count
    FROM activity_logs
    WHERE DATE(created_at AT TIME ZONE 'Asia/Bangkok') = target_date
      AND action NOT IN ('EDIT', 'DELETE')
    GROUP BY COALESCE(user_name, 'Anonymous')
    ORDER BY count DESC
    LIMIT 50
  ) t;
  IF v_top_users IS NULL THEN v_top_users := '[]'::jsonb; END IF;

  -- จัดอันดับเมนูที่ถูกปริ้น (จำกัด 50 อันดับแรก)
  -- ใช้ Regex เพื่อตัดคำว่า (Size: A4) ออกจากชื่อเมนู
  SELECT jsonb_agg(jsonb_build_object('name', menu_name, 'paper_size', paper_size, 'count', count)) INTO v_menu_print_ranking
  FROM (
    SELECT 
      TRIM(REGEXP_REPLACE(
        REGEXP_REPLACE(details, '\(Size: [A-Za-z0-9]+\)', '', 'ig'),
        'ขนาด [A-Za-z0-9]+', '', 'ig'
      )) as menu_name,
      CASE 
        WHEN details ILIKE '%(Size: A3)%' OR details ILIKE '%ขนาด A3%' THEN 'A3'
        WHEN details ILIKE '%(Size: A4)%' OR details ILIKE '%ขนาด A4%' THEN 'A4'
        ELSE 'A4'
      END as paper_size,
      COUNT(*) as count
    FROM activity_logs
    WHERE DATE(created_at AT TIME ZONE 'Asia/Bangkok') = target_date
      AND action = 'PRINT'
    GROUP BY 1, 2
    ORDER BY count DESC
    LIMIT 50
  ) t;
  IF v_menu_print_ranking IS NULL THEN v_menu_print_ranking := '[]'::jsonb; END IF;

  -- นำข้อมูลทั้งหมดบันทึกลงตาราง (ถ้ามีวันเดิมอยู่แล้วให้อัปเดต)
  INSERT INTO analytics_daily_summary (summary_date, total_actions, action_counts, paper_sizes, top_users, menu_print_ranking)
  VALUES (target_date, v_total_actions, v_action_counts, v_paper_sizes, v_top_users, v_menu_print_ranking)
  ON CONFLICT (summary_date) 
  DO UPDATE SET 
    total_actions = EXCLUDED.total_actions,
    action_counts = EXCLUDED.action_counts,
    paper_sizes = EXCLUDED.paper_sizes,
    top_users = EXCLUDED.top_users,
    menu_print_ranking = EXCLUDED.menu_print_ranking,
    created_at = now();

END;
$$ LANGUAGE plpgsql;


-- 4. รันคำสั่งนี้ 1 ครั้งเพื่อดึงยอด "ย้อนหลังทั้งหมดที่ยังมีอยู่ในระบบ" เข้าตาราง Summary ให้ครบก่อน
DO $$ 
DECLARE 
    d DATE;
BEGIN 
    FOR d IN 
        SELECT DISTINCT DATE(created_at AT TIME ZONE 'Asia/Bangkok') 
        FROM activity_logs 
        ORDER BY 1 ASC
    LOOP 
        PERFORM generate_daily_analytics_summary(d); 
    END LOOP; 
END $$;


-- 5. ตั้งค่า Cron Jobs ให้ทำงานอัตโนมัติ

-- ยกเลิก Job เดิมถ้ามี ป้องกันการรันซ้ำซ้อน (ใส่ TRY/CATCH เพื่อไม่ให้เกิด Error ถ้าเพิ่งรันครั้งแรก)
DO $$
BEGIN
  PERFORM cron.unschedule('daily-analytics-summary');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('delete-old-logs');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ตั้งเวลา: สร้าง Summary ของเมื่อวาน ทุกๆ เที่ยงคืน 5 นาที (00:05)
SELECT cron.schedule('daily-analytics-summary', '5 0 * * *', $$
  SELECT generate_daily_analytics_summary((CURRENT_DATE AT TIME ZONE 'Asia/Bangkok' - INTERVAL '1 day')::DATE);
$$);

-- ตั้งเวลา: ลบข้อมูลใน activity_logs ที่เก่ากว่า 30 วัน ทุกๆ เที่ยงคืน 10 นาที (00:10)
SELECT cron.schedule('delete-old-logs', '10 0 * * *', $$
  DELETE FROM activity_logs WHERE created_at < (NOW() - INTERVAL '30 days');
$$);

-- =================================================================================
-- เสร็จสิ้น! ระบบจะจัดการข้อมูลให้เป๊ะปังอัตโนมัติตั้งแต่วันนี้เป็นต้นไป
-- =================================================================================
