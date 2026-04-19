// Photo Gallery Component for Beyond the Code page

// Type definitions
class Photo {
  constructor(id, title, description, category, image, date) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.category = category;
    this.image = image;
    this.date = date;
  }
}

// Real photos from beyondTheCodePhotos directory
const REAL_PHOTOS = [
  new Photo(
    1,
    "1st Half Marathon",
    "Celebrating my first half marathon.",
    "Achievement",
    "/assets/images/beyondTheCodePhotos/IMG_2178.JPG",
    "2023-07-13",
  ),
  new Photo(
    2,
    "Cabin Weekend",
    "Relaxing weekend getaway at the cabin.",
    "Nature",
    "/assets/images/beyondTheCodePhotos/IMG_4961.HEIC.jpg",
    "2024-07-21",
  ),
  new Photo(
    3,
    "College Graduation",
    "My last jump around at Camp Randall.",
    "Achievement",
    "/assets/images/beyondTheCodePhotos/IMG_8128.HEIC.jpg",
    "2025-05-10",
  ),
  new Photo(
    4,
    "Spring Break 2025 - Cabo",
    "Booze cruise with good friends.",
    "Good Times",
    "/assets/images/beyondTheCodePhotos/IMG_3741.JPG",
    "2025-03-22",
  ),
  new Photo(
    5,
    "Banff Road Trip",
    "Spontaneous adventure in the mountains.",
    "Adventure",
    "/assets/images/beyondTheCodePhotos/IMG_1118.JPG",
    "2023-07-14",
  ),
  new Photo(
    6,
    "Regional Champions",
    "Winning the regional championship.",
    "Achievement",
    "/assets/images/beyondTheCodePhotos/26E3874A-57D3-49E4-8A02-6B55724F9348.HEIC.jpg",
    "2020-03-07",
  ),
  new Photo(
    7,
    "Packer Game Day",
    "I don't wanna work. I just wanna bang on the drum all day.",
    "Good Times",
    "/assets/images/beyondTheCodePhotos/IMG_9057.HEIC.jpg",
    "2024-07-21",
  ),
];

