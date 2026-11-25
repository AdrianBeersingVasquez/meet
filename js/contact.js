/* Contact page: everything comes from data/site.json. */
(async () => {
    const { el, link } = Portfolio;
    const emailBox = document.getElementById("contact-email");
    const actions = document.getElementById("contact-actions");
    const facts = document.getElementById("contact-facts");
    const side = document.getElementById("contact-side");

    let site;
    try {
        site = await Portfolio.loadSite();
    } catch (error) {
        console.error(error);
        emailBox.replaceWith(Portfolio.notice("Contact details couldn't be loaded. Please try again later."));
        return;
    }

    // Email (the address itself is the mail link), with a copy button.
    if (site.email) {
        emailBox.append(link(site.email, `mailto:${site.email}`));
        if (navigator.clipboard) {
            const copy = el("button", "btn", "Copy address");
            copy.type = "button";
            copy.addEventListener("click", async () => {
                try {
                    await navigator.clipboard.writeText(site.email);
                    copy.textContent = "Copied";
                } catch {
                    copy.textContent = "Couldn't copy";
                }
                setTimeout(() => { copy.textContent = "Copy address"; }, 2000);
            });
            actions.append(copy);
        }
    } else {
        emailBox.remove();
    }
    if (site.cv) actions.append(link("Download CV", site.cv, "btn"));

    for (const [label, value] of [["Based in", site.location], ["Status", site.availability]]) {
        if (!value) continue;
        const row = el("div");
        row.append(el("dt", null, label), el("dd", null, value));
        facts.append(row);
    }

    // Profiles.
    if (site.profiles.length) {
        const block = el("section", "aside-block");
        const list = el("ul", "profile-list");
        for (const profile of site.profiles) {
            const a = link("", profile.url);
            a.append(el("span", "profile-list__label", profile.label));
            if (profile.handle) a.append(el("span", "profile-list__handle", profile.handle));
            a.append(el("span", "profile-list__arrow", "↗"));
            a.querySelector(".profile-list__arrow").setAttribute("aria-hidden", "true");
            const li = el("li");
            li.append(a);
            list.append(li);
        }
        block.append(el("h2", null, "Elsewhere"), list);
        side.append(block);
    }

    // Educational coaching enquiries.
    const coaching = site.coaching || {};
    const coachingUrl = Portfolio.safeUrl(coaching.url);
    if (coaching.name && coachingUrl) {
        const block = el("section", "aside-block");
        block.append(el("h2", null, "Educational coaching"));
        if (coaching.note) block.append(el("p", "notice", coaching.note));
        const p = el("p");
        p.append(link(coaching.name, coachingUrl));
        block.append(p);
        side.append(block);
    }

    if (!side.childElementCount) side.remove();
})();