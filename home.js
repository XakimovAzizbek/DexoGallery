const IMAGES_DIR = "";
const SAVED_KEY = "dexo_saved_pins";

(function initIntroSplash() {
  const splash = document.getElementById("introSplash");
  const video = document.getElementById("introVideo");
  if (!splash || !video) return;

  let dismissed = false;

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    splash.classList.add("hide");
    setTimeout(() => splash.remove(), 450);
  }

  // Fallback: if video can't load/play in time (slow internet), skip after 4s
  const fallbackTimer = setTimeout(dismiss, 4000);

  video.addEventListener("ended", () => {
    clearTimeout(fallbackTimer);
    dismiss();
  });

  video.addEventListener("error", () => {
    clearTimeout(fallbackTimer);
    dismiss();
  });

  // Try to play with sound; some browsers block unmuted autoplay,
  // so fall back to muted playback rather than skipping the video.
  video.muted = false;
  const playPromise = video.play();
  if (playPromise && playPromise.catch) {
    playPromise.catch(() => {
      video.muted = true;
      video.play().catch(() => dismiss());
    });
  }
})();

function resolveImageSrc(photo) {
  if (/^https?:\/\//i.test(photo)) return photo;
  return IMAGES_DIR + photo;
}

function parseGalleryText(text) {
  return text
    .split(/\n\s*\n/)
    .map(block => {
      const item = {};
      block.split("\n").forEach(line => {
        const idx = line.indexOf(":");
        if (idx === -1) return;
        const key = line.slice(0, idx).trim().toLowerCase();
        const value = line.slice(idx + 1).trim();
        if (key) item[key] = value;
      });
      return item;
    })
    .filter(item => item.photo);
}

async function loadGallery() {
  const res = await fetch("gallery.txt");
  const text = await res.text();
  return parseGalleryText(text);
}

function getSaved() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
  } catch {
    return [];
  }
}

function setSaved(list) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
}

function savePin(item) {
  const saved = getSaved();
  if (saved.some(p => p.photo === item.photo)) {
    showToast("Bu rasm allaqachon saqlangan");
    return;
  }
  saved.unshift(item);
  setSaved(saved);
  showToast("Pin saqlandi");
}

function downloadImage(item) {
  const a = document.createElement("a");
  a.href = resolveImageSrc(item.photo);
  a.download = item.photo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast("Rasm galereyaga saqlanmoqda");
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1800);
}

function closeAllPopups() {
  document.querySelectorAll(".pin-popup").forEach(p => (p.hidden = true));
}

function createPinCard(item) {
  const pin = document.createElement("div");
  pin.className = "pin";

  const img = document.createElement("img");
  img.src = resolveImageSrc(item.photo);
  img.loading = "lazy";
  img.alt = item.name || "";

  const menuBtn = document.createElement("button");
  menuBtn.className = "pin-menu-btn";
  menuBtn.setAttribute("aria-label", "Ko'proq");
  menuBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`;

  const popup = document.createElement("div");
  popup.className = "pin-popup";
  popup.hidden = true;

  const saveGalleryBtn = document.createElement("button");
  saveGalleryBtn.textContent = "Rasmni galereyaga saqlash";
  saveGalleryBtn.onclick = e => {
    e.stopPropagation();
    downloadImage(item);
    closeAllPopups();
  };

  const savePinBtn = document.createElement("button");
  savePinBtn.textContent = "Pinni saqlash";
  savePinBtn.onclick = e => {
    e.stopPropagation();
    savePin(item);
    closeAllPopups();
  };

  popup.append(saveGalleryBtn, savePinBtn);

  menuBtn.onclick = e => {
    e.stopPropagation();
    const wasHidden = popup.hidden;
    closeAllPopups();
    popup.hidden = !wasHidden;
  };

  const caption = document.createElement("div");
  caption.className = "pin-caption";
  caption.textContent = item.name || "";

  pin.append(img, menuBtn, popup, caption);
  return pin;
}

async function init() {
  const feed = document.getElementById("feed");
  const empty = document.getElementById("emptyState");
  try {
    const items = await loadGallery();
    if (!items.length) {
      empty.hidden = false;
      return;
    }
    items.forEach(item => feed.appendChild(createPinCard(item)));
  } catch (err) {
    empty.hidden = false;
    empty.textContent = "Rasmlarni yuklashda xatolik.";
  }
}

document.addEventListener("click", closeAllPopups);
init();
