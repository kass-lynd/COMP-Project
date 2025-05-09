// Default apps configuration
const defaultApps = [
    { id: '1', name: 'Messages', color: '#30B350', image: null, x: 20, y: 20 },
    { id: '2', name: 'Phone', color: '#30B350', image: null, x: 120, y: 20 },
    { id: '3', name: 'Safari', color: '#007AFF', image: null, x: 220, y: 20 },
    { id: '4', name: 'Mail', color: '#1C7CD0', image: null, x: 320, y: 20 },
    { id: '5', name: 'Photos', color: '#F73C60', image: null, x: 20, y: 130 },
    { id: '6', name: 'Camera', color: '#9B9B9F', image: null, x: 120, y: 130 },
    { id: '7', name: 'Calendar', color: '#FF3B30', image: null, x: 220, y: 130 },
    { id: '8', name: 'Maps', color: '#63DA38', image: null, x: 320, y: 130 },
    { id: '9', name: 'Weather', color: '#54B9F9', image: null, x: 20, y: 240 },
    { id: '10', name: 'Clock', color: '#000000', image: null, x: 120, y: 240 },
    { id: '11', name: 'Notes', color: '#FFD60A', image: null, x: 220, y: 240 },
    { id: '12', name: 'Settings', color: '#8E8E93', image: null, x: 320, y: 240 }
];

// Default background settings
const defaultBackground = {
    color: '#1c1c1e',
    image: null
};

// State management
let apps = JSON.parse(localStorage.getItem('apps')) || [];
let selectedApp = null;
let background = JSON.parse(localStorage.getItem('background')) || {...defaultBackground};
let isEditMode = false;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let selectedIconStyle = 'color';

// Widget configuration
const widgetTypes = {
    weather: {
        name: 'Weather',
        defaultContent: {
            temperature: '72°',
            condition: 'Sunny',
            location: 'San Francisco'
        },
        render: (content, size) => `
            <div class="widget-header">
                <span>${content.location}</span>
            </div>
            <div class="widget-content">
                <div style="font-size: ${size === 'small' ? '36px' : '48px'}; font-weight: 300;">
                    ${content.temperature}
                </div>
                <div>${content.condition}</div>
            </div>
        `
    },
    calendar: {
        name: 'Calendar',
        defaultContent: {
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
            events: ['Meeting at 2 PM', 'Dinner at 7 PM']
        },
        render: (content, size) => `
            <div class="widget-header">
                <span>Calendar</span>
            </div>
            <div class="widget-content">
                <div style="font-size: ${size === 'small' ? '18px' : '24px'}; font-weight: 500;">
                    ${content.date}
                </div>
                ${content.events.map(event => `<div style="font-size: 14px;">${event}</div>`).join('')}
            </div>
        `
    },
    clock: {
        name: 'Clock',
        defaultContent: {
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        },
        render: (content, size) => `
            <div class="widget-header">
                <span>Clock</span>
            </div>
            <div class="widget-content">
                <div style="font-size: ${size === 'small' ? '36px' : '48px'}; font-weight: 300;">
                    ${content.time}
                </div>
            </div>
        `
    },
    stocks: {
        name: 'Stocks',
        defaultContent: {
            symbol: 'AAPL',
            price: '178.72',
            change: '+1.24%'
        },
        render: (content, size) => `
            <div class="widget-header">
                <span>Stocks</span>
            </div>
            <div class="widget-content">
                <div style="font-size: ${size === 'small' ? '18px' : '24px'};">${content.symbol}</div>
                <div style="font-size: ${size === 'small' ? '24px' : '36px'};">${content.price}</div>
                <div style="color: ${content.change.startsWith('+') ? '#32d74b' : '#ff453a'};">
                    ${content.change}
                </div>
            </div>
        `
    },
    // Add more widget types as needed
};

// Widget state management
let widgets = JSON.parse(localStorage.getItem('widgets')) || [];
let selectedWidget = null;
let selectedSize = 'small';

