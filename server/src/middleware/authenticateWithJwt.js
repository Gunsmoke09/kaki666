const jwt = require("jsonwebtoken");

const authenticateWithJwt = (req, res, next) => {
   if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "JWT secret is not configured" });
   }

   const authHeader = req.headers.authorization || "";
   const [scheme, token] = authHeader.split(" ");

   if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Unauthorized: Bearer token required" });
   }

   try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      req.user = user;
      next();
   } catch (err) {
      console.log(
         `JWT verification failed at URL ${req.url}`,
         err.name,
         err.message,
      );
      return res.status(401).json({ error: "Invalid token" });
   }
};

module.exports = authenticateWithJwt;
