const API_BASE_URL = "https://tsang-invitation-cards.onrender.com/api";

let attendanceStatus = "Tham dự";
let currentGuestName = "Con vợ";
const music = document.getElementById("bg-music");
const musicIcon = document.getElementById("music-icon");
let isPlaying = false;

// 1. TỰ ĐỘNG GIẢI MÃ TÊN NGƯỜI NHẬN TỪ URL PARAMETER TỨC THÌ
function parseGuestNameFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  let rawName = urlParams.get("to") || urlParams.get("name");

  if (rawName) {
    try {
      rawName = decodeURIComponent(rawName);
    } catch (e) {
      // Giữ nguyên rawName
    }
    // Tự động chuyển dấu gạch ngang 'Huu-Duong' thành 'Huu Duong'
    rawName = rawName.replace(/-/g, " ").trim();
    if (rawName.length > 0) return rawName;
  }
  return "Con vợ";
}

// HÀM GÁN TÊN CHUẨN XÁC VÀO TẤT CẢ VỊ TRÍ GIAO DIỆN
function updateGuestNameUI(name) {
  const previewElem = document.getElementById("guest-name-preview");
  const nameElem = document.getElementById("guest-name");
  const presenceElem = document.getElementById("presence-guest-name");

  if (previewElem) previewElem.innerText = name;
  if (nameElem) nameElem.innerText = name;
  if (presenceElem) presenceElem.innerText = name;
}

// Chạy ngay khi tải xong DOM
window.addEventListener("DOMContentLoaded", async () => {
  // Lấy tên từ URL và gán lập tức vào Giao diện
  currentGuestName = parseGuestNameFromURL();
  updateGuestNameUI(currentGuestName);

  // Gọi Backend lấy thông tin sự kiện (ĐẢM BẢO KHÔNG BỊ BẢN BACKEND ĐÈ MẤT TÊN)
  try {
    const response = await fetch(
      `${API_BASE_URL}/guest?to=${encodeURIComponent(currentGuestName)}`,
    );
    const result = await response.json();

    if (result.success && result.data) {
      const data = result.data;
      if (document.getElementById("host-name")) {
        document.getElementById("host-name").innerHTML =
          `${data.hostName} <br><span class="text-base text-amber-400 font-bold">${data.title}</span>`;
      }
      if (document.getElementById("host-degree")) {
        document.getElementById("host-degree").innerText = data.degree;
      }
      if (document.getElementById("host-university")) {
        document.getElementById("host-university").innerText = data.university;
      }
      if (document.getElementById("event-time")) {
        document.getElementById("event-time").innerText = data.time;
      }
      if (document.getElementById("event-location")) {
        document.getElementById("event-location").innerText = data.location;
      }
      if (document.getElementById("event-map")) {
        document.getElementById("event-map").href = data.mapUrl;
      }
    }
  } catch (error) {
    console.log("Dùng dữ liệu mặc định FE");
  }
});

// 2. NHẠC NỀN & MỞ THIỆP
function playMusic() {
  if (!music) return;
  music
    .play()
    .then(() => {
      isPlaying = true;
      if (musicIcon) {
        musicIcon.innerText = "🎵";
        musicIcon.classList.add("spin-music");
      }
    })
    .catch((e) => console.log("Autoplay blocked:", e));
}

function toggleMusic() {
  if (!music) return;
  if (isPlaying) {
    music.pause();
    isPlaying = false;
    if (musicIcon) {
      musicIcon.innerText = "🔇";
      musicIcon.classList.remove("spin-music");
    }
  } else {
    playMusic();
  }
}

function openInvitation() {
  const envelope = document.getElementById("envelope-screen");
  const invitation = document.getElementById("invitation-screen");
  if (envelope) envelope.classList.add("hidden");
  if (invitation) invitation.classList.remove("hidden");

  playMusic();
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
}

function setAttendance(status) {
  attendanceStatus = status;
}

