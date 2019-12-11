import Matrix from './Matrix'

export class Tableau {
	// A - matrix
	// b - basis index vector
	// c - vector
	constructor(
		public A: Matrix,
		public B: Matrix,
		public C: Matrix) {

	}

	public clone() {
		return new Tableau(this.A.clone(), this.B.clone(), this.C.clone())
	}
}

export enum ProblemType {
	Max = "max",
	Min = "min",
}

export class Problem {
	constructor(
		public type: ProblemType,
		public table: Tableau) { }
}

export interface GammasData {
	gammas: Matrix
	minGammaIndex: number
	hasMinusInRow: boolean
}

export interface SimplexLogIteration {
	table: Tableau
	deltas: Matrix
	pivot: [number, number] | null
	//
	//minusRowIndex?: number
	x?: Matrix
	fx?: number
	//gammasData?: GammasData
}

export interface SimplexLog {
	problemType: ProblemType
	problemMatrix: Matrix
	iterations: SimplexLogIteration[]
}

function getSolution(table: Tableau): { x: Matrix, fx: number } {
	// get result x*
	let x = new Matrix([Array(table.C.width).fill(0)])
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

export function doSimplex(problem: Problem): SimplexLog {
	const table = problem.table;
	let log: SimplexLog = {
		problemType: problem.type,
		problemMatrix: table.C.clone(),
		iterations: []
	};
	let iIteration = 0;
	while (iIteration++ < 100) {  // infinie loop constraint
		let iteration = <SimplexLogIteration>{
			table: table.clone(),
		};
		log.iterations.push(iteration);
		//
		let deltas = getDeltas(table);
		iteration.deltas = deltas.clone() // log line
		//
		let pj = -1;  // pivot element column index
		if (problem.type === ProblemType.Max) {
			let negativeIndexes = [];
			for (let [i, val] of deltas.items[0].entries()) {
				if (val < 0) {
					negativeIndexes.push(i);
				}
			}
			// if all positive or zero (max)
			if (negativeIndexes.length === 0) {
				let {x, fx} = getSolution(table);
				iteration.x = x
				iteration.fx = fx
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
		} else if (problem.type === ProblemType.Min) {
			let positiveIndexes = [];
			for (let [i, val] of deltas.items[0].entries()) {
				if (val > 0) {
					positiveIndexes.push(i);
				}
			}
			// if all negative or zero (min)
			if (positiveIndexes.length === 0) {
				let {x, fx} = getSolution(table);
				iteration.x = x
				iteration.fx = fx
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
		} else {
			throw new Error(`Invalid problem type: ${problem.type}`)
		}

		// The row whose result is minimum score is chosen.
		let minDivValue = Number.MAX_VALUE;
		let minDivRowIndex = -1;
		for (let i = 0; i < table.A.height; i++) {
			let p0Value = table.A.items[i][0]
			let aElement = table.A.items[i][pj]
			if (p0Value > 0 && aElement > 0) {
				let div = p0Value / aElement
				if (div < minDivValue) {
					minDivValue = div
					minDivRowIndex = i
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
		console.log(pi, pj)
		iteration.pivot = [pi, pj];  // log
		table.A = transform(table.A, pi, pj);
		// change basis
		table.B.items[0][pi] = pj;
	}
	return log;
}

// m - Matrix, pi, pj - int
export function transform(m: Matrix, pi: number, pj: number): Matrix {
	if (!m.valid)
		throw new Error(`transform: invalid matrix`)
	if (pi < 0 || pi >= m.height)
		throw new Error(`transform: invalid row index ${pi}`)
	if (pj < 0 || pj >= m.width)
		throw new Error(`transform: invalid column index ${pj}`)
	//
	let El = m.items[pi][pj]; // special element value
	if (El === 0)
		throw new Error(`transform: special element can not have zero value`)
	let res = Matrix.create(m.height, m.width);
	for (let i = 0; i < m.height; i++) {
		for (let j = 0; j < m.width; j++) {
			if (i === pi) {
				res.items[i][j] = m.items[i][j] / El;
			} else {
				res.items[i][j] = m.items[i][j] - m.items[pi][j] * m.items[i][pj] / El;
			}
		}
	}
	return res;
}

export function getGammasData(table: Tableau, minusRowIndex: number, deltas: Matrix): GammasData {
	let gammas = Matrix.create(1, table.C.width);
	let minGamma = Infinity;
	let minGammaIndex = -1;
	let hasMinusInRow = false;
	for (let j = 1; j < table.A.width; j++) {
		let rowX = table.A.items[minusRowIndex][j];
		if (rowX < 0) {
			hasMinusInRow = true;
			let gamma = -(deltas.items[0][j - 1] / rowX)
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
	}
}

// source: https://stackoverflow.com/a/19722641/6634744
function round(n: number, places: number = 3): number {
	const k = 10 ** places;
	return Math.round((n + Number.EPSILON) * k) / k;
}

export function getDeltas(table: Tableau): Matrix {
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
	return new Matrix([deltas.slice(1)]);
}