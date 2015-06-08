
var margin = {top: 20, right: 95, bottom: 10, left: 125},
    width = 900 - margin.left ,
    height,
    tickExtension = 20; // extend grid lines beyond scale range

var formatPercent = d3.format(".2%"),
    formatTenthPercent = d3.format(".1%"),
    formatNumber = d3.format(",.2s"), 
    formatMoney = d3.format("$,.2f"), 
    formatCount = d3.format(",.0s");

var nameAll = "Households";

var x = d3.scale.linear()
    .domain([-1000, 1000])
    .rangeRound([0, width])
    .clamp(true)
    .nice();

var y = d3.scale.ordinal();
var ynew = d3.scale.ordinal();

var y0 = d3.scale.ordinal()
    .domain([nameAll])
    .range([150]);

var r = d3.scale.sqrt()
    .domain([0, 10])
    .range([0, 1]);

var z = d3.scale.threshold()
    .domain([-500, -200, 0, 200, 500])
    .range(["#b35806", "#f1a340", "#fee0b6", "#d8daeb", "#998ec3", "#542788"].reverse());
// var z_bed = d3.scale.threshold()
//     .domain([1, 2, 3, 4, 5, 6, 7])
//     .range(["#b35806", "#f1a340", "#fee0b6", "#d8daeb", "#fd8d3c", "#998ec3", ].reverse());

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("top")
    .ticks(9)
    .tickFormat(formatNumber);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickSize(-width + 60 - tickExtension * 2, 0)
    .tickPadding(6);


