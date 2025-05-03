/**
 * Custom Select functionality for Tgen Robotic HUB
 * Provides a stylish replacement for multi-select dropdowns
 */

document.addEventListener('DOMContentLoaded', function() {
    const customSelect = document.querySelector('.custom-select-container');
    if (!customSelect) return;
    
    const selectHeader = customSelect.querySelector('.custom-select-header');
    const selectOptions = customSelect.querySelector('.custom-select-options');
    const selectedDisplay = customSelect.querySelector('.selected-display');
    const selectedContainer = customSelect.querySelector('.selected-options');
    const hiddenSelect = document.getElementById('interests');
    
    // Toggle options when clicking the header
    selectHeader.addEventListener('click', function() {
        selectOptions.classList.toggle('show');
        selectHeader.classList.toggle('active');
    });
    
    // Close the dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!customSelect.contains(e.target)) {
            selectOptions.classList.remove('show');
            selectHeader.classList.remove('active');
        }
    });
    
    // Handle option selection
    const optionItems = selectOptions.querySelectorAll('.option-item');
    optionItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const value = checkbox.value;
        
        item.addEventListener('click', function(e) {
            // Prevent event from firing twice when clicking the checkbox directly
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }
            
            item.classList.toggle('selected', checkbox.checked);
            
            // Update the hidden select for form submission
            const option = Array.from(hiddenSelect.options).find(opt => opt.value === value);
            if (option) {
                option.selected = checkbox.checked;
            }
            
            // Update the selected options display
            updateSelectedDisplay();
        });
    });
    
    // Function to update the selected options display
    function updateSelectedDisplay() {
        selectedContainer.innerHTML = '';
        
        // Get all selected options
        const selectedOptions = Array.from(hiddenSelect.selectedOptions);
        
        if (selectedOptions.length === 0) {
            selectedDisplay.textContent = 'Select your interests';
        } else {
            selectedDisplay.textContent = `${selectedOptions.length} selected`;
            
            // Create chips for selected options
            selectedOptions.forEach(option => {
                const chip = document.createElement('div');
                chip.className = 'selected-option';
                chip.innerHTML = `
                    ${option.text}
                    <i class="fas fa-times" data-value="${option.value}"></i>
                `;
                
                // Add remove functionality
                const removeBtn = chip.querySelector('i');
                removeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const value = this.getAttribute('data-value');
                    
                    // Uncheck the checkbox
                    const checkbox = Array.from(selectOptions.querySelectorAll('input[type="checkbox"]'))
                        .find(cb => cb.value === value);
                    if (checkbox) {
                        checkbox.checked = false;
                        checkbox.closest('.option-item').classList.remove('selected');
                    }
                    
                    // Unselect the option in the hidden select
                    const option = Array.from(hiddenSelect.options).find(opt => opt.value === value);
                    if (option) {
                        option.selected = false;
                    }
                    
                    updateSelectedDisplay();
                });
                
                selectedContainer.appendChild(chip);
            });
        }
    }
    
    // Initialize the display
    updateSelectedDisplay();
});
