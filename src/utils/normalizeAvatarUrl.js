export function normalizeAvatarUrl(url) {
  if (typeof url !== "string" || !url) {
    return url;
  }

  if (!url.includes("?")) {
    return url;
  }

  const query = url.split("?")[1] || "";
  const isSigned = /X-Amz-|AWSAccessKeyId|Signature|Expires/i.test(query);

  if (!isSigned) {
    return url;
  }

  return url.split("?")[0];
}
