const RANK_COLORS = {
    Kingdom: { text: "var(--kingdom)", bg: "var(--paper)" },
    Phylum: { text: "var(--phylum)", bg: "var(--phylum-bg)" },
    Class: { text: "var(--class)", bg: "var(--class-bg)" },
    Order: { text: "var(--order)", bg: "var(--order-bg)" },
    Family: { text: "var(--family)", bg: "var(--family-bg)" },
};

function initial(name) {
    return name ? name.charAt(0).toUpperCase() : "?";
}

Promise.all([
    fetch("data/taxonomy.json").then((r) => r.json()),
    fetch("data/metadata.json").then((r) => r.json()),
    ])
    .then(([taxa, meta]) => {
        const chart = new d3.OrgChart()
        .container("#chart-container")
        .data(taxa)
        .nodeWidth(() => 168)
        .nodeHeight(() => 190)
        .childrenMargin(() => 70)
        .compactMarginBetween(() => 28)
        .compactMarginPair(() => 40)
        .neighbourMargin(() => 30)
        .siblingsMargin(() => 30)
        .initialExpandLevel(2)
        .nodeContent((d) => {
            const rank = d.data.rank;
            const colors = RANK_COLORS[rank] || RANK_COLORS.Family;
            return `
            <div class="taxon-card" onclick="window.__openPanel('${d.data.id}')">
                <div class="taxon-rank-bar" style="background:${colors.bg}; color:${colors.text}">${rank.toUpperCase()}</div>
                <div class="taxon-image-wrap">
                <img src="${d.data.image}" alt="${d.data.name}"
                    onerror="this.parentElement.innerHTML='<div class=&quot;taxon-image-fallback&quot;>${initial(d.data.commonName)}</div>'" />
                </div>
                <div class="taxon-text">
                <div class="taxon-name">${d.data.name}</div>
                <div class="taxon-common">${d.data.commonName}</div>
                </div>
            </div>
            `;
        })
        .render();

        window.__chart = chart;
        window.__data = taxa;
        window.__meta = meta;
        renderAboutTab(meta);
        renderImagesTab(taxa);
        renderSourcesTab(taxa);
    })
    .catch((err) => {
        document.getElementById("chart-container").innerHTML =
        '<p style="padding:32px;font-family:sans-serif;color:#a33;">Could not load data/taxonomy.json | ' +
        err + "</p>";
    });

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// INFO PANEL
window.__openPanel = function (id) {
    const node = window.__data.find((d) => d.id === id);
    if (!node) return;
    document.getElementById("panel-rank").textContent = node.rank.toUpperCase();
    document.getElementById("panel-rank").style.color = (
        RANK_COLORS[node.rank] || RANK_COLORS.Family
    ).text;
    document.getElementById("panel-img").src = node.image;
    document.getElementById("panel-img").alt = node.name;
    document.getElementById("panel-name").textContent = node.name;
    document.getElementById("panel-common").textContent = node.commonName;
    document.getElementById("panel-tldr").textContent = node.tldr;

    // Image credit; only render the section if there's something to show
    const creditSection = document.getElementById("panel-image-credit-section");
    const credit = node.imageCredit;
    if (credit && (credit.author || credit.license || credit.url)) {
        const parts = [];
        if (credit.author) parts.push(escapeHtml(credit.author));
        if (credit.license) parts.push(escapeHtml(credit.license));
        let line = parts.join(" · ");
        if (credit.url) {
            const externalIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
            line +=
                (line ? " " : "") +
                    `<a href="${credit.url}" target="_blank" rel="noopener" aria-label="View image source" title="View image source">${externalIcon}</a>`;
        }
        document.getElementById("panel-image-credit").innerHTML = line || "Attribution not yet added";
        creditSection.style.display = "";

    } else {
        creditSection.style.display = "none";
    }

    // Sources; bulleted APA-style list
    const sourceList = document.getElementById("panel-source-list");
    sourceList.innerHTML = "";
    (node.sources || []).forEach((s) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = s.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = s.citation;
        li.appendChild(a);
        sourceList.appendChild(li);
    });
    if (!node.sources || node.sources.length === 0) {
        sourceList.innerHTML = '<li style="list-style:none;padding-left:0;color:var(--subtext);">No sources listed yet</li>';
    }

    document.getElementById("info-panel").classList.add("open");
};

