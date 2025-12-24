const User = require('../models/userSchema');
const Appointment = require('../models/appointmentSchema');
const Admission = require('../models/admissionSchema');
const Report = require('../models/reportSchema');
const Task = require('../models/taskSchema');

const getDayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

const getAdminStats = async (req, res) => {
    try {
        const { start, end } = getDayRange();

        // Basic Stats
        const totalPatients = await User.countDocuments({ 'role.name': 'patient' });
        const totalDoctors = await User.countDocuments({ 'role.name': 'doctor' });
        const totalNurses = await User.countDocuments({ 'role.name': 'nurse' });

        const todayAppointments = await Appointment.countDocuments({
            date: { $gte: start, $lte: end }
        });

        const activeAdmissions = await Admission.countDocuments({ status: 'Admitted' });

        // --- Chart Data Calculation ---

        // 1. Appointments per Day (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const appointmentsData = await Appointment.aggregate([
            {
                $match: {
                    date: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: "$date" }, // 1 (Sun) - 7 (Sat)
                    count: { $sum: 1 }
                }
            }
        ]);

        const daysMap = { 2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat', 1: 'Sun' };
        const appointmentCounts = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };

        appointmentsData.forEach(item => {
            const dayName = daysMap[item._id];
            if (dayName) appointmentCounts[dayName] = item.count;
        });


        // 2. Patient Flow (Last 7 Months)
        const sevenMonthsAgo = new Date();
        sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);
        sevenMonthsAgo.setDate(1);
        sevenMonthsAgo.setHours(0, 0, 0, 0);

        // New Patients (User creation)
        const newPatientsData = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenMonthsAgo },
                    'role.name': 'patient'
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const dischargedData = await Admission.aggregate([
            {
                $match: {
                    dischargeDate: { $gte: sevenMonthsAgo },
                    status: 'Discharged'
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$dischargeDate" },
                        year: { $year: "$dischargeDate" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const flowStats = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthIdx = d.getMonth();
            const year = d.getFullYear();
            const label = months[monthIdx];

            const newPatientCount = newPatientsData.find(x => x._id.month === (monthIdx + 1) && x._id.year === year)?.count || 0;
            const dischargedCount = dischargedData.find(x => x._id.month === (monthIdx + 1) && x._id.year === year)?.count || 0;

            flowStats.push({
                month: label,
                newPatients: newPatientCount,
                discharged: dischargedCount
            });
        }


        res.status(200).json({
            success: true,
            data: {
                patients: totalPatients,
                medicalStaff: totalDoctors + totalNurses,
                appointments: todayAppointments,
                admissions: activeAdmissions,
                charts: {
                    appointments: appointmentCounts, 
                    patientFlow: flowStats 
                }
            }
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getDoctorStats = async (req, res) => {
    try {
        const { start, end } = getDayRange();
        const doctorId = req.user._id;

        const totalPatients = await User.countDocuments({ 'role.name': 'patient' });

        const appointmentsToday = await Appointment.countDocuments({
            doctor: doctorId,
            date: { $gte: start, $lte: end }
        });

        const pendingReports = await Report.countDocuments({
            doctor: doctorId,
            status: 'Pending Review'
        });

        res.status(200).json({
            success: true,
            data: {
                totalPatients: totalPatients,
                appointmentsToday: appointmentsToday,
                pendingReports: pendingReports,
                avgWaitTime: "12m"
            }
        });
    } catch (error) {
        console.error("Error fetching doctor stats:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getReceptionistStats = async (req, res) => {
    try {
        const { start, end } = getDayRange();

        const totalDoctors = await User.countDocuments({ 'role.name': 'doctor' });

        const newRegistrations = await User.countDocuments({
            createdAt: { $gte: start, $lte: end },
            'role.name': 'patient'
        });

        const todayAppointments = await Appointment.countDocuments({
            date: { $gte: start, $lte: end }
        });

        res.status(200).json({
            success: true,
            data: {
                newRegistrations: newRegistrations,
                todayAppointments: todayAppointments,
                callsInQueue: 2,
                doctorAvailability: `${totalDoctors} active`
            }
        });
    } catch (error) {
        console.error("Error fetching receptionist stats:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getNurseStats = async (req, res) => {
    try {
        const admittedPatients = await Admission.countDocuments({ status: 'Admitted' });

        const pendingTasks = await Task.countDocuments({
            assignedTo: req.user._id,
            isCompleted: false
        });

        res.status(200).json({
            success: true,
            data: {
                assignedPatients: admittedPatients,
                pendingTasks: pendingTasks,
                wardOccupancy: "85%",
                notifications: 3
            }
        });
    } catch (error) {
        console.error("Error fetching nurse stats:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getAdminStats,
    getDoctorStats,
    getReceptionistStats,
    getNurseStats
};
