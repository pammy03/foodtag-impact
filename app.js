import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

document.addEventListener("DOMContentLoaded", () => {
  // 1. ตั้งค่าการเชื่อมต่อ Supabase
  const supabaseUrl = "https://nexvompdeubppbkvnwor.supabase.co"; // URL ของโปรเจกต์คุณ
  const supabaseKey = "sb_publishable_cMshOGrGdX829-KmtIxOWw_HeC04-aI"; // กุญแจ Public ของโปรเจกต์คุณ
  const supabase = createClient(supabaseUrl, supabaseKey);

  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");

  // 2. ดักจับตอนกดปุ่ม Login
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // ป้องกันหน้าเว็บรีเฟรช

      const empId = document.getElementById("emp_id").value.trim();
      const password = document.getElementById("password").value.trim();
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (!empId || !password) {
        showError("กรุณากรอก Employee ID และรหัสผ่านให้ครบถ้วน");
        return;
      }

      // เปลี่ยนปุ่มเป็นสถานะกำลังโหลด
      submitBtn.disabled = true;
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML =
        '<span class="material-symbols-outlined animate-spin text-lg">progress_activity</span><span>กำลังตรวจสอบ...</span>';
      hideError();

      try {
        // 3. ตรวจสอบข้อมูลในตาราง users (แก้ไขให้ตรงกับโครงสร้างตาราง users ของคุณ)
        // *สมมติว่าใน Supabase คุณมีตารางชื่อ 'users' และมีคอลัมน์ 'emp_id' กับ 'password'
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("emp_id", empId)
          .eq("password", password)
          .single();

        if (error || !data) {
          showError("Employee ID หรือรหัสผ่านไม่ถูกต้อง");
        } else {
          // ล็อกอินสำเร็จ: สร้าง Session สั้นๆ แล้วเปลี่ยนหน้าไปที่ Dashboard
          sessionStorage.setItem("userLoggedIn", "true");
          sessionStorage.setItem("empId", data.emp_id);
          sessionStorage.setItem("userName", data.name || "Admin"); // ถ้ามีคอลัมน์ชื่อก็เก็บไว้ด้วย

          window.location.href = "dashboard.html";
        }
      } catch (err) {
        console.error("Login Error:", err);
        showError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่");
      } finally {
        // คืนสถานะปุ่มกลับมาเหมือนเดิม
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  function showError(message) {
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.classList.remove("hidden");
    }
  }

  function hideError() {
    if (errorMessage) {
      errorMessage.textContent = "";
      errorMessage.classList.add("hidden");
    }
  }
});
