require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const { CommandHandler } = require('djs-commander');
const timestamp = require('utils/timestamp');
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
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log(`${timestamp()} BOOT ___ Successfully connected to database.`);

		client.login(process.env.TOKEN);
		console.log(`${timestamp()} BOOT ___ Successfully logged in to Discord.`);

	} catch (error) {
		console.log(`${timestamp()} ERROR ___ Couldn't log in properly: ${error}`);
	}
})();

new CommandHandler({
	client,
	commandsPath: path.join(__dirname, 'commands'),
	eventsPath: path.join(__dirname, 'events'),
	//testServer: '722360419771220080',
});