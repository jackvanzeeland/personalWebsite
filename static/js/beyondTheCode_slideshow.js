document.addEventListener('DOMContentLoaded', function() {
    const slideshowContainer = document.getElementById('slideshow-container');
    // Directly reference the img element within slideshowContainer
    const imgElement = slideshowContainer.querySelector('.slideshow-image');
    const prevBtn = slideshowContainer.querySelector('.prev-btn');
    const nextBtn = slideshowContainer.querySelector('.next-btn');

    let currentImageIndex = 0;
    let images = [];
    let autoSlideInterval;

    console.log('beyondTheCode_slideshow.js loaded.');

    // Check if all necessary elements are found
    if (!slideshowContainer || !imgElement || !prevBtn || !nextBtn) {
        console.error('Slideshow elements not found. Check HTML structure.');
        // Provide more specific error messages
        if (!slideshowContainer) console.error('slideshowContainer not found.');
        if (!imgElement) console.error('imgElement (.slideshow-image) not found.');
        if (!prevBtn) console.error('prevBtn not found.');
        if (!nextBtn) console.error('nextBtn not found.');
        return;
    }

    // Function to fetch images from the Flask endpoint
    async function fetchImages() {
        console.log('Fetching images from /get_meet_jack_photos...');
        try {
            const response = await fetch('/get_meet_jack_photos');
            const data = await response.json();
            images = data.photos;
            console.log('Fetched images:', images);

            if (images.length > 0) {
                renderImage(); // Display the first image
                startAutoSlide(); // Start auto-rotate
            } else {
                // If no photos, display a message directly in the img container area
                slideshowContainer.innerHTML = '<p>No photos available.</p>';
                console.warn('No photos returned from server.');
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            slideshowContainer.innerHTML = '<p>Error loading photos.</p>';
        }
    }

    // Function to render the current image
    function renderImage() {
        console.log('Rendering image. Current index:', currentImageIndex);
        if (imgElement) {
            imgElement.src = images[currentImageIndex];
            imgElement.alt = 'Meet Jack Photo';
            console.log('Image src set to:', imgElement.src);
        } else {
            console.error('Image element (imgElement) not found during renderImage. This should not happen if initial checks passed.');
        }
    }

    // Function to show the next image
    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        renderImage();
        resetAutoSlide();
    }

    // Function to show the previous image
    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        renderImage();
        resetAutoSlide();
    }

    // Start auto-sliding (auto-rotate)
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextImage, 5000);
        console.log('Auto-slide started.');
    }

    // Reset auto-sliding timer
    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
        console.log('Auto-slide reset.');
    }

    // Event Listeners for navigation buttons
    prevBtn.addEventListener('click', prevImage);
    nextBtn.addEventListener('click', nextImage);
    console.log('Event listeners added to navigation buttons.');

    fetchImages();
});