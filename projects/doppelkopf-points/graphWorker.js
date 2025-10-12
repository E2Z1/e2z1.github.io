onmessage = async (e) => {
	const data = e.data.data;
	const smoothness = e.data.smoothness;

	const width = e.data.w;
	const height = e.data.h;
	const scaleFactorY = (height * 0.9 - 20) / (e.data.diff);
	const scaleFactorX = (width * 0.9 - 20) / e.data.length;
	const zeroPointY = height * 0.9 + e.data.minVal * scaleFactorY;

	let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" font-family="Arial" font-size="${height / 20}">`;

	for (let i = 0; i < Object.keys(data).length; i++) {
		const key = Object.keys(data).sort()[i];
		const val = data[key];

		let pathData = "";
		let tVal;

		for (let j = 0; j < val.length; j+=Math.ceil(val.length/smoothness)) {
			if (j != 0 && val[j-1][0] != val[j][0]-1) {	
				tVal = val[j-1];
				pathData += `L${(val[j][0]-1)*scaleFactorX},${zeroPointY - tVal[1]*scaleFactorY}`;
			}
			tVal = val[j];
			pathData += (j === 0 ? "M" : "L") + `${tVal[0]*scaleFactorX},${zeroPointY - tVal[1]*scaleFactorY}`;
		}
		tVal = val[val.length-1]
		pathData += `L${e.data.length * scaleFactorX},${zeroPointY - tVal[1] * scaleFactorY}`;

		svg += `
			<path d="${pathData}" fill="none" stroke="${e.data.colors[i]}" stroke-width="${height / 300}"/>
			<text x="${e.data.length * scaleFactorX}" y="${zeroPointY - tVal[1] * scaleFactorY + height / 60}" fill="${e.data.colors[i]}">
				${key.slice(0, 2)}
			</text>
		`;

	}
	
	svg += "</svg>";

	const blob = new Blob([svg], { type: "image/svg+xml" });
	const reader = new FileReader();
	reader.onload = () => {
		postMessage(reader.result);
	};
	reader.readAsDataURL(blob);
}