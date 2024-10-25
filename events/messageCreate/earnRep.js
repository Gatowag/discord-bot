const { Client, Message } = require('discord.js');
const Level = require('../../models/levelStructure');
const levelScaling = require('../../utils/levelScaling');
const timestamp = require('../../utils/timestamp');
/**
 * 
 * @param {Message} message 
 * @param {Client} client 
 * @returns 
 */

module.exports = async (message, client) => {
	// discontinue if the message isn't relevant
	if (!message.inGuild() || message.author.bot) return;

	const u = message.member.displayName;
	const repEarned = 1;

	try {
		// declare roles that can be added or removed
		const roleIDs = [
			'747990765409402960',	//0: sentient being
			'747991758453080185',	//1: local dignitary
			'777788958251155497',	//2: planetary diplomat
			'777789109191835678',	//3: galactic ambassador
			'777790027525652480'	//4: interdimensional explorer
		];

		// structure user data from interaction
		const query = {
			userId: message.author.id,
			guildId: message.guild.id,
		};

		// grab stored user data from the database
		const userData = await Level.findOne(query);

		// if there is data for this user already stored in the database
		if (userData) {
			const oldLvl = userData.level;
			userData.rep += repEarned;

			console.log(`${timestamp()} MSG SENT ___ user: ${u}, rep: ${userData.rep}/${levelScaling(userData.level)}, lvl: ${userData.level}`);

			// if the user's reputation exceedes their level's threshold
			if (userData.rep > levelScaling(userData.level)) {
				userData.rep = 1;
				userData.level += 1;

				let unlocksChannel = message.guild.channels.resolve('809015126857875466');
				let newRole = message.guild.roles.cache.get(roleIDs[userData.level]);
				let lvlMsgNum = 5;

				// if the user's new level is less than 5, manage role change and prep message
				if (userData.level < 5) {
					let oldRole = message.guild.roles.cache.get(roleIDs[userData.level - 1]);
					lvlMsgNum = userData.level;

					// add new role before removing old role so there's no lapse in permissions
					message.member.roles.add(newRole)
						.then(() => {
							message.member.roles.remove(oldRole);
							console.log(`${timestamp()} ROLES ___ ${u} was granted ${newRole.name} and revoked ${oldRole.name}`);
						})
						.catch(error => console.log(`${timestamp()} ERROR >!< unable to add and remove roles: ${error}`));

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
					];
				
					console.log(`${timestamp()} LVL UP ___ user: ${u}, from lvl ${oldLvl} to ${userData.level}`);

					message.reply(lvlMessages[lvlMsgNum])
						.then(msg => {
							setTimeout(() => msg.delete(), 30000);
						});
					
				} else {
					const lvlMessage = `${message.member} just reached level ${userData.level}. At this point you don't get new roles or channels, you just get a little older and a little better. Until next time...\n\n*This message self-terminates in 30 seconds.*`;

					console.log(`${timestamp()} LVL UP ___ user: ${u}, from lvl ${oldLvl} to ${userData.level}`);

					message.reply(lvlMessage)
						.then(msg => {
							setTimeout(() => msg.delete(), 30000);
						});
				}
			}

			// update the database data and discontinue process
			await userData.save().catch((e) => {
				console.log(`${timestamp()} ERROR >!< couldn't save new level for ${u}: ${e}`);
				return;
			});
		}

		// if there isn't data stored for this user in the database yet
		else {
			console.log(`${timestamp()} DATABASE ___ creating new entry for ${u}`);

			// prep data for new database entry
			const newUserData = new Level({
				userId: message.author.id,
				guildId: message.guild.id,
				rep: repEarned,
			});

			// save user data to database
			await newUserData.save();
			return;
		}
	} catch (error) {
		console.log(`${timestamp()} ERROR >!< couldn't earn reputation for ${u}: ${error}`);
	}
};