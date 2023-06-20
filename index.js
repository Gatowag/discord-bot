require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const mongoose = require('mongoose');
const { CommandHandler } = require('djs-commander');
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
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to DB.");

		client.login(process.env.TOKEN);
	} catch (error) {
		console.log(`Error: ${error}`);
	}
})();

new CommandHandler({
	client,
	commandsPath: path.join(__dirname, 'commands'),
	eventsPath: path.join(__dirname, 'events'),
	testServer: '509705230418706462',
});