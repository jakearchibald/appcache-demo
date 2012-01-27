var offlineInterface = (function() {
	function cacheControls() {
		var $toggler = $('<button class="offline-toggler"/>'),
			cached = offliner.isCached( location.href );

		function setButtonText() {
			var cacheMsg = 'Save for offline access',
				uncacheMsg = 'Remove from offline cache';
			
			$toggler.text( cached ? uncacheMsg : cacheMsg );
		}

		function toggle() {
			if ( cached ) {
				offliner.removeCurrentPage();
			}
			else {
				offliner.cacheCurrentPage();
			}
			cached = !cached;
			setButtonText();
		}

		$toggler.on( 'click', function(event) {
			toggle();
			event.preventDefault();
		});

		setButtonText();

		return $toggler;
	}

	return {
		addCacheControls: function() {
			cacheControls().prependTo( document.body );
		},
		addCacheClass: function($links) {
			$( $links ).each(function() {
				if ( offliner.isCached( this.href ) ) {
					this.className = ' availableOffline';
				}
			});
		}
	};
})();