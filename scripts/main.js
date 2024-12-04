document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('audio');
    const playPauseButton = document.getElementById('button-play-pause');
    const prevButton = document.getElementById('button-previous');
    const nextButton = document.getElementById('button-next');
    const shuffleButton = document.getElementById('button-shuffle');
    const volumeButton = document.getElementById('button-volume');
    const artistList = document.getElementById('artist-list');
    const songList = document.getElementById('song-list');
    const coverImage = document.getElementById('current-song-cover');

    let songs = [];
    let currentSongIndex = 0;
    let isMuted = false;
    let currentArtist = '';
    let songData = {}; // Initialize songData

    // Fetch song data from JSON file
    async function fetchSongData() {
        try {
            const response = await fetch('scripts/songs.json');
            if (!response.ok) throw new Error('Network response was not ok.');
            songData = await response.json();
            loadArtists();
        } catch (error) {
            console.error('Error fetching song data:', error);
        }
    }

    // Function to load artists from the data
    function loadArtists() {
        const artists = Object.keys(songData.songs || {});
        artistList.innerHTML = artists.map(artist =>
            `<li class="text-sm p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer" data-artist="${artist}">
                <i class="fas fa-user mr-2"></i>${artist}
            </li>`
        ).join('');

        // Add click event listeners to artist items
        artistList.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', (event) => {
                const artist = event.target.getAttribute('data-artist') || event.currentTarget.getAttribute('data-artist');
                loadSongsByArtist(artist);
            });
        });
    }

    // Function to load songs for a specific artist
    function loadSongsByArtist(artist) {
        songs = songData.songs[artist] || [];
        currentArtist = artist;
        if (songs.length > 0) {
            displaySongs();
            loadSong(0);
        } else {
            songList.innerHTML = '<li class="text-sm text-red-500">No songs available for this artist.</li>';
        }
    }

    // Function to display the songs list
    function displaySongs() {
        songList.innerHTML = songs.map((song, index) =>
            `<li class="text-sm p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer" data-index="${index}">
                <i class="fas fa-music mr-2"></i>${song.title}
            </li>`
        ).join('');

        // Add click event listeners to song items
        songList.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', (event) => {
                const index = parseInt(event.target.getAttribute('data-index'), 10) || parseInt(event.currentTarget.getAttribute('data-index'), 10);
                changeSong(index);
            });
        });
    }

    // Function to load a specific song
    function loadSong(index) {
        if (songs[index]) {
            audio.src = songs[index].source;
            document.getElementById('current-song-name').textContent = songs[index].title;
            document.getElementById('current-song-artist').textContent = currentArtist;

            // Update cover photo
            coverImage.src = songs[index].cover || 'https://picsum.photos/1024'; // Fallback if cover is not provided

            audio.play();
            playPauseButton.innerHTML = '<i class="fas fa-pause-circle fa-3x"></i>';
        }
    }

    // Change to a specific song
    function changeSong(index) {
        if (index >= 0 && index < songs.length) {
            currentSongIndex = index;
            loadSong(index);
        }
    }

    // Toggle play/pause
    playPauseButton.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playPauseButton.innerHTML = '<i class="fas fa-pause-circle fa-3x"></i>';
        } else {
            audio.pause();
            playPauseButton.innerHTML = '<i class="fas fa-play-circle fa-3x"></i>';
        }
    });

    // Play previous song
    prevButton.addEventListener('click', () => {
        changeSong((currentSongIndex - 1 + songs.length) % songs.length);
    });

    // Play next song
    nextButton.addEventListener('click', () => {
        changeSong((currentSongIndex + 1) % songs.length);
    });

    // Toggle mute
    volumeButton.addEventListener('click', () => {
        if (isMuted) {
            audio.muted = false;
            volumeButton.innerHTML = '<i class="fas fa-volume-up fa-lg"></i>';
        } else {
            audio.muted = true;
            volumeButton.innerHTML = '<i class="fas fa-volume-mute fa-lg"></i>';
        }
        isMuted = !isMuted;
    });

    // Play a random song
    shuffleButton.addEventListener('click', () => {
        if (songs.length > 0) {
            const randomIndex = Math.floor(Math.random() * songs.length);
            changeSong(randomIndex);
        }
    });

    // Update progress bar
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            document.getElementById("progress").style.height = `${progress}%`;
        }
    });

    // Automatically play the next song when the current song ends
    audio.addEventListener('ended', () => {
        changeSong((currentSongIndex + 1) % songs.length);
    });

    // Fetch and load artists on page load
    fetchSongData();
});
      
