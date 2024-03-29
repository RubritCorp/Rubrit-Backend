import jwt from "jsonwebtoken";
import User from "../models/User";
import asyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];

        //decodes token id
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select(
          "_id name email profilePic"
        );

        next();
      } catch (error) {
        res.status(401);
        throw new Error("Not authorized, token failed");
      }
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }
  }
);
