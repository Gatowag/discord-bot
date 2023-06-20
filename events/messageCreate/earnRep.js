const { Client, Message } = require('discord.js');
const Level = require('../../models/levelStructure');
const levelScaling = require('../../utils/levelScaling');

/**
 * 
 * @param {Message} message 
 * @param {Client} client 
 * @returns 
 */

module.exports = async (message, client, interaction) => {
	if (!message.inGuild() || message.author.bot) return;

	const roleIDs = [
		'1120480710885646356',	//0: sentient being
		'513935083690917949',	//1: local dignitary
		'1120238776258662420',	//2: planetary diplomat
		'1120238834840514580',	//3: galactic ambassador
		'1120480580291797134'	//4: interdimensional explorer
	];

	const repEarned = 1;

	const query = {
		userId: message.author.id,
		guildId: message.guild.id,
	};

	try {
		const level = await Level.findOne(query);
		const oldLvl = level.level;

		if (level) {
			level.rep += repEarned;

			console.log(`MESSAGE SENT ___ user: ${message.member.displayName}, rep: ${level.rep}/${levelScaling(level.level)}, level: ${level.level}`);

			if (level.rep > levelScaling(level.level)) {
				level.rep = 1;
				level.level += 1;

				let unlocksChannel = message.guild.channels.resolve('1120497447005851778');
				let newRole = message.guild.roles.cache.get(roleIDs[4]);
				let lvlMsgNum = 5;

				if (level.level < 5) {
					let oldRole = message.guild.roles.cache.get(roleIDs[level.level-1]);
					newRole = message.guild.roles.cache.get(roleIDs[level.level]);
					lvlMsgNum = level.level;

					message.member.roles.add(newRole);
					message.member.roles.remove(oldRole);
				};
				
				const lvlMessages = [
					//0: sentient being
					'',
					//1: local dignitary
					`Thank you for adding to the conversation, ${message.member}. Your candor convinced the electorate to elect you as **${newRole.name.slice(9)}**. With it, your access has expanded to 9 more channels. Be sure to check ${unlocksChannel} to see a breakdown. Be well.\n\n*This message self-terminates in 30 seconds.*`,
					//2: planetary diplomat
					`You have made a name for yourself, ${message.member}. Your planet entrusts you to represent them as a **${newRole.name.slice(9)}**. This comes with 4 more channels to better connect with the world you now represent. Be sure to check ${unlocksChannel} to see a breakdown. Keep exploring, keep questioning.\n\n*This message self-terminates in 30 seconds.*`,
					//3: galactic ambassador
					`We're honored to be present for your swearing in, **${newRole.name.slice(9)}** ${message.member}. The weight of our local system rests squarely on your shoulders, so enjoy these complementary 3 channels. We're confident this will ease your burden. Be sure to check ${unlocksChannel} to see a breakdown. Project your voice confidently into the dark reaches of the universe.\n\n*This message self-terminates in 30 seconds.*`,
					//4: interdimensional explorer
					`${message.member} glows brightly amongst the salted sky as an **${newRole.name.slice(9)}**. Their vast experience inherits a trust required for the last remaining channel. Be sure to check ${unlocksChannel} to see a breakdown. Knowledge can never be quenched nor suppressed to extinction so long as someone exists to pursue it.\n\n*This message self-terminates in 30 seconds.*`,
					//5+ ???
					`${message.member} just reached level ${level.level}. At this point you don't get new roles or channels, you just get a little older and a little better. Until next time...\n\n*This message self-terminates in 30 seconds.*`
				];
				
				console.log(`LVL UP ___ user: ${message.member.displayName}, from lvl ${oldLvl} to ${level.level}`);

				message.reply(lvlMessages[lvlMsgNum])
					.then(msg => {
						setTimeout(() => msg.delete(), 30000);
					});
			}

			await level.save().catch((e) => {
				console.log(`Error saving updated level ${e}`);
				return;
			});
		}

		// if (!level)
		else {
			//create new level
			const newLevel = new Level({
				userId: message.author.id,
				guildId: message.guild.id,
				rep: repEarned,
			});

			await newLevel.save();
		}
	} catch (error) {
		console.log(`Error earning reputation: ${error}`);
	}
};