class PhotoGallery {
  constructor() {
    this.currentPhotoIndex = 0;
    this.photos = REAL_PHOTOS;
    this.galleryElement = null;
    this.counterElement = null;
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setupGallery());
    } else {
      this.setupGallery();
    }
  }

  setupGallery() {
    this.galleryElement = document.getElementById("photo-gallery");
    this.counterElement = document.getElementById("photo-counter");

    if (!this.galleryElement) return;

    // Load photos
    this.loadPhotos();

    // Setup controls
    this.setupControls();

    // Setup keyboard navigation
    this.setupKeyboardNavigation();

    // Setup touch gestures for mobile
    this.setupTouchGestures();
  }

  loadPhotos() {
    if (!this.galleryElement) return;

    // Clear loading state
    this.galleryElement.innerHTML = "";

    // Create photo container
    const photoContainer = document.createElement("div");
    photoContainer.className = "photo-container position-relative";

    // Create current photo display
    const photoDisplay = document.createElement("div");
    photoDisplay.className = "photo-display";
    photoDisplay.innerHTML = this.createPhotoHTML(this.photos[0]);

    // Create photo info overlay
    const photoInfo = document.createElement("div");
    photoInfo.className = "photo-info";
    photoInfo.innerHTML = this.createPhotoInfoHTML(this.photos[0]);

    photoContainer.appendChild(photoDisplay);
    photoContainer.appendChild(photoInfo);
    this.galleryElement.appendChild(photoContainer);

    // Update counter
    this.updateCounter();
  }

  createPhotoHTML(photo) {
    return `
            <div class="photo-wrapper">
                <img src="${photo.image}" 
                     alt="${photo.title}" 
                     class="photo-image img-fluid rounded shadow-lg"
                     loading="lazy">
                <div class="photo-overlay">
                    <div class="photo-category">${photo.category}</div>
                </div>
            </div>
        `;
  }

  createPhotoInfoHTML(photo) {
    return `
            <div class="photo-details">
                <h5 class="photo-title">${photo.title}</h5>
                <p class="photo-description">${photo.description}</p>
                <small class="photo-date text-muted">${new Date(photo.date).toLocaleDateString()}</small>
            </div>
        `;
  }

  setupControls() {
    const prevButton = document.getElementById("prev-photo");
    const nextButton = document.getElementById("next-photo");

    if (prevButton) {
      prevButton.addEventListener("click", () => this.previousPhoto());
    }

    if (nextButton) {
      nextButton.addEventListener("click", () => this.nextPhoto());
    }
  }

  setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        this.previousPhoto();
      } else if (e.key === "ArrowRight") {
        this.nextPhoto();
      }
    });
  }

  setupTouchGestures() {
    if (!this.galleryElement) return;

    let touchStartX = 0;
    let touchEndX = 0;

    this.galleryElement.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    this.galleryElement.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
    });
  }

  handleSwipe(startX, endX) {
    if (endX < startX - 50) {
      this.nextPhoto();
    }
    if (endX > startX + 50) {
      this.previousPhoto();
    }
  }

  previousPhoto() {
    this.currentPhotoIndex =
      (this.currentPhotoIndex - 1 + this.photos.length) % this.photos.length;
    this.updatePhoto();
    this.trackPhotoView("previous");
  }

  nextPhoto() {
    this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.photos.length;
    this.updatePhoto();
    this.trackPhotoView("next");
  }

  updatePhoto() {
    if (!this.galleryElement) return;

    const currentPhoto = this.photos[this.currentPhotoIndex];
    const photoDisplay = this.galleryElement.querySelector(".photo-display");
    const photoInfo = this.galleryElement.querySelector(".photo-info");

    if (photoDisplay) {
      // Add fade effect
      photoDisplay.style.opacity = "0";

      setTimeout(() => {
        photoDisplay.innerHTML = this.createPhotoHTML(currentPhoto);
        photoDisplay.style.opacity = "1";
      }, 300);
    }

    if (photoInfo) {
      photoInfo.innerHTML = this.createPhotoInfoHTML(currentPhoto);
    }

    this.updateCounter();
  }

  updateCounter() {
    if (this.counterElement) {
      this.counterElement.textContent = `${this.currentPhotoIndex + 1} / ${this.photos.length}`;
    }
  }

  trackPhotoView(action) {
    const currentPhoto = this.photos[this.currentPhotoIndex];

    // Photo interaction (no analytics tracking)
    console.log(`📸 Photo ${action}: ${currentPhoto.title}`);
  }

  
}

// Initialize the photo gallery
new PhotoGallery();

// Add custom styles for the gallery
const galleryStyles = document.createElement("style");
galleryStyles.textContent = `
    .photo-gallery {
        position: relative;
        max-width: 800px;
        margin: 0 auto;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .photo-container {
        position: relative;
        background: var(--bg-secondary);
    }

    .photo-display {
        transition: opacity 0.3s ease;
    }

    .photo-wrapper {
        position: relative;
    }

    .photo-image {
        width: 100%;
        height: auto;
        display: block;
    }

    .photo-overlay {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
    }

    .photo-info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
        color: white;
        padding: 2rem 1.5rem 1.5rem;
    }

    .photo-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .photo-description {
        font-size: 0.95rem;
        margin-bottom: 0.5rem;
        line-height: 1.4;
    }

    .gallery-controls {
        margin-top: 1rem;
    }

    .photo-gallery-loading {
        min-height: 400px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    @media (max-width: 768px) {
        .photo-info {
            padding: 1.5rem 1rem 1rem;
        }
        
        .photo-title {
            font-size: 1.1rem;
        }
        
        .photo-description {
            font-size: 0.9rem;
        }
        
        .photo-overlay {
            top: 0.5rem;
            right: 0.5rem;
            padding: 0.25rem 0.5rem;
            font-size: 0.8rem;
        }
    }
`;

document.head.appendChild(galleryStyles);
