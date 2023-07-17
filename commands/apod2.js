const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const timestamp = require('../utils/timestamp');
const ms = require('ms');
require('dotenv').config();

module.exports = {
	deleted: false,
	data: new SlashCommandBuilder()
		.setName('apod')
		.setDescription('Generate an embed from today\'s Astronomy Picture of the Day.')
		.addStringOption((option) =>
			option
				.setName('date')
				.setDescription('YYYY-MM-DD of the desired APOD (must be after 1995-06-16)'))
		.addBooleanOption((option) =>
			option
				.setName('random')
				.setDescription('will choose an APOD at random')),
	
	run: async ({ interaction }) => {

		const dateIn = interaction.options.get('date')?.value;
		const rand = interaction.options.get('random')?.value;
		
		const u = interaction.member.displayName;

		try {
			// notifies user "<application> is thinking..." and prevents error message that application did not respond
			let quiet = await interaction.deferReply();

			(!dateIn) ? (dateOut = "") : (dateOut = `&date=${dateIn}`);

			let msDiff;
			if (rand) {
				const dEnd = new Date();
				const dStart = new Date("1995-06-16");
				let dRand = new Date(+dStart + Math.random() * (dEnd - dStart));
				let dISO = dRand.toISOString();
				msDiff = Math.abs(dEnd - dRand) * -1;
				console.log(`dISO: ${dISO}`);
				dateOut = `&date=${dISO.slice(0, 10)}`;
			};

			console.log(`msDiff: ${msDiff}`);
			
			let apodResponse = await request(`https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API}${dateOut}`);
			let data = await apodResponse.body.json();

			let permaLink = `https://apod.nasa.gov/apod/ap${data.date.slice(2, 4) + data.date.slice(5, 7) + data.date.slice(8)}.html`;

			console.log(data.date);

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
						.setTimestamp(Date.now() + msDiff)
						.setFooter({ text: `©️ ${data.copyright.trim().replaceAll(' ,',',')}` }); // please keep this due to NASA's restrictions
					
					await quiet.edit({ embeds: [embed] });
					console.log(`${timestamp()} APOD ___ ${u} sent embed with image and copyright`);

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
						.setTimestamp(Date.now() + msDiff)
						.setFooter({ text: `©️ ${data.copyright.trim().replaceAll(' ,',',')}` }); // please keep this due to NASA's restrictions
										
					await quiet.edit({ embeds: [embed] });
					console.log(`${timestamp()} APOD ___ ${u} sent embed w/o image but with copyright`);
				}

			// checks if the post type is a video and not copyrighted
			} else if (data.media_type === 'video') {
				let embed = new EmbedBuilder()
					.setTitle(data.title)
					.setURL(permaLink)
					.setDescription(data.explanation)
					.setImage(`${data.thumbnail}`)
					.setColor(0x0165b3)
					.setTimestamp(Date.now() + msDiff)
					.addFields({
						name: 'Discord doesn\'t allow videos in rich embeds, so click through to check it out.',
						value: data.url,
						inline: false,
					});
			
				await quiet.edit({ embeds: [embed] });
				console.log(`${timestamp()} APOD ___ ${u} sent embed with video placeholder but no copyright`);
				
			// checks if the post type is an image and not copyrighted
			} else if (data.media_type === 'image') {
				let embed = new EmbedBuilder()
					.setTitle(data.title)
					.setURL(permaLink)
					.setDescription(data.explanation)
					.setImage(`${data.url}`)
					.setColor(0x0165b3)
					.setTimestamp(Date.now() + msDiff);
			
				await quiet.edit({ embeds: [embed] });
				console.log(`${timestamp()} APOD ___ ${u} sent embed with image but no copyright`);
			}

		} catch (error) {
			console.log(`${timestamp()} ERROR ___ ${u}'s APOD request failed unexpectedly: ${error}`);
		};
	}
};