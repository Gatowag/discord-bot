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
		
		const role1 = interaction.options.getRole('role');
		const label1 = interaction.options.get('label')?.value;
		const successOn = interaction.options.get('success-reply')?.value;
		const successOff = `You have removed the role ${role1.name}`;

		const button = new ButtonBuilder()
			.setCustomId('button1')
			.setLabel(`${role1.name}`)
			.setStyle(ButtonStyle.Success);
		
		if (label1 == null) {
			button.setLabel(`${role1.name}`);
		} else {
			button.setLabel(`${label1}`);
		};
		
		if (!successOn) {
			successOn = `You have added the role ${role1.name}`;
		};
		
		const buttonRow = new ActionRowBuilder()
			.addComponents(
				button,);
		
		await interaction.reply({ components: [buttonRow] });

		console.log(`${timestamp()} BUTTON ___ ${interaction.member.displayName} created a button to toggle the ${role1.name} role.`)

		const collector = await interaction.channel.createMessageComponentCollector();

		collector.on('collect', async (i) => {
			const member = i.member;

			if (i.customId === 'button1') {
				if (member.roles.cache.has(role1)) {
					member.roles.remove(role1);
					i.reply({ content: `${successOff}`, ephemeral: true });
				} else {
					member.roles.add(role1);
					i.reply({ content: `${successOn}`, ephemeral: true });
				}
				
				console.log(`${timestamp()} BUTTON ___ ${member.displayName} was successfully granted the ${role1.name} role.`);
			};
		})
	}
};