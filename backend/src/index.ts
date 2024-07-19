import express, {Express} from "express"
import {config} from "dotenv"

config();

const app: Express = express()

app.get("/", (req, res) => {
    res.json({"init": "hello herin"})
})

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})