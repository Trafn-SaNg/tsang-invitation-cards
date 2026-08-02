require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// KẾT NỐI MONGODB AN TOÀN (KHÔNG LÀM CRASH SERVER)
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("🍃 Đã kết nối thành công tới MongoDB Cloud!"))
    .catch((err) =>
      console.error("❌ Lỗi kết nối MongoDB (Server vẫn chạy):", err.message),
    );
} else {
  console.error(
    "⚠️ BÁO ĐỘNG: Chưa thêm biến MONGO_URI trong tab Environment của Render!",
  );
}

// SCHEMA
const rsvpSchema = new mongoose.Schema({
  guestName: { type: String, default: "Con vợ ẩn danh" },
  status: { type: String, default: "Tham dự" },
  wishes: { type: String, default: "Không có lời chúc" },
  createdAt: { type: Date, default: Date.now },
});

const Rsvp = mongoose.model("Rsvp", rsvpSchema);

// API GUEST
app.get("/api/guest", (req, res) => {
  const guestName = req.query.to || "Con vợ";
  res.json({
    success: true,
    data: {
      guestName: guestName,
      hostName: "Trafn SaNg",
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

// API RSVP
app.post("/api/rsvp", async (req, res) => {
  console.log("📥 Nhận dữ liệu RSVP:", req.body);
  try {
    const { guestName, attendanceStatus, wishes } = req.body;

    const newRsvp = new Rsvp({
      guestName: guestName || "Con vợ ẩn danh",
      status: attendanceStatus || "Tham dự",
      wishes: wishes || "Không có lời chúc",
    });

    const savedData = await newRsvp.save();
    console.log("✅ Đã lưu MongoDB thành công:", savedData);

    return res.status(200).json({
      success: true,
      message: "Lưu lời chúc thành công!",
      data: savedData,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lưu MongoDB:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi lưu MongoDB: " + error.message,
    });
  }
});

// API RSVP LIST
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
