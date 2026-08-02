import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(
  new URL("../business-card-templates.js", import.meta.url),
  "utf8"
);
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox, { filename: "business-card-templates.js" });

// Normalize values from the VM realm before using strict deep comparisons.
const templates = JSON.parse(
  JSON.stringify(sandbox.window.BUSINESS_CARD_TEMPLATES)
);

const requiredFields = [
  "id",
  "name",
  "category",
  "industry",
  "orientation",
  "frontBackground",
  "backBackground",
  "frontTextColor",
  "backTextColor",
  "primaryColor",
  "secondaryColor",
  "fontFamily",
  "fontWeight",
  "frontLayout",
  "backLayout",
  "frontTextAlign",
  "backTextAlign",
  "logoPosition",
  "infoPosition",
  "qrPosition",
  "dividerStyle",
  "borderStyle",
  "iconStyle",
  "nameSize",
  "bodySize",
  "letterSpacing",
  "lineHeight",
  "padding",
  "borderRadius"
];

const faceFields = [
  "fontWeight",
  "logoPosition",
  "infoPosition",
  "qrPosition",
  "dividerStyle",
  "borderStyle",
  "iconStyle",
  "nameSize",
  "bodySize",
  "letterSpacing",
  "lineHeight",
  "padding",
  "verticalAlign",
  "motif"
];

const requiredIndustryIds = [
  "police",
  "cafe",
  "hair",
  "nail",
  "taxi",
  "developer",
  "designer",
  "realestate",
  "hotel",
  "airline",
  "dental",
  "fashion"
];

const expectedLayouts = {
  signature: ["classic-split", "classic-mark"],
  modern: ["modern-sidebar", "modern-contact"],
  minimal: ["minimal-space", "minimal-rule"],
  premium: ["premium-crest", "premium-balanced"],
  creative: ["creative-grid", "creative-notes"],
  noir: ["noir-block", "noir-columns"],
  police: ["police-emblem", "police-right"],
  cafe: ["cafe-seal", "cafe-social"],
  hair: ["hair-asymmetric", "hair-booking"],
  nail: ["nail-center", "nail-corner"],
  taxi: ["taxi-bold", "taxi-split"],
  developer: ["developer-terminal", "developer-right"],
  designer: ["designer-grid", "designer-details"],
  realestate: ["realestate-split", "realestate-map"],
  hotel: ["hotel-crest", "hotel-balanced"],
  airline: ["airline-route", "airline-right"],
  dental: ["dental-clean", "dental-center"],
  fashion: ["fashion-editorial", "fashion-magazine"]
};

test("registry exposes six basic and exactly twelve required industry templates", () => {
  assert.ok(Array.isArray(templates));
  assert.equal(templates.length, 18);
  assert.equal(templates.filter((item) => item.category === "basic").length, 6);

  const industryIds = templates
    .filter((item) => item.category === "industry")
    .map((item) => item.id)
    .sort();
  assert.deepEqual(industryIds, [...requiredIndustryIds].sort());
  assert.equal(new Set(templates.map((item) => item.id)).size, templates.length);
});

test("every TemplateData object is complete and face-aware", () => {
  for (const template of templates) {
    for (const field of requiredFields) {
      assert.ok(
        Object.hasOwn(template, field),
        `${template.id} is missing ${field}`
      );
    }

    for (const field of faceFields) {
      assert.equal(typeof template[field], "object", `${template.id}.${field}`);
      assert.ok(Object.hasOwn(template[field], "front"), `${template.id}.${field}.front`);
      assert.ok(Object.hasOwn(template[field], "back"), `${template.id}.${field}.back`);
    }

    assert.ok(template.description.length >= 12, `${template.id} description`);
    assert.ok(template.industries.length >= 2, `${template.id} industries`);
    assert.ok(template.searchAliases.length >= 2, `${template.id} aliases`);
    assert.ok(template.icon, `${template.id} icon`);
    assert.ok(Array.isArray(template.frontDetails), `${template.id} frontDetails`);
    assert.ok(Array.isArray(template.backDetails), `${template.id} backDetails`);

    for (const detail of [...template.frontDetails, ...template.backDetails]) {
      assert.ok(Object.hasOwn(detail, "label"), `${template.id} detail label`);
      assert.ok(detail.key || detail.value, `${template.id} detail source`);
      assert.ok(detail.format, `${template.id} detail format`);
    }
  }
});

test("layout IDs are stable and every template has a distinct composition", () => {
  for (const template of templates) {
    assert.deepEqual(
      [template.frontLayout, template.backLayout],
      expectedLayouts[template.id],
      `${template.id} layout contract changed`
    );
  }

  assert.equal(new Set(templates.map((item) => item.frontLayout)).size, 18);
  assert.equal(new Set(templates.map((item) => item.backLayout)).size, 18);
});

test("industry-defining colors, alignment, and positions cannot drift", () => {
  const byId = Object.fromEntries(templates.map((item) => [item.id, item]));

  assert.equal(byId.taxi.frontBackground, "#ffd21f");
  assert.equal(byId.taxi.backBackground, "#ffc800");
  assert.equal(byId.taxi.backLayout, "taxi-split");
  assert.equal(byId.taxi.qrPosition.back, "bottom-left");

  assert.equal(byId.nail.frontBackground, "#f8e2e9");
  assert.equal(byId.nail.backBackground, "#f3ceda");
  assert.equal(byId.nail.infoPosition.back, "bottom-right");
  assert.equal(byId.nail.frontTextAlign, "center");

  assert.equal(byId.police.logoPosition.front, "center");
  assert.equal(byId.police.backTextAlign, "right");
  assert.equal(byId.police.dividerStyle.back, "gold-bottom-rule");

  assert.equal(byId.cafe.frontTextAlign, "center");
  assert.equal(byId.cafe.backTextAlign, "center");
  assert.equal(byId.cafe.qrPosition.back, "bottom-right");

  assert.equal(byId.hair.qrPosition.back, "bottom-right");
  assert.equal(byId.developer.backTextAlign, "right");
  assert.equal(byId.developer.infoPosition.back, "center-right");
});

test("every TemplateData visual token has a renderer style", () => {
  const tokenFields = {
    borderStyle: "bc-border-",
    dividerStyle: "bc-divider-",
    iconStyle: "bc-icon-",
    motif: "bc-motif-"
  };

  for (const template of templates) {
    for (const layout of [template.frontLayout, template.backLayout]) {
      assert.match(html, new RegExp(`\\.bc-layout-${layout}(?:[\\s.{,:])`), `${template.id}.${layout}`);
    }

    for (const [field, prefix] of Object.entries(tokenFields)) {
      for (const face of ["front", "back"]) {
        const token = template[field][face];
        if (token === "none") continue;
        assert.ok(html.includes(`.${prefix}${token}`), `${template.id}.${field}.${face}: ${token}`);
      }
    }
  }
});
