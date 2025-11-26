<template>
  <section class="m7-hero">
    <div class="m7-hero__inner">
      <div class="m7-cards" :class="{loading}">
        <div v-for="card in cards" :key="card.ticker" class="m7-card">
          <div class="m7-card__top">
            <div class="m7-chip">
              <img :src="card.icon" :alt="card.company" class="m7-logo" />
              <span class="m7-chip__name">{{ card.company }}</span>
            </div>
          </div>
          <div class="m7-badge">Revenue {{ card.quarter || "—" }}</div>

          <div class="m7-card__value">
            <span class="m7-number">{{ card.revenueFmt }}</span>
            <span class="m7-unit">B</span>
          </div>

          <div class="m7-card__meta">
            <div class="m7-kpi">
              <span class="m7-kpi__label">QoQ</span>
              <span :class="['m7-kpi__val', card.qoqClass]">
                <span class="m7-arrow" :class="card.qoqClass"></span>
                {{ card.qoqFmt }}
              </span>
            </div>
            <div class="m7-kpi">
              <span class="m7-kpi__label">YoY</span>
              <span :class="['m7-kpi__val', card.yoyClass]">
                <span class="m7-arrow" :class="card.yoyClass"></span>
                {{ card.yoyFmt }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="!loading && !error && cards.length === 0" class="m7-empty">
          Keine passenden Daten gefunden.
        </div>
        <div v-if="error" class="m7-error">⚠️ {{ error }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {ref, computed, onMounted} from "vue";
import appleLogo from "@/assets/img/apple.png";
console.log(appleLogo);

/** ========= KONFIG: Spaltennamen aus deiner SheetDB =========
 *  Passe diese Konstanten an deine Tabelle an (exakte Schreibweise).
 *  Beispiele sind nur Platzhalter!
 */
const KEY_COMPANY = "Company"; // z. B. 'Company'
const KEY_TICKER = "Ticker"; // z. B. 'Ticker'
const KEY_QUARTER = "Quarter"; // z. B. 'Quarter' ('Q4 2024' etc.)
const KEY_REVENUE = "Revenue"; // z. B. 'Revenue' (in $) ODER 'Revenue (USD B)' (in Mrd.$)
const KEY_QOQ = "QoQ"; // z. B. 'QoQ' (in %; +2.5 oder 2.5 oder "2.5%")
const KEY_YOY = "YoY"; // z. B. 'YoY' (in %)

const API_URL = "https://sheetdb.io/api/v1/l5zfa88jgga0l";

// M7 Referenz (Reihenfolge & Farben)
const M7 = [
  {
    company: "Apple",
    ticker: "AAPL",
    icon: appleLogo,
  },
  {
    company: "Meta",
    ticker: "META",
    icon: new URL("@/assets/img/meta.png", import.meta.url).href,
  },
  {
    company: "Microsoft",
    ticker: "MSFT",
    icon: require("@/assets/img/microsoft.png"),
  },
  {
    company: "Alphabet",
    ticker: "GOOGL",
    icon: new URL("@/assets/img/google.png", import.meta.url).href,
  },
  {
    company: "Amazon",
    ticker: "AMZN",
    icon: new URL("@/assets/img/amazone.png", import.meta.url).href,
  },
  {
    company: "Tesla",
    ticker: "TSLA",
    icon: new URL("@/assets/img/tesla.png", import.meta.url).href,
  },
  {
    company: "NVIDIA",
    ticker: "NVDA",
    icon: new URL("@/assets/img/nvidia.png", import.meta.url).href,
  },
];

const loading = ref(true);
const error = ref("");
const rows = ref([]);

onMounted(async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await fetch(API_URL, {cache: "no-store"});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data))
      throw new Error("Unerwartete API-Antwort (kein Array).");
    // Umsatz aus dem letzten Quartal (z.B. 'Dec 21') auslesen
    let lastQuarter = "Dec 21";
    let revenueValue = null;
    for (const obj of data) {
      if (
        obj[lastQuarter] &&
        !isNaN(parseFloat(obj[lastQuarter].replace(/,/g, "")))
      ) {
        revenueValue = obj[lastQuarter];
        break;
      }
    }
    // Zeige Wert in Konsole
    console.log("Letzter Quartalsumsatz:", revenueValue);
    rows.value = data;
    // Optional: Zeige Wert im Template
    // Du kannst revenueValue im Template anzeigen lassen
  } catch (e) {
    error.value = `Fehler beim Laden: ${e.message}`;
  } finally {
    loading.value = false;
  }
});

const byTickerLatest = computed(() => {
  // Baue: ticker -> frischeste Zeile (nach Datum/Quarter heuristisch)
  const map = new Map();
  for (const r of rows.value) {
    const t = String(r[KEY_TICKER] ?? "").toUpperCase();
    const c = String(r[KEY_COMPANY] ?? "").trim();
    if (!t && !c) continue;
    const rank = freshnessRank(r[KEY_QUARTER]);
    const prev = map.get(t || c);
    if (!prev || rank > prev.rank) {
      map.set(t || c, {row: r, rank});
    }
  }
  return map;
});

