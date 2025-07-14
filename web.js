document.addEventListener('DOMContentLoaded', () => {
  fetch('layout.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('layout').innerHTML = html;

      // Re-attach hamburger toggle after layout is loaded
      const hamburger = document.getElementById('hamburger');
      const menu = document.getElementById('menu')?.querySelector('ul');

      if (hamburger && menu) {
        hamburger.addEventListener('click', () => {
          menu.classList.toggle('show');
        });
      }
    });
});
