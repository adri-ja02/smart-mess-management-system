import { useState } from "react";
import { uploadEvidence } from "../services/complaintService";

// Controlled component: parent owns the "uploaded" array and
// passes it back in onChange every time it changes, so parent
// forms can just read/send `evidence` at submit time.
function EvidenceUpload({ evidence, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setError("");
    setUploading(true);

    try {
      const data = await uploadEvidence(files);
      onChange([...(evidence || []), ...data.evidence]);
    } catch (err) {
      setError(
        err.response?.data?.message || "Evidence upload failed. Try again."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeItem = (index) => {
    const next = [...evidence];
    next.splice(index, 1);
    onChange(next);
  };

  return (
    <div className="mb-3">
      <label className="form-label">Upload Evidence (optional)</label>

      <input
        type="file"
        className="form-control"
        accept="image/*,video/*"
        multiple
        disabled={uploading}
        onChange={handleFiles}
      />

      {uploading && (
        <div className="form-text text-primary">Uploading...</div>
      )}

      {error && <div className="form-text text-danger">{error}</div>}

      {evidence?.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mt-2">
          {evidence.map((item, index) => (
            <div key={item.public_id || index} className="position-relative">
              {item.type === "video" ? (
                <video
                  src={item.url}
                  className="rounded border"
                  style={{ width: 90, height: 90, objectFit: "cover" }}
                  muted
                />
              ) : (
                <img
                  src={item.url}
                  alt="evidence"
                  className="rounded border"
                  style={{ width: 90, height: 90, objectFit: "cover" }}
                />
              )}

              <button
                type="button"
                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                style={{ padding: "0 6px" }}
                onClick={() => removeItem(index)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EvidenceUpload;