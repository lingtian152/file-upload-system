import express from 'express';
import multer from 'multer';
import { verifyToken } from '../module/TokenVerify.js';
import fsExtra from 'fs-extra';


const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', verifyToken, upload.array('file'), async (req, res) => { // 上传文件

    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const user = req.user; // 从 verifyToken 中间件挂载

    if (!user) {
        return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const userDir = `uploads/${user.id}`;

    try {
        // 创建用户专属目录
        await fsExtra.ensureDir(userDir);

        // 移动文件到用户目录
        const finalPaths = files.map(file => {
            return `${userDir}/${file.originalname}`;
        });
        await Promise.all(files.map((file, index) => {
            return fsExtra.move(file.path, finalPaths[index], { overwrite: true });
        }));

        // 返回成功响应
        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            files: finalPaths.map((path, index) => ({
                ...files[index],
                path: finalPaths[index]
            })),
            user: user
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ success: false, message: 'File upload failed', error: err.message });
    }
});

router.get('/request', verifyToken, async (req, res) => { // 加载文件
    const user = req.user;

    if (!user) {
        return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const userDir = `uploads/${user.id}`;

    try {
        // 读取用户目录下的文件列表
        const files = await fsExtra.readdir(userDir);

        if (files) {
            for (let i = 0; i < files.length; i++) {
                files[i] = {
                    name: files[i],
                    path: `${userDir}/${files[i]}`
                };
            }
            res.status(200).json({ success: true, files: files });
        } else {
            res.status(404).json({ success: false, message: 'No files found' });
        }
    } catch (err) {
        console.error('Read directory error:', err);
        res.status(500).json({ success: false, message: 'Failed to read user files', error: err.message });
    }
});

router.delete('/delete', verifyToken, async (req, res) => { // 删除文件
    const user = req.user;

    if (!user) {
        return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const fileIds = req.body.fileIds;

    if (!fileIds || !Array.isArray(fileIds)) {
        return res.status(400).json({ success: false, error: 'Invalid file IDs' });
    }

    try {
        // 删除文件
        await Promise.all(fileIds.map(fileId => {
            return fsExtra.remove(`uploads/${user.id}/${fileId}`);
        }));

        res.status(200).json({ success: true, message: 'Files deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ success: false, message: 'File delete failed', error: err.message });
    }
});

router.post('/read_file', verifyToken, async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "User not authenticated"
        });
    }

    const fileName = req.body.fileIds; // 前端传的单个文件名字符串
    if (!fileName) {
        return res.status(400).json({ success: false, error: 'Invalid file ID' });
    }

    const userDir = `uploads/${user.id}`;

    try {
        const files = await fsExtra.readdir(userDir);

        if (!files.includes(fileName)) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        const filePath = `${userDir}/${fileName}`;
        const fileBuffer = await fsExtra.readFile(filePath);

        // 返回 base64 字符串，前端可以直接显示图片/PDF
        const base64Data = fileBuffer.toString('base64');

        return res.status(200).json({
            success: true,
            data: {
                fileName,
                path: `data:application/octet-stream;base64,${base64Data}`
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Requested file error: ' + err.message });
    }
});


export default router;