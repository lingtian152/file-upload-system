import knex from 'knex'
import bcrypt from 'bcrypt'

/**
 * MySQL 数据库管理类
 */
class Database {
	constructor() {
		this.connection = null
	}

	/**
	 * 异步初始化数据库连接和表
	 */
	async init() {
		try {
			this.connection = knex({
				client: 'mysql2',
				connection: {
					host: process.env.DB_HOST || 'localhost',
					port: process.env.DB_PORT || 3306,
					user: process.env.DB_USER || 'root',
					password: process.env.DB_PASSWORD || 'root',
					database: process.env.DB_NAME || 'website_data',
				},
			})

			console.log('✅ MySQL connected successfully.')

			// 初始化 users 表
			await this.connection.raw(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL
        ) ENGINE=InnoDB CHARSET=utf8mb4;
      `)

			console.log('✅ Users table ensured.')
		} catch (error) {
			console.error('❌ Database initialization failed:', error.message)
			throw new Error(`Database init error: ${error.message}`)
		}
	}

	/**
	 * 根据用户名查询用户（不返回密码）
	 */
	async getUserByUsername(username) {
		try {
			if (!username) {
				return { status: 400, success: false, message: 'Username is required' }
			}

			const user = await this.connection('users')
				.select('id', 'username')
				.where({ username })
				.first()

			if (!user) {
				return { status: 404, success: false, message: 'User not found' }
			}

			return { status: 200, success: true, user }
		} catch (error) {
			console.error('Database query error (getUserByUsername):', error)
			return { status: 500, success: false, message: 'Database query failed' }
		}
	}

	/**
	 * 注册新用户（密码自动哈希）
	 */
	async register(username, password) {
		try {
			if (!username || !password) {
				return { status: 400, success: false, message: 'Username and password are required' }
			}

			// 检查是否存在
			const existing = await this.connection('users').where({ username }).first()
			if (existing) {
				return { status: 409, success: false, message: 'Username already exists' }
			}

			// 哈希密码
			const hashedPassword = await bcrypt.hash(password, 10)

			await this.connection('users').insert({ username, password: hashedPassword })

			return { status: 200, success: true, message: 'User registered successfully' }
		} catch (error) {
			console.error('Database error (register):', error)
			return { status: 500, success: false, message: 'Failed to register user' }
		}
	}

	/**
	 * 登录验证
	 */
	async login(username, password) {
		try {
			if (!username || !password) {
				return { status: 400, success: false, message: 'Username and password are required' }
			}

			const user = await this.connection('users')
				.select('id', 'username', 'password')
				.where({ username })
				.first()

			if (!user) {
				return { status: 401, success: false, message: 'Invalid username or password' }
			}

			const isMatch = await bcrypt.compare(password, user.password)
			if (!isMatch) {
				return { status: 401, success: false, message: 'Invalid username or password' }
			}

			return {
				status: 200,
				success: true,
				message: 'Login successful',
				user: { id: user.id, username: user.username },
			}
		} catch (error) {
			console.error('Login error:', error)
			return { status: 500, success: false, message: 'Internal server error' }
		}
	}

	/**
	 * 修改用户名
	 */
	async updateName(oldUsername, newUsername) {
		try {
			if (!oldUsername || !newUsername) {
				return { status: 400, success: false, message: 'Both old and new username are required' }
			}

			const user = await this.connection('users').where({ username: oldUsername }).first()
			if (!user) {
				return { status: 404, success: false, message: 'User not found' }
			}

			await this.connection('users').where({ username: oldUsername }).update({ username: newUsername })

			return { status: 200, success: true, message: 'Username updated successfully' }
		} catch (error) {
			console.error('Database error (updateName):', error)
			return { status: 500, success: false, message: 'Failed to update username' }
		}
	}

	/**
	 * 修改密码
	 */
	async updatePassword(username, oldPassword, newPassword) {
		try {
			if (!username || !oldPassword || !newPassword) {
				return { status: 400, success: false, message: 'All fields are required' }
			}

			const user = await this.connection('users')
				.select('id', 'password')
				.where({ username })
				.first()

			if (!user) {
				return { status: 404, success: false, message: 'User not found' }
			}

			const isMatch = await bcrypt.compare(oldPassword, user.password)
			if (!isMatch) {
				return { status: 401, success: false, message: 'Invalid old password' }
			}

			const hashedPassword = await bcrypt.hash(newPassword, 10)
			await this.connection('users').where({ username }).update({ password: hashedPassword })

			return { status: 200, success: true, message: 'Password updated successfully' }
		} catch (error) {
			console.error('Database error (updatePassword):', error)
			return { status: 500, success: false, message: 'Failed to update password' }
		}
	}

	/**
	 * 关闭数据库连接
	 */
	async close() {
		if (this.connection) {
			await this.connection.destroy()
			console.log('🔒 MySQL connection closed.')
		}
	}
}

export default Database
