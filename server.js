const express = require('express');
const dbConnect = require('./database/index');
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");
const commentRoutes = require("./routes/commentRoutes");
const {PORT} = require("./config/index");
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require("cookie-parser");

const app = express(); 

app.use(cookieParser()); // cookieParser middleware is used to send or store json web token in cookies, in this app cookie based authentication is doing

dbConnect();

app.use(express.json());

app.use('/user', userRoutes);
app.use('/blogs', blogRoutes);
app.use('/comment', commentRoutes);

app.use("/storage", express.static("storage"));

app.use(errorHandler);

app.listen(PORT, () => console.log(`Backend is running on port ${PORT}`));


