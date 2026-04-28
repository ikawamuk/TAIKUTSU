document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const gameImage = document.getElementById('gameImage');
    const finalScoreEl = document.getElementById('finalScore');
    const backTitle = document.getElementById('backTitle');
    const retryBtn = document.getElementById('retryBtn');
    const gameLogo = document.getElementById('gameLogo');
    const choiceButtons = document.querySelectorAll('.choice-btn');

    let questions = [];
    let currentQuestionIndex = 0;

    async function loadQuestions() {
        try {
            const res = await fetch('questions.json', { cache: 'no-store' });
            if (!res.ok) throw new Error('fetch failed');
            const data = await res.json();
            if (Array.isArray(data) && data.length) {
                questions = data;
                return;
            }
        } catch (err) {
            // fallback to a small built-in set if fetch fails
            console.warn('Failed to load questions.json, using fallback', err);
            questions = [
                { image: 'image/taikutsu/image1.png', correctChoice: '1' },
                { image: 'image/not_taikutsu/image2.png', correctChoice: '2' },
            ];
        }
    }

    function showScreen(id) {
        // If showing an overlay (gameOverScreen), keep the game screen visible underneath.
        if (id === 'gameOverScreen') {
            const home = document.getElementById('homeScreen');
            if (home) home.classList.add('hidden');
            const overlay = document.getElementById(id);
            if (overlay) overlay.classList.remove('hidden');
            return;
        }

        // Full-screen switch (home or game)
        const screens = ['homeScreen', 'gameScreen', 'gameOverScreen'];
        screens.forEach(name => {
            const el = document.getElementById(name);
            if (!el) return;
            el.classList.add('hidden');
        });
        const target = document.getElementById(id);
        if (target) target.classList.remove('hidden');
    }

    // 初期表示はホーム画面
    showScreen('homeScreen');

    // load questions then render initial state when fetched
    (async () => {
        await loadQuestions();
        // prepare first question so game shows correct image when started
        renderQuestion();
    })();

    // スコア表示（正解数）
    const scoreDisplay = document.getElementById('scoreDisplay');
    let correctCount = 0;
    function updateScore() {
        if (scoreDisplay) scoreDisplay.textContent = `正解: ${correctCount}`;
    }

    function renderQuestion() {
        const question = questions[currentQuestionIndex];
        if (!question) return;
        if (gameImage) gameImage.src = question.image;
    }

    function resetGameState() {
        correctCount = 0;
        currentQuestionIndex = 0;
        updateScore();
        renderQuestion();
    }

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            // Start game directly
            resetGameState();
            const overlay = document.getElementById('gameOverScreen');
            if (overlay) overlay.classList.add('hidden');
            showScreen('gameScreen');
        });
    }

    // 選択肢のクリック: 正解なら +1 して次の問題へ、不正解なら終了画面へ
    choiceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedChoice = btn.dataset.choice;
            const question = questions[currentQuestionIndex];
            if (!question) return;

            if (selectedChoice === question.correctChoice) {
                correctCount += 1;
                updateScore();
                // 2問をループ
                currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
                renderQuestion();
            } else {
                if (finalScoreEl) finalScoreEl.textContent = String(correctCount);
                showScreen('gameOverScreen');
            }
        });
    });

    // 終了画面のボタン
    if (backTitle) {
        backTitle.addEventListener('click', () => {
            // hide overlay and go back to title
            const overlay = document.getElementById('gameOverScreen');
            if (overlay) overlay.classList.add('hidden');
            showScreen('homeScreen');
        });
    }
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            const overlay = document.getElementById('gameOverScreen');
            if (overlay) overlay.classList.add('hidden');
            resetGameState();
            showScreen('gameScreen');
        });
    }

    if (gameLogo) {
        const goHome = () => {
            const overlay = document.getElementById('gameOverScreen');
            if (overlay) overlay.classList.add('hidden');
            showScreen('homeScreen');
        };

        gameLogo.addEventListener('click', goHome);
        gameLogo.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                goHome();
            }
        });
    }

    // ルール画面は削除されたため関連ハンドラは不要
});