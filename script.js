// =========================
// KONFIGURASI GOOGLE SHEETS
// =========================
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwGkLHc-HKLU1Kr35ZnWioi3Zcj_87FNsu0Bgb0Q0Mf4mFrLh43d2JOVZn-vkRnHvPA6Q/exec";
// Contoh: https://script.google.com/macros/s/..../exec
// =========================
// Data UKM/Organisasi (EDIT DI SINI)
// =========================
const ukmData = [
  {
    id: "ukm-keilmuan-1",
    name: "Komunitas Keilmuan FMIPA",
    category: "Keilmuan",
    short: "Diskusi ilmiah, kelas bareng, dan project akademik lintas minat.",
    activities: [
      "Study group mingguan",
      "Kelas persiapan lomba",
      "Mini riset & presentasi",
    ],
    contact: { ig: "@contoh_keilmuan", wa: "08xxxxxxxxxx" },
  },
  {
    id: "ukm-seni-1",
    name: "Komunitas Kreatif & Seni",
    category: "Seni",
    short: "Ruang ekspresi: desain, foto/video, dan event kreatif kampus.",
    activities: [
      "Workshop desain",
      "Dokumentasi event",
      "Proyek konten kreatif",
    ],
    contact: { ig: "@contoh_seni", wa: "08xxxxxxxxxx" },
  },
  {
    id: "ukm-olahraga-1",
    name: "Komunitas Olahraga",
    category: "Olahraga",
    short: "Latihan rutin, sparing, dan turnamen internal/eksternal.",
    activities: ["Latihan rutin", "Sparing partner", "Turnamen kampus"],
    contact: { ig: "@contoh_olahraga", wa: "08xxxxxxxxxx" },
  },
  {
    id: "ukm-sosial-1",
    name: "Komunitas Sosial & Pengabdian",
    category: "Sosial",
    short: "Aksi sosial, volunteer, dan pengabdian masyarakat berbasis sains.",
    activities: ["Bakti sosial", "Volunteer mengajar", "Program lingkungan"],
    contact: { ig: "@contoh_sosial", wa: "08xxxxxxxxxx" },
  },
  {
    id: "ukm-kepanitiaan-1",
    name: "Organisasi Kepanitiaan Event",
    category: "Kepanitiaan",
    short:
      "Belajar manajemen event: sponsorship, publikasi, dan produksi acara.",
    activities: ["Panitia event fakultas", "Sponsorship", "Publikasi & media"],
    contact: { ig: "@contoh_event", wa: "08xxxxxxxxxx" },
  },
  // Tambah item sesuai UKM/organisasi FMIPA UII versi kamu:
  // { id:"...", name:"...", category:"Keilmuan|Seni|Olahraga|Sosial|Kepanitiaan", short:"...", activities:[...], contact:{ig:"@", wa:"08..."} }
];

// =========================
// Utilities
// =========================
const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCategory(cat) {
  const map = {
    Keilmuan: "📚 Keilmuan",
    Seni: "🎨 Seni",
    Olahraga: "🏃 Olahraga",
    Sosial: "🤲 Sosial",
    Kepanitiaan: "🎫 Kepanitiaan",
  };
  return map[cat] || cat;
}

// =========================
// Render UKM Cards + Dropdown
// =========================
const ukmGrid = $("#ukmGrid");
const ukmChoice = $("#ukmChoice");
const searchUkm = $("#searchUkm");

let activeFilter = "all";

