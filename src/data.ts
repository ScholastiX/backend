import axios from "axios";
import { readdir } from "fs/promises";
import format from "pg-format";
import { readFile, utils } from "xlsx";
import { connectPostgres, postgresClient } from "./postgres";
import { client } from "./postgres/client";

const filenameRegExP = /^(?<name>.+)_(?<date>\d{2})(?<month>\d{2})(?<year>\d{4})\.xlsx$/;

const filenameToTableMap = new Map<string, string>([
  [ "izglitojamoskprofesionalasizglprogr_pa_progr", "prof_ed"             ],
  [ "izglitojamoskvispizglprogr_pa_pasvaldibam",    "edu_municipalities"  ],
  [ "izglitojamoskvispizglprogr_pa_iestadem",       "edu_faculties"       ],
  [ "izglitojamoskvispizglprogr_pa_progr",          "edu_programmes"      ],
]);
const tableSheetHeaderToColumnMap = new Map<string, Map<string, string>>([
  [ "prof_ed", new Map<string, string>([
    [ "Pašvaldība", "municipality" ],
    [ "Iestādes reģistrācijas Nr.", "faculty_nr" ],
    [ "Iestādes nosaukums", "faculty_name" ],
    [ "Iestādes veids", "faculty_type" ],
    [ "Iestādes tips", "faculty_type_alt" ],
    [ "Pakļautība", "subordinate" ],
    [ "Faktiskais dibinātājs", "founder" ],
    [ "Adreses ATVK kods", "address_atvk_code" ],
    [ " Izglītības programmas otrais klasifikācijas līmenis", "second_qualification_level" ],
    [ "Izglītības programmas kods", "programme_code" ],
    [ "Izglītības programmas nosaukums", "programme_name" ],
    [ "1.kursā", "year_1_pupils" ],
    [ "2.kursā", "year_2_pupils" ],
    [ "3.kursā", "year_3_pupils" ],
    [ "4.kursā", "year_4_pupils" ],
    [ "Izglītojamo skaits kopā (1.-4.kurss)", "pupils_total" ],
  ]) ],
  [ "edu_municipalities", new Map<string, string>([
    [ "Pašvaldība", "municipality" ],
    [ "Izglītojamo skaits vecumā līdz 5 gadu vecumam", "pupils_5_below" ],
    [ "Izglītojamo skaits vecumā 5 gadi un vairāk", "pupils_5_above" ],
    [ "Izglītojamo skaits pirmsskolā kopā", "pupils_preschool_total" ],
    [ "1. klase", "grade_1_pupils" ],
    [ "2. klase", "grade_2_pupils" ],
    [ "3. klase", "grade_3_pupils" ],
    [ "4. klase", "grade_4_pupils" ],
    [ "5. klase", "grade_5_pupils" ],
    [ "6. klase", "grade_6_pupils" ],
    [ "7. klase", "grade_7_pupils" ],
    [ "8. klase", "grade_8_pupils" ],
    [ "9. klase", "grade_9_pupils" ],
    [ "10. klase", "grade_10_pupils" ],
    [ "11. klase", "grade_11_pupils" ],
    [ "12. klase", "grade_12_pupils" ],
    [ "Kopā 1.-12.klasē", "pupils_grades_1_12_total" ],
    [ "Profesionālās pamatizglītības programmās pie speciālās izglītības iestādēm", "vocational_special_ed_pupils" ],
    [ "Kopējais izglītojamo skaits", "total_pupils" ],
  ]) ],
  [ "edu_faculties", new Map<string, string>([
    [ "Pašvaldība", "municipality" ],
    [ "Iestādes reģistrācijas Nr.", "faculty_nr" ],
    [ "Iestādes nosaukums", "faculty_name" ],
    [ "Iestādes veids", "faculty_type" ],
    [ "Iestādes tips", "faculty_type_alt" ],
    [ "Pakļautība", "subordinate" ],
    [ "Faktiskais dibinātājs", "founder" ],
    [ "Adreses ATVK kods", "address_atvk_code" ],
    [ "Izglītojamo skaits vecumā līdz 5 gadu vecumam", "pupils_5_below" ],
    [ "Izglītojamo skaits vecumā 5 gadi un vairāk", "pupils_5_above" ],
    [ "Izglītojamo skaits pirmsskolā kopā", "pupils_preschool_total" ],
    [ "1. klase", "grade_1_pupils" ],
    [ "2. klase", "grade_2_pupils" ],
    [ "3. klase", "grade_3_pupils" ],
    [ "4. klase", "grade_4_pupils" ],
    [ "5. klase", "grade_5_pupils" ],
    [ "6. klase", "grade_6_pupils" ],
    [ "7. klase", "grade_7_pupils" ],
    [ "8. klase", "grade_8_pupils" ],
    [ "9. klase", "grade_9_pupils" ],
    [ "10. klase", "grade_10_pupils" ],
    [ "11. klase", "grade_11_pupils" ],
    [ "12. klase", "grade_12_pupils" ],
    [ "Kopā 1.-12.klasē", "pupils_grades_1_12_total" ],
    [ "Profesionālās pamatizglītības programmās pie speciālās izglītības iestādēm", "vocational_special_ed_pupils" ],
    [ "Kopējais izglītojamo skaits", "total_pupils" ],
  ])],
  [ "edu_programmes", new Map<string, string>([
    [ "Pašvaldība", "municipality" ],
    [ "Iestādes reģistrācijas Nr.", "faculty_nr" ],
    [ "Iestādes nosaukums", "faculty_name" ],
    [ "Iestādes veids", "faculty_type" ],
    [ "Iestādes tips", "faculty_type_alt" ],
    [ "Pakļautība", "subordinate" ],
    [ "Faktiskais dibinātājs", "founder" ],
    [ "Adreses ATVK kods", "address_atvk_code" ],
    [ "Izglītības programmas kods", "programme_code" ],
    [ "Izglītības programmas nosaukums", "programme_name" ],
    [ "Izglītojamo skaits vecumā līdz 5 gadu vecumam", "pupils_5_below" ],
    [ "Izglītojamo skaits vecumā 5 gadi un vairāk", "pupils_5_above" ],
    [ "Izglītojamo skaits pirmsskolā kopā", "pupils_preschool_total" ],
    [ "1. klase", "grade_1_pupils" ],
    [ "2. klase", "grade_2_pupils" ],
    [ "3. klase", "grade_3_pupils" ],
    [ "4. klase", "grade_4_pupils" ],
    [ "5. klase", "grade_5_pupils" ],
    [ "6. klase", "grade_6_pupils" ],
    [ "7. klase", "grade_7_pupils" ],
    [ "8. klase", "grade_8_pupils" ],
    [ "9. klase", "grade_9_pupils" ],
    [ "10. klase", "grade_10_pupils" ],
    [ "11. klase", "grade_11_pupils" ],
    [ "12. klase", "grade_12_pupils" ],
    [ "Kopā 1.-12.klasē", "pupils_grades_1_12_total" ],
    [ "Izglītojamo skaits kopā", "total_pupils" ],
  ]) ],
  [ "oce_index", new Map([
    [ "Mācību gads", "study_year" ],
    [ "Pašvaldība", "municipality" ],
    [ "Reģistrācijas Nr.", "faculty_nr" ],
    [ "Izglītības iestāde", "faculty_name" ],
    [ "Iestādes veids", "faculty_type" ],
    [ "Iestādes tips", "faculty_type_alt" ],
    [ "Pakļautība", "subordinate" ],
    [ "OCE indekss", "oce_index" ],
    [ "Izglītojamo skaits 12.klasē", "grade_12_pupils" ],
    [ "OCE matemātikā\nvidējā svērtā vērtība", "oce_math_weighted_average" ],
    [ "OCE latviešu val.\nvidējā svērtā vērtība", "oce_latvian_weighted_average" ],
    [ "OCE svešvalodā\nvidējā svērtā vērtība", "oce_foreign_weighted_average" ],
  ])],
  [ "contacts", new Map([
    [ "N.p.k.", "id" ],
    [ "Novads/valstspilsēta", "municipality" ],
    [ "Iestādes reģistrācijas Nr.", "faculty_nr" ],
    [ "Iestādes nosaukums", "faculty_name" ],
    [ "Pakļautība", "subordinate" ],
    [ "Iestādes veids", "faculty_type" ],
    [ "Iestādes tips", "faculty_type_alt" ],
    [ "Adrese", "address" ],
    [ "Epasts", "email" ],
    [ "Tālrunis", "phone" ],
    [ "Direktors", "director" ],
    [ "Bērnu skaits pirmsskolas programmās", "pupils_preschool_total" ],
    [ "Izglītojamo skaits 1. - 12. klasē", "pupils_grades_1_12_total" ],
  ])],
  [ "professions", new Map([
    [ "NPK", "number" ],
    [ "Kods", "code" ],
    [ "Nosaukums", "name" ],
    [ "Apraksts", "description" ],
    [ "Vecāks", "parent" ],
    [ "Skola", "faculty_name" ],
    [ "Reģistrācija", "faculty_nr" ],
  ])],
]);

