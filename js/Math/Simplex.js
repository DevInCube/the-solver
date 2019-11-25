var errorListEl;
var errEl;
var matrixInputEl;
var matrixOutputEl;
var elEl;
var cInputEl;
var bInputEl;
var deltaOutputEl;
var runEl;
var runDeltasEl;
var basisRowsEl;

var model = {
	A : new Matrix(),
	C : new Matrix(),
	B : new Matrix(),
	E : new Matrix()
};
let modelProxy = null;

window.onload = function(){
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
	runDeltasEl = document.getElementById("run2Btn");
	basisRowsEl = document.getElementById("basisRows");
	modelProxy = new Proxy(model, function(e){
		runEl.disabled = !(model.A.valid && model.E.valid);
		runDeltasEl.disabled = !(model.A.valid && model.B.valid && model.C.valid);
		checkBegin();
		if(!model.A.valid) addError("invalid matrix");
		if(model.A.valid){
			if(model.C.width != model.A.width - 1) addError("c.length != matrix.width - 1");
			if(model.B.width != model.A.height) addError("basis length != matrix.height");
			for(var i=0; i<model.B.width; i++){
				var bi = model.B.items[i];
				if(bi<0 || bi>model.C.width) addError("invalid basis element: "+bi);
			}
			if(model.E.width < 2) addError("position should have 2 values");
			if(model.E.valid && model.E.width >= 2){
				if(model.E.items[0][0] > model.A.height - 1)
					addError("invalid l element position: " + model.E.items[0][0]);
				if(model.E.items[0][1] > model.A.width - 1)
					addError("invalid r element position: " + model.E.items[0][1]);
			}
		}
		checkEnd();
	});
	console.log('loaded;');
}


function addError(msg){
	var item = document.createElement("li");
	item.innerHTML = msg;
	errorListEl.appendChild(item);
}

function checkBegin(){
	while(errorListEl.children.length > 0)
		errorListEl.removeChild(errorListEl.lastChild);
}

