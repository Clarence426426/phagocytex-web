const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = [...document.querySelectorAll(".main-nav a")];
const scrollProgress = document.querySelector("[data-scroll-progress]");
const hero = document.querySelector(".hero");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const contactRecipients = [
  "admin@phagocytex.com",
];

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

const closeNav = () => {
  document.body.classList.remove("nav-open");
  header.classList.remove("is-open");
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  document.body.classList.toggle("nav-open", isOpen);
  header.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeNav);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNav();
  }
});

const contactForm = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const organisation = formData.get("organisation")?.toString().trim() || "Not provided";
    const type = formData.get("type")?.toString().trim();
    const message = formData.get("message")?.toString().trim();
    const subject = `Phagocytex enquiry: ${type || "General enquiry"}`;
    const body = [
      "New enquiry from the Phagocytex website",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Organisation: ${organisation}`,
      `Enquiry type: ${type}`,
      "",
      "Message:",
      message,
      "",
      "Please reply directly to the sender.",
    ].join("\n");

    const mailto = `mailto:${contactRecipients.join(",")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (formNote) {
      formNote.textContent = "Opening your email client with the enquiry prepared.";
      formNote.classList.add("is-success");
    }

    window.location.href = mailto;
  });
}

const revealTargets = [
  ".section-heading",
  ".section-grid",
  ".feature-card",
  ".science-flow article",
  ".study-hero-figure",
  ".study-data-figure",
  ".study-card",
  ".metric",
  ".news-card",
  ".team-grid article",
  ".pipeline-board",
  ".contact",
  ".hero-panel > div",
  ".intro .section-grid > *",
];

const revealElements = [...new Set(revealTargets.flatMap((selector) => [...document.querySelectorAll(selector)]))];
const metricValues = new Map();

revealElements.forEach((element) => {
  const siblingReveals = [...(element.parentElement?.children || [])].filter((child) => revealElements.includes(child));
  const revealIndex = Math.min(Math.max(siblingReveals.indexOf(element), 0), 5);

  element.classList.add("reveal");
  element.style.setProperty("--reveal-index", revealIndex);

  if (element.matches(".metric")) {
    const value = element.querySelector("strong");
    const match = value?.textContent.trim().match(/^(\d+)(.*)$/);

    if (value && match) {
      metricValues.set(value, {
        finalText: value.textContent.trim(),
        number: Number(match[1]),
        suffix: match[2],
      });
    }
  }
});

const animateMetricValue = (value) => {
  if (reduceMotion || value.dataset.counted === "true" || !metricValues.has(value)) return;

  const metric = metricValues.get(value);
  const duration = 920;
  const start = performance.now();
  value.dataset.counted = "true";

  const tick = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(metric.number * eased);

    value.textContent = progress < 1 ? `${current}${metric.suffix}` : metric.finalText;

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    }
  };

  window.requestAnimationFrame(tick);
};

const updateScrollProgress = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

  document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
  scrollProgress?.style.setProperty("--scroll-progress", progress.toFixed(4));
};

const studyHeroImg = document.querySelector(".study-hero-figure img");

const updateHeroMotion = () => {
  if (!hero) return;

  const rect = hero.getBoundingClientRect();
  const progress = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
  document.documentElement.style.setProperty("--hero-progress", progress.toFixed(4));
};

const updateParallax = () => {
  if (!studyHeroImg || reduceMotion) return;
  const rect = studyHeroImg.parentElement.getBoundingClientRect();
  const center = rect.top + rect.height / 2 - window.innerHeight / 2;
  const shift = Math.min(Math.max(center * 0.12, -30), 30);
  studyHeroImg.style.transform = `translateY(${shift}px)`;
};

// Reset parallax once card is visible so zoom-out transition still works
const patchParallaxOnVisible = () => {
  if (!studyHeroImg) return;
  const figure = studyHeroImg.closest(".study-hero-figure");
  if (figure?.classList.contains("is-visible")) {
    studyHeroImg.style.transition = "transform 950ms cubic-bezier(0.16, 1, 0.3, 1)";
  }
};

const updateRevealState = () => {
  revealElements.forEach((element) => {
    if (element.classList.contains("is-visible")) return;

    const rect = element.getBoundingClientRect();
    const entersViewport = rect.top < window.innerHeight * 0.88 && rect.bottom > 0;
    if (entersViewport) {
      element.classList.add("is-visible");

      if (element.matches(".metric")) {
        const value = element.querySelector("strong");
        if (value) animateMetricValue(value);
      }
    }
  });
};

let scrollTicking = false;
const updateScrollAnimations = () => {
  if (scrollTicking) return;
  scrollTicking = true;

  window.requestAnimationFrame(() => {
    updateScrollProgress();
    updateHeroMotion();
    updateRevealState();
    updateParallax();
    patchParallaxOnVisible();
    scrollTicking = false;
  });
};

if (reduceMotion) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
  document.documentElement.style.setProperty("--scroll-progress", "1");
  document.documentElement.style.setProperty("--hero-progress", "0");
} else {
  updateScrollAnimations();
  window.addEventListener("scroll", updateScrollAnimations, { passive: true });
  window.addEventListener("resize", updateScrollAnimations);
}
