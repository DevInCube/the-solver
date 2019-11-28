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
    var Matrix_1, Tableau;
    var __moduleName = context_2 && context_2.id;
    function doSimplex(table) {
        return {
            problem: table.C.clone(),
            iterations: doIterations(),
        };
        function doIterations() {
            let iterations = [];
            while (true) {
                let iteration = {
                    table: table.clone(),
                };
                iterations.push(iteration);
                let minusRowIndex = firstNegativeRowIndex(table);
                iteration.minusRowIndex = minusRowIndex;
                if (minusRowIndex === -1) {
                    let x = new Matrix_1.default([Array(table.C.width).fill(0)]);
                    for (let i = 0; i < table.B.width; i++) {
                        let index = table.B.items[0][i];
                        x.items[0][index - 1] = table.A.items[i][0];
                    }
                    iteration.x = x.clone();
                    break; // stop, completed.
                }
                else {
                    let deltas = getDeltas(table);
                    let gammasData = getGammasData(table, minusRowIndex, deltas);
                    iteration.deltas = deltas.clone();
                    iteration.gammasData = {
                        gammas: gammasData.gammas.clone(),
                        minGammaIndex: gammasData.minGammaIndex,
                        hasMinusInRow: gammasData.hasMinusInRow,
                    };
                    if (!gammasData.hasMinusInRow) {
                        break; // stop, can't be solved.
                    }
                    table.A = transform(table.A, minusRowIndex, gammasData.minGammaIndex);
                    table.B.items[0][minusRowIndex] = gammasData.minGammaIndex;
                }
            }
            return iterations;
        }
        function firstNegativeRowIndex(table) {
            for (let i = 0; i < table.A.height; i++) {
                if (table.A.items[i][0] < 0) {
                    return i;
                }
            }
            return -1;
        }
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
    function getDeltas(table) {
        let deltas = Matrix_1.default.create(1, table.C.width);
        for (let j = 0; j < table.C.width; j++) {
            let delta = 0;
            for (let bi = 0; bi < table.B.width; bi++) {
                let s = table.B.items[0][bi] - 1;
                let cs = table.C.items[0][s];
                let asj = table.A.items[bi][j + 1];
                delta += cs * asj;
            }
            let cj = table.C.items[0][j];
            delta -= cj;
            deltas.items[0][j] = delta;
        }
        return deltas;
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
System.register("UI/DomOutput", ["UI/Format"], function (exports_4, context_4) {
    var Format_1;
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
                    }
                }
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
        return table;
    }
    exports_4("tableauToTable", tableauToTable);
    function printSimplexLog(log, el) {
        label(el, "=================================");
        let fn = "max f(x) = ";
        for (let i = 0; i < log.problem.width; i++) {
            if (i > 0)
                fn += " + ";
            fn += log.problem.items[0][i] + "&times;X" + (i + 1);
        }
        label(el, fn + " ;");
        for (let it = 0; it < log.iterations.length; it++) {
            let iteration = log.iterations[it];
            label(el, "----------------------------");
            label(el, "Iteration " + it + ":");
            el.appendChild(tableauToTable(iteration.table));
            if (iteration.minusRowIndex === -1) {
                if (!iteration.x)
                    throw new Error(`Invalid log: missing x`);
                label(el, "=================================");
                label(el, "No negative elements.");
                label(el, "x* = ");
                el.appendChild(matrixToTable(iteration.x));
                let res = 0;
                for (let i = 0; i < iteration.table.C.width; i++)
                    res += iteration.table.C.items[0][i] * iteration.x.items[0][i];
                label(el, "f(x*) = " + res);
            }
            else {
                if (!iteration.deltas)
                    throw new Error(`Invalid log: missing deltas`);
                if (!iteration.gammasData)
                    throw new Error(`Invalid log: missing gammasData`);
                label(el, "deltas = ");
                el.appendChild(matrixToTable(iteration.deltas));
                if (!iteration.gammasData.hasMinusInRow) {
                    label(el, "=================================");
                    label(el, "Has no negatives in negative row. Problem can not be solved.");
                    return; //end
                }
                label(el, "gammas = ");
                el.appendChild(matrixToTable(iteration.gammasData.gammas));
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
            function (Format_1_1) {
                Format_1 = Format_1_1;
            }
        ],
        execute: function () {
            ;
        }
    };
});
System.register("Test/Test", ["Math/Simplex", "UI/DomOutput", "UI/Format"], function (exports_5, context_5) {
    var Simplex_1, DomOutput_1, Format_2, testData;
    var __moduleName = context_5 && context_5.id;
    function testSimplex(index = 0) {
        let A = Format_2.parseMatrix(testData[index].AString);
        let b = Format_2.parseMatrix(testData[index].BString);
        let c = Format_2.parseMatrix(testData[index].CString);
        let table = new Simplex_1.Tableau(A, b, c);
        let log = Simplex_1.doSimplex(table);
        let resEl = document.getElementById("testRes");
        DomOutput_1.printSimplexLog(log, resEl);
    }
    exports_5("testSimplex", testSimplex);
    return {
        setters: [
            function (Simplex_1_1) {
                Simplex_1 = Simplex_1_1;
            },
            function (DomOutput_1_1) {
                DomOutput_1 = DomOutput_1_1;
            },
            function (Format_2_1) {
                Format_2 = Format_2_1;
            }
        ],
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
                }
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
    var Test_1, Simplex_2, Errors_1, Matrix_3, DomOutput_2, Format_3, matrixInputEl, matrixOutputEl, elEl, cInputEl, bInputEl, deltaOutputEl, runEl, runDeltasEl, modelProxyHandler, model, runSimplexBtn, moveUpEl, setTestEls;
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
    //E-vector input
    function eInputChanged(el) {
        model.EString = el.value;
    }
    function mathRun() {
        let pi = model.E.items[0][0];
        let pj = model.E.items[0][1];
        let T = Simplex_2.transform(model.A, pi, pj);
        matrixOutputEl.value = Format_3.formatMatrix(T);
    }
    function printDeltas() {
        let deltas = Simplex_2.getDeltas(new Simplex_2.Tableau(model.A, model.B, model.C));
        deltaOutputEl.value = deltas.items[0].reduce((a, delta) => a += delta + ", ", "");
    }
    function moveUp() {
        matrixInputEl.value = matrixOutputEl.value;
        matrixOutputEl.value = "";
        // inputChanged(matrixInputEl); // @todo
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
        let A = Format_3.parseMatrix(aEl.value);
        let b = Format_3.parseMatrix(bEl.value);
        let c = Format_3.parseMatrix(cEl.value);
        return new Simplex_2.Tableau(A, b, c);
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
        let outEl = document.getElementById(out);
        let table = getSimplexTable(cIn, bIn, aIn);
        outEl.innerHTML = "";
        checkSimplexTable(table);
        if (!Errors_1.default.hasErrors()) {
            let log = Simplex_2.doSimplex(table);
            DomOutput_2.printSimplexLog(log, outEl);
        }
    }
    // test
    function setTestData(index = 0) {
        matrixInputEl.value = Test_1.testData[index].AString;
        cInputEl.value = Test_1.testData[index].CString;
        bInputEl.value = Test_1.testData[index].BString;
        elEl.value = "0,0";
        //
        cInputEl.dispatchEvent(new Event('keyup'));
        bInputEl.dispatchEvent(new Event('keyup'));
        matrixInputEl.dispatchEvent(new Event('keyup'));
        elEl.dispatchEvent(new Event('keyup'));
    }
    return {
        setters: [
            function (Test_1_1) {
                Test_1 = Test_1_1;
            },
            function (Simplex_2_1) {
                Simplex_2 = Simplex_2_1;
            },
            function (Errors_1_1) {
                Errors_1 = Errors_1_1;
            },
            function (Matrix_3_1) {
                Matrix_3 = Matrix_3_1;
            },
            function (DomOutput_2_1) {
                DomOutput_2 = DomOutput_2_1;
            },
            function (Format_3_1) {
                Format_3 = Format_3_1;
            }
        ],
        execute: function () {
            console.log('loaded;');
            modelProxyHandler = {
                set: function (target, propKey, propValue) {
                    if (["AString", "BString", "CString", "EString"].includes(propKey)) {
                        const matrix = Format_3.parseMatrix(propValue);
                        model[propKey.charAt(0)] = matrix;
                        console.table(matrix.items);
                    }
                    console.log('proxy set;');
                    runEl.disabled = !(model.A.valid && model.E.valid);
                    runDeltasEl.disabled = !(model.A.valid && model.B.valid && model.C.valid);
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
                            if (model.E.width < 2)
                                Errors_1.default.add("position should have 2 values");
                            if (model.E.valid && model.E.width >= 2) {
                                if (model.E.items[0][0] > model.A.height - 1)
                                    Errors_1.default.add("invalid l element position: " + model.E.items[0][0]);
                                if (model.E.items[0][1] > model.A.width - 1)
                                    Errors_1.default.add("invalid r element position: " + model.E.items[0][1]);
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
                EString: "",
                //
                A: new Matrix_3.default(),
                C: new Matrix_3.default(),
                B: new Matrix_3.default(),
                E: new Matrix_3.default()
            }, modelProxyHandler);
            console.log('DOM fully loaded and parsed');
            bindMobileHardwareBtn();
            Errors_1.default.init();
            matrixInputEl = document.getElementById("input");
            matrixInputEl.addEventListener('keyup', inputChanged);
            matrixOutputEl = document.getElementById("output");
            elEl = document.getElementById("elEl");
            elEl.addEventListener('keyup', e => eInputChanged(e.target));
            cInputEl = document.getElementById("cInput");
            cInputEl.addEventListener('keyup', e => cInputChanged(e.target));
            bInputEl = document.getElementById("bInput");
            bInputEl.addEventListener('keyup', e => bInputChanged(e.target));
            deltaOutputEl = document.getElementById("deltaOutput");
            runEl = document.getElementById("runBtn");
            runEl.addEventListener('click', e => mathRun());
            runDeltasEl = document.getElementById("run2Btn");
            runDeltasEl.addEventListener('click', e => printDeltas());
            //
            runSimplexBtn = document.getElementById("runSimplex");
            runSimplexBtn.addEventListener("click", e => runSimplex('cInput', 'bInput', 'input', 'testRes'));
            //
            moveUpEl = document.getElementById("moveUpBtn");
            moveUpEl.addEventListener('click', e => moveUp());
            setTestEls = document.getElementsByClassName("setTest");
            for (let setTestEl of setTestEls)
                setTestEl.addEventListener("click", e => setTestData(Number(e.target.getAttribute("data-index"))));
            //
            cInputEl.dispatchEvent(new Event('keyup'));
            bInputEl.dispatchEvent(new Event('keyup'));
            matrixInputEl.dispatchEvent(new Event('keyup'));
            elEl.dispatchEvent(new Event('keyup'));
            //
            console.log('inited;');
        }
    };
});
//# sourceMappingURL=app.js.map