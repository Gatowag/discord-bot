const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const timestamp = require('../../utils/timestamp');

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
		
		// retrieve user input
		const role1 = interaction.options.getRole('role');
		const label1 = interaction.options.get('label')?.value;
		const successOn = interaction.options.get('success-reply')?.value;
		const successOff = `You have removed the role ${role1.name}`;

		// create button
		const button = new ButtonBuilder()
			.setCustomId('button1')
			.setLabel(`${label1}`)
			.setStyle(ButtonStyle.Success);
		
		// if not provided, updates text on the button to this
		if (!label1) {
			button.setLabel(`${role1.name}`);
		};
		
		// if not provided, default success text to this
		if (!successOn) {
			successOn = `You have added the role ${role1.name}`;
		};
		
		// create button row in post
		const buttonRow = new ActionRowBuilder()
			.addComponents(
				button,);

		await interaction.reply({ components: [buttonRow] });

		console.log(`${timestamp()} BUTTON ___ ${interaction.member.displayName} created a button to toggle the ${role1.name} role.`)

		const collector = await interaction.channel.createMessageComponentCollector();

		collector.on('collect', async (i) => {
			// person who clicked on button
			const member = i.member;

			// if the interaction is clicking on the button
			if (i.customId === 'button1') {

				// if the person already has the role
				if (member.roles.cache.has(role1)) {
					// then remove that role, toggle off
					member.roles.remove(role1);
					// update the reply to quietly notify the person that they have removed the role
					i.reply({ content: `${successOff}`, ephemeral: true });
				// if the person doesn't have the role yet
				} else {
					// then add that role, toggle on
					member.roles.add(role1);
					// update the reply to quietly notify the person that they have added the role
					i.reply({ content: `${successOn}`, ephemeral: true });
				}
				
				console.log(`${timestamp()} BUTTON ___ ${member.displayName} was successfully granted the ${role1.name} role.`);
			};
		})
	}
};