// DOM elements
const screen = document.getElementById('screen');
const appGrid = document.getElementById('appGrid');
const customizer = document.getElementById('customizer');
const colorPicker = document.getElementById('colorPicker');
const imageUpload = document.getElementById('imageUpload');
const resetButton = document.getElementById('resetButton');
const closeButton = document.getElementById('closeButton');
const bgColorPicker = document.getElementById('bgColorPicker');
const bgImageUpload = document.getElementById('bgImageUpload');
const resetBgButton = document.getElementById('resetBgButton');

// Additional DOM elements for widgets
const widgetCategory = document.getElementById('widgetCategory');
const sizeOptions = document.querySelectorAll('.size-option');
const addWidgetButton = document.getElementById('addWidgetButton');
const widgetCustomizer = document.getElementById('widgetCustomizer');
const widgetStyle = document.getElementById('widgetStyle');
const saveWidgetButton = document.getElementById('saveWidgetButton');
const closeWidgetButton = document.getElementById('closeWidgetButton');

// Create edit mode button
const editModeButton = document.createElement('button');
editModeButton.className = 'edit-mode-button';
editModeButton.textContent = 'Edit Home Screen';
screen.appendChild(editModeButton);

// Initialize the app grid
function renderApps() {
    appGrid.innerHTML = '';
    apps.forEach(app => {
        const appWrapper = document.createElement('div');
        appWrapper.className = 'app-wrapper';
        if (isEditMode) appWrapper.classList.add('editing');
        appWrapper.style.left = `${app.x}px`;
        appWrapper.style.top = `${app.y}px`;
        appWrapper.dataset.appId = app.id;

        const deleteButton = document.createElement('div');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = '×';
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            deleteApp(app.id);
        };

        const appIcon = document.createElement('div');
        appIcon.className = 'app-icon';
        appIcon.style.backgroundColor = app.color;
        if (app.image) {
            appIcon.style.backgroundImage = `url(${app.image})`;
        }

        const appName = document.createElement('div');
        appName.className = 'app-name';
        appName.textContent = app.name;

        appWrapper.appendChild(deleteButton);
        appWrapper.appendChild(appIcon);
        appWrapper.appendChild(appName);
        appGrid.appendChild(appWrapper);

        // Add event listeners for dragging
        appWrapper.addEventListener('mousedown', handleDragStart);
        appWrapper.addEventListener('touchstart', handleDragStart, { passive: false });
    });
    
    localStorage.setItem('apps', JSON.stringify(apps));
}

function deleteApp(appId) {
    apps = apps.filter(app => app.id !== appId);
    renderApps();
}

