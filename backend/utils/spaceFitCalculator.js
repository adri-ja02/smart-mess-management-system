const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const calculateSpaceFitScore = (room, needs = {}) => {
  const preferences = {
    studySpace: Number(needs.studySpace) || 0,
    storage: Number(needs.storage) || 0,
    privacy: Number(needs.privacy) || 0,
    noiseTolerance: Number(needs.noiseTolerance) || 0,
    budget: Number(needs.budget) || 0,
    preferredFloor: Number(needs.preferredFloor) || 0,
    roommateCount: Number(needs.roommateCount) || 0,
  };
  const breakdown = [];
  const reasons = [];
  const addResult = (criterion, points, maxPoints, message) => {
    breakdown.push({ criterion, points, maxPoints, message });
    reasons.push(message);
  };

  const usableArea = Number(room?.usableArea) || Number(room?.totalArea) || 0;
  const requestedArea = preferences.studySpace * 10;
  const studyPoints = requestedArea && usableArea >= requestedArea ? 20 : 0;
  addResult("Study space", studyPoints, 20, studyPoints ? "Study space requirement matched" : "Study space is below your requested level");

  const storageValue = String(room?.storage || "").toLowerCase();
  const storageLevel = /large|ample|spacious|good/.test(storageValue)
    ? 10
    : /medium|moderate/.test(storageValue)
      ? 6
      : /small|limited/.test(storageValue)
        ? 3
        : 0;
  const storagePoints = preferences.storage && storageLevel >= preferences.storage ? 15 : 0;
  addResult("Storage", storagePoints, 15, storagePoints ? "Storage requirement matched" : "Storage availability is below your requested level");

  const bathroomType = String(room?.bathroomType || "").toLowerCase();
  const privacyLevel = bathroomType.includes("attached") ? 10 : bathroomType.includes("shared") ? 4 : 0;
  const privacyPoints = preferences.privacy && privacyLevel >= preferences.privacy ? 15 : 0;
  addResult("Privacy", privacyPoints, 15, privacyPoints ? "Privacy requirement matched" : "Privacy level is below your requested standard");

  const roomNoiseLevel = clamp(Number(room?.noiseLevel) || 3, 1, 5);
  const noisePoints = preferences.noiseTolerance && roomNoiseLevel <= preferences.noiseTolerance ? 10 : 0;
  addResult("Noise tolerance", noisePoints, 10, noisePoints ? "Room noise level suits your tolerance" : "Room may be noisier than you prefer");

  const rent = Number(room?.rent) || 0;
  const budgetPoints = preferences.budget && rent <= preferences.budget ? 20 : 0;
  addResult("Budget", budgetPoints, 20, budgetPoints ? "Rent is within your budget" : "Rent is above your budget target");

  const roomFloor = Number(room?.floor?.number);
  const floorDifference = Math.abs(roomFloor - preferences.preferredFloor);
  const floorPoints = preferences.preferredFloor && Number.isFinite(roomFloor)
    ? floorDifference === 0 ? 10 : floorDifference === 1 ? 5 : 0
    : 0;
  addResult("Preferred floor", floorPoints, 10, floorPoints === 10 ? "Preferred floor matched" : floorPoints ? "Floor is close to your preference" : "Floor does not match your preference");

  const activeBeds = Array.isArray(room?.beds) ? room.beds.filter((bed) => !bed.isArchived) : [];
  const capacity = activeBeds.length || 1;
  const roommatePoints = preferences.roommateCount && capacity <= preferences.roommateCount + 1 ? 10 : 0;
  addResult("Roommate count", roommatePoints, 10, roommatePoints ? "Room capacity suits your roommate preference" : "Room capacity is above your roommate preference");

  if (bathroomType.includes("attached")) reasons.push("Attached bathroom available");
  if (String(room?.naturalLightLevel || "").toLowerCase() === "high") reasons.push("Good natural lighting");
  if (String(room?.ventilationNotes || "").trim()) reasons.push("Good ventilation");
  if (activeBeds.some((bed) => !bed.occupied)) reasons.push("Available bed found");

  return {
    score: breakdown.reduce((total, item) => total + item.points, 0),
    reasons,
    breakdown,
  };
};

module.exports = calculateSpaceFitScore;
