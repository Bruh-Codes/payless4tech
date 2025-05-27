// downloadStorage.js
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
	process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(
	"https://vqqaszvcbtyohpjbcijw.supabase.co",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcWFzenZjYnR5b2hwamJjaWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxOTM1NzQsImV4cCI6MjA1MTc2OTU3NH0.MeyYk_3_ywi4z-N4OOvvpliTWii-XTfCV1a6EsXhoOQ"
); // Use service role for full access

const downloadAllFromBucket = async (bucketName) => {
	const { data, error } = await supabase.storage
		.from(bucketName)
		.list("", { recursive: true });

	if (error) {
		console.error("Error listing files:", error);
		return;
	}

	for (const file of data) {
		if (file.name.endsWith("/")) continue; // Skip folders

		const { data: fileData, error: downloadError } = await supabase.storage
			.from(bucketName)
			.download(file.name);

		if (downloadError) {
			console.error(`Failed to download ${file.name}:`, downloadError);
			continue;
		}

		const outputPath = path.join(__dirname, "backup", bucketName, file.name);
		fs.mkdirSync(path.dirname(outputPath), { recursive: true });
		fs.writeFileSync(outputPath, Buffer.from(await fileData.arrayBuffer()));

		console.log(`Downloaded: ${file.name}`);
	}
};

(async () => {
	const bucketName = "product-images";
	await downloadAllFromBucket(bucketName);
})();
