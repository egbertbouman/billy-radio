app.controller('MainCtrl', function ($rootScope, $scope, $attrs, $interval, $uibModal, HelperService, MusicService, ApiService) {

    $scope.radio = 'd3e6f1ac9e0365f5e0685204284cda6dab51a52b';

    /* Music player */
    $scope.musicservice = MusicService;
    $scope.current_time = 0;
    $scope.current_volume = 50;

    $scope.start = function() {
        // Start music service
        MusicService.init();

        // Wait for it to load...
        $rootScope.$on('ready', function(event) {

            // Start playing
            $scope.$watch('tracks', function (new_value, old_val) {
                reload(new_value);
            }, true);
            $scope.$watch('position', function (new_value, old_val) {
                reposition(new_value[0], new_value[1]);
            }, true);

            // Periodically update status
            $interval(function() {
                var time = MusicService.get_current_time();
                $scope.current_time = time;
                $scope.current_time_str = HelperService.formatTime(time);

                time = MusicService.get_duration();
                $scope.duration = time || 1;
                $scope.duration_str = HelperService.formatTime(time);

                $scope.remaining = Math.abs($scope.current_time - $scope.duration);
                $scope.remaining_str = HelperService.formatTime($scope.remaining);
            }, 1000);
        });
    };
    $scope.$on('ended', function(event) {
        MusicService.next(true);
        log();
    });
    $scope.set_volume = function(volume) {
        MusicService.set_volume(volume);
        $scope.current_volume = volume;
    };
    $scope.volume_click = function(e) {
        var width = $(e.currentTarget).width();
        var volume = (e.offsetX / width) * 100;
        $scope.set_volume(volume);
    };
    var reload = function(tracks) {
        MusicService.set_playlists({default_playlistname: {tracks: tracks}});
        MusicService.load_and_play({name: 'default_playlistname', index: 0});
        log();
    };

    /* Server variables */
    $scope.tracks = ApiService.tracks;
    $scope.position = ApiService.position;
    $scope.registrations = ApiService.registrations;

    /* Clicklog */
    var log = function() {
        ApiService.post_clicklog({
            track: $scope.musicservice.track.link,
            user: $scope.user_name,
            volume: $scope.current_volume,
            radio: $scope.radio
        });
    };

    /* Play position synchronization */
    var playlist_position = function(index, position) {
        var pl_pos = 0;
        for (var i = 0; i < index; i++) {
            pl_pos += $scope.tracks[i].duration;
        }
        pl_pos += position;
        return pl_pos;
    };

    var reposition = function(index, position) {
        // Calculate position within the playlist for both the client and the server
        var pl_pos_srv = playlist_position(index, position);
        var pl_pos_clt = playlist_position(MusicService.index, MusicService.get_current_time());
        var timediff = Math.abs(pl_pos_clt - pl_pos_srv);
        //console.log('Time difference: ' + timediff);

        if (isNaN(timediff)) {
            // In case the player has not started yet, retry when the player is ready
            console.log('Can\'t calculate time difference right now, rescheduling');
            var unsubscribe = $rootScope.$on('playing', function(event) {
                var time_correction = (new Date().getTime() - ApiService.last_status_update) / 1000;
                reposition(index, position + time_correction);
                unsubscribe();
            });
        }
        else if (timediff >= 5) {
            console.log('Time difference is ' + timediff + 's, correcting play position');
            if (MusicService.index !== index) {
                MusicService.load_and_play({name: 'default_playlistname', index: index});
            }
            MusicService.seek(position);
        }
    };

    $scope.close_widget = function() {
        parent.postMessage('close-widget', '*');
    };

    var old_volume = $scope.current_volume;
    window.onmessage = function(event) {
        if (event.data === 'restore-volume') {
            $scope.set_volume(old_volume);
        }
        else if (event.data === 'mute-volume') {
            old_volume = $scope.current_volume;
            $scope.set_volume(0);
        }
    };

    $(window).ready(function() {
        $scope.in_iframe = window.location !== window.parent.location;
    });

    $scope.start();
    ApiService.register('default_username', $scope.radio);
});
