// Slider area
var map_generator = function(){
  var margin = {top: 20, right: 0, bottom: 20, left: 40},
      height = 500 - margin.top - margin.bottom,
      cell_height = 40,
      canvas_width,
      width = 550 - margin.left - margin.right
      width_legend = 200;

  // data for map??
  var dataset = [];
  var color = d3.scale.category20();

  // function to draw the map area (does it need any data from pums_less?)
  // input variable being the whole dataset
  var draw = function(dataset){
    // initial SVG
    var map = d3.select("#map")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

        var detail = map.append("g")
              .attr("class", "detail")
              .attr("transform", "translate(" + 800 + "," + 200 +")" )
              .attr("width", 400)
              .attr("height", height);

        var dataset = "data/pumas_wash_topo.json";
     
        var colorScale = d3.scale.linear()
            .domain([0, 2])
            .range(["white", "red"]);
       
        var mapGroup = map.append("g");
       
        var projection = d3.geo.albers()
              .rotate([119, 0])
              .center([-3, 48])
              .parallels([35, 50])
              .scale(8000)
              .translate([300, 200])
              .precision(.1);
     
                   
        var path = d3.geo.path()
            .projection(projection);
                   
        d3.json(dataset, function(error, wa) {
          var wash = topojson.feature(wa, wa.objects.wash);
     
          //Declaring the tool tip variable
          var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              //console.log(d);
              return "<strong style='color:white'>Name:</strong> <span style='color:white'>" + d.properties.name;/* +
              "</span><br><strong style='color:white'>Zip Code:</strong> <span style='color:white'>" + d.properties.zip +
              "</span><br><strong style='color:white'>Utility:</strong> <span style='color:white'>" +
              ((getUtilities(d.properties.zip) !== 0) ? (getUtilities(d.properties.zip))[0] : "N/A" ) +
              "</span><br><strong style='color:white'>Carbon Impact:</strong> <span style='color:white'>" +
              ((getUtilities(d.properties.zip) !== 0) ? getUtilityStats((getUtilities(d.properties.zip))[0])[1] : "N/A" );*/
              
          })
     
          //Calling the tool tip within the svg
          mapGroup.call(tip);
     
          mapGroup.selectAll("path")
              .data(wash.features)
              .enter().append("path")         
              .attr("d", path)
              .style("fill", function(d) {
                //console.log(d);
                return colorScale(1);
              })
              .on('mouseover', tip.show)
              .on('mouseout', tip.hide)
              .on('click',clicked);


        });  

        function clicked(d) {
          d3.csv("data/PUMS_less.csv", function(d) {
            return {
              wfr:d.wfr
            };
          }, function(error, rows) {

          });

          var x, y, k;
         
          if (d && centered !== d) {
            var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 4;
            centered = d;
          } else {
            x = width / 2;
            y = height / 2;
            k = 1;
            centered = null;
          }
         
          mapGroup.selectAll("path")
              .classed("active", centered && function(d) { return d === centered; });
         
          mapGroup.transition()
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
    bubble.update(area);
  };

  // function to initiate 
  var init = function(){
      d3.csv("data/pums_less.csv", function(data){
            dataset = data.map(function(d) {
              return {
                  area: d.PUMA00, 
                  wfr:  +d.wfr
                  // load more data columns
              }
            });
          });
      draw(dataset);
  };

  // function to redraw brush
  var redraw = function(){
    d3.select("div#map svg").remove();
    //initCanvasSize();
    draw(dataset);
    // console.log(current_range);
    update_view(current_area);
    barplot.init;
  };

  return {
    init: init,
    redraw: redraw,
    dataset: function() { return dataset; }
  };
}