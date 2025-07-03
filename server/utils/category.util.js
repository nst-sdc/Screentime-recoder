const categories = {
  "Social Media": ["facebook.com", "instagram.com", "twitter.com"],
  Work: ["slack.com", "github.com", "outlook.com"],
  Entertainment: ["youtube.com", "netflix.com", "spotify.com"],
  Education: ["khanacademy.org", "coursera.org", "edx.org"],
};

function categorizeDomain(domain) {
  for (const category in categories) {
    if (categories[category].some((d) => domain.includes(d))) {
      return category;
    }
  }
  return "Uncategorized";
}

module.exports = { categorizeDomain };
