  const express = require('express');

  const app = express();

  app.use(express.json());

  require("dotenv").config();

  const cors = require("cors");

  app.use(cors());

  const PORT = process.env.PORT;
  const connectDb = require("./config/connectDb");

  const userRoute = require("./routes/userRoute");
  const roleRoute = require("./routes/roleRoute");
  const permissionRoute = require("./routes/permissionRoute");
  const patientRoute = require("./routes/patientRoute");
  const doctorRoute = require("./routes/doctorRoute");
  const nurseRoute = require("./routes/nurseRoute");
  const receptionistRoute = require("./routes/receptionistRoute");
  const appointmentRoute = require("./routes/appointmentRoute");
  const chatRoute = require("./routes/chatRoute");
  const faqRoute = require("./routes/faqRoute");
  const sessionRoute = require("./routes/sessionRoute");

  app.get("/", (req, res) => res.send("server is live"));


  app.use("/api/user", userRoute);
  app.use("/api/roles", roleRoute);
  app.use("/api/permissions", permissionRoute);
  app.use("/api/patients", patientRoute);
  app.use("/api/doctors", doctorRoute);
  app.use("/api/nurses", nurseRoute);
  app.use("/api/receptionists", receptionistRoute);
  app.use("/api/appointments", appointmentRoute);
  app.use("/api/chats", chatRoute);
  app.use("/api/faqs", faqRoute);
  app.use("/api/chat-sessions", sessionRoute);
  app.use("/api/web", require("./routes/websiteRoute"));
  app.use("/api/jobs", require("./routes/jobRoute"));
  app.use("/api/stats", require("./routes/statsRoute"));


  app.listen(PORT, () => {
      console.log(`Server started on ${PORT}`);
      connectDb();
  })