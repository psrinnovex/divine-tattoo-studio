const root = document.documentElement;
const body = document.body;
const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const heroBackdrop = document.querySelector(".hero-backdrop");
const heroFigure = document.querySelector(".hero-figure");
const heroNoise = document.querySelector(".hero-noise");
const heroMarquee = document.querySelector(".hero-marquee");
const navToggle = document.querySelector(".nav-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-menu a");
const navSectionLinks = document.querySelectorAll(
  ".nav-links a:not(.button)[href^='#'], .mobile-menu-panel a:not(.button)[href^='#']"
);
const revealItems = [...document.querySelectorAll(".reveal")];
const faqButtons = [...document.querySelectorAll(".faq-trigger")];
const sectionShells = [...document.querySelectorAll(".section-shell")];
const trackedSections = [...document.querySelectorAll("main section[id]")];
const parallaxItems = [...document.querySelectorAll("[data-parallax]")];
const tiltItems = [...document.querySelectorAll("[data-tilt]")];
const portfolioItems = [...document.querySelectorAll(".portfolio-item")];
const counterItems = [...document.querySelectorAll("[data-count]")];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)");

const compactNumberFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

let activeSectionId = "";
let scrollTicking = false;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const easeOutCubic = (value) => 1 - (1 - value) ** 3;

const closeMenu = () => {
  body.classList.remove("menu-open");
  navToggle?.setAttribute("aria-expanded", "false");
};

const resetTilt = (item) => {
  item.style.setProperty("--tilt-x", "0deg");
  item.style.setProperty("--tilt-y", "0deg");
  item.style.setProperty("--pointer-x", "50%");
  item.style.setProperty("--pointer-y", "50%");
  item.style.setProperty("--sheen-opacity", "0");
};

const formatCounterValue = (element, value) => {
  if (element.dataset.countFormat === "compact") {
    return compactNumberFormatter.format(value).replace("k", "K");
  }

  const suffix = element.dataset.countSuffix ?? "";
  return `${Math.round(value).toLocaleString()}${suffix}`;
};

const animateCounter = (element) => {
  if (element.dataset.countAnimated === "true") {
    return;
  }

  const endValue = Number(element.dataset.count ?? 0);

  if (!Number.isFinite(endValue)) {
    return;
  }

  element.dataset.countAnimated = "true";

  const duration = 1400;
  const startTime = performance.now();

  const tick = (currentTime) => {
    const progress = clamp((currentTime - startTime) / duration, 0, 1);
    const currentValue = endValue * easeOutCubic(progress);
    const displayValue = progress >= 1 ? endValue : currentValue;

    element.textContent = formatCounterValue(element, displayValue);

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    }
  };

  window.requestAnimationFrame(tick);
};

const finalizeCounters = () => {
  counterItems.forEach((counter) => {
    const value = Number(counter.dataset.count ?? 0);
    counter.textContent = formatCounterValue(counter, value);
    counter.dataset.countAnimated = "true";
  });
};

const setGroupRevealDelays = (selector, step = 90) => {
  document.querySelectorAll(selector).forEach((container) => {
    [...container.children]
      .filter((child) => child.classList.contains("reveal"))
      .forEach((child, index) => {
        child.style.setProperty("--reveal-delay", `${index * step}ms`);
      });
  });
};

const applyRevealDelays = () => {
  [
    ".hero-content",
    ".styles-grid",
    ".portfolio-grid",
    ".artists-grid",
    ".trust-grid",
    ".reasons-grid",
    ".process-grid",
    ".testimonials-grid",
    ".studio-grid",
    ".faq-list",
  ].forEach((selector) => setGroupRevealDelays(selector));

  document.querySelectorAll(".section-heading.reveal").forEach((heading) => {
    heading.style.setProperty("--reveal-delay", "40ms");
  });

  heroMarquee?.style.setProperty("--reveal-delay", "180ms");
};

const syncOpenFaqPanels = () => {
  faqButtons.forEach((button) => {
    const panel = button.nextElementSibling;
    if (!(panel instanceof HTMLElement)) {
      return;
    }

    const isOpen = button.getAttribute("aria-expanded") === "true";
    panel.style.maxHeight = isOpen ? `${panel.scrollHeight}px` : "0px";
  });
};

