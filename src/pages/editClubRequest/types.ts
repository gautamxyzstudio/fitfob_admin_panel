export const ALL_SERVICES = [
  "Gym",
  "Yoga",
  "Dance",
  "Pilates",
  "Kickboxing",
  "Zumba",
  "Spin",
  "Barre",
  "Aqua Aerobics",
  "Martial Arts",
  "Salsa",
  "Strength Training",
  "CrossFit",
  "Tai Chi",
  "Boxing",
  "HIIT",
  "Ballet",
  "Climbing",
];

export const ALL_FACILITIES = [
  "Bar",
  "Pet-Friendly",
  "24-Hour Reception",
  "Parking",
  "Wi-Fi",
  "AC",
  "Breakfast",
  "Airport Shuttle",
  "Laundry",
  "Restrooms",
  "Pool",
  "Gym",
  "Room",
  "Conference",
  "Spa",
  "Showers",
  "Trainers",
];
export const CLUB_CATEGORIES = ["Luxury", "Premium"];
export type EditClubForm = {
  ownerName: string;
  email: string;
  phoneNumber: string;
  clubCategory: string;
  weekday: string;
  weekend: string;
  services: string[];
  facilities: string[];
};