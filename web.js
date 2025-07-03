document.addEventListener('DOMContentLoaded', () => {
  console.log('Script loaded. Customize this logic as needed!');
});

document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('menu').querySelector('ul');
  const hamburger = document.getElementById('hamburger');

  hamburger.addEventListener('click', () => {
    menu.classList.toggle('show');
  });
});
