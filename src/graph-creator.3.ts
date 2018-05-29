/// <reference path="./types/d3/index.d.ts"/>;
/// <reference path="./types/document/index.d.ts"/>;



interface Channel {
   id: number;
   title: string;
   type: string;
   order: number;
}

interface Gnode {
  id: number;
  title: string;
  type: string;
  cat: string;
  x: number;
  y: number;
  channels: Array<Channel>;
  h: number;
  w: number;
}

interface Edge{
  id: string;
  source: Gnode;
  target: Gnode;
  connOr: number
  connDest: number

/*   constructor(source: Gnode, target: Gnode, connOr: number, connDest: number) {
    this.source=source;
    this.target = target;
    this.connOr = connOr;
    this.connDest = connDest;
  } */
}


class Graph {
  public svgG: any;
  public saveAs: any;
  public Blob: any;
  public idct: number = 0;
  nodes: Array<Gnode>;
  edges: Array<Edge>;
  dragLine;
  paths;
  groups;
  circles;
  drag;
  
  state = {
    selectedNode: null,
    mouseDownChannel: null,
    selectedEdge: null,
    mouseDownNode: null,
    mouseDownLink: null,
    justDragged: false,
    justScaleTransGraph: false,
    lastKeyDown: -1,
    shiftNodeDrag: false,
    selectedText: null,
    hideAllChannels: true,
    graphMouseDown: true
  };

  static consts = {
    selectedClass: "selected",
    connectClass: "connect-node",
    conceptGClass: "conceptG",
    rectGClass: "conceptR",
    nodeElem: "node",
    channelClass: "channel",
    graphClass: "graph",
    activeEditId: "active-editing",
    BACKSPACE_KEY: 8,
    DELETE_KEY: 46,
    ENTER_KEY: 13,
    nodeRadius: 5 
  }

  nodeTypes = {
    connector:
    {
      loadbalancer: "connectorLb",
      pubsub: "connectorPs",
      complete: "connectorFc"
    },
    component: {
      component: "component"
    }
  }

