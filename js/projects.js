/* All-projects page: filter by area and search. The current filter and search
   are kept in the address bar, so a filtered view can be linked to. */
(async () => {
    const { AREAS, el } = Portfolio;
    const grid = document.getElementById("project-grid");
    const filters = document.getElementById("area-filters");
    const search = document.getElementById("project-search");
    const count = document.getElementById("result-count");

    const params = new URLSearchParams(location.search);
    let area = AREAS[params.get("area")] ? params.get("area") : "all";
    let query = params.get("q") || "";

    let projects;
    try {
        projects = await Portfolio.loadProjects();
    } catch (error) {
        console.error(error);
        grid.replaceChildren(Portfolio.notice("Projects couldn't be loaded. Please try again later."));
        return;
    }

    const counts = Portfolio.countByArea(projects);
    const options = [["all", "All", projects.length]];
    for (const [key, label] of Object.entries(AREAS)) {
        if (counts[key]) options.push([key, label, counts[key]]);
    }
    if (area !== "all" && !counts[area]) area = "all";

    const buttons = options.map(([key, label, total]) => {
        const button = el("button", "chip", label);
        button.type = "button";
        button.dataset.area = key;
        button.append(el("span", "chip__count", String(total)));
        button.addEventListener("click", () => {
            area = key;
            render();
        });
        filters.append(button);
        return button;
    });

    const searchText = project => [
        project.title, project.summary, project.category,
        ...(project.tags || []),
        ...(project.areas || []).map(key => AREAS[key])
    ].join(" ").toLowerCase();

    function render() {
        const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
        const visible = projects.filter(project =>
            (area === "all" || (project.areas || []).includes(area)) &&
            terms.every(term => searchText(project).includes(term))
        );

        grid.replaceChildren(...visible.map(project => Portfolio.card(project)));
        if (!visible.length) grid.append(Portfolio.notice("No projects match that search."));
        count.textContent = `${visible.length} project${visible.length === 1 ? "" : "s"}`;
        buttons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.area === area)));

        const next = new URLSearchParams();
        if (area !== "all") next.set("area", area);
        if (query.trim()) next.set("q", query.trim());
        const qs = next.toString();
        history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
    }

    search.value = query;
    search.addEventListener("input", () => {
        query = search.value;
        render();
    });
    render();
})();