function repProgress(threshold, rep) {
	// components and parameters of our progress bar
	const fill = '▨', empty = '▢', size = 20;
	const percent = Math.round((rep / threshold) * 100) / 100;

	// build the progress bar using our comp/params and calculations
	const progressBar = `${fill.repeat(Math.round(percent * size))}${empty.repeat(size - Math.round(percent * size))}`;

	return progressBar;
}

module.exports = repProgress;