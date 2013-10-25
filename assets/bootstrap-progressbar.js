!function ($) {
	var ProgressBar = function (element, options) {
		this.element = $(element);
		this.position = 0;
		this.percent = 0;
		var hasOptions = typeof options == 'object';

		this.markers = $.fn.progressbar.defaults.markers;
		if (hasOptions && typeof options.markers == 'object') {
			this.setMarkers(options.markers);
		}

		this.maximum = $.fn.progressbar.defaults.maximum;
		if (hasOptions && typeof options.maximum == 'number') {
			this.setMaximum(options.maximum);
		}

		this.step = $.fn.progressbar.defaults.step;
		if (hasOptions && typeof options.step == 'number') {
			this.setStep(options.step);
		}

		this.setTemplate(this.markers)
		this.element.html(this.template);
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

		setTemplate: function (markers) {
			template = '<div class="progress progress-mini progress-striped active" style="height: 10px;"><span class="state-position badge" style="position: absolute; left: 0%; top: -5px;">0</span>'
			
			for(var i=0; i < markers.length; i++) {
				template += '<div class="bar ' + markers[i].barClass + ' progress-bar progress-' + markers[i].barClass +'" style="width: 0%;left: -1%"></div>';
				position = 100;
				if(i < markers.length-1) {
					position = markers[i+1].position;
				}
				template += '<span class="badge ' + markers[i].badgeClass + '" style="position: absolute; left: ' + (position - 1) + '%; top: -5px;">' + (i + 1) + '</span>';
			}
			return this.template = template + '</div>';
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
				for(var i = 0; i < this.markers.length; i++) {
					// 使每一个if代码块都只执行一次
					if(i == 0) {
						if (this.percent <= this.markers[i+1].position) {
							for(j in this.markers) {
								if(j <= i){
									this.element.find('.' + this.markers[j].barClass).css('width', this.percent + "%");
								} else {
									this.element.find('.' + this.markers[j].barClass).css('width', "0%");
								}
							}
							return;
						}
					} else if (i > 0 && i < this.markers.length - 1) {
						// i >= 1 && i <= length-2
						this.element.find('.' + this.markers[i-1].barClass).css('width', (this.markers[i].position - this.markers[i-1].position) + "%");
						if (this.percent > this.markers[i].position && this.percent <= this.markers[i+1].position) {
							this.element.find('.' + this.markers[i].barClass).css('width', (this.percent - this.markers[i].position) + "%");
							for(var j = i+1; j < this.markers.length; j++){
								this.element.find('.' + this.markers[j].barClass).css('width', "0%");
							}
							return;
						}
					} else if (i == this.markers.length - 1) {
						this.element.find('.' + this.markers[i-1].barClass).css('width', (this.markers[i].position - this.markers[i-1].position) + "%");
						this.element.find('.' + this.markers[i].barClass).css('width', (this.percent - this.markers[i].position) + "%");
						return;
					}
				}
			} finally {
				this._triggerPositionChanged();
			}
		},

		reset: function () {
			this.position = 0;
			this.percent = 0;
			this._triggerPositionChanged();
			for(i in this.markers) {
				this.element.find("." + this.markers[i].barClass).css('width', "0%");
			}
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
		markers: 
			[ { name: "step0", position: 0, barClass: "bar-info" , badgeClass: "badge-info" },
				{ name: "step1", position: 25, barClass: "bar-success", badgeClass: "badge-success" }, 
			  { name: "step2", position: 50, barClass: "bar-warning", badgeClass: "badge-warning" }, 
			  { name: "step3", position: 75, barClass: "bar-danger", badgeClass: "badge-important" }
			],
		maximum: 100,
		step: 10
	};

	$.fn.progressbar.Constructor = ProgressBar;
} (window.jQuery);
