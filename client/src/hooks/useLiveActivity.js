import { useState, useCallback } from "react";
import axios from "axios";

const useLiveActivity = () => {
  const [liveData, setLiveData] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [totalTabs, setTotalTabs] = useState(0);

  const fetchLiveData = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/activity/live", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const entries = res.data.data || [];
      setLiveData(entries);
      setTotalTabs(entries.length);
      const duration = entries.reduce((acc, curr) => acc + curr.duration, 0);
      setTotalDuration(duration);

      console.log("Live data:", entries);
    } catch (err) {
      console.error("Error fetching live activity:", err);
    }
  }, []);

  return { liveData, totalDuration, totalTabs, fetchLiveData };
};

export default useLiveActivity;
