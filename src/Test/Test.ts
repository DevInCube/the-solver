import { Tableau, doDualSimplex } from "../Math/Simplex";
import { printSimplexLog } from "../UI/DomOutput";
import { parseMatrix } from "../UI/Format";

export const testData = [
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
]

export function testSimplex(index = 0) {
	let A = parseMatrix(testData[index].AString)
	let b = parseMatrix(testData[index].BString)
	let c = parseMatrix(testData[index].CString)
	let table = new Tableau(A, b, c)
	let log = doDualSimplex(table)
	let resEl = document.getElementById("testRes") as HTMLDivElement
	printSimplexLog(log, resEl)
}