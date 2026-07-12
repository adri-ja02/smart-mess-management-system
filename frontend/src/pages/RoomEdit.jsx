import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import roomService from "../services/roomService";

const RoomEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [newBed, setNewBed] = useState({
    bedNumber: "",
    position: "",
    occupied: false,
  });

  // ===========================
  // LOAD ROOM
  // ===========================
  
  const loadRoom = async () => {
    try {
      const res = await roomService.getRoom(id);
      setRoom(res.data.room);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoom();
  }, [id]);

  // ===========================
  // BASIC INPUT
  // ===========================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoom((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ===========================
  // NESTED INPUT
  // ===========================
  const updateNested = (section, field, value) => {
    setRoom((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // ==========================
  // UPLOAD IMAGES
  // ==========================
  const uploadPhotos = async () => {
    try {
      if (images.length === 0) return [];

      const formData = new FormData();

      images.forEach((img) => {
        formData.append("images", img);
      });

      const res = await roomService.uploadImage(id, formData);

      return res.data.urls || [];
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  const handleUploadImages = async () => {
    if (images.length === 0) return;

    setUploadingImages(true);
    setErrorMessage("");

    try {
      const uploaded = await uploadPhotos();

      if (uploaded.length > 0) {
        setRoom((prev) => ({
          ...prev,
          images: [...(prev.images || []), ...uploaded],
        }));
      }

      setImages([]);
    } catch (err) {
      console.log(err);
      setErrorMessage("Image upload failed.");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = async (image) => {
    try {
      await roomService.deleteImage(id, image.public_id);

      setRoom((prev) => ({
        ...prev,
        images: prev.images.filter(
          (img) => img.public_id !== image.public_id
        ),
      }));
    } catch (err) {
      console.log(err);
    }
  };

  // ===========================
  // ADD BED
  // ===========================
  const addBed = async () => {
    if (!newBed.bedNumber.trim() || !newBed.position.trim()) {
      alert("Please fill in both Bed Number and Position before adding a bed.");
      return;
    }

    try {
      await roomService.addBed(id, newBed);
      setNewBed({
        bedNumber: "",
        position: "",
        occupied: false,
      });
      loadRoom();
    } catch (err) {
      console.log(err);
    }
  };

  // ===========================
  // UPDATE BED STATUS
  // ===========================
  const updateBedStatus = async (bed) => {
    try {
      await roomService.updateBed(id, bed._id, {
        occupied: !bed.occupied,
      });
      loadRoom();
    } catch (err) {
      console.log(err);
    }
  };

  // ===========================
  // DELETE BED (Archive)
  // ===========================
  const deleteBed = async (bedId) => {
    try {
      await roomService.deleteBed(id, bedId);

      // Remove from UI immediately
      setRoom((prev) => ({
        ...prev,
        beds: prev.beds.filter(
          (bed) => bed._id !== bedId
        ),
      }));

    } catch (err) {
      console.log(err);
      alert("Failed to delete bed");
    }
  };

  // ===========================
  // SAVE ROOM
  // ===========================
  const handleSave = async () => {
    try {
      setSaving(true);

      let uploaded = [];
      if (images.length > 0) {
        uploaded = await uploadPhotos();
      }

      const updatedRoom = {
        ...room,
        images: [...(room.images || []), ...uploaded],
      };

      await roomService.updateRoom(id, updatedRoom);
      alert("Room updated successfully");
      navigate(`/rooms/${id}`);
    } catch (err) {
      console.log(err);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <h3>Loading...</h3>;
  if (!room) return <h3>Room not found</h3>;

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-body">
          <div className="d-flex justify-content-between mb-4">
            <h3>Edit Room Space Passport</h3>

            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>

          <div className="row">
            {/* BUILDING */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Building Name</label>
              <input
                className="form-control"
                value={room.building?.name || ""}
                onChange={(e) => updateNested("building", "name", e.target.value)}
              />
            </div>

            {/* FLOOR */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Floor Number</label>
              <input
                type="number"
                className="form-control"
                value={room.floor?.number || ""}
                onChange={(e) => updateNested("floor", "number", Number(e.target.value))}
              />
            </div>

            {/* ROOM NUMBER */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Room Number</label>
              <input
                className="form-control"
                name="roomNumber"
                value={room.roomNumber || ""}
                onChange={handleChange}
              />
            </div>

            {/* LOCATION */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Mess Location</label>
              <input
                className="form-control"
                name="messLocation"
                value={room.messLocation || ""}
                onChange={handleChange}
              />
            </div>

            {/* TOTAL AREA */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Total Area (sq ft)</label>
              <input
                type="number"
                className="form-control"
                name="totalArea"
                value={room.totalArea || ""}
                onChange={handleChange}
              />
            </div>

            {/* USABLE AREA */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Usable Area (sq ft)</label>
              <input
                type="number"
                className="form-control"
                name="usableArea"
                value={room.usableArea || ""}
                onChange={handleChange}
              />
            </div>

            {/* ROOM WIDTH */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Room Width (ft)</label>
              <input
                type="number"
                className="form-control"
                value={room.layout?.roomWidth || ""}
                onChange={(e) =>
                  updateNested("layout", "roomWidth", Number(e.target.value))
                }
              />
            </div>

            {/* ROOM LENGTH */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Room Length (ft)</label>
              <input
                type="number"
                className="form-control"
                value={room.layout?.roomLength || ""}
                onChange={(e) =>
                  updateNested("layout", "roomLength", Number(e.target.value))
                }
              />
            </div>

            {/* RENT */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Rent (Tk)</label>
              <input
                type="number"
                className="form-control"
                name="rent"
                value={room.rent || ""}
                onChange={handleChange}
              />
            </div>

            {/* STORAGE */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Storage</label>
              <input
                className="form-control"
                name="storage"
                value={room.storage || ""}
                onChange={handleChange}
              />
            </div>

            {/* BATHROOM */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Bathroom Type</label>
              <select
                className="form-select"
                name="bathroomType"
                value={room.bathroomType || "Shared"}
                onChange={handleChange}
              >
                <option value="Shared">Shared</option>
                <option value="Attached">Attached</option>
              </select>
            </div>

            {/* NATURAL LIGHT */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Natural Light</label>
              <select
                className="form-select"
                name="naturalLightLevel"
                value={room.naturalLightLevel || "Medium"}
                onChange={handleChange}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            {/* UTILITY POLICY */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Utility Policy</label>
              <input
                className="form-control"
                name="utilityPolicy"
                value={room.utilityPolicy || ""}
                onChange={handleChange}
              />
            </div>

            {/* VENTILATION */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Ventilation Notes</label>
              <input
                className="form-control"
                name="ventilationNotes"
                value={room.ventilationNotes || ""}
                onChange={handleChange}
              />
            </div>

            {/* AMENITIES */}
            <div className="col-12 mb-4">
              <label className="form-label fw-bold">Amenities</label>
              <input
                className="form-control"
                value={(room.amenities || []).join(", ")}
                onChange={(e) =>
                  setRoom({
                    ...room,
                    amenities: e.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter((item) => item !== ""),
                  })
                }
                placeholder="Wifi, Fan, AC, Balcony ..."
              />
            </div>
          </div>

          <hr />

          {/* =========================
              ROOM IMAGES
          ========================= */}
          <h4 className="mb-3">Room Images (Max 10 Files)</h4>

          <input
            type="file"
            multiple
            className="form-control mb-2"
            onChange={(e) => {
              const files = [...e.target.files];

              if (files.length > 10) {
                setErrorMessage("Maximum 10 images allowed.");
                return;
              }

              setErrorMessage("");
              setImages(files);
            }}
          />

          {errorMessage && (
            <div className="text-danger mb-3">{errorMessage}</div>
          )}

          <button
            className="btn btn-outline-primary btn-sm mb-3"
            onClick={handleUploadImages}
            disabled={images.length === 0 || uploadingImages}
          >
            {uploadingImages ? "Uploading..." : "Upload Selected Images"}
          </button>

          {/* PREVIEW OF NEWLY SELECTED IMAGES */}
          {images.length > 0 && (
            <div className="row mb-4">
              {images.map((img, index) => (
                <div className="col-md-3 col-sm-4 mb-3" key={index}>
                  <img
                    src={URL.createObjectURL(img)}
                    alt=""
                    className="img-fluid rounded border"
                    style={{
                      height: "160px",
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="row">
            {(room.images || []).map((img, index) => (
              <div className="col-md-3 mb-3" key={index}>
                <div className="card">
                  <img
                    src={img.url}
                    alt=""
                    className="card-img-top"
                    style={{
                      height: "180px",
                      objectFit: "cover",
                    }}
                  />

                  <div className="card-body p-2">
                    <button
                      className="btn btn-danger btn-sm w-100"
                      onClick={() => removeImage(img)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <hr />

          <h4 className="mb-3">Bed Inventory</h4>

          {/* ADD NEW BED */}
          <div className="row mb-4">
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Bed Number"
                value={newBed.bedNumber}
                onChange={(e) =>
                  setNewBed({
                    ...newBed,
                    bedNumber: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Position"
                value={newBed.position}
                onChange={(e) =>
                  setNewBed({
                    ...newBed,
                    position: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-4">
              <button className="btn btn-primary w-100" onClick={addBed}>
                Add Bed
              </button>
            </div>
          </div>

          {/* BED TABLE */}
          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>Bed No</th>
                <th>Position</th>
                <th>Status</th>
                <th width="120">Action</th>
              </tr>
            </thead>

            <tbody>
              {(room.beds || [])
                .filter((bed) => !bed.isArchived)
                .map((bed) => (
                  <tr key={bed._id}>
                    <td>{bed.bedNumber}</td>

                    <td>{bed.position}</td>

                    <td>
                      {bed.occupied ? (
                        <span
                          className="badge bg-danger"
                          style={{ cursor: "pointer" }}
                          onClick={() => updateBedStatus(bed)}
                        >
                          Occupied
                        </span>
                      ) : (
                        <span
                          className="badge bg-success"
                          style={{ cursor: "pointer" }}
                          onClick={() => updateBedStatus(bed)}
                        >
                          Available
                        </span>
                      )}
                    </td>

                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteBed(bed._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <hr />

          {/* SAVE BUTTONS */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button className="btn btn-secondary" onClick={() => navigate(`/rooms/${id}`)}>
              Cancel
            </button>

            <button className="btn btn-success" disabled={saving} onClick={handleSave}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomEdit;
