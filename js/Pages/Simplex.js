let errorListEl;
let errEl;
let matrixInputEl;
let matrixOutputEl;
let elEl;
let cInputEl;
let bInputEl;
let deltaOutputEl;
let runEl;
let runDeltasEl;
let basisRowsEl;

let modelProxyHandler = {
    set: function (target, propKey, propValue) {
        if (["AString", "BString", "CString", "EString"].includes(propKey)) {
            const matrix = parseMatrix(propValue)
            model[propKey.charAt(0)] = matrix
            console.table(matrix.items)
        }
        console.log('proxy set;')
        runEl.disabled = !(model.A.valid && model.E.valid);
        runDeltasEl.disabled = !(model.A.valid && model.B.valid && model.C.valid);
        checkBegin();
        if (!model.A.valid) addError("invalid matrix (A)");
        if (model.A.valid) {
            if (model.C.width !== model.A.width - 1)
                addError(`c.length (${model.C.width}) != matrix.width - 1 (${model.A.width - 1})`);
            if (model.B.width !== model.A.height)
                addError(`basis length (${model.B.width}) != matrix height (${model.A.height})`);
            for (let i = 0; i < model.B.width; i++) {
                let bi = model.B.items[i];
                if (bi < 0 || bi > model.C.width)
                    addError("invalid basis element: " + bi);
            }
            if (model.E.width < 2)
                addError("position should have 2 values");
            if (model.E.valid && model.E.width >= 2) {
                if (model.E.items[0][0] > model.A.height - 1)
                    addError("invalid l element position: " + model.E.items[0][0]);
                if (model.E.items[0][1] > model.A.width - 1)
                    addError("invalid r element position: " + model.E.items[0][1]);
            }
        }
        checkEnd();
        //
        target[propKey] = propValue;
        return true;
    }
};

let model = new Proxy({
    AString: "",
    CString: "",
    BString: "",
    EString: "",
    //
    A: new Matrix(),
    C: new Matrix(),
    B: new Matrix(),
    E: new Matrix()
}, modelProxyHandler);

window.onload = function () {
    bindMobileHardwareBtn();
    errEl = document.getElementById("error");
    errorListEl = document.getElementById("errorList");
    matrixInputEl = document.getElementById("input");
    matrixInputEl.addEventListener('keyup', e => inputChanged(e.target))
    matrixOutputEl = document.getElementById("output");
    elEl = document.getElementById("elEl");
    elEl.addEventListener('keyup', e => eInputChanged(e.target))
    cInputEl = document.getElementById("cInput");
    cInputEl.addEventListener('keyup', e => cInputChanged(e.target))
    bInputEl = document.getElementById("bInput");
    bInputEl.addEventListener('keyup', e => bInputChanged(e.target))
    deltaOutputEl = document.getElementById("deltaOutput");
    runEl = document.getElementById("runBtn");
    runEl.addEventListener('click', e => mathRun())
    runDeltasEl = document.getElementById("run2Btn");
    runDeltasEl.addEventListener('click', e => printDeltas())
    basisRowsEl = document.getElementById("basisRows");
    //
    let moveUpEl = document.getElementById("moveUpBtn")
    moveUpEl.addEventListener('click', e => moveUp())
    let setTestEls = document.getElementsByClassName("setTest")
    for (let setTestEl of setTestEls)
        setTestEl.addEventListener("click", e => setTestData(Number(e.target.getAttribute("data-index"))))
    //
    cInputEl.dispatchEvent(new Event('keyup'));
    bInputEl.dispatchEvent(new Event('keyup'));
    matrixInputEl.dispatchEvent(new Event('keyup'));
    elEl.dispatchEvent(new Event('keyup'));
    //
    console.log('loaded;');
}

function checkBegin() {
    while (errorListEl.children.length > 0)
        errorListEl.removeChild(errorListEl.lastChild);
}

function checkEnd() {
    errEl.style.opacity = (errorListEl.children.length === 0) ? 0 : 0.9;
}

//matrix input
function inputChanged(el) {
    let matStr = el.value;
    // add auto newline
    if (matStr.slice(-1) === ";") {
        el.value += "\r\n";
        matStr = el.value;
    }
    model.AString = matStr;
}
//C-vector input
function cInputChanged(el) {
    model.CString = el.value
}
//B-vector input
function bInputChanged(el) {
    model.BString = el.value
}
//E-vector input
function eInputChanged(el) {
    model.EString = el.value
}

function mathRun() {
    let pi = model.E.items[0][0]
    let pj = model.E.items[0][1]
    let T = transform(model.A, pi, pj)
    matrixOutputEl.value = formatMatrix(T)
}

function printDeltas() {
    let deltas = getDeltas(new SimplexTable(model.A, model.B, model.C));
    deltaOutputEl.value = deltas.items[0].reduce((a, delta) => a += delta + ", ", "");
}

function moveUp() {
    matrixInputEl.value = matrixOutputEl.value;
    matrixOutputEl.value = "";
    inputChanged(matrixInputEl);
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
    let A = parseMatrix(aEl.value);
    let b = parseMatrix(bEl.value);
    let c = parseMatrix(cEl.value);
    return new SimplexTable(A, b, c);
}

function checkSimplexTable(table) {
    Error.init()
    Error.check(function () {
        if (!table.A.valid) Error.add("A is invalid")
        if (!table.B.valid) Error.add("B is invalid")
        if (!table.C.valid) Error.add("C is invalid")
        if (table.B.width !== table.A.height)
            Error.add(`B length (${table.B.width}) != A height (${table.A.height})`)
        if (table.C.width !== table.A.width - 1) 
            Error.add(`C length ${table.C.width} != A.width - 1 (${table.A.width - 1})`)
        for (let i = 0; i < table.B.width; i++)
            if ((table.B.items[0][i] - 1) >= table.C.width) {
                Error.add(`B element {${table.B.items[0][i]}} is greater than C length (${table.C.width})`)
                break
            }
    });
}

function runSimplex(cIn, bIn, aIn, out) {
    let outEl = document.getElementById(out);
    let table = getSimplexTable(cIn, bIn, aIn)
    outEl.innerHTML = "";
    checkSimplexTable(table);
    if (!Error.hasErrors())
    {
        let log = doSimplex(table)
        printSimplexLog(log, outEl)
    }
}

// DOM

function addError(msg) {
    let item = document.createElement("li");
    item.innerHTML = msg;
    errorListEl.appendChild(item);
}

function label(el, string) {
    let lbl = document.createElement("label");
    lbl.setAttribute("class", "log");
    lbl.innerHTML = string;
    el.appendChild(lbl);
}