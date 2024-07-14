// script.js
document.getElementById('dataForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const text = document.getElementById('userData').value;
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                embedTextIntoImage(img, text);
            };
        };
        reader.readAsDataURL(file);
    }
});

function embedTextIntoImage(img, text) {
    const canvas = document.getElementById('imageCanvas');
    const context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const textBinary = textToBinary(text);
    let dataIndex = 0;

    for (let i = 0; i < textBinary.length; i++) {
        if (dataIndex >= data.length) break;

        // Modify the least significant bit of the pixel data
        data[dataIndex] = (data[dataIndex] & 254) | parseInt(textBinary[i]);
        dataIndex += 4; // Move to the next pixel (skipping alpha channel)
    }

    context.putImageData(imageData, 0, 0);

    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.style.display = 'block';
}

function textToBinary(text) {
    return text.split('')
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join('');
}

document.getElementById('revealButton').addEventListener('click', function() {
    const fileInput = document.getElementById('revealImageUpload');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const hiddenText = revealTextFromImage(img);
                // Remove last character from revealed text
                const trimmedText = hiddenText.slice(0, -1);
                document.getElementById('revealedText').textContent = trimmedText;
            };
        };
        reader.readAsDataURL(file);
    }
});

function revealTextFromImage(img) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let binaryText = '';
    let endIndex = -1;

    // Find the end of the hidden text (up to "HE" marker)
    for (let i = 0; i < data.length; i += 4) {
        binaryText += (data[i] & 1).toString();

        // Check if the marker "HE" is found
        if (binaryText.endsWith('01001000') && binaryText.length >= 16) { // '01001000' is binary for 'H' and 'E'
            endIndex = i;
            break;
        }
    }

    // Convert binary text to human-readable text
    const hiddenText = binaryToText(binaryText.slice(0, endIndex));
    return hiddenText;
}

function binaryToText(binary) {
    let text = '';
    for (let i = 0; i < binary.length; i += 8) {
        const byte = binary.slice(i, i + 8);
        text += String.fromCharCode(parseInt(byte, 2));
    }
    return text;
}
