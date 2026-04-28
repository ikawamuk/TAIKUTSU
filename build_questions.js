const fs = require('fs');
const path = require('path');

const IMAGE_DIR = path.join(__dirname, 'image');
const OUT_FILE = path.join(__dirname, 'questions.json');

function isImageFile(name) {
    return /\.(png|jpe?g|gif|webp)$/i.test(name);
}

function scan() {
    const questions = [];
    if (!fs.existsSync(IMAGE_DIR)) {
        console.error('image directory not found:', IMAGE_DIR);
        process.exit(1);
    }

    const categories = fs.readdirSync(IMAGE_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

    categories.forEach(category => {
        const dir = path.join(IMAGE_DIR, category);
        const files = fs.readdirSync(dir).filter(isImageFile);
        files.forEach(file => {
            const rel = path.join('image', category, file).replace(/\\/g, '/');
            // determine correct choice by folder name
            let correctChoice = '1';
            const lower = category.toLowerCase();
            if (lower.includes('taikutsu')) correctChoice = '1';
            else if (lower.includes('not_taikutsu') || lower.includes('nottai') || lower.includes('not')) correctChoice = '2';

            questions.push({ image: rel, correctChoice });
        });
    });

    fs.writeFileSync(OUT_FILE, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`Wrote ${questions.length} questions to ${OUT_FILE}`);
}

scan();
