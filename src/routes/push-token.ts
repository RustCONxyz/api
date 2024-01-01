import { Router } from "express";
import { parseRequest } from "../utils/parseRequest.js";
import { PushTokenSchema } from "../schemas/PushToken.js";
import PushToken from "../database/models/PushToken.js";

const router = Router();

router.post("/", async (req, res) => {

    try {

        const parsedRequest = await parseRequest(req, PushTokenSchema);

        if (!parsedRequest) {

            res.sendStatus(400);

            return;

        }

        const { token } = parsedRequest.body;

        const pushToken = await PushToken.findOne({ token });

        if (pushToken) {

            await PushToken.updateOne({ token }, parsedRequest.body);

        } else {

            await PushToken.create(parsedRequest.body);

        }

        res.sendStatus(200);

    } catch (error) {

        res.sendStatus(500);

        console.error(error);

    }

});

export default router;
