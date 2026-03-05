const mongoose = require("mongoose");

const primaryConn = mongoose.createConnection(process.env.MONGO_URI);
const backupConn = mongoose.createConnection(process.env.MONGO_URI_BACKUP);

primaryConn.on("connected", () => console.log("Connected: Main DB"));
primaryConn.on("error", (err) => console.error("Main DB error:", err));

backupConn.on("connected", () => console.log("Connected: Backup Db"));
backupConn.on("error", (err) => console.error("Backup DB error:", err));

module.exports = { primaryConn, backupConn };