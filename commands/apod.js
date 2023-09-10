require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');
const timestamp = require('../utils/timestamp');
const apodEmbed = require('../utils/apodEmbed');
const diagnostics = false;

module.exports = {
	deleted: false,
	data: new SlashCommandBuilder()
		.setName('apod')
		.setDescription('Generate an embed from NASA\'s Astronomy Picture of the Day.')
		.addStringOption((option) =>
			option
				.setName('random')
				.setDescription('will choose an APOD at random')
				.addChoices(
					{ name: 'True', value: 'true' },
				))
		.addStringOption((option) =>
			option
				.setName('date')
				.setDescription('YYYY-MM-DD of the desired APOD (must be after 1995-06-16)')),
	
	run: async ({ interaction }) => {
		// declare user input, username, and reply
		const dateIn = interaction.options.get('date')?.value;
		const rand = interaction.options.get('random')?.value;
		const u = interaction.member.displayName;
		let quiet;

		diagnostics && console.log(`\nDIAG  ▢  attempting to start apod post`);

		try {
			diagnostics && console.log(`DIAG  |  creating deferred reply`);
			// notifies user "<application> is thinking..." and prevents error message that application did not respond
			quiet = await interaction.deferReply();

			let embed = await apodEmbed(dateIn, rand);
			
			await quiet.edit({ embeds: [embed] });
			console.log(`${timestamp()} APOD  ▨  ${u} successfully sent apod post`);

		} catch (error) {
			quiet.edit({ content: `An error occured and APOD could not post.\nThis message will self-delete in 5 seconds.` })
				.then(msg => {
					setTimeout(() => msg.delete(), 5000); });
			console.log(`${timestamp()} ERROR >!< ${u}'s APOD request failed: ${error}`);
		};
	}
};