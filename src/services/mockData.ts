import type { IPatients, IPatient, IAttendance, IAgenda } from "../types/db";

// export const mockAttendance: Attendance[] = [
//   {
//     date: "2025-07-01",
//     type: "spiritual",
//     patients: [
//       "Maria Silva",
//       "João Souza",
//       "Ana Paula Lima",
//       "Carlos Eduardo Dias",
//       "Beatriz Souza",
//     ],
//   },
//   {
//     date: "2025-07-01",
//     type: "lightBath",
//     patients: [
//       "Maria Silva",
//       "Beatriz Souza",
//       "Fernanda Alves",
//       "Larissa Oliveira",
//     ],
//   },
//   {
//     date: "2025-07-08",
//     type: "spiritual",
//     patients: [
//       "Juliana Mendes",
//       "Kleber Nunes",
//       "Larissa Oliveira",
//       "Marcos Vinícius",
//     ],
//   },
//   {
//     date: "2025-07-08",
//     type: "lightBath",
//     patients: [
//       "Ana Paula Lima",
//       "Gabriel Martins",
//       "Helena Costa",
//     ],
//   },
// ];

export const mockPatients: IPatients[] = [
  { name: "Maria Silva", id: "1", phone: "(11) 91234-5678", priority: "N", status: "T" },
  { name: "João Souza", id: "2", phone: "(11) 99876-5432", priority: "I", status: "A" },
  { name: "Ana Paula Lima", id: "3", phone: "(11) 91111-2222", priority: "E", status: "N" },
  { name: "Carlos Eduardo Dias", id: "4", phone: "(11) 92222-3333", priority: "I", status: "A" },
  { name: "Beatriz Souza", id: "5", phone: "(11) 93333-4444", priority: "N", status: "T" },
  { name: "Fernanda Alves", id: "6", phone: "(11) 94444-5555", priority: "E", status: "A" },
  { name: "Larissa Oliveira", id: "7", phone: "(11) 95555-6666", priority: "N", status: "N" },
  { name: "Otávio Pires", id: "8", phone: "(11) 96666-7777", priority: "I", status: "T" },
  { name: "Sabrina Lopes", id: "9", phone: "(11) 97777-8888", priority: "E", status: "A" },
  { name: "Vitor Hugo", id: "10", phone: "(11) 98888-9999", priority: "N", status: "F" },
  { name: "Wesley Cardoso", id: "11", phone: "(11) 90000-1111", priority: "I", status: "A" },
  { name: "Juliana Mendes", id: "12", phone: "(11) 91111-2223", priority: "E", status: "T" },
  { name: "Kleber Nunes", id: "13", phone: "(11) 92222-3334", priority: "N", status: "A" },
  { name: "Marcos Vinícius", id: "14", phone: "(11) 93333-4445", priority: "I", status: "N" },
  { name: "Natália Rocha", id: "15", phone: "(11) 94444-5556", priority: "E", status: "A" },
  { name: "Patrícia Silva", id: "16", phone: "(11) 95555-6667", priority: "N", status: "T" },
  { name: "Rafael Teixeira", id: "17", phone: "(11) 96666-7778", priority: "I", status: "A" },
  { name: "Tiago Moreira", id: "18", phone: "(11) 97777-8889", priority: "E", status: "F" },
  { name: "Ursula Barros", id: "19", phone: "(11) 98888-9990", priority: "N", status: "A" },
  { name: "Xuxa Meneghel", id: "20", phone: "(11) 90000-1112", priority: "I", status: "T" },
  { name: "Daniela Castro", id: "21", phone: "(11) 91111-2224", priority: "E", status: "A" },
  { name: "Eduardo Ramos", id: "22", phone: "(11) 92222-3335", priority: "N", status: "N" },
  { name: "Gabriel Martins", id: "23", phone: "(11) 93333-4446", priority: "I", status: "A" },
  { name: "Helena Costa", id: "24", phone: "(11) 94444-5557", priority: "E", status: "T" },
  { name: "Igor Ferreira", id: "25", phone: "(11) 95555-6668", priority: "N", status: "A" },
  { name: "Juliana Costa", id: "26", phone: "(11) 96666-7779", priority: "I", status: "F" },
  { name: "Gustavo Lima", id: "27", phone: "(11) 97777-8890", priority: "E", status: "A" },
  { name: "Marcos Paulo", id: "28", phone: "(11) 98888-9991", priority: "N", status: "T" },
];

