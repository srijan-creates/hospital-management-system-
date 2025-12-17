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


app.use("/api/user", userRoute);
app.use("/api/roles", roleRoute);
app.use("/api/permissions", permissionRoute);
app.use("/api/patients", patientRoute);
app.use("/api/doctors", doctorRoute);
app.use("/api/nurses", nurseRoute);
app.use("/api/receptionists", receptionistRoute);


app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
    connectDb();
})