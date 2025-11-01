/**
 * Homepage Analytics Tracking Script
 * 
 * This script collects detailed analytics data from the homepage
 * for paid traffic analysis and conversion tracking.
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        API_ENDPOINT: '/api/analytics/homepage',
        HEARTBEAT_INTERVAL: 30000, // 30 seconds
        SESSION_TIMEOUT: 1800000, // 30 minutes
        MAX_RETRIES: 3,
        RETRY_DELAY: 1000
    };
    
    // Global state
    let sessionId = null;
    let startTime = Date.now();
    let lastActivity = Date.now();
    let heartbeatInterval = null;
    let isTracking = false;
    let pageViews = 1;
    let conversionGoals = [];
    let sectionTimes = {}; // Track time spent in each section
    let currentSection = null;
    let sectionStartTime = null;
    
    /**
     * Initialize tracking
     */
    function init() {
        try {
            // Get or create session ID
            sessionId = getSessionId();
            
            // Start tracking
            startTracking();
            
            // Track page visibility changes
            document.addEventListener('visibilitychange', handleVisibilityChange);
            
            // Track user activity
            trackUserActivity();
            
            // Track conversion goals
            trackConversionGoals();
            
            // Track UTM parameters
            trackUTMParameters();
            
            // Track button clicks
            trackButtonClicks();
            
            // Track section visibility
            setupSectionTracking();
            
            // Send initial page view
            sendHomepageView();
            
        } catch (error) {
            console.error('Homepage Analytics: Initialization error', error);
        }
    }
    
    /**
     * Get or create session ID
     */
    function getSessionId() {
        try {
            let stored = sessionStorage.getItem('zag_homepage_session_id');
            if (stored) {
                return stored;
            }
            
            const newSessionId = 'homepage_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('zag_homepage_session_id', newSessionId);
            return newSessionId;
        } catch (error) {
            // Fallback if sessionStorage is not available
            return 'homepage_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
    }
    
    /**
     * Start tracking session
     */
    function startTracking() {
        isTracking = true;
        
        // Set up heartbeat
        heartbeatInterval = setInterval(() => {
            if (isTracking && (Date.now() - lastActivity) < CONFIG.SESSION_TIMEOUT) {
                sendHeartbeat();
            }
        }, CONFIG.HEARTBEAT_INTERVAL);
        
        // Track page unload
        window.addEventListener('beforeunload', handlePageUnload);
        window.addEventListener('pagehide', handlePageUnload);
        
        // Track page views
        window.addEventListener('popstate', trackPageView);
    }
    
    /**
     * Track user activity
     */
    function trackUserActivity() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                lastActivity = Date.now();
            }, { passive: true });
        });
    }
    
    /**
     * Track conversion goals
     */
    function trackConversionGoals() {
        // Track signup conversions
        document.addEventListener('click', function(event) {
            const element = event.target.closest('[data-conversion="signup"]');
            if (element) {
                trackConversion('signup', 0);
            }
        });
        
        // Track purchase conversions
        document.addEventListener('click', function(event) {
            const element = event.target.closest('[data-conversion="purchase"]');
            if (element) {
                const value = parseFloat(element.getAttribute('data-value')) || 0;
                trackConversion('purchase', value);
            }
        });
        
        // Track contact conversions
        document.addEventListener('click', function(event) {
            const element = event.target.closest('[data-conversion="contact"]');
            if (element) {
                trackConversion('contact', 0);
            }
        });
        
        // Track download conversions
        document.addEventListener('click', function(event) {
            const element = event.target.closest('[data-conversion="download"]');
            if (element) {
                trackConversion('download', 0);
            }
        });
    }
    
    /**
     * Track UTM parameters
     */
    function trackUTMParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const utmData = {
            utm_source: urlParams.get('utm_source'),
            utm_medium: urlParams.get('utm_medium'),
            utm_campaign: urlParams.get('utm_campaign'),
            utm_content: urlParams.get('utm_content'),
            utm_term: urlParams.get('utm_term')
        };
        
        // Store UTM data in session storage
        sessionStorage.setItem('zag_utm_data', JSON.stringify(utmData));
    }
    
    /**
     * Track page view
     */
    function trackPageView() {
        pageViews++;
        sendPageView();
    }
    
    /**
     * Track conversion
     */
    function trackConversion(goal, value) {
        const conversion = {
            goal: goal,
            value: value,
            timestamp: new Date().toISOString()
        };
        
        conversionGoals.push(conversion);
        
        // Send conversion immediately
        sendConversion(conversion);
    }
    
    /**
     * Handle page visibility changes
     */
    function handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden, send current session data
            sendSessionData();
        } else {
            // Page is visible again, update last activity
            lastActivity = Date.now();
        }
    }
    
    /**
     * Handle page unload
     */
    function handlePageUnload() {
        if (isTracking) {
            isTracking = false;
            
            // Calculate session duration
            const duration = Math.floor((Date.now() - startTime) / 1000);
            
            // Send final session data
            sendSessionData(duration);
        }
    }
    
    /**
     * Send initial homepage view
     */
    function sendHomepageView() {
        const utmData = JSON.parse(sessionStorage.getItem('zag_utm_data') || '{}');
        
        const data = {
            type: 'homepage_view',
            session_id: sessionId,
            timestamp: new Date().toISOString(),
            referrer: document.referrer || null,
            utm_source: utmData.utm_source || null,
            utm_medium: utmData.utm_medium || null,
            utm_campaign: utmData.utm_campaign || null,
            utm_content: utmData.utm_content || null,
            utm_term: utmData.utm_term || null,
            user_agent: navigator.userAgent,
            device_info: getDeviceInfo(),
            traffic_source: getTrafficSource(),
            campaign_name: utmData.utm_campaign || null,
            landing_page: window.location.href,
            duration_seconds: 0,
            page_views: pageViews
        };
        
        sendData(data);
    }
    
    /**
     * Send page view
     */
    function sendPageView() {
        const data = {
            type: 'page_view',
            session_id: sessionId,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            page_views: pageViews
        };
        
        sendData(data);
    }
    
    /**
     * Send conversion
     */
    function sendConversion(conversion) {
        const data = {
            type: 'conversion',
            session_id: sessionId,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            conversion_goal: conversion.goal,
            conversion_value: conversion.value
        };
        
        sendData(data);
    }
    
    /**
     * Send heartbeat
     */
    function sendHeartbeat() {
        const data = {
            type: 'heartbeat',
            session_id: sessionId,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            duration_seconds: Math.floor((Date.now() - startTime) / 1000)
        };
        
        sendData(data);
    }
    
    /**
     * Send session data
     */
    function sendSessionData(duration = null) {
        const data = {
            type: 'session_end',
            session_id: sessionId,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            duration_seconds: duration || Math.floor((Date.now() - startTime) / 1000),
            page_views: pageViews,
            conversion_goals: conversionGoals
        };
        
        sendData(data);
    }
    
    /**
     * Send data to backend
     */
    function sendData(data, retryCount = 0) {
        try {
            // Use sendBeacon for reliability
            if (navigator.sendBeacon) {
                const success = navigator.sendBeacon(
                    CONFIG.API_ENDPOINT,
                    JSON.stringify(data)
                );
                
                if (!success && retryCount < CONFIG.MAX_RETRIES) {
                    setTimeout(() => {
                        sendData(data, retryCount + 1);
                    }, CONFIG.RETRY_DELAY * (retryCount + 1));
                }
            } else {
                // Fallback to fetch
                fetch(CONFIG.API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data),
                    keepalive: true
                }).catch(error => {
                    if (retryCount < CONFIG.MAX_RETRIES) {
                        setTimeout(() => {
                            sendData(data, retryCount + 1);
                        }, CONFIG.RETRY_DELAY * (retryCount + 1));
                    }
                });
            }
        } catch (error) {
            console.error('Homepage Analytics: Send data error', error);
        }
    }
    
    /**
     * Get device information
     */
    function getDeviceInfo() {
        const userAgent = navigator.userAgent;
        
        // Detect device type
        let deviceType = 'desktop';
        if (new RegExp('Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini', 'i').test(userAgent)) {
            deviceType = 'mobile';
        } else if (new RegExp('iPad|Android.*Tablet|Tablet', 'i').test(userAgent)) {
            deviceType = 'tablet';
        }
        
        // Detect browser
        let browser = 'Unknown';
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        else if (userAgent.includes('Opera')) browser = 'Opera';
        
        // Detect OS
        let os = 'Unknown';
        if (userAgent.includes('Windows')) os = 'Windows';
        else if (userAgent.includes('Mac')) os = 'macOS';
        else if (userAgent.includes('Linux')) os = 'Linux';
        else if (userAgent.includes('Android')) os = 'Android';
        else if (userAgent.includes('iOS')) os = 'iOS';
        
        return {
            device_type: deviceType,
            browser: browser,
            os: os
        };
    }
    
    /**
     * Get traffic source
     */
    function getTrafficSource() {
        const referrer = document.referrer;
        const utmSource = new URLSearchParams(window.location.search).get('utm_source');
        
        if (utmSource) {
            return 'paid';
        } else if (referrer) {
            if (referrer.includes('google')) return 'organic';
            else if (referrer.includes('facebook') || referrer.includes('instagram')) return 'social';
            else return 'referral';
        } else {
            return 'direct';
        }
    }
    
    /**
     * Track button clicks
     */
    function trackButtonClicks() {
        document.addEventListener('click', function(event) {
            const target = event.target;
            
            // Check if it's a button or link
            if (target.tagName === 'BUTTON' || 
                (target.tagName === 'A' && target.href) ||
                target.closest('button') ||
                target.closest('a[href]')) {
                
                const button = target.closest('button') || target.closest('a[href]') || target;
                const buttonId = button.id || button.className || 'unknown';
                const buttonText = button.textContent?.trim() || button.getAttribute('aria-label') || 'unknown';
                const buttonType = button.tagName.toLowerCase();
                
                sendButtonClick(buttonId, buttonText, buttonType);
            }
        });
    }
    
    /**
     * Setup section tracking
     */
    function setupSectionTracking() {
        // Define sections to track for homepage
        const sections = [
            { id: 'header', selector: 'header, .header, nav, .nav' },
            { id: 'hero', selector: '.hero, .banner, .main-banner, .jumbotron' },
            { id: 'content', selector: 'main, .content, .main-content, .container' },
            { id: 'features', selector: '.features, .benefits, .services' },
            { id: 'cta', selector: '.cta, .call-to-action, .signup, .contact' },
            { id: 'footer', selector: 'footer, .footer' }
        ];
        
        // Create intersection observer for section tracking
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const sectionId = entry.target.getAttribute('data-section-id');
                if (sectionId) {
                    if (entry.isIntersecting) {
                        // Section entered viewport
                        if (currentSection && currentSection !== sectionId) {
                            // Save time for previous section
                            const timeSpent = Math.floor((Date.now() - sectionStartTime) / 1000);
                            if (timeSpent > 0) {
                                sectionTimes[currentSection] = (sectionTimes[currentSection] || 0) + timeSpent;
                                sendSectionTime(currentSection, timeSpent);
                            }
                        }
                        currentSection = sectionId;
                        sectionStartTime = Date.now();
                    } else {
                        // Section left viewport
                        if (currentSection === sectionId) {
                            const timeSpent = Math.floor((Date.now() - sectionStartTime) / 1000);
                            if (timeSpent > 0) {
                                sectionTimes[currentSection] = (sectionTimes[currentSection] || 0) + timeSpent;
                                sendSectionTime(currentSection, timeSpent);
                            }
                            currentSection = null;
                            sectionStartTime = null;
                        }
                    }
                }
            });
        }, {
            threshold: 0.5, // Trigger when 50% of section is visible
            rootMargin: '0px'
        });
        
        // Observe all sections
        sections.forEach(section => {
            const elements = document.querySelectorAll(section.selector);
            elements.forEach(element => {
                element.setAttribute('data-section-id', section.id);
                observer.observe(element);
            });
        });
        
        // Fallback: track scroll position for general section detection
        let scrollTimeout = null;
        
        window.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                // User stopped scrolling, update current section
                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                
                let sectionId = 'content'; // Default
                
                if (scrollY < windowHeight * 0.3) {
                    sectionId = 'header';
                } else if (scrollY > documentHeight - windowHeight * 1.5) {
                    sectionId = 'footer';
                } else if (scrollY < windowHeight * 1.5) {
                    sectionId = 'hero';
                } else if (scrollY < windowHeight * 3) {
                    sectionId = 'features';
                } else if (scrollY > documentHeight - windowHeight * 2) {
                    sectionId = 'cta';
                } else {
                    sectionId = 'content';
                }
                
                if (currentSection !== sectionId) {
                    if (currentSection && sectionStartTime) {
                        const timeSpent = Math.floor((Date.now() - sectionStartTime) / 1000);
                        if (timeSpent > 0) {
                            sectionTimes[currentSection] = (sectionTimes[currentSection] || 0) + timeSpent;
                            sendSectionTime(currentSection, timeSpent);
                        }
                    }
                    currentSection = sectionId;
                    sectionStartTime = Date.now();
                }
            }, 1000); // Wait 1 second after scroll stops
        });
    }
    
    /**
     * Send button click event
     */
    function sendButtonClick(buttonId, buttonText, buttonType) {
        const data = {
            type: 'button_click',
            session_id: sessionId,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            button_id: buttonId,
            button_text: buttonText,
            button_type: buttonType
        };
        
        sendData(data);
    }
    
    /**
     * Send section time event
     */
    function sendSectionTime(sectionId, timeSpent) {
        const data = {
            type: 'section_time',
            session_id: sessionId,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            section_id: sectionId,
            time_spent_seconds: timeSpent
        };
        
        sendData(data);
    }
    
    /**
     * Clean up tracking
     */
    function cleanup() {
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
        }
        isTracking = false;
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Clean up on page unload
    window.addEventListener('beforeunload', cleanup);
    
    // Expose functions globally (for testing)
    window.zagHomepageAnalytics = {
        cleanup: cleanup,
        getSessionId: () => sessionId,
        getPageViews: () => pageViews,
        getConversionGoals: () => conversionGoals,
        trackConversion: trackConversion
    };
    
})();
