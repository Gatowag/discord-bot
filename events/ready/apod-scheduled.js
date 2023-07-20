require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const timestamp = require('../../utils/timestamp');
var cron = require('node-cron');

module.exports = async (client) => {

	let testChannel = client.channels.cache.find(channel => channel.id === process.env.APOD_CHANNEL);
	
	console.log(`${timestamp()} BOOT  |  Scheduled APOD to post every day at 10:00 US Central.`);

	try {
		cron.schedule('0 15 * * *', async () => {
			let apodResponse = await request(`https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API}`);
			let data = await apodResponse.body.json();

			let permaLink = `https://apod.nasa.gov/apod/ap${data.date.slice(2, 4) + data.date.slice(5, 7) + data.date.slice(8)}.html`;

			// code adapted from Raxlitude's Discord Daily NASA APOD Posts on Autocode
			// checks if `copyright` field is present in the JSON data - if, then includes `footer` field of embed to display copyright holder(s)
			if ('copyright' in data) {
				// checks if the post type is image & copyrighted
				if (data.media_type === 'image') {
					let embed = new EmbedBuilder()
						.setTitle(data.title)
						.setURL(permaLink)
						.setDescription(data.explanation)
						.setImage(`${data.url}`)
						.setColor(0x0165b3)
						.setFooter({ text: `©️ ${data.copyright.trim().replaceAll(' ,',',')}\n${data.date}` }); // please keep this due to NASA's restrictions
					
					await testChannel.send({ embeds: [embed] });
					console.log(`${timestamp()} APOD ___ embed sent with image and copyright`);

				// sending a different message if the post is not an image & copyrighted
				} else {
					let embed = new EmbedBuilder()
						.setTitle(data.title)
						.setURL(permaLink)
						.setDescription(data.explanation)
						.setImage(`${data.thumbnail}`)
						.setColor(0x0165b3)
						.addFields({
							name: 'Discord doesn\'t allow videos in rich embeds, so click through to check it out.',
							value: data.url,
							inline: false,
						})
						.setFooter({ text: `©️ ${data.copyright.trim().replaceAll(' ,',',')}\n${data.date}` }); // please keep this due to NASA's restrictions
										
					await testChannel.send({ embeds: [embed] });
					console.log(`${timestamp()} APOD ___ embed sent w/o image but with copyright`);
				}

			// checks if the post type is a video and not copyrighted
			} else if (data.media_type === 'video') {
				let embed = new EmbedBuilder()
					.setTitle(data.title)
					.setURL(permaLink)
					.setDescription(data.explanation)
					.setImage(`${data.thumbnail}`)
					.setColor(0x0165b3)
					.addFields({
						name: 'Discord doesn\'t allow videos in rich embeds, so click through to check it out.',
						value: data.url,
						inline: false,
					})
					.setFooter({ text: `${data.date}` });
			
				await testChannel.send({ embeds: [embed] });
				console.log(`${timestamp()} APOD ___ embed sent with video placeholder but no copyright`);
				
			// checks if the post type is an image and not copyrighted
			} else if (data.media_type === 'image') {
				let embed = new EmbedBuilder()
					.setTitle(data.title)
					.setURL(permaLink)
					.setDescription(data.explanation)
					.setImage(`${data.url}`)
					.setColor(0x0165b3)
					.setFooter({ text: `${data.date}` });
			
				await testChannel.send({ embeds: [embed] });
				console.log(`${timestamp()} APOD ___ embed sent with image but no copyright`);
			}
		});
	} catch (error) {
		console.log(`${timestamp()} ERROR ___ Cron failed unexpectedly: ${error}`);
	};
};