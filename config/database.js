import mongoose from "mongoose";

export const connectDB = async () => {
  const { connection } = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected with ${connection.host}`);


  // async function connectToDatabase() {
  //   try {
  //     const connection = await mongoose.connect("mongodb://localhost:27017/dummy", {
  //       useNewUrlParser: true,
  //       useUnifiedTopology: true,
  //     });
  //     console.log("Connected to MongoDB:", connection.connection.name);
  //   } catch (error) {
  //     console.error("Error connecting to MongoDB:", error);
  //   }
  // }

  // connectToDatabase();
}