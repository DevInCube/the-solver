(function (global, factory) {
	if (typeof exports === "object" && exports) {
		factory(exports); // CommonJS
	} else if (typeof define === "function" && define.amd) {
		define(['exports'], factory); // AMD
	} else {
		factory(global.Errors = {}); // <script>
	}
}(this, function (error) {

	error.errorListEl = {};
	error.errEl = {};

	error.init = function () {
		error.errEl = document.getElementById("error");
		error.errorListEl = document.getElementById("errorList");
		if (error.errEl && error.errorListEl)
			error.errEl.onclick = (function () {
				while (error.errorListEl.hasChildNodes()) {
					error.errorListEl.removeChild(error.errorListEl.lastChild);
				}
			});
	}

	error.checkBegin = function () {
		while (error.errorListEl.children.length > 0)
			error.errorListEl.removeChild(error.errorListEl.lastChild);
	}

	error.add = function (msg) {
		let item = document.createElement("li");
		item.innerHTML = msg;
		error.errorListEl.appendChild(item);
	}

	error.checkEnd = function () {
		error.errEl.style.opacity = (error.errorListEl.children.length === 0) ? 0 : 0.9;
	}

	error.check = function (innerFunction) {
		error.checkBegin();
		innerFunction(error);
		error.checkEnd();
	}

	error.hasErrors = function () { return error.errorListEl.children.length > 0; };

}));