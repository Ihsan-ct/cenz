export interface RobloxUploadResult {
  assetId: string;
  moderationState?: string;
}

export async function uploadAudioToRoblox(
  apiKey: string,
  userId: string,
  audioBuffer: Buffer,
  fileName: string
): Promise<RobloxUploadResult> {
  const ab = audioBuffer.buffer.slice(
    audioBuffer.byteOffset,
    audioBuffer.byteOffset + audioBuffer.byteLength
  ) as ArrayBuffer;

  const form = new FormData();
  form.append('file', new Blob([ab], { type: 'audio/mpeg' }), fileName);
  form.append('assetType', 'Audio');
  form.append('displayName', fileName.replace(/\.mp3$/i, ''));
  form.append('description', 'Uploaded via cenz-clone');

  const res = await fetch('https://apis.roblox.com/assets/v1/assets', {
    method: 'POST',
    headers: { 'x-api-key': apiKey },
    body: form,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Roblox upload failed: ${res.status} ${txt}`);
  }
  const data: any = await res.json();
  return {
    assetId: data.path?.split('/').pop() || data.assetId,
    moderationState: data.moderationState,
  };
}

export async function getRobloxUser(apiKey: string, userId: string) {
  const res = await fetch(`https://apis.roblox.com/cloud/v2/users/${userId}`, {
    headers: { 'x-api-key': apiKey },
  });
  if (!res.ok) return null;
  return res.json();
}
