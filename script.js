/**
 * Sister Birthday Animated Story — Core Engine & Motion Controller
 * HTML5, CSS3, ES6 JavaScript
 */

(() => {
  'use strict';

  // --- Scene Titles & Metadata ---
  const SCENE_TITLES = [
    'Prologue',
    'Our Bond',
    'Family Love',
    'Little Details',
    'Golden Moments',
    'Your Own Light',
    'Secret Surprise',
    'Heartfelt Letter',
    'Grand Finale'
  ];

  // --- DOM Elements ---
  const scenes = Array.from(document.querySelectorAll('.screen'));
  const progress = document.getElementById('progress');
  const counter = document.getElementById('sceneCounter');
  const sceneTitle = document.getElementById('sceneTitle');
  const chapterDotsContainer = document.getElementById('chapterDots');
  const playButton = document.getElementById('playButton');
  const prevButton = document.getElementById('prevButton');
  const nextButton = document.getElementById('nextButton');
  const beginButton = document.getElementById('beginButton');
  const movieModeButton = document.getElementById('movieModeButton');
  const replayButton = document.getElementById('replayButton');
  const fireworksBlastBtn = document.getElementById('fireworksBlastBtn');
  const confettiBurstBtn = document.getElementById('confettiBurstBtn');
  
  // Transition Overlay Elements
  const cinematicWipe = document.getElementById('cinematicWipe');
  const vignettePulse = document.getElementById('vignettePulse');
  const autoplayBanner = document.getElementById('autoplayBanner');

  // Audio Elements
  const musicButton = document.getElementById('musicButton');
  const musicStatusText = document.getElementById('musicStatusText');
  const musicInput = document.getElementById('musicInput');
  const music = document.getElementById('backgroundMusic');
  
  // Theme & Navigation
  const themeButton = document.getElementById('themeButton');
  const themeDropdown = document.getElementById('themeDropdown');
  const themeBg = document.getElementById('themeBg');
  const themeOptions = Array.from(document.querySelectorAll('.theme-option'));
  const fullscreenButton = document.getElementById('fullscreenButton');
  const toast = document.getElementById('toast');

  // Gift Box
  const giftBox = document.getElementById('giftBox');
  const giftReveal = document.getElementById('giftReveal');

  // Lightbox
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.querySelector('.lightbox-backdrop');

  // Canvas
  const fireworksCanvas = document.getElementById('fireworksCanvas');
  const ctx = fireworksCanvas ? fireworksCanvas.getContext('2d') : null;

  // --- State Variables ---
  let currentScene = 0;
  let isPlayingSlideshow = false;
  let slideshowTimer = null;
  const SCENE_DURATION_MS = 14500; // ~14.5s per scene perfectly balances a 2m 11s song across 9 scenes
  let isAudioPlaying = false;
  let isGiftOpened = false;
  let hasUserInteracted = false;

  // --- Toast Notification ---
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // --- Chapter Dots Generation ---
  function initChapterDots() {
    if (!chapterDotsContainer) return;
    chapterDotsContainer.innerHTML = '';
    scenes.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = `chapter-dot ${index === 0 ? 'active' : ''}`;
      dot.setAttribute('title', SCENE_TITLES[index] || `Scene ${index + 1}`);
      dot.addEventListener('click', () => showScene(index));
      chapterDotsContainer.appendChild(dot);
    });
  }

  function updateChapterDots() {
    const dots = document.querySelectorAll('.chapter-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentScene);
    });
  }

  // --- Cinematic Transition Trigger ---
  function triggerSceneTransitionEffects() {
    // 1. Golden Light Sweep Wipe
    if (cinematicWipe) {
      cinematicWipe.classList.remove('active');
      void cinematicWipe.offsetWidth; // force DOM reflow
      cinematicWipe.classList.add('active');
    }

    // 2. Vignette Depth Bloom
    if (vignettePulse) {
      vignettePulse.classList.remove('active');
      void vignettePulse.offsetWidth;
      vignettePulse.classList.add('active');
    }
  }

  // --- Scene Switching Engine ---
  function showScene(index) {
    if (index === currentScene && scenes[index].classList.contains('active')) return;

    // Trigger visual light sweep transition
    triggerSceneTransitionEffects();

    currentScene = (index + scenes.length) % scenes.length;

    scenes.forEach((scene, i) => {
      const isActive = i === currentScene;
      scene.classList.toggle('active', isActive);
      if (isActive) {
        // Re-trigger entrance animations
        const reveals = scene.querySelectorAll('.reveal');
        reveals.forEach(el => {
          el.style.animation = 'none';
          void el.offsetWidth; // trigger reflow
          el.style.animation = '';
        });
      }
    });

    // Update Progress Bar & Counter
    const progressPercent = ((currentScene + 1) / scenes.length) * 100;
    if (progress) progress.style.width = `${progressPercent}%`;
    if (counter) counter.textContent = `${String(currentScene + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;
    if (sceneTitle) sceneTitle.textContent = SCENE_TITLES[currentScene] || '';

    updateChapterDots();

    // Trigger scene-specific animations
    if (currentScene === 6 && !isGiftOpened) {
      if (isPlayingSlideshow) {
        setTimeout(openGiftBox, 2000);
      }
    } else if (currentScene === 8) {
      triggerGrandCelebration();
    }

    // Reset timer if playing
    if (isPlayingSlideshow) {
      restartSlideshowTimer();
    }
  }

  // --- Slideshow / Movie Mode Timer ---
  function stopSlideshowTimer() {
    if (slideshowTimer) {
      clearInterval(slideshowTimer);
      slideshowTimer = null;
    }
  }

  function restartSlideshowTimer() {
    stopSlideshowTimer();
    if (!isPlayingSlideshow) return;

    slideshowTimer = setInterval(() => {
      if (currentScene === scenes.length - 1) {
        stopSlideshowTimer();
        isPlayingSlideshow = false;
        updatePlayButtonUI();
        showToast("Reaching the grand finale! Click Replay to watch again.");
        return;
      }
      showScene(currentScene + 1);
    }, SCENE_DURATION_MS);
  }

  function startSlideshow() {
    isPlayingSlideshow = true;
    updatePlayButtonUI();
    restartSlideshowTimer();
  }

  function pauseSlideshow() {
    isPlayingSlideshow = false;
    updatePlayButtonUI();
    stopSlideshowTimer();
  }

  function toggleSlideshow() {
    if (isPlayingSlideshow) {
      pauseSlideshow();
    } else {
      startSlideshow();
    }
  }

  function updatePlayButtonUI() {
    if (!playButton) return;
    playButton.textContent = isPlayingSlideshow ? 'Ⅱ' : '▶';
    playButton.setAttribute('title', isPlayingSlideshow ? 'Pause Slideshow (Spacebar)' : 'Play Slideshow (Spacebar)');
  }

  // --- Automatic Music Playback Engine ---
  function playAudio() {
    if (!music) return;
    hasUserInteracted = true;
    if (autoplayBanner) autoplayBanner.classList.remove('show');

    // Smooth audio fade-in
    music.volume = 0;
    const playPromise = music.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        isAudioPlaying = true;
        document.body.classList.add('audio-playing');
        document.body.classList.remove('audio-paused');
        if (musicStatusText) musicStatusText.textContent = 'Music On';

        // Fade in to 1.0 volume
        let vol = 0;
        const fadeInInterval = setInterval(() => {
          vol += 0.1;
          if (vol >= 1.0) {
            music.volume = 1.0;
            clearInterval(fadeInInterval);
          } else {
            music.volume = vol;
          }
        }, 50);

      }).catch(() => {
        // Autoplay blocked by browser policy until user gesture
        isAudioPlaying = false;
        document.body.classList.remove('audio-playing');
        document.body.classList.add('audio-paused');
        if (musicStatusText) musicStatusText.textContent = 'Play Song';
        showAutoplayBanner();
      });
    }
  }

  function pauseAudio() {
    if (!music) return;
    music.pause();
    isAudioPlaying = false;
    document.body.classList.remove('audio-playing');
    document.body.classList.add('audio-paused');
    if (musicStatusText) musicStatusText.textContent = 'Song Paused';
  }

  function toggleAudio() {
    if (music.paused) {
      playAudio();
      showToast("♫ Playing background music");
    } else {
      pauseAudio();
      showToast("Music paused");
    }
  }

  function showAutoplayBanner() {
    if (autoplayBanner && !hasUserInteracted) {
      autoplayBanner.classList.add('show');
    }
  }

  // Attempt instant autoplay and set up first-interaction listener
  function setupAutoplay() {
    // 1. Try immediate automatic play
    playAudio();

    // 2. Global first-touch listener: the moment user clicks, taps, or presses any key anywhere, start music
    const firstInteractionHandler = () => {
      if (!hasUserInteracted || music.paused) {
        playAudio();
      }
      window.removeEventListener('pointerdown', firstInteractionHandler);
      window.removeEventListener('keydown', firstInteractionHandler);
      window.removeEventListener('touchstart', firstInteractionHandler);
    };

    window.addEventListener('pointerdown', firstInteractionHandler, { once: true });
    window.addEventListener('keydown', firstInteractionHandler, { once: true });
    window.addEventListener('touchstart', firstInteractionHandler, { once: true });

    if (autoplayBanner) {
      autoplayBanner.addEventListener('click', (e) => {
        e.stopPropagation();
        playAudio();
      });
      const dismissBtn = autoplayBanner.querySelector('.autoplay-dismiss');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          autoplayBanner.classList.remove('show');
        });
      }
    }
  }

  // --- Movie Mode (All-in-One Experience) ---
  function launchMovieMode() {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    playAudio();
    showScene(1);
    startSlideshow();
    showToast("🎬 Movie Mode Started — Enjoy every memory!");
  }

  // --- 3D Gift Box Interaction ---
  function openGiftBox() {
    if (!giftBox) return;
    giftBox.classList.add('opened');
    if (giftReveal) giftReveal.classList.add('revealed');
    isGiftOpened = true;
    launchConfettiBlast(window.innerWidth / 2, window.innerHeight / 2);
  }

  // --- Theme Picker ---
  function initThemePicker() {
    if (!themeButton || !themeDropdown) return;

    themeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = themeDropdown.classList.toggle('open');
      themeButton.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!themeDropdown.contains(e.target) && !themeButton.contains(e.target)) {
        themeDropdown.classList.remove('open');
        themeButton.setAttribute('aria-expanded', 'false');
      }
    });

    themeOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const theme = opt.dataset.theme;
        const bgPath = opt.dataset.bg;
        
        themeOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');

        document.body.setAttribute('data-theme', theme);
        if (themeBg && bgPath) {
          themeBg.style.opacity = '0';
          setTimeout(() => {
            themeBg.style.backgroundImage = `url('${bgPath}')`;
            themeBg.style.opacity = '0.38';
          }, 400);
        }

        themeDropdown.classList.remove('open');
        showToast(`Theme changed to ${opt.textContent.trim()}`);
      });
    });
  }

  // --- Lightbox Inspector ---
  function initLightbox() {
    const expandButtons = document.querySelectorAll('.photo-expand-btn');
    expandButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const frame = btn.closest('.photo-frame');
        const img = frame ? frame.querySelector('img') : null;
        if (!img) return;

        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = img.alt || 'Cherished Memory';
        lightboxModal.classList.add('open');
        lightboxModal.setAttribute('aria-hidden', 'false');
      });
    });

    function closeLightbox() {
      if (!lightboxModal) return;
      lightboxModal.classList.remove('open');
      lightboxModal.setAttribute('aria-hidden', 'true');
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('open')) {
        closeLightbox();
      }
    });
  }

  // --- Dynamic Star Field Generator ---
  function initStars() {
    const starLayer = document.getElementById('stars');
    if (!starLayer) return;
    const fragment = document.createDocumentFragment();
    const count = 90;

    for (let i = 0; i < count; i++) {
      const star = document.createElement('span');
      star.className = 'particle';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      const duration = 2.5 + Math.random() * 4.5;
      star.style.setProperty('--duration', `${duration}s`);
      star.style.animationDelay = `${Math.random() * 5}s`;
      const size = 1.5 + Math.random() * 2;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      fragment.appendChild(star);
    }
    starLayer.appendChild(fragment);
  }

  // --- Interactive 3D Tilt on Photo Frames ---
  function initPhotoTilt() {
    // Only apply hover tilt on pointer/mouse devices
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const frames = document.querySelectorAll('.photo-frame');
      frames.forEach(frame => {
        frame.addEventListener('mousemove', (e) => {
          const rect = frame.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          const rotateX = (-y / rect.height) * 10;
          const rotateY = (x / rect.width) * 10;
          frame.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        frame.addEventListener('mouseleave', () => {
          frame.style.transform = '';
        });
      });
    }
  }

  // --- Fireworks & Confetti Physics System ---
  let particles = [];
  function resizeCanvas() {
    if (!fireworksCanvas) return;
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
  }

  class Particle {
    constructor(x, y, color, speed, angle, friction, gravity, decay) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.speed = speed;
      this.angle = angle;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.friction = friction || 0.96;
      this.gravity = gravity || 0.45;
      this.alpha = 1;
      this.decay = decay || 0.015;
      this.size = Math.random() * 3 + 2;
    }

    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }

    draw(context) {
      context.save();
      context.globalAlpha = Math.max(0, this.alpha);
      context.fillStyle = this.color;
      context.shadowColor = this.color;
      context.shadowBlur = 8;
      context.beginPath();
      context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
  }

  function launchConfettiBlast(originX, originY) {
    if (!ctx) return;
    const colors = ['#e9c987', '#f4a6c0', '#ffffff', '#eab308', '#ec4899', '#38bdf8', '#a855f7'];
    const count = 75;

    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const speed = Math.random() * 12 + 4;
      const angle = Math.random() * Math.PI * 2;
      particles.push(new Particle(originX, originY, color, speed, angle, 0.94, 0.35, 0.018));
    }
  }

  function triggerGrandCelebration() {
    if (!ctx) return;
    const w = fireworksCanvas.width;
    const h = fireworksCanvas.height;
    
    launchConfettiBlast(w * 0.25, h * 0.4);
    launchConfettiBlast(w * 0.75, h * 0.35);
    setTimeout(() => launchConfettiBlast(w * 0.5, h * 0.3), 300);
    setTimeout(() => launchConfettiBlast(w * 0.35, h * 0.45), 700);
    setTimeout(() => launchConfettiBlast(w * 0.65, h * 0.4), 1100);
  }

  function animateParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(ctx);
      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(animateParticles);
  }

  // --- Mobile Touch Gestures ---
  let touchStartX = 0;
  let touchStartY = 0;
  function initTouchGestures() {
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const diffX = e.changedTouches[0].clientX - touchStartX;
      const diffY = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          showScene(currentScene + 1); // Swipe left = next
        } else {
          showScene(currentScene - 1); // Swipe right = prev
        }
      }
    }, { passive: true });
  }

  // --- Event Listeners Initialization ---
  function initEventListeners() {
    // Navigation
    if (beginButton) {
      beginButton.addEventListener('click', () => {
        playAudio();
        showScene(1);
        startSlideshow();
      });
    }

    if (movieModeButton) {
      movieModeButton.addEventListener('click', launchMovieMode);
    }

    if (replayButton) {
      replayButton.addEventListener('click', () => {
        showScene(0);
        startSlideshow();
      });
    }

    if (prevButton) prevButton.addEventListener('click', () => showScene(currentScene - 1));
    if (nextButton) nextButton.addEventListener('click', () => showScene(currentScene + 1));
    if (playButton) playButton.addEventListener('click', toggleSlideshow);

    // Fullscreen
    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', async () => {
        try {
          if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            showToast("Entered Fullscreen");
          } else {
            await document.exitFullscreen();
          }
        } catch {
          showToast("Fullscreen not supported in this browser mode.");
        }
      });
    }

    // Music Button
    if (musicButton) {
      musicButton.addEventListener('click', toggleAudio);
    }

    // Custom Music File Option
    if (musicInput) {
      musicInput.addEventListener('change', () => {
        const file = musicInput.files && musicInput.files[0];
        if (!file) return;
        music.src = URL.createObjectURL(file);
        playAudio();
        showToast("Playing custom audio file!");
      });
    }

    // Gift Box Interaction
    if (giftBox) {
      giftBox.addEventListener('click', openGiftBox);
      giftBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openGiftBox();
        }
      });
    }

    if (confettiBurstBtn) {
      confettiBurstBtn.addEventListener('click', () => {
        triggerGrandCelebration();
        showToast("🎉 Celebrations continue!");
      });
    }

    if (fireworksBlastBtn) {
      fireworksBlastBtn.addEventListener('click', () => {
        triggerGrandCelebration();
        showToast("🎆 Sparkling fireworks for your sister!");
      });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      if (['INPUT', 'TEXTAREA'].includes(activeTag)) return;

      if (e.code === 'ArrowRight') {
        showScene(currentScene + 1);
      } else if (e.code === 'ArrowLeft') {
        showScene(currentScene - 1);
      } else if (e.code === 'Space') {
        e.preventDefault();
        toggleSlideshow();
      } else if (e.code === 'KeyM') {
        toggleAudio();
      } else if (e.code === 'KeyF') {
        fullscreenButton.click();
      }
    });

    // Resize and orientation handling
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => {
      setTimeout(resizeCanvas, 200);
    });
  }

  // --- Bootstrap Everything ---
  function init() {
    initChapterDots();
    initStars();
    initThemePicker();
    initLightbox();
    initPhotoTilt();
    initTouchGestures();
    initEventListeners();
    resizeCanvas();
    animateParticles();

    // Start on Scene 0
    showScene(0);

    // Initial audio state & eager autoplay trigger
    document.body.classList.add('audio-paused');
    setupAutoplay();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
