/* Home page: contact details, area links and the featured projects. */
(async () => {
    const { el } = Portfolio;
    const facts = document.getElementById("hero-contact");
    try {
        const site = await Portfolio.loadSite();
        const addFact = (label, ...content) => {
            const row = el("div");
            const value = el("dd");
            value.append(...content);
            row.append(el("dt", null, label), value);
            facts.append(row);
        };
        if (site.location) addFact("Based in", site.location);
        if (site.email) addFact("Email", Portfolio.link(site.email, `mailto:${site.email}`));
        if (site.availability) addFact("Status", site.availability);
    } catch (error) {
        console.error(error);
    }
})();

(async () => {
    const { AREAS, el } = Portfolio;
    const grid = document.getElementById("featured-grid");
    const areaLinks = document.getElementById("area-links");

    let projects;
    try {
        projects = await Portfolio.loadProjects();
    } catch (error) {
        console.error(error);
        grid.replaceChildren(Portfolio.notice("Projects couldn't be loaded. Please try again later."));
        return;
    }

    const counts = Portfolio.countByArea(projects);
    for (const [key, label] of Object.entries(AREAS)) {
        if (!counts[key]) continue;
        const link = el("a", "chip", label);
        link.href = `projects.html?area=${key}`;
        link.append(el("span", "chip__count", String(counts[key])));
        areaLinks.append(link);
    }
    const all = el("a", "chip chip--solid", "All projects");
    all.href = "projects.html";
    all.append(el("span", "chip__count", String(projects.length)));
    areaLinks.append(all);

    const featured = Portfolio.featured(projects, 4);
    grid.replaceChildren(...featured.map((project, index) => Portfolio.card(project, { flagship: index === 0 })));
})();