function renderUkmList() {
  const q = (searchUkm?.value || "").trim().toLowerCase();

  const filtered = ukmData.filter((item) => {
    const matchesFilter =
      activeFilter === "all" || item.category === activeFilter;
    const hay = `${item.name} ${item.category} ${item.short} ${(
      item.activities || []
    ).join(" ")}`.toLowerCase();
    const matchesQuery = !q || hay.includes(q);
    return matchesFilter && matchesQuery;
  });

  if (!ukmGrid) return;

  ukmGrid.innerHTML = filtered
    .map((item) => {
      const activities = (item.activities || []).slice(0, 3);
      const meta1 = `${activities.length} kegiatan`;
      const meta2 = item.contact?.ig
        ? `IG: ${item.contact.ig}`
        : "Kontak tersedia";

      return `
      <article class="ukmCard reveal" data-id="${escapeHtml(
        item.id
      )}" tabindex="0" role="button" aria-expanded="false">
        <div class="ukmCard__top">
          <div>
            <div class="ukmTitle">${escapeHtml(item.name)}</div>
          </div>
          <div class="ukmTag">${escapeHtml(formatCategory(item.category))}</div>
        </div>

        <div class="ukmCard__mid">
          <p class="ukmDesc">${escapeHtml(item.short)}</p>

          <div class="ukmMeta">
            <span class="metaPill">${escapeHtml(meta1)}</span>
            <span class="metaPill">${escapeHtml(meta2)}</span>
          </div>
        </div>

        <div class="ukmCard__details" aria-hidden="true">
          <div class="detailsInner">
            <strong>Kegiatan utama:</strong>
            <ul>
              ${activities.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}
            </ul>
            <a href="#register" data-pick="${escapeHtml(
              item.id
            )}">Daftar ke UKM ini →</a>
          </div>
        </div>
      </article>
    `;
    })
    .join("");

  // Re-attach card behaviors + reveal observer
  attachCardToggles();
  observeReveals();
}

function populateDropdown() {
  if (!ukmChoice) return;
  ukmChoice.innerHTML = `
    <option value="" selected disabled>Pilih UKM/Organisasi</option>
    ${ukmData
      .map(
        (u) =>
          `<option value="${escapeHtml(u.id)}">${escapeHtml(
            u.name
          )} — ${escapeHtml(u.category)}</option>`
      )
      .join("")}
  `;
}

// Toggle details on card click
function attachCardToggles() {
  $$(".ukmCard", ukmGrid).forEach((card) => {
    const toggle = () => {
      const isOpen = card.classList.toggle("is-open");
      card.setAttribute("aria-expanded", String(isOpen));
      const details = $(".ukmCard__details", card);
      if (details) {
        details.setAttribute("aria-hidden", String(!isOpen));
      }
    };

    card.addEventListener("click", (e) => {
      // If click on "Daftar ke UKM ini" link, let it pass and preselect dropdown
      const a = e.target.closest("a[data-pick]");
      if (a) {
        const pickId = a.getAttribute("data-pick");
        if (ukmChoice) ukmChoice.value = pickId;
        return;
      }
      toggle();
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });
}

// =========================
// Filters
// =========================
function setupFilters() {
  $$(".chipBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".chipBtn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeFilter = btn.getAttribute("data-filter") || "all";
      renderUkmList();
    });
  });

  if (searchUkm) {
    searchUkm.addEventListener("input", () => renderUkmList());
  }
}

// =========================
// Mobile nav
// =========================
function setupMobileNav() {
  const burger = $("#burger");
  const nav = $("#nav");
  if (!burger || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  };

  burger.addEventListener("click", () => {
    setOpen(!nav.classList.contains("is-open"));
  });

  // close on click link (mobile)
  $$(".nav__link", nav).forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  // close on outside click
  document.addEventListener("click", (e) => {
    const isInside = nav.contains(e.target) || burger.contains(e.target);
    if (!isInside) setOpen(false);
  });
}

// =========================
// Testimonials (simple switcher)
// =========================
const testimonials = [
  {
    text: "Gabung organisasi bikin aku lebih pede ngomong di depan orang, plus jadi punya circle belajar yang seru.",
    name: "Mahasiswa A",
    role: "Angkatan 2023 • Komunitas Keilmuan",
  },
  {
    text: "Aku jadi punya portofolio event dan konten. Yang paling kerasa: cara kerja tim & manajemen waktu jadi rapi.",
    name: "Mahasiswa B",
    role: "Angkatan 2022 • Kreatif & Event",
  },
  {
    text: "Dari UKM aku bisa coba banyak hal: volunteer, lomba, sampai kolaborasi lintas prodi. Worth it banget.",
    name: "Mahasiswa C",
    role: "Angkatan 2024 • Sosial & Pengabdian",
  },
];

