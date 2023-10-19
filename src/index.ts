import "dotenv/config";
import express from "express";
import { Expo } from "expo-server-sdk";

import connectToDatabase from "./database/index.js";

import PushToken from "./database/models/PushToken.js";
import Version from "./database/models/Version.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {

    res.send("Hello World");

});

app.get("/versions", async (req, res) => {

    try {

        const versions = await Version.find();

        if (versions.length === 0) {

            throw new Error("No versions Found");

        }

        const currentVersions: any = {};

        versions.forEach((version) => {

            currentVersions[version.type] = {

                version: version.version,

                releaseDate: version.releaseDate,

                releaseUnix: version.releaseUnix

            }

        });

        res.status(200).json(currentVersions);

    } catch (error) {

        res.sendStatus(500);

        console.error(error);

    }

});

app.post("/push-token", async (req, res) => {

    try {

        const token = req.body.token;

        if (!Expo.isExpoPushToken(token)) {

            throw new Error("Invalid Expo Push Token");

        }

        const pushToken = await PushToken.findOne({ token });

        if (pushToken) {

            await PushToken.updateOne({ token }, req.body);

        } else {

            await PushToken.create(req.body);

        }

        res.sendStatus(200);

    } catch (error) {

        res.sendStatus(500);

        console.error(error);

    }

});

app.post("/rusttools-webhook", isAuthed, async (req, res) => {

    res.sendStatus(200);

});

app.listen(3000, () => {

    connectToDatabase();

    console.log("Server running on port 3000");

});

function isAuthed(req: express.Request, res: express.Response, next: express.NextFunction) {

    const AUTH_TOKEN = process.env.AUTH_TOKEN;

    if (!AUTH_TOKEN) {

        throw new Error("AUTH_TOKEN not found");

    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {

        return res.sendStatus(401);

    }

    const token = authHeader.split(" ")[1];

    if (token !== AUTH_TOKEN) {

        return res.sendStatus(401);

    }

    next();

}
