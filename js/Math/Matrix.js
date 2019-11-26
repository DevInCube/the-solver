
function Matrix() {

	this.width = 0;
	this.height = 0;
	this.items = null;
	this.valid = false;
}

Matrix.prototype.copy = function (m) {

	this.width = m.width;
	this.height = m.height;
	this.items = createArray(m.height, m.width);
	for (let i = 0; i < this.height; i++)
		for (let j = 0; j < this.width; j++)
			this.items[i][j] = m.items[i][j];
	this.valid = m.valid;
}

Matrix.prototype.toString = function (digits) {
	let toInt = digits === 0;
	if (!toInt)
		digits = digits || 3;
	let result = "";
	for (let i = 0; i < this.height; i++) {
		for (let j = 0; j < this.width; j++) {
			let item;
			if (toInt)
				item = parseInt(this.items[i][j]);
			else
				item = +parseFloat(Math.round(this.items[i][j] * 1000) / 1000).toFixed(digits);
			result += item;
			if (j < this.width - 1) result += " , "
		}
		result += ";\n";
	}
	return result;
};

function createMatrix(jsarr) {
	let m = new Matrix();
	m.width = jsarr[0].length;
	m.height = jsarr.length;
	m.items = jsarr;
	m.valid = true;
	return m;
}

function createArray(height, width)
{
	let m = new Array(height)
	for (let i = 0; i < height; i++)
		m[i] = new Array(width)
	return m
}