document.addEventListener('DOMContentLoaded', function () {
    const imageInput = document.getElementById('imageInput');
    const startBtn = document.getElementById('startBtn');
    const output = document.getElementById('output');
    const progressBar = document.getElementById('progressBar');
    const languageSelect = document.getElementById('languageSelect');

    startBtn.addEventListener('click', function() {
        const imageFile = imageInput.files[0];
        if (!imageFile) {
            alert('Please select an image file first!');
            return;
        }
        processImage(imageFile);
    });

    function updateProgress(percent) {
        progressBar.style.width = `${percent}%`;
        progressBar.textContent = `${percent}%`;
    }

    function processImage(imageFile) {
        resizeAndProcessImage(imageFile, function(resizedDataUrl) {
            recognizeText(resizedDataUrl);
        });
    }

    function resizeAndProcessImage(file, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                let canvas = document.createElement("canvas");
                let ctx = canvas.getContext("2d");
                let maxW = 800;
                let maxH = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxW) {
                        height *= maxW / width;
                        width = maxW;
                    }
                } else {
                    if (height > maxH) {
                        width *= maxH / height;
                        height = maxH;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                callback(canvas.toDataURL('image/jpeg'));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function recognizeText(dataUrl) {
        Tesseract.recognize(
            dataUrl,
            languageSelect.value,
            {
                logger: m => updateProgress(Math.round(m.progress * 100))
            }
        ).then(function(result) {
            output.value = result.data.text;
            updateProgress(0); // Reset progress after completion
        }).catch(function(error) {
            console.error('OCR Error:', error);
            alert('An error occurred while processing the image!');
            updateProgress(0); // Reset progress on error
        });
    }
});