var svg = d3.select(".g-graphic").append("svg")
    .attr("height", 300 + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.select(".g-graphic").append("svg")
    .style("margin-top", "20px")
    .attr("height", 80)
    .attr("width", width + margin.left + margin.right)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(renderChartKey);

var gx = svg.append("g")
    .attr("class", "g-x g-axis")
    .call(xAxis);

// var tickLast = gx.selectAll(".g-x .tick:last-of-type");

// tickLast.select("text")
//     .text(function() { return "\u2265 " + this.textContent; });

// tickLast.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
//     .attr("transform", "translate(" + width + ",0)")
//   .select("text")
//     .text("\u2265" + " $300");

var titleX = gx.append("text")
    .attr("class", "g-title")
    .attr("y", -9)
    .style("text-anchor", "end");

titleX.append("tspan")
    .attr("x", -20)
    .style("font-weight", "bold")
    .text("Saving");

titleX.append("tspan")
    .attr("x", -20)
    .attr("dy", "1em")
    .text("per year");


d3.csv("data/PUMS_AggTable.csv", type, function(error, tabdata) {
  var MONEYPYs = d3.nest()
      .key(function(d) { return d.income_group_level; })
      .entries(tabdata);

  var BYPUMA = d3.nest()
      .key(function(d) { return d.PUMA10; })
      .entries(tabdata);
  // var domain = [0, 500]//d3.extent(MONEYPYs.netAvg);

  // x.domain(domain);
  // Compute the overall rate for all data.
  // var overallRate = rate(d3.sum(PUMA10, count), d3.sum(PUMA10, count));
  var totalCount = d3.sum(tabdata, count);
  
  // Compute the overall rate by MONEYPY.
  MONEYPYs.forEach(function(d) {
    d.weight  = normalize(d3.sum(d.values, count), totalCount);
  });

  // Sort MONEYPYs by ascending levels.
  MONEYPYs.sort(function(a, b) {
    return a.values[0].income_level_num   - b.values[0].income_level_num  ;
  });

  // Compute the weight  for each sample.
  tabdata.forEach(function(d) {
    d.weight  = normalize(d.count, totalCount);
  });

  height = 120 * MONEYPYs.length;
  heightnew = 60 * BYPUMA.length;
  y
      .domain(MONEYPYs.map(function(d) { return d.key; }))
      .rangePoints([10, height], 1);
  ynew
      .domain(BYPUMA.map(function(d) { return d.key; }))
      .rangePoints([10, heightnew], 1);    

  svg.append("g")
      .attr("class", "g-y g-axis g-y-axis-MONEYPY")
      .attr("transform", "translate(-" + tickExtension + ",0)")
      .call(yAxis.scale(y))
      .call(yAxisWrap)
      .style("stroke-opacity", 0)
      .style("fill-opacity", 0)
    .selectAll(".tick text,.tick tspan")
      .attr("x", -95)
      .style("text-anchor", "start");

  svg.append("g")
      .attr("class", "g-y g-axis g-y-axis-BYPUMA")
      .attr("transform", "translate(-" + tickExtension + ",0)")
      .call(yAxis.scale(ynew))
      .call(yAxisWrap)
      .style("stroke-opacity", 0)
      .style("fill-opacity", 0)
    .selectAll(".tick text,.tick tspan")
      .attr("x", -95)
      .style("text-anchor", "start");    

  svg.append("g")
      .attr("class", "g-y g-axis g-y-axis-overall")
      .attr("transform", "translate(-" + tickExtension + ",0)")
      .call(yAxis.scale(y0))
      .call(yAxisWrap);

  var sampleClip = svg.append("defs").selectAll("clipPath")
      .data(tabdata)
    .enter().append("clipPath")
      .attr("id", function(d, i) { return "g-clip-sample-" + i; })
    .append("circle")
      .attr("cx", function(d) { return d.cx_current; })
      .attr("cy", function(d) { return d.cy_current - y0(nameAll); })
      .attr("r", function(d) { return r(d.count); });

  var gVoronoi = svg.append("g")
      .attr("class", "g-voronoi")

  gVoronoi.selectAll("path")
      .data(tabdata)
    .enter().append("path")
      .attr("clip-path", function(d, i) { return "url(#g-clip-sample-" + i + ")"; })
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

  gVoronoi.call(updateVoronoi,
      function(d) { return d.cx_current; },
      function(d) { return d.cy_current + y0(nameAll); },
      420);

  var MONEYPY = svg.append("g")
      .attr("class", "g-MONEYPY")
    .selectAll("g")
      .data(MONEYPYs)
    .enter().append("g")
      .attr("transform", function(d) { return "translate(0," + y(d.key) + ")"; });

  // var MONEYPYNote = d3.select(".g-selected-notes")
  //     .style("opacity", 0)
  //     .style("display", "none")
  //   .selectAll("div")
  //     .data(MONEYPYs)
  //   .enter().append("div")
  //     .attr("class", "g-MONEYPY-note")
  //     .style("top", function(d) { return y(d.key) + "px"; })
  //     .html(function(d) { return MONEYPYNoteByName[d.key]; });

  var MONEYPYsample = MONEYPY.append("g")
      .attr("class", "g-MONEYPY-sample")
    .selectAll("circle")
      .data(function(d) { return d.values; })
    .enter().append("circle")
      .attr("cx", function(d) { return d.cx_current; })
      .attr("cy", function(d) { return d.cy_current - y(d.income_group_level) + y0(nameAll); })
      .attr("r", function(d) { return r(d.count); })
      .style("fill", function(d) { return isNaN(d.weight ) ? null : z(d.netAvg); })
      // .style("fill", function(d) { return isNaN(d.weight ) ? null : z_bed(d.PUMA10); })
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

  var MONEYPYOverall = MONEYPY.append("g")
      .attr("class", "g-overall")
      .attr("transform", function(d) { return "translate(" + x(d.weight ) + "," + (y0(nameAll) - y(d.key)) + ")"; })
      .style("stroke-opacity", 0)
      .style("fill-opacity", 0);

  MONEYPYOverall.append("line")
      .attr("y1", -100)
      .attr("y2", +127);

  // var MONEYPYOverallText = MONEYPYOverall.append("text")
  //     .attr("y", -106);

  // MONEYPYOverallText.append("tspan")
  //     .attr("x", 0)
  //     .text(function(d) { return formatPercent(d.weight ); });

  // MONEYPYOverallText.filter(function(d, i) { return !i; }).append("tspan")
  //     .attr("x", 0)
  //     .attr("dy", "-11")
  //     .style("font-size", "8px")
  //     .text("OVERALL");

  // var overall = svg.append("g")
  //     .attr("class", "g-overall g-overall-all")
  //     .attr("transform", "translate(" + x(overallRate) + "," + y0(nameAll) + ")");

  // overall.append("line")
  //     .attr("y1", -100)
  //     .attr("y2", +127);

  // var overallText = overall.append("text")
  //     .attr("y", -106)
  //     .style("font-weight", "bold");

  // overallText.append("tspan")
  //     .attr("x", 0)
  //     .style("font-size", "13px")
  //     .text(formatTenthPercent(overallRate));

  // overallText.append("tspan")
  //     .attr("x", 0)
  //     .attr("dy", "-14")
  //     .style("font-size", "8px")
  //     .text("OVERALL");

  var currentView = "overall";

  d3.selectAll(".g-content button[data-view]")
      .datum(function(d) { return this.getAttribute("data-view"); })
      .on("click", transitionView);

  // var searchInput = d3.select(".g-search input")
  //     .on("keyup", keyuped);

  // var searchClear = d3.select(".g-search .g-search-clear")
  //     .on("click", function() {
  //       searchInput.property("value", "").node().blur();
  //       search();
  //     });

  var tip = d3.select(".g-tip");

  var tipMetric = tip.selectAll(".g-tip-metric")
      .datum(function() { return this.getAttribute("data-name"); });

  // d3.selectAll(".g-annotations b,.g-selected-notes b")
  //     .datum(function() { return new RegExp("\\b" + d3.requote(this.textContent), "i"); })
  //     .on("mouseover", mouseoverAnnotation)
  //     .on("mouseout", mouseout);

  // function keyuped() {
  //   if (d3.event.keyCode === 27) {
  //     this.value = "";
  //     this.blur();
  //   }
  //   search(this.value.trim());
  // }

  // function search(value) {
  //   if (value) {
  //     var re = new RegExp("\\b" + d3.requote(value), "i");
  //     svg.classed("g-searching", true);
  //     MONEYPYsample.classed("g-match", function(d) { return re.test(d.name) || re.test(d.MONEYPY) || (d.symbol && re.test(d.symbol)) || (d.alias && re.test(d.alias)); });
  //     var matches = d3.selectAll(".g-match");
  //     if (matches[0].length === 1) mouseover(matches.datum());
  //     else mouseout();
  //     searchClear.style("display", null);
  //   } else {
  //     mouseout();
  //     svg.classed("g-searching", false);
  //     MONEYPYsample.classed("g-match", false);
  //     searchClear.style("display", "none");
  //   }
  // }

  function transitionView(view) {
    if (currentView === view) view = view === "overall" ? "selected" : "overall";
    d3.selectAll(".g-buttons button[data-view]").classed("g-active", function(v) { return v === view; })
    switch (currentView = view) {
      case "overall": return void transitionOverall();
      case "selected": return void transitionselected();
      case "selected2": return void transitionselected_PUMA();
    }
  }

  function transitionOverall() {
    gVoronoi.style("display", "none");

    var transition = d3.transition()
        .duration(750);

    transition.select("svg")
        .delay(720)
        .attr("height", 420 + margin.top + margin.bottom)
        .each("end", function() {
          gVoronoi.call(updateVoronoi,
            function(d) { return d.cx_current; },
            function(d) { return d.cy_current + y0(nameAll); },
            420);
        });

    // transition.select(".g-annotations-overall")
    //     .each("start", function() { this.style.display = "block"; })
    //     .style("opacity", 1);

    transition.select(".g-selected-notes")
        .style("opacity", 0)
        .each("end", function() { this.style.display = "none"; });

    transition.selectAll(".g-y-axis-MONEYPY")
        .style("stroke-opacity", 0)
        .style("fill-opacity", 0);
    transition.selectAll(".g-y-axis-BYPUMA")
        .style("stroke-opacity", 0)
        .style("fill-opacity", 0);

    transition.selectAll(".g-y-axis-overall")
        .style("stroke-opacity", 1)
        .style("fill-opacity", 1);

    var transitionOverall = transition.select(".g-overall-all")
        .style("stroke-opacity", 1)
        .style("fill-opacity", 1);

    transitionOverall.select("line")
        .attr("y2", +127);

    transitionOverall.select("text")
        .attr("y", -106);

    var transitionMONEYPYOverall = transition.selectAll(".g-MONEYPY .g-overall")
        .delay(function(d) { return x(d.weight ); })
        .attr("transform", function(d) { return "translate(" + x(d.weight ) + "," + (y0(nameAll) - y(d.key)) + ")"; })
        .style("stroke-opacity", 0)
        .style("fill-opacity", 0);

    transitionMONEYPYOverall.select("line")
        .attr("y1", -100)
        .attr("y2", +127);

    transitionMONEYPYOverall.select("text")
        .attr("y", -106);

    transition.selectAll(".g-MONEYPY-sample circle")
        .delay(function(d) { return d.cx_current; })
        .attr("cx", function(d) { return d.cx_current; })
        .attr("cy", function(d) { return d.cy_current - y(d.income_group_level) + y0(nameAll); });
  }

  function transitionselected() {
    gVoronoi.style("display", "none");

    var transition = d3.transition()
        .duration(750);

    transition.select("svg")
        .attr("height", height + margin.top + margin.bottom)
      .transition()
        .delay(720)
        .each("end", function() {
          gVoronoi.call(updateVoronoi,
            function(d) { return d.x; },
            function(d) { return y(d.income_group_level) + d.y; },
            height);
        });

    // transition.select(".g-annotations-overall")
    //     .style("opacity", 0)
    //     .each("end", function() { this.style.display = "none"; });

    transition.select(".g-selected-notes")
        .delay(250)
        .each("start", function() { this.style.display = "block"; })
        .style("opacity", 1);

    transition.selectAll(".g-y-axis-MONEYPY,.g-MONEYPY-note")
        .delay(250)
        .style("stroke-opacity", 1)
        .style("fill-opacity", 1);

    transition.selectAll(".g-y-axis-overall")
        .style("stroke-opacity", 0)
        .style("fill-opacity", 0);
    transition.selectAll(".g-y-axis-BYPUMA")
        .style("stroke-opacity", 0)
        .style("fill-opacity", 0);

    var transitionOverall = transition.select(".g-overall-all")
        .delay(x(totalCount))
        .style("stroke-opacity", 0)
        .style("fill-opacity", 0);

    transitionOverall.select("line")
        .attr("y2", height - y0(nameAll));

    var transitionMONEYPYOverall = transition.selectAll(".g-MONEYPY .g-overall")
        .delay(function(d) { return x(d.weight ); })
        .attr("transform", function(d) { return "translate(" + x(d.weight ) + ",0)"; })
        .style("stroke-opacity", 1)
        .style("fill-opacity", 1);

    transitionMONEYPYOverall.select("line")
        .attr("y1", -25)
        .attr("y2", +25);

    transitionMONEYPYOverall.select("text")
        .attr("y", -31);

    transition.selectAll(".g-MONEYPY-sample circle")
        .delay(function(d) { return d.x; })
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

  function transitionselected_PUMA() {
    gVoronoi.style("display", "none");
    var transition = d3.transition()
        .duration(750);

    transition.select("svg")
        .attr("height", heightnew + margin.top + margin.bottom)
      .transition()
        .delay(720)
        .each("end", function() {
          gVoronoi.call(updateVoronoi,
            function(d) { return d.x ; },
            function(d) { return d.y+ ynew(d.PUMA10); },
            heightnew);
        });

    transition.select(".g-annotations-overall")
        .style("opacity", 0)
        .each("end", function() { this.style.display = "none"; });

    transition.select(".g-selected-notes")
        .delay(250)
        .each("start", function() { this.style.display = "block"; })
        .style("opacity", 1);

    transition.selectAll(".g-y-axis-BYPUMA,.g-MONEYPY-note")
        .delay(250)
        .style("stroke-opacity", 1)
        .style("fill-opacity", 1);

    transition.selectAll(".g-y-axis-overall")
        .style("stroke-opacity", 0)
        .style("fill-opacity", 0);
    transition.selectAll(".g-y-axis-MONEYPY")
        .style("stroke-opacity", 0)
        .style("fill-opacity", 0);

    var transitionOverall = transition.select(".g-overall-all")
        .delay(x(totalCount))
        .style("stroke-opacity", 0)
        .style("fill-opacity", 0);

    transitionOverall.select("line")
        .attr("y2", heightnew - y0(nameAll));

    var transitionMONEYPYOverall = transition.selectAll(".g-MONEYPY .g-overall")
        .delay(function(d) { return x(d.weight ); })
        .attr("transform", function(d) { return "translate(" + x(d.weight ) + ",0)"; })
        .style("stroke-opacity", 1)
        .style("fill-opacity", 1);

    transitionMONEYPYOverall.select("line")
        .attr("y1", -1000)
        .attr("y2", +5000);

    transitionMONEYPYOverall.select("text")
        .attr("y", -31);

    transition.selectAll(".g-MONEYPY-sample circle")
        .delay(function(d) { return d.x; })
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y/3 - y(d.income_group_level) + ynew(d.PUMA10)  ; });
  }
  function updateVoronoi(gVoronoi, x, y, height) {
    sampleClip
        .attr("cx", x)
        .attr("cy", y);

    gVoronoi
        .style("display", null)
        .selectAll("path")
        .data(d3.geom.voronoi().x(x).y(y)(tabdata))
        .attr("d", function(d) { return "M" + d.join("L") + "Z"; })
        .datum(function(d) { return d.point; });
  }

  // function mouseoverAnnotation(re) {
  //   var matches = MONEYPYsample.filter(function(d) { return re.test(d.name) || re.test(d.alias); }).classed("g-active", true);
  //   if (d3.sum(matches, function(d) { return d.length; }) === 1) mouseover(matches.datum());
  //   else tip.style("display", "none");
  // }

  function mouseover(d) {
    MONEYPYsample.filter(function(c) { return c === d; }).classed("g-active", true);

    var dx, dy;
    if (currentView === "overall") dx = d.cx_current, dy = d.cy_current + y0(nameAll);
    else if(currentView == "selected") dx = x(d.x), dy = d.y + y(d.income_group_level);
    else dx = x(d.x), dy = d.y + ynew(d.PUMA10);
    dy -= 69, dx += 50; // margin fudge factors

    tip.style("display", null)
        .style("top", (dy - r(d.count)) + "px")
        .style("left", dx + "px");

    // tip.select(".g-tip-title")
    //     .text(d.alias || d.name);

    var formatMoney = d3.format("$,.2n");

    tipMetric.select(".g-tip-metric-value").text(function(name) {
      switch (name) {
        case "weight": return isNaN(d.weight ) ? "N.A." : formatPercent(d.weight );
        case "Tax": return formatMoney(d.netAvg);
        case "income": return d.income_group_level;
        case "PUMA10": return d.PUMA10;      
      }
    });
  }

  function mouseout() {
    tip.style("display", "none");
    MONEYPYsample.filter(".g-active").classed("g-active", false);
  }
});

