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

      requestAnimationFrame(() => {
        const hamburger = document.getElementById('hamburger');
        const menu = document.getElementById('menu')?.querySelector('ul');

        const applyMenuLayout = () => {
          if (!menu) return;
          if (window.innerWidth < 768) {
            menu.classList.remove('show');
          } else {
            menu.classList.add('show');
          }
        };

        applyMenuLayout(); // Run on load

        if (hamburger && menu) {
          hamburger.addEventListener('click', () => {
            menu.classList.toggle('show');
          });

          window.addEventListener('resize', applyMenuLayout);
        }

        let lastScrollY = window.scrollY;
        const headerEl = document.querySelector('header');
        if (headerEl) {
          window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
              headerEl.classList.add('hide');
            } else {
              headerEl.classList.remove('hide');
            }
            lastScrollY = currentScrollY;
          });
        }
      });
    });
});
