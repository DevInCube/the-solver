console.log('loaded;');

import { testData } from "./Test/Test";
import { doSimplex, Tableau, transform, getDeltas, Problem, ProblemType } from "./Math/Simplex";
import Errors from "./UI/Errors";
import Matrix from "./Math/Matrix";
import { printSimplexLog } from "./UI/DomOutput";
import { parseMatrix, formatMatrix } from "./UI/Format";

let matrixInputEl: HTMLTextAreaElement;
let matrixOutputEl: HTMLTextAreaElement;
let cInputEl: HTMLTextAreaElement;
let bInputEl: HTMLTextAreaElement;

let modelProxyHandler = {
    set: function (target: any, propKey: string, propValue: any) {
        if (["AString", "BString", "CString", "EString"].includes(propKey)) {
            const matrix = parseMatrix(propValue)
            model[propKey.charAt(0)] = matrix
            console.table(matrix.items)
        }
        Errors.check(() => {
            if (!model.A.valid) Errors.add("invalid matrix (A)");
            if (model.A.valid) {
                if (model.C.width !== model.A.width - 1)
                    Errors.add(`c.length (${model.C.width}) != matrix.width - 1 (${model.A.width - 1})`);
                if (model.B.width !== model.A.height)
                    Errors.add(`basis length (${model.B.width}) != matrix height (${model.A.height})`);
                for (let i = 0; i < model.B.width; i++) {
                    let bi = model.B.items[i];
                    if (bi < 0 || bi > model.C.width)
                        Errors.add("invalid basis element: " + bi);
                }
            }
        })
        //
        target[propKey] = propValue;
        return true;
    }
};

let model = new Proxy({
    AString: "",
    CString: "",
    BString: "",
    //
    A: new Matrix(),
    C: new Matrix(),
    B: new Matrix(),
}, modelProxyHandler);

console.log('DOM fully loaded and parsed');
bindMobileHardwareBtn();
Errors.init();
matrixInputEl = document.getElementById("input") as HTMLTextAreaElement;
matrixInputEl.addEventListener('keyup', inputChanged)
matrixOutputEl = document.getElementById("output") as HTMLTextAreaElement;
cInputEl = document.getElementById("cInput") as HTMLTextAreaElement;
cInputEl.addEventListener('keyup', e => cInputChanged(e.target as HTMLTextAreaElement))
bInputEl = document.getElementById("bInput") as HTMLTextAreaElement;
bInputEl.addEventListener('keyup', e => bInputChanged(e.target as HTMLTextAreaElement))
//
let runSimplexBtn = document.getElementById("runSimplex") as HTMLButtonElement;
runSimplexBtn.addEventListener("click", e => runSimplex('cInput', 'bInput', 'input', 'testRes'))
//
let setTestEls = document.getElementsByClassName("setTest")
for (let setTestEl of setTestEls)
    setTestEl.addEventListener("click", e => setTestData(Number((e.target as HTMLAnchorElement).getAttribute("data-index"))))
//
cInputEl.dispatchEvent(new Event('keyup'));
bInputEl.dispatchEvent(new Event('keyup'));
matrixInputEl.dispatchEvent(new Event('keyup'));
//
console.log('inited;');
//matrix input
function inputChanged(ev: KeyboardEvent) {
    const el = ev.target as HTMLTextAreaElement
    let matStr = el.value;
    // add auto newline
    if (ev.key === ";") {
        el.value += "\r\n";
        matStr = el.value;
    }
    model.AString = matStr;
}
//C-vector input
function cInputChanged(el: HTMLTextAreaElement) {
    model.CString = el.value
}
//B-vector input
function bInputChanged(el: HTMLTextAreaElement) {
    model.BString = el.value
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

function getSimplexTable(cIn: string, bIn: string, aIn: string) {
    let cEl = document.getElementById(cIn) as HTMLTextAreaElement;
    let bEl = document.getElementById(bIn) as HTMLTextAreaElement;
    let aEl = document.getElementById(aIn) as HTMLTextAreaElement;
    let A = parseMatrix(aEl.value);
    let b = parseMatrix(bEl.value);
    let c = parseMatrix(cEl.value);
    return new Tableau(A, b, c);
}

function checkSimplexTable(table: Tableau) {
    Errors.init()
    Errors.check(function () {
        if (!table.A.valid) Errors.add("A is invalid")
        if (!table.B.valid) Errors.add("B is invalid")
        if (!table.C.valid) Errors.add("C is invalid")
        if (table.B.width !== table.A.height)
            Errors.add(`B length (${table.B.width}) != A height (${table.A.height})`)
        if (table.C.width !== table.A.width - 1)
            Errors.add(`C length ${table.C.width} != A.width - 1 (${table.A.width - 1})`)
        for (let i = 0; i < table.B.width; i++)
            if ((table.B.items[0][i] - 1) >= table.C.width) {
                Errors.add(`B element {${table.B.items[0][i]}} is greater than C length (${table.C.width})`)
                break
            }
    });
}

function runSimplex(cIn: string, bIn: string, aIn: string, out: string) {
    let type = (document.getElementById("problem-type") as HTMLSelectElement).value;
    console.log(type)
    let outEl = document.getElementById(out) as HTMLDivElement;
    let table = getSimplexTable(cIn, bIn, aIn)
    outEl.innerHTML = "";
    checkSimplexTable(table);
    if (!Errors.hasErrors()) {
        let log = doSimplex(new Problem(type as ProblemType,table))
        printSimplexLog(log, outEl)
    }
}



// test
function setTestData(index = 0) {
    matrixInputEl.value = testData[index].AString
    cInputEl.value = testData[index].CString
    bInputEl.value = testData[index].BString
    //
    cInputEl.dispatchEvent(new Event('keyup'));
    bInputEl.dispatchEvent(new Event('keyup'));
    matrixInputEl.dispatchEvent(new Event('keyup'));
}

// commands

// commands
declare global {
    interface Window { command: any; }
}
window.command = new class {
    //
}