document.addEventListener('DOMContentLoaded', () => {
  // Load layout first
  fetch('layout.html')
    .then(res => res.text())
    .then(html => {
      const layoutContainer = document.getElementById('layout');
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const preloader = tempDiv.querySelector('#preloader');
      const header = tempDiv.querySelector('header');
      const footer = tempDiv.querySelector('footer');
      const pageContent = document.getElementById('page-content');

      layoutContainer.innerHTML = '';
      
      // Add preloader first
      if (preloader) layoutContainer.appendChild(preloader);
      if (header) layoutContainer.appendChild(header);
      if (pageContent) layoutContainer.appendChild(pageContent.content.cloneNode(true));
      if (footer) layoutContainer.appendChild(footer);

      // Initialize everything after layout is loaded
      initializeApp();
    });

  function initializeApp() {
    // Simple preloader management
    const preloader = document.getElementById('preloader');
    
    function hidePreloader() {
      if (preloader) {
        document.body.classList.add('loaded');
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 500);
      }
    }

    // Hide preloader after a reasonable time or when images load
    const images = document.querySelectorAll('img');
    let loadedImages = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
      // No images, hide immediately
      setTimeout(hidePreloader, 800);
    } else {
      images.forEach(img => {
        if (img.complete) {
          loadedImages++;
        } else {
          img.addEventListener('load', () => {
            loadedImages++;
            if (loadedImages === totalImages) {
              setTimeout(hidePreloader, 500);
            }
          });
          img.addEventListener('error', () => {
            loadedImages++;
            if (loadedImages === totalImages) {
              setTimeout(hidePreloader, 500);
            }
          });
        }
      });

      // Check if all already loaded
      if (loadedImages === totalImages) {
        setTimeout(hidePreloader, 500);
      }

      // Fallback timeout
      setTimeout(hidePreloader, 3000);
    }

    // Initialize footer animations on scroll
    const footer = document.querySelector('.footer');
    if (footer) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            footer.classList.add('animate');
          }
        });
      }, { threshold: 0.1 });
      
      observer.observe(footer);
    }

    // Menu functionality
    const hamburger = document.getElementById('hamburger');
    const menuWrapper = document.getElementById('menu'); 

    const applyMenuLayout = () => {
      if (!menuWrapper) return;

      if (window.innerWidth < 768) {
        menuWrapper.classList.remove('show');
        document.body.classList.remove('no-scroll');
        hamburger.classList.remove('is-active');
      } else {
        menuWrapper.classList.add('show');
        document.body.classList.remove('no-scroll');
        hamburger.classList.remove('is-active');
      }
    };

    applyMenuLayout();

    if (hamburger && menuWrapper) {
      hamburger.addEventListener('click', () => {
        const isOpen = menuWrapper.classList.toggle('show');
        hamburger.classList.toggle('is-active');
        document.body.classList.toggle('no-scroll', isOpen);
      });

      window.addEventListener('resize', applyMenuLayout);
    }

    // Header hide/show on scroll
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

    // Close menu when clicking links
    document.querySelectorAll('.menu a').forEach(link => {
      link.addEventListener('click', () => {
        if (menuWrapper) {
          menuWrapper.classList.remove('show');
          document.body.classList.remove('no-scroll');
        }
        if (hamburger) {
          hamburger.classList.remove('is-active');
        }
      });
    });

    // Drag scroll functionality for product/moment lists
    function enableDragScroll(container) {
      let isDown = false;
      let startX;
      let scrollLeft;

      // Set cursor styles
      container.style.cursor = 'grab';

      const handleStart = (clientX) => {
        isDown = true;
        container.style.cursor = 'grabbing';
        startX = clientX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
      };

      const handleEnd = () => {
        if (isDown) {
          isDown = false;
          container.style.cursor = 'grab';
        }
      };

      const handleMove = (clientX) => {
        if (!isDown) return;
        const x = clientX - container.offsetLeft;
        const walk = (x - startX) * 1.5;
        container.scrollLeft = scrollLeft - walk;
      };

      // Mouse events
      container.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleStart(e.clientX);
      });

      container.addEventListener('mouseup', handleEnd);
      container.addEventListener('mouseleave', handleEnd);

      container.addEventListener('mousemove', (e) => {
        if (isDown) {
          e.preventDefault();
          handleMove(e.clientX);
        }
      });

      // Touch events
      container.addEventListener('touchstart', (e) => {
        handleStart(e.touches[0].clientX);
      }, { passive: true });

      container.addEventListener('touchend', handleEnd, { passive: true });
      container.addEventListener('touchcancel', handleEnd, { passive: true });

      container.addEventListener('touchmove', (e) => {
        if (isDown) {
          handleMove(e.touches[0].clientX);
        }
      }, { passive: true });
    }

    // Apply drag scroll to existing elements
    const prodList = document.getElementById('product-list');
    const momList = document.getElementById('moment-list');
    if (prodList) enableDragScroll(prodList);
    if (momList) enableDragScroll(momList);

    // Product page selector functionality
    initializeProductSelector();
  }

  function initializeProductSelector() {
    const productList = document.getElementById('product-list-page');
    const swipeArea = document.getElementById('swipe-area');
    const productItems = document.querySelectorAll('.product-item-page');
    
    if (!productList || !swipeArea || productItems.length === 0) return;

    let currentIndex = 0;
    let itemWidth = 116;
    let itemCenterOffset = 50;
    let baseTransform = 0;
    let currentTransform = 0;
    
    function calculateDimensions() {
      if (productItems.length > 0) {
        const firstItem = productItems[0];
        const computedStyle = window.getComputedStyle(firstItem);
        const itemActualWidth = firstItem.offsetWidth;
        const marginRight = parseInt(computedStyle.marginRight) || 0;
        const gap = parseInt(computedStyle.gap) || 16;
        itemWidth = itemActualWidth + Math.max(marginRight, gap);
        itemCenterOffset = itemActualWidth / 2;
      }
    }

    function calculateBaseTransform() {
      const container = productList.parentElement;
      const containerWidth = container.offsetWidth;
      const centerPosition = containerWidth / 2;
      const itemCenterPosition = (currentIndex * itemWidth) + itemCenterOffset;
      baseTransform = centerPosition - itemCenterPosition;
      currentTransform = baseTransform;
    }

    function updateDisplay() {
      const activeItem = productItems[currentIndex];
      const displayedImage = document.getElementById('displayed-image');
      const displayedName = document.getElementById('displayed-name');
      const displayedDescription = document.getElementById('displayed-description');
      
      if (displayedImage && displayedName && displayedDescription && activeItem) {
        displayedImage.src = activeItem.dataset.image;
        displayedName.textContent = activeItem.dataset.name;
        displayedDescription.textContent = activeItem.dataset.description;
      }
    }

    function updateSelector(smooth = true) {
      productItems.forEach((item, index) => {
        item.classList.toggle('active', index === currentIndex);
      });
      
      calculateBaseTransform();
      
      if (smooth) {
        productList.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      } else {
        productList.style.transition = 'none';
      }
      
      productList.style.transform = `translateX(${baseTransform}px)`;
      currentTransform = baseTransform;
    }

    function snapToNearestItem() {
      const container = productList.parentElement;
      const containerWidth = container.offsetWidth;
      const centerPosition = containerWidth / 2;
      
      let closestIndex = currentIndex;
      let minDistance = Infinity;
      
      for (let i = 0; i < productItems.length; i++) {
        const itemCenterPosition = (i * itemWidth) + itemCenterOffset;
        const itemScreenPosition = itemCenterPosition + currentTransform;
        const distanceFromCenter = Math.abs(itemScreenPosition - centerPosition);
        
        if (distanceFromCenter < minDistance) {
          minDistance = distanceFromCenter;
          closestIndex = i;
        }
      }
      
      if (closestIndex !== currentIndex) {
        currentIndex = closestIndex;
        updateDisplay();
      }
      
      updateSelector(true);
    }

    function goToProduct(index) {
      if (index >= 0 && index < productItems.length) {
        currentIndex = index;
        updateDisplay();
        updateSelector();
      }
    }

    // Initialize - ensure proper centering on load
    calculateDimensions();
    updateDisplay();
    // Use multiple timeouts to ensure proper centering
    setTimeout(() => {
      calculateDimensions();
      updateSelector(false);
    }, 50);
    
    setTimeout(() => {
      calculateDimensions();
      updateSelector(false);
    }, 200);
    
    setTimeout(() => {
      calculateDimensions();
      updateSelector(false);
    }, 500);

    // Enhanced drag/swipe handling with smooth animations
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let hasMoved = false;
    let isHorizontalSwipe = false;

    const handleStart = (clientX, clientY) => {
      isDragging = true;
      hasMoved = false;
      isHorizontalSwipe = false;
      startX = clientX;
      startY = clientY;
      lastX = clientX;
      productList.style.transition = 'none';
      productList.style.cursor = 'grabbing';
      swipeArea.style.cursor = 'grabbing';
    };

    const handleEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      
      productList.style.cursor = 'grab';
      swipeArea.style.cursor = 'grab';
      
      if (hasMoved && isHorizontalSwipe) {
        // Reduced sensitivity - require more movement
        const deltaX = lastX - startX;
        const velocity = Math.abs(deltaX) / 150; // Increased from 100 to 150
        const threshold = itemWidth * 0.4; // Increased from 0.25 to 0.4
        
        if (Math.abs(deltaX) > threshold || velocity > 3) { // Increased velocity threshold
          if (deltaX > 0 && currentIndex > 0) {
            currentIndex--;
          } else if (deltaX < 0 && currentIndex < productItems.length - 1) {
            currentIndex++;
          }
          updateDisplay();
        }
      }
      
      snapToNearestItem();
    };

    const handleMove = (clientX, clientY) => {
      if (!isDragging) return;
      
      const deltaX = clientX - startX;
      const deltaY = clientY - startY;
      
      if (!hasMoved && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
        hasMoved = true;
        isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      }
      
      if (hasMoved && isHorizontalSwipe) {
        let newTransform = baseTransform + deltaX;
        
        // Add resistance at edges
        const maxIndex = productItems.length - 1;
        if (currentIndex === 0 && deltaX > 0) {
          newTransform = baseTransform + (deltaX * 0.3);
        } else if (currentIndex === maxIndex && deltaX < 0) {
          newTransform = baseTransform + (deltaX * 0.3);
        }
        
        currentTransform = newTransform;
        productList.style.transform = `translateX(${newTransform}px)`;
        lastX = clientX;
      }
    };

    // Set initial cursor
    productList.style.cursor = 'grab';
    swipeArea.style.cursor = 'grab';

    // Mouse events
    swipeArea.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    });

    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('mouseleave', handleEnd);

    swipeArea.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        handleMove(e.clientX, e.clientY);
      }
    });

    // Touch events
    swipeArea.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    }, { passive: true });

    document.addEventListener('touchend', handleEnd, { passive: true });
    document.addEventListener('touchcancel', handleEnd, { passive: true });

    swipeArea.addEventListener('touchmove', (e) => {
      if (isDragging && isHorizontalSwipe) {
        e.preventDefault();
      }
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    });

    // Trackpad/wheel support with reduced sensitivity
    swipeArea.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        
        // Reduced sensitivity - require more deltaX movement
        if (e.deltaX > 30 && currentIndex < productItems.length - 1) {
          currentIndex++;
          updateDisplay();
          updateSelector();
        } else if (e.deltaX < -30 && currentIndex > 0) {
          currentIndex--;
          updateDisplay();
          updateSelector();
        }
      }
    }, { passive: false });

    // Click handlers
    productItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        if (!hasMoved) {
          goToProduct(index);
        }
      });
    });

    // Resize handler
    window.addEventListener('resize', () => {
      setTimeout(() => {
        calculateDimensions();
        updateSelector(false);
      }, 100);
    });
  }









  
   const track = document.querySelector('.moment-carousel-track');
