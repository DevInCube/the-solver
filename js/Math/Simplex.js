let errorListEl;
let errEl;
let matrixInputEl;
let matrixOutputEl;
let elEl;
let cInputEl;
let bInputEl;
let deltaOutputEl;
let runEl;
let runDeltasEl;
let basisRowsEl;

let modelProxyHandler = {
	set: function (target, propKey, propValue) {
		runEl.disabled = !(model.A.valid && model.E.valid);
		runDeltasEl.disabled = !(model.A.valid && model.B.valid && model.C.valid);
		checkBegin();
		if (!model.A.valid) addError("invalid matrix (A)");
		if (model.A.valid) {
			if (model.C.width !== model.A.width - 1) 
				addError(`c.length (${model.C.width}) != matrix.width - 1 (${model.A.width - 1})`);
			if (model.B.width !== model.A.height) 
				addError(`basis length (${model.B.width}) != matrix height (${model.A.height})`);
			for (let i = 0; i < model.B.width; i++) {
				let bi = model.B.items[i];
				if (bi < 0 || bi > model.C.width) 
					addError("invalid basis element: " + bi);
			}
			if (model.E.width < 2) 
				addError("position should have 2 values");
			if (model.E.valid && model.E.width >= 2) {
				if (model.E.items[0][0] > model.A.height - 1)
					addError("invalid l element position: " + model.E.items[0][0]);
				if (model.E.items[0][1] > model.A.width - 1)
					addError("invalid r element position: " + model.E.items[0][1]);
			}
		}
		checkEnd();
		//
		target[propKey] = propValue;
		return true;
	}
};

let model = new Proxy({
	A: new Matrix(),
	C: new Matrix(),
	B: new Matrix(),
	E: new Matrix()
}, modelProxyHandler);

window.onload = function () {
	bindMobileHardwareBtn();
	errEl = document.getElementById("error");
	errorListEl = document.getElementById("errorList");
	matrixInputEl = document.getElementById("input");
	matrixOutputEl = document.getElementById("output");
	elEl = document.getElementById("elEl");
	cInputEl = document.getElementById("cInput");
	bInputEl = document.getElementById("bInput");
	deltaOutputEl = document.getElementById("deltaOutput");
	runEl = document.getElementById("runBtn");
	runEl.addEventListener('click', e => mathRun())
	runDeltasEl = document.getElementById("run2Btn");
	runDeltasEl.addEventListener('click', e => calcDeltas())
	basisRowsEl = document.getElementById("basisRows");
	console.log('loaded;');
}

function checkBegin() {
	while (errorListEl.children.length > 0)
		errorListEl.removeChild(errorListEl.lastChild);
}

function checkEnd() {
	errEl.style.opacity = (errorListEl.children.length === 0) ? 0 : 0.9;
}

//matrix input
function inputChanged(inputEl) {
	let matStr = inputEl.value;
	// add auto newline
	if (matStr.slice(-1) === ";") {
		inputEl.value += "\r\n";
		matStr = inputEl.value;
	}
	model.A = parseMatrix(matStr);
	console.table(model.A.items)
}
//C-vector input
function cInputChanged(cInputEl) {
	model.C = parseMatrix(cInputEl.value);
	console.table(model.C.items)
}
//B-vector input
function bInputChanged(bInputEl) {
	model.B = parseMatrix(bInputEl.value);
	console.table(model.B.items)
}
//E-vector input
function eInputChanged(eInputEl) {
	model.E = parseMatrix(eInputEl.value);
	console.table(model.E.items)
}

function mathRun() {
	let pi = model.E.items[0][0];
	let pj = model.E.items[0][1];
	let B = transform(model.A, pi, pj);
	matrixOutputEl.value = matrixOutputString(B);

	function matrixOutputString(m) {
		let result = "";
		for (let i = 0; i < m.height; i++) {
			let lineValues = []
			for (let j = 0; j < m.width; j++) {
				lineValues.push(parseFloat(Math.round(m.items[i][j] * 1000) / 1000).toFixed(3));
			}
			result += lineValues.join(" , ") + ";\n";
		}
		console.log(result)
		return result;
	}
}

