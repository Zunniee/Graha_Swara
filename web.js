document.addEventListener('DOMContentLoaded', () => {
  fetch('layout.html')
    .then(res => res.text())
    .then(html => {
      const layoutContainer = document.getElementById('layout');
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const header = tempDiv.querySelector('header');
      const footer = tempDiv.querySelector('footer');
      const pageContent = document.getElementById('page-content');

      layoutContainer.innerHTML = '';
      if (header) layoutContainer.appendChild(header);
      if (pageContent) layoutContainer.appendChild(pageContent.content.cloneNode(true));
      if (footer) layoutContainer.appendChild(footer);

      // Hamburger toggle
      const hamburger = document.getElementById('hamburger');
      const menu = document.getElementById('menu')?.querySelector('ul');
      if (hamburger && menu) {
        hamburger.addEventListener('click', () => {
          menu.classList.toggle('show');
        });
      }
    });
});
