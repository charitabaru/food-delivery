import mongoose from "mongoose";

export const connectDB = async()=>{
    await mongoose.connect('mongodb+srv://charitasribaru:qKunELBNosi7qM0D@cluster0.1xq8m.mongodb.net/food-del').then(()=>{
        console.log("DB connected")
    });
}