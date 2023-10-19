export default interface RustToolsWebhook {

    event: string;

    data: RustToolsWebhookData;

}

export interface RustToolsWebhookData {

    type: string;

    newVersion: string;

    oldVersion: string;

}