function setupTestimonials() {
  const items = $$(".tItem");
  const quoteText = $("#quoteText");
  const quoteMeta = $("#quoteMeta");
  const quoteCard = $("#quoteCard");

  if (!items.length || !quoteText || !quoteMeta || !quoteCard) return;

  items.forEach((btn) => {
    btn.addEventListener("click", () => {
      items.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const idx = Number(btn.getAttribute("data-t") || 0);
      const t = testimonials[idx] || testimonials[0];

      // small fade
      quoteCard.style.opacity = "0.35";
      quoteCard.style.transform = "translateY(6px)";
      setTimeout(() => {
        quoteText.textContent = t.text;
        quoteMeta.innerHTML = `
          <div class="quoteName">${escapeHtml(t.name)}</div>
          <div class="quoteRole">${escapeHtml(t.role)}</div>
        `;
        quoteCard.style.opacity = "1";
        quoteCard.style.transform = "translateY(0)";
      }, 140);
    });
  });
}

// =========================
// Reveal on scroll
// =========================
let revealObserver;
function observeReveals() {
  const els = $$(".reveal");
  if (!els.length) return;

  if (revealObserver) revealObserver.disconnect();

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  els.forEach((el) => revealObserver.observe(el));
}

// =========================
// Counters
// =========================
function animateCounters() {
  const counters = $$("[data-counter]");
  if (!counters.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const end = Number(el.getAttribute("data-counter") || 0);
        const duration = 900;
        const start = performance.now();
        const from = 0;

        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = Math.floor(from + (end - from) * eased);

          el.textContent = val.toLocaleString("id-ID");
          if (t < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    },
    { threshold: 0.35 }
  );

  counters.forEach((c) => obs.observe(c));
}

