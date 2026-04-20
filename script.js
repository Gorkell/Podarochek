// Глобальные переменные
let currentPage = 1;
const totalPages = 5;
let quizPassed = false;
let pagesViewed = new Set();
let musicPlaying = false;
let musicStarted = false;
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const musicIcon = document.getElementById('music-icon');

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Скрыть прелоадер после загрузки
    setTimeout(() => {
        const preloader = document.querySelector('.preloader');
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
            // Пробуем запустить музыку после прелоадера
            tryStartMusic();
        }, 500);
    }, 1500);

    // Инициализация первой страницы
    showPage(1);
    
    // Добавить плавное появление элементов
    animatePageElements();
    
    // Инициализация обработчиков событий
    initEventListeners();
    
    // Обработчик для запуска музыки при первом взаимодействии
    const startMusicOnInteraction = () => {
        if (!musicStarted) {
            tryStartMusic();
        }
    };
    
    document.addEventListener('click', startMusicOnInteraction, { once: true });
    document.addEventListener('touchstart', startMusicOnInteraction, { once: true, passive: true });
});

// Попытка запустить музыку
function tryStartMusic() {
    if (!bgMusic || musicStarted) return;
    
    bgMusic.volume = 0.5;
    bgMusic.play().then(() => {
        musicPlaying = true;
        musicStarted = true;
        updateMusicButton();
    }).catch(err => {
        // Автовоспроизведение заблокировано, ждем взаимодействия
        console.log('Music autoplay blocked, waiting for user interaction');
    });
}

// Включить/выключить музыку
function toggleMusic() {
    if (!bgMusic) return;
    
    if (musicPlaying) {
        bgMusic.pause();
        musicPlaying = false;
    } else {
        bgMusic.volume = 0.5;
        bgMusic.play().then(() => {
            musicPlaying = true;
            musicStarted = true;
        });
    }
    updateMusicButton();
}

// Обновить иконку кнопки музыки
function updateMusicButton() {
    if (musicIcon) {
        musicIcon.textContent = musicPlaying ? '🎵' : '🔇';
    }
    if (musicToggle) {
        musicToggle.classList.toggle('playing', musicPlaying);
    }
}

// Показать страницу
function showPage(pageNum) {
    // Скрыть все страницы
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Показать текущую страницу
    const currentPageElement = document.getElementById(`page${pageNum}`);
    if (currentPageElement) {
        currentPageElement.classList.add('active');
        
        // Скролл наверх страницы
        currentPageElement.scrollTop = 0;
        
        // Обновить прогресс
        updateProgress(pageNum);
        
        // Добавить страницу в просмотренные
        pagesViewed.add(pageNum);
        
        // Анимировать элементы на странице
        animatePageElements();
        
        // Проверка доступа к секретной странице
        if (pageNum === 5 && !canAccessSecretPage()) {
            showPage(4);
            showNotification('Сначала посмотри все предыдущие страницы 💕');
        }
    }
}

// Переход к следующей странице
function nextPage() {
    if (currentPage < totalPages) {
        // Проверка для страницы 3 (тест)
        if (currentPage === 3 && !quizPassed) {
            showNotification('Сначала пройди тест правильно! 💗');
            return;
        }
        
        currentPage++;
        showPage(currentPage);
        
        // Особая анимация для секретной страницы
        if (currentPage === 5) {
            revealSecretPage();
        }
    }
}

// Обновить индикатор прогресса
function updateProgress(pageNum) {
    const progressIndicators = document.querySelectorAll('.progress-indicator');
    progressIndicators.forEach(indicator => {
        indicator.textContent = `${pageNum} / ${totalPages}`;
    });
}

