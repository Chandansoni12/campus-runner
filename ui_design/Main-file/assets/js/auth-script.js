// Screen Navigation for Auth Flows
let currentAuthScreen = 0;
const authScreens = {
    signin: ['signin-empty', 'signin-focus', 'signin-filled', 'signin-error'],
    verification: ['email-verify', 'code-entry', 'code-filled']
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthForms();
    initializeSignUpForms();
    initializeVerificationCode();
    initializeKeyboards();
    initializeAccountSetup();
});

// Auth Form Initialization
function initializeAuthForms() {
    // Password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const svg = this.querySelector('svg');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                // Show eye-slash icon
                svg.innerHTML = '<path d="M12 7C13.1 7 14 7.9 14 9C14 9.34 13.91 9.66 13.76 9.94L16.94 13.12C18.23 12.23 19.28 11.08 20 9.75C18.27 6.61 15.39 4.5 12 4.5C10.95 4.5 9.94 4.68 9 5L11.06 7.06C11.34 7.02 11.66 7 12 7ZM2 4.27L4.28 6.55C2.61 7.5 1.29 8.93 0.5 10.75C2.23 13.89 5.11 16 8.5 16C9.55 16 10.56 15.82 11.5 15.5L14.73 18.73L16.27 17.27L3.73 4.73L2 4.27ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.78 9 12C9 13.1 9.9 14 11 14C11.22 14 11.44 13.97 11.65 13.92L13.2 15.47C12.53 15.8 11.79 16 11 16C8.79 16 7 14.21 7 12C7 11.21 7.2 10.47 7.53 9.8Z" fill="currentColor"/>';
            } else {
                passwordInput.type = 'password';
                // Show eye icon
                svg.innerHTML = '<path d="M12 5C7.5 5 3.73 7.61 2 11.5C3.73 15.39 7.5 18 12 18C16.5 18 20.27 15.39 22 11.5C20.27 7.61 16.5 5 12 5ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" fill="currentColor"/>';
            }
        });
    });

    // Input focus effects
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.classList.add('active');
        });

        input.addEventListener('blur', function() {
            if (!this.value) {
                this.classList.remove('active');
            }
        });
    });

    // Form submission
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignIn(this);
        });
    });
}

// Handle Sign In
function handleSignIn(form) {
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]')?.value;

    // Basic validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    // Simulate authentication
    console.log('Signing in with:', email);
    
    // For PWA template - redirect directly to home after sign in
    // Store auth state in localStorage
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', email);
    
    // Navigate to home page
    window.location.href = 'home.html';
}

// Sign Up Form Initialization
function initializeSignUpForms() {
    // Sign-up form submission
    const signUpForms = document.querySelectorAll('#signup-form-empty, #signup-form-focus, #signup-form-filled');
    signUpForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignUp(this);
        });
    });

    // Phone number formatting
    const phoneInputs = document.querySelectorAll('.phone-input');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            // Format phone number as user types
            let value = this.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = value;
                } else if (value.length <= 6) {
                    value = value.slice(0, 3) + '.' + value.slice(3);
                } else {
                    value = value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6, 10);
                }
            }
            this.value = value;
        });
    });

    // Country selector click handler
    const countrySelectors = document.querySelectorAll('.country-selector');
    countrySelectors.forEach(selector => {
        selector.addEventListener('click', function() {
            // In a real app, this would open a country picker modal
            console.log('Country selector clicked');
            // For now, just show a message
            alert('Country selector - Feature coming soon!');
        });
    });

    // Terms checkbox validation
    const termsCheckboxes = document.querySelectorAll('#terms-checkbox, #terms-checkbox2, #terms-checkbox3');
    termsCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const form = this.closest('form');
            if (form) {
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    // Enable/disable button based on checkbox
                    // For now, we'll just validate on submit
                }
            }
        });
    });
}

// Handle Sign Up
function handleSignUp(form) {
    const fullName = form.querySelector('input[type="text"]').value;
    const phone = form.querySelector('.phone-input')?.value;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]')?.value;
    const termsCheckbox = form.closest('.auth-content, .auth-content-compact')
        .querySelector('input[type="checkbox"]');

    // Basic validation
    if (!fullName || !phone || !email || !password) {
        alert('Please fill in all fields');
        return;
    }

    // Check terms and conditions
    if (!termsCheckbox || !termsCheckbox.checked) {
        alert('Please accept the Terms and Conditions to continue');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    // Password validation (at least 6 characters)
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    // Simulate sign-up
    console.log('Signing up with:', { fullName, phone, email });
    
    // Store user data
    localStorage.setItem('userData', JSON.stringify({ fullName, phone, email }));
    
    // Navigate to verification page
    window.location.href = 'verification.html';
}

