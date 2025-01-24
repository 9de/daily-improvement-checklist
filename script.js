const defaultChecklistData = {
    "تنظيم الروتين اليومي": {
        "الاستيقاظ في الساعة 7 صباحاً": false,
        "أداء صلاة الفجر": false,
        "تناول إفطار صحي": false,
        "تمارين الصباح اليومية": false,
        "تحضير قائمة المهام اليومية": false,
        "المشي بعد صلاة العشاء": false,
        "النوم قبل 11 مساءً": false
    },
    "الصحة البدنية": {
        "شرب 8 أكواب من الماء": false,
        "تناول وجبات صحية": false,
        "ممارسة التمارين الرياضية": false,
        "تجنب الوجبات السريعة": false,
        "أخذ قسط من الراحة": false,
        "تناول الفيتامينات": false
    },
    "الجانب الديني": {
        "الصلوات الخمس": false,
        "قراءة صفحة من القرآن": false,
        "أذكار الصباح والمساء": false,
        "الاستغفار 100 مرة": false,
        "قراءة حديث نبوي": false
    },
    "التطوير الشخصي": {
        "العمل على مشروع البرمجة": false,
        "قراءة كتاب لمدة 30 دقيقة": false,
        "تعلم مهارة جديدة": false,
        "كتابة يوميات": false,
        "التأمل لمدة 10 دقائق": false
    },
    "العلاقات الاجتماعية": {
        "التواصل مع العائلة": false,
        "مساعدة شخص ما": false,
        "التواصل مع صديق": false,
        "المشاركة في نشاط اجتماعي": false
    },
    "العمل والإنتاجية": {
        "إنجاز المهام ذات الأولوية": false,
        "تنظيم مكان العمل": false,
        "تحديث قائمة المهام": false,
        "أخذ استراحات منتظمة": false
    },
    "التعليم والتعلم": {
        "مراجعة الدروس": false,
        "حل التمارين": false,
        "البحث عن معلومات جديدة": false,
        "تلخيص ما تم تعلمه": false
    }
};

// Initialize the state immediately when the script loads
if (!localStorage.getItem('checklistState')) {
    localStorage.setItem('checklistState', JSON.stringify(defaultChecklistData));
}

// Theme handling
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Initialize theme
const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);

// Load saved state or initialize new state
function initializeState() {
    const savedDate = localStorage.getItem('lastCheckDate');
    const currentDate = new Date().toDateString();
    
    // If it's a new day or no state exists, reset the checklist
    if (savedDate !== currentDate || !localStorage.getItem('checklistState')) {
        localStorage.setItem('lastCheckDate', currentDate);
        localStorage.setItem('checklistState', JSON.stringify(defaultChecklistData));
        return defaultChecklistData;
    }
    
    try {
        return JSON.parse(localStorage.getItem('checklistState')) || defaultChecklistData;
    } catch (error) {
        console.error('Error parsing checklist state:', error);
        return defaultChecklistData;
    }
}

// Function to add new item
function addNewItem() {
    const category = document.getElementById('category-select').value;
    const newItem = document.getElementById('new-item-input').value.trim();
    
    if (!newItem) {
        showNotification('الرجاء إدخال نص المهمة', 'warning');
        return;
    }

    const currentState = JSON.parse(localStorage.getItem('checklistState'));
    
    if (currentState[category][newItem]) {
        showNotification('هذه المهمة موجودة بالفعل', 'error');
        return;
    }

    currentState[category][newItem] = false;
    localStorage.setItem('checklistState', JSON.stringify(currentState));
    
    document.getElementById('new-item-input').value = '';
    createChecklist();
    showNotification('تمت إضافة المهمة بنجاح', 'success');
}

// Function to delete item
function deleteItem(category, item) {
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
        const currentState = JSON.parse(localStorage.getItem('checklistState'));
        delete currentState[category][item];
        localStorage.setItem('checklistState', JSON.stringify(currentState));
        createChecklist();
        showNotification('تم حذف المهمة', 'error');
    }
}

