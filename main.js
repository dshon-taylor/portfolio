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

// Attach click event handlers to the project links
projectLinks.forEach(link => {
    link.addEventListener("click", openProject);
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

// Elements to mark aria-hidden when modal is open
const pageHeader = document.querySelector('header');
const pageMain = document.querySelector('main');
const pageFooter = document.querySelector('footer');

// Focusable elements inside the overlay for focus trapping
function getOverlayFocusable() {
    const focusables = [];
    if (iframeCloseBtn) focusables.push(iframeCloseBtn);
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

// Open/close the project window
function openProject(event) {
    // prevent the default anchor navigation
    event.preventDefault();
    const link = event.currentTarget;
    const url = link.href;
    // load url into iframe and show overlay
    if (iframe) iframe.src = url;
    iframeContainer.style.display = "flex";
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
    // unlock background scrolling
    document.body.classList.remove('no-scroll');
    // restore background to assistive tech
    if (pageHeader) pageHeader.removeAttribute('aria-hidden');
    if (pageMain) pageMain.removeAttribute('aria-hidden');
    if (pageFooter) pageFooter.removeAttribute('aria-hidden');
    // stop the iframe content
    if (iframe) iframe.src = '';
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