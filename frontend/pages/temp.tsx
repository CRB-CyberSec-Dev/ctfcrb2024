import CryptoJS from 'crypto-js';

// Replace with your actual AES key (ensure it's the correct length)
const secret = 'MulSVQT1HJG7Qwph+R4p1/IaeXhiEJeXqbruyeJvGI/dnKOTTEZObRCvbj32fFJ8'; // Should be of appropriate length for AES

// Decrypt function
function decrypt(encryptedData) {
  try {
    const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
    const content = CryptoJS.enc.Hex.parse(encryptedData.content);
    const key = CryptoJS.enc.Utf8.parse(secret); // Ensure this is of correct length

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: content },
      key,
      { iv: iv }
    );

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    // Check if decryption was successful
    if (!decryptedText) {
      throw new Error('Decryption resulted in an empty string. Please check the input data.');
    }

    return decryptedText;
    
  } catch (error) {
    console.error('Decryption error:', error.message);
    console.error('Input data:', JSON.stringify(encryptedData));
    throw new Error('Failed to decrypt the data.');
  }
}

// Example encrypted data
const encryptedResponse = {
    "iv":"ee37144ebaa7c8d7c1bef562de43f5c4",
    "content":"4fe810c6260534da8ee81e05f23205d44261be0b956c9bd10388d4fdbe998ca0"
};

// Testing the decryption
try {
  const decryptedData = decrypt(encryptedResponse);
  console.log('Decrypted text:', decryptedData);
} catch (error) {
  console.error('Error during decryption:', error.message);
}
