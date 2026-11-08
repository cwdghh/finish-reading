import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, "../src/data/texts.json");
const texts = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const FORMS = new Set(["poem", "prose", "fiction", "classical"]);
const UNIT_TYPES = new Set(["full", "excerpt"]);
const WEATHERS = new Set(["晴", "薄雾", "小雨", "夜风", "雪", "晚霞"]);
const PACES = new Set(["slow", "steady", "brisk"]);
const DENSITIES = new Set(["light", "medium", "dense"]);
const WARNINGS = new Set(["死亡", "离别", "疾病", "暴力", "沉重意象"]);
const NEED_TAGS = new Set(["安慰", "逗笑", "点醒", "陪伴", "美", "力量"]);
const COPYRIGHT_SCOPES = new Set(["public-domain-cn-us", "public-domain-cn"]);
const REQUIRED = [
  "id",
  "workTitle",
  "unitTitle",
  "author",
  "authorDeathYear",
  "publicationYear",
  "form",
  "unitType",
  "readingMinutes",
  "difficulty",
  "pace",
  "density",
  "weather",
  "moodTags",
  "needTags",
  "valence",
  "arousal",
  "contentWarnings",
  "contextBefore",
  "contextAfter",
  "sections",
  "stanzas",
  "notes",
  "quote",
  "excerpt",
  "whyItFits",
  "moodDescription",
  "copyrightScope",
  "sourceName",
  "sourceUrl",
  "license",
  "accessedAt",
  "checkedAt",
];

const errors = [];
const warnings = [];
const ids = new Set();
const today = new Date();
today.setHours(23, 59, 59, 999);

function normalize(value) {
  return String(value ?? "").replace(/\s+/g, "");
}

function fail(id, message) {
  errors.push(`${id}: ${message}`);
}

function warn(id, message) {
  warnings.push(`${id}: ${message}`);
}

