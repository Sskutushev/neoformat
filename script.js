// ==================== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ====================
class TabSwitcher {
  constructor() {
    this.tabs = document.querySelectorAll('.tab');
    this.indicator = document.querySelector('.tab-indicator');
    this.loginForm = document.getElementById('login-form');
    this.registerForm = document.getElementById('register-form');
    
    this.init();
    this.restoreTabState(); // Restore tab state on load
  }
  
  init() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab));
    });
  }
  
  switchTab(clickedTab) {
    // Убираем active со всех табов
    this.tabs.forEach(tab => tab.classList.remove('active'));
    
    // Добавляем active к нажатому табу
    clickedTab.classList.add('active');
    
    // Двигаем индикатор
    const tabType = clickedTab.dataset.tab;
    if (tabType === 'register') {
      this.indicator.classList.add('move-right');
      this.loginForm.classList.remove('active');
      this.registerForm.classList.add('active');
    } else {
      this.indicator.classList.remove('move-right');
      this.registerForm.classList.remove('active');
      this.loginForm.classList.add('active');
    }
    localStorage.setItem('activeTab', tabType); // Save active tab
  }

  restoreTabState() {
    const activeTab = localStorage.getItem('activeTab');
    if (activeTab) {
      const tabToActivate = document.querySelector(`.tab[data-tab="${activeTab}"]`);
      if (tabToActivate) {
        this.switchTab(tabToActivate);
      } else {
        // Fallback to login if stored tab is invalid
        this.switchTab(document.querySelector('.tab[data-tab="login"]'));
      }
    } else {
      // Default to login tab if no state is stored
      this.switchTab(document.querySelector('.tab[data-tab="login"]'));
    }
  }
}

// ==================== ВАЛИДАЦИЯ ФОРМЫ ====================
class FormValidator {
  constructor(form) {
    this.form = form;
    this.rules = {
      name: {
        required: true,
        minLength: 2,
        pattern: /^[а-яА-ЯёЁa-zA-Z\s]+$/,
        messages: {
          required: 'Введите ваше имя',
          minLength: 'Минимум 2 символа',
          pattern: 'Только буквы и пробелы'
        }
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        messages: {
          required: 'Введите email',
          pattern: 'Некорректный email адрес'
        }
      },
      password: {
        required: true,
        minLength: 6,
        messages: {
          required: 'Введите пароль',
          minLength: 'Минимум 6 символов'
        }
      },
      confirmPassword: {
        required: true,
        match: 'password',
        messages: {
          required: 'Подтвердите пароль',
          match: 'Пароли не совпадают'
        }
      }
    };
    
    this.init();
  }
  
  init() {
    // Валидация при потере фокуса
    this.form.querySelectorAll('input').forEach(input => {
      input.addEventListener('blur', () => {
        if (input.value) {
          this.validateField(input);
        }
      });
      
      // Убираем ошибку при вводе
      input.addEventListener('input', () => {
        this.clearError(input);
      });
    });
    
    // Обработка отправки формы
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }
  
  validateField(input) {
    const fieldName = input.name;
    const value = input.value.trim();
    const rules = this.rules[fieldName];
    
    if (!rules) return true;
    
    // Проверка required
    if (rules.required && !value) {
      this.showError(input, rules.messages.required);
      return false;
    }
    
    // Проверка minLength
    if (rules.minLength && value.length < rules.minLength) {
      this.showError(input, rules.messages.minLength);
      return false;
    }
    
    // Проверка pattern
    if (rules.pattern && !rules.pattern.test(value)) {
      this.showError(input, rules.messages.pattern);
      return false;
    }
    
    // Проверка совпадения паролей
    if (rules.match) {
      const matchInput = this.form.querySelector(`[name="${rules.match}"]`);
      if (value !== matchInput.value) {
        this.showError(input, rules.messages.match);
        return false;
      }
    }
    
    this.showSuccess(input);
    return true;
  }
  
  showError(input, message) {
    const inputGroup = input.closest('.input-group');
    const errorMessage = inputGroup.querySelector('.error-message');
    
    inputGroup.classList.remove('success');
    inputGroup.classList.add('error');
    errorMessage.textContent = message;
    
    // Вибрация на мобильных (если поддерживается)
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  }
  
  showSuccess(input) {
    const inputGroup = input.closest('.input-group');
    inputGroup.classList.remove('error');
    inputGroup.classList.add('success');
  }
  
