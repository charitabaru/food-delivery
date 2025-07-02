import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. No token provided."
            });
        }

        const tokenValue = token.startsWith("Bearer ") ? token.slice(7) : token;

        if (!tokenValue) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Invalid token format."
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined in environment variables");
            return res.status(500).json({
                success: false,
                message: "Server configuration error"
            });
        }

        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id || decoded._id,
            email: decoded.email
        };

        next();

    } catch (error) {
        console.error("Auth middleware error:", error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please login again."
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Please login again."
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Authentication failed. Please login again."
            });
        }
    }
};

export default authMiddleware;