function checkEnd(){
	errEl.style.opacity = (errorListEl.children.length == 0) ? 0 : 0.9;
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
//C-vector input
function cInputChanged(cInputEl){
	model.C = parseMatrix(cInputEl.value);
}
//B-vector input
function bInputChanged(bInputEl){
	model.B = parseMatrix(bInputEl.value);
}
//E-vector input
function eInputChanged(eInputEl){
	model.E = parseMatrix(eInputEl.value);
}

function mathRun(){
	var pi = model.E.items[0][0];
	var pj = model.E.items[0][1];
	var B = transform(model.A, pi, pj);
	var result = "";
	for (var i = 0; i < B.height; i++) {
		for (var j = 0; j < B.width; j++) {
		    var item = parseFloat(Math.round(B.items[i][j] * 1000) / 1000).toFixed(3);
			result += item;
			if(j < B.width-1) result += " , "
		}
		result += ";\n";
	}
	matrixOutputEl.value = result;
}

// m - Matrix, pi, pj - int
function transform(m, pi, pj){
	if( !m.valid ) console.log('transform: invalid matrix');
	var El = m.items[pi][pj];
	var res = new Matrix();
	res.width = m.width;
	res.height = m.height;
	res.valid = m.valid;
	res.items = new Array(m.height);
	for (var i = 0; i < m.height; i++) {
		res.items[i] = new Array(m.width);
		for (var j = 0; j < m.width; j++) {
			if(i == pi){
				res.items[i][j] = m.items[i][j] / El;
			}else{
				res.items[i][j] = m.items[i][j] - m.items[pi][j] * m.items[i][pj] / m.items[pi][pj];
			}
		}
	}
	return res;
}

function calcDeltas(){
	deltaOutputEl.value = "";
	for(var j = 0; j < model.C.width; j++){
		var delta = 0;
		for(var bi = 0 ; bi < model.B.width; bi++){
			var s = model.B.items[0][bi] - 1;
			var cs = model.C.items[0][s];
			var asj = model.A.items[bi][j + 1]
			delta += cs * asj;
		}
		var cj = model.C.items[0][j];
		delta -= cj;
		deltaOutputEl.value += delta + ", ";
	}
}

function moveUp(){
	matrixInputEl.value = matrixOutputEl.value;
	matrixOutputEl.value = "";
	inputChanged(matrixInputEl);
}

function setSelectRange(select, maxVal){
	var numChildren = select.children.Length;
	for(var i = 0; i < maxVal;i++){
		var opt = select.children[i];
		if (opt == null) {
			opt = document.createElement("option");
			opt.value = i;
			opt.textContent = i + 1;
			select.appendChild(opt);
		}
	}
	while(select.children.length > maxVal)
		select.removeChild(select.lastChild);
	select.disabled = maxVal == 0;
}

function bindMobileHardwareBtn(){
	
	document.addEventListener('keydown', function(e){
		if(e.keyCode == 27) //back btn
		{
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

function runSimplex(cIn, bIn, aIn, out){
	var cEl = document.getElementById(cIn);
	var bEl = document.getElementById(bIn);
	var aEl = document.getElementById(aIn);
	var outEl = document.getElementById(out);
	var table = new SimplexTable();
	var A = parseMatrix(aEl.value);
	var b = parseMatrix(bEl.value);
	var c = parseMatrix(cEl.value);
	var table = new SimplexTable(A,b,c);
	outEl.innerHTML = "";
	Error.init();
	Error.check(function(){		
		if(!table.A.valid) Error.add("A is invalid");
		if(!table.B.valid) Error.add("A is invalid");
		if(!table.C.valid) Error.add("A is invalid");				
		if( table.B.width != table.A.height ) Error.add("B length != A height");
		if(	table.C.width != table.A.width - 1) Error.add("C length != A.width - 1");	
		for(var i = 0; i < table.B.width; i++)
			if((table.B.items[0][i] - 1) >= table.C.width) {
				Error.add("B element {"+table.B.items[0][i]+"} is more than C length");
				break;
			}
	});
	if(!Error.hasErrors())
		doSimplex(table, outEl);
}
function testSimplex(){	
	
	var A = new Matrix();
	A.width = 7;
	A.height = 3;
	A.items = [
		[31,32,82,41,1,0,0],
		[-6,-8,-1,91,0,1,0],
		[87,7,73,-9,0,0,1]
	];
	var b = new Matrix();
	b.width = 3;
	b.height = 1;
	b.items = [
		[4,5,6]
	];
	var c = new Matrix();
	c.width = 6;
	c.height = 1;
	c.items = [
		[-54,-58,-64,0,0,0]
	];
	var resEl = document.getElementById("testRes");
	var table = new SimplexTable(A,b,c);
	doSimplex(table, resEl);		
}

function SimplexTable(A, b, c) {

	this.A = A;
	this.B = b;
	this.C = c;
	
	this.toString = function(){
		var str = "";
		str+="c (fn koefs):\r\n"+this.C.toString()+"\r\n";
		str+="b (basis indexes):\r\n"+this.B.toString()+"\r\n";
		str+="A (table):\r\n"+this.A.toString()+"\r\n";			
		return str;
	};
	
	this.toTable = function(){
		var rowShift = 2;
		var colShift = 4;
		var n = this.B.width + rowShift;
		var m = this.A.width + colShift;
		var table = document.createElement("table");
		for(var i = 0; i < n; i++){
			var row = document.createElement("tr");
			for(var j = 0; j < m;j++){
				var cell = document.createElement("td");
				if(i == 0) {
					if(j == 0)
						cell.innerHTML = "i";					
					if(j == 1)
						cell.innerHTML = "s";
					if(j == 2)
						cell.innerHTML = "cB";
					if(j < 3) 
						cell.setAttribute("rowspan", 2);
					
					if(j == 3) {
						cell.innerHTML = "c";
						cell.setAttribute("colspan", 2);
					}
					if(j == 4) continue;
					if(j >= (colShift + 1)) {
						cell.innerHTML = this.C.items[0][j - (colShift + 1)];
						cell.setAttribute("class","num");
					}
				}
				if(i == 1) {
					if(j < 3) continue;
					if(j == 3)
						cell.innerHTML = "bX";
					if(j >= colShift)
						cell.innerHTML = "P"+(j-4);
				}				
				if(i >= rowShift) {
					if(j == 0)
						cell.innerHTML = i + 1 - rowShift;
					var bIndex = this.B.items[0][i - rowShift];
					if(j == 1) { 
						cell.innerHTML = bIndex;
						cell.setAttribute("class","num");
					}
					if(j == 2) {
						cell.innerHTML = this.C.items[0][bIndex - 1];
						cell.setAttribute("class","num");
					}
					if(j == 3)
						cell.innerHTML = "x"+bIndex;
					if(j >= colShift) { 
						var val = this.A.items[i - rowShift][j - colShift];
						val = +parseFloat(Math.round(val * 1000) / 1000).toFixed(3);
						cell.innerHTML = val;
						cell.setAttribute("class","num");
					}
				}
				row.appendChild(cell);
			}
			table.appendChild(row);
		}
		return table;
	};
}

function label(el, string){
	var lbl = document.createElement("label");
	lbl.setAttribute("class","log");
	lbl.innerHTML = string;
	el.appendChild(lbl);
}

/*
-6,10,0,0,0,0
4,5,6
-6,-12,-7,-3,1,0,0
10,-7,-13,2,0,1,0
13,3,-2,0,0,0,1
*/

// A - matrix
// b - basis index vector
// c - vector
// log - string
function doSimplex(table, el){		
	label(el, "=================================");
	var fn = "max f(x) = ";
	for(var i = 0; i < table.C.width; i++){
		if(i > 0) fn += " + ";
		fn += table.C.items[0][i] + "&times;X" + (i + 1);
	}
	label(el, fn + " ;");
	var it = 0;
	while(true) {
		label(el, "----------------------------");
		label(el, "Iteration " + it + ":");				
		el.appendChild( table.toTable() );
		var minusRowIndex = -1;
		for(var i = 0; i < table.A.height; i++){
			if(table.A.items[i][0] < 0){
				minusRowIndex = i;
				break;
			}
		}
		if(minusRowIndex == -1) {
			label(el, "=================================");
			label(el, "No minus elements.");			
			var x = new Matrix();
			x.width = table.C.width;
			x.height = 1;
			x.items = [[]];
			for(var i = 0; i < table.C.width; i++) {
				x.items[0][i] = 0;
			}
			for(var i = 0; i < table.B.width; i++) {
				var index = table.B.items[0][i];
				x.items[0][index-1] = table.A.items[i][0];
			}
			label(el, "x* = ");
			el.appendChild(x.toTable());						
			var res = 0;
			for(var i = 0; i < table.C.width; i++)
				res += table.C.items[0][i] * x.items[0][i];
			label(el, "f(x*) = "+res);
			return; //end
		}
		else {
			var deltas = getDeltas(table);
			label(el, "deltas = ");
			el.appendChild(deltas.toTable());			
			var gammas = new Matrix();
			gammas.width = table.C.width;
			gammas.height = 1;
			gammas.items = [[]];
			var minGamma = Infinity;
			var minGammaIndex = -1;
			var hasMinusInRow = false;
			for(var j = 1; j < table.A.width; j++){
				var rowX = table.A.items[minusRowIndex][j];
				if(rowX < 0) {
					hasMinusInRow = true;
					var gamma = -(deltas.items[0][j - 1] / rowX)
					gammas.items[0][j - 1] = gamma;
					if(gamma < minGamma && gamma > 0) {
						minGamma = gamma;
						minGammaIndex = j;
					}
				}
				else
					gammas.items[0][j - 1] = NaN;
			}
			if(!hasMinusInRow) {
				label(el, "=================================");
				label(el, "Has no minuses in minus row. Problem can not be solved");
				return; //end
			}
			label(el, "gammas = ");
			el.appendChild(gammas.toTable());			
			table.A = transform(table.A, minusRowIndex, minGammaIndex);
			table.B.items[0][minusRowIndex] = minGammaIndex;		
		}
		it++;
	}	
}

function getDeltas(table){	
	var deltas = new Matrix();
	deltas.width = table.C.width;
	deltas.height = 1;
	deltas.items = [[]];
	for(var j = 0; j < table.C.width; j++){
		var delta = 0;
		for(var bi = 0 ; bi < table.B.width; bi++){
			var s = table.B.items[0][bi] - 1;
			var cs = table.C.items[0][s];
			var asj = table.A.items[bi][j + 1]
			delta += cs * asj;
		}
		var cj = table.C.items[0][j];
		delta -= cj;
		deltas.items[0][j] = delta;
	}
	return deltas;
}