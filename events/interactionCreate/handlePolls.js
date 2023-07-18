const { Interaction } = require('discord.js');
const pollData = require('../../models/pollData');
const pollProgress = require('../../utils/pollProgress');
const timestamp = require('../../utils/timestamp');
const diagnostics = true;

/**
 * 
 * @param {Interaction} interaction
 */
module.exports = async (interaction) => {
	// discontinue if not relevant
	if (!interaction.isButton() || !interaction.customId) return;

	try {
		// seperate info from the button press that will be useful to work with
		const [type, pollID, action] = interaction.customId.split('.');

		// discontinue if the button press isn't poll-related or doesn't have all the needed info
		if (!type || !pollID || !action) return;
		if (type !== 'poll') return;

		diagnostics && console.log(`DIAG  ▢  new vote detected, starting poll update`);

		// tell discord to chill out
		let loading = await interaction.deferReply({ ephemeral: true });

		// grab database data, poll message info, and pressed button info
		const targetPoll = await pollData.findOne({ pollID });
		const targetMsg = await interaction.channel.messages.fetch(targetPoll.messageID);
		const targetMsgEmbed = targetMsg.embeds[0];
		const optionTotal = targetMsgEmbed.fields.length;
		const voteBtn = action.slice(-1);
		const voteArr = voteBtn - 1;

		// group all the votes on this poll from the database
		const tPoll = [
			targetPoll.vote1,
			targetPoll.vote2,
			targetPoll.vote3,
			targetPoll.vote4,
		];
		// group all possible locations of this user's prior votes in this particular poll
		const voteCheck = [
			tPoll[0].indexOf(interaction.user.id),
			tPoll[1].indexOf(interaction.user.id),
			tPoll[2].indexOf(interaction.user.id),
			tPoll[3].indexOf(interaction.user.id),
		];
		// group the sum total of votes for each option provided
		const voteTotals = [
			tPoll[0].length,
			tPoll[1].length,
			tPoll[2].length,
			tPoll[3].length,
		];

		diagnostics && console.log(`DIAG  |  data has been assigned, starting vote checks`);

		// run if the user has voted in this poll before
		if (voteCheck.filter((v) => (v > -1)).length > 0) {
			// if they're double-voting, notify user and discontinue
			if (voteCheck[voteArr] > -1) {
				await loading.edit(`You can't vote for this option more than once.`);
				diagnostics && console.log(`DIAG  ▨  double vote detected, discontinuing\n`);
				return;
			// if they're changing their vote, notify user and remove their previous vote
			} else {
				for (i = 0; i < optionTotal; i++) {
					if (voteCheck[i] > -1) {
						tPoll[i].splice(voteCheck[i], 1);
						voteTotals[i] += -1;
						await loading.edit(`You've changed your vote to option ${voteBtn}: **${targetMsgEmbed.fields[voteArr].name.slice(3)}**`);
						break;
					}
				};
				diagnostics && console.log(`DIAG  |  previous votes removed`);
			};
		// run if the user is voting in the poll for the first time
		} else {
			diagnostics && console.log(`DIAG  |  new vote detected, attempting to notify user`);
			// notify the user that the button worked and verify their choice
			await loading.edit(`You've voted for option ${voteBtn}: **${targetMsgEmbed.fields[voteArr].name.slice(3)}**`);
			diagnostics && console.log(`DIAG  |  notified user`);
		};

		// store the user's vote
		tPoll[voteArr].push(interaction.user.id);
		voteTotals[voteArr] += 1;

		// update the database
		await targetPoll.save();

		diagnostics && console.log(`DIAG  |  data has been stored and saved to database`);

		// update every field in the voting embed to reflect new vote count
		for (f = 0; f < optionTotal; f++) {
			targetMsgEmbed.fields[f].value = pollProgress(f, voteTotals);
		};

		diagnostics && console.log(`DIAG  |  embed fields updated`);

		// update the voting embed in the original poll message
		await targetMsg.edit({ embeds: [targetMsgEmbed] });

		diagnostics && console.log(`DIAG  |  voting embed updated\nDIAG  ▨  finished\n`);

		// discontinue
		return;

	} catch (error) {
		console.log(`${timestamp()} ERROR ___ couldn't update poll: ${error}`);
	}
}