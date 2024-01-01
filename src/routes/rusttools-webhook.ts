import { Router } from "express";
import type { ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import expo from "../lib/expo.js";
import PushToken from "../database/models/PushToken.js";
import type RustToolsWebhook from "../types/RustToolsWebhook.js";

const router = Router();

const notificationMessages = new Map([
    ["clientUpdates", { title: "Client Update", body: "An update for the Rust client has been released!" }],
    ["serverUpdates", { title: "Server Update", body: "An update for the Rust server has been released!" }],
    ["oxideUpdates", { title: "Oxide Update", body: "An update for Oxide has been released!" }],
    ["carbonUpdates", { title: "Carbon Update", body: "An update for Carbon has been released!" }],
    ["protocolUpdates", { title: "Protocol Update", body: "The protocol has been updated, which means the lastest update is mandatory!" }]
]);

router.post("/", async (req, res) => {

    res.sendStatus(200);

    const webhook = req.body as RustToolsWebhook;

    if (webhook.event !== "NEW_VERSION") {

        return;

    }

    const webhookData = webhook.data;

    const notificationMessage = notificationMessages.get(`${webhookData.type}Updates`);

    if (!notificationMessage) {

        return;

    }

    const pushTokens = await PushToken.find({ [`settings.${webhookData.type}Updates`]: true });

    const messages: ExpoPushMessage[] = pushTokens.map(pushToken => ({

        to: pushToken.token,

        sound: "default",

        title: notificationMessage.title,

        body: notificationMessage.body

    }));

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

    for (const ticket of tickets) {

        if (ticket.status === "ok") {

            receiptIds.push(ticket.id);

        }

    }

    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

    (async () => {

        for (const chunk of receiptIdChunks) {

            try {

                const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

                for (const receiptId in receipts) {

                    const receipt = receipts[receiptId];

                    if (receipt.status === "ok") {

                        continue;

                    }

                    console.error(`There was an error sending a notification: ${receipt.message}`);

                }

            } catch (error) {

                console.error(error);

            }

        }

    })();

});

export default router;
