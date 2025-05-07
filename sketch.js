let classifier;
let userChart;

const testData = [
    { src: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Pug_600.jpg', correct: true },
    { src: 'images/cougar.jpg.jpeg', correct: true },
    { src: 'images/orange.jpg', correct: true },
    { src: 'images/apple.jpg', correct: false },
    { src: 'images/erdbeer.jpg', correct: false },
    { src: 'images/pfote.jpg', correct: false },
];

window.addEventListener("load", async () => {
    classifier = await ml5.imageClassifier('MobileNet');
    showTestData();
    setupDragAndDrop();
});

async function showTestData() {
    const correctDiv = document.getElementById('correct-classifications');
    const wrongDiv = document.getElementById('wrong-classifications');

    for (let data of testData) {
        const container = document.createElement('div');
        container.className = 'result-block';

        const imgBox = document.createElement('div');
        imgBox.className = 'image-container';
        const img = document.createElement('img');
        img.src = data.src;
        img.crossOrigin = "anonymous";
        imgBox.appendChild(img);


        const canvasBox = document.createElement('div');
        canvasBox.className = 'canvas-container';
        const canvas = document.createElement('canvas');
        canvasBox.appendChild(canvas);

        container.appendChild(imgBox);
        container.appendChild(canvasBox);
        (data.correct ? correctDiv : wrongDiv).appendChild(container);

        await new Promise(resolve => {
            img.onload = async () => {
                const results = await classifier.classify(img);
                drawChart(canvas, results);
                resolve();
            };
        });
    }
}

function drawChart(canvas, results) {
    new Chart(canvas.getContext('2d'), {
        type: 'pie',
        data: {
            labels:  results.slice(0, 3).map(r => r.label),
            datasets: [{
                label: 'Confidence (%)',
                data: results.slice(0, 3).map(r => Math.round(r.confidence * 100)),
                backgroundColor: ['#4caf50', '#2196f3', '#ff9800']
            }]
        },

        options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function setupDragAndDrop() {
    const area = document.getElementById('user-upload-area');
    area.addEventListener('dragover', e => {
        e.preventDefault();
        area.style.borderColor = '#555';
    });

    area.addEventListener('dragleave', e => {
        area.style.borderColor = '#aaa';
    });

    area.addEventListener('drop', e => {
        e.preventDefault();
        area.style.borderColor = '#aaa';
        const file = e.dataTransfer.files[0];
        handleImageUpload(file);
    });

    document.getElementById('uploadInput').addEventListener('change', e => {
        const file = e.target.files[0];
        handleImageUpload(file);
    });
}


function handleImageUpload(file) {
    if (!file) {
        alert("Bitte wähle eine Datei aus.");
        return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (!validTypes.includes(file.type)) {
        alert("Nur JPG, PNG oder GIF Dateien sind erlaubt.");
        return;
    }
    const reader = new FileReader();
    reader.onload = function (event) {
        const img = document.getElementById('user-image');
        img.src = event.target.result;
        document.getElementById('user-result').style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

async function classifyUserImage() {
    const img = document.getElementById('user-image');
    const results = await classifier.classify(img);
    if (userChart) userChart.destroy(); // alte Grafik löschen
    userChart = new Chart(document.getElementById('user-chart').getContext('2d'), {
        type: 'pie',
        data: {
            labels: results.slice(0, 3).map(r => r.label),
            datasets: [{
                label: 'Confidence (%)',
                data: results.slice(0, 3).map(r => Math.round(r.confidence * 100)),
                backgroundColor: ['#4caf50', '#2196f3', '#ff9800']
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}