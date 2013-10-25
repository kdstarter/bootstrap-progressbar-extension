!function ($) {
	var ProgressBar = function (element, options) {
		this.percent = 0;
		this.position = 0;
		this.element = $(element);
		var hasOptions = typeof options == 'object';
		this.minimum = $.fn.progressbar.defaults.minimum;

		this.step = $.fn.progressbar.defaults.step;
		if (hasOptions && typeof options.step == 'number') {
			this.setStep(options.step);
		}

		this.maximum = $.fn.progressbar.defaults.maximum;
		if (hasOptions && typeof options.maximum == 'number') {
			this.setMaximum(options.maximum);
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

		this.markers = $.fn.progressbar.defaults.markers;
		if (hasOptions && typeof options.markers == 'object') {
			this.setMarkers(options.markers);
		}

		// this.barLength = $.fn.progressbar.defaults.barLength;
		if (hasOptions && typeof options.barLength == 'number') {
			this.setBarLength(options.barLength);
		}
		this.setTemplate();

		if (hasOptions && typeof options.minimum == 'number') {
			this.minimum = options.minimum;
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

		setBarLength: function (barLength) {
			this.barLength = barLength;
		},

		setMarkers: function (markers) {
			this.markers = markers;
		},

		setBarClass: function (barClass) {
			this.barClass = barClass;
		},

		setMaximum: function (maximum) {
			this.maximum = parseInt(maximum);
		},

		setAverageStep: function (averageStep) {
			this.averageStep = averageStep;
		},

		setDefaultBadge: function (defaultBadge) {
			this.defaultBadge = defaultBadge;
		},

		setStep: function (step) {
			step = parseInt(step);
			if(step <= 0)
				step = 1;
			this.step = parseInt(step);
		},

		setTemplate: function () {
			template = 
				'<div class="progress progress-mini progress-striped active" style="height: 10px;">' + 
					'<span class="state-position badge" style="position: absolute; left: 0%; top: -5px;">0</span>' + 
						'<div class="bar ' + this.barClass + ' progress-bar progress-' + this.barClass +'" style="width: 0%;left: -1%"></div>';

			iterLength = this.markers.length;
			if (this.barLength != null) {
				if (this.barLength > 0 && this.barLength <= this.markers.length) {
					iterLength = this.barLength;
					this.averageStep = true;
				}				
			}
			
			iterSize = 100/iterLength;
			for(var i = 0; i < iterLength; i++) {
				var position = this.markers[i].position;
				if (this.averageStep || (position == null)) {
					position = iterSize*(i+1);					
				}

				var badgeClass = this.markers[i].badgeClass;
				if(this.defaultBadge || (badgeClass == null)) {
					var badgeClasses = ['badge-info', 'badge-success', 'badge-warning', 'badge-important', 'badge-inverse', ''];
					badgeClass = badgeClasses[i % (badgeClasses.length)];
				}
				template += '<span class="badge ' + badgeClass + '" style="position: absolute; left: ' + (position-1) + '%; top: -5px;">' + (i + 1) + '</span>';
			}
			this.element.html(template + '</div>')
		},

		setPosition: function (position) {
			position = parseInt(position);
			if (position < 0)
				position = 0;
			if (position > this.maximum)
				position = this.maximum;

			this.position = position;
			this.percent = Math.ceil((this.position / this.maximum) * 100);
			try {
				this.element.find('.' + this.barClass).css('width', this.percent + "%");
			} finally {
				this._triggerPositionChanged();
			}
		},

		reset: function () {
			this.position = this.minimum;
			this.percent = this.minimum;
			this._triggerPositionChanged();
			this.element.find("." + this.barClass).css('width', this.minimum + "%");
		},

		_triggerPositionChanged: function () {
			this.element.trigger({
				type: "positionChanged",
				position: this.position,
				percent: this.percent
			});
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
		minimum: 0,
		maximum: 100,
		barLength: 4,
		averageStep: true,
		defaultBadge: true,
		barClass: "bar-danger",
		markers: 
			[   { position: 25, badgeClass: "badge-info" },
				{ position: 50, badgeClass: "badge-success" }, 
				{ position: 75, badgeClass: "badge-warning" }, 
				{ position: 100, badgeClass: "badge-important" }
			]
	};

	$.fn.progressbar.Constructor = ProgressBar;
} (window.jQuery);
