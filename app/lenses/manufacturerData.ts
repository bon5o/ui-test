export type ManufacturerGroup = {
  region: string;
  manufacturers: string[];
};

export const manufacturerData: {
  popular: string[];
  regions: ManufacturerGroup[];
} = {
  popular: [
    "Canon",
    "Nikon",
    "Carl Zeiss",
    "Leica",
  ],
  regions: [
    {
      region: "ドイツ・オーストリア圏",
      manufacturers: [
        "Voigtländer & Sohn",
        "Carl Zeiss",
      ],
    },
    {
      region: "フランス",
      manufacturers: [
        "Charles Chevalier",
        "Lerebours",
      ],
    },
    {
      region: "日本",
      manufacturers: [
        "Canon",
        "Nikon",
        "asahi_pentax",
      ],
    },
  ],
};
