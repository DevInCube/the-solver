
var Matrix = function(){

	this.width = 0;
	this.height = 0;
	this.items = null;
	this.valid = false;
	
	this.copy = function(m){
		this.width = m.width;
		this.height = m.height;
		this.items = [];
		for(var i = 0;i < this.height; i++){
			this.items[i] = [];
			for(var j = 0; j < this.width; j++)
				this.items[i][j] = m.items[i][j];
		}
		this.valid = m.valid;
	}
	
	this.toString = function(digits){
		var toInt = digits == 0;
		if(!toInt)
			digits = digits || 3;
		var result = "";
		for (var i = 0; i < this.height; i++) {
			for (var j = 0; j < this.width; j++) {
				var item;
				if(toInt)
					item = parseInt(this.items[i][j]);
				else
					item = +parseFloat(Math.round(this.items[i][j] * 1000) / 1000).toFixed(digits);
				result += item;
				if(j < this.width-1) result += " , "
			}
			result += ";\n";
		}
		return result;
	};
	
	this.toTable = function(){
		var digits = 3;
		var table = document.createElement("table");
		for(var i = 0; i < this.height; i++){
			var row = document.createElement("tr");
			for(var j = 0; j < this.width;j++){
				var cell = document.createElement("td");
				var val	= this.items[i][j];
				if(!isNaN(val)) {
					cell.innerHTML = +parseFloat(Math.round(val * 1000) / 1000).toFixed(digits);
					cell.setAttribute("class","num");	
				}
				else
					cell.innerHTML = "---";
				row.appendChild(cell);
			}
			table.appendChild(row);
		}
		return table;
	};
};

//returns Matrix instance parsed from string
function parseMatrix(str){
	var m = new Matrix();
	if (!str) {
		return m;
	}
	var lines = str.match(/[^\r\n]+/g);
	var height = lines.length;
	var width = -1;
	var matrix = new Array(height);
	for (var i = 0; i < height; i++) {
		var items = lines[i].match(/[+\-0-9\.]+/g);
		var thisWidth = items.length;
		if(width == -1) width = thisWidth;
		else if (width != thisWidth) {
			return m;
		}
		matrix[i] = new Array(width);
		for (var j = 0; j < width; j++) {
			matrix[i][j] = items[j];
		}
	}
	m.width = width;
	m.height = height;
	m.items = matrix;
	m.valid = true;
	return m;
}