const Appointment = require('../models/appointmentSchema');
const User = require('../models/userSchema');
const Doctor = require('../models/doctorSchema');
const Patient = require('../models/patientSchema');

// Create appointment (Patient or Receptionist)
const createAppointment = async (req, res) => {
    try {
        const { doctorId, patientId, date, type, notes } = req.body;

        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ message: "Doctor not found" });
        }

        const finalPatientId = req.user.role === 'patient' ? req.user.userId : patientId;

        if (!finalPatientId) {
            return res.status(400).json({ message: "Patient ID is required" });
        }

        const appointment = new Appointment({
            patient: finalPatientId,
            doctor: doctorId,
            date: new Date(date),
            type: type || 'Consultation',
            notes: notes || '',
            status: 'Pending'
        });

        await appointment.save();

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('patient', 'name email')
            .populate('doctor', 'name email');

        res.status(201).json({
            message: "Appointment created successfully",
            appointment: populatedAppointment
        });
    } catch (error) {
        console.error("Error creating appointment:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all appointments (Admin/Receptionist)
const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patient', 'name email phone')
            .populate('doctor', 'name email')
            .sort({ date: -1 });

        res.status(200).json({ appointments });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get appointments for a specific doctor
const getDoctorAppointments = async (req, res) => {
    try {
        const doctorUserId = req.user.userId;

        const appointments = await Appointment.find({ doctor: doctorUserId })
            .populate('patient', 'name email phone')
            .sort({ date: -1 });

        res.status(200).json({ appointments });
    } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get appointments for a specific patient
const getPatientAppointments = async (req, res) => {
    try {
        const patientUserId = req.user.userId;

        const appointments = await Appointment.find({ patient: patientUserId })
            .populate('doctor', 'name email')
            .sort({ date: -1 });

        const appointmentsWithDetails = await Promise.all(
            appointments.map(async (apt) => {
                const doctorProfile = await Doctor.findOne({ userId: apt.doctor._id });
                return {
                    ...apt.toObject(),
                    doctorDetails: {
                        name: apt.doctor.name,
                        email: apt.doctor.email,
                        specialization: doctorProfile?.specialization || 'General',
                        department: doctorProfile?.department || 'General Medicine'
                    }
                };
            })
        );

        res.status(200).json({ appointments: appointmentsWithDetails });
    } catch (error) {
        console.error("Error fetching patient appointments:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('patient', 'name email').populate('doctor', 'name email');

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.status(200).json({
            message: "Appointment status updated",
            appointment
        });
    } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Cancel appointment (Patient can cancel their own)
const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (req.user.role === 'patient' && appointment.patient.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized to cancel this appointment" });
        }

        appointment.status = 'Cancelled';
        await appointment.save();

        res.status(200).json({
            message: "Appointment cancelled successfully",
            appointment
        });
    } catch (error) {
        console.error("Error cancelling appointment:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete appointment (Admin only)
const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByIdAndDelete(id);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.status(200).json({ message: "Appointment deleted successfully" });
    } catch (error) {
        console.error("Error deleting appointment:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createAppointment,
    getAllAppointments,
    getDoctorAppointments,
    getPatientAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    deleteAppointment
};
