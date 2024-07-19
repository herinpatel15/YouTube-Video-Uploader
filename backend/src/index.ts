// import express, {Express} from "express"
// import multer from "multer"

// import {config} from "dotenv"
// // import { UploadeController } from "./lib/UploadController";
// config();

// const cors = require("cors")

// const app: Express = express()

// // app.use(cors())

// app.use(express.json({ limit: '5gb' }));
// app.use(express.urlencoded({ limit: '5gb', extended: true }));

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/')
//     },

//     filename: function (req, file, cb) {
//         cb(null, Date.now() + "-" + file.originalname)
//     }
// });

// const upload = multer({
//     storage: storage,
//     fileFilter: function (req, file, cb) {
//         if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
//             return cb(null, false);;
//         }
//         cb(null, true);
//     },
//     limits: {
//         fileSize: 1024 * 1024 * 1024 * 5 // Limit file size to 5GB
//     }
// })

// app.get("/", (req, res) => {
//     res.json({"init": "hello herin"})
// })

// app.post("/api/upload-video", upload.single('video'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).send('No file uploaded.');
//     }
//     res.status(200).json({"done": "all fine..."});
// })

// app.listen(process.env.PORT, () => {
//     console.log(`Server is running on port ${process.env.PORT}`)
// })

import express, { Express, Request, Response } from "express";
import multer from "multer";
import { config } from "dotenv";
import path from "path";
import fs from "fs/promises";

config();

const cors = require("cors");

const app: Express = express();

app.use(express.json({ limit: '5gb' }));
app.use(express.urlencoded({ limit: '5gb', extended: true }));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
            return cb(null, false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 1024 * 1024 * 1024 * 5 // Limit file size to 5GB
    }
});

async function getFolderSize(folderPath: string): Promise<number> {
    let totalSize = 0;

    async function calculateSize(itemPath: string) {
        const stats = await fs.stat(itemPath);

        if (stats.isFile()) {
            totalSize += stats.size;
        } else if (stats.isDirectory()) {
            const files = await fs.readdir(itemPath);
            for (const file of files) {
                await calculateSize(path.join(itemPath, file));
            }
        }
    }

    await calculateSize(folderPath);
    return totalSize;
}

app.get("/", (req: Request, res: Response) => {
    res.json({"init": "hello herin"});
});

app.post("/api/upload-video", upload.single('video'), async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const uploadsPath = path.join(__dirname, '../uploads');
        const folderSize = await getFolderSize(uploadsPath);

        res.status(200).json({
            "done": "all fine...",
            "folderSizeBytes": folderSize,
            "folderSizeMB": (folderSize / (1024 * 1024)).toFixed(2)
        });
    } catch (error) {
        console.error('Error calculating folder size:', error);
        res.status(500).json({"error": "Failed to calculate folder size"});
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});