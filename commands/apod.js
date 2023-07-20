require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');
const timestamp = require('../utils/timestamp');
const apodEmbed = require('../utils/apodEmbed');

module.exports = {
	deleted: false,
	data: new SlashCommandBuilder()
		.setName('apod')
		.setDescription('Generate an embed from NASA\'s Astronomy Picture of the Day.')
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

			let embed = await apodEmbed(dateIn, rand);
			
			await quiet.edit({ embeds: [embed] });
			console.log(`${timestamp()} APOD  ▨  ${u} successfully sent apod post`);

		} catch (error) {
			console.log(`${timestamp()} ERROR ___ ${u}'s APOD request failed unexpectedly: ${error}`);
		};
	}
};