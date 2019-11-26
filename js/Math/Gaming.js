let matrixEl;
let simplifyMatrix;
let matrixOutputEl;

let model = new Proxy({
	A: new Matrix()
}, {
	get(target, key, val) {
		simplifyMatrix.disabled = !(model.A.valid);
		Error.check(function () {
			if (!model.A.valid) Error.add("invalid matrix");
			if (model.A.valid) {
				//
			}
		});
		//
		target[key] = val;
		return true;
	}
});

window.onload = function () {
	matrixEl = document.getElementById("matrix");
	simplifyMatrix = document.getElementById("simplifyMatrix");
	simplifyMatrix.onclick = simplifyA;
	matrixOutputEl = document.getElementById("output");
	Error.init();
}

function simplifyA() {
	let mat = new Matrix();
	mat.copy(model.A);
	for (let i = 0; i < mat.height; i++)
		mat.items[i][mat.width] = i + 1;
	let lastLine = [];
	for (let j = 0; j < mat.width + 1; j++)
		if (j === mat.width)
			lastLine[j] = NaN;
		else
			lastLine[j] = (j + 1);
	mat.items[mat.height] = (lastLine);
	mat.width = mat.width + 1;
	mat.height = mat.height + 1;
	matrixOutputEl.value = mat.toString(0);
}

function simplifyIteration(m) {
	/*let sim = false;
	let remRows = [];	
	for(let i = 0; i < m.height - 1; i++)
		for(let k = 0; k < m.height - 1; k++)
			if(i!=k){
				for(let j = 0; j < m.width - 1; j++)
					if(m[i][j]>=
			}
	return sim;*/
}

//matrix input
function inputChanged(inputEl) {
	let matStr = inputEl.value;
	if (matStr.slice(-1) === ";") //auto newline
	{
		inputEl.value += "\r\n";
		matStr = inputEl.value;
	}
	model.A = parseMatrix(matStr);
}