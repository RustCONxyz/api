import { z } from "zod";
import { Expo } from "expo-server-sdk";

export const PushTokenSchema = z.object({

    body: z.object({

        token: z.string().refine((token) => Expo.isExpoPushToken(token)),

        settings: z.object({
    
            clientUpdates: z.boolean(),
    
            serverUpdates: z.boolean(),
    
            oxideUpdates: z.boolean(),
    
            carbonUpdates: z.boolean(),
    
            protocolUpdates: z.boolean()
    
        })

    })

});

export type PushToken = z.infer<typeof PushTokenSchema>["body"];