function handleDragStart(e) {
    if (!isEditMode) return;
    
    e.preventDefault();
    const appWrapper = e.target.closest('.app-wrapper');
    if (!appWrapper) return;

    isDragging = true;
    appWrapper.classList.add('dragging');

    const rect = appWrapper.getBoundingClientRect();
    const screenRect = screen.getBoundingClientRect();

    if (e.type === 'mousedown') {
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
    } else {
        dragOffset.x = e.touches[0].clientX - rect.left;
        dragOffset.y = e.touches[0].clientY - rect.top;
    }

    const moveHandler = (e) => {
        if (!isDragging) return;

        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

        let newX = clientX - screenRect.left - dragOffset.x;
        let newY = clientY - screenRect.top - dragOffset.y;

        // Constrain to screen bounds
        newX = Math.max(0, Math.min(newX, screenRect.width - rect.width));
        newY = Math.max(44, Math.min(newY, screenRect.height - rect.height));

        appWrapper.style.left = `${newX}px`;
        appWrapper.style.top = `${newY}px`;

        // Update app position in state
        const appId = appWrapper.dataset.appId;
        apps = apps.map(app => 
            app.id === appId
                ? { ...app, x: newX, y: newY }
                : app
        );
    };

    const endHandler = () => {
        isDragging = false;
        appWrapper.classList.remove('dragging');
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', endHandler);
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('touchend', endHandler);
        localStorage.setItem('apps', JSON.stringify(apps));
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', endHandler);
    document.addEventListener('touchmove', moveHandler, { passive: false });
    document.addEventListener('touchend', endHandler);
}

// Toggle edit mode
editModeButton.addEventListener('click', () => {
    isEditMode = !isEditMode;
    editModeButton.textContent = isEditMode ? 'Done' : 'Edit Home Screen';
    
    // Update both apps and widgets
    document.querySelectorAll('.app-wrapper, .widget').forEach(el => {
        el.classList.toggle('editing');
    });
    
    // Update delete buttons visibility
    document.querySelectorAll('.delete-widget').forEach(button => {
        button.style.display = isEditMode ? 'flex' : 'none';
    });
    
    // Hide widget customizer when entering edit mode
    if (isEditMode && widgetCustomizer.style.display === 'block') {
        widgetCustomizer.style.display = 'none';
        selectedWidget = null;
    }
});

// Initialize background
function renderBackground() {
    screen.style.backgroundColor = background.color;
    screen.style.backgroundImage = background.image ? `url(${background.image})` : 'none';
    localStorage.setItem('background', JSON.stringify(background));
}

// Open customizer panel
function openCustomizer(app) {
    if (isEditMode || isDragging) return;
    selectedApp = app;
    customizer.style.display = 'block';
    colorPicker.value = app.color;
    customizer.querySelector('h3').textContent = `Customize ${app.name}`;
}

// Event Listeners for app customization
colorPicker.addEventListener('change', (e) => {
    if (selectedApp) {
        apps = apps.map(app =>
            app.id === selectedApp.id
                ? { ...app, color: e.target.value, image: null }
                : app
        );
        renderApps();
    }
});

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && selectedApp) {
        const reader = new FileReader();
        reader.onloadend = () => {
            apps = apps.map(app =>
                app.id === selectedApp.id
                    ? { ...app, image: reader.result }
                    : app
            );
            renderApps();
        };
        reader.readAsDataURL(file);
    }
});

resetButton.addEventListener('click', () => {
    if (selectedApp) {
        const defaultApp = defaultApps.find(app => app.id === selectedApp.id);
        if (defaultApp) {
            apps = apps.map(app =>
                app.id === selectedApp.id
                    ? { ...defaultApp }
                    : app
            );
            renderApps();
        }
    }
});

closeButton.addEventListener('click', () => {
    customizer.style.display = 'none';
    selectedApp = null;
    imageUpload.value = '';
});

// Event Listeners for background customization
bgColorPicker.addEventListener('change', (e) => {
    background.color = e.target.value;
    background.image = null;
    renderBackground();
});

bgImageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            background.image = reader.result;
            renderBackground();
        };
        reader.readAsDataURL(file);
    }
});

resetBgButton.addEventListener('click', () => {
    background = {...defaultBackground};
    bgColorPicker.value = defaultBackground.color;
    bgImageUpload.value = '';
    renderBackground();
});

// Initialize widgets
function renderWidgets() {
    // Remove existing widgets
    document.querySelectorAll('.widget').forEach(widget => widget.remove());

    // Render each widget
    widgets.forEach(widget => {
        const widgetEl = createWidgetElement(widget);
        appGrid.appendChild(widgetEl);
    });

    localStorage.setItem('widgets', JSON.stringify(widgets));
}