// m - Matrix, pi, pj - int
function transform(m, pi, pj) {
	if (!m.valid) {
		console.log('transform: invalid matrix');
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

function calcDeltas() {
	deltaOutputEl.value = "";
	let deltas = getDeltasArray(model);
	for (let delta of deltas)
		deltaOutputEl.value += delta + ", ";
}

function moveUp() {
	matrixInputEl.value = matrixOutputEl.value;
	matrixOutputEl.value = "";
	inputChanged(matrixInputEl);
}

function setSelectRange(select, maxVal) {
	for (let i = 0; i < maxVal; i++) {
		let opt = select.children[i];
		if (!opt) {
			opt = document.createElement("option");
			opt.value = i;
			opt.textContent = i + 1;
			select.appendChild(opt);
		}
	}
	while (select.children.length > maxVal)
		select.removeChild(select.lastChild);
	select.disabled = maxVal === 0;
}

function bindMobileHardwareBtn() {

	document.addEventListener('keydown', function (e) {
		// back btn
		if (e.keyCode === 27) {
			alert('back');
			e.preventDefault();
		}
	});

}


//======>
/* Test data
c
-54,-58,-64,0,0,0
b
4,5,6
A
31,32,82,41,1,0,0;
-6,-8,-1,91,0,1,0;
87,7,73,-9,0,0,1
*/

/* minus test
-54,-58,-64,0,0,0,0
4,1,6,7
7,0,78,405,1,4,0,0;
0.75,1,0.125,-11.375,0,-0.125,0,0;
37.75,0,72.125,70.625,0,0.875,1,0;
-0.75,0,-0.125,11.075,0,0.125,0,1

*/

function runSimplex(cIn, bIn, aIn, out) {
	let outEl = document.getElementById(out);
	let cEl = document.getElementById(cIn);
	let bEl = document.getElementById(bIn);
	let aEl = document.getElementById(aIn);
	let A = parseMatrix(aEl.value);
	let b = parseMatrix(bEl.value);
	let c = parseMatrix(cEl.value);
	let table = new SimplexTable(A, b, c);
	outEl.innerHTML = "";
	Error.init();
	Error.check(function () {
		if (!table.A.valid) Error.add("A is invalid");
		if (!table.B.valid) Error.add("A is invalid");
		if (!table.C.valid) Error.add("A is invalid");
		if (table.B.width !== table.A.height) Error.add("B length != A height");
		if (table.C.width !== table.A.width - 1) Error.add("C length != A.width - 1");
		for (let i = 0; i < table.B.width; i++)
			if ((table.B.items[0][i] - 1) >= table.C.width) {
				Error.add("B element {" + table.B.items[0][i] + "} is more than C length");
				break;
			}
	});
	if (!Error.hasErrors())
		doSimplex(table, outEl);
}

function SimplexTable(A, b, c) {

	this.A = A;
	this.B = b;
	this.C = c;
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

// A - matrix
// b - basis index vector
// c - vector
// log - string
function doSimplex(table, el) {
	label(el, "=================================");
	let fn = "max f(x) = ";
	for (let i = 0; i < table.C.width; i++) {
		if (i > 0) fn += " + ";
		fn += table.C.items[0][i] + "&times;X" + (i + 1);
	}
	label(el, fn + " ;");
	let it = 0;
	while (true) {
		label(el, "----------------------------");
		label(el, "Iteration " + it + ":");
		el.appendChild(table.toTable());
		let minusRowIndex = -1;
		for (let i = 0; i < table.A.height; i++) {
			if (table.A.items[i][0] < 0) {
				minusRowIndex = i;
				break;
			}
		}
		if (minusRowIndex === -1) {
			label(el, "=================================");
			label(el, "No minus elements.");
			let x = new Matrix();
			x.width = table.C.width;
			x.height = 1;
			x.items = [[]];
			for (let i = 0; i < table.C.width; i++) {
				x.items[0][i] = 0;
			}
			for (let i = 0; i < table.B.width; i++) {
				let index = table.B.items[0][i];
				x.items[0][index - 1] = table.A.items[i][0];
			}
			label(el, "x* = ");
			el.appendChild(matrixToTable(x));
			let res = 0;
			for (let i = 0; i < table.C.width; i++)
				res += table.C.items[0][i] * x.items[0][i];
			label(el, "f(x*) = " + res);
			return; //end
		}
		else {
			let deltas = getDeltas(table);
			label(el, "deltas = ");
			el.appendChild(matrixToTable(deltas));

			let gammasData = getGammasData(table);

			if (!gammasData.hasMinusInRow) {
				label(el, "=================================");
				label(el, "Has no minuses in minus row. Problem can not be solved");
				return; //end
			}
			label(el, "gammas = ");
			el.appendChild(matrixToTable(gammasData.gammas));
			table.A = transform(table.A, gammasData.minusRowIndex, gammasData.minGammaIndex);
			table.B.items[0][gammasData.minusRowIndex] = gammasData.minGammaIndex;
		}
		it++;
	}
}

function getGammasData(table) {
	let gammas = new Matrix();
	gammas.width = table.C.width;
	gammas.height = 1;
	gammas.items = [[]];
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
	let deltas = new Matrix();
	deltas.width = table.C.width;
	deltas.height = 1;
	deltas.items = [[]];
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

// DOM

function addError(msg) {
	let item = document.createElement("li");
	item.innerHTML = msg;
	errorListEl.appendChild(item);
}

function label(el, string) {
	let lbl = document.createElement("label");
	lbl.setAttribute("class", "log");
	lbl.innerHTML = string;
	el.appendChild(lbl);
}