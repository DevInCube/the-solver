
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
			if (!items) throw new Error(`Invalid matrix:\n${str}`)
			let thisWidth = items.length;
			if (width === -1) width = thisWidth;
			else if (width !== thisWidth) {
				return m;
			}
			matrix[i] = new Array(width);
			for (let j = 0; j < width; j++) {
				matrix[i][j] = Number(items[j]);
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

function formatMatrix(m, digits = 3) {
	let norm = normalizeMatrixOutput(m, digits)
	return norm.map(row => row.join(' , ')).join(';\n');

	function normalizeMatrixOutput(matrix, digits) {
		let copy = createArray(matrix.height, matrix.width);
		for (let i = 0; i < matrix.height; i++) {
			for (let j = 0; j < matrix.width; j++) {
				let num = Number(matrix.items[i][j])
				let fixed = num.toFixed(digits)
				num = Number(fixed);
				let item = (num !== 0 && (num - Math.trunc(num)) !== 0) ? fixed : num.toFixed(0);
				copy[i][j] = item;
			}
		}
		return copy;
	}
}