const updateActiveSection = () => {
  const marker = window.innerHeight * 0.36;
  let currentSectionId = "";

  trackedSections.forEach((section) => {
    const rect = section.getBoundingClientRect();

    if (rect.top <= marker && rect.bottom > marker) {
      currentSectionId = section.id;
    }
  });

  if (!currentSectionId && window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
    currentSectionId = trackedSections.at(-1)?.id ?? "";
  }

  if (currentSectionId === activeSectionId) {
    return;
  }

  activeSectionId = currentSectionId;

  navSectionLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${currentSectionId}`);
  });
};

const updateScrollMotion = () => {
  const scrollY = window.scrollY || window.pageYOffset;
  const scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const pageProgress = clamp(scrollY / scrollRange, 0, 1);

  root.style.setProperty("--scroll-progress", pageProgress.toFixed(4));
  header?.classList.toggle("is-scrolled", scrollY > 24);
  updateActiveSection();

  if (prefersReducedMotion.matches) {
    return;
  }

  if (hero) {
    const heroProgress = clamp(scrollY / Math.max(hero.offsetHeight * 0.92, 1), 0, 1);

    root.style.setProperty("--hero-progress", heroProgress.toFixed(4));
    heroBackdrop?.style.setProperty("--hero-backdrop-scale", (1.08 + heroProgress * 0.08).toFixed(4));
    heroFigure?.style.setProperty("--hero-figure-scale", (1 + heroProgress * 0.1).toFixed(4));
    heroMarquee?.style.setProperty("--hero-marquee-x", `${(heroProgress * -36).toFixed(2)}px`);

    if (heroNoise) {
      heroNoise.style.opacity = `${(0.18 - heroProgress * 0.08).toFixed(3)}`;
    }
  }

  parallaxItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const depth = Number(item.dataset.depth ?? 12);
    const centeredOffset = ((rect.top + rect.height / 2) - window.innerHeight / 2) / window.innerHeight;
    const translateY = clamp(centeredOffset * depth * -1, depth * -1.35, depth * 1.35);

    item.style.setProperty("--parallax-y", `${translateY.toFixed(2)}px`);
  });

  portfolioItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const progress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1);
    const centered = progress * 2 - 1;
    const mediaShift = centered * -22;
    const overlayShift = centered * 10;

    item.style.setProperty("--media-shift", `${mediaShift.toFixed(2)}px`);
    item.style.setProperty("--overlay-shift", `${overlayShift.toFixed(2)}px`);
  });
};

const requestScrollUpdate = () => {
  if (scrollTicking) {
    return;
  }

  scrollTicking = true;

  window.requestAnimationFrame(() => {
    updateScrollMotion();
    scrollTicking = false;
  });
};

const setupReveals = () => {
  if (prefersReducedMotion.matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -60px 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
};

const setupSectionObserver = () => {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("in-view", entry.isIntersecting);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "-10% 0px -10% 0px",
    }
  );

  sectionShells.forEach((section) => sectionObserver.observe(section));
};

const setupCounters = () => {
  if (!counterItems.length) {
    return;
  }

  if (prefersReducedMotion.matches) {
    finalizeCounters();
    return;
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.65,
    }
  );

  counterItems.forEach((counter) => counterObserver.observe(counter));
};

const setupTilt = () => {
  tiltItems.forEach(resetTilt);

  if (prefersReducedMotion.matches || !supportsHover.matches) {
    return;
  }

  tiltItems.forEach((item) => {
    if (item.dataset.tiltBound === "true") {
      return;
    }

    item.dataset.tiltBound = "true";

    item.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") {
        return;
      }

      const rect = item.getBoundingClientRect();
      const pointerX = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
      const pointerY = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
      const rotateY = ((pointerX - 50) / 50) * 6;
      const rotateX = ((50 - pointerY) / 50) * 6;

      item.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
      item.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
      item.style.setProperty("--pointer-x", `${pointerX.toFixed(2)}%`);
      item.style.setProperty("--pointer-y", `${pointerY.toFixed(2)}%`);
      item.style.setProperty("--sheen-opacity", "1");
    });

    item.addEventListener("pointerleave", () => {
      resetTilt(item);
    });

    item.addEventListener("pointercancel", () => {
      resetTilt(item);
    });

    item.addEventListener("focusin", () => {
      item.style.setProperty("--sheen-opacity", "0.8");
    });

    item.addEventListener("focusout", () => {
      resetTilt(item);
    });
  });
};

const resetMotionState = () => {
  root.style.setProperty("--hero-progress", "0");

  heroBackdrop?.style.removeProperty("--hero-backdrop-scale");
  heroFigure?.style.removeProperty("--hero-figure-scale");
  heroMarquee?.style.removeProperty("--hero-marquee-x");

  if (heroNoise) {
    heroNoise.style.removeProperty("opacity");
  }

  parallaxItems.forEach((item) => item.style.removeProperty("--parallax-y"));
  portfolioItems.forEach((item) => {
    item.style.removeProperty("--media-shift");
    item.style.removeProperty("--overlay-shift");
  });

  tiltItems.forEach(resetTilt);
};

navToggle?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("menu-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

mobileMenu?.addEventListener("click", (event) => {
  if (event.target === mobileMenu) {
    closeMenu();
  }
});

mobileLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

faqButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const panel = button.nextElementSibling;
    const isOpen = item?.classList.contains("is-open");

    faqButtons.forEach((otherButton) => {
      const otherItem = otherButton.closest(".faq-item");
      const otherPanel = otherButton.nextElementSibling;

      otherItem?.classList.remove("is-open");
      otherButton.setAttribute("aria-expanded", "false");

      if (otherPanel instanceof HTMLElement) {
        otherPanel.style.maxHeight = "0px";
      }
    });

    if (!item || !(panel instanceof HTMLElement) || isOpen) {
      return;
    }

    item.classList.add("is-open");
    button.setAttribute("aria-expanded", "true");
    panel.style.maxHeight = `${panel.scrollHeight}px`;
  });
});

applyRevealDelays();
setupReveals();
setupSectionObserver();
setupCounters();
setupTilt();
updateScrollMotion();
syncOpenFaqPanels();

window.addEventListener("scroll", requestScrollUpdate, { passive: true });

window.addEventListener("resize", () => {
  syncOpenFaqPanels();
  requestScrollUpdate();
});

window.addEventListener("load", () => {
  syncOpenFaqPanels();
  updateScrollMotion();
});

const handleMotionPreferenceChange = () => {
  if (prefersReducedMotion.matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    finalizeCounters();
    resetMotionState();
  } else {
    setupCounters();
    setupTilt();
    requestScrollUpdate();
  }
};

if (typeof prefersReducedMotion.addEventListener === "function") {
  prefersReducedMotion.addEventListener("change", handleMotionPreferenceChange);
} else if (typeof prefersReducedMotion.addListener === "function") {
  prefersReducedMotion.addListener(handleMotionPreferenceChange);
}
