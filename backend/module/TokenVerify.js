import JWT from 'jsonwebtoken';

const secret = "4f194280985c79eb85b95941026d477fb952395a934e884f2fa7b5779b2be1b8"

export function verifyToken(req, res, next) {
	const token = req.headers.cookie?.split(' ')[1];
	if (!token) {
		return res.status(401).json({
			status: 401,
			success: false,
			message: 'No token provided',
		});
	}

	JWT.verify(token, secret, (err, decoded) => {
		if (err) {
			return res.status(401).json({
				status: 401,
				success: false,
				message: 'Invalid token',
			});
		}
		req.user = decoded;
		next();
	});
}


/**
 * Generates a JWT token with the given payload.
 * @param payload
 * @returns {string}
 */
export function generateToken(payload) {
	return `Bearer ${JWT.sign(payload, secret, { expiresIn: '1h' })}`;
}

export default {
	verifyToken,
	generateToken
}