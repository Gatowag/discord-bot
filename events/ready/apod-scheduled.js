require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const timestamp = require('../../utils/timestamp');
const apodEmbed = require('../../utils/apodEmbed');
var cron = require('node-cron');

module.exports = async (client) => {

	let testChannel = client.channels.cache.find(channel => channel.id === process.env.APOD_CHANNEL);
	
	console.log(`${timestamp()} BOOT  |  Scheduled APOD to post every day at 10:00 US Central.`);

	try {
		cron.schedule('* 10 * * *', async () => {
			let embed = await apodEmbed();
			
			await apodChannel.send({ embeds: [embed] });
			console.log(`${timestamp()} APOD  ▨  successfully posted daily morning post`);
		});
			
		});
	} catch (error) {
		console.log(`${timestamp()} ERROR ___ Cron failed unexpectedly: ${error}`);
	};
};