const cards = computed(() =>
  M7.map((m) => {
    const key =
      byTickerLatest.value.get(m.ticker) || byTickerLatest.value.get(m.company);
    const r = key?.row;
    const revRaw = r?.[KEY_REVENUE];
    const qoqRaw = r?.[KEY_QOQ];
    const yoyRaw = r?.[KEY_YOY];
    const quarter = r?.[KEY_QUARTER] || "";

    const revenueB = normalizeToBillions(toNumber(revRaw));
    const qoq = toPercentNumber(qoqRaw);
    const yoy = toPercentNumber(yoyRaw);

    return {
      company: m.company,
      ticker: m.ticker,
      icon: m.icon,
      quarter,
      revenueFmt: isFinite(revenueB) ? nf(revenueB) : "—",
      qoqFmt: isFinite(qoq) ? pf(qoq) : "—",
      yoyFmt: isFinite(yoy) ? pf(yoy) : "—",
      qoqClass: trendClass(qoq),
      yoyClass: trendClass(yoy),
    };
  })
);

/* ========== Utils ========== */
function toNumber(val) {
  if (val == null || val === "") return NaN;
  if (typeof val === "number") return val;
  const s = String(val).trim();
  const cleaned = s.replace(/[^\d.,-]/g, "");
  if (cleaned.includes(".") && cleaned.includes(",")) {
    return Number(cleaned.replace(/\./g, "").replace(",", "."));
  }
  return Number(cleaned.replace(",", "."));
}
function toPercentNumber(val) {
  if (val == null || val === "") return NaN;
  const n = toNumber(val);
  // falls "2.5" => 2.5%; falls "0.025" => 0.025%? -> Wir interpretieren üblich: 2.5 ist 2.5%
  return n;
}
function normalizeToBillions(v) {
  // Wenn bereits in 0..500 => schon Mrd. $
  // Wenn sehr groß => Dollar -> teile durch 1e9
  return v > 1e6 ? v / 1e9 : v;
}
function nf(n) {
  return new Intl.NumberFormat("en-US", {maximumFractionDigits: 2}).format(n);
}
function pf(n) {
  return `${new Intl.NumberFormat("en-US", {maximumFractionDigits: 2}).format(
    n
  )}%`;
}
function trendClass(n) {
  if (!isFinite(n)) return "";
  if (n > 0) return "up";
  if (n < 0) return "down";
  return "";
}
function freshnessRank(qtrStr) {
  // erkennt "Q4 2024", "2024 Q4", "Quartal 4 2024"
  const s = String(qtrStr || "");
  const m = s.match(
    /(?:^|\s)(?:q|quartal)\s*([1-4]).*?(\d{4})|(\d{4}).*?(?:q|quartal)\s*([1-4])/i
  );
  if (!m) return 0;
  const q = Number(m[1] ?? m[4]);
  const y = Number(m[2] ?? m[3]);
  return (y || 0) * 10 + (q || 0);
}
</script>

<style scoped>
/* --- Section background --- */
.m7-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row !important;
  height: 150px;
  top: -180px;
  overflow-x: scroll;
  max-width: 1400px;
  white-space: nowrap;
  border-radius: 12px;
  color: #e6eef9;
  scrollbar-width: 0;
  margin: 0 auto;
  padding: 20px 250px;
}

/* --- Cards grid --- */
.m7-cards {
  display: flex;
  gap: 25px;
}
.m7-card {
  background: linear-gradient(180deg, #101a2f 0%, #0c1528 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25) inset;
}
.m7-logo {
  width: 25px;
  height: 25px;
  object-fit: contain;
  border-radius: 4px;
}

/* top row */
.m7-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.m7-chip {
  display: flex;
  align-items: center;
  gap: 8px;
}
.m7-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.06) inset;
}
.m7-chip__name {
  font-weight: 600;
  color: #f4f8ff;
}

/* badge */
.m7-badge {
  color: #b8c4d9;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  white-space: nowrap;
}

/* value row */
.m7-card__value {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 10px;
}
.m7-number {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.2px;
}
.m7-unit {
  font-size: 14px;
  color: #9fb0cc;
}

/* meta KPIs */
.m7-card__meta {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}
.m7-kpi {
  display: flex;
  align-items: center;
  gap: 6px;
}
.m7-kpi__label {
  color: #9fb0cc;
  font-size: 12px;
}
.m7-kpi__val {
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.m7-kpi__val.up {
  color: #45df98;
}
.m7-kpi__val.down {
  color: #ff6b6b;
}
/* arrow */
.m7-arrow {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
}
.m7-arrow.up {
  border-bottom: 7px solid #45df98;
}
.m7-arrow.down {
  border-top: 7px solid #ff6b6b;
}

/* states */
.m7-empty {
  color: #b8c4d9;
  padding: 10px;
}
.m7-error {
  color: #ff8a8a;
  padding: 10px;
  border: 1px dashed rgba(255, 138, 138, 0.4);
  border-radius: 8px;
}
</style>