const slides = Array.from(track.children);
const prev = document.getElementById('prev');
const next = document.getElementById('next');

let slideCount = slides.length;
let visibleSlides = 3;
let currentIndex = visibleSlides;
let slideWidth;

// Clone slides
for (let i = 0; i < visibleSlides; i++) {
  const cloneStart = slides[i].cloneNode(true);
  const cloneEnd = slides[slideCount - 1 - i].cloneNode(true);

  cloneStart.classList.add('clone', 'main-moment');
  cloneEnd.classList.add('clone', 'main-moment');

  track.appendChild(cloneStart);
  track.insertBefore(cloneEnd, track.firstChild);
}

const allSlides = Array.from(track.children);

function setSlideWidth() {
  const slideStyle = getComputedStyle(allSlides[0]);
  const gap = parseInt(getComputedStyle(track).gap) || 0;
  slideWidth = allSlides[0].offsetWidth + gap;
}

function moveToSlide(index, animate = true) {
  if (animate) {
    track.classList.add('animate');
  } else {
    track.classList.remove('animate');
  }

  const offset = slideWidth * index;
  track.style.transform = `translateX(-${offset}px)`;

  updateActiveClass(index);
}

function updateActiveClass(index) {
  allSlides.forEach(slide => slide.classList.remove('active'));
  const centerIndex = index + Math.floor(visibleSlides / 2);
  if (allSlides[centerIndex]) {
    allSlides[centerIndex].classList.add('active');
  }
}

function handleLooping() {
  if (currentIndex >= slideCount + visibleSlides) {
    currentIndex = visibleSlides;
    moveToSlide(currentIndex, false); // instant jump
  }

  if (currentIndex < visibleSlides) {
    currentIndex = slideCount + visibleSlides - 1;
    moveToSlide(currentIndex, false); // instant jump
  }
}

// Navigation
next.addEventListener('click', () => {
  currentIndex++;
  moveToSlide(currentIndex);
});

prev.addEventListener('click', () => {
  currentIndex--;
  moveToSlide(currentIndex);
});

track.addEventListener('transitionend', handleLooping);

window.addEventListener('resize', () => {
  setSlideWidth();
  moveToSlide(currentIndex, false);
});

// Init
setSlideWidth();
moveToSlide(currentIndex, false);

});