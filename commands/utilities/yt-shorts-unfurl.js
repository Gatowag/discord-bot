const { SlashCommandBuilder } = require('discord.js');
const timestamp = require('../../utils/timestamp');

module.exports = {
	deleted: false,
	data: new SlashCommandBuilder()
	.setName('yt-shorts-unfurl')
		.setDescription('Convert a youtube shorts link to a regular youtube link.')
		.addStringOption((option) =>
			option
				.setName('link')
				.setDescription('paste the link to the youtube short')
				.setRequired(true))
		.addBooleanOption((option) =>
			option
				.setName('lengthy')
				.setDescription('returns non-shortened link if set to true')
				.setRequired(false)),
	
	run: ({ interaction }) => {
		
		const u = interaction.member.displayName;
		const link = interaction.options.get('link').value;
		const long = interaction.options.get('lengthy')?.value;
		const IDstart = link.indexOf('shorts/');
		const ID = link.slice(IDstart + 7);

		try {
			if (long == true) {
				interaction.reply({
					content: `https://www.youtube.com/watch?v=${ID}`,
					ephemeral: true
				});
				console.log(`${timestamp()} UTIL ___ ${u} converted a YT short link (lengthened)`);
			} else {
				interaction.reply({
					content: `https://youtu.be/${ID}`,
					ephemeral: true
				});
				console.log(`${timestamp()} UTIL ___ ${u} converted a YT short link`);
			};

		} catch (error) {
			console.log(`${timestamp()} ERROR ___ couldn't convert to normal YT link: ${error}`);
		}
	},
}