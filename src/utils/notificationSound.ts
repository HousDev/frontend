import { Howl } from "howler";
import notificationMp3 from "@/assets/audio/notification.mp3";

let sound: Howl | null = null;

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