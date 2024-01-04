import { Schema, model } from "mongoose";
import { PushToken } from "../../schemas/PushToken.js";

const pushTokenSettingsSchema = new Schema<PushToken["settings"]>({

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
