import { Schema, model } from "mongoose";
import PushToken, { PushTokenSettings } from "../../interfaces/PushToken.js";

const pushTokenSettingsSchema = new Schema<PushTokenSettings>({

    clientUpdates: {
        type: Boolean,
        required: true
    },

    serverUpdates: {
        type: Boolean,
        required: true
    },

    oxideUpdates: {
        type: Boolean,
        required: true
    },

    carbonUpdates: {
        type: Boolean,
        required: true
    },

    protocolUpdates: {
        type: Boolean,
        required: true
    }

}, { _id: false, versionKey: false });

const pushTokenSchema = new Schema<PushToken>({

    token: {
        type: String,
        required: true
    },

    settings: {
        type: pushTokenSettingsSchema,
        required: true
    }

}, { versionKey: false });

export default model<PushToken>("push-tokens", pushTokenSchema);
