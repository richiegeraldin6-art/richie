/* ===== Utilitas ===== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ===== Tema gelap / terang ===== */
const themeToggle = $("#themeToggle");
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}
let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
applyTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

/* ===== Menu mobile ===== */
const navLinks = $("#navLinks");
$("#menuBtn").addEventListener("click", () => navLinks.classList.toggle("open"));
$$("#navLinks a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

/* ===== Navbar saat scroll + tombol ke atas + menu aktif ===== */
const navbar = $("#navbar");
const toTop = $("#toTop");
const sections = $$("main section[id]");

function onScroll() {
  const y = window.scrollY;
  navbar.classList.toggle("scrolled", y > 20);
  toTop.classList.toggle("show", y > 500);

  let current = "home";
  sections.forEach(sec => {
    if (y >= sec.offsetTop - 120) current = sec.id;
  });
  $$("#navLinks a").forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === "#" + current);
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ===== Efek mengetik ===== */
const words = ["Pelajar RPL", "Web Developer Pemula", "Programmer", "Pembelajar Cepat"];
const typingEl = $("#typing");
let wIndex = 0, cIndex = 0, deleting = false;

function type() {
  const word = words[wIndex];
  typingEl.textContent = word.substring(0, cIndex);
  let delay = deleting ? 50 : 110;

  if (!deleting && cIndex === word.length) {
    delay = 1500;
    deleting = true;
  } else if (deleting && cIndex === 0) {
    deleting = false;
    wIndex = (wIndex + 1) % words.length;
    delay = 400;
  }
  cIndex += deleting ? -1 : 1;
  setTimeout(type, delay);
}
type();

/* ===== Animasi muncul saat scroll + skill bar + counter ===== */
function animateCount(el) {
  const target = +el.dataset.target;
  let n = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const timer = setInterval(() => {
    n += step;
    if (n >= target) { n = target; clearInterval(timer); }
    el.textContent = n;
  }, 40);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add("visible");

    const fill = $(".fill", el);
    if (fill) fill.style.width = fill.dataset.width + "%";

    const count = $(".count", el);
    if (count) animateCount(count);

    observer.unobserve(el);
  });
}, { threshold: 0.15 });

$$(".reveal").forEach(el => observer.observe(el));

/* ===== Filter proyek ===== */
$$(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;
    $$(".project").forEach(p => {
      p.classList.toggle("hide", f !== "all" && p.dataset.cat !== f);
    });
  });
});

/* ===== Form kontak (membuka aplikasi email) ===== */
const EMAIL_TUJUAN = "richiegeraldin@gmail.com";
const form = $("#contactForm");
const formMsg = $("#formMsg");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#cName").value.trim();
  const email = $("#cEmail").value.trim();
  const msg = $("#cMsg").value.trim();

  formMsg.className = "form-msg";
  if (!name || !email || !msg) {
    formMsg.textContent = "Mohon isi semua kolom.";
    formMsg.classList.add("error");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    formMsg.textContent = "Format email tidak valid.";
    formMsg.classList.add("error");
    return;
  }

  const subject = encodeURIComponent("Pesan dari Portofolio - " + name);
  const body = encodeURIComponent(`Nama: ${name}\nEmail: ${email}\n\n${msg}`);
  window.location.href = `mailto:${EMAIL_TUJUAN}?subject=${subject}&body=${body}`;

  formMsg.textContent = "Membuka aplikasi email kamu...";
  formMsg.classList.add("ok");
  form.reset();
});

/* ===== Latar belakang partikel (canvas) ===== */
(function () {
  const canvas = $("#bgCanvas");
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = canvas.getContext("2d");
  let w, h, particles = [];
  const mouse = { x: null, y: null };

  function colors() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    return dark ? "165, 180, 252" : "79, 70, 229";
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(80, Math.floor((w * h) / 18000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const c = colors();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c}, 0.55)`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${c}, ${0.18 * (1 - d / 130)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      if (mouse.x !== null) {
        const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (d < 160) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${c}, ${0.3 * (1 - d / 160)})`;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener("mouseleave", () => { mouse.x = mouse.y = null; });
  resize();
  draw();
})();

/* ===== Tahun footer ===== */
$("#year").textContent = new Date().getFullYear();
