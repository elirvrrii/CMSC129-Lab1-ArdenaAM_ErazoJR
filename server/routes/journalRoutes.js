const express = require("express");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const { PrimaryEntry, BackupEntry } = require("../models/journalEntry");

const router = express.Router();

// Helper: sync a document to backup
async function syncToBackup(doc) {
  try {
    await BackupEntry.findByIdAndUpdate(doc._id, doc.toObject(), {
      upsert: true,
      new: true,
    });
  } catch (err) {
    // Backup failure should not break the main response
    console.error("⚠️  Backup sync failed:", err.message);
  }
}

// Helper: delete from backup
async function deleteFromBackup(id) {
  try {
    await BackupEntry.findByIdAndDelete(id);
  } catch (err) {
    console.error("⚠️  Backup delete failed:", err.message);
  }
}

// ─── CREATE ──────────────────────────────────────────────────────────────────
// POST /api/journal
router.post("/", async (req, res) => {
  const { title, content, mood, tags } = req.body;

  try {
    const entry = await PrimaryEntry.create({ title, content, mood, tags });
    await syncToBackup(entry);
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ─── READ ALL (excludes soft-deleted) ────────────────────────────────────────
// GET /api/journal
// GET /api/journal?includeDeleted=true  → shows soft-deleted too
router.get("/", async (req, res) => {
  const { includeDeleted } = req.query;

  try {
    const filter = includeDeleted === "true" ? {} : { isDeleted: false };
    const entries = await PrimaryEntry.find(filter).sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    // Fallback to backup if primary fails
    try {
      console.warn("⚠️  Primary read failed, falling back to backup...");
      const filter = includeDeleted === "true" ? {} : { isDeleted: false };
      const entries = await BackupEntry.find(filter).sort({ createdAt: -1 });
      res.status(200).json({ source: "backup", entries });
    } catch (backupError) {
      res.status(500).json({ error: "Both databases unavailable." });
    }
  }
});

// ─── READ ONE ─────────────────────────────────────────────────────────────────
// GET /api/journal/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  try {
    const entry = await PrimaryEntry.findById(id);
    if (!entry || entry.isDeleted) {
      return res.status(404).json({ error: "Entry not found" });
    }
    res.status(200).json(entry);
  } catch (error) {
    // Fallback to backup
    try {
      console.warn("⚠️  Primary read failed, falling back to backup...");
      const entry = await BackupEntry.findById(id);
      if (!entry || entry.isDeleted) {
        return res.status(404).json({ error: "Entry not found" });
      }
      res.status(200).json({ source: "backup", entry });
    } catch (backupError) {
      res.status(500).json({ error: "Both databases unavailable." });
    }
  }
});

// ─── UPDATE ───────────────────────────────────────────────────────────────────
// PATCH /api/journal/:id
router.patch("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  try {
    const entry = await PrimaryEntry.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    await syncToBackup(entry);
    res.status(200).json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ─── SOFT DELETE ──────────────────────────────────────────────────────────────
// DELETE /api/journal/:id          → soft delete (default)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  try {
    const entry = await PrimaryEntry.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ error: "Entry not found or already deleted" });
    }

    await syncToBackup(entry);
    res.status(200).json({ message: "Entry soft deleted", entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── RESTORE (undo soft delete) ───────────────────────────────────────────────
// PATCH /api/journal/:id/restore
router.patch("/:id/restore", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  try {
    const entry = await PrimaryEntry.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false, deletedAt: null },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ error: "Entry not found or not deleted" });
    }

    await syncToBackup(entry);
    res.status(200).json({ message: "Entry restored", entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── HARD DELETE ──────────────────────────────────────────────────────────────
// DELETE /api/journal/:id/permanent
router.delete("/:id/permanent", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  try {
    const entry = await PrimaryEntry.findByIdAndDelete(id);

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    await deleteFromBackup(id);
    res.status(200).json({ message: "Entry permanently deleted", entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;