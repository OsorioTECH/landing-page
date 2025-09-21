// script.js

// Configuración
const CONFIG = {
    PAYPAL_CLIENT_ID: 'TU_CLIENT_ID_DE_PAYPAL', // Reemplazar con tu Client ID real
    COURSE_PRICE: '149.00',
    DRIVE_FOLDER_LINK: 'https://drive.google.com/drive/folders/TU_ID_DE_CARPETA', // Reemplazar con tu link real
    COUNTDOWN_HOURS: 24,
    INITIAL_STOCK: 47,
    TOTAL_STOCK: 200
};

// Variables globales
let countdownInterval;
let currentStock = CONFIG.INITIAL_STOCK;

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeCountdown();
    initializePayPal();
    initializeAnimations();
    updateStockDisplay();
    
    // Simular reducción de stock cada 30 segundos
    setInterval(reduceStock, 30000);
});

// ===== COUNTDOWN TIMER =====
function initializeCountdown() {
    const now = new Date().getTime();
    const countdownTime = now + (CONFIG.COUNTDOWN_HOURS * 60 * 60 * 1000);
    
    countdownInterval = setInterval(function() {
        const now = new Date().getTime();
        const distance = countdownTime - now;
        
        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById("countdown").innerHTML = "¡OFERTA EXPIRADA!";
            return;
        }
        
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Actualizar countdown en header
        document.getElementById("countdown").innerHTML = 
            String(hours).padStart(2, '0') + ":" + 
            String(minutes).padStart(2, '0') + ":" + 
            String(seconds).padStart(2, '0');
        
        // Actualizar countdown en sección de urgencia
        const hoursEl = document.getElementById("hours");
        const minutesEl = document.getElementById("minutes");
        const secondsEl = document.getElementById("seconds");
        
        if (hoursEl) hoursEl.innerHTML = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.innerHTML = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.innerHTML = String(seconds).padStart(2, '0');
        
    }, 1000);
}

// ===== PAYPAL INTEGRATION =====
function initializePayPal() {
    if (typeof paypal === 'undefined') {
        console.error('PayPal SDK no está cargado');
        showFallbackPayment();
        return;
    }

    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: CONFIG.COURSE_PRICE,
                        currency_code: 'USD'
                    },
                    description: 'Pack IA 2025 - Curso Completo de Inteligencia Artificial'
                }]
            });
        },
        
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                console.log('Pago completado:', details);
                
                // Mostrar modal de éxito
                showSuccessModal();
                
                // Enviar datos del pago (opcional)
                sendPaymentData(details);
                
                // Reducir stock
                currentStock = Math.max(0, currentStock - 1);
                updateStockDisplay();
            });
        },
        
        onError: function(err) {
            console.error('Error en el pago:', err);
            alert('Hubo un error procesando tu pago. Por favor, intenta nuevamente.');
        },
        
        onCancel: function(data) {
            console.log('Pago cancelado:', data);
            alert('Pago cancelado. Si cambias de opinión, estaremos aquí para ayudarte.');
        },
        
        style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal',
            height: 50
        }
        
    }).render('#paypal-button-container');
}

// Fallback si PayPal no carga
function showFallbackPayment() {
    const container = document.getElementById('paypal-button-container');
    if (container) {
        container.innerHTML = `
            <div class="fallback-payment">
                <h3>Opciones de Pago</h3>
                <p>Contáctanos para completar tu compra:</p>
                <div class="contact-options">
                    <a href="mailto:ventas@packia2025.com?subject=Compra Pack IA 2025&body=Hola, quiero comprar el Pack IA 2025 por $149" class="contact-btn">
                        <i class="fas fa-envelope"></i>
                        Comprar por Email
                    </a>
                    <a href="https://wa.me/1234567890?text=Hola, quiero comprar el Pack IA 2025 por $149" class="contact-btn" target="_blank">
                        <i class="fab fa-whatsapp"></i>
                        Comprar por WhatsApp
                    </a>
                </div>
            </div>
        `;
    }
}

// ===== MODAL DE ÉXITO =====
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    const courseLink = document.getElementById('course-link');
    
    if (courseLink) {
        courseLink.href = CONFIG.DRIVE_FOLDER_LINK;
    }
    
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Efecto de confetti (opcional)
        createConfetti();
    }
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('success-modal');
    if (event.target === modal) {
        closeModal();
    }
}

// ===== STOCK MANAGEMENT =====
function updateStockDisplay() {
    const stockNumber = document.querySelector('.stock-number');
    const stockFill = document.querySelector('.stock-fill');
    
    if (stockNumber) {
        stockNumber.textContent = currentStock;
    }
    
    if (stockFill) {
        const percentage = (currentStock / CONFIG.TOTAL_STOCK) * 100;
        stockFill.style.width = percentage + '%';
        
        // Cambiar color según el stock
        if (percentage < 20) {
            stockFill.style.background = '#e74c3c';
        } else if (percentage < 50) {
            stockFill.style.background = '#f39c12';
        } else {
            stockFill.style.background = '#2ecc71';
        }
    }
}

function reduceStock() {
    if (currentStock > 10) { // Mantener un mínimo
        const reduction = Math.floor(Math.random() * 3) + 1; // Reducir 1-3 unidades
        currentStock = Math.max(10, currentStock - reduction);
        updateStockDisplay();
        
        // Mostrar notificación de stock bajo
        if (currentStock <= 20) {
            showStockAlert();
        }
    }
}

function showStockAlert() {
    // Crear notificación temporal
    const alert = document.createElement('div');
    alert.className = 'stock-alert';
    alert.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>¡Solo quedan ${currentStock} cupos disponibles!</span>
    `;
    
    // Estilos para la alerta
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f39c12, #e67e22);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 25px rgba(0,0,0,0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        animation: slideInRight 0.5s ease;
    `;
    
    document.body.appendChild(alert);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        alert.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 500);
    }, 5000);
}

