import { Router } from "express";
import Version from "../database/models/Version.js";

const router = Router();

router.get("/", async (req, res) => {

    try {

        const versions = await Version.find();

        if (versions.length === 0) {

            throw new Error("No versions Found");

        }

        const currentVersions: Record<string, { version: string, release: number }> = {};

        versions.forEach((version) => {

            version = version.toObject();

            currentVersions[version.type] = {

                version: version.version,

                release: version.release

            }

        });

        res.status(200).json(currentVersions);

    } catch (error) {

        res.sendStatus(500);

        console.error(error);

    }

});

export default router;
