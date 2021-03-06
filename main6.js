//////////////////////////////////////
// change log:
// - added a slider for the map to select individual day time
// - added two additional figures to tooltip for accidents in rural or urban area per state
// - added data labels to week day charts and aligned legend not to interfere
//   with chart
// - corrected description of 'severity of accidents'
// - replaced piechart for injury categories by bar chart
// - adding a zoom function for the map - work in progress
//////////////////////////////////////

//////////////////////////////////////
// this function calls the respective functions for drawing
//////////////////////////////////////
function story(index) {
  switch (index) {
    case 1:
      clearChart();
      //piechart_severity();
      barchart_injuries();
      break;
    case 2:
      clearChart();
      barchart_total();
      break;
    case 3:
      clearChart();
      barchart();
      break;
    case 4:
      clearChart();
      linechart2();
      break;
    case 5:
      clearChart();
      barchart_ages();
      break;
    case 6:
      clearChart();
      //d3.json("us_land_use.json", draw);
      d3.json("us_land_use.json", draw);
      break;
  };
}

//////////////////////////////////////
// function clearChart fades out all svg, g, p and divs
//////////////////////////////////////
function clearChart() {
  d3.selectAll('svg')
    .transition().duration(500)
    .style("opacity", 0.0001)
    .remove();
  d3.selectAll('g')
    .transition()
    .duration(500)
    //.ease('sin-in-out')
    .style("opacity", 0.0001)
    .remove();
  //d3.selectAll('p.hint').remove();
  d3.selectAll('p.hint').text("");
  d3.selectAll('div.tooltip').remove();
  d3.selectAll('form').remove();
  d3.selectAll('#slider').remove();
}

//////////////////////////////////////
// function barchart_ages creates a chart for the distribution of casualties
// according to ages
//////////////////////////////////////
function barchart_ages() {
  d3.select('chart.chart h2')
    .text("Distribution over Ages");
  var explanation = "Sadly almost 800 children with age below or equal 10 years \
  die in accidents. In the age group 10 - 20 years a high amount of fatalities \
  need to be mourned. The highest peak is in the age group from 20 - 30 years \
  with more than 7,500 casualties. The numbers remain on a consistent plateau \
  until 70 year olds. Beyond the age of 70 years the fatality rate decreases.";

  var margin = {top: 60, right: 40, bottom: 60, left: 60},
      width = 750 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  // explanatory text
  d3.select('chart.chart p').text(explanation)

  var svg = d3.select("chart.chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // person.tsv contains detailed information about all person involved in the
  // traffic accidents
  d3.tsv("person.tsv", function(d) {
        d.INJ_SEV = +d.INJ_SEV;
        d.AGE = +d.AGE;
        return d;
      }, function(error, data) {
      if (error) throw error;
        var nestCount = d3.nest()
        // create age groups fpr the fatal accident records only
        .key(function(d) {
          var ageGroup = null;
          if (d.INJ_SEV === 4 && d.AGE <= 103) {
            if (d.AGE <= 10) {ageGroup = "0-10"; }
            else if (d.AGE > 10 && d.AGE <= 20) {ageGroup = "10-20";}
            else if (d.AGE > 20 && d.AGE <= 30) {ageGroup = "20-30";}
            else if (d.AGE > 30 && d.AGE <= 40) {ageGroup = "30-40";}
            else if (d.AGE > 40 && d.AGE <= 50) {ageGroup = "40-50";}
            else if (d.AGE > 50 && d.AGE <= 60) {ageGroup = "50-60";}
            else if (d.AGE > 60 && d.AGE <= 70) {ageGroup = "60-70";}
            else if (d.AGE > 70 && d.AGE <= 80) {ageGroup = "70-80";}
            else if (d.AGE > 80 && d.AGE <= 90) {ageGroup = "80-90";}
            else if (d.AGE > 90 && d.AGE <= 100) {ageGroup = "90-100";}
            else if (d.AGE > 100) {ageGroup = ">100";}
          }
          return ageGroup;
        })
      .rollup(function(v) { return v.length;}) // count the records
      .sortKeys(d3.ascending) // sort the age groups
      .entries(data);

// console.log(JSON.stringify(nestCount));

  // remove the key "null", where all records for non-fatal accidents are landing
  nestCount = nestCount.filter(function(d) { return d.key != "null"})

  var x = d3.scale.ordinal().rangeRoundBands([0, width],0.1);
  var y = d3.scale.linear().range([height, 0]);

  x.domain(nestCount.map(function(d) {
    if (d.key != null) {return d.key;}}));
  y.domain([0, d3.max(nestCount, function(d) { return d.values; })]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .ticks(20)
      .orient("left");

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text") // text label for the x axis
      .attr("x", width / 2 )
      .attr("y", 0)
      .attr("dy", "2.71em")
      .style("text-anchor", "middle")
      .text("Age Groups in Year Ranges");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -6)
      .attr("dy", "1.71em")
      .style("text-anchor", "end")
      .text("Casualties");

      var bar = svg.selectAll(".bar")
        .data(nestCount)
        .enter().append("g");

      // create the bars for each age group
      bar.append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.key); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(0); })
        .attr("height", function(d) { return height - y(0); })
        .transition().duration(1500)
        .ease("elastic")
        .attr("y", function(d) { return y(d.values); })
        .attr("height", function(d) { return height - y(d.values); });

      // add a text label to each bar
      var number = d3.format(","); // format of numbers
      bar.append("text")
      .attr("class", "datalabel")
      .attr("x", function(d) { return x(d.key) + x.rangeBand()/2; })
      .attr("y",  function(d) { return y(d.values) - 10; } )
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style('opacity', 0.0001)
      .transition().duration(1500)
      .style('opacity', 1)
      .text(function(d) { return number(d.values); });
});
}

