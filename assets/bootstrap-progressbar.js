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
		this.step = $.fn.progressbar.defaults.step;
		this.minimum = $.fn.progressbar.defaults.minimum;
		this.maximum = $.fn.progressbar.defaults.maximum;
		this.markers = $.fn.progressbar.defaults.markers;
		this.barClass = $.fn.progressbar.defaults.barClass;
		// this.barSize = $.fn.progressbar.defaults.barSize;
		this.averageStep = $.fn.progressbar.defaults.averageStep;
		this.zoom_percent = $.fn.progressbar.defaults.zoom_percent;
		this.defaultBadge = $.fn.progressbar.defaults.defaultBadge;
		this.badgeClasses = $.fn.progressbar.defaults.badgeClasses;
		this.markerLabels = $.fn.progressbar.defaults.markerLabels;

		var hasOptions = typeof options == 'object';
		if (hasOptions && typeof options.step == 'number') {
			this.setStep(options.step);
		}
		if (hasOptions && typeof options.averageStep == 'boolean') {
			this.setAverageStep(options.averageStep);
		}
		if (hasOptions && typeof options.defaultBadge == 'boolean') {
			this.setDefaultBadge(options.defaultBadge);
		}
		if (hasOptions && typeof options.barClass == 'string') {
			this.setBarClass(options.barClass);
		}
		if (hasOptions && typeof options.barClass == 'object') {
			this.setBadgeClasses(options.badgeClasses);
		}
		if (hasOptions && typeof options.markerLabels == 'object') {
			this.setMarkerLabels(options.markerLabels);
		}
		if (hasOptions && typeof options.markers == 'object') {
			this.setMarkers(options.markers);
		}

		this.setMaxPosition();
		if (hasOptions && typeof options.barSize == 'number') {
			this.setBarSize(options.barSize);
		}
		if (hasOptions && typeof options.minimum == 'number') {
			this.setMinimum(options.minimum)
		}
		if (hasOptions && typeof options.maximum == 'number') {
			this.setMaximum(options.maximum);
		} else {
			this.setMaximum(this.max_position);
		}
		this.setTemplate();
		this.reset();
	};

	ProgressBar.prototype = {
		constructor: ProgressBar,

		stepIt: function () {
			this.position += this.step;
			if (this.position > this.maximum) {
				this.position = this.maximum;
				this.isOver = true;
			}
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
			this.zoom_percent = 100.0/this.max_position;
		},

		setBarClass: function (barClass) {
			this.barClass = barClass;
		},

		setBadgeClasses: function (badgeClasses) {
			this.badgeClasses = badgeClasses;
		},

		setMaximum: function (maximum) {
			if (maximum >= this.minimum && maximum <= this.max_position){
				this.maximum = maximum;
			} else {
				this.maximum = this.max_position;
			}
		},

		setMinimum: function (minimum) {
			if (minimum >= this.max_position) {
				this.minimum = this.max_position;
			} else if (minimum >= 0) {
				this.minimum = minimum;
			}
		},

		setAverageStep: function (averageStep) {
			this.averageStep = averageStep;
		},

		setDefaultBadge: function (defaultBadge) {
			this.defaultBadge = defaultBadge;
		},

		setStep: function (step) {
			if(step <= 0)
				step = 1;
			this.step = step;
		},

		setTemplate: function () {
			var template = 
				'<div class="progress progress-mini progress-striped active" style="height: 10px; overflow-y: visible;">' + 
					'<div class="bar ' + this.barClass + ' progress-bar progress-' + this.barClass + '" style="width: 0%;left: 0%"></div>' + 
					'<span class="current-badge" style="position: absolute; top: -15px;"></span>' + 
					'<span class="state-position badge" style="position: absolute; left: 0%; top: -5px;">0</span>';

			iterSize = this.markers.length;
			if (this.barSize != null) {
				if (this.barSize > 0) {
					iterSize = this.barSize;
				}				
			}
			
			iterLength = this.max_position/iterSize;
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
				
				var percent = position*100.0/this.max_position;
				this._triggerLabelLoaded(i);
				template += 
					'<span class="badge ' + badgeClass + '" style="position: absolute; left: ' + (percent-1) + '%; top: -5px;">' + (i+1) + 
						'<div style="position: absolute; color: black; left: -1%;">' + this.loadedLabel + '</div></span>';
			}
			
			template += '</div>'
			this.element.html(template).css("position", "relative");
		},

		getPercent: function () {
			if (!this.averageStep) {
				this.percent = this.position*100.0 / this.max_position;
			} else {
				var stage = 0;
				for (var i = 0; i < this.markers.length; i++) {
					if (this.position <= this.markers[i]) {
						stage = i;
						break;
					}
				}
				
				if (stage == 0) {
					var add_stage = this.position / this.markers[stage];
				} else {
					var add_stage = (this.position - this.markers[stage-1]) / (this.markers[stage] - this.markers[stage-1])
				}
				this.percent = (100.0 / this.markers.length) * (stage + add_stage);
			}
			return this.percent;
		},

		setPosition: function (position) {
			if (position < 0) {
				this.position = 0;
			} else if (position < this.max_position) {
				this.position = position;
			} else {
				this.position = this.max_position;
				this.isOver = true;
			}

			try {
				this.element.find('.' + this.barClass).css('width', this.getPercent() + "%");
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
			// this.percent = this.minimum*100.0/this.max_position;
			this.element.find("." + this.barClass).css('width', this.getPercent() + "%");
			this.isOver = false;
			this._triggerPositionChanged();
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
		zoom_percent: 1.0,
		max_position: 100,
		averageStep: true,
		defaultBadge: true,
		markerLabels: [''],
		markers: [33, 66, 100],
		barClass: "bar-danger",
		badgeClasses: ['badge-info', 'badge-success', 'badge-warning', 'badge-important', 'badge-inverse', '']
	};

	$.fn.progressbar.Constructor = ProgressBar;
} (window.jQuery);
