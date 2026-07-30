require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Kết nối MongoDB bằng biến môi trường MONGO_URI
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("🍃 Đã kết nối thành công tới MongoDB Cloud!"))
    .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));
} else {
  console.log("⚠️ Cảnh báo: Chưa cấu hình biến MONGO_URI!");
}

// Schema MongoDB
const rsvpSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  status: { type: String, default: "Tham dự" },
  wishes: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Rsvp = mongoose.model("Rsvp", rsvpSchema);

// API 1: Lấy thông tin sự kiện
app.get("/api/guest", (req, res) => {
  const guestName = req.query.to || "Con vợ thân mến";
  res.json({
    success: true,
    data: {
      guestName: guestName,
      hostName: "Trầnn Sang",
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

// API 2: Lưu lời chúc vào MongoDB
app.post("/api/rsvp", async (req, res) => {
  try {
    const { guestName, attendanceStatus, wishes } = req.body;
    if (!wishes)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu lời chúc!" });

    const newRsvp = new Rsvp({
      guestName: guestName || "Ẩn danh",
      status: attendanceStatus || "Tham dự",
      wishes: wishes,
    });

    await newRsvp.save();
    res.json({ success: true, message: "Lưu lời chúc thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lưu MongoDB!" });
  }
});

// API 3: Xem danh sách lời chúc
app.get("/api/rsvp-list", async (req, res) => {
  try {
    const rsvpList = await Rsvp.find().sort({ createdAt: -1 });
    res.json({ success: true, total: rsvpList.length, data: rsvpList });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy dữ liệu!" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại PORT: ${PORT}`);
});
