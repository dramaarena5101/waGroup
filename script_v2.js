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
    { time: "07.00", text: "Registrasi & Pembukaan" },
    { time: "08.00", text: "Sambutan Panitia & Doa" },
    { time: "09.00", text: "Penampilan Paduan Suara" },
    { time: "10.00", text: "Drama & Teater Kolosal" },
    { time: "11.30", text: "Istirahat & Makan Siang" },
    { time: "13.00", text: "Tari Tradisional & Modern" },
    { time: "14.30", text: "Band & Akustik" },
    { time: "16.00", text: "Pembagian Hadiah & Penutup" }
  ],
  location: {
    text: "Depan Gedung Aula Utama<br/>Pondok Modern Darussalam Gontor<br/>Ponorogo, Jawa Timur",
    link: "https://maps.google.com/?q=Gedung+Aula+Utama+Pondok+Modern+Darussalam+Gontor+Ponorogo"
  },
  rules: [
    "Sopan dan saling menghormati",
    "Dilarang spam / SARA",
    "Kirim ucapan positif!",
    "Nikmati acaranya 🎊"
  ],

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
    { command: "@guidebook", description: "Dapatkan link Guide Book resmi", reply: "📚 Guide Book: <a href='assets/guide-book.pdf' target='_blank' style='color:#00a884;font-weight:bold;'>Download di sini</a>" },

    { command: "@susunanacara", description: "Lihat rundown / susunan acara", reply: "📅 <b>Susunan Acara:</b><br/>07.00 - Registrasi & Pembukaan<br/>08.00 - Sambutan Panitia & Doa<br/>09.00 - Penampilan Paduan Suara<br/>10.00 - Drama & Teater Kolosal<br/>11.30 - Istirahat & Makan Siang<br/>13.00 - Tari Tradisional & Modern<br/>14.30 - Band & Akustik<br/>16.00 - Pembagian Hadiah & Penutup" },

    { command: "@lokasi", description: "Lihat info lokasi acara", reply: "📍 Lokasi: Gedung Aula Utama, Pondok Modern Darussalam Gontor. <a href='https://maps.google.com/?q=Gedung+Aula+Utama+Pondok+Modern+Darussalam+Gontor+Ponorogo' target='_blank' style='color:#00a884;font-weight:bold;'>Buka di Google Maps</a>" }
  ],

  // -- PESAN STATIS AWAL --

  staticMessages: [
    { sender: "Panitia Drama Arena 5101", color: "#ff5500ff", time: "08.00", content: "Ahlan wa sahlan ust <b>{name}</b>! 🎉\n di grup resmi Drama Arena 5101! Di sini bisa sharing info, tanya-tanya, dan dukung para penampil! 🔥" },

    { sender: "Panitia Drama Arena 5101", color: "#ff5500ff", time: "08.01", content: `In Syaa Allah Untuk📍Lokasi acara kami share location ust: <a href="https://maps.google.com/?q=Gedung+Aula+Utama+Pondok+Modern+Darussalam+Gontor+Ponorogo" target="_blank" style="color:#00a884;font-weight:bold;">Lihat di Google Maps</a>` },

    { sender: "", color: "#2196F3", time: "08.02", content: "Boleh spil acara nanti gk min? 🧐", isOwn: true },

    { sender: "Panitia Drama Arena 5101", color: "#ff5500ff", time: "08.01", content: `Wih... boleh banget dong ust! <br> Ahlan ust <b>{name}</b> poster acara Drama Arena 5101 <br> tapi spil dikit dulu yaa...ust 🙏` },

    { sender: "Panitia Drama Arena 5101", color: "#ff5500ff", time: "08.01", content: `<img src="assets/6.jpeg" alt="Poster Drama" style="width:100%; border-radius:8px; cursor:pointer;" onclick="openImage(this.src)">` },

    { sender: "Panitia Drama Arena 5101", color: "#ff5500ff", time: "08.01", content: `<img src="assets/5.jpeg" alt="Poster Drama" style="width:100%; border-radius:8px; cursor:pointer;" onclick="openImage(this.src)">` },

    { sender: "", color: "#2196F3", time: "08.02", content: "Jos menyala 🔥Min, kalo link guide booknya ada gk? Biar kita bisa prepare sebelum nonton ", isOwn: true },

    { sender: "Panitia Drama Arena 5101", color: "#ff5500ff", time: "08.02", content: `Alhamdulilah sudah ada nih ust <b>{name}</b> Guide Booknya bisa  <a href="assets/guide-book.pdf" target="_blank" style="color:#00a884;font-weight:bold;">Unduh di sini</a> ya...😊` },
    
    { sender: "Panitia Drama Arena 5101", color: "#ff5500ff", time: "08.03", content: "Ahlan ustadz <b>{name}</b> bisa diramaikan grup ini ya, bisa share info dll 🎉 <br>sama nanti kalo butuh keperluan acara langsung tag mimin aja ya <br> Enjoy..." }
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
    descEl.innerHTML = APP_CONFIG.groupDescription;
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
    scheduleEl.innerHTML = APP_CONFIG.schedule.map(s => `
      <div style="display: flex; gap: 12px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--glass-border);">
        <div style="font-weight: 700; color: #00a884; min-width: 48px;">${s.time}</div>
        <div style="color: var(--wa-text);">${s.text}</div>
      </div>
    `).join('');
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
    currentUser = savedUser; // set DULU
    renderStaticMessages(); // baru render dengan nama yang benar
    document.getElementById("nameModal").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    initChat();
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

  // 🚫 Cek nama yang dilarang (kecuali device admin)
  if (!isWhitelisted) {
    const nameLower = name.toLowerCase().trim();
    const isBanned = APP_CONFIG.bannedNames.some(banned =>
      nameLower === banned.toLowerCase() ||
      nameLower.startsWith(banned.toLowerCase())
    );

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

    const matchedCommand = APP_CONFIG.botCommands.find(c => text.toLowerCase().includes(c.command.toLowerCase()));
    if (matchedCommand) {
      setTimeout(() => {
        window._push(window._ref, {
          name: "Panitia",
          message: matchedCommand.reply,
          timestamp: window._serverTimestamp(),
          isAdmin: false,
          color: "#E91E63"
        });
      }, 1000);
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
  if (file.size > 3 * 1024 * 1024) {
    showToast('❌ Ukuran gambar maksimal 3 MB');
    event.target.value = "";
    return;
  }

  showToast('⏳ Mengirim gambar...');
  
  const fileName = `img_${Date.now()}.jpg`;
  const storageRef = window._sRef(window._storage, `chat_images/${fileName}`);

  window._uploadBytes(storageRef, file).then((snapshot) => {
    return window._getDownloadURL(snapshot.ref);
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
  document.querySelectorAll('.bubble-dropdown-list.show').forEach(el => {
    if (el !== list) el.classList.remove('show');
  });
  list.classList.toggle('show');
  
  // Close on click outside
  setTimeout(() => {
    function close(e) {
      if (!list.contains(e.target) && e.target !== btn) {
        list.classList.remove('show');
        document.removeEventListener('mousedown', close);
      }
    }
    document.addEventListener('mousedown', close);
  }, 10);
};

window.replyToMessageDropdown = function(btn) {
  const bubbleWrap = btn.closest('.bubble-wrap');
  replyToBubble(bubbleWrap);
  btn.closest('.bubble-dropdown-list').classList.remove('show');
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
