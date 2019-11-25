var router = new Router();
router.init();

function Router(){
	this.init = function(){
		var mainMenu = document.getElementById("main-menu");
		mainMenu.addEventListener("change", function(e){
			window.location = mainMenu.value + ".html";
		});
	};
}

function clone(id){
	var importFrom = document.getElementById(id).lastChild;
	var clone = importFrom.cloneNode(true);
	var importTo = document.getElementById('import');
	importTo.appendChild(clone);
}