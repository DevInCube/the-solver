function printSimplexLog(log, el) {
	label(el, "=================================");
	let fn = "max f(x) = ";
	for (let i = 0; i < log.problem.width; i++) {
		if (i > 0) fn += " + ";
		fn += log.problem.items[0][i] + "&times;X" + (i + 1);
	}
	label(el, fn + " ;");
	for (let it = 0; it < log.iterations.length; it++)
	{
		let iteration = log.iterations[it];
		label(el, "----------------------------");
		label(el, "Iteration " + it + ":");
		el.appendChild(tableauToTable(iteration.table));
		if (iteration.minusRowIndex === -1) 
		{
			label(el, "=================================");
			label(el, "No negative elements.");
			label(el, "x* = ");
			el.appendChild(matrixToTable(iteration.x));
			let res = 0;
			for (let i = 0; i < iteration.table.C.width; i++)
				res += iteration.table.C.items[0][i] * iteration.x.items[0][i];
			label(el, "f(x*) = " + res);
		}
		else 
		{
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