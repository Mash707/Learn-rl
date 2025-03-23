import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as dynamoose from "dynamoose";
import { createClerkClient } from "@clerk/express";
/* import Routes */
import courseRoutes from "./routes/courseRoutes";
import userClerkRoutes from "./routes/userClerkRoutes";


/****/
dotenv.config();

const isProduction =  process.env.NODE_ENV === "production";

if(!isProduction){
    dynamoose.aws.ddb.local();
}

export const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY
})

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginEmbedderPolicy({ policy: "credentialless" }));
// Or comment it out if it's causing problems:
// app.use(helmet.crossOriginEmbedderPolicy({ policy: "require-corp" }));

// Also ensure CORS is properly configured
app.use(cors({
  origin: process.env.CLIENT_URL || '*', // Adjust according to your needs
  credentials: true
}));
app.use(morgan('common'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes

app.get("/", (req, res) => {    
    res.send("Hello World!");
}
);

app.use("/courses", courseRoutes);
app.use("/users/clerk", userClerkRoutes);

const port = process.env.PORT || 8000;
if(!isProduction){
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}