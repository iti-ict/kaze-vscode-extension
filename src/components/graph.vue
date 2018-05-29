<template>
  <div id="graph">
    {{init()}}
  </div>
</template>


<script>
    export default {
      name: 'app',
      data (){
       return {
         visible: false
       };
      },
      methods:{
          init(){

            var docEl = document.documentElement,
              bodyEl = document.getElementsByTagName('body')[0];

            var width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth,
              height = window.innerHeight || docEl.clientHeight || bodyEl.clientHeight;

            var xLoc = width / 2 - 25,
              yLoc = 100;
            
            var channels = [{ title: "channel1", id: 0, type: "provided", order:0 },
            { title: "channel2", id: 1, type: "depended", order:0 },
            { title: "channel3", id: 2, type: "depended", order:0 },
            { title: "channel4", id: 3, type: "depended", order:0 },
            { title: "channel5", id: 4, type: "depended", order:0 },
            { title: "channel6", id: 5, type: "depended", order:0 },
            { title: "channel7", id: 6, type: "depended", order:0 },
            { title: "channel8", id: 7, type: "depended", order:0 }]

            var channelsConnector = [{ title: "channel1", id: 0, type: "provided", order: 0  },
              { title: "channel2", id: 1, type: "depended", order: 0  }]

            // initial node data
            var nodes = [{ title: "LB", type: "connector", cat: "loadbalancer", id: 0, x: xLoc - 355, y: yLoc + 90, channels: channelsConnector, h:0, w:0 },
                        { title: "Pub-Sub", type: "connector", cat: "pubsub", id: 1, x: xLoc - 350, y: yLoc + 500, channels: channelsConnector, h:0, w:0 },
                        { title: "FC", type: "connector", cat: "complete", id: 2, x: xLoc, y: yLoc + 500, channels: channelsConnector, h:0, w:0 },
                        { title: "Component", type: "component", cat: "component", id: 3, x: xLoc - 350, y: yLoc + 200, channels: channels, h:0, w:0 }];
            var edges = [{ id: "", source: nodes[3], target: nodes[0], connOr: 1, connDest: 1 }, { id: "", source: nodes[3], target: nodes[1], connOr: 4, connDest: 0 }]; 

            
            if (Object.keys(this.$store.state.graph).length>0 && !this.visible){
            // console.log(JSON.stringify(this.$store.state.graph.edges))
              this.visible = true;
            // document.allData = JSON.parse(document.allData);
            // manifests = document.allData.manifests;
            // console.log(document.allData.manifests);
              var newGraph = Object.assign({}, this.$store.state.graph);
              nodes = newGraph.nodes;
              edges = [];
              for (let edge of newGraph.edges) { edge.source = nodes[edge.source]; edge.target = nodes[edge.target]; edges.push(edge); }
            

            var svg = d3.select("body").append("svg")
              .attr("width", width-420)
              .attr("height", height);


            graph = new Graph(svg,window.Blob, nodes, edges);
            graph.setIdCt(nodes.length);
            graph.updateGraph();
        }

    }
  }
}
</script>

