export const extractDomain = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain.startsWith("www.") ? domain.slice(4) : domain;
    } catch {
      return "";
    }
  };
  