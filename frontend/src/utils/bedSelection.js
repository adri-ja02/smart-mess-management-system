const STORAGE_KEY = "spaceFitSelectedBeds";

const readSelections = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

export const bedSelectionKey = (bed) => String(bed?._id || bed?.bedNumber || "");

export const getSelectedBedId = (roomId) => readSelections()[String(roomId)] || null;

export const saveSelectedBedId = (roomId, bedId) => {
  const selections = readSelections();
  selections[String(roomId)] = bedId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
};
