// language=PostgreSQL
const defaultQueries = [
  `CREATE EXTENSION IF NOT EXISTS cube;`,
  `CREATE EXTENSION IF NOT EXISTS earthdistance;`,
  `CREATE TABLE IF NOT EXISTS prof_ed (
    id SERIAL PRIMARY KEY NOT NULL,
    municipality TEXT,
    faculty_nr CHAR(12),
    faculty_name TEXT,
    faculty_type TEXT,
    faculty_type_alt TEXT,
    subordinate TEXT,
    founder TEXT,
    address_atvk_code CHAR(8),
    second_qualification_level CHAR(4),
    programme_code CHAR(12),
    programme_name TEXT,
    year_1_pupils INTEGER DEFAULT 0,
    year_2_pupils INTEGER DEFAULT 0,
    year_3_pupils INTEGER DEFAULT 0,
    year_4_pupils INTEGER DEFAULT 0,
    pupils_total INTEGER,
    date DATE NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS edu_municipalities (
    id SERIAL PRIMARY KEY NOT NULL,
    municipality TEXT,
    pupils_5_below INTEGER DEFAULT 0,
    pupils_5_above INTEGER DEFAULT 0,
    pupils_preschool_total INTEGER DEFAULT 0,
    grade_1_pupils INTEGER DEFAULT 0,
    grade_2_pupils INTEGER DEFAULT 0,
    grade_3_pupils INTEGER DEFAULT 0,
    grade_4_pupils INTEGER DEFAULT 0,
    grade_5_pupils INTEGER DEFAULT 0,
    grade_6_pupils INTEGER DEFAULT 0,
    grade_7_pupils INTEGER DEFAULT 0,
    grade_8_pupils INTEGER DEFAULT 0,
    grade_9_pupils INTEGER DEFAULT 0,
    grade_10_pupils INTEGER DEFAULT 0,
    grade_11_pupils INTEGER DEFAULT 0,
    grade_12_pupils INTEGER DEFAULT 0,
    pupils_grades_1_12_total INTEGER DEFAULT 0,
    vocational_special_ed_pupils INTEGER DEFAULT 0,
    total_pupils INTEGER DEFAULT 0,
    date DATE NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS edu_faculties (
    id SERIAL PRIMARY KEY NOT NULL,
    municipality TEXT,
    faculty_nr CHAR(12),
    faculty_name TEXT,
    faculty_type TEXT,
    faculty_type_alt TEXT,
    subordinate TEXT,
    founder TEXT,
    address_atvk_code CHAR(8),
    pupils_5_below INTEGER DEFAULT 0,
    pupils_5_above INTEGER DEFAULT 0,
    pupils_preschool_total INTEGER DEFAULT 0,
    grade_1_pupils INTEGER DEFAULT 0,
    grade_2_pupils INTEGER DEFAULT 0,
    grade_3_pupils INTEGER DEFAULT 0,
    grade_4_pupils INTEGER DEFAULT 0,
    grade_5_pupils INTEGER DEFAULT 0,
    grade_6_pupils INTEGER DEFAULT 0,
    grade_7_pupils INTEGER DEFAULT 0,
    grade_8_pupils INTEGER DEFAULT 0,
    grade_9_pupils INTEGER DEFAULT 0,
    grade_10_pupils INTEGER DEFAULT 0,
    grade_11_pupils INTEGER DEFAULT 0,
    grade_12_pupils INTEGER DEFAULT 0,
    pupils_grades_1_12_total INTEGER DEFAULT 0,
    vocational_special_ed_pupils INTEGER DEFAULT 0,
    total_pupils INTEGER DEFAULT 0,
    date DATE NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS edu_programmes (
    id SERIAL PRIMARY KEY NOT NULL,
    municipality TEXT,
    faculty_nr CHAR(12),
    faculty_name TEXT,
    faculty_type TEXT,
    faculty_type_alt TEXT,
    subordinate TEXT,
    founder TEXT,
    address_atvk_code CHAR(8),
    programme_code CHAR(12),
    programme_name TEXT,
    pupils_5_below INTEGER DEFAULT 0,
    pupils_5_above INTEGER DEFAULT 0,
    pupils_preschool_total INTEGER DEFAULT 0,
    grade_1_pupils INTEGER DEFAULT 0,
    grade_2_pupils INTEGER DEFAULT 0,
    grade_3_pupils INTEGER DEFAULT 0,
    grade_4_pupils INTEGER DEFAULT 0,
    grade_5_pupils INTEGER DEFAULT 0,
    grade_6_pupils INTEGER DEFAULT 0,
    grade_7_pupils INTEGER DEFAULT 0,
    grade_8_pupils INTEGER DEFAULT 0,
    grade_9_pupils INTEGER DEFAULT 0,
    grade_10_pupils INTEGER DEFAULT 0,
    grade_11_pupils INTEGER DEFAULT 0,
    grade_12_pupils INTEGER DEFAULT 0,
    pupils_grades_1_12_total INTEGER DEFAULT 0,
    total_pupils INTEGER DEFAULT 0,
    date DATE NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS oce_index (
    id SERIAL PRIMARY KEY NOT NULL,
    study_year TEXT,
    municipality TEXT,
    faculty_nr CHAR(12),
    faculty_name TEXT,
    faculty_type TEXT,
    faculty_type_alt TEXT,
    subordinate TEXT,
    oce_index DECIMAL(5, 2),
    grade_12_pupils INTEGER DEFAULT 0,
    oce_math_weighted_average DECIMAL(5, 2),
    oce_latvian_weighted_average DECIMAL(5, 2),
    oce_foreign_weighted_average DECIMAL(5, 2)
  )`,
  `CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY,
    municipality TEXT,
    faculty_nr CHAR(12),
    faculty_name TEXT,
    subordinate TEXT,
    faculty_type TEXT,
    faculty_type_alt TEXT,
    address TEXT,
    email TEXT,
    phone TEXT,
    director TEXT,
    pupils_preschool_total INTEGER DEFAULT 0,
    pupils_grades_1_12_total INTEGER DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS geocache (
    address TEXT PRIMARY KEY NOT NULL,
    lat FLOAT NOT NULL,
    lon FLOAT NOT NULL,
    display_name TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS professions (
    id SERIAL PRIMARY KEY NOT NULL,
    number INTEGER,
    code CHAR(10),
    name TEXT,
    description TEXT,
    parent CHAR(10),
    faculty_name TEXT,
    faculty_nr CHAR(12)
  )`,
];

export const queries = {
  filterDist: `SELECT 
    *,
    ((point(g.lon, g.lat) <@> point(%6$L, %5$L)) * 1.609344) as distance,
    rank() over(order by oce_index.oce_index desc) as rank,
    count(*) over() as rankTotal
FROM oce_index
    LEFT JOIN contacts c on oce_index.faculty_nr = c.faculty_nr
    LEFT JOIN geocache g on c.address = g.address
WHERE study_year = '2021./2022.' AND g.lat != 0
ORDER BY %1$I %2$s LIMIT %4$s OFFSET %3$s`,
  filter: `SELECT 
    *,
    rank() over(order by oce_index.oce_index desc) as rank,
    count(*) over() as rankTotal
FROM oce_index
    LEFT JOIN contacts c on oce_index.faculty_nr = c.faculty_nr
    LEFT JOIN geocache g on c.address = g.address
WHERE study_year = '2021./2022.' AND g.lat != 0
ORDER BY %1$I %2$s LIMIT %4$s OFFSET %3$s`
};

export default defaultQueries;
