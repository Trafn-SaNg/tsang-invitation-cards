const API_BASE_URL = "https://trafn-sang-api.onrender.com/api";

let attendanceStatus = "Tham dự";
let currentGuestName = "Con vợ thân mến";
const music = document.getElementById("bg-music");
const musicIcon = document.getElementById("music-icon");
let isPlaying = false;

// 1. TỰ ĐỘNG GIẢI MÃ TÊN NGƯỜI NHẬN TỪ URL PARAMETER TỨC THÌ
function parseGuestNameFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const rawName = urlParams.get("to") || urlParams.get("name");

  if (rawName) {
    try {
      // Decode ký tự tiếng Việt (Ví dụ: %20 -> khoảng trắng)
      return decodeURIComponent(rawName);
    } catch (e) {
      return rawName;
    }
  }
  return "Con vợ thân mến";
}

// Chạy ngay khi tải xong DOM
window.addEventListener("DOMContentLoaded", async () => {
  // Lấy tên tức thì từ URL và gán thẳng vào giao diện 1 & 2
  currentGuestName = parseGuestNameFromURL();
  document.getElementById("guest-name-preview").innerText = currentGuestName;
  document.getElementById("guest-name").innerText = currentGuestName;

  // Sau đó gọi Backend cập nhật thêm dữ liệu sự kiện
  try {
    const response = await fetch(
      `${API_BASE_URL}/guest?to=${encodeURIComponent(currentGuestName)}`,
    );
    const result = await response.json();

    if (result.success) {
      const data = result.data;
      document.getElementById("host-name").innerHTML =
        `${data.hostName} <br><span class="text-base text-amber-400 font-bold">${data.title}</span>`;
      document.getElementById("host-degree").innerText = data.degree;
      document.getElementById("host-university").innerText = data.university;
      document.getElementById("event-time").innerText = data.time;
      document.getElementById("event-location").innerText = data.location;
      document.getElementById("event-map").href = data.mapUrl;
    }
  } catch (error) {
    console.log("Dùng dữ liệu mặc định FE");
  }
});

// 2. NHẠC NỀN & MỞ THIỆP
function playMusic() {
  music
    .play()
    .then(() => {
      isPlaying = true;
      musicIcon.innerText = "🎵";
      musicIcon.classList.add("spin-music");
    })
    .catch((e) => console.log("Autoplay blocked:", e));
}

function toggleMusic() {
  if (isPlaying) {
    music.pause();
    isPlaying = false;
    musicIcon.innerText = "🔇";
    musicIcon.classList.remove("spin-music");
  } else {
    playMusic();
  }
}

function openInvitation() {
  document.getElementById("envelope-screen").classList.add("hidden");
  document.getElementById("invitation-screen").classList.remove("hidden");

  playMusic();
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
}

function setAttendance(status) {
  attendanceStatus = status;
}