// Анимировать элементы на текущей странице
function animatePageElements() {
    const elements = document.querySelectorAll('.page.active .fade-in');
    elements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.2}s`;
    });
}

// Инициализация обработчиков событий
function initEventListeners() {
    // Обработка клавиатуры
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' && currentPage < totalPages) {
            nextPage();
        } else if (e.key === 'ArrowLeft' && currentPage > 1) {
            previousPage();
        }
    });
    
    // Обработка свайпов на мобильных устройствах
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let touchStartTime = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        touchStartTime = new Date().getTime();
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        const diffTime = new Date().getTime() - touchStartTime;
        
        // Проверяем что это горизонтальный свайп (не вертикальный скролл)
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50 && diffTime < 300) {
            if (diffX < 0) {
                // Свайп влево - следующая страница
                if (currentPage < totalPages) {
                    nextPage();
                }
            } else {
                // Свайп вправо - предыдущая страница
                if (currentPage > 1) {
                    previousPage();
                }
            }
        }
    }
}

// Переход к предыдущей странице
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        showPage(currentPage);
    }
}

// Проверка ответов в тесте
function checkQuiz() {
    const q1Answer = document.querySelector('input[name="q1"]:checked');
    const q2Answer = document.querySelector('input[name="q2"]:checked');
    const q3Answers = document.querySelectorAll('input[name="q3"]:checked');
    
    const resultDiv = document.getElementById('quiz-result');
    const catPhoto = document.getElementById('cat-photo');
    const nextBtn = document.getElementById('next-after-quiz');
    
    // Проверка ответов
    let correct = 0;
    let total = 3;
    
    // Проверка вопроса 1
    if (q1Answer && q1Answer.value === 'Пост в вк') {
        correct++;
    }
    
    // Проверка вопроса 2
    if (q2Answer && q2Answer.value === 'Бывших') {
        correct++;
    }
    
    // Проверка вопроса 3 (должны быть выбраны все три варианта)
    const q3Values = Array.from(q3Answers).map(input => input.value);
    if (q3Values.length === 3 && 
        q3Values.includes('Здоровье') && 
        q3Values.includes('Любовь') && 
        q3Values.includes('Память')) {
        correct++;
    }
    
    // Показ результата
    if (correct === total) {
        resultDiv.className = 'quiz-result success';
        resultDiv.innerHTML = '🎉 Правильно, ты всё ещё знаешь нас лучше всех! 💕';
        quizPassed = true;
        
        // Показать фото кота
        setTimeout(() => {
            catPhoto.style.display = 'block';
            nextBtn.style.display = 'inline-block';
        }, 1000);
    } else {
        resultDiv.className = 'quiz-result error';
        resultDiv.innerHTML = 'Почти получилось, попробуй ещё раз 💗';
        quizPassed = false;
        
        // Скрыть фото кота и кнопку
        catPhoto.style.display = 'none';
        nextBtn.style.display = 'none';
    }
    
    // Плавное появление результата
    resultDiv.style.opacity = '0';
    setTimeout(() => {
        resultDiv.style.opacity = '1';
    }, 100);
}

// Проверка доступа к секретной странице
function canAccessSecretPage() {
    // Нужно просмотреть первые 4 страницы
    for (let i = 1; i <= 4; i++) {
        if (!pagesViewed.has(i)) {
            return false;
        }
    }
    return true;
}

// Раскрытие секретной страницы с анимацией
function revealSecretPage() {
    const secretElements = document.querySelectorAll('.fade-in-secret');
    
    secretElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'all 1s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 500);
    });
    
    // Добавить конфетти или дополнительные эффекты
    createConfetti();
}

// Создание конфетти (опционально)
function createConfetti() {
    const colors = ['#7dd87d', '#90ee90', '#c8f6c8', '#d4f8d4'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -10px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                animation: confettiFall 3s ease-in-out;
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 50);
    }
}

// CSS анимация для конфетти
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confettiFall {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyle);

// Показать уведомление
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 1.5rem 2rem;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(125, 216, 125, 0.4);
        z-index: 10000;
        text-align: center;
        font-size: 1rem;
        color: #2d5a2d;
        animation: notificationPop 0.5s ease;
        max-width: 90vw;
        width: max-content;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'notificationFade 0.5s ease';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 2000);
}

// CSS анимации для уведомлений
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes notificationPop {
        0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes notificationFade {
        0% {
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyle);

// Дополнительные интерактивные эффекты
document.addEventListener('DOMContentLoaded', function() {
    // Эффект параллакса для фона (только на десктопе, не на touch-устройствах)
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    
    if (!isTouchDevice) {
        document.addEventListener('mousemove', function(e) {
            const hearts = document.querySelectorAll('.floating-hearts .heart');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            hearts.forEach((heart, index) => {
                const speed = (index + 1) * 10;
                heart.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
            });
        });
    }
    
    // Эффект при наведении на карточки артов (desktop + touch)
    const artCards = document.querySelectorAll('.art-card');
    artCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02) rotate(1deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1) rotate(0deg)';
        });
        
        // Touch эффект для мобильных
        card.addEventListener('touchstart', function() {
            this.style.transform = 'translateY(-5px) scale(1.01)';
        }, { passive: true });
        
        card.addEventListener('touchend', function() {
            this.style.transform = 'translateY(0) scale(1)';
        }, { passive: true });
    });
    
    // Добавить интерактивность к фото на странице 2
    const photoCards = document.querySelectorAll('.photo-card');
    photoCards.forEach(card => {
        card.addEventListener('click', function() {
            this.style.animation = 'photoPulse 0.6s ease';
            setTimeout(() => {
                this.style.animation = '';
            }, 600);
        });
        
        // Touch эффект
        card.addEventListener('touchstart', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        }, { passive: true });
        
        card.addEventListener('touchend', function() {
            this.style.transform = 'translateY(0) scale(1)';
        }, { passive: true });
    });
    
    // Touch эффект для gallery-item
    const galleryItems = document.querySelectorAll('.gallery-item, .mosaic-item');
    galleryItems.forEach(item => {
        item.addEventListener('touchstart', function() {
            this.style.transform = 'translateY(-3px) scale(1.01)';
        }, { passive: true });
        
        item.addEventListener('touchend', function() {
            this.style.transform = '';
        }, { passive: true });
    });
});

// CSS анимация для пульсации фото
const photoPulseStyle = document.createElement('style');
photoPulseStyle.textContent = `
    @keyframes photoPulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
    }
`;
document.head.appendChild(photoPulseStyle);

// Функция для плавной прокрутки к элементу
function scrollToElement(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// Инициализация ленивой загрузки изображений
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Вызов ленивой загрузки
document.addEventListener('DOMContentLoaded', initLazyLoading);
