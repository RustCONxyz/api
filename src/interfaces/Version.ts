import type { Document } from "mongoose";

export default interface Version extends Document {

    type: string;

    version: string;

    releaseDate: Date;

    releaseUnix: number;

}
