
var redistritacion = new Array(
  "2015",
  "2005",
  "1996",
  "1977",
);
redistritacion.reverse();

function addComas(n) {
  var formatValue = d3.format("0,000");
  return formatValue(n)
    .replace(".", ",")
    .replace(".", ",");
}
var colores = ['#ffffcc','#c7e9b4','#7fcdbb','#41b6c4','#2c7fb8','#253494'];

function getColor(d) {
  return d > 35
    ? colores[5]
    : d > 25
    ? colores[4]
    : d > 15
    ? colores[4]
    : d > 10
    ? colores[2]
    : d > 5
    ? colores[1]
    : colores[0];
}

var div = d3
  .select("#wrapper")
  .append("div")
  .attr("class", "tooltip")
  .attr("opacity", 0);

var wmap = 800;
var hmap = 600;
var projection = d3.geo
  .mercator()
  .translate([2900, 850])
  .scale([1400]);

var path = d3.geo.path().projection(projection);
var map = d3
  .select("#mapa")
  .append("svg")
  .attr("width", wmap)
  .attr("height", hmap);

d3.select("#tasa").html(
  "Distritos" + redistritacion[redistritacion.length - 1].substring(5)
);
d3.select("#year").html(redistritacion[redistritacion.length - 1].substring(0, 4));

var height = 330,
  width = 885,
  trans = 60;
var w = 950,
  h = 380;
