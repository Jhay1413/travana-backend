import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { db } from '../src/db/db';
import { quote_accomodation } from '../src/schema/quote-schema';
import { accomodation_list } from '../src/schema/transactions-schema';
import { inArray } from 'drizzle-orm';

const CSV_PATH = path.resolve(process.cwd(), 'quote_accomodation.csv');

async function main() {
  const content = fs.readFileSync(CSV_PATH, 'utf-8');

  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    cast: (value) => (value === '' ? null : value),
  });

  // Collect all unique non-null accomodation_ids from CSV
  const csvAccomodationIds: string[] = [
    ...new Set(
      rows
        .map((r: any) => r.accomodation_id)
        .filter((id: string | null) => id !== null)
    ),
  ];

  // Fetch which ones actually exist in the DB
  let validAccomodationIds = new Set<string>();
  if (csvAccomodationIds.length > 0) {
    const found = await db
      .select({ id: accomodation_list.id })
      .from(accomodation_list)
      .where(inArray(accomodation_list.id, csvAccomodationIds));
    validAccomodationIds = new Set(found.map((r) => r.id));
  }

  const conflictingQuoteIds: string[] = [];
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    let accomodationId = row.accomodation_id ?? null;

    if (accomodationId && !validAccomodationIds.has(accomodationId)) {
      conflictingQuoteIds.push(row.quote_id);
      accomodationId = null; // nullify instead of failing
    }

    try {
      await db
        .insert(quote_accomodation)
        .values({
          id: row.id,
          tour_operator_id: row.tour_operator_id ?? null,
          no_of_nights: row.no_of_nights ? parseInt(row.no_of_nights) : 0,
          room_type: row.room_type ?? null,
          is_primary: row.is_primary === 'true' || row.is_primary === 't',
          is_included_in_package:
            row.is_included_in_package === 'true' || row.is_included_in_package === 't' ? true : false,
          cost: row.cost ?? null,
          commission: row.commission ?? null,
          accomodation_id: accomodationId,
          quote_id: row.quote_id ?? null,
          check_in_date_time: row.check_in_date_time ? new Date(row.check_in_date_time) : null,
          stay_type: row.stay_type ?? null,
          board_basis_id: row.board_basis_id ?? null,
          booking_ref: row.booking_ref ?? null,
        })
        .onConflictDoNothing();

      inserted++;
    } catch (err: any) {
      console.error(`❌ Failed to insert row id=${row.id}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\n✅ Inserted: ${inserted}`);
  console.log(`⚠️  Skipped (errors): ${skipped}`);

  if (conflictingQuoteIds.length > 0) {
    const unique = [...new Set(conflictingQuoteIds)];
    console.log(`\n🔴 quote_ids with missing accomodation_id (set to null):`);
    unique.forEach((id) => console.log(`  - ${id}`));
  } else {
    console.log('\n✅ No accomodation_id conflicts found.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
