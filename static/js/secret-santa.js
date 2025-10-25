/**
 * Secret Santa Matching Logic
 * Handles form submission, dropdown population, and match display
 */

(function() {
    'use strict';

    console.log("Script block parsing started.");

    document.addEventListener("DOMContentLoaded", function () {
        console.log("Page loaded");

        // Handle form submission for hiding results
        document.getElementById("hideResults")?.addEventListener("click", function (e) {
            e.preventDefault();
            const matchResult = document.getElementById("matchResult");
            if (matchResult) {
                matchResult.style.display = "none";
            }
        });

        // Handle showing match when a person is selected from the dropdown
        document.getElementById("person")?.addEventListener("change", function () {
            const selectedPerson = this.value;
            console.log("Dropdown changed. Selected person:", selectedPerson);
            const results = window.secretSantaResults;
            console.log("Global results (window.secretSantaResults):", results);
            const matchResult = document.getElementById("matchResult");
            const matchResultText = document.getElementById("matchResultText");

            if (selectedPerson && selectedPerson !== "" && selectedPerson !== "Choose your name" && results && results[selectedPerson]) {
                console.log("Match found for", selectedPerson, ":", results[selectedPerson]);
                if (matchResult && matchResultText) {
                    matchResultText.innerHTML = `${selectedPerson}, you will be getting a gift for: <strong>${results[selectedPerson]}</strong>`;
                    matchResult.style.display = "block";
                }
            } else if (matchResult) {
                console.log("No match found or selected person is empty/default.");
                matchResult.style.display = "none";
            }
        });

        // Handle AJAX submission for names-form
        document.getElementById('names-form')?.addEventListener('submit', function (e) {
            e.preventDefault(); // Prevent default form submission

            const namesInput = document.getElementById('names');
            const names = namesInput.value.split(',').map(n => n.trim());

            // Basic validation
            if (names.length < 2) {
                alert('Please enter at least 2 names');
                return;
            }
            if (new Set(names).size !== names.length) {
                alert('Please ensure all names are unique');
                return;
            }

            const formData = new FormData(this);

            console.log("Attempting to fetch /project/matching via AJAX...");
            fetch('/project/matching', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest' // Indicate AJAX request
                }
            })
                .then(response => {
                    console.log("AJAX response received.", response);
                    return response.json();
                })
                .then(data => {
                    console.log("Data received from AJAX call:", data);
                    if (data.error) {
                        alert(data.error);
                        return;
                    }

                    // Store results globally for access by other functions
                    window.secretSantaResults = data.results;
                    console.log("AJAX call successful. window.secretSantaResults set to:", window.secretSantaResults);

                    // Update the person dropdown
                    const personSelect = document.getElementById('person');
                    personSelect.innerHTML = '<option value="">Choose your name</option>'; // Clear existing options
                    data.names.sort().forEach(name => {
                        const option = document.createElement('option');
                        option.value = name;
                        option.textContent = name;
                        personSelect.appendChild(option);
                    });

                    // Show the match section and hide the match result initially
                    const matchSection = document.getElementById('matchSection');
                    const matchResult = document.getElementById('matchResult');
                    const resetForm = document.getElementById('reset-form');

                    if (matchSection) {
                        matchSection.style.display = 'block';
                        console.log("matchSection display set to block.");
                    }
                    if (matchResult) {
                        matchResult.style.display = 'none';
                        console.log("matchResult display set to none.");
                    }
                    if (resetForm) {
                        resetForm.style.display = 'block'; // Show reset button
                        console.log("resetForm display set to block.");
                    }

                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while generating matches.');
                });
        });

        // Handle AJAX submission for reset-form
        document.getElementById('clearListButton')?.addEventListener('click', function (e) {
            e.preventDefault();
            if (confirm('Are you sure you want to clear all matches?')) {
                fetch('/project/matching/clear', {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Clear names and results from session (handled by Flask)
                            window.secretSantaResults = {};
                            document.getElementById('names').value = '';
                            document.getElementById('person').innerHTML = '<option value="">Choose your name</option>';
                            document.getElementById('matchSection').style.display = 'none';
                            document.getElementById('matchResult').style.display = 'none';
                            document.getElementById('reset-form').style.display = 'none';
                        } else {
                            alert('Failed to clear list.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred while clearing the list.');
                    });
            }
        });

        // Initial population of dropdown if names are already present (e.g., after a Flask redirect)
        // This uses window.secretSantaInitialNames and window.secretSantaInitialResults set by inline script
        const initialNames = window.secretSantaInitialNames || [];
        const initialResults = window.secretSantaInitialResults || {};
        if (initialNames && initialNames.length > 0) {
            const personSelect = document.getElementById('person');
            personSelect.innerHTML = '<option value="">Choose your name</option>';
            initialNames.sort().forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                personSelect.appendChild(option);
            });
            window.secretSantaResults = initialResults;
            document.getElementById('matchSection').style.display = 'block';
            document.getElementById('reset-form').style.display = 'block';
        }
    });

})();
