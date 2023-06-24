require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { request } = require('undici');

module.exports = {
	deleted: false,
	data: new SlashCommandBuilder()
		.setName('apod')
		.setDescription('Generate an embed from today\'s APOD.'),
	
	run: async (interaction) => {

		try {
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
						.setFooter({ text: `Copyright ${data.copyright}` }); // please keep this due to NASA's restrictions
					
					await interaction.channel.send({ embeds: [embed] });
					console.log('APOD ___ embed sent with image and copyright');

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
						.setFooter({ text: `Copyright ${data.copyright}` }); // please keep this due to NASA's restrictions
										
					await interaction.channel.send({ embeds: [embed] });
					console.log('APOD ___ embed sent w/o image but with copyright');
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
					});
			
				await interaction.channel.send({ embeds: [embed] });
				console.log('APOD ___ embed sent with video placeholder but no copyright');
				
				// checks if the post type is an image and not copyrighted
			} else if (data.media_type === 'image') {
				let embed = new EmbedBuilder()
					.setTitle(data.title)
					.setURL(permaLink)
					.setDescription(data.explanation)
					.setImage(`${data.url}`)
					.setColor(0x0165b3);
			
				await interaction.channel.send({ embeds: [embed] });
				console.log('APOD ___ embed sent with image but no copyright');
			}
		} catch (error) {
			console.log(`ERROR ___ APOD failed unexpectedly: ${error}`);
		};
	}
};