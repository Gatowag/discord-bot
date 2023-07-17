const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const timestamp = require('../../utils/timestamp');

module.exports = {
	deleted: false,
	data: new SlashCommandBuilder()
		.setName('embed')
		.setDescription('Post a user-populated embed.')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('patreon')
				.setDescription('This embed will expect a Patreon post.')
				.addStringOption((option) =>
					option
						.setName('title')
						.setDescription('title of the post')
						.setRequired(true))
				.addStringOption((option) =>
					option
						.setName('url')
						.setDescription('link to the post')
						.setRequired(true))
				.addStringOption((option) =>
					option
						.setName('descript')
						.setDescription('the description of the post')
						.setRequired(true))
				.addStringOption((option) =>
					option
						.setName('duration')
						.setDescription('the length of the post')
						.setRequired(true))
				.addAttachmentOption((option) =>
					option
						.setName('image')
						.setDescription('upload an image attachment?')
						.setRequired(true))
				.addBooleanOption((option) =>
					option
						.setName('public')
						.setDescription('true = publicly availabile, false = exclusive')
						.setRequired(true))
				.addStringOption((option) =>
					option
						.setName('patron-level')
						.setDescription('minimum patron level to view post')
						.addChoices(
							{ name: '3', value: '$3 patrons' },
							{ name: '5', value: '$5 patrons' },
							{ name: '10', value: '$10 patrons' },
							{ name: '30', value: '$30 patrons' },
							{ name: '100', value: '$100 patrons' },
						)))
		.addSubcommand((subcommand) =>
			subcommand
				.setName('other')
				.setDescription('This embed will expect a general-purpose post.')
				.addStringOption((option) =>
					option
						.setName('title')
						.setDescription('title of the post')
						.setRequired(true))
				.addStringOption((option) =>
					option
						.setName('url')
						.setDescription('link to the post')
						.setRequired(true))
				.addStringOption((option) =>
					option
						.setName('descript')
						.setDescription('the description of the post')
						.setRequired(true))
				.addStringOption((option) =>
					option
						.setName('duration')
						.setDescription('the length of the post')
						.setRequired(true))
				.addAttachmentOption((option) =>
					option
						.setName('image')
						.setDescription('upload an image attachment?')
						.setRequired(true))
				.addBooleanOption((option) =>
					option
						.setName('public')
						.setDescription('true = publicly availabile, false = exclusive')
						.setRequired(true))
				.addStringOption((option) =>
					option
						.setName('author')
						.setDescription('the platform you\'re sending people to'))),
	
	run: async ({ interaction }) => {

		const u = interaction.member.displayName;

		try {
			// notifies user "<application> is thinking..." and prevents error message that application did not respond
			let quiet = await interaction.deferReply();

			//get inputs
			const eTitle = interaction.options.get('title').value;
			const eUrl = interaction.options.get('url').value;
			const eDescript = interaction.options.get('descript').value;
			const eDuration = interaction.options.get('duration').value;
			const file = await interaction.options.getAttachment('image');
			const eType = interaction.options.get('public').value;
			let eLevel = interaction.options.get('patron-level')?.value;
			let eAuthor = {
				name: interaction.options.get('author')?.value,
			};
				
			//changes based on type of post
			let typeColor;
			if (eType === false) {
				typeColor = 14606046;
			} else if (eType === true) {
				typeColor = 844945;
				eLevel = 'public';
			};

			//build embed
			const embed = new EmbedBuilder()
				.setTitle(eTitle)
				.setURL(eUrl)
				.setDescription(eDescript)
				.setImage(`attachment://${file.name}`)
				.setColor(typeColor)
				.addFields({
					name: 'Availability',
					value: eLevel,
					inline: true,
				}, {
					name: 'Duration',
					value: eDuration,
					inline: true,
				});
			
			if (eAuthor.name == 'youtube') {
				eAuthor.url = 'https://youtube.com/emergentbeacon';
				embed.setAuthor(eAuthor);
			} else if (eAuthor.name == 'bandcamp') {
				eAuthor.url = 'https://emergentbeacon.bandcamp.com';
				embed.setAuthor(eAuthor);
			} else if (eAuthor.name == 'patreon') {
				eAuthor.url = 'https://patreon.com/emergentbeacon';
				embed.setAuthor(eAuthor);
			} else if (eAuthor.name != null) {
				embed.setAuthor(eAuthor);
			};

			await interaction.channel.send({ embeds: [embed], files: [file] });

			// removes thinking message
			quiet.delete();

			console.log(`${timestamp()} EMBED ___ ${u} successfully created an embed.`);

		} catch (error) {
			console.log(`${timestamp()} ERROR ___ couldn't complete embed for ${u}: ${error}`);
		}
	},
};