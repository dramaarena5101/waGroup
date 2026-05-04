/* ================================================
   PENTAS SENI 2026 — script_v2.js (Feature Parity with v1)
   ================================================ */

/* ---- STATE ---- */
const urlParams = new URLSearchParams(window.location.search);
const isAdminUrl = urlParams.get('key') === 'panitiaDA5101secret';

let currentUser   = null;
let lastSendTime  = 0;
let unreadCount   = 0;
let lastDateLabel = '';
let callTimer     = null;
let replyingTo    = null; // { name, text, id }
const notifSound  = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');

// Helper to check if current device is admin
const checkAdminStatus = () => isAdminUrl || localStorage.getItem('admin_device_trusted') === APP_CONFIG.adminSecretCode;

const SEND_DELAY_MS = 2000;   // anti-spam
const MSG_LIMIT     = 100;    // pesan terakhir

/* ---- CONFIGURATION (MUDAH DISET UP) ---- */
// ⬇️ UBAH DATA DI BAWAH INI SESUAI ACARA ANDA ⬇️
const APP_CONFIG = {
  groupName: "Drama Arena 5101",
  groupAvatar: "assets/logo.png",
  groupBanner: "assets/7.jpeg",
  pageTitle: "Yahanu Grup DA 5101",

  // Bentuk Avatar Grup: 'circle' (bulat) atau 'square' (kotak/natural)
  groupAvatarShape: "circle", 

  // ===================================================================
  // 🖼️ BACKGROUND CHAT AREA
  //    Isi path gambar: 'assets/bg-chat.jpg'
  //    Kosongkan ("") untuk pakai warna solid dari theme
  // ===================================================================
  chatBackground: "",  // ← ISI PATH GAMBAR BG CHAT, contoh: 'assets/bg-chat.jpg'

  // -- PENGATURAN INFO GRUP --
  // Deskripsi grup ini akan muncul di sidebar saat nama grup diklik
  groupDescription: "Selamat datang di grup resmi Drama Arena 5101! Di sini bisa  berbagi momen, dan menyaksikan keseruan acara bersama. Mari saling mendukung para penampil! 🎉",
  eventPosters: [
    { src: 'assets/5.jpeg', label: 'Drama' },
    { src: 'assets/6.jpeg', label: 'Paduan Suara' },
    { src: 'assets/7.jpeg', label: 'Tari' },
    { src: 'assets/8.jpeg', label: 'Band' }
  ],
  schedule: [
    { time: "07.00", text: "Visual Testimoni “Semangat Al Akh Ku”" },
    { time: "07.15", text: "Scandious Show" },
    { time: "07.30", text: "Visual “Bayangkan Jika Kita Tidak Menyerah”" },
    { time: "07.45", text: "Opening Nasyid “Cahaya Shifr”" },
    { time: "08.00", text: "Visual Sapa MC" },
    { time: "08.10", text: "Master of Ceremony" },
    { time: "08.20", text: "Pembukaan oleh Qur’an" },
    { time: "08.30", text: "Sambutan Ketua Drama Arena" },
    { time: "08.45", text: "Sambutan Pimpinan Pondok Modern Darussalam Gontor" },
    { time: "09.00", text: "Visual Tari Duri" },
    { time: "09.15", text: "Grand Opening (Ost. DA 5101)" },
    { time: "09.30", text: "Choir 5101" },
    { time: "09.45", text: "Drama POV 1 – Bintang" },
    { time: "10.00", text: "Tari" },
    { time: "10.15", text: "Visual “Syukran Alhamdulillah”" },
    { time: "10.30", text: "Visual POV 2 – Akta" },
    { time: "10.45", text: "Hiburan" },
    { time: "11.00", text: "Ya Maulaya (Mazka)" },
    { time: "11.15", text: "Ya Maulaya (Nafa)" },
    { time: "11.30", text: "Luda Ludu Wel" },
    { time: "11.45", text: "Arjuna" },
    { time: "12.00", text: "Black Mask Rhythm" },
    { time: "12.15", text: "Tong Bascudera" },
    { time: "12.30", text: "Drama POV 3 – Mudabbir" },
    { time: "12.45", text: "Visual “Taqwa dan Amanah”" },
    { time: "13.00", text: "5101 Band “Tangguh”" },
    { time: "13.15", text: "Fashion Show" },
    { time: "13.30", text: "Iklan “Temukan Makna Untuk Bersama”" },
    { time: "13.45", text: "Tari Rateb Meuseukat" },
    { time: "14.00", text: "Visual POV 4 – Aflah" },
    { time: "14.15", text: "5101 Band “Melodi Tongkrongan”" },
    { time: "14.30", text: "Drama POV 4 – Aflah" },
    { time: "14.45", text: "Raqs Arabian" },
    { time: "15.00", text: "Silent Dance" },
    { time: "15.15", text: "Infinity Beatbox" },
    { time: "15.30", text: "Catwalk" },
    { time: "15.45", text: "Electric Six" },
    { time: "16.00", text: "Hikaru Toki DA" },
    { time: "16.15", text: "Drama POV 5 – Pilar" },
    { time: "16.30", text: "Grand Closing “Api Perjuangan”" }
  ],
  location: {
    text: "Depan Gedung New BPPM <br/>Pondok Modern Darussalam Gontor<br/>Ponorogo, Jawa Timur",
    link: "https://maps.google.com/?q=Gedung+Aula+Utama+Pondok+Modern+Darussalam+Gontor+Ponorogo"
  },

  rules: [
    "Sopan dan saling menghormati",
    "Dilarang spam / SARA",
    "Kirim ucapan positif!",
    "Nikmati acaranya 🎊"
  ],

  // ===================================================================
  // 📞 PENGATURAN FAKE CALL OTOMATIS
  // ===================================================================
  autoCall: {
    enabled: true,
    delayMs: 30000, // 30 detik untuk percobaan
    videoSrc: "assets/1.mp4", // Video berbeda untuk auto call
    callerName: "Drama Arena 5101 Official"
  },

  // ===================================================================
  // 🚫 NAMA YANG DILARANG — Cegah pengguna iseng pakai nama panitia
  //    Tulis dalam huruf kecil, cek case-insensitive otomatis
  // ===================================================================
  bannedNames: [
    "drama arena",
    "drama arena 5101",
    "panitia",
    "panitia drama",
    "panitia drama arena",
    "panitia drama arena 5101",
    "admin",
    "admin Drama Arena",
    "admin Drama Arena 5101",
    "administrator",
    "moderator",
    "mod",
    "official"
  ],

  // ===================================================================
  // 🚫 KATA YANG DILARANG (PROFANITY FILTER)
  // ===================================================================
  bannedWords: [
    "anjing", "babi", "monyet", "kunyuk", "bangsat", "brengsek", "kontol", "memek", "ngentot", "pentil", "perek", "jablay", "goblok", "tolol", "idiot", "bego", "sinting", "gendeng", "asu", "cok", "jancok", "ndasmu", "matamu", "pantek", "kimak", "itil", "lonte", "peler", "jembut", "setan", "iblis", "dajjal"
  ],

  // ===================================================================
  // ✅ KATA YANG DIIZINKAN (WHITELIST)
  //    Mencegah false positive (misal: "susunan" mengandung "asu")
  // ===================================================================
  whitelist: [
    "susunan", "kasur", "masuk", "basuh", "basah", "asuransi", "pasukan", "asuh", "asli", "masalah"
  ],

  // ===================================================================
  // 🔑 KODE RAHASIA ADMIN — Device yang input kode ini diizinkan
  //    pakai nama apapun termasuk nama yang dilarang
  //    Ganti kode ini dengan kata sandi kamu sendiri!
  // ===================================================================
  adminSecretCode: "DA5101PANITIA",

  // ===================================================================
  // 🎥 BACKGROUND LAYAR PANGGILAN (Voice Call)
  //    Ganti dengan path gambar atau warna CSS
  //    Contoh: 'assets/call-bg.jpg' atau '#1a1a2e'
  // ===================================================================
  voiceCallBackground: "#0b141a",  // warna gelap default
  voiceCallAvatar: "🎭",           // emoji atau ganti dengan path gambar: 'assets/logo.png'

  // ===================================================================
  // 🎵 AUDIO PANGGILAN SUARA (Voice Call)
  //    Isi dengan path file MP3 kamu, contoh: 'assets/call-audio.mp3'
  //    Kosongkan ("") jika tidak ingin ada audio
  // ===================================================================
  voiceCallAudio: "assets/1.mp3",  // ← TARUH MP3 KAMU DI SINI

  // -- PENGATURAN BOT KEYWORD --
  botCommands: [
    { 
      command: "@guidebook", 
      keywords: ["guidebook", "buku panduan", "link download", "unduh"],
      description: "Dapatkan link Guide Book resmi", 
      reply: "DYNAMIC_GUIDEBOOK" // Use dynamic card
    },

    { 
      command: "@susunanacara", 
      keywords: ["rundown", "jadwal", "susunan acara", "jam berapa", "kapan"],
      description: "Lihat rundown / susunan acara", 
      reply: "DYNAMIC_SCHEDULE" 
    },

    { 
      command: "@lokasi", 
      keywords: ["lokasi", "tempat", "di mana", "dimana", "maps", "alamat"],
      description: "Lihat info lokasi acara", 
      reply: "DYNAMIC_LOCATION" 
    }
  ],

  // -- PESAN STATIS AWAL --

  staticMessages: [
    // --- FLOW UNDANGAN DIGITAL (STATIC CONVERSATION) ---
    { sender: "Panitia Drama Arena 5101", color: "#ff5500ff", time: "08.00", content: "Assalamulaikum ustadz-ustadz sekalian... 🙏 <br><br>Undangan resmi dari kami untuk antum sekalian dalam memeriahkan acara <b>Drama Arena 5101</b>. Yang bermotokan: <br><i>'Nyalakan Api Kebersamaan, Wujudkan Idealisme Kehidupan'</i>. <br>InsyaAllah bakal seru dan meriah jangan sampai kelewatan ya ustadz-ustadzkuh!" },
    
    { sender: "Panitia Drama Arena 5101", color: "#ff5500ff", time: "08.01", content: `
      <div class="message-image" style="margin-top:8px;">
        <img src="official_poster_new.png" style="width:100%; max-width:260px; border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); cursor:pointer;" onclick="openImage(this.src)" alt="Official Poster DA 5101" />
      </div>
      <p style="margin-top:8px; font-size:12px; color:var(--wa-sub);">👆 Poster Drama Arena 5101</p>
    ` },

    { sender: "", color: "#2196F3", time: "08.02", content: "MasyaAllah..., menyala 🔥🔥🔥 Ditunggu banget nih min! <br>Izin tanya, ada info detail acaranya gak? Kayak rundown atau denah lokasinya gitu biar kita bisa prepare?", isOwn: true },

    { sender: "Panitia Drama Arena 5101", color: "#ff5500ff", time: "08.03", content: `
      Ahlan ustadz <b>{name}</b>, tentu ada stadz! Ini kami kirimkan <b>Guide Book</b> resminya ya, di dalamnya sudah lengkap semua informasinya:
      <div class="rich-link-card">
        <img src="guidebook_cover_v2.png" class="rich-link-image" alt="Guide Book Cover" />
        <div class="rich-link-body">
          <div class="rich-link-title">📚 Guide Book DA 5101</div>
          <div class="rich-link-desc">E-Book panduan lengkap jadwal, denah, dan profil acara.</div>
          <a href="assets/guide-book.pdf" target="_blank" class="rich-link-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            Buka Guide Book
          </a>
        </div>
      </div>
    ` },

    { sender: "Panitia Drama Arena 5101", color: "#ff5500ff", time: "08.04", content: `
      Dan untuk lokasinya, akan diadakan di depan <b>Gedung New BPPM</b> ya ustadz:
      <div class="rich-link-card">
        <div class="map-iframe-container" style="width:100%; height:180px; overflow:hidden;">
          <iframe 
            width="100%" 
            height="100%" 
            frameborder="0" 
            scrolling="no" 
            marginheight="0" 
            marginwidth="0" 
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d259.5220242225412!2d111.49846684187652!3d-7.928339409444317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sid!4v1777877847755!5m2!1sen!2sid" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
        <div class="rich-link-body">
          <div class="rich-link-title">📍 Depan New BPPM Gontor</div>
          <div class="rich-link-desc">Depan Gedung New BPPM, Pondok Modern Darussalam Gontor, Ponorogo.</div>
          <a href="https://maps.google.com/?q=Gedung+Aula+Utama+Pondok+Modern+Darussalam+Gontor+Ponorogo" target="_blank" class="rich-link-btn" style="background:#00a884;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            Gas Meluncur
          </a>
        </div>
      </div>
    ` },

    { sender: "Panitia Drama Arena 5101", color: "#ff5500ff", time: "08.05", content: "Ditunggu banget kehadirannya antum ya, ustadz-ustadzkuh! 🙏✨" },

    { sender: "Panitia Drama Arena 5101", color: "#ff5500ff", time: "08.06", content: "Semoga acara Drama Arena 5101 tahun ini berjalan lancar, sukses, dan memberikan kesan terbaik untuk kita semua. Aamiin ya Allah... 🤲🔥" }
  ]
};

