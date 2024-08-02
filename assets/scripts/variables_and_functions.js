// vars
// change theme vars
const themeChangeBtn = document.getElementById('theme-change-btn');
const themeThumb = document.getElementById('theme-thumb');
const themeText = document.getElementById('theme-text');
// genre vars
const genreOptionsTag = document.getElementById('genreOptions');
const currentGenreDiv = document.getElementById('current-genre');
const genreSongsListDiv = document.querySelector('#current-genre-music ul');
const searchSongInput = document.getElementById('searchSongInput');
// displaySongDiv is the div for displaying the songs info
const displaySongDiv = document.querySelector('#music-info>.rows');
// prev next btns
const prevBtn = document.getElementById('prevSong');
prevBtn.classList.add('disabled-btn');
const nextBtn = document.getElementById('nextSong');
// add to playlist
const addToPlaylistBtn = document.getElementById('AddToPlayListBtn');
addToPlaylistBtn.classList.add('disabled-btn');
// create playlist button
const playlistInput = document.getElementById('createPlaylistName');
const createPlaylistBtn = document.getElementById('createPlaylistBtn');
const playlistUl = document.getElementById('allPlaylistsList');
const playlistSongsDiv = document.getElementById('currentPlaylistSongsList');
//info about current song, current selected playlist and total playlist created
let playlists = {};
let selectedPlaylist;
let currentSong = 1;


const toggleTheme = _ => {
    const curTheme = document.documentElement.getAttribute('data-theme'); 
        if(curTheme==='light') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeText.textContent = 'Dark';
            themeText.style.textAlign = 'start';
        }
        else {
            document.documentElement.setAttribute('data-theme','light');
            themeText.textContent = 'Light';
            themeText.style.textAlign = 'end';
        }
}

const fetchSongs = async () => {
    try {
      const response = await fetch('assets/songs.json');
      const data = await response.json();
      return data.songs;
    } catch (error) {
      console.error('Error fetching JSON data:', error);
    }
}
// filtering songs based on genre
const filterGenre = (songsList,genre) => {
    if (genre==='all') {
        return songsList;
    }
    return songsList.filter(song => song.genre === genre);
}
// to generate songs for a particular genre and display them
const showSongs = (songsList, key = 'genre', val = 'all') => {
    let filteredSongs;
    const searchTerm = searchSongInput.value.toLowerCase();
    if (key === 'genre') {
        let curGenre = genreOptionsTag.value || val;
        filteredSongs = filterGenre(songsList, curGenre);
        genreSongsListDiv.innerHTML = '';
    }
    if (searchTerm) {
        filteredSongs = filteredSongs.filter(song => song.name.toLowerCase().includes(searchTerm));
    }
    if (filteredSongs) {
        filteredSongs.forEach(song => {
            const songElement = document.createElement('li');
            songElement.classList.add('song-element', 'font-sm', 'songs');
            if (currentSong === song.id) songElement.classList.add('selected');
            songElement.textContent = `${song.name} - ${song.artist}`;
            genreSongsListDiv.appendChild(songElement);

            // Add event listener to each song element
            songElement.addEventListener('click', () => {
                const songName = songElement.textContent.split('-')[0].trim();
                const songObj = songsList.find(song => song.name === songName);
                currentSong = songObj.id;
                renderCurrentSong(songObj);
                playMusic(songObj);
                checkBtnStatus(songsList.length);
                highlightCurrentSongById(songsList, currentSong);
            });
        });
    }
};
// displays music details - song banner, song title, artist name
const renderCurrentSong = song => {
    const musicImg = document.createElement('img');
    musicImg.src = song.img;
    musicImg.classList.add('w-100');
    const musicTitle = document.createElement('h3');
    musicTitle.classList.add('font-lg','font-black');
    musicTitle.textContent = song.name;
    const musicArtist = document.createElement('p');
    musicArtist.classList.add('font-sm','font-black');
    musicArtist.textContent = song.artist;
    displaySongDiv.innerHTML = '';
    displaySongDiv.append(musicImg,musicTitle,musicArtist);
    currentSong = song.id;
}

const playMusic = songObj => {
    const musicPlayerDiv = document.getElementById('music-player');
    const path = `./assets/musicFiles/music-${songObj.source}`;
    musicPlayerDiv.src = path;
    musicPlayerDiv.play();
}

// check buttonStatus - greying btn if last or first music
const checkBtnStatus = (totalSongs) => {
    prevBtn.classList.toggle('disabled-btn', currentSong === 1);
    nextBtn.classList.toggle('disabled-btn', currentSong === totalSongs);
};

// add to playlist functionality
const addtoPlaylist = _ => {
    playlists[selectedPlaylist].append(currentSong);
    renderPlaylistSong();
}

