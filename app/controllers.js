app.controller('MainCtrl', function ($rootScope, $scope, $interval, $uibModal, HelperService, MusicService, ApiService) {
    /* Music player */
    $scope.musicservice = MusicService;
    $scope.play = function() { MusicService.play(); };
    $scope.stop = function() { MusicService.stop(); };
    $scope.$on('ended', function(event) {
        MusicService.next(true);
    });
    $scope.volume_click = function(e) {
        var width = $(e.currentTarget).width();
        var volume = (e.offsetX / width) * 100;
        MusicService.set_volume(volume);
        $scope.current_volume = volume;
    };
    $scope.current_time = 0;
    $scope.current_volume = 80;
    $interval(function() {
        var time = MusicService.get_current_time();
        $scope.current_time = time;
        $scope.current_time_str = HelperService.formatTime(time);

        time = MusicService.get_duration();
        $scope.duration = time || 1;
        $scope.duration_str = HelperService.formatTime(time);

        $scope.playing = MusicService.playing;
    }, 1000);


    /* Server communication */
    $scope.tracks = ApiService.tracks;
    $scope.position = ApiService.position;
    $scope.registrations = ApiService.registrations;
    $scope.suggestions = ApiService.suggestions;

    var reposition = function(index, position) {
        // Keep the play position in sync with that of the server

        if (MusicService.index !== index) {
            MusicService.load_and_play({name: 'default_name', index: index});
        }

        var timediff = Math.abs(MusicService.get_current_time() - position);
        console.log('timediff = ' + timediff);
            
        if (isNaN(timediff)) {
            // In case the player has not started yet, retry in 1s
            console.log('retry');
            setTimeout(function() {
                var time_correction = (new Date().getTime() - ApiService.last_status_update) / 1000;
                console.log('correction = ' + time_correction);
                reposition(index, position + time_correction);
            }, 1000);
        }
        else if (timediff >= 5) {
            MusicService.seek(position);
        }
    };
    var reload = function(tracks) {
        MusicService.set_playlists({default_name: {tracks: tracks}});
        MusicService.load_and_play({name: 'default_name', index: 0});
    };
    
    $rootScope.$on('ready', function(event) {
        var modalInstance = $uibModal.open({
            animation: false,
            templateUrl: 'app/views/registration_modal.html',
            controller: 'RegistrationModalCtrl',
            backdrop  : 'static',
            keyboard  : false
        });
        modalInstance.result.then(function success(result) {
            ApiService.register(result.name, result.activity);

            // Starting playing
            $scope.$watch('tracks', function (new_value, old_val) {
                reload(new_value);
            }, true);
            $scope.$watch('position', function (new_value, old_val) {
                reposition(new_value[0], new_value[1]);
            }, true);
        }, function error() {
        });
    });

    $scope.create_suggestion = function() {
        var modalInstance = $uibModal.open({
            animation: false,
            templateUrl: 'app/views/suggestion_modal.html',
            controller: 'SuggestionModalCtrl'
        });
        modalInstance.result.then(function success(result) {
            ApiService.suggest(result.suggestion);
        }, function error() {
        });
    };
});

app.controller('RegistrationModalCtrl',  function ($scope, $uibModalInstance) {
    $scope.save = function () {
        $scope.activity_popover = false;

        $scope.name_popover = (!$scope.name);
        if (!$scope.name)
            return;

        $scope.activity_popover = (!$scope.activity);
        if (!$scope.activity)
            return;

        $uibModalInstance.close({
            name: $scope.name,
            activity: $scope.activity
        });
    };
});

app.controller('SuggestionModalCtrl',  function ($scope, $uibModalInstance) {
    $scope.save = function () {
        $scope.suggestion_popover = (!$scope.suggestion);
        if (!$scope.suggestion)
            return;

        $uibModalInstance.close({
            suggestion: $scope.suggestion
        });
    };
    $scope.close = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
