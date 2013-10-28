/*
	Progressbar extension based on bootstrap's progressbar, contributed by agilejzl, 
	see more information at https://github.com/agilejzl/bootstrap-progressbar-extension.
*/

!function ($) {
	var ProgressBar = function (element, options) {
		this.percent = 0;
		this.position = 0;
		this.isOver = false;
		this.isRunning = false;
		this.loadedLabel = '';
		this.changedLabel = '';

		this.element = $(element);
		var hasOptions = typeof options == 'object';
		this.minimum = $.fn.progressbar.defaults.minimum;

		this.step = $.fn.progressbar.defaults.step;
		if (hasOptions && typeof options.step == 'number') {
			this.setStep(options.step);
		}

		this.averageStep = $.fn.progressbar.defaults.averageStep;
		if (hasOptions && typeof options.averageStep == 'boolean') {
			this.setAverageStep(options.averageStep);
		}

		this.defaultBadge = $.fn.progressbar.defaults.defaultBadge;
		if (hasOptions && typeof options.defaultBadge == 'boolean') {
			this.setDefaultBadge(options.defaultBadge);
		}

		this.barClass = $.fn.progressbar.defaults.barClass;
		if (hasOptions && typeof options.barClass == 'string') {
			this.setBarClass(options.barClass);
		}

		this.badgeClasses = $.fn.progressbar.defaults.badgeClasses;
		if (hasOptions && typeof options.barClass == 'object') {
			this.setBadgeClasses(options.badgeClasses);
		}

		this.markerLabels = $.fn.progressbar.defaults.markerLabels;
		if (hasOptions && typeof options.markerLabels == 'object') {
			this.setMarkerLabels(options.markerLabels);
		}

		this.markers = $.fn.progressbar.defaults.markers;
		if (hasOptions && typeof options.markers == 'object') {
			this.setMarkers(options.markers);
		}
		this.zoom_percent = $.fn.progressbar.defaults.zoom_percent;
		this.setMaxPosition();

		// this.barSize = $.fn.progressbar.defaults.barSize;
		if (hasOptions && typeof options.barSize == 'number') {
			this.setBarSize(options.barSize);
		}
		this.setTemplate();

		this.maximum = $.fn.progressbar.defaults.maximum;
		if (hasOptions && typeof options.maximum == 'number') {
			this.setMaximum(options.maximum);
		}

		if (hasOptions && typeof options.minimum == 'number') {
			this.setMinimum(options.minimum)
		}
		this.reset();
	};

	ProgressBar.prototype = {
		constructor: ProgressBar,

		stepIt: function () {
			if (this.position < this.maximum)
				this.position += this.step;
			this.setPosition(this.position);
		},

		setBarSize: function (barSize) {
			this.barSize = barSize;
		},

		setMarkerLabels: function (markerLabels) {
			this.markerLabels = markerLabels;
		},

		getMarkerLabel: function (i) {
			// return this.markerLabels[i % (this.markerLabels.length)];
			return this.markerLabels[i] == null ? '' : this.markerLabels[i];
		},

		setMarkers: function (markers) {
			this.markers = markers;
		},

		getMarker: function (i) {
			return this.markers[i] == null ? this.max_position : this.markers[i];
		},

		setMaxPosition: function () {
			this.max_position = this.markers[this.markers.length-1];
			if(this.max_position > 100) {
				this.zoom_percent = 100.0/this.max_position;
				for(var i = 0; i < this.markers.length; i++) {
					this.markers[i] *= this.zoom_percent; 
				}
			}
		},

		setBarClass: function (barClass) {
			this.barClass = barClass;
		},

		setBadgeClasses: function (badgeClasses) {
			this.badgeClasses = badgeClasses;
		},

		setMaximum: function (maximum) {
			maximum *= this.zoom_percent;
			if (maximum > 0 && maximum <= 100){
				this.maximum = ~~maximum;
			}
		},

		setMinimum: function (minimum) {
			minimum *= this.zoom_percent;
			if (minimum > 0 && minimum <= this.maximum) {
				this.minimum = ~~minimum;
			}
		},

		setAverageStep: function (averageStep) {
			this.averageStep = averageStep;
		},

		setDefaultBadge: function (defaultBadge) {
			this.defaultBadge = defaultBadge;
		},

		setStep: function (step) {
			step = ~~step;
			if(step <= 0)
				step = 1;
			this.step = ~~step;
		},

		setTemplate: function () {
			template = 
				'<div class="progress progress-mini progress-striped active" style="height: 10px; overflow-y: visible;">' + 
					'<div class="bar ' + this.barClass + ' progress-bar progress-' + this.barClass +'" style="width: 0%;left: 0%"></div>' + 
					'<span class="current-badge" style="position: absolute; top: -15px;"></span>' + 
					'<span class="state-position badge" style="position: absolute; left: 0%; top: -5px;">0</span>';

			iterSize = this.markers.length;
			if (this.barSize != null) {
				if (this.barSize > 0) {
					iterSize = this.barSize;
					this.averageStep = true;
				}				
			}
			
			iterLength = 100/iterSize;
			for(var i = 0; i < iterSize; i++) {
				var position = this.markers[i];
				if (this.averageStep || (position == null)) {
					position = iterLength*(i+1);					
				}

				var badgeClass = this.badgeClasses[i];
				if(this.defaultBadge || (badgeClass == null)) {
					var badgeClasses = ['badge-info', 'badge-success', 'badge-warning', 'badge-important', 'badge-inverse', ''];
					badgeClass = badgeClasses[i % (badgeClasses.length)];
				}
				
				this._triggerLabelLoaded(i);
				template += 
					'<span class="badge ' + badgeClass + '" style="position: absolute; left: ' + (position-1) + '%; top: -5px;">' + (i+1) + 
						'<div style="position: absolute; color: black; left: -1%;">' + this.loadedLabel + '</div></span>';
			}
			
			template += '</div>'
			this.element.html(template).css("position", "relative");
		},

		setPosition: function (position) {
			position = ~~position;
			if (position < 0)
				position = 0;
			if (position >= this.maximum) {
				position = this.maximum;
				this.isOver = true;
			}

			this.percent = this.position = position;
			try {
				this.element.find('.' + this.barClass).css('width', this.percent + "%");
			} finally {
				this._triggerPositionChanged();
			}
		},

		start: function (position) {
			if (this.isRunning)
				return;
			this.reset();
			this.isRunning = true;

			var self = this;
			this.interval = setInterval(function () {
				self.stepIt();
				if (self.isOver) {
					clearInterval(self.interval);
					self.interval = undefined;
					self.isRunning = false;
				}
			}, 250);
		},

		reset: function () {
			this.position = this.minimum;
			this.percent = this.minimum;
			this._triggerPositionChanged();
			this.element.find("." + this.barClass).css('width', this.minimum + "%");
			this.isOver = false;
		},

		setCurrentBadge: function () {
			$(".current-badge", this.element).css('left', (this.percent-1) + '%');
			if(this.percent >= 0 && this.percent <= 100) {
				$(".current-badge", this.element).html(this.changedLabel);
			} else {
				$(".current-badge", this.element).html('');
			}
		},

		_triggerLabelLoaded: function (labelIndex) {
			this.element.trigger({
				bar: this,
				type: 'labelLoaded',
				labelIndex: labelIndex
			});
		},

		_triggerPositionChanged: function () {
			this.element.trigger({
				bar: this,
				type: 'positionChanged'
			});
			this.setCurrentBadge();
		}
	};

	$.fn.progressbar = function (option) {
		var args = Array.apply(null, arguments);
		args.shift();
		return this.each(function () {
			var $this = $(this),
				data = $this.data('progressbar'),
				options = typeof option == 'object' && option;

			if (!data) {
				$this.data('progressbar', new ProgressBar(this, $.extend({}, $.fn.progressbar().defaults, options)));
			}
			if (typeof option == 'string' && typeof data[option] == 'function') {
				data[option].apply(data, args);
			}
		});
	};

	$.fn.progressbar.defaults = {
		step: 10,
		barSize: 3,
		minimum: 0,
		maximum: 100,
		zoom_percent: 1,
		max_position: 100,
		averageStep: false,
		defaultBadge: true,
		barClass: "bar-danger",
		markers: [33, 66, 100],
		markerLabels: [''],
		badgeClasses: ['badge-info', 'badge-success', 'badge-warning', 'badge-important', 'badge-inverse', '']
	};

	$.fn.progressbar.Constructor = ProgressBar;
} (window.jQuery);
