document.addEventListener('DOMContentLoaded', () => {
    const businessList = document.getElementById('businessList');
    const searchInput = document.getElementById('searchInput');
    const clearSearchButton = document.getElementById('clearSearch');
    const categoryButtons = document.getElementById('categoryButtons');
    let businessData = null;
    let selectedCategory = null;

    async function fetchBusinessData() {
        showLoading();
        try {
            const response = await fetch('./businesses.json');
            if (!response.ok) throw new Error('डेटा लोड होत नाही.');
            businessData = await response.json();

            renderCategoryButtons(businessData.categories);
            renderBusinesses(businessData.businesses);
        } catch (error) {
            showError(error.message);
        }
    }

    function renderCategoryButtons(categories) {
        categoryButtons.innerHTML = `
            <button onclick="filterByCategory(null)">सर्व व्यवसाय</button>
        `;
        categories.forEach(category => {
            const button = document.createElement('button');
            button.textContent = category.name;
            button.onclick = () => filterByCategory(category.id);
            categoryButtons.appendChild(button);
        });
    }

    function filterByCategory(categoryId) {
        selectedCategory = categoryId;
        filterBusinesses();
    }

    function filterBusinesses() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const filtered = businessData.businesses.filter(business => {
            const matchesCategory = !selectedCategory || business.category === selectedCategory;
            const matchesSearch = !searchTerm || business.shopName.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesSearch;
        });
        renderBusinesses(filtered);
    }

    function renderBusinesses(businesses) {
        businessList.innerHTML = '';
        if (businesses.length === 0) {
            businessList.innerHTML = '<p>व्यवसाय सापडले नाहीत.</p>';
            return;
        }
        businesses.forEach(business => {
            const card = document.createElement('div');
            card.classList.add('business-card');
            card.innerHTML = `
                <h4>${business.shopName}</h4>
                <p>मालक: ${business.ownerName}</p>
                <p>संपर्क: <a href="tel:${business.contactNumber}">${business.contactNumber}</a></p>
            `;
            businessList.appendChild(card);
        });
    }

    function showLoading() {
        businessList.innerHTML = '<p>लोडिंग...</p>';
    }

    function showError(message) {
        businessList.innerHTML = `<p>त्रुटी: ${message}</p>`;
    }

    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        filterBusinesses();
    });

    searchInput.addEventListener('input', filterBusinesses);

    fetchBusinessData();
});
