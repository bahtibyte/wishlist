import { CognitoJwtVerifier } from "aws-jwt-verify";
import express from 'express';

const COGNITO_USER_POOL_ID = process.env.NODE_AWS_COGNITO_USER_POOL_ID!;
const COGNITO_CLIENT_ID = process.env.NODE_AWS_COGNITO_CLIENT_ID!;

const verifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  clientId: COGNITO_CLIENT_ID,
  tokenUse: "access",
});

// Verify the access token and add the user info to the request object
const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const payload = await verifier.verify(token);
    (req as any).userAuth = payload;

    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ message: 'Invalid authorization token' });
  }
};

export { authMiddleware };