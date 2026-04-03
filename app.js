document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // ป้องกันไม่ให้หน้าเว็บกระพริบตอนกดปุ่ม

  // 1. ดูดข้อมูลจากช่องพิมพ์
  const empIdValue = document.getElementById("emp_id").value;
  const passwordValue = document.getElementById("password").value;
  const errorText = document.getElementById("errorMessage");

  // ซ่อนข้อความแจ้งเตือนไว้ก่อนเสมอ
  errorText.classList.add("hidden");

  try {
    // 2. ยิงข้อมูลไปที่หลังบ้าน (เหมือนที่เคยกด Send ใน Postman เป๊ะ!)
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emp_id: empIdValue,
        password: passwordValue,
      }),
    });

    const data = await response.json();

    // 3. เช็คคำตอบจากหลังบ้าน
    if (data.success) {
      // ถ้ารหัสถูก ให้ระบบจำข้อมูลพนักงานไว้ในเบราว์เซอร์ (เรียกว่า LocalStorage)
      localStorage.setItem("userData", JSON.stringify(data.userData));

      // แล้วสั่งให้วาร์ป (Redirect) ไปหน้า Dashboard ทันที
      window.location.href = "dashboard.html";
      // อนาคตเราจะเขียนโค้ดเปลี่ยนหน้าไป Dashboard ตรงนี้ครับ
    } else {
      // ถ้าไม่สำเร็จ (รหัสผิด) ให้โชว์ตัวแดง
      errorText.textContent = data.message;
      errorText.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error:", error);
    errorText.textContent =
      "เชื่อมต่อฐานข้อมูลไม่ได้ กรุณาเช็คเซิร์ฟเวอร์หลังบ้าน!";
    errorText.classList.remove("hidden");
  }
});