function renderChartKey(g) {
  var formatPercent = d3.format(".2%"),
      formatMoney = d3.format("$,.2f"), 
      formatNumber = d3.format(",.2s");

  // A position encoding for the key only.
  var x = d3.scale.linear()
      .domain([-1000, 1000])
      .range([0, 240]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickSize(13)
      .tickValues(z.domain())
      // .tickValues(z_bed.domain())
      .tickFormat(function(d) { return formatNumber(d); });

  g.append("text")
      .attr("x", -25)
      .style("text-anchor", "end")
      .style("font", "bold 9px sans-serif")
      .text("CHART KEY");

  var gColor = g.append("g")
      .attr("class", "g-key-color")
      .attr("transform", "translate(140,-7)");

  gColor.selectAll("rect")
      .data(z.range().map(function(d, i) {
      // .data(z_bed.range().map(function(d, i) {
        return {
          x0: i ? x(z.domain()[i - 1]) : x.range()[0],
          x1: i < 4 ? x(z.domain()[i]) : x.range()[1],
          z: d
        };
      }))
    .enter().append("rect")
      .attr("height", 8)
      .attr("x", function(d) { return d.x0; })
      .attr("width", function(d) { return d.x1 - d.x0; })
      .style("fill", function(d) { return d.z; });

  gColor.call(xAxis);

  var gColorText = g.append("text")
      .attr("x", 140 - 6)
      .style("text-anchor", "end");

  gColorText.append("tspan")
      .style("font-weight", "bold")
      .text("Color");

  gColorText.append("tspan")
      .style("fill", "#777")
      .text(" shows net tax change");

  var gSize = g.append("g")
      .attr("class", "g-key-size")
      .attr("transform", "translate(580,-7)");

  var gSizeInstance = gSize.selectAll("g")
      .data([0.001, 0.005, 0.01, 0.015])
    .enter().append("g")
      .attr("class", "g-MONEYPY");

  gSizeInstance.append("circle")
      .attr("r", function(d) {return r(d * 89643) });

  gSizeInstance.append("text")
      .attr("x", function(d) { return r(d * 89643) + 4; })
      .attr("dy", ".35em")
      .text(function(d) { return formatPercent(d); });

  var gSizeX = 0;

  gSizeInstance.attr("transform", function() {
    var t = "translate(" + gSizeX + ",3)";
    gSizeX += this.getBBox().width + 15;
    return t;
  });

  var gSizeText = g.append("text")
      .attr("x", 580 - 10)
      .style("text-anchor", "end");

  gSizeText.append("tspan")
      .style("font-weight", "bold")
      .text("Size");

  gSizeText.append("tspan")
      .style("fill", "#777")
      .text(" shows percentage in data");
}

function yAxisWrap(g) {
  g.selectAll(".tick text")
    .filter(function(d) { return /[ ]/.test(d) && this.getComputedTextLength() > margin.left - tickExtension - 10; })
      .attr("dy", null)
      .each(function(d) {
        d3.select(this).text(null).selectAll("tspan")
            .data(d.split(" "))
          .enter().append("tspan")
            .attr("x", this.getAttribute("x"))
            .attr("dy", function(d, i) { return (i * 1.35 - .35) + "em"; })
            .text(function(d) { return d; });
      });
}

// function netAvg(d) {
//   return d.netAvg;
// }

function count(d) {
  return d.count;
}

function normalize(weighted_variable, totalCount) {
  return totalCount <= 0 ? NaN : weighted_variable / totalCount;
}

function type(d) {
  d.income_group_level = d.income_level_name;
  d.income_level_num  = +d.income_level_num ;
  d.x = +d.cx_netAvg;
  d.y = +d.cy_netAvg;
  d.cx_current = +d.cx_netAvg;
  d.cy_current = +d.cy_netAvg;
  d.netAvg = +d.netAvg;

  // d.x = +d.cx_netBest;
  // d.y = +d.cy_netBest;
  // d.cx_current = +d.cx_netBest;
  // d.cy_current = +d.cy_netBest;
  // d.netAvg = +d.netBest;

  d.PUMA10 = d.PUMA10;
  // squash y range when plotting for sub
  d.y /= 3;
  d.x += 300;
  d.cx_current += 300;
  d.cy_current *= 1.1;
  d.cr = +d.cr;
  return d;
}
