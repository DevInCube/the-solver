export default class Matrix {

	public valid: boolean = true;

	public get height() { return this.items ? this.items.length : 0 }
	public get width() { return this.items && this.items[0] ? this.items[0].length : 0 }

	constructor(public items: number[][] = [[]]) {
	}

	public copy(m: Matrix) {
		this.items = m.items.map(row => row.slice())
		this.valid = m.valid;
	}

	public clone(): Matrix {
		let clone = new Matrix();
		clone.copy(this);
		return clone;
	}

	public static create(height: number, width: number): Matrix {
		return new Matrix(this.createArray(height, width))
	}

	public static createArray(height: number, width: number): any[][] {
		let m = new Array(height)
		for (let i = 0; i < height; i++)
			m[i] = new Array(width)
		return m
	}
}