  constructor(svg: any,  Blob: any, nodes: Array<Gnode>, edges: Array<Edge>) {
    var thisGraph = this;
    this.svgG = svg;
    //this.saveAs=saveAs;
    this.Blob = Blob;
    this.nodes = nodes || []; 
    this.edges = edges || [];
    this.setChannelOrder(null);

    thisGraph.svgG = svg.append("g")
      .classed(Graph.consts.graphClass, true)

    var svgG = thisGraph.svgG;

    thisGraph.dragLine = svgG.append('svg:path')
      .attr('class', 'link dragline hidden')
      .attr('d', 'M0,0L0,0')
      .style('marker-end', 'url(#mark-end-arrow)');

    thisGraph.paths = svgG.append("g").selectAll("g");
    thisGraph.groups = svgG.append("g").classed("GRP", true);
    thisGraph.circles = thisGraph.groups.selectAll("g.node");

    thisGraph.drag = d3.behavior.drag()

      .origin(function (d: Gnode) {
        return { x: d.x, y: d.y };
      }) 
      .on("drag", function ( args: any) {
        thisGraph.state.justDragged = true;
           thisGraph.dragmove.call(thisGraph, args );
      })
      .on("dragend", function () {
        // todo check if edge-mode is selected
      });

    d3.select(window).on("keydown", function () {
      thisGraph.svgKeyDown.call(thisGraph);
    })
      .on("keyup", function () {
        thisGraph.svgKeyUp.call(thisGraph);
      });
    svg.on("mousedown", function (d: Gnode) { thisGraph.svgMouseDown.call(thisGraph, d); });
    svg.on("mouseup", function (d: Gnode) { thisGraph.svgMouseUp.call(thisGraph, d); });

    // listen for dragging
    var dragSvg = d3.behavior.zoom()
      .on("zoom", function () {
        if (d3.event.sourceEvent.shiftKey) {
          // TODO  the internal d3 state is still changing
          return false;
        } else {
         thisGraph.zoomed.call(thisGraph);
        }
        return true;
      })
      .on("zoomstart", function () {
        var ael = d3.select("#" + Graph.consts.activeEditId).node();
        if (ael) {
         (<HTMLElement> ael).blur(); 
        }
        if (!d3.event.sourceEvent.shiftKey) d3.select('body').style("cursor", "move");
      })
      .on("zoomend", function () {
        d3.select('body').style("cursor", "auto");
      });

    svg.call(dragSvg).on("dblclick.zoom", null);

    // listen for resize
    window.onresize = function () { thisGraph.updateWindow(svg); };


    // handle show channels
    d3.select("#show-channels").on("click", function () {
      thisGraph.state.hideAllChannels = !thisGraph.state.hideAllChannels;
      console.log(thisGraph.state.hideAllChannels)
      thisGraph.circles.selectAll(".ch-tag").classed('ch-hidden', thisGraph.state.hideAllChannels);

    });


    // handle download data
    d3.select("#download-input").on("click", function () {
      var saveEdges: Array<Object> = []
      thisGraph.edges.forEach(function (val: Edge) {
        saveEdges.push({ source: val.source.id, target: val.target.id, connOr: val.connOr, connDest: val.connDest });
      });
      var blob = new Blob([JSON.stringify({ "nodes": thisGraph.nodes, "edges": saveEdges })], { type: "text/plain;charset=utf-8" });
     // saveAs(blob, "mydag.json");
    });

    // handle download data manifest
    d3.select("#download-input-manifest").on("click", function () {

      var saveManifest: any = {};
      var connector = "";
      var component = "";
      var relation = "";
      thisGraph.edges.forEach(function (val: Edge) {
        var sourceNode = thisGraph.nodes.filter(function (n: Gnode) { return n.id == val.source.id; })[0]
        if (sourceNode.type === "connector") {
          relation = "provided";
          component = thisGraph.nodes.filter(function (n: Gnode) { return n.id == val.target.id; })[0].title;
          connector = sourceNode.title;
        }
        else {
          relation = "depended";
          component = sourceNode.title;
          connector = thisGraph.nodes.filter(function (n: Gnode) { return n.id == val.target.id; })[0].title;
        }

        if (!(connector in saveManifest)) {
          saveManifest[connector] = { "depended": [], "provided": [] }
        }

        saveManifest[connector][relation].push(component);
      });

      var blob = new Blob([JSON.stringify(saveManifest)], { type: "text/plain;charset=utf-8" });
      //saveAs(blob, "manifest.json");
    });


    // handle uploaded data
    d3.select("#upload-input").on("click", function () {
      var el = document.getElementById("hidden-file-upload");
      if (el !== null) {
        el.click();
      }

    });
    d3.select("#hidden-file-upload").on("change", function () {
      if (File && FileReader && FileList && Blob) {
        var uploadFile = null// Arreglar this.files[0];
        var filereader = new FileReader();

        filereader.onload = function () {
          var txtRes = filereader.result;
          // TODO better error handling
          try {
            var jsonObj = JSON.parse(txtRes);
            thisGraph.deleteGraph(true);
            thisGraph.nodes = jsonObj.nodes;
            thisGraph.setIdCt(jsonObj.nodes.length + 1);
            var newEdges = jsonObj.edges;
            newEdges.forEach(function (e: any, i: number) {
              newEdges[i] = {
                source: thisGraph.nodes.filter(function (n: Gnode) { return n.id == e.source; })[0],
                target: thisGraph.nodes.filter(function (n: Gnode) { return n.id == e.target; })[0]
              };
            });
            thisGraph.edges = newEdges;
            thisGraph.updateGraph();
          } catch (err) {
            window.alert("Error parsing uploaded file\nerror message: " + err.message);
            return;
          }
        };
        filereader.readAsText(uploadFile);

      } else {
        alert("Your browser won't let you save this graph -- try upgrading your browser to IE 10+ or Chrome or Firefox.");
      }

    });

    // handle delete graph 
    d3.select("#delete-graph").on("click", function () {
      thisGraph.deleteGraph(false);
    });
  

    thisGraph.svgG.transition().duration(1000)
      .attr('transform', "translate(0,200)scale(0.45)");
    dragSvg.scale(0.45);
    dragSvg.translate([0, 200]);


    
  }


