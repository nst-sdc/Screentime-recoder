export const getDomainLogs = async () => {
    try {
        const res = await fetch("http://localhost:3000/api/domain");
        if (!res.ok) throw new Error("Failed to fetch logs");
        return await res.json();
    } catch (err) {
        console.error("Error fetching domain logs:", err.message);
        return [];
    }
};
