// check if value is int
function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}

// set the dimensions and margins of the graph
var dimPolar = {top: 10, right: 10, bottom: 10, left: 10};
dimPolar.width = 550 - dimPolar.left - dimPolar.right;
dimPolar.height = 550 - dimPolar.top - dimPolar.bottom;

var chartPolar = d3.select("#chart1").append("svg")
    .attr('id', 'pie')
    .attr("class", "center-block")
    .attr("width", dimPolar.width + dimPolar.left + dimPolar.right)
    .attr("height", dimPolar.height + dimPolar.top + dimPolar.bottom)
  .append("g")
    .attr("transform",
          "translate(" + (dimPolar.width / 2  + dimPolar.left) + "," + (dimPolar.height / 2 + dimPolar.top) + ")")
    .attr("pointer-events", "all");

var rPolar = d3.scaleLinear()
    .range([0, dimPolar.height / 2])
    .domain([0, 250]);

var gr = chartPolar.append("g")
    .attr("class", "r axis")
  .selectAll("g")
    .data(rPolar.ticks(5).slice(1))
    .enter().append("g");

gr.append("circle")
  .attr("r", rPolar);

gr.append("text")
  .attr("y", function(d) { return rPolar(d) - 4; })
  .attr("transform", "rotate(-35)")
  .style("text-anchor", "middle")
  .text(function(d) { return d + " pc"; });

// cannot get zoom to work with this thing
//var gAngle = chartPolar.append("g")
//    .attr("class", "a axis")
//  .selectAll("g")
//    .data(d3.range(0, 360, 30))
//  .enter().append("g")
//    .attr("transform", function(d) { return "rotate(" + -d + ")"; });

//gAngle.append("line")
//  .attr("x2", dimPolar.height/2);

//------------------------
// Color-Magnitude diagram
//------------------------
var dimCMD = {top: 50, right: 50, bottom: 80, left: 80};
dimCMD.width = 350 - dimCMD.left - dimCMD.right;
dimCMD.height = 450 - dimCMD.top - dimCMD.bottom;

var chartCMD = d3.select("#chart2").append("svg")
    .attr("id", "cmd")
    .attr("class", "center-block")
    .attr("width", dimCMD.width + dimCMD.left + dimCMD.right)
    .attr("height", dimCMD.height + dimCMD.top + dimCMD.bottom)
    .attr("pointer-events", "all")
  .append("g")
    .attr("transform",
          "translate(" + dimCMD.left + "," + dimCMD.top + ")");
chartCMD.append("rect")
    .attr("x", -dimCMD.left)
    .attr("y", -dimCMD.top)
    .attr("width", dimCMD.width+dimCMD.left+dimCMD.right)
    .attr("height", dimCMD.height+dimCMD.top+dimCMD.bottom)
    .attr("fill", "white")
    .attr("opacity", 0.7)

var x = d3.scaleLinear()
  .range([0, dimCMD.width])
  .domain([-0.5, 2.5]);
var y = d3.scaleLinear()
  .range([dimCMD.height, 0])
  .domain([10, -2]);

var xAxis = d3.axisBottom(x)
    .tickSize(10)
    .ticks(5);
var gXcmd = chartCMD.append("g")
    .attr("transform", "translate(0," + dimCMD.height + ")")
    .call(xAxis)
    .attr("stroke-width", 1.5);
chartCMD.append("text")
     .attr("transform",
           "translate(" + (dimCMD.width / 2) + "," + (dimCMD.height + dimCMD.bottom *3/4 ) + ")")
      .style("text-anchor", "middle")
      .text("G-J")
      .style("font-size", 30);
// Add the Y Axis
var yAxis = d3.axisLeft(y);
var gYcmd = chartCMD.append("g")
    .call(yAxis)
    .attr("stroke-width", 1.5);
chartCMD.append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 0 - dimCMD.left / 2)
     .attr("x", - dimCMD.height / 2)
     .style("text-anchor", "middle")
     .text("absolute G magnitude")
     .style("font-size", 25);

// Define the div for the tooltip
var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

var colorCycle = d3.schemeCategory10;
var pts_mwsc;