  public dragmove(d: Gnode) {
   // console.log("dragmove");
   // console.log(d);
    var thisGraph = this;
    if (thisGraph.state.shiftNodeDrag) {
      var coordOr = thisGraph.calcCoord(d, thisGraph.state.mouseDownChannel.id);
      thisGraph.dragLine.attr('d', 'M' + (coordOr.x) + ',' + (coordOr.y) + 'L' + d3.mouse(thisGraph.svgG.node())[0] + ',' + d3.mouse(this.svgG.node())[1]);
    } else {
      d.x += d3.event.dx;
      d.y += d3.event.dy; 
      thisGraph.updateGraph();
    }
  }

  public calcCoord(node: Gnode, channel: number) {
    var curChannel = node.channels.filter(function (n) { return n.id == channel; })[0];
    var coord = { x: 0, y: 0 }
    curChannel.type === "provided" ? coord.x = node.x : coord.x = node.x + 120;
    coord.y = node.y + 17 + 15 * curChannel.order;

    return coord;
  }



  public svgKeyUp  () {
    this.state.lastKeyDown = -1;
  };


  public svgKeyDown () {
    var thisGraph = this,
      state = thisGraph.state,
      consts = Graph.consts;
    // make sure repeated key presses don't register for each keydown
    if (state.lastKeyDown !== -1) return;

    state.lastKeyDown = d3.event.keyCode;
    var selectedNode = state.selectedNode,
      selectedEdge = state.selectedEdge;

    switch (d3.event.keyCode) {
      case consts.BACKSPACE_KEY:
      //  console.log(document.activeElement);
        break;
      case consts.DELETE_KEY:
        d3.event.preventDefault();
        console.log(selectedNode)
        if (selectedNode) {
          thisGraph.nodes.splice(thisGraph.nodes.indexOf(selectedNode), 1);
          thisGraph.spliceLinksForNode(selectedNode);
          state.selectedNode = null;
          thisGraph.updateGraph();
        } else if (selectedEdge) {
          thisGraph.edges.splice(thisGraph.edges.indexOf(selectedEdge), 1);
          state.selectedEdge = null;
          thisGraph.updateGraph();
        }
        break;
    }
  }


  public svgMouseDown  () {
    this.state.graphMouseDown = true;
  };

  // mouseup on main svg
  public svgMouseUp ()  {
    var thisGraph = this,
      state = thisGraph.state;
    if (state.justScaleTransGraph) {
      // dragged not clicked
      state.justScaleTransGraph = false;
    } else if (state.graphMouseDown && d3.event.shiftKey) {
      // clicked not dragged from svg
      var xycoords = d3.mouse(thisGraph.svgG.node()),
        d = {
          id: thisGraph.idct++, title: "Comp" + (thisGraph.idct - 1), type: "component", cat: "ord", x: xycoords[0], y: xycoords[1], h: 0, w: 0,
          channels: [{ title: "channel1", id: 0, type: "provided", order: 0 },
          { title: "channel2", id: 1, type: "depended", order: 0 },
          { title: "channel2", id: 2, type: "depended", order: 1 }]
        };
      thisGraph.nodes.push(d);
      thisGraph.setChannelOrder(d);
      thisGraph.updateGraph();
      // make title of text immediently editable
      var d3txt = thisGraph.changeTextOfNode(thisGraph.circles.filter(function (dval: Gnode) {
        return dval.id === d.id;
      }), d),
        txtNode = d3txt.node();
      thisGraph.selectElementContents(txtNode);
      txtNode.focus();
    } else if (state.shiftNodeDrag) {
      // dragged from node
      state.shiftNodeDrag = false;
      thisGraph.dragLine.classed("hidden", true);
    }
    state.graphMouseDown = false;
  }


