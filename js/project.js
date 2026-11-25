/* Case-study page: renders one project from data/projects.json, chosen by
   ?id= in the address. Every field beyond title is optional. */
(async () => {
    const { el } = Portfolio;
    const root = document.getElementById("case");
    const id = new URLSearchParams(location.search).get("id");

    let projects;
    try {
        projects = await Portfolio.loadProjects();
    } catch (error) {
        console.error(error);
        root.replaceChildren(wrap(Portfolio.notice("This project couldn't be loaded. Please try again later.")));
        return;
    }

    const index = projects.findIndex(project => project.id === id);
    if (index < 0) {
        document.title = "Project not found — Adrian";
        const box = wrap(el("h1", "case-title", "Project not found"));
        const back = el("a", null, "See all projects");
        back.href = "projects.html";
        const line = el("p", "lead");
        line.append("That project doesn't exist or has moved. ", back, ".");
        box.append(line);
        root.replaceChildren(box);
        return;
    }

    const project = projects[index];
    document.title = `${project.title} — Adrian`;
    if (project.summary) {
        document.querySelector('meta[name="description"]')?.setAttribute("content", project.summary);
    }

    function wrap(...children) {
        const box = el("div", "wrap");
        box.append(...children);
        return box;
    }

    function paragraphs(text) {
        const list = Array.isArray(text) ? text : String(text || "").split(/\n\s*\n/);
        return list.map(item => String(item).trim()).filter(Boolean).map(item => el("p", null, item));
    }

    function figure(src, alt, caption, className) {
        const fig = el("figure", "figure");
        fig.append(Portfolio.media({ ...project, image: src }, className, alt || ""));
        if (caption) fig.append(el("figcaption", null, caption));
        return fig;
    }

    // Header: back link, area, title, summary, key facts.
    const head = el("header", "case-head wrap");
    head.dataset.area = Portfolio.primaryArea(project);
    const back = el("a", "back", "← All projects");
    back.href = "projects.html";
    head.append(back, el("p", "kicker", Portfolio.areaLabel(project)), el("h1", "case-title", project.title));
    if (project.summary) head.append(el("p", "lead", project.summary));

    const facts = [
        ["Role", project.role],
        ["Timeline", project.timeline || project.year],
        ["Team", project.team],
        ["Methods & tools", project.tools]
    ].filter(([, value]) => value);
    if (facts.length) {
        const dl = el("dl", "facts");
        for (const [label, value] of facts) {
            const item = el("div");
            item.append(el("dt", null, label), el("dd", null, Array.isArray(value) ? value.join(", ") : String(value)));
            dl.append(item);
        }
        head.append(dl);
    }

    // Hero image.
    const hero = wrap(figure(project.image, project.imageAlt, project.imageCaption, "case-hero"));

    // Body: write-up sections and results, with links and skills alongside.
    const article = el("article", "case-article");
    if (Array.isArray(project.metrics) && project.metrics.length) {
        const metrics = el("div", "metrics");
        for (const metric of project.metrics) {
            const box = el("div", "metric");
            box.append(el("p", "metric__value", metric.value), el("p", "metric__label", metric.label));
            metrics.append(box);
        }
        article.append(metrics);
    }
    const sections = Array.isArray(project.sections) ? project.sections : [];
    for (const section of sections) {
        if (section.heading) article.append(el("h2", null, section.heading));
        article.append(...paragraphs(section.text));
        if (section.image) article.append(figure(section.image, section.imageAlt, section.caption, "case-figure"));
    }
    if (!sections.length) {
        article.append(el("p", "notice", "A full write-up of this project is on its way."));
    }

    const aside = el("aside", "case-aside");
    const links = (project.links || []).map(link => ({ label: link.label, url: Portfolio.safeUrl(link.url) })).filter(link => link.url && link.label);
    if (links.length) {
        const block = el("div", "aside-block");
        const list = el("ul", "link-list");
        for (const link of links) {
            const a = el("a", null, link.label);
            a.href = link.url;
            if (/^https?:/i.test(link.url)) a.rel = "noopener";
            const li = el("li");
            li.append(a);
            list.append(li);
        }
        block.append(el("h2", null, "Links"), list);
        aside.append(block);
    }
    if (Array.isArray(project.tags) && project.tags.length) {
        const block = el("div", "aside-block");
        const tags = el("ul", "tag-list");
        project.tags.forEach(tag => tags.append(el("li", null, tag)));
        block.append(el("h2", null, "Skills shown"), tags);
        aside.append(block);
    }

    const body = el("div", "case-body wrap");
    body.append(article);
    if (aside.childElementCount) body.append(aside);

    // Previous / next, wrapping around the list.
    const pager = el("nav", "pager");
    pager.setAttribute("aria-label", "More projects");
    if (projects.length > 1) {
        const inner = el("div", "pager__inner wrap");
        const prev = projects[(index - 1 + projects.length) % projects.length];
        const next = projects[(index + 1) % projects.length];
        for (const [label, target, className] of [["← Previous", prev, "pager__prev"], ["Next →", next, "pager__next"]]) {
            const a = el("a", className);
            a.href = Portfolio.projectUrl(target);
            a.append(el("span", "pager__label", label), el("span", "pager__title", target.title));
            inner.append(a);
        }
        pager.append(inner);
    }

    root.replaceChildren(head, hero, body, pager);
})();