// Milky Way Star Cluster data
d3.csv("mwsc.csv", function(error, mwsc) {
  if (error) throw error;

  mwsc.forEach(function (d) {
    d.GLON = +d.GLON;
    d.GLAT = +d.GLAT;
    d.d = +d.d;
    d.gX = d.d * Math.cos(d.GLAT*Math.PI/180) * Math.cos(d.GLON*Math.PI/180);
    d.gY = d.d * Math.cos(d.GLAT*Math.PI/180) * Math.sin(d.GLON*Math.PI/180);    
    d.Name = d.Name.replace('_', ' ');
  });

  pts_mwsc = chartPolar.append("g")
    .selectAll("circle")
    .attr("class", "cluster")
    .data(mwsc.filter(function (d) {return d.d < 350; }))
    .enter().append("circle")
      .attr("r", rPolar(10))
      .attr("cx", function (d) { return rPolar(d.gX); })
      .attr("cy", function (d) { return rPolar(d.gY); })
      .attr("fill", "skyblue")
      .attr("opacity", 0.4)
      //.style("pointer-events", "all")
      .on("click", function(d) {
        div.style("opacity", .9);
        div.html(d.Name)
           .style("left", (d3.event.pageX) + "px")    
           .style("top", (d3.event.pageY - 28) + "px");  
      })
      .on("mouseout", function(d) {
        div.style("opacity", 0)
      });
});

