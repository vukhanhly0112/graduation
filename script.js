/* =========================================================
   GRADUATION INVITATION — DARK LUXE ENGINE
   ========================================================= */

const config = {
  graduateName: "Vũ Khánh Ly",
  ceremony: {
    // Thời điểm bắt đầu buổi lễ (giờ Việt Nam, UTC+7)
    startISO: "2026-08-08T08:00:00+07:00",
    endISO: "2026-08-08T12:00:00+07:00",
    title: "Lễ tốt nghiệp",
    place: "Trường Đại học Kinh tế - Kỹ thuật Công nghiệp",
    address: "Số 218 Lĩnh Nam, Hoàng Mai, Hà Nội",
    // Dùng riêng cho nút "Chỉ đường": tên trường cho kết quả chính xác hơn số nhà
    mapQuery: "Trường Đại học Kinh tế Kỹ thuật Công nghiệp, 218 Lĩnh Nam, Hoàng Mai, Hà Nội",
  },
  contactEmail: "vukhanhly0112@gmail.com",
  /* Nơi nhận xác nhận RSVP. Để trống hết thì trang tự mở app email của khách
     (khách phải bấm Gửi thêm một lần) — xem hướng dẫn cấu hình trong README. */
  form: {
    // "web3forms" | "formspree" | "getform" | "sheets"
    provider: "sheets",
    // Chỉ dùng cho web3forms: access key gửi về mail sau khi đăng ký
    accessKey: "",
    // Dùng cho formspree / getform / sheets: dán nguyên URL endpoint
    endpoint:
      "https://script.google.com/macros/s/AKfycbzfOy-U9KswdcGhpJ0MlN2jZkmJxU3bGNiLzwU1Oq1deiJgyKf6SWwLLYAI9CmloFj4/exec",
  },
  music: {
    enabled: true,
    // Tự phát ngay khi khách mở thiệp; đổi thành false nếu muốn khách tự bấm nút loa
    autoplay: true,
    volume: 0.42,
  },
  effects: {
    preloader: true,
    smoothScroll: true,
    customCursor: true,
    ambient: true,
    magnetic: true,
    tilt: true,
    clickSpark: true,
    confetti: true,
  },
};

/* ---------------------------------------------------------
   HELPERS
   --------------------------------------------------------- */

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
const lerp = (from, to, amount) => from + (to - from) * amount;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/* ---------------------------------------------------------
   ELEMENTS
   --------------------------------------------------------- */

const preloader = $("#preloader");
const preloaderBar = $("#preloaderBar");
const preloaderCount = $("#preloaderCount");

const invitationGate = $("#invitationGate");
const openInvitationButton = $("#openInvitation");

const siteHeader = $("#siteHeader");
const navLinks = $("#navLinks");
const navIndicator = $("#navIndicator");
const navToggle = $("#navToggle");

const smoothWrapper = $("#smoothWrapper");
const smoothContent = $("#smoothContent");

const scrollProgress = $("#scrollProgress");

const cursorDot = $("#cursorDot");
const cursorRing = $("#cursorRing");
const cursorLabel = $("#cursorLabel");

const ambientCanvas = $("#ambientCanvas");
const celebrationCanvas = $("#celebrationCanvas");
const ambientContext = ambientCanvas.getContext("2d");
const confettiContext = celebrationCanvas.getContext("2d");

const rsvpForm = $("#rsvpForm");
const formStatus = $("#formStatus");

let gateOpened = false;

document.body.classList.add("is-locked");

/* =========================================================
   1. PRELOADER
   ========================================================= */

function runPreloader() {
  if (!config.effects.preloader || reduceMotion) {
    preloader.classList.add("is-done");
    window.setTimeout(() => preloader.remove(), 400);
    return;
  }

  let progress = 0;
  let pageLoaded = document.readyState === "complete";

  window.addEventListener("load", () => {
    pageLoaded = true;
  });

  const tick = window.setInterval(() => {
    // Chạy nhanh tới 90%, chỉ vượt qua khi trang thực sự tải xong.
    const ceiling = pageLoaded ? 100 : 92;
    const step = progress < 60 ? 4 + Math.random() * 7 : 1.4 + Math.random() * 3.2;

    progress = Math.min(progress + step, ceiling);
    preloaderCount.textContent = Math.floor(progress);
    preloaderBar.style.width = `${progress}%`;

    if (progress >= 100) {
      window.clearInterval(tick);
      window.setTimeout(() => {
        preloader.classList.add("is-done");
        window.setTimeout(() => preloader.remove(), 1000);
      }, 320);
    }
  }, 90);

  // Chốt chặn: dù ảnh nền có treo thì cũng không giữ preloader quá 5 giây.
  window.setTimeout(() => {
    pageLoaded = true;
  }, 5000);
}

