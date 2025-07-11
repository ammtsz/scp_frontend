-- PostgreSQL schema and mock data for MCP project

-- Table: PATIENT_TABLE
CREATE TABLE patient (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    priority CHAR(1) CHECK (priority IN ('N', 'I', 'E')),
    status CHAR(1) CHECK (
        status IN ('N', 'I', 'A', 'T', 'F')
    ),
    birth_date DATE,
    main_complaint TEXT,
    start_date DATE,
    discharge_date DATE
);

-- Table: ATTENDANCES_TABLE
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patient (id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(20) CHECK (
        type IN ('spiritual', 'lightBath')
    ),
    scheduled TIMESTAMP,
    checkedIn TIMESTAMP,
    onGoing TIMESTAMP,
    completed TIMESTAMP,
    notes TEXT
);

-- Table: PREVIOUS_ATTENDANCE_TABLE
CREATE TABLE previous_attendance (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patient (id) ON DELETE CASCADE,
    attendance_id INTEGER REFERENCES attendance (id) ON DELETE CASCADE,
    date DATE,
    notes TEXT,
    type VARCHAR(20) CHECK (
        type IN ('spiritual', 'lightBath')
    ),
    food VARCHAR(255),
    water VARCHAR(255),
    ointment VARCHAR(255),
    light_bath BOOLEAN,
    rod BOOLEAN,
    spiritual_treatment BOOLEAN,
    return_weeks INTEGER
);

-- Mock data inserts
-- Patients
INSERT INTO
    patient (
        name,
        phone,
        priority,
        status,
        birth_date,
        main_complaint,
        start_date,
        discharge_date
    )
VALUES (
        'Maria Silva',
        '(11) 91234-5678',
        'N',
        'T',
        '1980-05-10',
        'Dor de cabeça',
        '2024-06-01',
        '2024-06-15'
    ),
    (
        'João Souza',
        '(11) 99876-5432',
        'I',
        'A',
        '1975-03-22',
        'Dores nas costas',
        '2024-05-10',
        '2024-06-20'
    ),
    (
        'Ana Paula Lima',
        '(11) 91111-2222',
        'E',
        'N',
        '1990-08-15',
        'Ansiedade',
        '2025-06-01',
        NULL
    ),
    (
        'Carlos Eduardo Dias',
        '(11) 92222-3333',
        'I',
        'A',
        '1982-12-03',
        'Insônia',
        '2025-05-20',
        '2025-07-01'
    ),
    (
        'Beatriz Souza',
        '(11) 93333-4444',
        'N',
        'T',
        '1995-11-21',
        'Estresse',
        '2025-06-10',
        NULL
    ),
    (
        'Fernanda Alves',
        '(11) 94444-5555',
        'E',
        'A',
        '1988-09-12',
        'Fadiga',
        '2025-06-01',
        NULL
    ),
    (
        'Larissa Oliveira',
        '(11) 95555-6666',
        'N',
        'N',
        '1992-04-18',
        'Enxaqueca',
        '2025-06-01',
        NULL
    ),
    (
        'Otávio Pires',
        '(11) 96666-7777',
        'I',
        'T',
        '1978-07-30',
        'Dores musculares',
        '2025-06-01',
        NULL
    ),
    (
        'Sabrina Lopes',
        '(11) 97777-8888',
        'E',
        'A',
        '1985-02-14',
        'Ansiedade',
        '2025-06-01',
        NULL
    ),
    (
        'Vitor Hugo',
        '(11) 98888-9999',
        'N',
        'F',
        '1991-10-25',
        'Estresse',
        '2025-06-01',
        NULL
    ),
    (
        'Wesley Cardoso',
        '(11) 90000-1111',
        'I',
        'A',
        '1983-03-11',
        'Dores nas costas',
        '2025-06-01',
        NULL
    ),
    (
        'Juliana Mendes',
        '(11) 91111-2223',
        'E',
        'T',
        '1987-06-19',
        'Fadiga',
        '2025-06-01',
        NULL
    ),
    (
        'Kleber Nunes',
        '(11) 92222-3334',
        'N',
        'A',
        '1979-12-05',
        'Enxaqueca',
        '2025-06-01',
        NULL
    ),
    (
        'Marcos Vinícius',
        '(11) 93333-4445',
        'I',
        'N',
        '1993-08-22',
        'Insônia',
        '2025-06-01',
        NULL
    ),
    (
        'Natália Rocha',
        '(11) 94444-5556',
        'E',
        'A',
        '1996-01-17',
        'Dores musculares',
        '2025-06-01',
        NULL
    ),
    (
        'Patrícia Silva',
        '(11) 95555-6667',
        'N',
        'T',
        '1984-11-09',
        'Ansiedade',
        '2025-06-01',
        NULL
    ),
    (
        'Rafael Teixeira',
        '(11) 96666-7778',
        'I',
        'A',
        '1986-05-28',
        'Estresse',
        '2025-06-01',
        NULL
    ),
    (
        'Tiago Moreira',
        '(11) 97777-8889',
        'E',
        'F',
        '1994-09-13',
        'Fadiga',
        '2025-06-01',
        NULL
    ),
    (
        'Ursula Barros',
        '(11) 98888-9990',
        'N',
        'A',
        '1981-02-02',
        'Enxaqueca',
        '2025-06-01',
        NULL
    ),
    (
        'Xuxa Meneghel',
        '(11) 90000-1112',
        'I',
        'T',
        '1963-03-27',
        'Dores nas costas',
        '2025-06-01',
        NULL
    ),
    (
        'Daniela Castro',
        '(11) 91111-2224',
        'E',
        'A',
        '1989-07-15',
        'Fadiga',
        '2025-06-01',
        NULL
    ),
    (
        'Eduardo Ramos',
        '(11) 92222-3335',
        'N',
        'N',
        '1982-10-10',
        'Insônia',
        '2025-06-01',
        NULL
    ),
    (
        'Gabriel Martins',
        '(11) 93333-4446',
        'I',
        'A',
        '1997-12-29',
        'Estresse',
        '2025-06-01',
        NULL
    ),
    (
        'Helena Costa',
        '(11) 94444-5557',
        'E',
        'T',
        '1990-03-03',
        'Ansiedade',
        '2025-06-01',
        NULL
    );

