var barplot_generator = function(parsedDataset) {
  
  var margin = {top: 10, right: 30, bottom: 50, left: 30},
      width = 500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var detail = d3.select("#barplot_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id", "detailGroup")
        .attr("width", width)
        .attr("height", height);
		
		var tooltipGroup = detail.append("g");

  var init = function(updateObject) {
    // d3.csv(pumsDataset, function(d) {
    //   return {
    //     puma: +d.PUMA10,
    //     netBest: +d.netBest
    //   };
    // }, function(error, rows) {
    //   parsedDataset = rows;
    // });
    update(updateObject);
  };

  var update = function(updateObject) {
    //console.log(pumaClicked);

    d3.selectAll(".bar").remove();
    d3.selectAll("#bar-x-axis").remove();
    d3.selectAll("#histogram_label").remove();
    
    //document.getElementById("menu").style.visibility="visible"; 

    // A formatter for counts.
    var formatCount = d3.format(",.0f");

    //Filter the data based on which PUMA was clicked
    var rowsFiltered = parsedDataset.filter(function(d){ 
      var include = true;

      if (updateObject.area != -1) {
        include = include && (d.puma == parseInt(updateObject.area)); 
      }

      include = include && (d.income > updateObject.income[0]) && (d.income < updateObject.income[1]);
      include = include && (d.bedrooms > updateObject.bedrooms[0]) && (d.bedrooms < updateObject.bedrooms[1]);
      include = include && (d.dependents > updateObject.dependents[0]) && (d.dependents < updateObject.dependents[1]);
      include = include && (d.vehicles > updateObject.vehicles[0]) && (d.vehicles < updateObject.vehicles[1]);

      return include;
    });

    var values = [];
    var i = 0;
    for (i = 0; i < rowsFiltered.length; i++) {
      values.push(rowsFiltered[i][updateObject.variable]);
    }

    var domain = d3.extent(values);
    domain[0] = 1000 * Math.floor(domain[0]/1000);
    domain[1] = 1000 * Math.ceil(domain[1]/1000);

    var x = d3.scale.linear()
      .domain(domain)
      .range([0, width]);

    // Generate a histogram using uniformly-spaced bins.
    var data = d3.layout.histogram()
        .bins(x.ticks(80))
        (values);
    
	

    var y = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { 
          return d.y; 
        })])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var detail = d3.select("#detailGroup");

    var bar = detail.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    //console.log(d3.extent(values) + " " + data[0].dx + " " + x(data[0].dx));

    bar.append("rect")
        // .transition()
        // .duration(500)
        .attr("x", 1)
        .attr("width", 4)//x(data[0].dx) - 1)
        .attr("height", function(d) { 
          return height - y(d.y); 
        }).on('mouseover', //tip.show
            function(d) {
              tip.show(d);
              d3.select(this).style("fill-opacity", 1).style("cursor", "auto");
              
            }
          )
          .on('mouseout', function(d) {
            //if (d.properties.puma != activePuma){
              d3.select(this).style("fill-opacity", defaultOpacity).style("cursor", "auto");
            //}
            tip.hide(d);
          });

    detail.append("g")
        .attr("class", "x axis")
        .attr("id", "bar-x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    detail.append("text")
        .attr("class", "x label")
        .attr("id", "histogram_label")
        .attr("text-anchor", "middle")
        .attr("x", 250)
        .attr("y", height + 35)
        .text("Financial change ($)");
		
			var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
            return "<span style='color:white'>Number of sampled households:</span> <strong style='color:white;text-decoration: underline;font-size: 14px'>" + d.y +          
            "</strong><br><span style='color:white'>Financial change range for this bin:</span> <strong style='color:white;text-decoration: underline;font-size: 14px'> $" 
            + d.x + " to $" + (d.x + d.dx) + "</strong>";
          
          });
		  
		  	tooltipGroup.call(tip);
  };

  return {
      init: init,
      update: update
  };
};
