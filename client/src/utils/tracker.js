let startTime = null;

export function trackTimeOnDomain(domainName) {
    startTime = new Date();

    return () => {
        const endTime = new Date();
        const timeSpentMs = endTime - startTime;
        const timeSpentSec = Math.floor(timeSpentMs / 1000);

        console.log(`Time spent on ${domainName}: ${timeSpentSec} seconds`);

        fetch("http://localhost:3000/api/domain/track", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                domain: domainName,
                startTime,
                endTime,
                duration: timeSpentSec,
            }),
        }).catch((err) => console.error("Error sending time data:", err));
    };
}
