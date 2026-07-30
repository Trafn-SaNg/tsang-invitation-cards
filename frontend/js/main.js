// CONFIG URL BACKEND API
const API_BASE_URL = "http://localhost:5000/api";

let attendanceStatus = "Tham dự";
let currentGuestName = "Con vợ thân mến";
const music = document.getElementById("bg-music");
const musicIcon = document.getElementById("music-icon");
let isPlaying = false;

// 1. FETCH DỮ LIỆU TỪ BACKEND
window.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const guestQuery = urlParams.get("to") || "Con vợ thân mến";

  try {
    const response = await fetch(
      `${API_BASE_URL}/guest?to=${encodeURIComponent(guestQuery)}`,
    );
    const result = await response.json();

    if (result.success) {
      const data = result.data;
      currentGuestName = data.guestName;

      // Render dữ liệu nhận từ BE lên Giao diện
      document.getElementById("guest-name-preview").innerText = data.guestName;
      document.getElementById("guest-name").innerText = data.guestName;
      document.getElementById("host-name").innerHTML =
        `${data.hostName} <br><span class="text-base text-amber-400 font-bold">${data.title}</span>`;
      document.getElementById("host-degree").innerText = data.degree;
      document.getElementById("host-university").innerText = data.university;
      document.getElementById("event-time").innerText = data.time;
      document.getElementById("event-location").innerText = data.location;
      document.getElementById("event-map").href = data.mapUrl;
    }
  } catch (error) {
    console.error("Lỗi gọi API Backend:", error);
    document.getElementById("guest-name-preview").innerText = guestQuery;
    document.getElementById("guest-name").innerText = guestQuery;
  }
});

// 2. NHẠC NỀN & PHÁO HOA
function playMusic() {
  music
    .play()
    .then(() => {
      isPlaying = true;
      musicIcon.innerText = "🎵";
      musicIcon.classList.add("spin-music");
    })
    .catch((e) => console.log("Blocked autoplay:", e));
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

// 3. GỬI LỜI CHÚC LÊN BACKEND
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
    alert("Không gửi được lời chúc, con vợ kiểm tra lại Backend nhé!");
  }
}

// 4. HIỆU ỨNG CLICK CHUỘT & STICKER TRAIL (PC ONLY)
const clickEmojis = ["✨", "🎓", "🔥", "🥳", "💛", "🎉"];
window.addEventListener("click", (e) => {
  if (e.target.closest("#music-btn")) return;

  const particle = document.createElement("div");
  particle.className = "click-particle";
  particle.innerText =
    clickEmojis[Math.floor(Math.random() * clickEmojis.length)];
  particle.style.left = `${e.clientX}px`;
  particle.style.top = `${e.clientY}px`;

  document.body.appendChild(particle);
  setTimeout(() => particle.remove(), 800);
});

const cursorSticker = document.getElementById("cursor-sticker");
let mouseX = 0,
  mouseY = 0,
  stickerX = 0,
  stickerY = 0;

if (window.innerWidth > 768) {
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
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

  let lastX = 0,
    lastY = 0;
  const trailEmojis = ["🎓", "✨", "📜", "🥳", "🔥", "⭐"];

  window.addEventListener("mousemove", (e) => {
    const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
    if (dist > 30) {
      lastX = e.clientX;
      lastY = e.clientY;

      const trailItem = document.createElement("div");
      trailItem.className = "mouse-trail-sticker";
      trailItem.innerText =
        trailEmojis[Math.floor(Math.random() * trailEmojis.length)];
      trailItem.style.left = `${e.clientX}px`;
      trailItem.style.top = `${e.clientY}px`;

      document.body.appendChild(trailItem);
      setTimeout(() => trailItem.remove(), 900);
    }
  });

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
