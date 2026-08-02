import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("classic inline scripts parse as JavaScript", () => {
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((match) => !/type=["']module["']/.test(match[1]));

  assert.ok(scripts.length > 0);
  scripts.forEach((match, index) => {
    assert.doesNotThrow(
      () => new vm.Script(match[2], { filename: `index-inline-${index + 1}.js` }),
      `inline script ${index + 1} should parse`
    );
  });
});

test("business cards use one scoped renderer for thumbnails and both live faces", () => {
  assert.equal((html.match(/function renderFace\(/g) || []).length, 1);
  assert.equal((html.match(/function cardRender\(/g) || []).length, 1);
  assert.match(html, /function ncMiniFront\(t\)\{const r=renderFace\(t,"front"/);
  assert.match(html, /function ncMiniBack\(t\)\{const r=renderFace\(t,"back"/);
  assert.match(html, /applyRenderedFace\(front,renderFace\(t,"front",d,"live"\)\)/);
  assert.match(html, /applyRenderedFace\(back,renderFace\(t,"back",d,"live"\)\)/);
  assert.doesNotMatch(html, /id=["']nc(?:Back)?Qr["']/);
  assert.match(html, /data-card-qr=/);
});

test("face editor and two-sided exports remain wired", () => {
  for (const id of [
    "cFaceTabs",
    "cAdjAlign",
    "cAdjValign",
    "cAdjQr",
    "cAdjLogo",
    "cAdjInfo",
    "cAdjName",
    "cAdjBody",
    "cAdjPad",
    "cAdjLh",
    "cAdjLs"
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }

  assert.match(html, /Promise\.all\(\[captureElement\(\$\("#ncFront"\)\),captureElement\(\$\("#ncBack"\)\)\]\)/);
  assert.match(html, /scope==="card"\?await captureCardFaceUrls\(\)/);
  assert.doesNotMatch(html, /color-mix\(/);
});
