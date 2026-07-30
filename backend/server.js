const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Cho phép FE gọi API từ Domain khác
app.use(express.json());

const RSVP_FILE = path.join(__dirname, "data", "rsvp.json");

// Đảm bảo thư mục data và file rsvp.json tồn tại
if (!fs.existsSync(path.join(__dirname, "data"))) {
  fs.mkdirSync(path.join(__dirname, "data"));
}
if (!fs.existsSync(RSVP_FILE)) {
  fs.writeFileSync(RSVP_FILE, JSON.stringify([], null, 2));
}

// ---------------- API ENDPOINTS ----------------

// 1. API Lấy thông tin khách mời & Sự kiện
app.get("/api/guest", (req, res) => {
  const guestName = req.query.to || "Con vợ thân mến";

  res.json({
    success: true,
    data: {
      guestName: guestName,
      hostName: "Trần Sang",
      title: "Đz PRO VIP SIÊU CẤP VÔ ĐỊCH VŨ TRỤ",
      degree: "Kỹỹỹỹỹỹ sư Công Nghệ Thông Tin 🥴",
      university: "Trường Đại học Công nghệ Đông Á",
      time: "13h30 – 16h30, Thứ 6, ngày 07/08/2026",
      location:
        "Hội trường – Tầng 6 – Tòa nhà Việt Nam, Trường Đại học Công nghệ Đông Á",
      mapUrl: "https://maps.app.goo.gl/YwjxLEZrLsKVNkf97",
    },
  });
});

// 2. API Lưu phản hồi RSVP & Lời chúc của bạn bè
app.post("/api/rsvp", (req, res) => {
  const { guestName, attendanceStatus, wishes } = req.body;

  if (!wishes) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu lời chúc rồi con vợ ơi!" });
  }

  const newResponse = {
    id: Date.now(),
    guestName: guestName || "Ẩn danh",
    status: attendanceStatus || "Tham dự",
    wishes: wishes,
    createdAt: new Date().toLocaleString("vi-VN"),
  };

  try {
    const fileData = fs.readFileSync(RSVP_FILE, "utf-8");
    const rsvpList = JSON.parse(fileData);

    rsvpList.push(newResponse);
    fs.writeFileSync(RSVP_FILE, JSON.stringify(rsvpList, null, 2));

    console.log("🎉 Lời chúc mới từ:", guestName);
    res.json({ success: true, message: "Lưu lời chúc thành công!" });
  } catch (error) {
    console.error("Lỗi lưu file:", error);
    res.status(500).json({ success: false, message: "Lỗi Server!" });
  }
});

// 3. API Xem danh sách tất cả lời chúc đã gửi (Dành riêng cho bạn check)
app.get("/api/rsvp-list", (req, res) => {
  try {
    const fileData = fs.readFileSync(RSVP_FILE, "utf-8");
    res.json({ success: true, data: JSON.parse(fileData) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không đọc được dữ liệu" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend Server running at: http://localhost:${PORT}`);
});
