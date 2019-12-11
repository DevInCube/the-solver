System.register("Math/Matrix", [], function (exports_1, context_1) {
    var Matrix;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            Matrix = class Matrix {
                constructor(items = [[]]) {
                    this.items = items;
                    this.valid = true;
                }
                get height() { return this.items ? this.items.length : 0; }
                get width() { return this.items && this.items[0] ? this.items[0].length : 0; }
                copy(m) {
                    this.items = m.items.map(row => row.slice());
                    this.valid = m.valid;
                }
                clone() {
                    let clone = new Matrix();
                    clone.copy(this);
                    return clone;
                }
                static create(height, width) {
                    return new Matrix(this.createArray(height, width));
                }
                static createArray(height, width) {
                    let m = new Array(height);
                    for (let i = 0; i < height; i++)
                        m[i] = new Array(width);
                    return m;
                }
            };
            exports_1("default", Matrix);
        }
    };
});
System.register("Math/Simplex", ["Math/Matrix"], function (exports_2, context_2) {
    var Matrix_1, Tableau, ProblemType, Problem;
    var __moduleName = context_2 && context_2.id;
    function getSolution(table) {
        // get result x*
        let x = new Matrix_1.default([Array(table.C.width).fill(0)]);
        for (let i = 0; i < table.B.width; i++) {
            let index = table.B.items[0][i];
            x.items[0][index - 1] = table.A.items[i][0];
        }
        //
        let res = 0;
        for (let i = 0; i < table.C.width; i++)
            res += table.C.items[0][i] * x.items[0][i];
        return { x: x, fx: res };
    }
    function doSimplex(problem) {
        const table = problem.table;
        let log = {
            problemType: problem.type,
            problemMatrix: table.C.clone(),
            iterations: []
        };
        let iIteration = 0;
        while (iIteration++ < 100) { // infinie loop constraint
            let iteration = {
                table: table.clone(),
            };
            log.iterations.push(iteration);
            //
            let deltas = getDeltas(table);
            iteration.deltas = deltas.clone(); // log line
            //
            let pj = -1; // pivot element column index
            if (problem.type === ProblemType.Max) {
                let negativeIndexes = [];
                for (let [i, val] of deltas.items[0].entries()) {
                    if (val < 0) {
                        negativeIndexes.push(i);
                    }
                }
                // if all positive or zero (max)
                if (negativeIndexes.length === 0) {
                    let { x, fx } = getSolution(table);
                    iteration.x = x;
                    iteration.fx = fx;
                    // stop iterations
                    break;
                }
                //
                // current solution is not optional yet.
                // the lesser of all the negatives is chosen (max)
                let maxAbsDeltaIndex = 0;
                for (let i = 1; i < negativeIndexes.length; i++) {
                    if (deltas.items[0][negativeIndexes[i]] < deltas.items[0][negativeIndexes[maxAbsDeltaIndex]]) {
                        maxAbsDeltaIndex = i;
                    }
                }
                pj = negativeIndexes[maxAbsDeltaIndex] + 1;
            }
            else if (problem.type === ProblemType.Min) {
                let positiveIndexes = [];
                for (let [i, val] of deltas.items[0].entries()) {
                    if (val > 0) {
                        positiveIndexes.push(i);
                    }
                }
                // if all negative or zero (min)
                if (positiveIndexes.length === 0) {
                    let { x, fx } = getSolution(table);
                    iteration.x = x;
                    iteration.fx = fx;
                    // stop iterations
                    break;
                }
                //
                // current solution is not optional yet.
                // the lesser of all the negatives is chosen (max)
                let maxAbsDeltaIndex = 0;
                for (let i = 1; i < positiveIndexes.length; i++) {
                    if (deltas.items[0][positiveIndexes[i]] > deltas.items[0][positiveIndexes[maxAbsDeltaIndex]]) {
                        maxAbsDeltaIndex = i;
                    }
                }
                pj = positiveIndexes[maxAbsDeltaIndex] + 1;
            }
            else {
                throw new Error(`Invalid problem type: ${problem.type}`);
            }
            // The row whose result is minimum score is chosen.
            let minDivValue = Number.MAX_VALUE;
            let minDivRowIndex = -1;
            for (let i = 0; i < table.A.height; i++) {
                let p0Value = table.A.items[i][0];
                let aElement = table.A.items[i][pj];
                if (p0Value > 0 && aElement > 0) {
                    let div = p0Value / aElement;
                    if (div < minDivValue) {
                        minDivValue = div;
                        minDivRowIndex = i;
                    }
                }
            }
            // This indicates that the problem is not limited and the solution will always be improved.
            if (minDivRowIndex < 0) {
                // @todo what?
                break;
                //throw new Error('maxDivRowIndex < 0')
            }
            // pivot element indexes
            let pi = minDivRowIndex;
            console.log(pi, pj);
            iteration.pivot = [pi, pj]; // log
            table.A = transform(table.A, pi, pj);
            // change basis
            table.B.items[0][pi] = pj;
        }
        return log;
    }
    exports_2("doSimplex", doSimplex);
    // m - Matrix, pi, pj - int
    function transform(m, pi, pj) {
        if (!m.valid)
            throw new Error(`transform: invalid matrix`);
        if (pi < 0 || pi >= m.height)
            throw new Error(`transform: invalid row index ${pi}`);
        if (pj < 0 || pj >= m.width)
            throw new Error(`transform: invalid column index ${pj}`);
        //
        let El = m.items[pi][pj]; // special element value
        if (El === 0)
            throw new Error(`transform: special element can not have zero value`);
        let res = Matrix_1.default.create(m.height, m.width);
        for (let i = 0; i < m.height; i++) {
            for (let j = 0; j < m.width; j++) {
                if (i === pi) {
                    res.items[i][j] = m.items[i][j] / El;
                }
                else {
                    res.items[i][j] = m.items[i][j] - m.items[pi][j] * m.items[i][pj] / El;
                }
            }
        }
        return res;
    }
    exports_2("transform", transform);
    function getGammasData(table, minusRowIndex, deltas) {
        let gammas = Matrix_1.default.create(1, table.C.width);
        let minGamma = Infinity;
        let minGammaIndex = -1;
        let hasMinusInRow = false;
        for (let j = 1; j < table.A.width; j++) {
            let rowX = table.A.items[minusRowIndex][j];
            if (rowX < 0) {
                hasMinusInRow = true;
                let gamma = -(deltas.items[0][j - 1] / rowX);
                gammas.items[0][j - 1] = gamma;
                if (gamma < minGamma && gamma > 0) {
                    minGamma = gamma;
                    minGammaIndex = j;
                }
            }
            else
                gammas.items[0][j - 1] = NaN;
        }
        return {
            gammas,
            minGammaIndex,
            hasMinusInRow,
        };
    }
    exports_2("getGammasData", getGammasData);
    // source: https://stackoverflow.com/a/19722641/6634744
    function round(n, places = 3) {
        const k = 10 ** places;
        return Math.round((n + Number.EPSILON) * k) / k;
    }
    function getDeltas(table) {
        let deltas = [NaN];
        let C = [NaN, ...table.C.items[0]];
        let a = table.A.items;
        let b = table.B.items[0];
        for (let j = 1; j < C.length; j++) {
            let deltaj = 0;
            for (let [i, s] of b.entries()) {
                let asj = a[i][j];
                let pj = asj;
                deltaj += C[s] * pj;
            }
            deltaj -= C[j];
            deltas[j] = round(deltaj);
        }
        return new Matrix_1.default([deltas.slice(1)]);
    }
    exports_2("getDeltas", getDeltas);
    return {
        setters: [
            function (Matrix_1_1) {
                Matrix_1 = Matrix_1_1;
            }
        ],
        execute: function () {
            Tableau = class Tableau {
                // A - matrix
                // b - basis index vector
                // c - vector
                constructor(A, B, C) {
                    this.A = A;
                    this.B = B;
                    this.C = C;
                }
                clone() {
                    return new Tableau(this.A.clone(), this.B.clone(), this.C.clone());
                }
            };
            exports_2("Tableau", Tableau);
            (function (ProblemType) {
                ProblemType["Max"] = "max";
                ProblemType["Min"] = "min";
            })(ProblemType || (ProblemType = {}));
            exports_2("ProblemType", ProblemType);
            Problem = class Problem {
                constructor(type, table) {
                    this.type = type;
                    this.table = table;
                }
            };
            exports_2("Problem", Problem);
        }
    };
});
System.register("UI/Format", ["Math/Matrix"], function (exports_3, context_3) {
    var Matrix_2;
    var __moduleName = context_3 && context_3.id;
    //returns Matrix instance parsed from string
    function parseMatrix(str) {
        let m = new Matrix_2.default();
        if (!str) {
            return m;
        }
        try {
            let arr = JSON.parse(str);
            return new Matrix_2.default(arr);
        }
        catch (err) {
            // custom format
            let matchLines = str.match(/[^\r\n]+/g);
            if (!matchLines)
                throw new Error(`Parse error: no lines`);
            let lines = matchLines.filter(x => !isBlank(x));
            console.log(lines);
            let height = lines.length;
            let width = -1;
            let matrix = new Array(height);
            for (let i = 0; i < height; i++) {
                let items = lines[i].match(/[+\-0-9\.]+/g);
                if (!items)
                    throw new Error(`Invalid matrix:\n${str}`);
                let thisWidth = items.length;
                if (width === -1)
                    width = thisWidth;
                else if (width !== thisWidth) {
                    return m;
                }
                matrix[i] = new Array(width);
                for (let j = 0; j < width; j++) {
                    matrix[i][j] = Number(items[j]);
                }
            }
            m.items = matrix;
            m.valid = true;
            return m;
            function isBlank(str) {
                return (!str || /^\s*$/.test(str));
            }
        }
    }
    exports_3("parseMatrix", parseMatrix);
    function formatMatrix(m, digits = 3) {
        let norm = normalizeMatrixOutput(m, digits);
        return norm.map(row => row.join(' , ')).join(';\n');
        function normalizeMatrixOutput(matrix, digits = 3) {
            let copy = Matrix_2.default.createArray(matrix.height, matrix.width);
            for (let i = 0; i < matrix.height; i++) {
                for (let j = 0; j < matrix.width; j++) {
                    copy[i][j] = normalizedNumber(Number(matrix.items[i][j]), digits);
                }
            }
            return copy;
        }
    }
    exports_3("formatMatrix", formatMatrix);
    function normalizedNumber(number, digits = 3) {
        let num = number;
        let fixed = num.toFixed(digits);
        num = Number(fixed);
        let frac = num - Math.trunc(num);
        return (num !== 0 && (frac !== 0)) ? fixed : num.toFixed(0);
    }
    exports_3("normalizedNumber", normalizedNumber);
    return {
        setters: [
            function (Matrix_2_1) {
                Matrix_2 = Matrix_2_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("UI/DomOutput", ["Math/Matrix", "UI/Format"], function (exports_4, context_4) {
    var Matrix_3, Format_1;
    var __moduleName = context_4 && context_4.id;
    function matrixToTable(m) {
        let digits = 3;
        let table = document.createElement("table");
        for (let i = 0; i < m.height; i++) {
            let row = document.createElement("tr");
            for (let j = 0; j < m.width; j++) {
                let cell = document.createElement("td");
                let val = m.items[i][j];
                if (!isNaN(val)) {
                    cell.innerHTML = Format_1.normalizedNumber(val, digits);
                    cell.setAttribute("class", "num");
                }
                else
                    cell.innerHTML = "---";
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
        return table;
    }
    exports_4("matrixToTable", matrixToTable);
    function tableauWithDeltasAndPivotToTable(t, deltas, pivotIndexes) {
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
                    if (j === 4)
                        continue;
                    if (j >= (colShift + 1)) {
                        cell.innerHTML = Format_1.normalizedNumber(t.C.items[0][j - (colShift + 1)]);
                        cell.setAttribute("class", "num");
                    }
                }
                if (i === 1) {
                    if (j < 3)
                        continue;
                    if (j === 3)
                        cell.innerHTML = "bX";
                    if (j >= colShift)
                        cell.innerHTML = "P" + (j - 4);
                }
                if (i >= rowShift) {
                    if (j === 0)
                        cell.innerHTML = Format_1.normalizedNumber(i + 1 - rowShift);
                    let bIndex = t.B.items[0][i - rowShift];
                    if (j === 1) {
                        cell.innerHTML = Format_1.normalizedNumber(bIndex);
                        cell.setAttribute("class", "num");
                    }
                    if (j === 2) {
                        cell.innerHTML = Format_1.normalizedNumber(t.C.items[0][bIndex - 1]);
                        cell.setAttribute("class", "num");
                    }
                    if (j === 3)
                        cell.innerHTML = "x" + bIndex;
                    if (j >= colShift) {
                        let val = t.A.items[i - rowShift][j - colShift];
                        cell.innerHTML = Format_1.normalizedNumber(val);
                        cell.setAttribute("class", "num");
                        if (pivotIndexes
                            && pivotIndexes[0] === i - rowShift
                            && pivotIndexes[1] === j - colShift) {
                            cell.classList.add("pivot");
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
            cell.innerHTML = Format_1.normalizedNumber(deltas.items[0][j]);
            cell.setAttribute("class", "num");
            deltasRow.appendChild(cell);
        }
        table.appendChild(deltasRow);
        return table;
    }
    exports_4("tableauWithDeltasAndPivotToTable", tableauWithDeltasAndPivotToTable);
    function printSimplexLog(log, el) {
        label(el, "=================================");
        let fn = `${log.problemType} f(x) = `;
        for (let i = 0; i < log.problemMatrix.width; i++) {
            if (i > 0)
                fn += " + ";
            fn += log.problemMatrix.items[0][i] + "&times;X" + (i + 1);
        }
        label(el, fn + " ;");
        for (let it = 0; it < log.iterations.length; it++) {
            let iteration = log.iterations[it];
            label(el, "----------------------------");
            label(el, "Iteration " + it + ":");
            el.appendChild(tableauWithDeltasAndPivotToTable(iteration.table, iteration.deltas, iteration.pivot));
            if (iteration.x && iteration.fx) {
                label(el, "x* = ");
                el.appendChild(matrixToTable(iteration.x));
                label(el, "f(x*) = ");
                el.appendChild(matrixToTable(new Matrix_3.default([[iteration.fx]])));
            }
        }
    }
    exports_4("printSimplexLog", printSimplexLog);
    function label(el, string) {
        let lbl = document.createElement("label");
        lbl.setAttribute("class", "log");
        lbl.innerHTML = string;
        el.appendChild(lbl);
    }
    return {
        setters: [
            function (Matrix_3_1) {
                Matrix_3 = Matrix_3_1;
            },
            function (Format_1_1) {
                Format_1 = Format_1_1;
            }
        ],
        execute: function () {
            ;
        }
    };
});
System.register("Test/Test", [], function (exports_5, context_5) {
    var testData;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [],
        execute: function () {
            exports_5("testData", testData = [
                {
                    AString: `31,32,82,41,1,0,0;
-6,-8,-1,91,0,1,0;
87,7,73,-9,0,0,1`,
                    BString: `4,5,6`,
                    CString: `-54,-58,-64,0,0,0`,
                },
                {
                    CString: `-6,10,0,0,0,0`,
                    BString: `4,5,6`,
                    AString: `-6,-12,-7,-3,1,0,0
10,-7,-13,2,0,1,0
13,3,-2,0,0,0,1`,
                },
                // "minus test"
                {
                    CString: `-54,-58,-64,0,0,0,0`,
                    BString: `4,1,6,7`,
                    AString: `7,0,78,405,1,4,0,0;
0.75,1,0.125,-11.375,0,-0.125,0,0;
37.75,0,72.125,70.625,0,0.875,1,0;
-0.75,0,-0.125,11.075,0,0.125,0,1`,
                },
                // normal
                {
                    CString: `-7,-10,-9,8,0,0,0`,
                    BString: `5,6,7`,
                    AString: `2,-4,6,9,5,1,0,0;
5,5,8,-6,-5,0,1,0;
4,-10,7,-2,-4,0,0,1`,
                },
                // normal (min)
                {
                    CString: `24,-59,-25,-71,0,0,0`,
                    BString: `5,6,7`,
                    AString: `16,-48,-84,-67,-37,1,0,0;
1,-34,-54,-66,-17,0,1,0;
16,11,8,21,14,0,0,1 `,
                },
                // normal (max)
                {
                    CString: `61,12,-13,-4,0,0,0`,
                    BString: `5,6,7`,
                    AString: `39,80,19,-25,22,1,0,0;
50,64,-32,37,78,0,1,0;
58,56,40,67,11,0,0,1 `,
                },
            ]);
        }
    };
});
System.register("UI/Errors", [], function (exports_6, context_6) {
    var Errors;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [],
        execute: function () {
            Errors = class Errors {
                static init() {
                    let error = this;
                    error.errEl = document.getElementById("error");
                    error.errorListEl = document.getElementById("errorList");
                    if (error.errEl && error.errorListEl)
                        error.errEl.onclick = (function () {
                            if (error.errorListEl && error.errorListEl) {
                                while (error.errorListEl.hasChildNodes()) {
                                    error.errorListEl.removeChild(error.errorListEl.lastChild);
                                }
                            }
                        });
                }
                static checkBegin() {
                    let error = this;
                    if (error.errorListEl && error.errorListEl)
                        while (error.errorListEl.children.length > 0)
                            error.errorListEl.removeChild(error.errorListEl.lastChild);
                }
                static add(msg) {
                    let item = document.createElement("li");
                    item.innerHTML = msg;
                    let error = this;
                    if (error.errorListEl)
                        error.errorListEl.appendChild(item);
                }
                static checkEnd() {
                    let error = this;
                    if (error.errEl && error.errorListEl)
                        error.errEl.style.opacity = ((error.errorListEl.children.length === 0) ? 0 : 0.9).toString();
                }
                static check(checkFun) {
                    this.checkBegin();
                    checkFun();
                    this.checkEnd();
                }
                static hasErrors() {
                    let error = this;
                    if (error.errorListEl)
                        return error.errorListEl.children.length > 0;
                    return false;
                }
            };
            Errors.errorListEl = null;
            Errors.errEl = null;
            exports_6("default", Errors);
        }
    };
});
System.register("main", ["Test/Test", "Math/Simplex", "UI/Errors", "Math/Matrix", "UI/DomOutput", "UI/Format"], function (exports_7, context_7) {
    var Test_1, Simplex_1, Errors_1, Matrix_4, DomOutput_1, Format_2, matrixInputEl, matrixOutputEl, cInputEl, bInputEl, modelProxyHandler, model, runSimplexBtn, setTestEls;
    var __moduleName = context_7 && context_7.id;
    //matrix input
    function inputChanged(ev) {
        const el = ev.target;
        let matStr = el.value;
        // add auto newline
        if (ev.key === ";") {
            el.value += "\r\n";
            matStr = el.value;
        }
        model.AString = matStr;
    }
    //C-vector input
    function cInputChanged(el) {
        model.CString = el.value;
    }
    //B-vector input
    function bInputChanged(el) {
        model.BString = el.value;
    }
    function bindMobileHardwareBtn() {
        document.addEventListener('keydown', function (e) {
            // back btn
            if (e.keyCode === 27) {
                alert('back');
                e.preventDefault();
            }
        });
    }
    function getSimplexTable(cIn, bIn, aIn) {
        let cEl = document.getElementById(cIn);
        let bEl = document.getElementById(bIn);
        let aEl = document.getElementById(aIn);
        let A = Format_2.parseMatrix(aEl.value);
        let b = Format_2.parseMatrix(bEl.value);
        let c = Format_2.parseMatrix(cEl.value);
        return new Simplex_1.Tableau(A, b, c);
    }
    function checkSimplexTable(table) {
        Errors_1.default.init();
        Errors_1.default.check(function () {
            if (!table.A.valid)
                Errors_1.default.add("A is invalid");
            if (!table.B.valid)
                Errors_1.default.add("B is invalid");
            if (!table.C.valid)
                Errors_1.default.add("C is invalid");
            if (table.B.width !== table.A.height)
                Errors_1.default.add(`B length (${table.B.width}) != A height (${table.A.height})`);
            if (table.C.width !== table.A.width - 1)
                Errors_1.default.add(`C length ${table.C.width} != A.width - 1 (${table.A.width - 1})`);
            for (let i = 0; i < table.B.width; i++)
                if ((table.B.items[0][i] - 1) >= table.C.width) {
                    Errors_1.default.add(`B element {${table.B.items[0][i]}} is greater than C length (${table.C.width})`);
                    break;
                }
        });
    }
    function runSimplex(cIn, bIn, aIn, out) {
        let type = document.getElementById("problem-type").value;
        console.log(type);
        let outEl = document.getElementById(out);
        let table = getSimplexTable(cIn, bIn, aIn);
        outEl.innerHTML = "";
        checkSimplexTable(table);
        if (!Errors_1.default.hasErrors()) {
            let log = Simplex_1.doSimplex(new Simplex_1.Problem(type, table));
            DomOutput_1.printSimplexLog(log, outEl);
        }
    }
    // test
    function setTestData(index = 0) {
        matrixInputEl.value = Test_1.testData[index].AString;
        cInputEl.value = Test_1.testData[index].CString;
        bInputEl.value = Test_1.testData[index].BString;
        //
        cInputEl.dispatchEvent(new Event('keyup'));
        bInputEl.dispatchEvent(new Event('keyup'));
        matrixInputEl.dispatchEvent(new Event('keyup'));
    }
    return {
        setters: [
            function (Test_1_1) {
                Test_1 = Test_1_1;
            },
            function (Simplex_1_1) {
                Simplex_1 = Simplex_1_1;
            },
            function (Errors_1_1) {
                Errors_1 = Errors_1_1;
            },
            function (Matrix_4_1) {
                Matrix_4 = Matrix_4_1;
            },
            function (DomOutput_1_1) {
                DomOutput_1 = DomOutput_1_1;
            },
            function (Format_2_1) {
                Format_2 = Format_2_1;
            }
        ],
        execute: function () {
            console.log('loaded;');
            modelProxyHandler = {
                set: function (target, propKey, propValue) {
                    if (["AString", "BString", "CString", "EString"].includes(propKey)) {
                        const matrix = Format_2.parseMatrix(propValue);
                        model[propKey.charAt(0)] = matrix;
                        console.table(matrix.items);
                    }
                    Errors_1.default.check(() => {
                        if (!model.A.valid)
                            Errors_1.default.add("invalid matrix (A)");
                        if (model.A.valid) {
                            if (model.C.width !== model.A.width - 1)
                                Errors_1.default.add(`c.length (${model.C.width}) != matrix.width - 1 (${model.A.width - 1})`);
                            if (model.B.width !== model.A.height)
                                Errors_1.default.add(`basis length (${model.B.width}) != matrix height (${model.A.height})`);
                            for (let i = 0; i < model.B.width; i++) {
                                let bi = model.B.items[i];
                                if (bi < 0 || bi > model.C.width)
                                    Errors_1.default.add("invalid basis element: " + bi);
                            }
                        }
                    });
                    //
                    target[propKey] = propValue;
                    return true;
                }
            };
            model = new Proxy({
                AString: "",
                CString: "",
                BString: "",
                //
                A: new Matrix_4.default(),
                C: new Matrix_4.default(),
                B: new Matrix_4.default(),
            }, modelProxyHandler);
            console.log('DOM fully loaded and parsed');
            bindMobileHardwareBtn();
            Errors_1.default.init();
            matrixInputEl = document.getElementById("input");
            matrixInputEl.addEventListener('keyup', inputChanged);
            matrixOutputEl = document.getElementById("output");
            cInputEl = document.getElementById("cInput");
            cInputEl.addEventListener('keyup', e => cInputChanged(e.target));
            bInputEl = document.getElementById("bInput");
            bInputEl.addEventListener('keyup', e => bInputChanged(e.target));
            //
            runSimplexBtn = document.getElementById("runSimplex");
            runSimplexBtn.addEventListener("click", e => runSimplex('cInput', 'bInput', 'input', 'testRes'));
            //
            setTestEls = document.getElementsByClassName("setTest");
            for (let setTestEl of setTestEls)
                setTestEl.addEventListener("click", e => setTestData(Number(e.target.getAttribute("data-index"))));
            //
            cInputEl.dispatchEvent(new Event('keyup'));
            bInputEl.dispatchEvent(new Event('keyup'));
            matrixInputEl.dispatchEvent(new Event('keyup'));
            //
            console.log('inited;');
            window.command = new class {
            };
        }
    };
});
//# sourceMappingURL=app.js.map