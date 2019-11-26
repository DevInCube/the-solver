
//returns Matrix instance parsed from string
function parseMatrix(str) {
	let m = new Matrix();
	if (!str) {
		return m;
	}
	try {
		let arr = JSON.parse(str);
		return createMatrix(arr);
	}
	catch (err) {  
		// custom format
		let lines = str.match(/[^\r\n]+/g).filter(x => !isBlank(x));
		console.log(lines)
		let height = lines.length;
		let width = -1;
		let matrix = new Array(height);
		for (let i = 0; i < height; i++) {
			let items = lines[i].match(/[+\-0-9\.]+/g);
			let thisWidth = items.length;
			if (width === -1) width = thisWidth;
			else if (width !== thisWidth) {
				return m;
			}
			matrix[i] = new Array(width);
			for (let j = 0; j < width; j++) {
				matrix[i][j] = items[j];
			}
		}
		m.width = width;
		m.height = height;
		m.items = matrix;
		console.log(matrix)
		m.valid = true;
		return m;

		function isBlank(str) {
			return (!str || /^\s*$/.test(str));
		}
	}
}