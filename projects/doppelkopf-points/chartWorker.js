onmessage = async (e) => {
	const canvas = new OffscreenCanvas(900, 600)
	const ctx = canvas.getContext("2d");
	const data = e.data.data;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = `${canvas.height/22}px Arial`;
	let maxVal = Math.max(...Object.values(data));
	if (maxVal == 0)
		maxVal = 1;     //to not divide by zero
	const minVal = Math.min(...Object.values(data), 0);	//wanted to make avg win/lose points in one plot -> negative values
																//and total points ofc
	const barWidth = (canvas.width - 20) / (Object.keys(data).length);
	const scaleFactor = (canvas.height * 0.9 - 4 - canvas.height/25) / (maxVal - minVal);
	const zeroPoint = Math.max(25,canvas.height * 0.9 + minVal * scaleFactor);


	for (let i = 0; i < Object.keys(data).length; i++) {
		const key = Object.keys(data).sort()[i];
		const val = data[key];
		const x = 20 + i * barWidth;
		const height = val * scaleFactor;
		const y = zeroPoint - height;

		ctx.fillStyle = "#FFF";
		ctx.fillRect(x, y, barWidth/1.5, height);

		let valText = "" + Math.round(val*100)/100;
		if (e.data.isPercentage) {
			valText = "" + Math.round(val*100) + "%";
		}
		if (val < 0) {
			ctx.fillText(valText, x, zeroPoint - height + 2 + canvas.height/25);
		} else {
			ctx.fillText(valText, x, zeroPoint - height - 4);
		}
		if (val < 0) {
			ctx.fillText(key.slice(0,4), x, zeroPoint - 4);
		} else {
			ctx.fillText(key.slice(0,4), x, zeroPoint + 2 + canvas.height/25);
		}
	}
	const blob = await canvas.convertToBlob();
	const reader = new FileReader();
	reader.onload = () => {
		postMessage(reader.result);
	};
	reader.readAsDataURL(blob);
}