import Matrix from "../Math/Matrix";
import { Tableau, SimplexLog } from "../Math/Simplex";
import { normalizedNumber } from "./Format";

export function matrixToTable(m: Matrix): HTMLTableElement {
    let digits = 3;
    let table = document.createElement("table");
    for (let i = 0; i < m.height; i++) {
        let row = document.createElement("tr");
        for (let j = 0; j < m.width; j++) {
            let cell = document.createElement("td");
            let val = m.items[i][j];
            if (!isNaN(val)) {
                cell.innerHTML = normalizedNumber(val, digits);
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

export function tableauWithDeltasAndPivotToTable(t: Tableau, deltas: Matrix, pivotIndexes: [number, number] | null): HTMLTableElement {
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
                    cell.setAttribute("rowspan", "2");

                if (j === 3) {
                    cell.innerHTML = "c";
                    cell.setAttribute("colspan", "2");
                }
                if (j === 4) continue;
                if (j >= (colShift + 1)) {
                    cell.innerHTML = normalizedNumber(t.C.items[0][j - (colShift + 1)]);
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
                    cell.innerHTML = normalizedNumber(i + 1 - rowShift);
                let bIndex = t.B.items[0][i - rowShift];
                if (j === 1) {
                    cell.innerHTML = normalizedNumber(bIndex);
                    cell.setAttribute("class", "num");
                }
                if (j === 2) {
                    cell.innerHTML = normalizedNumber(t.C.items[0][bIndex - 1]);
                    cell.setAttribute("class", "num");
                }
                if (j === 3)
                    cell.innerHTML = "x" + bIndex;
                if (j >= colShift) {
                    let val = t.A.items[i - rowShift][j - colShift];
                    cell.innerHTML = normalizedNumber(val);
                    cell.setAttribute("class", "num");
                    if (pivotIndexes
                        && pivotIndexes[0] === i - rowShift
                        && pivotIndexes[1] === j - colShift) {
                        cell.classList.add("pivot")
                    }
                }
            }
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    let deltasRow = document.createElement("tr");
    let deltasCell = document.createElement("td");
    deltasCell.colSpan = 5;
    deltasCell.innerHTML = "deltas:";
    deltasRow.appendChild(deltasCell);
    for (let j = 0; j < deltas.width; j++) {
        let cell = document.createElement("td");
        cell.innerHTML = normalizedNumber(deltas.items[0][j]);
        cell.setAttribute("class", "num");
        deltasRow.appendChild(cell);
    }
    table.appendChild(deltasRow);
    return table;
}

export function printSimplexLog(log: SimplexLog, el: HTMLElement): void {
    label(el, "=================================");
    let fn = `${log.problemType} f(x) = `;
    for (let i = 0; i < log.problemMatrix.width; i++) {
        if (i > 0) fn += " + ";
        fn += log.problemMatrix.items[0][i] + "&times;X" + (i + 1);
    }
    label(el, fn + " ;");
    for (let it = 0; it < log.iterations.length; it++) {
        let iteration = log.iterations[it];
        label(el, "----------------------------");
        label(el, "Iteration " + it + ":");
        el.appendChild(tableauWithDeltasAndPivotToTable(iteration.table, iteration.deltas, iteration.pivot));
        if (iteration.comment) {
            label(el, `Comment: ${iteration.comment}`);
        }
        if (iteration.x && iteration.fx) {
            label(el, "x* = ");
            el.appendChild(matrixToTable(iteration.x));
            label(el, "f(x*) = ");
            el.appendChild(matrixToTable(new Matrix([[iteration.fx]])));
        }
    }
}

function label(el: HTMLElement, string: string) {
    let lbl = document.createElement("label");
    lbl.setAttribute("class", "log");
    lbl.innerHTML = string;
    el.appendChild(lbl);
}