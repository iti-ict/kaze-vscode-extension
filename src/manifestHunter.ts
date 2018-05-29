
import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as vscode from 'vscode';



export default class ManifestHunter {

    maniName: string;
    paths = {};
    services = {};
    components = {};
    resources = {};
    graph = { nodes: [], edges: [] };
    allData = {};
    manifests = {};

    constructor () {
        this.maniName = "manifest.json";
        this.services = {};
        this.components = {};
        this.resources = {};
        this.graph = { nodes: [], edges: [] };
        this.allData = {};
        this.manifests = {};
        
    }

     jsonToGrpah(servPath,callback){
        this.services = {};
        this.components = {};
        this.graph = { nodes: [], edges: [] }
        this.scanAll();
        this.graphParser(this.paths[servPath], callback);
    }

     servicesList(callback) {
         this.manifests = {};
         this.scanAll();
        callback(this.manifests);
     }
    
     graphParser(serviceKey, callback) {
        var graph = this.graph;
        var nodesMap = {};
        var service = this.services[serviceKey];
       
        if(service == undefined)
            throw { err: 'servnotfoud', path: serviceKey };
        for( var idRol in service.roles){
            let rol = service.roles[idRol];
            let node = { title: rol.name, type: "component", cat: "component", h: 0, w: 0, id: Number(idRol) , channels: [], x: 0, y: 0 };
            let component = this.components[rol.component];
            for (let channel of component.channels.provides)
                node.channels.push({ title: channel.name, id: node.channels.length, type: "provided", order: 0 })
            for (let channel of component.channels.requires)
                node.channels.push({ title: channel.name, id: node.channels.length, type: "depended", order: 0 })
            
            nodesMap[rol.name] = Number(idRol);
            graph.nodes.push(node);
        }

       var baseX = 20;
       var baseY = 100;
       var unitsX = 350;
       var unitsY = 100;
       var sectionsLength = {};
       var sectionType =  [];
       var sectionOrder = [];
       var connectors = [];

       var getRow = (row, type) => {
          // console.log(sectionType);
          // console.log("type:" + type+" "+(row-1) + "/" + sectionType.length)
           if (sectionType.length < row){
               sectionType.push(type);
             //  console.log(row);
               return row;
           }
           else {

               var i = row-1;
              //  console.log("ITE:"+(row-1))
               for (i; i < sectionType.length; i++)
                   if (sectionType[i]==type){
                //    console.log(i+1);
                    return i+1;
                   }
                    

               sectionType.push(type);
             //  console.log(i);
               return i+1;
           }

       }

       
        for (let connector of service.connectors) {
            let type = connector.type.split("/");
            let node = { title: type[type.length - 2], type: "connector", cat: type[type.length - 2], h: 0, w: 0, id: graph.nodes.length, channels: [], x: 0, y: 0 };
            connectors.push(graph.nodes.length);
           // for (var j = 0; j < 2; j++){
               var j=0;
                let maxX = 0;
                if (connector.hasOwnProperty('depended')) {
                    if (j == 0)
                    node.channels.push({ title: "provided", id: node.channels.length, type: "provided", order: 0 })
                    for (let conn of connector.depended) {
                        if (conn.hasOwnProperty('role')) {
                        //    if (nodesMap[conn.role]) {
                                let conNode = graph.nodes[nodesMap[conn.role]];
                                let channel = conNode.channels.filter((val) => { return val.title == conn.endpoint })[0];
                                if (j == 0)
                                    graph.edges.push({ id: "", target: node.id, source: conNode.id, connDest: node.channels.length - 1, connOr: channel.id })


                                if (conNode.x >= maxX)
                                    maxX = conNode.x + 1;
                                if (conNode.x == 0) {
                                    conNode.x = getRow(1, "com");
                                    sectionsLength.hasOwnProperty(conNode.x) ? sectionsLength[conNode.x] += 1 : sectionsLength[conNode.x] = 1;
                                    conNode.y = baseY + unitsY * sectionsLength[conNode.x];
                                    sectionOrder.push(conNode.id);
                                }
                          //  }
                        }
                    }
                }
                node.x = getRow(maxX, "con");
                sectionsLength.hasOwnProperty(node.x) ? sectionsLength[node.x] += 1 : sectionsLength[node.x] = 1;
                node.y = baseY + unitsY * sectionsLength[node.x];
                sectionOrder.push(graph.nodes.length);

                if (connector.hasOwnProperty('provided')) {
                    //if (type[type.length - 2] != "complete")
                        if (j == 0)
                        node.channels.push({ title: "depended", id: node.channels.length, type: "depended", order: 0 })
                    for (let conn of connector.provided) {
                        if (conn.hasOwnProperty('role')) {
                           // if (nodesMap[conn.role]) {
                                let conNode = graph.nodes[nodesMap[conn.role]];
                                let channel = conNode.channels.filter((val) => { return val.title == conn.endpoint })[0];
                                if (j == 0)
                                    graph.edges.push({ id: "", source: node.id, target: conNode.id, connOr: node.channels.length - 1, connDest: channel.id })

                                if (conNode.x) {
                                    if (conNode.x > 0) {
                                        sectionsLength[conNode.x] = sectionsLength[conNode.x] - 1;
                                        var index = sectionOrder.indexOf(conNode.id);
                                        sectionOrder.splice(index, 1);
                                    }
                                    conNode.x = getRow(maxX + 1, "com");
                                    sectionsLength.hasOwnProperty(conNode.x) ? sectionsLength[conNode.x] += 1 : sectionsLength[conNode.x] = 1;
                                    conNode.y = baseY + unitsY * sectionsLength[conNode.x];
                                    sectionOrder.push(conNode.id);
                                }
                           // }
                        }
                    }
                }
           // }



        graph.nodes.push(node);

       }
 
        
        for (let conn of connectors) {
            let node = graph.nodes[conn]; 
            //console.log("1-" + JSON.stringify(sectionsLength));
            //sectionsLength[node.x] -= 1 ;
            let index = sectionOrder.indexOf(node.id);
            sectionOrder.splice(index, 1);
             let relations = graph.edges.filter((val) => { return val.source == node.id })
            if (relations.length > 0) {
                node.x = getRow(Math.max.apply(Math, relations.map(function (o) { return graph.nodes[o.target].x; })) - 1, "con");
            } 
            
           relations = graph.edges.filter((val) => { return val.target == node.id })
            if( relations.length > 0){
                node.x = getRow(Math.min.apply(Math, relations.map(function (o) { return graph.nodes[o.source].x; })) + 1, "con") ;
            }

            sectionsLength.hasOwnProperty(node.x) ? sectionsLength[node.x] += 1 : sectionsLength[node.x] = 1;
            node.y = baseY + unitsY * sectionsLength[node.x];
            
            //console.log(node.x+ " - " +sectionsLength[node.x]+ " - " +node.y);
            sectionOrder.push(node.id);
           // console.log("2-" + JSON.stringify(sectionsLength));

        }

       for (let i of sectionOrder ) {
           let node = graph.nodes[i];

         //  if (sectionType.length  < node.x)
         //      console.log(node)
           if (sectionType.length >= node.x)
            {
             //  node.y = baseY + unitsY * sectionsLength[node.x];
             //  sectionsLength[node.x] -=1;
             //  console.log(node.x + " - " + sectionsLength[node.x] + " - " + node.y);
               node.x = baseX + unitsX * node.x;
            }
             
       } 


       this.allData["graph"] = graph;
       this.allData["manifests"]={};
       this.allData["manifests"]["service"] = service;
       this.allData["manifests"]["components"] = this.components;
       this.allData["manifests"]["resources"] = this.resources;
       callback(this.allData);
    }