// Verification Code Functionality
function initializeVerificationCode() {
    const codeInputs = document.querySelectorAll('.code-input, .code-input-small, .code-input-medium');
    
    if (codeInputs.length === 0) return;

    codeInputs.forEach((input, index) => {
        // Auto-focus next input
        input.addEventListener('input', function(e) {
            if (this.value.length === 1 && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
        });

        // Handle backspace
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !this.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });

        // Only allow numbers
        input.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    });

    // Auto-submit when all fields filled
    const lastInput = codeInputs[codeInputs.length - 1];
    if (lastInput) {
        lastInput.addEventListener('input', function() {
            const allFilled = Array.from(codeInputs).every(input => input.value.length === 1);
            if (allFilled) {
                setTimeout(() => {
                    handleVerificationSubmit();
                }, 300);
            }
        });
    }
}

// Handle Verification Submit
function handleVerificationSubmit() {
    const codeInputs = document.querySelectorAll('.code-input, .code-input-small, .code-input-medium');
    const code = Array.from(codeInputs).map(input => input.value).join('');
    
    console.log('Verification code:', code);
    
    // Simulate verification
    if (code.length === 5 || code.length === 6) {
        // Success - navigate to main app
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('isVerified', 'true');
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 500);
    } else {
        alert('Please enter a valid verification code');
    }
}

// Verify buttons
document.querySelectorAll('.btn-verify, .btn-verify-small, .btn-verify-medium').forEach(btn => {
    btn.addEventListener('click', function() {
        handleVerificationSubmit();
    });
});

// Resend Code
document.querySelectorAll('.resend-link, .resend-link-large').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        handleResendCode();
    });
});

function handleResendCode() {
    console.log('Resending verification code...');
    alert('Verification code sent!');
    
    // Reset countdown
    const countdown = document.querySelector('.countdown');
    if (countdown) {
        startCountdown(60);
    }
}

// Countdown timer
function startCountdown(seconds) {
    const countdownElement = document.querySelector('.countdown');
    if (!countdownElement) return;

    let timeLeft = seconds;
    const timer = setInterval(() => {
        timeLeft--;
        countdownElement.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
        }
    }, 1000);
}

// Initialize keyboards
function initializeKeyboards() {
    // Virtual QWERTY keyboard
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.addEventListener('click', function() {
            const focusedInput = document.querySelector('input:focus, .form-control.active');
            if (!focusedInput) return;

            if (this.classList.contains('backspace')) {
                focusedInput.value = focusedInput.value.slice(0, -1);
            } else if (this.classList.contains('space')) {
                focusedInput.value += ' ';
            } else if (this.classList.contains('return')) {
                focusedInput.blur();
            } else if (!this.classList.contains('shift') && 
                       !this.classList.contains('number') &&
                       !this.classList.contains('emoji') &&
                       !this.classList.contains('mic')) {
                focusedInput.value += this.textContent;
            }
        });
    });

    // Numeric keypad
    const numKeys = document.querySelectorAll('.num-key');
    numKeys.forEach(key => {
        key.addEventListener('click', function() {
            if (this.classList.contains('empty')) return;

            const focusedInput = document.querySelector('.code-input:focus, .code-input-small:focus, .code-input-medium:focus');
            if (!focusedInput) {
                // If no input focused, find first empty input
                const emptyInput = document.querySelector('.code-input:not([value]), .code-input-small:not([readonly]), .code-input-medium:not([value])');
                if (emptyInput) {
                    emptyInput.focus();
                    return;
                }
            }

            if (this.classList.contains('delete')) {
                if (focusedInput) {
                    focusedInput.value = '';
                    // Move to previous input
                    const allInputs = Array.from(document.querySelectorAll('.code-input, .code-input-small, .code-input-medium'));
                    const currentIndex = allInputs.indexOf(focusedInput);
                    if (currentIndex > 0) {
                        allInputs[currentIndex - 1].focus();
                    }
                }
            } else {
                const num = this.querySelector('.num')?.textContent;
                if (num && focusedInput) {
                    focusedInput.value = num;
                    focusedInput.dispatchEvent(new Event('input'));
                }
            }
        });
    });
}

// Back button functionality
document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', function() {
        window.history.back();
    });
});

// Social login buttons
document.querySelectorAll('.btn-social').forEach(btn => {
    btn.addEventListener('click', function() {
        const parent = this.parentElement;
        const buttons = parent.querySelectorAll('.btn-social');
        const index = Array.from(buttons).indexOf(this);
        
        let provider = 'Unknown';
        if (index === 0) provider = 'Google';
        else if (index === 1) provider = 'Apple';
        else if (index === 2) provider = 'Facebook';
        
        console.log('Social login with:', provider);
        alert(`Login with ${provider} - Feature coming soon!`);
    });
});

// Screen switching helper (for demo purposes)
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

// Keyboard show/hide simulation
let keyboardVisible = false;
function toggleKeyboard() {
    const keyboard = document.querySelector('.keyboard, .numeric-keypad');
    if (keyboard) {
        keyboardVisible = !keyboardVisible;
        keyboard.style.display = keyboardVisible ? 'block' : 'none';
    }
}

