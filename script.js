/* ================================================
   PENTAS SENI 2026 — script.js
   ================================================ */

/* ---- STATE ---- */
let currentUser   = null;
let lastSendTime  = 0;
let unreadCount   = 0;
let lastDateLabel = '';
let callTimer     = null;
let replyingTo    = null; // { name, text, id }

const SEND_DELAY_MS = 2000;   // anti-spam
const MSG_LIMIT     = 100;    // pesan terakhir

/* ---- CONFIGURATION ---- */
const APP_CONFIG = {
  groupName: "Drama Arena 5101",
  groupAvatar: "assets/poster-acara-1.jpg", // Menggunakan poster sebagai avatar default
  groupBanner: "assets/poster-acara-1.jpg", // Background untuk bagian atas Info Grup
  pageTitle: "Drama Arena 5101 – Grup WhatsApp",
  
  // -- PENGATURAN INFO GRUP --
  groupDescription: "Selamat datang di grup resmi Drama Arena 5101! Di sini kamu bisa mengirim ucapan, berbagi momen, dan menyaksikan keseruan acara bersama. Mari saling mendukung para penampil! 🎉",
  eventPosters: [
    { src: 'assets/poster-acara-1.jpg', label: 'Drama' },
    { src: 'assets/poster-acara-2.jpg', label: 'Paduan Suara' },
    { src: 'assets/poster-acara-3.jpg', label: 'Tari' },
    { src: 'assets/poster-acara-4.jpg', label: 'Band' }
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
    text: "Gedung Aula Utama<br/>Pondok Modern Darussalam Gontor<br/>Ponorogo, Jawa Timur",
    link: "https://maps.google.com/?q=Gedung+Aula+Utama+Pondok+Modern+Darussalam+Gontor+Ponorogo"
  },
  rules: [
    "Sopan dan saling menghormati",
    "Dilarang spam / SARA",
    "Kirim ucapan positif!",
    "Nikmati acaranya 🎊"
  ],

  // -- PENGATURAN BOT KEYWORD --
  botCommands: [
    { command: "@guidebook", description: "Dapatkan link Guide Book resmi", reply: "📚 Guide Book: <a href='assets/guide-book.pdf' target='_blank' class='welcome-link'>Download di sini</a>" },
    { command: "@susunanacara", description: "Lihat rundown / susunan acara", reply: "📅 <b>Susunan Acara:</b><br/>07.00 - Registrasi & Pembukaan<br/>08.00 - Sambutan Panitia & Doa<br/>09.00 - Penampilan Paduan Suara<br/>10.00 - Drama & Teater Kolosal<br/>11.30 - Istirahat & Makan Siang<br/>13.00 - Tari Tradisional & Modern<br/>14.30 - Band & Akustik<br/>16.00 - Pembagian Hadiah & Penutup" },
    { command: "@lokasi", description: "Lihat info lokasi acara", reply: "📍 Lokasi: Gedung Aula Utama, Pondok Modern Darussalam Gontor. <a href='https://maps.google.com/?q=Gedung+Aula+Utama+Pondok+Modern+Darussalam+Gontor+Ponorogo' target='_blank' class='welcome-link'>Buka di Google Maps</a>" }
  ],

  // -- PENGATURAN AUDIO --
  voiceCallAudio: "assets/voice-call.mp3", // File MP3 untuk simulasi obrolan saat menelepon

  // -- PENGATURAN TEMA --
  theme: {
    chatBackgroundColor: "#ECE5DD", // Warna background dasar chat
    headerColor: "#075E54",         // Warna header (hijau gelap khas WA)
    bubbleOutColor: "#DCF8C6",      // Warna bubble pesan yang kita kirim
  },

  // -- PESAN STATIS AWAL --
  staticMessages: [
    { sender: "Panitia", color: "#E91E63", time: "08.00", content: "Selamat datang di grup resmi Drama Arena 5101! Di sini kamu bisa sharing info, tanya-tanya, dan dukung para penampil! 🔥" },
    { sender: "Panitia", color: "#E91E63", time: "08.01", content: `📍 Lokasi acara: <a href="https://maps.google.com/?q=Gedung+Aula+Utama+Pondok+Modern+Darussalam+Gontor+Ponorogo" target="_blank" class="welcome-link">Lihat di Google Maps</a>` },
    { sender: "Panitia", color: "#E91E63", time: "08.01", content: `🖼️ Berikut poster acara Drama Arena 5101:` },
    { sender: "Panitia", color: "#E91E63", time: "08.01", content: `<img src="assets/poster-acara-1.jpg" alt="Poster Drama" class="chat-poster-img" onclick="openImage(this.src)">` },
    { sender: "Panitia", color: "#E91E63", time: "08.01", content: `<img src="assets/poster-acara-2.jpg" alt="Poster Paduan Suara" class="chat-poster-img" onclick="openImage(this.src)">` },
    { sender: "Panitia", color: "#E91E63", time: "08.01", content: `<img src="assets/poster-acara-3.jpg" alt="Poster Tari" class="chat-poster-img" onclick="openImage(this.src)">` },
    { sender: "Panitia", color: "#E91E63", time: "08.01", content: `<img src="assets/poster-acara-4.jpg" alt="Poster Band" class="chat-poster-img" onclick="openImage(this.src)">` },
    { sender: "Andi", color: "#2196F3", time: "08.02", content: "Min, ada link guide booknya gk? Biar kita bisa prepare sebelum hari H 🎯", isOwn: true },
    { sender: "Panitia", color: "#E91E63", time: "08.02", content: `📚 Guide Book: <a href="assets/guide-book.pdf" target="_blank" class="welcome-link">Download di sini</a>` },
    { sender: "Panitia", color: "#E91E63", time: "08.03", content: "Yuk saling kenalan, share pengalaman, dan ramaikan chat ini! 🎉" }
  ]
};

