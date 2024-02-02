const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const timestamp = require('../../utils/timestamp');
require('dotenv').config();
const diagLocal = false;
const diag = diagLocal || process.env.DIAGNOSTICS;

module.exports = {
	deleted: false,
	data: new SlashCommandBuilder()
		.setName('role-button')
		.setDescription('This creates a button that grants roles.')
		.addRoleOption(option =>
			option
				.setName('role')
				.setDescription('the role granted by the button')
				.setRequired(true))
		.addStringOption((option) =>
			option
				.setName('label')
				.setDescription('text that displays on the button')
				.setRequired(false)),
	
	run: async ({ interaction }) => {
		try {
			// declares user input
			const role = interaction.options.getRole('role');
			let label = interaction.options.get('label')?.value;

			diag && console.log(`${timestamp()} DIAG  ▢  creating role button`);
			diag && console.log(`${timestamp()} DIAG  |  label1 input: ${label}`);
			diag && console.log(`${timestamp()} DIAG  |  successOn input: ${successOn}`);

			// create button
			const button = new ButtonBuilder()
				.setCustomId(`role.${role.id}`)
				.setLabel(`${label}`)
				.setStyle(ButtonStyle.Success);
		
			// if not provided, updates text on the button to this
			if (!label) {
				diag && console.log(`${timestamp()} DIAG  |  no label entered`);
				button.setLabel(`${role.name}`);
				diag && console.log(`${timestamp()} DIAG  |  set default label`);
			};
				
			// create button row in post
			const buttonRow = new ActionRowBuilder()
				.addComponents(
					button,);

			await interaction.reply({ components: [buttonRow] });

			console.log(`${timestamp()} BUTTON  ▨  ${interaction.member.displayName} created a button to toggle the ${role.name} role.`);

		} catch (error) {
			console.log(`${timestamp()} ERROR >!< role button failed: ${error}`);
		}
	}
};