/* =========================================================
   2. SPLIT TEXT + WIPE
   ========================================================= */

function splitIntoChars(element) {
  const text = element.textContent;
  const fragment = document.createDocumentFragment();

  Array.from(text).forEach((character, index) => {
    if (character === " ") {
      fragment.appendChild(document.createTextNode(" "));
      return;
    }

    const mask = document.createElement("span");
    const inner = document.createElement("span");

    mask.className = "split-mask";
    inner.className = "split-inner";
    inner.textContent = character;
    inner.style.transitionDelay = `${index * 42}ms`;
    mask.appendChild(inner);
    fragment.appendChild(mask);
  });

  element.textContent = "";
  element.setAttribute("aria-label", text);
  element.appendChild(fragment);
}

function prepareSplitText() {
  if (reduceMotion) {
    return;
  }

  $$("[data-split='chars']").forEach(splitIntoChars);
}

/* =========================================================
   3. SCROLL REVEAL
   ========================================================= */

function setupReveal() {
  // Hero được điều khiển riêng bởi playHeroIntro() để không chạy xong khi thiệp còn đóng.
  const targets = [...$$(".reveal-up"), ...$$("[data-split='chars']"), ...$$("[data-wipe]")].filter(
    (element) => !element.closest(".hero")
  );

  if (!("IntersectionObserver" in window) || reduceMotion) {
    targets.forEach((element) => {
      element.classList.add("is-visible", "is-split-in", "is-wiped");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible", "is-split-in", "is-wiped");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -60px" }
  );

  targets.forEach((element) => observer.observe(element));
}

/* Hero animate ngay khi mở thiệp, không đợi scroll. */
function playHeroIntro() {
  const heroTargets = $$(".hero .reveal-up, .hero [data-split='chars'], .hero [data-wipe]");

  heroTargets.forEach((element, index) => {
    window.setTimeout(() => {
      element.classList.add("is-visible", "is-split-in", "is-wiped");
    }, index * 110);
  });
}

/* =========================================================
   4. SMOOTH SCROLL (lerp) + PARALLAX
   ========================================================= */

const smooth = {
  enabled: false,
  current: 0,
  target: 0,
  height: 0,
};

const parallaxItems = $$("[data-parallax]").map((element) => ({
  element,
  speed: Number(element.dataset.parallax) || 0.15,
}));

function measureSmoothHeight() {
  if (!smooth.enabled) {
    return;
  }

  smooth.height = smoothContent.getBoundingClientRect().height;
  document.body.style.height = `${smooth.height}px`;
}

function applyParallax() {
  const viewportHeight = window.innerHeight;

  parallaxItems.forEach(({ element, speed }) => {
    const host = element.parentElement.getBoundingClientRect();
    const offset = (host.top + host.height / 2 - viewportHeight / 2) * speed;
    element.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
  });
}

function renderSmoothScroll() {
  if (smooth.enabled) {
    smooth.target = window.scrollY;
    smooth.current = lerp(smooth.current, smooth.target, 0.085);

    if (Math.abs(smooth.target - smooth.current) < 0.05) {
      smooth.current = smooth.target;
    }

    smoothContent.style.transform = `translate3d(0, ${-smooth.current.toFixed(2)}px, 0)`;
  }

  applyParallax();
  window.requestAnimationFrame(renderSmoothScroll);
}

function setupSmoothScroll() {
  if (!config.effects.smoothScroll || isTouch || reduceMotion) {
    window.requestAnimationFrame(renderSmoothScroll);
    return;
  }

  smooth.enabled = true;
  document.body.classList.add("has-smooth");
  // Tắt smooth-scroll gốc của trình duyệt: anchor nhảy tức thì, phần mượt do lerp lo.
  document.documentElement.style.scrollBehavior = "auto";
  smooth.current = window.scrollY;
  measureSmoothHeight();

  if ("ResizeObserver" in window) {
    new ResizeObserver(measureSmoothHeight).observe(smoothContent);
  }

  window.requestAnimationFrame(renderSmoothScroll);
}

/* =========================================================
   5. HEADER / NAV
   ========================================================= */

const sections = [$("#home"), ...$$("main section[id]"), $("#contact")].filter(Boolean);
let lastScrollY = window.scrollY;

function moveNavIndicator(link) {
  if (!link || window.innerWidth <= 900) {
    navIndicator.style.opacity = "0";
    return;
  }

  navIndicator.style.opacity = "1";
  navIndicator.style.width = `${link.offsetWidth}px`;
  navIndicator.style.transform = `translateX(${link.offsetLeft}px)`;
}

function updateActiveSection() {
  const line = window.scrollY + window.innerHeight * 0.34;
  let activeId = sections.length ? sections[0].id : "";

  sections.forEach((section) => {
    if (section.offsetTop <= line) {
      activeId = section.id;
    }
  });

  const links = $$("a", navLinks);
  let activeLink = null;

  links.forEach((link) => {
    const matches = link.getAttribute("href") === `#${activeId}`;
    link.classList.toggle("is-active", matches);

    if (matches) {
      activeLink = link;
    }
  });

  moveNavIndicator(activeLink);
}

function updateHeaderState() {
  const y = window.scrollY;

  siteHeader.classList.toggle("is-stuck", y > 40);
  siteHeader.classList.toggle("is-up", y > 340 && y > lastScrollY && !document.body.classList.contains("nav-open"));
  lastScrollY = y;
}

function updateScrollProgress() {
  const maxScroll = (smooth.enabled ? smooth.height : document.documentElement.scrollHeight) - window.innerHeight;
  const progress = maxScroll > 0 ? clamp((window.scrollY / maxScroll) * 100, 0, 100) : 0;
  scrollProgress.style.width = `${progress}%`;
}

function onScroll() {
  updateHeaderState();
  updateScrollProgress();
  updateActiveSection();
}

/* Ở chế độ smooth-scroll, nội dung nằm trong một wrapper position:fixed nên anchor
   mặc định của trình duyệt không cuộn được trang — phải tự tính và cuộn window. */
function scrollToHash(hash) {
  const target = hash && hash.length > 1 ? document.querySelector(hash) : null;

  if (!target) {
    return false;
  }

  const offsetInContent = target.getBoundingClientRect().top - smoothContent.getBoundingClientRect().top;

  window.scrollTo({ top: Math.max(offsetInContent, 0) });
  return true;
}

function setupAnchors() {
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      if (scrollToHash(link.getAttribute("href"))) {
        event.preventDefault();
      }
    });
  });

  // Wrapper không được phép tự cuộn — nếu có thì nội dung sẽ lệch vĩnh viễn.
  smoothWrapper.addEventListener("scroll", () => {
    smoothWrapper.scrollTop = 0;
    smoothWrapper.scrollLeft = 0;
  });
}