-- Attendances (20, 3 different Thursdays)
INSERT INTO
    attendance (patient_id, date, type, notes)
VALUES (
        1,
        '2025-08-07',
        'spiritual',
        'Consulta espiritual.'
    ),
    (
        2,
        '2025-08-07',
        'lightBath',
        'Banho de luz.'
    ),
    (
        3,
        '2025-08-07',
        'spiritual',
        'Consulta espiritual.'
    ),
    (
        4,
        '2025-08-07',
        'lightBath',
        'Banho de luz.'
    ),
    (
        5,
        '2025-08-07',
        'spiritual',
        'Consulta espiritual.'
    ),
    (
        6,
        '2025-08-14',
        'lightBath',
        'Banho de luz.'
    ),
    (
        7,
        '2025-08-14',
        'spiritual',
        'Consulta espiritual.'
    ),
    (
        8,
        '2025-08-14',
        'lightBath',
        'Banho de luz.'
    ),
    (
        9,
        '2025-08-14',
        'spiritual',
        'Consulta espiritual.'
    ),
    (
        10,
        '2025-08-14',
        'lightBath',
        'Banho de luz.'
    ),
    (
        11,
        '2025-08-21',
        'spiritual',
        'Consulta espiritual.'
    ),
    (
        12,
        '2025-08-21',
        'lightBath',
        'Banho de luz.'
    ),
    (
        13,
        '2025-08-21',
        'spiritual',
        'Consulta espiritual.'
    ),
    (
        14,
        '2025-08-21',
        'lightBath',
        'Banho de luz.'
    ),
    (
        15,
        '2025-08-21',
        'spiritual',
        'Consulta espiritual.'
    ),
    (
        16,
        '2025-08-07',
        'lightBath',
        'Banho de luz.'
    ),
    (
        17,
        '2025-08-14',
        'spiritual',
        'Consulta espiritual.'
    ),
    (
        18,
        '2025-08-21',
        'lightBath',
        'Banho de luz.'
    ),
    (
        19,
        '2025-08-07',
        'spiritual',
        'Consulta espiritual.'
    ),
    (
        20,
        '2025-08-14',
        'lightBath',
        'Banho de luz.'
    );

-- Previous Attendances (30, 4 different Thursdays)
INSERT INTO
    previous_attendance (
        patient_id,
        attendance_id,
        date,
        notes,
        type,
        food,
        water,
        ointment,
        light_bath,
        rod,
        spiritual_treatment,
        return_weeks
    )