document.getElementById("panel-close").addEventListener("click", () => {
  document.getElementById("info-panel").classList.remove("open");
});


// CREDITS MODAL
function groupByRank(taxa) {
    const order = ["Kingdom", "Phylum", "Class", "Order", "Family"];
    const groups = {};
    taxa.forEach((t) => {
        if (!groups[t.rank]) groups[t.rank] = [];
        groups[t.rank].push(t);
    });
    order.forEach((r) => {
        if (groups[r]) groups[r].sort((a, b) => a.name.localeCompare(b.name));
    });
    return order
      .filter((r) => groups[r])
      .map((r) => ({ rank: r, items: groups[r] }));
}

function renderAboutTab(meta) {
    const toolsHtml = meta.tools
      .map(
        (t) =>
          `<li><a href="${t.url}" target="_blank" rel="noopener">${t.name}</a> by ${t.author}</li>`,
      )
      .join("");
    document.getElementById("credits-tools-list").innerHTML = toolsHtml;
    document.getElementById("credits-timeline").innerHTML = `<b>First published: </b> ${meta.firstPub}<br><b>Last edited: </b> ${meta.lastEdit}`;
}

function renderImagesTab(taxa) {
    const groups = groupByRank(taxa);
    const externalIcon = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
    let html = "";
    groups.forEach((g) => {
        html += `<div class="credits-rank-group"><p class="credits-label">${g.rank}</p>`;
        g.items.forEach((t) => {
            const c = t.imageCredit;
            let line = `<i>${t.name}</i> &nbsp; ⋅ &nbsp; `;
            if (c && (c.author || c.license || c.url)) {
                const parts = [c.author, c.license].filter(Boolean).join(", ");
                line += parts;
                if (c.url)
                    line += ` <a href="${c.url}" target="_blank" rel="noopener">${externalIcon}</a>`;
                } else {
                    line += "attribution not yet added";
                }
            html += `<p class="credits-entry">${line}</p>`;
        });
        html += `</div>`;
    });
    document.getElementById("tab-images").innerHTML = html;
}

function renderSourcesTab(taxa) {
    const groups = groupByRank(taxa);
    let html = "";
    groups.forEach((g) => {
        html += `<div class="credits-rank-group"><p class="credits-label">${g.rank}</p>`;
        g.items.forEach((t) => {
            html += `<p class="credits-entry"><i>${t.name}</i></p><ul class="credits-source-list">`;
            (t.sources || []).forEach((s) => {
                html += `<li><a href="${s.url}" target="_blank" rel="noopener">${s.citation}</a></li>`;
            });
            if (!t.sources || t.sources.length === 0) {
                html += `<li style="list-style:none;margin-left:-18px;">No sources listed yet</li>`;
            }
        html += `</ul>`;
        });
        html += `</div>`;
    });
    document.getElementById("tab-sources").innerHTML = html;
}

document.getElementById("credits-trigger").addEventListener("click", () => {
    document.getElementById("credits-backdrop").classList.add("open");
});

document.getElementById("credits-close").addEventListener("click", () => {
    document.getElementById("credits-backdrop").classList.remove("open");
});

document.getElementById("credits-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "credits-backdrop")
        document.getElementById("credits-backdrop").classList.remove("open");
});

document.querySelectorAll(".credits-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        document
          .querySelectorAll(".credits-tab")
          .forEach((t) => t.classList.remove("active"));
        document
          .querySelectorAll(".credits-panel")
          .forEach((p) => p.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById("tab-" + tab.dataset.tab).classList.add("active");
    });
});
