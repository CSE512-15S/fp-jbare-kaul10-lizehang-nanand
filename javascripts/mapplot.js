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
  var draw = function(){
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
 
    var colorScale = d3.scale.linear()
        .domain([-1000, 1000])
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
            return "<strong style='color:white'>Name:</strong> <span style='color:white'>" + d.properties.name +          
            "</span><br><strong style='color:white'>PUMA10:</strong> <span style='color:white'>" + d.properties.puma;
          
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
          .style("fill","gray")
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
            if (d.properties.puma != activePuma){
              d3.select(this).style("fill-opacity", defaultOpacity).style("cursor", "auto");
            }
            tip.hide(d);
          })
          .on('click',function(d) {
            d3.select("#puma" + activePuma).style("fill","gray").style("fill-opacity", defaultOpacity);
            d3.select(this).style("fill","orange");
            activePuma = d.properties.puma;
            clicked(d);
          });

        
      
      });
      
      //THEN figure out what to do when an area of the map is clicked
      function clicked(pumaClicked) {
        barplot.update(pumaClicked);

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