function setupNav() {
  navToggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  $$("a", navLinks).forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* =========================================================
   6. CUSTOM CURSOR
   ========================================================= */

const pointer = { x: 0, y: 0, ringX: 0, ringY: 0 };

function renderCursor() {
  pointer.ringX = lerp(pointer.ringX, pointer.x, 0.16);
  pointer.ringY = lerp(pointer.ringY, pointer.y, 0.16);

  cursorDot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
  cursorRing.style.transform = `translate3d(${pointer.ringX}px, ${pointer.ringY}px, 0)`;

  window.requestAnimationFrame(renderCursor);
}

function setupCursor() {
  if (!config.effects.customCursor || isTouch || reduceMotion) {
    return;
  }

  document.body.classList.add("has-cursor");
  pointer.x = window.innerWidth / 2;
  pointer.y = window.innerHeight / 2;
  pointer.ringX = pointer.x;
  pointer.ringY = pointer.y;

  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });

  const hoverSelector = "a, button, .choice";

  // Một handler duy nhất: pointerover bắn cho mọi phần tử con nên đủ để bật/tắt trạng thái.
  document.addEventListener("pointerover", (event) => {
    if (!event.target.closest(hoverSelector)) {
      document.body.classList.remove("cursor-hover");
      return;
    }

    const labelled = event.target.closest("[data-cursor]");

    cursorLabel.textContent = labelled ? labelled.dataset.cursor : "";
    document.body.classList.add("cursor-hover");
  });

  renderCursor();
}