// Input focus shows keyboard
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        const keyboard = document.querySelector('.keyboard, .numeric-keypad');
        if (keyboard && !keyboard.classList.contains('active')) {
            keyboard.style.display = 'block';
        }
    });
});

// Auto-start countdown if present
const countdown = document.querySelector('.countdown');
if (countdown) {
    startCountdown(56);
}

// Forgot Password Functionality
function initializeForgotPassword() {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            
            if (!email) {
                alert('Please enter your email address');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Navigate to OTP verification page
            window.location.href = 'forgot-password-otp.html';
        });
    }
}

// Create Password Functionality
function initializeCreatePassword() {
    const createPasswordForm = document.getElementById('create-password-form');
    if (createPasswordForm) {
        createPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validation
            if (!password || !confirmPassword) {
                alert('Please fill in all fields');
                return;
            }
            
            if (password.length < 6) {
                alert('Password must be at least 6 characters long');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            // Show success modal
            const modal = document.getElementById('password-changed-modal');
            if (modal) {
                modal.classList.add('active');
                // After 2 seconds, redirect to home
                setTimeout(() => {
                    localStorage.setItem('isAuthenticated', 'true');
                    window.location.href = 'home.html';
                }, 2000);
            }
        });
    }

    // Password toggle for create password page
    const passwordToggles = document.querySelectorAll('#create-password .password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const svg = this.querySelector('svg');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                // Show eye-slash icon
                svg.innerHTML = '<path d="M12 7C13.1 7 14 7.9 14 9C14 9.34 13.91 9.66 13.76 9.94L16.94 13.12C18.23 12.23 19.28 11.08 20 9.75C18.27 6.61 15.39 4.5 12 4.5C10.95 4.5 9.94 4.68 9 5L11.06 7.06C11.34 7.02 11.66 7 12 7ZM2 4.27L4.28 6.55C2.61 7.5 1.29 8.93 0.5 10.75C2.23 13.89 5.11 16 8.5 16C9.55 16 10.56 15.82 11.5 15.5L14.73 18.73L16.27 17.27L3.73 4.73L2 4.27ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.78 9 12C9 13.1 9.9 14 11 14C11.22 14 11.44 13.97 11.65 13.92L13.2 15.47C12.53 15.8 11.79 16 11 16C8.79 16 7 14.21 7 12C7 11.21 7.2 10.47 7.53 9.8Z" fill="currentColor"/>';
            } else {
                passwordInput.type = 'password';
                // Show eye icon
                svg.innerHTML = '<path d="M12 5C7.5 5 3.73 7.61 2 11.5C3.73 15.39 7.5 18 12 18C16.5 18 20.27 15.39 22 11.5C20.27 7.61 16.5 5 12 5ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" fill="currentColor"/>';
            }
        });
    });
}

// OTP Verification for Forgot Password
function initializeForgotPasswordOTP() {
    const verifyBtn = document.getElementById('verify-otp-btn');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', function() {
            const codeInputs = document.querySelectorAll('.code-input-small');
            const code = Array.from(codeInputs).map(input => input.value).join('');
            
            if (code.length !== 6) {
                alert('Please enter the complete 6-digit code');
                return;
            }
            
            // Navigate to create password page
            window.location.href = 'create-password.html';
        });
    }

    const resendLink = document.getElementById('resend-otp-link');
    if (resendLink) {
        resendLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Verification code sent!');
        });
    }
}

// Initialize password-related functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeForgotPassword();
    initializeCreatePassword();
    initializeForgotPasswordOTP();
});

// Account Setup Initialization
function initializeAccountSetup() {
    // Language selection radio buttons
    const languageItems = document.querySelectorAll('.language-item');
    languageItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove selected class from all items
            languageItems.forEach(i => i.classList.remove('selected'));
            // Add selected class to clicked item
            this.classList.add('selected');
            // Check the radio button
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });

    // Location item click handlers
    const locationItems = document.querySelectorAll('.location-item');
    locationItems.forEach(item => {
        item.addEventListener('click', function() {
            const locationName = this.querySelector('.location-name').textContent;
            console.log('Location selected:', locationName);
            // In a real app, this would save the location and proceed
            // For now, we'll just log it
        });
    });

    // Set location on map button
    const setLocationBtn = document.querySelector('.btn-location-map');
    if (setLocationBtn) {
        setLocationBtn.addEventListener('click', function() {
            // Switch to map view
            const mapScreen = document.getElementById('choose-location-map');
            if (mapScreen) {
                document.querySelectorAll('.screen').forEach(screen => {
                    screen.classList.remove('active');
                });
                mapScreen.classList.add('active');
            }
        });
    }

    // Search input handlers
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            // In a real app, this would filter locations
            console.log('Searching for:', this.value);
        });
    });
}
