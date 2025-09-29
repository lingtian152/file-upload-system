import mysql from 'mysql2/promise'; // 使用 Promise 风格
import bcrypt from 'bcrypt';

/**
 * MySQL 数据库管理类
 */
class Database {
	constructor() {
		this.connection = null;
	}

	/**
	 * 异步初始化数据库连接和表
	 */
	async init() {
		try {
			// 1. 创建数据库连接（会自动连接）
			this.connection = await mysql.createConnection({
				host: process.env.DB_HOST || 'localhost',
				port: process.env.DB_PORT || 3306,
				user: process.env.DB_USER || 'root',
				password: process.env.DB_PASSWORD || 'root',
				database: process.env.DB_NAME || 'website_data', // 会自动创建表，但不会自动创建库
			});

			console.log('MySQL connected successfully.');

			// 2. 创建 users 表（如果不存在）
			await this.connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL
        ) ENGINE=InnoDB CHARSET=utf8mb4;
      `);

			console.log('Users table ensured.');
		} catch (error) {
			console.error('Database initialization failed:', error.message);
			throw new Error(`Database init error: ${error.message}`);
		}
	}

	/**
	 * 根据用户名查询用户（不返回密码）
	 * @param {string} username
	 * @returns {{ status: number, success: boolean, message?: string, user?: { id: number, username: string } }}
	 */
	async getUserByUsername(username) {
		try {
			if (!username) {
				return {
					status: 400,
					success: false,
					message: 'Username is required',
				};
			}

			const [rows] = await this.connection.execute(
				'SELECT id, username FROM users WHERE username = ?',
				[username]
			);

			if (rows.length === 0) {
				return {
					status: 404,
					success: false,
					message: 'User not found',
				};
			}

			return {
				status: 200,
				success: true,
				user: rows[0],
			};
		} catch (error) {
			console.error('Database query error (getUserByUsername):', error);
			return {
				status: 500,
				success: false,
				message: 'Database query failed',
			};
		}
	}

	/**
	 * 注册新用户（密码自动哈希）
	 * @param {string} username
	 * @param {string} password
	 * @returns {{ status: number, success: boolean, message: string }}
	 */
	async register(username, password) {
		try {
			if (!username || !password) {
				return {
					status: 400,
					success: false,
					message: 'Username and password are required',
				};
			}

			// 检查用户是否已存在
			const [existing] = await this.connection.execute(
				'SELECT 1 FROM users WHERE username = ? LIMIT 1',
				[username]
			);

			if (existing.length > 0) {
				return {
					status: 409,
					success: false,
					message: 'Username already exists',
				};
			}

			// 哈希密码
			const hashedPassword = await bcrypt.hash(password, 10);

			// 插入用户
			await this.connection.execute(
				'INSERT INTO users (username, password) VALUES (?, ?)',
				[username, hashedPassword]
			);

			return {
				status: 200,
				success: true,
				message: 'User registered successfully',
			};
		} catch (error) {
			console.error('Database error (register):', error);
			return {
				status: 500,
				success: false,
				message: 'Failed to register user',
			};
		}
	}

	/**
	 * 验证登录密码
	 * @param {string} username
	 * @param {string} password
	 * @returns {{ status: number, success: boolean, message: string, user?: { id: number, username: string } }}
	 */
	async login(username, password) {
		try {
			if (!username || !password) {
				return {
					status: 400,
					success: false,
					message: 'Username and password are required',
				};
			}

			// 查询用户（含密码哈希）
			const [rows] = await this.connection.execute(
				'SELECT id, username, password FROM users WHERE username = ?',
				[username]
			);

			if (rows.length === 0) {
				return {
					status: 401,
					success: false,
					message: 'Invalid username or password',
				};
			}

			const user = rows[0];

			// 验证密码
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return {
					status: 401,
					success: false,
					message: 'Invalid username or password',
				};
			}

			return {
				status: 200,
				success: true,
				message: 'Login successful',
				user: { id: user.id, username: user.username }
			};
		} catch (error) {
			console.error('Login error:', error);
			return {
				status: 500,
				success: false,
				message: 'Internal server error',
			};
		}
	}


	async updateName(oldUsername, newUsername) {
		try {
			if (!oldUsername || !newUsername) {
				return {
					status: 400,
					success: false,
					message: 'Old username and new username are required',
				};
			}

			// 检查用户是否存在
			const [existing] = await this.connection.execute(
				'SELECT 1 FROM users WHERE username = ? LIMIT 1',
				[oldUsername]
			);

			if (existing.length === 0) {
				return {
					status: 404,
					success: false,
					message: 'User not found',
				};
			}

			// 更新用户名
			await this.connection.execute(
				'UPDATE users SET username = ? WHERE username = ?',
				[newUsername, oldUsername]
			);

			return {
				status: 200,
				success: true,
				message: 'Username updated successfully',
			};
		} catch (error) {
			console.error('Database error (updateName):', error);
			return {
				status: 500,
				success: false,
				message: 'Failed to update username',
			};
		}
	}

	async updatePassword(username, oldPassword, newPassword) {
		try {
			if (!username || !oldPassword || !newPassword) {
				return {
					status: 400,
					success: false,
					message: 'Username, old password, and new password are required',
				};
			}

			// 检查用户是否存在
			const [existing] = await this.connection.execute(
				'SELECT 1 FROM users WHERE username = ? LIMIT 1',
				[username]
			);

			if (existing.length === 0) {
				return {
					status: 404,
					success: false,
					message: 'User not found',
				};
			}

			// 验证旧密码
			const [user] = await this.connection.execute(
				'SELECT id, username, password FROM users WHERE username = ?',
				[username]
			);

			if (user.length === 0) {
				return {
					status: 404,
					success: false,
					message: 'User not found',
				};
			}

			const isMatch = await bcrypt.compare(oldPassword, user[0].password);
			if (!isMatch) {
				return {
					status: 401,
					success: false,
					message: 'Invalid old password',
				};
			}

			// 更新密码
			const hashedPassword = await bcrypt.hash(newPassword, 10);
			await this.connection.execute(
				'UPDATE users SET password = ? WHERE username = ?',
				[hashedPassword, username]
			);

			return {
				status: 200,
				success: true,
				message: 'Password updated successfully',
			};
		} catch (error) {
			console.error('Database error (updatePassword):', error);
			return {
				status: 500,
				success: false,
				message: 'Failed to update password',
			};
		}
	}

	/**
	 * 关闭数据库连接
	 */
	async close() {
		if (this.connection) {
			await this.connection.end();
			console.log('MySQL connection closed.');
		}
	}
}

export default Database;