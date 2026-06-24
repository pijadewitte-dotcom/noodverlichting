const form = document.querySelector("#config-form");
const sketch = document.querySelector("#sketch");
const productsNode = document.querySelector("#products");
const summaryNode = document.querySelector("#quote-summary");
const rulesNode = document.querySelector("#rules");
const printButton = document.querySelector("#print-quote");
const toolButtons = [...document.querySelectorAll(".tool")];

let selectedTool = "escapeRoute";
let manualItems = [];

const zemperSeries = {
  compact: {
    name: "Zemper SPAZIO Q",
    code: "SPAZIO Q",
    unitPrice: 145,
    lumen: "155-280 lm noodmodus",
    autonomy: "1 of 3 uur",
    control: "Zelftest, DALI2 of SmartZ",
    install: "Plafond inbouw volgens Zemper-filter",
    description: "Vierkante, efficiënte armatuur voor discrete noodverlichting.",
    source: "https://zemper.com/nl-be/noodverlichting-4/spazio-q-4/",
    color: "#126a8c",
  },
  standard: {
    name: "Zemper SPAZIO R",
    code: "SPAZIO R",
    unitPrice: 158,
    lumen: "140-280 lm noodmodus",
    autonomy: "1 of 3 uur",
    control: "Zelftest, DALI2 of SmartZ",
    install: "Plafond inbouw volgens Zemper-filter",
    description: "Ronde armatuur voor brede integratie in projecten.",
    source: "https://zemper.com/nl-be/noodverlichting-4/spazio-r-4/",
    color: "#23865f",
  },
  smart: {
    name: "Zemper SPACE",
    code: "SPACE",
    unitPrice: 225,
    lumen: "280-420 lm noodmodus",
    autonomy: "1 of 3 uur",
    control: "AutoTest, SmartZ draadloos of DALI2",
    install: "Plafond inbouw, IP65 optioneel via accessoire",
    description: "Modulaire armatuur met verwisselbare optieken voor routes, open ruimtes en hoeken.",
    source: "https://zemper.com/nl-be/noodverlichting-4/space-4/",
    color: "#6b5b95",
  },
  power: {
    name: "Zemper SPAZIO POWER",
    code: "SPAZIO POWER",
    unitPrice: 265,
    lumen: "380-400 lm noodmodus",
    autonomy: "1 of 3 uur",
    control: "AutoTest, SmartZ draadloos of DALI2",
    install: "Plafond inbouw, IP65 optioneel via accessoire",
    description: "Hoge lichtsterkte voor kritieke zones of grotere oppervlakken.",
    source: "https://zemper.com/nl-be/noodverlichting-4/spazio-power-4/",
    color: "#b98215",
  },
};

const accessoryCatalog = {
  ip65: {
    name: "Zemper IP65 accessoire SPACE",
    unitPrice: 42,
    description: "Optioneel accessoire wanneer een hogere IP-bescherming gevraagd wordt.",
    color: "#69717d",
  },
  smartCentral: {
    name: "Zemper SmartZ / DALI2 centrale voorziening",
    unitPrice: 590,
    description: "Voor projecten waar bewaking, rapportage of centrale controle gewenst is.",
    color: "#20242c",
  },
};

const projectTypes = {
  inbouw: {
    code: "LSR",
    name: "LSR inbouw noodverlichting",
    unitPrice: 155,
    mounting: "Inbouw",
    lightOutput: "Projecttype volgens opgelegde keuze; technische fiche online nog te koppelen aan exact artikel.",
    autonomy: "1 h / 3 h volgens gekozen uitvoering",
    battery: "Volgens technische fiche van gekozen LSR-uitvoering",
    protection: "Volgens technische fiche van gekozen LSR-uitvoering",
    standards: "Noodverlichting volgens EN 60598-2-22 te verifiëren op definitieve fiche",
    source: "https://zemper.com/nl-be/noodverlichting-4/",
  },
  opbouw: {
    code: "LSM3250LDPW",
    name: "LSM3250LDPW opbouw noodverlichting",
    unitPrice: 185,
    mounting: "Opbouw",
    lightOutput: "3250-reeks projecttype volgens opgelegde keuze; technische fiche online nog te koppelen aan exact artikel.",
    autonomy: "1 h / 3 h volgens gekozen uitvoering",
    battery: "Volgens technische fiche LSM3250LDPW",
    protection: "Volgens technische fiche LSM3250LDPW",
    standards: "Noodverlichting volgens EN 60598-2-22 te verifiëren op definitieve fiche",
    source: "https://zemper.com/nl-be/noodverlichting-4/",
  },
};

