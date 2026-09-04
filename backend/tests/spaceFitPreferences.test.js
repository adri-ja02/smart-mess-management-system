const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeSpaceFitPreferences } = require("../controllers/spaceFit.controller");

test("normalizes the expanded SpaceFit preferences payload", () => {
  const normalized = normalizeSpaceFitPreferences({
    studySpace: "7",
    storage: "4",
    privacy: "6",
    budget: "8000",
    roommateCount: "2",
    noiseTolerance: "3",
    preferredFloor: "2",
    moveInDate: "2026-08-15",
    maxCampusTravelTime: "12",
  });

  assert.equal(normalized.studySpace, 7);
  assert.equal(normalized.storage, 4);
  assert.equal(normalized.privacy, 6);
  assert.equal(normalized.budget, 8000);
  assert.equal(normalized.roommateCount, 2);
  assert.equal(normalized.noiseTolerance, 3);
  assert.equal(normalized.preferredFloor, 2);
  assert.equal(normalized.maxCampusTravelTime, 12);
  assert.ok(normalized.moveInDate instanceof Date);
  assert.equal(normalized.moveInDate.toISOString().slice(0, 10), "2026-08-15");
});