function applyAppConfig() {
  const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  setText('pageTitle', APP_CONFIG.pageTitle);
  setText('welcomeGroupName', APP_CONFIG.groupName);
  setText('callGroupName', APP_CONFIG.groupName);
  setText('videoCallerName', APP_CONFIG.groupName + ' • Live');
  setText('infoGroupName', APP_CONFIG.groupName);
  setText('mainGroupName', APP_CONFIG.groupName);

  const setAvatar = (id, avatar) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (avatar.length <= 2) {
      el.textContent = avatar;
    } else {
      el.innerHTML = `<img src="${avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
    }
  };
  setAvatar('welcomeLogo', APP_CONFIG.groupAvatar);
  setAvatar('callAvatar', APP_CONFIG.groupAvatar);
  setAvatar('infoAvatar', APP_CONFIG.groupAvatar);
  setAvatar('mainAvatar', APP_CONFIG.groupAvatar);

  // Set Theme
  document.documentElement.style.setProperty('--wa-bg', APP_CONFIG.theme.chatBackgroundColor);
  document.documentElement.style.setProperty('--wa-header', APP_CONFIG.theme.headerColor);
  document.documentElement.style.setProperty('--wa-bubble-out', APP_CONFIG.theme.bubbleOutColor);

  // Set Info Banner
  const bannerEl = document.querySelector('.info-banner');
  if (bannerEl && APP_CONFIG.groupBanner) {
    bannerEl.style.backgroundImage = `url('${APP_CONFIG.groupBanner}')`;
    bannerEl.style.backgroundSize = 'cover';
    bannerEl.style.backgroundPosition = 'center';
  }

  // Set Info Panel Content
  const descEl = document.getElementById('configGroupDescription');
  if(descEl) descEl.innerHTML = APP_CONFIG.groupDescription;
  
  const postersEl = document.getElementById('configEventPosters');
  if (postersEl) {
    postersEl.innerHTML = APP_CONFIG.eventPosters.map(p => `
      <div class="event-img-item" onclick="openImage('${p.src}')">
        <div class="event-img-placeholder" style="background-image:url('${p.src}');background-size:cover;background-position:center;border-radius:8px;"></div>
        <span>${p.label}</span>
      </div>
    `).join('');
  }

  const scheduleEl = document.getElementById('configSchedule');
  if (scheduleEl) {
    scheduleEl.innerHTML = APP_CONFIG.schedule.map(s => `
      <div class="rundown-item"><span class="rundown-time">${s.time}</span><span>${s.text}</span></div>
    `).join('');
  }

  const locationEl = document.getElementById('configLocation');
  if (locationEl) {
    locationEl.innerHTML = `
      <a href="${APP_CONFIG.location.link}" target="_blank" class="location-link">
        <span class="location-icon">📍</span>
        <span>Lihat Lokasi di Maps →</span>
      </a>
      <p>${APP_CONFIG.location.text}</p>
    `;
  }

  const rulesEl = document.getElementById('configRules');
  if (rulesEl) {
    rulesEl.innerHTML = APP_CONFIG.rules.map(r => `<li>${r}</li>`).join('');
  }
}

function renderStaticMessages() {
  const chatArea = document.getElementById('chatArea');
  const loader = document.getElementById('chatLoader');
  
  APP_CONFIG.staticMessages.forEach(msg => {
    const wrap = document.createElement('div');
    wrap.className = `bubble-wrap admin-static ${msg.isOwn ? 'out' : 'in'}`;
    
    if (!msg.isOwn) {
      const nameEl = document.createElement('div');
      nameEl.className = 'bubble-name';
      nameEl.style.color = msg.color;
      nameEl.style.fontWeight = '800';
      nameEl.textContent = msg.sender;
      wrap.appendChild(nameEl);
    }
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = `
      ${msg.content}
      <div class="bubble-meta">
        <span class="bubble-time">${msg.time}</span>
        ${msg.isOwn ? '<span class="bubble-tick">✓✓</span>' : ''}
      </div>
    `;
    
    wrap.appendChild(bubble);
    chatArea.insertBefore(wrap, loader);
  });
}


/* ============================
   INIT
   ============================ */
document.addEventListener('DOMContentLoaded', () => {
  applyAppConfig();
  renderStaticMessages();
  
  // Attach input listener for commands
  const msgInput = document.getElementById('msgInput');
  if (msgInput) {
    msgInput.addEventListener('input', (e) => window.checkCommand(e.target.value));
  }

  const saved = localStorage.getItem('ps_username');
  if (saved) {
    currentUser = saved;
    hideModal('nameModal');
    initChat();
  } else {
    document.getElementById('nameInput').focus();
    document.getElementById('nameInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') joinChat();
    });
  }

  // Scroll-down button
  const chat = document.getElementById('chatArea');
  chat.addEventListener('scroll', () => {
    const btn = document.querySelector('.scroll-down-btn');
    const distFromBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight;
    if (distFromBottom > 120) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
      unreadCount = 0;
      updateScrollBadge();
    }
  });
});


// Fungsi joinChat agar tombol Gabung Sekarang bisa dipakai
function joinChat() {
  const name = document.getElementById('nameInput').value.trim();
  if (!name) {
    shake(document.getElementById('nameInput'));
    return;
  }
  currentUser = escapeHtml(name);
  localStorage.setItem('ps_username', currentUser);
  hideModal('nameModal');
  
  // Fullscreen on mobile
  const docEl = window.document.documentElement;
  const reqFS = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
  if(reqFS && window.innerWidth < 480) {
    reqFS.call(docEl).catch(()=>{});
  }
  
  initChat();
}
window.joinChat = joinChat;

function appendWelcomeMessage(msg) {
  const chatArea = document.getElementById('chatArea');
  
  const wrap = document.createElement('div');
  wrap.className = 'bubble-wrap in owner-msg';
  
  const nameEl = document.createElement('div');
  nameEl.className = 'bubble-name owner-name';
  nameEl.style.color = '#E91E63';
  nameEl.textContent = msg.name;
  wrap.appendChild(nameEl);
  
  const bubble = document.createElement('div');
  bubble.className = 'bubble owner-bubble';
  bubble.innerHTML = `
    ${msg.message}
    <div class="bubble-meta">
      <span class="bubble-time">${formatTime(new Date())}</span>
    </div>
  `;
  wrap.appendChild(bubble);
  chatArea.appendChild(wrap);
}

/* ============================
   IMAGE VIEWER MODAL
   ============================ */
function openImage(src) {
  // Create image viewer modal
  let viewer = document.getElementById('imageViewer');
  if (!viewer) {
    viewer = document.createElement('div');
    viewer.id = 'imageViewer';
    viewer.className = 'modal-overlay';
    viewer.innerHTML = `
      <div class="image-viewer-content">
        <button class="image-viewer-close" onclick="closeImageViewer()">✕</button>
        <img id="viewerImage" src="" alt="Gambar" />
      </div>
    `;
    document.body.appendChild(viewer);
    
    // Close when clicking outside
    viewer.addEventListener('click', (e) => {
      if (e.target === viewer) closeImageViewer();
    });
  }
  
  document.getElementById('viewerImage').src = src;
  viewer.classList.remove('hidden');
}

function closeImageViewer() {
  document.getElementById('imageViewer').classList.add('hidden');
}

/* ============================
   CHANGE PROFILE PIC
   ============================ */
function changeProfilePic() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        // Simpan ke localStorage (untuk demo)
        localStorage.setItem('group_profile_pic', ev.target.result);
        // Update tampilan
        const profilePic = document.querySelector('.group-profile-pic');
        profilePic.style.backgroundImage = `url(${ev.target.result})`;
        profilePic.innerHTML = '<div class="profile-pic-edit">✏️</div>';
        showToast('✅ Foto profil grup diganti!');
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

/* ============================
   FIREBASE INIT
   ============================ */
function initChat() {
  // Add scroll button to DOM
  const chatArea = document.getElementById('chatArea');
  const scrollBtn = document.createElement('button');
  scrollBtn.className = 'scroll-down-btn';
  scrollBtn.innerHTML = '↓';
  scrollBtn.onclick = scrollToBottom;
  chatArea.parentElement.insertBefore(scrollBtn, chatArea.nextSibling);
  chatArea.parentElement.style.position = 'relative';

  if (window.firebaseReady) {
    startListening();
  } else {
    window.addEventListener('firebaseReady', startListening);
  }
}

function startListening() {
  const loader = document.getElementById('chatLoader');
  const q = window._query(window._ref, window._limitToLast(MSG_LIMIT));

  window._onChildAdded(q, (snapshot) => {
    if (loader) loader.remove();

    const msg = snapshot.val();
    const isOwn = msg.name === currentUser;
    appendBubble(msg, isOwn);

    const chat = document.getElementById('chatArea');
    const distFromBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight;
    if (distFromBottom < 120 || isOwn) {
      scrollToBottom();
    } else {
      unreadCount++;
      updateScrollBadge();
    }
  });

  // Show online count (simulated)
  simulateOnlineCount();
}

/* ============================
   SEND MESSAGE
   ============================ */
function sendMessage() {
  if (!currentUser) return;

  const input = document.getElementById('msgInput');
  const text  = input.value.trim();
  if (!text) { shake(input); return; }

  const now = Date.now();
  if (now - lastSendTime < SEND_DELAY_MS) {
    showToast(`⏳ Tunggu ${Math.ceil((SEND_DELAY_MS - (now - lastSendTime)) / 1000)}s sebelum kirim lagi`);
    return;
  }

  const btn = document.getElementById('sendBtn');
  btn.disabled = true;

  const payload = {
    name:      currentUser,
    message:   escapeHtml(text),
    timestamp: Date.now(),
    isAdmin:   false
  };

  if (replyingTo) {
    payload.replyTo = replyingTo;
  }

  window._push(window._ref, payload).then(() => {
    input.value = '';
    lastSendTime = Date.now();
    closeEmojiPicker();
    cancelReply();
    
    const popup = document.getElementById('commandPopup');
    if (popup) popup.classList.add('hidden');

    // Check if user's message triggers a bot command
    const matchedCommand = APP_CONFIG.botCommands.find(c => text.toLowerCase().includes(c.command.toLowerCase()));
    if (matchedCommand) {
      setTimeout(() => {
        const botPayload = {
          name: "Panitia",
          message: matchedCommand.reply,
          timestamp: Date.now(),
          isAdmin: false,
          color: "#E91E63" // optional, will be handled by hashColor if omitted, but let's pass it
        };
        // For simplicity we just push it normally as a system/bot message
        // Since we don't have a specific bot structure, we can just push it as "Panitia"
        window._push(window._ref, botPayload);
      }, 1000); // 1 second delay
    }
  }).catch(err => {
    showToast('❌ Gagal kirim. Coba lagi.');
    console.error(err);
  }).finally(() => {
    setTimeout(() => { btn.disabled = false; }, SEND_DELAY_MS);
  });
}

/* ============================
   APPEND BUBBLE
   ============================ */
function appendBubble(msg, isOwn) {
  const chatArea = document.getElementById('chatArea');
  const loader   = document.getElementById('chatLoader');
  if (loader) loader.remove();

  const msgDate  = new Date(msg.timestamp);
  const dateLabel = formatDate(msgDate);

  if (dateLabel !== lastDateLabel) {
    lastDateLabel = dateLabel;
    const divider = document.createElement('div');
    divider.className = 'date-divider';
    divider.innerHTML = `<span>${dateLabel}</span>`;
    chatArea.appendChild(divider);
  }

  // System / admin message
  if (msg.isAdmin) {
    const sys = document.createElement('div');
    sys.className = 'bubble-system';
    sys.innerHTML = `<span>🤖 <strong>Admin Bot</strong></span><br>${msg.message}`;
    chatArea.appendChild(sys);
    return;
  }

  const wrap = document.createElement('div');
  wrap.className = `bubble-wrap ${isOwn ? 'out' : 'in'} ${msg.highlight ? 'highlight' : ''}`;
  wrap.dataset.msgId = msg.id || '';
  wrap.dataset.msgText = msg.message;

  const timeStr = formatTime(msgDate);

  if (!isOwn) {
    const nameEl = document.createElement('div');
    nameEl.className = 'bubble-name';
    nameEl.style.color = hashColor(msg.name);
    nameEl.textContent = msg.name;
    wrap.appendChild(nameEl);
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

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = `
    ${replyHtml}
    <div class="message-text">${msg.message}</div>
    <div class="bubble-meta">
      <span class="bubble-time">${timeStr}</span>
      ${isOwn ? '<span class="bubble-tick">✓✓</span>' : ''}
    </div>
  `;

  // Tambahkan dropdown reply untuk semua pesan (bukan admin static)
  if (!wrap.classList.contains('admin-static')) {
    const dropdown = document.createElement('div');
    dropdown.className = 'bubble-dropdown';
    dropdown.innerHTML = `
      <button class="bubble-dropdown-btn" onclick="toggleBubbleDropdown(this)">⋮</button>
      <div class="bubble-dropdown-list">
        <button onclick="replyToMessageDropdown(this)">Reply</button>
      </div>
    `;
    bubble.appendChild(dropdown);
  }

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
  if (!bubble) return;
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

function replyToBubble(bubbleWrap) {
  const senderName = bubbleWrap.querySelector('.bubble-name')?.textContent || 'Someone';
  const messageText = bubbleWrap.dataset.msgText || bubbleWrap.querySelector('.message-text')?.innerText || bubbleWrap.querySelector('.bubble').innerText.split('\n')[0];
  const msgId = bubbleWrap.dataset.msgId || '';
  
  replyingTo = { name: senderName, text: messageText, id: msgId };
  
  document.getElementById('replyPreviewName').textContent = senderName;
  document.getElementById('replyPreviewText').textContent = messageText;
  document.getElementById('replyPreviewBar').classList.remove('hidden');
  
  const input = document.getElementById('msgInput');
  input.focus();
}

window.replyToMessageDropdown = function(btn) {
  const bubbleWrap = btn.closest('.bubble-wrap');
  replyToBubble(bubbleWrap);
  btn.closest('.bubble-dropdown-list').classList.remove('show');
}

window.cancelReply = function() {
  replyingTo = null;
  document.getElementById('replyPreviewBar').classList.add('hidden');
}

/* ============================
   MESSAGE ACTIONS (Reply/Edit)
   ============================ */
function replyToMessage(btn) {
  window.replyToMessageDropdown(btn);
}

function editMessage(btn) {
  const bubbleWrap = btn.closest('.bubble-wrap');
  const messageText = bubbleWrap.dataset.msgText || '';
  
  const input = document.getElementById('msgInput');
  input.value = messageText;
  input.focus();
  showToast('Edit pesan...');
}

/* ============================
   CALL FEATURES
   ============================ */
let voiceAudio = null;

function startCall() {
  document.getElementById('callModal').classList.remove('hidden');
  document.getElementById('callStatus').textContent = 'Memanggil...';

  // play ringing sound via beep for 3 seconds
  playBeep();
  
  clearTimeout(callTimer);
  callTimer = setTimeout(() => {
    stopBeep();
    document.getElementById('callStatus').textContent = 'Terhubung ✓';
    document.getElementById('callStatus').style.color = '#25D366';
    
    // Play voice audio
    if (APP_CONFIG.voiceCallAudio) {
      if (!voiceAudio) {
        voiceAudio = new Audio(APP_CONFIG.voiceCallAudio);
        voiceAudio.loop = true;
      }
      voiceAudio.currentTime = 0;
      voiceAudio.play().catch(e => console.warn('Autoplay blocked:', e));
    }
  }, 3000);
}

function endCall() {
  clearTimeout(callTimer);
  document.getElementById('callModal').classList.add('hidden');
  document.getElementById('callStatus').style.color = '';
  stopBeep();
  if (voiceAudio) {
    voiceAudio.pause();
    voiceAudio.currentTime = 0;
  }
  showToast('📵 Panggilan diakhiri');
}

function startVideoCall() {
  document.getElementById('videoModal').classList.remove('hidden');
  const vid = document.getElementById('videoPlayer');
  vid.play().catch(() => {});
}

function endVideoCall() {
  document.getElementById('videoModal').classList.add('hidden');
  document.getElementById('videoPlayer').pause();
  showToast('📵 Video call diakhiri');
}

/* ============================
   WEB AUDIO BEEP (fake ringtone)
   ============================ */
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

/* ============================
   INFO PANEL
   ============================ */
function openInfo() {
  const panel = document.getElementById('infoPanel');
  panel.classList.remove('hidden');
  // Force reflow then animate
  requestAnimationFrame(() => panel.classList.add('open'));
}

function closeInfo() {
  const panel = document.getElementById('infoPanel');
  panel.classList.remove('open');
  setTimeout(() => panel.classList.add('hidden'), 280);
}

/* ============================
   EMOJI PICKER
   ============================ */
function toggleEmojiPicker() {
  const picker = document.getElementById('emojiPicker');
  picker.classList.toggle('open');
}

function closeEmojiPicker() {
  document.getElementById('emojiPicker').classList.remove('open');
}

function insertEmoji(emoji) {
  const input = document.getElementById('msgInput');
  input.value += emoji;
  input.focus();
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.emoji-btn') && !e.target.closest('.emoji-picker')) {
    closeEmojiPicker();
  }
});

/* ============================
   HELPERS
   ============================ */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatTime(date) {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date) {
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (sameDay(date, today))     return 'Hari ini';
  if (sameDay(date, yesterday)) return 'Kemarin';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function sameDay(a, b) {
  return a.getFullYear()===b.getFullYear() &&
         a.getMonth()===b.getMonth() &&
         a.getDate()===b.getDate();
}

/* Generate consistent color from name string */
const NAME_COLORS = [
  '#E91E63','#9C27B0','#3F51B5','#00BCD4',
  '#009688','#FF5722','#795548','#607D8B',
  '#F44336','#FF9800','#CDDC39','#4CAF50'
];
function hashColor(name) {
  let h = 0;
  for (let i=0; i<name.length; i++) h = name.charCodeAt(i) + ((h<<5)-h);
  return NAME_COLORS[Math.abs(h) % NAME_COLORS.length];
}

function scrollToBottom() {
  const chat = document.getElementById('chatArea');
  chat.scrollTop = chat.scrollHeight;
  unreadCount = 0;
  updateScrollBadge();
}

function updateScrollBadge() {
  const btn = document.querySelector('.scroll-down-btn');
  if (!btn) return;
  let badge = btn.querySelector('.unread-badge');
  if (unreadCount > 0) {
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'unread-badge';
      btn.appendChild(badge);
    }
    badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
  } else {
    if (badge) badge.remove();
  }
}

function hideModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2600);
}

function shake(el) {
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake .3s ease';
  const style = document.createElement('style');
  style.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`;
  document.head.appendChild(style);
  setTimeout(() => el.style.animation = '', 300);
}

/* Simulated online member count */
function simulateOnlineCount() {
  const el = document.getElementById('onlineCount');
  const update = () => {
    const base = 24;
    const rand = Math.floor(Math.random() * 15);
    el.textContent = `${base + rand} anggota • ${Math.floor(Math.random()*8)+3} online`;
  };
  update();
  setInterval(update, 8000);
}

/* ============================
   CALL NOTIFICATIONS
   ============================ */
function showCallNotification(type) {
  const notifId = type === 'video' ? 'videoNotif' : 'callNotif';
  const notif = document.getElementById(notifId);
  if (notif) {
    notif.classList.add('active');
    // Auto hide setelah 5 detik
    setTimeout(() => {
      notif.classList.remove('active');
    }, 5000);
  }
}

// Tampilkan notifikasi saat ada pesan baru (simulasi)
function simulateIncomingCall() {
  // Notifikasi akan muncul secara acak untuk simulasi
  // Bisa diaktifkan jika needed
}

/* ============================
   BOT COMMANDS & AUTOCOMPLETE
   ============================ */
window.checkCommand = function(val) {
  const popup = document.getElementById('commandPopup');
  if (!popup) return;
  
  if (val.startsWith('@')) {
    const search = val.toLowerCase();
    const matches = APP_CONFIG.botCommands.filter(c => c.command.toLowerCase().startsWith(search));
    
    if (matches.length > 0) {
      popup.innerHTML = matches.map(c => `
        <div class="command-item" onclick="selectCommand('${c.command}')">
          <span class="command-item-name">${c.command}</span>
          <span class="command-item-desc">${c.description}</span>
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
