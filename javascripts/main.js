var map;

// $(document).ready(function(){
  var pumsDataset = "data/PUMS_less.csv";
  d3.csv(pumsDataset, function(d) {
    return {
      puma: +d.PUMA10,
      netBest: +d.netBest
    };
  }, function(error, parsedDataset) {
    bubble = bubble_generator();
    map = map_generator(parsedDataset);
    barplot = barplot_generator(parsedDataset);
    
    SelectDimension();
   
    bubble.init(-1);
    map.init();
    barplot.init();

    document.getElementById("mapColoring").onchange=function(){
      map.redraw();
    };

    // document.getElementById("histogramVariable").onchange=function(){
    //   barplot.update();
    // };

    function build_bar(selector, axis, brush)  {
      var svg = d3.select(selector)
        .append("svg")
        .attr("width", barwidth + barmargin.left + barmargin.right)
        .attr("height", barheight + barmargin.top + barmargin.bottom)
        .append("g")
          .attr("transform", "translate(" + barmargin.left + "," + barmargin.top + ")");
      svg.append("g")
        .attr("class", "x axis")
        .call(axis);
      svg.append("g")
        .attr("class", "brush")
        .call(brush)
        .selectAll("rect")
        .attr("height", barheight);
      return svg;
    }

    function temp_brushed()
    {
      console.log("brushed");
    }

    var barmargin = {top: 5, right: 10, bottom: 0, left: 10},
        barwidth = 200,
        barheight = 20;
    var temp_selection = [30, 95];
    var temp_scale = d3.scale.linear()
      .domain(temp_selection)
      .range([0,barwidth]);

    var temp_brush = d3.svg.brush()
      .x(temp_scale)
      .on("brush", temp_brushed);
    var temp_axis = d3.svg.axis()
      .scale(temp_scale)
      .orient("bottom")
      .tickValues([30, 43, 56, 69, 82, 95]);
    build_bar("#income", temp_axis, temp_brush);
    build_bar("#dependents", temp_axis, temp_brush);
    build_bar("#bedrooms", temp_axis, temp_brush);
    build_bar("#vehicles ", temp_axis, temp_brush);
  });
  

  //console.log(barplot);
// });



