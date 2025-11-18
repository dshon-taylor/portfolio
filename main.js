// Get references to DOM elements
const resumeTitle = document.getElementById("resume-title");
const projectsTitle = document.getElementById("projects-title");
const projects = document.getElementById("projects");
const resume = document.getElementById("resume");
const visibleSection = document.getElementById("visible-section");
const selectionBar = document.getElementById("selection-bar");
const icons = document.getElementsByClassName("icon");
const selectSection = document.getElementById("projects-resume");
const backToTopButton = document.getElementById("back-to-top");
const skillsSection = document.getElementById("skills");
const contactSection = document.getElementById("contact");
// Only select anchor elements with the project-link class (there are also divs with that class)
const projectLinks = document.querySelectorAll("a.project-link");
const iframeContainer = document.getElementById("iframe-container");
const iframe = document.getElementById("project-window");
const openExternalBtn = document.getElementById('open-external');
const iframeMessage = document.getElementById('iframe-message');
const iframeMessageLink = document.getElementById('iframe-message-link');
const iframeThumb = document.getElementById('iframe-thumb');

// Detect if the user is on a mobile device
function isMobileDevice() {
    return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)) && 
           (window.innerWidth <= 1024);
}

// Track which project container is currently showing details on mobile
let mobileActiveContainer = null;

// Attach click event handlers to the project links
projectLinks.forEach(link => {
    if (isMobileDevice()) {
        // Mobile: first tap shows details, second tap opens project
        link.addEventListener("click", handleMobileProjectClick);
        // Also attach touchend for better mobile support
        link.addEventListener("touchend", handleMobileProjectClick, { passive: false });
    } else {
        // Desktop: single click opens project
        link.addEventListener("click", openProject);
    }
});

// Attach click event handler to close the project window
iframeContainer.addEventListener("click", (event) => {
    if (event.target === iframeContainer) {
        closeProject();
    }
});

// Close button inside the iframe overlay
const iframeCloseBtn = document.getElementById('iframe-close');
if (iframeCloseBtn) {
    iframeCloseBtn.addEventListener('click', closeProject);
}

// External open button (open project in new tab)
if (openExternalBtn) {
    openExternalBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = openExternalBtn.dataset.url;
        if (url) {
            window.open(url, '_blank', 'noopener');
        }
    });
    // hide by default until a project is opened
    openExternalBtn.style.display = 'none';
}

// Elements to mark aria-hidden when modal is open
const pageHeader = document.querySelector('header');
const pageMain = document.querySelector('main');
const pageFooter = document.querySelector('footer');

// Focusable elements inside the overlay for focus trapping
function getOverlayFocusable() {
    const focusables = [];
    if (iframeCloseBtn) focusables.push(iframeCloseBtn);
    if (openExternalBtn) focusables.push(openExternalBtn);
    if (iframe) focusables.push(iframe);
    return focusables;
}