//////////////////////////////////////
// function barchart_injuries creates a chart for the distribution of injury types
//////////////////////////////////////
function barchart_injuries() {
  d3.select('chart.chart h2')
    .text("Severity of Traffic Accidents");
  var explanation = "The files include all types of accidents: The ones \
  with casualties, as well as fender benders. A detailed database contains \
  records of all persons involved in each accident. In 2015 more than 32,000 \
  accidents took place with more than 82,000 recorded persons. Unfortunately, \
  the majority of 44% were associated with casualties and 10% with severe \
  injuries. We will focus on the fatal category in the course of our analysis.";

  // explanatory text
  d3.select('chart.chart p').text(explanation)

  var margin = {top: 60, right: 40, bottom: 60, left: 60},
      width = 550 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  var svg = d3.select("chart.chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // person.tsv contains detailed information about all person involved in the
  // traffic accidents
  d3.csv("z_injury_data.csv", function(d) {
        //d.age = +d.INJ_SEV;
        d.count = +d.count;
        return d;
      }, function(error, data) {
      if (error) throw error;

console.log(JSON.stringify(data));
debugger;

  //var x = d3.scale.ordinal().rangeRoundBands([0, width],0.1);
  var x = d3.scale.ordinal().rangeRoundBands([0, width], .1, .8)
  var y = d3.scale.linear().range([height, 0]);

  x.domain(data.map(function(d) { return d.type; }));
  y.domain([0, d3.max(data, function(d) { return d.count; })]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .ticks(10)
      .orient("left");

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text") // text label for the x axis
      .attr("x", width / 2 )
      .attr("y", 10)
      .attr("dy", "2.71em")
      .style("text-anchor", "middle")
      .text("Injury Categories");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -6)
      .attr("dy", "1.71em")
      .style("text-anchor", "end")
      .text("Reported Incidents");

      var bar = svg.selectAll(".bar")
        .data(data)
        .enter().append("g");

      // create the bars for each age group
      bar.append("rect")
        .attr("class", "bar")
        //.attr("x", function(d) { return x(d.type); })
        .attr("x", function(d) { return (x(d.type) + (x.rangeBand() - d3.min([x.rangeBand(), 60]))/2)})
        //.attr("width", x.rangeBand())
        .attr("width", d3.min([x.rangeBand(), 60]))
        .attr("y", function(d) { return y(0); })
        .attr("height", function(d) { return height - y(0); })
        .transition().duration(1500)
        .ease("elastic")
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return height - y(d.count); });

      // add a text label to each bar
      var number = d3.format(","); // format of numbers
      bar.append("text")
      .attr("class", "datalabel")
      .attr("x", function(d) { return x(d.type) + x.rangeBand()/2; })
      .attr("y",  function(d) { return y(d.count) - 10; } )
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style('opacity', 0.0001)
      .transition().duration(1500)
      .style('opacity', 1)
      .text(function(d) { return number(d.count); });
});
}

//////////////////////////////////////
// function piechart_severity() creates a pie chart showing the amount of
// injuries througout all accidents
//////////////////////////////////////
function piechart_severity() {
  var margin = {top: 60, right: 40, bottom: 60, left: 60},
      width = 900 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom,
      radius = Math.min(width, height) / 2;

  d3.select('chart.chart h2')
    .text("Severity of Traffic Accidents");
  var explanation = "The files include all types of accidents: The ones \
  with casualties, as well as fender benders. A detailed database contains \
  records of all persons involved in each accident. In 2015 more than 32,000 \
  accidents took place with more than 82,000 recorded persons. Unfortunately, \
  the majority of 44% were associated with casualties and 10% with severe \
  injuries. We will focus on the fatal category in the course of our analysis.";

  // explanatory text
  d3.select('chart.chart p').text(explanation)

  // define colors for pie
  var color = d3.scale.ordinal()
      .range(["#cb181d", "#ef3b2c", "#d9f0a3", "#41ab5d", "#fcbba1", "#ffffe5"]);

  var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

  var labelArc = d3.svg.arc()
      .outerRadius(radius - 40)
      .innerRadius(radius - 40);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.population; });

  var svg = d3.select("chart.chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + (margin.left + 300) + "," + (margin.top + 200) + ")");

  // z_data.csv contains the amount of accidents according to injuries types
  d3.csv("z_data.csv", function(error, data) {
    if (error) throw error;

    var g = svg.selectAll(".arc")
        .data(pie(data))
      .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data.age); });

    var number = d3.format(","); // adds a ',' to thousands
    g.append("text")
        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
        .attr("dy", function (d) { if (d.data.age != "Unknown") { return ".35em"} else { return "-5em"};})
        .attr("x", -20)
        .text(function(d) { return d.data.age; });
    g.append("text")
        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
        .attr("dy", function (d) { if (d.data.age != "Unknown") { return "1.5em"} else { return "-3.85em"};})
        .attr("x", -20)
        .text(function(d) { return number(d.data.population); });
    });
}