function createWidgetElement(widget) {
    const widgetEl = document.createElement('div');
    widgetEl.className = `widget ${widget.size} ${widget.style}`;
    if (widget.backgroundImage) {
        widgetEl.classList.add('has-image');
        widgetEl.style.backgroundImage = `url(${widget.backgroundImage})`;
        widgetEl.style.setProperty('--bg-scale', `${widget.imageScale || 100}%`);
        widgetEl.style.setProperty('--bg-position', widget.imagePosition || 'center');
    }
    widgetEl.style.left = `${widget.x}px`;
    widgetEl.style.top = `${widget.y}px`;
    widgetEl.dataset.widgetId = widget.id;

    if (isEditMode) widgetEl.classList.add('editing');

    // Create delete button
    const deleteButton = document.createElement('div');
    deleteButton.className = 'delete-widget';
    deleteButton.innerHTML = '×';
    deleteButton.style.display = isEditMode ? 'flex' : 'none';
    deleteButton.onclick = (e) => {
        e.stopPropagation();
        if (confirm(`Delete this ${widgetTypes[widget.type].name} widget?`)) {
            deleteWidget(widget.id);
        }
    };

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'widget-content';
    contentWrapper.innerHTML = widgetTypes[widget.type].render(widget.content, widget.size);
    
    // Add delete button first, then content
    widgetEl.appendChild(deleteButton);
    widgetEl.appendChild(contentWrapper);

    // Add drag functionality
    widgetEl.addEventListener('mousedown', handleWidgetDragStart);
    widgetEl.addEventListener('touchstart', handleWidgetDragStart, { passive: false });

    // Add double click to customize
    widgetEl.addEventListener('dblclick', () => {
        if (!isEditMode) openWidgetCustomizer(widget);
    });

    return widgetEl;
}