// 3. GỬI LỜI CHÚC
async function submitRSVP(event) {
  event.preventDefault();
  const wishesInput = document.getElementById("rsvp-wishes").value;

  try {
    const response = await fetch(`${API_BASE_URL}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName: currentGuestName,
        attendanceStatus: attendanceStatus,
        wishes: wishesInput,
      }),
    });

    const result = await response.json();
    if (result.success) {
      document.getElementById("rsvp-form").classList.add("hidden");
      document.getElementById("thank-you-msg").classList.remove("hidden");
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    }
  } catch (error) {
    document.getElementById("rsvp-form").classList.add("hidden");
    document.getElementById("thank-you-msg").classList.remove("hidden");
  }
}

// 4. 📱 HIỆU ỨNG TẠO STICKER KHI VUỐT MÀN HÌNH ĐIỆN THOẠI (TOUCH MOVE)
const trailEmojis = ["🎓", "✨", "📜", "🥳", "🔥", "⭐", "🎉"];

function spawnStickerAt(x, y) {
  const trailItem = document.createElement("div");
  trailItem.className = "mouse-trail-sticker";
  trailItem.innerText =
    trailEmojis[Math.floor(Math.random() * trailEmojis.length)];
  trailItem.style.left = `${x}px`;
  trailItem.style.top = `${y}px`;

  document.body.appendChild(trailItem);
  setTimeout(() => trailItem.remove(), 800);
}

// Xử lý sự kiện VUỐT TAY trên ĐIỆN THOẠI
let lastTouchX = 0,
  lastTouchY = 0;
window.addEventListener(
  "touchmove",
  (e) => {
    const touch = e.touches[0];
    const dist = Math.hypot(
      touch.clientX - lastTouchX,
      touch.clientY - lastTouchY,
    );

    if (dist > 25) {
      // Phun sticker mỗi 25px vuốt
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
      spawnStickerAt(touch.clientX, touch.clientY);
    }
  },
  { passive: true },
);

// Xử lý CLICK TRÊN PC & TOUCH CHẠM ĐƠN
window.addEventListener("click", (e) => {
  if (e.target.closest("#music-btn") || e.target.closest("#lightbox-modal"))
    return;
  spawnStickerAt(e.clientX, e.clientY);
});

// 5. STICKER LINH VẬT ĐUỔI THEO CHUỘT (PC ONLY)
const cursorSticker = document.getElementById("cursor-sticker");
let mouseX = 0,
  mouseY = 0,
  stickerX = 0,
  stickerY = 0;

if (window.innerWidth > 768) {
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Vệt chuột PC
    const dist = Math.hypot(e.clientX - lastTouchX, e.clientY - lastTouchY);
    if (dist > 30) {
      lastTouchX = e.clientX;
      lastTouchY = e.clientY;
      spawnStickerAt(e.clientX, e.clientY);
    }
  });

  function animateStickerFollower() {
    stickerX += (mouseX - stickerX) * 0.12;
    stickerY += (mouseY - stickerY) * 0.12;
    const deltaX = mouseX - stickerX;
    const rotateAngle = Math.max(-25, Math.min(25, deltaX * 0.8));

    cursorSticker.style.transform = `translate3d(${stickerX + 15}px, ${stickerY + 15}px, 0) rotate(${rotateAngle}deg)`;
    requestAnimationFrame(animateStickerFollower);
  }
  animateStickerFollower();

  // Tilt Card 3D
  const cards = document.querySelectorAll(".tilt-card");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      card.style.transform = `perspective(1000px) rotateX(${-y / 25}deg) rotateY(${x / 25}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });
  });
}

// 6. 🖼️ LIGHTBOX PHÓNG TO ẢNH FULL KÍCH THƯỚC GỐC
function openLightbox(imageSrc) {
  const modal = document.getElementById("lightbox-modal");
  const modalImg = document.getElementById("lightbox-img");
  modalImg.src = imageSrc;
  modal.classList.remove("hidden");
  setTimeout(() => modalImg.classList.remove("scale-95"), 10);
}

function closeLightbox() {
  const modal = document.getElementById("lightbox-modal");
  const modalImg = document.getElementById("lightbox-img");
  modalImg.classList.add("scale-95");
  setTimeout(() => modal.classList.add("hidden"), 200);
}

// TỰ ĐỘNG RENDER 36 ẢNH KỶ NIỆM TỪ THƯ MỤC assets/album/
window.addEventListener("DOMContentLoaded", () => {
  const albumGrid = document.getElementById("album-grid");
  if (albumGrid) {
    let albumHTML = "";
    for (let i = 1; i <= 36; i++) {
      const imgPath = `assets/album/${i}.jpg`;
      albumHTML += `
        <div class="group relative aspect-square rounded-xl overflow-hidden bg-slate-800 border border-slate-700/60 cursor-pointer" onclick="openLightbox('${imgPath}')">
          <img src="${imgPath}" alt="Kỷ niệm ${i}" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
        </div>
      `;
    }
    albumGrid.innerHTML = albumHTML;
  }
});