// Setup Theme
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('wa_theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('wa_theme', 'dark');
  }
}

function applyAppConfig() {
  document.getElementById('pageTitle').textContent = APP_CONFIG.pageTitle;
  
  // Terapkan bentuk avatar (bulat/kotak)
  const radius = APP_CONFIG.groupAvatarShape === 'circle' ? '50%' : '8px';
  document.documentElement.style.setProperty('--avatar-radius', radius);

  document.getElementById('welcomeGroupName').textContent = APP_CONFIG.groupName;
  document.getElementById('callGroupName').textContent = APP_CONFIG.groupName;
  document.getElementById('infoGroupName').textContent = APP_CONFIG.groupName;
  document.getElementById('mainGroupName').textContent = APP_CONFIG.groupName;

  const setAvatar = (id, avatar) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (avatar.length <= 2) {
      el.textContent = avatar;
    } else {
      // Hilangkan border-radius:50% hardcode agar bisa diatur via CSS
      el.innerHTML = `<img src="${avatar}" class="avatar-img-auto" onerror="this.outerHTML='🎭'" />`;
    }
  };
  setAvatar('welcomeLogo', APP_CONFIG.groupAvatar);
  setAvatar('callAvatar', APP_CONFIG.groupAvatar);
  setAvatar('infoAvatar', APP_CONFIG.groupAvatar);
  setAvatar('mainAvatar', APP_CONFIG.groupAvatar);

  const bannerEl = document.querySelector('.info-banner');
  if (bannerEl && APP_CONFIG.groupBanner) {
    bannerEl.style.backgroundImage = `url('${APP_CONFIG.groupBanner}')`;
    bannerEl.style.backgroundSize = 'cover';
    bannerEl.style.backgroundPosition = 'center';
  }

  const descEl = document.getElementById('configGroupDescription');
  if (descEl) {
    descEl.innerHTML = `
      <div class="expandable-container" id="descContainer" style="max-height: 60px;">
        ${APP_CONFIG.groupDescription}
      </div>
      <button class="see-more-btn" id="descSeeMore" onclick="toggleExpand('descContainer', this)">Lihat selengkapnya</button>
    `;
    
    // Hide button if content is short
    setTimeout(() => {
      const container = document.getElementById('descContainer');
      if (container && container.scrollHeight <= 60) {
        document.getElementById('descSeeMore').style.display = 'none';
        container.style.maxHeight = 'none';
      }
    }, 100);
  }
  
  const postersEl = document.getElementById('configEventPosters');
  if (postersEl) {
    postersEl.innerHTML = APP_CONFIG.eventPosters.map(p => `
      <div style="cursor:pointer; text-align:center; min-width:100px;" onclick="openImage('${p.src}')">
        <div style="width:100px; height:100px; background-image:url('${p.src}'); background-size:cover; background-position:center; border-radius:8px; margin-bottom:4px;"></div>
        <span style="font-size:12px; color:var(--wa-text);">${p.label}</span>
      </div>
    `).join('');
  }

  const scheduleEl = document.getElementById('configSchedule');
  if (scheduleEl) {
    scheduleEl.innerHTML = `
      <div class="expandable-container" id="scheduleContainer">
        ${APP_CONFIG.schedule.map(s => `
          <div style="display: flex; gap: 12px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--glass-border);">
            <div style="font-weight: 700; color: #00a884; min-width: 48px;">${s.time}</div>
            <div style="color: var(--wa-text);">${s.text}</div>
          </div>
        `).join('')}
      </div>
      <button class="see-more-btn" id="scheduleSeeMore" onclick="toggleExpand('scheduleContainer', this)">Lihat selengkapnya</button>
    `;

    // Hide button if content is short
    setTimeout(() => {
      const container = document.getElementById('scheduleContainer');
      if (container && container.scrollHeight <= 150) {
        document.getElementById('scheduleSeeMore').style.display = 'none';
        container.style.maxHeight = 'none';
      }
    }, 100);
  }

  const locationEl = document.getElementById('configLocation');
  if (locationEl) {
    locationEl.innerHTML = `
      <a href="${APP_CONFIG.location.link}" target="_blank" class="location-link">
        <span class="location-icon">📍</span>
        <span>Lihat Lokasi di Maps →</span>
      </a>
      <p style="color:var(--wa-text);">${APP_CONFIG.location.text}</p>
    `;
  }

  const rulesEl = document.getElementById('configRules');
  if (rulesEl) {
    rulesEl.innerHTML = APP_CONFIG.rules.map(r => `<li style="margin-bottom:6px;">${r}</li>`).join('');
  }

  // Terapkan background chat area dari config
  const chatEl = document.getElementById('chatArea');
  if (chatEl) {
    if (APP_CONFIG.chatBackground) {
      chatEl.style.backgroundImage = `url('${APP_CONFIG.chatBackground}')`;
      chatEl.style.backgroundSize = 'cover';
      chatEl.style.backgroundPosition = 'center';
      chatEl.style.backgroundAttachment = 'local';
    } else {
      chatEl.style.backgroundImage = '';
    }
  }
}