// 3. GỬI LỜI CHÚC VỀ BACKEND MONGO
async function submitRSVP(event) {
  event.preventDefault();
  const wishesInput = document.getElementById("rsvp-wishes")?.value || "";
  const guestNameToSend = currentGuestName || parseGuestNameFromURL();

  console.log("🚀 Đang gửi dữ liệu RSVP:", {
    guestName: guestNameToSend,
    attendanceStatus: attendanceStatus,
    wishes: wishesInput,
  });

  try {
    const response = await fetch(`${API_BASE_URL}/rsvp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        guestName: guestNameToSend,
        attendanceStatus: attendanceStatus,
        wishes: wishesInput,
      }),
    });

    const result = await response.json();
    console.log("📩 Phản hồi từ Server Render:", result);

    if (result.success) {
      document.getElementById("rsvp-form")?.classList.add("hidden");
      document.getElementById("thank-you-msg")?.classList.remove("hidden");
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    } else {
      alert("❌ Lỗi từ Server: " + result.message);
    }
  } catch (error) {
    console.error("❌ Lỗi kết nối Server:", error);
    alert(
      "⚠️ Render Server đang khởi động lại (khởi động lạnh). Vui lòng bấm gửi lại sau 10 giây nhé!",
    );
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

let lastTouchX = 0,
  lastTouchY = 0;
window.addEventListener(
  "touchmove",
  (e) => {
    const modal = document.getElementById("lightbox-modal");
    if (modal && !modal.classList.contains("hidden")) return;

    const touch = e.touches[0];
    const dist = Math.hypot(
      touch.clientX - lastTouchX,
      touch.clientY - lastTouchY,
    );

    if (dist > 25) {
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
      spawnStickerAt(touch.clientX, touch.clientY);
    }
  },
  { passive: true },
);

window.addEventListener("click", (e) => {
  if (e.target.closest("#music-btn") || e.target.closest("#lightbox-modal"))
    return;
  spawnStickerAt(e.clientX, e.clientY);
});

// 5. STICKER LINH VẬT & HIỆU ỨNG TILT 3D NHẸ NHÀNG
const cursorSticker = document.getElementById("cursor-sticker");
let mouseX = 0,
  mouseY = 0,
  stickerX = 0,
  stickerY = 0;

if (window.innerWidth > 768) {
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

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

    if (cursorSticker) {
      cursorSticker.style.transform = `translate3d(${stickerX + 15}px, ${stickerY + 15}px, 0) rotate(${rotateAngle}deg)`;
    }
    requestAnimationFrame(animateStickerFollower);
  }
  animateStickerFollower();

  const cards = document.querySelectorAll(".tilt-card");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const maxTilt = 4;
      const rotateX = (-y * maxTilt).toFixed(2);
      const rotateY = (x * maxTilt).toFixed(2);

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });
  });
}

// =========================================================================
// 6. 🖼️ LIGHTBOX SLIDER & TỰ ĐỘNG BẮT ĐÚNG ĐƯỜNG DẪN ẢNH ALBUM
// =========================================================================
let currentImageIndex = 1;
const TOTAL_IMAGES = 36;

// HÀM TỰ ĐỘNG TẠO ĐƯỜNG DẪN ẢNH CHUẨN XÁC CHO CẢ LOCAL LẪN GITHUB PAGES
function getImagePath(index) {
  // Nếu đang chạy trên web GitHub Pages
  if (window.location.hostname.includes("github.io")) {
    return `https://trafn-sang.github.io/tsang-invitation-cards/frontend/assets/album/memory${index}.jpg`;
  }
  // Nếu đang chạy ở máy tính (Localhost / Live Server)
  return `assets/album/memory${index}.jpg`;
}

// Hàm tự sửa lỗi nếu đuôi ảnh bị lệch (.JPG in hoa hoặc dạng 1.jpg)
function handleAlbumImgError(img, index) {
  console.error(`❌ Không tìm thấy ảnh tại: ${img.src}`);
  const isGithub = window.location.hostname.includes("github.io");

  if (!img.dataset.retry) {
    img.dataset.retry = "1";
    img.src = isGithub
      ? `https://trafn-sang.github.io/tsang-invitation-cards/frontend/assets/album/memory${index}.JPG`
      : `assets/album/memory${index}.JPG`;
  } else if (img.dataset.retry === "1") {
    img.dataset.retry = "2";
    img.src = isGithub
      ? `https://trafn-sang.github.io/tsang-invitation-cards/frontend/assets/album/${index}.jpg`
      : `assets/album/${index}.jpg`;
  }
}

function updateLightboxDisplay() {
  const modalImg = document.getElementById("lightbox-img");
  const counterText = document.getElementById("lightbox-counter");

  if (modalImg) {
    modalImg.style.opacity = "0.3";
    modalImg.src = getImagePath(currentImageIndex);
    setTimeout(() => {
      modalImg.style.opacity = "1";
    }, 50);
  }

  if (counterText) {
    counterText.innerText = `${currentImageIndex} / ${TOTAL_IMAGES}`;
  }
}

function openLightbox(index) {
  currentImageIndex = typeof index === "number" ? index : parseInt(index) || 1;
  const modal = document.getElementById("lightbox-modal");
  updateLightboxDisplay();

  if (modal) {
    modal.classList.remove("hidden");
    setTimeout(() => {
      const modalImg = document.getElementById("lightbox-img");
      if (modalImg) modalImg.classList.remove("scale-95");
    }, 10);
  }
}

function closeLightbox() {
  const modal = document.getElementById("lightbox-modal");
  const modalImg = document.getElementById("lightbox-img");
  if (modalImg) modalImg.classList.add("scale-95");
  setTimeout(() => {
    if (modal) modal.classList.add("hidden");
  }, 200);
}

function nextImage(e) {
  if (e) e.stopPropagation();
  currentImageIndex =
    currentImageIndex >= TOTAL_IMAGES ? 1 : currentImageIndex + 1;
  updateLightboxDisplay();
}

function prevImage(e) {
  if (e) e.stopPropagation();
  currentImageIndex =
    currentImageIndex <= 1 ? TOTAL_IMAGES : currentImageIndex - 1;
  updateLightboxDisplay();
}

window.addEventListener("keydown", (e) => {
  const modal = document.getElementById("lightbox-modal");
  if (!modal || modal.classList.contains("hidden")) return;

  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    nextImage();
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    prevImage();
  } else if (e.key === "Escape") {
    closeLightbox();
  }
});

let touchStartX = 0;
let touchEndX = 0;

window.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("lightbox-modal");
  if (modal) {
    modal.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true },
    );

    modal.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      },
      { passive: true },
    );
  }
});

function handleSwipe() {
  const swipeThreshold = 40;
  if (touchEndX < touchStartX - swipeThreshold) {
    nextImage();
  } else if (touchEndX > touchStartX + swipeThreshold) {
    prevImage();
  }
}

// TỰ ĐỘNG RENDER 36 ẢNH KỶ NIỆM TỪ THƯ MỤC assets/album/
window.addEventListener("DOMContentLoaded", () => {
  const albumGrid = document.getElementById("album-grid");
  if (albumGrid) {
    let albumHTML = "";
    for (let i = 1; i <= TOTAL_IMAGES; i++) {
      const imgPath = getImagePath(i);
      albumHTML += `
        <div class="group relative aspect-square rounded-xl overflow-hidden bg-slate-800 border border-slate-700/60 cursor-pointer" onclick="openLightbox(${i})">
          <img src="${imgPath}" alt="Kỷ niệm ${i}" loading="lazy" onerror="handleAlbumImgError(this, ${i})" class="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
        </div>
      `;
    }
    albumGrid.innerHTML = albumHTML;
  }
});
