const permissionList = [
    // Admin permissions
    { name: "manage_users", group: "admin" },    // Can manage users
    { name: "manage_system", group: "admin" },   // Can manage system settings
    { name: "view_reports", group: "admin" },    // Can view system reports
    { name: "assign_roles", group: "admin" },    // Can assign roles to users
    { name: "view_logs", group: "admin" },       // Can view system logs
    { name: "access_analytics", group: "admin" }, // Can access detailed analytics

    // Doctor permissions
    { name: "view_patient_records", group: "doctor" },    // Can view patient records
    { name: "edit_patient_records", group: "doctor" },    // Can edit patient records
    { name: "prescribe_medication", group: "doctor" },    // Can prescribe medication
    { name: "schedule_appointments", group: "doctor" },    // Can schedule patient appointments

    // Nurse permissions
    { name: "view_patient_records", group: "nurse" },     // Can view patient records
    { name: "administer_medication", group: "nurse" },     // Can administer medication
    { name: "assist_in_surgeries", group: "nurse" },       // Can assist in surgeries
    { name: "monitor_vitals", group: "nurse" },            // Can monitor patient vitals

    // Receptionist permissions
    { name: "schedule_appointments", group: "receptionist" }, // Can schedule appointments
    { name: "check_in_patients", group: "receptionist" },    // Can check-in patients
    { name: "manage_invoices", group: "receptionist" },      // Can manage patient invoices
    { name: "view_patient_info", group: "receptionist" },    // Can view basic patient information

    // Patient permissions
    { name: "view_own_records", group: "patient" },      // Can view their own medical records
    { name: "book_appointments", group: "patient" },      // Can book appointments
    { name: "request_prescriptions", group: "patient" },  // Can request prescriptions
    { name: "view_medical_history", group: "patient" },   // Can view their medical history
];

module.exports = permissionList;
