export class Matrix {

	public valid: boolean = true;

	public get height() { return this.items ? this.items.length : 0 }
	public get width() { return this.items && this.items[0] ? this.items[0].length : 0 }

	constructor(public items: number[][] = [[]]) {
	}

	public copy(m: Matrix) {
		this.items = createArray(m.height, m.width);
		for (let i = 0; i < this.height; i++)
			for (let j = 0; j < this.width; j++)
				this.items[i][j] = m.items[i][j];
		this.valid = m.valid;
	}

	public clone(): Matrix {
		let clone = new Matrix();
		clone.copy(this);
		return clone;
	}
}

export function createArray(height: number, width: number) {
	let m = new Array(height)
	for (let i = 0; i < height; i++)
		m[i] = new Array(width)
	return m
}