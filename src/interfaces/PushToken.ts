import type { Document } from "mongoose";

export default interface PushToken extends Document {

    token: string;

    settings: PushTokenSettings;

}

export interface PushTokenSettings {

    clientUpdates: boolean;

    serverUpdates: boolean;

    oxideUpdates: boolean;

    carbonUpdates: boolean;

    protocolUpdates: boolean;

}
