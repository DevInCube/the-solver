import Matrix from "../Math/Matrix";

//returns Matrix instance parsed from string
export function parseMatrix(str: string) {
	let m = new Matrix();
	if (!str) {
		return m;
	}
	try {
		let arr = JSON.parse(str);
		return new Matrix(arr);
	}
	catch (err) {
		// custom format
		let matchLines = str.match(/[^\r\n]+/g);
		if (!matchLines) throw new Error(`Parse error: no lines`)
		let lines = matchLines.filter(x => !isBlank(x));
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
		m.items = matrix;
		m.valid = true;
		return m;

		function isBlank(str: string) {
			return (!str || /^\s*$/.test(str));
		}
	}
}

export function formatMatrix(m: Matrix, digits: number = 3) {
	let norm = normalizeMatrixOutput(m, digits)
	return norm.map(row => row.join(' , ')).join(';\n');

	function normalizeMatrixOutput(matrix: Matrix, digits: number = 3) {
		let copy = Matrix.createArray(matrix.height, matrix.width);
		for (let i = 0; i < matrix.height; i++) {
			for (let j = 0; j < matrix.width; j++) {
				copy[i][j] = normalizedNumber(Number(matrix.items[i][j]), digits);
			}
		}
		return copy;
	}
}

export function normalizedNumber(number: number, digits: number = 3): string {
	let num = number
	let fixed = num.toFixed(digits)
	num = Number(fixed);
	let frac = num - Math.trunc(num);
	return (num !== 0 && (frac !== 0)) ? fixed : num.toFixed(0)
}