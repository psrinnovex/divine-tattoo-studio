const root = document.documentElement;
const body = document.body;
const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const heroBackdrop = document.querySelector(".hero-backdrop");
const heroFigure = document.querySelector(".hero-figure");
const heroNoise = document.querySelector(".hero-noise");
const heroMarquee = document.querySelector(".hero-marquee");
const canonicalLink = document.querySelector("#canonical-link");
const ogUrlMeta = document.querySelector("#og-url");
const ogImageMeta = document.querySelector("#og-image");
const twitterImageMeta = document.querySelector("#twitter-image");
const metaDescription = document.querySelector('meta[name="description"]');
const structuredDataScript = document.querySelector("#structured-data");
const navToggle = document.querySelector(".nav-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-menu a");
const navSectionLinks = document.querySelectorAll(
  ".nav-links a:not(.button)[href^='#'], .mobile-menu-panel a:not(.button)[href^='#']"
);
const instagramTriggers = [...document.querySelectorAll("[data-instagram-trigger]")];
const instagramModal = document.querySelector("#instagram-modal");
const instagramModalCloseButtons =
  instagramModal instanceof HTMLElement
    ? [...instagramModal.querySelectorAll("[data-instagram-close]")]
    : [];
const instagramModalAccountLinks =
  instagramModal instanceof HTMLElement ? [...instagramModal.querySelectorAll(".instagram-account")] : [];
const contactPhoneLink = document.querySelector("[data-contact-phone]");
const whatsappLinks = [...document.querySelectorAll("[data-whatsapp-link]")];
const revealItems = [...document.querySelectorAll(".reveal")];
const faqButtons = [...document.querySelectorAll(".faq-trigger")];
const sectionShells = [...document.querySelectorAll(".section-shell")];
const trackedSections = [...document.querySelectorAll("main section[id]")];
const parallaxItems = [...document.querySelectorAll("[data-parallax]")];
const tiltItems = [...document.querySelectorAll("[data-tilt]")];
const portfolioItems = [...document.querySelectorAll(".portfolio-item")];
const counterItems = [...document.querySelectorAll("[data-count]")];
const autoplayMediaItems = [...document.querySelectorAll("[data-autoplay-media]")];
const styleHeadings = [...document.querySelectorAll(".style-card h3")];
const footerBusiness = document.querySelector(".footer-business");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)");

const compactNumberFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

let activeSectionId = "";
let scrollTicking = false;
let activeInstagramTrigger = null;
let autoplayMediaObserver = null;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const easeOutCubic = (value) => 1 - (1 - value) ** 3;
const normalizeText = (value = "") => value.replace(/\s+/g, " ").trim();

const getPublicPageUrl = () => {
  if (!/^https?:$/i.test(window.location.protocol)) {
    return "/";
  }

  const normalizedPath = window.location.pathname.endsWith("/index.html")
    ? window.location.pathname.slice(0, -"/index.html".length) || "/"
    : window.location.pathname || "/";

  return new URL(normalizedPath, window.location.origin).toString();
};

const toPublicUrl = (path, baseUrl = getPublicPageUrl()) => {
  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!/^https?:$/i.test(window.location.protocol)) {
    return path;
  }

  return new URL(path, baseUrl).toString();
};

const formatServiceName = (service) => {
  if (!service) {
    return "";
  }

  if (/custom/i.test(service)) {
    return "Custom tattoo design";
  }

  return /tattoo/i.test(service) ? service : `${service} tattoos`;
};

