function testSimplex() {

	let A = createMatrix([
		[31, 32, 82, 41, 1, 0, 0],
		[-6, -8, -1, 91, 0, 1, 0],
		[87, 7, 73, -9, 0, 0, 1]
	])
	let b = createMatrix([
		[4, 5, 6]
	])
	let c = createMatrix([
		[-54, -58, -64, 0, 0, 0]
	])
	let resEl = document.getElementById("testRes");
	let table = new SimplexTable(A, b, c);
	doSimplex(table, resEl);
}