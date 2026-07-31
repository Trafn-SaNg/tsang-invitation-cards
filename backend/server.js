require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// 1. CẤU HÌNH CORS CHO PHÉP TẤT CẢ TÊN MIỀN VÀ PHƯƠNG THỨC POST
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// 2. KẾT NỐI MONGODB
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("🍃 Đã kết nối thành công tới MongoDB Cloud!"))
    .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));
} else {
  console.log("⚠️ Cảnh báo: Chưa cấu hình biến MONGO_URI trên Render!");
}

// 3. SCHEMA MONGODB
const rsvpSchema = new mongoose.Schema({
  guestName: { type: String, default: "Con vợ ẩn danh" },
  status: { type: String, default: "Tham dự" },
  wishes: { type: String, default: "Không có lời chúc" },
  createdAt: { type: Date, default: Date.now },
});

const Rsvp = mongoose.model("Rsvp", rsvpSchema);

// 4. API LẤY THÔNG TIN SỰ KIỆN
app.get("/api/guest", (req, res) => {
  const guestName = req.query.to || "Con vợ thân mến";
  res.json({
    success: true,
    data: {
      guestName: guestName,
      hostName: "Trafn Sang",
      title: "Đz PRO VIP SIÊU CẤP VÔ ĐỊCH VŨ TRỤ",
      degree: "Kĩ Sư Công Nghệ Thông Tin Hệ Đẳng Cấp 🥴",
      university: "Trường Đại học Công nghệ Đông Á",
      time: "13h30 – 16h30, Thứ 6, ngày 07/08/2026",
      location:
        "Hội trường – Tầng 6 – Tòa nhà Việt Nam, Trường Đại học Công nghệ Đông Á",
      mapUrl: "https://maps.app.goo.gl/YwjxLEZrLsKVNkf97",
    },
  });
});

// 5. API POST RSVP (ĐÃ TỐI ƯU CỰC KỲ CHẮC CHẮN)
app.post("/api/rsvp", async (req, res) => {
  console.log("📥 [RECEIVE RSVP]:", req.body);
  try {
    const { guestName, attendanceStatus, wishes } = req.body;

    const newRsvp = new Rsvp({
      guestName: guestName || "Con vợ ẩn danh",
      status: attendanceStatus || "Tham dự",
      wishes: wishes || "Không có lời chúc",
    });

    const savedData = await newRsvp.save();
    console.log("✅ [SAVED MONGO]:", savedData);

    return res.status(200).json({
      success: true,
      message: "Lưu lời chúc thành công!",
      data: savedData,
    });
  } catch (error) {
    console.error("❌ [MONGO ERROR]:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi lưu MongoDB: " + error.message,
    });
  }
});

// 6. API XEM DANH SÁCH LỜI CHÚC
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
