
const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');

// Temporary collection: starts empty whenever the page loads
const projects = [];

// Display all projects on the webpage
function renderProjects() {
    projectList.textContent = '';

    projects.forEach(function (project) {
        const item = document.createElement('li');

        const projectName = document.createElement('strong');
        projectName.textContent = project.name;

        const projectStatus = document.createElement('p');
        projectStatus.textContent = 'Status: ' + project.status;

        item.appendChild(projectName);
        item.appendChild(projectStatus);
        projectList.appendChild(item);
    });

    if (emptyState) {
        emptyState.hidden = projects.length > 0;
    }
}

// Handle form submission
form.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const status = statusInput.value;

    // Reject an empty project name
    if (name === '') {
        nameInput.focus();
        return;
    }

    // Create a new project
    const project = {
        id: crypto.randomUUID(),
        name: name,
        status: status
    };

    // Add the project to the collection
    projects.push(project);

    // Display all projects
    renderProjects();

    // Clear the form for the next project
    form.reset();
});

// Show the initial empty state
renderProjects();


