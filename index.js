const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

const connectDb = require("./src/config/connectDb");

connectDb();

app.get("/test", (req, res) => {
    res.send("server is live");
});

app.use("/api/user", require("./src/routes/userRoute"));
app.use("/api/roles", require("./src/routes/roleRoute"));
app.use("/api/permissions", require("./src/routes/permissionRoute"));
app.use("/api/patients", require("./src/routes/patientRoute"));
app.use("/api/doctors", require("./src/routes/doctorRoute"));
app.use("/api/nurses", require("./src/routes/nurseRoute"));
app.use("/api/receptionists", require("./src/routes/receptionistRoute"));
app.use("/api/appointments", require("./src/routes/appointmentRoute"));
app.use("/api/chats", require("./src/routes/chatRoute"));
app.use("/api/faqs", require("./src/routes/faqRoute"));
app.use("/api/chat-sessions", require("./src/routes/sessionRoute"));
app.use("/api/web", require("./src/routes/websiteRoute"));
app.use("/api/jobs", require("./src/routes/jobRoute"));
app.use("/api/stats", require("./src/routes/statsRoute"));

module.exports = app;
