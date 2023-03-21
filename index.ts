import dotenv from 'dotenv';
dotenv.config();
import csv2mysql from './csv2mysql';
import express from 'express';
import { readdirSync } from 'fs';
import path from 'path';

const app = express();

// app.get("/convert", async (req, resp) => {
    // const files = readdirSync(process.env.csv_folder).filter(name => name.endsWith(".csv"));
    // console.log(files);
    // for(let file of files) {
    //     resp.write(`converting ${file}\n`);
    //     await csv2mysql(path.join(process.env.csv_folder, file.substr(0, file.length-4)));
    // }
//     resp.end(`Ended`);
// });

// app.listen(5000, () => {
//     console.log("app is listening");
// })


void async function main() {
    const files = readdirSync(process.env.csv_folder).filter(name => name.endsWith(".csv"));
    console.log(files);
    for(let file of files) {
        const tablename = file.substr(0, file.length-4);
        await csv2mysql(path.join(process.env.csv_folder, tablename), tablename);
    }
}()