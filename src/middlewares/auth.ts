import type { Request, Response, NextFunction } from "express";

export default function middleware(req: Request, res: Response, next: NextFunction) {

    const AUTH_TOKEN = process.env.AUTH_TOKEN;

    if (!AUTH_TOKEN) {

        throw new Error("AUTH_TOKEN not found");

    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {

        res.sendStatus(401);

        return;

    }

    const [type, token] = authHeader.split(" ");

    if (type === "Bearer" && token === AUTH_TOKEN) {

        next();

        return;

    }

    res.sendStatus(401);

}
