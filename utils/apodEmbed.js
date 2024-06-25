require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const timestamp = require('../utils/timestamp');
const diagnostics = false;

async function apodEmbed(dateIn, rand) {

	/* --- */ diagnostics && console.log(`DIAG  ▢  starting apod embed creation`);
	try {
		let typeF = ` — today's post`, typeC = 0x0165b3;
		let dateOut;
		(!dateIn) ? (dateOut = "") : (dateOut = `&date=${dateIn}`);

		/* --- */ diagnostics && console.log(`DIAG  |  date variables declared`);
		/* --- */ diagnostics && console.log(`DIAG  |  dateIn: ${dateIn}`);
		/* --- */ diagnostics && console.log(`DIAG  |  rand: ${rand}`);

		if (rand) {
			/* --- */ diagnostics && console.log(`DIAG  |  starting random date generation`);
			const dEnd = new Date();
			const dStart = new Date("1995-06-16");
			let dRand = new Date(+dStart + Math.random() * (dEnd - dStart));
			let dISO = dRand.toISOString();
			dateOut = `&date=${dISO.slice(0, 10)}`;
			typeF = ` — random date`;
			typeC = 0xb65bd8;
		};
		/* --- */ diagnostics && console.log(`DIAG  |  dateOut: ${dateOut}`);

		
		/* --- */ diagnostics && console.log(`DIAG  |  requesting NASA API info`);
		let apodResponse = await request(`https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API}${dateOut}&thumbs=True`);

		/* --- */ diagnostics && console.log(`DIAG  |  parsing NASA API info`);
		let data = await apodResponse.body.json();
		
		/* --- */ diagnostics && console.log(`DIAG  ↓  creating permalink to post\n`);
		let permaLink = `https://apod.nasa.gov/apod/ap${data.date.slice(2, 4) + data.date.slice(5, 7) + data.date.slice(8)}.html`;

		// code adapted from Raxlitude's Discord Daily NASA APOD Posts on Autocode
		// checks if `copyright` field is present in the JSON data - if, then includes `footer` field of embed to display copyright holder(s)
		if ('copyright' in data) {

			console.log(`${timestamp()} APOD  ▢  copyright found`);

			// checks if the post type is image & copyrighted
			if (data.media_type === 'image') {
				let embed = new EmbedBuilder()
					.setTitle(data.title)
					.setURL(permaLink)
					.setDescription(data.explanation)
					.setImage(`${data.url}`)
					.setColor(typeC)
					.setFooter({ text: `©️ ${data.copyright.trim().replaceAll(' ,',',')}\n${data.date}${typeF}` }); // please keep this due to NASA's restrictions
				
				console.log(`${timestamp()} APOD  ▢  embed created with image and copyright`);
				return embed;
				
			// sending a different message if the post is not an image & copyrighted
			} else {
				let urlClean;
				if (data.url.indexOf("youtube.com/embed") != -1) {
					let IDstart = data.url.lastIndexOf("/") + 1;
					let IDend = data.url.indexOf("?");
					if (IDend == -1) { urlClean = `https://youtu.be/${data.url.slice(IDstart)}` }
					else { urlClean = `https://youtu.be/${data.url.slice(IDstart, IDend)}` };
				}
				else { urlClean = data.url };
				let embed = new EmbedBuilder()
					.setTitle(data.title)
					.setURL(permaLink)
					.setDescription(data.explanation)
					.setImage(`${data.thumbnail_url}`)
					.setColor(typeC)
					.addFields({
						name: 'Discord doesn\'t allow videos in rich embeds, so click through to check it out.',
						value: urlClean,
						inline: false,
					})
					.setFooter({ text: `©️ ${data.copyright.trim().replaceAll(' ,',',')}\n${data.date}${typeF}` }); // please keep this due to NASA's restrictions
					
				console.log(`${timestamp()} APOD  ▢  embed created w/o image but with copyright`);
				return embed;
				
			}

		// checks if the post type is a video and not copyrighted
		} else if (data.media_type === 'video') {

			console.log(`${timestamp()} APOD  ▢  no copyright found, video type`);

			let embed = new EmbedBuilder()
				.setTitle(data.title)
				.setURL(permaLink)
				.setDescription(data.explanation)
				.setImage(`${data.thumbnail_url}`)
				.setColor(typeC)
				.addFields({
					name: 'Discord doesn\'t allow videos in rich embeds, so click through to check it out.',
					value: data.url,
					inline: false,
				})
				.setFooter({ text: `${data.date}${typeF}` });
		
			console.log(`${timestamp()} APOD  ▢ embed created with video placeholder but no copyright`);
			return embed;
			
		// checks if the post type is an image and not copyrighted
		} else if (data.media_type === 'image') {

			console.log(`${timestamp()} APOD  ▢  no copyright found, image type`);

			let embed = new EmbedBuilder()
				.setTitle(data.title)
				.setURL(permaLink)
				.setDescription(data.explanation)
				.setImage(`${data.url}`)
				.setColor(typeC)
				.setFooter({ text: `${data.date}${typeF}` });
		
			console.log(`${timestamp()} APOD  ▢  embed created with image but no copyright`);
			return embed;
		}

	} catch (error) {
		console.log(`${timestamp()} ERROR !!! APOD failed to create embed: ${error}`);
	};
}

module.exports = apodEmbed;