document.addEventListener('DOMContentLoaded', function() {
    const slideshowContainer = document.getElementById('slideshow-container');
    let currentImageIndex = 0;
    let images = [];

    if (!slideshowContainer) {
        console.error('Slideshow container not found.');
        return;
    }

    // Function to fetch images from the Flask endpoint
    async function fetchImages() {
        try {
            const response = await fetch('/get_meet_jack_photos');
            const data = await response.json();
            images = data.photos;
            if (images.length > 0) {
                renderImage();
                setInterval(nextImage, 5000); // Change image every 5 seconds
            } else {
                slideshowContainer.innerHTML = '<p>No photos available.</p>';
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            slideshowContainer.innerHTML = '<p>Error loading photos.</p>';
        }
    }

    // Function to render the current image
    function renderImage() {
        slideshowContainer.innerHTML = ''; // Clear previous image
        const img = document.createElement('img');
        img.src = images[currentImageIndex];
        img.alt = 'Meet Jack Photo';
        img.classList.add('slideshow-image');
        slideshowContainer.appendChild(img);
    }

    // Function to show the next image
    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        renderImage();
    }

    fetchImages();
});