async function main() {
  await connectPostgres();

  await Promise.all([...tableSheetHeaderToColumnMap.keys()].map(v =>
        client.query(format("TRUNCATE TABLE %I", v))));

  const excelFilenames = await readdir(__dirname + "/../data");
  for (const excelFilename of excelFilenames) {
    const regexRes = filenameRegExP.exec(excelFilename);

    if (!regexRes) {
      continue;
    }

    console.log("processing file", excelFilename);

    const { groups: fileProps } = regexRes;
    const tableName = filenameToTableMap.get(fileProps!.name)!;
    const date = `${fileProps!.year}-${fileProps!.month}-${fileProps!.date}`;

    const workBook = readFile(__dirname + "/../data/" + excelFilename);
    const csv = utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]]);

    const map = tableSheetHeaderToColumnMap.get(tableName)!;

    for (const row of csv) {
      const entries = Object.entries(row!)
            .map(([ k, v ]) => [ map.get(k), v ]);
      entries.push([ 'date', date ]);
      const keys = entries.map(([ k ]) => k);
      const values = entries.map(([ , v ]) => v);

      const query = format("INSERT INTO %I (%I) VALUES (%L)", tableName, keys, values);
      await client.query(query);
    }
  }

  console.log("processing file", "Vispārējās izglītības OCE indeksu vizualizācijas 1.5v .xlsx");
  const oceWb = readFile(__dirname + "/../data/" + "Vispārējās izglītības OCE indeksu vizualizācijas 1.5v .xlsx");
  const oceSheet = oceWb.Sheets[oceWb.SheetNames[0]];
  const oceCsv = utils.sheet_to_json(oceSheet, { range: 5 });
  const oceMap = tableSheetHeaderToColumnMap.get("oce_index")!;

  for (const row of oceCsv) {
    const entries = Object.entries(row!)
          .map(([ k, v ]) => [ oceMap.get(k), /^\d+,?\d*%$/.test(v) ? parsePercent(v) : v ]);
    const keys = entries.map(([ k ]) => k);
    const values = entries.map(([ , v ]) => v);

    const query = format("INSERT INTO oce_index (%I) VALUES (%L)", keys, values);
    await client.query(query);
  }

  console.log("processing file", "ml_visparizgl_izgl_iest_kontaktinfo_01092022_0.xlsx");
  const contWb = readFile(__dirname + "/../data/" + "ml_visparizgl_izgl_iest_kontaktinfo_01092022_0.xlsx");
  const contSheet = contWb.Sheets[contWb.SheetNames[0]];
  const contCsv = utils.sheet_to_json(contSheet, { range: 3 });
  const contMap = tableSheetHeaderToColumnMap.get("contacts")!;

  for (const row of contCsv) {
    const entries = Object.entries(row!)
          .map(([ k, v ]) => [ contMap.get(k), v ]);
    const keys = entries.map(([ k ]) => k);
    const values = entries.map(([ , v ]) => v);

    const query = format("INSERT INTO contacts (%I) VALUES (%L)", keys, values);
    await client.query(query);
  }

  console.log("processing geolocation");
  const { rows } = await postgresClient.query(`
SELECT DISTINCT contacts.address
FROM contacts
    LEFT JOIN geocache
        ON contacts.address = geocache.address
WHERE geocache.address IS NULL`);

  let counter = 0;
  for (const { address } of rows) {
    const url = new URL("https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=lv");
    url.searchParams.set("q", address.replace(/, .+? PRIEKŠPILSĒTA/, ""));
    url.searchParams.set("email", "codedsakura+contact@gmail.com");

    const { data: [ res ] } = await axios.get(url.href, {
      headers: { "User-Agent": "hackcodex2023-codedsakura" }
    });

    if (res) {
      const query = format(
            "INSERT INTO geocache (address, lat, lon, display_name) VALUES (%L)",
            [ address, res.lat, res.lon, res.display_name ],
      );
      await client.query(query);
    } else {
      console.log(address, "was not found");
      const query = format(
            "INSERT INTO geocache (address, lat, lon) VALUES (%L)",
            [ address, 0, 0 ],
      );
      await client.query(query);
    }

    if (counter % 20 === 0) {
      console.log(`${counter}/${rows.length}`);
    }

    await new Promise(res => setTimeout(res, 1200));
    counter++;
  }

  console.log("processing file", "profesiju-klasifikators-aktualizets-2022gada-8aprili.alt.xlsx");
  const profWb = readFile(__dirname + "/../data/" + "profesiju-klasifikators-aktualizets-2022gada-8aprili.alt.xlsx");
  const profSheet = profWb.Sheets[profWb.SheetNames[0]];
  const profCsv = utils.sheet_to_json(profSheet);
  const profMap = tableSheetHeaderToColumnMap.get("professions")!;

  for (const row of profCsv) {
    const entries = Object.entries(row!)
          .map(([ k, v ]) => [ profMap.get(k), v ]);
    const keys = entries.map(([ k ]) => k);
    const values = entries.map(([ , v ]) => v);

    const query = format("INSERT INTO professions (%I) VALUES (%L)", keys, values);
    await client.query(query);
  }

  console.log("done!");
  await postgresClient.end();
}

if (require.main === module) {
  main().catch(e => {
    console.error(e);
    process.exit(1);
  });
}

function parsePercent(v: string): number {
  return Number(v.substring(0, v.length - 1).replace(",", "."));
}
