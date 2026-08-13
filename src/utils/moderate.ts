export type ModerationResult = {
  safe: boolean;
  categories: string[];
  reason: string;
};

export function extractVideoFrame(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    video.addEventListener("loadedmetadata", () => {
      video.currentTime = Math.min(video.duration * 0.3, 5);
    });

    video.addEventListener("seeked", () => {
      try {
        const canvas = document.createElement("canvas");
        const maxDim = 640;
        const scale = Math.min(maxDim / video.videoWidth, maxDim / video.videoHeight, 1);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);

        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];

        URL.revokeObjectURL(url);
        resolve(base64);
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    });

    video.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video"));
    });

    setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error("Video load timeout"));
    }, 10000);
  });
}

export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || '';
};

export async function moderateMedia(file: File, type: "video" | "image"): Promise<ModerationResult> {
  try {
    const base64 = type === "video" ? await extractVideoFrame(file) : await imageToBase64(file);
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/api/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64, type }),
    });
    return await res.json();
  } catch {
    return { safe: true, categories: [], reason: "" };
  }
}

export async function moderateText(text: string): Promise<ModerationResult> {
  try {
    if (!text.trim()) return { safe: true, categories: [], reason: "" };
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/api/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, type: "text" }),
    });
    return await res.json();
  } catch {
    return { safe: true, categories: [], reason: "" };
  }
}