/* =========================================================
   7. MAGNETIC BUTTONS + TILT CARDS
   ========================================================= */

function setupMagnetic() {
  if (!config.effects.magnetic || isTouch || reduceMotion) {
    return;
  }

  $$(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      element.style.transform = `translate3d(${x * 0.22}px, ${y * 0.34}px, 0)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
}

function setupTilt() {
  if (!config.effects.tilt || isTouch || reduceMotion) {
    return;
  }

  $$(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      card.style.setProperty("--mx", `${px * 100}%`);
      card.style.setProperty("--my", `${py * 100}%`);
      card.style.transform = `perspective(900px) rotateX(${(py - 0.5) * -9}deg) rotateY(${
        (px - 0.5) * 11
      }deg) translateY(-6px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

/* =========================================================
   8. AMBIENT CANVAS (bụi vàng + bokeh)
   ========================================================= */

let ambientParticles = [];
let dustSprite = null;
let bokehSprite = null;
let lastAmbientDraw = 0;

function resizeCanvases() {
  // Confetti cần nét nên dùng devicePixelRatio; lớp bụi vốn đã mờ nên vẽ ở 1x cho nhẹ.
  const ratio = Math.min(window.devicePixelRatio || 1, 1.6);

  celebrationCanvas.width = window.innerWidth * ratio;
  celebrationCanvas.height = window.innerHeight * ratio;
  confettiContext.setTransform(ratio, 0, 0, ratio, 0, 0);

  ambientCanvas.width = window.innerWidth;
  ambientCanvas.height = window.innerHeight;
  ambientContext.setTransform(1, 0, 0, 1, 0, 0);
}

/* Vẽ sẵn một "hạt sáng" ra canvas phụ. Nhờ đó vòng lặp chỉ cần drawImage,
   thay vì tạo gradient và bật shadowBlur cho từng hạt ở mỗi khung hình. */
function createGlowSprite(size, stops) {
  const sprite = document.createElement("canvas");
  const context = sprite.getContext("2d");
  const half = size / 2;

  sprite.width = size;
  sprite.height = size;

  const gradient = context.createRadialGradient(half, half, 0, half, half, half);
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  return sprite;
}

/* Nền kem sáng nên hạt phải là sắc vàng đồng đậm hơn nền, vẽ ở chế độ
   source-over. Nếu dùng "lighter" như nền tối thì hạt sẽ tan biến hoàn toàn. */
function createAmbientSprites() {
  dustSprite = createGlowSprite(64, [
    [0, "rgba(176, 124, 52, 0.95)"],
    [0.2, "rgba(196, 152, 88, 0.6)"],
    [0.55, "rgba(214, 180, 130, 0.16)"],
    [1, "rgba(214, 180, 130, 0)"],
  ]);

  bokehSprite = createGlowSprite(128, [
    [0, "rgba(222, 178, 120, 0.34)"],
    [0.45, "rgba(226, 190, 150, 0.14)"],
    [1, "rgba(226, 190, 150, 0)"],
  ]);
}

function createAmbientParticles() {
  const isSmall = window.innerWidth < 700;
  const dustCount = isSmall ? 22 : 44;
  const bokehCount = isSmall ? 4 : 8;

  const dust = Array.from({ length: dustCount }, () => ({
    sprite: "dust",
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: 2.5 + Math.random() * 6,
    speedY: -(0.07 + Math.random() * 0.24),
    drift: (Math.random() - 0.5) * 0.24,
    alpha: 0.16 + Math.random() * 0.34,
    phase: Math.random() * Math.PI * 2,
  }));

  const bokeh = Array.from({ length: bokehCount }, () => ({
    sprite: "bokeh",
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: 60 + Math.random() * 150,
    speedY: -(0.05 + Math.random() * 0.12),
    drift: (Math.random() - 0.5) * 0.16,
    alpha: 0.14 + Math.random() * 0.2,
    phase: Math.random() * Math.PI * 2,
  }));

  ambientParticles = [...bokeh, ...dust];
}

function renderAmbient(time = 0) {
  window.requestAnimationFrame(renderAmbient);

  // Bụi trôi rất chậm nên 30fps là quá đủ — tiết kiệm một nửa chi phí vẽ.
  if (document.hidden || time - lastAmbientDraw < 32) {
    return;
  }

  lastAmbientDraw = time;

  const width = window.innerWidth;
  const height = window.innerHeight;

  ambientContext.clearRect(0, 0, width, height);

  ambientParticles.forEach((particle) => {
    particle.y += particle.speedY;
    particle.x += particle.drift + Math.sin(time * 0.0006 + particle.phase) * 0.24;

    if (particle.y < -particle.size) {
      particle.y = height + particle.size;
      particle.x = Math.random() * width;
    }

    if (particle.x < -particle.size) particle.x = width + particle.size;
    if (particle.x > width + particle.size) particle.x = -particle.size;

    const isDust = particle.sprite === "dust";
    const twinkle = isDust ? 0.55 + Math.sin(time * 0.0018 + particle.phase) * 0.45 : 1;

    ambientContext.globalAlpha = particle.alpha * twinkle;
    ambientContext.drawImage(
      isDust ? dustSprite : bokehSprite,
      particle.x - particle.size,
      particle.y - particle.size,
      particle.size * 2,
      particle.size * 2
    );
  });

  ambientContext.globalAlpha = 1;
}

function startAmbient() {
  if (!config.effects.ambient || reduceMotion) {
    ambientCanvas.hidden = true;
    return;
  }

  createAmbientSprites();
  createAmbientParticles();
  renderAmbient();
}

/* =========================================================
   9. CONFETTI (giấy kim tuyến vàng)
   ========================================================= */

let confettiPieces = [];
let confettiFrame = 0;

function createConfetti(originX, originY) {
  // Bỏ tông trắng/kem — trên nền giấy sáng chúng gần như tàng hình.
  const colors = ["#b07c34", "#8c6027", "#d9a95c", "#c9757a", "#7d5a92", "#e8c88c"];
  const total = window.innerWidth < 640 ? 70 : 130;

  confettiPieces = Array.from({ length: total }, () => {
    const angle = Math.random() * Math.PI * 2;
    const power = 6 + Math.random() * 14;

    return {
      x: originX + (Math.random() - 0.5) * 120,
      y: originY + (Math.random() - 0.5) * 60,
      width: 4 + Math.random() * 8,
      height: 8 + Math.random() * 15,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      spin: Math.random() * Math.PI * 2,
      spinSpeed: 0.08 + Math.random() * 0.16,
      velocityX: Math.cos(angle) * power * 0.75,
      velocityY: Math.sin(angle) * power - 6,
      gravity: 0.17 + Math.random() * 0.13,
      drag: 0.986,
      alpha: 1,
      fade: 0.004 + Math.random() * 0.005,
    };
  });
}

function renderConfetti() {
  confettiContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

  confettiPieces = confettiPieces.filter((piece) => {
    piece.velocityX *= piece.drag;
    piece.velocityY = piece.velocityY * piece.drag + piece.gravity;
    piece.x += piece.velocityX;
    piece.y += piece.velocityY;
    piece.rotation += piece.rotationSpeed;
    piece.spin += piece.spinSpeed;
    piece.alpha -= piece.fade;

    // scaleX theo sin(spin) tạo cảm giác mảnh giấy lật trong không gian 3D
    const flip = Math.abs(Math.sin(piece.spin));

    confettiContext.save();
    confettiContext.globalAlpha = Math.max(piece.alpha, 0);
    confettiContext.translate(piece.x, piece.y);
    confettiContext.rotate(piece.rotation);
    confettiContext.scale(flip * 0.85 + 0.15, 1);
    confettiContext.fillStyle = piece.color;
    confettiContext.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
    confettiContext.restore();

    return piece.alpha > 0 && piece.y < window.innerHeight + 100;
  });

  if (confettiPieces.length) {
    confettiFrame = window.requestAnimationFrame(renderConfetti);
  } else {
    confettiContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

function burstConfetti(x = window.innerWidth / 2, y = window.innerHeight * 0.42) {
  if (!config.effects.confetti || reduceMotion) {
    return;
  }

  window.cancelAnimationFrame(confettiFrame);
  createConfetti(x, y);
  renderConfetti();
}

/* =========================================================
   10. GATE
   ========================================================= */

function openInvitation() {
  if (gateOpened) {
    return;
  }

  gateOpened = true;
  openInvitationButton.disabled = true;
  invitationGate.classList.add("is-opening");

  if (config.music.autoplay) {
    playMusic();
  }

  window.setTimeout(() => burstConfetti(), 420);

  window.setTimeout(() => {
    invitationGate.classList.add("is-hidden");
    invitationGate.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    playHeroIntro();
  }, 1250);

  window.setTimeout(() => {
    invitationGate.style.display = "none";
  }, 2200);
}

function skipGate() {
  gateOpened = true;
  invitationGate.classList.add("is-hidden");
  invitationGate.setAttribute("aria-hidden", "true");
  invitationGate.style.display = "none";
  document.body.classList.remove("is-locked");
  playHeroIntro();
}

/* =========================================================
   11. COUNTDOWN
   ========================================================= */

const countdownTargets = {
  days: $("#countDays"),
  hours: $("#countHours"),
  minutes: $("#countMinutes"),
  seconds: $("#countSeconds"),
};

const countdownNote = $("#countdownNote");
const ceremonyStart = new Date(config.ceremony.startISO);

function paintCountdownCell(element, value) {
  const next = String(value).padStart(2, "0");

  if (element.textContent === next) {
    return;
  }

  element.textContent = next;

  if (reduceMotion) {
    return;
  }

  element.classList.remove("is-ticking");
  // reflow để animation chạy lại từ đầu
  void element.offsetWidth;
  element.classList.add("is-ticking");
}

function updateCountdown() {
  const diff = ceremonyStart.getTime() - Date.now();

  if (diff <= 0) {
    Object.values(countdownTargets).forEach((element) => {
      element.textContent = "00";
    });
    countdownNote.textContent = "Buổi lễ đã diễn ra — cảm ơn bạn đã đồng hành cùng mình!";
    return false;
  }

  const seconds = Math.floor(diff / 1000);

  paintCountdownCell(countdownTargets.days, Math.floor(seconds / 86400));
  paintCountdownCell(countdownTargets.hours, Math.floor((seconds % 86400) / 3600));
  paintCountdownCell(countdownTargets.minutes, Math.floor((seconds % 3600) / 60));
  paintCountdownCell(countdownTargets.seconds, seconds % 60);

  return true;
}

function startCountdown() {
  if (!updateCountdown()) {
    return;
  }

  const timer = window.setInterval(() => {
    if (!updateCountdown()) {
      window.clearInterval(timer);
    }
  }, 1000);
}

/* =========================================================
   12. ADD TO CALENDAR + MAP
   ========================================================= */

function toICSDate(isoString) {
  return new Date(isoString).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function downloadICS() {
  const { startISO, endISO, title, place, address } = config.ceremony;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Graduation Invitation//VN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:graduation-${Date.now()}@invitation`,
    `DTSTAMP:${toICSDate(new Date().toISOString())}`,
    `DTSTART:${toICSDate(startISO)}`,
    `DTEND:${toICSDate(endISO)}`,
    `SUMMARY:${title}`,
    `LOCATION:${place}\\, ${address}`,
    "DESCRIPTION:Hẹn gặp bạn tại lễ tốt nghiệp của mình!",
    "BEGIN:VALARM",
    "TRIGGER:-PT1440M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Ngày mai là lễ tốt nghiệp",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "le-tot-nghiep.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function setupCalendarAndMap() {
  const calendarButton = $("#addToCalendar");
  const mapLink = $("#openMap");

  calendarButton.addEventListener("click", () => {
    downloadICS();

    const label = $("span", calendarButton);
    const original = label.textContent;

    label.textContent = "Đã tải file lịch";
    window.setTimeout(() => {
      label.textContent = original;
    }, 2600);
  });

  mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    config.ceremony.mapQuery || config.ceremony.address
  )}`;
}

/* =========================================================
   13. CLICK SPARK
   ========================================================= */

function createClickSpark(event) {
  if (!config.effects.clickSpark || reduceMotion) {
    return;
  }

  const spark = document.createElement("span");

  spark.className = "click-spark";
  spark.style.left = `${event.clientX}px`;
  spark.style.top = `${event.clientY}px`;
  document.body.appendChild(spark);

  window.setTimeout(() => spark.remove(), 760);
}

/* =========================================================
   15. RSVP FORM
   ========================================================= */

function setFormStatus(message, isError = false) {
  formStatus.textContent = message;
  formStatus.classList.toggle("is-error", isError);
}

function validateForm(data) {
  const nameInput = $("input[name='name']", rsvpForm);

  nameInput.classList.remove("is-invalid");

  if (!data.name || !data.name.trim()) {
    nameInput.classList.add("is-invalid");
    nameInput.focus();
    setFormStatus("Bạn cho mình xin họ tên nhé.", true);
    return false;
  }

  if (!data.attendance) {
    setFormStatus("Bạn chọn giúp mình là có tham dự hay không nhé.", true);
    return false;
  }

  return true;
}

/* Gói dữ liệu bằng nhãn tiếng Việt: các dịch vụ forward đều lấy thẳng tên
   trường làm nhãn trong mail báo về, nên đặt sẵn cho dễ đọc. */
function buildRsvpPayload(data) {
  return {
    "Họ tên": data.name,
    "Số điện thoại": data.phone || "Không cung cấp",
    "Tham dự": data.attendance,
    "Lời nhắn": data.message || "Không có",
    "Gửi lúc": new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
  };
}

/* Trả về false khi chưa cấu hình gì (để rơi về phương án mở app email),
   ném lỗi khi có cấu hình mà gửi thất bại. */
async function sendRsvp(data) {
  const { provider, accessKey, endpoint } = config.form;
  const payload = buildRsvpPayload(data);

  if (provider === "web3forms") {
    if (!accessKey) {
      return false;
    }

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `[Tốt nghiệp] ${data.name} - ${data.attendance}`,
        from_name: "Thiệp mời tốt nghiệp",
        botcheck: data.botcheck || "",
        ...payload,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
      throw new Error(result.message || "Web3Forms từ chối yêu cầu");
    }

    return true;
  }

  if (!endpoint) {
    return false;
  }

  /* Google Apps Script không trả header CORS cho fetch thường. Gửi ở chế độ
     no-cors thì trình duyệt vẫn đẩy dữ liệu đi, chỉ là không đọc được phản hồi
     — nên ở nhánh này "không văng lỗi" được coi là gửi thành công. */
  if (provider === "sheets") {
    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      // để trình duyệt tự đặt text/plain, tránh preflight mà Apps Script không đáp
      body: JSON.stringify(payload),
    });

    return true;
  }

  // formspree / getform và mọi endpoint nhận JSON khác
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Endpoint trả về lỗi");
  }

  return true;
}

function openRsvpMail(data) {
  const subject = encodeURIComponent(`Xác nhận tham dự tốt nghiệp - ${data.name}`);
  const body = encodeURIComponent(
    Object.entries(buildRsvpPayload(data))
      .map(([label, value]) => `${label}: ${value}`)
      .join("\n")
  );

  window.location.href = `mailto:${config.contactEmail}?subject=${subject}&body=${body}`;
}

function setupForm() {
  rsvpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(rsvpForm).entries());

    if (!validateForm(data)) {
      return;
    }

    const submitButton = $("button[type='submit']", rsvpForm);

    submitButton.disabled = true;
    setFormStatus("Đang gửi xác nhận...");

    const celebrate = () => {
      if (data.attendance && data.attendance.startsWith("Có")) {
        const rect = submitButton.getBoundingClientRect();
        burstConfetti(rect.left + rect.width / 2, rect.top);
      }
    };

    try {
      if (await sendRsvp(data)) {
        rsvpForm.reset();
        submitButton.disabled = false;
        setFormStatus("Cảm ơn bạn, mình đã nhận được xác nhận!");
        celebrate();
        return;
      }
    } catch (error) {
      setFormStatus("Chưa gửi được online, mình sẽ mở email để bạn gửi xác nhận.", true);
    }

    openRsvpMail(data);
    submitButton.disabled = false;
    setFormStatus("Email xác nhận đã được mở trên thiết bị của bạn.");
    celebrate();
  });
}

/* =========================================================
   15. NHẠC NỀN
   ========================================================= */

const bgMusic = $("#bgMusic");
const musicToggle = $("#musicToggle");

let musicFade = 0;
let musicWanted = false;

/* Trình duyệt chặn phát tiếng khi trang chưa được người dùng chạm vào, nên
   nhạc chỉ bật từ một thao tác thật: bấm "Mở thiệp mời", hoặc chạm/cuộn đầu tiên
   với những link mở thẳng nội dung (?preview=1). */
function fadeMusicTo(target, done) {
  window.clearInterval(musicFade);

  musicFade = window.setInterval(() => {
    const diff = target - bgMusic.volume;

    if (Math.abs(diff) < 0.03) {
      bgMusic.volume = target;
      window.clearInterval(musicFade);

      if (done) {
        done();
      }

      return;
    }

    bgMusic.volume = clamp(bgMusic.volume + Math.sign(diff) * 0.03, 0, 1);
  }, 60);
}

function setMusicState(playing) {
  musicToggle.classList.toggle("is-playing", playing);
  musicToggle.setAttribute("aria-pressed", String(playing));
  musicToggle.setAttribute("title", playing ? "Tắt nhạc" : "Bật nhạc");
}

async function playMusic() {
  if (!bgMusic || musicWanted) {
    return;
  }

  musicWanted = true;
  bgMusic.volume = 0;

  try {
    await bgMusic.play();
    fadeMusicTo(config.music.volume);
    setMusicState(true);
  } catch (error) {
    // Vẫn bị chặn (thường do chế độ tiết kiệm dữ liệu) — để nút chờ người dùng bấm
    musicWanted = false;
    setMusicState(false);
  }
}

function pauseMusic() {
  musicWanted = false;
  fadeMusicTo(0, () => bgMusic.pause());
  setMusicState(false);
}

function setupMusic() {
  if (!bgMusic || !musicToggle) {
    return;
  }

  if (!config.music.enabled) {
    musicToggle.remove();
    bgMusic.remove();
    return;
  }

  musicToggle.addEventListener("click", () => {
    if (musicWanted) {
      pauseMusic();
      return;
    }

    playMusic();
  });

  bgMusic.addEventListener("play", () => setMusicState(true));
  bgMusic.addEventListener("pause", () => {
    if (!musicWanted) {
      setMusicState(false);
    }
  });

  // Tạm dừng khi khách chuyển sang tab khác, phát lại khi quay về
  document.addEventListener("visibilitychange", () => {
    if (!musicWanted) {
      return;
    }

    if (document.hidden) {
      bgMusic.pause();
    } else {
      bgMusic.play().catch(() => {});
    }
  });
}

/* Thao tác đầu tiên bất kỳ cũng đủ để mở khoá âm thanh */
function armMusicAutoplay() {
  if (!bgMusic || !config.music.enabled || !config.music.autoplay) {
    return;
  }

  const events = ["pointerdown", "touchstart", "keydown", "wheel", "scroll"];

  const trigger = () => {
    events.forEach((name) => window.removeEventListener(name, trigger));
    playMusic();
  };

  events.forEach((name) => window.addEventListener(name, trigger, { once: true, passive: true }));
}

/* =========================================================
   16. KHỞI ĐỘNG
   ========================================================= */

function init() {
  resizeCanvases();
  prepareSplitText();
  runPreloader();
  setupSmoothScroll();
  setupReveal();
  setupAnchors();
  setupNav();
  setupCursor();
  setupMagnetic();
  setupTilt();
  setupForm();
  setupCalendarAndMap();
  setupMusic();
  startAmbient();
  startCountdown();
  onScroll();

  openInvitationButton.addEventListener("click", openInvitation);

  // Bỏ qua gate khi mở bằng ?preview=1
  if (new URLSearchParams(window.location.search).get("preview") === "1") {
    skipGate();
    armMusicAutoplay();
  } else {
    window.setTimeout(() => openInvitationButton.focus(), 800);
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  window.addEventListener("resize", () => {
    resizeCanvases();
    measureSmoothHeight();
    updateActiveSection();

    if (config.effects.ambient && !reduceMotion) {
      createAmbientParticles();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (!gateOpened) {
      openInvitation();
      return;
    }

    if (document.body.classList.contains("nav-open")) {
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".btn, button")) {
      createClickSpark(event);
    }
  });
}

init();
