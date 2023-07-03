const { SlashCommandBuilder } = require('discord.js');
const Level = require('../../models/levelStructure');
const levelScaling = require('../../utils/levelScaling');

module.exports = {
	deleted: false,
	data: new SlashCommandBuilder()
	.setName('modify-rep')
	.setDescription('Change a user\'s reputation amount.')
	.addUserOption(option =>
		option
			.setName('user')
			.setDescription('the user whose level you\'re changing')
			.setRequired(true))
	.addNumberOption((option) =>
		option
			.setName('amount')
			.setDescription('how much reputation you want to grant or revoke')
			.setRequired(true)),
	
	run: async ({ interaction }) => {
		const userVal = interaction.options.get('user').value;
		const userName = await interaction.guild.members.fetch(userVal);
		const amount = interaction.options.get('amount').value;

		const u = interaction.member.displayName;
		const d = new Date().toISOString();
		const timestamp = `${d.slice(0, 10)} | ${d.slice(11, 19)} |`;

		const query = {
				userId: userVal,
				guildId: interaction.guild.id,
		};
				
		try {
			
			const level = await Level.findOne(query);
			const oldRep = level.rep;
			const newRep = oldRep + amount;
			let defLvlUp;
			(newRep) >= levelScaling(level.level) ? defLvlUp = ' They will level up upon next post.' : defLvlUp = '';

			if (level) {
				level.rep = newRep;
				interaction.reply({
					content: `You've modified ${userName}'s reputation amount from ${oldRep}/${levelScaling(level.level)} to ${level.rep}/${levelScaling(level.level)}.` + defLvlUp,
					ephemeral: false
				});
				console.log(`${timestamp} REP MOD ___ ${u} modified ${userName.displayName}'s rep amount from ${oldRep}/${levelScaling(level.level)} to ${level.rep}/${levelScaling(level.level)}. They are level ${level.level}.` + defLvlUp);

				await level.save().catch((e) => {
					console.log(`${timestamp} ERROR ___ couldn't adjust ${userName.displayName}'s reputation amount: ${e}`);
					return;
				})
			}

			// if (!level)
			else {
				console.log(`${timestamp} DATABASE ___ creating new entry for ${u}`);
				
				const newLevel = new Level({
					userId: userVal,
					guildId: interaction.guild.id,
					rep: 1,
					level: amount,
				});
	
				await newLevel.save();

				interaction.reply({
					content: `${userName} has been initialized in the database and you've modified their reputation amount from 1 to ${level.rep}/${levelScaling(level.level)}. They are level ${level.level}.` + defLvlUp,
					ephemeral: false
				});
				console.log(`${timestamp} REP MOD ___ ${u} modified ${userName.displayName}'s rep amount from ${oldRep}/${levelScaling(level.level)} to ${level.rep}/${levelScaling(level.level)}. They are level ${level.level}.` + defLvlUp);
			}
		} catch (error) {
			console.log(`${timestamp} ERROR ___ couldn't adjust ${userName.displayName}'s reputation amount: ${error}`);
		}


	},
};