// ดึงค่าการเชื่อมต่อ Supabase จากหน้าหลัก (ถ้ามี) หรือประกาศใหม่เพื่อความชัวร์
const LOG_SUPABASE_URL = "https://nexvompdeubppbkvnwor.supabase.co";
const LOG_SUPABASE_KEY = "sb_publishable_cMshOGrGdX829-KmtIxOWw_HeC04-aI";
const logDbClient = supabase.createClient(LOG_SUPABASE_URL, LOG_SUPABASE_KEY);

/**
 * บันทึกประวัติการทำงานลงระบบ Supabase
 * @param {string} actionType - หมวดหมู่แอคชัน เช่น 'CREATE', 'EDIT', 'PRINT', 'DELETE'
 * @param {string} actionDetails - รายละเอียดเพิ่มเติมของสิ่งที่ทำ
 */
async function logSystemActivity(actionType, actionDetails) {
  try {
    const actionUpper = actionType.toUpperCase();
    // ยกเลิกการเก็บ Log สำหรับการแก้ไขและการลบตามที่ต้องการ
    if (actionUpper === 'EDIT' || actionUpper === 'DELETE') {
      return true;
    }

    // 1. ดึงข้อมูลผู้ใช้จริงจาก localStorage
    const rawUserData = localStorage.getItem("userData");
    const userData = rawUserData ? JSON.parse(rawUserData) : null;

    // ถ้าไม่มีข้อมูลในระบบ ให้ใช้ค่า Default เป็น Staff / Anonymous
    const userName =
      userData && userData.name ? userData.name : "Anonymous User";
    const userRole = userData && userData.role ? userData.role : "Staff";

    // 2. เตรียมก้อนข้อมูลส่งเข้า Supabase
    const logPayload = {
      user_name: userName,
      role: userRole,
      action: actionType.toUpperCase(),
      details: actionDetails,
      created_at: new Date().toISOString(),
    };

    console.log("📤 Sending Log to Supabase...", logPayload);

    // 3. ยิงข้อมูลเข้าตาราง activity_logs
    const { error } = await logDbClient
      .from("activity_logs")
      .insert([logPayload]);

    if (error) {
      console.error("❌ Supabase Log Insert Error:", error.message);
      throw error;
    }

    console.log("✅ Log successfully saved to database.");
    return true;
  } catch (err) {
    console.error("⚠️ Failed to record system log:", err);
    return false;
  }
}
