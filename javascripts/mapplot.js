// Slider area
var map_generator = function(){
  //START by setting up overall layout of page
  var margin = {top: 10, right: 30, bottom: 30, left: 30},
      width = 1300 - margin.left - margin.right,
      height = 700 - margin.top - margin.bottom;

  var detailWidth = 400,
      detailHeight = 400;
      
  var centered;

  

  //THEN load the PUMS dataset and do everything else inside this
  //Loading the PUMS once like this is faster then loading it a bunch of different times
  //The "rows" variable contains all the imported PUMS data
  var pumsDataset = "data/PUMS_less.csv";

  // function to draw the map area (does it need any data from pums_less?)
  // input variable being the whole dataset
  var draw = function(rows){
    var map = d3.select("#map")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    var tooltipGroup = map.append("g");

    var detail = map.append("g")
        .attr("class", "detail")
        .attr("transform", "translate(" + 800 + "," + 0 +")" )
        .attr("width", 400)
        .attr("height", height);

    //THEN set up all the map stuff
    var mapDataset = "data/pumas_wash_topo.json";
 
    var colorScale = d3.scale.linear()
        .domain([0, 2])
        .range(["white", "red"]);
   
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

        //console.log(pumaClicked);

        d3.selectAll(".bar").remove();
        d3.selectAll("#bar-x-axis").remove();
    
        //document.getElementById("menu").style.visibility="visible"; 

        // A formatter for counts.
        var formatCount = d3.format(",.0f");

        //Filter the data based on which PUMA was clicked
        var rowsFiltered = rows.filter(function(d){ return d.puma == parseInt(pumaClicked.properties.puma); });

        var values = [];
        var i = 0;
        for (i = 0; i < rowsFiltered.length; i++) {
          values.push(rowsFiltered[i].netBest);
        }

        var domain = d3.extent(values);
        domain[0] = 100 * Math.floor(domain[0]/100);
        domain[1] = 100 * Math.ceil(domain[1]/100);

        var x = d3.scale.linear()
          .domain(domain)
          .range([0, detailWidth]);

        // Generate a histogram using uniformly-spaced bins.
        var data = d3.layout.histogram()
            .bins(x.ticks(40))
            (values);


        var y = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { 
              return d.y; 
            })])
            .range([detailHeight, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var bar = detail.selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

        //console.log(d3.extent(values) + " " + data[0].dx + " " + x(data[0].dx));

        bar.append("rect")
            .attr("x", 1)
            .attr("width", 10)//x(data[0].dx) - 1)
            .attr("height", function(d) { 
              return detailHeight - y(d.y); 
            });

        detail.append("g")
            .attr("class", "x axis")
            .attr("id", "bar-x-axis")
            .attr("transform", "translate(0," + detailHeight + ")")
            .call(xAxis);

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
      d3.csv(pumsDataset, function(d) {
        return {
          puma: +d.PUMA10,
          netBest: +d.netBest
        };
      }, function(error, rows) {
        draw(rows);
      });
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