  public zoomed = function () {
    this.state.justScaleTransGraph = true;
    d3.select("." + Graph.consts.graphClass)
      .attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
  }



  public updateWindow (svg: any) {
    var docEl = document.documentElement,
      bodyEl = document.getElementsByTagName('body')[0];
    var x = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth;
    var y = window.innerHeight || docEl.clientHeight || bodyEl.clientHeight;
    svg.attr("width", x-420).attr("height", y);
  };

  public deleteGraph  (skipPrompt: Boolean) {
    var thisGraph = this,
      doDelete = true;
    if (!skipPrompt) {
      doDelete = window.confirm("Press OK to delete this graph");
    }
    if (doDelete) {
      thisGraph.nodes = [];
      thisGraph.edges = [];
      thisGraph.updateGraph();
    }
  }

 public spliceLinksForNode (node: Gnode) {
    console.log("spliceLinksForNode")
    console.log(node)
    var thisGraph = this,
      toSplice = thisGraph.edges.filter(function (l: Edge) {
        return (l.source === node || l.target === node);
      });
    toSplice.map(function (l: Edge) {
      thisGraph.edges.splice(thisGraph.edges.indexOf(l), 1);
    });
  }


 public setChannelOrder(node: Gnode) {
    var thisGraph = this;

    var channelIterator = function (node: Gnode) {
      var type = {depended:0, provided:0}
      node.channels.forEach(function (channel: Channel) {
        var num = type[channel.type]
        if (typeof num === 'number') {
          channel.order = num;
          type[channel.type]+=1;
        }

      });
      node.h = 20 + Math.max(type.depended, type.provided) * 15;
      node.w = 120;
    }

    if (node === null) {
      thisGraph.nodes.forEach(function (node: Gnode) {
        channelIterator(node);
      });
    }
    else {
      channelIterator(node);
    }
  }



 public changeTextOfNode (d3node:any, d: Gnode) {
   console.log("changeTextOfNode")
   console.log(d3node)
   var thisGraph = this,
     consts = Graph.consts,
     htmlEl = d3node.node();
   d3node.selectAll("text.name").remove();
   var nodeBCR = htmlEl.getBoundingClientRect();

   // replace with editableconent text
   var d3txt = thisGraph.svgG.selectAll("foreignObject")
     .data([d])
     .enter()
     .append("foreignObject")
     // .attr("x", nodeBCR.left + placePad )
     // .attr("y", nodeBCR.top + placePad)
     .attr("x", nodeBCR.left + 10)
     .attr("y", nodeBCR.top - 6)
     .attr("height", d.h)
     .attr("width", d.w)
     .append("xhtml:p")
     .attr("id", consts.activeEditId)
     .attr("contentEditable", "true")
     .text(d.title) 
     .on("mousedown", function () {
       d3.event.stopPropagation();
     })
     .on("keydown", function () {
       d3.event.stopPropagation();
       if (d3.event.keyCode == consts.ENTER_KEY && !d3.event.shiftKey) {
         this.blur();
       }
     })
     .on("blur", function (d: Gnode) {
       d.title = this.textContent;
       thisGraph.insertTitleLinebreaks(d3node, d);
       d3.select(this.parentElement).remove();
     });
   return d3txt;
 }