export const mockAttendance: IAttendance[] = [
  {
    date: new Date("2025-08-07"),
    spiritual: {
      scheduled: [
        { name: "Maria Silva", priority: "N" },
        { name: "João Souza", priority: "I" },
        { name: "Ana Paula Lima", priority: "E" },
      ],
      checkedIn: [
        { name: "Carlos Eduardo Dias", priority: "I", time: new Date("2025-08-07T08:00:00") },
      ],
      onGoing: [
        { name: "Beatriz Souza", priority: "N", time: new Date("2025-08-07T08:30:00") },
      ],
      completed: [
        { name: "Fernanda Alves", priority: "E", time: new Date("2025-08-07T09:00:00") },
      ],
    },
    lightBath: {
      scheduled: [
        { name: "Larissa Oliveira", priority: "N" },
        { name: "Otávio Pires", priority: "I" },
      ],
      checkedIn: [
        { name: "Sabrina Lopes", priority: "E", time: new Date("2025-08-07T08:10:00") },
      ],
      onGoing: [
        { name: "Vitor Hugo", priority: "N", time: new Date("2025-08-07T08:40:00") },
      ],
      completed: [
        { name: "Wesley Cardoso", priority: "I", time: new Date("2025-08-07T09:10:00") },
      ],
    },
  },
  {
    date: new Date("2025-08-14"),
    spiritual: {
      scheduled: [
        { name: "Juliana Mendes", priority: "E" },
        { name: "Kleber Nunes", priority: "N" },
      ],
      checkedIn: [
        { name: "Marcos Vinícius", priority: "I", time: new Date("2025-08-14T08:00:00") },
      ],
      onGoing: [
        { name: "Natália Rocha", priority: "E", time: new Date("2025-08-14T08:30:00") },
      ],
      completed: [
        { name: "Patrícia Silva", priority: "N", time: new Date("2025-08-14T09:00:00") },
      ],
    },
    lightBath: {
      scheduled: [
        { name: "Rafael Teixeira", priority: "I" },
        { name: "Tiago Moreira", priority: "E" },
      ],
      checkedIn: [
        { name: "Ursula Barros", priority: "N", time: new Date("2025-08-14T08:10:00") },
      ],
      onGoing: [
        { name: "Xuxa Meneghel", priority: "I", time: new Date("2025-08-14T08:40:00") },
      ],
      completed: [
        { name: "Daniela Castro", priority: "E", time: new Date("2025-08-14T09:10:00") },
      ],
    },
  },
  {
    date: new Date("2025-08-21"),
    spiritual: {
      scheduled: [
        { name: "Eduardo Ramos", priority: "N" },
        { name: "Gabriel Martins", priority: "I" },
      ],
      checkedIn: [
        { name: "Helena Costa", priority: "E", time: new Date("2025-08-21T08:00:00") },
      ],
      onGoing: [
        { name: "Igor Ferreira", priority: "N", time: new Date("2025-08-21T08:30:00") },
      ],
      completed: [
        { name: "Juliana Mendes", priority: "E", time: new Date("2025-08-21T09:00:00") },
      ],
    },
    lightBath: {
      scheduled: [
        { name: "Kleber Nunes", priority: "N" },
        { name: "Marcos Vinícius", priority: "I" },
      ],
      checkedIn: [
        { name: "Natália Rocha", priority: "E", time: new Date("2025-08-21T08:10:00") },
      ],
      onGoing: [
        { name: "Patrícia Silva", priority: "N", time: new Date("2025-08-21T08:40:00") },
      ],
      completed: [
        { name: "Rafael Teixeira", priority: "I", time: new Date("2025-08-21T09:10:00") },
      ],
    },
  },
];

