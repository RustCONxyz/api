import type { Request } from "express";
import type { z, AnyZodObject } from "zod";

export async function parseRequest<T extends AnyZodObject>(req: Request, schema: T): Promise<z.infer<T> | null> {

    const parsedRequest = await schema.safeParseAsync({

        body: req.body,

        query: req.query,

        params: req.params

    });

    if (parsedRequest.success) {

        return parsedRequest.data;

    }

    return null;

}
