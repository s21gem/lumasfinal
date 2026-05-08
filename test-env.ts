import dotenv from "dotenv";
dotenv.config();
console.log("JWT_SECRET is:", process.env.JWT_SECRET);
console.log("Is it equal to 'supersecretjwtkey'?", process.env.JWT_SECRET === "supersecretjwtkey");