function handleWidgetDragStart(e) {
    if (!isEditMode) return;
    
    e.preventDefault();
    const widgetEl = e.target.closest('.widget');
    if (!widgetEl) return;

    isDragging = true;
    widgetEl.classList.add('dragging');

    const rect = widgetEl.getBoundingClientRect();
    const screenRect = screen.getBoundingClientRect();

    if (e.type === 'mousedown') {
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
    } else {
        dragOffset.x = e.touches[0].clientX - rect.left;
        dragOffset.y = e.touches[0].clientY - rect.top;
    }

    const moveHandler = (e) => {
        if (!isDragging) return;

        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

        let newX = clientX - screenRect.left - dragOffset.x;
        let newY = clientY - screenRect.top - dragOffset.y;

        // Constrain to screen bounds
        newX = Math.max(0, Math.min(newX, screenRect.width - rect.width));
        newY = Math.max(44, Math.min(newY, screenRect.height - rect.height));

        widgetEl.style.left = `${newX}px`;
        widgetEl.style.top = `${newY}px`;

        // Update widget position in state
        const widgetId = widgetEl.dataset.widgetId;
        widgets = widgets.map(w => 
            w.id === widgetId
                ? { ...w, x: newX, y: newY }
                : w
        );
    };

    const endHandler = () => {
        isDragging = false;
        widgetEl.classList.remove('dragging');
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', endHandler);
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('touchend', endHandler);
        localStorage.setItem('widgets', JSON.stringify(widgets));
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', endHandler);
    document.addEventListener('touchmove', moveHandler, { passive: false });
    document.addEventListener('touchend', endHandler);
}

function deleteWidget(widgetId) {
    const widget = widgets.find(w => w.id === widgetId);
    const widgetEl = document.querySelector(`[data-widget-id="${widgetId}"]`);
    
    if (widgetEl) {
        // Add deletion animation
        widgetEl.style.transition = 'transform 0.3s, opacity 0.3s';
        widgetEl.style.transform = 'scale(0.8)';
        widgetEl.style.opacity = '0';
        
        // Remove widget after animation
        setTimeout(() => {
            widgets = widgets.filter(w => w.id !== widgetId);
            renderWidgets();
            localStorage.setItem('widgets', JSON.stringify(widgets));
        }, 300);
    }
}

// Widget customization
function openWidgetCustomizer(widget) {
    selectedWidget = widget;
    widgetCustomizer.style.display = 'block';
    widgetStyle.value = widget.style;
    
    // Handle image controls
    const imageControls = document.querySelector('.image-position-controls');
    const removeImageBtn = document.getElementById('removeWidgetImage');
    const imageScale = document.getElementById('imageScale');
    const scaleValue = document.querySelector('.scale-value');
    
    if (widget.backgroundImage) {
        imageControls.style.display = 'block';
        removeImageBtn.style.display = 'block';
        
        // Set scale
        imageScale.value = widget.imageScale || 100;
        scaleValue.textContent = `${imageScale.value}%`;
        
        // Set position
        document.querySelectorAll('.position-button').forEach(button => {
            button.classList.toggle('selected', button.dataset.position === widget.imagePosition);
        });
    } else {
        imageControls.style.display = 'none';
        removeImageBtn.style.display = 'none';
    }
    
    // Reset file input
    document.getElementById('widgetImage').value = '';
    
    // Populate content options
    const contentOptions = document.querySelector('.widget-content-options');
    contentOptions.innerHTML = generateContentOptions(widget);
}

function generateContentOptions(widget) {
    const type = widgetTypes[widget.type];
    let html = '';
    
    for (const [key, value] of Object.entries(widget.content)) {
        html += `
            <div class="content-option">
                <label for="widget-${key}">${key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                <input type="text" id="widget-${key}" value="${value}">
            </div>
        `;
    }
    
    return html;
}

// Size option selection
sizeOptions.forEach(option => {
    option.addEventListener('click', () => {
        sizeOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedSize = option.dataset.size;
    });
});

// Add new widget
addWidgetButton.addEventListener('click', () => {
    const type = widgetCategory.value;
    const widgetType = widgetTypes[type];
    
    const newWidget = {
        id: Date.now().toString(),
        type,
        size: selectedSize,
        style: 'light',
        content: { ...widgetType.defaultContent },
        backgroundImage: null,
        x: 20,
        y: 20
    };
    
    widgets.push(newWidget);
    renderWidgets();
});

// Save widget customization
saveWidgetButton.addEventListener('click', () => {
    if (!selectedWidget) return;

    const newContent = {};
    const contentInputs = document.querySelectorAll('.content-option input');
    contentInputs.forEach(input => {
        const key = input.id.replace('widget-', '');
        newContent[key] = input.value;
    });

    widgets = widgets.map(w =>
        w.id === selectedWidget.id
            ? { 
                ...w, 
                style: widgetStyle.value, 
                content: newContent,
                backgroundImage: selectedWidget.backgroundImage,
                imageScale: selectedWidget.imageScale,
                imagePosition: selectedWidget.imagePosition
            }
            : w
    );

    renderWidgets();
    widgetCustomizer.style.display = 'none';
    selectedWidget = null;
});

closeWidgetButton.addEventListener('click', () => {
    widgetCustomizer.style.display = 'none';
    selectedWidget = null;
});

// Add event listeners for image positioning
document.querySelectorAll('.position-button').forEach(button => {
    button.addEventListener('click', () => {
        if (!selectedWidget) return;
        
        document.querySelectorAll('.position-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        button.classList.add('selected');
        
        selectedWidget.imagePosition = button.dataset.position;
        renderWidgets();
    });
});

// Add event listener for image scale
document.getElementById('imageScale').addEventListener('input', (e) => {
    if (!selectedWidget) return;
    
    const scale = e.target.value;
    document.querySelector('.scale-value').textContent = `${scale}%`;
    selectedWidget.imageScale = scale;
    renderWidgets();
});

// Update the widget image upload handler
document.getElementById('widgetImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && selectedWidget) {
        const reader = new FileReader();
        reader.onload = (e) => {
            selectedWidget.backgroundImage = e.target.result;
            selectedWidget.imageScale = 100;
            selectedWidget.imagePosition = 'center';
            
            // Show image controls
            document.querySelector('.image-position-controls').style.display = 'block';
            document.getElementById('removeWidgetImage').style.display = 'block';
            
            // Reset position buttons
            document.querySelectorAll('.position-button').forEach(btn => {
                btn.classList.toggle('selected', btn.dataset.position === 'center');
            });
            
            // Reset scale
            document.getElementById('imageScale').value = 100;
            document.querySelector('.scale-value').textContent = '100%';
            
            renderWidgets();
        };
        reader.readAsDataURL(file);
    }
});

// Update the remove image handler
document.getElementById('removeWidgetImage').addEventListener('click', () => {
    if (selectedWidget) {
        selectedWidget.backgroundImage = null;
        selectedWidget.imageScale = null;
        selectedWidget.imagePosition = null;
        document.querySelector('.image-position-controls').style.display = 'none';
        document.getElementById('removeWidgetImage').style.display = 'none';
        renderWidgets();
    }
});

