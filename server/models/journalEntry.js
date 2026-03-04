const mongoose = require("mongoose");
const { primaryConn, backupConn } = require("../db/connection");

const journalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    mood: {
      type: String,
      enum: ["happy", "sad", "neutral", "anxious", "excited", "angry"],
      default: "neutral",
    },
    // for soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const PrimaryEntry = primaryConn.model("JournalEntry", journalSchema);
const BackupEntry = backupConn.model("JournalEntry", journalSchema);

module.exports = { PrimaryEntry, BackupEntry };