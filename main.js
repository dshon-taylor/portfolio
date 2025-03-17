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
const projectLinks = document.querySelectorAll(".project-link");
const iframeContainer = document.getElementById("iframe-container");
const iframe = document.getElementById("project-window");

// Attach click event handlers to the project links
projectLinks.forEach(link => {
    link.addEventListener("click", openProject);
});

iframeContainer.addEventListener("click", (event) => {
    if (event.target === iframeContainer) {
        closeProject();
    }
});

function openProject() {
    iframeContainer.style.display = "grid";
}

function closeProject() {
    iframeContainer.style.display = "none";
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