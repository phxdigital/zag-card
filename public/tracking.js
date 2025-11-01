/**
 * ZAG NFC Analytics Tracking Script
 * 
 * This script collects analytics data from NFC pages and sends it to the backend.
 * It's designed to be lightweight, non-blocking, and privacy-focused.
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        API_ENDPOINT: '/api/analytics/track',
        HEARTBEAT_INTERVAL: 30000, // 30 seconds
        SESSION_TIMEOUT: 1800000, // 30 minutes
        MAX_RETRIES: 3,
        RETRY_DELAY: 1000
    };
    
    // Global state
    let sessionId = null;
    let pageId = null;
    let startTime = Date.now();
    let lastActivity = Date.now();
    let heartbeatInterval = null;
    let isTracking = false;
    let clickedLinks = [];
    let sectionTimes = {}; // Track time spent in each section
    let currentSection = null;
    let sectionStartTime = null;
    
    /**
     * Initialize tracking
     */
    function init() {
        try {
            // Get page ID from window object
            pageId = window.__PAGE_ID__;
            if (!pageId) {
                console.warn('ZAG Analytics: Page ID not found');
                return;
            }
            
            // Get or create session ID
            sessionId = getSessionId();
            
            // Start tracking
            startTracking();
            
            // Track page visibility changes
            document.addEventListener('visibilitychange', handleVisibilityChange);
            
            // Track user activity
            trackUserActivity();
            
            // Track link clicks
            trackLinkClicks();
            
            // Track button clicks
            trackButtonClicks();
            
            // Track section visibility
            setupSectionTracking();
            
            // Send initial page view
            sendPageView();
            
        } catch (error) {
            console.error('ZAG Analytics: Initialization error', error);
        }
    }
    
    /**
     * Get or create session ID
     */
    function getSessionId() {
        try {
            let stored = sessionStorage.getItem('zag_session_id');
            if (stored) {
                return stored;
            }
            
            const newSessionId = 'zag_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('zag_session_id', newSessionId);
            return newSessionId;
        } catch (error) {
            // Fallback if sessionStorage is not available
            return 'zag_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
    }
    
    /**
     * Track user activity
     */
    function trackUserActivity() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                lastActivity = Date.now();
            }, { passive: true });
        });
    }
    
    /**
     * Track link clicks
     */
    function trackLinkClicks() {
        document.addEventListener('click', function(event) {
            try {
                const element = event.target.closest('[data-track]');
                if (element) {
                    const linkId = element.getAttribute('data-track');
                    const linkText = element.textContent?.trim() || linkId;
                    
                    clickedLinks.push({
                        link_id: linkId,
                        link_text: linkText,
                        clicked_at: new Date().toISOString()
                    });
                    
                    // Send click event immediately
                    sendClickEvent(linkId, linkText);
                }
            } catch (error) {
                console.error('ZAG Analytics: Click tracking error', error);
            }
        });
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
     * Send initial page view
     */
    function sendPageView() {
        const data = {
            type: 'page_view',
            page_id: pageId,
            session_id: sessionId,
            timestamp: new Date().toISOString(),
            referrer: document.referrer || null,
            utm_source: getUrlParameter('utm_source'),
            utm_medium: getUrlParameter('utm_medium'),
            utm_campaign: getUrlParameter('utm_campaign'),
            user_agent: navigator.userAgent,
            device_info: getDeviceInfo(),
            duration_seconds: 0,
            clicked_links: []
        };
        
        sendData(data);
    }
    
    /**
     * Send heartbeat
     */
    function sendHeartbeat() {
        const data = {
            type: 'heartbeat',
            page_id: pageId,
            session_id: sessionId,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            duration_seconds: Math.floor((Date.now() - startTime) / 1000)
        };
        
        sendData(data);
    }
    
    /**
     * Send click event
     */
    function sendClickEvent(linkId, linkText) {
        const data = {
            type: 'click',
            page_id: pageId,
            session_id: sessionId,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            link_id: linkId,
            link_text: linkText
        };
        
        sendData(data);
    }
    
    /**
     * Send session data
     */
    function sendSessionData(duration = null) {
        const data = {
            type: 'session_end',
            page_id: pageId,
            session_id: sessionId,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            duration_seconds: duration || Math.floor((Date.now() - startTime) / 1000),
            clicked_links: clickedLinks,
            section_times: sectionTimes
        };
        
        sendData(data);
    }
    
    /**
     * Send button click event
     */
    function sendButtonClick(buttonId, buttonText, buttonType) {
        const data = {
            type: 'button_click',
            page_id: pageId,
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
            page_id: pageId,
            session_id: sessionId,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            section_id: sectionId,
            time_spent_seconds: timeSpent
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
            console.error('ZAG Analytics: Send data error', error);
        }
    }
    
    /**
     * Get device information
     */
    function getDeviceInfo() {
        const userAgent = navigator.userAgent;
        
        // Detect device type
        let deviceType = 'desktop';
        if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            deviceType = 'mobile';
        } else if (/iPad|Android.*Tablet|Tablet/i.test(userAgent)) {
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
     * Get URL parameter
     */
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
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
        // Define sections to track
        const sections = [
            { id: 'header', selector: 'header, .header' },
            { id: 'hero', selector: '.hero, .banner, .main-banner' },
            { id: 'content', selector: 'main, .content, .main-content' },
            { id: 'sidebar', selector: '.sidebar, .aside' },
            { id: 'footer', selector: 'footer, .footer' },
            { id: 'navigation', selector: 'nav, .nav, .navigation' }
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
        let lastScrollTime = Date.now();
        let scrollTimeout = null;
        
        window.addEventListener('scroll', () => {
            lastScrollTime = Date.now();
            
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
    
    // Expose cleanup function globally (for testing)
    window.zagAnalytics = {
        cleanup: cleanup,
        getSessionId: () => sessionId,
        getClickedLinks: () => clickedLinks
    };
    
})();
