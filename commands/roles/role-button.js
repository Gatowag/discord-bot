const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

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
				.setDescription('text that displays on the button'))
		.addStringOption((option) =>
			option
				.setName('success-reply')
				.setDescription('message sent when completed')),
	
	run: async ({ interaction, client }) => {
		const role1 = interaction.options.getRole('role');
		const label1 = interaction.options.get('label')?.value;
		const success1 = interaction.options.get('success-reply')?.value;

		const button = new ButtonBuilder()
			.setCustomId('button1')
			.setLabel(`${role1.name}`)
			.setStyle(ButtonStyle.Success);
		
		if (label1 == null) {
			button.setLabel(`${role1.name}`);
		} else {
			button.setLabel(`${label1}`);
		};
		
		if (success1 == null) {
			success1 = `You now have the role ${role1.name}`;
		};
		
		const buttonRow = new ActionRowBuilder()
			.addComponents(
				button,);
		
		await interaction.reply({ components: [buttonRow] });

		console.log(`BUTTON ___ ${interaction.member.displayName} created a button to grant the ${role1.name} role.`)

		const collector = await interaction.channel.createMessageComponentCollector();

		collector.on('collect', async (i) => {
			const member = i.member;

			if (i.customId === 'button1') {
				member.roles.add(role1);
				i.reply({ content: `${success1}`, ephemeral: true });
				
				console.log(`BUTTON ___ ${member.displayName} was successfully granted the ${role1.name} role.`);
			};
		})
	}
};