
function SimplexTable(A, b, c) {

	this.A = A;
	this.B = b;
	this.C = c;
}

SimplexTable.prototype.clone = function ()
{
	let t = new SimplexTable();
	t.A = this.A.clone();
	t.B = this.B.clone();
	t.C = this.C.clone();
	return t;
}

SimplexTable.prototype.toString = function () {
	let str = "";
	str += "c (fn koefs):\r\n" + this.C.toString() + "\r\n";
	str += "b (basis indexes):\r\n" + this.B.toString() + "\r\n";
	str += "A (table):\r\n" + this.A.toString() + "\r\n";
	return str;
};

SimplexTable.prototype.toTable = function () {
	let rowShift = 2;
	let colShift = 4;
	let n = this.B.width + rowShift;
	let m = this.A.width + colShift;
	let table = document.createElement("table");
	for (let i = 0; i < n; i++) {
		let row = document.createElement("tr");
		for (let j = 0; j < m; j++) {
			let cell = document.createElement("td");
			if (i === 0) {
				if (j === 0)
					cell.innerHTML = "i";
				if (j === 1)
					cell.innerHTML = "s";
				if (j === 2)
					cell.innerHTML = "cB";
				if (j < 3)
					cell.setAttribute("rowspan", 2);

				if (j === 3) {
					cell.innerHTML = "c";
					cell.setAttribute("colspan", 2);
				}
				if (j === 4) continue;
				if (j >= (colShift + 1)) {
					cell.innerHTML = this.C.items[0][j - (colShift + 1)];
					cell.setAttribute("class", "num");
				}
			}
			if (i === 1) {
				if (j < 3) continue;
				if (j === 3)
					cell.innerHTML = "bX";
				if (j >= colShift)
					cell.innerHTML = "P" + (j - 4);
			}
			if (i >= rowShift) {
				if (j === 0)
					cell.innerHTML = i + 1 - rowShift;
				let bIndex = this.B.items[0][i - rowShift];
				if (j === 1) {
					cell.innerHTML = bIndex;
					cell.setAttribute("class", "num");
				}
				if (j === 2) {
					cell.innerHTML = this.C.items[0][bIndex - 1];
					cell.setAttribute("class", "num");
				}
				if (j === 3)
					cell.innerHTML = "x" + bIndex;
				if (j >= colShift) {
					let val = this.A.items[i - rowShift][j - colShift];
					val = +parseFloat(Math.round(val * 1000) / 1000).toFixed(3);
					cell.innerHTML = val;
					cell.setAttribute("class", "num");
				}
			}
			row.appendChild(cell);
		}
		table.appendChild(row);
	}
	return table;
};

/*
-6,10,0,0,0,0
//
4,5,6
//
-6,-12,-7,-3,1,0,0
10,-7,-13,2,0,1,0
13,3,-2,0,0,0,1
*/

function printSimplexLog(log, el) {
	label(el, "=================================");
	let fn = "max f(x) = ";
	for (let i = 0; i < log.problem.width; i++) {
		if (i > 0) fn += " + ";
		fn += log.problem.items[0][i] + "&times;X" + (i + 1);
	}
	label(el, fn + " ;");
	for (let it = 0; it < log.iterations.length; it++)
	{
		let iteration = log.iterations[it];
		label(el, "----------------------------");
		label(el, "Iteration " + it + ":");
		el.appendChild(iteration.table.toTable());
		if (iteration.minusRowIndex === -1) 
		{
			label(el, "=================================");
			label(el, "No negative elements.");
			label(el, "x* = ");
			el.appendChild(matrixToTable(iteration.x));
			let res = 0;
			for (let i = 0; i < iteration.table.C.width; i++)
				res += iteration.table.C.items[0][i] * iteration.x.items[0][i];
			label(el, "f(x*) = " + res);
		}
		else 
		{
			label(el, "deltas = ");
			el.appendChild(matrixToTable(iteration.deltas));
			if (!iteration.gammasData.hasMinusInRow) {
				label(el, "=================================");
				label(el, "Has no negatives in negative row. Problem can not be solved.");
				return; //end
			}
			label(el, "gammas = ");
			el.appendChild(matrixToTable(iteration.gammasData.gammas));
		}
	}
}

// A - matrix
// b - basis index vector
// c - vector
// log - string
function doSimplex(table, el) {
	let log = {
		problem: table.C.clone(),
		iterations: doIterations(),
	};
	printSimplexLog(log, el);

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
	if (!m.valid) {
		throw new Error('transform: invalid matrix')
	}
	let El = m.items[pi][pj]; // special element value
	let res = createMatrix(createArray(m.height, m.width));
	res.valid = m.valid;
	for (let i = 0; i < m.height; i++) {
		for (let j = 0; j < m.width; j++) {
			if (i === pi) {
				res.items[i][j] = m.items[i][j] / El;
			} else {
				res.items[i][j] = m.items[i][j] - m.items[pi][j] * m.items[i][pj] / m.items[pi][pj];
			}
		}
	}
	return res;
}

function getGammasData(table, minusRowIndex, deltas) {
	let gammas = new Matrix(table.C.width, 1, [[]]);
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
	let deltas = new Matrix(table.C.width, 1, [[]]);
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

function getDeltasArray(model) {
	let res = [];
	for (let j = 0; j < model.C.width; j++) {
		let delta = 0;
		for (let bi = 0; bi < model.B.width; bi++) {
			let s = model.B.items[0][bi] - 1;
			let cs = model.C.items[0][s];
			let asj = model.A.items[bi][j + 1]
			delta += cs * asj;
		}
		let cj = model.C.items[0][j];
		delta -= cj;
		res.push(delta)
	}
	return res;
}