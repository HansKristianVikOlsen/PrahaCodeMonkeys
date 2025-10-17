/**
 * Test script to verify Azure Blob Storage connection
 * Run with: node test-azure.js
 */

import 'dotenv/config';

const AZURE_PHOTO_URL = process.env.AZURE_PHOTO_STORAGE_URL;
const AZURE_COMMENT_URL = process.env.AZURE_COMMENT_STORAGE_URL;

console.log('🔷 Testing Azure Blob Storage Connection...\n');

async function testConnection() {
	// Test 1: Check environment variables
	console.log('1️⃣ Checking environment variables...');
	if (!AZURE_PHOTO_URL) {
		console.error('❌ AZURE_PHOTO_STORAGE_URL not found in .env');
		return false;
	}
	if (!AZURE_COMMENT_URL) {
		console.error('❌ AZURE_COMMENT_STORAGE_URL not found in .env');
		return false;
	}
	console.log('✅ Environment variables configured\n');

	// Test 2: List blobs in photo container
	console.log('2️⃣ Testing photo container access...');
	try {
		const baseUrl = AZURE_PHOTO_URL.split('?')[0];
		const sasToken = AZURE_PHOTO_URL.split('?')[1];
		const listUrl = `${baseUrl}?${sasToken}&restype=container&comp=list`;

		const response = await fetch(listUrl);

		if (!response.ok) {
			console.error(`❌ Failed to access photo container: ${response.status} ${response.statusText}`);
			const errorText = await response.text();
			console.error('Error details:', errorText.substring(0, 200));
			return false;
		}

		const xmlText = await response.text();
		const blobCount = (xmlText.match(/<Name>/g) || []).length;
		console.log(`✅ Photo container accessible (${blobCount} blobs found)\n`);
	} catch (error) {
		console.error('❌ Error accessing photo container:', error.message);
		return false;
	}

	// Test 3: List blobs in comment container
	console.log('3️⃣ Testing comment container access...');
	try {
		const baseUrl = AZURE_COMMENT_URL.split('?')[0];
		const sasToken = AZURE_COMMENT_URL.split('?')[1];
		const listUrl = `${baseUrl}?${sasToken}&restype=container&comp=list`;

		const response = await fetch(listUrl);

		if (!response.ok) {
			console.error(`❌ Failed to access comment container: ${response.status} ${response.statusText}`);
			const errorText = await response.text();
			console.error('Error details:', errorText.substring(0, 200));
			return false;
		}

		const xmlText = await response.text();
		const blobCount = (xmlText.match(/<Name>/g) || []).length;
		console.log(`✅ Comment container accessible (${blobCount} blobs found)\n`);
	} catch (error) {
		console.error('❌ Error accessing comment container:', error.message);
		return false;
	}

	// Test 4: Test write permissions (upload a test file)
	console.log('4️⃣ Testing write permissions...');
	try {
		const testContent = JSON.stringify({
			test: true,
			timestamp: new Date().toISOString(),
			message: 'This is a test file created by test-azure.js'
		}, null, 2);

		const baseUrl = AZURE_PHOTO_URL.split('?')[0];
		const sasToken = AZURE_PHOTO_URL.split('?')[1];
		const testBlobUrl = `${baseUrl}/test-connection.json?${sasToken}`;

		const uploadResponse = await fetch(testBlobUrl, {
			method: 'PUT',
			headers: {
				'x-ms-blob-type': 'BlockBlob',
				'Content-Type': 'application/json'
			},
			body: testContent
		});

		if (!uploadResponse.ok) {
			console.error(`❌ Failed to upload test file: ${uploadResponse.status}`);
			const errorText = await uploadResponse.text();
			console.error('Error details:', errorText.substring(0, 200));
			return false;
		}

		console.log('✅ Successfully uploaded test file');

		// Verify we can read it back
		const readResponse = await fetch(testBlobUrl);
		if (!readResponse.ok) {
			console.error('❌ Failed to read test file back');
			return false;
		}

		const readContent = await readResponse.text();
		const parsed = JSON.parse(readContent);
		console.log('✅ Successfully read test file back');
		console.log(`   Created at: ${parsed.timestamp}\n`);

		// Clean up: delete test file
		const deleteResponse = await fetch(testBlobUrl, { method: 'DELETE' });
		if (deleteResponse.ok) {
			console.log('✅ Test file cleaned up\n');
		}

		return true;
	} catch (error) {
		console.error('❌ Error testing write permissions:', error.message);
		return false;
	}
}

// Run tests
testConnection()
	.then((success) => {
		if (success) {
			console.log('🎉 All tests passed! Azure Blob Storage is properly configured.\n');
			console.log('You can now run: pnpm dev');
			process.exit(0);
		} else {
			console.log('\n❌ Some tests failed. Please check your configuration.\n');
			console.log('Troubleshooting steps:');
			console.log('1. Verify .env file exists with correct SAS URLs');
			console.log('2. Check SAS tokens have not expired');
			console.log('3. Ensure SAS tokens have racwdli permissions');
			console.log('4. Verify containers "photo" and "comment" exist in Azure');
			console.log('\nSee AZURE_SETUP.md for detailed setup instructions.');
			process.exit(1);
		}
	})
	.catch((error) => {
		console.error('\n💥 Unexpected error:', error);
		process.exit(1);
	});
