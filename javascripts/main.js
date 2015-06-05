var map;

// $(document).ready(function(){

  bubble = bubble_generator();
  map = map_generator();
  barplot = barplot_generator();
  
  SelectDimension();
 
  bubble.init(-1);
  map.init();
  barplot.init();

  //console.log(barplot);
// });



