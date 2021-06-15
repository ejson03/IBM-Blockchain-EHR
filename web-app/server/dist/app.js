"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./routes");
const fabric_network_1 = require("./services/fabric-network");
const app = express_1.default();
// app.use(morgan("combined"));
app.use(body_parser_1.default.json());
app.use(cors_1.default());
app.use("/", routes_1.router);
app.listen(process.env.PORT || 5000, async () => {
    console.log("Server started on port 5000");
    await fabric_network_1.enrollAdmin("Org1");
    await fabric_network_1.enrollAdmin("Org2");
});
//# sourceMappingURL=app.js.map