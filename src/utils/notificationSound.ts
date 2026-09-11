import { Howl } from "howler";
import notificationMp3 from "@/assets/audio/notification.mp3";

let sound: Howl | null = null;
let lastPlayAt = 0;
const SOUND_COOLDOWN_MS = 900;

export const initNotificationSound = () => {
  if (sound) return;
  try {
    sound = new Howl({
      src: [notificationMp3],
      volume: 0.8,
      html5: true,
    });
  } catch (err) {
    console.warn("Audio init warning:", err);
  }
};

export const playNotificationSound = () => {
  const now = Date.now();
  if (now - lastPlayAt < SOUND_COOLDOWN_MS) {
    return;
  }
  lastPlayAt = now;

  try {
    if (!sound) {
      sound = new Howl({
        src: [notificationMp3],
        volume: 0.8,
        html5: true,
      });
    }
    sound.play();
  } catch (err) {
    try {
      const audio = new Audio(notificationMp3);
      audio.volume = 0.8;
      audio.play().catch(() => {});
    } catch {
      // Ignored if browser restricts autoplay
    }
  }
};