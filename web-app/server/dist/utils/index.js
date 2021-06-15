"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKVAttributes = exports.processFileFromDir = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
function processFileFromDir(_path) {
    const __path = path.join(process.cwd(), _path);
    const _config = fs.readFileSync(__path, "utf8");
    return JSON.parse(_config);
}
exports.processFileFromDir = processFileFromDir;
function generateKVAttributes(data) {
    const KVPairs = [];
    Object.keys(data).forEach((key) => {
        let kv = {
            ecert: true,
            name: key,
            value: data[key],
        };
        KVPairs.push(kv);
    });
    return KVPairs;
}
exports.generateKVAttributes = generateKVAttributes;
//# sourceMappingURL=index.js.map