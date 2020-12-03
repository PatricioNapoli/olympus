(function($){
	'use strict';

/* --------------------------------------------------
	Initialization
-------------------------------------------------- */

    // Initialize all functions when the document is ready.
	$(document).ready(function(){

		initNavbar();
		initScroller();
		initSliders();
		initGallery();
		initAnimation();

	});


/* --------------------------------------------------
	Navigation | Navbar
-------------------------------------------------- */
	
	function initNavbar(){

		// Sticky Nav & Transparent Background
		$(window).scroll(function(){
			
			if ($(window).scrollTop() > 20) {
				$('nav').removeClass('navbar-trans', 300);
				$('nav').removeClass('navbar-trans-dark');
				$('nav').addClass('navbar-small', 300);
			}
			else {
				$('nav:not(.mobile-nav)').addClass('navbar-trans', 300);
				$('nav').removeClass('navbar-small', 300);

				if ($('nav').hasClass('trans-helper')) {
					$('nav:not(.mobile-nav)').addClass('navbar-trans-dark');
				}
			}

			$('nav:not(.navbar-fixed-top)').removeClass('navbar-trans navbar-small navbar-trans-dark');

		});


		// Nav on mobile screens
		$(window).resize(function() {
	        if ($(window).width() <= 1259) {
				$('nav').addClass('mobile-nav');		        
		    } else {
		    	$('nav').removeClass('mobile-nav');
		    }

    		if ($('nav').hasClass('mobile-nav')) {
    			$('nav').removeClass('navbar-trans');
    			$('nav').removeClass('navbar-trans-dark');
    		} else {
    			if ($(window).width() >= 1259 && $(window).top) {
    				$('nav').addClass('navbar-trans');
    			}
    		}

    		// Remove dropdown open on hover for small screens
    		if ($('nav').hasClass('mobile-nav')) {

    			$('.dropdown-toggle').on('mouseover', function(e){    
    			        e.preventDefault();

    			        $('.dropdown').removeClass('open');

    			    e.stopPropagation();
    			});
    		}

    		// Close mobile menu when clicked link
    		// var isNotDropdown = $('nav:not(.mobile-nav)');

    		if (!$('.nav a').hasClass('dropdown-toggle')) {

    			$('.nav a').on('click', function(){ 
			        if($('.navbar-toggle').css('display') !='none'){
			            $(".navbar-toggle").trigger( "click" );
			        }
			    });

    		}

	    }).resize();

		// Bugfix for iOS not scrolling on open menu
	    $(".navbar-collapse").css({ maxHeight: $(window).height() - $(".navbar-header").height() + "px" });


	} // initNavbar



/* --------------------------------------------------
	Scroll Nav
-------------------------------------------------- */

	function initScroller () {

		$('#navbar').localScroll({
			easing: 'easeInOutExpo'
		});

		$('#page-top').localScroll({
			easing: 'easeInOutExpo'
		});	
	} // initScroller


/* --------------------------------------------------
	Sliders
-------------------------------------------------- */

	function initSliders() {

		// Features Slider
		$('.ft-slider').slick({
			autoplay: true,
			autoplaySpeed: 4000,
			slidesToShow: 3,
			slidesToScroll: 1,
			dots: false,
			arrows: true,
			prevArrow: '<button type="button" class="info-slider-nav slick-prev"><i class="fa fa-long-arrow-left"></i></button>',
			nextArrow: '<button type="button" class="info-slider-nav slick-next"><i class="fa fa-long-arrow-right"></i></button>',
			responsive: [
			    {
			      breakpoint: 999,
			      settings: {
			        slidesToShow: 2,
			        slidesToScroll: 2,
			        infinite: true,
			      }
			    },
			    {
			      breakpoint: 770,
			      settings: {
			        slidesToShow: 1,
			        slidesToScroll: 1
			      }
			    }
			  ]
		});

		// Testimonials Sliders
		$('.t-slider').slick({
			autoplay: false,
			autoplaySpeed: 4000,
			slidesToShow: 1,
			slidesToScroll: 1,
			dots: false,
			arrows: true,
			prevArrow: '<button type="button" class="t-slider-nav slick-prev"><span class="linea-arrows-slim-left"></span></button>',
			nextArrow: '<button type="button" class="t-slider-nav slick-next"><span class="linea-arrows-slim-right"></span></button>',
		});

		// Brands/Clients Slider
		$('.clients-slider').slick({
			autoplay: true,
			autoplaySpeed: 4000,
			slidesToShow: 5,
			slidesToScroll: 1,
			dots: false,
			arrows: false,
			responsive: [
			    {
			      breakpoint: 999,
			      settings: {
			        slidesToShow: 3,
			        slidesToScroll: 2,
			        infinite: true,
			      }
			    },
			    {
			      breakpoint: 770,
			      settings: {
			        slidesToShow: 2,
			        slidesToScroll: 1
			      }
			    },
			    {
			      breakpoint: 599,
			      settings: {
			        slidesToShow: 1,
			        slidesToScroll: 1
			      }
			    }
			]
		});

		// Portfolio Single Slider
		$('.single-img-slider').slick({
			autoplay: true,
			autoplaySpeed: 4000,
			slidesToShow: 1,
			slidesToScroll: 1,
			adaptiveHeight: true,
			dots: false,
			arrows: true,
			prevArrow: '<button type="button" class="slider-nav sl-prev"><span class="linea-arrows-slim-left"></span></button>',
			nextArrow: '<button type="button" class="slider-nav sl-next"><span class="linea-arrows-slim-right"></span></button>',
		});

		// Centered Gallery
		$('.centered-gallery').slick({
			centerMode: true,
			  centerPadding: '60px',
			  slidesToShow: 3,
			  responsive: [
			    {
			      breakpoint: 768,
			      settings: {
			        arrows: false,
			        centerMode: true,
			        centerPadding: '40px',
			        slidesToShow: 3
			      }
			    },
			    {
			      breakpoint: 480,
			      settings: {
			        arrows: false,
			        centerMode: true,
			        centerPadding: '40px',
			        slidesToShow: 1
			      }
			    }
			  ]
		});

		// Full Screen Hero Slider
		$('.fs-slider').slick({
			slidesToShow: 1,
			slidesToScroll: 1,
			useCSS: true,
			fade: true,
			dots: false,
			arrows: true,
			prevArrow: '<button type="button" class="slick-prev"><span class="linea-arrows-slim-left"></span></button>',
			nextArrow: '<button type="button" class="slick-next"><span class="linea-arrows-slim-right"></span></button>',
			autoplay: true,
			autoplaySpeed: 4000,
		});

		// Full Width Hero Slider
		$('.fw-slider').slick({
			slidesToShow: 1,
			slidesToScroll: 1,
			fade: true,
			dots: false,
			arrows: true,
			prevArrow: '<button type="button" class="slick-prev"><span class="linea-arrows-slim-left"></span></button>',
			nextArrow: '<button type="button" class="slick-next"><span class="linea-arrows-slim-right"></span></button>',
			autoplay: true,
			autoplaySpeed: 4000,
		});

		// Text Slider
		$('.text-slider').slick({
			slidesToShow: 1,
			slidesToScroll: 1,
			adaptiveHeight: true,
			speed: 300,
			fade: true,
			dots: false,
			arrows: true,
			prevArrow: '<button type="button" class="slick-prev"><span class="linea-arrows-slim-left"></span></button>',
			nextArrow: '<button type="button" class="slick-next"><span class="linea-arrows-slim-right"></span></button>',
			autoplay: true,
			autoplaySpeed: 4000,
		});

	} // initSliders



/* --------------------------------------------------
	Light Gallery
-------------------------------------------------- */

	function initGallery () {

		// Image Lightbox
		var hasPopup = $('a').hasClass('open-gallery');

		if (hasPopup) {

			$('.open-gallery').magnificPopup({
				type:'image',
				gallery: {
				    enabled: true
				  }
			});

		}


		// Footer Gallery Lightbox
		var hasFtPopup = $('a').hasClass('gallery-widget-lightbox');

		if (hasFtPopup) {

			$('.gallery-widget-lightbox').magnificPopup({
				type:'image',
				gallery: {
				    enabled: true
				  }
			});

		}

		// Video Lightbox
		var hasVideoPopup = $('a').hasClass('popup-video');

		if (hasVideoPopup) {

			$('.popup-video').magnificPopup({
	          	disableOn: 700,
	         	type: 'iframe',
	          	mainClass: 'mfp-fade',
	          	removalDelay: 160,
	          	preloader: false,

	          	fixedContentPos: false
			});

		}

	} // initGallery


/* --------------------------------------------------
	Animation
-------------------------------------------------- */

	function initAnimation () {

		new WOW().init();

	}

})(jQuery);