 public selectElementContents (el: HTMLElement) {
    console.log("selectElementContents")
    console.log(el)
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  public insertTitleLinebreaks (gEl: any, d: Gnode) {
  // console.log("insertTitleLinebreaks")
   var words = d.title.split(/\s+/g),
     nwords = words.length;
 //  console.log(gEl)
   var el = gEl.append("text")
     .classed("name", true)
     .attr("text-anchor", "middle")
     .attr("dy", "-" + (nwords - 1) * 7.5);

   for (var i = 0; i < words.length; i++) {
      /* var tspan = */ el.append('tspan').text(words[i]).attr('x', d.w / 2).attr('dy', d.h / 1.7);
     /* if (i > 0)
       tspan.attr('x', 60).attr('dy', '15'); */
   }
  }






  public updateGraph(){


      var thisGraph = this,
        consts = Graph.consts,
        nodeTypes = thisGraph.nodeTypes,
        state = thisGraph.state;
      var cont = 2; 

      thisGraph.paths = thisGraph.paths.data(thisGraph.edges, function (d: Edge) {
        return String(d.source.id) + "[" + String(d.connOr) + "]+" + String(d.target.id) + "[" + String(d.connDest) + "]";
      });

      var paths = thisGraph.paths;

      // update existing paths
      paths.style('marker-end', 'url(#end-arrow)')
        .classed(consts.selectedClass, function (d: Edge) {
          return d === state.selectedEdge;
        })
        .attr("d", function (d: Edge) {
          // var res = "M " + (coordOr.x) + "," + (coordOr.y) + " Q " + (xdis) + "," + (ydis) + " " + (xdis) + "," + (ydis) + " T " + (coordDest.x) + "," + (coordDest.y)
          return thisGraph.drawLine(d.source, d.connOr, d.target, d.connDest);
        });
      // add new paths
      paths.enter()
        .append("path")
        .style('marker-end', 'url(#end-arrow)')
        .classed("link", true)
        .attr("d", function (d: Edge) {
          //  var res = "M " + (coordOr.x) + "," + (coordOr.y) + " q " + (xdis / 5) + "," + (ydis) + " " + (xdis / 2) + "," + (ydis) + " T " + (coordDest.x) + "," + (coordDest.y)
          return thisGraph.drawLine(d.source, d.connOr, d.target, d.connDest);
        })
        .on("mousedown", function (d: Edge) {
          thisGraph.pathMouseDown.call(thisGraph, d3.select(this), d);
        }
        )
        .on("mouseup", function () {
          state.mouseDownLink = null;
        });

      // remove old links
      paths.exit().remove();

      // update existing nodes

      thisGraph.circles = thisGraph.circles.data(thisGraph.nodes, function (d: Gnode) { return d.id; });
      thisGraph.circles.attr("transform", function (d: Gnode) { return "translate(" + d.x + "," + d.y + ")"; });


      // add new nodes
      var newGs = thisGraph.circles.enter()
        .append("g")


      newGs
        .attr("class", function (d: Gnode) { return nodeTypes[d.type][d.cat]; })
        .classed(consts.conceptGClass, true)
        .classed(consts.nodeElem, true)
        .attr("transform", function (d: Gnode) { return "translate(" + d.x + "," + d.y + ")"; })
        .on("mouseover", function () {
          if (state.shiftNodeDrag) {
            d3.select(this).classed(consts.connectClass, true);
          }
        })
        .on("mouseout", function () {
          d3.select(this).classed(consts.connectClass, false);
        })
        .on("mousedown", function (d: Gnode) {
          thisGraph.circleMouseDown.call(thisGraph, d3.select(this), d);
        })
        .on("mouseup", function (d: Gnode) {
          thisGraph.circleMouseUp.call(thisGraph, d3.select(this), d);
        })
        .call(thisGraph.drag);

      newGs.append("rect")
        .classed(consts.nodeElem, true)
        .attr("width", function (d: Gnode) { return d.w })
        .attr("height", function (d: Gnode) { return d.h })
        .attr("stroke", "black")
        .attr("stroke-width", "5")
        .attr("rx", "15")
        .attr("ry", "15")

      newGs.each(function (d: Gnode) {
        thisGraph.insertTitleLinebreaks(d3.select(this), d);
      });


      newGs.each(function (d: Gnode) {
        for (var id in d.channels) {
          var curChannel = d.channels[id];

          var params = { id: curChannel.id, title: curChannel.title, xLoc: 120, yLoc: (15 + 15*(+id)), type: curChannel.type, node: d.id, order: curChannel.order };
          d3.select(this)
            .append("g").classed(consts.conceptGClass, true)
            .attr("transform", function () { return "translate(" + (curChannel.type === "provided" ? 0 : 120) + "," + (17 + 15 * curChannel.order) + ")"; })
            .attr("data", JSON.stringify(params))
            .on("mouseover", function () {
              if (thisGraph.state.hideAllChannels)
                thisGraph.circles.selectAll(".ch-tag").classed('ch-hidden', false)
            })
            .on("mouseout", function () {
              if (thisGraph.state.hideAllChannels)
                thisGraph.circles.selectAll(".ch-tag").classed('ch-hidden', true)
             //   d3.select(this).classed(consts.connectClass, false);
            }) 
           .on("mousedown", function (d: Gnode) {
              thisGraph.circleMouseDown.call(thisGraph, d3.select(this), d, JSON.parse(this.getAttribute("data")));
            })
            .on("mouseup", function (d: Gnode) {
              thisGraph.circleMouseUp.call(thisGraph, d3.select(this), d, JSON.parse(this.getAttribute("data")));
            }) 
            .call(thisGraph.drag)
            .append("circle")
            .attr("r", String(consts.nodeRadius))
            .classed(consts.channelClass, true)
            .attr("class", consts.channelClass)


          var w = curChannel.title.length * 8.5;
          var h = 14;
          var grect = d3.select(this).append("g").classed('ch-hidden', true).classed('ch-tag', true);

          grect.append("rect")
            .attr("transform", function (d: Gnode) { return "translate(" + (curChannel.type === "provided" ? -w - consts.nodeRadius * 2 : d.w + consts.nodeRadius * 2) + "," + (-2.5 + h + 15 * curChannel.order) + ")"; })
            .style("stroke", "black")
            .attr("width", w)
            .attr("height", h - 4)
          grect.append("text")
            .attr("transform", function (d: Gnode) { return "translate(" + (curChannel.type === "provided" ? -w - consts.nodeRadius * 2 : d.w + consts.nodeRadius * 2) + "," + (-2 + consts.nodeRadius * 2 + h + 15 * curChannel.order) + ")"; })
            .append('tspan').text(curChannel.title)
            .style("font-size", h + "px").style('fill', 'white')

        }
      });


        
  
      

      // remove old nodes
      thisGraph.circles.exit().remove();
    }
    
   public drawLine (source: Gnode, portS: number, target: Gnode, portT: number) {
    var thisGraph = this;

    var coordOr;
    var coordDest;
    var sPort;
    var dPort;

    if (source.x <= target.x - 120) {
      coordDest = thisGraph.calcCoord(source, portS)
      coordOr = thisGraph.calcCoord(target, portT)
      dPort = source.channels.filter(function (n) { return n.id == portS; })[0];
      sPort = target.channels.filter(function (n) { return n.id == portT; })[0];
    }
    else {
      coordOr = thisGraph.calcCoord(source, portS)
      coordDest = thisGraph.calcCoord(target, portT)
      sPort = source.channels.filter(function (n) { return n.id == portS; })[0];
      dPort = target.channels.filter(function (n) { return n.id == portT; })[0];
    }
    var depToOth = sPort.type === "depended" && dPort.type !== "depended";
    var depToDep = sPort.type === "depended" && dPort.type === "depended";

    if (depToDep) {
   //   console.log("CASO1")
      var xdis = (coordDest.x) - (coordOr.x);
      var ydis = (coordDest.y) - (coordOr.y);
      return "M " + (coordOr.x) + "," + (coordOr.y) + " q " + (coordOr.x / 3) + "," + (ydis + 120) + " " + (200 + (xdis / 2)) + "," + (ydis + 60) + " T " + (coordDest.x) + "," + (coordDest.y);
    }

    if (depToOth && coordOr.x > coordDest.x) {
    //  console.log("CASO2")
      var xdis = (coordDest.x) - (coordOr.x);
      var ydis = (coordDest.y) - (coordOr.y);
      return "M " + (coordOr.x) + "," + (coordOr.y) + " q " + (180 * 6 / 5) + "," + (ydis + 120) + " " + ((xdis / 2)) + "," + (ydis + 60) + " T " + (coordDest.x) + "," + (coordDest.y);
    }
    //console.log("CASO3")

    var numOutputs = 1;
    var node_width = -140;
    var node_height = -80;
    var y = -((numOutputs - 1) / 2) * 13 + 13 * portS;

    var dy = coordDest.y - (coordOr.y + y);
    var dx = (coordDest.x - node_width / 2) - (coordOr.x + node_width / 2);
    var delta = Math.sqrt(dy * dy + dx * dx);
    var scale = 0.10;
    var scaleY = 0;
    if (delta < node_width) {
      scale = 0.75 - 0.75 * ((node_width / 2 - delta * 2) / node_width);
    }

    if (dx < 0) {
      scale += 2 * (Math.min(5 * node_width, Math.abs(dx)) / (5 * node_width));
      if (Math.abs(dy) < 3 * node_height) {
        scaleY = ((dy > 0) ? 0.5 : -0.5) * (((3 * node_height) - Math.abs(dy)) / (3 * node_height)) * (Math.min(node_width, Math.abs(dx)) / (node_width));
      }
    }
    var d = { x1: 0, y1: 0, x2: 0, y2: 0 };
    d.x1 = coordOr.x;
    d.y1 = coordOr.y;
    d.x2 = coordDest.x;
    d.y2 = coordDest.y;

    var res = "M " + d.x1 + " " + d.y1 +
      " C " + (d.x1 + scale * node_width) + " " + (d.y1 + scaleY * node_height) + " " +
      (d.x2 - scale * node_width) + " " + (d.y2 - scaleY * node_height) + " " +
      d.x2 + " " + d.y2;
    return res;
  }


  public pathMouseDown (d3path: d3.Path, d: Edge) {
    console.log("pathMouseDown")
    console.log(d)
    var thisGraph = this,
      state = thisGraph.state;
    d3.event.stopPropagation();
    state.mouseDownLink = d;


    if (state.selectedNode) {
      thisGraph.removeSelectFromNode();
    }

    var prevEdge = state.selectedEdge;
    if (!prevEdge || prevEdge !== d) {
      thisGraph.replaceSelectEdge(d3path, d);
    } else {
      thisGraph.removeSelectFromEdge();
    }
  }



  public circleMouseDown (d3node: Object, d: Gnode, channel: Channel) {
    console.log("circleMouseDown")
    console.log(d3node)
    var isNode;
    if (channel === undefined)
      isNode = true;
    else {
      isNode = false;
    }
    var thisGraph = this,
      state = thisGraph.state;
    d3.event.stopPropagation();
    // if(d.type==consts.channelClass)
    state.mouseDownNode = d;
    if (!isNode)
      state.mouseDownChannel = channel;

    if (d3.event.shiftKey && !isNode) {
      state.shiftNodeDrag = d3.event.shiftKey;
      // reposition dragged directed edge
      var coordOr = thisGraph.calcCoord(d, channel.id);
      thisGraph.dragLine.classed('hidden', false)
        //.attr('d', 'M' + d.x + ',' + d.y + 'L' + d.x + ',' + d.y);
        .attr('d', 'M' + coordOr.x + ',' + coordOr.y + 'L' + coordOr.x + ',' + coordOr.y);
      return;
    }
  }

   public circleMouseUp (d3node: any, d: Gnode, channel: Channel) {
    console.log("circleMouseUp")
    var isNode;
    if (channel === undefined)
      isNode = true;
    else {
      isNode = false;
    }
    var thisGraph = this,
      state = thisGraph.state,
      consts = Graph.consts;
    // reset the states
    state.shiftNodeDrag = false;
    d3node.classed(consts.connectClass, false);

    var mouseDownNode = state.mouseDownNode;
    var mouseDownChannel;
    if (!isNode)
      mouseDownChannel = state.mouseDownChannel;

    if (!mouseDownNode) return;
    thisGraph.dragLine.classed("hidden", true);


    if (mouseDownNode !== d && (!isNode)) {
      // we're in a different node: create new edge for mousedown edge and add to graph
      var newEdge = {
        id: String(mouseDownNode.id) + "[" + String(mouseDownChannel.id) + "]+" + String(d.id) + "[" + String(channel.id) + "]",
        source: mouseDownNode, target: d, connOr: mouseDownChannel.id, connDest: channel.id };
      console.log("CONNECTION")
      console.log(mouseDownNode.id + "" + mouseDownChannel.id + " -----> " + d.id + "" + channel.id)
      var filtRes = thisGraph.paths.filter(function (d) {
        // if (d.source === newEdge.target && d.target === newEdge.source) {
        if (d.source.id + "" + d.connOr === newEdge.target.id + "" + newEdge.connDest && d.target.id + "" + d.connDest === newEdge.source.id + "" + newEdge.connOr) {
          thisGraph.edges.splice(thisGraph.edges.indexOf(d), 1);
        }
        // d.source === newEdge.source && d.target === newEdge.target && 
        return d.source.id + "" + d.connOr === newEdge.source.id + "" + newEdge.connOr && d.target.id + "" + d.connDest === newEdge.target.id + "" + newEdge.connDest;
      });
      if (!filtRes[0].length) {
        if (mouseDownNode.type !== d.type) {
          thisGraph.edges.push(newEdge);
          thisGraph.updateGraph();
        }
      }
    } else {
      // we're in the same node
      if (state.justDragged) {
        // dragged, not clicked
        state.justDragged = false;
      } else {
        // clicked, not dragged
        if (d3.event.shiftKey) {
          // shift-clicked node: edit text content
          var d3txt = thisGraph.changeTextOfNode(d3node, d);
          var txtNode = d3txt.node();
          thisGraph.selectElementContents(txtNode);
          txtNode.focus();
        } else {
          if (state.selectedEdge) {
            thisGraph.removeSelectFromEdge();
          }
          var prevNode = state.selectedNode;

          if (!prevNode || prevNode.id !== d.id) {
            if (!isNode)
              thisGraph.replaceSelectNode(d3node, d, channel);
            else
              thisGraph.replaceSelectNode(d3node, d, null);
          } else {
            console.log(d)
            thisGraph.removeSelectFromNode();
          }
        }
      }
    }

    state.mouseDownNode = null;
    state.mouseDownChannel = null;
    return;

  } // end of circles mouseup

  public removeSelectFromNode  () {
     var thisGraph = this;
     console.log("removeSelectFromNode")
     thisGraph.circles.filter(function (cd: Gnode) {
       return cd.id === thisGraph.state.selectedNode.id;
     }).classed(Graph.consts.selectedClass, false);

     thisGraph.state.selectedNode = null;
  }

  public replaceSelectNode(d3Node, nodeData: Gnode, channel: Channel) {
    var thisGraph = this;
    if (channel === undefined)
      d3Node.classed(Graph.consts.selectedClass, true);
    if (thisGraph.state.selectedNode) {
      thisGraph.removeSelectFromNode();
    }
    thisGraph.state.selectedNode = nodeData;
  }


  public replaceSelectEdge (d3Path:any, edgeData: Edge) {
    console.log("replaceSelectEdge")
    console.log(d3Path)

    var thisGraph = this;
    d3Path.classed(Graph.consts.selectedClass, true);
    if (thisGraph.state.selectedEdge) {
      thisGraph.removeSelectFromEdge();
    }
    thisGraph.state.selectedEdge = edgeData;
  }

  public removeSelectFromEdge = function () {
    var thisGraph = this;
    thisGraph.paths.filter(function (cd: Edge) {
      return cd === thisGraph.state.selectedEdge;
    }).classed(Graph.consts.selectedClass, false);
    thisGraph.state.selectedEdge = null;
  }



  public setIdCt(n: number){
    this.idct=n;
  }
}

var graph;
var manifests;
/* 
window.onload = function () {
  "use strict";

  // warn the user when leaving
/*   window.onbeforeunload = function () {
    console.log("onbeforeunload")
    return "Make sure to save your graph locally before leaving :-)";
  }; 


  
}; */
