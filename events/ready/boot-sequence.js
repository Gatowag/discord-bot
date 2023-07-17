const { ActivityType } = require('discord.js');
const timestamp = require('../../utils/timestamp');

module.exports = (client) => {

	console.log(`${timestamp()} BOOT ___ ${client.user.tag} is online.`);

	client.user.setActivity({
		name: 'Emergent Beacon',
		type: ActivityType.Watching,
	});
};