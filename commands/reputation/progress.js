const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Level = require('../../models/levelStructure');
const levelScaling = require('../../utils/levelScaling');
const timestamp = require('../../utils/timestamp');
const progressBar = require('../../utils/repProgress');

module.exports = {
	deleted: false,
	data: new SlashCommandBuilder()
	.setName('progress')
		.setDescription('Check on your own reputation stats.'),
	
	run: async ({ interaction }) => {

		const u = interaction.user;
		const uName = interaction.member.displayName;

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

				let unlockMsg;
				(unlocksRemain == 0) ? unlockMsg = '' : unlockMsg = `\nYou have ${unlocksRemain} channel${unlocksRemain == 1 ? '' : 's'} left to unlock.`;
				
				const embed = new EmbedBuilder()
				.setTitle('your reputation stats')
				.setDescription(`\`\`\` ${progressBar(stats.threshold, stats.rep)} \n ${Math.floor(stats.percent * 100)}% to level ${stats.lvl + 1}\`\`\`${unlockMsg}`)
					.setColor('Gold')
					.setThumbnail(u.displayAvatarURL());

				interaction.reply({
					embeds: [embed],
					ephemeral: true
				});

				console.log(`${timestamp()} REP CHECK ___ ${uName} requested a progression check on themselves.`);
			} else {
				console.log(`${timestamp()} DATABASE ___ creating new entry for ${uName}`);
				//create new level
				const newLevel = new Level({
					userId: u.id,
					guildId: interaction.guild.id,
				});

				await newLevel.save();
				
				interaction.reply({
					content: `You weren't in the system, but have now been initialized.`,
					ephemeral: true
				});
			}

		} catch (error) {
			console.log(`${timestamp()} ERROR ___ couldn't determine ${uName}'s progress: ${error}`);
		}
	},
}