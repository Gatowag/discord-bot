function timestamp() {
	const timezoneOffset = -5;
	const dBase = new Date();
	dBase.setHours(dBase.getHours() + timezoneOffset);
	const d = dBase.toISOString();
	const timestamp = `${d.slice(0, 10)} | ${d.slice(11, 19)} |`;

	return timestamp;
}

module.exports = timestamp;