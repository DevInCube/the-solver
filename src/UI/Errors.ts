export class Errors {
	public static errorListEl: HTMLElement | null = null
	public static errEl: HTMLElement | null = null

	public static init() {
		let error = this;
		error.errEl = document.getElementById("error");
		error.errorListEl = document.getElementById("errorList");
		if (error.errEl && error.errorListEl)
			error.errEl.onclick = (function () {
				if (error.errorListEl && error.errorListEl) {
					while (error.errorListEl.hasChildNodes()) {
						error.errorListEl.removeChild(<Node>error.errorListEl.lastChild);
					}
				}
			});
	}

	public static checkBegin() {
		let error = this;
		if (error.errorListEl && error.errorListEl)
			while (error.errorListEl.children.length > 0)
				error.errorListEl.removeChild(<Node>error.errorListEl.lastChild);
	}

	public static add(msg: string) {
		let item = document.createElement("li");
		item.innerHTML = msg;
		let error = this;
		if (error.errorListEl)
			error.errorListEl.appendChild(item);
	}

	public static checkEnd() {
		let error = this;
		if (error.errEl && error.errorListEl)
			error.errEl.style.opacity = ((error.errorListEl.children.length === 0) ? 0 : 0.9).toString();
	}

	public static check(checkFun: any) {
		this.checkBegin();
		checkFun();
		this.checkEnd();
	}

	public static hasErrors() {
		let error = this;
		if (error.errorListEl)
			return error.errorListEl.children.length > 0;
		return false
	}
}