const buildStructuredData = () => {
  if (!(footerBusiness instanceof HTMLElement)) {
    return null;
  }

  const pageUrl = getPublicPageUrl();
  const primaryImageUrl = toPublicUrl("./assets/portfolio-coloring-detail.jpg", pageUrl);
  const heroImageUrl = toPublicUrl("./assets/hero-bg.jpg", pageUrl);
  const businessName = footerBusiness.dataset.businessName || "Divine Tattoo Studio";
  const businessId = `${pageUrl}#business`;
  const websiteId = `${pageUrl}#website`;
  const webpageId = `${pageUrl}#webpage`;
  const faqId = `${pageUrl}#faq`;
  const services = styleHeadings
    .map((heading) => formatServiceName(normalizeText(heading.textContent || "")))
    .filter(Boolean);
  const faqEntries = faqButtons
    .map((button) => {
      const question = normalizeText(
        button.querySelector("span")?.textContent || button.textContent || ""
      );
      const answer = normalizeText(button.nextElementSibling?.textContent || "");

      if (!question || !answer) {
        return null;
      }

      return {
        "@type": "Question",
        "name": question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": answer,
        },
      };
    })
    .filter(Boolean);
  const socialProfiles = [
    ...new Set(
      [...instagramModalAccountLinks, ...instagramTriggers]
        .filter((link) => link instanceof HTMLAnchorElement)
        .map((link) => link.href)
        .filter(Boolean)
    ),
  ];
  const openingDays = (footerBusiness.dataset.openingDays || "")
    .split(",")
    .map((day) => normalizeText(day))
    .filter(Boolean)
    .map((day) => `https://schema.org/${day}`);
  const trustDescription = normalizeText(
    document.querySelector("#trust .trust-copy > p:last-of-type")?.textContent ||
      "Sterile tattoo workflow at Divine Tattoo Studio."
  );
  const trustVideo = autoplayMediaItems.find((media) => media instanceof HTMLVideoElement);
  const trustVideoSource = trustVideo?.querySelector("source")?.getAttribute("src") || "";
  const trustVideoPoster = trustVideo?.getAttribute("poster") || "";
  const graph = [
    {
      "@type": ["HealthAndBeautyBusiness", "LocalBusiness"],
      "@id": businessId,
      "name": businessName,
      "url": pageUrl,
      "description": metaDescription?.getAttribute("content") || "",
      "image": [primaryImageUrl, heroImageUrl].filter(Boolean),
      "telephone": contactPhoneLink?.getAttribute("href")?.replace(/^tel:/i, "") || "",
      "priceRange": footerBusiness.dataset.priceRange || undefined,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": footerBusiness.dataset.streetAddress || "",
        "addressLocality": footerBusiness.dataset.addressLocality || "",
        "addressRegion": footerBusiness.dataset.addressRegion || "",
        "postalCode": footerBusiness.dataset.postalCode || "",
        "addressCountry": footerBusiness.dataset.addressCountry || "",
      },
      "openingHoursSpecification":
        openingDays.length && footerBusiness.dataset.opens && footerBusiness.dataset.closes
          ? [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": openingDays,
                "opens": footerBusiness.dataset.opens,
                "closes": footerBusiness.dataset.closes,
              },
            ]
          : undefined,
      "areaServed": footerBusiness.dataset.addressLocality
        ? [
            {
              "@type": "City",
              "name": footerBusiness.dataset.addressLocality,
            },
          ]
        : undefined,
      "sameAs": socialProfiles.length ? socialProfiles : undefined,
      "hasOfferCatalog": services.length
        ? {
            "@type": "OfferCatalog",
            "name": "Tattoo services",
            "itemListElement": services.map((service, index) => ({
              "@type": "Offer",
              "position": index + 1,
              "itemOffered": {
                "@type": "Service",
                "name": service,
              },
            })),
          }
        : undefined,
      "mainEntityOfPage": {
        "@id": webpageId,
      },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      "url": pageUrl,
      "name": businessName,
      "description": metaDescription?.getAttribute("content") || "",
      "inLanguage": "en-IN",
      "publisher": {
        "@id": businessId,
      },
    },
    {
      "@type": "WebPage",
      "@id": webpageId,
      "url": pageUrl,
      "name": document.title,
      "description": metaDescription?.getAttribute("content") || "",
      "isPartOf": {
        "@id": websiteId,
      },
      "about": {
        "@id": businessId,
      },
      "primaryImageOfPage": primaryImageUrl
        ? {
            "@type": "ImageObject",
            "url": primaryImageUrl,
            "width": 1600,
            "height": 900,
          }
        : undefined,
      "inLanguage": "en-IN",
    },
  ];

  if (faqEntries.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": faqId,
      "url": `${pageUrl}#faq`,
      "isPartOf": {
        "@id": websiteId,
      },
      "mainEntity": faqEntries,
    });
  }

  if (trustVideoSource) {
    graph.push({
      "@type": "VideoObject",
      "@id": `${pageUrl}#sterile-protocol-video`,
      "name": "Sterile tattoo workflow at Divine Tattoo Studio",
      "description": trustDescription,
      "thumbnailUrl": trustVideoPoster ? toPublicUrl(trustVideoPoster, pageUrl) : undefined,
      "contentUrl": toPublicUrl(trustVideoSource, pageUrl),
      "embedUrl": `${pageUrl}#trust`,
      "isPartOf": {
        "@id": webpageId,
      },
      "inLanguage": "en-IN",
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
};

const syncSeoMetadata = () => {
  const pageUrl = getPublicPageUrl();
  const previewImageUrl = toPublicUrl("./assets/portfolio-coloring-detail.jpg", pageUrl);

  canonicalLink?.setAttribute("href", pageUrl);
  ogUrlMeta?.setAttribute("content", pageUrl);
  ogImageMeta?.setAttribute("content", previewImageUrl);
  twitterImageMeta?.setAttribute("content", previewImageUrl);

  if (structuredDataScript instanceof HTMLScriptElement) {
    const structuredData = buildStructuredData();
    structuredDataScript.textContent = structuredData
      ? JSON.stringify(structuredData, null, 2)
      : "";
  }
};

const syncHeaderHeight = () => {
  if (!(header instanceof HTMLElement)) {
    return;
  }

  root.style.setProperty("--header-height", `${Math.ceil(header.getBoundingClientRect().height)}px`);
};

const getContactWhatsAppNumber = () => {
  if (!(contactPhoneLink instanceof HTMLAnchorElement)) {
    return "";
  }

  const rawPhone = contactPhoneLink.getAttribute("href") || contactPhoneLink.textContent || "";
  return rawPhone.replace(/^tel:/i, "").replace(/\D/g, "");
};

const closeMenu = () => {
  body.classList.remove("menu-open");
  navToggle?.setAttribute("aria-expanded", "false");
};

const syncInstagramTriggerState = (expandedTrigger = null) => {
  instagramTriggers.forEach((trigger) => {
    trigger.setAttribute("aria-expanded", String(trigger === expandedTrigger));
  });
};

const getInstagramModalFocusableElements = () => {
  if (!(instagramModal instanceof HTMLElement)) {
    return [];
  }

  return [...instagramModal.querySelectorAll("a[href], button:not([disabled])")].filter(
    (element) => element instanceof HTMLElement && !element.hasAttribute("hidden")
  );
};

const closeInstagramModal = (shouldRestoreFocus = true) => {
  if (!(instagramModal instanceof HTMLElement) || instagramModal.hidden) {
    return;
  }

  instagramModal.hidden = true;
  body.classList.remove("instagram-modal-open");
  syncInstagramTriggerState();

  if (shouldRestoreFocus) {
    activeInstagramTrigger?.focus();
  }

  activeInstagramTrigger = null;
};

const openInstagramModal = (trigger) => {
  if (!(instagramModal instanceof HTMLElement)) {
    return;
  }

  closeMenu();

  activeInstagramTrigger = trigger;
  instagramModal.hidden = false;
  body.classList.add("instagram-modal-open");
  syncInstagramTriggerState(trigger);

  window.requestAnimationFrame(() => {
    getInstagramModalFocusableElements()[0]?.focus();
  });
};

const resetTilt = (item) => {
  item.style.setProperty("--tilt-x", "0deg");
  item.style.setProperty("--tilt-y", "0deg");
  item.style.setProperty("--pointer-x", "50%");
  item.style.setProperty("--pointer-y", "50%");
  item.style.setProperty("--sheen-opacity", "0");
};

const formatCounterValue = (element, value) => {
  const suffix = element.dataset.countSuffix ?? "";

  if (element.dataset.countFormat === "compact") {
    return `${compactNumberFormatter.format(value).replace("k", "K")}${suffix}`;
  }

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

const syncWhatsAppLinks = () => {
  const phoneNumber = getContactWhatsAppNumber();

  if (!phoneNumber) {
    return;
  }

  whatsappLinks.forEach((link) => {
    if (!(link instanceof HTMLAnchorElement)) {
      return;
    }

    const whatsappUrl = new URL(`https://wa.me/${phoneNumber}`);
    const message = link.dataset.whatsappMessage?.trim();

    if (message) {
      whatsappUrl.searchParams.set("text", message);
    }

    link.href = whatsappUrl.toString();
  });
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

const setupFaqAccessibility = () => {
  faqButtons.forEach((button, index) => {
    const panel = button.nextElementSibling;

    if (!(panel instanceof HTMLElement)) {
      return;
    }

    const questionId = button.id || `faq-question-${index + 1}`;
    const panelId = panel.id || `faq-answer-${index + 1}`;

    button.id = questionId;
    button.setAttribute("aria-controls", panelId);
    panel.id = panelId;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-labelledby", questionId);
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

const syncAutoplayMediaItem = (media) => {
  const frame = media.closest(".trust-media");

  if (!(media instanceof HTMLMediaElement)) {
    return;
  }

  const shouldPlay = !prefersReducedMotion.matches && media.dataset.mediaInView === "true";

  if (!shouldPlay) {
    media.pause();
    frame?.classList.remove("is-video-ready");
    return;
  }

  const playAttempt = media.play();

  if (typeof playAttempt?.catch === "function") {
    playAttempt.catch(() => {
      frame?.classList.remove("is-video-ready");
    });
  }
};

const syncAutoplayMedia = () => {
  autoplayMediaItems.forEach(syncAutoplayMediaItem);
};

const setupAutoplayMedia = () => {
  autoplayMediaItems.forEach((media) => {
    if (!(media instanceof HTMLVideoElement) || media.dataset.mediaBound === "true") {
      return;
    }

    media.dataset.mediaBound = "true";
    media.muted = true;
    media.defaultMuted = true;
    media.playsInline = true;

    const frame = media.closest(".trust-media");
    const revealVideo = () => frame?.classList.add("is-video-ready");
    const hideVideo = () => frame?.classList.remove("is-video-ready");

    media.addEventListener("loadeddata", revealVideo);
    media.addEventListener("canplay", revealVideo);
    media.addEventListener("error", hideVideo);

    if (media.readyState >= 2) {
      revealVideo();
    }
  });

  autoplayMediaObserver?.disconnect();
  autoplayMediaObserver = null;

  if ("IntersectionObserver" in window) {
    autoplayMediaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!(entry.target instanceof HTMLMediaElement)) {
            return;
          }

          entry.target.dataset.mediaInView = String(entry.isIntersecting);
          syncAutoplayMediaItem(entry.target);
        });
      },
      {
        threshold: 0.35,
        rootMargin: "180px 0px",
      }
    );

    autoplayMediaItems.forEach((media) => {
      if (!(media instanceof HTMLMediaElement)) {
        return;
      }

      media.dataset.mediaInView = "false";
      autoplayMediaObserver?.observe(media);
    });
  } else {
    autoplayMediaItems.forEach((media) => {
      if (media instanceof HTMLMediaElement) {
        media.dataset.mediaInView = "true";
      }
    });
  }

  syncAutoplayMedia();
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
  syncHeaderHeight();
});

mobileMenu?.addEventListener("click", (event) => {
  if (event.target === mobileMenu) {
    closeMenu();
  }
});

mobileLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

instagramTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openInstagramModal(trigger);
  });
});

