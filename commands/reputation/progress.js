const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Level = require('../../models/levelStructure');
const levelScaling = require('../../utils/levelScaling');

module.exports = {
	deleted: false,
	data: new SlashCommandBuilder()
	.setName('progress')
		.setDescription('Check on your own reputation stats.'),
	
	run: async ({ interaction }) => {
		const u = interaction.user;
		const uName = interaction.member.displayName;
		const d = new Date().toISOString();
		const timestamp = `${d.slice(0, 10)} | ${d.slice(11, 19)} |`;

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
			
			const embed = new EmbedBuilder()
			.setTitle('your reputation stats')
			.setDescription(`You are ${Math.floor(perc * 100)}% to level ${level.level + 1}.\n${progressBar}${unlockMsg}`)
				.setColor('Gold')
				.setThumbnail(u.displayAvatarURL());


			if (level) {
				interaction.reply({
					embeds: [embed],
					//content: `### your progression stats\nYou are ${Math.floor(perc*100)}% to level ${level.level+1}.\n${progressBar}${unlockMsg}`,
					ephemeral: true
				});

				console.log(`${timestamp} REP CHECK ___ ${uName} requested a progression check on themselves.`);
			}
			else {
				console.log(`${timestamp} DATABASE ___ creating new entry for ${uName}`);
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
			console.log(`${timestamp} ERROR ___ couldn't determine ${uName}'s progress: ${error}`);
		}
	},
}