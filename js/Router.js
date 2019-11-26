let router = new Router();
router.init();

function Router(){
	this.init = function(){
		let mainMenu = document.getElementById("main-menu");
		mainMenu.addEventListener("change", function(e){
			window.location = mainMenu.value + ".html";
		});
	};
}

function clone(id){
	let importFrom = document.getElementById(id).lastChild;
	let clone = importFrom.cloneNode(true);
	let importTo = document.getElementById('import');
	importTo.appendChild(clone);
}