d3.json("data.json", function(error, graph) {
  if (error) throw error;

  // heliocentric galactic coordinates
  graph.nodes.forEach(function (d) {
    d.gX = d.dist * Math.cos(d.glat*Math.PI/180) * Math.cos(d.glon*Math.PI/180);
    d.gY = d.dist * Math.cos(d.glat*Math.PI/180) * Math.sin(d.glon*Math.PI/180);
  });

  // Reset zoom
  d3.select("button#reset")
      .on("click", resetted);
  
  function resetted() {
    chartPolar.transition()
        .duration(2000)
        .call(zoom.transform, d3.zoomIdentity);
  }

  // Zoom & Pan
  var zoom = d3.zoom()
      .scaleExtent([1/1.2,10])
      .on("zoom", zoomed);

  chartPolar.call(zoom);

  function zoomed() {
    //console.log(pts_mwsc);
    pts.attr("transform", d3.event.transform);
    gr.attr("transform", d3.event.transform);
    pts_mwsc.attr("transform", d3.event.transform);
    // link.attr("transform", d3.event.transform);
    // chartPolar.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    // chartPolar.attr("transform", "translate(" + d3.event.translate + ")");scale(" + d3.event.scale + ")");
    // console.log('slkdjfdksj');
    // chartPolar.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");

  }

  var ptsCMD = chartCMD.append("g")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
          .attr("r", 4)
          .attr("fill", "none")
          .attr("stroke-width", ".5px")
          .attr("opacity", 0.)
          .style("pointer-events", "all")
          .attr("cx", function(d) { return x(d.gj); })
          .attr("cy", function(d) { return y(d.gMag); })
          .attr("id", function(d) { return "id"+d.id; })
  
  // var link = chartPolar.append("g")
  //      .attr("class", "links")
  //    .selectAll("line")
  //    .data(graph.links.filter(function(d, i) {return graph.nodes[d.source].group < 100; }))
  //    .enter().append("line")
  //      .attr("stroke-width", 5)
  //      .attr("x1", function(d) { return rPolar(graph.nodes[d.source].gX); })
  //      .attr("y1", function(d) { return rPolar(graph.nodes[d.source].gY); })
  //      .attr("x2", function(d) { return rPolar(graph.nodes[d.target].gX); })
  //      .attr("y2", function(d) { return rPolar(graph.nodes[d.target].gY); });

  var pts = chartPolar.append("g")
        .selectAll("circle")
        .data(graph.nodes.filter(function(d, i) { return d.group < 100; }))
        .enter().append("circle")
          .attr("r", 1)
          .attr("fill", "black")
          .attr("opacity", 0.5)
          .attr("stroke-width", ".5px")
          .attr("cx", function(d) {
            return rPolar(d.gX); })
          .attr("cy", function(d) {
            return rPolar(d.gY); })
          .attr("id", function(d) { return "id"+d.id; })
          .attr("data-group", function(d) { return "g"+d.group; })
          .on("mouseenter", function(d) {
              var tmpcolor = colorCycle.shift();
              colorCycle.push(tmpcolor);
              var p = d3.selectAll("svg#pie").selectAll("circle")
                        .filter(function(dd, i) { return dd.group == d.group; })
                        .style("fill", tmpcolor)
                        .style("opacity", 0.8);
              var p = d3.selectAll("svg#cmd").selectAll("circle")
                        .filter(function(dd, i) { return dd.group == d.group; })
                        .style("fill", tmpcolor)
                        .style("opacity", 0.8);
              d3.selectAll("td#groupid").text(d.group);
              d3.select("td#groupsize").text(p.size());
            })
          .on("mouseleave", function(d) {
              var p = d3.selectAll("svg#pie").selectAll("circle")
                        .filter(function(dd, i) { return dd.group == d.group; })
                        .style("fill", "black")
                        .style("opacity", 0.5);
              var p = d3.selectAll("svg#cmd").selectAll("circle")
                        .filter(function(dd, i) { return dd.group == d.group; })
                        .style("opacity", 0);
              d3.selectAll("td#groupid").text("");
              d3.select("td#groupsize").text("");
            });

  // Define a tour sequence
  var tourList = [
    {
      "id": 0,
      "message": "Group 0, the largest group, is at the location of the Pleiades cluster."
    },
    {
      "id": 1,
      "message": "The second largest group is at the location of Alpha Persei Cluster."
    },
    {
      "id": 2,
      "message": "The third largest group corresponds to the Hyades cluster."
    },
    {
      "id": 6,
      "message": "We also find the Beehive cluster, and see the main-sequence turn off."
    },
    {
      "id": 14,
      "message": "Here is a newly discovered group of co-moving stars."
    },
    {
      "id": 23,
      "message": "Is this also a new moving group?"
    }
  ]
  var current = -1;
  function timer() {
    current = current + 1;
    if (current > tourList.length-1) {
      chartPolar.transition()
        .duration(2500)
        .call(zoom.transform, d3.zoomIdentity);
      d3.selectAll("td#groupid").text("");
      d3.select("td#groupsize").text("");
      d3.select("p#message").text("Explore the data yourself!")
        .transition()
          .delay(3000)
          .remove();
      return 0;
      }
    currentGroup = tourList[current];
    d3.select("p#message").text(currentGroup.message);
    var pointset = d3.selectAll("circle").
      filter(function(d, i) { return d.group == currentGroup.id; }),
    x0 = rPolar(d3.min(pointset.data(), function(d) { return d.gX; })),
    x1 = rPolar(d3.max(pointset.data(), function(d) { return d.gX; })),
    y0 = rPolar(d3.max(pointset.data(), function(d) { return d.gY; })),
    y1 = rPolar(d3.min(pointset.data(), function(d) { return d.gY; })),
    k = 0.4 / Math.max((x1 - x0) / dimPolar.width, (y1 - y0) / dimPolar.height),
    tx = (- k * (x0 + x1)) / 2,
    ty = (- k * (y0 + y1)) / 2;

    chartPolar.transition()
      .duration(2500)
      .call(zoom.transform, d3.zoomIdentity
          .translate(tx, ty)
          .scale(k))
      .on("end", function() {
        var tmpcolor = colorCycle.shift();
        colorCycle.push(tmpcolor);
        var pp = d3.selectAll("svg#pie").selectAll("circle")
                  .filter(function(dd, i) { return dd.group == currentGroup.id; })
                  .transition()
                    .duration(2000)
                    .style("fill", tmpcolor)
                    .style("opacity", 0.8)
                  .transition()
                    .delay(3000)
                    .style("fill", "black")
                    .style("opacity", 0.5);
        d3.selectAll("td#groupid").text(currentGroup.id);
        d3.select("td#groupsize").text(pp.size());

        var n = 0;  // element count
        var p = d3.selectAll("svg#cmd").selectAll("circle")
                  .filter(function(dd, i) { return dd.group == currentGroup.id; })
                  .each(function () { n++; })
                  .transition()
                    .duration(2000)
                    .style("fill", tmpcolor)
                    .style("opacity", 0.8)
                  .transition()
                    .delay(3000)
                    .duration(750)
                    .style("opacity", 0.)
                  .on("end", function() {
                    n--;
                    if (!n) {
                      timer();
                    }
                  });
      });
  }

  d3.select("button#start")
    .on("click", function() {
      resetted();
      current = -1;
      d3.timeout(timer, 3000);
      d3.select("p#message").text("We will take a look around six groups of co-moving pairs.");
      });

});


d3.select("button#getgroup")
  .on("click", function() {
    var groupid = d3.select("input#getgroup").property("value");
    if (isInt(groupid)) {
      groupid = parseInt(groupid);
      d3.selectAll("td#groupid").text(groupid);
      var tmpcolor = colorCycle.shift();
      colorCycle.push(tmpcolor);
      var p = d3.selectAll("svg#pie").selectAll("circle")
                .filter(function(dd, i) { return dd.group == groupid; })
                .style("fill", tmpcolor)
                .style("opacity", 1.0);
      var p = d3.selectAll("svg#cmd").selectAll("circle")
                .filter(function(dd, i) { return dd.group == groupid; })
                .style("fill", tmpcolor)
                .style("opacity", 1.0);

    }
  });
