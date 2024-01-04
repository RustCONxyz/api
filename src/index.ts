import "dotenv/config";
import express from "express";

import connectToDatabase from "./database/index.js";

import AuthMiddleware from "./middlewares/auth.js";

import PushTokenRouter from "./routes/push-token.js";
import RustToolsWebhookRouter from "./routes/rusttools-webhook.js";
import VersionsRouter from "./routes/versions.js";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.get("/", (req, res) => {

    res.send("Hello World");

});

app.use("/push-token", PushTokenRouter);

app.use("/rusttools-webhook", AuthMiddleware, RustToolsWebhookRouter);

app.use("/versions", VersionsRouter);

app.listen(PORT, () => {

    connectToDatabase();

    console.log(`Server running on port ${PORT}`);

});