function renderStaticMessages() {
  const chatArea = document.getElementById('chatArea');
  const loader = document.getElementById('chatLoader');
  
  APP_CONFIG.staticMessages.forEach(msg => {
    const wrap = document.createElement('div');
    wrap.className = `bubble-wrap admin-static ${msg.isOwn ? 'out' : 'in'}`;
    
    let nameHtml = '';
    if (!msg.isOwn) {
      nameHtml = `<div class="bubble-name" style="color: ${msg.color}; font-weight:800;">${msg.sender}</div>`;
    }
    
    const tickHtml = msg.isOwn ? `<span class="bubble-tick"><svg viewBox="0 0 16 15" width="16" height="15" fill="currentColor"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/></svg></span>` : "";

    // Ganti placeholder {name} dengan nama user yang sedang login
    const resolvedContent = msg.content.replace(/\{name\}/g, currentUser || 'Kamu');

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = `
      ${resolvedContent}
      <div class="bubble-meta">
        <span class="bubble-time">${msg.time}</span>
        ${tickHtml}
      </div>
    `;
    
    if (nameHtml) wrap.innerHTML += nameHtml;
    wrap.appendChild(bubble);
    chatArea.insertBefore(wrap, loader);
  });
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  // Default LIGHT MODE — simpan 'dark' di localStorage untuk pakai dark mode
  const savedTheme = localStorage.getItem('wa_theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  applyAppConfig();

  const savedUser = localStorage.getItem("ps_username_v2");
  if (savedUser) {
    currentUser = savedUser; 
    renderStaticMessages(); 
    document.getElementById("nameModal").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    initChat();
    
    // 🔥 NEW: Check if there's a pending call from previous refresh
    if (sessionStorage.getItem('callStatus') === 'pending') {
      setTimeout(showIncomingCall, 500); 
    }
  }

  // Scroll listener for unread badge
  const chat = document.getElementById("chatArea");
  chat.addEventListener("scroll", () => {
    const btn = document.getElementById("scrollBtn");
    const distFromBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight;
    if (distFromBottom > 150) {
      btn.classList.remove("hidden");
    } else {
      btn.classList.add("hidden");
      unreadCount = 0;
      updateUnreadBadge();
    }
  });
});

function joinChat() {
  const input = document.getElementById("nameInput");
  const name = input.value.trim();
  if (!name) {
    input.parentElement.style.animation = "shake 0.3s";
    setTimeout(() => input.parentElement.style.animation = "", 300);
    return;
  }

  // 🔑 Cek apakah device sudah terdaftar sebagai admin (whitelist)
  const isWhitelisted = isAdminUrl || localStorage.getItem('admin_device_trusted') === APP_CONFIG.adminSecretCode;

  // 🚫 Cek nama yang dilarang (kecuali device admin) menggunakan Normalisasi
  if (!isWhitelisted) {
    const normalizedInput = normalizeText(name);
    const isBanned = APP_CONFIG.bannedNames.some(banned => {
      const normalizedBanned = normalizeText(banned);
      // Cek apakah input mengandung kata yang dilarang setelah dinormalisasi
      return normalizedInput.includes(normalizedBanned);
    });

    if (isBanned) {
      showNameError(input, `❌ Nama "${name}" tidak diizinkan. Silakan gunakan nama aslimu.`);
      return;
    }
  }

  currentUser = escapeHtml(name); // set nama DULU
  localStorage.setItem("ps_username_v2", currentUser);

  renderStaticMessages(); // render dengan nama yang sudah diketahui

  document.getElementById("nameModal").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  initChat();
  
  // 🔥 NEW: Trigger Call Immediately on Join
  sessionStorage.setItem('callStatus', 'pending');
  showIncomingCall();
}

