function tableauToTable(t) {
    let rowShift = 2;
	let colShift = 4;
	let n = t.B.width + rowShift;
	let m = t.A.width + colShift;
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
					cell.innerHTML = t.C.items[0][j - (colShift + 1)];
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
				let bIndex = t.B.items[0][i - rowShift];
				if (j === 1) {
					cell.innerHTML = bIndex;
					cell.setAttribute("class", "num");
				}
				if (j === 2) {
					cell.innerHTML = t.C.items[0][bIndex - 1];
					cell.setAttribute("class", "num");
				}
				if (j === 3)
					cell.innerHTML = "x" + bIndex;
				if (j >= colShift) {
					let val = t.A.items[i - rowShift][j - colShift];
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
}