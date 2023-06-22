const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Level = require('../../models/levelStructure');
const levelScaling = require('../../utils/levelScaling');

module.exports = {
	deleted: false,
	data: new SlashCommandBuilder()
	.setName('modify-level')
	.setDescription('Change a user\'s reputation level.')
	.addUserOption(option =>
		option
			.setName('user')
			.setDescription('the user whose level you\'re changing')
			.setRequired(true))
	.addNumberOption((option) =>
		option
			.setName('amount')
			.setDescription('how many levels you want to grant or revoke')
			.setRequired(true)),
	
	run: async ({ interaction }) => {

		const userVal = interaction.options.get('user').value;
		const userName = await interaction.guild.members.fetch(userVal);
		const amount = interaction.options.get('amount').value;

		const roleIDs = [
			'747990765409402960',	//0: sentient being
			'747991758453080185',	//1: local dignitary
			'777788958251155497',	//2: planetary diplomat
			'777789109191835678',	//3: galactic ambassador
			'777790027525652480'	//4: interdimensional explorer
		];

		const query = {
				userId: userVal,
				guildId: interaction.guild.id,
		};
		
		try {
			
			const level = await Level.findOne(query);
			const oldLvl = level.level;

			if (level) {
				level.rep = 1;
				level.level += amount;

				const newLvl = level.level;

				if (oldLvl < 5 && newLvl < 5) {
					let oldRole = interaction.guild.roles.cache.get(roleIDs[oldLvl]);
					let newRole = interaction.guild.roles.cache.get(roleIDs[level.level]);

					userName.roles.add(newRole);
					userName.roles.remove(oldRole);
				};

				interaction.reply({
					content: `You've modified ${userName}'s reputation level from ${oldLvl} to ${oldLvl + amount}.`,
					ephemeral: false
				});
				console.log(`REPUTATION ___ ${interaction.member.displayName} modified ${userName.displayName}'s rep level from ${oldLvl} to ${level.level}. Their reputation is reset to: ${level.rep}/${levelScaling(level.level)}`);

				await level.save().catch((e) => {
					console.log(`Error saving updated level ${e}`);
					return;
				})
			}

			// if (!level)
			else {
				//create new level
				const newLevel = new Level({
					userId: userVal,
					guildId: interaction.guild.id,
					rep: 1,
					level: amount,
				});
	
				await newLevel.save();

				interaction.reply({
					content: `You've modified ${userName}'s reputation level from 1 to ${amount}.`,
					ephemeral: false
				});
				console.log(`REPUTATION ___ ${interaction.member.displayName} modified ${userName.displayName}'s rep level from ${oldLvl} to ${level.level}. Their reputation is reset to: ${level.rep}/${levelScaling(level.level)}`);
			}
		} catch (error) {
			console.log(`Error adjusting reputation level: ${error}`);
		}


	},
};