function isDateString(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function bodyOf(unit) {
  if (unit.form === "poem") return unit.stanzas.flat().join("\n");
  return unit.sections.flat().join("\n");
}

for (const unit of texts) {
  const id = unit.id ?? "(missing id)";
  if (typeof unit.id !== "string" || !/^[a-z0-9-]+$/.test(unit.id)) {
    fail(id, "id must be kebab-case");
  }
  if (ids.has(unit.id)) fail(id, "id is duplicated");
  ids.add(unit.id);

  for (const field of REQUIRED) {
    if (!(field in unit)) fail(id, `missing field ${field}`);
  }

  if (typeof unit.workTitle !== "string" || unit.workTitle.trim().length < 1) {
    fail(id, "workTitle is empty");
  }
  if (typeof unit.unitTitle !== "string" || unit.unitTitle.trim().length < 1) {
    fail(id, "unitTitle is empty");
  }
  if (unit.unitType === "full" && unit.unitTitle.includes("节选")) {
    fail(id, "full unit must not be titled 节选");
  }
  if (unit.unitType === "excerpt" && unit.unitTitle === "全文") {
    fail(id, "excerpt unit must have a section title, not 全文");
  }
  if (typeof unit.author !== "string" || unit.author.trim().length < 1) {
    fail(id, "author is empty");
  }
  if (!Number.isInteger(unit.authorDeathYear) || unit.authorDeathYear <= 0) {
    fail(id, "authorDeathYear must be a positive integer");
  }
  if (!Number.isInteger(unit.publicationYear) || unit.publicationYear <= 0) {
    fail(id, "publicationYear must be a positive integer");
  }
  if (unit.authorDeathYear > 1975) {
    fail(id, "author died after 1975; not safely public domain in China");
  }
  if (!COPYRIGHT_SCOPES.has(unit.copyrightScope)) {
    fail(id, "copyrightScope is invalid");
  }
  if (unit.copyrightScope === "public-domain-cn-us" && unit.publicationYear > 1930) {
    fail(id, "US public-domain claim requires publication in 1930 or earlier");
  }
  if (unit.copyrightScope === "public-domain-cn" && unit.publicationYear > 1975) {
    fail(id, "China-only public-domain claim has an implausible publication year");
  }
  if (typeof unit.sourceName !== "string" || !unit.sourceName.includes("维基文库")) {
    fail(id, "sourceName should name 中文维基文库");
  }
  if (typeof unit.sourceUrl !== "string" || !unit.sourceUrl.startsWith("https://zh.wikisource.org/")) {
    fail(id, "sourceUrl must be a Chinese Wikisource URL");
  }
  if (typeof unit.sourceUrl === "string" && unit.sourceUrl.includes("ctext.org")) {
    fail(id, "ctext.org must not be used as a text source");
  }
  if (typeof unit.license !== "string" || !unit.license.includes("公有领域")) {
    fail(id, "license must state public domain");
  }
  if (!isDateString(unit.accessedAt) || !isDateString(unit.checkedAt)) {
    fail(id, "accessedAt and checkedAt must be YYYY-MM-DD");
  } else {
    for (const field of ["accessedAt", "checkedAt"]) {
      const parsed = new Date(`${unit[field]}T23:59:59`);
      if (Number.isNaN(parsed.getTime()) || parsed > today) {
        fail(id, `${field} is in the future or invalid`);
      }
    }
  }

  if (!FORMS.has(unit.form)) fail(id, "form is invalid");
  if (!UNIT_TYPES.has(unit.unitType)) fail(id, "unitType is invalid");
  if (!Number.isInteger(unit.readingMinutes) || unit.readingMinutes < 2 || unit.readingMinutes > 15) {
    fail(id, "readingMinutes must be an integer between 2 and 15");
  }
  if (![1, 2, 3].includes(unit.difficulty)) fail(id, "difficulty must be 1, 2 or 3");
  if (!PACES.has(unit.pace)) fail(id, "pace is invalid");
  if (!DENSITIES.has(unit.density)) fail(id, "density is invalid");
  if (!WEATHERS.has(unit.weather)) fail(id, "weather is invalid");
  if (typeof unit.valence !== "number" || unit.valence < 0 || unit.valence > 1) {
    fail(id, "valence must be 0–1");
  }
  if (typeof unit.arousal !== "number" || unit.arousal < 0 || unit.arousal > 1) {
    fail(id, "arousal must be 0–1");
  }

  if (!Array.isArray(unit.moodTags) || unit.moodTags.length < 2) {
    fail(id, "moodTags must contain at least two tags");
  }
  if (!Array.isArray(unit.needTags) || unit.needTags.length < 1) {
    fail(id, "needTags must not be empty");
  } else {
    for (const tag of unit.needTags) {
      if (!NEED_TAGS.has(tag)) fail(id, `unknown needTag ${tag}`);
    }
  }
  if (!Array.isArray(unit.contentWarnings)) {
    fail(id, "contentWarnings must be an array");
  } else {
    for (const warning of unit.contentWarnings) {
      if (!WARNINGS.has(warning)) fail(id, `unknown content warning ${warning}`);
    }
    if (unit.contentWarnings.includes("无")) fail(id, "use an empty array instead of 无");
  }

  if (typeof unit.contextBefore !== "string" || unit.contextBefore.trim().length < 4) {
    fail(id, "contextBefore is too short");
  }
  if (typeof unit.contextAfter !== "string") {
    fail(id, "contextAfter must be a string");
  }

  if (unit.form === "poem") {
    if (!Array.isArray(unit.stanzas) || unit.stanzas.length === 0) {
      fail(id, "poem must have stanzas");
    } else {
      const lines = unit.stanzas.flat();
      if (lines.length < 2) fail(id, "poem must have at least two lines");
      for (const line of lines) {
        if (typeof line !== "string" || line.trim().length === 0) fail(id, "poem line is empty");
        if (line.length > 40) warn(id, `poem line is long (${line.length} chars)`);
      }
      if (lines.length > 60) warn(id, `poem has ${lines.length} lines`);
    }
    if (Array.isArray(unit.sections) && unit.sections.length > 0) {
      warn(id, "poem also has prose sections");
    }
  } else {
    if (!Array.isArray(unit.sections) || unit.sections.length === 0) {
      fail(id, "prose unit must have sections");
    } else {
      if (unit.sections.length > 6) warn(id, `has ${unit.sections.length} sections`);
      let total = 0;
      for (const [index, section] of unit.sections.entries()) {
        if (!Array.isArray(section) || section.length === 0) {
          fail(id, `section ${index + 1} is empty`);
          continue;
        }
        let sectionChars = 0;
        for (const paragraph of section) {
          if (typeof paragraph !== "string") {
            fail(id, `section ${index + 1} contains a non-string paragraph`);
            continue;
          }
          const length = normalize(paragraph).length;
          sectionChars += length;
          total += length;
          if (length < 4) fail(id, `section ${index + 1} has a very short paragraph (${length})`);
          if (length > 1200) warn(id, `section ${index + 1} has a long paragraph (${length})`);
        }
        if (sectionChars < 20) fail(id, `section ${index + 1} is shorter than 20 chars`);
        if (sectionChars > 3000) warn(id, `section ${index + 1} is longer than 3000 chars`);
      }
      if (total < 60) fail(id, "unit is shorter than 60 chars");
      if (unit.readingMinutes > 0) {
        const perMinute = total / unit.readingMinutes;
        if (perMinute > 700) warn(id, `${Math.round(perMinute)} chars per reading minute is dense`);
      }
    }
    if (Array.isArray(unit.stanzas) && unit.stanzas.length > 0) {
      warn(id, "prose unit also has stanzas");
    }
  }

  if (!Array.isArray(unit.notes)) {
    fail(id, "notes must be an array");
  } else {
    for (const note of unit.notes) {
      if (typeof note?.term !== "string" || !note.term.trim()) fail(id, "note term is empty");
      if (typeof note?.text !== "string" || !note.text.trim()) fail(id, "note text is empty");
    }
    if (unit.form === "classical" && unit.notes.length < 2) {
      warn(id, "classical unit has fewer than two notes");
    }
  }

  if (typeof unit.quote !== "string" || unit.quote.trim().length < 4) {
    fail(id, "quote is too short");
  } else if (!normalize(bodyOf(unit)).includes(normalize(unit.quote))) {
    fail(id, "quote does not appear in the body");
  }
  if (typeof unit.excerpt !== "string" || unit.excerpt.trim().length < 4) {
    fail(id, "excerpt is too short");
  } else if (!normalize(bodyOf(unit)).includes(normalize(unit.excerpt))) {
    warn(id, "excerpt does not appear verbatim in the body");
  }
  if (typeof unit.whyItFits !== "string" || unit.whyItFits.trim().length < 12) {
    fail(id, "whyItFits is too short");
  }
  if (typeof unit.moodDescription !== "string" || unit.moodDescription.trim().length < 12) {
    fail(id, "moodDescription is too short");
  }
}

if (texts.length < 48 || texts.length > 60) {
  errors.push(`library size is ${texts.length}; expected 48–60`);
}

const formCounts = Object.fromEntries(
  [...FORMS].map((form) => [form, texts.filter((unit) => unit.form === form).length]),
);
for (const [form, count] of Object.entries(formCounts)) {
  if (count < 6) errors.push(`form ${form} has only ${count} units; expected at least 6`);
}

const needCounts = Object.fromEntries(
  [...NEED_TAGS].map((tag) => [tag, texts.filter((unit) => unit.needTags.includes(tag)).length]),
);
for (const [tag, count] of Object.entries(needCounts)) {
  if (count < 8) errors.push(`need tag ${tag} has only ${count} units; expected at least 8`);
}

const AFFINITY = {
  blocked: ["安慰", "温柔", "怀旧", "安静", "亲情"],
  escape: ["美", "逃离", "自然", "安静", "浪漫"],
  wronged: ["安慰", "温柔", "陪伴", "怀旧", "亲情"],
  tired: ["安静", "陪伴", "温柔", "夜", "闲适"],
  strength: ["力量", "豁达", "点醒", "希望", "明亮"],
  restless: ["安静", "点醒", "夜", "陪伴", "逃离"],
  good: ["轻盈", "美", "浪漫", "童趣", "明亮"],
  light: ["轻盈", "逗笑", "童趣", "明亮", "闲适"],
};
const PRIORITY = {
  low: ["安慰", "陪伴", "点醒"],
  tired: ["安慰", "逗笑", "点醒"],
  good: ["逗笑", "美", "点醒"],
};
const BRANCH_LEAVES = {
  low: ["blocked", "escape", "wronged"],
  tired: ["tired", "strength", "restless"],
  good: ["good", "light"],
};

function matchingUnits(leaf) {
  const tags = new Set(AFFINITY[leaf]);
  return texts.filter((unit) => unit.moodTags.some((tag) => tags.has(tag)));
}

const matrix = [];
for (const [branch, leaves] of Object.entries(BRANCH_LEAVES)) {
  for (const leaf of leaves) {
    const pool = matchingUnits(leaf);
    if (pool.length < 8) errors.push(`leaf ${leaf} has only ${pool.length} mood matches; expected at least 8`);
    const row = { leaf, total: pool.length };
    for (const need of PRIORITY[branch]) {
      const count = pool.filter((unit) => unit.needTags.includes(need)).length;
      row[need] = count;
      if (count < 3) {
        errors.push(`leaf ${leaf} × need ${need} has only ${count} candidates; expected at least 3`);
      }
    }
    matrix.push(row);
  }
}

console.log(`validate-texts: ${texts.length} units`);
console.log(`forms: ${Object.entries(formCounts).map(([form, count]) => `${form}=${count}`).join(" ")}`);
console.log(`needs: ${Object.entries(needCounts).map(([tag, count]) => `${tag}=${count}`).join(" ")}`);
console.log("coverage (leaf / total / priority needs):");
for (const row of matrix) {
  const needs = PRIORITY[Object.keys(BRANCH_LEAVES).find((branch) => BRANCH_LEAVES[branch].includes(row.leaf))]
    .map((need) => `${need}=${row[need]}`)
    .join(" ");
  console.log(`  ${row.leaf.padEnd(9)} ${String(row.total).padStart(2)}  ${needs}`);
}

if (warnings.length > 0) {
  console.log(`\nwarnings (${warnings.length}):`);
  for (const message of warnings) console.log(`  - ${message}`);
}
if (errors.length > 0) {
  console.error(`\nerrors (${errors.length}):`);
  for (const message of errors) console.error(`  - ${message}`);
  process.exit(1);
}
console.log("\nvalidate-texts: ok");
