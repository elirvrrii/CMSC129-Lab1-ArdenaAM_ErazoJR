const express = require("express");
const router = express.Router();

const { primaryConn, backupConn } = require("../db/connection");
const journalSchema = require("../models/journalEntry");

const JournalPrimary = primaryConn.model("JournalEntry", journalSchema);
const JournalBackup = backupConn.model("JournalEntry", journalSchema);

/* CREATE JOURNAL */

router.post("/", async (req, res) => {

try {

const journal = new JournalPrimary(req.body);
await journal.save();

const backupJournal = new JournalBackup(journal.toObject());
await backupJournal.save();

res.json({ message: "Journal saved successfully!" });

} catch (error) {

res.status(500).json({ message: "Error saving journal" });

}

});

/* READ NORMAL JOURNALS */

router.get("/", async (req, res) => {

try {

let journals = await JournalPrimary
.find({ isDeleted: false })
.sort({ createdAt: -1 });

if (!journals || journals.length === 0) {
journals = await JournalBackup
.find({ isDeleted: false })
.sort({ createdAt: -1 });
}

res.json(journals);

} catch (error) {

res.status(500).json({ message: "Error fetching journals" });

}

});

/* READ DELETED JOURNALS */

router.get("/deleted", async (req, res) => {

try {

let journals = await JournalPrimary
.find({ isDeleted: true })
.sort({ deletedAt: -1 });

if (!journals || journals.length === 0) {
journals = await JournalBackup
.find({ isDeleted: true })
.sort({ deletedAt: -1 });
}

res.json(journals);

} catch (error) {

res.status(500).json({ message: "Error fetching deleted journals" });

}

});

/* UPDATE JOURNAL */

router.put("/:id", async (req, res) => {

try {

const updatedPrimary = await JournalPrimary.findByIdAndUpdate(
req.params.id,
req.body,
{ new: true }
);

await JournalBackup.findByIdAndUpdate(req.params.id, req.body);

res.json(updatedPrimary);

} catch (error) {

res.status(500).json({ message: "Error updating journal" });

}

});

/* SOFT DELETE */

router.delete("/:id", async (req, res) => {

try {

await JournalPrimary.findByIdAndUpdate(req.params.id, {
isDeleted: true,
deletedAt: new Date()
});

await JournalBackup.findByIdAndUpdate(req.params.id, {
isDeleted: true,
deletedAt: new Date()
});

res.json({ message: "Journal soft deleted" });

} catch (error) {

res.status(500).json({ message: "Error deleting journal" });

}

});

/* RESTORE JOURNAL */

router.put("/restore/:id", async (req, res) => {

try {

await JournalPrimary.findByIdAndUpdate(req.params.id, {
isDeleted: false,
deletedAt: null
});

await JournalBackup.findByIdAndUpdate(req.params.id, {
isDeleted: false,
deletedAt: null
});

res.json({ message: "Journal restored" });

} catch (error) {

res.status(500).json({ message: "Error restoring journal" });

}

});

/* HARD DELETE */

router.delete("/hard/:id", async (req, res) => {

try {

await JournalPrimary.findByIdAndDelete(req.params.id);
await JournalBackup.findByIdAndDelete(req.params.id);

res.json({ message: "Journal permanently deleted" });

} catch (error) {

res.status(500).json({ message: "Error permanently deleting journal" });

}

});

module.exports = router;
