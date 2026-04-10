const imagesData = [
  {
    id: 1,
    alt: "Mountain landscape with lake",
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    photographer: "Tobias Bjørkli",
    source: "Unsplash",
  },
  {
    id: 2,
    alt: "City skyline at night",
    url: "https://images.unsplash.com/photo-1494526585095-c41746248156",
    photographer: "Sean Pollock",
    source: "Unsplash",
  },
  {
    id: 3,
    alt: "Forest with sunlight rays",
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    photographer: "Simon Berger",
    source: "Unsplash",
  },
  {
    id: 4,
    alt: "Beach during sunset",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    photographer: "Jeremy Bishop",
    source: "Unsplash",
  },
  {
    id: 5,
    alt: "Minimal workspace desk setup",
    url: "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
    photographer: "Bench Accounting",
    source: "Unsplash",
  },
  {
    id: 6,
    alt: "Coffee cup on wooden table",
    url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    photographer: "Nathan Dumlao",
    source: "Unsplash",
  },
  {
    id: 7,
    alt: "Snow covered mountains",
    url: "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66",
    photographer: "Eberhard Grossgasteiger",
    source: "Unsplash",
  },
  {
    id: 8,
    alt: "Road through desert landscape",
    url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
    photographer: "Jake Blucker",
    source: "Unsplash",
  },
  {
    id: 9,
    alt: "Laptop coding workspace",
    url: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f",
    photographer: "Clément H",
    source: "Unsplash",
  },
  {
    id: 10,
    alt: "Aerial view of ocean waves",
    url: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21",
    photographer: "Matt Hardy",
    source: "Unsplash",
  },
];

export interface Album {
  id: string;
  title: string;
  coverImage: string;
  photoCount: number;
}

export const albums: Album[] = [
  {
    id: "1",
    title: "Tokyo Neon",
    coverImage:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
    photoCount: 18,
  },
  {
    id: "2",
    title: "Minimalist Architecture",
    coverImage:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    photoCount: 12,
  },
  {
    id: "3",
    title: "Moody Landscapes",
    coverImage:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=800&q=80",
    photoCount: 24,
  },
];
