const IMAGES_DIR = "images/";
const SAVED_KEY = "dexo_saved_pins";

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

function removePin(item) {
  const saved = getSaved().filter(p => p.photo !== item.photo);
  setSaved(saved);
  render(saved);
  showToast("Pin o'chirildi");
}

function downloadImage(item) {
  const a = document.createElement("a");
  a.href = IMAGES_DIR + item.photo;
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
  img.src = IMAGES_DIR + item.photo;
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

  const removeBtn = document.createElement("button");
  removeBtn.className = "danger";
  removeBtn.textContent = "Pinni o'chirish";
  removeBtn.onclick = e => {
    e.stopPropagation();
    removePin(item);
    closeAllPopups();
  };

  popup.append(saveGalleryBtn, removeBtn);

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

function render(items) {
  const feed = document.getElementById("feed");
  const empty = document.getElementById("emptyState");
  feed.innerHTML = "";
  if (!items.length) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  items.forEach(item => feed.appendChild(createPinCard(item)));
}

document.addEventListener("click", closeAllPopups);
render(getSaved());
