const { Schema, model } = require('mongoose');
const { randomUUID } = require('crypto');

const pollSchema = new Schema({
	guildID: {
		type: String,
		required: true,
	},
	authorID: {
		type: String,
		required: true,
	},
	pollID: {
		type: String,
		default: randomUUID,
	},
	messageID: {
		type: String,
		required: true,
		unique: true,
	},
	content: {
		type: String,
		required: true,
	},
	vote1: {
		type: [String],
		default: [],
	},
	vote2: {
		type: [String],
		default: [],
	},
	vote3: {
		type: [String],
		default: [],
	},
	vote4: {
		type: [String],
		default: [],
	},
	vote5: {
		type: [String],
		default: [],
	}
}, { timestamps: true });

module.exports = model('polls', pollSchema);