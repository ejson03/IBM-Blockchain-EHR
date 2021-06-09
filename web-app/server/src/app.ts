"use strict";

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import { router } from "./routes";

const app = express();
app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(cors());
app.use("/", router);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server started on port 5000");
});
