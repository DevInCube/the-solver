function matrixToTable(m) {
	let digits = 3;
	let table = document.createElement("table");
	for (let i = 0; i < m.height; i++) {
		let row = document.createElement("tr");
		for (let j = 0; j < m.width; j++) {
			let cell = document.createElement("td");
			let val = m.items[i][j];
			if (!isNaN(val)) {
				cell.innerHTML = +parseFloat(Math.round(val * 1000) / 1000).toFixed(digits);
				cell.setAttribute("class", "num");
			}
			else
				cell.innerHTML = "---";
			row.appendChild(cell);
		}
		table.appendChild(row);
	}
	return table;
};