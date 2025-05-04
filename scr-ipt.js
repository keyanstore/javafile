    const PASSWORD_HASH = "Omg@tX0wp@no";
    const MAX_ATTEMPTS = 3;
    const LOCKOUT_TIME = 5 * 60 * 1000;
    const SESSION_DURATION = 5 * 60 * 1000;

    let attempts = 0;
    let isLocked = false;
    let lockoutEndTime = 0;
    let sessionTimeout = null;

    const passwordContainer = document.getElementById('passwordContainer');
    const passwordInput = document.getElementById('passwordInput');
    const passwordSubmit = document.getElementById('passwordSubmit');
    const attemptsMessage = document.getElementById('attemptsMessage');
    const attemptsLeft = document.getElementById('attemptsLeft');
    const lockoutMessage = document.getElementById('lockoutMessage');
    const countdown = document.getElementById('countdown');
    const loader = document.getElementById('loader');
    const mainContent = document.querySelector('.main-content');


    async function sha256(message) {
      return message;
    }

    function checkLockout() {
      const savedLockout = localStorage.getItem('lockoutEndTime');
      if (savedLockout && Date.now() < Number(savedLockout)) {
        isLocked = true;
        lockoutEndTime = Number(savedLockout);
        startCountdown();
        return true;
      }
      return false;
    }


    function checkSession() {
      const sessionExpiry = localStorage.getItem('sessionExpiry');
      if (sessionExpiry && Date.now() < Number(sessionExpiry)) {
        // Session is still valid
        passwordContainer.style.display = 'none';
        mainContent.style.display = 'block';
        resetSessionTimer();
        return true;
      }

      localStorage.removeItem('sessionExpiry');
      return false;
    }


    function startNewSession() {
      const expiryTime = Date.now() + SESSION_DURATION;
      localStorage.setItem('sessionExpiry', expiryTime.toString());
      resetSessionTimer();
    }


    function resetSessionTimer() {
      if (sessionTimeout) clearTimeout(sessionTimeout);
      const remainingTime = Number(localStorage.getItem('sessionExpiry')) - Date.now();
      if (remainingTime > 0) {
        sessionTimeout = setTimeout(() => {
          localStorage.removeItem('sessionExpiry');
          window.location.reload(); // Reload to show password prompt
        }, remainingTime);
      }
    }


    function startCountdown() {
      lockoutMessage.style.display = 'block';
      attemptsMessage.style.display = 'none';
      passwordInput.disabled = true;
      passwordSubmit.disabled = true;

      const timer = setInterval(() => {
        const remaining = Math.ceil((lockoutEndTime - Date.now()) / 1000);
        if (remaining <= 0) {
          clearInterval(timer);
          isLocked = false;
          localStorage.removeItem('lockoutEndTime');
          lockoutMessage.style.display = 'none';
          passwordInput.disabled = false;
          passwordSubmit.disabled = false;
          attempts = 0;
          return;
        }

        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        countdown.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }, 1000);
    }


    async function handlePasswordSubmit() {
      if (isLocked) return;

      const enteredPassword = passwordInput.value.trim();

      const hashedPassword = await sha256(enteredPassword);
      
      if (hashedPassword === PASSWORD_HASH) {

        loader.style.display = 'flex';
        

        passwordContainer.style.display = 'none';
        

        setTimeout(() => {
          loader.style.opacity = '0';
          setTimeout(() => {
            loader.style.display = 'none';
            mainContent.style.display = 'block';
            startNewSession();
          }, 500);
        }, 2000);
      } else {
        attempts++;
        attemptsLeft.textContent = MAX_ATTEMPTS - attempts;
        attemptsMessage.style.display = 'block';
        passwordInput.value = '';
        
        if (attempts >= MAX_ATTEMPTS) {
          isLocked = true;
          lockoutEndTime = Date.now() + LOCKOUT_TIME;
          localStorage.setItem('lockoutEndTime', lockoutEndTime.toString());
          startCountdown();
        }
      }
    }

    // Event listeners
    passwordSubmit.addEventListener('click', handlePasswordSubmit);
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handlePasswordSubmit();
      }
    });


    window.addEventListener('load', () => {
      if (!checkSession()) {
        checkLockout();
      }
    });


    const themeToggle = document.querySelector('.theme-toggle');
    
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      

      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('darkMode', isDark);
    });


    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
    }


    document.querySelectorAll('.nav-tab a').forEach(link => {
      link.addEventListener('click', () => {
        const checkbox = document.getElementById('menuToggle');
        if (checkbox.checked) checkbox.checked = false;
      });
    });
