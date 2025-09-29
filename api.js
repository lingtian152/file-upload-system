import express from 'express';
import { createServer } from 'http';
import fse from 'fs-extra';
import multer from 'multer';
import cors from 'cors';

import Database from './backend/module/database.js';

import apiRoutes from './backend/router/Auth.js';
import FileRouters from './backend/router/file.js'

const app = express();
const server = createServer(app);

const db = new Database();

const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // 只允许前端访问
    credentials: true // 允许带 cookie
}))

app.use('/api', apiRoutes);
app.use('/file', FileRouters);


(async () => {
    await fse.ensureDir('config', (err) => {
        if (err) {
            console.error(err);
        }
    });

    try {
        await db.init();
        console.log('Database initialized successfully.');

        app.set('db', db); // 将数据库实例设置到 Express 应用中，供其他模块使用

    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1); // Exit the process if database initialization fails
    }
})();

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
})