import express from 'express';

import TokenVerify, { generateToken } from '../module/TokenVerify.js';

const router = express.Router();

// 登录：使用 db.login() 方法（已包含密码验证）
router.post('/login', async (req, res) => {
	const db = req.app.get('db'); // 从 app 获取已初始化的实例

	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({
			status: 400,
			success: false,
			message: 'Username and password are required',
		});
	}

	try {
		// 调用异步方法并 await
		const result = await db.login(username, password);

		if (!result.success) {
			return res.status(result.status).json(result);
		}

		// 使用 result.user
		const token = TokenVerify.generateToken({
			id: result.user.id,
			username: result.user.username,
		});

		return res.json({
			status: 200,
			success: true,
			message: 'Login successful',
			token,
		});
	} catch (e) {
		console.error('Login error:', e);
		return res.status(500).json({
			status: 500,
			success: false,
			message: 'Internal server error',
		});
	}
});

// 注册
router.post('/register', async (req, res) => {

	const db = req.app.get('db'); // 获取共享实例
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({
			status: 400,
			success: false,
			message: 'Username and password are required',
		});
	}

	try {
		const result = await db.register(username, password); // password 传明文，内部哈希

		if (!result.success) {
			console.log(result)
			return res.status(result.status).json(result); // 返回完整对象
		}

		return res.status(200).json({
			status: 200,
			success: true,
			message: '注册成功'
		});
	} catch (e) {
		console.error('Register error:', e);
		return res.status(500).json({
			status: 500,
			success: false,
			message: 'Internal server error',
		});
	}
});

router.post('/UpdateName', async (req, res) => {
	const db = req.app.get('db'); // 获取共享实例

	const { username, newUsername } = req.body;

	if (!username || !newUsername) {
		return res.status(400).json({
			status: 400,
			success: false,
			message: 'Username and newUsername are required',
		});
	}

	try {
		const result = await db.updateName(username, newUsername);
		if (!result.success) {
			return res.status(result.status).json(result);
		}

		const token = TokenVerify.generateToken({
			id: result.id,
			username: result.username,
		});

		return res.status(200).json({
			status: 200,
			success: true,
			message: 'Username updated successfully',
			token
		});
	} catch (e) {
		console.error('UpdateName error:', e);
		return res.status(500).json({
			status: 500,
			success: false,
			message: 'Internal server error',
		});
	}
})

router.post('/changePassword', async (req, res) => {
	const db = req.app.get('db'); // 获取共享实例
	const { username, oldPassword, newPassword } = req.body;
	if (!username || !oldPassword || !newPassword) {
		return res.status(400).json({
			status: 400,
			success: false,
			message: 'Username, old password, and new password are required',
		});
	}
	try {
		const result = await db.updatePassword(username, oldPassword, newPassword);
		if (!result.success) {
			return res.status(result.status).json(result);
		}
		return res.status(200).json({
			status: 200,
			success: true,
			message: 'Password updated successfully',
		});
	} catch (e) {
		console.error('ChangePassword error:', e);
		return res.status(500).json({
			status: 500,
			success: false,
			message: 'Internal server error',
		});
	}
});


export default router;