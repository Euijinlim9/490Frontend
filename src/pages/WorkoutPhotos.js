import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "../styles/WorkoutPhotos.css";

const PHOTOS_PER_PAGE = 12;

function WorkoutPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({ from: "", to: "" });
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [comparePicks, setComparePicks] = useState([]); // [photo, photo]

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page,
        limit: PHOTOS_PER_PAGE,
      });
      if (filter.from) params.set("from_date", filter.from);
      if (filter.to) params.set("to_date", filter.to);

      const res = await fetch(`http://localhost:4000/api/photos?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load photos");
      const data = await res.json();
      setPhotos(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleDelete = async (photoId, e) => {
    e.stopPropagation(); // prevent lightbox/select trigger
    if (!window.confirm("Delete this photo?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/photos/${photoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setPhotos((prev) => prev.filter((p) => p.photo_id !== photoId));
      // Also remove from comparison if it was selected
      setComparePicks((prev) => prev.filter((p) => p.photo_id !== photoId));
    } catch (err) {
      alert(err.message || "Could not delete photo.");
    }
  };

  const applyDatePreset = (preset) => {
    const today = new Date();
    const fmt = (d) => d.toISOString().split("T")[0];

    if (preset === "all") {
      setFilter({ from: "", to: "" });
    } else if (preset === "7d") {
      const d = new Date();
      d.setDate(today.getDate() - 7);
      setFilter({ from: fmt(d), to: fmt(today) });
    } else if (preset === "30d") {
      const d = new Date();
      d.setDate(today.getDate() - 30);
      setFilter({ from: fmt(d), to: fmt(today) });
    } else if (preset === "90d") {
      const d = new Date();
      d.setDate(today.getDate() - 90);
      setFilter({ from: fmt(d), to: fmt(today) });
    }
    setPage(1);
  };

  const togglePhotoForCompare = (photo) => {
    setComparePicks((prev) => {
      const isSelected = prev.some((p) => p.photo_id === photo.photo_id);
      if (isSelected) {
        return prev.filter((p) => p.photo_id !== photo.photo_id);
      }
      // Max 2 picks — replace oldest if already 2
      if (prev.length >= 2) {
        return [prev[1], photo];
      }
      return [...prev, photo];
    });
  };

  const exitCompareMode = () => {
    setCompareMode(false);
    setComparePicks([]);
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  };

  const isPicked = (photoId) =>
    comparePicks.some((p) => p.photo_id === photoId);

  return (
    <div className="wp-page">
      <div className="wp-container">
        <div className="wp-header">
          <Link to="/logs" className="wp-back">
            ← Back to Logs
          </Link>
          <h1>Workout Photos</h1>
          <p>Track your progress over time.</p>
        </div>

        {/* Filter + Compare toolbar */}
        <div className="wp-toolbar">
          <div className="wp-filter-pills">
            <button
              className={`wp-filter-pill ${
                !filter.from && !filter.to ? "active" : ""
              }`}
              onClick={() => applyDatePreset("all")}
            >
              All
            </button>
            <button
              className="wp-filter-pill"
              onClick={() => applyDatePreset("7d")}
            >
              Last 7 days
            </button>
            <button
              className="wp-filter-pill"
              onClick={() => applyDatePreset("30d")}
            >
              Last 30 days
            </button>
            <button
              className="wp-filter-pill"
              onClick={() => applyDatePreset("90d")}
            >
              Last 90 days
            </button>
          </div>

          <button
            className={`wp-compare-btn ${compareMode ? "active" : ""}`}
            onClick={() => {
              if (compareMode) exitCompareMode();
              else setCompareMode(true);
            }}
          >
            {compareMode ? "Exit Compare" : "Compare Photos"}
          </button>
        </div>

        <div className="wp-date-range">
          <label>
            From
            <input
              type="date"
              value={filter.from}
              onChange={(e) => {
                setFilter((f) => ({ ...f, from: e.target.value }));
                setPage(1);
              }}
              className="wp-date-input"
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={filter.to}
              onChange={(e) => {
                setFilter((f) => ({ ...f, to: e.target.value }));
                setPage(1);
              }}
              className="wp-date-input"
            />
          </label>
        </div>

        {compareMode && (
          <div className="wp-compare-banner">
            <strong>Compare mode:</strong>{" "}
            {comparePicks.length === 0
              ? "Pick 2 photos to compare side by side."
              : comparePicks.length === 1
              ? "Pick 1 more photo to compare."
              : "Ready! Both photos selected."}
            {comparePicks.length === 2 && (
              <button
                className="wp-compare-show-btn"
                onClick={() => setLightboxPhoto({ __compare: true })}
              >
                View Comparison →
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="wp-empty">Loading photos…</div>
        ) : error ? (
          <div className="wp-empty wp-error">{error}</div>
        ) : photos.length === 0 ? (
          <div className="wp-empty">
            <p>
              {filter.from || filter.to
                ? "No photos in this date range."
                : "No photos yet."}
            </p>
            {!filter.from && !filter.to && (
              <p>Head back to Logs and click "Add a Photo" to get started.</p>
            )}
          </div>
        ) : (
          <>
            <div className="wp-grid">
              {photos.map((photo) => (
                <div
                  key={photo.photo_id}
                  className={`wp-card ${
                    compareMode && isPicked(photo.photo_id) ? "picked" : ""
                  }`}
                  onClick={() =>
                    compareMode
                      ? togglePhotoForCompare(photo)
                      : setLightboxPhoto(photo)
                  }
                >
                  <img
                    src={photo.image_data}
                    alt={photo.caption || "Progress"}
                    className="wp-image"
                    loading="lazy"
                  />
                  {compareMode && isPicked(photo.photo_id) && (
                    <div className="wp-pick-badge">
                      {comparePicks.findIndex(
                        (p) => p.photo_id === photo.photo_id
                      ) + 1}
                    </div>
                  )}
                  <div className="wp-meta">
                    <div className="wp-date">
                      {formatDate(photo.taken_date || photo.created_at)}
                    </div>
                    {photo.caption && (
                      <div className="wp-caption">{photo.caption}</div>
                    )}
                    {!compareMode && (
                      <button
                        className="wp-delete-btn"
                        onClick={(e) => handleDelete(photo.photo_id, e)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="wp-pagination">
                <button
                  className="wp-page-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Prev
                </button>
                <span className="wp-page-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="wp-page-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Single photo lightbox */}
      {lightboxPhoto && !lightboxPhoto.__compare && (
        <div
          className="wp-lightbox-overlay"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            className="wp-lightbox-close"
            onClick={() => setLightboxPhoto(null)}
            aria-label="Close"
          >
            ×
          </button>
          <img
            src={lightboxPhoto.image_data}
            alt={lightboxPhoto.caption || "Progress"}
            className="wp-lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
          <div
            className="wp-lightbox-meta"
            onClick={(e) => e.stopPropagation()}
          >
            {formatDate(lightboxPhoto.taken_date || lightboxPhoto.created_at)}
            {lightboxPhoto.caption && <span> · {lightboxPhoto.caption}</span>}
          </div>
        </div>
      )}

      {/* Comparison lightbox */}
      {lightboxPhoto?.__compare && comparePicks.length === 2 && (
        <ComparisonView
          photos={comparePicks}
          onClose={() => setLightboxPhoto(null)}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// Comparison view — side-by-side with synchronized zoom + draggable divider
// ----------------------------------------------------------------
function ComparisonView({ photos, onClose, formatDate }) {
  const [layout, setLayout] = useState("split"); // "split" | "side-by-side"
  const [splitPosition, setSplitPosition] = useState(50); // for split layout
  const [dragging, setDragging] = useState(false);

  // Sort by date so older is "before" (left)
  const sorted = [...photos].sort((a, b) => {
    const dateA = new Date(a.taken_date || a.created_at);
    const dateB = new Date(b.taken_date || b.created_at);
    return dateA - dateB;
  });
  const [before, after] = sorted;

  // Mouse + touch handlers for split divider
  const handleMouseMove = useCallback(
    (e) => {
      if (!dragging) return;
      const container = document.querySelector(".wp-compare-split");
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
      setSplitPosition(pct);
    },
    [dragging]
  );

  useEffect(() => {
    const handleMouseUp = () => setDragging(false);
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleMouseMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [dragging, handleMouseMove]);

  const daysBetween = Math.round(
    (new Date(after.taken_date || after.created_at) -
      new Date(before.taken_date || before.created_at)) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="wp-compare-overlay">
      <div className="wp-compare-header">
        <button
          className="wp-lightbox-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="wp-compare-layout-toggle">
          <button
            className={`wp-layout-btn ${layout === "split" ? "active" : ""}`}
            onClick={() => setLayout("split")}
          >
            Split View
          </button>
          <button
            className={`wp-layout-btn ${
              layout === "side-by-side" ? "active" : ""
            }`}
            onClick={() => setLayout("side-by-side")}
          >
            Side by Side
          </button>
        </div>
        <div className="wp-compare-info">
          {daysBetween > 0
            ? `${daysBetween} day${daysBetween === 1 ? "" : "s"} between photos`
            : "Same day"}
        </div>
      </div>

      {layout === "split" ? (
        <div className="wp-compare-split">
          <img
            src={before.image_data}
            alt="Before"
            className="wp-compare-img-base"
          />
          <div
            className="wp-compare-img-overlay"
            style={{ width: `${splitPosition}%` }}
          >
            <img
              src={after.image_data}
              alt="After"
              className="wp-compare-img-after"
              style={{
                width: `${100 / (splitPosition / 100)}%`,
                maxWidth: "none",
              }}
            />
          </div>
          <div
            className="wp-compare-divider"
            style={{ left: `${splitPosition}%` }}
            onMouseDown={() => setDragging(true)}
            onTouchStart={() => setDragging(true)}
          >
            <div className="wp-compare-divider-handle">⇔</div>
          </div>

          {/* Date labels at bottom corners */}
          <div className="wp-compare-label wp-compare-label-left">
            {formatDate(before.taken_date || before.created_at)}
          </div>
          <div className="wp-compare-label wp-compare-label-right">
            {formatDate(after.taken_date || after.created_at)}
          </div>
        </div>
      ) : (
        <div className="wp-compare-sbs">
          <div className="wp-compare-sbs-half">
            <img
              src={before.image_data}
              alt="Before"
              className="wp-compare-sbs-img"
            />
            <div className="wp-compare-sbs-label">
              <strong>Before</strong>
              <span>{formatDate(before.taken_date || before.created_at)}</span>
            </div>
          </div>
          <div className="wp-compare-sbs-half">
            <img
              src={after.image_data}
              alt="After"
              className="wp-compare-sbs-img"
            />
            <div className="wp-compare-sbs-label">
              <strong>After</strong>
              <span>{formatDate(after.taken_date || after.created_at)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutPhotos;