export const mockAgenda: IAgenda = {
  spiritual: [{
    date: new Date("2025-08-07"),
    patients: [
      { id: "1", name: "Maria Silva", priority: "N" },
      { id: "3", name: "Ana Paula Lima", priority: "E" },
      { id: "5", name: "Beatriz Souza", priority: "N" },
      { id: "7", name: "Larissa Oliveira", priority: "N" },
      { id: "11", name: "Wesley Cardoso", priority: "I" },
      { id: "13", name: "Kleber Nunes", priority: "N" },
      { id: "15", name: "Natália Rocha", priority: "E" },
      { id: "19", name: "Ursula Barros", priority: "N" },
    ],
  },
  {
    date: new Date("2025-08-14"),
    patients: [
      { id: "1", name: "Maria Silva", priority: "N" },
      { id: "2", name: "João Souza", priority: "I" },
      { id: "4", name: "Carlos Eduardo Dias", priority: "I" },
      { id: "5", name: "Beatriz Souza", priority: "N" },
      { id: "6", name: "Fernanda Alves", priority: "E" },
      { id: "8", name: "Otávio Pires", priority: "I" },
      { id: "9", name: "Sabrina Lopes", priority: "E" },
      { id: "10", name: "Vitor Hugo", priority: "N" },
    ]
  },
  {
    date: new Date("2025-08-21"),
    patients: [
      { id: "11", name: "Fernanda Lima", priority: "I" },
      { id: "13", name: "Juliana Costa", priority: "E" },
      { id: "15", name: "Marcos Paulo", priority: "N" },
      { id: "17", name: "Gustavo Lima", priority: "E" },
      { id: "19", name: "Patrícia Silva", priority: "I" },
    ],
  }],
  lightBath: [{
    date: new Date("2025-08-07"),
    patients: [
      { id: "2", name: "João Souza", priority: "I" },
      { id: "4", name: "Carlos Eduardo Dias", priority: "I" },
      { id: "6", name: "Fernanda Alves", priority: "E" },
      { id: "8", name: "Otávio Pires", priority: "I" },
      { id: "10", name: "Vitor Hugo", priority: "N" },
      { id: "12", name: "Juliana Mendes", priority: "E" },
    ],
  },
  {
    date: new Date("2025-08-14"),
    patients: [
      { id: "2", name: "João Souza", priority: "I" },
      { id: "3", name: "Ana Paula Lima", priority: "E" },
      { id: "5", name: "Beatriz Souza", priority: "N" },
      { id: "7", name: "Larissa Oliveira", priority: "N" },
      { id: "9", name: "Sabrina Lopes", priority: "E" },
      { id: "11", name: "Wesley Cardoso", priority: "I" },
      { id: "13", name: "Kleber Nunes", priority: "N" },
      { id: "15", name: "Natália Rocha", priority: "E" },
    ],
  },
  {
    date: new Date("2025-08-21"),
    patients: [
      { id: "12", name: "Juliana Mendes", priority: "E" },
      { id: "14", name: "Marcos Vinícius", priority: "I" },
      { id: "16", name: "Patrícia Silva", priority: "N" },
      { id: "17", name: "Rafael Teixeira", priority: "I" },
      { id: "18", name: "Tiago Moreira", priority: "E" },
    ],
  }],
};

export const mockPatient_1: IPatient = {
  id: "1",
  name: "Maria Silva",
  phone: "(11) 91234-5678",
  priority: "N",
  status: "T",
  birthDate: new Date("1980-05-10"),
  mainComplaint: "Dor de cabeça",
  startDate: new Date("2024-06-01"),
  dischargeDate: new Date("2024-06-15"),
  nextAttendanceDates: [
    { date: new Date("2025-08-07"), type: "spiritual" },
  ],
  currentRecommendations: {
    date: new Date("2025-07-08"),
    food: "Frutas",
    water: "Água",
    ointment: "Pomada X",
    lightBath: true,
    rod: false,
    spiritualTreatment: true,
    returnWeeks: 2,
  },
  previousAttendances: [
    {
      attendanceId: "1",
      date: new Date("2025-07-08"),
      notes: "Atendimento anterior.",
      type: "spiritual",
      recommendations: {
        food: "Frutas",
        water: "Água",
        ointment: "Pomada X",
        lightBath: true,
        rod: false,
        spiritualTreatment: true,
        returnWeeks: 2,
      },
    },
    {
      attendanceId: "1",
      date: new Date("2025-07-24"),
      notes: "Atendimento anterior.",
      type: "spiritual",
      recommendations: {
        food: "Frutas",
        water: "Água",
        ointment: "Pomada X",
        lightBath: true,
        rod: false,
        spiritualTreatment: true,
        returnWeeks: 2,
      },
    },
    {
      attendanceId: "5",
      date: new Date("2025-07-10"),
      notes: "Atendimento anterior.",
      type: "spiritual",
      recommendations: {
        food: "Frutas",
        water: "Água",
        ointment: "Pomada X",
        lightBath: true,
        rod: false,
        spiritualTreatment: true,
        returnWeeks: 2,
      },
    },
  ],
};

export const mockPatient_2: IPatient = {
  id: "2",
  name: "João Souza",
  phone: "(11) 99876-5432",
  priority: "I",
  status: "A",
  birthDate: new Date("1975-03-22"),
  mainComplaint: "Dores nas costas",
  startDate: new Date("2024-05-10"),
  dischargeDate: new Date("2024-06-20"),
  nextAttendanceDates: [
    { date: new Date("2025-08-07"), type: "lightBath" },
  ],
  currentRecommendations: {
    date: new Date("2025-07-10"),
    food: "Legumes",
    water: "Água",
    ointment: "Pomada Y",
    lightBath: true,
    rod: true,
    spiritualTreatment: false,
    returnWeeks: 3,
  },
  previousAttendances: [
    {
      attendanceId: "2",
      date: new Date("2025-07-10"),
      notes: "Atendimento anterior.",
      type: "lightBath",
      recommendations: {
        food: "Legumes",
        water: "Água",
        ointment: "Pomada Y",
        lightBath: true,
        rod: true,
        spiritualTreatment: false,
        returnWeeks: 3,
      },
    },
    {
      attendanceId: "2",
      date: new Date("2025-07-24"),
      notes: "Atendimento anterior.",
      type: "lightBath",
      recommendations: {
        food: "Legumes",
        water: "Água",
        ointment: "Pomada Y",
        lightBath: true,
        rod: true,
        spiritualTreatment: false,
        returnWeeks: 3,
      },
    },
  ],
};

