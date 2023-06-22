const { SlashCommandBuilder } = require('discord.js');
const Level = require('../../models/levelStructure');
const levelScaling = require('../../utils/levelScaling');

module.exports = {
	deleted: false,
	data: new SlashCommandBuilder()
	.setName('progress')
		.setDescription('Check on your own reputation stats.'),
	
	run: async ({ interaction }) => {
		const u = interaction.user;

		const query = {
			userId: u.id,
			guildId: interaction.guild.id,
		};

		const channelUnlocks = [
			6,
			9,
			4,
			3,
			1
		];

		try {
			const level = await Level.findOne(query);
			const perc = Math.round((level.rep / levelScaling(level.level))*100)/100;
			const progressFill = '▨';
			const progressEmpty = '▢';
			const progressBar = `${progressFill.repeat(Math.round(perc * 20))}${progressEmpty.repeat(20 - Math.round(perc * 20))}`;
			let i = level.level;
			let unlocksRemain = 0;
			while (i++ < channelUnlocks.length - 1) {
				unlocksRemain += channelUnlocks[i];
			};

			let unlockMsg;
			(unlocksRemain == 0) ? unlockMsg = '' : unlockMsg = `\nYou have ${unlocksRemain} channel${unlocksRemain == 1 ? '' : 's'} left to unlock.`;
			
			if (level) {
				interaction.reply({
					content: `### your progression stats\nYou are ${Math.floor(perc*100)}% to level ${level.level+1}.\n${progressBar}${unlockMsg}`,
					ephemeral: true
				});

				console.log(`REPUTATION ___ ${interaction.member.displayName} requested a progression check on themselves.`);
			}
			else {
				interaction.reply({
					content: `You don't have any progression yet. Start chatting with folks, I believe in you!`,
					ephemeral: true
				});
			}

		} catch (error) {
			console.log(`Error determining user's progress: ${error}`);
		}
	},
}