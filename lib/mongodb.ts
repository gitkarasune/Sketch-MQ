import mongoose from 'mongoose';

let isConnected :boolean = false;

export const connectSketchMQDatabase = async () => {
  if (isConnected) {
    console.log("MongoDB is already connected!");
  } else {
    try {
      await mongoose.connect(process.env.MONGODB_URL || "", {
        dbName: "Sketch-MQ",
      });

      isConnected = true;
      console.log("Connected to MongoDB!"); 
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  }
  return mongoose.connection; // ✅ return the connection object
};

export default connectSketchMQDatabase;
// This function connects to a MongoDB database using Mongoose.
// It uses the connection string stored in the environment variable MONGODB_URL.