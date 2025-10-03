ALTER TABLE "enquiry_table" 
ALTER COLUMN "no_of_nights" 
SET DATA TYPE numeric 
USING "no_of_nights"::numeric;