import { Schema, model } from "mongoose";
import type Version from "../../interfaces/Version.js";

const versionSchema = new Schema<Version>({

    type: {
        type: String,
        required: true
    },

    version: {
        type: String,
        required: true
    },

    releaseDate: {
        type: Date,
        required: true
    },

    releaseUnix: {
        type: Number,
        required: true
    }

});

export default model<Version>("versions", versionSchema);
