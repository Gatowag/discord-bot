module.exports = (level) => {
	let x;
	const l = level;

	if (l === 0) {
		x = 5;
	} else if (l === 1) {
		x = 12;
	} else if (l === 2) {
		x = 30;
	} else if (l === 3) {
		x = 50;
	} else if (l === 4) {
		x = 70
	} else if (l === 5) {
		x = 150
	} else if (l > 5) {
		x = 100 + 200*(l/10);
	}

	return x;
}