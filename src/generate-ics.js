#!/usr/bin/env node
/**
 * Génère un fichier .ics recensant toutes les fêtes des prénoms.
 *
 * Chaque jour de l'année devient un événement « journée entière » qui se répète
 * chaque année (RRULE:FREQ=YEARLY). Le fichier produit peut être :
 *   - téléchargé et importé dans n'importe quel agenda ;
 *   - hébergé sur une URL publique et ajouté par abonnement à Google Agenda,
 *     Apple Calendar, Outlook, etc.
 *
 * Usage : node src/generate-ics.js [chemin de sortie]
 */

const fs = require("fs");
const path = require("path");
const { PRENOMS } = require("./prenoms");

const CALENDAR_NAME = "Fêtes des prénoms";
const CALENDAR_DESC =
  "Calendrier des fêtes des prénoms (calendrier français des saints). " +
  "Un prénom fêté chaque jour de l'année.";
// Année d'ancrage : les événements démarrent à cette année puis se répètent
// chaque année. On choisit une année bissextile pour que le 29 février existe.
const ANCHOR_YEAR = 2024;

/** Échappe les caractères spéciaux d'une valeur texte ICS (RFC 5545). */
function escapeText(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Plie les lignes à 75 octets max (RFC 5545). La continuation commence par une
 * espace. On mesure en octets UTF-8 pour ne pas couper au milieu d'un caractère.
 */
function foldLine(line) {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;

  const chunks = [];
  let current = "";
  let currentBytes = 0;
  // Première ligne : 75 octets. Lignes suivantes : 74 (l'espace initiale compte).
  let limit = 75;

  for (const ch of line) {
    const chBytes = Buffer.byteLength(ch, "utf8");
    if (currentBytes + chBytes > limit) {
      chunks.push(current);
      current = ch;
      currentBytes = chBytes;
      limit = 74;
    } else {
      current += ch;
      currentBytes += chBytes;
    }
  }
  chunks.push(current);
  return chunks.join("\r\n ");
}

/** Formate une date en AAAAMMJJ. */
function toDateValue(year, month, day) {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}${mm}${dd}`;
}

/** Ajoute un jour à un couple (mois, jour) de l'année d'ancrage → date de fin exclusive. */
function nextDay(year, month, day) {
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + 1);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

function buildIcs() {
  const now = new Date();
  const stamp =
    now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  const lines = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push("PRODID:-//quelprenom.com//Calendrier des fetes des prenoms//FR");
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");
  lines.push(`X-WR-CALNAME:${escapeText(CALENDAR_NAME)}`);
  lines.push(`NAME:${escapeText(CALENDAR_NAME)}`);
  lines.push(`X-WR-CALDESC:${escapeText(CALENDAR_DESC)}`);
  lines.push(`DESCRIPTION:${escapeText(CALENDAR_DESC)}`);
  lines.push("X-WR-TIMEZONE:Europe/Paris");
  lines.push("REFRESH-INTERVAL;VALUE=DURATION:P7D");
  lines.push("X-PUBLISHED-TTL:P7D");
  lines.push("COLOR:blue");

  const keys = Object.keys(PRENOMS).sort();
  for (const key of keys) {
    const [mm, dd] = key.split("-").map((n) => parseInt(n, 10));
    const prenoms = PRENOMS[key];
    const summary = prenoms.join(", ");

    const start = toDateValue(ANCHOR_YEAR, mm, dd);
    const end = nextDay(ANCHOR_YEAR, mm, dd);
    const endValue = toDateValue(end.year, end.month, end.day);

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:prenom-${key}@quelprenom.com`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART;VALUE=DATE:${start}`);
    lines.push(`DTEND;VALUE=DATE:${endValue}`);
    lines.push("RRULE:FREQ=YEARLY");
    lines.push(`SUMMARY:${escapeText(summary)}`);
    lines.push(
      `DESCRIPTION:${escapeText(
        prenoms.length > 1
          ? `On fête : ${summary}`
          : `On fête les ${summary}`
      )}`
    );
    lines.push("TRANSP:TRANSPARENT");
    lines.push("CLASS:PUBLIC");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return lines.map(foldLine).join("\r\n") + "\r\n";
}

function main() {
  const outArg = process.argv[2];
  const outPath = outArg
    ? path.resolve(outArg)
    : path.resolve(__dirname, "..", "calendrier-prenoms.ics");

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const ics = buildIcs();
  fs.writeFileSync(outPath, ics, "utf8");

  const eventCount = Object.keys(PRENOMS).length;
  console.log(`✓ ${eventCount} jours de fêtes écrits dans ${outPath}`);
}

if (require.main === module) {
  main();
}

module.exports = { buildIcs, foldLine, escapeText };
