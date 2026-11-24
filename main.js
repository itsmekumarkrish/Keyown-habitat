document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    
    // Smooth Navbar transition on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Robust smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href !== '#' && href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    // Small delay if coming from mobile menu to allow layout to settle
                    setTimeout(() => {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 50);
                }
            }
        });
    });
    // ==========================================================================
    // 1. Ambient Background Particle Canvas
    // ==========================================================================
    const canvas = document.getElementById('ambient-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        // Handle resize
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = Math.random() * 0.15 - 0.075;
                this.speedY = Math.random() * 0.15 - 0.075;
                this.alpha = Math.random() * 0.5 + 0.1;
                this.fadeSpeed = Math.random() * 0.005 + 0.002;
                this.fadeIn = Math.random() > 0.5;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Bounce bounds
                if (this.x < 0 || this.x > width) this.speedX *= -1;
                if (this.y < 0 || this.y > height) this.speedY *= -1;

                // Ambient twinkle
                if (this.fadeIn) {
                    this.alpha += this.fadeSpeed;
                    if (this.alpha >= 0.7) this.fadeIn = false;
                } else {
                    this.alpha -= this.fadeSpeed;
                    if (this.alpha <= 0.1) this.fadeIn = true;
                }
            }

            draw() {
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 98, 65, ${this.alpha * 0.5})`;
                ctx.shadowBlur = 6;
                ctx.shadowColor = 'rgba(0, 98, 65, 0.3)';
                ctx.fill();
                ctx.restore();
            }
        }

        // Initialize particles (slow moving starry dust)
        const particleCount = Math.min(60, Math.floor(width / 25));
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Animation loop
        function animateParticles() {
            ctx.clearRect(0, 0, width, height);
            
            // Draw very soft, permanent radial ambient glows
            const grad1 = ctx.createRadialGradient(width * 0.8, height * 0.2, 0, width * 0.8, height * 0.2, 400);
            grad1.addColorStop(0, 'rgba(0, 98, 65, 0.04)');
            grad1.addColorStop(1, 'rgba(242, 240, 235, 0)');
            ctx.fillStyle = grad1;
            ctx.fillRect(0, 0, width, height);

            const grad2 = ctx.createRadialGradient(width * 0.2, height * 0.8, 0, width * 0.2, height * 0.8, 300);
            grad2.addColorStop(0, 'rgba(30, 57, 50, 0.03)');
            grad2.addColorStop(1, 'rgba(242, 240, 235, 0)');
            ctx.fillStyle = grad2;
            ctx.fillRect(0, 0, width, height);

            // Draw and update particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // ==========================================================================
    // 2. Interactive Your Rent Journey Calculator
    // ==========================================================================
    const rentSlider = document.getElementById('monthly-rent');
    const increaseSlider = document.getElementById('annual-increase');
    const yearsPastSlider = document.getElementById('years-past');
    const yearsFutureSlider = document.getElementById('years-future');

    const rentValDisplay = document.getElementById('rent-value');
    const increaseValDisplay = document.getElementById('increase-value');
    const yearsPastValDisplay = document.getElementById('years-past-value');
    const yearsFutureValDisplay = document.getElementById('years-future-value');

    const rentPaidPastOutput = document.getElementById('rent-paid-past');
    const currentAnnualRentOutput = document.getElementById('current-annual-rent');
    const rentProjectedFutureOutput = document.getElementById('rent-projected-future');
    const totalRentOutflowOutput = document.getElementById('total-rent-outflow');

    if (rentSlider && increaseSlider && yearsPastSlider && yearsFutureSlider) {
        function formatLakhs(amount) {
            if (isNaN(amount) || amount < 0) return '₹0.00 Lakhs';
            if (amount >= 10000000) {
                const crores = amount / 10000000;
                return `₹${crores.toFixed(2)} Cr`;
            }
            const lakhs = amount / 100000;
            return `₹${lakhs.toFixed(2)} Lakhs`;
        }

        function animateValue(element, start, end, duration = 300) {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const currentVal = Math.floor(progress * (end - start) + start);
                element.innerText = formatLakhs(currentVal);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        }

        let lastPast = 0;
        let lastAnnual = 0;
        let lastFuture = 0;
        let lastTotal = 0;

        function calculateRentJourney(animate = false) {
            const monthlyRent = parseFloat(rentSlider.value) || 30000;
            const annualIncreasePct = parseFloat(increaseSlider.value) || 0;
            const r = annualIncreasePct / 100;
            const yPast = parseInt(yearsPastSlider.value) || 1;
            const yFuture = parseInt(yearsFutureSlider.value) || 1;

            // Update Input Value Displays
            rentValDisplay.innerText = `₹${monthlyRent.toLocaleString('en-IN')}`;
            increaseValDisplay.innerText = `${annualIncreasePct}%`;
            yearsPastValDisplay.innerText = `${yPast} ${yPast === 1 ? 'Year' : 'Years'}`;
            yearsFutureValDisplay.innerText = `${yFuture} ${yFuture === 1 ? 'Year' : 'Years'}`;

            // 1. Current Annual Rent = Monthly Rent * 12
            const currentAnnualRent = monthlyRent * 12;

            // 2. Rent Paid So Far = sum of annual rent for "Years Already Paying Rent"
            // Annual Rent_k = Current Monthly Rent * 12 * (1 + r)^(k - 1)
            let rentPaidPast = 0;
            for (let k = 1; k <= yPast; k++) {
                rentPaidPast += currentAnnualRent * Math.pow(1 + r, k - 1);
            }

            // 3. Projected Future Rent = sum of annual rent for future years, continuing from current rental year
            // Continuing from year yPast + 1 to yPast + yFuture
            let rentProjectedFuture = 0;
            for (let k = yPast + 1; k <= yPast + yFuture; k++) {
                rentProjectedFuture += currentAnnualRent * Math.pow(1 + r, k - 1);
            }

            // 4. Total Rent Outflow = Rent Paid So Far + Projected Future Rent
            const totalRentOutflow = rentPaidPast + rentProjectedFuture;

            if (animate) {
                animateValue(rentPaidPastOutput, lastPast, rentPaidPast);
                animateValue(currentAnnualRentOutput, lastAnnual, currentAnnualRent);
                animateValue(rentProjectedFutureOutput, lastFuture, rentProjectedFuture);
                animateValue(totalRentOutflowOutput, lastTotal, totalRentOutflow);
            } else {
                rentPaidPastOutput.innerText = formatLakhs(rentPaidPast);
                currentAnnualRentOutput.innerText = formatLakhs(currentAnnualRent);
                rentProjectedFutureOutput.innerText = formatLakhs(rentProjectedFuture);
                totalRentOutflowOutput.innerText = formatLakhs(totalRentOutflow);
            }

            lastPast = rentPaidPast;
            lastAnnual = currentAnnualRent;
            lastFuture = rentProjectedFuture;
            lastTotal = totalRentOutflow;
        }

        // Live input listeners
        [rentSlider, increaseSlider, yearsPastSlider, yearsFutureSlider].forEach(slider => {
            slider.addEventListener('input', () => calculateRentJourney(false));
            slider.addEventListener('change', () => calculateRentJourney(true));
        });

        // Initial setup
        calculateRentJourney(false);
    }

    // ==========================================================================
    // 3. Collapsible FAQ Accordions
    // ==========================================================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        if (trigger) {
            trigger.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close other open accordions
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });

                // Toggle this accordion
                if (isActive) {
                    item.classList.remove('active');
                } else {
                    item.classList.add('active');
                }
            });
        }
    });

    // ==========================================================================
    // 4. Strategic Lead Assessment Form Submission
    // ==========================================================================
    const strategyForm = document.getElementById('strategy-form');
    const formSuccess = document.getElementById('form-success');

    if (strategyForm && formSuccess) {
        strategyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Collect info
            const userName = document.getElementById('user-name').value;
            const userEmail = document.getElementById('user-email').value;
            const userPhone = document.getElementById('user-phone').value;
            const userCity = document.getElementById('user-city').value;
            
            // --- Basic Validation ---
            // Phone: strip spaces and dashes, then check if it's 10 digits (with optional +91)
            const cleanPhone = userPhone.replace(/[\s\-]/g, '');
            const phoneRegex = /^(\+91)?\d{10}$/;
            if (!phoneRegex.test(cleanPhone)) {
                alert("Please enter a valid 10-digit phone number.");
                return;
            }
            
            // Email typo check (.con instead of .com)
            if (userEmail.toLowerCase().endsWith('.con')) {
                alert("It looks like there's a typo in your email (ends with .con). Did you mean .com?");
                return;
            }
            // ------------------------
            
            // 1. Send to our backend API (/api/assessment)
            const submitBtn = strategyForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Processing...';
            submitBtn.disabled = true;

            const formData = new FormData();
            formData.append('name', userName);
            formData.append('email', userEmail);
            formData.append('phone', userPhone);
            formData.append('city', userCity);

            const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
                ? '/api/assessment' 
                : 'https://3d62c006e16d45.lhr.life/api/assessment';

            fetch(apiUrl, {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    console.log('Backend automation triggered successfully.');
                }
            })
            .catch(error => console.error('Error submitting form:', error))
            .finally(() => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            });
            
            // 2. Open WhatsApp
            const waText = `Hi, I'm interested in the HOAS Assessment.\n\n*Name:* ${userName}\n*Email:* ${userEmail}\n*Phone:* ${userPhone}\n*City:* ${userCity}`;
            const waUrl = `https://wa.me/919886535949?text=${encodeURIComponent(waText)}`;
            window.open(waUrl, '_blank');
            
            // Stagger transition effect
            strategyForm.style.opacity = '0';
            strategyForm.style.transition = 'opacity 0.4s ease';

            setTimeout(() => {
                strategyForm.classList.add('d-none');
                formSuccess.classList.remove('d-none');
                formSuccess.style.opacity = '0';
                formSuccess.style.transform = 'translateY(15px)';
                formSuccess.style.transition = 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
                
                // Personalize message
                const successHeading = formSuccess.querySelector('h3');
                if (successHeading) {
                    successHeading.innerText = `Assessment Request Submitted, ${userName.split(' ')[0]}!`;
                }

                setTimeout(() => {
                    formSuccess.style.opacity = '1';
                    formSuccess.style.transform = 'translateY(0)';
                }, 50);
            }, 400);
        });
    }

    // ==========================================================================
    // 5. Interactive Chatbot — Full Guided Flow
    // ==========================================================================
    const botTrigger  = document.getElementById('chatbot-trigger');
    const botClose    = document.getElementById('chat-close');
    const botRestart  = document.getElementById('chat-restart');
    const botWindow   = document.getElementById('chatbot-window');
    const chatMessages = document.getElementById('chat-messages');
    const chatOptions  = document.getElementById('chat-options');
    const chatTyping   = document.getElementById('chat-typing');
    const chatInput    = document.getElementById('chat-input');
    const chatSend     = document.getElementById('chat-send');
    const triggerBadge = document.getElementById('trigger-badge');

    if (!botTrigger || !botWindow) return;

    // ---- Conversation Script ----
    // Each step: { bot: [messages], opts: [{label, next}] | null }
    // null opts = free-text capture step
    const FLOW = {
        start: {
            bot: [
                '👋 Welcome to KeyOwn Habitat!',
                'I\'m your HOAS Assistant. I help renters like you plan their path to homeownership. Shall we get started?'
            ],
            opts: [
                { label: '✅ Yes, let\'s go!', next: 'rent' },
                { label: '❓ What is HOAS?',   next: 'what_is_hoas' },
            ]
        },
        what_is_hoas: {
            bot: [
                'HOAS stands for Home Ownership Advisory System. 🏠',
                'It\'s a structured, step-by-step framework that turns your monthly rent into a pathway to owning your own home — building your equity, credit, and wealth along the way.',
                'Ready to see if you qualify?'
            ],
            opts: [
                { label: '✅ Yes, check my eligibility', next: 'rent' },
                { label: '📞 Talk to an advisor',         next: 'whatsapp_direct' },
            ]
        },
        rent: {
            bot: ['What is your current monthly rent?'],
            opts: [
                { label: '₹15,000 – ₹30,000',  next: 'city' },
                { label: '₹30,000 – ₹60,000',  next: 'city' },
                { label: '₹60,000 – ₹1,00,000', next: 'city' },
                { label: '₹1,00,000+',          next: 'city' },
            ]
        },
        city: {
            bot: ['Great! Which city are you looking to own a home in?'],
            opts: [
                { label: '🏙 Bangalore',      next: 'timeline' },
                { label: '🏙 Mumbai',         next: 'timeline' },
                { label: '🏙 Delhi NCR',      next: 'timeline' },
                { label: '🏙 Pune',           next: 'timeline' },
                { label: '🏙 Hyderabad',      next: 'timeline' },
                { label: '🏙 Other city',     next: 'timeline' },
            ]
        },
        timeline: {
            bot: ['When are you hoping to transition from renting to owning?'],
            opts: [
                { label: '⚡ Within 1 year',   next: 'name' },
                { label: '📅 1 – 3 years',     next: 'name' },
                { label: '🗓 3 – 5 years',     next: 'name' },
                { label: '🔭 5+ years away',   next: 'name' },
            ]
        },
        name: {
            bot: ['Almost there! What\'s your name?'],
            opts: null,   // free-text capture
            capture: 'name',
            next: 'phone'
        },
        phone: {
            bot: ['Thanks, {name}! 🙌 Last step — what\'s the best number to reach you on WhatsApp?'],
            opts: null,
            capture: 'phone',
            next: 'final'
        },
        final: {
            bot: [
                'Perfect! Based on your profile, you are a strong candidate for our HOAS Framework. 🎉',
                'One of our senior advisors will contact you shortly to walk you through your personalised Downpayment Match Strategy.',
                'Click below to instantly connect on WhatsApp and fast-track your consultation!'
            ],
            opts: null,
            isEnd: true
        },
        whatsapp_direct: {
            bot: ['No problem! Click the button below to instantly chat with one of our senior advisors on WhatsApp. 📲'],
            opts: null,
            isEnd: true,
            directWA: true
        }
    };

    // ---- State ----
    let state = {};
    function resetState() {
        state = { step: 'start', data: {} };
    }
    resetState();

    // ---- Helpers ----
    const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? ''
        : 'https://keyownhabitat-hr-dashboard.onrender.com';

    let conversationHistory = [];

    function scrollBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTyping(show) {
        chatTyping.style.display = show ? 'flex' : 'none';
        if (show) scrollBottom();
    }

    function addMessage(text, isUser = false) {
        const el = document.createElement('div');
        el.className = `message ${isUser ? 'user-msg' : 'system-msg'}`;
        // Replace template vars
        Object.entries(state.data).forEach(([k, v]) => {
            text = text.replace(`{${k}}`, v);
        });
        el.textContent = text;
        chatMessages.appendChild(el);
        scrollBottom();

        // Track history for AI context
        conversationHistory.push({
            role: isUser ? 'user' : 'model',
            text: text
        });

        return el;
    }

    function clearOptions() {
        chatOptions.innerHTML = '';
    }

    function renderOptions(opts) {
        clearOptions();
        if (!opts) return;
        opts.forEach(({ label, next }) => {
            const btn = document.createElement('button');
            btn.className = 'chat-opt';
            btn.textContent = label;
            btn.addEventListener('click', () => handleOptionClick(label, next));
            chatOptions.appendChild(btn);
        });
    }

    function renderDynamicOptions(options) {
        clearOptions();
        if (!options || options.length === 0) return;
        options.forEach(optText => {
            const btn = document.createElement('button');
            btn.className = 'chat-opt';
            btn.textContent = optText;
            btn.addEventListener('click', () => {
                handleAiInteraction(optText);
            });
            chatOptions.appendChild(btn);
        });
    }

    function buildWAButton(directOnly) {
        const userData = state.data;
        const text = directOnly
            ? 'Hi! I want to know more about KeyOwn Habitat HOAS.'
            : `Hi! I'm interested in KeyOwn Habitat HOAS. My details: City: ${userData.city || 'Bangalore'}, Rent/Savings: ${userData.rent || 'N/A'}, Phone: ${userData.phone || ''}. Please guide me!`;
        const url = `https://wa.me/919886535949?text=${encodeURIComponent(text)}`;
        chatOptions.innerHTML = `
            <a href="${url}" target="_blank" class="btn btn-primary"
               style="text-decoration:none; text-align:center; justify-content:center; width:100%; font-size:0.88rem;">
               Connect on WhatsApp &nbsp;<i class="ph ph-whatsapp-logo"></i>
            </a>`;
    }

    // ---- Step runner ----
    function runStep(stepKey) {
        state.step = stepKey;
        const step = FLOW[stepKey];
        if (!step) return;

        const msgs = step.bot || [];
        showTyping(true);

        let delay = 700;
        msgs.forEach((msg, i) => {
            setTimeout(() => {
                if (i === msgs.length - 1) showTyping(false);
                addMessage(msg);
                if (i < msgs.length - 1) showTyping(true);
            }, delay * (i + 1));
        });

        const totalDelay = delay * (msgs.length + 1);

        setTimeout(() => {
            chatInput.disabled = false;
            chatSend.disabled = false;
            if (step.isEnd) {
                buildWAButton(step.directWA);
                chatInput.placeholder = "Connect on WhatsApp above…";
            } else if (step.opts) {
                renderOptions(step.opts);
                chatInput.placeholder = "Type your reply or select above…";
            } else {
                // Free-text mode
                clearOptions();
                if (step.capture === 'name') {
                    chatInput.placeholder = "Type your full name…";
                } else if (step.capture === 'phone') {
                    chatInput.placeholder = "Type your 10-digit WhatsApp number…";
                } else {
                    chatInput.placeholder = "Type a message…";
                }
                chatInput.focus();
            }
        }, totalDelay);
    }

    // ---- Option click ----
    function handleOptionClick(label, next) {
        const curStep = FLOW[state.step];
        if (state.step === 'rent') state.data.rent = label;
        if (state.step === 'city') state.data.city = label.replace(/🏙 /, '');
        if (state.step === 'timeline') state.data.timeline = label;

        addMessage(label, true);
        clearOptions();
        setTimeout(() => runStep(next), 400);
    }

    // ---- AI Intelligent Response Handler ----
    async function handleAiInteraction(userText) {
        addMessage(userText, true);
        chatInput.value = '';
        clearOptions();
        showTyping(true);

        // Check if user shared a phone number
        const digits = userText.replace(/[\s\-\+]/g, '');
        const isPhone = /^[6-9]\d{9}$/.test(digits);
        if (isPhone) {
            state.data.phone = digits;
        }

        try {
            const res = await fetch(`${API_BASE}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userText,
                    history: conversationHistory.slice(-8)
                })
            });

            const data = await res.json();
            showTyping(false);

            if (data.reply) {
                addMessage(data.reply);
            }

            if (isPhone) {
                buildWAButton(false);
            } else if (data.suggestedOptions && data.suggestedOptions.length > 0) {
                renderDynamicOptions(data.suggestedOptions);
            }
        } catch (e) {
            showTyping(false);
            addMessage("Thanks for sharing! Which city are you planning to buy your home in (e.g. Bangalore, Mysuru)?");
            renderDynamicOptions(['🏙 Bangalore', '🏙 Mysuru', '🏙 Other City']);
        }
    }

    function handleFreeText() {
        const val = chatInput.value.trim();
        if (!val) return;
        handleAiInteraction(val);
    }

    chatSend.addEventListener('click', handleFreeText);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleFreeText();
    });

    // ---- Open / Close / Restart ----
    function openChat() {
        botWindow.classList.add('active');
        if (triggerBadge) triggerBadge.style.display = 'none';
        // Start the flow if messages area is empty
        if (chatMessages.children.length === 0) {
            runStep('start');
        }
    }

    function closeChat() {
        botWindow.classList.remove('active');
    }

    function restartChat() {
        chatMessages.innerHTML = '';
        clearOptions();
        chatInput.value = '';
        chatInput.disabled = false;
        chatSend.disabled = false;
        showTyping(false);
        resetState();
        runStep('start');
    }

    botTrigger.addEventListener('click', openChat);
    botClose.addEventListener('click', closeChat);
    botRestart.addEventListener('click', restartChat);

    // ==========================================================================
    // 6. IntersectionObserver Scroll Reveal Animations
    // ==========================================================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stagger nested children animations if present
                const staggeredChildren = entry.target.querySelectorAll('.reveal-up:not(.visible)');
                staggeredChildren.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('visible');
                    }, index * 100);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initial animations for Hero elements
    const heroElements = [
        document.querySelector('.badge'),
        document.querySelector('.headline'),
        document.querySelector('.subheadline'),
        document.querySelector('.hero-actions'),
        document.querySelector('.hero-visual')
    ];

    heroElements.forEach((el, index) => {
        if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${index * 0.12}s`;
            
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 100);
        }
    });

    // Observe all other sections and elements
    document.querySelectorAll('.reveal-up').forEach(section => {
        revealObserver.observe(section);
    });

    // ---- Interactive Testimonials (Smooth Auto-scroll + Drag/Swipe + Dash Navigation) ----
    const wrapper = document.querySelector('.testimonials-marquee-wrapper');
    const track = document.querySelector('.testimonials-track');
    const dashes = document.querySelectorAll('.slider-dashes .dash, .slider-dots .dot');
    const cards = document.querySelectorAll('.testimonials-track .testimonial-card');

    if (wrapper && track && cards.length > 0) {
        let currentX = 0;
        let isDragging = false;
        let isHovered = false;
        let isAnimatingTo = false;
        let startX = 0;
        let startPointerX = 0;
        let resumeTimeout = null;

        const uniqueCount = dashes.length > 0 ? dashes.length : 6;
        const speed = 0.65; // Ambient scroll speed (pixels per frame)

        function getDimensions() {
            const card0 = cards[0];
            const card1 = cards[1];
            const step = card1 ? (card1.offsetLeft - card0.offsetLeft) : 364;
            const halfWidth = step * uniqueCount;
            return { step, halfWidth };
        }

        function updateDashes() {
            if (dashes.length === 0) return;
            const { step, halfWidth } = getDimensions();
            if (step <= 0 || halfWidth <= 0) return;
            let normalized = Math.abs(currentX % halfWidth);
            let activeIdx = Math.round(normalized / step) % uniqueCount;
            dashes.forEach((dash, idx) => {
                dash.classList.toggle('active', idx === activeIdx);
            });
        }

        function render() {
            const { halfWidth } = getDimensions();
            if (halfWidth > 0) {
                while (currentX <= -halfWidth) currentX += halfWidth;
                while (currentX > 0) currentX -= halfWidth;
            }
            track.style.transform = `translate3d(${currentX}px, 0, 0)`;
        }

        // Ambient auto-scroll animation loop
        function tick() {
            if (!isDragging && !isHovered && !isAnimatingTo) {
                currentX -= speed;
                render();
                updateDashes();
            }
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);

        // Pause on desktop hover
        wrapper.addEventListener('mouseenter', () => { isHovered = true; });
        wrapper.addEventListener('mouseleave', () => {
            if (!isDragging) isHovered = false;
        });

        let startPointerY = 0;
        let isHorizontalSwipe = null;

        // Track drag vs tap to prevent opening modal while swiping
        let hasMovedSignificantly = false;
        let startTapX = 0;
        let startTapY = 0;

        // Pointer start (Mouse & Touch)
        function onPointerStart(clientX, clientY = 0) {
            isDragging = true;
            isAnimatingTo = false;
            isHorizontalSwipe = null;
            hasMovedSignificantly = false;
            startTapX = clientX;
            startTapY = clientY;
            if (resumeTimeout) clearTimeout(resumeTimeout);
            startX = currentX;
            startPointerX = clientX;
            startPointerY = clientY;
            wrapper.classList.add('is-dragging');
        }

        // Pointer move
        function onPointerMove(clientX, clientY = 0) {
            if (!isDragging) return;

            // Distinguish click from drag
            if (Math.abs(clientX - startTapX) > 6 || Math.abs(clientY - startTapY) > 6) {
                hasMovedSignificantly = true;
            }

            // On touch devices, check if user is scrolling vertically or horizontally
            if (isHorizontalSwipe === null && clientY !== 0) {
                const dx = Math.abs(clientX - startPointerX);
                const dy = Math.abs(clientY - startPointerY);
                if (dx > 7 || dy > 7) {
                    if (dx > dy) {
                        isHorizontalSwipe = true;
                    } else {
                        isHorizontalSwipe = false;
                        isDragging = false;
                        wrapper.classList.remove('is-dragging');
                        return;
                    }
                } else {
                    return;
                }
            }

            if (isHorizontalSwipe === false) return;

            const deltaX = clientX - startPointerX;
            currentX = startX + deltaX;
            render();
            updateDashes();
        }

        // Pointer end
        function onPointerEnd() {
            if (!isDragging && isHorizontalSwipe === false) return;
            isDragging = false;
            isHorizontalSwipe = null;
            wrapper.classList.remove('is-dragging');
            // Give 3 seconds to comfortably read before resuming ambient scroll
            isHovered = true;
            if (resumeTimeout) clearTimeout(resumeTimeout);
            resumeTimeout = setTimeout(() => {
                isHovered = false;
            }, 3000);
        }

        // Desktop Mouse Drag Listeners
        wrapper.addEventListener('mousedown', (e) => {
            onPointerStart(e.clientX, 0);
        });
        window.addEventListener('mousemove', (e) => {
            if (isDragging) onPointerMove(e.clientX, 0);
        });
        window.addEventListener('mouseup', () => {
            if (isDragging) onPointerEnd();
        });

        // Mobile Touch Swipe Listeners
        wrapper.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length > 0) {
                onPointerStart(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });
        wrapper.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches && e.touches.length > 0) {
                onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });
        wrapper.addEventListener('touchend', () => {
            onPointerEnd();
        });
        wrapper.addEventListener('touchcancel', () => {
            onPointerEnd();
        });

        // Dash Click Navigation
        function smoothScrollTo(targetX, duration = 400) {
            isAnimatingTo = true;
            isHovered = true;
            const fromX = currentX;
            const startTime = performance.now();

            function step(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const ease = 1 - Math.pow(1 - progress, 3);
                currentX = fromX + (targetX - fromX) * ease;
                render();
                updateDashes();

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    isAnimatingTo = false;
                    if (resumeTimeout) clearTimeout(resumeTimeout);
                    resumeTimeout = setTimeout(() => {
                        isHovered = false;
                    }, 3500);
                }
            }
            requestAnimationFrame(step);
        }

        dashes.forEach((dash, index) => {
            dash.addEventListener('click', (e) => {
                e.preventDefault();
                const { step, halfWidth } = getDimensions();
                let normalizedCurrent = currentX % halfWidth;
                if (normalizedCurrent > 0) normalizedCurrent -= halfWidth;
                currentX = normalizedCurrent;
                let targetX = - (index * step);
                smoothScrollTo(targetX);
            });
        });

        // ========================================================
        // ---- Review Luxury Bottom Sheet & Swiper Logic ----
        // ========================================================
        const reviewsData = [
            {
                name: "Priya Sharma",
                initials: "PS",
                location: "Whitefield, Bengaluru",
                transition: "Tenant for 3 Yrs ➔ 3BHK Owner",
                accent: "linear-gradient(135deg, #0b4632 0%, #006241 100%)",
                quote: "KeyOwn structured my finances so my rent effectively turned into my down payment savings. In just under three years, I transitioned from paying rent in Whitefield to holding the title deed to my own 3BHK apartment. I just received my keys!"
            },
            {
                name: "Rahul Verma",
                initials: "RV",
                location: "Mysuru",
                transition: "Renting ➔ RERA Pre-Launch Owner",
                accent: "linear-gradient(135deg, #92400e 0%, #d97706 100%)",
                quote: "The advisory counsel negotiated a significant discount on a verified RERA pre-launch project. The HOAS framework was a total game changer — transparent advisory, zero broker pressure, and complete bank paperwork support."
            },
            {
                name: "Anjali Desai",
                initials: "AD",
                location: "Indiranagar, Bengaluru",
                transition: "5 Yrs Rent Trap ➔ Apartment Owner",
                accent: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
                quote: "I wasted years paying high rents thinking homeownership was out of reach on a single income. With KeyOwn's guidance and credit optimization, I bought my dream apartment ahead of schedule. Best financial decision I made."
            },
            {
                name: "Vikram Singh",
                initials: "VS",
                location: "Electronic City, Bengaluru",
                transition: "Rent Outflow ➔ Equity Homeowner",
                accent: "linear-gradient(135deg, #0b4632 0%, #006241 100%)",
                quote: "Transparent and highly professional. Their advisors audited our CIBIL score, eliminated hidden eligibility bottlenecks, and guided us through every legal and bank approval stage effortlessly."
            },
            {
                name: "Sneha Reddy",
                initials: "SR",
                location: "Sarjapur Road, Bengaluru",
                transition: "High Rent ➔ Gated Villa Owner",
                accent: "linear-gradient(135deg, #92400e 0%, #d97706 100%)",
                quote: "Thought a gated villa was completely out of reach. With their structured planning and partner bank facilitation, our borrowing power increased dramatically without stretching our monthly budget."
            },
            {
                name: "Arjun Nair",
                initials: "AN",
                location: "Koramangala, Bengaluru",
                transition: "Tenant for 6 Yrs ➔ Titleholder",
                accent: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
                quote: "No more landlord escalation stress or sudden deposit demands. KeyOwn handled all paperwork from day one and matched us to an approved property. Extremely satisfied with our HOAS journey."
            }
        ];

        const modal = document.getElementById('testimonial-modal');
        const modalBackdrop = document.getElementById('modal-backdrop');
        const modalCloseBtn = document.getElementById('modal-close-btn');
        const modalBottomClose = document.getElementById('modal-bottom-close');
        const modalCtaBtn = document.getElementById('modal-cta-btn');
        const modalDragHandle = document.getElementById('modal-drag-handle');
        const modalSwipeCard = document.getElementById('modal-swipe-card');
        const modalUserName = document.getElementById('modal-user-name');
        const modalLocation = document.getElementById('modal-location');
        const modalTransitionPill = document.getElementById('modal-transition-pill');
        const modalAvatar = document.getElementById('modal-avatar');
        const modalAvatarInitials = document.getElementById('modal-avatar-initials');
        const modalQuoteText = document.getElementById('modal-quote-text');

        function populateData(data) {
            if (modalUserName) modalUserName.textContent = data.name;
            if (modalLocation) modalLocation.innerHTML = `<i class="ph ph-map-pin"></i> ${data.location}`;
            if (modalTransitionPill) modalTransitionPill.innerHTML = `<i class="ph-bold ph-key"></i> ${data.transition}`;
            if (modalQuoteText) modalQuoteText.textContent = `"${data.quote}"`;
            if (modalAvatar) {
                modalAvatar.style.background = data.accent;
            }
            if (modalAvatarInitials) {
                modalAvatarInitials.textContent = data.initials;
            }
        }

        function openModal(idx) {
            const data = reviewsData[idx % reviewsData.length];
            if (data) populateData(data);
            if (modal) {
                modal.classList.add('is-open');
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            }
            isHovered = true;
        }

        function closeModal() {
            if (modal) {
                modal.classList.remove('is-open');
                modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
            setTimeout(() => { isHovered = false; }, 1500);
        }

        // Global hook for inline handlers
        window.closeReviewModal = closeModal;

        // Card Click Handler (only fires if user tapped, not dragged)
        cards.forEach((card) => {
            card.addEventListener('click', () => {
                if (!hasMovedSignificantly) {
                    const idx = parseInt(card.getAttribute('data-index') || '0', 10);
                    openModal(idx);
                }
            });
        });

        // Close Handlers
        if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
        if (modalBottomClose) modalBottomClose.addEventListener('click', closeModal);
        if (modalCtaBtn) modalCtaBtn.addEventListener('click', closeModal);
        if (modalDragHandle) modalDragHandle.addEventListener('click', closeModal);
        if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

        // Click outside the card anywhere to close
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (!e.target.closest('#modal-swipe-card')) {
                    closeModal();
                }
            });
        }

        // Keyboard Controls (Escape key to dismiss)
        window.addEventListener('keydown', (e) => {
            if (!modal || !modal.classList.contains('is-open')) return;
            if (e.key === 'Escape') closeModal();
        });

        // Mobile Drag-Down to dismiss
        if (modalSwipeCard) {
            let touchStartY = 0;

            modalSwipeCard.addEventListener('touchstart', (e) => {
                if (e.touches.length > 0) {
                    touchStartY = e.touches[0].clientY;
                }
            }, { passive: true });

            modalSwipeCard.addEventListener('touchend', (e) => {
                if (e.changedTouches.length === 0) return;
                const diffY = e.changedTouches[0].clientY - touchStartY;

                // Vertical Swipe Down to dismiss
                if (diffY > 60) {
                    closeModal();
                }
            }, { passive: true });
        }
    }

    // --- PWA Service Worker & Splash Screen Control ---
    if ('serviceWorker' in navigator) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Auto-clear cache and unregister on localhost so updates always show instantly
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                for (let r of registrations) r.unregister();
            });
            if ('caches' in window) {
                caches.keys().then((names) => {
                    for (let n of names) caches.delete(n);
                });
            }
        } else {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(() => {});
            });
        }
    }

    const splashScreen = document.getElementById('koh-splash-screen');

    function dismissSplash() {
        if (splashScreen && !splashScreen.classList.contains('is-hidden')) {
            splashScreen.classList.add('is-hidden');
        }
    }

    if (splashScreen) {
        // Tap/click anywhere to immediately skip splash screen
        splashScreen.addEventListener('click', dismissSplash);

        // Check if user already saw the splash screen in this browser session
        const hasSeenSplash = sessionStorage.getItem('koh_splash_seen');
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

        if (hasSeenSplash && !isStandalone) {
            // Immediately hide if already seen during this browser session
            splashScreen.classList.add('is-hidden');
        } else {
            sessionStorage.setItem('koh_splash_seen', 'true');
            // Smoothly auto-dismiss after 1.2s luxury intro
            const timer = setTimeout(dismissSplash, 1200);
            window.addEventListener('beforeunload', () => clearTimeout(timer));
        }
    }
});
