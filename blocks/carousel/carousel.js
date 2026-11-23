export default function decorate(block) {
  const slides = [...block.children];

  if (!slides.length) return;

  slides.forEach((slide, index) => {
    slide.classList.add('carousel-slide');
    slide.hidden = index !== 0;
  });

  const controls = document.createElement('div');
  controls.className = 'carousel-controls';

  const previous = document.createElement('button');
  previous.type = 'button';
  previous.textContent = 'Previous';
  previous.setAttribute('aria-label', 'Previous slide');

  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = 'Next';
  next.setAttribute('aria-label', 'Next slide');

  const status = document.createElement('span');
  status.className = 'carousel-status';
  status.setAttribute('aria-live', 'polite');

  let currentIndex = 0;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.hidden = i !== currentIndex;
    });

    status.textContent = `${currentIndex + 1} / ${slides.length}`;
  }

  previous.addEventListener('click', () => {
    showSlide(currentIndex - 1);
  });

  next.addEventListener('click', () => {
    showSlide(currentIndex + 1);
  });

  controls.append(previous, status, next);

  block.append(controls);

  showSlide(0);
}
