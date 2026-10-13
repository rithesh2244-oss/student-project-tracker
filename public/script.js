const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const formTitle = document.querySelector('#form-title');
const message = document.querySelector('#message');

const STORAGE_KEY = 'workshop-projects-v1';

let projects = [];
let editingId = null;

// Prevent malformed saved data from being overwritten automatically.
let storageWritable = true;

function showMessage(text) {
    message.textContent = text;
}

function resetForm() {
    form.reset();
    editingId = null;

    saveButton.textContent = 'Add Project';
    cancelButton.hidden = true;
    formTitle.textContent = 'Add a Project';
}

function isValidProjects(data) {
    return Array.isArray(data) && data.every(project =>
        project !== null &&
        typeof project === 'object' &&
        !Array.isArray(project) &&
        typeof project.id === 'string' &&
        project.id.length > 0 &&
        typeof project.name === 'string' &&
        project.name.trim().length > 0 &&
        typeof project.status === 'string'
    );
}

function loadProjects() {
    let savedText;

    try {
        savedText = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
        storageWritable = false;
        showMessage(
            'Could not read saved projects from browser storage. ' +
            'Changes cannot be saved.'
        );
        return;
    }

    // No saved data yet: start with an empty collection.
    if (savedText === null) {
        projects = [];
        return;
    }

    try {
        const savedProjects = JSON.parse(savedText);

        if (!isValidProjects(savedProjects)) {
            storageWritable = false;
            showMessage(
                'Saved project data is invalid. It has not been ' +
                'overwritten. Please ask your instructor for help.'
            );
            return;
        }

        projects = savedProjects;
    } catch (error) {
        storageWritable = false;
        showMessage(
            'Saved project data could not be read because it is ' +
            'malformed. It has not been overwritten. ' +
            'Please ask your instructor for help.'
        );
    }
}

function saveProjects() {
    if (!storageWritable) {
        showMessage(
            'Changes are only temporary because saved data cannot ' +
            'be safely accessed or updated.'
        );
        return false;
    }

    try {
        const savedText = JSON.stringify(projects);
        localStorage.setItem(STORAGE_KEY, savedText);
        return true;
    } catch (error) {
        showMessage(
            'The change was made for this session, but could not ' +
            'be saved in browser storage.'
        );
        return false;
    }
}

function renderProjects() {
    projectList.replaceChildren();

    projects.forEach(project => {
        const projectItem = document.createElement('li');

        const projectName = document.createElement('h3');
        projectName.textContent = project.name;

        const projectStatus = document.createElement('p');
        projectStatus.textContent = `Status: ${project.status}`;

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.textContent = 'Edit';

        editButton.addEventListener('click', () => {
            editingId = project.id;

            nameInput.value = project.name;
            statusInput.value = project.status;

            saveButton.textContent = 'Save changes';
            cancelButton.hidden = false;
            formTitle.textContent = 'Edit Project';

            nameInput.focus();
            showMessage('');
        });

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';

        deleteButton.addEventListener('click', () => {
            const confirmed = window.confirm(
                `Are you sure you want to delete "${project.name}"?`
            );

            if (!confirmed) {
                return;
            }

            if (editingId === project.id) {
                resetForm();
            }

            const index = projects.findIndex(
                item => item.id === project.id
            );

            if (index !== -1) {
                projects.splice(index, 1);
                saveProjects();
                renderProjects();
            }
        });

        projectItem.append(
            projectName,
            projectStatus,
            editButton,
            deleteButton
        );

        projectList.appendChild(projectItem);
    });

    emptyState.hidden = projects.length > 0;
}

// Load saved records before displaying the list.
loadProjects();
renderProjects();

// One submit listener handles both Add and Edit.
form.addEventListener('submit', event => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const status = statusInput.value;

    if (!name) {
        showMessage('Please enter a project name.');
        nameInput.focus();
        return;
    }

    // Do not overwrite malformed or inaccessible saved data.
    if (!storageWritable) {
        showMessage(
            'Cannot safely save changes because browser storage ' +
            'could not be loaded. Please ask your instructor for help.'
        );
        return;
    }

    if (editingId !== null) {
        const project = projects.find(
            item => item.id === editingId
        );

        if (!project) {
            resetForm();
            renderProjects();
            showMessage('Project not found. Please try again.');
            return;
        }

        // Update the existing record, keeping its ID.
        project.name = name;
        project.status = status;
    } else {
        projects.push({
            id: crypto.randomUUID(),
            name: name,
            status: status
        });
    }

    const saved = saveProjects();

    resetForm();
    renderProjects();

    if (saved) {
        showMessage('Projects saved successfully.');
    }
});

// Cancel edit without saving the unfinished form values.
cancelButton.addEventListener('click', () => {
    resetForm();
    showMessage('');
});