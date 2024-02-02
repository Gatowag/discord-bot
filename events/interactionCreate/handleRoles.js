const { Interaction } = require('discord.js');
const timestamp = require('../../utils/timestamp');
require('dotenv').config();
const diagLocal = true;
const diag = diagLocal || process.env.DIAGNOSTICS;

/**
 * 
 * @param {Interaction} interaction
 */

module.exports = async (interaction) => {
	// discontinue if not relevant
	if (!interaction.isButton() || !interaction.customId) return;

	try {
		// seperate info from the button press that will be useful to work with
		const [type, roleID] = interaction.customId.split('.');

		// discontinue if the button press isn't poll-related or doesn't have all the needed info
		if (!type || !roleID) return;
		if (type !== 'role') return;

		diag && console.log(`\n${timestamp()} DIAG  ▢  role toggle detected`);

		let role = interaction.guild.roles.cache.find(r => r.id === roleID);

		// check if user has role before toggling
		let hasRole = interaction.member.roles.cache.has(roleID);
		diag && console.log(`${timestamp()} DIAG  |  ${interaction.member.displayName} interacted. Do they have the role? ${hasRole}`);

		diag && console.log(`${timestamp()} DIAG  |  interaction.customId is ${interaction.customId}`);

		let successOn = `You have added the role: **${role.name}**`;
		let successOff = `You have removed the role: **${role.name}**`;

		if (roleID == 747990765409402960) {
			successOn = `Thanks for joining!\n\nWe would love to hear a little bit about you in ${interaction.guild.channels.cache.find(channel => channel.id === '805890818136211487').toString()} or feel free to join in the conversation at ${interaction.guild.channels.cache.find(channel => channel.id === '722360420320411661').toString()}. Alternatively, you can just lurk and get notified when new videos get published. That's cool, too!`
		};

		// if the person already has the role
		if (hasRole) {
			// then remove that role, toggle off
			interaction.member.roles.remove(role);
			diag && console.log(`${timestamp()} DIAG  |  removed role "${role.name}"`);
			
			// update the reply to quietly notify the person that they have removed the role
			interaction.reply({ content: `${successOff}`, ephemeral: true });
			diag && console.log(`${timestamp()} DIAG  ▨  reply sent`);
			console.log(`${timestamp()} BUTTON ___ ${interaction.member.displayName} successfully removed the "${role.name}" role.\n`);
			
			// if the person doesn't have the role yet
		} else {
			// then add that role, toggle on
			interaction.member.roles.add(role);
			diag && console.log(`${timestamp()} DIAG  |  added role "${role.name}"`);
			// update the reply to quietly notify the person that they have added the role
			interaction.reply({ content: `${successOn}`, ephemeral: true });
			diag && console.log(`${timestamp()} DIAG  ▨  reply sent`);
			console.log(`${timestamp()} BUTTON ___ ${interaction.member.displayName} successfully added the "${role.name}" role.\n`);
		};

		// discontinue
		return;

	} catch (error) {
		console.log(`${timestamp()} ERROR >!< couldn't update role: ${error}\n`);
		interaction.reply({ content: `something went wrong, sorry!\nerror: ${error}`, ephemeral: true });
	}
}