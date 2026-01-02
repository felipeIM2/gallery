// Photo Gallery Application with jQuery
$(document).ready(function() {
    // Store uploaded media
    let uploadedFotos = [];
    let uploadedVideos = [];
    let currentPreviewItem = null;
    
    // DOM Elements
    const $fotosGallery = $('#fotosGallery');
    const $videosGallery = $('#videosGallery');
    const $fotoInput = $('#fotoInput');
    const $videoInput = $('#videoInput');
    const $previewModal = $('#previewModal');
    const $modalImage = $('#modalImage');
    const $modalVideo = $('#modalVideo');
    const $modalVideoSource = $('#modalVideo source');
    
    // Tab navigation with smooth transition
    $('.nav-tab').on('click', function() {
        const $clickedTab = $(this);
        const tabId = $clickedTab.data('tab');
        
        // Remove active class from all tabs and contents
        $('.nav-tab').removeClass('active');
        $('.tab-content').removeClass('active');
        
        // Add active class to clicked tab
        $clickedTab.addClass('active');
        
        // Show corresponding content with fade effect
        $(`#${tabId}-tab`).addClass('active');
        
        // Adjust gallery layout for mobile
        adjustGalleryLayout();
    });
    
    // Adjust gallery layout based on screen size
    function adjustGalleryLayout() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            $('.gallery').addClass('mobile-gallery');
            $('.media-info').hide();
        } else {
            $('.gallery').removeClass('mobile-gallery');
            $('.media-info').show();
        }
    }
    
    // Initial layout adjustment
    adjustGalleryLayout();
    
    // Adjust layout on window resize
    $(window).on('resize', function() {
        adjustGalleryLayout();
    });
    
    // Add foto button click
    $('#addFotoBtn').on('click', function() {
        $fotoInput.click();
    });
    
    // Add video button click
    $('#addVideoBtn').on('click', function() {
        $videoInput.click();
    });
    
    // Handle foto selection
    $fotoInput.on('change', function(e) {
        if (this.files.length) {
            handleMediaFiles(this.files, 'foto');
        }
    });
    
    // Handle video selection
    $videoInput.on('change', function(e) {
        if (this.files.length) {
            handleMediaFiles(this.files, 'video');
        }
    });
    
    // Process selected media files
    function handleMediaFiles(files, type) {
        $.each(files, function(i, file) {
            // Check if file is the correct type
            if (type === 'foto' && !file.type.match('image.*')) {
                alert(`${file.name} is not an image file.`);
                return;
            }
            
            if (type === 'video' && !file.type.match('video.*')) {
                alert(`${file.name} is not a video file.`);
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Create media object
                const mediaObj = {
                    id: Date.now() + i,
                    name: file.name,
                    size: formatFileSize(file.size),
                    src: e.target.result,
                    type: type,
                    file: file
                };
                
                // Add to appropriate array and display
                if (type === 'foto') {
                    uploadedFotos.push(mediaObj);
                    createMediaCard(mediaObj, $fotosGallery);
                    
                    // Remove empty message if first foto
                    if (uploadedFotos.length === 1) {
                        $fotosGallery.find('.empty-gallery-message').remove();
                    }
                } else {
                    uploadedVideos.push(mediaObj);
                    createMediaCard(mediaObj, $videosGallery);
                    
                    // Remove empty message if first video
                    if (uploadedVideos.length === 1) {
                        $videosGallery.find('.empty-gallery-message').remove();
                    }
                }
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // Create media card element with jQuery
    function createMediaCard(mediaObj, $gallery) {
        let cardHtml;
        
        if (mediaObj.type === 'foto') {
            cardHtml = `
                <div class="media-card">
                    <img src="${mediaObj.src}" alt="${mediaObj.name}" class="media-preview" data-id="${mediaObj.id}">
                    <div class="media-info">
                        <div class="media-name">${mediaObj.name}</div>
                    </div>
                </div>`;
        } else {
            cardHtml = `
                <div class="media-card">
                    <div class="video-preview">
                        <video class="media-preview" data-id="${mediaObj.id}" preload="metadata">
                            <source src="${mediaObj.src}" type="${mediaObj.file.type}">
                        </video>
                    </div>
                    <div class="media-info">
                        <div class="media-name">${mediaObj.name}</div>
                    </div>
                </div>`;
        }
        
        const $mediaCard = $(cardHtml);
        
        // Add click event to media for preview
        $mediaCard.find('.media-preview').on('click', function() {
            openPreview(mediaObj);
        });
        
        // Add to gallery with animation
        $gallery.append($mediaCard.hide().fadeIn(300));
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Open media preview modal
    function openPreview(mediaObj) {
        currentPreviewItem = mediaObj;
        
        // Hide both media elements
        $modalImage.hide();
        $modalVideo.hide();
        
        if (mediaObj.type === 'foto') {
            // Show image
            $modalImage.attr({
                'src': mediaObj.src,
                'alt': mediaObj.name
            }).show();
        } else {
            // Show video
            $modalVideoSource.attr('src', mediaObj.src);
            $modalVideo[0].load();
            $modalVideo.show();
        }
        
        // Set up button events
        $('#downloadBtn').off('click').on('click', function() {
            downloadMedia(mediaObj);
        });
        
        $('#deleteBtn').off('click').on('click', function() {
            deleteMedia(mediaObj.id, mediaObj.type);
        });
        
        // Show modal with animation
        $previewModal.fadeIn(200);
        $('body').css('overflow', 'hidden');
    }
    
    // Close preview modal
    $('#closeModal').on('click', closePreview);
    
    // Close modal when clicking outside
    $previewModal.on('click', function(e) {
        if (e.target === this) {
            closePreview();
        }
    });
    
    // Close modal with Escape key
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && $previewModal.is(':visible')) {
            closePreview();
        }
    });
    
    // Close preview function
    function closePreview() {
        $previewModal.fadeOut(200);
        $('body').css('overflow', 'auto');
        
        // Pause video if it was playing
        if ($modalVideo.length) {
            $modalVideo[0].pause();
        }
    }
    
    // Download media
    function downloadMedia(mediaObj) {
        const link = document.createElement('a');
        link.href = mediaObj.src;
        link.download = mediaObj.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Delete media
    function deleteMedia(id, type) {
        if (type === 'foto') {
            // Remove from fotos array
            uploadedFotos = uploadedFotos.filter(img => img.id !== id);
            
            // Remove from DOM with animation
            $(`.media-card .media-preview[data-id="${id}"]`).closest('.media-card').fadeOut(300, function() {
                $(this).remove();
            });
            
            // Show empty message if no fotos left
            if (uploadedFotos.length === 0) {
                showEmptyMessage($fotosGallery);
            }
        } else {
            // Remove from videos array
            uploadedVideos = uploadedVideos.filter(vid => vid.id !== id);
            
            // Remove from DOM with animation
            $(`.media-card .media-preview[data-id="${id}"]`).closest('.media-card').fadeOut(300, function() {
                $(this).remove();
            });
            
            // Show empty message if no videos left
            if (uploadedVideos.length === 0) {
                showEmptyMessage($videosGallery);
            }
        }
        
        // Close modal
        closePreview();
    }
    
    // Show empty gallery message
    function showEmptyMessage($gallery) {
        const messageText = $gallery.is($fotosGallery) ? 
            '<p>Nenhuma foto adicionada ainda</p>' : 
            '<p>Nenhum video adicionado ainda</p>';
            
        const $emptyMessage = $(`<div class="empty-gallery-message">${messageText}</div>`);
        $gallery.append($emptyMessage.hide().fadeIn(300));
    }
});