// Tampilkan pesan error di modal join
function showNameError(input, msg) {
  let errEl = document.getElementById('nameError');
  if (!errEl) {
    errEl = document.createElement('div');
    errEl.id = 'nameError';
    errEl.style.cssText = 'color:#ff4444;font-size:13px;margin-top:-12px;margin-bottom:8px;text-align:center;animation:slideDownIn 0.2s;';
    input.parentElement.insertAdjacentElement('afterend', errEl);
  }
  errEl.textContent = msg;
  input.style.borderColor = '#ff4444';
  input.parentElement.style.animation = 'shake 0.3s';
  setTimeout(() => {
    input.parentElement.style.animation = '';
    input.style.borderColor = '';
  }, 400);
}

// 🔑 Fungsi untuk daftarkan device sebagai admin (ketik kode di console browser)
// Cara pakai: ketik di console browser: registerAdminDevice('DA5101PANITIA')
window.registerAdminDevice = function(code) {
  if (code === APP_CONFIG.adminSecretCode) {
    localStorage.setItem('admin_device_trusted', code);
    alert('✅ Device ini terdaftar sebagai admin. Refresh halaman.');
  } else {
    alert('❌ Kode salah.');
  }
};

window.unregisterAdminDevice = function() {
  localStorage.removeItem('admin_device_trusted');
  alert('✅ Device dihapus dari daftar admin.');
};

function leaveGroup() {
  localStorage.removeItem("ps_username_v2");
  window.location.reload();
}

/* ====================================================================
   🔥 FIREBASE SDK IMPLEMENTATION (Like v1) 🔥
==================================================================== */
function initChat() {
  if (window.firebaseReady) {
    startListening();
  } else {
    window.addEventListener('firebaseReady', startListening);
  }
}

function startListening() {
  const loader = document.getElementById('chatLoader');
  const q = window._query(window._ref, window._limitToLast(MSG_LIMIT));

  // Sembunyikan loader jika database kosong
  window._get(q).then(snapshot => {
    if (!snapshot.exists() && loader) {
      loader.remove();
    }
  });

  window._onChildAdded(q, (snapshot) => {
    if (loader) loader.remove();

    const msg = snapshot.val();
    const isOwn = msg.name === currentUser;
    appendBubble(msg, isOwn, snapshot.key);

    // Play "ting" sound if message is from others
    if (!isOwn) {
      notifSound.currentTime = 0;
      notifSound.play().catch(() => {});
    }

    const chat = document.getElementById('chatArea');
    const distFromBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight;
    if (distFromBottom < 150 || isOwn) {
      scrollToBottom();
    } else {
      unreadCount++;
      updateUnreadBadge();
    }

    // ✨ Interactive Feature: Check for keywords to trigger reactions
    if (msg.message) checkMessageKeywords(msg.message);
  });

  window._onChildRemoved(window._ref, (snapshot) => {
    const el = document.querySelector(`[data-msg-id="${snapshot.key}"]`);
    if (el) {
      el.style.animation = "shake 0.3s";
      setTimeout(() => el.remove(), 300);
    }
  });

  simulateOnlineCount();
}

function sendMessage() {
  if (!currentUser) return;
  const input = document.getElementById('msgInput');
  const text  = input.value.trim();
  if (!text) { 
    input.parentElement.style.animation = "shake 0.3s";
    setTimeout(() => input.parentElement.style.animation = "", 300);
    return; 
  }

  // 🚫 Check for Banned Words (Advanced)
  const lowerText = text.toLowerCase();
  const normalizedText = normalizeText(text);
  
  // Cek apakah pesan mengandung kata di whitelist (abaikan filter jika iya)
  const isWhitelisted = APP_CONFIG.whitelist.some(w => lowerText.includes(w.toLowerCase()));

  const hasBannedWord = !isWhitelisted && APP_CONFIG.bannedWords.some(word => {
    const normalizedBanned = normalizeText(word);
    return lowerText.includes(word.toLowerCase()) || normalizedText.includes(normalizedBanned);
  });
  
  if (hasBannedWord) {
    showToast("⚠️ Dijaga dong ketikannya!");
    input.value = ""; 
    input.style.height = 'auto';
    return;
  }

  const now = Date.now();
  if (now - lastSendTime < SEND_DELAY_MS) {
    showToast(`⏳ Tunggu ${Math.ceil((SEND_DELAY_MS - (now - lastSendTime)) / 1000)}s`);
    return;
  }

  const btn = document.getElementById('sendBtn');
  btn.disabled = true;

  const payload = {
    name:      currentUser,
    message:   escapeHtml(text),
    timestamp: window._serverTimestamp(),
    isAdmin:   false
  };

  if (replyingTo) {
    payload.replyTo = replyingTo;
  }

  window._push(window._ref, payload).then(() => {
    input.value = '';
    input.style.height = 'auto'; // Reset tinggi textarea
    lastSendTime = Date.now();
    closeEmojiPicker();
    cancelReply();
    
    const popup = document.getElementById('commandPopup');
    if (popup) popup.classList.add('hidden');

    // 🤖 SMART BOT LOGIC (Simulated AI)
    const normalizedInput = normalizeText(text);
    
    // 1. Cek Tag Persis (@guidebook, dll)
    let matchedCommand = APP_CONFIG.botCommands.find(c => text.toLowerCase().includes(c.command.toLowerCase()));
    
    // 2. Cek Keywords (lokasi, jam berapa, dll)
    if (!matchedCommand) {
      matchedCommand = APP_CONFIG.botCommands.find(c => 
        c.keywords.some(k => normalizedInput.includes(normalizeText(k)))
      );
    }

    if (matchedCommand) {
      showBotTyping(() => {
        let finalReply = matchedCommand.reply;
        
        // Handle Dynamic Responses
        if (finalReply === "DYNAMIC_SCHEDULE") {
          finalReply = "📅 <b>Susunan Acara Drama Arena 5101:</b><br/>" + 
                       APP_CONFIG.schedule.map(s => `• <b>${s.time}</b> - ${s.text}`).join('<br/>');
        } else if (finalReply === "DYNAMIC_GUIDEBOOK") {
          finalReply = `
            <div class="rich-link-card">
              <img src="guidebook_cover_v2.png" class="rich-link-image" alt="Guide Book Cover" />
              <div class="rich-link-body">
                <div class="rich-link-title">📚 Official Guide Book</div>
                <div class="rich-link-desc">Pelajari jadwal, denah lokasi, dan profil penampil Drama Arena 5101 secara lengkap di sini.</div>
                <a href="assets/guide-book.pdf" target="_blank" class="rich-link-btn">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                  Buka Guide Book
                </a>
              </div>
            </div>
          `;
        } else if (finalReply === "DYNAMIC_LOCATION") {
          finalReply = `
            <div class="rich-link-card">
              <div class="map-iframe-container" style="width:100%; height:180px; overflow:hidden;">
                <iframe width="100%" height="100%" frameborder="0" scrolling="no" src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d259.5220242225412!2d111.49846684187652!3d-7.928339409444317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sid!4v1777877847755!5m2!1sen!2sid" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
              </div>
              <div class="rich-link-body">
                <div class="rich-link-title">📍 Depan New BPPM</div>
                <div class="rich-link-desc">Pondok Modern Darussalam Gontor, Ponorogo.</div>
                <a href="https://maps.google.com/?q=Gedung+Aula+Utama+Pondok+Modern+Darussalam+Gontor+Ponorogo" target="_blank" class="rich-link-btn" style="background:#00a884;">Gas Meluncur!</a>
              </div>
            </div>
          `;
        }

        window._push(window._ref, {
          name: "Panitia Drama Arena 5101",
          message: finalReply,
          timestamp: window._serverTimestamp(),
          isAdmin: false,
          color: "#ff5500ff"
        }).catch(e => console.error("Bot Reply Error:", e));
      });
    } 
    // 3. AI Small Talk (Halo, Syukron, dll)
    else {
      const aiReply = getSmartAIResponse(normalizedInput, text);
      if (aiReply) {
        showBotTyping(() => {
          window._push(window._ref, {
            name: "Panitia Drama Arena 5101",
            message: aiReply,
            timestamp: window._serverTimestamp(),
            isAdmin: false,
            color: "#ff5500ff"
          });
        }, 1500);
      }
    }
  }).catch(err => {
    showToast('❌ Gagal kirim. Coba lagi.');
    console.error(err);
  }).finally(() => {
    setTimeout(() => { btn.disabled = false; input.focus(); }, SEND_DELAY_MS);
  });
}

