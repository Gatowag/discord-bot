require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const { CommandHandler } = require('djs-commander');
const mongoose = require('mongoose');
const path = require('path');

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildMessageReactions,
		IntentsBitField.Flags.MessageContent,
	],
});

(async () => {
	const timezoneOffset = -5;
	const dBase = new Date();
	dBase.setHours(dBase.getHours() + timezoneOffset);
	const d = dBase.toISOString();
	const timestamp = `${d.slice(0, 10)} | ${d.slice(11, 19)} |`;

	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log(`${timestamp} BOOT ___ Connected to DB.`);

		client.login(process.env.TOKEN);
		console.log(`${timestamp} BOOT ___ Logged in.`);

	} catch (error) {
		console.log(`${timestamp} ERROR ___ ${error}`);
	}
})();

new CommandHandler({
	client,
	commandsPath: path.join(__dirname, 'commands'),
	eventsPath: path.join(__dirname, 'events'),
	testServer: '722360419771220080',
});