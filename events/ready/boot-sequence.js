const { ActivityType } = require('discord.js');

module.exports = (client) => {
	const d = new Date().toISOString();
	const timestamp = `${d.slice(0, 10)} | ${d.slice(11, 19)} |`;

	console.log(`${timestamp} BOOT ___ ${client.user.tag} is online.`);

	client.user.setActivity({
		name: 'Emergent Beacon',
		type: ActivityType.Watching,
	});
};