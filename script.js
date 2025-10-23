document.addEventListener('DOMContentLoaded', function() {
    // Toggle functionality with event delegation for dynamic elements
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('toggle')) {
            const text = e.target.nextElementSibling;
            if (text && text.classList.contains('summary-text')) {
                if (text.style.display === 'none') {
                    text.style.display = 'block';
                    e.target.textContent = 'Hide Summary';
                } else {
                    text.style.display = 'none';
                    e.target.textContent = 'Show Summary';
                }
            }
        }
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const summaries = document.querySelectorAll('.summary');

    searchInput.addEventListener('input', function() {
        const query = searchInput.value.toLowerCase();
        summaries.forEach(summary => {
            const title = summary.querySelector('h3').textContent.toLowerCase();
            const text = summary.querySelector('.summary-text').textContent.toLowerCase();
            if (title.includes(query) || text.includes(query)) {
                summary.style.display = 'block';
            } else {
                summary.style.display = 'none';
            }
        });
    });

    // File upload and summarization
    const fileInput = document.getElementById('fileInput');
    const generateBtn = document.getElementById('generateBtn');
    const status = document.getElementById('status');
    const summariesSection = document.getElementById('sample-output');
    let fileContent = '';

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = function(e) {
                fileContent = e.target.result;
                status.textContent = 'File loaded successfully. Ready to generate summary.';
                status.style.color = 'green';
            };
            reader.onerror = function() {
                status.textContent = 'Error reading file. Please try again.';
                status.style.color = 'red';
            };
            reader.readAsText(file);
        } else {
            status.textContent = 'Please select a valid .txt file.';
            status.style.color = 'orange';
            fileContent = '';
        }
    });

    generateBtn.addEventListener('click', async function() {
        if (!fileContent) {
            status.textContent = 'Please select a file first.';
            status.style.color = 'orange';
            return;
        }

        status.textContent = 'Generating AI summary... Please wait.';
        status.style.color = 'blue';
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';

        const API_KEY = 'AIzaSyA8kyCy4_MgtBdTiMJgLp-1qz5uBe-qhXU';
        const prompt = `Provide a concise study summary of the following textbook content, highlighting key concepts:\n\n${fileContent.substring(0, 10000)}`; // Limit to avoid token limits

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
                throw new Error('Invalid response from AI API.');
            }
            const summary = data.candidates[0].content.parts[0].text.replace(/^\*\*|\*\*$/g, '').trim(); // Clean up markdown if any

            // Create new summary div
            const newSummary = document.createElement('div');
            newSummary.className = 'summary';
            newSummary.innerHTML = `
                <h3>Uploaded Textbook: AI-Generated Summary</h3>
                <button class="toggle">Show Summary</button>
                <p class="summary-text" style="display: none;">${summary}</p>
            `;
            summariesSection.appendChild(newSummary);

            status.textContent = 'Summary generated and added successfully!';
            status.style.color = 'green';
            fileInput.value = ''; // Reset input
            fileContent = '';
        } catch (error) {
            console.error('Error:', error);
            status.textContent = `Error generating summary: ${error.message}. Please check your internet connection or try again later.`;
            status.style.color = 'red';
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate AI Summary';
        }
    });
});