const toolLabels = {
  escapeRoute: "VR",
  antiPanic: "AP",
  highOutput: "HO",
};

function euro(value) {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function readConfig() {
  const data = new FormData(form);
  return {
    area: Number(data.get("area") || 0),
    building: data.get("building"),
    zones: Number(data.get("zones") || 1),
    royalDecreeLayout: data.get("royalDecreeLayout") === "on",
    escapeRoute: data.get("escapeRoute") === "on",
    antiPanic: data.get("antiPanic") === "on",
    monitoring: data.get("monitoring") === "on",
    ip65: data.get("ip65") === "on",
    mounting: data.get("mounting"),
    autonomy: data.get("autonomy"),
    budget: Number(data.get("budget") || 0),
  };
}

function chooseSeries(config) {
  if (config.area > 300 || config.building === "magazijn") return "power";
  if (config.monitoring || config.budget >= 4200) return "smart";
  if (config.budget < 1800) return "compact";
  return "standard";
}

function getKbFixtureCount(area) {
  if (area <= 0) return 0;
  if (area > 60) return Math.max(2, Math.ceil(area / 30));
  return Math.max(1, Math.ceil(area / 30));
}

function getAutoLayout(area) {
  const count = getKbFixtureCount(area);
  if (!count) return [];
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  return Array.from({ length: count }, (_, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = ((col + 0.5) / cols) * 100;
    const y = ((row + 0.5) / rows) * 100;
    return {
      id: `auto-${index}`,
      type: index % 3 === 2 ? "antiPanic" : "escapeRoute",
      x,
      y,
      auto: true,
      segment: index + 1,
    };
  });
}

function getPlacedItems(config = readConfig()) {
  return [...(config.royalDecreeLayout ? getAutoLayout(config.area) : []), ...manualItems];
}

function countPlaced(type, config) {
  return getPlacedItems(config).filter((item) => item.type === type).length;
}

function calculateProposal(config) {
  const seriesKey = chooseSeries(config);
  const series = zemperSeries[seriesKey];
  const projectType = projectTypes[config.mounting];
  const rules = [];
  const lines = [];
  const kbMin = config.royalDecreeLayout ? getKbFixtureCount(config.area) : 0;
  const escapeRouteMin = config.escapeRoute ? Math.max(kbMin, config.zones) : 0;
  const antiPanicMin = config.antiPanic ? Math.max(1, Math.ceil(config.area / 120)) : 0;
  const highOutputMin = config.area > 250 || config.building === "magazijn" ? Math.ceil(config.area / 180) : 0;
  const escapeRouteQty = Math.max(escapeRouteMin, countPlaced("escapeRoute", config));
  const antiPanicQty = Math.max(antiPanicMin, countPlaced("antiPanic", config));
  const highOutputQty = Math.max(highOutputMin, countPlaced("highOutput", config));

  rules.push(`Volgens de projectregel wordt elke 30 m² als vak beschouwd; ${config.area} m² geeft ${kbMin} automatisch geplaatste armatuur(en).`);
  rules.push(`Bij meer dan 60 m² worden minstens 2 noodverlichtingen voorzien en in het midden van de 30 m²-vakken getekend.`);
  rules.push(`${config.mounting === "inbouw" ? "Inbouw" : "Opbouw"} kiest automatisch type ${projectType.code}.`);
  rules.push(`${config.budget >= 4200 || config.monitoring ? "Smart/DALI2" : "standalone"} voorstel op basis van budget en bewaking.`);
  rules.push(`${config.autonomy} uur autonomie geselecteerd; Zemper-series ondersteunen 1 of 3 uur volgens de geraadpleegde productdata.`);

  function addSeriesLine(label, quantity, selectedSeries = series, selectedType = projectType) {
    if (quantity <= 0) return;
    lines.push({
      name: `${label}: ${selectedType.code} (${selectedType.name})`,
      quantity,
      description: `${selectedType.mounting}. ${selectedType.lightOutput} Reeksreferentie: ${selectedSeries.name}, ${selectedSeries.lumen}, ${selectedSeries.control}.`,
      unitPrice: selectedType.unitPrice,
      total: selectedType.unitPrice * quantity,
      color: selectedSeries.color,
      source: selectedType.source,
      tech: [
        `Autonomie: ${selectedType.autonomy}`,
        `Batterij: ${selectedType.battery}`,
        `Bescherming: ${selectedType.protection}`,
        `Normen: ${selectedType.standards}`,
      ],
    });
  }

  addSeriesLine("Vluchtroute", escapeRouteQty);
  addSeriesLine("Anti-paniek", antiPanicQty, seriesKey === "compact" ? zemperSeries.compact : zemperSeries.standard);
  addSeriesLine("High output", highOutputQty, zemperSeries.power);

  if (config.ip65) {
    lines.push({
      ...accessoryCatalog.ip65,
      quantity: Math.max(1, escapeRouteQty + antiPanicQty + highOutputQty),
      total: accessoryCatalog.ip65.unitPrice * Math.max(1, escapeRouteQty + antiPanicQty + highOutputQty),
    });
  }

  if (config.monitoring) {
    lines.push({
      ...accessoryCatalog.smartCentral,
      quantity: 1,
      total: accessoryCatalog.smartCentral.unitPrice,
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const engineering = Math.max(220, Math.round(subtotal * 0.1));
  const total = subtotal + engineering;

  return { series, lines, subtotal, engineering, total, rules };
}

function renderSketch() {
  sketch.querySelectorAll(".placed-item").forEach((node) => node.remove());
  const config = readConfig();
  getPlacedItems(config).forEach((item) => {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = `placed-item ${item.type}${item.auto ? " auto" : ""}`;
    marker.style.left = `${item.x}%`;
    marker.style.top = `${item.y}%`;
    marker.textContent = item.auto ? `${item.segment}` : toolLabels[item.type];
    marker.title = item.auto ? `Automatisch vak ${item.segment}` : "Klik om te verwijderen";
    marker.addEventListener("click", (event) => {
      event.stopPropagation();
      if (item.auto) return;
      manualItems = manualItems.filter((placed) => placed.id !== item.id);
      update();
    });
    sketch.append(marker);
  });
}

function renderQuote() {
  const config = readConfig();
  const proposal = calculateProposal(config);
  const placedItems = getPlacedItems(config);
  const remaining = config.budget - proposal.total;
  const budgetState = remaining >= 0 ? "Binnen budget" : "Boven budget";

  summaryNode.innerHTML = `
    <div class="metric"><span>Zemper reeks</span><strong>${proposal.series.code}</strong></div>
    <div class="metric"><span>Totaal</span><strong>${euro(proposal.total)}</strong></div>
    <div class="metric"><span>Budgetstatus</span><strong>${budgetState}</strong></div>
    <div class="metric"><span>Schetsitems</span><strong>${placedItems.length}</strong></div>
  `;

  productsNode.innerHTML = proposal.lines
    .map(
      (line) => `
        <article class="product">
          <div class="product-visual" style="color:${line.color}"></div>
          <div>
            <h3>${line.quantity} x ${line.name}</h3>
            <p>${line.description}</p>
            ${line.tech ? `<ul class="tech-list">${line.tech.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
            ${line.source ? `<a href="${line.source}" target="_blank" rel="noreferrer">Zemper serie</a>` : ""}
          </div>
          <div class="price">${euro(line.total)}</div>
        </article>
      `,
    )
    .join("");

  rulesNode.innerHTML = proposal.rules.map((rule) => `<li>${rule}</li>`).join("");
}

function update() {
  renderSketch();
  renderQuote();
}

toolButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedTool = button.dataset.tool;
    toolButtons.forEach((tool) => tool.classList.toggle("active", tool === button));
  });
});

sketch.addEventListener("click", (event) => {
  const rect = sketch.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  manualItems.push({ id: crypto.randomUUID(), type: selectedTool, x, y });
  update();
});

form.addEventListener("input", update);
printButton.addEventListener("click", () => window.print());

update();
