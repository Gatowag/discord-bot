require('dotenv').config();
const timestamp = require('../../utils/timestamp');
const apodEmbed = require('../../utils/apodEmbed');
var cron = require('node-cron');

module.exports = async (client) => {
	try {
		let apodChannel = client.channels.cache.find(channel => channel.id === process.env.APOD_CHANNEL);

		cron.schedule('0 15 * * *', async () => {
			let embed = await apodEmbed();
			
			await apodChannel.send({ embeds: [embed] });
			console.log(`${timestamp()} APOD  ▨  successfully posted daily morning post`);
		});
		
		cron.schedule('0 3 * * *', async () => {
			let embed = await apodEmbed(null, true);
			
			await apodChannel.send({ embeds: [embed] });
			console.log(`${timestamp()} APOD  ▨  successfully posted nightly random post`);
		});

		console.log(`${timestamp()} BOOT  |  Scheduled APOD to post every day at 10:00 US Central.`);
		console.log(`${timestamp()} BOOT  |  Scheduled APOD to post every day at 22:00 US Central.`);

	} catch (error) {
		console.log(`${timestamp()} ERROR >!< cron failed unexpectedly: ${error}`);
	};
};