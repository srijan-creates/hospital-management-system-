const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

const connectDb = require("./config/connectDb");

connectDb();

app.get("/test", (req, res) => {
  res.send("server is live");
});

app.get("/test", (req, res) => {
  res.send("server is live");
});

app.use("/api/user", require("./routes/userRoute"));
app.use("/api/roles", require("./routes/roleRoute"));
app.use("/api/permissions", require("./routes/permissionRoute"));
app.use("/api/patients", require("./routes/patientRoute"));
app.use("/api/doctors", require("./routes/doctorRoute"));
app.use("/api/nurses", require("./routes/nurseRoute"));
app.use("/api/receptionists", require("./routes/receptionistRoute"));
app.use("/api/appointments", require("./routes/appointmentRoute"));
app.use("/api/chats", require("./routes/chatRoute"));
app.use("/api/faqs", require("./routes/faqRoute"));
app.use("/api/chat-sessions", require("./routes/sessionRoute"));
app.use("/api/web", require("./routes/websiteRoute"));
app.use("/api/jobs", require("./routes/jobRoute"));
app.use("/api/stats", require("./routes/statsRoute"));

module.exports = app;
