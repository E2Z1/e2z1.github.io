onmessage = async (e) => {
	const canvas = new OffscreenCanvas(e.data.w, e.data.h)
	const ctx = canvas.getContext("2d");
	const data = e.data.data;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = `${canvas.height/20}px Arial`;
	const scaleFactorY = (canvas.height * 0.9 - 20) / (e.data.diff);
	const scaleFactorX = (canvas.width * 0.9 - 20) / e.data.length;
	const zeroPointY = canvas.height * 0.9 + e.data.minVal * scaleFactorY;


	for (let i = 0; i < Object.keys(data).length; i++) {
		const key = Object.keys(data).sort()[i];
		const val = data[key];

		ctx.fillStyle = e.data.colors[i];
		ctx.strokeStyle = e.data.colors[i];
		ctx.lineWidth = canvas.height/300;

		ctx.beginPath();
		let tVal;
		for (let j = 0; j < Object.keys(val).length; j++) {
			tVal = val[Object.keys(val)[j]];
			ctx.lineTo(tVal[0]*scaleFactorX, zeroPointY - tVal[1]*scaleFactorY);
		}
		ctx.lineTo(e.data.length*scaleFactorX, zeroPointY - tVal[1]*scaleFactorY);
		ctx.stroke();

		ctx.fillText(key.slice(0,4), e.data.length*scaleFactorX, zeroPointY - tVal[1]*scaleFactorY+canvas.height/60);

	}

	const blob = await canvas.convertToBlob();
	const reader = new FileReader();
	reader.onload = () => {
		postMessage(reader.result);
	};
	reader.readAsDataURL(blob);
}