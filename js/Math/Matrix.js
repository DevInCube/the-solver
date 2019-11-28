
function Matrix(items = null) {

	this.height = items ? items.length : 0;
	this.width = items ? items[0].length : 0;
	this.items = items;
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

Matrix.prototype.clone = function () {
	let clone = new Matrix();
	clone.copy(this);
	return clone;
}

function createMatrix(jsarr) {
	let m = new Matrix(jsarr)
	m.valid = true
	return m
}

function createArray(height, width) {
	let m = new Array(height)
	for (let i = 0; i < height; i++)
		m[i] = new Array(width)
	return m
}