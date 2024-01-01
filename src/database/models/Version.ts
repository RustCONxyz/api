import { Schema, model } from "mongoose";
import type Version from "../../types/Version.js";

const versionSchema = new Schema<Version>({

    type: {
        type: String,
        required: true
    },

    version: {
        type: String,
        required: true
    },

    release: {
        type: Number,
        required: true
    }

});

export default model<Version>("versions", versionSchema);
