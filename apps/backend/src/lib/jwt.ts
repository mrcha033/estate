import jwt

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Use a strong secret in production

export const generateToken = (payload: object, expiresIn: string) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
