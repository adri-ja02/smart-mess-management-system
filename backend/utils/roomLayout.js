const activeBeds = (beds = []) => beds.filter((bed) => !bed.isArchived);

const fallbackBedPositions = (beds = []) =>
  activeBeds(beds).map((bed, index) => ({
    bedNumber: bed.bedNumber,
    x: 3 + (index % 2) * 9,
    y: 3 + Math.floor(index / 2) * 6,
  }));

const withFallbackLayout = (room) => {
  const layout = room?.layout || {};
  const hasBedPositions = Array.isArray(layout.bedPositions) && layout.bedPositions.length > 0;

  return {
    ...room,
    roomImages: room?.roomImages || room?.images || [],
    coordinates: {
      lat: Number(room?.coordinates?.lat) || 23.7815,
      lng: Number(room?.coordinates?.lng) || 90.4080,
    },
    campusCoordinates: {
      lat: Number(room?.campusCoordinates?.lat) || 23.7806,
      lng: Number(room?.campusCoordinates?.lng) || 90.4070,
    },
    layout: {
      ...layout,
      roomWidth: Number(layout.roomWidth) || 20,
      roomLength: Number(layout.roomLength) || 15,
      bedPositions: hasBedPositions ? layout.bedPositions : fallbackBedPositions(room?.beds),
    },
  };
};

module.exports = { fallbackBedPositions, withFallbackLayout };
