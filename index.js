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
	// timestamp logging variables
	const timezoneOffset = -5;
	let dBase = new Date();
	dBase.setHours(dBase.getHours() + timezoneOffset);
	let d = dBase.toISOString();
	let timestamp = `${d.slice(0, 10)} | ${d.slice(11, 19)} |`;

	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log(`\n${timestamp} BOOT  ▢  Successfully connected to database.`);

		client.login(process.env.TOKEN);
		console.log(`${timestamp} BOOT  |  Successfully logged in to Discord.`);

	} catch (error) {
		console.log(`${timestamp} ERROR !!! Couldn't log in properly: ${error}`);
	}
})();

new CommandHandler({
	client,
	commandsPath: path.join(__dirname, 'commands'),
	eventsPath: path.join(__dirname, 'events'),
	//testServer: '',
});