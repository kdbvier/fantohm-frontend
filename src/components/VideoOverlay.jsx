import {NetworkIds} from "../networks";
import React from 'react';

function VideoOverlay({networkId}) {
	return <>
				<script src="https://f.vimeocdn.com/js/froogaloop2.min.js"></script>
				<div class="video">
					<iframe id="projectplayer" src={networkId === NetworkIds.Moonriver?
							"https://player.vimeo.com/video/660349567?api=1&background=1&autoplay=1&loop=1":
							"https://player.vimeo.com/video/660349559?api=1&background=1&autoplay=1&loop=1"}
							frameborder="0" title="fhm-fantom.mp4"></iframe>
				</div>
				<script>
					iframe = $('#projectplayer')[0];
					player = $f(iframe);
					player.api('setVolume',1); //reset volume
				</script>
			</>;
}

export default VideoOverlay;