window.handleCameraUpload = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Batasi 3 MB
  if (file.size > 8 * 1024 * 1024) {
    showToast('❌ Ukuran gambar maksimal 3 MB');
    event.target.value = "";
    return;
  }

  showToast('⏳ Mengompres & Mengirim...');
  
  // Kompresi Gambar sebelum upload
  compressImage(file, 0.8, 1280).then((compressedBlob) => {
    const fileName = `img_${Date.now()}.jpg`;
    const storageRef = window._sRef(window._storage, `chat_images/${fileName}`);

    return window._uploadBytes(storageRef, compressedBlob).then((snapshot) => {
      return window._getDownloadURL(snapshot.ref);
    });
  }).then((url) => {
    const payload = {
      name:      currentUser,
      message:   "📷 Foto",
      imageUrl:  url,
      type:      "image",
      timestamp: window._serverTimestamp()
    };
    return window._push(window._ref, payload);
  }).then(() => {
    showToast('✅ Gambar terkirim!');
    event.target.value = "";
  }).catch(err => {
    showToast('❌ Gagal upload. Coba lagi.');
    console.error(err);
  });
};

function compressImage(file, quality, maxWidth) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

window.deleteMessage = function(key) {
  const modal = document.getElementById('confirmModal');
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  
  modal.classList.remove('hidden');
  
  // Clean up previous event listeners
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  
  newConfirmBtn.onclick = () => {
    window._remove(window._child(window._ref, key)).then(() => {
      showToast('🗑️ Pesan dihapus');
      closeConfirmModal();
    }).catch(err => {
      showToast('❌ Gagal menghapus');
      console.error(err);
    });
  };
};

window.closeConfirmModal = function() {
  document.getElementById('confirmModal').classList.add('hidden');
};

/* ====================================================================
   🤖 SMART AI ENGINE (Simulated)
==================================================================== */

function showBotTyping(callback, delay = 1500) {
  const onlineEl = document.getElementById('onlineCount');
  const originalText = onlineEl.textContent;
  
  onlineEl.textContent = "Panitia sedang mengetik...";
  onlineEl.style.color = "var(--wa-accent)";
  
  setTimeout(() => {
    onlineEl.textContent = originalText;
    onlineEl.style.color = "";
    callback();
  }, delay);
}

function getSmartAIResponse(normalized, original) {
  // 1. GREETINGS
  if (normalized.includes("assalam") || normalized.includes("assalamu'alaikum") || normalized.includes("assalaamu'alaykum")||normalized.includes("asalamualaikum")) return "Wa'alaikumussalam warahmatullah ustadz! 🙏 Ada yang bisa saya bantu terkait info Drama Arena 5101?";
  if (normalized.includes("halo") || normalized.includes("hello") || normalized.includes("hai")) return "Halo ustadz! Selamat datang di grup resmi DA 5101. Silakan tanya apa saja ya! 😊";
  if (normalized.includes("pagi")) return "Selamat pagi ustadz! Semangat untuk hari ini! 🔥";
  if (normalized.includes("siang")) return "Selamat siang ustadz! Jangan lupa istirahat ya.";
  if (normalized.includes("malam")) return "Selamat malam ustadz! Selamat beristirahat.";
  if (normalized.includes("izin") || normalized.includes("ijin ")||normalized.includes("izin ")||normalized.includes("izin join")||normalized.includes("izin...")) return "Ahlan ustadz!🔥🙏";

  // 2. APPRECIATION
  if (normalized.includes("keren") || normalized.includes("mantap") || normalized.includes("jos") || normalized.includes("menyala")) {
    return "MasyaAllah, syukron tadz! Doakan semoga acaranya nanti benar-benar menyala dan lancar jaya! 🔥🔥";
  }
  if (normalized.includes("syukron") || normalized.includes("makasih") || normalized.includes("terima kasih") || normalized.includes("jazakallah")) {
    return "Afwan ustadz, sudah menjadi tugas kami melayani para tamu undangan dengan baik. 🙏✨";
  }
  if (normalized.includes("amiin") || normalized.includes("amin") || normalized.includes("insyaallah")) {
    return "Aamiin ya Allah... Terima kasih banyak atas doanya ustadz! 🤲";
  }

  // 3. IDENTITY
  if (normalized.includes("siapa kamu") || normalized.includes("nama kamu")) {
    return "Saya adalah Asisten Digital Panitia Drama Arena 5101. Saya siap membantu ustadz 24 jam di grup ini! 🤖🔥";
  }

  // 4. FALLBACK (Jika memanggil admin)
  if (normalized.includes("min") || normalized.includes("admin") || normalized.includes("panitia") || original.includes("@")) {
    return "Waduh, kalau itu saya kurang tahu ustadz... 🙏 coba saya tanyakan ke Ketua Panitia dulu ya! Nanti saya kabari lagi.";
  }

  return null; // Tidak merespon jika obrolan tidak relevan
}

/* ====================================================================
   UI RENDERING LOGIC
==================================================================== */