var aux = redistritacion.length - 1;
var width_slider = 920;
var height_slider = 50;
d3.csv("../data/historico.csv", function(data) {
  d3.json("../data/mexico.json", function(json) {
    /* ------SLIDER----- */
    var svg = d3
      .select("#slider")
      .attr("class", "chart")
      .append("svg")
      .attr("width", width_slider)
      .attr("height", height_slider);
    var yeardomain = [0, redistritacion.length - 1];
    var axisyears = [
      parseFloat(redistritacion[0].substring(0, 4)),
      parseFloat(redistritacion[0].substring(0, 4)),
      parseFloat(redistritacion[0].substring(0, 4)),
      parseFloat(redistritacion[redistritacion.length - 1].substring(0, 4))
    ];

    var pointerdata = [
      {
        x: 0,
        y: 0
      },
      {
        x: 0,
        y: 25
      },
      {
        x: 25,
        y: 25
      },
      {
        x: 25,
        y: 0
      }
    ];
    var scale = d3.scale
      .linear()
      .domain(yeardomain)
      .rangeRound([0, width]);
    var x = d3.svg
      .axis()
      .scale(scale)
      .orient("top")
      .tickFormat(function(d) {
        return d;
      })
      .tickSize(0)
      .tickValues(axisyears);
    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + 15 + ",0)")
      .call(x);
    var drag = d3.behavior
      .drag()
      .origin(function() {
        return {
          x: d3.select(this).attr("x"),
          y: d3.select(this).attr("y")
        };
      })
      .on("dragstart", dragstart)
      .on("drag", dragmove)
      .on("dragend", dragend);

    svg
      .append("g")
      .append("rect")
      .attr("class", "slideraxis")
      .attr("width", width_slider)
      .attr("height", 7)
      .attr("x", 0)
      .attr("y", 16);
    var cursor = svg
      .append("g")
      .attr("class", "move")
      .append("svg")
      .attr("x", width)
      .attr("y", 7)
      .attr("width", 30)
      .attr("height", 60);

    cursor.call(drag);
    var drawline = d3.svg
      .line()
      .x(function(d) {
        return d.x;
      })
      .y(function(d) {
        return d.y;
      })
      .interpolate("linear");

    //---------------------------
    cursor
      .append("path")
      .attr("class", "cursor")
      .attr("transform", "translate(" + 7 + ",0)")
      .attr("d", drawline(pointerdata));
    cursor.on("mouseover", function() {
      d3.select(".move").style("cursor", "hand");
    });

    function dragmove() {
      var x = Math.max(0, Math.min(width, d3.event.x));

      d3.select(this).attr("x", x);
      var z = parseInt(scale.invert(x));
      aux = z;

      drawMap(z);
    }

    function dragstart() {
      d3.select(".cursor").style("fill", "#003A5D");
    }

    function dragend() {
      d3.select(".cursor").style("fill", "#10CFC9");
    }
    for (var i = 0; i < data.length; i++) {
      var codeState = parseInt(data[i].code, 10);
      var dataValue = data[i][redistritacion[redistritacion.length - 1]];
      for (var j = 0; j < json.features.length; j++) {
        var jsonState = json.features[j].properties.gn_a1_code;
        var stateId = parseInt(jsonState.split('.')[1], 10);

        if (codeState == stateId) {
          json.features[j].properties.value = parseInt(dataValue, 10);
          break;
        }
      }
      
    }
    var cont = map
      .selectAll("#mapa path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("class", "path")
      .attr("d", path)
      .style("fill", function(d) {
        return getColor(d.properties.value);
      })
      .attr("fill-opacity", "1")
      .attr("stroke", "#03393d")
      
      .attr("stroke-width", 0.3)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout);
 

    function mouseover(d) {
      d3.select(this)
        .attr("stroke-width", "1px")
        .attr("fill-opacity", "0.9");
      div.style("opacity", 0.9);
      div.html(
        "<b>" +
          d.properties.name +
          "</b></br>Distritos: <b>" +
          addComas(data[parseInt(d.properties.gn_a1_code.split('.')[1], 10) - 1][redistritacion[aux]]) +
          "</b> <br>" 
      );
    }

    function mouseout(d) {
      d3.select(this)
        .attr("stroke-width", ".3")
        .attr("fill-opacity", "1");
      div.style("opacity", 0);
    }

    function mousemove(d) {
      div.style({
        left: function() {
          if (d3.event.pageX > 780) {
            return d3.event.pageX - 180 + "px";
          } else {
            return d3.event.pageX + 23 + "px";
          }
        },
        top: d3.event.pageY - 20 + "px"
      });
    }
    //maxMin(data, aux);
    function drawMap(index) {
      d3.select("#tasa").html("Distritos" + redistritacion[index].substring(5));
      d3.select("#year").html(redistritacion[index].substring(0, 4));
      cont.style("fill", function(d) {
        for (var i = 0; i < data.length; i++) {
          var codeState = parseInt(data[i].code, 10);
          var dataValue = data[i][redistritacion[index]];

          for (var j = 0; j < json.features.length; j++) {
            var jsonState = json.features[j].properties.gn_a1_code;
            var stateId = parseInt(jsonState.split('.')[1], 10);

            if (codeState == stateId) {
              json.features[j].properties.value = parseInt(dataValue, 10);
              break;
            }
          }
        }
        var value = d.properties.value;
        if (value) {
          return getColor(value);
        } else {
          return "#ccc";
        }
      });
      cont
        .on("mousemove", function(d) {
          div.style("opacity", 0.9);
          div
            .html(
              "<b>" +
                d.properties.name +
                "</b></br>Distritos: <b>" +
                addComas(data[parseInt(d.properties.gn_a1_code.split('.')[1], 10) - 1][redistritacion[aux]]) +
                "</b> <br>" 
            )
            .style("left", function() {
              if (d3.event.pageX > 780) {
                return d3.event.pageX - 180 + "px";
              } else {
                return d3.event.pageX + 23 + "px";
              }
            })
            .style("top", d3.event.pageY - 20 + "px");
        })
        .on("mouseout", function() {
          return div.style("opacity", 0);
        })
        .on("mouseout", mouseout);
    }
  });
});

d3.select("#wrapper").on("touchstart", function() {
  div
    .transition()
    .duration(100)
    .style("opacity", 0);
});
