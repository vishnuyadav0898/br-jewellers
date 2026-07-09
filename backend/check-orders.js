import mongoose from "mongoose";

const MONGO_URI = "mongodb://localhost:27017/";

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB at test database");

    const orders = await mongoose.connection.collection("orders").find().toArray();
    console.log("Total orders:", orders.length);
    
    for (const order of orders) {
      console.log("Order ID:", order._id);
      console.log("Order Number:", order.orderNumber);
      console.log("User:", order.user);
      console.log("Status:", order.status);
      console.log("Items:");
      for (const item of order.items) {
        console.log(" - Product ID:", item.product);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