export const mockPatient_3: IPatient = {
  id: "3",
  name: "Ana Paula Lima",
  phone: "(11) 91111-2222",
  priority: "E",
  status: "N",
  birthDate: new Date("1990-08-15"),
  mainComplaint: "Ansiedade",
  startDate: new Date("2025-06-01"),
  dischargeDate: null,
  nextAttendanceDates: [
    { date: new Date("2025-08-07"), type: "spiritual" },
  ],
  currentRecommendations: {
    date: new Date("2025-07-10"),
    food: "Frutas",
    water: "Água",
    ointment: "Pomada X",
    lightBath: true,
    rod: false,
    spiritualTreatment: true,
    returnWeeks: 2,
  },
  previousAttendances: [
    {
      attendanceId: "3",
      date: new Date("2025-07-10"),
      notes: "Atendimento anterior.",
      type: "spiritual",
      recommendations: {
        food: "Frutas",
        water: "Água",
        ointment: "Pomada X",
        lightBath: true,
        rod: false,
        spiritualTreatment: true,
        returnWeeks: 2,
      },
    },
    {
      attendanceId: "3",
      date: new Date("2025-07-31"),
      notes: "Atendimento anterior.",
      type: "spiritual",
      recommendations: {
        food: "Frutas",
        water: "Água",
        ointment: "Pomada X",
        lightBath: true,
        rod: false,
        spiritualTreatment: true,
        returnWeeks: 2,
      },
    },
  ],
};

export const mockPatient_4: IPatient = {
  id: "4",
  name: "Carlos Eduardo Dias",
  phone: "(11) 92222-3333",
  priority: "I",
  status: "A",
  birthDate: new Date("1982-12-03"),
  mainComplaint: "Insônia",
  startDate: new Date("2025-05-20"),
  dischargeDate: new Date("2025-07-01"),
  nextAttendanceDates: [
    { date: new Date("2025-08-07"), type: "lightBath" },
  ],
  currentRecommendations: {
    date: new Date("2025-07-10"),
    food: "Legumes",
    water: "Água",
    ointment: "Pomada Y",
    lightBath: true,
    rod: true,
    spiritualTreatment: false,
    returnWeeks: 3,
  },
  previousAttendances: [
    {
      attendanceId: "4",
      date: new Date("2025-07-10"),
      notes: "Atendimento anterior.",
      type: "lightBath",
      recommendations: {
        food: "Legumes",
        water: "Água",
        ointment: "Pomada Y",
        lightBath: true,
        rod: true,
        spiritualTreatment: false,
        returnWeeks: 3,
      },
    },
    {
      attendanceId: "4",
      date: new Date("2025-07-31"),
      notes: "Atendimento anterior.",
      type: "lightBath",
      recommendations: {
        food: "Legumes",
        water: "Água",
        ointment: "Pomada Y",
        lightBath: true,
        rod: true,
        spiritualTreatment: false,
        returnWeeks: 3,
      },
    },
  ],
};

export const mockPatient_5: IPatient = {
  id: "5",
  name: "Beatriz Souza",
  phone: "(11) 93333-4444",
  priority: "N",
  status: "T",
  birthDate: new Date("1995-11-21"),
  mainComplaint: "Estresse",
  startDate: new Date("2025-06-10"),
  dischargeDate: null,
  nextAttendanceDates: [
    { date: new Date("2025-08-07"), type: "spiritual" },
  ],
  currentRecommendations: {
    date: new Date("2025-07-17"),
    food: "Frutas",
    water: "Água",
    ointment: "Pomada X",
    lightBath: true,
    rod: false,
    spiritualTreatment: true,
    returnWeeks: 2,
  },
  previousAttendances: [
    {
      attendanceId: "5",
      date: new Date("2025-07-17"),
      notes: "Atendimento anterior.",
      type: "spiritual",
      recommendations: {
        food: "Frutas",
        water: "Água",
        ointment: "Pomada X",
        lightBath: true,
        rod: false,
        spiritualTreatment: true,
        returnWeeks: 2,
      },
    },
    {
      attendanceId: "5",
      date: new Date("2025-07-10"),
      notes: "Atendimento anterior.",
      type: "spiritual",
      recommendations: {
        food: "Frutas",
        water: "Água",
        ointment: "Pomada X",
        lightBath: true,
        rod: false,
        spiritualTreatment: true,
        returnWeeks: 2,
      },
    },
  ],
};