function appendBubble(msg, isOwn, key = null) {
  const chatArea = document.getElementById("chatArea");
  
  // Use Date.now() fallback if serverTimestamp hasn't resolved locally
  const msgTime = msg.timestamp || Date.now();
  const msgDate = new Date(msgTime);
  const dateLabel = formatDate(msgDate);
  const timeStr = formatTime(msgDate);

  if (dateLabel !== lastDateLabel) {
    lastDateLabel = dateLabel;
    const divider = document.createElement("div");
    divider.className = "date-divider";
    divider.innerHTML = `<span>${dateLabel}</span>`;
    chatArea.appendChild(divider);
  }

  if (msg.isAdmin) {
    const sys = document.createElement("div");
    sys.className = "bubble-system";
    sys.innerHTML = `🛡️ <strong>Sistem</strong>: ${msg.message}`;
    chatArea.appendChild(sys);
    return;
  }

  const wrap = document.createElement("div");
  wrap.className = `bubble-wrap ${isOwn ? "out" : "in"}`;
  wrap.dataset.msgText = msg.message;
  if (key) wrap.dataset.msgId = key;

  let nameHtml = "";
  if (!isOwn) {
    const color = msg.color || hashColor(msg.name);
    nameHtml = `<div class="bubble-name" style="color: ${color}">${msg.name}</div>`;
  }

  let replyHtml = '';
  if (msg.replyTo) {
    replyHtml = `
      <div class="quoted-msg">
        <div class="quoted-name">${escapeHtml(msg.replyTo.name)}</div>
        <div class="quoted-text">${msg.replyTo.text}</div>
      </div>
    `;
  }

  const tickHtml = isOwn ? `<span class="bubble-tick"><svg viewBox="0 0 16 15" width="16" height="15" fill="currentColor"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/></svg></span>` : "";

  let messageHtml = `<div class="message-text">${msg.message}</div>`;
  if (msg.type === 'image') {
    messageHtml = `
      <div class="message-image" style="margin-top:4px;">
        <img src="${msg.imageUrl}" style="width:100%; max-width:240px; border-radius:8px; cursor:pointer; display:block;" onclick="openImage(this.src)" />
      </div>
    `;
  }

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = `
    ${replyHtml}
    ${messageHtml}
    <div class="bubble-meta">
      <span class="bubble-time">${timeStr}</span>
      ${tickHtml}
    </div>
  `;

  // Tambahkan dropdown reply untuk semua pesan (bukan admin static)
  if (!wrap.classList.contains('admin-static')) {
    const isWhitelisted = checkAdminStatus();
    let deleteBtnHtml = '';
    
    if (key && (isOwn || isWhitelisted)) {
      deleteBtnHtml = `<button onclick="deleteMessage('${key}')" style="color:#ff4444; font-weight:600;"><span>🗑️</span> Hapus</button>`;
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'bubble-dropdown';
    dropdown.innerHTML = `
      <button class="bubble-dropdown-btn" onclick="toggleBubbleDropdown(this)">⋮</button>
      <div class="bubble-dropdown-list">
        <button onclick="replyToMessageDropdown(this)"><span>↩️</span> Reply</button>
        ${deleteBtnHtml}
      </div>
    `;
    bubble.appendChild(dropdown);
  }

  wrap.innerHTML = nameHtml;
  wrap.appendChild(bubble);

  chatArea.appendChild(wrap);
}

// Dropdown reply logic
window.toggleBubbleDropdown = function(btn) {
  const list = btn.nextElementSibling;
  const currentWrap = btn.closest('.bubble-wrap');
  
  document.querySelectorAll('.bubble-dropdown-list.show').forEach(el => {
    if (el !== list) {
      el.classList.remove('show');
      el.closest('.bubble-wrap').style.zIndex = '';
    }
  });
  
  const isShowing = list.classList.toggle('show');
  currentWrap.style.zIndex = isShowing ? '100' : '';
  
  // Close on click outside
  setTimeout(() => {
    function close(e) {
      if (!list.contains(e.target) && e.target !== btn) {
        list.classList.remove('show');
        currentWrap.style.zIndex = '';
        document.removeEventListener('mousedown', close);
      }
    }
    document.addEventListener('mousedown', close);
  }, 10);
};

window.replyToMessageDropdown = function(btn) {
  const bubbleWrap = btn.closest('.bubble-wrap');
  replyToBubble(bubbleWrap);
  const list = btn.closest('.bubble-dropdown-list');
  list.classList.remove('show');
  bubbleWrap.style.zIndex = '';
};

function scrollToBottom() {
  const chat = document.getElementById("chatArea");
  chat.scrollTop = chat.scrollHeight;
  unreadCount = 0;
  updateUnreadBadge();
}

function updateUnreadBadge() {
  const badge = document.getElementById("unreadBadge");
  if (unreadCount > 0) {
    badge.textContent = unreadCount > 9 ? "9+" : unreadCount;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

/* ============================
   SWIPE TO REPLY LOGIC
   ============================ */
let swipeStartX = 0;
let swipeCurrentX = 0;
let isSwiping = false;
let swipedBubble = null;
let replyIndicator = null;

function handleDragStart(e, clientX) {
  const bubble = e.target.closest('.bubble-wrap');
  if (!bubble || bubble.classList.contains('admin-static')) return;
  if (e.target.tagName === 'IMG' || e.target.tagName === 'BUTTON') return;

  swipedBubble = bubble;
  swipeStartX = clientX;
  swipeCurrentX = clientX;
  isSwiping = true;
  swipedBubble.style.transition = 'none';
  
  replyIndicator = document.createElement('div');
  replyIndicator.innerHTML = '↩️';
  replyIndicator.style.position = 'absolute';
  replyIndicator.style.left = '-30px';
  replyIndicator.style.top = '50%';
  replyIndicator.style.transform = 'translateY(-50%) scale(0)';
  replyIndicator.style.transition = 'transform 0.1s, opacity 0.1s';
  replyIndicator.style.opacity = '0';
  replyIndicator.style.background = 'rgba(255,255,255,0.9)';
  replyIndicator.style.borderRadius = '50%';
  replyIndicator.style.width = '24px';
  replyIndicator.style.height = '24px';
  replyIndicator.style.display = 'flex';
  replyIndicator.style.alignItems = 'center';
  replyIndicator.style.justifyContent = 'center';
  replyIndicator.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
  replyIndicator.style.fontSize = '12px';
  replyIndicator.style.zIndex = '10';
  swipedBubble.style.position = 'relative';
  swipedBubble.appendChild(replyIndicator);
}

function handleDragMove(e, clientX) {
  if (!isSwiping || !swipedBubble) return;
  swipeCurrentX = clientX;
  const diff = swipeCurrentX - swipeStartX;
  
  if (diff > 0 && diff < 80) {
    swipedBubble.style.transform = `translateX(${diff}px)`;
    if (replyIndicator) {
      const progress = Math.min(diff / 50, 1);
      replyIndicator.style.transform = `translateY(-50%) scale(${progress})`;
      replyIndicator.style.opacity = progress;
    }
  }
}

function handleDragEnd(e) {
  if (!isSwiping || !swipedBubble) return;
  const diff = swipeCurrentX - swipeStartX;
  
  swipedBubble.style.transition = 'transform 0.2s ease-out';
  swipedBubble.style.transform = 'translateX(0)';
  
  if (replyIndicator) {
    replyIndicator.remove();
    replyIndicator = null;
  }
  
  if (diff > 50) {
    replyToBubble(swipedBubble);
  }
  
  isSwiping = false;
  swipedBubble = null;
}

const chatAreaEl = document.getElementById('chatArea');
if(chatAreaEl) {
  chatAreaEl.addEventListener('touchstart', (e) => handleDragStart(e, e.touches[0].clientX), { passive: true });
  chatAreaEl.addEventListener('touchmove', (e) => handleDragMove(e, e.touches[0].clientX), { passive: true });
  chatAreaEl.addEventListener('touchend', handleDragEnd);

  chatAreaEl.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    handleDragStart(e, e.clientX);
  });
  document.addEventListener('mousemove', (e) => {
    if (isSwiping) handleDragMove(e, e.clientX);
  });
  document.addEventListener('mouseup', (e) => {
    if (isSwiping) handleDragEnd(e);
  });
}

function replyToBubble(bubbleWrap) {
  const senderName = bubbleWrap.querySelector('.bubble-name')?.textContent || 'Someone';
  const messageText = bubbleWrap.dataset.msgText || bubbleWrap.querySelector('.message-text')?.innerText || bubbleWrap.querySelector('.bubble').innerText.split('\n')[0];
  
  replyingTo = { name: senderName, text: messageText };
  
  document.getElementById('replyPreviewName').textContent = senderName;
  document.getElementById('replyPreviewText').textContent = messageText;
  document.getElementById('replyPreviewBar').classList.remove('hidden');
  
  const input = document.getElementById('msgInput');
  input.focus();
}

window.cancelReply = function() {
  replyingTo = null;
  document.getElementById('replyPreviewBar').classList.add('hidden');
}

/* ============================
   BOT COMMANDS
   ============================ */
window.checkCommand = function(val) {
  const popup = document.getElementById('commandPopup');
  if (!popup) return;
  
  if (val.startsWith('@')) {
    const search = val.toLowerCase();
    const matches = APP_CONFIG.botCommands.filter(c => c.command.toLowerCase().startsWith(search));
    
    if (matches.length > 0) {
      popup.innerHTML = matches.map(c => `
        <div style="padding:10px 12px; border-bottom:1px solid var(--glass-border); cursor:pointer; color:var(--wa-text);" onclick="selectCommand('${c.command}')">
          <div style="font-weight:600; color:#00a884; font-size:14px;">${c.command}</div>
          <div style="font-size:12px; opacity:0.8;">${c.description}</div>
        </div>
      `).join('');
      popup.classList.remove('hidden');
    } else {
      popup.classList.add('hidden');
    }
  } else {
    popup.classList.add('hidden');
  }
};

window.selectCommand = function(cmd) {
  const input = document.getElementById('msgInput');
  if (!input) return;
  input.value = cmd + ' ';
  document.getElementById('commandPopup').classList.add('hidden');
  input.focus();
  
  // Update tinggi textarea & check command lagi
  if (window.handleInput) window.handleInput(input);
  window.checkCommand(input.value);
};


/* ============================
   IMAGE VIEWER MODAL
   ============================ */
window.openImage = function(src) {
  let viewer = document.getElementById('imageViewer');
  if (!viewer) {
    viewer = document.createElement('div');
    viewer.id = 'imageViewer';
    viewer.className = 'modal-overlay';
    viewer.style.zIndex = '9999';
    viewer.innerHTML = `
      <div style="position:relative; width:90%; max-width:500px; animation: modalIn 0.3s ease-out;">
        <button style="position:absolute; top:-40px; right:0; background:none; border:none; color:#fff; font-size:28px; cursor:pointer;" onclick="closeImageViewer()">✕</button>
        <img id="viewerImage" src="" style="width:100%; border-radius:12px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);" />
      </div>
    `;
    document.body.appendChild(viewer);
    
    viewer.addEventListener('click', (e) => {
      if (e.target === viewer) closeImageViewer();
    });
  }
  
  document.getElementById('viewerImage').src = src;
  viewer.classList.remove('hidden');
};

window.closeImageViewer = function() {
  document.getElementById('imageViewer').classList.add('hidden');
};


function openInfo() {
  const panel = document.getElementById("infoPanel");
  panel.classList.remove("hidden"); // ensure display:flex via hidden override
  requestAnimationFrame(() => panel.classList.add("open"));
}
function closeInfo() {
  const panel = document.getElementById("infoPanel");
  panel.classList.remove("open");
  // don't add hidden: keep panel in DOM with transform for animation
}

window.changeProfilePic = function() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        localStorage.setItem('group_profile_pic', ev.target.result);
        const profilePic = document.querySelector('.group-profile-pic');
        if(profilePic) {
          profilePic.style.backgroundImage = `url(${ev.target.result})`;
          profilePic.style.backgroundSize = 'cover';
          profilePic.style.backgroundPosition = 'center';
          const emoji = profilePic.querySelector('.profile-pic-emoji');
          if(emoji) emoji.style.display = 'none';
        }
        showToast('✅ Foto profil grup diganti!');
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
};

