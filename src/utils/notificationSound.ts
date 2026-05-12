// import { Howl } from "howler";

// let sound: Howl | null = null;

// export const initNotificationSound = () => {
//   sound = new Howl({
//     src: ["/src/assets/audio/notification.mp3"], // ✅ Updated path
//     volume: 0.7,
//     html5: true,
//   });

//   // 🔥 FORCE UNLOCK AUDIO (CRITICAL)
//   sound.once("load", () => {
//     sound?.play(); // play once silently
//     sound?.pause(); // immediately pause
//     sound!.seek(0); // reset
//   });
// };

// export const playNotificationSound = () => {
//   if (!sound) {
//     console.log("Sound not initialized");
//     return;
//   }

//   sound.play();
// };

import { Howl } from "howler";
import notificationMp3 from "@/assets/audio/notification.mp3";
// OR relative path:
// import notificationMp3 from "../assets/audio/notification.mp3";

let sound: Howl | null = null;

export const initNotificationSound = () => {
  sound = new Howl({
    src: [notificationMp3],
    volume: 0.7,
    html5: true,
  });

  sound.once("load", () => {
    sound?.play();
    sound?.pause();
    sound?.seek(0);
  });
};

export const playNotificationSound = () => {
  if (!sound) {
    console.log("Sound not initialized");
    return;
  }

  sound.play();
};