// =========================
// Form handling (demo: LocalStorage)
// =========================
function setupForm() {
  const form = $("#regForm");
  const toast = $("#formToast");
  const btnDemo = $("#btnFillDemo");
  const submitBtn = $("#submitBtn"); // Pastikan tombol submit punya id="submitBtn" di HTML

  if (!form) return;

  const setErr = (name, msg) => {
    const el = document.querySelector(`[data-err-for="${name}"]`);
    if (el) el.textContent = msg || "";
  };

  const clearErrs = () => {
    [
      "fullName",
      "nim",
      "email",
      "program",
      "ukmChoice",
      "reason",
      "agree",
    ].forEach((k) => setErr(k, ""));
  };

  const showToast = (msg, ok = true) => {
    if (!toast) return;
    toast.style.display = "block";
    toast.style.borderColor = ok
      ? "rgba(34,197,94,.25)"
      : "rgba(220,38,38,.25)";
    toast.style.background = ok ? "rgba(34,197,94,.10)" : "rgba(220,38,38,.08)";
    toast.textContent = msg;
    setTimeout(() => {
      toast.style.display = "none";
    }, 4200);
  };

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrs();

    // 1. Ambil Data
    const fullName = ($("#fullName")?.value || "").trim();
    const nim = ($("#nim")?.value || "").trim();
    const email = ($("#email")?.value || "").trim();
    const phone = ($("#phone")?.value || "").trim();
    const program = ($("#program")?.value || "").trim();
    const ukmChoiceVal = ($("#ukmChoice")?.value || "").trim();
    const reason = ($("#reason")?.value || "").trim();
    const agree = $("#agree")?.checked;

    // 2. Validasi (Sama seperti kode asli kamu)
    let ok = true;
    if (fullName.length < 3) {
      setErr("fullName", "Nama minimal 3 karakter.");
      ok = false;
    }
    if (nim.length < 6) {
      setErr("nim", "NIM tidak valid.");
      ok = false;
    }
    if (!isEmail(email)) {
      setErr("email", "Email tidak valid.");
      ok = false;
    }
    if (!program) {
      setErr("program", "Pilih prodi.");
      ok = false;
    }
    if (!ukmChoiceVal) {
      setErr("ukmChoice", "Pilih UKM/Organisasi.");
      ok = false;
    }
    if (reason.length < 10) {
      setErr("reason", "Tulis alasan minimal 10 karakter.");
      ok = false;
    }
    if (!agree) {
      setErr("agree", "Kamu harus menyetujui persyaratan.");
      ok = false;
    }

    if (!ok) {
      showToast(
        "Periksa kembali form kamu ya. Masih ada yang belum valid.",
        false
      );
      return;
    }

    // 3. Siapkan Pengiriman Data
    const chosen = ukmData.find((u) => u.id === ukmChoiceVal);

    // Ubah tombol jadi Loading
    const originalBtnText = submitBtn ? submitBtn.innerHTML : "Kirim";
    if (submitBtn) {
      submitBtn.innerHTML =
        "<i class='fa-solid fa-spinner fa-spin'></i> Mengirim...";
      submitBtn.disabled = true;
    }

    // Buat FormData untuk dikirim ke Google Script
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("nim", nim);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("program", program);
    formData.append("ukmName", chosen?.name || ukmChoiceVal); // Kirim Namanya, bukan ID
    formData.append("reason", reason);

    try {
      // 4. Kirim ke Google Sheets
      if (SCRIPT_URL) {
        await fetch(SCRIPT_URL, {
          method: "POST",
          body: formData,
          mode: "no-cors",
        });
        showToast(`Berhasil! Kamu telah mendaftar ke ${chosen?.name || ""}.`);
      } else {
        // Fallback kalau URL belum diisi (Simpan Lokal)
        console.warn("SCRIPT_URL belum diisi. Menyimpan ke LocalStorage.");
        const payload = {
          id: "REG-" + Date.now(),
          fullName,
          nim,
          email,
          phone,
          program,
          ukmName: chosen?.name,
          reason,
          createdAt: new Date(),
        };
        const key = "fmipa_registrations";
        const prev = JSON.parse(localStorage.getItem(key) || "[]");
        prev.push(payload);
        localStorage.setItem(key, JSON.stringify(prev));
        showToast(`(Demo Mode) Data tersimpan lokal: ${chosen?.name}`);
      }

      form.reset();
      if ($("#ukmChoice")) $("#ukmChoice").value = "";
    } catch (err) {
      showToast("Gagal mengirim data. Cek koneksi internet.", false);
      console.error(err);
    } finally {
      // Kembalikan tombol seperti semula
      if (submitBtn) {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    }
  });

  // Tombol Demo (Sama seperti kode asli kamu)
  btnDemo?.addEventListener("click", () => {
    $("#fullName").value = "Budi Santoso";
    $("#nim").value = "23523123";
    $("#email").value = "budi@students.uii.ac.id";
    $("#phone").value = "08123456789";
    $("#program").value = "Statistika";
    if ($("#ukmChoice")) $("#ukmChoice").value = ukmData[0]?.id || "";
    $("#reason").value =
      "Saya ingin mengembangkan soft skill dan menambah relasi di kampus.";
    $("#agree").checked = true;
    showToast("Data demo terisi. Klik tombol Daftar untuk mencoba.");
  });
}

// =========================
// Init
// =========================
function init() {
  $("#year").textContent = new Date().getFullYear();

  setupMobileNav();
  setupFilters();
  setupTestimonials();

  populateDropdown();
  renderUkmList();

  observeReveals();
  animateCounters();
  setupForm();
}

document.addEventListener("DOMContentLoaded", init);
