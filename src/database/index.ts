import { connect } from "mongoose";

export default async function connectToDatabase() {

    try {

        const mongodbURI = process.env.MONGODB_URI;

        if (!mongodbURI) {

            throw new Error("MONGODB_URI not found");

        }

        await connect(mongodbURI);

        console.log("Connected to MongoDB");

    } catch (error) {

        console.error(error);

        process.exit(1);

    }

}
