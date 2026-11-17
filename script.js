// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  navToggle.classList.toggle("is-active", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    navToggle.classList.remove("is-active");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// Highlight nav link for the section in view
const sections = document.querySelectorAll("main section[id]");
const navLinkEls = document.querySelectorAll(".nav-link");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinkEls.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${entry.target.id}`
        );
      });
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);

sections.forEach((section) => sectionObserver.observe(section));

// Reveal-on-scroll animations
const revealEls = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach((el) => revealObserver.observe(el));

// Tableau embeds (case study pages): each .viz-frame shows its PNG export.
// On wide screens it is swapped for the live viz from data-tableau-url; on
// phones the PNG stays, since Tableau embeds are hard to use on small screens.
// The dashboards have a fixed size (data-tableau-width/-height), so the iframe
// renders at exactly that size and is scaled down to fit the frame. Tableau's
// layout never reflows, and there are no scrollbars.
const MIN_EMBED_WIDTH = 900;

document.querySelectorAll(".viz-frame[data-tableau-url]").forEach((frame) => {
  const url = frame.dataset.tableauUrl.trim();
  const vizWidth = Number(frame.dataset.tableauWidth);
  const vizHeight = Number(frame.dataset.tableauHeight);
  if (!url || !vizWidth || !vizHeight || window.innerWidth < MIN_EMBED_WIDTH) {
    return;
  }

  const img = frame.querySelector("img");
  const embed = document.createElement("div");
  const iframe = document.createElement("iframe");
  const sep = url.includes("?") ? "&" : "?";
  embed.className = "viz-embed";
  iframe.src = `${url}${sep}:showVizHome=no&:embed=true&:toolbar=no`;
  iframe.title = img ? img.alt : "Interactive Tableau visualization";
  iframe.loading = "lazy";
  iframe.scrolling = "no";
  iframe.style.width = `${vizWidth}px`;
  iframe.style.height = `${vizHeight}px`;
  embed.append(iframe);
  frame.replaceChildren(embed);

  // Scale down (never up) to the available width, centered
  const fit = () => {
    const available = embed.clientWidth;
    const scale = Math.min(1, available / vizWidth);
    const offset = (available - vizWidth * scale) / 2;
    iframe.style.transform = `translateX(${offset}px) scale(${scale})`;
    embed.style.height = `${vizHeight * scale}px`;
  };

  fit();
  new ResizeObserver(fit).observe(embed);
});

// Iteration stepper (case study pages)
document.querySelectorAll("[data-stepper]").forEach((stepper) => {
  const tabs = [...stepper.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((tab) =>
    document.getElementById(tab.getAttribute("aria-controls"))
  );

  const select = (index) => {
    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(i));
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next =
        (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
      select(next);
      tabs[next].focus();
    });
  });
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();