// Keydown handler for Escape and Tab focus trapping
function handleOverlayKeydown(e) {
    if (!iframeContainer || iframeContainer.style.display === 'none') return;
    if (e.key === 'Escape') {
        e.preventDefault();
        closeProject();
        return;
    }

    if (e.key === 'Tab') {
        const focusables = getOverlayFocusable();
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey) {
            if (active === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (active === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }
}

// Parent message handler: respond to requests from framed apps (e.g. open auth in new tab)
window.addEventListener('message', (e) => {
    // NOTE: for security, restrict allowed origins in production. Example:
    // const allowed = ['https://jammming-dshon.netlify.app'];
    // if (!allowed.includes(e.origin)) return;

    const data = e.data;
    if (!data || typeof data !== 'object') return;

    // { type: 'open-auth', url: 'https://...' }
    if (data.type === 'open-auth' && typeof data.url === 'string') {
        try {
            window.open(data.url, '_blank', 'noopener');
        } catch (err) {
            // ignore
        }
        return;
    }

    // { type: 'open-external', url: 'https://...' }
    if (data.type === 'open-external' && typeof data.url === 'string') {
        try {
            window.open(data.url, '_blank', 'noopener');
        } catch (err) {
            // ignore
        }
        return;
    }

    // future message types can be handled here (e.g. theme, close-overlay)
});

// Handle mobile project clicks (two-tap behavior)
function handleMobileProjectClick(event) {
    event.preventDefault();
    const link = event.currentTarget;
    const container = link.closest('.project-container');
    
    // If this container is not currently showing details
    if (!container.classList.contains('mobile-active')) {
        // Remove mobile-active from any other container
        if (mobileActiveContainer && mobileActiveContainer !== container) {
            mobileActiveContainer.classList.remove('mobile-active');
        }
        // Show details for this container
        container.classList.add('mobile-active');
        mobileActiveContainer = container;
    } else {
        // Container already showing details, so open the project
        container.classList.remove('mobile-active');
        mobileActiveContainer = null;
        openProject(event);
    }
}

// Close mobile details when clicking outside on mobile
if (isMobileDevice()) {
    document.addEventListener('click', function(event) {
        // Check if click is outside any project container
        if (mobileActiveContainer && !event.target.closest('.project-container')) {
            mobileActiveContainer.classList.remove('mobile-active');
            mobileActiveContainer = null;
        }
    });
}

// Open/close the project window
function openProject(event) {
    // prevent the default anchor navigation
    event.preventDefault();
    const link = event.currentTarget;
    const url = link.href;
    // If the clicked link carries a 'dark' class, mirror that on the close button
    if (iframeCloseBtn) {
        if (link.classList.contains('dark')) {
            iframeCloseBtn.classList.add('dark');
        } else {
            iframeCloseBtn.classList.remove('dark');
        }
    }
    // configure external-open button
    if (openExternalBtn) {
        openExternalBtn.dataset.url = url;
        openExternalBtn.style.display = 'inline-flex';
        if (link.classList.contains('dark')) openExternalBtn.classList.add('dark'); else openExternalBtn.classList.remove('dark');
    }
    // Decide whether to load the project in the iframe or show the external-open notice.
    const requiresExternal = link.classList && link.classList.contains('requires-external');
    iframeContainer.style.display = "flex";
    // Only set the thumbnail for projects that explicitly opt in via the
    // "requires-external" class. For other projects we keep a white dialog
    // (no thumbnail) so the iframe content is the primary focus.
    try {
        const container = link.closest('.project-container');
        const projectImg = container ? container.querySelector('img') : null;
        if (requiresExternal && projectImg && iframeThumb) {
            // Show a stronger thumbnail for external-only projects
            iframeThumb.src = projectImg.src;
            iframeThumb.classList.add('thumb-strong');
            iframeThumb.style.display = 'block';
        } else if (iframeThumb) {
            // Hide for non-external projects
            iframeThumb.style.display = 'none';
            iframeThumb.classList.remove('thumb-strong');
            iframeThumb.src = '';
        }
    } catch (err) {
        if (iframeThumb) {
            iframeThumb.style.display = 'none';
            iframeThumb.classList.remove('thumb-strong');
            try { iframeThumb.src = ''; } catch (e) { /* ignore */ }
        }
    }
    if (requiresExternal) {
        // For projects that use OAuth or don't work in iframes, show a message
        // and do NOT load the iframe. This is opt-in via the "requires-external" class.
        if (iframe) {
            try { iframe.style.display = 'none'; } catch (err) { /* ignore */ }
        }
        if (iframeMessage) {
            iframeMessage.style.display = 'flex';
            const msgText = document.getElementById('iframe-message-text');
            if (msgText) {
                try {
                    const u = new URL(url);
                    // Keep the paragraph text but wire the anchor to the project URL
                    msgText.firstChild && (msgText.firstChild.textContent = `This project requires opening in a new window. `);
                } catch (err) {
                    // leave default text before anchor
                }
            }
            // set the link href so clicking the text opens the project
            if (iframeMessageLink) {
                try {
                    iframeMessageLink.href = url;
                    iframeMessageLink.setAttribute('title', `Open ${url} in a new window`);
                } catch (err) { /* ignore */ }
            }
        }
    } else {
        // Default behavior: load the project into the iframe inside the overlay
        if (iframe) {
            try { iframe.style.display = ''; iframe.src = url; } catch (err) { /* ignore */ }
        }
        if (iframeMessage) iframeMessage.style.display = 'none';
    }
    // lock background scrolling
    document.body.classList.add('no-scroll');
    // hide background from assistive tech
    if (pageHeader) pageHeader.setAttribute('aria-hidden', 'true');
    if (pageMain) pageMain.setAttribute('aria-hidden', 'true');
    if (pageFooter) pageFooter.setAttribute('aria-hidden', 'true');
    // focus iframe for keyboard scroll
    // focus close button first (more discoverable), then iframe
    if (iframeCloseBtn) {
        iframeCloseBtn.focus();
    } else if (iframe) {
        iframe.focus();
    }
    // attach keydown handler to trap focus and close on Escape
    document.addEventListener('keydown', handleOverlayKeydown);
}

function closeProject() {
    iframeContainer.style.display = "none";
    // Clear mobile active state when closing project
    if (mobileActiveContainer) {
        mobileActiveContainer.classList.remove('mobile-active');
        mobileActiveContainer = null;
    }
    // unlock background scrolling
    document.body.classList.remove('no-scroll');
    // restore background to assistive tech
    if (pageHeader) pageHeader.removeAttribute('aria-hidden');
    if (pageMain) pageMain.removeAttribute('aria-hidden');
    if (pageFooter) pageFooter.removeAttribute('aria-hidden');
    // stop the iframe content
    if (iframe) {
        try { iframe.src = ''; iframe.style.display = ''; } catch (err) { /* ignore */ }
    }
    if (iframeMessage) {
        iframeMessage.style.display = 'none';
    }
    if (iframeMessageLink) {
        try { iframeMessageLink.href = '#'; iframeMessageLink.removeAttribute('title'); } catch (err) { /* ignore */ }
    }
    if (iframeThumb) {
        try { iframeThumb.style.display = 'none'; iframeThumb.classList.remove('thumb-strong'); iframeThumb.src = ''; } catch (err) { /* ignore */ }
    }
    // reset close button theme classes
    if (iframeCloseBtn) iframeCloseBtn.classList.remove('dark');
    // hide/clear open-external button
    if (openExternalBtn) {
        openExternalBtn.style.display = 'none';
        delete openExternalBtn.dataset.url;
        openExternalBtn.classList.remove('dark');
    }
    // remove keydown handler
    document.removeEventListener('keydown', handleOverlayKeydown);
}

// Show/hide the back to top button based on scroll position
window.onscroll = function() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        backToTopButton.style.display = "block";
    } else {
        backToTopButton.style.display = "none";
    }
};

