const DEMO_MISSIONS = [
  {
    title: "Waterkant Cleanup",
    description:
      "Join us for a cleanup along the historic Waterkant boulevard. We will be collecting litter, plastic waste, and debris along the waterfront to keep Paramaribo's most iconic street clean.",
    location: "Waterkant, Paramaribo",
    date: "2026-06-15",
    startTime: "07:00",
    endTime: "11:00",
    maxParticipants: 30,
    areas: [
      {
        name: "Waterkant Oost",
        description: "Van Sommelsdijckstraat tot aan de Heiligenweg",
        points: 40,
        maxUsers: 15,
      },
      {
        name: "Waterkant West",
        description: "Van Heiligenweg tot aan de Henck Arronstraat",
        points: 40,
        maxUsers: 15,
      },
    ],
  },
  {
    title: "Saramaccastraat Schoonmaak",
    description:
      "De Saramaccastraat is een drukke winkelstraat in het hart van Paramaribo. Help ons om zwerfafval op te ruimen en het gebied schoon te houden voor bezoekers en bewoners.",
    location: "Saramaccastraat, Paramaribo",
    date: "2026-06-20",
    startTime: "06:30",
    endTime: "10:00",
    maxParticipants: 20,
    areas: [
      {
        name: "Noord sectie",
        description: "Vanaf de Henck Arronstraat",
        points: 30,
        maxUsers: 10,
      },
      {
        name: "Zuid sectie",
        description: "Richting de Maagdenstraat",
        points: 30,
        maxUsers: 10,
      },
    ],
  },
  {
    title: "Onafhankelijkheidsplein Herstel",
    description:
      "Het Onafhankelijkheidsplein is het hart van Paramaribo. We gaan samen het plein opruimen, bankjes schoonmaken en groenstroken van afval ontdoen.",
    location: "Onafhankelijkheidsplein, Paramaribo",
    date: "2026-07-01",
    startTime: "07:00",
    endTime: "12:00",
    maxParticipants: 50,
    areas: [
      {
        name: "Centraal plein",
        description: "Rondom het podium en de fontein",
        points: 50,
        maxUsers: 20,
      },
      {
        name: "Oost kant",
        description: "Groenstrook langs het Presidentieel Paleis",
        points: 35,
        maxUsers: 15,
      },
      {
        name: "West kant",
        description: "Groenstrook langs het Nationaal Leger",
        points: 35,
        maxUsers: 15,
      },
    ],
  },
  {
    title: "Commewijne Rivier Oever",
    description:
      "Een buitenmissie langs de oevers van de Commewijne rivier. We zamelen plastic en ander afval in dat anders in het water terechtkomt.",
    location: "Commewijne, Suriname",
    date: "2026-07-10",
    startTime: "06:00",
    endTime: "11:00",
    maxParticipants: null,
    areas: [
      {
        name: "Noordelijke oever",
        description: "Strook van 500m langs de rivier",
        points: 60,
        maxUsers: null,
      },
      {
        name: "Zuidelijke oever",
        description: "Strook van 500m richting de monding",
        points: 60,
        maxUsers: null,
      },
    ],
  },
  {
    title: "Rainville Buurt Actie",
    description:
      "Een buurtgerichte schoonmaakactie in de wijk Rainville. Bewoners en vrijwilligers werken samen om straten, stoepen en gemeenschappelijke ruimtes schoon te houden.",
    location: "Rainville, Paramaribo",
    date: "2026-07-18",
    startTime: "07:30",
    endTime: "10:30",
    maxParticipants: 25,
    areas: [
      {
        name: "Hoofdstraat",
        description: "Centrale straat door de wijk",
        points: 25,
        maxUsers: 12,
      },
      {
        name: "Zijstraten",
        description: "Alle zijstraten en steegjes",
        points: 25,
        maxUsers: 13,
      },
    ],
  },
];

function getRandomDemoMission() {
  return DEMO_MISSIONS[Math.floor(Math.random() * DEMO_MISSIONS.length)];
}
