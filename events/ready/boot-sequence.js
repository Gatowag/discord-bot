const { ActivityType } = require('discord.js');

module.exports = (client) => {

	console.log(`DIAG ___ started boot-sequence.`);

	const timezoneOffset = -5;
	const dBase = new Date();
	dBase.setHours(dBase.getHours() + timezoneOffset);
	const d = dBase.toISOString();
	const timestamp = `${d.slice(0, 10)} | ${d.slice(11, 19)} |`;

	console.log(`${timestamp} BOOT ___ ${client.user.tag} is online.`);

	client.user.setActivity({
		name: 'Emergent Beacon',
		type: ActivityType.Watching,
	});
};