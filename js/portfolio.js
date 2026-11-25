/* Shared helpers: loading project data and building project cards.
   Every page loads this file first, then its own page script. */
const Portfolio = (() => {
    // Keys used in each project's "areas" list, and how they are labelled.
    const AREAS = {
        research: "Research",
        software: "Software & Data",
        education: "Education"
    };

    async function loadProjects() {
        const response = await fetch("data/projects.json");
        if (!response.ok) throw new Error(`Could not load projects.json (${response.status})`);
        const data = await response.json();
        return data.filter(project => project && project.id && !project.hidden);
    }

    // Projects with a "featured" number come first, in that order; the rest of
    // the list tops the selection up to the limit.
    function featured(projects, limit) {
        const picked = projects
            .filter(project => Number(project.featured) > 0)
            .sort((a, b) => Number(a.featured) - Number(b.featured));
        for (const project of projects) {
            if (picked.length >= limit) break;
            if (!picked.includes(project)) picked.push(project);
        }
        return picked.slice(0, limit);
    }

    function primaryArea(project) {
        const area = (project.areas || [])[0];
        return AREAS[area] ? area : "";
    }

    function areaLabel(project) {
        return [AREAS[primaryArea(project)], project.category].filter(Boolean).join(" · ");
    }

    function countByArea(projects) {
        const counts = {};
        for (const key of Object.keys(AREAS)) {
            counts[key] = projects.filter(project => (project.areas || []).includes(key)).length;
        }
        return counts;
    }

    function projectUrl(project) {
        return `project.html?id=${encodeURIComponent(project.id)}`;
    }

    // Only allow ordinary web, mail and relative links from the data file.
    function safeUrl(url) {
        const value = String(url || "").trim();
        if (/^(https?:|mailto:)/i.test(value)) return value;
        if (value && !/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;
        return null;
    }

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = text;
        return node;
    }

    // An image box that falls back to a labelled placeholder if the image is
    // missing or fails to load.
    function media(project, className, alt = "") {
        const box = el("div", className);
        const showPlaceholder = () => {
            box.classList.add("is-placeholder");
            box.replaceChildren(el("span", null, project.category || AREAS[primaryArea(project)] || ""));
        };
        const src = safeUrl(project.image);
        if (!src) {
            showPlaceholder();
        } else {
            const img = new Image();
            img.alt = alt;
            img.loading = "lazy";
            img.decoding = "async";
            img.addEventListener("error", showPlaceholder, { once: true });
            img.src = src;
            box.append(img);
        }
        return box;
    }

    function card(project, { flagship = false } = {}) {
        const link = el("a", flagship ? "card card--flagship" : "card");
        link.href = projectUrl(project);
        link.dataset.area = primaryArea(project);
        link.append(media(project, "card__media"));

        const body = el("div", "card__body");
        body.append(el("p", "card__area", areaLabel(project)));
        body.append(el("h3", "card__title", project.title || "Untitled project"));
        if (project.summary) body.append(el("p", "card__summary", project.summary));
        if (Array.isArray(project.tags) && project.tags.length) {
            body.append(el("p", "card__tags", project.tags.join(" · ")));
        }
        link.append(body);
        return link;
    }

    // Contact details from data/site.json. Profiles without a URL are left out.
    async function loadSite() {
        const response = await fetch("data/site.json");
        if (!response.ok) throw new Error(`Could not load site.json (${response.status})`);
        const site = await response.json();
        site.profiles = (site.profiles || [])
            .map(profile => ({ ...profile, url: safeUrl(profile.url) }))
            .filter(profile => profile.label && profile.url);
        site.cv = safeUrl(site.cv);
        return site;
    }

    function link(text, url, className) {
        const a = el("a", className, text);
        a.href = url;
        if (/^https?:/i.test(url)) a.rel = "noopener";
        return a;
    }

    function notice(text) {
        return el("p", "notice", text);
    }

    return { AREAS, loadProjects, loadSite, link, featured, primaryArea, areaLabel, countByArea, projectUrl, safeUrl, el, media, card, notice };
})();