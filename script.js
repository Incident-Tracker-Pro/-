document.addEventListener('DOMContentLoaded', () => {
    const businessList = document.getElementById('businessList');
    const searchInput = document.getElementById('searchInput');
    const clearSearchButton = document.getElementById('clearSearch');
    const categoryGrid = document.getElementById('categoryGrid');
    const selectedCategoryName = document.getElementById('selectedCategoryName');
    let businessData = null;
    let selectedCategory = null;

    async function fetchBusinessData() {
        showLoader();
        try {
            const response = await fetch('./businesses.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            businessData = await response.json();

            renderCategoryGrid(businessData.categories);
            renderBusinesses(businessData.businesses);
        } catch (error) {
            businessList.innerHTML = `
                <div class="no-results">
                    <p>डेटा लोड करण्यात त्रुटी आली: ${error.message}</p>
                    <button onclick="fetchBusinessData()">पुन्हा प्रयत्न करा</button>
                </div>`;
        } finally {
            hideLoader();
        }
    }

    function renderCategoryGrid(categories) {
        categoryGrid.innerHTML = '';
        categories.forEach(category => {
            const categoryItem = createCategoryItem(category);
            categoryGrid.appendChild(categoryItem);
        });
        const allCategoriesItem = createAllCategoriesItem();
        categoryGrid.appendChild(allCategoriesItem);
    }

    function createCategoryItem(category) {
        const categoryItem = document.createElement('div');
        categoryItem.classList.add('category-item');
        categoryItem.innerHTML = `<i class="${category.icon}"></i><span>${category.name}</span>`;
        categoryItem.addEventListener('click', () => selectCategory(categoryItem, category));
        return categoryItem;
    }

    function createAllCategoriesItem() {
        const allCategoriesItem = document.createElement('div');
        allCategoriesItem.classList.add('category-item');
        allCategoriesItem.innerHTML = `<i class="fas fa-th-large"></i><span>सर्व श्रेण्या</span>`;
        allCategoriesItem.addEventListener('click', () => selectAllCategories(allCategoriesItem));
        return allCategoriesItem;
    }

    function selectCategory(categoryItem, category) {
        document.querySelectorAll('.category-item').forEach(item =>
            item.classList.remove('selected')
        );
        categoryItem.classList.add('selected');
        selectedCategory = category.id;
        selectedCategoryName.textContent = category.name;
        selectedCategoryName.style.opacity = '1';
        filterBusinesses();
    }

    function selectAllCategories(allCategoriesItem) {
        document.querySelectorAll('.category-item').forEach(item =>
            item.classList.remove('selected')
        );
        allCategoriesItem.classList.add('selected');
        selectedCategory = null;
        selectedCategoryName.textContent = '';
        selectedCategoryName.style.opacity = '0';
        filterBusinesses();
    }

    function debounce(func, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    }

    const filterBusinesses = debounce(() => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const filteredBusinesses = businessData.businesses.filter(business => {
            const matchesCategory = !selectedCategory || business.category === selectedCategory;
            const matchesSearch = !searchTerm || Object.values(business).some(value =>
                value.toString().toLowerCase().includes(searchTerm)
            );
            return matchesCategory && matchesSearch;
        });
        renderBusinesses(filteredBusinesses);
    }, 300);

    function renderBusinesses(businesses) {
        businessList.innerHTML = '';
        if (businesses.length === 0) {
            businessList.innerHTML = '<div class="no-results"><p>कोणतेही व्यवसाय सापडले नाहीत.</p></div>';
            return;
        }
        businesses.forEach(business => {
            const businessCard = createBusinessCard(business);
            businessList.appendChild(businessCard);
        });
    }

    function createBusinessCard(business) {
        const businessCard = document.createElement('div');
        businessCard.classList.add('business-card');
        businessCard.innerHTML = `
            <h4>${business.shopName}</h4>
            <p><strong>मालक:</strong> ${business.ownerName}</p>
            <p><strong>संपर्क:</strong> <a href="tel:${business.contactNumber}">${business.contactNumber}</a></p>
        `;
        return businessCard;
    }

    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        filterBusinesses();
    });

    function showLoader() {
        businessList.innerHTML = `<div class="loader">लोडिंग...</div>`;
    }

    function hideLoader() {
        const loader = businessList.querySelector('.loader');
        if (loader) loader.remove();
    }

    fetchBusinessData();
});
