const bubbleBg = document.getElementById('bubble-bg');

function createBubble() {
  const bubble = document.createElement('div');
  bubble.classList.add('bubble');

  const size = Math.random() * 60 + 20; // 20–80px
  bubble.style.width = size + 'px';
  bubble.style.height = size + 'px';

  bubble.style.left = Math.random() * 100 + '%';

  const duration = Math.random() * 10 + 8; // 8–18 секунд
  bubble.style.animationDuration = duration + 's';

  bubble.style.opacity = Math.random() * 0.5 + 0.2;

  bubbleBg.appendChild(bubble);

  // удалить после окончания анимации
  setTimeout(() => {
    bubble.remove();
  }, duration * 1000);
}

// создавать пузыри каждые 400 мс
setInterval(createBubble, 400);