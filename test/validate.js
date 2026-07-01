#!/usr/bin/env node
/** Validation basique du fichier .ics généré. Sort en erreur si un problème est détecté. */

const { buildIcs } = require("../src/generate-ics");
const { PRENOMS } = require("../src/prenoms");

const ics = buildIcs();
const errors = [];

function check(cond, message) {
  if (!cond) errors.push(message);
}

// Structure générale
check(ics.startsWith("BEGIN:VCALENDAR"), "Le calendrier ne commence pas par BEGIN:VCALENDAR");
check(ics.trimEnd().endsWith("END:VCALENDAR"), "Le calendrier ne se termine pas par END:VCALENDAR");

// Lignes CRLF
check(ics.includes("\r\n"), "Les lignes ne sont pas terminées par CRLF");

// Un VEVENT par jour de données
const begins = (ics.match(/BEGIN:VEVENT/g) || []).length;
const ends = (ics.match(/END:VEVENT/g) || []).length;
const expected = Object.keys(PRENOMS).length;
check(begins === expected, `BEGIN:VEVENT = ${begins}, attendu ${expected}`);
check(ends === expected, `END:VEVENT = ${ends}, attendu ${expected}`);

// UID uniques
const uids = ics.match(/UID:[^\r\n]+/g) || [];
check(new Set(uids).size === uids.length, "UID en double détectés");

// Récurrence annuelle sur chaque événement
const rrules = (ics.match(/RRULE:FREQ=YEARLY/g) || []).length;
check(rrules === expected, `RRULE:FREQ=YEARLY = ${rrules}, attendu ${expected}`);

// Chaque événement a un SUMMARY non vide
const summaries = ics.match(/SUMMARY:[^\r\n]*/g) || [];
check(summaries.length === expected, `SUMMARY = ${summaries.length}, attendu ${expected}`);
check(!summaries.some((s) => s === "SUMMARY:"), "Un SUMMARY est vide");

// Aucune ligne pliée ne dépasse 75 octets
for (const line of ics.split("\r\n")) {
  if (Buffer.byteLength(line, "utf8") > 75) {
    errors.push(`Ligne trop longue (${Buffer.byteLength(line, "utf8")} octets) : ${line.slice(0, 40)}...`);
    break;
  }
}

if (errors.length) {
  console.error("✗ Validation échouée :");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}

console.log(`✓ Calendrier valide : ${expected} événements, ${uids.length} UID uniques.`);
