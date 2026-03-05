const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
{
title: {
type: String,
required: true
},

content: {
type: String,
required: true
},

date: {
type: String,
required: true
},

mood: {
type: String,
default: "neutral"
},

isDeleted: {
type: Boolean,
default: false
},

deletedAt: {
type: Date,
default: null
}

},
{ timestamps: true }
);

module.exports = journalSchema;