function draw(geo_data) {
    "use strict";

    // set global variable tooltip_disable
    var tooltip_disable = 0;

    var margin = 25,
        width = 1000 - margin,
        height = 550 - margin,
        active = d3.select(null);

    // explanatory text
    var explanation = "Metropolitan areas, where motorized vehicles and other road \
      users are naturally packed closely together are clustered with accidents. \
      This map shows all fatal accidents. One can recognize interstate routes \
      and motorways connecting major cities like spider webs. \
      Hovering over single states produces a tooltip, will disclose further information. \
      Among others the indicator 'accidents per 1,000 registered cars' is referenced. \
      The mean value is approximately 0.3. Outliers with 0.7 and 0.6 are the states \
      Mississipi and Wyoming, respectively."
    var hint = "Please use the slider to select a day time to filter accidents \
      to the eventuated hour. Please note, that '-1' shows all traffic accidents. "

    d3.select('chart.chart h2')
      //.append('h2')
      .text('Arteries of Accidents across US States');
      d3.select('chart.chart p').text(explanation);
      d3.select('p.hint').text(hint).style('font-weight', 'bold');

    // append a div for the slider, just below the hint
    d3.select('chart.chart').append('div').attr('id', 'slider')

    var svg = d3.select("chart.chart")
        .append("svg")
        .attr("width", width + margin)
        .attr("height", height + margin)
        .append('g')
        .attr('class', 'map');

    svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "white")

    var g = svg.append("g")
        .style("stroke-width", "1.5px");

    var tooltip = d3.select('chart.chart').append('div')
                                   .attr('class', 'hidden tooltip')
                                   .style("opacity", .9);

    var projection = d3.geo.mercator()
                           .scale(800)
                           .translate([width / 2 + 1350, height / 2 + 575]);

    var path = d3.geo.path().projection(projection);

    // draw US states
    g.selectAll("path")
       .data(topojson.feature(geo_data, geo_data.objects.subunits).features)
       .enter().append("path")
       .attr("d", d3.geo.path().projection(projection))
       .attr("class", "feature")
       // added for zoom on click
       .on("click", clicked)
       .on('mousemove', function(d) {
                if (!tooltip_disable) {
                  var mouse = d3.mouse(svg.node()).map(function(d) {
                    return parseInt(d);
                  });
                  tooltip.classed('hidden', false)
                      .attr('style', 'left:' + (mouse[0] + 50) +
                                      'px; top:' + (mouse[1] + 200) + 'px')
                      .html("<i class='fa'> &#xf041; </i>" + "&emsp;" + d.id + "<hr>" + "<i class='fa'> &#xf0f9; </i>" + "&emsp;" + "Accidents: " + d.properties.accidents + "<br/>" + "&emsp;&emsp;" + "Urban: " + d.properties.urban + "<br/>" + "&emsp;&emsp;" + "Rural: " + d.properties.rural + "<br/>" + "&emsp;&emsp;" + "Accidents per 1,000 " + "<br/>&emsp;&emsp;" + "registered cars: " + d.properties.percentage + "<br/>" + "<i class='fa'> &#xf0fa; </i>" + "&emsp;" + "Traffic deaths: " + d.properties.injuries + "<br/>" + "<i class='fa'> &#xf183; </i>" + "&emsp;&ensp;" + d.properties.male + "<br/>" + "<i class='fa'> &#xf182; </i>" + "&emsp;&ensp;" + d.properties.female);
                }
            })
        .on('mouseout', function() {
            tooltip.classed('hidden', true);
        });


  // begin of zoom function http://bl.ocks.org/mbostock/2206590
  function clicked(d) {
    tooltip_disable = 1; // hide tooltip, as it hinders when zoomed in
    tooltip.classed('hidden', true);

    if (active.node() === this) return reset();
    active.classed("active", false);
    active = d3.select(this).classed("active", true);

    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .9 / Math.max(dx / width, dy / (height - 50)), // take care of the slide on top
        translate = [width / 2 - scale * x, height / 2 - scale * y];

    g.transition()
        .duration(750)
        .style("stroke-width", 1.5 / scale + "px")
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
    g.selectAll("circle")
        .transition(750)
        //.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
        .attr("transform", "");//.attr("transform", "translate(" + translate + ")");
  }

  function reset() {
    tooltip_disable = 0; // enable tooltip again
    active.classed("active", false);
    active = d3.select(null);

    g.transition()
        .duration(750)
        .style("stroke-width", "1.5px")
        .attr("transform", "");
   g.selectAll("circle")
       //.duration(750)
       //.style("r", "1px")
       .attr("transform", "");
  }
  // end of zoom function

  g.append("path")
      .datum(topojson.mesh(geo_data, geo_data.objects.subunits, function(a, b) {
        return a !== b; }))
      .attr("class", "mesh")
      .style("stroke", "lightgrey")
      .attr("d", path);

   // then add the major cities, firstly draw the city centers
   g.append("path")
      .datum(topojson.feature(geo_data, geo_data.objects.places))
      .attr("d", path.pointRadius(3))
      .style("fill", "black")
      .attr("class", "place");

   // then add the cities names
   g.selectAll(".place-label")
      .data(topojson.feature(geo_data, geo_data.objects.places).features)
      .enter().append("text")
      .attr("class", "place-label")
      .attr("transform", function(d) {
        return "translate(" + projection(d.geometry.coordinates) + ")";
      })
      .attr("dy", ".35em")
      .attr("dx", -6)
      .text(function(d) { return d.id; });

    // add dots for all accidents in the corresponding states
    function draw_points(data) {
      var nested = d3.nest()
         .key(function(d) { return d['ST_CASE'] })
         .key(function(d) { return d['ROUTE'] })
         .rollup(function(leaves) {
            var coords = leaves.map(function(d) {
                return projection([+d.LONGITUD, +d.LATITUDE]);
            });
            var center_x = coords[0][0];
            var center_y = coords[0][1];
            var route = leaves.map(function(d) {
              return d['ROUTE'] });
            var light = leaves.map(function(d) {
              return d['LGT_COND'] });
             return {
                  'x' : center_x,
                  'y' : center_y,
                  'route' : route[0],
                  'light' : light[0]
                };
         })
         .entries(data);

      function key_func(d) {
        return d.key;
      };

/*      g.append('g')
         //.attr("class", "bubble")
         .selectAll("circle")
         .data(nested, key_func)
         .enter()
         .append("circle")
         .attr('cx', function(d) { return d.values[0].values['x']; })
         .attr('cy', function(d) { return d.values[0].values['y']; })
         .attr('r' , 1)
         .style('opacity', .1)
         .attr('fill', 'red');
*/
      // draw the full set of accidents by calling function update with -1:
      update(-1);

      //////////////////////////////////////
      // function update() cycles through the hours of accidents
      //////////////////////////////////////
      function update(hour) {

        // remove the text for showing the total numbers of accident in the hour of day time
        d3.selectAll('#total').remove();

        // if hours = -1, show all traffic accidents
        if (hour === -1) {
          var filtered = nested;
          var opacity = .1;
          var radius = 1;
          var headline = "Arteries of Accidents across US States";
          var string = "Amount of Accidents: " + filtered.length;
          console.log(string);
        } else {
          var filtered = nested.filter(function(d) {
            return d.values[0].key == hour;
          });
          var opacity = .5;
          var headline = "Arteries of Accidents across US States, at " + hour + ":00 o'clock";
          var string = "Amount of Accidents at " + hour + ":00: "+ filtered.length;
          console.log(string);
        }

        var circles = g.selectAll('circle')
                         .data(filtered, key_func);
debugger;
        circles.exit()
               .transition()//.duration(500)
               .style('opacity', 0)
               .remove();

        circles.enter()
               .append("circle")
               //.transition()
               //.duration(500)
               .attr('cx', function(d) { return d.values[0].values['x']; })
               .attr('cy', function(d) { return d.values[0].values['y']; })
               .attr('fill', 'red')
               .style('r' , 1)
               .style('opacity', opacity);
        d3.select('chart.chart h2').text(headline);
        var text = svg.append('text')
          .attr('id', 'total')
          .text(string)
          .attr('x', width * .75)
          .attr('y', height * .01)
          .attr('dy','3em')
          .style("font-weight", 600)
          .style("font-size", "1.1em");
        // obtain its bounding box (without considering transforms)
        var bbox = text[0][0].getBBox()

        // insert a rect beneath the text, to represent the bounding box
        svg.append('rect','text')
          .attr('x', bbox.x)
          .attr('y', bbox.y)
          .attr('width', bbox.width + 5)
          .attr('height', bbox.height + 5)
          .style('fill', 'lightgrey')
          .style('opacity', .4)
           };

     //update(3);
    /* var road_class = [];
     for (var i = 1; i < 24; i++) {
       road_class.push(i);
     }*/
    //var slide = d3.select("chart.chart").call(d3.slider().axis(true).min(0).max(23).step(1));
    /*slide.call(d3.slider().on("slide", function(evt, value) {
      var year = value/100 * 23;
      console.log("The sliders current value is" + value);
    }));*/

    // define the slider content
    var slide = d3.select("#slider").call(d3.slider().axis(d3.svg.axis().orient("bottom").ticks(25))
        .min(-1).max(23).step(1)
        .on("slide", function(evt, value) {
          var hour = Math.round(value);
          console.log(hour);
          d3.select('chart.chart h2').text("Arteries of Accidents across US States, at time: " + hour + ":00");
          update(hour);
      }));
/*
     var road_class_idx = 0;
     // here we cycle through the road classes
     var road_class_interval = setInterval(function(d) {
       update(road_class[road_class_idx]);
       road_class_idx++;

       if(road_class_idx >= road_class.length) {
         clearInterval(road_class_interval);
       }
     }, 2000);
*/
  };

  d3.tsv("z_accident_test.tsv", function(d) {
    d['FATALS'] = +d['FATALS'];
    d['DAY_WEEK'] = +d['DAY_WEEK'];
    d['LGT_COND'] = +d['LGT_COND'];
    d['ROUTE'] = +d['HOUR'];
    return d;
  }, draw_points);
};

