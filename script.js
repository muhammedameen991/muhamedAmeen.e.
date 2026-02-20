// Global motion preference check for accessibility and performance.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initPageTransition();
  initMobileNav();
  initScrollReveal();
  initMicroInteractions();
  initContactForm();
  initTransactionActivity();
  setCurrentYear();
});

function initPageTransition() {
  // Two RAF calls ensure the first frame paints before animating to "ready" state.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add('page-ready');
    });
  });
}

function initMobileNav() {
  const navToggle = document.getElementById('nav-toggle');
  const siteNav = document.getElementById('site-nav');

  if (!navToggle || !siteNav) {
    return;
  }

  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function initScrollReveal() {
  const revealTargets = document.querySelectorAll(
    'section .container, .stat-card, .service-card, .project-card, .process-card, .testimonial-card, .faq-item, .transaction-panel, .contact-card, .contact-form'
  );

  if (!revealTargets.length) {
    return;
  }

  revealTargets.forEach((target, index) => {
    target.classList.add('reveal');

    // Small stagger for smoother grouped reveal without heavy JS animations.
    const delay = (index % 4) * 70;
    target.style.transitionDelay = `${delay}ms`;
  });

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((target) => target.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, observerRef) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        observerRef.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  revealTargets.forEach((target) => observer.observe(target));
}

function initMicroInteractions() {
  const cards = document.querySelectorAll(
    '.stat-card, .service-card, .project-card, .process-card, .testimonial-card, .transaction-panel, .contact-card'
  );

  cards.forEach((card) => card.classList.add('interactive-card'));

  if (prefersReducedMotion || !window.matchMedia('(hover: hover)').matches) {
    return;
  }

  cards.forEach((card) => {
    let rafId = 0;

    const resetCard = () => {
      card.style.removeProperty('transform');
      card.style.removeProperty('--spot-x');
      card.style.removeProperty('--spot-y');
    };

    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;

      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        const rotateY = ((x / bounds.width) - 0.5) * 6;
        const rotateX = ((0.5 - (y / bounds.height)) * 6);

        card.style.setProperty('--spot-x', `${x}px`);
        card.style.setProperty('--spot-y', `${y}px`);
        card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });
    });

    card.addEventListener('pointerleave', () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      resetCard();
    });
  });
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const success = document.getElementById('form-success');
  const error = document.getElementById('form-error');

  if (!form || !submitBtn || !success || !error) {
    return;
  }

  const googleFormURL = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSflRXZrRr_cCyGBdfQo2WTqbEYaGsQgOWpzLXNiG2UxE0mpfw/formResponse';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    success.hidden = true;
    error.hidden = true;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const data = new FormData(form);

    try {
      await fetch(googleFormURL, {
        method: 'POST',
        body: data,
        mode: 'no-cors'
      });

      form.reset();
      success.hidden = false;

      setTimeout(() => {
        success.hidden = true;
      }, 5000);
    } catch (submitError) {
      error.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}