/* Call Simulation */
let voiceAudio = null;
let audioCtx = null;
let beepInterval = null;

function playBeep() {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let count = 0;
    beepInterval = setInterval(() => {
      if (count++ > 10) { clearInterval(beepInterval); return; }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 420;
      gain.gain.setValueAtTime(.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + .4);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + .4);
    }, 700);
  } catch(e) {}
}

function stopBeep() {
  clearInterval(beepInterval);
  if (audioCtx) { audioCtx.close(); audioCtx = null; }
}

window.startCall = function() {
  document.getElementById("callModal").classList.remove("hidden");
  document.getElementById("callStatus").textContent = `Memanggil...`;
  
  playBeep();
  
  clearTimeout(callTimer);
  callTimer = setTimeout(() => {
    stopBeep();
    document.getElementById("callStatus").textContent = "Terhubung (00:01)";
    document.getElementById("callStatus").style.color = "#ff5e00ff";
    
    if (APP_CONFIG.voiceCallAudio) {
      if (!voiceAudio) {
        voiceAudio = new Audio(APP_CONFIG.voiceCallAudio);
      }
      voiceAudio.loop = false; // Disable loop to detect end
      voiceAudio.onended = endCall; // Auto-end when finished
      voiceAudio.currentTime = 0;
      voiceAudio.play().catch(e => console.warn('Autoplay blocked:', e));
    }
  }, 3000);
};

window.endCall = function() {
  clearTimeout(callTimer);
  stopBeep();
  if (voiceAudio) {
    voiceAudio.pause();
    voiceAudio.currentTime = 0;
  }

  // Animasi Call Ended
  const statusEl = document.getElementById("callStatus");
  statusEl.textContent = "Panggilan Berakhir";
  statusEl.style.color = "#ff3b30";
  
  setTimeout(() => {
    document.getElementById("callModal").classList.add("hidden");
    statusEl.style.color = "";
    showToast("📵 Panggilan diakhiri");
  }, 1500);
};

window.startVideoCall = function() {
  document.getElementById("videoModal").classList.remove("hidden");
  const vid = document.getElementById('videoPlayer');
  if (vid) {
    vid.muted = false; 
    vid.volume = 0.8;
    vid.onended = endVideoCall; // Auto-end when video finished
    vid.play().catch(() => {
      vid.muted = true;
      vid.play().catch(() => {});
    });
  }
};

window.endVideoCall = function() {
  const vid = document.getElementById('videoPlayer');
  if (vid) {
    vid.pause();
    vid.muted = true;
    vid.currentTime = 0;
  }

  // Animasi Call Ended
  const statusEl = document.getElementById("videoCallerName");
  if (statusEl) {
    statusEl.textContent = "Panggilan Berakhir";
    statusEl.parentElement.style.background = "#ff3b30";
  }

  setTimeout(() => {
    document.getElementById("videoModal").classList.add("hidden");
    if (statusEl) {
      statusEl.textContent = "Drama Arena 5101 • Live";
      statusEl.parentElement.style.background = "";
    }
    showToast("📵 Video call diakhiri");
  }, 1500);
};

/* Emoji */
function toggleEmojiPicker() {
  document.getElementById("emojiPicker").classList.toggle("open");
}
function closeEmojiPicker() {
  document.getElementById("emojiPicker").classList.remove("open");
}
function insertEmoji(emoji) {
  const input = document.getElementById("msgInput");
  input.value += emoji;
  input.focus();
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.emoji-btn') && !e.target.closest('.emoji-picker')) {
    closeEmojiPicker();
  }
});

/* Utils */
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function formatTime(date) {
  if(isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date) {
  if(isNaN(date.getTime())) return "";
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hari ini";
  if (date.toDateString() === yesterday.toDateString()) return "Kemarin";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

const NAME_COLORS = ['#00a884','#e53935','#d81b60','#8e24aa','#3949ab','#039be5','#00897b','#43a047','#f4511e'];
function hashColor(name) {
  if(!name) return NAME_COLORS[0];
  let h = 0;
  for(let i=0; i<name.length; i++) h = name.charCodeAt(i) + ((h<<5)-h);
  return NAME_COLORS[Math.abs(h) % NAME_COLORS.length];
}

function simulateOnlineCount() {
  const el = document.getElementById("onlineCount");
  setInterval(() => {
    el.textContent = `734 peserta • ${Math.floor(Math.random()*40)+300} online`;
  }, 10000);
  el.textContent = `734 peserta • 312 online`;
}

function showToast(msg) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 3000);
}

