const form = document.querySelector("#config-form");
const sketch = document.querySelector("#sketch");
const productsNode = document.querySelector("#products");
const summaryNode = document.querySelector("#quote-summary");
const rulesNode = document.querySelector("#rules");
const printButton = document.querySelector("#print-quote");
const toolButtons = [...document.querySelectorAll(".tool")];

let selectedTool = "escapeRoute";
let placedItems = [
  { id: crypto.randomUUID(), type: "escapeRoute", x: 16, y: 78 },
  { id: crypto.randomUUID(), type: "antiPanic", x: 57, y: 36 },
  { id: crypto.randomUUID(), type: "highOutput", x: 82, y: 72 },
];

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

function countPlaced(type) {
  return placedItems.filter((item) => item.type === type).length;
}

function calculateProposal(config) {
  const seriesKey = chooseSeries(config);
  const series = zemperSeries[seriesKey];
  const rules = [];
  const lines = [];
  const escapeRouteMin = config.escapeRoute ? Math.max(1, Math.ceil(config.area / 80), config.zones) : 0;
  const antiPanicMin = config.antiPanic ? Math.max(1, Math.ceil(config.area / 120)) : 0;
  const highOutputMin = config.area > 250 || config.building === "magazijn" ? Math.ceil(config.area / 180) : 0;
  const escapeRouteQty = Math.max(escapeRouteMin, countPlaced("escapeRoute"));
  const antiPanicQty = Math.max(antiPanicMin, countPlaced("antiPanic"));
  const highOutputQty = Math.max(highOutputMin, countPlaced("highOutput"));

  rules.push(`${config.area} m² vertaalt naar minimaal ${escapeRouteMin + antiPanicMin + highOutputMin} noodarmatuur(en).`);
  rules.push(`${config.zones} zone(s) verhogen het minimum voor vluchtrouteverlichting.`);
  rules.push(`${config.budget >= 4200 || config.monitoring ? "Smart/DALI2" : "standalone"} voorstel op basis van budget en bewaking.`);
  rules.push(`${config.autonomy} uur autonomie geselecteerd; Zemper-series ondersteunen 1 of 3 uur volgens de geraadpleegde productdata.`);
  rules.push(`${config.mounting === "plafond-inbouw" ? "Plafond inbouw" : "Plafond opbouw"} wordt als montagekeuze meegenomen in de offerte.`);

  function addSeriesLine(label, quantity, selectedSeries = series) {
    if (quantity <= 0) return;
    lines.push({
      name: `${label}: ${selectedSeries.name}`,
      quantity,
      description: `${selectedSeries.description} ${selectedSeries.lumen}. ${selectedSeries.control}.`,
      unitPrice: selectedSeries.unitPrice,
      total: selectedSeries.unitPrice * quantity,
      color: selectedSeries.color,
      source: selectedSeries.source,
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
  placedItems.forEach((item) => {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = `placed-item ${item.type}`;
    marker.style.left = `${item.x}%`;
    marker.style.top = `${item.y}%`;
    marker.textContent = toolLabels[item.type];
    marker.title = "Klik om te verwijderen";
    marker.addEventListener("click", (event) => {
      event.stopPropagation();
      placedItems = placedItems.filter((placed) => placed.id !== item.id);
      update();
    });
    sketch.append(marker);
  });
}

function renderQuote() {
  const config = readConfig();
  const proposal = calculateProposal(config);
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
  placedItems.push({ id: crypto.randomUUID(), type: selectedTool, x, y });
  update();
});

form.addEventListener("input", update);
printButton.addEventListener("click", () => window.print());

update();