// Initialize the app
renderApps();
renderBackground();
renderWidgets();

// Update clock widget every minute
setInterval(() => {
    widgets.forEach(widget => {
        if (widget.type === 'clock') {
            widget.content.time = new Date().toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
            });
        }
    });
    renderWidgets();
}, 60000);

// Initialize icon style selection
document.querySelectorAll('.icon-style-option').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.icon-style-option').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        selectedIconStyle = button.dataset.style;
        
        // Toggle visibility of color/image inputs
        document.getElementById('iconColorGroup').style.display = selectedIconStyle === 'color' ? 'block' : 'none';
        document.getElementById('iconImageGroup').style.display = selectedIconStyle === 'image' ? 'block' : 'none';
    });
});

// Handle app creation
document.getElementById('addAppButton').addEventListener('click', () => {
    const appName = document.getElementById('appName').value.trim();
    if (!appName) {
        alert('Please enter an app name');
        return;
    }

    const newApp = {
        id: 'app-' + Date.now(),
        name: appName,
        x: 20,
        y: 20
    };

    if (selectedIconStyle === 'color') {
        const iconColor = document.getElementById('iconColor').value || '#007AFF';
        newApp.color = iconColor;
    } else {
        const iconImageInput = document.getElementById('iconImage');
        if (!iconImageInput || !iconImageInput.files[0]) {
            alert('Please select an image for the app icon');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            newApp.image = e.target.result;
            apps.push(newApp);
            renderApps();
            
            // Reset form
            document.getElementById('appName').value = '';
            document.getElementById('iconColor').value = '#007AFF';
            document.getElementById('iconImage').value = '';
        };
        reader.readAsDataURL(iconImageInput.files[0]);
        return;
    }

    apps.push(newApp);
    renderApps();
    
    // Reset form
    document.getElementById('appName').value = '';
    document.getElementById('iconColor').value = '#007AFF';
});

function createAppIcon(app) {
    const appIcon = document.createElement('div');
    appIcon.className = 'app';
    appIcon.id = app.id;
    appIcon.draggable = true;
    
    if (app.backgroundColor) {
        appIcon.style.backgroundColor = app.backgroundColor;
    }
    if (app.backgroundImage) {
        appIcon.style.backgroundImage = `url(${app.backgroundImage})`;
        appIcon.style.backgroundSize = 'cover';
        appIcon.style.backgroundPosition = 'center';
    }
    
    const appName = document.createElement('span');
    appName.className = 'app-name';
    appName.textContent = app.name;
    appIcon.appendChild(appName);
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-app';
    deleteButton.innerHTML = '×';
    deleteButton.style.display = 'none';
    deleteButton.onclick = (e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete ${app.name}?`)) {
            apps = apps.filter(a => a.id !== app.id);
            saveApps();
            appIcon.remove();
        }
    };
    appIcon.appendChild(deleteButton);
    
    // Position the app
    appIcon.style.left = `${app.position.x}px`;
    appIcon.style.top = `${app.position.y}px`;
    
    // Add drag functionality
    appIcon.addEventListener('dragstart', handleDragStart);
    appIcon.addEventListener('dragend', handleDragEnd);
    
    document.getElementById('screen').appendChild(appIcon);
}

function saveApps() {
    localStorage.setItem('apps', JSON.stringify(apps));
}

// Update the toggleEditMode function to include apps
function toggleEditMode() {
    isEditMode = !isEditMode;
    document.querySelectorAll('.widget').forEach(widget => {
        widget.classList.toggle('editing');
    });
    document.querySelectorAll('.delete-widget').forEach(button => {
        button.style.display = isEditMode ? 'flex' : 'none';
    });
    
    // Hide widget customizer in edit mode
    if (document.getElementById('widgetCustomizer')) {
        document.getElementById('widgetCustomizer').style.display = isEditMode ? 'none' : 'block';
    }
}

// Load saved apps on page load
window.addEventListener('load', () => {
    apps.forEach(app => createAppIcon(app));
}); 