// Show notification function
function showNotification(message, type = 'success') {
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icon = document.createElement('div');
    icon.className = 'notification-icon';
    icon.innerHTML = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';

    const content = document.createElement('div');
    content.className = 'notification-content';
    
    const title = document.createElement('div');
    title.className = 'notification-title';
    title.textContent = type === 'success' ? 'تم بنجاح' : 
                       type === 'error' ? 'خطأ' : 'تنبيه';
    
    const messageElement = document.createElement('div');
    messageElement.className = 'notification-message';
    messageElement.textContent = message;

    content.appendChild(title);
    content.appendChild(messageElement);

    const closeButton = document.createElement('div');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '×';
    closeButton.onclick = () => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    };

    notification.appendChild(icon);
    notification.appendChild(content);
    notification.appendChild(closeButton);

    container.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Update progress bar
function updateProgress(state) {
    let total = 0;
    let completed = 0;

    Object.values(state).forEach(category => {
        Object.values(category).forEach(value => {
            total++;
            if (value) completed++;
        });
    });

    const percentage = (completed / total) * 100;
    const progressBar = document.getElementById('overall-progress');
    progressBar.style.width = `${percentage}%`;
    
    document.getElementById('progress-text').textContent = 
        `تم إنجاز ${completed} من ${total} (${percentage.toFixed(1)}%)`;

    if (percentage === 100) {
        progressBar.style.backgroundColor = 'var(--success-color)';
        showNotification('أحسنت! لقد أكملت جميع المهام!', 'success');
    } else if (percentage >= 50) {
        progressBar.style.backgroundColor = 'var(--primary-color)';
    }
}

// Create checklist HTML
function createChecklist() {
    const state = initializeState();
    const container = document.getElementById('checklist-container');
    if (!container) {
        console.error('Checklist container not found!');
        return;
    }
    
    container.innerHTML = '';

    Object.entries(state).forEach(([category, items]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        
        const categoryTitle = document.createElement('h2');
        categoryTitle.textContent = category;
        categoryDiv.appendChild(categoryTitle);

        Object.entries(items).forEach(([item, checked]) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'checklist-item';

            // Create checkbox container
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'checkbox-wrapper';

            // Create actual checkbox input
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = checked;
            checkbox.id = `${category}-${item}`;

            // Create custom checkbox label
            const customCheckbox = document.createElement('label');
            customCheckbox.className = 'checkbox-custom' + (checked ? ' checked' : '');
            customCheckbox.htmlFor = checkbox.id;

            // Create label for the item text
            const label = document.createElement('label');
            label.textContent = item;
            label.className = 'item-label' + (checked ? ' completed' : '');
            label.htmlFor = checkbox.id;

            // Create delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-item';
            deleteButton.innerHTML = '❌';
            deleteButton.onclick = (e) => {
                e.preventDefault();
                deleteItem(category, item);
            };

            // Add checkbox change event listener
            checkbox.addEventListener('change', (e) => {
                const currentState = JSON.parse(localStorage.getItem('checklistState'));
                currentState[category][item] = e.target.checked;
                localStorage.setItem('checklistState', JSON.stringify(currentState));
                
                label.classList.toggle('completed', e.target.checked);
                customCheckbox.classList.toggle('checked', e.target.checked);
                
                updateProgress(currentState);
            });

            // Assemble the checkbox wrapper
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(customCheckbox);

            // Assemble the item
            itemDiv.appendChild(checkboxContainer);
            itemDiv.appendChild(label);
            itemDiv.appendChild(deleteButton);

            // Add to category
            categoryDiv.appendChild(itemDiv);
        });

        container.appendChild(categoryDiv);
    });

    updateProgress(state);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    createChecklist();
    
    const input = document.getElementById('new-item-input');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addNewItem();
            }
        });
    }
});

// Auto-save functionality
window.addEventListener('beforeunload', () => {
    const state = JSON.parse(localStorage.getItem('checklistState'));
    if (state) {
        localStorage.setItem('checklistState', JSON.stringify(state));
    }
});