const YT = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"]);
const SC = new Set(["soundcloud.com", "www.soundcloud.com", "m.soundcloud.com", "on.soundcloud.com"]);

export function parseSourceUrl(raw: unknown) {
  if (typeof raw !== "string" || raw.length > 500) return null;
  let u: URL;
  try { u = new URL(raw.trim()); } catch { return null; }
  if (u.protocol !== "https:" || u.username || u.password) return null;
  const h = u.hostname.toLowerCase();
  const type = YT.has(h) ? "youtube" : SC.has(h) ? "soundcloud" : null;
  if (!type) return null;
  return { url: u.toString(), type };
}
