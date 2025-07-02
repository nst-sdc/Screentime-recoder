import mongoose from "mongoose";

const domainActivitySchema = new mongoose.Schema({
    domain: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number }, // Duration in milliseconds
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional reference to User
});

// Pre-save hook to auto-calculate duration before saving
domainActivitySchema.pre("save", function (next) {
    if (this.startTime && this.endTime) {
        this.duration = this.endTime - this.startTime;
    }
    next();
});

const DomainActivity = mongoose.model("DomainActivity", domainActivitySchema);
export default DomainActivity;
