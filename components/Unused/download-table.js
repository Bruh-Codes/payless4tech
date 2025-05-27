// exportProductRows.js
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const { parse } = require("json2csv"); // npm install json2csv

const supabase = createClient(
	"https://vqqaszvcbtyohpjbcijw.supabase.co",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcWFzenZjYnR5b2hwamJjaWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxOTM1NzQsImV4cCI6MjA1MTc2OTU3NH0.MeyYk_3_ywi4z-N4OOvvpliTWii-XTfCV1a6EsXhoOQ"
);

async function exportTableToCSV(tableName, outputPath) {
	const { data, error } = await supabase.from(tableName).select("*");

	if (error) {
		console.error("Error fetching table data:", error);
		return;
	}

	if (!data || data.length === 0) {
		console.warn("No data found in table:", tableName);
		return;
	}

	try {
		const csv = parse(data);
		fs.writeFileSync(outputPath, csv);
		console.log(`✅ CSV exported to ${outputPath}`);
	} catch (err) {
		console.error("Error writing CSV:", err);
	}
}

exportTableToCSV("products", "./products.csv");
