/**
 * Test OCR endpoint with mock receipt image
 * Run: node test_ocr.js
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config();

const API_URL = `http://localhost:${process.env.PORT || 5001}/api/ocr`;

const testOCR = async () => {
    try {
        console.log(`🔄 Testing OCR endpoint: ${API_URL}`);
        console.log("📝 Creating test image file...");
        
        // Create a minimal valid JPEG header + text content
        // This helps the OCR service at least attempt to process it
        const jpegHeader = Buffer.from([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
            0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01
        ]);
        
        fs.writeFileSync('test_dummy.jpg', jpegHeader);
        
        const formData = new FormData();
        formData.append('receipt', fs.createReadStream('test_dummy.jpg'));

        console.log(`📤 Uploading to ${API_URL}...`);
        const res = await axios.post(API_URL, formData, {
            headers: formData.getHeaders(),
            timeout: 20000
        });

        console.log("\n✅ Response received:");
        console.log(JSON.stringify(res.data, null, 2));

        if (res.data.success) {
            console.log("\n✅ OCR Processing successful!");
            console.log(`   • Extracted Amount: ${res.data.data.amount}`);
            console.log(`   • Extracted Date: ${res.data.data.date}`);
            console.log(`   • Extracted Merchant: ${res.data.data.merchant}`);
        } else {
            console.log("\n❌ OCR Processing failed:", res.data.message);
        }

    } catch (err) {
        console.error("\n❌ Error:", err.message);
        if (err.response?.data) {
            console.error("Response data:", err.response.data);
        }
    } finally {
        if (fs.existsSync('test_dummy.jpg')) {
            fs.unlinkSync('test_dummy.jpg');
            console.log("\n🧹 Cleanup: test_dummy.jpg removed");
        }
    }
};

testOCR();