//////////////////////////////////////
// function barchart_total() shows the distribution of accidents
// over months
//////////////////////////////////////
function barchart_total() {

    var margin = {top: 60, right: 40, bottom: 60, left: 60},
        width = 750 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  // explanatory text
  d3.select('chart.chart h2')
    .text("Seasonal Trends of Traffic Accidents");

  var explanation = "A peak season for fatal accidents seem to be summer and \
  autumn months. Interestingly during the snowy season the amount of accidents \
  are slightly decreasing.";

  d3.select('chart.chart p').text(explanation);

  var svg = d3.select("chart.chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scale.ordinal().rangeRoundBands([0, width],0.1),
      y = d3.scale.linear().range([height, 0]);

  var month_ = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  d3.tsv("z_accident_test.tsv", function(d) {
        d['FATALS'] = +d['FATALS'];
        d['DAY_WEEK'] = +d['DAY_WEEK'];
        d['LGT_COND'] = +d['LGT_COND'];
        d['ROUTE'] = +d['ROUTE'];
        d['MONTH'] = +d['MONTH'];
        d['MONTH'] = month_[d['MONTH']-1]; // assign abbreviated names to variable

        return d;
      }, function(error, data) {
    if (error) throw error;

    function agg_fatalities(leaves) {
        var total = d3.sum(leaves, function(d) {
            return d['FATALS'];
        });
        return {
            'fatalities' : total,
        };
    }

    var nested = d3.nest()
                   .key(function(d) {
                        return d['MONTH'];
                   })
                   .rollup(agg_fatalities)
                   .entries(data);

    x.domain(data.map(function(d) { return d['MONTH']; }));
    y.domain([0, d3.max(nested, function(d) { return d.values.fatalities; })]);

    var tooltip = d3.select('chart.chart').append('div')
         .attr('class', 'hidden tooltip')
         .style("opacity", .9);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("text")             // text label for the x axis
        .attr("x", width / 2 )
        .attr("y", (height + margin.bottom/2 + 10))
        .style("text-anchor", "middle")
        .text("Months");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(20);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        //.attr("y", 0 - margin.left)
        .attr("y", -60 )
        .attr("x", 0 - (height / 2 ))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Fatal Accidents");

    svg.selectAll(".bar")
      .data(nested)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.key); })
        .attr("y", function(d) { return y(d.values.fatalities); })
        .attr("width", x.rangeBand())
        .attr("height", function(d) { return height - y(d.values.fatalities); })
        .on("mouseover", function(d) { // add a simple tooltip
                    tooltip.transition()
                        .attr("class", "tooltip")
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html('Month: ' + d.key + '\n' + 'Fatalities: ' + d.values.fatalities)
                        .style("left", x(d.key) + x.rangeBand() + "px")
                        .style("width", 2 * x.rangeBand() + "px")
                        .style("top", y(d.values.fatalities) + margin.top + margin.bottom / 2 + "px");
                    })
        .on("mouseout", function(d) { // remove the tooltip
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0.00001)
                        .attr("class", "hidden tooltip");
                    })
        // step-by-step fade-in of bars
        .attr('opacity', 0)
        .transition()
            .delay(function(d,i){return i * 200;})
            .duration(500)
            .attr("opacity", 1);
  });
}

