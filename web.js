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
            const menuEl = document.getElementById('menu');
            const isMobile = window.innerWidth < 768;
            if (isMobile && menuEl?.classList.contains('show')) return;

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

        window.scrollSlider = function(id, direction) {
          const slider = document.getElementById(id);
          if (!slider) return;
          const scrollAmount = slider.clientWidth * 0.8;
          slider.scrollBy({
            left: scrollAmount * direction,
            behavior: 'smooth'
          });
        };

        function enableDragScroll(container) {
          let isDown = false;
          let startX;
          let scrollLeft;

          container.addEventListener('mousedown', (e) => {
            isDown = true;
            container.classList.add('dragging');
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
          });

          container.addEventListener('mouseleave', () => {
            isDown = false;
            container.classList.remove('dragging');
          });

          container.addEventListener('mouseup', () => {
            isDown = false;
            container.classList.remove('dragging');
          });

          container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 1.5;
            container.scrollLeft = scrollLeft - walk;
          });

          // Touch support
          container.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
          });

          container.addEventListener('touchend', () => {
            isDown = false;
          });

          container.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX - container.offsetLeft;
            const walk = (x - startX) * 1.5;
            container.scrollLeft = scrollLeft - walk;
          });
        }

        const prodList = document.getElementById('product-list');
        const momList = document.getElementById('moment-list');
        if (prodList) enableDragScroll(prodList);
        if (momList) enableDragScroll(momList);

        // Page fully loaded — hide preloader
        window.addEventListener('load', () => {
          document.body.classList.add('loaded');
        });

        // Transition loader when clicking links
        document.querySelectorAll('a[href]').forEach(link => {
          const isInternal =
            link.href.startsWith(window.location.origin) &&
            !link.href.endsWith('#') &&
            !link.target;

          if (isInternal) {
            link.addEventListener('click', e => {
              e.preventDefault();
              document.body.classList.remove('loaded'); // Show preloader
              setTimeout(() => {
                window.location.href = link.href;
              }, 400); // Match with CSS fade
            });
          }
        });
      });
    });
});