// ===== FAQ FUNCTIONALITY =====
function toggleFAQ(element) {
    const answer = element.nextElementSibling;
    const icon = element.querySelector('i');
    
    // Cerrar otras FAQs abiertas
    document.querySelectorAll('.faq-question').forEach(q => {
        if (q !== element) {
            q.classList.remove('active');
            q.nextElementSibling.classList.remove('active');
        }
    });
    
    // Toggle actual FAQ
    element.classList.toggle('active');
    answer.classList.toggle('active');
}

// ===== SMOOTH SCROLLING =====
function scrollToPurchase() {
    const purchaseSection = document.getElementById('purchase-section');
    if (purchaseSection) {
        purchaseSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Efecto de highlight
        purchaseSection.style.animation = 'pulse 1s ease';
        setTimeout(() => {
            purchaseSection.style.animation = '';
        }, 1000);
    }
}

// ===== ANIMATIONS =====
function initializeAnimations() {
    // Intersection Observer para animaciones al scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos para animación
    document.querySelectorAll('.course-category, .benefit-card, .testimonial-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// ===== CONFETTI EFFECT =====
function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#2ecc71', '#f39c12'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
    }
}

function createConfettiPiece(color) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${color};
        left: ${Math.random() * 100}vw;
        top: -10px;
        z-index: 10001;
        border-radius: 50%;
        pointer-events: none;
    `;
    
    document.body.appendChild(confetti);
    
    // Animar caída
    const animation = confetti.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: `translateY(100vh) rotate(720deg)`, opacity: 0 }
    ], {
        duration: Math.random() * 2000 + 1000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
    
    animation.onfinish = () => {
        if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
        }
    };
}

// ===== PAYMENT DATA HANDLING =====
function sendPaymentData(paymentDetails) {
    // Aquí puedes enviar los datos del pago a tu servidor
    const paymentData = {
        orderId: paymentDetails.id,
        payerId: paymentDetails.payer.payer_id,
        amount: paymentDetails.purchase_units[0].amount.value,
        currency: paymentDetails.purchase_units[0].amount.currency_code,
        timestamp: new Date().toISOString(),
        email: paymentDetails.payer.email_address,
        name: paymentDetails.payer.name.given_name + ' ' + paymentDetails.payer.name.surname
    };
    
    // Ejemplo de envío a servidor (opcional)
    /*
    fetch('/api/payment-success', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Pago registrado:', data);
    })
    .catch(error => {
        console.error('Error registrando pago:', error);
    });
    */
    
    console.log('Datos del pago:', paymentData);
}

// ===== UTILITY FUNCTIONS =====
function formatPrice(price) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ===== TRACKING & ANALYTICS =====
function trackEvent(eventName, eventData = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, eventData);
    }
    
    console.log('Event tracked:', eventName, eventData);
}

// Track important events
document.addEventListener('DOMContentLoaded', function() {
    trackEvent('page_view');
    
    // Track CTA clicks
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', () => {
            trackEvent('cta_click', { button_text: button.textContent.trim() });
        });
    });
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            if (maxScroll % 25 === 0) { // Track every 25%
                trackEvent('scroll_depth', { percent: maxScroll });
            }
        }
    });
});

// ===== RESPONSIVE UTILITIES =====
function isMobile() {
    return window.innerWidth <= 768;
}

function adjustForMobile() {
    if (isMobile()) {
        // Ajustes específicos para móvil
        document.querySelectorAll('.cta-button').forEach(button => {
            button.style.width = '100%';
            button.style.marginBottom = '10px';
        });
    }
}

// Ajustar en resize
window.addEventListener('resize', adjustForMobile);

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('Error capturado:', e.error);
    
    // Reportar error crítico (opcional)
    if (e.error && e.error.message.includes('PayPal')) {
        showFallbackPayment();
    }
});

// ===== PERFORMANCE OPTIMIZATION =====
// Lazy loading para imágenes
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ===== SECURITY =====
// Prevenir clic derecho en imágenes importantes
document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

// Prevenir selección de texto en elementos sensibles
document.querySelectorAll('.price-container, .package-price').forEach(el => {
    el.style.userSelect = 'none';
    el.style.webkitUserSelect = 'none';
    el.style.mozUserSelect = 'none';
});

// ===== ADDITIONAL CSS ANIMATIONS =====
const additionalStyles = `
<style>
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

.stock-alert {
    animation: slideInRight 0.5s ease !important;
}

.fallback-payment {
    text-align: center;
    padding: 30px;
    background: linear-gradient(135deg, #667eea15, #764ba215);
    border-radius: 12px;
    border: 2px solid #667eea;
}

.contact-options {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 20px;
    flex-wrap: wrap;
}

.contact-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 12px 24px;
    border-radius: 25px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
}

.contact-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

@media (max-width: 480px) {
    .contact-options {
        flex-direction: column;
    }
    
    .contact-btn {
        width: 100%;
        justify-content: center;
    }
}
</style>
`;

// Insertar estilos adicionales
document.head.insertAdjacentHTML('beforeend', additionalStyles);

// ===== INITIALIZATION =====
// Ejecutar cuando todo esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pack IA 2025 - Página cargada correctamente');
    
    // Inicializar todas las funcionalidades
    initializeLazyLoading();
    adjustForMobile();
    
    // Mensaje de bienvenida en consola
    console.log('%c🚀 Pack IA 2025 - ¡La mejor inversión en tu futuro!', 
                'color: #667eea; font-size: 16px; font-weight: bold;');
});