function initTransactionActivity() {
  const amountNode = document.getElementById('tx-amount');
  const directionNode = document.getElementById('tx-direction');
  const counterpartyNode = document.getElementById('tx-counterparty');
  const sessionBadge = document.getElementById('tx-session-badge');
  const progressBar = document.getElementById('tx-progress-bar');
  const loaderWrap = document.getElementById('tx-loader-wrap');
  const successWrap = document.getElementById('tx-success');
  const successText = document.getElementById('tx-success-text');
  const feed = document.getElementById('tx-feed');

  const stepElements = {
    send: document.getElementById('step-send'),
    receive: document.getElementById('step-receive'),
    process: document.getElementById('step-process'),
    success: document.getElementById('step-success')
  };

  const historyFlipCard = document.getElementById('history-flip-card');
  const historyFrontTitle = document.getElementById('history-front-title');
  const historyFrontAmount = document.getElementById('history-front-amount');
  const historyFrontMeta = document.getElementById('history-front-meta');
  const historyBackTitle = document.getElementById('history-back-title');
  const historyBackAmount = document.getElementById('history-back-amount');
  const historyBackMeta = document.getElementById('history-back-meta');
  const historyMini = document.getElementById('history-mini');

  if (
    !amountNode ||
    !directionNode ||
    !counterpartyNode ||
    !sessionBadge ||
    !progressBar ||
    !loaderWrap ||
    !successWrap ||
    !successText ||
    !feed ||
    !historyFlipCard ||
    !historyFrontTitle ||
    !historyFrontAmount ||
    !historyFrontMeta ||
    !historyBackTitle ||
    !historyBackAmount ||
    !historyBackMeta ||
    !historyMini
  ) {
    return;
  }

  const scenarios = [
    { mode: 'send', amount: '$480.00', counterparty: 'Product Design Partner' },
    { mode: 'receive', amount: '$1,240.00', counterparty: 'Client Milestone Release' },
    { mode: 'send', amount: '$95.00', counterparty: 'Cloud API Subscription' },
    { mode: 'receive', amount: '$860.00', counterparty: 'Sprint Delivery Payout' }
  ];

  let scenarioIndex = 0;
  let flipState = false;
  let timeouts = [];
  const historyEntries = [];

  const queueTimeout = (callback, delay) => {
    const timeoutId = setTimeout(callback, delay);
    timeouts.push(timeoutId);
  };

  const clearQueuedTimeouts = () => {
    timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    timeouts = [];
  };

  const setProgress = (value) => {
    progressBar.style.width = `${Math.max(0, Math.min(100, value))}%`;
  };

  const formatLabel = (item) => (item.mode === 'send' ? 'Sending Payment' : 'Receiving Payment');

  const formatMeta = (item) => `${item.mode === 'send' ? 'To' : 'From'} ${item.counterparty}`;

  const setStepState = (stepKey, state, label) => {
    const step = stepElements[stepKey];
    if (!step) {
      return;
    }

    step.dataset.state = state;

    const status = step.querySelector('.step-status');
    if (status) {
      status.textContent = label;
    }
  };

  const resetStepStates = () => {
    setStepState('send', 'pending', 'Queued');
    setStepState('receive', 'pending', 'Queued');
    setStepState('process', 'pending', 'Pending');
    setStepState('success', 'pending', 'Pending');
  };

  const setLoader = (visible) => {
    loaderWrap.hidden = !visible;
  };

  const setSuccess = (visible, text = 'Payment confirmed successfully') => {
    successWrap.hidden = !visible;
    successText.textContent = text;

    if (visible) {
      successWrap.classList.remove('show');
      // Reflow to restart checkmark draw animation every cycle.
      void successWrap.offsetWidth;
      successWrap.classList.add('show');
    } else {
      successWrap.classList.remove('show');
    }
  };

  const pushFeedItem = (item) => {
    const feedItem = document.createElement('li');
    const directionClass = item.mode === 'send' ? 'send' : 'receive';
    const directionText = item.mode === 'send' ? 'Sent' : 'Received';
    const amountSign = item.mode === 'send' ? '-' : '+';
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    feedItem.innerHTML = `
      <span class="feed-type ${directionClass}">${directionText}</span>
      <div>
        <p>${item.amount} ${item.mode === 'send' ? 'to' : 'from'} ${item.counterparty}</p>
        <small>${now}</small>
      </div>
      <strong>${amountSign}${item.amount}</strong>
    `;

    feed.prepend(feedItem);

    while (feed.children.length > 4) {
      feed.removeChild(feed.lastElementChild);
    }
  };

  const renderHistory = () => {
    const latest = historyEntries[0] || scenarios[0];
    const previous = historyEntries[1] || scenarios[1];

    historyFrontTitle.textContent = formatLabel(latest);
    historyFrontAmount.textContent = latest.amount;
    historyFrontMeta.textContent = formatMeta(latest);

    historyBackTitle.textContent = formatLabel(previous);
    historyBackAmount.textContent = previous.amount;
    historyBackMeta.textContent = formatMeta(previous);

    flipState = !flipState;
    historyFlipCard.classList.toggle('is-flipped', flipState);

    historyMini.innerHTML = '';

    historyEntries.slice(0, 3).forEach((entry) => {
      const row = document.createElement('li');
      row.innerHTML = `
        <div>
          <p>${formatLabel(entry)}</p>
          <span>${formatMeta(entry)}</span>
        </div>
        <strong>${entry.amount}</strong>
      `;
      historyMini.appendChild(row);
    });
  };

  const applyScenario = (item) => {
    amountNode.textContent = item.amount;
    directionNode.textContent = formatLabel(item);
    counterpartyNode.textContent = `${item.mode === 'send' ? 'To' : 'From'}: ${item.counterparty}`;
    sessionBadge.textContent = item.mode === 'send' ? 'Outbound' : 'Inbound';
  };

  const runCycle = () => {
    clearQueuedTimeouts();

    const scenario = scenarios[scenarioIndex % scenarios.length];
    scenarioIndex += 1;

    applyScenario(scenario);
    resetStepStates();
    setLoader(false);
    setSuccess(false);
    setProgress(7);

    const directionKey = scenario.mode === 'send' ? 'send' : 'receive';
    setStepState(directionKey, 'active', 'Live');

    queueTimeout(() => {
      setStepState(directionKey, 'complete', 'Done');
      setStepState('process', 'active', 'Running');
      setLoader(true);
      setProgress(58);
    }, 900);

    queueTimeout(() => {
      setLoader(false);
      setStepState('process', 'complete', 'Done');
      setStepState('success', 'active', 'Verifying');
      setSuccess(true, scenario.mode === 'send' ? 'Payment sent successfully' : 'Payment received successfully');
      setProgress(84);
    }, 2200);

    queueTimeout(() => {
      setStepState('success', 'complete', 'Confirmed');
      setProgress(100);

      historyEntries.unshift(scenario);
      if (historyEntries.length > 6) {
        historyEntries.length = 6;
      }

      pushFeedItem(scenario);
      renderHistory();
    }, 3050);

    queueTimeout(() => {
      setSuccess(false);
    }, 4700);

    queueTimeout(runCycle, 5600);
  };

  runCycle();

  // Prevent orphaned timers if the page is closed or refreshed.
  window.addEventListener('beforeunload', clearQueuedTimeouts, { once: true });
}

function setCurrentYear() {
  const year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }
}
