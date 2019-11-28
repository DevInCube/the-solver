function SimplexTable(A, b, c) {

	this.A = A;
	this.B = b;
	this.C = c;
}

SimplexTable.prototype.clone = function ()
{
	return new SimplexTable(this.A.clone(), this.B.clone(), this.C.clone())
}

// A - matrix
// b - basis index vector
// c - vector
// log - string
function doSimplex(table) {
	return {
		problem: table.C.clone(),
		iterations: doIterations(),
	};

	function doIterations() {
		let iterations = [];
		while (true) {
			let iteration = {
				table: table.clone(),
			};
			iterations.push(iteration);
			let minusRowIndex = firstNegativeRowIndex(table);
			iteration.minusRowIndex = minusRowIndex;
			if (minusRowIndex === -1) {
				let x = createMatrix([Array(table.C.width).fill(0)])
				for (let i = 0; i < table.B.width; i++) {
					let index = table.B.items[0][i];
					x.items[0][index - 1] = table.A.items[i][0];
				}
				iteration.x = x.clone()
				break; // stop, completed.
			}
			else {
				let deltas = getDeltas(table);
				let gammasData = getGammasData(table, minusRowIndex, deltas)

				iteration.deltas = deltas.clone()
				iteration.gammasData = {
					gammas: gammasData.gammas.clone(),
					minGammaIndex: gammasData.minGammaIndex,
					hasMinusInRow: gammasData.hasMinusInRow,
				}

				if (!gammasData.hasMinusInRow) {
					break; // stop, can't be solved.
				}
				table.A = transform(table.A, minusRowIndex, gammasData.minGammaIndex);
				table.B.items[0][gammasData.minusRowIndex] = gammasData.minGammaIndex;
			}
		}
		return iterations;
	}

	function firstNegativeRowIndex(table) {
		for (let i = 0; i < table.A.height; i++) {
			if (table.A.items[i][0] < 0) {
				return i
			}
		}
		return -1;
	}
}

// m - Matrix, pi, pj - int
function transform(m, pi, pj) {
	if (!m.valid) throw new Error(`transform: invalid matrix`)
	if (typeof pi !== 'number' || typeof pj !== 'number') 
		throw new Error(`transform: indexes should be numbers`)
	if (pi < 0 || pi >= m.height) throw new Error(`transform: invalid row index ${pi}`)
	if (pj < 0 || pj >= m.width) throw new Error(`transform: invalid column index ${pj}`)
	//
	let El = m.items[pi][pj]; // special element value
	let res = createMatrix(createArray(m.height, m.width));
	for (let i = 0; i < m.height; i++) {
		for (let j = 0; j < m.width; j++) {
			if (i === pi) {
				res.items[i][j] = m.items[i][j] / El;
			} else {
				res.items[i][j] = m.items[i][j] - m.items[pi][j] * m.items[i][pj] / m.items[pi][pj];
			}
		}
	}
	console.log(El)
	console.table(res.items)
	return res;
}

function getGammasData(table, minusRowIndex, deltas) {
	let gammas = new Matrix([Array(table.C.width)]);
	let minGamma = Infinity;
	let minGammaIndex = -1;
	let hasMinusInRow = false;
	for (let j = 1; j < table.A.width; j++) {
		let rowX = table.A.items[minusRowIndex][j];
		if (rowX < 0) {
			hasMinusInRow = true;
			let gamma = -(deltas.items[0][j - 1] / rowX)
			gammas.items[0][j - 1] = gamma;
			if (gamma < minGamma && gamma > 0) {
				minGamma = gamma;
				minGammaIndex = j;
			}
		}
		else
			gammas.items[0][j - 1] = NaN;
	}
	return {
		gammas,
		minGammaIndex,
		hasMinusInRow,
	}
}

function getDeltas(table) {
	let deltas = new Matrix([Array(table.C.width)]);
	for (let j = 0; j < table.C.width; j++) {
		let delta = 0;
		for (let bi = 0; bi < table.B.width; bi++) {
			let s = table.B.items[0][bi] - 1;
			let cs = table.C.items[0][s];
			let asj = table.A.items[bi][j + 1]
			delta += cs * asj;
		}
		let cj = table.C.items[0][j];
		delta -= cj;
		deltas.items[0][j] = delta;
	}
	return deltas;
}