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
				.setRequired(false))
		.addStringOption((option) =>
			option
				.setName('success-reply')
				.setDescription('message sent when completed')
				.setRequired(false)),
	
	run: async ({ interaction }) => {
		try {
			// declares user input
			const role = interaction.options.getRole('role');
			let label = interaction.options.get('label')?.value;
			let successOn = interaction.options.get('success-reply')?.value;
			const successOff = `You have removed the role ${role.name}`;

			diag && console.log(`${timestamp()} DIAG  ▢  creating role button`);
			diag && console.log(`${timestamp()} DIAG  |  label1 input: ${label}`);
			diag && console.log(`${timestamp()} DIAG  |  successOn input: ${successOn}`);

			// create button
			const button = new ButtonBuilder()
				.setCustomId(`button${role}`)
				.setLabel(`${label}`)
				.setStyle(ButtonStyle.Success);
		
			// if not provided, updates text on the button to this
			if (!label) {
				diag && console.log(`${timestamp()} DIAG  |  no label entered`);
				button.setLabel(`${role.name}`);
				diag && console.log(`${timestamp()} DIAG  |  set default label`);
			};
		
			// if not provided, default success text to this
			if (!successOn) {
				diag && console.log(`${timestamp()} DIAG  |  no reply text entered`);
				successOn = `You have added the role ${role.name}`;
				diag && console.log(`${timestamp()} DIAG  |  set default reply`);
			};
		
			// create button row in post
			const buttonRow = new ActionRowBuilder()
				.addComponents(
					button,);

			await interaction.reply({ components: [buttonRow] });

			console.log(`${timestamp()} BUTTON ___ ${interaction.member.displayName} created a button to toggle the ${role.name} role.`)

			const collector = await interaction.channel.createMessageComponentCollector();

			collector.on('collect', async (i) => {
				// person who clicked on button
				const member = i.member;
				let hasRole = interaction.member.roles.cache.has(role.id);
				diag && console.log(`${timestamp()} DIAG  |  ${member}, ${member.displayName} interacted. Do they have the role? ${hasRole}`);

				// if the interaction is clicking on the button
				if (i.customId === `button${role}`) {
					diag && console.log(`${timestamp()} DIAG  |  i.customId is ${i.customId}`);

					// if the person already has the role
					if (hasRole) {
						// then remove that role, toggle off
						member.roles.remove(role);
						diag && console.log(`${timestamp()} DIAG  |  ${role.name} removed`);
						// update the reply to quietly notify the person that they have removed the role
						i.reply({ content: `${successOff}`, ephemeral: true });
						diag && console.log(`${timestamp()} DIAG  ▨  reply sent`);
						console.log(`${timestamp()} BUTTON ___ ${member.displayName} successfully removed the ${role.name} role.`);
						// if the person doesn't have the role yet
					} else {
						// then add that role, toggle on
						member.roles.add(role);
						diag && console.log(`${timestamp()} DIAG  |  ${role.name} added`);
						// update the reply to quietly notify the person that they have added the role
						i.reply({ content: `${successOn}`, ephemeral: true });
						diag && console.log(`${timestamp()} DIAG  ▨  reply sent`);
						console.log(`${timestamp()} BUTTON ___ ${member.displayName} successfully added the ${role.name} role.`);
					}
				
				
				};
			})
		} catch (error) {
			console.log(`${timestamp()} ERROR >!< role button failed: ${error}`);
		}
	}
};