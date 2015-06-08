// Slider area
var map_generator = function(parsedDataset){
  //START by setting up overall layout of page
  var margin = {top: 10, right: 30, bottom: 30, left: 30},
      width = 800 - margin.left - margin.right,
      height = 550 - margin.top - margin.bottom;
      
  var centered;

  

  //THEN load the PUMS dataset and do everything else inside this
  //Loading the PUMS once like this is faster then loading it a bunch of different times
  //The "rows" variable contains all the imported PUMS data
  

  // function to draw the map area (does it need any data from pums_less?)
  // input variable being the whole dataset
  var draw = function(updateObject){
    var map = d3.select("#map_svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
      .attr("id", "mapGroup");

    var tooltipGroup = map.append("g");

    //console.log(map);

    

    //THEN set up all the map stuff
    var mapDataset = "data/pumas_wash_topo.json";
    
    var rowsFiltered = parsedDataset.filter(function(d){ 
      var include = true;

      include = include && (d.income > updateObject.income[0]) && (d.income < updateObject.income[1]);
      include = include && (d.bedrooms > updateObject.bedrooms[0]) && (d.bedrooms < updateObject.bedrooms[1]);
      include = include && (d.dependents > updateObject.dependents[0]) && (d.dependents < updateObject.dependents[1]);
      include = include && (d.vehicles > updateObject.vehicles[0]) && (d.vehicles < updateObject.vehicles[1]);

      return include;
    });

    var values = [];
    var valuesByPuma = {};
    var i = 0;
    for (i = 0; i < rowsFiltered.length; i++) {
      values.push(rowsFiltered[i][updateObject.variable]);

      if (rowsFiltered[i].puma in valuesByPuma) {
        valuesByPuma[rowsFiltered[i].puma].push(rowsFiltered[i][updateObject.variable]);
      } else {
        valuesByPuma[rowsFiltered[i].puma] = [rowsFiltered[i][updateObject.variable]];
      }
    }


    var averagesByPuma = {};
    var arrayOfAverages = [];
    for (key in valuesByPuma) {
      averagesByPuma[key] = d3.mean(valuesByPuma[key]);
      arrayOfAverages.push(averagesByPuma[key]);
    }

    console.log(averagesByPuma);

    var averagesExtent = d3.extent(arrayOfAverages);

    var colorScale = d3.scale.linear()
        .domain(averagesExtent)
        .range(["red", "blue"]);
   
    var projection = d3.geo.albers()
        .rotate([119, 0])
        .center([-3, 48])
        .parallels([35, 50])
        .scale(8000)
        .translate([250, 150])
        .precision(.1);
 
               
    var path = d3.geo.path()
        .projection(projection);

    var activePuma = 0;
               
    d3.json(mapDataset, function(error, wa) {
      var wash = topojson.feature(wa, wa.objects.wash);

      var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
            return "<span style='color:white'>Location:</span>" + 
            "<br><strong style='color:white;text-decoration: underline;font-size: 14px'>" + d.properties.name + "</strong>" + 
            "<br><br><span style='color:white'>PUMA:</span>" + 
            "<br><strong style='color:white;text-decoration: underline;font-size: 14px'>" + d.properties.puma + "</strong>" + 
            "<br><br><span style='color:white'>Average financial impact </span>" + 
            "<br><span style='color:white'>for selected variable: </span><br>" + 
            "<strong style='color:white;text-decoration: underline;font-size: 14px'>$" + (averagesByPuma[d.properties.puma]).round() + "</strong>";
          
          });

      tooltipGroup.call(tip);

      defaultOpacity = 0.8;
 
      tooltipGroup.selectAll("path")
          .data(wash.features)
          .enter().append("path")         
          .attr("d", path)
          .attr("class", "pumaPath")
          .style("stroke","#ccc")
          .style("stroke-width", "1px")
          // .style("fill","gray")
          .style("fill", function(d) {
            return colorScale(averagesByPuma[d.properties.puma]);
          })
          .style("fill-opacity", defaultOpacity)
          .attr("id", function(d) {
            return "puma" + d.properties.puma;
          })
          .on('mouseover', //tip.show
            function(d) {
              tip.show(d);
              d3.select(this).style("fill-opacity", 1).style("cursor", "pointer");
              
            }
          )
          .on('mouseout', function(d) {
            //if (d.properties.puma != activePuma){
              d3.select(this).style("fill-opacity", defaultOpacity).style("cursor", "auto");
            //}
            tip.hide(d);
          })
          .on('click',function(d) {
            if (activePuma == d.properties.puma) {
              d3.select(this).style("stroke","#ccc").style("stroke-width","1px");//.style("fill-opacity", defaultOpacity);
              activePuma = -1;
              updateObject.area = -1;
              clicked(updateObject);
            } else {
              d3.select("#puma" + activePuma).style("stroke","#ccc").style("stroke-width","1px");//.style("fill-opacity", defaultOpacity);
              d3.select(this).style("stroke","yellow").style("stroke-width","3px");
              activePuma = d.properties.puma;
              updateObject.area = d.properties.puma;
              clicked(updateObject,d);
            }
            
          });

        
      
      });
      
      //THEN figure out what to do when an area of the map is clicked
      function clicked(obj,d) {
        barplot.update(obj);
		//console.log(obj);
		var x, y, k;
         
          if (d && centered !== d) {
			 if(obj.area > 11000){

			 var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 5;
            centered = d;
				 
				 
			 }
			 else if(obj.area > 10500 && obj.area <=11000){
				 
				 
			 var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 2.6;
            centered = d;
				 
				 
			 }
			 
			 else if(obj.area <=10500){
				 
				 
			 var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 2;
            centered = d;
				 
				 
			 }
          } else {
            x = width / 2;
            y = height / 2;
            k = 1;
            centered = null;
          }
         
          tooltipGroup.selectAll("path")
              .classed("active", centered && function(d) { return d === centered; });
         
          tooltipGroup.transition()
              .duration(750)
              .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
              .style("stroke-width", 1.5 / k + "px");

      }
  };

  // function to update area
  var current_area;

  var update_view = function(area){
    current_area = area;   
    // update the bubble plot (whenever update view, call this)
    //bubble.update(area);
  };

  // function to initiate 
  var init = function(updateObject){
      draw(updateObject);
  };

  // function to redraw brush
  var redraw = function(updateObject){
    d3.select("#map_svg").remove();
    d3.select("div#map").append("svg")
        .attr("id", "map_svg");
    //initCanvasSize();
    draw(updateObject);
    // console.log(current_range);
    //update_view(current_area);
    barplot.init;
  };

  return {
    init: init,
    redraw: redraw,
    dataset: function() { return parsedDataset; }
  };
}