  clearError(input) {
    const inputGroup = input.closest('.input-group');
    inputGroup.classList.remove('error');
  }
  
  validateAll() {
    let isValid = true;
    
    this.form.querySelectorAll('input[required]').forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    // Проверка чекбоксов (для регистрации)
    const requiredCheckboxes = this.form.querySelectorAll('input[type="checkbox"][required]');
    requiredCheckboxes.forEach(checkbox => {
      if (!checkbox.checked) {
        isValid = false;
        const label = checkbox.closest('.checkbox-wrapper');
        label.style.animation = 'shake 0.4s';
        setTimeout(() => label.style.animation = '', 400);
      }
    });
    
    return isValid;
  }
  
  handleSubmit(e) {
    e.preventDefault();
    
    if (!this.validateAll()) {
      return;
    }
    
    this.submitForm();
  }
  
  submitForm() {
    const button = this.form.querySelector('.btn-submit');
    button.classList.add('loading');
    
    // Имитация отправки на сервер
    setTimeout(() => {
      button.classList.remove('loading');
      this.showSuccessModal();
      this.form.reset();
      
      // Убираем все статусы валидации
      this.form.querySelectorAll('.input-group').forEach(group => {
        group.classList.remove('success', 'error');
      });
    }, 2000);
  }
  
  showSuccessModal() {
    // Создаем модалку успеха
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
      <div class="success-content">
        <div class="success-icon">✓</div>
        <h3>Успешно!</h3>
        <p>Данные успешно отправлены</p>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Стили для модалки
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s;
    `;
    
    const content = modal.querySelector('.success-content');
    content.style.cssText = `
      background: var(--bg-main);
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      box-shadow: 
        20px 20px 60px var(--shadow-dark),
        -20px -20px 60px var(--shadow-light);
      animation: slideUp 0.5s;
    `;
    
    // Удаляем модалку через 2 секунды
    setTimeout(() => {
      modal.style.animation = 'fadeOut 0.3s';
      setTimeout(() => modal.remove(), 300);
    }, 2000);
  }
}

// ==================== ПОКАЗ/СКРЫТИЕ ПАРОЛЯ ====================
class PasswordToggle {
  constructor() {
    this.toggleButtons = document.querySelectorAll('.toggle-password');
    this.init();
  }
  
  init() {
    this.toggleButtons.forEach(button => {
      button.addEventListener('click', () => this.toggle(button));
    });
  }
  
  toggle(button) {
    const input = button.previousElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('icon-eye');
      icon.classList.add('icon-eye-off');
    } else {
      input.type = 'password';
      icon.classList.remove('icon-eye-off');
      icon.classList.add('icon-eye');
    }
  }
}

// ==================== ИНДИКАТОР СИЛЫ ПАРОЛЯ ====================
class PasswordStrength {
  constructor() {
    this.passwordInputs = document.querySelectorAll('input[name="password"]');
    this.init();
  }
  
  init() {
    this.passwordInputs.forEach(input => {
      // Только для формы регистрации
      if (input.closest('#register-form')) {
        input.addEventListener('input', () => this.checkStrength(input));
      }
    });
  }
  
  checkStrength(input) {
    const value = input.value;
    const strengthBar = input.closest('.input-group').querySelector('.strength-bar');
    const strengthText = input.closest('.input-group').querySelector('.strength-text');
    
    if (!strengthBar) return;
    
    let strength = 0;
    
    // Проверки
    if (value.length >= 6) strength++;
    if (value.length >= 10) strength++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
    if (/\d/.test(value)) strength++;
    if (/[^a-zA-Z\d]/.test(value)) strength++;
    
    // Устанавливаем класс
    strengthBar.className = 'strength-bar';
    
    if (strength <= 2) {
      strengthBar.classList.add('weak');
      strengthText.textContent = 'Слабый';
      strengthText.style.color = '#ff6b6b';
    } else if (strength <= 4) {
      strengthBar.classList.add('medium');
      strengthText.textContent = 'Средний';
      strengthText.style.color = '#feca57';
    } else {
      strengthBar.classList.add('strong');
      strengthText.textContent = 'Сильный';
      strengthText.style.color = '#48dbfb';
    }
  }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', () => {
  new TabSwitcher();
  
  // Валидаторы для каждой формы
  const loginForm = document.querySelector('#login-form form');
  const registerForm = document.querySelector('#register-form form');
  
  new FormValidator(loginForm);
  new FormValidator(registerForm);
  
  new PasswordToggle();
  new PasswordStrength();
});
