import Activity from "../models/Activity.js";

export const deleteOldActivity = async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);

  try {
    const result = await Activity.deleteMany({ createdAt: { $lt: cutoff } });
    console.log(
      `Deleted ${result.deletedCount} activity records older than 90 days.`
    );
  } catch (err) {
    console.error("Error during automatic data cleanup:", err);
  }
};
