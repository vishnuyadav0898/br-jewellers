import jwt from "jsonwebtoken";
import ResponseHandler from "../utils/responseHandler.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";


export const verifyJWT = (JWT_SECRET) => (req, res, next) => {
  try {
    /** Ensure secret key is configured */
    if (!JWT_SECRET) {
      throw new Error("Server misconfiguration: JWT_SECRET not set.");
    }

    let token = null;

    /** Extract token from headers */
    const authHeader = req.headers["authorization"] || req.headers["x-access-token"] || "";

    /** Parse "Bearer <token>" */
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    }

    /** No token → unauthorized */
    if (!token) {
      return ResponseHandler.unauthorized(
        res,
        "Unauthorized: No token provided or malformed."
      );
    }

    /** Verify JWT token */
    jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }, (err, decoded) => {
      if (err) {
        return ResponseHandler.unauthorized(
          res,
          "Unauthorized: Invalid or expired token."
        );
      }

      /** Attach decoded payload to request */
      req.user = decoded;

      /** Proceed to next middleware */
      next();
    });
  } catch (error) {
    /** Handle unexpected errors */
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};