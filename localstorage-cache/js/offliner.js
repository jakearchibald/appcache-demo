var offliner = (function() {
	var offlineIndex = (function() {
		var indexKey = 'offline-index',
			index;

		function getIndex() {
			if (index) {
				return index;
			}

			var indexStr = localStorage.getItem( indexKey );
			index = ( indexStr ? JSON.parse( indexStr ) : {} );
			return index;
		}

		function setIndex(index) {
			var json = JSON.stringify( index );
			localStorage.setItem( indexKey, json );
		}

		return {
			add: function(pathname, title) {
				var index = getIndex();
				index[pathname] = title;
				setIndex( index );
			},
			remove: function(pathname) {
				var index = getIndex();
				delete index[pathname];
				setIndex( index );
			},
			getTitle: function(pathname) {
				return getIndex()[pathname];
			},
			isIndexed: function(pathname) {
				return pathname in getIndex();
			},
			getKeys: function() {
				return Object.keys( getIndex() );
			},
			clear: function() {
				setIndex( {} );
			}
		};
	})();

	var snapshot,
		$body = $( document.body );

	$(function() {
		// capture output before js messes with it
		offliner.snapshotPage();
	});

	return {
		isOffline: false, // this is set in fallback.html
		addCachingIframe: function() {
			$body.prepend(
				'<iframe src="/offline-ala/fallback.html#iframed" style="position:absolute;top:-999em;visibility:hidden"></iframe>'
			);
		},
		cacheCurrentPage: function() {
			var pathname = location.pathname,
				content = snapshot || document.body.innerHTML;

			offlineIndex.add( pathname, document.title );
			localStorage.setItem( pathname, content );
		},
		removeCurrentPage: function() {
			var pathname = location.pathname;
			localStorage.removeItem( pathname );
			offlineIndex.remove( pathname );
		},
		renderCurrentPage: function() {
			var pathname = location.pathname,
				title,
				content;

			if ( this.isCached( location.href ) ) {
				title = offlineIndex.getTitle( pathname ) + ' (offline)';
				content = localStorage.getItem( pathname );
			}
			else {
				title = 'Not available';
				content = '<h1>Page not available :(</h1>';
			}

			// We don't add scripts with a src, they're already there
			$body.empty().append(
				$( content ).filter( ':not(script[src])' )
			);
			document.title = title;
		},
		isCached: function(url) {
			// TODO: get url.js involved - url will be full
			var pathname = /\/[^\/]+(\/[^?#]+)/.exec(url);
			pathname = pathname ? pathname[1] : '/';
			return offlineIndex.isIndexed( pathname );
		},
		snapshotPage: function() {
			snapshot = document.body.innerHTML;
		},
		clearAll: function() {
			offlineIndex.getKeys().forEach( function(key) {
				localStorage.removeItem( key );
			});
			offlineIndex.clear();
		}
	};
})();