VALUES (
        1,
        1,
        '2025-07-10',
        'Atendimento anterior.',
        'spiritual',
        'Frutas',
        'Água',
        'Pomada X',
        TRUE,
        FALSE,
        TRUE,
        2
    ),
    (
        2,
        2,
        '2025-07-10',
        'Atendimento anterior.',
        'lightBath',
        'Legumes',
        'Água',
        'Pomada Y',
        TRUE,
        TRUE,
        FALSE,
        3
    ),
    (
        3,
        3,
        '2025-07-10',
        'Atendimento anterior.',
        'spiritual',
        'Frutas',
        'Água',
        'Pomada X',
        TRUE,
        FALSE,
        TRUE,
        2
    ),
    (
        4,
        4,
        '2025-07-10',
        'Atendimento anterior.',
        'lightBath',
        'Legumes',
        'Água',
        'Pomada Y',
        TRUE,
        TRUE,
        FALSE,
        3
    ),
    (
        5,
        5,
        '2025-07-17',
        'Atendimento anterior.',
        'spiritual',
        'Frutas',
        'Água',
        'Pomada X',
        TRUE,
        FALSE,
        TRUE,
        2
    ),
    (
        6,
        6,
        '2025-07-17',
        'lightBath',
        'Legumes',
        'Água',
        'Pomada Y',
        TRUE,
        TRUE,
        FALSE,
        3
    ),
    (
        7,
        7,
        '2025-07-17',
        'Atendimento anterior.',
        'spiritual',
        'Frutas',
        'Água',
        'Pomada X',
        TRUE,
        FALSE,
        TRUE,
        2
    ),
    (
        8,
        8,
        '2025-07-17',
        'lightBath',
        'Legumes',
        'Água',
        'Pomada Y',
        TRUE,
        TRUE,
        FALSE,
        3
    ),
    (
        9,
        9,
        '2025-07-24',
        'Atendimento anterior.',
        'spiritual',
        'Frutas',
        'Água',
        'Pomada X',
        TRUE,
        FALSE,
        TRUE,
        2
    ),
    (
        10,
        10,
        '2025-07-24',
        'lightBath',
        'Legumes',
        'Água',
        'Pomada Y',
        TRUE,
        TRUE,
        FALSE,
        3
    ),
    (
        11,
        11,
        '2025-07-24',
        'Atendimento anterior.',
        'spiritual',
        'Frutas',
        'Água',
        'Pomada X',
        TRUE,
        FALSE,
        TRUE,
        2
    ),
    (
        12,
        12,
        '2025-07-24',
        'lightBath',
        'Legumes',
        'Água',
        'Pomada Y',
        TRUE,
        TRUE,
        FALSE,
        3
    ),
    (
        13,
        13,
        '2025-07-31',
        'Atendimento anterior.',
        'spiritual',
        'Frutas',
        'Água',
        'Pomada X',
        TRUE,
        FALSE,
        TRUE,
        2
    ),
    (
        14,
        14,
        '2025-07-31',
        'lightBath',
        'Legumes',
        'Água',
        'Pomada Y',
        TRUE,
        TRUE,
        FALSE,
        3
    ),
    (
        15,
        15,
        '2025-07-31',
        'Atendimento anterior.',
        'spiritual',
        'Frutas',
        'Água',
        'Pomada X',
        TRUE,
        FALSE,
        TRUE,
        2
    ),
    (
        16,
        16,
        '2025-07-31',
        'lightBath',
        'Legumes',
        'Água',
        'Pomada Y',
        TRUE,
        TRUE,
        FALSE,
        3
    ),
    (
        17,
        17,
        '2025-07-10',
        'Atendimento anterior.',
        'spiritual',
        'Frutas',
        'Água',
        'Pomada X',
        TRUE,
        FALSE,
        TRUE,
        2
    ),
    (
        18,
        18,
        '2025-07-10',
        'lightBath',
        'Legumes',
        'Água',
        'Pomada Y',
        TRUE,
        TRUE,
        FALSE,
        3
    ),
    (
        19,
        19,
        '2025-07-17',
        'Atendimento anterior.',
        'spiritual',
        'Frutas',
        'Água',
        'Pomada X',
        TRUE,
        FALSE,
        TRUE,
        2
    ),
    (
        20,
        20,
        '2025-07-17',
        'lightBath',
        'Legumes',
        'Água',
        'Pomada Y',
        TRUE,
        TRUE,
        FALSE,
        3
    ),
    (
        1,
        1,
        '2025-07-24',
        'Atendimento anterior.',
        'spiritual',
        'Frutas',
        'Água',
        'Pomada X',
        TRUE,
        FALSE,
        TRUE,
        2
    ),
    (
        2,
        2,
        '2025-07-24',
        'lightBath',
        'Legumes',
        'Água',
        'Pomada Y',
        TRUE,
        TRUE,
        FALSE,
        3
    ),
    (
        3,
        3,
        '2025-07-31',
        'Atendimento anterior.',
        'spiritual',
        'Frutas',
        'Água',
        'Pomada X',
        TRUE,
        FALSE,
        TRUE,
        2
    ),
    (
        4,
        4,
        '2025-07-31',
        'lightBath',
        'Legumes',
        'Água',
        'Pomada Y',
        TRUE,
        TRUE,
        FALSE,
        3
    ),
    (
        5,
        5,
        '2025-07-10',
        'Atendimento anterior.',
        'spiritual',
        'Frutas',
        'Água',
        'Pomada X',
        TRUE,
        FALSE,
        TRUE,
        2
    ),
    (
        6,
        6,
        '2025-07-10',
        'lightBath',
        'Legumes',
        'Água',
        'Pomada Y',
        TRUE,
        TRUE,
        FALSE,
        3
    ),
    (
        7,
        7,
        '2025-07-17',
        'Atendimento anterior.',
        'spiritual',
        'Frutas',
        'Água',
        'Pomada X',
        TRUE,
        FALSE,
        TRUE,
        2
    ),
    (
        8,
        8,
        '2025-07-17',
        'lightBath',
        'Legumes',
        'Água',
        'Pomada Y',
        TRUE,
        TRUE,
        FALSE,
        3
    );