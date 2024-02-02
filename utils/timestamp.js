function timestamp() {
	const timezoneOffset = -6;
	let dBase = new Date();
	dBase.setHours(dBase.getHours() + timezoneOffset);
	let d = dBase.toISOString();
	let timestamp = `${d.slice(0, 10)} | ${d.slice(11, 19)} |`;

	return timestamp;
}

module.exports = timestamp;