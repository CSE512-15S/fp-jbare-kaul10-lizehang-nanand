var map;

var pumsDataset = "data/PUMS_less.csv";
d3.csv(pumsDataset, function(d) {
  return {
    income: +d.FINCP,
    dependents: +d.NOC,
    bedrooms: +d.BDSP,
    vehicles: +d.VEH,
    puma: +d.PUMA10,

    average: +d.netAvg,
    best: +d.netBest,
    worst: +d.netWorst, 

    averageHome: +d.homeEnergyAvg,
    bestHome: +d.homeEnergyBest,      
    worstHome: +d.homeEnergyWorst,

    averageElec: +d.elecTaxesAvg,
    bestElec: +d.elecTaxesBest,         
    worstElec: +d.elecTaxesWorst,

    natGas: +d.natGasTaxes,
    fuelOil: +d.fuelOilTaxes,
    air: +d.airTaxes,
    gas: +d.gasTaxes,
    wfr: +d.wfr,
    salesTax: +d.salesTaxSavings

    
  };
}, function(error, parsedDataset) {
  bubble = bubble_generator();
  map = map_generator(parsedDataset);
  barplot = barplot_generator(parsedDataset);
  
  var updateObject = {};

  function updateAll(obj) {
    map.redraw(obj);
    barplot.update(obj);
    bubble.update(obj);
  }

  document.getElementById("variableSelector").onchange=function(){
    
    updateObject["variable"] = document.getElementById("variableSelector").value;
    updateAll(updateObject);
  };

  // document.getElementById("histogramVariable").onchange=function(){
  //   barplot.update();
  // };

  var barmargin = {top: 5, right: 30, bottom: 0, left: 30},
      barwidth = 200,
      barheight = 20;

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

  // function income_brushed()
  // {
  //   updateObject["income"] = income_brush.extent();
  //   map.redraw(updateObject);
  // }

  var brushList = ["income", "dependents", "bedrooms", "vehicles"];
  var variable_extent = [];
  var variable_scale = [];
  var variable_brush = [];
  var variable_brushed = [];
  var variable_axis = [];

  function income_brushed() {
    updateObject["income"] = variable_brush[0].extent();
    //console.log(updateObject);
    updateAll(updateObject);
  }

  function dependents_brushed() {
    updateObject["dependents"] = variable_brush[1].extent();
    //console.log(updateObject);
    updateAll(updateObject);
  }

  function bedrooms_brushed() {
    updateObject["bedrooms"] = variable_brush[2].extent();
    //console.log(updateObject);
    updateAll(updateObject);
  }

  function vehicles_brushed() {
    updateObject["vehicles"] = variable_brush[3].extent();
    //console.log(updateObject);
    updateAll(updateObject);
  }

  var format = d3.format(",.0f");

  for (var i = 0; i < brushList.length; i++) {
    variable_extent[i] = d3.extent(parsedDataset, function(d) { 
      if (i == 0) {
        return d.income; 
      } else if (i == 1) {
        return d.dependents;
      }  else if (i == 2) {
        return d.bedrooms;
      } else {
        return d.vehicles;
      }
    });
    //console.log(income_selection);
    variable_scale[i] = d3.scale.linear()
      .domain(variable_extent[i])
      .range([0,barwidth]);

    if (i == 0) {
      variable_brush[i] = d3.svg.brush()
      .x(variable_scale[i])
      .on("brush", income_brushed);
    } else if (i == 1) {
      variable_brush[i] = d3.svg.brush()
      .x(variable_scale[i])
      .on("brush", dependents_brushed);
    }  else if (i == 2) {
      variable_brush[i] = d3.svg.brush()
      .x(variable_scale[i])
      .on("brush", bedrooms_brushed);
    } else {
      variable_brush[i] = d3.svg.brush()
      .x(variable_scale[i])
      .on("brush", vehicles_brushed);
    }

    variable_brush[i] = variable_brush[i].extent(variable_extent[i]);
    

    variable_axis[i] = d3.svg.axis()
      .scale(variable_scale[i])
      .orient("bottom")
      .tickValues(variable_extent[i]);
      
      // .ticks(3)
      // .tickFormat(d3.format(",.0f"));


    build_bar("#" + brushList[i], variable_axis[i], variable_brush[i]);
    // build_bar("#dependents", dependents_axis, dependents_brush);
    // build_bar("#bedrooms", bedrooms_axis, bedrooms_brush);
    // build_bar("#vehicles", vehicles_axis, vehicles_brush);

    updateObject[brushList[i]] = variable_brush[i].extent();
  }

  updateObject["variable"] = document.getElementById("variableSelector").value;
  updateObject["area"] = -1;

  console.log(updateObject);

  SelectDimension();

  bubble.init(updateObject);
  map.init(updateObject);
  barplot.init(updateObject);
});



