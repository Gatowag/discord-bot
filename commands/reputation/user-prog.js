const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Level = require('../../models/levelStructure');
const levelScaling = require('../../utils/levelScaling');

module.exports = {
	deleted: true,
	data: new SlashCommandBuilder()
	.setName('user-progress')
		.setDescription('Check another user\'s reputation stats.')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('the user whose stats you\'re checking')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.MODERATE_MEMBERS),
	
	run: async ({ interaction }) => {
		const userVal = interaction.options.get('user').value;
		const u = await interaction.guild.members.fetch(userVal);

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

			if (level) {
				const perc = Math.round((level.rep / levelScaling(level.level))*100)/100;
				const progressFill = '▨';
				const progressEmpty = '▢';
				const progressBar = `${progressFill.repeat(Math.round(perc * 20))}${progressEmpty.repeat(20 - Math.round(perc * 20))}`;
				let i = level.level;
				let unlocksRemain = 0;
				while (i++ < channelUnlocks.length - 1) {
					unlocksRemain += channelUnlocks[i];
				};
	
				if (level) {
					interaction.reply({
						content: `### (${u}) ${u.displayName}'s progression stats\nThey are ${Math.floor(perc*100)}% (${level.rep}/${levelScaling(level.level)}) to level ${level.level+1}.\n${progressBar}`,
						ephemeral: false
					});
	
					console.log(`REPUTATION ___ ${interaction.member.displayName} requested a progression check on ${u.displayName} (${u}).`);
				}
				else {
					interaction.reply({
						content: `They don't have any progression yet.`,
						ephemeral: false
					});
				}
			} else {
				console.log(`DIAGNOSTIC ___ needs to create new level`);
				//create new level
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
			console.log(`Error determining user's progress: ${error}`);
		}
	},
}