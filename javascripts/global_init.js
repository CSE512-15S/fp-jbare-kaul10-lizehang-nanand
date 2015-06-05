// global parameters and data
var whole_data;
var dimension; // which case, best, worst or average?
var area;
var barplot;
var barplot_svg;
var color = d3.scale.category20c();

function SelectDimension() {
	
	if (document.getElementById("dimensions")) {
		dimension = document.getElementById("dimensions").value;	
	} else {
		dimension = "average";
	}
	
	// change dataset

}


