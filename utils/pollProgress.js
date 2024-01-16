function pollProgress(index, voteTotals) {
	// components and parameters of our progress bar
	const fill = '▨', empty = '▢', size = 20;
	// adds up all of our votes in this poll
	const voteSum = voteTotals.reduce((a, b) => a + b, 0);
	let percent, percentDisplay;

	// calculate percentage of votes, default to 0
	if (voteTotals[index] == 0) {
		percent = 0;
	} else {
		percent = Math.round(voteTotals[index] / voteSum * 100) / 100;
		percentDisplay = percent.toFixed(2);
	}

	// build the progress bar using our comp/params and calculations
	const progressBar = `${fill.repeat(Math.round(percent * size))}${empty.repeat(size - Math.round(percent * size))}`;
	// place the progress bar inside a code block for more cross-platform consistency and add visible stat calculations
	const newField = `\`\`\`${progressBar}\n ${voteTotals[index]} / ${voteSum}  ->  ${percentDisplay}% \`\`\``;

	return newField;
}

module.exports = pollProgress;