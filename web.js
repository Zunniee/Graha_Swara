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
        const menuWrapper = document.getElementById('menu'); 
        const menuList = menuWrapper?.querySelector('ul');  

        const applyMenuLayout = () => {
          if (!menuWrapper) return;

          if (window.innerWidth < 768) {
            menuWrapper.classList.remove('show');
            document.body.classList.remove('no-scroll');
            hamburger.classList.remove('is-active');
          } else {
            // Force show menu on desktop
            menuWrapper.classList.add('show');
            document.body.classList.remove('no-scroll');
            hamburger.classList.remove('is-active');
          }
        };

        applyMenuLayout(); // Run on load

        if (hamburger && menuWrapper) {
          hamburger.addEventListener('click', () => {
            const isOpen = menuWrapper.classList.toggle('show');
            hamburger.classList.toggle('is-active');
            document.body.classList.toggle('no-scroll', isOpen);
          });

          window.addEventListener('resize', applyMenuLayout);
        }

        let lastScrollY = window.scrollY;
        const headerEl = document.querySelector('header');
        if (headerEl) {
          window.addEventListener('scroll', () => {
            if (document.getElementById('menu')?.classList.contains('show')) return;
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
              headerEl.classList.add('hide');
            } else {
              headerEl.classList.remove('hide');
            }
            lastScrollY = currentScrollY;
          });
        }

        document.querySelectorAll('.menu a').forEach(link => {
          link.addEventListener('click', () => {
            menuWrapper.classList.remove('show');
            hamburger.classList.remove('is-active');
            document.body.classList.remove('no-scroll');
          });
        });
      });
    });
});
