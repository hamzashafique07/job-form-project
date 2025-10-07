// import dotenv from "dotenv";
// dotenv.config(); // 👈 Load .env before accessing process.env

// import mongoose from "mongoose";
// import Form from "./models/Form";

// async function wipe() {
//   try {
//     const uri = process.env.MONGODB_URI;
//     if (!uri) throw new Error("MONGODB_URI not defined in .env");

//     await mongoose.connect(uri);
//     console.log("✅ Connected to MongoDB");

//     const result = await Form.deleteMany({});
//     console.log(`🧹 Deleted ${result.deletedCount} documents`);

//     await mongoose.disconnect();
//     console.log("🔌 Disconnected from MongoDB");
//   } catch (err) {
//     console.error("❌ Error wiping database:", err);
//   }
// }

// wipe();