const createPlaylist = (songsList) => {
    // Remove the previous selected playlist
    const previousSelected = playlistUl.querySelector('.selected');
    if (previousSelected) previousSelected.classList.remove('selected');
    playlists[playlistInput.value] = [];
    const playlistElement = document.createElement('li');
    playlistElement.classList.add('element', 'playlist-element', 'w-100', 'cols');
    const playListName = document.createElement('div');
    playListName.classList.add('selected');
    selectedPlaylist = playlistInput.value;
    playListName.textContent = playlistInput.value;
    playlistInput.value = '';
    const playlistDelete = document.createElement('button');
    playlistDelete.classList.add('delete-playlist');
    playlistDelete.innerHTML = `<i class="fa-solid fa-x"></i>`;
    playlistDelete.addEventListener('click', (event) => {
        event.stopPropagation();
        deletePlaylist(playlistElement, playListName.textContent);
    });
    playlistElement.append(playListName, playlistDelete);
    playlistUl.appendChild(playlistElement);    
    checkPlaylistSts();
    addPlaylistEventListener(songsList, playlistElement);
};
// eventlistner for all the playlists
const addPlaylistEventListener = (songsList, playlistElement) => {
    playlistElement.addEventListener('click', () => {
        const previousSelected = playlistUl.querySelector('.selected');
        if (previousSelected) previousSelected.classList.remove('selected');
        const playlistName = playlistElement.querySelector('div');
        playlistName.classList.add('selected');      
        selectedPlaylist = playlistName.textContent;
        renderPlaylistSong(songsList);
        addPlaylistSongListeners(songsList);
        highlightCurrentSongById(songsList, currentSong);
    });
};
const deletePlaylist = (playlistElement, playlistName) => {
    delete playlists[playlistName];
    playlistElement.remove();
    if (selectedPlaylist === playlistName) {
        selectedPlaylist = null;
        playlistSongsDiv.innerHTML = ''; 
    }
    checkPlaylistSts();
};
// whenever a playlist is clicked it renders playlists everytime
const renderPlaylists = (songsList) => {
    playlistUl.innerHTML = '';
    Object.keys(playlists).forEach(playlistName => {
        const playlistElement = document.createElement('li');
        playlistElement.classList.add('element', 'playlist-element', 'w-100', 'cols');
        const playListName = document.createElement('div');
        playListName.textContent = playlistName;
        const playlistDelete = document.createElement('button');
        playlistDelete.classList.add('delete-playlist');
        playlistDelete.innerHTML = `<i class="fa-solid fa-x"></i>`;
        playlistDelete.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering the playlist selection
            deletePlaylist(playlistName);
        });
        playlistElement.append(playListName, playlistDelete);
        playlistUl.appendChild(playlistElement);
        addPlaylistEventListener(songsList, playlistElement);
    });
};
// checks checks if addtoplaylist button is disabled or not
const checkPlaylistSts = _ => {
    addToPlaylistBtn.classList.toggle('disabled-btn', Object.keys(playlists).length===0);
}

const renderPlaylistSong = songsList => {
    const playlistSong = playlists[selectedPlaylist];
    playlistSongsDiv.innerHTML = '';
    playlistSong.forEach(song_id => {
        const song = songsList.find(song => song.id === song_id);
        const songElement = document.createElement('li');
        songElement.classList.add('element', 'playlist-song', 'w-100', 'cols');
        const songName = document.createElement('div');
        songName.classList.add('songs');
        songName.textContent = `${song.name} - ${song.artist}`;
        const songDelete = document.createElement('button');
        songDelete.classList.add('delete-song');
        songDelete.innerHTML = `<i class="fa-solid fa-x"></i>`;
        songDelete.addEventListener('click', () => deleteSongFromPlaylist(songsList,song_id));
        songElement.append(songName, songDelete);
        playlistSongsDiv.appendChild(songElement);
    });
};
const deleteSongFromPlaylist = (songsList,song_id) => {
    const playlist = playlists[selectedPlaylist];
    const songIndex = playlist.indexOf(song_id);
    if (songIndex > -1) {
        playlist.splice(songIndex, 1);
        renderPlaylistSong(songsList);
        addPlaylistSongListeners(songsList);
    }
};
// the render new songs into songs list
const addPlaylistSongListeners = songsList => {
    const playlistSongs = document.querySelectorAll('.playlist-song .songs');
    playlistSongs.forEach(songElement => {
        songElement.addEventListener('click', () => {
            const songName = songElement.textContent.split('-')[0].trim();
            const songObj = songsList.find(song => song.name === songName);
            currentSong = songObj.id;
            renderCurrentSong(songObj);
            playMusic(songObj);
            checkBtnStatus(songsList.length);
            highlightCurrentSongById(songsList,currentSong);
        });
    });
};

const highlightCurrentSongById = (songsList,songId) => {
    document.querySelectorAll('.songs').forEach(el => el.classList.remove('selected'));
    const songElements = Array.from(document.querySelectorAll('.songs')).filter(el => {
        const songName = el.textContent.split('-')[0].trim();
        const songObj = songsList.find(song => song.name === songName);
        return songObj && songObj.id === songId;
    });
    songElements.forEach(el => el.classList.add('selected'));
};
