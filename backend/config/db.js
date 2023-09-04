const mongoose = require("mongoose");
   require("dotenv").config();



   const connection = async () => {
      try {
     
         await mongoose.connect("mongodb+srv://mandeeprahar:9802705402@cluster0.dg2aosu.mongodb.net/?retryWrites=true&w=majority");
         
      } catch (err) {
         console.error("Error connecting to MongoDB:", err);
      }
   }

   
module.exports= {connection};