instagramModal?.addEventListener("click", (event) => {
  if (event.target === instagramModal) {
    closeInstagramModal();
  }
});

instagramModalCloseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeInstagramModal();
  });
});

instagramModalAccountLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeInstagramModal(false);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Tab" && instagramModal instanceof HTMLElement && !instagramModal.hidden) {
    const focusableElements = getInstagramModalFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (!firstElement || !lastElement) {
      return;
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  if (event.key === "Escape") {
    if (instagramModal instanceof HTMLElement && !instagramModal.hidden) {
      closeInstagramModal();
      return;
    }

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

setupFaqAccessibility();
syncWhatsAppLinks();
syncSeoMetadata();
applyRevealDelays();
setupReveals();
setupSectionObserver();
setupCounters();
setupAutoplayMedia();
setupTilt();
syncHeaderHeight();
updateScrollMotion();
syncOpenFaqPanels();

window.addEventListener("scroll", requestScrollUpdate, { passive: true });

window.addEventListener("resize", () => {
  syncHeaderHeight();
  syncOpenFaqPanels();
  requestScrollUpdate();
});

window.addEventListener("load", () => {
  syncHeaderHeight();
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

  syncAutoplayMedia();
};

if (typeof prefersReducedMotion.addEventListener === "function") {
  prefersReducedMotion.addEventListener("change", handleMotionPreferenceChange);
} else if (typeof prefersReducedMotion.addListener === "function") {
  prefersReducedMotion.addListener(handleMotionPreferenceChange);
}
