const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } = require('discord.js');
const pollData = require('../../models/pollData');
const pollProgress = require('../../utils/pollProgress');
const timestamp = require('../../utils/timestamp');
require('dotenv').config();
const diagLocal = true;
const diag = diagLocal || process.env.DIAGNOSTICS;

module.exports = {
	deleted: false,
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('Post a poll that can be voted on. (not providing voting options defaults to yes/no)')
		.addStringOption((option) =>
			option
				.setName('question')
				.setDescription('ask the question that users will vote on')
				.setRequired(true))
		.addStringOption((option) =>
			option
				.setName('choice1')
				.setDescription('first choice for users to vote for'))
		.addStringOption((option) =>
			option
				.setName('choice2')
				.setDescription('second choice for users to vote for'))
		.addStringOption((option) =>
			option
				.setName('choice3')
				.setDescription('third choice for users to vote for'))
		.addStringOption((option) =>
			option
				.setName('choice4')
				.setDescription('fourth choice for users to vote for'))
		.addStringOption((option) =>
			option
				.setName('info')
				.setDescription('extra info to clarify details about the question'))
		.addAttachmentOption((option) =>
			option
				.setName('image')
				.setDescription('upload an image attachment?')),
	
	/**
	 * 
	 * @param {Object} param0
	 * @param {ChatInputCommandInteraction} param0.interaction 
	 */
	
	run: async ({ interaction }) => {
		const u = interaction.member.displayName;
		diag && console.log(`\nDIAG  ▢  new poll started`);

		try {
			// notifies user "<application> is thinking..." and prevents error message that application did not respond
			let loading = await interaction.deferReply({ ephemeral: true });

			diag && console.log(`DIAG  |  init reply sent`);

			// get inputs
			let c1 = interaction.options.get('choice1')?.value;
			let c2 = interaction.options.get('choice2')?.value;
			let c3 = interaction.options.get('choice3')?.value;
			let c4 = interaction.options.get('choice4')?.value;
			const file = await interaction.options.getAttachment('image');
			const question = interaction.options.get('question').value;
			const info = interaction.options.get('info')?.value;

			// set up variables within which we build stuff
			let pollPrompt, pollVoting, embedPrompt, embedVoting, descript;

			diag && console.log(`DIAG  |  inputs and variables assigned`);
			
			// attach extra info to description field, if present
			if (info) {
				descript = `## ${question}\n${info}`
			} else {
				descript = `## ${question}`
			};

			// default to yes/no poll if voting options aren't provided
			if (!c1) { c1 = `Yes`; c2 = `No`; };

			// run as image poll (2 embeds)
			if (file) {
				// build top embed where image is displayed
				embedPrompt = new EmbedBuilder()
					.setDescription(descript)
					.setAuthor({
						name: `poll created by ${interaction.member.displayName}`,
						iconURL: interaction.user.displayAvatarURL({ size: 256 })})
					.setColor(0x466df1)
					.setImage(`attachment://${file.name}`)
					.setFooter({ text: `Voting options are listed below. Only your latest vote is counted.` });
				
				// send msg with fully-formed image/prompt embed and another msg as placeholder for voting
				pollPrompt = await interaction.channel.send({ embeds: [embedPrompt], files: [file] });
				pollVoting = await interaction.channel.send({ embeds: [new EmbedBuilder()
					.setDescription('Creating poll, please wait...')] });
				
				// start building the voting embed
				embedVoting = new EmbedBuilder()
					.setColor(0x466df1);
				
					diag && console.log(`DIAG  |  image poll detected, both embeds sent, image embed complete`);
				
			// run as text poll (1 embed)
			} else {
				// send msg as placeholder for voting
				pollVoting = await interaction.channel.send({ embeds: [new EmbedBuilder()
					.setDescription('Creating poll, please wait...')] });
				
				// start building the voting embed, populate with prompt info
				embedVoting = new EmbedBuilder()
					.setDescription(descript)
					.setAuthor({
						name: `poll created by ${interaction.member.displayName}`,
						iconURL: interaction.user.displayAvatarURL({ size: 256 })})
					.setColor(0x466df1)
					.setFooter({ text: `Only your latest vote is counted.` });
				
					diag && console.log(`DIAG  |  text poll detected, voting embed sent`);
			};

			// fill data in the poll schema to ready for database
			const newPoll = new pollData({
				guildID: interaction.guildId,
				authorID: interaction.user.id,
				messageID: pollVoting.id,
				content: question,
			})

			// send data to database
			await newPoll.save();

			diag && console.log(`DIAG  |  data has been saved to database`);

			// prep for button creation
			const optionArr = [c1, c2, c3, c4];
			let buttonArr = [];
			let buttonRow = new ActionRowBuilder();

			// run through each provided vote option, build a button for it, add a field in the voting embed
			for (c = 0; optionArr[c]; c++) {
				let d = c + 1;
				buttonArr[c] = new ButtonBuilder()
					.setLabel(`${d}`)
					.setStyle(ButtonStyle.Primary)
					.setCustomId(`poll.${newPoll.pollID}.c${d}`);
				buttonRow.addComponents(buttonArr[c]);
				embedVoting.addFields({ name: `${d}: ${optionArr[c]}`, value: pollProgress(0, [0]), inline: false, });
			}

			// custom format buttons for a yes/no poll
			if (c1 === `Yes` && c2 === `No`) {
				buttonArr[0].setLabel('Yes').setStyle(ButtonStyle.Success);
				buttonArr[1].setLabel('No').setStyle(ButtonStyle.Danger);
			};

			diag && console.log(`DIAG  |  buttons created`);
			
			// update the voting message with the completed embed and buttons
			await pollVoting.edit({ embeds: [embedVoting], components: [buttonRow] });

			diag && console.log(`DIAG  |  voting embed updated`);

			// removes thinking message
			await loading.delete();

			diag && console.log(`DIAG  |  init reply deleted\nDIAG  ▨  finished\n`);

			console.log(`${timestamp()} POLL ___ ${u} successfully created a poll: ${question}`);

			return;
		} catch (error) {
			console.log(`${timestamp()} ERROR >!< couldn't complete poll for ${u}: ${error}`);
		}
	},
};