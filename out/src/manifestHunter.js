'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
class ManifestHunter {
    static jsonToGrpah(callback) {
        ManifestHunter.services = {};
        ManifestHunter.components = {};
        ManifestHunter.graph = { nodes: [], edges: [] };
        ManifestHunter.scanAll();
        var serviceKey = Object.keys(ManifestHunter.services)[0];
        ManifestHunter.graphParser(serviceKey, callback);
    }
    static graphParser(serviceKey, callback) {
        var graph = ManifestHunter.graph;
        var nodesMap = {};
        var service = ManifestHunter.services[serviceKey];
        for (var idRol in service.roles) {
            let rol = service.roles[idRol];
            let node = { title: rol.name, type: "component", cat: "component", h: 0, w: 0, id: Number(idRol), channels: [], x: 0, y: 0 };
            let component = ManifestHunter.components[rol.component];
            for (let channel of component.channels.provides)
                node.channels.push({ title: channel.name, id: node.channels.length, type: "provided", order: 0 });
            for (let channel of component.channels.requires)
                node.channels.push({ title: channel.name, id: node.channels.length, type: "depended", order: 0 });
            nodesMap[rol.name] = Number(idRol);
            graph.nodes.push(node);
        }
        var baseX = 20;
        var baseY = 100;
        var unitsX = 350;
        var unitsY = 100;
        var sectionsLength = {};
        var sectionType = [];
        var sectionOrder = [];
        var connectors = [];
        var getRow = (row, type) => {
            // console.log(sectionType);
            // console.log("type:" + type+" "+(row-1) + "/" + sectionType.length)
            if (sectionType.length < row) {
                sectionType.push(type);
                //  console.log(row);
                return row;
            }
            else {
                var i = row - 1;
                //  console.log("ITE:"+(row-1))
                for (i; i < sectionType.length; i++)
                    if (sectionType[i] == type) {
                        //    console.log(i+1);
                        return i + 1;
                    }
                sectionType.push(type);
                //  console.log(i);
                return i + 1;
            }
        };
        for (let connector of service.connectors) {
            let type = connector.type.split("/");
            let node = { title: type[type.length - 2], type: "connector", cat: type[type.length - 2], h: 0, w: 0, id: graph.nodes.length, channels: [], x: 0, y: 0 };
            connectors.push(graph.nodes.length);
            // for (var j = 0; j < 2; j++){
            var j = 0;
            let maxX = 0;
            if (connector.hasOwnProperty('depended')) {
                if (j == 0)
                    node.channels.push({ title: "provided", id: node.channels.length, type: "provided", order: 0 });
                for (let conn of connector.depended) {
                    if (conn.hasOwnProperty('role')) {
                        let conNode = graph.nodes[nodesMap[conn.role]];
                        let channel = conNode.channels.filter((val) => { return val.title == conn.endpoint; })[0];
                        if (j == 0)
                            graph.edges.push({ id: "", target: node.id, source: conNode.id, connDest: node.channels.length - 1, connOr: channel.id });
                        if (conNode.x >= maxX)
                            maxX = conNode.x + 1;
                        if (conNode.x == 0) {
                            conNode.x = getRow(1, "com");
                            sectionsLength.hasOwnProperty(conNode.x) ? sectionsLength[conNode.x] += 1 : sectionsLength[conNode.x] = 1;
                            conNode.y = baseY + unitsY * sectionsLength[conNode.x];
                            sectionOrder.push(conNode.id);
                        }
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
                    node.channels.push({ title: "depended", id: node.channels.length, type: "depended", order: 0 });
                for (let conn of connector.provided) {
                    if (conn.hasOwnProperty('role')) {
                        let conNode = graph.nodes[nodesMap[conn.role]];
                        let channel = conNode.channels.filter((val) => { return val.title == conn.endpoint; })[0];
                        if (j == 0)
                            graph.edges.push({ id: "", source: node.id, target: conNode.id, connOr: node.channels.length - 1, connDest: channel.id });
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
            let relations = graph.edges.filter((val) => { return val.source == node.id; });
            if (relations.length > 0) {
                node.x = getRow(Math.max.apply(Math, relations.map(function (o) { return graph.nodes[o.target].x; })) - 1, "con");
            }
            relations = graph.edges.filter((val) => { return val.target == node.id; });
            if (relations.length > 0) {
                node.x = getRow(Math.min.apply(Math, relations.map(function (o) { return graph.nodes[o.source].x; })) + 1, "con");
            }
            sectionsLength.hasOwnProperty(node.x) ? sectionsLength[node.x] += 1 : sectionsLength[node.x] = 1;
            node.y = baseY + unitsY * sectionsLength[node.x];
            //console.log(node.x+ " - " +sectionsLength[node.x]+ " - " +node.y);
            sectionOrder.push(node.id);
            // console.log("2-" + JSON.stringify(sectionsLength));
        }
        for (let i of sectionOrder) {
            let node = graph.nodes[i];
            //  if (sectionType.length  < node.x)
            //      console.log(node)
            if (sectionType.length >= node.x) {
                //  node.y = baseY + unitsY * sectionsLength[node.x];
                //  sectionsLength[node.x] -=1;
                //  console.log(node.x + " - " + sectionsLength[node.x] + " - " + node.y);
                node.x = baseX + unitsX * node.x;
            }
        }
        ManifestHunter.allData["graph"] = graph;
        ManifestHunter.allData["manifests"] = {};
        ManifestHunter.allData["manifests"]["service"] = service;
        ManifestHunter.allData["manifests"]["components"] = ManifestHunter.components;
        ManifestHunter.allData["manifests"]["resources"] = ManifestHunter.resources;
        callback(ManifestHunter.allData);
    }
    static scanAll() {
        ManifestHunter.readDirStruct(vscode.workspace.rootPath);
    }
    static readDirStruct(dir) {
        var files = fs.readdirSync(dir);
        for (var file of files) {
            if (file.toLocaleLowerCase() == ManifestHunter.maniName)
                ManifestHunter.clasifyManifests(path.join(dir, file));
            else if (fs.statSync(path.join(dir, file)).isDirectory())
                ManifestHunter.readDirStruct(path.join(dir, file));
        }
    }
    static clasifyManifests(manifest) {
        var json = JSON.parse(fs.readFileSync(manifest, 'utf8'));
        json['filePath'] = manifest;
        var spec = json.spec.split("/");
        // console.log(spec[3])
        switch (spec[3]) {
            case "manifest":
                switch (spec[spec.length - 2]) {
                    case "service":
                        ManifestHunter.services[json.name] = json;
                        break;
                    case "component":
                        ManifestHunter.components[json.name] = json;
                        break;
                }
                break;
            case "resource":
                ManifestHunter.resources[json.name] = json;
                break;
        }
        /*         switch (spec[spec.length - 2]) {
                    case "service":
                        ManifestHunter.services[json.name] = json;
                        break;
                    case "component":
                        ManifestHunter.components[json.name] = json;
                        break;
                    default:
                        if ((spec[spec.length - 2])!=="blob"){
                        //console.log(spec[spec.length - 2]);
                      //  console.log(spec);
                        //console.log(manifest);
                        }
                        break;
                } */
    }
}

exports.default = ManifestHunter;