    scanAll(){
        this.readDirStruct(vscode.workspace.rootPath);
    }

     readDirStruct(dir) {
        var files = fs.readdirSync(dir);
            for (var file of files) {
                if (file.toLocaleLowerCase() == this.maniName)
                    //this.clasifyManifests(path.join(dir, file))
                    this.registerManifest(path.join(dir, file))

                else if (fs.statSync(path.join(dir, file)).isDirectory())
                    this.readDirStruct(path.join(dir, file));
            }
    }



    
    clasifyManifests(manifest) {
        var json;
        try{
            json= JSON.parse(fs.readFileSync(manifest, 'utf8'));
        }
        catch(ex){
            throw { err: 'invjson', path: manifest};
        }
        json['filePath'] = manifest;
        var spec = json.spec.split("/");
       // console.log(spec[3])

        this.paths[manifest] = json.name;

        switch (spec[3]) {
            case "manifest":
                switch (spec[spec.length - 2]) {
                    case "service":
                        this.services[json.name] = json;
                        break;
                    case "component":
                        this.components[json.name] = json;
                        break;
                    }
                break;
            case "resource":
                this.resources[json.name] = json;
                break;
        }
 
    }

    registerManifest(manifest) {
        var json;
        try {
            json = JSON.parse(fs.readFileSync(manifest, 'utf8'));
        }
        catch (ex) {
            throw { err: 'invjson', path: manifest };
        }
        json['filePath'] = manifest;

        var spec = json.spec.split("/");
        let type;
        if (spec[3] =='manifest')
           type = spec[spec.length - 2];
        else type = spec[3];

        json['type'] = type;
        // console.log(spec[3])

        //this.paths[manifest] = json.name;
        this.manifests[json.name] = json;


    }
} 


