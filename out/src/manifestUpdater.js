'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const editJsonFile = require("edit-json-file");
class ManifestUpdater {
    static save(path, jsonPath, data, callback) {
        try {
            let file = editJsonFile(path);
            console.log(data);
            file.set(jsonPath, data);
            file.save();
            callback({ status: 200, err: null });
        }
        catch (err) {
            callback({ status: 500, err: err });
        }
    }
}
exports.default = ManifestUpdater;
