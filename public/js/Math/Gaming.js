
var matrixEl;
var simplifyMatrix;
var matrixOutputEl;

var model = {
	A : new Matrix()
}
let modelProxy = null;

window.onload = function(){
	matrixEl = document.getElementById("matrix");
	simplifyMatrix = document.getElementById("simplifyMatrix");
	simplifyMatrix.onclick = simplifyA;
	matrixOutputEl = document.getElementById("output");
	Error.init();
	modelProxy = new Proxy(model, function(e){			
		simplifyMatrix.disabled = !(model.A.valid);
		Error.check(function(){			
			if(!model.A.valid) Error.add("invalid matrix");
			if(model.A.valid){
				//
			}
		});
	});
}

function simplifyA(){	
	var mat = new Matrix();
	mat.copy(model.A);	
	for(var i = 0; i < mat.height; i++)
		mat.items[i][mat.width] = i + 1;
	var lastLine = [];
	for(var j =0; j < mat.width + 1;j++)
		if( j == mat.width)
			lastLine[j] = NaN;
		else
			lastLine[j] = (j+1);
	mat.items[mat.height] = (lastLine);
	mat.width = mat.width + 1;
	mat.height = mat.height + 1;
	matrixOutputEl.value = mat.toString(0);
}

function simplifyIteration(m){
	/*var sim = false;
	var remRows = [];	
	for(var i = 0; i < m.height - 1; i++)
		for(var k = 0; k < m.height - 1; k++)
			if(i!=k){
				for(var j = 0; j < m.width - 1; j++)
					if(m[i][j]>=
			}
	return sim;*/
}

//matrix input
function inputChanged(inputEl){
	var matStr = inputEl.value;
	if(matStr.slice(-1) == ";") //auto newline
	{
		inputEl.value += "\r\n";
		matStr = inputEl.value;
	}
	model.A = parseMatrix(matStr);
}