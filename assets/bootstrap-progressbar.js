!function ($) {
	var ProgressBar = function (element, options) {
		this.element = $(element);
		this.position = 0;
		this.percent = 0;
		var hasOptions = typeof options == 'object';

		this.step = $.fn.progressbar.defaults.step;
		if (hasOptions && typeof options.step == 'number') {
			this.setStep(options.step);
		}

		this.maximum = $.fn.progressbar.defaults.maximum;
		if (hasOptions && typeof options.maximum == 'number') {
			this.setMaximum(options.maximum);
		}

		this.barClass = $.fn.progressbar.defaults.barClass;
		if (hasOptions && typeof options.barClass == 'string') {
			this.setBarClass(options.barClass);
		}

		this.markers = $.fn.progressbar.defaults.markers;
		if (hasOptions && typeof options.markers == 'object') {
			this.setMarkers(options.markers);
		}
	};

	ProgressBar.prototype = {
		constructor: ProgressBar,

		stepIt: function () {
			if (this.position < this.maximum)
				this.position += this.step;
			this.setPosition(this.position);
		},

		setMarkers: function (markers) {
			this.markers = markers;
			this.setTemplate()
		},

		setBarClass: function (barClass) {
			this.barClass = barClass;
		},

		setMaximum: function (maximum) {
			this.maximum = parseInt(maximum);
		},

		setStep: function (step) {
			step = parseInt(step);
			if (step <= 0)
				step = 1;
			this.step = parseInt(step);
		},

		setTemplate: function () {
			template = 
				'<div class="progress progress-mini progress-striped active" style="height: 10px;">' + 
					'<span class="state-position badge" style="position: absolute; left: 0%; top: -5px;">0</span>' + 
						'<div class="bar ' + this.barClass + ' progress-bar progress-' + this.barClass +'" style="width: 0%;left: -1%"></div>';

			for(var i = 0; i < this.markers.length; i++) {
				template += '<span class="badge ' + this.markers[i].badgeClass + '" style="position: absolute; left: ' + (this.markers[i].position-1) + '%; top: -5px;">' + (i + 1) + '</span>';
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
				current = this.percent - this.step;
				length = this.markers.length;
				if (current >= 0 && current < this.markers[0].position) {
					// 当前进度在step0
					this.element.find('.' + this.barClass).css('width', this.percent + "%");
					return;
				}

				for(var i = 1; i <= length-2; i++) {
					if (current >= this.markers[i-1].position && current < this.markers[i].position) {
						// 当前进度在step1 —— step(n-2)
						this.element.find('.' + this.barClass).css('width', this.percent + "%");
						return;
					}
				}

				if (current >= this.markers[length-2].position && current < this.markers[length-1].position) {
					// 当前进度在step(n-1)
					this.element.find('.' + this.barClass).css('width', this.percent + "%");
					return;
				}
			} finally {
				this._triggerPositionChanged();
			}
		},

		reset: function () {
			this.position = 0;
			this.percent = 0;
			this._triggerPositionChanged();
			this.element.find("." + this.barClass).css('width', "0%");
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
		step: 20,
		maximum: 100,
		barClass: "bar-danger",
		markers: 
			[ { position: 25, badgeClass: "badge-info" },
				{ position: 50, badgeClass: "badge-success" }, 
				{ position: 75, badgeClass: "badge-warning" }, 
				{ position: 100, badgeClass: "badge-important" }
			]
	};

	$.fn.progressbar.Constructor = ProgressBar;
} (window.jQuery);
