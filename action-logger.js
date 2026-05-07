// ไฟล์: action-logger.js

const loggerSupabaseUrl = "https://nexvompdeubppbkvnwor.supabase.co";
const loggerSupabaseKey = "sb_publishable_cMshOGrGdX829-KmtIxOWw_HeC04-aI";

// ตรวจสอบว่าหน้าเว็บมีการเรียกใช้ Supabase หรือยัง
if (typeof supabase === "undefined") {
  console.error(
    "❌ ขาดไลบรารี Supabase กรุณาใส่ script ของ supabase ก่อนเรียกใช้ไฟล์นี้",
  );
}

const loggerDbClient = supabase.createClient(
  loggerSupabaseUrl,
  loggerSupabaseKey,
);

// ฟังก์ชันหลักสำหรับเรียกใช้เพื่อบันทึกประวัติ
async function logSystemActivity(actionType, detailsText) {
  // ดึงข้อมูลผู้ใช้งานจาก localStorage (เช็กว่าใครเป็นคนทำรายการ)
  const userDataStr = localStorage.getItem("userData");

  let userName = "System"; // ค่าเริ่มต้นกรณีหาชื่อไม่เจอ
  let userRole = "Staff"; // ค่าเริ่มต้นกรณีหา Role ไม่เจอ

  if (userDataStr) {
    try {
      const user = JSON.parse(userDataStr);
      // สมมติว่าใน localStorage คุณเก็บชื่อไว้ใน user.name
      userName = user.name || "Unknown User";
      userRole = user.role || "Staff";
    } catch (e) {
      console.error("อ่านข้อมูล User ไม่สำเร็จ", e);
    }
  }

  try {
    const { error } = await loggerDbClient.from("activity_logs").insert([
      {
        user_name: userName,
        role: userRole,
        action: actionType.toUpperCase(), // เช่น CREATE, EDIT, DELETE
        details: detailsText,
      },
    ]);

    if (error) throw error;
    console.log(`✅ บันทึก Log สำเร็จ: [${actionType}] ${detailsText}`);
  } catch (error) {
    console.error("❌ บันทึก Log ไม่สำเร็จ:", error.message);
  }
}
