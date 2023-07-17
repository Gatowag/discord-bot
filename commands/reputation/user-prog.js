const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Level = require('../../models/levelStructure');
const levelScaling = require('../../utils/levelScaling');
const timestamp = require('../../utils/timestamp');
const progressBar = require('../../utils/repProgress');

module.exports = {
	deleted: false,
	data: new SlashCommandBuilder()
	.setName('user-progress')
		.setDescription('Check another user\'s reputation stats.')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('the user whose stats you\'re checking')
				.setRequired(true)),
	
	run: async ({ interaction }) => {

		const userVal = interaction.options.get('user').value;
		const u = await interaction.guild.members.fetch(userVal);

		const query = {
			userId: u.id,
			guildId: interaction.guild.id,
		};

		const channelUnlocks = [ 6, 9, 4, 3, 1 ];

		try {
			const level = await Level.findOne(query);

			if (level) {
				const stats = {
					lvl: level.level,
					threshold: levelScaling(level.level),
					rep: level.rep,
					percent: Math.round((level.rep / levelScaling(level.level)) * 100) / 100 };
				let i = stats.lvl;
				let unlocksRemain = 0;
				while (i++ < channelUnlocks.length - 1) {
					unlocksRemain += channelUnlocks[i];
				};

				const embed = new EmbedBuilder()
					.setTitle(`${u.displayName}'s reputation stats`)
					.setDescription(`\`\`\` ${progressBar(stats.threshold, stats.rep)} \n ${Math.floor(stats.percent * 100)}% to level ${stats.lvl + 1} \n ${stats.rep} / ${stats.threshold} \`\`\``)
					.setColor('Gold')
					.setThumbnail(u.displayAvatarURL())
					.addFields({
						name: 'User Info',
						value: `${u}: ${u.id}`,
						inline: false,
					});
	
				interaction.reply({
					embeds: [embed],
					ephemeral: false
				});

				console.log(`${timestamp()} REP CHECK ___ ${interaction.member.displayName} requested a progression check on ${u.displayName} (${u}).`);

			} else {
				console.log(`${timestamp()} DATABASE ___ creating new entry for ${u.displayName}`);

				const newLevel = new Level({
					userId: u.id,
					guildId: interaction.guild.id,
				});

				await newLevel.save();
				
				interaction.reply({
					content: `${u.displayName} did not have progression established. They have now been initialized.`,
					ephemeral: false
				});
			};
			

		} catch (error) {
			console.log(`${timestamp()} ERROR ___ couldn't determine ${u.displayName}'s progress: ${error}`);
			return;
		}
	},
}