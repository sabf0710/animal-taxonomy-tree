# Animal taxonomy tree
An interactive, browsable tree of animal taxonomy built with `d3-org-chart`.

```
taxonomy-tree/
├── index.html
├── data/
│   ├── metadata.json   # site metadata (first published / last edited dates, tools credited)
│   └── taxonomy.json   # taxon data (id, parentId, rank, name, commonName, image, tldr, sources, imageCredit)
├── images/             # named to match each taxon's `image` field
└── src/
    ├── style.css
    └── chart.js        # chart setup, info panel, credits modal logic
```

## NOTES
1. Open `index.html` with a local server (eg, VS Code's Live Server extension).

    Opening the file directly via `file://` will break the `fetch()` calls to the JSON data due to browser CORS restrictions.


2. Add a new taxon by adding a row to `data/taxonomy.json` with a unique `id` and a `parentId` matching an existing `id`. The chart rebuilds its structure entirely from `parentId`. No other code changes needed.


3. Taxonomic data is drawn primarily from [Catalogue of Life](https://www.catalogueoflife.org/) and [Encyclopedia of Life](https://eol.org/). 
    - Cited per-taxon in the site itself; click any card, or see the Credits > Sources tab
    - Image credits are listed per-taxon and in Credits > Images
    - Entries cited according to APA 7th style


4. <b>Species-level data is intentionally not included and isn't planned any time soon.</b> 

    Even a modest, non-exhaustive set of species per family would multiply the node count far beyond what a single overview tree can stay readable at. So, this project stays scoped to kingdom ~ family for now.
