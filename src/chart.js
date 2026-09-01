const RANK_COLORS = {
  Kingdom: { text: "var(--kingdom)", bg: "var(--paper)" },
  Phylum:  { text: "var(--phylum)",  bg: "var(--phylum-bg)" },
  Class:   { text: "var(--class)",   bg: "var(--class-bg)" },
  Order:   { text: "var(--order)",   bg: "var(--order-bg)" },
  Family:  { text: "var(--family)",  bg: "var(--family-bg)" },
};
 
function initial(name){
  return name ? name.charAt(0).toUpperCase() : "?";
}
 
fetch("data/taxonomy.json")
  .then(r => r.json())
  .then(data => {
 
    const chart = new d3.OrgChart()
      .container("#chart-container")
      .data(data)
      .nodeWidth(() => 168)
      .nodeHeight(() => 190)
      .childrenMargin(() => 70)
      .compactMarginBetween(() => 28)
      .compactMarginPair(() => 40)
      .neighbourMargin(() => 30)
      .siblingsMargin(() => 30)
      .initialExpandLevel(2)
      .nodeContent(d => {
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
    window.__data = data;
  })
  .catch(err => {
    document.getElementById("chart-container").innerHTML =
      '<p style="padding:32px;font-family:sans-serif;color:#a33;">Could not load data/taxonomy.json | ' + err + '</p>';
  });

window.__openPanel = function(id){
  const node = window.__data.find(d => d.id === id);
  if(!node) return;
  document.getElementById("panel-rank").textContent = node.rank.toUpperCase();
  document.getElementById("panel-rank").style.color = (RANK_COLORS[node.rank] || RANK_COLORS.Family).text;
  document.getElementById("panel-img").src = node.image;
  document.getElementById("panel-img").alt = node.name;
  document.getElementById("panel-name").textContent = node.name;
  document.getElementById("panel-common").textContent = node.commonName;
  document.getElementById("panel-tldr").textContent = node.tldr;
  
  document.getElementById("panel-source").textContent = node.source.replace("https://","");
  document.getElementById("panel-source").href = node.source;
  document.getElementById("info-panel").classList.add("open");
};
 
document.getElementById("panel-close").addEventListener("click", () => {
  document.getElementById("info-panel").classList.remove("open");
});