/* ---- TEXT NORMALIZATION (For Banned Words) ---- */
function normalizeText(text) {
  let normalized = text.toLowerCase();
  
  // 1. Map symbols/numbers to letters (Leetspeak)
  const map = {
    '4': 'a', '@': 'a',
    '3': 'e',
    '1': 'i', '!': 'i',
    '0': 'o',
    '5': 's', '$': 's',
    '7': 't',
    '8': 'b',
    'v': 'u',
    '9': 'g'
  };
  
  normalized = normalized.split('').map(char => map[char] || char).join('');
  
  // 2. Remove non-alphanumeric characters (dots, spaces, symbols between letters)
  normalized = normalized.replace(/[^a-z0-9]/g, '');
  
  // 3. Collapse repeated characters (e.g., "annnnjjing" -> "anjing")
  // Note: This might cause false positives for some normal words, 
  // but it's very effective for profanity.
  normalized = normalized.replace(/(.)\1+/g, '$1');
  
  return normalized;
}

window.handleInput = function(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
  
  // Jika melebihi batas (set di CSS max-height: 120px)
  if (el.scrollHeight > 120) {
    el.style.overflowY = 'auto';
  } else {
    el.style.overflowY = 'hidden';
  }
};

/* ---- INTERACTIVE REACTIONS ---- */
window.sendReaction = function(emoji) {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => createFloatingEmoji(emoji), i * 100);
  }
  
  // Optional: Send to Firebase so others see it (if you want it to be real-time)
  // For now, keep it local for instant feedback
};

function createFloatingEmoji(emoji) {
  const el = document.createElement('div');
  el.className = 'floating-emoji';
  el.textContent = emoji;
  
  // Randomize position slightly
  const randomX = Math.floor(Math.random() * 100) - 50;
  el.style.right = (50 + randomX) + 'px';
  
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

function checkMessageKeywords(text) {
  const normalizedText = normalizeText(text);
  const reactions = {
    '🔥': ['menyala', 'api', 'hot', 'jos', 'keren'],
    '🎉': ['selamat', 'congrats', 'party', 'mantap', 'hore'],
    '❤️': ['love', 'sayang', 'cinta', 'suka', 'heart'],
    '👏': ['hebat', 'pintar', 'tangan', 'salut', 'wow']
  };

  for (const [emoji, keywords] of Object.entries(reactions)) {
    if (keywords.some(k => {
      const normalizedK = normalizeText(k);
      return normalizedText.includes(normalizedK);
    })) {
      window.sendReaction(emoji);
      break; 
    }
  }
}

/* ---- AUTO CALL LOGIC ---- */
let autoCallTimer = null;
let swipeStartY = 0;
let isSwipingUp = false;

function checkAutoCall() {
  if (!APP_CONFIG.autoCall.enabled) return;
  
  // Reset timer if already exists
  if (autoCallTimer) clearTimeout(autoCallTimer);
  
  autoCallTimer = setTimeout(() => {
    showIncomingCall();
  }, APP_CONFIG.autoCall.delayMs);
}

function showIncomingCall() {
  const overlay = document.getElementById('incomingCallOverlay');
  if (!overlay) return;
  
  document.getElementById('incomingCallName').textContent = APP_CONFIG.autoCall.callerName;
  const avatarEl = document.getElementById('incomingCallAvatar');
  if (APP_CONFIG.groupAvatar.length <= 2) {
    avatarEl.textContent = APP_CONFIG.groupAvatar;
  } else {
    avatarEl.innerHTML = `<img src="${APP_CONFIG.groupAvatar}" class="avatar-img-auto" />`;
  }
  
  overlay.classList.remove('hidden');
  
  // Play ringtone (Simple "ting ting")
  const tingSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
  tingSound.loop = true;
  overlay._ringtone = tingSound;
  tingSound.play().catch(() => {});
  
  initSwipeUp();
}

function initSwipeUp() {
  const swipeArea = document.getElementById('swipeAccept');
  if (!swipeArea) return;
  
  const handleStart = (y) => {
    swipeStartY = y;
    isSwipingUp = true;
  };
  
  const handleMove = (y) => {
    if (!isSwipingUp) return;
    const diff = swipeStartY - y;
    if (diff > 0) {
      // Swipe up effect
      const overlay = document.getElementById('incomingCallOverlay');
      overlay.style.transform = `translateY(-${diff}px)`;
      overlay.style.opacity = 1 - (diff / 500);
    }
  };
  
  const handleEnd = (y) => {
    if (!isSwipingUp) return;
    const diff = swipeStartY - y;
    const overlay = document.getElementById('incomingCallOverlay');
    
    if (diff > 150) {
      // Accept call
      acceptIncomingCall();
    } else {
      // Snap back
      overlay.style.transform = '';
      overlay.style.opacity = '';
    }
    isSwipingUp = false;
  };
  
  swipeArea.addEventListener('touchstart', (e) => handleStart(e.touches[0].clientY));
  swipeArea.addEventListener('touchmove', (e) => handleMove(e.touches[0].clientY));
  swipeArea.addEventListener('touchend', (e) => handleEnd(e.changedTouches[0].clientY));
  
  swipeArea.addEventListener('mousedown', (e) => handleStart(e.clientY));
  window.addEventListener('mousemove', (e) => handleMove(e.clientY));
  window.addEventListener('mouseup', (e) => handleEnd(e.clientY));
}

window.acceptIncomingCall = function() {
  // 🔥 NEW: Clear call status
  sessionStorage.setItem('callStatus', 'accepted');
  
  const overlay = document.getElementById('incomingCallOverlay');
  if (overlay._ringtone) {
    overlay._ringtone.pause();
  }
  overlay.classList.add('hidden');
  overlay.style.transform = '';
  overlay.style.opacity = '';
  
  // Start Video Call with specific video
  const videoModal = document.getElementById('videoModal');
  videoModal.classList.remove('hidden');
  const vid = document.getElementById('videoPlayer');
  if (vid) {
    vid.src = APP_CONFIG.autoCall.videoSrc;
    vid.muted = false;
    vid.play().catch(() => {
      vid.muted = true;
      vid.play().catch(() => {});
    });
  }
};

window.rejectIncomingCall = function() {
  const btn = document.querySelector('.reject-call-btn');
  if (btn) {
    btn.style.animation = 'shake 0.3s';
    setTimeout(() => btn.style.animation = '', 300);
    
    // Move the button randomly to make it hard to press?
    const randomX = Math.floor(Math.random() * 40) - 20;
    const randomY = Math.floor(Math.random() * 40) - 20;
    btn.style.transform = `translate(${randomX}px, ${randomY}px)`;
  }
  
  showToast("Eits, harus dijawab dong! 🔥");
};

/* ---- EXPANDABLE CONTENT ---- */
window.toggleExpand = function(id, btn) {
  const container = document.getElementById(id);
  if (!container) return;
  
  const isExpanded = container.classList.toggle('expanded');
  btn.textContent = isExpanded ? 'Lihat sedikit' : 'Lihat selengkapnya';
};
