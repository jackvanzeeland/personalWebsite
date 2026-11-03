// Photo Gallery Component for Beyond the Code page

import { optimizedPictureHTML } from "../utils/optimizedImage";

// Gallery photos (title is used as alt text only; no captions are rendered)
const REAL_PHOTOS = [
  { title: "1st Half Marathon", image: "/images/beyondTheCodePhotos/IMG_2178.JPG" },
  { title: "Cabin Weekend", image: "/images/beyondTheCodePhotos/IMG_4961.HEIC.jpg" },
  { title: "College Graduation", image: "/images/beyondTheCodePhotos/IMG_8128.HEIC.jpg" },
  { title: "Spring Break 2025 - Cabo", image: "/images/beyondTheCodePhotos/IMG_3741.JPG" },
  { title: "Banff Road Trip", image: "/images/beyondTheCodePhotos/IMG_1118.JPG" },
  { title: "Regional Champions", image: "/images/beyondTheCodePhotos/26E3874A-57D3-49E4-8A02-6B55724F9348.HEIC.jpg" },
  { title: "Packer Game Day", image: "/images/beyondTheCodePhotos/IMG_9057.HEIC.jpg" },
  { title: "Sunset by the Ocean", image: "/images/beyondTheCodePhotos/IMG_5270.HEIC.jpg" },
  { title: "Golf on the Coast", image: "/images/beyondTheCodePhotos/IMG_3062.HEIC.jpg" },
  { title: "Beach Volleyball at North Ave", image: "/images/beyondTheCodePhotos/IMG_3758.JPEG" },
  { title: "Badgers Game Day", image: "/images/beyondTheCodePhotos/cpm35-2026-10-03.JPG" },
  { title: "Boat Day on Lake Michigan", image: "/images/beyondTheCodePhotos/IMG_4510.JPEG" },
];

export class PhotoGallery {
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
    photoContainer.className = "photo-container";

    // Create current photo display
    const photoDisplay = document.createElement("div");
    photoDisplay.className = "photo-display";
    photoDisplay.innerHTML = this.createPhotoHTML(this.photos[0]);

    // No caption block: the photos speak for themselves (title stays as alt text)
    photoContainer.appendChild(photoDisplay);
    this.galleryElement.appendChild(photoContainer);

    // Update counter
    this.updateCounter();
  }

  createPhotoHTML(photo) {
    return `
            <div class="photo-wrapper">
                ${optimizedPictureHTML(photo.image, {
                  alt: photo.title,
                  className: "photo-image",
                  sizes: "(min-width: 768px) 720px, 100vw",
                })}
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
    // Stored so destroy() can remove it: the view remounts on every visit,
    // and a leaked listener per visit made one arrow press skip photos.
    this.onKeydown = (e) => {
      const target = e.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowLeft") {
        this.previousPhoto();
      } else if (e.key === "ArrowRight") {
        this.nextPhoto();
      }
    };
    document.addEventListener("keydown", this.onKeydown);
  }

  destroy() {
    if (this.onKeydown) document.removeEventListener("keydown", this.onKeydown);
    this.onKeydown = null;
    this.galleryElement = null;
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

    if (photoDisplay) {
      // Add fade effect
      photoDisplay.style.opacity = "0";

      setTimeout(() => {
        photoDisplay.innerHTML = this.createPhotoHTML(currentPhoto);
        photoDisplay.style.opacity = "1";
      }, 300);
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
// SPA: instantiated by the beyond view after its DOM mounts