// Scroll to the top of the page
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Scroll to the visible section (projects/resume)
function scrollToVisibleSection() {
    selectSection.scrollIntoView({ behavior: 'smooth' });
}

// Scroll to the skills section
function scrollToSkills() {
    skillsSection.scrollIntoView({ behavior: 'smooth' });
}

// Scroll to the contact section
function scrollToContact() {
    contactSection.scrollIntoView({ behavior: 'smooth' });
}

// Show the resume section and hide the projects section
function resumeVisible() {
    if (!(resume.classList.contains("visible"))) {
        resume.classList.add("visible");
        projects.classList.remove("visible");
        resumeTitle.classList.add("active");
        projectsTitle.classList.remove("active");
        visibleSection.style.justifyContent = "end";
        selectionBar.style.left = "100%";
        selectionBar.style.translate = "-100%";
        resume.style.translate = "0px";
        resume.style.height = "auto";
        projects.style.translate = "-100px";
        projects.style.height = "0";
    }
    scrollToVisibleSection();
}

// Show the projects section and hide the resume section
function projectsVisible() {
    if (!(projects.classList.contains("visible"))) {
        projects.classList.add("visible");
        resume.classList.remove("visible");
        resumeTitle.classList.remove("active");
        projectsTitle.classList.add("active");
        visibleSection.style.justifyContent = "start";
        selectionBar.style.left = "0";
        selectionBar.style.translate = "0";
        resume.style.translate = "100px";
        resume.style.height = "0";
        projects.style.translate = "0px";
        projects.style.height = "auto";
    }
    scrollToVisibleSection();
}

// Attach click event handlers to the section titles
resumeTitle.onclick = resumeVisible;
projectsTitle.onclick = projectsVisible;

// Convert HTMLCollection to an array and add rotation effect on hover
const iconsArray = Array.from(icons);

iconsArray.forEach(icon => {
    let rotation = 0;
    icon.parentNode.onmouseover = () => {
        rotation += 720;
        icon.style.transform = `rotateY(${rotation}deg)`;
    }
});

// Toggle the visibility of the job details
function toggleJobDetails(event) {
    const jobTitle = event.currentTarget;
    const workDetails = jobTitle.nextElementSibling;
    const ul = workDetails.querySelector('ul');

    jobTitle.classList.toggle("active");
    workDetails.classList.toggle("active");

    if (workDetails.classList.contains("active")) {
        ul.style.maxHeight = ul.scrollHeight + "px"; // Set max-height to the scrollHeight
    } else {
        ul.style.maxHeight = "0px"; // Reset max-height
    }
}

// Attach click event handlers to the job titles
const jobTitles = document.querySelectorAll(".job-title");
jobTitles.forEach(title => {
    title.addEventListener("click", toggleJobDetails);
});