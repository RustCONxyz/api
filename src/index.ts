import "dotenv/config";
import express from "express";
import { Expo, type ExpoPushMessage, type ExpoPushTicket } from "expo-server-sdk";

import connectToDatabase from "./database/index.js";

import PushToken from "./database/models/PushToken.js";
import Version from "./database/models/Version.js";

import type RustToolsWebhook from "./interfaces/RustToolsWebhook.js";

const app = express();

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

const notificationMessages = new Map([
    ["clientUpdates", { title: "Client Update", body: "A new Rust client update is available!"}],
    ["serverUpdates", { title: "Server Update", body: "A new Rust server update is available!"}],
    ["oxideUpdates", { title: "Oxide Update", body: "An update for Oxide has been released!"}],
    ["carbonUpdates", { title: "Carbon Update", body: "An update for Carbon has been released!"}],
    ["protocolUpdates", { title: "Protocol Update", body: "The protocol has been updated, which means the lastest update is mandatory!"}]
]);

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

            version = version.toObject();

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

    const webhook = req.body as RustToolsWebhook;

    if (webhook.event !== "NEW_VERSION") {

        return;

    }

    const webhookData = webhook.data;

    const pushTokens = await PushToken.find({ [`settings.${webhookData.type}Updates`]: true });

    const messages: ExpoPushMessage[] = [];

    const notificationMessage = notificationMessages.get(`${webhookData.type}Updates`);

    if (!notificationMessage) {

        return;

    }

    pushTokens.forEach(pushToken => {

        messages.push({

            to: pushToken.token,

            sound: "default",

            title: notificationMessage.title,

            body: notificationMessage.body,

        });

    });

    const chunks = expo.chunkPushNotifications(messages);

    const tickets: ExpoPushTicket[] = [];

    (async () => {

        for (const chunk of chunks) {

            try {

                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);

                tickets.push(...ticketChunk);

            } catch (error) {

                console.error(error);

            }

        }

    })();

    const receiptIds = [];

    for (let ticket of tickets) {

        if (ticket.status === "ok") {

            receiptIds.push(ticket.id);

        }

    }

    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

    (async () => {

        for (let chunk of receiptIdChunks) {

            try {

                let receipts = await expo.getPushNotificationReceiptsAsync(chunk);

                for (let receiptId in receipts) {

                    const receipt = receipts[receiptId];

                    if (receipt.status === "ok") {

                        continue;

                    } else if (receipt.status === "error") {

                        console.error(`There was an error sending a notification: ${receipt.message}`);

                        if (receipt.details && receipt.details.error) {

                            if (receipt.details.error === "DeviceNotRegistered") {

                                // @ts-ignore
                                await PushToken.deleteOne({ expoPushToken: tickets.find(ticket => ticket.id === receiptId)?.to });

                            }

                        }

                    }

                }

            } catch (error) {

                console.error(error);

            }

        }

    })();

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
