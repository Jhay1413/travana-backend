ALTER TABLE "cruise_itenary_dates_table" 
ALTER COLUMN "date" SET DATA TYPE DATE USING "date"::DATE;