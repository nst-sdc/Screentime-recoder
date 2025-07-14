export const getDomainLogs = async () => {
    try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const res = await fetch(`${API_BASE_URL}/domain`);
        if (!res.ok) throw new Error("Failed to fetch logs");
        return await res.json();
    } catch (err) {
        console.error("Error fetching domain logs:", err.message);
        return [];
    }
};