///////////////////////////////////////////
// this is the function for the break down on week days
// also different circumstances like alcohol or weather and light conditions
// are considered
///////////////////////////////////////////
function barchart() {

  var margin = {top: 60, right: 40, bottom: 60, left: 60},
      width = 900 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

  // explanatory text
  d3.select('chart.chart h2')
    .text("Carefully choose the Week Day to Travel!");

  var explanation = "Putting the spot light on week days and day time of the \
  accidents, we discover a steady increase of accidents towards the weekends. \
  It seems that at the beginning of the week, road users tend to be more careful.\
  Assumably, the increased rate of accidents on weekends are due to drunk driving.\
  Selecting the radio button 'Drunken Driver' we can confirm this assumption. \
  The amount of accidents incline drastically by almost 50% on weekends. \
  Whereas the biggest portion of accidents are happening independently from \
  weather conditions. Interestingly the portions of accidents during daylight \
  versus night time are steadily from Monday to Friday, reaching an inversion \
  on weekends. I assume that night travels are increasing on weekends and in \
  combination with consuming alcolhol it results in deadly accidents \
  (c.f. radio button 'Visibility').";

  d3.select('chart.chart p').text(explanation)

  var svg = d3.select("chart.chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  var weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  var x = d3.scale.ordinal().rangeRoundBands([0, width],0.1);
  var y = d3.scale.linear().range([height, 0]);

  d3.tsv("z_accident_test.tsv", function(d) {
      d['FATALS'] = +d['FATALS'];
      d['WEATHER1'] = +d['WEATHER1'];
      d['LGT_COND'] = +d['LGT_COND'];
      return d;
  }, function(error, dataset) {
      if (error) throw error;
      //data.sort(function(a,b) {return b.day_week-a.day_week;});
      function agg_fatalities(leaves) {
          var total = d3.sum(leaves, function(d) {
              return d['FATALS'];
          });
          var drunken = d3.sum(leaves, function(d) {
              if (d['DRUNK_DR'] >= 1) { return 1 };
          });
          // create the weather variables
          var weather_clear = d3.sum(leaves, function(d) {
              if (d['WEATHER1'] === 1) { return 1 };
          });
          var weather_cloudy = d3.sum(leaves, function(d) {
              if (d['WEATHER1'] === 10) { return 1 };
          });
          var weather_rain = d3.sum(leaves, function(d) {
              if (d['WEATHER1'] === 2) { return 1 };
          });
          var weather_snow = d3.sum(leaves, function(d) {
              if (d['WEATHER1'] === 4) { return 1 };
          });
          var weather_fog = d3.sum(leaves, function(d) {
              if (d['WEATHER1'] === 5) { return 1 };
          });
          var weather_rest = d3.sum(leaves, function(d) {
              if (d['WEATHER1'] >= 11 || d['WEATHER1'] === 6 || d['WEATHER1'] === 7 || d['WEATHER1'] === 8 || d['WEATHER1'] === 3)
              { return 1 };
          });
          var daylight = d3.sum(leaves, function(d) {
              if (d['LGT_COND'] === 1) { return 1 };
          });
          var dark = d3.sum(leaves, function(d) {
              if (d['LGT_COND'] === 2 || d['LGT_COND'] === 3 || d['LGT_COND'] === 6) { return 1 };
          });
          var dusk_dawn = d3.sum(leaves, function(d) {
              if (d['LGT_COND'] === 4 || d['LGT_COND'] === 5) { return 1 };
          });
          var unknown = d3.sum(leaves, function(d) {
              if (d['LGT_COND'] >= 7) { return 1 };
          });

          // fill variables with respective accidents per alcohol, weather or
          // light condition
          return {
              'fatalities'  : total,
              'Drunken'     : drunken,
              'Non Drunken'  : total - drunken,
              'Clear': weather_clear,
              'Cloudy': weather_cloudy,
              'Rain': weather_rain,
              'Snow': weather_snow,
              'Fog' : weather_fog,
              'Rest': weather_rest,
              'Daylight' : daylight,
              'Dark' : dark,
              'Dusk/Dawn' : dusk_dawn,
              'Unknown' : unknown
          };
      }

      var data = d3.nest()
                     .key(function(d) {
                          return d['DAY_OF_WEEK'];
                     })
                     .rollup(agg_fatalities)
                     .entries(dataset);
      //console.log(data[0]);

      // prepare domains and axes:
      var x0 = d3.scale.ordinal()
          .rangeRoundBands([0, width], .1);

      var x1 = d3.scale.ordinal();

      var y = d3.scale.linear()
          .range([height, 0]);

      // define a color brewer set of colors in single hue blue
      var color = d3.scale.ordinal()
          .range(["lightgrey", "#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"]);

      var xAxis = d3.svg.axis()
          .scale(x0)
          .orient("bottom");

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")


  ///////////////////////////////////////////
  // this function allows to switch through various conditions
  ///////////////////////////////////////////
  function draw(subcat, update) {
    console.log(subcat, update)

    data.forEach(function(d) {
      d.day = subcat.map(function(name) { return {
        name: name, value: +d.values[name]};
      });
      console.log(d.day);
    });

    x0.domain(data.map(function(d) { return d.key; }));
    x1.domain(subcat).rangeRoundBands([0, x0.rangeBand()]);

    y.domain([0, d3.max(data, function(d) {
      return d3.max(d.day, function(d) { return d.value; });
    })]);

    svg.selectAll("g.y.axis").remove()
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text") // text label for the x axis
        .attr("x", width / 2 )
        .attr("y", (height + margin.bottom/2 + 10))
        .style("text-anchor", "middle")
        .text("Days of the Week");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Fatal Accidents");

    var category = svg.selectAll(".category")
        .data(data)
      .enter().append("g")
        .attr("class", "key")
        .attr("transform", function(d) {
          return "translate(" + x0(d.key) + ",0)"; });

    var rects = category.selectAll("rect")
         .data(function(d) { return d.day; })

    var number = d3.format(","); // format of numbers

    if (update) {
      console.log(subcat, update);
      // remove all elements drawn before the update
      svg.selectAll("rect").remove();
      svg.selectAll("g.legend").remove();
      svg.selectAll("text.datalabel").remove();

      rects.enter().append("rect")
          .attr("y", function(d) { return y(0); }) // start y-position for rect
          .attr("height", 0) //start height
          .attr("width", x1.rangeBand())
          .attr("x", function(d) { return x1(d.name); })
          .transition().duration(1750)
          .attr("y", function(d) { return y(d.value); })
          .attr("height", function(d) { return height - y(d.value); })
          .style("fill", function(d) { return color(d.name); });
      // add labels to each bar
      rects.enter().append("text")
            .attr("class", "datalabel")
            .attr("x", function(d) { return x1(d.name) + x1.rangeBand()/2; })
            .attr("y",  function(d) { return y(d.value) - 10; } )
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style('font-size', '.6em')
            .style('opacity', 0.0001)
            .transition().duration(1500)
            .style('opacity', 1)
            .text(function(d) { return number(d.value); });
      var legend = svg.selectAll(".legend")
        .data(subcat.slice().reverse())
      .enter().append("g")
        .attr("class", "legend")
        //.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
        .attr("transform", function(d, i) { return "translate(30," + ( i * 20 - 50 ) + ")"; });

      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d; });

    } else {
      console.log(subcat, update);
      svg.selectAll("rect").remove();
      svg.selectAll("g.legend").remove();
      svg.selectAll("text.datalabel").remove();

      rects.enter().append("rect")
          .attr("y", function(d) { return y(0); }) // start y-position for rect
          .attr("height", 0) //start height
          .attr("width", x1.rangeBand())
          .attr("x", function(d) { return x1(d.name); })
          .transition().duration(1750)
          .attr("y", function(d) { return y(d.value); })
          .attr("height", function(d) { return height - y(d.value); })
          .style("fill", function(d) { return color(d.name); });
      // add labels to each bar
      rects.enter().append("text")
            .attr("class", "datalabel")
            .attr("x", function(d) { return x1(d.name) + x1.rangeBand()/2; })
            .attr("y",  function(d) { return y(d.value) - 10; } )
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style('font-size', '.6em')
            .style('opacity', 0.0001)
            .transition().duration(1500)
            .style('opacity', 1)
            .text(function(d) { return number(d.value); });
      rects.exit().remove();


      var legend = svg.selectAll(".legend")
          .data(subcat.slice().reverse())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(30," + ( i * 20 - 50 ) + ")"; });

      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d; });

    }
}
        ///////////////////////////////////////////
        // this function is called when radio button is selected
        // another sub-function draw with the sub-categories and
        // a binary flag if the initial state shall be called
        ///////////////////////////////////////////
        function update(selector) {

          // choose variables to draw according to radio button selector
          switch (selector) {
            case '0':
              var subcat = ["fatalities"];
              draw(subcat, false);
              break;
            case '1':
              var subcat = ["Drunken", "Non Drunken"];
              draw(subcat, true);
              break;
            case '2':
              var subcat = ["Clear", "Cloudy", "Rain", "Snow", "Fog", "Rest"];
              draw(subcat, true);
              break;
            case '3':
              var subcat = ["Daylight", "Dark", "Dusk/Dawn", "Unknown"];
              draw(subcat, true);
              break;
          }
        }

    // draw initial bar chart with total fatalities:
    var subcat = ["fatalities"];
    draw(subcat, false);

    // define the labels of radio buttons
    var selector = ["\xa0\xa0Total\xa0\xa0", "\xa0\xa0 Drunken Driver\xa0\xa0", "\xa0\xa0Adverse Weather\xa0\xa0", "\xa0\xa0Visibility\xa0\xa0"];

    j = 0;  // Choose Total as default

    // Create the shape selectors
    var form = d3.select("div.col-sm-10").append("form");

    var labelEnter = form.selectAll("span")
        .data(selector)
        .enter().append("span")
        .on("click", function (d, i) {
          // call update with the id of the selected button
          update(d3.select('input[name="mode"]:checked').node().value);
        });

    labelEnter.append("input")
        .attr({
            type: "radio",
            class: "shape",
            name: "mode",
            value: function(d, i) {return i;}
        })
        .property("checked", function(d, i) {
            return (i===j);
        });

    labelEnter.append("label").text(function(d) {return d;});
  });
};

  ///////////////////////////////////////////
  // this function is not used!
  ///////////////////////////////////////////
  function linechart() {
    d3.select('chart.chart h2')
      .text("Dangerous Rush-Hour");
    var explanation = "dummy text";
    var margin = {top: 60, right: 40, bottom: 60, left: 60},
        width = 900 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // explanatory text
    d3.select('chart.chart p').text(explanation)

    var svg = d3.select("chart.chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scale.ordinal().rangeRoundBands([0, width],0.1);
    var y = d3.scale.linear().range([height, 0]);

    // define axes
    var xAxis = d3.svg.axis().scale(x)
      .orient('bottom')
      .ticks(12)
      .innerTickSize(-height)
      .outerTickSize(0)
      .tickPadding(10);
    var yAxis = d3.svg.axis().scale(y)
      .orient('left')
      .ticks(10);

    d3.tsv("person.tsv", function(d) {
        // create variable date with a javascript date
        d.hour = +d['HOUR'];
        d['INJ_SEV'] = +d['INJ_SEV'];
        d['PER_TYP'] = +d['PER_TYP'];
        return d;
    }, function(error, dataset) {
        if (error) throw error;
        dataset.sort(function(a,b) {return a.hour-b.hour;});
        function agg_fatalities(leaves) {
            //var total = d3.sum(leaves, function(d) {
            var total = d3.sum(leaves, function(d) {
              if (d['INJ_SEV'] === 4) { return 1 ;}
            });
            var driver = d3.sum(leaves, function(d) {
              if (d['PER_TYP'] === 1) { return 1 ;}
            });
            var passenger = d3.sum(leaves, function(d) {
              if (d['PER_TYP'] === 2) { return 1 ;}
            });
            var pedestrian = d3.sum(leaves, function(d) {
              if (d['PER_TYP'] === 5) { return 1 ;}
            });
            var bicyclist = d3.sum(leaves, function(d) {
              if (d['PER_TYP'] === 6) { return 1 ;}
            });
            return {
                'fatalities'  : total,
                'driver'      : driver,
                'passenger'   : passenger,
                'pedestrian'  : pedestrian,
                'bicyclist'   : bicyclist
            };
        }
  //debugger;
        var data = d3.nest()
                       .key(function(d) {
                            return d.hour + ":00"; })
                       //.sortValues(d3.ascending)
                       .rollup(agg_fatalities)
                       .entries(dataset);
        //console.log(data[0]);

        categories = ['total', 'driver', 'passenger', 'pedestrian', 'bicyclist']

        categories.forEach(function (d) {
          switch (d) {
            case 'total':
              var data = d3.nest()
                            .key(function(d) {
                              return d.hour + ":00"; })
                            .rollup( function(v) {
                              return d3.sum(v, function(d) {
                                if (d['INJ_SEV'] === 4) { return 1 ;}}
                              )
                            })
                            .entries(dataset);
              break;
            case 'driver':
              var data = d3.nest()
                            .key(function(d) {
                              return d.hour + ":00"; })
                            .rollup( function(v) {
                              return d3.sum(v, function(d) {
                                if (d['INJ_SEV'] === 4 && d['PER_TYP'] === 1) {
                                  return 1 ;}}
                              )
                            })
                            .entries(dataset);
              break;
              case 'passenger':
                var data = d3.nest()
                              .key(function(d) {
                                return d.hour + ":00"; })
                              .rollup( function(v) {
                                return d3.sum(v, function(d) {
                                  if (d['INJ_SEV'] === 4 && d['PER_TYP'] === 2) {
                                    return 1 ;}}
                                )
                              })
                              .entries(dataset);
                break;
              case 'pedestrian':
                var data = d3.nest()
                              .key(function(d) {
                                return d.hour + ":00"; })
                              .rollup( function(v) {
                                return d3.sum(v, function(d) {
                                  if (d['INJ_SEV'] === 4 && d['PER_TYP'] === 5) {
                                    return 1 ;}}
                                )
                              })
                              .entries(dataset);
                break;
              case 'bicyclist':
                var data = d3.nest()
                              .key(function(d) {
                                return d.hour + ":00"; })
                              .rollup( function(v) {
                                return d3.sum(v, function(d) {
                                  if (d['INJ_SEV'] === 4 && d['PER_TYP'] === 6) {
                                    return 1 ;}}
                                )
                              })
                              .entries(dataset);
                break;
              };
              debugger;

        console.log(data);
        // create a data nest setting values to zero, just for fading in the line
        var data_transition = d3.nest()
                              .key(function(d) {
                                return d.hour + ":00"; })
                              .rollup( function(v) { return 0 })
                              .entries(dataset);

        // define the linear
        var valueline = d3.svg.line()
          .x(function(d) { return x(d.key)})
          .y(function(d) { return y(d.values)})
        // scale the range of the data
        x.domain(data.map(function(d) {
          if (d.key != 99) {return d.key; }
        }));
        y.domain([0, d3.max(data, function(d) { return d.values; })]);
        // add the valueline path
        svg.append('path')
          .attr('class', 'line')
          .style('stroke', 'red')
          .style('stroke-width', 2.5)
          .attr('d', valueline(data_transition))
          .transition().duration(1750)
          .attr('d', valueline(data));
      }); // end of forEach loop
        // add the x axis
        svg.append('g')
          .attr('class', 'axis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis)
          .append("text") // text label for the x axis
            .attr("x", width / 2 )
            //.attr("y", (height + margin.bottom/2 + 10))
            .attr("y", margin.bottom/1.5)
            .style("text-anchor", "middle")
            .text("Hour of the Day");

        // add the y axis
        svg.append('g')
          .attr('class', 'y axis')
          .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Casualties");

      //Draw the rectangle
     var rectangle = svg.append("rect")
                       .attr("x", 6* x.rangeBand())
                       .attr("y", 0)
                       .attr("width", 3*x.rangeBand())
                       .attr("height", height)
                       .attr("opacity", .1)
                       .attr("fill", "orange");


     var focus = svg.append("g")
         .attr("class", "focus")
         .style("display", "none");
    // append the circle at the intersection
    focus.append("circle")
      .style("fill", "blue")
      .style("stroke", "blue")
      .attr("r", 4)

    focus.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");
    // append the rectangle to capture mouse
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    var tickPos = x.range();
    function mousemove(d){
      var m = d3.mouse(this),
          lowDiff = 1e99,
          xI = null;
      // if you have a large number of ticks
      // this search could be optimized
      for (var i = 0; i < tickPos.length; i++){
        var diff = Math.abs(m[0] - tickPos[i]);
        if (diff < lowDiff){
          lowDiff = diff;
          xI = i;
        }
      }

      focus
        .select('text')
        //.text(ticks[xI]);
        .text(data[xI].values)
      focus
        .select('circle')
        .style("fill", "blue")
        .style("stroke", "blue")
        .attr("r", 4)
        .attr("transform","translate(" + tickPos[xI] + "," + y(data[xI].values) + ")");
      focus
        .attr("transform","translate(" + tickPos[xI] + "," + y(data[xI].values) + ")");
    }
//  debugger;
  });
}

/* code from https://leanpub.com/D3-Tips-and-Tricks/read#leanpub-auto-multi-line-graph-with-automatic-legend-and-toggling-show--hide-lines */
///////////////////////////////////////////
// this is the function for plotting the daily distribution to hours
///////////////////////////////////////////
function linechart2() {
  // Set the dimensions of the canvas / graph
  d3.select('chart.chart h2')
    .text("Dangerous Rush-Hours");
  var explanation = "There is no clear zenith obserable during the course of \
  the day. Obscurely, there is a small peak at 09:00 a.m., stemming from \
  passengers finding their death in traffic accidents. Two rush hours are \
  marked with a 'red carpet': Although from the absolute numbers insignificant\
  , a risen plateau can be seen for diseased pedestrians and bicyclist.";

  var hint = "You can use the colored texts to switch corresponding categories \
  on and off.";

  // explanatory text
  d3.select('chart.chart p').text(explanation)
  d3.select('p.hint').text(hint).style('font-weight', 'bold');
  
  var margin = {top: 30, right: 20, bottom: 70, left: 50},
      width = 900 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;
  // Set the ranges
  var x = d3.scale.ordinal().rangeRoundBands([0, width], 1);
  //var y = d3.scale.linear().range([height, 0]);
  var y = d3.scale.log().range([height, 1]);
  // Define the axes
  var xAxis = d3.svg.axis().scale(x)
      .orient("bottom").ticks(5)
      .tickSize(6, 0);
  var yAxis = d3.svg.axis().scale(y)
      .orient("left")
      .ticks(10, ",.1")
      .tickSize(6, 0)
      .innerTickSize(-width)
      .outerTickSize(0)
      .tickPadding(10);
  // Define the line
  var priceline = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.price); });

  var priceline_trans = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return 0; });

  // Adds the svg canvas
  var svg = d3.select("chart.chart")
      .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
      .append("g")
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
  // Get the data
  d3.csv("stocks.csv", function(error, data) {
      data.forEach(function(d) {
  		//d.date = parseDate(d.date);
  		d.date = d.date + ":00";
      d.price = +d.price;
      });
      // Scale the range of the data
      //x.domain(d3.extent(data, function(d) { return d.date; }));
      x.domain(data.map(function(d) { return d.date; }));
      y.domain([1, d3.max(data, function(d) { return d.price; })]);
      // Nest the entries by symbol
      var dataNest = d3.nest()
          .key(function(d) {return d.symbol;})
          .entries(data);

      var color = d3.scale.category10();

      legendSpace = width/dataNest.length; // spacing for legend // ******
      // Loop through each symbol / key
      dataNest.forEach(function(d,i) {
          svg.append("path")
              .attr("class", "line")
              .style("stroke-width", 2)
              .style('fill', 'none')
              .on("mouseover", function() {
                d3.select(this).classed("hover", true);
                })
              .on("mouseout", function() {
                d3.select(this).classed("hover", false);
                })
              .style("stroke", function() {
                  return d.color = color(d.key); })
              .attr("id", 'tag'+d.key.replace(/\s+/g, '')) // assign ID **
              .attr("d", priceline_trans(d.values))
              .transition().duration(1000)
              .attr("d", priceline(d.values));
      svg.selectAll('line').attr("fill", "none")


      // Add the Legend
      svg.append("text")
          .attr("x", width - margin.right*4 - 10) // spacing
          .attr("y", height - margin.bottom*2)
          .style("font-weight", "normal")
          .style("font-size", "1em")
          .text("Legend");

      svg.append("text")
          //.attr("x", (legendSpace/2)+i*legendSpace) // spacing
          //.attr("y", height + (margin.bottom/2)+ 5)
          .attr("x", width - margin.right*4) // spacing
          .attr("y", height - i*20 - margin.bottom/2)
          .attr("class", "legend")    // style the legend
          .style("font-weight", 600)
          .style("font-size", "1em")
          .style("fill", function() { // dynamic colours
              return d.color = color(d.key); })
          .on("click", function(){
              // Determine if current line is visible
              var active   = d.active ? false : true,
              newOpacity = active ? 0 : 1;
              // Hide or show the elements based on the ID
              d3.select("#tag"+d.key.replace(/\s+/g, ''))
                  .transition().duration(1000)
                  .style("opacity", newOpacity);
              // Update whether or not the elements are active
              d.active = active;
              })
          .text(d.key);

        //Draw a rectangle for rush hours
       var rectangle = svg.append("rect")
         .attr("x", x("5:00"))
         .attr("y", -margin.top)
         .attr("width", x("9:00") - x("5:00"))
         .attr("height", height+margin.top)
         .attr("opacity", 0)
         .transition().duration(1000)
         .attr("opacity", .05)
         .attr("fill", "red")
       var rectangle = svg.append("rect")
         .attr("x", x("16:00"))
         .attr("y", -margin.top)
         .attr("width", x("20:00") - x("16:00"))
         .attr("height", height+margin.top)
         .attr("opacity", 0)
         .transition().duration(1000)
         .attr("opacity", .05)
         .attr("fill", "red");
       // add text to rectangles
       svg.append("text")
           .attr("x", (x("9:00") - x("5:00"))/2 + x("5:00") )
           .attr("y", -margin.top/2)
           .style("text-anchor", "middle")
           .text("Rush-Hour");
       svg.append("text")
           .attr("x", (x("20:00") - x("16:00"))/2 + x("16:00") )
           .attr("y", -margin.top/2)
           .style("text-anchor", "middle")
           .text("Rush-Hour");
      });
      // Add the X Axis
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
      // Add the Y Axis
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -6)
            .attr("dy", "1.71em")
            .style("text-anchor", "end")
            .text("Casualties");
  });
}
