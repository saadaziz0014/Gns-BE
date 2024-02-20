const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const indexRouter = require("./routes/index");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/", indexRouter);

mongoose.connect(process.env.DATABASE_URL).then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server listening on http://127.0.0.1:${process.env.PORT}`);
  });
});
